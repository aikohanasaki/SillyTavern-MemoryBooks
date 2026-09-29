// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import test from 'node:test';
import assert from 'node:assert/strict';
import { MEMORY_REMINDER_DEFAULTS, normalizeReminderInterval, createMemoryReminderController } from './memoryReminders.js';

function fixture() {
    const context = { chatKey: 'A', markers: {}, count: 0, busy: false,
        settings: { ...MEMORY_REMINDER_DEFAULTS, autoSummaryInterval: 50, autoSummaryBuffer: 2 } };
    const shown = [];
    const cleared = [];
    let saves = 0;
    const dependencies = {
        current: () => context,
        save: () => saves++,
        show: (mode, count, close) => { const toast = { mode, count, close }; shown.push(toast); return toast; },
        clear: toast => cleared.push(toast),
    };
    let controller = createMemoryReminderController(dependencies);
    return { context, shown, cleared, get saves() { return saves; },
        check: (count = context.count, notify = true) => { context.count = count; controller.check({ notify }); },
        reload: () => { controller.dismiss(); controller = createMemoryReminderController(dependencies); },
    };
}

test('reminders default off and intervals require positive safe integers', () => {
    const f = fixture();
    f.check(1000);
    assert.equal(f.shown.length, 0);
    assert.equal(f.saves, 0);
    for (const value of [0, -1, 1.5, '', 'bad', Infinity, Number.MAX_SAFE_INTEGER + 1]) {
        assert.equal(normalizeReminderInterval(value, 10), 10);
    }
    assert.equal(normalizeReminderInterval('275', 10), 275);
});

test('manual cadence, duplicate events and persistent toast do not stack', () => {
    const f = fixture();
    f.context.settings.manualMemoryReminders = true;
    f.check(49); assert.equal(f.shown.length, 0);
    f.check(50); assert.equal(f.shown.length, 1);
    f.check(50); assert.equal(f.shown.length, 1);
    f.check(100); assert.equal(f.shown.length, 1);
    f.shown[0].close();
    f.check(149); assert.equal(f.shown.length, 1);
    f.check(150); assert.equal(f.shown.length, 2);
    assert.equal(f.shown[1].count, 150);
});

test('automatic reminders include interval and buffer even in token mode', () => {
    const f = fixture();
    Object.assign(f.context.settings, { autoSummaryEnabled: true, automaticMemoryReminders: true,
        autoSummaryTriggerMode: 'tokens', showNotifications: false });
    f.context.markers.highestMemoryProcessed = 9;
    f.check(71); assert.equal(f.shown.length, 0);
    f.check(72); assert.equal(f.shown[0].mode, 'automatic');
    f.shown[0].close();
    f.check(81); assert.equal(f.shown.length, 1);
    f.check(82); assert.equal(f.shown.length, 2);
});

test('only the toggle for the active generation mode applies', () => {
    const f = fixture();
    f.context.settings.manualMemoryReminders = true;
    f.context.settings.autoSummaryEnabled = true;
    f.check(100); assert.equal(f.shown.length, 0);
    f.context.settings.autoSummaryEnabled = false;
    f.check(); assert.equal(f.shown.length, 1);
    f.context.settings.autoSummaryEnabled = true;
    f.check(); assert.equal(f.cleared.length, 1);
    assert.equal(f.context.settings.manualMemoryReminders, true);
});

test('busy or postponed reminders retain eligibility for an idle recheck', () => {
    const f = fixture();
    f.context.settings.manualMemoryReminders = true;
    f.context.busy = true;
    f.check(50); assert.equal(f.shown.length, 0);
    f.context.busy = false;
    f.context.markers.autoSummaryNextPromptAt = 60;
    f.check(59); assert.equal(f.shown.length, 0);
    f.check(60); assert.equal(f.shown.length, 1);
});

test('reload retains the delivered checkpoint', () => {
    const f = fixture();
    f.context.settings.manualMemoryReminders = true;
    f.check(50);
    f.context.markers = JSON.parse(JSON.stringify(f.context.markers));
    f.reload(); f.check(50); f.check(99);
    assert.equal(f.shown.length, 1);
    f.check(100); assert.equal(f.shown.length, 2);
});

test('baseline changes clear the toast and restart counting from the new memory', () => {
    const f = fixture();
    f.context.settings.manualMemoryReminders = true;
    f.check(50);
    f.context.markers.highestMemoryProcessed = 49;
    f.check(50, false); assert.equal(f.cleared.length, 1);
    f.check(99); assert.equal(f.shown.length, 1);
    f.check(100); assert.equal(f.shown.length, 2);
});

test('deletions rebase the repeat checkpoint without spamming', () => {
    const f = fixture();
    f.context.settings.manualMemoryReminders = true;
    f.check(100); f.shown[0].close();
    f.check(60, false);
    f.check(109); assert.equal(f.shown.length, 1);
    f.check(110); assert.equal(f.shown.length, 2);
});

test('chat switches, disabling and interval changes clear visible reminders', () => {
    const f = fixture();
    f.context.settings.manualMemoryReminders = true;
    f.check(50);
    const original = f.context.markers;
    f.context.chatKey = 'B'; f.context.markers = {};
    f.check(0, false); assert.equal(f.cleared.length, 1);
    f.check(50); assert.equal(f.shown.length, 2);
    f.context.settings.manualMemoryReminderInterval = 100;
    f.check(50, false); assert.equal(f.cleared.length, 2);
    f.check(100); assert.equal(f.shown.length, 3);
    f.context.settings.manualMemoryReminders = false;
    f.check(100, false); assert.equal(f.cleared.length, 3);
    assert.equal(original.memoryReminderState.manual.notifiedAt, 50);
});
