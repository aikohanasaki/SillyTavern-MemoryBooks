#!/usr/bin/env node
/**
 * Offline test for run-detection.js: spins up a mock OpenAI-compatible
 * endpoint that exercises the strict-JSON discipline paths, then checks
 * unit behavior of the window builder and parser. Exits non-zero on failure.
 *
 * Mock behavior by request count per window (windows arrive sequentially):
 *   window 0: valid array incl. a guard-zone id and an out-of-window id → both dropped
 *   window 1: prose first, valid array on the "JSON only" retry
 *   window 2: prose twice → window skipped
 *   remaining: []
 */

import http from 'node:http';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { buildWindows, parseIdArray, truncateText } from './run-detection.js';

// ---------------- unit checks

assert.deepStrictEqual(parseIdArray('[1, 2, 3]'), [1, 2, 3]);
assert.deepStrictEqual(parseIdArray('```json\n[7]\n```'), [7]);
assert.deepStrictEqual(parseIdArray('[]'), []);
assert.strictEqual(parseIdArray('The boundaries are [1, 2]'), null);
assert.strictEqual(parseIdArray('[1, "2"]'), null);
assert.strictEqual(parseIdArray('{"ids":[1]}'), null);
assert.strictEqual(truncateText('a'.repeat(600), 500).length, 501); // 500 + ellipsis
assert.strictEqual(truncateText('short  text\nhere', 500), 'short text here');

const msgs = Array.from({ length: 60 }, (_, i) => ({ id: i, speaker: 'S', text: 'x' }));
const wins = buildWindows(msgs, { window: 26, overlap: 8 });
assert.strictEqual(wins[0].start, 0);
assert.strictEqual(wins[0].end, 26);
assert.strictEqual(wins[1].start, 18);          // step = 26 - 8
assert.strictEqual(wins.at(-1).end, 60);        // tail anchored to end
assert.ok(wins.at(-1).end - wins.at(-1).start === 26);
console.log('unit checks passed');

// ---------------- end-to-end against mock endpoint

let call = 0;
const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', c => (body += c));
    req.on('end', () => {
        const parsed = JSON.parse(body);
        const isRetry = parsed.messages.length > 2;
        call++;
        let reply;
        if (call === 1) reply = '[3, 24, 999]';           // 24 in guard zone (window 0 = 0–25), 999 out of window
        else if (call === 2) reply = 'I think message 20 starts a scene.';
        else if (call === 3) reply = isRetry ? '[20]' : '[bad]';
        else if (call === 4 || call === 5) reply = 'still prose, sorry';
        else reply = '[]';
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ choices: [{ message: { content: reply } }] }));
    });
});

await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const dir = fs.mkdtempSync('/tmp/stmb-detect-test-');
const fixture = `${dir}/fixture.json`;
const config = `${dir}/config.json`;
const out = `${dir}/predictions.json`;
fs.writeFileSync(fixture, JSON.stringify({
    messages: Array.from({ length: 70 }, (_, i) => ({ id: i, speaker: i % 2 ? 'A' : 'B', isUser: !!(i % 2), text: `message ${i}` })),
}));
fs.writeFileSync(config, JSON.stringify({
    endpoint: `http://127.0.0.1:${port}/v1/chat/completions`,
    model: 'mock',
    apiKey: 'test',
}));

// spawn (not spawnSync): the mock server lives in this process, so the event
// loop must stay free to answer the child's requests.
const run = await new Promise((resolve) => {
    const child = spawn('node', [new URL('./run-detection.js', import.meta.url).pathname,
        '--fixture', fixture, '--config', config, '--out', out]);
    let stdout = '', stderr = '';
    child.stdout.on('data', d => (stdout += d));
    child.stderr.on('data', d => (stderr += d));
    child.on('close', status => resolve({ status, stdout, stderr }));
});
server.close();
if (run.status !== 0) {
    console.error(run.stdout, run.stderr);
    process.exit(1);
}

const result = JSON.parse(fs.readFileSync(out, 'utf8'));
assert.deepStrictEqual(result.predictions, [3, 20], 'guard/out-of-window dropped, retry succeeded');
assert.strictEqual(result.windows[0].dropped.length, 2);
assert.strictEqual(result.windows[1].rawAttempts.length, 2, 'window 1 used the JSON-only retry');
assert.strictEqual(result.windows[2].skipped, true, 'window 2 skipped after second failure');
assert.strictEqual(result.stats.skippedWindows, 1);
fs.rmSync(dir, { recursive: true, force: true });
console.log('end-to-end mock test passed');
