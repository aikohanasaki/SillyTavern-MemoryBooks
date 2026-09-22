// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import { loadExtensionModule, identityTranslate } from './test-support/extension-harness.js';

async function autoCreateHarness({ created = true, failSave = false } = {}) {
    const metadata = { unrelated: { preserve: true } };
    const saved = [];
    const indicators = [new Set(), new Set()];
    const module = await loadExtensionModule('autocreate.js', {
        values: {
            getCurrentChatId: () => 'Test chat', name1: 'User', name2: 'Alex',
            chat_metadata: metadata, METADATA_KEY: 'world_info', world_names: [],
            translate: identityTranslate,
            createNewWorldInfo: async () => created,
            saveMetadata: async () => {
                if (failSave) throw new Error('Metadata save failed');
                saved.push(structuredClone(metadata));
            },
        },
        globals: {
            toastr: { success() {} },
            $: selector => {
                assert.equal(selector, '.chat_lorebook_button');
                return { addClass: name => indicators.forEach(classes => classes.add(name)) };
            },
        },
    });
    return { module, metadata, saved, indicators };
}

test('auto-created chat lorebook updates both assignment indicators without a chat reload', async () => {
    const { module, metadata, saved, indicators } = await autoCreateHarness();
    const result = await module.autoCreateLorebook('LTM - {{char}} - {{chat}}');
    assert.equal(result.success, true);
    assert.equal(metadata.world_info, 'LTM - Alex - Test chat');
    assert.deepEqual(saved, [{ unrelated: { preserve: true }, world_info: metadata.world_info }]);
    assert.ok(indicators.every(classes => classes.has('world_set')));
});

test('failed lorebook creation or metadata save does not show a successful assignment', async () => {
    for (const options of [{ created: false }, { failSave: true }]) {
        const { module, saved, indicators } = await autoCreateHarness(options);
        const result = await module.autoCreateLorebook('LTM - {{chat}}');
        assert.equal(result.success, false);
        assert.equal(saved.length, 0);
        assert.ok(indicators.every(classes => !classes.has('world_set')));
    }
});
