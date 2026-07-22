# STMB-Auto Phase 0 evaluation harness

Reproduces the scene-boundary detection experiment from
`materials/stmb-auto/stmb-auto-plan.md` (§3, Appendix A) on the 329-message
Satire Fantasy Isekai fixture. Phase 0 acceptance gate: **precision ≥ 0.9 at
±1 message tolerance** against the raw ground-truth boundary set.

## Result: PASS (2026-07-21)

| metric | ±1 | ±2 |
|---|---|---|
| precision (raw, 57 boundaries) | **0.917** (33/36) | 0.944 (34/36) |
| precision (merged, 31) | 0.667 (24/36) | 0.861 (31/36) |
| recall (raw) | 0.596 (34/57) | 0.702 (40/57) |
| recall (merged) | 0.677 (21/31) | 0.710 (22/31) |

36 predictions from 18 windows, 0 windows skipped (no JSON failures).
False positives vs raw @±1: ids 2, 174, 241. The gate metric is
precision(raw)@±1 per the plan's convention — every prediction must land on a
real transition; recall is informational at this phase.

## Config that produced the passing run

- Detector model: `claude-haiku-4-5-20251001`, temperature 0 (nominal — see shim note), maxTokens 300
- Prompt: built-in Appendix A (default; no `promptFile` override)
- Windows: 26 messages, 8-message overlap, 500-char truncation, 4-message guard zone (run-detection.js defaults)
- Config file: `detect.config.claude-cli.json` → endpoint `http://127.0.0.1:8787/v1/chat/completions`

Only this config was tried; it passed on the first full run, so no sweep was
needed.

## Cost

The run used the headless Claude Code CLI (subscription seat) via the shim, so
there is no per-token invoice. Estimated volume: 18 calls × (~1k-token system
prompt + ~4–5k-token window) ≈ **~100k input / ~2k output tokens**. At Haiku
4.5 API list price ($1/MTok in, $5/MTok out) that is roughly **$0.11 per full
fixture pass**. Wall clock: ~13 minutes (~40 s/window through the CLI; a
direct API integration would be several times faster).

## Reproducing

```sh
# 1. Parse the SillyTavern JSONL transcript into the normalized fixture
node eval/parse-transcript.js   # → eval/out/fixture.json

# 2. Derive ground-truth labels from the hand-labeled transcript
node eval/derive-labels.js      # → eval/out/labels.json (57 raw / 31 merged scored)

# 3. Start the OpenAI-compat shim over the claude CLI (agent containers only;
#    with real API access point detect.config at your endpoint instead)
node eval/tools/claude-cli-shim.js 8787 &

# 4. Run detection
node eval/run-detection.js --fixture eval/out/fixture.json \
  --config eval/detect.config.claude-cli.json --out eval/out/predictions.json

# 5. Score
node eval/score.js --predictions eval/out/predictions.json --labels eval/out/labels.json
```

`eval/out/predictions.json` keeps per-window raw model output alongside the
deduplicated prediction list, so failed or odd windows can be audited without
rerunning.

## Notes / caveats

- The shim ignores temperature/maxTokens (the CLI doesn't expose them), so
  determinism is nominal, not guaranteed; a rerun may wobble ±1 prediction.
- Scorer conventions (documented in score.js): precision is scored against the
  raw boundary set; the trivial chat-opening boundary (id 0) is excluded from
  both sides; labels count 57 raw / 31 merged after that exclusion (58/32
  before).
- Gate satisfied ⇒ Phase 1 work may open (PHA-1408 tree).
