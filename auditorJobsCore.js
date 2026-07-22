// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// STMB-Auto fork — Auditor jobs core, pure logic (Phase 5, task P5.2).
// Plan: eval/materials/stmb-auto/stmb-auto-plan.md §4.3 (Auditor jobs 1–2).
//
// This file holds the dependency-injected, SillyTavern-free logic for the first
// two audit jobs that share the P5.1 chunk-walker's running-notes ground truth
// (auditorCore.js / getAuditNotes):
//
//   1. Coverage audit — running notes vs. existing lorebook entries → a report of
//      MISSING entries (a salient character/location the notes saw but the book has
//      no entry for) and THIN entries (an entry exists but its body is too short to
//      cover a character the notes saw across many chunks). Feeds a one-click
//      generate in the binding layer.
//
//   2. Entry regeneration — re-derive a chosen living entry FROM the source chunks
//      where its name appears (plan §4.3: kills rewrite-drift — an entry rewritten
//      30 times becomes a photocopy of a photocopy). We reconstruct the exact source
//      excerpt from the notes' per-name chunk provenance + the deterministic chunk
//      plan, re-derive from THAT (never from the stale entry text), and diff old vs.
//      new for the user to approve (or auto-approve).
//
// All of it is pure and unit-tested under node:test (auditorJobs.test.js). The
// runtime binding that wires real chat / lorebook / LLM functions lives in
// auditorJobs.js, exactly like auditorCore.js ↔ auditor.js.

import { estimateTokensChars, formatAuditMessage } from './auditorCore.js';

// ---------------------------------------------------------------- defaults & prompts

/** Coverage-audit defaults (plan §4.3 job 1); all user-tunable via settings. */
export const COVERAGE_DEFAULTS = Object.freeze({
    thinContentChars: 240,   // a matched living entry shorter than this (trimmed) is "thin"
    minChunks: 2,            // only report names the notes saw in >= this many distinct chunks (cut one-off noise)
    includeLocations: true,  // audit location coverage too, not just characters
});

/** Entry-regeneration defaults (plan §4.3 job 2); all user-tunable via settings. */
export const REGEN_DEFAULTS = Object.freeze({
    tokenBudget: 12000,          // cap on the source excerpt sent to the re-derivation call
    truncate: 0,                 // per-message char cap; 0 => full text (§5.4 "reads everything")
    prioritizeNameMatches: true, // when over budget, keep messages that actually name the entry first
    autoApprove: false,          // skip the diff popup and write the re-derived entry directly
});

/**
 * Baseline re-derivation prompt (plan §4.3 job 2). {{NAME}} {{KIND}} {{EXISTING}}
 * {{SOURCE}} are filled by buildRegenPrompt. The anti-drift instruction is the whole
 * point: re-derive from source, never reword the (possibly drifted) previous entry.
 */
export const REGEN_PROMPT =
`You are maintaining a living lorebook for a long-form roleplay/story. Re-derive the
lorebook entry for "{{NAME}}" ({{KIND}}) FROM THE SOURCE EXCERPTS BELOW ONLY. Do not
rely on or reword the previous entry — it may have drifted from the source across many
rewrites. Write a concise, factual, self-contained entry grounded in the excerpts:
who/what they are, defining traits, key relationships, and notable events. Prefer
specifics that appear in the text over generic description. Do NOT invent facts that
are not supported by the excerpts.
Reply with ONLY a JSON object of exactly this shape — no prose, no code fences:
{"title":"","keywords":[],"content":""}

PREVIOUS ENTRY (reference only — may be stale; do NOT just reword it):
{{EXISTING}}

SOURCE EXCERPTS (numbered "[id] Speaker: text"):
{{SOURCE}}`;

/** Reprimand appended on the single retry when the first regeneration reply is not usable. */
export const REGEN_JSON_ONLY_REPRIMAND =
    'Reply with ONLY the JSON object described: {"title":"","keywords":[],"content":""}. No prose, no code fences.';

// ---------------------------------------------------------------- name helpers

/** Normalize a name/keyword/title for equality matching: lowercase, collapse whitespace, trim. */
export function normalizeName(text) {
    return String(text ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function escapeRegExp(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Does this audit message name the entry (whole-word, case-insensitive)? */
export function messageMentions(message, name) {
    const n = normalizeName(name);
    if (!n) return false;
    const text = normalizeName(message?.rawText);
    if (!text) return false;
    try {
        return new RegExp(`\\b${escapeRegExp(n)}\\b`).test(text);
    } catch {
        return text.includes(n);
    }
}

// ---------------------------------------------------------------- coverage audit

/**
 * Build a lookup from lorebook entries to the names each one covers. An entry covers a
 * name when the normalized name equals the entry's title or one of its keywords — the
 * same handles a living entry actually fires on, so "covered" here means "this name will
 * pull an entry". Disabled entries are ignored (they never fire).
 * @param {Array<{uid?:number, title?:string, comment?:string, content?:string, keys?:string[], key?:string[], constant?:boolean, disable?:boolean, isMemory?:boolean}>} entries
 * @returns {{byHandle: Map<string, object[]>, list: object[]}}
 */
export function buildCoverageIndex(entries) {
    const byHandle = new Map();
    const list = [];
    for (const e of (Array.isArray(entries) ? entries : [])) {
        if (!e || e.disable === true) continue;
        const ref = {
            uid: e.uid,
            title: String(e.title ?? e.comment ?? ''),
            content: String(e.content ?? ''),
            keys: Array.isArray(e.keys) ? e.keys : (Array.isArray(e.key) ? e.key : []),
            constant: !!e.constant,
            isMemory: !!e.isMemory,
        };
        list.push(ref);
        const handles = new Set();
        const t = normalizeName(ref.title);
        if (t) handles.add(t);
        for (const k of ref.keys) {
            const nk = normalizeName(k);
            if (nk) handles.add(nk);
        }
        for (const h of handles) {
            const arr = byHandle.get(h);
            if (arr) arr.push(ref); else byHandle.set(h, [ref]);
        }
    }
    return { byHandle, list };
}

/**
 * Find the entry that covers `name`, preferring a non-memory (living) entry so thin
 * detection targets living lore rather than scene-memory summaries. Returns null when
 * nothing covers it.
 */
export function findCoveringEntry(index, name) {
    const arr = index?.byHandle?.get(normalizeName(name));
    if (!arr || arr.length === 0) return null;
    return arr.find(e => !e.isMemory) || arr[0];
}

/**
 * Compare the walker's running notes against the lorebook entries → coverage report.
 * MISSING = a salient name with no covering entry. THIN = a salient name whose covering
 * living entry is shorter than `thinContentChars`. A name matched only by a memory entry
 * counts as covered (memories are scene summaries, not the target of coverage upkeep).
 *
 * @param {{characters?:object, locations?:object}} notes  running-notes maps (name -> {name,count,chunks[]})
 * @param {Array<object>} entries  lorebook entries (see buildCoverageIndex)
 * @param {object} cfg  overrides COVERAGE_DEFAULTS
 * @returns {{missing:Array, thin:Array, covered:number, total:number, config:object}}
 */
export function auditCoverage(notes, entries, cfg = {}) {
    const c = { ...COVERAGE_DEFAULTS, ...(cfg || {}) };
    const index = buildCoverageIndex(entries);
    const missing = [];
    const thin = [];
    let covered = 0;
    let total = 0;

    const scan = (map, kind) => {
        for (const key of Object.keys(map || {})) {
            const rec = map[key] || {};
            const chunks = Array.isArray(rec.chunks) ? rec.chunks : [];
            const chunkCount = chunks.length;
            if (chunkCount < c.minChunks) continue; // salience gate — cut one-off mentions
            total++;
            const name = String(rec.name ?? key);
            const mentions = Number(rec.count) || 0;
            const entry = findCoveringEntry(index, name);
            if (!entry) {
                missing.push({ name, kind, mentions, chunks, chunkCount });
            } else if (!entry.isMemory && entry.content.trim().length < c.thinContentChars) {
                thin.push({
                    name, kind, mentions, chunks, chunkCount,
                    entryUid: entry.uid, entryTitle: entry.title,
                    contentLen: entry.content.trim().length,
                });
            } else {
                covered++;
            }
        }
    };

    scan(notes?.characters, 'character');
    if (c.includeLocations) scan(notes?.locations, 'location');

    // Rank by salience so the most-mentioned gaps sort to the top of the report.
    const bySalience = (a, b) =>
        (b.chunkCount - a.chunkCount) || (b.mentions - a.mentions) || a.name.localeCompare(b.name);
    missing.sort(bySalience);
    thin.sort(bySalience);
    return { missing, thin, covered, total, config: c };
}

// ---------------------------------------------------------------- entry regeneration

/**
 * Locate a name in the running notes and return its kind + the distinct chunk indices it
 * was seen in (its source provenance). Matching is case/whitespace-insensitive against the
 * stored display name (and the map key). Returns null when the notes never saw the name.
 * @returns {{kind:'character'|'location', name:string, chunks:number[], mentions:number}|null}
 */
export function findNameChunks(notes, name) {
    const n = normalizeName(name);
    if (!n) return null;
    for (const [kind, map] of [['character', notes?.characters], ['location', notes?.locations]]) {
        for (const key of Object.keys(map || {})) {
            const rec = map[key] || {};
            if (key === n || normalizeName(rec.name) === n) {
                return {
                    kind,
                    name: String(rec.name ?? key),
                    chunks: Array.isArray(rec.chunks) ? rec.chunks.slice() : [],
                    mentions: Number(rec.count) || 0,
                };
            }
        }
    }
    return null;
}

/** Collapse a sorted list of message ids into contiguous [start,end] ranges (for provenance display). */
export function toIdRanges(ids) {
    const sorted = [...new Set((ids || []).filter(Number.isInteger))].sort((a, b) => a - b);
    const ranges = [];
    for (const id of sorted) {
        const last = ranges[ranges.length - 1];
        if (last && id === last[1] + 1) last[1] = id;
        else ranges.push([id, id]);
    }
    return ranges;
}

/**
 * Reconstruct the source excerpt to re-derive an entry from. Given the deterministic chunk
 * plan and the chunk indices the name was seen in, gather those chunks' messages, and (under
 * `tokenBudget`) keep the ones that actually name the entry first, then fill with surrounding
 * context. Output is the `[id] Speaker: text` block in chat order, so provenance stays honest.
 *
 * @param {Array<{id:number,speaker:string,rawText:string}>} messages  extractAuditMessages output
 * @param {Array<{msgStart:number,msgEnd:number}>} plan  planChunks output (same cfg the walk used)
 * @param {number[]} chunkIndices  chunk indices from findNameChunks
 * @param {string} name
 * @param {object} cfg  overrides REGEN_DEFAULTS ({tokenBudget, truncate, prioritizeNameMatches, estimateTokens})
 * @returns {{text:string, includedIds:number[], idRanges:number[][], chunkCount:number, tokens:number}}
 */
export function selectRegenSource(messages, plan, chunkIndices, name, cfg = {}) {
    const msgs = Array.isArray(messages) ? messages : [];
    const truncate = Number(cfg.truncate) || 0;
    const budget = Math.max(1, Number(cfg.tokenBudget) || REGEN_DEFAULTS.tokenBudget);
    const estimate = typeof cfg.estimateTokens === 'function' ? cfg.estimateTokens : estimateTokensChars;
    const prioritize = cfg.prioritizeNameMatches !== false;

    // Candidate message indices from the named chunks, in chat order, deduped.
    const validChunks = [...new Set((chunkIndices || []).filter(x => Number.isInteger(x) && x >= 0 && x < (plan?.length || 0)))]
        .sort((a, b) => a - b);
    const seen = new Set();
    const candidates = [];
    for (const ci of validChunks) {
        const ch = plan[ci];
        for (let k = ch.msgStart; k <= ch.msgEnd; k++) {
            if (k >= 0 && k < msgs.length && !seen.has(k)) { seen.add(k); candidates.push(k); }
        }
    }

    const chosen = new Set();
    let tokens = 0;
    const tryAdd = (k) => {
        const cost = estimate(formatAuditMessage(msgs[k], truncate));
        if (chosen.size > 0 && tokens + cost > budget) return false; // always keep at least one
        tokens += cost;
        chosen.add(k);
        return true;
    };

    // Priority pass: messages that name the entry. Then fill with context under budget.
    if (prioritize) {
        for (const k of candidates) {
            if (messageMentions(msgs[k], name)) tryAdd(k);
        }
    }
    for (const k of candidates) {
        if (!chosen.has(k)) tryAdd(k);
    }

    const ids = [...chosen].sort((a, b) => a - b).map(k => msgs[k].id);
    const text = [...chosen].sort((a, b) => a - b).map(k => formatAuditMessage(msgs[k], truncate)).join('\n');
    return { text, includedIds: ids, idRanges: toIdRanges(ids), chunkCount: validChunks.length, tokens };
}

/** Fill the regeneration prompt template. Empty existing content → an explicit "(none)" marker. */
export function buildRegenPrompt(name, kind, sourceText, existingContent, template = REGEN_PROMPT) {
    const existing = String(existingContent ?? '').trim();
    const replacements = {
        NAME: String(name ?? ''),
        KIND: String(kind ?? 'entry'),
        SOURCE: String(sourceText ?? ''),
        EXISTING: existing || '(none — this entry does not exist yet)',
    };
    return String(template || REGEN_PROMPT).replace(
        /\{\{(NAME|KIND|SOURCE|EXISTING)\}\}/g,
        (_m, token) => replacements[token] ?? '',
    );
}

/**
 * Parse a regeneration reply into {title, keywords, content}. JSON-first (tolerating a code
 * fence like parseAuditNotes), then a plain-text fallback that treats the whole reply as the
 * content body. Returns null only when there is no usable content at all (caller skips —
 * never guess). `fallbackName` supplies the title/keyword when the model omits them.
 * @returns {{title:string, keywords:string[], content:string}|null}
 */
export function parseRegenResult(reply, fallbackName = '') {
    if (typeof reply !== 'string') return null;
    let s = reply.trim();
    if (!s) return null;
    const fence = /^```(?:json)?\s*([\s\S]*?)\s*```$/.exec(s);
    if (fence) s = fence[1].trim();

    const strList = (v) => (Array.isArray(v) ? v : [])
        .filter(x => typeof x === 'string')
        .map(x => x.trim())
        .filter(Boolean);

    let parsed = null;
    try { parsed = JSON.parse(s); } catch { /* fall through to plain-text */ }

    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && typeof parsed.content === 'string') {
        const content = parsed.content.trim();
        if (!content) return null;
        const title = String(parsed.title ?? '').trim() || String(fallbackName).trim();
        let keywords = strList(parsed.keywords);
        if (keywords.length === 0) keywords = strList(parsed.keys);
        if (keywords.length === 0 && String(fallbackName).trim()) keywords = [String(fallbackName).trim()];
        return { title, keywords, content };
    }

    // Plain-text fallback: the (de-fenced) reply is the body.
    const content = s.trim();
    if (!content) return null;
    const title = String(fallbackName).trim();
    return { title, keywords: title ? [title] : [], content };
}

/**
 * One regeneration map round: a single `derive` call, then a single "JSON only" retry when the
 * first reply is unusable. `derive(prompt) => Promise<string>` is the injected LLM call. Returns
 * the parsed entry or null (caller reports "could not regenerate" — never writes a guess).
 */
export async function regenerateOnce({ derive, prompt, fallbackName }) {
    let reply = await derive(prompt);
    let parsed = parseRegenResult(reply, fallbackName);
    if (parsed === null) {
        reply = await derive(`${prompt}\n\n${REGEN_JSON_ONLY_REPRIMAND}`);
        parsed = parseRegenResult(reply, fallbackName);
    }
    return parsed;
}

// ---------------------------------------------------------------- diff view

function splitLines(s) {
    return String(s ?? '').replace(/\r\n/g, '\n').split('\n');
}

/**
 * Line-level diff (LCS) for the regeneration diff view: old (existing entry) vs. new
 * (re-derived) content. Deterministic and pure. Rows are in output order with a type of
 * 'context' | 'del' | 'add'; counts summarize the change size.
 * @returns {{rows:Array<{type:'context'|'del'|'add', text:string}>, added:number, removed:number, unchanged:number}}
 */
export function diffLines(oldStr, newStr) {
    const a = splitLines(oldStr);
    const b = splitLines(newStr);
    const n = a.length;
    const m = b.length;

    // LCS length table (bottom-up).
    const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i--) {
        for (let j = m - 1; j >= 0; j--) {
            dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
        }
    }

    const rows = [];
    let i = 0, j = 0, added = 0, removed = 0, unchanged = 0;
    while (i < n && j < m) {
        if (a[i] === b[j]) { rows.push({ type: 'context', text: a[i] }); unchanged++; i++; j++; }
        else if (dp[i + 1][j] >= dp[i][j + 1]) { rows.push({ type: 'del', text: a[i] }); removed++; i++; }
        else { rows.push({ type: 'add', text: b[j] }); added++; j++; }
    }
    while (i < n) { rows.push({ type: 'del', text: a[i] }); removed++; i++; }
    while (j < m) { rows.push({ type: 'add', text: b[j] }); added++; j++; }
    return { rows, added, removed, unchanged };
}
