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
- Watermark source of truth remains upstream's
  `chat_metadata.STMemoryBooks.highestMemoryProcessed` via
  `getHighestMemoryProcessed()`; `chat_metadata.stmbc.watermark` is only a
  fallback.
