// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

/** Keeps response cast metadata alive until SillyTavern emits MESSAGE_RECEIVED. */
export function createNarratorGenerationState() {
    let pending = null;

    return {
        start({ castIds, type, chatKey, chat, dryRun = false, narratorMode = false }) {
            pending = null;
            if (!narratorMode || dryRun || ['quiet', 'impersonate'].includes(type)) return;
            const lastIndex = chat.length - 1;
            const lastMessage = chat[lastIndex];
            pending = {
                castIds: Object.freeze([...castIds]),
                type,
                chatKey,
                lastIndex,
                lastMessage,
                lastSwipe: lastMessage?.swipe_id,
                target: null,
            };
        },
        end({ processor, chat }) {
            if (!pending) return;
            if (!processor || !processor.isFinished || processor.isStopped || processor.abortController?.signal?.aborted) {
                pending = null;
                return;
            }
            const messageId = processor.messageId;
            const message = chat[messageId];
            if (!Number.isInteger(messageId) || messageId < 0 || !message || message.is_user || message.is_system) {
                pending = null;
                return;
            }
            pending.target = {
                messageId,
                message,
                swipeId: message.swipe_id,
                generationStarted: message.gen_started,
            };
        },
        receive({ messageId, type, chatKey, chat, narratorMode, processor }) {
            if (!pending || !narratorMode || pending.chatKey !== chatKey) return null;
            const message = chat[messageId];
            if (!message || message.is_user || message.is_system || messageId !== chat.length - 1) return null;
            if (type === 'first_message' || type === 'quiet' || type === 'impersonate') return null;
            if (processor && (!processor.isFinished || processor.isStopped || processor.abortController?.signal?.aborted)) return null;
            const target = pending.target;
            if (target) {
                if (target.messageId !== messageId || target.message !== message ||
                    target.swipeId !== message.swipe_id || target.generationStarted !== message.gen_started) return null;
            } else if (processor) {
                // Streaming responses must be bound at GENERATION_ENDED before they can be stamped.
                return null;
            } else if (messageId < pending.lastIndex ||
                (messageId === pending.lastIndex && message !== pending.lastMessage && pending.type !== 'regenerate') ||
                (messageId > pending.lastIndex + 1) ||
                (messageId === pending.lastIndex && type !== 'swipe' && type !== 'continue' && type !== 'append' && type !== 'appendFinal' && type !== 'regenerate') ||
                (messageId === pending.lastIndex && type === 'swipe' && message.swipe_id === pending.lastSwipe)) {
                return null;
            }
            const result = { castIds: [...pending.castIds], merge: type === 'continue' || pending.type === 'continue' };
            pending = null;
            return result;
        },
        clear() { pending = null; },
    };
}
