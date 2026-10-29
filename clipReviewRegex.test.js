// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { parseClipReviewResponse, parseClipSuggestionsResponse } from './clipReviewPolicy.js';

const source = readFileSync(new URL('./clipReview.js', import.meta.url), 'utf8');
const requestSource = source.slice(
    source.indexOf('async function requestMemoryAssistanceCompletion('),
    source.indexOf('async function requestClipReviewBatch('),
);

function fixture(settings, response, failRegex = false) {
    const requests = [];
    const calls = [];
    const context = vm.createContext({
        extension_settings: { STMemoryBooks: { moduleSettings: settings } },
        oai_settings: {},
        resolveSidePromptConnection: () => ({ api: 'test' }),
        requestCompletion: async args => { requests.push(args); return { text: response }; },
        applySelectedRegex: (text, keys) => {
            calls.push(keys);
            if (failRegex) throw new Error('script failure');
            return keys.reduce((result, key) => key === 'out'
                ? result.replace('secret', '[removed]')
                : result.replace('PREFIX:', ''), text);
        },
        console: { warn() {} },
        parseClipReviewResponse,
        buildClipReviewPrompt: (_instructions, scene) => `Scene: ${scene.messages.map(message => message.mes).join('\n')}`,
    });
    const request = vm.runInContext(`(${requestSource.trim()})`, context);
    context.requestMemoryAssistanceCompletion = request;
    const review = vm.runInContext(`(${source.slice(
        source.indexOf('async function requestClipReviewBatch('),
        source.indexOf('async function requestClipSuggestions('),
    ).trim()})`, context);
    return { request, review, requests, calls };
}

test('ordinary and mixed review batches preserve exact scene quotes, including prebuilt prompts', async () => {
    for (const mixed of [false, true]) {
        for (const finalPrompt of ['', 'Scene: Alice shared a secret.']) {
            const f = fixture({ useRegex: true, selectedRegexOutgoing: ['out'], selectedRegexIncoming: ['in'] }, 'PREFIX:{"1":"Alice shared a secret."}');
            const records = [{ uid: '1', type: 'ordinary', title: 'Alice' }];
            if (mixed) records.push({ uid: '2', type: 'topical', title: 'Secrets' });
            const scene = { messages: [{ id: 3, mes: 'Alice shared a secret.' }] };
            const original = structuredClone(scene);
            const candidates = await f.review({}, scene, records, null, finalPrompt);
            assert.equal(f.requests[0].prompt, 'Scene: Alice shared a secret.');
            assert.equal(candidates[0].additions[0].messageId, 3);
            assert.equal(candidates[0].additions[0].text, 'Alice shared a secret.');
            assert.deepEqual(f.calls, [['in']]);
            assert.deepEqual(scene, original);
        }
    }
});

test('topical-only review batches still apply outgoing regex', async () => {
    const f = fixture({ useRegex: true, selectedRegexOutgoing: ['out'] }, '{"1":"Revised topic"}');
    await f.review({}, { messages: [{ id: 3, mes: 'secret' }] }, [{ uid: '1', type: 'topical', title: 'Topic' }], null);
    assert.equal(f.requests[0].prompt, 'Scene: [removed]');
    assert.deepEqual(f.calls, [['out']]);
});

test('Memory Assistance transforms outgoing prompts and incoming updates before validation', async () => {
    const f = fixture({ useRegex: true, selectedRegexOutgoing: ['out'], selectedRegexIncoming: ['in'] }, 'PREFIX:{"1":"Alice arrived."}');
    const text = await f.request({}, null, 'Scene: secret Alice arrived.');
    assert.equal(f.requests[0].prompt, 'Scene: [removed] Alice arrived.');
    assert.deepEqual(f.calls, [['out'], ['in']]);
    const records = [{ uid: '1', type: 'ordinary', title: 'Alice' }];
    assert.equal(parseClipReviewResponse(text, records, [{ id: 3, mes: 'Alice arrived.' }])[0].additions[0].messageId, 3);
    assert.throws(() => parseClipReviewResponse(text, records, [{ id: 3, mes: 'Bob arrived.' }]), /none matched/);
});

test('Memory Assistance transforms topic suggestions before JSON parsing', async () => {
    const f = fixture({ useRegex: true, selectedRegexIncoming: ['in'] }, 'PREFIX:{"topics":[{"topic":"Alice","keywords":["Alice"]}]}');
    assert.equal(parseClipSuggestionsResponse(await f.request({}, null, 'Discover topics'))[0].topic, 'Alice');
    assert.deepEqual(f.calls, [['in']]);
});

test('disabled regex and empty or malformed selections preserve request and response', async () => {
    for (const settings of [
        { useRegex: false, selectedRegexOutgoing: ['out'], selectedRegexIncoming: ['in'] },
        { useRegex: true, selectedRegexOutgoing: [], selectedRegexIncoming: [] },
        { useRegex: true, selectedRegexOutgoing: 'out', selectedRegexIncoming: 'in' },
        {},
    ]) {
        const f = fixture(settings, 'PREFIX:{}');
        assert.equal(await f.request({}, null, 'secret'), 'PREFIX:{}');
        assert.equal(f.requests[0].prompt, 'secret');
        assert.deepEqual(f.calls, []);
    }
});

test('outgoing regex failures abort Memory Assistance before sending private text', async () => {
    const f = fixture({ useRegex: true, selectedRegexOutgoing: ['out'], selectedRegexIncoming: ['in'] }, '{}', true);
    await assert.rejects(f.request({}, null, 'secret'), /script failure/);
    assert.equal(f.requests.length, 0);
    assert.deepEqual(f.calls, [['out']]);
});
