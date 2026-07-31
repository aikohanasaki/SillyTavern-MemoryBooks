// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// eval/groundTruth.js — Header-derived ground truth for scene boundaries.
//
// Implements the ground-truth rules from §3.1 of
// eval/materials/stmb-auto/stmb-auto-plan.md:
//
//   Ground truth = header-derived boundaries. A boundary is the index of
//   any narrator message where either:
//     - the location changed since the previous narrator message, OR
//     - the time jumped forward more than `timeJumpMinutes` (default 90).
//
//   Then scenes shorter than `minSceneMessages` messages (default 6) are
//   merged with their neighbors: if a scene is too short, its starting
//   boundary is removed (so it merges into the previous scene).
//
// The output is a sorted list of 1-based message indices where a new scene
// begins. The output includes the index of the first message of the very
// first scene; per §3.1 the model is asked to identify "every message that
// BEGINS a new scene," so scene 1 also starts at index 1.

import assert from 'node:assert/strict';

/**
 * Parse a header time string like "11:47 PM" or "9:00" into minutes-since-midnight.
 *
 * @param {string} timeStr
 * @returns {number|null}
 */
export function parseTimeToMinutes(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return null;
    const m = timeStr.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
    if (!m) return null;
    let h = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    const ampm = m[3] ? m[3].toUpperCase() : null;
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    if (h < 0 || h > 23 || min < 0 || min > 59) return null;
    return h * 60 + min;
}

/**
 * Compute raw boundaries from parsed messages.
 *
 * Walks through every narrator message in order. For each one that carries
 * a parsed `headers.location`, decides whether it's a boundary by comparing
 * to the previous narrator message's location and time.
 *
 * @param {object[]} messages
 * @param {Object} [opts]
 * @param {number} [opts.timeJumpMinutes=90]
 * @returns {{ raw: number[], detail: object[] }}
 *   raw:    sorted list of 1-based message indices (always includes index 1
 *           when any narrator messages exist).
 *   detail: per-narrator record { index, location, time, isBoundary, reason }
 *           — useful for debugging and visualization.
 */
export function computeRawBoundaries(messages, opts = {}) {
    const timeJumpMinutes = opts.timeJumpMinutes ?? 90;
    const detail = [];
    const raw = [];

    let prevLocation = null;
    let prevTimeMin = null;
    let prevIndex = null;
    let firstNarrator = null;

    for (const m of messages) {
        // We only consider narrator messages for ground-truth derivation —
        // user messages don't carry location/time stamps. The boundary index
        // is the index of the *first narrator* in the new scene (or the first
        // user message immediately before it, but for the plan's purposes
        // the boundary index is the narrator index).
        if (m.isUser || m.isSystem) continue;
        const hdr = m.headers;
        if (!hdr || !hdr.location) {
            // Narrator without a header — skip, but track it so we don't
            // accidentally compare to nothing later.
            continue;
        }

        if (firstNarrator === null) {
            firstNarrator = m.index;
            raw.push(m.index);
            detail.push({ index: m.index, location: hdr.location, time: hdr.time, isBoundary: true, reason: 'first-narrator' });
        } else {
            let isBoundary = false;
            const reasons = [];
            if (hdr.location !== prevLocation) {
                isBoundary = true;
                reasons.push(`location: "${prevLocation}" -> "${hdr.location}"`);
            }
            const t = parseTimeToMinutes(hdr.time);
            if (prevTimeMin != null && t != null) {
                // Treat forward jumps across `timeJumpMinutes` as a boundary;
                // backward jumps (which would happen when headers recount)
                // are ignored.
                let dt = t - prevTimeMin;
                if (dt < 0) dt += 24 * 60; // wrap around midnight
                if (dt >= timeJumpMinutes) {
                    isBoundary = true;
                    reasons.push(`time jump: ${dt} min`);
                }
            }
            detail.push({ index: m.index, location: hdr.location, time: hdr.time, isBoundary, reason: reasons.join('; ') || 'continue' });
            if (isBoundary) raw.push(m.index);
        }
        prevLocation = hdr.location;
        prevTimeMin = parseTimeToMinutes(hdr.time);
        prevIndex = m.index;
    }

    return { raw, detail };
}

/**
 * Merge scenes shorter than `minSceneMessages` into their preceding scene.
 * The plan's §3.1 says 32 ground-truth boundaries come from merging
 * micro-scenes shorter than 6 messages.
 *
 * MERGE SEMANTICS (`opts.mergeMode`)
 * ---------------------------------
 * Both modes end with "no kept scene is shorter than minSceneMessages", but
 * they drop wildly different numbers of boundaries, and the difference is the
 * bug behind the phantom P=0.29 detection "regression" (PHA-1555 comment
 * 083e4488):
 *
 *   'accumulate' (DEFAULT) — walk the raw boundaries and cut a new scene as
 *       soon as the scene being accumulated has reached the minimum. This drops
 *       the FEWEST boundaries that satisfy the constraint. On the Satire Isekai
 *       fixture: 67 raw -> 36 merged, matching the original Phase-0 eval's
 *       58 raw -> 32 merged ratio and the "32 ground-truth boundaries" this
 *       function's own docstring has always claimed.
 *
 *   'own' (LEGACY) — drop a boundary iff that raw scene's OWN length is below
 *       the minimum, regardless of how long the scene it merges into already
 *       is. A run of short raw scenes therefore collapses wholesale. On the
 *       same fixture: 67 raw -> 22 merged. That 22 is the coarse key an oracle
 *       detector could only score P=0.33 against, and no detector can ever pass
 *       a >=0.90 precision gate measured against it. Kept only so the historical
 *       numbers can be reproduced on demand — never as the default.
 *
 * @param {object[]} messages
 * @param {number[]} rawBoundaries
 * @param {Object} [opts]
 * @param {number} [opts.minSceneMessages=6]
 * @param {'accumulate'|'own'} [opts.mergeMode='accumulate']
 * @returns {{ merged: number[], dropped: number[], sceneLengths: number[] }}
 *   merged: sorted list of boundaries after merging.
 *   dropped: raw boundaries that were dropped because their scene was too short.
 *   sceneLengths: the length in messages of each scene in the merged output.
 */
export function mergeShortScenes(messages, rawBoundaries, opts = {}) {
    const minSceneMessages = opts.minSceneMessages ?? 6;
    const mergeMode = opts.mergeMode ?? 'accumulate';
    assert.ok(Number.isInteger(minSceneMessages) && minSceneMessages >= 1,
        `minSceneMessages must be a positive integer`);
    assert.ok(mergeMode === 'accumulate' || mergeMode === 'own',
        `mergeMode must be 'accumulate' or 'own', got ${mergeMode}`);

    if (rawBoundaries.length === 0) {
        return { merged: [], dropped: [], sceneLengths: [] };
    }

    const totalMessages = messages.length;
    // Compute scene span for each raw boundary: [boundary_i, boundary_{i+1} - 1]
    // The last scene ends at totalMessages.
    const scenes = rawBoundaries.map((b, i) => {
        const start = b;
        const end = i + 1 < rawBoundaries.length ? rawBoundaries[i + 1] - 1 : totalMessages;
        return { start, end, length: end - start + 1 };
    });

    const merged = [scenes[0].start];
    const dropped = [];
    const keptScenes = [{ ...scenes[0] }];

    const extendLast = (scene) => {
        const last = keptScenes[keptScenes.length - 1];
        last.end = scene.end;
        last.length = last.end - last.start + 1;
    };

    for (let i = 1; i < scenes.length; i++) {
        // 'accumulate' asks about the scene being BUILT; 'own' asks about the
        // candidate scene in isolation. That one word is the whole difference.
        const tooShort = mergeMode === 'accumulate'
            ? keptScenes[keptScenes.length - 1].length < minSceneMessages
            : scenes[i].length < minSceneMessages;

        if (tooShort) {
            dropped.push(scenes[i].start);
            extendLast(scenes[i]);
        } else {
            merged.push(scenes[i].start);
            keptScenes.push({ ...scenes[i] });
        }
    }

    // A trailing scene can still fall short — nothing follows it to trigger the
    // check above. Fold it back so the postcondition holds for every scene, not
    // for every scene but the last.
    while (keptScenes.length > 1 && keptScenes[keptScenes.length - 1].length < minSceneMessages) {
        const tail = keptScenes.pop();
        dropped.push(merged.pop());
        extendLast(tail);
    }
    dropped.sort((a, b) => a - b);

    return {
        merged,
        dropped,
        sceneLengths: keptScenes.map((s) => s.length),
    };
}

/**
 * High-level: derive ground-truth boundary indices from parsed messages.
 *
 * @param {object[]} messages
 * @param {Object} [opts]
 * @param {number} [opts.timeJumpMinutes=90]
 * @param {number} [opts.minSceneMessages=6]
 * @param {'accumulate'|'own'} [opts.mergeMode='accumulate'] - see mergeShortScenes
 * @returns {{ boundaries: number[], detail: object[], raw: number[], dropped: number[], sceneLengths: number[] }}
 */
export function deriveGroundTruth(messages, opts = {}) {
    const { raw, detail } = computeRawBoundaries(messages, opts);
    const { merged, dropped, sceneLengths } = mergeShortScenes(messages, raw, opts);
    return { boundaries: merged, detail, raw, dropped, sceneLengths };
}