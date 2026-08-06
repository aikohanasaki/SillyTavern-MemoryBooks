// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import { GROUP_CHAT_CONSOLIDATION_PRESET_KEY } from './constants.js';

export function hasGroupAndCharacterConsolidationTopology(items) {
  const source = Array.isArray(items) ? items : [];
  return source.some(item => item?.role === 'group')
    && source.some(item => item?.role === 'character');
}

export function buildConsolidationWorkItemOptions(
  workItem,
  selectedOptions = {},
  {
    useGroupChatPrompt = false,
    selectedPromptText = '',
    groupChatPromptText = '',
  } = {},
) {
  const applyGroupChatPrompt = useGroupChatPrompt && workItem?.role === 'group';
  return {
    ...selectedOptions,
    presetKey: applyGroupChatPrompt
      ? GROUP_CHAT_CONSOLIDATION_PRESET_KEY
      : selectedOptions?.presetKey,
    promptText: applyGroupChatPrompt
      ? groupChatPromptText
      : selectedPromptText,
  };
}
