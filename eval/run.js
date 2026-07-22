#!/usr/bin/env node
// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// eval/run.js — One-command pipeline runner for STMB-Auto Phase 0.
//
// Wires together the four Phase 0 stages:
//   1. parseJsonlFile      — SillyTavern JSONL → structured messages
//   2. deriveGroundTruth   — header-derived boundary list (the oracle)
//   3. <Detector>          — header oracle OR stub-from-file OR real LLM call
//   4. scoreAtTolerances   — precision/recall/F1 at ±1 and ±2
//
// Usage:
//   node eval/run.js                    # default: header oracle on the bundled fixture
//   node eval/run.js --detector oracle
//   node eval/run.js --detector stub --predictions path/to/predictions.json
//   node eval/run.js --transcript path/to/chat.jsonl --out eval/reports/latest
//   node eval/run.js --tolerances 1,2,3 --time-jump 90 --min-scene 6
//
// Outputs:
//   <out>/report.md    — Markdown report
//   <out>/report.json  — JSON report (machine-readable)
//   <out>/predictions.json — predicted boundaries + raw responses (for re-runs)
//   <out>/ground-truth.json — derived ground truth (for re-runs)
//   stdout: summary lines + exit code 0 on success, 1 on error.

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseJsonlFile } from './parser.js';
import { deriveGroundTruth } from './groundTruth.js';
import { HeaderOracleDetector, StubDetector, OpenAIDetector, buildDetectionWindows, BASELINE_PROMPT, loadBaselinePrompt } from './detect.js';
import { runDetection } from './runDetection.js';
import { resolveConfig } from './config.js';
import { scoreAtTolerances, formatScoreLine, formatMarkdownReport } from './score.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ----------------------------------------------------------------------------
// CLI argument parsing
// ----------------------------------------------------------------------------

function parseArgs(argv) {
    const args = {
        transcript: resolve(__dirname, 'fixtures/transcript.jsonl'),
        detector: 'oracle',
        predictions: null,
        out: resolve(__dirname, 'reports/latest'),
        tolerances: '1,2',
        timeJump: 90,
        minScene: 6,
        prompt: BASELINE_PROMPT,
        promptFile: null, // resolved later when --detector openai is used
        windowSize: 26,
        windowOverlap: 8,
        truncateChars: 500,
        guardSize: 4,
    };
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        const next = () => argv[++i];
        switch (a) {
            case '--transcript': args.transcript = resolve(next()); break;
            case '--detector': args.detector = next(); break;
            case '--predictions': args.predictions = resolve(next()); break;
            case '--out': args.out = resolve(next()); break;
            case '--tolerances': args.tolerances = next(); break;
            case '--time-jump': args.timeJump = parseInt(next(), 10); break;
            case '--min-scene': args.minScene = parseInt(next(), 10); break;
            case '--prompt': args.prompt = next(); break;
            case '--window-size': args.windowSize = parseInt(next(), 10); break;
            case '--window-overlap': args.windowOverlap = parseInt(next(), 10); break;
            case '--truncate-chars': args.truncateChars = parseInt(next(), 10); break;
            case '--guard-size': args.guardSize = parseInt(next(), 10); break;
            case '--prompt-file': args.promptFile = resolve(next()); break;
            case '--help':
            case '-h':
                printHelp();
                process.exit(0);
                break;
            default:
                console.error(`Unknown arg: ${a}`);
                process.exit(1);
        }
    }
    args.tolerances = args.tolerances.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => Number.isInteger(n) && n >= 0);
    return args;
}

function printHelp() {
    console.log(`eval/run.js — STMB-Auto Phase 0 pipeline runner

Usage:
  node eval/run.js [options]

Options:
  --transcript <path>     JSONL chat file (default: eval/fixtures/transcript.jsonl)
  --detector <name>       oracle | stub | openai (default: oracle)
  --predictions <path>    predictions file (when --detector stub)
  --out <dir>             output directory (default: eval/reports/latest)
  --tolerances <list>     comma-separated (default: 1,2)
  --time-jump <minutes>   forward time jump that counts as boundary (default: 90)
  --min-scene <msgs>      scenes shorter than this merge (default: 6)
  --window-size <msgs>    detection window size (default: 26)
  --window-overlap <msgs> detection window overlap (default: 8)
  --truncate-chars <n>    truncate each message to N chars (default: 500)
  --guard-size <msgs>     trailing guard (default: 4)
  --prompt <text>         baseline detection prompt (default: eval/prompts/baseline.txt via loadBaselinePrompt)
  --prompt-file <path>    override the baseline prompt file (used by --detector openai)
  -h, --help              show this help

OpenAI-compatible detector (--detector openai):
  Reads STMB_BASE_URL / STMB_MODEL / STMB_API_KEY from env or eval/.env.
  Optional: STMB_TEMPERATURE (0), STMB_TIMEOUT_MS (60000),
  STMB_PROMPT_FILE (eval/prompts/baseline.txt).
  Runs the LLM per detection window (plan §3.1), strict-JSON parses the
  array, retries ONCE on parse failure with a JSON-only reprimand, and
  skips the window on second failure. Boundaries are deduped across the
  8-message overlap before scoring.`);
}

async function makeDetector(args) {
    switch (args.detector) {
        case 'oracle':
            return new HeaderOracleDetector({ timeJumpMinutes: args.timeJump });
        case 'stub':
            if (!args.predictions) {
                throw new Error('--detector stub requires --predictions <path>');
            }
            return new StubDetector(args.predictions);
        case 'openai':
            return await makeOpenAIDetector(args);
        default:
            throw new Error(`unknown detector: ${args.detector} (use oracle | stub | openai)`);
    }
}

async function makeOpenAIDetector(args) {
    const cfg = await resolveConfig();
    if (!cfg.isConfigured) {
        throw new Error(`--detector openai: missing env vars: ${cfg.missing.join(', ')}. Set them in env or eval/.env (see eval/.env.example).`);
    }
    const promptFile = args.promptFile ?? cfg.promptFile;
    const prompt = await loadBaselinePrompt(promptFile);
    return new OpenAIDetector({
        baseUrl: cfg.baseUrl,
        model: cfg.model,
        apiKey: cfg.apiKey,
        temperature: cfg.temperature,
        timeoutMs: cfg.timeoutMs,
        maxJsonRetries: cfg.maxJsonRetries,
        prompt,
    });
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------

async function main() {
    const args = parseArgs(process.argv);
    const startedAt = new Date().toISOString();

    console.log(`[1/4] Parsing ${args.transcript}…`);
    const { messages, warnings } = await parseJsonlFile(args.transcript);
    console.log(`        ${messages.length} messages parsed${warnings.length ? ` (${warnings.length} warnings)` : ''}.`);

    console.log(`[2/4] Deriving ground truth (time-jump=${args.timeJump}min, min-scene=${args.minScene}msgs)…`);
    const gt = deriveGroundTruth(messages, {
        timeJumpMinutes: args.timeJump,
        minSceneMessages: args.minScene,
    });
    console.log(`        ${gt.raw.length} raw boundaries → ${gt.boundaries.length} merged (dropped ${gt.dropped.length} short scenes).`);
    console.log(`        Scene lengths: min=${Math.min(...gt.sceneLengths)} max=${Math.max(...gt.sceneLengths)} avg=${(gt.sceneLengths.reduce((a,b)=>a+b,0)/gt.sceneLengths.length).toFixed(1)}`);

    console.log(`[3/4] Running detector "${args.detector}"…`);
    const detector = await makeDetector(args);

    let det;
    let windowCount;
    if (args.detector === 'openai') {
        // OpenAIDetector runs per window with strict-JSON retry/skip and
        // dedup across overlap. runDetection() owns that orchestration.
        det = await runDetection(messages, {
            detector,
            windowSize: args.windowSize,
            overlap: args.windowOverlap,
            truncateChars: args.truncateChars,
            guardSize: args.guardSize,
        });
        windowCount = det.windows.length;
        console.log(`        ${windowCount} detection windows built (size=${args.windowSize}, overlap=${args.windowOverlap}, guard=${args.guardSize}, truncate=${args.truncateChars}).`);
        console.log(`        ${det.boundaries.length} predicted boundaries (deduped across ${windowCount} windows; ${det.skipped} skipped).`);
    } else {
        det = await detector.detectBoundaries({ messages });
        windowCount = buildDetectionWindows(messages, {
            windowSize: args.windowSize,
            overlap: args.windowOverlap,
            truncateChars: args.truncateChars,
            guardSize: args.guardSize,
        }).length;
        console.log(`        ${windowCount} detection windows built (size=${args.windowSize}, overlap=${args.windowOverlap}, guard=${args.guardSize}, truncate=${args.truncateChars}).`);
        console.log(`        ${det.boundaries.length} predicted boundaries.`);
    }
    // Ensure both shapes expose boundaries / rawResponses downstream.
    const predictedBoundaries = det.boundaries;
    const rawResponses = det.rawResponses;

    console.log(`[4/4] Scoring at ±{${args.tolerances.join(',')}} tolerance…`);
    const results = scoreAtTolerances({
        predicted: det.boundaries,
        groundTruth: gt.boundaries,
        tolerances: args.tolerances,
        messageCount: messages.length,
    });
    for (const r of results) {
        console.log(`        ${formatScoreLine(r)}`);
    }

    // Write outputs.
    await mkdir(args.out, { recursive: true });
    const jsonReport = {
        title: 'STMB-Auto Phase 0 scene-boundary scoring report',
        runAt: startedAt,
        finishedAt: new Date().toISOString(),
        config: {
            transcript: args.transcript,
            detector: args.detector,
            timeJumpMinutes: args.timeJump,
            minSceneMessages: args.minScene,
            tolerances: args.tolerances,
            windowSize: args.windowSize,
            windowOverlap: args.windowOverlap,
            truncateChars: args.truncateChars,
            guardSize: args.guardSize,
            prompt: args.prompt.length > 200 ? args.prompt.slice(0, 200) + '…(truncated)' : args.prompt,
        },
        messageCount: messages.length,
        groundTruthCount: gt.boundaries.length,
        rawGroundTruthCount: gt.raw.length,
        droppedGroundTruth: gt.dropped,
        predictedCount: predictedBoundaries.length,
        results,
        predictions: predictedBoundaries,
        groundTruth: gt.boundaries,
        sceneLengths: gt.sceneLengths,
    };
    const mdReport = formatMarkdownReport(results, {
        title: 'STMB-Auto Phase 0 — scene-boundary scoring report',
        runAt: startedAt,
        messageCount: messages.length,
        config: jsonReport.config,
    });
    await writeFile(resolve(args.out, 'report.json'), JSON.stringify(jsonReport, null, 2));
    await writeFile(resolve(args.out, 'report.md'), mdReport);
    await writeFile(resolve(args.out, 'predictions.json'), JSON.stringify({ boundaries: predictedBoundaries, rawResponses }, null, 2));
    await writeFile(resolve(args.out, 'ground-truth.json'), JSON.stringify({
        boundaries: gt.boundaries,
        raw: gt.raw,
        dropped: gt.dropped,
        sceneLengths: gt.sceneLengths,
        detail: gt.detail,
    }, null, 2));

    console.log(`\nReports written to ${args.out}/`);
    console.log(`  - report.md     (Markdown)`);
    console.log(`  - report.json   (machine-readable)`);
    console.log(`  - predictions.json`);
    console.log(`  - ground-truth.json`);

    // Acceptance gate from plan §6 (Phase 0): precision ≥0.90 at ±1.
    const gate = results[0];
    if (gate && gate.precision < 0.90) {
        console.error(`\n❌ Phase 0 acceptance gate FAILED: precision ${gate.precision.toFixed(4)} < 0.90 at ±${gate.tolerance}`);
        process.exit(1);
    }
    if (gate && gate.precision >= 0.90) {
        console.log(`\n✅ Phase 0 acceptance gate PASSED: precision ${gate.precision.toFixed(4)} ≥ 0.90 at ±${gate.tolerance}`);
    }
}

main().catch((err) => {
    console.error('eval/run.js failed:', err && err.stack ? err.stack : err);
    process.exit(1);
});