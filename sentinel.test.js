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
    isCadenceReached,
    effectiveCadence,
    sentinelConfigFromAutoSettings,
    parseIdArray,
    compileStructureHint,
    structureHintBoundaries,
    snapAndGuardBoundaries,
    planSceneRanges,
    detectBoundaries,
    classifyDetectionConfidence,
    runSentinelDetectionCycle,
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

// ------------------------------------------- P4.6 confidence classification

test('P4.6: classifyDetectionConfidence mirrors eval/detect.js labels', () => {
    assert.equal(classifyDetectionConfidence({ ids: [3], attempts: ['[3]'] }), 'high');
    assert.equal(classifyDetectionConfidence({ ids: [3], attempts: ['prose', '[3]'] }), 'low');
    assert.equal(classifyDetectionConfidence({ ids: null, attempts: ['prose', 'more prose'] }), 'failed');
    // Defensive: an aggregated/unknown round is never silently "high".
    assert.equal(classifyDetectionConfidence(), 'failed');
});

test('P4.6: detectBoundaries labels a clean first parse "high"', async () => {
    const det = await detectBoundaries({
        detect: async () => '[7]', systemPrompt: 'P', windowText: 'W',
    });
    assert.equal(det.confidence, 'high');
});

test('P4.6: detectBoundaries labels a reprimand-rescued parse "low"', async () => {
    let n = 0;
    const det = await detectBoundaries({
        detect: async () => (++n === 1 ? 'Sure! Here you go:' : '[7]'),
        systemPrompt: 'P',
        windowText: 'W',
    });
    assert.equal(det.ids.length, 1);
    assert.equal(det.confidence, 'low');
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
    const r = await runSentinelDetectionCycle(deps);
    assert.equal(r.action, 'skip:cadence');   // newMsgs = 5 < 8
    assert.equal(calls.detect.length, 0);
});

test('cycle skips when a job is in flight', async () => {
    const { deps } = cycleDeps({ isJobInFlight: () => true });
    assert.equal((await runSentinelDetectionCycle(deps)).action, 'skip:job-in-flight');
});

test('cycle skips (never guesses) when detection is unparseable after retry', async () => {
    const { deps, calls } = cycleDeps({ detect: async () => 'prose only' });
    const r = await runSentinelDetectionCycle(deps);
    assert.equal(r.action, 'skip:unparseable');
    assert.equal(calls.ranges.length, 0);
    assert.equal(r.rawAttempts.length, 2); // initial + one "JSON only" retry
});

test('cycle skips on detection API error', async () => {
    const { deps, calls } = cycleDeps({ detect: async () => { throw new Error('503'); } });
    const r = await runSentinelDetectionCycle(deps);
    assert.equal(r.action, 'skip:detect-error');
    assert.match(r.error, /503/);
    assert.equal(calls.ranges.length, 0);
});

test('cycle memorizes completed scenes sequentially, oldest-first', async () => {
    // 30-message chat, watermark 4. Boundary 12 and 20 -> scenes [5..11], [12..19].
    const { deps, calls } = cycleDeps({ detect: async () => '[12, 20]' });
    const r = await runSentinelDetectionCycle(deps);
    assert.equal(r.action, 'processed');
    assert.deepEqual(r.ranges, [[5, 11], [12, 19]]);
    assert.deepEqual(calls.ranges, [[5, 11], [12, 19]]); // in order
    assert.deepEqual(r.processed, [[5, 11], [12, 19]]);
    assert.equal(r.error, null);
});

test('cycle drops a boundary inside the guard zone', async () => {
    // lastIndex 29, guard 4 -> guardLimit 25. Boundary 28 must be dropped.
    const { deps, calls } = cycleDeps({ detect: async () => '[28]' });
    const r = await runSentinelDetectionCycle(deps);
    assert.equal(r.action, 'no-boundary');
    assert.equal(calls.ranges.length, 0);
});

test('cycle aborts remaining ranges when a memory run fails', async () => {
    const { deps, calls } = cycleDeps({
        detect: async () => '[12, 20]',
        runSceneMemoryRange: async (s) => { if (s === 12) throw new Error('boom'); calls.ranges.push([s]); },
    });
    // re-inject calls tracking since we overrode runSceneMemoryRange
    const r = await runSentinelDetectionCycle(deps);
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
    const r = await runSentinelDetectionCycle(deps);
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

// ------------------------------------------------- cadence predicate (P2.1↔P2.3)

test('isCadenceReached is the shared gate predicate', () => {
    assert.equal(isCadenceReached(30, 4, 8), true);    // lastIndex 29 - 4 = 25
    assert.equal(isCadenceReached(13, 4, 8), true);    // lastIndex 12 - 4 = 8
    assert.equal(isCadenceReached(12, 4, 8), false);   // lastIndex 11 - 4 = 7
    assert.equal(isCadenceReached(8, -1, 8), true);    // fresh chat, nothing memorized
    assert.equal(isCadenceReached(0, -1, 8), false);   // empty chat
});

// -------------------------------------------- cadence floor / edge trigger (PHA-1547)

test('isCadenceReached measures from the cadence floor when it is ahead of the watermark', () => {
    // Watermark 4, floor 20: a cycle already examined up to index 20 and found
    // nothing, so nothing before index 28 should re-fire the gate.
    assert.equal(isCadenceReached(30, 4, 8, 20), true);    // lastIndex 29 - 20 = 9
    assert.equal(isCadenceReached(29, 4, 8, 20), true);    // lastIndex 28 - 20 = 8
    assert.equal(isCadenceReached(28, 4, 8, 20), false);   // lastIndex 27 - 20 = 7
    assert.equal(isCadenceReached(25, 4, 8, 20), false);   // the level trigger said true here
});

test('isCadenceReached ignores a floor behind the watermark', () => {
    // A memory advanced the watermark past a stale floor — the watermark wins.
    assert.equal(isCadenceReached(30, 25, 8, 4), false);   // lastIndex 29 - 25 = 4
    assert.equal(isCadenceReached(40, 25, 8, 4), true);
});

test('isCadenceReached ignores a floor ahead of the chat (deleted messages / branch swap)', () => {
    // A floor past the end of the chat would otherwise deadlock the gate forever.
    assert.equal(isCadenceReached(30, 4, 8, 500), true);
    assert.equal(isCadenceReached(30, 4, 8, NaN), true);
});

test('isCadenceReached defaults to the pre-floor behavior', () => {
    // The engine calls it with three arguments, deliberately: a queued job must
    // never be rejected by a floor that its own gate already cleared.
    assert.equal(isCadenceReached(30, 4, 8), isCadenceReached(30, 4, 8, -1));
    assert.equal(isCadenceReached(30, 4, 8), true);
});

// ------------------------------ cadence vs window invariant (PHA-1547 guard)

test('effectiveCadence never lets the cadence outrun the window', () => {
    // cadenceN <= window - guard, or messages fall between two looks and are
    // never re-examined once the gate is an edge trigger.
    assert.equal(effectiveCadence(8, 26, 4), 8);      // the shipped defaults, untouched
    assert.equal(effectiveCadence(22, 26, 4), 22);    // exactly at the limit
    assert.equal(effectiveCadence(24, 26, 4), 22);    // clamped
    assert.equal(effectiveCadence(200, 26, 4), 22);
    assert.equal(effectiveCadence(24, 16, 4), 12);
    assert.equal(effectiveCadence(1, 26, 4), 1);      // below the limit is always fine
});

test('effectiveCadence never returns less than 1', () => {
    // window == guard leaves nothing cuttable; the cadence still has to be a
    // positive step or the gate would fire on a zero-length interval forever.
    assert.equal(effectiveCadence(8, 4, 4), 1);
    assert.equal(effectiveCadence(8, 2, 8), 1);
    assert.equal(effectiveCadence(0, 26, 4), 8);      // garbage cadence -> the default
    assert.equal(effectiveCadence(NaN, 26, 4), 8);
    assert.equal(effectiveCadence(NaN, NaN, NaN), 1);
});

test('sentinelConfigFromAutoSettings applies the cadence/window invariant', () => {
    const clamped = sentinelConfigFromAutoSettings({ cadenceMessages: 60, windowSize: 26, guardSize: 4 });
    assert.equal(clamped.cadenceN, 22);
    assert.equal(clamped.window, 26);
    assert.equal(clamped.guard, 4);

    const untouched = sentinelConfigFromAutoSettings({ cadenceMessages: 8, windowSize: 26, guardSize: 4 });
    assert.equal(untouched.cadenceN, 8);
});

test('isCadenceReached agrees with the engine at the boundary', async () => {
    // The gate and the engine must never disagree — a gate that says "go" while
    // the engine says "skip:cadence" would enqueue empty jobs forever.
    for (const len of [11, 12, 13, 14]) {
        const { deps } = cycleDeps({ getChat: () => makeChat(len), getWatermark: () => 4 });
        const gate = isCadenceReached(len, 4, SENTINEL_DEFAULTS.cadenceN);
        const engine = (await runSentinelDetectionCycle(deps)).action !== 'skip:cadence';
        assert.equal(gate, engine, `disagreement at chat length ${len}`);
    }
});

// ------------------------------------------------- abort seam (P2.3 /stmb-stop)

test('cycle aborts before the detection call when already cancelled', async () => {
    const { deps, calls } = cycleDeps({ isCancelled: () => true });
    const r = await runSentinelDetectionCycle(deps);
    assert.equal(r.action, 'abort:cancelled');
    assert.equal(r.at, 'start');
    assert.equal(calls.detect.length, 0);
    assert.equal(calls.ranges.length, 0);
});

test('cycle aborts after the window is built but before spending a detection call', async () => {
    // Cancelled only once the cycle is under way (e.g. /stmb-stop lands while
    // the job is starting): no LLM call is made.
    let calls_ = 0;
    const { deps, calls } = cycleDeps({ isCancelled: () => ++calls_ > 1 });
    const r = await runSentinelDetectionCycle(deps);
    assert.equal(r.action, 'abort:cancelled');
    assert.equal(r.at, 'before-detect');
    assert.equal(calls.detect.length, 0);
});

test('cycle stops between scenes when cancelled mid-memorize, keeping finished work', async () => {
    // detect -> [12, 20] gives ranges [[5,11],[12,19]]. Cancel after the first
    // scene is memorized: the second must not run, and the first must stand.
    let memorized = 0;
    const { deps, calls } = cycleDeps({
        detect: async () => '[12, 20]',
        isCancelled: () => memorized >= 1,
    });
    const inner = deps.runSceneMemoryRange;
    deps.runSceneMemoryRange = async (s, e) => { memorized++; return inner(s, e); };
    const r = await runSentinelDetectionCycle(deps);
    assert.equal(r.action, 'abort:cancelled');
    assert.equal(r.at, 'during-memorize');
    assert.deepEqual(r.processed, [[5, 11]]);   // finished work is kept
    assert.deepEqual(calls.ranges, [[5, 11]]);  // second scene never started
});

test('an uncancelled cycle never consults an absent isCancelled dep', async () => {
    // Back-compat: deps without isCancelled behave exactly as before.
    const { deps } = cycleDeps({ detect: async () => '[12]' });
    delete deps.isCancelled;
    const r = await runSentinelDetectionCycle(deps);
    assert.equal(r.action, 'processed');
});

// -------------------------------------------------- P4.6 confidence on the record
//
// The engine's contract is "never throws for expected conditions", so the
// low-confidence signal is a FIELD, not an exception. sentinelCadence.js does
// the routing. These tests pin both halves of that: the field is present and
// correct, AND the engine still returns normally in every case.

test('P4.6: a clean cycle carries confidence "high"', async () => {
    const { deps } = cycleDeps({ detect: async () => '[12, 20]' });
    const r = await runSentinelDetectionCycle(deps);
    assert.equal(r.action, 'processed');
    assert.equal(r.confidence, 'high');
});

test('P4.6: a reprimand-rescued cycle carries confidence "low" and still processes', async () => {
    let n = 0;
    const { deps, calls } = cycleDeps({
        detect: async () => (++n === 1 ? 'Well, I think scene 12 and 20...' : '[12, 20]'),
    });
    const r = await runSentinelDetectionCycle(deps);
    assert.equal(r.action, 'processed');
    assert.equal(r.confidence, 'low');
    // Skip-and-continue is untouched: the memories still committed.
    assert.deepEqual(calls.ranges, [[5, 11], [12, 19]]);
});

test('P4.6: skip:unparseable carries confidence "failed"', async () => {
    const { deps } = cycleDeps({ detect: async () => 'prose only' });
    const r = await runSentinelDetectionCycle(deps);
    assert.equal(r.action, 'skip:unparseable');
    assert.equal(r.confidence, 'failed');
});

test('P4.6: skip:detect-error carries confidence "failed"', async () => {
    const { deps } = cycleDeps({ detect: async () => { throw new Error('503'); } });
    const r = await runSentinelDetectionCycle(deps);
    assert.equal(r.action, 'skip:detect-error');
    assert.equal(r.confidence, 'failed');
});

test('P4.6: a structure-hint rescue is still labelled "failed" (the model output was unusable)', async () => {
    const chat = makeChat(30, {
        14: { mes: '[ 🕰️ 15:00 | 📍 Forest | dusk ] They pressed on.' },
    });
    const { deps } = cycleDeps({
        getChat: () => chat,
        detect: async () => 'no json here',
        config: { structureHintRegex: '^\\[.*\\|.*\\]' },
    });
    const r = await runSentinelDetectionCycle(deps);
    assert.equal(r.action, 'processed');
    assert.deepEqual(r.boundaries, [14]);
    assert.equal(r.confidence, 'failed');
});

test('P4.6 control: a cycle that never calls the detector carries no confidence', async () => {
    // Only detection quality is routable — a cadence/window skip has nothing to
    // review, and must not be able to block a job.
    const { deps } = cycleDeps({ getChat: () => makeChat(10), getWatermark: () => 4 });
    const r = await runSentinelDetectionCycle(deps);
    assert.equal(r.action, 'skip:cadence');
    assert.equal(r.confidence, undefined);
});
