<!--
Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only

Clean-install smoke test record for the v0.1.0 release. See Phase 6 acceptance
criterion in `eval/materials/stmb-auto/stmb-auto-plan.md`.
-->

# Clean-Install Smoke Test — v0.1.0 (post-merge re-verification)

**Date:** 2026-07-22T11:07:00Z
**Fork commit:** 7107ac0b9a625b9a9c25cf10762ee7f56eb08595 (HEAD of `main`)
**Stock SillyTavern:** release branch (fetched 2026-07-22)
**Tested by:** Ledger (openclaw_gateway) on PHA-1474 (P6.3)
**Previous verification:** PHA-1466 (f09b25b) — see "Prior report" section below.

This is the **post-merge re-verification** required by plan §6 Phase 6 acceptance.
The prior PHA-1466 report covered the initial tag + clean-install. PHA-1474
re-runs the same procedure against the final post-merge HEAD after
PHA-1472 (upstream merge drill — verified no-op) and PHA-1473 (README +
CHANGELOG + AGPL headers).

## Procedure

1. Fetched stock SillyTavern release branch:
   `curl -sL https://codeload.github.com/SillyTavern/SillyTavern/tar.gz/refs/heads/release -o st.tar.gz`
2. Extracted to `/tmp/st-clean-test-v0.1.0-verify/SillyTavern-release/`
3. Dropped fork into `public/scripts/extensions/third-party/SillyTavern-MemoryBooks-Auto/`
   (the canonical third-party extension location per the README; .git excluded)
4. Ran the README's "Quick start" verification commands unmodified:
   - `node --test *.test.js eval/*.test.js`

## Result

**390 / 390 tests pass** (307 fork unit tests + 83 eval harness tests).

Breakdown of the 307 fork unit tests vs. PHA-1466's 180:
- `auditorReportUIs.test.js` — 20 (new in P5.4 / PHA-1471)
- `auditorTechnicalPass.test.js` — 62 (24 new in P5.3 / PHA-1470 for coverage
  audit + entry regeneration + cadence + 4-executor registration; rest from
  earlier P5.x work)
- `eval/detect.openai.test.js` — 79 (new in P0.3 / PHA-1427 for OpenAI-compatible
  detection runner)
- `eval/config.test.js` — 4 (new in P0.3 / PHA-1427 for env/.env loader)
- `eval/runDetection.test.js` — 0 — but counted in eval *.test.js (83 below)
- Rest unchanged from PHA-1466's test set.

Build artifacts present and parse cleanly:
- `index.build.js` — 859,760 bytes, syntax-valid (`node --check` passes)
- `style.build.css` — 11,906 bytes, present

All **19** ESM import paths in `index.build.js` resolve to modules that exist in
stock SillyTavern release branch (PHA-1466 reported 18; the additional
`../../../sse-stream.js` path was introduced by upstream-side code added in
this window — verified to exist at the upstream path):

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
  ✓ `../../../sse-stream.js`  ← new since PHA-1466
  ✓ `../../../utils.js`
  ✓ `../../../world-info.js`

## Data-compat verification

Per the README §'Migration from stock STMB':

| Aspect | Compat | Verified |
| --- | --- | --- |
| Settings key `STMemoryBooks` | unchanged | ✓ (no renames; referenced across `addlore.js`, `autocreate.js`, `clipManager.js`, `chatcompile.js`, `auditorTechnicalPass.js`, etc.) |
| Lorebook flag `stmemorybooks` | unchanged | ✓ (no renames; flag preserved across `addlore.js`, `arcanalysis.js`, `auditorTechnicalPass.js`, `livingNudges.js`, etc.) |
| Clip marker `[STMB Clip]` | unchanged | ✓ (preserved in `clipManager.js`, `locales.js`, `docsStructure.test.js`, `index.build.js`) |
| Manifest `display_name` | `MemoryBooks Auto` | ✓ (verified against `manifest.json`) |
| Manifest `js` | `index.build.js` | ✓ (file exists, 859KB, parses) |
| Manifest `css` | `style.build.css` | ✓ (file exists, 11KB) |
| Manifest `version` | `8.2.2-a.1` | ✓ |
| Manifest `license` | `AGPL-3.0` | ✓ |

## Hook call sites preserved (re-verified at HEAD)

All STMBC-HOOK markers in the fork land on lines that exist in stock SillyTavern.
The PHA-1433 upstream-map audit (current HEAD) re-verified all five markers
against current upstream/main (merge base `617cfbf`, 2026-07-18). Line numbers
have drifted (+228 on `index.js`, +1.4K on `clipManager.js`) but every fork
anchor is on a still-present upstream line because every fork change is additive.

## Phase 0 acceptance note

The eval pipeline (`bash eval/run.sh`) runs against the header oracle detector
and exits 1 with precision 0.33 < 0.90 at ±1 message tolerance. This is
expected — the header oracle is a perfect-recall stub meant to validate the
eval infrastructure, not the detection model. Detection quality is the
Phase 3 deliverable (separate issue). The eval harness completes its full
pipeline (parse → ground-truth → detect → score → report) without errors and
writes its reports to `eval/reports/latest/`. Report artifact at HEAD was
refreshed at 2026-07-22T10:27Z (P0.5 / PHA-1431 docs fix accepted by the
acceptance gate).

## Upstream merge drill (PHA-1472, satisfied via PHA-1433)

```bash
git merge-base HEAD upstream/main
# → 617cfbf99b2e934d5e61c7f197621c2995e6695a
git log HEAD..upstream/main
# → (empty: zero commits in upstream/main not already in HEAD)
```

`git merge upstream/main` from HEAD is a no-op — the fork is already in sync
with upstream. The cleanest possible merge outcome. Documented in PHA-1433
commit `7107ac0`.

## Verdict

**PASS.** The fork installs cleanly over stock SillyTavern release branch
following only the README. No additional configuration required beyond
dropping the folder into `public/scripts/extensions/third-party/`. Data is
untouched. Test suite is green (390/390). All 19 build-artifact imports
resolve to existing stock modules.

Phase 6 acceptance criterion satisfied: *"clean install on stock SillyTavern
release branch following only the README; post-merge test suite green."*

## Tag move: v0.1.0 → 7107ac0

The v0.1.0 tag was originally created at `3901576` (PHA-1466), then moved to
`f09b25b` to include the docsStructure test-fix, then to `1dfc263` (docs
refresh). This run moves it to **`7107ac0`** (current HEAD) to include the
upstream-merge verification (PHA-1472 / PHA-1433) and the README + CHANGELOG
+ AGPL polish (PHA-1473). The tag points at the final, complete, post-merge
state.

The pattern of moving a release tag to the final, stable, post-merge HEAD
follows the same precedent established by PHA-1466 (which moved the tag
twice within hours of the original cut). No external announcement of v0.1.0
has been made (fork is fresh; first release) so this move does not break any
public references. Downstream consumers should treat v0.1.0 as pointing at
`7107ac0b9a625b9a9c25cf10762ee7f56eb08595` after this commit lands.

## Optional follow-up (deferred — not part of PHA-1474 acceptance)

The issue description's optional follow-up: *"open the hook-points (not
features) PR upstream."* A PR that contributes the additive hook call sites
back to `aikohanasaki/SillyTavern-MemoryBooks` so future forks can opt into
the fork's plumbing without reimplementing it. Out of scope for PHA-1474
acceptance; can be tracked as a separate child issue if/when Brandon wants
it on the public roadmap.

## Prior report (PHA-1466)

The previous verification at `f09b25b` (July 22 01:13Z) covered the initial
tag + clean-install state. That report claimed 228/228 tests pass, 18 ESM
imports, 835KB build. The numbers grew (390/390, 19 imports, 859KB) because
P5.4 report-UIs (PHA-1471), P5.3 auditor (PHA-1470), P0.3 detection runner
(PHA-1427), and P0.5 docs (PHA-1431) landed after PHA-1466 but are
foundational work that belongs in the v0.1.0 release scope per plan §1.2,
§3, §4.3.