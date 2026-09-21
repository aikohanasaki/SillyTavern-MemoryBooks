// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import { RELATIONSHIP_DEFAULTS } from './relationshipPromptDefaults.js';
import { migrateRelationshipPrompts, needsRelationshipPromptReview, saveRelationshipDocument } from './relationshipPromptMigration.js';

const legacy = JSON.parse(readFileSync(new URL('./test-fixtures/legacy-status-prompts.json', import.meta.url), 'utf8'));
const template = (fields = {}) => ({ key: 'status', name: 'My Status', enabled: true,
    prompt: legacy[0].prompt, responseFormat: legacy[0].responseFormat,
    settings: { overrideProfileEnabled: true, overrideProfileIndex: 3, previousMemoriesCount: 6,
        lorebook: { targetLorebookName: 'Personal book', position: 3, entryTitleOverride: '{{char}} facts' } },
    triggers: { commands: ['sideprompt'], onInterval: { visibleMessages: 17 }, onAfterMemory: { enabled: true } },
    customField: { preserve: true }, createdAt: 'original', updatedAt: 'original', ...fields });
const document = tpl => ({ version: 2, customRoot: 'preserve', prompts: { [tpl.key]: tpl, inventory: { key: 'inventory', prompt: 'Track inventory.', responseFormat: 'Items' } },
    sets: { pair: { key: 'pair', items: [{ id: '1', promptKey: tpl.key, runtimeMacros: { '{{subject}}': 'Morgan' } }] } } });

for (const [i, fixture] of legacy.entries()) {
    test(`migrates legacy locale ${fixture.locale} (${fixture.source}) with all settings preserved`, async () => {
        const before = document(template({ key: `custom-copy-${i}`, prompt: fixture.prompt, responseFormat: fixture.responseFormat }));
        const original = structuredClone(before);
        const result = await migrateRelationshipPrompts(before);
        const after = result.doc.prompts[`custom-copy-${i}`];
        assert.equal(after.prompt, RELATIONSHIP_DEFAULTS[fixture.locale].prompt);
        assert.equal(after.responseFormat, RELATIONSHIP_DEFAULTS[fixture.locale].responseFormat);
        assert.deepEqual({ ...after, prompt: fixture.prompt, responseFormat: fixture.responseFormat, relationshipPromptVersion: undefined },
            { ...original.prompts[`custom-copy-${i}`], relationshipPromptVersion: undefined });
        assert.deepEqual(result.doc.sets, original.sets);
        assert.deepEqual(result.doc.prompts.inventory, original.prompts.inventory);
        assert.equal(result.doc.customRoot, 'preserve');
        assert.deepEqual(before, original);
        assert.equal(needsRelationshipPromptReview(after), false);
        assert.deepEqual((await migrateRelationshipPrompts(result.doc)).changedKeys, []);
    });
}

test('migrates fields independently and recognizes whitespace differences', async () => {
    const tpl = template({ prompt: 'My own evidence-based prompt.', responseFormat: legacy[0].responseFormat.replace(/\n/g, '\r\n') + '\r\n' });
    const result = await migrateRelationshipPrompts(document(tpl));
    assert.equal(result.doc.prompts.status.prompt, tpl.prompt);
    assert.equal(result.doc.prompts.status.responseFormat, RELATIONSHIP_DEFAULTS.en.responseFormat);
});

test('replaces known blocks while preserving custom sections and instructions', async () => {
    const tpl = template({ prompt: `Keep these notes.\n${legacy[0].prompt}\nAlso track promises.`,
        responseFormat: legacy[0].responseFormat.replace('- Short/long-term objectives', '- My custom goals and obligations') + '\n\n### MY CUSTOM SECTION\nKeep this verbatim.' });
    const result = (await migrateRelationshipPrompts(document(tpl))).doc.prompts.status;
    assert.ok(result.prompt.startsWith('Keep these notes.\n'));
    assert.ok(result.prompt.endsWith('\nAlso track promises.'));
    assert.ok(result.responseFormat.includes('- My custom goals and obligations'));
    assert.ok(result.responseFormat.endsWith('### MY CUSTOM SECTION\nKeep this verbatim.'));
    assert.match(result.responseFormat, /RELATIONSHIP DYNAMICS/);
    assert.match(result.responseFormat, /OBSERVATIONS AND UNRESOLVED QUESTIONS/);
    assert.equal(needsRelationshipPromptReview(result), false);
});

test('preserves unrecognized custom scoring instructions and flags them for review', async () => {
    const tpl = template({ prompt: 'My custom !lovefactor rules.', responseFormat: 'LUSTFACTOR: use my custom method.' });
    const result = await migrateRelationshipPrompts(document(tpl));
    assert.deepEqual(result.changedKeys, []);
    assert.deepEqual(result.doc.prompts.status, tpl);
    assert.equal(needsRelationshipPromptReview(tpl), true);
});

test('does not erase factual romance or other custom trackers', async () => {
    const tpl = template({ key: 'marriage-record', prompt: 'Record the established romantic relationship and their marriage.', responseFormat: 'Facts and uncertainties' });
    assert.deepEqual((await migrateRelationshipPrompts(document(tpl))).changedKeys, []);
    assert.equal(needsRelationshipPromptReview(tpl), false);
});

test('writes an exact recovery copy before the main document and records its name', async () => {
    const doc = document(template());
    const writes = [];
    const result = await saveRelationshipDocument(doc, { filename: 'main.json', writeDocument: async (name, value) => writes.push({ name, value: structuredClone(value) }) });
    assert.equal(writes.length, 2);
    assert.match(writes[0].name, /^stmb-side-prompts-before-neutral-status-.*\.json$/);
    assert.deepEqual(writes[0].value, doc);
    assert.equal(writes[1].name, 'main.json');
    assert.deepEqual(result.doc.relationshipPromptBackups, [writes[0].name]);
    assert.equal(doc.prompts.status.prompt, legacy[0].prompt);
    await saveRelationshipDocument(result.doc, { filename: 'main.json', onlyIfMigrated: true, writeDocument: async () => assert.fail('Idempotent load should not write') });
});

for (const failAt of [1, 2]) {
    test(`failed write ${failAt} never mutates the caller or attempts a reset`, async () => {
        const doc = document(template());
        const before = structuredClone(doc);
        let calls = 0;
        await assert.rejects(saveRelationshipDocument(doc, { filename: 'main.json', writeDocument: async () => {
            if (++calls === failAt) throw new Error('storage failure');
        } }), /storage failure/);
        assert.equal(calls, failAt);
        assert.deepEqual(doc, before);
    });
}

test('all runtime locale strings and import packs match the neutral defaults', () => {
    const root = new URL('./', import.meta.url);
    for (const file of readdirSync(new URL('locales/', root)).filter(file => file.endsWith('.json'))) {
        const locale = JSON.parse(readFileSync(new URL(`locales/${file}`, root), 'utf8'));
        if (!locale.STMemoryBooks_StatusPrompt) continue;
        const key = file.startsWith('zh-') ? file.slice(0, -5) : file.split('-')[0];
        assert.equal(locale.STMemoryBooks_StatusPrompt, RELATIONSHIP_DEFAULTS[key].prompt, file);
        assert.equal(locale.STMemoryBooks_StatusResponseFormat, RELATIONSHIP_DEFAULTS[key].responseFormat, file);
    }
    for (const file of readdirSync(new URL('resources/prompts/', root)).filter(file => file.startsWith('side-prompts-'))) {
        const status = JSON.parse(readFileSync(new URL(`resources/prompts/${file}`, root), 'utf8')).prompts.status;
        const key = file.slice('side-prompts-'.length, -5);
        assert.equal(status.prompt, RELATIONSHIP_DEFAULTS[key].prompt, file);
        assert.equal(status.responseFormat, RELATIONSHIP_DEFAULTS[key].responseFormat, file);
    }
    const status = JSON.parse(readFileSync(new URL('resources/SidePromptTemplateLibrary.json', root), 'utf8')).prompts.status;
    assert.equal(status.prompt, RELATIONSHIP_DEFAULTS.en.prompt);
    assert.equal(status.responseFormat, RELATIONSHIP_DEFAULTS.en.responseFormat);
    for (const defaults of Object.values(RELATIONSHIP_DEFAULTS)) {
        assert.equal(needsRelationshipPromptReview(defaults), false);
        assert.match(defaults.prompt, /\{\{user\}\}/);
        assert.match(defaults.prompt, /\{\{char\}\}/);
        assert.equal(defaults.sections.length, 6);
    }
});
