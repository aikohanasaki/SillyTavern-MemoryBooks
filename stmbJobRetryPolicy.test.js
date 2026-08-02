// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import test from 'node:test';
import {
    buildJobRetryPlan,
    buildMemoryOnlyRetryPlan,
    buildRetryJobInput,
    collectCanceledAfterMemoryJobs,
} from './stmbJobRetryPolicy.js';

test('collects only canceled after-memory children from the retried memory', () => {
    const memory = { id: 'memory-1', type: 'memory' };
    const history = [
        { id: 'manual', parentJobId: 'memory-1', type: 'sidePrompt', state: 'canceled', payload: { trigger: 'manual' } },
        { id: 'completed', parentJobId: 'memory-1', type: 'sidePrompt', state: 'completed', payload: { trigger: 'onAfterMemory' } },
        { id: 'other-parent', parentJobId: 'memory-2', type: 'sidePrompt', state: 'canceled', payload: { trigger: 'onAfterMemory' } },
        { id: 'second', parentJobId: 'memory-1', parentJobOrder: 1, type: 'sidePrompt', state: 'canceled', payload: { trigger: 'onAfterMemory' } },
        { id: 'first', parentJobId: 'memory-1', parentJobOrder: 0, type: 'sidePrompt', state: 'canceled', payload: { trigger: 'onAfterMemory' } },
    ];

    assert.deepEqual(
        collectCanceledAfterMemoryJobs(memory, history).map(job => job.id),
        ['first', 'second'],
    );
});

test('memory retry carries canceled child snapshots and consumes their history rows', () => {
    const memory = {
        id: 'memory-1',
        type: 'memory',
        state: 'canceled',
        payload: { sceneData: { sceneStart: 1, sceneEnd: 5 } },
        abortController: new AbortController(),
    };
    const child = {
        id: 'side-1',
        parentJobId: 'memory-1',
        parentJobOrder: 0,
        type: 'sidePrompt',
        state: 'canceled',
        payload: { trigger: 'onAfterMemory', finalPrompt: 'snapshot' },
        abortController: new AbortController(),
    };

    const plan = buildJobRetryPlan(memory, [child]);

    assert.deepEqual(plan.consumedJobIds, ['memory-1', 'side-1']);
    assert.equal(plan.retryInput.id, undefined);
    assert.equal(plan.retryInput.cancelled, false);
    assert.equal(plan.retryInput.payload.retryAfterMemoryJobs.length, 1);
    assert.equal(plan.retryInput.payload.retryAfterMemoryJobs[0].id, undefined);
    assert.equal(plan.retryInput.payload.retryAfterMemoryJobs[0].payload.finalPrompt, 'snapshot');
});

test('retrying an individual side prompt preserves its parent linkage', () => {
    const retryInput = buildRetryJobInput({
        id: 'side-1',
        parentJobId: 'memory-1',
        parentJobOrder: 2,
        type: 'sidePrompt',
        state: 'failed',
        payload: { trigger: 'onAfterMemory' },
    });

    assert.equal(retryInput.parentJobId, 'memory-1');
    assert.equal(retryInput.parentJobOrder, 2);
    assert.equal(retryInput.state, 'queued');
});

test('a repeated memory retry preserves previously carried child snapshots', () => {
    const memory = {
        id: 'memory-retry',
        type: 'memory',
        state: 'failed',
        payload: {
            retryAfterMemoryJobs: [
                { type: 'sidePrompt', payload: { trigger: 'onAfterMemory', finalPrompt: 'snapshot' } },
            ],
        },
    };

    const plan = buildJobRetryPlan(memory, []);

    assert.equal(plan.retryInput.payload.retryAfterMemoryJobs.length, 1);
    assert.equal(plan.retryInput.payload.retryAfterMemoryJobs[0].payload.finalPrompt, 'snapshot');
});

test('a complete carried set is not replaced by a truncated child history', () => {
    const memory = {
        id: 'memory-canceled',
        type: 'memory',
        state: 'canceled',
        payload: {
            retryAfterMemoryJobs: [
                { type: 'sidePrompt', payload: { trigger: 'onAfterMemory', finalPrompt: 'first' } },
                { type: 'sidePrompt', payload: { trigger: 'onAfterMemory', finalPrompt: 'second' } },
            ],
        },
    };
    const visibleChild = {
        id: 'side-visible',
        parentJobId: 'memory-canceled',
        parentJobOrder: 1,
        type: 'sidePrompt',
        state: 'canceled',
        payload: { trigger: 'onAfterMemory', finalPrompt: 'second' },
    };

    const plan = buildJobRetryPlan(memory, [visibleChild]);

    assert.equal(plan.retryInput.payload.retryAfterMemoryJobs.length, 2);
    assert.deepEqual(plan.consumedJobIds, ['memory-canceled', 'side-visible']);
});

test('a memory already saved before cancellation resumes at post-save', () => {
    const memory = {
        id: 'memory-saved',
        type: 'memory',
        state: 'canceled',
        result: { lorebookName: 'Book', entryTitle: '[001] Memory' },
        payload: { sceneData: { sceneStart: 1, sceneEnd: 5 } },
    };

    const plan = buildJobRetryPlan(memory, []);

    assert.equal(plan.retryInput.payload.resumeSavedMemory, true);
    assert.deepEqual(
        plan.retryInput.payload.retryMemoryResult,
        { lorebookName: 'Book', entryTitle: '[001] Memory' },
    );
});

test('a memory canceled before save still retries generation', () => {
    const memory = {
        id: 'memory-unsaved',
        type: 'memory',
        state: 'canceled',
        result: null,
        payload: { sceneData: { sceneStart: 1, sceneEnd: 5 } },
    };

    const plan = buildJobRetryPlan(memory, []);

    assert.equal(plan.retryInput.payload.resumeSavedMemory, undefined);
    assert.equal(plan.retryInput.payload.retryMemoryResult, undefined);
});

test('a failed memory is not treated as a canceled post-save resume', () => {
    const memory = {
        id: 'memory-failed',
        type: 'memory',
        state: 'failed',
        result: { lorebookName: 'Book', entryTitle: '[001] Memory' },
        payload: { sceneData: { sceneStart: 1, sceneEnd: 5 } },
    };

    const plan = buildJobRetryPlan(memory, []);

    assert.equal(plan.retryInput.payload.resumeSavedMemory, undefined);
});

test('memory-only retry drops child snapshots and suppresses after-memory jobs', () => {
    const memory = {
        id: 'memory-canceled',
        type: 'memory',
        state: 'canceled',
        result: { lorebookName: 'Book', entryTitle: '[001] Memory' },
        payload: {
            retryAfterMemoryJobs: [
                { type: 'sidePrompt', payload: { trigger: 'onAfterMemory' } },
            ],
            resumeSavedMemory: true,
            retryMemoryResult: { lorebookName: 'Book', entryTitle: '[001] Memory' },
        },
    };

    const plan = buildMemoryOnlyRetryPlan(memory);

    assert.deepEqual(plan.consumedJobIds, ['memory-canceled']);
    assert.equal(plan.retryInput.payload.skipAfterMemoryJobs, true);
    assert.equal(plan.retryInput.payload.retryAfterMemoryJobs, undefined);
    assert.equal(plan.retryInput.payload.resumeSavedMemory, true);
    assert.deepEqual(
        plan.retryInput.payload.retryMemoryResult,
        { lorebookName: 'Book', entryTitle: '[001] Memory' },
    );
});

test('unsaved memory-only retry regenerates without after-memory jobs', () => {
    const plan = buildMemoryOnlyRetryPlan({
        id: 'memory-unsaved',
        type: 'memory',
        state: 'failed',
        payload: {},
    });

    assert.equal(plan.retryInput.payload.skipAfterMemoryJobs, true);
    assert.equal(plan.retryInput.payload.resumeSavedMemory, undefined);
});
