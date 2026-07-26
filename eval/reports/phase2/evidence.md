<!--
Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only
-->

# Phase 2 (Sentinel) — acceptance evidence

**Run date:** 2026-07-26
**Branch:** `feat/p2-sentinel-integration`
**Fixture:** `eval/fixtures/transcript.jsonl` — 329 messages, Satire Fantasy Isekai
**Ground truth:** 22 merged boundaries, derived by `eval/groundTruth.js` with the
Phase 0 §3.1 rules (`timeJumpMinutes: 90`, `minSceneMessages: 6`)
**Mode:** fully offline — no network, no SillyTavern, no API keys

## Reproduce

```bash
# 1. The acceptance run (prints the table below; exit 0 = all criteria met)
node eval/runPhase2Acceptance.js

# 2. The same criteria as assertions, plus the harness's own unit tests
node --test eval/phase2Acceptance.test.js

# 3. Machine-readable output
node eval/runPhase2Acceptance.js --json

# 4. Whole suite (464 tests)
node --test *.test.js eval/*.test.js
```

## What is actually being exercised

The harness does **not** reimplement the sentinel cycle. It drives the real
production path end to end:

| Stage | Real code invoked |
| --- | --- |
| settings → engine config | `sentinelCore.sentinelConfigFromAutoSettings` (via `autoSettings.getAutoSettings` / `getChatAutoSettings` / `resolveDetectionPrompt`) |
| MESSAGE_RECEIVED cadence gate | `sentinelCore.isCadenceReached` — the exact predicate `sentinel.js`'s gate calls |
| job factory + on/off gate | `sentinelCadence.enqueueSentinelCycle` (which calls `autoSettings.resolveSentinelEnabled`) |
| job executor, abort, ring buffer | `sentinelCadence.runSentinelCycle` |
| detection engine | `sentinelCore.runSentinelDetectionCycle` (windowing, strict-JSON parse + retry, snap/guard, range planning, sequential memorize) |

Only the two SillyTavern-owned leaves are stubbed, because they cannot exist
offline:

* **`detect(prompt)`** → a perfect-recall *reference detector*. It parses the
  `[id]` prefixes out of the prompt the engine actually built and answers with
  the ground-truth boundaries visible in that window, as strict JSON. It has no
  view of the future, so windowing, the guard zone, and the watermark are
  genuinely tested. This deliberately isolates *cycle* correctness from
  *detector quality* — detector quality is what Phase 0 measured (precision
  0.969 @ ±1, see `eval/`).
* **`runSceneMemoryRange(start, end)`** → a recorder that advances the watermark
  to `end`, which is what a saved memory does to `getHighestMemoryProcessed()`.

## Results

| # | Criterion | Result | Measured |
| --- | --- | --- | --- |
| 1 | Scene memories match Phase 0 harness predictions | **PASS** | boundary coverage **22/22 = 100.0%**; 0 missed; **22** memorized ranges; **0** gaps; **279** cycles (22 `processed`, 257 `no-boundary`); final watermark **315** of 328 |
| 2 | Zero mid-scene cuts | **PASS** | **0** mid-scene cuts; **22/22** range ends land exactly on a ground-truth boundary; live tail of **13** messages left unmemorized (guard = 4) |
| 3 | Reload mid-cycle produces no duplicates | **PASS** | interrupted after **8** scenes (persisted watermark **103**), resumed and added **14**; **0** duplicate ranges, **0** doubly-covered messages, **0** gaps; resulting range list is **byte-identical** to the uninterrupted run |
| 4 | Stopping the sentinel halts it | **PASS, with caveats** — see below | abort after 3 scenes → exactly **3** memorized then stopped; **20** ring-buffer entries recorded (cap 20); with the sentinel disabled: **0** cycles ran, **322** enqueues refused at the resolver gate |

Full memorized range list from the baseline run (0-based chat indices):

```
[0,1] [2,23] [24,29] [30,35] [36,57] [58,91] [92,97] [98,103] [104,117]
[118,125] [126,137] [138,171] [172,183] [184,197] [198,229] [230,243]
[244,257] [258,267] [268,273] [274,291] [292,309] [310,315]
```

Every range's `end + 1` is a ground-truth boundary, and the ranges tile
`0..315` with no gap and no overlap.

## Honest caveats

Read these before treating the table above as a clean sweep.

**1. Criterion 1 measures the cycle, not the detector.** With a perfect-recall
reference detector, 100% coverage is the *ceiling* — it proves the cadence,
windowing, watermark, guard, snap and range-planning logic never loses or
misplaces a boundary the detector reported. It does **not** predict live
accuracy. Real-world coverage is bounded by Phase 0's measured detector
performance, not by this number. A run with a real LLM detector will be lower.

**2. Criterion 2 is verified for reference-detector output only.** "Zero
mid-scene cuts" here means *the cycle never invented a cut of its own* — no
range ended anywhere the detector did not put a boundary. A real detector that
emits a wrong boundary will produce a mid-scene cut, and nothing in Phase 2
prevents that; the guard only protects the *live* scene. So criterion 2 is
better read as "the cycle introduces zero cuts beyond what the detector asks
for" than as an absolute guarantee.

**3. Criterion 3 simulates reload at the state boundary, not process death.**
The reload is modelled the way a real one works: everything in memory is
discarded and the run restarts from the persisted watermark only. It does not
simulate a crash *during* `runSceneMemoryRange` (i.e. a memory half-written to
the lorebook). That failure mode is owned by the memory pipeline, not the
sentinel, and is out of Phase 2's scope.

**4. Criterion 4 — "`/stmb-stop` halts it" needs qualifying.** Two distinct
things were verified, and they are not the same thing:

* *Abort halts an in-flight cycle.* Verified for real, end-to-end: the job's
  abort signal is threaded through `runSentinelCycle` into
  `runSentinelDetectionCycle`, which checks it at cycle start, before the
  detection call, and between scenes. Finished scenes are kept (the watermark
  has already advanced), the remainder is not started, and the cycle is recorded
  as `abort:cancelled` / `status: 'cancelled'` in the ring buffer. This became
  genuinely testable only after this branch put the engine inside the executor —
  before the integration the abort interrupted a stub that did nothing.
* *Abort does not turn the sentinel off.* `/stmbc-stop` calls
  `cancelStmbcJobs()`, which cancels queued and running fork jobs. It does not
  change any setting, so **the cadence gate will enqueue a new cycle on the next
  received message.** To actually stop the sentinel you disable it
  (`autoModule.sentinelEnabled = false`, or per-chat `chat_metadata.stmbc.enabled
  = false`) — that path is verified separately above (0 cycles ran, 322
  enqueues refused). The harness's abort scenario models a user holding the stop
  button down, which is why it reports 292 cancelled cycles rather than one.

The pre-existing P2.3 unit coverage for the command surface is in
`sentinelCadence.test.js` and passes:
`runSentinelCycle: throws AbortError when context signal is already aborted`,
`sentinelCadence.js: executor honors abort signal before touching chat metadata`,
`stmbJobs.js: cancelStmbcJobs filters by the stmbc- prefix`,
`stmbJobs.js: cancelStmbcJobs preserves non-stmbc queued jobs`,
`index.js: defines /stmbc-stop slash command`,
`index.js: /stmb-stop comment notes the sentinel job cancellation`.

**5. `sentinel.js` itself is not covered by any test.** It statically imports
the SillyTavern runtime (`script.js`, `extensions.js`) and `index.js`, so it
cannot be loaded under `node --test`. Its logic is covered indirectly — the
config mapping, the cadence predicate and the engine all live in pure modules
the harness drives — but the ~40 lines of glue in `buildSentinelDeps` and the
gate body are verified only structurally (`sentinelCadence.test.js` asserts, by
reading the source, that the gate enqueues rather than running detection inline
and that on/off comes from `autoSettings.resolveSentinelEnabled`). Nothing here
has been run against a live SillyTavern.

## Observation worth acting on (not a Phase 2 failure)

The baseline run fired **279 cycles to produce 22 memories — 257 of them
returned `no-boundary`.** `isCadenceReached` is a *level* trigger, not an edge
trigger: once the backlog passes `cadenceMessages`, it stays true on every
subsequent message until a memory advances the watermark. In production each of
those cycles is a real LLM detection call. Between two boundaries 34 messages
apart, that is ~26 calls to discover one boundary.

This is P2.1's designed behavior and this branch did not change it — the jobs
queue and the `hasActiveStmbJobs` gate serialize the calls but do not reduce
their count. Worth a follow-up (e.g. back off after a `no-boundary` result, or
only re-run once N further messages arrive since the last cycle rather than
since the watermark). Flagging rather than fixing, since it is a behavioral
change outside this branch's remit.
