// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// STMB-Auto fork — Sentinel SillyTavern binding layer (Phase 2, task P2.1,
// integrated with the P2.3 jobs wiring).
// Plan: eval/materials/stmb-auto/stmb-auto-plan.md §3.3, §4.1.
//
// Wires the real SillyTavern chat/settings/profile/memory functions into the
// pure, dependency-injected engine (sentinelCore.runSentinelDetectionCycle).
// Imports follow the same static-import convention as autosummary.js, including
// the intentional circular import of isMemoryProcessing / runSceneMemoryRange
// from ./index.js (resolved at call time — autosummary.js relies on the same
// cycle).
//
// ---------------------------------------------------------------------------
// The one path (P2.1 ↔ P2.3 integration)
// ---------------------------------------------------------------------------
//
//   MESSAGE_RECEIVED
//     -> index.js handleMessageReceived
//     -> handleSentinelMessageReceived()            [this file — the cadence GATE]
//          gate: sentinel enabled? no STMB job already active? cadence reached?
//     -> enqueueSentinelCycle({ trigger: 'auto' })  [sentinelCadence.js — factory]
//     -> stmbJobs queue (dashboard, retries, abort)
//     -> runSentinelCycle(job, context)             [sentinelCadence.js — executor]
//     -> runSentinelDetectionForJob(job, context)   [this file — the runner]
//     -> runSentinelDetectionCycle(deps)            [sentinelCore.js — the ENGINE]
//
// The gate only *enqueues*; it never runs detection inline. That is what keeps
// exactly one cycle per cadence trigger, makes `/stmbc-detect` and the
// automatic path byte-identical apart from the trigger label, and puts every
// cycle under the jobs dashboard's abort control (`/stmb-stop`, `/stmbc-stop`).
//
// On/off is resolved in exactly ONE place: `resolveSentinelEnabled` from
// autoSettings.js (P2.2). This file carries no second enable check — the gate
// below and `enqueueSentinelCycle` both call that resolver.
//
// The per-cycle debug ring buffer (`chat_metadata.stmbc.cycleLog`) is owned by
// sentinelCadence.js. This file does not write it.

import { extension_settings } from '../../../extensions.js';
import { chat, chat_metadata } from '../../../../script.js';
import { getHighestMemoryProcessed } from './sceneManager.js';
import { requestCompletion } from './stmemory.js';
import { resolveEffectiveConnectionFromProfile } from './utils.js';
import { isMemoryProcessing, runSceneMemoryRange, validateLorebook } from './index.js';
// STMBC-HOOK(nudges): P4.4 consolidation/compaction nudges, fired after a sentinel
// scene memory commits (fork; plan §4.4).
import { runNudgeSweepForCurrentChat } from './livingNudges.js';
import { enqueueStmbJob, getStmbChatKey, hasActiveStmbJobs } from './stmbJobs.js';
import {
    getAutoSettings,
    getChatAutoSettings,
    resolveDetectionPrompt,
    resolveSentinelEnabled,
} from './autoSettings.js';
import {
    enqueueSentinelCycle,
    SENTINEL_CYCLE_TRIGGERS,
} from './sentinelCadence.js';
import {
    isCadenceReached,
    runSentinelDetectionCycle,
    sentinelConfigFromAutoSettings,
} from './sentinelCore.js';

/** Reentrancy guard for the gate: MESSAGE_RECEIVED can fire again mid-enqueue. */
let sentinelGateInFlight = false;

/** The fork's slice of extension_settings (what autoSettings.js expects). */
function stmbSettings() {
    return extension_settings?.STMemoryBooks || {};
}

/**
 * Resolve the effective sentinel configuration for the current chat.
 *
 * The stored→engine key mapping itself lives in
 * `sentinelCore.sentinelConfigFromAutoSettings` (pure, so the offline
 * acceptance harness drives the same translation). This function is the
 * SillyTavern-facing wrapper that reads the three autoSettings sources.
 *
 * @param {object} settings - extension_settings.STMemoryBooks
 * @param {object} chatMetadata - chat_metadata
 * @returns {{cfg: object, globalAuto: object, chatAuto: object, enabled: boolean}}
 */
export function resolveSentinelConfig(settings, chatMetadata) {
    const globalAuto = getAutoSettings(settings);
    const chatAuto = getChatAutoSettings(chatMetadata, {
        globalSentinelEnabled: globalAuto.sentinelEnabled,
    });
    // null => sentinelCore falls back to the bundled APPENDIX_A_PROMPT.
    const detectionPrompt = resolveDetectionPrompt(settings, chatMetadata);
    const cfg = sentinelConfigFromAutoSettings(globalAuto, chatAuto, detectionPrompt);

    return {
        cfg,
        globalAuto,
        chatAuto,
        // Single source of truth (autoSettings.js) — the same resolver the P2.3
        // factory and the P2.4 auto-summary gate use.
        enabled: resolveSentinelEnabled(settings, chatMetadata),
    };
}

/**
 * The watermark: highest chat index already covered by a memory. Falls back to
 * the per-chat `watermarkFallback` (P2.2 setting) for chats whose lorebook
 * predates STMB range tracking. `-1` means "nothing memorized yet".
 *
 * @param {object} chatAuto - resolved per-chat auto settings
 * @returns {number}
 */
export function resolveSentinelWatermark(chatAuto) {
    const wm = getHighestMemoryProcessed();
    if (Number.isFinite(wm)) return wm;
    const fb = chatAuto?.watermarkFallback;
    return Number.isFinite(fb) ? fb : -1;
}

/**
 * Build the real dependency bundle for the engine, or null when the sentinel is
 * disabled for this chat. All SillyTavern access lives here.
 *
 * @param {object} [context] - stmbJobs per-job context ({ signal, isCancelled, ... })
 * @returns {object|null}
 */
function buildSentinelDeps(context) {
    const settings = stmbSettings();
    const { cfg, chatAuto, enabled } = resolveSentinelConfig(settings, chat_metadata);
    if (!enabled) return null;

    const profiles = Array.isArray(settings.profiles) ? settings.profiles : [];
    let profileIdx = Number(cfg.detectionProfile);
    if (!Number.isInteger(profileIdx) || profileIdx < 0 || profileIdx >= profiles.length) {
        profileIdx = Number(settings.defaultProfile ?? 0);
    }
    const profile = profiles[profileIdx] || {};
    const conn = resolveEffectiveConnectionFromProfile(profile);

    const isCancelled = () => {
        if (!context) return false;
        if (typeof context.isCancelled === 'function') return !!context.isCancelled();
        return !!(context.signal && context.signal.aborted);
    };

    return {
        config: cfg,
        // `chat` is a live binding from script.js — read fresh each call.
        getChat: () => chat,
        getWatermark: () => resolveSentinelWatermark(chatAuto),
        // NOTE: this is the *memory generation* flag, not the jobs queue. The
        // engine runs inside a queued job, so consulting hasActiveStmbJobs here
        // would deadlock the sentinel against its own job.
        isJobInFlight: () => !!isMemoryProcessing(),
        isCancelled,
        detect: async (prompt) => {
            const { text } = await requestCompletion({
                api: conn.api,
                model: conn.model,
                endpoint: conn.endpoint,
                apiKey: conn.apiKey,
                reverseProxy: conn.reverseProxy,
                prompt,
                temperature: 0,            // deterministic detection (matches eval)
                extra: { max_tokens: 300 },
            });
            return text;
        },
        runSceneMemoryRange: async (start, end) => {
            const ok = await runSceneMemoryRange(start, end, { showSceneToast: false });
            if (ok === false) throw new Error(`runSceneMemoryRange(${start}, ${end}) failed`);
            // STMBC-HOOK(nudges): P4.4 temperature gradient — once the scene memory has
            // COMMITTED, offer consolidation/compaction via STMB's own review UIs (plan
            // §4.4: "the fork prompts, the user approves"). Advisory and never-throws, so
            // it cannot fail a memory that already succeeded.
            await runNudgeSweepForCurrentChat(settings, { validateLorebook });
        },
        // Console only. Persistence to chat_metadata.stmbc.cycleLog is the job
        // executor's business — sentinelCadence.js owns the ring buffer.
        log: (rec) => {
            if (getAutoSettings(settings).debugLogging) {
                console.debug(`STMemoryBooks: sentinel cycle -> ${rec.action}`, rec);
            }
        },
    };
}

/**
 * The job runner installed into sentinelCadence's executor at init. Builds the
 * SillyTavern-bound deps and runs one detection cycle.
 *
 * @param {object} job - stmbJobs job record
 * @param {object} [context] - stmbJobs per-job context ({ signal, isCancelled })
 * @returns {Promise<object>} the engine's cycle record
 */
export async function runSentinelDetectionForJob(job, context) {
    const deps = buildSentinelDeps(context);
    if (!deps) return { action: 'skip:disabled' };
    return runSentinelDetectionCycle(deps);
}

/**
 * MESSAGE_RECEIVED cadence gate (wired from index.js handleMessageReceived).
 *
 * Cheap checks only — it decides *whether* a cycle is due and enqueues one. It
 * never runs detection inline; see the path diagram at the top of this file.
 * Silently no-ops when the sentinel is disabled.
 */
export async function handleSentinelMessageReceived() {
    if (sentinelGateInFlight) return;
    sentinelGateInFlight = true;
    try {
        const settings = stmbSettings();
        const { cfg, chatAuto, enabled } = resolveSentinelConfig(settings, chat_metadata);
        if (!enabled) return;
        if (!Array.isArray(chat) || chat.length === 0) return;

        // Don't pile cycles up behind in-flight STMB work (including a sentinel
        // cycle already queued for this chat, and the memory jobs one spawns).
        if (hasActiveStmbJobs(getStmbChatKey())) return;

        const watermark = resolveSentinelWatermark(chatAuto);
        if (!isCadenceReached(chat.length, watermark, cfg.cadenceN)) return;

        const result = enqueueSentinelCycle({
            enqueueStmbJob,
            settings,
            chatMeta: chat_metadata,
            trigger: SENTINEL_CYCLE_TRIGGERS.AUTO,
        });
        if (!result.ok) {
            console.debug(`STMemoryBooks: sentinel cycle not enqueued — ${result.reason}`);
        }
    } catch (err) {
        console.error('STMemoryBooks: sentinel gate error', err);
    } finally {
        sentinelGateInFlight = false;
    }
}
