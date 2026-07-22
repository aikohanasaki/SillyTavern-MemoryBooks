// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// eval/runDetection.test.js — Unit tests for the top-level runDetection
// orchestration: dedup, per-window wiring, skipped counts.

import test from 'node:test';
import assert from 'node:assert/strict';

import { runDetection } from './runDetection.js';
import { buildDetectionWindows } from './detect.js';

function buildMessages(n = 30) {
    const arr = [];
    for (let i = 1; i <= n; i++) {
        arr.push({
            index: i,
            speaker: i % 2 === 0 ? 'Alice' : 'Bob',
            isUser: i % 2 === 0,
            isSystem: false,
            text: `[ 🕰️ Time ${i % 12 || 12}:00 ${i < 12 ? 'AM' : 'PM'} | 📍 Room ${i} ]\n\nBody ${i}`,
            sendDate: null,
            headers: { time: null, date: null, location: `Room ${i}`, weather: null },
        });
    }
    return arr;
}

/** A scripted detector that returns predetermined results per window. */
class ScriptedDetector {
    constructor(scripts) {
        this.scripts = scripts;
        this.calls = 0;
    }
    async detectBoundaries({ messages, windows }) {
        const perWindow = [];
        const boundaries = [];
        for (const w of windows) {
            const idx = Math.min(this.calls, this.scripts.length - 1);
            const script = this.scripts[idx] ?? { status: 'ok', boundaries: [] };
            this.calls++;
            if (script.status === 'skipped') {
                perWindow.push({
                    startIndex: w.startIndex,
                    endIndex: w.endIndex,
                    status: 'skipped',
                    error: script.error ?? 'scripted failure',
                    attempts: 2,
                });
            } else {
                perWindow.push({
                    startIndex: w.startIndex,
                    endIndex: w.endIndex,
                    status: 'ok',
                    boundaries: script.boundaries ?? [],
                    attempts: 1,
                });
                for (const b of (script.boundaries ?? [])) boundaries.push(b);
            }
        }
        return { boundaries, rawResponses: perWindow, perWindow };
    }
}

test('runDetection requires a detector with detectBoundaries()', async () => {
    await assert.rejects(
        () => runDetection([], {}),
        /cfg.detector must implement detectBoundaries/,
    );
});

test('runDetection returns empty results for empty messages', async () => {
    const det = new ScriptedDetector([]);
    const out = await runDetection([], { detector: det });
    assert.deepEqual(out.boundaries, []);
    assert.equal(out.skipped, 0);
    assert.equal(out.windows.length, 0);
});

test('runDetection dedupes boundaries across overlapping windows', async () => {
    const messages = buildMessages(40);
    const windows = buildDetectionWindows(messages);
    // All windows report the same boundaries — the dedup should collapse.
    const det = new ScriptedDetector(windows.map(() => ({ status: 'ok', boundaries: [12, 27] })));
    const out = await runDetection(messages, { detector: det });
    assert.deepEqual(out.boundaries, [12, 27]);
    assert.equal(out.skipped, 0);
});

test('runDetection returns sorted, deduped union when windows disagree', async () => {
    const messages = buildMessages(50);  // 3 windows at default 26/8/4
    const det = new ScriptedDetector([
        { status: 'ok', boundaries: [27, 5] },        // unsorted, with dup of 27 later
        { status: 'ok', boundaries: [27, 18] },       // 27 again
        { status: 'ok', boundaries: [40] },           // unique
    ]);
    const out = await runDetection(messages, { detector: det });
    assert.deepEqual(out.boundaries, [5, 18, 27, 40]);
});

test('runDetection skips non-integer / non-positive predictions', async () => {
    const messages = buildMessages(50);
    const det = new ScriptedDetector([
        { status: 'ok', boundaries: [-3, 0, 7] },     // -3 and 0 should be dropped
        { status: 'ok', boundaries: [] },
        { status: 'ok', boundaries: [] },
    ]);
    const out = await runDetection(messages, { detector: det });
    assert.deepEqual(out.boundaries, [7]);
});

test('runDetection counts skipped windows', async () => {
    const messages = buildMessages(50);
    const det = new ScriptedDetector([
        { status: 'ok', boundaries: [3] },
        { status: 'skipped', error: 'JSON failed twice' },
        { status: 'ok', boundaries: [22] },
    ]);
    const out = await runDetection(messages, { detector: det });
    assert.equal(out.skipped, 1);
    assert.deepEqual(out.boundaries, [3, 22]);
});

test('runDetection passes window builder options through', async () => {
    const messages = buildMessages(60);
    const det = new ScriptedDetector([]);
    const out = await runDetection(messages, {
        detector: det,
        windowSize: 10,
        overlap: 5,
        truncateChars: 200,
        guardSize: 2,
    });
    // step=5; 60 messages → roughly 12 windows.
    assert.ok(out.windows.length >= 8, `got ${out.windows.length} windows`);
    for (const w of out.windows) {
        assert.ok(w.endIndex - w.startIndex + 1 <= 10, 'window respects windowSize');
        assert.equal(w.guardSize, 2);
    }
});