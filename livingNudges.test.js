// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// livingNudges.test.js — Unit tests for the P4.4 living-lorebook nudge
// orchestrator. Tests are offline (no SillyTavern runtime required) so the
// module can be loaded in pure Node.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
    summarizeConsolidationEligibility,
    shouldShowConsolidationPrompt,
    shouldShowCompactionPrompt,
    runNudgeSweepForCurrentChat,
} from './livingNudges.js';

// ----------------------------------------------------------------------------
// summarizeConsolidationEligibility
// ----------------------------------------------------------------------------

test('summarizeConsolidationEligibility returns tiers 2-6 with counts', () => {
    const lb = {
        valid: true,
        data: {
            entries: {
                '1': { stmemorybooks: true, tier: 1 },
                '2': { stmemorybooks: true, tier: 1 },
                '3': { stmemorybooks: true, tier: 2 }, // counts toward tier 3 (source = tier 2)
                '4': { stmemorybooks: true, tier: 3 },
                '5': { stmemorybooks: false, tier: 1 }, // not a memory
            },
        },
    };
    const out = summarizeConsolidationEligibility({}, lb);
    assert.equal(out.length, 5);
    // tier 2: source=tier 1 → eligibleCount = 2 (entries 1, 2)
    assert.equal(out[0].tier, 2);
    assert.equal(out[0].eligibleCount, 2);
    // tier 3: source=tier 2 → eligibleCount = 1 (entry 3)
    assert.equal(out[1].tier, 3);
    assert.equal(out[1].eligibleCount, 1);
    // tiers 4-6: source tiers 3-5 → eligibleCount = 1 (entry 4) then 0
    assert.equal(out[2].eligibleCount, 1);
    assert.equal(out[3].eligibleCount, 0);
    assert.equal(out[4].eligibleCount, 0);
});

test('summarizeConsolidationEligibility uses summaryTierMinimums settings', () => {
    const lb = { valid: true, data: { entries: { '1': { stmemorybooks: true, tier: 1 } } } };
    const settings = { moduleSettings: { summaryTierMinimums: { 2: 99 } } };
    const out = summarizeConsolidationEligibility(settings, lb);
    assert.equal(out[0].requiredMin, 99);
});

test('summarizeConsolidationEligibility defaults requiredMin to 5', () => {
    const lb = { valid: true, data: { entries: {} } };
    const out = summarizeConsolidationEligibility({}, lb);
    for (const tier of out) {
        assert.equal(tier.requiredMin, 5);
    }
});

test('summarizeConsolidationEligibility returns [] for invalid input', () => {
    assert.deepEqual(summarizeConsolidationEligibility({}, null), []);
    assert.deepEqual(summarizeConsolidationEligibility({}, { valid: false }), []);
    assert.deepEqual(summarizeConsolidationEligibility({}, { valid: true, data: null }), []);
});

// ----------------------------------------------------------------------------
// shouldShowConsolidationPrompt
// ----------------------------------------------------------------------------

test('shouldShowConsolidationPrompt returns false when no tier ready', () => {
    const lb = { valid: true, data: { entries: {
        '1': { stmemorybooks: true, tier: 1 },
        '2': { stmemorybooks: true, tier: 1 },
    } } };
    // Only 2 entries in tier 1; default threshold is 20; below.
    const out = shouldShowConsolidationPrompt({}, lb);
    assert.equal(out.nudge, false);
    assert.equal(out.reason, 'no-tier-ready');
});

test('shouldShowConsolidationPrompt fires when a tier is ready', () => {
    // 20 entries in tier 1 → tier 2 should be ready (threshold 20, default requiredMin 5).
    const entries = {};
    for (let i = 1; i <= 20; i++) {
        entries[String(i)] = { stmemorybooks: true, tier: 1 };
    }
    const lb = { valid: true, data: { entries } };
    const out = shouldShowConsolidationPrompt({}, lb);
    assert.equal(out.nudge, true);
    assert.equal(out.tier, 2);
    assert.equal(out.eligible, 20);
    assert.match(out.line, /Consolidation available/);
});

test('shouldShowConsolidationPrompt picks lowest ready tier first', () => {
    // 25 in tier 1 → tier 2 ready.
    // 25 in tier 2 → tier 3 ready.
    // Both ready → tier 2 wins (lowest).
    const entries = {};
    for (let i = 1; i <= 25; i++) {
        entries[`t1-${i}`] = { stmemorybooks: true, tier: 1 };
        entries[`t2-${i}`] = { stmemorybooks: true, tier: 2 };
    }
    const lb = { valid: true, data: { entries } };
    const out = shouldShowConsolidationPrompt({}, lb);
    assert.equal(out.nudge, true);
    assert.equal(out.tier, 2);
});

test('shouldShowConsolidationPrompt honors promptEnabled=false', () => {
    const entries = {};
    for (let i = 1; i <= 25; i++) entries[String(i)] = { stmemorybooks: true, tier: 1 };
    const settings = { moduleSettings: { autoConsolidationPromptEnabled: false } };
    const out = shouldShowConsolidationPrompt(settings, { valid: true, data: { entries } });
    assert.equal(out.nudge, false);
    assert.equal(out.reason, 'no-tier-ready'); // walk continues, all return below-threshold (disabled)
});

test('shouldShowConsolidationPrompt respects opts.threshold', () => {
    const entries = {};
    for (let i = 1; i <= 10; i++) entries[String(i)] = { stmemorybooks: true, tier: 1 };
    const lb = { valid: true, data: { entries } };
    const out = shouldShowConsolidationPrompt({}, lb, { threshold: 5 });
    assert.equal(out.nudge, true);
    assert.equal(out.tier, 2);
    assert.equal(out.eligible, 10);
});

// ----------------------------------------------------------------------------
// shouldShowCompactionPrompt
// ----------------------------------------------------------------------------

test('shouldShowCompactionPrompt returns false for short entries', () => {
    const out = shouldShowCompactionPrompt({ uid: 1, content: 'short' });
    assert.equal(out.nudge, false);
    assert.equal(out.contentTokens, 2); // ceil(5/4) = 2
});

test('shouldShowCompactionPrompt fires for long entries (default 4000 tokens)', () => {
    const longContent = 'a'.repeat(20_000); // 5000 tokens
    const out = shouldShowCompactionPrompt({ uid: 1, content: longContent });
    assert.equal(out.nudge, true);
    assert.equal(out.contentTokens, 5000);
    assert.equal(out.threshold, 4000);
    assert.match(out.line, /Compaction suggested/);
    assert.match(out.line, /5000 tokens/);
});

test('shouldShowCompactionPrompt includes entry title in line', () => {
    const out = shouldShowCompactionPrompt({
        uid: 1,
        content: 'a'.repeat(20_000),
        comment: 'Grondulf the troll',
    });
    assert.match(out.line, /Grondulf the troll/);
});

test('shouldShowCompactionPrompt handles null gracefully', () => {
    const out = shouldShowCompactionPrompt(null);
    assert.equal(out.nudge, false);
    assert.equal(out.contentTokens, 0);
});

test('shouldShowCompactionPrompt honors opts.thresholdTokens override', () => {
    const out = shouldShowCompactionPrompt(
        { uid: 1, content: 'a'.repeat(40) }, // 10 tokens
        { thresholdTokens: 5 },
    );
    assert.equal(out.nudge, true);
    assert.equal(out.threshold, 5);
});

// ----------------------------------------------------------------------------
// runNudgeSweepForCurrentChat — the P4.4 sentinel wire point (DI validator)
// ----------------------------------------------------------------------------

test('runNudgeSweepForCurrentChat returns null without an injected validator', async () => {
    assert.equal(await runNudgeSweepForCurrentChat({}, {}), null);
    assert.equal(await runNudgeSweepForCurrentChat({}, { validateLorebook: 'nope' }), null);
});

test('runNudgeSweepForCurrentChat passes skipAutoCreate=true (a nudge never creates a lorebook)', async () => {
    const calls = [];
    await runNudgeSweepForCurrentChat({}, {
        validateLorebook: async (skipAutoCreate) => { calls.push(skipAutoCreate); return { valid: false }; },
    });
    assert.deepEqual(calls, [true]);
});

test('runNudgeSweepForCurrentChat returns null for an invalid lorebook', async () => {
    const out = await runNudgeSweepForCurrentChat({}, {
        validateLorebook: async () => ({ valid: false }),
    });
    assert.equal(out, null);
});

test('runNudgeSweepForCurrentChat never throws when the validator rejects', async () => {
    const out = await runNudgeSweepForCurrentChat({}, {
        validateLorebook: async () => { throw new Error('lorebook exploded'); },
    });
    assert.equal(out, null, 'an advisory nudge must not propagate a failure');
});

test('runNudgeSweepForCurrentChat sweeps a valid lorebook and reports compaction candidates', async () => {
    const bloated = 'x'.repeat(40000); // ~10K tokens, well over the 4K default
    const out = await runNudgeSweepForCurrentChat({}, {
        validateLorebook: async () => ({
            valid: true,
            name: 'Test Book',
            data: {
                entries: {
                    '1': { uid: 1, stmemorybooks: true, tier: 1, comment: 'Small', content: 'short' },
                    '2': { uid: 2, stmemorybooks: true, tier: 1, comment: 'Bloated', content: bloated },
                },
            },
        }),
    });
    assert.ok(out, 'expected a sweep result for a valid lorebook');
    assert.equal(out.memoryCount, 2);
    assert.equal(out.compactions.length, 1, 'only the oversized entry should be nudged');
    assert.equal(out.compactions[0].uid, 2);
});

// ----------------------------------------------------------------------------
// P4.5 — repetition gating (review.js helpers injected through opts)
// ----------------------------------------------------------------------------

const BLOATED = 'x'.repeat(40000); // ~10K tokens, well over the 4K default

/** A lorebook with `readyCount` tier-1 entries, one of which is oversized. */
function makeLorebook(readyCount = 0) {
    const entries = { '2': { uid: 2, stmemorybooks: true, tier: 1, comment: 'Bloated', content: BLOATED } };
    for (let i = 0; i < readyCount; i++) {
        entries[`1${i}`] = { uid: 100 + i, stmemorybooks: true, tier: 1, comment: `M${i}`, content: 'short' };
    }
    return async () => ({ valid: true, name: 'Test Book', data: { entries } });
}

/** In-memory stand-in for review.js's chat_metadata-backed gating state. */
function makeGate() {
    const state = { scenes: 0, nudged: new Set() };
    return {
        state,
        opts: {
            bumpScenesSinceConsolidationNudge: (reset = false) => (state.scenes = reset ? 0 : state.scenes + 1),
            wasCompactionNudged: (uid) => state.nudged.has(String(uid)),
            markCompactionNudged: (uid) => state.nudged.add(String(uid)),
        },
    };
}

test('P4.5: compaction nudge fires once per uid, then is suppressed (not silently dropped)', async () => {
    const gate = makeGate();
    const validateLorebook = makeLorebook();

    const first = await runNudgeSweepForCurrentChat({}, { validateLorebook, ...gate.opts });
    assert.equal(first.compactions.length, 1, 'first sweep should surface the oversized entry');
    assert.equal(first.compactionsSuppressed, 0);
    assert.ok(gate.state.nudged.has('2'), 'markCompactionNudged should have recorded the uid');

    const second = await runNudgeSweepForCurrentChat({}, { validateLorebook, ...gate.opts });
    assert.equal(second.compactions.length, 0, 'the same uid must not re-nudge on the next scene');
    assert.equal(second.compactionsSuppressed, 1, 'the suppressed uid must still be reported');
});

test('P4.5: without the injected gate, compaction re-nudges every sweep (back-compat)', async () => {
    const validateLorebook = makeLorebook();
    const a = await runNudgeSweepForCurrentChat({}, { validateLorebook });
    const b = await runNudgeSweepForCurrentChat({}, { validateLorebook });
    assert.equal(a.compactions.length, 1);
    assert.equal(b.compactions.length, 1, 'ungated behavior is unchanged');
    assert.equal(b.compactionsSuppressed, 0);
});

test('P4.5: consolidation nudge is withheld until the scene interval is reached, then resets', async () => {
    const gate = makeGate();
    // 20 eligible tier-1 entries: the eligibility check is satisfied from sweep 1,
    // so only the scene interval can hold the nudge back.
    const validateLorebook = makeLorebook(20);
    const opts = { validateLorebook, ...gate.opts, consolidationNudgeInterval: 3 };

    const s1 = await runNudgeSweepForCurrentChat({}, opts);
    assert.equal(s1.scenesSinceConsolidationNudge, 1);
    assert.equal(s1.consolidation.prompted, false, 'scene 1 of 3 must not nudge');
    assert.equal(s1.consolidation.reason, 'nudge-interval-not-reached');

    await runNudgeSweepForCurrentChat({}, opts); // scene 2

    const s3 = await runNudgeSweepForCurrentChat({}, opts);
    assert.equal(s3.consolidation.prompted, true, 'the interval is reached at scene 3');
    assert.equal(gate.state.scenes, 0, 'a delivered nudge resets the counter');

    const s4 = await runNudgeSweepForCurrentChat({}, opts);
    assert.equal(s4.consolidation.prompted, false, 'the very next scene must not re-nudge');
});

test('P4.5: a withheld consolidation nudge does not reset the counter', async () => {
    const gate = makeGate();
    // No eligible entries, so maybePromptConsolidation would decline anyway;
    // the counter must keep climbing rather than resetting on a non-nudge.
    const opts = { validateLorebook: makeLorebook(0), ...gate.opts, consolidationNudgeInterval: 2 };
    await runNudgeSweepForCurrentChat({}, opts);
    await runNudgeSweepForCurrentChat({}, opts);
    const s3 = await runNudgeSweepForCurrentChat({}, opts);
    assert.equal(s3.consolidation.prompted, false);
    assert.equal(gate.state.scenes, 3, 'counter keeps climbing while nothing is offered');
});
