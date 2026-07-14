import assert from 'node:assert/strict';
import test from 'node:test';
import {
    clearDeletedSidePromptSetReferences,
    normalizeDefaultSidePromptSetKeys,
    resolveAfterMemorySidePromptSet,
} from './sidePromptSetDefaults.js';

test('normalizes solo and group default side prompt set keys', () => {
    const settings = {
        defaultSoloSidePromptSetKey: ' solo-set ',
        defaultGroupSidePromptSetKey: null,
    };

    normalizeDefaultSidePromptSetKeys(settings);

    assert.deepEqual(settings, {
        defaultSoloSidePromptSetKey: 'solo-set',
        defaultGroupSidePromptSetKey: '',
    });
});

test('resolves absent chat metadata through the matching solo or group default', () => {
    const settings = {
        defaultSoloSidePromptSetKey: 'solo-set',
        defaultGroupSidePromptSetKey: 'group-set',
    };

    assert.deepEqual(
        resolveAfterMemorySidePromptSet({}, settings, { isGroupChat: false }),
        { setKey: 'solo-set', mode: 'set', source: 'default' },
    );
    assert.deepEqual(
        resolveAfterMemorySidePromptSet({}, settings, { isGroupChat: true }),
        { setKey: 'group-set', mode: 'set', source: 'default' },
    );
});

test('preserves absent, empty, and non-empty per-chat precedence', () => {
    const settings = {
        defaultSoloSidePromptSetKey: 'solo-set',
        defaultGroupSidePromptSetKey: 'group-set',
    };

    assert.deepEqual(
        resolveAfterMemorySidePromptSet({}, settings, { isGroupChat: false }),
        { setKey: 'solo-set', mode: 'set', source: 'default' },
    );
    assert.deepEqual(
        resolveAfterMemorySidePromptSet({ sidePromptAfterMemorySetKey: '' }, settings, { isGroupChat: false }),
        { setKey: '', mode: 'individual', source: 'chat' },
    );
    assert.deepEqual(
        resolveAfterMemorySidePromptSet({ sidePromptAfterMemorySetKey: ' legacy-set ' }, settings, { isGroupChat: true }),
        { setKey: 'legacy-set', mode: 'set', source: 'chat' },
    );
});

test('deleting a set clears matching defaults and makes the current explicit override individual', () => {
    const settings = {
        defaultSoloSidePromptSetKey: 'deleted-set',
        defaultGroupSidePromptSetKey: 'other-set',
    };
    const markers = { sidePromptAfterMemorySetKey: 'deleted-set' };

    assert.deepEqual(
        clearDeletedSidePromptSetReferences(settings, markers, 'deleted-set'),
        { settingsChanged: true, chatChanged: true },
    );
    assert.equal(settings.defaultSoloSidePromptSetKey, '');
    assert.equal(settings.defaultGroupSidePromptSetKey, 'other-set');
    assert.ok(Object.hasOwn(markers, 'sidePromptAfterMemorySetKey'));
    assert.equal(markers.sidePromptAfterMemorySetKey, '');
});

test('deleting a shared global default clears both chat types without creating a chat override', () => {
    const settings = {
        defaultSoloSidePromptSetKey: 'deleted-set',
        defaultGroupSidePromptSetKey: 'deleted-set',
    };
    const markers = {};

    assert.deepEqual(
        clearDeletedSidePromptSetReferences(settings, markers, 'deleted-set'),
        { settingsChanged: true, chatChanged: false },
    );
    assert.equal(settings.defaultSoloSidePromptSetKey, '');
    assert.equal(settings.defaultGroupSidePromptSetKey, '');
    assert.ok(!Object.hasOwn(markers, 'sidePromptAfterMemorySetKey'));
});
