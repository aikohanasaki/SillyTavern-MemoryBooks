// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// eval/phase2Acceptance.js — Phase 2 (Sentinel) acceptance harness, pure logic.
//
// Runs entirely OFFLINE: no network, no SillyTavern, no API keys. It drives the
// REAL production code path over the bundled fixture with a mock detector:
//
//   isCadenceReached            (sentinelCore.js) — the gate predicate that
//                               sentinel.js's MESSAGE_RECEIVED gate uses
//   enqueueSentinelCycle        (sentinelCadence.js) — the P2.3 job factory
//   runSentinelCycle            (sentinelCadence.js) — the P2.3 job executor
//   runSentinelDetectionCycle   (sentinelCore.js) — the P2.1 detection engine
//   sentinelConfigFromAutoSettings (sentinelCore.js) — the P2.2 settings mapping
//
// Nothing about the cycle is reimplemented here. What IS stubbed (and could not
// be otherwise, offline) is only the two SillyTavern-owned leaves:
//
//   * `detect(prompt)` — replaced by a perfect-recall reference detector that
//     parses the `[id]` prefixes out of the REAL prompt the engine built and
//     answers with the ground-truth boundaries visible in that window. It never
//     sees the future, so window/guard/watermark behavior is genuinely tested.
//   * `runSceneMemoryRange(start, end)` — replaced by a recorder that advances
//     the watermark to `end`, exactly as a real memory does (a saved memory
//     raises `getHighestMemoryProcessed`).
//
// ---------------------------------------------------------------------------
// Index spaces — read this before touching anything
// ---------------------------------------------------------------------------
// eval/parser.js numbers messages 1-based (`message.index`), and
// eval/groundTruth.js returns boundaries in that 1-based space. SillyTavern's
// `chat` array — and therefore the entire sentinel — is 0-based. The conversion
// is `chatIndex = evalIndex - 1` and it happens ONCE, in
// `groundTruthChatBoundaries`. Everything downstream is 0-based chat indices.

import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseJsonlText } from './parser.js';
import { deriveGroundTruth } from './groundTruth.js';
import {
    isCadenceReached,
    runSentinelDetectionCycle,
    sentinelConfigFromAutoSettings,
} from '../sentinelCore.js';
import {
    enqueueSentinelCycle,
    runSentinelCycle,
    setSentinelDetectionRunner,
    getSentinelDetectionRunner,
    SENTINEL_CYCLE_TRIGGERS,
} from '../sentinelCadence.js';
import {
    AUTO_MODULE_DEFAULTS,
    getAutoSettings,
    getChatAutoSettings,
    resolveDetectionPrompt,
} from '../autoSettings.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** The bundled transcript fixture (~329 messages). */
export const DEFAULT_FIXTURE = resolve(__dirname, 'fixtures/transcript.jsonl');

/** Ground-truth derivation options — identical to eval/run.js defaults (§3.1). */
export const GROUND_TRUTH_OPTS = Object.freeze({
    timeJumpMinutes: 90,
    minSceneMessages: 6,
});

// ----------------------------------------------------------------------------
// Fixture loading + index-space conversion
// ----------------------------------------------------------------------------

/**
 * Convert parsed eval messages into a SillyTavern-shaped `chat` array.
 * Index i of the returned array corresponds to eval index i + 1.
 *
 * @param {Array<object>} evalMessages - from parser.parseJsonlText
 * @returns {Array<{mes: string, name: string, is_user: boolean, is_system: boolean}>}
 */
export function toChatArray(evalMessages) {
    return evalMessages.map((m) => ({
        mes: m.text,
        name: m.speaker ?? (m.isSystem ? 'system' : 'Narrator'),
        is_user: !!m.isUser,
        is_system: !!m.isSystem,
    }));
}

/**
 * Convert 1-based ground-truth boundaries into 0-based chat indices, dropping
 * the leading "scene 1 starts at message 1" entry.
 *
 * Why drop it: a sentinel boundary B means "cut the previous scene at B-1 and
 * start a new one at B". Chat index 0 has nothing before it, so it can never be
 * a cut — it is the implicit start of the first scene, not a boundary the
 * sentinel could ever emit or be scored on.
 *
 * @param {number[]} evalBoundaries - 1-based, from deriveGroundTruth
 * @returns {number[]} sorted 0-based chat indices
 */
export function groundTruthChatBoundaries(evalBoundaries) {
    return evalBoundaries
        .map((b) => b - 1)
        .filter((b) => b > 0)
        .sort((a, b) => a - b);
}

/**
 * Load the fixture and derive ground truth in chat-index space.
 *
 * @param {string} [fixturePath]
 * @returns {Promise<{chat: Array<object>, boundaries: number[], evalBoundaries: number[], warnings: string[]}>}
 */
export async function loadFixture(fixturePath = DEFAULT_FIXTURE) {
    const text = await readFile(fixturePath, 'utf8');
    const { messages, warnings } = parseJsonlText(text);
    const gt = deriveGroundTruth(messages, GROUND_TRUTH_OPTS);
    return {
        chat: toChatArray(messages),
        boundaries: groundTruthChatBoundaries(gt.boundaries),
        evalBoundaries: gt.boundaries,
        warnings,
    };
}

// ----------------------------------------------------------------------------
// Reference detector (perfect recall, no clairvoyance)
// ----------------------------------------------------------------------------

/**
 * Extract the message ids the engine actually put in the prompt. The engine
 * formats each line as `[<id>] Speaker: text…` (formatDetectionWindow), so
 * parsing them back is how a real LLM would perceive the window — and it means
 * the detector physically cannot answer about messages it was not shown.
 *
 * @param {string} prompt
 * @returns {number[]}
 */
export function windowIdsFromPrompt(prompt) {
    const ids = [];
    const re = /^\[(\d+)\]/gm;
    let m;
    while ((m = re.exec(String(prompt ?? ''))) !== null) {
        ids.push(Number(m[1]));
    }
    return ids;
}

/**
 * Build the perfect-recall reference detector: given the ground-truth boundary
 * set, it returns exactly those boundaries visible in the window it is shown,
 * as the strict JSON array the engine demands.
 *
 * This is the "reference detector" of Phase 2 criterion 1 — it isolates the
 * *cycle* (cadence, windowing, watermark, guard, range planning, reload) from
 * detector quality, which Phase 0 already measured separately.
 *
 * @param {number[]} boundaries - 0-based chat indices
 * @param {object} [opts]
 * @param {Array<object>} [opts.calls] - array to record `{promptIds, answer}` into
 * @returns {(prompt: string) => Promise<string>}
 */
export function makeReferenceDetector(boundaries, opts = {}) {
    const set = new Set(boundaries);
    const calls = Array.isArray(opts.calls) ? opts.calls : null;
    return async (prompt) => {
        const promptIds = windowIdsFromPrompt(prompt);
        const answer = promptIds.filter((id) => set.has(id));
        if (calls) calls.push({ promptIds, answer });
        return JSON.stringify(answer);
    };
}

// ----------------------------------------------------------------------------
// Minimal in-memory stand-ins for the SillyTavern-owned state
// ----------------------------------------------------------------------------

/**
 * A tiny FIFO that mimics the parts of stmbJobs.js the sentinel path touches:
 * `enqueueStmbJob` (returns a job with an id) plus an "is anything pending"
 * flag, which is what `hasActiveStmbJobs` gives the real cadence gate.
 */
export function createJobQueue() {
    const pending = [];
    const history = [];
    let seq = 0;
    return {
        enqueueStmbJob(input) {
            const job = { id: `acc-${++seq}`, ...input };
            pending.push(job);
            history.push(job);
            return job;
        },
        hasPending: () => pending.length > 0,
        shift: () => pending.shift(),
        get history() { return history; },
    };
}

/**
 * The watermark store. In production the watermark is
 * `getHighestMemoryProcessed()` — derived from lorebook entries — and it moves
 * when a memory is saved. Persisted state survives a reload; in-memory state
 * does not. We model exactly that split so criterion 3 is meaningful.
 */
export function createWatermarkStore(initial = -1) {
    let watermark = initial;
    return {
        get: () => watermark,
        advanceTo(end) { if (end > watermark) watermark = end; },
        snapshot: () => watermark,
    };
}

// ----------------------------------------------------------------------------
// The driver
// ----------------------------------------------------------------------------

/**
 * Resolve the production engine config from the P2.2 settings layer, exactly as
 * sentinel.js does at runtime.
 *
 * @param {object} [autoOverrides] - patch over AUTO_MODULE_DEFAULTS
 * @param {object} [chatMeta]
 * @returns {object} engine config
 */
export function productionConfig(autoOverrides = {}, chatMeta = {}) {
    const settings = { autoModule: { ...AUTO_MODULE_DEFAULTS, sentinelEnabled: true, ...autoOverrides } };
    const globalAuto = getAutoSettings(settings);
    const chatAuto = getChatAutoSettings(chatMeta, { globalSentinelEnabled: globalAuto.sentinelEnabled });
    const prompt = resolveDetectionPrompt(settings, chatMeta);
    return sentinelConfigFromAutoSettings(globalAuto, chatAuto, prompt);
}

/**
 * Drive the sentinel incrementally over a growing chat, at the production
 * cadence, through the real gate → factory → executor → engine path.
 *
 * The chat starts at `startAt` messages and grows one message at a time up to
 * the full fixture, mimicking a live conversation. On every "message received"
 * we run the same gate sentinel.js runs, and when it fires we enqueue and drain
 * a real cycle job.
 *
 * @param {object} p
 * @param {Array<object>} p.chat - the full fixture chat array
 * @param {number[]} p.boundaries - ground-truth boundaries (0-based chat indices)
 * @param {object} [p.config] - engine config; defaults to productionConfig()
 * @param {number} [p.startAt=1] - initial visible message count
 * @param {number} [p.initialWatermark=-1] - resume point (reload simulation)
 * @param {(state: object) => boolean} [p.stopAfterCycle] - return true to halt
 *        the run right after a cycle (used to simulate a mid-run reload)
 * @param {(state: object) => boolean} [p.cancelDuringCycle] - consulted as the
 *        job's abort signal while a cycle is running (criterion 4)
 * @param {boolean} [p.sentinelEnabled=true] - global on/off; when false the
 *        P2.3 factory's resolver gate must refuse every enqueue (criterion 4)
 * @returns {Promise<object>} run record
 */
export async function runIncremental({
    chat,
    boundaries,
    config = productionConfig(),
    startAt = 1,
    initialWatermark = -1,
    stopAfterCycle = null,
    cancelDuringCycle = null,
    sentinelEnabled = true,
}) {
    const queue = createJobQueue();
    const watermarks = createWatermarkStore(initialWatermark);
    const chatMeta = { stmbc: {} };
    const settings = { autoModule: { ...AUTO_MODULE_DEFAULTS, sentinelEnabled } };
    const refusals = [];

    const processedRanges = [];
    const cycles = [];
    const detectorCalls = [];
    const detect = makeReferenceDetector(boundaries, { calls: detectorCalls });

    let visible = Math.max(1, startAt);
    let stopped = false;
    let cancelled = false;

    // Install the engine behind the P2.3 executor, exactly as index.js does at
    // init via registerSentinelCadence({...}, { runDetectionCycle }).
    const previousRunner = getSentinelDetectionRunner();
    setSentinelDetectionRunner(async (job, context) => runSentinelDetectionCycle({
        config,
        getChat: () => chat.slice(0, visible),
        getWatermark: () => watermarks.get(),
        isJobInFlight: () => false,
        isCancelled: () => (context && typeof context.isCancelled === 'function')
            ? context.isCancelled()
            : false,
        detect,
        runSceneMemoryRange: async (start, end) => {
            processedRanges.push([start, end]);
            watermarks.advanceTo(end);
        },
    }));

    try {
        while (visible <= chat.length && !stopped) {
            // --- the MESSAGE_RECEIVED cadence gate (sentinel.js) -------------
            const gateFires = !queue.hasPending()
                && isCadenceReached(visible, watermarks.get(), config.cadenceN);

            if (gateFires) {
                const enq = enqueueSentinelCycle({
                    enqueueStmbJob: queue.enqueueStmbJob,
                    settings,
                    chatMeta,
                    trigger: SENTINEL_CYCLE_TRIGGERS.AUTO,
                });
                // A refusal is a legitimate outcome, not an error: it is how the
                // P2.2 on/off resolver stops the sentinel dead (criterion 4).
                if (!enq.ok) refusals.push({ visible, reason: enq.reason });
            }

            // --- drain the queue (the jobs runtime) --------------------------
            while (queue.hasPending()) {
                const job = queue.shift();
                const state = () => ({ visible, watermark: watermarks.get(), cycles: cycles.length, processedRanges });
                const context = {
                    chatMeta,
                    settings,
                    saveMetadata: () => {},
                    isCancelled: () => (typeof cancelDuringCycle === 'function')
                        ? !!cancelDuringCycle(state())
                        : false,
                };
                const result = await runSentinelCycle(job, context);
                cycles.push(result.cycle);
                if (result.cycle.status === 'cancelled') cancelled = true;
                if (typeof stopAfterCycle === 'function' && stopAfterCycle(state())) {
                    stopped = true;
                    break;
                }
            }

            visible++;
        }
    } finally {
        setSentinelDetectionRunner(previousRunner);
    }

    return {
        processedRanges,
        cycles,
        refusals,
        detectorCalls,
        chatMeta,
        cycleLog: (chatMeta.stmbc && chatMeta.stmbc.cycleLog) || [],
        finalWatermark: watermarks.snapshot(),
        // The persisted state a reload would recover from.
        resumeState: { watermark: watermarks.snapshot(), visible: Math.min(visible, chat.length) },
        stopped,
        cancelled,
        config,
    };
}

// ----------------------------------------------------------------------------
// Scoring
// ----------------------------------------------------------------------------

/**
 * Criterion 1 — do the memorized scene ranges reproduce the ground-truth
 * boundaries?
 *
 * A memorized range `[s, e]` asserts "a scene ends at e", i.e. a new scene
 * begins at `e + 1`. So the set of boundaries the sentinel actually committed
 * to is `{ e + 1 for each processed range }`. We score that against the
 * ground-truth boundaries that fall inside the span the run actually covered
 * (you cannot fault the sentinel for boundaries past its final watermark — that
 * is the intended one-scene-behind lag).
 *
 * @param {Array<[number, number]>} processedRanges
 * @param {number[]} boundaries - ground truth, 0-based chat indices
 * @returns {{expected: number[], produced: number[], matched: number[], missed: number[], coverage: number}}
 */
export function scoreBoundaryCoverage(processedRanges, boundaries) {
    const produced = processedRanges.map(([, e]) => e + 1);
    const producedSet = new Set(produced);
    const lastCovered = processedRanges.length
        ? Math.max(...processedRanges.map(([, e]) => e))
        : -1;
    const expected = boundaries.filter((b) => b <= lastCovered + 1);
    const matched = expected.filter((b) => producedSet.has(b));
    const missed = expected.filter((b) => !producedSet.has(b));
    return {
        expected,
        produced,
        matched,
        missed,
        coverage: expected.length ? matched.length / expected.length : 1,
    };
}

/**
 * Criterion 2 — zero mid-scene cuts. Every memorized range must end exactly
 * where a ground-truth scene ends, i.e. `end + 1` must be a ground-truth
 * boundary. Any other end is a cut through the middle of a scene.
 *
 * @param {Array<[number, number]>} processedRanges
 * @param {number[]} boundaries
 * @returns {{cuts: Array<{range: [number, number], endsAt: number}>, clean: number}}
 */
export function findMidSceneCuts(processedRanges, boundaries) {
    const set = new Set(boundaries);
    const cuts = [];
    for (const range of processedRanges) {
        const endsAt = range[1] + 1;
        if (!set.has(endsAt)) cuts.push({ range, endsAt });
    }
    return { cuts, clean: processedRanges.length - cuts.length };
}

/**
 * Criterion 3 — duplicate / overlap detection across a reload.
 *
 * Two failure modes matter: memorizing the identical range twice (a literal
 * duplicate) and memorizing overlapping ranges (the same message covered by two
 * memories). Both are checked.
 *
 * @param {Array<[number, number]>} processedRanges
 * @returns {{duplicates: Array<[number, number]>, overlaps: Array<object>, messageCounts: Map<number, number>}}
 */
export function findDuplicateWork(processedRanges) {
    const seen = new Set();
    const duplicates = [];
    const messageCounts = new Map();
    const overlaps = [];

    for (const [s, e] of processedRanges) {
        const key = `${s}..${e}`;
        if (seen.has(key)) duplicates.push([s, e]);
        seen.add(key);
        for (let i = s; i <= e; i++) {
            messageCounts.set(i, (messageCounts.get(i) || 0) + 1);
        }
    }
    for (const [msg, count] of messageCounts) {
        if (count > 1) overlaps.push({ message: msg, coveredBy: count });
    }
    overlaps.sort((a, b) => a.message - b.message);
    return { duplicates, overlaps, messageCounts };
}

/**
 * Sanity check that the ranges tile the covered span without gaps: each range
 * must start exactly where the previous one ended + 1. A gap means messages
 * were silently skipped and will never be memorized.
 *
 * @param {Array<[number, number]>} processedRanges
 * @param {number} [startFrom=0]
 * @returns {Array<{after: [number, number], before: [number, number], missing: [number, number]}>}
 */
export function findGaps(processedRanges, startFrom = 0) {
    const gaps = [];
    let expectNext = startFrom;
    let prev = null;
    for (const range of processedRanges) {
        if (range[0] > expectNext) {
            gaps.push({ after: prev, before: range, missing: [expectNext, range[0] - 1] });
        }
        expectNext = range[1] + 1;
        prev = range;
    }
    return gaps;
}
