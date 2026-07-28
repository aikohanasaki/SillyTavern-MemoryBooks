// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * Return whether a SillyTavern Connection Manager profile targets the Custom
 * Chat Completion provider.
 *
 * @param {Object} profile
 * @param {Record<string, { selected?: string, source?: string }>} connectApiMap
 * @returns {boolean}
 */
export function isCustomConnectionProfile(profile, connectApiMap = {}) {
    if (!profile || typeof profile !== 'object') return false;
    const api = String(profile.api || '').trim();
    const mapping = connectApiMap?.[api];
    if (mapping) {
        return mapping.selected === 'openai' && mapping.source === 'custom';
    }
    return profile.mode === 'cc' && api === 'custom';
}

/**
 * List Custom Chat Completion profiles from SillyTavern Connection Manager.
 *
 * @param {Object[]} profiles
 * @param {Record<string, { selected?: string, source?: string }>} connectApiMap
 * @returns {Object[]}
 */
export function listCustomConnectionProfiles(profiles, connectApiMap = {}) {
    if (!Array.isArray(profiles)) return [];
    return profiles
        .filter(profile => isCustomConnectionProfile(profile, connectApiMap))
        .filter(profile => String(profile.id || '').trim())
        .sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
}

/**
 * Resolve the URL and secret reference for a selected Custom connection profile.
 * The raw secret is intentionally never exposed to STMB.
 *
 * @param {Object[]} profiles
 * @param {string} profileId
 * @param {Record<string, { selected?: string, source?: string }>} connectApiMap
 * @returns {{ id: string, name: string, model: string, customUrl: string, secretId?: string } | null}
 */
export function resolveCustomConnectionProfile(profiles, profileId, connectApiMap = {}) {
    const id = String(profileId || '').trim();
    if (!id) return null;

    const profile = listCustomConnectionProfiles(profiles, connectApiMap)
        .find(item => String(item.id) === id);
    if (!profile) return null;

    const customUrl = String(profile['api-url'] || '').trim().replace(/\/+$/, '');
    const secretId = String(profile['secret-id'] || '').trim();
    return {
        id,
        name: String(profile.name || id),
        model: String(profile.model || '').trim(),
        customUrl,
        ...(secretId ? { secretId } : {}),
    };
}
