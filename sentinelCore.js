// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// STMB-Auto fork — Sentinel core cycle, pure logic (Phase 2, task P2.1).
// Plan: eval/materials/stmb-auto/stmb-auto-plan.md §3.3 (production detection
// config) and §4.1 (Sentinel architecture).
//
// This file holds the dependency-injected, SillyTavern-free core so it is
// unit-testable under node:test (see sentinel.test.js), exactly like the eval
// harness. The runtime binding that wires real chat/settings/profile/memory
// functions into runSentinelDetectionCycle lives in sentinel.js.
//
// Naming (P2.1↔P2.3 integration): the engine here is `runSentinelDetectionCycle`.
// `runSentinelCycle` is the *job executor* in sentinelCadence.js, which has a
// different signature `(job, context)` and calls into this engine. Keep them
// distinct.
//
// The Sentinel autonomously detects scene boundaries in the unprocessed tail of
// a chat and generates a scene memory per completed scene, one scene behind the
// live conversation (the current, possibly-incomplete scene is never cut).
//
// Cycle (validated offline by the Phase-0 eval harness, eval/run-detection.js):
//   cadence check (>=N new messages, no STMB job in flight)
//     -> watermark (/stmb-highest logic, with own chat_metadata fallback)
//     -> build truncated tail window (500 chars, 4-msg overlap, cap 26)
//     -> detection call on a dedicated cheap profile (reuse profileManager)
//     -> strict-JSON parse, one "JSON only" retry, then skip — never guess
//     -> snap/guard boundaries (drop the final `guard` messages; snap to any
//        per-chat structure-hint regex boundary within +/-1)
//     -> runSceneMemoryRange(W+1..B-1) per boundary, sequentially oldest-first,
//        awaited (each memory advances the watermark for the next scene)
//     -> emit a structured cycle record via the injected `log` dep (the job
//        executor in sentinelCadence.js persists it to the debug ring buffer).
//
// Trigger event (P1.2 note, plan §3.3): SillyTavern exposes no GENERATION_ENDED
// event and STMB subscribes to none — the original draft assumed one. We reuse
// the proven MESSAGE_RECEIVED path (index.js handleMessageReceived) for the
// cadence counter, recomputing "messages since watermark" on each message.

// ---------------------------------------------------------------- defaults & prompt

/** Production detection defaults (plan §3.3); all user-tunable via settings. */
export const SENTINEL_DEFAULTS = Object.freeze({
    cadenceN: 8,        // run when >= N new messages since the watermark
    window: 26,         // max messages in the detection window (cap ~26)
    overlap: 4,         // messages of pre-watermark context prepended to the tail
    truncate: 500,      // per-message character cap (transition language lives in openings)
    guard: 4,           // never emit a boundary within the final `guard` messages
    detectionProfile: null,   // index into extension_settings.STMemoryBooks.profiles; null => default profile
    detectionPrompt: null,    // override for APPENDIX_A_PROMPT (per-chat or global)
    structureHintRegex: null, // optional per-chat deterministic boundary source
});

// NOTE (P2.1↔P2.3 integration): the per-cycle debug ring buffer in chat
// metadata is owned outright by sentinelCadence.js — it holds the key, the cap,
// and the only writer, and that is the contract the jobs dashboard reads. P2.1
// originally shipped a second, independent writer to the same key
// (`SENTINEL_RING_SIZE`); that duplicate was removed when the two branches were
// integrated. This file has NO chat-metadata access of any kind: the engine
// only *emits* a record via the injected `log` dep, and persisting it is the
// job executor's business.

/** Baseline detection prompt — validated in eval (plan Appendix A). User-editable. */
export const APPENDIX_A_PROMPT =
`You are a scene-boundary detector for long-form fiction. Below are numbered
messages in the form "[id] Speaker: text" (truncated). Identify every message
ID that BEGINS a new scene. Mark EVERY change of location however small (room
to room, indoors to outdoors), any time skip of an hour or more, dream
sequences, cutaways, and interludes. Be sensitive rather than conservative.
Continuous action in one place is ONE scene even if the topic shifts.
Do NOT mark any boundary within the final 4 messages (that scene may be
incomplete). Reply with ONLY a JSON array of integers, e.g. [12, 27], or [].`;

/** Reprimand appended on the single retry when the first reply is not strict JSON. */
export const JSON_ONLY_REPRIMAND =
    'Reply with ONLY a JSON array of integers, e.g. [12, 27], or []. No prose, no code fences.';

// ---------------------------------------------------------------- pure helpers

/**
 * Collapse whitespace and truncate to `limit` characters (+ ellipsis). Matches
 * the eval harness (eval/run-detection.js truncateText) so production windows
 * are byte-identical to the validated ones.
 */
export function truncateForDetection(text, limit) {
    const flat = String(text ?? '').replace(/\s+/g, ' ').trim();
    return flat.length > limit ? flat.slice(0, limit) + '…' : flat;
}

/**
 * Remove content the detector should not see: internal-thought blocks and
 * bracketed header/time/location stamps (a bracket containing a pipe — the
 * fixture's `[ 🕰️ … | 📍 … ]` signature). The eval stripped headers and thought
 * blocks before detection (plan §3.1); mirror that so plain-prose chats and
 * stamped chats both reduce to generic prose. Conservative by design: only the
 * distinctive stamp/thought signatures are touched.
 */
export function stripForDetection(text) {
    let s = String(text ?? '');
    s = s.replace(/<thought>[\s\S]*?<\/thought>/gi, ' ');
    s = s.replace(/<think>[\s\S]*?<\/think>/gi, ' ');
    // Leading stamp header: a bracket that contains a pipe separator.
    s = s.replace(/^\s*\[[^\]\n]*[|｜][^\]\n]*\]\s*/, ' ');
    return s;
}

/**
 * Extract the window's messages from the chat array over chat indices
 * [start..end]. Hidden/system messages (is_system) are skipped — they are not
 * narrative — but every kept message retains its true chat index as `id`, so
 * boundaries and scene ranges stay in chat-index space.
 * @returns {Array<{id:number, speaker:string, rawText:string}>}
 */
export function extractWindowMessages(chat, start, end) {
    const out = [];
    for (let i = start; i <= end; i++) {
        const m = chat[i];
        if (!m || m.is_system) continue;
        const speaker = String(m.name || (m.is_user ? 'User' : 'Narrator'));
        out.push({ id: i, speaker, rawText: String(m.mes ?? '') });
    }
    return out;
}

/** Format window messages as `[id] Speaker: text…` (stripped + truncated). */
export function formatDetectionWindow(messages, truncate) {
    return messages
        .map(m => `[${m.id}] ${m.speaker}: ${truncateForDetection(stripForDetection(m.rawText), truncate)}`)
        .join('\n');
}

/**
 * Build the single tail window for a cycle: the unprocessed tail
 * (watermark+1 … latest) plus `overlap` messages of pre-watermark context,
 * capped to `window` chat indices ending at the latest message (plan §3.3).
 *
 * Unlike the eval harness (which slides over an entire transcript for scoring),
 * production examines only this tail window per cycle — detection is
 * incremental, one window per cadence trigger.
 *
 * @returns {{start:number, end:number, messages:Array<{id:number,speaker:string,rawText:string}>}}
 */
export function buildDetectionWindow(chat, { watermark, window: windowSize, overlap }) {
    const lastIndex = chat.length - 1;
    const tailStart = watermark + 1;
    let start = Math.max(0, tailStart - overlap);
    if (lastIndex - start + 1 > windowSize) start = lastIndex - windowSize + 1;
    start = Math.max(0, start);
    return { start, end: lastIndex, messages: extractWindowMessages(chat, start, lastIndex) };
}

/**
 * Map the *stored* Auto-module settings (P2.2 names, what the settings panel
 * writes) onto this engine's internal config names.
 *
 * P2.1↔P2.2 integration: P2.1 was written against its own key names
 * (`cadenceN`, `window`, …) read straight out of `extension_settings`; P2.2
 * shipped the settings panel writing different names (`cadenceMessages`,
 * `windowSize`, …). Without this mapping the settings panel would have had no
 * effect on the sentinel at all. Keeping the mapping HERE (pure, no imports)
 * rather than in sentinel.js means the offline acceptance harness drives the
 * exact same translation production does.
 *
 * @param {object} globalAuto - from autoSettings.getAutoSettings(settings)
 * @param {object} [chatAuto] - from autoSettings.getChatAutoSettings(chatMeta)
 * @param {string|null} [detectionPrompt] - from autoSettings.resolveDetectionPrompt;
 *        null means "use the bundled APPENDIX_A_PROMPT".
 * @returns {object} engine config (the `config` dep of runSentinelDetectionCycle)
 */
export function sentinelConfigFromAutoSettings(globalAuto, chatAuto = {}, detectionPrompt = null) {
    const g = globalAuto || {};
    const c = chatAuto || {};
    return {
        ...SENTINEL_DEFAULTS,
        cadenceN: g.cadenceMessages ?? SENTINEL_DEFAULTS.cadenceN,
        window: g.windowSize ?? SENTINEL_DEFAULTS.window,
        overlap: g.windowOverlap ?? SENTINEL_DEFAULTS.overlap,
        truncate: g.truncateChars ?? SENTINEL_DEFAULTS.truncate,
        guard: g.guardSize ?? SENTINEL_DEFAULTS.guard,
        detectionProfile: g.detectionProfileIndex ?? SENTINEL_DEFAULTS.detectionProfile,
        detectionPrompt: detectionPrompt ?? null,
        structureHintRegex: c.structureHintRegex || null,
    };
}

/**
 * The cadence predicate: has the chat grown by at least `cadenceN` messages
 * since the watermark? (plan §3.3)
 *
 * P2.1↔P2.3 integration: this is the single source of truth for "should a
 * cycle happen now". It is consulted twice, deliberately and idempotently:
 *   1. in the MESSAGE_RECEIVED gate (sentinel.js) — a cheap check so we only
 *      *enqueue* a job when a cycle is actually due, and
 *   2. inside the engine itself — because a queued job may run much later,
 *      by which time the watermark may have moved.
 *
 * @param {number} chatLength
 * @param {number} watermark - highest already-memorized chat index (-1 = none)
 * @param {number} cadenceN
 * @returns {boolean}
 */
export function isCadenceReached(chatLength, watermark, cadenceN) {
    const lastIndex = Number(chatLength) - 1;
    if (!Number.isFinite(lastIndex) || lastIndex < 0) return false;
    return (lastIndex - Number(watermark)) >= Number(cadenceN);
}

/**
 * Accept only a JSON array of integers. Tolerates surrounding whitespace and a
 * single markdown code fence (models add these even when told not to). Returns
 * the array, or null when the reply is not strictly an integer array (§3.3).
 * Identical discipline to eval/run-detection.js parseIdArray.
 */
export function parseIdArray(reply) {
    if (typeof reply !== 'string') return null;
    let s = reply.trim();
    const fence = /^```(?:json)?\s*([\s\S]*?)\s*```$/.exec(s);
    if (fence) s = fence[1].trim();
    let parsed;
    try {
        parsed = JSON.parse(s);
    } catch {
        return null;
    }
    if (!Array.isArray(parsed) || !parsed.every(n => Number.isInteger(n))) return null;
    return parsed;
}

/**
 * Compile the optional per-chat structure-hint regex from a user string.
 * Returns a RegExp (multiline, case-insensitive) or null on empty/invalid input
 * — an invalid hint must never crash a cycle, it just yields no deterministic
 * boundaries.
 */
export function compileStructureHint(source) {
    if (typeof source !== 'string' || !source.trim()) return null;
    try {
        return new RegExp(source, 'im');
    } catch {
        return null;
    }
}

/**
 * Deterministic boundaries from a structure-hint regex: message ids whose RAW
 * text matches (headers intact — the hint usually IS the header stamp).
 */
export function structureHintBoundaries(messages, regex) {
    if (!regex) return [];
    return messages.filter(m => regex.test(m.rawText)).map(m => m.id);
}

/**
 * Snap and guard raw boundary candidates into an accepted, sorted, de-duplicated
 * list (plan §3.3 "guard/snap boundaries"):
 *   - guard: drop any boundary within the final `guard` messages of the window
 *     (that scene may be incomplete; detection runs one scene behind).
 *   - watermark: drop boundaries that would produce an empty prior scene
 *     (a boundary B yields scene [W+1 .. B-1], so require B >= W+2).
 *   - window: drop ids not present in the window.
 *   - snap: when a deterministic structure-hint boundary set exists, snap each
 *     LLM boundary onto a hint boundary within +/-1 (the deterministic source
 *     wins; the LLM is fallback/tiebreaker). Hint boundaries are always kept.
 *
 * @param {{llmIds?:number[], structureIds?:number[], watermark:number, lastIndex:number, guard:number, windowIds:Set<number>}} p
 * @returns {number[]}
 */
export function snapAndGuardBoundaries({ llmIds = [], structureIds = [], watermark, lastIndex, guard, windowIds }) {
    const guardLimit = lastIndex - guard;   // accept id <= guardLimit
    const minB = watermark + 2;             // scene [W+1 .. B-1] must be non-empty
    const inRange = (id) => Number.isInteger(id) && windowIds.has(id) && id >= minB && id <= guardLimit;

    const struct = [...new Set(structureIds.filter(inRange))].sort((a, b) => a - b);
    const structSet = new Set(struct);

    const snapped = [];
    for (const raw of llmIds) {
        if (!Number.isInteger(raw)) continue;
        let id = raw;
        if (struct.length && !structSet.has(id)) {
            if (structSet.has(id - 1)) id = id - 1;
            else if (structSet.has(id + 1)) id = id + 1;
        }
        if (inRange(id)) snapped.push(id);
    }

    return [...new Set([...struct, ...snapped])].sort((a, b) => a - b);
}

/**
 * Turn accepted boundaries into the scene ranges to memorize, oldest-first.
 * With watermark W and boundaries [B1 < B2 < …], the completed scenes are
 * [W+1 .. B1-1], [B1 .. B2-1], [B2 .. B3-1], … The last boundary leaves the
 * current (incomplete) scene Bk..latest unprocessed — that is the intended
 * one-scene-behind behavior. Empty ranges are omitted.
 * @returns {Array<[number, number]>}
 */
export function planSceneRanges(watermark, boundaries) {
    const ranges = [];
    let prevStart = watermark + 1;
    for (const b of [...boundaries].sort((a, b) => a - b)) {
        const end = b - 1;
        if (prevStart <= end) ranges.push([prevStart, end]);
        prevStart = b;
    }
    return ranges;
}

/**
 * How clean the parse actually was, for one detection round (P4.6). Mirrors the
 * per-window `confidence` field the eval detector produces
 * (eval/detect.js, PHA-1511) so the offline harness and the live sentinel label
 * the same thing the same way:
 *
 *   'high'   — the first attempt parsed cleanly (no reprimand needed)
 *   'low'    — the first attempt failed; the JSON-only retry parsed
 *   'failed' — no attempt parsed (or the detection call threw)
 *
 * Anything other than 'high' is low-confidence and belongs in the review queue.
 * The classification lives here (pure) but the *routing* decision is the job
 * boundary's — see `cycleNeedsReview` in sentinelCadence.js.
 *
 * @param {{ids: Array<number>|null, attempts: Array<string>}} round
 * @returns {'high'|'low'|'failed'}
 */
export function classifyDetectionConfidence(round = {}) {
    if (round.ids == null) return 'failed';
    const attempts = Array.isArray(round.attempts) ? round.attempts.length : 0;
    return attempts <= 1 ? 'high' : 'low';
}

/**
 * One detection round for a window: single call, then a single "JSON only"
 * retry on parse failure. Returns { ids, attempts, confidence } with
 * ids === null when the window is unparseable after the retry (skip — never
 * guess, §3.3).
 * `detect(prompt) => Promise<string>` is the injected single-shot LLM call; it
 * may throw (API error) — the caller treats that as a skipped cycle.
 * @param {{detect:(prompt:string)=>Promise<string>, systemPrompt:string, windowText:string}} p
 */
export async function detectBoundaries({ detect, systemPrompt, windowText }) {
    // requestCompletion takes a single prompt string, so fold the instruction
    // and the numbered window into one user message.
    const basePrompt = `${systemPrompt}\n\n${windowText}`;
    const attempts = [];

    let reply = await detect(basePrompt);
    attempts.push(reply);
    let ids = parseIdArray(reply);

    if (ids === null) {
        reply = await detect(`${basePrompt}\n\n${JSON_ONLY_REPRIMAND}`);
        attempts.push(reply);
        ids = parseIdArray(reply);
    }
    return { ids, attempts, confidence: classifyDetectionConfidence({ ids, attempts }) };
}

/**
 * Run one full Sentinel detection cycle against injected dependencies. Pure of
 * any SillyTavern import — the binding layer supplies real functions; tests
 * supply stubs. Returns (and logs) a structured record describing the cycle for
 * the debug ring buffer. Never throws for expected conditions; only truly
 * unexpected programmer errors propagate. That contract is load-bearing for the
 * offline harness, so P4.6's low-confidence signal is a `confidence` FIELD on
 * the record ('high'|'low'|'failed', absent when no detection call was made) —
 * the throw that routes a job to `needs_review` happens one layer up, at the
 * job boundary in sentinelCadence.js (`cycleNeedsReview`).
 *
 * NAME (P2.1↔P2.3 integration): this is the *engine*. It is deliberately NOT
 * called `runSentinelCycle` — that name belongs to the job executor in
 * sentinelCadence.js, whose signature is `(job, context)`. The executor calls
 * into this function via the runner registered by `registerSentinelCadence`.
 *
 * @param {{
 *   config?: object,
 *   getChat: () => Array<object>,
 *   getWatermark: () => number,
 *   isJobInFlight: () => boolean,
 *   detect: (prompt:string) => Promise<string>,
 *   runSceneMemoryRange: (start:number, end:number) => Promise<any>,
 *   isCancelled?: () => boolean,
 *   log?: (record:object) => void,
 * }} deps
 * @returns {Promise<object>} the cycle record ({ action, ... }).
 */
export async function runSentinelDetectionCycle(deps) {
    const { getChat, getWatermark, isJobInFlight, detect, runSceneMemoryRange } = deps;
    const log = typeof deps.log === 'function' ? deps.log : () => {};
    const isCancelled = typeof deps.isCancelled === 'function' ? deps.isCancelled : () => false;
    const cfg = { ...SENTINEL_DEFAULTS, ...(deps.config || {}) };

    const record = (action, extra = {}) => {
        const r = { action, ...extra };
        try { log(r); } catch { /* logging must never break a cycle */ }
        return r;
    };

    // Abort seam (P2.3 /stmb-stop + /stmbc-stop): the job executor owns an
    // AbortController; we consult it before every expensive or side-effecting
    // step so a cancel actually interrupts a *real* cycle, not just a stub.
    if (isCancelled()) return record('abort:cancelled', { at: 'start' });

    const chat = getChat();
    if (!Array.isArray(chat) || chat.length === 0) return record('skip:empty-chat');
    if (isJobInFlight()) return record('skip:job-in-flight');

    const watermark = getWatermark();
    const lastIndex = chat.length - 1;
    const newMsgs = lastIndex - watermark;
    if (!isCadenceReached(chat.length, watermark, cfg.cadenceN)) {
        return record('skip:cadence', { watermark, newMsgs, need: cfg.cadenceN });
    }

    const win = buildDetectionWindow(chat, { watermark, window: cfg.window, overlap: cfg.overlap });
    if (win.messages.length === 0) return record('skip:empty-window', { watermark });
    const windowText = formatDetectionWindow(win.messages, cfg.truncate);
    const windowIds = new Set(win.messages.map(m => m.id));

    // Optional deterministic boundary source (per-chat structure-hint regex).
    const regex = compileStructureHint(cfg.structureHintRegex);
    const structureIds = structureHintBoundaries(win.messages, regex);

    // Detection call (strict JSON, one retry, then skip). API errors => skip.
    if (isCancelled()) {
        return record('abort:cancelled', {
            at: 'before-detect',
            watermark,
            window: { start: win.start, end: win.end },
        });
    }
    let det;
    try {
        det = await detectBoundaries({
            detect,
            systemPrompt: (typeof cfg.detectionPrompt === 'string' && cfg.detectionPrompt.trim())
                ? cfg.detectionPrompt
                : APPENDIX_A_PROMPT,
            windowText,
        });
    } catch (err) {
        return record('skip:detect-error', {
            watermark,
            window: { start: win.start, end: win.end },
            error: String(err?.message || err),
            confidence: 'failed',
        });
    }

    // Unparseable after retry and no deterministic fallback => skip the cycle.
    if (det.ids === null && structureIds.length === 0) {
        return record('skip:unparseable', {
            watermark,
            window: { start: win.start, end: win.end },
            rawAttempts: det.attempts,
            confidence: det.confidence,
        });
    }

    const boundaries = snapAndGuardBoundaries({
        llmIds: det.ids ?? [],
        structureIds,
        watermark,
        lastIndex,
        guard: cfg.guard,
        windowIds,
    });
    const ranges = planSceneRanges(watermark, boundaries);

    const base = {
        watermark,
        window: { start: win.start, end: win.end },
        rawAttempts: det.attempts,
        llmIds: det.ids ?? [],
        structureIds,
        boundaries,
        ranges,
        // P4.6: how clean the parse was. Note the structure-hint fallback case —
        // `det.ids === null` with deterministic `structureIds` still reaches here
        // and is honestly labelled 'failed': the model's answer was unusable even
        // though the regex saved the cycle. That is exactly a case a human should
        // look at, so it routes to review like any other low-confidence cycle.
        confidence: det.confidence,
    };

    if (ranges.length === 0) return record('no-boundary', base);

    // Memorize completed scenes sequentially, oldest-first, awaited. Each memory
    // advances the watermark, so the ranges (computed up-front from the initial
    // watermark + absolute boundary indices) stay correct across the loop. Abort
    // the remainder on failure — a missed early scene would misalign the rest.
    // A cancel between scenes stops cleanly at a scene boundary: everything
    // already memorized stays memorized (and has advanced the watermark), so a
    // later cycle resumes from there rather than redoing work.
    const processed = [];
    let error = null;
    let cancelled = false;
    for (const [start, end] of ranges) {
        if (isCancelled()) { cancelled = true; break; }
        try {
            await runSceneMemoryRange(start, end);
            processed.push([start, end]);
        } catch (err) {
            error = String(err?.message || err);
            break;
        }
    }

    if (cancelled) {
        return record('abort:cancelled', { ...base, at: 'during-memorize', processed, error });
    }
    return record('processed', { ...base, processed, error });
}

