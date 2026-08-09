// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import test from 'node:test';
import assert from 'node:assert/strict';
import {
    STMB_AUTO_DEFAULTS,
    resolveStmbAutoConfig,
    planAutoMemoryChunks,
    buildStmbAutoSummary,
} from './stmbAutoCore.js';

test('resolveStmbAutoConfig', async (t) => {
    await t.test('falls back to defaults when nothing is configured', () => {
        assert.deepEqual(resolveStmbAutoConfig(undefined, undefined), STMB_AUTO_DEFAULTS);
    });

    await t.test('global overrides defaults', () => {
        const cfg = resolveStmbAutoConfig({ auto: { memoryInterval: 10 } }, undefined);
        assert.equal(cfg.memoryInterval, 10);
        assert.equal(cfg.bulkGenerateCap, STMB_AUTO_DEFAULTS.bulkGenerateCap);
    });

    await t.test('per-chat overrides global', () => {
        const cfg = resolveStmbAutoConfig(
            { auto: { memoryInterval: 10 } },
            { stmbc: { auto: { memoryInterval: 5 } } },
        );
        assert.equal(cfg.memoryInterval, 5);
    });

    await t.test('ignores null/undefined override values', () => {
        const cfg = resolveStmbAutoConfig({ auto: { memoryInterval: null } }, undefined);
        assert.equal(cfg.memoryInterval, STMB_AUTO_DEFAULTS.memoryInterval);
    });
});

test('planAutoMemoryChunks', async (t) => {
    await t.test('fresh chat, unset watermark, starts at 0', () => {
        const chunks = planAutoMemoryChunks(null, 9, 5);
        assert.deepEqual(chunks, [{ start: 0, end: 4 }, { start: 5, end: 9 }]);
    });

    await t.test('resumes from one past the watermark', () => {
        const chunks = planAutoMemoryChunks(4, 9, 5);
        assert.deepEqual(chunks, [{ start: 5, end: 9 }]);
    });

    await t.test('already caught up returns no chunks', () => {
        assert.deepEqual(planAutoMemoryChunks(9, 9, 5), []);
    });

    await t.test('watermark past the end of the chat (stale/edited) returns no chunks', () => {
        assert.deepEqual(planAutoMemoryChunks(20, 9, 5), []);
    });

    await t.test('interval larger than the whole chat produces one chunk', () => {
        assert.deepEqual(planAutoMemoryChunks(null, 9, 100), [{ start: 0, end: 9 }]);
    });

    await t.test('last chunk is clipped to lastIndex, not padded', () => {
        const chunks = planAutoMemoryChunks(null, 11, 5);
        assert.deepEqual(chunks, [{ start: 0, end: 4 }, { start: 5, end: 9 }, { start: 10, end: 11 }]);
    });

    await t.test('invalid/negative interval falls back to the default', () => {
        const chunks = planAutoMemoryChunks(null, 30, -1);
        assert.equal(chunks[0].end - chunks[0].start + 1, STMB_AUTO_DEFAULTS.memoryInterval);
    });

    await t.test('no messages at all (lastIndex < 0) returns no chunks', () => {
        assert.deepEqual(planAutoMemoryChunks(null, -1, 5), []);
    });
});

test('buildStmbAutoSummary', async (t) => {
    await t.test('reports a freshly created lorebook', () => {
        const msg = buildStmbAutoSummary({
            lorebookName: 'LTM - Foo',
            lorebookCreated: true,
            memoriesPlanned: 0,
            memoriesCreated: 0,
            loreGenerated: 0,
            loreSkipped: 0,
        });
        assert.match(msg, /Created and bound lorebook "LTM - Foo"/);
        assert.match(msg, /No new scenes to summarize\./);
        assert.match(msg, /No missing or thin character\/location entries found\./);
    });

    await t.test('reports an existing lorebook without claiming creation', () => {
        const msg = buildStmbAutoSummary({ lorebookName: 'LTM - Foo', lorebookCreated: false });
        assert.match(msg, /Lorebook: "LTM - Foo"\./);
        assert.doesNotMatch(msg, /Created and bound/);
    });

    await t.test('pluralizes a single created memory correctly', () => {
        const msg = buildStmbAutoSummary({ memoriesPlanned: 1, memoriesCreated: 1 });
        assert.match(msg, /1\/1 scene memory created\./);
    });

    await t.test('pluralizes multiple created memories correctly', () => {
        const msg = buildStmbAutoSummary({ memoriesPlanned: 3, memoriesCreated: 2 });
        assert.match(msg, /2\/3 scene memories created\./);
    });

    await t.test('surfaces a skip reason instead of the planned/created count', () => {
        const msg = buildStmbAutoSummary({ memoriesPlanned: 3, memoriesCreated: 0, memorySkipReason: 'no lorebook bound' });
        assert.match(msg, /Scene memories skipped: no lorebook bound/);
        assert.doesNotMatch(msg, /0\/3/);
    });

    await t.test('includes the audit message when present', () => {
        const msg = buildStmbAutoSummary({ auditMessage: 'Audit complete: 2 chunks · 5 characters.' });
        assert.match(msg, /Audit complete: 2 chunks · 5 characters\./);
    });

    await t.test('prefers an explicit lore message over the generic no-op line', () => {
        const msg = buildStmbAutoSummary({ loreMessage: 'Generated 3/3 entries into "LTM - Foo".', loreGenerated: 3 });
        assert.match(msg, /Generated 3\/3 entries/);
        assert.doesNotMatch(msg, /No missing or thin/);
    });
});
