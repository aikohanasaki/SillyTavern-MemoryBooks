// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// STMB-Auto fork — unit tests for auditorJobsCore.js (P5.2 coverage + regeneration).
// Run offline with: node --test auditorJobs.test.js
//
// Covers the pure logic only (no SillyTavern imports): name matching, the coverage
// missing/thin classifier, source-chunk reconstruction under a token budget, the
// regeneration parse/prompt/retry helpers, and the LCS diff.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
    normalizeName,
    messageMentions,
    buildCoverageIndex,
    findCoveringEntry,
    auditCoverage,
    findNameChunks,
    toIdRanges,
    selectRegenSource,
    buildRegenPrompt,
    parseRegenResult,
    regenerateOnce,
    diffLines,
    COVERAGE_DEFAULTS,
    REGEN_PROMPT,
} from './auditorJobsCore.js';

// ------------------------------------------------------------ fixtures

/** Notes map builder: name -> {name, count, chunks[]}. */
function named(entries) {
    const map = {};
    for (const [name, count, chunks] of entries) {
        map[name.toLowerCase()] = { name, count, chunks };
    }
    return map;
}

function makeMessages(specs) {
    // specs: [id, speaker, text]
    return specs.map(([id, speaker, rawText]) => ({ id, speaker, rawText }));
}

// ------------------------------------------------------------ name helpers

test('normalizeName lowercases, collapses whitespace, trims', () => {
    assert.equal(normalizeName('  Lady   Magisa \n'), 'lady magisa');
    assert.equal(normalizeName(null), '');
});

test('messageMentions is whole-word and case-insensitive', () => {
    const m = { rawText: 'Magisa drew her blade as the guards approached.' };
    assert.equal(messageMentions(m, 'magisa'), true);
    assert.equal(messageMentions(m, 'MAGISA'), true);
    assert.equal(messageMentions({ rawText: 'the magisapon relic' }, 'magisa'), false); // substring, not word
    assert.equal(messageMentions(m, ''), false);
});

// ------------------------------------------------------------ coverage index

test('buildCoverageIndex indexes by title and keys, skips disabled', () => {
    const idx = buildCoverageIndex([
        { uid: 1, comment: 'Magisa', key: ['magisa', 'the witch'], content: 'x' },
        { uid: 2, comment: 'Old Keep', key: [], content: 'y', disable: true },
    ]);
    assert.equal(idx.list.length, 1);
    assert.ok(idx.byHandle.get('magisa'));
    assert.ok(idx.byHandle.get('the witch'));
    assert.equal(idx.byHandle.get('old keep'), undefined); // disabled entry excluded
});

test('findCoveringEntry prefers a living entry over a memory entry', () => {
    const idx = buildCoverageIndex([
        { uid: 5, comment: 'Scene 3', key: ['magisa'], content: 'summary', isMemory: true },
        { uid: 6, comment: 'Magisa', key: ['magisa'], content: 'living', isMemory: false },
    ]);
    assert.equal(findCoveringEntry(idx, 'Magisa').uid, 6);
    assert.equal(findCoveringEntry(idx, 'nobody'), null);
});

// ------------------------------------------------------------ auditCoverage

test('auditCoverage classifies missing / thin / covered and honors minChunks', () => {
    const notes = {
        characters: named([
            ['Magisa', 12, [0, 1, 2, 3]],   // covered by a full entry
            ['Rooke', 8, [1, 2, 4]],        // has an entry but it is thin
            ['Guard', 5, [2, 3]],           // no entry -> missing
            ['Cameo', 1, [7]],              // below minChunks (2) -> ignored entirely
        ]),
        locations: named([
            ['The Keep', 6, [0, 5, 6]],     // no entry -> missing (location)
        ]),
    };
    const entries = [
        { uid: 1, comment: 'Magisa', key: ['magisa'], content: 'X'.repeat(300) },
        { uid: 2, comment: 'Rooke', key: ['rooke'], content: 'short' },
    ];
    const rep = auditCoverage(notes, entries);
    const missNames = rep.missing.map(m => m.name).sort();
    assert.deepEqual(missNames, ['Guard', 'The Keep']);
    assert.equal(rep.thin.length, 1);
    assert.equal(rep.thin[0].name, 'Rooke');
    assert.equal(rep.thin[0].entryUid, 2);
    assert.equal(rep.covered, 1);          // Magisa
    assert.equal(rep.total, 4);            // Cameo excluded by minChunks
});

test('auditCoverage: a name matched only by a memory entry counts as covered, not thin', () => {
    const notes = { characters: named([['Magisa', 10, [0, 1, 2]]]) };
    const entries = [{ uid: 9, comment: 'Scene 1', key: ['magisa'], content: 'tiny', isMemory: true }];
    const rep = auditCoverage(notes, entries);
    assert.equal(rep.missing.length, 0);
    assert.equal(rep.thin.length, 0);
    assert.equal(rep.covered, 1);
});

test('auditCoverage includeLocations=false skips locations', () => {
    const notes = {
        characters: named([['Magisa', 5, [0, 1]]]),
        locations: named([['The Keep', 5, [0, 1]]]),
    };
    const rep = auditCoverage(notes, [], { includeLocations: false });
    assert.equal(rep.total, 1);
    assert.deepEqual(rep.missing.map(m => m.name), ['Magisa']);
});

test('auditCoverage sorts by salience (chunk spread desc)', () => {
    const notes = {
        characters: named([
            ['A', 2, [0, 1]],
            ['B', 2, [0, 1, 2, 3, 4]],
            ['C', 2, [0, 1, 2]],
        ]),
    };
    const rep = auditCoverage(notes, []);
    assert.deepEqual(rep.missing.map(m => m.name), ['B', 'C', 'A']);
});

// ------------------------------------------------------------ regeneration source

test('findNameChunks returns kind + provenance chunks, case-insensitive', () => {
    const notes = {
        characters: named([['Magisa', 12, [0, 3, 7]]]),
        locations: named([['The Keep', 6, [1, 5]]]),
    };
    assert.deepEqual(findNameChunks(notes, 'magisa'), { kind: 'character', name: 'Magisa', chunks: [0, 3, 7], mentions: 12 });
    assert.equal(findNameChunks(notes, 'the keep').kind, 'location');
    assert.equal(findNameChunks(notes, 'ghost'), null);
});

test('toIdRanges collapses contiguous ids', () => {
    assert.deepEqual(toIdRanges([3, 1, 2, 5, 6, 9]), [[1, 3], [5, 6], [9, 9]]);
    assert.deepEqual(toIdRanges([]), []);
});

test('selectRegenSource gathers named chunks and prioritizes name mentions under budget', () => {
    // 3 chunks of 2 messages each; name appears in messages 0 and 5.
    const messages = makeMessages([
        [10, 'Narrator', 'Magisa enters the hall.'],   // chunk 0
        [11, 'Brandon', 'Hello there.'],
        [12, 'Narrator', 'The guards mutter.'],          // chunk 1 (not requested)
        [13, 'Brandon', 'We proceed.'],
        [14, 'Narrator', 'A long quiet corridor.'],      // chunk 2
        [15, 'Brandon', 'Magisa nods to me.'],
    ]);
    const plan = [
        { msgStart: 0, msgEnd: 1 },
        { msgStart: 2, msgEnd: 3 },
        { msgStart: 4, msgEnd: 5 },
    ];
    // Request chunks 0 and 2 (where Magisa appears); tiny budget keeps only mentions.
    const est = () => 100;
    const res = selectRegenSource(messages, plan, [0, 2], 'Magisa', { tokenBudget: 200, estimateTokens: est });
    assert.deepEqual(res.includedIds, [10, 15]);          // both name-mentioning messages, in chat order
    assert.equal(res.chunkCount, 2);
    assert.match(res.text, /\[10\] Narrator: Magisa enters/);
    assert.match(res.text, /\[15\] Brandon: Magisa nods/);
});

test('selectRegenSource fills context when budget allows and dedups overlapping chunks', () => {
    const messages = makeMessages([
        [0, 'N', 'Magisa alpha'],
        [1, 'B', 'beta'],
        [2, 'N', 'gamma'],
    ]);
    const plan = [{ msgStart: 0, msgEnd: 1 }, { msgStart: 1, msgEnd: 2 }];
    const res = selectRegenSource(messages, plan, [0, 1, 1], 'Magisa', { tokenBudget: 100000, estimateTokens: t => t.length });
    assert.deepEqual(res.includedIds, [0, 1, 2]);          // union of both chunks, no dupes
});

// ------------------------------------------------------------ regeneration prompt & parse

test('buildRegenPrompt fills all placeholders and marks missing existing content', () => {
    const p = buildRegenPrompt('Magisa', 'character', '[10] N: text', '');
    assert.match(p, /entry for "Magisa" \(character\)/);
    assert.match(p, /\(none — this entry does not exist yet\)/);
    assert.match(p, /\[10\] N: text/);
    assert.ok(!p.includes('{{'));
    const p2 = buildRegenPrompt('Rooke', 'character', 'src', 'old body');
    assert.match(p2, /old body/);
});

test('parseRegenResult: strict JSON, fenced JSON, plain-text fallback, and garbage', () => {
    const j = parseRegenResult('{"title":"Magisa","keywords":["magisa","witch"],"content":"A witch."}', 'X');
    assert.deepEqual(j, { title: 'Magisa', keywords: ['magisa', 'witch'], content: 'A witch.' });

    const fenced = parseRegenResult('```json\n{"content":"Body only."}\n```', 'Rooke');
    assert.equal(fenced.content, 'Body only.');
    assert.equal(fenced.title, 'Rooke');          // fallbackName fills the title
    assert.deepEqual(fenced.keywords, ['Rooke']); // and seeds a keyword

    const plain = parseRegenResult('Just a plain description with no JSON.', 'Guard');
    assert.equal(plain.content, 'Just a plain description with no JSON.');
    assert.equal(plain.title, 'Guard');

    assert.equal(parseRegenResult('   ', 'X'), null);
    assert.equal(parseRegenResult('{"title":"x","content":""}', 'X'), null); // empty content -> null
    assert.equal(parseRegenResult(42, 'X'), null);
});

test('regenerateOnce retries once with a reprimand, then succeeds', async () => {
    const calls = [];
    const derive = async (prompt) => {
        calls.push(prompt);
        // First reply is empty (unusable); second reply is valid JSON.
        return calls.length === 1 ? '   ' : '{"title":"Magisa","keywords":["magisa"],"content":"A witch."}';
    };
    const ok = await regenerateOnce({ derive, prompt: 'P', fallbackName: 'Magisa' });
    assert.equal(calls.length, 2);
    assert.match(calls[1], /No prose, no code fences/); // the reprimand was appended on retry
    assert.equal(ok.content, 'A witch.');
});

test('regenerateOnce succeeds on the first call for a usable plain-text reply', async () => {
    let n = 0;
    const derive = async () => { n++; return 'A plain description.'; };
    const ok = await regenerateOnce({ derive, prompt: 'P', fallbackName: 'Magisa' });
    assert.equal(n, 1);
    assert.equal(ok.content, 'A plain description.');
});

test('regenerateOnce returns null when both attempts are unusable', async () => {
    let n = 0;
    const derive = async () => { n++; return '   '; };  // empty both times
    const res = await regenerateOnce({ derive, prompt: 'P', fallbackName: 'X' });
    assert.equal(n, 2);
    assert.equal(res, null);
});

// ------------------------------------------------------------ diff

test('diffLines marks additions, deletions, and context', () => {
    const d = diffLines('alpha\nbeta\ngamma', 'alpha\nBETA\ngamma\ndelta');
    assert.equal(d.unchanged, 2);   // alpha, gamma
    assert.equal(d.removed, 1);     // beta
    assert.equal(d.added, 2);       // BETA, delta
    assert.equal(d.rows[0].type, 'context');
    assert.ok(d.rows.some(r => r.type === 'del' && r.text === 'beta'));
    assert.ok(d.rows.some(r => r.type === 'add' && r.text === 'delta'));
});

test('diffLines on identical content is all context', () => {
    const d = diffLines('same\ntext', 'same\ntext');
    assert.equal(d.added, 0);
    assert.equal(d.removed, 0);
    assert.equal(d.unchanged, 2);
});

// ------------------------------------------------------------ sanity on exported constants

test('defaults and prompt template are present', () => {
    assert.equal(COVERAGE_DEFAULTS.minChunks, 2);
    assert.match(REGEN_PROMPT, /\{\{SOURCE\}\}/);
    assert.match(REGEN_PROMPT, /FROM THE SOURCE EXCERPTS BELOW ONLY/);
});
