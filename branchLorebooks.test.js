// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import test from 'node:test';
import {
    BRANCH_LOREBOOK_METADATA_KEY,
    BRANCH_LOREBOOK_METADATA_VERSION,
    applyBranchLorebookBindings,
    cloneLorebookForBranch,
    createBranchLorebookController,
    planBranchLorebookCopies,
    resolveActiveLorebookBindings,
    shouldCopyForChatChange,
} from './branchLorebooks.js';

function snapshot(overrides = {}) {
    return {
        chatId: 'Parent',
        mainChat: '',
        knownBranchNames: new Set(),
        copyEnabled: true,
        branchMarker: null,
        ...overrides,
    };
}

test('recognizes only a newly created native branch', () => {
    const previous = snapshot();
    assert.equal(shouldCopyForChatChange(previous, snapshot({
        chatId: 'Parent - Branch #1',
        mainChat: 'Parent',
    })), true);

    assert.equal(shouldCopyForChatChange(previous, snapshot({
        chatId: 'Parent - Checkpoint #1',
        mainChat: 'Parent',
    })), false);
    assert.equal(shouldCopyForChatChange(snapshot({
        knownBranchNames: new Set(['Parent - Branch #1']),
    }), snapshot({
        chatId: 'Parent - Branch #1',
        mainChat: 'Parent',
    })), false);
    assert.equal(shouldCopyForChatChange(previous, snapshot({
        chatId: 'Parent - Branch #1',
        mainChat: 'Parent',
        branchMarker: {
            version: BRANCH_LOREBOOK_METADATA_VERSION,
            status: 'completed',
            branchChatId: 'Parent - Branch #1',
        },
    })), false);
});

test('plans one shared branch number and reuses lineage roots', () => {
    const marker = {
        mappings: [
            { rootName: 'Group Book', sourceName: 'Group Book', copyName: 'Group Book Branch 1' },
            { rootName: 'Alice Book', sourceName: 'Alice Book', copyName: 'Alice Book Branch 1' },
        ],
    };
    const plan = planBranchLorebookCopies(
        ['Group Book Branch 1', 'Alice Book Branch 1'],
        marker,
        ['Group Book', 'Alice Book', 'Group Book Branch 1', 'Alice Book Branch 1', 'Alice Book Branch 2'],
    );
    assert.equal(plan.branchNumber, 3);
    assert.deepEqual(plan.mappings.map(item => item.copyName), [
        'Group Book Branch 3',
        'Alice Book Branch 3',
    ]);
});

test('deep-clones lorebooks and rewrites only branch-specific STMB links', () => {
    const source = {
        entries: {
            1: {
                uid: 1,
                STMB_chatId: 'Parent',
                STMB_canonicalLorebook: 'Group Book',
                STMB_canonicalEntryUid: 7,
                content: 'Memory',
            },
            2: { uid: 2, STMB_chatId: 'Another Chat', content: 'Other' },
        },
    };
    const copy = cloneLorebookForBranch(source, {
        parentChatId: 'Parent',
        branchChatId: 'Parent - Branch #1',
        copyNameBySource: new Map([['Group Book', 'Group Book Branch 1']]),
    });
    assert.notEqual(copy, source);
    assert.notEqual(copy.entries[1], source.entries[1]);
    assert.equal(copy.entries[1].STMB_chatId, 'Parent - Branch #1');
    assert.equal(copy.entries[1].STMB_canonicalLorebook, 'Group Book Branch 1');
    assert.equal(copy.entries[1].STMB_canonicalEntryUid, 7);
    assert.equal(copy.entries[2].STMB_chatId, 'Another Chat');
    assert.equal(source.entries[1].STMB_chatId, 'Parent');
});

test('treats a cancelled effective-lorebook resolution as unbound', () => {
    assert.equal(resolveActiveLorebookBindings({
        manualModeEnabled: true,
        manualLorebook: 'Stale Manual Book',
    }, null), null);
});

test('does not branch-copy a persistent solo character lock', () => {
    assert.equal(resolveActiveLorebookBindings({
        manualModeEnabled: true,
        isGroupChat: false,
        manualLorebook: 'Chat Manual Book',
        lockedLorebookName: 'Global Character Book',
    }, 'Global Character Book'), null);
});

test('copies narrator canonical and declared cast bindings without native group state', () => {
    const bindings = resolveActiveLorebookBindings({
        isNarratorMode: true,
        manualModeEnabled: false,
        chatBoundLorebook: 'Omniscient Book',
        narratorCharacterLorebooks: { alice: 'Alice Book', bob: 'Bob Book' },
    });
    assert.deepEqual(bindings, {
        mode: 'narrator',
        primaryMode: 'chat-bound',
        primary: 'Omniscient Book',
        characterBindings: { alice: 'Alice Book', bob: 'Bob Book' },
        preservedCharacterBindings: {},
        sourceNames: ['Omniscient Book', 'Alice Book', 'Bob Book'],
    });
    const metadata = {
        world_info: 'Omniscient Book',
        STMemoryBooks: {
            narratorMode: {
                members: [
                    { id: 'alice', lorebookName: 'Alice Book' },
                    { id: 'bob', lorebookName: 'Bob Book' },
                ],
            },
        },
    };
    applyBranchLorebookBindings(metadata, bindings, new Map([
        ['Omniscient Book', 'Omniscient Book Branch 1'],
        ['Alice Book', 'Alice Book Branch 1'],
        ['Bob Book', 'Bob Book Branch 1'],
    ]));
    assert.equal(metadata.world_info, 'Omniscient Book Branch 1');
    assert.deepEqual(metadata.STMemoryBooks.narratorMode.members.map(member => member.lorebookName), [
        'Alice Book Branch 1',
        'Bob Book Branch 1',
    ]);
    assert.equal(metadata.STMemoryBooks.manualCharacterLorebooks, undefined);
});

test('separates locked group locals from branch-copy sources', () => {
    assert.deepEqual(resolveActiveLorebookBindings({
        manualModeEnabled: true,
        isGroupChat: true,
        manualLorebook: 'Group Book',
        manualCharacterLorebooks: {
            alice: 'Global Alice Book',
            bob: 'Bob Local Book',
        },
        lockedCharacterBindingKeys: ['alice'],
    }), {
        mode: 'manual',
        primary: 'Group Book',
        characterBindings: { bob: 'Bob Local Book' },
        preservedCharacterBindings: { alice: 'Global Alice Book' },
        sourceNames: ['Group Book', 'Bob Local Book'],
    });
});

function createHarness({
    manualMode = false,
    isGroup = false,
    lockedLorebookName = '',
    lockedCharacterBindingKeys = [],
    parentMetadata,
    worlds,
    getEffectiveLorebookName = null,
    loadWorldInfo = null,
    updateWorldInfoList = null,
}) {
    let state = {
        chatId: 'Parent',
        metadata: structuredClone(parentMetadata),
        messages: [{ extra: { branches: [] } }],
    };
    let group = isGroup;
    let activeManualMode = manualMode;
    const books = new Map(Object.entries(worlds || {}).map(([name, data]) => [name, structuredClone(data)]));
    const notifications = [];
    let metadataSaveCount = 0;

    const controller = createBranchLorebookController({
        getCurrentChatId: () => state.chatId,
        getChatMessages: () => state.messages,
        getChatMetadata: () => state.metadata,
        getSettings: () => ({
            moduleSettings: {
                manualModeEnabled: activeManualMode,
                copyMemoryBooksOnBranch: true,
            },
        }),
        isGroupChat: () => group,
        getWorldNames: () => Array.from(books.keys()),
        loadWorldInfo: typeof loadWorldInfo === 'function'
            ? name => loadWorldInfo(name, state, books)
            : async name => books.get(name) || null,
        saveWorldInfo: async (name, data) => books.set(name, structuredClone(data)),
        updateWorldInfoList: typeof updateWorldInfoList === 'function'
            ? () => updateWorldInfoList(state, books)
            : async () => {},
        getEffectiveLorebookName: typeof getEffectiveLorebookName === 'function'
            ? () => getEffectiveLorebookName(state)
            : undefined,
        getLockedLorebookName: () => lockedLorebookName,
        getLockedCharacterBindingKeys: () => lockedCharacterBindingKeys,
        saveMetadata: async () => { metadataSaveCount++; },
        translate: fallback => fallback,
        notify: (level, message, options) => {
            const notification = { level, message, options, cleared: false };
            notifications.push(notification);
            return notification;
        },
        clearNotification: notification => {
            if (notification) notification.cleared = true;
        },
        logger: { info() {}, error() {} },
    });
    controller.initialize();

    return {
        controller,
        books,
        notifications,
        get state() { return state; },
        setBranch(metadata = {}) {
            const inheritedMetadata = structuredClone(state.metadata);
            state = {
                chatId: 'Parent - Branch #1',
                metadata: { ...inheritedMetadata, ...metadata, main_chat: 'Parent' },
                messages: [],
            };
            group = isGroup;
        },
        setManualMode(value) {
            activeManualMode = !!value;
        },
        switchChat(chatId, metadata = {}) {
            state = { chatId, metadata, messages: [] };
            group = false;
        },
        get metadataSaveCount() { return metadataSaveCount; },
    };
}

test('copies and binds a chat-bound Memory Book', async () => {
    const harness = createHarness({
        parentMetadata: { world_info: 'Memories' },
        worlds: {
            Memories: { entries: { 1: { uid: 1, STMB_chatId: 'Parent', content: 'Past' } } },
        },
    });
    harness.setBranch();

    assert.equal(await harness.controller.handleChatChanged('Parent - Branch #1'), true);
    assert.equal(harness.state.metadata.world_info, 'Memories Branch 1');
    assert.equal(harness.books.get('Memories Branch 1').entries[1].STMB_chatId, 'Parent - Branch #1');
    assert.equal(harness.state.metadata.STMemoryBooks[BRANCH_LOREBOOK_METADATA_KEY].status, 'completed');
    assert.equal(harness.metadataSaveCount, 1);
    assert.equal(harness.notifications.at(-1).level, 'success');
});

test('uses bindings inherited at branch time rather than a stale parent snapshot', async () => {
    const harness = createHarness({
        parentMetadata: { world_info: 'Chat Book', STMemoryBooks: {} },
        worlds: {
            'Chat Book': { entries: {} },
            'Manual Book': { entries: {} },
        },
    });
    harness.setManualMode(true);
    harness.state.metadata.STMemoryBooks.manualLorebook = 'Manual Book';
    harness.setBranch();

    await harness.controller.handleChatChanged('Parent - Branch #1');
    assert.equal(harness.state.metadata.world_info, 'Chat Book');
    assert.equal(harness.state.metadata.STMemoryBooks.manualLorebook, 'Manual Book Branch 1');
    assert.equal(harness.books.has('Chat Book Branch 1'), false);
});

test('leaves a persistent locked solo book untouched when branching', async () => {
    const harness = createHarness({
        manualMode: true,
        lockedLorebookName: 'Global Character Book',
        parentMetadata: { STMemoryBooks: { manualLorebook: 'Chat Manual Book' } },
        worlds: {
            'Global Character Book': { entries: {} },
            'Chat Manual Book': { entries: {} },
        },
        getEffectiveLorebookName: () => 'Global Character Book',
    });
    harness.setBranch();

    await harness.controller.handleChatChanged('Parent - Branch #1');
    assert.equal(harness.books.has('Global Character Book Branch 1'), false);
    assert.equal(harness.books.has('Chat Manual Book Branch 1'), false);
    assert.equal(harness.state.metadata.STMemoryBooks.manualLorebook, 'Chat Manual Book');
    assert.equal(harness.notifications.at(-1).level, 'warning');
});

test('resolves the primary binding through the existing effective-lorebook helper', async () => {
    let resolutionCount = 0;
    const harness = createHarness({
        manualMode: true,
        parentMetadata: { world_info: 'Chat Book', STMemoryBooks: {} },
        worlds: {
            'Chat Book': { entries: {} },
            'Selected Manual Book': { entries: {} },
        },
        getEffectiveLorebookName: (state) => {
            resolutionCount++;
            state.metadata.STMemoryBooks.manualLorebook = 'Selected Manual Book';
            return 'Selected Manual Book';
        },
    });
    harness.setBranch();

    await harness.controller.handleChatChanged('Parent - Branch #1');
    assert.equal(resolutionCount, 1);
    assert.equal(harness.state.metadata.world_info, 'Chat Book');
    assert.equal(harness.state.metadata.STMemoryBooks.manualLorebook, 'Selected Manual Book Branch 1');
    assert.equal(harness.books.has('Chat Book Branch 1'), false);
});

test('clears inherited manual character bindings when none apply to the branch', async () => {
    const harness = createHarness({
        manualMode: true,
        parentMetadata: {
            STMemoryBooks: {
                manualLorebook: 'Manual Book',
                manualCharacterLorebooks: { alice: 'Alice Book' },
            },
        },
        worlds: {
            'Manual Book': { entries: {} },
            'Alice Book': { entries: {} },
        },
    });
    harness.setBranch();

    await harness.controller.handleChatChanged('Parent - Branch #1');
    const markers = harness.state.metadata.STMemoryBooks;
    assert.equal(markers.manualLorebook, 'Manual Book Branch 1');
    assert.deepEqual(markers.manualCharacterLorebooks, {});
    assert.equal(harness.books.has('Alice Book Branch 1'), false);
});

test('copies every unique manual group binding with one shared number', async () => {
    const parentMetadata = {
        STMemoryBooks: {
            manualLorebook: 'Group Book',
            manualCharacterLorebooks: {
                alice: 'Alice Book',
                bob: 'Alice Book',
            },
        },
    };
    const harness = createHarness({
        manualMode: true,
        isGroup: true,
        parentMetadata,
        worlds: {
            'Group Book': { entries: { 1: { uid: 1, STMB_chatId: 'Parent' } } },
            'Alice Book': {
                entries: {
                    2: {
                        uid: 2,
                        STMB_chatId: 'Parent',
                        STMB_canonicalLorebook: 'Group Book',
                    },
                },
            },
        },
    });
    harness.setBranch();

    await harness.controller.handleChatChanged('Parent - Branch #1');
    const markers = harness.state.metadata.STMemoryBooks;
    assert.equal(markers.manualLorebook, 'Group Book Branch 1');
    assert.deepEqual(markers.manualCharacterLorebooks, {
        alice: 'Alice Book Branch 1',
        bob: 'Alice Book Branch 1',
    });
    assert.equal(harness.books.get('Alice Book Branch 1').entries[2].STMB_canonicalLorebook, 'Group Book Branch 1');
    assert.equal(markers[BRANCH_LOREBOOK_METADATA_KEY].mappings.length, 2);
});

test('copies unlocked group bindings while preserving locked local fallbacks', async () => {
    const harness = createHarness({
        manualMode: true,
        isGroup: true,
        lockedCharacterBindingKeys: ['alice'],
        parentMetadata: {
            STMemoryBooks: {
                manualLorebook: 'Group Book',
                manualCharacterLorebooks: {
                    alice: 'Global Alice Book',
                    bob: 'Bob Local Book',
                },
            },
        },
        worlds: {
            'Group Book': { entries: {} },
            'Global Alice Book': { entries: {} },
            'Bob Local Book': { entries: {} },
        },
    });
    harness.setBranch();

    await harness.controller.handleChatChanged('Parent - Branch #1');
    assert.equal(harness.books.has('Global Alice Book Branch 1'), false);
    assert.equal(harness.books.has('Bob Local Book Branch 1'), true);
    assert.deepEqual(harness.state.metadata.STMemoryBooks.manualCharacterLorebooks, {
        alice: 'Global Alice Book',
        bob: 'Bob Local Book Branch 1',
    });
});

test('clears active child bindings when a required manual book cannot be loaded', async () => {
    const parentMetadata = {
        world_info: 'Unrelated Chat Book',
        STMemoryBooks: {
            manualLorebook: 'Group Book',
            manualCharacterLorebooks: { alice: 'Missing Alice Book' },
        },
    };
    const harness = createHarness({
        manualMode: true,
        isGroup: true,
        parentMetadata,
        worlds: { 'Group Book': { entries: {} } },
    });
    harness.setBranch();

    await harness.controller.handleChatChanged('Parent - Branch #1');
    assert.equal(harness.state.metadata.world_info, 'Unrelated Chat Book');
    assert.equal(harness.state.metadata.STMemoryBooks.manualLorebook, undefined);
    assert.deepEqual(harness.state.metadata.STMemoryBooks.manualCharacterLorebooks, {});
    assert.equal(harness.state.metadata.STMemoryBooks[BRANCH_LOREBOOK_METADATA_KEY].status, 'failed');
    assert.equal(harness.notifications.at(-1).level, 'error');
});

test('does not bind copied Memory Books when the active chat changes during refresh', async () => {
    let signalRefreshStarted;
    let resumeRefresh;
    const refreshStarted = new Promise(resolve => { signalRefreshStarted = resolve; });
    const refreshGate = new Promise(resolve => { resumeRefresh = resolve; });
    const otherMetadata = { world_info: 'Other Book' };
    const harness = createHarness({
        parentMetadata: { world_info: 'Memories' },
        worlds: { Memories: { entries: {} } },
        updateWorldInfoList: async () => {
            signalRefreshStarted();
            await refreshGate;
        },
    });
    harness.setBranch();
    const branchMetadata = harness.state.metadata;

    const processing = harness.controller.handleChatChanged('Parent - Branch #1');
    await refreshStarted;
    harness.switchChat('Other Chat', otherMetadata);
    resumeRefresh();
    await processing;

    assert.deepEqual(otherMetadata, { world_info: 'Other Book' });
    assert.equal(branchMetadata.world_info, 'Memories');
    assert.equal(branchMetadata.STMemoryBooks?.[BRANCH_LOREBOOK_METADATA_KEY], undefined);
    assert.equal(harness.metadataSaveCount, 0);
    assert.equal(harness.notifications.at(-1).level, 'warning');
    assert.match(harness.notifications.at(-1).message, /active chat changed/i);
    assert.equal(harness.controller.getPreviousSnapshot().chatId, 'Other Chat');
});

test('does not save failure state when the active chat changes during a failed load', async () => {
    let signalLoadStarted;
    let resumeLoad;
    const loadStarted = new Promise(resolve => { signalLoadStarted = resolve; });
    const loadGate = new Promise(resolve => { resumeLoad = resolve; });
    const otherMetadata = { world_info: 'Other Book' };
    const harness = createHarness({
        parentMetadata: { world_info: 'Memories' },
        worlds: { Memories: { entries: {} } },
        loadWorldInfo: async () => {
            signalLoadStarted();
            await loadGate;
            return null;
        },
    });
    harness.setBranch();

    const processing = harness.controller.handleChatChanged('Parent - Branch #1');
    await loadStarted;
    harness.switchChat('Other Chat', otherMetadata);
    resumeLoad();
    await processing;

    assert.deepEqual(otherMetadata, { world_info: 'Other Book' });
    assert.equal(harness.metadataSaveCount, 0);
    assert.equal(harness.notifications.at(-1).level, 'warning');
    assert.match(harness.notifications.at(-1).message, /active chat changed/i);
});
