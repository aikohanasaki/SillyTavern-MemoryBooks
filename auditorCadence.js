// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// auditorCadence.js — P5.5 wiring for the four audit jobs.
//
// Plan §4.3 contract: "on demand + a non-blocking offer every M scene memories
// (default 15); never auto-runs." This module is the bridge between
// (a) the post-memory creation path in addlore.js, (b) the `maybeOfferAuditorJob`
// gate in auditorTechnicalPass.js, and (c) the STMB jobs dashboard
// (`enqueueStmbJob`). It also handles persisting `lastOfferAtCount` +
// `sceneMemoryCount` to chat_metadata so the cadence threshold is honored
// across reloads.
//
// Public API:
//   - resolveAuditorCadence(settings, chatMeta) → reads
//   - incrementSceneMemoryCount(chatMeta, sceneEnd) → write (counters)
//   - maybeEnqueueAuditorOnOffer({ settings, chatMeta, enqueueStmbJob, sceneEnd })
//                                                                  → wire-up
//   - enqueueAuditorJobByType({ settings, chatMeta, enqueueStmbJob, jobType })
//                                                                  → on-demand
//
// The module is pure-ish: it mutates chat metadata in place but does not
// touch globals (it accepts `chatMeta` and `enqueueStmbJob` as parameters),
// so it's testable in Node without a DOM/SillyTavern runtime.

/**
 * Read the current cadence state from chat metadata. Missing fields resolve
 * to defaults (count=0, lastOfferAtCount=0). The function does not mutate.
 *
 * @param {object} chatMeta - chat_metadata (STMemoryBooks-stamped)
 * @returns {{ sceneMemoryCount: number, lastOfferAtCount: number }}
 */
export function resolveAuditorCadence(chatMeta) {
    const src = (chatMeta && typeof chatMeta === 'object') ? chatMeta : {};
    const stmbc = (src.stmbc && typeof src.stmbc === 'object') ? src.stmbc : {};
    const stored = (stmbc.auditor && typeof stmbc.auditor === 'object') ? stmbc.auditor : null;
    const count = Number(stored?.sceneMemoryCount);
    const last = Number(stored?.lastOfferAtCount);
    return {
        sceneMemoryCount: Number.isFinite(count) && count >= 0 ? Math.floor(count) : 0,
        lastOfferAtCount: Number.isFinite(last) && last >= 0 ? Math.floor(last) : 0,
    };
}

/**
 * Per-chat auditor cadence state schema. Defaults are zero so first-time
 * chats behave like "we've never offered".
 */
export const CHAT_AUDITOR_DEFAULTS = Object.freeze({
    sceneMemoryCount: 0,
    lastOfferAtCount: 0,
});

/**
 * Apply defaults into the chat metadata so subsequent reads are stable.
 * Idempotent and migration-safe: only writes if a field is absent.
 *
 * @param {object} chatMeta
 */
export function initializeAuditorCadenceState(chatMeta) {
    if (!chatMeta || typeof chatMeta !== 'object') return;
    if (!chatMeta.stmbc || typeof chatMeta.stmbc !== 'object') {
        chatMeta.stmbc = {};
    }
    if (!chatMeta.stmbc.auditor || typeof chatMeta.stmbc.auditor !== 'object') {
        chatMeta.stmbc.auditor = { ...CHAT_AUDITOR_DEFAULTS };
        return;
    }
    for (const [k, v] of Object.entries(CHAT_AUDITOR_DEFAULTS)) {
        if (!(k in chatMeta.stmbc.auditor)) {
            chatMeta.stmbc.auditor[k] = v;
        }
    }
}

/**
 * Increment the per-chat scene-memory counter in chat_metadata. The counter
 * is the total number of scene memories created in this chat, used by
 * `maybeOfferAuditorJob` to decide whether to surface a cadence offer.
 * Returns the new count after the increment.
 *
 * @param {object} chatMeta
 * @param {number} [delta=1] - how many new memories to count (default 1)
 * @returns {number} new sceneMemoryCount
 */
export function incrementSceneMemoryCount(chatMeta, delta = 1) {
    if (!chatMeta || typeof chatMeta !== 'object') return 0;
    initializeAuditorCadenceState(chatMeta);
    const inc = Math.max(0, Math.floor(Number(delta) || 0));
    const cur = Number(chatMeta.stmbc.auditor.sceneMemoryCount) || 0;
    const next = Math.max(0, cur + inc);
    chatMeta.stmbc.auditor.sceneMemoryCount = next;
    return next;
}

/**
 * Set the per-chat "last offer at count" pointer in chat_metadata. Called
 * when an offer is fired (or queued) so the cadence threshold is honored
 * across reloads.
 *
 * @param {object} chatMeta
 * @param {number} count
 */
export function setLastOfferAtCount(chatMeta, count) {
    if (!chatMeta || typeof chatMeta !== 'object') return;
    initializeAuditorCadenceState(chatMeta);
    const n = Math.max(0, Math.floor(Number(count) || 0));
    chatMeta.stmbc.auditor.lastOfferAtCount = n;
}

/**
 * Build the enqueue payload for a given audit job type. Pure — no side
 * effects. Kept here (not in auditorTechnicalPass.js) so the wiring
 * layer can build a snapshot without instantiating the executor.
 *
 * @param {string} jobType - one of 'stmbc-audit-coverage' | 'stmbc-audit-regenerate' | 'stmbc-audit-technical' | 'stmbc-audit-claims'
 * @returns {object} enqueue payload
 */
export function buildAuditJobPayload(jobType) {
    return {
        type: String(jobType || 'stmbc-audit-coverage'),
        title: auditJobTitle(jobType),
        detail: 'Offered by cadence gate',
        trigger: 'cadence',
        payload: {},
    };
}

function auditJobTitle(jobType) {
    switch (String(jobType || '')) {
        case 'stmbc-audit-coverage': return 'Coverage Audit';
        case 'stmbc-audit-regenerate': return 'Entry Regeneration';
        case 'stmbc-audit-technical': return 'Technical Pass';
        case 'stmbc-audit-claims': return 'Claim Re-verification';
        default: return 'Audit';
    }
}

/**
 * The hub: if the cadence gate says we should offer, enqueue the suggested
 * job and persist `lastOfferAtCount`. Returns the gate outcome and the
 * enqueued job (or null) so the caller can log / toast / no-op.
 *
 * `enqueueStmbJob` is injected so the module stays independent of the
 * `stmbJobs.js` runtime. In tests, pass a stub.
 *
 * @param {object} opts
 * @param {object} opts.settings - extension_settings.STMemoryBooks-shaped
 * @param {object} opts.chatMeta - chat_metadata
 * @param {function} opts.maybeOfferAuditorJob - gate from auditorTechnicalPass.js
 * @param {function} opts.enqueueStmbJob - jobs dashboard enqueue
 * @returns {{ shouldOffer: boolean, reason?: string, enqueued: object|null, sceneMemoryCount: number, lastOfferAtCount: number }}
 */
export function maybeEnqueueAuditorOnOffer({ settings, chatMeta, maybeOfferAuditorJob, enqueueStmbJob } = {}) {
    const cad = resolveAuditorCadence(chatMeta);
    let gate = { shouldOffer: false, reason: 'no-gate' };
    if (typeof maybeOfferAuditorJob === 'function') {
        try {
            gate = maybeOfferAuditorJob(settings, cad.sceneMemoryCount, cad.lastOfferAtCount);
        } catch (err) {
            gate = { shouldOffer: false, reason: 'gate-error', suggestedJobType: 'stmbc-audit-coverage', everyNScenes: 15 };
        }
    }
    if (!gate.shouldOffer) {
        return {
            shouldOffer: false,
            reason: gate.reason || 'no-offer',
            enqueued: null,
            sceneMemoryCount: cad.sceneMemoryCount,
            lastOfferAtCount: cad.lastOfferAtCount,
        };
    }

    const jobType = String(gate.suggestedJobType || 'stmbc-audit-coverage');
    const job = buildAuditJobPayload(jobType);
    let enqueued = null;
    if (typeof enqueueStmbJob === 'function') {
        try {
            enqueued = enqueueStmbJob(job);
        } catch (err) {
            enqueued = null;
        }
    }

    // Persist the new lastOfferAtCount so the next offer waits another N scenes.
    setLastOfferAtCount(chatMeta, cad.sceneMemoryCount);

    return {
        shouldOffer: true,
        reason: gate.reason || 'every-N-scene-memories',
        suggestedJobType: jobType,
        enqueued,
        sceneMemoryCount: cad.sceneMemoryCount,
        lastOfferAtCount: cad.sceneMemoryCount,
    };
}

/**
 * On-demand enqueue used by the `/audit` slash command and the jobs-panel
 * button. Validates the jobType against the four known audit jobs and
 * enqueues via the supplied `enqueueStmbJob`. Returns the enqueued job
 * snapshot (or null) and a reason for the caller.
 *
 * @param {object} opts
 * @param {string} [opts.jobType='stmbc-audit-coverage']
 * @param {function} opts.enqueueStmbJob
 * @returns {{ ok: boolean, enqueued: object|null, reason?: string, jobType: string }}
 */
export function enqueueAuditorJobByType({ jobType = 'stmbc-audit-coverage', enqueueStmbJob } = {}) {
    const known = new Set([
        'stmbc-audit-coverage',
        'stmbc-audit-regenerate',
        'stmbc-audit-technical',
        'stmbc-audit-claims',
    ]);
    const normalized = String(jobType || 'stmbc-audit-coverage').toLowerCase().trim();
    if (!known.has(normalized)) {
        return { ok: false, enqueued: null, reason: 'unknown-job-type', jobType: normalized };
    }
    if (typeof enqueueStmbJob !== 'function') {
        return { ok: false, enqueued: null, reason: 'no-enqueue', jobType: normalized };
    }
    const payload = {
        ...buildAuditJobPayload(normalized),
        trigger: 'on-demand',
        detail: 'Triggered on demand',
    };
    let enqueued = null;
    try {
        enqueued = enqueueStmbJob(payload);
    } catch (err) {
        return { ok: false, enqueued: null, reason: 'enqueue-failed', jobType: normalized };
    }
    return { ok: true, enqueued, jobType: normalized };
}

export const AUDIT_JOB_TYPES = Object.freeze([
    'stmbc-audit-coverage',
    'stmbc-audit-regenerate',
    'stmbc-audit-technical',
    'stmbc-audit-claims',
]);
