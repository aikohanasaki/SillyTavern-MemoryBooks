// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// STMB-Auto fork — Librarian retrieval engine, pure logic (Phase 7, task P7.2).
// Plan: PHA-1633 §Architecture 2 + 4 ("ONE pre-turn call on the cheap detection
// profile: input = last N messages (truncated, same discipline as sentinel) +
// catalog; output = strict JSON list of entry ids ... injected via the standard
// WI/extension-prompt path ... budget cap enforced in code, not by the model").
//
// ---------------------------------------------------------------------------
// The prime constraint, restated as code rules
// ---------------------------------------------------------------------------
// The narrator model must never be able to tell the librarian exists. Its
// prompt may differ from stock ONLY by which lorebook entries are present.
// Three rules follow, and every function here obeys them:
//
//   1. ADDITIVE ONLY. Nothing in this file can suppress an activation.
//      `planLibrarianInjection` produces a list of entries to ADD; it never
//      returns a removal, never reorders ST's own activations, and never
//      emits instruction/preamble text. `renderInjection` joins entry CONTENT
//      with newlines — exactly what SillyTavern's world-info path does — so an
//      injected entry is byte-indistinguishable from a keyword-matched one.
//
//   2. BUDGET IS ENFORCED HERE, NOT BY THE MODEL. The librarian may return any
//      number of uids; `planLibrarianInjection` accepts them in the model's
//      priority order and stops at the configured token/entry cap. A model that
//      ignores the cap costs nothing.
//
//   3. NO SILENT CAPS, NO GUESSING. Every uid the plan refuses is reported in
//      `dropped` with a reason. `parseSelection` returns null rather than a
//      salvaged partial parse, and `selectEntries` allows exactly one strict
//      "JSON only" retry before giving up — same discipline as the sentinel
//      (sentinelCore.detectBoundaries). Give-up = empty selection = stock.
//
// Dependency-injected and SillyTavern-free so it runs under node:test, exactly
// like the other phase cores. The runtime binding that touches chat_metadata /
// loadWorldInfo / requestCompletion / the generation event lives in
// librarian.js.
//
// The window builders are imported from sentinelCore rather than re-implemented
// so "same truncation discipline as the sentinel" is a fact about the code, not
// a comment: a change to the sentinel's truncation moves the librarian with it.

import {
    extractWindowMessages,
    formatDetectionWindow,
} from './sentinelCore.js';

// ---------------------------------------------------------------- defaults

/**
 * Bump when the shape of a cached selection changes in a way that makes an
 * older stored one unusable (P7.3 caches selections in chat_metadata).
 */
export const LIBRARIAN_VERSION = 1;

/**
 * Librarian defaults; user-tunable via
 * extension_settings.STMemoryBooks.autoModule.librarian (global) and
 * chat_metadata.stmbc.librarian (per-chat), same as every other module.
 *
 * `enabled: false` is load-bearing, not timidity: the phase gate is "librarian
 * disabled → byte-identical prompts vs current v0.x behavior", so the shipped
 * default has to be the stock path.
 */
export const LIBRARIAN_DEFAULTS = Object.freeze({
    enabled: false,
    /** Profile index for the retrieval call; null => reuse the sentinel's detection profile. */
    profileIndex: null,
    /** How many trailing chat messages the librarian reads. */
    window: 8,
    /** Per-message truncation, same units as the sentinel's truncateChars. */
    truncateChars: 400,
    /** Hard cap on entries added per turn, applied after the model answers. */
    maxEntries: 8,
    /** Hard cap on added prompt tokens, applied after the model answers. */
    tokenBudget: 1500,
    /** Wall-clock cap on the whole retrieval call. Exceeded => stock prompt. */
    timeoutMs: 8000,
    /** Extension-prompt fallback placement (unused on the world-info path). */
    depth: 4,
    role: 0,
    /** Restrict retrieval to these catalog kinds; empty = every kind. */
    kinds: [],
    /** Override for LIBRARIAN_PROMPT; '' = use the bundled one. */
    prompt: '',
    /** Skip entries a keyword/constant activation is already going to inject. */
    skipLikelyActive: true,
    /**
     * P7.3 scene-aware caching. `cache: true` reuses the last selection for
     * every turn inside the same scene and only re-asks the model when the
     * sentinel's boundary lands; `topUp` adds the cheap name-scan that catches
     * an entity walking into the middle of a scene. Both default ON — caching
     * is the cost-collapse mechanism, not an opt-in optimisation.
     */
    cache: true,
    topUp: true,
    /** Safety valve: re-ask anyway after this many turns without a boundary. */
    cacheMaxTurns: 30,
    debug: false,
});

/** Numeric settings and their accepted ranges (mirrors autoSettings' RANGES). */
const RANGES = Object.freeze({
    window: { min: 1, max: 200 },
    truncateChars: { min: 50, max: 5000 },
    maxEntries: { min: 1, max: 100 },
    tokenBudget: { min: 0, max: 100000 },
    timeoutMs: { min: 500, max: 120000 },
    depth: { min: 0, max: 100 },
    role: { min: 0, max: 2 },
    cacheMaxTurns: { min: 0, max: 10000 },
});

/**
 * The retrieval prompt. Deliberately boring: the model's only job is to pick
 * ids off a list it can see. Everything that could go wrong downstream (too
 * many ids, unknown ids, disabled entries, budget) is handled in code, so the
 * prompt does not need to threaten the model about any of it.
 */
export const LIBRARIAN_PROMPT =
`You are a librarian for a long-form roleplay. Below is a CATALOG of lorebook
entries, then the most recent messages of the story.

Select the catalog entries the next reply will actually need: people, places,
factions, objects and past events that the scene is about to touch, including
ones named only obliquely. Prefer entries that would be missed by a plain
keyword search — a character referred to by role instead of name, a location
the party is travelling toward, an unresolved thread the scene is circling.
Do not select entries just because they were mentioned once in passing.

Reply with ONLY a JSON array of catalog ids, most important first, e.g.
[12, 4, 31], or [] if nothing is needed. No prose, no code fences.`;

/** Reprimand appended on the single retry when the first reply is not strict JSON. */
export const LIBRARIAN_JSON_REPRIMAND =
    'Reply with ONLY a JSON array of catalog ids, e.g. [12, 4], or []. No prose, no code fences.';

/** Reasons a selected uid can be refused, reported per-uid in `dropped`. */
export const DROP_REASONS = Object.freeze({
    UNKNOWN: 'unknown',              // no such uid in the catalog/lorebook
    DISABLED: 'disabled',            // entry is switched off in the lorebook
    KIND: 'kind',                    // filtered out by cfg.kinds
    EMPTY: 'empty',                  // entry has no content to inject
    DUPLICATE: 'duplicate',          // uid repeated in the model's answer
    ALREADY_ACTIVE: 'already-active', // keyword/constant will inject it anyway
    ENTRY_CAP: 'entry-cap',          // cfg.maxEntries reached
    TOKEN_BUDGET: 'token-budget',    // cfg.tokenBudget reached
});

// ---------------------------------------------------------------- config

/**
 * Merge librarian configuration from global settings and per-chat metadata over
 * the defaults. Per-chat wins over global — same contract as
 * `resolveCatalogConfig` / `resolveReviewConfig`.
 *
 * @param {object|null|undefined} global - extension_settings.STMemoryBooks.autoModule
 * @param {object|null|undefined} perChat - chat_metadata.stmbc
 * @returns {object} the resolved config
 */
export function resolveLibrarianConfig(global, perChat) {
    const g = (global && global.librarian) || {};
    const p = (perChat && perChat.librarian) || {};
    const cfg = { ...LIBRARIAN_DEFAULTS };

    for (const [key, range] of Object.entries(RANGES)) {
        for (const src of [g, p]) {
            const v = src[key];
            if (Number.isFinite(v) && v >= range.min && v <= range.max) cfg[key] = Math.floor(v);
        }
    }
    for (const key of ['enabled', 'skipLikelyActive', 'cache', 'topUp', 'debug']) {
        for (const src of [g, p]) {
            if (typeof src[key] === 'boolean') cfg[key] = src[key];
        }
    }
    for (const src of [g, p]) {
        if (Number.isInteger(src.profileIndex) && src.profileIndex >= 0) cfg.profileIndex = src.profileIndex;
        else if (src.profileIndex === null) cfg.profileIndex = null;
        if (Array.isArray(src.kinds)) cfg.kinds = src.kinds.filter(k => typeof k === 'string' && k);
        if (typeof src.prompt === 'string' && src.prompt.trim()) cfg.prompt = src.prompt;
    }
    return cfg;
}

// ---------------------------------------------------------------- window

/**
 * The last `window` non-system messages, stripped and truncated by the
 * sentinel's own formatter. Unlike the sentinel's window this is not
 * watermark-relative — retrieval is about what is happening NOW, not about what
 * has yet to be memorized.
 *
 * @param {Array<object>} chat
 * @param {{window?:number, truncateChars?:number}} [cfg]
 * @returns {{start:number, end:number, messages:Array<object>, text:string}}
 */
export function buildLibrarianWindow(chat, cfg = {}) {
    const list = Array.isArray(chat) ? chat : [];
    const size = Number.isFinite(cfg.window) && cfg.window > 0
        ? Math.floor(cfg.window)
        : LIBRARIAN_DEFAULTS.window;
    const truncate = Number.isFinite(cfg.truncateChars) && cfg.truncateChars > 0
        ? Math.floor(cfg.truncateChars)
        : LIBRARIAN_DEFAULTS.truncateChars;

    const lastIndex = list.length - 1;
    if (lastIndex < 0) return { start: 0, end: -1, messages: [], text: '' };

    // Walk backwards so `window` counts VISIBLE messages: a stretch of hidden
    // /sys messages must not silently shrink the window the model sees.
    const picked = [];
    for (let i = lastIndex; i >= 0 && picked.length < size; i--) {
        if (!list[i] || list[i].is_system) continue;
        picked.push(i);
    }
    if (picked.length === 0) return { start: 0, end: lastIndex, messages: [], text: '' };

    const start = picked[picked.length - 1];
    const messages = extractWindowMessages(list, start, lastIndex);
    return { start, end: lastIndex, messages, text: formatDetectionWindow(messages, truncate) };
}

/**
 * Fold the instruction, the catalog and the window into the single prompt
 * string `requestCompletion` takes (same shape as sentinelCore.detectBoundaries).
 *
 * @param {{systemPrompt?:string, catalogLines?:string[], windowText?:string, maxEntries?:number}} p
 * @returns {string}
 */
export function buildLibrarianPrompt({ systemPrompt, catalogLines, windowText, maxEntries } = {}) {
    const head = String(systemPrompt || LIBRARIAN_PROMPT);
    const lines = Array.isArray(catalogLines) ? catalogLines : [];
    const cap = Number.isFinite(maxEntries) && maxEntries > 0 ? Math.floor(maxEntries) : null;
    const capLine = cap ? `\nSelect at most ${cap} ids.` : '';
    return `${head}${capLine}\n\n### CATALOG\n${lines.join('\n')}\n\n### RECENT MESSAGES\n${String(windowText ?? '')}`;
}

// ---------------------------------------------------------------- parsing

/**
 * Accept only a JSON array of catalog ids — either bare integers (`[12, 4]`,
 * what the prompt asks for) or `{id, priority}` objects (what a model that
 * decided to be helpful tends to emit instead). Priority is the array order in
 * both forms; an explicit numeric `priority`/`p` field is ignored deliberately,
 * because two orderings that disagree is a guess and this layer does not guess.
 *
 * Tolerates surrounding whitespace and a single markdown code fence, exactly
 * like sentinelCore.parseIdArray. Anything else returns null (= unparseable,
 * caller skips) rather than a partial salvage.
 *
 * @param {string} reply
 * @returns {number[]|null}
 */
export function parseSelection(reply) {
    if (typeof reply !== 'string') return null;
    let s = reply.trim();
    const fence = /^```(?:json)?\s*([\s\S]*?)\s*```$/.exec(s);
    if (fence) s = fence[1].trim();

    let parsed;
    try {
        parsed = JSON.parse(s);
    } catch {
        return null;
    }
    if (!Array.isArray(parsed)) return null;

    const ids = [];
    for (const item of parsed) {
        if (Number.isInteger(item)) {
            ids.push(item);
            continue;
        }
        if (item && typeof item === 'object' && !Array.isArray(item)) {
            const raw = item.id ?? item.uid;
            if (Number.isInteger(raw)) {
                ids.push(raw);
                continue;
            }
        }
        return null; // one bad element invalidates the reply — never guess
    }
    return ids;
}

/**
 * One retrieval round: a single call, then a single strict "JSON only" retry on
 * parse failure. Returns `ids === null` when the reply is unparseable after the
 * retry (skip — never guess).
 *
 * `select(prompt) => Promise<string>` is the injected single-shot LLM call; it
 * may throw (API error / timeout) and the caller treats that as a skipped turn.
 *
 * @param {{select:(prompt:string)=>Promise<string>, systemPrompt?:string, catalogLines?:string[], windowText?:string, maxEntries?:number}} p
 * @returns {Promise<{ids:number[]|null, attempts:string[], prompt:string}>}
 */
export async function selectEntries({ select, systemPrompt, catalogLines, windowText, maxEntries } = {}) {
    const prompt = buildLibrarianPrompt({ systemPrompt, catalogLines, windowText, maxEntries });
    const attempts = [];

    let reply = await select(prompt);
    attempts.push(reply);
    let ids = parseSelection(reply);

    if (ids === null) {
        reply = await select(`${prompt}\n\n${LIBRARIAN_JSON_REPRIMAND}`);
        attempts.push(reply);
        ids = parseSelection(reply);
    }
    return { ids, attempts, prompt };
}

// ---------------------------------------------------------------- keyword floor

/** Escape a literal key for use inside a RegExp. */
function escapeRegExp(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Compiled matchers, keyed by term.
 *
 * Both scans that use `termAppearsIn` run on the blocking pre-generation path,
 * over the same handful of terms, on every single turn: a 52-entry lorebook is
 * ~250 recompilations per turn. Measured on the Satire Isekai fixture this is
 * worth ~6% of p50 and ~9% of p90 on a cached turn — modest, because the actual
 * cost is the matching itself, not the compile. Kept because it is free and it
 * is on the one path where the fork blocks the user's generation.
 *
 * The terms come from the lorebook, so the key space is bounded by its size;
 * `MATCHER_CACHE_LIMIT` is a backstop against a pathological book rather than an
 * expected condition.
 *
 * `null` is a cached decision too — "this term is not wordy, use includes()".
 */
const matcherCache = new Map();
const MATCHER_CACHE_LIMIT = 4096;

/**
 * Does `term` occur in already-lowercased `haystack`?
 *
 * Word-boundary match for plain terms; substring for terms that carry
 * punctuation (where a boundary assertion would not fire). SillyTavern's own
 * matcher is whole-word by default, so this is the closer approximation.
 *
 * Exported because P7.3's name-scan top-up (librarianCacheCore) must use the
 * SAME matcher as the keyword floor below. Two matchers would drift, and the
 * drift would show up as the top-up adding entries ST was already going to
 * activate — paid for out of the token budget.
 *
 * @param {string} haystack - lowercased text
 * @param {string} term - raw term (lowercased here)
 * @returns {boolean}
 */
export function termAppearsIn(haystack, term) {
    const k = String(term ?? '').trim().toLowerCase();
    if (!k || !haystack) return false;

    let re = matcherCache.get(k);
    if (re === undefined) {
        const isWordy = /^[\p{L}\p{N}][\p{L}\p{N}\s'’-]*$/u.test(k);
        re = isWordy
            ? new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(k)}($|[^\\p{L}\\p{N}])`, 'u')
            : null;
        if (matcherCache.size >= MATCHER_CACHE_LIMIT) matcherCache.clear();
        matcherCache.set(k, re);
    }
    return re ? re.test(haystack) : haystack.includes(k);
}

/**
 * Best-effort guess at which entries SillyTavern's own activation is already
 * going to inject: constants, plus entries whose primary keys appear in the
 * scanned text.
 *
 * This is an OPTIMIZATION, not a gate, and its error direction is deliberate.
 * The real activation logic (selective AND/NOT, secondary keys, regex keys,
 * scan depth, recursion, group scoring) lives in SillyTavern and is not
 * reimplemented here. A false positive costs one librarian addition we did not
 * need to make; a false negative costs a few budget tokens on an entry ST would
 * have injected anyway. NEITHER can suppress an activation, because nothing
 * downstream of this function removes anything from ST's own set — it only
 * shortens the list of things the librarian ADDS.
 *
 * @param {Array<{uid:(number|string), key?:string[], constant?:boolean, disable?:boolean}>} entries
 * @param {string} text - the scanned text (the librarian window is the right size)
 * @returns {Set<number>} uids likely to be active without the librarian
 */
export function scanLikelyActiveUids(entries, text) {
    const active = new Set();
    const haystack = String(text ?? '').toLowerCase();
    for (const entry of Array.isArray(entries) ? entries : []) {
        if (!entry || entry.disable === true) continue;
        const uid = Number(entry.uid);
        if (!Number.isFinite(uid)) continue;
        if (entry.constant === true) {
            active.add(uid);
            continue;
        }
        if (!haystack) continue;
        const keys = Array.isArray(entry.key) ? entry.key : [];
        for (const key of keys) {
            if (termAppearsIn(haystack, key)) {
                active.add(uid);
                break;
            }
        }
    }
    return active;
}

// ---------------------------------------------------------------- planning

/**
 * Turn the model's id list into the entries that will actually be injected,
 * applying every cap in code.
 *
 * Order is the model's order — it is the only priority signal we accept (see
 * `parseSelection`) — and the caps are applied by walking that order, so a
 * budget-limited turn keeps the entries the librarian ranked highest.
 *
 * @param {{
 *   ids?: number[],
 *   getEntry: (uid:number) => (object|null|undefined),
 *   getRow?: (uid:number) => (object|null|undefined),
 *   likelyActive?: Set<number>,
 *   cfg?: object,
 *   countTokens?: (text:string) => number,
 * }} p
 * @returns {{included:Array<object>, dropped:Array<{uid:number, reason:string}>, usedTokens:number, budget:number}}
 */
export function planLibrarianInjection({ ids, getEntry, getRow, likelyActive, cfg, countTokens } = {}) {
    const conf = { ...LIBRARIAN_DEFAULTS, ...(cfg || {}) };
    const budget = Number.isFinite(conf.tokenBudget) ? Math.max(0, Math.floor(conf.tokenBudget)) : 0;
    const maxEntries = Number.isFinite(conf.maxEntries) ? Math.max(0, Math.floor(conf.maxEntries)) : 0;
    const kinds = Array.isArray(conf.kinds) && conf.kinds.length ? new Set(conf.kinds) : null;
    const active = likelyActive instanceof Set ? likelyActive : new Set();
    const estimate = typeof countTokens === 'function' ? countTokens : estimateTokens;

    const included = [];
    const dropped = [];
    const seen = new Set();
    let usedTokens = 0;

    for (const raw of Array.isArray(ids) ? ids : []) {
        const uid = Number(raw);
        if (!Number.isFinite(uid)) {
            dropped.push({ uid: raw, reason: DROP_REASONS.UNKNOWN });
            continue;
        }
        if (seen.has(uid)) {
            dropped.push({ uid, reason: DROP_REASONS.DUPLICATE });
            continue;
        }
        seen.add(uid);

        const entry = typeof getEntry === 'function' ? getEntry(uid) : null;
        if (!entry) {
            dropped.push({ uid, reason: DROP_REASONS.UNKNOWN });
            continue;
        }
        if (entry.disable === true) {
            dropped.push({ uid, reason: DROP_REASONS.DISABLED });
            continue;
        }
        const row = typeof getRow === 'function' ? getRow(uid) : null;
        if (kinds && row && !kinds.has(row.kind)) {
            dropped.push({ uid, reason: DROP_REASONS.KIND });
            continue;
        }
        const content = String(entry.content ?? '').trim();
        if (!content) {
            dropped.push({ uid, reason: DROP_REASONS.EMPTY });
            continue;
        }
        if (conf.skipLikelyActive !== false && active.has(uid)) {
            dropped.push({ uid, reason: DROP_REASONS.ALREADY_ACTIVE });
            continue;
        }
        if (included.length >= maxEntries) {
            dropped.push({ uid, reason: DROP_REASONS.ENTRY_CAP });
            continue;
        }

        // Prefer the catalog's stored size (measured by the same estimator the
        // auditor uses) and fall back to a local estimate for entries the
        // catalog has not indexed yet.
        const tokens = Number.isFinite(row?.t) && row.t > 0 ? Math.floor(row.t) : estimate(content);
        if (usedTokens + tokens > budget) {
            // Skip, but keep walking: a later, smaller pick that still fits is
            // worth more coverage than an empty tail. This does let a lower
            // priority entry in ahead of a higher one it could not displace —
            // acceptable because the refusal is reported, not silent, and
            // because ordering inside the injected set is ST's to decide.
            dropped.push({ uid, reason: DROP_REASONS.TOKEN_BUDGET });
            continue;
        }

        usedTokens += tokens;
        included.push({
            uid,
            title: String(entry.comment ?? row?.title ?? ''),
            content,
            tokens,
            kind: row?.kind ?? null,
            entry,
        });
    }

    return { included, dropped, usedTokens, budget };
}

/**
 * ~4 chars/token, the same crude ratio auditorTechnicalPass uses. Only reached
 * for entries the catalog has not indexed; catalog rows carry a real estimate.
 */
export function estimateTokens(text) {
    return Math.ceil(String(text ?? '').length / 4);
}

/**
 * The text to inject for a plan, when the extension-prompt path is used.
 *
 * Entry CONTENT joined by newlines and nothing else — no titles, no headers, no
 * "the following lore may be relevant" framing. SillyTavern's world-info path
 * injects exactly this, so a librarian-added entry and a keyword-matched one are
 * indistinguishable in the narrator's prompt. Any decoration added here would
 * break the phase's parity requirement.
 *
 * @param {Array<{content:string}>} included
 * @returns {string}
 */
export function renderInjection(included) {
    return (Array.isArray(included) ? included : [])
        .map(e => String(e?.content ?? '').trim())
        .filter(Boolean)
        .join('\n');
}

// ---------------------------------------------------------------- the cycle

/**
 * Run one full librarian retrieval for a turn against injected dependencies.
 *
 * NEVER THROWS. Every failure mode — disabled, no catalog, empty chat, API
 * error, timeout, unparseable JSON after the retry — returns a record whose
 * `included` is empty, which the binding applies as "inject nothing" and the
 * narrator sees the stock prompt. That is the fail-open guarantee, and it lives
 * here (pure, testable) rather than in a try/catch around the binding.
 *
 * @param {{
 *   config?: object,
 *   getChat: () => Array<object>,
 *   getCatalogLines: () => {lines:string[], rows?:number},
 *   getEntries: () => Promise<Array<object>>|Array<object>,
 *   getRow?: (uid:number) => (object|null|undefined),
 *   select: (prompt:string) => Promise<string>,
 *   isCancelled?: () => boolean,
 *   now?: () => number,
 *   log?: (record:object) => void,
 * }} deps
 * @returns {Promise<object>} the retrieval record ({ action, included, ... })
 */
export async function runLibrarianRetrieval(deps) {
    const log = typeof deps?.log === 'function' ? deps.log : () => {};
    const now = typeof deps?.now === 'function' ? deps.now : () => 0;
    const isCancelled = typeof deps?.isCancelled === 'function' ? deps.isCancelled : () => false;
    const startedAt = now();
    const finish = (record) => {
        const out = { included: [], dropped: [], usedTokens: 0, ms: now() - startedAt, ...record };
        log(out);
        return out;
    };

    try {
        const cfg = { ...LIBRARIAN_DEFAULTS, ...(deps?.config || {}) };
        if (!cfg.enabled) return finish({ action: 'skip:disabled' });
        if (isCancelled()) return finish({ action: 'skip:cancelled' });

        const chat = typeof deps.getChat === 'function' ? deps.getChat() : [];
        const window = buildLibrarianWindow(chat, cfg);
        if (!window.text) return finish({ action: 'skip:no-window' });

        // P7.3 cache seam. Consulted BEFORE the catalog is formatted, because on
        // a cached turn there is no prompt to build and formatting rows we will
        // never send is exactly the wasted work the 50ms budget is about.
        //
        // The seam is deliberately narrow: this file owns the cycle, and
        // librarianCacheCore owns the policy (what counts as the same scene,
        // what the name-scan may add). `getCachedIds` returns either
        // `{ids: number[]}` — reuse these, make no call — or `{ids: null,
        // reason}` — the model has to answer this turn.
        const cached = typeof deps.getCachedIds === 'function' ? deps.getCachedIds(window) : null;
        let ids = Array.isArray(cached?.ids) ? cached.ids : null;
        let attempts;
        const source = ids ? 'cache' : 'call';
        const cacheReason = String(cached?.reason ?? 'miss:no-cache');
        const toppedUp = Array.isArray(cached?.added) ? cached.added : [];

        if (source === 'call') {
            const catalog = typeof deps.getCatalogLines === 'function' ? deps.getCatalogLines() : null;
            const catalogLines = Array.isArray(catalog?.lines) ? catalog.lines : [];
            if (catalogLines.length === 0) return finish({ action: 'skip:no-catalog', window, cacheReason });

            try {
                ({ ids, attempts } = await selectEntries({
                    select: deps.select,
                    systemPrompt: cfg.prompt,
                    catalogLines,
                    windowText: window.text,
                    maxEntries: cfg.maxEntries,
                }));
            } catch (err) {
                // API error, abort, or timeout — the single most likely failure in
                // production, and the one the fail-open test kills the API to force.
                return finish({ action: 'skip:call-failed', error: String(err?.message || err), cacheReason });
            }
            if (ids === null) return finish({ action: 'skip:bad-json', attempts: attempts?.length ?? 0, cacheReason });
            if (isCancelled()) return finish({ action: 'skip:cancelled' });

            // Store the model's answer BEFORE planning. What is cached is the
            // SELECTION, never the injection: caps, the keyword floor and the
            // token budget are re-applied from scratch on every cached turn, so
            // a stale plan can never outlive the state it was planned against.
            if (typeof deps.onSelected === 'function') {
                try { deps.onSelected(ids, window); } catch { /* caching must never break a turn */ }
            }
        }

        const entries = typeof deps.getEntries === 'function' ? await deps.getEntries() : [];
        const entryList = Array.isArray(entries) ? entries : [];
        const byUid = new Map();
        for (const entry of entryList) {
            const uid = Number(entry?.uid);
            if (Number.isFinite(uid)) byUid.set(uid, entry);
        }

        const likelyActive = cfg.skipLikelyActive !== false
            ? scanLikelyActiveUids(entryList, window.text)
            : new Set();

        const plan = planLibrarianInjection({
            ids,
            getEntry: (uid) => byUid.get(uid) || null,
            getRow: typeof deps.getRow === 'function' ? deps.getRow : undefined,
            likelyActive,
            cfg,
        });

        return finish({
            action: plan.included.length > 0 ? 'inject' : 'skip:nothing-selected',
            selected: ids.length,
            included: plan.included,
            dropped: plan.dropped,
            usedTokens: plan.usedTokens,
            budget: plan.budget,
            attempts: attempts?.length ?? 0,
            // P7.3 telemetry — the fields the latency/cost gate reads. `calls`
            // is the one that proves the cost collapse: it is 1 on a
            // scene-change turn and 0 on every turn inside the scene.
            source,
            calls: source === 'call' ? (attempts?.length ?? 1) : 0,
            cacheReason,
            toppedUp,
            window: { start: window.start, end: window.end, messages: window.messages.length },
        });
    } catch (err) {
        // Belt and braces: a programmer error in here must still fail open.
        return finish({ action: 'skip:error', error: String(err?.message || err) });
    }
}
