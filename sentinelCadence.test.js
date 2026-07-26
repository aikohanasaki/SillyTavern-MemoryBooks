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
    summarizeCycleRecord,
    NO_ENGINE_DETAIL,
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
