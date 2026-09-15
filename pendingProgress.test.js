// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createPendingProgressController, progressFingerprint, progressSourceMessages, validatePendingProgress } from './pendingProgress.js';

const clone = value => structuredClone(value);
const hash = value => createHash('sha256').update(value).digest('hex');
const message = (mes, index) => ({ mes, name: 'Character', is_user: false, send_date: index, extra: {} });
function fixture(type = 'character') {
    const chatRef = type === 'group'
        ? { type, groupId: 'group', chatId: 'A', fileName: 'A' }
        : { type, avatarUrl: 'A.png', fileName: 'A' };
    const original = {
        chatKey: 'A', chatRef, loaded: true, busy: false,
        metadata: { integrity: 'integrity-A', unrelated: { retained: true }, STMemoryBooks: { other: 'keep' } },
        messages: [message('first', 1), message('second', 2)],
    };
    const state = {
        live: clone(original), disk: [{ chat_metadata: clone(original.metadata) }, ...clone(original.messages)],
        settings: {}, durable: {}, saves: 0, reads: 0, settingsFailure: false, saveFailure: false,
        onSave: null, onPersist: null,
    };
    const dependencies = {
        settings: () => state.settings, current: () => state.live, hash,
        persist: async value => {
            if (state.onPersist) await state.onPersist(value);
            if (state.settingsFailure) throw new Error('settings unavailable');
            state.durable.pendingProgress = clone(value);
        },
        readChat: async ref => { assert.deepEqual(ref, chatRef); state.reads++; return clone(state.disk); },
        saveCurrent: async () => {
            state.saves++;
            if (!state.saveFailure) state.disk = [{ chat_metadata: clone(state.live.metadata) }, ...clone(state.live.messages)];
            if (state.onSave) await state.onSave();
        },
    };
    const controller = createPendingProgressController(dependencies);
    const record = (id = 'job-1', end = 1) => ({
        version: 1, id, jobId: id, chatKey: 'A', chatRef, end,
        origin: { chatKey: 'A', integrity: 'integrity-A', revision: '', highest: null, manuallySet: false,
            fingerprint: progressFingerprint(original.messages, end, hash) },
    });
    return { state, original, dependencies, controller, record };
}

for (const type of ['character', 'group']) {
    test(`${type}: inactive updates persist without reading or saving a chat; reload then apply`, async () => {
        const f = fixture(type);
        f.state.live.chatKey = 'B';
        assert.equal((await f.controller.update(f.record())).status, 'pending');
        assert.equal(f.state.saves, 0);
        assert.equal(f.state.reads, 0);
        assert.equal(f.controller.has('A'), true);
        assert.equal(f.controller.has('B'), false);
        f.state.settings = clone(f.state.durable);
        const restored = createPendingProgressController(f.dependencies);
        f.state.live = clone(f.original);
        assert.equal((await restored.apply(['job-1'])).status, 'applied');
        assert.equal(f.state.disk[0].chat_metadata.STMemoryBooks.highestMemoryProcessed, 1);
        assert.deepEqual(f.state.disk.slice(1), f.original.messages);
        assert.deepEqual(f.state.disk[0].chat_metadata.unrelated, { retained: true });
        assert.equal(f.state.disk[0].chat_metadata.STMemoryBooks.other, 'keep');
        assert.equal(restored.has('A'), false);
    });
}

test('fingerprints survive projection and hiding, allow appends, detect text changes without inspecting attachments', () => {
    const f = fixture();
    assert.equal(progressFingerprint(progressSourceMessages(f.original.messages), 1, hash), f.record().origin.fingerprint);
    f.state.live.messages[0].is_system = true;
    f.state.live.messages.push(message('append', 3));
    assert.equal(validatePendingProgress(f.record(), f.state.live, hash), null);
    f.state.live.messages[0].extra.media = [{ url: 'changed.png' }];
    assert.equal(validatePendingProgress(f.record(), f.state.live, hash), null);
    f.state.live.messages = [message('edited', 1), message('second', 2)];
    assert.equal(validatePendingProgress(f.record(), f.state.live, hash), 'messages');
});

test('progress capture never reads attachment fields', () => {
    const f = fixture();
    Object.defineProperty(f.state.live.messages[0], 'extra', {
        get() { throw new Error('Attachments must not be read'); },
    });
    assert.equal(progressFingerprint(f.state.live.messages, 1, hash), f.record().origin.fingerprint);
});

test('empty, loading, different identity, deletion, reset, and rollback cannot apply', async () => {
    const changes = [
        live => live.messages.length = 0,
        live => live.loaded = false,
        live => live.metadata.integrity = 'branch',
        live => live.messages.pop(),
        live => live.metadata.STMemoryBooks.progressRevision = 'manual-reset',
        live => live.metadata.STMemoryBooks.progressRevision = 'rollback',
    ];
    for (const change of changes) {
        const f = fixture();
        change(f.state.live);
        await f.controller.update(f.record());
        assert.notEqual((await f.controller.apply(['job-1'])).status, 'applied');
        assert.equal(f.state.saves, 0);
        assert.equal(f.controller.has('A'), true);
    }
});

test('failed settings save retains memory gate; explicit retry persists it', async () => {
    const f = fixture();
    f.state.live.chatKey = 'B';
    f.state.settingsFailure = true;
    assert.equal((await f.controller.update(f.record())).status, 'persistence-error');
    assert.equal(f.controller.has('A'), true);
    assert.equal(f.state.durable.pendingProgress, undefined);
    f.state.settingsFailure = false;
    await f.controller.retryPersistence();
    assert.ok(f.state.durable.pendingProgress.records['job-1']);
});

test('a swallowed core save failure never reports success or clears the record', async () => {
    const f = fixture();
    f.state.saveFailure = true;
    const result = await f.controller.update(f.record());
    assert.equal(result.status, 'pending');
    assert.equal(f.controller.has('A'), true);
    // Metadata changed in memory, but the disk verification still fails on a retry.
    assert.equal((await f.controller.apply(['job-1'])).status, 'pending');
    assert.equal(f.controller.has('A'), true);
    f.state.saveFailure = false;
    assert.equal((await f.controller.apply(['job-1'])).status, 'applied');
    assert.equal(f.controller.has('A'), false);
});

test('cleanup failure and refresh after a chat save recover without another chat write', async () => {
    const f = fixture();
    f.state.live.chatKey = 'B';
    await f.controller.update(f.record());
    f.state.live = clone(f.original);
    f.state.settingsFailure = true;
    const result = await f.controller.apply(['job-1']);
    assert.equal(result.reason, 'cleanup');
    assert.equal(f.controller.has('A'), true);
    assert.equal(f.state.saves, 1);
    f.state.settingsFailure = false;
    f.state.settings = clone(f.state.durable);
    const recovered = createPendingProgressController(f.dependencies);
    assert.equal((await recovered.apply(['job-1'])).status, 'applied');
    assert.equal(f.state.saves, 1);
    assert.equal(recovered.has('A'), false);
});

test('duplicate records coalesce; selected IDs retire while new arrivals remain', async () => {
    const f = fixture();
    f.state.live.chatKey = 'B';
    await f.controller.update(f.record());
    await f.controller.update(f.record());
    assert.equal(f.controller.list().length, 1);
    f.state.live = clone(f.original);
    f.state.onSave = async () => { await f.controller.update(f.record('job-2', 0)); };
    assert.equal((await f.controller.apply(['job-1'])).status, 'applied');
    assert.deepEqual(f.controller.list().map(record => record.id), ['job-2']);
    assert.equal(f.state.disk[0].chat_metadata.STMemoryBooks.highestMemoryProcessed, 1);
});

test('switch during save retains pending work and does not touch the new chat', async () => {
    const f = fixture();
    f.state.onSave = async () => { f.state.live = { ...clone(f.original), chatKey: 'B', metadata: { integrity: 'B' } }; };
    await f.controller.update(f.record());
    assert.equal(f.controller.has('A'), true);
    assert.deepEqual(f.state.live.metadata, { integrity: 'B' });
});

test('invalidated and malformed records remain discardable, including unsupported collections', async () => {
    const f = fixture();
    f.state.live.chatKey = 'B';
    await f.controller.update(f.record());
    await f.controller.invalidate('A');
    f.state.live = clone(f.original);
    assert.equal((await f.controller.apply(['job-1'])).status, 'conflict');
    await f.controller.discard(['job-1']);
    assert.equal(f.state.saves, 0);
    f.state.settings.pendingProgress = { version: 99, data: 'keep until explicit discard' };
    assert.equal(f.controller.has('A'), true);
    await f.controller.discard(['__unsupported__']);
    assert.equal(f.controller.has('A'), false);
});

test('explicit rename remaps records; ordinary higher progress is not lowered', async () => {
    const f = fixture();
    f.state.live.chatKey = 'B';
    await f.controller.update(f.record());
    await f.controller.remap(ref => ({ chatRef: { ...ref, fileName: 'renamed' }, chatKey: 'renamed' }));
    assert.equal(f.controller.has('A'), false);
    assert.equal(f.controller.has('renamed'), true);
    const higher = fixture();
    higher.state.live.metadata.STMemoryBooks.highestMemoryProcessed = 4;
    higher.state.disk[0].chat_metadata.STMemoryBooks.highestMemoryProcessed = 4;
    assert.equal((await higher.controller.update(higher.record())).status, 'applied');
    assert.equal(higher.state.saves, 0);
    assert.equal(higher.state.live.metadata.STMemoryBooks.highestMemoryProcessed, 4);
});

test('the gate remains closed until settings confirms record removal', async () => {
    const f = fixture();
    f.state.live.chatKey = 'B';
    await f.controller.update(f.record());
    f.state.onPersist = async value => {
        if (!Object.keys(value.records).length) {
            assert.equal(f.controller.has('A'), true);
            assert.equal(f.controller.list().length, 1);
        }
    };
    await f.controller.discard(['job-1']);
    assert.equal(f.controller.has('A'), false);
});

test('header-only verification cannot clear a record or trigger a replacement write on retry', async () => {
    const f = fixture();
    f.state.onSave = async () => { f.state.disk = [f.state.disk[0]]; };
    assert.equal((await f.controller.update(f.record())).status, 'pending');
    const previousSaves = f.state.saves;
    assert.equal((await f.controller.apply(['job-1'])).status, 'pending');
    assert.equal(f.state.saves, previousSaves);
    assert.equal(f.controller.has('A'), true);
});
