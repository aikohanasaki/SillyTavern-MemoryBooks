import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { getChildRollbackUnhideRanges } from './memoryRollback.js';

const source = readFileSync(new URL('./index.js', import.meta.url), 'utf8');
const implementation = source.slice(source.indexOf('async function executeMemoryAutoRollback('),
    source.indexOf('\nasync function executeChildChatAutoRollback('));
const receiptKey = 'STMB_pendingChildRollbackUnhide';

function harness() {
    const state = {
        chat: 'child', commands: [], saves: [], stopAfter: null, switchOnSave: false,
        disk: { entries: { 1: { uid: 1, start: 10, end: 12 }, 2: { uid: 2, start: 33, end: 44 } } },
    };
    const context = vm.createContext({
        structuredClone, console, Number, Date, Map, Set,
        ROLLBACK_SCOPE_AFFECTED: 'affected',
        initializeSettings: () => ({ moduleSettings: {
            autoRollbackEnabled: true, autoRollbackDeleteLastMemory: state.deleteMemories !== false, refreshEditor: false,
        } }),
        getSceneMarkers: () => ({}), waitForMemoryRollbackIdle: async () => true,
        getStmbChatKey: () => state.chat, getMemoryRollbackChatId: () => state.chat,
        loadMemoryRollbackLorebooks: async () => [{ name: 'book', data: structuredClone(state.disk),
            originalData: structuredClone(state.disk), originalFingerprint: JSON.stringify(state.disk) }],
        // Model two selected disjoint ranges, including selection expansion.
        collectRollbackMemories: data => ({ selected: Object.values(data.entries).map(entry => ({ uid: String(entry.uid) })), ambiguous: [] }),
        validateAndExpandLinkedRollbackSelections: () => [], computeRollbackCheckpoint: () => null,
        collectConsolidationRollbackPlan: () => ({ parents: [], issues: [] }),
        confirmConsolidationRollback: async () => true, revalidateMemoryRollbackLorebooks: async () => {},
        getRangeFromMemoryEntry: entry => ({ start: entry.start, end: entry.end }),
        applyLorebookRollback: data => { data.entries = {}; },
        getLorebookDataFingerprint: JSON.stringify, getChildRollbackUnhideRanges,
        saveMemoryRollbackLorebooks: async states => {
            if (state.failCleanup && states.some(book => !book.data[receiptKey])) throw new Error('cleanup failed');
            for (const book of states) {
                assert.equal(book.originalFingerprint, JSON.stringify(state.disk));
                state.disk = structuredClone(book.data);
                state.saves.push(structuredClone(state.disk));
            }
            if (state.switchOnSave) state.chat = 'other';
        },
        executeSlashCommands: async command => {
            state.commands.push(command);
            if (state.stopAfter === state.commands.length) state.chat = 'other';
            if (state.failCommand) throw new Error('unhide failed');
        },
        chat_metadata: {}, saveMetadataForCurrentContext: () => {},
        eventSource: { emit: () => {} }, MEMORY_TIER_CACHE_REFRESH_EVENT: 'refresh',
        refreshMemoryBoundaryUi: () => {}, refreshPopupContent: async () => {},
        toastr: { success: () => {} }, tr: () => '',
    });
    vm.runInContext(implementation, context);
    state.run = () => context.executeMemoryAutoRollback({ chatKey: 'child', chatId: 'child', childBoundary: 37 });
    return state;
}

for (const interruption of ['before first command', 'between commands', 'command failure']) {
    test(`child rollback recovers after ${interruption} with Memories already deleted`, async () => {
        const state = harness();
        state.switchOnSave = interruption === 'before first command';
        state.stopAfter = interruption === 'between commands' ? 1 : null;
        state.failCommand = interruption === 'command failure';
        if (state.failCommand) await assert.rejects(state.run(), /unhide failed/);
        else await state.run();
        assert.deepEqual(state.disk.entries, {});
        assert.deepEqual(state.disk[receiptKey].ranges, [{ start: 10, end: 12 }, { start: 33, end: 36 }]);
        assert.equal(state.saves.length, 1);

        state.chat = 'child';
        state.switchOnSave = false;
        state.stopAfter = null;
        state.failCommand = false;
        state.commands = [];
        await state.run();
        assert.deepEqual(state.commands, ['/unhide 10-12', '/unhide 33-36']);
        assert.equal(state.disk[receiptKey], undefined);
    });
}

test('child rollback never replays a receipt belonging to another chat', async () => {
    const state = harness();
    state.disk = { entries: {}, [receiptKey]: { version: 1, chatId: 'parent', ranges: [{ start: 0, end: 9 }] } };
    await state.run();
    assert.deepEqual(state.commands, []);
    assert.equal(state.disk[receiptKey].chatId, 'parent');
});

test('failed receipt cleanup remains retryable even if Memory deletion is subsequently disabled', async () => {
    const state = harness();
    state.failCleanup = true;
    await assert.rejects(state.run(), /cleanup failed/);
    assert.deepEqual(state.commands, ['/unhide 10-12', '/unhide 33-36']);
    assert.ok(state.disk[receiptKey]);
    state.failCleanup = false;
    state.deleteMemories = false;
    state.commands = [];
    await state.run();
    assert.deepEqual(state.commands, ['/unhide 10-12', '/unhide 33-36']);
    assert.equal(state.disk[receiptKey], undefined);
});
