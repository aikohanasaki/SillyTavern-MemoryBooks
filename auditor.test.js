// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// Offline unit tests for the Auditor core walker (P5.1). Exercises the pure,
// dependency-injected core with stubbed chat / checkpoint / map functions so the
// whole extract -> plan -> map-reduce -> checkpoint -> resume -> halt loop is
// verifiable without SillyTavern. Run: `node auditor.test.js`.

import assert from 'node:assert/strict';
import test from 'node:test';
import {
    AUDITOR_DEFAULTS,
    AUDIT_MAP_PROMPT,
    estimateTokensChars,
    truncateForAudit,
    extractAuditMessages,
    formatAuditMessage,
    planChunks,
    formatChunk,
    parseAuditNotes,
    emptyNotes,
    mergeNotes,
    summarizeNotes,
    reviveNotes,
    mapAuditChunk,
    runAuditWalk,
    NOTES_EVENT_CAP,
} from './auditorCore.js';

// ---------------------------------------------------------------- fixtures

/** A chat of `n` plain narrative messages, alternating speakers. */
function makeChat(n, over = {}) {
    return Array.from({ length: n }, (_, i) => ({
        mes: over[i]?.mes ?? `message ${i} with some narrative content here`,
        name: over[i]?.name ?? (i % 2 ? 'User' : 'Narrator'),
        is_user: over[i]?.is_user ?? !!(i % 2),
        is_system: over[i]?.is_system ?? false,
    }));
}

/** A map stub that returns a fixed JSON object for every chunk. */
function fixedMap(obj) {
    return async () => JSON.stringify(obj);
}

// ---------------------------------------------------------------- parseAuditNotes

test('parseAuditNotes: normalizes a well-formed object', () => {
    const out = parseAuditNotes('{"characters":["Aria"],"locations":["Keep"],"events":["duel"],"claims":[{"text":"Aria is 19","src":"msgs 3-5"}],"collisions":["Button"]}');
    assert.deepEqual(out.characters, ['Aria']);
    assert.deepEqual(out.locations, ['Keep']);
    assert.deepEqual(out.events, ['duel']);
    assert.deepEqual(out.claims, [{ text: 'Aria is 19', src: 'msgs 3-5' }]);
    assert.deepEqual(out.collisions, ['Button']);
});

test('parseAuditNotes: strips a code fence', () => {
    const out = parseAuditNotes('```json\n{"characters":["X"]}\n```');
    assert.deepEqual(out.characters, ['X']);
    assert.deepEqual(out.locations, []);
});

test('parseAuditNotes: missing fields default to empty arrays', () => {
    const out = parseAuditNotes('{"characters":["Only"]}');
    assert.deepEqual(out, { characters: ['Only'], locations: [], events: [], claims: [], collisions: [] });
});

test('parseAuditNotes: string claims are coerced to {text,src}', () => {
    const out = parseAuditNotes('{"claims":["a bare claim"]}');
    assert.deepEqual(out.claims, [{ text: 'a bare claim', src: '' }]);
});

test('parseAuditNotes: filters blanks and non-strings', () => {
    const out = parseAuditNotes('{"characters":["A","",null,42,"  B  "]}');
    assert.deepEqual(out.characters, ['A', 'B']);
});

test('parseAuditNotes: rejects non-objects and junk', () => {
    assert.equal(parseAuditNotes('[1,2,3]'), null);
    assert.equal(parseAuditNotes('not json'), null);
    assert.equal(parseAuditNotes('"a string"'), null);
    assert.equal(parseAuditNotes('42'), null);
    assert.equal(parseAuditNotes(null), null);
});

// ---------------------------------------------------------------- extract / format

test('extractAuditMessages: skips system and empty, keeps true index', () => {
    const chat = makeChat(5, { 1: { is_system: true }, 3: { mes: '   ' } });
    const msgs = extractAuditMessages(chat);
    assert.deepEqual(msgs.map(m => m.id), [0, 2, 4]);
    assert.equal(msgs[0].speaker, 'Narrator');
});

test('extractAuditMessages: non-array yields []', () => {
    assert.deepEqual(extractAuditMessages(null), []);
    assert.deepEqual(extractAuditMessages(undefined), []);
});

test('truncateForAudit: no truncation when limit<=0, else clip + ellipsis', () => {
    assert.equal(truncateForAudit('a   b\n c', 0), 'a b c');
    assert.equal(truncateForAudit('abcdef', 3), 'abc…');
    assert.equal(truncateForAudit('abc', 10), 'abc');
});

test('formatAuditMessage: [id] Speaker: text shape', () => {
    assert.equal(formatAuditMessage({ id: 7, speaker: 'Aria', rawText: 'hello  world' }, 0), '[7] Aria: hello world');
});

// ---------------------------------------------------------------- planChunks

test('planChunks: splits by message count', () => {
    const msgs = extractAuditMessages(makeChat(95));
    const plan = planChunks(msgs, { chunkSize: 40, tokenCap: 1e9, estimateTokens: () => 1 });
    assert.equal(plan.length, 3);
    assert.deepEqual(plan.map(c => c.count), [40, 40, 15]);
    assert.equal(plan[0].idStart, 0);
    assert.equal(plan[0].idEnd, 39);
    assert.equal(plan[2].idEnd, 94);
});

test('planChunks: token cap reduces messages per chunk', () => {
    const msgs = extractAuditMessages(makeChat(10));
    // Each message costs 30 tokens; cap 100 => at most 3 per chunk (3*30=90<=100, 4th 120>100).
    const plan = planChunks(msgs, { chunkSize: 40, tokenCap: 100, estimateTokens: () => 30 });
    assert.deepEqual(plan.map(c => c.count), [3, 3, 3, 1]);
    assert.ok(plan.every(c => c.tokens <= 100));
});

test('planChunks: a single oversized message becomes its own flagged chunk', () => {
    const msgs = extractAuditMessages(makeChat(3));
    const plan = planChunks(msgs, { chunkSize: 40, tokenCap: 10, estimateTokens: () => 1000 });
    assert.equal(plan.length, 3);
    assert.ok(plan.every(c => c.count === 1 && c.oversized === true));
});

test('planChunks: is deterministic (resume relies on this)', () => {
    const msgs = extractAuditMessages(makeChat(87));
    const a = planChunks(msgs, { chunkSize: 40, tokenCap: 20000 });
    const b = planChunks(msgs, { chunkSize: 40, tokenCap: 20000 });
    assert.deepEqual(a, b);
});

test('formatChunk: renders the planned slice', () => {
    const msgs = extractAuditMessages(makeChat(4));
    const plan = planChunks(msgs, { chunkSize: 2, tokenCap: 1e9, estimateTokens: () => 1 });
    const text = formatChunk(msgs, plan[1], 0);
    assert.equal(text.split('\n').length, 2);
    assert.ok(text.startsWith('[2] '));
});

// ---------------------------------------------------------------- merge / summarize

test('mergeNotes: dedupes named entities case-insensitively with chunk provenance', () => {
    const n = emptyNotes();
    mergeNotes(n, { characters: ['Aria', 'Bram'], locations: ['Keep'], events: ['e1'], claims: [{ text: 'c1', src: 's' }], collisions: ['Button'] }, 0);
    mergeNotes(n, { characters: ['aria'], locations: [], events: ['e2'], claims: [], collisions: [] }, 1);
    assert.equal(Object.keys(n.characters).length, 2);
    assert.deepEqual(n.characters.aria.chunks, [0, 1]);
    assert.equal(n.characters.aria.count, 2);
    assert.equal(n.characters.aria.name, 'Aria'); // first-seen casing preserved
    assert.deepEqual(n.events.map(e => e.text), ['e1', 'e2']);
    assert.equal(n.events[1].chunk, 1);
    assert.equal(n.chunksProcessed, 2);
});

test('mergeNotes: null partial still advances chunksProcessed', () => {
    const n = emptyNotes();
    mergeNotes(n, null, 0);
    assert.equal(n.chunksProcessed, 1);
    assert.equal(n.events.length, 0);
});

test('mergeNotes: respects the event cap', () => {
    const n = emptyNotes();
    for (let i = 0; i < NOTES_EVENT_CAP + 50; i++) mergeNotes(n, { events: ['x'] }, 0);
    assert.equal(n.events.length, NOTES_EVENT_CAP);
});

test('summarizeNotes: counts each dimension', () => {
    const n = emptyNotes();
    mergeNotes(n, { characters: ['A', 'B'], locations: ['L'], events: ['e'], claims: [{ text: 'c', src: '' }], collisions: ['x'] }, 0);
    assert.deepEqual(summarizeNotes(n), { characters: 2, locations: 1, events: 1, claims: 1, collisions: 1, chunksProcessed: 1 });
});

test('reviveNotes: rebuilds a JSON-loaded checkpoint to full shape', () => {
    const revived = reviveNotes({ characters: { a: { name: 'A', count: 1, chunks: [0] } } });
    assert.equal(Object.keys(revived.characters).length, 1);
    assert.deepEqual(revived.events, []);
    assert.deepEqual(revived.claims, []);
    assert.equal(revived.chunksProcessed, 0);
    // Non-object input yields an empty notes object.
    assert.deepEqual(summarizeNotes(reviveNotes(null)), summarizeNotes(emptyNotes()));
});

// ---------------------------------------------------------------- mapAuditChunk (retry)

test('mapAuditChunk: retries once on unparseable, then succeeds', async () => {
    let calls = 0;
    const mapChunk = async () => (++calls === 1 ? 'garbage' : '{"characters":["A"]}');
    const out = await mapAuditChunk({ mapChunk, chunkText: 'x', meta: {} });
    assert.equal(calls, 2);
    assert.deepEqual(out.characters, ['A']);
});

test('mapAuditChunk: returns null when both attempts fail', async () => {
    let calls = 0;
    const mapChunk = async () => { calls++; return 'still garbage'; };
    const out = await mapAuditChunk({ mapChunk, chunkText: 'x', meta: {} });
    assert.equal(calls, 2);
    assert.equal(out, null);
});

// ---------------------------------------------------------------- runAuditWalk

test('runAuditWalk: empty chat completes immediately', async () => {
    const saved = [];
    const res = await runAuditWalk({
        getMessages: () => [],
        saveCheckpoint: s => saved.push(s),
        mapChunk: fixedMap({ characters: ['x'] }),
    });
    assert.equal(res.status, 'empty');
    assert.equal(saved[0].status, 'complete');
    assert.equal(saved[0].total, 0);
});

test('runAuditWalk: full walk checkpoints after every chunk and completes', async () => {
    const chat = makeChat(90);
    const saved = [];
    let mapCalls = 0;
    const res = await runAuditWalk({
        getMessages: () => extractAuditMessages(chat),
        config: { chunkSize: 40, tokenCap: 1e9 },
        estimateTokens: () => 1,
        saveCheckpoint: s => saved.push(JSON.parse(JSON.stringify(s))),
        mapChunk: async () => { mapCalls++; return JSON.stringify({ characters: [`c${mapCalls}`], events: ['e'] }); },
    });
    assert.equal(res.status, 'complete');
    assert.equal(res.plan.chunks, 3);
    assert.equal(mapCalls, 3);
    // One checkpoint per processed chunk; last is complete with nextChunk===total.
    assert.equal(saved.length, 3);
    assert.deepEqual(saved.map(s => s.nextChunk), [1, 2, 3]);
    assert.deepEqual(saved.map(s => s.status), ['running', 'running', 'complete']);
    assert.equal(summarizeNotes(res.notes).characters, 3);
});

test('runAuditWalk: halts before a chunk and leaves a resumable checkpoint', async () => {
    const chat = makeChat(120); // 3 chunks of 40
    let store = null;
    let processed = 0;
    // Halt once two chunks are done.
    const res = await runAuditWalk({
        getMessages: () => extractAuditMessages(chat),
        config: { chunkSize: 40, tokenCap: 1e9 },
        estimateTokens: () => 1,
        loadCheckpoint: () => store,
        saveCheckpoint: s => { store = JSON.parse(JSON.stringify(s)); },
        shouldHalt: () => processed >= 2,
        mapChunk: async () => { processed++; return JSON.stringify({ characters: ['x'] }); },
    });
    assert.equal(res.status, 'halted');
    assert.equal(res.nextChunk, 2);
    assert.equal(store.nextChunk, 2);        // checkpoint persisted from chunk index 1
    assert.equal(store.status, 'running');
    assert.equal(processed, 2);              // the 3rd chunk was never mapped
});

test('runAuditWalk: resumes from checkpoint without re-mapping earlier chunks', async () => {
    const chat = makeChat(120); // 3 chunks of 40
    const mapped = [];
    // A checkpoint that says chunks 0 and 1 are done (nextChunk=2), with notes.
    const priorNotes = emptyNotes();
    mergeNotes(priorNotes, { characters: ['fromChunk0'] }, 0);
    mergeNotes(priorNotes, { characters: ['fromChunk1'] }, 1);
    const store = { nextChunk: 2, total: 3, notes: priorNotes, chatLen: 120, status: 'running' };

    const res = await runAuditWalk({
        getMessages: () => extractAuditMessages(chat),
        config: { chunkSize: 40, tokenCap: 1e9 },
        estimateTokens: () => 1,
        loadCheckpoint: () => store,
        saveCheckpoint: () => {},
        mapChunk: async (text, meta) => { mapped.push(meta.chunkIndex); return JSON.stringify({ characters: ['fromChunk2'] }); },
    });
    assert.equal(res.status, 'complete');
    assert.equal(res.resumed, true);
    assert.deepEqual(mapped, [2]); // only the final chunk was mapped
    assert.equal(summarizeNotes(res.notes).characters, 3); // 0 + 1 (revived) + 2 (new)
});

test('runAuditWalk: restart ignores an existing checkpoint', async () => {
    const chat = makeChat(80); // 2 chunks
    const store = { nextChunk: 2, total: 2, notes: emptyNotes(), chatLen: 80, status: 'running' };
    const mapped = [];
    const res = await runAuditWalk({
        getMessages: () => extractAuditMessages(chat),
        config: { chunkSize: 40, tokenCap: 1e9 },
        estimateTokens: () => 1,
        loadCheckpoint: () => store,
        saveCheckpoint: () => {},
        restart: true,
        mapChunk: async (t, meta) => { mapped.push(meta.chunkIndex); return JSON.stringify({}); },
    });
    assert.equal(res.status, 'complete');
    assert.equal(res.resumed, false);
    assert.deepEqual(mapped, [0, 1]); // both chunks re-read
});

test('runAuditWalk: a completed checkpoint is a no-op re-run', async () => {
    const chat = makeChat(80); // 2 chunks
    const store = { nextChunk: 2, total: 2, notes: emptyNotes(), chatLen: 80, status: 'complete' };
    let mapCalls = 0;
    const res = await runAuditWalk({
        getMessages: () => extractAuditMessages(chat),
        config: { chunkSize: 40, tokenCap: 1e9 },
        estimateTokens: () => 1,
        loadCheckpoint: () => store,
        saveCheckpoint: () => {},
        mapChunk: async () => { mapCalls++; return '{}'; },
    });
    // Completed checkpoint => plan mismatch guard falls through to fresh start.
    // (status==='complete' is not resumed; a fresh walk re-reads.)
    assert.equal(res.status, 'complete');
    assert.equal(mapCalls, 2);
});

test('runAuditWalk: a map API error on one chunk does not crash the walk', async () => {
    const chat = makeChat(120); // 3 chunks
    let n = 0;
    const res = await runAuditWalk({
        getMessages: () => extractAuditMessages(chat),
        config: { chunkSize: 40, tokenCap: 1e9 },
        estimateTokens: () => 1,
        saveCheckpoint: () => {},
        mapChunk: async () => {
            n++;
            if (n === 2 || n === 3) throw new Error('boom'); // chunk 1 fails both attempts
            return JSON.stringify({ characters: ['ok'] });
        },
    });
    assert.equal(res.status, 'complete');
    assert.equal(res.plan.chunks, 3);
    assert.equal(summarizeNotes(res.notes).chunksProcessed, 3);
});

// ---------------------------------------------------------------- constants sanity

test('defaults & prompt are present and sane', () => {
    assert.equal(AUDITOR_DEFAULTS.chunkSize, 40);
    assert.equal(AUDITOR_DEFAULTS.tokenCap, 20000);
    assert.ok(AUDIT_MAP_PROMPT.includes('JSON'));
    assert.equal(estimateTokensChars('abcd'), 1);
    assert.equal(estimateTokensChars('abcde'), 2);
});
