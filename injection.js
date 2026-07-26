// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// STMB-Auto fork — Living-lorebook context injection (Phase 4, plan §4.4,
// §5.5 merge discipline, §5.2 never-poison guarantee).
//
// The injection module is the bridge between the upstream memory-generation
// pipeline (stmemory.js) and the fork's living-lorebook state. It assembles
// the token-capped living-entry context that the Sentinel produces, the
// delta-not-rehash instructions, and the error-control rules, and emits
// them as a section of the system prompt that the model sees before it
// generates the next memory JSON.
//
// Integration (P1.3 stub → P4.1 implementation):
//
//   * The single `STMBC-HOOK(injection)` line in stmemory.js `buildPrompt()`
//     (placed in P1.3 phase 1) calls into this module.
//   * `buildLivingContextPreamble()` self-gates on
//     `autoModule.injection.enabled` (default OFF) and swallows every error,
//     returning '' so the caller falls back to the byte-identical upstream
//     prompt. When injection is disabled — or on any failure — memory
//     generation is unaffected (plan §1.2 rule 4 "configuration over
//     modification" + §5.2 "never poison upstream on partial failure").
//   * Reads `chat_metadata.stmbc.livingEntries` (Sentinel-owned) and
//     `extension_settings.STMemoryBooks.autoModule.injection` (settings
//     owned by autoSettings.js, P2.2).
//
// Why this file exists on the P1.3 branch even though the implementation
// is Phase 4 (plan §1.2 rule 1):
//
//   Same audit-trail reason as auditor.js: the fork's merge-map names
//   `injection.js` as one of the five reserved file slots. The slot must
//   exist on `main` *before* Phase 4 lands so the FORK_NOTES.md list of
//   "Files the fork adds" is honest about the reserved slots, and so a
//   future P4.1 branch merges with "fill in the stub" rather than
//   "add a new file".
//
// This stub is intentionally empty (no exports, no runtime side effects).
// The P4.1 implementation will replace it wholesale. See FORK_NOTES.md
// "Files the fork adds" for the slot reservation.
