#!/usr/bin/env node
/**
 * STMB-Auto Phase 0 — P0.2: Header ground-truth labels (plan §3.1).
 *
 * Wraps P0.1's deriveGroundTruth and emits eval/out/labels.json with the
 * plan's counting convention: boundary lists are SCENE-START message ids,
 * including the chat opening (id of the first message). The plan's
 * "58 raw / 32 merged" are scene counts under this convention:
 *   58 raw  = 57 header-derived transitions + the opening scene start
 *   32 merged = 31 post-merge transitions + the opening scene start
 *
 * Known, deliberate deviations from a strictest reading of the merge rule
 * (documented rather than fudged — see notes in the output):
 *   - The final scene (msgs 326-328, 3 messages) is < 6 messages but has no
 *     following boundary; the plan's 32 implies it was NOT merged, so we
 *     keep it. A strict "merge every short scene into a neighbor" would
 *     drop boundary 326 and give 31.
 *   - Fixture has 329 messages vs the plan's stated 328 (the plan likely
 *     excluded the greeting from its count); ids here are 0-based over 329.
 *
 * Usage: node eval/derive-labels.js [--fixture eval/out/fixture.json]
 *                                   [--out eval/out/labels.json]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHeader, deriveGroundTruth } from './parse-transcript.js';

const __filename = fileURLToPath(import.meta.url);
const root = path.dirname(path.dirname(__filename));

let fixturePath = path.join(root, 'eval/out/fixture.json');
let outPath = path.join(root, 'eval/out/labels.json');
for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] === '--fixture') fixturePath = process.argv[++i];
    else if (process.argv[i] === '--out') outPath = process.argv[++i];
    else throw new Error(`Unknown argument: ${process.argv[i]}`);
}

const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
// fixture.json strips headers from message text; re-derive from detail the
// fixture already carries so labels stay reproducible from one source.
const { raw, merged } = fixture.groundTruth.mergedDetail
    ? { raw: fixture.groundTruth.raw, merged: fixture.groundTruth.mergedDetail }
    : deriveGroundTruth(fixture.messages.map(m => ({ ...m, header: parseHeader(m.text) })), {
          timeJump: fixture.config.timeJumpMinutes,
          minScene: fixture.config.minSceneMessages,
      });

const total = fixture.messages.length;
const openingId = fixture.messages[0].id;
const rawStarts = [openingId, ...raw.map(b => b.id)];
const mergedStarts = [openingId, ...merged.map(b => b.id)];
const sceneLengths = mergedStarts.map(
    (s, i) => (i < mergedStarts.length - 1 ? mergedStarts[i + 1] : total) - s,
);

const labels = {
    source: fixture.source,
    config: fixture.config,
    convention:
        'Boundary lists are scene-start message ids (0-based), including the chat opening. ' +
        'Scene k spans [starts[k], starts[k+1] - 1].',
    stats: {
        messages: total,
        rawScenes: rawStarts.length,
        mergedScenes: mergedStarts.length,
        planExpected: { raw: 58, merged: 32 },
        matchesPlan: rawStarts.length === 58 && mergedStarts.length === 32,
    },
    raw: rawStarts,
    merged: mergedStarts,
    mergedSceneLengths: sceneLengths,
    boundaryTrace: raw.map(b => ({
        ...b,
        keptAfterMerge: merged.some(m => m.id === b.id),
    })),
    notes: [
        'Counts are scene counts: 57 header transitions + opening = 58 raw; 31 + opening = 32 merged.',
        `Final scene (msgs ${mergedStarts[mergedStarts.length - 1]}-${total - 1}, ` +
            `${sceneLengths[sceneLengths.length - 1]} messages) is shorter than ` +
            `${fixture.config.minSceneMessages} but kept: it has no following boundary and ` +
            "the plan's 32 implies it was not merged; strict trailing-merge would give 31.",
        `Fixture has ${total} messages vs the plan's stated 328 (plan likely excluded the greeting).`,
    ],
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(labels, null, 2));
console.log(
    `Wrote ${outPath}: raw=${labels.stats.rawScenes} merged=${labels.stats.mergedScenes} ` +
    `matchesPlan=${labels.stats.matchesPlan}`,
);
