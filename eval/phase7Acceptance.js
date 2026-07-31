// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// eval/phase7Acceptance.js — Phase 7 (Librarian) acceptance harness.
//
// Replays the Satire Isekai fixture through the REAL librarian modules
// (librarianCore + librarianCacheCore + catalogCore, imported unmodified from
// the extension root) and measures the four gates from the Phase 7 epic:
//
//   1. PARITY     librarian disabled => byte-identical prompt vs stock.
//   2. FAIL-OPEN  API killed mid-session => byte-identical prompt vs stock.
//   3. COVERAGE   entity coverage of the injected set beats the keyword-only
//                 baseline, scored against entities appearing in the NEXT
//                 scene, without exceeding the token budget.
//   4. LATENCY    <=2s added on scene-change turns, <=50ms on cached turns.
//
// Everything here is offline and deterministic by default: no network, no
// SillyTavern, no API keys. The one model-shaped dependency — "which entries
// does the librarian pick?" — is injected as a `select(prompt) => Promise<text>`
// function, so the same replay runs against the offline surrogate (default),
// against a killed API (fail-open), or against a real endpoint (`--live`).
//
// GROUND TRUTH
// ------------
// Scene boundaries use the fine-grained rules from eval/groundTruth.js
// (location change OR >90-min time jump; then merge scenes < 6 messages),
// per comment 083e4488 on PHA-1555 — the coarse 22-boundary key is not used
// anywhere in this harness. Two oracle sanity gates guard the answer keys:
//
//   - `oracleBoundaryGate` — an INDEPENDENT second implementation of the
//     boundary rules (this file, ~30 lines) scored through the same scorer any
//     detector would use. It must hit P=1.0 R=1.0 or the key is invalid.
//   - `oracleCoverageGate` — a librarian that is shown the next scene must
//     score coverage 1.0. It must, or the uid plumbing between the catalog,
//     the entry table and the scorer is broken and every coverage number in
//     the report is meaningless.
//
// Neither gate measures quality. They measure that the answer key and the
// scorer agree, which is exactly the class of bug that produced the phantom
// P=0.29 "regression" this project already paid for once.

import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseJsonlFile } from './parser.js';
import { deriveGroundTruth } from './groundTruth.js';
import { scoreBoundaries } from './score.js';

import {
    LIBRARIAN_DEFAULTS,
    buildLibrarianWindow,
    planLibrarianInjection,
    renderInjection,
    runLibrarianRetrieval,
    scanLikelyActiveUids,
    termAppearsIn,
} from '../librarianCore.js';
import { makeLibrarianCacheSeam } from '../librarianCacheCore.js';
import { buildCatalog, formatCatalogLines } from '../catalogCore.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** The 328-message Satire Isekai chat export. */
export const DEFAULT_FIXTURE = resolve(__dirname, 'fixtures/transcript.jsonl');

/** The 52-entry lorebook that fixture was written against. */
export const DEFAULT_WORLDBOOK = resolve(__dirname, 'fixtures/worldbook.json');

export const PHASE7_DEFAULTS = Object.freeze({
    // Ground-truth rules (PHA-1555 comment 083e4488).
    timeJumpMinutes: 90,
    minSceneMessages: 6,
    /** Boundary scorer tolerance, same as the Phase 0 detection eval. */
    tolerance: 1,

    // Librarian config under test. Deliberately the shipped defaults except
    // `enabled`, so the gate measures what users get.
    window: LIBRARIAN_DEFAULTS.window,
    truncateChars: LIBRARIAN_DEFAULTS.truncateChars,
    maxEntries: LIBRARIAN_DEFAULTS.maxEntries,
    tokenBudget: LIBRARIAN_DEFAULTS.tokenBudget,

    /** Terms shorter than this are too noisy to count as an entity mention. */
    minTermChars: 4,

    /** Simulated retrieval-call wall time, so the scene-change budget is real. */
    apiLatencyMs: 600,
    /** Epic gate: added wall time on a scene-change turn. */
    sceneLatencyBudgetMs: 2000,
    /** Epic gate: added wall time on a cached turn. */
    cachedLatencyBudgetMs: 50,
});

// ----------------------------------------------------------------------------
// Fixture loading
// ----------------------------------------------------------------------------

/**
 * Load the JSONL fixture as BOTH shapes the harness needs: the eval parser's
 * header-aware messages (for ground truth) and a SillyTavern-shaped chat array
 * (for the production window builder).
 *
 * chat[i] is message index i+1. That offset is the single most dangerous thing
 * in this file, so it is asserted in the test suite rather than commented.
 *
 * @param {string} [fixturePath]
 * @returns {Promise<{messages:object[], chat:object[], warnings:string[]}>}
 */
export async function loadFixture(fixturePath = DEFAULT_FIXTURE) {
    const { messages, warnings } = await parseJsonlFile(fixturePath);
    const chat = messages.map((m) => ({
        name: m.speaker,
        is_user: m.isUser === true,
        is_system: m.isSystem === true,
        mes: m.text,
    }));
    return { messages, chat, warnings: warnings || [] };
}

/**
 * Load the lorebook as the three views the librarian pipeline wants: the raw
 * `{entries:{uid:entry}}` blob catalogCore takes, the flat entry array
 * `scanLikelyActiveUids` takes, and a uid->entry map for `getEntry`.
 *
 * @param {string} [worldbookPath]
 * @returns {Promise<{lorebookData:object, entries:object[], byUid:Map<number,object>}>}
 */
export async function loadLorebook(worldbookPath = DEFAULT_WORLDBOOK) {
    const raw = JSON.parse(await readFile(worldbookPath, 'utf8'));
    const src = (raw && typeof raw.entries === 'object' && raw.entries !== null) ? raw.entries : {};

    const entries = [];
    const byUid = new Map();
    for (const [key, e] of Object.entries(src)) {
        if (!e || typeof e !== 'object') continue;
        const uid = Number(e.uid ?? key);
        if (!Number.isFinite(uid)) continue;
        const entry = { ...e, uid };
        entries.push(entry);
        byUid.set(uid, entry);
    }
    return { lorebookData: raw, entries, byUid };
}

// ----------------------------------------------------------------------------
// Scenes + the oracle gate on the boundary key
// ----------------------------------------------------------------------------

/**
 * INDEPENDENT re-implementation of the fine-grained boundary rules, written to
 * be scored like a detector rather than to produce a key.
 *
 * It is deliberately NOT a call into groundTruth.js. The whole point of an
 * oracle gate is that two implementations of the same rule, meeting through
 * the scorer, either agree exactly or tell you the key is wrong. Calling the
 * key's own code would make the gate tautological and worthless.
 *
 * @param {object[]} messages - parsed messages with `headers`
 * @param {{timeJumpMinutes?:number, minSceneMessages?:number}} [opts]
 * @returns {number[]} 1-based indices that begin a scene
 */
export function oracleBoundaries(messages, opts = {}) {
    const jump = opts.timeJumpMinutes ?? PHASE7_DEFAULTS.timeJumpMinutes;
    const minLen = opts.minSceneMessages ?? PHASE7_DEFAULTS.minSceneMessages;
    const list = Array.isArray(messages) ? messages : [];

    const toMinutes = (t) => {
        const m = String(t ?? '').match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
        if (!m) return null;
        let h = Number(m[1]);
        const ampm = m[3] ? m[3].toUpperCase() : null;
        if (ampm === 'PM' && h !== 12) h += 12;
        if (ampm === 'AM' && h === 12) h = 0;
        return h * 60 + Number(m[2]);
    };

    const raw = [];
    let prevLoc = null;
    let prevMin = null;
    for (const m of list) {
        const loc = m?.headers?.location;
        if (!loc) continue;                       // only header-bearing narrator turns vote
        const min = toMinutes(m?.headers?.time);
        if (prevLoc === null) {
            raw.push(m.index);                    // scene 1 begins at the first header
        } else {
            const moved = String(loc) !== String(prevLoc);
            const jumped = prevMin !== null && min !== null
                && ((min - prevMin + 1440) % 1440) > jump;
            if (moved || jumped) raw.push(m.index);
        }
        prevLoc = loc;
        if (min !== null) prevMin = min;
    }

    // Fine-grained merge, expressed as a running span rather than a scene list:
    // walk the raw boundaries carrying the length of the scene under
    // construction, and only accept a boundary once that scene has earned its
    // minimum. Then fold a short tail back, because nothing follows it to
    // trigger the same check. Same postcondition as groundTruth.js's
    // 'accumulate' mode, arrived at by different bookkeeping — which is the
    // only reason scoring one against the other proves anything.
    const last = list.length ? list[list.length - 1].index : 0;
    if (raw.length === 0) return [];

    const kept = [raw[0]];
    let spanStart = raw[0];
    for (let i = 1; i < raw.length; i++) {
        if (raw[i] - spanStart >= minLen) {
            kept.push(raw[i]);
            spanStart = raw[i];
        }
    }
    while (kept.length > 1 && last - kept[kept.length - 1] + 1 < minLen) kept.pop();
    return kept;
}

/**
 * Sanity gate #1: the oracle must score P=1.0 R=1.0 against the boundary key.
 *
 * @param {object[]} messages
 * @param {object} [opts]
 * @returns {{ok:boolean, score:object, key:number[], oracle:number[], raw:number[]}}
 */
export function oracleBoundaryGate(messages, opts = {}) {
    const gt = deriveGroundTruth(messages, {
        timeJumpMinutes: opts.timeJumpMinutes ?? PHASE7_DEFAULTS.timeJumpMinutes,
        minSceneMessages: opts.minSceneMessages ?? PHASE7_DEFAULTS.minSceneMessages,
    });
    const oracle = oracleBoundaries(messages, opts);
    const score = scoreBoundaries({
        predicted: oracle,
        groundTruth: gt.boundaries,
        tolerance: opts.tolerance ?? PHASE7_DEFAULTS.tolerance,
        messageCount: messages.length,
    });
    return {
        ok: score.precision === 1 && score.recall === 1,
        score,
        key: gt.boundaries,
        oracle,
        raw: gt.raw,
    };
}

/**
 * Turn a boundary list into scenes over 1-based message indices.
 *
 * @param {number[]} boundaries
 * @param {number} messageCount
 * @returns {Array<{i:number, start:number, end:number, length:number}>}
 */
export function buildScenes(boundaries, messageCount) {
    const bs = [...new Set((boundaries || []).map(Number))].filter(Number.isFinite).sort((a, b) => a - b);
    if (bs.length === 0) return messageCount > 0 ? [{ i: 0, start: 1, end: messageCount, length: messageCount }] : [];
    const scenes = [];
    for (let i = 0; i < bs.length; i++) {
        // The first boundary sits on the first HEADER-bearing message, which is
        // not always message 1 — the transcript can open with a couple of
        // header-less turns. Those messages are still story, and the entities
        // in them still belong to the opening scene, so scene 0 is stretched
        // back to 1. Leaving them outside every scene would silently drop them
        // from the key.
        const start = i === 0 ? 1 : bs[i];
        const end = i + 1 < bs.length ? bs[i + 1] - 1 : messageCount;
        scenes.push({ i, start, end, length: end - start + 1 });
    }
    return scenes;
}

// ----------------------------------------------------------------------------
// Retrieval ground truth: "entries for entities appearing in the NEXT scene"
// ----------------------------------------------------------------------------

/**
 * Every surface form that counts as "this entry's entity was mentioned":
 * the catalog's extracted names, the entry title, and the entry's own keys.
 *
 * Including the keys is what makes the comparison fair rather than rigged:
 * the GT is a superset of what a keyword scan of the future scene would find,
 * so the baseline is never penalised for a term the key does not know about.
 *
 * @param {object} entry
 * @param {object|null} row - catalog row for the same uid
 * @param {number} [minChars]
 * @returns {string[]}
 */
export function entryTerms(entry, row, minChars = PHASE7_DEFAULTS.minTermChars) {
    const out = new Set();
    const push = (t) => {
        const s = String(t ?? '').trim();
        if (s.length >= minChars) out.add(s.toLowerCase());
    };
    for (const k of Array.isArray(entry?.key) ? entry.key : []) push(k);
    for (const k of Array.isArray(entry?.keysecondary) ? entry.keysecondary : []) push(k);
    for (const n of Array.isArray(row?.n) ? row.n : []) push(n);
    if (row?.title) push(row.title);
    if (entry?.comment) push(entry.comment);
    return [...out];
}

/**
 * The answer key: for each scene, the uids whose entity terms literally occur
 * in that scene's text.
 *
 * Uses `termAppearsIn` — the SAME matcher the keyword floor and the top-up
 * scan use — so "the key says this entity is present" and "SillyTavern would
 * have matched this key" are one rule read twice, not two rules that can drift.
 *
 * @param {{scenes:Array, messages:object[], entries:object[], rows:object[], minTermChars?:number}} p
 * @returns {{bySceneIndex:Map<number,Set<number>>, byMessageIndex:Map<number,Set<number>>, terms:Map<number,string[]>, excluded:Array<{uid:number, why:string}>}}
 */
export function buildRetrievalGroundTruth({ scenes, messages, entries, rows, minTermChars } = {}) {
    const rowByUid = new Map((rows || []).map((r) => [Number(r.uid), r]));

    // The key may only demand entries that CAN be injected. An entry that is
    // disabled, empty, or absent from the catalog is unreachable for the
    // librarian AND for keyword activation, so listing it as a coverage target
    // would just cap every score below 1.0 for reasons no selector can fix —
    // and would make the oracle gate unpassable for a harness bug it does not
    // have. Exclusions are reported, not silent.
    const terms = new Map();
    const excluded = [];
    for (const e of entries || []) {
        const uid = Number(e.uid);
        const row = rowByUid.get(uid) || null;
        const why = e.disable === true ? 'disabled'
            : !String(e.content ?? '').trim() ? 'empty'
                : !row ? 'not-in-catalog'
                    : row.off === true ? 'catalog-off'
                        : null;
        if (why) { excluded.push({ uid, why }); continue; }
        terms.set(uid, entryTerms(e, row, minTermChars));
    }

    const textOf = (msg) => String(msg?.text ?? '').toLowerCase();
    const byMessage = new Map();
    for (const m of messages || []) {
        const hay = textOf(m);
        const hits = new Set();
        if (hay) {
            for (const [uid, ts] of terms) {
                for (const t of ts) {
                    if (termAppearsIn(hay, t)) { hits.add(uid); break; }
                }
            }
        }
        byMessage.set(m.index, hits);
    }

    const byScene = new Map();
    for (const s of scenes || []) {
        const hits = new Set();
        for (let idx = s.start; idx <= s.end; idx++) {
            for (const uid of byMessage.get(idx) || []) hits.add(uid);
        }
        byScene.set(s.i, hits);
    }

    return { bySceneIndex: byScene, byMessageIndex: byMessage, terms, excluded };
}

/**
 * Recall of a ground-truth set by an injected set. Recall, not F1: the epic
 * says "entity-coverage", and precision is already bounded in code by
 * maxEntries and tokenBudget, which the budget gate checks separately.
 *
 * @param {Iterable<number>} got
 * @param {Iterable<number>} want
 * @returns {{hit:number, total:number, coverage:number, missed:number[]}}
 */
export function scoreCoverage(got, want) {
    const have = got instanceof Set ? got : new Set(got || []);
    const need = want instanceof Set ? want : new Set(want || []);
    const missed = [];
    let hit = 0;
    for (const uid of need) {
        if (have.has(uid)) hit++;
        else missed.push(uid);
    }
    return { hit, total: need.size, coverage: need.size === 0 ? 1 : hit / need.size, missed };
}

// ----------------------------------------------------------------------------
// Selectors — the injected `select(prompt) => Promise<text>`
// ----------------------------------------------------------------------------

const sleep = (ms) => (ms > 0 ? new Promise((r) => setTimeout(r, ms)) : Promise.resolve());

/** Pull the catalog ids out of a prompt built by buildLibrarianPrompt. */
function catalogIdsFromPrompt(prompt) {
    const ids = [];
    for (const line of String(prompt ?? '').split('\n')) {
        const m = line.match(/^(\d+)\s\|\s/);
        if (m) ids.push(Number(m[1]));
    }
    return ids;
}

/** Pull the window block (everything after the last catalog line) out of a prompt. */
function windowTextFromPrompt(prompt) {
    const lines = String(prompt ?? '').split('\n');
    let lastCatalog = -1;
    for (let i = 0; i < lines.length; i++) if (/^\d+\s\|\s/.test(lines[i])) lastCatalog = i;
    return lines.slice(lastCatalog + 1).join('\n');
}

const WORD_RE = /[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu;
const STOP = new Set(['the', 'and', 'that', 'with', 'from', 'this', 'they', 'them', 'their', 'have',
    'been', 'were', 'what', 'when', 'where', 'which', 'would', 'could', 'should', 'about', 'into',
    'over', 'than', 'then', 'there', 'here', 'your', 'you', 'his', 'her', 'she', 'him', 'for',
    'was', 'are', 'not', 'but', 'all', 'one', 'out', 'who', 'has', 'had', 'its', 'like', 'just',
    'only', 'more', 'most', 'some', 'very', 'still', 'even', 'back', 'down']);

function contentWords(text, minChars = 4) {
    const out = new Set();
    for (const w of String(text ?? '').toLowerCase().matchAll(WORD_RE)) {
        const s = w[0];
        if (s.length >= minChars && !STOP.has(s)) out.add(s);
    }
    return out;
}

/**
 * The offline surrogate librarian.
 *
 * It is NOT an oracle: it sees exactly what the real call sees — the catalog
 * lines and the window text, both handed to it inside the prompt string — and
 * nothing about the future. What it models is the ONE capability the epic
 * claims a reasoning retriever has over `key.includes()`:
 *
 *   - soft lexical match (a row scores on shared content words with the
 *     window, so "the innkeeper" reaches an entry whose summary says
 *     innkeeper even though "Gorm Tallow" was never typed);
 *   - one hop of association (a row that shares an entity name with an
 *     already-matched row inherits part of its score — travelling toward a
 *     place, an unresolved thread the scene is circling);
 *   - the prompt's own instruction to prefer what a keyword search misses
 *     (rows whose full name is literally present are demoted, not boosted,
 *     because ST is already going to inject those).
 *
 * Deterministic, so the committed evidence is reproducible. It is a surrogate,
 * and the report labels it one — the live number comes from `makeLiveSelector`.
 *
 * @param {{latencyMs?:number, maxEntries?:number, onCall?:function}} [opts]
 * @returns {(prompt:string) => Promise<string>}
 */
export function makeSurrogateLibrarian(opts = {}) {
    const latency = Number.isFinite(opts.latencyMs) ? opts.latencyMs : PHASE7_DEFAULTS.apiLatencyMs;
    const maxEntries = Number.isFinite(opts.maxEntries) ? opts.maxEntries : PHASE7_DEFAULTS.maxEntries;

    return async function surrogateSelect(prompt) {
        if (typeof opts.onCall === 'function') opts.onCall(prompt);
        await sleep(latency);

        const text = String(prompt ?? '');
        const windowText = windowTextFromPrompt(text);
        const windowWords = contentWords(windowText);
        const windowLower = windowText.toLowerCase();

        // Re-read the catalog lines the prompt carries: "uid | kind | title | names | ~Nt | summary".
        const rows = [];
        for (const line of text.split('\n')) {
            const m = line.match(/^(\d+)\s\|\s([^|]*)\|\s([^|]*)\|\s([^|]*)\|\s*~?(\d+)t\s*\|\s?(.*)$/);
            if (!m) continue;
            const names = m[4].split(',').map((s) => s.trim()).filter(Boolean);
            rows.push({
                uid: Number(m[1]),
                title: m[3].trim(),
                names,
                summary: m[6],
                words: contentWords(`${m[3]} ${m[4]} ${m[6]}`),
                literal: names.some((n) => n.length >= 4 && termAppearsIn(windowLower, n)),
            });
        }
        if (rows.length === 0) return '[]';

        const base = new Map();
        for (const r of rows) {
            let overlap = 0;
            for (const w of r.words) if (windowWords.has(w)) overlap++;
            // Normalised so a long summary is not rewarded for being long.
            base.set(r.uid, overlap / Math.sqrt(Math.max(1, r.words.size)));
        }

        // One association hop: rows sharing an entity name with a strongly
        // matched row pick up a fraction of its score.
        const byName = new Map();
        for (const r of rows) {
            for (const n of r.names) {
                const k = n.toLowerCase();
                if (k.length < 4) continue;
                if (!byName.has(k)) byName.set(k, []);
                byName.get(k).push(r.uid);
            }
        }
        const score = new Map(base);
        for (const r of rows) {
            const seed = base.get(r.uid) || 0;
            if (seed <= 0) continue;
            for (const n of r.names) {
                for (const uid of byName.get(n.toLowerCase()) || []) {
                    if (uid === r.uid) continue;
                    score.set(uid, (score.get(uid) || 0) + seed * 0.35);
                }
            }
        }
        // Demote what keyword activation already covers — the prompt asks for
        // what a plain keyword search would MISS.
        for (const r of rows) if (r.literal) score.set(r.uid, (score.get(r.uid) || 0) * 0.25);

        const picked = rows
            .map((r) => ({ uid: r.uid, s: score.get(r.uid) || 0 }))
            .filter((x) => x.s > 0)
            .sort((a, b) => (b.s - a.s) || (a.uid - b.uid))
            .slice(0, maxEntries)
            .map((x) => x.uid);

        return JSON.stringify(picked);
    };
}

/**
 * The oracle librarian for sanity gate #2: it is told the answer.
 *
 * Only ever used to prove the key and the scorer agree. If this scores below
 * 1.0 with the caps lifted, the harness is broken, not the librarian.
 *
 * @param {{answerFor:(prompt:string)=>number[], latencyMs?:number}} p
 * @returns {(prompt:string) => Promise<string>}
 */
export function makeOracleLibrarian({ answerFor, latencyMs = 0 } = {}) {
    return async function oracleSelect(prompt) {
        await sleep(latencyMs);
        const known = new Set(catalogIdsFromPrompt(prompt));
        const want = (typeof answerFor === 'function' ? answerFor(prompt) : []) || [];
        return JSON.stringify(want.map(Number).filter((u) => known.has(u)));
    };
}

/**
 * A selector that is alive until `killAfter` calls and dead forever after.
 *
 * `mode: 'throw'` is a hard API error; `'timeout'` is the hang that trips the
 * production abort; `'garbage'` is the model answering with prose. All three
 * are the fail-open gate's job to survive.
 *
 * @param {{inner:function, killAfterCalls?:number, mode?:'throw'|'timeout'|'garbage', timeoutMs?:number}} p
 */
export function makeKillableSelector({ inner, killAfterCalls = 0, mode = 'throw', timeoutMs = 50 } = {}) {
    let calls = 0;
    const state = { calls: 0, killedCalls: 0 };
    const fn = async function killableSelect(prompt) {
        calls++;
        state.calls = calls;
        if (calls > killAfterCalls) {
            state.killedCalls++;
            if (mode === 'garbage') return 'I am terribly sorry, but I cannot comply with that request.';
            if (mode === 'timeout') { await sleep(timeoutMs); throw new Error('librarian call timed out'); }
            throw new Error('ECONNREFUSED: librarian endpoint is dead');
        }
        return inner(prompt);
    };
    fn.state = state;
    return fn;
}

/**
 * Live selector against an OpenAI-compatible /chat/completions endpoint
 * (the same shape eval/detect.js's OpenAIDetector and the claude-cli shim use).
 *
 * Not exercised by the default offline run; `--live` wires it in so the same
 * replay can produce a real-model number without a second harness.
 *
 * @param {{baseUrl:string, apiKey?:string, model:string, timeoutMs?:number, onCall?:function}} p
 * @returns {(prompt:string) => Promise<string>}
 */
export function makeLiveSelector({ baseUrl, apiKey, model, timeoutMs = 30000, onCall } = {}) {
    const url = `${String(baseUrl).replace(/\/+$/, '')}/chat/completions`;
    return async function liveSelect(prompt) {
        if (typeof onCall === 'function') onCall(prompt);
        const ac = new AbortController();
        const timer = setTimeout(() => ac.abort(), timeoutMs);
        try {
            const resp = await fetch(url, {
                method: 'POST',
                signal: ac.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
                },
                body: JSON.stringify({
                    model,
                    temperature: 0,
                    messages: [{ role: 'user', content: prompt }],
                }),
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
            const json = await resp.json();
            return String(json?.choices?.[0]?.message?.content ?? '');
        } finally {
            clearTimeout(timer);
        }
    };
}

// ----------------------------------------------------------------------------
// The replay
// ----------------------------------------------------------------------------

/**
 * The stock prompt fragment for a turn: the world-info text SillyTavern would
 * inject with no librarian at all.
 *
 * This is the parity yardstick. It is built from the keyword floor only, in
 * uid order, through the SAME renderer the librarian's own injection uses —
 * so "byte-identical" is a claim about the actual injected bytes, not about
 * two different formatters happening to agree.
 *
 * @param {Set<number>} floor
 * @param {Map<number,object>} byUid
 * @returns {string}
 */
export function renderStockInjection(floor, byUid) {
    const included = [...floor]
        .sort((a, b) => a - b)
        .map((uid) => byUid.get(uid))
        .filter((e) => e && e.disable !== true && String(e.content ?? '').trim())
        .map((e) => ({ content: String(e.content).trim() }));
    return renderInjection(included);
}

const sha256 = (s) => createHash('sha256').update(String(s), 'utf8').digest('hex');

/**
 * Replay the whole fixture through the real librarian cycle.
 *
 * One "turn" = the moment after message `t` arrives and before the narrator
 * replies. chat[0..t-1] is what the librarian may see; message t+1 onward is
 * the future it is being scored on and must never touch.
 *
 * @param {{
 *   chat:object[], messages:object[], entries:object[], byUid:Map<number,object>,
 *   catalog:object, scenes:Array, boundaries:number[],
 *   select:function, config?:object, cache?:boolean,
 *   now?:()=>number, onTurn?:function,
 * }} p
 * @returns {Promise<{turns:object[], calls:number, cache:object}>}
 */
export async function replay(p) {
    const {
        chat, entries, byUid, catalog, boundaries,
        select, config = {}, now = () => performance.now(),
    } = p;

    const cfg = {
        ...LIBRARIAN_DEFAULTS,
        enabled: true,
        window: PHASE7_DEFAULTS.window,
        truncateChars: PHASE7_DEFAULTS.truncateChars,
        maxEntries: PHASE7_DEFAULTS.maxEntries,
        tokenBudget: PHASE7_DEFAULTS.tokenBudget,
        ...config,
    };

    const rows = Array.isArray(catalog?.rows) ? catalog.rows : [];
    const rowByUid = new Map(rows.map((r) => [Number(r.uid), r]));
    const catalogLines = formatCatalogLines(catalog);

    // The sentinel's watermark, replayed: it advances to a boundary index the
    // moment that boundary's message has arrived. This is the same single fact
    // P7.3 keys the cache on — "the sentinel declared a boundary".
    const sorted = [...boundaries].sort((a, b) => a - b);
    const watermarkAt = (msgIndex) => {
        let wm = -1;
        for (const b of sorted) { if (b <= msgIndex) wm = b; else break; }
        return wm;
    };

    let cacheRecord = null;
    let watermark = -1;
    const seam = cfg.cache === false ? null : makeLibrarianCacheSeam({
        cfg,
        readCache: () => cacheRecord,
        writeCache: (r) => { cacheRecord = r; },
        getWatermark: () => watermark,
        getCatalogBuiltAt: () => Number(catalog?.builtAt) || 0,
        getRows: () => rows,
        now: () => 0,
    });

    const turns = [];
    let calls = 0;

    for (let t = 1; t <= chat.length; t++) {
        watermark = watermarkAt(t);
        // `turnRef` is how the oracle selector learns which turn it is on. No
        // other selector may read it: everything else must live off the prompt.
        if (p.turnRef) p.turnRef.t = t;
        const view = chat.slice(0, t);

        const window = buildLibrarianWindow(view, cfg);
        const floor = scanLikelyActiveUids(entries, window.text);

        const t0 = now();
        const record = await runLibrarianRetrieval({
            config: cfg,
            getChat: () => view,
            getCatalogLines: () => ({ lines: catalogLines, rows: catalogLines.length }),
            getEntries: () => entries,
            getRow: (uid) => rowByUid.get(Number(uid)) || null,
            select,
            now,
            ...(seam ? { getCachedIds: seam.getCachedIds, onSelected: seam.onSelected } : {}),
        });
        const ms = now() - t0;
        if (record.source === 'call') calls++;

        const injected = new Set(record.included.map((e) => Number(e.uid)));
        const stockText = renderStockInjection(floor, byUid);
        const addedText = renderInjection(record.included);

        turns.push({
            t,
            isBoundaryTurn: sorted.includes(t + 1),   // the turn whose reply opens the next scene
            source: record.source ?? 'call',
            action: record.action,
            cacheReason: record.cacheReason ?? null,
            ms,
            reportedMs: record.ms,
            floor,
            injected,
            effective: new Set([...floor, ...injected]),
            usedTokens: record.usedTokens || 0,
            budget: record.budget ?? cfg.tokenBudget,
            entryCount: record.included.length,
            stockHash: sha256(stockText),
            effectiveHash: sha256(addedText ? `${stockText}\n${addedText}` : stockText),
            addedBytes: Buffer.byteLength(addedText, 'utf8'),
        });

        if (typeof p.onTurn === 'function') p.onTurn(turns[turns.length - 1], record);
    }

    return { turns, calls, cache: cacheRecord };
}

// ----------------------------------------------------------------------------
// Gates
// ----------------------------------------------------------------------------

/**
 * Gate 1 / Gate 2 shared check: every turn's injected text must be empty and
 * the prompt must hash identically to stock.
 *
 * @param {object[]} turns
 * @returns {{ok:boolean, turns:number, offenders:object[]}}
 */
export function checkByteParity(turns) {
    const offenders = [];
    for (const turn of turns || []) {
        if (turn.addedBytes !== 0 || turn.effectiveHash !== turn.stockHash) {
            offenders.push({ t: turn.t, action: turn.action, addedBytes: turn.addedBytes });
        }
    }
    return { ok: offenders.length === 0, turns: (turns || []).length, offenders };
}

/**
 * Gate 3a: the token budget is never exceeded, on any turn, cached or not.
 *
 * @param {object[]} turns
 * @returns {{ok:boolean, maxUsed:number, budget:number, maxEntries:number, offenders:object[]}}
 */
export function checkTokenBudget(turns, maxEntriesCap = PHASE7_DEFAULTS.maxEntries) {
    const offenders = [];
    let maxUsed = 0;
    let budget = 0;
    let maxEntries = 0;
    for (const turn of turns || []) {
        maxUsed = Math.max(maxUsed, turn.usedTokens);
        maxEntries = Math.max(maxEntries, turn.entryCount);
        budget = turn.budget ?? budget;
        if (turn.usedTokens > (turn.budget ?? Infinity) || turn.entryCount > maxEntriesCap) {
            offenders.push({ t: turn.t, usedTokens: turn.usedTokens, entries: turn.entryCount });
        }
    }
    return { ok: offenders.length === 0, maxUsed, budget, maxEntries, offenders };
}

/**
 * Gate 3b: coverage of the NEXT scene's entities, librarian vs keyword floor.
 *
 * Scored at scene-transition turns — the turn whose reply opens scene k+1 —
 * because that is where the epic's question ("entries for entities appearing
 * in the NEXT scene") is actually asked. `perTurn` additionally scores every
 * turn against the next MESSAGE, which is the everyday case and the one that
 * shows what caching costs between boundaries.
 *
 * @param {{turns:object[], scenes:Array, gt:object}} p
 * @returns {object}
 */
export function checkCoverage({ turns, scenes, gt } = {}) {
    const sceneStartingAt = new Map();
    for (const s of scenes || []) sceneStartingAt.set(s.start, s);

    const atScene = { baselineHit: 0, librarianHit: 0, total: 0, points: [] };
    for (const turn of turns || []) {
        const scene = sceneStartingAt.get(turn.t + 1);
        if (!scene) continue;
        const want = gt.bySceneIndex.get(scene.i) || new Set();
        if (want.size === 0) continue;
        const base = scoreCoverage(turn.floor, want);
        const lib = scoreCoverage(turn.effective, want);
        atScene.baselineHit += base.hit;
        atScene.librarianHit += lib.hit;
        atScene.total += want.size;
        atScene.points.push({
            t: turn.t, scene: scene.i, want: want.size,
            baseline: base.hit, librarian: lib.hit,
            gained: lib.hit - base.hit, source: turn.source,
        });
    }

    const perTurn = { baselineHit: 0, librarianHit: 0, total: 0 };
    for (const turn of turns || []) {
        const want = gt.byMessageIndex.get(turn.t + 1);
        if (!want || want.size === 0) continue;
        perTurn.baselineHit += scoreCoverage(turn.floor, want).hit;
        perTurn.librarianHit += scoreCoverage(turn.effective, want).hit;
        perTurn.total += want.size;
    }

    const ratio = (h, tt) => (tt === 0 ? 0 : h / tt);
    const baseline = ratio(atScene.baselineHit, atScene.total);
    const librarian = ratio(atScene.librarianHit, atScene.total);
    return {
        ok: librarian > baseline,
        scenePoints: atScene.points.length,
        baseline,
        librarian,
        delta: librarian - baseline,
        entities: atScene.total,
        perTurn: {
            baseline: ratio(perTurn.baselineHit, perTurn.total),
            librarian: ratio(perTurn.librarianHit, perTurn.total),
            entities: perTurn.total,
        },
        points: atScene.points,
    };
}

/**
 * Percentile of a sorted-on-the-fly sample list.
 *
 * @param {number[]} xs
 * @param {number} q - 0..1
 */
export function percentile(xs, q) {
    const a = [...xs].sort((x, y) => x - y);
    if (a.length === 0) return 0;
    const i = Math.min(a.length - 1, Math.max(0, Math.ceil(q * a.length) - 1));
    return a[i];
}

/**
 * Gate 4: latency. Call turns vs cached turns, measured separately.
 *
 * The FIRST cached turn in a fresh V8 is reported on its own line and excluded
 * from the cached percentiles. It is JIT warm-up, not the steady state, and
 * averaging it in would either hide a real regression or manufacture a fake
 * one — P7.3 measured 57ms of warm-up against a 3ms steady state.
 *
 * @param {object[]} turns
 * @param {{sceneBudgetMs?:number, cachedBudgetMs?:number}} [opts]
 */
export function checkLatency(turns, opts = {}) {
    const sceneBudget = opts.sceneBudgetMs ?? PHASE7_DEFAULTS.sceneLatencyBudgetMs;
    const cachedBudget = opts.cachedBudgetMs ?? PHASE7_DEFAULTS.cachedLatencyBudgetMs;

    const callMs = [];
    const cachedMs = [];
    let warmUpMs = null;
    for (const turn of turns || []) {
        if (turn.source === 'call') { callMs.push(turn.ms); continue; }
        if (warmUpMs === null) { warmUpMs = turn.ms; continue; }
        cachedMs.push(turn.ms);
    }

    const callMax = callMs.length ? Math.max(...callMs) : 0;
    const cachedMax = cachedMs.length ? Math.max(...cachedMs) : 0;
    const offenders = (turns || [])
        .filter((x) => (x.source === 'call' ? x.ms > sceneBudget : false))
        .map((x) => ({ t: x.t, ms: x.ms, source: x.source }));
    const cachedOffenders = cachedMs.length
        ? (turns || []).filter((x, i) => x.source !== 'call' && i > 0 && x.ms > cachedBudget)
            .slice(1)  // the excluded warm-up turn
            .map((x) => ({ t: x.t, ms: x.ms, source: x.source }))
        : [];

    return {
        ok: callMax <= sceneBudget && cachedMax <= cachedBudget,
        callTurns: callMs.length,
        cachedTurns: cachedMs.length,
        callP50: percentile(callMs, 0.5),
        callP95: percentile(callMs, 0.95),
        callMax,
        cachedP50: percentile(cachedMs, 0.5),
        cachedP95: percentile(cachedMs, 0.95),
        cachedMax,
        warmUpMs,
        sceneBudget,
        cachedBudget,
        offenders: [...offenders, ...cachedOffenders],
    };
}

/**
 * Sanity gate #2: an oracle librarian, shown the next scene and run with the
 * caps lifted, must cover the key perfectly.
 *
 * The caps are lifted on purpose. maxEntries and tokenBudget are real product
 * limits and they bound what ANY selector can cover; folding them into the
 * key-validity gate would mean a budget change silently invalidates the key.
 * The capped oracle number is reported separately as the harness ceiling.
 *
 * @param {object} p - same shape replay() takes, minus `select`
 * @returns {Promise<{ok:boolean, uncapped:number, capped:number, points:number}>}
 */
export async function oracleCoverageGate(p) {
    const { scenes, gt } = p;
    const sceneStartingAt = new Map(scenes.map((s) => [s.start, s]));

    // The oracle answers per TURN, so it needs to know which turn it is on. The
    // prompt does not carry that, so the driver publishes it on `turnRef` —
    // the single, explicit place the harness is allowed to know the future.
    const turnRef = { t: 0 };
    const answerFor = () => {
        const scene = sceneStartingAt.get(turnRef.t + 1);
        if (!scene) return [];
        return [...(gt.bySceneIndex.get(scene.i) || [])];
    };

    const runOracle = (config) => replay({
        ...p,
        turnRef,
        select: makeOracleLibrarian({ answerFor }),
        config,
        now: () => 0,
    });

    // Uncapped: the key-validity gate. Capped: the practical ceiling the
    // shipped maxEntries/tokenBudget impose on any selector.
    const uncapped = await runOracle({
        cache: false, skipLikelyActive: false, maxEntries: 1000, tokenBudget: 10_000_000,
    });
    const capped = await runOracle({ cache: false });

    const u = checkCoverage({ turns: uncapped.turns, scenes, gt });
    const c = checkCoverage({ turns: capped.turns, scenes, gt });
    return {
        // A run with zero scoreable transitions is a broken harness, not a
        // perfect score — `scenePoints > 0` is half the gate.
        ok: u.scenePoints > 0 && u.librarian === 1,
        uncapped: u.librarian,
        capped: c.librarian,
        points: u.scenePoints,
        misses: u.points.filter((x) => x.librarian < x.want).slice(0, 5),
    };
}

/**
 * Build the catalog the replay uses, from the fixture lorebook.
 *
 * @param {object} lorebookData
 * @param {object} [opts]
 */
export function buildFixtureCatalog(lorebookData, opts = {}) {
    return buildCatalog(lorebookData, {
        lorebookName: opts.lorebookName ?? 'Magisa — satire fantasy isekai world',
        now: opts.now ?? 1_000_000,       // fixed, so the catalog fingerprint is reproducible
        reason: 'phase7-acceptance',
    });
}
