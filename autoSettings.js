// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// autoSettings.js — Phase 2 (P2.2): settings storage for the Auto subsystem.
//
// Two scopes:
//
//   Global   → extension_settings.STMemoryBooks.autoModule
//               (sentinel on/off, cadence, window size, truncation,
//                guard, detection profile, detection prompt, debug logging)
//
//   Per-chat → chat_metadata.stmbc
//               (enabled, watermark fallback, structure-hint regex,
//                prompt override)
//
// Why a separate module (plan §4.5): the Auto subsystem adds ~10 fields to
// both global and per-chat settings. Keeping them in their own module makes
// the merge map clean (single-file addition, additive only) and isolates the
// migration story (one-shot backfill of defaults).
//
// Why the read APIs merge defaults onto whatever's stored: in production we
// see settings objects with partial Auto data (older versions, manual edits,
// half-migrated state). The merger is the single point that decides what a
// field means when it's missing.

// `chat_metadata` is the SillyTavern runtime global. We resolve it lazily via
// a tiny helper so the unit tests can run in a Node-only environment (where
// the ST global isn't on `globalThis`). The public APIs accept an explicit
// `chatMeta` argument; when none is passed, the helper returns `null`, which
// downstream functions treat as "no chat metadata available" (uses defaults).
function getDefaultChatMeta() {
    try {
        if (typeof globalThis !== 'undefined' && globalThis.chat_metadata != null) {
            return globalThis.chat_metadata;
        }
    } catch (_e) { /* no globalThis */ }
    return null;
}

// ----------------------------------------------------------------------------
// Defaults
// ----------------------------------------------------------------------------

/** @type {Readonly<{sentinelEnabled: boolean, cadenceMessages: number, windowSize: number, windowOverlap: number, truncateChars: number, guardSize: number, detectionProfileIndex: number|null, detectionPrompt: string, debugLogging: boolean, auditorOfferEnabled: boolean, auditorEveryNScenes: number}>} */
export const AUTO_MODULE_DEFAULTS = Object.freeze({
    sentinelEnabled: false,
    cadenceMessages: 8,
    windowSize: 26,
    windowOverlap: 8,
    truncateChars: 500,
    guardSize: 4,
    detectionProfileIndex: null, // null = use the default STMB profile
    detectionPrompt: '', // empty = use the bundled baseline prompt
    debugLogging: false,
    auditorOfferEnabled: true,
    auditorEveryNScenes: 15,
});

/** @type {Readonly<{enabled: boolean|null, watermarkFallback: number|null, structureHintRegex: string, promptOverride: string}>} */
export const CHAT_AUTO_DEFAULTS = Object.freeze({
    enabled: null, // null = inherit from global sentinelEnabled
    watermarkFallback: null, // null = no fallback; integer = override message index
    structureHintRegex: '', // empty = no hint
    promptOverride: '', // empty = no override
});

// ----------------------------------------------------------------------------
// Numeric clamps (plan §3.3 + §4.1)
// ----------------------------------------------------------------------------

const CLAMPS = Object.freeze({
    cadenceMessages: { min: 1, max: 200, def: AUTO_MODULE_DEFAULTS.cadenceMessages },
    windowSize:      { min: 4, max: 200, def: AUTO_MODULE_DEFAULTS.windowSize },
    windowOverlap:   { min: 0, max: 100, def: AUTO_MODULE_DEFAULTS.windowOverlap },
    truncateChars:   { min: 50, max: 5000, def: AUTO_MODULE_DEFAULTS.truncateChars },
    guardSize:       { min: 0, max: 50, def: AUTO_MODULE_DEFAULTS.guardSize },
    watermarkFallback: { min: 0, max: 1_000_000, def: 0 },
    auditorEveryNScenes: { min: 1, max: 1000, def: AUTO_MODULE_DEFAULTS.auditorEveryNScenes },
});

function clampInt(value, { min, max, def }) {
    if (value == null || value === '') return def;
    const n = Number.isInteger(value) ? value : parseInt(value, 10);
    if (!Number.isFinite(n)) return def;
    if (n < min) return min;
    if (n > max) return max;
    return n;
}

// ----------------------------------------------------------------------------
// Validation
// ----------------------------------------------------------------------------

/**
 * Validate a partial Auto-module patch and return a sanitized version.
 * Unknown fields are dropped. Known fields are coerced/clamped.
 *
 * @param {object} patch
 * @returns {object} sanitized patch (may be empty)
 */
export function validateAutoPatch(patch) {
    if (!patch || typeof patch !== 'object') return {};
    const out = {};
    if ('sentinelEnabled' in patch) {
        out.sentinelEnabled = !!patch.sentinelEnabled;
    }
    if ('cadenceMessages' in patch) {
        out.cadenceMessages = clampInt(patch.cadenceMessages, CLAMPS.cadenceMessages);
    }
    if ('windowSize' in patch) {
        out.windowSize = clampInt(patch.windowSize, CLAMPS.windowSize);
    }
    if ('windowOverlap' in patch) {
        out.windowOverlap = clampInt(patch.windowOverlap, CLAMPS.windowOverlap);
    }
    if ('truncateChars' in patch) {
        out.truncateChars = clampInt(patch.truncateChars, CLAMPS.truncateChars);
    }
    if ('guardSize' in patch) {
        out.guardSize = clampInt(patch.guardSize, CLAMPS.guardSize);
    }
    if ('detectionProfileIndex' in patch) {
        const v = patch.detectionProfileIndex;
        out.detectionProfileIndex = (v == null || v === '' || v === 'null') ? null : clampInt(v, { min: 0, max: 1_000, def: 0 });
    }
    if ('detectionPrompt' in patch) {
        const v = patch.detectionPrompt;
        out.detectionPrompt = typeof v === 'string' ? v : '';
    }
    if ('debugLogging' in patch) {
        out.debugLogging = !!patch.debugLogging;
    }
    return out;
}

/**
 * Validate a partial per-chat Auto patch. Similar semantics to validateAutoPatch.
 * `enabled` accepts null|true|false; null means "inherit from global".
 *
 * @param {object} patch
 * @returns {object} sanitized patch
 */
export function validateChatAutoPatch(patch) {
    if (!patch || typeof patch !== 'object') return {};
    const out = {};
    if ('enabled' in patch) {
        const v = patch.enabled;
        out.enabled = (v == null || v === '' || v === 'null') ? null : !!v;
    }
    if ('watermarkFallback' in patch) {
        const v = patch.watermarkFallback;
        if (v == null || v === '' || v === 'null') {
            out.watermarkFallback = null;
        } else {
            out.watermarkFallback = clampInt(v, CLAMPS.watermarkFallback);
        }
    }
    if ('structureHintRegex' in patch) {
        const v = patch.structureHintRegex;
        if (typeof v !== 'string') {
            out.structureHintRegex = '';
        } else {
            // Validate the regex compiles; on failure, drop to empty (don't throw).
            try {
                if (v.length > 0) new RegExp(v);
                out.structureHintRegex = v;
            } catch (_e) {
                out.structureHintRegex = '';
            }
        }
    }
    if ('promptOverride' in patch) {
        const v = patch.promptOverride;
        out.promptOverride = typeof v === 'string' ? v : '';
    }
    return out;
}

// ----------------------------------------------------------------------------
// Global auto-module read/write
// ----------------------------------------------------------------------------

/**
 * Read the global Auto-module settings, merged with defaults.
 * Does not mutate the input.
 *
 * @param {object} settings - the full extension_settings.STMemoryBooks object
 * @returns {object} fully-populated autoModule object
 */
export function getAutoSettings(settings) {
    const stored = (settings && settings.autoModule && typeof settings.autoModule === 'object')
        ? settings.autoModule
        : {};
    return { ...AUTO_MODULE_DEFAULTS, ...stored };
}

/**
 * Apply a sanitized patch to the global auto-module settings (mutates in place).
 * Creates the autoModule container if missing.
 *
 * @param {object} settings - the full extension_settings.STMemoryBooks object
 * @param {object} patch - sanitized patch from validateAutoPatch
 * @returns {object} the resulting autoModule object
 */
export function setAutoSettings(settings, patch) {
    if (!settings || typeof settings !== 'object') {
        throw new TypeError('setAutoSettings: settings must be an object');
    }
    if (!settings.autoModule || typeof settings.autoModule !== 'object') {
        settings.autoModule = {};
    }
    const merged = { ...getAutoSettings(settings), ...patch };
    Object.assign(settings.autoModule, patch);
    return merged;
}

/**
 * Backfill missing fields onto the stored autoModule so subsequent reads are stable.
 * Migration-safe: only writes if a field is absent.
 *
 * @param {object} settings
 */
export function initializeAutoSettings(settings) {
    if (!settings || typeof settings !== 'object') return;
    if (!settings.autoModule || typeof settings.autoModule !== 'object') {
        settings.autoModule = { ...AUTO_MODULE_DEFAULTS };
        return;
    }
    for (const [k, v] of Object.entries(AUTO_MODULE_DEFAULTS)) {
        if (!(k in settings.autoModule)) settings.autoModule[k] = v;
    }
}

// ----------------------------------------------------------------------------
// Per-chat auto settings (chat_metadata.stmbc)
// ----------------------------------------------------------------------------

/**
 * Read per-chat Auto settings, merged with defaults. The `enabled` field
 * resolves null → the global sentinelEnabled value at read time so callers
 * see a concrete boolean.
 *
 * @param {object} chatMeta - chat_metadata object (defaults to current chat)
 * @param {object} [opts]
 * @param {boolean} [opts.globalSentinelEnabled] - global sentinel on/off (used to resolve null)
 * @returns {object} fully-populated per-chat Auto settings (always concrete enabled)
 */
export function getChatAutoSettings(chatMeta = getDefaultChatMeta(), opts = {}) {
    const stored = (chatMeta && chatMeta.stmbc && typeof chatMeta.stmbc === 'object')
        ? chatMeta.stmbc
        : {};
    const merged = { ...CHAT_AUTO_DEFAULTS, ...stored };
    if (merged.enabled == null) {
        merged.enabled = opts.globalSentinelEnabled === true;
    }
    return merged;
}

/**
 * Apply a sanitized patch to the per-chat Auto settings (mutates chatMeta in place).
 *
 * @param {object} chatMeta
 * @param {object} patch - sanitized patch from validateChatAutoPatch
 */
export function setChatAutoSettings(chatMeta, patch) {
    if (!chatMeta || typeof chatMeta !== 'object') {
        throw new TypeError('setChatAutoSettings: chatMeta must be an object');
    }
    if (!chatMeta.stmbc || typeof chatMeta.stmbc !== 'object') {
        chatMeta.stmbc = {};
    }
    Object.assign(chatMeta.stmbc, patch);
}

/**
 * Backfill per-chat defaults if missing.
 *
 * @param {object} chatMeta
 */
export function initializeChatAutoSettings(chatMeta) {
    if (!chatMeta || typeof chatMeta !== 'object') return;
    if (!chatMeta.stmbc || typeof chatMeta.stmbc !== 'object') {
        chatMeta.stmbc = { ...CHAT_AUTO_DEFAULTS };
        return;
    }
    for (const [k, v] of Object.entries(CHAT_AUTO_DEFAULTS)) {
        if (!(k in chatMeta.stmbc)) chatMeta.stmbc[k] = v;
    }
}

// ----------------------------------------------------------------------------
// Resolve "what does the user want for THIS chat right now?"
// ----------------------------------------------------------------------------

/**
 * Resolve the effective sentinel on/off for the current chat.
 * Per-chat `enabled` (when non-null) wins; otherwise global sentinelEnabled.
 *
 * @param {object} settings - global extension_settings
 * @param {object} [chatMeta] - chat_metadata; defaults to current
 * @returns {boolean}
 */
export function resolveSentinelEnabled(settings, chatMeta = getDefaultChatMeta()) {
    const globalAuto = getAutoSettings(settings);
    const chatAuto = getChatAutoSettings(chatMeta, { globalSentinelEnabled: globalAuto.sentinelEnabled });
    return chatAuto.enabled;
}

/**
 * Resolve the effective autoSummaryEnabled flag for the current chat.
 *
 * Phase 2 (P2.4) — plan §4.1 + §1.2.4: native auto-summary is force-disabled
 * while sentinel is enabled for a chat. We don't mutate the stored setting —
 * we just return false when sentinel is on, so all callers (runtime + UI)
 * agree on the same effective value. The setting key stays unchanged
 * (`extension_settings.STMemoryBooks.moduleSettings.autoSummaryEnabled`)
 * for data compatibility; we just never honor a `true` value while sentinel
 * is on.
 *
 * Note: per plan §1.2.4 we use configuration (this resolver) instead of
 * modifying autosummary.js. autosummary.js stays untouched for mergeability.
 *
 * @param {object} settings - global extension_settings
 * @param {object} [chatMeta] - chat_metadata; defaults to current
 * @returns {boolean}
 */
export function resolveAutoSummaryEnabled(settings, chatMeta = getDefaultChatMeta()) {
    if (resolveSentinelEnabled(settings, chatMeta)) return false;
    const stored = settings?.moduleSettings?.autoSummaryEnabled;
    return stored === true;
}

/**
 * Resolve the effective detection prompt for the current chat.
 * Per-chat promptOverride (when non-empty) wins; otherwise global detectionPrompt.
 * Empty global detectionPrompt means "use bundled baseline" (signaled by returning null).
 *
 * @param {object} settings
 * @param {object} [chatMeta]
 * @returns {string|null} prompt text, or null to use the bundled baseline
 */
export function resolveDetectionPrompt(settings, chatMeta = getDefaultChatMeta()) {
    const globalAuto = getAutoSettings(settings);
    const chatAuto = getChatAutoSettings(chatMeta, { globalSentinelEnabled: globalAuto.sentinelEnabled });
    if (chatAuto.promptOverride && chatAuto.promptOverride.trim().length > 0) {
        return chatAuto.promptOverride;
    }
    if (globalAuto.detectionPrompt && globalAuto.detectionPrompt.trim().length > 0) {
        return globalAuto.detectionPrompt;
    }
    return null;
}