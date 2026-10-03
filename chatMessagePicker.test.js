// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { findPickerMessages, getPickerPreview, showChatMessagePicker } from './chatMessagePicker.js';
import { captureChatSelection } from './chatSelection.js';

test('search covers the full chat, literal text, speaker names, and hidden messages', () => {
    const messages = Array.from({ length: 120 }, (_, i) => ({ name: 'Bot', mes: `message ${i}` }));
    messages[110] = { name: 'Alice', mes: 'secret [a.*]', is_system: true };
    assert.equal(findPickerMessages(messages).length, 120);
    assert.deepEqual(findPickerMessages(messages, ' ALICE ').map(item => item.index), [110]);
    assert.deepEqual(findPickerMessages(messages, '[A.*]').map(item => item.index), [110]);
    assert.equal(findPickerMessages(messages, '[aZZ]').length, 0);
    assert.deepEqual(findPickerMessages(messages, '', true).map(item => item.index), [110]);
    assert.equal(findPickerMessages(messages, 'message', true).length, 0);
});

test('previews reveal late matches and keep original text intact', () => {
    const text = 'early '.repeat(100) + 'NEEDLE <img src=x>' + ' later'.repeat(100);
    const preview = getPickerPreview(text, 'needle');
    assert.ok(preview.startsWith('…'));
    assert.ok(preview.endsWith('…'));
    assert.ok(preview.includes('NEEDLE <img src=x>'));
    assert.equal(getPickerPreview('short text', 'speaker'), 'short text');
    assert.equal(getPickerPreview(text), text.slice(0, 300) + '…');
});

// Inject ST services into the actual compiler, following existing browser-module test patterns.
test('selected compilation includes exactly chosen hidden sources; ordinary ranges still skip them', () => {
    const source = readFileSync(new URL('./chatcompile.js', import.meta.url), 'utf8');
    const start = source.indexOf('function compileScene(');
    const end = start + /\n}\r?(?:\n|$)/.exec(source.slice(start)).index + 2;
    const chat = [{ name: 'User', mes: 'first' }, { name: 'Bot', mes: 'hidden', is_system: true }, { name: 'Bot', mes: 'third' }];
    const dependencies = {
        chat, cleanSpeakerName: name => name, cleanMessageContent: text => text,
        createGroupParticipantResolver: () => null, estimateTokens: () => 1,
        translate: fallback => fallback, MODULE_NAME: 'Test', name1: 'User', name2: 'Bot',
        getCurrentMemoryBooksContext: () => ({}),
    };
    const compile = Function(...Object.keys(dependencies), `return (${source.slice(start, end)});`)(...Object.values(dependencies));
    const request = { sceneStart: 0, sceneEnd: 2, chatId: 'chat', characterName: 'Bot' };
    assert.deepEqual(compile(request, { messageIndices: [1, 2], includeHiddenMessages: true }).messages.map(item => item.id), [1, 2]);
    assert.deepEqual(compile(request).messages.map(item => item.id), [0, 2]);
});

// Minimal DOM services keep the picker's interaction regressions runnable with node --test.
async function withPicker(options, run) {
    class Element {
        constructor(tag) { this.tag = tag; this.children = []; this.listeners = {}; this.textContent = ''; }
        append(...children) { this.children.push(...children); }
        insertBefore(child, following) {
            const index = this.children.indexOf(following);
            this.children.splice(index < 0 ? this.children.length : index, 0, child);
        }
        replaceChildren(...children) { this.children = children; }
        setAttribute() {}
        focus() {}
        addEventListener(type, handler) { this.listeners[type] = handler; }
        trigger(type) { this.listeners[type]?.({ preventDefault() {}, stopPropagation() {}, key: 'Enter' }); }
        find(predicate) {
            if (predicate(this)) return this;
            for (const child of this.children) { const found = child.find(predicate); if (found) return found; }
        }
    }
    const previousDocument = globalThis.document;
    globalThis.document = {
        createElement: tag => new Element(tag),
        createTextNode: text => Object.assign(new Element('text'), { textContent: text }),
    };
    let popup;
    let chatChanged;
    class Popup {
        constructor(content, _type, _value, config) { this.content = content; this.config = config; popup = this; }
        show() { return new Promise(resolve => { this.resolve = resolve; this.config.onOpen(); }); }
        complete(result) {
            this.result = result;
            if (this.config.onClosing(this)) { this.config.onClose(); this.resolve(result); }
        }
        completeAffirmative() { this.complete(1); }
        completeCancelled() { this.complete(null); }
    }
    const messages = [{ name: 'User', mes: 'apple' }, { name: 'Bot', mes: 'pear', is_system: true }, { name: 'Bot', mes: 'apple again' }];
    try {
        const pending = showChatMessagePicker({
            Popup, popupType: 1, affirmativeResult: 1,
            tr: (_key, fallback, params) => fallback.replace(/\{\{(\w+)\}\}/g, (_, key) => params?.[key] ?? ''),
            getMessages: () => messages, getChatKey: () => 'chat', hasUnfinishedEdit: () => false,
            markPopup: () => {}, acceptLabel: 'Continue',
            subscribeChatChanged: handler => { chatChanged = handler; return () => { chatChanged = null; }; },
            ...options,
        });
        const find = predicate => popup.content.find(predicate);
        const click = label => find(element => element.tag === 'button' && element.textContent === label).trigger('click');
        const select = index => {
            const row = find(element => element.className === 'stmb-extract-result'
                && element.children[1].children[0].children[0].textContent.startsWith(`#${index} ·`));
            row.children[0].checked = true;
            row.children[0].trigger('change');
        };
        const search = query => {
            const input = find(element => element.type === 'search');
            input.value = query;
            input.trigger('keydown');
        };
        await run({ find, click, select, search, messages, pending, cancel: () => popup.completeCancelled(),
            chatChanged: () => chatChanged(), hasListener: () => Boolean(chatChanged) });
    } finally { globalThis.document = previousDocument; }
}

test('picker retains selections across searches and filters, returns sorted hidden sources, and cleans up', async () => {
    await withPicker({}, async ({ find, click, select, search, pending, hasListener }) => {
        assert.equal(find(element => element.textContent === 'Continue').disabled, true);
        select(2);
        search('pear');
        assert.match(find(element => element.textContent.startsWith('Selected messages:')).textContent, /Outside displayed results: 1/);
        const hidden = find(element => element.tag === 'label').children[0];
        hidden.checked = true;
        hidden.trigger('change');
        select(1);
        click('Continue');
        const selection = await pending;
        assert.deepEqual(selection.messages.map(item => item.index), [1, 2]);
        assert.equal(selection.hiddenOnly, true);
        assert.equal(selection.query, 'pear');
        assert.equal(hasListener(), false);
    });
});

test('picker rejects changed and restored stale selections until explicit refresh; chat switches cancel', async () => {
    await withPicker({}, async ({ find, click, select, messages, chatChanged, pending }) => {
        select(0);
        messages[0].mes = 'changed';
        click('Continue');
        assert.equal(find(element => element.textContent === 'Continue').disabled, true);
        click('Refresh results');
        assert.equal(find(element => element.textContent.startsWith('Selected messages:')).textContent, 'Selected messages: 0');
        select(0);
        chatChanged();
        assert.equal(await pending, null);
    });
    const initialSelection = captureChatSelection([{ mes: 'old source' }], 'chat', [0]);
    await withPicker({ initialSelection }, async ({ find, click, cancel, pending }) => {
        assert.equal(find(element => element.textContent === 'Continue').disabled, true);
        click('Refresh results');
        assert.equal(find(element => element.textContent.startsWith('Selected messages:')).textContent, 'Selected messages: 0');
        cancel();
        assert.equal(await pending, null);
    });
});
