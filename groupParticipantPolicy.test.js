// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import test from 'node:test';
import { getGroupParticipantConfirmationPolicy } from './groupParticipantPolicy.js';

const allNames = ['jin', 'roger', 'anna'];

test('automatically accepts a non-empty detected participant set', () => {
  assert.deepEqual(
    getGroupParticipantConfirmationPolicy(['jin', 'roger'], allNames, true),
    {
      detectionFailed: false,
      selectedNames: ['jin', 'roger'],
      requiresConfirmation: false,
    },
  );
});

test('still confirms a non-empty detected participant set when automatic acceptance is disabled', () => {
  assert.deepEqual(
    getGroupParticipantConfirmationPolicy(['jin', 'roger'], allNames, false),
    {
      detectionFailed: false,
      selectedNames: ['jin', 'roger'],
      requiresConfirmation: true,
    },
  );
});

test('forces confirmation when detection fails even if automatic acceptance is enabled', () => {
  assert.deepEqual(
    getGroupParticipantConfirmationPolicy([], allNames, true),
    {
      detectionFailed: true,
      selectedNames: allNames,
      requiresConfirmation: true,
    },
  );
});
