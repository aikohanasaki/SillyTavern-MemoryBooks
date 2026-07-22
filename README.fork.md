<!--
Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only

Fork branding addendum. Read this in addition to the upstream README.
-->

# 📕 Memory Books — Auto (SillyTavern-MemoryBooks-Auto)

A fork of [SillyTavern-MemoryBooks](https://github.com/aikohanasaki/SillyTavern-MemoryBooks)
that adds three new subsystems on top of the upstream feature set:

1. **Sentinel** — an LLM watches the chat, detects completed scene boundaries in plain
   prose, and drives STMB's own memory pipeline automatically. Replaces the native
   auto-summary. (Plan §4.1)
2. **Clipper+** — every saved clip gets a paired context entry (≤50-word blurb + 3-6
   keywords). User highlight stays in the loop; the fork adds the explanation. (Plan §4.2)
3. **Auditor** — chunked, resumable full-chat re-read that regenerates living entries
   from source, audits coverage, and runs the keyword/recursion/probability technical
   pass. The antidote to lorebook staleness. (Plan §4.3)

Plus the supporting plumbing: per-chat settings overrides, the offline eval harness,
event-template preset, and the merge discipline (every upstream-touched line is
greppable via `STMBC-HOOK`).

**Working name:** `SillyTavern-MemoryBooks-Auto` (STMB-Auto)
**Upstream:** https://github.com/aikohanasaki/SillyTavern-MemoryBooks (AGPL-3.0-only)
**License:** AGPL-3.0-only (inherited from upstream; non-negotiable per plan §1.1)

---

## Quick start

### Installation (fork over stock STMB)

The fork is designed to **install over the stock extension** without touching your
data. Your existing lorebooks, memories, clips, side prompts, profiles, and settings
keep working unchanged.

1. **Disable stock STMB** in SillyTavern's Extensions menu (toggle off `📕 Memory Books`).
2. **Install the fork** as a third-party extension, replacing the stock one:
   - Either point SillyTavern's "Install extension" at this repo's URL, OR
   - Drop the fork folder into `SillyTavern/public/scripts/extensions/third-party/`
     and remove the stock `SillyTavern-MemoryBooks` folder.
3. **Reload** SillyTavern. The new extension appears as `MemoryBooks Auto` in the
   Extensions menu (display name from `manifest.json`).
4. **Verify data compat**: open any existing chat with prior STMB memories. They
   should still appear under the chat's lorebook. The settings key
   `STMemoryBooks` and lorebook flags `stmemorybooks` / `[STMB Clip]` are
   preserved — your existing lorebook data is untouched.

The fork's home URL is `https://github.com/phattbeats/SillyTavern-MemoryBooks-Auto`.

### Migration from stock STMB

| Aspect | Stock | Fork | Compat |
| --- | --- | --- | --- |
| Settings key | `extension_settings.STMemoryBooks` | unchanged | ✅ |
| Lorebook flag | `stmemorybooks` | unchanged | ✅ |
| Clip marker | `[STMB Clip]` | unchanged | ✅ |
| Display name | `Memory Books` | `MemoryBooks Auto` | (UI label only) |
| Module name in manifest | `STMemoryBooks` | `STMemoryBooks` | ✅ |
| Auto-summary | runs on cadence | **disabled while sentinel is on** | New behavior; toggle sentinel off to restore |
| Side prompts | runs on triggers | unchanged + per-scene filter (character-scoped) | New opt-in behavior |

### Recommended profile setup

The fork's detection runner (Sentinel) is the new hot path. It's worth running on a
**cheap, fast profile** distinct from your memory-generation profile.

1. Open **Memory Books → 🛰️ Auto Module (Sentinel)** in the Extensions menu.
2. **Detection profile:** choose a profile (or leave on "Use default STMB profile").
   A smaller/cheaper model is fine — detection doesn't need prose quality, it needs
   to follow the JSON array output contract reliably.
3. **Cadence:** 8 messages (default). The sentinel fires when ≥N new messages arrive
   since the last cycle.
4. **Window size:** 26 messages, 8-message overlap, 500-char truncation, 4-message
   guard. These match the validated configuration from plan §3.1.
5. **Detection prompt:** leave empty to use the bundled baseline (plan Appendix A).
6. **Enable Sentinel.**

Memory generation should still use your primary STMB profile (the one that produces
the highest-quality summaries). The fork doesn't touch this pipeline.

### Sentinel on/off per chat

For per-chat overrides: **Memory Books → 🛰️ Auto Module (Sentinel)** → "Sentinel
enabled for this chat" section. Set per-chat override to force on/off, or leave the
checkbox unchecked to follow the global setting. Per-chat structure-hint regex is
also available if your narrator uses a fixed pattern (e.g. a header stamp) — the
hint becomes a free deterministic boundary source; the LLM remains the fallback.

### Native auto-summary vs Sentinel

When Sentinel is enabled for a chat, native auto-summary is **force-disabled** (plan
§4.1). The auto-summary settings panel shows a warning and the controls are dimmed.
Disable Sentinel to restore them. The native `autosummary.js` module is intentionally
left intact for mergeability — the gate is configuration, not code change (plan
§1.2 rule 4).

---

## Offline eval harness

The fork ships with a Node-based eval harness at `eval/` so you can iterate on
detection prompts/models without booting SillyTavern. It scores predicted boundaries
against header-derived ground truth at ±1 and ±2 message tolerance.

```bash
cd SillyTavern-MemoryBooks-Auto
node eval/run.js                                    # smoke-test with header oracle
node eval/run.js --detector stub \
  --predictions path/to/predictions.json --out eval/reports/run1
node --test eval/*.test.js                          # 47+ tests
```

See `eval/README.md` for the full CLI and the scoring definition.

---

## Merge map

Every upstream file the fork touches is documented in `FORK_NOTES.md` with the exact
lines, the reason, and the merge-conflict risk. After `git fetch upstream && git merge
upstream/main`, only the lines listed there should conflict — and every conflict
should resolve by re-checking that the upstream change didn't move the fork's call
site.

Hooks are greppable via `STMBC-HOOK`. The fork adds ~5 new files (eval/, autoSettings.js,
sceneCharacterFilter.js) and ~10 single-line call sites; all upstream function
bodies, control flow, and data structures are untouched.

---

## Running tests

```bash
bun run build                                      # produces index.build.js (committed)
node --test *.test.js eval/*.test.js               # all tests
```

---

## License & copyright

The original code in this repository is Copyright © 2024–2026 Aiko Hanasaki and is
licensed under the GNU Affero General Public License v3.0. Fork additions are
also AGPL-3.0-only. Modified versions must preserve applicable copyright and license
notices, identify their modifications, and comply with the AGPL's source-availability
requirements. See [`LICENSE`](./LICENSE).

Upstream: https://github.com/aikohanasaki/SillyTavern-MemoryBooks
Fork: https://github.com/phattbeats/SillyTavern-MemoryBooks-Auto
