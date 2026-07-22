// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// sceneCharacterFilter.test.js — Unit tests for per-scene character presence filtering.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
    getPresentCharacterNames,
    getBoundCharacterName,
    filterRunItemsByScenePresence,
    formatSkippedScenePresenceLog,
} from './sceneCharacterFilter.js';

// ----------------------------------------------------------------------------
// getPresentCharacterNames
// ----------------------------------------------------------------------------

test('getPresentCharacterNames prefers metadata.characterFilterNames when present', () => {
    const scene = {
        metadata: { characterFilterNames: ['Alice', 'Bob'] },
        messages: [{ name: 'Someone Else', is_user: false }],
    };
    assert.deepEqual(getPresentCharacterNames(scene), ['Alice', 'Bob']);
});

test('getPresentCharacterNames falls back to cheap name-scan when no metadata names', () => {
    const scene = {
        metadata: {},
        messages: [
            { name: 'Brandon', is_user: true },
            { name: 'Narrator', is_user: false },
            { name: 'Grondulf', is_user: false },
            { name: 'Narrator', is_user: false }, // dup, should collapse
        ],
    };
    assert.deepEqual(getPresentCharacterNames(scene), ['Narrator', 'Grondulf']);
});

test('getPresentCharacterNames falls back when characterFilterNames is empty array', () => {
    const scene = {
        metadata: { characterFilterNames: [] },
        messages: [{ name: 'Bob', is_user: false }],
    };
    assert.deepEqual(getPresentCharacterNames(scene), ['Bob']);
});

test('getPresentCharacterNames handles missing/malformed compiledScene gracefully', () => {
    assert.deepEqual(getPresentCharacterNames(null), []);
    assert.deepEqual(getPresentCharacterNames({}), []);
    assert.deepEqual(getPresentCharacterNames({ messages: null }), []);
});

test('getPresentCharacterNames excludes user messages in cheap scan', () => {
    const scene = {
        messages: [
            { name: 'Brandon', is_user: true },
            { name: 'Brandon', is_user: true },
        ],
    };
    assert.deepEqual(getPresentCharacterNames(scene), []);
});

test('getPresentCharacterNames dedupes metadata names case-sensitively (exact string match)', () => {
    const scene = { metadata: { characterFilterNames: ['Alice', 'Alice', ' Bob ', 'Bob'] } };
    // Note: dedupeNames trims but is case-sensitive; ' Bob ' -> 'Bob' collapses with 'Bob'
    assert.deepEqual(getPresentCharacterNames(scene), ['Alice', 'Bob']);
});

// ----------------------------------------------------------------------------
// getBoundCharacterName
// ----------------------------------------------------------------------------

test('getBoundCharacterName extracts {{char}} from runtimeMacros', () => {
    const runItem = { runtimeMacros: { '{{char}}': 'Alice' } };
    assert.equal(getBoundCharacterName(runItem), 'Alice');
});

test('getBoundCharacterName returns null when no {{char}} macro present', () => {
    assert.equal(getBoundCharacterName({ runtimeMacros: {} }), null);
    assert.equal(getBoundCharacterName({ runtimeMacros: { '{{other}}': 'x' } }), null);
    assert.equal(getBoundCharacterName({}), null);
    assert.equal(getBoundCharacterName(null), null);
});

test('getBoundCharacterName returns null for whitespace-only binding', () => {
    assert.equal(getBoundCharacterName({ runtimeMacros: { '{{char}}': '   ' } }), null);
});

test('getBoundCharacterName trims the value', () => {
    assert.equal(getBoundCharacterName({ runtimeMacros: { '{{char}}': '  Alice  ' } }), 'Alice');
});

// ----------------------------------------------------------------------------
// filterRunItemsByScenePresence
// ----------------------------------------------------------------------------

test('filterRunItemsByScenePresence passes through non-character-scoped items unfiltered', () => {
    const runItems = [
        { name: 'Plotpoints', runtimeMacros: {} },
        { name: 'Tracker', runtimeMacros: { '{{other}}': 'x' } },
    ];
    const scene = { metadata: { characterFilterNames: [] } };
    const { runnable, skipped } = filterRunItemsByScenePresence(runItems, scene);
    assert.equal(runnable.length, 2);
    assert.equal(skipped.length, 0);
});

test('filterRunItemsByScenePresence keeps character-scoped items whose character is present', () => {
    const runItems = [
        { name: 'Alice status', runtimeMacros: { '{{char}}': 'Alice' } },
        { name: 'Bob status', runtimeMacros: { '{{char}}': 'Bob' } },
    ];
    const scene = { metadata: { characterFilterNames: ['Alice'] } };
    const { runnable, skipped } = filterRunItemsByScenePresence(runItems, scene);
    assert.equal(runnable.length, 1);
    assert.equal(runnable[0].name, 'Alice status');
    assert.equal(skipped.length, 1);
    assert.equal(skipped[0].characterName, 'Bob');
});

test('filterRunItemsByScenePresence is case-insensitive for character matching', () => {
    const runItems = [{ name: 'x', runtimeMacros: { '{{char}}': 'alice' } }];
    const scene = { metadata: { characterFilterNames: ['Alice'] } };
    const { runnable } = filterRunItemsByScenePresence(runItems, scene);
    assert.equal(runnable.length, 1);
});

test('filterRunItemsByScenePresence handles empty run items list', () => {
    const { runnable, skipped } = filterRunItemsByScenePresence([], { metadata: {} });
    assert.deepEqual(runnable, []);
    assert.deepEqual(skipped, []);
});

test('filterRunItemsByScenePresence handles non-array runItems gracefully', () => {
    const { runnable, skipped } = filterRunItemsByScenePresence(null, { metadata: {} });
    assert.deepEqual(runnable, []);
    assert.deepEqual(skipped, []);
});

test('filterRunItemsByScenePresence with mixed scoped and unscoped items', () => {
    const runItems = [
        { name: 'Plotpoints', runtimeMacros: {} },
        { name: 'Alice status', runtimeMacros: { '{{char}}': 'Alice' } },
        { name: 'Missing char status', runtimeMacros: { '{{char}}': 'Zorg' } },
        { name: 'Tracker', runtimeMacros: { '{{user}}': 'Brandon' } },
    ];
    const scene = { metadata: { characterFilterNames: ['Alice', 'Grondulf'] } };
    const { runnable, skipped } = filterRunItemsByScenePresence(runItems, scene);
    assert.equal(runnable.length, 3); // Plotpoints, Alice status, Tracker
    assert.equal(skipped.length, 1); // Missing char status (Zorg not present)
    assert.equal(skipped[0].characterName, 'Zorg');
});

// ----------------------------------------------------------------------------
// formatSkippedScenePresenceLog
// ----------------------------------------------------------------------------

test('formatSkippedScenePresenceLog returns empty string for no skipped items', () => {
    assert.equal(formatSkippedScenePresenceLog([]), '');
    assert.equal(formatSkippedScenePresenceLog(null), '');
});

test('formatSkippedScenePresenceLog formats a readable summary', () => {
    const skipped = [
        { runItem: {}, characterName: 'Bob' },
        { runItem: {}, characterName: 'Zorg' },
    ];
    const line = formatSkippedScenePresenceLog(skipped);
    assert.match(line, /Skipped 2/);
    assert.match(line, /Bob/);
    assert.match(line, /Zorg/);
});
