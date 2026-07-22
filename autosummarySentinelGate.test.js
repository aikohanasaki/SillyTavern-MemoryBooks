// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// autosummarySentinelGate.test.js — Structural tests verifying the P2.4 gate
// in autosummary.js. We can't import autosummary.js directly in Node (it pulls
// in SillyTavern runtime imports), so we read the source and assert the gate
// is wired correctly.
//
// The gate has two parts (per plan §4.1 + §1.2.4):
//   1. `isAutoSummaryBlockedBySentinel` helper exists and uses resolveSentinelEnabled
//      from autoSettings.js (the single source of truth).
//   2. The helper is invoked at both runtime entry points: handleAutoSummaryMessageReceived
//      and clearAutoSummaryState. autosummary.js is otherwise untouched (mergeability).

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const src = readFileSync(resolve(__dirname, 'autosummary.js'), 'utf8');

test('autosummary.js: defines isAutoSummaryBlockedBySentinel helper', () => {
    assert.match(
        src,
        /function\s+isAutoSummaryBlockedBySentinel\s*\(\s*\)\s*{[\s\S]{0,500}resolveSentinelEnabled/,
        'helper should call resolveSentinelEnabled'
    );
});

test('autosummary.js: imports resolveSentinelEnabled from autoSettings.js', () => {
    assert.match(
        src,
        /import\s*{\s*resolveSentinelEnabled\s*}\s*from\s*['"]\.\/autoSettings\.js['"]/,
        'resolveSentinelEnabled must come from autoSettings.js (single source of truth)'
    );
});

test('autosummary.js: handleAutoSummaryMessageReceived bails when sentinel is on', () => {
    const fnMatch = src.match(/export\s+async\s+function\s+handleAutoSummaryMessageReceived\s*\([^)]*\)\s*{([\s\S]*?)^\}/m);
    assert.ok(fnMatch, 'handleAutoSummaryMessageReceived must be defined');
    assert.match(
        fnMatch[1],
        /isAutoSummaryBlockedBySentinel\(\)/,
        'handleAutoSummaryMessageReceived must consult isAutoSummaryBlockedBySentinel'
    );
});

test('autosummary.js: clearAutoSummaryState bails when sentinel is on', () => {
    const fnMatch = src.match(/export\s+function\s+clearAutoSummaryState\s*\([^)]*\)\s*{([\s\S]*?)\n\}/m);
    assert.ok(fnMatch, 'clearAutoSummaryState must be defined');
    assert.match(
        fnMatch[1],
        /isAutoSummaryBlockedBySentinel\(\)/,
        'clearAutoSummaryState must consult isAutoSummaryBlockedBySentinel'
    );
});

test('autosummary.js: the file is otherwise intact (mergeability check)', () => {
    // Sanity: the original public API and key strings must still be present.
    for (const required of [
        'export async function handleAutoSummaryMessageReceived',
        'export async function retryAutoSummaryAfterJobIdle',
        'export function clearAutoSummaryState',
        'STMemoryBooks_AutoSummaryNoAssignedLorebook',
    ]) {
        assert.match(src, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `autosummary.js must still contain: ${required}`);
    }
});
