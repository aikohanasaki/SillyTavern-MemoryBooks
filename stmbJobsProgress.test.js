// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

function jobsHarness() {
    const state = { blocked: false, loaded: true, saves: 0, metadata: { STMemoryBooks: { keep: true } } };
    const source = readFileSync(new URL('./stmbJobs.js', import.meta.url), 'utf8')
        .replace(/^import[\s\S]*?;\r?\n/gm, '').replace(/^export /gm, '');
    const deps = {
        POPUP_RESULT: { CUSTOM1: 1001 }, structuredClone, console, setTimeout, clearTimeout, AbortController,
        translate: fallback => fallback,
        guardPendingProgress: () => state.blocked,
        isProgressChatLoaded: () => state.loaded,
        document: { getElementById: () => ({}) },
        getContext: () => ({
            characterId: 0, chatId: 'A', characters: [{ avatar: 'A.png', chat: 'A', name: 'A' }],
            chatMetadata: state.metadata, saveMetadata: async () => { state.saves++; },
        }),
    };
    const api = vm.runInNewContext(`(function () { ${source}\njobsEnabled = true; return { patchStmbMetadataForChatRef, enqueueStmbJob, registerStmbJobExecutor }; })()`, deps);
    return { state, api };
}

test('generic metadata patches reject inactive chats and asynchronous switches', async () => {
    const { state, api } = jobsHarness();
    const ref = { type: 'character', avatarUrl: 'A.png', fileName: 'A' };
    state.loaded = false;
    await assert.rejects(api.patchStmbMetadataForChatRef(ref, metadata => metadata));
    state.loaded = true;
    await assert.rejects(api.patchStmbMetadataForChatRef(ref, async metadata => {
        state.metadata = { STMemoryBooks: { otherChat: true } };
        return { ...metadata, changed: true };
    }));
    assert.equal(state.saves, 0);
    assert.deepEqual(state.metadata, { STMemoryBooks: { otherChat: true } });
});

test('pending progress rejects new jobs but allows previously queued jobs to drain', async () => {
    const { state, api } = jobsHarness();
    const started = [];
    let release;
    api.registerStmbJobExecutor('memory', async job => {
        started.push(job.title);
        if (job.title === 'first') await new Promise(resolve => release = resolve);
    });
    assert.ok(api.enqueueStmbJob({ type: 'memory', title: 'first' }));
    assert.ok(api.enqueueStmbJob({ type: 'memory', title: 'already queued' }));
    state.blocked = true;
    assert.equal(api.enqueueStmbJob({ type: 'memory', title: 'new request' }), null);
    release();
    await new Promise(resolve => setImmediate(resolve));
    assert.deepEqual(started, ['first', 'already queued']);
    assert.ok(api.enqueueStmbJob({ type: 'memory', title: 'saved-memory resume', payload: { resumeSavedMemory: true } }));
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(started.at(-1), 'saved-memory resume');
});

test('the progress pipeline contains no direct chat replacement endpoint', () => {
    for (const file of ['stmbJobs.js', 'stmbProgress.js', 'pendingProgress.js']) {
        const source = readFileSync(new URL(file, import.meta.url), 'utf8');
        assert.doesNotMatch(source, /\/api\/chats\/(?:group\/)?save/);
    }
});
