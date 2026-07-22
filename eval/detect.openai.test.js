// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// eval/detect.openai.test.js — Unit tests for OpenAIDetector and
// strictParseBoundaryArray.
//
// The detector's HTTP layer is mocked so the tests run offline.

import test from 'node:test';
import assert from 'node:assert/strict';

import {
    OpenAIDetector,
    strictParseBoundaryArray,
    JSON_RETRY_PROMPT,
    loadBaselinePrompt,
    buildDetectionWindows,
} from './detect.js';
import { parseJsonlText } from './parser.js';

// ----------------------------------------------------------------------------
// strictParseBoundaryArray
// ----------------------------------------------------------------------------

test('strictParseBoundaryArray accepts a bare integer array', () => {
    const r = strictParseBoundaryArray('[12, 27, 88]');
    assert.ok(r.ok);
    assert.deepEqual(r.boundaries, [12, 27, 88]);
});

test('strictParseBoundaryArray accepts an empty array', () => {
    const r = strictParseBoundaryArray('[]');
    assert.ok(r.ok);
    assert.deepEqual(r.boundaries, []);
});

test('strictParseBoundaryArray accepts { boundaries: [...] } envelope', () => {
    const r = strictParseBoundaryArray('{"boundaries":[1,2,3]}');
    assert.ok(r.ok);
    assert.deepEqual(r.boundaries, [1, 2, 3]);
});

test('strictParseBoundaryArray rejects non-JSON', () => {
    const r = strictParseBoundaryArray('not json at all');
    assert.equal(r.ok, false);
    assert.match(r.error, /JSON parse error/);
});

test('strictParseBoundaryArray rejects markdown-fenced JSON', () => {
    const r = strictParseBoundaryArray('```json\n[1, 2]\n```');
    assert.equal(r.ok, false);
    // The strict parser should NOT pre-strip the fence — the LLM must
    // follow the format. A retry should fix this.
});

test('strictParseBoundaryArray rejects prose around the array', () => {
    const r = strictParseBoundaryArray('Sure! Here you go: [12, 27]. Hope that helps.');
    assert.equal(r.ok, false);
});

test('strictParseBoundaryArray rejects floats', () => {
    const r = strictParseBoundaryArray('[1.5, 2]');
    assert.equal(r.ok, false);
    assert.match(r.error, /non-integer/);
});

test('strictParseBoundaryArray rejects negative integers', () => {
    const r = strictParseBoundaryArray('[-1, 2]');
    assert.equal(r.ok, false);
    assert.match(r.error, /non-integer/);
});

test('strictParseBoundaryArray rejects strings inside the array', () => {
    const r = strictParseBoundaryArray('[1, "two", 3]');
    assert.equal(r.ok, false);
});

test('strictParseBoundaryArray rejects objects', () => {
    const r = strictParseBoundaryArray('{"foo":"bar"}');
    assert.equal(r.ok, false);
});

test('strictParseBoundaryArray rejects non-string input', () => {
    const r = strictParseBoundaryArray(42);
    assert.equal(r.ok, false);
});

// ----------------------------------------------------------------------------
// OpenAIDetector construction
// ----------------------------------------------------------------------------

test('OpenAIDetector requires baseUrl, model, apiKey', () => {
    assert.throws(() => new OpenAIDetector({ model: 'm', apiKey: 'k' }), /baseUrl/);
    assert.throws(() => new OpenAIDetector({ baseUrl: 'http://x', apiKey: 'k' }), /model/);
    assert.throws(() => new OpenAIDetector({ baseUrl: 'http://x', model: 'm' }), /apiKey/);
});

test('OpenAIDetector strips trailing slash from baseUrl', () => {
    const det = new OpenAIDetector({ baseUrl: 'http://x/', model: 'm', apiKey: 'k' });
    assert.equal(det.cfg.baseUrl, 'http://x');
});

// ----------------------------------------------------------------------------
// OpenAIDetector end-to-end with mocked fetch
// ----------------------------------------------------------------------------

/**
 * Build a 30-message fixture so the default 26-message window + 8 overlap
 * produces 2 windows with a meaningful overlap.
 */
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
            headers: i % 2 === 0 ? { time: `${i % 12 || 12}:00 ${i < 12 ? 'AM' : 'PM'}`, date: null, location: `Room ${i}`, weather: null } : null,
        });
    }
    return arr;
}

/** Build a fake fetch that returns scripted OpenAI-compatible responses. */
function fakeFetch(responses) {
    const calls = [];
    let i = 0;
    const fetchFn = async (url, opts) => {
        calls.push({ url, opts });
        const scripted = responses[Math.min(i, responses.length - 1)];
        i++;
        const body = JSON.stringify({
            choices: [{ message: { content: scripted } }],
        });
        return new Response(body, {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    };
    return { fetch: fetchFn, calls };
}

test('OpenAIDetector: happy path returns boundaries for each window', async () => {
    const messages = buildMessages(30);
    const windows = buildDetectionWindows(messages);
    assert.ok(windows.length >= 2);

    // First window says boundaries at 1, 10; second says 10, 22.
    const { fetch: f, calls } = fakeFetch(['[1, 10]', '[10, 22]']);
    const det = new OpenAIDetector({
        baseUrl: 'http://llm',
        model: 'm',
        apiKey: 'k',
        fetch: f,
    });
    const out = await det.detectBoundaries({ messages, windows });
    // Raw boundaries (pre-dedup, since runDetection() owns dedup).
    const allRaw = out.perWindow.flatMap((w) => (w.status === 'ok' ? w.boundaries : []));
    assert.deepEqual(allRaw, [1, 10, 10, 22]);
    for (const w of out.perWindow) {
        assert.equal(w.status, 'ok');
        assert.equal(w.attempts, 1);
    }
    assert.equal(calls.length, windows.length);
    // All calls POST to <base>/chat/completions.
    for (const c of calls) {
        assert.equal(c.url, 'http://llm/chat/completions');
        assert.equal(c.opts.method, 'POST');
        assert.match(c.opts.headers.Authorization, /^Bearer k/);
        const body = JSON.parse(c.opts.body);
        assert.equal(body.model, 'm');
        assert.equal(body.messages[0].role, 'system');
        assert.equal(body.messages[1].role, 'user');
    }
});

test('OpenAIDetector: retries once on bad JSON, accepts second attempt', async () => {
    const messages = buildMessages(30);
    const windows = buildDetectionWindows(messages);
    const singleWindow = [windows[0]];
    // First attempt: prose. Second attempt: clean array.
    const { fetch: f, calls } = fakeFetch([
        'Sorry, I cannot comply with that format.',
        '[5, 14]',
    ]);
    const det = new OpenAIDetector({ baseUrl: 'http://llm', model: 'm', apiKey: 'k', fetch: f });
    const out = await det.detectBoundaries({ messages, windows: singleWindow });
    assert.equal(calls.length, 2); // two attempts
    // Retry prompt is appended in the second turn.
    const retryBody = JSON.parse(calls[1].opts.body);
    assert.equal(retryBody.messages.length, 4);
    assert.equal(retryBody.messages[2].role, 'assistant');
    assert.equal(retryBody.messages[3].role, 'user');
    assert.equal(retryBody.messages[3].content, JSON_RETRY_PROMPT);
    assert.equal(out.perWindow[0].status, 'ok');
    assert.equal(out.perWindow[0].attempts, 2);
    assert.deepEqual(out.perWindow[0].boundaries, [5, 14]);
});

test('OpenAIDetector: skips window after second JSON failure (never guesses)', async () => {
    const messages = buildMessages(30);
    const windows = [buildDetectionWindows(messages)[0]];
    const { fetch: f } = fakeFetch([
        'I will not return JSON.',
        'Still not JSON.',
    ]);
    const det = new OpenAIDetector({ baseUrl: 'http://llm', model: 'm', apiKey: 'k', fetch: f });
    const out = await det.detectBoundaries({ messages, windows });
    assert.equal(out.perWindow[0].status, 'skipped');
    assert.equal(out.perWindow[0].attempts, 2);
    assert.ok(out.perWindow[0].error && out.perWindow[0].error.length > 0,
        'a non-empty error must be recorded on skip');
    // boundaries excludes the skipped window.
    assert.deepEqual(out.boundaries, []);
});

test('OpenAIDetector: surfaces transport errors as skipped (no crash)', async () => {
    const messages = buildMessages(30);
    const windows = [buildDetectionWindows(messages)[0]];
    const f = async () => {
        throw new Error('ECONNREFUSED');
    };
    const det = new OpenAIDetector({ baseUrl: 'http://llm', model: 'm', apiKey: 'k', fetch: f });
    const out = await det.detectBoundaries({ messages, windows });
    assert.equal(out.perWindow[0].status, 'skipped');
    assert.match(out.perWindow[0].error, /ECONNREFUSED/);
});

test('OpenAIDetector: surfaces non-200 HTTP responses as skipped', async () => {
    const messages = buildMessages(30);
    const windows = [buildDetectionWindows(messages)[0]];
    const f = async () => new Response('upstream down', { status: 502 });
    const det = new OpenAIDetector({ baseUrl: 'http://llm', model: 'm', apiKey: 'k', fetch: f });
    const out = await det.detectBoundaries({ messages, windows });
    assert.equal(out.perWindow[0].status, 'skipped');
    assert.match(out.perWindow[0].error, /HTTP 502/);
});

test('OpenAIDetector: partial success — one window ok, one window skipped', async () => {
    const messages = buildMessages(40);
    const windows = buildDetectionWindows(messages);
    // First window ok, second window fails twice.
    const { fetch: f } = fakeFetch(['[3]', 'no json', 'still no json']);
    const det = new OpenAIDetector({ baseUrl: 'http://llm', model: 'm', apiKey: 'k', fetch: f });
    const out = await det.detectBoundaries({ messages, windows });
    const ok = out.perWindow.filter((w) => w.status === 'ok');
    const skipped = out.perWindow.filter((w) => w.status === 'skipped');
    assert.ok(ok.length >= 1);
    assert.ok(skipped.length >= 1);
});

test('OpenAIDetector: honors maxJsonRetries=0 (no retry on failure)', async () => {
    const messages = buildMessages(30);
    const windows = [buildDetectionWindows(messages)[0]];
    const { fetch: f, calls } = fakeFetch(['garbage']);
    const det = new OpenAIDetector({ baseUrl: 'http://llm', model: 'm', apiKey: 'k', fetch: f, maxJsonRetries: 0 });
    const out = await det.detectBoundaries({ messages, windows });
    assert.equal(calls.length, 1);
    assert.equal(out.perWindow[0].status, 'skipped');
});

// ----------------------------------------------------------------------------
// loadBaselinePrompt
// ----------------------------------------------------------------------------

test('loadBaselinePrompt reads the on-disk Appendix A file', async () => {
    const text = await loadBaselinePrompt();
    assert.match(text, /scene-boundary detector/);
    assert.match(text, /JSON array of integers/);
});

test('loadBaselinePrompt throws when the file is missing', async () => {
    await assert.rejects(() => loadBaselinePrompt('/nonexistent/prompt.txt'), /ENOENT/);
});

// ----------------------------------------------------------------------------
// runDetection dedup (smoke — full unit tests live in runDetection.test.js)
// ----------------------------------------------------------------------------

test('OpenAIDetector + runDetection dedupes overlapping boundaries', async () => {
    // Imported here so the test fails clearly if the file is missing.
    const { runDetection } = await import('./runDetection.js');
    const messages = buildMessages(40);
    // Both windows emit the same boundary.
    const windows = buildDetectionWindows(messages);
    const { fetch: f } = fakeFetch(windows.map(() => '[15, 30]'));
    const det = new OpenAIDetector({ baseUrl: 'http://llm', model: 'm', apiKey: 'k', fetch: f });
    const out = await runDetection(messages, {
        detector: det,
        windowSize: 26,
        overlap: 8,
        truncateChars: 500,
        guardSize: 4,
    });
    assert.deepEqual(out.boundaries, [15, 30]);
    assert.equal(out.skipped, 0);
});

test('parser fixture smoke: windows produced from the bundled transcript', async () => {
    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const url = await import('node:url');
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const text = await fs.readFile(path.resolve(__dirname, 'fixtures/transcript.jsonl'), 'utf8');
    const { messages } = parseJsonlText(text);
    const windows = buildDetectionWindows(messages);
    assert.ok(windows.length >= 5, 'expected at least 5 windows on the 329-message fixture');
    // Sanity: window 0 ends >= 26 messages in (guard trims the trailing 4).
    assert.ok(windows[0].endIndex >= 22);
    for (const w of windows) {
        assert.ok(w.formatted.length > 0);
        assert.match(w.formatted, /^\[\d+\] /);
    }
});