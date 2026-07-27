#!/usr/bin/env node
// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// eval/runPhase2Acceptance.js — CLI runner for the Phase 2 (Sentinel)
// acceptance harness.
//
// Runs entirely offline (no network, no SillyTavern, no API keys) and prints
// the four Phase 2 acceptance criteria with measured numbers, plus a
// machine-readable JSON blob for the evidence file.
//
//   node eval/runPhase2Acceptance.js
//   node eval/runPhase2Acceptance.js --json
//   node eval/runPhase2Acceptance.js --transcript path/to/other.jsonl
//
// Exit code 0 = all criteria met; 1 = at least one criterion failed.

import {
    DEFAULT_FIXTURE,
    findDuplicateWork,
    findGaps,
    findMidSceneCuts,
    loadFixture,
    productionConfig,
    runIncremental,
    scoreBoundaryCoverage,
} from './phase2Acceptance.js';

function parseArgs(argv) {
    const args = { transcript: DEFAULT_FIXTURE, json: false, reloadAfter: 8, cancelAfter: 3 };
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--json') args.json = true;
        else if (a === '--transcript') args.transcript = argv[++i];
        else if (a === '--reload-after') args.reloadAfter = parseInt(argv[++i], 10);
        else if (a === '--cancel-after') args.cancelAfter = parseInt(argv[++i], 10);
        else if (a === '--help' || a === '-h') { printHelp(); process.exit(0); }
        else { console.error(`Unknown argument: ${a}`); printHelp(); process.exit(2); }
    }
    return args;
}

function printHelp() {
    console.log(`Phase 2 (Sentinel) acceptance runner — offline.

Usage: node eval/runPhase2Acceptance.js [options]

  --transcript <path>    JSONL transcript (default: eval/fixtures/transcript.jsonl)
  --reload-after <n>     memorize n scenes, then simulate a reload (default: 8)
  --cancel-after <n>     memorize n scenes, then fire the abort signal (default: 3)
  --json                 emit the machine-readable result only
  -h, --help             this message
`);
}

function pct(x) {
    return `${(x * 100).toFixed(1)}%`;
}

async function main() {
    const args = parseArgs(process.argv);
    const log = args.json ? () => {} : (...a) => console.log(...a);

    log('Phase 2 (Sentinel) acceptance — offline harness');
    log('='.repeat(64));

    const fx = await loadFixture(args.transcript);
    const config = productionConfig();
    log(`Fixture:        ${args.transcript}`);
    log(`Messages:       ${fx.chat.length}`);
    log(`Ground truth:   ${fx.boundaries.length} merged boundaries (Phase 0, §3.1 rules)`);
    log(`Cadence:        every ${config.cadenceN} new messages`);
    log(`Window/guard:   size ${config.window}, overlap ${config.overlap}, guard ${config.guard}, truncate ${config.truncate}`);
    log('');

    // --- Baseline: one uninterrupted incremental run -------------------------
    const base = await runIncremental({ chat: fx.chat, boundaries: fx.boundaries, config });
    const coverage = scoreBoundaryCoverage(base.processedRanges, fx.boundaries);
    const cuts = findMidSceneCuts(base.processedRanges, fx.boundaries);
    const gaps = findGaps(base.processedRanges);
    const cycleActions = base.cycles.reduce((acc, c) => {
        acc[c.action] = (acc[c.action] || 0) + 1;
        return acc;
    }, {});

    // --- Criterion 3: reload mid-run ----------------------------------------
    const before = await runIncremental({
        chat: fx.chat,
        boundaries: fx.boundaries,
        config,
        stopAfterCycle: (s) => s.processedRanges.length >= args.reloadAfter,
    });
    const after = await runIncremental({
        chat: fx.chat,
        boundaries: fx.boundaries,
        config,
        startAt: before.resumeState.visible,
        initialWatermark: before.resumeState.watermark,
    });
    const reloadRanges = [...before.processedRanges, ...after.processedRanges];
    const reloadDup = findDuplicateWork(reloadRanges);
    const reloadIdentical =
        JSON.stringify(reloadRanges) === JSON.stringify(base.processedRanges);

    // --- Criterion 4: abort + disable ---------------------------------------
    const aborted = await runIncremental({
        chat: fx.chat,
        boundaries: fx.boundaries,
        config,
        cancelDuringCycle: (s) => s.processedRanges.length >= args.cancelAfter,
    });
    const disabled = await runIncremental({
        chat: fx.chat,
        boundaries: fx.boundaries,
        config,
        sentinelEnabled: false,
    });

    const criteria = [
        {
            id: 1,
            name: 'Scene memories match the Phase 0 harness predictions',
            pass: coverage.missed.length === 0 && gaps.length === 0,
            measured: {
                boundaryCoverage: coverage.coverage,
                matched: coverage.matched.length,
                expected: coverage.expected.length,
                missed: coverage.missed,
                processedRanges: base.processedRanges.length,
                cycles: base.cycles.length,
                finalWatermark: base.finalWatermark,
                gaps: gaps.length,
            },
        },
        {
            id: 2,
            name: 'Zero mid-scene cuts',
            pass: cuts.cuts.length === 0,
            measured: {
                midSceneCuts: cuts.cuts.length,
                cleanRanges: cuts.clean,
                offending: cuts.cuts,
                lastMessage: fx.chat.length - 1,
                unmemorizedTail: (fx.chat.length - 1) - base.finalWatermark,
            },
        },
        {
            id: 3,
            name: 'Reload mid-cycle produces no duplicates',
            pass: reloadDup.duplicates.length === 0
                && reloadDup.overlaps.length === 0
                && findGaps(reloadRanges).length === 0,
            measured: {
                reloadAfterScenes: args.reloadAfter,
                resumeWatermark: before.resumeState.watermark,
                resumeVisible: before.resumeState.visible,
                rangesBefore: before.processedRanges.length,
                rangesAfter: after.processedRanges.length,
                duplicateRanges: reloadDup.duplicates.length,
                overlappingMessages: reloadDup.overlaps.length,
                identicalToUninterrupted: reloadIdentical,
            },
        },
        {
            id: 4,
            name: 'Stopping the sentinel halts it',
            pass: aborted.cancelled
                && aborted.processedRanges.length === args.cancelAfter
                && disabled.cycles.length === 0
                && disabled.refusals.length > 0,
            measured: {
                scenesBeforeAbort: aborted.processedRanges.length,
                cancelledCycles: aborted.cycles.filter((c) => c.status === 'cancelled').length,
                ringBufferEntries: aborted.cycleLog.length,
                disabledCyclesRun: disabled.cycles.length,
                disabledEnqueueRefusals: disabled.refusals.length,
            },
        },
    ];

    const allPass = criteria.every((c) => c.pass);

    log('Criterion 1 — scene memories match Phase 0 ground truth');
    log(`  boundary coverage      ${coverage.matched.length}/${coverage.expected.length}  (${pct(coverage.coverage)})`);
    log(`  missed boundaries      ${coverage.missed.length ? coverage.missed.join(', ') : 'none'}`);
    log(`  memorized ranges       ${base.processedRanges.length}`);
    log(`  gaps in coverage       ${gaps.length}`);
    log(`  cycles run             ${base.cycles.length}  (${Object.entries(cycleActions).map(([k, v]) => `${k}=${v}`).join(', ')})`);
    // Every cycle that reaches the detector is a real LLM call in production,
    // so this is a cost line, not a curiosity (PHA-1547). The floor is what an
    // edge trigger can achieve: one look per cadence step across the chat.
    log(`  detection cost         ${(base.cycles.length / Math.max(1, base.processedRanges.length)).toFixed(1)}`
        + ` cycles per memory (cheapest possible: ${Math.ceil(fx.chat.length / config.cadenceN)} cycles total`
        + ` at cadence ${config.cadenceN})`);
    log(`  final watermark        ${base.finalWatermark} of ${fx.chat.length - 1}`);
    log('');
    log('Criterion 2 — zero mid-scene cuts');
    log(`  mid-scene cuts         ${cuts.cuts.length}`);
    log(`  boundary-aligned ends  ${cuts.clean}/${base.processedRanges.length}`);
    log(`  unmemorized live tail  ${(fx.chat.length - 1) - base.finalWatermark} messages (guard=${config.guard})`);
    log('');
    log('Criterion 3 — reload mid-cycle produces no duplicates');
    log(`  interrupted after      ${before.processedRanges.length} scenes (watermark ${before.resumeState.watermark})`);
    log(`  resumed and added      ${after.processedRanges.length} scenes`);
    log(`  duplicate ranges       ${reloadDup.duplicates.length}`);
    log(`  overlapping messages   ${reloadDup.overlaps.length}`);
    log(`  identical to baseline  ${reloadIdentical}`);
    log('');
    log('Criterion 4 — stopping the sentinel halts it');
    log(`  abort after            ${args.cancelAfter} scenes -> ${aborted.processedRanges.length} memorized, then stopped`);
    log(`  cancelled cycles       ${aborted.cycles.filter((c) => c.status === 'cancelled').length}`);
    log(`  ring-buffer entries    ${aborted.cycleLog.length}`);
    log(`  sentinel disabled      ${disabled.cycles.length} cycles ran, ${disabled.refusals.length} enqueues refused`);
    log('');
    log('='.repeat(64));
    for (const c of criteria) {
        log(`  ${c.pass ? 'PASS' : 'FAIL'}  Criterion ${c.id}: ${c.name}`);
    }
    log('');
    log(allPass ? 'ALL CRITERIA MET' : 'ONE OR MORE CRITERIA FAILED');

    const result = {
        generatedAt: new Date().toISOString(),
        transcript: args.transcript,
        messages: fx.chat.length,
        groundTruthBoundaries: fx.boundaries.length,
        config,
        cycleActions,
        criteria,
        allPass,
    };
    if (args.json) console.log(JSON.stringify(result, null, 2));

    process.exitCode = allPass ? 0 : 1;
}

main().catch((err) => {
    console.error('Phase 2 acceptance run failed:', err);
    process.exitCode = 1;
});
