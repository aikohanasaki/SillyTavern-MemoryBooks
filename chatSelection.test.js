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
    assert.throws(() => captureChatSelection(messages, 'chat-a', [1]));
});
