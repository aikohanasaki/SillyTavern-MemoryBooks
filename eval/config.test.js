// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// eval/config.test.js — Unit tests for the env / .env config loader.

import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { resolveConfig, loadDotEnv } from './config.js';

test('loadDotEnv returns {} for missing file', async () => {
    const env = await loadDotEnv('/nonexistent/.env');
    assert.deepEqual(env, {});
});

test('loadDotEnv parses KEY=VALUE, ignores comments and blanks', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'cfg-'));
    try {
        const file = join(dir, '.env');
        await writeFile(file, [
            '# this is a comment',
            '',
            'STMB_BASE_URL=http://x',
            'STMB_MODEL=m',
            'STMB_API_KEY="quoted value"',
            "STMB_TEMPERATURE='0.5'",
            'INVALID_LINE_NO_EQUALS',
        ].join('\n'));
        const env = await loadDotEnv(file);
        assert.equal(env.STMB_BASE_URL, 'http://x');
        assert.equal(env.STMB_MODEL, 'm');
        assert.equal(env.STMB_API_KEY, 'quoted value');
        assert.equal(env.STMB_TEMPERATURE, '0.5');
        assert.equal(env.INVALID_LINE_NO_EQUALS, undefined);
    } finally {
        await rm(dir, { recursive: true, force: true });
    }
});

test('resolveConfig reports missing keys when env is empty', async () => {
    const cfg = await resolveConfig({ env: {}, dotEnvPath: '/nonexistent/.env' });
    assert.equal(cfg.isConfigured, false);
    assert.deepEqual(cfg.missing.sort(), ['STMB_API_KEY', 'STMB_BASE_URL', 'STMB_MODEL']);
    assert.equal(cfg.temperature, 0);
    assert.equal(cfg.timeoutMs, 60000);
    assert.equal(cfg.maxJsonRetries, 1);
});

test('resolveConfig honors provided env', async () => {
    const cfg = await resolveConfig({
        env: {
            STMB_BASE_URL: 'http://y',
            STMB_MODEL: 'gpt-x',
            STMB_API_KEY: 'k',
            STMB_TEMPERATURE: '0.7',
            STMB_TIMEOUT_MS: '12345',
        },
        dotEnvPath: '/nonexistent/.env',
    });
    assert.equal(cfg.isConfigured, true);
    assert.equal(cfg.baseUrl, 'http://y');
    assert.equal(cfg.model, 'gpt-x');
    assert.equal(cfg.apiKey, 'k');
    assert.equal(cfg.temperature, 0.7);
    assert.equal(cfg.timeoutMs, 12345);
});

test('resolveConfig clamps temperature and timeout to safe ranges', async () => {
    const cfg = await resolveConfig({
        env: {
            STMB_BASE_URL: 'http://y',
            STMB_MODEL: 'm',
            STMB_API_KEY: 'k',
            STMB_TEMPERATURE: '99',
            STMB_TIMEOUT_MS: '10',
        },
        dotEnvPath: '/nonexistent/.env',
    });
    assert.equal(cfg.temperature, 2); // clamped
    assert.equal(cfg.timeoutMs, 1000); // clamped to 1s minimum
});