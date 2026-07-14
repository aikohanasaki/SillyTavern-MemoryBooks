export const SIDE_PROMPT_AFTER_MEMORY_SET_KEY = 'sidePromptAfterMemorySetKey';
export const DEFAULT_SOLO_SIDE_PROMPT_SET_KEY = 'defaultSoloSidePromptSetKey';
export const DEFAULT_GROUP_SIDE_PROMPT_SET_KEY = 'defaultGroupSidePromptSetKey';

export function normalizeSidePromptSetKey(value) {
    return typeof value === 'string' ? value.trim() : '';
}

export function normalizeDefaultSidePromptSetKeys(moduleSettings) {
    if (!moduleSettings || typeof moduleSettings !== 'object') {
        return moduleSettings;
    }

    moduleSettings[DEFAULT_SOLO_SIDE_PROMPT_SET_KEY] = normalizeSidePromptSetKey(
        moduleSettings[DEFAULT_SOLO_SIDE_PROMPT_SET_KEY],
    );
    moduleSettings[DEFAULT_GROUP_SIDE_PROMPT_SET_KEY] = normalizeSidePromptSetKey(
        moduleSettings[DEFAULT_GROUP_SIDE_PROMPT_SET_KEY],
    );
    return moduleSettings;
}

export function getDefaultSidePromptSetKey(moduleSettings, sceneContext) {
    const settingKey = sceneContext?.isGroupChat
        ? DEFAULT_GROUP_SIDE_PROMPT_SET_KEY
        : DEFAULT_SOLO_SIDE_PROMPT_SET_KEY;
    return normalizeSidePromptSetKey(moduleSettings?.[settingKey]);
}

export function resolveAfterMemorySidePromptSet(markers, moduleSettings, sceneContext) {
    const hasChatOverride = !!markers
        && typeof markers === 'object'
        && Object.hasOwn(markers, SIDE_PROMPT_AFTER_MEMORY_SET_KEY);
    const setKey = hasChatOverride
        ? normalizeSidePromptSetKey(markers[SIDE_PROMPT_AFTER_MEMORY_SET_KEY])
        : getDefaultSidePromptSetKey(moduleSettings, sceneContext);

    return {
        setKey,
        mode: setKey ? 'set' : 'individual',
        source: hasChatOverride ? 'chat' : 'default',
    };
}

export function clearDeletedSidePromptSetReferences(moduleSettings, markers, deletedSetKey) {
    const normalizedDeletedKey = normalizeSidePromptSetKey(deletedSetKey);
    let settingsChanged = false;
    let chatChanged = false;

    if (!normalizedDeletedKey) {
        return { settingsChanged, chatChanged };
    }

    for (const settingKey of [
        DEFAULT_SOLO_SIDE_PROMPT_SET_KEY,
        DEFAULT_GROUP_SIDE_PROMPT_SET_KEY,
    ]) {
        if (normalizeSidePromptSetKey(moduleSettings?.[settingKey]) === normalizedDeletedKey) {
            moduleSettings[settingKey] = '';
            settingsChanged = true;
        }
    }

    if (
        markers
        && typeof markers === 'object'
        && Object.hasOwn(markers, SIDE_PROMPT_AFTER_MEMORY_SET_KEY)
        && normalizeSidePromptSetKey(markers[SIDE_PROMPT_AFTER_MEMORY_SET_KEY]) === normalizedDeletedKey
    ) {
        markers[SIDE_PROMPT_AFTER_MEMORY_SET_KEY] = '';
        chatChanged = true;
    }

    return { settingsChanged, chatChanged };
}
