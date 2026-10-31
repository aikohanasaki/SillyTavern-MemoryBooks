// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import { translate } from '../../../i18n.js';
import { createViewSort } from './viewSortPolicy.js';
export { createViewSort } from './viewSortPolicy.js';

function sortStateLabel(state, field) {
    return state.field === field
        ? state.direction === 1
            ? translate('ascending', 'STMemoryBooks_SortAscending')
            : translate('descending', 'STMemoryBooks_SortDescending')
        : translate('unsorted', 'STMemoryBooks_SortUnsorted');
}

const popupSorts = new WeakMap();
export function getPopupSort(popup, name = 'default') {
    let sorts = popupSorts.get(popup);
    if (!sorts) { sorts = new Map(); popupSorts.set(popup, sorts); }
    if (!sorts.has(name)) sorts.set(name, createViewSort());
    return sorts.get(name);
}

/** Attach table header controls. The caller owns the state and calls refresh after each render. */
export function bindTableSort(table, state, fields, refresh) {
    if (!table) return;
    table.querySelectorAll('thead th').forEach((heading, index) => {
        const field = fields[index];
        if (!field) return;
        const translationKey = heading.getAttribute('data-i18n');
        const fallback = heading.textContent.trim().replace(/\s*[↑↓↕]$/, '');
        const label = translationKey && !translationKey.startsWith('[')
            ? translate(fallback, translationKey) : fallback;
        // ST's i18n MutationObserver replaces the contents of newly mounted
        // data-i18n elements, which would remove the button when the popup opens.
        // Keep an attribute-only translation so the observer leaves children intact.
        if (translationKey && !translationKey.startsWith('[')) {
            heading.setAttribute('data-i18n', `[aria-label]${translationKey}`);
        }
        let button = heading.querySelector('.stmb-sort-button');
        if (!button) {
            heading.textContent = '';
            button = document.createElement('button');
            button.type = 'button';
            button.className = 'stmb-sort-button';
            heading.append(button);
        }
        button.textContent = `${label} ${state.field === field ? (state.direction === 1 ? '↑' : '↓') : '↕'}`;
        button.setAttribute('aria-label', `${label}: ${sortStateLabel(state, field)}`);
        heading.setAttribute('aria-sort', state.field === field ? (state.direction === 1 ? 'ascending' : 'descending') : 'none');
        button.onclick = () => { state.cycle(field); refresh(); };
    });
}

export function bindListSort(container, state, fields, refresh) {
    if (!container) return;
    const bar = document.createElement('div');
    bar.className = 'stmb-sort-bar';
    for (const [field, label] of Object.entries(fields)) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'menu_button stmb-sort-button';
        button.textContent = `${label} ${state.field === field ? (state.direction === 1 ? '↑' : '↓') : '↕'}`;
        button.setAttribute('aria-label', `${label}: ${sortStateLabel(state, field)}`);
        button.addEventListener('click', () => { state.cycle(field); refresh(); });
        bar.append(button);
    }
    container.before(bar);
}

/** Keep the source DOM order as the third-click restoration order. */
export function mountTableSort(table, state, fields, values) {
    if (!table) return;
    const body = table.tBodies[0];
    if (!body) return;
    const original = Array.from(body.rows);
    const render = () => {
        const ordered = state.order(original, Object.fromEntries(Object.entries(values).map(([key, read]) =>
            [key, row => read(row)])));
        body.append(...ordered);
        bindTableSort(table, state, fields, render);
    };
    render();
}

export function mountListSort(container, state, labels, values, rowSelector) {
    if (!container) return;
    container.previousElementSibling?.classList.contains('stmb-sort-bar') && container.previousElementSibling.remove();
    const original = Array.from(container.querySelectorAll(rowSelector));
    if (original.every(row => row.dataset.originalIndex !== undefined)) {
        original.sort((a, b) => Number(a.dataset.originalIndex) - Number(b.dataset.originalIndex));
    }
    const render = () => {
        const ordered = state.order(original.filter(row => row.parentElement === container), values);
        for (const row of ordered) container.append(row);
        const bar = container.previousElementSibling?.classList.contains('stmb-sort-bar')
            ? container.previousElementSibling : null;
        if (!bar) bindListSort(container, state, labels, render);
        else for (const [index, [field, label]] of Object.entries(labels).entries()) {
            const button = bar.children[index];
            button.textContent = `${label} ${state.field === field ? (state.direction === 1 ? '↑' : '↓') : '↕'}`;
            button.setAttribute('aria-label', `${label}: ${sortStateLabel(state, field)}`);
        }
    };
    render();
}
