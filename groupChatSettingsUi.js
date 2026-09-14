// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

// Keep the wrapper interactive so disabled controls still have an accessible reason.
export function setGroupSettingDisabled(wrapper, disabled, reason) {
    if (!wrapper) return;
    const controls = wrapper.querySelectorAll('input, select, button, textarea');
    if (disabled) {
        if (!wrapper.hasAttribute('data-stmb-policy-disabled')) {
            wrapper.dataset.stmbPreviousTitle = wrapper.getAttribute('title') || '';
            wrapper.dataset.stmbPreviousTabindex = wrapper.getAttribute('tabindex') ?? '';
            wrapper.dataset.stmbPreviousOpacity = String(wrapper.classList.contains('opacity50p'));
            for (const control of controls) {
                control.dataset.stmbPreviousDisabled = String(control.disabled);
                control.dataset.stmbPreviousControlTitle = control.getAttribute('title') || '';
            }
        }
        wrapper.setAttribute('data-stmb-policy-disabled', 'true');
        wrapper.classList.add('opacity50p');
        wrapper.setAttribute('tabindex', '0');
        wrapper.setAttribute('aria-disabled', 'true');
        wrapper.setAttribute('title', reason);
        wrapper.setAttribute('aria-label', reason);
        for (const control of controls) {
            control.disabled = true;
            control.setAttribute('title', reason);
        }
    } else if (wrapper.hasAttribute('data-stmb-policy-disabled')) {
        for (const control of controls) {
            control.disabled = control.dataset.stmbPreviousDisabled === 'true';
            control.setAttribute('title', control.dataset.stmbPreviousControlTitle || '');
            delete control.dataset.stmbPreviousDisabled;
            delete control.dataset.stmbPreviousControlTitle;
        }
        wrapper.classList.toggle('opacity50p', wrapper.dataset.stmbPreviousOpacity === 'true');
        wrapper.setAttribute('title', wrapper.dataset.stmbPreviousTitle || '');
        if (wrapper.dataset.stmbPreviousTabindex === '') wrapper.removeAttribute('tabindex');
        else wrapper.setAttribute('tabindex', wrapper.dataset.stmbPreviousTabindex);
        wrapper.removeAttribute('aria-disabled');
        wrapper.removeAttribute('aria-label');
        wrapper.removeAttribute('data-stmb-policy-disabled');
        delete wrapper.dataset.stmbPreviousTitle;
        delete wrapper.dataset.stmbPreviousTabindex;
        delete wrapper.dataset.stmbPreviousOpacity;
    }
}
