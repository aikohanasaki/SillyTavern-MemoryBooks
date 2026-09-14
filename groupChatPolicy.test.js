// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { applyGroupMemoryPolicy, getGroupChatPolicy, getGroupMemoryProfile, isCharacterAwarenessDisabled, usesGroupSidePromptDefault } from './groupChatPolicy.js';
import { resolveAutomaticSidePromptSet, filterAutomaticSidePromptSetItems } from './sidePromptSetDefaults.js';
import { applyRegenerationReplacement } from './memoryRegeneration.js';
import { filterManualGroupEntriesForRole } from './manualGroupLorebookPolicy.js';

// Exercise browser-module entry points with injected ST services, without loading ST.
function loadFunction(file, name, dependencies = {}) {
    const source = readFileSync(new URL(file, import.meta.url), 'utf8');
    const start = source.search(new RegExp(`(?:async )?function ${name}\\(`));
    assert.notEqual(start, -1, name);
    const end = start + /\n}\r?(?:\n|$)/.exec(source.slice(start)).index + 2;
    return Function(...Object.keys(dependencies), `return (${source.slice(start, end)});`)(...Object.values(dependencies));
}

const capture = (settings, context = { isGroupChat: true }) => ({
    ...context, groupChatPolicy: getGroupChatPolicy(settings, context),
});
const disabledContext = capture({ characterAwareMemories: false });

test('missing settings retain enabled behavior; solo and Narrator Mode ignore the memory switch', () => {
    assert.equal(isCharacterAwarenessDisabled(null, null), false);
    assert.deepEqual(resolveAutomaticSidePromptSet(null, null, null), { setKey: '', mode: 'individual', source: 'default' });
    assert.equal(isCharacterAwarenessDisabled({}, { isGroupChat: true }), false);
    assert.equal(usesGroupSidePromptDefault({}, { isGroupChat: true }), true);
    for (const context of [{ isGroupChat: false }, { isGroupChat: false, isNarratorMode: true }]) {
        assert.equal(isCharacterAwarenessDisabled({ characterAwareMemories: false }, context), false);
        assert.equal(usesGroupSidePromptDefault({}, context), false);
    }
});

for (const characterAwareMemories of [false, true]) {
    for (const useSeparateGroupSidePrompts of [false, true]) {
        test(`independent policies: memories=${characterAwareMemories}, side prompts=${useSeparateGroupSidePrompts}`, () => {
            const settings = { characterAwareMemories, useSeparateGroupSidePrompts, defaultSoloSidePromptSetKey: 'solo', defaultGroupSidePromptSetKey: 'group' };
            const context = capture(settings);
            assert.equal(isCharacterAwarenessDisabled(settings, context), !characterAwareMemories);
            assert.deepEqual(resolveAutomaticSidePromptSet({}, settings, context), {
                setKey: useSeparateGroupSidePrompts ? 'group' : 'solo', mode: 'set', source: 'default',
            });
            for (const setKey of ['explicit', '']) {
                assert.deepEqual(resolveAutomaticSidePromptSet({ sidePromptAfterMemorySetKey: setKey }, settings, context), {
                    setKey, mode: setKey ? 'set' : 'individual', source: 'chat',
                });
            }
            const items = [{ tpl: { enabled: true, triggers: { onAfterMemory: { enabled: true }, onInterval: { visibleMessages: 10 } } } }];
            for (const trigger of ['onAfterMemory', 'onInterval']) {
                assert.deepEqual(filterAutomaticSidePromptSetItems(items, trigger), items);
            }
        });
    }
}

test('queued and retry contexts retain both policies after live settings change', () => {
    for (const enabled of [false, true]) {
        const settings = { characterAwareMemories: enabled, useSeparateGroupSidePrompts: enabled };
        const context = JSON.parse(JSON.stringify(capture(settings)));
        settings.characterAwareMemories = !enabled;
        settings.useSeparateGroupSidePrompts = !enabled;
        assert.equal(isCharacterAwarenessDisabled(settings, context), !enabled);
        assert.equal(usesGroupSidePromptDefault(settings, context), enabled);
    }
});

test('ordinary memory policy preserves chat identity and speakers while removing inherited filters and routing', () => {
    const scene = { metadata: { chatId: 'group-chat', groupName: 'Cast', characterFilterNames: ['Alice'], stmbPromptTarget: 'group' }, messages: [{ name: 'Alice', mes: 'Hello' }] };
    applyGroupMemoryPolicy(scene, {}, disabledContext);
    assert.equal(Object.hasOwn(scene.metadata, 'characterFilterNames'), false);
    assert.equal(scene.metadata.stmbPromptTarget, '');
    assert.equal(scene.metadata.chatId, 'group-chat');
    assert.equal(scene.messages[0].name, 'Alice');
    const profile = { useGroupSpecificPrompts: true, preset: 'summary', groupPreset: 'group', characterPreset: 'char' };
    const effective = getGroupMemoryProfile(profile, {}, scene.metadata);
    assert.equal(effective.useGroupSpecificPrompts, false);
    assert.equal(effective.preset, 'summary');
    assert.equal(profile.useGroupSpecificPrompts, true);
    assert.equal(getGroupMemoryProfile(profile, {}, { isNarratorMode: true }), profile);
});

test('automatic write options override stale participant metadata even for repaired results', () => {
    const normalize = value => Array.isArray(value) ? value : [];
    const addOptions = loadFunction('./index.js', 'getAutomaticGroupMemoryAddOptions', { isCharacterAwarenessDisabled, normalizeCharacterFilterNamesForGroup: normalize });
    const result = { metadata: { characterFilterNames: ['Alice'] } };
    assert.deepEqual(addOptions(result, result, disabledContext), { characterFilterNames: [], applyCharacterFilters: false });
    assert.deepEqual(addOptions(result, result, capture({})), { characterFilterNames: ['Alice'] });
    const applyFilter = loadFunction('./addlore.js', 'applyMemoryCharacterFilter', { isCharacterAwarenessDisabled, normalizeCharacterFilterNames: normalize });
    const entry = { characterFilter: { names: ['Bob'] } };
    applyFilter(entry, { metadata: { ...disabledContext, characterFilterNames: ['Alice'] } });
    assert.equal(Object.hasOwn(entry, 'characterFilter'), false);
    applyFilter(entry, result);
    assert.deepEqual(entry.characterFilter, { names: ['Alice'], isExclude: false, tags: [] });
});

test('captured memory policy selects ordinary prompts even when the profile enables separate prompts', async () => {
    const profile = { name: 'Shared', preset: 'summary', useGroupSpecificPrompts: true, groupPreset: 'group', characterPreset: 'char' };
    const getEffectivePrompt = loadFunction('./utils.js', 'getEffectivePrompt', {
        getCustomPresetPrompt: async key => key + ' text', getDefaultPrompt: () => 'default',
    });
    const buildPrompt = loadFunction('./stmemory.js', 'buildPrompt', {
        getGroupMemoryProfile, getEffectivePrompt, substituteParams: value => value,
        resolveAdditionalContextEntries: async () => ({ entries: [] }), formatSceneForAI: () => 'Alice: hello',
        extension_settings: {},
    });
    for (const enabled of [false, true]) {
        const metadata = { ...capture({ characterAwareMemories: enabled }), stmbPromptTarget: 'group' };
        assert.equal(await buildPrompt({ metadata, messages: [] }, profile), `${enabled ? 'group' : 'summary'} text\n\nAlice: hello`);
    }
    const snapshotProfilePrompts = loadFunction('./index.js', 'snapshotProfilePrompts', {
        deepClone: structuredClone, getGroupMemoryProfile,
        getEffectivePromptAsync: async (profile, target) => target || profile.preset,
    });
    const queued = await snapshotProfilePrompts(profile, disabledContext);
    assert.equal(queued.useGroupSpecificPrompts, false);
    assert.equal(queued.prompt, 'summary');
    assert.equal(profile.useGroupSpecificPrompts, true);
});

test('regeneration policy survives preparation and generation for immediate and queued drafts', async () => {
    const prepare = loadFunction('./index.js', 'prepareLorebookRegenerationDraft', {
        isCharacterAwarenessDisabled,
        prepareBaseRegenerationDraft: async () => ({ kind: 'memory' }),
        prepareConsolidationRegenerationDraft: async () => ({ kind: 'consolidation' }),
        prepareSidePromptRegenerationDraft: async () => ({ kind: 'sidePrompt' }),
    });
    const generate = loadFunction('./index.js', 'generateLorebookRegenerationDraft', {
        generateBaseRegenerationDraft: async () => ({ generatedContent: 'memory' }),
        generateConsolidationRegenerationDraft: async () => ({ generatedContent: 'consolidation' }),
        generateSidePromptRegenerationDraft: async () => ({ generatedContent: 'sidePrompt', contentOnly: true }),
    });
    for (const kind of ['memory', 'consolidation', 'sidePrompt']) {
        const prepared = await prepare('primary', {}, {}, { kind }, { memoryBooksContext: disabledContext });
        for (const captured of [prepared, JSON.parse(JSON.stringify(prepared))]) {
            const draft = await generate(captured, {});
            assert.equal(draft.removeCharacterFilter, kind !== 'sidePrompt');
            assert.equal(draft.generatedContent, kind);
        }
    }
});

test('manual mode skips stale character bindings and participant dialogs; keeps the primary book', async () => {
    const shouldUse = loadFunction('./index.js', 'shouldUseManualGroupCharacterLorebooks', {
        isCharacterAwarenessDisabled,
        isStloAvailableForManualGroupLorebooks: () => true,
        hasManualGroupCharacterLorebookBindings: () => true,
    });
    const settings = { moduleSettings: { manualModeEnabled: true } };
    assert.equal(shouldUse(settings, disabledContext), false);
    assert.equal(shouldUse(settings, capture({})), true);
    const validate = loadFunction('./index.js', 'validateManualGroupLorebookBindingsForMemory', { shouldUseManualGroupCharacterLorebooks: shouldUse });
    assert.deepEqual(await validate(settings, disabledContext), { valid: true, members: [], bindings: {} });
    const confirm = loadFunction('./index.js', 'confirmGroupMemoryParticipants', { isCharacterAwarenessDisabled });
    assert.equal(await confirm({ metadata: disabledContext }, settings, { valid: true, members: [{ key: 'Alice' }] }), true);
    const books = loadFunction('./index.js', 'getManualGroupConsolidationLorebooks', {
        initializeSettings: () => settings,
        shouldWriteMultiCharacterLorebooks: shouldUse,
    });
    const data = { entries: {} };
    assert.deepEqual((await books('primary', data, null, disabledContext)).map(x => x.lorebookName), ['primary']);
    const sources = [{ uid: 1, STMB_memoryRole: 'group' }, { uid: 2, STMB_memoryRole: 'character' }];
    assert.deepEqual(filterManualGroupEntriesForRole(sources, { role: 'group', sameLorebook: false }), sources);
});

test('regeneration removes only the rewritten memory filter; ordinary and side-prompt replacements retain theirs', () => {
    const original = { uid: 1, characterFilter: { names: ['Alice'] }, STMB_canonical: true, comment: 'Old', content: 'Old' };
    const review = { formattedTitle: 'New', content: 'New', keywords: ['new'] };
    const rewritten = structuredClone(original);
    applyRegenerationReplacement(rewritten, review, { removeCharacterFilter: true });
    assert.equal(Object.hasOwn(rewritten, 'characterFilter'), false);
    assert.equal(rewritten.STMB_canonical, true);
    assert.deepEqual(original.characterFilter, { names: ['Alice'] });
    for (const options of [{}, { contentOnly: true, removeCharacterFilter: true }]) {
        const entry = structuredClone(original);
        applyRegenerationReplacement(entry, review, options);
        assert.deepEqual(entry.characterFilter, original.characterFilter);
    }
});

test('consolidation writes suppress explicit, inherited and override filters without modifying sources', async () => {
    const normalizeCharacterFilterNames = value => Array.isArray(value) ? [...new Set(value)] : [];
    const makeCharacterFilter = loadFunction('./arcanalysis.js', 'makeCharacterFilter', { normalizeCharacterFilterNames });
    const collectSummarySourceCharacterFilter = loadFunction('./arcanalysis.js', 'collectSummarySourceCharacterFilter', { normalizeCharacterFilterNames, makeCharacterFilter });
    const writes = [];
    const commit = loadFunction('./arcanalysis.js', 'commitSummaryEntries', {
        createStmbInFlightTask: () => ({ epoch: 1, finish() {} }), throwIfStmbStopped() {},
        extension_settings: {}, getDefaultSummaryTitleFormat: () => '[ARC 000]',
        normalizeLorebookEntrySettings: value => value, getNextSummaryNumber: () => 1,
        getSummaryTierLabel: () => 'Arc', formatSummaryTitle: () => '[ARC 001]',
        applyLorebookEntrySettings() {}, getSummaryTypeKey: () => 'arc', collectNarratorSourceMetadata: () => ({}),
        makeCharacterFilter, collectSummarySourceCharacterFilter,
        upsertLorebookEntriesBatch: async (_name, _data, entries) => {
            writes.push(...entries);
            return entries.map(() => ({ uid: 100 }));
        }, console: { info() {} },
    });
    const data = { entries: { 1: { uid: 1, characterFilter: { names: ['Alice'] } }, 2: { uid: 2, characterFilter: { names: ['Bob'] } } } };
    const original = structuredClone(data);
    for (const applyCharacterFilters of [false, true]) {
        for (const names of [undefined, ['Clara']]) {
            await commit({ lorebookName: 'primary', lorebookData: data, applyCharacterFilters,
                summaryCandidates: [{ title: 'Scene', summary: 'Content', keywords: ['scene'], memberIds: [1, 2], characterFilterNames: names }],
                entryMetadata: { characterFilter: { names: ['Override'] } },
            });
            const entry = writes.at(-1).entryOverrides;
            assert.deepEqual(entry.characterFilter, applyCharacterFilters
                ? { names: names || ['Alice', 'Bob'], isExclude: false, tags: [] } : undefined);
        }
    }
    assert.deepEqual(data, original);
});
