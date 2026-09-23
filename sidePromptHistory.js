export const SIDE_PROMPT_HISTORY_KEY = 'STMB_sidePromptHistory';
export const SIDE_PROMPT_SUFFIX = ' (STMB SidePrompt)';

/** Builds the history identity independently of prompt display names and inclusion groups. */
export function buildSidePromptHistoryRequest(template, settings, sceneContext, titleBase, legacyTitles) {
    const ref = sceneContext?.chatRef;
    return {
        templateKey: String(template?.key || ''),
        chatKey: ref?.type === 'group'
            ? JSON.stringify(['group', sceneContext.groupId, ref.chatId])
            : JSON.stringify(['character', ref?.avatarUrl, ref?.fileName]),
        chatId: String(sceneContext?.chatId || ''),
        titleBase: titleBase.endsWith(SIDE_PROMPT_SUFFIX) ? titleBase.slice(0, -SIDE_PROMPT_SUFFIX.length) : titleBase,
        // A template rename changes its default title, not its history. Macro-resolved overrides are separate streams.
        titleSource: String(template?.settings?.lorebook?.entryTitleOverride || '').trim() ? 'override' : 'name',
        group: `${template?.name || ''}-${sceneContext?.chatId || ''}`.replace(/\s/g, '').replace(/,/g, '-'),
        append: settings?.moduleSettings?.sidePromptVersioningEnabled === true && template?.settings?.saveAllVersions === true,
        legacyTitles,
    };
}

/** Rejects malformed or ambiguous history requests without including entry data in errors. */
export function sidePromptHistoryError(status = 409) {
    return Object.assign(new Error(status === 400 ? 'Invalid side-prompt history request.' : 'Side-prompt history is ambiguous. No changes were saved.'), {
        status, type: status === 400 ? 'StmbSidePromptHistoryInvalid' : 'StmbSidePromptHistoryConflict',
    });
}

/** Validates the optional history request at the save boundary. */
export function validateSidePromptHistoryRequest(history) {
    if (!history || typeof history !== 'object' || Array.isArray(history)
        || ['templateKey', 'chatKey', 'chatId', 'titleBase', 'group'].some(key => typeof history[key] !== 'string' || !history[key].trim() || history[key].length > 4096)
        || !['name', 'override'].includes(history.titleSource) || typeof history.append !== 'boolean'
        || /[\s,]/u.test(history.group)
        || !Array.isArray(history.legacyTitles) || history.legacyTitles.length > 4
        || history.legacyTitles.some(title => typeof title !== 'string' || !title.trim() || title.length > 4096)) {
        throw sidePromptHistoryError(400);
    }
    let identity;
    try { identity = JSON.parse(history.chatKey); } catch { throw sidePromptHistoryError(400); }
    if (!Array.isArray(identity) || identity.length !== 3 || !['character', 'group'].includes(identity[0])
        || identity.some(value => typeof value !== 'string' || !value.trim()) || identity[2] !== history.chatId) {
        throw sidePromptHistoryError(400);
    }
}

/** Matches a stored stream; display-name changes never merge unrelated macro variants. */
function isSameSidePromptHistory(stored, requested) {
    return stored?.version === 1 && stored.templateKey === requested.templateKey && stored.chatKey === requested.chatKey
        && stored.titleSource === requested.titleSource
        && (stored.titleSource === 'name' || stored.titleBase === requested.titleBase);
}

/** Stable stream key shared by history lookup and rollback reconciliation. */
export function getSidePromptHistoryStreamKey(history) {
    if (!history || history.version !== 1 || typeof history.templateKey !== 'string' || typeof history.chatKey !== 'string'
        || !['name', 'override'].includes(history.titleSource)) return null;
    return JSON.stringify([history.templateKey, history.chatKey, history.titleSource,
        history.titleSource === 'override' ? String(history.titleBase || '') : '']);
}

/** Resolves the newest version or an unambiguous legacy output for reads and locked writes. */
export function resolveSidePromptHistory(lorebookData, history) {
    validateSidePromptHistoryRequest(history);
    const entries = Object.values(lorebookData?.entries || {});
    const versions = entries.filter(entry => isSameSidePromptHistory(entry?.[SIDE_PROMPT_HISTORY_KEY], history));
    const sequences = new Set();
    for (const entry of versions) {
        const sequence = entry[SIDE_PROMPT_HISTORY_KEY].sequence;
        if (!Number.isSafeInteger(sequence) || sequence < 1 || sequences.has(sequence)) throw sidePromptHistoryError();
        sequences.add(sequence);
    }
    versions.sort((a, b) => a[SIDE_PROMPT_HISTORY_KEY].sequence - b[SIDE_PROMPT_HISTORY_KEY].sequence);
    if (versions.length) return { versions, latest: versions.at(-1), legacy: null };
    const candidates = entries.filter(entry => {
        if (entry?.[SIDE_PROMPT_HISTORY_KEY]) return false;
        const snapshot = entry?.STMB_sidePromptRegeneration;
        return !(snapshot && (snapshot.templateKey !== history.templateKey || snapshot.chatId !== history.chatId));
    });
    for (const title of history.legacyTitles) {
        const legacy = candidates.filter(entry => String(entry?.comment || '') === title);
        if (legacy.length > 1) throw sidePromptHistoryError();
        if (legacy.length === 1) return { versions, latest: legacy[0], legacy: legacy[0] };
    }
    return { versions, latest: null, legacy: null };
}

/** Formats a version title without truncating sequence numbers above 999. */
export function formatSidePromptVersionTitle(base, sequence) {
    return `${base}-${String(sequence).padStart(3, '0')}${SIDE_PROMPT_SUFFIX}`;
}
