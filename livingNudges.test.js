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
