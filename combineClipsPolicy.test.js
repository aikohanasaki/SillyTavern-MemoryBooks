// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import test from 'node:test';
import { areCombineSourcesCurrent, buildCombineClipsPrompt, isTopicalClipForCombination, snapshotCombineSource, unionClipKeywords } from './combineClipsPolicy.js';

const topical = (uid, title, content, key = []) => ({
    uid, comment: `${title} [STMB Clip]`, content, key,
    data: { extensions: { aikobots: { topical_clip: { version: 2 } } } },
});

test('combination accepts only topical clips and requires at least two', () => {
    const first = topical(1, 'Alice', 'Alice is here.', ['Alice']);
    assert.equal(isTopicalClipForCombination(first), true);
    assert.equal(isTopicalClipForCombination({ ...first, data: {} }), false);
    assert.equal(isTopicalClipForCombination({ ...first, comment: 'Alice' }), false);
    assert.throws(() => buildCombineClipsPrompt([first], 'Combined'));
});

test('prompt labels every source and retains their full content', () => {
    const sources = [topical(1, 'Alice', 'Fact A.'), topical(2, 'Bob', 'Fact B.')];
    const prompt = buildCombineClipsPrompt(sources, 'Friends');
    assert.match(prompt, /SNIPPET 1: Alice \[STMB Clip\][\s\S]*Fact A\./);
    assert.match(prompt, /SNIPPET 2: Bob \[STMB Clip\][\s\S]*Fact B\./);
    assert.match(prompt, /do not invent a resolution/);
});

test('keywords preserve first occurrence and exact spelling', () => {
    assert.deepEqual(unionClipKeywords([
        topical(1, 'A', '', [' Alice ', 'Bob', '']),
        topical(2, 'B', '', ['Alice', 'alice', 'Bob']),
    ]), ['Alice', 'Bob', 'alice']);
});

test('source validation detects title, content, keyword, identity, and missing-source changes', () => {
    const sources = [topical(1, 'A', 'A', ['a']), topical(2, 'B', 'B', ['b'])];
    const snapshots = sources.map(snapshotCombineSource);
    assert.equal(areCombineSourcesCurrent(snapshots, sources), true);
    for (const changed of [
        { ...sources[0], comment: 'Renamed [STMB Clip]' },
        { ...sources[0], content: 'Changed' },
        { ...sources[0], key: ['new'] },
        { ...sources[0], data: {} },
    ]) {
        assert.equal(areCombineSourcesCurrent(snapshots, [changed, sources[1]]), false);
    }
    assert.equal(areCombineSourcesCurrent(snapshots, [sources[0]]), false);
});
