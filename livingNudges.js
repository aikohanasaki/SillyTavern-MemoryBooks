// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// livingNudges.js — Phase 4 (P4.4): orchestrator that calls STMB's existing
// review UIs when the temperature-gradient nudges in nudgeHelpers fire.
//
// Per plan §4.4 (verbatim):
//   "Temperature gradient: recent scenes near-verbatim → nudge user toward STMB
//    consolidation at threshold (default 20 scene memories) → suggest compaction
//    for oversized entries. The fork *prompts*, the user approves — those STMB
//    features keep their review UIs."
//
// This module is the *thin glue* between the pure decision functions in
// nudgeHelpers.js and STMB's existing popup APIs (showConsolidationPreviewPopup
// for consolidation; the compaction prompt popup for compaction). The fork
// never *runs* the consolidation or compaction itself; it always defers to
// the user's existing STMB review UIs.
//
// Layering:
//   - nudgeHelpers.js — pure decision functions (no ST runtime imports)
//   - livingNudges.js (this file) — calls STMB UI; lazy/optional imports of
//     STMB internals so the file can be loaded in tests without ST present.
//   - Auto-module runtime (Phase 2 sentinel cycles, future) — calls into here
//     at the right moments.
//
// All exported functions are designed to be safely called from a context
// where the ST runtime may or may not be loaded. The UI hooks are no-ops if
// the runtime isn't ready.

import {
    shouldNudgeConsolidation,
    shouldNudgeCompaction,
    estimateContentTokens,
    summarizeMemoryCount,
    formatConsolidationNudge,
    formatCompactionNudge,
} from './nudgeHelpers.js';

const DEFAULT_CONSOLIDATION_THRESHOLD = 20;
const DEFAULT_COMPACTION_TOKENS = 4000;

// ----------------------------------------------------------------------------
// Lazy STMB API access
// ----------------------------------------------------------------------------

let _showConsolidationPreviewPopup = null;
let _populateLorebookEntriesBatch = null;
let _validateLorebook = null;

async function ensureStmbApisLoaded() {
    if (_showConsolidationPreviewPopup && _populateLorebookEntriesBatch && _validateLorebook) {
        return true;
    }
    try {
        // Use globalThis access to avoid bundler cycle issues; STMB exposes
        // showConsolidationPreviewPopup on globalThis via confirmationPopup.js.
        const mod = await import('./confirmationPopup.js');
        _showConsolidationPreviewPopup = mod?.showConsolidationPreviewPopup ?? null;
    } catch (_e) { _showConsolidationPreviewPopup = null; }
    try {
        const mod = await import('./addlore.js');
        _populateLorebookEntriesBatch = mod?.populateLorebookEntriesBatch ?? null;
        _validateLorebook = mod?.validateLorebook ?? null;
    } catch (_e) {
        _populateLorebookEntriesBatch = null;
        _validateLorebook = null;
    }
    return Boolean(_showConsolidationPreviewPopup);
}

/**
 * Inspect a chat's lorebook and return a per-tier eligibility summary suitable
 * for shouldNudgeConsolidation.
 *
 * @param {object} settings - global extension_settings.STMemoryBooks
 * @param {object} lorebookValidation - { name, valid, data } from validateLorebook
 * @returns {Array<{tier:number, eligibleCount:number, requiredMin:number}>}
 */
export function summarizeConsolidationEligibility(settings, lorebookValidation) {
    if (!lorebookValidation?.valid || !lorebookValidation.data) return [];
    const data = lorebookValidation.data;
    const out = [];
    for (let tier = 2; tier <= 6; tier++) {
        const sourceTier = tier - 1;
        const requiredMin = Number.isInteger(settings?.moduleSettings?.summaryTierMinimums?.[tier])
            ? settings.moduleSettings.summaryTierMinimums[tier]
            : 5; // default per plan §6
        // Heuristic: count entries flagged stmemorybooks that have at least sourceTier
        // i.e. not the same tier or above. STMB itself uses an isEligibleSummarySourceEntry
        // helper that we don't import here (would require pulling in utils.js's
        // tier-magic constants). For the purpose of *deciding* whether to nudge,
        // counting source-tier entries is close enough; the user gets the actual
        // list when they accept the prompt via showConsolidationPreviewPopup.
        let eligibleCount = 0;
        for (const entry of Object.values(data.entries || {})) {
            if (!entry?.stmemorybooks) continue;
            const entryTier = Number(entry.tier);
            if (entryTier === sourceTier) eligibleCount++;
        }
        out.push({ tier, eligibleCount, requiredMin });
    }
    return out;
}

/**
 * Decide whether to show the consolidation prompt for any tier right now, and
 * if so, return the first tier that triggers (lowest tier wins).
 *
 * @param {object} settings
 * @param {object} lorebookValidation
 * @param {Object} [opts]
 * @param {number} [opts.threshold] - override default threshold (20)
 * @returns {{nudge:boolean, tier?:number, eligible?:number, required?:number, reason?:string, line?:string}}
 */
export function shouldShowConsolidationPrompt(settings, lorebookValidation, opts = {}) {
    const threshold = Number.isInteger(opts.threshold) ? opts.threshold : DEFAULT_CONSOLIDATION_THRESHOLD;
    const promptEnabled = settings?.moduleSettings?.autoConsolidationPromptEnabled !== false;
    const summary = summarizeConsolidationEligibility(settings, lorebookValidation);
    for (const { tier, eligibleCount, requiredMin } of summary) {
        const decision = shouldNudgeConsolidation({
            eligibleCount,
            requiredMin,
            tier,
            promptEnabled,
        }, { threshold });
        if (decision.nudge) {
            return {
                nudge: true,
                ...decision,
                line: formatConsolidationNudge(decision),
            };
        }
    }
    return { nudge: false, reason: 'no-tier-ready' };
}

/**
 * Inspect an entry's content and decide whether to surface a compaction
 * suggestion to the user.
 *
 * @param {object} entry - { uid, content, comment/title }
 * @param {Object} [opts]
 * @returns {{nudge:boolean, contentTokens:number, threshold:number, reason?:string, line?:string}}
 */
export function shouldShowCompactionPrompt(entry, opts = {}) {
    const threshold = Number.isInteger(opts.thresholdTokens) ? opts.thresholdTokens : DEFAULT_COMPACTION_TOKENS;
    const decision = shouldNudgeCompaction(entry, { thresholdTokens: threshold });
    return {
        ...decision,
        line: formatCompactionNudge({
            title: entry?.comment ?? entry?.title,
            nudge: decision,
        }),
    };
}

// ----------------------------------------------------------------------------
// Side-effecting helpers (call STMB UIs when nudges fire)
// ----------------------------------------------------------------------------

/**
 * Run a consolidation nudge check. If a tier is ready, surface a toastr
 * one-liner AND return `{ prompted: true, tier, ... }` so the caller can
 * call showConsolidationPreviewPopup via its own context (e.g. the
 * post-memory-commit hook). If nothing is ready, returns `{ prompted: false }`.
 *
 * Toastr is used because it's already the project's standard for STMB
 * notifications; the user keeps control via STMB's review UI (popup).
 *
 * @param {object} settings
 * @param {object} lorebookValidation
 * @param {Object} [opts]
 * @returns {Promise<{prompted: boolean, tier?: number, eligible?: number, required?: number, line?: string}>}
 */
export async function maybePromptConsolidation(settings, lorebookValidation, opts = {}) {
    const decision = shouldShowConsolidationPrompt(settings, lorebookValidation, opts);
    if (!decision.nudge) return { prompted: false };
    // Lazy-load toastr so tests can run in pure Node.
    let toastr = null;
    try {
        const mod = await import('../../../toastr.js').catch(() => null);
        toastr = mod?.default ?? mod?.toastr ?? (typeof globalThis !== 'undefined' ? globalThis.toastr : null);
    } catch (_e) { /* noop */ }
    if (toastr && decision.line) {
        try { toastr.info(decision.line, 'STMemoryBooks'); } catch (_e) { /* noop */ }
    }
    return {
        prompted: true,
        tier: decision.tier,
        eligible: decision.eligible,
        required: decision.required,
        line: decision.line,
    };
}

/**
 * Run a compaction nudge check on a single entry. Surfaces a toastr
 * one-liner and returns the decision.
 *
 * @param {object} entry
 * @param {Object} [opts]
 * @returns {Promise<{prompted: boolean, contentTokens?: number, threshold?: number, line?: string}>}
 */
export async function maybePromptCompaction(entry, opts = {}) {
    const decision = shouldShowCompactionPrompt(entry, opts);
    if (!decision.nudge) return { prompted: false };
    let toastr = null;
    try {
        const mod = await import('../../../toastr.js').catch(() => null);
        toastr = mod?.default ?? mod?.toastr ?? (typeof globalThis !== 'undefined' ? globalThis.toastr : null);
    } catch (_e) { /* noop */ }
    if (toastr && decision.line) {
        try { toastr.info(decision.line, 'STMemoryBooks'); } catch (_e) { /* noop */ }
    }
    return {
        prompted: true,
        contentTokens: decision.contentTokens,
        threshold: decision.threshold,
        line: decision.line,
    };
}

// ----------------------------------------------------------------------------
// Convenience: full sweep over a lorebook
// ----------------------------------------------------------------------------

/**
 * Run all nudges over a lorebook in one pass. Returns a structured summary
 * suitable for logging or a future jobs-dashboard status entry.
 *
 * @param {object} settings
 * @param {object} lorebookValidation
 * @param {Object} [opts]
 * @returns {Promise<{
 *   consolidation: object | null,
 *   compactions: Array<object>,
 *   memoryCount: number,
 * }>}
 */
export async function runNudgeSweep(settings, lorebookValidation, opts = {}) {
    const consolidation = await maybePromptConsolidation(settings, lorebookValidation, opts);
    const data = lorebookValidation?.valid ? lorebookValidation.data : null;
    const memoryCount = summarizeMemoryCount(data);
    const compactions = [];
    if (data && data.entries) {
        for (const entry of Object.values(data.entries)) {
            if (!entry?.stmemorybooks) continue;
            const result = shouldShowCompactionPrompt(entry, opts);
            if (result.nudge) compactions.push({
                uid: entry.uid,
                title: entry.comment ?? entry.title,
                contentTokens: result.contentTokens,
                threshold: result.threshold,
                line: result.line,
            });
        }
    }
    return { consolidation, compactions, memoryCount };
}
