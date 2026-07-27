// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// eval/score.js — Scene-boundary scoring for STMB-Auto Phase 0
//
// Pure scoring module. Compares a list of predicted boundary message indices
// against a list of ground-truth boundary message indices at one or more
// message-tolerance windows (±N). Returns precision/recall/F1 plus a
// per-boundary table for inspection.
//
// Definitions (matches §3.1–3.2 of eval/materials/stmb-auto/stmb-auto-plan.md):
//   - A message index is the 1-based position of a chat message (i.e. the
//     n-th turn of the chat). Line 1 of a SillyTavern JSONL is the
//     chat_metadata header and is NOT counted; the first real message is
//     index 1.
//   - "Begins a new scene" = the predicted/ground-truth list contains this
//     message index.
//   - A predicted boundary p matches a ground-truth boundary g iff
//     |p - g| <= tolerance. This is set-membership: one prediction can match
//     at most one ground truth (the closest unmatched one), and vice versa.
//   - Precision = matched_predictions / total_predictions (0 if no predictions)
//   - Recall    = matched_ground_truth / total_ground_truth (0 if none)
//   - F1        = 2 * P * R / (P + R), 0 if both P and R are 0
//
// The matching algorithm is greedy nearest-first on each side, deterministic,
// and stable. Boundaries outside [1, message_count] are filtered before
// scoring (counted as neither matched nor unmatched).

import assert from 'node:assert/strict';

/**
 * Score predicted scene boundaries against ground truth at ±tolerance.
 *
 * @param {Object} args
 * @param {number[]} args.predicted      - Predicted boundary message indices (1-based).
 * @param {number[]} args.groundTruth    - Ground-truth boundary message indices (1-based).
 * @param {number}   args.tolerance      - Match tolerance in messages (e.g. 1 or 2).
 * @param {number}  [args.messageCount]  - Optional total chat length; indices outside
 *                                         [1, messageCount] are filtered.
 * @returns {{
 *   tolerance: number,
 *   predictedCount: number,
 *   groundTruthCount: number,
 *   truePositives: number,
 *   falsePositives: number,
 *   falseNegatives: number,
 *   precision: number,
 *   recall: number,
 *   f1: number,
 *   perBoundary: Array<{gt: number, matched: number|null, distance: number|null}>,
 *   unmatchedPredictions: number[]
 * }}
 */
export function scoreBoundaries({ predicted, groundTruth, tolerance, messageCount } = {}) {
    assert.ok(Number.isInteger(tolerance) && tolerance >= 0,
        `tolerance must be a non-negative integer, got ${tolerance}`);

    const filter = (xs) => {
        const out = [];
        const seen = new Set();
        for (const raw of xs) {
            if (!Number.isInteger(raw)) continue;
            if (raw < 1) continue;
            if (messageCount != null && raw > messageCount) continue;
            if (seen.has(raw)) continue;
            seen.add(raw);
            out.push(raw);
        }
        out.sort((a, b) => a - b);
        return out;
    };

    const pred = filter(Array.isArray(predicted) ? predicted : []);
    const truth = filter(Array.isArray(groundTruth) ? groundTruth : []);

    // Greedy nearest-first matching.
    // Sort each side by index; walk both pointers; at each step, decide which
    // prediction–ground-truth pair is the closest unmatched cross.
    // Greedy by index order is fine because indices are 1-D: at any cursor
    // position the only way to make progress is to consume the smaller side.
    let i = 0, j = 0;
    const matchedPredictions = new Set();
    const matchedGroundTruth = new Map(); // gt -> { matched, distance }
    const unmatchedPredictions = [];

    while (i < pred.length && j < truth.length) {
        const p = pred[i];
        const g = truth[j];
        const dist = Math.abs(p - g);
        if (dist <= tolerance) {
            matchedPredictions.add(p);
            matchedGroundTruth.set(g, { matched: p, distance: dist });
            i++;
            j++;
        } else if (p < g) {
            // p is too far left of g; p has no match to the left and any future
            // ground truth is >= g > p, so p can't be in tolerance of any future
            // g. Same goes the other way symmetrically.
            unmatchedPredictions.push(p);
            i++;
        } else {
            // g < p - tolerance: this ground truth is not matched by p, and
            // any future prediction is >= p > g + tolerance, so it can't be
            // matched either. Skip g.
            j++;
        }
    }
    // Remaining predictions are unmatched.
    while (i < pred.length) unmatchedPredictions.push(pred[i++]);

    const tp = matchedPredictions.size;
    const fp = unmatchedPredictions.length + (pred.length - tp - unmatchedPredictions.length);
    // The above simplifies to: fp = pred.length - tp.
    const fn = truth.length - matchedGroundTruth.size;
    const precision = pred.length === 0 ? 0 : tp / pred.length;
    const recall = truth.length === 0 ? 0 : matchedGroundTruth.size / truth.length;
    const f1 = (precision + recall === 0) ? 0 : (2 * precision * recall) / (precision + recall);

    // Per-boundary table over ground truth (so a reader can see which scenes
    // were missed, and which prediction caught them).
    const perBoundary = truth.map((g) => {
        const m = matchedGroundTruth.get(g);
        return m
            ? { gt: g, matched: m.matched, distance: m.distance }
            : { gt: g, matched: null, distance: null };
    });

    return {
        tolerance,
        predictedCount: pred.length,
        groundTruthCount: truth.length,
        truePositives: tp,
        falsePositives: pred.length - tp,
        falseNegatives: fn,
        precision,
        recall,
        f1,
        perBoundary,
        unmatchedPredictions,
    };
}

/**
 * Score at multiple tolerances in one call.
 *
 * @param {Object} args
 * @param {number[]} args.predicted
 * @param {number[]} args.groundTruth
 * @param {number[]} [args.tolerances=[1, 2]]
 * @param {number}   [args.messageCount]
 * @returns {Array<ReturnType<typeof scoreBoundaries>>}
 */
export function scoreAtTolerances({ predicted, groundTruth, tolerances = [1, 2], messageCount } = {}) {
    return tolerances.map((t) => scoreBoundaries({ predicted, groundTruth, tolerance: t, messageCount }));
}

/**
 * Format a single-tolerance score as a one-line summary string.
 *
 * @param {ReturnType<typeof scoreBoundaries>} s
 * @returns {string} e.g. "±1: P=0.93 R=0.74 F1=0.83 (TP=43 FP=3 FN=15 of 58/46)"
 */
export function formatScoreLine(s) {
    return `±${s.tolerance}: P=${s.precision.toFixed(2)} R=${s.recall.toFixed(2)} F1=${s.f1.toFixed(2)} ` +
        `(TP=${s.truePositives} FP=${s.falsePositives} FN=${s.falseNegatives} ` +
        `of pred=${s.predictedCount} gt=${s.groundTruthCount})`;
}

/**
 * Format a full multi-tolerance report as Markdown.
 *
 * @param {ReturnType<typeof scoreAtTolerances>} results
 * @param {Object} [meta]
 * @param {string} [meta.title]
 * @param {Object} [meta.config]
 * @param {number} [meta.messageCount]
 * @param {string} [meta.runAt]
 * @returns {string}
 */
export function formatMarkdownReport(results, meta = {}) {
    const title = meta.title ?? 'Scene boundary scoring report';
    const lines = [];
    lines.push(`# ${title}`);
    lines.push('');
    if (meta.runAt) lines.push(`_Run at: ${meta.runAt}_`);
    if (meta.messageCount != null) lines.push(`_Messages scored: ${meta.messageCount}_`);
    if (meta.config && Object.keys(meta.config).length > 0) {
        lines.push('');
        lines.push('## Config');
        lines.push('');
        for (const [k, v] of Object.entries(meta.config)) {
            lines.push(`- **${k}**: ${typeof v === 'string' ? v : JSON.stringify(v)}`);
        }
    }
    lines.push('');
    lines.push('## Summary');
    lines.push('');
    lines.push('| Tolerance | Precision | Recall | F1 | TP | FP | FN |');
    lines.push('| --- | --- | --- | --- | --- | --- | --- |');
    for (const s of results) {
        lines.push(`| ±${s.tolerance} | ${s.precision.toFixed(4)} | ${s.recall.toFixed(4)} | ${s.f1.toFixed(4)} | ${s.truePositives} | ${s.falsePositives} | ${s.falseNegatives} |`);
    }
    lines.push('');

    // Per-boundary table for the tightest tolerance.
    const tightest = results[0];
    if (tightest && tightest.perBoundary.length > 0) {
        lines.push(`## Per-boundary table (tolerance ±${tightest.tolerance})`);
        lines.push('');
        lines.push('| Ground truth | Matched prediction | Distance |');
        lines.push('| --- | --- | --- |');
        for (const row of tightest.perBoundary) {
            const matched = row.matched == null ? '— (missed)' : String(row.matched);
            const distance = row.distance == null ? '—' : String(row.distance);
            lines.push(`| ${row.gt} | ${matched} | ${distance} |`);
        }
        lines.push('');

        if (tightest.unmatchedPredictions.length > 0) {
            lines.push(`## Hallucinated predictions (${tightest.unmatchedPredictions.length})`);
            lines.push('');
            for (const p of tightest.unmatchedPredictions) {
                lines.push(`- ${p}`);
            }
            lines.push('');
        }
    }

    return lines.join('\n');
}