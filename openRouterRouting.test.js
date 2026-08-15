// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import test from 'node:test';
import { applyOpenRouterRoutingSettings } from './openRouterRouting.js';

test('adds SillyTavern OpenRouter routing controls to service payloads', () => {
    const settings = {
        openrouter_use_fallback: true,
        openrouter_providers: ['Anthropic', 'Google'],
        openrouter_quantizations: ['fp8', 'bf16'],
        openrouter_allow_fallbacks: false,
        openrouter_middleout: 'off',
    };
    const body = {
        chat_completion_source: 'openrouter',
        model: 'openrouter/auto',
    };

    const result = applyOpenRouterRoutingSettings(body, settings);

    assert.deepEqual(result, {
        use_fallback: true,
        provider: ['Anthropic', 'Google'],
        quantizations: ['fp8', 'bf16'],
        allow_fallbacks: false,
        middleout: 'off',
        chat_completion_source: 'openrouter',
        model: 'openrouter/auto',
    });
    assert.notEqual(result.provider, settings.openrouter_providers);
    assert.notEqual(result.quantizations, settings.openrouter_quantizations);
});

test('preserves explicit request routing overrides', () => {
    const result = applyOpenRouterRoutingSettings({
        chat_completion_source: 'openrouter',
        provider: ['Request provider'],
        allow_fallbacks: false,
    }, {
        openrouter_providers: ['Settings provider'],
        openrouter_allow_fallbacks: true,
    });

    assert.deepEqual(result.provider, ['Request provider']);
    assert.equal(result.allow_fallbacks, false);
});

test('leaves non-OpenRouter payloads unchanged', () => {
    const body = { chat_completion_source: 'openai', model: 'gpt-5' };
    const result = applyOpenRouterRoutingSettings(body, {
        openrouter_providers: ['Anthropic'],
    });

    assert.equal(result, body);
});
