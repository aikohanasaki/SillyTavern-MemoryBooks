// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import test from 'node:test';
import { createNarratorGenerationState } from './narratorGenerationState.js';
import { getNarratorSceneParticipants, stampNarratorCast } from './narratorMode.js';

const processorFor = (chat, messageId, overrides = {}) => ({
    messageId, isFinished: true, isStopped: false,
    abortController: { signal: { aborted: false } }, ...overrides,
});

function start(state, chat, type = 'normal', castIds = ['alice'], options = {}) {
    state.start({ chat, type, castIds, chatKey: 'chat-a', narratorMode: true, ...options });
}

function receive(state, chat, messageId, type = 'normal', processor = null, options = {}) {
    return state.receive({ chat, messageId, type, processor, chatKey: 'chat-a', narratorMode: true, ...options });
}

test('streaming completion stamps its original cast after generation ended and survives metadata roundtrip', () => {
    const state = createNarratorGenerationState();
    const chat = [{ is_user: true, extra: {} }];
    start(state, chat, 'normal', ['alice']);
    const reply = { is_user: false, extra: {}, swipe_id: 0, swipe_info: [{ extra: {} }], gen_started: new Date(100) };
    chat.push(reply);
    const processor = processorFor(chat, 1);
    state.end({ processor, chat });
    assert.equal(receive(state, chat, 0, 'first_message', processor), null);
    const generation = receive(state, chat, 1, 'normal', processor);
    assert.deepEqual(generation, { castIds: ['alice'], merge: false });
    stampNarratorCast(reply, generation.castIds, { merge: generation.merge });
    assert.deepEqual(JSON.parse(JSON.stringify(reply)).swipe_info[0].extra.STMemoryBooks.narratorCast.memberIds, ['alice']);
    assert.equal(getNarratorSceneParticipants(chat).hasUntaggedMessages, false);
    assert.equal(receive(state, chat, 1, 'normal', processor), null);
});

test('non-streaming receipt precedes generation end and empty cast is explicit', () => {
    const state = createNarratorGenerationState();
    const chat = [{ is_user: true }];
    start(state, chat, 'normal', []);
    chat.push({ is_user: false, extra: {}, swipe_id: 0, swipe_info: [{ extra: {} }] });
    const generation = receive(state, chat, 1);
    assert.deepEqual(generation.castIds, []);
    stampNarratorCast(chat[1], generation.castIds);
    state.end({ processor: null, chat });
    assert.deepEqual(chat[1].swipe_info[0].extra.STMemoryBooks.narratorCast.memberIds, []);
    assert.equal(getNarratorSceneParticipants(chat).hasUntaggedMessages, false);
});

test('the cast snapshot does not change when the drawer selection changes mid-generation', () => {
    const state = createNarratorGenerationState();
    const chat = [{ is_user: true }];
    const selected = ['alice'];
    start(state, chat, 'normal', selected);
    selected[0] = 'bob';
    chat.push({ is_user: false });
    assert.deepEqual(receive(state, chat, 1)?.castIds, ['alice']);
});

test('regeneration and swipes bind the intended active swipe', () => {
    for (const type of ['regenerate', 'swipe']) {
        const state = createNarratorGenerationState();
        const reply = { is_user: false, swipe_id: 0, swipe_info: [{ extra: {} }] };
        const chat = [reply];
        start(state, chat, type);
        reply.swipe_id = 1;
        reply.swipe_info.push({ extra: {} });
        reply.gen_started = new Date(123);
        const processor = processorFor(chat, 0);
        state.end({ processor, chat });
        assert.deepEqual(receive(state, chat, 0, type, processor)?.castIds, ['alice']);
    }
});

test('non-streaming regeneration may replace the previous assistant object', () => {
    const state = createNarratorGenerationState();
    const chat = [{ is_user: false, extra: {} }];
    start(state, chat, 'regenerate');
    chat[0] = { is_user: false, extra: {} };
    assert.deepEqual(receive(state, chat, 0, 'regenerate')?.castIds, ['alice']);
});

test('continuations merge the captured cast with existing message metadata', () => {
    const state = createNarratorGenerationState();
    const reply = { is_user: false, extra: {}, swipe_id: 0, swipe_info: [{ extra: {} }] };
    stampNarratorCast(reply, ['bob']);
    const chat = [reply];
    start(state, chat, 'continue', ['alice']);
    const processor = processorFor(chat, 0);
    state.end({ processor, chat });
    const generation = receive(state, chat, 0, 'continue', processor);
    assert.equal(generation.merge, true);
    stampNarratorCast(reply, generation.castIds, { merge: generation.merge });
    assert.deepEqual(reply.extra.STMemoryBooks.narratorCast.memberIds, ['bob', 'alice']);
});

test('stopped, aborted and incomplete streams never stamp a partial reply', () => {
    for (const overrides of [{ isStopped: true }, { isFinished: false }, { abortController: { signal: { aborted: true } } }]) {
        const state = createNarratorGenerationState();
        const chat = [{ is_user: true }, { is_user: false }];
        start(state, chat);
        const processor = processorFor(chat, 1, overrides);
        state.end({ processor, chat });
        assert.equal(receive(state, chat, 1, 'normal', processor), null);
    }
});

test('non-response generations and explicit stop leave no pending cast', () => {
    for (const options of [{ dryRun: true }, { type: 'quiet' }, { type: 'impersonate' }, { narratorMode: false }]) {
        const state = createNarratorGenerationState();
        const chat = [{ is_user: true }];
        start(state, chat, options.type || 'normal', ['alice'], options);
        chat.push({ is_user: false });
        assert.equal(receive(state, chat, 1), null);
    }
    const state = createNarratorGenerationState();
    const chat = [{ is_user: true }, { is_user: false }];
    start(state, chat);
    state.clear();
    assert.equal(receive(state, chat, 1), null);
    start(state, chat);
    state.end({ processor: null, chat });
    assert.equal(receive(state, chat, 1), null);
    start(state, chat);
    start(state, chat, 'quiet');
    assert.equal(receive(state, chat, 1), null);
});

test('bound target rejects chat switch, replacement, changed swipe, and unrelated receipts', () => {
    for (const change of ['chat', 'replace', 'swipe', 'timestamp', 'first_message']) {
        const state = createNarratorGenerationState();
        const chat = [{ is_user: true }, { is_user: false, swipe_id: 0, gen_started: new Date(100) }];
        start(state, chat);
        const processor = processorFor(chat, 1);
        state.end({ processor, chat });
        if (change === 'replace') chat[1] = { ...chat[1] };
        if (change === 'swipe') chat[1].swipe_id = 1;
        if (change === 'timestamp') chat[1].gen_started = new Date(101);
        assert.equal(receive(state, chat, 1, change === 'first_message' ? 'first_message' : 'normal', processor,
            change === 'chat' ? { chatKey: 'chat-b' } : {}), null);
    }
});
