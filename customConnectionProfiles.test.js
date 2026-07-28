// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import test from 'node:test';
import {
    isCustomConnectionProfile,
    listCustomConnectionProfiles,
    resolveCustomConnectionProfile,
} from './customConnectionProfiles.js';

const connectApiMap = {
    custom: { selected: 'openai', source: 'custom' },
    openai: { selected: 'openai', source: 'openai' },
    koboldcpp: { selected: 'textgenerationwebui', type: 'koboldcpp' },
};

test('recognizes only Custom Chat Completion connection profiles', () => {
    assert.equal(isCustomConnectionProfile({ id: 'a', api: 'custom', mode: 'cc' }, connectApiMap), true);
    assert.equal(isCustomConnectionProfile({ id: 'b', api: 'openai', mode: 'cc' }, connectApiMap), false);
    assert.equal(isCustomConnectionProfile({ id: 'c', api: 'koboldcpp', mode: 'tc' }, connectApiMap), false);
    assert.equal(isCustomConnectionProfile({ id: 'd', api: 'custom', mode: 'cc' }), true);
});

test('lists named Custom profiles alphabetically and ignores profiles without IDs', () => {
    const profiles = [
        { id: 'z', name: 'Zulu', api: 'custom', mode: 'cc' },
        { id: 'a', name: 'Alpha', api: 'custom', mode: 'cc' },
        { name: 'No ID', api: 'custom', mode: 'cc' },
        { id: 'o', name: 'OpenAI', api: 'openai', mode: 'cc' },
    ];

    assert.deepEqual(
        listCustomConnectionProfiles(profiles, connectApiMap).map(profile => profile.id),
        ['a', 'z'],
    );
});

test('resolves a Custom profile URL and secret without exposing a raw key', () => {
    const profiles = [{
        id: 'memory-profile',
        name: 'Memory API',
        api: 'custom',
        mode: 'cc',
        model: 'connection-model',
        'api-url': 'https://memory.example/v1/',
        'secret-id': 'secret-uuid',
    }];

    assert.deepEqual(
        resolveCustomConnectionProfile(profiles, 'memory-profile', connectApiMap),
        {
            id: 'memory-profile',
            name: 'Memory API',
            model: 'connection-model',
            customUrl: 'https://memory.example/v1',
            secretId: 'secret-uuid',
        },
    );
});

test('returns null for an empty, missing, or non-Custom profile selection', () => {
    const profiles = [
        { id: 'openai-profile', name: 'OpenAI', api: 'openai', mode: 'cc' },
    ];

    assert.equal(resolveCustomConnectionProfile(profiles, '', connectApiMap), null);
    assert.equal(resolveCustomConnectionProfile(profiles, 'missing', connectApiMap), null);
    assert.equal(resolveCustomConnectionProfile(profiles, 'openai-profile', connectApiMap), null);
});

test('preserves keyless Custom profiles without inventing a secret ID', () => {
    const profiles = [{
        id: 'local-profile',
        name: 'Local API',
        api: 'custom',
        mode: 'cc',
        model: 'local-model',
        'api-url': 'http://localhost:1234/v1',
    }];

    assert.deepEqual(
        resolveCustomConnectionProfile(profiles, 'local-profile'),
        {
            id: 'local-profile',
            name: 'Local API',
            model: 'local-model',
            customUrl: 'http://localhost:1234/v1',
        },
    );
});
