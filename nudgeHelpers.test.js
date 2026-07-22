// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// nudgeHelpers.test.js — Unit tests for the P4.4 temperature-gradient nudges
// + provenance line helpers.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
    appendProvenanceLine,
    parseSceneRange,
    shouldNudgeConsolidation,
    shouldNudgeCompaction,
    estimateContentTokens,
    summarizeMemoryCount,
    formatConsolidationNudge,
    formatCompactionNudge,
} from './nudgeHelpers.js';

// ----------------------------------------------------------------------------
// parseSceneRange
// ----------------------------------------------------------------------------

test('parseSceneRange parses "X-Y" with hyphen', () => {
    assert.deepEqual(parseSceneRange('3-5'), { start: 3, end: 5 });
});

test('parseSceneRange parses "X–Y" with en-dash and other separators', () => {
    assert.deepEqual(parseSceneRange('3 – 5'), { start: 3, end: 5 });
    assert.deepEqual(parseSceneRange('3—5'), { start: 3, end: 5 });
});

test('parseSceneRange accepts object input', () => {
    assert.deepEqual(parseSceneRange({ start: 10, end: 20 }), { start: 10, end: 20 });
});

test('parseSceneRange returns null for invalid input', () => {
    assert.equal(parseSceneRange(null), null);
    assert.equal(parseSceneRange(undefined), null);
    assert.equal(parseSceneRange(''), null);
    assert.equal(parseSceneRange('abc'), null);
    assert.equal(parseSceneRange('3'), null);
    assert.equal(parseSceneRange('5-3'), null); // end < start
    assert.equal(parseSceneRange({ start: 0, end: 5 }), null); // start < 1
    assert.equal(parseSceneRange({ start: 'x', end: 5 }), null); // non-int
});

test('parseSceneRange handles whitespace and surrounding garbage', () => {
    assert.deepEqual(parseSceneRange('  12 - 34  '), { start: 12, end: 34 });
});

// ----------------------------------------------------------------------------
// appendProvenanceLine
// ----------------------------------------------------------------------------

test('appendProvenanceLine appends a src: msgs line', () => {
    const out = appendProvenanceLine('Some memory content.', '3-5');
    assert.match(out, /Some memory content\./);
    // The output contains "src: msgs 3–5" (en-dash, U+2013, between digits)
    assert.match(out, /src: msgs 3\u20135/);
});

test('appendProvenanceLine is idempotent (does not double-append same range)', () => {
    const once = appendProvenanceLine('Content.', '3-5');
    const twice = appendProvenanceLine(once, '3-5');
    assert.equal(once, twice);
});

test('appendProvenanceLine appends a different range as a second line', () => {
    const out = appendProvenanceLine(appendProvenanceLine('Content A.', '3-5'), '7-9');
    assert.match(out, /Content A\./);
    assert.match(out, /src: msgs 3\u20135/);
    assert.match(out, /src: msgs 7\u20139/);
});

test('appendProvenanceLine handles object sceneRange', () => {
    const out = appendProvenanceLine('Content.', { start: 12, end: 34 });
    assert.match(out, /src: msgs 12\u201334/);
});

test('appendProvenanceLine returns content unchanged when range is invalid', () => {
    const input = 'Content.';
    assert.equal(appendProvenanceLine(input, null), input);
    assert.equal(appendProvenanceLine(input, ''), input);
    assert.equal(appendProvenanceLine(input, 'bad'), input);
    assert.equal(appendProvenanceLine(input, '5-3'), input);
});

test('appendProvenanceLine accepts null/empty content gracefully', () => {
    const out = appendProvenanceLine(null, '3-5');
    assert.match(out, /src: msgs 3\u20135/);
    const empty = appendProvenanceLine('', '3-5');
    assert.match(empty, /src: msgs 3\u20135/);
});

// ----------------------------------------------------------------------------
// shouldNudgeConsolidation
// ----------------------------------------------------------------------------

test('shouldNudgeConsolidation defaults to threshold 20', () => {
    const r = shouldNudgeConsolidation({ eligibleCount: 20, requiredMin: 5, tier: 2 });
    assert.equal(r.nudge, true);
    assert.match(r.reason, /eligible-entries-20-gte-threshold-20/);
    assert.equal(r.tier, 2);
});

test('shouldNudgeConsolidation below threshold returns false', () => {
    const r = shouldNudgeConsolidation({ eligibleCount: 19, requiredMin: 5, tier: 2 });
    assert.equal(r.nudge, false);
    assert.equal(r.reason, 'below-threshold');
});

test('shouldNudgeConsolidation respects required-min', () => {
    const r = shouldNudgeConsolidation({ eligibleCount: 25, requiredMin: 30, tier: 2 });
    assert.equal(r.nudge, false);
    assert.equal(r.reason, 'below-required-min');
});

test('shouldNudgeConsolidation honors opts.threshold override', () => {
    const r = shouldNudgeConsolidation({ eligibleCount: 10, requiredMin: 5, tier: 1 }, { threshold: 5 });
    assert.equal(r.nudge, true);
});

test('shouldNudgeConsolidation returns false when promptEnabled is false', () => {
    const r = shouldNudgeConsolidation({
        eligibleCount: 100,
        requiredMin: 5,
        tier: 2,
        promptEnabled: false,
    });
    assert.equal(r.nudge, false);
    assert.equal(r.reason, 'prompt-disabled');
});

test('shouldNudgeConsolidation handles missing/garbage input', () => {
    const r = shouldNudgeConsolidation({});
    assert.equal(r.nudge, false);
    assert.equal(r.reason, 'below-threshold');
});

test('shouldNudgeConsolidation tier defaults to 1', () => {
    const r = shouldNudgeConsolidation({ eligibleCount: 100 });
    assert.equal(r.tier, 1);
});

// ----------------------------------------------------------------------------
// shouldNudgeCompaction
// ----------------------------------------------------------------------------

test('shouldNudgeCompaction returns false for short content', () => {
    const r = shouldNudgeCompaction({ uid: 1, content: 'short' });
    assert.equal(r.nudge, false);
    assert.match(r.reason, /lt-threshold/);
    assert.ok(r.contentTokens < 4000);
});

test('shouldNudgeCompaction nudges for long content (default threshold 4000)', () => {
    const longContent = 'a'.repeat(20_000); // ≈ 5000 tokens at char/4
    const r = shouldNudgeCompaction({ uid: 1, content: longContent });
    assert.equal(r.nudge, true);
    assert.match(r.reason, /gte-threshold-4000/);
    assert.equal(r.contentTokens, 5000);
});

test('shouldNudgeCompaction respects opts.thresholdTokens override', () => {
    const r = shouldNudgeCompaction({ uid: 1, content: 'short' }, { thresholdTokens: 1 });
    assert.equal(r.nudge, true);
    assert.equal(r.threshold, 1);
});

test('shouldNudgeCompaction uses pre-computed tokens if provided', () => {
    const r = shouldNudgeCompaction({ uid: 1, content: 'ignored', tokens: 5000 });
    assert.equal(r.nudge, true);
    assert.equal(r.contentTokens, 5000);
});

test('shouldNudgeCompaction handles null/garbage gracefully', () => {
    const r = shouldNudgeCompaction(null);
    assert.equal(r.nudge, false);
    assert.equal(r.contentTokens, 0);
});

test('shouldNudgeCompaction handles empty content', () => {
    const r = shouldNudgeCompaction({ uid: 1, content: '' });
    assert.equal(r.nudge, false);
    assert.equal(r.contentTokens, 0);
});

// ----------------------------------------------------------------------------
// estimateContentTokens
// ----------------------------------------------------------------------------

test('estimateContentTokens uses char/4 ratio', () => {
    assert.equal(estimateContentTokens(''), 0);
    assert.equal(estimateContentTokens('abcd'), 1);
    assert.equal(estimateContentTokens('a'.repeat(4)), 1);
    assert.equal(estimateContentTokens('a'.repeat(5)), 2); // ceil
    assert.equal(estimateContentTokens('a'.repeat(4000)), 1000);
});

test('estimateContentTokens handles null', () => {
    assert.equal(estimateContentTokens(null), 0);
    assert.equal(estimateContentTokens(undefined), 0);
});

// ----------------------------------------------------------------------------
// summarizeMemoryCount
// ----------------------------------------------------------------------------

test('summarizeMemoryCount counts stmemorybooks entries', () => {
    const lb = {
        entries: {
            '1': { stmemorybooks: true, tier: 1 },
            '2': { stmemorybooks: true, tier: 1 },
            '3': { stmemorybooks: true, tier: 2 },
            '4': { stmemorybooks: false, tier: 3 }, // not a memory
            '5': { tier: 3 }, // no flag
        },
    };
    assert.equal(summarizeMemoryCount(lb), 3);
});

test('summarizeMemoryCount respects tier filter', () => {
    const lb = {
        entries: {
            '1': { stmemorybooks: true, tier: 1 },
            '2': { stmemorybooks: true, tier: 1 },
            '3': { stmemorybooks: true, tier: 2 },
            '4': { stmemorybooks: true, tier: 3 },
        },
    };
    assert.equal(summarizeMemoryCount(lb, { tiers: [1] }), 2);
    assert.equal(summarizeMemoryCount(lb, { tiers: [2, 3] }), 2);
    // Empty tiers filter (no array passed) means no filter — count all
    assert.equal(summarizeMemoryCount(lb), 4);
});

test('summarizeMemoryCount handles missing/malformed input', () => {
    assert.equal(summarizeMemoryCount(null), 0);
    assert.equal(summarizeMemoryCount(undefined), 0);
    assert.equal(summarizeMemoryCount({}), 0);
    assert.equal(summarizeMemoryCount({ entries: null }), 0);
    assert.equal(summarizeMemoryCount({ entries: 'garbage' }), 0);
});

// ----------------------------------------------------------------------------
// formatConsolidationNudge / formatCompactionNudge
// ----------------------------------------------------------------------------

test('formatConsolidationNudge returns empty string when nudge is false', () => {
    assert.equal(formatConsolidationNudge({ nudge: false }), '');
});

test('formatConsolidationNudge formats a one-liner when nudge is true', () => {
    const line = formatConsolidationNudge({ nudge: true, eligible: 22, required: 5, tier: 2 });
    assert.match(line, /Consolidation available/);
    assert.match(line, /22/);
    assert.match(line, /tier 1/);
    assert.match(line, /tier 2/);
    assert.match(line, /threshold 5/);
});

test('formatCompactionNudge returns empty string when nudge is false', () => {
    assert.equal(formatCompactionNudge({ title: 'X', nudge: { nudge: false } }), '');
});

test('formatCompactionNudge formats with title and token count', () => {
    const line = formatCompactionNudge({
        title: 'Grondulf the troll',
        nudge: { nudge: true, contentTokens: 5000, threshold: 4000 },
    });
    assert.match(line, /Compaction suggested/);
    assert.match(line, /Grondulf the troll/);
    assert.match(line, /5000 tokens/);
    assert.match(line, /threshold 4000/);
});

test('formatCompactionNudge handles missing title', () => {
    const line = formatCompactionNudge({
        nudge: { nudge: true, contentTokens: 5000, threshold: 4000 },
    });
    assert.match(line, /\(untitled\)/);
});
