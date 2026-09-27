// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { getSelectedConnectionProfile, prepareConnectionProfileRequest } from './connectionProfileRequest.js';
import { applyOpenRouterRoutingSettings } from './openRouterRouting.js';
import { attachChatCompletionServiceError } from './chatCompletionServiceError.js';

function fixture(source = 'nanogpt') {
    const calls = [];
    const context = {
        extensionSettings: { connectionManager: { selectedProfile: 'active' } },
        ConnectionManagerRequestService: {
            getProfile: id => ({ id }),
            validateProfile: () => ({ selected: 'openai', source }),
            sendRequest: async (...args) => { calls.push(args); return { choices: [] }; },
        },
    };
    const body = {
        chat_completion_source: source, model: 'stmb-model', temperature: 0.4,
        messages: [{ role: 'user', content: 'Summarize this scene' }],
        max_tokens: 1200, stream: false,
    };
    return { context, body, calls };
}

test('uses connected profile and its preset, overriding only generation fields', async () => {
    const { context, body, calls } = fixture();
    Object.assign(body, { custom_url: 'wrong-url', reverse_proxy: 'wrong-proxy', secret_id: 'wrong-key' });
    const signal = new AbortController().signal;
    const request = prepareConnectionProfileRequest(getSelectedConnectionProfile(context), body, signal);
    assert.deepEqual(await request(), { choices: [] });
    const [id, messages, tokens, options, overrides] = calls[0];
    assert.equal(id, 'active');
    assert.equal(messages, body.messages);
    assert.equal(tokens, 1200);
    assert.deepEqual(options, { stream: false, signal, extractData: false, includePreset: true });
    assert.equal(overrides.model, 'stmb-model');
    assert.equal(overrides.temperature, 0.4);
    for (const field of ['chat_completion_source', 'custom_url', 'reverse_proxy', 'secret_id']) {
        assert.equal(Object.hasOwn(overrides, field), false);
    }
    assert.equal(Object.hasOwn(overrides, 'json_schema'), true);
    assert.equal(overrides.json_schema, undefined);
});

test('preserves completion-token limits, schema and streaming', async () => {
    const { context, body, calls } = fixture();
    delete body.max_tokens;
    Object.assign(body, { max_completion_tokens: 2400, stream: true, json_schema: { name: 'memory' } });
    await prepareConnectionProfileRequest(getSelectedConnectionProfile(context), body, null)();
    const overrides = calls[0][4];
    assert.equal(calls[0][3].stream, true);
    assert.equal(Object.hasOwn(overrides, 'max_tokens'), true);
    assert.equal(overrides.max_tokens, undefined);
    assert.equal(overrides.max_completion_tokens, 2400);
    assert.deepEqual(overrides.json_schema, { name: 'memory' });
});

test('active Custom profile owns its credentials instead of STMB routing fields', async () => {
    const { context, body, calls } = fixture('custom');
    body.secret_id = 'stmb-keyless:explicit';
    await prepareConnectionProfileRequest(getSelectedConnectionProfile(context), body, null)();
    assert.equal(calls[0][0], 'active');
    assert.equal(Object.hasOwn(calls[0][4], 'secret_id'), false);
});

test('keeps the legacy route when no ST connection profile is selected', () => {
    const { context, body } = fixture();
    context.extensionSettings.connectionManager.selectedProfile = null;
    assert.equal(prepareConnectionProfileRequest(getSelectedConnectionProfile(context), body, null), null);
    assert.equal(getSelectedConnectionProfile({}), null);
});

test('connection provider takes precedence; text completion and missing profiles are rejected', () => {
    const { context, body, calls } = fixture();
    body.chat_completion_source = 'openai';
    assert.equal(getSelectedConnectionProfile(context).source, 'nanogpt');
    context.ConnectionManagerRequestService.validateProfile = () => ({ selected: 'textgenerationwebui' });
    assert.throws(() => getSelectedConnectionProfile(context), /must use Chat Completion/);
    context.ConnectionManagerRequestService.getProfile = () => { throw new Error('Profile not found'); };
    assert.throws(() => getSelectedConnectionProfile(context), /Profile not found/);
    assert.equal(calls.length, 0);
});

test('propagates provider errors without sending a second request', async () => {
    const { context, body } = fixture();
    let attempts = 0;
    const error = new Error('Too Many Requests');
    context.ConnectionManagerRequestService.sendRequest = async () => { attempts++; throw error; };
    await assert.rejects(prepareConnectionProfileRequest(getSelectedConnectionProfile(context), body, null), candidate => candidate === error);
    assert.equal(attempts, 1);
});

// Exercise the real sender functions with ST/browser imports replaced by mocks.
const source = readFileSync(new URL('./stmemory.js', import.meta.url), 'utf8');
function senderHarness(context) {
    const calls = [];
    const service = {
        sendRequest: async body => { calls.push(['legacy', body]); return { choices: [] }; },
        processRequest: async (body, options) => { calls.push(['preset', body, options]); return { choices: [] }; },
    };
    const scope = {
        Error, console, MODULE_NAME: 'test',
        getSelectedConnectionProfile, prepareConnectionProfileRequest,
        applyOpenRouterRoutingSettings, attachChatCompletionServiceError,
        getContext: () => context,
        getChatCompletionServiceOrNull: () => service,
        getCurrentCompletionEndpoint: () => '/generate',
        getRequestHeaders: () => ({}),
        oai_settings: { stream_openai: true, openai_max_tokens: 1500 },
        extension_settings: {},
        tr: (_key, fallback) => fallback,
        shouldForwardReverseProxy: () => false,
        extractCompletionText: () => '',
        parseCompletionResponse: async () => ({ choices: [] }),
        fetch: async (_url, options) => { calls.push(['fetch', JSON.parse(options.body)]); return { ok: true }; },
    };
    const functions = ['async function sendViaChatCompletionService(', 'export async function sendRawCompletionRequest(']
        .map(marker => {
            const start = source.indexOf(marker);
            assert.notEqual(start, -1);
            return source.slice(start, source.indexOf('\n/**', start)).replace(/^export /, '');
        }).join('\n');
    vm.runInNewContext(functions, scope);
    return { send: scope.sendRawCompletionRequest, calls };
}

test('checked sender uses active connection even with a separate STMB preset and provider', async () => {
    const { context, calls: connectionCalls } = fixture();
    const { send, calls } = senderHarness(context);
    await send({ api: 'openai', model: 'stmb-model', temperature: 0, prompt: 'scene', useChatCompletionService: true, chatCompletionPreset: 'ignored' });
    assert.equal(connectionCalls.length, 1);
    assert.equal(connectionCalls[0][0], 'active');
    assert.equal(connectionCalls[0][4].model, 'stmb-model');
    assert.equal(connectionCalls[0][4].temperature, 0);
    assert.equal(connectionCalls[0][4].max_tokens, 1500);
    assert.equal(calls.length, 0);
});

test('checked sender reports underlying rate-limit error without a direct retry', async () => {
    const { context } = fixture();
    const rateLimit = new Error('Too Many Requests');
    context.ConnectionManagerRequestService.sendRequest = async () => { throw new Error('API request failed', { cause: rateLimit }); };
    const { send, calls } = senderHarness(context);
    await assert.rejects(send({ api: 'nanogpt', model: 'model', prompt: 'scene', useChatCompletionService: true }), error => error === rateLimit);
    assert.equal(calls.length, 0);
});

test('unchecked sender and Full Manual preserve direct requests despite selected ST connection', async () => {
    const { context, calls: connectionCalls } = fixture();
    const { send, calls } = senderHarness(context);
    await send({ api: 'openai', model: 'model', prompt: 'scene' });
    await send({ api: 'full-manual', endpoint: 'https://example.test', model: 'model', prompt: 'scene', useChatCompletionService: true });
    assert.equal(connectionCalls.length, 0);
    assert.equal(calls.length, 2);
    assert.equal(calls[0][0], 'fetch');
    assert.equal(calls[0][1].chat_completion_source, 'openai');
    assert.equal(calls[1][0], 'fetch');
});

test('no selected ST connection retains both legacy service and explicit preset routes', async () => {
    const { context } = fixture();
    context.extensionSettings.connectionManager.selectedProfile = null;
    const { send, calls } = senderHarness(context);
    const options = { api: 'nanogpt', model: 'model', prompt: 'scene', useChatCompletionService: true };
    await send(options);
    await send({ ...options, chatCompletionPreset: 'chosen' });
    assert.equal(calls[0][0], 'legacy');
    assert.equal(calls[1][0], 'preset');
    assert.equal(calls[1][2].presetName, 'chosen');
});

test('connection streaming uses the existing accumulation path', async () => {
    const { context } = fixture();
    context.ConnectionManagerRequestService.sendRequest = async () => async function* () {
        yield { text: 'memory' };
        yield { text: 'memory content' };
    };
    const { send } = senderHarness(context);
    const result = await send({ api: 'nanogpt', model: 'model', prompt: 'scene', useChatCompletionService: true });
    assert.equal(result.text, 'memory content');
    assert.equal(result.full.choices[0].message.content, 'memory content');
});

test('cancellation retains the original error and does not retry', async () => {
    const { context } = fixture();
    const controller = new AbortController();
    const error = new Error('Cancelled', { cause: new Error('underlying abort') });
    context.ConnectionManagerRequestService.sendRequest = async () => { controller.abort(); throw error; };
    const { send, calls } = senderHarness(context);
    await assert.rejects(send({ api: 'nanogpt', prompt: 'scene', signal: controller.signal, useChatCompletionService: true }), candidate => candidate === error);
    assert.equal(calls.length, 0);
});
