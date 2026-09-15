// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import { fingerprintRegenerationValue } from './memoryRegeneration.js';

export const PENDING_PROGRESS_VERSION = 1;

export function progressSourceMessages(messages) {
    return Array.from(messages || [], message => ({
        name: message?.name ?? null,
        is_user: message?.is_user ?? null,
        send_date: message?.send_date ?? null,
        original_avatar: message?.original_avatar ?? null,
        mes: message?.mes ?? null,
    }));
}

export function progressFingerprint(messages, end, hash) {
    if (!Number.isInteger(end) || end < 0 || end >= messages.length) return null;
    return hash(fingerprintRegenerationValue(progressSourceMessages(messages.slice(0, end + 1))));
}

export function validatePendingProgress(record, current, hash) {
    if (!record || record.version !== PENDING_PROGRESS_VERSION || !record.origin
        || !Number.isInteger(record.end) || record.end < 0
        || !record.chatRef || !['character', 'group'].includes(record.chatRef.type)
        || (record.origin.highest !== null && !Number.isFinite(record.origin.highest))
        || typeof record.origin.manuallySet !== 'boolean'
        || typeof record.origin.fingerprint !== 'string' || !/^[a-f0-9]{64}$/.test(record.origin.fingerprint)) return 'invalid';
    if (!current || record.chatKey !== current.chatKey || !current.loaded) return 'chat';
    if (!record.origin.integrity || record.origin.integrity !== current.metadata?.integrity) return 'identity';
    const markers = current.metadata?.STMemoryBooks || {};
    if (record.invalidated || (record.origin.revision || '') !== (markers.progressRevision || '')) return 'marker';
    if (record.origin.fingerprint !== progressFingerprint(current.messages, record.end, hash)) return 'messages';
    const previous = record.origin.highest;
    const highest = Number.isFinite(markers.highestMemoryProcessed) ? markers.highestMemoryProcessed : null;
    if ((markers.highestMemoryProcessedManuallySet === true) !== record.origin.manuallySet
        && markers.highestMemoryProcessedManuallySet === true) return 'marker';
    if (previous !== null && (highest === null || highest < previous)) return 'marker';
    return null;
}

/** Dependencies keep storage and core chat saves independently testable. */
export function createPendingProgressController({ settings, current, hash, persist, readChat, saveCurrent, changed = () => {} }) {
    let storageTail = Promise.resolve();
    let applicationTail = Promise.resolve();
    let applying = false;
    const retiring = new Map();
    const serial = task => {
        const result = storageTail.catch(() => {}).then(task);
        storageTail = result.catch(() => {});
        return result;
    };
    function collection() {
        const root = settings();
        if (root.pendingProgress === undefined) {
            root.pendingProgress = { version: PENDING_PROGRESS_VERSION, records: {} };
        }
        return root.pendingProgress;
    }
    function supported() {
        const data = collection();
        return data?.version === PENDING_PROGRESS_VERSION && data.records
            && typeof data.records === 'object' && !Array.isArray(data.records);
    }
    function list() {
        if (!supported()) return [{ id: '__unsupported__', invalidated: true, unsupported: true }];
        const records = Object.entries(collection().records).map(([id, value]) => ({
            ...(value && typeof value === 'object' ? value : { invalidated: true }), id,
        }));
        for (const [id, record] of retiring) {
            if (!records.some(item => item.id === id)) records.push(record);
        }
        return records;
    }
    function has(chatKey) {
        return list().some(record => !record.chatKey || record.chatKey === chatKey);
    }
    async function confirm() {
        await persist(structuredClone(collection()));
    }
    async function remember(record) {
        return serial(async () => {
            if (!supported()) throw new Error('Unsupported pending progress data');
            // The operation ID belongs to a saved memory, including retries.
            collection().records[record.id] ??= structuredClone(record);
            changed();
            try {
                await confirm();
                return { status: record.invalidated ? 'conflict' : 'pending', id: record.id };
            } catch {
                return { status: 'persistence-error', id: record.id };
            }
        });
    }
    async function remove(ids) {
        return serial(async () => {
            const before = structuredClone(collection());
            for (const record of list()) {
                if (ids.includes(record.id)) retiring.set(record.id, record);
            }
            if (ids.includes('__unsupported__')) {
                settings().pendingProgress = { version: PENDING_PROGRESS_VERSION, records: {} };
            } else {
                for (const id of ids) delete collection().records[id];
            }
            try {
                await confirm();
                for (const id of ids) retiring.delete(id);
                changed();
            } catch (error) {
                // Retain the gate until removal is confirmed. Reapplication is idempotent.
                settings().pendingProgress = before;
                for (const id of ids) retiring.delete(id);
                changed();
                throw error;
            }
        });
    }
    function checkCurrent(records) {
        const live = current();
        for (const record of records) {
            const reason = validatePendingProgress(record, live, hash);
            if (reason) return { reason, live };
        }
        return { reason: live?.busy ? 'busy' : null, live };
    }
    async function verify(records) {
        const data = await readChat(records[0].chatRef);
        if (!Array.isArray(data) || data.length < 2 || !data[0]?.chat_metadata) throw new Error('Invalid saved chat');
        const saved = {
            chatKey: records[0].chatKey, loaded: true,
            metadata: data[0].chat_metadata, messages: data.slice(1),
        };
        for (const record of records) {
            if (validatePendingProgress(record, saved, hash)) {
                throw new Error('Progress save could not be verified');
            }
        }
        if (records.some(record => !Number.isFinite(saved.metadata.STMemoryBooks?.highestMemoryProcessed)
            || saved.metadata.STMemoryBooks.highestMemoryProcessed < record.end)) {
            const error = new Error('Progress marker has not been saved');
            error.code = 'marker';
            throw error;
        }
    }
    async function applyRecords(records, removeAfter) {
        if (!records.length) return { status: 'applied' };
        let check = checkCurrent(records);
        if (check.reason) return { status: check.reason === 'busy' ? 'pending' : 'conflict', reason: check.reason };
        const target = Math.max(...records.map(record => record.end));
        const markers = check.live.metadata.STMemoryBooks || {};
        const alreadyApplied = Number.isFinite(markers.highestMemoryProcessed) && markers.highestMemoryProcessed >= target;
        try {
            let verified = false;
            if (alreadyApplied) {
                try { await verify(records); verified = true; }
                catch (error) { if (error.code !== 'marker') throw error; }
            }
            if (!verified) {
                // No await between final identity check, mutation, and invoking core save.
                check = checkCurrent(records);
                if (check.reason) return { status: 'conflict', reason: check.reason };
                const latestMarkers = check.live.metadata.STMemoryBooks || {};
                check.live.metadata.STMemoryBooks = {
                    ...latestMarkers,
                    highestMemoryProcessed: Math.max(target, Number.isFinite(latestMarkers.highestMemoryProcessed) ? latestMarkers.highestMemoryProcessed : -1),
                };
                delete check.live.metadata.STMemoryBooks.highestMemoryProcessedManuallySet;
                await saveCurrent(check.live);
                await verify(records);
            }
            if (checkCurrent(records).reason) return { status: 'pending', reason: 'chat' };
        } catch {
            return { status: 'pending', reason: 'save' };
        }
        if (removeAfter) {
            try { await remove(records.map(record => record.id)); }
            catch { return { status: 'persistence-error', reason: 'cleanup' }; }
        }
        return { status: 'applied' };
    }
    function apply(ids) {
        const task = applicationTail.catch(() => {}).then(async () => {
            applying = true;
            try { return await applyRecords(list().filter(record => ids.includes(record.id)), true); }
            finally { applying = false; }
        });
        applicationTail = task.catch(() => {});
        return task;
    }
    async function update(record) {
        // Add first to memory to gate competing new requests during the immediate save.
        const canApply = await serial(async () => {
            if (!supported()) return false;
            const check = checkCurrent([record]);
            if (check.live?.loaded && check.live.chatKey === record.chatKey && check.reason && check.reason !== 'busy') {
                record.invalidated = true;
            }
            const immediate = !applying && !has(record.chatKey) && !check.reason;
            collection().records[record.id] ??= structuredClone(record);
            changed();
            return immediate;
        });
        if (!supported()) return { status: 'conflict', reason: 'invalid' };
        if (canApply) {
            const result = await apply([record.id]);
            if (result.status === 'applied') return result;
        }
        return remember(record);
    }
    async function invalidate(chatKey) {
        return serial(async () => {
            if (!supported()) return;
            for (const record of Object.values(collection().records)) {
                if (record?.chatKey === chatKey) record.invalidated = true;
            }
            changed();
            await confirm();
        });
    }
    async function remap(transform) {
        return serial(async () => {
            if (!supported()) return;
            let dirty = false;
            for (const record of Object.values(collection().records)) {
                if (!record?.chatRef) continue;
                const replacement = transform(record.chatRef);
                if (replacement) { Object.assign(record, replacement); dirty = true; }
            }
            if (dirty) { changed(); await confirm(); }
        });
    }
    return { list, has, update, apply, discard: remove, invalidate, remap,
        retryPersistence: () => serial(confirm), check: record => validatePendingProgress(record, current(), hash) };
}
