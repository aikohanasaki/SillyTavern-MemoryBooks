// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// STMB-Auto fork — the "just run it" orchestrator's pure decision logic
// (PHA-1846). `/stmb-auto` is a zero-argument command that chains three
// existing pipelines over the WHOLE chat with no user input: the auditor
// walk (auditorCore.js), chunked scene-memory generation (the same primitive
// /stmb-catchup uses), and coverage-driven lorebook-entry generation
// (auditorJobsCore.js). This file only decides WHAT to run, never runs it —
// no ST imports, DI everywhere, so it is testable with plain node:test.

/**
 * Defaults for the auto-run. `memoryInterval` reuses the sentinel's
 * boundary-detection window size (autoSettings.js AUTO_MODULE_DEFAULTS.
 * windowSize, 26) rather than inventing a new magic number — there is no
 * single canonical "scene chunk size" elsewhere in the fork (the auditor's
 * chunkSize=40 is sized for entity extraction, not narrative summaries).
 * `coverageMinChunks` is 1 (not the coverage job's own default of 2) because
 * that gate is unsatisfiable on any chat small enough to fit in one audit
 * chunk (<= chunkSize messages) — every name maxes out at chunkCount===1, so
 * a from-scratch full-story run must not require repeat appearances to
 * notice a character exists at all.
 */
export const STMB_AUTO_DEFAULTS = Object.freeze({
    memoryInterval: 26,
    bulkGenerateCap: 60,
    coverageMinChunks: 1,
});

/**
 * Merge auto-run configuration: defaults <- global (autoModule.auto) <-
 * per-chat (chat_metadata.stmbc.auto). Same override shape as
 * resolveAuditConfig/resolveCoverageConfig.
 */
export function resolveStmbAutoConfig(autoModule, chatMetadata) {
    const global = autoModule?.auto || {};
    const perChat = chatMetadata?.stmbc?.auto || {};
    const cfg = { ...STMB_AUTO_DEFAULTS };
    for (const key of ['memoryInterval', 'bulkGenerateCap', 'coverageMinChunks']) {
        if (global[key] != null) cfg[key] = global[key];
        if (perChat[key] != null) cfg[key] = perChat[key];
    }
    return cfg;
}

/**
 * Plan the scene-memory chunks for a full-story run: everything after the
 * last processed message through the end of the chat, sliced to `interval`
 * messages per chunk (same slicing rule /stmb-catchup uses). Returns `[]`
 * when there is nothing new (already caught up, or an out-of-range
 * watermark) — the caller treats an empty plan as a clean no-op, not a
 * failure.
 *
 * @param {number|null} highestProcessed - last message id already summarized, or null
 * @param {number} lastIndex - index of the last message in the chat (chat.length - 1)
 * @param {number} interval - messages per chunk
 * @returns {Array<{start:number, end:number}>}
 */
export function planAutoMemoryChunks(highestProcessed, lastIndex, interval) {
    if (!Number.isInteger(lastIndex) || lastIndex < 0) return [];
    const step = Number.isInteger(interval) && interval > 0 ? interval : STMB_AUTO_DEFAULTS.memoryInterval;
    const start = Number.isFinite(highestProcessed) ? highestProcessed + 1 : 0;
    if (start > lastIndex) return [];

    const chunks = [];
    for (let chunkStart = start; chunkStart <= lastIndex; chunkStart += step) {
        chunks.push({ start: chunkStart, end: Math.min(chunkStart + step - 1, lastIndex) });
    }
    return chunks;
}

/**
 * Render the final chat-facing summary for one /stmb-auto run. Pure string
 * formatting so the exact wording is unit-tested rather than eyeballed.
 */
export function buildStmbAutoSummary({
    lorebookName,
    lorebookCreated,
    auditMessage,
    memoriesPlanned,
    memoriesCreated,
    memorySkipReason,
    loreGenerated,
    loreSkipped,
    loreMessage,
} = {}) {
    const parts = ['STMB Auto complete.'];

    if (lorebookName) {
        parts.push(lorebookCreated
            ? `Created and bound lorebook "${lorebookName}".`
            : `Lorebook: "${lorebookName}".`);
    }

    if (auditMessage) parts.push(auditMessage);

    if (memorySkipReason) {
        parts.push(`Scene memories skipped: ${memorySkipReason}`);
    } else if (!memoriesPlanned) {
        parts.push('No new scenes to summarize.');
    } else {
        parts.push(`${memoriesCreated}/${memoriesPlanned} scene memor${memoriesPlanned === 1 ? 'y' : 'ies'} created.`);
    }

    if (loreMessage) {
        parts.push(loreMessage);
    } else if (!loreGenerated && !loreSkipped) {
        parts.push('No missing or thin character/location entries found.');
    }

    return parts.join(' ');
}
