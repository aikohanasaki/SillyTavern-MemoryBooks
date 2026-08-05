// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// autosummarySentinelGate.test.js — Structural tests verifying the PHA-1664
// no-op gate in autosummary.js. Per PHA-1656/sync-decisions.md §2.a, the
// previous P2.4 BLOCK behavior is inverted: autosummary runs regardless of
// Sentinel's enable state, and its cadence-detected scene markers become
// upstream signal input for Sentinel (consumed via getSceneMarkers()).
//
// We can't import autosummary.js directly in Node (it pulls in SillyTavern
// runtime imports), so we read the source and assert the gate is wired
// correctly.
//
// New contract (PHA-1664):
//   1. `isAutoSummaryBlockedBySentinel` helper still exists (for mergeability
//      with any third-party callers) but always returns false.
//   2. The three runtime entry points (handleAutoSummaryMessageReceived,
//      retryAutoSummaryAfterJobIdle, clearAutoSummaryState) no longer
//      early-return when the helper would have been true.
//   3. autosummary.js no longer imports resolveSentinelEnabled — Sentinel
//      reads its own enable state via autoSettings.js.
//   4. autosummary.js is otherwise intact (mergeability sanity).

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const src = readFileSync(resolve(__dirname, 'autosummary.js'), 'utf8');

test('autosummary.js: still defines isAutoSummaryBlockedBySentinel helper (mergeability)', () => {
    assert.match(
        src,
        /function\s+isAutoSummaryBlockedBySentinel\s*\(\s*\)\s*{/,
        'helper must still be defined for mergeability'
    );
});

test('autosummary.js: isAutoSummaryBlockedBySentinel is now a permanent no-op returning false', () => {
    const fnMatch = src.match(/function\s+isAutoSummaryBlockedBySentinel\s*\(\s*\)\s*{([\s\S]*?)^\}/m);
    assert.ok(fnMatch, 'helper must be defined');
    assert.match(
        fnMatch[1],
        /return\s+false\s*;?/,
        'helper must return false (autosummary is never blocked by sentinel)'
    );
});

test('autosummary.js: no longer imports resolveSentinelEnabled (PHA-1664)', () => {
    // Sentinel reads its own enable state from autoSettings.js, not autosummary.
    assert.doesNotMatch(
        src,
        /import\s*{\s*resolveSentinelEnabled\s*}\s*from\s*['"]\.\/autoSettings\.js['"]/,
        'autosummary.js must NOT import resolveSentinelEnabled anymore'
    );
});

test('autosummary.js: handleAutoSummaryMessageReceived no longer early-returns on the BLOCK', () => {
    const fnMatch = src.match(/export\s+async\s+function\s+handleAutoSummaryMessageReceived\s*\([^)]*\)\s*{([\s\S]*?)^\}/m);
    assert.ok(fnMatch, 'handleAutoSummaryMessageReceived must be defined');
    // The early-return pattern was:
    //     if (isAutoSummaryBlockedBySentinel()) { ... return; }
    // After PHA-1664, the BLOCK guard is removed; the function should not
    // bail at the top with a sentinel-block comment.
    assert.doesNotMatch(
        fnMatch[1],
        /if\s*\(\s*isAutoSummaryBlockedBySentinel\s*\(\s*\)\s*\)\s*{[^}]*return\s*;?/,
        'handleAutoSummaryMessageReceived must not bail on the BLOCK guard'
    );
});

test('autosummary.js: retryAutoSummaryAfterJobIdle no longer early-returns on the BLOCK', () => {
    const fnMatch = src.match(/export\s+async\s+function\s+retryAutoSummaryAfterJobIdle\s*\([^)]*\)\s*{([\s\S]*?)\n\}/m);
    assert.ok(fnMatch, 'retryAutoSummaryAfterJobIdle must be defined');
    assert.doesNotMatch(
        fnMatch[1],
        /if\s*\(\s*isAutoSummaryBlockedBySentinel\s*\(\s*\)\s*\)\s*return\s*;?/,
        'retryAutoSummaryAfterJobIdle must not bail on the BLOCK guard'
    );
});

test('autosummary.js: clearAutoSummaryState no longer early-returns on the BLOCK', () => {
    const fnMatch = src.match(/export\s+function\s+clearAutoSummaryState\s*\([^)]*\)\s*{([\s\S]*?)\n\}/m);
    assert.ok(fnMatch, 'clearAutoSummaryState must be defined');
    assert.doesNotMatch(
        fnMatch[1],
        /if\s*\(\s*isAutoSummaryBlockedBySentinel\s*\(\s*\)\s*\)\s*return\s*;?/,
        'clearAutoSummaryState must not bail on the BLOCK guard'
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