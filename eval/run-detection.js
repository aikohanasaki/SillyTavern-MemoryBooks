#!/usr/bin/env node
/**
 * STMB-Auto Phase 0 — P0.2: Window builder + detection runner.
 *
 * Reads the normalized fixture emitted by parse-transcript.js, builds sliding
 * windows (default 26 messages, 8-message overlap, messages truncated to 500
 * chars, formatted "[id] Speaker: text"), and runs scene-boundary detection
 * against any OpenAI-compatible chat-completions endpoint. Emits per-window
 * raw output plus the deduplicated boundary prediction list for scoring
 * (stmb-auto-plan.md §3.1–3.3, Phase 0).
 *
 * JSON discipline (§3.3): the reply must parse as an array of integers.
 * On failure, retry once with a "JSON only" reprimand; on second failure the
 * window is skipped — never guess. Boundaries in a window's final 4 messages
 * (the guard zone) are dropped.
 *
 * Config file (JSON, --config; env vars override nothing — the file is the
 * source of truth, but ${VAR} values in it are expanded from the environment):
 *   {
 *     "endpoint": "https://api.example.com/v1/chat/completions",
 *     "model": "some-model",
 *     "apiKey": "${DETECT_API_KEY}",
 *     "temperature": 0,          // optional, default 0
 *     "maxTokens": 300,          // optional, default 300
 *     "promptFile": "eval/prompts/appendix-a.txt"  // optional; default = built-in Appendix A
 *   }
 *
 * Usage:
 *   node eval/run-detection.js --fixture eval/out/fixture.json \
 *     --config eval/detect.config.json --out eval/out/predictions.json \
 *     [--window 26] [--overlap 8] [--truncate 500] [--guard 4] \
 *     [--dry-run]   # print windows + prompts, no API calls
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);

// ---------------------------------------------------------------- CLI

function parseArgs(argv) {
    const opts = {
        fixture: null,
        config: null,
        out: null,
        window: 26,
        overlap: 8,
        truncate: 500,
        guard: 4,
        dryRun: false,
    };
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        const next = () => argv[++i];
        switch (a) {
            case '--fixture': opts.fixture = next(); break;
            case '--config': opts.config = next(); break;
            case '--out': opts.out = next(); break;
            case '--window': opts.window = Number(next()); break;
            case '--overlap': opts.overlap = Number(next()); break;
            case '--truncate': opts.truncate = Number(next()); break;
            case '--guard': opts.guard = Number(next()); break;
            case '--dry-run': opts.dryRun = true; break;
            case '--help':
                console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0]);
                process.exit(0);
            default:
                throw new Error(`Unknown argument: ${a}`);
        }
    }
    if (!opts.fixture) throw new Error('--fixture is required');
    if (!opts.dryRun && !opts.config) throw new Error('--config is required (or use --dry-run)');
    if (opts.overlap >= opts.window) throw new Error('--overlap must be smaller than --window');
    return opts;
}

// ---------------------------------------------------------------- prompt (Appendix A, validated; user-swappable via promptFile)

const APPENDIX_A_PROMPT = `You are a scene-boundary detector for long-form fiction. Below are numbered
messages in the form "[id] Speaker: text" (truncated). Identify every message
ID that BEGINS a new scene. Mark EVERY change of location however small (room
to room, indoors to outdoors), any time skip of an hour or more, dream
sequences, cutaways, and interludes. Be sensitive rather than conservative.
Continuous action in one place is ONE scene even if the topic shifts.
Do NOT mark any boundary within the final 4 messages (that scene may be
incomplete). Reply with ONLY a JSON array of integers, e.g. [12, 27], or [].`;

// ---------------------------------------------------------------- windows

/**
 * Sliding windows over the message array: `size` messages per window,
 * stepping by (size - overlap). The last window is anchored to the end of
 * the transcript so no tail messages are dropped.
 */
function buildWindows(messages, { window: size, overlap }) {
    const step = size - overlap;
    const windows = [];
    for (let start = 0; ; start += step) {
        let s = start;
        let e = Math.min(s + size, messages.length);
        const last = e >= messages.length;
        if (last) s = Math.max(0, messages.length - size);
        windows.push({ index: windows.length, start: s, end: e, messages: messages.slice(s, e) });
        if (last) break;
    }
    return windows;
}

function truncateText(text, limit) {
    const flat = text.replace(/\s+/g, ' ').trim();
    return flat.length > limit ? flat.slice(0, limit) + '…' : flat;
}

function formatWindow(win, truncate) {
    return win.messages
        .map(m => `[${m.id}] ${m.speaker}: ${truncateText(m.text, truncate)}`)
        .join('\n');
}

// ---------------------------------------------------------------- strict-JSON parsing

/**
 * Accept only a JSON array of integers. Tolerates surrounding whitespace and
 * a markdown code fence (models add these even when told not to), nothing
 * else. Returns the array or null.
 */
function parseIdArray(reply) {
    if (typeof reply !== 'string') return null;
    let s = reply.trim();
    const fence = /^```(?:json)?\s*([\s\S]*?)\s*```$/.exec(s);
    if (fence) s = fence[1].trim();
    let parsed;
    try {
        parsed = JSON.parse(s);
    } catch {
        return null;
    }
    if (!Array.isArray(parsed) || !parsed.every(n => Number.isInteger(n))) return null;
    return parsed;
}

// ---------------------------------------------------------------- API

function loadConfig(file) {
    const raw = fs.readFileSync(file, 'utf8')
        .replace(/\$\{(\w+)\}/g, (_, name) => process.env[name] ?? '');
    const cfg = JSON.parse(raw);
    if (!cfg.endpoint) throw new Error('config.endpoint is required');
    if (!cfg.model) throw new Error('config.model is required');
    cfg.temperature ??= 0;
    cfg.maxTokens ??= 300;
    return cfg;
}

async function chatCall(cfg, messages) {
    const res = await fetch(cfg.endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(cfg.apiKey ? { Authorization: `Bearer ${cfg.apiKey}` } : {}),
        },
        body: JSON.stringify({
            model: cfg.model,
            temperature: cfg.temperature,
            max_tokens: cfg.maxTokens,
            messages,
        }),
    });
    if (!res.ok) {
        throw new Error(`API ${res.status}: ${(await res.text()).slice(0, 500)}`);
    }
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') throw new Error('API reply missing choices[0].message.content');
    return content;
}

/**
 * One detection round for a window: initial call, then a single "JSON only"
 * retry on parse failure. Returns { ids, attempts, raw } with ids === null
 * when the window is skipped (second failure) — never guess (§3.3).
 */
async function detectWindow(cfg, prompt, windowText) {
    const base = [
        { role: 'system', content: prompt },
        { role: 'user', content: windowText },
    ];
    const attempts = [];
    let reply = await chatCall(cfg, base);
    attempts.push(reply);
    let ids = parseIdArray(reply);
    if (ids === null) {
        reply = await chatCall(cfg, [
            ...base,
            { role: 'assistant', content: reply },
            { role: 'user', content: 'Reply with ONLY a JSON array of integers, e.g. [12, 27], or []. No prose, no code fences.' },
        ]);
        attempts.push(reply);
        ids = parseIdArray(reply);
    }
    return { ids, attempts };
}

// ---------------------------------------------------------------- main

async function main() {
    const opts = parseArgs(process.argv);
    const fixture = JSON.parse(fs.readFileSync(opts.fixture, 'utf8'));
    const messages = fixture.messages;
    if (!Array.isArray(messages)) throw new Error('fixture has no messages array');

    const windows = buildWindows(messages, opts);
    const cfg = opts.dryRun ? null : loadConfig(opts.config);
    const prompt = cfg?.promptFile
        ? fs.readFileSync(cfg.promptFile, 'utf8').trim()
        : APPENDIX_A_PROMPT;

    if (opts.dryRun) {
        for (const w of windows) {
            console.log(`--- window ${w.index}: messages ${w.start}–${w.end - 1} (guard: last ${opts.guard}) ---`);
            console.log(formatWindow(w, opts.truncate));
        }
        console.error(`windows=${windows.length} window=${opts.window} overlap=${opts.overlap} truncate=${opts.truncate}`);
        return;
    }

    const results = [];
    const boundarySet = new Set();
    for (const w of windows) {
        const text = formatWindow(w, opts.truncate);
        // Guard zone: never accept boundaries in the window's final `guard`
        // messages — the scene may still be incomplete (§3.3).
        const guardStart = messages[w.end - 1].id - opts.guard + 1;
        let outcome;
        try {
            outcome = await detectWindow(cfg, prompt, text);
        } catch (err) {
            outcome = { ids: null, attempts: [], error: String(err.message || err) };
        }
        const windowIds = new Set(w.messages.map(m => m.id));
        const accepted = (outcome.ids ?? []).filter(id => windowIds.has(id) && id < guardStart);
        const dropped = (outcome.ids ?? []).filter(id => !windowIds.has(id) || id >= guardStart);
        for (const id of accepted) boundarySet.add(id);
        results.push({
            window: w.index,
            start: w.start,
            end: w.end - 1,
            guardStart,
            skipped: outcome.ids === null,
            error: outcome.error ?? null,
            rawAttempts: outcome.attempts,
            accepted,
            dropped,
        });
        console.error(
            `window ${w.index} [${w.start}–${w.end - 1}]: ` +
            (outcome.ids === null
                ? `SKIPPED${outcome.error ? ` (${outcome.error})` : ' (unparseable after retry)'}`
                : `accepted=[${accepted.join(',')}]${dropped.length ? ` dropped=[${dropped.join(',')}]` : ''}`),
        );
    }

    const predictions = [...boundarySet].sort((a, b) => a - b);
    const out = {
        fixture: path.basename(opts.fixture),
        config: {
            endpoint: cfg.endpoint,
            model: cfg.model,
            temperature: cfg.temperature,
            window: opts.window,
            overlap: opts.overlap,
            truncate: opts.truncate,
            guard: opts.guard,
            prompt,
        },
        stats: {
            windows: windows.length,
            skippedWindows: results.filter(r => r.skipped).length,
            predictions: predictions.length,
        },
        predictions,
        windows: results,
    };

    const json = JSON.stringify(out, null, 2);
    if (opts.out) {
        fs.mkdirSync(path.dirname(opts.out), { recursive: true });
        fs.writeFileSync(opts.out, json);
        console.log(`Wrote ${opts.out}`);
    } else {
        console.log(json);
    }
    console.error(
        `windows=${out.stats.windows} skipped=${out.stats.skippedWindows} predictions=${out.stats.predictions}`,
    );
}

if (process.argv[1] === __filename) main().catch(err => { console.error(err); process.exit(1); });

export { buildWindows, formatWindow, truncateText, parseIdArray, detectWindow, APPENDIX_A_PROMPT };
