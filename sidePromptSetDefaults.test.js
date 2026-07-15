import assert from 'node:assert/strict';
import test from 'node:test';
import {
    clearDeletedSidePromptSetReferences,
    filterAutomaticSidePromptSetItems,
    normalizeDefaultSidePromptSetKeys,
    resolveAfterMemorySidePromptSet,
    resolveAutomaticSidePromptSet,
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
    assert.deepEqual(
        resolveAutomaticSidePromptSet({}, settings, { isGroupChat: false }),
        { setKey: 'solo-set', mode: 'set', source: 'default' },
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

test('filters automatic set rows by enabled trigger while preserving row order', () => {
    const afterMemory = {
        id: 'after',
        baseTpl: {
            enabled: true,
            triggers: { onAfterMemory: { enabled: true } },
        },
    };
    const intervalOnly = {
        id: 'interval',
        baseTpl: {
            enabled: true,
            triggers: { onInterval: { visibleMessages: 12 } },
        },
    };
    const disabledInterval = {
        id: 'disabled-interval',
        baseTpl: {
            enabled: false,
            triggers: {
                onAfterMemory: { enabled: true },
                onInterval: { visibleMessages: 12 },
            },
        },
    };
    const invalidInterval = {
        id: 'invalid-interval',
        baseTpl: {
            enabled: true,
            triggers: { onInterval: { visibleMessages: 0 } },
        },
    };
    const both = {
        id: 'both',
        baseTpl: {
            enabled: true,
            triggers: {
                onAfterMemory: { enabled: true },
                onInterval: { visibleMessages: 25 },
            },
        },
    };
    const effectiveTemplateOnly = {
        id: 'effective-template-only',
        tpl: {
            enabled: true,
            triggers: { onInterval: { visibleMessages: 5 } },
        },
    };
    const rows = [afterMemory, intervalOnly, disabledInterval, invalidInterval, both, effectiveTemplateOnly];

    assert.deepEqual(
        filterAutomaticSidePromptSetItems(rows, 'onAfterMemory').map(item => item.id),
        ['after', 'both'],
    );
    assert.deepEqual(
        filterAutomaticSidePromptSetItems(rows, 'onInterval').map(item => item.id),
        ['interval', 'both', 'effective-template-only'],
    );
    assert.deepEqual(filterAutomaticSidePromptSetItems(rows, 'manual'), []);
});
