// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// STMB-Auto fork — Auditor core walker, pure logic (Phase 5, task P5.1).
// Plan: eval/materials/stmb-auto/stmb-auto-plan.md §4.3 (Auditor) and §5.4
// ("Auditor reads everything").
//
// This file holds the dependency-injected, SillyTavern-free core so the whole
// chunk-walk / map-reduce / checkpoint / resume / halt loop is unit-testable
// under node:test (see auditor.test.js), exactly like sentinelCore.js. The
// runtime binding that wires real chat / chat_metadata / job-context / LLM
// functions into runAuditWalk lives in auditor.js.
//
// The Auditor is the in-extension COLD PATH (§4.3): a chunked, resumable full
// re-read of the entire chat array that builds a running-notes object
// (characters / locations / events / claims / collisions). It is the ground
// truth that the four downstream audit jobs (coverage, regeneration, technical
// pass, claim re-verification — later tasks) consume. P5.1 delivers only the
// walker: chunking within a token cap, map-reduce into running notes, a
// checkpoint after every chunk so a mid-run reload resumes exactly where it
// stopped, and cooperative halt.
//
// Walk (one job):
//   extract audit messages (all non-system, non-empty; true chat index kept)
//     -> plan chunks (default 40 msgs/chunk, capped at ~20K tokens/chunk)
//     -> load checkpoint (nextChunk + notes) from chat_metadata, or start fresh
//     -> for each remaining chunk:
//          halt check (cooperative; leaves the checkpoint intact for resume)
//          -> map: one LLM extraction call (strict JSON, one retry, then an
//             empty partial — never crash the walk)
//          -> reduce: merge the partial into the running notes
//          -> checkpoint {nextChunk, notes} to chat_metadata + persist
//     -> mark the checkpoint complete and return the notes.

// ---------------------------------------------------------------- defaults & prompt

/** Production auditor defaults (plan §4.3); all user-tunable via settings. */
export const AUDITOR_DEFAULTS = Object.freeze({
    chunkSize: 40,        // messages per chunk (the count cap)
    tokenCap: 20000,      // per-chunk token cap; reduces messages/chunk when they run long
    truncate: 0,          // per-message char cap; 0 => read full text (§5.4 "reads everything")
    mapPrompt: null,      // override for AUDIT_MAP_PROMPT (per-chat or global)
});

/**
 * Defensive caps on the accumulating notes so a very long chat cannot grow the
 * checkpoint in chat_metadata without bound. Characters/locations are keyed maps
 * (they self-dedupe); the append-only lists are what need a ceiling.
 */
export const NOTES_EVENT_CAP = 2000;
export const NOTES_CLAIM_CAP = 2000;
export const NOTES_COLLISION_CAP = 1000;

/** Baseline per-chunk extraction prompt (plan §4.3, Appendix B). User-editable. */
export const AUDIT_MAP_PROMPT =
`You are auditing a long-form roleplay/story chat one chunk at a time, building
running notes for a later lorebook coverage and consistency audit. Below are
numbered messages in the form "[id] Speaker: text". For THIS chunk only, extract:
- characters: every named character who appears or is clearly referenced
- locations: every named place the action happens in or that is referenced
- events: the significant plot events, as short phrases
- claims: concrete factual claims worth verifying later (ages, titles, kinship,
  possessions, promises), each with the message-id range it came from
- collisions: any character name that is ambiguous, or could collide with a
  common English word or another character (note it)
Do NOT invent facts that are not present in the text. Reply with ONLY a JSON
object of exactly this shape — no prose, no code fences:
{"characters":[],"locations":[],"events":[],"claims":[{"text":"","src":"msgs X-Y"}],"collisions":[]}`;

/** Reprimand appended on the single retry when the first reply is not strict JSON. */
export const NOTES_JSON_ONLY_REPRIMAND =
    'Reply with ONLY the JSON object described (characters, locations, events, claims, collisions). No prose, no code fences.';

/** Default token estimator: SillyTavern-free chars/4 heuristic (matches utils.estimateTokens). */
export const estimateTokensChars = (text) => Math.ceil(String(text ?? '').length / 4);

// ---------------------------------------------------------------- pure helpers

/**
 * Collapse whitespace and (optionally) truncate to `limit` characters. limit<=0
 * means no truncation — the auditor reads everything by default (§5.4).
 */
export function truncateForAudit(text, limit) {
    const flat = String(text ?? '').replace(/\s+/g, ' ').trim();
    if (!Number.isFinite(limit) || limit <= 0) return flat;
    return flat.length > limit ? flat.slice(0, limit) + '…' : flat;
}

/**
 * Extract the messages the audit should read from the full chat array: every
 * non-system, non-empty message, keeping its true chat index as `id` so claim
 * provenance and coverage stay in chat-index space.
 * @returns {Array<{id:number, speaker:string, rawText:string}>}
 */
export function extractAuditMessages(chat) {
    if (!Array.isArray(chat)) return [];
    const out = [];
    for (let i = 0; i < chat.length; i++) {
        const m = chat[i];
        if (!m || m.is_system) continue;
        const rawText = String(m.mes ?? '');
        if (!rawText.trim()) continue;
        const speaker = String(m.name || (m.is_user ? 'User' : 'Narrator'));
        out.push({ id: i, speaker, rawText });
    }
    return out;
}

/** Format a single audit message as `[id] Speaker: text` (whitespace-collapsed, optional truncate). */
export function formatAuditMessage(m, truncate) {
    return `[${m.id}] ${m.speaker}: ${truncateForAudit(m.rawText, truncate)}`;
}

/**
 * Plan the chunk boundaries over the extracted messages. Greedy: fill a chunk
 * until either `chunkSize` messages or `tokenCap` tokens would be exceeded, then
 * start the next. A single message larger than the token cap becomes its own
 * (oversized) chunk rather than being dropped — the walk still reads everything.
 *
 * Chunk boundaries are a deterministic function of (messages, config), so a
 * resume that re-runs planChunks over the same chat reproduces the same plan and
 * the saved `nextChunk` index still points at the right chunk.
 *
 * @param {Array<{id:number,speaker:string,rawText:string}>} messages
 * @param {{chunkSize:number, tokenCap:number, truncate:number, estimateTokens?:(t:string)=>number}} cfg
 * @returns {Array<{index:number, msgStart:number, msgEnd:number, idStart:number, idEnd:number, count:number, tokens:number, oversized:boolean}>}
 */
export function planChunks(messages, cfg) {
    const chunkSize = Math.max(1, Number(cfg?.chunkSize) || AUDITOR_DEFAULTS.chunkSize);
    const tokenCap = Math.max(1, Number(cfg?.tokenCap) || AUDITOR_DEFAULTS.tokenCap);
    const truncate = Number(cfg?.truncate) || 0;
    const estimate = typeof cfg?.estimateTokens === 'function' ? cfg.estimateTokens : estimateTokensChars;

    const chunks = [];
    let start = 0;
    while (start < messages.length) {
        let tokens = 0;
        let end = start; // exclusive-ish: we advance end as we accept messages
        while (end < messages.length && (end - start) < chunkSize) {
            const cost = estimate(formatAuditMessage(messages[end], truncate));
            // Always accept at least one message, even if it alone blows the cap.
            if (end > start && tokens + cost > tokenCap) break;
            tokens += cost;
            end++;
        }
        const msgEnd = end - 1;
        chunks.push({
            index: chunks.length,
            msgStart: start,
            msgEnd,
            idStart: messages[start].id,
            idEnd: messages[msgEnd].id,
            count: msgEnd - start + 1,
            tokens,
            oversized: (msgEnd === start) && tokens > tokenCap,
        });
        start = end;
    }
    return chunks;
}

/** Render one planned chunk into the `[id] Speaker: text` block sent to the map call. */
export function formatChunk(messages, chunk, truncate) {
    const lines = [];
    for (let i = chunk.msgStart; i <= chunk.msgEnd; i++) {
        lines.push(formatAuditMessage(messages[i], truncate));
    }
    return lines.join('\n');
}

/**
 * Accept a JSON object of running-notes fields. Tolerates surrounding whitespace
 * and a single markdown code fence (models add these even when told not to).
 * Returns a NORMALIZED partial (all five fields present, correctly shaped), or
 * null when the reply is not a usable object (caller treats null as "skip this
 * chunk" — never guess). Mirrors sentinelCore.parseIdArray discipline.
 * @returns {{characters:string[], locations:string[], events:string[], claims:Array<{text:string,src:string}>, collisions:string[]}|null}
 */
export function parseAuditNotes(reply) {
    if (typeof reply !== 'string') return null;
    let s = reply.trim();
    const fence = /^```(?:json)?\s*([\s\S]*?)\s*```$/.exec(s);
    if (fence) s = fence[1].trim();
    let parsed;
    try {
        parsed = JSON.parse(s);
    } catch {
        return null;
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;

    const strList = (v) => (Array.isArray(v) ? v : [])
        .filter(x => typeof x === 'string')
        .map(x => x.trim())
        .filter(Boolean);

    const claims = (Array.isArray(parsed.claims) ? parsed.claims : [])
        .map(c => {
            if (typeof c === 'string') return { text: c.trim(), src: '' };
            if (c && typeof c === 'object') {
                return { text: String(c.text ?? '').trim(), src: String(c.src ?? '').trim() };
            }
            return null;
        })
        .filter(c => c && c.text);

    return {
        characters: strList(parsed.characters),
        locations: strList(parsed.locations),
        events: strList(parsed.events),
        claims,
        collisions: strList(parsed.collisions),
    };
}

/** A fresh, empty running-notes object. */
export function emptyNotes() {
    return {
        characters: {},   // lcName -> { name, count, chunks:number[] }
        locations: {},     // lcName -> { name, count, chunks:number[] }
        events: [],        // { chunk, text }
        claims: [],        // { chunk, text, src }
        collisions: [],    // { chunk, text }
        chunksProcessed: 0,
    };
}

function mergeNamed(map, names, chunkIndex) {
    for (const name of names) {
        const key = name.toLowerCase();
        const entry = map[key] || (map[key] = { name, count: 0, chunks: [] });
        entry.count++;
        if (entry.chunks[entry.chunks.length - 1] !== chunkIndex) entry.chunks.push(chunkIndex);
    }
}

/**
 * Reduce one chunk's parsed partial into the running notes (map-reduce, §4.3).
 * Mutates and returns `notes`. Named maps self-dedupe (case-insensitive); the
 * append-only lists carry chunk provenance and are hard-capped so the checkpoint
 * stays bounded on very long chats.
 */
export function mergeNotes(notes, partial, chunkIndex) {
    if (!partial) { notes.chunksProcessed++; return notes; }
    mergeNamed(notes.characters, partial.characters || [], chunkIndex);
    mergeNamed(notes.locations, partial.locations || [], chunkIndex);
    for (const text of partial.events || []) {
        if (notes.events.length < NOTES_EVENT_CAP) notes.events.push({ chunk: chunkIndex, text });
    }
    for (const c of partial.claims || []) {
        if (notes.claims.length < NOTES_CLAIM_CAP) notes.claims.push({ chunk: chunkIndex, text: c.text, src: c.src || '' });
    }
    for (const text of partial.collisions || []) {
        if (notes.collisions.length < NOTES_COLLISION_CAP) notes.collisions.push({ chunk: chunkIndex, text });
    }
    notes.chunksProcessed++;
    return notes;
}

/** Compact summary of the notes for a job result / progress detail (no huge blobs). */
export function summarizeNotes(notes) {
    return {
        characters: Object.keys(notes?.characters || {}).length,
        locations: Object.keys(notes?.locations || {}).length,
        events: (notes?.events || []).length,
        claims: (notes?.claims || []).length,
        collisions: (notes?.collisions || []).length,
        chunksProcessed: notes?.chunksProcessed || 0,
    };
}

// ---------------------------------------------------------------- the walk

/**
 * One map round for a chunk: a single `mapChunk` call, then a single "JSON only"
 * retry on parse failure. `mapChunk(chunkText, meta) => Promise<string>` is the
 * injected single-shot LLM call. Returns the normalized partial, or null when the
 * reply is unusable after the retry (the walk merges an empty partial and moves
 * on — a coverage audit that skips one chunk is better than a crashed walk).
 */
export async function mapAuditChunk({ mapChunk, chunkText, meta }) {
    let reply = await mapChunk(chunkText, meta);
    let notes = parseAuditNotes(reply);
    if (notes === null) {
        reply = await mapChunk(`${chunkText}\n\n${NOTES_JSON_ONLY_REPRIMAND}`, { ...meta, retry: true });
        notes = parseAuditNotes(reply);
    }
    return notes;
}

/**
 * Run the full audit walk against injected dependencies. Pure of any
 * SillyTavern import — the binding layer supplies real functions; tests supply
 * stubs.
 *
 * Resume: `loadCheckpoint()` returns the persisted `{ nextChunk, notes }` (or
 * null). When `restart` is falsy and a non-complete checkpoint exists for the
 * SAME chunk plan, the walk resumes at `nextChunk` with the saved notes.
 *
 * Halt: `shouldHalt()` is polled before each chunk. On halt the current
 * checkpoint is already persisted (from the previous chunk), so the walk simply
 * returns `{ status:'halted', nextChunk }` — the binding lets the job framework
 * mark it canceled, and a later /stmbc-audit resumes from exactly here.
 *
 * @param {{
 *   getMessages: () => Array<{id:number,speaker:string,rawText:string}>,
 *   config?: object,
 *   loadCheckpoint?: () => object|null,
 *   saveCheckpoint?: (state:object) => void,
 *   mapChunk: (chunkText:string, meta:object) => Promise<string>,
 *   shouldHalt?: () => boolean,
 *   onProgress?: (info:object) => void,
 *   estimateTokens?: (t:string) => number,
 *   restart?: boolean,
 * }} deps
 * @returns {Promise<{status:'empty'|'complete'|'halted', notes:object, plan:{chunks:number}, nextChunk:number, resumed:boolean}>}
 */
export async function runAuditWalk(deps) {
    const cfg = { ...AUDITOR_DEFAULTS, ...(deps.config || {}) };
    const loadCheckpoint = typeof deps.loadCheckpoint === 'function' ? deps.loadCheckpoint : () => null;
    const saveCheckpoint = typeof deps.saveCheckpoint === 'function' ? deps.saveCheckpoint : () => {};
    const shouldHalt = typeof deps.shouldHalt === 'function' ? deps.shouldHalt : () => false;
    const onProgress = typeof deps.onProgress === 'function' ? deps.onProgress : () => {};
    const estimateTokens = typeof deps.estimateTokens === 'function' ? deps.estimateTokens : estimateTokensChars;

    const messages = deps.getMessages() || [];
    if (messages.length === 0) {
        const notes = emptyNotes();
        saveCheckpoint({ nextChunk: 0, total: 0, notes, chatLen: 0, status: 'complete', updatedAt: nowStamp() });
        return { status: 'empty', notes, plan: { chunks: 0 }, nextChunk: 0, resumed: false };
    }

    const plan = planChunks(messages, {
        chunkSize: cfg.chunkSize, tokenCap: cfg.tokenCap, truncate: cfg.truncate, estimateTokens,
    });

    // Decide start point: resume from a compatible checkpoint, else start fresh.
    let notes = emptyNotes();
    let start = 0;
    let resumed = false;
    const ckpt = deps.restart ? null : loadCheckpoint();
    if (ckpt && ckpt.status !== 'complete'
        && Number.isInteger(ckpt.nextChunk) && ckpt.nextChunk > 0
        && ckpt.total === plan.length && ckpt.notes) {
        notes = reviveNotes(ckpt.notes);
        start = Math.min(ckpt.nextChunk, plan.length);
        resumed = true;
    }

    if (start >= plan.length) {
        // Nothing left (already complete under this plan) — normalize + report.
        saveCheckpoint({ nextChunk: plan.length, total: plan.length, notes, chatLen: messages.length, status: 'complete', updatedAt: nowStamp() });
        return { status: 'complete', notes, plan: { chunks: plan.length }, nextChunk: plan.length, resumed };
    }

    for (let i = start; i < plan.length; i++) {
        if (shouldHalt()) {
            // Checkpoint for chunk `i` was persisted after chunk i-1 (or is the
            // resume point); return without processing i so resume repeats nothing.
            return { status: 'halted', notes, plan: { chunks: plan.length }, nextChunk: i, resumed };
        }

        const chunkText = formatChunk(messages, plan[i], cfg.truncate);
        const meta = { chunkIndex: i, total: plan.length, idStart: plan[i].idStart, idEnd: plan[i].idEnd };

        let partial = null;
        try {
            partial = await mapAuditChunk({ mapChunk: deps.mapChunk, chunkText, meta });
        } catch (err) {
            // API error on a chunk: record nothing for it, keep walking. The
            // checkpoint below still advances so resume does not re-hit it.
            partial = null;
            onProgress({ chunk: i + 1, total: plan.length, error: String(err?.message || err) });
        }

        mergeNotes(notes, partial, i);
        saveCheckpoint({
            nextChunk: i + 1,
            total: plan.length,
            notes,
            chatLen: messages.length,
            status: (i + 1 >= plan.length) ? 'complete' : 'running',
            updatedAt: nowStamp(),
        });
        onProgress({ chunk: i + 1, total: plan.length, summary: summarizeNotes(notes) });
    }

    return { status: 'complete', notes, plan: { chunks: plan.length }, nextChunk: plan.length, resumed };
}

/**
 * Rebuild a notes object loaded from JSON (chat_metadata) so it has every field
 * with the right type even if an older/partial checkpoint is missing some.
 */
export function reviveNotes(raw) {
    const base = emptyNotes();
    if (!raw || typeof raw !== 'object') return base;
    if (raw.characters && typeof raw.characters === 'object') base.characters = raw.characters;
    if (raw.locations && typeof raw.locations === 'object') base.locations = raw.locations;
    if (Array.isArray(raw.events)) base.events = raw.events;
    if (Array.isArray(raw.claims)) base.claims = raw.claims;
    if (Array.isArray(raw.collisions)) base.collisions = raw.collisions;
    if (Number.isInteger(raw.chunksProcessed)) base.chunksProcessed = raw.chunksProcessed;
    return base;
}

/**
 * Timestamp helper isolated so the core stays deterministic under test. Tests
 * that assert on checkpoint shape ignore `updatedAt`.
 */
function nowStamp() {
    try { return Date.now(); } catch { return 0; }
}
