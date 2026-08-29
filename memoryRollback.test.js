// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import test from 'node:test';
import {
    ROLLBACK_SCOPE_AFFECTED,
    ROLLBACK_SCOPE_FULL,
    applyLorebookRollback,
    applySidePromptRestoration,
    collectConsolidationRollbackPlan,
    collectRollbackMemories,
    computeRollbackCheckpoint,
    createMessageDeletionTracker,
    fingerprintRollbackEntry,
    planSidePromptRestorations,
    validateAndExpandLinkedRollbackSelections,
} from './memoryRollback.js';

function memory(uid, start, end, extra = {}) {
    return {
        uid,
        comment: `Memory ${uid}`,
        content: `Content ${uid}`,
        stmemorybooks: true,
        STMB_start: start,
        STMB_end: end,
        STMB_chatId: 'chat-a',
        ...extra,
    };
}

function summary(uid, tier, sources, extra = {}) {
    return {
        uid,
        comment: `Summary ${uid}`,
        content: `Summary content ${uid}`,
        stmemorybooks: true,
        stmbSummary: true,
        stmbSummaryTier: tier,
        stmbSourceEntryUids: sources,
        ...extra,
    };
}

test('message deletion tracker finds tail truncation and exact middle ranges', () => {
    const tracker = createMessageDeletionTracker();
    const messages = Array.from({ length: 7 }, (_, id) => ({ id }));
    tracker.snapshot('chat', messages);
    messages.splice(5, 2);
    assert.deepEqual(tracker.detect('chat', messages), {
        start: 5,
        end: 6,
        count: 2,
        previousLength: 7,
        currentLength: 5,
        isTail: true,
    });

    messages.push({ id: 7 }, { id: 8 }, { id: 9 });
    tracker.snapshot('chat', messages);
    messages.splice(2, 2);
    assert.deepEqual(tracker.detect('chat', messages), {
        start: 2,
        end: 3,
        count: 2,
        previousLength: 8,
        currentLength: 6,
        isTail: false,
    });
});

test('message deletion tracker survives a chat reload that replaces message objects', () => {
    const tracker = createMessageDeletionTracker();
    const before = Array.from({ length: 5 }, (_, id) => ({
        send_date: `date-${id}`,
        name: id % 2 ? 'Assistant' : 'User',
        is_user: id % 2 === 0,
        mes: `Message ${id}`,
    }));
    tracker.snapshot('chat', before);
    const after = structuredClone(before);
    after.splice(1, 2);
    assert.deepEqual(tracker.detect('chat', after), {
        start: 1,
        end: 2,
        count: 2,
        previousLength: 5,
        currentLength: 3,
        isTail: false,
    });
});

test('rollback selection is exact-chat, range-aware, and flags ambiguous legacy entries', () => {
    const lorebook = {
        entries: {
            1: memory(1, 0, 9),
            2: memory(2, 10, 19),
            3: memory(3, 20, 29),
            4: memory(4, 10, 19, { STMB_chatId: 'chat-b' }),
            5: memory(5, 10, 19, { STMB_chatId: undefined }),
            6: memory(6, 10, 19, { STMB_end: undefined }),
        },
    };
    const deletion = { start: 15, end: 15, count: 1 };
    const affected = collectRollbackMemories(lorebook, {
        chatId: 'chat-a', deletion, scope: ROLLBACK_SCOPE_AFFECTED,
    });
    assert.deepEqual(affected.selected.map(item => item.uid), ['2']);
    assert.deepEqual(affected.ambiguous.map(item => item.uid), ['5', '6']);

    const full = collectRollbackMemories(lorebook, {
        chatId: 'chat-a', deletion, scope: ROLLBACK_SCOPE_FULL,
    });
    assert.deepEqual(full.selected.map(item => item.uid), ['3', '2']);
});

test('linked canonical and group copies expand as one rollback unit and missing canonicals abort', () => {
    const canonical = memory(1, 10, 19, {
        STMB_canonical: true,
        STMB_canonicalLorebook: 'Book A',
        STMB_canonicalEntryUid: 1,
        STMB_inclusionGroup: 'Chat-Memory-001',
    });
    const copy = memory(8, 10, 19, {
        STMB_canonical: false,
        STMB_canonicalLorebook: 'Book A',
        STMB_canonicalEntryUid: 1,
        STMB_inclusionGroup: 'Chat-Memory-001',
    });
    const states = [
        { name: 'Book A', data: { entries: { 1: canonical } } },
        { name: 'Book B', data: { entries: { 8: copy } } },
    ];
    const selections = new Map([
        ['Book A', new Set(['1'])],
        ['Book B', new Set()],
    ]);
    assert.deepEqual(validateAndExpandLinkedRollbackSelections(states, selections, 'chat-a'), []);
    assert.equal(selections.get('Book B').has('8'), true);

    const missingCanonicalSelections = new Map([['Book B', new Set(['8'])]]);
    const issues = validateAndExpandLinkedRollbackSelections([states[1]], missingCanonicalSelections, 'chat-a');
    assert.equal(issues.some(issue => issue.includes('Missing canonical entry')), true);
});

test('consolidation preflight walks nested parents and rejects missing dependencies', () => {
    const lorebook = {
        entries: {
            1: memory(1, 0, 9, { disable: true, disabledBySummaryId: 10 }),
            2: memory(2, 10, 19, { disable: true, disabledBySummaryId: 10 }),
            10: summary(10, 1, ['1', '2'], { disable: true, disabledBySummaryId: 20 }),
            20: summary(20, 2, ['10']),
        },
    };
    const plan = collectConsolidationRollbackPlan(lorebook, new Set(['1']));
    assert.deepEqual(plan.parents.map(parent => parent.uid), ['20', '10']);
    assert.deepEqual(plan.issues, []);

    lorebook.entries[20].stmbSourceEntryUids.push('missing');
    const invalid = collectConsolidationRollbackPlan(lorebook, new Set(['1']));
    assert.equal(invalid.issues.some(issue => issue.reason === 'missing-source-entries'), true);
});

test('commit removes nested summaries, re-enables direct siblings, and preserves manual disables', () => {
    const lorebook = {
        entries: {
            1: memory(1, 0, 9, { disable: true, disabledBySummaryId: 10 }),
            2: memory(2, 10, 19, { disable: true, disabledBySummaryId: 10 }),
            3: memory(3, 20, 29, { disable: true }),
            10: summary(10, 1, ['1', '2'], { disable: true, disabledBySummaryId: 20 }),
            20: summary(20, 2, ['10']),
        },
    };
    const plan = collectConsolidationRollbackPlan(lorebook, new Set(['1']));
    applyLorebookRollback(lorebook, {
        selectedMemoryUids: new Set(['1']),
        consolidationPlan: plan,
        deletion: { start: 5, end: 5, count: 1 },
        chatId: 'chat-a',
    });
    assert.equal(lorebook.entries[1], undefined);
    assert.equal(lorebook.entries[10], undefined);
    assert.equal(lorebook.entries[20], undefined);
    assert.equal(lorebook.entries[2].disable, false);
    assert.equal('disabledBySummaryId' in lorebook.entries[2], false);
    assert.equal(lorebook.entries[3].disable, true);
});

test('affected-only rollback reindexes later Memories, Side Prompt checkpoints, and final checkpoint', () => {
    const sidePrompt = {
        uid: 30,
        comment: 'Tracker (STMB SidePrompt)',
        STMB_tracker_lastMsgId: 29,
        STMB_sidePromptRegeneration: {
            version: 2,
            chatId: 'chat-a',
            sceneStart: 20,
            sceneEnd: 29,
        },
    };
    const lorebook = {
        entries: {
            1: memory(1, 0, 9),
            2: memory(2, 10, 19),
            3: memory(3, 20, 29),
            30: sidePrompt,
        },
    };
    applyLorebookRollback(lorebook, {
        selectedMemoryUids: new Set(['2']),
        consolidationPlan: null,
        deletion: { start: 12, end: 13, count: 2 },
        chatId: 'chat-a',
        reindexLaterEntries: true,
    });
    assert.equal(lorebook.entries[2], undefined);
    assert.deepEqual(
        { start: lorebook.entries[3].STMB_start, end: lorebook.entries[3].STMB_end },
        { start: 18, end: 27 },
    );
    assert.equal(sidePrompt.STMB_tracker_lastMsgId, 27);
    assert.deepEqual(
        { start: sidePrompt.STMB_sidePromptRegeneration.sceneStart, end: sidePrompt.STMB_sidePromptRegeneration.sceneEnd },
        { start: 18, end: 27 },
    );
    assert.equal(computeRollbackCheckpoint([{ name: 'Book', data: lorebook }], 'chat-a'), 27);
});

test('version-2 Side Prompt rollback restores or deletes once and protects changed entries', () => {
    const prior = { uid: 5, comment: 'Tracker', content: 'Before', key: ['old'], order: 100 };
    const current = { uid: 5, comment: 'Tracker', content: 'After', key: ['new'], order: 200 };
    current.STMB_sidePromptRegeneration = {
        version: 2,
        chatId: 'chat-a',
        sceneStart: 10,
        sceneEnd: 19,
        priorEntryExisted: true,
        priorEntryState: prior,
        writtenFingerprint: fingerprintRollbackEntry(current, { excludeSidePromptSnapshot: true }),
    };
    const created = { uid: 6, comment: 'Created', content: 'After' };
    created.STMB_sidePromptRegeneration = {
        version: 2,
        chatId: 'chat-a',
        sceneStart: 10,
        sceneEnd: 19,
        priorEntryExisted: false,
        priorEntryState: null,
        writtenFingerprint: fingerprintRollbackEntry(created, { excludeSidePromptSnapshot: true }),
    };
    const legacy = {
        uid: 7,
        STMB_sidePromptRegeneration: { version: 1, chatId: 'chat-a', sceneStart: 10, sceneEnd: 19 },
    };
    const lorebook = { entries: { 5: current, 6: created, 7: legacy } };
    const plan = planSidePromptRestorations(lorebook, {
        chatId: 'chat-a', rollbackRanges: [{ start: 0, end: 15 }],
    });
    assert.deepEqual(plan.restorable.map(item => item.uid), ['5', '6']);
    assert.deepEqual(plan.legacy.map(item => item.uid), ['7']);
    assert.equal(applySidePromptRestoration(lorebook, plan.restorable[0]).changed, true);
    assert.equal(lorebook.entries[5].content, 'Before');
    assert.equal('STMB_sidePromptRegeneration' in lorebook.entries[5], false);
    assert.equal(applySidePromptRestoration(lorebook, plan.restorable[1]).deleted, true);
    assert.equal(lorebook.entries[6], undefined);

    const changed = { ...current, content: 'User edit' };
    lorebook.entries[5] = changed;
    const changedPlan = planSidePromptRestorations(lorebook, {
        chatId: 'chat-a', rollbackRanges: [{ start: 10, end: 19 }],
    });
    assert.equal(applySidePromptRestoration(lorebook, changedPlan.restorable[0]).reason, 'entry-changed');
    assert.equal(lorebook.entries[5].content, 'User edit');
});
