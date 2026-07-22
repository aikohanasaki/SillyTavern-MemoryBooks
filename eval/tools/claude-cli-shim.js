#!/usr/bin/env node
/**
 * Minimal OpenAI-chat-completions shim over the headless Claude Code CLI.
 *
 * Purpose: run-detection.js speaks to "any OpenAI-compatible endpoint"; in
 * environments whose only model access is the `claude` CLI (agent containers),
 * this shim bridges the two. POST /v1/chat/completions → `claude -p
 * --model <model>` with the system message passed via --system-prompt and the
 * user message on stdin. Temperature/max_tokens are accepted and ignored
 * (the CLI does not expose them; detection uses short deterministic replies).
 *
 * Usage:  node eval/tools/claude-cli-shim.js [port]   (default 8787)
 * Config: {"endpoint": "http://127.0.0.1:8787/v1/chat/completions", "model": "claude-haiku-4-5-20251001"}
 */

import http from 'node:http';
import { execFile } from 'node:child_process';

const PORT = Number(process.argv[2] ?? 8787);

function runClaude(model, system, user) {
    return new Promise((resolve, reject) => {
        const args = ['-p', '--model', model];
        if (system) args.push('--system-prompt', system);
        const child = execFile('claude', args, { timeout: 180000, maxBuffer: 1024 * 1024, cwd: process.env.PAPERCLIP_RUN_SCRATCH_DIR || '/tmp' },
            (err, stdout, stderr) => {
                if (err) reject(new Error(`claude CLI failed: ${err.message}\n${stderr.slice(0, 500)}`));
                else resolve(stdout.trim());
            });
        child.stdin.write(user);
        child.stdin.end();
    });
}

const server = http.createServer((req, res) => {
    if (req.method !== 'POST' || !req.url.endsWith('/chat/completions')) {
        res.writeHead(404).end('not found');
        return;
    }
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', async () => {
        try {
            const { model, messages } = JSON.parse(body);
            const system = messages.filter(m => m.role === 'system').map(m => m.content).join('\n');
            // Fold prior assistant/user turns (the JSON-only retry) into one prompt.
            const user = messages.filter(m => m.role !== 'system')
                .map(m => (m.role === 'assistant' ? `[your previous reply]: ${m.content}` : m.content))
                .join('\n\n');
            const content = await runClaude(model, system, user);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ choices: [{ message: { role: 'assistant', content } }] }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: { message: String(err.message || err) } }));
        }
    });
});

server.listen(PORT, '127.0.0.1', () => console.error(`claude-cli shim on http://127.0.0.1:${PORT}/v1/chat/completions`));
