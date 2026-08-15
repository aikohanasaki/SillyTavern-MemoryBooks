// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * Preserve a failed ChatCompletionService attempt on the error from STMB's
 * fallback request and make the first failure visible in ordinary error UIs.
 *
 * @param {unknown} fallbackError
 * @param {unknown} serviceError
 * @returns {Error}
 */
export function attachChatCompletionServiceError(fallbackError, serviceError) {
    const target = fallbackError instanceof Error
        ? fallbackError
        : new Error(String(fallbackError || 'Unknown fallback request error'));
    const serviceMessage = String(serviceError?.message || serviceError || '').trim();
    if (!serviceMessage) {
        return target;
    }

    target.chatCompletionServiceError = serviceMessage;
    const explanation = `ChatCompletionService first failed: ${serviceMessage}`;
    if (!target.message.includes(explanation)) {
        const separator = /[.!?]\s*$/.test(target.message) ? ' ' : '. ';
        target.message = `${target.message}${separator}${explanation}`;
    }
    return target;
}
