// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import test from 'node:test';
import { consolidationSourceContentHash, consolidationSourceHash, inspectConsolidationReceipt, reconcileConsolidationCheckpoint } from './consolidationReceiptPolicy.js';

function fixture() {
    const source = { uid: 1, comment: 'Memory', content: 'fact', key: [], disable: false };
    const checkpoint = {
        id: 'commit-1', candidate: { summary: 'summary', memberIds: ['1'] },
        options: { targetTier: 1, disableOriginals: true },
        sources: [{ uid: '1', hash: consolidationSourceHash(source), contentHash: consolidationSourceContentHash(source) }],
    };
    return { source, checkpoint };
}

test('reconciles missing and saved summaries without treating edited copies as receipts', () => {
    const { source, checkpoint } = fixture();
    assert.equal(inspectConsolidationReceipt({ entries: { 1: source } }, checkpoint).kind, 'missing');
    const summary = { uid: 2, content: 'summary', stmbSummaryTier: 1,
        stmbSourceEntryUids: ['1'], STMB_consolidationCommitId: 'commit-1' };
    source.disable = true;
    source.disabledBySummaryId = 2;
    assert.equal(inspectConsolidationReceipt({ entries: { 1: source, 2: summary } }, checkpoint).kind, 'saved');
    assert.equal(inspectConsolidationReceipt({ entries: { 1: { ...source, content: 'edited' }, 2: summary } }, checkpoint).kind, 'conflict');
    assert.equal(inspectConsolidationReceipt({ entries: { 1: source, 2: { ...summary, content: 'edited' } } }, checkpoint).kind, 'conflict');
    assert.equal(inspectConsolidationReceipt({ entries: { 1: source, 2: summary, 3: { ...summary, uid: 3 } } }, checkpoint).kind, 'conflict');
});

test('a lost save response reconciles its receipt without writing twice', async () => {
    const { source, checkpoint } = fixture();
    checkpoint.candidate.memberIds = [1, '1', 1];
    let writes = 0;
    let persisted = 0;
    const lorebook = { entries: { 1: source } };
    const adapters = {
        load: async () => lorebook,
        persist: async () => { persisted++; },
        commit: async () => {
            writes++;
            source.disable = true;
            source.disabledBySummaryId = 2;
            lorebook.entries[2] = { uid: 2, comment: 'Summary', content: 'summary',
                stmbSummaryTier: 1, stmbSourceEntryUids: ['1'], STMB_consolidationCommitId: checkpoint.id };
            throw new Error('response lost');
        },
    };
    await assert.rejects(reconcileConsolidationCheckpoint(checkpoint, adapters), /response lost/);
    assert.equal(checkpoint.status, undefined);
    const result = await reconcileConsolidationCheckpoint(checkpoint, adapters);
    assert.equal(result.summaryEntryId, 2);
    assert.equal(writes, 1);
    assert.equal(persisted, 1);
});

test('changed sources become Needs Review before any write', async () => {
    const { source, checkpoint } = fixture();
    source.content = 'edited';
    let writes = 0;
    await assert.rejects(reconcileConsolidationCheckpoint(checkpoint, {
        load: async () => ({ entries: { 1: source } }), persist: async () => {},
        commit: async () => { writes++; },
    }), /sources changed/);
    assert.equal(checkpoint.status, 'needsReview');
    assert.equal(writes, 0);
});

test('an unconfirmed readback stops replay after one write', async () => {
    const { source, checkpoint } = fixture();
    let writes = 0;
    await assert.rejects(reconcileConsolidationCheckpoint(checkpoint, {
        load: async () => ({ entries: { 1: source } }),
        persist: async () => {},
        commit: async () => { writes++; },
    }), /save could not be confirmed/);
    assert.equal(writes, 1);
    assert.equal(checkpoint.status, 'needsReview');
    await assert.rejects(reconcileConsolidationCheckpoint(checkpoint, {
        load: async () => ({ entries: { 1: source } }), persist: async () => {},
        commit: async () => { writes++; },
    }), /review/i);
    assert.equal(writes, 1);
});
