// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// STMB-Auto fork — Phase 3 (Clipper+) acceptance assertions.
// Plan §4.2, Phase 3 accept clause. See phase3Acceptance.js for why the
// "verify with ST world-info debug" step is modelled offline.
//
// Run: node --test eval/phase3Acceptance.test.js

import assert from 'node:assert/strict';
import test from 'node:test';

import {
    activateWorldInfo,
    runPhase3Acceptance,
    buildFixtureChat,
} from './phase3Acceptance.js';

// ----------------------------------------------------------------------------
// 0. The activation model has teeth (guards every assertion below)
// ----------------------------------------------------------------------------

test('model: recursion exists at all — an unflagged entry cascades', () => {
    const r = runPhase3Acceptance({ enabled: true, autoAccept: true });
    const withControl = [...r.lorebook.filter(e => e !== r.pairedEntry), r.controlEntry];

    // "marble courtyard" is in the chat, so the control fires on pass 0; its
    // content names Sera / Brandon / Kestrel / Aldermoor, which must then fire.
    const out = activateWorldInfo(withControl, 'we crossed the marble courtyard again');
    assert.ok(out.activated.includes('CONTROL (no recursion flags)'), 'control must fire on its keyword');
    for (const name of ['Sera', 'Brandon', 'Kestrel', 'Aldermoor']) {
        assert.ok(
            out.activated.includes(name),
            `model is too weak to prove anything: control failed to cascade to ${name}`,
        );
    }
    assert.ok(out.passes >= 2, 'control must have driven at least one recursive pass');
});

// ----------------------------------------------------------------------------
// 1. Quote yields the unchanged clip entry PLUS the paired context entry
// ----------------------------------------------------------------------------

test('accept: a quote yields both entries, and the clip entry is untouched', () => {
    const r = runPhase3Acceptance({ enabled: true, autoAccept: true });

    assert.equal(r.sourceIndex, 3, 'the quote must resolve to its one source message');
    assert.ok(r.clipEntryUnchanged, 'Clipper+ must not mutate the upstream clip entry');
    assert.ok(r.lorebook.includes(r.clipEntry), 'the upstream clip entry is still in the book');
    assert.ok(r.lorebook.includes(r.pairedEntry), 'the paired context entry was added');
    assert.equal(r.lorebook.length, 6, '4 pre-existing + clip + paired');

    // The clip stays the always-on verbatim quote; the context entry never is.
    assert.equal(r.clipEntry.constant, true, 'upstream clip entry stays constant');
    assert.equal(r.pairedEntry.constant, false, 'context entry must never be constant');

    // Provenance + cross-reference (plan §4.2).
    assert.match(r.pairedEntry.content, /src: msgs \d+–\d+/, 'context entry carries a provenance range');
    assert.match(r.pairedEntry.content, /Context for clip: .*\[STMB Clip\]/, 'context entry cross-references the quote');
    assert.match(r.pairedEntry.comment, /\[STMB Clip Context\]$/);
});

test('accept: compaction still lists the quote entry (context entry is not a clip)', () => {
    const r = runPhase3Acceptance({ enabled: true, autoAccept: true });
    // clipManager.isClipEntryTitle — what the clip list and compaction key off.
    const isClipEntryTitle = (t) => typeof t === 'string' && t.trimEnd().endsWith('[STMB Clip]');
    const clips = r.lorebook.filter(e => isClipEntryTitle(e.comment)).map(e => e.comment);
    assert.deepEqual(clips, [r.quoteTitle], 'exactly the quote entry is listed as a clip');
});

// ----------------------------------------------------------------------------
// 2. Fires only on its keywords, cascades nothing
// ----------------------------------------------------------------------------

test('accept: context entry does NOT fire when its keywords are absent', () => {
    const r = runPhase3Acceptance({ enabled: true, autoAccept: true });
    const out = activateWorldInfo(r.lorebook, 'they rode north through rain and said little');
    assert.ok(!out.activated.includes(r.pairedEntry.comment), 'context entry must stay silent');
    // ...while the constant clip entry is always in, which is the point of the pairing.
    assert.ok(out.activated.includes(r.quoteTitle), 'the constant clip entry is always present');
});

test('accept: context entry fires on each of its own keywords', () => {
    const r = runPhase3Acceptance({ enabled: true, autoAccept: true });
    assert.ok(r.pairedEntry.key.length >= 3, 'plan §4.2 asks for 3–6 keywords');
    for (const kw of r.pairedEntry.key) {
        const out = activateWorldInfo(r.lorebook, `and then, ${kw}, once more`);
        assert.ok(
            out.activated.includes(r.pairedEntry.comment),
            `context entry must fire on its own keyword "${kw}"`,
        );
    }
});

test('accept: context entry cascades NOTHING (plan §4.2 half-the-cast scenario)', () => {
    const r = runPhase3Acceptance({ enabled: true, autoAccept: true });

    // Its blurb genuinely names the cast — this is the exact hazard.
    for (const name of ['Sera', 'Brandon', 'Kestrel', 'Aldermoor']) {
        assert.ok(r.pairedEntry.content.includes(name), `precondition: blurb names ${name}`);
    }

    // Fire it on a keyword that is NOT itself one of the character names, so any
    // character entry that activates can only have come from the cascade.
    const out = activateWorldInfo(r.lorebook, 'we crossed the marble courtyard again');
    assert.ok(out.activated.includes(r.pairedEntry.comment), 'precondition: the context entry fired');

    for (const name of ['Sera', 'Brandon', 'Kestrel', 'Aldermoor']) {
        assert.ok(
            !out.activated.includes(name),
            `context entry cascaded to "${name}" — preventRecursion is not holding`,
        );
    }
    assert.deepEqual(out.byPass[1] ?? [], [], 'no second-pass activations at all');
});

test('accept: context entry cannot be pulled in BY another entry (excludeRecursion)', () => {
    const r = runPhase3Acceptance({ enabled: true, autoAccept: true });
    // A cascading entry whose content contains the context entry's keywords.
    const gossip = {
        comment: 'Gossip',
        key: ['rumour'],
        keysecondary: [],
        content: 'They speak of the marble courtyard and the silver bell in Aldermoor.',
        constant: false,
        selective: true,
        preventRecursion: false,
        excludeRecursion: false,
    };
    const out = activateWorldInfo([...r.lorebook, gossip], 'there is a rumour going round');
    assert.ok(out.activated.includes('Gossip'), 'precondition: the cascading entry fired');
    assert.ok(
        !out.activated.includes(r.pairedEntry.comment),
        'context entry must not be reachable through recursion',
    );
});

// ----------------------------------------------------------------------------
// 3. Toggled off = upstream behavior
// ----------------------------------------------------------------------------

test('accept: toggled off, no paired entry is produced and nothing is touched', () => {
    const off = runPhase3Acceptance({ enabled: false });
    assert.equal(off.enabled, false);
    assert.equal(off.pairedEntry, null, 'no paired entry when disabled');
    assert.ok(off.clipEntryUnchanged, 'clip entry untouched when disabled');
    assert.equal(off.lorebook.length, 5, 'only the 4 pre-existing entries + the clip');
    assert.equal(off.sourceIndex, null, 'the source-locator never even ran');

    // The lorebook is exactly what it would be with no fork installed.
    const on = runPhase3Acceptance({ enabled: true, autoAccept: true });
    assert.deepEqual(
        off.lorebook.map(e => e.comment),
        on.lorebook.map(e => e.comment).filter(c => !c.endsWith('[STMB Clip Context]')),
        'disabled book == enabled book minus the paired entry',
    );
});

test('accept: default settings are off (a stock install gets upstream behavior)', () => {
    assert.equal(runPhase3Acceptance({}).enabled, false, 'absent enabled flag = off');
    assert.equal(runPhase3Acceptance(undefined).enabled, true, 'explicit harness default is on (sanity)');
});

// ----------------------------------------------------------------------------
// 4. The window/prompt the blurb is grounded in
// ----------------------------------------------------------------------------

test('window: K surrounding messages centered on the quote, true chat indices kept', () => {
    const r = runPhase3Acceptance({ enabled: true, autoAccept: true, surroundingK: 5 });
    const chat = buildFixtureChat();
    assert.equal(r.window.source, 3);
    assert.equal(r.window.messages.length, 5);
    assert.deepEqual(r.window.messages.map(m => m.id), [1, 2, 3, 4, 5]);
    assert.equal(r.window.messages[2].rawText, chat[3].mes, 'the source message is in the window verbatim');
    assert.match(r.prompt, /QUOTE:/);
    assert.match(r.prompt, /SURROUNDING MESSAGES:/);
    assert.match(r.windowText, /^\[1\] Brandon: /m, 'window lines carry the true chat index');
});
