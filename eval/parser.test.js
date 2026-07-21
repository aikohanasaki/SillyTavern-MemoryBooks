// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// eval/parser.test.js — Unit tests for the SillyTavern JSONL parser.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
    parseJsonlLine,
    parseHeader,
    stripForDetection,
    parseJsonlText,
    formatForPrompt,
} from './parser.js';

// ----------------------------------------------------------------------------
// parseHeader
// ----------------------------------------------------------------------------

test('parseHeader extracts time, date, location, weather from a valid header', () => {
    const mes = '[ 🕰️ Time 11:47 PM | 🗓️ Moonsday, Emberfall 13, Year 1247 of the Aether Era | 📍 Abandoned Dungeon - Ritual Chamber | 🌫️ Damp Underground Air, 54°F ]\n\nSome prose.';
    const h = parseHeader(mes);
    assert.ok(h);
    assert.equal(h.time, '11:47 PM');
    assert.match(h.date, /Moonsday/);
    assert.equal(h.location, 'Abandoned Dungeon - Ritual Chamber');
    assert.match(h.weather, /Damp Underground Air/);
});

test('parseHeader returns null when no header is present', () => {
    assert.equal(parseHeader('Just some prose, no header.'), null);
});

test('parseHeader handles missing fields gracefully', () => {
    const mes = '[ 🕰️ Time 9:00 AM ]';
    const h = parseHeader(mes);
    assert.ok(h);
    assert.equal(h.time, '9:00 AM');
    assert.equal(h.date, null);
    assert.equal(h.location, null);
});

// ----------------------------------------------------------------------------
// stripForDetection
// ----------------------------------------------------------------------------

test('stripForDetection removes the header line', () => {
    const mes = '[ 🕰️ Time 9:00 AM | 📍 Test | 🌫️ Sunny ]\n\nProse begins here.';
    const s = stripForDetection(mes);
    assert.equal(s, 'Prose begins here.');
});

test('stripForDetection removes internal-thought blocks', () => {
    const mes = 'Prose part.\n\n<details><summary>🧠 INTERNAL THOUGHTS</summary><br>thought</details>\n\nMore prose.';
    const s = stripForDetection(mes);
    assert.equal(s, 'Prose part.\n\n\n\nMore prose.'.replace(/\n{3,}/g, '\n\n'));
    assert.doesNotMatch(s, /INTERNAL THOUGHTS/);
    assert.doesNotMatch(s, /<details/);
});

// ----------------------------------------------------------------------------
// parseJsonlLine
// ----------------------------------------------------------------------------

test('parseJsonlLine recognizes the metadata header line', () => {
    const line = JSON.stringify({ chat_metadata: { foo: 'bar' } });
    const r = parseJsonlLine(line, 0);
    assert.equal(r.kind, 'metadata');
});

test('parseJsonlLine recognizes a message line', () => {
    const line = JSON.stringify({ name: 'Bob', is_user: true, mes: 'hi' });
    const r = parseJsonlLine(line, 1);
    assert.equal(r.kind, 'message');
    assert.equal(r.message.name, 'Bob');
});

test('parseJsonlLine skips invalid JSON', () => {
    const r = parseJsonlLine('{not json', 0);
    assert.equal(r.kind, 'skipped');
});

// ----------------------------------------------------------------------------
// parseJsonlText
// ----------------------------------------------------------------------------

test('parseJsonlText numbers messages starting at 1 after the metadata line', () => {
    const lines = [
        JSON.stringify({ chat_metadata: { user_name: 'x' } }),
        JSON.stringify({ name: 'A', is_user: true, mes: 'a' }),
        JSON.stringify({ name: 'B', is_user: false, mes: 'b' }),
        JSON.stringify({ name: 'A', is_user: true, mes: 'a2' }),
    ];
    const { messages, warnings } = parseJsonlText(lines.join('\n'));
    assert.equal(messages.length, 3);
    assert.deepEqual(messages.map((m) => m.index), [1, 2, 3]);
    assert.equal(warnings.length, 0);
});

test('parseJsonlText assigns 1-based indices even with blank lines', () => {
    const lines = [
        JSON.stringify({ chat_metadata: {} }),
        '',
        JSON.stringify({ name: 'A', is_user: true, mes: 'a' }),
        '',
        JSON.stringify({ name: 'B', is_user: false, mes: 'b' }),
    ];
    const { messages } = parseJsonlText(lines.join('\n'));
    assert.deepEqual(messages.map((m) => m.index), [1, 2]);
});

// ----------------------------------------------------------------------------
// formatForPrompt
// ----------------------------------------------------------------------------

test('formatForPrompt produces [id] Speaker: text and truncates', () => {
    const msg = {
        index: 7,
        speaker: 'Satire Fantasy Isekai',
        isUser: false,
        text: 'a'.repeat(1000),
    };
    const formatted = formatForPrompt(msg, 100);
    assert.equal(formatted.startsWith('[7] Satire Fantasy Isekai: '), true);
    assert.match(formatted, /…$/);
    assert.ok(formatted.length < 200);
});

test('formatForPrompt strips headers and internal thoughts before formatting', () => {
    const msg = {
        index: 1,
        speaker: 'A',
        isUser: false,
        text: '[ 🕰️ Time 9:00 AM | 📍 Loc | 🌫️ Sunny ]\n\nReal text.\n\n<details>thoughts</details>',
    };
    const formatted = formatForPrompt(msg, 500);
    assert.equal(formatted, '[1] A: Real text.');
});

// ----------------------------------------------------------------------------
// Smoke test against the bundled fixture (plan §3.1 / §6 Phase 0 acceptance)
// ----------------------------------------------------------------------------

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname_ = fileURLToPath(new URL('.', import.meta.url));
const fixturePath = resolve(__dirname_, 'fixtures/transcript.jsonl');

test('smoke: parses the bundled 329-message Satire Fantasy Isekai JSONL', { skip: !existsSync(fixturePath) }, async () => {
    const { parseJsonlFile } = await import('./parser.js');
    const { messages, warnings } = await parseJsonlFile(fixturePath);

    // The fixture has 330 lines (1 chat_metadata header + 329 messages).
    // Plan §3.1 says "328-message" but the actual JSONL has 329. We assert
    // the real number here; plan wording is stale.
    assert.equal(messages.length, 329,
        `expected 329 messages, got ${messages.length} (plan §3.1 says 328, actual JSONL has 329)`);
    assert.equal(warnings.length, 0);

    // 1-based indexing — first message is index 1, not 0.
    assert.equal(messages[0].index, 1);
    assert.equal(messages[messages.length - 1].index, 329);

    // Speaker identity (Brandon = user, Satire Fantasy Isekai = narrator).
    const speakers = new Set(messages.map((m) => m.speaker));
    assert.deepEqual([...speakers].sort(), ['Brandon', 'Satire Fantasy Isekai']);

    const brandonMsgs = messages.filter((m) => m.speaker === 'Brandon');
    const narratorMsgs = messages.filter((m) => m.speaker === 'Satire Fantasy Isekai');
    assert.ok(brandonMsgs.every((m) => m.isUser === true), 'all Brandon messages should be user');
    assert.ok(narratorMsgs.every((m) => m.isUser === false), 'all narrator messages should be assistant');
    assert.ok(brandonMsgs.length > 100 && narratorMsgs.length > 100,
        `expected >100 of each, got Brandon=${brandonMsgs.length} narrator=${narratorMsgs.length}`);

    // Raw mes is preserved (first message is the canonical truck-flattening
    // opening line of the Satire Fantasy Isekai story).
    assert.match(messages[0].text, /pedestrian crossing/);
    assert.match(messages[0].text, /pristine white truck/);

    // sendDate is parsed when present.
    assert.match(messages[0].sendDate, /^\d{4}-\d{2}-\d{2}T/);

    // Narrator messages that DO carry headers should parse cleanly.
    // (Some early/transitional narrator messages don't carry a header at all —
    // e.g. the disembodied voice at the start of the story. That's normal.)
    const withHeaders = narratorMsgs.filter((m) => m.headers && m.headers.location);
    assert.ok(withHeaders.length > 100, `expected >100 narrator msgs with headers, got ${withHeaders.length}`);
    assert.ok(withHeaders.every((m) => typeof m.headers.location === 'string' && m.headers.location.length > 0),
        'every parsed narrator header should carry a non-empty location');
});