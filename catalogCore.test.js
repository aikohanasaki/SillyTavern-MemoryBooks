// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// Phase 7 P7.1 — entry catalog / retrieval index. Acceptance for PHA-1634:
//   1. the catalog contains every stmemorybooks / side-prompt / clip entry,
//      with title, entity names, a 1-line summary and a token size;
//   2. stale-entry detection is covered (add / edit / delete / version bump);
//   3. the serialized catalog fits the chat_metadata budget on the 328-message
//      fixture's lorebook.
//
// Run: node --test catalogCore.test.js

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import {
    CATALOG_VERSION,
    CATALOG_DEFAULTS,
    ENTRY_KINDS,
    CLIP_TITLE_SUFFIX,
    resolveCatalogConfig,
    classifyEntryKind,
    summarizeEntryContent,
    truncateAtWord,
    fingerprintEntry,
    buildCatalogRow,
    buildCatalog,
    diffCatalog,
    refreshCatalog,
    fitCatalogToBudget,
    serializeCatalog,
    catalogByteLength,
    measureCatalog,
    byteLength,
    formatCatalogLines,
} from './catalogCore.js';
import { extractEntryEntityNames, buildCoverageIndex, findCoveringEntry } from './auditorJobsCore.js';
import { CLIP_CONTEXT_TITLE_SUFFIX } from './clipperPlusCore.js';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE_LOREBOOK = join(HERE, 'eval', 'materials', 'stmb-auto', 'Magisa-_satire_fantasy_isekai_world.json');

// ---------------------------------------------------------------- helpers

let nextUid = 0;
function entry(overrides = {}) {
    const uid = overrides.uid ?? nextUid++;
    return {
        uid,
        key: [],
        keysecondary: [],
        comment: `Entry ${uid}`,
        content: 'Some content.',
        constant: false,
        selective: true,
        disable: false,
        ...overrides,
    };
}

function book(...entries) {
    const map = {};
    for (const e of entries) map[String(e.uid)] = e;
    return { entries: map };
}

/** A lorebook holding one entry of every kind the catalog distinguishes. */
function mixedBook() {
    return book(
        entry({ uid: 0, comment: '01 - The Siege', key: ['Brandon', 'Fort Bramblehold'], stmemorybooks: true, content: 'The siege broke at dawn.\nsrc: msgs 12–34' }),
        entry({ uid: 1, comment: `Marta's warning${CLIP_TITLE_SUFFIX}`, key: ['Marta'], content: 'A verbatim quote.' }),
        entry({ uid: 2, comment: `Marta's warning${CLIP_CONTEXT_TITLE_SUFFIX}`, key: ['Marta', 'Millbrook'], content: 'Context blurb for the clip.' }),
        entry({ uid: 3, comment: 'Character Tracker', key: ['tracker'], STMB_sp_tracker_lastMsgId: 41, STMB_sp_tracker_lastRunAt: '2026-07-30T00:00:00Z', content: 'Name: Brandon\nStatus: Alive' }),
        entry({ uid: 4, comment: 'Aurelium (the capital)', key: ['Aurelium', 'the capital'], content: 'A gold-plated city that runs on paperwork.' }),
    );
}

const FIXED_NOW = 1_753_000_000_000;
const buildOpts = { now: FIXED_NOW, lorebookName: 'Test Book' };

// ---------------------------------------------------------------- classification

test('classifyEntryKind: the stmemorybooks flag is authoritative', () => {
    assert.equal(classifyEntryKind(entry({ stmemorybooks: true })), ENTRY_KINDS.MEMORY);
    // Even when it also carries a clip-shaped title — the flag wins.
    assert.equal(
        classifyEntryKind(entry({ stmemorybooks: true, comment: `Thing${CLIP_TITLE_SUFFIX}` })),
        ENTRY_KINDS.MEMORY,
    );
});

test('classifyEntryKind: clip context is not misread as a clip', () => {
    // The regression this guards: "X [STMB Clip Context]" contains the string
    // "[STMB Clip", so a substring test would classify both as clips and the
    // librarian would double-count the pair.
    assert.equal(classifyEntryKind(entry({ comment: `X${CLIP_TITLE_SUFFIX}` })), ENTRY_KINDS.CLIP);
    assert.equal(classifyEntryKind(entry({ comment: `X${CLIP_CONTEXT_TITLE_SUFFIX}` })), ENTRY_KINDS.CLIP_CONTEXT);
    // Trailing whitespace must not defeat the suffix match either.
    assert.equal(classifyEntryKind(entry({ comment: `X${CLIP_TITLE_SUFFIX}  ` })), ENTRY_KINDS.CLIP);
});

test('classifyEntryKind: side prompts are found by their STMB_sp_* stamp', () => {
    assert.equal(classifyEntryKind(entry({ STMB_sp_tracker_lastMsgId: 12 })), ENTRY_KINDS.SIDEPROMPT);
    assert.equal(classifyEntryKind(entry({ STMB_sp_worldstate_lastRunAt: 'x' })), ENTRY_KINDS.SIDEPROMPT);
    // The generic tracker stamp is NOT a side-prompt marker — memories carry it too.
    assert.equal(classifyEntryKind(entry({ STMB_tracker_lastMsgId: 12 })), ENTRY_KINDS.MANUAL);
});

test('classifyEntryKind: everything else is manual, including junk input', () => {
    assert.equal(classifyEntryKind(entry()), ENTRY_KINDS.MANUAL);
    assert.equal(classifyEntryKind(null), ENTRY_KINDS.MANUAL);
    assert.equal(classifyEntryKind('nope'), ENTRY_KINDS.MANUAL);
});

// ---------------------------------------------------------------- entity names

test('extractEntryEntityNames: keywords lead, title follows, dedup is case-insensitive', () => {
    const names = extractEntryEntityNames(entry({ key: ['Brandon', 'brandon', 'Kelly'], comment: 'Protagonist' }));
    assert.deepEqual(names, ['Brandon', 'Kelly', 'Protagonist']);
});

test('extractEntryEntityNames: a title already present as a keyword is not repeated', () => {
    assert.deepEqual(extractEntryEntityNames(entry({ key: ['Marta'], comment: 'marta' })), ['Marta']);
});

test('buildCoverageIndex still covers the same handles via the shared extractor', () => {
    // The catalog reuses the coverage job's extraction (PHA-1634: "Reuse
    // Auditor coverage-job entity extraction"). This pins that routing
    // buildCoverageIndex through extractEntryEntityNames did not change which
    // names the coverage audit considers covered: keywords AND title, matched
    // case- and whitespace-insensitively, with disabled entries ignored.
    const entries = [
        { uid: 0, title: 'Brother Gruk', keys: ['Grondulf', 'the orc'], isMemory: false },
        { uid: 1, title: 'Retired Entry', keys: ['Pemberly'], disable: true },
    ];
    const index = buildCoverageIndex(entries);
    for (const name of ['Grondulf', 'grondulf', 'The  Orc', 'Brother Gruk']) {
        assert.equal(findCoveringEntry(index, name)?.uid, 0, `"${name}" should be covered`);
    }
    assert.equal(findCoveringEntry(index, 'Pemberly'), null, 'disabled entries never fire, so never cover');
    assert.equal(findCoveringEntry(index, 'Nobody'), null);
});

// ---------------------------------------------------------------- summaries

test('summarizeEntryContent: prose entries summarize to their opening sentence', () => {
    const s = summarizeEntryContent('The siege broke at dawn when the gate gave way.', 140);
    assert.equal(s, 'The siege broke at dawn when the gate gave way.');
});

test('summarizeEntryContent: field-style entries join leading fields', () => {
    const s = summarizeEntryContent('Name: Brandon Kelly\nAge: Teens\nRace: Human', 60);
    assert.match(s, /^Name: Brandon Kelly; Age: Teens/);
});

test('summarizeEntryContent: provenance stamps are stripped, not summarized', () => {
    const s = summarizeEntryContent('src: msgs 12–34\nThe siege broke at dawn.', 140);
    assert.equal(s, 'The siege broke at dawn.');
    assert.doesNotMatch(s, /msgs/);
});

test('summarizeEntryContent: markdown furniture is stripped', () => {
    assert.equal(summarizeEntryContent('## Heading\n- bullet one', 140), 'Heading; bullet one');
});

test('summarizeEntryContent: stays within budget and marks truncation', () => {
    const long = 'word '.repeat(200);
    const s = summarizeEntryContent(long, 60);
    assert.ok(s.length <= 60, `summary was ${s.length} chars`);
    assert.ok(s.endsWith('…'));
});

test('summarizeEntryContent: empty and whitespace-only content yields an empty summary', () => {
    assert.equal(summarizeEntryContent(''), '');
    assert.equal(summarizeEntryContent('   \n\n  '), '');
    assert.equal(summarizeEntryContent(null), '');
});

test('truncateAtWord: hard-cuts when there is no late word boundary', () => {
    // A single long token has no space in the last 40% of the budget, so the
    // word-boundary path must not collapse the string to nearly nothing.
    const s = truncateAtWord('a'.repeat(50), 20);
    assert.equal(s.length, 20);
    assert.ok(s.endsWith('…'));
});

// ---------------------------------------------------------------- rows

test('buildCatalogRow: carries title, entity names, 1-line summary and token size', () => {
    const e = entry({
        uid: 7,
        comment: '01 - The Siege',
        key: ['Brandon', 'Fort Bramblehold'],
        stmemorybooks: true,
        content: 'The siege broke at dawn.\nsrc: msgs 12–34',
    });
    const row = buildCatalogRow(e, 7, buildOpts);
    assert.equal(row.uid, 7);
    assert.equal(row.kind, ENTRY_KINDS.MEMORY);
    assert.equal(row.title, '01 - The Siege');
    assert.deepEqual(row.n, ['Brandon', 'Fort Bramblehold', '01 - The Siege']);
    assert.equal(row.s, 'The siege broke at dawn.');
    assert.equal(row.t, Math.ceil(e.content.length / 4));
    assert.equal(typeof row.fp, 'string');
    assert.equal(row.off, undefined);
});

test('buildCatalogRow: disabled entries are kept and flagged, never dropped', () => {
    const row = buildCatalogRow(entry({ uid: 3, disable: true }), 3, buildOpts);
    assert.equal(row.off, true);
});

test('buildCatalogRow: entity names are capped without losing the row', () => {
    const keys = Array.from({ length: 20 }, (_, i) => `Name${i}`);
    const row = buildCatalogRow(entry({ uid: 1, key: keys }), 1, { ...buildOpts, maxNames: 3 });
    assert.equal(row.n.length, 3);
    assert.deepEqual(row.n, ['Name0', 'Name1', 'Name2']);
});

// ---------------------------------------------------------------- build

test('buildCatalog: every stmemorybooks / side-prompt / clip entry is present', () => {
    const catalog = buildCatalog(mixedBook(), buildOpts);
    assert.equal(catalog.v, CATALOG_VERSION);
    assert.equal(catalog.builtAt, FIXED_NOW);
    assert.equal(catalog.lorebook, 'Test Book');
    assert.equal(catalog.rows.length, 5);
    assert.deepEqual(catalog.stats.byKind, {
        [ENTRY_KINDS.MEMORY]: 1,
        [ENTRY_KINDS.CLIP]: 1,
        [ENTRY_KINDS.CLIP_CONTEXT]: 1,
        [ENTRY_KINDS.SIDEPROMPT]: 1,
        [ENTRY_KINDS.MANUAL]: 1,
    });
    // Every row carries all four required fields.
    for (const row of catalog.rows) {
        assert.equal(typeof row.title, 'string');
        assert.ok(row.title.length > 0, `row ${row.uid} has no title`);
        assert.ok(Array.isArray(row.n) && row.n.length > 0, `row ${row.uid} has no entity names`);
        assert.equal(typeof row.s, 'string');
        assert.ok(row.s.length > 0, `row ${row.uid} has no summary`);
        assert.ok(Number.isInteger(row.t) && row.t > 0, `row ${row.uid} has no token size`);
    }
    assert.equal(catalog.truncated, false);
    assert.deepEqual(catalog.dropped, []);
});

test('buildCatalog: rows come out uid-ascending regardless of key order', () => {
    const shuffled = { entries: {} };
    for (const uid of [4, 0, 2, 1, 3]) shuffled.entries[String(uid)] = entry({ uid });
    const catalog = buildCatalog(shuffled, buildOpts);
    assert.deepEqual(catalog.rows.map((r) => r.uid), [0, 1, 2, 3, 4]);
});

test('buildCatalog: survives an empty, missing or malformed lorebook', () => {
    for (const input of [null, undefined, {}, { entries: null }, { entries: { 0: null, 1: 'junk' } }]) {
        const catalog = buildCatalog(input, buildOpts);
        assert.deepEqual(catalog.rows, []);
        assert.equal(catalog.stats.total, 0);
    }
});

test('buildCatalog: no LLM hook is reachable from the build path', () => {
    // The read-time guarantee (PHA-1633: "No LLM calls at read time; summaries
    // generated once at write/refresh time") is structural — catalogCore.js
    // imports nothing that can make a call. Assert the source stays that way.
    const src = readFileSync(join(HERE, 'catalogCore.js'), 'utf8');
    const imports = [...src.matchAll(/^import .*? from '([^']+)';$/gm)].map((m) => m[1]);
    assert.deepEqual(imports, ['./auditorJobsCore.js', './auditorTechnicalPass.js', './clipperPlusCore.js']);
    assert.doesNotMatch(src, /\bfetch\s*\(|generateRaw|generateQuietPrompt|ConnectionManagerRequestService/);
});

// ---------------------------------------------------------------- staleness

test('diffCatalog: a freshly built catalog is not stale', () => {
    const lore = mixedBook();
    const diff = diffCatalog(buildCatalog(lore, buildOpts), lore);
    assert.equal(diff.isStale, false);
    assert.equal(diff.unchanged, 5);
    assert.deepEqual([diff.added, diff.changed, diff.removed], [[], [], []]);
});

test('diffCatalog: a new entry is detected as added', () => {
    const lore = mixedBook();
    const catalog = buildCatalog(lore, buildOpts);
    lore.entries['9'] = entry({ uid: 9, comment: 'Courier Sable', key: ['Sable'] });
    const diff = diffCatalog(catalog, lore);
    assert.deepEqual(diff.added, [9]);
    assert.equal(diff.isStale, true);
});

test('diffCatalog: an edited entry is detected as changed', () => {
    const lore = mixedBook();
    const catalog = buildCatalog(lore, buildOpts);

    lore.entries['0'].content = 'The siege broke at dusk, not dawn.';
    assert.deepEqual(diffCatalog(catalog, lore).changed, [0]);

    // Keyword-only and title-only edits count too: both change what the
    // librarian can select the entry by.
    const c2 = buildCatalog(lore, buildOpts);
    lore.entries['1'].key = ['Marta', 'Millbrook'];
    assert.deepEqual(diffCatalog(c2, lore).changed, [1]);

    const c3 = buildCatalog(lore, buildOpts);
    lore.entries['4'].comment = 'Aurelium (renamed)';
    assert.deepEqual(diffCatalog(c3, lore).changed, [4]);

    // So does disabling an entry.
    const c4 = buildCatalog(lore, buildOpts);
    lore.entries['3'].disable = true;
    assert.deepEqual(diffCatalog(c4, lore).changed, [3]);
});

test('diffCatalog: a deleted entry is detected as removed', () => {
    const lore = mixedBook();
    const catalog = buildCatalog(lore, buildOpts);
    delete lore.entries['2'];
    const diff = diffCatalog(catalog, lore);
    assert.deepEqual(diff.removed, [2]);
    assert.equal(diff.isStale, true);
});

test('diffCatalog: a missing or older-version catalog is stale', () => {
    const lore = mixedBook();
    assert.equal(diffCatalog(null, lore).missing, true);
    assert.equal(diffCatalog(null, lore).isStale, true);

    const old = buildCatalog(lore, buildOpts);
    old.v = CATALOG_VERSION - 1;
    const diff = diffCatalog(old, lore);
    assert.equal(diff.versionStale, true);
    assert.equal(diff.isStale, true);
});

test('diffCatalog: budget-dropped entries do not report as permanently stale', () => {
    // Otherwise a lorebook that overflows the budget would rebuild its catalog
    // on every single entry write, forever.
    const lore = mixedBook();
    const catalog = buildCatalog(lore, { ...buildOpts, maxSerializedBytes: 500 });
    assert.equal(catalog.truncated, true);
    assert.ok(catalog.dropped.length > 0);
    const diff = diffCatalog(catalog, lore);
    assert.deepEqual(diff.added, []);
    assert.equal(diff.isStale, false);
});

test('fingerprintEntry: is stable across rebuilds and moves on any indexed field', () => {
    const base = entry({ uid: 1, comment: 'A', key: ['x'], content: 'body' });
    assert.equal(fingerprintEntry(base), fingerprintEntry({ ...base }));
    assert.notEqual(fingerprintEntry(base), fingerprintEntry({ ...base, content: 'bodyy' }));
    assert.notEqual(fingerprintEntry(base), fingerprintEntry({ ...base, comment: 'B' }));
    assert.notEqual(fingerprintEntry(base), fingerprintEntry({ ...base, key: ['y'] }));
    assert.notEqual(fingerprintEntry(base), fingerprintEntry({ ...base, stmemorybooks: true }));
    // Order matters — swapping keywords is a real edit to the activation set.
    assert.notEqual(
        fingerprintEntry({ ...base, key: ['a', 'b'] }),
        fingerprintEntry({ ...base, key: ['b', 'a'] }),
    );
});

test('refreshCatalog: rebuilds only when the lorebook moved', () => {
    const lore = mixedBook();
    const first = buildCatalog(lore, buildOpts);

    const noop = refreshCatalog(first, lore, buildOpts);
    assert.equal(noop.rebuilt, false);
    assert.equal(noop.catalog, first, 'an unchanged lorebook must not produce a new object');

    lore.entries['0'].content = 'Rewritten.';
    const redone = refreshCatalog(first, lore, buildOpts);
    assert.equal(redone.rebuilt, true);
    assert.deepEqual(redone.diff.changed, [0]);
    assert.equal(redone.catalog.rows.find((r) => r.uid === 0).s, 'Rewritten.');

    // `force` rebuilds even when nothing moved.
    assert.equal(refreshCatalog(redone.catalog, lore, { ...buildOpts, force: true }).rebuilt, true);
});

// ---------------------------------------------------------------- budget

test('fitCatalogToBudget: shrinks summaries before dropping any entry', () => {
    const lore = mixedBook();
    const full = buildCatalog(lore, buildOpts);
    const target = catalogByteLength(full) - 30;
    const fitted = buildCatalog(lore, { ...buildOpts, maxSerializedBytes: target, minSummaryChars: 10 });
    assert.equal(fitted.shrunk, true);
    assert.equal(fitted.truncated, false, 'no entry should be lost while summaries still had slack');
    assert.equal(fitted.rows.length, 5);
    assert.ok(catalogByteLength(fitted) <= target);
});

test('fitCatalogToBudget: drops manual entries before STMB-managed ones', () => {
    const lore = mixedBook();
    const fitted = buildCatalog(lore, { ...buildOpts, maxSerializedBytes: 420, minSummaryChars: 10 });
    assert.equal(fitted.truncated, true);
    const kinds = new Set(fitted.rows.map((r) => r.kind));
    assert.ok(!kinds.has(ENTRY_KINDS.MANUAL), 'manual entries should go first');
    if (fitted.rows.length > 0) {
        assert.ok(kinds.has(ENTRY_KINDS.MEMORY), 'the memory entry should survive longest');
    }
});

test('fitCatalogToBudget: every dropped entry is recorded — no silent caps', () => {
    const lore = mixedBook();
    const fitted = buildCatalog(lore, { ...buildOpts, maxSerializedBytes: 420, minSummaryChars: 10 });
    assert.equal(fitted.truncated, true);
    assert.equal(fitted.dropped.length, 5 - fitted.rows.length);
    for (const uid of fitted.dropped) assert.equal(typeof uid, 'number');
    // Dropped and kept uids are disjoint and together account for everything.
    const kept = fitted.rows.map((r) => r.uid);
    assert.deepEqual(
        [...kept, ...fitted.dropped].sort((a, b) => a - b),
        [0, 1, 2, 3, 4],
    );
});

test('fitCatalogToBudget: an unreachable budget still terminates and stays honest', () => {
    const fitted = buildCatalog(mixedBook(), { ...buildOpts, maxSerializedBytes: 1, minSummaryChars: 1 });
    assert.deepEqual(fitted.rows, []);
    assert.equal(fitted.truncated, true);
    assert.equal(fitted.dropped.length, 5);
    assert.equal(fitted.stats.total, 0);
});

test('measureCatalog: the reported size includes the size field itself', () => {
    // The regression: `stats.bytes` lives inside the object it measures, so a
    // single measurement under-reports by the width of its own digits and the
    // stored chat_metadata cost reads low. It has to be a fixed point.
    const catalog = buildCatalog(mixedBook(), buildOpts);
    assert.equal(catalog.stats.bytes, catalogByteLength(catalog));
    assert.equal(measureCatalog(catalog), catalog.stats.bytes, 'measuring twice must not move the number');
});

test('byteLength: counts UTF-8 bytes, not UTF-16 units', () => {
    assert.equal(byteLength('abc'), 3);
    assert.equal(byteLength('–'), 3);   // en dash, the provenance separator
    assert.equal(byteLength('🎬'), 4);  // a title-format emoji
});

// ---------------------------------------------------------------- config

test('resolveCatalogConfig: per-chat overrides global, global overrides defaults', () => {
    assert.deepEqual(resolveCatalogConfig(null, null), { ...CATALOG_DEFAULTS });

    const cfg = resolveCatalogConfig(
        { catalog: { maxSummaryChars: 100, maxSerializedBytes: 1024, enabled: false } },
        { catalog: { maxSummaryChars: 80 } },
    );
    assert.equal(cfg.maxSummaryChars, 80);
    assert.equal(cfg.maxSerializedBytes, 1024);
    assert.equal(cfg.enabled, false);
});

test('resolveCatalogConfig: nonsense values fall back rather than corrupt the build', () => {
    const cfg = resolveCatalogConfig({ catalog: { maxSummaryChars: -5, maxNames: 'lots' } }, null);
    assert.equal(cfg.maxSummaryChars, CATALOG_DEFAULTS.maxSummaryChars);
    assert.equal(cfg.maxNames, CATALOG_DEFAULTS.maxNames);
});

test('resolveCatalogConfig: the summary floor never exceeds the summary target', () => {
    const cfg = resolveCatalogConfig({ catalog: { maxSummaryChars: 40, minSummaryChars: 200 } }, null);
    assert.equal(cfg.minSummaryChars, 40);
});

// ---------------------------------------------------------------- rendering

test('formatCatalogLines: one line per enabled entry, disabled hidden by default', () => {
    const lore = mixedBook();
    lore.entries['4'].disable = true;
    const catalog = buildCatalog(lore, buildOpts);

    const lines = formatCatalogLines(catalog);
    assert.equal(lines.length, 4);
    assert.match(lines[0], /^0 \| memory \| 01 - The Siege \| Brandon, Fort Bramblehold, 01 - The Siege \| ~\d+t \| The siege broke at dawn\.$/);

    assert.equal(formatCatalogLines(catalog, { includeDisabled: true }).length, 5);
    assert.equal(formatCatalogLines(catalog, { kinds: [ENTRY_KINDS.MEMORY] }).length, 1);
    assert.deepEqual(formatCatalogLines(null), []);
});

// ---------------------------------------------------------------- fixture gate

test('ACCEPTANCE: the 328-msg fixture lorebook serializes inside the chat_metadata budget', () => {
    const lore = JSON.parse(readFileSync(FIXTURE_LOREBOOK, 'utf8'));
    const entryCount = Object.keys(lore.entries).length;
    assert.equal(entryCount, 52, 'fixture drifted — re-check the numbers below');

    const catalog = buildCatalog(lore, { now: FIXED_NOW, lorebookName: 'Magisa', reason: 'test' });

    // Nothing was lost: every fixture entry is indexed.
    assert.equal(catalog.rows.length, entryCount);
    assert.equal(catalog.truncated, false);
    assert.deepEqual(catalog.dropped, []);

    // Every row is usable — that is what "compact index" has to still mean.
    for (const row of catalog.rows) {
        assert.ok(row.title.length > 0, `uid ${row.uid} lost its title`);
        assert.ok(row.n.length > 0, `uid ${row.uid} lost its entity names`);
        assert.ok(row.s.length > 0, `uid ${row.uid} lost its summary`);
        assert.ok(row.t > 0, `uid ${row.uid} lost its token size`);
        assert.ok(row.s.length <= CATALOG_DEFAULTS.maxSummaryChars);
    }

    const bytes = catalogByteLength(catalog);
    assert.equal(bytes, catalog.stats.bytes);
    assert.ok(
        bytes <= CATALOG_DEFAULTS.maxSerializedBytes,
        `catalog is ${bytes} bytes, over the ${CATALOG_DEFAULTS.maxSerializedBytes}-byte budget`,
    );

    // The index has to be dramatically smaller than the book it indexes,
    // otherwise storing it in chat_metadata buys nothing.
    const rawBytes = byteLength(JSON.stringify(lore));
    assert.ok(bytes * 5 < rawBytes, `index ${bytes}B vs lorebook ${rawBytes}B — not compact enough`);

    // And it has to survive the chat_metadata round trip unchanged.
    const revived = JSON.parse(serializeCatalog(catalog));
    assert.deepEqual(revived, catalog);
    assert.equal(diffCatalog(revived, lore).isStale, false);

    console.log(
        `[P7.1] fixture catalog: ${catalog.rows.length} rows, ${bytes} B ` +
        `(${((bytes / CATALOG_DEFAULTS.maxSerializedBytes) * 100).toFixed(1)}% of budget), ` +
        `lorebook ${rawBytes} B, ${catalog.stats.tokens} indexed tokens`,
    );
});

test('ACCEPTANCE: stale detection round-trips on the fixture lorebook', () => {
    const lore = JSON.parse(readFileSync(FIXTURE_LOREBOOK, 'utf8'));
    const catalog = buildCatalog(lore, { now: FIXED_NOW, lorebookName: 'Magisa' });

    // Simulate the three things that happen to a live lorebook.
    lore.entries['0'].content += '\nNew development: knighted.';   // pipeline rewrite
    lore.entries['99'] = entry({ uid: 99, comment: 'New Scene', key: ['Sable'], stmemorybooks: true, content: 'A courier arrives.' });
    delete lore.entries['5'];

    const diff = diffCatalog(catalog, lore);
    assert.deepEqual(diff.changed, [0]);
    assert.deepEqual(diff.added, [99]);
    assert.deepEqual(diff.removed, [5]);
    assert.equal(diff.isStale, true);

    const refreshed = refreshCatalog(catalog, lore, { now: FIXED_NOW + 1, lorebookName: 'Magisa' });
    assert.equal(refreshed.rebuilt, true);
    assert.equal(diffCatalog(refreshed.catalog, lore).isStale, false);
    assert.ok(refreshed.catalog.rows.some((r) => r.uid === 99));
    assert.ok(!refreshed.catalog.rows.some((r) => r.uid === 5));
});
