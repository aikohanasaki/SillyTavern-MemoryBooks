// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { createPendingProgressController, progressFingerprint, progressSourceMessages } from './pendingProgress.js';

class Element {
    constructor(tag) { this.tag = tag; this.children = []; this.dataset = {}; this.textContent = ''; }
    append(...children) { for (const child of children) child.parent = this; this.children.push(...children); }
    remove() { if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this); }
    setAttribute() {}
    querySelectorAll(tag) { return this.children.flatMap(child => [...(child.tag === tag ? [child] : []), ...child.querySelectorAll(tag)]); }
}

function adapter(type = 'character') {
    const handlers = new Map();
    const eventSource = {
        on(event, fn) { if (!handlers.has(event)) handlers.set(event, new Set()); handlers.get(event).add(fn); },
        removeListener(event, fn) { handlers.get(event)?.delete(fn); },
        async emit(event, ...args) { for (const fn of handlers.get(event) || []) await fn(...args); },
    };
    const timers = new Map();
    let nextTimer = 0;
    const state = {
        ref: type === 'group' ? { type, groupId: 'group', chatId: 'A', fileName: 'A' }
            : { type, avatarUrl: 'A.png', fileName: 'A' },
        metadata: { integrity: 'A', STMemoryBooks: {} },
        messages: [{ name: 'A', mes: 'hello', is_user: false, send_date: 1 }],
        settings: {}, durable: {}, requests: [], toasts: [], resolved: 0, popups: [], saved: 0,
        failSettings: false, failChat: false,
    };
    state.disk = [{ chat_metadata: structuredClone(state.metadata) }, ...structuredClone(state.messages)];
    class Popup {
        static util = { isPopupOpen: () => state.popups.some(popup => popup.open) };
        static show = { confirm: async () => 1 };
        constructor(content, type, value, options) {
            this.content = content; this.options = options; this.cancelButton = new Element('button');
            this.cancelButton.textContent = options.cancelButton; state.popups.push(this);
        }
        show() { this.open = true; return new Promise(resolve => this.resolve = resolve); }
        async close() { if (this.options.onClosing?.() === false) return; this.open = false; this.resolve?.(); }
    }
    const deps = {
        eventSource, event_types: { SETTINGS_UPDATED: 'settings', CHAT_RENAMED: 'rename', CHARACTER_RENAMED: 'character-rename' },
        getRequestHeaders: () => ({}), isChatSaving: false, isGenerating: () => false,
        extension_settings: { STMemoryBooks: state.settings },
        getContext: () => ({ chatMetadata: state.metadata, chat: state.messages, saveMetadata: async () => {
            state.saved++;
            if (!state.failChat) state.disk = [{ chat_metadata: structuredClone(state.metadata) }, ...structuredClone(state.messages)];
        } }),
        saveSettings: async () => {
            if (state.failSettings) return;
            state.durable = structuredClone(state.settings);
            await eventSource.emit('settings');
        },
        sha256: value => createHash('sha256').update(value).digest('hex'),
        Popup, POPUP_TYPE: { TEXT: 1 }, POPUP_RESULT: { AFFIRMATIVE: 1 },
        tr: (_, fallback, params = {}) => fallback.replace(/{{(\w+)}}/g, (_, key) => String(params[key])),
        escapeHtml: value => String(value),
        createPendingProgressController, progressFingerprint, progressSourceMessages,
        document: { getElementById: () => null, querySelector: () => null, createElement: tag => new Element(tag) },
        toastr: { info: text => state.toasts.push(text), error: text => state.toasts.push(text) },
        fetch: async (url, options) => {
            state.requests.push(url);
            return { ok: true, json: async () => url === '/api/settings/get'
                ? { settings: JSON.stringify({ extension_settings: { STMemoryBooks: state.durable } }) }
                : structuredClone(state.disk) };
        },
        setTimeout: (fn, delay) => { const id = ++nextTimer; timers.set(id, { fn, delay }); return id; },
        clearTimeout: id => timers.delete(id),
        structuredClone, AbortController, console,
    };
    const source = readFileSync(new URL('./stmbProgress.js', import.meta.url), 'utf8')
        .replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '');
    const api = vm.runInNewContext(`(function () { ${source}\nreturn { initializePendingProgress, captureProgressSource, buildProgressOrigin, updateProgress, progressChatLoaded, showPendingProgress, guardPendingProgress, hasPendingProgress, invalidatePendingProgress }; })()`, deps);
    const key = ref => `${ref.avatarUrl || ref.groupId}:${ref.fileName}`;
    api.initializePendingProgress({ getChatRef: () => state.ref, getChatKey: (ref = state.ref) => key(ref), resolved: () => state.resolved++ });
    const origin = api.buildProgressOrigin(api.captureProgressSource(), 0);
    const originalRef = structuredClone(state.ref);
    async function defer() {
        state.ref = { ...state.ref, fileName: 'B' };
        return api.updateProgress(originalRef, 0, { jobId: 'memory-1', origin });
    }
    async function tick(delay) {
        const ready = [...timers].filter(([, timer]) => timer.delay === delay);
        for (const [id, timer] of ready) { timers.delete(id); timer.fn(); }
        await new Promise(resolve => setImmediate(resolve));
    }
    return { state, api, origin, originalRef, defer, tick, deps, eventSource };
}

test('adapter defers without any chat save, prompts once on return, supports Later and manual reopen', async () => {
    const f = adapter();
    assert.equal((await f.defer()).status, 'pending');
    assert.equal(f.state.saved, 0);
    assert.deepEqual(f.state.requests, ['/api/settings/get']);
    assert.equal(f.api.guardPendingProgress(), false);
    f.state.ref = f.originalRef;
    f.api.progressChatLoaded();
    f.api.progressChatLoaded();
    await f.tick(500);
    assert.equal(f.state.popups.length, 1);
    assert.equal(f.api.guardPendingProgress(), true);
    await f.state.popups[0].close();
    f.api.progressChatLoaded();
    await f.tick(500);
    assert.equal(f.state.popups.length, 1);
    const showing = f.api.showPendingProgress();
    const popup = f.state.popups.at(-1);
    const apply = popup.content.querySelectorAll('button').find(button => button.textContent === 'Apply');
    const saving = apply.onclick();
    assert.equal(popup.content.children[0].textContent, 'Processing…');
    await saving;
    assert.equal(popup.content.children[0].textContent, 'Done.');
    assert.equal(f.api.hasPendingProgress(), false);
    assert.equal(f.state.saved, 1);
    assert.equal(f.state.resolved, 1);
    assert.equal(popup.content.querySelectorAll('button').some(button => button.textContent === 'Apply'), false);
    assert.equal(popup.content.querySelectorAll('button').length, 0);
    await popup.close(); await showing;
});

test('settings timeout retains the pending entry and explains refresh loss', async () => {
    const f = adapter();
    f.state.failSettings = true;
    const pending = f.defer();
    await new Promise(resolve => setImmediate(resolve));
    await f.tick(10000);
    assert.equal((await pending).status, 'persistence-error');
    f.state.ref = f.originalRef;
    assert.equal(f.api.hasPendingProgress(), true);
    assert.ok(f.state.toasts.some(message => message.includes('before refreshing')));
});

test('load identity prevents capture during switching; other popups postpone the automatic prompt', async () => {
    const f = adapter();
    await f.defer();
    assert.equal(f.api.captureProgressSource(), null);
    f.state.ref = f.originalRef;
    f.api.progressChatLoaded();
    f.state.popups.push({ open: true });
    await f.tick(500);
    assert.equal(f.state.popups.length, 1);
    f.state.popups[0].open = false;
    await f.tick(500);
    assert.equal(f.state.popups.length, 2);
    await f.state.popups[1].close();
});

test('manual reset disables application while still allowing explicit discard', async () => {
    const f = adapter();
    await f.defer();
    f.state.ref = f.originalRef;
    f.api.invalidatePendingProgress();
    await new Promise(resolve => setImmediate(resolve));
    const showing = f.api.showPendingProgress();
    const popup = f.state.popups.at(-1);
    assert.equal(popup.content.querySelectorAll('button').find(button => button.textContent === 'Apply').disabled, true);
    const discard = popup.content.querySelectorAll('button').find(button => button.textContent === 'Discard pending update');
    await discard.onclick();
    assert.equal(f.api.hasPendingProgress(), false);
    assert.equal(f.state.saved, 0);
    assert.equal(popup.content.querySelectorAll('button').includes(discard), false);
    assert.equal(popup.content.querySelectorAll('button').length, 0);
    await popup.close(); await showing;
});

test('group application waits for an existing save and verifies through the group read endpoint', async () => {
    const f = adapter('group');
    await f.defer();
    f.state.ref = f.originalRef;
    f.api.progressChatLoaded();
    const showing = f.api.showPendingProgress();
    const popup = f.state.popups.at(-1);
    f.deps.isChatSaving = true;
    const applying = popup.content.querySelectorAll('button').find(button => button.textContent === 'Apply').onclick();
    assert.equal(f.state.saved, 0);
    f.deps.isChatSaving = false;
    await f.tick(250);
    await applying;
    assert.equal(popup.content.children[0].textContent, 'Done.');
    assert.ok(f.state.requests.includes('/api/chats/group/get'));
    await popup.close(); await showing;
});

test('popup offers Apply and Discard; failed discard stays visible until confirmed saved', async () => {
    const f = adapter();
    await f.defer();
    f.state.ref = f.originalRef;
    const showing = f.api.showPendingProgress();
    const popup = f.state.popups.at(-1);
    const buttons = popup.content.querySelectorAll('button');
    assert.deepEqual(buttons.map(button => button.textContent), ['Apply', 'Discard pending update']);
    const discard = buttons.find(button => button.textContent === 'Discard pending update');
    assert.equal(f.api.hasPendingProgress(), true);
    assert.equal(f.state.saved, 0);
    f.state.failSettings = true;
    const discarding = discard.onclick();
    await new Promise(resolve => setImmediate(resolve));
    await f.tick(10000);
    await discarding;
    assert.equal(f.api.hasPendingProgress(), true);
    assert.equal(popup.content.querySelectorAll('button').includes(discard), true);
    assert.equal(discard.disabled, false);
    f.state.failSettings = false;
    await discard.onclick();
    assert.equal(f.api.hasPendingProgress(), false);
    assert.equal(popup.content.querySelectorAll('button').includes(discard), false);
    assert.equal(popup.content.querySelectorAll('button').length, 0);
    assert.equal(f.state.saved, 0);
    await popup.close(); await showing;
});
