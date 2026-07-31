// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// STMB-Auto fork — Librarian scene-aware cache, pure logic (Phase 7, task P7.3).
// Plan: PHA-1636 ("retrieval refreshes when the sentinel declares a scene
// boundary; cached otherwise — the cost-collapse mechanism TV cannot replicate").
//
// ---------------------------------------------------------------------------
// Why a scene is the right cache unit
// ---------------------------------------------------------------------------
// P7.2 shipped one retrieval call per non-quiet generation. That is correct and
// it is also the entire latency and cost story of the librarian: an eight-turn
// scene pays eight calls to answer the same question eight times, because the
// answer to "what lore does this scene need" does not change turn to turn — it
// changes when the SCENE changes.
//
// The fork already knows when a scene changes: that is the sentinel's whole
// job. So the cache key is the scene, and the invalidation signal is the
// sentinel's boundary landing. One call per scene, not one per turn.
//
// This is the piece a general retrieval bolt-on cannot copy. Without a scene
// detector you have no principled invalidation point, so you either re-retrieve
// every turn (the cost you were trying to avoid) or cache on a timer/turn count
// and go stale across the exact transitions that matter most.
//
// ---------------------------------------------------------------------------
// What is cached — and what deliberately is not
// ---------------------------------------------------------------------------
// CACHED: the SELECTION. A list of catalog uids, in the model's priority order.
//
// NOT CACHED: the injection. Every turn — cached or not — re-runs the keyword
// floor scan, the kind filter, the entry cap and the token budget against the
// CURRENT window (librarianCore.planLibrarianInjection). Two consequences, both
// load-bearing:
//
//   * additive-only stays true as keywords come and go. An entry that ST will
//     now activate by keyword gets dropped as `already-active` on a cached turn
//     just as it would on a fresh one; the librarian never pays budget for it
//     and never doubles it up.
//   * a cached plan can never outlive the state it was planned against. The
//     expensive thing (the LLM call) is what we skip; the cheap thing (deciding
//     what that answer means right now) is redone every single turn.
//
// ---------------------------------------------------------------------------
// The two invalidation signals
// ---------------------------------------------------------------------------
// 1. THE WATERMARK (`wm`). `getHighestMemoryProcessed()` — the highest chat index
//    covered by a memory. It advances exactly when a scene has been detected AND
//    memorized, whether by the sentinel or by a manual `/scenememory`. This is
//    the boundary event, observed at its committed form rather than as a
//    fire-and-forget notification the librarian could miss while it was asleep.
//
// 2. THE CATALOG BUILD STAMP (`cat`). Committing a scene memory writes a lorebook
//    entry, which refreshes the catalog (catalog.js noteCatalogEntryWrite). So a
//    new memory moves this too — and it ALSO moves when the user edits lore by
//    hand, which the watermark would not catch.
//
// Two independent signals for the same event is not redundancy for its own sake:
// signal 1 is the semantic one and signal 2 is the one that survives a memory
// being written by a path the sentinel did not drive.
//
// Plus three guards that are about correctness rather than scenes: a config
// fingerprint (`cfg`), a rewind check (the user deleted or edited history), and
// a turn-count safety valve (`cacheMaxTurns`) so a scene that never ends cannot
// pin a selection forever.
//
// ---------------------------------------------------------------------------
// The mid-scene top-up
// ---------------------------------------------------------------------------
// A cache that only refreshes on boundaries has one real failure mode: someone
// walks into the middle of a scene. `planLibrarianTopUp` handles it WITHOUT a
// model call — a literal name scan of only the messages that arrived since the
// last scan, against the catalog's own entity names, using the same matcher as
// the keyword floor.
//
// That shared matcher is what makes the top-up worth its budget. If the new name
// is also a lorebook key, ST activates the entry itself and the plan drops the
// top-up as `already-active`. So what survives is precisely the useful set: an
// entry whose catalog name was spoken but whose keys do not cover it.
//
// Dependency-injected and SillyTavern-free, like every other phase core. The
// runtime binding (chat_metadata reads/writes, the watermark) lives in
// librarian.js.

import {
    LIBRARIAN_VERSION,
    LIBRARIAN_DEFAULTS,
    termAppearsIn,
} from './librarianCore.js';
import { formatDetectionWindow } from './sentinelCore.js';

/** Where the cache record lives: `chat_metadata.stmbc.librarianCache`. */
export const LIBRARIAN_CACHE_KEY = 'librarianCache';

/**
 * Shape version of the cache RECORD, independent of LIBRARIAN_VERSION (which
 * versions the meaning of a selection). Bump either and stored records are
 * discarded rather than misread.
 */
export const LIBRARIAN_CACHE_VERSION = 1;

/**
 * A catalog name shorter than this is not scanned for. Real lorebooks carry
 * names like "Yl" and "Ka", and at one or two characters a literal scan matches
 * inside ordinary words often enough to be noise rather than signal. The model
 * still selects those entries on a scene-change turn; they are only excluded
 * from the mechanical top-up.
 */
export const MIN_TOPUP_NAME_CHARS = 3;

/** Why a turn did or did not reuse the stored selection. Reported in the record. */
export const CACHE_STATUS = Object.freeze({
    HIT: 'hit',
    MISS_DISABLED: 'miss:cache-disabled',
    MISS_NONE: 'miss:no-cache',
    MISS_VERSION: 'miss:version',
    MISS_CONFIG: 'miss:config-changed',
    MISS_SCENE: 'miss:scene-boundary',
    MISS_CATALOG: 'miss:catalog-rebuilt',
    MISS_REWIND: 'miss:rewind',
    MISS_AGE: 'miss:max-turns',
});

/** The statuses that mean "a scene boundary happened". Used by the gate/eval. */
export const BOUNDARY_STATUSES = Object.freeze(
    new Set([CACHE_STATUS.MISS_SCENE, CACHE_STATUS.MISS_CATALOG]),
);

// ---------------------------------------------------------------- fingerprint

/**
 * The config fields that change WHAT a selection would be. Placement fields
 * (`depth`, `role`), transport fields (`timeoutMs`, `profileIndex`) and
 * bookkeeping (`debug`) are excluded on purpose: they change how a selection is
 * delivered or logged, not which entries the model would pick, so changing one
 * must not throw away a valid scene cache.
 */
const SELECTION_FIELDS = Object.freeze([
    'window', 'truncateChars', 'maxEntries', 'tokenBudget', 'skipLikelyActive', 'kinds', 'prompt',
]);

/**
 * Stable FNV-1a fingerprint of the selection-relevant config. Same algorithm as
 * catalogCore.fingerprintEntry, for the same reason: it has to be cheap, stable
 * across reloads, and short enough to sit in chat_metadata without being noticed.
 *
 * @param {object} cfg - a resolved librarian config
 * @returns {string}
 */
export function fingerprintLibrarianConfig(cfg) {
    const conf = { ...LIBRARIAN_DEFAULTS, ...(cfg || {}) };
    const parts = SELECTION_FIELDS.map((key) => {
        const v = conf[key];
        if (Array.isArray(v)) return `${key}=${v.slice().sort().join(',')}`;
        return `${key}=${String(v)}`;
    });
    const source = parts.join('|');

    let hash = 0x811c9dc5;
    for (let i = 0; i < source.length; i++) {
        hash ^= source.charCodeAt(i) & 0xff;
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return `${source.length.toString(36)}.${hash.toString(36)}`;
}

// ---------------------------------------------------------------- the record

/**
 * Build a fresh cache record around a model selection.
 *
 * Short field names for the same reason catalog rows use them — this is paid for
 * inside every serialized chat_metadata.
 *
 * @param {{
 *   uids?: number[], watermark?: number, catalogBuiltAt?: number,
 *   lastIndex?: number, cfgFingerprint?: string, now?: number,
 * }} p
 * @returns {{v:number, lv:number, cfg:string, wm:number, cat:number, at:number, sc:number, uids:number[], top:number[], builtAt:number}}
 */
export function buildCacheRecord({
    uids, watermark, catalogBuiltAt, lastIndex, cfgFingerprint, now,
} = {}) {
    const at = Number.isFinite(lastIndex) ? Math.floor(lastIndex) : -1;
    return {
        v: LIBRARIAN_CACHE_VERSION,
        lv: LIBRARIAN_VERSION,
        cfg: String(cfgFingerprint ?? ''),
        wm: Number.isFinite(watermark) ? Math.floor(watermark) : -1,
        cat: Number.isFinite(catalogBuiltAt) ? Math.floor(catalogBuiltAt) : 0,
        // `at` is where the MODEL answered: the age valve and the "is this still
        // the same conversation" checks both measure from here.
        at,
        // `sc` is how far the name scan has already looked. It starts level with
        // `at` and only advances when a top-up actually fires, so a turn that
        // adds nothing costs no write.
        sc: at,
        uids: normalizeUids(uids),
        top: [],
        builtAt: Number.isFinite(now) ? Math.floor(now) : 0,
    };
}

/** Integer uids, de-duplicated, order preserved. */
function normalizeUids(list) {
    const out = [];
    const seen = new Set();
    for (const raw of Array.isArray(list) ? list : []) {
        const uid = Number(raw);
        if (!Number.isFinite(uid) || seen.has(uid)) continue;
        seen.add(uid);
        out.push(Math.floor(uid));
    }
    return out;
}

/**
 * The full selection a cache record currently stands for: the model's picks
 * first, then anything the mid-scene name scan has added.
 *
 * Order matters and this is the order we want. The model's picks are the ones
 * keyword search would MISS — a character named by role, a place the party is
 * heading toward — and they earn first claim on the token budget. A top-up name
 * was, by definition, spoken literally in the text; it is the cheaper thing to
 * lose if the budget runs out.
 *
 * @param {object|null|undefined} record
 * @returns {number[]}
 */
export function cachedSelection(record) {
    return normalizeUids([
        ...(Array.isArray(record?.uids) ? record.uids : []),
        ...(Array.isArray(record?.top) ? record.top : []),
    ]);
}

// ---------------------------------------------------------------- validity

/**
 * Decide whether a stored selection still applies to this turn.
 *
 * Checks run cheapest-and-most-decisive first, and every one of them reports a
 * distinct status: a librarian that quietly re-asks the model is a librarian
 * whose cost profile nobody can audit, which is the entire thing this task is
 * supposed to deliver.
 *
 * NEVER THROWS. Any fault is a miss, and a miss is just "make the call" — the
 * P7.2 behaviour. The cache can degrade to uncached; it cannot degrade to wrong.
 *
 * @param {object|null|undefined} record - the stored cache record
 * @param {{
 *   cfg?: object, watermark?: number, catalogBuiltAt?: number,
 *   lastIndex?: number, cfgFingerprint?: string,
 * }} ctx
 * @returns {{status:string, hit:boolean, age:number}}
 */
export function evaluateLibrarianCache(record, ctx = {}) {
    const conf = { ...LIBRARIAN_DEFAULTS, ...(ctx.cfg || {}) };
    const lastIndex = Number.isFinite(ctx.lastIndex) ? Math.floor(ctx.lastIndex) : -1;
    const miss = (status) => ({ status, hit: false, age: 0 });

    try {
        if (conf.cache === false) return miss(CACHE_STATUS.MISS_DISABLED);
        if (!record || typeof record !== 'object' || !Array.isArray(record.uids)) {
            return miss(CACHE_STATUS.MISS_NONE);
        }
        if (record.v !== LIBRARIAN_CACHE_VERSION || record.lv !== LIBRARIAN_VERSION) {
            return miss(CACHE_STATUS.MISS_VERSION);
        }

        const fp = typeof ctx.cfgFingerprint === 'string'
            ? ctx.cfgFingerprint
            : fingerprintLibrarianConfig(conf);
        if (record.cfg !== fp) return miss(CACHE_STATUS.MISS_CONFIG);

        // --- signal 1: the sentinel's boundary, observed as a committed memory
        const wm = Number.isFinite(ctx.watermark) ? Math.floor(ctx.watermark) : -1;
        if (Number(record.wm) !== wm) return miss(CACHE_STATUS.MISS_SCENE);

        // --- signal 2: the lorebook itself moved under the selection
        // Only decisive when the caller actually knows the stamp; an absent
        // catalog must not invalidate a cache that the watermark says is fine.
        const cat = Number(ctx.catalogBuiltAt);
        if (Number.isFinite(cat) && cat > 0 && Number(record.cat) !== Math.floor(cat)) {
            return miss(CACHE_STATUS.MISS_CATALOG);
        }

        // --- correctness guards
        const at = Number(record.at);
        // Fewer messages than when we answered => deleted, rewound, or a branch.
        // The selection was made against text that no longer exists.
        if (lastIndex < at) return miss(CACHE_STATUS.MISS_REWIND);

        const age = lastIndex - at;
        const maxTurns = Number.isFinite(conf.cacheMaxTurns) ? Math.floor(conf.cacheMaxTurns) : 0;
        if (maxTurns > 0 && age >= maxTurns) return miss(CACHE_STATUS.MISS_AGE);

        return { status: CACHE_STATUS.HIT, hit: true, age };
    } catch {
        return miss(CACHE_STATUS.MISS_NONE);
    }
}

// ---------------------------------------------------------------- top-up

/**
 * Catalog rows whose entity names or title occur literally in `text`.
 *
 * Uses librarianCore.termAppearsIn — the SAME matcher as the keyword floor — so
 * a name that ST would also match as a key is recognised identically by both,
 * and the plan can drop it as `already-active` instead of the librarian paying
 * budget to duplicate an activation.
 *
 * @param {Array<{uid:number, title?:string, n?:string[], off?:boolean}>} rows
 * @param {string} text
 * @param {{includeTitle?:boolean, minChars?:number}} [opts]
 * @returns {Set<number>}
 */
export function scanCatalogNames(rows, text, opts = {}) {
    const hits = new Set();
    const haystack = String(text ?? '').toLowerCase();
    if (!haystack) return hits;

    const includeTitle = opts.includeTitle !== false;
    const minChars = Number.isFinite(opts.minChars) ? opts.minChars : MIN_TOPUP_NAME_CHARS;

    for (const row of Array.isArray(rows) ? rows : []) {
        if (!row || row.off === true) continue;
        const uid = Number(row.uid);
        if (!Number.isFinite(uid)) continue;

        const terms = Array.isArray(row.n) ? row.n.slice() : [];
        if (includeTitle && row.title) terms.push(row.title);

        for (const term of terms) {
            const t = String(term ?? '').trim();
            if (t.length < minChars) continue;
            if (termAppearsIn(haystack, t)) {
                hits.add(uid);
                break;
            }
        }
    }
    return hits;
}

/**
 * The mid-scene top-up: which uids a name scan would add to a cached selection.
 *
 * Scans ONLY the messages that arrived after `record.sc` — the point the scan
 * last reached. That is what makes this "a NEW entity appeared" rather than "an
 * entity is present": everything already visible when the model answered was
 * seen by the model, and its decision not to select it is a decision, not an
 * oversight we should overturn with a substring match.
 *
 * @param {{
 *   record: object,
 *   rows?: Array<object>,
 *   messages?: Array<{id:number, speaker:string, rawText:string}>,
 *   cfg?: object,
 * }} p
 * @returns {{added:number[], scanned:number, scannedFrom:number, messages:number}}
 */
export function planLibrarianTopUp({ record, rows, messages, cfg } = {}) {
    const conf = { ...LIBRARIAN_DEFAULTS, ...(cfg || {}) };
    const none = (scanned) => ({ added: [], scanned, scannedFrom: scanned, messages: 0 });

    const since = Number.isFinite(Number(record?.sc)) ? Math.floor(Number(record.sc)) : -1;
    if (conf.topUp === false) return none(since);

    const list = Array.isArray(messages) ? messages : [];
    const fresh = list.filter(m => Number(m?.id) > since);
    // Nothing new since the last scan — the cheapest path there is, and the one
    // a swipe or a regenerate takes.
    if (fresh.length === 0) return none(since);

    const scanned = fresh.reduce((max, m) => Math.max(max, Number(m.id)), since);
    const text = formatDetectionWindow(fresh, conf.truncateChars);
    const hits = scanCatalogNames(rows, text);
    if (hits.size === 0) return { added: [], scanned, scannedFrom: since, messages: fresh.length };

    const known = new Set(cachedSelection(record));
    // Bound the list at the entry cap. planLibrarianInjection caps it again
    // downstream; this just keeps an unbounded array out of chat_metadata.
    const cap = Number.isFinite(conf.maxEntries) ? Math.max(0, Math.floor(conf.maxEntries)) : 0;
    const added = [...hits].filter(uid => !known.has(uid)).slice(0, cap);

    return { added, scanned, scannedFrom: since, messages: fresh.length };
}

/**
 * Fold a top-up into a record. Returns a NEW record; `wm`, `cat`, `at` and `cfg`
 * are untouched, because a top-up is not a new selection — the scene, the
 * config, and the turn the model answered on are all still what they were.
 *
 * @param {object} record
 * @param {{added?:number[], scanned?:number}} topUp
 * @returns {object}
 */
export function applyTopUpToRecord(record, topUp = {}) {
    const added = normalizeUids(topUp.added);
    const next = { ...record };
    if (added.length > 0) {
        const known = new Set(cachedSelection(record));
        next.top = normalizeUids([
            ...(Array.isArray(record?.top) ? record.top : []),
            ...added.filter(uid => !known.has(uid)),
        ]);
    }
    if (Number.isFinite(topUp.scanned)) next.sc = Math.floor(topUp.scanned);
    return next;
}

// ---------------------------------------------------------------- the seam

/**
 * Build the `{getCachedIds, onSelected}` pair that librarianCore's cycle takes.
 *
 * This is the whole integration surface. The cycle asks one question — "do I
 * already know the answer for this turn?" — and this decides it, tops the
 * answer up if a new name walked in, and persists the model's answer when one
 * had to be fetched.
 *
 * Every dependency is a plain function so the acceptance harness can drive the
 * real policy against a fixture with no SillyTavern in sight.
 *
 * @param {{
 *   cfg?: object,
 *   readCache: () => (object|null|undefined),
 *   writeCache: (record:object) => void,
 *   getWatermark?: () => number,
 *   getCatalogBuiltAt?: () => number,
 *   getRows?: () => Array<object>,
 *   now?: () => number,
 * }} deps
 * @returns {{getCachedIds:(window:object)=>object, onSelected:(ids:number[], window:object)=>void, lastStatus:()=>string}}
 */
export function makeLibrarianCacheSeam(deps = {}) {
    const cfg = { ...LIBRARIAN_DEFAULTS, ...(deps.cfg || {}) };
    const fp = fingerprintLibrarianConfig(cfg);
    const read = typeof deps.readCache === 'function' ? deps.readCache : () => null;
    const write = typeof deps.writeCache === 'function' ? deps.writeCache : () => {};
    const watermark = typeof deps.getWatermark === 'function' ? deps.getWatermark : () => -1;
    const builtAt = typeof deps.getCatalogBuiltAt === 'function' ? deps.getCatalogBuiltAt : () => 0;
    const rows = typeof deps.getRows === 'function' ? deps.getRows : () => [];
    const now = typeof deps.now === 'function' ? deps.now : () => 0;

    let status = CACHE_STATUS.MISS_NONE;

    return {
        lastStatus: () => status,

        getCachedIds(window) {
            try {
                const record = read();
                const evaluation = evaluateLibrarianCache(record, {
                    cfg,
                    watermark: watermark(),
                    catalogBuiltAt: builtAt(),
                    lastIndex: Number(window?.end),
                    cfgFingerprint: fp,
                });
                status = evaluation.status;
                if (!evaluation.hit) return { ids: null, reason: status };

                const topUp = planLibrarianTopUp({
                    record,
                    rows: rows(),
                    messages: window?.messages,
                    cfg,
                });
                if (topUp.added.length === 0) {
                    return { ids: cachedSelection(record), reason: status, added: [] };
                }

                // Persist so the addition survives the entity scrolling out of
                // the window later in the same scene, and so the next turn does
                // not rescan the same messages. Only a turn that actually found
                // something pays for a write.
                const next = applyTopUpToRecord(record, topUp);
                write(next);
                return { ids: cachedSelection(next), reason: status, added: topUp.added };
            } catch {
                // A broken cache is a cache miss, never a broken turn.
                status = CACHE_STATUS.MISS_NONE;
                return { ids: null, reason: status };
            }
        },

        onSelected(ids, window) {
            if (cfg.cache === false) return;
            write(buildCacheRecord({
                uids: ids,
                watermark: watermark(),
                catalogBuiltAt: builtAt(),
                lastIndex: Number(window?.end),
                cfgFingerprint: fp,
                now: now(),
            }));
        },
    };
}
