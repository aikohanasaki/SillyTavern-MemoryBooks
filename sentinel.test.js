// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// Offline unit tests for the Sentinel core cycle (P2.1). Exercises the pure,
// dependency-injected core with stubbed chat/watermark/detect/memory functions
// so the whole cadence -> window -> detect -> snap/guard -> range logic is
// verifiable without SillyTavern. Run: `node sentinel.test.js`.

import assert from 'node:assert/strict';
import test from 'node:test';
import {
    SENTINEL_DEFAULTS,
    truncateForDetection,
    stripForDetection,
    extractWindowMessages,
    formatDetectionWindow,
    buildDetectionWindow,
    parseIdArray,
    compileStructureHint,
    structureHintBoundaries,
    snapAndGuardBoundaries,
    planSceneRanges,
    detectBoundaries,
    runSentinelCycle,
} from './sentinelCore.js';

// ---------------------------------------------------------------- fixtures

/** A chat of `n` plain narrative messages, alternating speakers. */
function makeChat(n, over = {}) {
    return Array.from({ length: n }, (_, i) => ({
        mes: over[i]?.mes ?? `message ${i}`,
        name: over[i]?.name ?? (i % 2 ? 'User' : 'Narrator'),
        is_user: over[i]?.is_user ?? !!(i % 2),
        is_system: over[i]?.is_system ?? false,
    }));
}

// ---------------------------------------------------------------- parseIdArray (strict JSON)

test('parseIdArray accepts integer arrays and tolerates fences', () => {
    assert.deepEqual(parseIdArray('[1, 2, 3]'), [1, 2, 3]);
    assert.deepEqual(parseIdArray('```json\n[7]\n```'), [7]);
    assert.deepEqual(parseIdArray('[]'), []);
});

test('parseIdArray rejects prose, non-integers, and objects', () => {
    assert.equal(parseIdArray('The boundaries are [1, 2]'), null);
    assert.equal(parseIdArray('[1, "2"]'), null);
    assert.equal(parseIdArray('{"ids":[1]}'), null);
    assert.equal(parseIdArray('[1.5]'), null);
    assert.equal(parseIdArray(null), null);
});

// ---------------------------------------------------------------- truncation & stripping

test('truncateForDetection collapses whitespace and caps length', () => {
    assert.equal(truncateForDetection('short  text\nhere', 500), 'short text here');
    assert.equal(truncateForDetection('a'.repeat(600), 500).length, 501); // 500 + ellipsis
});

test('stripForDetection removes thought blocks and stamp headers', () => {
    assert.equal(stripForDetection('<thought>hidden</thought>visible').trim(), 'visible');
    assert.equal(
        stripForDetection('[ 🕰️ 09:00 | 📍 Tavern | clear ] She entered.').trim(),
        'She entered.',
    );
    // A plain bracket with no pipe is left alone (not a stamp).
    assert.equal(stripForDetection('[OOC] hello').trim(), '[OOC] hello');
});

// ---------------------------------------------------------------- window building

test('extractWindowMessages skips system messages but keeps true indices', () => {
    const chat = makeChat(5, { 2: { is_system: true } });
    const msgs = extractWindowMessages(chat, 0, 4);
    assert.deepEqual(msgs.map(m => m.id), [0, 1, 3, 4]);
});

test('buildDetectionWindow anchors to the tail with overlap and cap', () => {
    const chat = makeChat(60);
    // watermark 40 -> tail 41..59 (19 msgs) + 4 overlap => start 37, well under cap 26.
    const w1 = buildDetectionWindow(chat, { watermark: 40, window: 26, overlap: 4 });
    assert.equal(w1.start, 37);
    assert.equal(w1.end, 59);

    // Fresh chat (watermark -1) with a long tail must cap to the last 26.
    const w2 = buildDetectionWindow(chat, { watermark: -1, window: 26, overlap: 4 });
    assert.equal(w2.start, 34); // 59 - 26 + 1
    assert.equal(w2.end, 59);
    assert.equal(w2.messages.length, 26);
});

test('formatDetectionWindow emits "[id] Speaker: text"', () => {
    const chat = makeChat(3);
    const msgs = extractWindowMessages(chat, 0, 2);
    const text = formatDetectionWindow(msgs, 500);
    assert.equal(text.split('\n')[0], '[0] Narrator: message 0');
});

// ---------------------------------------------------------------- structure hint

test('compileStructureHint returns a regex or null (never throws)', () => {
    assert.ok(compileStructureHint('^\\[') instanceof RegExp);
    assert.equal(compileStructureHint(''), null);
    assert.equal(compileStructureHint('([unclosed'), null); // invalid regex -> null
});

test('structureHintBoundaries matches raw (unstripped) message text', () => {
    const chat = makeChat(6, {
        3: { mes: '[ 🕰️ 10:00 | 📍 Docks | rain ] The ship arrived.' },
    });
    const msgs = extractWindowMessages(chat, 0, 5);
    const rx = compileStructureHint('^\\[.*\\|.*\\]');
    assert.deepEqual(structureHintBoundaries(msgs, rx), [3]);
});

// ---------------------------------------------------------------- snap / guard

test('snapAndGuardBoundaries drops guard-zone, pre-watermark, and out-of-window ids', () => {
    const windowIds = new Set([5, 6, 7, 8, 9, 10, 11, 12]);
    const out = snapAndGuardBoundaries({
        llmIds: [4, 6, 11, 99],  // 4 <= watermark+1 region, 11 in guard zone, 99 out of window
        structureIds: [],
        watermark: 4,            // minB = 6
        lastIndex: 12,
        guard: 4,                // guardLimit = 8
        windowIds,
    });
    assert.deepEqual(out, [6]);  // only 6 survives (>=6 and <=8 and in window)
});

test('snapAndGuardBoundaries snaps an LLM id onto a nearby structure boundary', () => {
    const windowIds = new Set([5, 6, 7, 8, 9, 10]);
    const out = snapAndGuardBoundaries({
        llmIds: [7],            // one off from the deterministic boundary 6
        structureIds: [6],
        watermark: 3,           // minB = 5
        lastIndex: 12,
        guard: 4,               // guardLimit = 8
        windowIds,
    });
    assert.deepEqual(out, [6]); // 7 snaps to 6; deduped with the structure boundary
});

// ---------------------------------------------------------------- range planning

test('planSceneRanges closes completed scenes and leaves the tail unprocessed', () => {
    // watermark 4, boundaries 10 and 18 -> scenes [5..9] and [10..17]; 18..tail left open.
    assert.deepEqual(planSceneRanges(4, [10, 18]), [[5, 9], [10, 17]]);
    assert.deepEqual(planSceneRanges(-1, [3]), [[0, 2]]);
    assert.deepEqual(planSceneRanges(4, []), []);
});

// ---------------------------------------------------------------- detection retry discipline

test('detectBoundaries retries once on non-JSON then parses', async () => {
    const replies = ['I think 20 begins a scene.', '[20]'];
    let i = 0;
    const det = await detectBoundaries({
        detect: async () => replies[i++],
        systemPrompt: 'sys',
        windowText: 'win',
    });
    assert.deepEqual(det.ids, [20]);
    assert.equal(det.attempts.length, 2);
});

test('detectBoundaries returns null ids after a second failure', async () => {
    const det = await detectBoundaries({
        detect: async () => 'still prose',
        systemPrompt: 'sys',
        windowText: 'win',
    });
    assert.equal(det.ids, null);
    assert.equal(det.attempts.length, 2);
});

// ---------------------------------------------------------------- full cycle

function cycleDeps(overrides = {}) {
    const calls = { detect: [], ranges: [], logs: [] };
    const deps = {
        config: {},
        getChat: () => makeChat(30),
        getWatermark: () => 4,
        isJobInFlight: () => false,
        detect: async (prompt) => { calls.detect.push(prompt); return '[]'; },
        runSceneMemoryRange: async (s, e) => { calls.ranges.push([s, e]); },
        log: (r) => calls.logs.push(r),
        ...overrides,
    };
    return { deps, calls };
}

test('cycle skips when fewer than N new messages', async () => {
    const { deps, calls } = cycleDeps({ getChat: () => makeChat(10), getWatermark: () => 4 });
    const r = await runSentinelCycle(deps);
    assert.equal(r.action, 'skip:cadence');   // newMsgs = 5 < 8
    assert.equal(calls.detect.length, 0);
});

test('cycle skips when a job is in flight', async () => {
    const { deps } = cycleDeps({ isJobInFlight: () => true });
    assert.equal((await runSentinelCycle(deps)).action, 'skip:job-in-flight');
});

test('cycle skips (never guesses) when detection is unparseable after retry', async () => {
    const { deps, calls } = cycleDeps({ detect: async () => 'prose only' });
    const r = await runSentinelCycle(deps);
    assert.equal(r.action, 'skip:unparseable');
    assert.equal(calls.ranges.length, 0);
    assert.equal(r.rawAttempts.length, 2); // initial + one "JSON only" retry
});

test('cycle skips on detection API error', async () => {
    const { deps, calls } = cycleDeps({ detect: async () => { throw new Error('503'); } });
    const r = await runSentinelCycle(deps);
    assert.equal(r.action, 'skip:detect-error');
    assert.match(r.error, /503/);
    assert.equal(calls.ranges.length, 0);
});

test('cycle memorizes completed scenes sequentially, oldest-first', async () => {
    // 30-message chat, watermark 4. Boundary 12 and 20 -> scenes [5..11], [12..19].
    const { deps, calls } = cycleDeps({ detect: async () => '[12, 20]' });
    const r = await runSentinelCycle(deps);
    assert.equal(r.action, 'processed');
    assert.deepEqual(r.ranges, [[5, 11], [12, 19]]);
    assert.deepEqual(calls.ranges, [[5, 11], [12, 19]]); // in order
    assert.deepEqual(r.processed, [[5, 11], [12, 19]]);
    assert.equal(r.error, null);
});

test('cycle drops a boundary inside the guard zone', async () => {
    // lastIndex 29, guard 4 -> guardLimit 25. Boundary 28 must be dropped.
    const { deps, calls } = cycleDeps({ detect: async () => '[28]' });
    const r = await runSentinelCycle(deps);
    assert.equal(r.action, 'no-boundary');
    assert.equal(calls.ranges.length, 0);
});

test('cycle aborts remaining ranges when a memory run fails', async () => {
    const { deps, calls } = cycleDeps({
        detect: async () => '[12, 20]',
        runSceneMemoryRange: async (s) => { if (s === 12) throw new Error('boom'); calls.ranges.push([s]); },
    });
    // re-inject calls tracking since we overrode runSceneMemoryRange
    const r = await runSentinelCycle(deps);
    assert.equal(r.action, 'processed');
    assert.deepEqual(r.processed, [[5, 11]]);        // first scene done
    assert.match(r.error, /boom/);                   // second aborted
});

test('cycle uses the per-chat structure hint as a deterministic boundary source', async () => {
    const chat = makeChat(30, {
        14: { mes: '[ 🕰️ 15:00 | 📍 Forest | dusk ] They pressed on.' },
    });
    const { deps, calls } = cycleDeps({
        getChat: () => chat,
        detect: async () => '[]',                    // LLM finds nothing
        config: { structureHintRegex: '^\\[.*\\|.*\\]' },
    });
    const r = await runSentinelCycle(deps);
    assert.equal(r.action, 'processed');
    assert.deepEqual(r.boundaries, [14]);
    assert.deepEqual(calls.ranges, [[5, 13]]);
});

test('SENTINEL_DEFAULTS match the validated production config (plan §3.3)', () => {
    assert.equal(SENTINEL_DEFAULTS.cadenceN, 8);
    assert.equal(SENTINEL_DEFAULTS.window, 26);
    assert.equal(SENTINEL_DEFAULTS.overlap, 4);
    assert.equal(SENTINEL_DEFAULTS.truncate, 500);
    assert.equal(SENTINEL_DEFAULTS.guard, 4);
});
