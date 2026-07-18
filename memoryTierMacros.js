// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import { chat_metadata } from '../../../../script.js';
import { extension_settings } from '../../../extensions.js';
import { macros, MacroCategory, MacroValueType } from '../../../macros/macro-system.js';
import { METADATA_KEY, loadWorldInfo, world_names } from '../../../world-info.js';
import { getSceneMarkers } from './sceneManager.js';
import { getEntrySummaryTier, STMB_SUMMARY_TIERS } from './summaryTiers.js';
import { isClipEntryTitle } from './clipManager.js';
import { isSidePromptEntryTitle } from './sidePrompts.js';

const EMPTY_TIER_COUNTS = Object.freeze(
    Object.fromEntries(STMB_SUMMARY_TIERS.map(({ tier }) => [tier, 0])),
);

let tierCounts = { ...EMPTY_TIER_COUNTS };
let clipCount = 0;
let sidePromptCount = 0;
let refreshSequence = 0;

function getEffectiveLorebookNameNonInteractive() {
    const moduleSettings = extension_settings.STMemoryBooks?.moduleSettings;
    if (!moduleSettings?.manualModeEnabled) {
        return chat_metadata?.[METADATA_KEY] || null;
    }

    const manualLorebook = getSceneMarkers()?.manualLorebook || null;
    return manualLorebook && world_names.includes(manualLorebook)
        ? manualLorebook
        : null;
}

function countEntriesByTier(lorebookData) {
    const counts = { ...EMPTY_TIER_COUNTS };
    for (const entry of Object.values(lorebookData?.entries || {})) {
        if (entry?.stmemorybooks !== true) continue;
        const tier = getEntrySummaryTier(entry);
        if (Object.hasOwn(counts, tier)) counts[tier]++;
    }
    return counts;
}

function updateCounts(lorebookData) {
    const entries = Object.values(lorebookData?.entries || {});
    tierCounts = countEntriesByTier(lorebookData);
    clipCount = entries.filter((entry) => isClipEntryTitle(entry?.comment)).length;
    sidePromptCount = entries.filter((entry) => isSidePromptEntryTitle(entry?.comment)).length;
}

function clearCounts() {
    tierCounts = { ...EMPTY_TIER_COUNTS };
    clipCount = 0;
    sidePromptCount = 0;
}

export function updateMemoryTierMacroCache(lorebookName, lorebookData) {
    if (lorebookName !== getEffectiveLorebookNameNonInteractive()) return;
    refreshSequence++;
    updateCounts(lorebookData);
}

export async function refreshMemoryTierMacroCache() {
    const sequence = ++refreshSequence;
    const lorebookName = getEffectiveLorebookNameNonInteractive();
    clearCounts();
    if (!lorebookName) return;

    try {
        const lorebookData = await loadWorldInfo(lorebookName);
        if (sequence !== refreshSequence || lorebookName !== getEffectiveLorebookNameNonInteractive()) return;
        updateCounts(lorebookData);
    } catch (error) {
        if (sequence === refreshSequence) {
            console.warn(`STMemoryBooks: Failed to refresh memory tier macros for "${lorebookName}":`, error);
        }
    }
}

export function registerMemoryTierMacros() {
    for (const { tier, label } of STMB_SUMMARY_TIERS) {
        macros.registry.registerMacro(`memtier${tier}`, {
            category: MacroCategory.CHAT,
            description: `Number of STMemoryBooks ${label.toLowerCase()} entries in the effective Memory Book.`,
            returns: `The total number of tier ${tier} entries as an integer.`,
            returnType: MacroValueType.INTEGER,
            handler: () => String(tierCounts[tier] ?? 0),
        });
    }

    macros.registry.registerMacro('memclips', {
        category: MacroCategory.CHAT,
        description: 'Number of STMemoryBooks Clip entries in the effective Memory Book.',
        returns: 'The total number of Clip entries as an integer.',
        returnType: MacroValueType.INTEGER,
        handler: () => String(clipCount),
    });
    macros.registry.registerMacro('memside', {
        category: MacroCategory.CHAT,
        description: 'Number of STMemoryBooks Side Prompt entries in the effective Memory Book.',
        returns: 'The total number of Side Prompt entries as an integer.',
        returnType: MacroValueType.INTEGER,
        handler: () => String(sidePromptCount),
    });
}
