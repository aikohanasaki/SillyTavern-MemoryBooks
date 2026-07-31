// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// Phase 7 P7.2 — librarian pre-turn retrieval + additive injection.
// Acceptance for PHA-1635, one describe() per criterion:
//
//   1. "Narrator prompt differs from stock ONLY in injected entries"
//      -> §parity: a stand-in prompt assembler shaped like SillyTavern's, run
//         stock / librarian-disabled / librarian-enabled, diffed byte-wise.
//   2. "Keyword/constant activation never suppressed; librarian only adds,
//      within token budget enforced in code"
//      -> §additive and §budget.
//   3. "Kill librarian API mid-session: generation proceeds identically to stock"
//      -> §fail-open, with every failure mode the live path can produce.
//   4. "Strict JSON discipline: one retry then skip, never guess"
//      -> §json.
//
// Run: node --test librarianCore.test.js

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import {
    LIBRARIAN_DEFAULTS,
    LIBRARIAN_PROMPT,
    LIBRARIAN_JSON_REPRIMAND,
    DROP_REASONS,
    resolveLibrarianConfig,
    buildLibrarianWindow,
    buildLibrarianPrompt,
    parseSelection,
    selectEntries,
    scanLikelyActiveUids,
    planLibrarianInjection,
    renderInjection,
    estimateTokens,
    runLibrarianRetrieval,
} from './librarianCore.js';

const HERE = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------- fixtures

/** A small lorebook: two keyword-bearing entries, two the keywords can't reach. */
const ENTRIES = [
    { uid: 1, comment: 'Brandon Ashvale', content: 'Brandon Ashvale, sellsword, owes the Guild a debt.', key: ['Brandon', 'Ashvale'], constant: false },
    { uid: 2, comment: 'Fort Bramblehold', content: 'A border fort held by the Thornguard.', key: ['Bramblehold'], constant: false },
    { uid: 3, comment: 'The Siege of Yl', content: 'The siege ended when the west wall fell.', key: ['Yl', 'siege'], constant: false },
    { uid: 4, comment: 'The Quiet Compact', content: 'A pact nobody names aloud; it binds the Thornguard.', key: ['Compact'], constant: false },
    { uid: 5, comment: 'World rules', content: 'Magic costs memory.', key: [], constant: true },
    { uid: 6, comment: 'Retired entry', content: 'Old lore.', key: ['old'], constant: false, disable: true },
    { uid: 7, comment: 'Empty entry', content: '   ', key: ['blank'], constant: false },
];

const ROWS = [
    { uid: 1, kind: 'memory', title: 'Brandon Ashvale', n: ['Brandon'], s: 'sellsword', t: 20 },
    { uid: 2, kind: 'memory', title: 'Fort Bramblehold', n: ['Bramblehold'], s: 'border fort', t: 20 },
    { uid: 3, kind: 'memory', title: 'The Siege of Yl', n: ['Yl'], s: 'the siege', t: 20 },
    { uid: 4, kind: 'manual', title: 'The Quiet Compact', n: [], s: 'a pact', t: 20 },
    { uid: 5, kind: 'manual', title: 'World rules', n: [], s: 'magic', t: 10 },
];

const CHAT = [
    { name: 'User', mes: 'We ride for the fort at dawn.', is_user: true },
    { name: 'Narrator', mes: 'The Thornguard banner snaps in the wind above the gate.' },
    { name: 'User', mes: 'Ask the captain about the pact.', is_user: true },
];

const byUid = (uid) => ENTRIES.find(e => e.uid === uid) || null;
const rowOf = (uid) => ROWS.find(r => r.uid === uid) || null;

/** Catalog lines in the shape catalogCore.formatCatalogLines emits. */
const CATALOG_LINES = ROWS.map(r => `${r.uid} | ${r.kind} | ${r.title} | ${r.n.join(', ')} | ~${r.t}t | ${r.s}`);

/** Deps bundle for runLibrarianRetrieval; `over` patches any piece of it. */
function deps(over = {}) {
    return {
        config: { ...LIBRARIAN_DEFAULTS, enabled: true, tokenBudget: 200, maxEntries: 4 },
        getChat: () => CHAT,
        getCatalogLines: () => ({ lines: CATALOG_LINES }),
        getEntries: () => ENTRIES,
        getRow: rowOf,
        select: async () => '[3, 4]',
        ...over,
    };
}

// ---------------------------------------------------------------- 1. parity

/**
 * Stand-in for SillyTavern's prompt assembly, at the only resolution this test
 * needs: a stock prompt is system + world-info + scene, and world-info is the
 * ACTIVATED ENTRIES' CONTENT joined by newlines. The librarian's contribution
 * enters the same slot, never anywhere else.
 */
function assembleNarratorPrompt({ activated, librarianEntries = [] }) {
    const wi = [...activated, ...librarianEntries].map(e => e.content).join('\n');
    return [
        'SYSTEM: You are the narrator.',
        wi,
        CHAT.map(m => `${m.name}: ${m.mes}`).join('\n'),
    ].join('\n\n');
}

test.describe('parity — the narrator prompt differs from stock ONLY in injected entries', () => {
    const activated = [byUid(5), byUid(2)]; // constant + a keyword hit
    const stock = assembleNarratorPrompt({ activated });

    test('librarian disabled produces a byte-identical prompt', async () => {
        const record = await runLibrarianRetrieval(deps({
            config: { ...LIBRARIAN_DEFAULTS, enabled: false },
            select: async () => { throw new Error('the disabled librarian must not call out'); },
        }));
        assert.equal(record.action, 'skip:disabled');
        assert.deepEqual(record.included, []);

        const withLibrarian = assembleNarratorPrompt({ activated, librarianEntries: record.included });
        assert.equal(withLibrarian, stock);
    });

    test('enabled, the diff is exactly the injected entries and nothing else', async () => {
        const record = await runLibrarianRetrieval(deps({ select: async () => '[3, 4]' }));
        assert.equal(record.action, 'inject');

        const withLibrarian = assembleNarratorPrompt({ activated, librarianEntries: record.included });
        assert.notEqual(withLibrarian, stock);

        // The stock prompt survives verbatim as a prefix/suffix pair around the
        // insertion: nothing was rewritten, reordered, or removed.
        const [stockHead, stockWi, stockTail] = stock.split('\n\n');
        const [newHead, newWi, newTail] = withLibrarian.split('\n\n');
        assert.equal(newHead, stockHead);
        assert.equal(newTail, stockTail);
        assert.ok(newWi.startsWith(stockWi), 'stock world-info must remain, untouched, at the front');

        const added = newWi.slice(stockWi.length);
        assert.equal(added, '\n' + renderInjection(record.included));
    });

    test('renderInjection emits entry content only — no titles, headers or framing', () => {
        const text = renderInjection([
            { uid: 3, title: 'The Siege of Yl', content: 'The siege ended when the west wall fell.' },
            { uid: 4, title: 'The Quiet Compact', content: 'A pact nobody names aloud; it binds the Thornguard.' },
        ]);
        assert.equal(
            text,
            'The siege ended when the west wall fell.\nA pact nobody names aloud; it binds the Thornguard.',
        );
        assert.ok(!/Siege of Yl|Quiet Compact|relevant|lore/i.test(text));
    });

    test('nothing selected is the same as disabled', async () => {
        const record = await runLibrarianRetrieval(deps({ select: async () => '[]' }));
        assert.equal(record.action, 'skip:nothing-selected');
        assert.equal(assembleNarratorPrompt({ activated, librarianEntries: record.included }), stock);
    });
});

// ---------------------------------------------------------------- 2. additive

test.describe('additive — keyword/constant activation is never suppressed', () => {
    test('the plan is a list of additions; it can express no removal', async () => {
        const record = await runLibrarianRetrieval(deps({ select: async () => '[1, 2, 3, 4, 5]' }));
        // Everything the engine returns is something to ADD...
        assert.ok(record.included.every(e => typeof e.content === 'string' && e.content.length > 0));
        // ...and the entry ST activates on its own (the constant) is simply
        // absent from the additions — already in the prompt, not suppressed.
        assert.deepEqual(record.included.map(e => e.uid), [1, 2, 3, 4]);
        assert.deepEqual(record.dropped, [{ uid: 5, reason: DROP_REASONS.ALREADY_ACTIVE }]);
    });

    test('scanLikelyActiveUids finds constants and whole-word key hits', () => {
        const active = scanLikelyActiveUids(ENTRIES, 'The banner of Bramblehold flies over the pact.');
        assert.ok(active.has(5), 'constant');
        assert.ok(active.has(2), 'keyword "Bramblehold"');
        assert.ok(!active.has(1), 'Brandon is not in the text');
        assert.ok(!active.has(6), 'disabled entries are never reported active');
    });

    test('scan does not fire on substrings of longer words', () => {
        // "Yl" must not match inside "Ylsdottir"; that false positive would cost
        // us a legitimate librarian addition.
        const active = scanLikelyActiveUids(ENTRIES, 'Ylsdottir crossed the bridge.');
        assert.ok(!active.has(3));
        assert.ok(active.has(3) === false && scanLikelyActiveUids(ENTRIES, 'The siege of Yl.').has(3));
    });

    test('already-active entries are dropped with a reason, never silently', () => {
        const plan = planLibrarianInjection({
            ids: [2, 3],
            getEntry: byUid,
            getRow: rowOf,
            likelyActive: new Set([2]),
            cfg: { ...LIBRARIAN_DEFAULTS, tokenBudget: 500, maxEntries: 10 },
        });
        assert.deepEqual(plan.included.map(e => e.uid), [3]);
        assert.deepEqual(plan.dropped, [{ uid: 2, reason: DROP_REASONS.ALREADY_ACTIVE }]);
    });

    test('skipLikelyActive:false re-admits them (dedup is then ST\'s job)', () => {
        const plan = planLibrarianInjection({
            ids: [2, 3],
            getEntry: byUid,
            getRow: rowOf,
            likelyActive: new Set([2]),
            cfg: { ...LIBRARIAN_DEFAULTS, tokenBudget: 500, maxEntries: 10, skipLikelyActive: false },
        });
        assert.deepEqual(plan.included.map(e => e.uid), [2, 3]);
    });

    test('disabled and empty entries are never injected', () => {
        const plan = planLibrarianInjection({
            ids: [6, 7, 3],
            getEntry: byUid,
            getRow: rowOf,
            cfg: { ...LIBRARIAN_DEFAULTS, tokenBudget: 500, maxEntries: 10 },
        });
        assert.deepEqual(plan.included.map(e => e.uid), [3]);
        assert.deepEqual(plan.dropped, [
            { uid: 6, reason: DROP_REASONS.DISABLED },
            { uid: 7, reason: DROP_REASONS.EMPTY },
        ]);
    });
});

// ---------------------------------------------------------------- 2b. budget

test.describe('budget — enforced in code, not by the model', () => {
    test('a model that ignores the entry cap is capped anyway', () => {
        const plan = planLibrarianInjection({
            ids: [1, 2, 3, 4, 5],
            getEntry: byUid,
            getRow: rowOf,
            cfg: { ...LIBRARIAN_DEFAULTS, maxEntries: 2, tokenBudget: 10000 },
        });
        assert.equal(plan.included.length, 2);
        assert.deepEqual(plan.included.map(e => e.uid), [1, 2]);
        assert.deepEqual(
            plan.dropped,
            [3, 4, 5].map(uid => ({ uid, reason: DROP_REASONS.ENTRY_CAP })),
        );
    });

    test('the token budget is never exceeded, and overruns are reported', () => {
        const plan = planLibrarianInjection({
            ids: [1, 2, 3, 5],
            getEntry: byUid,
            getRow: rowOf,
            cfg: { ...LIBRARIAN_DEFAULTS, maxEntries: 10, tokenBudget: 55 },
        });
        // Rows 1 and 2 cost 20 each; 3 would make 60 > 55 and is refused; 5
        // costs 10 and still fits, so the walk continues past the refusal.
        assert.deepEqual(plan.included.map(e => e.uid), [1, 2, 5]);
        assert.equal(plan.usedTokens, 50);
        assert.ok(plan.usedTokens <= plan.budget);
        assert.deepEqual(plan.dropped, [{ uid: 3, reason: DROP_REASONS.TOKEN_BUDGET }]);
    });

    test('a zero budget injects nothing at all', () => {
        const plan = planLibrarianInjection({
            ids: [1, 2],
            getEntry: byUid,
            getRow: rowOf,
            cfg: { ...LIBRARIAN_DEFAULTS, tokenBudget: 0 },
        });
        assert.deepEqual(plan.included, []);
        assert.equal(plan.usedTokens, 0);
        assert.equal(plan.dropped.length, 2);
    });

    test('priority order is the model\'s order, so the budget keeps its top picks', () => {
        const plan = planLibrarianInjection({
            ids: [4, 3, 1],
            getEntry: byUid,
            getRow: rowOf,
            cfg: { ...LIBRARIAN_DEFAULTS, maxEntries: 10, tokenBudget: 40 },
        });
        assert.deepEqual(plan.included.map(e => e.uid), [4, 3]);
    });

    test('unknown and duplicate ids are refused with a reason', () => {
        const plan = planLibrarianInjection({
            ids: [3, 3, 999, 'x'],
            getEntry: byUid,
            getRow: rowOf,
            cfg: { ...LIBRARIAN_DEFAULTS, maxEntries: 10, tokenBudget: 500 },
        });
        assert.deepEqual(plan.included.map(e => e.uid), [3]);
        assert.deepEqual(plan.dropped.map(d => d.reason), [
            DROP_REASONS.DUPLICATE, DROP_REASONS.UNKNOWN, DROP_REASONS.UNKNOWN,
        ]);
    });

    test('entries the catalog has not indexed are still charged a size', () => {
        const plan = planLibrarianInjection({
            ids: [7],
            getEntry: () => ({ uid: 7, content: 'x'.repeat(400) }),
            getRow: () => null,
            cfg: { ...LIBRARIAN_DEFAULTS, maxEntries: 10, tokenBudget: 1000 },
        });
        assert.equal(plan.included[0].tokens, estimateTokens('x'.repeat(400)));
        assert.equal(plan.usedTokens, 100);
    });

    test('kinds filter restricts retrieval without silence', () => {
        const plan = planLibrarianInjection({
            ids: [4, 3],
            getEntry: byUid,
            getRow: rowOf,
            cfg: { ...LIBRARIAN_DEFAULTS, maxEntries: 10, tokenBudget: 500, kinds: ['memory'] },
        });
        assert.deepEqual(plan.included.map(e => e.uid), [3]);
        assert.deepEqual(plan.dropped, [{ uid: 4, reason: DROP_REASONS.KIND }]);
    });
});

// ---------------------------------------------------------------- 3. fail-open

test.describe('fail-open — every failure yields the stock prompt', () => {
    const cases = [
        ['API killed mid-session', { select: async () => { throw new Error('ECONNREFUSED'); } }, 'skip:call-failed'],
        ['request timed out', { select: async () => { throw new Error('librarian call exceeded 8000ms'); } }, 'skip:call-failed'],
        ['API returns garbage forever', { select: async () => 'I am sorry, I cannot do that.' }, 'skip:bad-json'],
        ['no catalog built yet', { getCatalogLines: () => ({ lines: [] }) }, 'skip:no-catalog'],
        ['empty chat', { getChat: () => [] }, 'skip:no-window'],
        ['lorebook load fails', { getEntries: async () => { throw new Error('404'); } }, 'skip:error'],
        ['catalog accessor explodes', { getCatalogLines: () => { throw new Error('metadata gone'); } }, 'skip:error'],
        ['cancelled mid-turn', { isCancelled: () => true }, 'skip:cancelled'],
        ['disabled', { config: { ...LIBRARIAN_DEFAULTS, enabled: false } }, 'skip:disabled'],
    ];

    for (const [name, over, expected] of cases) {
        test(`${name} -> ${expected}, injects nothing, does not throw`, async () => {
            const record = await runLibrarianRetrieval(deps(over));
            assert.equal(record.action, expected);
            assert.deepEqual(record.included, []);
            assert.equal(renderInjection(record.included), '');
        });
    }

    test('a broken deps bundle still fails open rather than throwing', async () => {
        const record = await runLibrarianRetrieval({ config: { ...LIBRARIAN_DEFAULTS, enabled: true } });
        assert.ok(record.action.startsWith('skip:'));
        assert.deepEqual(record.included, []);
    });

    test('the API dying on the RETRY is still a clean skip', async () => {
        let n = 0;
        const record = await runLibrarianRetrieval(deps({
            select: async () => {
                if (n++ === 0) return 'sure! here you go:';
                throw new Error('ECONNREFUSED');
            },
        }));
        assert.equal(record.action, 'skip:call-failed');
        assert.deepEqual(record.included, []);
    });
});

// ---------------------------------------------------------------- 4. json

test.describe('strict JSON — one retry, then skip; never guess', () => {
    test('parseSelection accepts a bare integer array', () => {
        assert.deepEqual(parseSelection('[12, 4, 31]'), [12, 4, 31]);
        assert.deepEqual(parseSelection('  []  '), []);
    });

    test('parseSelection accepts a single code fence', () => {
        assert.deepEqual(parseSelection('```json\n[1, 2]\n```'), [1, 2]);
    });

    test('parseSelection accepts {id} objects and takes ARRAY ORDER as priority', () => {
        assert.deepEqual(
            parseSelection('[{"id": 7, "priority": 1}, {"id": 3, "priority": 9}]'),
            [7, 3],
        );
    });

    test('parseSelection refuses to salvage a partially valid reply', () => {
        assert.equal(parseSelection('[1, "two", 3]'), null);
        assert.equal(parseSelection('[1, 2.5]'), null);
        assert.equal(parseSelection('[{"name": "Brandon"}]'), null);
        assert.equal(parseSelection('Here you go: [1, 2]'), null);
        assert.equal(parseSelection('{"ids": [1, 2]}'), null);
        assert.equal(parseSelection(''), null);
        assert.equal(parseSelection(null), null);
    });

    test('exactly one retry, carrying the reprimand', async () => {
        const prompts = [];
        const { ids, attempts } = await selectEntries({
            select: async (p) => { prompts.push(p); return prompts.length === 1 ? 'nope' : '[3]'; },
            catalogLines: CATALOG_LINES,
            windowText: 'x',
        });
        assert.deepEqual(ids, [3]);
        assert.equal(attempts.length, 2);
        assert.ok(prompts[1].endsWith(LIBRARIAN_JSON_REPRIMAND));
        assert.ok(prompts[1].startsWith(prompts[0]), 'the retry re-sends the same prompt, plus the reprimand');
    });

    test('two bad replies is a skip, not a third attempt and not a guess', async () => {
        let calls = 0;
        const record = await runLibrarianRetrieval(deps({
            select: async () => { calls++; return 'entries 3 and 4 look relevant'; },
        }));
        assert.equal(calls, 2);
        assert.equal(record.action, 'skip:bad-json');
        assert.deepEqual(record.included, []);
    });

    test('a good first reply costs exactly one call', async () => {
        let calls = 0;
        const record = await runLibrarianRetrieval(deps({
            select: async () => { calls++; return '[3]'; },
        }));
        assert.equal(calls, 1);
        assert.equal(record.action, 'inject');
    });
});

// ---------------------------------------------------------------- structure

test.describe('structure — the prime constraint, asserted against the source', () => {
    test('librarianCore.js stays pure: no ST imports, no call surface of its own', () => {
        const src = readFileSync(join(HERE, 'librarianCore.js'), 'utf8');
        const imports = [...src.matchAll(/^import[\s\S]*?from '([^']+)';$/gm)].map(m => m[1]);
        assert.deepEqual(imports, ['./sentinelCore.js']);
        // The ONE call the librarian makes is the injected `select` dep. Anything
        // that could reach the network from in here would be a second one.
        assert.doesNotMatch(src, /\bfetch\s*\(|generateRaw|generateQuietPrompt|ConnectionManagerRequestService/);
    });

    test('the binding never injects anything but entry content', () => {
        const raw = readFileSync(join(HERE, 'librarian.js'), 'utf8');
        // Comments describe the mechanism (including the header's path diagram);
        // only real call sites are being audited here.
        const src = raw.split('\n').filter(l => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
        const calls = [...src.matchAll(/setExtensionPrompt\(/g)];
        assert.ok(calls.length > 0, 'the extension-prompt fallback must still exist');
        for (const call of calls) {
            const tail = src.slice(call.index, call.index + 240);
            assert.ok(
                /renderInjection\(/.test(tail) || /setExtensionPrompt\(\s*LIBRARIAN_PROMPT_KEY,\s*''\s*\)/.test(tail),
                `every injection is either renderInjection(...) or a clear; found: ${tail.slice(0, 80)}`,
            );
        }
        // Nothing may re-scan the injected text for further world-info matches:
        // that would let the librarian trigger activations of its own.
        assert.match(src, /false,\s*\/\/ never re-scan/);
    });

    test('a quiet generation clears the standing plan instead of returning past it', () => {
        const raw = readFileSync(join(HERE, 'librarian.js'), 'utf8');
        const src = raw.split('\n').filter(l => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
        // The quiet guard has to CLEAR. A bare `return` leaves last turn's
        // pendingEntries standing, and the quiet generation's own world-info
        // scan would then force-activate them into a memory-generation prompt.
        const guard = /type === 'quiet'\)\s*\{\s*clearLibrarianInjection\(\);\s*return;\s*\}/;
        assert.match(src, guard, 'the quiet path must clear the injection before returning');
        assert.doesNotMatch(src, /type === 'quiet'\)\s*return;/);
    });
});

// ---------------------------------------------------------------- plumbing

test.describe('window, prompt and config', () => {
    test('the window is the last N visible messages, newest last', () => {
        const chat = [
            { name: 'A', mes: 'one' },
            { name: 'B', mes: 'two', is_system: true },
            { name: 'C', mes: 'three' },
            { name: 'D', mes: 'four' },
        ];
        const w = buildLibrarianWindow(chat, { window: 2, truncateChars: 100 });
        assert.equal(w.end, 3);
        assert.deepEqual(w.messages.map(m => m.id), [2, 3]);
        assert.equal(w.text, '[2] C: three\n[3] D: four');
    });

    test('hidden messages do not shrink the window', () => {
        const chat = [
            { name: 'A', mes: 'one' },
            { name: 'sys', mes: 'hidden', is_system: true },
            { name: 'sys', mes: 'hidden', is_system: true },
            { name: 'D', mes: 'four' },
        ];
        const w = buildLibrarianWindow(chat, { window: 2 });
        assert.deepEqual(w.messages.map(m => m.id), [0, 3]);
    });

    test('the window truncates like the sentinel does', () => {
        const w = buildLibrarianWindow([{ name: 'A', mes: 'a'.repeat(50) }], { window: 1, truncateChars: 10 });
        assert.equal(w.text, `[0] A: ${'a'.repeat(10)}…`);
    });

    test('an all-hidden chat yields no window (and therefore no call)', () => {
        assert.equal(buildLibrarianWindow([{ mes: 'x', is_system: true }], {}).text, '');
        assert.equal(buildLibrarianWindow([], {}).text, '');
    });

    test('the prompt carries the instruction, the catalog and the window', () => {
        const p = buildLibrarianPrompt({ catalogLines: CATALOG_LINES, windowText: '[0] A: hi', maxEntries: 4 });
        assert.ok(p.startsWith(LIBRARIAN_PROMPT));
        assert.ok(p.includes('Select at most 4 ids.'));
        assert.ok(p.includes('### CATALOG'));
        assert.ok(p.includes(CATALOG_LINES[0]));
        assert.ok(p.endsWith('### RECENT MESSAGES\n[0] A: hi'));
    });

    test('a custom prompt overrides the bundled one', () => {
        const p = buildLibrarianPrompt({ systemPrompt: 'PICK THINGS.', catalogLines: [], windowText: '' });
        assert.ok(p.startsWith('PICK THINGS.'));
        assert.ok(!p.includes(LIBRARIAN_PROMPT));
    });

    test('config defaults are off, and per-chat beats global', () => {
        assert.equal(LIBRARIAN_DEFAULTS.enabled, false);
        assert.equal(resolveLibrarianConfig(null, null).enabled, false);

        const cfg = resolveLibrarianConfig(
            { librarian: { enabled: true, maxEntries: 5, tokenBudget: 900, kinds: ['memory'] } },
            { librarian: { maxEntries: 3 } },
        );
        assert.equal(cfg.enabled, true);
        assert.equal(cfg.maxEntries, 3);
        assert.equal(cfg.tokenBudget, 900);
        assert.deepEqual(cfg.kinds, ['memory']);
    });

    test('out-of-range and junk settings fall back to defaults', () => {
        const cfg = resolveLibrarianConfig(
            { librarian: { maxEntries: -4, tokenBudget: 'lots', timeoutMs: 10, window: 1e9 } },
            null,
        );
        assert.equal(cfg.maxEntries, LIBRARIAN_DEFAULTS.maxEntries);
        assert.equal(cfg.tokenBudget, LIBRARIAN_DEFAULTS.tokenBudget);
        assert.equal(cfg.timeoutMs, LIBRARIAN_DEFAULTS.timeoutMs);
        assert.equal(cfg.window, LIBRARIAN_DEFAULTS.window);
    });

    test('the retrieval record reports what it did (no silent caps)', async () => {
        const record = await runLibrarianRetrieval(deps({
            select: async () => '[1, 2, 3, 4]',
            config: { ...LIBRARIAN_DEFAULTS, enabled: true, maxEntries: 2, tokenBudget: 1000 },
        }));
        assert.equal(record.action, 'inject');
        assert.equal(record.selected, 4);
        assert.equal(record.included.length, 2);
        assert.equal(record.dropped.length, 2);
        assert.equal(record.budget, 1000);
        assert.ok(record.usedTokens > 0);
        assert.equal(record.window.messages, 3);
        assert.equal(record.attempts, 1);
    });
});
