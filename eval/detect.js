// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// eval/detect.js — Detection runner stub for STMB-Auto Phase 0.
//
// In Phase 0 the actual detection (LLM call against an OpenAI-compatible
// endpoint) is owned by P0.3 (PHA-1427, currently assigned to Claude Van Dam
// and unblocked by P0.1/P0.2). This module defines the interface the runner
// expects, plus a deterministic stub (`HeaderOracleDetector`) that uses the
// narrator headers directly. That oracle is a perfect-precision upper bound
// useful for sanity-checking the scorer; it should NOT be used as a real
// detector.
//
// Real-detection call sites should implement `detectBoundaries({ messages,
// windows, profile, prompt })` and return `{ boundaries: number[],
// rawResponses: object[] }`.

import { stripForDetection, formatForPrompt } from './parser.js';

export const BASELINE_PROMPT = `You are a scene-boundary detector for long-form fiction. Below are numbered messages in the form "[id] Speaker: text" (truncated). Identify every message ID that BEGINS a new scene. Mark EVERY change of location however small (room to room, indoors to outdoors), any time skip of an hour or more, dream sequences, cutaways, and interludes. Be sensitive rather than conservative. Continuous action in one place is ONE scene even if the topic shifts.
Do NOT mark any boundary within the final 4 messages (that scene may be incomplete). Reply with ONLY a JSON array of integers, e.g. [12, 27], or [].`;

/**
 * Build detection windows: contiguous slices of messages with overlap, as
 * described in plan §3.1. Default window size 26, overlap 8.
 *
 * @param {object[]} messages
 * @param {Object} [opts]
 * @param {number} [opts.windowSize=26]
 * @param {number} [opts.overlap=8]
 * @param {number} [opts.truncateChars=500]
 * @returns {Array<{ startIndex: number, endIndex: number, formatted: string, guardSize: number }>}
 *   startIndex/endIndex are 1-based inclusive boundaries into `messages`.
 *   formatted is the prompt payload (truncated messages, "[id] Speaker: text").
 *   guardSize is the number of trailing messages excluded from detection
 *   (plan §3.3 default 4).
 */
export function buildDetectionWindows(messages, opts = {}) {
    const windowSize = opts.windowSize ?? 26;
    const overlap = opts.overlap ?? 8;
    const truncateChars = opts.truncateChars ?? 500;
    const guardSize = opts.guardSize ?? 4;

    if (messages.length === 0) return [];
    const step = Math.max(1, windowSize - overlap);
    const windows = [];
    for (let start = 0; start < messages.length; start += step) {
        const end = Math.min(messages.length - 1, start + windowSize - 1);
        // Guard: trim the last `guardSize` indices from the detection zone.
        const detectEnd = Math.max(start, end - guardSize);
        const windowMessages = messages.slice(start, detectEnd + 1);
        const formatted = windowMessages.map((m) => formatForPrompt(m, truncateChars)).join('\n');
        windows.push({
            startIndex: messages[start].index,
            endIndex: messages[detectEnd].index,
            formatted,
            guardSize,
        });
        if (end === messages.length - 1) break;
    }
    return windows;
}

/**
 * HeaderOracleDetector — uses narrator `headers` directly to predict boundaries.
 * This is a perfect-oracle stub: precision is 1.0 by construction. Useful for
 * smoke-testing the scorer and the runner end-to-end without an LLM call.
 */
export class HeaderOracleDetector {
    constructor(opts = {}) {
        this.timeJumpMinutes = opts.timeJumpMinutes ?? 90;
    }

    async detectBoundaries({ messages }) {
        const boundaries = [];
        let prevLoc = null;
        let prevTime = null;
        let firstSeen = false;
        for (const m of messages) {
            if (m.isUser || m.isSystem) continue;
            const h = m.headers;
            if (!h || !h.location) continue;
            if (!firstSeen) {
                boundaries.push(m.index);
                firstSeen = true;
            } else {
                if (h.location !== prevLoc) boundaries.push(m.index);
                else if (h.time && prevTime) {
                    // Convert both to minutes; flag forward jumps >= threshold.
                    const a = parseTime(h.time);
                    const b = parseTime(prevTime);
                    if (a != null && b != null) {
                        let dt = a - b;
                        if (dt < 0) dt += 24 * 60;
                        if (dt >= this.timeJumpMinutes) boundaries.push(m.index);
                    }
                }
            }
            prevLoc = h.location;
            prevTime = h.time ?? null;
        }
        return { boundaries, rawResponses: [{ oracle: true, predicted: boundaries }] };
    }
}

function parseTime(t) {
    const m = t.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
    if (!m) return null;
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    const ampm = m[3] ? m[3].toUpperCase() : null;
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + min;
}

/**
 * StubDetector — read predictions from a JSON file. Used for offline re-runs
 * once the real detector has produced output.
 */
export class StubDetector {
    constructor(filePath) {
        this.filePath = filePath;
    }
    async detectBoundaries() {
        const { readFile } = await import('node:fs/promises');
        const text = await readFile(this.filePath, 'utf8');
        const data = JSON.parse(text);
        const boundaries = Array.isArray(data) ? data : (data.boundaries ?? []);
        return { boundaries, rawResponses: [{ stub: this.filePath, predicted: boundaries }] };
    }
}