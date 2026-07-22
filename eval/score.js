#!/usr/bin/env node
/**
 * STMB-Auto Phase 0 — scorer.
 *
 * Scores a predictions file (run-detection.js output) against ground-truth
 * labels (derive-labels.js output). Reports precision/recall at ±1 and ±2
 * message tolerance, against both the raw (58) and merged (32) boundary sets
 * (stmb-auto-plan.md §3.1–3.2).
 *
 * Precision is scored against the RAW set: the plan's key finding is that
 * every prediction lands on a real transition, including micro-hops the
 * merged ground truth collapsed — a prediction on a raw boundary is correct
 * even if merging removed it. Recall is reported against both sets; the
 * merged set is the one the plan's recall numbers refer to.
 *
 * The trivial chat-opening boundary (id 0, and any ground-truth start inside
 * the first window's guard-free head is still real) is excluded from both
 * sides: scene 0 always exists and no window is asked to "detect" it.
 *
 * Usage:
 *   node eval/score.js --predictions eval/out/predictions.json \
 *     --labels eval/out/labels.json [--json]
 */

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);

function parseArgs(argv) {
    const opts = { predictions: null, labels: null, json: false };
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--predictions') opts.predictions = argv[++i];
        else if (a === '--labels') opts.labels = argv[++i];
        else if (a === '--json') opts.json = true;
        else throw new Error(`Unknown argument: ${a}`);
    }
    if (!opts.predictions || !opts.labels) {
        throw new Error('--predictions and --labels are required');
    }
    return opts;
}

function within(a, b, tol) {
    return Math.abs(a - b) <= tol;
}

/** precision: fraction of predictions within tol of some truth boundary. */
function precisionAt(predictions, truth, tol) {
    if (!predictions.length) return { hit: 0, total: 0, value: null };
    const hit = predictions.filter(p => truth.some(t => within(p, t, tol))).length;
    return { hit, total: predictions.length, value: hit / predictions.length };
}

/** recall: fraction of truth boundaries with some prediction within tol. */
function recallAt(predictions, truth, tol) {
    if (!truth.length) return { hit: 0, total: 0, value: null };
    const hit = truth.filter(t => predictions.some(p => within(p, t, tol))).length;
    return { hit, total: truth.length, value: hit / truth.length };
}

function score(predictions, labels) {
    const preds = predictions.predictions.filter(id => id !== 0);
    const raw = labels.raw.filter(id => id !== 0);
    const merged = labels.merged.filter(id => id !== 0);
    const tolerances = [1, 2];
    const report = { predictions: preds.length, raw: raw.length, merged: merged.length, metrics: {} };
    for (const tol of tolerances) {
        report.metrics[`±${tol}`] = {
            precision_vs_raw: precisionAt(preds, raw, tol),
            precision_vs_merged: precisionAt(preds, merged, tol),
            recall_vs_raw: recallAt(preds, raw, tol),
            recall_vs_merged: recallAt(preds, merged, tol),
        };
    }
    report.falsePositives_vs_raw_tol1 = preds.filter(p => !raw.some(t => within(p, t, 1)));
    return report;
}

function fmt(m) {
    return m.value === null ? 'n/a' : `${m.value.toFixed(3)} (${m.hit}/${m.total})`;
}

function main() {
    const opts = parseArgs(process.argv);
    const predictions = JSON.parse(fs.readFileSync(opts.predictions, 'utf8'));
    const labels = JSON.parse(fs.readFileSync(opts.labels, 'utf8'));
    const report = score(predictions, labels);
    if (opts.json) {
        console.log(JSON.stringify(report, null, 2));
        return;
    }
    console.log(`predictions=${report.predictions} raw-truth=${report.raw} merged-truth=${report.merged}`);
    for (const [tol, m] of Object.entries(report.metrics)) {
        console.log(`  ${tol}: precision(raw)=${fmt(m.precision_vs_raw)} precision(merged)=${fmt(m.precision_vs_merged)} recall(raw)=${fmt(m.recall_vs_raw)} recall(merged)=${fmt(m.recall_vs_merged)}`);
    }
    if (report.falsePositives_vs_raw_tol1.length) {
        console.log(`  false positives vs raw @±1: [${report.falsePositives_vs_raw_tol1.join(', ')}]`);
    }
}

if (process.argv[1] === __filename) main();

export { score, precisionAt, recallAt };
