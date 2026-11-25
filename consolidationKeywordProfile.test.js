// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { CHAT_PROFILE_KEY, resolveProfileIndex } from './profileSelection.js';
import { consolidationSourceHash, consolidationSourceContentHash, reconcileConsolidationCheckpoint } from './consolidationReceiptPolicy.js';

function loadModule(file, exports, deps) {
    const source = readFileSync(new URL(file, import.meta.url), 'utf8')
        .replace(/^import[\s\S]*?;\r?\n/gm, '').replace(/^export /gm, '');
    return vm.runInNewContext(`(function () { ${source}\nreturn { ${exports} }; })()`, deps);
}

function harness() {
    const settings = {
        profiles: ['A', 'B'].map(name => ({ profileKey: name, connection: {
            api: `provider-${name}`, model: `model-${name}`, connectionProfileId: `connection-${name}`,
        } })), defaultProfile: 0,
    };
    let markers = { [CHAT_PROFILE_KEY]: 'A' };
    const requests = [];
    const book = { entries: {} };
    const deps = {
        structuredClone, resolveProfileIndex, extension_settings: { STMemoryBooks: settings },
        getSceneMarkers: () => markers,
        getCurrentApiInfo: () => ({ completionSource: 'openai' }),
        getUIModelSettings: () => ({ model: 'live-model', temperature: 0.2 }),
        normalizeCompletionSource: value => value,
        translate: value => value, tr: () => '', DEFAULT_CONSOLIDATION_KEYWORD_PROMPT: 'Generate keywords',
        getSourceTierForTarget: tier => tier - 1, getSummaryTierLabel: () => 'Arc',
        sendRawCompletionRequest: async request => {
            requests.push(request);
            return { text: '["generated keyword"]' };
        },
        isStmbStopError: () => false, throwIfStmbStopped() {},
        createStmbInFlightTask: () => ({ epoch: 1, finish() {}, throwIfStopped() {} }),
        getDefaultSummaryTitleFormat: () => '[ARC 000] {{title}}', isSummaryEntry: entry => entry.stmbSummary,
        normalizeLorebookEntrySettings: value => value, applyLorebookEntrySettings() {},
        getSummaryTypeKey: () => 'arc', collectNarratorSourceMetadata: () => ({}), reloadEditor() {},
        upsertLorebookEntriesBatch: async (_name, data, entries) => entries.map(item => {
            const uid = Object.keys(data.entries).length + 1;
            return data.entries[uid] = { uid, comment: item.title, content: item.content, ...item.entryOverrides };
        }),
        console: { info() {}, debug() {}, warn() {} },
    };
    const arc = loadModule('./arcanalysis.js',
        'snapshotConsolidationProfile, prepareSummaryCandidateKeywords, prepareSummaryCandidateTitle, commitSummaryEntries, commitArcs', deps);
    let savedSettings;
    let listener;
    const recovery = loadModule('./consolidationRecovery.js', 'commitSummaryEntriesRecoverable, resumeConsolidationCheckpoint', {
        ...deps, ...arc, consolidationSourceHash, consolidationSourceContentHash, reconcileConsolidationCheckpoint,
        AbortController, setTimeout, clearTimeout,
        event_types: { SETTINGS_UPDATED: 'updated' },
        eventSource: { on: (_event, fn) => { listener = fn; }, removeListener() {} },
        saveSettings: () => { savedSettings = JSON.stringify({ extension_settings: { STMemoryBooks: settings } }); listener(); },
        getRequestHeaders: () => ({}), fetch: async () => ({ ok: true, json: async () => ({ settings: savedSettings }) }),
        loadWorldInfo: async () => book, getCurrentStmbChatRef: () => ({}), getStmbChatKey: () => 'chat-A',
    });
    const captured = arc.snapshotConsolidationProfile();
    markers = { [CHAT_PROFILE_KEY]: 'B' };
    assert.equal(arc.snapshotConsolidationProfile().effectiveConnection.model, 'model-B');
    return { arc, recovery, captured, requests, book, settings };
}

for (const path of ['prepare', 'commit', 'legacy', 'recoverable']) {
    for (const keywords of [[], ['existing keyword']]) {
        test(`${path} uses captured chat A connection after switching to B; ${keywords.length ? 'existing' : 'empty'} keywords`, async () => {
            const { arc, recovery, captured, requests, book, settings } = harness();
            const candidate = { title: 'Summary', summary: 'Chat A facts', keywords, memberIds: [] };
            const original = structuredClone(candidate);
            const options = { lorebookName: 'A', lorebookData: book, summaryCandidates: [candidate], profileOrConnection: captured };
            if (path === 'prepare') {
                const prepared = await arc.prepareSummaryCandidateKeywords(candidate, 1, captured);
                assert.equal(prepared.keywords[0], keywords[0] || 'generated keyword');
            } else if (path === 'commit') {
                await arc.commitSummaryEntries(options);
            } else if (path === 'legacy') {
                await arc.commitArcs({ ...options, arcCandidates: [candidate] });
            } else {
                await recovery.commitSummaryEntriesRecoverable(options);
                const checkpoint = settings.consolidationCheckpoints[0];
                assert.equal(checkpoint.options.skipKeywordGeneration, true);
                assert.equal(Object.hasOwn(checkpoint.options, 'profileOrConnection'), false);
                assert.equal(checkpoint.status, 'completed');
                await recovery.resumeConsolidationCheckpoint(checkpoint);
                assert.equal(Object.keys(book.entries).length, 1);
            }
            assert.deepEqual(candidate, original);
            assert.equal(requests.length, keywords.length ? 0 : 1);
            if (!keywords.length) {
                assert.equal(requests[0].api, 'provider-A');
                assert.equal(requests[0].model, 'model-A');
                assert.equal(requests[0].connectionProfileId, 'connection-A');
                assert.ok(requests[0].prompt.includes('Chat A facts'));
            }
            if (path !== 'prepare') assert.equal(book.entries[1].key[0], keywords[0] || 'generated keyword');
        });
    }
}

test('legacy callers without a captured profile retain current-profile fallback', async () => {
    const { arc, requests } = harness();
    await arc.prepareSummaryCandidateKeywords({ summary: 'Facts', keywords: [] }, 1);
    assert.equal(requests[0].model, 'model-B');
});

test('commit skipKeywordGeneration suppresses requests even for empty keywords', async () => {
    const { arc, requests, book, captured } = harness();
    await arc.commitSummaryEntries({ lorebookName: 'A', lorebookData: book,
        summaryCandidates: [{ title: 'Summary', summary: 'Facts', keywords: [] }],
        skipKeywordGeneration: true, profileOrConnection: captured });
    assert.equal(requests.length, 0);
    assert.equal(book.entries[1].key.length, 0);
});
