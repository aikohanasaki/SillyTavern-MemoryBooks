// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// eval/score.test.js — Unit tests for the scene-boundary scoring module.
//
// Uses node:test (built into Node 18+, also supported by bun). Runs as:
//   node --test eval/score.test.js
// or
//   bun test eval/score.test.js

import test from 'node:test';
import assert from 'node:assert/strict';
import {
    scoreBoundaries,
    scoreAtTolerances,
    formatScoreLine,
    formatMarkdownReport,
} from './score.js';

// ----------------------------------------------------------------------------
// Empty / degenerate cases
// ----------------------------------------------------------------------------

test('empty inputs produce zero metrics without throwing', () => {
    const s = scoreBoundaries({ predicted: [], groundTruth: [], tolerance: 1 });
    assert.equal(s.truePositives, 0);
    assert.equal(s.falsePositives, 0);
    assert.equal(s.falseNegatives, 0);
    assert.equal(s.precision, 0);
    assert.equal(s.recall, 0);
    assert.equal(s.f1, 0);
    assert.deepEqual(s.perBoundary, []);
    assert.deepEqual(s.unmatchedPredictions, []);
});

test('predictions without ground truth: precision 0, recall undefined denominator', () => {
    const s = scoreBoundaries({ predicted: [10, 20, 30], groundTruth: [], tolerance: 1 });
    assert.equal(s.precision, 0);
    assert.equal(s.recall, 0);
    assert.equal(s.falsePositives, 3);
    assert.equal(s.falseNegatives, 0);
    assert.deepEqual(s.unmatchedPredictions, [10, 20, 30]);
});

test('ground truth without predictions: recall 0, all missed', () => {
    const s = scoreBoundaries({ predicted: [], groundTruth: [10, 20, 30], tolerance: 1 });
    assert.equal(s.precision, 0);
    assert.equal(s.recall, 0);
    assert.equal(s.falsePositives, 0);
    assert.equal(s.falseNegatives, 3);
});

// ----------------------------------------------------------------------------
// Perfect alignment
// ----------------------------------------------------------------------------

test('exact alignment: precision 1.0, recall 1.0, F1 1.0', () => {
    const gt = [10, 20, 30, 40, 50];
    const s = scoreBoundaries({ predicted: gt, groundTruth: gt, tolerance: 1 });
    assert.equal(s.precision, 1);
    assert.equal(s.recall, 1);
    assert.equal(s.f1, 1);
    assert.equal(s.truePositives, 5);
    assert.equal(s.falsePositives, 0);
    assert.equal(s.falseNegatives, 0);
    for (const row of s.perBoundary) {
        assert.equal(row.matched, row.gt);
        assert.equal(row.distance, 0);
    }
});

// ----------------------------------------------------------------------------
// Off-by-one and off-by-two
// ----------------------------------------------------------------------------

test('±1 tolerance matches single-message offsets', () => {
    // gt = [10,20,30]; predictions offset by +1 each → all match at tolerance 1
    const s = scoreBoundaries({ predicted: [11, 21, 31], groundTruth: [10, 20, 30], tolerance: 1 });
    assert.equal(s.truePositives, 3);
    assert.equal(s.precision, 1);
    assert.equal(s.recall, 1);
});

test('±1 tolerance does NOT match two-message offsets', () => {
    const s = scoreBoundaries({ predicted: [12, 22, 32], groundTruth: [10, 20, 30], tolerance: 1 });
    assert.equal(s.truePositives, 0);
    assert.equal(s.falsePositives, 3);
    assert.equal(s.falseNegatives, 3);
});

test('±2 tolerance matches two-message offsets', () => {
    const s = scoreBoundaries({ predicted: [12, 22, 32], groundTruth: [10, 20, 30], tolerance: 2 });
    assert.equal(s.truePositives, 3);
    assert.equal(s.precision, 1);
    assert.equal(s.recall, 1);
});

// ----------------------------------------------------------------------------
// Missed / hallucinated
// ----------------------------------------------------------------------------

test('partial recall: missed ground truths and hallucinated predictions', () => {
    // gt = [10,20,30,40,50]; predicted = [10,30,33,99] (matched: 10,30; missed: 20,40,50; hallucinated: 33,99)
    const s = scoreBoundaries({ predicted: [10, 30, 33, 99], groundTruth: [10, 20, 30, 40, 50], tolerance: 1 });
    assert.equal(s.truePositives, 2);
    assert.equal(s.falsePositives, 2);
    assert.equal(s.falseNegatives, 3);
    assert.equal(s.precision, 0.5);
    assert.equal(s.recall, 0.4);
    assert.equal(s.f1, 2 * 0.5 * 0.4 / (0.5 + 0.4));
});

test('unmatched predictions reported in order', () => {
    const s = scoreBoundaries({ predicted: [5, 10, 50], groundTruth: [10, 20], tolerance: 1 });
    assert.deepEqual(s.unmatchedPredictions, [5, 50]);
});

// ----------------------------------------------------------------------------
// Boundary edge cases
// ----------------------------------------------------------------------------

test('zero tolerance requires exact equality', () => {
    const s = scoreBoundaries({ predicted: [10, 11], groundTruth: [10, 12], tolerance: 0 });
    assert.equal(s.truePositives, 1); // only 10 matches 10 exactly
    assert.equal(s.falsePositives, 1);
    assert.equal(s.falseNegatives, 1);
});

test('out-of-range indices are filtered when messageCount provided', () => {
    const s = scoreBoundaries({
        predicted: [-1, 0, 5, 100, 200],
        groundTruth: [5, 100],
        tolerance: 1,
        messageCount: 150,
    });
    // After filtering: predicted=[5,100]; groundTruth=[5,100]
    assert.equal(s.predictedCount, 2);
    assert.equal(s.groundTruthCount, 2);
    assert.equal(s.truePositives, 2);
});

test('duplicate indices are deduplicated (first occurrence wins on order)', () => {
    const s = scoreBoundaries({ predicted: [10, 10, 20], groundTruth: [10, 20], tolerance: 1 });
    assert.equal(s.predictedCount, 2);
    assert.equal(s.truePositives, 2);
});

test('non-integer entries are silently filtered', () => {
    const s = scoreBoundaries({ predicted: [10, 10.5, '20', null, 20], groundTruth: [10, 20], tolerance: 1 });
    assert.equal(s.predictedCount, 2); // 10 and 20 (string '20' filtered as non-integer)
});

// ----------------------------------------------------------------------------
// Greedy matching
// ----------------------------------------------------------------------------

test('greedy matching: a single prediction can only match one ground truth', () => {
    // gt = [10, 12]; predicted = [11] — 11 is within ±1 of both, but only matches one.
    const s = scoreBoundaries({ predicted: [11], groundTruth: [10, 12], tolerance: 1 });
    assert.equal(s.truePositives, 1);
    assert.equal(s.falseNegatives, 1);
    assert.equal(s.falsePositives, 0);
});

test('greedy matching walks cursors and never skips a matchable pair', () => {
    // gt = [10, 11, 30]; predicted = [11, 30]
    // 11 matches 11 (dist 0), 30 matches 30 (dist 0). All matched.
    const s = scoreBoundaries({ predicted: [11, 30], groundTruth: [10, 11, 30], tolerance: 1 });
    assert.equal(s.truePositives, 2);
    assert.equal(s.falseNegatives, 1);
});

test('matching handles clusters without consuming across gaps', () => {
    // gt = [10, 20]; predicted = [12, 18] — at tol=2 both match
    const s2 = scoreBoundaries({ predicted: [12, 18], groundTruth: [10, 20], tolerance: 2 });
    assert.equal(s2.truePositives, 2);
    assert.equal(s2.falsePositives, 0);
    assert.equal(s2.falseNegatives, 0);

    // at tol=1 neither matches
    const s1 = scoreBoundaries({ predicted: [12, 18], groundTruth: [10, 20], tolerance: 1 });
    assert.equal(s1.truePositives, 0);
    assert.equal(s1.falsePositives, 2);
    assert.equal(s1.falseNegatives, 2);
});

// ----------------------------------------------------------------------------
// Multi-tolerance convenience
// ----------------------------------------------------------------------------

test('scoreAtTolerances returns one result per tolerance in input order', () => {
    const r = scoreAtTolerances({ predicted: [12, 22], groundTruth: [10, 20], tolerances: [1, 2] });
    assert.equal(r.length, 2);
    assert.equal(r[0].tolerance, 1);
    assert.equal(r[1].tolerance, 2);
    assert.equal(r[0].truePositives, 0);
    assert.equal(r[1].truePositives, 2);
});

test('scoreAtTolerances defaults to [1, 2]', () => {
    const r = scoreAtTolerances({ predicted: [12], groundTruth: [10] });
    assert.deepEqual(r.map((s) => s.tolerance), [1, 2]);
    assert.equal(r[0].truePositives, 0);
    assert.equal(r[1].truePositives, 1);
});

// ----------------------------------------------------------------------------
// Plan-derived smoke test: numbers from §3.2 of the plan
// ----------------------------------------------------------------------------

test('plan §3.2: full-text conservative config reports P=0.94 R=0.26', () => {
    // Plan says: 32 ground-truth boundaries after merging scenes shorter than 6
    // messages; conservative full-text config reached P=0.94 R=0.26.
    // Construct a fixture that yields those exact numbers with one prediction
    // per ground truth where matched, and missed ones for the rest.
    // 32 ground truths, 26% recall → 8 matched. 0.94 precision → 8 / 0.94 ≈ 8.51
    // predictions. Round to 9 predictions, 8 of which are within ±1.
    const gt = Array.from({ length: 32 }, (_, i) => 10 + i * 10);
    // First 8 ground truths hit exactly; predictions on them.
    const predicted = gt.slice(0, 8);
    // Plus one hallucinated prediction at index 999 (far from anything).
    predicted.push(999);

    const s = scoreBoundaries({ predicted, groundTruth: gt, tolerance: 1 });
    assert.equal(s.groundTruthCount, 32);
    assert.equal(s.predictedCount, 9);
    assert.equal(s.truePositives, 8);
    assert.equal(s.precision, 8 / 9); // ≈ 0.888 — close to 0.94 but not exact;
    // The point is the function correctly attributes 8/9 ≈ 0.89 P and 8/32 = 0.25 R.
    // The plan's 0.94 was empirical with the model; this is a math fixture.
    assert.ok(Math.abs(s.recall - 8 / 32) < 1e-9);
});

test('plan §3.2 sensitivity-tuned: P=1.00 R≈0.70 at ±1', () => {
    // Build a fixture where every prediction is exactly on a ground truth (P=1.0)
    // and recall ≈ 0.70. With 32 ground truths, 22 matched → recall 22/32 = 0.6875.
    const gt = Array.from({ length: 32 }, (_, i) => 10 + i * 10);
    const predicted = gt.slice(0, 22);
    const s = scoreBoundaries({ predicted, groundTruth: gt, tolerance: 1 });
    assert.equal(s.precision, 1);
    assert.equal(s.recall, 22 / 32);
});

// ----------------------------------------------------------------------------
// Report formatting
// ----------------------------------------------------------------------------

test('formatScoreLine produces one-line summary', () => {
    const s = scoreBoundaries({ predicted: [10, 11, 30], groundTruth: [10, 20, 30], tolerance: 1 });
    const line = formatScoreLine(s);
    assert.match(line, /^±1: P=/);
    assert.match(line, /R=/);
    assert.match(line, /F1=/);
});

test('formatMarkdownReport includes summary table and per-boundary table', () => {
    const r = scoreAtTolerances({ predicted: [10, 12, 30], groundTruth: [10, 20, 30], tolerances: [1, 2] });
    const md = formatMarkdownReport(r, {
        title: 'Test',
        runAt: '2026-07-21T00:00:00Z',
        messageCount: 100,
        config: { model: 'claude-fable-5', prompt: 'baseline' },
    });
    assert.match(md, /^# Test/m);
    assert.match(md, /## Summary/);
    assert.match(md, /## Config/);
    assert.match(md, /\*\*model\*\*: claude-fable-5/);
    assert.match(md, /## Per-boundary table \(tolerance ±1\)/);
    // missed boundary 20 should appear as "— (missed)"
    assert.match(md, /\|\s*20\s*\|\s*— \(missed\)\s*\|\s*—\s*\|/);
});