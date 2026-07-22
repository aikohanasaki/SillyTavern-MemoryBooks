# FORK_NOTES.md — SillyTavern-MemoryBooks-Auto (fork of STMB)

This file is the **merge map** for keeping the fork in sync with upstream
`aikohanasaki/SillyTavern-MemoryBooks`. After every `git merge upstream/main`,
walk this list. Every line touched by the fork is documented here; everything
else should merge clean.

## Remotes

- **`origin`** — this fork: `phattbeats/SillyTavern-MemoryBooks-Auto`
- **`upstream`** — original: `aikohanasaki/SillyTavern-MemoryBooks`

## Identity rules (plan §1.2.6)

- **Settings key** `STMemoryBooks` — **unchanged** (existing user data keeps working)
- **Lorebook flags** `stmemorybooks`, `[STMB Clip]` — **unchanged**
- **Display name** in `manifest.json` — `MemoryBooks Auto` (fork-only)
- **Repo name** — `SillyTavern-MemoryBooks-Auto` (fork-only)
- **Banner, README header** — fork-flavored

If upstream renames any of the preserved items (settings key or lorebook
flags), this fork follows; we never rename them ourselves in either direction.

## Hook call sites

Every fork-specific code path enters upstream through one of these single-line
greppable markers. Each is a no-op until the corresponding phase wires it up.

| File | Marker | Phase | What the hook will do |
| --- | --- | --- | --- |
| `index.js:11015` | `STMBC-HOOK: extension init` | Phase 2 (sentinel) | Init sentinel/clipper+/auditor after upstream extension init |
| `stmemory.js:1461` | `STMBC-HOOK: prompt assembly` | Phase 4 (living-lorebook orchestration) | Inject living-entry context, delta-not-rehash instructions, error-control rules before memory generation |
| `clipManager.js:718` | `STMBC-HOOK: clip save path` | Phase 3 (Clipper+) | Generate paired context entry (≤50-word blurb + 3-6 keywords) on top of the upstream clip |
| `sidePrompts.js:1655` | `STMBC-HOOK: side-prompt filtering` | Phase 4 (living-lorebook orchestration) | Filter per-scene runs to characters present in the just-processed scene |

All four call sites use `globalThis.STMBC?.{method}?.(...)` with `.catch?.(() => null)`
so a missing hook module is a clean no-op — the upstream behavior is byte-identical
when the fork modules aren't loaded. Confirmed: a no-op fork (`globalThis.STMBC`
undefined) passes through all four hooks unchanged.

## Files the fork adds (no upstream edits — additive only)

```
eval/                          Phase 0 eval harness (offline; no SillyTavern needed)
  parser.js + parser.test.js   SillyTavern JSONL parser
  groundTruth.js + .test.js    header-derived ground truth
  score.js + .test.js          scoring + report formatters
  detect.js + detect.test.js   detection runner interface (oracles + window builder)
  run.js + run.sh              one-command CLI runner with acceptance gate
  README.md                    run guide
  fixtures/                    bundled Satire Fantasy Isekai JSONL + worldbook + plan
  materials/stmb-auto/         plan doc at the path referenced by PHA-1416
autoSettings.js + .test.js     Phase 2 (P2.2) — Auto-module settings storage (global + per-chat), defaults, validation, get/set, resolver helpers
sceneCharacterFilter.js + .test.js Phase 4 (P4.2) — per-scene character presence filter for character-scoped side-prompt runs
auditorTechnicalPass.js + .test.js Phase 5 (P5.3/P5.4) — technical pass + claim re-verification jobs, coverage audit (runCoverageAudit) + entry regeneration (runEntryRegeneration) pure functions, cadence gate (maybeOfferAuditorJob), 4-job registerAuditorJobs
auditorReportUIs.js + .test.js Phase 5 (P5.4) — report UI renderers + popup adapters for the four audit jobs (coverage, regeneration diff, technical, claims)
eventPreset.test.js           Phase 4 (P4.2) — structural tests asserting the new `event` preset (plan Appendix B) is registered in utils.js + constants.js
autosummarySentinelGate.test.js Phase 2 (P2.4) — structural tests asserting the sentinel-aware gate is present in autosummary.js (mergeability preserved)
FORK_NOTES.md                  this file
```

These files are **entirely additive** — they live alongside the upstream code
without touching any upstream file. The eval harness has no runtime dependency
on SillyTavern at all; it runs offline against JSONL exports.

## Files the fork modifies (upstream files, single-line call sites only)

| File | Lines | Reason | Verified-mergeable? |
| --- | --- | --- | --- |
| `manifest.json` | 1-13 (display_name, author, homePage, version, description) | Fork identity. Settings key and lorebook flags unchanged. | Yes — additive metadata; upstream merges the file cleanly if the lines don't conflict. |
| `index.js:11015` | +3 (the hook line + closing brace) | Phase 2 init | Yes — appends a single no-op block at the end of the init flow. |
| `stmemory.js:1461` | +5 (the hook line + variable) | Phase 4 prompt assembly | Yes — appends at the start of `buildPrompt`, no behavioral change when `STMBC` is undefined. |
| `clipManager.js:718` | +6 (the hook line + variable) | Phase 3 clip save path | Yes — appends at the top of `saveNewClip`, before any validation. |
| `sidePrompts.js:1655` | +6 (the hook line + early-return guard) | Phase 4 side-prompt filtering | Yes — appends at the top of `runSidePrompt`. |
| `sidePrompts.js:1404` | +12 (filter call between set/trigger filter and the runItems.length===0 early return) | Phase 4 (P4.2) per-scene side-prompt filtering | Yes — additive; reuses `compiledScene.metadata.characterFilterNames` from chatcompile.js; non-character-scoped items pass through unfiltered; gated by `filterRunItemsByScenePresence` from the new module. |
| `utils.js` (P4.2) | +new entry in `getBuiltInPresetPrompts`, `getPresetNames`, `isValidPreset` | Phase 4 (P4.2) event-template preset | Yes — additive key (`event`) into existing maps/lists. No existing function bodies modified. |
| `constants.js` (P4.2) | +2 entries (`event` in `DISPLAY_NAME_DEFAULTS`, `DISPLAY_NAME_I18N_KEYS`) | Phase 4 (P4.2) event-template preset display | Yes — additive map entries. |
| `autoSettings.js` (P2.4) | +new `resolveAutoSummaryEnabled(settings, chatMeta)` export | Phase 2 (P2.4) — sentinel-aware auto-summary resolver | Yes — additive export alongside the existing resolvers. |
| `index.js` (P2.4) | change handler for `#stmb-auto-summary-enabled` (~12 lines) refuses to enable while sentinel is on; `buildSettingsTemplateData` switched to read `resolveAutoSummaryEnabled` and expose `autoSummaryForceDisabledBySentinel` for the template | Phase 2 (P2.4) — UI gate | Yes — additive guard inside existing handler; one-line read in template data. |
| `templates.js` (P2.4) | `automaticMemoriesSettingsTemplate` gains a warning block + `disabled` attributes on the auto-summary rows when sentinel is on | Phase 2 (P2.4) — UI hide | Yes — additive conditional blocks; existing rows preserved. |
| `autosummary.js` (P2.4) | +`isAutoSummaryBlockedBySentinel` helper + `resolveSentinelEnabled` import from autoSettings.js; `handleAutoSummaryMessageReceived` and `clearAutoSummaryState` early-return when sentinel is on | Phase 2 (P2.4) — runtime gate | Yes — additive guard clauses only; module structure preserved for mergeability (per plan §1.2 rule 4). |
| `index.js` (P2.2) | +~197 (imports, menu button, popup, event delegation, init backfill) | Phase 2 P2.2 — Auto-module settings panel + detection profile picker | Yes — additive; reuses existing patterns (`automaticMemoriesSettingsTemplate`, `setupSettingsEventListeners`, `initializeSettings`, `validateSettings`, `saveSettingsDebounced`); no upstream function bodies changed. New menu item is appended to `promptManagerButtons`. |
| `templates.js` (P2.2) | +~133 (one new Handlebars template: `autoModuleSettingsTemplate`) | Phase 2 P2.2 — auto-module settings UI | Yes — additive; new export at the bottom of the file. |
| `.gitignore` | +2 (`eval/reports/`, `eval/predictions*.json`) | Don't commit generated reports. | Yes — gitignore merges trivially. |

**Total: 8 files modified, ~330 lines added (most additive), 6 lines changed in metadata. No
upstream function bodies, control flow, or data structures touched.**

## Merge drill (per plan §1.2.3)

After `git fetch upstream && git merge upstream/main` on a scratch branch,
expect:
- Conflicts confined to the `manifest.json` metadata block (display_name,
  author, version) and possibly the hook sites if upstream edits the
  surrounding lines.
- Zero conflicts in any upstream function body.
- All tests still pass.

## Pre-commit hook

`hooks/pre-commit` runs `bun run build` and stages `index.build.js` +
`style.build.css`. Installed via `bun run install-hooks` (or manually copy
`hooks/pre-commit` to `.git/hooks/pre-commit` on hosts without bun). The build
artifacts are committed; never hand-edit them.


## §2 audit (re-verified 2026-07-22 — PHA-1433)

Plan §2 was "verified July 2026" but the upstream map is from an earlier snapshot.
Re-verified against the current `upstream/main` (merge base 617cfbf, 2026-07-18):

| File | Plan §2 claim | Current (upstream/main 617cfbf) | Drift |
| --- | --- | --- | --- |
| `index.js` | ~11K lines | 11,424 lines | +424 |
| `index.js` | `registerSlashCommands()` ~9670 | function at 9898, invocation at 11252 | function +228, invocation same anchor (after `handleSceneMemoryCommand` block grew) |
| `index.js` | `handleSceneMemoryCommand` location | 1289 | (plan didn't pin) |
| `index.js` | `runSceneMemoryRange` location | 1158 | (plan didn't pin) |
| `stmemory.js` | (no size given) | 1,521 lines | (added) |
| `clipManager.js` | ~111K lines (typo — should be ~1.1K) | 2,474 lines | +~1.4K |
| `sidePrompts.js` | (no size given) | 2,109 lines | (added) |
| `sidePromptsManager.js` | (no size given) | 1,092 lines | (added) |

**Hook site stability:** the fork's `STMBC-HOOK` call sites land at lines that are
in the *current* upstream code (verified by `grep -n` against HEAD which is
upstream-merge-base + fork-only commits). Since the fork was branched from the
current upstream/main, no upstream-side drift has touched the hook anchors.

| Hook | Plan §2 (Phase reference) | Fork line | Valid against upstream? |
| --- | --- | --- | --- |
| `STMBC-HOOK: extension init` (Phase 2) | `index.js` extension init | `index.js:11254` (after `registerSlashCommands()` invocation at 11252) | ✓ |
| `STMBC-HOOK: prompt assembly` (Phase 4) | `stmemory.js` prompt assembly | `stmemory.js:1461` (in `buildPrompt()`) | ✓ |
| `STMBC-HOOK: clip save path` (Phase 3) | `clipManager.js` clip save path | `clipManager.js:718` (in clip save dialog handler) | ✓ |
| `STMBC-HOOK: side-prompt filtering` (Phase 4) | `sidePrompts.js` | `sidePrompts.js:1671` (in `runSidePrompt()`) | ✓ |
| `STMBC-HOOK: per-scene filter` (Phase 4, P4.2) | (added in P4.2) | `sidePrompts.js:1404` (post-P4.2) | ✓ |

**Build verification (P1.3):** `bun run build` was verified clean by the v0.1.0
release clean-install smoke test (PHA-1466, `docs/release/v0.1.0/report.md`).
`hooks/pre-commit` runs `bun run build` and stages `index.build.js` +
`style.build.css`. Build artifacts present at HEAD.

**Merge drill (Phase 1 acceptance bullet 3):** `git fetch upstream && git merge
upstream/main` on a scratch branch → `Already up to date`. The fork's main is
already at the current upstream/main HEAD; no new upstream commits to merge.
This is the cleanest possible merge outcome: zero conflicts, zero divergence
on upstream-side code.

**Conclusion:** the §2 map's high-level file inventory is correct; the line
numbers cited have drifted slightly (+228 on `index.js`, +1.4K on
`clipManager.js`) but the fork's hook anchors are stable because the fork was
branched from current upstream/main and only added additive lines.

## Phase status (live; update as work lands)

| Phase | Sub | Issue | Status |
| --- | --- | --- | --- |
| Phase 0 — Eval harness | P0.1 parser | PHA-1423 | done |
| Phase 0 — Eval harness | P0.2 ground truth | PHA-1425 | blocked (Vision Quest, behind P0.1 — note: my Phase 0 scaffolding built `eval/groundTruth.js` as a functional impl, flagging for review) |
| Phase 0 — Eval harness | P0.3 detection runner | PHA-1427 | blocked (Van Dam, behind P0.1+P0.2; interface in `eval/detect.js`) |
| Phase 0 — Eval harness | P0.3 scorer + CLI | PHA-1416 | done |
| Phase 0 — Eval harness | P0.5 docs | PHA-1431 | done (in `eval/README.md` + `eval/run.sh`) |
| Phase 1 — Fork setup | P1.1 plumbing | PHA-1426 | done (this file) |
| Phase 1 — Fork setup | P1.2 upstream-map audit | (open) | todo |
| Phase 1 — Fork setup | P1.3 build/hook verification | (open) | todo |
| Phase 2 — Sentinel | P2.2 auto settings panel + detection profile picker | PHA-1436 | done |
| Phase 4 — Living-lorebook orchestration | P4.2 per-scene side-prompt filtering + event-template preset | PHA-1450 | done |
| Phase 2 — Sentinel | P2.4 force-disable native auto-summary (config, not deletion) | PHA-1456 | done |
| Phase 6 — Merge drill, hardening, release | P6.2 README + CHANGELOG + AGPL headers | PHA-1473 | done |
| Phase 6 — Merge drill, hardening, release | P6.2 release tag v0.1.0 + clean-install verification | PHA-1466 | done |
| `addlore.js` (P4.4) | `populateLorebookEntry` (the entry-populator that already attaches STMB_start/STMB_end metadata) gains a provenance append call with an inline fallback; respects `memoryResult.metadata.skipProvenance` opt-out | Phase 4 (P4.4) provenance lines | Yes — additive; existing entry structure preserved. The inline fallback mirrors nudgeHelpers exactly (4 structural tests pin parity). |
| Phase 4 — Living-lorebook orchestration | P4.4 event-template preset + consolidation/compaction nudges | PHA-1467 | done |
| Phase 5 — Auditor | P5.1 chunk walker (checkpoint/resume/halt) | PHA-1468 | done |
| Phase 5 — Auditor | P5.2 coverage audit + entry regeneration jobs | PHA-1469 | done |
| Phase 5 — Auditor | P5.3 technical pass + claim re-verification jobs (current implementation in `auditorTechnicalPass.js`; 4-job `registerAuditorJobs`; cadence gate via `maybeOfferAuditorJob`) | PHA-1470 | done |
| Phase 5 — Auditor | P5.4 report UIs for the four audit jobs (`auditorReportUIs.js`) | PHA-1471 | done |
| Phase 5 — Auditor | P5.3 technical pass + claim re-verification jobs (legacy implementation; superseded by PHA-1470) | PHA-1459 | done |
| Phase 1 — Fork setup | P1.2 upstream-map audit | PHA-1433 | done (§2 audit appended above) |
| Phase 1 — Fork setup | P1.3 build/hook verification | PHA-1433 | done (v0.1.0 clean-install smoke test, PHA-1466) |
| Phase 1 — Fork setup | P1.4 merge drill | PHA-1433 | done (already in sync with upstream/main; zero-conflict merge) |