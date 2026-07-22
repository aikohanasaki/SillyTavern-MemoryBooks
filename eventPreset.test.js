// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// eventPreset.test.js — Verify the "event" preset (plan Appendix B) is wired
// into utils.js's getBuiltInPresetPrompts, getPresetNames, isValidPreset, and
// constants.js's DISPLAY_NAME_DEFAULTS / DISPLAY_NAME_I18N_KEYS.
//
// We don't import utils.js directly because it pulls in ST runtime imports
// (../../../../script.js). Instead, we read the source files and assert the
// strings are present where they should be. This is a structural test — it
// would have caught the regression where adding a preset key would silently
// leave getPresetNames() / isValidPreset() out of sync.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const utilsSrc = readFileSync(resolve(__dirname, 'utils.js'), 'utf8');
const constantsSrc = readFileSync(resolve(__dirname, 'constants.js'), 'utf8');

test('utils.js: getBuiltInPresetPrompts includes an event key with the Appendix B prompt', () => {
    assert.match(utilsSrc, /event:\s*translate\(/, 'utils.js should have an event: translate(...) entry');
    assert.match(utilsSrc, /STMemoryBooks_Prompt_event/, 'utils.js should reference the STMemoryBooks_Prompt_event i18n key');
    // Confirm it lives inside getBuiltInPresetPrompts's return object.
    const fnStart = utilsSrc.indexOf('export function getBuiltInPresetPrompts');
    assert.ok(fnStart > -1, 'getBuiltInPresetPrompts must be exported');
    const eventIdx = utilsSrc.indexOf("event: translate(");
    assert.ok(eventIdx > fnStart, 'event entry must live inside getBuiltInPresetPrompts');
});

test('utils.js: getPresetNames includes "event"', () => {
    assert.match(
        utilsSrc,
        /getPresetNames\(\)\s*{\s*return\s*\[[^\]]*'event'[^\]]*\]/,
        'getPresetNames() must include the event preset key'
    );
});

test('utils.js: isValidPreset accepts "event"', () => {
    assert.match(
        utilsSrc,
        /isValidPreset[\s\S]{0,400}new Set\(\[[^\]]*'event'[^\]]*\]\)/,
        'isValidPreset\'s built-in set must include event'
    );
});

test('utils.js: event prompt enforces JSON shape (title / content / keywords)', () => {
    // Pull out the event entry to keep the assertion localized.
    const eventMatch = utilsSrc.match(/event:\s*translate\(\s*`([\s\S]*?)`,\s*'STMemoryBooks_Prompt_event'\s*\)/);
    assert.ok(eventMatch, 'event entry must be a translate() call with the right i18n key');
    const prompt = eventMatch[1];
    assert.match(prompt, /"title"/, 'prompt must declare title field');
    assert.match(prompt, /"content"/, 'prompt must declare content field');
    assert.match(prompt, /"keywords"/, 'prompt must declare keywords field');
    assert.match(prompt, /JSON/, 'prompt must demand JSON output');
});

test('utils.js: event prompt calls out the Appendix B Event sections', () => {
    const eventMatch = utilsSrc.match(/event:\s*translate\(\s*`([\s\S]*?)`,\s*'STMemoryBooks_Prompt_event'\s*\)/);
    const prompt = eventMatch ? eventMatch[1] : '';
    // Each Appendix B Event section header must appear.
    for (const section of ['## Name', '## Summary', '## Key Events', '## Significance', '## Key Quotes']) {
        assert.match(prompt, new RegExp(section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `event prompt must include ${section}`);
    }
});

test('constants.js: DISPLAY_NAME_DEFAULTS has an event entry', () => {
    assert.match(constantsSrc, /event:\s*'Event\b/, 'constants.js should have an event entry with display name starting with "Event"');
});

test('constants.js: DISPLAY_NAME_I18N_KEYS has an event entry pointing at STMemoryBooks_DisplayName_event', () => {
    assert.match(constantsSrc, /event:\s*'STMemoryBooks_DisplayName_event'/, 'constants.js should have event i18n key entry');
});
