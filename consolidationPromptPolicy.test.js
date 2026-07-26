// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isRegenerationOnlyPreset,
  selectConsolidationDefaultPresetKey,
} from './consolidationPromptPolicy.js';

test('identifies only the reserved regeneration preset', () => {
  assert.equal(isRegenerationOnlyPreset('arc_regenerate'), true);
  assert.equal(isRegenerationOnlyPreset('arc_alternate'), false);
  assert.equal(isRegenerationOnlyPreset('custom-regenerate'), false);
});

test('never selects the regeneration preset as the consolidation default', () => {
  const builtIns = {
    arc_default: 'default prompt',
    arc_regenerate: 'regeneration prompt',
  };
  assert.equal(selectConsolidationDefaultPresetKey({
    defaultPresetKey: 'arc_regenerate',
    overrides: {
      arc_regenerate: { prompt: 'custom regeneration prompt' },
    },
  }, builtIns), 'arc_default');
});

test('preserves ordinary defaults and skips regeneration-only fallbacks', () => {
  assert.equal(selectConsolidationDefaultPresetKey({
    defaultPresetKey: 'custom',
    overrides: {
      custom: { prompt: 'custom prompt' },
      arc_regenerate: { prompt: 'regeneration prompt' },
    },
  }), 'custom');
  assert.equal(selectConsolidationDefaultPresetKey({
    defaultPresetKey: 'missing',
    overrides: {
      arc_regenerate: { prompt: 'regeneration prompt' },
      another: { prompt: 'ordinary prompt' },
    },
  }), 'another');
});
