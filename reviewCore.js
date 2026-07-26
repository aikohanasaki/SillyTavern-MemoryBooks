// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// STMB-Auto fork — Review queue + consolidation/compaction nudges, pure logic
// (Phase 4, task P4.3). Plan: eval/materials/stmb-auto/stmb-auto-plan.md §4.4
// (review queue; temperature-gradient nudges) and §5 (never guess on parse
// failure; no silent caps).
//
// This file holds the dependency-injected, SillyTavern-free core so it is
// unit-testable under node:test (see review.test.js), exactly like the other
// Phase cores (sentinelCore.js, injectionCore.js, auditorCore.js). The runtime
// binding that touches chat_metadata/extension_settings/Popup lives in
// review.js and is invoked from ONE `STMBC-HOOK(review)` block each in
// stmemory.js (JSON retry) and index.js (post-save flagging + nudges).
//
// What it does: memories always save immediately (plan §4.4 "memories save
// immediately") — nothing here ever blocks or reverses a save. It only (1)
// decides whether a completed generation should be flagged for a non-blocking
// post-hoc review (JSON needed a retry, or the model's own error-control rules
// from injectionCore.js produced a self-flag in the generated text), and (2)
// decides, from plain counters, when to offer — never force — a consolidation
// or compaction nudge, reusing STMB's own review UIs (plan §4.4 "the fork
// *prompts*, the user approves").

// ---------------------------------------------------------------- defaults

/** Review-queue + nudge defaults (plan §4.4, §4.5); all user-tunable. */
export const REVIEW_DEFAULTS = Object.freeze({
    enabled: true,                  // purely additive/non-blocking; safe to default on
    consolidationThreshold: 20,     // scene memories since last nudge (plan §4.4 "default 20")
    compactionTokenThreshold: 500,  // matches clipManager's own "getting long" threshold
});

/**
 * Merge review configuration from global settings and per-chat metadata over
 * the defaults. Global lives at extension_settings.STMemoryBooks.autoModule.review
 * (plan §4.5); per-chat at chat_metadata.stmbc.review. Per-chat wins over global.
 */
export function resolveReviewConfig(global, perChat) {
    const g = (global && global.review) || {};
    const p = (perChat && perChat.review) || {};
    const cfg = { ...REVIEW_DEFAULTS };

    for (const key of ['consolidationThreshold', 'compactionTokenThreshold']) {
        if (Number.isFinite(g[key])) cfg[key] = g[key];
        if (Number.isFinite(p[key])) cfg[key] = p[key];
    }
    cfg.enabled = (typeof p.enabled === 'boolean') ? p.enabled : (typeof g.enabled === 'boolean' ? g.enabled : REVIEW_DEFAULTS.enabled);
    return cfg;
}

// ---------------------------------------------------------------- token counting

/** Same chars/4 heuristic every other core in this fork inlines (injectionCore.js). */
export function countTokensDefault(text) {
    return Math.ceil(String(text ?? '').length / 4);
}

// ---------------------------------------------------------------- JSON retry (memory generation)

/**
 * Reprimand appended on the single retry when the model returns prose instead
 * of JSON for a memory generation call. Mirrors sentinelCore's JSON_ONLY_REPRIMAND
 * for the same failure mode in the detection pipeline (plan §4.4 review queue).
 */
export const JSON_RETRY_REPRIMAND =
`Your previous response did not contain a JSON object. Reply again with ONLY a
single JSON object matching the required schema (content, title, keywords) —
no prose, no code fences, no commentary.`;

/**
 * Only ONE parseAIJsonResponse failure mode is safely retryable: the model
 * returned no JSON at all (recoverable === true, stmemory.js NO_JSON_BLOCK).
 * Every other failure (missing fields, truncation, malformed structure) is a
 * content problem a bare reprimand can't fix — never guess (plan §5.2), so the
 * caller should let those fail exactly as before.
 */
export function isRecoverableJsonError(error) {
    return !!error && error.recoverable === true;
}

/** Build the retry prompt: original prompt + reprimand, kept separate so callers can log/test each half. */
export function buildJsonRetryPrompt(promptString, reprimand = JSON_RETRY_REPRIMAND) {
    return `${String(promptString ?? '')}\n\n${reprimand}`;
}

// ---------------------------------------------------------------- self-flag detection

/**
 * Vocabulary injectionCore.js's ERROR_CONTROL_RULES instructs the model to use
 * verbatim when it can't state a fact plainly: "unspecified" for unstated
 * details, flagging ambiguity, and reporting (never silently reconciling)
 * contradictions. Scanning generated memory content for this fixed vocabulary
 * is the cheapest possible "model self-flags low confidence" signal — no new
 * schema field or prompt change needed, since the wording is already fixed.
 */
export const SELF_FLAG_PATTERNS = Object.freeze([
    { reason: 'unspecified', re: /\bunspecified\b/i },
    { reason: 'ambiguity', re: /\bambiguit(?:y|ies)\b|\bambiguous(?:ly)?\b/i },
    { reason: 'contradiction', re: /\bcontradict(?:s|ion|ions|ory)?\b/i },
]);

const EXCERPT_RADIUS = 60;

/** Trim an excerpt of `text` around [start, start+len) to ~2*EXCERPT_RADIUS chars, collapsing whitespace. */
function excerptAround(text, start, len) {
    const from = Math.max(0, start - EXCERPT_RADIUS);
    const to = Math.min(text.length, start + len + EXCERPT_RADIUS);
    const prefix = from > 0 ? '…' : '';
    const suffix = to < text.length ? '…' : '';
    return prefix + text.slice(from, to).replace(/\s+/g, ' ').trim() + suffix;
}

/**
 * Scan generated memory content for the error-control self-flag vocabulary.
 * Returns one match per distinct pattern (first occurrence only — this is a
 * review-queue trigger, not an exhaustive audit; the auditor's claim
 * re-verification job is the exhaustive path, plan §4.3 job 4).
 */
export function detectSelfFlags(content) {
    const text = String(content ?? '');
    if (!text) return [];
    const flags = [];
    for (const { reason, re } of SELF_FLAG_PATTERNS) {
        const m = text.match(re);
        if (m) flags.push({ reason, excerpt: excerptAround(text, m.index, m[0].length) });
    }
    return flags;
}

// ---------------------------------------------------------------- review-queue entries

/** Normalize a review-queue record. One record per flagged job (dedup key = jobId). */
export function makeReviewEntry({ jobId, chatKey, lorebookName, entryTitle, range, reasons, createdAt }) {
    return {
        id: String(jobId || ''),
        jobId: String(jobId || ''),
        chatKey: String(chatKey || ''),
        lorebookName: String(lorebookName || ''),
        entryTitle: String(entryTitle || ''),
        range: range && Number.isFinite(range.start) && Number.isFinite(range.end)
            ? { start: range.start, end: range.end }
            : null,
        reasons: Array.isArray(reasons) ? reasons.map(r => ({ type: String(r?.type || ''), detail: String(r?.detail || '') })) : [],
        createdAt: Number(createdAt) || 0,
        dismissed: false,
    };
}

/** Build the `reasons` list from the two flag sources. Empty when nothing is flagged (the common case). */
export function buildReviewReasons({ jsonRetried, selfFlags }) {
    const reasons = [];
    if (jsonRetried) {
        reasons.push({ type: 'json_retry', detail: 'The generated JSON needed a retry to parse.' });
    }
    for (const flag of (selfFlags || [])) {
        reasons.push({ type: 'self_flag', detail: `Model flagged "${flag.reason}": ${flag.excerpt}` });
    }
    return reasons;
}

/**
 * Append (or replace, by jobId) a review entry, capped to `limit` most recent.
 * No silent caps without a caller-visible effect: callers that need to know
 * about a drop should compare list length before/after (plan §4.3 "no silent caps").
 */
export function pushReviewEntry(queue, entry, limit = 50) {
    const list = (Array.isArray(queue) ? queue : []).filter(e => e && e.jobId !== entry.jobId);
    list.unshift(entry);
    if (list.length > Math.max(1, Number(limit) || 50)) {
        list.length = Math.max(1, Number(limit) || 50);
    }
    return list;
}

/** Remove a review entry by jobId (dashboard "Dismiss" action). */
export function dismissReviewEntry(queue, jobId) {
    return (Array.isArray(queue) ? queue : []).filter(e => e?.jobId !== jobId);
}

// ---------------------------------------------------------------- nudge decisions

/**
 * Pure decision: has enough scene-memory volume accumulated to offer a
 * consolidation nudge? Threshold default 20 (plan §4.4 "temperature gradient").
 */
export function shouldOfferConsolidationNudge({ scenesSinceNudge, threshold }) {
    const t = Math.max(1, Number(threshold) || REVIEW_DEFAULTS.consolidationThreshold);
    return Number(scenesSinceNudge) >= t;
}

/**
 * Pure decision: is this entry oversized enough to offer a compaction nudge?
 * Token estimate uses the same chars/4 heuristic as the rest of this fork.
 */
export function shouldOfferCompactionNudge({ tokenCount, threshold }) {
    const t = Math.max(1, Number(threshold) || REVIEW_DEFAULTS.compactionTokenThreshold);
    return Number(tokenCount) > t;
}
