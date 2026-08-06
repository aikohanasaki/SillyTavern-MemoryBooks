// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalizeText(value) {
    return String(value || '').trim();
}

function setOwn(record, key, value) {
    Object.defineProperty(record, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true,
    });
}

export function normalizeCharacterMemoryBookLocks(value) {
    const normalized = {};
    let changed = !isRecord(value);

    for (const [rawKey, rawLock] of Object.entries(isRecord(value) ? value : {})) {
        const characterKey = normalizeText(rawKey);
        const characterName = normalizeText(rawLock?.characterName);
        const lorebookName = normalizeText(rawLock?.lorebookName);
        if (!characterKey || !isRecord(rawLock) || !characterName || !lorebookName) {
            changed = true;
            continue;
        }

        setOwn(normalized, characterKey, { characterName, lorebookName });
        if (
            characterKey !== rawKey ||
            rawLock.characterName !== characterName ||
            rawLock.lorebookName !== lorebookName ||
            Object.keys(rawLock).length !== 2
        ) {
            changed = true;
        }
    }

    return { locks: normalized, changed };
}

export function ensureCharacterMemoryBookLocks(settings) {
    if (!isRecord(settings)) {
        return { locks: {}, changed: false };
    }

    const result = normalizeCharacterMemoryBookLocks(settings.characterMemoryBookLocks);
    if (result.changed) {
        settings.characterMemoryBookLocks = result.locks;
    }
    return result;
}

export function getCharacterMemoryBookLock(locks, characterKey) {
    const key = normalizeText(characterKey);
    if (!key || !isRecord(locks)) return null;
    const lock = locks[key];
    if (!isRecord(lock)) return null;

    const characterName = normalizeText(lock.characterName);
    const lorebookName = normalizeText(lock.lorebookName);
    return characterName && lorebookName
        ? { characterKey: key, characterName, lorebookName }
        : null;
}

export function getCharacterMemoryBookLockStatus(locks, characterKey, worldNames = []) {
    const lock = getCharacterMemoryBookLock(locks, characterKey);
    if (!lock) return { state: 'unlocked', lock: null };
    return {
        state: Array.isArray(worldNames) && worldNames.includes(lock.lorebookName)
            ? 'locked'
            : 'broken',
        lock,
    };
}

export function setCharacterMemoryBookLock(locks, characterKey, characterName, lorebookName) {
    const key = normalizeText(characterKey);
    const name = normalizeText(characterName);
    const book = normalizeText(lorebookName);
    if (!isRecord(locks) || !key || !name || !book) return false;

    const current = getCharacterMemoryBookLock(locks, key);
    if (current?.characterName === name && current?.lorebookName === book) return false;
    setOwn(locks, key, { characterName: name, lorebookName: book });
    return true;
}

export function removeCharacterMemoryBookLock(locks, characterKey) {
    const key = normalizeText(characterKey);
    if (!key || !isRecord(locks) || !Object.hasOwn(locks, key)) return false;
    delete locks[key];
    return true;
}

export function moveCharacterMemoryBookLock(locks, oldCharacterKey, newCharacterKey, characterName = '') {
    const oldKey = normalizeText(oldCharacterKey);
    const newKey = normalizeText(newCharacterKey);
    const lock = getCharacterMemoryBookLock(locks, oldKey);
    if (!lock || !newKey) return false;

    delete locks[oldKey];
    setOwn(locks, newKey, {
        characterName: normalizeText(characterName) || lock.characterName,
        lorebookName: lock.lorebookName,
    });
    return true;
}

export function refreshCharacterMemoryBookLockName(locks, characterKey, characterName) {
    const key = normalizeText(characterKey);
    const name = normalizeText(characterName);
    const lock = getCharacterMemoryBookLock(locks, key);
    if (!lock || !name || lock.characterName === name) return false;
    setOwn(locks, key, { characterName: name, lorebookName: lock.lorebookName });
    return true;
}

export function resolveManualLorebookForCharacter({
    manualModeEnabled,
    isGroupChat,
    characterKey,
    manualLorebook,
    locks,
}) {
    const chatLorebookName = normalizeText(manualLorebook);
    if (!manualModeEnabled || isGroupChat) {
        return {
            lorebookName: chatLorebookName || null,
            source: chatLorebookName ? 'chat-manual' : 'none',
            lock: null,
        };
    }

    const lock = getCharacterMemoryBookLock(locks, characterKey);
    if (lock) {
        return { lorebookName: lock.lorebookName, source: 'character-lock', lock };
    }

    return {
        lorebookName: chatLorebookName || null,
        source: chatLorebookName ? 'chat-manual' : 'none',
        lock: null,
    };
}

export function resolveManualGroupCharacterBindings({
    manualModeEnabled,
    members,
    chatBindings,
    locks,
}) {
    const bindings = {};
    const locksByMemberKey = {};
    const safeBindings = isRecord(chatBindings) ? chatBindings : {};

    for (const member of Array.isArray(members) ? members : []) {
        const memberKey = normalizeText(member?.key);
        if (!memberKey) continue;

        const lock = manualModeEnabled
            ? getCharacterMemoryBookLock(locks, member?.avatar || memberKey)
            : null;
        const lorebookName = lock?.lorebookName || normalizeText(safeBindings[memberKey]);
        if (lorebookName) setOwn(bindings, memberKey, lorebookName);
        if (lock) setOwn(locksByMemberKey, memberKey, lock);
    }

    return { bindings, locksByMemberKey };
}
