// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import {
  CONSOLIDATION_REGENERATION_PRESET_KEY,
  GROUP_CHAT_CONSOLIDATION_PRESET_KEY,
} from './constants.js';

export function isRegenerationOnlyPreset(key) {
  return String(key || '').trim() === CONSOLIDATION_REGENERATION_PRESET_KEY;
}

export function isGroupChatOnlyPreset(key) {
  return String(key || '').trim() === GROUP_CHAT_CONSOLIDATION_PRESET_KEY;
}

export function isOrdinaryConsolidationPreset(key) {
  return !isRegenerationOnlyPreset(key) && !isGroupChatOnlyPreset(key);
}

export function buildConsolidationPromptsExportData(
  data = null,
  builtIns = {},
  getDisplayName = key => String(key || ''),
) {
  const source = data && typeof data === 'object' ? data : {};
  const overrides = source.overrides && typeof source.overrides === 'object'
    ? { ...source.overrides }
    : {};

  for (const [key, prompt] of Object.entries(builtIns || {})) {
    if (
      overrides[key] ||
      typeof prompt !== 'string' ||
      !prompt.trim()
    ) {
      continue;
    }
    overrides[key] = {
      displayName: getDisplayName(key, prompt),
      prompt,
      createdAt: null,
    };
  }

  return {
    ...source,
    overrides,
  };
}

export function selectConsolidationDefaultPresetKey(data = null, builtIns = {}) {
  const overrides = data?.overrides && typeof data.overrides === 'object'
    ? data.overrides
    : {};
  const preferred = String(data?.defaultPresetKey || '').trim();
  if (
    preferred &&
    isOrdinaryConsolidationPreset(preferred) &&
    (overrides[preferred] || builtIns[preferred])
  ) {
    return preferred;
  }
  if (overrides.arc_default || builtIns.arc_default) return 'arc_default';
  return Object.keys(overrides).find(isOrdinaryConsolidationPreset)
    || Object.keys(builtIns).find(isOrdinaryConsolidationPreset)
    || 'arc_default';
}
