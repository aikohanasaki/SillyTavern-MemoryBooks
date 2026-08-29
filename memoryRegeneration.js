// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import { CONSOLIDATION_REGENERATION_PRESET_KEY } from './constants.js';

export const SIDE_PROMPT_REGENERATION_METADATA_KEY = 'STMB_sidePromptRegeneration';
export const SIDE_PROMPT_REGENERATION_SNAPSHOT_VERSION = 2;
export const LEGACY_SIDE_PROMPT_REGENERATION_SNAPSHOT_VERSION = 1;

const CONSOLIDATION_TYPE_TIERS = Object.freeze({
    arc: 1,
    chapter: 2,
    book: 3,
    legend: 4,
    series: 5,
    epic: 6,
});

export function getEntryUid(entry) {
    const uid = entry?.uid;
    return uid === undefined || uid === null ? null : String(uid);
}

/**
 * Capture the compact inputs needed to rebuild one side-prompt run.
 */
export function buildSidePromptRegenerationSnapshot({
    templateKey,
    priorContent = '',
    priorEntry = null,
    writtenEntry = null,
    compiledScene,
    runtimeMacros = {},
} = {}) {
    const metadata = compiledScene?.metadata || {};
    const normalizedRuntimeMacros = Object.fromEntries(
        Object.entries(runtimeMacros || {}).map(([key, value]) => [String(key), String(value ?? '')]),
    );
    const priorEntryState = priorEntry && typeof priorEntry === 'object'
        ? structuredClone(priorEntry)
        : null;
    if (priorEntryState) delete priorEntryState[SIDE_PROMPT_REGENERATION_METADATA_KEY];
    const writtenState = writtenEntry && typeof writtenEntry === 'object'
        ? structuredClone(writtenEntry)
        : null;
    if (writtenState) {
        delete writtenState[SIDE_PROMPT_REGENERATION_METADATA_KEY];
    }
    return {
        version: SIDE_PROMPT_REGENERATION_SNAPSHOT_VERSION,
        templateKey: String(templateKey || '').trim(),
        priorContent: String(priorContent || ''),
        priorEntryExisted: !!priorEntryState,
        priorEntryState,
        writtenFingerprint: writtenState ? fingerprintRegenerationValue(writtenState) : '',
        sceneStart: Number(metadata.sceneStart),
        sceneEnd: Number(metadata.sceneEnd),
        chatId: String(metadata.chatId || ''),
        runtimeMacros: structuredClone(normalizedRuntimeMacros),
    };
}

/**
 * Return a valid persisted side-prompt run snapshot, or null.
 */
export function getSidePromptRegenerationSnapshot(entry) {
    const snapshot = entry?.[SIDE_PROMPT_REGENERATION_METADATA_KEY];
    if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) return null;
    if (![LEGACY_SIDE_PROMPT_REGENERATION_SNAPSHOT_VERSION, SIDE_PROMPT_REGENERATION_SNAPSHOT_VERSION].includes(snapshot.version)) return null;
    if (typeof snapshot.templateKey !== 'string' || !snapshot.templateKey.trim()) return null;
    if (typeof snapshot.priorContent !== 'string') return null;
    if (!Number.isInteger(snapshot.sceneStart) || snapshot.sceneStart < 0) return null;
    if (!Number.isInteger(snapshot.sceneEnd) || snapshot.sceneEnd < snapshot.sceneStart) return null;
    if (typeof snapshot.chatId !== 'string' || !snapshot.chatId.trim()) return null;
    if (!snapshot.runtimeMacros || typeof snapshot.runtimeMacros !== 'object' || Array.isArray(snapshot.runtimeMacros)) return null;
    if (Object.values(snapshot.runtimeMacros).some(value => typeof value !== 'string')) return null;
    if (snapshot.version === SIDE_PROMPT_REGENERATION_SNAPSHOT_VERSION) {
        if (typeof snapshot.priorEntryExisted !== 'boolean') return null;
        if (snapshot.priorEntryExisted && (!snapshot.priorEntryState || typeof snapshot.priorEntryState !== 'object' || Array.isArray(snapshot.priorEntryState))) return null;
        if (!snapshot.priorEntryExisted && snapshot.priorEntryState !== null) return null;
        if (typeof snapshot.writtenFingerprint !== 'string' || !snapshot.writtenFingerprint) return null;
    }
    return snapshot;
}

export function buildRegenerationIndexes(lorebookData) {
    const entries = Object.values(lorebookData?.entries || {});
    const entriesByUid = new Map();
    const legacySourceUidsByParentUid = new Map();

    for (const entry of entries) {
        const entryUid = getEntryUid(entry);
        if (entryUid === null) continue;
        if (!entriesByUid.has(entryUid)) entriesByUid.set(entryUid, entry);

        const parentUid = String(entry?.disabledBySummaryId ?? '');
        if (!legacySourceUidsByParentUid.has(parentUid)) {
            legacySourceUidsByParentUid.set(parentUid, new Set());
        }
        legacySourceUidsByParentUid.get(parentUid).add(entryUid);
    }

    const parentConsolidationsBySourceUid = new Map();
    const addParent = (sourceUid, parent) => {
        if (!parentConsolidationsBySourceUid.has(sourceUid)) {
            parentConsolidationsBySourceUid.set(sourceUid, new Set());
        }
        parentConsolidationsBySourceUid.get(sourceUid).add(parent);
    };

    for (const candidate of entries) {
        if (getEntryTier(candidate) <= 0) continue;
        const candidateUid = getEntryUid(candidate);
        if (candidateUid === null) continue;

        if (Array.isArray(candidate.stmbSourceEntryUids)) {
            for (const sourceUid of candidate.stmbSourceEntryUids) {
                addParent(String(sourceUid), candidate);
            }
        }
        for (const sourceUid of legacySourceUidsByParentUid.get(candidateUid) || []) {
            addParent(sourceUid, candidate);
        }
    }

    return {
        entriesByUid,
        legacySourceUidsByParentUid: new Map(
            Array.from(legacySourceUidsByParentUid, ([uid, sourceUids]) => [uid, [...sourceUids]]),
        ),
        parentConsolidationsBySourceUid: new Map(
            Array.from(parentConsolidationsBySourceUid, ([uid, parents]) => [uid, [...parents]]),
        ),
    };
}

export function getEntryByUid(lorebookData, uid, indexes = null) {
    const wanted = uid === undefined || uid === null ? null : String(uid);
    if (wanted === null) return null;
    if (indexes?.entriesByUid instanceof Map) {
        return indexes.entriesByUid.get(wanted) || null;
    }
    return Object.values(lorebookData?.entries || {})
        .find(entry => getEntryUid(entry) === wanted) || null;
}

export function getEntryTier(entry) {
    if (!entry || typeof entry !== 'object') return 0;
    if (entry.stmbSummary === true) {
        const tier = Number(entry.stmbSummaryTier);
        return Number.isFinite(tier) && tier > 0 ? Math.trunc(tier) : 1;
    }
    if (entry.stmbArc === true) return 1;
    return CONSOLIDATION_TYPE_TIERS[String(entry.type || '').trim().toLowerCase()] || 0;
}

export function isBaseMemoryEntry(entry) {
    return !!entry && entry.stmemorybooks === true && getEntryTier(entry) === 0;
}

export function extractEntrySequenceNumber(entry) {
    const directValue = entry?.STMB_canonicalMemoryNumber ?? entry?.STMB_memoryNumber;
    const direct = Number(directValue);
    if (directValue !== undefined && directValue !== null && directValue !== '' &&
        Number.isFinite(direct) && direct >= 0) {
        return Math.trunc(direct);
    }

    const title = String(entry?.comment || '');
    const nested = title.match(/\[[^\]]*?\[(\d+)\][^\]]*?\]/);
    if (nested) return Number(nested[1]);
    const bracket = title.match(/\[[^\]]*?(\d+)[^\]]*?\]/);
    if (bracket) return Number(bracket[1]);
    const parenthesis = title.match(/\((\d+)\)/);
    if (parenthesis) return Number(parenthesis[1]);
    const brace = title.match(/\{(\d+)\}/);
    if (brace) return Number(brace[1]);
    const hash = title.match(/#(?:\[)?(\d+)(?:\])?/);
    if (hash) return Number(hash[1]);
    const leading = title.match(/^(\d+)(?:\s|[-–—])/);
    if (leading) return Number(leading[1]);
    return null;
}

export function applyFixedSequenceNumber(titleFormat, sequenceNumber) {
    const format = String(titleFormat || '');
    const number = Math.max(0, Math.trunc(Number(sequenceNumber) || 0));
    const replacements = [
        {
            pattern: /\[\[(0+)\]\]/g,
            replace: digits => `[${String(number).padStart(digits.length, '0')}]`,
        },
        {
            pattern: /\(\[(0+)\]\)/g,
            replace: digits => `(${String(number).padStart(digits.length, '0')})`,
        },
        {
            pattern: /\{\[(0+)\]\}/g,
            replace: digits => `{${String(number).padStart(digits.length, '0')}}`,
        },
        {
            pattern: /#\[(0+)\]/g,
            replace: digits => `#${String(number).padStart(digits.length, '0')}`,
        },
        {
            pattern: /\[(0+)\]/g,
            replace: digits => String(number).padStart(digits.length, '0'),
        },
        {
            pattern: /\((0+)\)/g,
            replace: digits => `(${String(number).padStart(digits.length, '0')})`,
        },
        {
            pattern: /\{(0+)\}/g,
            replace: digits => `{${String(number).padStart(digits.length, '0')}}`,
        },
        {
            pattern: /#(0+)/g,
            replace: digits => `#${String(number).padStart(digits.length, '0')}`,
        },
    ];

    for (const { pattern, replace } of replacements) {
        if (pattern.test(format)) {
            pattern.lastIndex = 0;
            return format.replace(pattern, (_match, digits) => replace(digits));
        }
    }
    return format;
}

export function hasSequenceNumberPlaceholder(titleFormat) {
    return /\[\[0+\]\]|\(\[0+\]\)|\{\[0+\]\}|#\[0+\]|\[0+\]|\(0+\)|\{0+\}|#0+/.test(
        String(titleFormat || ''),
    );
}

export function getConsolidationSourceUids(entry, lorebookData, indexes = null) {
    const explicit = Array.isArray(entry?.stmbSourceEntryUids)
        ? entry.stmbSourceEntryUids.map(String).filter(Boolean)
        : [];
    if (explicit.length > 0) {
        return { uids: Array.from(new Set(explicit)), source: 'stored' };
    }

    const targetUid = getEntryUid(entry);
    if (targetUid === null) return { uids: [], source: 'missing' };
    if (indexes?.legacySourceUidsByParentUid instanceof Map) {
        const legacy = indexes.legacySourceUidsByParentUid.get(targetUid) || [];
        return {
            uids: [...legacy],
            source: legacy.length > 0 ? 'legacy-backlinks' : 'missing',
        };
    }
    const legacy = Object.values(lorebookData?.entries || {})
        .filter(candidate => String(candidate?.disabledBySummaryId ?? '') === targetUid)
        .map(getEntryUid)
        .filter(uid => uid !== null);
    return {
        uids: Array.from(new Set(legacy)),
        source: legacy.length > 0 ? 'legacy-backlinks' : 'missing',
    };
}

export function findActiveParentConsolidations(entry, lorebookData, indexes = null) {
    const entryUid = getEntryUid(entry);
    if (entryUid === null) return [];
    if (indexes?.parentConsolidationsBySourceUid instanceof Map) {
        return [...(indexes.parentConsolidationsBySourceUid.get(entryUid) || [])];
    }
    const parents = [];
    for (const candidate of Object.values(lorebookData?.entries || {})) {
        if (getEntryTier(candidate) <= 0) continue;
        const candidateUid = getEntryUid(candidate);
        if (candidateUid === null) continue;
        const linked = Array.isArray(candidate.stmbSourceEntryUids)
            && candidate.stmbSourceEntryUids.some(uid => String(uid) === entryUid);
        const legacyLinked = String(entry?.disabledBySummaryId ?? '') === candidateUid;
        if (linked || legacyLinked) parents.push(candidate);
    }
    return parents;
}

export function getRegenerationEligibility(entry, lorebookData, indexes = null) {
    if (entry && Object.hasOwn(entry, SIDE_PROMPT_REGENERATION_METADATA_KEY)) {
        const snapshot = getSidePromptRegenerationSnapshot(entry);
        if (!snapshot) {
            return { eligible: false, reason: 'invalid-sideprompt-snapshot' };
        }
        return {
            eligible: true,
            kind: 'sidePrompt',
            sceneStart: snapshot.sceneStart,
            sceneEnd: snapshot.sceneEnd,
            templateKey: snapshot.templateKey,
            snapshot,
        };
    }
    if (!entry || entry.stmemorybooks !== true) {
        return { eligible: false, reason: 'not-memory' };
    }
    const sequenceNumber = extractEntrySequenceNumber(entry);
    if (!Number.isFinite(sequenceNumber) || sequenceNumber < 0) {
        return { eligible: false, reason: 'missing-number' };
    }
    const activeParents = findActiveParentConsolidations(entry, lorebookData, indexes);
    if (activeParents.length > 0) {
        return { eligible: false, reason: 'active-parent', activeParents, sequenceNumber };
    }

    const tier = getEntryTier(entry);
    if (tier > 0) {
        const sourceResult = getConsolidationSourceUids(entry, lorebookData, indexes);
        if (sourceResult.uids.length === 0) {
            return { eligible: false, reason: 'missing-sources', tier, sequenceNumber };
        }
        const sources = sourceResult.uids.map(uid => getEntryByUid(lorebookData, uid, indexes));
        if (sources.some(source => !source)) {
            return { eligible: false, reason: 'missing-sources', tier, sequenceNumber };
        }
        if (sources.some(source => getEntryTier(source) !== tier - 1)) {
            return { eligible: false, reason: 'wrong-source-tier', tier, sequenceNumber };
        }
        return {
            eligible: true,
            kind: 'consolidation',
            tier,
            sequenceNumber,
            sourceUids: sourceResult.uids,
            sourceResolution: sourceResult.source,
        };
    }

    const start = Number(entry.STMB_start);
    const end = Number(entry.STMB_end);
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start) {
        return { eligible: false, reason: 'missing-range', tier: 0, sequenceNumber };
    }
    return {
        eligible: true,
        kind: 'memory',
        tier: 0,
        sequenceNumber,
        sceneStart: start,
        sceneEnd: end,
    };
}

export function selectPreviousMemoryContext(lorebookData, targetUid, count) {
    const requested = Math.max(0, Math.trunc(Number(count) || 0));
    if (requested === 0) {
        return { summaries: [], actualCount: 0, requestedCount: 0 };
    }
    const target = getEntryByUid(lorebookData, targetUid);
    const targetNumber = extractEntrySequenceNumber(target);
    if (!target || !Number.isFinite(targetNumber)) {
        return { summaries: [], actualCount: 0, requestedCount: requested };
    }

    const preceding = Object.values(lorebookData?.entries || {})
        .filter(entry => isBaseMemoryEntry(entry) && getEntryUid(entry) !== getEntryUid(target))
        .map((entry, index) => ({ entry, index, number: extractEntrySequenceNumber(entry) }))
        .filter(item => Number.isFinite(item.number) && item.number < targetNumber)
        .sort((a, b) => a.number - b.number || a.index - b.index)
        .slice(-requested);
    return {
        summaries: preceding.map(({ entry, number }) => ({
            number,
            title: String(entry.comment || ''),
            content: String(entry.content || ''),
            keywords: Array.isArray(entry.key) ? [...entry.key] : [],
            uid: getEntryUid(entry),
        })),
        actualCount: preceding.length,
        requestedCount: requested,
    };
}

export function fingerprintRegenerationValue(value) {
    const normalize = value => {
        if (Array.isArray(value)) return value.map(normalize);
        if (!value || typeof value !== 'object') return value;
        return Object.fromEntries(
            Object.keys(value)
                .sort()
                .map(key => [key, normalize(value[key])]),
        );
    };
    return JSON.stringify(normalize(value));
}

export function fingerprintRegenerationEntry(entry) {
    if (!entry || typeof entry !== 'object') return '';
    return fingerprintRegenerationValue(entry);
}

export async function preflightRegenerationVisibility({
    messages,
    start,
    end,
    unhideBeforeMemory = false,
    executeUnhide = null,
} = {}) {
    if (
        !Array.isArray(messages) ||
        !Number.isInteger(start) ||
        !Number.isInteger(end) ||
        start < 0 ||
        end < start ||
        end >= messages.length
    ) {
        return { ok: false, reason: 'invalid-range', visibleCount: 0 };
    }
    if (unhideBeforeMemory) {
        try {
            if (typeof executeUnhide !== 'function') throw new Error('Missing unhide executor');
            await executeUnhide(start, end);
        } catch (error) {
            return { ok: false, reason: 'unhide-failed', visibleCount: 0, error };
        }
    }
    const visibleCount = messages
        .slice(start, end + 1)
        .filter(message => message && !message.is_system)
        .length;
    return visibleCount > 0
        ? { ok: true, reason: null, visibleCount }
        : { ok: false, reason: 'no-visible-messages', visibleCount: 0 };
}

export function focusRegenerationSetting(root, controlId, options = {}) {
    const control = root?.querySelector?.(`#${controlId}`);
    if (!control) return false;
    control.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
    control.focus?.({ preventScroll: true });
    const highlightTarget = control.closest?.('label') || control;
    highlightTarget.classList?.add?.('stmb-setting-focus-highlight');
    const removeDelay = Number.isFinite(Number(options.removeDelay))
        ? Number(options.removeDelay)
        : 4000;
    const schedule = typeof options.schedule === 'function' ? options.schedule : setTimeout;
    schedule(() => highlightTarget.classList?.remove?.('stmb-setting-focus-highlight'), removeDelay);
    return true;
}

export function buildConsolidationRegenerationOptions(sourceCount, tier) {
    return {
        presetKey: CONSOLIDATION_REGENERATION_PRESET_KEY,
        targetTier: Math.max(1, Math.trunc(Number(tier) || 1)),
        maxItemsPerPass: Math.max(1, Math.trunc(Number(sourceCount) || 0)),
        maxPasses: 1,
        minAssigned: 1,
        tokenTarget: Number.MAX_SAFE_INTEGER,
    };
}

export function normalizeConsolidationRegenerationResponse(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
    if (typeof value.title !== 'string' || !value.title.trim()) return null;
    if (typeof value.content !== 'string' || !value.content.trim()) return null;
    if (!Array.isArray(value.keywords)) return null;

    return {
        summaries: [{
            title: value.title.trim(),
            summary: value.content.trim(),
            keywords: value.keywords
                .filter(keyword => typeof keyword === 'string' && keyword.trim())
                .map(keyword => keyword.trim()),
        }],
        unassigned_items: [],
    };
}

export function hasLinkedManualGroupMetadata(entry) {
    return !!(
        entry?.STMB_inclusionGroup ||
        entry?.STMB_canonicalLorebook ||
        entry?.STMB_canonicalEntryUid !== undefined
    );
}

export function isCanonicalLinkedGroupMemory(entry, lorebookName) {
    if (!isBaseMemoryEntry(entry) || !hasLinkedManualGroupMetadata(entry)) return false;
    if (entry.STMB_canonical === true) return true;
    if (entry.STMB_canonical === false) return false;

    const canonicalLorebook = String(entry.STMB_canonicalLorebook || '').trim();
    return !!canonicalLorebook && canonicalLorebook === String(lorebookName || '').trim();
}

export function isLinkedManualGroupEntry(sourceEntry, candidateEntry, sourceLorebookName) {
    const inclusionGroup = String(sourceEntry?.STMB_inclusionGroup || '').trim();
    const canonicalUid = String(sourceEntry?.STMB_canonicalEntryUid ?? sourceEntry?.uid ?? '').trim();
    const canonicalLorebook = String(
        sourceEntry?.STMB_canonicalLorebook || sourceLorebookName || '',
    ).trim();
    const candidateCanonicalUid = String(candidateEntry?.STMB_canonicalEntryUid ?? '').trim();
    const candidateCanonicalLorebook = String(candidateEntry?.STMB_canonicalLorebook || '').trim();
    const hasCanonicalIdentity = !!canonicalUid && !!canonicalLorebook &&
        !!candidateCanonicalUid && !!candidateCanonicalLorebook;
    const sameCanonicalIdentity = hasCanonicalIdentity &&
        candidateCanonicalUid === canonicalUid &&
        candidateCanonicalLorebook === canonicalLorebook;

    if (
        inclusionGroup &&
        String(candidateEntry?.STMB_inclusionGroup || '').trim() === inclusionGroup
    ) {
        return hasCanonicalIdentity ? sameCanonicalIdentity : true;
    }
    return sameCanonicalIdentity;
}

export function clearStaleParentDisableState(entry, lorebookData) {
    const parentUid = entry?.disabledBySummaryId;
    if (parentUid === undefined || parentUid === null || getEntryByUid(lorebookData, parentUid)) {
        return false;
    }
    delete entry.disabledBySummaryId;
    entry.disable = false;
    return true;
}

export function applyRegenerationReplacement(entry, review, options = {}) {
    if (options.contentOnly === true) {
        entry.content = review.content;
        return entry;
    }
    entry.comment = review.formattedTitle;
    entry.content = review.content;
    entry.key = Array.isArray(review.keywords) ? [...review.keywords] : [];
    const sourceUids = Array.isArray(options.sourceUids)
        ? options.sourceUids.map(String)
        : [];
    if (sourceUids.length > 0) {
        entry.stmbSourceEntryUids = [...sourceUids];
    }
    clearStaleParentDisableState(entry, options.lorebookData);
    return entry;
}

export function isRegenerationSourceChatCurrent(
    entry,
    lorebookName,
    currentChatId,
    currentLorebookNames,
) {
    const storedChatId = entry?.STMB_chatId;
    if (
        storedChatId !== undefined &&
        storedChatId !== null &&
        storedChatId !== '' &&
        String(storedChatId) !== String(currentChatId || '')
    ) {
        return false;
    }
    return new Set(
        Array.from(currentLorebookNames || [])
            .map(name => String(name || '').trim())
            .filter(Boolean),
    ).has(String(lorebookName || '').trim());
}
