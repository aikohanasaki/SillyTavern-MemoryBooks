// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// STMB-Auto fork — Phase 4 ACCEPTANCE harness (plan §4.4).
//
// This file is the executable form of the three Phase 4 acceptance criteria:
//
//   1. After 5 sentinel scenes, a main character's entry shows ACCUMULATED,
//      NON-DUPLICATED updates carrying provenance.
//   2. Injected-context generation REFERENCES ESTABLISHED FACTS.
//   3. A forced-low-confidence memory LANDS IN THE REVIEW PANEL.
//
// Design note — why this harness is not a tautology:
//
// The simulated model below is deliberately NAIVE. Each scene it "observes" the
// full running fact set for the character (i.e. it would happily rehash), and it
// suppresses a fact ONLY when it can find that fact's text inside the injected
// preamble it was handed. So the dedupe behavior is powered exclusively by what
// injection actually surfaces. If the injection hook regresses — empty preamble,
// entries not selected, budget miscomputed, keywords not firing — the model
// re-emits established facts and criterion 1 FAILS on duplicates. That is the
// property we want guarded, and `injection disabled => duplicates` below pins it
// by running the same 5 scenes with the module off and asserting the harness can
// tell the difference.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
    assembleLivingContext,
    INJECTION_DEFAULTS,
    ERROR_CONTROL_RULES,
} from './injectionCore.js';
import { safeAppendProvenanceLine, parseSceneRange } from './nudgeHelpers.js';
import {
    makeReviewEntry,
    buildReviewReasons,
    pushReviewEntry,
    dismissReviewEntry,
    detectSelfFlags,
} from './reviewCore.js';

// ------------------------------------------------------------------ fixture

const CHARACTER = 'Magisa';

/**
 * Five sentinel scenes. Each carries the facts a compliant model would extract.
 * `text` is what the scene reads like (drives keyword matching); `facts` is what
 * the model observes. Facts repeat across scenes ON PURPOSE — that repetition is
 * exactly what injection is supposed to suppress.
 */
const SCENES = [
    {
        range: { start: 1, end: 12 },
        text: `Magisa steps off the caravan at Vela's Rest, hood up. She keeps her left
               hand gloved. The innkeeper calls her "the cartographer".`,
        facts: [
            'Magisa is a cartographer.',
            'Magisa keeps her left hand gloved at all times.',
        ],
    },
    {
        range: { start: 13, end: 27 },
        text: `Magisa unrolls a map in the common room of Vela's Rest. The cartographer
               refuses to remove the glove even to eat. A courier asks after her sister.`,
        facts: [
            'Magisa is a cartographer.',
            'Magisa keeps her left hand gloved at all times.',
            'Magisa has a sister.',
        ],
    },
    {
        range: { start: 28, end: 41 },
        text: `The sister is named Ilve. Magisa burns a map rather than hand it over.
               Her gloved hand trembles when she does it.`,
        facts: [
            'Magisa keeps her left hand gloved at all times.',
            'Magisa has a sister.',
            "Magisa's sister is named Ilve.",
            'Magisa destroyed a map rather than surrender it.',
        ],
    },
    {
        range: { start: 42, end: 58 },
        text: `Ilve is revealed to be dead three winters. Magisa admits the glove hides a
               brand. The cartographer drinks alone.`,
        facts: [
            'Magisa has a sister.',
            "Magisa's sister is named Ilve.",
            'Ilve has been dead for three winters.',
            "The glove hides a brand on Magisa's left hand.",
        ],
    },
    {
        range: { start: 59, end: 73 },
        text: `Magisa shows the brand to no one but the reader: a guild mark, struck
               through. She leaves Vela's Rest before dawn.`,
        facts: [
            "The glove hides a brand on Magisa's left hand.",
            'The brand is a struck-through guild mark.',
            "Magisa left Vela's Rest before dawn.",
        ],
    },
];

// ------------------------------------------------------------------ simulator

/** A living lorebook entry for the character, as the book accumulates it. */
function makeCharacterEntry() {
    return {
        title: `${CHARACTER}`,
        keys: [CHARACTER.toLowerCase(), 'cartographer', 'glove'],
        constant: false,
        content: '',
    };
}

/**
 * The naive model. It emits every observed fact EXCEPT those it can already read
 * in the injected preamble. No preamble => no suppression => rehash.
 */
function generateDelta(scene, preamble) {
    const seen = String(preamble ?? '');
    return scene.facts.filter(fact => !seen.includes(fact));
}

/**
 * Run the 5 scenes against a living lorebook, with injection on or off.
 * Mirrors the real pipeline: assembleLivingContext -> generate -> provenance ->
 * append to the entry.
 */
function runSentinelScenes({ enabled }) {
    const entry = makeCharacterEntry();
    const cfg = { ...INJECTION_DEFAULTS, enabled, includeConstant: true };
    const preambles = [];
    const appended = [];

    for (const scene of SCENES) {
        // Injection reads the CURRENT state of the book (what it already knows).
        const { preamble, report } = enabled
            ? assembleLivingContext({
                rawEntries: entry.content ? [entry] : [],
                sceneText: scene.text,
                baseTokens: 0,
                cfg,
            })
            : { preamble: '', report: null };

        preambles.push({ preamble, report, scene });

        const delta = generateDelta(scene, preamble);
        if (delta.length === 0) continue;

        // Provenance rides on the delta, keyed to the scene's message range.
        const block = safeAppendProvenanceLine(delta.join('\n'), scene.range);
        appended.push({ range: scene.range, delta, block });
        entry.content = `${entry.content}${entry.content ? '\n' : ''}${block}`;
    }

    return { entry, preambles, appended };
}

/** Count how many times a fact string appears in the finished entry. */
function occurrences(haystack, needle) {
    let count = 0;
    let idx = 0;
    for (;;) {
        idx = haystack.indexOf(needle, idx);
        if (idx === -1) return count;
        count += 1;
        idx += needle.length;
    }
}

// ------------------------------------------------------------------ criterion 1

test('AC1: after 5 sentinel scenes the character entry accumulates non-duplicated updates with provenance', () => {
    const { entry, appended } = runSentinelScenes({ enabled: true });

    // Accumulated: the entry grew across scenes, not just the last one.
    assert.ok(appended.length >= 4, `expected updates from most scenes, got ${appended.length}`);
    assert.ok(entry.content.length > 0, 'entry accumulated no content');

    // Every distinct fact in the story is present...
    const allFacts = [...new Set(SCENES.flatMap(s => s.facts))];
    for (const fact of allFacts) {
        assert.ok(
            entry.content.includes(fact),
            `entry lost an established fact: ${fact}`,
        );
    }

    // ...and NOT duplicated, even though the scenes repeat them.
    const repeated = allFacts.filter(f => SCENES.filter(s => s.facts.includes(f)).length > 1);
    assert.ok(repeated.length >= 4, 'fixture should repeat several facts across scenes');
    for (const fact of repeated) {
        assert.equal(
            occurrences(entry.content, fact),
            1,
            `fact was rehashed into the entry more than once: ${fact}`,
        );
    }

    // Provenance: every appended block carries a `src: msgs X–Y` line for its scene.
    for (const { range, block } of appended) {
        const parsed = parseSceneRange(range);
        assert.ok(parsed, 'fixture range should parse');
        assert.match(
            block,
            new RegExp(`src: msgs ${parsed.start}–${parsed.end}`),
            `missing provenance for msgs ${parsed.start}–${parsed.end}`,
        );
    }
    const provenanceLines = entry.content.match(/src: msgs \d+–\d+/g) || [];
    assert.equal(
        provenanceLines.length,
        appended.length,
        'every accumulated update should carry exactly one provenance line',
    );
});

test('AC1 control: with injection disabled the same 5 scenes DO duplicate (harness is not vacuous)', () => {
    const { entry } = runSentinelScenes({ enabled: false });

    const rehashed = [...new Set(SCENES.flatMap(s => s.facts))]
        .filter(f => SCENES.filter(s => s.facts.includes(f)).length > 1)
        .filter(f => occurrences(entry.content, f) > 1);

    assert.ok(
        rehashed.length > 0,
        'control run must rehash — otherwise AC1 proves nothing about injection',
    );
});

// ------------------------------------------------------------------ criterion 2

test('AC2: injected-context generation references established facts', () => {
    const { preambles } = runSentinelScenes({ enabled: true });

    // Scene 1 has an empty book, so there is nothing established yet; from scene 2
    // onward the preamble must carry what the book already knows.
    const laterScenes = preambles.slice(1);
    assert.equal(laterScenes.length, 4);

    for (const { preamble, scene, report } of laterScenes) {
        assert.ok(preamble.length > 0, 'expected a non-empty preamble once the book has content');
        assert.match(preamble, /=== LIVING LOREBOOK \(WHAT THE BOOK ALREADY KNOWS\) ===/);

        // The character entry actually fired and was selected, not silently dropped.
        assert.ok(report.included.length > 0, 'living entry was not injected');
        assert.equal(report.dropped.length, 0, 'nothing should be budget-dropped in this fixture');

        // The preamble names the established character and at least one prior fact.
        assert.ok(preamble.includes(CHARACTER), 'preamble omits the established character');
    }

    // Concretely: by scene 4 the preamble carries facts established in scenes 1–3.
    const scene4 = laterScenes[2].preamble;
    assert.ok(scene4.includes('Magisa is a cartographer.'), 'scene-4 context lost a scene-1 fact');
    assert.ok(scene4.includes("Magisa's sister is named Ilve."), 'scene-4 context lost a scene-3 fact');

    // The delta-not-rehash framing and the error-control rules ride on every
    // generation prompt (plan §5) — this is what keeps early errors from entrenching.
    for (const { preamble } of laterScenes) {
        assert.match(preamble, /DELTA against them/);
        assert.ok(preamble.includes(ERROR_CONTROL_RULES), 'error-control rules missing from prompt');
    }
});

// ------------------------------------------------------------------ criterion 3

test('AC3: a forced-low-confidence memory lands in the review panel', () => {
    const queue = [];

    // Force the failure the way the detector does: a low-confidence result that
    // the job layer surfaces as a `StmbJobNeedsReview` condition, plus a memory
    // whose own text self-flags uncertainty.
    const flaggedContent = [
        'Magisa may have been a guild cartographer, though the scene is ambiguous.',
        'Her motive is unclear.',
    ].join('\n');

    const selfFlags = detectSelfFlags(flaggedContent);
    assert.ok(selfFlags.length > 0, 'fixture content should trip the self-flag patterns');

    const reasons = buildReviewReasons({ jsonRetried: true, selfFlags });
    assert.ok(reasons.length > 0, 'a retried + self-flagged memory must produce review reasons');

    const entry = makeReviewEntry({
        jobId: 'job-ac3',
        chatKey: 'chat-magisa',
        lorebookName: 'Satire Fantasy Isekai',
        entryTitle: CHARACTER,
        range: { start: 59, end: 73 },
        reasons,
        createdAt: 1,
    });

    // pushReviewEntry / dismissReviewEntry are pure — they return the new queue.
    const panel = pushReviewEntry(queue, entry);

    // It is IN the panel, addressable, and carries why it landed there.
    assert.equal(panel.length, 1, 'low-confidence memory did not land in the review queue');
    assert.equal(panel[0].jobId, 'job-ac3');
    assert.equal(panel[0].entryTitle, CHARACTER);
    assert.ok(panel[0].reasons.length > 0, 'review entry lost its reasons');

    // And the panel can clear it.
    const after = dismissReviewEntry(panel, 'job-ac3');
    assert.equal(after.length, 0, 'dismiss did not clear the review queue');
});

test('AC3 control: a clean, non-retried memory does NOT land in the review panel', () => {
    const clean = 'Magisa left Vela\'s Rest before dawn.\nsrc: msgs 59–73\n';
    const selfFlags = detectSelfFlags(clean);
    assert.equal(selfFlags.length, 0, 'clean content should not self-flag');

    const reasons = buildReviewReasons({ jsonRetried: false, selfFlags });
    assert.equal(reasons.length, 0, 'clean memory should produce no review reasons');
});
