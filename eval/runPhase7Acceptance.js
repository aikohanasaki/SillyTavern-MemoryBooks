#!/usr/bin/env node
// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// eval/runPhase7Acceptance.js — CLI runner for the Phase 7 (Librarian)
// acceptance gate.
//
// Offline by default: no network, no SillyTavern, no API keys. Replays the
// Satire Isekai fixture through the real librarian modules and prints the four
// epic gates plus the two oracle sanity gates, with a machine-readable JSON
// blob for the evidence file.
//
//   node eval/runPhase7Acceptance.js
//   node eval/runPhase7Acceptance.js --json
//   node eval/runPhase7Acceptance.js --api-latency 600 --out eval/reports/phase7
//   node eval/runPhase7Acceptance.js --live --base-url http://127.0.0.1:8787/v1 --model claude-sonnet-4
//
// Exit code 0 = every gate met; 1 = at least one gate failed.

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
    DEFAULT_FIXTURE,
    DEFAULT_WORLDBOOK,
    PHASE7_DEFAULTS,
    buildFixtureCatalog,
    buildRetrievalGroundTruth,
    buildScenes,
    checkByteParity,
    checkCoverage,
    checkLatency,
    checkTokenBudget,
    loadFixture,
    loadLorebook,
    makeKillableSelector,
    makeLiveSelector,
    makeSurrogateLibrarian,
    oracleBoundaryGate,
    oracleCoverageGate,
    replay,
} from './phase7Acceptance.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseArgs(argv) {
    const args = {
        transcript: DEFAULT_FIXTURE,
        worldbook: DEFAULT_WORLDBOOK,
        apiLatency: PHASE7_DEFAULTS.apiLatencyMs,
        killAfter: 5,
        out: resolve(__dirname, 'reports/phase7'),
        json: false,
        live: false,
        baseUrl: process.env.STMB_EVAL_BASE_URL || '',
        apiKey: process.env.STMB_EVAL_API_KEY || '',
        model: process.env.STMB_EVAL_MODEL || '',
        help: false,
    };
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--json') args.json = true;
        else if (a === '--live') args.live = true;
        else if (a === '--transcript') args.transcript = argv[++i];
        else if (a === '--worldbook') args.worldbook = argv[++i];
        else if (a === '--api-latency') args.apiLatency = Number(argv[++i]);
        else if (a === '--kill-after') args.killAfter = Number(argv[++i]);
        else if (a === '--base-url') args.baseUrl = argv[++i];
        else if (a === '--api-key') args.apiKey = argv[++i];
        else if (a === '--model') args.model = argv[++i];
        else if (a === '--out') args.out = argv[++i];
        else if (a === '--help' || a === '-h') args.help = true;
        else { console.error(`Unknown argument: ${a}`); printHelp(); process.exit(2); }
    }
    return args;
}

function printHelp() {
    console.log(`Phase 7 (Librarian) acceptance runner — offline by default.

Usage: node eval/runPhase7Acceptance.js [options]

  --transcript <path>   JSONL transcript   (default: eval/fixtures/transcript.jsonl)
  --worldbook <path>    JSON worldbook     (default: eval/fixtures/worldbook.json)
  --api-latency <ms>    simulated retrieval-call wall time (default: 600)
  --kill-after <n>      fail-open test kills the API after n live calls (default: 5)
  --out <dir>           evidence output dir (default: eval/reports/phase7)
  --json                emit the machine-readable result only
  --live                run the coverage replay against a real endpoint
  --base-url <url>      OpenAI-compatible base URL   (env STMB_EVAL_BASE_URL)
  --api-key <key>       bearer token                  (env STMB_EVAL_API_KEY)
  --model <name>        model id                      (env STMB_EVAL_MODEL)
  -h, --help            this message
`);
}

const pct = (x) => `${(x * 100).toFixed(1)}%`;
const ms = (x) => `${x.toFixed(1)}ms`;
const mark = (ok) => (ok ? 'PASS' : 'FAIL');

async function main() {
    const args = parseArgs(process.argv);
    if (args.help) { printHelp(); process.exit(0); }
    const log = args.json ? () => {} : (...a) => console.log(...a);

    log('Phase 7 (Librarian) acceptance — replaying the Satire Isekai fixture');
    log('='.repeat(72));

    // ---------------------------------------------------------------- setup
    const { messages, chat, warnings } = await loadFixture(args.transcript);
    const { lorebookData, entries, byUid } = await loadLorebook(args.worldbook);
    const catalog = buildFixtureCatalog(lorebookData);

    log(`fixture      ${messages.length} messages (${warnings.length} skipped lines)`);
    log(`lorebook     ${entries.length} entries -> catalog ${catalog.rows.length} rows, truncated=${catalog.truncated}`);

    // -------------------------------------------- sanity gate 1: the key
    const boundaryGate = oracleBoundaryGate(messages);
    const scenes = buildScenes(boundaryGate.key, messages.length);
    log('');
    log('SANITY GATE 1 — boundary key vs independent oracle');
    log(`  raw boundaries        ${boundaryGate.raw.length}`);
    log(`  merged key            ${boundaryGate.key.length}  (scenes: ${scenes.length})`);
    log(`  oracle predicted      ${boundaryGate.oracle.length}`);
    log(`  oracle P/R            ${boundaryGate.score.precision.toFixed(3)} / ${boundaryGate.score.recall.toFixed(3)}   [${mark(boundaryGate.ok)}]`);

    const gt = buildRetrievalGroundTruth({ scenes, messages, entries, rows: catalog.rows });
    const gtTotal = [...gt.bySceneIndex.values()].reduce((n, s) => n + s.size, 0);
    log(`  retrieval key         ${gtTotal} entity-mentions across ${scenes.length} scenes ` +
        `(${gt.excluded.length} entries excluded as un-injectable)`);

    const replayBase = { chat, messages, entries, byUid, catalog, scenes, boundaries: boundaryGate.key, gt };

    // -------------------------------------------- sanity gate 2: the scorer
    const coverageOracle = await oracleCoverageGate(replayBase);
    log('');
    log('SANITY GATE 2 — oracle librarian must cover the key');
    log(`  uncapped coverage     ${pct(coverageOracle.uncapped)}   [${mark(coverageOracle.ok)}]`);
    log(`  capped ceiling        ${pct(coverageOracle.capped)}   (maxEntries=${PHASE7_DEFAULTS.maxEntries}, budget=${PHASE7_DEFAULTS.tokenBudget}t)`);

    // -------------------------------------------------------- GATE 1: parity
    const off = await replay({ ...replayBase, select: async () => '[]', config: { enabled: false } });
    const parity = checkByteParity(off.turns);
    log('');
    log('GATE 1 — parity: librarian disabled => byte-identical prompt');
    log(`  turns replayed        ${parity.turns}`);
    log(`  retrieval calls       ${off.calls}`);
    log(`  divergent turns       ${parity.offenders.length}   [${mark(parity.ok)}]`);

    // ------------------------------------------- GATE 3: coverage + budget
    let select;
    let liveMeta = null;
    if (args.live) {
        if (!args.baseUrl || !args.model) {
            console.error('--live needs --base-url and --model (or STMB_EVAL_BASE_URL / STMB_EVAL_MODEL).');
            process.exit(2);
        }
        select = makeLiveSelector({ baseUrl: args.baseUrl, apiKey: args.apiKey, model: args.model });
        liveMeta = { baseUrl: args.baseUrl, model: args.model };
    } else {
        select = makeSurrogateLibrarian({ latencyMs: args.apiLatency, maxEntries: PHASE7_DEFAULTS.maxEntries });
    }

    const on = await replay({ ...replayBase, select });
    const coverage = checkCoverage({ turns: on.turns, scenes, gt });
    const budget = checkTokenBudget(on.turns);
    const latency = checkLatency(on.turns);

    log('');
    log(`GATE 3 — entity coverage of the NEXT scene  (selector: ${args.live ? `live ${liveMeta.model}` : 'offline surrogate'})`);
    log(`  scene-transition pts  ${coverage.scenePoints}   (${coverage.entities} entity-mentions to cover)`);
    log(`  keyword baseline      ${pct(coverage.baseline)}`);
    log(`  librarian             ${pct(coverage.librarian)}   (+${pct(coverage.delta)})   [${mark(coverage.ok)}]`);
    log(`  per-turn / next msg   baseline ${pct(coverage.perTurn.baseline)} -> librarian ${pct(coverage.perTurn.librarian)}`);
    log('');
    log('GATE 3b — token budget across the full replay');
    log(`  budget                ${budget.budget} tokens`);
    log(`  max used on any turn  ${budget.maxUsed} tokens`);
    log(`  max entries any turn  ${budget.maxEntries} / ${PHASE7_DEFAULTS.maxEntries}`);
    log(`  over-budget turns     ${budget.offenders.length}   [${mark(budget.ok)}]`);

    // ----------------------------------------------------- GATE 4: latency
    log('');
    log('GATE 4 — added wall time');
    log(`  call turns            ${latency.callTurns}  p50 ${ms(latency.callP50)}  p95 ${ms(latency.callP95)}  max ${ms(latency.callMax)}  (budget ${latency.sceneBudget}ms)`);
    log(`  cached turns          ${latency.cachedTurns}  p50 ${ms(latency.cachedP50)}  p95 ${ms(latency.cachedP95)}  max ${ms(latency.cachedMax)}  (budget ${latency.cachedBudget}ms)`);
    log(`  first cached turn     ${latency.warmUpMs === null ? 'n/a' : ms(latency.warmUpMs)}  (V8 warm-up, excluded from the percentiles above)`);
    log(`  calls made            ${on.calls} / ${on.turns.length} turns  (${pct(1 - on.calls / on.turns.length)} removed by the scene cache)`);
    log(`  budget breaches       ${latency.offenders.length}   [${mark(latency.ok)}]`);

    // --------------------------------------------------- GATE 2: fail-open
    log('');
    log('GATE 2 — fail-open: API killed mid-session => byte-identical prompt');
    const failOpen = [];
    for (const mode of ['throw', 'timeout', 'garbage']) {
        const killable = makeKillableSelector({
            inner: makeSurrogateLibrarian({ latencyMs: 0 }),
            killAfterCalls: args.killAfter,
            mode,
            timeoutMs: 5,
        });
        // Caching OFF so every single turn after the kill actually hits the dead
        // endpoint. With the cache on, most turns never call at all, and a test
        // that passes because it never made the request is not a fail-open test.
        const run = await replay({ ...replayBase, select: killable, config: { cache: false } });
        const firstDead = run.turns.findIndex((x) => x.action === 'skip:call-failed' || x.action === 'skip:bad-json');
        const after = firstDead >= 0 ? run.turns.slice(firstDead) : [];
        const parityAfter = checkByteParity(after);
        const threw = false; // replay() would have rejected; reaching here means it did not
        failOpen.push({
            mode,
            liveCalls: killable.state.calls - killable.state.killedCalls,
            killedCalls: killable.state.killedCalls,
            firstDeadTurn: firstDead >= 0 ? run.turns[firstDead].t : null,
            turnsAfterKill: after.length,
            divergent: parityAfter.offenders.length,
            threw,
            ok: firstDead >= 0 && parityAfter.ok && !threw,
        });
        const f = failOpen[failOpen.length - 1];
        log(`  ${mode.padEnd(8)} killed after ${f.liveCalls} live calls -> ${f.turnsAfterKill} turns stock, ${f.divergent} divergent   [${mark(f.ok)}]`);
    }
    const failOpenOk = failOpen.every((f) => f.ok);

    // ------------------------------------------------------------- verdict
    const gates = {
        oracleBoundary: boundaryGate.ok,
        oracleCoverage: coverageOracle.ok,
        parity: parity.ok,
        failOpen: failOpenOk,
        coverage: coverage.ok,
        tokenBudget: budget.ok,
        latency: latency.ok,
    };
    const allOk = Object.values(gates).every(Boolean);

    log('');
    log('='.repeat(72));
    for (const [name, ok] of Object.entries(gates)) log(`  ${mark(ok)}  ${name}`);
    log(`PHASE 7 GATE: ${allOk ? 'PASS' : 'FAIL'}`);

    const result = {
        phase: 7,
        generatedAt: new Date().toISOString(),
        fixture: { transcript: args.transcript, worldbook: args.worldbook, messages: messages.length, entries: entries.length },
        selector: args.live ? { kind: 'live', ...liveMeta } : { kind: 'offline-surrogate', apiLatencyMs: args.apiLatency },
        groundTruth: {
            rules: 'location change OR >90min jump; merge scenes <6 msgs (PHA-1555 comment 083e4488)',
            rawBoundaries: boundaryGate.raw.length,
            boundaries: boundaryGate.key.length,
            scenes: scenes.length,
            entityMentions: gtTotal,
            excludedEntries: gt.excluded,
        },
        sanity: {
            boundaryOracle: { ok: boundaryGate.ok, precision: boundaryGate.score.precision, recall: boundaryGate.score.recall },
            coverageOracle,
        },
        gate1_parity: { ok: parity.ok, turns: parity.turns, calls: off.calls, offenders: parity.offenders },
        gate2_failOpen: { ok: failOpenOk, modes: failOpen },
        gate3_coverage: {
            ok: coverage.ok,
            baseline: coverage.baseline,
            librarian: coverage.librarian,
            delta: coverage.delta,
            scenePoints: coverage.scenePoints,
            entities: coverage.entities,
            perTurn: coverage.perTurn,
        },
        gate3b_tokenBudget: budget,
        gate4_latency: { ...latency, calls: on.calls, turns: on.turns.length },
        gates,
        pass: allOk,
    };

    await mkdir(args.out, { recursive: true });
    const outFile = resolve(args.out, args.live ? 'phase7-acceptance.live.json' : 'phase7-acceptance.json');
    await writeFile(outFile, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
    if (args.json) console.log(JSON.stringify(result, null, 2));
    else log(`\nevidence -> ${outFile}`);

    process.exit(allOk ? 0 : 1);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
