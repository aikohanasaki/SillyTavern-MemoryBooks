// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

export const MANUAL_GROUP_MEMORY_ROLE_KEY = 'STMB_memoryRole';

export function getManualGroupMemoryRole(entry) {
    const explicitRole = String(entry?.[MANUAL_GROUP_MEMORY_ROLE_KEY] || '').trim();
    if (explicitRole === 'group' || explicitRole === 'character') return explicitRole;
    if (entry?.STMB_canonical === true) return 'group';
    if (entry?.STMB_canonical === false) return 'character';
    return '';
}

function getMemberFilterNames(members) {
    return new Set(
        (Array.isArray(members) ? members : [])
            .map(member => String(member?.characterFilterName || '').trim())
            .filter(Boolean),
    );
}

function matchesCharacterMembers(entry, members) {
    const memberNames = getMemberFilterNames(members);
    if (memberNames.size === 0) return true;
    const entryNames = Array.isArray(entry?.characterFilter?.names)
        ? entry.characterFilter.names
        : [];
    return entryNames.some(name => memberNames.has(String(name || '').trim()));
}

/**
 * Separate group and character streams when both roles are stored in one lorebook.
 * Distinct lorebooks retain their historical behavior, including legacy entries
 * that predate explicit role metadata.
 */
export function filterManualGroupEntriesForRole(entries, {
    role,
    sameLorebook = false,
    members = [],
} = {}) {
    const source = Array.isArray(entries) ? entries : [];
    if (!sameLorebook) return [...source];

    if (role === 'character') {
        return source.filter(entry =>
            getManualGroupMemoryRole(entry) === 'character' &&
            matchesCharacterMembers(entry, members),
        );
    }

    if (role === 'group') {
        return source.filter(entry => getManualGroupMemoryRole(entry) !== 'character');
    }

    return [...source];
}

export function buildManualGroupRoleMetadata(role, { prioritizeCharacter = false } = {}) {
    const normalizedRole = role === 'character' ? 'character' : 'group';
    return {
        [MANUAL_GROUP_MEMORY_ROLE_KEY]: normalizedRole,
        ...(normalizedRole === 'character' && prioritizeCharacter
            ? { groupOverride: true }
            : {}),
    };
}

export function getManualGroupSpeakerLorebook(snapshot, speakingAvatar) {
    const avatar = String(speakingAvatar || '').trim();
    if (!avatar) return '';
    const member = (Array.isArray(snapshot?.members) ? snapshot.members : [])
        .find(candidate => candidate?.avatar === avatar || candidate?.key === avatar);
    return String(member ? snapshot?.bindings?.[member.key] : '').trim();
}

export function getEntrySourceCanonicalNumbers(entry, lorebookData, visited = new Set()) {
    if (!entry || typeof entry !== 'object') return [];
    const entryUid = String(entry.uid ?? '');
    if (entryUid && visited.has(entryUid)) return [];
    if (entryUid) visited.add(entryUid);

    const direct = Number(entry.STMB_canonicalMemoryNumber ?? entry.STMB_memoryNumber);
    if (Number.isFinite(direct) && direct > 0) return [Math.trunc(direct)];

    const sourceIds = Array.isArray(entry.stmbSourceEntryUids)
        ? entry.stmbSourceEntryUids.map(String).filter(Boolean)
        : [];
    if (sourceIds.length > 0) {
        const entriesByUid = new Map(
            Object.entries(lorebookData?.entries || {}).map(([entryKey, candidate]) => [
                String(candidate?.uid ?? entryKey),
                candidate,
            ]),
        );
        const sourceNumbers = sourceIds.flatMap(sourceId =>
            getEntrySourceCanonicalNumbers(entriesByUid.get(sourceId), lorebookData, visited),
        );
        if (sourceNumbers.length > 0) return Array.from(new Set(sourceNumbers));
    }

    const title = String(entry.comment || '');
    const titleNumber = title.match(/\[(\d+)\]/)?.[1] || title.match(/^(\d+)[\s-]/)?.[1];
    const fallback = Number(titleNumber);
    return Number.isFinite(fallback) && fallback > 0 ? [fallback] : [];
}
