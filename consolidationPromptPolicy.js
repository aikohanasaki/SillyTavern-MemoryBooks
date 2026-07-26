// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import { CONSOLIDATION_REGENERATION_PRESET_KEY } from './constants.js';

export function isRegenerationOnlyPreset(key) {
  return String(key || '').trim() === CONSOLIDATION_REGENERATION_PRESET_KEY;
}

export function selectConsolidationDefaultPresetKey(data = null, builtIns = {}) {
  const overrides = data?.overrides && typeof data.overrides === 'object'
    ? data.overrides
    : {};
  const preferred = String(data?.defaultPresetKey || '').trim();
  if (
    preferred &&
    !isRegenerationOnlyPreset(preferred) &&
    (overrides[preferred] || builtIns[preferred])
  ) {
    return preferred;
  }
  if (overrides.arc_default || builtIns.arc_default) return 'arc_default';
  return Object.keys(overrides).find(key => !isRegenerationOnlyPreset(key))
    || Object.keys(builtIns).find(key => !isRegenerationOnlyPreset(key))
    || 'arc_default';
}
