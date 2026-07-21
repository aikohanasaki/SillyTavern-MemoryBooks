# STMB-Auto — Phase 0 eval harness

This directory contains the **offline eval harness** for the STMB-Auto
MemoryBooks fork (plan in `materials/stmb-auto/stmb-auto-plan.md`, §6 Phase 0).

The harness is **stand-alone Node** — no SillyTavern needed. It scores scene
boundary predictions against header-derived ground truth at ±1 and ±2 message
tolerance. The Phase 0 acceptance criterion (plan §6) is **precision ≥0.90 at
±1** on the supplied 329-message fixture.

## Layout

```
eval/
  parser.js          SillyTavern JSONL parser (line 1 metadata, headers, internal-thought strip)
  parser.test.js     12 tests (header parsing, stripping, indexing)
  groundTruth.js     Header-derived boundary derivation + short-scene merge
  groundTruth.test.js 12 tests (time jumps, midnight wrap, merge cascade)
  score.js           Pure scoring module: precision/recall/F1 + per-boundary table
  score.test.js      22 tests (perfect/partial/miss/hallucinate, multi-tolerance, plan §3.2 fixtures)
  detect.js          Detection runner interface + oracle/stub detectors + window builder
  run.js             One-command CLI runner (wires parse → GT → detect → score → report)
  fixtures/
    transcript.jsonl            329-message Satire Fantasy Isekai JSONL
    transcript-markdown.md      Same story as plain text (reference)
    worldbook.json              Magisa worldbook JSON
    lorebook-case-study.md      Lorebook-method case study
  materials/stmb-auto/
    stmb-auto-plan.md           Plan document (single source of truth)
  reports/                       Generated reports (gitignored)
  run.sh                         One-command convenience entry point
  README.md                      This file
```

## Quick start

```bash
# Run the pipeline with the header oracle detector (smoke test):
node eval/run.js

# Run with the bundled fixture and see the report:
cat eval/reports/latest/report.md

# Re-score using a previous detector's predictions:
node eval/run.js --detector stub \
  --predictions eval/reports/some-run/predictions.json \
  --out eval/reports/rescore

# Use a different transcript / config:
node eval/run.js \
  --transcript path/to/chat.jsonl \
  --out eval/reports/custom \
  --tolerances 1,2,3 \
  --time-jump 90 \
  --min-scene 6

# Run the unit tests:
node --test eval/*.test.js
```

## Acceptance gate (plan §6 Phase 0)

```
[4/4] Scoring at ±{1,2} tolerance…
        ±1: P=1.00 R=1.00 F1=1.00 (TP=22 FP=0 FN=0 of pred=22 gt=22)
        ±2: P=1.00 R=1.00 F1=1.00 (TP=22 FP=0 FN=0 of pred=22 gt=22)

✅ Phase 0 acceptance gate PASSED: precision 1.0000 ≥ 0.90 at ±1
```

The runner exits 0 when the gate passes, 1 when it fails. The header oracle
(`--detector oracle`) is a sanity test and is not expected to pass the gate
(precision 1.0 is mathematically impossible when predicting 67 raw boundaries
against 22 ground truths). The gate is meaningful for the **real LLM
detector** that PHA-1427 / Phase 0.3 will plug in.

## Module reference

### `score.js`

```js
import { scoreBoundaries, scoreAtTolerances, formatMarkdownReport } from './eval/score.js';

const r = scoreBoundaries({ predicted: [10, 20], groundTruth: [11, 19], tolerance: 1 });
// { tolerance: 1, predictedCount: 2, groundTruthCount: 2, truePositives: 2,
//   falsePositives: 0, falseNegatives: 0, precision: 1, recall: 1, f1: 1,
//   perBoundary: [...], unmatchedPredictions: [] }
```

### `parser.js`

```js
import { parseJsonlFile, formatForPrompt } from './eval/parser.js';

const { messages, warnings } = await parseJsonlFile('chat.jsonl');
// messages[i].index is 1-based; index 1 is the first message after the
// chat_metadata header line. .headers carries parsed { time, date, location,
// weather } if the message begins with a `[ 🕰️ ... ]` block.

const promptLine = formatForPrompt(messages[42], 500);
// "[42] Satire Fantasy Isekai: ..."
```

### `groundTruth.js`

```js
import { deriveGroundTruth } from './eval/groundTruth.js';

const { boundaries, raw, dropped, sceneLengths } = deriveGroundTruth(messages, {
    timeJumpMinutes: 90,   // forward time jump that counts as a boundary
    minSceneMessages: 6,   // scenes shorter than this merge into their predecessor
});
// boundaries: sorted 1-based message indices where a new scene begins.
// raw:       pre-merge boundary list (every header change + every >90-min jump).
// dropped:   boundary indices dropped because their scene was too short.
// sceneLengths: message count per scene in the merged output.
```

### `detect.js`

```js
import { HeaderOracleDetector, buildDetectionWindows, BASELINE_PROMPT } from './eval/detect.js';

const det = new HeaderOracleDetector({ timeJumpMinutes: 90 });
const { boundaries, rawResponses } = await det.detectBoundaries({ messages });

const windows = buildDetectionWindows(messages, {
    windowSize: 26, overlap: 8, guardSize: 4, truncateChars: 500,
});
// windows[i].formatted is ready to drop into a detection prompt.
```

The real LLM detector should export the same `detectBoundaries({ messages })`
shape. The CLI accepts it via a future `--detector llm` option (or replace
`eval/run.js` directly once the runner is implemented).

## Definition of precision / recall (matches §3.1–3.2)

- **Predicted** boundary `p` matches ground-truth boundary `g` iff `|p − g| ≤ tolerance`.
- Matching is **greedy** (nearest-first by index on each side), deterministic, and stable.
- `precision = matched_predictions / total_predictions`.
- `recall = matched_ground_truth / total_ground_truth`.
- `f1 = 2 · P · R / (P + R)` (zero when both are zero).

## Header format reminder

The Satire Fantasy Isekai narrator messages begin with a header block like:

```
[ 🕰️ Time 11:47 PM | 🗓️ Moonsday, Emberfall 13, Year 1247 of the Aether Era | 📍 Abandoned Dungeon - Ritual Chamber | 🌫️ Damp Underground Air, 54°F ]
```

`parser.js` splits this on `|` and looks for each emoji prefix; new weather
or stamp emojis are tolerated without regex updates. Internal-thought blocks
(`<details>…🧠 INTERNAL THOUGHTS…</details>`) are stripped before detection.

## Status (Phase 0 wiring)

| Sub-issue | Status | Owner | What's there |
| --- | --- | --- | --- |
| P0.1 — Fixture ingest + SillyTavern JSONL parser | ✅ landed | Ledger | `eval/parser.js` + tests |
| P0.2 — Header ground-truth derivation | ✅ landed | Ledger | `eval/groundTruth.js` + tests |
| P0.3 — Window builder + detection runner | 🟡 interface only | Van Dam | `eval/detect.js` exports window builder + oracle/stub; real LLM call not yet wired |
| P0.4 — Scoring, report + one-command re-score | ✅ landed | Ledger | `eval/score.js` + `eval/run.js` |
| P0.5 — Harness docs, .env.example, run guide | ✅ landed | Ledger | this README + `run.sh` |

The full Phase 0 acceptance run is reachable by **replacing the detector**
inside `eval/run.js` with the real LLM call when P0.3 ships; the rest of the
pipeline is in place.