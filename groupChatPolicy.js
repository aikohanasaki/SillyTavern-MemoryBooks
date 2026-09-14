// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

/** Capture once on an operation's context; queued work keeps its original policy. */
export function getGroupChatPolicy(moduleSettings = {}, context = {}) {
    moduleSettings ||= {};
    context ||= {};
    return {
        isGroupChat: !!context.isGroupChat,
        isNarratorMode: !!context.isNarratorMode,
        characterAwareMemories: moduleSettings.characterAwareMemories !== false,
        useSeparateGroupSidePrompts: moduleSettings.useSeparateGroupSidePrompts !== false,
        ...context.groupChatPolicy,
    };
}

export function isCharacterAwarenessDisabled(moduleSettings, context) {
    const policy = getGroupChatPolicy(moduleSettings, context);
    return policy.isGroupChat && !policy.isNarratorMode && !policy.characterAwareMemories;
}

export function usesGroupSidePromptDefault(moduleSettings, context) {
    const policy = getGroupChatPolicy(moduleSettings, context);
    return policy.isGroupChat && policy.useSeparateGroupSidePrompts;
}

export function applyGroupMemoryPolicy(compiledScene, moduleSettings, context) {
    const metadata = compiledScene.metadata ||= {};
    metadata.groupChatPolicy = getGroupChatPolicy(moduleSettings, context);
    if (isCharacterAwarenessDisabled(moduleSettings, metadata)) {
        delete metadata.characterFilterNames;
        metadata.stmbPromptTarget = '';
    }
    return compiledScene;
}

export function getGroupMemoryProfile(profile, moduleSettings, context) {
    return isCharacterAwarenessDisabled(moduleSettings, context)
        ? { ...profile, useGroupSpecificPrompts: false, stmbPromptTarget: '' }
        : profile;
}
