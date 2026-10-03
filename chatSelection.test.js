// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import test from 'node:test';
import { captureChatSelection, validateChatSelection } from './chatSelection.js';

test('captures noncontiguous visible messages and detects edits or chat switches', () => {
    const messages = [
        { name: 'User', mes: 'first', is_user: true },
        { name: 'System', mes: 'hidden', is_system: true },
        { name: 'Bot', mes: 'third', is_user: false },
    ];
    const selection = captureChatSelection(messages, 'chat-a', [2, 0], 'topic');
    assert.deepEqual(selection.messages.map(item => item.index), [0, 2]);
    assert.equal(validateChatSelection(selection, messages, 'chat-a'), true);
    assert.equal(validateChatSelection(selection, messages, 'chat-b'), false);
    messages[2].mes = 'edited';
    assert.equal(validateChatSelection(selection, messages, 'chat-a'), false);
    const hidden = captureChatSelection(messages, 'chat-a', [1]);
    assert.equal(validateChatSelection(hidden, messages, 'chat-a'), true);
    messages[1].is_system = false;
    assert.equal(validateChatSelection(hidden, messages, 'chat-a'), false);
});

test('selection fingerprints reject deleted, shifted, or changed swipe sources', () => {
    const messages = [{ mes: 'first' }, { mes: 'second' }, { mes: 'third' }];
    const selection = captureChatSelection(messages, 'chat-a', [1, 2, 1]);
    assert.deepEqual(selection.messages.map(item => item.index), [1, 2]);
    assert.equal(validateChatSelection(selection, messages.slice(0, 2), 'chat-a'), false);
    assert.equal(validateChatSelection(selection, [{ mes: 'inserted' }, ...messages], 'chat-a'), false);
    assert.equal(validateChatSelection(selection, [messages[0], { mes: 'other swipe' }, messages[2]], 'chat-a'), false);
    assert.throws(() => captureChatSelection(messages, 'chat-a', []));
});
