// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import { stableHashString } from './clipReviewPolicy.js';

function canonical(value) {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === 'object') {
        return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
    }
    return value;
}

export function consolidationSourceHash(entry) {
    return stableHashString(JSON.stringify(canonical(entry)));
}

export function consolidationSourceContentHash(entry) {
    const { disable: _disable, disabledBySummaryId: _link, ...content } = entry;
    return consolidationSourceHash(content);
}

export function inspectConsolidationReceipt(lorebook, checkpoint) {
    const entries = Object.values(lorebook?.entries || {});
    const matches = entries.filter(entry => entry.STMB_consolidationCommitId === checkpoint.id);
    if (matches.length > 1) return { kind: 'conflict', reason: 'Duplicate consolidation receipts were found. Review the Memory Book.' };
    const entry = matches[0];
    if (!entry) return { kind: 'missing' };
    if (Number(entry.stmbSummaryTier) !== Number(checkpoint.options.targetTier)
        || String(entry.content || '') !== String(checkpoint.candidate.summary || '')
        || JSON.stringify((entry.stmbSourceEntryUids || []).map(String).sort())
            !== JSON.stringify((checkpoint.candidate.memberIds || []).map(String).sort())) {
        return { kind: 'conflict', reason: 'A saved consolidation was edited. Review the Memory Book.' };
    }
    if (checkpoint.options.disableOriginals && checkpoint.sources.some(source => {
        const current = entries.find(item => String(item.uid) === source.uid);
        return !current || !current.disable || String(current.disabledBySummaryId) !== String(entry.uid)
            || (source.contentHash && consolidationSourceContentHash(current) !== source.contentHash);
    })) {
        return { kind: 'conflict', reason: 'A consolidation source changed after saving. Review the Memory Book.' };
    }
    return { kind: 'saved', entry };
}

/** The write is attempted only after a live read proves the receipt absent and sources unchanged. */
export async function reconcileConsolidationCheckpoint(checkpoint, { load, persist, commit }) {
    const needsReview = async reason => {
        checkpoint.status = 'needsReview';
        checkpoint.error = reason;
        await persist();
        throw Object.assign(new Error(reason), { code: 'STMB_CONSOLIDATION_NEEDS_REVIEW' });
    };
    if (checkpoint.status === 'needsReview' || checkpoint.status === 'dismissed') {
        throw new Error(checkpoint.error || 'Consolidation requires review');
    }
    const lorebook = await load();
    if (!lorebook?.entries) return needsReview('The Memory Book is unavailable.');
    let inspection = inspectConsolidationReceipt(lorebook, checkpoint);
    if (inspection.kind === 'conflict') return needsReview(inspection.reason);
    if (inspection.kind === 'missing') {
        const entries = Object.values(lorebook.entries);
        if (checkpoint.sources.some(source => {
            const current = entries.find(item => String(item.uid) === source.uid);
            return !current || consolidationSourceHash(current) !== source.hash;
        })) return needsReview('Consolidation sources changed. Review the Memory Book.');
        await commit(lorebook);
        inspection = inspectConsolidationReceipt(await load(), checkpoint);
        if (inspection.kind !== 'saved') {
            return needsReview(inspection.reason || 'The consolidation save could not be confirmed. Review the Memory Book.');
        }
    }
    checkpoint.status = 'completed';
    checkpoint.entryUid = inspection.entry.uid;
    checkpoint.error = null;
    await persist();
    return { summaryEntryId: inspection.entry.uid, title: inspection.entry.comment,
        targetTier: Number(checkpoint.options.targetTier) };
}
