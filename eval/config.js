// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// eval/config.js — Config loader for STMB-Auto Phase 0 detection runner.
//
// Loads detection config from environment variables (or a `.env` file if
// present in the eval directory). Single dependency-free implementation;
// no third-party dotenv package required.
//
// Required (for the OpenAI-compatible detector):
//   STMB_BASE_URL   e.g. http://10.0.0.100:4000  (LiteLLM) or
//                   https://api.openai.com/v1   (native)
//   STMB_MODEL      e.g. claude-3-5-sonnet-20241022 or any alias
//   STMB_API_KEY    Bearer token
//
// Optional:
//   STMB_TEMPERATURE       (default: 0.0)  numeric, clamped to [0, 2]
//   STMB_TIMEOUT_MS        (default: 60000)
//   STMB_MAX_RETRIES       (default: 1)    JSON-parse retries after first failure
//   STMB_PROMPT_FILE       (default: <eval>/prompts/baseline.txt)
//
// `.env` parsing is intentionally minimal: KEY=VALUE, one per line, # comments,
// no quoting/escaping, no variable interpolation. That covers the only shape
// we need for this phase.

import { readFile, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DEFAULT_PROMPT_FILE = resolve(__dirname, 'prompts/baseline.txt');

/**
 * Parse a tiny `.env` file into a plain object. Returns {} on missing file.
 * @param {string} filePath
 * @returns {Promise<Record<string, string>>}
 */
export async function loadDotEnv(filePath) {
    let exists = true;
    try { await stat(filePath); } catch { exists = false; }
    if (!exists) return {};
    const text = await readFile(filePath, 'utf8');
    const out = {};
    for (const rawLine of text.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;
        const eq = line.indexOf('=');
        if (eq < 0) continue;
        const key = line.slice(0, eq).trim();
        let val = line.slice(eq + 1).trim();
        // Strip a single layer of matching quotes if present.
        if (val.length >= 2 && ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))) {
            val = val.slice(1, -1);
        }
        if (key) out[key] = val;
    }
    return out;
}

/**
 * Resolve a detection config from env / .env.
 *
 * @param {object} [opts]
 * @param {Record<string, string>} [opts.env]   override process.env (for tests)
 * @param {string} [opts.dotEnvPath]            .env file path (default: <eval>/.env)
 * @returns {Promise<{
 *   baseUrl: string|null,
 *   model: string|null,
 *   apiKey: string|null,
 *   temperature: number,
 *   timeoutMs: number,
 *   maxJsonRetries: number,
 *   promptFile: string,
 *   isConfigured: boolean,
 *   missing: string[],
 * }>}
 */
export async function resolveConfig(opts = {}) {
    const fileEnv = await loadDotEnv(opts.dotEnvPath ?? resolve(__dirname, '.env'));
    const env = { ...fileEnv, ...(opts.env ?? process.env) };
    const missing = [];
    if (!env.STMB_BASE_URL) missing.push('STMB_BASE_URL');
    if (!env.STMB_MODEL) missing.push('STMB_MODEL');
    if (!env.STMB_API_KEY) missing.push('STMB_API_KEY');
    const temperature = clamp(parseFloat(env.STMB_TEMPERATURE ?? '0'), 0, 2);
    const timeoutMs = clamp(parseInt(env.STMB_TIMEOUT_MS ?? '60000', 10) || 60000, 1000, 600000);
    const maxJsonRetries = clamp(parseInt(env.STMB_MAX_RETRIES ?? '1', 10) || 1, 0, 5);
    const promptFile = env.STMB_PROMPT_FILE || DEFAULT_PROMPT_FILE;
    return {
        baseUrl: env.STMB_BASE_URL ?? null,
        model: env.STMB_MODEL ?? null,
        apiKey: env.STMB_API_KEY ?? null,
        temperature: Number.isFinite(temperature) ? temperature : 0,
        timeoutMs,
        maxJsonRetries,
        promptFile,
        isConfigured: missing.length === 0,
        missing,
    };
}

function clamp(n, lo, hi) {
    if (!Number.isFinite(n)) return lo;
    return Math.max(lo, Math.min(hi, n));
}