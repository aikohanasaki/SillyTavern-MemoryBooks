// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import { stableHashString } from './clipReviewPolicy.js';

export function fingerprintChatMessage(message) {
    return stableHashString(JSON.stringify({
        name: message?.name ?? '', mes: message?.mes ?? '',
        send_date: message?.send_date ?? '', is_user: message?.is_user ?? null,
        is_system: message?.is_system ?? null, original_avatar: message?.original_avatar ?? '',
    }));
}

export function captureChatSelection(messages, chatKey, indices, query = '') {
    const selected = [...new Set(indices)].sort((a, b) => a - b);
    if (!chatKey || selected.length === 0 || selected.some(index => !Number.isInteger(index) || index < 0 || !messages[index] || messages[index].is_system)) {
        throw new Error('Selected messages are unavailable');
    }
    return {
        chatKey, query: String(query || '').trim(),
        messages: selected.map(index => ({ index, hash: fingerprintChatMessage(messages[index]) })),
    };
}

export function validateChatSelection(selection, messages, chatKey) {
    if (!selection || selection.chatKey !== chatKey || !Array.isArray(selection.messages) || selection.messages.length === 0) return false;
    const indices = selection.messages.map(item => item.index);
    if (new Set(indices).size !== indices.length) return false;
    return selection.messages.every(item => Number.isInteger(item.index) && item.index >= 0
        && messages[item.index] && !messages[item.index].is_system
        && fingerprintChatMessage(messages[item.index]) === item.hash);
}
