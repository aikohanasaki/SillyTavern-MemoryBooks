// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createPendingProgressController, progressFingerprint, progressSourceMessages } from './pendingProgress.js';

// Exercise the browser adapter with the real progress controller and mocked ST services.
const source = readFileSync(new URL('./stmbProgress.js', import.meta.url), 'utf8')
    .replace(/^import .*;\r?$/gm, '').replace(/^export /gm, '');
const hash = value => createHash('sha256').update(value).digest('hex');
const clone = value => structuredClone(value);

function fixture(type = 'character') {
    const refA = type === 'character'
        ? { type, avatarUrl: 'A.png', fileName: 'A', characterId: 99 }
        : { type, groupId: 'g1', chatId: 'A', fileName: 'A' };
    const refB = { type: 'character', avatarUrl: 'B.png', fileName: 'B' };
    const key = ref => ref.type === 'group' ? `group:${ref.groupId}:${ref.chatId}` : `character:${ref.avatarUrl}:${ref.fileName}`;
    const makeChat = ref => ({ ref, metadata: { integrity: key(ref), STMemoryBooks: {} }, messages: [{ name: 'Bot', mes: 'hello', send_date: 1 }] });
    const a = makeChat(refA), b = makeChat(refB);
    const disk = new Map([[key(refA), clone(a)], [key(refB), clone(b)]]);
    const state = { live: clone(a), busy: false, edit: false, popups: [], calls: [], timers: new Map(), settingsFailure: false, resolved: [] };
    const settings = {};
    let nextTimer = 0, api;
    const listeners = new Map();
    const characters = [{ avatar: 'B.png' }, { avatar: 'A.png' }];
    const groups = [{ id: 'g1', chats: ['A', 'other'], chat_id: 'other' }];
    class Element {
        constructor(tag) { this.tag = tag; this.children = []; this.dataset = {}; this.textContent = ''; }
        append(...children) { for (const child of children) { child.parent = this; this.children.push(child); } }
        setAttribute() {}
        remove() { this.parent.children = this.parent.children.filter(child => child !== this); }
        querySelectorAll(tag) { return this.children.flatMap(child => [...(child.tag === tag ? [child] : []), ...child.querySelectorAll(tag)]); }
    }
    class Popup {
        static util = { isPopupOpen: () => state.popups.some(popup => !popup.closed) };
        static show = { confirm: async () => 1 };
        constructor(content, _type, _value, options) {
            this.content = content; this.options = options; this.cancelButton = new Element('button');
        }
        show() { state.popups.push(this); return new Promise(resolve => { this.resolve = resolve; }); }
        async completeCancelled() {
            if (this.options.onClosing()) { this.closed = true; this.resolve(); await Promise.resolve(); }
        }
    }
    function load(ref) {
        state.live = clone(disk.get(key(ref)) || makeChat(ref));
        api.progressChatLoaded();
    }
    const context = () => ({
        chat: state.live.messages, chatMetadata: state.live.metadata, characters, groups,
        characterId: characters.findIndex(character => character.avatar === state.live.ref.avatarUrl),
        groupId: state.live.ref.groupId,
        saveMetadata: async () => { state.calls.push('save'); disk.set(key(state.live.ref), clone(state.live)); },
    });
    const dependencies = {
        eventSource: { on: (event, listener) => listeners.set(event, listener), removeListener: event => listeners.delete(event) },
        event_types: { SETTINGS_UPDATED: 'saved', CHAT_RENAMED: 'renamed', CHARACTER_RENAMED: 'character-renamed' },
        getRequestHeaders: () => ({}),
        saveSettings: () => listeners.get('saved')?.(), isChatSaving: false, isGenerating: () => state.busy,
        selectCharacterById: async id => { state.calls.push(['character', id]); if (!state.refuseSwitch) load({ type: 'character', avatarUrl: characters[id].avatar, fileName: 'other' }); },
        openCharacterChat: async fileName => { state.calls.push(['chat', fileName]); load({ ...state.live.ref, fileName }); },
        openGroupById: async groupId => { state.calls.push(['group', groupId]); load({ type: 'group', groupId, chatId: 'other', fileName: 'other' }); },
        openGroupChat: async (groupId, chatId) => { state.calls.push(['group-chat', groupId, chatId]); load({ type: 'group', groupId, chatId, fileName: chatId }); },
        sha256: hash, extension_settings: { STMemoryBooks: settings }, getContext: context,
        Popup, POPUP_TYPE: { TEXT: 1 }, POPUP_RESULT: { AFFIRMATIVE: 1 },
        executeSlashCommands: async command => {
            state.calls.push(command);
            state.live.metadata.STMemoryBooks.highestMemoryProcessed = Number(command.split(' ')[1]);
        },
        escapeHtml: value => String(value),
        tr: (_key, fallback, params) => fallback.replace(/\{\{(\w+)\}\}/g, (_, key) => params?.[key] ?? ''),
        createPendingProgressController, progressFingerprint, progressSourceMessages,
        document: { getElementById: () => null, querySelector: () => state.edit, createElement: tag => new Element(tag) },
        toastr: { info() {}, error() {} },
        setTimeout: (callback, delay) => { state.timers.set(++nextTimer, { callback, delay }); return nextTimer; },
        clearTimeout: id => state.timers.delete(id),
        fetch: async (url, options) => {
            if (url === '/api/settings/get') return { ok: !state.settingsFailure, json: async () => ({ settings: JSON.stringify({ extension_settings: { STMemoryBooks: settings } }) }) };
            if (state.onRead) await state.onRead();
            const body = JSON.parse(options.body);
            const ref = url.includes('/group/') ? { type: 'group', groupId: 'g1', chatId: body.id }
                : { type: 'character', avatarUrl: body.avatar_url, fileName: body.file_name };
            const chat = disk.get(key(ref));
            return { ok: true, json: async () => chat ? [{ chat_metadata: clone(chat.metadata) }, ...clone(chat.messages)] : [] };
        },
    };
    api = Function(...Object.keys(dependencies), `${source}\nreturn { initializePendingProgress, progressChatLoaded, showPendingProgress, reopenProgressChat, controller };`)(...Object.values(dependencies));
    api.initializePendingProgress({ getChatRef: () => state.live.ref, getChatKey: (ref = state.live.ref) => key(ref), resolved: chatKey => state.resolved.push(chatKey) });
    settings.pendingProgress.records.job = {
        version: 1, id: 'job', chatRef: refA, chatKey: key(refA), end: 0,
        origin: { chatKey: key(refA), integrity: a.metadata.integrity, highest: null, revision: '', manuallySet: false, fingerprint: progressFingerprint(a.messages, 0, hash) },
    };
    async function tick() {
        const timer = [...state.timers].find(([, item]) => item.delay === 500);
        if (!timer) return false;
        state.timers.delete(timer[0]);
        await timer[1].callback();
        return true;
    }
    return { api, state, settings, refA, refB, key, disk, load, tick };
}

test('idle recovery verifies the saved marker and clears the gate without opening a popup', async () => {
    const f = fixture();
    f.state.busy = true;
    await f.tick();
    assert.equal(f.state.calls.length, 0);
    f.state.busy = false;
    await f.tick();
    assert.equal(f.disk.get(f.key(f.refA)).metadata.STMemoryBooks.highestMemoryProcessed, 0);
    assert.equal(f.api.controller.has(f.key(f.refA)), false);
    assert.equal(f.state.popups.length, 0);
    assert.deepEqual(f.state.resolved, [f.key(f.refA)]);
});

test('message editing delays recovery; changed source text requires review without an automatic override', async () => {
    const f = fixture();
    f.state.edit = true;
    await f.tick();
    assert.equal(f.state.popups.length, 0);
    f.state.edit = false;
    f.state.live.messages[0].mes = 'edited';
    await f.tick();
    assert.equal(f.state.calls.length, 0);
    assert.equal(f.state.popups.length, 1);
    assert.equal(f.api.controller.has(f.key(f.refA)), true);
    await f.state.popups[0].completeCancelled();
});

test('a failed cleanup remains pending and opens recovery controls', async () => {
    const f = fixture();
    f.state.settingsFailure = true;
    await f.tick();
    assert.equal(f.api.controller.has(f.key(f.refA)), true);
    assert.equal(f.state.popups.length, 1);
    await f.state.popups[0].completeCancelled();
});

for (const type of ['character', 'group']) {
    test(`${type}: reopening automatically recovers on chat load`, async () => {
        const f = fixture(type);
        f.load(f.refB);
        await f.tick();
        assert.equal(f.state.calls.length, 0);
        f.load(f.refA);
        await f.tick();
        assert.equal(f.api.controller.has(f.key(f.refA)), false);
        assert.equal(f.state.popups.length, 0);
    });

    test(`${type}: one button reopens the correct chat and applies its marker`, async () => {
        const f = fixture(type);
        f.load(f.refB);
        const shown = f.api.showPendingProgress();
        const popup = f.state.popups[0];
        assert.match(popup.content.children[0].textContent, /already covered by saved memories/);
        const button = popup.content.querySelectorAll('button').find(button => button.textContent === 'Reopen chat and update marker');
        await button.onclick();
        assert.equal(f.key(f.state.live.ref), f.key(f.refA));
        assert.equal(f.disk.get(f.key(f.refA)).metadata.STMemoryBooks.highestMemoryProcessed, 0);
        assert.equal(f.disk.get(f.key(f.refB)).metadata.STMemoryBooks.highestMemoryProcessed, undefined);
        assert.equal(f.api.controller.has(f.key(f.refA)), false);
        assert.deepEqual(f.state.calls[0], type === 'character' ? ['character', 1] : ['group', 'g1']);
        await popup.completeCancelled();
        await shown;
    });
}

test('missing chat, busy chat, refused selection, and navigation during lookup cannot update a marker', async () => {
    for (const scenario of ['missing', 'busy', 'refused', 'switched']) {
        const f = fixture();
        f.load(f.refB);
        if (scenario === 'missing') f.disk.delete(f.key(f.refA));
        if (scenario === 'busy') f.state.busy = true;
        if (scenario === 'refused') f.state.refuseSwitch = true;
        if (scenario === 'switched') f.state.onRead = () => { f.load(f.refA); };
        assert.equal(await f.api.reopenProgressChat(f.refA), false, scenario);
        assert.equal(f.state.calls.includes('save'), false, scenario);
        assert.equal(f.api.controller.has(f.key(f.refA)), true, scenario);
    }
});

test('switching chats during automatic verification never opens recovery for the old chat', async () => {
    const f = fixture();
    f.state.onRead = () => { f.load(f.refB); };
    await f.tick();
    assert.equal(f.state.popups.length, 0);
    assert.equal(f.api.controller.has(f.key(f.refA)), true);
    assert.equal(f.disk.get(f.key(f.refB)).metadata.STMemoryBooks.highestMemoryProcessed, undefined);
});

test('reopen conflict preserves the record and presents Apply in the newly active chat', async () => {
    const f = fixture();
    f.disk.get(f.key(f.refA)).messages[0].mes = 'edited since generation';
    f.load(f.refB);
    const shown = f.api.showPendingProgress();
    const popup = f.state.popups[0];
    const reopening = popup.content.querySelectorAll('button').find(button => button.textContent === 'Reopen chat and update marker').onclick();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(f.state.popups.length, 2);
    const review = f.state.popups[1];
    assert.equal(popup.closed, true);
    assert.match(review.content.children[1].textContent, /marker changed/);
    assert.ok(review.content.querySelectorAll('button').some(button => button.textContent === 'Apply'));
    assert.equal(f.state.calls.includes('save'), false);
    assert.equal(f.api.controller.has(f.key(f.refA)), true);
    await review.completeCancelled();
    await reopening;
    await shown;
});

test('switching to resolve one chat refreshes the reopen button for the previously active chat', async () => {
    const f = fixture();
    const record = clone(f.settings.pendingProgress.records.job);
    record.id = 'job-b'; record.chatRef = f.refB; record.chatKey = f.key(f.refB);
    record.origin.chatKey = f.key(f.refB); record.origin.integrity = f.key(f.refB);
    f.settings.pendingProgress.records['job-b'] = record;
    f.load(f.refB);
    const shown = f.api.showPendingProgress();
    const popup = f.state.popups[0];
    const reopening = popup.content.querySelectorAll('button').find(button => button.textContent === 'Reopen chat and update marker').onclick();
    await new Promise(resolve => setImmediate(resolve));
    const remaining = f.state.popups[1];
    assert.equal(f.api.controller.has(f.key(f.refA)), false);
    assert.equal(f.api.controller.has(f.key(f.refB)), true);
    const reopenB = remaining.content.querySelectorAll('button').find(button => button.textContent === 'Reopen chat and update marker');
    assert.ok(reopenB);
    await reopenB.onclick();
    assert.equal(f.key(f.state.live.ref), f.key(f.refB));
    assert.equal(f.api.controller.list().length, 0);
    await remaining.completeCancelled();
    await reopening;
    await shown;
});
