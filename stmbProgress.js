// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import { eventSource, event_types, getRequestHeaders, saveSettings, isChatSaving, isGenerating, selectCharacterById, openCharacterChat } from '../../../../script.js';
import { sha256 } from '../../../../lib.js';
import { extension_settings, getContext } from '../../../extensions.js';
import { Popup, POPUP_TYPE, POPUP_RESULT } from '../../../popup.js';
import { executeSlashCommands } from '../../../slash-commands.js';
import { openGroupById, openGroupChat } from '../../../group-chats.js';
import { escapeHtml } from '../../../utils.js';
import { tr } from './i18nHelpers.js';
import { createPendingProgressController, progressFingerprint, progressSourceMessages } from './pendingProgress.js';

let hooks = null;
let loaded = null;
let timer = null;
let visit = 0;
let promptedVisit = -1;
let activePopup = null;
let recovery = null;
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
            toastr.info(text('Deferred', 'Memory saved. Progress for “{{chat}}” is pending. Safe updates apply when the chat is open and idle. Click to review.', { chat: chatRef.fileName || chatRef.chatId }), 'STMemoryBooks', {
                onclick: () => { void showPendingProgress(); },
            });
        }
        promptedVisit = -1;
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
    timer = setTimeout(async () => {
        const live = current();
        if (!live?.loaded || !hasPendingProgress(live.chatKey) || promptedVisit === visit) return;
        if (live.busy || recovery || activePopup || Popup.util.isPopupOpen()) { schedulePrompt(); return; }
        const attemptedVisit = visit;
        promptedVisit = visit;
        // Reuse the verified save path; never override edits or manual marker changes automatically.
        const ids = controller.list().filter(record => record.chatKey === live.chatKey && !controller.check(record)).map(record => record.id);
        if (ids.length) {
            recovery = controller.apply(ids);
            try {
                const result = await recovery;
                if (result.status === 'applied') hooks?.resolved?.(live.chatKey);
            } catch (error) {
                console.warn('STMB: Pending progress recovery failed', error);
            } finally { recovery = null; }
        }
        if (visit !== attemptedVisit || current()?.chatKey !== live.chatKey) { schedulePrompt(); return; }
        if (hasPendingProgress(live.chatKey)) void showPendingProgress(live.chatKey);
    }, 500);
}

async function reopenProgressChat(ref) {
    const before = current();
    if (!ref || before?.busy) return false;
    const key = hooks.getChatKey(ref);
    if (before?.loaded && before.chatKey === key) return true;
    // Core open functions can create an empty chat for a missing file. Check existence first.
    const saved = await readChat(ref);
    if (!Array.isArray(saved) || saved.length < 2 || !saved[0]?.chat_metadata) return false;
    if (current()?.busy || current()?.chatKey !== before?.chatKey || current()?.metadata !== before?.metadata) return false;
    const context = getContext();
    if (ref.type === 'character') {
        const id = context.characters.findIndex(character => character.avatar === ref.avatarUrl);
        if (id < 0 || !ref.fileName) return false;
        await selectCharacterById(id, { switchMenu: false });
        const selected = getContext();
        if (current()?.busy || selected.groupId || selected.characters[selected.characterId]?.avatar !== ref.avatarUrl) return false;
        if (hooks.getChatKey() !== key) await openCharacterChat(ref.fileName);
    } else if (ref.type === 'group') {
        const group = context.groups.find(group => String(group.id) === String(ref.groupId));
        const chatId = ref.chatId || ref.fileName;
        if (!group?.chats?.includes(chatId)) return false;
        if (String(context.groupId) !== String(group.id)) await openGroupById(group.id);
        if (current()?.busy || String(getContext().groupId) !== String(group.id)) return false;
        if (hooks.getChatKey() !== key) await openGroupChat(group.id, chatId);
    } else return false;
    return current()?.loaded && current()?.chatKey === key;
}

export function progressChatLoaded() {
    if (!hooks) return;
    const context = getContext();
    const chatKey = hooks.getChatKey();
    if (loaded?.chatKey !== chatKey || loaded?.metadata !== context.chatMetadata) visit++;
    loaded = { chatKey, metadata: context.chatMetadata };
    schedulePrompt();
}

export async function showPendingProgress(onlyChatKey = null, initialStatus = '') {
    if (recovery) { try { await recovery; } catch { /* Keep failed records available for review. */ } }
    if (activePopup) return;
    const records = controller.list().filter(record => !onlyChatKey || !record.chatKey || record.chatKey === onlyChatKey);
    if (records.some(record => !record.chatKey || record.chatKey === current()?.chatKey)) promptedVisit = visit;
    const content = document.createElement('div');
    const explanation = document.createElement('p');
    explanation.textContent = text('Explanation', 'The last-processed marker tracks which messages are already covered by saved memories, so the next memory starts in the right place and automatic thresholds count new messages. Safe pending updates are applied automatically when their chat is open and idle. Saved memories remain intact while an update is pending.');
    const status = document.createElement('p');
    status.setAttribute('role', 'status');
    status.textContent = initialStatus;
    const rows = document.createElement('div');
    content.append(explanation, status, rows);
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
                : result?.reason === 'cleanup'
                    ? text('CleanupError', 'The chat was updated, but pending-update cleanup could not be saved. Retry to finish.')
                    : result?.status === 'conflict'
                        ? text('Conflict', 'The chat or its last-processed marker changed. Keep the current marker and discard this pending update, or choose Later.')
                        : text('RetryError', 'Update still pending. Make sure this chat is loaded and idle, then retry.');
            if (result?.status === 'applied') {
                completedRow?.remove();
                changed();
                const resolvedKey = completedRow?.dataset.chatKey;
                hooks?.resolved?.(resolvedKey === '__invalid__' ? current()?.chatKey : resolvedKey);
                popup.cancelButton.textContent = text('Close', 'Close');
            }
        } catch {
            status.textContent = text('RetryError', 'Update still pending. Make sure this chat is loaded and idle, then retry.');
        } finally {
            busy = false;
            rows.querySelectorAll('button').forEach(button => button.disabled = button.dataset.conflict === 'true');
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
            : text('ReopenInfo', 'Reopen this chat to update its marker through message {{target}}. This switches your active chat.', { target }))}</p>`;
        const ids = group.map(record => record.id);
        if (!isCurrent && group[0].chatRef && ['character', 'group'].includes(group[0].chatRef.type)) {
            const reopen = document.createElement('button');
            reopen.className = 'menu_button';
            reopen.textContent = text('Reopen', 'Reopen chat and update marker');
            reopen.onclick = async () => {
                await run(async () => {
                    if (!await reopenProgressChat(group[0].chatRef)) return { status: 'pending' };
                    return controller.apply(ids);
                }, row);
                // Rebuild controls for the newly active chat, including explicit Apply if validation failed.
                if (current()?.chatKey === key && controller.list().length) {
                    await popup.completeCancelled();
                    await showPendingProgress(onlyChatKey, status.textContent);
                }
            };
            row.append(reopen);
        }
        if (isCurrent) {
            const apply = document.createElement('button');
            apply.className = 'menu_button';
            apply.textContent = tr('STMemoryBooks_Apply', 'Apply');
            apply.onclick = () => run(async () => {
                const deadline = Date.now() + 10000;
                while (current()?.busy) {
                    if (current()?.chatKey !== key || Date.now() >= deadline) return { status: 'pending' };
                    await new Promise(resolve => setTimeout(resolve, 250));
                }
                const live = current();
                if (!live?.loaded || live.chatKey !== key || !Number.isInteger(target) || target < 0) {
                    return { status: 'pending' };
                }
                await executeSlashCommands(`/stmb-set-highest ${target}`);
                const after = current();
                if (after?.chatKey !== key || after.metadata !== live.metadata
                    || after.metadata.STMemoryBooks?.highestMemoryProcessed !== Math.min(target, live.messages.length - 1)) {
                    return { status: 'pending' };
                }
                await controller.discard(ids);
                return { status: 'applied' };
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
