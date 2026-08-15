// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

const OPENROUTER_ROUTING_FIELDS = Object.freeze({
    use_fallback: 'openrouter_use_fallback',
    provider: 'openrouter_providers',
    quantizations: 'openrouter_quantizations',
    allow_fallbacks: 'openrouter_allow_fallbacks',
    middleout: 'openrouter_middleout',
});

/**
 * Add SillyTavern's OpenRouter routing controls to a direct
 * ChatCompletionService payload while preserving explicit request overrides.
 *
 * @param {object} body Chat completion request payload
 * @param {object} settings SillyTavern oai_settings
 * @returns {object}
 */
export function applyOpenRouterRoutingSettings(body, settings) {
    if (!body || body.chat_completion_source !== 'openrouter') {
        return body;
    }

    const routing = {};
    for (const [requestField, settingsField] of Object.entries(OPENROUTER_ROUTING_FIELDS)) {
        const value = settings?.[settingsField];
        if (value !== undefined) {
            routing[requestField] = Array.isArray(value) ? [...value] : value;
        }
    }

    return { ...routing, ...body };
}
