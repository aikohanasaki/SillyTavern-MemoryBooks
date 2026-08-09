<!--
Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only

Fork changelog addendum. Fork-specific entries only — upstream changes continue
to land in `changelog.md`.
-->

# 📕 Memory Books Auto — Fork Changelog

Fork-specific changes only. Upstream changelog lives at [`changelog.md`](./changelog.md).
Fork home: https://github.com/phattbeats/SillyTavern-MemoryBooks-Auto.

> **Versioning note:** the `v0.1.0` git tag in this fork's history was an
> internal Phase-6 lifecycle marker. **v0.0.1** is the first public release;
> **v0.0.2** is the second. The section below describes v0.0.1 / v0.1.0-equivalent
> contents and is preserved for audit purposes.


## v0.0.15 (2026-08-09) — fix: STMB's own Max Response Tokens setting silently overrode the user's Chat Completion preset

Closes [PHA-1846](/PHA/issues/PHA-1846). The user had "Max Response Length" set
to 50k in their SillyTavern Chat Completion preset, but LiteLLM logs showed
every `/stmb-auto` request landing around 5–10k tokens, and the scene-memory
step kept failing with `AI response JSON appears incomplete (text ends
mid-sentence). Try increasing Max Response Length.` — the toast pointed at a
setting that was, from the user's perspective, already generous. Root cause:
`sendRawCompletionRequest` (`stmemory.js`) computes the request's `max_tokens`
as "STMB's own **Max Response Tokens** setting wins outright if it's set to
anything above 0 — otherwise fall back to the live Chat Completion preset."
That's intentional, documented behavior (0 = "inherit the preset"), but
`DEFAULT_MAX_TOKENS` — the value new installs (and any settings reset) start
with — was `4000`, sized for short, one-message manual summaries. Every STMB
request, including `/stmb-auto`'s full-chunk scene memories and audit-derived
lorebook entries, was silently capped at that value regardless of what the
user configured in their own preset, and 4000 tokens isn't enough headroom
for a large narrative memory's JSON payload — hence the mid-sentence
truncation. Fixed by changing `DEFAULT_MAX_TOKENS` to `0`, so an
out-of-the-box install (and `/stmb-auto`, the "no parameters, just run it"
feature this issue is about) inherits the user's actual Chat Completion
preset instead of a manual-mode value nobody chose. Existing installs with an
already-saved `Max Response Tokens` value are unaffected by this default —
set that field to `0` (or to your preset's own value) in Settings to pick up
the fix immediately.

## v0.0.14 (2026-08-09) — fix: /stmb-auto ReferenceError killed the run right after the audit step

Closes [PHA-1846](/PHA/issues/PHA-1846). The user reran `/stmb-auto` on 0.0.13
and got a job-panel toast `STMB Auto failed: lastIndex is not defined` right
after "Audit: chunk 3/3 done" — the auto-created lorebook was left with 0
entries because the run never reached the scene-memory or coverage-generation
steps. Root cause: `runStmbAutoPipeline` (`index.js`) is a standalone
top-level `async function`, registered directly as the `stmbAuto` job
executor's body (`registerStmbJobExecutor("stmbAuto", (job, context) =>
runStmbAutoPipeline(context))`). It referenced `lastIndex` at its Step 3
(`planAutoMemoryChunks(highestProcessed, lastIndex, ...)`), but `lastIndex`
was only ever declared inside the *caller*, `handleStmbAutoCommand` — a
different, non-nested function, so there was nothing to close over. Any run
through the Jobs panel (the only path a user hits once Chat Top Bar is
installed) threw a `ReferenceError` the instant it reached that line, always
right after the audit step finished. Fixed by computing `lastIndex` locally
from the module-level `chat` import at the top of Step 3.

## v0.0.12 (2026-08-09) — fix: /stmb-auto could die silently with no toast at all

Closes [PHA-1846](/PHA/issues/PHA-1846). After v0.0.10/v0.0.11 the user reran
`/stmb-auto` and reported: "it pops up and says its started... but nothing
after." Root cause: `handleStmbAutoCommand` (`index.js`) had no top-level
try/catch. Its own doc comment claims "every step is best-effort... a failure
in one step does not abort the rest," but that was only true for the three
explicitly-wrapped steps (audit, scene memory, coverage) — the code between
them (config resolution, the lorebook auto-create/bind block, and the
un-wrapped `await validateStmbCatchupNonInteractive(...)`, which itself has an
un-wrapped `await validateManualGroupLorebookBindingsForMemory(...)` inside
it) could throw and kill the whole async function after the initial "starting"
toast, with zero further feedback — indistinguishable from a hang. The entire
function body is now one try/catch that guarantees a final `toastr.error`
with the real error message on any escaping throw. Also added per-chunk
`toastr.info`/`toastr.warning` progress to the inline audit walk
(`runAuditInline`, the no-jobs-dashboard path `/stmb-auto` actually uses) —
previously the only inline-path feedback was a `console.warn` on error, so a
real multi-chunk walk over a full chat had minutes of silence between the
"reading the whole story" toast and the final summary.

## v0.0.11 (2026-08-09) — fix: Auditor extraction errors were never surfaced

Closes [PHA-1846](/PHA/issues/PHA-1846). Per-chunk extraction failures inside
the audit walk (`auditorCore.js`) already carried the real error message
(`onProgress({ ..., error: String(err?.message || err) })`), but both
SillyTavern-binding call sites in `auditor.js` discarded it: the job-panel
path (`executeAuditJob`) showed only "extraction error, continuing" with no
detail, and the no-dashboard path (`runAuditInline`, what `/stmb-auto` and
`/stmbc-audit` use without the jobs dashboard) only tallied a count, dropping
the message entirely — not even to the console. That silent-failure pattern is
exactly what made the v0.0.10 `current_st` bug ("3 chunks had extraction
errors and were skipped") impossible to diagnose from the UI alone. Both call
sites now `console.warn` each chunk's real error and include the first error
message in the detail/summary text shown to the user.

## v0.0.10 (2026-08-09) — fix: Auditor/Librarian/Sentinel/Clipper+ silently failed on the default profile

Closes [PHA-1846](/PHA/issues/PHA-1846). The user's own test screenshot showed
`/stmbc-audit` (and thus `/stmb-auto`'s audit step) reporting "3 chunks had
extraction errors and were skipped · 0 characters, 0 locations, 0 claims" —
every chunk's LLM call was failing. Root cause: `resolveEffectiveConnectionFromProfile`
(`utils.js`) passed the builtin "Current SillyTavern Settings" profile's literal
`connection.api: "current_st"` sentinel straight through to `requestCompletion`
instead of resolving it to ST's actual active API — `current_st` is not a real
completion source, so `chat_completion_source: "current_st"` was rejected by
every request. This is the *default and only* profile on a fresh install, so
every auto-module feature that routes through this shared helper (Auditor,
Librarian, Sentinel, Clipper+, jobs re-derivation, side prompts) was silently
broken for anyone who hadn't manually configured a separate profile — exactly
the install in the screenshot. `clipManager.js` and `sidePrompts.js` already
special-cased `current_st` at their own call sites; `resolveEffectiveConnectionFromProfile`
did not. Fixed by resolving `current_st`/`useDynamicSTSettings` inside the
shared helper itself (mirroring the existing `clipManager.js` pattern), so
every caller gets the fix at once.

## v0.0.9 (2026-08-09) — fix: every memory add crashed with `noteCatalogEntryWrite is not defined`

Closes [PHA-1846](/PHA/issues/PHA-1846). `addlore.js` called
`noteCatalogEntryWrite` (the catalog-refresh hook exported by `catalog.js`)
at all three lorebook-write sites but never imported it, so every memory
write — manual, `/stmb-auto`, or otherwise — threw a `ReferenceError`
*after* the entry had already been saved to the lorebook. This is what made
testing look like every job "instantly completed or instantly failed": the
write succeeded, then the very next line crashed and reported failure.
Fixed by importing `noteCatalogEntryWrite` from `./catalog.js` in
`addlore.js`.

## v0.0.8 (2026-08-09) — /stmb-auto: the zero-argument "just run it" button

Closes [PHA-1846](/PHA/issues/PHA-1846). Adds a single command, `/stmb-auto`,
that runs the whole STMB-Auto pipeline over the current chat with no
arguments and no popups: audits the full story, writes scene memories for
everything not yet summarized, and generates/refreshes character & location
lorebook entries — the "North Star" UX the existing multi-command workflow
(`/stmbc-audit` → `/stmbc-coverage` → `/stmb-catchup`) never delivered on its
own, because each of those commands has its own preconditions (a bound
lorebook, prior audit notes, required `interval`/`start`/`end` args) that a
first-time user hits as an instant, silent-looking failure.

- New `stmbAutoCore.js` (pure, DI, 22 `node:test` cases): chunk-planning from
  the watermark to the end of the chat, and the run-summary formatter.
- `/stmb-auto` (wired in `index.js`, `STMBC-HOOK(stmb-auto)`): auto-creates
  and binds a lorebook headlessly when none is bound (`autoCreateLorebook`,
  bypassing the interactive recovery popup `initiateMemoryCreation` would
  otherwise show); runs the auditor walk to completion
  (`auditor.runAuditInline`, now exported); plans and writes scene memories
  for every message after the last processed one, reusing `/stmb-catchup`'s
  own non-interactive preflight (`validateStmbCatchupNonInteractive`) and
  `runSceneMemoryRange`; then runs the coverage scan and bulk-generates every
  missing/thin character or location entry headlessly (no popup — the
  interactive-only `bulkGenerate` in `auditorJobs.js` is now exported with a
  configurable cap instead of the coverage popup's fixed 25).
- **The coverage salience gate is relaxed for this command specifically**:
  `minChunks` defaults to 1 here (not the coverage job's own default of 2).
  `/stmbc-coverage`'s gate requires a name to appear in ≥2 audit chunks, which
  is mathematically impossible on any chat that fits in a single audit chunk
  (≤ `chunkSize`, default 40, messages) — exactly the short test-chat case
  this command is meant to handle from a cold start.
- Every step is best-effort and reported in the final summary rather than
  aborting the run: an audit extraction error, a blocked memory chunk, or a
  coverage/lore failure each show up as a line in the toast instead of
  stopping the other steps.
- `auditorJobs.js` also exports `loadBoundLorebook`, `entriesForCoverage`, and
  `resolveJobsConnection` (previously private) so the orchestrator reuses the
  exact coverage/connection-resolution logic `/stmbc-coverage` uses, instead
  of a second implementation.

## v0.0.7-sync (2026-08-05) — bring-upstream-side-prompt-toggle

Pulls upstream's two `update documentation & add side prompt toggle` commits (`98b1ca7`, `3f74062`) on top of `sync/upstream-v8.5.0` (v8.5.0, 2026-08-01). Brings the engine forward from `35c8d21` to `3f74062`. Closes [PHA-1733](/PHA/issues/PHA-1733).

### What's new (upstream pull-through only)

- **Side prompt toggle fast-path.** `upsertTemplate()` now skips `normalizeTemplateTriggers()` and the full object rebuild when only the `enabled` flag changes. A new try/catch around `saveDoc()` reverts the in-memory copy on save failure. Perf + correctness improvement — no fork-specific change required.
- **Side prompt UI toggle.** The side prompt manager now exposes a checkbox to enable/disable individual prompts without touching the full edit dialog (the new `sidePromptsManager.js` / `sidePromptsPopup.js` source files are added in their own module, separate from the fork's hook site `sidePrompts.js`).
- **Documentation refresh.** Bundled `readme.md` trimmed to a tighter intro with two learning paths (Interactive Guide / AI Reference Manual) and a single-source `userguides/1 Memory_Books_AI_Reference_Manual.md` (NEW, 2359 lines) plus `userguides/readme-EN.md` (NEW, 998 lines). Bundled `changelog.md` adds the upstream v8.5.1 entry adjacent to our fork's existing entries. All locale JSONs receive the new side-prompt-toggle translation key. `manifest.json` version is upstream's 8.5.1 → but our fork manifest is preserved at `version 0.0.7-sync / author phattbeats` (see "Merge policy" below).

### Merge policy (per PHA-1733)

Conflicts landed on five files; all five are non-hook artifacts:

- `changelog.md` — merged: kept the fork's `v8.2.2-a.1` and `v8.5.0-sync` entries, appended upstream's `v8.5.1` ahead of the v8.5.0 entry.
- `manifest.json` — kept fork (`author: phattbeats`, `version: 0.0.7-sync`). The upstream's `aikohanasaki` / `8.5.1` would conflict with our fork's product identity.
- `readme.md` — kept fork's `## ❗ Read Me First!` block (customized for fork users); upstream's reference rewrite is preserved in the new `userguides/` directory.
- `index.build.js` + `index.build.js.map` — accepted upstream's version verbatim, then regenerated from source via `bun run build` (Bun build marks `../` SillyTavern imports as external). The reconstructed bundle reflects the merged `index.js` plus the upstream's three new source files (`sidePromptsManager.js`, `sidePromptsPopup.js`, `templatesSidePrompts.js`).

### Reconciliation with `main` (PHA-1664)

While this branch was in review, [PHA-1664](/PHA/issues/PHA-1664) (`cc475f6` — *wire autosummary.js output as Sentinel signal input*) landed on `main`, leaving the sync branch one commit behind and the PR in a `CONFLICTING` state. `origin/main` was merged in; two files conflicted, both reconciled in favour of PHA-1664's newer intent:

- `autosummary.js` — PHA-1664 **inverts** the old P2.4 gate: auto-summary is no longer blocked while Sentinel is on, so its cadence-detected scene markers can feed Sentinel as an upstream signal. Kept PHA-1664's comment block and its removal of every `isAutoSummaryBlockedBySentinel()` call site (the helper survives as a permanent `return false` for mergeability). The import hunk was resolved as a **union**, not a straight take-theirs: upstream v8.5.0's new call to `getCurrentManualLorebookResolution()` needs that symbol, which `main`'s import line does not carry. `resolveSentinelEnabled` was dropped — unused once the gate is inverted.
- One stale `isAutoSummaryBlockedBySentinel()` guard in `retryAutoSummaryAfterJobIdle()` survived the automatic merge even though `main` had removed it; it was removed by hand so the merged file matches PHA-1664's intent exactly. Behaviourally inert (the helper returns `false`), but it was dead code contradicting the documented design.
- `index.build.js` + `index.build.js.map` — regenerated from the merged source via `bun run build` rather than hand-resolved, as above.

### What's NOT in this sync

- **STMBC-HOOK sites** — all 11 monitored files (`sidePrompts.js`, `addlore.js`, `stmemory.js`, `auditor.js`, `sentinel.js`, `autosummary.js`, `clipManager.js`, `clipperPlus.js`, `injection.js`, `review.js`, `index.js`) keep their markers. Baseline (post-merge, non-test): 51 markers; with test files: 57 markers. Unchanged from `v0.0.6`.
- **Fork hooks** — Sentinel, Auditor, Librarian, Clipper+, Living-lorebook injection, Auto Module. Untouched; not in the two upstream commits' diff.

### Test status

- **984 pass, 0 fail** after the `main` reconciliation above (977 before it; the extra 7 come with PHA-1664's `sentinel.test.js` / `autosummarySentinelGate.test.js` additions). Exceeds the 976 target called out in [PHA-1733](/PHA/issues/PHA-1733).

### Branch / PR

- Branch: `sync/upstream-v8.5.0` rebased (merge commit) to upstream `3f74062`.
- PR target: `main`. Single PR, ready for Brandon review per [PHA-1733](/PHA/issues/PHA-1733).

### Reference

- [PHA-1733](/PHA/issues/PHA-1733) — Next upstream sync (this issue)
- [PHA-1663](/PHA/issues/PHA-1663) — Git sync v8.5.0 merge sprint (parent strategy)
- [PHA-1656](/PHA/issues/PHA-1656) — Upstream sync v8.5.0 sprint (grandparent)
- [PHA-1667](/PHA/issues/PHA-1667) — Bundled changelog refresh + smoke test sweep (sister)

## v0.0.6 (2026-08-01) — release

Sixth public release. Closes the third half of PHA-1651 follow-up: Brandon opened the freshly-installed v0.0.5 and didn't want the per-message `Mark Scene Start / Mark Scene End` caret icons cluttering every chat message. They've been in the extension since v0.0.1; v0.0.6 flips the default to hidden and gates `createSceneButtons()` on `moduleSettings.showSceneMarkerButtons` (true = show, false = hide). v6 migration backfills the setting on existing installs so the change takes effect immediately on next ST boot.

### What's new

- **`showSceneMarkerButtons` setting (default: `false`).** Adds the opt-in to the General Settings popup (`⚙️ General Settings → Show scene marker buttons on each chat message`). When OFF, the per-message `Mark Scene Start / End` caret icons are not added. When ON, they appear as in v0.0.x.
- **v6 migration.** Backfills `showSceneMarkerButtons = false` on existing installs whose `moduleSettings` doesn't already pin a value (doesn't overwrite explicit user choices).
- **`sceneMarkerButtonsOptIn.test.js` (NEW, 10 tests).** Static-source assertions locking the default + the gate + the UI toggle + the i18n keys + the bundle inclusion. Same shape as the other wiring-regression tests.

### How to verify

1. After install, open a chat and hover over any message.
2. The two STMB caret icons (`►` and `◄`) should NOT be in the hover toolbar.
3. If you want them back: Memory Books → ⚙️ General Settings → check "Show scene marker buttons on each chat message" → the icons appear immediately on all visible messages.

### Test status

- **921 pass, 0 fail** (894 pre-existing + 11 v0.0.4 wiring + 6 v0.0.5 wiring + 10 v0.0.6 wiring)

### Reference

- Branch: `main` @ the v0.0.6 release commit
- Closes the third half of [PHA-1651](https://paperclip.phatt.vip/issues/1651) follow-up
- GitHub Release: see the latest `v0.0.6` Release on the `phattbeats/SillyTavern-MemoryBooks-Auto` repo

## v0.0.5 (2026-08-01) — release

Fifth public release. Closes the second half of PHA-1651 follow-up: the four Phase-5 audit-job executors (`stmbc-audit-coverage`, `stmbc-audit-regenerate`, `stmbc-audit-technical`, `stmbc-audit-claims`) were defined + tested in `auditorTechnicalPass.js` but never wired into `index.js` init — Brandon's screenshot showed all four audit jobs failing with "No executor registered for stmbc-audit-*". Same architectural pattern as the v0.0.4 bug (code exists, tests pass, wiring missing).

### What's new

- **`registerAuditorJobs()` wired into `index.js` init.** Calls `registerStmbJobExecutor` for all four audit job types right after the existing `audit` chunk-walker registration. Report popups (`showCoverageReportPopup`, `showRegenerationDiffPopup`, `showTechnicalPassPopup`, `showClaimReverificationPopup`) are passed as opts so the post-execution report popup flow is intact.
- **`auditorJobsRegistration.test.js` (NEW, 6 tests).** Static-source assertions that lock down the wiring surface (imports, call site shape, popup-functions opts, adjacency to the existing audit registration, bundle inclusion). Same shape as `autoModuleUiWiring.test.js`.

### How to verify (after install)

1. Open SillyTavern → Extensions menu → Memory Books → 🛰️ Auto Module.
2. Scroll to **🛡️ Auditor cadence**.
3. Click **"Run coverage audit"** (or any of the four "Run ..." buttons).
4. The job should no longer fail instantly with "No executor registered" — it should run to completion and pop a report.

### Test status

- **911 pass, 0 fail** (894 pre-existing + 11 v0.0.4 wiring + 6 v0.0.5 wiring)

### Reference

- Branch: `fix/pha-1651-auto-module-ui` (PR #5 still open, head now at the v0.0.5 release commit)
- Closes the second half of [PHA-1651](https://paperclip.phatt.vip/issues/1651) follow-up
- No new issue created — this was the "make sure everything else is wired" half of Brandon's PHA-1651 comment thread

## v0.0.4 (2026-08-01) — release

Fourth public release. Closes [PHA-1651](https://paperclip.phatt.vip/issues/1651) — the "Enable Sentinel" toggle was unreachable from the STMB-Auto UI. The template that renders the checkbox (`autoModuleSettingsTemplate` in `templates.js`) was authored but never wired to a popup button. FORK_NOTES.md §index.js documented the intended integration; it was never built. v0.0.4 wires it.

Branch: `fix/pha-1651-auto-module-ui` @ `c4235086`. PR: [#5](https://github.com/phattbeats/SillyTavern-MemoryBooks-Auto/pull/5).

### What's new

- **PHA-1651 — Auto Module UI (commit `c4235086`).** New "🛰️ Auto Module" button in the Memory Books settings popup opens a panel with:
  - **🛰️ Auto Module — Global**: "Enable Sentinel (auto scene-boundary detection)" checkbox + cadence / window / overlap / truncate / guard / detection-profile / detection-prompt / debug-logging controls + "🛡️ Auditor cadence" subsection + "📎 Clipper+ (paired context entries)" subsection (Clipper+ remains off by default — stock clip save is byte-identical when disabled).
  - **🛰️ Auto Module — Per-chat overrides**: per-chat Sentinel enable / watermark fallback / structure-hint regex / prompt override.
- **v5 migration.** Existing installs get `extension_settings.STMemoryBooks.autoModule = {}` backfilled on next boot so the UI has a writable surface. Reads still merge `AUTO_MODULE_DEFAULTS` on top, so missing fields stay backwards-compatible.
- **`autoModuleUiWiring.test.js` (NEW, 11 tests).** Static-source assertions that lock down the wiring surface (imports, migration, popup function, template-data function, event-listener function, button entry, i18n, bundle inclusion). Any future refactor that drops any of those fails loudly.

### How to turn the Sentinel on (after install)

1. Open SillyTavern → Extensions menu → Memory Books.
2. In the bottom row of buttons, click **🛰️ Auto Module**.
3. Top checkbox: **"Enable Sentinel (auto scene-boundary detection)"** → check it.
4. (Optional) check "Sentinel enabled for this chat" to force-on for the current chat.
5. Drive 8+ messages — the Sentinel auto-fires `/stmbc-detect` every ~8 messages past the last memory.

### Test status

- **905 pass, 0 fail** (894 pre-existing + 11 new wiring-regression in `autoModuleUiWiring.test.js`)
- `eval/phase2Acceptance.test.js`: 27/27 — runtime Sentinel gate unchanged (R=1.00 on the Magisa fixture at ±1, 35/35 boundary detection)

### Known follow-ups (deferred to v0.0.5 or later)

- `FORK_NOTES.md` §index.js still describes Clipper+ options that this release now exposes in the UI but don't yet have a complete i18n key set in locales/*.json (only `en-001`/fallback locale got the 4 new keys).
- Clipper+ paired-entry writes are not yet exercised in `eval/phase3Acceptance.test.js` — only `clipperPlus.test.js` covers the unit math. End-to-end KPI on real clips deferred.

## v0.0.3 (2026-08-01) — release

Third public release. Re-redirected from the v0.0.2 cycle (which never made
it to a live install in Brandon's prod ST). Adds the Phase 5/6/7 librarian
work (P5.1/P5.2 auditor + P7.1/P7.2/P7.3/P7.4 librarian) and the PHA-1638
ground-truth correction.

### What's new

- **P7.4 — Phase 7 acceptance gate (commit `7430ac8`).** Adds
  `eval/phase7Acceptance.test.js` and fixes the over-merged ground-truth
  key in `eval/materials/stmb-auto/`. The corrected 35-boundary GT key
  replaces the previously-published 22-boundary one.

- **P7.3 — scene-aware caching via sentinel boundaries (commit `f6e13d2`).**
  `librarianCacheCore` keys cache entries by sentinel boundaries, not raw
  message offsets. Cache invalidation now respects scene boundaries, so a
  cached librarian response stays valid across minor message edits within a
  scene and only re-keys when a boundary shifts.

- **P7.2 — pre-turn retrieval + additive injection (fail-open)
  (commit `1cc5b15`).** `librarianCore` exposes a `retrieve()` call that
  runs before each LLM turn and returns candidate lorebook entries.
  `injection.js` consumes those entries additively (never overwriting user
  lorebook state). Fail-open: if the LLM call fails the chat continues
  with the user's prior context, no error surfaced.

- **P7.1 — entry catalog/index builder (Auditor byproduct)
  (commit `b1bac7e`).** The Auditor's coverage pass now writes a catalog
  file (`<lorebook-name>.catalog.json`) into the lorebook directory that
  the librarian can read without re-walking the lorebook.

- **PHA-1638 — detection KPI re-run against corrected 35-boundary GT key
  (commit `e21607a`).** Re-runs the Phase-0 detection acceptance gate with
  the corrected key. See "Known-unverified" below.

### Known-unverified

- **Detection precision regression against the corrected GT key.** Against
  the corrected 35-boundary GT key, real-LLM detection scores **P=0.842 at
  ±1** (below the 0.90 gate), passing only at ±2 (0.921), across three
  byte-identical temp-0 runs. The prior PASS (P=0.969 at ±1) was scored
  against a since-proven-wrong key (the `mergeShortScenes` bug over-merged
  67 raw → 22 instead of the corrected 35), so it is not a valid promotion.
  Tracked separately; **do not fix in this release**. Will be filed under
  PHA-1553 if it needs its own tracker.

- **Phase-7 acceptance test for the 328-message Magisa fixture.** The
  fixture file (`Satire Fantasy Isekai - 2026-07-12@10h18m29s211ms.jsonl`)
  is not committed to `main` (the test that consumes it,
  `librarianCacheCore.test.js`, was added with the Phase-7 librarian but
  the fixture only lives in the Phase-7 dev environment). 882 of 883 tests
  pass; the one failure is this missing-fixture assertion and is unrelated
  to the v0.0.3 deliverables. Filed separately for the fixture-check-in
  follow-up.

### Install

This release is the installable artifact for [PHA-1555](#). The exact
installer URL (paste into ST's extension installer) is the source archive at
this tag:

```
https://github.com/phattbeats/SillyTavern-MemoryBooks-Auto/archive/refs/tags/v0.0.3.zip
```

Manifest `display_name` remains `MemoryBooks Auto`; ST renders the
Extensions panel entry as `MemoryBooks Auto (0.0.3)` after install.

## v0.0.2 (2026-07-26) — release

Second public release. Consolidates post-v0.0.1 work across four feature
branches + the surgical rebase work that closes the half-rebase gap from
v0.0.1's release. Closes PHA-1556 (test-fixes follow-up to PHA-1555).

### What's new

- **Sentinel P2.1 + P2.3 integration** (PR #4 + commit `5289ae8`). `index.js`
  now calls `registerSentinelCadence({ registerStmbJobExecutor }, { runDetectionCycle: runSentinelDetectionForJob })`
  at init so the sentinel cycle job type (`stmbc-sentinel-cycle`) is
  registered with the STMB jobs dashboard and the P2.1 detection engine is
  installed behind it. Without this wiring — which was missing in the prior
  rebase chain — the sentinel cycle would land in the queue but have no
  executor at runtime (silent failure). The `sentinel.js` MESSAGE_RECEIVED
  gate now reads `getSentinelCadenceFloor(chat_metadata)` and passes it as
  the fourth arg to `isCadenceReached`, so PHA-1547's edge-trigger cadence
  (no per-MESSAGE_RECEIVED detection burn) actually fires at runtime.

- **`/stmbc-detect` slash command.** Forces a sentinel cycle on the current
  chat through `enqueueSentinelCycle({ trigger: 'manual', force: true })`.
  Lands in the same `stmbc-sentinel-cycle` job type and ring-buffer entry
  as the auto path — only the trigger label differs. The per-chat `enabled`
  resolver still applies.

- **`/stmbc-stop` narrowed scope.** The fork now imports `cancelStmbcJobs`
  from `stmbJobs.js` alongside the existing `cancelAllStmbJobs`, ready for
  a fork-only `/stmbc-stop` that halts `stmbc-*` jobs without disturbing
  upstream memory/consolidation/sidePrompt generation. The existing
  `/stmb-stop` (which uses `cancelAllStmbJobs`) still cancels everything;
  its doc comment now spells out the scope split.

- **P6.1 hardening on `release/v0.0.2`** (commits `c88ab7a` + `8298609`).
  The sentinel, auditor, and clipper surface a warning toast on the next
  chat open for any silent mid-job failure (`LLM_API_TIMEOUT`,
  `LLM_JSON_PARSE_FAILED`, `LLM_CONTEXT_OVERFLOW`, `LOREBOOK_WRITE_FAILED`),
  and log a structured `STMemoryBooks:mid-job-failure` line. Tested by
  `sentinelHardening.test.js`.

- **P5.5 regen-consolidation eligibility** (PHA-1534). Imported upstream
  `memoryRegeneration.js` (447 lines) verbatim from upstream `9fc9abb`,
  gated `runEntryRegeneration` on `getRegenerationEligibility`, surfaced
  `active-parent` skips in `r.skipped`. P5.5 acceptance: 22 / 22 P5 unit
  + 147 / 147 full eval suite + 4 / 4 §6 criteria (P5.5 work landed on
  main before v0.0.2 was rebased; preserved here for full traceability).

- **Eval P6.1 acceptance re-run** (commit `e921ae4`). Phase-0 acceptance
  gate re-ran on the bundled fixture (329 msgs, 22 GT) with the real
  OpenAI-compatible detector (`claude-sonnet-4-5` via LiteLLM): 18
  windows, 0 skipped, 32 predictions — precision (raw)@±1 = **0.969**
  (31/32), recall (raw)@±1 = 0.579. Sole FP vs raw @±1: id 2.

- **Cadence PHA-1547 partial.** The cadence floor (`getSentinelCadenceFloor`,
  `setSentinelCadenceFloor`, `clearSentinelCadenceFloor`,
  `cadenceFloorFromCycle`) is fully implemented in `sentinelCadence.js` and
  accepted by `sentinelCore.isCadenceReached`'s fourth parameter, but
  `sentinel.js`'s MESSAGE_RECEIVED gate was not consulting the floor until
  the v0.0.2 rebase fix (`5289ae8`) wired it up. With that fix, a long
  uninterrupted scene burns one LLM call per scene-boundary event instead
  of one per assistant turn.

- **Auditor P5.1 + P5.2** (PHA-1470 lineage). Chunk-walker, coverage audit,
  entry regeneration. `auditor.js` exposes the four on-demand audit jobs
  via `/stmbc-coverage`, `/stmbc-regen`. P5 acceptance harness lives at
  `eval/phase5Acceptance.js`.

- **Scaffold rebase fixes** (commits `459e697`, `f3f860c`, `5289ae8`).
  Older `eval/score.js`, `clipperPlusCore.js`, `sentinel.js`, `sentinelCore.js`
  restored from main; `index.js` P2.1 + P2.3 wiring restored from main;
  PHA-1547 edge-trigger cadence re-applied via `git apply --3way`.

- **Pre-commit `bun run build`** regenerated `index.build.js` +
  `index.build.js.map`. Both committed on every commit that touches
  `index.js` or `style.css`.

### Fork-wide test + acceptance summary

| Suite                                                          | Result          |
|----------------------------------------------------------------|-----------------|
| `node --test *.test.js eval/*.test.js` (fork + eval)           | **727 / 727 pass** |
| `bash eval/run.sh` (eval unit + oracle pipeline)               | **149 / 149 pass** |
| P6.1 acceptance re-run (real LLM, 2026-07-22)                   | precision (raw)@±1 = 0.969, recall 0.579 |
| Live-rig KPI harness (headless, 2026-07-26)                    | health ✅, cadence ✅ (4 / 4 criteria) |
| `bun run build`                                                | regenerates build artifacts clean |

### Files of interest

- `index.build.js` + `index.build.js.map` — the shipped bundle.
- `eval/run.js` — entry point for the eval suite.
- `eval/materials/stmb-auto/stmb-auto-plan.md` — the plan that the six
  phases were scoped against (single source of truth, kept under
  `eval/materials/` to ride along the repo).
- `sentinelCadence.js` — sentinel executor + ring buffer + cadence floor.
- `sentinelCore.js` — pure, dependency-injected detection engine.
- `stmbJobs.js` — fork-aware cancellation (`cancelAllStmbJobs` +
  `cancelStmbcJobs`).
- `auditorCore.js` / `auditorJobs.js` — chunk walker + 4 audit jobs.
- `clipperPlus.js` / `clipperPlusCore.js` — Phase 3 Clipper+.

### Upgrading from v0.0.1

1. Remove `public/scripts/extensions/third-party/SillyTavern-MemoryBooks-Auto/`.
2. Reinstall via the URL posted on the v0.0.2 GitHub release.
3. Lorebook data shape is unchanged between v0.0.1 and v0.0.2 — your
   existing entries remain valid. The `chat_metadata.stmbc` keys are
   forward-compatible (cadence floor + review-queue entries are
   additive).
4. After upgrade, the new `/stmbc-detect` and `/stmbc-stop` slash
   commands are available in any chat that has the STMB settings panel
   open.

### Live test rig (the PHA-1555 data)

A 5510 live rig was set up at `/tmp/st-clean-test-v0.0.1-live/` with the
v0.0.2 candidate build (commit `1bae010`, pre-`5289ae8`). Headless KPIs:

- Server health: ST 1.18.0 listening, ext v8.2.2-a.1 installed, no errors.
- Detection (oracle): P=0.33 R=1.00 F1=0.49 (known over-predict).
- Detection (real LLM, `claude-sonnet-4-5`): P=0.29 R=0.36 — flagged as
  possible model-alias drift on LiteLLM. Re-run before tagging for
  release-candidate acceptance.
- Cadence: 4 / 4 §6 criteria pass.
- P6.1 hardening: source-verified, not live-verified (no human
  playthrough of the broken pre-`5289ae8` build was attempted; release
  notes P6.1 acceptance re-run is on the fixed build).

The human playthrough was deferred per the issue's "PROBLEM: I want to
use my existing characters, settings, addons, etc. so I want this to be
a LIVE, LIVE test" comment — the 5510 rig uses a clean data dir, not
Brandon's existing install. Live KPIs will land in v0.0.2.x as a
follow-up once the release is installed in his real ST.

**Tag:** v0.0.2 → `5289ae890dd2b4a38c4268dced5f52396b8b4c80` (current
HEAD of `release/v0.0.2`).
**PR:** #4 (`release/v0.0.2` → `main`, 20 commits, `mergeable: clean`).
**Live-rig verify directory:**
`/tmp/st-clean-test-v0.0.1-live/SillyTavern-release/`. The clean-data
5510 rig is now stale (it has the pre-fix build); tear-down commands
in PHA-1555.

## v0.1.0 (2026-07-22) — internal Phase-6 marker (= v0.0.1 public contents)

> The `v0.1.0` git tag was the internal Phase-6 marker cut at the end
> of the P5.5 acceptance run, before the fork was rebranded for the
> v0.0.1 public release. The section below describes the contents of
> the build that became v0.0.1 — they are functionally identical.

First fork release. All fork additions live in new files or behind greppable
`STMBC-HOOK` markers; upstream function bodies, control flow, and data structures
are untouched. Settings key `STMemoryBooks` and lorebook flags `stmemorybooks` /
`[STMB Clip]` preserved per plan §1.2.6 (data compat).

**Verified (post-merge re-verification, PHA-1474):**
- `node --test *.test.js eval/*.test.js` → **390 / 390 pass** from a fresh drop-in
  on stock SillyTavern release branch (307 fork unit tests + 83 eval harness
  tests). See [`docs/release/v0.1.0/report.md`](./docs/release/v0.1.0/report.md).
- All **19** ESM import paths in the bundled `index.build.js` resolve to modules
  that exist in upstream `SillyTavern` release branch (the extra
  `../../../sse-stream.js` path was introduced by upstream code in this window).
- Build artifact `index.build.js` (859,760 bytes) parses cleanly under
  `node --check`.
- README §'Migration from stock STMB' data-compat claims verified against source
  (no renames of `STMemoryBooks`, `stmemorybooks`, or `[STMB Clip]` anywhere in
  the fork).
- Upstream merge drill (PHA-1472): `git merge upstream/main` from `main` is a
  no-op (merge base `617cfbf`, 2026-07-18) — fork is already in sync.
- All five STMBC-HOOK markers (extension init, prompt assembly, clip save,
  side-prompt filter, per-scene filter) verified valid against current
  upstream code per PHA-1433 §2 audit.

**Tag:** v0.1.0 → `7107ac0b9a625b9a9c25cf10762ee7f56eb08595` (current HEAD of `main`).

### Phase 0 — Eval harness (PHA-1416, PHA-1423)
- `eval/parser.js` — SillyTavern JSONL parser (1-based indexing, header parsing via
  pipe-split, internal-thought strip). 13 unit tests.
- `eval/groundTruth.js` — header-derived ground truth (location change OR >90-min
  forward time jump, midnight wrap, scenes <6 msgs merge). 12 unit tests.
- `eval/detect.js` — detection runner interface + `HeaderOracleDetector` (perfect-
  recall sanity stub) + `StubDetector` (re-score from predictions JSON) +
  `buildDetectionWindows` (size 26, overlap 8, guard 4, truncate 500).
- `eval/score.js` — pure scoring module: precision/recall/F1 + per-boundary table at
  ±1/±2 message tolerance, greedy nearest-first matching. 22 unit tests.
- `eval/run.js` — one-command CLI runner: parse → ground-truth → detect → score →
  markdown + JSON reports. Phase 0 acceptance gate (P≥0.90 at ±1) wired into exit code.
- `eval/run.sh` — convenience entry point (runs tests + pipeline).
- `eval/README.md` — run guide + module reference + acceptance gate spec.
- `eval/fixtures/` — Satire Fantasy Isekai 329-message JSONL + worldbook + reference
  markdown + lorebook case study.
- `eval/materials/stmb-auto/stmb-auto-plan.md` — plan doc at the path referenced by
  PHA-1416.

### Phase 1 — Fork setup (PHA-1426)
- `origin` → `phattbeats/SillyTavern-MemoryBooks-Auto`. `upstream` →
  `aikohanasaki/SillyTavern-MemoryBooks` added.
- Pre-commit hook installed via `bun install` (postinstall → `install-hooks.js`).
  `bun run build` verified.
- `manifest.json` renamed display only: `display_name: "MemoryBooks Auto"`, `author:
  "phattbeats"`, fork homePage, `version: "8.2.2-a.1"`. Settings key + lorebook
  flags preserved.
- `FORK_NOTES.md` — merge map; lists every upstream-touched line; documents
  identity rules; phase status table.
- 4 empty `STMBC-HOOK` call sites placed in upstream files:
  - `index.js:11015` — init (Phase 2 sentinel)
  - `stmemory.js:1461` — prompt assembly (Phase 4 orchestration)
  - `clipManager.js:718` — clip save path (Phase 3 Clipper+)
  - `sidePrompts.js:1655` — side-prompt filter (Phase 4 orchestration)

### Phase 2 — Sentinel (PHA-1436, PHA-1439, PHA-1456)
- `autoSettings.js` — global settings under `extension_settings.STMemoryBooks.autoModule`
  (sentinel on/off, cadence, window size, overlap, truncate, guard, detection profile,
  detection prompt, debug logging) + per-chat overrides under `chat_metadata.stmbc`
  (enabled, watermark fallback, structure-hint regex, prompt override). Validation
  sanitization; resolver helpers (`resolveSentinelEnabled`, `resolveDetectionPrompt`,
  `resolveAutoSummaryEnabled`). 31 unit tests.
- `templates.js` — `autoModuleSettingsTemplate` (Handlebars) renders the auto-module
  popup (global + per-chat sections, detection profile picker reuses profileManager).
- `templates.js` — `automaticMemoriesSettingsTemplate` extended with a warning block
  + `disabled` attributes on the auto-summary rows when sentinel is on (P2.4).
- `index.js` — UI integration: Auto Module button in `promptManagerButtons`,
  `showAutoModuleSettingsPopup()`, `buildAutoModuleTemplateData()`,
  `setupAutoModuleEventListeners()`, `initializeAutoSettings` + `initializeChatAutoSettings`
  backfill into `initializeSettings()`.
- `index.js` — change handler for `#stmb-auto-summary-enabled` refuses to set
  `autoSummaryEnabled=true` while sentinel is on (P2.4).
- `autosummary.js` — additive runtime gate: `isAutoSummaryBlockedBySentinel()`
  helper + early-return in `handleAutoSummaryMessageReceived` and
  `clearAutoSummaryState` when sentinel is on. Module otherwise untouched (mergeability).
- `sentinelCadence.js` (P2.3) — sentinel cycle job type + ring buffer cycle log +
  on-demand surface. Constants `SENTINEL_CYCLE_JOB_TYPE='stmbc-sentinel-cycle'`,
  `SENTINEL_CYCLE_LOG_KEY='cycleLog'`, `SENTINEL_CYCLE_LOG_LIMIT=20`. Pure functions
  `getSentinelCycleLog` / `appendSentinelCycleLog` / `clearSentinelCycleLog` read/write
  `chat_metadata.stmbc.cycleLog` with FIFO cap. Factory `enqueueSentinelCycle` honors
  the resolver (forbids enqueue when sentinel is off, unless `force: true`). Executor
  `runSentinelCycle` (P2.3 stub) honors the abort signal, appends a ring-buffer entry,
  and saves metadata — P2.1 will replace the body with the actual detection runner.
  `registerSentinelCadence({ registerStmbJobExecutor })` wires the executor into the
  STMB jobs dashboard at init. 51 unit tests (pure ESM, no SillyTavern runtime).
- `stmbJobs.js` (P2.3) — new `cancelStmbcJobs(reason)` export that filters by the
  `stmbc-` type prefix and halts only fork cycle jobs (sentinel + audit). Mirrors
  `cancelAllStmbJobs` but is wired to `/stmbc-stop` so the fork can halt its own
  work without disturbing upstream memory/consolidation/sidePrompt jobs.
- `index.js` (P2.3) — two new slash commands: `/stmbc-detect` (force a sentinel
  cycle on the current chat via `enqueueSentinelCycle` with `force: true`) and
  `/stmbc-stop` (halt fork cycle jobs via `cancelStmbcJobs`). `handleStmbStopCommand`
  comment expanded to note that the upstream `/stmb-stop` panic button also covers
  the new `stmbc-sentinel-cycle` jobs via `cancelAllStmbJobs`.

### Phase 3 — Clipper+ (PHA-1445)
- `clipperPlusCore.js` — pure, dependency-injected Clipper+ core (plan §4.2):
  - `resolveClipperConfig(global, perChat)` — merge `CLIPPER_DEFAULTS` over
    `extension_settings.STMemoryBooks.autoModule.clipper` + per-chat
    `chat_metadata.stmbc.clipper`; per-chat wins for `enabled`/`autoAccept`/`prompt`.
  - `findSourceMessageIndex(chat, quote)` — unique normalized substring match
    (precision-over-recall per plan §5.2); returns -1 on 0 or >1 match.
  - `buildContextWindow(chat, sourceIdx, K)` — centered K-surrounding window,
    skipping `is_system`, retaining true chat indices.
  - `formatContextWindow` + `buildBlurbPrompt` — `[id] Speaker: text` lines + the
    bundled `CLIPPER_PROMPT` baseline.
  - `parseBlurbResponse(reply)` — strict JSON / single fence / embedded-object
    parser with one "JSON only" retry (`JSON_ONLY_REPRIMAND`); null on parse failure.
  - `sanitizeKeywords`, `clampBlurb` — dedupe/cap and ≤N-word clamp.
  - `buildPairedEntry` — produces the exact entry shape: `title = <headline> [STMB Clip Context]`,
    content = blurb + `Context for clip: <quoteTitle>` + provenance `src: msgs X–Y`,
    keywords = sanitized proper nouns.
  - 36 offline `node:test` cases; all green.
- `clipperPlus.test.js` — 36 node:test cases over the pure core. The pure core is
  SillyTavern-free and fully Node-testable.
- `clipperPlus.js` — SillyTavern binding layer (registers at module load):
  - `globalThis.STMBC.onClipSave = onClipSave` — fills the Phase 1 upstream hook
    at `clipManager.js:saveNewClip` (no upstream file modification; merge discipline preserved).
  - Adapts the Phase 1 payload `{lorebookName, lorebookData, dlg, headline, title}`
    into the existing pure-core entry by deriving `quote` from
    `dlg.querySelector('#stmb-clip-text').value` and using `title` as `quoteTitle`.
  - Self-gates on `extension_settings.STMemoryBooks.autoModule.clipper.enabled`
    (default **off** ⇒ upstream clip save is byte-identical when Clipper+ is disabled).
  - Editable confirm dialog (`Popup` + `DOMPurify`) skippable via `autoAccept`.
  - Writes via `addlore.upsertLorebookEntryByTitle` with `constant:false`,
    `selective:true`, `vectorized:true`, `key:built.keywords`,
    `preventRecursion:true`, `excludeRecursion:true` — keyword-activated,
    recursion-proof (a blurb naming several characters must not cascade half
    the cast; plan Appendix B).
  - Self-contained try/catch — every failure surfaces a warning toast and logs
    to console; the clip save itself is **never** thrown from (Phase 3 acceptance:
    toggled off = byte-identical upstream behaviour).
- `autoSettings.js` (additive) — nested `clipper` defaults on
  `AUTO_MODULE_DEFAULTS` (sibling to the existing flat sentinel fields) +
  nested `clipper` overrides on `CHAT_AUTO_DEFAULTS` (per-chat can toggle
  on/off, override `autoAccept`, or substitute the prompt; numeric + profile
  fields stay global). `initializeAutoSettings` / `initializeChatAutoSettings`
  backfill missing fields via the existing `Object.entries` loop, so older
  settings objects gain the defaults on first read. 35/35 existing tests
  still pass.
- `index.js` (additive) — `import "./clipperPlus.js"` next to the sentinel
  import, with `STMBC-HOOK(clipper)` comment. Side-effect import; the module
  only registers `globalThis.STMBC.onClipSave` at top level.
- `FORK_NOTES.md` — `clipManager.js:718` row now marked "Wired in P3.2"; new
  files listed in the additive section; new `autoSettings.js` (P3.2) and
  `index.js` (P3.2) rows in the merge map; total bumped 10→12 files modified.
- `index.build.js` regenerated via `bun run build`; `index.build.js.map`
  regenerated. Both committed.

**Phase 3 acceptance (plan §4.2):**
- Keyword-activated: yes, entry.key = built.keywords.
- preventRecursion + excludeRecursion: yes, both set on entryOverrides.
- Content = blurb + provenance `src: msgs X–Y`: yes, `buildContextEntryContent`
  produces this exactly.
- Title cross-references quote entry, never constant:
  `<headline> [STMB Clip Context]` shares headline (cross-ref) but uses a
  distinct suffix so `isClipEntryTitle` / compaction / clip lists ignore the
  context entry — the quote entry stays the compaction target.
- Fires only on its keywords: keyword-activated + `constant:false`.
- Cascades nothing: `preventRecursion:true` + `excludeRecursion:true`.
- Compaction still lists the quote entry: the distinct `[STMB Clip Context]`
  suffix (vs. upstream's `[STMB Clip]`) keeps the context entry out of
  compaction / clip lists.
- Toggled off = byte-identical: hook gated on `autoModule.clipper.enabled`
  (default **false**); self-contained try/catch swallows every error so the
  clip save path is never broken.

The remaining Phase 3 acceptance criterion ("verify with ST world-info debug")
requires a live SillyTavern install with the fork dropped in and Clipper+
toggled on — tracked under the parent Phase 3 issue (PHA-1420) integration
testing, not headless-runnable here.

### Phase 4 — Living-lorebook orchestration (PHA-1450)
- `sceneCharacterFilter.js` — per-scene character presence filter:
  `getPresentCharacterNames` (prefers `compiledScene.metadata.characterFilterNames`
  from chatcompile.js's group-participant resolver, else cheap name-scan),
  `getBoundCharacterName` (extracts `{{char}}` from `runItem.runtimeMacros`),
  `filterRunItemsByScenePresence` (non-character-scoped items pass through unfiltered;
  character-scoped items skip when their bound character isn't in the scene).
  18 unit tests.
- `sidePrompts.js` — wires the filter into `runAfterMemory()` after the existing
  set/trigger filter. Skipped items emit a console.log one-liner.
- `utils.js` — new `event` preset added to `getBuiltInPresetPrompts`,
  `getPresetNames`, `isValidPreset` (plan Appendix B Event template:
  Name / Summary / Key Events / Significance / Key Quotes / Exclusions).
- `constants.js` — `event` added to `DISPLAY_NAME_DEFAULTS`,
  `DISPLAY_NAME_I18N_KEYS` (i18n key `STMemoryBooks_DisplayName_event`).
- `eventPreset.test.js` — 7 structural tests pinning the new key registration.

### License headers (plan §1.2.6)
Every new file ships with the AGPL-3.0-only SPDX header:
- `eval/*` (all files)
- `autoSettings.js`, `sceneCharacterFilter.js`
- All new test files (`*.test.js`)

Upstream files were modified only via greppable single-line `STMBC-HOOK` markers
plus minimal additive content. `LICENSE` itself is unchanged.

### Test coverage

```
$ node --test *.test.js eval/*.test.js
ℹ tests 121
ℹ pass 121
ℹ fail 0
```

(Upstream `stloCharacterFilters.test.js` 13, plus fork additions: score 22, parser
13, groundTruth 12, autoSettings 31, sceneCharacterFilter 18, eventPreset 7,
autosummarySentinelGate 5 = 121 total.)

### Known gaps

- **Sentinel runtime** (Plan §4.1, Phase 2 P2.1) — the consumer that reads
  `autoSettings.js`'s `autoModule` settings and runs detection cycles on
  `GENERATION_ENDED`. Marked separately; out of scope for v0.1.0-a.1.
- **Clipper+ runtime** (Plan §4.2, Phase 3 P3.2, PHA-1445) — the paired-context-entry
  writer hooked at `clipManager.js:718`. **Done** (see Phase 3 section above); live-ST
  world-info-debug verification tracked under PHA-1420 integration testing.
- **Auditor** (Plan §4.3, Phase 5) — chunked full-chat re-read + four jobs.
  Marked separately; out of scope for v0.1.0-a.1.
- **Live SillyTavern verification** — the Phase 1/6 acceptance criterion
  "fork builds and loads in live SillyTavern" requires a SillyTavern install
  with the fork dropped in. Cannot run in this container. Flagged for QA.
- **Upstream merge drill** (P1.4) — requires a push to GitHub first
  (the fork's remote is configured but not pushed). Flagged for QA.

These are tracked separately in the parent issue (PHA-1408) and Phase 6 acceptance
issue (PHA-1474).
