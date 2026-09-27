// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

/** Resolve the active ST connection before shaping provider-specific fields. */
export function getSelectedConnectionProfile(context, translate = (_key, fallback) => fallback) {
    const profileId = context?.extensionSettings?.connectionManager?.selectedProfile;
    const service = context?.ConnectionManagerRequestService;
    if (!profileId) return null;
    if (typeof service?.sendRequest !== 'function') {
        throw new Error(translate('STMemoryBooks_ConnectionManagerUnavailable', 'SillyTavern connection profile requests are unavailable. Update SillyTavern or deselect the connection profile.'));
    }

    const profile = service.getProfile(profileId);
    const mapping = service.validateProfile(profile);
    if (mapping.selected !== 'openai' || !mapping.source) {
        throw new Error(translate('STMemoryBooks_ConnectionProfileRequiresChatCompletion', 'The selected SillyTavern connection profile must use Chat Completion.'));
    }
    return { service, profileId, profile, source: mapping.source };
}

/** Preserve connection routing and preset while overriding STMB generation fields. */
export function prepareConnectionProfileRequest(connection, body, signal) {
    if (!connection) return null;
    const { service, profileId } = connection;
    const overrides = {
        model: body.model,
        temperature: body.temperature,
    };
    // Keep STMB's token limit and structured-output choice authoritative over
    // the connection preset, including the absence of a JSON schema.
    for (const field of ['max_tokens', 'max_completion_tokens', 'max_output_tokens', 'max_new_tokens', 'json_schema']) {
        overrides[field] = body[field];
    }
    return () => service.sendRequest(
        profileId,
        body.messages,
        body.max_tokens,
        { stream: body.stream, signal, extractData: false, includePreset: true },
        overrides,
    );
}
