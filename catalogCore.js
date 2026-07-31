// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// STMB-Auto fork — Entry catalog / retrieval index, pure logic (Phase 7,
// task P7.1). Plan: PHA-1633 §Architecture 1 ("compact per-entry index —
// title, entity names, 1-line summary, token size — built/refreshed as a
// byproduct of the Auditor coverage job + on entry writes").
//
// This is the compact index the librarian (P7.2) selects FROM. It is not the
// lorebook and it is never injected wholesale: it is a per-entry row of
// `{uid, kind, title, names, summary, tokens}` sized so the whole thing fits
// inside chat_metadata and inside one cheap-profile prompt.
//
// TWO HARD RULES, both from the phase's prime constraint (fail-open, zero
// generation interference):
//   1. NO LLM CALLS AT READ TIME. Every summary here is derived by
//      deterministic string surgery over the entry's own content at
//      write/refresh time. Building a catalog costs zero tokens and zero
//      latency, so a librarian turn never waits on catalog construction.
//   2. NO SILENT CAPS (plan §4.3). When the serialized catalog would exceed
//      the chat_metadata budget we shrink summaries first, and only then drop
//      rows — recording every dropped uid in `catalog.dropped` and setting
//      `catalog.truncated`. A caller can always tell coverage was reduced.
//
// Dependency-injected and SillyTavern-free so it runs under node:test (see
// catalogCore.test.js), exactly like the other Phase cores (sentinelCore.js,
// injectionCore.js, reviewCore.js, clipperPlusCore.js). The runtime binding
// that touches chat_metadata / loadWorldInfo lives in catalog.js.

import { extractEntryEntityNames } from './auditorJobsCore.js';
import { estimateEntryTokens } from './auditorTechnicalPass.js';
import { CLIP_CONTEXT_TITLE_SUFFIX } from './clipperPlusCore.js';

// ---------------------------------------------------------------- version

/**
 * Bump when a row's shape changes in a way that makes an older stored catalog
 * unusable. `diffCatalog` reports a version mismatch as stale, so a stored
 * catalog from an older fork build is rebuilt on the next refresh instead of
 * being read with the wrong field names.
 */
export const CATALOG_VERSION = 1;

// ---------------------------------------------------------------- defaults

/**
 * Catalog defaults; all user-tunable via
 * extension_settings.STMemoryBooks.autoModule.catalog (global) and
 * chat_metadata.stmbc.catalog config (per-chat), same as every other module.
 *
 * `maxSerializedBytes` is the chat_metadata budget. chat_metadata is
 * round-tripped into the chat file on every save, so the catalog has to stay
 * small in absolute terms rather than merely "smaller than the lorebook".
 * 64 KiB leaves the 52-entry / 92 KB-of-prose fixture lorebook at roughly a
 * fifth of budget while still holding several hundred entries.
 */
export const CATALOG_DEFAULTS = Object.freeze({
    enabled: true,
    maxSummaryChars: 140,   // 1-line summary target
    minSummaryChars: 60,    // floor when shrinking to fit the budget
    maxNames: 8,            // entity names carried per row
    maxNameChars: 48,
    maxSerializedBytes: 65536,
});

/** Entry kinds the catalog distinguishes. */
export const ENTRY_KINDS = Object.freeze({
    MEMORY: 'memory',
    CLIP: 'clip',
    CLIP_CONTEXT: 'clip-context',
    SIDEPROMPT: 'sideprompt',
    MANUAL: 'manual',
});

/**
 * Retrieval priority, lowest number = kept longest when the budget forces
 * drops. STMB-managed entries outrank hand-authored ones because a manual
 * world entry almost always carries its own keywords and therefore still gets
 * the guaranteed keyword-activation floor even when the librarian can't see
 * it; a memory entry the pipeline wrote may not.
 */
const KIND_PRIORITY = Object.freeze({
    [ENTRY_KINDS.MEMORY]: 0,
    [ENTRY_KINDS.CLIP_CONTEXT]: 1,
    [ENTRY_KINDS.CLIP]: 2,
    [ENTRY_KINDS.SIDEPROMPT]: 3,
    [ENTRY_KINDS.MANUAL]: 4,
});

/**
 * Merge catalog configuration from global settings and per-chat metadata over
 * the defaults. Per-chat wins over global — same contract as
 * `resolveReviewConfig` / `resolveClipperConfig`.
 */
export function resolveCatalogConfig(global, perChat) {
    const g = (global && global.catalog) || {};
    const p = (perChat && perChat.catalog) || {};
    const cfg = { ...CATALOG_DEFAULTS };
    for (const key of ['maxSummaryChars', 'minSummaryChars', 'maxNames', 'maxNameChars', 'maxSerializedBytes']) {
        if (Number.isFinite(g[key]) && g[key] > 0) cfg[key] = Math.floor(g[key]);
        if (Number.isFinite(p[key]) && p[key] > 0) cfg[key] = Math.floor(p[key]);
    }
    cfg.enabled = (typeof p.enabled === 'boolean')
        ? p.enabled
        : (typeof g.enabled === 'boolean' ? g.enabled : CATALOG_DEFAULTS.enabled);
    if (cfg.minSummaryChars > cfg.maxSummaryChars) cfg.minSummaryChars = cfg.maxSummaryChars;
    return cfg;
}

/** Merge a caller's per-call options over the defaults (build/refresh path). */
function withDefaults(opts) {
    const cfg = { ...CATALOG_DEFAULTS };
    for (const key of Object.keys(CATALOG_DEFAULTS)) {
        const v = opts?.[key];
        if (key === 'enabled') {
            if (typeof v === 'boolean') cfg.enabled = v;
        } else if (Number.isFinite(v) && v > 0) {
            cfg[key] = Math.floor(v);
        }
    }
    if (cfg.minSummaryChars > cfg.maxSummaryChars) cfg.minSummaryChars = cfg.maxSummaryChars;
    return cfg;
}

// ---------------------------------------------------------------- classification

/**
 * The clip suffix upstream's clip manager appends. Mirrored as a literal
 * rather than imported: `STMB_CLIP_TITLE_SUFFIX` lives in clipManager.js,
 * which pulls in the SillyTavern runtime and would break this core's
 * node:test purity. Keep the two in sync (clipManager.js:111).
 */
export const CLIP_TITLE_SUFFIX = ' [STMB Clip]';

/** Side-prompt entries are stamped with `STMB_sp_<key>_lastMsgId` / `_lastRunAt` (sidePrompts.js). */
const SIDE_PROMPT_FIELD_RE = /^STMB_sp_.+_last(?:MsgId|RunAt)$/;

/**
 * Classify an entry into the kinds the librarian cares about.
 *
 * Order matters: the memory flag is authoritative (addlore.js `isMemoryEntry`),
 * then the clip-context suffix — which must be tested BEFORE the clip suffix,
 * since a context entry's title ends in "[STMB Clip Context]" and a naive
 * substring test for "[STMB Clip" would claim both.
 *
 * @param {object|null|undefined} entry raw lorebook entry
 * @returns {'memory'|'clip'|'clip-context'|'sideprompt'|'manual'}
 */
export function classifyEntryKind(entry) {
    if (!entry || typeof entry !== 'object') return ENTRY_KINDS.MANUAL;
    if (entry.stmemorybooks === true) return ENTRY_KINDS.MEMORY;

    const title = String(entry.comment ?? entry.title ?? '').trimEnd();
    if (title.endsWith(CLIP_CONTEXT_TITLE_SUFFIX.trimStart())) return ENTRY_KINDS.CLIP_CONTEXT;
    if (title.endsWith(CLIP_TITLE_SUFFIX.trimStart())) return ENTRY_KINDS.CLIP;

    for (const key of Object.keys(entry)) {
        if (SIDE_PROMPT_FIELD_RE.test(key)) return ENTRY_KINDS.SIDEPROMPT;
    }
    return ENTRY_KINDS.MANUAL;
}

// ---------------------------------------------------------------- summary

/** Provenance stamps ("src: msgs 12–34") are metadata, not summary material. */
const PROVENANCE_RE = /src:\s*msgs\s+\d+\s*[–—-]\s*\d+/gi;
/** Leading markdown/quote/bullet furniture, stripped so summaries read as prose. */
const LINE_FURNITURE_RE = /^[\s>*#–—\-•]+/;

function collapseWhitespace(text) {
    return String(text ?? '').replace(/\s+/g, ' ').trim();
}

/**
 * Truncate to `max` characters on a word boundary where one is available in
 * the last 40% of the budget, else hard-cut. Always ends with an ellipsis when
 * anything was removed, so a consumer can tell a truncated summary from a
 * naturally short one.
 */
export function truncateAtWord(text, max) {
    const s = String(text ?? '');
    const limit = Math.max(1, Math.floor(Number(max) || 0));
    if (s.length <= limit) return s;
    const cut = s.slice(0, Math.max(1, limit - 1));
    const space = cut.lastIndexOf(' ');
    const base = space > Math.floor(limit * 0.6) ? cut.slice(0, space) : cut;
    return `${base.replace(/[\s,;:.–—-]+$/, '')}…`;
}

/**
 * Derive a 1-line summary from entry content with no LLM call.
 *
 * Lorebook entries in this fork come in two shapes and both have to summarize
 * usefully: field-style entries ("Name: …\nAge: …\nStatus: …", Appendix B's
 * templates and the fixture's world book) and prose-style entries (memories,
 * clip blurbs). Joining leading lines with "; " until the budget runs out
 * handles both — a field entry yields "Name: X; Age: Y", a prose entry yields
 * its opening sentence.
 *
 * @param {string} content
 * @param {number} [maxChars]
 * @returns {string}
 */
export function summarizeEntryContent(content, maxChars = CATALOG_DEFAULTS.maxSummaryChars) {
    const raw = String(content ?? '');
    if (!raw.trim()) return '';
    const limit = Math.max(1, Math.floor(Number(maxChars) || CATALOG_DEFAULTS.maxSummaryChars));

    const lines = raw
        .replace(PROVENANCE_RE, ' ')
        .split(/\r?\n/)
        .map((line) => collapseWhitespace(line.replace(LINE_FURNITURE_RE, '')))
        .filter(Boolean);
    if (lines.length === 0) return '';

    let out = '';
    for (const line of lines) {
        out = out ? `${out}; ${line}` : line;
        if (out.length >= limit) break;
    }
    return truncateAtWord(collapseWhitespace(out), limit);
}

// ---------------------------------------------------------------- fingerprint

/**
 * Stable 32-bit FNV-1a over the fields a row is derived from, suffixed with
 * the source length. Used only to answer "has this entry changed since the
 * catalog was built?", so a cheap hash plus a length discriminator is the
 * right trade — a collision would have to match both the hash and the exact
 * character count of title+keys+content.
 *
 * @param {object|null|undefined} entry
 * @returns {string}
 */
export function fingerprintEntry(entry) {
    const source = [
        String(entry?.comment ?? entry?.title ?? ''),
        (Array.isArray(entry?.key) ? entry.key : []).join(''),
        (Array.isArray(entry?.keysecondary) ? entry.keysecondary : []).join(''),
        classifyEntryKind(entry),
        entry?.disable === true ? '1' : '0',
        String(entry?.content ?? ''),
    ].join(' ');

    let hash = 0x811c9dc5;
    for (let i = 0; i < source.length; i++) {
        hash ^= source.charCodeAt(i) & 0xff;
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return `${source.length.toString(36)}.${hash.toString(36)}`;
}

// ---------------------------------------------------------------- rows

/**
 * Build one catalog row.
 *
 * Field names are short because every one of them is paid for on every entry
 * in the serialized chat_metadata blob: `n` = entity names, `s` = summary,
 * `t` = estimated tokens, `fp` = change fingerprint. `off` is present only on
 * disabled entries (absent means enabled) so the common case costs nothing.
 *
 * @param {object} entry raw lorebook entry
 * @param {number|string} uid
 * @param {object} [opts]
 * @returns {{uid:number, kind:string, title:string, n:string[], s:string, t:number, fp:string, off?:boolean}}
 */
export function buildCatalogRow(entry, uid, opts = {}) {
    const cfg = withDefaults(opts);
    const content = typeof entry?.content === 'string' ? entry.content : '';
    const names = extractEntryEntityNames(entry)
        .slice(0, cfg.maxNames)
        .map((name) => truncateAtWord(name, cfg.maxNameChars));

    const row = {
        uid: Number.isFinite(Number(uid)) ? Number(uid) : Number(entry?.uid ?? -1),
        kind: classifyEntryKind(entry),
        title: String(entry?.comment ?? entry?.title ?? ''),
        n: names,
        s: summarizeEntryContent(content, cfg.maxSummaryChars),
        t: estimateEntryTokens(content),
        fp: fingerprintEntry(entry),
    };
    if (entry?.disable === true) row.off = true;
    return row;
}

function summarizeStats(rows) {
    const byKind = {};
    let tokens = 0;
    for (const row of rows) {
        byKind[row.kind] = (byKind[row.kind] || 0) + 1;
        tokens += Number(row.t) || 0;
    }
    return { total: rows.length, byKind, tokens, bytes: 0 };
}

// ---------------------------------------------------------------- serialization

/** Serialize a catalog for storage in chat_metadata. */
export function serializeCatalog(catalog) {
    return JSON.stringify(catalog ?? null);
}

/**
 * UTF-8 byte length of an arbitrary string. `TextEncoder` is present in both
 * the browser and node, but fall back to a manual count so the core never
 * depends on a host global being available.
 */
export function byteLength(text) {
    const s = String(text ?? '');
    if (typeof TextEncoder === 'function') return new TextEncoder().encode(s).length;
    let bytes = 0;
    for (let i = 0; i < s.length; i++) {
        const code = s.codePointAt(i);
        if (code > 0xffff) { bytes += 4; i++; }
        else if (code > 0x7ff) bytes += 3;
        else if (code > 0x7f) bytes += 2;
        else bytes += 1;
    }
    return bytes;
}

/** Serialized size of the whole catalog, in bytes. */
export function catalogByteLength(catalog) {
    return byteLength(serializeCatalog(catalog));
}

/**
 * Stamp `catalog.stats.bytes` with the catalog's true serialized size.
 *
 * The number is a field of the object it measures, so writing it changes the
 * length — a naive single measurement is always wrong by the width of its own
 * digits, and the stored size would under-report the real chat_metadata cost.
 * Iterate to a fixed point instead; it converges in two passes (the digit
 * count stops growing), and the loop bound is a backstop, not the exit.
 *
 * @param {object} catalog
 * @returns {number} the true serialized byte length
 */
export function measureCatalog(catalog) {
    if (!catalog || typeof catalog !== 'object') return 0;
    catalog.stats = catalog.stats || { total: 0, byKind: {}, tokens: 0, bytes: 0 };
    let measured = catalogByteLength(catalog);
    for (let i = 0; i < 4 && catalog.stats.bytes !== measured; i++) {
        catalog.stats.bytes = measured;
        measured = catalogByteLength(catalog);
    }
    catalog.stats.bytes = measured;
    return measured;
}

/**
 * Bring a catalog inside its chat_metadata budget.
 *
 * Two ordered steps, cheapest loss first:
 *   1. Shrink every summary to `minSummaryChars`. Costs detail, loses no entry.
 *   2. Drop rows — lowest retrieval priority first, largest row first inside a
 *      priority band (a big row buys back the most budget per entry lost),
 *      uid ascending as the final tiebreak so the result is deterministic.
 *
 * Every dropped uid is recorded in `catalog.dropped` and `catalog.truncated`
 * is set: coverage reduction is always visible to the caller (plan §4.3, "no
 * silent caps"). Mutates and returns `catalog`.
 *
 * @param {object} catalog
 * @param {object} [opts]
 * @returns {object} the same catalog, now within budget where achievable
 */
export function fitCatalogToBudget(catalog, opts = {}) {
    const cfg = withDefaults(opts);
    if (!catalog || !Array.isArray(catalog.rows)) return catalog;

    catalog.stats = catalog.stats || summarizeStats(catalog.rows);
    let bytes = measureCatalog(catalog);
    if (bytes <= cfg.maxSerializedBytes) return catalog;

    // Step 1 — shrink summaries.
    for (const row of catalog.rows) {
        if (typeof row.s === 'string' && row.s.length > cfg.minSummaryChars) {
            row.s = truncateAtWord(row.s, cfg.minSummaryChars);
        }
    }
    catalog.shrunk = true;
    bytes = measureCatalog(catalog);
    if (bytes <= cfg.maxSerializedBytes) return catalog;

    // Step 2 — drop rows, worst-priority/largest first. `order` is snapshotted
    // before the first drop, so mutating `catalog.rows` inside the loop is safe.
    const order = catalog.rows
        .map((row) => ({ row, bytes: byteLength(JSON.stringify(row)) }))
        .sort((a, b) => (
            (KIND_PRIORITY[b.row.kind] ?? 9) - (KIND_PRIORITY[a.row.kind] ?? 9)
            || b.bytes - a.bytes
            || a.row.uid - b.row.uid
        ));

    for (const candidate of order) {
        if (bytes <= cfg.maxSerializedBytes) break;
        // Drop and re-measure exactly rather than subtracting the row estimate:
        // `dropped` grows as rows leave, so an estimate would drift below the
        // truth and could stop dropping while still over budget.
        catalog.rows = catalog.rows.filter((row) => row !== candidate.row);
        catalog.dropped.push(candidate.row.uid);
        catalog.truncated = true;
        catalog.stats = summarizeStats(catalog.rows);
        bytes = measureCatalog(catalog);
    }
    return catalog;
}

// ---------------------------------------------------------------- build

/**
 * Build the catalog for a lorebook.
 *
 * EVERY entry is catalogued, not just the STMB-managed ones. The acceptance
 * criterion is that every stmemorybooks / side-prompt / clip entry is present
 * — that holds — but the librarian selects across the whole bound lorebook, so
 * hand-authored world entries are indexed too and tagged `kind: 'manual'`. A
 * consumer that wants only pipeline-owned entries filters on `kind`; a
 * consumer that filtered them out here could never get them back.
 *
 * Disabled entries are kept and flagged `off: true` rather than skipped, for
 * the same reason: dropping them here would silently narrow coverage, and the
 * injector (P7.3) is the layer that knows whether a disabled entry may fire.
 *
 * @param {object|null|undefined} lorebookData - { entries: {uid: entry} }
 * @param {object} [opts]
 * @param {string} [opts.lorebookName]
 * @param {number} [opts.now] - injected timestamp (defaults to Date.now())
 * @param {string} [opts.reason] - what triggered the build ('entry-write', 'coverage', …)
 * @returns {{v:number, lorebook:string, builtAt:number, reason:string, rows:Array, dropped:number[], truncated:boolean, stats:object}}
 */
export function buildCatalog(lorebookData, opts = {}) {
    const cfg = withDefaults(opts);
    const entries = (lorebookData?.entries && typeof lorebookData.entries === 'object')
        ? lorebookData.entries : {};

    const rows = [];
    for (const uid of Object.keys(entries)) {
        const raw = entries[uid];
        if (!raw || typeof raw !== 'object') continue;
        rows.push(buildCatalogRow(raw, uid, cfg));
    }
    rows.sort((a, b) => a.uid - b.uid);

    const catalog = {
        v: CATALOG_VERSION,
        lorebook: String(opts.lorebookName ?? ''),
        builtAt: Number.isFinite(opts.now) ? Number(opts.now) : Date.now(),
        reason: String(opts.reason ?? ''),
        rows,
        dropped: [],
        truncated: false,
        stats: summarizeStats(rows),
    };
    return fitCatalogToBudget(catalog, cfg);
}

// ---------------------------------------------------------------- staleness

/**
 * Compare a stored catalog against live lorebook data.
 *
 * Rows the budget dropped are NOT reported as `added` — they are absent by
 * decision, not by drift, and reporting them would leave the catalog
 * permanently "stale" and rebuilding on every single write.
 *
 * @param {object|null|undefined} catalog
 * @param {object|null|undefined} lorebookData
 * @returns {{added:number[], changed:number[], removed:number[], unchanged:number, versionStale:boolean, missing:boolean, isStale:boolean}}
 */
export function diffCatalog(catalog, lorebookData) {
    const entries = (lorebookData?.entries && typeof lorebookData.entries === 'object')
        ? lorebookData.entries : {};
    const rows = Array.isArray(catalog?.rows) ? catalog.rows : [];
    const missing = !catalog || !Array.isArray(catalog.rows);
    const versionStale = !missing && catalog.v !== CATALOG_VERSION;

    const byUid = new Map(rows.map((row) => [String(row.uid), row]));
    const droppedUids = new Set((Array.isArray(catalog?.dropped) ? catalog.dropped : []).map(String));

    const added = [];
    const changed = [];
    const removed = [];
    let unchanged = 0;

    for (const uid of Object.keys(entries)) {
        const raw = entries[uid];
        if (!raw || typeof raw !== 'object') continue;
        const row = byUid.get(String(uid));
        if (!row) {
            if (!droppedUids.has(String(uid))) added.push(Number(uid));
            continue;
        }
        if (row.fp !== fingerprintEntry(raw)) changed.push(Number(uid));
        else unchanged++;
    }
    for (const row of rows) {
        if (!Object.prototype.hasOwnProperty.call(entries, String(row.uid))) removed.push(row.uid);
    }

    added.sort((a, b) => a - b);
    changed.sort((a, b) => a - b);
    removed.sort((a, b) => a - b);

    return {
        added,
        changed,
        removed,
        unchanged,
        versionStale,
        missing,
        isStale: missing || versionStale || added.length > 0 || changed.length > 0 || removed.length > 0,
    };
}

/**
 * Refresh a catalog against live lorebook data, rebuilding only when the diff
 * says something actually moved (or `opts.force`).
 *
 * The rebuild is a full rebuild rather than an in-place patch of the changed
 * rows: building a row is pure string work over content the caller already has
 * in memory, so a full pass on a few hundred entries is cheaper than carrying
 * the incremental-state bugs — and it keeps the budget-fitting decision
 * (which is global, not per-row) correct after every change.
 *
 * @param {object|null|undefined} catalog
 * @param {object|null|undefined} lorebookData
 * @param {object} [opts] - build options, plus `force`
 * @returns {{catalog:object, diff:object, rebuilt:boolean}}
 */
export function refreshCatalog(catalog, lorebookData, opts = {}) {
    const diff = diffCatalog(catalog, lorebookData);
    if (!diff.isStale && !opts.force) {
        return { catalog, diff, rebuilt: false };
    }
    return { catalog: buildCatalog(lorebookData, opts), diff, rebuilt: true };
}

// ---------------------------------------------------------------- rendering

/**
 * Render the catalog as the compact line list the librarian call (P7.2) puts
 * in its prompt. One line per entry, pipe-delimited, cheapest readable form:
 *
 *   12 | memory | 03 - The Siege | Brandon, Fort Bramblehold | ~410t | Prose…
 *
 * Kept here rather than in the librarian so the size a catalog costs *as a
 * prompt* can be measured from the same place it is measured as storage.
 *
 * @param {object|null|undefined} catalog
 * @param {object} [opts]
 * @param {string[]} [opts.kinds] - restrict to these kinds
 * @param {boolean} [opts.includeDisabled=false]
 * @returns {string[]}
 */
export function formatCatalogLines(catalog, opts = {}) {
    const kinds = Array.isArray(opts.kinds) && opts.kinds.length ? new Set(opts.kinds) : null;
    const includeDisabled = opts.includeDisabled === true;
    const rows = Array.isArray(catalog?.rows) ? catalog.rows : [];
    const lines = [];
    for (const row of rows) {
        if (kinds && !kinds.has(row.kind)) continue;
        if (row.off === true && !includeDisabled) continue;
        lines.push(`${row.uid} | ${row.kind} | ${row.title} | ${(row.n || []).join(', ')} | ~${row.t}t | ${row.s}`);
    }
    return lines;
}
