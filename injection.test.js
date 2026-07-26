// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// Offline unit tests for the living-lorebook injection core (P4.1). Exercises the
// pure, SillyTavern-free logic — config merge, keyword matching, candidate prep,
// budget selection, and preamble assembly — without SillyTavern.
// Run: `node injection.test.js`.

import assert from 'node:assert/strict';
import test from 'node:test';
import {
    INJECTION_DEFAULTS,
    INJECTION_INSTRUCTION,
    ERROR_CONTROL_RULES,
    resolveInjectionConfig,
    countTokensDefault,
    normalizeForMatch,
    countKeyMatches,
    prepareCandidate,
    truncateContent,
    selectLivingEntries,
    formatEntry,
    buildInjectionPreamble,
    assembleLivingContext,
} from './injectionCore.js';

// ---------------------------------------------------------------- config

test('resolveInjectionConfig: defaults when nothing set; disabled by default', () => {
    const cfg = resolveInjectionConfig({}, {});
    assert.equal(cfg.enabled, false);
    assert.equal(cfg.budget, INJECTION_DEFAULTS.budget);
    assert.equal(cfg.errorControl, true);
    assert.equal(cfg.includeMemoryEntries, false);
});

test('resolveInjectionConfig: global values apply; per-chat wins over global', () => {
    const cfg = resolveInjectionConfig(
        { injection: { enabled: true, budget: 20000, maxEntries: 5, errorControl: false, prompt: 'G' } },
        { injection: { budget: 12345, prompt: 'P' } },
    );
    assert.equal(cfg.enabled, true);          // from global (per-chat left it unset)
    assert.equal(cfg.budget, 12345);          // per-chat overrides global
    assert.equal(cfg.maxEntries, 5);          // from global
    assert.equal(cfg.errorControl, false);    // from global
    assert.equal(cfg.prompt, 'P');            // per-chat overrides global
});

test('resolveInjectionConfig: per-chat can disable a globally-enabled module', () => {
    const cfg = resolveInjectionConfig({ injection: { enabled: true } }, { injection: { enabled: false } });
    assert.equal(cfg.enabled, false);
});

test('resolveInjectionConfig: ignores non-finite / wrong-typed overrides', () => {
    const cfg = resolveInjectionConfig({ injection: { budget: 'lots', errorControl: 'yes' } }, {});
    assert.equal(cfg.budget, INJECTION_DEFAULTS.budget);
    assert.equal(cfg.errorControl, true);
});

// ---------------------------------------------------------------- matching

test('normalizeForMatch collapses punctuation and case', () => {
    assert.equal(normalizeForMatch('  Sir-Reginald, THE  Bold! '), 'sir reginald the bold');
});

test('countKeyMatches: whole-token match, no substring false-positives', () => {
    const scene = ` ${normalizeForMatch('The artisan sold art in Aldmoor market')} `;
    assert.equal(countKeyMatches(['art'], scene), 1);        // "art" is present as a token
    assert.equal(countKeyMatches(['artisan'], scene), 1);
    assert.equal(countKeyMatches(['Aldmoor'], scene), 1);
    assert.equal(countKeyMatches(['dragon'], scene), 0);
    assert.equal(countKeyMatches(['artis'], scene), 0);      // partial token does NOT match
});

test('countKeyMatches: multiword keys and dedupe', () => {
    const scene = ` ${normalizeForMatch('Queen Isolde entered the Grand Hall')} `;
    assert.equal(countKeyMatches(['Queen Isolde', 'queen isolde', 'Grand Hall'], scene), 2); // dupe collapses
});

// ---------------------------------------------------------------- prepareCandidate

test('prepareCandidate: constant entry is eligible even with no keyword match', () => {
    const c = prepareCandidate(
        { comment: 'World Rules', title: 'World Rules', content: 'Magic is rare.', key: [], constant: true },
        { sceneNorm: normalizeForMatch('a quiet street'), cfg: INJECTION_DEFAULTS },
    );
    assert.ok(c);
    assert.equal(c.constant, true);
    assert.ok(c.priority >= 1_000_000);
});

test('prepareCandidate: keyword-matched non-constant entry is eligible', () => {
    const c = prepareCandidate(
        { title: 'Aldmoor', content: 'A trade town.', key: ['Aldmoor'], constant: false },
        { sceneNorm: normalizeForMatch('They rode into Aldmoor at dusk'), cfg: INJECTION_DEFAULTS },
    );
    assert.ok(c);
    assert.equal(c.constant, false);
    assert.equal(c.matchCount, 1);
    assert.equal(c.priority, 1);
});

test('prepareCandidate: non-constant, non-matching entry is dropped (null)', () => {
    const c = prepareCandidate(
        { title: 'Dragon', content: 'A fire dragon.', key: ['Dragon'], constant: false },
        { sceneNorm: normalizeForMatch('a peaceful market day'), cfg: INJECTION_DEFAULTS },
    );
    assert.equal(c, null);
});

test('prepareCandidate: empty content is not a candidate', () => {
    const c = prepareCandidate(
        { title: 'Empty', content: '   ', key: [], constant: true },
        { sceneNorm: '', cfg: INJECTION_DEFAULTS },
    );
    assert.equal(c, null);
});

test('prepareCandidate: honors includeConstant=false (constant no longer auto-eligible)', () => {
    const c = prepareCandidate(
        { title: 'Rules', content: 'x', key: [], constant: true },
        { sceneNorm: 'nothing', cfg: { ...INJECTION_DEFAULTS, includeConstant: false } },
    );
    assert.equal(c, null);
});

test('truncateContent caps length and appends ellipsis', () => {
    const out = truncateContent('a'.repeat(100), 10);
    assert.equal(out.length, 11); // 10 chars + ellipsis
    assert.ok(out.endsWith('…'));
});

// ---------------------------------------------------------------- selection

function cand(title, tokens, { constant = false, matchCount = 1 } = {}) {
    return { title, content: title, constant, matchCount, priority: (constant ? 1_000_000 : 0) + matchCount, tokens };
}

test('selectLivingEntries: hard budget stops the greedy fill; overflow is reported dropped', () => {
    const cands = [cand('A', 100), cand('B', 100), cand('C', 100)];
    const { included, dropped, usedTokens } = selectLivingEntries(cands, {
        cfg: { ...INJECTION_DEFAULTS, budget: 1000, reserveForOutput: 0 },
        baseTokens: 750, // available = 250 => fits 2 of 3
    });
    assert.equal(included.length, 2);
    assert.equal(dropped.length, 1);
    assert.equal(usedTokens, 200);
});

test('selectLivingEntries: constant entries are offered before keyword matches', () => {
    const cands = [cand('match', 50, { constant: false }), cand('always', 50, { constant: true })];
    const { included } = selectLivingEntries(cands, {
        cfg: { ...INJECTION_DEFAULTS, budget: 100, reserveForOutput: 0 },
        baseTokens: 50, // available = 50 => only one entry fits; the constant one wins
    });
    assert.equal(included.length, 1);
    assert.equal(included[0].title, 'always');
});

test('selectLivingEntries: maxEntries cap drops surplus even under budget', () => {
    const cands = [cand('A', 1), cand('B', 1), cand('C', 1)];
    const { included, dropped } = selectLivingEntries(cands, {
        cfg: { ...INJECTION_DEFAULTS, budget: 999999, maxEntries: 2 },
        baseTokens: 0,
    });
    assert.equal(included.length, 2);
    assert.equal(dropped.length, 1);
});

test('selectLivingEntries: zero/negative available budget includes nothing', () => {
    const cands = [cand('A', 10)];
    const { included, dropped, available } = selectLivingEntries(cands, {
        cfg: { ...INJECTION_DEFAULTS, budget: 100, reserveForOutput: 0 },
        baseTokens: 500,
    });
    assert.equal(available, 0);
    assert.equal(included.length, 0);
    assert.equal(dropped.length, 1);
});

// ---------------------------------------------------------------- assembly

test('formatEntry renders 1-indexed title + content', () => {
    assert.equal(formatEntry({ title: 'Aldmoor', content: 'A town.' }, 0), 'Entry 1 — Aldmoor:\nA town.');
});

test('buildInjectionPreamble: error-control-only when no entries', () => {
    const out = buildInjectionPreamble([], INJECTION_DEFAULTS);
    assert.ok(!out.includes('LIVING LOREBOOK'));
    assert.ok(out.includes('ERROR-CONTROL RULES'));
});

test('buildInjectionPreamble: empty string when no entries AND error control off', () => {
    const out = buildInjectionPreamble([], { ...INJECTION_DEFAULTS, errorControl: false });
    assert.equal(out, '');
});

test('buildInjectionPreamble: living block carries instruction + entries', () => {
    const out = buildInjectionPreamble(
        [{ title: 'Aldmoor', content: 'A town.' }],
        INJECTION_DEFAULTS,
    );
    assert.ok(out.includes('=== LIVING LOREBOOK (WHAT THE BOOK ALREADY KNOWS) ==='));
    assert.ok(out.includes(INJECTION_INSTRUCTION));
    assert.ok(out.includes('Entry 1 — Aldmoor:'));
    assert.ok(out.includes('ERROR-CONTROL RULES'));
});

test('buildInjectionPreamble: prompt override replaces the default instruction', () => {
    const out = buildInjectionPreamble(
        [{ title: 'X', content: 'y' }],
        { ...INJECTION_DEFAULTS, prompt: 'CUSTOM DELTA RULE' },
    );
    assert.ok(out.includes('CUSTOM DELTA RULE'));
    assert.ok(!out.includes(INJECTION_INSTRUCTION));
});

test('ERROR_CONTROL_RULES encode the five case-study guards', () => {
    assert.ok(/unspecified/i.test(ERROR_CONTROL_RULES));
    assert.ok(/ambiguity/i.test(ERROR_CONTROL_RULES));
    assert.ok(/contradiction/i.test(ERROR_CONTROL_RULES));
    assert.ok(/src: msgs/i.test(ERROR_CONTROL_RULES));
    assert.ok(/quotes accrue/i.test(ERROR_CONTROL_RULES));
});

// ---------------------------------------------------------------- end to end

test('assembleLivingContext: selects fired entries and reports the budget', () => {
    const rawEntries = [
        { title: 'World Rules', content: 'Magic is rare.', key: [], constant: true },
        { title: 'Aldmoor', content: 'A trade town on the river.', key: ['Aldmoor'], constant: false },
        { title: 'Dragon', content: 'A fire dragon.', key: ['Dragon'], constant: false }, // will not fire
    ];
    const { preamble, report } = assembleLivingContext({
        rawEntries,
        sceneText: 'They rode into Aldmoor as the sun set.',
        baseTokens: 0,
        cfg: { ...INJECTION_DEFAULTS, enabled: true },
    });
    const titles = report.included.map(e => e.title).sort();
    assert.deepEqual(titles, ['Aldmoor', 'World Rules']);
    assert.equal(report.eligible, 2);           // Dragon never fired
    assert.ok(preamble.includes('Aldmoor'));
    assert.ok(preamble.includes('World Rules'));
    assert.ok(!preamble.includes('fire dragon'));
    assert.ok(report.usedTokens > 0);
});

test('assembleLivingContext: with no eligible entries, still emits error-control rules', () => {
    const { preamble, report } = assembleLivingContext({
        rawEntries: [{ title: 'Dragon', content: 'A fire dragon.', key: ['Dragon'], constant: false }],
        sceneText: 'a quiet afternoon in the garden',
        baseTokens: 0,
        cfg: { ...INJECTION_DEFAULTS, enabled: true },
    });
    assert.equal(report.included.length, 0);
    assert.ok(preamble.includes('ERROR-CONTROL RULES'));
    assert.ok(!preamble.includes('LIVING LOREBOOK'));
});

test('assembleLivingContext: base tokens near the budget squeeze out entries (hard ~50K cap)', () => {
    const rawEntries = [{ title: 'Aldmoor', content: 'A trade town.', key: ['Aldmoor'], constant: false }];
    const { report } = assembleLivingContext({
        rawEntries,
        sceneText: 'Aldmoor',
        baseTokens: INJECTION_DEFAULTS.budget, // no room left
        cfg: { ...INJECTION_DEFAULTS, enabled: true },
    });
    assert.equal(report.included.length, 0);
    assert.equal(report.dropped.length, 1); // eligible but no budget => reported, not silently dropped
});

test('countTokensDefault matches the chars/4 heuristic', () => {
    assert.equal(countTokensDefault('abcd'), 1);
    assert.equal(countTokensDefault('abcde'), 2);
});
