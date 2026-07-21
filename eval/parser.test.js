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