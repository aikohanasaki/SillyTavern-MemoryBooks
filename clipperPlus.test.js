// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// Offline unit tests for the Clipper+ core (P3.1). Exercises the pure,
// SillyTavern-free logic — config merge, source location, window building,
// response parsing, and paired-entry shaping — without SillyTavern.
// Run: `node clipperPlus.test.js`.

import assert from 'node:assert/strict';
import test from 'node:test';
import {
    CLIPPER_DEFAULTS,
    CLIP_CONTEXT_TITLE_SUFFIX,
    resolveClipperConfig,
    normalizeForMatch,
    findSourceMessageIndex,
    buildContextWindow,
    truncateMessage,
    formatContextWindow,
    buildBlurbPrompt,
    wordCount,
    clampBlurb,
    sanitizeKeywords,
    parseBlurbResponse,
    sanitizeHeadline,
    buildContextEntryTitle,
    buildContextEntryContent,
    buildPairedEntry,
} from './clipperPlusCore.js';

// ---------------------------------------------------------------- fixtures

/** A chat of `n` messages; message i has text `msg-i ...` with a marker phrase. */
function makeChat(n, over = {}) {
    return Array.from({ length: n }, (_, i) => ({
        name: i % 2 === 0 ? 'Narrator' : 'Brandon',
        is_user: i % 2 === 1,
        is_system: false,
        mes: `Message number ${i} about the marble courtyard and the silver bell.`,
        ...(over[i] || {}),
    }));
}

// ---------------------------------------------------------------- resolveClipperConfig

test('resolveClipperConfig: defaults when nothing set (disabled)', () => {
    const cfg = resolveClipperConfig(undefined, undefined);
    assert.equal(cfg.enabled, false);
    assert.equal(cfg.surroundingK, CLIPPER_DEFAULTS.surroundingK);
    assert.equal(cfg.maxBlurbWords, 50);
});

test('resolveClipperConfig: global enables + overrides', () => {
    const cfg = resolveClipperConfig({ clipper: { enabled: true, surroundingK: 10, autoAccept: true } }, undefined);
    assert.equal(cfg.enabled, true);
    assert.equal(cfg.surroundingK, 10);
    assert.equal(cfg.autoAccept, true);
});

test('resolveClipperConfig: per-chat wins over global (enabled + autoAccept + prompt)', () => {
    const cfg = resolveClipperConfig(
        { clipper: { enabled: true, autoAccept: true, prompt: 'GLOBAL' } },
        { clipper: { enabled: false, autoAccept: false, prompt: 'PERCHAT' } },
    );
    assert.equal(cfg.enabled, false);
    assert.equal(cfg.autoAccept, false);
    assert.equal(cfg.prompt, 'PERCHAT');
});

test('resolveClipperConfig: blank prompt strings are ignored', () => {
    const cfg = resolveClipperConfig({ clipper: { prompt: '   ' } }, { clipper: { prompt: '' } });
    assert.equal(cfg.prompt, CLIPPER_DEFAULTS.prompt); // null
});

// ---------------------------------------------------------------- normalize / locate

test('normalizeForMatch: strips markdown/punct/case', () => {
    assert.equal(normalizeForMatch('  *Hello,*  WORLD!! '), 'hello world');
});

test('findSourceMessageIndex: unique long quote -> exact index', () => {
    const chat = makeChat(8);
    chat[5].mes = 'The dragon Vaelith unfurled her wings above the shattered obsidian gate at dawn.';
    const idx = findSourceMessageIndex(chat, 'The dragon Vaelith unfurled her wings above the shattered obsidian gate at dawn.');
    assert.equal(idx, 5);
});

test('findSourceMessageIndex: tolerates trailing render differences (80-char needle)', () => {
    const chat = makeChat(4);
    chat[2].mes = 'Captain Reyes signalled the fleet to hold position beyond the reef until the storm passed completely.';
    // Quote diverges after ~80 normalized chars (macro expansion / trimming).
    const quote = 'Captain Reyes signalled the fleet to hold position beyond the reef until the storm XXXX';
    assert.equal(findSourceMessageIndex(chat, quote), 2);
});

test('findSourceMessageIndex: not found -> -1', () => {
    assert.equal(findSourceMessageIndex(makeChat(4), 'nothing like this appears anywhere'), -1);
});

test('findSourceMessageIndex: ambiguous (>1 match) -> -1 (precision)', () => {
    const chat = makeChat(4); // all messages share the marble-courtyard marker
    assert.equal(findSourceMessageIndex(chat, 'the marble courtyard and the silver bell'), -1);
});

test('findSourceMessageIndex: skips is_system messages', () => {
    const chat = makeChat(4);
    chat[1].is_system = true;
    chat[1].mes = 'Unique phrase alpha bravo charlie delta echo foxtrot golf hotel india juliet.';
    chat[3].mes = 'Unique phrase alpha bravo charlie delta echo foxtrot golf hotel india juliet.';
    // Only the non-system copy at index 3 should count -> unique.
    assert.equal(findSourceMessageIndex(chat, 'Unique phrase alpha bravo charlie delta echo foxtrot golf hotel india juliet.'), 3);
});

test('findSourceMessageIndex: empty/invalid inputs -> -1', () => {
    assert.equal(findSourceMessageIndex(null, 'x'), -1);
    assert.equal(findSourceMessageIndex(makeChat(2), ''), -1);
});

// ---------------------------------------------------------------- window

test('buildContextWindow: centered, K=6, source mid-chat', () => {
    const chat = makeChat(20);
    const win = buildContextWindow(chat, 10, 6);
    // before = floor(5/2)=2, after=3 => [8..13]
    assert.equal(win.start, 8);
    assert.equal(win.end, 13);
    assert.equal(win.source, 10);
    assert.equal(win.messages.length, 6);
    assert.deepEqual(win.messages.map(m => m.id), [8, 9, 10, 11, 12, 13]);
});

test('buildContextWindow: clamps at chat start', () => {
    const chat = makeChat(20);
    const win = buildContextWindow(chat, 1, 6);
    assert.equal(win.start, 0);
    assert.equal(win.end, 4);
});

test('buildContextWindow: clamps at chat end', () => {
    const chat = makeChat(12);
    const win = buildContextWindow(chat, 11, 6);
    assert.equal(win.end, 11);
    assert.equal(win.start, 9);
});

test('buildContextWindow: skips system messages but keeps true ids', () => {
    const chat = makeChat(10);
    chat[9].is_system = true;
    const win = buildContextWindow(chat, 8, 6); // window [6..9]; index 9 is system
    assert.ok(win.messages.every(m => m.id !== 9));
    assert.ok(win.messages.some(m => m.id === 8));
});

test('buildContextWindow: speaker fallback', () => {
    const chat = [{ mes: 'x', is_user: false }, { mes: 'y', is_user: true }];
    const win = buildContextWindow(chat, 0, 2);
    assert.equal(win.messages[0].speaker, 'Narrator');
    assert.equal(win.messages[1].speaker, 'User');
});

test('buildContextWindow: group chat keeps each distinct character speaker (plan §6 P6.1)', () => {
    const chat = makeChat(5, {
        0: { name: 'Alice', is_user: false },
        1: { name: 'Brandon', is_user: true },
        2: { name: 'Bob', is_user: false },
        3: { name: 'Brandon', is_user: true },
        4: { name: 'Carol', is_user: false },
    });
    const win = buildContextWindow(chat, 2, 5);
    assert.deepEqual(win.messages.map(m => m.speaker), ['Alice', 'Brandon', 'Bob', 'Brandon', 'Carol']);
});

// ---------------------------------------------------------------- formatting

test('truncateMessage: collapses whitespace and caps length', () => {
    assert.equal(truncateMessage('a   b\n\nc', 100), 'a b c');
    assert.equal(truncateMessage('abcdef', 3), 'abc…');
});

test('formatContextWindow: [id] Speaker: text lines', () => {
    const msgs = [{ id: 3, speaker: 'Narrator', rawText: 'Hello there world' }];
    assert.equal(formatContextWindow(msgs, 100), '[3] Narrator: Hello there world');
});

test('buildBlurbPrompt: includes quote and window, uses default when no override', () => {
    const p = buildBlurbPrompt({ systemPrompt: '  ', quote: 'the quote', windowText: '[1] A: hi' });
    assert.ok(p.includes('QUOTE:\nthe quote'));
    assert.ok(p.includes('SURROUNDING MESSAGES:\n[1] A: hi'));
    assert.ok(p.includes('lorebook context writer'));
});

// ---------------------------------------------------------------- word count / clamp

test('wordCount + clampBlurb', () => {
    assert.equal(wordCount('one two three'), 3);
    assert.equal(clampBlurb('a b c d e', 3), 'a b c…');
    assert.equal(clampBlurb('a b c', 5), 'a b c');
});

// ---------------------------------------------------------------- keywords

test('sanitizeKeywords: dedupe case-insensitive, cap, drop junk', () => {
    assert.deepEqual(
        sanitizeKeywords(['Vaelith', 'vaelith', '  ', 'Reyes', 'Reyes', 'Gate'], 6),
        ['Vaelith', 'Reyes', 'Gate'],
    );
    assert.equal(sanitizeKeywords(['a', 'b', 'c', 'd', 'e', 'f', 'g'], 3).length, 3);
    assert.deepEqual(sanitizeKeywords('not an array'), []);
});

// ---------------------------------------------------------------- parse

test('parseBlurbResponse: strict JSON object', () => {
    const r = parseBlurbResponse('{"blurb":"A tense standoff.","keywords":["Reyes","Reef"],"headline":"Standoff"}');
    assert.equal(r.blurb, 'A tense standoff.');
    assert.deepEqual(r.keywords, ['Reyes', 'Reef']);
    assert.equal(r.headline, 'Standoff');
});

test('parseBlurbResponse: fenced json', () => {
    const r = parseBlurbResponse('```json\n{"blurb":"x","keywords":["A"],"headline":"h"}\n```');
    assert.equal(r.blurb, 'x');
});

test('parseBlurbResponse: object embedded in prose', () => {
    const r = parseBlurbResponse('Sure! {"blurb":"y","keywords":["B"],"headline":"h"} hope that helps');
    assert.equal(r.blurb, 'y');
});

test('parseBlurbResponse: missing blurb -> null', () => {
    assert.equal(parseBlurbResponse('{"keywords":["A"],"headline":"h"}'), null);
});

test('parseBlurbResponse: non-json / array / non-string -> null', () => {
    assert.equal(parseBlurbResponse('totally not json'), null);
    assert.equal(parseBlurbResponse('[1,2,3]'), null);
    assert.equal(parseBlurbResponse(42), null);
});

test('parseBlurbResponse: keywords missing -> empty array (not null)', () => {
    const r = parseBlurbResponse('{"blurb":"z","headline":"h"}');
    assert.deepEqual(r.keywords, []);
});

// ---------------------------------------------------------------- title / content

test('sanitizeHeadline: strips clip-suffix look-alikes', () => {
    assert.equal(sanitizeHeadline('Big Fight [STMB Clip]'), 'Big Fight');
    assert.equal(sanitizeHeadline('   '), 'Clip');
    assert.equal(sanitizeHeadline('', 'Fallback'), 'Fallback');
});

test('buildContextEntryTitle: distinct suffix, NOT a clip title', () => {
    const title = buildContextEntryTitle('The Duel');
    assert.equal(title, `The Duel${CLIP_CONTEXT_TITLE_SUFFIX}`);
    // Must not be detected as a clip entry (clipManager.isClipEntryTitle test).
    assert.ok(!title.trimEnd().endsWith('[STMB Clip]'));
});

test('buildContextEntryContent: provenance range + cross-reference', () => {
    const c = buildContextEntryContent('A blurb.', 8, 13, 'The Duel [STMB Clip]');
    assert.ok(c.includes('A blurb.'));
    assert.ok(c.includes('Context for clip: The Duel [STMB Clip]'));
    assert.ok(c.includes('src: msgs 8–13'));
});

test('buildContextEntryContent: single-message range', () => {
    const c = buildContextEntryContent('x', 5, 5, 'T');
    assert.ok(c.includes('src: msgs 5'));
    assert.ok(!c.includes('5–5'));
});

// ---------------------------------------------------------------- buildPairedEntry

test('buildPairedEntry: full happy path (clamps blurb, sanitizes keywords)', () => {
    const parsed = {
        blurb: Array.from({ length: 60 }, (_, i) => `w${i}`).join(' '),
        keywords: ['Vaelith', 'vaelith', 'Gate'],
        headline: 'Dawn Assault',
    };
    const built = buildPairedEntry({
        parsed,
        cfg: { maxBlurbWords: 50, maxKeywords: 6 },
        quoteHeadline: 'Dawn',
        quoteTitle: 'Dawn [STMB Clip]',
        srcStart: 3,
        srcEnd: 7,
    });
    assert.equal(built.title, `Dawn Assault${CLIP_CONTEXT_TITLE_SUFFIX}`);
    assert.deepEqual(built.keywords, ['Vaelith', 'Gate']);
    assert.equal(wordCount(built.blurb), 50);       // capped to 50 words
    assert.ok(built.blurb.endsWith('…'));            // ellipsis attached to the last word
    assert.ok(built.content.includes('src: msgs 3–7'));
    assert.ok(built.content.includes('Context for clip: Dawn [STMB Clip]'));
});

test('buildPairedEntry: no keywords after sanitation -> null (no dead entry)', () => {
    const built = buildPairedEntry({
        parsed: { blurb: 'has a blurb', keywords: ['   ', ''], headline: 'H' },
        cfg: {},
        quoteHeadline: 'Q',
        quoteTitle: 'Q [STMB Clip]',
        srcStart: 1,
        srcEnd: 2,
    });
    assert.equal(built, null);
});

test('buildPairedEntry: no blurb -> null', () => {
    assert.equal(buildPairedEntry({ parsed: { blurb: '', keywords: ['A'] }, cfg: {}, srcStart: 0, srcEnd: 0 }), null);
    assert.equal(buildPairedEntry({ parsed: null, cfg: {}, srcStart: 0, srcEnd: 0 }), null);
});

test('buildPairedEntry: falls back to quote headline when generated headline missing', () => {
    const built = buildPairedEntry({
        parsed: { blurb: 'b', keywords: ['A'], headline: '' },
        cfg: {},
        quoteHeadline: 'FallbackHead',
        quoteTitle: 'FallbackHead [STMB Clip]',
        srcStart: 0,
        srcEnd: 1,
    });
    assert.equal(built.title, `FallbackHead${CLIP_CONTEXT_TITLE_SUFFIX}`);
});
