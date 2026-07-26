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
| `clipManager.js` (end of `saveNewClip`) | `STMBC-HOOK(clipper)` | Phase 3 (Clipper+) — **wired** | Generate paired context entry (≤50-word blurb + 3-6 keywords) on top of the upstream clip |
| `sidePrompts.js:1655` | `STMBC-HOOK: side-prompt filtering` | Phase 4 (living-lorebook orchestration) | Filter per-scene runs to characters present in the just-processed scene |

The still-unwired call sites use `globalThis.STMBC?.{method}?.(...)` with
`.catch?.(() => null)` so a missing hook module is a clean no-op — the upstream
behavior is byte-identical when the fork modules aren't loaded.

**Wired hooks switch to a direct ESM import** — the convention every shipped phase
settled on (see `sentinel.js`, `sceneCharacterFilter.js`). `globalThis.STMBC` is
never actually assembled anywhere, so a placeholder left beside a real hook is
dead code, and a module reached only through that global would not be reachable
from the single `index.js` build entrypoint at all. Phase 3 therefore *replaced*
the `onClipSave` placeholder rather than adding beside it:

- The placeholder sat at the **top** of `saveNewClip`, before the duplicate-title
  check and before the quote text was read from the DOM — it could not have been
  handed the quote, and its result was never consumed.
- The real hook sits **after** `await saveLorebook(...)`, so the user's clip is
  already persisted before Clipper+ does anything. Byte-identical-when-off is held
  by the enabled gate being the first statement in the hook, and by the hook's
  whole body sitting inside a `try`/`catch`.
- Both properties are asserted structurally in `clipperPlusHook.test.js`, so a
  future edit that reorders them fails the suite.

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
sentinelCadence.js + .test.js Phase 2 (P2.3) — sentinel cycle job type + ring buffer cycle log in chat_metadata.stmbc.cycleLog + factory (enqueueSentinelCycle) + job executor (runSentinelCycle) + the injected P2.1 engine seam (registerSentinelCadence/setSentinelDetectionRunner) + /stmbc-detect and /stmbc-stop on-demand surface. Pure ESM, no SillyTavern runtime imports (Node-testable).
sentinelCore.js + sentinel.test.js Phase 2 (P2.1) — the detection engine (runSentinelDetectionCycle) + its pure helpers: cadence predicate, window builder, strict-JSON parse/retry, snap/guard, scene-range planning, settings→config mapping. No SillyTavern imports; Node-testable.
sentinel.js                    Phase 2 (P2.1) — SillyTavern binding layer: the MESSAGE_RECEIVED cadence gate (enqueues a cycle job) + the engine runner installed into the P2.3 executor. Imports the ST runtime, so it is NOT Node-testable; covered structurally from sentinelCadence.test.js.
eval/phase2Acceptance.js + .test.js + runPhase2Acceptance.js Phase 2 (P2.4) — offline acceptance harness driving the real gate→factory→executor→engine path over the bundled fixture with a reference detector. Evidence: eval/reports/phase2/evidence.md
clipperPlusCore.js            Phase 3 (P3.1/P3.2) — Clipper+ pure core: config merge/validation (nested `autoModule.clipper`), unique source-message locator, K-surrounding window builder, strict blurb-JSON parse + retry, keyword sanitizer, ≤50-word clamp, paired-entry title/content shaping, and `buildEntryOverrides` (the recursion-proof / never-constant world-info contract). No SillyTavern imports; Node-testable.
clipperPlus.js                Phase 3 (P3.1) — SillyTavern binding layer: generation-profile resolution, LLM call, editable confirm dialog (skippable via auto-accept), write via `addlore.upsertLorebookEntryByTitle`. Imports the ST runtime, so it is NOT Node-testable; covered structurally from clipperPlusHook.test.js.
clipperPlus.test.js           Phase 3 (P3.1/P3.2) — 40 offline cases over the pure core
clipperPlusHook.test.js       Phase 3 (P3.2) — hook-site + toggle-off parity: the hook fires after the upstream entry is persisted, the enabled gate is first, the upstream clip shaping is untouched, and the context title is never matched by `isClipEntryTitle` (so compaction still lists the quote entry)
eval/phase3Acceptance.js + .test.js Phase 3 — offline acceptance harness: drives the real Clipper+ core over a fixture chat with a stub LLM reply, then asserts the plan's accept clause against a model of ST's world-info activation (constant / keyword match / `selective`+`keysecondary` / the recursion loop). Replaces the manual "verify with ST world-info debug" step. Carries a CONTROL entry without the recursion flags that MUST cascade, so a model too weak to prove anything fails loudly instead of passing silently.
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
| `stmbJobs.js` (P2.3) | +new `cancelStmbcJobs(reason)` export filtering by the `stmbc-` type prefix; mirrors `cancelAllStmbJobs` but only halts fork cycle jobs (sentinel + audit) | Phase 2 (P2.3) — /stmbc-stop on-demand cancel | Yes — additive export; `cancelAllStmbJobs` unchanged. |
| `index.js` (P2.3) | +~85 (imports, `registerSentinelCadence` call at init, `handleStmbcDetectCommand` + `handleStmbcStopCommand` handlers, two `SlashCommand.fromProps` definitions, two `addCommandObject` calls, comment block on `handleStmbStopCommand` noting the `stmbc-` job coverage) | Phase 2 (P2.3) — jobs/commands wiring | Yes — additive; reuses the existing `registerStmbJobExecutor` / `cancelStmbcJobs` / `enqueueSentinelCycle` exports; no upstream function bodies changed. The two new slash commands are appended to the parser alongside `stmbStopCmd` + `auditCmd`. |

| `index.js` (P2.1) | +3 edit sites, all tagged `STMBC-HOOK(sentinel)`: (a) import `handleSentinelMessageReceived` + `runSentinelDetectionForJob` from `./sentinel.js` next to the `autosummary.js` import block; (b) `await handleSentinelMessageReceived()` inside `handleMessageReceived`, right after `handleAutoSummaryMessageReceived()`; (c) `runSceneMemoryRange` gains `export` (signature and body unchanged) | Phase 2 (P2.1) — cadence gate + scene memorization entry point | Yes — purely additive. (a) is a new import; (b) is one awaited call that no-ops unless the sentinel is enabled for the chat; (c) adds the `export` keyword only — existing callers (`/scenememory`, `/stmb-catchup`) are untouched. SillyTavern exposes no `GENERATION_ENDED` event (verified against upstream `617cfbf`), so the cadence reuses the proven `MESSAGE_RECEIVED` path. |
| `index.js` (P2.1 integration) | `registerSentinelCadence({ registerStmbJobExecutor })` gains a second argument `{ runDetectionCycle: runSentinelDetectionForJob }`; `/stmbc-detect` passes `extension_settings[MODULE_NAME]` instead of `extension_settings` to `enqueueSentinelCycle` | Phase 2 — install the P2.1 engine behind the P2.3 job executor; fix the settings scope the `autoSettings.js` resolvers expect | Yes — additive argument on a fork-only function; the settings-scope change is a one-token fix to a fork-only call site. |

**Total: 10 files modified, ~430 lines added (most additive), 6 lines changed in metadata. No
upstream function bodies, control flow, or data structures touched.**

### Phase 2 P2.1 ↔ P2.3 integration notes

P2.1 (`sentinel.js` / `sentinelCore.js`) and P2.3 (`sentinelCadence.js`) were
built on divergent branches and had never coexisted. They are complementary —
P2.3 is the wiring, P2.1 is the engine — but three collisions had to be resolved
before they could ship together:

1. **`runSentinelCycle` name collision.** Both modules exported that name with
   different signatures. Resolved by renaming the P2.1 engine to
   `sentinelCore.runSentinelDetectionCycle(deps)`. `sentinelCadence.runSentinelCycle(job, context)`
   remains the one job-executor entry point, and now calls into the engine.
2. **Duplicate ring buffer.** Both wrote `chat_metadata.stmbc.cycleLog` with a
   cap of 20 but different record shapes. P2.1's writer (`SENTINEL_RING_SIZE`)
   was deleted; `sentinelCadence.appendSentinelCycleLog` is the only writer, and
   `sentinelCore.js` now has no chat-metadata access at all (enforced by test).
3. **Cadence-gate ownership / double-firing.** P2.1 ran detection inline from
   MESSAGE_RECEIVED while P2.3 expected the gate to enqueue a job. Resolved in
   P2.3's favour: `handleSentinelMessageReceived` only *enqueues*
   (`enqueueSentinelCycle`, trigger `auto`) and never runs detection inline, so
   there is exactly one path, one job per cadence trigger, and every cycle is
   under the jobs dashboard's abort control. Enforced by test.

Also folded in: the sentinel's on/off decision now goes through
`autoSettings.resolveSentinelEnabled` only (P2.1 carried a second, independent
enable check), and the stored P2.2 setting names (`cadenceMessages`,
`windowSize`, …) are mapped onto the engine's internal names by
`sentinelCore.sentinelConfigFromAutoSettings` — P2.1 read its own names straight
out of `extension_settings`, which would have left the P2.2 settings panel with
no effect on the sentinel at all.

The engine is *injected*, not imported: `sentinelCadence.js` must stay free of
SillyTavern imports to remain Node-testable, so `index.js` pushes the runner in
at init via `registerSentinelCadence(api, { runDetectionCycle })`. With no
runner installed the executor degrades to a clean logged no-op, so the wiring
never fails because the engine is absent.

## Merge drill (per plan §1.2.3)

### Result: 2026-07-24 PHA-1449 run (Ledger, this commit)

Drill environment: fork HEAD `292ae0b` (v0.1.0 release tag) on `main`,
`upstream/main` at `47a08a0` — **19 upstream commits ahead**, all in the
`docs: AGPL header` → `STLO detection fixes` → `STMB default side prompt
sets` → `UI cleanup` → `scrollbar` chain since the merge base
(`617cfbf`, 2026-07-18).

`git merge --no-ff --no-edit upstream/main` on a scratch branch produced:

**Auto-merged clean (4 files, including every hooked file):**
- `index.js` — **all three fork hook sites merged without conflict** (`STMBC-HOOK` init at line 11254, the P2.4 sentinel/auto-summary handlers at 2049 / 9357). This is the load-bearing result: 19 upstream commits touched the file and the no-op blocks at our markers stayed outside their edit regions.
- `templates.js` — `autoModuleSettingsTemplate` (P2.2) and the P2.4 `automaticMemoriesSettingsTemplate` warning block both applied cleanly.
- `style.css` — no fork changes; expected.
- Plus trivial auto-merged: `changelog.md` (partial — see below).

**Conflicts (5 files):**

| File | Why | Resolution |
| --- | --- | --- |
| `manifest.json` | `author` + `version` only — fork `phattbeats` / `8.2.2-a.1` vs upstream `aikohanasaki` / `8.2.3`. Display name, settings key, lorebook flags, js/css fields all merged clean. | Keep fork `author` and fork `display_name`; bump fork `version` to `8.2.3-a.1` (semver-patch fork-suffix). |
| `changelog.md` | Both sides added new version entries at the top — fork `v8.2.2-a.1` (v0.1.0 release) and upstream `v8.2.3` (bugfixes). | Keep both entries, ordered by version. Fork entry stays under its own heading. |
| `index.build.js` | Generated build artifact committed in both forks; upstream's 19 commits regenerated it differently than ours. | **Regenerate after merge** — `bun run build` then `git add index.build.js`. Conflict is purely from committing generated output; the file is overwritten cleanly on every build. |
| `index.build.js.map` | Same as `index.build.js` — source map regenerates. | Regenerate via build; `git add` the new map. |
| `style.build.css` | Same — upstream and fork both committed generated CSS bundles. | Regenerate via build; `git add` the new bundle. |

### Conclusion

**Hook-site design is validated.** Zero conflicts in any forked source file
(`index.js`, `stmemory.js`, `clipManager.js`, `sidePrompts.js`, `utils.js`,
`constants.js`, `autosummary.js`, `templates.js`, `manifest.json`-core). Every
conflict is either (a) expected per FORK_NOTES (`manifest.json`), (b) a
two-sided additive doc merge (`changelog.md`), or (c) a regenerated build
artifact.

The plan-§1.2 invariant — "single-line greppable hook sites survive
`upstream/main`" — holds at 19 commits of upstream drift.

### Repeatable merge procedure

Run this from a clean working tree on `main`:

```bash
# 1. Fetch upstream + confirm drift
git fetch upstream
git rev-list --left-right --count main...upstream/main
#   expected: "<X>    <Y>" where Y > 0 means upstream has new commits

# 2. Confirm fork-only commits are intact
git log --oneline upstream/main..main | wc -l

# 3. DRILL on a scratch branch first (never merge directly into main)
git checkout -b scratch/merge-drill
GIT_MERGE_AUTOEDIT=no git merge --no-ff --no-edit upstream/main

# 4. Inspect conflicts
git diff --name-only --diff-filter=U
#   expected (per this run): changelog.md, index.build.js, index.build.js.map,
#                            manifest.json, style.build.css
#   any file outside that set = stop, investigate, don't blindly resolve

# 5. If conflicts match the expected set, resolve:
#    - manifest.json:    keep fork display_name + author; bump fork version
#                        to upstream + "-a.1" suffix
#    - changelog.md:     keep both version entries, ordered newest-first
#    - *.build.*:        `bun run build && git add <artifacts>`
#                        (build artifacts are regenerated; conflicts are noise)

# 6. Verify the post-merge state
bun run build
node --test eval/*.test.js docsStructure.test.js eventPreset.test.js \
              autosummarySentinelGate.test.js
#   (pre-commit hook runs `bun run build` automatically — manual run is
#    belt-and-braces to confirm the build itself didn't break)

# 7. If drill is green:
git merge --abort 2>/dev/null || git checkout main && git branch -D scratch/merge-drill
#    OR if you intend to land the merge:
#    git add -A && git commit --no-edit
#    git push origin main

# 8. Update FORK_NOTES.md with the new run's result (append a new bullet
#    under "Merge drill history" below) and commit the doc update.
```

### Merge drill history

- **2026-07-24 (PHA-1449)** — 19 upstream commits ahead. Conflicts in 5 files
  (manifest.json, changelog.md, 3 build artifacts). All 4 hooked source files
  clean. **Pass — design holds.**

- **2026-07-26 (PHA-1432, Van Dam re-drill)** — fork HEAD `16bc969` (post-P5.5),
  `upstream/main` at `9fc9abb` — **7 new upstream commits ahead** of the prior
  drill base (47a08a0 → 9fc9abb: `regenerate memories` ×2, `update arc keywords`
  ×2, plus the 3 already absorbed in PHA-1449). 21 fork-only commits since the
  prior drill (P0.3, P0.5, P2.2, P2.4, P4.2, P4.4, P5.3, P5.4, P5.5, plus the
  drill-result commit itself).

  `git merge --no-ff --no-edit upstream/main` on scratch branch
  `scratch/p1.4-drill-20260726-1413` produced:

  **Auto-merged clean (every hook-site file):**
  - `index.js` — P2.2 init backfill + P2.4 sentinel handler + P2.4 force-disable
    handler + Phase 2 init hook all clean. Three hook sites stable through
    upstream drift.
  - `stmemory.js:1461` — clean.
  - `clipManager.js:718` — clean.
  - `sidePrompts.js` — both P4.2 filter (line 1404) and Phase 4 filter (1671)
    clean.
  - `templates.js` — both P2.2 and P2.4 additive blocks clean.
  - `utils.js` (P4.2 event preset), `constants.js` (P4.2 event display) —
    additive map entries, clean.
  - `autosummary.js` (P2.4 gate helper) — clean.

  **Conflicts (8 files):**

  | File | Why | Resolution | Hook-site clean? |
  | --- | --- | --- | --- |
  | `manifest.json` | `author` + `version` only — fork `phattbeats` / `8.2.2-a.1` vs upstream `aikohanasaki` / `8.3.0`. | Keep fork `author` and `display_name`; bump fork `version` to `8.3.0-a.1`. | ✓ (core metadata already merged in PHA-1449) |
  | `changelog.md` | Both sides added new version entries. | Keep both, ordered newest-first. | n/a |
  | `index.build.js` + `.map` | Generated build artifact committed in both forks. | Regenerate via `bun run build` and `git add`. | n/a |
  | `style.build.css` | Generated CSS bundle committed in both forks. | Regenerate via build. | n/a |
  | `style.css` | **NEW.** Fork appended 113 lines (P5.4 audit UI styles at EOF); upstream appended different lines (scrollbar/STLO/regenerate styles at EOF). Both appends collide at EOF. | Take upstream's append, then re-append the fork's P5.4 block. No semantic overlap (different selectors: `.stmb-audit-*` vs upstream scrollbar/STLO). | ✓ — fork never modified the body of style.css |
  | `addlore.js` | **NEW.** Two conflict regions: (a) imports at line 18-22 (fork added `auditorCadence` + `auditorTechnicalPass` imports; upstream added `memoryRegeneration` imports); (b) `populateLorebookEntry` body at line 648-705 (fork added STMBC-HOOK-PHASE4 + 30-line inline fallback; upstream added `STMB_chatId` field). Both sides added NEW lines in adjacent context; auto-merge refuses because of context shift, not actual semantic overlap. | Merge both import blocks (preserve all four imports). For `populateLorebookEntry`: keep fork's hook block, insert upstream's `STMB_chatId` block BEFORE the fork's hook (the order doesn't matter functionally; STMB_chatId is a metadata write, hook is content transformation). | ✓ — STMBC-HOOK-PHASE4 lines themselves are untouched by upstream; conflict is from BOTH sides adding adjacent lines |

  **Conclusion — hook-site design holds at 7 further upstream commits.**
  Every STMBC-HOOK anchor survived the merge; every conflict is either (a)
  expected per FORK_NOTES (`manifest.json`, build artifacts, changelog), (b)
  additive-from-both-sides noise (`style.css`, `addlore.js`), or (c) regenerable
  output. The §1.2.3 invariant holds.

  **Phase 1 §1.2.1 rule violation found in `addlore.js`:** the STMBC-HOOK-PHASE4
  block includes a 30-line inline `appendProvenanceLineInline` helper that
  duplicates `nudgeHelpers.appendProvenanceLine` (the same file the lazy
  `require` points at). Plan §1.2.1 says upstream files get "single-line call
  sites only, each tagged with a greppable comment" — the inline fallback is
  non-trivial fork code living in an upstream file. The fallback is dead code
  in the common path (the lazy `require` resolves `nudgeHelpers.js` under
  `bun run build`). Resolution: move the fallback into `nudgeHelpers.js` (or
  just delete it — the lazy require already covers the uncommon case) and
  reduce the hook block to a single greppable call. **Follow-up issue:**
  created as PHA-1434.

- **PHA-1533 (2026-07-26) — fix landed.** `nudgeHelpers.js` now exports
  `safeAppendProvenanceLine(content, sceneRange)` that resolves
  `globalThis.STMBC?.provenanceHelpers?.appendProvenanceLine` first (the
  injected-override path used by tests / plugins) and falls back to the
  canonical `appendProvenanceLine` here. `addlore.js` STMBC-HOOK-PHASE4 block
  collapsed from ~30 lines (call site + try/catch + 30-line inline duplicate)
  to 4 lines of code (skipProvenance guard + lazy `require` of `safeAppendProvenanceLine`
  + single call). The `appendProvenanceLineInline` function and its 4
  structural parity tests are gone. `provenanceFallback.test.js` rewritten
  to assert the new structural invariants (no inline helper in `addlore.js`,
  hook block ≤8 lines, `nudgeHelpers.js` exports the wrapper) plus
  functional parity + globalThis override coverage for `safeAppendProvenanceLine`.
  Re-run PHA-1432-style merge drill against current upstream to confirm.

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
| Phase 2 — Sentinel | P2.3 jobs/commands wiring + auto-summary force-disable (per-issue) | PHA-1439 | done (sentinelCadence.js + /stmbc-detect + /stmbc-stop + ring buffer; auto-summary force-disable already covered by P2.4) |
| Phase 4 — Living-lorebook orchestration | P4.2 per-scene side-prompt filtering + event-template preset | PHA-1450 | done |
| Phase 2 — Sentinel | P2.4 force-disable native auto-summary (config, not deletion) | PHA-1456 | done |
| Phase 6 — Merge drill, hardening, release | P6.2 README + CHANGELOG + AGPL headers | PHA-1473 | done |
| Phase 6 — Merge drill, hardening, release | P6.2 release tag v0.1.0 + clean-install verification | PHA-1466 | done (initial tag + verification at f09b25b / 1dfc263) |
| Phase 6 — Merge drill, hardening, release | P6.3 post-merge clean-install re-verification + tag v0.1.0 moved to HEAD | PHA-1474 | done (390/390 tests pass, 19 ESM imports resolve, tag moved to 7107ac0; see `docs/release/v0.1.0/report.md`) |
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