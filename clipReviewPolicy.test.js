// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import test from 'node:test';
import { getMemoryAssistanceFailure, makeClipReviewRecord, normalizeMemoryAssistanceMode, packClipReviewBatches, parseClipReviewResponse, parseClipSuggestionsResponse, renderClipReviewReport, shouldPreserveClipReviewReport } from './clipReviewPolicy.js';

test('normalizes Memory Assistance modes and migrates the legacy checkbox', () => {
    assert.equal(normalizeMemoryAssistanceMode('off', true), 'off');
    assert.equal(normalizeMemoryAssistanceMode('Suggest'), 'update');
    assert.equal(normalizeMemoryAssistanceMode('update'), 'update');
    assert.equal(normalizeMemoryAssistanceMode('update and suggest'), 'update_and_suggest');
    assert.equal(normalizeMemoryAssistanceMode('update-and-suggest'), 'update_and_suggest');
    assert.equal(normalizeMemoryAssistanceMode('update_and_suggest'), 'update_and_suggest');
    assert.equal(normalizeMemoryAssistanceMode('automatic'), 'automatic');
    assert.equal(normalizeMemoryAssistanceMode('', true), 'update');
    assert.equal(normalizeMemoryAssistanceMode('invalid', false), 'off');
});

test('normalizes and filters Topical Clip suggestions', () => {
    const existing = [
        { type: 'topical', title: 'About Alice [STMB Clip]', topic: 'Alice' },
        { type: 'ordinary', title: 'Brass Key [STMB Clip]', topic: '' },
    ];
    const result = parseClipSuggestionsResponse(JSON.stringify({
        topics: [
            { topic: ' Alice ', keywords: ['Alice'] },
            { topic: 'Brass Key', keywords: [] },
            { topic: ' New Alliance ', keywords: ['Alliance', ' alliance ', '', 'Treaty'] },
            { topic: 'new alliance', keywords: ['duplicate'] },
            { topic: 'Hidden Door' },
            null,
        ],
    }), existing);

    assert.equal(result.length, 3);
    assert.equal(result[0].topic, 'Brass Key');
    assert.deepEqual(result[0].keywords, ['Brass Key']);
    assert.equal(result[1].topic, 'New Alliance');
    assert.deepEqual(result[1].keywords, ['Alliance', 'Treaty']);
    assert.equal(result[2].topic, 'Hidden Door');
    assert.deepEqual(result[2].keywords, ['Hidden Door']);
    assert.match(result[0].id, /^topic-[0-9a-f]{8}$/);
});

test('accepts zero topic suggestions and rejects malformed suggestion envelopes', () => {
    assert.deepEqual(parseClipSuggestionsResponse('{"topics":[]}', []), []);
    assert.throws(() => parseClipSuggestionsResponse('{}', []), /topics array/i);
    assert.throws(() => parseClipSuggestionsResponse('[]', []), /topics array/i);
    assert.throws(() => parseClipSuggestionsResponse('{"topics":[],"updates":{}}', []), /topics array/i);
});

test('classifies topical metadata and hashes content', () => {
    const record = makeClipReviewRecord({ uid: 7, comment: 'Alice [STMB Clip]', key: ['Alice'], content: 'fact', data: { extensions: { aikobots: { topical_clip: { topic: 'Alice' } } } } });
    assert.equal(record.type, 'topical');
    assert.equal(record.topic, 'Alice');
    assert.match(record.contentHash, /^[0-9a-f]{8}$/);
});

test('packs records without dropping an oversized record', () => {
    const records = [1, 2, 3].map(uid => ({ uid, content: 'x'.repeat(800) }));
    const batches = packClipReviewBatches(records, 'scene', 1500, 1000);
    assert.deepEqual(batches.flat().map(item => item.uid), [1, 2, 3]);
    assert.ok(batches.length > 1);
});

test('preserves the previous report when every requested operation fails', () => {
    assert.equal(shouldPreserveClipReviewReport({ batchCount: 2, failedBatchCount: 2 }), true);
    assert.equal(shouldPreserveClipReviewReport({ batchCount: 2, failedBatchCount: 2, suggestionPassRequested: true, suggestionPassSucceeded: false }), true);
    assert.equal(shouldPreserveClipReviewReport({ batchCount: 2, failedBatchCount: 2, suggestionPassRequested: true, suggestionPassSucceeded: true }), false);
    assert.equal(shouldPreserveClipReviewReport({ batchCount: 2, failedBatchCount: 1 }), false);
});

test('surfaces every incomplete Memory Assistance result as a job failure', () => {
    assert.equal(getMemoryAssistanceFailure({ status: 'complete' }), null);
    assert.equal(getMemoryAssistanceFailure({ status: 'automatic', appliedCount: 2 }), null);
    assert.equal(getMemoryAssistanceFailure({ status: 'failed', errors: ['Out of credit'] }).message, 'Out of credit');
    assert.equal(getMemoryAssistanceFailure({ status: 'partial', failedBatchCount: 1 }).failedBatchCount, 1);
    assert.equal(getMemoryAssistanceFailure({ status: 'partial', suggestionPassFailed: true }).suggestionPassFailed, true);
    assert.equal(getMemoryAssistanceFailure({ status: 'automatic', failedCount: 1 }).failedCount, 1);
});

test('validates ordinary excerpts and topical replacement', () => {
    const records = [
        { uid: '1', type: 'ordinary', title: 'One', contentHash: 'a' },
        { uid: '2', type: 'topical', title: 'Two', contentHash: 'b' },
    ];
    const scene = [{ id: 10, mes: 'Alice found the brass key.' }];
    const result = parseClipReviewResponse(JSON.stringify({
        1: 'the brass key',
        2: 'Alice has the brass key.',
        missing: 'bad',
    }), records, scene);
    assert.equal(result.length, 2);
    assert.equal(result[0].additions[0].text, 'the brass key');
    assert.deepEqual(result[0].evidenceMessageIds, [10]);
    assert.equal(result[1].proposedContent, 'Alice has the brass key.');
    assert.deepEqual(result[1].evidenceMessageIds, []);

    assert.throws(
        () => parseClipReviewResponse(JSON.stringify({ 1: 'Alice now owns a key.' }), records, scene),
        /none matched/i,
    );
});

test('accepts an empty direct object and rejects the old nested response shape', () => {
    assert.deepEqual(parseClipReviewResponse('{}', [], []), []);
    assert.throws(() => parseClipReviewResponse('{"candidates":[]}', [], []), /none matched/i);
    assert.throws(() => parseClipReviewResponse('[]', [], []), /one JSON object/i);
});

test('renders an explicit cleared report', () => {
    assert.match(renderClipReviewReport({ sceneStart: 1, sceneEnd: 4, candidates: [], status: 'cancelled' }), /no current suggestions/i);
});

test('marks partial reports as incomplete', () => {
    assert.match(renderClipReviewReport({ sceneStart: 1, sceneEnd: 4, candidates: [], status: 'partial' }), /incomplete/i);
});

test('renders persistent topic suggestions and discovery failures', () => {
    const report = renderClipReviewReport({
        sceneStart: 1,
        sceneEnd: 4,
        candidates: [],
        topicSuggestions: [{ topic: 'New Alliance', keywords: ['Alliance', 'Treaty'] }],
        suggestionPassFailed: true,
    });
    assert.match(report, /Suggested New Topical Clips/);
    assert.match(report, /New Alliance — Keywords: Alliance, Treaty/);
    assert.match(report, /discovery failed/i);
});

test('renders a successful empty topic-discovery pass and failed review batches', () => {
    const report = renderClipReviewReport({
        sceneStart: 1,
        sceneEnd: 4,
        candidates: [],
        topicSuggestions: [],
        suggestionPassCompleted: true,
        failedBatchCount: 2,
        status: 'partial',
    });
    assert.match(report, /No new Topical Clip topics/i);
    assert.match(report, /2 review batches failed/i);
});

test('reports automatic applications without leaving pending suggestions', () => {
    const report = renderClipReviewReport({ sceneStart: 1, sceneEnd: 4, candidates: [], status: 'automatic', appliedCount: 2 });
    assert.match(report, /applied 2 Clip updates/i);
    assert.match(report, /no suggestions awaiting review/i);
});

test('reports Topical Clip replacements as awaiting approval in automatic mode', () => {
    const report = renderClipReviewReport({
        sceneStart: 1,
        sceneEnd: 4,
        candidates: [{ uid: '2', type: 'topical', title: 'Two', proposedContent: 'Revised', contentHash: 'b' }],
        status: 'automatic',
        appliedCount: 2,
        reviewCount: 1,
    });
    assert.match(report, /1 Topical Clip update requires approval/i);
    assert.doesNotMatch(report, /no suggestions awaiting review/i);
});
