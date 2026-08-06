// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildConsolidationWorkItemOptions,
  hasGroupAndCharacterConsolidationTopology,
} from './consolidationWorkItemPolicy.js';

const selectedOptions = {
  presetKey: 'arc_alternate',
  targetTier: 2,
  maxPasses: 4,
};

const promptRouting = {
  useGroupChatPrompt: true,
  selectedPromptText: 'selected prompt',
  groupChatPromptText: 'group prompt',
};

test('detects only a resolved group-plus-character consolidation topology', () => {
  assert.equal(hasGroupAndCharacterConsolidationTopology([]), false);
  assert.equal(hasGroupAndCharacterConsolidationTopology([{ role: 'group' }]), false);
  assert.equal(hasGroupAndCharacterConsolidationTopology([{ role: 'character' }]), false);
  assert.equal(hasGroupAndCharacterConsolidationTopology([
    { role: 'group' },
    { role: 'character' },
  ]), true);
});

test('routes the automatic prompt only to the group lorebook', () => {
  assert.deepEqual(
    buildConsolidationWorkItemOptions({ role: 'group' }, selectedOptions, promptRouting),
    {
      ...selectedOptions,
      presetKey: 'arc_group_chat',
      promptText: 'group prompt',
    },
  );
  assert.deepEqual(
    buildConsolidationWorkItemOptions({ role: 'character' }, selectedOptions, promptRouting),
    {
      ...selectedOptions,
      promptText: 'selected prompt',
    },
  );
});

test('keeps ordinary routing for solo and one-book group consolidation', () => {
  assert.deepEqual(
    buildConsolidationWorkItemOptions(
      { role: 'group' },
      selectedOptions,
      { ...promptRouting, useGroupChatPrompt: false },
    ),
    {
      ...selectedOptions,
      promptText: 'selected prompt',
    },
  );
});

test('topology detection remains true for a shared character lorebook item', () => {
  assert.equal(hasGroupAndCharacterConsolidationTopology([
    { role: 'group', lorebookName: 'Group Memory' },
    {
      role: 'character',
      lorebookName: 'Shared Character Memory',
      members: [{ name: 'Alice' }, { name: 'Bob' }],
    },
  ]), true);
});

test('group routing remains special after character work items are skipped', () => {
  const resolvedTopology = [
    { role: 'group', lorebookName: 'Group Memory' },
    { role: 'character', lorebookName: 'Alice Memory' },
  ];
  const readyItems = [resolvedTopology[0]];
  const useGroupChatPrompt = hasGroupAndCharacterConsolidationTopology(resolvedTopology);

  assert.equal(readyItems.length, 1);
  assert.equal(
    buildConsolidationWorkItemOptions(
      readyItems[0],
      selectedOptions,
      { ...promptRouting, useGroupChatPrompt },
    ).presetKey,
    'arc_group_chat',
  );
});
