// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// eval/detect.js — Detection runner for STMB-Auto Phase 0.
//
// Provides:
//   - buildDetectionWindows: sliding windows of 26 messages with 8-message
//     overlap (plan §3.1). The window builder strips headers + internal
//     thoughts and truncates each message to 500 chars via parser.js.
//   - OpenAIDetector: real LLM detector against any OpenAI-compatible
//     /chat/completions endpoint (LiteLLM, OpenAI, Anthropic-via-proxy,
//     local llama.cpp server, etc.). Strict-JSON parse of the array
//     response; ONE retry with a "JSON only" reprimand; on second failure
//     skip the window (never guess). Plan §3.3.
//   - HeaderOracleDetector: deterministic header-driven stub. Sanity test.
//   - StubDetector: replays predictions from a JSON file (re-score CLI).
//
// The Appendix A baseline prompt lives in eval/prompts/baseline.txt and is
// loaded from disk via loadBaselinePrompt() so users can edit it without
// touching code. BASELINE_PROMPT remains exported as a fallback for tests
// and callers that don't want to read the file.

import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { stripForDetection, formatForPrompt } from './parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const DEFAULT_BASELINE_PROMPT_FILE = resolve(__dirname, 'prompts/baseline.txt');

export const BASELINE_PROMPT = `You are a scene-boundary detector for long-form fiction. Below are numbered messages in the form "[id] Speaker: text" (truncated). Identify every message ID that BEGINS a new scene. Mark EVERY change of location however small (room to room, indoors to outdoors), any time skip of an hour or more, dream sequences, cutaways, and interludes. Be sensitive rather than conservative. Continuous action in one place is ONE scene even if the topic shifts.
Do NOT mark any boundary within the final 4 messages (that scene may be incomplete). Reply with ONLY a JSON array of integers, e.g. [12, 27], or [].`;

/**
 * Load the Appendix A baseline prompt from disk. The file is the
 * single source of truth for what the LLM sees; the BASELINE_PROMPT
 * constant above exists only as a fallback for tests.
 *
 * @param {string} [filePath=DEFAULT_BASELINE_PROMPT_FILE]
 * @returns {Promise<string>}
 */
export async function loadBaselinePrompt(filePath = DEFAULT_BASELINE_PROMPT_FILE) {
    return readFile(filePath, 'utf8');
}

/**
 * Build detection windows: contiguous slices of messages with overlap, as
 * described in plan §3.1. Default window size 26, overlap 8.
 *
 * @param {object[]} messages
 * @param {Object} [opts]
 * @param {number} [opts.windowSize=26]
 * @param {number} [opts.overlap=8]
 * @param {number} [opts.truncateChars=500]
 * @returns {Array<{ startIndex: number, endIndex: number, formatted: string, guardSize: number }>}
 *   startIndex/endIndex are 1-based inclusive boundaries into `messages`.
 *   formatted is the prompt payload (truncated messages, "[id] Speaker: text").
 *   guardSize is the number of trailing messages excluded from detection
 *   (plan §3.3 default 4).
 */
export function buildDetectionWindows(messages, opts = {}) {
    const windowSize = opts.windowSize ?? 26;
    const overlap = opts.overlap ?? 8;
    const truncateChars = opts.truncateChars ?? 500;
    const guardSize = opts.guardSize ?? 4;

    if (messages.length === 0) return [];
    const lastIdx = messages.length - 1;
    const step = Math.max(1, windowSize - overlap);
    const windows = [];
    for (let start = 0; start < messages.length; start += step) {
        const end = Math.min(lastIdx, start + windowSize - 1);
        // Guard: trim the last `guardSize` indices from the detection zone.
        // detectEnd must be >= start (so the window has at least one message)
        // and <= lastIdx (so we don't index past the end of messages).
        const detectEnd = Math.max(start, Math.min(end - guardSize, lastIdx));
        const windowMessages = messages.slice(start, detectEnd + 1);
        const formatted = windowMessages.map((m) => formatForPrompt(m, truncateChars)).join('\n');
        windows.push({
            startIndex: messages[start].index,
            endIndex: messages[detectEnd].index,
            formatted,
            guardSize,
        });
        if (end === lastIdx) break;
    }
    return windows;
}

/**
 * HeaderOracleDetector — uses narrator `headers` directly to predict boundaries.
 * This is a perfect-oracle stub: precision is 1.0 by construction. Useful for
 * smoke-testing the scorer and the runner end-to-end without an LLM call.
 */
export class HeaderOracleDetector {
    constructor(opts = {}) {
        this.timeJumpMinutes = opts.timeJumpMinutes ?? 90;
    }

    async detectBoundaries({ messages }) {
        const boundaries = [];
        let prevLoc = null;
        let prevTime = null;
        let firstSeen = false;
        for (const m of messages) {
            if (m.isUser || m.isSystem) continue;
            const h = m.headers;
            if (!h || !h.location) continue;
            if (!firstSeen) {
                boundaries.push(m.index);
                firstSeen = true;
            } else {
                if (h.location !== prevLoc) boundaries.push(m.index);
                else if (h.time && prevTime) {
                    // Convert both to minutes; flag forward jumps >= threshold.
                    const a = parseTime(h.time);
                    const b = parseTime(prevTime);
                    if (a != null && b != null) {
                        let dt = a - b;
                        if (dt < 0) dt += 24 * 60;
                        if (dt >= this.timeJumpMinutes) boundaries.push(m.index);
                    }
                }
            }
            prevLoc = h.location;
            prevTime = h.time ?? null;
        }
        return { boundaries, rawResponses: [{ oracle: true, predicted: boundaries }] };
    }
}

function parseTime(t) {
    const m = t.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
    if (!m) return null;
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    const ampm = m[3] ? m[3].toUpperCase() : null;
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + min;
}

/**
 * StubDetector — read predictions from a JSON file. Used for offline re-runs
 * once the real detector has produced output.
 */
export class StubDetector {
    constructor(filePath) {
        this.filePath = filePath;
    }
    async detectBoundaries() {
        const { readFile } = await import('node:fs/promises');
        const text = await readFile(this.filePath, 'utf8');
        const data = JSON.parse(text);
        const boundaries = Array.isArray(data) ? data : (data.boundaries ?? []);
        return { boundaries, rawResponses: [{ stub: this.filePath, predicted: boundaries }] };
    }
}

// ----------------------------------------------------------------------------
// OpenAI-compatible detector (PHA-1427)
// ----------------------------------------------------------------------------

/**
 * Default rejection text used on JSON-parse retry (plan §3.3 — "JSON only").
 */
export const JSON_RETRY_PROMPT = 'Reply with ONLY a JSON array of integers. No prose, no markdown, no explanation. JSON only.';

/**
 * Strict parse of a model response into an array of positive integers.
 * Accepts the bare array `[12, 27]`, or any JSON object containing a
 * `boundaries` array. Rejects anything else (NaN, floats, negatives,
 * strings, mixed types). Returns { boundaries, ok, error } so the caller
 * can decide whether to retry.
 *
 * @param {string} text
 * @returns {{ ok: true, boundaries: number[] } | { ok: false, error: string }}
 */
export function strictParseBoundaryArray(text) {
    if (typeof text !== 'string') {
        return { ok: false, error: 'response is not a string' };
    }
    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch (err) {
        return { ok: false, error: `JSON parse error: ${err.message}` };
    }
    let arr;
    if (Array.isArray(parsed)) {
        arr = parsed;
    } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.boundaries)) {
        arr = parsed.boundaries;
    } else {
        return { ok: false, error: 'response is not a JSON array of integers' };
    }
    const out = [];
    for (const v of arr) {
        if (typeof v !== 'number' || !Number.isInteger(v) || v < 0) {
            return { ok: false, error: `non-integer boundary: ${JSON.stringify(v)}` };
        }
        out.push(v);
    }
    return { ok: true, boundaries: out };
}

/**
 * OpenAIDetector — talks to any OpenAI-compatible /chat/completions
 * endpoint and parses the reply into a boundary array using strict
 * JSON discipline.
 *
 * Config keys (from eval/config.js or passed via `cfg`):
 *   baseUrl     e.g. http://10.0.0.100:4000  (no trailing slash)
 *   model       e.g. claude-3-5-sonnet-20241022
 *   apiKey      bearer token
 *   temperature (default 0)
 *   timeoutMs   (default 60000)
 *   prompt      (default: loadBaselinePrompt())
 *   fetch       (default: globalThis.fetch)  injected for tests
 *
 * The detector calls `chatCompletion(messages, cfg)` per window, runs
 * strictParseBoundaryArray, retries ONCE with JSON_RETRY_PROMPT on failure,
 * and skips the window if the second attempt also fails (never guesses).
 *
 * detectBoundaries returns:
 *   { boundaries, rawResponses, perWindow: Array<{
 *       startIndex, endIndex, boundaries, status: 'ok'|'skipped'|'error',
 *       attempts: number, rawResponse?: object, error?: string
 *     }> }
 *
 * The caller (runDetection) dedupes boundaries across windows.
 */
export class OpenAIDetector {
    constructor(cfg = {}) {
        if (!cfg.baseUrl) throw new Error('OpenAIDetector: baseUrl is required');
        if (!cfg.model) throw new Error('OpenAIDetector: model is required');
        if (!cfg.apiKey) throw new Error('OpenAIDetector: apiKey is required');
        this.cfg = {
            baseUrl: stripTrailingSlash(cfg.baseUrl),
            model: cfg.model,
            apiKey: cfg.apiKey,
            temperature: cfg.temperature ?? 0,
            timeoutMs: cfg.timeoutMs ?? 60000,
            prompt: cfg.prompt,
            maxJsonRetries: cfg.maxJsonRetries ?? 1,
            fetch: cfg.fetch ?? globalThis.fetch,
        };
    }

    async detectBoundaries({ messages, windows, prompt }) {
        // Build windows if caller did not supply them.
        const ws = windows ?? buildDetectionWindows(messages);
        const systemPrompt = prompt ?? this.cfg.prompt ?? await loadBaselinePrompt();
        const perWindow = [];
        const boundaries = [];
        for (const w of ws) {
            const result = await this.runOneWindow(w, systemPrompt);
            perWindow.push(result);
            if (result.status === 'ok') {
                for (const b of result.boundaries) boundaries.push(b);
            }
        }
        return { boundaries, rawResponses: perWindow, perWindow };
    }

    async runOneWindow(window, systemPrompt) {
        const userContent = window.formatted;
        const baseRecord = {
            startIndex: window.startIndex,
            endIndex: window.endIndex,
            attempts: 0,
        };
        // First attempt.
        let r;
        try {
            r = await this.chatCompletion([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent },
            ]);
        } catch (err) {
            return {
                ...baseRecord,
                status: 'skipped',
                error: `transport error: ${err && err.message ? err.message : String(err)}`,
            };
        }
        baseRecord.attempts = 1;
        const first = strictParseBoundaryArray(r.content);
        if (first.ok) {
            return {
                ...baseRecord,
                status: 'ok',
                boundaries: first.boundaries,
                rawResponse: r,
            };
        }
        if (this.cfg.maxJsonRetries <= 0) {
            return {
                ...baseRecord,
                status: 'skipped',
                error: first.error,
                rawResponse: r,
            };
        }
        // Retry with the JSON-only reprimand.
        let second;
        try {
            second = await this.chatCompletion([
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userContent },
                { role: 'assistant', content: r.content },
                { role: 'user', content: JSON_RETRY_PROMPT },
            ]);
        } catch (err) {
            return {
                ...baseRecord,
                status: 'skipped',
                error: `transport error on retry: ${err && err.message ? err.message : String(err)}`,
                rawResponse: r,
            };
        }
        baseRecord.attempts = 2;
        const retry = strictParseBoundaryArray(second.content);
        if (retry.ok) {
            return {
                ...baseRecord,
                status: 'ok',
                boundaries: retry.boundaries,
                rawResponse: second,
            };
        }
        return {
            ...baseRecord,
            status: 'skipped',
            error: retry.error,
            rawResponse: second,
        };
    }

    async chatCompletion(messages) {
        const url = `${this.cfg.baseUrl}/chat/completions`;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.cfg.timeoutMs);
        let resp;
        try {
            resp = await this.cfg.fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.cfg.apiKey}`,
                },
                body: JSON.stringify({
                    model: this.cfg.model,
                    messages,
                    temperature: this.cfg.temperature,
                }),
                signal: controller.signal,
            });
        } finally {
            clearTimeout(timer);
        }
        if (!resp.ok) {
            const body = await safeReadBody(resp);
            throw new Error(`HTTP ${resp.status} from ${url}: ${body.slice(0, 300)}`);
        }
        const data = await resp.json();
        const content = data?.choices?.[0]?.message?.content;
        if (typeof content !== 'string') {
            throw new Error('response missing choices[0].message.content');
        }
        return { content, raw: data };
    }
}

async function safeReadBody(resp) {
    try { return await resp.text(); } catch { return '<unreadable>'; }
}

function stripTrailingSlash(s) {
    return s.endsWith('/') ? s.slice(0, -1) : s;
}