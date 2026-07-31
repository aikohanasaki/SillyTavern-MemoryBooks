// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// eval/groundTruth.test.js — Unit tests for header-derived ground truth.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
    parseTimeToMinutes,
    computeRawBoundaries,
    mergeShortScenes,
    deriveGroundTruth,
} from './groundTruth.js';

const narr = (index, opts) => ({
    index,
    isUser: false,
    isSystem: false,
    headers: opts,
});
const user = (index) => ({ index, isUser: true, isSystem: false, headers: null });

// ----------------------------------------------------------------------------
// parseTimeToMinutes
// ----------------------------------------------------------------------------

test('parseTimeToMinutes handles 12-hour format', () => {
    assert.equal(parseTimeToMinutes('11:47 PM'), 23 * 60 + 47);
    assert.equal(parseTimeToMinutes('12:00 AM'), 0);
    assert.equal(parseTimeToMinutes('12:00 PM'), 12 * 60);
    assert.equal(parseTimeToMinutes('1:30 AM'), 90);
});

test('parseTimeToMinutes handles 24-hour format', () => {
    assert.equal(parseTimeToMinutes('09:00'), 9 * 60);
    assert.equal(parseTimeToMinutes('23:59'), 23 * 60 + 59);
});

test('parseTimeToMinutes returns null for invalid input', () => {
    assert.equal(parseTimeToMinutes(null), null);
    assert.equal(parseTimeToMinutes(''), null);
    assert.equal(parseTimeToMinutes('not a time'), null);
});

// ----------------------------------------------------------------------------
// computeRawBoundaries
// ----------------------------------------------------------------------------

test('computeRawBoundaries starts a scene at the first narrator', () => {
    const messages = [
        user(1),
        narr(2, { location: 'A', time: '9:00 AM' }),
        narr(3, { location: 'A', time: '9:01 AM' }),
    ];
    const { raw, detail } = computeRawBoundaries(messages);
    assert.deepEqual(raw, [2]);
    assert.equal(detail.length, 2);
    assert.equal(detail[0].isBoundary, true);
    assert.equal(detail[1].isBoundary, false);
});

test('computeRawBoundaries flags location change', () => {
    const messages = [
        narr(1, { location: 'A', time: '9:00 AM' }),
        narr(2, { location: 'B', time: '9:05 AM' }),
    ];
    const { raw } = computeRawBoundaries(messages);
    assert.deepEqual(raw, [1, 2]);
});

test('computeRawBoundaries flags >90 min time jump as boundary', () => {
    const messages = [
        narr(1, { location: 'A', time: '9:00 AM' }),
        narr(2, { location: 'A', time: '11:00 AM' }),
    ];
    const { raw } = computeRawBoundaries(messages, { timeJumpMinutes: 90 });
    assert.deepEqual(raw, [1, 2]);
});

test('computeRawBoundaries does NOT flag a 30 min time jump', () => {
    const messages = [
        narr(1, { location: 'A', time: '9:00 AM' }),
        narr(2, { location: 'A', time: '9:30 AM' }),
    ];
    const { raw } = computeRawBoundaries(messages, { timeJumpMinutes: 90 });
    assert.deepEqual(raw, [1]);
});

test('computeRawBoundaries wraps midnight correctly', () => {
    const messages = [
        narr(1, { location: 'A', time: '11:30 PM' }),
        narr(2, { location: 'A', time: '12:30 AM' }),
    ];
    const { raw } = computeRawBoundaries(messages, { timeJumpMinutes: 90 });
    // 60 min forward — under 90, no boundary.
    assert.deepEqual(raw, [1]);
});

// ----------------------------------------------------------------------------
// mergeShortScenes
// ----------------------------------------------------------------------------

test('mergeShortScenes keeps long scenes intact', () => {
    const raw = [1, 10, 20]; // scene lengths 10, 10, 1 (totalMessages=20)
    const merged = mergeShortScenes([...Array(20).keys()].map((i) => ({ index: i + 1 })), raw, { minSceneMessages: 6 });
    // scene 1: [1,9] length 9, scene 2: [10,19] length 10, scene 3: [20,20] length 1.
    // Only the last (length 1) gets merged into scene 2.
    assert.deepEqual(merged.merged, [1, 10]);
    assert.deepEqual(merged.dropped, [20]);
});

test('mergeShortScenes (accumulate) drops the fewest boundaries that satisfy the minimum', () => {
    const raw = [1, 5, 7, 9, 20];
    const messages = [...Array(20).keys()].map((i) => ({ index: i + 1 }));
    const merged = mergeShortScenes(messages, raw, { minSceneMessages: 6 });
    // raw scene lengths: [4, 2, 2, 11, 1].
    // Scene 0 is 4 long, so boundary 5 is dropped and it grows to 6 — now long
    // enough, so boundary 7 SURVIVES. Scene [7,8] is 2 long, so boundary 9 is
    // dropped and it grows to 13. Boundary 20 survives the walk but its scene
    // is only 1 message and nothing follows it, so the trailing fold-back
    // removes it. Kept scene lengths: [6, 14].
    assert.deepEqual(merged.merged, [1, 7]);
    assert.deepEqual(merged.dropped, [5, 9, 20]);
    assert.deepEqual(merged.sceneLengths, [6, 14]);
});

test("mergeShortScenes (legacy 'own') collapses runs of short scenes wholesale", () => {
    const raw = [1, 5, 7, 9, 20];
    const messages = [...Array(20).keys()].map((i) => ({ index: i + 1 }));
    const merged = mergeShortScenes(messages, raw, { minSceneMessages: 6, mergeMode: 'own' });
    // Same input, the pre-PHA-1555 rule: every scene whose OWN length is < 6
    // loses its boundary regardless of how long the scene it merges into is.
    // Two boundaries survive here instead of accumulate's two, but on the real
    // fixture this is what turns 67 raw boundaries into 22 instead of 36.
    assert.deepEqual(merged.merged, [1, 9]);
    assert.deepEqual(merged.dropped, [5, 7, 20]);
});

test('mergeShortScenes leaves no kept scene below the minimum, in either mode', () => {
    const raw = [1, 3, 6, 8, 14, 16];
    const messages = [...Array(20).keys()].map((i) => ({ index: i + 1 }));
    for (const mergeMode of ['accumulate', 'own']) {
        const merged = mergeShortScenes(messages, raw, { minSceneMessages: 6, mergeMode });
        for (const len of merged.sceneLengths) {
            assert.ok(len >= 6, `${mergeMode}: scene of length ${len} survived the merge`);
        }
        assert.equal(merged.merged.length, merged.sceneLengths.length);
    }
});

test('mergeShortScenes handles empty input', () => {
    assert.deepEqual(mergeShortScenes([], []).merged, []);
});

// ----------------------------------------------------------------------------
// High-level: deriveGroundTruth on the plan's spec
// ----------------------------------------------------------------------------

test('deriveGroundTruth produces boundaries list and detailed debug info', () => {
    const messages = [
        narr(1, { location: 'A', time: '9:00 AM' }),
        narr(2, { location: 'A', time: '9:01 AM' }),
        narr(3, { location: 'A', time: '9:02 AM' }),
        narr(4, { location: 'A', time: '9:03 AM' }),
        narr(5, { location: 'A', time: '9:04 AM' }),
        narr(6, { location: 'A', time: '9:05 AM' }),
        narr(7, { location: 'B', time: '9:06 AM' }),
    ];
    const r = deriveGroundTruth(messages, { minSceneMessages: 6 });
    // First scene: indices 1-6 (length 6, kept). Second scene: index 7, but
    // its length is 1 which is below minSceneMessages=6, so it merges.
    assert.deepEqual(r.boundaries, [1]);
    assert.equal(r.sceneLengths.length, 1);
    assert.equal(r.sceneLengths[0], 7);
});