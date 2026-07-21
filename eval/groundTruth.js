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
 * @param {object[]} messages
 * @param {number[]} rawBoundaries
 * @param {Object} [opts]
 * @param {number} [opts.minSceneMessages=6]
 * @returns {{ merged: number[], dropped: number[], sceneLengths: number[] }}
 *   merged: sorted list of boundaries after merging.
 *   dropped: raw boundaries that were dropped because their scene was too short.
 *   sceneLengths: the length in messages of each scene in the merged output.
 */
export function mergeShortScenes(messages, rawBoundaries, opts = {}) {
    const minSceneMessages = opts.minSceneMessages ?? 6;
    assert.ok(Number.isInteger(minSceneMessages) && minSceneMessages >= 1,
        `minSceneMessages must be a positive integer`);

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

    // Walk from the second scene forward. If a scene is shorter than
    // minSceneMessages, drop its starting boundary (it merges into the prior
    // scene). Repeat until every remaining scene meets the threshold.
    const merged = [scenes[0].start];
    const dropped = [];
    const keptScenes = [scenes[0]];

    for (let i = 1; i < scenes.length; i++) {
        const prevSceneEnd = keptScenes[keptScenes.length - 1].end;
        // Tentative length if we keep this boundary: previous scene's range
        // grows to include this scene's messages.
        const tentativeLength = (scenes[i].end - prevSceneEnd + 1);
        // Actually we want: if THIS scene's own length is below threshold,
        // and merging it into the prior scene keeps the prior scene at a
        // reasonable size, drop it. The plan's wording is "scenes shorter than
        // 6 messages" — that is, drop the boundary iff the scene's own length
        // is below 6, regardless of what the merge produces.
        if (scenes[i].length < minSceneMessages) {
            dropped.push(scenes[i].start);
            // Extend the previous scene to include this one.
            keptScenes[keptScenes.length - 1].end = scenes[i].end;
            keptScenes[keptScenes.length - 1].length = keptScenes[keptScenes.length - 1].end - keptScenes[keptScenes.length - 1].start + 1;
        } else {
            merged.push(scenes[i].start);
            keptScenes.push(scenes[i]);
        }
    }

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
 * @returns {{ boundaries: number[], detail: object[], raw: number[], dropped: number[], sceneLengths: number[] }}
 */
export function deriveGroundTruth(messages, opts = {}) {
    const { raw, detail } = computeRawBoundaries(messages, opts);
    const { merged, dropped, sceneLengths } = mergeShortScenes(messages, raw, opts);
    return { boundaries: merged, detail, raw, dropped, sceneLengths };
}