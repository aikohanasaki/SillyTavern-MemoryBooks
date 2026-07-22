// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// STMB-Auto fork — Sentinel SillyTavern binding layer (Phase 2, task P2.1).
// Plan: eval/materials/stmb-auto/stmb-auto-plan.md §3.3, §4.1.
//
// Wires the real SillyTavern chat/settings/profile/memory functions into the
// pure, dependency-injected core (sentinelCore.js). Imports follow the same
// static-import convention as autosummary.js, including the intentional
// circular import of isMemoryProcessing / runSceneMemoryRange from ./index.js
// (resolved at call time — autosummary.js relies on the same cycle).
//
// handleSentinelMessageReceived() is invoked from index.js handleMessageReceived
// on MESSAGE_RECEIVED (the proven cadence event; ST has no GENERATION_ENDED).

import { extension_settings } from '../../../extensions.js';
import { chat, chat_metadata } from '../../../../script.js';
import { getHighestMemoryProcessed, saveMetadataForCurrentContext } from './sceneManager.js';
import { requestCompletion } from './stmemory.js';
import { resolveEffectiveConnectionFromProfile } from './utils.js';
import { isMemoryProcessing, runSceneMemoryRange } from './index.js';
import {
    SENTINEL_DEFAULTS,
    SENTINEL_RING_SIZE,
    runSentinelCycle,
} from './sentinelCore.js';

/** Reentrancy guard: MESSAGE_RECEIVED can fire again mid-cycle. */
let sentinelCycleInFlight = false;

/**
 * Merge sentinel configuration from global settings and per-chat metadata over
 * the defaults. Global lives at extension_settings.STMemoryBooks.autoModule
 * (plan §4.5); per-chat at chat_metadata.stmbc. Returns the merged config plus
 * the resolved enabled flag (off by default).
 */
export function resolveSentinelConfig(extensionSettings, chatMetadata) {
    const global = extensionSettings?.STMemoryBooks?.autoModule || {};
    const perChat = chatMetadata?.stmbc || {};
    const cfg = { ...SENTINEL_DEFAULTS };

    for (const key of ['cadenceN', 'window', 'overlap', 'truncate', 'guard', 'detectionProfile']) {
        if (global[key] != null) cfg[key] = global[key];
    }
    if (typeof global.detectionPrompt === 'string' && global.detectionPrompt.trim()) {
        cfg.detectionPrompt = global.detectionPrompt;
    }
    // Per-chat overrides win over global.
    if (typeof perChat.detectionPrompt === 'string' && perChat.detectionPrompt.trim()) {
        cfg.detectionPrompt = perChat.detectionPrompt;
    }
    if (typeof perChat.structureHintRegex === 'string') {
        cfg.structureHintRegex = perChat.structureHintRegex;
    }

    const enabled = (typeof perChat.enabled === 'boolean') ? perChat.enabled : !!global.enabled;
    return { cfg, global, perChat, enabled };
}

/**
 * Build the real dependency bundle for runSentinelCycle, or null when the
 * sentinel is disabled for this chat. All SillyTavern access lives here.
 */
function buildSentinelDeps() {
    const { cfg, enabled } = resolveSentinelConfig(extension_settings, chat_metadata);
    if (!enabled) return null;

    const settings = extension_settings.STMemoryBooks || {};
    const profiles = Array.isArray(settings.profiles) ? settings.profiles : [];
    let profileIdx = Number(cfg.detectionProfile);
    if (!Number.isInteger(profileIdx) || profileIdx < 0 || profileIdx >= profiles.length) {
        profileIdx = Number(settings.defaultProfile ?? 0);
    }
    const profile = profiles[profileIdx] || {};
    const conn = resolveEffectiveConnectionFromProfile(profile);

    return {
        config: cfg,
        // `chat` is a live binding from script.js — read fresh each call.
        getChat: () => chat,
        getWatermark: () => {
            const wm = getHighestMemoryProcessed();
            if (Number.isFinite(wm)) return wm;
            const fb = chat_metadata?.stmbc?.watermark;
            return Number.isFinite(fb) ? fb : -1;
        },
        isJobInFlight: () => !!isMemoryProcessing(),
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
        },
        log: (rec) => {
            try {
                const stmbc = chat_metadata.stmbc || (chat_metadata.stmbc = {});
                const buf = Array.isArray(stmbc.cycleLog) ? stmbc.cycleLog : (stmbc.cycleLog = []);
                buf.push({ t: Date.now(), ...rec });
                while (buf.length > SENTINEL_RING_SIZE) buf.shift();
                saveMetadataForCurrentContext();
            } catch (e) {
                console.debug('STMemoryBooks: sentinel ring-buffer log failed', e);
            }
            console.debug(`STMemoryBooks: sentinel cycle -> ${rec.action}`, rec);
        },
    };
}

/**
 * MESSAGE_RECEIVED handler (wired from index.js handleMessageReceived). Runs at
 * most one cycle at a time; silently no-ops when the sentinel is disabled.
 */
export async function handleSentinelMessageReceived() {
    if (sentinelCycleInFlight) return;
    sentinelCycleInFlight = true;
    try {
        const deps = buildSentinelDeps();
        if (!deps) return;
        await runSentinelCycle(deps);
    } catch (err) {
        console.error('STMemoryBooks: sentinel handler error', err);
    } finally {
        sentinelCycleInFlight = false;
    }
}
