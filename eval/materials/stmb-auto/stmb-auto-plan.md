# MemoryBooks Auto — Full Design & Implementation Plan (Fork Architecture)

**Project:** Fork of SillyTavern-MemoryBooks (STMB) adding automatic scene detection, smarter clips, and a living-lorebook maintenance system.
**Working name:** `SillyTavern-MemoryBooks-Auto` (STMB-Auto)
**Status:** Design validated; boundary detection empirically proven; fork architecture decided (2026-07-20).
**License:** AGPL-3.0-only (inherited from upstream; non-negotiable).
**This document is standalone.** Everything an implementing agent needs is here or linked. The full RP transcript used as the eval fixture is supplied alongside this document.

---

## 1. What this is

**SillyTavern-MemoryBooks** (https://github.com/aikohanasaki/SillyTavern-MemoryBooks) is the best long-term-memory extension for SillyTavern: it turns user-marked "scenes" into structured lorebook memories, with profiles, consolidation tiers, compaction, side prompts, and clip capture. Its weakness: the *when and where* of memory creation is manual (chevron buttons per scene) or dumb (fixed message-count auto-summary with popups), and without deliberate upkeep the resulting lorebook goes stale in a long story.

This fork adds three subsystems:

1. **Sentinel** — an LLM watches the chat, detects completed scene boundaries in plain prose (validated: ~1.0 precision, see §3), and drives STMB's own memory pipeline automatically. Replaces the native auto-summary.
2. **Clipper+** — the user still highlights the quote (human taste stays in the loop); the fork saves it verbatim as today, *plus* generates a keyword-activated, recursion-proof context entry explaining the quote's scene.
3. **Auditor** — a chunked, resumable full-chat re-read that regenerates living entries from source, audits coverage, and runs the keyword/recursion/probability technical pass. The antidote to lorebook staleness and incremental drift.

Everything runs inside SillyTavern against the user's configured connection profiles. No external services.

### 1.1 Why a fork (decision record)

A companion extension was designed first and rejected. Findings that drove the reversal:

- STMB has **no extensibility surface**: no custom events emitted, no hook system (its `hooks/` dir is just a git pre-commit build script). A companion would couple to internals through string-matching and settings-poking anyway — all the fragility of a fork, none of the access.
- STMB ships as a **bundle** (`index.build.js`, built by `bun run build`, enforced by the pre-commit hook; the manifest loads the bundle). Importing its source modules from outside would dual-instantiate module state. Inside the fork, we simply import them.
- Concrete companion pain points that vanish in a fork: reimplementing the clip selection UI, replicating clip entry formats by hand, an unresolved hack for injecting context into STMB's generation, and racing/warning against native auto-summary.
- Users would install STMB regardless; a fork is one install, one settings panel, one job queue.

### 1.2 Merge discipline (the price of the fork, and how we keep it low)

The explicit goal: **substantial upstream changes must remain mergeable.** Upstream is a single active author moving quickly; a smeared fork dies in three releases. Rules:

1. **All new code lives in new files:** `sentinel.js`, `clipperPlus.js`, `auditor.js`, `injection.js`, `autoSettings.js` (+ eval/, docs). Upstream files get **single-line call sites only**, each tagged with a greppable comment: `// STMBC-HOOK: <what and why>`.
2. **FORK_NOTES.md** at repo root lists every upstream file touched, the exact hook lines, and why. This file *is* the merge map: after `git merge upstream/main`, re-verify each listed hook, nothing else.
3. Git setup: `origin` = the fork, `upstream` = aikohanasaki's repo. Merge upstream on a schedule (each upstream release or monthly). Never edit `index.build.js`/`style.build.css` by hand — they're build artifacts; install the repo's own pre-commit hook so builds stay enforced.
4. **Prefer configuration over modification:** where STMB behavior can be steered by its own settings (`extension_settings.STMemoryBooks.moduleSettings`), do that instead of code changes (e.g. force-disable native auto-summary via settings + hide its UI row, rather than deleting the module).
5. **Long-term exit:** once stable, offer the hook points (not the features) upstream as a small PR. If accepted, the diff shrinks toward "additive files only" and merges become trivial.
6. Renaming: keep the extension's internal settings key (`STMemoryBooks`) and lorebook flags (`stmemorybooks`, ` [STMB Clip]`) **unchanged** so existing user data and lorebooks keep working; only the display name and repo name change.

---

## 2. Upstream codebase map (verified July 2026 — re-verify against current main before Phase 1)

Repo: https://github.com/aikohanasaki/SillyTavern-MemoryBooks — AGPL-3.0-only. ~38K lines source. Key modules:

| File | Role | Fork touches it? |
|---|---|---|
| `index.js` (~11K lines) | Init, settings UI, slash commands (`registerSlashCommands()` ~line 9670), scene commands (`handleSceneMemoryCommand` → `runSceneMemoryRange(start,end)`) | **Yes** — init hook for our modules; register our slash commands; settings panel section |
| `autosummary.js` | Native fixed-interval auto-summary (popup-heavy counter) | **Superseded** — sentinel replaces it; force-disabled via settings, module left intact for mergeability |
| `stmemory.js` | Memory generation pipeline (prompt assembly, JSON validation) | **Yes** — one hook where prompt context is assembled, calling our `injection.js` (living-entry context, delta-not-rehash instructions, error-control rules) |
| `clipManager.js` (~111K) | Clip selection UI, `[STMB Clip]` entries, topical clips, compaction popups. Exports `openClipModalFromSelection`, `makeClipEntryTitle`, `createClipEntryContent`, marker helpers; tracks selection's `mesid` | **Yes** — one hook in the clip-save path calling `clipperPlus.js` to generate + write the paired context entry |
| `sidePrompts.js` / `sidePromptsManager.js` | Updatable tracker entries; can auto-run after memory creation; sets | **Yes** — hook or config so per-scene runs are filtered to characters present in the scene (via `stloCharacterFilters.js` if sufficient — check first) |
| `profileManager.js` | Connection/model/temperature/prompt profiles | No — **reused**: sentinel/auditor get their own profile pickers pointing at STMB profiles (detection wants a cheap model) |
| `stmbJobs.js` | Job queue + dashboard (active/failed/review) | Minimal — register our job types (sentinel cycle, audit chunks, review queue) |
| `sceneManager.js` | Scene marker state (chevrons) | No — sentinel bypasses markers, calls `runSceneMemoryRange` directly |
| `summaryPromptManager.js`, `templates*.js` | Built-in prompt presets | No — we add presets via the existing preset mechanism if possible |
| `addlore.js`, `lorebookValidation.js`, `utils.js` | Lorebook entry writing/validation | No — reused as-is |

Slash commands (kept, still useful for scripting): `/creatememory`, `/scenememory X-Y`, `/nextmemory`, `/stmb-catchup interval start end`, `/stmb-highest`, `/stmb-stop`, side-prompt commands. **New commands the fork adds:** `/stmbc-detect` (force a sentinel cycle), `/stmbc-audit [job]`, `/stmbc-stop` (halt our jobs; also wired into `/stmb-stop`).

Core STMB facts to preserve: memories are lorebook entries flagged `stmemorybooks` with auto-numbering and title templates; generation prompts **must return strict JSON** `{"title","content","keywords"}`; lorebook binding modes auto/auto-create/manual; up to 7 previous memories injectable as context; consolidation tiers (Arc/Chapter/Book…) and compaction with review popups.

Build/dev workflow: Bun (`bun run build` → `index.build.js`); install repo pre-commit hook; manifest loads the bundle. SillyTavern extension docs: https://docs.sillytavern.app/for-contributors/writing-extensions/ · World Info docs: https://docs.sillytavern.app/usage/core-concepts/worldinfo/

---

## 3. Validated core: scene boundary detection

**This was the #1 design risk and it was empirically retired on 2026-07-20.**

### 3.1 Eval design (reproducible — Phase 0 rebuilds the harness)

Fixture: a real 328-message SillyTavern RP transcript ("Satire Fantasy Isekai", supplied with this plan). Narrator messages carry headers `[ 🕰️ Time … | 🗓️ date … | 📍 Location … | weather ]`. Ground truth = header-derived boundaries (location change, or >90-min time jump): 58 raw; 32 after merging scenes shorter than 6 messages. **Headers and internal-thought blocks were stripped before detection** — the model saw only plain prose, i.e. the generic, structure-free case (most chats are plain novel format, 1st or 3rd person).

Method: sliding windows of 26 messages, 8-message overlap; prompt asks for a JSON array of message IDs that BEGIN a new scene; never cut within the final 4 messages of a window.

### 3.2 Results

| Config | Precision (±1 msg) | Recall | Prompt size |
|---|---|---|---|
| Full text, conservative prompt | 0.94 | 26% | ~10K tok |
| Truncated 500 chars/msg | 0.93 | 52% | ~4K tok |
| Truncated + sensitivity-tuned prompt | 1.00 | 67–74% | ~4K tok |

Findings, in order of importance:

1. **The model does not hallucinate boundaries.** Every prediction spot-checked against the hidden headers sat exactly on a real location/time transition — including several the merged ground truth had collapsed. Effective precision ≈ 1.0.
2. **The failure mode is one-sided and benign:** missed micro-hops (room-to-room) merge into *larger* scenes. Largest merged scene ≈ 13K tokens — comfortably within memory-generation budget.
3. **Truncating messages to their first 500 chars IMPROVED recall (26%→52%) at equal precision while cutting cost ~60%** — transition language lives in message openings. Truncated windows are the production default.
4. Sensitivity-tuned prompting (mark every location change however small; dreams, cutaways, interludes; "sensitive rather than conservative") reached ~70% recall at zero precision cost.

Caveats: one transcript, one genre, Claude-family detector. Treat numbers as "approach validated," not gospel; the detection prompt stays user-editable, and the Phase 0 harness makes any prompt/model change measurable.

### 3.3 Production detection config (defaults; all user-tunable)

- Window: unprocessed tail (watermark+1 … latest) plus 4-message overlap before it; cap ~26 messages. Watermark = `/stmb-highest`, with own `chat_metadata` fallback for chats with no memories yet.
- Messages truncated to 500 chars, formatted `[id] SpeakerName: text…`.
- Baseline prompt: Appendix A. Per-chat override supported.
- Guard: never emit a boundary within the final 4 messages (scene may be incomplete; detection intentionally runs one scene behind).
- Cadence: run after `GENERATION_ENDED` when ≥N new messages since last cycle (default 8) and no STMB job in flight.
- On confirmed boundary B with watermark W: run memory for `W+1 … B-1` via `runSceneMemoryRange`; multiple boundaries fire sequentially oldest-first, awaited.
- JSON discipline: parse strict array; one retry with "JSON only" reprimand; on second failure skip the cycle — never guess.
- Optional per-chat **structure hint**: user-supplied regex (e.g. header stamps like the fixture's) as a free deterministic boundary source; LLM remains fallback/tiebreaker. Auto-suggest when a repeating bracket pattern is detected in narrator messages.
- Cost: ~4K prompt tokens per probe, ~1 probe per scene at measured density (avg scene ≈ 11 messages). Negligible next to memory generation.

---

## 4. Architecture (three subsystems inside the fork)

### 4.1 Sentinel (`sentinel.js`)

Per cycle: counter check → watermark → build truncated window → detection call on a **dedicated cheap profile** (reuse profileManager; add "detection profile" picker) → snap/guard boundaries → `runSceneMemoryRange` per boundary (direct call, we're inside the extension) → post-scene side-prompt pass (§4.4) → log cycle (window, raw output, action) to a ring buffer in `chat_metadata` for debugging. Registered as a job type in `stmbJobs.js` so the dashboard shows it and `/stmb-stop` halts it. Native auto-summary force-disabled while sentinel is enabled for a chat.

### 4.2 Clipper+ (`clipperPlus.js`)

Hooked into clipManager's save path (one `STMBC-HOOK` line). On clip save:
1. Already have: verbatim selection, containing `mesid`, target clip entry (constant, `[STMB Clip]` format — unchanged upstream behavior).
2. Added: capture surrounding K messages (default 6, truncated); LLM generates ≤50-word context blurb + 3–6 keywords (proper nouns from quote + blurb) + headline; small editable confirm (skippable via "auto-accept" setting).
3. Write the **paired context entry**: keyword-activated (generated keywords), `preventRecursion: true` + `excludeRecursion: true` (blurbs name multiple characters; without this one clip cascades half the cast), content = blurb + provenance (`src: msgs X–Y`), title cross-references the quote entry. Never constant — the quote stays cheap and always-on; the explanation costs tokens only when relevant.

### 4.3 Auditor (`auditor.js`)

The in-extension cold path. Principle (from the proven lorebook-building method, §5): *read everything; incremental-only maintenance decays; search-style shortcuts are a degraded fallback.*

- **Mechanics:** full chat array is in memory in-browser. Chunk walker: default 40 messages/chunk within a token cap (~20K); map-reduce with a running-notes object (characters/locations/events seen, name collisions, claims to verify). Checkpoint (chunk index + notes) to `chat_metadata` after each chunk; resume after reload; `/stmbc-stop` halts. Registered in the jobs dashboard.
- **Jobs** sharing the walker:
  1. **Coverage audit:** running notes vs. existing entries → report of missing/thin entries; one-click generate per item.
  2. **Entry regeneration:** re-derive a chosen living entry *from source chunks where its name appears* (kills rewrite-drift — an entry rewritten 30 times is a photocopy of a photocopy). Diff view; user approves (or auto-approve setting).
  3. **Technical pass:** keyword = common English word; keyword shared across entries; unrestricted recursion on multi-name entries; constant entries over token threshold; protagonist entry at 100% fire rate → report + suggested fixes (protagonist: probability 70–90% with recursion excluded).
  4. **Claim re-verification:** entries with provenance ranges → re-read ranges, confirm or flag. Contradictions are *reported*, never silently reconciled.
- **Cadence:** on demand + a non-blocking offer every M scene memories (default 15). Never auto-runs.

### 4.4 Living-lorebook orchestration (`injection.js` + config)

- **Scene memories:** STMB pipeline unchanged; add our event-template preset (Appendix B) to the preset list.
- **Character/location entries:** side prompts, rewritten in place, **filtered to characters present in the just-processed scene** (check `stloCharacterFilters.js` first; else cheap name-scan). Caps calls and drift.
- **Context injection (the hook in `stmemory.js`):** before generation, gather token-capped living entries (constant + keyword-matched vs. scene text) and prepend with instructions: *write this scene's memory as a delta against what the book already knows; do not rehash; report contradictions explicitly.*
- **Error-control rules in every generation prompt** (from the case-study failures): "unspecified", never invented; flag ambiguity instead of picking the interesting reading; contradiction = report (injection otherwise entrenches early errors); provenance `src: msgs X–Y` on claims; quotes accrue over the run (cap per entry, replace only if better).
- **Temperature gradient:** recent scenes near-verbatim → nudge user toward STMB consolidation at threshold (default 20 scene memories) → suggest compaction for oversized entries. The fork *prompts*, the user approves — those STMB features keep their review UIs.
- **Review queue:** memories save immediately; low-confidence generations (JSON retry needed, or model self-flags) appear in a review panel (extend the jobs dashboard's "review" state). Automation without silent poisoning.

### 4.5 Settings

Global (`extension_settings.STMemoryBooks.autoModule` — nested under upstream's key to avoid a second settings root): sentinel default on/off, cadence N, window size, truncation length, guard size, detection profile, detection prompt, clip auto-accept, K surrounding messages, audit offer interval M, consolidation threshold, debug logging. Per-chat (`chat_metadata.stmbc`): enabled, watermark fallback, structure-hint regex, prompt override, audit checkpoint, review queue, cycle ring buffer.

---

## 5. Constraints & principles

1. **~50K context budget** for anything sent to the user's model: window + injected entries + last 2–3 memories, hard-capped.
2. **Precision over recall in detection.** Missed cut = bigger scene (fine). Wrong cut = polluted memory (not fine). Never guess on parse failures.
3. **Human taste stays in clips; human sampling stays in review.** Automate paperwork, not judgment.
4. **Auditor reads everything.** Full sequential re-read is the ground truth; incremental updates are the fast path it corrects.
5. **Mergeability is a feature** (§1.2). Every upstream-file edit must justify itself in FORK_NOTES.md.
6. Data compatibility: existing STMB lorebooks, memories, clips, and settings must keep working under the fork unmodified.

---

## 6. Implementation phases

Turn each phase into subtasks; do not advance past failing acceptance criteria.

### Phase 0 — Eval harness (offline; no SillyTavern needed)
Standalone Node script in `eval/`: parse the supplied transcript (speaker tags `Brandon:` / `Satire Fantasy Isekai:`, configurable), derive header ground truth, strip headers/thought blocks, build truncated windows, run detection against any OpenAI-compatible endpoint, score precision/recall ±1/±2.
**Accept:** reproduces ≥0.9 precision (±1) with the Appendix A prompt on the fixture; a config/model swap re-scores in one command.

### Phase 1 — Fork setup + touch-point map
Fork repo; set `origin`/`upstream`; install pre-commit hook; verify `bun run build` works; rename display name only (keep settings/flag keys); create FORK_NOTES.md; **audit current upstream main against §2's map and update it** (the map is from July 2026 and upstream moves fast); place empty `STMBC-HOOK` call sites for init, stmemory prompt assembly, clip save path, side-prompt filtering; confirm a no-op build loads cleanly in a live SillyTavern install.
**Accept:** fork builds and loads; FORK_NOTES.md lists every touched line; a trial `git merge upstream/main` on a scratch branch completes with conflicts confined to listed hook sites (or none).

### Phase 2 — Sentinel
Implement §4.1 end-to-end, including detection-profile picker, jobs-dashboard registration, force-disable of native auto-summary, `/stmbc-detect`, ring-buffer logging.
**Accept:** importing the fixture chat fresh, the sentinel autonomously produces scene memories matching harness predictions; zero mid-scene cuts on manual review; page reload mid-cycle produces no duplicate memories (watermark integrity); `/stmb-stop` halts it.

### Phase 3 — Clipper+
Implement §4.2 via the clip-save hook.
**Accept:** a highlighted quote yields the unchanged upstream clip entry *plus* the paired context entry; context entry fires only on its keywords and cascades nothing (verify with ST world-info debug); compaction still lists the quote entry; upstream clip behavior with the feature toggled off is byte-identical.

### Phase 4 — Living-lorebook orchestration
Injection hook, per-scene side-prompt filtering, provenance lines, review queue, consolidation/compaction nudges, event-template preset.
**Accept:** after 5 sentinel scenes on the fixture, a main character's entry shows accumulated, non-duplicated updates with provenance; an injected-context generation demonstrably references established facts; a forced-low-confidence memory appears in the review panel.

### Phase 5 — Auditor
Chunk walker (checkpoint/resume/halt), then the four jobs with report UIs.
**Accept:** full audit of the 328-message fixture completes within per-chunk token caps and survives a mid-run reload; coverage report catches a deliberately deleted character entry; technical pass catches a deliberately planted keyword collision (e.g. keyword "button").

### Phase 6 — Merge drill, hardening, release
Perform a real upstream merge if upstream has moved; re-run all acceptance tests. Group-chat testing; API-failure surfaces mid-job; README (install, migration from stock STMB = install fork over it, data untouched; recommended profile setup); CHANGELOG; AGPL headers on new files; tag v0.1.0. Optional: open the hook-points PR upstream.
**Accept:** clean install on stock SillyTavern release branch following only the README; post-merge test suite green.

---

## Appendix A — Baseline detection prompt (validated; user-editable)

```
You are a scene-boundary detector for long-form fiction. Below are numbered
messages in the form "[id] Speaker: text" (truncated). Identify every message
ID that BEGINS a new scene. Mark EVERY change of location however small (room
to room, indoors to outdoors), any time skip of an hour or more, dream
sequences, cutaways, and interludes. Be sensitive rather than conservative.
Continuous action in one place is ONE scene even if the topic shifts.
Do NOT mark any boundary within the final 4 messages (that scene may be
incomplete). Reply with ONLY a JSON array of integers, e.g. [12, 27], or [].
```

## Appendix B — Entry templates (proven in prior lorebook work; use verbatim)

**Character (side-prompt target):** Name / Age / Race / Home Location / Status / Personality / Physical Description / Actions in Story / Relationships / Key Abilities-Ranks / Key Quotes. Rules: length proportional to page-time; "unspecified" for unstated facts — never invent; 2–3 quotes spread across the story, capped; claims may carry `src: msgs X–Y`.

**Event (memory preset output, inside STMB's required JSON `content`):** Name / Summary / Key Events / Significance / Key Quotes.

**Location:** Name / Summary / Features / Status / Key Quotes (optional).

**Technical defaults:** most entries recursion-proof (`preventRecursion` + `excludeRecursion`); cascading only for deliberately linked clusters; protagonist entry at 70–90% probability with recursion excluded; watch keyword-vs-common-word collisions (canonical example: a character named "Button").

## Appendix C — Links & materials

- Upstream: https://github.com/aikohanasaki/SillyTavern-MemoryBooks (AGPL-3.0-only; re-verify §2's code map against current main in Phase 1)
- SillyTavern: https://github.com/SillyTavern/SillyTavern · extension docs: https://docs.sillytavern.app/for-contributors/writing-extensions/ · World Info: https://docs.sillytavern.app/usage/core-concepts/worldinfo/
- Eval fixture: full "Satire Fantasy Isekai" transcript, supplied with this plan (328 messages; headers = free ground-truth labels; strip before detection)
