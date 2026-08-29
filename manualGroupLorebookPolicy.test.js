// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import test from 'node:test';
import {
    buildManualGroupRoleMetadata,
    filterManualGroupEntriesForRole,
    getEntrySourceCanonicalNumbers,
    getManualGroupMemoryRole,
    getManualGroupSpeakerLorebook,
} from './manualGroupLorebookPolicy.js';

test('resolves explicit and legacy manual-group memory roles', () => {
    assert.equal(getManualGroupMemoryRole({ STMB_memoryRole: 'group', STMB_canonical: false }), 'group');
    assert.equal(getManualGroupMemoryRole({ STMB_memoryRole: 'character', STMB_canonical: true }), 'character');
    assert.equal(getManualGroupMemoryRole({ STMB_canonical: true }), 'group');
    assert.equal(getManualGroupMemoryRole({ STMB_canonical: false }), 'character');
    assert.equal(getManualGroupMemoryRole({}), '');
});

test('separates same-lorebook group and character consolidation streams', () => {
    const group = { uid: 1, STMB_memoryRole: 'group' };
    const alice = {
        uid: 2,
        STMB_memoryRole: 'character',
        characterFilter: { names: ['alice'] },
    };
    const bob = {
        uid: 3,
        STMB_canonical: false,
        characterFilter: { names: ['bob'] },
    };
    const legacy = { uid: 4 };
    const entries = [group, alice, bob, legacy];

    assert.deepEqual(
        filterManualGroupEntriesForRole(entries, { role: 'group', sameLorebook: true }),
        [group, legacy],
    );
    assert.deepEqual(
        filterManualGroupEntriesForRole(entries, {
            role: 'character',
            sameLorebook: true,
            members: [{ characterFilterName: 'alice' }],
        }),
        [alice],
    );
});

test('leaves distinct lorebook streams unchanged for compatibility', () => {
    const entries = [{ uid: 1 }, { uid: 2, STMB_canonical: false }];
    assert.deepEqual(
        filterManualGroupEntriesForRole(entries, { role: 'character', sameLorebook: false }),
        entries,
    );
    assert.notEqual(
        filterManualGroupEntriesForRole(entries, { role: 'character', sameLorebook: false }),
        entries,
    );
});

test('prioritizes only same-book character copies on request', () => {
    assert.deepEqual(buildManualGroupRoleMetadata('group'), { STMB_memoryRole: 'group' });
    assert.deepEqual(buildManualGroupRoleMetadata('character'), { STMB_memoryRole: 'character' });
    assert.deepEqual(
        buildManualGroupRoleMetadata('character', { prioritizeCharacter: true }),
        { STMB_memoryRole: 'character', groupOverride: true },
    );
});

test('resolves the speaking native group member from a generation snapshot', () => {
    const snapshot = {
        members: [
            { key: 'alice.png', avatar: 'alice.png' },
            { key: 'bob.webp', avatar: 'bob.webp' },
        ],
        bindings: {
            'alice.png': 'Group Memory',
            'bob.webp': 'Bob Memory',
        },
    };
    assert.equal(getManualGroupSpeakerLorebook(snapshot, 'alice.png'), 'Group Memory');
    assert.equal(getManualGroupSpeakerLorebook(snapshot, 'bob.webp'), 'Bob Memory');
    assert.equal(getManualGroupSpeakerLorebook(snapshot, 'cara.png'), '');
});

test('traces consolidated entries back to shared canonical memory numbers', () => {
    const lorebookData = {
        entries: {
            1: { uid: 1, STMB_canonicalMemoryNumber: 7 },
            2: { uid: 2, STMB_canonicalMemoryNumber: 8 },
            3: { uid: 3, stmbSourceEntryUids: ['1', '2'] },
            4: { uid: 4, stmbSourceEntryUids: ['3'] },
        },
    };
    assert.deepEqual(getEntrySourceCanonicalNumbers(lorebookData.entries[4], lorebookData), [7, 8]);
    assert.deepEqual(getEntrySourceCanonicalNumbers({ uid: 5, comment: '[012] Legacy' }, lorebookData), [12]);
});
