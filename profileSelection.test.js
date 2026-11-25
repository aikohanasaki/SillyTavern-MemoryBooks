// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { CHAT_PROFILE_KEY, CONSOLIDATION_PROFILE_KEY, resolveProfileIndex, getChatProfileSelection, setChatProfileSelection } from './profileSelection.js';

function fixture() {
    return {
        profiles: ['current', 'global', 'chat', 'consolidation'].map(profileKey => ({
            profileKey, name: profileKey, connection: { api: 'openai', model: profileKey, temperature: 0.3 },
        })),
        defaultProfile: 1,
        moduleSettings: { [CONSOLIDATION_PROFILE_KEY]: 'consolidation' },
    };
}

test('profile precedence separates explicit choices, consolidation overrides, chat preferences, and global defaults', () => {
    const settings = fixture();
    const markers = { [CHAT_PROFILE_KEY]: 'chat' };
    assert.equal(resolveProfileIndex(settings), 1);
    assert.equal(resolveProfileIndex(settings, markers), 2);
    assert.equal(resolveProfileIndex(settings, markers, { consolidation: true }), 3);
    assert.equal(resolveProfileIndex(settings, markers, { consolidation: true, profileIndex: 0 }), 0);
    assert.equal(resolveProfileIndex(settings, markers, { profileIndex: 99 }), 2);
    assert.equal(resolveProfileIndex({ profiles: settings.profiles, defaultProfile: -1 }), 0);
    assert.equal(resolveProfileIndex(undefined), 0);
});

test('chat choices persist independently, including profile zero and explicit inheritance', () => {
    const settings = fixture();
    const solo = {}, group = {};
    assert.equal(getChatProfileSelection(settings, solo), 'inherit');
    assert.equal(setChatProfileSelection(settings, solo, '0'), true);
    assert.equal(setChatProfileSelection(settings, group, '2'), true);
    assert.equal(getChatProfileSelection(settings, solo), '0');
    assert.equal(resolveProfileIndex(settings, solo), 0);
    assert.equal(resolveProfileIndex(settings, group), 2);
    assert.equal(setChatProfileSelection(settings, solo, 'missing'), false);
    assert.equal(setChatProfileSelection(settings, solo, '999'), false);
    assert.equal(setChatProfileSelection(settings, solo, 'inherit'), true);
    assert.equal(resolveProfileIndex(settings, solo), 1);
    assert.equal(settings.defaultProfile, 1);
    assert.equal(resolveProfileIndex(settings, group), 2);
});

test('stable references survive rename, reorder and appended imports; missing references never select their replacement index', () => {
    const settings = fixture();
    const markers = {};
    setChatProfileSelection(settings, markers, '2');
    settings.profiles[2].name = 'Renamed';
    settings.profiles.unshift({ profileKey: 'imported', name: 'Renamed' });
    settings.defaultProfile++;
    assert.equal(getChatProfileSelection(settings, markers), '3');
    assert.equal(resolveProfileIndex(settings, markers), 3);
    settings.profiles.splice(3, 1);
    assert.equal(getChatProfileSelection(settings, markers), 'missing');
    assert.equal(resolveProfileIndex(settings, markers), settings.defaultProfile);
    assert.equal(markers[CHAT_PROFILE_KEY], 'chat');
    settings.moduleSettings[CONSOLIDATION_PROFILE_KEY] = 'deleted';
    assert.equal(resolveProfileIndex(settings, markers, { consolidation: true }), settings.defaultProfile);
    setChatProfileSelection(settings, markers, '0');
    assert.equal(resolveProfileIndex(settings, markers, { consolidation: true }), 0);
    assert.equal(settings.moduleSettings[CONSOLIDATION_PROFILE_KEY], 'deleted');
});

function loadModule(file, exports, deps) {
    const source = readFileSync(new URL(file, import.meta.url), 'utf8')
        .replace(/^import[\s\S]*?;\r?\n/gm, '').replace(/^export /gm, '');
    return vm.runInNewContext(`(function () { ${source}\nreturn { ${exports} }; })()`, deps);
}

function connectionHarness() {
    const settings = fixture();
    const state = { markers: { [CHAT_PROFILE_KEY]: 'chat' }, uiModel: 'live-model' };
    const deps = {
        resolveProfileIndex, structuredClone,
        extension_settings: { STMemoryBooks: settings },
        getSceneMarkers: () => state.markers,
        getCurrentApiInfo: () => ({ completionSource: 'openai' }),
        getUIModelSettings: () => ({ model: state.uiModel, temperature: 0.6 }),
        normalizeCompletionSource: source => source,
        console: { debug() {}, warn() {} },
    };
    return { settings, state, deps };
}

test('consolidation snapshots preserve connection and service settings across chat switches and profile edits', () => {
    const { settings, state, deps } = connectionHarness();
    settings.profiles[3].useChatCompletionService = true;
    settings.profiles[3].chatCompletionPreset = 'saved-preset';
    settings.profiles[3].connection.connectionProfileId = 'custom-connection';
    const api = loadModule('./arcanalysis.js', 'snapshotConsolidationProfile, resolveConnection', deps);
    const captured = api.snapshotConsolidationProfile();
    assert.equal(captured.profileKey, 'consolidation');
    assert.equal(captured.effectiveConnection.connectionProfileId, 'custom-connection');
    assert.equal(captured.effectiveConnection.chatCompletionPreset, 'saved-preset');
    state.markers = {};
    settings.profiles[3].connection.model = 'changed';
    delete settings.moduleSettings[CONSOLIDATION_PROFILE_KEY];
    assert.equal(api.resolveConnection(captured).model, 'consolidation');
    assert.equal(api.snapshotConsolidationProfile().effectiveConnection.model, 'global');
    state.markers = { [CHAT_PROFILE_KEY]: 'chat' };
    assert.equal(api.resolveConnection(null).model, 'chat');
});

test('Current SillyTavern consolidation profile snapshots resolve live values once', () => {
    const { settings, state, deps } = connectionHarness();
    settings.profiles[0].connection.api = 'current_st';
    settings.moduleSettings[CONSOLIDATION_PROFILE_KEY] = 'current';
    const api = loadModule('./arcanalysis.js', 'snapshotConsolidationProfile, resolveConnection', deps);
    const captured = api.snapshotConsolidationProfile();
    state.uiModel = 'other-model';
    assert.equal(api.resolveConnection(captured).model, 'live-model');
    assert.equal(api.snapshotConsolidationProfile().effectiveConnection.model, 'other-model');
});

test('direct and queued summary regeneration keep the selected consolidation connection and reserved prompt', async () => {
    const { settings, state, deps } = connectionHarness();
    const { snapshotConsolidationProfile } = loadModule('./arcanalysis.js', 'snapshotConsolidationProfile', deps);
    const source = readFileSync(new URL('./index.js', import.meta.url), 'utf8');
    const start = source.indexOf('async function prepareConsolidationRegenerationDraft(');
    const end = source.indexOf('async function prepareSidePromptRegenerationDraft(', start);
    const requests = [];
    const api = vm.runInNewContext(`(function () { ${source.slice(start, end)}
        return { prepareConsolidationRegenerationDraft, generateConsolidationRegenerationDraft }; })()`, {
        snapshotConsolidationProfile,
        getEntryByUid: (book, uid) => book.entries[uid],
        fingerprintRegenerationEntry: entry => entry.content,
        buildConsolidationRegenerationOptions: () => ({ presetKey: 'regeneration' }),
        CONSOLIDATION_REGENERATION_PRESET_KEY: 'regeneration',
        ArcPrompts: { getPrompt: async key => `prompt:${key}` },
        getCurrentSummaryTitleFormat: () => '[000] {{title}}',
        runSummaryAnalysisSequential: async (...args) => {
            requests.push(args);
            return { summaryCandidates: [{ title: 'Summary', summary: 'Preserved facts', keywords: [] }] };
        },
    });
    const book = { entries: { 1: { uid: 1, content: 'Source' } } };
    const eligibility = { sourceUids: [1], tier: 1, sequenceNumber: 4 };
    const direct = await api.prepareConsolidationRegenerationDraft(book, eligibility);
    const queued = await api.prepareConsolidationRegenerationDraft(book, eligibility, { snapshotProfile: true });
    state.markers = {};
    delete settings.moduleSettings[CONSOLIDATION_PROFILE_KEY];
    settings.profiles[3].connection.model = 'changed';
    for (const prepared of [direct, queued]) {
        const draft = await api.generateConsolidationRegenerationDraft(prepared, { throwIfCancelled() {} });
        assert.equal(draft.generatedContent, 'Preserved facts');
        assert.equal(prepared.analysisOptions.presetKey, 'regeneration');
    }
    assert.equal(queued.analysisOptions.promptText, 'prompt:regeneration');
    assert.equal(requests.length, 2);
    assert.ok(requests.every(([, , profile]) => profile.effectiveConnection.model === 'consolidation'));
});

test('Side Prompts inherit the chat profile while retaining explicit template connection overrides', () => {
    const { state, deps } = connectionHarness();
    const api = loadModule('./sidePrompts.js', 'resolveSidePromptConnection', deps);
    assert.equal(api.resolveSidePromptConnection().model, 'chat');
    assert.equal(api.resolveSidePromptConnection(null, { overrideProfileIndex: 0 }).model, 'current');
    state.markers = {};
    assert.equal(api.resolveSidePromptConnection().model, 'global');
});

test('main selector remembers only user changes and can clear its preference without changing the global default', async () => {
    const { settings, state, deps } = connectionHarness();
    const source = readFileSync(new URL('./index.js', import.meta.url), 'utf8');
    const start = source.indexOf('    if (e.target.matches("#stmb-profile-select"))');
    const end = source.indexOf('    if (e.target.matches("#stmb-title-format-select"))', start);
    let saves = 0;
    const onChange = vm.runInNewContext(`(async e => { ${source.slice(start, end)} })`, {
        ...deps, settings, setChatProfileSelection,
        getChatProfileIndex: settings => resolveProfileIndex(settings, state.markers),
        saveMetadataForCurrentContext: () => saves++,
        clampInt: (v, min, max) => Math.min(max, Math.max(min, v)),
        readIntInput: (el, fallback) => Number.isNaN(parseInt(el.value)) ? fallback : parseInt(el.value),
        popupElement: { querySelector: () => null },
    });
    const event = (value, isTrusted) => ({ isTrusted, target: { value, matches: () => true } });
    await onChange(event('0', false));
    assert.equal(state.markers[CHAT_PROFILE_KEY], 'chat');
    assert.equal(saves, 0);
    await onChange(event('0', true));
    assert.equal(state.markers[CHAT_PROFILE_KEY], 'current');
    await onChange(event('inherit', true));
    assert.equal(getChatProfileSelection(settings, state.markers), 'inherit');
    assert.equal(saves, 2);
    assert.equal(settings.defaultProfile, 1);
});
