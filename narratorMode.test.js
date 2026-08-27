// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import test from 'node:test';
import {
    buildNarratorCopyTargets,
    collectNarratorSourceMetadata,
    createNarratorMember,
    getNarratorCastFromMessage,
    getNarratorParticipantNames,
    getNarratorSceneParticipants,
    isNarratorModeActive,
    mergeNarratorLorebookEntries,
    normalizeNarratorConfig,
    setNarratorActiveCast,
    stampNarratorCast,
    validateNarratorBindings,
} from './narratorMode.js';

test('normalizes active cast and preserves stable member ids', () => {
    const source = {
        version: 1,
        enabled: true,
        members: [{ id: 'alice-id', avatar: 'alice.png', name: 'Alice', lorebookName: 'Alice Memory' }],
        activeCastIds: ['alice-id', 'missing-id'],
    };
    const { config, changed } = normalizeNarratorConfig(source, { knownAvatars: new Set(['alice.png']) });
    assert.equal(changed, true);
    assert.deepEqual(config.activeCastIds, ['alice-id']);
    assert.equal(config.members[0].id, 'alice-id');
});

test('requires manual mode before narrator mode becomes active', () => {
    assert.equal(isNarratorModeActive({ enabled: true, manualModeEnabled: false }), false);
    assert.equal(isNarratorModeActive({ enabled: true, manualModeEnabled: true }), true);
    assert.equal(isNarratorModeActive({ enabled: true, manualModeEnabled: true, isGroupChat: true }), false);
});

test('creates ids and rejects duplicate or canonical books', () => {
    const alice = createNarratorMember({ avatar: 'alice.png', name: 'Alice', lorebookName: 'Memory A' }, () => 'alice-id');
    const bob = createNarratorMember({ avatar: 'bob.png', name: 'Bob', lorebookName: 'Memory A' }, () => 'bob-id');
    assert.equal(alice.id, 'alice-id');
    let result = validateNarratorBindings({ members: [alice, bob] }, 'Group Memory', ['Memory A']);
    assert.equal(result.valid, false);
    assert.equal(result.issues[0].type, 'duplicate');
    bob.lorebookName = 'Group Memory';
    result = validateNarratorBindings({ members: [alice, bob] }, 'Group Memory', ['Memory A', 'Group Memory']);
    assert.equal(result.issues[0].type, 'canonical');
});

test('sanitizes active cast against non-retired members', () => {
    const config = {
        members: [
            { id: 'a', retired: false },
            { id: 'b', retired: true },
        ],
        activeCastIds: [],
    };
    assert.equal(setNarratorActiveCast(config, ['b', 'a', 'missing']), true);
    assert.deepEqual(config.activeCastIds, ['a']);
});

test('retirement preserves identity and does not permit lorebook reuse', () => {
    const retired = { id: 'old', avatar: 'old.png', name: 'Old', lorebookName: 'Old Book', retired: true };
    const replacement = { id: 'new', avatar: 'new.png', name: 'New', lorebookName: 'Old Book', retired: false };
    const normalized = normalizeNarratorConfig({ version: 1, members: [retired], activeCastIds: ['old'] });
    assert.equal(normalized.config.members[0].id, 'old');
    assert.deepEqual(normalized.config.activeCastIds, []);
    assert.equal(validateNarratorBindings({ members: [retired, replacement] }, 'Canonical', ['Old Book']).issues[0].type, 'duplicate');
});

test('accepts write-in characters without character-card avatars', () => {
    const source = {
        version: 1,
        members: [{ id: 'alice-id', name: 'Alice', lorebookName: 'Alice Book' }],
        activeCastIds: [],
    };
    const { config } = normalizeNarratorConfig(source);
    assert.equal(config.members[0].id, 'alice-id');
    assert.equal(config.members[0].name, 'Alice');
    assert.equal(config.members[0].avatar, '');
});

test('stores independent cast metadata in active swipe and merges continuations', () => {
    const message = { extra: {}, swipe_id: 1, swipe_info: [{ extra: {} }, { extra: {} }] };
    stampNarratorCast(message, ['alice']);
    assert.deepEqual(getNarratorCastFromMessage(message), ['alice']);
    assert.deepEqual(message.swipe_info[1].extra.STMemoryBooks.narratorCast.memberIds, ['alice']);
    assert.equal(message.swipe_info[0].extra.STMemoryBooks, undefined);
    stampNarratorCast(message, ['bob'], { merge: true });
    assert.deepEqual(getNarratorCastFromMessage(message), ['alice', 'bob']);
});

test('uses narrator responses as authoritative scene participants', () => {
    const user = { is_user: true, extra: {} };
    const narrator = { is_user: false, is_system: false, extra: {} };
    stampNarratorCast(user, ['old-cast']);
    stampNarratorCast(narrator, ['alice', 'clara']);
    assert.deepEqual(getNarratorSceneParticipants([user, narrator]), {
        memberIds: ['alice', 'clara'],
        hasUntaggedMessages: false,
    });
    assert.equal(getNarratorSceneParticipants([narrator, { is_user: false }]).hasUntaggedMessages, true);
});

test('uses user snapshots as continuity when a narrator message is untagged', () => {
    const messages = [
        { is_user: true, extra: { STMemoryBooks: { narratorCast: { version: 1, memberIds: ['a'] } } } },
        { is_user: false, extra: {} },
    ];
    assert.deepEqual(getNarratorSceneParticipants(messages), {
        memberIds: ['a'],
        hasUntaggedMessages: true,
    });
});

test('maps the selected Narrator cast to display names in selection order', () => {
    const config = { members: [
        { id: 'alice', name: 'Alice' },
        { id: 'bob', name: 'Bob' },
    ] };
    assert.deepEqual(getNarratorParticipantNames(config, ['bob', 'missing', 'alice', 'bob']), ['Bob', 'Alice']);
    assert.deepEqual(getNarratorParticipantNames(config, []), []);
});

test('builds copy targets only for selected members', () => {
    const config = { members: [
        { id: 'a', name: 'Alice', lorebookName: 'A' },
        { id: 'b', name: 'Bob', lorebookName: 'B' },
    ] };
    assert.deepEqual(buildNarratorCopyTargets(config, ['b']).map(target => target.lorebookName), ['B']);
});

test('merges prompt-local lorebook clones without duplicates or source mutation', () => {
    const source = { entries: { 1: { uid: 1, content: 'A' } } };
    const target = [];
    const keys = new Set();
    mergeNarratorLorebookEntries(target, source, 'Alice', keys);
    mergeNarratorLorebookEntries(target, source, 'Alice', keys);
    assert.equal(target.length, 1);
    target[0].content = 'changed';
    assert.equal(source.entries[1].content, 'A');
});

test('carries narrator ownership and participants through consolidation sources', () => {
    const metadata = collectNarratorSourceMetadata([
        { uid: 1, STMB_narratorOwnerIds: ['alice'] },
        { uid: 2, STMB_narratorOwnerIds: ['alice'], STMB_narratorParticipantIds: ['alice', 'bob'] },
        { uid: 3, STMB_narratorParticipantIds: ['ignored'] },
    ], ['1', '2']);
    assert.deepEqual(metadata, {
        STMB_narratorOwnerIds: ['alice'],
        STMB_narratorParticipantIds: ['alice', 'bob'],
    });
});
