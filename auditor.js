// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// STMB-Auto fork — Auditor (Phase 5, plan §4.3).
//
// The Auditor is the maintenance cron for the living-lorebook system: it
// reviews the entries produced by the Sentinel and the user-managed lorebook,
// runs four on-demand jobs (coverage audit, entry regeneration, technical pass,
// claim re-verification), and writes its findings to the jobs dashboard (see
// stmbJobs.js). Each job is a checkpoint/resume chunk walker so long runs
// survive a SillyTavern reload.
//
// Integration (P1.3 stub → P5.1/P5.2/P5.3/P5.4 implementation):
//
//   * Registered as the "audit" job type in stmbJobs.js via
//     `registerStmbJobExecutor("audit", executeAuditJob)` (fork-side addition).
//   * `/stmbc-audit [job]` and `/stmbc-stop` slash commands in registerSlashCommands
//     (fork-side `STMBC-HOOK(auditor)` sites in index.js).
//   * The checkpoint lives at `chat_metadata.stmbc.audit`
//     (chunk index + running notes) so re-running `/stmbc-audit` resumes from
//     the saved chunk.
//
// Why this file exists on the P1.3 branch even though the implementation
// is Phase 5 (plan §1.2 rule 1):
//
//   The fork's merge-map names `auditor.js` as one of the five reserved
//   file slots. The slot must exist on `main` *before* Phase 5 lands so that
//   when the auditor implementation branch merges, the diff is "fill in the
//   stub" rather than "add a new file that drifts the merge map". Merging a
//   renamed-as-additive file into a branch that already has the stub is a
//   clean overwrite; merging a new file into a branch that doesn't have it
//   is also fine, but the FORK_NOTES.md list of "Files the fork adds" should
//   claim the slot up front so reviewers don't have to chase it down later.
//
// This stub is intentionally empty (no exports, no runtime side effects).
// The P5.1 implementation will replace it wholesale. See FORK_NOTES.md
// "Files the fork adds" for the slot reservation.
