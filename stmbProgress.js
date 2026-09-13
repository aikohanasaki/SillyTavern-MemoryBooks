// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import { eventSource, event_types, getRequestHeaders, saveSettings, isChatSaving, isGenerating } from '../../../../script.js';
import { sha256 } from '../../../../lib.js';
import { extension_settings, getContext } from '../../../extensions.js';
import { Popup, POPUP_TYPE, POPUP_RESULT } from '../../../popup.js';
import { escapeHtml } from '../../../utils.js';
import { tr } from './i18nHelpers.js';
import { createPendingProgressController, progressFingerprint, progressSourceMessages } from './pendingProgress.js';

let hooks = null;
let loaded = null;
let timer = null;
let visit = 0;
let promptedVisit = -1;
let activePopup = null;
let initialized = false;
const notified = new Set();
const text = (name, fallback, params) => tr(`STMemoryBooks_Progress_${name}`, fallback, params);

function settings() {
    return extension_settings.STMemoryBooks ||= {};
}

function current() {
    if (!hooks) return null;
    const context = getContext();
    const chatRef = hooks.getChatRef();
    const chatKey = hooks.getChatKey(chatRef);
    const metadata = context.chatMetadata;
    return {
        chatKey, chatRef, metadata, messages: context.chat || [],
        loaded: !!loaded && loaded.chatKey === chatKey && loaded.metadata === metadata
            && !!metadata?.integrity && (context.chat?.length || 0) > 0,
        busy: isChatSaving || isGenerating() || !!document.querySelector('#chat .edit_textarea'),
    };
}

async function readJson(url, body, signal) {
    const response = await fetch(url, {
        method: 'POST', headers: getRequestHeaders(), cache: 'no-cache',
        body: JSON.stringify(body), signal,
    });
    if (!response.ok) throw new Error(`STMB progress request failed: ${response.status}`);
    return response.json();
}

async function persist(expected) {
    const controller = new AbortController();
    const deadline = setTimeout(() => controller.abort(), 10000);
    let listener;
    let rejectWait;
    const saved = new Promise((resolve, reject) => {
        rejectWait = reject;
        listener = resolve;
        eventSource.on(event_types.SETTINGS_UPDATED, listener);
        controller.signal.addEventListener('abort', () => reject(new Error('Settings confirmation timed out')), { once: true });
    });
    try {
        // saveSettings may schedule a later save or swallow an error; its return is not confirmation.
        void Promise.resolve(saveSettings()).catch(rejectWait);
        await saved;
        const response = await readJson('/api/settings/get', {}, controller.signal);
        const actual = JSON.parse(response.settings).extension_settings?.STMemoryBooks?.pendingProgress;
        if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error('Pending progress settings were not saved');
    } finally {
        clearTimeout(deadline);
        eventSource.removeListener(event_types.SETTINGS_UPDATED, listener);
    }
}

async function readChat(ref) {
    const controller = new AbortController();
    const deadline = setTimeout(() => controller.abort(), 10000);
    try {
        return ref.type === 'group'
            ? await readJson('/api/chats/group/get', { id: ref.chatId || ref.fileName, with_metadata: true }, controller.signal)
            : await readJson('/api/chats/get', { ch_name: ref.characterName || '', file_name: ref.fileName, avatar_url: ref.avatarUrl }, controller.signal);
    } finally { clearTimeout(deadline); }
}

function changed() {
    for (const key of notified) {
        if (!controller.has(key)) notified.delete(key);
    }
    const button = document.getElementById('stmb-pending-progress');
    if (button) button.textContent = pendingProgressLabel();
}

const controller = createPendingProgressController({
    settings, current, hash: sha256, persist, readChat, changed,
    saveCurrent: async expected => {
        const live = current();
        if (!live?.loaded || live.busy || live.chatKey !== expected.chatKey || live.metadata !== expected.metadata) {
            throw new Error('Chat changed before progress save');
        }
        let timeout;
        try {
            await Promise.race([
                getContext().saveMetadata(),
                new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('Progress save timed out')), 10000); }),
            ]);
        } finally { clearTimeout(timeout); }
    },
});

export function pendingProgressLabel() {
    return text('Title', 'Pending progress updates ({{count}})', { count: controller.list().length });
}

export function hasPendingProgress(chatKey = hooks?.getChatKey()) {
    return controller.has(chatKey);
}

export function guardPendingProgress(chatKey = hooks?.getChatKey()) {
    if (!hasPendingProgress(chatKey)) return false;
    toastr.info(text('Blocked', 'Resolve or discard the pending progress update for this chat before creating another memory.'), 'STMemoryBooks');
    return true;
}

export function captureProgressSource() {
    const live = current();
    if (!live?.loaded) return null;
    return structuredClone({
        chatKey: live.chatKey, integrity: live.metadata.integrity,
        revision: live.metadata.STMemoryBooks?.progressRevision || '',
        highest: Number.isFinite(live.metadata.STMemoryBooks?.highestMemoryProcessed) ? live.metadata.STMemoryBooks.highestMemoryProcessed : null,
        manuallySet: live.metadata.STMemoryBooks?.highestMemoryProcessedManuallySet === true,
        messages: progressSourceMessages(live.messages),
    });
}

export function buildProgressOrigin(source, end) {
    if (!source) return null;
    const { messages, ...origin } = source;
    return { ...origin, fingerprint: progressFingerprint(messages, end, sha256) };
}

export function isProgressChatLoaded(chatRef) {
    const live = current();
    return !!live?.loaded && !live.busy && live.chatKey === hooks?.getChatKey(chatRef);
}

export async function updateProgress(chatRef, end, options = {}) {
    const chatKey = hooks.getChatKey(chatRef);
    const origin = options.origin || null;
    const record = {
        version: 1, id: options.operationId || options.jobId || `progress-${Date.now()}-${Math.random()}`,
        jobId: options.jobId || '', chatRef: structuredClone(chatRef), chatKey,
        end, origin, createdAt: Date.now(), invalidated: !origin || origin.chatKey !== chatKey,
    };
    let result;
    try { result = await controller.update(record); }
    catch { result = { status: 'persistence-error' }; }
    if (result.status !== 'applied') {
        if (result.status === 'persistence-error') {
            toastr.error(text('PersistenceError', 'Memory saved, but its pending progress update could not be saved to settings. Retry before refreshing or the update may be lost.'), 'STMemoryBooks');
        } else if (!notified.has(chatKey)) {
            notified.add(chatKey);
            toastr.info(text('Deferred', 'Memory saved. Reopen “{{chat}}” to finish updating its last-processed marker.', { chat: chatRef.fileName || chatRef.chatId }), 'STMemoryBooks');
        }
        schedulePrompt();
    }
    return result;
}

export function invalidatePendingProgress() {
    const live = current();
    if (!live?.metadata) return;
    const markers = live.metadata.STMemoryBooks ||= {};
    markers.progressRevision = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    if (!hasPendingProgress(live.chatKey)) return;
    void controller.invalidate(live.chatKey).catch(() => {
        toastr.error(text('PersistenceError', 'Memory saved, but its pending progress update could not be saved to settings. Retry before refreshing or the update may be lost.'), 'STMemoryBooks');
    });
}

function schedulePrompt() {
    clearTimeout(timer);
    timer = setTimeout(() => {
        const live = current();
        if (!live?.loaded || !hasPendingProgress(live.chatKey) || promptedVisit === visit) return;
        if (live.busy || Popup.util.isPopupOpen()) { schedulePrompt(); return; }
        promptedVisit = visit;
        void showPendingProgress(live.chatKey);
    }, 500);
}

export function progressChatLoaded() {
    if (!hooks) return;
    const context = getContext();
    const chatKey = hooks.getChatKey();
    if (loaded?.chatKey !== chatKey || loaded?.metadata !== context.chatMetadata) visit++;
    loaded = { chatKey, metadata: context.chatMetadata };
    schedulePrompt();
}

export async function showPendingProgress(onlyChatKey = null) {
    if (activePopup) return;
    const records = controller.list().filter(record => !onlyChatKey || !record.chatKey || record.chatKey === onlyChatKey);
    if (records.some(record => !record.chatKey || record.chatKey === current()?.chatKey)) promptedVisit = visit;
    const content = document.createElement('div');
    const status = document.createElement('p');
    status.setAttribute('role', 'status');
    const rows = document.createElement('div');
    content.append(status, rows);
    let busy = false;
    const popup = new Popup(content, POPUP_TYPE.TEXT, '', {
        okButton: false, cancelButton: text('Later', 'Later'),
        onClosing: () => !busy,
    });
    activePopup = popup;
    const grouped = new Map();
    for (const record of records) {
        const key = record.chatKey || '__invalid__';
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key).push(record);
    }
    async function run(action, completedRow = null) {
        if (busy) return;
        busy = true;
        status.textContent = text('Processing', 'Processing…');
        rows.querySelectorAll('button').forEach(button => button.disabled = true);
        try {
            const result = await action();
            status.textContent = result?.status === 'applied'
                ? text('Done', 'Done.')
                : result?.status === 'settings-saved'
                    ? text('SettingsSaved', 'Pending updates saved to settings. Open the affected chat to finish updating its marker.')
                : result?.reason === 'cleanup'
                    ? text('CleanupError', 'The chat was updated, but pending-update cleanup could not be saved. Retry to finish.')
                    : result?.status === 'conflict'
                        ? text('Conflict', 'The chat or its last-processed marker changed. Keep the current marker and discard this pending update, or choose Later.')
                        : text('RetryError', 'Update still pending. Make sure this chat is loaded and idle, then retry.');
            if (result?.status === 'applied') {
                completedRow?.querySelectorAll('button').forEach(button => button.dataset.completed = 'true');
                changed();
                const resolvedKey = completedRow?.dataset.chatKey;
                hooks?.resolved?.(resolvedKey === '__invalid__' ? current()?.chatKey : resolvedKey);
                popup.cancelButton.textContent = text('Close', 'Close');
            }
        } catch {
            status.textContent = text('RetryError', 'Update still pending. Make sure this chat is loaded and idle, then retry.');
        } finally {
            busy = false;
            rows.querySelectorAll('button').forEach(button => button.disabled = button.dataset.conflict === 'true' || button.dataset.completed === 'true');
        }
    }
    for (const [key, group] of grouped) {
        const row = document.createElement('div');
        row.dataset.chatKey = key;
        const name = group[0].chatRef?.fileName || group[0].chatRef?.chatId || text('Unknown', 'Unrecognized pending update');
        const live = current();
        const isCurrent = key === live?.chatKey;
        const highest = live?.metadata?.STMemoryBooks?.highestMemoryProcessed;
        const target = Math.max(...group.map(record => Number.isInteger(record.end) ? record.end : -1));
        row.innerHTML = `<strong>${escapeHtml(name)}</strong><p>${escapeHtml(isCurrent
            ? text('Range', 'Current last-processed message: {{current}}. Pending progress through: {{target}}.', { current: Number.isFinite(highest) ? highest : '—', target })
            : text('OpenChat', 'Open this chat manually to apply its pending update.'))}</p>`;
        const ids = group.map(record => record.id);
        if (isCurrent) {
            const conflict = group.some(record => controller.check(record));
            if (conflict) {
                const explanation = document.createElement('p');
                explanation.textContent = text('Conflict', 'The chat or its last-processed marker changed. Keep the current marker and discard this pending update, or choose Later.');
                row.append(explanation);
            }
            const apply = document.createElement('button');
            apply.className = 'menu_button';
            apply.textContent = text('OK', 'OK');
            apply.disabled = conflict;
            apply.dataset.conflict = String(conflict);
            apply.onclick = () => run(async () => {
                const deadline = Date.now() + 10000;
                while (current()?.busy) {
                    if (current()?.chatKey !== key || Date.now() >= deadline) return { status: 'pending' };
                    await new Promise(resolve => setTimeout(resolve, 250));
                }
                return controller.apply(ids);
            }, row);
            row.append(apply);
        }
        const discard = document.createElement('button');
        discard.className = 'menu_button';
        discard.textContent = text('Discard', 'Discard pending update');
        discard.onclick = async () => {
            if (busy) return;
            const answer = await Popup.show.confirm(text('Discard', 'Discard pending update'),
                text('DiscardConfirm', 'Keep the current last-processed marker and discard this pending update? Saved lorebook memories will remain.'));
            if (answer === POPUP_RESULT.AFFIRMATIVE) {
                await run(async () => { await controller.discard(ids); return { status: 'applied' }; }, row);
            }
        };
        row.append(discard);
        rows.append(row);
    }
    if (!records.length) status.textContent = text('Empty', 'No pending progress updates.');
    const retry = document.createElement('button');
    retry.className = 'menu_button';
    retry.textContent = text('RetrySettings', 'Retry saving pending updates');
    retry.onclick = () => run(async () => { await controller.retryPersistence(); return { status: 'settings-saved' }; });
    if (records.length) rows.append(retry);
    try { await popup.show(); }
    finally { activePopup = null; }
}

export function initializePendingProgress(options) {
    hooks = options;
    controller.list();
    if (initialized) return;
    initialized = true;
    eventSource.on(event_types.CHAT_RENAMED, event => {
        const oldName = String(event.oldFileName || '').replace(/\.jsonl$/, '');
        const newName = String(event.newFileName || '').replace(/\.jsonl$/, '');
        if (!oldName || !newName) return;
        void controller.remap(ref => {
            if (ref.fileName !== oldName || (ref.type === 'group'
                ? String(ref.groupId) !== String(event.groupId)
                : ref.avatarUrl !== event.avatarId)) return null;
            const chatRef = { ...ref, fileName: newName, ...(ref.type === 'group' ? { chatId: newName } : {}) };
            return { chatRef, chatKey: hooks.getChatKey(chatRef) };
        }).then(progressChatLoaded).catch(console.warn);
    });
    eventSource.on(event_types.CHARACTER_RENAMED, (oldAvatar, newAvatar) => {
        void controller.remap(ref => {
            if (ref.type !== 'character' || ref.avatarUrl !== oldAvatar) return null;
            const chatRef = { ...ref, avatarUrl: newAvatar };
            return { chatRef, chatKey: hooks.getChatKey(chatRef) };
        }).then(progressChatLoaded).catch(console.warn);
    });
    progressChatLoaded();
}
