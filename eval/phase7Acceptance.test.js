// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// eval/phase7Acceptance.test.js — tests for the Phase 7 acceptance harness.
//
// One describe() per epic gate, plus one per sanity gate. These test the
// HARNESS, not the librarian: librarianCore's own guarantees are covered by
// librarianCore.test.js and librarianCacheCore.test.js. What is at stake here
// is whether a green Phase 7 gate means anything — a harness that measures the
// wrong thing passes just as loudly as one that measures the right thing.

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { deriveGroundTruth } from './groundTruth.js';
import {
    DEFAULT_FIXTURE,
    DEFAULT_WORLDBOOK,
    PHASE7_DEFAULTS,
    buildFixtureCatalog,
    buildRetrievalGroundTruth,
    buildScenes,
    checkByteParity,
    checkCoverage,
    checkLatency,
    checkTokenBudget,
    entryTerms,
    loadFixture,
    loadLorebook,
    makeKillableSelector,
    makeOracleLibrarian,
    makeSurrogateLibrarian,
    oracleBoundaries,
    oracleBoundaryGate,
    oracleCoverageGate,
    percentile,
    renderStockInjection,
    replay,
    scoreCoverage,
} from './phase7Acceptance.js';

// ----------------------------------------------------------------------------
// Synthetic fixtures — small, so most tests do not pay for the 329-msg replay
// ----------------------------------------------------------------------------

const narr = (index, location, time, text) => ({
    index,
    speaker: 'Narrator',
    isUser: false,
    isSystem: false,
    text: `[ 🕰️ Time ${time} | 📍 ${location} ]\n${text}`,
    headers: { location, time },
});

function tinyWorld() {
    const entries = {
        1: { uid: 1, comment: 'Vashka the Toll-Keeper', key: ['Vashka'], content: 'Vashka guards the bridge toll.' },
        2: { uid: 2, comment: 'Bridge of Coins', key: ['Bridge of Coins'], content: 'A stone bridge where tolls are paid.' },
        3: { uid: 3, comment: 'Disabled Entry', key: ['Nobody'], content: 'never injected', disable: true },
        4: { uid: 4, comment: 'Empty Entry', key: ['Hollow'], content: '   ' },
    };
    return { entries };
}

function tinyFixture() {
    const messages = [];
    for (let i = 1; i <= 8; i++) messages.push(narr(i, 'Bridge of Coins', '9:00 AM', `Vashka counts coins. ${i}`));
    // Scene 2 names Vashka on purpose: a scene whose key is empty is not a
    // scoreable transition, and a fixture with no scoreable transition would
    // let a broken scorer look perfect.
    for (let i = 9; i <= 16; i++) messages.push(narr(i, 'Toll House', '10:00 AM', `Vashka follows the party into the toll house. ${i}`));
    const chat = messages.map((m) => ({ name: m.speaker, is_user: false, is_system: false, mes: m.text }));
    return { messages, chat };
}

async function tinyReplayBase(opts = {}) {
    const { messages, chat } = tinyFixture();
    const lorebookData = tinyWorld();
    const entries = Object.values(lorebookData.entries).map((e) => ({ ...e, uid: Number(e.uid) }));
    const byUid = new Map(entries.map((e) => [e.uid, e]));
    const catalog = buildFixtureCatalog(lorebookData);
    const gtBoundaries = deriveGroundTruth(messages, {
        timeJumpMinutes: PHASE7_DEFAULTS.timeJumpMinutes,
        minSceneMessages: PHASE7_DEFAULTS.minSceneMessages,
    }).boundaries;
    const scenes = buildScenes(gtBoundaries, messages.length);
    const gt = buildRetrievalGroundTruth({ scenes, messages, entries, rows: catalog.rows });
    return {
        chat, messages, entries, byUid, catalog, scenes, boundaries: gtBoundaries, gt,
        now: () => 0, ...opts,
    };
}

// Loaded once; several integration tests share it.
let realFixture = null;
async function realReplayBase() {
    if (!realFixture) {
        const { messages, chat } = await loadFixture(DEFAULT_FIXTURE);
        const { lorebookData, entries, byUid } = await loadLorebook(DEFAULT_WORLDBOOK);
        const catalog = buildFixtureCatalog(lorebookData);
        const gate = oracleBoundaryGate(messages);
        const scenes = buildScenes(gate.key, messages.length);
        const gt = buildRetrievalGroundTruth({ scenes, messages, entries, rows: catalog.rows });
        realFixture = { chat, messages, entries, byUid, catalog, scenes, boundaries: gate.key, gt, gate };
    }
    return realFixture;
}

// ----------------------------------------------------------------------------

describe('fixture loading', () => {
    test('chat[i] is message index i+1 — the offset every score in this file rests on', async () => {
        const { messages, chat } = await loadFixture(DEFAULT_FIXTURE);
        assert.equal(chat.length, messages.length);
        for (const i of [0, 1, 50, messages.length - 1]) {
            assert.equal(messages[i].index, i + 1);
            assert.equal(chat[i].mes, messages[i].text);
        }
    });

    test('lorebook loads with numeric uids and a uid->entry map that agrees', async () => {
        const { entries, byUid } = await loadLorebook(DEFAULT_WORLDBOOK);
        assert.ok(entries.length > 0);
        for (const e of entries) {
            assert.equal(typeof e.uid, 'number');
            assert.equal(byUid.get(e.uid), e);
        }
    });
});

describe('SANITY GATE 1 — the boundary key', () => {
    test('the oracle is an independent implementation, not a call into the key', async () => {
        const { messages } = await realReplayBase();
        const gate = oracleBoundaryGate(messages);
        assert.equal(gate.score.precision, 1);
        assert.equal(gate.score.recall, 1);
        assert.deepEqual(gate.oracle, gate.key);
    });

    test('the key uses the fine-grained rules, not the condemned 22-boundary one', async () => {
        const { messages } = await realReplayBase();
        const fine = deriveGroundTruth(messages, { minSceneMessages: 6 });
        const legacy = deriveGroundTruth(messages, { minSceneMessages: 6, mergeMode: 'own' });
        assert.equal(legacy.boundaries.length, 22, 'the legacy over-merged key, kept only for reproduction');
        assert.ok(fine.boundaries.length > legacy.boundaries.length);
        assert.equal(fine.boundaries.length, 35, 'the key Phase 7 is graded against');
    });

    test('the oracle DISAGREES when the merge rules disagree — the gate can fail', async () => {
        const { messages } = await realReplayBase();
        // Score the fine-grained oracle against the legacy key on purpose. If
        // this came back 1.0/1.0 the gate would be tautological and useless.
        const legacy = deriveGroundTruth(messages, { minSceneMessages: 6, mergeMode: 'own' });
        const oracle = oracleBoundaries(messages);
        assert.notDeepEqual(oracle, legacy.boundaries);
    });

    test('scenes tile the transcript with no gap and no overlap', async () => {
        const { messages, scenes } = await realReplayBase();
        assert.equal(scenes[0].start, 1);
        assert.equal(scenes[scenes.length - 1].end, messages.length);
        for (let i = 1; i < scenes.length; i++) {
            assert.equal(scenes[i].start, scenes[i - 1].end + 1);
        }
    });
});

describe('the retrieval answer key', () => {
    test('only injectable entries become coverage targets, and exclusions are reported', async () => {
        const base = await tinyReplayBase();
        const excludedUids = base.gt.excluded.map((x) => x.uid).sort();
        assert.deepEqual(excludedUids, [3, 4], 'the disabled entry and the empty one');
        assert.deepEqual(base.gt.excluded.find((x) => x.uid === 3).why, 'disabled');
        assert.deepEqual(base.gt.excluded.find((x) => x.uid === 4).why, 'empty');
        for (const hits of base.gt.bySceneIndex.values()) {
            assert.ok(!hits.has(3) && !hits.has(4));
        }
    });

    test('a scene key is the union of its messages, and terms below the floor are ignored', async () => {
        const base = await tinyReplayBase();
        const scene0 = base.gt.bySceneIndex.get(0);
        assert.ok(scene0.has(1), 'Vashka is named in scene 0');
        assert.ok(scene0.has(2), 'the Bridge of Coins is in the header of scene 0');

        const terms = entryTerms({ key: ['ab', 'Vashka'] }, { n: ['xy'], title: 'Vashka the Toll-Keeper' }, 4);
        assert.ok(!terms.includes('ab'), 'two-character keys are noise, not entities');
        assert.ok(!terms.includes('xy'));
        assert.ok(terms.includes('vashka'));
    });

    test('scoreCoverage is recall, and an empty key scores 1 rather than dividing by zero', () => {
        assert.equal(scoreCoverage([1, 2, 3], [2, 3]).coverage, 1);
        assert.equal(scoreCoverage([1], [1, 2]).coverage, 0.5);
        assert.deepEqual(scoreCoverage([1], [1, 2]).missed, [2]);
        assert.equal(scoreCoverage([], []).coverage, 1);
        assert.equal(scoreCoverage([], [7]).coverage, 0);
    });
});

describe('SANITY GATE 2 — the coverage scorer', () => {
    test('an oracle librarian covers the key exactly, with the caps lifted', async () => {
        const base = await tinyReplayBase();
        const gate = await oracleCoverageGate(base);
        assert.equal(gate.uncapped, 1);
        assert.equal(gate.ok, true);
    });

    test('the oracle can only answer with ids the catalog actually offers', async () => {
        const select = makeOracleLibrarian({ answerFor: () => [1, 999] });
        const reply = await select('7 | manual | X | X | ~5t | s\n1 | manual | V | V | ~5t | s\n[3] Narrator: hi');
        assert.deepEqual(JSON.parse(reply), [1], '999 is not in the catalog and is not smuggled in');
    });
});

describe('GATE 1 — parity', () => {
    test('librarian disabled means zero calls and zero injected bytes, every turn', async () => {
        const base = await realReplayBase();
        let called = 0;
        const run = await replay({
            ...base,
            select: async () => { called++; return '[]'; },
            config: { enabled: false },
            now: () => 0,
        });
        assert.equal(called, 0);
        const parity = checkByteParity(run.turns);
        assert.equal(parity.turns, base.chat.length);
        assert.equal(parity.offenders.length, 0);
        assert.ok(run.turns.every((t) => t.action === 'skip:disabled'));
    });

    test('the parity check FAILS when a turn injects — it is not a rubber stamp', () => {
        const bad = [{ t: 1, action: 'inject', addedBytes: 12, stockHash: 'a', effectiveHash: 'b' }];
        assert.equal(checkByteParity(bad).ok, false);
        assert.equal(checkByteParity(bad).offenders.length, 1);
    });

    test('the stock yardstick is content-only — no titles, no framing, no separators', async () => {
        const { byUid } = await tinyReplayBase();
        const text = renderStockInjection(new Set([1, 2]), byUid);
        assert.equal(text, 'Vashka guards the bridge toll.\nA stone bridge where tolls are paid.');
        assert.ok(!text.includes('Vashka the Toll-Keeper'), 'a title in the prompt would break parity');
    });

    test('the stock yardstick skips disabled and empty entries, like ST does', async () => {
        const { byUid } = await tinyReplayBase();
        assert.equal(renderStockInjection(new Set([3, 4]), byUid), '');
    });
});

describe('GATE 2 — fail-open', () => {
    for (const mode of ['throw', 'timeout', 'garbage']) {
        test(`a ${mode} API leaves every subsequent turn byte-identical to stock`, async () => {
            const base = await tinyReplayBase();
            const select = makeKillableSelector({
                inner: makeSurrogateLibrarian({ latencyMs: 0 }),
                killAfterCalls: 0,
                mode,
                timeoutMs: 1,
            });
            const run = await replay({ ...base, select, config: { cache: false } });
            assert.equal(checkByteParity(run.turns).offenders.length, 0);
            assert.ok(run.turns.every((t) => t.action === 'skip:call-failed' || t.action === 'skip:bad-json'));
            assert.ok(select.state.killedCalls > 0, 'the test must actually reach the dead endpoint');
        });
    }

    test('the fail-open replay runs with caching OFF, so every turn really calls', async () => {
        const base = await tinyReplayBase();
        const select = makeKillableSelector({ inner: async () => '[]', killAfterCalls: 0 });
        await replay({ ...base, select, config: { cache: false } });
        assert.equal(select.state.calls, base.chat.length,
            'a fail-open test that passes because it never made the request proves nothing');
    });

    test('a killable selector is alive until the kill count and dead after', async () => {
        const select = makeKillableSelector({ inner: async () => '[1]', killAfterCalls: 2 });
        assert.equal(await select('p'), '[1]');
        assert.equal(await select('p'), '[1]');
        await assert.rejects(() => select('p'));
        assert.equal(select.state.killedCalls, 1);
    });
});

describe('GATE 3 — coverage vs the keyword baseline', () => {
    test('the surrogate never sees the future: same prompt in, same ids out', async () => {
        const select = makeSurrogateLibrarian({ latencyMs: 0 });
        const prompt = '1 | manual | Vashka the Toll-Keeper | Vashka | ~9t | Guards the bridge toll.\n'
            + '2 | manual | Bridge of Coins | Bridge of Coins | ~9t | A stone bridge where tolls are paid.\n'
            + '[3] Narrator: The toll keeper counts coins on the stone bridge.';
        const a = await select(prompt);
        const b = await select(prompt);
        assert.deepEqual(JSON.parse(a), JSON.parse(b));
        assert.ok(Array.isArray(JSON.parse(a)));
    });

    test('the surrogate reaches an entry that is described but never named', async () => {
        const select = makeSurrogateLibrarian({ latencyMs: 0 });
        const prompt = '1 | manual | Vashka the Toll-Keeper | Vashka | ~9t | The toll keeper who guards the stone bridge.\n'
            + '2 | manual | Marsh Lantern | Marsh Lantern | ~9t | A lantern that burns underwater in the fens.\n'
            + '[3] Narrator: They approached the toll keeper waiting on the stone bridge.';
        const ids = JSON.parse(await select(prompt));
        assert.ok(ids.includes(1), 'a plain key scan for "Vashka" would miss this; the librarian must not');
        assert.ok(!ids.includes(2));
    });

    test('the surrogate honours maxEntries and only answers with catalog ids', async () => {
        const rows = Array.from({ length: 20 }, (_, i) =>
            `${i + 1} | manual | Entry ${i + 1} | Entry ${i + 1} | ~9t | coins bridge toll stone keeper`).join('\n');
        const select = makeSurrogateLibrarian({ latencyMs: 0, maxEntries: 3 });
        const ids = JSON.parse(await select(`${rows}\n[1] Narrator: coins bridge toll stone keeper`));
        assert.ok(ids.length <= 3);
        assert.ok(ids.every((u) => u >= 1 && u <= 20));
    });

    test('the librarian set is ADDITIVE — the keyword floor is never reduced', async () => {
        const base = await realReplayBase();
        const run = await replay({
            ...base,
            select: makeSurrogateLibrarian({ latencyMs: 0 }),
            now: () => 0,
        });
        for (const turn of run.turns) {
            for (const uid of turn.floor) {
                assert.ok(turn.effective.has(uid), `turn ${turn.t} lost keyword-activated entry ${uid}`);
            }
        }
    });

    test('coverage beats the keyword baseline on the real fixture', async () => {
        const base = await realReplayBase();
        const run = await replay({
            ...base,
            select: makeSurrogateLibrarian({ latencyMs: 0 }),
            now: () => 0,
        });
        const cov = checkCoverage({ turns: run.turns, scenes: base.scenes, gt: base.gt });
        assert.ok(cov.scenePoints > 0, 'there must be scene transitions to score');
        assert.ok(cov.librarian > cov.baseline, `librarian ${cov.librarian} <= baseline ${cov.baseline}`);
        assert.equal(cov.ok, true);
    });

    test('coverage FAILS when the librarian adds nothing over the floor', async () => {
        const base = await realReplayBase();
        // topUp off as well as an empty model answer: with the P7.3 name-scan
        // running, "the model selected nothing" does NOT mean "nothing was
        // added" (see the next test). This is the genuinely inert librarian.
        const run = await replay({ ...base, select: async () => '[]', config: { topUp: false }, now: () => 0 });
        assert.ok(run.turns.every((t) => t.injected.size === 0));
        const cov = checkCoverage({ turns: run.turns, scenes: base.scenes, gt: base.gt });
        assert.equal(cov.librarian, cov.baseline);
        assert.equal(cov.ok, false, 'an inert librarian must not be able to pass this gate');
    });

    test('the P7.3 top-up alone adds coverage, even when the model selects nothing', async () => {
        const base = await realReplayBase();
        const withTopUp = await replay({ ...base, select: async () => '[]', now: () => 0 });
        const without = await replay({ ...base, select: async () => '[]', config: { topUp: false }, now: () => 0 });
        const a = checkCoverage({ turns: withTopUp.turns, scenes: base.scenes, gt: base.gt });
        const b = checkCoverage({ turns: without.turns, scenes: base.scenes, gt: base.gt });
        assert.ok(a.librarian > b.librarian,
            'the mid-scene name scan is a second retrieval mechanism, not a rounding error');
        assert.ok(withTopUp.turns.some((t) => t.injected.size > 0 && t.source === 'cache'));
    });
});

describe('GATE 3b — token budget', () => {
    test('the budget is never exceeded across the full replay', async () => {
        const base = await realReplayBase();
        const run = await replay({
            ...base,
            select: makeSurrogateLibrarian({ latencyMs: 0 }),
            now: () => 0,
        });
        const budget = checkTokenBudget(run.turns);
        assert.equal(budget.offenders.length, 0);
        assert.ok(budget.maxUsed <= PHASE7_DEFAULTS.tokenBudget);
        assert.ok(budget.maxEntries <= PHASE7_DEFAULTS.maxEntries);
    });

    test('the budget check FAILS on an over-budget turn', () => {
        const over = [{ t: 4, usedTokens: 1501, budget: 1500, entryCount: 2 }];
        assert.equal(checkTokenBudget(over).ok, false);
        const tooMany = [{ t: 4, usedTokens: 10, budget: 1500, entryCount: 99 }];
        assert.equal(checkTokenBudget(tooMany).ok, false);
    });

    test('cached turns are budgeted too — the cache stores a selection, not a plan', async () => {
        const base = await realReplayBase();
        const run = await replay({
            ...base,
            select: makeSurrogateLibrarian({ latencyMs: 0 }),
            now: () => 0,
        });
        const cached = run.turns.filter((t) => t.source === 'cache');
        assert.ok(cached.length > 0);
        assert.ok(cached.every((t) => t.usedTokens <= PHASE7_DEFAULTS.tokenBudget));
    });
});

describe('GATE 4 — latency', () => {
    test('percentile picks a real sample and clamps at the ends', () => {
        assert.equal(percentile([5, 1, 3], 0.5), 3);
        assert.equal(percentile([5, 1, 3], 1), 5);
        assert.equal(percentile([5, 1, 3], 0), 1);
        assert.equal(percentile([], 0.5), 0);
    });

    test('the first cached turn is reported separately, not averaged into the percentiles', () => {
        const turns = [
            { t: 1, source: 'call', ms: 600 },
            { t: 2, source: 'cache', ms: 57 },   // V8 warm-up
            { t: 3, source: 'cache', ms: 3 },
            { t: 4, source: 'cache', ms: 4 },
        ];
        const lat = checkLatency(turns);
        assert.equal(lat.warmUpMs, 57);
        assert.equal(lat.cachedTurns, 2);
        assert.equal(lat.cachedMax, 4);
        assert.equal(lat.ok, true, '57ms of JIT warm-up must not fail a 50ms steady-state budget');
    });

    test('a genuinely slow cached turn still fails the gate', () => {
        const turns = [
            { t: 1, source: 'call', ms: 600 },
            { t: 2, source: 'cache', ms: 3 },
            { t: 3, source: 'cache', ms: 900 },
        ];
        assert.equal(checkLatency(turns).ok, false);
    });

    test('a slow call turn fails the scene-change budget', () => {
        assert.equal(checkLatency([{ t: 1, source: 'call', ms: 2500 }]).ok, false);
    });

    test('the scene cache removes the great majority of calls on the real fixture', async () => {
        const base = await realReplayBase();
        const run = await replay({
            ...base,
            select: makeSurrogateLibrarian({ latencyMs: 0 }),
            now: () => 0,
        });
        assert.ok(run.calls > 0, 'it must still call at scene boundaries');
        assert.ok(run.calls < run.turns.length * 0.25,
            `${run.calls} calls over ${run.turns.length} turns — the cache is not doing its job`);
    });
});
