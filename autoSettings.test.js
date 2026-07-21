// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// autoSettings.test.js — Unit tests for the Auto settings module.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
    AUTO_MODULE_DEFAULTS,
    CHAT_AUTO_DEFAULTS,
    validateAutoPatch,
    validateChatAutoPatch,
    getAutoSettings,
    setAutoSettings,
    initializeAutoSettings,
    getChatAutoSettings,
    setChatAutoSettings,
    initializeChatAutoSettings,
    resolveSentinelEnabled,
    resolveDetectionPrompt,
} from './autoSettings.js';

// ----------------------------------------------------------------------------
// validateAutoPatch — global
// ----------------------------------------------------------------------------

test('validateAutoPatch returns empty object for null/garbage input', () => {
    assert.deepEqual(validateAutoPatch(null), {});
    assert.deepEqual(validateAutoPatch(undefined), {});
    assert.deepEqual(validateAutoPatch('not an object'), {});
});

test('validateAutoPatch coerces sentinelEnabled to boolean', () => {
    assert.equal(validateAutoPatch({ sentinelEnabled: 1 }).sentinelEnabled, true);
    assert.equal(validateAutoPatch({ sentinelEnabled: 0 }).sentinelEnabled, false);
    assert.equal(validateAutoPatch({ sentinelEnabled: 'yes' }).sentinelEnabled, true);
});

test('validateAutoPatch clamps numeric ranges', () => {
    assert.equal(validateAutoPatch({ cadenceMessages: -10 }).cadenceMessages, 1);
    assert.equal(validateAutoPatch({ cadenceMessages: 9999 }).cadenceMessages, 200);
    assert.equal(validateAutoPatch({ cadenceMessages: 42 }).cadenceMessages, 42);

    assert.equal(validateAutoPatch({ windowSize: 0 }).windowSize, 4);
    assert.equal(validateAutoPatch({ windowSize: 26 }).windowSize, 26);
    assert.equal(validateAutoPatch({ windowSize: 999 }).windowSize, 200);

    assert.equal(validateAutoPatch({ truncateChars: 'not a number' }).truncateChars, AUTO_MODULE_DEFAULTS.truncateChars);
    assert.equal(validateAutoPatch({ truncateChars: 100 }).truncateChars, 100);
});

test('validateAutoPatch coerces detectionProfileIndex null/undefined/empty to null', () => {
    assert.equal(validateAutoPatch({ detectionProfileIndex: null }).detectionProfileIndex, null);
    assert.equal(validateAutoPatch({ detectionProfileIndex: '' }).detectionProfileIndex, null);
    assert.equal(validateAutoPatch({ detectionProfileIndex: 'null' }).detectionProfileIndex, null);
    assert.equal(validateAutoPatch({ detectionProfileIndex: 0 }).detectionProfileIndex, 0);
    assert.equal(validateAutoPatch({ detectionProfileIndex: 5 }).detectionProfileIndex, 5);
    assert.equal(validateAutoPatch({ detectionProfileIndex: 9999 }).detectionProfileIndex, 1000);
});

test('validateAutoPatch stringifies detectionPrompt', () => {
    assert.equal(validateAutoPatch({ detectionPrompt: 'hi' }).detectionPrompt, 'hi');
    assert.equal(validateAutoPatch({ detectionPrompt: 42 }).detectionPrompt, '');
});

test('validateAutoPatch drops unknown fields', () => {
    const out = validateAutoPatch({ sentinelEnabled: true, weirdUnknownField: 'x' });
    assert.equal('weirdUnknownField' in out, false);
    assert.equal(out.sentinelEnabled, true);
});

// ----------------------------------------------------------------------------
// validateChatAutoPatch — per-chat
// ----------------------------------------------------------------------------

test('validateChatAutoPatch handles enabled null/true/false', () => {
    assert.equal(validateChatAutoPatch({ enabled: null }).enabled, null);
    assert.equal(validateChatAutoPatch({ enabled: true }).enabled, true);
    assert.equal(validateChatAutoPatch({ enabled: false }).enabled, false);
    assert.equal(validateChatAutoPatch({ enabled: '' }).enabled, null);
});

test('validateChatAutoPatch clamps watermarkFallback', () => {
    assert.equal(validateChatAutoPatch({ watermarkFallback: 100 }).watermarkFallback, 100);
    assert.equal(validateChatAutoPatch({ watermarkFallback: -1 }).watermarkFallback, 0);
    assert.equal(validateChatAutoPatch({ watermarkFallback: 'abc' }).watermarkFallback, 0);
    assert.equal(validateChatAutoPatch({ watermarkFallback: null }).watermarkFallback, null);
});

test('validateChatAutoPatch validates regex compile', () => {
    assert.equal(validateChatAutoPatch({ structureHintRegex: '\\[\\s*🕰️' }).structureHintRegex, '\\[\\s*🕰️');
    // Invalid regex → empty
    assert.equal(validateChatAutoPatch({ structureHintRegex: '[unclosed' }).structureHintRegex, '');
    // Non-string → empty
    assert.equal(validateChatAutoPatch({ structureHintRegex: 42 }).structureHintRegex, '');
});

// ----------------------------------------------------------------------------
// getAutoSettings / setAutoSettings / initializeAutoSettings
// ----------------------------------------------------------------------------

test('getAutoSettings returns defaults when no autoModule is present', () => {
    const s = {};
    const a = getAutoSettings(s);
    assert.deepEqual(a, AUTO_MODULE_DEFAULTS);
});

test('getAutoSettings merges partial stored settings onto defaults', () => {
    const s = { autoModule: { sentinelEnabled: true, cadenceMessages: 99 } };
    const a = getAutoSettings(s);
    assert.equal(a.sentinelEnabled, true);
    assert.equal(a.cadenceMessages, 99);
    // Other fields come from defaults
    assert.equal(a.windowSize, AUTO_MODULE_DEFAULTS.windowSize);
    assert.equal(a.debugLogging, false);
});

test('setAutoSettings creates the container if missing', () => {
    const s = {};
    setAutoSettings(s, { sentinelEnabled: true });
    assert.ok(s.autoModule);
    assert.equal(s.autoModule.sentinelEnabled, true);
    // Other fields not written — they keep defaults on read
    assert.equal(getAutoSettings(s).windowSize, AUTO_MODULE_DEFAULTS.windowSize);
});

test('setAutoSettings applies patch without dropping existing fields', () => {
    const s = { autoModule: { sentinelEnabled: true, cadenceMessages: 99 } };
    setAutoSettings(s, { truncateChars: 200 });
    assert.equal(s.autoModule.sentinelEnabled, true);
    assert.equal(s.autoModule.cadenceMessages, 99);
    assert.equal(s.autoModule.truncateChars, 200);
});

test('setAutoSettings throws on garbage input', () => {
    assert.throws(() => setAutoSettings(null, {}), TypeError);
    assert.throws(() => setAutoSettings('not an object', {}), TypeError);
});

test('initializeAutoSettings backfills missing fields without overwriting existing', () => {
    const s = { autoModule: { sentinelEnabled: true } };
    initializeAutoSettings(s);
    assert.equal(s.autoModule.sentinelEnabled, true);
    assert.equal(s.autoModule.cadenceMessages, AUTO_MODULE_DEFAULTS.cadenceMessages);
    assert.equal(s.autoModule.windowSize, AUTO_MODULE_DEFAULTS.windowSize);
});

test('initializeAutoSettings creates the container if absent', () => {
    const s = {};
    initializeAutoSettings(s);
    assert.ok(s.autoModule);
    assert.equal(s.autoModule.sentinelEnabled, AUTO_MODULE_DEFAULTS.sentinelEnabled);
});

// ----------------------------------------------------------------------------
// getChatAutoSettings / setChatAutoSettings
// ----------------------------------------------------------------------------

test('getChatAutoSettings returns defaults when chat metadata has no stmbc', () => {
    const a = getChatAutoSettings({});
    assert.equal(a.enabled, false); // null + no global → false (no global arg)
    assert.equal(a.watermarkFallback, null);
    assert.equal(a.structureHintRegex, '');
    assert.equal(a.promptOverride, '');
});

test('getChatAutoSettings resolves null enabled against globalSentinelEnabled', () => {
    const meta = { stmbc: { enabled: null } };
    assert.equal(getChatAutoSettings(meta, { globalSentinelEnabled: true }).enabled, true);
    assert.equal(getChatAutoSettings(meta, { globalSentinelEnabled: false }).enabled, false);
});

test('getChatAutoSettings per-chat enabled overrides global', () => {
    const meta = { stmbc: { enabled: false } };
    assert.equal(getChatAutoSettings(meta, { globalSentinelEnabled: true }).enabled, false);

    const meta2 = { stmbc: { enabled: true } };
    assert.equal(getChatAutoSettings(meta2, { globalSentinelEnabled: false }).enabled, true);
});

test('setChatAutoSettings creates the container if missing', () => {
    const meta = {};
    setChatAutoSettings(meta, { enabled: true, structureHintRegex: '\\[X' });
    assert.ok(meta.stmbc);
    assert.equal(meta.stmbc.enabled, true);
    assert.equal(meta.stmbc.structureHintRegex, '\\[X');
});

// ----------------------------------------------------------------------------
// resolveSentinelEnabled
// ----------------------------------------------------------------------------

test('resolveSentinelEnabled: per-chat false wins over global true', () => {
    const settings = { autoModule: { sentinelEnabled: true } };
    const meta = { stmbc: { enabled: false } };
    assert.equal(resolveSentinelEnabled(settings, meta), false);
});

test('resolveSentinelEnabled: per-chat null inherits global', () => {
    const settings = { autoModule: { sentinelEnabled: true } };
    const meta = { stmbc: { enabled: null } };
    assert.equal(resolveSentinelEnabled(settings, meta), true);
});

// ----------------------------------------------------------------------------
// resolveDetectionPrompt
// ----------------------------------------------------------------------------

test('resolveDetectionPrompt: per-chat override wins over global', () => {
    const settings = { autoModule: { detectionPrompt: 'global prompt' } };
    const meta = { stmbc: { promptOverride: 'chat override' } };
    assert.equal(resolveDetectionPrompt(settings, meta), 'chat override');
});

test('resolveDetectionPrompt: global used when no per-chat override', () => {
    const settings = { autoModule: { detectionPrompt: 'global prompt' } };
    const meta = { stmbc: { promptOverride: '' } };
    assert.equal(resolveDetectionPrompt(settings, meta), 'global prompt');
});

test('resolveDetectionPrompt: returns null when nothing set (use bundled baseline)', () => {
    const settings = { autoModule: { detectionPrompt: '' } };
    const meta = { stmbc: { promptOverride: '' } };
    assert.equal(resolveDetectionPrompt(settings, meta), null);
});

test('resolveDetectionPrompt: whitespace-only is treated as empty', () => {
    const settings = { autoModule: { detectionPrompt: '   \n  ' } };
    assert.equal(resolveDetectionPrompt(settings, {}), null);
});