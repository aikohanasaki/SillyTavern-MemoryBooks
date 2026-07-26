// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import test from 'node:test';
import {
    applyFixedSequenceNumber,
    applyRegenerationReplacement,
    buildConsolidationRegenerationOptions,
    buildRegenerationIndexes,
    findActiveParentConsolidations,
    focusRegenerationSetting,
    getConsolidationSourceUids,
    getEntryByUid,
    getRegenerationEligibility,
    hasLinkedManualGroupMetadata,
    isRegenerationSourceChatCurrent,
    normalizeConsolidationRegenerationResponse,
    preflightRegenerationVisibility,
    selectPreviousMemoryContext,
} from './memoryRegeneration.js';

function memory(uid, number, extra = {}) {
    return {
        uid,
        comment: `[${String(number).padStart(3, '0')}] - Memory ${number}`,
        content: `Content ${number}`,
        key: [`key-${number}`],
        stmemorybooks: true,
        STMB_start: number * 10,
        STMB_end: number * 10 + 9,
        ...extra,
    };
}

test('formats every supported numbering token with a fixed sequence', () => {
    const cases = new Map([
        ['[[000]] - {{title}}', '[007] - {{title}}'],
        ['[000] - {{title}}', '007 - {{title}}'],
        ['([000]) - {{title}}', '(007) - {{title}}'],
        ['{[000]} - {{title}}', '{007} - {{title}}'],
        ['#[000] - {{title}}', '#007 - {{title}}'],
        ['(000) - {{title}}', '(007) - {{title}}'],
        ['{000} - {{title}}', '{007} - {{title}}'],
        ['#000 - {{title}}', '#007 - {{title}}'],
    ]);
    for (const [format, expected] of cases) {
        assert.equal(applyFixedSequenceNumber(format, 7), expected);
    }
    assert.equal(
        applyFixedSequenceNumber('[[000]] / [[000]] - {{title}}', 7),
        '[007] / [007] - {{title}}',
    );
});

test('allows an existing zero sequence number to be regenerated unchanged', () => {
    const entry = memory(1, 0, { comment: '#000 - Prologue', STMB_start: 0, STMB_end: 0 });
    const result = getRegenerationEligibility(entry, { entries: { 1: entry } });
    assert.equal(result.eligible, true);
    assert.equal(result.sequenceNumber, 0);
    assert.equal(applyFixedSequenceNumber('#000 - {{title}}', result.sequenceNumber), '#000 - {{title}}');
});

test('selects only base memories preceding the target', () => {
    const lorebook = {
        entries: {
            1: memory(1, 1),
            2: memory(2, 2),
            3: memory(3, 3),
            4: memory(4, 4),
            20: {
                uid: 20,
                comment: '[ARC 001] - Arc',
                content: 'Arc',
                stmemorybooks: true,
                stmbSummary: true,
                stmbSummaryTier: 1,
            },
        },
    };
    const result = selectPreviousMemoryContext(lorebook, 3, 2);
    assert.deepEqual(result.summaries.map(item => item.uid), ['1', '2']);
    assert.equal(result.actualCount, 2);
    assert.equal(result.requestedCount, 2);
});

test('stored consolidation sources take precedence over legacy backlinks', () => {
    const target = {
        uid: 20,
        stmbSourceEntryUids: ['1', '2'],
        stmemorybooks: true,
        stmbSummary: true,
        stmbSummaryTier: 1,
    };
    const lorebook = {
        entries: {
            1: memory(1, 1, { disabledBySummaryId: 20 }),
            2: memory(2, 2),
            3: memory(3, 3, { disabledBySummaryId: 20 }),
            20: target,
        },
    };
    assert.deepEqual(getConsolidationSourceUids(target, lorebook), {
        uids: ['1', '2'],
        source: 'stored',
    });
});

test('recovers legacy sources from disabledBySummaryId backlinks', () => {
    const target = {
        uid: 20,
        stmemorybooks: true,
        stmbSummary: true,
        stmbSummaryTier: 1,
    };
    const lorebook = {
        entries: {
            1: memory(1, 1, { disabledBySummaryId: 20 }),
            2: memory(2, 2, { disabledBySummaryId: 20 }),
            20: target,
        },
    };
    assert.deepEqual(getConsolidationSourceUids(target, lorebook), {
        uids: ['1', '2'],
        source: 'legacy-backlinks',
    });
});

test('regeneration indexes support lookup, legacy sources, and deduplicated parents without rescanning', () => {
    const source = memory(1, 1, { disable: true, disabledBySummaryId: 20 });
    const parent = {
        uid: 20,
        comment: '[ARC 001] - Arc',
        content: 'Arc',
        stmemorybooks: true,
        stmbSummary: true,
        stmbSummaryTier: 1,
        stmbSourceEntryUids: ['1'],
    };
    const legacySource = memory(2, 2, { disable: true, disabledBySummaryId: 30 });
    const legacyParent = {
        uid: 30,
        comment: '[ARC 002] - Legacy Arc',
        content: 'Legacy Arc',
        stmemorybooks: true,
        stmbSummary: true,
        stmbSummaryTier: 1,
    };
    const entries = { 1: source, 2: legacySource, 20: parent, 30: legacyParent };
    const lorebook = { entries };
    const indexes = buildRegenerationIndexes(lorebook);

    for (const entry of Object.values(entries)) {
        assert.deepEqual(
            findActiveParentConsolidations(entry, lorebook, indexes),
            findActiveParentConsolidations(entry, lorebook),
        );
        assert.deepEqual(
            getConsolidationSourceUids(entry, lorebook, indexes),
            getConsolidationSourceUids(entry, lorebook),
        );
        assert.deepEqual(
            getRegenerationEligibility(entry, lorebook, indexes),
            getRegenerationEligibility(entry, lorebook),
        );
    }

    lorebook.entries = new Proxy(entries, {
        ownKeys() {
            throw new Error('Indexed regeneration lookup rescanned lorebook entries');
        },
    });

    assert.equal(getEntryByUid(lorebook, 1, indexes), source);
    assert.deepEqual(findActiveParentConsolidations(source, lorebook, indexes), [parent]);
    assert.equal(getRegenerationEligibility(source, lorebook, indexes).reason, 'active-parent');

    assert.deepEqual(getConsolidationSourceUids(legacyParent, lorebook, indexes), {
        uids: ['2'],
        source: 'legacy-backlinks',
    });
    assert.deepEqual(getRegenerationEligibility(legacyParent, lorebook, indexes), {
        eligible: true,
        kind: 'consolidation',
        tier: 1,
        sequenceNumber: 2,
        sourceUids: ['2'],
        sourceResolution: 'legacy-backlinks',
    });
});

test('active consolidation blocks source regeneration until the parent is deleted', () => {
    const source = memory(1, 1, { disable: true, disabledBySummaryId: 20 });
    const parent = {
        uid: 20,
        comment: '[ARC 001] - Arc',
        content: 'Arc',
        stmemorybooks: true,
        stmbSummary: true,
        stmbSummaryTier: 1,
        stmbSourceEntryUids: ['1'],
    };
    const lorebook = { entries: { 1: source, 20: parent } };

    assert.equal(findActiveParentConsolidations(source, lorebook).length, 1);
    assert.equal(getRegenerationEligibility(source, lorebook).reason, 'active-parent');

    delete lorebook.entries[20];
    assert.equal(getRegenerationEligibility(source, lorebook).eligible, true);
});

test('stored and legacy parent links independently block regeneration', () => {
    const source = memory(1, 1);
    const storedParent = {
        uid: 20,
        stmemorybooks: true,
        stmbSummary: true,
        stmbSummaryTier: 1,
        stmbSourceEntryUids: ['1'],
    };
    assert.equal(
        getRegenerationEligibility(source, { entries: { 1: source, 20: storedParent } }).reason,
        'active-parent',
    );

    source.disabledBySummaryId = 21;
    const legacyParent = {
        uid: 21,
        stmemorybooks: true,
        stmbSummary: true,
        stmbSummaryTier: 1,
    };
    assert.equal(
        getRegenerationEligibility(source, { entries: { 1: source, 21: legacyParent } }).reason,
        'active-parent',
    );
});

test('consolidation eligibility requires complete child linkage and correct tiers', () => {
    const arc = {
        uid: 20,
        comment: '[ARC 001] - Arc',
        content: 'Arc',
        stmemorybooks: true,
        stmbSummary: true,
        stmbSummaryTier: 1,
        stmbSourceEntryUids: ['1', '2'],
    };
    const lorebook = { entries: { 1: memory(1, 1), 2: memory(2, 2), 20: arc } };
    assert.deepEqual(getRegenerationEligibility(arc, lorebook), {
        eligible: true,
        kind: 'consolidation',
        tier: 1,
        sequenceNumber: 1,
        sourceUids: ['1', '2'],
        sourceResolution: 'stored',
    });

    delete lorebook.entries[2];
    assert.equal(getRegenerationEligibility(arc, lorebook).reason, 'missing-sources');
});

test('visibility preflight respects visible-only ranges when unhide is disabled', async () => {
    const messages = [
        { mes: 'visible', is_system: false },
        { mes: 'hidden', is_system: true },
    ];
    assert.deepEqual(
        await preflightRegenerationVisibility({ messages, start: 0, end: 0 }),
        { ok: true, reason: null, visibleCount: 1 },
    );
    assert.deepEqual(
        await preflightRegenerationVisibility({ messages, start: 0, end: 1 }),
        { ok: true, reason: null, visibleCount: 1 },
    );
    assert.deepEqual(
        await preflightRegenerationVisibility({ messages, start: 1, end: 1 }),
        { ok: false, reason: 'no-visible-messages', visibleCount: 0 },
    );
});

test('visibility preflight handles successful and failed automatic unhide', async () => {
    const messages = [{ mes: 'hidden', is_system: true }];
    const success = await preflightRegenerationVisibility({
        messages,
        start: 0,
        end: 0,
        unhideBeforeMemory: true,
        executeUnhide: async () => {
            messages[0].is_system = false;
        },
    });
    assert.deepEqual(success, { ok: true, reason: null, visibleCount: 1 });

    messages[0].is_system = true;
    const failure = await preflightRegenerationVisibility({
        messages,
        start: 0,
        end: 0,
        unhideBeforeMemory: true,
        executeUnhide: async () => {
            throw new Error('unhide unavailable');
        },
    });
    assert.equal(failure.ok, false);
    assert.equal(failure.reason, 'unhide-failed');

    const ineffective = await preflightRegenerationVisibility({
        messages,
        start: 0,
        end: 0,
        unhideBeforeMemory: true,
        executeUnhide: async () => {},
    });
    assert.deepEqual(ineffective, {
        ok: false,
        reason: 'no-visible-messages',
        visibleCount: 0,
    });
});

test('settings focus scrolls, focuses, highlights, and never checks the checkbox', () => {
    const events = [];
    const label = {
        classList: {
            add: value => events.push(`add:${value}`),
            remove: value => events.push(`remove:${value}`),
        },
    };
    const checkbox = {
        checked: false,
        scrollIntoView: () => events.push('scroll'),
        focus: () => events.push('focus'),
        closest: () => label,
    };
    const root = {
        querySelector: selector => selector === '#stmb-unhide-before-memory' ? checkbox : null,
    };
    const focused = focusRegenerationSetting(root, 'stmb-unhide-before-memory', {
        removeDelay: 0,
        schedule: callback => callback(),
    });
    assert.equal(focused, true);
    assert.equal(checkbox.checked, false);
    assert.deepEqual(events, [
        'scroll',
        'focus',
        'add:stmb-setting-focus-highlight',
        'remove:stmb-setting-focus-highlight',
    ]);
});

test('every consolidation tier uses the one-pass regeneration-only prompt', () => {
    for (let tier = 1; tier <= 6; tier++) {
        assert.deepEqual(buildConsolidationRegenerationOptions(4, tier), {
            presetKey: 'arc_regenerate',
            targetTier: tier,
            maxItemsPerPass: 4,
            maxPasses: 1,
            minAssigned: 1,
            tokenTarget: Number.MAX_SAFE_INTEGER,
        });
    }
});

test('normalizes the flat consolidation regeneration response', () => {
    assert.deepEqual(normalizeConsolidationRegenerationResponse({
        title: '  A Changed Alliance  ',
        content: '# A Changed Alliance\n\nRei changed sides.',
        keywords: [' Rei ', '', 42, 'alliance'],
    }), {
        summaries: [{
            title: 'A Changed Alliance',
            summary: '# A Changed Alliance\n\nRei changed sides.',
            keywords: ['Rei', 'alliance'],
        }],
        unassigned_items: [],
    });

    const escapedNewlines = JSON.parse(
        '{"title":"Timeline","content":"Line 1\\nLine 2","keywords":["timeline"]}',
    );
    assert.equal(
        normalizeConsolidationRegenerationResponse(escapedNewlines)
            .summaries[0].summary,
        'Line 1\nLine 2',
    );
});

test('rejects invalid flat consolidation regeneration responses', () => {
    assert.equal(normalizeConsolidationRegenerationResponse(null), null);
    assert.equal(normalizeConsolidationRegenerationResponse({
        title: '',
        content: 'Content',
        keywords: [],
    }), null);
    assert.equal(normalizeConsolidationRegenerationResponse({
        title: 'Title',
        content: '',
        keywords: [],
    }), null);
    assert.equal(normalizeConsolidationRegenerationResponse({
        title: 'Title',
        content: 'Content',
        keywords: 'keyword',
    }), null);
});

test('detects linked manual-group copies from retry linkage metadata', () => {
    assert.equal(hasLinkedManualGroupMetadata(memory(1, 1)), false);
    assert.equal(hasLinkedManualGroupMetadata(memory(1, 1, {
        STMB_inclusionGroup: 'Group-Memory-001',
    })), true);
    assert.equal(hasLinkedManualGroupMetadata(memory(1, 1, {
        STMB_canonicalLorebook: 'Group Memory Book',
        STMB_canonicalEntryUid: 10,
    })), true);
});

test('replacement changes only approved fields, source metadata, and stale disable state', () => {
    const entry = memory(1, 1, {
        disable: true,
        disabledBySummaryId: 99,
        order: 321,
        position: 4,
        characterFilter: { isExclude: false, names: ['Alice'], tags: [] },
    });
    const lorebook = { entries: { 1: entry } };
    applyRegenerationReplacement(entry, {
        formattedTitle: '#001 - Replacement',
        content: 'Replacement content',
        keywords: ['replacement'],
    }, {
        sourceUids: ['10', '11'],
        lorebookData: lorebook,
    });
    assert.equal(entry.comment, '#001 - Replacement');
    assert.equal(entry.content, 'Replacement content');
    assert.deepEqual(entry.key, ['replacement']);
    assert.deepEqual(entry.stmbSourceEntryUids, ['10', '11']);
    assert.equal(entry.disable, false);
    assert.equal('disabledBySummaryId' in entry, false);
    assert.equal(entry.uid, 1);
    assert.equal(entry.STMB_start, 10);
    assert.equal(entry.STMB_end, 19);
    assert.equal(entry.order, 321);
    assert.equal(entry.position, 4);
    assert.deepEqual(entry.characterFilter.names, ['Alice']);
});

test('source-chat validation requires the current lorebook and honors stored chat IDs', () => {
    const entry = memory(1, 1, { STMB_chatId: 'chat-a' });
    assert.equal(
        isRegenerationSourceChatCurrent(entry, 'Book A', 'chat-a', ['Book A']),
        true,
    );
    assert.equal(
        isRegenerationSourceChatCurrent(entry, 'Book A', 'chat-b', ['Book A']),
        false,
    );
    delete entry.STMB_chatId;
    assert.equal(
        isRegenerationSourceChatCurrent(entry, 'Book A', 'chat-b', ['Book B']),
        false,
    );
});
