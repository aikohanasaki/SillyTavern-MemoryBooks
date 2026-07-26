// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// STMB-Auto fork — Clipper+ core, pure logic (Phase 3, task P3.1).
// Plan: eval/materials/stmb-auto/stmb-auto-plan.md §4.2 (Clipper+) and §4.5
// (settings). Entry conventions: Appendix B "Technical defaults".
//
// This file holds the dependency-injected, SillyTavern-free core so it is
// unit-testable under node:test (see clipperPlus.test.js), exactly like the
// sentinel core (sentinelCore.js) and the eval harness. The runtime binding
// that wires real chat/settings/profile/LLM/world-info functions lives in
// clipperPlus.js.
//
// Clipper+ leaves the upstream clip entry untouched (human taste stays in the
// quote) and, on save, generates a PAIRED context entry: keyword-activated,
// recursion-proof, non-constant — the explanation costs tokens only when its
// keywords fire, while the quote stays cheap and always-on (plan §4.2).

// ---------------------------------------------------------------- defaults & prompt

/** Clipper+ defaults (plan §4.2, §4.5); all user-tunable via settings. */
export const CLIPPER_DEFAULTS = Object.freeze({
    enabled: false,       // off by default => upstream clip save is byte-identical
    surroundingK: 6,      // total messages of surrounding context captured (centered on the quote)
    truncate: 500,        // per-message character cap for the context window
    autoAccept: false,    // skip the editable confirm dialog and write directly
    maxBlurbWords: 50,    // hard cap on blurb length (plan: "<=50-word blurb")
    minKeywords: 3,       // preferred lower bound (plan: 3–6 proper nouns)
    maxKeywords: 6,       // hard cap on keyword count
    profile: null,        // generation profile index; null => STMB default profile
    prompt: null,         // override for CLIPPER_PROMPT (global or per-chat)
});

/** Distinct title suffix for the paired context entry. Deliberately NOT the
 *  clip suffix (' [STMB Clip]') so the context entry is never mistaken for a
 *  clip entry by clipManager's `isClipEntryTitle` / compaction / clip lists,
 *  while still cross-referencing the quote by sharing its headline (plan §4.2).
 */
export const CLIP_CONTEXT_TITLE_SUFFIX = ' [STMB Clip Context]';

/** Baseline blurb-generation prompt (plan §4.2, §5 error-control rules). User-editable. */
export const CLIPPER_PROMPT =
`You are a lorebook context writer. A reader highlighted a QUOTE from a story.
Using ONLY the SURROUNDING MESSAGES provided, write a short context entry that
explains the quote's scene so a future reader understands what is happening, who
is involved, and why it matters. Do not invent facts not present in the
messages; if something is unstated, leave it out (never guess). If the messages
contradict each other, describe what is certain and omit the rest.

Return ONLY a JSON object with exactly these keys:
  "blurb": one paragraph of AT MOST 50 words explaining the quote's scene,
  "keywords": an array of 3 to 6 PROPER NOUNS (names of characters, places, or
              things) drawn from the quote and surrounding messages — these
              activate the entry, so prefer distinctive names over common words,
  "headline": a short scene title of at most 8 words.
No prose outside the JSON object, no code fences.`;

/** Reprimand appended on the single retry when the first reply is not strict JSON. */
export const JSON_ONLY_REPRIMAND =
    'Reply with ONLY a JSON object {"blurb":"…","keywords":["…"],"headline":"…"}. No prose, no code fences.';

// ---------------------------------------------------------------- config

/**
 * Merge Clipper+ configuration from global settings and per-chat metadata over
 * the defaults. Global lives at extension_settings.STMemoryBooks.autoModule.clipper
 * (nested under the auto-module key, alongside the sentinel keys — plan §4.5);
 * per-chat at chat_metadata.stmbc.clipper. Per-chat wins over global. Returns the
 * merged config including the resolved `enabled` flag (off by default).
 */
export function resolveClipperConfig(global, perChat) {
    const g = (global && global.clipper) || {};
    const p = (perChat && perChat.clipper) || {};
    const cfg = { ...CLIPPER_DEFAULTS };

    for (const key of ['surroundingK', 'truncate', 'profile', 'maxBlurbWords', 'minKeywords', 'maxKeywords']) {
        if (g[key] != null) cfg[key] = g[key];
    }
    if (typeof g.prompt === 'string' && g.prompt.trim()) cfg.prompt = g.prompt;
    if (typeof p.prompt === 'string' && p.prompt.trim()) cfg.prompt = p.prompt;
    if (typeof g.autoAccept === 'boolean') cfg.autoAccept = g.autoAccept;
    if (typeof p.autoAccept === 'boolean') cfg.autoAccept = p.autoAccept;

    cfg.enabled = (typeof p.enabled === 'boolean') ? p.enabled : !!g.enabled;
    return cfg;
}

// ---------------------------------------------------------------- source location

/** Normalize to lowercase alphanumeric tokens for robust substring matching
 *  across markdown/macro/whitespace differences between a DOM selection and the
 *  raw `chat[i].mes`. */
export function normalizeForMatch(text) {
    return String(text ?? '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Locate the chat message the highlighted quote came from by normalized
 * substring match. Precision over recall (plan §5.2): a quote maps to exactly
 * ONE message, so return that index only on a unique match — return -1 on no
 * match OR on ambiguity (>1 message contains the needle). A wrong source yields
 * wrong provenance, which is worse than skipping the paired entry entirely.
 *
 * The needle is capped at 80 normalized chars so trailing render differences
 * (macros expanded in the DOM, trimmed markdown) don't defeat a real highlight;
 * very short quotes normalize to a short needle that is inherently ambiguous and
 * will correctly resolve to -1 when it collides.
 *
 * @returns {number} chat index, or -1 when not uniquely locatable.
 */
export function findSourceMessageIndex(chat, quote) {
    if (!Array.isArray(chat)) return -1;
    const full = normalizeForMatch(quote);
    if (!full) return -1;
    const needle = full.length > 80 ? full.slice(0, 80) : full;

    let found = -1;
    for (let i = 0; i < chat.length; i++) {
        const m = chat[i];
        if (!m || m.is_system) continue;
        const hay = normalizeForMatch(m.mes);
        if (hay && hay.includes(needle)) {
            if (found !== -1) return -1; // ambiguous — refuse to guess
            found = i;
        }
    }
    return found;
}

// ---------------------------------------------------------------- context window

/**
 * Capture the K messages surrounding the source (centered on it, clamped to the
 * chat bounds). Hidden/system messages (is_system) are skipped — not narrative —
 * but every kept message retains its true chat index as `id`, so provenance
 * ranges stay in chat-index space (matching the sentinel).
 *
 * @returns {{start:number, end:number, source:number, messages:Array<{id:number,speaker:string,rawText:string}>}}
 */
export function buildContextWindow(chat, sourceIdx, K) {
    const k = Math.max(1, Number(K) || 1);
    const before = Math.floor((k - 1) / 2);
    const after = (k - 1) - before;
    const start = Math.max(0, sourceIdx - before);
    const end = Math.min(chat.length - 1, sourceIdx + after);

    const messages = [];
    for (let i = start; i <= end; i++) {
        const m = chat[i];
        if (!m || m.is_system) continue;
        const speaker = String(m.name || (m.is_user ? 'User' : 'Narrator'));
        messages.push({ id: i, speaker, rawText: String(m.mes ?? '') });
    }
    return { start, end, source: sourceIdx, messages };
}

/** Collapse whitespace and truncate a single message to `limit` chars (+ ellipsis). */
export function truncateMessage(text, limit) {
    const flat = String(text ?? '').replace(/\s+/g, ' ').trim();
    const lim = Math.max(1, Number(limit) || 1);
    return flat.length > lim ? flat.slice(0, lim) + '…' : flat;
}

/**
 * Format the context window as `[id] Speaker: text…` lines. Unlike the sentinel
 * detector, header/time/location stamps are KEPT — they are useful scene context
 * for the blurb — only per-message length is capped.
 */
export function formatContextWindow(messages, truncate) {
    return (Array.isArray(messages) ? messages : [])
        .map(m => `[${m.id}] ${m.speaker}: ${truncateMessage(m.rawText, truncate)}`)
        .join('\n');
}

/** Build the full generation prompt: instruction, the quote, and the numbered window. */
export function buildBlurbPrompt({ systemPrompt, quote, windowText }) {
    const instruction = (typeof systemPrompt === 'string' && systemPrompt.trim())
        ? systemPrompt
        : CLIPPER_PROMPT;
    return `${instruction}\n\nQUOTE:\n${String(quote ?? '').trim()}\n\nSURROUNDING MESSAGES:\n${windowText}`;
}

// ---------------------------------------------------------------- response parsing

/** Count whitespace-delimited words. */
export function wordCount(text) {
    return String(text ?? '').trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Clamp a blurb to at most `maxWords` words (appending an ellipsis when cut).
 * The prompt asks for ≤50 words; generation is fuzzy, so we enforce the cap
 * rather than reject an otherwise-good blurb.
 */
export function clampBlurb(blurb, maxWords) {
    const words = String(blurb ?? '').trim().split(/\s+/).filter(Boolean);
    const cap = Math.max(1, Number(maxWords) || 1);
    if (words.length <= cap) return words.join(' ');
    return words.slice(0, cap).join(' ') + '…';
}

/**
 * Dedupe (case-insensitive, first-wins), drop empties / over-long tokens, and
 * cap to `cap` keywords. Proper-noun selection is the model's job (per the
 * prompt); this only guards against junk and duplicates.
 */
export function sanitizeKeywords(list, cap = CLIPPER_DEFAULTS.maxKeywords) {
    const seen = new Set();
    const out = [];
    const limit = Math.max(1, Number(cap) || 1);
    for (const raw of Array.isArray(list) ? list : []) {
        const k = String(raw ?? '').trim();
        if (!k || k.length > 60) continue;
        const key = k.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(k);
        if (out.length >= limit) break;
    }
    return out;
}

/**
 * Parse the blurb-generation reply into { blurb, headline, keywords } or null.
 * Accepts strict JSON, a single markdown code fence, or one `{…}` object
 * embedded in surrounding prose (models add these even when told not to).
 * Returns null when there is no usable blurb — the caller then skips (never
 * guesses, plan §5.2). Keyword sanitation / blurb clamping happen downstream.
 */
export function parseBlurbResponse(reply) {
    if (typeof reply !== 'string') return null;
    let s = reply.trim();
    const fence = /^```(?:json)?\s*([\s\S]*?)\s*```$/.exec(s);
    if (fence) s = fence[1].trim();
    if (!s.startsWith('{')) {
        const m = /\{[\s\S]*\}/.exec(s);
        if (m) s = m[0];
    }
    let obj;
    try {
        obj = JSON.parse(s);
    } catch {
        return null;
    }
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;

    const blurb = typeof obj.blurb === 'string' ? obj.blurb.trim() : '';
    if (!blurb) return null;
    const headline = typeof obj.headline === 'string' ? obj.headline.trim() : '';
    const keywords = Array.isArray(obj.keywords)
        ? obj.keywords.filter(k => typeof k === 'string')
        : [];
    return { blurb, headline, keywords };
}

// ---------------------------------------------------------------- paired entry shaping

/** Strip any accidental clip suffix from a generated headline so the context
 *  title never ends up looking like a clip entry. */
export function sanitizeHeadline(headline, fallback = 'Clip') {
    const clean = String(headline ?? '')
        .replace(/\[STMB Clip[^\]]*\]/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
    return clean || fallback;
}

/** Title for the paired context entry: `<headline> [STMB Clip Context]`. Shares
 *  the quote's headline (cross-reference) but a distinct suffix (plan §4.2). */
export function buildContextEntryTitle(headline, fallback = 'Clip') {
    return `${sanitizeHeadline(headline, fallback)}${CLIP_CONTEXT_TITLE_SUFFIX}`;
}

/**
 * Content for the paired context entry: the blurb, a cross-reference to the
 * quote entry, and a provenance line `src: msgs X–Y` (plan §4.2, §5 error rules).
 */
export function buildContextEntryContent(blurb, srcStart, srcEnd, quoteTitle) {
    const a = Number(srcStart), b = Number(srcEnd);
    const range = Number.isFinite(a) && Number.isFinite(b)
        ? (a === b ? `${a}` : `${a}–${b}`)
        : '?';
    const lines = [String(blurb ?? '').trim(), ''];
    if (quoteTitle) lines.push(`Context for clip: ${String(quoteTitle).trim()}`);
    lines.push(`src: msgs ${range}`);
    return lines.join('\n');
}

/**
 * Fold a parsed generation result plus the located source window into the exact
 * fields the paired context entry needs. Returns null when unusable (no blurb,
 * or no keywords after sanitation — a keyword entry with no keys would never
 * fire and only clutter the book, plan §5.2).
 *
 * @returns {{title:string, content:string, keywords:string[], blurb:string, headline:string}|null}
 */
export function buildPairedEntry({ parsed, cfg, quoteHeadline, quoteTitle, srcStart, srcEnd }) {
    if (!parsed || !parsed.blurb) return null;
    const c = { ...CLIPPER_DEFAULTS, ...(cfg || {}) };

    const blurb = clampBlurb(parsed.blurb, c.maxBlurbWords);
    const keywords = sanitizeKeywords(parsed.keywords, c.maxKeywords);
    if (keywords.length === 0) return null;

    const headline = sanitizeHeadline(parsed.headline || quoteHeadline, quoteHeadline || 'Clip');
    const title = buildContextEntryTitle(headline, quoteHeadline || 'Clip');
    const content = buildContextEntryContent(blurb, srcStart, srcEnd, quoteTitle);
    return { title, content, keywords, blurb, headline };
}
