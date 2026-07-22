// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// nudgeHelpers.js — Phase 4 (P4.4): temperature-gradient nudges + provenance
// line helpers for the living-lorebook orchestration subsystem.
//
// Plan §4.4 (verbatim):
//   "Temperature gradient: recent scenes near-verbatim → nudge user toward
//    STMB consolidation at threshold (default 20 scene memories) → suggest
//    compaction for oversized entries. The fork *prompts*, the user approves —
//    those STMB features keep their review UIs."
//   "provenance `src: msgs X–Y` on claims; quotes accrue over the run (cap
//    per entry, replace only if better)."
//
// What this module does:
//   1. `appendProvenanceLine(content, sceneRange)` — pure string utility that
//     appends a `src: msgs X–Y` provenance line to a memory entry's content,
//     only if the range is valid and the line is not already present.
//     Used by memory generators (scene summaries, character side prompts).
//   2. `shouldNudgeConsolidation(state, opts)` — pure decision function:
//     returns `{ nudge: true|false, reason, tier, eligible, required }` for the
//     "you have N eligible memories in tier T-1; consolidate up to T" prompt.
//     Default threshold = 20 eligible entries per tier (plan §4.4).
//   3. `shouldNudgeCompaction(entry, opts)` — pure decision function:
//     returns `{ nudge: true|false, reason, contentTokens, threshold }` for the
//     "this entry is too long; run compaction" prompt. Default threshold =
//     4000 tokens (covers ≈16K characters; tune via opts).
//   4. `summarizeMemoryCount(state)` — count of memories already in the chat's
//     lorebook, used by the prompt to tell the user "you're at N".
//
// These helpers are **pure functions**: no ST runtime imports, no side effects.
// The fork's runtime (Phase 4 P4.4 wiring) is what calls them at the right
// moments. Until that runtime lands, the helpers are usable from tests and
// from any future call site (sentinel cycle, side-prompt side-effects, manual
// triggers, audit passes).
//
// The fork never *runs* consolidation or compaction automatically. Per plan
// §4.4: "The fork *prompts*, the user approves — those STMB features keep their
// review UIs." We hand off to STMB's existing `showConsolidationPreviewPopup`
// and the compaction prompt popup. This module just decides *when* to nudge.

// ----------------------------------------------------------------------------
// Provenance line
// ----------------------------------------------------------------------------

const PROVENANCE_PREFIX = '\nsrc: msgs ';

/**
 * @param {string} content
 * @param {string|{start:number,end:number}|null|undefined} sceneRange
 * @returns {string} content with a `src: msgs X–Y` line appended (only when
 *                    the range parses to a valid inclusive integer pair and
 *                    a line for that range isn't already present).
 */
export function appendProvenanceLine(content, sceneRange) {
    const range = parseSceneRange(sceneRange);
    if (!range) return String(content ?? '');
    const line = `${PROVENANCE_PREFIX}${range.start}–${range.end}`;
    const text = String(content ?? '');
    if (text.includes(line)) return text;
    // Don't double-append if some other src: line already mentions this exact
    // start-end (rare, but the function is idempotent).
    return `${text.replace(/\s*$/, '')}${line}\n`;
}

/**
 * Parse a scene range from string "X-Y" or object { start, end }.
 * @param {string|{start:number,end:number}|null|undefined} sceneRange
 * @returns {{start:number,end:number}|null}
 */
export function parseSceneRange(sceneRange) {
    if (sceneRange == null) return null;
    if (typeof sceneRange === 'object') {
        if (!Number.isInteger(sceneRange.start) || !Number.isInteger(sceneRange.end)) return null;
        if (sceneRange.start < 1 || sceneRange.end < sceneRange.start) return null;
        return { start: sceneRange.start, end: sceneRange.end };
    }
    if (typeof sceneRange !== 'string') return null;
    const m = sceneRange.trim().match(/^(\d+)\s*[-–—]\s*(\d+)$/);
    if (!m) return null;
    const start = parseInt(m[1], 10);
    const end = parseInt(m[2], 10);
    if (start < 1 || end < start) return null;
    return { start, end };
}

// ----------------------------------------------------------------------------
// Consolidation nudge
// ----------------------------------------------------------------------------

/**
 * @typedef {Object} ConsolidationState
 * @property {number} eligibleCount   - count of eligible source-tier entries in this target tier
 * @property {number} requiredMin     - threshold for this tier (min children)
 * @property {number} tier            - target tier (1-6)
 * @property {boolean} promptEnabled  - whether the user has the global "Prompt for consolidation" toggle on
 */

/**
 * Decide whether to nudge the user toward consolidating up to `tier`.
 *
 * @param {ConsolidationState} state
 * @param {Object} [opts]
 * @param {number} [opts.threshold] - explicit override; defaults to plan's 20
 * @returns {{nudge:boolean, reason:string, tier:number, eligible:number, required:number}}
 */
export function shouldNudgeConsolidation(state, opts = {}) {
    const threshold = Number.isInteger(opts.threshold) ? opts.threshold : 20;
    const tier = Number.isInteger(state?.tier) ? state.tier : 1;
    const eligible = Number.isInteger(state?.eligibleCount) ? state.eligibleCount : 0;
    const requiredMin = Number.isInteger(state?.requiredMin) ? state.requiredMin : threshold;
    const promptEnabled = state?.promptEnabled !== false; // default true

    if (!promptEnabled) {
        return { nudge: false, reason: 'prompt-disabled', tier, eligible, required: requiredMin };
    }
    if (eligible < threshold) {
        return { nudge: false, reason: 'below-threshold', tier, eligible, required: requiredMin };
    }
    if (eligible < requiredMin) {
        return { nudge: false, reason: 'below-required-min', tier, eligible, required: requiredMin };
    }
    return {
        nudge: true,
        reason: `eligible-entries-${eligible}-gte-threshold-${threshold}`,
        tier,
        eligible,
        required: requiredMin,
    };
}

// ----------------------------------------------------------------------------
// Compaction nudge
// ----------------------------------------------------------------------------

/**
 * @typedef {Object} CompactionEntry
 * @property {string|number} uid
 * @property {string} content  - entry's full content
 * @property {number} [tokens] - pre-computed token count if known
 */

/**
 * Estimate tokens from a content string. We use a conservative char/4 ratio;
 * STMB's `estimateTokens` is more accurate (uses the user's tokenizer) but
 * this helper is offline + pure so we keep the simple ratio.
 *
 * @param {string} content
 * @returns {number}
 */
export function estimateContentTokens(content) {
    if (typeof content !== 'string' || content.length === 0) return 0;
    return Math.ceil(content.length / 4);
}

/**
 * Decide whether to nudge the user toward compaction for this entry.
 *
 * @param {CompactionEntry} entry
 * @param {Object} [opts]
 * @param {number} [opts.thresholdTokens] - explicit override; defaults to 4000
 * @returns {{nudge:boolean, reason:string, contentTokens:number, threshold:number}}
 */
export function shouldNudgeCompaction(entry, opts = {}) {
    const threshold = Number.isInteger(opts.thresholdTokens) ? opts.thresholdTokens : 4000;
    const tokens = Number.isInteger(entry?.tokens)
        ? entry.tokens
        : estimateContentTokens(entry?.content);
    if (tokens >= threshold) {
        return {
            nudge: true,
            reason: `tokens-${tokens}-gte-threshold-${threshold}`,
            contentTokens: tokens,
            threshold,
        };
    }
    return {
        nudge: false,
        reason: `tokens-${tokens}-lt-threshold-${threshold}`,
        contentTokens: tokens,
        threshold,
    };
}

// ----------------------------------------------------------------------------
// Lorebook entry counting helper (for the "you're at N" prompt)
// ----------------------------------------------------------------------------

/**
 * Count "memory"-kind entries in a lorebook data object.
 *
 * @param {object|null|undefined} lorebookData
 * @param {Object} [opts]
 * @param {number[]} [opts.tiers] - restrict to specific tier indices (per STMB tier convention)
 * @returns {number}
 */
export function summarizeMemoryCount(lorebookData, opts = {}) {
    if (!lorebookData || typeof lorebookData !== 'object') return 0;
    const entries = lorebookData.entries;
    if (!entries || typeof entries !== 'object') return 0;
    const tiers = Array.isArray(opts.tiers) ? new Set(opts.tiers) : null;
    let n = 0;
    for (const entry of Object.values(entries)) {
        if (!entry || !entry.stmemorybooks) continue;
        if (tiers && !tiers.has(Number(entry.tier))) continue;
        n++;
    }
    return n;
}

// ----------------------------------------------------------------------------
// Format a human-readable nudge message (one-liner for toastr / console)
// ----------------------------------------------------------------------------

/**
 * @param {ReturnType<typeof shouldNudgeConsolidation>} nudge
 * @returns {string}
 */
export function formatConsolidationNudge(nudge) {
    if (!nudge || !nudge.nudge) return '';
    return `Consolidation available: ${nudge.eligible} eligible entries in tier ${nudge.tier - 1} → tier ${nudge.tier} (threshold ${nudge.required}).`;
}

/**
 * @param {object} opts
 * @param {string} opts.title       - entry title
 * @param {ReturnType<typeof shouldNudgeCompaction>} nudge
 * @returns {string}
 */
export function formatCompactionNudge({ title, nudge }) {
    if (!nudge || !nudge.nudge) return '';
    const safeTitle = String(title ?? '').trim() || '(untitled)';
    return `Compaction suggested for "${safeTitle}": ~${nudge.contentTokens} tokens (threshold ${nudge.threshold}).`;
}
