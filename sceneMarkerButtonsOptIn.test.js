// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// sceneMarkerButtonsOptIn.test.js — PHA-1651 follow-up regression: ensure
// the per-message Mark Scene Start / End icons are opt-in. Brandon opened
// the fresh v0.0.5 install and didn't want these icons cluttering every
// chat message. The icons have been in STMB-Auto since v0.0.1; v0.0.6
// flips the default to hidden via `moduleSettings.showSceneMarkerButtons`
// and gates `createSceneButtons()` on it. These static-source assertions
// lock the default + the gate in place.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = resolve(__dirname, 'index.js');
const SCENE_MGR_PATH = resolve(__dirname, 'sceneManager.js');
const LOCALES_PATH = resolve(__dirname, 'locales.js');
const TEMPLATES_PATH = resolve(__dirname, 'templates.js');
const BUILD_PATH = resolve(__dirname, 'index.build.js');

const indexSrc = readFileSync(INDEX_PATH, 'utf8');
const sceneMgrSrc = readFileSync(SCENE_MGR_PATH, 'utf8');
const localesSrc = readFileSync(LOCALES_PATH, 'utf8');
const templatesSrc = readFileSync(TEMPLATES_PATH, 'utf8');

// ----- default ---------------------------------------------------------------

test('defaultSettings declares showSceneMarkerButtons as false (opt-in)', () => {
    // The literal default in defaultSettings.moduleSettings must be `false`
    // so a fresh install doesn't show the icons. We assert the exact key
    // appears with a `false` value before the migrationVersion line.
    const defaultBlock = indexSrc.match(
        /const\s+defaultSettings\s*=\s*\{[\s\S]*?migrationVersion/,
    );
    assert.ok(defaultBlock, 'defaultSettings block not found');
    assert.match(
        defaultBlock[0],
        /showSceneMarkerButtons\s*:\s*false\b/,
        'expected showSceneMarkerButtons: false in defaultSettings',
    );
});

test('defaultSettings migrationVersion is 6 (forces the v6 migration to run on existing installs)', () => {
    const defaultBlock = indexSrc.match(
        /const\s+defaultSettings\s*=\s*\{[\s\S]*?migrationVersion\s*:\s*(\d+)\s*,/,
    );
    assert.ok(defaultBlock, 'defaultSettings block not found');
    assert.equal(defaultBlock[1], '6', 'expected migrationVersion: 6');
});

// ----- v6 migration ---------------------------------------------------------

test('initializeSettings has a v6 migration that backfills showSceneMarkerButtons=false when missing', () => {
    assert.match(
        indexSrc,
        /currentVersion\s*<\s*6[\s\S]{0,400}?showSceneMarkerButtons\s*=\s*false/,
        'expected a v6 migration that defaults showSceneMarkerButtons to false',
    );
    assert.match(
        indexSrc,
        /currentVersion\s*<\s*6[\s\S]{0,400}?migrationVersion\s*=\s*6/,
        'expected the v6 migration to bump migrationVersion to 6',
    );
});

// ----- gate in sceneManager.js ---------------------------------------------

test('sceneManager.js: createSceneButtons short-circuits when showSceneMarkerButtons is false', () => {
    assert.match(
        sceneMgrSrc,
        /export\s+function\s+createSceneButtons[\s\S]*?showSceneMarkerButtons\s*===\s*false[\s\S]*?return\s+false\s*;?/,
        'expected createSceneButtons to early-return when showSceneMarkerButtons is false',
    );
});

test('sceneManager.js: createSceneButtons reads the setting via extension_settings (not a stale closure)', () => {
    assert.match(
        sceneMgrSrc,
        /import\s*\{[^}]*\bextension_settings\b[^}]*\}\s*from\s*['"]\.\.\/\.\.\/\.\.\/extensions\.js['"]/,
        'expected sceneManager.js to import extension_settings',
    );
    assert.match(
        sceneMgrSrc,
        /createSceneButtons[\s\S]{0,500}?extension_settings\?\.STMemoryBooks\?\.moduleSettings/,
        'expected createSceneButtons to read extension_settings.STMemoryBooks.moduleSettings',
    );
});

// ----- UI toggle so Brandon can re-enable -----------------------------------

test('index.js has a #stmb-show-scene-marker-buttons event handler that persists the toggle', () => {
    assert.match(
        indexSrc,
        /#stmb-show-scene-marker-buttons/,
        'expected a #stmb-show-scene-marker-buttons selector in index.js',
    );
    // The handler must write showSceneMarkerButtons + saveSettingsDebounced.
    assert.match(
        indexSrc,
        /stmb-show-scene-marker-buttons[\s\S]{0,500}?showSceneMarkerButtons\s*=\s*e\.target\.checked[\s\S]{0,200}?saveSettingsDebounced/,
        'expected the handler to persist the new value',
    );
});

test('templates.js exposes #stmb-show-scene-marker-buttons in the General Settings popup', () => {
    // The id appears inside an <input type="checkbox" ...> — match the HTML
    // attribute form, not a JSX-style `id: '...'` colon prefix.
    assert.match(
        templatesSrc,
        /id=\s*['"]stmb-show-scene-marker-buttons['"]/,
        'expected the toggle id in the General Settings template',
    );
    // And the i18n key should sit near it.
    assert.match(
        templatesSrc,
        /stmb-show-scene-marker-buttons[\s\S]{0,400}?STMemoryBooks_ShowSceneMarkerButtons/,
        'expected the STMemoryBooks_ShowSceneMarkerButtons i18n key in the same block',
    );
});

test('buildSettingsTemplateData populates showSceneMarkerButtons for the General Settings template', () => {
    assert.match(
        indexSrc,
        /showSceneMarkerButtons\s*:\s*settings\.moduleSettings\.showSceneMarkerButtons\s*===\s*true/,
        'expected buildSettingsTemplateData to forward showSceneMarkerButtons as a boolean',
    );
});

// ----- i18n -----------------------------------------------------------------

test('locales.js exposes the scene-marker toggle strings', () => {
    for (const key of [
        'STMemoryBooks_ShowSceneMarkerButtons',
        'STMemoryBooks_ShowSceneMarkerButtonsDesc',
    ]) {
        assert.match(
            localesSrc,
            new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
            `expected locales.js to define ${key}`,
        );
    }
});

// ----- bundled output sanity check -----------------------------------------

test('index.build.js references the new toggle selector (template was bundled)', () => {
    const built = readFileSync(BUILD_PATH, 'utf8');
    assert.match(built, /stmb-show-scene-marker-buttons/);
});