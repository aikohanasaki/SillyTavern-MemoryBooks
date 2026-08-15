// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import test from 'node:test';
import { attachChatCompletionServiceError } from './chatCompletionServiceError.js';

test('retains the first service failure on the fallback error and its message', () => {
    const fallbackError = new Error('LLM request failed: 400 Bad Request');
    fallbackError.providerBody = '{"error":"Provider unavailable"}';

    const result = attachChatCompletionServiceError(
        fallbackError,
        new Error('DeepSeek does not support the requested response format'),
    );

    assert.equal(result, fallbackError);
    assert.equal(result.chatCompletionServiceError, 'DeepSeek does not support the requested response format');
    assert.match(result.message, /ChatCompletionService first failed: DeepSeek does not support/);
    assert.equal(result.providerBody, '{"error":"Provider unavailable"}');
});

test('does not duplicate an already attached service explanation', () => {
    const fallbackError = new Error('Fallback failed');
    const serviceError = new Error('Service failed');

    attachChatCompletionServiceError(fallbackError, serviceError);
    attachChatCompletionServiceError(fallbackError, serviceError);

    assert.equal(fallbackError.message.match(/ChatCompletionService first failed/g)?.length, 1);
});

test('leaves the fallback error unchanged when no service error was captured', () => {
    const fallbackError = new Error('Fallback failed');

    const result = attachChatCompletionServiceError(fallbackError, null);

    assert.equal(result, fallbackError);
    assert.equal(Object.hasOwn(result, 'chatCompletionServiceError'), false);
    assert.equal(result.message, 'Fallback failed');
});
