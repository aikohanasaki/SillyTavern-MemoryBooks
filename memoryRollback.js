// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

export const ROLLBACK_SCOPE_FULL = 'full';
export const ROLLBACK_SCOPE_AFFECTED = 'affected';

const SIDE_PROMPT_SNAPSHOT_KEY = 'STMB_sidePromptRegeneration';

function getEntryUid(entry, entryKey = '') {
    const value = entry?.uid ?? entryKey;
    return value === undefined || value === null ? '' : String(value);
}

function getEntryTier(entry) {
    if (!entry || typeof entry !== 'object') return 0;
    if (entry.stmbSummary === true) {
        const value = Number(entry.stmbSummaryTier);
        return Number.isFinite(value) && value > 0 ? Math.trunc(value) : 1;
    }
    if (entry.stmbArc === true) return 1;
    const legacy = String(entry.type || '').trim().toLowerCase();
    return ['arc', 'chapter', 'book', 'legend', 'series', 'epic'].indexOf(legacy) + 1;
}

export function isRollbackBaseMemory(entry) {
    return !!entry && entry.stmemorybooks === true && getEntryTier(entry) === 0;
}

export function getRollbackEntryRange(entry) {
    const rawStart = entry?.STMB_start;
    const rawEnd = entry?.STMB_end;
    if (rawStart === null || rawStart === undefined || rawStart === ''
        || rawEnd === null || rawEnd === undefined || rawEnd === '') return null;
    const start = Number(rawStart);
    const end = Number(rawEnd);
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start) {
        return null;
    }
    return { start, end };
}

function rangesIntersect(left, right) {
    return left.start <= right.end && right.start <= left.end;
}

function clone(value) {
    return structuredClone(value);
}

function stableValue(value) {
    if (Array.isArray(value)) return value.map(stableValue);
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(
        Object.keys(value).sort().map(key => [key, stableValue(value[key])]),
    );
}

export function fingerprintRollbackEntry(entry, { excludeSidePromptSnapshot = false } = {}) {
    if (!entry || typeof entry !== 'object') return '';
    const copy = clone(entry);
    if (excludeSidePromptSnapshot) delete copy[SIDE_PROMPT_SNAPSHOT_KEY];
    return JSON.stringify(stableValue(copy));
}

/**
 * Keep an identity snapshot of the active chat so MESSAGE_DELETED can be decoded.
 * SillyTavern currently emits the resulting chat length, not the actual deleted ID.
 */
export function createMessageDeletionTracker() {
    const objectIds = new WeakMap();
    const snapshots = new Map();
    let nextObjectId = 1;

    const identifyObject = message => {
        if (message && typeof message === 'object') {
            if (!objectIds.has(message)) objectIds.set(message, `object:${nextObjectId++}`);
            return objectIds.get(message);
        }
        return `primitive:${typeof message}:${String(message)}`;
    };
    const identifyStable = message => {
        if (!message || typeof message !== 'object') return `primitive:${typeof message}:${String(message)}`;
        return JSON.stringify([
            message.send_date ?? null,
            message.name ?? null,
            message.is_user ?? null,
            message.is_system ?? null,
            message.original_avatar ?? null,
            message.mes ?? null,
        ]);
    };
    const capture = messages => Array.from(messages || [], message => ({
        objectId: identifyObject(message),
        stableId: identifyStable(message),
    }));
    const findDeletion = (before, after, field) => {
        const removedCount = before.length - after.length;
        let start = 0;
        while (start < after.length && before[start][field] === after[start][field]) start++;
        for (let index = start; index < after.length; index++) {
            if (before[index + removedCount][field] !== after[index][field]) return null;
        }
        return start;
    };

    return {
        snapshot(chatKey, messages) {
            const key = String(chatKey || '').trim();
            if (!key) return;
            snapshots.set(key, capture(messages));
        },
        clear(chatKey = null) {
            const key = String(chatKey || '').trim();
            if (key) snapshots.delete(key);
            else snapshots.clear();
        },
        detect(chatKey, messages) {
            const key = String(chatKey || '').trim();
            if (!key) return null;
            const before = snapshots.get(key);
            const after = capture(messages);
            snapshots.set(key, after);
            if (!before || before.length <= after.length) return null;

            const removedCount = before.length - after.length;
            const start = findDeletion(before, after, 'objectId')
                ?? findDeletion(before, after, 'stableId');
            if (start === null) return null;

            return {
                start,
                end: start + removedCount - 1,
                count: removedCount,
                previousLength: before.length,
                currentLength: after.length,
                isTail: start + removedCount === before.length,
            };
        },
    };
}

export function collectRollbackMemories(lorebookData, { chatId, deletion, scope }) {
    const selected = [];
    const ambiguous = [];
    const exactChatId = String(chatId || '').trim();
    const deletionRange = { start: deletion.start, end: deletion.end };

    for (const [entryKey, entry] of Object.entries(lorebookData?.entries || {})) {
        if (!isRollbackBaseMemory(entry)) continue;
        const storedChatId = String(entry.STMB_chatId || '').trim();
        const range = getRollbackEntryRange(entry);
        if (!range) {
            if (storedChatId === exactChatId) {
                ambiguous.push({
                    entryKey,
                    uid: getEntryUid(entry, entryKey),
                    entry,
                    range: { start: '?', end: '?' },
                    reason: 'invalid-range',
                });
            }
            continue;
        }
        const isCandidate = scope === ROLLBACK_SCOPE_FULL
            ? range.end >= deletion.start
            : rangesIntersect(range, deletionRange);
        if (!isCandidate) continue;
        if (!storedChatId) {
            ambiguous.push({ entryKey, uid: getEntryUid(entry, entryKey), entry, range });
            continue;
        }
        if (storedChatId !== exactChatId) continue;
        selected.push({ entryKey, uid: getEntryUid(entry, entryKey), entry, range });
    }

    selected.sort((left, right) => right.range.end - left.range.end || right.range.start - left.range.start);
    return { selected, ambiguous };
}

export function validateAndExpandLinkedRollbackSelections(states, selectionsByBook, chatId) {
    const exactChatId = String(chatId || '').trim();
    const records = [];
    for (const state of states || []) {
        for (const [entryKey, entry] of Object.entries(state?.data?.entries || {})) {
            if (!entry?.STMB_canonicalLorebook && !entry?.STMB_canonicalEntryUid && !entry?.STMB_inclusionGroup) continue;
            records.push({
                state,
                entryKey,
                entry,
                uid: getEntryUid(entry, entryKey),
                range: getRollbackEntryRange(entry),
            });
        }
    }

    const issues = [];
    const selectedRecords = records.filter(record =>
        selectionsByBook.get(String(record.state?.name || ''))?.has(record.uid));
    for (const record of selectedRecords) {
        const canonicalBook = String(record.entry.STMB_canonicalLorebook || '').trim();
        const canonicalUid = String(record.entry.STMB_canonicalEntryUid ?? '').trim();
        const inclusionGroup = String(record.entry.STMB_inclusionGroup || '').trim();
        const linked = records.filter(candidate => {
            if (canonicalBook && canonicalUid) {
                return String(candidate.entry.STMB_canonicalLorebook || '').trim() === canonicalBook
                    && String(candidate.entry.STMB_canonicalEntryUid ?? candidate.entry.uid ?? candidate.entryKey).trim() === canonicalUid;
            }
            return inclusionGroup && String(candidate.entry.STMB_inclusionGroup || '').trim() === inclusionGroup;
        });
        const canonical = records.find(candidate =>
            candidate.state.name === canonicalBook && candidate.uid === canonicalUid);
        if (canonicalBook && canonicalUid && !canonical) {
            issues.push(`Missing canonical entry ${canonicalUid} in ${canonicalBook}`);
            continue;
        }
        const linkedUnit = Array.from(new Set([...linked, ...(canonical ? [canonical] : [])]));
        for (const candidate of linkedUnit) {
            const candidateChatId = String(candidate.entry.STMB_chatId || '').trim();
            if (!candidateChatId || candidateChatId !== exactChatId || !candidate.range || !record.range
                || candidate.range.start !== record.range.start || candidate.range.end !== record.range.end) {
                issues.push(`Incomplete linked entry ${candidate.uid} in ${candidate.state.name}`);
                continue;
            }
            if (!selectionsByBook.has(candidate.state.name)) selectionsByBook.set(candidate.state.name, new Set());
            selectionsByBook.get(candidate.state.name).add(candidate.uid);
        }
    }
    return issues;
}

export function collectConsolidationRollbackPlan(lorebookData, selectedMemoryUids) {
    const entries = Object.entries(lorebookData?.entries || {});
    const byUid = new Map(entries.map(([key, entry]) => [getEntryUid(entry, key), { key, entry }]));
    const backlinks = new Map();
    const parentsBySource = new Map();
    const addParent = (sourceUid, parentUid) => {
        if (!sourceUid || !parentUid) return;
        if (!parentsBySource.has(sourceUid)) parentsBySource.set(sourceUid, new Set());
        parentsBySource.get(sourceUid).add(parentUid);
    };

    for (const [key, entry] of entries) {
        const uid = getEntryUid(entry, key);
        const parentUid = String(entry?.disabledBySummaryId ?? '').trim();
        if (parentUid) {
            if (!backlinks.has(parentUid)) backlinks.set(parentUid, new Set());
            backlinks.get(parentUid).add(uid);
            addParent(uid, parentUid);
        }
        if (getEntryTier(entry) <= 0) continue;
        for (const sourceUid of Array.isArray(entry.stmbSourceEntryUids) ? entry.stmbSourceEntryUids : []) {
            addParent(String(sourceUid), uid);
        }
    }

    const parentUids = new Set();
    const queue = Array.from(selectedMemoryUids || [], String);
    for (let index = 0; index < queue.length; index++) {
        const sourceUid = queue[index];
        for (const parentUid of parentsBySource.get(sourceUid) || []) {
            if (parentUids.has(parentUid)) continue;
            parentUids.add(parentUid);
            queue.push(parentUid);
        }
    }

    const issues = [];
    const parents = [];
    for (const parentUid of parentUids) {
        const record = byUid.get(parentUid);
        if (!record || getEntryTier(record.entry) <= 0) {
            issues.push({ reason: 'missing-parent', uid: parentUid });
            continue;
        }
        const explicit = Array.isArray(record.entry.stmbSourceEntryUids)
            ? Array.from(new Set(record.entry.stmbSourceEntryUids.map(String).filter(Boolean)))
            : [];
        const sourceUids = Array.from(new Set([
            ...explicit,
            ...(backlinks.get(parentUid) || []),
        ]));
        if (sourceUids.length === 0) {
            issues.push({ reason: 'missing-sources', uid: parentUid, title: String(record.entry.comment || '') });
            continue;
        }
        const missingSources = sourceUids.filter(uid => !byUid.has(uid));
        if (missingSources.length > 0) {
            issues.push({ reason: 'missing-source-entries', uid: parentUid, missingSources });
        }
        parents.push({
            uid: parentUid,
            key: record.key,
            entry: record.entry,
            tier: getEntryTier(record.entry),
            sourceUids,
        });
    }
    parents.sort((left, right) => right.tier - left.tier || left.uid.localeCompare(right.uid));
    return { parents, parentUids, issues, byUid };
}

function deleteEntryByUid(lorebookData, uid) {
    const wanted = String(uid);
    for (const [key, entry] of Object.entries(lorebookData?.entries || {})) {
        if (getEntryUid(entry, key) === wanted) {
            delete lorebookData.entries[key];
            return true;
        }
    }
    return false;
}

function shiftNumericField(entry, field, deletion) {
    const value = Number(entry?.[field]);
    if (!Number.isInteger(value) || value <= deletion.end) return false;
    entry[field] = value - deletion.count;
    return true;
}

export function reindexEntryAfterMiddleDeletion(entry, deletion, chatId = '') {
    let changed = false;
    const exactChatId = String(chatId || '').trim();
    const entryChatId = String(entry?.STMB_chatId || '').trim();
    const range = getRollbackEntryRange(entry);
    if (isRollbackBaseMemory(entry) && entryChatId === exactChatId && range?.start > deletion.end) {
        entry.STMB_start -= deletion.count;
        entry.STMB_end -= deletion.count;
        changed = true;
    }

    const snapshot = entry?.[SIDE_PROMPT_SNAPSHOT_KEY];
    const isMatchingSidePrompt = snapshot && typeof snapshot === 'object'
        && String(snapshot.chatId || '').trim() === exactChatId;
    if (isMatchingSidePrompt && snapshot.sceneStart > deletion.end) {
        snapshot.sceneStart -= deletion.count;
        snapshot.sceneEnd -= deletion.count;
        changed = true;
    }

    for (const field of isMatchingSidePrompt ? Object.keys(entry || {}) : []) {
        if (/^STMB_sp_.+_(?:lastMsgId)$/.test(field) || field === 'STMB_tracker_lastMsgId' || field === 'STMB_score_lastMsgId') {
            changed = shiftNumericField(entry, field, deletion) || changed;
        }
    }
    return changed;
}

export function applyLorebookRollback(lorebookData, {
    selectedMemoryUids,
    consolidationPlan,
    deletion,
    chatId,
    reindexLaterEntries = false,
}) {
    const selected = new Set(Array.from(selectedMemoryUids || [], String));
    const removedParents = consolidationPlan?.parentUids || new Set();
    let changed = false;

    for (const parent of consolidationPlan?.parents || []) {
        for (const sourceUid of parent.sourceUids) {
            const source = consolidationPlan.byUid.get(String(sourceUid))?.entry;
            if (!source || String(source.disabledBySummaryId ?? '') !== String(parent.uid)) continue;
            source.disable = false;
            delete source.disabledBySummaryId;
            changed = true;
        }
    }
    for (const parentUid of removedParents) changed = deleteEntryByUid(lorebookData, parentUid) || changed;
    for (const memoryUid of selected) changed = deleteEntryByUid(lorebookData, memoryUid) || changed;

    if (reindexLaterEntries) {
        for (const entry of Object.values(lorebookData?.entries || {})) {
            changed = reindexEntryAfterMiddleDeletion(entry, deletion, chatId) || changed;
        }
    }
    return changed;
}

export function computeRollbackCheckpoint(lorebookStates, chatId, excludedUidsByLorebook = new Map()) {
    const exactChatId = String(chatId || '').trim();
    let checkpoint = null;
    for (const state of lorebookStates || []) {
        const excluded = excludedUidsByLorebook.get(String(state?.name || '')) || new Set();
        for (const [entryKey, entry] of Object.entries(state?.data?.entries || {})) {
            if (!isRollbackBaseMemory(entry) || String(entry.STMB_chatId || '').trim() !== exactChatId) continue;
            if (excluded.has(getEntryUid(entry, entryKey))) continue;
            const range = getRollbackEntryRange(entry);
            if (!range) continue;
            checkpoint = checkpoint === null ? range.end : Math.max(checkpoint, range.end);
        }
    }
    return checkpoint;
}

export function planSidePromptRestorations(lorebookData, { chatId, rollbackRanges }) {
    const exactChatId = String(chatId || '').trim();
    const ranges = Array.from(rollbackRanges || []);
    const restorable = [];
    const legacy = [];

    for (const [entryKey, entry] of Object.entries(lorebookData?.entries || {})) {
        const snapshot = entry?.[SIDE_PROMPT_SNAPSHOT_KEY];
        if (!snapshot || typeof snapshot !== 'object') continue;
        if (String(snapshot.chatId || '').trim() !== exactChatId) continue;
        const range = { start: Number(snapshot.sceneStart), end: Number(snapshot.sceneEnd) };
        if (!Number.isInteger(range.start) || !Number.isInteger(range.end)) continue;
        if (!ranges.some(candidate => rangesIntersect(range, candidate))) continue;
        const item = { entryKey, uid: getEntryUid(entry, entryKey), entry, snapshot, range };
        if (snapshot.version === 2) restorable.push(item);
        else legacy.push(item);
    }
    return { restorable, legacy };
}

export function applySidePromptRestoration(lorebookData, item) {
    const current = lorebookData?.entries?.[item.entryKey];
    if (!current) return { changed: false, reason: 'missing-entry' };
    const snapshot = current[SIDE_PROMPT_SNAPSHOT_KEY];
    if (!snapshot || snapshot.version !== 2) return { changed: false, reason: 'invalid-snapshot' };
    if (fingerprintRollbackEntry(current, { excludeSidePromptSnapshot: true }) !== snapshot.writtenFingerprint) {
        return { changed: false, reason: 'entry-changed' };
    }
    if (snapshot.priorEntryExisted !== true) {
        delete lorebookData.entries[item.entryKey];
        return { changed: true, deleted: true };
    }
    const priorState = clone(snapshot.priorEntryState || {});
    delete priorState[SIDE_PROMPT_SNAPSHOT_KEY];
    const uid = current.uid;
    lorebookData.entries[item.entryKey] = { ...priorState, uid };
    return { changed: true, deleted: false };
}
