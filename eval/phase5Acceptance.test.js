// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// eval/phase5Acceptance.test.js — Unit tests for the Phase 5 acceptance
// harness. Drives the four §6 acceptance criteria as node:test assertions.

import test from 'node:test';
import assert from 'node:assert/strict';

import {
    DEFAULT_FIXTURE,
    DEFAULT_WORLDBOOK,
    PHASE5_DEFAULTS,
    loadFixture,
    prepareLorebook,
    planAuditChunks,
    extractAuditMessages,
    estimateChunkTokens,
    formatChunkText,
    makeFixtureNotes,
    serializeCheckpoint,
    deserializeCheckpoint,
    runAuditWalk,
    chunkCappedCheck,
    findReloadDuplicates,
    findAuditGaps,
    mergeAuditRuns,
} from './phase5Acceptance.js';

// ----------------------------------------------------------------------------
// Fixture loading
// ----------------------------------------------------------------------------

test('loadFixture returns the bundled 328+ message transcript', async () => {
    const { chat, warnings } = await loadFixture();
    assert.ok(Array.isArray(chat), 'chat should be an array');
    // The plan §6 acceptance is "328-msg fixture"; the bundled jsonl is
    // 329 lines (one chat_metadata header + 328 messages). We allow 1-329
    // messages and require >= 320 so the chunk walker has something real
    // to walk.
    assert.ok(chat.length >= 320, `expected >=320 messages, got ${chat.length}`);
    assert.equal(warnings.length, 0, 'no parser warnings expected');
});

test('loadFixture messages carry {mes, name, is_user, is_system}', async () => {
    const { chat } = await loadFixture();
    const m = chat[0];
    assert.ok(m, 'first message should exist');
    for (const k of ['mes', 'name', 'is_user', 'is_system']) {
        assert.ok(k in m, `message should have ${k}`);
    }
});

// ----------------------------------------------------------------------------
// Chunk plan + per-chunk cap
// ----------------------------------------------------------------------------

test('planAuditChunks produces at least 1 chunk for the 328-msg fixture', async () => {
    const { chat } = await loadFixture();
    const msgs = extractAuditMessages(chat);
    const chunks = planAuditChunks(msgs);
    assert.ok(chunks.length >= 1, `expected at least one chunk, got ${chunks.length}`);
    // All messages must be covered by some chunk.
    const total = chunks.reduce((acc, c) => acc + c.msgs.length, 0);
    assert.equal(total, msgs.length, 'all messages should be covered');
});

test('every chunk stays under the per-chunk token cap', async () => {
    const { chat } = await loadFixture();
    const msgs = extractAuditMessages(chat);
    const chunks = planAuditChunks(msgs, {
        chunkSize: PHASE5_DEFAULTS.chunkSize,
        tokenCap: PHASE5_DEFAULTS.tokenCap,
    });
    const check = chunkCappedCheck(chunks, PHASE5_DEFAULTS.tokenCap);
    assert.ok(check.allUnderCap, `expected every chunk <= ${PHASE5_DEFAULTS.tokenCap}; max was ${check.maxSize}`);
    assert.ok(check.maxSize > 0, 'max size should be positive');
});

test('chunk plan for the 328-msg fixture plans into a reasonable number of chunks', async () => {
    const { chat } = await loadFixture();
    const msgs = extractAuditMessages(chat);
    const chunks = planAuditChunks(msgs);
    // 328 / 40 = 9-ish; the plan §6 acceptance check from the P5.1 commit
    // history says "9 chunks all under the 20K-token cap", so anything in
    // [7, 15] is in the right neighborhood.
    assert.ok(chunks.length >= 5 && chunks.length <= 20,
        `expected 5-20 chunks, got ${chunks.length}`);
});

test('extractAuditMessages drops system messages and preserves chat index', async () => {
    const { chat } = await loadFixture();
    const msgs = extractAuditMessages(chat);
    for (const m of msgs) {
        assert.equal(m.is_system, false);
        assert.ok(m.mes.length > 0);
        assert.ok(Number.isInteger(m._chatIndex));
    }
});

test('formatChunkText renders [id] Speaker: text lines', () => {
    const text = formatChunkText([
        { _chatIndex: 0, name: 'Alice', mes: 'hi' },
        { _chatIndex: 1, name: 'Bob', mes: 'hello' },
    ]);
    assert.ok(text.startsWith('[0] Alice: hi'));
    assert.ok(text.includes('[1] Bob: hello'));
});

test('estimateChunkTokens uses char/4 (matches auditorCore)', () => {
    assert.equal(estimateChunkTokens('a'.repeat(400)), 100);
    assert.equal(estimateChunkTokens(''), 0);
    assert.equal(estimateChunkTokens({ mes: 'a'.repeat(400) }), 100);
    assert.equal(estimateChunkTokens(null), 0);
});

// ----------------------------------------------------------------------------
// Checkpoint round-trip
// ----------------------------------------------------------------------------

test('serializeCheckpoint produces a stable v1 blob', () => {
    const blob = serializeCheckpoint({ nextChunk: 7, notes: { items: [{ key: 'A' }] } });
    assert.equal(blob.version, 1);
    assert.equal(blob.nextChunk, 7);
    assert.equal(blob.notes.items[0].key, 'A');
    assert.equal(blob.completed, false);
    assert.ok(typeof blob.lastUpdatedAt === 'string' && blob.lastUpdatedAt.length > 0);
});

test('serializeCheckpoint marks completed when set', () => {
    const blob = serializeCheckpoint({ nextChunk: 9, notes: { items: [] }, completed: true });
    assert.equal(blob.completed, true);
});

test('deserializeCheckpoint round-trips', () => {
    const original = serializeCheckpoint({ nextChunk: 4, notes: { items: [{ key: 'X' }] } });
    const back = deserializeCheckpoint(original);
    assert.equal(back.nextChunk, 4);
    assert.equal(back.notes.items[0].key, 'X');
});

test('deserializeCheckpoint returns empty defaults for null / malformed input', () => {
    const a = deserializeCheckpoint(null);
    const b = deserializeCheckpoint(undefined);
    const c = deserializeCheckpoint({});
    const d = deserializeCheckpoint('not an object');
    for (const v of [a, b, c, d]) {
        assert.equal(v.nextChunk, 0);
        assert.deepEqual(v.notes.items, []);
        assert.equal(v.completed, false);
    }
});

// ----------------------------------------------------------------------------
// Worldbook preparation
// ----------------------------------------------------------------------------

test('prepareLorebook marks every entry stmemorybooks=true', async () => {
    const { entries } = await prepareLorebook(DEFAULT_WORLDBOOK, { plantedKeyword: null });
    for (const e of Object.values(entries)) {
        assert.equal(e.stmemorybooks, true);
    }
});

test('prepareLorebook removes the configured character entry', async () => {
    const deleted = PHASE5_DEFAULTS.deletedCharacter.name;
    const { entries, deletedUid } = await prepareLorebook(DEFAULT_WORLDBOOK, { plantedKeyword: null });
    for (const [uid, e] of Object.entries(entries)) {
        const keys = Array.isArray(e.key) ? e.key.map((k) => String(k).toLowerCase()) : [];
        assert.ok(!keys.includes(deleted.toLowerCase()),
            `entry ${uid} still has deleted character as a key`);
    }
    assert.ok(deletedUid !== null, 'expected a deleted uid to be reported');
});

test('prepareLorebook plants an entry with only the common word as keyword', async () => {
    const { entries, plantedUid } = await prepareLorebook(DEFAULT_WORLDBOOK, {
        plantedKeyword: 'button',
    });
    const planted = entries[String(plantedUid)];
    assert.ok(planted, 'planted entry should exist');
    assert.deepEqual(planted.key, ['button']);
    assert.equal(planted.stmemorybooks, true);
});

test('prepareLorebook leaves the existing "Button Firewood" character intact (multi-keyword; not flagged)', async () => {
    const { entries } = await prepareLorebook(DEFAULT_WORLDBOOK, { plantedKeyword: 'button' });
    // The original "Button" character has multiple keys, so it should NOT
    // be removed by the deletion step (different name from "Gruk") and NOT
    // be the planted entry (different uid).
    const multiKeyButton = Object.values(entries).find(
        (e) => Array.isArray(e.key) && e.key.includes('Button') && e.key.includes('Button Firewood')
    );
    assert.ok(multiKeyButton, 'multi-keyword "Button" character should still be present');
});

// ----------------------------------------------------------------------------
// Coverage report catches a deleted character (criterion 3)
// ----------------------------------------------------------------------------

test('runAuditWalk flags the deleted character in the coverage report', async () => {
    const { chat } = await loadFixture();
    const deleted = PHASE5_DEFAULTS.deletedCharacter.name;
    const { entries } = await prepareLorebook(DEFAULT_WORLDBOOK, { plantedKeyword: null });

    // Known names = every character's keys + the deleted one (so the
    // extractor surfaces it as a character with sightings).
    const knownNames = new Set();
    for (const e of Object.values(entries)) {
        if (Array.isArray(e.key)) for (const k of e.key) knownNames.add(String(k));
    }
    knownNames.add(deleted);

    const walk = await runAuditWalk({
        chat,
        lorebookData: { entries },
        knownNames: Array.from(knownNames),
    });

    assert.ok(walk.reports, 'walk should produce reports');
    assert.ok(walk.reports.coverage, 'coverage report should be present');
    const flaggedKeys = walk.reports.coverage.items.map((i) => i.key);
    assert.ok(flaggedKeys.includes(deleted),
        `coverage report should flag the deleted character "${deleted}"; got ${JSON.stringify(flaggedKeys)}`);
    const deletedItem = walk.reports.coverage.items.find((i) => i.key === deleted);
    assert.ok(['missing', 'thin', 'stale'].includes(deletedItem.severity),
        `deleted character should be missing/thin/stale, got "${deletedItem.severity}"`);
});

// ----------------------------------------------------------------------------
// Technical pass catches a planted keyword collision (criterion 4)
// ----------------------------------------------------------------------------

test('runAuditWalk flags the planted "button" entry in the technical report', async () => {
    const { chat } = await loadFixture();
    const { entries, plantedUid } = await prepareLorebook(DEFAULT_WORLDBOOK, {
        plantedKeyword: 'button',
    });
    const knownNames = new Set();
    for (const e of Object.values(entries)) {
        if (Array.isArray(e.key)) for (const k of e.key) knownNames.add(String(k));
    }
    const walk = await runAuditWalk({
        chat,
        lorebookData: { entries },
        knownNames: Array.from(knownNames),
    });
    assert.ok(walk.reports, 'walk should produce reports');
    const tech = walk.reports.technical;
    const planted = tech.issues.find(
        (i) => Number(i.entryUid) === Number(plantedUid) && i.code === 'keyword-common-only'
    );
    assert.ok(planted, `technical pass should flag the planted entry uid=${plantedUid} as keyword-common-only; got codes: ${tech.issues.map((i) => i.code).join(',')}`);
    // Per auditorTechnicalPass.runTechnicalPass, the keyword-common-only
    // check fires at 'error' severity (this is a real risk to entry firing
    // correctness, not a soft warning).
    assert.equal(planted.severity, 'error');
});

test('runAuditWalk does NOT flag the multi-keyword "Button Firewood" character (existing fixture entry)', async () => {
    const { chat } = await loadFixture();
    const { entries } = await prepareLorebook(DEFAULT_WORLDBOOK, { plantedKeyword: 'button' });
    const knownNames = new Set();
    for (const e of Object.values(entries)) {
        if (Array.isArray(e.key)) for (const k of e.key) knownNames.add(String(k));
    }
    const walk = await runAuditWalk({
        chat,
        lorebookData: { entries },
        knownNames: Array.from(knownNames),
    });
    const tech = walk.reports.technical;
    // The existing Button character has unique keys (Button Firewood, hollow-hide)
    // so the keyword-common-only check should not fire for it.
    const existingButton = tech.issues.find(
        (i) => i.code === 'keyword-common-only' && /button/i.test(i.message)
            && /Button Firewood|hollow-hide/.test(i.message) === false
    );
    // We just want to confirm none of the flagged issues is for the
    // multi-keyword Button character; the planted entry is the only one.
    const plantedCount = tech.issues.filter((i) => i.code === 'keyword-common-only').length;
    assert.ok(plantedCount === 1,
        `expected exactly one keyword-common-only issue (the planted entry), got ${plantedCount}`);
});

// ----------------------------------------------------------------------------
// Reload mid-run produces no duplicates (criterion 2)
// ----------------------------------------------------------------------------

test('runAuditWalk survives a mid-run reload without duplicating work', async () => {
    const { chat } = await loadFixture();
    const { entries } = await prepareLorebook(DEFAULT_WORLDBOOK, { plantedKeyword: 'button' });
    const knownNames = new Set();
    for (const e of Object.values(entries)) {
        if (Array.isArray(e.key)) for (const k of e.key) knownNames.add(String(k));
    }
    const reloadAfter = 3;

    const before = await runAuditWalk({
        chat,
        lorebookData: { entries },
        knownNames: Array.from(knownNames),
        stopAfterChunk: reloadAfter,
    });
    assert.equal(before.cancelled, false);
    assert.equal(before.processedChunks.length, reloadAfter,
        `pre-reload should process exactly ${reloadAfter} chunks, got ${before.processedChunks.length}`);
    assert.equal(before.completed, false);
    assert.ok(before.finalCheckpoint, 'pre-reload should write a final checkpoint');

    // "Reload": a fresh walk, seeded with the pre-reload checkpoint, runs
    // the remaining chunks. The pre-reload's finalCheckpoint.lastUpdatedAt
    // is regenerated on serialize; the test asserts the resumed walk does
    // NOT re-evaluate the already-processed chunks and does not skip any.
    const after = await runAuditWalk({
        chat,
        lorebookData: { entries },
        knownNames: Array.from(knownNames),
        checkpoint: before.finalCheckpoint,
    });

    const merged = mergeAuditRuns(before, after);
    const dupes = findReloadDuplicates(merged.processedChunks);
    const gaps = findAuditGaps(merged.processedChunks, before.totalChunks);

    assert.deepEqual(dupes, [], `reload should not duplicate chunks; got dupes ${JSON.stringify(dupes)}`);
    assert.deepEqual(gaps, [], `reload should not skip chunks; got gaps ${JSON.stringify(gaps)}`);
    assert.equal(merged.completed, true, 'merged run should be complete');
    assert.equal(merged.processedChunks.length, before.totalChunks,
        `merged run should cover all ${before.totalChunks} chunks, got ${merged.processedChunks.length}`);
});

test('runAuditWalk respects an explicit cancel signal at a chunk boundary', async () => {
    const { chat } = await loadFixture();
    const { entries } = await prepareLorebook(DEFAULT_WORLDBOOK, { plantedKeyword: null });
    const knownNames = new Set();
    for (const e of Object.values(entries)) {
        if (Array.isArray(e.key)) for (const k of e.key) knownNames.add(String(k));
    }

    let cancelFired = false;
    const walk = await runAuditWalk({
        chat,
        lorebookData: { entries },
        knownNames: Array.from(knownNames),
        isCancelled: () => cancelFired,
        stopAfterChunk: 1, // first pass completes one chunk
    });
    assert.equal(walk.cancelled, false, 'first chunk should not be cancelled');
    assert.equal(walk.processedChunks.length, 1);

    cancelFired = true;
    const aborted = await runAuditWalk({
        chat,
        lorebookData: { entries },
        knownNames: Array.from(knownNames),
        isCancelled: () => cancelFired,
        checkpoint: walk.finalCheckpoint,
    });
    assert.equal(aborted.cancelled, true, 'cancelled walk should set cancelled=true');
    assert.equal(aborted.processedChunks.length, 0, 'cancelled walk should process 0 chunks');
    assert.equal(aborted.completed, false);
});

// ----------------------------------------------------------------------------
// Per-chunk token cap is real (criterion 1)
// ----------------------------------------------------------------------------

test('walk in production has every chunk under the 20K token cap (criterion 1)', async () => {
    const { chat } = await loadFixture();
    const { entries } = await prepareLorebook(DEFAULT_WORLDBOOK, { plantedKeyword: 'button' });
    const knownNames = new Set();
    for (const e of Object.values(entries)) {
        if (Array.isArray(e.key)) for (const k of e.key) knownNames.add(String(k));
    }
    const walk = await runAuditWalk({
        chat,
        lorebookData: { entries },
        knownNames: Array.from(knownNames),
    });
    const check = chunkCappedCheck(walk.chunks, PHASE5_DEFAULTS.tokenCap);
    assert.ok(check.allUnderCap, `production walk should keep every chunk under ${PHASE5_DEFAULTS.tokenCap}; max was ${check.maxSize}`);
    assert.equal(walk.completed, true, 'uninterrupted walk should complete');
});
