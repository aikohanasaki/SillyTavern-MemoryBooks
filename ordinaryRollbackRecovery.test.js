import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import {
    ROLLBACK_SCOPE_AFFECTED, ROLLBACK_SCOPE_FULL,
    applyLorebookRollback, collectRollbackMemories, computeRollbackCheckpoint,
    fingerprintRollbackChatPrefix, getChildRollbackUnhideRanges,
    getDeletedMessageRollbackUnhideRanges, isRollbackBaseMemory,
} from './memoryRollback.js';

const source = readFileSync(new URL('./index.js', import.meta.url), 'utf8');
const implementation = source.slice(source.indexOf('const pendingDeletedUnhideKey ='),
    source.indexOf('\nasync function executeChildChatAutoRollback('));
const receiptKey = 'STMB_pendingDeletedMessageRollbackUnhide';

function harness(ranges, deletion, { scope = ROLLBACK_SCOPE_AFFECTED } = {}) {
    const state = {
        chatId: 'chat-a', commands: [], saves: 0, scope, warnings: [],
        markers: { highestMemoryProcessed: 69, highestMemoryProcessedManuallySet: true },
        metadataSaves: [], invalidations: 0,
        messages: Array.from({ length: 70 }, (_, id) => ({ mes: `message ${id}`, is_system: true })),
        disk: { entries: Object.fromEntries(ranges.map(([start, end], index) => [index + 1, {
            uid: index + 1, stmemorybooks: true, STMB_chatId: 'chat-a', STMB_start: start, STMB_end: end,
        }])) },
    };
    state.messages.splice(deletion.start, deletion.count);
    const context = vm.createContext({
        structuredClone, console, Number, Date, Map, Set,
        ROLLBACK_SCOPE_AFFECTED, ROLLBACK_SCOPE_FULL,
        chat: state.messages,
        initializeSettings: () => ({ moduleSettings: {
            autoRollbackEnabled: true, autoRollbackDeleteLastMemory: state.deleteMemories !== false,
            autoRollbackUpdateLastProcessed: state.updateCheckpoint === true,
            refreshEditor: false,
        } }),
        getStmbChatKey: () => state.chatId, getMemoryRollbackChatId: () => state.chatId,
        getSceneMarkers: () => state.markers,
        waitForMemoryRollbackIdle: async () => true,
        loadMemoryRollbackLorebooks: async () => Object.entries({ book: state.disk, ...state.extraBooks })
            .map(([name, data]) => ({ name, data: structuredClone(data),
                originalData: structuredClone(data), originalFingerprint: JSON.stringify(data) })),
        collectRollbackMemories, computeRollbackCheckpoint,
        validateAndExpandLinkedRollbackSelections: () => [],
        chooseMiddleDeletionRollbackScope: async () => state.scope,
        collectConsolidationRollbackPlan: () => ({ parents: [], issues: [] }),
        confirmConsolidationRollback: async () => !state.cancel,
        revalidateMemoryRollbackLorebooks: async () => {},
        getRangeFromMemoryEntry: entry => ({ start: entry.STMB_start, end: entry.STMB_end }),
        applyLorebookRollback, isRollbackBaseMemory,
        getLorebookDataFingerprint: JSON.stringify,
        getChildRollbackUnhideRanges, getDeletedMessageRollbackUnhideRanges,
        fingerprintRollbackChatPrefix,
        saveMemoryRollbackLorebooks: async states => {
            if (state.failSave) throw new Error('save failed');
            if (state.failCleanup && states.some(book => !book.data[receiptKey])) throw new Error('cleanup failed');
            for (const book of states) {
                const disk = book.name === 'book' ? state.disk : state.extraBooks[book.name];
                assert.equal(book.originalFingerprint, JSON.stringify(disk));
                if (book.name === 'book') state.disk = structuredClone(book.data);
                else state.extraBooks[book.name] = structuredClone(book.data);
                state.saves++;
            }
            if (state.switchOnSave) state.chatId = 'other';
        },
        executeSlashCommands: async command => {
            if (state.failCommand) throw new Error('unhide failed');
            state.commands.push(command);
            const [, start, end] = /\/unhide (\d+)-(\d+)/.exec(command);
            for (let id = Number(start); id <= Number(end); id++) state.messages[id].is_system = false;
            if (state.switchOnCommand) state.chatId = 'other';
        },
        translate: text => text, chat_metadata: {},
        saveMetadataForCurrentContext: () => state.metadataSaves.push({ chatId: state.chatId, ...state.markers }),
        invalidatePendingProgress: () => { state.invalidations++; },
        eventSource: { emit: () => {} }, MEMORY_TIER_CACHE_REFRESH_EVENT: 'refresh',
        refreshMemoryBoundaryUi: () => {}, refreshPopupContent: async () => {},
        toastr: { success: () => {}, warning: (...args) => state.warnings.push(args) }, tr: () => '',
    });
    vm.runInContext(implementation, context);
    state.run = () => context.executeMemoryAutoRollback({ chatKey: 'chat-a', chatId: 'chat-a',
        deletion: { ...deletion, isTail: deletion.start + deletion.count === 70 } });
    state.recover = () => context.recoverDeletedMessageRollbackUnhide('chat-a', 'chat-a');
    return state;
}

for (const interruption of ['command failure', 'cleanup failure', 'chat switch']) {
    test(`checkpoint is saved before unhide ${interruption}`, async () => {
        const state = harness([[0, 30], [31, 60]], { start: 50, end: 69, count: 20 });
        state.updateCheckpoint = true;
        state.failCommand = interruption === 'command failure';
        state.failCleanup = interruption === 'cleanup failure';
        state.switchOnCommand = interruption === 'chat switch';
        if (state.failCommand || state.failCleanup) await assert.rejects(state.run(), /failed/);
        else await state.run();
        assert.equal(state.markers.highestMemoryProcessed, 30);
        assert.equal(state.markers.highestMemoryProcessedManuallySet, undefined);
        assert.deepEqual(state.metadataSaves, [{ chatId: 'chat-a', highestMemoryProcessed: 30 }]);
        assert.equal(state.invalidations, 1);
        assert.ok(state.disk[receiptKey]);
    });
}

test('checkpoint updates remain optional and follow a successful save in the original chat', async () => {
    for (const scenario of ['disabled', 'save failure', 'switch during save']) {
        const state = harness([[0, 30], [31, 60]], { start: 50, end: 69, count: 20 });
        state.updateCheckpoint = scenario !== 'disabled';
        state.failSave = scenario === 'save failure';
        state.switchOnSave = scenario === 'switch during save';
        if (state.failSave) await assert.rejects(state.run(), /save failed/);
        else await state.run();
        assert.equal(state.markers.highestMemoryProcessed, 69);
        assert.equal(state.markers.highestMemoryProcessedManuallySet, true);
        assert.deepEqual(state.metadataSaves, []);
        assert.equal(state.invalidations, 0);
    }
});

test('tail deletion restores the surviving messages of only the removed Memory', async () => {
    const state = harness([[0, 30], [31, 60]], { start: 50, end: 69, count: 20 });
    await state.run();
    assert.deepEqual(state.commands, ['/unhide 31-49']);
    assert.deepEqual(Object.keys(state.disk.entries), ['1']);
    assert.equal(state.disk[receiptKey], undefined);
});

test('middle deletion affected and full scopes restore the selected source ranges', async () => {
    for (const [scope, expected] of [
        [ROLLBACK_SCOPE_AFFECTED, ['/unhide 0-33']],
        [ROLLBACK_SCOPE_FULL, ['/unhide 0-42']],
    ]) {
        const state = harness([[0, 30], [31, 60], [61, 69]], { start: 24, end: 50, count: 27 }, { scope });
        await state.run();
        assert.deepEqual(state.commands, expected);
    }
});

test('failed unhide is retryable after the Memory was removed', async () => {
    const state = harness([[0, 30]], { start: 24, end: 69, count: 46 });
    state.failCommand = true;
    await assert.rejects(state.run(), /unhide failed/);
    assert.equal(Object.keys(state.disk.entries).length, 0);
    assert.ok(state.disk[receiptKey]);
    state.failCommand = false;
    state.messages.push({ mes: 'appended' });
    await state.recover();
    assert.deepEqual(state.commands, ['/unhide 0-23']);
    assert.equal(state.disk[receiptKey], undefined);
});

test('changed source messages discard unsafe replay and warn only once', async () => {
    const state = harness([[0, 30]], { start: 24, end: 69, count: 46 });
    state.switchOnSave = true;
    await state.run();
    state.chatId = 'chat-a';
    state.messages[0].mes = 'edited';
    await state.recover();
    await state.recover();
    assert.deepEqual(state.commands, []);
    assert.equal(state.disk[receiptKey], undefined);
    assert.equal(state.warnings.length, 1);
    assert.match(state.warnings[0][0], /changed since Memory rollback/);
    assert.ok(state.warnings[0][2].timeOut > 0);
});

test('unsafe recovery does not block Memory deletion or checkpoint updates', async () => {
    const state = harness([[0, 30], [31, 60]], { start: 50, end: 69, count: 20 });
    state.updateCheckpoint = true;
    state.disk[receiptKey] = { version: 1, chatId: 'chat-a', ranges: [{ start: 0, end: 10 }],
        prefixEnd: 10, fingerprint: 'stale' };
    await state.run();
    assert.deepEqual(Object.keys(state.disk.entries), ['1']);
    assert.equal(state.markers.highestMemoryProcessed, 30);
    assert.deepEqual(state.commands, ['/unhide 31-49']);
    assert.equal(state.disk[receiptKey], undefined);
    assert.equal(state.warnings.length, 1);
});

test('mixed records discard only unsafe records and replay valid records', async () => {
    const state = harness([], { start: 50, end: 69, count: 20 });
    state.disk[receiptKey] = { version: 1, chatId: 'chat-a', ranges: [{ start: 0, end: 10 }],
        prefixEnd: 10, fingerprint: 'stale' };
    state.extraBooks = { valid: { entries: {}, [receiptKey]: { version: 1, chatId: 'chat-a',
        ranges: [{ start: 20, end: 30 }], prefixEnd: 30,
        fingerprint: await fingerprintRollbackChatPrefix(state.messages, 30) } } };
    await state.recover();
    assert.deepEqual(state.commands, ['/unhide 20-30']);
    assert.equal(state.disk[receiptKey], undefined);
    assert.equal(state.extraBooks.valid[receiptKey], undefined);
    assert.equal(state.warnings.length, 1);
});

test('unsafe record cleanup failure is surfaced and preserves the record', async () => {
    const state = harness([], { start: 50, end: 69, count: 20 });
    state.disk[receiptKey] = { version: 1, chatId: 'chat-a', ranges: 'malformed' };
    state.failCleanup = true;
    await assert.rejects(state.recover(), /cleanup failed/);
    assert.ok(state.disk[receiptKey]);
    assert.deepEqual(state.commands, []);
    state.failCleanup = false;
    await state.recover();
    assert.equal(state.disk[receiptKey], undefined);
});

test('cleanup failure and chat switch leave the saved ranges retryable', async () => {
    for (const interruption of ['cleanup', 'switch']) {
        const state = harness([[10, 12], [30, 40]], { start: 35, end: 69, count: 35 });
        if (interruption === 'cleanup') state.failCleanup = true;
        else state.switchOnCommand = true;
        if (interruption === 'cleanup') await assert.rejects(state.run(), /cleanup failed/);
        else await state.run();
        assert.ok(state.disk[receiptKey]);
        state.chatId = 'chat-a';
        state.failCleanup = false;
        state.switchOnCommand = false;
        state.commands = [];
        await state.recover();
        assert.deepEqual(state.commands, ['/unhide 30-34']);
        assert.equal(state.disk[receiptKey], undefined);
    }
});

test('marker-only rollback and entire source deletion do not issue unhide', async () => {
    const markerOnly = harness([[0, 30]], { start: 24, end: 69, count: 46 });
    markerOnly.deleteMemories = false;
    await markerOnly.run();
    assert.deepEqual(markerOnly.commands, []);
    const allDeleted = harness([[24, 40]], { start: 24, end: 69, count: 46 });
    await allDeleted.run();
    assert.deepEqual(allDeleted.commands, []);
    const noAffectedMemory = harness([[0, 10]], { start: 60, end: 69, count: 10 });
    await noAffectedMemory.run();
    assert.deepEqual(noAffectedMemory.commands, []);
});

test('duplicate linked source ranges unhide only once', async () => {
    const state = harness([[0, 30], [0, 30]], { start: 24, end: 69, count: 46 });
    await state.run();
    assert.deepEqual(state.commands, ['/unhide 0-23']);
});

test('canceled rollback and failed saves never unhide', async () => {
    const canceled = harness([[0, 30]], { start: 24, end: 50, count: 27 });
    canceled.cancel = true;
    await canceled.run();
    assert.deepEqual(canceled.commands, []);
    const failed = harness([[0, 30]], { start: 24, end: 69, count: 46 });
    failed.failSave = true;
    await assert.rejects(failed.run(), /save failed/);
    assert.deepEqual(failed.commands, []);
});
