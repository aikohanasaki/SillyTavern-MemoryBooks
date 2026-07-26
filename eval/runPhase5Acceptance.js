#!/usr/bin/env node
// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// eval/runPhase5Acceptance.js — CLI runner for the Phase 5 (Auditor)
// acceptance harness.
//
// Runs entirely offline (no network, no SillyTavern, no API keys) and prints
// the four Phase 5 acceptance criteria from plan §6 with measured numbers,
// plus a machine-readable JSON blob for the evidence file.
//
//   node eval/runPhase5Acceptance.js
//   node eval/runPhase5Acceptance.js --json
//   node eval/runPhase5Acceptance.js --transcript <path> --worldbook <path>
//   node eval/runPhase5Acceptance.js --reload-after <n> --out <dir>
//
// Exit code 0 = all criteria met; 1 = at least one criterion failed.

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
    DEFAULT_FIXTURE,
    DEFAULT_WORLDBOOK,
    PHASE5_DEFAULTS,
    loadFixture,
    prepareLorebook,
    extractAuditMessages,
    planAuditChunks,
    runAuditWalk,
    chunkCappedCheck,
    findReloadDuplicates,
    findAuditGaps,
    mergeAuditRuns,
} from './phase5Acceptance.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
    const args = {
        transcript: DEFAULT_FIXTURE,
        worldbook: DEFAULT_WORLDBOOK,
        reloadAfter: 3,
        json: false,
        out: resolve(__dirname, 'reports/phase5'),
        help: false,
    };
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--json') args.json = true;
        else if (a === '--transcript') args.transcript = argv[++i];
        else if (a === '--worldbook') args.worldbook = argv[++i];
        else if (a === '--reload-after') args.reloadAfter = parseInt(argv[++i], 10);
        else if (a === '--out') args.out = argv[++i];
        else if (a === '--help' || a === '-h') { args.help = true; }
        else { console.error(`Unknown argument: ${a}`); printHelp(); process.exit(2); }
    }
    return args;
}

function printHelp() {
    console.log(`Phase 5 (Auditor) acceptance runner — offline.

Usage: node eval/runPhase5Acceptance.js [options]

  --transcript <path>     JSONL transcript (default: eval/fixtures/transcript.jsonl)
  --worldbook <path>      JSON worldbook (default: eval/fixtures/worldbook.json)
  --reload-after <n>      walk n chunks, then simulate a reload (default: 3)
  --out <dir>             evidence output directory (default: eval/reports/phase5)
  --json                  emit the machine-readable result only
  -h, --help              this message
`);
}

function pct(x) {
    return `${(x * 100).toFixed(1)}%`;
}

async function main() {
    const args = parseArgs(process.argv);
    if (args.help) { printHelp(); process.exit(0); }
    const log = args.json ? () => {} : (...a) => console.log(...a);

    log('Phase 5 (Auditor) acceptance — offline harness');
    log('='.repeat(64));

    const fx = await loadFixture(args.transcript);
    const { entries, plantedUid, deletedUid } = await prepareLorebook(args.worldbook, {
        plantedKeyword: PHASE5_DEFAULTS.plantedKeyword,
        deletedCharacter: PHASE5_DEFAULTS.deletedCharacter.name,
    });
    const knownNames = new Set();
    for (const e of Object.values(entries)) {
        if (Array.isArray(e.key)) for (const k of e.key) knownNames.add(String(k));
    }
    knownNames.add(PHASE5_DEFAULTS.deletedCharacter.name);

    const messages = extractAuditMessages(fx.chat);
    const chunks = planAuditChunks(messages, {
        chunkSize: PHASE5_DEFAULTS.chunkSize,
        tokenCap: PHASE5_DEFAULTS.tokenCap,
    });
    const capCheck = chunkCappedCheck(chunks, PHASE5_DEFAULTS.tokenCap);

    log(`Fixture:           ${args.transcript}`);
    log(`Messages:          ${fx.chat.length} (${messages.length} audit-eligible)`);
    log(`Worldbook:         ${args.worldbook} (${Object.keys(entries).length} entries, planted uid=${plantedUid}, deleted uid=${deletedUid})`);
    log(`Token cap:         ${PHASE5_DEFAULTS.tokenCap} per chunk (chunk size ${PHASE5_DEFAULTS.chunkSize})`);
    log(`Chunks planned:    ${chunks.length} (max size ${capCheck.maxSize} tokens)`);
    log('');

    // --- Baseline: one uninterrupted walk -----------------------------------
    const base = await runAuditWalk({
        chat: fx.chat,
        lorebookData: { entries },
        knownNames: Array.from(knownNames),
    });

    // --- Criterion 1: per-chunk token caps ----------------------------------
    const criterion1 = {
        id: 1,
        name: 'Full audit of 328-msg fixture completes within per-chunk token caps',
        pass: capCheck.allUnderCap
            && base.completed
            && base.processedChunks.length === chunks.length,
        measured: {
            totalChunks: chunks.length,
            processedChunks: base.processedChunks.length,
            maxChunkTokens: capCheck.maxSize,
            allUnderCap: capCheck.allUnderCap,
            perChunkSizes: capCheck.sizes,
            finalCheckpoint: base.finalCheckpoint,
        },
    };

    // --- Criterion 2: reload mid-run ----------------------------------------
    const before = await runAuditWalk({
        chat: fx.chat,
        lorebookData: { entries },
        knownNames: Array.from(knownNames),
        stopAfterChunk: args.reloadAfter,
    });
    const after = await runAuditWalk({
        chat: fx.chat,
        lorebookData: { entries },
        knownNames: Array.from(knownNames),
        checkpoint: before.finalCheckpoint,
    });
    const merged = mergeAuditRuns(before, after);
    const reloadDupes = findReloadDuplicates(merged.processedChunks);
    const reloadGaps = findAuditGaps(merged.processedChunks, chunks.length);

    const criterion2 = {
        id: 2,
        name: 'Mid-run reload resumes without duplicating or skipping chunks',
        pass: reloadDupes.length === 0
            && reloadGaps.length === 0
            && merged.completed
            && merged.processedChunks.length === chunks.length,
        measured: {
            reloadAfterChunks: args.reloadAfter,
            chunksBeforeReload: before.processedChunks.length,
            chunksAfterResume: after.processedChunks.length,
            mergedChunks: merged.processedChunks.length,
            duplicates: reloadDupes,
            gaps: reloadGaps,
            checkpointShape: Object.keys(before.finalCheckpoint || {}),
            completed: merged.completed,
        },
    };

    // --- Criterion 3: coverage catches deleted character --------------------
    const coverage = base.reports?.coverage;
    const flaggedKeys = (coverage?.items || []).map((i) => i.key);
    const deletedItem = (coverage?.items || []).find(
        (i) => String(i.key).toLowerCase() === PHASE5_DEFAULTS.deletedCharacter.name.toLowerCase()
    );
    const criterion3 = {
        id: 3,
        name: `Coverage report catches a deliberately deleted character entry ("${PHASE5_DEFAULTS.deletedCharacter.name}")`,
        pass: !!deletedItem
            && ['missing', 'thin', 'stale'].includes(deletedItem.severity),
        measured: {
            deletedCharacter: PHASE5_DEFAULTS.deletedCharacter.name,
            deletedUid,
            flaggedKeys,
            deletedSeverity: deletedItem?.severity ?? null,
            deletedSightings: deletedItem?.sightings ?? 0,
            coverageSummary: coverage?.summary ?? null,
        },
    };

    // --- Criterion 4: technical pass catches planted "button" ---------------
    const tech = base.reports?.technical;
    const plantedIssue = (tech?.issues || []).find(
        (i) => Number(i.entryUid) === Number(plantedUid) && i.code === 'keyword-common-only'
    );
    const criterion4 = {
        id: 4,
        name: `Technical pass catches a planted keyword collision (keyword "${PHASE5_DEFAULTS.plantedKeyword}")`,
        pass: !!plantedIssue && plantedIssue.severity === 'error',
        measured: {
            plantedKeyword: PHASE5_DEFAULTS.plantedKeyword,
            plantedUid,
            plantedSeverity: plantedIssue?.severity ?? null,
            plantedCode: plantedIssue?.code ?? null,
            technicalSummary: tech?.summary ?? null,
            allIssueCodes: (tech?.issues || []).map((i) => i.code),
        },
    };

    const criteria = [criterion1, criterion2, criterion3, criterion4];
    const allPass = criteria.every((c) => c.pass);

    log('Criterion 1 — per-chunk token cap');
    log(`  chunks planned      ${chunks.length}`);
    log(`  max chunk size      ${capCheck.maxSize} tokens (cap ${PHASE5_DEFAULTS.tokenCap})`);
    log(`  all under cap       ${capCheck.allUnderCap}`);
    log(`  processed           ${base.processedChunks.length}/${chunks.length}`);
    log(`  completed           ${base.completed}`);
    log('');
    log('Criterion 2 — reload mid-run');
    log(`  pre-reload chunks   ${before.processedChunks.length} (reloadAfter=${args.reloadAfter})`);
    log(`  resumed chunks      ${after.processedChunks.length}`);
    log(`  merged processed    ${merged.processedChunks.length}`);
    log(`  duplicate chunks    ${reloadDupes.length}`);
    log(`  gaps                ${reloadGaps.length}`);
    log(`  completed           ${merged.completed}`);
    log('');
    log(`Criterion 3 — coverage catches deleted character "${PHASE5_DEFAULTS.deletedCharacter.name}"`);
    log(`  flagged keys        ${flaggedKeys.length === 0 ? 'none' : flaggedKeys.join(', ')}`);
    log(`  deleted severity    ${deletedItem?.severity ?? 'not flagged'}`);
    log(`  deleted sightings   ${deletedItem?.sightings ?? 0}`);
    log(`  coverage summary    ${JSON.stringify(coverage?.summary ?? {})}`);
    log('');
    log(`Criterion 4 — technical pass catches planted "${PHASE5_DEFAULTS.plantedKeyword}"`);
    log(`  issues              ${(tech?.issues || []).length}`);
    log(`  planted severity    ${plantedIssue?.severity ?? 'not flagged'}`);
    log(`  all issue codes     ${(tech?.issues || []).map((i) => i.code).join(', ') || 'none'}`);
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
        worldbook: args.worldbook,
        messages: fx.chat.length,
        auditEligibleMessages: messages.length,
        config: PHASE5_DEFAULTS,
        criteria,
        reports: {
            coverage,
            technical: {
                summary: tech?.summary ?? null,
                issues: tech?.issues ?? [],
            },
        },
        allPass,
    };

    if (!args.json) {
        // Persist the machine-readable evidence alongside the human one.
        try {
            await mkdir(args.out, { recursive: true });
            await writeFile(resolve(args.out, 'report.json'), JSON.stringify(result, null, 2));
            log(`\nWrote ${resolve(args.out, 'report.json')}`);
        } catch (e) {
            console.error('Failed to write report.json:', e.message);
        }
    }
    if (args.json) console.log(JSON.stringify(result, null, 2));

    process.exitCode = allPass ? 0 : 1;
}

main().catch((err) => {
    console.error('Phase 5 acceptance run failed:', err);
    process.exitCode = 1;
});
