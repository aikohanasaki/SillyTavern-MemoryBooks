<!--
Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only
-->

# FORK_NOTES

Merge discipline for the **STMB-Auto** fork (plan §1.2, §5.5): every edit to an
upstream-tracked file must be listed here with its justification, so an
`upstream/main` merge only ever conflicts at these documented sites. Fork-only
files (new modules) are listed separately — they can never conflict.

All hook comments in upstream files are tagged `STMBC-HOOK(<subsystem>)` so they
are greppable: `grep -rn 'STMBC-HOOK' --include='*.js' .`

Line numbers are indicative (pre-minified source `index.js`), not load-bearing.

## Upstream-file edits

### `index.js` — Phase 2 / P2.1 (Sentinel)

1. **Import the sentinel handler** (near the `autosummary.js` import block).
   ```js
   // STMBC-HOOK(sentinel): autonomous scene-boundary detection cycle (fork; plan §4.1).
   import { handleSentinelMessageReceived } from "./sentinel.js";
   ```
   *Why:* the sentinel runs on the same cadence event STMB already uses.

2. **Export `runSceneMemoryRange`** (was a module-local `async function`).
   ```js
   // STMBC-HOOK(sentinel): exported so sentinel.js can memorize a detected scene
   // range via a direct in-extension call (plan §4.1). Signature unchanged.
   export async function runSceneMemoryRange(startId, endId, options = {}) { … }
   ```
   *Why:* the sentinel memorizes each detected scene by calling this proven
   entry point directly (indices, not a compiled scene). Adding `export` only;
   behavior and callers (`/scenememory`, `/stmb-catchup`) are unchanged.

3. **Invoke the cycle inside `handleMessageReceived`** (right after
   `handleAutoSummaryMessageReceived()`).
   ```js
   // STMBC-HOOK(sentinel): run one detection cycle on the same proven cadence
   // event. No-ops unless the sentinel is enabled for this chat (plan §3.3).
   await handleSentinelMessageReceived();
   ```
   *Why:* SillyTavern exposes no `GENERATION_ENDED` event and STMB subscribes to
   none (verified against upstream `617cfbf`; plan P1.2 note). We reuse the
   proven `MESSAGE_RECEIVED` → `handleMessageReceived` path for the cadence
   counter. The handler self-gates on `autoModule.enabled` / `chat_metadata.stmbc`
   and is a no-op when the sentinel is off, so stock behavior is unchanged.

### `index.js` — Phase 5 / P5.1 (Auditor)

1. **Import the auditor bindings** (immediately after the sentinel import).
   ```js
   // STMBC-HOOK(auditor): resumable full-chat audit chunk-walker (fork; plan §4.3).
   import { executeAuditJob, handleAuditCommand, handleStmbcStopCommand } from "./auditor.js";
   ```
   *Why:* the auditor is a registered job executor plus two slash commands.

2. **Register the `audit` job type** (inside `init()`, right after STMB's own
   `registerStmbJobExecutor("consolidation", …)`, plan §2.1 site **H1/H2**).
   ```js
   // STMBC-HOOK(auditor): register the resumable audit chunk-walker job type so the
   // dashboard shows it and /stmbc-stop halts it (fork; plan §4.3).
   registerStmbJobExecutor("audit", executeAuditJob);
   ```
   *Why:* the chunk walker runs as an `audit` job so it appears in the jobs
   dashboard and is halted cooperatively by the shared abort signal
   (`cancelAllStmbJobs`). Same call the two upstream executors use; added lines
   only, no upstream behavior changed.

3. **Register the `/stmbc-audit` and `/stmbc-stop` slash commands** (inside
   `registerSlashCommands()`, beside the upstream command objects; plan §2.1 site
   **H3**). Two `SlashCommand.fromProps({…})` definitions tagged
   `// STMBC-HOOK(auditor):` plus their two `addCommandObject(...)` lines.
   *Why:* `/stmbc-audit [restart]` starts or resumes the audit walk (H3);
   `/stmbc-stop` halts the fork's jobs via `cancelAllStmbJobs` and leaves the
   checkpoint intact for resume. Additive; the upstream `/stmb-stop` command
   (which already calls `cancelAllStmbJobs`) is unchanged.

### `index.js` — Phase 5 / P5.2 (Auditor jobs 1–2)

1. **Import the auditor-jobs bindings** (immediately after the P5.1 auditor import).
   ```js
   // STMBC-HOOK(auditor-jobs): coverage audit + entry regeneration over the walker's
   // running notes (fork; plan §4.3 jobs 1–2).
   import { handleCoverageCommand, handleRegenCommand } from "./auditorJobs.js";
   ```
   *Why:* the two auditor jobs are on-demand slash commands (no new job type — they
   read the checkpoint the P5.1 walker wrote and finish in one interaction).

2. **Register `/stmbc-coverage` and `/stmbc-regen`** (inside `registerSlashCommands()`,
   right after the P5.1 `stmbcStopCmd`; two `SlashCommand.fromProps({…})` tagged
   `// STMBC-HOOK(auditor-jobs):` plus their two `addCommandObject(...)` lines).
   *Why:* `/stmbc-coverage` compares the audit running notes against the bound
   lorebook and shows a missing/thin report popup with one-click generate;
   `/stmbc-regen <name>` re-derives one living entry from the source chunks where its
   name appears (anti-drift) with a diff to approve. Both require a prior
   `/stmbc-audit`. Additive; no upstream behavior changed. They write through STMB's
   own `addlore.upsertLorebookEntryByTitle`, never the memory-creation path.

### `index.js` — PHA-1846 (`/stmb-auto`)

1. **Import the orchestrator's pure core, plus the auditor/auditor-jobs pieces
   it reuses that were previously module-private** (immediately after the
   P5.2 auditor-jobs import).
   ```js
   import {
     executeAuditJob, handleAuditCommand, handleStmbcStopCommand,
     runAuditInline, getAuditNotes, resolveAuditConfig,
   } from "./auditor.js";
   import {
     handleCoverageCommand, handleRegenCommand,
     resolveCoverageConfig, resolveRegenConfig,
     loadBoundLorebook, entriesForCoverage, resolveJobsConnection, bulkGenerate,
   } from "./auditorJobs.js";
   import { auditCoverage, buildCoverageIndex } from "./auditorJobsCore.js";
   // STMBC-HOOK(stmb-auto): PHA-1846 — the zero-argument "just run it" orchestrator.
   import { resolveStmbAutoConfig, planAutoMemoryChunks, buildStmbAutoSummary } from "./stmbAutoCore.js";
   import { refreshCatalogForCoverageRun } from "./catalog.js";
   ```
   *Why:* `handleStmbAutoCommand` (defined in `index.js` itself, not a separate
   binding file — it needs deep access to `index.js`-local state:
   `isProcessingMemory`, `chat`, `characters`, `this_chid`,
   `getCurrentMemoryBooksContext`, `initializeSettings`,
   `validateStmbCatchupNonInteractive`, `runSceneMemoryRange`) sequences
   lorebook auto-create → full audit walk → chunked scene memories → headless
   coverage bulk-generate. `runAuditInline`, `loadBoundLorebook`,
   `entriesForCoverage`, `resolveJobsConnection`, and `bulkGenerate` (with a
   new `cap` parameter) were module-private before this and are now exported
   from their existing files rather than duplicated.

2. **Define `handleStmbAutoCommand`** (right after `handleStmbCatchupCommand`,
   before `handleNextMemoryCommand`). See the function's own header comment
   in `index.js` for the four-step sequence and the `minChunks` relaxation.
   *Why:* this is the command itself — a zero-argument, best-effort, no-popup
   run over the whole chat. Every step failure is folded into the final
   summary string rather than aborting the remaining steps.

3. **Register the `/stmb-auto` slash command** (inside `registerSlashCommands()`,
   immediately before the P5.1 `stmbcAuditCmd`; one `SlashCommand.fromProps({…})`
   tagged `// STMBC-HOOK(stmb-auto):` plus its `addCommandObject(...)` line).
   *Why:* no required args, unlike every other fork command in this family
   (`/stmbc-audit [restart]`, `/stmbc-coverage`, `/stmb-catchup interval= start=
   end=`) — that is the entire point of PHA-1846: those commands each have
   their own precondition a first-time user hits as a silent-looking instant
   failure (no bound lorebook, no prior audit notes, required args with no
   defaults). Additive; no upstream behavior changed, and none of the three
   pipelines it calls are modified — only three functions gained `export`.

### `clipManager.js` — Phase 3 / P3.1 (Clipper+)

1. **Import the clip-save hook** (immediately after the `./stmbJobs.js` import).
   ```js
   // STMBC-HOOK(clipper): paired keyword-activated context entry on clip save (fork; plan §4.2).
   import { maybeGeneratePairedContextEntry } from "./clipperPlus.js";
   ```
   *Why:* Clipper+ generates the paired context entry from the clip-save path.

2. **Invoke the hook inside `saveNewClip()`** (right after the clip entry's
   `saveLorebook(lorebookName, lorebookData)`, before `return true`).
   ```js
   // STMBC-HOOK(clipper): after the upstream [STMB Clip] entry is written, generate +
   // write the paired context entry (fork; plan §4.2). No-op unless Clipper+ is enabled;
   // self-contained (never throws), so the clip above is unaffected either way.
   await maybeGeneratePairedContextEntry({ lorebookName, lorebookData, quote: bulletText, headline, quoteTitle: title });
   ```
   *Why:* single hook in the clip-save path (plan §2.1 site **H6**), placed after
   the `[STMB Clip]` entry is persisted. `maybeGeneratePairedContextEntry`
   self-gates on `autoModule.clipper.enabled` (default **off**) and swallows all
   errors, so with the feature off — or on failure — the upstream clip save is
   byte-identical (Phase 3 acceptance). Anchored to `saveNewClip` only;
   `saveExistingClip` (bullet-append) is intentionally untouched.

### `stmemory.js` — Phase 4 / P4.1 (Living-lorebook injection)

1. **Import the injection binding** (immediately after the
   `contextSettingsManager.js` import block).
   ```js
   // STMBC-HOOK(injection): living-lorebook context injection + error-control rules (fork; plan §4.4, §5).
   import { buildLivingContextPreamble } from './injection.js';
   ```
   *Why:* injection gathers the token-capped living entries the book already knows
   and the error-control rules that must ride on every generation prompt.

2. **Prepend the preamble inside `buildPrompt()`** (right after `sceneText` is
   built, replacing the single `const finalPrompt = …` line).
   ```js
   // STMBC-HOOK(injection): prepend token-capped living-lorebook entries (delta-not-rehash)
   // + error-control rules between the system prompt and the scene (fork; plan §4.4, §5).
   let injectionPreamble = '';
   try {
       injectionPreamble = await buildLivingContextPreamble({ compiledScene, profile, sceneText, systemPrompt: processedSystemPrompt });
   } catch (e) { console.warn(`${MODULE_NAME}: living-context injection failed; using base prompt`, e); injectionPreamble = ''; }
   const finalPrompt = injectionPreamble
       ? `${processedSystemPrompt}\n\n${injectionPreamble}\n\n${sceneText}`
       : `${processedSystemPrompt}\n\n${sceneText}`;
   ```
   *Why:* single hook in the prompt-assembly path (plan §2.1 site for the
   stmemory prompt). `buildLivingContextPreamble` self-gates on
   `autoModule.injection.enabled` (default **off**) and swallows all errors,
   returning `''`, so with the feature off — or on any failure — `finalPrompt` is
   the byte-identical upstream string. The outgoing-regex block below is
   unchanged and still applies to whatever `finalPrompt` becomes.

> `index.build.js` / `index.build.js.map` are generated by `bun run build`
> (pre-commit hook) — never hand-edit; they are not merge sites.

## Fork-only files (no merge conflicts possible)

- `sentinelCore.js` — pure, SillyTavern-free sentinel cycle logic (DI core);
  unit-tested offline under `node:test`.
- `sentinel.js` — SillyTavern binding layer that wires real
  chat/settings/profile/memory functions into `sentinelCore.runSentinelCycle`.
- `sentinel.test.js` — `node --test sentinel.test.js` (23 cases; the core is
  fully exercised without SillyTavern).
- `clipperPlusCore.js` — pure, SillyTavern-free Clipper+ logic (DI core): config
  merge, source-message locator, K-surrounding window builder, blurb-JSON parser,
  keyword sanitizer, blurb clamp, paired-entry title/content shaping.
- `clipperPlus.js` — SillyTavern binding layer that wires real
  chat/settings/profile/LLM/world-info functions; owns the LLM call, the editable
  confirm dialog, and the paired-entry write via `addlore.upsertLorebookEntryByTitle`.
- `clipperPlus.test.js` — `node clipperPlus.test.js` (35 cases; the core is fully
  exercised without SillyTavern).
- `catalogCore.js` — pure, SillyTavern-free entry-catalog logic (DI core):
  entry classification, deterministic 1-line summaries, change fingerprints,
  budget fitting with explicit drop accounting, staleness diffing.
- `catalog.js` — SillyTavern binding layer that reads the bound lorebook and
  stores the catalog at `chat_metadata.stmbc.catalog`; never throws into a caller.
- `catalogCore.test.js` — `node --test catalogCore.test.js` (41 cases, including
  the fixture-lorebook serialization gate).
- `injectionCore.js` — pure, SillyTavern-free living-lorebook injection logic (DI
  core): config merge, keyword matching (constant + keyword-matched vs. scene
  text), hard ~50K-token budget selection with drop reporting, delta-not-rehash
  preamble + error-control rules assembly.
- `injection.js` — SillyTavern binding layer that resolves the bound lorebook
  (`chat_metadata[METADATA_KEY]` + `loadWorldInfo`), filters to living entries
  (skips disabled and — by default — memory entries), computes base tokens, and
  returns the preamble. Self-gates on `autoModule.injection.enabled` (default
  off) and never throws.
- `injection.test.js` — `node injection.test.js` (27 cases; the core is fully
  exercised without SillyTavern).
- `auditorCore.js` — pure, SillyTavern-free Auditor walker (DI core): audit-message
  extraction, deterministic chunk planning (40 msgs/chunk within a ~20K-token cap),
  strict-JSON per-chunk notes parser (one retry), map-reduce into a running-notes
  object, checkpoint/resume decision, and cooperative halt. `runAuditWalk` is pure
  of any SillyTavern import.
- `auditor.js` — SillyTavern binding layer that wires real chat / chat_metadata
  (checkpoint at `chat_metadata.stmbc.audit`) / profile / LLM (`requestCompletion`)
  / job-context functions into `auditorCore.runAuditWalk`. Owns the `audit` job
  executor, the `/stmbc-audit` (start/resume/restart) and `/stmbc-stop` handlers,
  and an inline fallback for when the jobs dashboard is unavailable.
- `auditor.test.js` — `node auditor.test.js` (30 cases; the core is fully exercised
  without SillyTavern — including checkpoint, mid-walk resume, halt, and restart).
- `auditorJobsCore.js` — pure, SillyTavern-free core for the two P5.2 auditor jobs
  (DI): the coverage classifier (running notes vs. lorebook entries → missing/thin,
  memory-entry-aware, salience-gated + salience-sorted), name→chunk provenance
  lookup, budget-bounded source-excerpt reconstruction (name-mention priority), the
  re-derivation prompt/parse/retry (JSON-first, plain-text fallback), and an LCS
  line diff for the diff view.
- `auditorJobs.js` — SillyTavern binding layer for `/stmbc-coverage` and
  `/stmbc-regen`. Resolves the bound lorebook (`chat_metadata[METADATA_KEY]` +
  `loadWorldInfo`), reads the audit notes via `auditor.getAuditNotes`, reproduces the
  walker's chunk plan (`auditorCore.planChunks` with `resolveAuditConfig`) to line up
  provenance, calls `requestCompletion` to re-derive, renders the coverage report /
  diff popups, and writes via `addlore.upsertLorebookEntryByTitle`. On-demand only;
  new entries get keys, existing entries keep theirs.
- `auditorJobs.test.js` — `node --test auditorJobs.test.js` (20 cases; the core is
  fully exercised without SillyTavern — coverage classification, source selection,
  parse/retry, and diff).
- `stmbAutoCore.js` — pure, SillyTavern-free core for `/stmb-auto` (PHA-1846, DI):
  merges the auto-run config (`memoryInterval`/`bulkGenerateCap`/`coverageMinChunks`,
  defaults <- global <- per-chat, same shape as `resolveAuditConfig`), plans the
  scene-memory chunks from the watermark to the end of the chat
  (`planAutoMemoryChunks`), and formats the final run summary
  (`buildStmbAutoSummary`). The command itself (`handleStmbAutoCommand`) is not a
  separate binding file — it lives directly in `index.js` (see the PHA-1846 entry
  above) because it orchestrates `index.js`-local state the auditor/auditor-jobs
  binding layers don't have access to.
- `stmbAutoCore.test.js` — `node --test stmbAutoCore.test.js` (22 cases: config
  merge precedence, chunk-plan edge cases — unset/stale watermark, already caught
  up, interval larger than the chat, last-chunk clipping — and summary formatting).

## P7.1 — entry catalog / retrieval index (2026-07-31, PHA-1634)

The compact per-entry index the librarian (P7.2) selects from. `catalogCore.js`
is pure (node:test, no ST imports); `catalog.js` is the chat_metadata binding.

**Shape.** `chat_metadata.stmbc.catalog` =
`{v, lorebook, builtAt, reason, rows[], dropped[], truncated, stats}`, one row
per entry: `{uid, kind, title, n[], s, t, fp}` — entity names, 1-line summary,
estimated tokens, change fingerprint. Field names are short because every one
is paid for on every entry inside chat_metadata.

**Two refresh triggers**, both non-blocking and both fail-open:

| Trigger | Site |
| --- | --- |
| entry write | `STMBC-HOOK(catalog)` at the three `saveWorldInfo` sites in `addlore.js` (`addMemoryToLorebook`, `upsertLorebookEntriesBatch`, `upsertLorebookEntryByTitle`) — those three cover memories, side prompts, Clipper+ context entries and consolidations |
| Auditor coverage run | `STMBC-HOOK(catalog)` inside `handleCoverageCommand` in `auditorJobs.js`, right after `buildCoverageIndex` |

**The hook is on the LIVE coverage path, deliberately.** `auditorTechnicalPass.js`
also exports a `registerAuditorJobs` with a `stmbc-audit-coverage` executor, but
as of the v0.0.2 release `index.js` no longer imports it — the reachable coverage
job is `/stmbc-coverage` → `handleCoverageCommand` → `auditorJobsCore.auditCoverage`.
Hooking `registerAuditorJobs` would have produced exactly the orphaned-hook
failure the Phase 4 integration note above describes. Re-check this before
moving the hook.

**Decisions worth knowing before touching this:**

- **Every entry is catalogued, not just STMB-managed ones.** The acceptance
  criterion is that every `stmemorybooks`/side-prompt/clip entry is present —
  it is — but the librarian selects across the *whole* bound lorebook, so
  hand-authored world entries are indexed too and tagged `kind: 'manual'`.
  Filter on `kind` if you want the pipeline-owned subset. Disabled entries are
  kept and flagged `off: true` for the same reason: P7.3 is the layer that
  knows whether a disabled entry may fire.
- **No LLM at read time.** Summaries are deterministic string surgery over the
  entry's own content, done once at write/refresh time. A structural test
  asserts `catalogCore.js` imports nothing that can make a call.
- **Entity extraction has ONE definition.** `extractEntryEntityNames` lives in
  `auditorJobsCore.js` next to `buildCoverageIndex`, which now normalizes its
  output into the coverage handle map; the catalog carries the same output as
  `row.n`. A second extractor would let coverage and retrieval disagree about
  which entities exist.
- **Budget overflow is never silent** (plan §4.3). Over the
  `maxSerializedBytes` budget (default 64 KiB) it shrinks summaries first, then
  drops rows lowest-retrieval-priority first (`manual` -> `sideprompt` ->
  `clip` -> `clip-context` -> `memory`), recording every dropped uid in
  `catalog.dropped`, setting `truncated`, and warning at the console. Dropped
  entries still fire on keywords — only librarian retrieval is affected.
- **`stats.bytes` is a fixed point, not one measurement.** The number lives
  inside the object it measures, so writing it changes the length; a single
  pass under-reports by the width of its own digits. `measureCatalog` iterates
  (2 passes in practice). Pinned by a test.
- **The clip suffix is duplicated on purpose.** `catalogCore.CLIP_TITLE_SUFFIX`
  mirrors `clipManager.STMB_CLIP_TITLE_SUFFIX` as a literal because clipManager
  pulls in the ST runtime and would break the core's node:test purity. Keep the
  two in sync.

**Measured on the 328-msg fixture lorebook** (`eval/materials/stmb-auto/Magisa-_satire_fantasy_isekai_world.json`,
52 entries, committed with this work as the gate's ground truth): **15,245 B —
23.3% of the 64 KiB budget**, against a 139,926 B lorebook (9.2x smaller),
nothing truncated, and the catalog round-trips through
`JSON.parse(JSON.stringify(...))` byte-identical and non-stale.

## New settings / metadata namespaces (clean; no upstream collision)

- Global: `extension_settings.STMemoryBooks.autoModule` (plan §4.5) — sentinel
  `enabled`, `cadenceN`, `window`, `overlap`, `truncate`, `guard`,
  `detectionProfile`, `detectionPrompt`.
- Global: `extension_settings.STMemoryBooks.autoModule.clipper` (plan §4.2, §4.5)
  — Clipper+ `enabled` (default `false`), `surroundingK` (default 6), `truncate`,
  `autoAccept`, `maxBlurbWords` (50), `minKeywords`/`maxKeywords` (3–6),
  `profile` (generation profile index; null ⇒ STMB default profile), `prompt`
  (blurb-prompt override). Enable for testing: set
  `extension_settings.STMemoryBooks.autoModule.clipper = { enabled: true }`.
- Per-chat: `chat_metadata.stmbc` — `enabled`, `watermark` (fallback for chats
  with no memories yet), `structureHintRegex`, `detectionPrompt`, `cycleLog`
  (debug ring buffer); `clipper` sub-object (`enabled`, `autoAccept`, `prompt`)
  overriding the global Clipper+ settings per chat.
- Global: `extension_settings.STMemoryBooks.autoModule.injection` (plan §4.4,
  §4.5, §5.1) — living-lorebook injection `enabled` (default `false`), `budget`
  (default 50000, the hard total context cap), `reserveForOutput` (1000),
  `maxEntries` (60), `perEntryChars` (1500), `includeConstant` (true),
  `includeMemoryEntries` (false — recent memories are already injected by
  upstream `previousSummariesContext`), `errorControl` (true), `prompt`
  (delta-instruction override). Per-chat overrides at
  `chat_metadata.stmbc.injection` (same keys; per-chat wins). Enable for testing:
  `extension_settings.STMemoryBooks.autoModule.injection = { enabled: true }`.
- Paired context entries are titled `<headline> [STMB Clip Context]` — a distinct
  suffix from the clip `<headline> [STMB Clip]`, so they cross-reference the quote
  by headline yet are never matched by `clipManager.isClipEntryTitle` (compaction /
  clip lists ignore them). They are keyword-activated, non-constant, and
  `preventRecursion` + `excludeRecursion` (plan §4.2, Appendix B).
- Global: `extension_settings.STMemoryBooks.autoModule.audit` (plan §4.3, §4.5) —
  Auditor `chunkSize` (default 40), `tokenCap` (default 20000), `truncate` (default
  0 ⇒ read full text), `profile` (extraction profile index; null ⇒ STMB default
  profile), `mapPrompt` (per-chunk extraction-prompt override). Per-chat overrides
  at `chat_metadata.stmbc.audit` (same keys; per-chat wins). The audit is
  on-demand only (never auto-runs in P5.1), so there is no `enabled` gate.
- Per-chat: `chat_metadata.stmbc.audit` also holds the resumable **checkpoint**
  written after each chunk — `{ nextChunk, total, notes, chatLen, status, updatedAt }`.
  `notes` is the running-notes object (characters/locations keyed maps + events/
  claims/collisions lists with chunk provenance). It survives a reload; re-running
  `/stmbc-audit` resumes from `nextChunk`, `/stmbc-audit restart` discards it.
- Global: `extension_settings.STMemoryBooks.autoModule.coverage` (plan §4.3 job 1) —
  coverage-audit `thinContentChars` (default 240 — a matched living entry shorter than
  this is "thin"), `minChunks` (default 2 — only report names seen in ≥ this many
  distinct chunks, cutting one-off noise), `includeLocations` (default true). Per-chat
  overrides at `chat_metadata.stmbc.coverage`. On-demand only; no `enabled` gate.
- Global: `extension_settings.STMemoryBooks.autoModule.regen` (plan §4.3 job 2) —
  entry-regeneration `tokenBudget` (default 12000 — cap on the source excerpt sent to
  the re-derivation call), `truncate` (default 0 ⇒ full text), `prioritizeNameMatches`
  (default true), `autoApprove` (default false — skip the diff popup and write
  directly), `profile` (derivation profile index; null ⇒ STMB default), `regenPrompt`
  (re-derivation-prompt override). Per-chat overrides at `chat_metadata.stmbc.regen`.
  Re-derived entries are written via `upsertLorebookEntryByTitle` (not marked as STMB
  memories — they are living lore). On-demand only; no `enabled` gate.
- Watermark source of truth remains upstream's
  `chat_metadata.STMemoryBooks.highestMemoryProcessed` via
  `getHighestMemoryProcessed()`; `chat_metadata.stmbc.watermark` is only a
  fallback.

## Phase 6 / P6.1 — merge drill, full acceptance re-run, hardening

- **Upstream merge check:** `upstream/main` is `617cfbf` (same commit P1.2
  audited §2 against) and is an ancestor of this branch's `HEAD` — upstream has
  not moved since the fork point, so no real `git merge upstream/main` was
  needed this pass. Re-check this before every release; the trial-merge
  acceptance (Phase 1) still applies once upstream does move.
- **Group-chat safety (by architecture, re-verified P6.1):** every message
  extractor (`sentinelCore.extractWindowMessages`, `auditorCore.extractAuditMessages`,
  `clipperPlusCore.buildContextWindow`) reads `m.name`/`m.is_user` per message —
  never a fixed `name2`/`this_chid` — so multi-character group chats are handled
  without special-casing. Regression tests added (P6.1): a 3-distinct-character
  chat is exercised through each extractor. Sentinel memory writes delegate to
  upstream's own `runSceneMemoryRange` → `compileScene`, which already computes
  group `characterFilterNames`; Auditor/Clipper+/Injection intentionally write
  un-filtered keyword-activated living lore (persistent facts aren't scoped to
  "who's currently in the scene"), so no fork-side group filtering was added
  there — this is a deliberate design choice, not a gap.
- **Mid-job API-failure surfacing (no silent poisoning):** audited every
  fork subsystem's error path.
  - Sentinel: fixed prior to this pass (commit `e4103e6`) — a mid-cycle
    `runSceneMemoryRange` failure now toasts.
  - Auditor dashboard job (`executeAuditJob`): already surfaced via
    `context.setDetail("...extraction error, continuing")` per chunk.
  - Auditor **inline fallback** (`runAuditInline`, used when the jobs dashboard
    is unavailable): **was a real gap** — `onProgress` was wired to a no-op, so
    per-chunk extraction errors vanished with no console line and no toast.
    Fixed: tallies errored chunks and appends an
    `"(N chunks had extraction errors and were skipped)"` note to the final
    toast/return message (warning severity, not success, when any occurred).
  - Auditor jobs (`/stmbc-coverage`, `/stmbc-regen`): already toast on failure.
  - Clipper+ (`maybeGeneratePairedContextEntry`): **was a real gap** — every
    "never guess" skip path (`§5.2`) already `return`s before the outer
    `catch`, so that catch is exclusively the genuine-API-error path, yet it
    only did `console.error`. Fixed: now also `toastr.warning`s (the clip
    itself was already saved either way, so severity stays a warning, not an
    error).
  - Injection (`buildLivingContextPreamble`): intentionally left silent
    (`console.warn` + fall back to the base prompt). This runs on *every*
    generation, not as a discrete job — toasting on every failed injection
    would be UX spam, not hardening. Documented here so it isn't mistaken for
    an oversight on a future pass.
  - Bundle rebuilt (`bun run build.ts`) after the Clipper+/Auditor fixes.
- **Full acceptance re-run:** all `*.test.js` suites green (151 cases across
  sentinel/auditor/auditorJobs/clipperPlus/injection/sidePromptSetDefaults/
  stloCharacterFilters, including the 3 new P6.1 group-chat cases). Phase 0
  eval (P0.4) re-run against the fixture via the claude-cli shim; see
  `eval/README.md` for the refreshed result.
