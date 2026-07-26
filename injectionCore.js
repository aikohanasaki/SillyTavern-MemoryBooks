// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// STMB-Auto fork — living-lorebook context injection, pure logic (Phase 4, P4.1).
// Plan: eval/materials/stmb-auto/stmb-auto-plan.md §4.4 (context injection) and
// §5 (constraints: ~50K hard budget, error-control rules).
//
// This file holds the dependency-injected, SillyTavern-free core so it is
// unit-testable under node:test (see injection.test.js), exactly like the
// sentinel core (sentinelCore.js) and Clipper+ core (clipperPlusCore.js). The
// runtime binding that wires the real bound lorebook / world-info / settings
// lives in injection.js and is invoked by ONE `STMBC-HOOK(injection)` line in
// stmemory.js `buildPrompt()`.
//
// What it does: before a scene memory is generated, gather the token-capped
// living entries the book already knows (constant entries + entries whose
// keywords fire against the scene text) and prepend them with a DELTA-not-rehash
// instruction plus the error-control rules that must ride on every generation
// prompt (from the case-study failures, plan §5). When the module is disabled or
// there is nothing to inject the preamble is empty, so the upstream prompt is
// byte-identical (plan §1.2, §5.5 merge discipline).

// ---------------------------------------------------------------- defaults

/** Living-lorebook injection defaults (plan §4.4, §4.5, §5.1); all user-tunable. */
export const INJECTION_DEFAULTS = Object.freeze({
    enabled: false,               // off by default => upstream prompt is byte-identical
    budget: 50000,                // hard TOTAL context budget in tokens (plan §5.1)
    reserveForOutput: 1000,       // headroom kept free under the budget for the model's reply
    maxEntries: 60,               // safety cap on the number of injected entries
    perEntryChars: 1500,          // per-entry content truncation (one bloated entry can't eat the budget)
    includeConstant: true,        // always-on knowledge (WI `constant`) is injected regardless of match
    includeMemoryEntries: false,  // recent scene memories are already injected by upstream previousSummariesContext
    errorControl: true,           // append the error-control rules block (plan §5)
    prompt: null,                 // override for INJECTION_INSTRUCTION (global or per-chat)
});

// ---------------------------------------------------------------- rule blocks

/**
 * The delta-not-rehash framing for the living-lorebook block (plan §4.4). User-
 * editable via the `prompt` setting. Kept separate from the entries so the entry
 * list can be assembled/token-capped independently.
 */
export const INJECTION_INSTRUCTION =
`The following entries are what this story's lorebook ALREADY KNOWS. Write this
scene's memory as a DELTA against them: record only what is NEW, CHANGED, or
newly CONFIRMED-with-detail in the scene below. Do NOT rehash facts already
stated here. If the scene CONTRADICTS an entry, report the contradiction
explicitly — state both the established fact and the scene's version — and do NOT
silently reconcile them (injection otherwise entrenches early errors).`;

/**
 * Error-control rules that must ride on EVERY generation prompt (plan §4.4, §5).
 * Distilled from the case-study failure modes: invented facts, the "interesting
 * reading" over the ambiguous one, silent reconciliation of contradictions,
 * unsourced claims, and unbounded quote accrual.
 */
export const ERROR_CONTROL_RULES =
`ERROR-CONTROL RULES (apply to every claim you write):
- Never invent unstated facts. If a detail is not present in the scene, write
  "unspecified" rather than guessing.
- If the text is ambiguous, FLAG the ambiguity — do not silently pick the most
  interesting or dramatic reading.
- Report contradictions; never reconcile them by choosing one side.
- Attach provenance to concrete claims as \`src: msgs X–Y\`, using the message
  range that supports the claim.
- Quotes accrue across the whole story: keep only a few of the most telling per
  entry, and replace an existing quote only when a new one is clearly better.`;

// ---------------------------------------------------------------- config

/**
 * Merge injection configuration from global settings and per-chat metadata over
 * the defaults. Global lives at extension_settings.STMemoryBooks.autoModule.injection
 * (nested under the auto-module key alongside sentinel/clipper — plan §4.5);
 * per-chat at chat_metadata.stmbc.injection. Per-chat wins over global.
 */
export function resolveInjectionConfig(global, perChat) {
    const g = (global && global.injection) || {};
    const p = (perChat && perChat.injection) || {};
    const cfg = { ...INJECTION_DEFAULTS };

    for (const key of ['budget', 'reserveForOutput', 'maxEntries', 'perEntryChars']) {
        if (Number.isFinite(g[key])) cfg[key] = g[key];
        if (Number.isFinite(p[key])) cfg[key] = p[key];
    }
    for (const key of ['includeConstant', 'includeMemoryEntries', 'errorControl']) {
        if (typeof g[key] === 'boolean') cfg[key] = g[key];
        if (typeof p[key] === 'boolean') cfg[key] = p[key];
    }
    if (typeof g.prompt === 'string' && g.prompt.trim()) cfg.prompt = g.prompt;
    if (typeof p.prompt === 'string' && p.prompt.trim()) cfg.prompt = p.prompt;

    cfg.enabled = (typeof p.enabled === 'boolean') ? p.enabled : !!g.enabled;
    return cfg;
}

// ---------------------------------------------------------------- token counting

/**
 * Default token counter — the same chars/4 heuristic upstream `estimateTokens`
 * uses (utils.js), inlined so the core stays synchronous and SillyTavern-free.
 * The binding may inject a different counter, but this keeps budget accounting
 * consistent with the rest of STMB.
 */
export function countTokensDefault(text) {
    return Math.ceil(String(text ?? '').length / 4);
}

// ---------------------------------------------------------------- keyword matching

/** Normalize to space-delimited lowercase alphanumeric tokens for robust matching
 *  across markdown/macro/whitespace differences (shared shape with the clipper). */
export function normalizeForMatch(text) {
    return String(text ?? '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Count how many of an entry's keys fire against the scene text. A key matches
 * when its normalized form appears as a whole run of tokens in the normalized
 * scene (space-padded so "art" does not match inside "artisan"). Regex-style keys
 * (`/.../`) are matched literally — precision over recall: a keyword entry that
 * needs a real regex simply won't fire here rather than risk a bad/expensive
 * match (plan §5.2). Returns the number of distinct keys that matched.
 */
export function countKeyMatches(keys, paddedSceneNorm) {
    if (!Array.isArray(keys) || !paddedSceneNorm) return 0;
    let hits = 0;
    const seen = new Set();
    for (const raw of keys) {
        const norm = normalizeForMatch(raw);
        if (!norm || seen.has(norm)) continue;
        seen.add(norm);
        if (paddedSceneNorm.includes(` ${norm} `)) hits++;
    }
    return hits;
}

// ---------------------------------------------------------------- candidate prep

/**
 * Normalize a raw lorebook entry into the minimal shape selection needs, deciding
 * eligibility against the scene text. Content is truncated to `perEntryChars` up
 * front so token accounting matches what actually gets emitted.
 *
 * Eligible = constant (when includeConstant) OR at least one keyword match. An
 * ineligible entry returns null and is dropped from consideration entirely (it is
 * NOT a budget casualty — it simply never fired).
 *
 * @returns {{title,content,constant,matchCount,priority,tokens}|null}
 */
export function prepareCandidate(entry, { sceneNorm, cfg, countTokens = countTokensDefault }) {
    if (!entry) return null;
    const c = { ...INJECTION_DEFAULTS, ...(cfg || {}) };

    const content = truncateContent(entry.content, c.perEntryChars);
    if (!content) return null; // empty entries carry no knowledge

    const constant = !!entry.constant && c.includeConstant;
    const paddedScene = sceneNorm ? ` ${sceneNorm} ` : '';
    // Accept the normalized `keys` field or a raw World-Info `key` array.
    const keys = Array.isArray(entry.keys) ? entry.keys : (Array.isArray(entry.key) ? entry.key : []);
    const matchCount = countKeyMatches(keys, paddedScene);

    if (!constant && matchCount === 0) return null; // did not fire

    const title = String(entry.title ?? '').trim() || 'Untitled entry';
    // Constant entries rank above keyword hits; within each tier, more matches first.
    const priority = (constant ? 1_000_000 : 0) + matchCount;
    const tokens = countTokens(formatEntry({ title, content }, 0));

    return { title, content, constant, matchCount, priority, tokens };
}

/** Collapse a content string and hard-truncate it to `limit` chars (+ ellipsis). */
export function truncateContent(text, limit) {
    const flat = String(text ?? '').replace(/[ \t]+\n/g, '\n').trim();
    const lim = Math.max(1, Number(limit) || 1);
    return flat.length > lim ? flat.slice(0, lim).trimEnd() + '…' : flat;
}

// ---------------------------------------------------------------- selection

/**
 * Select the living entries that fit under the HARD context budget (plan §5.1).
 * `baseTokens` is the token cost of the rest of the prompt (system + scene +
 * upstream previous-memory context); the injected block may use at most
 * `budget - reserveForOutput - baseTokens`. Constant entries are offered first
 * (highest priority), then keyword matches by strength; greedy fill, stable
 * within a priority tier. Entries that don't fit — including constant ones — are
 * reported as `dropped`, never silently omitted (plan §4.3 "no silent caps").
 *
 * @param {Array} candidates prepared candidates (from prepareCandidate)
 * @returns {{included:Array, dropped:Array, usedTokens:number, available:number}}
 */
export function selectLivingEntries(candidates, { cfg, baseTokens = 0 } = {}) {
    const c = { ...INJECTION_DEFAULTS, ...(cfg || {}) };
    const list = (Array.isArray(candidates) ? candidates : []).filter(Boolean);

    // Stable sort by descending priority (Array.prototype.sort is stable in modern JS).
    const ordered = list
        .map((cand, i) => ({ cand, i }))
        .sort((a, b) => (b.cand.priority - a.cand.priority) || (a.i - b.i))
        .map(x => x.cand);

    const available = Math.max(0, Number(c.budget) - Number(c.reserveForOutput) - Number(baseTokens));
    const included = [];
    const dropped = [];
    let usedTokens = 0;

    for (const cand of ordered) {
        const fits = (usedTokens + cand.tokens) <= available;
        const underCap = included.length < Math.max(0, Number(c.maxEntries) || 0);
        if (fits && underCap) {
            included.push(cand);
            usedTokens += cand.tokens;
        } else {
            dropped.push(cand);
        }
    }
    return { included, dropped, usedTokens, available };
}

// ---------------------------------------------------------------- assembly

/** Format a single entry as `Entry N — <title>:\n<content>`. */
export function formatEntry(entry, index) {
    return `Entry ${index + 1} — ${entry.title}:\n${entry.content}`;
}

/**
 * Assemble the injection preamble that stmemory.js prepends between the system
 * prompt and the scene text. Order: living-lorebook block (instruction + entries)
 * → error-control rules → (scene follows downstream). Returns '' when there is
 * nothing to add (no entries AND error control disabled), so the caller falls
 * back to the byte-identical upstream prompt.
 *
 * @param {Array} entries selected entries (from selectLivingEntries().included)
 * @param {Object} cfg resolved injection config
 * @returns {string}
 */
export function buildInjectionPreamble(entries, cfg) {
    const c = { ...INJECTION_DEFAULTS, ...(cfg || {}) };
    const list = Array.isArray(entries) ? entries : [];
    const blocks = [];

    if (list.length > 0) {
        const instruction = (typeof c.prompt === 'string' && c.prompt.trim())
            ? c.prompt.trim()
            : INJECTION_INSTRUCTION;
        const body = list.map((e, i) => formatEntry(e, i)).join('\n\n');
        blocks.push(
            '=== LIVING LOREBOOK (WHAT THE BOOK ALREADY KNOWS) ===\n' +
            instruction + '\n\n' +
            body + '\n' +
            '=== END LIVING LOREBOOK ==='
        );
    }

    if (c.errorControl) {
        blocks.push(
            '=== ERROR-CONTROL RULES ===\n' +
            ERROR_CONTROL_RULES + '\n' +
            '=== END ERROR-CONTROL RULES ==='
        );
    }

    return blocks.join('\n\n');
}

/**
 * End-to-end pure driver: prepare → select → assemble. The binding layer supplies
 * raw candidate entries (already filtered to living entries), the scene text, and
 * the base token count; this returns the preamble plus a report for the debug ring
 * buffer / review queue.
 *
 * @returns {{preamble:string, report:{included:Array, dropped:Array, usedTokens:number, available:number, eligible:number}}}
 */
export function assembleLivingContext({ rawEntries, sceneText, baseTokens = 0, cfg, countTokens = countTokensDefault }) {
    const c = { ...INJECTION_DEFAULTS, ...(cfg || {}) };
    const sceneNorm = normalizeForMatch(sceneText);

    const candidates = (Array.isArray(rawEntries) ? rawEntries : [])
        .map(e => prepareCandidate(e, { sceneNorm, cfg: c, countTokens }))
        .filter(Boolean);

    const { included, dropped, usedTokens, available } =
        selectLivingEntries(candidates, { cfg: c, baseTokens });

    const preamble = buildInjectionPreamble(included, c);
    return {
        preamble,
        report: {
            included: included.map(e => ({ title: e.title, constant: e.constant, matchCount: e.matchCount, tokens: e.tokens })),
            dropped: dropped.map(e => ({ title: e.title, constant: e.constant, matchCount: e.matchCount, tokens: e.tokens })),
            usedTokens,
            available,
            eligible: candidates.length,
        },
    };
}
