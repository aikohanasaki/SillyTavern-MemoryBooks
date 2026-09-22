// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { RELATIONSHIP_DEFAULTS } from './relationshipPromptDefaults.js';
import { loadExtensionModule, identityTranslate, substituteTestMacros } from './test-support/extension-harness.js';

const legacy = JSON.parse(readFileSync(new URL('./test-fixtures/legacy-status-prompts.json', import.meta.url), 'utf8'))[0];
const plain = value => JSON.parse(JSON.stringify(value));
const baseTemplate = () => ({ key: 'status', name: 'Status', enabled: true, prompt: legacy.prompt, responseFormat: legacy.responseFormat,
    settings: { previousMemoriesCount: 0, lorebook: { orderValue: 42 } }, triggers: { commands: ['sideprompt'], onAfterMemory: { enabled: true } } });
const baseDoc = () => ({ version: 2, prompts: { status: baseTemplate() }, sets: { duo: { key: 'duo', name: 'Duo', items: [{ id: 'first', promptKey: 'status' }] } } });

async function managerHarness(initial = baseDoc(), { failWrite = 0, withoutCrypto = false, withoutToastr = false } = {}) {
    let saved = initial && structuredClone(initial);
    const writes = [];
    const warnings = [];
    const notices = [];
    const toastApi = { info: text => notices.push(text), warning: text => warnings.push(text) };
    const module = await loadExtensionModule('sidePromptsManager.js', {
        values: { getRequestHeaders: () => ({}), FILE_NAMES: { SIDE_PROMPTS_FILE: 'stmb-side-prompts.json' }, SCHEMA: { CURRENT_VERSION: 1 },
            translate: identityTranslate, t: (strings, ...args) => strings.reduce((s, part, i) => s + part + (args[i] ?? ''), ''),
            substituteParamsExtended: substituteTestMacros, CLIP_REVIEW_TEMPLATE_KEY: 'clip-review', DEFAULT_CLIP_REVIEW_PROMPT: 'Review facts.', DEFAULT_CLIP_SUGGESTIONS_PROMPT: 'Find missing facts.' },
        globals: { crypto: withoutCrypto ? undefined : crypto, toastr: withoutToastr ? undefined : toastApi, fetch: async (url, options = {}) => {
            if (options.method === 'GET') return { ok: !!saved, text: async () => JSON.stringify(saved) };
            const body = JSON.parse(options.body);
            const value = JSON.parse(Buffer.from(body.data, 'base64').toString('utf8'));
            writes.push({ name: body.name, value });
            if (writes.length === failWrite) return { ok: false, status: 500, statusText: 'fixture failure' };
            if (body.name === 'stmb-side-prompts.json') saved = value;
            return { ok: true };
        } },
    });
    return { module, writes, warnings, notices, toastApi, saved: () => saved };
}

test('manager migrates saved defaults, preserves identity/settings, and reloads without another backup', async () => {
    const before = baseDoc();
    const f = await managerHarness(before);
    await f.module.loadSidePrompts();
    assert.equal(f.writes.length, 2);
    assert.deepEqual(f.writes[0].value, before);
    assert.equal(f.notices.length, 0, 'Migration still creates a backup without a startup success toast');
    const status = await f.module.getTemplate('status');
    assert.equal(status.prompt, RELATIONSHIP_DEFAULTS.en.prompt);
    assert.deepEqual(plain(status.settings), before.prompts.status.settings);
    assert.deepEqual(plain(status.triggers), before.prompts.status.triggers);
    assert.equal((await f.module.getSet('duo')).items[0].promptKey, 'status');
    f.module.clearCache();
    await f.module.loadSidePrompts();
    assert.equal(f.writes.length, 2);
});

test('fresh installation gets neutral defaults without creating a legacy backup', async () => {
    const f = await managerHarness(null);
    await f.module.loadSidePrompts();
    assert.deepEqual(f.writes.map(write => write.name), ['stmb-side-prompts.json']);
    assert.equal((await f.module.getTemplate('status')).responseFormat, RELATIONSHIP_DEFAULTS.en.responseFormat);
});

test('migration and backup also work without secure-context Web Crypto on LAN HTTP', async () => {
    const f = await managerHarness(baseDoc(), { withoutCrypto: true });
    await f.module.loadSidePrompts();
    assert.equal(f.writes.length, 2);
    assert.equal(f.saved().prompts.status.prompt, RELATIONSHIP_DEFAULTS.en.prompt);
    assert.match(f.writes[0].name, /^stmb-side-prompts-before-neutral-status-/);
});

for (const failWrite of [1, 2]) {
    test(`manager propagates migration write failure ${failWrite} without resetting the saved file`, async () => {
        const before = baseDoc();
        const f = await managerHarness(before, { failWrite });
        await assert.rejects(f.module.loadSidePrompts(), /Failed to save side prompts/);
        assert.equal(f.writes.length, failWrite);
        assert.deepEqual(f.saved(), before);
    });
}

test('additive legacy imports migrate renamed copies and retain set linkage and backup history', async () => {
    const f = await managerHarness();
    await f.module.loadSidePrompts();
    const firstBackup = f.saved().relationshipPromptBackups[0];
    const result = await f.module.importFromJSON(JSON.stringify(baseDoc()));
    assert.equal(result.renamed, 1);
    assert.equal(result.setsRenamed, 1);
    const saved = f.saved();
    assert.equal(saved.prompts['status-2'].responseFormat, RELATIONSHIP_DEFAULTS.en.responseFormat);
    assert.equal(saved.sets['duo-2'].items[0].promptKey, 'status-2');
    assert.ok(saved.relationshipPromptBackups.includes(firstBackup));
    assert.equal(saved.relationshipPromptBackups.length, 2);
});

for (const key of ['status', 'custom-relationship']) {
    test(`import preserves the review marker and custom content for ${key}`, async () => {
        const f = await managerHarness(null);
        await f.module.loadSidePrompts();
        const originalStatus = structuredClone(f.saved().prompts.status);
        const imported = {
            ...baseTemplate(), key, relationshipPromptVersion: 1,
            prompt: 'Summarize only established facts using my custom instructions.',
            responseFormat: '### CUSTOM ANALYSIS\n- Story suggestions\n- My custom observations.',
        };
        const incoming = { version: 2, prompts: { [key]: imported },
            sets: { duo: { key: 'duo', name: 'Duo', items: [{ id: 'original', promptKey: key }] } } };
        const result = await f.module.importFromJSON(JSON.stringify(incoming));
        const finalKey = key === 'status' ? 'status-2' : key;
        assert.equal(result.renamed, key === 'status' ? 1 : 0);
        const saved = f.saved();
        const copy = saved.prompts[finalKey];
        assert.equal(copy.relationshipPromptVersion, 1);
        for (const field of ['name', 'enabled', 'prompt', 'responseFormat', 'settings', 'triggers']) {
            assert.deepEqual(copy[field], imported[field], `Preserve imported ${field}`);
        }
        assert.deepEqual(saved.prompts.status, originalStatus);
        assert.equal(saved.sets.duo.items[0].promptKey, finalKey);
        assert.equal(f.warnings.length, 1, 'Custom legacy instructions remain flagged after import');
        f.module.clearCache();
        const exported = JSON.parse(await f.module.exportToJSON());
        assert.equal(exported.prompts[finalKey].relationshipPromptVersion, 1);
        assert.equal(f.warnings.length, 1, 'Reload must not repeat the warning in the same session');
    });
}

test('import does not mark unrelated templates as relationship templates', async () => {
    const f = await managerHarness(null);
    const imported = { ...baseTemplate(), key: 'plot-helper', name: 'Plot helper',
        prompt: 'Track plot possibilities.', responseFormat: '### NOTES\n- Story suggestions' };
    await f.module.importFromJSON(JSON.stringify({ version: 2, prompts: { [imported.key]: imported }, sets: {} }));
    assert.equal(Object.hasOwn(f.saved().prompts['plot-helper'], 'relationshipPromptVersion'), false);
    assert.equal(f.warnings.length, 0);
});

test('editing, enabling, duplicating, and exporting keep neutral content and user settings', async () => {
    const f = await managerHarness();
    await f.module.loadSidePrompts();
    await f.module.upsertTemplate({ key: 'status', enabled: false });
    const original = await f.module.getTemplate('status');
    const copyKey = await f.module.duplicateTemplate('status');
    const copy = await f.module.getTemplate(copyKey);
    assert.equal(copy.prompt, original.prompt);
    assert.deepEqual(plain(copy.settings), plain(original.settings));
    await f.module.upsertTemplate({ key: 'status', prompt: 'Track only established professional obligations.', responseFormat: original.responseFormat });
    const exported = JSON.parse(await f.module.exportToJSON());
    assert.equal(exported.prompts.status.enabled, false);
    assert.equal(exported.prompts.status.prompt, 'Track only established professional obligations.');
    assert.equal(exported.prompts.status.settings.lorebook.orderValue, 42);
    assert.ok(exported.relationshipPromptBackups.length);
});

test('manager preserves customized legacy wording with a visible review notification', async () => {
    const doc = baseDoc();
    doc.prompts.status.prompt = 'My custom !lovefactor calculation.';
    doc.prompts.status.responseFormat = 'Custom !lustfactor output.';
    const f = await managerHarness(doc);
    const loaded = await f.module.loadSidePrompts();
    assert.equal(loaded.prompts.status.prompt, doc.prompts.status.prompt);
    assert.equal(f.warnings.length, 1);
});

test('review notification tolerates unavailable toasts and warns once when the handler becomes available', async () => {
    const doc = baseDoc();
    doc.prompts.status.prompt = 'My custom !lovefactor instructions.';
    doc.prompts.status.responseFormat = 'My custom report format.';
    const absent = await managerHarness(doc, { withoutToastr: true });
    await absent.module.loadSidePrompts();
    assert.equal((await absent.module.getTemplate('status')).prompt, doc.prompts.status.prompt);

    const delayed = await managerHarness(doc);
    const showWarning = delayed.toastApi.warning;
    delete delayed.toastApi.warning;
    await delayed.module.loadSidePrompts();
    assert.equal(delayed.warnings.length, 0);
    delayed.toastApi.warning = showWarning;
    await delayed.module.upsertTemplate({ key: 'status', enabled: true });
    assert.equal(delayed.warnings.length, 1, 'An unavailable handler must not consume the warning');
    await delayed.module.upsertTemplate({ key: 'status', enabled: true });
    assert.equal(delayed.warnings.length, 1, 'A displayed warning remains deduplicated');
    assert.equal(delayed.saved().prompts.status.prompt, doc.prompts.status.prompt);
    assert.equal(delayed.saved().prompts.status.responseFormat, doc.prompts.status.responseFormat);
});

async function pipelineHarness() {
    const requests = [], writes = [];
    const tpl = { ...baseTemplate(), prompt: RELATIONSHIP_DEFAULTS.en.prompt, responseFormat: RELATIONSHIP_DEFAULTS.en.responseFormat };
    const prior = 'Established facts: Alex and Morgan are colleagues. Earlier speculation: LOVEFACTOR 8; future life partners.';
    const lore = { entries: { 1: { uid: 1, comment: 'Status (STMB SidePrompt)', content: prior } } };
    const scene = { messages: [], text: 'Morgan and Alex agree to share the workshop tools. They explicitly describe their relationship as professional colleagues.', metadata: { sceneStart: 0, sceneEnd: 3 } };
    const output = '### RELATIONSHIP DYNAMICS\nAlex and Morgan are professional colleagues. No attraction is established.\n### OBSERVATIONS AND UNRESOLVED QUESTIONS\nThey agreed to share tools; the schedule is unspecified.';
    const module = await loadExtensionModule('sidePrompts.js', {
        expose: ['buildPrompt', 'prepareSidePromptRun', 'buildSidePromptJob', 'buildSidePromptBatchJob', 'executeQueuedSidePromptJob', 'executeQueuedSidePromptBatchJob', 'resolveSidePromptPreview'],
        values: {
            chat: [], chat_metadata: {}, extension_settings: { STMemoryBooks: { moduleSettings: { showMemoryPreviews: false } } }, oai_settings: {},
            translate: identityTranslate, t: (strings, ...args) => strings.reduce((s, part, i) => s + part + (args[i] ?? ''), ''),
            substituteParamsExtended: substituteTestMacros, toReadableText: compiled => compiled.text,
            appendAdditionalContextSection: (_, entries) => assert.equal(entries.length, 0),
            getTemplate: async () => tpl, getSceneMarkers: () => ({}), CONTEXT_NONE_KEY: 'none',
            getEntryByTitle: (data, title) => Object.values(data.entries).find(entry => entry.comment === title),
            getCurrentApiInfo: () => ({ completionSource: 'openai' }), getUIModelSettings: () => ({ model: 'mock' }),
            normalizeCompletionSource: api => api, getCurrentMemoryBooksContext: () => ({}),
            requestCompletion: async request => { requests.push(request); return { text: output, full: {} }; }, assertProviderDidNotTruncate() {},
            loadWorldInfo: async () => lore, getStmbChatKey: () => 'chat', getCurrentStmbChatRef: () => ({ characterId: 0, chatId: 'chat' }),
            withStmbWriteLane: async (_, fn) => fn(),
            upsertLorebookEntryByTitle: async (...args) => writes.push(args),
            upsertLorebookEntriesBatch: async (...args) => writes.push(args),
        },
    });
    const context = { signal: null, setState() {}, throwIfCancelled() {}, setResult() {}, isCancelled: () => false };
    const prepared = await module.prepareSidePromptRun({ tpl, loreData: lore, compiledScene: scene, defaultOverrides: { api: 'openai', model: 'mock' } });
    return { module, requests, writes, tpl, prior, lore, scene, output, context, prepared };
}

test('real assembly expands macros, keeps history, and ends with the neutral format', async () => {
    const f = await pipelineHarness();
    const prompt = f.prepared.finalPrompt;
    assert.match(prompt, /relationship between Morgan and Alex/);
    assert.ok(prompt.includes(f.prior));
    assert.ok(prompt.includes(f.scene.text));
    assert.ok(prompt.endsWith(RELATIONSHIP_DEFAULTS.en.responseFormat));
    assert.match(prompt, /do not treat earlier speculation or scores as evidence/);
    // Historical data stays intact; the active instruction fields are neutral.
    assert.doesNotMatch(f.tpl.prompt + f.tpl.responseFormat, /lovefactor|lustfactor|life partners/i);
});

test('manual queued request saves neutral plain text using the existing title and checkpoint contract', async () => {
    const f = await pipelineHarness();
    const job = f.module.buildSidePromptJob({ tpl: f.tpl, lore: { name: 'test', data: f.lore }, compiledScene: f.scene, prepared: f.prepared, trigger: 'manual' });
    await f.module.executeQueuedSidePromptJob(job, f.context);
    assert.equal(f.requests[0].prompt, f.prepared.finalPrompt);
    assert.equal(f.writes[0][2], 'Status (STMB SidePrompt)');
    assert.equal(f.writes[0][3], f.output);
    assert.equal(f.writes[0][4].metadataUpdates.STMB_sp_status_lastMsgId, 3);
});

test('automatic/set batch request preserves output and tracker metadata without score parsing', async () => {
    const f = await pipelineHarness();
    const job = f.module.buildSidePromptBatchJob({ items: [{ tpl: f.tpl, lore: { name: 'test', data: f.lore }, prepared: f.prepared }], compiledScene: f.scene, trigger: 'onAfterMemory' });
    await f.module.executeQueuedSidePromptBatchJob(job, f.context);
    assert.equal(f.requests[0].prompt, f.prepared.finalPrompt);
    assert.equal(f.writes[0][2][0].content, f.output);
    assert.equal(f.writes[0][2][0].metadataUpdates.STMB_sp_status_lastMsgId, 3);
});

test('regeneration uses the current neutral template while retaining the original prior snapshot', async () => {
    const f = await pipelineHarness();
    const snapshot = { templateKey: 'status', priorContent: f.prior, runtimeMacros: {} };
    const result = await f.module.generateSidePromptFromSnapshot({ snapshot, compiledScene: f.scene });
    assert.ok(f.requests[0].prompt.includes(f.prior));
    assert.ok(f.requests[0].prompt.endsWith(RELATIONSHIP_DEFAULTS.en.responseFormat));
    assert.equal(result.content, f.output);
    assert.equal(snapshot.priorContent, f.prior);
});
