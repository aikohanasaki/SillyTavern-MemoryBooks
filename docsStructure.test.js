// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// docsStructure.test.js — Structural tests verifying the Phase 6 P6.2 docs
// deliverables. We don't import the docs (they're markdown), we read the source
// and assert content + AGPL headers.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const readmeFork = readFileSync(resolve(__dirname, 'README.fork.md'), 'utf8');
const changelogFork = readFileSync(resolve(__dirname, 'CHANGELOG.fork.md'), 'utf8');
const readmeUpstream = readFileSync(resolve(__dirname, 'readme.md'), 'utf8');
const changelogUpstream = readFileSync(resolve(__dirname, 'changelog.md'), 'utf8');

// ----------------------------------------------------------------------------
// README.fork.md
// ----------------------------------------------------------------------------

test('README.fork.md exists and has AGPL header', () => {
    assert.match(readmeFork, /^<!--[\s\S]*?AGPL-3\.0-only[\s\S]*?-->/m, 'README.fork.md needs AGPL header');
});

test('README.fork.md: install over stock STMB (data untouched)', () => {
    assert.match(readmeFork, /Install.*over.*stock|Data.*untouched|install over the stock extension/i, 'must mention install-over-stock and data-untouched');
});

test('README.fork.md: documents the data-compat identity rules', () => {
    assert.match(readmeFork, /STMemoryBooks/, 'must mention the settings key STMemoryBooks');
    assert.match(readmeFork, /stmemorybooks/, 'must mention the lorebook flag stmemorybooks');
    assert.match(readmeFork, /\[STMB Clip\]/, 'must mention the [STMB Clip] clip marker');
});

test('README.fork.md: documents sentinel vs native auto-summary', () => {
    assert.match(readmeFork, /Sentinel/, 'must explain Sentinel');
    assert.match(readmeFork, /auto-?summary/i, 'must mention auto-summary interaction');
    assert.match(readmeFork, /force.?disable|disable/i, 'must document the force-disable behavior');
});

test('README.fork.md: links to eval harness and FORK_NOTES', () => {
    assert.match(readmeFork, /eval\//, 'must mention eval/');
    assert.match(readmeFork, /FORK_NOTES/, 'must reference the merge map');
});

test('README.fork.md: AGPL-3.0-only license block present', () => {
    assert.match(readmeFork, /AGPL-3\.0-only/, 'license block must mention AGPL-3.0-only');
    assert.match(readmeFork, /Copyright \(C\) 2024/u, 'license block must include the copyright line');
});

// ----------------------------------------------------------------------------
// CHANGELOG.fork.md
// ----------------------------------------------------------------------------

test('CHANGELOG.fork.md exists and has AGPL header', () => {
    assert.match(changelogFork, /^<!--[\s\S]*?AGPL-3\.0-only[\s\S]*?-->/m, 'CHANGELOG.fork.md needs AGPL header');
});

test('CHANGELOG.fork.md: documents Phase 0 / 1 / 2 / 4 with commit references', () => {
    assert.match(changelogFork, /Phase 0/, 'must document Phase 0');
    assert.match(changelogFork, /Phase 1/, 'must document Phase 1');
    assert.match(changelogFork, /Phase 2/, 'must document Phase 2');
    assert.match(changelogFork, /Phase 4/, 'must document Phase 4');
});

test('CHANGELOG.fork.md: lists every new file', () => {
    for (const f of [
        'eval/parser.js',
        'eval/groundTruth.js',
        'eval/score.js',
        'eval/detect.js',
        'eval/run.js',
        'autoSettings.js',
        'sceneCharacterFilter.js',
    ]) {
        assert.match(changelogFork, new RegExp(f.replace(/\./g, '\\.')), `CHANGELOG.fork.md must mention ${f}`);
    }
});

test('CHANGELOG.fork.md: documents data-compat and mergeability', () => {
    assert.match(changelogFork, /STMemoryBooks/, 'must mention settings key');
    assert.match(changelogFork, /mergeab/i, 'must mention mergeability');
    assert.match(changelogFork, /STMBC-HOOK/, 'must mention the STMBC-HOOK marker');
});

// ----------------------------------------------------------------------------
// upstream readme.md / changelog.md (mergeability check)
// ----------------------------------------------------------------------------

test('readme.md: original AGPL header preserved', () => {
    assert.match(readmeUpstream, /^<!--[\s\S]*?AGPL-3\.0-only[\s\S]*?-->/m, 'upstream readme AGPL header must be preserved');
});

test('readme.md: fork banner is additive (HTML comment + small section)', () => {
    // The fork banner is an HTML comment after the H1 + a "Fork" section near the end.
    assert.match(readmeUpstream, /<!--[\s\S]*?Fork banner[\s\S]*?-->/m, 'fork banner should be an HTML comment block');
    assert.match(readmeUpstream, /^## Fork$/m, 'fork section heading should be a level-2 heading');
    assert.match(readmeUpstream, /phattbeats\/SillyTavern-MemoryBooks-Auto/, 'must link to the fork repo');
});

test('changelog.md: original AGPL header preserved', () => {
    assert.match(changelogUpstream, /^<!--[\s\S]*?AGPL-3\.0-only[\s\S]*?-->/m, 'upstream changelog AGPL header must be preserved');
});

test('changelog.md: fork entry prepended at the top', () => {
    assert.match(changelogUpstream, /^## v8\.2\.2-a\.1/m, 'fork entry must be the first version entry');
    assert.match(changelogUpstream, /fork — unreleased/, 'fork entry must be marked as fork/unreleased');
});

// ----------------------------------------------------------------------------
// Existing upstream files: AGPL headers preserved (mergeability check)
// ----------------------------------------------------------------------------

test('all upstream-modified files retain their AGPL headers', () => {
    for (const f of ['index.js', 'stmemory.js', 'clipManager.js', 'sidePrompts.js', 'autosummary.js', 'utils.js', 'constants.js', 'templates.js']) {
        const path = resolve(__dirname, f);
        if (!existsSync(path)) continue;
        const content = readFileSync(path, 'utf8');
        assert.match(
            content,
            /Copyright \(C\) 2024[^\n]*Aiko Hanasaki[\s\S]*?SPDX-License-Identifier:\s*AGPL-3\.0-only/,
            `${f} must retain its AGPL header`
        );
    }
});

test('manifest.json: AGPL license preserved (different format)', () => {
    // manifest.json is JSON, so it carries the license as a field rather than a
    // SPDX header comment. The license string must remain AGPL-3.0.
    const path = resolve(__dirname, 'manifest.json');
    if (!existsSync(path)) return;
    const content = readFileSync(path, 'utf8');
    assert.match(content, /"license":\s*"AGPL-3\.0"/, 'manifest.json must retain AGPL-3.0 license field');
});
