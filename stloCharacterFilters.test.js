// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import test from 'node:test';
import {
    applyStloCharacterFilters,
    collectStloCharacterFilterTargets,
} from './stloCharacterFilters.js';

test('creates minimal STLO metadata with neutral effective defaults', () => {
    const lorebook = { entries: {} };

    const result = applyStloCharacterFilters(lorebook, [' Alice ', 'Alice', '', 'Bob']);

    assert.deepEqual(lorebook.stlo, {
        characterOverrides: {
            Alice: { priority: 3, orderAdjustment: 0 },
            Bob: { priority: 3, orderAdjustment: 0 },
        },
        onlyWhenSpeaking: true,
    });
    assert.deepEqual(result, {
        changed: true,
        addedNames: ['Alice', 'Bob'],
        characterNames: ['Alice', 'Bob'],
    });
});

test('mirrors explicit lorebook priority and order adjustment for new overrides', () => {
    const lorebook = {
        stlo: {
            priority: 1,
            orderAdjustment: -250,
            budgetMode: 'fixed',
            budget: 5000,
        },
    };

    applyStloCharacterFilters(lorebook, ['Alice']);

    assert.deepEqual(lorebook.stlo.characterOverrides.Alice, {
        priority: 1,
        orderAdjustment: -250,
    });
    assert.equal(lorebook.stlo.budgetMode, 'fixed');
    assert.equal(lorebook.stlo.budget, 5000);
});

test('preserves existing character overrides verbatim while enabling speaking filters', () => {
    const existing = { priority: 5, orderAdjustment: 700, custom: true };
    const lorebook = {
        stlo: {
            priority: 2,
            characterOverrides: { Alice: existing },
            onlyWhenSpeaking: false,
        },
    };

    const result = applyStloCharacterFilters(lorebook, ['Alice']);

    assert.strictEqual(lorebook.stlo.characterOverrides.Alice, existing);
    assert.deepEqual(existing, { priority: 5, orderAdjustment: 700, custom: true });
    assert.equal(lorebook.stlo.onlyWhenSpeaking, true);
    assert.deepEqual(result.addedNames, []);
    assert.equal(result.changed, true);
});

test('is idempotent after filters are synchronized', () => {
    const lorebook = { entries: {} };
    applyStloCharacterFilters(lorebook, ['Alice']);

    const result = applyStloCharacterFilters(lorebook, ['Alice']);

    assert.equal(result.changed, false);
    assert.deepEqual(result.addedNames, []);
});

test('stores __proto__ as a serializable own override and remains idempotent', () => {
    const lorebook = { entries: {} };

    const firstResult = applyStloCharacterFilters(lorebook, ['__proto__']);

    assert.equal(Object.prototype.hasOwnProperty.call(lorebook.stlo.characterOverrides, '__proto__'), true);
    assert.deepEqual(lorebook.stlo.characterOverrides.__proto__, {
        priority: 3,
        orderAdjustment: 0,
    });
    assert.deepEqual(JSON.parse(JSON.stringify(lorebook)).stlo.characterOverrides.__proto__, {
        priority: 3,
        orderAdjustment: 0,
    });
    assert.deepEqual(firstResult.addedNames, ['__proto__']);

    const secondResult = applyStloCharacterFilters(lorebook, ['__proto__']);

    assert.equal(secondResult.changed, false);
    assert.deepEqual(secondResult.addedNames, []);
});

test('rejects malformed STLO containers without replacing them', () => {
    const malformedStlo = { stlo: 'invalid' };
    assert.throws(
        () => applyStloCharacterFilters(malformedStlo, ['Alice']),
        /STLO metadata must be an object/,
    );
    assert.equal(malformedStlo.stlo, 'invalid');

    const malformedOverrides = { stlo: { characterOverrides: [] } };
    assert.throws(
        () => applyStloCharacterFilters(malformedOverrides, ['Alice']),
        /characterOverrides metadata must be an object/,
    );
    assert.deepEqual(malformedOverrides.stlo.characterOverrides, []);
});

test('groups shared lorebooks and reports canonical conflicts', () => {
    const members = [
        { key: 'alice.png', characterFilterName: 'alice', name: 'Alice' },
        { key: 'bob.webp', characterFilterName: 'bob', name: 'Bob' },
        { key: 'cara.png', characterFilterName: 'cara', name: 'Cara' },
    ];
    const bindings = {
        'alice.png': 'Shared Memory',
        'bob.webp': 'Shared Memory',
        'cara.png': 'Group Memory',
    };

    const result = collectStloCharacterFilterTargets(members, bindings, {
        canonicalLorebookName: 'Group Memory',
    });

    assert.equal(result.targets.length, 1);
    assert.equal(result.targets[0].lorebookName, 'Shared Memory');
    assert.deepEqual(result.targets[0].characterNames, ['alice', 'bob']);
    assert.deepEqual(result.targets[0].members, members.slice(0, 2));
    assert.deepEqual(result.conflicts, [{ member: members[2], lorebookName: 'Group Memory' }]);
});
