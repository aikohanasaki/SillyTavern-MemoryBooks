// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// eval/phase5Acceptance.js — Phase 5 (Auditor) acceptance harness, pure logic.
//
// Runs entirely OFFLINE: no network, no SillyTavern, no API keys. It composes
// the real production pure functions over the bundled 328-msg fixture and
// proves the four §6 Phase 5 acceptance criteria:
//
//   1. Full audit of the 328-message fixture completes within per-chunk
//      token caps. The chunk walker splits the chat into N chunks; every
//      chunk's token estimate is strictly under the cap.
//   2. Survives a mid-run reload. A checkpoint is persisted after every
//      chunk; resuming from that checkpoint walks the remaining chunks
//      exactly once and produces the same final report as the uninterrupted
//      run — no duplicate chunk evaluations, no gaps.
//   3. Coverage report catches a deliberately deleted character entry. A
//      "Gruk" note is present in the running notes; the "Gruk" entry has
//      been removed from the lorebook snapshot; runCoverageAudit must
//      surface "Gruk" as missing/stale.
//   4. Technical pass catches a planted keyword collision. A new entry
//      whose ONLY keyword is the common word "button" is added to the
//      lorebook snapshot; runTechnicalPass must flag it under the
//      keyword-common-only code.
//
// The chunk walker here is a deliberately thin pure-function driver that
// matches the contract of the production auditorCore.js walker (P5.1, see
// commit ce27f4b on origin/feat/p2-sentinel-integration). When that
// production walker lands on this branch, this harness can switch to it by
// re-importing without changing the public surface.
//
// Public API:
//   - loadFixture(fixturePath) — same shape as phase2Acceptance.loadFixture
//   - prepareLorebook(worldbookPath, opts) — turns the bundled worldbook into
//     a Phase 5 test lorebook (all entries marked stmemorybooks=true) and
//     optionally plants the "button" entry and removes a character
//   - planAuditChunks(chat, opts) — pure chunk plan
//   - estimateChunkTokens(chunk) — char/4 estimate, matches auditorCore
//   - serializeCheckpoint / deserializeCheckpoint — round-trip the
//     `chat_metadata.stmbc.audit` blob
//   - runAuditWalk(deps) — the main driver: walks chunks, accumulates
//     notes, calls the four audit jobs, persists checkpoints
//   - makeFixtureNotes(chat, opts) — deterministic running notes from a
//     simple pass over the chat (used as the chunk-walk's "extraction"
//     for the offline harness — real LLM calls are stubbed because the
//     acceptance does not need a network)
//   - mergeAuditReports / summarizeAudit — small helpers for the runner
//   - findReloadDuplicates / findAuditGaps — scoring helpers for the
//     reload criterion
//   - chunkCappedCheck / totalChunksWalked — scoring helpers for the
//     per-chunk token cap criterion
//
// This file is dependency-free and Node-testable (see phase5Acceptance.test.js).

import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseJsonlText } from './parser.js';
import { toChatArray } from './phase2Acceptance.js';
import {
    runCoverageAudit,
    runTechnicalPass,
    runEntryRegeneration,
    runClaimReverification,
} from '../auditorTechnicalPass.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** The bundled transcript fixture (~329 messages, including chat_metadata). */
export const DEFAULT_FIXTURE = resolve(__dirname, 'fixtures/transcript.jsonl');

/** The bundled worldbook fixture (52 entries, no stmemorybooks flag by default). */
export const DEFAULT_WORLDBOOK = resolve(__dirname, 'fixtures/worldbook.json');

// ----------------------------------------------------------------------------
// Default config (mirrors auditorCore.AUDITOR_DEFAULTS, but kept locally so
// the acceptance harness has no dependency on the production chunk walker
// being on the current branch).
// ----------------------------------------------------------------------------

/** Production auditor defaults (plan §4.3, P5.1). User-tunable via settings. */
export const PHASE5_DEFAULTS = Object.freeze({
    chunkSize: 40,         // messages per chunk (the count cap)
    tokenCap: 20000,       // per-chunk token cap
    truncate: 0,           // per-message char cap; 0 = read full text
    chunkKey: 'audit',     // chat_metadata.stmbc.<chunkKey> namespace
    /**
     * The character the coverage-acceptance test deletes. The choice is
     * arbitrary but stable: it has to be a name that appears in the fixture
     * chat so the running notes are non-empty for it, and whose uid is
     * stable across fixture re-loads.
     */
    deletedCharacter: { name: 'Gruk', uid: 4 },
    /** The keyword the technical-pass-acceptance test plants. */
    plantedKeyword: 'button',
});

// ----------------------------------------------------------------------------
// Fixture loading
// ----------------------------------------------------------------------------

/**
 * Load the transcript fixture as a ST-shaped chat array.
 *
 * @param {string} [fixturePath]
 * @returns {Promise<{chat: Array<object>, warnings: string[]}>}
 */
export async function loadFixture(fixturePath = DEFAULT_FIXTURE) {
    const text = await readFile(fixturePath, 'utf8');
    const { messages, warnings } = parseJsonlText(text);
    return { chat: toChatArray(messages), warnings };
}

/**
 * Load the bundled worldbook and turn it into a Phase 5 test lorebook.
 *
 * Steps:
 *   1. Mark every entry as `stmemorybooks: true` (the upstream flag that the
 *      technical pass / coverage audit gate on).
 *   2. Optionally remove the configured `deletedCharacter` entry (the
 *      coverage-acceptance criterion: the worldbook snapshot has no entry
 *      for that character even though running notes reference it).
 *   3. Optionally plant an entry whose ONLY keyword is a common English
 *      word (the technical-pass-acceptance criterion). The plant is
 *      distinct from the existing fixture characters; the existing
 *      "Button" character (uid 7, multi-keyword) is NOT flagged because
 *      it has non-common keywords.
 *
 * The function never mutates the file on disk; the snapshot is returned
 * as a new object.
 *
 * @param {string} [worldbookPath]
 * @param {object} [opts]
 * @param {string} [opts.deletedCharacter]   character name to remove
 * @param {string} [opts.plantedKeyword]     common-word keyword to plant
 * @param {number} [opts.plantedUid]         uid to assign to the planted entry
 * @returns {Promise<{entries: object, plantedUid: number|null, deletedUid: number|null}>}
 */
export async function prepareLorebook(worldbookPath = DEFAULT_WORLDBOOK, opts = {}) {
    const deletedName = String(opts.deletedCharacter ?? PHASE5_DEFAULTS.deletedCharacter.name);
    const plantedKeyword = String(opts.plantedKeyword ?? PHASE5_DEFAULTS.plantedKeyword);
    const plantedUid = Number.isInteger(opts.plantedUid) ? opts.plantedUid : 9001;

    const raw = JSON.parse(await readFile(worldbookPath, 'utf8'));
    const originalEntries = (raw && typeof raw.entries === 'object' && raw.entries !== null)
        ? raw.entries : {};

    const entries = {};
    let deletedUid = null;
    for (const [uid, e] of Object.entries(originalEntries)) {
        if (!e || typeof e !== 'object') continue;
        if (Array.isArray(e.key) && e.key.some((k) => String(k).toLowerCase() === deletedName.toLowerCase())) {
            deletedUid = uid;
            continue; // simulate the deliberate deletion
        }
        entries[uid] = { ...e, stmemorybooks: true };
    }

    if (plantedKeyword) {
        // Single-keyword entry; the ONLY keyword is the common word.
        entries[String(plantedUid)] = {
            uid: plantedUid,
            stmemorybooks: true,
            comment: `Phase 5 acceptance — planted keyword collision`,
            key: [plantedKeyword],
            content: `This entry deliberately has only a common English word as its keyword to test the technical pass.`,
            constant: false,
            selective: true,
            probability: 100,
            useProbability: true,
            preventRecursion: false,
            excludeRecursion: false,
            delayUntilRecursion: false,
            enabled: true,
        };
    }

    return { entries, plantedUid, deletedUid };
}

// ----------------------------------------------------------------------------
// Chunk walker (pure)
// ----------------------------------------------------------------------------

/**
 * Conservative char/4 token estimate. Matches auditorCore.estimateTokensChars
 * so the per-chunk cap has identical semantics to the production walker.
 *
 * @param {string|object} text - either a string or a chat message
 * @returns {number}
 */
export function estimateChunkTokens(text) {
    if (typeof text === 'string') return Math.ceil(text.length / 4);
    if (text && typeof text === 'object' && typeof text.mes === 'string') {
        return Math.ceil(text.mes.length / 4);
    }
    return 0;
}

/**
 * Extract the audit-eligible messages from a ST chat array. System messages
 * and empty messages are dropped; the original chat index is preserved on
 * each entry as `_chatIndex` for provenance.
 *
 * @param {Array<object>} chat
 * @returns {Array<{_chatIndex: number, name: string, mes: string, is_user: boolean, is_system: boolean}>}
 */
export function extractAuditMessages(chat) {
    const out = [];
    for (let i = 0; i < chat.length; i++) {
        const m = chat[i];
        if (!m || typeof m !== 'object') continue;
        if (m.is_system === true) continue;
        const text = typeof m.mes === 'string' ? m.mes : '';
        if (!text.trim()) continue;
        out.push({
            _chatIndex: i,
            name: typeof m.name === 'string' ? m.name : '',
            mes: text,
            is_user: m.is_user === true,
            is_system: false,
        });
    }
    return out;
}

/**
 * Plan the audit chunks. The output is an array of { index, start, end, msgs,
 * tokenEstimate }. `end` is inclusive. A single oversized message becomes
 * its own chunk (so the walk still reads everything, just in pieces) — the
 * acceptance test for the per-chunk cap flags this explicitly.
 *
 * @param {Array<object>} messages - from extractAuditMessages
 * @param {object} [opts]
 * @param {number} [opts.chunkSize=40]
 * @param {number} [opts.tokenCap=20000]
 * @returns {Array<{index: number, start: number, end: number, msgs: Array<object>, tokenEstimate: number}>}
 */
export function planAuditChunks(messages, opts = {}) {
    const chunkSize = Number.isInteger(opts.chunkSize) ? opts.chunkSize : PHASE5_DEFAULTS.chunkSize;
    const tokenCap = Number.isInteger(opts.tokenCap) ? opts.tokenCap : PHASE5_DEFAULTS.tokenCap;

    const chunks = [];
    let cursor = 0;
    let index = 0;
    while (cursor < messages.length) {
        // Greedy: take up to `chunkSize` messages as long as we stay under
        // `tokenCap`. If a single message would push us over the cap, give
        // the previous batch its own chunk and start a new one with that
        // message (it will become a single-message flagged chunk).
        const start = cursor;
        let end = cursor;
        let tokens = 0;
        while (end < messages.length) {
            const msg = messages[end];
            const msgTokens = estimateChunkTokens(msg);
            if (end > start && tokens + msgTokens > tokenCap) break;
            if (end - start + 1 > chunkSize) break;
            tokens += msgTokens;
            end++;
        }
        const slice = messages.slice(start, end);
        chunks.push({
            index,
            start,
            end: end - 1,
            msgs: slice,
            tokenEstimate: tokens,
        });
        index++;
        cursor = end;
    }
    return chunks;
}

/**
 * Format a chunk as the kind of text the audit extraction prompt would
 * receive. Mirrors auditorCore.formatAuditMessage / formatChunk closely
 * enough for the offline harness to assert what was fed in.
 *
 * @param {Array<object>} chunkMsgs
 * @returns {string}
 */
export function formatChunkText(chunkMsgs) {
    return chunkMsgs.map((m) => `[${m._chatIndex}] ${m.name || '?'}: ${m.mes}`).join('\n');
}

// ----------------------------------------------------------------------------
// Deterministic running-notes extractor (offline harness stand-in)
// ----------------------------------------------------------------------------

/**
 * Build running notes for a chat without calling an LLM. This is the
 * offline stand-in for the per-chunk extraction call: it greps the chunk
 * text for character names from the lorebook keys and tracks the chat
 * index of each sighting. Coverage of the deleted character and the
 * planted keyword are both verifiable from the resulting notes.
 *
 * The real production walker (auditorCore.mapAuditChunk) calls an LLM and
 * parses strict JSON. The acceptance test for P5.4 only needs the
 * composition (chunk walker + coverage + technical pass) to work
 * end-to-end; a deterministic offline extractor is the cleanest
 * separation.
 *
 * @param {Array<object>} chat - the full ST chat array
 * @param {object} [opts]
 * @param {string[]} [opts.knownNames]   character names to surface
 * @param {string[]} [opts.knownLocations] - optional location names
 * @returns {{items: Array<{key: string, kind: string, sightings: number, indices: number[], note: string}>}}
 */
export function makeFixtureNotes(chat, opts = {}) {
    const knownNames = Array.isArray(opts.knownNames) ? opts.knownNames : [];
    const knownLocations = Array.isArray(opts.knownLocations) ? opts.knownLocations : [];
    const lowerNames = knownNames.map((n) => ({ raw: n, low: String(n).toLowerCase() }))
        .filter((n) => n.low.length > 0)
        .sort((a, b) => b.low.length - a.low.length);
    const lowerLocs = knownLocations.map((n) => ({ raw: n, low: String(n).toLowerCase() }))
        .filter((n) => n.low.length > 0)
        .sort((a, b) => b.low.length - a.low.length);

    const characters = new Map();
    const locations = new Map();
    for (let i = 0; i < chat.length; i++) {
        const m = chat[i];
        if (!m || typeof m !== 'object' || m.is_system === true) continue;
        const text = String(m.mes ?? '').toLowerCase();
        if (!text) continue;
        for (const n of lowerNames) {
            if (text.includes(n.low)) {
                const cur = characters.get(n.raw) || { key: n.raw, sightings: 0, indices: [] };
                cur.sightings++;
                cur.indices.push(i);
                characters.set(n.raw, cur);
            }
        }
        for (const l of lowerLocs) {
            if (text.includes(l.low)) {
                const cur = locations.get(l.raw) || { key: l.raw, sightings: 0, indices: [] };
                cur.sightings++;
                cur.indices.push(i);
                locations.set(l.raw, cur);
            }
        }
    }

    const items = [];
    for (const c of characters.values()) {
        items.push({
            key: c.key,
            kind: 'character',
            sightings: c.sightings,
            indices: c.indices,
            note: `Mentioned ${c.sightings} time${c.sightings === 1 ? '' : 's'} across the chat.`,
        });
    }
    for (const l of locations.values()) {
        items.push({
            key: l.key,
            kind: 'location',
            sightings: l.sightings,
            indices: l.indices,
            note: `Referenced ${l.sightings} time${l.sightings === 1 ? '' : 's'} across the chat.`,
        });
    }
    items.sort((a, b) => b.sightings - a.sightings);
    return { items };
}

// ----------------------------------------------------------------------------
// Checkpoint serialization
// ----------------------------------------------------------------------------

/**
 * Serialize a walk state to the chat_metadata.stmbc.audit blob shape. The
 * production walker uses the same shape; this lets the offline harness
 * "reload" by re-feeding the blob.
 *
 * @param {object} state
 * @returns {object}
 */
export function serializeCheckpoint(state) {
    return {
        version: 1,
        nextChunk: Number.isInteger(state?.nextChunk) ? state.nextChunk : 0,
        notes: state?.notes && typeof state.notes === 'object' ? state.notes : { items: [] },
        completed: state?.completed === true,
        lastUpdatedAt: new Date().toISOString(),
    };
}

/**
 * Round-trip a serialized checkpoint. Defensive against missing / malformed
 * blobs (returns the empty default).
 *
 * @param {object|null|undefined} blob
 * @returns {{nextChunk: number, notes: object, completed: boolean}}
 */
export function deserializeCheckpoint(blob) {
    if (!blob || typeof blob !== 'object') {
        return { nextChunk: 0, notes: { items: [] }, completed: false };
    }
    return {
        nextChunk: Number.isInteger(blob.nextChunk) ? blob.nextChunk : 0,
        notes: (blob.notes && typeof blob.notes === 'object') ? blob.notes : { items: [] },
        completed: blob.completed === true,
    };
}

// ----------------------------------------------------------------------------
// The driver
// ----------------------------------------------------------------------------

/**
 * Walk the chat in chunks, running the four audit jobs at the end. This is
 * the offline equivalent of the production `runAuditWalk` (auditorCore.js,
 * P5.1) — same chunk plan, same checkpoint shape, same final composition.
 *
 * Each chunk: 1) check the cancel signal, 2) "extract" notes (offline
 * stand-in), 3) merge into running notes, 4) persist a checkpoint. After
 * the walk, the four audit jobs run over the final running notes +
 * lorebook snapshot + chat slice.
 *
 * @param {object} deps
 * @param {Array<object>} deps.chat           full chat array
 * @param {object} deps.lorebookData         { entries }
 * @param {string[]} [deps.knownNames]       for the offline extractor
 * @param {string[]} [deps.knownLocations]   for the offline extractor
 * @param {object} [deps.config]
 * @param {object} [deps.checkpoint]         pre-loaded checkpoint (resume)
 * @param {() => boolean} [deps.isCancelled] halt gate (per-chunk boundary)
 * @param {number} [deps.stopAfterChunk]     halt after N chunks (testing)
 * @returns {Promise<object>} walk record
 */
export async function runAuditWalk(deps) {
    const cfg = { ...PHASE5_DEFAULTS, ...(deps.config || {}) };
    const messages = extractAuditMessages(deps.chat);
    const chunks = planAuditChunks(messages, {
        chunkSize: cfg.chunkSize,
        tokenCap: cfg.tokenCap,
    });
    const initial = deserializeCheckpoint(deps.checkpoint);

    // Accumulator: rehydrate the notes from the checkpoint.
    const notes = {
        items: Array.isArray(initial.notes?.items) ? initial.notes.items.slice() : [],
    };
    const seen = new Set(notes.items.map((i) => `${i.kind}:${String(i.key).toLowerCase()}`));

    const walk = {
        chunks,
        processedChunks: [],
        skippedChunks: [],
        checkpointsWritten: [],
        cancelled: false,
        completed: initial.completed,
        notes,
        nextChunk: initial.nextChunk,
    };

    const chatByIndex = new Map(messages.map((m) => [m._chatIndex, m]));
    const mergeSighting = (existing, partial) => {
        const merged = { ...existing };
        if (partial.indices && Array.isArray(partial.indices)) {
            const idx = new Set([...(existing.indices || []), ...partial.indices]);
            merged.indices = Array.from(idx).sort((a, b) => a - b);
            merged.sightings = merged.indices.length;
        }
        if (partial.note) merged.note = partial.note;
        return merged;
    };

    for (let i = initial.nextChunk; i < chunks.length; i++) {
        if (typeof deps.isCancelled === 'function' && deps.isCancelled()) {
            walk.cancelled = true;
            break;
        }
        if (typeof deps.stopAfterChunk === 'number' && walk.processedChunks.length >= deps.stopAfterChunk) {
            break;
        }

        const chunk = chunks[i];
        // Offline extraction: scan the chunk text for the known character /
        // location names and accumulate sightings.
        const chunkText = formatChunkText(chunk.msgs);
        const partial = makeFixtureNotes(
            chunk.msgs.map((m) => ({ ...m, mes: m.mes })),
            { knownNames: deps.knownNames, knownLocations: deps.knownLocations }
        );

        // Reduce: merge partials into the running notes.
        for (const p of partial.items) {
            const dedupeKey = `${p.kind}:${String(p.key).toLowerCase()}`;
            if (seen.has(dedupeKey)) {
                const idx = notes.items.findIndex(
                    (it) => `${it.kind}:${String(it.key).toLowerCase()}` === dedupeKey
                );
                if (idx >= 0) {
                    notes.items[idx] = mergeSighting(notes.items[idx], p);
                }
            } else {
                notes.items.push(p);
                seen.add(dedupeKey);
            }
        }

        walk.processedChunks.push(chunk.index);
        walk.nextChunk = i + 1;
        walk.checkpointsWritten.push(serializeCheckpoint({
            nextChunk: walk.nextChunk,
            notes,
            completed: false,
        }));
    }

    if (!walk.cancelled && walk.nextChunk >= chunks.length) {
        walk.completed = true;
    }

    // Final audit-job composition (only when not cancelled mid-walk; a
    // cancelled walk still returns the partial report so the resume
    // acceptance has something to compare).
    if (walk.processedChunks.length > 0) {
        const chatSlice = walk.processedChunks.flatMap((idx) => {
            const c = chunks[idx];
            if (!c) return [];
            return c.msgs.map((m) => ({ name: m.name, mes: m.mes, mesid: m._chatIndex }));
        });
        walk.reports = {
            coverage: runCoverageAudit(notes, deps.lorebookData, {}),
            technical: runTechnicalPass(deps.lorebookData, {}),
            regeneration: runEntryRegeneration(deps.lorebookData, chatSlice, {}),
            claimReverification: runClaimReverification(deps.lorebookData, chatSlice, {}),
        };
    } else {
        walk.reports = null;
    }

    walk.finalCheckpoint = serializeCheckpoint({
        nextChunk: walk.nextChunk,
        notes,
        completed: walk.completed,
    });
    walk.config = cfg;
    walk.totalChunks = chunks.length;
    walk.totalMessages = messages.length;

    return walk;
}

// ----------------------------------------------------------------------------
// Scoring helpers
// ----------------------------------------------------------------------------

/**
 * Check that every chunk in the plan is under the configured token cap.
 * Returns the per-chunk sizes plus a `allUnderCap` boolean.
 *
 * @param {Array<object>} chunks - from planAuditChunks
 * @param {number} cap
 * @returns {{sizes: number[], allUnderCap: boolean, maxSize: number}}
 */
export function chunkCappedCheck(chunks, cap) {
    const sizes = chunks.map((c) => c.tokenEstimate);
    const maxSize = sizes.length ? Math.max(...sizes) : 0;
    return {
        sizes,
        allUnderCap: sizes.every((s) => s <= cap),
        maxSize,
    };
}

/**
 * Find chunk indices processed more than once across a (re)loaded walk.
 * Duplicates here mean the reload re-evaluated finished chunks — the bug
 * the §6 Phase 5 reload criterion is guarding against.
 *
 * @param {number[]} processedChunks
 * @returns {number[]}
 */
export function findReloadDuplicates(processedChunks) {
    const seen = new Set();
    const dupes = [];
    for (const i of processedChunks) {
        if (seen.has(i)) dupes.push(i);
        seen.add(i);
    }
    return dupes;
}

/**
 * Find chunk indices that the walk never processed. Gaps here mean the
 * reload skipped chunks — also a failure mode of the §6 reload criterion.
 *
 * @param {number[]} processedChunks
 * @param {number} total
 * @returns {number[]}
 */
export function findAuditGaps(processedChunks, total) {
    const seen = new Set(processedChunks);
    const gaps = [];
    for (let i = 0; i < total; i++) {
        if (!seen.has(i)) gaps.push(i);
    }
    return gaps;
}

/**
 * Merge two walk records (the pre-reload and post-reload halves) into a
 * single "what the user sees" record, as if the reload had been
 * transparent. The merged record's `processedChunks` is the union in
 * walk-order; the merged `notes` are the union of the post-reload
 * accumulator (which is already the full reloaded set, since the
 * checkpoint holds the pre-reload state).
 *
 * @param {object} before - walk record pre-reload (has checkpoint)
 * @param {object} after - walk record post-reload (resumed with the
 *                         pre-reload's `finalCheckpoint` as `checkpoint`)
 * @returns {object} merged record
 */
export function mergeAuditRuns(before, after) {
    const processed = [...before.processedChunks, ...after.processedChunks];
    // Dedupe while preserving order (shouldn't be necessary for a healthy
    // reload, but the acceptance uses this function to make the assertion).
    const seen = new Set();
    const deduped = [];
    for (const i of processed) {
        if (!seen.has(i)) {
            seen.add(i);
            deduped.push(i);
        }
    }
    return {
        processedChunks: deduped,
        totalChunks: before.totalChunks,
        cancelled: after.cancelled,
        completed: after.completed,
        notes: after.notes,
        reports: after.reports,
        config: after.config,
    };
}
