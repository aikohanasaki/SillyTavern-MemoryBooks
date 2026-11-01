import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('./index.js', import.meta.url), 'utf8');
const loader = source.slice(source.indexOf('async function loadMemoryRollbackLorebooks('),
    source.indexOf('\nfunction describeRollbackMemory('));
const recovery = source.slice(source.indexOf('async function recoverDeletedMessageRollbackUnhide('),
    source.indexOf('\nasync function executeMemoryAutoRollback('));

function harness() {
    const state = { loads: [], warnings: [], replayed: [], toasts: [], chains: new Map(), enabled: true };
    const context = vm.createContext({
        initializeSettings: () => ({ moduleSettings: { autoRollbackEnabled: state.enabled } }),
        getCurrentChatLorebookNames: () => new Set(['deleted', 'failed', 'healthy']),
        loadWorldInfo: async name => {
            state.loads.push(name);
            if (name === 'deleted') return null;
            if (name === 'failed') throw new Error('load rejected');
            return { entries: {} };
        },
        deepClone: structuredClone, getLorebookDataFingerprint: JSON.stringify,
        tr: () => 'unavailable book', translate: text => text,
        console: { warn: (...args) => state.warnings.push(args), error: () => {} },
        getStmbChatKey: () => 'chat-a', getMemoryRollbackChatId: () => 'chat-a',
        replayDeletedMessageRollbackUnhide: async books => {
            state.replayed.push(...books.map(book => book.name));
            if (state.replayError) throw new Error('unsafe replay');
        },
        memoryRollbackChains: state.chains,
        toastr: { error: (...args) => state.toasts.push(args) },
    });
    vm.runInContext(loader + recovery, context);
    return { state, context };
}

test('chat-open recovery skips missing and rejected books and still replays healthy books', async () => {
    const { state, context } = harness();
    context.queueDeletedMessageRollbackUnhideRecovery('chat-a', 'chat-a');
    await state.chains.get('chat-a');
    assert.deepEqual(state.loads, ['deleted', 'failed', 'healthy']);
    assert.deepEqual(state.replayed, ['healthy']);
    assert.equal(state.warnings.length, 2);
    assert.deepEqual(state.toasts, []);
});

test('actual rollback loading stays strict for both missing and rejected books', async () => {
    const { state, context } = harness();
    await assert.rejects(context.loadMemoryRollbackLorebooks({}), /unavailable book/);
    await assert.rejects(context.loadMemoryRollbackLorebooks({}, ['failed']), /load rejected/);
    assert.deepEqual(state.warnings, []);
});

test('empty chat identities and disabled recovery do not load books or queue empty chats', async () => {
    const { state, context } = harness();
    for (const [key, id] of [['', 'chat-a'], ['chat-a', ''], [null, null]]) {
        context.queueDeletedMessageRollbackUnhideRecovery(key, id);
        await context.recoverDeletedMessageRollbackUnhide(key, id);
    }
    assert.equal(state.chains.size, 0);
    state.enabled = false;
    await context.recoverDeletedMessageRollbackUnhide('chat-a', 'chat-a');
    assert.deepEqual(state.loads, []);
});

test('recovery still surfaces replay failures', async () => {
    const { state, context } = harness();
    state.replayError = true;
    context.queueDeletedMessageRollbackUnhideRecovery('chat-a', 'chat-a');
    await assert.rejects(state.chains.get('chat-a'), /unsafe replay/);
    assert.equal(state.toasts.length, 1);
});
