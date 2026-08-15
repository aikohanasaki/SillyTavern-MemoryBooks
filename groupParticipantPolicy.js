// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

export function getGroupParticipantConfirmationPolicy(
  detectedNames,
  allNames,
  autoAccept,
) {
  const detected = Array.isArray(detectedNames) ? detectedNames : [];
  const available = Array.isArray(allNames) ? allNames : [];
  const detectionFailed = detected.length === 0;

  return {
    detectionFailed,
    selectedNames: detectionFailed ? available : detected,
    requiresConfirmation: detectionFailed || autoAccept !== true,
  };
}
