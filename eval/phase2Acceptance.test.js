// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// eval/phase2Acceptance.test.js — unit tests for the Phase 2 acceptance harness.
//
// Two layers:
//   1. The harness's own pure helpers (index conversion, reference detector,
//      scorers) on hand-built inputs — including tests that the scorers can
//      actually FAIL, so a green acceptance run means something.
//   2. The four Phase 2 acceptance criteria against the bundled fixture.
//
// Fully offline. Run: `node --test eval/phase2Acceptance.test.js`

import test from 'node:test';
import assert from 'node:assert/strict';

import {
    DEFAULT_FIXTURE,
    findDuplicateWork,
    findGaps,
    findMidSceneCuts,
    groundTruthChatBoundaries,
    loadFixture,
    makeReferenceDetector,
    productionConfig,
    runIncremental,
    scoreBoundaryCoverage,
    toChatArray,
    windowIdsFromPrompt,
} from './phase2Acceptance.js';
import { AUTO_MODULE_DEFAULTS } from '../autoSettings.js';
import { SENTINEL_DEFAULTS } from '../sentinelCore.js';

// ----------------------------------------------------------------------------
// Index-space conversion
// ----------------------------------------------------------------------------

test('groundTruthChatBoundaries converts 1-based eval indices to 0-based chat indices', () => {
    assert.deepEqual(groundTruthChatBoundaries([1, 3, 25, 31]), [2, 24, 30]);
});

test('groundTruthChatBoundaries drops the implicit first-scene start', () => {
    // Eval index 1 -> chat index 0, which can never be a cut (nothing precedes it).
    assert.deepEqual(groundTruthChatBoundaries([1]), []);
});

test('toChatArray produces SillyTavern-shaped messages in order', () => {
    const chat = toChatArray([
        { text: 'a', speaker: 'Narrator', isUser: false, isSystem: false },
        { text: 'b', speaker: 'You', isUser: true, isSystem: false },
        { text: 'c', speaker: null, isUser: false, isSystem: true },
    ]);
    assert.deepEqual(chat[0], { mes: 'a', name: 'Narrator', is_user: false, is_system: false });
    assert.equal(chat[1].is_user, true);
    assert.equal(chat[2].is_system, true);
    assert.equal(chat[2].name, 'system');
});

// ----------------------------------------------------------------------------
// Reference detector
// ----------------------------------------------------------------------------

test('windowIdsFromPrompt reads the ids the engine actually rendered', () => {
    const prompt = 'instructions\n\n[5] Narrator: hi\n[6] You: yo\n[7] Narrator: [not an id]';
    assert.deepEqual(windowIdsFromPrompt(prompt), [5, 6, 7]);
});

test('reference detector answers only about messages it was shown', async () => {
    const detect = makeReferenceDetector([3, 9, 40]);
    const reply = await detect('x\n[1] a: a\n[2] b: b\n[3] c: c\n[9] d: d');
    assert.deepEqual(JSON.parse(reply), [3, 9], 'boundary 40 is outside the window');
});

test('reference detector emits strict JSON the engine can parse', async () => {
    const detect = makeReferenceDetector([2]);
    assert.equal(await detect('[1] a: a'), '[]');
    assert.match(await detect('[1] a: a\n[2] b: b'), /^\[\s*2\s*\]$/);
});

// ----------------------------------------------------------------------------
// Scorers — the negative cases matter most
// ----------------------------------------------------------------------------

test('scoreBoundaryCoverage credits a range whose end+1 is a ground-truth boundary', () => {
    const r = scoreBoundaryCoverage([[0, 4], [5, 11]], [5, 12, 40]);
    assert.deepEqual(r.produced, [5, 12]);
    assert.deepEqual(r.expected, [5, 12], 'boundary 40 is beyond the covered span');
    assert.equal(r.coverage, 1);
});

test('scoreBoundaryCoverage reports a miss when a boundary inside the span was skipped', () => {
    // Ground truth cuts at 5 and 8, but the run produced one range ending at 11.
    const r = scoreBoundaryCoverage([[0, 11]], [5, 8]);
    assert.deepEqual(r.missed, [5, 8]);
    assert.equal(r.coverage, 0);
});

test('findMidSceneCuts flags a range that ends off-boundary', () => {
    const r = findMidSceneCuts([[0, 4], [5, 9]], [5, 12]);
    assert.equal(r.clean, 1);
    assert.equal(r.cuts.length, 1);
    assert.deepEqual(r.cuts[0], { range: [5, 9], endsAt: 10 });
});

test('findMidSceneCuts passes a fully aligned run', () => {
    assert.deepEqual(findMidSceneCuts([[0, 4], [5, 11]], [5, 12]).cuts, []);
});

test('findDuplicateWork catches an identical repeated range', () => {
    const r = findDuplicateWork([[0, 4], [5, 9], [5, 9]]);
    assert.deepEqual(r.duplicates, [[5, 9]]);
    assert.equal(r.overlaps.length, 5, 'messages 5..9 are each covered twice');
});

test('findDuplicateWork catches a partial overlap (not an exact duplicate)', () => {
    const r = findDuplicateWork([[0, 6], [4, 9]]);
    assert.deepEqual(r.duplicates, [], 'not an exact repeat');
    assert.deepEqual(r.overlaps.map((o) => o.message), [4, 5, 6]);
});

test('findGaps catches messages that would never be memorized', () => {
    const gaps = findGaps([[0, 4], [8, 11]]);
    assert.equal(gaps.length, 1);
    assert.deepEqual(gaps[0].missing, [5, 7]);
});

// ----------------------------------------------------------------------------
// Production config resolution (P2.2 settings -> P2.1 engine)
// ----------------------------------------------------------------------------

test('productionConfig maps the stored P2.2 setting names onto engine names', () => {
    const cfg = productionConfig();
    assert.equal(cfg.cadenceN, AUTO_MODULE_DEFAULTS.cadenceMessages);
    assert.equal(cfg.window, AUTO_MODULE_DEFAULTS.windowSize);
    assert.equal(cfg.overlap, AUTO_MODULE_DEFAULTS.windowOverlap);
    assert.equal(cfg.truncate, AUTO_MODULE_DEFAULTS.truncateChars);
    assert.equal(cfg.guard, AUTO_MODULE_DEFAULTS.guardSize);
    assert.equal(cfg.detectionPrompt, null, 'null => bundled baseline prompt');
});

test('the production cadence is 8, as Phase 2 specifies', () => {
    assert.equal(productionConfig().cadenceN, 8);
    assert.equal(SENTINEL_DEFAULTS.cadenceN, 8);
});

// ----------------------------------------------------------------------------
// The fixture
// ----------------------------------------------------------------------------

// The count moved 22 -> 35 when eval/groundTruth.js switched to the
// fine-grained merge (PHA-1555 comment 083e4488, applied in PHA-1637). 22 was
// the over-merged key an oracle detector could only score P=0.33 against; 35 is
// the key the original Phase-0 eval's 0.969 was measured on. Criterion 1 below
// still holds at full coverage — it now holds against 13 more boundaries.
test('the bundled fixture parses to ~329 messages with 35 ground-truth boundaries', async () => {
    const fx = await loadFixture(DEFAULT_FIXTURE);
    assert.equal(fx.chat.length, 329);
    assert.equal(fx.evalBoundaries.length, 35, 'fine-grained merged ground truth');
    assert.equal(fx.boundaries.length, 35);
    assert.ok(fx.boundaries.every((b) => Number.isInteger(b) && b > 0 && b < fx.chat.length));
});

// ----------------------------------------------------------------------------
// Acceptance criteria 1 & 2 — coverage and mid-scene cuts
// ----------------------------------------------------------------------------

test('CRITERION 1: scene memories reproduce every Phase 0 ground-truth boundary', async () => {
    const fx = await loadFixture();
    const run = await runIncremental({ chat: fx.chat, boundaries: fx.boundaries });
    const cov = scoreBoundaryCoverage(run.processedRanges, fx.boundaries);
    assert.equal(cov.missed.length, 0, `missed boundaries: ${cov.missed}`);
    assert.equal(cov.coverage, 1);
    assert.equal(cov.expected.length, 35);
    assert.equal(run.processedRanges.length, 35);
});

test('CRITERION 1: the run leaves no gaps in the covered span', async () => {
    const fx = await loadFixture();
    const run = await runIncremental({ chat: fx.chat, boundaries: fx.boundaries });
    assert.deepEqual(findGaps(run.processedRanges), []);
    assert.equal(run.processedRanges[0][0], 0, 'starts at the first message');
});

test('CRITERION 1: the run does not burn a detection call per message (PHA-1547)', async () => {
    // The cadence gate used to be a LEVEL trigger: true on every message once
    // the backlog passed cadenceN, so the fixture cost 279 cycles for 22
    // memories — 257 of them fruitless. Offline that is just a counter; in
    // production every one is a real LLM call on the detection profile.
    //
    // The cadence floor makes it an edge trigger. The bound below is the
    // physical one: you cannot walk 329 messages at a cadence of 8 in fewer
    // than ~329/8 cycles, so anything near it is as cheap as the design allows.
    const fx = await loadFixture();
    const run = await runIncremental({ chat: fx.chat, boundaries: fx.boundaries });
    const cadence = productionConfig().cadenceN;
    const costFloor = Math.floor(fx.chat.length / cadence);

    assert.ok(
        run.cycles.length <= 2 * costFloor,
        `cycle count regressed to ${run.cycles.length} (level-trigger territory); `
        + `expected at most ${2 * costFloor} for ${fx.chat.length} messages at cadence ${cadence}`,
    );
    // And the waste specifically: fruitless cycles must not dominate the run.
    const fruitless = run.cycles.filter((c) => c.action === 'no-boundary').length;
    assert.ok(
        fruitless <= 2 * run.processedRanges.length,
        `${fruitless} fruitless cycles for ${run.processedRanges.length} memories`,
    );
});

test('CRITERION 1: backing off never starves coverage, at any settable cadence', async () => {
    // The opposite failure the edge trigger could cause: back off further than
    // the window can look back and messages fall between two looks, never to be
    // re-examined. Unclamped, cadence 24 / window 16 drops this fixture to 8/19
    // and cadence 200 / window 26 to 1/13. `effectiveCadence` is what holds the
    // line, so sweep the settings panel's own range against it.
    const fx = await loadFixture();
    for (const [cadenceMessages, windowSize] of [[8, 26], [16, 16], [24, 16], [50, 26], [200, 26]]) {
        const config = productionConfig({ cadenceMessages, windowSize });
        const run = await runIncremental({ chat: fx.chat, boundaries: fx.boundaries, config });
        const cov = scoreBoundaryCoverage(run.processedRanges, fx.boundaries);
        assert.equal(
            cov.missed.length, 0,
            `cadence ${cadenceMessages} / window ${windowSize} (effective cadence ${config.cadenceN}) `
            + `missed ${cov.missed}`,
        );
        assert.ok(config.cadenceN <= config.window - config.guard, 'the invariant itself must hold');
    }
});

test('CRITERION 2: zero mid-scene cuts', async () => {
    const fx = await loadFixture();
    const run = await runIncremental({ chat: fx.chat, boundaries: fx.boundaries });
    const { cuts } = findMidSceneCuts(run.processedRanges, fx.boundaries);
    assert.deepEqual(cuts, [], `mid-scene cuts: ${JSON.stringify(cuts)}`);
});

test('CRITERION 2: the guard keeps the live scene unmemorized (one scene behind)', async () => {
    const fx = await loadFixture();
    const run = await runIncremental({ chat: fx.chat, boundaries: fx.boundaries });
    const lastIndex = fx.chat.length - 1;
    assert.ok(
        run.finalWatermark < lastIndex,
        'the current, possibly-incomplete scene must never be memorized',
    );
    assert.ok(lastIndex - run.finalWatermark >= productionConfig().guard);
});

// ----------------------------------------------------------------------------
// Acceptance criterion 3 — reload mid-cycle produces no duplicates
// ----------------------------------------------------------------------------

test('CRITERION 3: resuming from the persisted watermark duplicates no work', async () => {
    const fx = await loadFixture();
    // Run until 8 scenes are memorized, then drop all in-memory state.
    const before = await runIncremental({
        chat: fx.chat,
        boundaries: fx.boundaries,
        stopAfterCycle: (s) => s.processedRanges.length >= 8,
    });
    assert.ok(before.stopped, 'the run must actually have been interrupted');
    assert.equal(before.processedRanges.length, 8);

    // Reload: only the persisted watermark survives.
    const after = await runIncremental({
        chat: fx.chat,
        boundaries: fx.boundaries,
        startAt: before.resumeState.visible,
        initialWatermark: before.resumeState.watermark,
    });

    const all = [...before.processedRanges, ...after.processedRanges];
    const dup = findDuplicateWork(all);
    assert.deepEqual(dup.duplicates, [], `duplicated ranges: ${JSON.stringify(dup.duplicates)}`);
    assert.deepEqual(dup.overlaps, [], `overlapping coverage: ${JSON.stringify(dup.overlaps)}`);
    assert.deepEqual(findGaps(all), [], 'the reload must not skip messages either');
});

test('CRITERION 3: a reloaded run produces the identical range list to an uninterrupted one', async () => {
    const fx = await loadFixture();
    const uninterrupted = await runIncremental({ chat: fx.chat, boundaries: fx.boundaries });
    const before = await runIncremental({
        chat: fx.chat,
        boundaries: fx.boundaries,
        stopAfterCycle: (s) => s.processedRanges.length >= 8,
    });
    const after = await runIncremental({
        chat: fx.chat,
        boundaries: fx.boundaries,
        startAt: before.resumeState.visible,
        initialWatermark: before.resumeState.watermark,
    });
    assert.deepEqual(
        [...before.processedRanges, ...after.processedRanges],
        uninterrupted.processedRanges,
        'a reload must be invisible in the output',
    );
});

// ----------------------------------------------------------------------------
// Acceptance criterion 4 — stopping the sentinel
// ----------------------------------------------------------------------------

test('CRITERION 4: an abort signal halts a cycle mid-flight, keeping finished scenes', async () => {
    const fx = await loadFixture();
    const run = await runIncremental({
        chat: fx.chat,
        boundaries: fx.boundaries,
        cancelDuringCycle: (s) => s.processedRanges.length >= 3,
    });
    assert.ok(run.cancelled, 'at least one cycle must report cancelled');
    assert.equal(run.processedRanges.length, 3, 'no scene is memorized after the cancel');

    // The finished work stands, and it is still clean — a cancel must not
    // corrupt the boundary alignment of what was already committed.
    assert.deepEqual(findMidSceneCuts(run.processedRanges, fx.boundaries).cuts, []);
    assert.deepEqual(findDuplicateWork(run.processedRanges).duplicates, []);

    const cancelledCycles = run.cycles.filter((c) => c.status === 'cancelled');
    assert.ok(cancelledCycles.length > 0);
    assert.equal(cancelledCycles[0].action, 'abort:cancelled');
});

test('CRITERION 4: the abort is recorded in the P2.3 ring buffer, not silently swallowed', async () => {
    const fx = await loadFixture();
    const run = await runIncremental({
        chat: fx.chat,
        boundaries: fx.boundaries,
        cancelDuringCycle: (s) => s.processedRanges.length >= 3,
    });
    assert.ok(run.cycleLog.length > 0, 'chat_metadata.stmbc.cycleLog must be written');
    assert.ok(run.cycleLog.length <= 20, 'ring buffer stays capped');
    assert.ok(run.cycleLog.some((e) => e.status === 'cancelled'));
});

test('CRITERION 4: turning the sentinel off stops every cycle at the factory gate', async () => {
    const fx = await loadFixture();
    const run = await runIncremental({
        chat: fx.chat,
        boundaries: fx.boundaries,
        sentinelEnabled: false,
    });
    assert.equal(run.processedRanges.length, 0, 'nothing is memorized while disabled');
    assert.equal(run.cycles.length, 0, 'no cycle job ever runs');
    assert.ok(run.refusals.length > 0, 'the resolver gate actively refused');
    assert.match(run.refusals[0].reason, /disabled/);
});
