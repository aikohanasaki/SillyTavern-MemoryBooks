// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// STMB-Auto fork — Clipper+ hook-site and toggle-off parity tests (Phase 3, P3.2).
// Plan: eval/materials/stmb-auto/stmb-auto-plan.md §4.2, Phase 3 acceptance.
//
// clipperPlus.js is the SillyTavern binding layer, so it cannot be imported under
// node (it pulls ../../../../script.js). The two Phase 3 acceptance claims that
// live in that layer are therefore asserted structurally, against the source of
// clipManager.js and clipperPlus.js:
//
//   1. "quote yields the unchanged upstream clip entry PLUS the paired context
//      entry"  -> the hook fires AFTER the upstream entry is persisted, and the
//      upstream entry-shaping block is untouched.
//   2. "feature toggled off = byte-identical upstream behavior"  -> the hook's
//      first act is the enabled gate, and nothing before the gate can mutate a
//      lorebook or reach the network.
//
// The world-info field contract itself (recursion-proof, never constant) is
// covered functionally in clipperPlus.test.js via buildEntryOverrides.
//
// Run: node clipperPlusHook.test.js

import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
    CLIP_CONTEXT_TITLE_SUFFIX,
    buildContextEntryTitle,
    validateClipperPatch,
    setClipperConfig,
    resolveClipperConfig,
} from './clipperPlusCore.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const read = (f) => readFileSync(resolve(__dirname, f), 'utf8');

const clipManager = read('clipManager.js');
const clipperPlus = read('clipperPlus.js');

// ----------------------------------------------------------------------------
// 1. Hook site: after the upstream write, and only there
// ----------------------------------------------------------------------------

/** The body of saveNewClip(), which is the one function Clipper+ hooks. */
function saveNewClipBody() {
    const start = clipManager.indexOf('async function saveNewClip(');
    assert.ok(start !== -1, 'clipManager.js must still define saveNewClip');
    const end = clipManager.indexOf('\nexport async function openClipModalFromSelection', start);
    assert.ok(end !== -1, 'could not find the end of saveNewClip');
    return clipManager.slice(start, end);
}

test('hook site: Clipper+ is called from saveNewClip, exactly once', () => {
    const body = saveNewClipBody();
    const calls = body.match(/maybeGeneratePairedContextEntry\s*\(/g) || [];
    assert.equal(calls.length, 1, 'exactly one Clipper+ call site (plan §4.2: one STMBC-HOOK line)');
    assert.match(body, /STMBC-HOOK\(clipper\)/, 'the call site must carry the greppable STMBC-HOOK(clipper) marker');
});

test('hook site: fires AFTER the upstream clip entry is persisted', () => {
    const body = saveNewClipBody();
    const save = body.indexOf('await saveLorebook(lorebookName, lorebookData)');
    const hook = body.indexOf('maybeGeneratePairedContextEntry(');
    assert.ok(save !== -1, 'saveNewClip must still persist via saveLorebook');
    assert.ok(hook > save, 'Clipper+ must run after saveLorebook, so a failure can never lose the user\'s quote');
});

test('hook site: receives the quote text and the quote entry title', () => {
    const body = saveNewClipBody();
    const call = /maybeGeneratePairedContextEntry\(\{([\s\S]*?)\}\)/.exec(body);
    assert.ok(call, 'Clipper+ must be called with an options object');
    const args = call[1];
    // Without the quote there is no way to locate the source message, and without
    // the title the paired entry cannot cross-reference the clip (plan §4.2).
    assert.match(args, /quote:\s*bulletText/, 'must pass the verbatim selection as `quote`');
    assert.match(args, /quoteTitle:\s*title/, 'must pass the upstream clip title as `quoteTitle`');
    assert.match(args, /lorebookName/, 'must pass the target lorebook name');
    assert.match(args, /lorebookData/, 'must pass the loaded lorebook data');
    assert.match(args, /headline/, 'must pass the clip headline');
});

test('hook site: the Phase-1 globalThis.STMBC.onClipSave placeholder is gone', () => {
    // The placeholder ran BEFORE the duplicate-title check and before the quote
    // text was even read from the DOM, and its result was never consumed. Leaving
    // it in place alongside the real hook would mean two clip-save hook sites.
    assert.doesNotMatch(clipManager, /STMBC\?\.onClipSave/, 'the dead onClipSave placeholder must be removed');
});

// ----------------------------------------------------------------------------
// 2. Toggle-off parity: upstream entry untouched, gate comes first
// ----------------------------------------------------------------------------

test('parity: upstream clip entry shaping is untouched by Clipper+', () => {
    const body = saveNewClipBody();
    // These are the upstream lines that decide what the [STMB Clip] entry IS.
    // Clipper+ adds a second entry; it must never edit this one.
    for (const line of [
        'newEntry.comment = title;',
        'newEntry.content = content;',
        "newEntry.constant = activation === 'constant';",
        "newEntry.key = activation === 'keyword' ? keywords : [];",
    ]) {
        assert.ok(body.includes(line), `upstream clip shaping must be unchanged: ${line}`);
    }
});

test('parity: the enabled gate is the first thing the hook does', () => {
    const fn = clipperPlus.slice(clipperPlus.indexOf('export async function maybeGeneratePairedContextEntry'));
    const gate = fn.indexOf('if (!cfg.enabled) return;');
    assert.ok(gate !== -1, 'the hook must self-gate on the resolved enabled flag');

    // Nothing before the gate may write a lorebook, call the model, or prompt the
    // user — otherwise "feature off" would not be byte-identical to upstream.
    const preamble = fn.slice(0, gate);
    for (const forbidden of ['upsertLorebookEntryByTitle', 'requestCompletion', 'generatePaired', 'showConfirmDialog', 'new Popup', 'toastr']) {
        assert.ok(!preamble.includes(forbidden), `nothing before the enabled gate may call ${forbidden}`);
    }
});

test('parity: the hook body is wrapped so it can never throw into the clip save', () => {
    const fn = clipperPlus.slice(clipperPlus.indexOf('export async function maybeGeneratePairedContextEntry'));
    // `try` must be the first statement after the (destructured) parameter list.
    assert.match(
        fn,
        /^export async function maybeGeneratePairedContextEntry\(\s*\{[^}]*\}\s*\)\s*\{\s*try\s*\{/,
        'the whole hook body must be inside a try block',
    );
    assert.match(fn, /\}\s*catch\s*\(\s*err\s*\)/, 'the hook must catch everything it might throw');
});

test('parity: Clipper+ defaults to disabled with no settings at all', () => {
    assert.equal(resolveClipperConfig(undefined, undefined).enabled, false);
    assert.equal(resolveClipperConfig({}, {}).enabled, false);
    // An auto-module that only ever knew about the sentinel keys (the shape a
    // pre-Phase-3 install has on disk) must still read as disabled.
    assert.equal(resolveClipperConfig({ sentinelEnabled: true, cadenceMessages: 8 }, {}).enabled, false);
});

// ----------------------------------------------------------------------------
// 3. The context entry must not be mistaken for a clip entry
// ----------------------------------------------------------------------------

test('context entry title is not a clip title (compaction still lists the quote)', () => {
    // clipManager.isClipEntryTitle is what compaction, the clip picker, and the
    // duplicate-title check all key off. Assert the predicate we are dodging is
    // still the predicate in the source, then assert we dodge it.
    assert.ok(
        clipManager.includes("return typeof title === 'string' && title.trimEnd().endsWith('[STMB Clip]');"),
        'isClipEntryTitle must still be the trailing-[STMB Clip] predicate this test dodges',
    );

    const isClipEntryTitle = (t) => typeof t === 'string' && t.trimEnd().endsWith('[STMB Clip]');

    assert.ok(isClipEntryTitle('The marble courtyard [STMB Clip]'), 'sanity: a real clip title matches');
    for (const headline of ['The marble courtyard', 'Bell', 'A clip', 'Odd [STMB Clip] name']) {
        const title = buildContextEntryTitle(headline);
        assert.ok(!isClipEntryTitle(title), `context title must not read as a clip title: ${title}`);
    }
    assert.ok(!CLIP_CONTEXT_TITLE_SUFFIX.trimEnd().endsWith('[STMB Clip]'));
});

// ----------------------------------------------------------------------------
// 4. Settings patch (nested autoModule.clipper)
// ----------------------------------------------------------------------------

test('validateClipperPatch: coerces booleans, clamps numbers, drops unknowns', () => {
    assert.deepEqual(validateClipperPatch({ enabled: 1, autoAccept: 0 }), { enabled: true, autoAccept: false });
    assert.deepEqual(validateClipperPatch({ surroundingK: 100 }), { surroundingK: 40 });
    assert.deepEqual(validateClipperPatch({ surroundingK: 0 }), { surroundingK: 2 });
    assert.deepEqual(validateClipperPatch({ surroundingK: '8' }), { surroundingK: 8 });
    assert.deepEqual(validateClipperPatch({ truncate: 10 }), { truncate: 50 });
    assert.deepEqual(validateClipperPatch({ sentinelEnabled: true, nope: 'x' }), {});
    assert.deepEqual(validateClipperPatch(null), {});
});

test('validateClipperPatch: profile accepts an index or the "null" default sentinel', () => {
    assert.deepEqual(validateClipperPatch({ profile: 'null' }), { profile: null });
    assert.deepEqual(validateClipperPatch({ profile: '' }), { profile: null });
    assert.deepEqual(validateClipperPatch({ profile: null }), { profile: null });
    assert.deepEqual(validateClipperPatch({ profile: '2' }), { profile: 2 });
    assert.deepEqual(validateClipperPatch({ profile: 0 }), { profile: 0 });
});

test('setClipperConfig: creates the nested objects and merges rather than replaces', () => {
    const settings = {};
    setClipperConfig(settings, { enabled: true });
    assert.deepEqual(settings.autoModule.clipper, { enabled: true });

    setClipperConfig(settings, { surroundingK: 10 });
    assert.deepEqual(settings.autoModule.clipper, { enabled: true, surroundingK: 10 }, 'must not drop earlier keys');

    // ...and the resolver reads back exactly what was written.
    const cfg = resolveClipperConfig(settings.autoModule, {});
    assert.equal(cfg.enabled, true);
    assert.equal(cfg.surroundingK, 10);
});

test('setClipperConfig: preserves sibling auto-module keys', () => {
    const settings = { autoModule: { sentinelEnabled: true, cadenceMessages: 8 } };
    setClipperConfig(settings, { enabled: true });
    assert.equal(settings.autoModule.sentinelEnabled, true, 'sentinel settings must survive a Clipper+ write');
    assert.equal(settings.autoModule.cadenceMessages, 8);
    assert.equal(settings.autoModule.clipper.enabled, true);
});
