// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// eval/runDetection.js — Phase 0 top-level detection entry point.
//
// runDetection(messages, cfg) builds the detection windows (plan §3.1),
// hands each one to the supplied detector, and dedupes predicted
// boundary IDs across overlapping windows. It is the deliverable specified
// in PHA-1427 ("Window builder + detection runner").
//
// cfg (in addition to detector-specific keys):
//   windowSize       default 26
//   overlap          default 8
//   truncateChars    default 500
//   guardSize        default 4
//   detector         instance with detectBoundaries({ messages, windows })
//                    — typically new OpenAIDetector({...})
//
// Returns:
//   {
//     boundaries: number[],        // sorted, deduped 1-based message IDs
//     rawResponses: object[],     // concatenated per-window raw responses
//     perWindow: Array<{...}>,     // per-window diagnostic records
//     skipped: number,             // windows skipped after JSON-parse failure
//     windows: Array<{...}>,       // the windows actually sent (echoed back)
//   }

import { buildDetectionWindows } from './detect.js';

export async function runDetection(messages, cfg = {}) {
    const detector = cfg.detector;
    if (!detector || typeof detector.detectBoundaries !== 'function') {
        throw new Error('runDetection: cfg.detector must implement detectBoundaries()');
    }
    const windowOpts = {
        windowSize: cfg.windowSize ?? 26,
        overlap: cfg.overlap ?? 8,
        truncateChars: cfg.truncateChars ?? 500,
        guardSize: cfg.guardSize ?? 4,
    };
    const windows = buildDetectionWindows(messages, windowOpts);
    if (windows.length === 0) {
        return {
            boundaries: [],
            rawResponses: [],
            perWindow: [],
            skipped: 0,
            windows: [],
        };
    }
    const result = await detector.detectBoundaries({ messages, windows });
    const perWindow = result.perWindow ?? windows.map((w) => ({
        startIndex: w.startIndex,
        endIndex: w.endIndex,
        status: 'ok',
        boundaries: [],
    }));
    const seen = new Set();
    for (const b of result.boundaries ?? []) {
        if (Number.isInteger(b) && b > 0) seen.add(b);
    }
    const boundaries = [...seen].sort((a, b) => a - b);
    const skipped = perWindow.filter((w) => w.status !== 'ok').length;
    return {
        boundaries,
        rawResponses: result.rawResponses ?? [],
        perWindow,
        skipped,
        windows,
    };
}