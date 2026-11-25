// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

export const CHAT_PROFILE_KEY = 'memoryProfileKey';
export const CONSOLIDATION_PROFILE_KEY = 'consolidationProfileKey';

/** Resolve stable references without rewriting missing selections or global defaults. */
export function resolveProfileIndex(settings, markers = {}, { profileIndex, consolidation = false } = {}) {
    const profiles = settings?.profiles || [];
    const valid = index => Number.isInteger(index) && index >= 0 && index < profiles.length;
    if (valid(profileIndex)) return profileIndex;
    const keys = [
        consolidation ? settings?.moduleSettings?.[CONSOLIDATION_PROFILE_KEY] : null,
        markers?.[CHAT_PROFILE_KEY],
    ];
    for (const key of keys) {
        if (typeof key !== 'string' || !key.trim()) continue;
        const index = profiles.findIndex(profile => profile?.profileKey === key);
        if (index >= 0) return index;
    }
    return valid(settings?.defaultProfile) ? settings.defaultProfile : 0;
}

/** Selector values distinguish inheritance and missing references from profile index zero. */
export function getChatProfileSelection(settings, markers = {}) {
    const key = markers?.[CHAT_PROFILE_KEY];
    if (!key) return 'inherit';
    const index = (settings?.profiles || []).findIndex(profile => profile?.profileKey === key);
    return index >= 0 ? String(index) : 'missing';
}

export function setChatProfileSelection(settings, markers, value) {
    if (value === 'inherit') {
        delete markers[CHAT_PROFILE_KEY];
        return true;
    }
    if (!/^\d+$/.test(String(value))) return false;
    const key = settings?.profiles?.[Number(value)]?.profileKey;
    if (!key) return false;
    markers[CHAT_PROFILE_KEY] = key;
    return true;
}
