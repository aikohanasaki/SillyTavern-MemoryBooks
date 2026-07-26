<!--
Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only

Fork changelog addendum. Fork-specific entries only — upstream changes continue
to land in `changelog.md`.
-->

# 📕 Memory Books Auto — Fork Changelog

Fork-specific changes only. Upstream changelog lives at [`changelog.md`](./changelog.md).
Fork home: https://github.com/phattbeats/SillyTavern-MemoryBooks-Auto.

## v0.1.0 (2026-07-22) — release

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
