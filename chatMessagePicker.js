// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import { fingerprintChatMessage, validateChatSelection } from './chatSelection.js';

/** Finds literal matches across the full chat, including explicitly filterable hidden messages. */
export function findPickerMessages(messages, query = '', hiddenOnly = false) {
    const term = String(query).trim().toLocaleLowerCase();
    return messages.flatMap((message, index) => message && (!hiddenOnly || message.is_system)
        && (!term || `${message.name || ''} ${message.mes || ''}`.toLocaleLowerCase().includes(term))
        ? [{ index, hash: fingerprintChatMessage(message), name: String(message.name || ''),
            text: String(message.mes || ''), hidden: Boolean(message.is_system) }] : []);
}

/** Centers a bounded preview on the first literal text match. */
export function getPickerPreview(text, query = '') {
    const value = String(text);
    const term = String(query).trim().toLocaleLowerCase();
    const match = term ? value.toLocaleLowerCase().indexOf(term) : -1;
    const start = match < 0 ? 0 : Math.max(0, match - 100);
    const end = Math.min(value.length, start + Math.max(300, term.length + 100));
    return `${start ? '…' : ''}${value.slice(start, end)}${end < value.length ? '…' : ''}`;
}

/** Highlights literal text without interpreting message content as HTML. */
function appendHighlightedText(container, text, query) {
    const term = String(query).trim();
    if (!term) { container.textContent = text; return; }
    const matcher = new RegExp(term.replace(/[\\^$.*+?()[\]{}|/]/g, '\\$&'), 'giu');
    let offset = 0;
    for (const match of text.matchAll(matcher)) {
        container.append(document.createTextNode(text.slice(offset, match.index)));
        const mark = document.createElement('mark');
        mark.textContent = match[0];
        container.append(mark);
        offset = match.index + match[0].length;
    }
    container.append(document.createTextNode(text.slice(offset)));
}

/** Opens a local Find/Extract picker while retaining source fingerprints across searches. */
export async function showChatMessagePicker({ Popup, popupType, affirmativeResult, tr, markPopup,
    getMessages, getChatKey, hasUnfinishedEdit, subscribeChatChanged, query = '', initialSelection = null, acceptLabel }) {
    const node = (tag, text = '', className = '') => {
        const element = document.createElement(tag);
        element.textContent = text;
        element.className = className;
        return element;
    };
    const button = (label, action) => {
        const element = node('button', label, 'menu_button');
        element.type = 'button';
        element.addEventListener('click', action);
        return element;
    };
    const chatKey = getChatKey();
    const selected = new Map(initialSelection?.messages?.map(item => [item.index, { ...item }]) || []);
    const rows = new Map();
    let matches = [];
    let loaded = 0;
    let stale = false;
    let closed = false;
    let accepted = null;
    let timer = null;
    const content = node('div', '', 'stmb-extract-picker');
    const input = node('input', '', 'text_pole');
    input.type = 'search';
    input.value = query || initialSelection?.query || '';
    input.placeholder = tr('STMemoryBooks_Extract_Search', 'Find chat messages');
    input.setAttribute('aria-label', input.placeholder);
    const hidden = node('input');
    hidden.type = 'checkbox';
    hidden.checked = initialSelection?.hiddenOnly === true;
    const hiddenLabel = node('label', '', 'checkbox_label');
    hiddenLabel.append(hidden, node('span', tr('STMemoryBooks_Extract_HiddenOnly', 'Hidden only')));
    const status = node('p');
    status.setAttribute('role', 'status');
    const selectionStatus = node('p');
    selectionStatus.setAttribute('role', 'status');
    const results = node('div', '', 'stmb-extract-results');
    const selection = () => ({ chatKey, query: input.value.trim(), hiddenOnly: hidden.checked,
        messages: [...selected.values()].sort((a, b) => a.index - b.index) });
    const isCurrent = () => !closed && getChatKey() === chatKey;
    const update = () => {
        const outside = [...selected.keys()].filter(index => !rows.has(index)).length;
        selectionStatus.textContent = tr('STMemoryBooks_Extract_SelectedCount', 'Selected messages: {{count}}', { count: selected.size })
            + (outside ? ` · ${tr('STMemoryBooks_Extract_OutsideCount', 'Outside displayed results: {{count}}', { count: outside })}` : '');
        accept.disabled = stale || !selected.size || !isCurrent();
        more.disabled = stale || loaded >= matches.length || !isCurrent();
        selectLoaded.disabled = stale || !rows.size || !isCurrent();
        clear.disabled = !selected.size;
        for (const row of rows.values()) row.checkbox.disabled = stale || !isCurrent();
        if (!stale) status.textContent = matches.length || rows.size
            ? tr('STMemoryBooks_Extract_LoadedCount', 'Displayed messages: {{count}} · Matching messages: {{total}}', { count: rows.size, total: matches.length })
            : tr('STMemoryBooks_Extract_NoMatches', 'No matching messages.');
    };
    const fail = (unfinished = false) => {
        stale = true;
        status.textContent = unfinished
            ? tr('STMemoryBooks_Extract_UnfinishedEdit', 'Finish or cancel the message edit, then refresh results.')
            : tr('STMemoryBooks_Extract_Stale', 'The chat or selected messages changed. Refresh results to clear the selection and search again.');
        update();
    };
    const valid = () => {
        if (!isCurrent()) { fail(); return false; }
        if (hasUnfinishedEdit()) { fail(true); return false; }
        if (selected.size && !validateChatSelection(selection(), getMessages(), chatKey)) { fail(); return false; }
        return !stale;
    };
    const addRow = message => {
        if (rows.has(message.index)) return;
        const messageIsCurrent = () => {
            if (!valid()) return false;
            if (fingerprintChatMessage(getMessages()[message.index]) !== message.hash) { fail(); return false; }
            return true;
        };
        const container = node('div', '', 'stmb-extract-result');
        const checkbox = node('input');
        checkbox.type = 'checkbox';
        checkbox.checked = selected.has(message.index);
        checkbox.setAttribute('aria-label', `${tr('STMemoryBooks_Extract_SelectMessage', 'Select message')} ${message.index}`);
        checkbox.addEventListener('change', () => {
            if (!messageIsCurrent()) {
                checkbox.checked = selected.has(message.index);
                return;
            }
            if (checkbox.checked) selected.set(message.index, { index: message.index, hash: message.hash });
            else selected.delete(message.index);
            update();
        });
        const details = node('details');
        const summary = node('summary');
        summary.append(node('strong', `#${message.index} · ${message.name}${message.hidden ? ` · ${tr('STMemoryBooks_Extract_Hidden', 'Hidden')}` : ''}`));
        const preview = node('span');
        appendHighlightedText(preview, getPickerPreview(message.text, input.value), input.value);
        summary.append(preview);
        const full = node('p', '', 'stmb-extract-text');
        let expanded = false;
        details.addEventListener('toggle', () => {
            if (details.open && messageIsCurrent() && !expanded) {
                appendHighlightedText(full, message.text, input.value);
                expanded = true;
            }
        });
        const neighbors = node('div', '', 'stmb-button-row');
        for (const [offset, key, label] of [[-1, 'Previous', 'Previous message'], [1, 'Next', 'Next message']]) {
            const adjacentIndex = message.index + offset;
            const adjacentButton = button(tr(`STMemoryBooks_Extract_${key}`, label), () => {
                if (!messageIsCurrent()) return;
                const adjacent = findPickerMessages(getMessages().slice(adjacentIndex, adjacentIndex + 1))[0];
                if (!adjacent) return;
                addRow({ ...adjacent, index: adjacentIndex });
                update();
            });
            adjacentButton.disabled = adjacentIndex < 0 || !getMessages()[adjacentIndex];
            neighbors.append(adjacentButton);
        }
        details.append(summary, full, neighbors);
        container.append(checkbox, details);
        rows.set(message.index, { message, container, checkbox });
        const following = [...rows.keys()].filter(index => index > message.index).sort((a, b) => a - b)[0];
        results.insertBefore(container, following === undefined ? null : rows.get(following).container);
    };
    const loadMore = () => {
        if (!valid()) return;
        for (const message of matches.slice(loaded, loaded + 50)) addRow(message);
        loaded = Math.min(matches.length, loaded + 50);
        update();
    };
    const search = () => {
        clearTimeout(timer);
        timer = null;
        if (!valid()) return;
        matches = findPickerMessages(getMessages(), input.value, hidden.checked);
        loaded = 0;
        rows.clear();
        results.replaceChildren();
        loadMore();
    };
    const searchButton = button(tr('STMemoryBooks_Extract_SearchButton', 'Search'), search);
    const more = button(tr('STMemoryBooks_Extract_LoadMore', 'Load more'), loadMore);
    const selectLoaded = button(tr('STMemoryBooks_Extract_SelectLoaded', 'Select loaded results'), () => {
        if (!valid()) return;
        if ([...rows.values()].some(({ message }) => fingerprintChatMessage(getMessages()[message.index]) !== message.hash)) { fail(); return; }
        for (const { message, checkbox } of rows.values()) {
            selected.set(message.index, { index: message.index, hash: message.hash });
            checkbox.checked = true;
        }
        update();
    });
    const clear = button(tr('STMemoryBooks_Extract_ClearSelection', 'Clear selection'), () => {
        selected.clear();
        for (const row of rows.values()) row.checkbox.checked = false;
        update();
    });
    const refresh = button(tr('STMemoryBooks_Extract_Refresh', 'Refresh results'), () => {
        selected.clear();
        stale = false;
        search();
    });
    const accept = button(acceptLabel, () => {
        clearTimeout(timer);
        if (!selected.size || !valid()) return;
        accepted = selection();
        void popup.completeAffirmative();
    });
    const scheduleSearch = () => {
        clearTimeout(timer);
        timer = setTimeout(search, 250);
    };
    input.addEventListener('input', scheduleSearch);
    input.addEventListener('keydown', event => {
        if (event.key === 'Enter') { event.preventDefault(); event.stopPropagation(); search(); }
    });
    hidden.addEventListener('change', search);
    const controls = node('div', '', 'stmb-button-row');
    controls.append(searchButton, selectLoaded, clear, more, refresh, accept);
    content.append(node('h3', tr('STMemoryBooks_Extract_Search', 'Find chat messages')), input,
        node('small', tr('STMemoryBooks_Extract_FullChat', 'Searches the full current chat, including hidden messages. Selections are kept across searches.')),
        hiddenLabel, controls, status, selectionStatus, results);
    let unsubscribe = () => {};
    const popup = new Popup(content, popupType, '', {
        okButton: false, cancelButton: tr('STMemoryBooks_Cancel', 'Cancel'), wider: true,
        allowVerticalScrolling: true, leftAlign: true,
        onOpen: () => {
            input.focus();
            if (initialSelection && !validateChatSelection(initialSelection, getMessages(), chatKey)) { fail(); return; }
            search();
        },
        onClosing: closingPopup => closingPopup.result !== affirmativeResult || Boolean(accepted) && valid(),
        onClose: () => { closed = true; clearTimeout(timer); unsubscribe(); },
    });
    markPopup(popup);
    unsubscribe = subscribeChatChanged(() => { accepted = null; void popup.completeCancelled(); });
    update();
    try {
        const result = await popup.show();
        return result === affirmativeResult ? accepted : null;
    } finally {
        closed = true;
        clearTimeout(timer);
        unsubscribe();
    }
}
