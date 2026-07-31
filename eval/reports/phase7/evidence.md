<!--
Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only
-->

# Phase 7 (Librarian) — acceptance evidence

**Run date:** 2026-07-31
**Issue:** PHA-1637 (P7.4), gating PHA-1633
**Fixture:** `eval/fixtures/transcript.jsonl` — 329 messages, Satire Fantasy Isekai
**Lorebook:** `eval/fixtures/worldbook.json` — 52 entries → 52 catalog rows, nothing truncated
**Ground truth:** 67 raw → **35 merged** boundaries, `eval/groundTruth.js`, fine-grained
rules (`timeJumpMinutes: 90`, `minSceneMessages: 6`, `mergeMode: 'accumulate'`)
**Mode:** fully offline — no network, no SillyTavern, no API keys

## Reproduce

```bash
# The gate (prints the table below; exit 0 = every gate met)
node eval/runPhase7Acceptance.js

# Machine-readable evidence -> eval/reports/phase7/phase7-acceptance.json
node eval/runPhase7Acceptance.js --json

# The same gates as assertions, plus the harness's own unit tests
node --test eval/phase7Acceptance.test.js

# Whole suite (883 tests)
node --test *.test.js eval/*.test.js

# Against a real endpoint instead of the offline surrogate
node eval/runPhase7Acceptance.js --live --base-url http://127.0.0.1:8787/v1 --model <id>
```

## Verdict

| Gate | Result |
| --- | --- |
| Sanity 1 — boundary key vs independent oracle | **PASS** — P 1.000 / R 1.000 |
| Sanity 2 — oracle librarian covers the key | **PASS** — 100.0% uncapped |
| Gate 1 — parity (librarian disabled) | **PASS** — 0/329 turns divergent |
| Gate 2 — fail-open (API killed mid-session) | **PASS** — 3/3 kill modes, 0/324 turns divergent |
| Gate 3 — entity coverage beats keyword baseline | **PASS** — 33.1% → 38.2% (+5.1 pts) |
| Gate 3b — token budget never exceeded | **PASS** — max 1500 / 1500 tokens, 0 breaches |
| Gate 4 — latency | **PASS** — call p50 609ms (≤2000), cached p50 3.6ms (≤50) |

**PHASE 7 GATE: PASS**

## What is actually being exercised

The harness does not reimplement the librarian. It imports the shipped modules
from the extension root and drives one full retrieval cycle per turn, 329 times:

| Stage | Real code invoked |
| --- | --- |
| catalog build + prompt lines | `catalogCore.buildCatalog` / `formatCatalogLines` |
| window construction | `librarianCore.buildLibrarianWindow` (→ `sentinelCore` builders) |
| the retrieval cycle | `librarianCore.runLibrarianRetrieval` |
| keyword floor | `librarianCore.scanLikelyActiveUids` |
| caps, budget, kind filter | `librarianCore.planLibrarianInjection` |
| injected bytes | `librarianCore.renderInjection` |
| scene cache + top-up | `librarianCacheCore.makeLibrarianCacheSeam` |

The one model-shaped dependency — *which entries does the librarian pick?* — is
injected as `select(prompt) => Promise<text>`, so the identical replay runs
against the offline surrogate, a killed API, or a live endpoint.

The replayed watermark advances to a ground-truth boundary the moment that
boundary's message arrives, which is the same single fact P7.3 keys the cache
on: "the sentinel declared a boundary".

## Ground truth, and the answer-key bug this found

Per comment `083e4488` on PHA-1555, the eval GT must use the fine-grained rules
and an oracle-scores-1.0 sanity gate. Applying that surfaced a live bug.

`eval/groundTruth.js:mergeShortScenes` dropped a boundary iff **that scene's own
length** was below 6, regardless of how long the scene it merged into already
was — so a run of short raw scenes collapsed wholesale. On this fixture it
turned 67 raw boundaries into **22**: exactly the over-merged key the comment
identified as the cause of the phantom P=0.29 "detection regression", and the
one no detector can ever pass a ≥0.90 precision gate against.

The correct reading — and the one `eval/parse-transcript.js` (the original
Phase-0 eval that produced the documented 58 raw / 32 merged) has always
implemented — is to accumulate: cut a new scene as soon as the scene being
built has earned its minimum, dropping the *fewest* boundaries that satisfy the
constraint. That is now `mergeMode: 'accumulate'`, the default. The old rule
survives as `mergeMode: 'own'` so the historical numbers can be reproduced on
demand, never as the default.

Result on this fixture: **67 raw → 35 merged** (was 22). The ratio matches the
original eval's 58 → 32.

The oracle gate caught this working. Before the harness's own oracle was moved
to the same rule, it scored **P=0.545 / R=0.343** against the corrected key —
reproducing the exact symptom the comment described, from the other direction.

### Blast radius

- **Phase 0 detection KPI: unaffected.** The gate metric is precision against
  the **raw** boundary set (`eval/README.md`, "Notes / caveats"), and raw is
  untouched. The merged rows in that table are informational.
- **Phase 2 acceptance: still PASS, now stronger.** Criterion 1 ("scene memories
  reproduce every ground-truth boundary") still holds at coverage 1.0 with no
  gaps — against 35 boundaries instead of 22. Only the hard-coded counts in
  `eval/phase2Acceptance.test.js` moved.
- Full suite: 883/883 green.

## Gate 3 — coverage detail

Ground truth for retrieval: for each scene, the entries whose entity terms
(catalog names, title, primary and secondary keys, ≥4 chars) literally occur in
that scene's text, matched with `librarianCore.termAppearsIn` — the same matcher
the keyword floor and the top-up scan use, so "the key says this entity is
present" and "SillyTavern would have matched this key" cannot drift apart.

Scored at the 34 scene-transition turns — the turn whose reply opens the next
scene, which is where "entries for entities appearing in the NEXT scene" is
actually asked. 531 entity-mentions to cover.

| | coverage |
| --- | --- |
| keyword-only baseline | **33.1%** |
| librarian (floor ∪ injected) | **38.2%** |
| delta | **+5.1 pts** |
| oracle ceiling at the shipped caps | 53.9% |
| oracle uncapped (key-validity gate) | 100.0% |

Per-turn, scored against the next *message* rather than the next scene:
45.0% → 49.8%.

Two things this table is honest about:

1. **The comparison is floor ∪ injected vs floor.** The librarian only ever
   ADDS, and `skipLikelyActive` removes floor entries from its own `included`
   list, so scoring `included` alone would understate it and scoring it against
   a suppressed floor would be measuring a product we did not build.
2. **53.9%, not 100%, is the ceiling.** `maxEntries: 8` and `tokenBudget: 1500`
   bound what *any* selector can cover on this fixture. The librarian closes
   ~25% of the gap between the keyword floor and that ceiling.

### The selector

The default run uses an **offline surrogate**, not a live model — it is
deterministic, so committed evidence reproduces byte for byte. It sees exactly
what the real call sees (catalog lines + window text inside the prompt string)
and nothing about the future; the harness asserts that same-prompt-in gives
same-ids-out. It models the one capability the epic claims a reasoning retriever
has over `key.includes()`: soft lexical match against summaries, one hop of
entity association, and the prompt's own instruction to prefer what a keyword
search would miss.

A surrogate is a surrogate. `--live` runs the identical replay against a real
endpoint and writes `phase7-acceptance.live.json`; that number, not this one,
is the claim to make about a specific model.

## Gate 4 — latency detail

Simulated retrieval-call wall time 600ms (`--api-latency`), matching P7.3's stub.

| | turns | p50 | p95 | max | budget |
| --- | --- | --- | --- | --- | --- |
| call (scene change) | 37 | 608.6ms | 611.3ms | 617.8ms | 2000ms |
| cached | 291 | 3.6ms | 5.9ms | 7.8ms | 50ms |

First cached turn in a fresh V8: **1.9ms**, reported on its own line and
excluded from the percentiles above. It is JIT warm-up, not steady state;
averaging it in would either hide a real regression or manufacture a fake one.

**37 calls across 329 turns — 88.8% of retrieval calls removed by the scene
cache.**

## Gate 2 — fail-open detail

Caching is switched **off** for this test so every turn after the kill actually
reaches the dead endpoint. A fail-open test that passes because it never made
the request proves nothing.

| kill mode | live calls before kill | turns after kill | divergent |
| --- | --- | --- | --- |
| `throw` (ECONNREFUSED) | 5 | 324 | **0** |
| `timeout` (hang → abort) | 5 | 324 | **0** |
| `garbage` (model answers prose) | 5 | 324 | **0** |

## Notes / caveats

- The coverage answer key only lists entries that *can* be injected: disabled,
  empty, and un-catalogued entries are excluded and the exclusions are reported
  (0 on this fixture). Listing unreachable entries would cap every score for
  reasons no selector can fix, and would make the oracle gate unpassable for a
  bug it does not have.
- The P7.3 mid-scene top-up is a second retrieval mechanism, not a rounding
  error: with an empty model selection it still adds coverage on its own, and
  the suite asserts that rather than assuming an empty answer means an inert
  librarian.
- Both oracle gates measure that the answer key and the scorer agree. Neither
  measures quality. That is the point — it is the class of bug that produced
  the phantom P=0.29 regression this project already paid for once.
- Follow-up, not in this gate's scope: re-run the real-LLM Phase-0 detection
  KPI once so its *merged* rows are restated against the corrected key (step 3
  of comment `083e4488`). The gate metric itself (precision vs raw) does not
  move.
