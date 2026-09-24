// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import { eventSource, event_types, getRequestHeaders, saveSettings } from '../../../../script.js';
import { extension_settings } from '../../../extensions.js';
import { loadWorldInfo } from '../../../world-info.js';
import { translate } from '../../../i18n.js';
import { commitSummaryEntries, prepareSummaryCandidateKeywords, prepareSummaryCandidateTitle } from './arcanalysis.js';
import { consolidationSourceContentHash, consolidationSourceHash, reconcileConsolidationCheckpoint } from './consolidationReceiptPolicy.js';
import { getCurrentStmbChatRef, getStmbChatKey, withStmbWriteLane } from './stmbJobs.js';

const KEY = 'consolidationCheckpoints';
let settingsWrite = Promise.resolve();

function records() {
    const settings = extension_settings.STMemoryBooks ||= {};
    return settings[KEY] ||= [];
}

function makeId() {
    return globalThis.crypto?.randomUUID?.() || `stmb-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function sourceSnapshot(lorebook, candidate) {
    const entries = Object.values(lorebook?.entries || {});
    return (candidate.memberIds || []).map(id => {
        const entry = entries.find(item => String(item.uid) === String(id));
        if (!entry) throw new Error('A consolidation source is missing. Review the Memory Book.');
        return { uid: String(id), hash: consolidationSourceHash(entry), contentHash: consolidationSourceContentHash(entry) };
    });
}

/** A settings acknowledgement is required before any lorebook write. */
async function persist() {
    const write = async () => {
        const expected = JSON.stringify(records());
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 10000);
        let listener;
        try {
            const updated = new Promise((resolve, reject) => {
                listener = resolve;
                eventSource.on(event_types.SETTINGS_UPDATED, listener);
                controller.signal.addEventListener('abort', () => reject(new Error('Checkpoint settings save timed out')), { once: true });
                void Promise.resolve(saveSettings()).catch(reject);
            });
            await updated;
            const response = await fetch('/api/settings/get', {
                method: 'POST', headers: getRequestHeaders(), cache: 'no-cache',
                body: '{}', signal: controller.signal,
            });
            if (!response.ok) throw new Error('Checkpoint settings could not be checked');
            const saved = JSON.parse((await response.json()).settings).extension_settings?.STMemoryBooks?.[KEY] || [];
            if (JSON.stringify(saved) !== expected) throw new Error('Checkpoint settings were not saved');
        } finally {
            clearTimeout(timer);
            if (listener) eventSource.removeListener(event_types.SETTINGS_UPDATED, listener);
        }
    };
    const result = settingsWrite.then(write, write);
    settingsWrite = result.catch(() => {});
    return result;
}

/** Reconciles a persisted intent before it can create an entry. Caller holds the lorebook write lane. */
export async function resumeConsolidationCheckpoint(checkpoint) {
    try { return await reconcileConsolidationCheckpoint(checkpoint, {
        load: () => loadWorldInfo(checkpoint.lorebookName),
        persist,
        commit: lorebook => commitSummaryEntries({
            ...checkpoint.options, lorebookName: checkpoint.lorebookName, lorebookData: lorebook,
            summaryCandidates: [checkpoint.candidate],
            entryMetadata: { ...(checkpoint.options.entryMetadata || {}), STMB_consolidationCommitId: checkpoint.id },
        }),
    }); } catch (error) {
        if (error?.code === 'STMB_CONSOLIDATION_NEEDS_REVIEW') {
            error.message = translate('Saved consolidation state could not be confirmed. Review the Memory Book before starting again.', 'STMemoryBooks_Consolidation_ReviewRequired');
        }
        throw error;
    }
}

/** Creates durable intents and commits one candidate at a time. */
export async function commitSummaryEntriesRecoverable(options, onCheckpoint = null) {
    const { lorebookName, lorebookData, summaryCandidates = [], onCheckpoint: optionCheckpoint,
        chatRef, consolidationRunId = makeId(), ...commitOptions } = options;
    const results = [];
    for (const candidate of summaryCandidates) {
        const prepared = prepareSummaryCandidateTitle(
            await prepareSummaryCandidateKeywords(candidate, commitOptions.targetTier),
            lorebookData, commitOptions.targetTier,
        );
        const checkpoint = {
            id: makeId(), runId: consolidationRunId, lorebookName, candidate: prepared,
            sources: sourceSnapshot(lorebookData, prepared),
            options: structuredClone({ ...commitOptions, skipKeywordGeneration: true }), chatKey: getStmbChatKey(chatRef || getCurrentStmbChatRef()),
            status: 'pending', postEffectsDone: false, createdAt: Date.now(), error: null,
        };
        records().push(checkpoint);
        try { await persist(); }
        catch (error) { records().splice(records().indexOf(checkpoint), 1); throw error; }
        (onCheckpoint || optionCheckpoint)?.(checkpoint.id);
        results.push(await resumeConsolidationCheckpoint(checkpoint));
        // Keep the caller's source object aligned for subsequent candidates.
        const refreshed = await loadWorldInfo(lorebookName);
        lorebookData.entries = refreshed.entries;
    }
    return { results };
}

export function getUnfinishedConsolidationCheckpoints() {
    return records().filter(item => item.status !== 'dismissed'
        && (item.status !== 'completed' || item.postEffectsDone !== true));
}

export function getConsolidationCheckpoint(id) {
    return records().find(item => item.id === id) || null;
}

export async function dismissConsolidationCheckpoint(id) {
    const checkpoint = records().find(item => item.id === id);
    if (!checkpoint || checkpoint.status !== 'needsReview') return false;
    checkpoint.status = 'dismissed';
    await persist();
    return true;
}

export async function markConsolidationPostEffectsDone(lorebookName, targetTier, chatKey = null) {
    const pending = records().filter(item => item.status === 'completed' && !item.postEffectsDone
        && item.lorebookName === lorebookName && Number(item.options.targetTier) === Number(targetTier)
        && (!chatKey || item.chatKey === chatKey));
    if (!pending.length) return;
    for (const item of pending) item.postEffectsDone = true;
    await persist();
}

export async function resumeConsolidationCheckpointById(id) {
    const checkpoint = records().find(item => item.id === id);
    if (!checkpoint) throw new Error('Consolidation checkpoint is unavailable');
    return withStmbWriteLane({ type: 'lorebook', name: checkpoint.lorebookName }, () => resumeConsolidationCheckpoint(checkpoint));
}
