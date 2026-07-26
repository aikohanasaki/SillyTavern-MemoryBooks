// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// sentinelCadence.js — Phase 2 (P2.3): sentinel cycle job shape + ring-buffer
// cycle log + the on-demand surface (`/stmbc-detect`, `/stmbc-stop`).
//
// Per plan §4.1, the sentinel watches the chat, emits scene boundaries, and
// drives STMB's memory pipeline. The detection runner itself is the P2.1
// deliverable (file: `sentinel.js`, plan §4.1). P2.3 lands the *wiring* the
// detection runner plugs into:
//
//   1. A stable job type (`stmbc-sentinel-cycle`) registered with the STMB
//      jobs dashboard so cycle progress, retries, and cancellation surface
//      in the same panel as memory + audit jobs.
//   2. A ring-buffer cycle log persisted in `chat_metadata.stmbc.cycleLog`
//      for debugging (window, raw output, action). Capped at
//      SENTINEL_CYCLE_LOG_LIMIT to keep chat metadata small in long chats.
//   3. A factory (`enqueueSentinelCycle`) that the cadence gate (P2.1) and
//      the `/stmbc-detect` slash command both call. It respects the sentinel
//      on/off resolver and produces a unified job record.
//   4. An executor (`runSentinelCycle`) that owns the job contract (payload,
//      ring buffer, metadata save, abort) and delegates the actual detection
//      to the P2.1 engine.
//
// P2.1↔P2.3 integration (this commit). P2.1 and P2.3 were built on divergent
// branches and had never coexisted. The seam is now closed:
//
//   * `runSentinelCycle(job, context)` (here) stays the ONE job-executor entry
//     point. The P2.1 engine is `runSentinelDetectionCycle(deps)` in
//     `sentinelCore.js` — renamed on integration so the two no longer collide.
//   * The engine is injected, not imported: `registerSentinelCadence(api,
//     { runDetectionCycle })` installs a runner (supplied by `sentinel.js`,
//     which does import SillyTavern). That keeps THIS module free of any ST
//     import so it stays Node-testable, and keeps the executor working as a
//     clean no-op when no engine is registered.
//   * This module owns the ring buffer outright. P2.1 shipped a second,
//     independent writer to the same `chat_metadata.stmbc.cycleLog` key; it was
//     deleted. `appendSentinelCycleLog` below is the only writer.
//
// Mergeability (plan §1.2): this module is additive — it lives alongside
// upstream code without touching any upstream file. The wiring into
// `index.js` is gated behind `registerSentinelCadence` so a missing fork
// module is a clean no-op (same pattern as `auditorCadence.js`).

import { resolveSentinelEnabled } from './autoSettings.js';

// ----------------------------------------------------------------------------
// Constants
// ----------------------------------------------------------------------------

/** Stable job type id for sentinel cycles. Mirrors `stmbc-audit-*` naming. */
export const SENTINEL_CYCLE_JOB_TYPE = 'stmbc-sentinel-cycle';

/** Default cycle log title shown in the jobs dashboard. */
export const SENTINEL_CYCLE_JOB_TITLE = 'Sentinel Cycle';

/** Ring-buffer cap. Long chats can otherwise blow up metadata; 20 is enough
 *  to debug recent cycles without bloating saves. */
export const SENTINEL_CYCLE_LOG_LIMIT = 20;

/** chat_metadata.stmbc key where the ring buffer lives. */
export const SENTINEL_CYCLE_LOG_KEY = 'cycleLog';

/** Detail recorded when no P2.1 engine is installed (wiring-only cycle). */
export const NO_ENGINE_DETAIL =
    'Sentinel cycle wiring ran, but no detection engine is registered '
    + '(sentinel.js not loaded). Recorded as a successful no-op cycle.';

/** Trigger labels accepted by the factory. Used by the dashboard + cycle log. */
export const SENTINEL_CYCLE_TRIGGERS = Object.freeze({
    AUTO: 'auto',          // cadence gate fired (P2.1)
    MANUAL: 'manual',      // /stmbc-detect manual force
    AUDIT: 'audit-after',  // mid-run re-cycle after an audit job (future)
    RECOVERY: 'recovery',  // mid-cycle reload recovery (plan §4.1)
});

// ----------------------------------------------------------------------------
// Ring buffer — chat_metadata.stmbc.cycleLog
// ----------------------------------------------------------------------------

/**
 * Read the cycle log from chat metadata. Returns an empty array (NOT a copy of
 * the stored array) when the field is missing or malformed — call sites
 * always treat it as readonly.
 *
 * @param {object|null|undefined} chatMeta
 * @returns {Array<object>}
 */
export function getSentinelCycleLog(chatMeta) {
    if (!chatMeta || typeof chatMeta !== 'object') return [];
    const stmbc = chatMeta.stmbc;
    if (!stmbc || typeof stmbc !== 'object') return [];
    const log = stmbc[SENTINEL_CYCLE_LOG_KEY];
    return Array.isArray(log) ? log : [];
}

/**
 * Append a cycle entry to the ring buffer. Caps the buffer at
 * SENTINEL_CYCLE_LOG_LIMIT. Returns the new length.
 *
 * The `entry` object is sanitized: at minimum it gets `at` (timestamp),
 * `trigger`, and any extra fields passed in. Mutates chatMeta in place.
 *
 * @param {object} chatMeta
 * @param {object} entry
 * @returns {number} new length of the log
 */
export function appendSentinelCycleLog(chatMeta, entry) {
    if (!chatMeta || typeof chatMeta !== 'object') {
        throw new TypeError('appendSentinelCycleLog: chatMeta must be an object');
    }
    if (!chatMeta.stmbc || typeof chatMeta.stmbc !== 'object') {
        chatMeta.stmbc = {};
    }
    if (!Array.isArray(chatMeta.stmbc[SENTINEL_CYCLE_LOG_KEY])) {
        chatMeta.stmbc[SENTINEL_CYCLE_LOG_KEY] = [];
    }
    const log = chatMeta.stmbc[SENTINEL_CYCLE_LOG_KEY];

    const safe = (entry && typeof entry === 'object')
        ? entry
        : { detail: typeof entry === 'string' ? entry : String(entry ?? '') };
    const record = {
        at: Number.isFinite(safe.at) ? safe.at : Date.now(),
        trigger: typeof safe.trigger === 'string' ? safe.trigger : SENTINEL_CYCLE_TRIGGERS.AUTO,
        ...safe,
    };
    log.push(record);

    if (log.length > SENTINEL_CYCLE_LOG_LIMIT) {
        log.splice(0, log.length - SENTINEL_CYCLE_LOG_LIMIT);
    }
    return log.length;
}

/**
 * Clear the cycle log. Returns the number of entries removed.
 *
 * @param {object} chatMeta
 * @returns {number}
 */
export function clearSentinelCycleLog(chatMeta) {
    if (!chatMeta || typeof chatMeta !== 'object') return 0;
    if (!chatMeta.stmbc || typeof chatMeta.stmbc !== 'object') return 0;
    const log = chatMeta.stmbc[SENTINEL_CYCLE_LOG_KEY];
    if (!Array.isArray(log)) return 0;
    const n = log.length;
    chatMeta.stmbc[SENTINEL_CYCLE_LOG_KEY] = [];
    return n;
}

// ----------------------------------------------------------------------------
// Factory
// ----------------------------------------------------------------------------

/**
 * Enqueue a sentinel cycle. The cadence gate (P2.1), audit jobs, and the
 * `/stmbc-detect` slash command all funnel through this factory so the
 * dashboard, ring buffer, and metadata persistence see a single shape.
 *
 * Refuses to enqueue if the sentinel is disabled for the chat (unless
 * `force: true`, used by `/stmbc-detect` to apply a manual cycle even when
 * the global default is off — useful for testing/benchmarking).
 *
 * @param {object} opts
 * @param {Function} opts.enqueueStmbJob - the jobs dashboard enqueue (required)
 * @param {object} [opts.settings] - extension_settings; uses the sentinel resolver
 * @param {object} [opts.chatMeta] - chat_metadata; uses the sentinel resolver
 * @param {string} [opts.trigger] - one of SENTINEL_CYCLE_TRIGGERS; default 'manual'
 * @param {boolean} [opts.force] - bypass the resolver gate (manual force)
 * @param {string} [opts.title] - dashboard title override
 * @returns {{ok: boolean, jobId?: string, reason?: string, jobType?: string}}
 */
export function enqueueSentinelCycle({
    enqueueStmbJob,
    settings,
    chatMeta,
    trigger = SENTINEL_CYCLE_TRIGGERS.MANUAL,
    force = false,
    title = SENTINEL_CYCLE_JOB_TITLE,
} = {}) {
    if (typeof enqueueStmbJob !== 'function') {
        return { ok: false, reason: 'enqueueStmbJob not provided' };
    }
    if (!force && !resolveSentinelEnabled(settings, chatMeta)) {
        return { ok: false, reason: 'sentinel disabled for this chat' };
    }
    let job = null;
    try {
        job = enqueueStmbJob({
            type: SENTINEL_CYCLE_JOB_TYPE,
            title,
            payload: {
                trigger: normalizeTrigger(trigger),
                forced: !!force,
            },
        });
    } catch (err) {
        return { ok: false, reason: `enqueueStmbJob threw: ${err?.message || err}` };
    }
    if (!job) {
        return { ok: false, reason: 'enqueueStmbJob returned null (jobs disabled?)' };
    }
    return { ok: true, jobId: job.id, jobType: SENTINEL_CYCLE_JOB_TYPE };
}

function normalizeTrigger(t) {
    const set = SENTINEL_CYCLE_TRIGGERS;
    if (t === set.AUTO || t === set.MANUAL || t === set.AUDIT || t === set.RECOVERY) {
        return t;
    }
    return SENTINEL_CYCLE_TRIGGERS.MANUAL;
}

// ----------------------------------------------------------------------------
// Detection runner registry (the P2.1 seam)
// ----------------------------------------------------------------------------

/**
 * The registered P2.1 detection runner, or null.
 *
 * This module must not import `sentinel.js` — that file pulls in the
 * SillyTavern runtime (`script.js`, `extensions.js`) and would make
 * sentinelCadence.js un-loadable under `node --test`. So the engine is pushed
 * in from index.js at init instead of pulled in here.
 *
 * @type {null | ((job: object, context: object) => Promise<object>)}
 */
let detectionRunner = null;

/**
 * Install (or clear, with `null`) the P2.1 detection runner used by
 * `runSentinelCycle`. Normally called via `registerSentinelCadence`.
 *
 * @param {Function|null} runner - `(job, context) => Promise<cycleRecord>`
 * @returns {boolean} true if a runner is now installed
 */
export function setSentinelDetectionRunner(runner) {
    detectionRunner = typeof runner === 'function' ? runner : null;
    return detectionRunner !== null;
}

/** @returns {Function|null} the installed detection runner (for tests/introspection). */
export function getSentinelDetectionRunner() {
    return detectionRunner;
}

/**
 * Map an engine cycle record's `action` onto the job status shown in the
 * dashboard. `abort:*` records mean the cycle was cancelled mid-flight; every
 * other action (`processed`, `no-boundary`, `skip:*`) is a clean completion.
 *
 * @param {string} action
 * @returns {'completed'|'cancelled'}
 */
export function cycleStatusForAction(action) {
    return String(action || '').startsWith('abort:') ? 'cancelled' : 'completed';
}

/**
 * Flatten an engine cycle record into a compact, metadata-safe ring-buffer
 * entry. The raw record carries `rawAttempts` (whole LLM replies) which must
 * NOT be persisted verbatim into chat metadata for every cycle — long chats
 * would balloon. We keep a length + a short head of the first attempt.
 *
 * @param {object} cycle - record from runSentinelDetectionCycle
 * @returns {object}
 */
export function summarizeCycleRecord(cycle) {
    if (!cycle || typeof cycle !== 'object') return {};
    const out = { action: String(cycle.action || 'unknown') };
    if (cycle.watermark != null) out.watermark = cycle.watermark;
    if (cycle.window) out.window = cycle.window;
    if (Array.isArray(cycle.boundaries)) out.boundaries = cycle.boundaries;
    if (Array.isArray(cycle.ranges)) out.ranges = cycle.ranges;
    if (Array.isArray(cycle.processed)) out.processed = cycle.processed;
    if (cycle.error) out.error = String(cycle.error);
    // P4.6: 'high' | 'low' | 'failed', absent when the cycle never called the
    // detector (skip:cadence, skip:empty-window, …).
    if (cycle.confidence) out.confidence = String(cycle.confidence);
    if (Array.isArray(cycle.rawAttempts) && cycle.rawAttempts.length) {
        out.attempts = cycle.rawAttempts.length;
        out.rawHead = String(cycle.rawAttempts[0] ?? '').slice(0, 200);
    }
    return out;
}

// ----------------------------------------------------------------------------
// Low-confidence routing (P4.6, plan §4.4)
// ----------------------------------------------------------------------------

/**
 * Does this cycle belong in the review queue?
 *
 * The engine deliberately never throws (it returns `skip:*` records instead),
 * so the *policy* decision lives here, at the job boundary, where a throw can
 * become the job's `blocked` / "Needs review" state. This is the live-path twin
 * of `eval/detect.js:assertHighConfidence`, which does the same job for the
 * offline detector.
 *
 * A cancelled cycle is never routed: an abort is the user's own doing, and the
 * detection may simply not have finished.
 *
 * @param {object} cycle - record from runSentinelDetectionCycle
 * @returns {boolean}
 */
export function cycleNeedsReview(cycle) {
    if (!cycle || typeof cycle !== 'object') return false;
    if (String(cycle.action || '').startsWith('abort:')) return false;
    const confidence = cycle.confidence;
    return !!confidence && confidence !== 'high';
}

/**
 * Build the error stmbJobs.js recognizes by name and finishes as `blocked`
 * (rendered "Needs review"). Carries the summarized ring-buffer entry as
 * provenance so the review surface can show the offending window.
 *
 * @param {object} entry - the summarized cycle entry
 * @returns {Error}
 */
function makeSentinelNeedsReviewError(entry) {
    const err = new Error(
        `StmbJobNeedsReview: low-confidence sentinel detection (${entry.confidence}) — ${entry.action}`,
    );
    err.name = 'StmbJobNeedsReview';
    err.lowConfidence = true;
    err.provenance = {
        reason: `sentinel cycle '${entry.action}' parsed at confidence '${entry.confidence}'`,
        action: entry.action,
        confidence: entry.confidence,
        watermark: entry.watermark ?? null,
        window: entry.window ?? null,
        attempts: entry.attempts ?? null,
    };
    err.cycle = entry;
    return err;
}

// ----------------------------------------------------------------------------
// Executor
// ----------------------------------------------------------------------------

/**
 * The sentinel cycle executor — the single entry point the jobs dashboard
 * calls for a `stmbc-sentinel-cycle` job. It:
 *   1. Honors the abort signal (so `/stmb-stop` and `/stmbc-stop` actually
 *      cancel) BEFORE touching chat metadata.
 *   2. Runs the registered P2.1 detection engine, threading the job's abort
 *      signal into it so a cancel interrupts a real cycle mid-flight (the
 *      engine checks between scenes and before the detection call).
 *   3. Appends a ring-buffer entry to chat_metadata so the dashboard +
 *      debugging surface agree on what the cycle did.
 *   4. Routes a low-confidence cycle to the review queue (P4.6) by throwing
 *      `StmbJobNeedsReview` — AFTER the ring-buffer write, so the evidence
 *      survives. stmbJobs.js turns that into the job's `blocked` state.
 *   5. Returns a structured result so the caller can show a toast / detail.
 *
 * @throws {Error} name='StmbJobNeedsReview' when `cycleNeedsReview(cycle)`
 *   holds; name='AbortError' when the job was cancelled.
 *
 * With no runner installed (fork module missing, or a build where P2.1 is not
 * loaded) this degrades to the P2.3 wiring-only behavior: a clean, logged,
 * successful no-op cycle. That is deliberate — the wiring must never fail
 * because the engine is absent.
 *
 * @param {object} job - from stmbJobs.js; shape: { id, payload, chatKey, ... }
 * @param {object} [context] - per-job context from buildContext; optional
 * @returns {Promise<{ok: boolean, cycle: object}>}
 */
export async function runSentinelCycle(job, context) {
    const payload = (job && typeof job === 'object' && job.payload) || {};
    const trigger = normalizeTrigger(payload.trigger);
    const forced = !!payload.forced;

    // Abort check — done first so a cancelled job never touches the ring buffer.
    const signal = context && context.signal;
    if (signal && signal.aborted) {
        const err = new Error('Cancelled');
        err.name = 'AbortError';
        throw err;
    }

    // Resolve chat metadata + save callback. Prefer the injected context; fall
    // back to SillyTavern globals so the executor is runnable in either shape
    // and is testable in Node.
    const resolved = resolveCycleContext(job, context);
    const settings = resolved.settings || null;
    const chatMeta = resolved.chatMeta || null;
    const saveMetadata = resolved.saveMetadata || (() => {});

    const entry = {
        trigger,
        forced,
        status: 'completed',
        detail: NO_ENGINE_DETAIL,
        jobId: job?.id || null,
    };

    // --- P2.1 engine ---------------------------------------------------------
    // P4.6: a low-confidence cycle must still land in the ring buffer before we
    // route the job to review, so the throw is deferred to the end of the
    // executor rather than raised the moment we notice.
    let needsReviewError = null;
    const runner = detectionRunner;
    if (typeof runner === 'function') {
        let cycle = null;
        try {
            cycle = await runner(job, context);
        } catch (err) {
            if (err && err.name === 'AbortError') throw err;
            // A runner that raises the review signal itself (e.g. an eval caller
            // using assertHighConfidence) converges on the same path instead of
            // being swallowed into a plain 'failed'.
            if (err && err.name === 'StmbJobNeedsReview') {
                needsReviewError = err;
                entry.needsReview = true;
                entry.confidence = err.provenance?.confidence || 'failed';
                entry.detail = `Sentinel cycle needs review: ${err?.message || err}`;
            } else {
                entry.status = 'failed';
                entry.detail = `Sentinel detection cycle threw: ${err?.message || err}`;
                entry.error = String(err?.message || err);
            }
        }
        if (cycle) {
            Object.assign(entry, summarizeCycleRecord(cycle));
            entry.status = cycleStatusForAction(cycle.action);
            entry.detail = `Sentinel cycle: ${entry.action}`;
            if (cycleNeedsReview(cycle)) {
                entry.needsReview = true;
                entry.detail = `${entry.detail} (low confidence: ${entry.confidence})`;
                needsReviewError = makeSentinelNeedsReviewError(entry);
            }
        }
    }

    if (chatMeta && typeof chatMeta === 'object') {
        try {
            appendSentinelCycleLog(chatMeta, entry);
        } catch (err) {
            // Ring buffer failure is non-fatal — the cycle still completed.
            entry.detail = `${entry.detail} (ring buffer: ${err?.message || err})`;
        }
        try {
            saveMetadata(chatMeta);
        } catch (_e) {
            /* non-fatal */
        }
    }

    // `settings` is resolved for the runner's benefit (and for future gates);
    // the executor itself does not branch on it.
    void settings;

    // P4.6: the cycle is fully logged and persisted at this point, so raising
    // here loses nothing — stmbJobs.js finishes the job as `blocked` ("Needs
    // review", retryable from the dashboard) instead of a silent green no-op.
    if (needsReviewError) throw needsReviewError;

    return { ok: entry.status !== 'failed', cycle: entry };
}

/**
 * Pull the cycle context out of the job + per-job context. The factory
 * encodes `chatKey` and the cadence gate's settings via the runtime; the
 * per-job context may also carry them. Falls back to globals for the
 * SillyTavern runtime path.
 *
 * Exposed for tests so they can inject a context without touching globals.
 */
function resolveCycleContext(job, context) {
    const ctx = (context && typeof context === 'object') ? context : {};
    const settings = ctx.settings
        || (typeof globalThis !== 'undefined' && globalThis.extension_settings)
        || null;
    const chatMeta = ctx.chatMeta
        || (typeof globalThis !== 'undefined' && globalThis.chat_metadata)
        || null;
    const saveMetadata = (typeof ctx.saveMetadata === 'function')
        ? ctx.saveMetadata
        : (() => {});
    return { settings, chatMeta, saveMetadata };
}

// ----------------------------------------------------------------------------
// Wiring
// ----------------------------------------------------------------------------

/**
 * Register the sentinel cycle executor with the STMB jobs dashboard, and
 * (optionally) install the P2.1 detection engine behind it.
 *
 * The executor registered is always `runSentinelCycle` itself — never a
 * wrapper — so the dashboard, retries, and cancellation all address one stable
 * function. The engine is a separate, injected concern.
 *
 * @param {object} stmbJobsApi - { registerStmbJobExecutor }
 * @param {object} [options]
 * @param {Function} [options.runDetectionCycle] - P2.1 engine runner
 *        `(job, context) => Promise<cycleRecord>`; from sentinel.js.
 * @returns {boolean} true if registered
 */
export function registerSentinelCadence(stmbJobsApi, options = {}) {
    if (!stmbJobsApi || typeof stmbJobsApi.registerStmbJobExecutor !== 'function') {
        return false;
    }
    if (options && typeof options.runDetectionCycle === 'function') {
        setSentinelDetectionRunner(options.runDetectionCycle);
    }
    stmbJobsApi.registerStmbJobExecutor(SENTINEL_CYCLE_JOB_TYPE, runSentinelCycle);
    return true;
}
