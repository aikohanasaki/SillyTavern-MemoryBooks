// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// sentinelCadence.test.js — Unit tests for the P2.3 sentinel cadence module.
//
// Covers:
//   - ring buffer (append, cap, get, clear) — pure functions
//   - enqueueSentinelCycle factory (resolver gate, force bypass, error cases)
//   - runSentinelCycle executor (stub; honors abort, appends ring buffer)
//   - registerSentinelCadence  (wires the executor)
//   - structural tests for index.js wiring (commands + executor registration)
//
// The module is pure ESM and has no SillyTavern runtime dependencies on its
// own (it imports resolveSentinelEnabled from autoSettings.js, which itself
// is Node-testable). We hold globalThis out of the way for the duration of
// the test process — see the `setup`/`teardown` block at the top.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

import {
    SENTINEL_CYCLE_JOB_TYPE,
    SENTINEL_CYCLE_JOB_TITLE,
    SENTINEL_CYCLE_LOG_KEY,
    SENTINEL_CYCLE_LOG_LIMIT,
    SENTINEL_CYCLE_TRIGGERS,
    getSentinelCycleLog,
    appendSentinelCycleLog,
    clearSentinelCycleLog,
    enqueueSentinelCycle,
    runSentinelCycle,
    registerSentinelCadence,
    setSentinelDetectionRunner,
    getSentinelDetectionRunner,
    cycleStatusForAction,
    cycleNeedsReview,
    summarizeCycleRecord,
    NO_ENGINE_DETAIL,
    SENTINEL_CADENCE_FLOOR_KEY,
    CADENCE_FLOOR_ADVANCING_ACTIONS,
    getSentinelCadenceFloor,
    setSentinelCadenceFloor,
    clearSentinelCadenceFloor,
    cadenceFloorFromCycle,
} from './sentinelCadence.js';
import { AUTO_MODULE_DEFAULTS, CHAT_AUTO_DEFAULTS } from './autoSettings.js';

// ----------------------------------------------------------------------------
// Constants
// ----------------------------------------------------------------------------

test('exports the stable sentinel cycle job type id', () => {
    assert.equal(SENTINEL_CYCLE_JOB_TYPE, 'stmbc-sentinel-cycle');
});

test('exports the default cycle job title', () => {
    assert.equal(typeof SENTINEL_CYCLE_JOB_TITLE, 'string');
    assert.ok(SENTINEL_CYCLE_JOB_TITLE.length > 0);
});

test('exports the cycle log key + cap', () => {
    assert.equal(SENTINEL_CYCLE_LOG_KEY, 'cycleLog');
    assert.equal(SENTINEL_CYCLE_LOG_LIMIT, 20);
    assert.ok(SENTINEL_CYCLE_LOG_LIMIT > 0);
});

test('exports the four trigger labels', () => {
    assert.equal(SENTINEL_CYCLE_TRIGGERS.AUTO, 'auto');
    assert.equal(SENTINEL_CYCLE_TRIGGERS.MANUAL, 'manual');
    assert.equal(SENTINEL_CYCLE_TRIGGERS.AUDIT, 'audit-after');
    assert.equal(SENTINEL_CYCLE_TRIGGERS.RECOVERY, 'recovery');
});

// ----------------------------------------------------------------------------
// getSentinelCycleLog
// ----------------------------------------------------------------------------

test('getSentinelCycleLog: returns [] for null/garbage input', () => {
    assert.deepEqual(getSentinelCycleLog(null), []);
    assert.deepEqual(getSentinelCycleLog(undefined), []);
    assert.deepEqual(getSentinelCycleLog('not an object'), []);
    assert.deepEqual(getSentinelCycleLog(42), []);
});

test('getSentinelCycleLog: returns [] when stmbc is missing', () => {
    assert.deepEqual(getSentinelCycleLog({}), []);
});

test('getSentinelCycleLog: returns [] when log key is missing', () => {
    assert.deepEqual(getSentinelCycleLog({ stmbc: {} }), []);
});

test('getSentinelCycleLog: returns [] when stmbc.cycleLog is not an array', () => {
    assert.deepEqual(getSentinelCycleLog({ stmbc: { cycleLog: 'garbage' } }), []);
    assert.deepEqual(getSentinelCycleLog({ stmbc: { cycleLog: null } }), []);
});

test('getSentinelCycleLog: returns the stored array reference', () => {
    const log = [{ at: 1, trigger: 'auto' }];
    const meta = { stmbc: { cycleLog: log } };
    const got = getSentinelCycleLog(meta);
    assert.equal(got, log);
    assert.equal(got.length, 1);
});

// ----------------------------------------------------------------------------
// appendSentinelCycleLog
// ----------------------------------------------------------------------------

test('appendSentinelCycleLog: creates stmbc namespace if missing', () => {
    const meta = {};
    const n = appendSentinelCycleLog(meta, { trigger: 'auto' });
    assert.equal(n, 1);
    assert.ok(meta.stmbc);
    assert.ok(Array.isArray(meta.stmbc.cycleLog));
    assert.equal(meta.stmbc.cycleLog.length, 1);
});

test('appendSentinelCycleLog: creates cycleLog array if missing', () => {
    const meta = { stmbc: {} };
    const n = appendSentinelCycleLog(meta, { trigger: 'manual' });
    assert.equal(n, 1);
    assert.deepEqual(meta.stmbc.cycleLog, [{ trigger: 'manual', at: meta.stmbc.cycleLog[0].at }]);
});

test('appendSentinelCycleLog: stamps at and trigger when missing', () => {
    const meta = {};
    const before = Date.now();
    appendSentinelCycleLog(meta, { detail: 'no trigger' });
    const after = Date.now();
    const entry = meta.stmbc.cycleLog[0];
    assert.equal(entry.detail, 'no trigger');
    assert.equal(entry.trigger, SENTINEL_CYCLE_TRIGGERS.AUTO); // default
    assert.ok(entry.at >= before && entry.at <= after, 'at is within bounds');
});

test('appendSentinelCycleLog: respects caller-supplied trigger', () => {
    const meta = {};
    appendSentinelCycleLog(meta, { trigger: SENTINEL_CYCLE_TRIGGERS.MANUAL });
    assert.equal(meta.stmbc.cycleLog[0].trigger, 'manual');
});

test('appendSentinelCycleLog: caps the buffer at SENTINEL_CYCLE_LOG_LIMIT', () => {
    const meta = {};
    for (let i = 0; i < SENTINEL_CYCLE_LOG_LIMIT + 5; i++) {
        appendSentinelCycleLog(meta, { detail: `cycle ${i}` });
    }
    assert.equal(meta.stmbc.cycleLog.length, SENTINEL_CYCLE_LOG_LIMIT);
    // Oldest entries dropped — first remaining is "cycle 5"
    assert.equal(meta.stmbc.cycleLog[0].detail, 'cycle 5');
    assert.equal(meta.stmbc.cycleLog[SENTINEL_CYCLE_LOG_LIMIT - 1].detail, `cycle ${SENTINEL_CYCLE_LOG_LIMIT + 4}`);
});

test('appendSentinelCycleLog: preserves extra fields on the entry', () => {
    const meta = {};
    appendSentinelCycleLog(meta, {
        trigger: 'manual',
        forced: true,
        window: { start: 5, end: 30 },
        boundaries: [12, 27],
    });
    const e = meta.stmbc.cycleLog[0];
    assert.equal(e.forced, true);
    assert.deepEqual(e.window, { start: 5, end: 30 });
    assert.deepEqual(e.boundaries, [12, 27]);
});

test('appendSentinelCycleLog: throws on null/garbage chatMeta', () => {
    assert.throws(() => appendSentinelCycleLog(null, { trigger: 'auto' }), /must be an object/);
    assert.throws(() => appendSentinelCycleLog(undefined, { trigger: 'auto' }), /must be an object/);
    assert.throws(() => appendSentinelCycleLog('not an object', { trigger: 'auto' }), /must be an object/);
});

test('appendSentinelCycleLog: coerces non-object entry to a string record', () => {
    const meta = {};
    appendSentinelCycleLog(meta, 'oops');
    assert.equal(meta.stmbc.cycleLog[0].detail, 'oops');
});

// ----------------------------------------------------------------------------
// clearSentinelCycleLog
// ----------------------------------------------------------------------------

test('clearSentinelCycleLog: returns 0 for missing/empty log', () => {
    assert.equal(clearSentinelCycleLog(null), 0);
    assert.equal(clearSentinelCycleLog({}), 0);
    assert.equal(clearSentinelCycleLog({ stmbc: {} }), 0);
    assert.equal(clearSentinelCycleLog({ stmbc: { cycleLog: 'not an array' } }), 0);
});

test('clearSentinelCycleLog: empties the array and reports count', () => {
    const meta = { stmbc: { cycleLog: [{ at: 1 }, { at: 2 }, { at: 3 }] } };
    const n = clearSentinelCycleLog(meta);
    assert.equal(n, 3);
    assert.deepEqual(meta.stmbc.cycleLog, []);
});

// ----------------------------------------------------------------------------
// enqueueSentinelCycle
// ----------------------------------------------------------------------------

test('enqueueSentinelCycle: rejects when no enqueueStmbJob provided', () => {
    const result = enqueueSentinelCycle({ settings: {}, chatMeta: {} });
    assert.equal(result.ok, false);
    assert.match(result.reason, /enqueueStmbJob not provided/);
});

test('enqueueSentinelCycle: rejects when sentinel is disabled for this chat', () => {
    const settings = { autoModule: { ...AUTO_MODULE_DEFAULTS, sentinelEnabled: false } };
    const chatMeta = { stmbc: { ...CHAT_AUTO_DEFAULTS, enabled: false } };
    const enqueue = () => ({ id: 'job-1' });
    const result = enqueueSentinelCycle({ enqueueStmbJob: enqueue, settings, chatMeta });
    assert.equal(result.ok, false);
    assert.match(result.reason, /sentinel disabled/);
});

test('enqueueSentinelCycle: enqueues when sentinel is enabled', () => {
    const settings = { autoModule: { ...AUTO_MODULE_DEFAULTS, sentinelEnabled: true } };
    const chatMeta = { stmbc: { ...CHAT_AUTO_DEFAULTS, enabled: true } };
    let recorded = null;
    const enqueue = (input) => {
        recorded = input;
        return { id: 'job-1' };
    };
    const result = enqueueSentinelCycle({
        enqueueStmbJob: enqueue,
        settings,
        chatMeta,
        trigger: SENTINEL_CYCLE_TRIGGERS.MANUAL,
        force: true,
    });
    assert.equal(result.ok, true);
    assert.equal(result.jobId, 'job-1');
    assert.equal(result.jobType, SENTINEL_CYCLE_JOB_TYPE);
    assert.equal(recorded.type, SENTINEL_CYCLE_JOB_TYPE);
    assert.equal(recorded.title, SENTINEL_CYCLE_JOB_TITLE);
    assert.equal(recorded.payload.trigger, 'manual');
    assert.equal(recorded.payload.forced, true);
});

test('enqueueSentinelCycle: force bypasses the resolver gate', () => {
    const settings = { autoModule: { ...AUTO_MODULE_DEFAULTS, sentinelEnabled: false } };
    const chatMeta = { stmbc: { ...CHAT_AUTO_DEFAULTS, enabled: false } };
    const enqueue = () => ({ id: 'job-x' });
    const result = enqueueSentinelCycle({
        enqueueStmbJob: enqueue,
        settings,
        chatMeta,
        force: true,
        trigger: 'manual',
    });
    assert.equal(result.ok, true);
    assert.equal(result.jobId, 'job-x');
});

test('enqueueSentinelCycle: rejects when enqueueStmbJob returns null', () => {
    const settings = { autoModule: { ...AUTO_MODULE_DEFAULTS, sentinelEnabled: true } };
    const result = enqueueSentinelCycle({
        enqueueStmbJob: () => null,
        settings,
        chatMeta: {},
        force: true,
    });
    assert.equal(result.ok, false);
    assert.match(result.reason, /returned null/);
});

test('enqueueSentinelCycle: rejects when enqueueStmbJob throws', () => {
    const settings = { autoModule: { ...AUTO_MODULE_DEFAULTS, sentinelEnabled: true } };
    const result = enqueueSentinelCycle({
        enqueueStmbJob: () => { throw new Error('boom'); },
        settings,
        chatMeta: {},
        force: true,
    });
    assert.equal(result.ok, false);
    assert.match(result.reason, /threw: boom/);
});

test('enqueueSentinelCycle: normalizes unknown trigger', () => {
    const settings = { autoModule: { ...AUTO_MODULE_DEFAULTS, sentinelEnabled: true } };
    let recorded = null;
    const enqueue = (input) => { recorded = input; return { id: 'job-y' }; };
    enqueueSentinelCycle({
        enqueueStmbJob: enqueue,
        settings,
        chatMeta: {},
        force: true,
        trigger: 'something-weird',
    });
    assert.equal(recorded.payload.trigger, SENTINEL_CYCLE_TRIGGERS.MANUAL);
});

test('enqueueSentinelCycle: defaults trigger to manual and forced=false', () => {
    const settings = { autoModule: { ...AUTO_MODULE_DEFAULTS, sentinelEnabled: true } };
    let recorded = null;
    const enqueue = (input) => { recorded = input; return { id: 'job-z' }; };
    enqueueSentinelCycle({ enqueueStmbJob: enqueue, settings, chatMeta: {} });
    assert.equal(recorded.payload.trigger, 'manual');
    assert.equal(recorded.payload.forced, false);
});

// ----------------------------------------------------------------------------
// runSentinelCycle — executor
// ----------------------------------------------------------------------------

test('runSentinelCycle: throws AbortError when context signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    const job = { id: 'job-1', payload: { trigger: 'manual', forced: true } };
    await assert.rejects(
        runSentinelCycle(job, { signal: controller.signal }),
        (err) => err.name === 'AbortError',
    );
});

test('runSentinelCycle: appends a ring-buffer entry with the right shape', async () => {
    const meta = {};
    const job = { id: 'job-2', payload: { trigger: 'manual', forced: true } };
    const ctx = {
        settings: { autoModule: { ...AUTO_MODULE_DEFAULTS, sentinelEnabled: true } },
        chatMeta: meta,
        saveMetadata: () => {},
    };
    const result = await runSentinelCycle(job, ctx);
    assert.equal(result.ok, true);
    assert.equal(result.cycle.trigger, 'manual');
    assert.equal(result.cycle.forced, true);
    assert.equal(result.cycle.status, 'completed');
    assert.equal(result.cycle.jobId, 'job-2');
    assert.equal(meta.stmbc.cycleLog.length, 1);
    assert.equal(meta.stmbc.cycleLog[0].jobId, 'job-2');
});

test('runSentinelCycle: calls saveMetadata after appending', async () => {
    let saved = 0;
    const meta = {};
    const ctx = {
        chatMeta: meta,
        saveMetadata: () => { saved++; },
    };
    const job = { id: 'job-3', payload: { trigger: 'auto', forced: false } };
    await runSentinelCycle(job, ctx);
    assert.equal(saved, 1);
});

test('runSentinelCycle: survives missing chatMeta (no save, no throw)', async () => {
    const job = { id: 'job-4', payload: { trigger: 'manual', forced: true } };
    const result = await runSentinelCycle(job, {});
    assert.equal(result.ok, true);
    assert.equal(result.cycle.status, 'completed');
});

test('runSentinelCycle: normalizes malformed trigger in payload', async () => {
    const meta = {};
    const job = { id: 'job-5', payload: { trigger: 'wat', forced: false } };
    await runSentinelCycle(job, { chatMeta: meta, saveMetadata: () => {} });
    assert.equal(meta.stmbc.cycleLog[0].trigger, SENTINEL_CYCLE_TRIGGERS.MANUAL);
});

test('runSentinelCycle: ring buffer failure is non-fatal', async () => {
    // Build a chatMeta whose stmbc.cycleLog is a getter that throws.
    const meta = {};
    Object.defineProperty(meta, 'stmbc', {
        get() { throw new Error('simulated lock'); },
    });
    const job = { id: 'job-6', payload: { trigger: 'manual', forced: true } };
    const result = await runSentinelCycle(job, { chatMeta: meta, saveMetadata: () => {} });
    assert.equal(result.ok, true);
    assert.match(result.cycle.detail, /ring buffer: simulated lock/);
});

// ----------------------------------------------------------------------------
// registerSentinelCadence
// ----------------------------------------------------------------------------

test('registerSentinelCadence: no-op when stmbJobsApi is missing', () => {
    assert.equal(registerSentinelCadence(null), false);
    assert.equal(registerSentinelCadence(undefined), false);
    assert.equal(registerSentinelCadence({}), false);
});

test('registerSentinelCadence: registers the executor with the correct type', async () => {
    let recordedType = null;
    let recordedExecutor = null;
    const api = {
        registerStmbJobExecutor: (type, executor) => {
            recordedType = type;
            recordedExecutor = executor;
        },
    };
    const ok = registerSentinelCadence(api);
    assert.equal(ok, true);
    assert.equal(recordedType, SENTINEL_CYCLE_JOB_TYPE);
    assert.equal(typeof recordedExecutor, 'function');
    // The registered executor is the same function as the named export
    // (not a wrapper). Spot-check by triggering the abort path.
    const controller = new AbortController();
    controller.abort();
    await assert.rejects(
        recordedExecutor({ id: 'x', payload: {} }, { signal: controller.signal }),
        (err) => err.name === 'AbortError',
    );
});

// ----------------------------------------------------------------------------
// Structural tests for index.js wiring
// ----------------------------------------------------------------------------

const indexSrc = readFileSync(resolve(__dirname, 'index.js'), 'utf8');

test('index.js: registers the sentinel cycle executor at init', () => {
    const re = new RegExp(
        String.raw`registerSentinelCadence\s*\(`,
    );
    assert.match(indexSrc, re, 'index.js must call registerSentinelCadence(...)');
});

test('index.js: registers the sentinel cycle executor near the auditor wiring', () => {
    // The executor should be registered alongside the existing `memory` +
    // `consolidation` + auditor pattern so the jobs dashboard has it from
    // extension boot.
    const re = new RegExp(
        String.raw`registerStmbJobExecutor\(\s*["']memory["']\s*,\s*executeQueuedMemoryJob`,
    );
    assert.match(indexSrc, re, 'memory executor must be registered first (anchor pattern)');
    assert.match(indexSrc, /registerSentinelCadence\(/);
});

test('index.js: defines /stmbc-detect slash command', () => {
    assert.match(indexSrc, /name:\s*["']stmbc-detect["']/);
    assert.match(indexSrc, /handleStmbcDetectCommand\b/);
});

test('index.js: defines /stmbc-stop slash command', () => {
    assert.match(indexSrc, /name:\s*["']stmbc-stop["']/);
    assert.match(indexSrc, /handleStmbcStopCommand\b/);
});

test('index.js: /stmbc-detect and /stmbc-stop are added to the parser', () => {
    // Both must appear as SlashCommandParser.addCommandObject calls.
    const detectAdded = new RegExp(String.raw`addCommandObject\s*\(\s*stmbcDetectCmd\b`);
    const stopAdded = new RegExp(String.raw`addCommandObject\s*\(\s*stmbcStopCmd\b`);
    assert.match(indexSrc, detectAdded, 'stmbcDetectCmd must be added to parser');
    assert.match(indexSrc, stopAdded, 'stmbcStopCmd must be added to parser');
});

test('index.js: /stmb-stop comment notes the sentinel job cancellation', () => {
    // The existing handler calls cancelAllStmbJobs() which already covers
    // stmbc-* jobs. The handler comment should make that explicit so future
    // readers see the wiring.
    const fnMatch = indexSrc.match(/async\s+function\s+handleStmbStopCommand\b[\s\S]*?\n\}/);
    assert.ok(fnMatch, 'handleStmbStopCommand must exist');
    assert.match(fnMatch[0], /cancelAllStmbJobs\s*\(/);
    assert.match(
        fnMatch[0],
        /stmbc|sentinel|cycle/i,
        'handleStmbStopCommand should comment the sentinel-cycle coverage (same cancel-all path)',
    );
});

// ----------------------------------------------------------------------------
// Structural tests for sentinelCadence.js itself
// ----------------------------------------------------------------------------

const cadSrc = readFileSync(resolve(__dirname, 'sentinelCadence.js'), 'utf8');

test('sentinelCadence.js: imports resolveSentinelEnabled from autoSettings.js (single source of truth)', () => {
    assert.match(
        cadSrc,
        /import\s*{\s*resolveSentinelEnabled\s*}\s*from\s*['"]\.\/autoSettings\.js['"]/,
    );
});

test('sentinelCadence.js: ring buffer is hard-capped at SENTINEL_CYCLE_LOG_LIMIT', () => {
    assert.match(
        cadSrc,
        /if\s*\(\s*log\.length\s*>\s*SENTINEL_CYCLE_LOG_LIMIT\s*\)\s*{[\s\S]*?splice/,
    );
});

test('sentinelCadence.js: executor honors abort signal before touching chat metadata', () => {
    // The abort check must come before the ring buffer append.
    const execMatch = cadSrc.match(/export\s+async\s+function\s+runSentinelCycle\b[\s\S]*?\n\}/);
    assert.ok(execMatch, 'runSentinelCycle must be defined');
    const abortIndex = execMatch[0].search(/\.aborted/);
    const appendIndex = execMatch[0].search(/appendSentinelCycleLog/);
    assert.ok(abortIndex >= 0, 'must check .aborted');
    assert.ok(appendIndex >= 0, 'must call appendSentinelCycleLog');
    assert.ok(abortIndex < appendIndex, 'abort check must precede ring buffer append');
});

test('sentinelCadence.js: ring buffer failure is non-fatal (try/catch around append)', () => {
    const execMatch = cadSrc.match(/export\s+async\s+function\s+runSentinelCycle\b[\s\S]*?\n\}/);
    assert.match(execMatch[0], /try\s*{[\s\S]*?appendSentinelCycleLog[\s\S]*?}\s*catch/);
});

test('sentinelCadence.js: does not import SillyTavern runtime', () => {
    // No ../script.js or ../extensions.js imports — the module is Node-testable.
    assert.doesNotMatch(cadSrc, /from\s+['"]\.\.\/.*script\.js['"]/);
    assert.doesNotMatch(cadSrc, /from\s+['"]\.\.\/.*extensions\.js['"]/);
    assert.doesNotMatch(cadSrc, /from\s+['"]\.\.\/.*world-info\.js['"]/);
});

// ----------------------------------------------------------------------------
// Structural tests for the cancelStmbcJobs helper in stmbJobs.js
// ----------------------------------------------------------------------------

const jobsSrc = readFileSync(resolve(__dirname, 'stmbJobs.js'), 'utf8');

test('stmbJobs.js: exports cancelStmbcJobs', () => {
    assert.match(
        jobsSrc,
        /export\s+function\s+cancelStmbcJobs\s*\(/,
        'stmbJobs.js must export cancelStmbcJobs',
    );
});

test('stmbJobs.js: cancelStmbcJobs filters by the stmbc- prefix', () => {
    const fnMatch = jobsSrc.match(/export\s+function\s+cancelStmbcJobs\s*\([^)]*\)\s*{([\s\S]*?)\n\}/);
    assert.ok(fnMatch, 'cancelStmbcJobs must be defined');
    assert.match(fnMatch[1], /stmbc-/, 'must reference the stmbc- prefix');
    assert.match(fnMatch[1], /startsWith/, 'must filter by startsWith');
    assert.match(fnMatch[1], /abortController\.abort/, 'must abort running jobs');
});

test('stmbJobs.js: cancelStmbcJobs preserves non-stmbc queued jobs', () => {
    const fnMatch = jobsSrc.match(/export\s+function\s+cancelStmbcJobs\s*\([^)]*\)\s*{([\s\S]*?)\n\}/);
    assert.match(fnMatch[1], /remaining\.push/, 'must keep non-matching queued jobs');
});

test('stmbJobs.js: cancelStmbcJobs returns {count, types}', () => {
    const fnMatch = jobsSrc.match(/export\s+function\s+cancelStmbcJobs\s*\([^)]*\)\s*{([\s\S]*?)\n\}/);
    assert.match(fnMatch[1], /return\s*{[^}]*count[^}]*types[^}]*}/s, 'must return count + types');
});

test('index.js: imports cancelStmbcJobs from stmbJobs.js', () => {
    assert.match(
        indexSrc,
        /import\s*{[^}]*\bcancelStmbcJobs\b[^}]*}\s*from\s*['"]\.\/stmbJobs\.js['"]/s,
        'cancelStmbcJobs must be imported from stmbJobs.js',
    );
});

// ----------------------------------------------------------------------------
// P2.1 detection-runner seam (P2.1 ↔ P2.3 integration)
// ----------------------------------------------------------------------------

/** Run `fn` with `runner` installed, always restoring the previous runner. */
async function withRunner(runner, fn) {
    const prev = getSentinelDetectionRunner();
    setSentinelDetectionRunner(runner);
    try {
        return await fn();
    } finally {
        setSentinelDetectionRunner(prev);
    }
}

test('setSentinelDetectionRunner installs and clears the runner', () => {
    assert.equal(getSentinelDetectionRunner(), null, 'no runner by default');
    const fn = async () => ({ action: 'no-boundary' });
    assert.equal(setSentinelDetectionRunner(fn), true);
    assert.equal(getSentinelDetectionRunner(), fn);
    assert.equal(setSentinelDetectionRunner(null), false);
    assert.equal(getSentinelDetectionRunner(), null);
    assert.equal(setSentinelDetectionRunner('not a function'), false);
});

test('runSentinelCycle: no runner installed = wiring-only no-op cycle', async () => {
    const meta = {};
    const job = { id: 'seam-0', payload: { trigger: 'manual', forced: true } };
    const result = await runSentinelCycle(job, { chatMeta: meta, saveMetadata: () => {} });
    assert.equal(result.ok, true);
    assert.equal(result.cycle.status, 'completed');
    assert.equal(result.cycle.detail, NO_ENGINE_DETAIL);
});

test('runSentinelCycle: delegates to the registered engine and records its result', async () => {
    const meta = {};
    const seen = [];
    const cycle = {
        action: 'processed',
        watermark: 4,
        window: { start: 1, end: 29 },
        boundaries: [12, 20],
        ranges: [[5, 11], [12, 19]],
        processed: [[5, 11], [12, 19]],
        rawAttempts: ['[12, 20]'],
        error: null,
    };
    await withRunner(async (job, ctx) => { seen.push([job, ctx]); return cycle; }, async () => {
        const job = { id: 'seam-1', payload: { trigger: 'auto', forced: false } };
        const ctx = { chatMeta: meta, saveMetadata: () => {} };
        const result = await runSentinelCycle(job, ctx);
        assert.equal(result.ok, true);
        assert.equal(result.cycle.status, 'completed');
        assert.equal(result.cycle.action, 'processed');
        assert.deepEqual(result.cycle.ranges, [[5, 11], [12, 19]]);
        assert.deepEqual(result.cycle.processed, [[5, 11], [12, 19]]);
        // The job + context are threaded through verbatim so the engine can
        // read the abort signal.
        assert.equal(seen.length, 1);
        assert.equal(seen[0][0], job);
        assert.equal(seen[0][1], ctx);
    });
    assert.equal(meta.stmbc.cycleLog.length, 1);
    assert.equal(meta.stmbc.cycleLog[0].action, 'processed');
});

test('runSentinelCycle: an aborted engine cycle is recorded as cancelled', async () => {
    const meta = {};
    await withRunner(async () => ({ action: 'abort:cancelled', at: 'during-memorize', processed: [[5, 11]] }), async () => {
        const job = { id: 'seam-2', payload: { trigger: 'auto' } };
        const result = await runSentinelCycle(job, { chatMeta: meta, saveMetadata: () => {} });
        assert.equal(result.cycle.status, 'cancelled');
        assert.deepEqual(result.cycle.processed, [[5, 11]]);
    });
    assert.equal(meta.stmbc.cycleLog[0].status, 'cancelled');
});

test('runSentinelCycle: an AbortError from the engine propagates (job is cancelled, not failed)', async () => {
    const meta = {};
    await withRunner(async () => {
        const err = new Error('Cancelled');
        err.name = 'AbortError';
        throw err;
    }, async () => {
        await assert.rejects(
            runSentinelCycle({ id: 'seam-3', payload: {} }, { chatMeta: meta, saveMetadata: () => {} }),
            (err) => err.name === 'AbortError',
        );
    });
    // Nothing recorded — an aborted job must not pollute the ring buffer.
    assert.equal(getSentinelCycleLog(meta).length, 0);
});

test('runSentinelCycle: a non-abort engine throw is recorded as a failed cycle', async () => {
    const meta = {};
    await withRunner(async () => { throw new Error('detector exploded'); }, async () => {
        const result = await runSentinelCycle({ id: 'seam-4', payload: {} }, { chatMeta: meta, saveMetadata: () => {} });
        assert.equal(result.ok, false);
        assert.equal(result.cycle.status, 'failed');
        assert.match(result.cycle.error, /detector exploded/);
    });
    assert.equal(meta.stmbc.cycleLog[0].status, 'failed');
});

// ----------------------------------------------------------------------------
// P4.6 — low-confidence detection routes to needs_review on the LIVE path
// ----------------------------------------------------------------------------
//
// Before P4.6 the only producer of StmbJobNeedsReview for *detection* was
// eval/detect.js:assertHighConfidence, which nothing in the extension runtime
// imports — so a low-confidence live cycle finished as a silent green no-op.
// These tests pin the live chain: engine record -> cycleNeedsReview -> throw ->
// stmbJobs' `blocked` / "Needs review" state.

test('P4.6: cycleNeedsReview routes low and failed, never high', () => {
    assert.equal(cycleNeedsReview({ action: 'processed', confidence: 'high' }), false);
    assert.equal(cycleNeedsReview({ action: 'processed', confidence: 'low' }), true);
    assert.equal(cycleNeedsReview({ action: 'skip:unparseable', confidence: 'failed' }), true);
    // No detection call happened -> nothing to review.
    assert.equal(cycleNeedsReview({ action: 'skip:cadence' }), false);
    // A cancel is the user's doing, not a quality signal.
    assert.equal(cycleNeedsReview({ action: 'abort:cancelled', confidence: 'low' }), false);
    assert.equal(cycleNeedsReview(null), false);
});

test('P4.6: a low-confidence cycle throws StmbJobNeedsReview with provenance', async () => {
    const meta = {};
    const cycle = {
        action: 'processed',
        confidence: 'low',
        watermark: 4,
        window: { start: 1, end: 29 },
        boundaries: [12],
        ranges: [[5, 11]],
        processed: [[5, 11]],
        rawAttempts: ['prose', '[12]'],
    };
    await withRunner(async () => cycle, async () => {
        await assert.rejects(
            runSentinelCycle({ id: 'p46-1', payload: {} }, { chatMeta: meta, saveMetadata: () => {} }),
            (err) => {
                // stmbJobs.js matches on the NAME — that is the whole contract.
                assert.equal(err.name, 'StmbJobNeedsReview');
                assert.equal(err.lowConfidence, true);
                assert.equal(err.provenance.confidence, 'low');
                assert.equal(err.provenance.action, 'processed');
                assert.deepEqual(err.provenance.window, { start: 1, end: 29 });
                assert.equal(err.provenance.attempts, 2);
                return true;
            },
        );
    });
    // The evidence is persisted BEFORE the throw — a blocked job the user opens
    // must still have its cycle in the ring buffer.
    const log = getSentinelCycleLog(meta);
    assert.equal(log.length, 1);
    assert.equal(log[0].action, 'processed');
    assert.equal(log[0].confidence, 'low');
    assert.equal(log[0].needsReview, true);
    assert.match(log[0].detail, /low confidence: low/);
});

test('P4.6 control: a high-confidence cycle completes normally (no review)', async () => {
    // Mutation check: this is the same cycle record with confidence flipped to
    // 'high'. If routing ever fired unconditionally, this test fails.
    const meta = {};
    const cycle = {
        action: 'processed',
        confidence: 'high',
        watermark: 4,
        ranges: [[5, 11]],
        processed: [[5, 11]],
        rawAttempts: ['[12]'],
    };
    await withRunner(async () => cycle, async () => {
        const result = await runSentinelCycle({ id: 'p46-2', payload: {} }, { chatMeta: meta, saveMetadata: () => {} });
        assert.equal(result.ok, true);
        assert.equal(result.cycle.status, 'completed');
        assert.equal(result.cycle.needsReview, undefined);
    });
    assert.equal(getSentinelCycleLog(meta)[0].confidence, 'high');
});

test('P4.6: an unparseable cycle routes to review instead of finishing green', async () => {
    const meta = {};
    await withRunner(
        async () => ({ action: 'skip:unparseable', confidence: 'failed', watermark: 4, rawAttempts: ['a', 'b'] }),
        async () => {
            await assert.rejects(
                runSentinelCycle({ id: 'p46-3', payload: {} }, { chatMeta: meta, saveMetadata: () => {} }),
                (err) => err.name === 'StmbJobNeedsReview' && err.provenance.confidence === 'failed',
            );
        },
    );
    assert.equal(getSentinelCycleLog(meta)[0].needsReview, true);
});

test('P4.6: a runner that raises StmbJobNeedsReview itself is not swallowed as "failed"', async () => {
    // eval callers reach the same state via assertHighConfidence; the executor
    // must forward that rather than flattening it into a plain failure.
    const meta = {};
    await withRunner(async () => {
        const err = new Error('StmbJobNeedsReview: low-confidence detection — 1 of 2 window(s)');
        err.name = 'StmbJobNeedsReview';
        err.provenance = { confidence: 'low', offenders: [] };
        throw err;
    }, async () => {
        await assert.rejects(
            runSentinelCycle({ id: 'p46-4', payload: {} }, { chatMeta: meta, saveMetadata: () => {} }),
            (err) => err.name === 'StmbJobNeedsReview',
        );
    });
    const log = getSentinelCycleLog(meta);
    assert.equal(log[0].needsReview, true);
    assert.notEqual(log[0].status, 'failed');
});

test('P4.6: stmbJobs.js maps StmbJobNeedsReview onto the blocked/"Needs review" state', () => {
    // The other half of the live chain. stmbJobs.js is not Node-importable
    // (SillyTavern runtime imports), so this is a source-level pin on the
    // executor's catch — the exact code path our throw lands in.
    const src = readFileSync(resolve(__dirname, 'stmbJobs.js'), 'utf8');
    assert.match(src, /=== 'StmbJobNeedsReview'/, 'stmbJobs matches the error by name');
    assert.match(src, /needsReview \? 'blocked'/, 'a needs-review error finishes the job as blocked');
    assert.match(src, /needsReview \? 'Needs review'/, 'and the detail reads "Needs review"');
});

test('P4.6: sentinelCore does not throw for low confidence (engine contract preserved)', () => {
    const src = readFileSync(resolve(__dirname, 'sentinelCore.js'), 'utf8');
    assert.doesNotMatch(
        src,
        /StmbJobNeedsReview/,
        'the engine signals confidence with a record field; the job boundary owns the throw',
    );
});

test('registerSentinelCadence: installs the engine when one is supplied', async () => {
    const prev = getSentinelDetectionRunner();
    try {
        const engine = async () => ({ action: 'no-boundary' });
        const api = { registerStmbJobExecutor: () => {} };
        assert.equal(registerSentinelCadence(api, { runDetectionCycle: engine }), true);
        assert.equal(getSentinelDetectionRunner(), engine);
        // Omitting the option leaves the existing runner untouched (no clobber).
        assert.equal(registerSentinelCadence(api), true);
        assert.equal(getSentinelDetectionRunner(), engine);
    } finally {
        setSentinelDetectionRunner(prev);
    }
});

test('cycleStatusForAction maps engine actions onto job statuses', () => {
    assert.equal(cycleStatusForAction('processed'), 'completed');
    assert.equal(cycleStatusForAction('no-boundary'), 'completed');
    assert.equal(cycleStatusForAction('skip:cadence'), 'completed');
    assert.equal(cycleStatusForAction('abort:cancelled'), 'cancelled');
    assert.equal(cycleStatusForAction(undefined), 'completed');
});

test('summarizeCycleRecord keeps raw LLM replies out of chat metadata', () => {
    const out = summarizeCycleRecord({
        action: 'skip:unparseable',
        watermark: 4,
        rawAttempts: ['x'.repeat(5000), 'y'.repeat(5000)],
    });
    assert.equal(out.action, 'skip:unparseable');
    assert.equal(out.attempts, 2);
    assert.equal(out.rawHead.length, 200, 'only a short head of the first reply is persisted');
    assert.equal(out.rawAttempts, undefined, 'full replies must never reach chat metadata');
});

test('index.js: wires the P2.1 engine into registerSentinelCadence', () => {
    assert.match(
        indexSrc,
        /registerSentinelCadence\([\s\S]{0,200}runDetectionCycle:\s*runSentinelDetectionForJob/,
        'index.js must pass the sentinel.js engine runner to registerSentinelCadence',
    );
    assert.match(
        indexSrc,
        /import\s*{[^}]*\brunSentinelDetectionForJob\b[^}]*}\s*from\s*['"]\.\/sentinel\.js['"]/s,
        'runSentinelDetectionForJob must come from sentinel.js',
    );
});

test('index.js: the MESSAGE_RECEIVED cadence gate is wired exactly once', () => {
    const calls = indexSrc.match(/\bhandleSentinelMessageReceived\(\)/g) || [];
    assert.equal(calls.length, 1, 'exactly one cadence-gate invocation (no double-firing)');
    const fnMatch = indexSrc.match(/async function handleMessageReceived\s*\([^)]*\)\s*{([\s\S]*?)^\}/m);
    assert.ok(fnMatch, 'handleMessageReceived must be defined');
    assert.match(fnMatch[1], /handleSentinelMessageReceived\(\)/, 'the gate lives in handleMessageReceived');
});

test('sentinel.js: the gate enqueues a job — it never runs detection inline', () => {
    const sentinelSrc = readFileSync(resolve(__dirname, 'sentinel.js'), 'utf8');
    const gate = sentinelSrc.match(/export async function handleSentinelMessageReceived\s*\([^)]*\)\s*{([\s\S]*?)\n\}/);
    assert.ok(gate, 'handleSentinelMessageReceived must be defined');
    assert.match(gate[1], /enqueueSentinelCycle\(/, 'the gate must go through the P2.3 factory');
    assert.doesNotMatch(
        gate[1],
        /runSentinelDetectionCycle\(/,
        'the gate must NOT call the engine directly (that would bypass the job queue and double-fire)',
    );
});

test('sentinel.js: on/off is resolved only via autoSettings.resolveSentinelEnabled', () => {
    const sentinelSrc = readFileSync(resolve(__dirname, 'sentinel.js'), 'utf8');
    assert.match(
        sentinelSrc,
        /import\s*{[^}]*\bresolveSentinelEnabled\b[^}]*}\s*from\s*['"]\.\/autoSettings\.js['"]/s,
        'resolveSentinelEnabled must come from autoSettings.js (single source of truth)',
    );
    // No second, independent enable check reading the raw settings shape.
    assert.doesNotMatch(sentinelSrc, /autoModule\s*(\?\.|\.)\s*enabled/);
    assert.doesNotMatch(sentinelSrc, /perChat\.enabled/);
});

test('sentinelCore.js: does not carry a second ring buffer', () => {
    const coreSrc = readFileSync(resolve(__dirname, 'sentinelCore.js'), 'utf8');
    // Strip comments first: the doc comments explaining WHY the core owns no
    // ring buffer necessarily name the things they say it must not have.
    const code = coreSrc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    assert.doesNotMatch(code, /SENTINEL_RING_SIZE/, 'the ring buffer belongs to sentinelCadence.js');
    assert.doesNotMatch(code, /\bcycleLog\b/, 'sentinelCore.js must not touch chat_metadata.stmbc.cycleLog');
    assert.doesNotMatch(code, /\bstmbc\b/, 'sentinelCore.js must not touch chat_metadata.stmbc at all');
    assert.doesNotMatch(code, /chat_metadata/, 'sentinelCore.js must stay free of SillyTavern state');
});

test('sentinelCore.js: the engine is not named runSentinelCycle (no collision)', () => {
    const coreSrc = readFileSync(resolve(__dirname, 'sentinelCore.js'), 'utf8');
    assert.match(coreSrc, /export async function runSentinelDetectionCycle\s*\(/);
    assert.doesNotMatch(coreSrc, /export async function runSentinelCycle\s*\(/);
});

// ----------------------------------------------------------------------------
// Cadence floor — the edge trigger (PHA-1547)
// ----------------------------------------------------------------------------

test('exports the cadence floor key', () => {
    assert.equal(SENTINEL_CADENCE_FLOOR_KEY, 'cadenceFloor');
});

test('getSentinelCadenceFloor returns -1 for anything malformed', () => {
    assert.equal(getSentinelCadenceFloor(null), -1);
    assert.equal(getSentinelCadenceFloor(undefined), -1);
    assert.equal(getSentinelCadenceFloor({}), -1);
    assert.equal(getSentinelCadenceFloor({ stmbc: {} }), -1);
    assert.equal(getSentinelCadenceFloor({ stmbc: { cadenceFloor: 'nope' } }), -1);
    assert.equal(getSentinelCadenceFloor({ stmbc: { cadenceFloor: -7 } }), -1);
    assert.equal(getSentinelCadenceFloor({ stmbc: { cadenceFloor: 1.5 } }), -1);
    assert.equal(getSentinelCadenceFloor({ stmbc: { cadenceFloor: 0 } }), 0);
    assert.equal(getSentinelCadenceFloor({ stmbc: { cadenceFloor: 41 } }), 41);
});

test('setSentinelCadenceFloor creates the stmbc bag and stores the value', () => {
    const meta = {};
    assert.equal(setSentinelCadenceFloor(meta, 29), 29);
    assert.equal(meta.stmbc.cadenceFloor, 29);
    assert.equal(getSentinelCadenceFloor(meta), 29);
});

test('setSentinelCadenceFloor is monotonic — it never walks the floor backwards', () => {
    // A cycle that examined less than a previous one must not re-open the waste
    // the floor exists to close.
    const meta = {};
    setSentinelCadenceFloor(meta, 40);
    assert.equal(setSentinelCadenceFloor(meta, 12), 40);
    assert.equal(getSentinelCadenceFloor(meta), 40);
});

test('setSentinelCadenceFloor with a negative value clears the field outright', () => {
    const meta = {};
    setSentinelCadenceFloor(meta, 40);
    assert.equal(setSentinelCadenceFloor(meta, -1), -1);
    assert.equal(SENTINEL_CADENCE_FLOOR_KEY in meta.stmbc, false);
});

test('setSentinelCadenceFloor rejects a non-object chatMeta', () => {
    assert.throws(() => setSentinelCadenceFloor(null, 5), TypeError);
});

test('clearSentinelCadenceFloor re-opens the gate on the next message', () => {
    const meta = { stmbc: { cadenceFloor: 40, cycleLog: [{ action: 'no-boundary' }] } };
    assert.equal(clearSentinelCadenceFloor(meta), -1);
    assert.equal(getSentinelCadenceFloor(meta), -1);
    // Clearing the floor must not disturb the ring buffer it shares a bag with.
    assert.equal(meta.stmbc.cycleLog.length, 1);
    assert.equal(clearSentinelCadenceFloor(null), -1);
    assert.equal(clearSentinelCadenceFloor({}), -1);
});

test('cadenceFloorFromCycle advances only on cycles that reached the detector', () => {
    for (const action of ['processed', 'no-boundary', 'skip:unparseable', 'skip:detect-error']) {
        assert.equal(
            cadenceFloorFromCycle({ action, window: { start: 4, end: 29 } }),
            29,
            `${action} should advance the floor to the window end`,
        );
        assert.ok(CADENCE_FLOOR_ADVANCING_ACTIONS.has(action));
    }
});

test('cadenceFloorFromCycle refuses aborts and the pre-detect skips', () => {
    // An abort must not suppress the next cycle — /stmb-stop is not a decision
    // about the content of the tail. The pre-detect skips examined nothing.
    const nonAdvancing = [
        'abort:cancelled',
        'skip:cadence',
        'skip:empty-chat',
        'skip:job-in-flight',
        'skip:empty-window',
        'skip:disabled',
    ];
    for (const action of nonAdvancing) {
        assert.equal(
            cadenceFloorFromCycle({ action, window: { start: 4, end: 29 } }),
            null,
            `${action} must not advance the floor`,
        );
        assert.equal(CADENCE_FLOOR_ADVANCING_ACTIONS.has(action), false);
    }
});

test('cadenceFloorFromCycle returns null without a usable window end', () => {
    assert.equal(cadenceFloorFromCycle(null), null);
    assert.equal(cadenceFloorFromCycle({}), null);
    assert.equal(cadenceFloorFromCycle({ action: 'no-boundary' }), null);
    assert.equal(cadenceFloorFromCycle({ action: 'no-boundary', window: {} }), null);
    assert.equal(cadenceFloorFromCycle({ action: 'no-boundary', window: { end: -1 } }), null);
});

test('runSentinelCycle advances the cadence floor after a fruitless cycle', async () => {
    const meta = {};
    const cycle = { action: 'no-boundary', watermark: 4, window: { start: 1, end: 29 }, boundaries: [] };
    await withRunner(async () => cycle, async () => {
        await runSentinelCycle({ id: 'floor-1', payload: { trigger: 'auto' } }, { chatMeta: meta });
    });
    assert.equal(getSentinelCadenceFloor(meta), 29);
});

test('runSentinelCycle advances the cadence floor after a processed cycle too', async () => {
    // The messages after the last boundary were still shown to the detector and
    // rejected, so the tail is genuinely covered past the new watermark.
    const meta = {};
    const cycle = {
        action: 'processed',
        watermark: 4,
        window: { start: 1, end: 29 },
        boundaries: [12],
        ranges: [[5, 11]],
        processed: [[5, 11]],
    };
    await withRunner(async () => cycle, async () => {
        await runSentinelCycle({ id: 'floor-2', payload: { trigger: 'auto' } }, { chatMeta: meta });
    });
    assert.equal(getSentinelCadenceFloor(meta), 29);
});

test('runSentinelCycle leaves the cadence floor alone when a cycle is aborted', async () => {
    const meta = {};
    const cycle = { action: 'abort:cancelled', at: 'before-detect', window: { start: 1, end: 29 } };
    await withRunner(async () => cycle, async () => {
        await runSentinelCycle({ id: 'floor-3', payload: { trigger: 'auto' } }, { chatMeta: meta });
    });
    assert.equal(getSentinelCadenceFloor(meta), -1);
});

test('runSentinelCycle leaves the cadence floor alone when no engine is installed', async () => {
    // The wiring-only no-op never looked at the chat; suppressing eight
    // messages' worth of cycles on the strength of it would be a lie.
    const meta = {};
    await withRunner(null, async () => {
        await runSentinelCycle({ id: 'floor-4', payload: { trigger: 'auto' } }, { chatMeta: meta });
    });
    assert.equal(getSentinelCadenceFloor(meta), -1);
});

test('sentinel.js: the MESSAGE_RECEIVED gate consults the cadence floor', () => {
    // The whole point of the floor is the auto path; a gate that forgets to
    // pass it silently reverts to the 257-wasted-calls level trigger.
    const sentinelSrc = readFileSync(resolve(__dirname, 'sentinel.js'), 'utf8');
    assert.match(
        sentinelSrc,
        /import\s*{[^}]*\bgetSentinelCadenceFloor\b[^}]*}\s*from\s*['"]\.\/sentinelCadence\.js['"]/s,
    );
    assert.match(sentinelSrc, /isCadenceReached\(\s*chat\.length,\s*watermark,\s*cfg\.cadenceN,\s*cadenceFloor\s*\)/);
});

test('sentinelCore.js: the engine reads the floor from nowhere — it only accepts one', () => {
    // The floor lives in chat_metadata.stmbc, which this module owns. Keeping
    // the engine free of it is also what lets /stmbc-detect force a real cycle
    // at any time: the floor gates only the automatic MESSAGE_RECEIVED path.
    const coreSrc = readFileSync(resolve(__dirname, 'sentinelCore.js'), 'utf8');
    const code = coreSrc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    assert.doesNotMatch(code, /getSentinelCadenceFloor/, 'the engine must not read the stored floor');
    assert.doesNotMatch(code, /getCadenceFloor/, 'the engine must not take a floor dep either');
    // `cadenceFloor` appears exactly once in the engine: the optional parameter.
    assert.equal((code.match(/\bcadenceFloor\b/g) || []).length, 2, 'param declaration + its one use');
    // The engine's own re-check deliberately passes three arguments (no floor).
    assert.match(code, /isCadenceReached\(chat\.length,\s*watermark,\s*cfg\.cadenceN\)/);
});
