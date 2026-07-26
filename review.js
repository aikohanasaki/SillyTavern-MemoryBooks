// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// STMB-Auto fork — Review queue + consolidation/compaction nudges, SillyTavern
// binding layer (Phase 4, task P4.3). Plan: eval/materials/stmb-auto/stmb-auto-plan.md §4.4.
//
// Wires chat_metadata into the pure, dependency-injected core (reviewCore.js).
// Follows the same "direct chat_metadata + saveMetadataForCurrentContext()"
// convention sentinel.js and auditor.js already use for per-chat state — no
// chatRef-aware background writes, so a review flag or nudge only lands when
// the job's chat is still the one currently open (matches how the existing
// upstream maybePromptSelectedAutoConsolidation already gates its own nudge).
//
// Wiring lives in index.js at ONE `STMBC-HOOK(review)` block inside the queued
// memory-job executor (post-save, non-blocking — memories always save first)
// and ONE inside stmemory.js's generateMemoryWithAI (the JSON retry).
//
// The durable record is chat_metadata.stmbc.reviewQueue (survives reload); the
// live dashboard flag is job.reviewPending/job.reviewReasons, patched directly
// onto the in-memory job by the index.js hook so stmbJobs.js's rendering can
// pick it up without importing this module (kept domain-agnostic, same as the
// existing approvalRequest pattern).

import { chat_metadata } from '../../../../script.js';
import { extension_settings } from '../../../extensions.js';
import { saveMetadataForCurrentContext } from './sceneManager.js';
import { getStmbChatKey } from './stmbJobs.js';
import {
    resolveReviewConfig,
    makeReviewEntry,
    pushReviewEntry,
    dismissReviewEntry,
} from './reviewCore.js';

/** Resolve the review config for the currently active chat (global + per-chat override). */
export function resolveReviewConfigForCurrentChat() {
    return resolveReviewConfig(extension_settings?.STMemoryBooks?.autoModule, chat_metadata?.stmbc);
}

/** True when `chatRef` refers to the chat currently open in the UI. */
function isChatRefCurrent(chatRef) {
    if (!chatRef) return false;
    return getStmbChatKey(chatRef) === getStmbChatKey();
}

function getOrCreateStmbc() {
    return chat_metadata.stmbc || (chat_metadata.stmbc = {});
}

function getOrCreateReviewState() {
    const stmbc = getOrCreateStmbc();
    return stmbc.review || (stmbc.review = {});
}

/**
 * Durably record a flagged completion in chat_metadata.stmbc.reviewQueue, for
 * the job's chat only (a background job for a chat the user has since
 * navigated away from is skipped rather than risk writing into the WRONG
 * chat's metadata — chat_metadata is always the currently open chat here).
 * Returns true when a record was written.
 */
export function recordReviewFlagsForJob(job, { lorebookName, entryTitle, range, reasons }) {
    if (!reasons?.length || !isChatRefCurrent(job?.chatRef)) return false;
    const stmbc = getOrCreateStmbc();
    const entry = makeReviewEntry({
        jobId: job.id,
        chatKey: job.chatKey,
        lorebookName,
        entryTitle,
        range,
        reasons,
        createdAt: Date.now(),
    });
    stmbc.reviewQueue = pushReviewEntry(stmbc.reviewQueue, entry);
    saveMetadataForCurrentContext();
    return true;
}

/** Dashboard "Dismiss" action: clear the durable record for a reviewed job. */
export function dismissReviewQueueEntry(jobId) {
    const stmbc = chat_metadata?.stmbc;
    if (!stmbc || !Array.isArray(stmbc.reviewQueue)) return;
    stmbc.reviewQueue = dismissReviewEntry(stmbc.reviewQueue, jobId);
    saveMetadataForCurrentContext();
}

/** Increment (or reset, after offering) the scenes-since-last-nudge counter for the current chat. */
export function bumpScenesSinceConsolidationNudge(reset = false) {
    const review = getOrCreateReviewState();
    review.scenesSinceConsolidationNudge = reset
        ? 0
        : (Number(review.scenesSinceConsolidationNudge) || 0) + 1;
    saveMetadataForCurrentContext();
    return review.scenesSinceConsolidationNudge;
}

const COMPACTION_NUDGE_UID_LIMIT = 200;

/** Record that this entry uid was already offered a compaction nudge, to avoid re-nagging every cycle. */
export function markCompactionNudged(entryUid) {
    if (entryUid === undefined || entryUid === null) return;
    const review = getOrCreateReviewState();
    const nudged = Array.isArray(review.compactionNudgedUids) ? review.compactionNudgedUids : (review.compactionNudgedUids = []);
    const key = String(entryUid);
    if (!nudged.includes(key)) {
        nudged.push(key);
        if (nudged.length > COMPACTION_NUDGE_UID_LIMIT) {
            nudged.splice(0, nudged.length - COMPACTION_NUDGE_UID_LIMIT);
        }
    }
    saveMetadataForCurrentContext();
}

export function wasCompactionNudged(entryUid) {
    if (entryUid === undefined || entryUid === null) return false;
    const nudged = chat_metadata?.stmbc?.review?.compactionNudgedUids;
    return Array.isArray(nudged) && nudged.includes(String(entryUid));
}
