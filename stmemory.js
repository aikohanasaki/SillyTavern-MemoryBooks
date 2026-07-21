// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import { getEffectivePrompt, getCurrentApiInfo, normalizeCompletionSource, estimateTokens, isStmbStopError, StmbCancelledError, normalizeAdditionalContextEntries } from './utils.js';
import { characters, this_chid, substituteParams, getRequestHeaders } from '../../../../script.js';
import { getStreamingReply, oai_settings, ZAI_ENDPOINT } from '../../../openai.js';
import EventSourceStream from '../../../sse-stream.js';
import { runRegexScript, getRegexScripts } from '../../../extensions/regex/engine.js';
import { groups } from '../../../group-chats.js';
import { extension_settings, getContext } from '../../../extensions.js';
import { translate } from '../../../i18n.js';
import dirtyJson from 'dirty-json';
import { getSceneMarkers } from './sceneManager.js';
import {
    CONTEXT_NONE_KEY,
    getContextSetting,
    resolveContextSettingEntries,
    resolveContextSettingEntriesFromRefs,
} from './contextSettingsManager.js';
const $ = window.jQuery;

const MODULE_NAME = 'STMemoryBooks-Memory';
let hasWarnedMissingChatCompletionService = false;

const MEMORY_RESPONSE_JSON_SCHEMA = Object.freeze({
    name: 'stmb_memory',
    description: 'A generated Memory Books lorebook memory.',
    strict: true,
    value: {
        type: 'object',
        additionalProperties: false,
        required: ['content', 'title', 'keywords'],
        properties: {
            content: {
                type: 'string',
                description: 'The memory content to save in the lorebook.',
            },
            title: {
                type: 'string',
                description: 'A short title for the memory.',
            },
            keywords: {
                type: 'array',
                items: { type: 'string' },
                description: 'Activation keywords for the memory.',
            },
        },
    },
});

// --- ST Regex selection-based execution (bypass engine gating) ---

/**
 * Clone a script and force disabled=false so explicitly selected scripts always run.
 */
function cloneScriptEnabled(script) {
    try {
        const clone = { ...script };
        clone.disabled = false;
        return clone;
    } catch {
        return script;
    }
}

/**
 * Apply selected regex scripts (by flat index keys, e.g., "idx:0") in order.
 * Uses getRegexScripts({ allowedOnly: false }) as the single source of truth.
 * Bypasses engine gating; relies on explicit user selection.
 */
export function applySelectedRegex(inputText, selectedKeys) {
    if (typeof inputText !== 'string') return '';
    if (!Array.isArray(selectedKeys) || selectedKeys.length === 0) return inputText;

    try {
        const all = getRegexScripts({ allowedOnly: false }) || [];
        const order = selectedKeys
            .map(k => Number(String(k).replace(/^idx:/, '')))
            .filter(i => Number.isInteger(i) && i >= 0 && i < all.length);

        let out = inputText;
        for (const i of order) {
            const script = cloneScriptEnabled(all[i]);
            try {
                out = runRegexScript(script, out);
            } catch (e) {
                console.warn('applySelectedRegex: script failed', i, e);
            }
        }
        return out;
    } catch (e) {
        console.warn('applySelectedRegex failed', e);
        return inputText;
    }
}


// --- Custom Error Types for Better UI Handling ---
class TokenWarningError extends Error {
    constructor(message, tokenCount) {
        super(message);
        this.name = 'TokenWarningError';
        this.tokenCount = tokenCount;
    }
}

class AIResponseError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AIResponseError';
    }
}

class InvalidProfileError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidProfileError';
    }
}

function getCurrentCompletionEndpoint() {
    return '/api/backends/chat-completions/generate';
}

const PROXY_SUPPORTED_COMPLETION_SOURCES = new Set([
    'claude',
    'openai',
    'mistralai',
    'makersuite',
    'vertexai',
    'deepseek',
    'xai',
    'zai',
    'moonshot',
]);

function shouldForwardReverseProxy(api, reverseProxy) {
    return !!reverseProxy && !!oai_settings?.reverse_proxy && PROXY_SUPPORTED_COMPLETION_SOURCES.has(api);
}

function extractStructuredToolInput(contentBlocks) {
    if (!Array.isArray(contentBlocks)) {
        return '';
    }

    const toolUseInput = contentBlocks.find(block =>
        block && typeof block === 'object' && block.type === 'tool_use' && block.input && typeof block.input === 'object',
    )?.input;

    if (!toolUseInput) {
        return '';
    }

    try {
        return JSON.stringify(toolUseInput);
    } catch {
        return '';
    }
}

function extractChatMessageText(message) {
    if (!message || typeof message !== 'object') {
        return '';
    }

    const content = message.content;
    if (typeof content === 'string') {
        return content;
    }

    const toolUseJson = extractStructuredToolInput(content);
    if (toolUseJson) {
        return toolUseJson;
    }

    if (Array.isArray(content)) {
        return content
            .map(block => typeof block?.text === 'string' ? block.text : '')
            .join('');
    }

    return '';
}

function extractCompletionText(data) {
    const messageText = extractChatMessageText(data?.choices?.[0]?.message);
    if (messageText) {
        return messageText;
    }

    if (data?.completion) {
        return data.completion;
    }

    if (data?.choices?.[0]?.text) {
        return data.choices[0].text;
    }

    if (data?.content && Array.isArray(data.content)) {
        return extractStructuredToolInput(data.content)
            || data.content
                .map(block => typeof block?.text === 'string' ? block.text : '')
                .join('');
    }

    if (typeof data?.content === 'string') {
        return data.content;
    }

    return '';
}

function isEventStreamResponse(response) {
    return String(response?.headers?.get('content-type') || '').toLowerCase().includes('text/event-stream');
}

function looksLikeSsePayload(text) {
    return /^\s*(?:event|data|id|retry)\s*:/m.test(String(text || ''));
}

function getStreamingFinishReason(data) {
    return data?.choices?.[0]?.finish_reason
        || data?.choices?.[0]?.finishReason
        || data?.finish_reason
        || data?.stop_reason
        || null;
}

function makeStreamingParseError(message, rawEvent, cause = null) {
    const err = new Error(message);
    err.name = 'StreamingResponseParseError';
    err.rawResponse = rawEvent;
    if (cause) {
        err.cause = cause;
    }
    return err;
}

function makeSyntheticStreamingResponse(text, lastEvent, lastRawEvent, finishReason) {
    return {
        choices: [
            {
                index: 0,
                message: {
                    role: 'assistant',
                    content: text,
                },
                finish_reason: finishReason || null,
            },
        ],
        stmb_streaming: {
            source: 'sse',
            finish_reason: finishReason || null,
            last_event: lastEvent || null,
            last_raw_event: lastRawEvent || '',
        },
    };
}

async function parseSseCompletionResponseBody(body, api) {
    if (!body) {
        throw makeStreamingParseError('Streaming response did not include a readable body.', '');
    }

    const eventStream = new EventSourceStream();
    const reader = body.pipeThrough(eventStream).getReader();
    const state = { reasoning: '', images: [], signature: '', toolSignatures: {} };
    let text = '';
    let lastEvent = null;
    let lastRawEvent = '';
    let finishReason = null;

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }

            const rawData = String(value?.data || '');
            lastRawEvent = rawData;
            if (rawData === '[DONE]') {
                break;
            }

            let parsed;
            try {
                parsed = JSON.parse(rawData);
            } catch (error) {
                throw makeStreamingParseError('Failed to parse streaming completion event JSON.', rawData, error);
            }

            lastEvent = parsed;
            finishReason = getStreamingFinishReason(parsed) || finishReason;
            text += getStreamingReply(parsed, state, { chatCompletionSource: api, overrideShowThoughts: false });
        }
    } finally {
        try {
            reader.releaseLock();
        } catch {
            // Ignore reader cleanup errors; the response has already been consumed.
        }
    }

    return makeSyntheticStreamingResponse(text, lastEvent, lastRawEvent, finishReason);
}

async function parseCompletionResponse(response, api) {
    if (isEventStreamResponse(response)) {
        return await parseSseCompletionResponseBody(response.body, api);
    }

    const bodyText = await response.text();
    if (looksLikeSsePayload(bodyText)) {
        return await parseSseCompletionResponseBody(new Response(bodyText).body, api);
    }

    return JSON.parse(bodyText);
}

function getChatCompletionServiceOrNull() {
    try {
        const service = getContext?.()?.ChatCompletionService;
        if (service && typeof service.sendRequest === 'function') {
            return service;
        }
    } catch (error) {
        if (!hasWarnedMissingChatCompletionService) {
            console.warn(`${MODULE_NAME}: ChatCompletionService is unavailable; falling back to STMB request path.`, error);
            hasWarnedMissingChatCompletionService = true;
        }
        return null;
    }

    if (!hasWarnedMissingChatCompletionService) {
        console.warn(`${MODULE_NAME}: ChatCompletionService is unavailable; falling back to STMB request path.`);
        hasWarnedMissingChatCompletionService = true;
    }
    return null;
}

async function sendViaChatCompletionService(body, signal, presetName = '') {
    const service = getChatCompletionServiceOrNull();
    if (!service) {
        return null;
    }

    const normalizedPresetName = typeof presetName === 'string' ? presetName.trim() : '';
    const serviceBody = {
        ...body,
        stream: !!oai_settings?.stream_openai,
    };
    let full;
    try {
        if (normalizedPresetName && typeof service.processRequest === 'function') {
            full = await service.processRequest(serviceBody, { presetName: normalizedPresetName }, false, signal);
        } else {
            if (normalizedPresetName && typeof service.processRequest !== 'function') {
                console.warn(`${MODULE_NAME}: ChatCompletionService.processRequest is unavailable; falling back to sendRequest.`);
            }
            full = await service.sendRequest(serviceBody, false, signal);
        }

        if (typeof full === 'function') {
            let text = '';
            let lastChunk = null;
            for await (const chunk of full()) {
                lastChunk = chunk;
                if (typeof chunk?.text === 'string') {
                    text = chunk.text;
                }
            }
            return {
                text,
                full: {
                    choices: [
                        {
                            index: 0,
                            message: {
                                role: 'assistant',
                                content: text,
                            },
                            finish_reason: null,
                        },
                    ],
                    stmb_streaming: {
                        source: 'chat_completion_service',
                        last_chunk: lastChunk || null,
                    },
                },
            };
        }
    } catch (error) {
        if (signal?.aborted) {
            throw error;
        }
        console.warn(`${MODULE_NAME}: ChatCompletionService request failed; falling back to STMB request path.`, error);
        return null;
    }
    return {
        text: extractCompletionText(full),
        full,
    };
}

/**
*Send a raw completion request to the backend, bypassing SillyTavern's chat context stack.*
*Supports OpenAI, Claude, Gemini, and custom OpenAI-compatible endpoints.*
**
*@param {Object} opts*
*@param {string} opts.model*
*@param {string} opts.prompt*
*@param {number} [opts.temperature]*
*@param {string} [opts.api] - 'openai', 'claude', 'makersuite', 'custom', etc. (Note: ST uses 'makersuite' as the canonical provider key; avoid other aliases).*
*@param {string} [opts.endpoint] - Custom endpoint URL for custom APIs*
*@param {Object} [opts.extra] - Any extra params (max_tokens, etc)*
*@param {boolean} [opts.reverseProxy] - Whether to forward SillyTavern reverse proxy settings for supported providers*
*@param {Object|null} [opts.jsonSchema] - Optional SillyTavern structured-output schema*
*@param {boolean} [opts.useChatCompletionService=false] - Whether to use SillyTavern's ChatCompletionService for non-manual requests*
*@param {string} [opts.chatCompletionPreset=''] - Optional SillyTavern chat completion preset to apply through ChatCompletionService.processRequest*
*@returns {Promise<{text: string, full: object}>}*
*/
export async function sendRawCompletionRequest({
    model,
    prompt,
    temperature = 0.7,
    api = 'openai',
    endpoint = null,
    apiKey = null,
    extra = {},
    reverseProxy = false,
    signal = null,
    jsonSchema = null,
    useChatCompletionService = false,
    chatCompletionPreset = '',
}) {
    let url = getCurrentCompletionEndpoint();
    let headers = getRequestHeaders();
    const modelId = (typeof model === 'string' ? model.toLowerCase() : '');

    // Compute desired max tokens:
    // - STMB override wins if set (>0)
    // - otherwise use the largest explicit value from request extra / ST UI max_tokens
    //   (no minimum enforced)
    const stmbOverrideRaw = extension_settings?.STMemoryBooks?.moduleSettings?.maxTokens;
    const stmbOverride = Number.parseInt(stmbOverrideRaw, 10);
    const desiredFromSources = (Number.isFinite(stmbOverride) && stmbOverride > 0)
        ? stmbOverride
        : Math.max(
            Number(extra.max_tokens) || 0,
            Number(extra.max_completion_tokens) || 0,
            Number(extra.max_output_tokens) || 0,
            Number(extra.max_new_tokens) || 0,
            Number(oai_settings?.openai_max_tokens) || 0,
            // Kept for backward compatibility if a fork uses a different name
            Number(oai_settings?.max_response) || 0
        );

    const desiredInt = Math.floor(desiredFromSources) || 0;

    // Regex to detect models that require max_completion_tokens instead of max_tokens
    // (e.g., gpt-5, gpt-4o variants, o1-preview, o1-mini)
    const usesMaxCompletionTokens = /(gpt-5|gpt-4o|o1(-preview|-mini)?)/i;

    // Set tokens based on explicit inputs; handle special-case for models using max_completion_tokens
    if (Number.isFinite(desiredInt) && desiredInt > 0) {
        if (usesMaxCompletionTokens.test(modelId)) {
            extra.max_completion_tokens = desiredInt;
            // Ensure we don't send max_tokens for this provider
            delete extra.max_tokens;
        } else {
            extra.max_tokens = desiredInt;
            // Avoid accidentally sending both OpenAI-style token fields.
            delete extra.max_completion_tokens;
        }
    }

    // Optional: mirror to providers that use a different field if present
    if (extra.max_output_tokens != null) {
        // Coerce and validate the incoming value to a finite number before flooring to avoid NaN propagation
        const moRaw = Number.parseFloat(extra.max_output_tokens);
        const mo = Number.isFinite(moRaw) ? Math.floor(moRaw) : 0;
        if (Number.isFinite(desiredInt) && desiredInt > 0) {
            extra.max_output_tokens = Math.min(mo, desiredInt);
        } else {
            extra.max_output_tokens = mo;
        }
    }

    let body = {
        messages: [
            { role: 'user', content: prompt }
        ],
        model,
        temperature,
        chat_completion_source: api,
        stream: false,
        ...extra,
    };

    // Handle full-manual configuration with direct endpoint calls
    // Note: apiKey is optional (common for local OpenAI-compatible endpoints).
    if (api === 'full-manual') {
        const endpointUrl = String(endpoint || '').trim();
        if (!endpointUrl) {
            throw new InvalidProfileError('Full Manual Configuration requires an API Endpoint URL.');
        }

        url = endpointUrl;
        headers = {
            'Content-Type': 'application/json',
        };
        const key = apiKey != null ? String(apiKey).trim() : '';
        if (key) {
            headers['Authorization'] = `Bearer ${key}`;
        }
        // For direct endpoint calls, use standard OpenAI-compatible format
        body = {
            model,
            messages: [
                { role: 'user', content: prompt }
            ],
            temperature,
            stream: false,
            ...extra,
        };
    } else if (api === 'custom' && model) {
        body.custom_model_id = model;
        body.custom_url = oai_settings.custom_url || '';
    } else if (api === 'deepseek') {
        body.custom_url = `https://api.deepseek.com/chat/completions`; // use primary Deepseek endpoint
    } else if (api === 'zai') {
        body.zai_endpoint = oai_settings?.zai_endpoint || ZAI_ENDPOINT.COMMON;
    }

    if (jsonSchema && api !== 'full-manual') {
        body.json_schema = jsonSchema;
    }

    if (shouldForwardReverseProxy(api, reverseProxy)) {
        body.reverse_proxy = oai_settings.reverse_proxy;
        body.proxy_password = oai_settings.proxy_password || '';
    }

    if (api === 'vertexai') {
        body.vertexai_auth_mode = oai_settings?.vertexai_auth_mode || 'express';
        body.vertexai_region = oai_settings?.vertexai_region || 'us-central1';
        body.vertexai_express_project_id = oai_settings?.vertexai_express_project_id || '';
    }

    if (api !== 'full-manual' && useChatCompletionService) {
        const serviceResult = await sendViaChatCompletionService(body, signal, chatCompletionPreset);
        if (serviceResult) {
            return serviceResult;
        }
    }

    const res = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
        signal: signal || undefined,
    });

    if (!res.ok) {
        let providerBody = '';
        try {
            providerBody = await res.text();
        } catch (e) {
            providerBody = '';
        }
        const err = new Error(`LLM request failed: ${res.status} ${res.statusText}`);
        err.status = res.status;
        if (providerBody) {
            err.providerBody = providerBody;
        }
        throw err;
    }

    const data = await parseCompletionResponse(res, api);
    const text = extractCompletionText(data);

    return { text, full: data };
}

/**
 * Unified request wrapper for side prompts and memory generation.
 * Accepts normalized connection fields and forwards to sendRawCompletionRequest.
 * @param {{ api: string, model: string, prompt: string, temperature?: number, endpoint?: string, apiKey?: string, extra?: object, reverseProxy?: boolean, jsonSchema?: object, useChatCompletionService?: boolean, chatCompletionPreset?: string }} opts
 * @returns {Promise<{ text: string, full: object }>}
 */
export async function requestCompletion({
    api,
    model,
    prompt,
    temperature = 0.7,
    endpoint = null,
    apiKey = null,
    extra = {},
    reverseProxy = false,
    signal = null,
    jsonSchema = null,
    useChatCompletionService = false,
    chatCompletionPreset = '',
}) {
    // Delegate all provider-specific shaping to sendRawCompletionRequest which already
    // handles: full-manual, custom (custom_model_id  oai_settings.custom_url), and normal providers.
    return await sendRawCompletionRequest({
        model,
        prompt,
        temperature,
        api,
        endpoint,
        apiKey,
        extra,
        reverseProxy,
        signal,
        jsonSchema,
        useChatCompletionService,
        chatCompletionPreset,
    });
}

/**
 * Polling configuration for waitForCharacterData
 * @typedef {Object} PollingConfig
 * @property {number} maxWaitMs - Maximum time to wait in milliseconds (default: 5000)
 * @property {number} initialIntervalMs - Initial check interval in milliseconds (default: 100)
 * @property {number} maxIntervalMs - Maximum check interval in milliseconds (default: 1000)
 * @property {number} backoffMultiplier - Multiplier for exponential backoff (default: 1.5)
 * @property {boolean} useExponentialBackoff - Whether to use exponential backoff (default: true)
 * @property {AbortSignal} signal - Optional AbortSignal for cancellation
 */

/**
 * GROUP CHAT SUPPORT: Waits for character/group data to be available with enhanced polling
 * Features exponential backoff, cancellation support, and better error handling
 * @private
 * @param {PollingConfig|number} config - Polling configuration or legacy maxWaitMs parameter
 * @param {number} legacyCheckIntervalMs - Legacy parameter for backward compatibility
 * @returns {Promise<boolean>} True if character/group data is available, false if timeout/cancelled
 */
async function waitForCharacterData(config = {}, legacyCheckIntervalMs = null) {
    // Handle legacy parameter format for backward compatibility
    let pollingConfig;
    if (typeof config === 'number') {
        pollingConfig = {
            maxWaitMs: config,
            initialIntervalMs: legacyCheckIntervalMs || 250,
            maxIntervalMs: 1000,
            backoffMultiplier: 1.2,
            useExponentialBackoff: false // Keep legacy behavior
        };
    } else {
        pollingConfig = {
            maxWaitMs: 5000,
            initialIntervalMs: 100,
            maxIntervalMs: 1000,
            backoffMultiplier: 1.5,
            useExponentialBackoff: true,
            ...config
        };
    }

    const { 
        maxWaitMs, 
        initialIntervalMs, 
        maxIntervalMs, 
        backoffMultiplier, 
        useExponentialBackoff,
        signal 
    } = pollingConfig;

    const startTime = Date.now();
    let currentInterval = initialIntervalMs;
    let attemptCount = 0;
    
    // Import context detection to check if we're in a group chat
    const { getCurrentMemoryBooksContext } = await import('./utils.js');
    const context = getCurrentMemoryBooksContext();
        
    while (Date.now() - startTime < maxWaitMs) {
        // Check for cancellation
        if (signal?.aborted) {
            return false;
        }

        let currentInterval = initialIntervalMs;
        
        // Import context detection to check if we're in a group chat        
        if (context.isGroupChat) {
            // Group chat - check if group data is available
            if (groups && context.groupId) {
                const group = groups.find(g => g.id === context.groupId);
                if (group) {
                    return true;
                }
            }
        } else {
            // Single character chat - use original logic
            if (characters && characters.length > this_chid && characters[this_chid]) {
                return true;
            }
        }
        
        // Wait before checking again with potential backoff
        await new Promise((resolve, reject) => {
            const timeoutId = setTimeout(resolve, currentInterval);
            
            // Handle cancellation during sleep
            if (signal) {
                const onAbort = () => {
                    clearTimeout(timeoutId);
                    reject(new Error('Cancelled'));
                };
                signal.addEventListener('abort', onAbort, { once: true });
            }
        }).catch(() => {
            // Cancellation during sleep
            return false;
        });

        // Apply exponential backoff if enabled
        if (useExponentialBackoff && currentInterval < maxIntervalMs) {
            currentInterval = Math.min(currentInterval * backoffMultiplier, maxIntervalMs);
        }
    }
    
    return false;
}

/**
 * Extracts JSON text from Claude's new structured response format
 * @private
 * @param {Object} aiResponse - Raw AI response that might be structured format
 * @returns {string|null} Extracted text content or null if not structured format
 */
function extractFromClaudeStructuredFormat(aiResponse) {
    try {
        // Check if response has the new Claude structured format
        if (typeof aiResponse === 'object' && aiResponse !== null && Array.isArray(aiResponse.content)) {
            // Look for text type block in content array
            const textBlock = aiResponse.content.find(block =>
                block && typeof block === 'object' && block.type === 'text' && block.text
            );

            if (textBlock && typeof textBlock.text === 'string') {
                return textBlock.text;
            }
        }

        return null;
    } catch (error) {
        return null;
    }
}

function likelyUnbalanced(raw) {
    try {
        let braces = 0, brackets = 0, inString = false, isEscaping = false;
        for (let i = 0; i < raw.length; i++) {
            const ch = raw[i];
            if (inString) {
                if (isEscaping) {
                    isEscaping = false;
                } else if (ch === '\\') {
                    isEscaping = true;
                } else if (ch === '"') {
                    inString = false;
                }
            } else {
                if (ch === '"') { inString = true; }
                else if (ch === '{') braces++;
                else if (ch === '}') braces--;
                else if (ch === '[') brackets++;
                else if (ch === ']') brackets--;
            }
            if (braces < 0 || brackets < 0) return true;
        }
        return inString || braces !== 0 || brackets !== 0;
    } catch {
        return false;
    }
}

function endsNicely(text) {
    const t = (text || '').trim();
    if (!t) return true;
    if (/[.!?]["'’\)\]]?$/.test(t)) return true;
    if (t.length >= 80 && !/[.!?]$/.test(t)) return false;
    return true;
}

// --- Minimal robust helpers for LLM JSON extraction/repair (local-only, low risk) ---

function normalizeText(s) {
    return String(s)
        .replace(/\r\n/g, '\n')
        .replace(/^\uFEFF/, '')
        .replace(/[\u0000-\u001F\u200B-\u200D\u2060]/g, '');
}

function extractFencedBlocks(s) {
    // Matches ```lang\n ... \n``` (lang optional)
    const re = /```([\w-]*)\s*([\s\S]*?)```/g;
    const out = [];
    let m;
    while ((m = re.exec(s)) !== null) {
        out.push((m[2] || '').trim());
    }
    return out;
}

function extractBalancedJson(s) {
    // Find first '{' or '[' and return balanced substring (ignores braces inside strings)
    const start = s.search(/[\{\[]/);
    if (start === -1) return null;
    const open = s[start];
    const close = open === '{' ? '}' : ']';
    let depth = 0, inStr = false, esc = false;
    for (let i = start; i < s.length; i++) {
        const ch = s[i];
        if (inStr) {
            if (esc) { esc = false; }
            else if (ch === '\\') { esc = true; }
            else if (ch === '"') { inStr = false; }
            continue;
        }
        if (ch === '"') { inStr = true; continue; }
        if (ch === open) depth++;
        else if (ch === close) {
            depth--;
            if (depth === 0) {
                return s.slice(start, i + 1).trim();
            }
        }
    }
    return null; // unbalanced
}

function hasAnyJsonDelimiter(s) {
    return /[\{\[]/.test(s);
}

function uniqStrings(arr) {
    const seen = new Set(); const out = [];
    for (const x of arr) { if (!seen.has(x)) { seen.add(x); out.push(x); } }
    return out;
}

function snippet(s, max = 500) {
    const t = (s || '').trim();
    return t.length <= max ? t : t.slice(0, max) + '…';
}

// Structured error helper with classification and minimal logging
function makeAIError(code, message, recoverable = true) {
    const err = new AIResponseError(message);
    err.code = code;
    err.recoverable = recoverable; // recoverable = fixable locally without re-asking
    try {
        console.debug(`STMemoryBooks: AIResponseError code=${code} recoverable=${recoverable}: ${message}`);
    } catch {}
    return err;
}

/**
 * Parses AI response as JSON with robust error handling
 * @private
 * @param {string} aiResponse - Raw AI response text
 * @returns {Object} Parsed JSON object
 * @throws {AIResponseError} If JSON parsing fails
 */
export function parseAIJsonResponse(aiResponse) {
    let cleanResponse = aiResponse;

    // Apply user-selected incoming regex scripts (bypass engine gating)
    try {
        const useRegex = !!(extension_settings?.STMemoryBooks?.moduleSettings?.useRegex);
        const selectedKeys = extension_settings?.STMemoryBooks?.moduleSettings?.selectedRegexIncoming;
        if (useRegex && typeof cleanResponse === 'string' && Array.isArray(selectedKeys) && selectedKeys.length > 0) {
            cleanResponse = applySelectedRegex(cleanResponse, selectedKeys);
        }
    } catch (e) {
        console.warn('STMemoryBooks: incoming regex application failed', e);
    }

    // Check for new Claude structured format first
    if (typeof cleanResponse === 'object' && cleanResponse !== null && Array.isArray(cleanResponse.content)) {
        const extractedText = extractFromClaudeStructuredFormat(cleanResponse);
        if (extractedText) {
            cleanResponse = extractedText;
        } else {
            const err = makeAIError('EMPTY_OR_INVALID', 'AI response is empty or invalid', false);
            try { err.rawResponse = JSON.stringify(cleanResponse); } catch {}
            throw err;
        }
    }
    // If the response is an object with a .content property (but not array), use that.
    else if (typeof cleanResponse === 'object' && cleanResponse !== null && cleanResponse.content) {
        cleanResponse = cleanResponse.content;
    }

    // Google AI Studio / Gemini envelope unwrap
    if (typeof cleanResponse === 'object' && cleanResponse !== null) {
        try {
            const cand = cleanResponse?.candidates?.[0];
            const parts = cand?.content?.parts;
            if (Array.isArray(parts) && parts.length > 0) {
                const joined = parts
                    .map(p => (p && typeof p.text === 'string') ? p.text : '')
                    .join('');
                if (joined && joined.trim()) {
                    cleanResponse = joined;
                }
            }
        } catch (e) {
            // Non-fatal: fall through to existing logic
        }
    }

    if (!cleanResponse || typeof cleanResponse !== 'string') {
        const err = makeAIError('EMPTY_OR_INVALID', 'AI response is empty or invalid', false);
        try { err.rawResponse = typeof cleanResponse === 'string' ? cleanResponse : JSON.stringify(cleanResponse); } catch {}
        throw err;
    }

    cleanResponse = cleanResponse.trim();

    // Remove <think> tags and their content
    cleanResponse = cleanResponse.replace(/<think>[\s\S]*?<\/think>/gi, '');

    // Normalize and prepare candidates
    const normalized = normalizeText(cleanResponse);
    const candidates = [];

    // 1) Prefer fenced code blocks if present (handles ```json, ```jsonc, ```javascript, etc.)
    const fenced = extractFencedBlocks(normalized);
    if (fenced.length) candidates.push(...fenced);

    // 2) Consider entire normalized text (in case it's pure JSON already)
    candidates.push(normalized);

    // 3) Balanced JSON substring from the whole string
    const balanced = extractBalancedJson(normalized);
    if (balanced) candidates.push(balanced);

    const uniq = uniqStrings(candidates);

    const validateParsed = (obj) => {
        if (!obj || typeof obj !== 'object') {
            return makeAIError('EMPTY_OR_INVALID', 'AI response is empty or invalid', false);
        }
        if (!obj.content && !obj.summary && !obj.memory_content) {
            return makeAIError('MISSING_FIELDS_CONTENT', 'AI response missing content field', false);
        }
        if (!obj.title) {
            return makeAIError('MISSING_FIELDS_TITLE', 'AI response missing title field', false);
        }
        if (!Array.isArray(obj.keywords)) {
            return makeAIError('INVALID_KEYWORDS', 'AI response missing or invalid keywords array.', false);
        }
        return null;
    };

    // Attempt parse with light repair when needed
    let lastFieldError = null;
    for (const cand of uniq) {
        // Direct parse
        try {
            const parsedDirect = JSON.parse(cand);
            const fieldErr = validateParsed(parsedDirect);
            if (fieldErr) {
                lastFieldError = fieldErr;
            } else {
                return parsedDirect;
            }
        } catch {
            // ignore and try repair parse below
        }

        // Repair parse (dirty-json)
        try {
            const parsedRepaired = dirtyJson.parse(cand);
            const fieldErr = validateParsed(parsedRepaired);
            if (fieldErr) {
                lastFieldError = fieldErr;
            } else {
                return parsedRepaired;
            }
        } catch {
            // continue trying other candidates
        }
    }

    // Classify failure
    if (!hasAnyJsonDelimiter(normalized)) {
        const err = makeAIError('NO_JSON_BLOCK', 'AI response did not contain a JSON block. The model may have returned prose or declined the request.', true);
        err.rawResponse = normalized;
        throw err;
    }
    if (likelyUnbalanced(normalized)) {
        const err = makeAIError('UNBALANCED', 'AI response appears truncated or invalid JSON (unbalanced structures). Try increasing Max Response Length.', false);
        err.rawResponse = normalized;
        throw err;
    }

    // Heuristic: ends mid-sentence suggests truncation
    const textCandidate = normalized.trim();
    if (textCandidate && textCandidate.length >= 80 && !endsNicely(textCandidate)) {
        const err = makeAIError('INCOMPLETE_SENTENCE', 'AI response JSON appears incomplete (text ends mid-sentence). Try increasing Max Response Length.', false);
        err.rawResponse = normalized;
        throw err;
    }

    // If we parsed something but it was missing required fields, surface that error
    if (lastFieldError) {
        lastFieldError.rawResponse = normalized;
        throw lastFieldError;
    }

    // Fallback
    {
        const err = makeAIError('MALFORMED', 'AI did not return valid JSON. This may indicate the model does not support structured output well or the response contained unsupported formatting.', false);
        err.rawResponse = normalized;
        throw err;
    }
}

// Build a memory object from a corrected raw response using the existing parser
 export function generateMemoryFromRaw(correctedRaw, profile) {
    const jsonResult = parseAIJsonResponse(correctedRaw);
    return {
        content: jsonResult.content || jsonResult.summary || jsonResult.memory_content || '',
        title: jsonResult.title || 'Memory',
        keywords: Array.isArray(jsonResult.keywords) ? jsonResult.keywords : [],
        profile
    };
}

// Submit corrected raw, return a memory-like object for insertion
export async function submitCorrectedRaw(correctedRaw, profile) {
    // Reuse parsing  memory construction logic
    const memory = generateMemoryFromRaw(correctedRaw, profile);
    // In a real app, you might submit to backend or trigger an insertion event.
    // Here we return the memory object so the caller/UI can insert/use it accordingly.
    return memory;
}

function shouldUseStructuredOutput(profile, apiType) {
    return !profile?.skipStructuredOutput && apiType !== 'full-manual';
}

function shouldFallbackFromStructuredOutput(error) {
    if (isStmbStopError(error) || error instanceof AIResponseError) {
        return false;
    }

    const combinedText = [
        error?.message,
        error?.providerBody,
        error?.rawResponse,
    ].map(value => String(value || '')).join('\n').toLowerCase();

    return combinedText.includes('response_format')
        || combinedText.includes('json_schema')
        || combinedText.includes('json_object')
        || combinedText.includes('structured output');
}

function assertProviderDidNotTruncate(providerResponse, rawText) {
    const finishReason = providerResponse?.choices?.[0]?.finish_reason || providerResponse?.finish_reason || providerResponse?.stop_reason;
    const fr = typeof finishReason === 'string' ? finishReason.toLowerCase() : '';
    if (fr.includes('length') || fr.includes('max')) {
        const err = makeAIError('PROVIDER_TRUNCATION', 'Model response appears truncated (provider finish_reason). Please increase Max Response Length.', false);
        try { err.rawResponse = rawText || ''; } catch {}
        try { err.providerResponse = providerResponse || null; } catch {}
        throw err;
    }
    if (providerResponse?.truncated === true) {
        const err = makeAIError('PROVIDER_TRUNCATION_FLAG', 'Model response appears truncated (provider flag). Please increase Max Response Length.', false);
        try { err.rawResponse = rawText || ''; } catch {}
        try { err.providerResponse = providerResponse || null; } catch {}
        throw err;
    }
}

/**
 * Generates memory using AI with structured JSON output instead of tool calling.
 * @private
 * @param {string} promptString - The full prompt for the AI
 * @param {Object} profile - The user-selected profile containing connection settings
 * @returns {Promise<Object>} The structured memory result from JSON parsing
 * @throws {AIResponseError} If the AI generation fails or doesn't return valid JSON
 */
async function generateMemoryWithAI(promptString, profile, options = {}) {
    const signal = options?.signal || null;
    const characterDataReady = await waitForCharacterData({ signal });
    if (!characterDataReady) {
        if (signal?.aborted) {
            throw new StmbCancelledError();
        }
        throw new AIResponseError(
            'Character data is not available. This may indicate that SillyTavern is still loading. Please wait a moment and try again.'
        );
    }

    const conn = profile?.effectiveConnection || profile?.connection || {};

    try {
        // Prepare connection info
        // Note: ST base uses 'makersuite' as the canonical provider key for this source.
        const apiType = normalizeCompletionSource(conn.api || getCurrentApiInfo().api);
        const extra = {};
        const stmbMaxTokensRaw = extension_settings?.STMemoryBooks?.moduleSettings?.maxTokens;
        const stmbMaxTokens = Number.parseInt(stmbMaxTokensRaw, 10);
        if (Number.isFinite(stmbMaxTokens) && stmbMaxTokens > 0) {
            extra.max_tokens = stmbMaxTokens;
        } else if (oai_settings.openai_max_tokens) {
            extra.max_tokens = oai_settings.openai_max_tokens;
        }

        const useStructuredOutput = shouldUseStructuredOutput(profile, apiType);
        const requestOptions = {
            model: conn.model,
            prompt: promptString,
            temperature: conn.temperature,
            api: apiType,
            endpoint: conn.endpoint,
            apiKey: conn.apiKey,
            extra: extra,
            reverseProxy: !!conn.reverseProxy,
            signal,
            jsonSchema: useStructuredOutput ? MEMORY_RESPONSE_JSON_SCHEMA : null,
            useChatCompletionService: profile?.useChatCompletionService === true && apiType !== 'full-manual',
            chatCompletionPreset: profile?.chatCompletionPreset || '',
        };

        let aiResponse;
        try {
            aiResponse = await sendRawCompletionRequest(requestOptions);
        } catch (error) {
            if (!useStructuredOutput || !shouldFallbackFromStructuredOutput(error)) {
                throw error;
            }

            console.warn(`${MODULE_NAME}: Structured-output request failed; retrying as plain-text completion.`, error);
            aiResponse = await sendRawCompletionRequest({
                ...requestOptions,
                jsonSchema: null,
            });
        }

        const aiResponseText = aiResponse.text;
        const aiFull = aiResponse.full;
        assertProviderDidNotTruncate(aiFull, aiResponseText);

        const jsonResult = parseAIJsonResponse(aiResponseText);

        return {
            content: jsonResult.content || jsonResult.summary || jsonResult.memory_content || '',
            title: jsonResult.title || 'Memory',
            keywords: jsonResult.keywords || [],
            profile: profile
        };
    } catch (error) {
        if (isStmbStopError(error)) throw error;
        if (error instanceof AIResponseError) throw error;
        const e = new AIResponseError(`Memory generation failed: ${error.message || error}`);
        try {
            if (typeof error?.providerBody === 'string') {
                e.providerBody = error.providerBody;
            }
            if (typeof error?.rawResponse === 'string') {
                e.rawResponse = error.rawResponse;
            }
        } catch {}
        throw e;
    }
}

/**
 * Creates a memory from a compiled scene using AI with structured JSON output.
 * This is the main entry point for this module.
 *
 * @param {Object} compiledScene - Scene data from chatcompile.js
 * @param {Object} profile - The user-selected memory generation profile from settings
 * @param {Object} options - Additional generation options
 * @param {number} options.tokenWarningThreshold - Token threshold for warnings (default: 30000)
 * @returns {Promise<Object>} The generated memory result, ready for lorebook insertion
 * @throws {TokenWarningError} If the estimated token count exceeds the warning threshold
 * @throws {InvalidProfileError} If the provided profile is incomplete
 * @throws {AIResponseError} If the AI fails to generate a valid response
 * @throws {Error} For other general failures
 */
export async function createMemory(compiledScene, profile, options = {}) {
    
    try {
        validateInputs(compiledScene, profile);
        const promptString = await buildPrompt(compiledScene, profile);
        const tokenEstimate = await estimateTokenUsage(promptString);        
        const tokenWarningThreshold = options.tokenWarningThreshold ?? 30000;
        if (tokenEstimate.total > tokenWarningThreshold) {
            throw new TokenWarningError(
                'Token warning threshold exceeded.',
                tokenEstimate.total
            );
        }
        
        const response = await generateMemoryWithAI(promptString, profile, { signal: options?.signal || null });
        const processedMemory = processJsonResult(response, compiledScene);

        const memoryResult = {
            content: processedMemory.content,
            extractedTitle: processedMemory.extractedTitle,
            metadata: {
                sceneRange: `${compiledScene.metadata.sceneStart}-${compiledScene.metadata.sceneEnd}`,
                messageCount: compiledScene.metadata.messageCount,
                characterName: compiledScene.metadata.characterName,
                userName: compiledScene.metadata.userName,
                chatId: compiledScene.metadata.chatId,
                characterFilterNames: Array.isArray(compiledScene.metadata.characterFilterNames)
                    ? [...compiledScene.metadata.characterFilterNames]
                    : undefined,
                createdAt: new Date().toISOString(),
                profileUsed: profile.name,
                presetUsed: profile.preset || 'custom',
                tokenUsage: tokenEstimate,
                generationMethod: 'json-structured-output',
                version: '2.0'
            },
            suggestedKeys: processedMemory.suggestedKeys,
            titleFormat: profile.titleFormat || '[000] - {{title}}',
            lorebookSettings: {
                constVectMode: profile.constVectMode,
                position: profile.position,
                orderMode: profile.orderMode,
                orderValue: profile.orderValue,
                reverseStart: Number.isFinite(profile.reverseStart) ? profile.reverseStart : 9999,
                preventRecursion: profile.preventRecursion,
                delayUntilRecursion: profile.delayUntilRecursion,
                outletName: (Number(profile.position) === 7 ? (profile.outletName || '') : undefined),
            },
            lorebook: {
                content: processedMemory.content,
                comment: `Auto-generated memory from messages ${compiledScene.metadata.sceneStart}-${compiledScene.metadata.sceneEnd}. Profile: ${profile.name}.`,
                key: processedMemory.suggestedKeys || [],
                keysecondary: [],
                selective: true,
                constant: false,
                order: 100,
                position: 'before_char',
                disable: false,
                addMemo: true,
                excludeRecursion: false,
                delayUntilRecursion: true,
                probability: 100,
                useProbability: false
            }
        };
        
        return memoryResult;
        
    } catch (error) {
        if (isStmbStopError(error)) {
            throw error;
        }
        if (error instanceof TokenWarningError || error instanceof AIResponseError || error instanceof InvalidProfileError) {
            throw error;
        }
        throw new Error(`Memory creation failed: ${error.message}`);
    }
}

/**
 * Validates the essential inputs for the memory creation process.
 * @private
 * @param {Object} compiledScene - The compiled scene data.
 * @param {Object} profile - The user-selected profile.
 * @throws {Error} If the scene is invalid.
 * @throws {InvalidProfileError} If the profile is invalid.
 */
function validateInputs(compiledScene, profile) {
    // Clear and readable check for empty scene
    if (!compiledScene || !Array.isArray(compiledScene.messages) || compiledScene.messages.length === 0) {
        throw new Error('Invalid or empty compiled scene data provided.');
    }

    // profile must have a non-empty prompt, preset key, or resolved group-specific prompt.
    const hasPrompt = typeof profile?.prompt === 'string' && profile.prompt.trim().length > 0;
    const hasPreset = typeof profile?.preset === 'string' && profile.preset.trim().length > 0;
    const promptTarget = String(compiledScene?.metadata?.stmbPromptTarget || profile?.stmbPromptTarget || '').trim().toLowerCase();
    const hasGroupPrompt =
        (typeof profile?.groupPrompt === 'string' && profile.groupPrompt.trim().length > 0)
        || (typeof profile?.groupPreset === 'string' && profile.groupPreset.trim().length > 0);
    const hasCharacterPrompt =
        (typeof profile?.characterPrompt === 'string' && profile.characterPrompt.trim().length > 0)
        || (typeof profile?.characterPreset === 'string' && profile.characterPreset.trim().length > 0);
    const hasGroupSpecificPrompt = Boolean(profile?.useGroupSpecificPrompts) && (
        promptTarget === 'group'
            ? hasGroupPrompt
            : promptTarget === 'character' || promptTarget === 'char'
                ? hasCharacterPrompt
                : hasGroupPrompt || hasCharacterPrompt
    );

    if (!hasPrompt && !hasPreset && !hasGroupSpecificPrompt) {
        throw new InvalidProfileError('Invalid profile configuration. You must set either a custom prompt or a valid preset.');
    }
}

async function resolveAdditionalContextEntries(profile, compiledScene = null) {
    if (Array.isArray(compiledScene?.additionalContextEntries)) {
        return { entries: compiledScene.additionalContextEntries, skipped: [], source: 'snapshot' };
    }

    const markers = getSceneMarkers() || {};
    const hasContextSettingKey = Object.hasOwn(markers, 'contextSettingKey');
    if (hasContextSettingKey) {
        const contextSettingKey = String(markers.contextSettingKey || '').trim();
        if (contextSettingKey === CONTEXT_NONE_KEY || !contextSettingKey) {
            return { entries: [], skipped: [], source: 'none' };
        }

        const setting = await getContextSetting(contextSettingKey);
        if (!setting) {
            console.warn(`${MODULE_NAME}: Selected context setting was not found: ${contextSettingKey}`);
            try {
                toastr.warning(
                    translate('Selected context setting was not found. Continuing without Additional Context.', 'STMemoryBooks_ContextSettings_MissingSelectedWarning'),
                    'STMemoryBooks',
                    { preventDuplicates: true },
                );
            } catch {}
            return { entries: [], skipped: [], source: 'missing' };
        }

        const resolved = await resolveContextSettingEntries(setting);
        if (resolved.skipped?.length > 0) {
            console.warn(`${MODULE_NAME}: Skipped ${resolved.skipped.length} stale context setting entr${resolved.skipped.length === 1 ? 'y' : 'ies'}`, resolved.skipped);
            try {
                toastr.warning(
                    translate('Some additional context entries could not be loaded and were skipped.', 'STMemoryBooks_Profile_AlsoIncludeSkipped'),
                    'STMemoryBooks',
                    { preventDuplicates: true },
                );
            } catch {}
        }
        return { ...resolved, source: 'context-setting' };
    }

    const refs = normalizeAdditionalContextEntries(profile?.additionalContextEntries);
    if (refs.length === 0 || profile?.isBuiltinCurrentST) {
        return { entries: [], skipped: [], source: 'none' };
    }

    try {
        toastr.warning(
            translate('Using legacy profile Additional Context for this run. It will be migrated to Context Settings when possible.', 'STMemoryBooks_ContextSettings_LegacyProfileWarning'),
            'STMemoryBooks',
            { preventDuplicates: true },
        );
    } catch {}
    const resolved = await resolveContextSettingEntriesFromRefs(refs);
    if (resolved.skipped?.length > 0) {
        console.warn(`${MODULE_NAME}: Skipped ${resolved.skipped.length} stale legacy additional context entr${resolved.skipped.length === 1 ? 'y' : 'ies'}`, resolved.skipped);
        try {
            toastr.warning(
                translate('Some additional context entries could not be loaded and were skipped.', 'STMemoryBooks_Profile_AlsoIncludeSkipped'),
                'STMemoryBooks',
                { preventDuplicates: true },
            );
        } catch {}
    }
    return { ...resolved, source: 'legacy-profile' };
}

export function appendAdditionalContextSection(sceneHeader, additionalContextEntries = []) {
    const usableEntries = additionalContextEntries.filter(entry => entry.content);
    if (usableEntries.length === 0) return;

    sceneHeader.push("=== ADDITIONAL CONTEXT FOR REFERENCE ===");
    usableEntries.forEach((entry, index) => {
        sceneHeader.push(`Reference ${index + 1} - ${entry.title}:`);
        sceneHeader.push(entry.content);
        sceneHeader.push("");
    });
    sceneHeader.push("=== END ADDITIONAL CONTEXT FOR REFERENCE ===");
    sceneHeader.push("");
}

/**
 * Formats the array of scene messages into a single text block for the AI.
 * @private
 * @param {Array<Object>} messages - The messages from the compiled scene.
 * @param {Object} metadata - The metadata from the compiled scene.
 * @param {Array<Object>} previousSummariesContext - Previous summaries for context (optional).
 * @param {Array<Object>} additionalContextEntries - Explicit profile-selected lorebook entries.
 * @returns {string} A formatted string representing the chat scene.
 */
function formatSceneForAI(messages, metadata, previousSummariesContext = [], additionalContextEntries = []) {
    const messageLines = messages.map(message => {
        const speaker = message.name || 'Unknown';
        const content = (message.mes || '').trim();
        return content ? `${speaker}: ${content}` : null;
    }).filter(Boolean); // Filter out any empty/null messages
        
    const sceneHeader = [
        ""
    ];
    
    appendAdditionalContextSection(sceneHeader, additionalContextEntries);

    // Add previous memories context if available
    if (previousSummariesContext && previousSummariesContext.length > 0) {
        sceneHeader.push("=== PREVIOUS SCENE CONTEXT (DO NOT PROCESS) ===");
        sceneHeader.push("These are previous memories for context only. Do NOT include them in your new memory:");
        sceneHeader.push("");
        
        previousSummariesContext.forEach((memory, index) => {
            sceneHeader.push(`Context ${index + 1} - ${memory.title}:`);
            sceneHeader.push(memory.content);
            if (memory.keywords && memory.keywords.length > 0) {
                sceneHeader.push(`Keywords: ${memory.keywords.join(', ')}`);
            }
            sceneHeader.push("");
        });
        
        sceneHeader.push("=== END PREVIOUS SCENE CONTEXT - PROCESS ONLY THE SCENE BELOW ===");
        sceneHeader.push("");
    }

    sceneHeader.push("=== SCENE TRANSCRIPT ===");
    sceneHeader.push(...messageLines);
    sceneHeader.push("");
    sceneHeader.push("=== END SCENE ===");
    
    return sceneHeader.join('\n');
}

/**
 * Estimates the token usage for the given prompt string.
 * @private
 * @param {string} promptString - The complete prompt to be sent to the AI.
 * @returns {Promise<{input: number, output: number, total: number}>} An object with token counts.
 */
async function estimateTokenUsage(promptString) {
    return await estimateTokens(promptString, { estimatedOutput: 300 });
}

/**
 * Build the complete prompt string for JSON output
 * @private
 * @param {Object} compiledScene - The compiled scene data.
 * @param {Object} profile - The user-selected profile.
 * @returns {Promise<string>} The fully formatted prompt string.
 */
async function buildPrompt(compiledScene, profile) {
    const { metadata, messages, previousSummariesContext } = compiledScene;

    // STMBC-HOOK: prompt assembly — inject living-entry context, delta-not-rehash
    // instructions, and error-control rules (per plan §4.4). Phase 1 lands the
    // empty call site; Phase 4 (living-lorebook orchestration) wires it up.
    const livingContext = await globalThis.STMBC?.buildPromptContext?.({
        compiledScene, profile, metadata, messages, previousSummariesContext,
    }).catch?.(() => null) ?? null;

    // Use utils.js to get the effective prompt (now designed for JSON output)
    const promptProfile = {
        ...(profile || {}),
        stmbPromptTarget: metadata?.stmbPromptTarget || profile?.stmbPromptTarget || '',
    };
    const systemPrompt = await getEffectivePrompt(promptProfile);
    
    // Use substituteParams to allow for standard macros like {{char}} and {{user}}
    const groupName = metadata.groupName || metadata.characterName || '';
    const processedSystemPrompt = substituteParams(systemPrompt, metadata.userName, metadata.characterName)
        .replace(/\{\{\s*group\s*\}\}/gi, () => groupName);
    
    // Build scene text for user prompt
    const additionalContext = await resolveAdditionalContextEntries(profile, compiledScene);
    const sceneText = formatSceneForAI(messages, metadata, previousSummariesContext, additionalContext.entries);
    
    // Combine system prompt and scene
    const finalPrompt = `${processedSystemPrompt}\n\n${sceneText}`;

    // Apply user-selected outgoing regex scripts (bypass engine gating)
    try {
        const useRegex = !!(extension_settings?.STMemoryBooks?.moduleSettings?.useRegex);
        const selectedKeys = extension_settings?.STMemoryBooks?.moduleSettings?.selectedRegexOutgoing;
        if (useRegex && Array.isArray(selectedKeys) && selectedKeys.length > 0) {
            return applySelectedRegex(finalPrompt, selectedKeys);
        }
    } catch (e) {
        console.warn('STMemoryBooks: outgoing regex application failed', e);
    }
    return finalPrompt;
}

/**
 * Process the structured result from JSON parsing
 * @private
 * @param {Object} jsonResult - The structured result from JSON parsing
 * @param {Object} compiledScene - The original compiled scene for context
 * @returns {Object} Processed memory data
 */
function processJsonResult(jsonResult, compiledScene) {
    const { content, title, keywords } = jsonResult;
    
    // Clean and validate content
    const cleanContent = (content || jsonResult.summary || jsonResult.memory_content || '').trim();
    const cleanTitle = (title || 'Memory').trim();
    const cleanKeywords = Array.isArray(keywords) ? 
        keywords.filter(k => k && typeof k === 'string' && k.trim() !== '').map(k => k.trim()) : [];
    
    return {
        content: cleanContent,
        extractedTitle: cleanTitle,
        suggestedKeys: cleanKeywords
    };
}
