// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

const STLO_KEY = 'stlo';

function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function normalizePriority(value) {
    const priority = Number(value);
    return Number.isInteger(priority) && priority >= 1 && priority <= 5
        ? priority
        : 3;
}

function normalizeOrderAdjustment(value) {
    const adjustment = Number(value);
    return Number.isFinite(adjustment) && adjustment >= -10000 && adjustment <= 10000
        ? Math.trunc(adjustment)
        : 0;
}

function normalizeCharacterNames(value) {
    const names = [];
    const seen = new Set();
    for (const item of Array.isArray(value) ? value : []) {
        const name = String(item || '').trim();
        if (!name || seen.has(name)) continue;
        seen.add(name);
        names.push(name);
    }
    return names;
}

/**
 * Add STLO speaking filters to a lorebook without changing existing overrides.
 *
 * @param {Object} lorebookData
 * @param {string[]} characterNames Avatar basenames used by STLO.
 * @returns {{changed: boolean, addedNames: string[], characterNames: string[]}}
 */
export function applyStloCharacterFilters(lorebookData, characterNames) {
    if (!isRecord(lorebookData)) {
        throw new TypeError('Lorebook data must be an object.');
    }

    const names = normalizeCharacterNames(characterNames);
    const hasStlo = Object.prototype.hasOwnProperty.call(lorebookData, STLO_KEY);
    if (hasStlo && !isRecord(lorebookData[STLO_KEY])) {
        throw new TypeError('Lorebook STLO metadata must be an object.');
    }

    const stlo = hasStlo ? lorebookData[STLO_KEY] : {};
    const hasOverrides = Object.prototype.hasOwnProperty.call(stlo, 'characterOverrides');
    if (hasOverrides && !isRecord(stlo.characterOverrides)) {
        throw new TypeError('STLO characterOverrides metadata must be an object.');
    }

    if (names.length === 0) {
        return { changed: false, addedNames: [], characterNames: names };
    }

    if (!hasStlo) {
        lorebookData[STLO_KEY] = stlo;
    }
    if (!hasOverrides) {
        stlo.characterOverrides = {};
    }

    const defaultPriority = normalizePriority(stlo.priority);
    const defaultOrderAdjustment = normalizeOrderAdjustment(stlo.orderAdjustment);
    const addedNames = [];
    for (const name of names) {
        if (Object.prototype.hasOwnProperty.call(stlo.characterOverrides, name)) {
            continue;
        }
        Object.defineProperty(stlo.characterOverrides, name, {
            value: {
                priority: defaultPriority,
                orderAdjustment: defaultOrderAdjustment,
            },
            enumerable: true,
            configurable: true,
            writable: true,
        });
        addedNames.push(name);
    }

    const enabledSpeakingFilter = stlo.onlyWhenSpeaking !== true;
    if (enabledSpeakingFilter) {
        stlo.onlyWhenSpeaking = true;
    }

    return {
        changed: addedNames.length > 0 || enabledSpeakingFilter,
        addedNames,
        characterNames: names,
    };
}

/**
 * Group manual character bindings by lorebook for efficient STLO updates.
 * Canonical group lorebooks are reported as conflicts and never returned as targets.
 *
 * @param {Array<Object>} members
 * @param {Object} bindings
 * @param {{canonicalLorebookName?: string}} options
 * @returns {{targets: Array<{lorebookName: string, characterNames: string[], members: Object[]}>, conflicts: Object[]}}
 */
export function collectStloCharacterFilterTargets(members, bindings, options = {}) {
    const canonicalLorebookName = String(options.canonicalLorebookName || '').trim();
    const safeBindings = isRecord(bindings) ? bindings : {};
    const targetsByLorebook = new Map();
    const conflicts = [];

    for (const member of Array.isArray(members) ? members : []) {
        const memberKey = String(member?.key || '').trim();
        const characterName = String(member?.characterFilterName || '').trim();
        if (!memberKey || !characterName) continue;

        const lorebookName = String(safeBindings[memberKey] || '').trim();
        if (!lorebookName) continue;
        if (canonicalLorebookName && lorebookName === canonicalLorebookName) {
            conflicts.push({ member, lorebookName });
            continue;
        }

        let target = targetsByLorebook.get(lorebookName);
        if (!target) {
            target = { lorebookName, characterNames: [], members: [] };
            targetsByLorebook.set(lorebookName, target);
        }
        if (!target.characterNames.includes(characterName)) {
            target.characterNames.push(characterName);
            target.members.push(member);
        }
    }

    return { targets: Array.from(targetsByLorebook.values()), conflicts };
}
