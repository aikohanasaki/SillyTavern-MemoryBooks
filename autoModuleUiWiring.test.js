// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// autoModuleUiWiring.test.js — PHA-1651 regression: ensure the Sentinel toggle
// (autoModuleSettingsTemplate) is actually reachable from the UI. The template
// was authored but never wired to a button until v0.0.4. Brandon opened this
// issue when he couldn't find the "Enable Sentinel" checkbox anywhere.
//
// These are static source-level assertions — they grep index.js for the wiring
// surface (import, button entry, popup function, event listener function) so a
// future refactor that drops any of them fails loudly.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = resolve(__dirname, 'index.js');
const LOCALES_PATH = resolve(__dirname, 'locales.js');
const BUILD_PATH = resolve(__dirname, 'index.build.js');

const src = readFileSync(INDEX_PATH, 'utf8');

// ----- import surface -------------------------------------------------------

test('index.js imports autoModuleSettingsTemplate from ./templates.js', () => {
    assert.match(
        src,
        /import\s*\{[^}]*\bautoModuleSettingsTemplate\b[^}]*\}\s*from\s*['"]\.\/templates\.js['"]/,
        'expected the autoModuleSettingsTemplate to be imported',
    );
});

test('index.js imports AUTO_MODULE_DEFAULTS + validateAutoPatch + validateChatAutoPatch from ./autoSettings.js', () => {
    assert.match(
        src,
        /import\s*\{[^}]*\bAUTO_MODULE_DEFAULTS\b[^}]*\}\s*from\s*['"]\.\/autoSettings\.js['"]/,
        'expected AUTO_MODULE_DEFAULTS to be imported from autoSettings.js',
    );
    assert.match(
        src,
        /import\s*\{[^}]*\bvalidateAutoPatch\b[^}]*\}\s*from\s*['"]\.\/autoSettings\.js['"]/,
        'expected validateAutoPatch to be imported from autoSettings.js',
    );
    assert.match(
        src,
        /import\s*\{[^}]*\bvalidateChatAutoPatch\b[^}]*\}\s*from\s*['"]\.\/autoSettings\.js['"]/,
        'expected validateChatAutoPatch to be imported from autoSettings.js',
    );
});

test('index.js imports CLIPPER_DEFAULTS from ./clipperPlusCore.js', () => {
    assert.match(
        src,
        /import\s*\{[^}]*\bCLIPPER_DEFAULTS\b[^}]*\}\s*from\s*['"]\.\/clipperPlusCore\.js['"]/,
        'expected CLIPPER_DEFAULTS to be imported',
    );
});

// ----- migration / defaults -------------------------------------------------

test('defaultSettings declares autoModule as an empty container (so writes are safe)', () => {
    // The defaultSettings literal should now carry an autoModule key. Reads
    // still merge AUTO_MODULE_DEFAULTS on top, so this just gives the UI a
    // place to write without per-write null guards.
    assert.match(
        src,
        /const\s+defaultSettings\s*=\s*\{[\s\S]*?autoModule\s*:\s*\{[\s\S]*?migrationVersion/,
        'expected defaultSettings to include autoModule: {} before migrationVersion',
    );
    assert.match(
        src,
        /const\s+defaultSettings\s*=\s*\{[\s\S]*?autoModule\s*:\s*\{[\s\S]*?migrationVersion\s*:\s*6/,
        'expected migrationVersion to be 6 (v6 supersedes v5; v6 adds the showSceneMarkerButtons opt-in)',
    );
});

test('initializeSettings migrates to v5 by backfilling autoModule when missing', () => {
    assert.match(
        src,
        /currentVersion\s*<\s*5[\s\S]{0,400}?autoModule[\s\S]{0,200}?migrationVersion\s*=\s*5/,
        'expected a v5 migration that initializes extension_settings.STMemoryBooks.autoModule',
    );
});

// ----- popup + button surface ----------------------------------------------

test('index.js defines showAutoModuleSettingsPopup that uses autoModuleSettingsTemplate', () => {
    assert.match(
        src,
        /async\s+function\s+showAutoModuleSettingsPopup\s*\(\s*\)\s*\{[\s\S]*?autoModuleSettingsTemplate/,
        'expected showAutoModuleSettingsPopup to render autoModuleSettingsTemplate',
    );
});

test('index.js defines buildAutoModuleTemplateData that merges AUTO_MODULE_DEFAULTS + CLIPPER_DEFAULTS and populates chatAuto', () => {
    assert.match(
        src,
        /function\s+buildAutoModuleTemplateData\s*\(\s*\)\s*\{[\s\S]*?AUTO_MODULE_DEFAULTS/,
        'expected buildAutoModuleTemplateData to merge AUTO_MODULE_DEFAULTS',
    );
    assert.match(
        src,
        /buildAutoModuleTemplateData[\s\S]*?CLIPPER_DEFAULTS/,
        'expected buildAutoModuleTemplateData to merge CLIPPER_DEFAULTS',
    );
    // chatAuto is built (const declaration) and returned alongside auto.
    assert.match(
        src,
        /buildAutoModuleTemplateData[\s\S]{0,3000}?const\s+chatAuto\s*=/,
        'expected buildAutoModuleTemplateData to declare a chatAuto local',
    );
    assert.match(
        src,
        /buildAutoModuleTemplateData[\s\S]{0,3000}?return\s*\{\s*auto\s*,\s*chatAuto\s*\}/,
        'expected buildAutoModuleTemplateData to return { auto, chatAuto }',
    );
});

test('index.js defines setupAutoModuleEventListeners that wires the sentinel toggle', () => {
    // The function must exist
    assert.match(
        src,
        /function\s+setupAutoModuleEventListeners\s*\(\s*popupInstance\s*\)/,
        'expected setupAutoModuleEventListeners to be defined',
    );
    // And it must listen for #stmb-auto-sentinel-enabled
    assert.match(
        src,
        /id\s*===\s*['"]stmb-auto-sentinel-enabled['"]/,
        'expected setupAutoModuleEventListeners to check for #stmb-auto-sentinel-enabled',
    );
    // And persist a sentinelEnabled patch when triggered
    assert.match(
        src,
        /persistAutoPatch\s*\(\s*\{\s*sentinelEnabled\s*:\s*t\.checked\s*\}\s*\)/,
        'expected the sentinel toggle handler to write { sentinelEnabled: t.checked }',
    );
});

test('promptManagerButtons in the main settings popup exposes the Auto Module entry', () => {
    assert.match(
        src,
        /promptManagerButtons\s*=\s*\[[\s\S]*?id:\s*['"]stmb-auto-module-settings['"][\s\S]*?action:\s*showAutoModuleSettingsPopup/,
        'expected a promptManagerButtons entry with id "stmb-auto-module-settings" wired to showAutoModuleSettingsPopup',
    );
});

// ----- i18n -----------------------------------------------------------------

test('locales.js exposes the new Auto Module strings', () => {
    const locSrc = readFileSync(LOCALES_PATH, 'utf8');
    for (const key of [
        'STMemoryBooks_AutoModule',
        'STMemoryBooks_AutoModule_UseDefaultProfile',
        'STMemoryBooks_FailedToOpenAutoModuleSettings',
        'STMemoryBooks_NoChatOpen',
    ]) {
        assert.match(
            locSrc,
            new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
            `expected locales.js to define ${key}`,
        );
    }
});

// ----- bundled output sanity check -----------------------------------------

test('index.build.js includes the sentinel-enabled selector (template was bundled)', () => {
    const built = readFileSync(BUILD_PATH, 'utf8');
    // Minified names will differ; assert on the literal selector instead.
    assert.match(built, /stmb-auto-sentinel-enabled/);
    // And the Auto Module button id is reachable too
    assert.match(built, /stmb-auto-module-settings/);
});