#!/usr/bin/env bash
# Copyright (C) 2024–2026 Aiko Hanasaki
# SPDX-License-Identifier: AGPL-3.0-only
#
# eval/run.sh — Convenience entry point for the Phase 0 pipeline.
#
# Runs the unit tests, then the pipeline against the bundled fixture with
# the header oracle detector, and prints the path to the report. Pass
# arguments through to eval/run.js if you want to override defaults.

set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== Unit tests ==="
node --test eval/*.test.js

echo ""
echo "=== Pipeline (header oracle) ==="
node eval/run.js "$@"

echo ""
echo "=== Done ==="