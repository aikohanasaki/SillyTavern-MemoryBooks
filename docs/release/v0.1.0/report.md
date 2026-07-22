<!--
Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only

Clean-install smoke test record for the v0.1.0 release. See Phase 6 acceptance
criterion in `eval/materials/stmb-auto/stmb-auto-plan.md`.
-->

# Clean-Install Smoke Test — v0.1.0

**Date:** 2026-07-22T01:10:43Z
**Fork commit:** 38e6f5976610799d115e531cfd56e211a573becf
**Stock SillyTavern:** release branch (fetched 2026-07-22)
**Tested by:** Ledger (openclaw_gateway) on PHA-1466

## Procedure

1. Fetched stock SillyTavern release branch:
   `curl -sL https://codeload.github.com/SillyTavern/SillyTavern/tar.gz/refs/heads/release -o st.tar.gz`
2. Extracted to `/tmp/st-clean-test/SillyTavern-release/`
3. Dropped fork into `public/scripts/extensions/third-party/SillyTavern-MemoryBooks-Auto/`
   (the canonical third-party extension location per the README)
4. Ran the README's "Quick start" verification commands unmodified:
   - `node --test *.test.js eval/*.test.js`

## Result

**228 / 228 tests pass** (180 fork unit tests + 47 eval harness tests + 1 STLO filter test).

Build artifact `index.build.js` (835KB) parses cleanly via Bun `bun build --target browser`.
All 18 ESM import paths in the build resolve to existing stock SillyTavern modules:

  ✓ `../../../../lib.js`
  ✓ `../../../../script.js`
  ✓ `../../../extensions.js`
  ✓ `../../../extensions/regex/engine.js`
  ✓ `../../../group-chats.js`
  ✓ `../../../i18n.js`
  ✓ `../../../macros/macro-system.js`
  ✓ `../../../openai.js`
  ✓ `../../../popup.js`
  ✓ `../../../power-user.js`
  ✓ `../../../preset-manager.js`
  ✓ `../../../slash-commands.js`
  ✓ `../../../slash-commands/SlashCommand.js`
  ✓ `../../../slash-commands/SlashCommandArgument.js`
  ✓ `../../../slash-commands/SlashCommandEnumValue.js`
  ✓ `../../../slash-commands/SlashCommandParser.js`
  ✓ `../../../utils.js`
  ✓ `../../../world-info.js`

## Data-compat verification

Per the README §'Migration from stock STMB':

| Aspect | Compat | Verified |
| --- | --- | --- |
| Settings key `STMemoryBooks` | unchanged | ✓ (manifest.js exports + addlore.js reference) |
| Lorebook flag `stmemorybooks` | unchanged | ✓ (no renames in source) |
| Clip marker `[STMB Clip]` | unchanged | ✓ (clipManager.js preserved) |
| Manifest `js` | `index.build.js` | ✓ (file exists, 835KB, parses) |
| Manifest `css` | `style.build.css` | ✓ (file exists, 10KB) |

## Hook call sites preserved

All STMBC-HOOK markers in the fork land on lines that exist in stock SillyTavern
(verified by extracting the upstream file at the matching commit and diffing the
hook lines):

  - `index.js:11230` (extension init) — upstream function body unchanged, hook is
    an additive `try { void globalThis.STMBC?.onExtensionInit?.(...) } catch{}` line.
  - `stmemory.js:1461` (prompt assembly) — additive `const livingContext = ...` line.
  - `clipManager.js:718` (clip save path) — additive `const clipperPlus = ...` line.
  - `sidePrompts.js:1655` (side-prompt filter) — additive `const filtered = ...` line.
  - `sidePrompts.js:1404` (per-scene filter) — additive 12-line block.
  - `utils.js` (event preset) — additive `event` entry in 3 maps.
  - `constants.js` (event preset display) — additive 2 map entries.
  - `autosummary.js` (sentinel gate) — additive `isAutoSummaryBlockedBySentinel` helper.
  - `templates.js` (sentinel UI) — additive warning block + `disabled` attrs.
  - `index.js:9347` (auto-summary enabled gate) — additive conditional refuse.
  - `index.js:2039` (auto-settings backfill) — additive `initializeAutoSettings` call.
  - `addlore.js:648` (provenance line) — additive `appendProvenanceLine` call with inline fallback.

## Phase 0 acceptance note

The eval pipeline (eval/run.sh) runs against the header oracle detector and exits 1 with
precision 0.33 < 0.90 at ±1 message tolerance. This is expected — the header oracle is a
perfect-recall stub meant to validate the eval infrastructure, not the detection model.
Detection quality is the Phase 3 deliverable (separate issue). The eval harness
completes its full pipeline (parse → ground-truth → detect → score → report) without
errors and writes its reports to eval/reports/latest/.

## Verdict

**PASS.** The fork installs cleanly over stock SillyTavern release branch following only
the README. No additional configuration required beyond dropping the folder into
`public/scripts/extensions/third-party/`. Data is untouched. Test suite is green.
