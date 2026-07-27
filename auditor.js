// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// STMB-Auto fork — Auditor SillyTavern binding layer (Phase 5, task P5.1).
// Plan: eval/materials/stmb-auto/stmb-auto-plan.md §4.3, §5.4.
//
// Wires the real SillyTavern chat / chat_metadata / profile / LLM / job-context
// functions into the pure, dependency-injected core (auditorCore.js). Registered
// as the "audit" job type in stmbJobs.js so the dashboard shows it and the halt
// path (/stmbc-stop → cancelAllStmbJobs → abort signal) stops it cooperatively.
//
// Wiring lives in index.js at THREE single-purpose `STMBC-HOOK(auditor)` sites:
//   1. import { executeAuditJob, handleAuditCommand, handleStmbcStopCommand }
//   2. registerStmbJobExecutor("audit", executeAuditJob)   (beside STMB's own)
//   3. /stmbc-audit and /stmbc-stop slash commands (in registerSlashCommands)
//
// The auditor is on-demand only in P5.1 (never auto-runs; §4.3 cadence note).
// The checkpoint (chunk index + running notes) lives at chat_metadata.stmbc.audit
// and survives a reload — re-running /stmbc-audit resumes from the saved chunk.

import { extension_settings } from '../../../extensions.js';
import { chat, chat_metadata } from '../../../../script.js';
import { saveMetadataForCurrentContext } from './sceneManager.js';
import { requestCompletion } from './stmemory.js';
import { resolveEffectiveConnectionFromProfile } from './utils.js';
import {
    enqueueStmbJob,
    areStmbJobsEnabled,
    cancelAllStmbJobs,
} from './stmbJobs.js';
import {
    AUDITOR_DEFAULTS,
    AUDIT_MAP_PROMPT,
    estimateTokensChars,
    extractAuditMessages,
    runAuditWalk,
    summarizeNotes,
    reviveNotes,
    planChunks,
} from './auditorCore.js';

const LOG = 'STMemoryBooks: Auditor';

/** Where the resumable audit checkpoint lives (per-chat). */
const CHECKPOINT_KEY = 'audit';

/**
 * Inline abort controller for the fallback path used when the jobs dashboard is
 * unavailable (Chat Top Bar extension not installed). /stmbc-stop aborts it too,
 * so halt works with or without the dashboard.
 */
let inlineAbort = null;

/**
 * Merge auditor configuration from global settings and per-chat metadata over the
 * defaults. Global lives at extension_settings.STMemoryBooks.autoModule.audit
 * (plan §4.5); per-chat at chat_metadata.stmbc.audit. Per-chat wins.
 */
export function resolveAuditConfig(autoModule, chatMetadata) {
    const global = autoModule?.audit || {};
    const perChat = chatMetadata?.stmbc?.audit || {};
    const cfg = { ...AUDITOR_DEFAULTS };

    for (const key of ['chunkSize', 'tokenCap', 'truncate', 'profile']) {
        if (global[key] != null) cfg[key] = global[key];
        if (perChat[key] != null) cfg[key] = perChat[key];
    }
    if (typeof global.mapPrompt === 'string' && global.mapPrompt.trim()) cfg.mapPrompt = global.mapPrompt;
    if (typeof perChat.mapPrompt === 'string' && perChat.mapPrompt.trim()) cfg.mapPrompt = perChat.mapPrompt;
    return cfg;
}

/**
 * Resolve the extraction connection from the configured audit profile, or the
 * STMB default profile. Like the sentinel, extraction wants a cheap model (§4.3
 * "read everything" is a lot of calls), so users point `audit.profile` at one.
 */
function resolveAuditConnection(cfg) {
    const settings = extension_settings.STMemoryBooks || {};
    const profiles = Array.isArray(settings.profiles) ? settings.profiles : [];
    let idx = Number(cfg.profile);
    if (!Number.isInteger(idx) || idx < 0 || idx >= profiles.length) {
        idx = Number(settings.defaultProfile ?? 0);
    }
    const profile = profiles[idx] || {};
    return resolveEffectiveConnectionFromProfile(profile);
}

/** Single-shot extraction call bound to the resolved connection. */
function makeMapChunk(conn, systemPrompt) {
    return async (chunkText) => {
        const { text } = await requestCompletion({
            api: conn.api,
            model: conn.model,
            endpoint: conn.endpoint,
            apiKey: conn.apiKey,
            reverseProxy: conn.reverseProxy,
            prompt: `${systemPrompt}\n\n${chunkText}`,
            temperature: 0,            // deterministic extraction
            extra: { max_tokens: 800 },
        });
        return text;
    };
}

/** Read the persisted checkpoint for the current chat, or null. */
function loadCheckpoint() {
    const stmbc = chat_metadata?.stmbc;
    const ckpt = stmbc?.[CHECKPOINT_KEY];
    return (ckpt && typeof ckpt === 'object') ? ckpt : null;
}

/** Persist the checkpoint for the current chat and flush metadata to disk. */
function saveCheckpoint(state) {
    try {
        const stmbc = chat_metadata.stmbc || (chat_metadata.stmbc = {});
        stmbc[CHECKPOINT_KEY] = state;
        saveMetadataForCurrentContext();
    } catch (e) {
        console.warn(`${LOG}: failed to persist checkpoint`, e);
    }
}

/**
 * Build the injected dependency bundle for runAuditWalk. `shouldHalt` and
 * `onProgress` are supplied by the caller (job context or inline controller) so
 * the same walk serves both the dashboard and the no-dashboard fallback.
 */
function buildAuditDeps({ shouldHalt, onProgress, restart }) {
    const cfg = resolveAuditConfig(extension_settings?.STMemoryBooks?.autoModule, chat_metadata);
    const conn = resolveAuditConnection(cfg);
    const systemPrompt = (typeof cfg.mapPrompt === 'string' && cfg.mapPrompt.trim())
        ? cfg.mapPrompt
        : AUDIT_MAP_PROMPT;

    return {
        config: cfg,
        getMessages: () => extractAuditMessages(chat),
        loadCheckpoint,
        saveCheckpoint,
        mapChunk: makeMapChunk(conn, systemPrompt),
        estimateTokens: estimateTokensChars,
        shouldHalt,
        onProgress,
        restart: !!restart,
    };
}

/**
 * Job executor for the "audit" type (registered in index.js). Runs the walk with
 * halt/progress wired to the job context. On halt (isCancelled), the walk has
 * already checkpointed the last completed chunk, so it returns cleanly and the
 * jobs framework marks the job canceled — a later /stmbc-audit resumes.
 */
export async function executeAuditJob(job, context) {
    const restart = !!job?.payload?.restart;
    const deps = buildAuditDeps({
        restart,
        shouldHalt: () => context.isCancelled(),
        onProgress: (info) => {
            if (info?.error) {
                context.setDetail(`chunk ${info.chunk}/${info.total} — extraction error, continuing`);
            } else {
                context.setDetail(`chunk ${info.chunk}/${info.total} · ${info.summary?.characters ?? 0} chars, ${info.summary?.claims ?? 0} claims`);
            }
        },
    });

    context.setDetail('Reading chat…');
    const result = await runAuditWalk(deps);

    if (result.status === 'halted') {
        // Leave the job to be marked canceled by the framework (context is
        // already aborted); the checkpoint is intact for resume.
        context.setDetail(`Halted at chunk ${result.nextChunk}/${result.plan.chunks} (resumable)`);
        return;
    }

    const summary = summarizeNotes(result.notes);
    context.setResult({ status: result.status, chunks: result.plan.chunks, resumed: result.resumed, summary });
    context.setDetail(
        result.status === 'empty'
            ? 'Nothing to audit (empty chat)'
            : `Audit complete: ${result.plan.chunks} chunks · ${summary.characters} characters, ${summary.locations} locations, ${summary.claims} claims`,
    );
}

/**
 * Inline fallback walk when the jobs dashboard is unavailable. Uses a module
 * AbortController so /stmbc-stop can halt it; checkpoints exactly like the job
 * path, so a reload still resumes.
 */
async function runAuditInline(restart) {
    if (inlineAbort) {
        return 'An audit is already running. Use /stmbc-stop to halt it.';
    }
    const controller = new AbortController();
    inlineAbort = controller;
    // No jobs dashboard to carry per-chunk detail here, so mid-job extraction
    // errors must be tallied and surfaced in the final message instead of
    // vanishing silently (plan §6 P6.1: no silent poisoning).
    let erroredChunks = 0;
    try {
        const deps = buildAuditDeps({
            restart,
            shouldHalt: () => controller.signal.aborted,
            onProgress: (info) => { if (info?.error) erroredChunks++; },
        });
        const result = await runAuditWalk(deps);
        const errNote = erroredChunks > 0 ? ` (${erroredChunks} chunk${erroredChunks === 1 ? '' : 's'} had extraction errors and were skipped)` : '';
        if (result.status === 'halted') return `Audit halted at chunk ${result.nextChunk}/${result.plan.chunks} (resumable).${errNote}`;
        const s = summarizeNotes(result.notes);
        return result.status === 'empty'
            ? 'Nothing to audit (empty chat).'
            : `Audit complete: ${result.plan.chunks} chunks · ${s.characters} characters, ${s.locations} locations, ${s.events} events, ${s.claims} claims.${errNote}`;
    } finally {
        inlineAbort = null;
    }
}

/**
 * Slash: /stmbc-audit [restart]
 * Start (or resume) the resumable full-chat audit walk. With no argument it
 * resumes from the saved checkpoint if one exists; `restart` forces a fresh walk.
 * Prefers the jobs dashboard; falls back to an inline run when it is unavailable.
 */
export async function handleAuditCommand(namedArgs, unnamedArgs) {
    try {
        const arg = String(unnamedArgs ?? (Array.isArray(namedArgs) ? '' : '')).trim().toLowerCase();
        const restart = arg === 'restart' || arg === 'fresh';

        if (restart) {
            // Clear the checkpoint so a fresh walk cannot resume stale notes.
            try {
                if (chat_metadata?.stmbc?.[CHECKPOINT_KEY]) {
                    delete chat_metadata.stmbc[CHECKPOINT_KEY];
                    saveMetadataForCurrentContext();
                }
            } catch { /* non-fatal */ }
        }

        // Report resume state up-front from the (pre-clear) checkpoint.
        const ckpt = restart ? null : loadCheckpoint();
        const resumeNote = (ckpt && ckpt.status !== 'complete' && Number.isInteger(ckpt.nextChunk) && ckpt.nextChunk > 0)
            ? ` (resuming from chunk ${ckpt.nextChunk})`
            : '';

        if (areStmbJobsEnabled()) {
            const cfg = resolveAuditConfig(extension_settings?.STMemoryBooks?.autoModule, chat_metadata);
            const total = planChunks(extractAuditMessages(chat), {
                chunkSize: cfg.chunkSize,
                tokenCap: cfg.tokenCap,
                truncate: cfg.truncate,
                estimateTokens: estimateTokensChars,
            }).length;
            const job = enqueueStmbJob({
                type: 'audit',
                title: 'Auditor',
                detail: `Queued${resumeNote} · ${total} chunks`,
                payload: { restart },
            });
            if (job) {
                try { toastr.info(`Audit queued${resumeNote}.`, 'STMemoryBooks'); } catch { /* toastr optional */ }
                return `Audit queued${resumeNote}.`;
            }
        }

        // No dashboard — run inline.
        try { toastr.info(`Running audit${resumeNote}…`, 'STMemoryBooks'); } catch { /* toastr optional */ }
        const msg = await runAuditInline(restart);
        try { toastr[msg.includes('extraction errors') ? 'warning' : 'success'](msg, 'STMemoryBooks'); } catch { /* toastr optional */ }
        return msg;
    } catch (err) {
        console.error(`${LOG}: /stmbc-audit failed`, err);
        try { toastr.error(`Audit failed: ${err?.message || err}`, 'STMemoryBooks'); } catch { /* toastr optional */ }
        return `Audit failed: ${err?.message || err}`;
    }
}

/**
 * Slash: /stmbc-stop
 * Halt the fork's in-flight jobs (auditor/sentinel and any queued STMB jobs) via
 * cancelAllStmbJobs, and abort the inline audit fallback if one is running. The
 * audit checkpoint is left intact so /stmbc-audit resumes.
 */
export function handleStmbcStopCommand() {
    let count = 0;
    try { count = cancelAllStmbJobs('stmbc-stop') || 0; } catch (e) { console.warn(`${LOG}: cancelAllStmbJobs failed`, e); }
    if (inlineAbort) {
        try { inlineAbort.abort('stmbc-stop'); } catch { /* non-fatal */ }
        count++;
    }
    const msg = count > 0 ? `Stopped ${count} STMB-Auto job(s).` : 'No STMB-Auto jobs were running.';
    try { toastr.info(msg, 'STMemoryBooks'); } catch { /* toastr optional */ }
    return msg;
}

/**
 * Read-only accessor for the current chat's audit notes (revived to full shape),
 * or null if no audit has run. The downstream audit jobs (coverage / technical /
 * regeneration / claim re-verification — later tasks) consume this.
 */
export function getAuditNotes() {
    const ckpt = loadCheckpoint();
    return ckpt?.notes ? reviveNotes(ckpt.notes) : null;
}
