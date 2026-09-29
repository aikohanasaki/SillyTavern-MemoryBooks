// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

export const MEMORY_REMINDER_DEFAULTS = Object.freeze({
    automaticMemoryReminders: false,
    manualMemoryReminders: false,
    automaticMemoryReminderInterval: 10,
    manualMemoryReminderInterval: 50,
});

export function normalizeReminderInterval(value, fallback) {
    const number = Number(value);
    return Number.isSafeInteger(number) && number > 0 ? number : fallback;
}

/** Synchronous controller: never retains chat metadata across asynchronous work. */
export function createMemoryReminderController({ current, save, show, clear }) {
    let visible = null;
    let visibleKey = null;
    function dismiss() {
        const toast = visible;
        visible = null;
        visibleKey = null;
        if (toast) clear(toast);
    }
    function check({ notify = false } = {}) {
        const context = current();
        if (!context?.chatKey || !context.markers) { dismiss(); return; }
        const { settings, markers, count, chatKey, busy } = context;
        const mode = settings.autoSummaryEnabled ? 'automatic' : 'manual';
        const enabled = settings[`${mode}MemoryReminders`] === true;
        const intervalKey = `${mode}MemoryReminderInterval`;
        const interval = normalizeReminderInterval(settings[intervalKey], MEMORY_REMINDER_DEFAULTS[intervalKey]);
        const baseline = Number.isFinite(markers.highestMemoryProcessed) ? markers.highestMemoryProcessed : -1;
        const buffer = Math.min(50, Math.max(0, parseInt(settings.autoSummaryBuffer) || 0));
        const first = mode === 'automatic'
            ? normalizeReminderInterval(settings.autoSummaryInterval, 50) + buffer + interval : interval;
        const signature = JSON.stringify([baseline, enabled, interval, first]);
        const key = JSON.stringify([chatKey, mode, signature]);
        if (visibleKey !== key) dismiss();
        const states = markers.memoryReminderState || {};
        let state = states[mode];
        // Don't write metadata for users who have never enabled reminders.
        if (!enabled && !state) return;
        const before = JSON.stringify(state);
        if (!state || state.signature !== signature) {
            state = { signature, lastCount: count, notifiedAt: null };
        }
        if (count < state.lastCount && state.notifiedAt !== null) {
            // Removed messages no longer count toward the next repeat.
            state.notifiedAt = Math.min(state.notifiedAt, count);
        }
        state.lastCount = count;
        const due = enabled && count - baseline - 1 >= first
            && (state.notifiedAt === null || count >= state.notifiedAt + interval);
        if (notify && due && !busy && !(markers.autoSummaryNextPromptAt > count)) {
            if (!visible) {
                const toast = show(mode, Math.max(0, count - baseline - 1), () => {
                    if (visible === toast) { visible = null; visibleKey = null; }
                });
                visible = toast;
                visibleKey = key;
            }
            state.notifiedAt = count;
        }
        if (before !== JSON.stringify(state)) {
            markers.memoryReminderState = { ...states, [mode]: state };
            save();
        }
    }
    return { check, dismiss };
}
