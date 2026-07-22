// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// auditorTechnicalPass.test.js — Unit tests for the P5.3 technical pass +
// claim re-verification jobs.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
    DEFAULT_COMMON_WORDS,
    getCommonWords,
    estimateEntryTokens,
    normalizeEntry,
    runTechnicalPass,
    extractProvenanceRanges,
    runClaimReverification,
    runAuditorJobs,
    runCoverageAudit,
    runEntryRegeneration,
    maybeOfferAuditorJob,
    registerAuditorJobs,
} from './auditorTechnicalPass.js';

// ----------------------------------------------------------------------------
// getCommonWords
// ----------------------------------------------------------------------------

test('getCommonWords returns defaults when no settings', () => {
    const set = getCommonWords(null);
    assert.ok(set.has('button'), 'must include the plan §6 example "button"');
    assert.ok(set.has('the'));
    assert.ok(set.has('and'));
});

test('getCommonWords merges user-supplied words case-insensitively', () => {
    const set = getCommonWords({ moduleSettings: { autoModule: { technicalPassCommonWords: ['Foo', '  bar  ', '', 'baz'] } } });
    assert.ok(set.has('foo'));
    assert.ok(set.has('bar'));
    assert.ok(set.has('baz'));
    // Empty strings are filtered.
    assert.equal([...set].filter((w) => w === '').length, 0);
});

test('getCommonWords ignores non-array user input gracefully', () => {
    const set = getCommonWords({ moduleSettings: { autoModule: { technicalPassCommonWords: 'not an array' } } });
    assert.deepEqual([...set].sort(), [...DEFAULT_COMMON_WORDS].sort());
});

// ----------------------------------------------------------------------------
// estimateEntryTokens
// ----------------------------------------------------------------------------

test('estimateEntryTokens uses char/4 ratio', () => {
    assert.equal(estimateEntryTokens(''), 0);
    assert.equal(estimateEntryTokens('abcd'), 1);
    assert.equal(estimateEntryTokens('a'.repeat(4)), 1);
    assert.equal(estimateEntryTokens('a'.repeat(5)), 2);
    assert.equal(estimateEntryTokens('a'.repeat(4000)), 1000);
    assert.equal(estimateEntryTokens(null), 0);
    assert.equal(estimateEntryTokens(undefined), 0);
});

// ----------------------------------------------------------------------------
// normalizeEntry
// ----------------------------------------------------------------------------

test('normalizeEntry pulls canonical fields', () => {
    const e = normalizeEntry({
        comment: 'Test',
        key: ['Alice', 'Bob'],
        content: 'a'.repeat(40),
        constant: true,
        selective: false,
        probability: 100,
        useProbability: true,
        preventRecursion: false,
        delayUntilRecursion: false,
        stmemorybooks: true,
    }, 1);
    assert.equal(e.uid, 1);
    assert.equal(e.title, 'Test');
    assert.deepEqual(e.keys, ['Alice', 'Bob']);
    assert.equal(e.tokens, 10);
    assert.equal(e.isConstant, true);
    assert.equal(e.isSelective, false);
    assert.equal(e.probability, 100);
    assert.equal(e.useProbability, true);
    assert.equal(e.preventRecursion, false);
    assert.equal(e.delayUntilRecursion, false);
    assert.equal(e.stmemorybooks, true);
});

test('normalizeEntry handles missing fields gracefully', () => {
    const e = normalizeEntry({}, 5);
    assert.equal(e.uid, 5);
    assert.equal(e.title, '');
    assert.deepEqual(e.keys, []);
    assert.equal(e.tokens, 0);
    assert.equal(e.isConstant, false);
    assert.equal(e.isSelective, true);
    assert.equal(e.probability, 100);
});

// ----------------------------------------------------------------------------
// Technical pass — keyword checks
// ----------------------------------------------------------------------------

function makeEntry(overrides = {}) {
    return {
        stmemorybooks: true,
        comment: overrides.comment ?? 'Test',
        key: overrides.key ?? ['Alice'],
        content: overrides.content ?? 'Some content.',
        constant: overrides.constant ?? false,
        selective: overrides.selective ?? true,
        probability: overrides.probability ?? 100,
        useProbability: overrides.useProbability ?? true,
        preventRecursion: overrides.preventRecursion ?? false,
        excludeRecursion: overrides.excludeRecursion ?? false,
        delayUntilRecursion: overrides.delayUntilRecursion ?? false,
        ...overrides,
    };
}

test('technical pass: flags common-word-only keywords (plan §6 example)', () => {
    const lb = { entries: { 1: makeEntry({ key: ['button'] }) } };
    const r = runTechnicalPass(lb);
    assert.equal(r.summary.flaggedEntries, 1);
    assert.ok(r.issues.some((i) => i.code === 'keyword-common-only'));
});

test('technical pass: does NOT flag when a non-common keyword is present', () => {
    const lb = { entries: { 1: makeEntry({ key: ['button', 'unique-noun'] }) } };
    const r = runTechnicalPass(lb);
    assert.ok(!r.issues.some((i) => i.code === 'keyword-common-only'));
});

test('technical pass: empty keys list does not fire common-only', () => {
    const lb = { entries: { 1: makeEntry({ key: [] }) } };
    const r = runTechnicalPass(lb);
    assert.ok(!r.issues.some((i) => i.code === 'keyword-common-only'));
});

test('technical pass: shared keyword across entries fires once per entry', () => {
    const lb = {
        entries: {
            1: makeEntry({ key: ['Alice', 'shared-name'] }),
            2: makeEntry({ key: ['Alice', 'other-key'] }),
        },
    };
    const r = runTechnicalPass(lb);
    const shared = r.issues.filter((i) => i.code === 'keyword-shared-across-entries');
    assert.equal(shared.length, 2);
    assert.equal(r.summary.flaggedEntries, 2);
});

test('technical pass: common-word shared across entries is NOT flagged as shared (already noisy)', () => {
    const lb = {
        entries: {
            1: makeEntry({ key: ['the', 'Alice'] }),
            2: makeEntry({ key: ['the', 'Bob'] }),
        },
    };
    const r = runTechnicalPass(lb);
    assert.ok(!r.issues.some((i) => i.code === 'keyword-shared-across-entries'));
});

// ----------------------------------------------------------------------------
// Technical pass — oversized constant
// ----------------------------------------------------------------------------

test('technical pass: oversized constant fires when content is large', () => {
    // 8000 chars / 4 = 2000 tokens, well above the default 1500 threshold.
    const lb = {
        entries: {
            1: makeEntry({ constant: true, content: 'a'.repeat(8000) }),
        },
    };
    const r = runTechnicalPass(lb);
    assert.ok(r.issues.some((i) => i.code === 'constant-oversized'));
});

test('technical pass: oversized threshold is configurable', () => {
    const lb = {
        entries: {
            1: makeEntry({ constant: true, content: 'a'.repeat(500) }),
        },
    };
    const r = runTechnicalPass(lb, { oversizedConstantTokens: 100 });
    assert.ok(r.issues.some((i) => i.code === 'constant-oversized'));
});

test('technical pass: oversized only fires for constant entries (not selective)', () => {
    const lb = {
        entries: {
            1: makeEntry({ constant: false, selective: true, content: 'a'.repeat(2000) }),
        },
    };
    const r = runTechnicalPass(lb);
    assert.ok(!r.issues.some((i) => i.code === 'constant-oversized'));
});

// ----------------------------------------------------------------------------
// Technical pass — protagonist at 100%
// ----------------------------------------------------------------------------

test('technical pass: protagonist at 100% fires', () => {
    const lb = {
        entries: {
            1: makeEntry({
                comment: 'Protagonist',
                key: ['Alice'],
                probability: 100,
                useProbability: true,
                selective: true,
            }),
        },
    };
    const r = runTechnicalPass(lb);
    assert.ok(r.issues.some((i) => i.code === 'protagonist-always-fires'));
});

test('technical pass: protagonist at 80% does NOT fire', () => {
    const lb = {
        entries: {
            1: makeEntry({
                comment: 'Protagonist',
                key: ['Alice'],
                probability: 80,
                useProbability: true,
                selective: true,
            }),
        },
    };
    const r = runTechnicalPass(lb);
    assert.ok(!r.issues.some((i) => i.code === 'protagonist-always-fires'));
});

test('technical pass: protagonist via keyword (not title) fires', () => {
    const lb = {
        entries: {
            1: makeEntry({
                comment: 'Hero Unit',
                key: ['mc', 'Alice'],
                probability: 100,
                useProbability: true,
                selective: true,
            }),
        },
    };
    const r = runTechnicalPass(lb);
    assert.ok(r.issues.some((i) => i.code === 'protagonist-always-fires'));
});

test('technical pass: constant entry on a non-protagonist does NOT fire protagonist rule', () => {
    const lb = {
        entries: {
            1: makeEntry({
                comment: 'Random entry',
                key: ['Alice'],
                constant: true,
            }),
        },
    };
    const r = runTechnicalPass(lb);
    assert.ok(!r.issues.some((i) => i.code === 'protagonist-always-fires'));
});

// ----------------------------------------------------------------------------
// Technical pass — multi-name recursion guard
// ----------------------------------------------------------------------------

test('technical pass: multi-name without recursion guard fires', () => {
    const lb = {
        entries: {
            1: makeEntry({
                comment: 'Multi-name entry',
                key: ['Alice'],
                characterFilter: { isExclude: false, names: ['Alice', 'Bob'], tags: [] },
            }),
        },
    };
    const r = runTechnicalPass(lb);
    assert.ok(r.issues.some((i) => i.code === 'multi-name-no-recursion-guard'));
});

test('technical pass: multi-name with preventRecursion=true does NOT fire', () => {
    const lb = {
        entries: {
            1: makeEntry({
                comment: 'Multi-name entry',
                key: ['Alice'],
                characterFilter: { isExclude: false, names: ['Alice', 'Bob'], tags: [] },
                preventRecursion: true,
            }),
        },
    };
    const r = runTechnicalPass(lb);
    assert.ok(!r.issues.some((i) => i.code === 'multi-name-no-recursion-guard'));
});

test('technical pass: single-name entry does NOT fire multi-name rule', () => {
    const lb = {
        entries: {
            1: makeEntry({
                characterFilter: { isExclude: false, names: ['Alice'], tags: [] },
            }),
        },
    };
    const r = runTechnicalPass(lb);
    assert.ok(!r.issues.some((i) => i.code === 'multi-name-no-recursion-guard'));
});

// ----------------------------------------------------------------------------
// Technical pass — non-memory entries are skipped
// ----------------------------------------------------------------------------

test('technical pass skips entries without stmemorybooks flag', () => {
    const lb = {
        entries: {
            1: { comment: 'not a memory entry', key: ['button'], constant: true, content: 'a'.repeat(2000) },
        },
    };
    const r = runTechnicalPass(lb);
    assert.equal(r.summary.entriesChecked, 0);
    assert.equal(r.issues.length, 0);
});

test('technical pass summary counts only memory entries', () => {
    const lb = {
        entries: {
            1: makeEntry({ key: ['Alice'] }),
            2: { comment: 'not memory', key: ['x'], stmemorybooks: false },
            3: makeEntry({ key: ['Bob'] }),
        },
    };
    const r = runTechnicalPass(lb);
    assert.equal(r.summary.entriesChecked, 2);
});

// ----------------------------------------------------------------------------
// extractProvenanceRanges
// ----------------------------------------------------------------------------

test('extractProvenanceRanges returns ranges from src: msgs lines', () => {
    const ranges = extractProvenanceRanges('Some content.\nsrc: msgs 3–7\nMore.');
    assert.deepEqual(ranges, [{ start: 3, end: 7 }]);
});

test('extractProvenanceRanges handles multiple ranges and separator variants', () => {
    const ranges = extractProvenanceRanges('A\nsrc: msgs 1-5\nB\nsrc: msgs 10—15\nC\nsrc: msgs 20-25');
    assert.deepEqual(ranges, [{ start: 1, end: 5 }, { start: 10, end: 15 }, { start: 20, end: 25 }]);
});

test('extractProvenanceRanges ignores invalid ranges', () => {
    assert.deepEqual(extractProvenanceRanges('No range here'), []);
    assert.deepEqual(extractProvenanceRanges('src: msgs abc-def'), []);
    assert.deepEqual(extractProvenanceRanges('src: msgs 5-3'), []); // end < start
});

test('extractProvenanceRanges handles empty/missing content', () => {
    assert.deepEqual(extractProvenanceRanges(''), []);
    assert.deepEqual(extractProvenanceRanges(null), []);
    assert.deepEqual(extractProvenanceRanges(undefined), []);
});

// ----------------------------------------------------------------------------
// Claim re-verification
// ----------------------------------------------------------------------------

test('claim re-verification: confirmed when claims are in the source slice', () => {
    const lb = { entries: { 1: makeEntry({
        content: 'Alice visited DrownedCity during ThirdArc.\nsrc: msgs 3–7',
    }) } };
    const chatSlice = [
        { name: 'Narrator', mes: 'Alice travels to DrownedCity.' },
        { name: 'Narrator', mes: 'She arrives during ThirdArc.' },
    ];
    const r = runClaimReverification(lb, chatSlice);
    assert.equal(r.summary.confirmed, 1);
    assert.equal(r.summary.flagged, 0);
});

test('claim re-verification: flagged when claims are missing from source', () => {
    const lb = { entries: { 1: makeEntry({
        content: 'Brandon fought Vorthrax the Black.\nsrc: msgs 3–7',
    }) } };
    const chatSlice = [
        { name: 'Narrator', mes: 'A peaceful day in the village.' },
    ];
    const r = runClaimReverification(lb, chatSlice);
    assert.ok(r.summary.flagged >= 1);
    assert.ok(r.issues.some((i) => i.code === 'claim-not-found-in-source'));
});

test('claim re-verification: flagged on contradiction (acknowledged=false)', () => {
    // Entry claims Alice never left the village; source has 'however' + 'actually'
    // contradiction markers. Entry doesn't mention them, so contradiction is
    // unacknowledged → flag.
    const lb = { entries: { 1: makeEntry({
        content: 'Alice never left the village.\nsrc: msgs 3–7',
    }) } };
    const chatSlice = [
        { name: 'Narrator', mes: 'However, Alice actually traveled to the capital.' },
    ];
    const r = runClaimReverification(lb, chatSlice);
    assert.ok(r.issues.some((i) => i.code === 'claim-contradicts-source'));
});

test('claim re-verification: not flagged when entry acknowledges the contradiction', () => {
    const lb = { entries: { 1: makeEntry({
        content: 'Alice however traveled to the capital after all, contradicting the village claim.\nsrc: msgs 3–7',
    }) } };
    const chatSlice = [
        { name: 'Narrator', mes: 'However, Alice actually traveled to the capital.' },
    ];
    const r = runClaimReverification(lb, chatSlice);
    assert.ok(!r.issues.some((i) => i.code === 'claim-contradicts-source'));
});

test('claim re-verification: returns unknown for empty slice', () => {
    const lb = { entries: { 1: makeEntry({ content: 'Alice did something.' }) } };
    const r = runClaimReverification(lb, []);
    assert.equal(r.summary.unknown, 0); // no provenance ranges to scan
});

test('claim re-verification skips entries without provenance ranges', () => {
    const lb = { entries: { 1: makeEntry({ content: 'Alice did something.' }) } };
    const r = runClaimReverification(lb, [{ name: 'Narrator', mes: 'whatever' }]);
    assert.equal(r.summary.rangesChecked, 0);
});

test('claim re-verification handles non-memory entries gracefully', () => {
    const lb = { entries: { 1: { comment: 'not memory', key: ['Alice'], content: 'Alice did X.', stmemorybooks: false } } };
    const r = runClaimReverification(lb, [{ name: 'Narrator', mes: 'Alice did X.' }]);
    assert.equal(r.summary.entriesChecked, 0);
});

test('claim re-verification parses provenance ranges and reports per-range verdict', () => {
    const lb = { entries: { 1: makeEntry({
        content: 'Alice went to the Drowned City.\nsrc: msgs 5–10\nBrandon fought a dragon.\nsrc: msgs 1–4',
    }) } };
    const chatSlice = [
        { name: 'Narrator', mes: 'Alice arrives at the Drowned City.' },
        // range 1-4: empty slice
    ];
    const r = runClaimReverification(lb, chatSlice);
    assert.equal(r.summary.rangesChecked, 2);
    assert.equal(r.rangeVerdicts.length, 2);
    assert.equal(r.rangeVerdicts[0].range.start, 5);
    assert.equal(r.rangeVerdicts[1].range.start, 1);
});

// ----------------------------------------------------------------------------
// runAuditorJobs
// ----------------------------------------------------------------------------

test('runAuditorJobs runs both jobs', () => {
    const lb = { entries: { 1: makeEntry({ key: ['button'] }) } };
    const r = runAuditorJobs(lb, []);
    assert.ok(r.technical);
    assert.ok(r.claimReverification);
    assert.equal(r.technical.summary.flaggedEntries, 1);
});

// ----------------------------------------------------------------------------
// registerAuditorJobs (jobs dashboard)
// ----------------------------------------------------------------------------

test('registerAuditorJobs: no-op when stmbJobsApi is missing', () => {
    assert.equal(registerAuditorJobs(null), false);
    assert.equal(registerAuditorJobs(undefined), false);
    assert.equal(registerAuditorJobs({}), false);
});

test('registerAuditorJobs: registers the technical pass executor', () => {
    const registered = new Map();
    const api = { registerStmbJobExecutor: (type, fn) => registered.set(type, fn) };
    assert.equal(registerAuditorJobs(api), true);
    assert.ok(registered.has('stmbc-audit-technical'));
    assert.equal(typeof registered.get('stmbc-audit-technical'), 'function');
});

test('registerAuditorJobs: the technical executor returns a technical pass report', async () => {
    const registered = new Map();
    const api = { registerStmbJobExecutor: (type, fn) => registered.set(type, fn) };
    registerAuditorJobs(api);
    const executor = registered.get('stmbc-audit-technical');
    const lb = { entries: { 1: makeEntry({ key: ['button'] }) } };
    const result = await executor({ input: { lorebookData: lb, chatSlice: [] } });
    assert.equal(result.ok, true);
    assert.ok(result.report);
    assert.ok(Array.isArray(result.report.issues));
    assert.equal(result.report.summary.flaggedEntries, 1);
});
// ----------------------------------------------------------------------------
// Phase 5 P5.4 — runCoverageAudit
// ----------------------------------------------------------------------------

test('runCoverageAudit: flags notes without matching entry keys as missing', () => {
    const lb = { entries: { 1: makeEntry({ key: ['Alice'], comment: 'Alice' }) } };
    const notes = { items: [{ key: 'Bob', kind: 'character', sightings: 5, note: 'appears in ch3' }] };
    const r = runCoverageAudit(notes, lb);
    assert.equal(r.summary.total, 1);
    assert.equal(r.items[0].key, 'Bob');
    assert.equal(r.items[0].severity, 'missing');
});

test('runCoverageAudit: marks low-sighting entries as thin', () => {
    const lb = { entries: {} };
    const notes = { items: [{ key: 'Ghost', kind: 'character', sightings: 2 }] };
    const r = runCoverageAudit(notes, lb);
    assert.equal(r.items[0].severity, 'thin');
});

test('runCoverageAudit: marks high-sighting-but-missing entries as stale', () => {
    const lb = { entries: {} };
    const notes = { items: [{ key: 'King', kind: 'character', sightings: 20 }] };
    const r = runCoverageAudit(notes, lb);
    assert.equal(r.items[0].severity, 'stale');
});

test('runCoverageAudit: does not flag notes that match existing entry keys', () => {
    const lb = { entries: { 1: makeEntry({ key: ['Alice'], comment: 'Alice' }) } };
    const notes = { items: [{ key: 'Alice', kind: 'character', sightings: 5 }] };
    const r = runCoverageAudit(notes, lb);
    assert.equal(r.summary.total, 0);
    assert.deepEqual(r.items, []);
});

test('runCoverageAudit: dedupes notes by key (case-insensitive)', () => {
    const lb = { entries: {} };
    const notes = { items: [
        { key: 'Bob', sightings: 3 },
        { key: 'bob', sightings: 7 },
        { key: ' BOB ', sightings: 1 },
    ]};
    const r = runCoverageAudit(notes, lb);
    assert.equal(r.items.length, 1);
    assert.equal(r.items[0].sightings, 3); // first wins
});

test('runCoverageAudit: returns empty report on empty notes', () => {
    const r = runCoverageAudit({ items: [] }, { entries: {} });
    assert.deepEqual(r.items, []);
    assert.equal(r.summary.total, 0);
});

test('runCoverageAudit: handles null / malformed inputs without throwing', () => {
    assert.deepEqual(runCoverageAudit(null, null).items, []);
    assert.deepEqual(runCoverageAudit(undefined, undefined).items, []);
    assert.deepEqual(runCoverageAudit({}, null).items, []);
});

// ----------------------------------------------------------------------------
// Phase 5 P5.4 — runEntryRegeneration
// ----------------------------------------------------------------------------

test('runEntryRegeneration: surfaces entries whose content drifted from source', () => {
    const slice = [
        { mesid: 0, name: 'A', mes: 'padding message zero' },
        { mesid: 1, name: 'A', mes: 'The ancient vault lay beneath the mountain.' },
        { mesid: 2, name: 'A', mes: 'Its doors were sealed centuries ago.' },
        { mesid: 3, name: 'A', mes: 'Only the chosen could enter.' },
    ];
    const lb = { entries: { 1: makeEntry({
        key: ['Vault'],
        comment: 'Vault',
        content: 'The vault is a modern bank with a vault that holds money. src: msgs 1-3',
    }) } };
    const r = runEntryRegeneration(lb, slice);
    assert.equal(r.summary.total, 1);
    assert.equal(r.candidates[0].entryUid, 1);
    assert.ok(r.candidates[0].derivedContent.includes('ancient vault'));
    assert.ok(r.candidates[0].similarity < 0.7);
});

test('runEntryRegeneration: skips entries without provenance ranges', () => {
    const slice = [{ mesid: 0, name: 'A', mes: 'foo bar baz' }];
    const lb = { entries: { 1: makeEntry({
        content: 'No provenance here.',
    }) } };
    const r = runEntryRegeneration(lb, slice);
    assert.equal(r.candidates.length, 0);
});

test('runEntryRegeneration: skips entries whose content already matches source', () => {
    const slice = [{ mesid: 0, name: 'A', mes: 'ancient vault lies beneath the mountain src: msgs 1-1' }];
    const lb = { entries: { 1: makeEntry({
        content: 'ancient vault lies beneath the mountain src: msgs 1-1',
    }) } };
    const r = runEntryRegeneration(lb, slice);
    assert.equal(r.candidates.length, 0);
});

test('runEntryRegeneration: returns empty report on empty lorebook', () => {
    const r = runEntryRegeneration({ entries: {} }, []);
    assert.equal(r.candidates.length, 0);
});

test('runEntryRegeneration: handles null / malformed inputs without throwing', () => {
    assert.deepEqual(runEntryRegeneration(null, null).candidates, []);
    assert.deepEqual(runEntryRegeneration(undefined, []).candidates, []);
    assert.deepEqual(runEntryRegeneration({}, null).candidates, []);
});

// ----------------------------------------------------------------------------
// Phase 5 P5.4 — maybeOfferAuditorJob (cadence gate, plan §4.3)
// ----------------------------------------------------------------------------

test('maybeOfferAuditorJob: returns no-offer when below threshold', () => {
    const r = maybeOfferAuditorJob({ moduleSettings: { autoModule: { auditorEveryNScenes: 15 } } }, 10, 0);
    assert.equal(r.shouldOffer, false);
    assert.equal(r.reason, 'below-threshold');
});

test('maybeOfferAuditorJob: returns offer when count crosses N threshold', () => {
    const r = maybeOfferAuditorJob({ moduleSettings: { autoModule: { auditorEveryNScenes: 15 } } }, 15, 0);
    assert.equal(r.shouldOffer, true);
    assert.equal(r.reason, 'every-N-scene-memories');
    assert.equal(r.suggestedJobType, 'stmbc-audit-coverage');
});

test('maybeOfferAuditorJob: defaults to 15 when no setting present', () => {
    const r = maybeOfferAuditorJob({ moduleSettings: { autoModule: {} } }, 15, 0);
    assert.equal(r.shouldOffer, true);
    assert.equal(r.everyNScenes, 15);
});

test('maybeOfferAuditorJob: returns no-offer when explicitly disabled', () => {
    const r = maybeOfferAuditorJob({ moduleSettings: { autoModule: { auditorOfferEnabled: false, auditorEveryNScenes: 5 } } }, 100, 0);
    assert.equal(r.shouldOffer, false);
    assert.equal(r.reason, 'disabled');
});

test('maybeOfferAuditorJob: returns no-offer when count is 0', () => {
    const r = maybeOfferAuditorJob({ moduleSettings: { autoModule: { auditorEveryNScenes: 5 } } }, 0, 0);
    assert.equal(r.shouldOffer, false);
    assert.equal(r.reason, 'no-memories');
});

test('maybeOfferAuditorJob: handles null settings without throwing', () => {
    const r = maybeOfferAuditorJob(null, 15, 0);
    assert.equal(r.shouldOffer, true);
    assert.equal(r.everyNScenes, 15);
});

// ----------------------------------------------------------------------------
// Phase 5 P5.4 — registerAuditorJobs (4 executors)
// ----------------------------------------------------------------------------

test('registerAuditorJobs: registers all four job executors', () => {
    const registered = new Map();
    const api = { registerStmbJobExecutor: (type, fn) => registered.set(type, fn) };
    assert.equal(registerAuditorJobs(api), true);
    assert.equal(registered.size, 4);
    for (const t of [
        'stmbc-audit-coverage',
        'stmbc-audit-regenerate',
        'stmbc-audit-technical',
        'stmbc-audit-claims',
    ]) {
        assert.ok(registered.has(t), `missing ${t}`);
        assert.equal(typeof registered.get(t), 'function');
    }
});

test('registerAuditorJobs: coverage executor returns a coverage report', async () => {
    const registered = new Map();
    const api = { registerStmbJobExecutor: (type, fn) => registered.set(type, fn) };
    registerAuditorJobs(api);
    const lb = { entries: {} };
    const notes = { items: [{ key: 'Bob', kind: 'character', sightings: 5 }] };
    const result = await registered.get('stmbc-audit-coverage')({ input: { lorebookData: lb, notes } });
    assert.equal(result.ok, true);
    assert.equal(result.report.summary.flagged, 1);
    assert.equal(result.report.items[0].key, 'Bob');
});

test('registerAuditorJobs: regeneration executor returns a regeneration report', async () => {
    const registered = new Map();
    const api = { registerStmbJobExecutor: (type, fn) => registered.set(type, fn) };
    registerAuditorJobs(api);
    const slice = [{ mesid: 0, name: 'A', mes: 'ancient vault lies beneath the mountain sealed src: msgs 1-1' }];
    const lb = { entries: { 1: makeEntry({
        content: 'The vault is a modern bank. src: msgs 1-1',
    }) } };
    const result = await registered.get('stmbc-audit-regenerate')({ input: { lorebookData: lb, chatSlice: slice } });
    assert.equal(result.ok, true);
    assert.ok(result.report);
    assert.ok(Array.isArray(result.report.candidates));
});

test('registerAuditorJobs: claims executor returns a claim re-verification report', async () => {
    const registered = new Map();
    const api = { registerStmbJobExecutor: (type, fn) => registered.set(type, fn) };
    registerAuditorJobs(api);
    const slice = [{ mesid: 0, name: 'A', mes: 'Bob is alive and well' }];
    const lb = { entries: { 1: makeEntry({
        content: 'Bob was dead. src: msgs 1-1',
    }) } };
    const result = await registered.get('stmbc-audit-claims')({ input: { lorebookData: lb, chatSlice: slice } });
    assert.equal(result.ok, true);
    assert.ok(result.report);
    assert.ok(Array.isArray(result.report.rangeVerdicts));
});

test('registerAuditorJobs: no-op when stmbJobsApi is missing', () => {
    assert.equal(registerAuditorJobs(null), false);
    assert.equal(registerAuditorJobs(undefined), false);
    assert.equal(registerAuditorJobs({}), false);
});
