// SPDX-License-Identifier: AGPL-3.0-only

export const NARRATOR_MODE_VERSION = 1;
export const NARRATOR_MESSAGE_METADATA_KEY = 'narratorCast';

function cleanString(value) {
    return String(value || '').trim();
}

function uniqueStrings(values) {
    const result = [];
    const seen = new Set();
    for (const value of Array.isArray(values) ? values : []) {
        const normalized = cleanString(value);
        if (!normalized || seen.has(normalized)) continue;
        seen.add(normalized);
        result.push(normalized);
    }
    return result;
}

function isObject(value) {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function isNarratorModeActive({ isGroupChat = false, manualModeEnabled = false, enabled = false } = {}) {
    return !isGroupChat && manualModeEnabled === true && enabled === true;
}

export function createNarratorMember({ id, avatar, name, lorebookName }, createId = () => crypto.randomUUID()) {
    return {
        id: cleanString(id) || cleanString(createId()),
        avatar: cleanString(avatar),
        name: cleanString(name),
        lorebookName: cleanString(lorebookName),
        retired: false,
    };
}

export function normalizeNarratorConfig(value, options = {}) {
    const source = isObject(value) ? value : {};
    const members = [];
    const seenIds = new Set();
    let changed = !isObject(value) || source.version !== NARRATOR_MODE_VERSION;

    for (const raw of Array.isArray(source.members) ? source.members : []) {
        if (!isObject(raw)) {
            changed = true;
            continue;
        }
        const member = {
            id: cleanString(raw.id),
            avatar: cleanString(raw.avatar),
            name: cleanString(raw.name),
            lorebookName: cleanString(raw.lorebookName),
            retired: raw.retired === true,
        };
        if (!member.id || !member.name || !member.lorebookName || seenIds.has(member.id)) {
            changed = true;
            continue;
        }
        seenIds.add(member.id);
        members.push(member);
        if (
            raw.id !== member.id || raw.avatar !== member.avatar || raw.name !== member.name ||
            raw.lorebookName !== member.lorebookName || !!raw.retired !== member.retired
        ) changed = true;
    }

    const validActiveIds = new Set(members.filter(member => !member.retired).map(member => member.id));
    const activeCastIds = uniqueStrings(source.activeCastIds).filter(id => validActiveIds.has(id));
    if (activeCastIds.length !== (Array.isArray(source.activeCastIds) ? source.activeCastIds.length : 0)) changed = true;

    return {
        config: {
            version: NARRATOR_MODE_VERSION,
            enabled: source.enabled === true,
            members,
            activeCastIds,
        },
        changed,
    };
}

export function ensureNarratorConfig(stmbData, options = {}) {
    if (!isObject(stmbData)) throw new TypeError('STMemoryBooks chat metadata must be an object.');
    const { config, changed } = normalizeNarratorConfig(stmbData.narratorMode, options);
    stmbData.narratorMode = config;
    return { config, changed };
}

export function getNarratorActiveMembers(config) {
    const active = new Set(uniqueStrings(config?.activeCastIds));
    return (Array.isArray(config?.members) ? config.members : [])
        .filter(member => !member?.retired && active.has(member.id));
}

export function setNarratorActiveCast(config, memberIds) {
    const allowed = new Set((config?.members || []).filter(member => !member.retired).map(member => member.id));
    const next = uniqueStrings(memberIds).filter(id => allowed.has(id));
    const current = uniqueStrings(config?.activeCastIds);
    if (current.length === next.length && current.every((id, index) => id === next[index])) return false;
    config.activeCastIds = next;
    return true;
}

export function validateNarratorBindings(config, canonicalLorebookName, availableLorebooks = []) {
    const canonical = cleanString(canonicalLorebookName);
    const available = new Set((availableLorebooks || []).map(cleanString).filter(Boolean));
    const used = new Map();
    const issues = [];
    for (const member of config?.members || []) {
        const book = cleanString(member.lorebookName);
        if (!book || (available.size > 0 && !available.has(book))) {
            issues.push({ type: 'missing', member });
        } else if (book === canonical) {
            issues.push({ type: 'canonical', member, lorebookName: book });
        } else if (used.has(book)) {
            issues.push({ type: 'duplicate', member, otherMember: used.get(book), lorebookName: book });
        } else {
            used.set(book, member);
        }
    }
    return { valid: issues.length === 0, issues };
}

function ensureMessageExtra(message) {
    if (!isObject(message.extra)) message.extra = {};
    if (!isObject(message.extra.STMemoryBooks)) message.extra.STMemoryBooks = {};
    return message.extra.STMemoryBooks;
}

export function stampNarratorCast(message, memberIds, options = {}) {
    if (!isObject(message)) return false;
    const incoming = uniqueStrings(memberIds);
    const existing = options.merge === true ? getNarratorCastFromMessage(message) : [];
    const ids = uniqueStrings([...existing, ...incoming]);
    const stmbExtra = ensureMessageExtra(message);
    stmbExtra[NARRATOR_MESSAGE_METADATA_KEY] = {
        version: NARRATOR_MODE_VERSION,
        memberIds: ids,
    };

    if (Number.isInteger(message.swipe_id) && Array.isArray(message.swipe_info)) {
        const swipeInfo = message.swipe_info[message.swipe_id];
        if (isObject(swipeInfo)) {
            if (!isObject(swipeInfo.extra)) swipeInfo.extra = {};
            if (!isObject(swipeInfo.extra.STMemoryBooks)) swipeInfo.extra.STMemoryBooks = {};
            swipeInfo.extra.STMemoryBooks[NARRATOR_MESSAGE_METADATA_KEY] = structuredClone(
                stmbExtra[NARRATOR_MESSAGE_METADATA_KEY],
            );
        }
    }
    return true;
}

export function getNarratorCastFromMessage(message) {
    return uniqueStrings(message?.extra?.STMemoryBooks?.[NARRATOR_MESSAGE_METADATA_KEY]?.memberIds);
}

export function getNarratorSceneParticipants(messages) {
    const source = Array.isArray(messages) ? messages : [];
    const narratorMessages = source.filter(message => !message?.is_user && !message?.is_system);
    const authoritative = narratorMessages.length > 0 ? narratorMessages : source;
    const hasUntaggedMessages = authoritative.some(message =>
        !isObject(message?.extra?.STMemoryBooks?.[NARRATOR_MESSAGE_METADATA_KEY]),
    );
    const continuityMessages = hasUntaggedMessages ? source : authoritative;
    const memberIds = uniqueStrings(continuityMessages.flatMap(getNarratorCastFromMessage));
    return { memberIds, hasUntaggedMessages };
}

export function getNarratorParticipantNames(config, participantIds) {
    const membersById = new Map(
        (Array.isArray(config?.members) ? config.members : []).map(member => [member?.id, member]),
    );
    return uniqueStrings(participantIds)
        .map(id => cleanString(membersById.get(id)?.name))
        .filter(Boolean);
}

export function buildNarratorCopyTargets(config, participantIds) {
    const participants = new Set(uniqueStrings(participantIds));
    return (config?.members || [])
        .filter(member => participants.has(member.id) && member.lorebookName)
        .map(member => ({
            speakerName: member.id,
            speakerNames: [member.id],
            member,
            members: [member],
            lorebookName: member.lorebookName,
        }));
}

export function mergeNarratorLorebookEntries(targetEntries, lorebookData, worldName, existingKeys = new Set()) {
    const target = Array.isArray(targetEntries) ? targetEntries : [];
    for (const [entryKey, rawEntry] of Object.entries(lorebookData?.entries || {})) {
        const uid = rawEntry?.uid ?? entryKey;
        const key = `${worldName}.${uid}`;
        if (existingKeys.has(key)) continue;
        existingKeys.add(key);
        target.push({ uid, world: worldName, ...structuredClone(rawEntry) });
    }
    return target;
}

export function collectNarratorSourceMetadata(entries, sourceIds) {
    const ids = new Set(uniqueStrings(sourceIds));
    const ownerIds = [];
    const participantIds = [];
    for (const entry of Array.isArray(entries) ? entries : []) {
        if (!ids.has(cleanString(entry?.uid))) continue;
        ownerIds.push(...uniqueStrings(entry?.STMB_narratorOwnerIds));
        participantIds.push(...uniqueStrings(entry?.STMB_narratorParticipantIds));
    }
    const result = {};
    const owners = uniqueStrings(ownerIds);
    const participants = uniqueStrings(participantIds);
    if (owners.length > 0) result.STMB_narratorOwnerIds = owners;
    if (participants.length > 0) result.STMB_narratorParticipantIds = participants;
    return result;
}
