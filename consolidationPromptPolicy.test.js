// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildConsolidationPromptsExportData,
  isGroupChatOnlyPreset,
  isOrdinaryConsolidationPreset,
  isRegenerationOnlyPreset,
  selectConsolidationDefaultPresetKey,
} from './consolidationPromptPolicy.js';

test('identifies only the reserved regeneration preset', () => {
  assert.equal(isRegenerationOnlyPreset('arc_regenerate'), true);
  assert.equal(isRegenerationOnlyPreset('arc_alternate'), false);
  assert.equal(isRegenerationOnlyPreset('custom-regenerate'), false);
});

test('identifies only the reserved automatic group-chat preset', () => {
  assert.equal(isGroupChatOnlyPreset('arc_group_chat'), true);
  assert.equal(isGroupChatOnlyPreset('arc_default'), false);
  assert.equal(isGroupChatOnlyPreset('custom-group-chat'), false);
});

test('ordinary consolidation excludes both reserved preset kinds', () => {
  assert.equal(isOrdinaryConsolidationPreset('arc_default'), true);
  assert.equal(isOrdinaryConsolidationPreset('custom'), true);
  assert.equal(isOrdinaryConsolidationPreset('arc_regenerate'), false);
  assert.equal(isOrdinaryConsolidationPreset('arc_group_chat'), false);
});

test('never selects a reserved preset as the consolidation default', () => {
  const builtIns = {
    arc_default: 'default prompt',
    arc_regenerate: 'regeneration prompt',
    arc_group_chat: 'group-chat prompt',
  };
  assert.equal(selectConsolidationDefaultPresetKey({
    defaultPresetKey: 'arc_regenerate',
    overrides: {
      arc_regenerate: { prompt: 'custom regeneration prompt' },
    },
  }, builtIns), 'arc_default');
  assert.equal(selectConsolidationDefaultPresetKey({
    defaultPresetKey: 'arc_group_chat',
    overrides: {
      arc_group_chat: { prompt: 'custom group-chat prompt' },
    },
  }, builtIns), 'arc_default');
});

test('preserves ordinary defaults and skips reserved fallbacks', () => {
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
      arc_group_chat: { prompt: 'group-chat prompt' },
      another: { prompt: 'ordinary prompt' },
    },
  }), 'another');
});

test('exports built-in fallback presets without migrating the persisted document', () => {
  const data = {
    version: 1,
    defaultPresetKey: 'arc_default',
    overrides: {
      arc_default: {
        displayName: 'Edited default',
        prompt: 'edited default prompt',
      },
    },
  };
  const exported = buildConsolidationPromptsExportData(
    data,
    {
      arc_default: 'built-in default prompt',
      arc_group_chat: 'built-in group prompt',
    },
    key => key === 'arc_group_chat'
      ? 'Group Chat Consolidation Analysis (Automatic)'
      : key,
  );

  assert.notEqual(exported, data);
  assert.notEqual(exported.overrides, data.overrides);
  assert.equal(
    exported.overrides.arc_default.prompt,
    'edited default prompt',
  );
  assert.deepEqual(exported.overrides.arc_group_chat, {
    displayName: 'Group Chat Consolidation Analysis (Automatic)',
    prompt: 'built-in group prompt',
    createdAt: null,
  });
  assert.equal(data.overrides.arc_group_chat, undefined);
});
