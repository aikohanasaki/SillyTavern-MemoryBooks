// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import test from 'node:test';
import {
    ensureCharacterMemoryBookLocks,
    getCharacterMemoryBookLock,
    getCharacterMemoryBookLockStatus,
    moveCharacterMemoryBookLock,
    normalizeCharacterMemoryBookLocks,
    refreshCharacterMemoryBookLockName,
    removeCharacterMemoryBookLock,
    resolveManualGroupCharacterBindings,
    resolveManualLorebookForCharacter,
    setCharacterMemoryBookLock,
} from './characterMemoryBookLocks.js';

test('normalizes lock records without conflating duplicate display names', () => {
    const result = normalizeCharacterMemoryBookLocks({
        'alice-one.png': { characterName: ' Alice ', lorebookName: ' Book One ' },
        'alice-two.png': { characterName: 'Alice', lorebookName: 'Book Two' },
        broken: { characterName: 'Broken', lorebookName: '' },
    });
    assert.equal(result.changed, true);
    assert.deepEqual(result.locks, {
        'alice-one.png': { characterName: 'Alice', lorebookName: 'Book One' },
        'alice-two.png': { characterName: 'Alice', lorebookName: 'Book Two' },
    });
});

test('ensures a settings registry and supports lock lifecycle changes', () => {
    const settings = {};
    const ensured = ensureCharacterMemoryBookLocks(settings);
    assert.equal(ensured.changed, true);
    assert.deepEqual(settings.characterMemoryBookLocks, {});

    const locks = settings.characterMemoryBookLocks;
    assert.equal(setCharacterMemoryBookLock(locks, 'alice.png', 'Alice', 'Alice Book'), true);
    assert.equal(refreshCharacterMemoryBookLockName(locks, 'alice.png', 'Alice Renamed'), true);
    assert.equal(moveCharacterMemoryBookLock(locks, 'alice.png', 'alice-renamed.png'), true);
    assert.deepEqual(getCharacterMemoryBookLock(locks, 'alice-renamed.png'), {
        characterKey: 'alice-renamed.png',
        characterName: 'Alice Renamed',
        lorebookName: 'Alice Book',
    });
    assert.equal(removeCharacterMemoryBookLock(locks, 'alice-renamed.png'), true);
    assert.equal(getCharacterMemoryBookLock(locks, 'alice-renamed.png'), null);
});

test('solo manual resolution gives a lock precedence and ignores it outside manual solo mode', () => {
    const input = {
        manualModeEnabled: true,
        isGroupChat: false,
        characterKey: 'alice.png',
        manualLorebook: 'Chat Book',
        locks: { 'alice.png': { characterName: 'Alice', lorebookName: 'Locked Book' } },
    };
    assert.equal(resolveManualLorebookForCharacter(input).lorebookName, 'Locked Book');
    assert.equal(resolveManualLorebookForCharacter(input).source, 'character-lock');
    assert.equal(resolveManualLorebookForCharacter({ ...input, manualModeEnabled: false }).lorebookName, 'Chat Book');
    assert.equal(resolveManualLorebookForCharacter({ ...input, isGroupChat: true }).lorebookName, 'Chat Book');
});

test('reports a missing locked book as broken without deleting or falling back', () => {
    const locks = { 'alice.png': { characterName: 'Alice', lorebookName: 'Deleted Book' } };
    assert.deepEqual(getCharacterMemoryBookLockStatus(locks, 'alice.png', ['Other Book']), {
        state: 'broken',
        lock: {
            characterKey: 'alice.png',
            characterName: 'Alice',
            lorebookName: 'Deleted Book',
        },
    });
    assert.equal(locks['alice.png'].lorebookName, 'Deleted Book');
});

test('group resolution gives global locks precedence without mutating chat bindings', () => {
    const chatBindings = { 'alice.png': 'Chat Alice', 'bob.png': 'Chat Bob' };
    const result = resolveManualGroupCharacterBindings({
        manualModeEnabled: true,
        members: [
            { key: 'alice.png', avatar: 'alice.png' },
            { key: 'bob.png', avatar: 'bob.png' },
        ],
        chatBindings,
        locks: { 'alice.png': { characterName: 'Alice', lorebookName: 'Global Alice' } },
    });
    assert.deepEqual(result.bindings, {
        'alice.png': 'Global Alice',
        'bob.png': 'Chat Bob',
    });
    assert.equal(result.locksByMemberKey['alice.png'].lorebookName, 'Global Alice');
    assert.deepEqual(chatBindings, { 'alice.png': 'Chat Alice', 'bob.png': 'Chat Bob' });
});

test('resolved snapshots do not change when the live registry changes', () => {
    const locks = { 'alice.png': { characterName: 'Alice', lorebookName: 'First Book' } };
    const snapshot = resolveManualGroupCharacterBindings({
        manualModeEnabled: true,
        members: [{ key: 'alice.png', avatar: 'alice.png' }],
        chatBindings: {},
        locks,
    });
    locks['alice.png'].lorebookName = 'Second Book';
    assert.equal(snapshot.bindings['alice.png'], 'First Book');
    assert.equal(snapshot.locksByMemberKey['alice.png'].lorebookName, 'First Book');
});

test('preserves prototype-like avatar keys as serializable own records', () => {
    const locks = {};
    assert.equal(setCharacterMemoryBookLock(locks, '__proto__', 'Prototype', 'Prototype Book'), true);
    assert.equal(Object.hasOwn(locks, '__proto__'), true);
    assert.equal(
        JSON.stringify(locks),
        '{"__proto__":{"characterName":"Prototype","lorebookName":"Prototype Book"}}',
    );
    assert.equal(getCharacterMemoryBookLock(locks, '__proto__').lorebookName, 'Prototype Book');
});
