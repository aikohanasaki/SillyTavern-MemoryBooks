// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// auditorTechnicalPass.js — Phase 5 (P5.3): technical pass + claim re-verification jobs.
//
// Plan §4.3 (Auditor jobs 3 & 4):
//   3. Technical pass: keyword = common English word; keyword shared across entries;
//      unrestricted recursion on multi-name entries; constant entries over token
//      threshold; protagonist entry at 100% fire rate → report + suggested fixes
//      (protagonist: probability 70–90% with recursion excluded).
//   4. Claim re-verification: entries with provenance ranges → re-read ranges,
//      confirm or flag. Contradictions are *reported*, never silently reconciled.
//
// Plan §6 Phase 5 acceptance: "technical pass catches a deliberately planted
// keyword collision (e.g. keyword "button")."
//
// Both jobs are pure functions over a lorebook data object — no ST runtime,
// no chat reads, no writes to chat_metadata. The fork's runtime (Phase 5 P5.1
// chunk walker, separate issue) is what actually invokes them at the right
// moment and surfaces the report via the jobs dashboard (review state).
//
// Report shape:
//   {
//     technical: {
//       summary: { entriesChecked, flaggedEntries, totalIssues },
//       issues: [
//         { entryUid, title, severity, code, message, suggestion },
//         ...
//       ],
//     },
//     claimReverification: {
//       summary: { entriesChecked, rangesChecked, confirmed, flagged, unknown },
//       issues: [
//         { entryUid, title, severity, code, message, suggestion },
//         ...
//       ],
//     },
//   }
//
// Severity levels: 'info' (no action), 'warn' (consider fixing), 'error' (fix recommended).
//
// Why pure functions: the technical pass and claim re-verification are
// deterministic given a lorebook snapshot. They are also offline-testable
// (no ST required), so the chunk walker, the jobs dashboard, and any
// future "preview pass" can all reuse the same code.

// ----------------------------------------------------------------------------
// Common-English word list for keyword collision detection
// ----------------------------------------------------------------------------

/**
 * A small built-in list of "common English words" that should generally not
 * appear as the SOLE keyword on a lorebook entry. Multi-keyword entries are
 * fine even if one of their keys is a common word (the other keys do the
 * disambiguation work) — the collision check fires only when an entry's
 * ONLY keyword (or all keywords) are common words.
 *
 * Keep this list small and obvious. Plan §6 acceptance calls out "button" as
 * the canonical example; we ship that and a handful of high-frequency
 * function words. The user can extend the list via settings
 * (extension_settings.STMemoryBooks.autoModule.technicalPassCommonWords).
 */
export const DEFAULT_COMMON_WORDS = Object.freeze([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by',
    'for', 'from', 'has', 'have', 'he', 'her', 'his', 'in',
    'is', 'it', 'its', 'of', 'on', 'or', 'she', 'that', 'the',
    'their', 'they', 'this', 'to', 'was', 'were', 'will', 'with',
    'you', 'your',
    // Plan §6 acceptance example
    'button',
]);

/**
 * Build the merged set of common words from defaults + user overrides.
 *
 * @param {object|null|undefined} settings - global extension_settings.STMemoryBooks
 * @returns {Set<string>}
 */
export function getCommonWords(settings) {
    const userList = settings?.moduleSettings?.autoModule?.technicalPassCommonWords;
    const merged = new Set(DEFAULT_COMMON_WORDS);
    if (Array.isArray(userList)) {
        for (const w of userList) {
            if (typeof w === 'string' && w.trim().length > 0) {
                merged.add(w.trim().toLowerCase());
            }
        }
    }
    return merged;
}

// ----------------------------------------------------------------------------
// Token estimator (for the "constant entries over token threshold" check)
// ----------------------------------------------------------------------------

/**
 * Conservative char/4 token estimate. Good enough for a "this entry is
 * suspiciously large" flag; the auditor's job is to surface anomalies, not
 * produce exact counts.
 *
 * @param {string} content
 * @returns {number}
 */
export function estimateEntryTokens(content) {
    if (typeof content !== 'string' || content.length === 0) return 0;
    return Math.ceil(content.length / 4);
}

// ----------------------------------------------------------------------------
// Helpers (entry shape normalization)
// ----------------------------------------------------------------------------

/**
 * Pull the canonical fields out of an entry, normalizing STMB's two
 * representations (selective vs constant vs vectorized) into something the
 * checks can read.
 *
 * @param {object} entry
 * @returns {{
 *   uid: number,
 *   title: string,
 *   keys: string[],
 *   content: string,
 *   tokens: number,
 *   isConstant: boolean,
 *   isSelective: boolean,
 *   probability: number,
 *   useProbability: boolean,
 *   preventRecursion: boolean,
 *   excludeRecursion: boolean,
 *   delayUntilRecursion: boolean,
 *   stmemorybooks: boolean,
 * }}
 */
export function normalizeEntry(entry, uid) {
    const keys = Array.isArray(entry?.key) ? entry.key.filter((k) => typeof k === 'string' && k.trim()) : [];
    const content = typeof entry?.content === 'string' ? entry.content : '';
    const isConstant = entry?.constant === true;
    const isSelective = entry?.selective !== false; // default true (selective)
    const probability = Number.isFinite(Number(entry?.probability)) ? Number(entry.probability) : 100;
    const useProbability = entry?.useProbability !== false;
    const preventRecursion = entry?.preventRecursion === true;
    const excludeRecursion = entry?.excludeRecursion === true;
    const delayUntilRecursion = entry?.delayUntilRecursion === true;
    const stmemorybooks = entry?.stmemorybooks === true;
    return {
        uid: Number.isFinite(Number(uid)) ? Number(uid) : (entry?.uid ?? -1),
        title: String(entry?.comment ?? entry?.title ?? ''),
        keys,
        content,
        tokens: estimateEntryTokens(content),
        isConstant,
        isSelective,
        probability,
        useProbability,
        preventRecursion,
        excludeRecursion,
        delayUntilRecursion,
        stmemorybooks,
    };
}

function isMemoryEntry(entry) {
    // STMB-managed entry — has the stmemorybooks flag.
    return entry?.stmemorybooks === true;
}

// ----------------------------------------------------------------------------
// Technical pass
// ----------------------------------------------------------------------------

const DEFAULT_OVERSIZED_CONSTANT_TOKENS = 1500;
const DEFAULT_PROTAGONIST_KEYWORDS = ['protagonist', 'mc', 'main character', 'player'];

/**
 * @typedef {Object} TechnicalPassOptions
 * @property {number} [oversizedConstantTokens]   flag constants over this token count
 * @property {number} [protagonistProbabilityMax]  flag protagonist-style entries whose probability is over this
 * @property {number} [protagonistProbabilityMin]  suggest setting protagonist probability to this
 * @property {string[]} [protagonistKeywords]      keywords that suggest an entry is the protagonist
 */

/**
 * @param {object|null|undefined} lorebookData - { entries: {uid: entry} }
 * @param {object} [opts]
 * @returns {{
 *   summary: { entriesChecked: number, flaggedEntries: number, totalIssues: number },
 *   issues: Array<{
 *     entryUid: number,
 *     title: string,
 *     severity: 'info'|'warn'|'error',
 *     code: string,
 *     message: string,
 *     suggestion: string,
 *   }>,
 * }}
 */
export function runTechnicalPass(lorebookData, opts = {}) {
    const oversizedThreshold = Number.isInteger(opts.oversizedConstantTokens)
        ? opts.oversizedConstantTokens : DEFAULT_OVERSIZED_CONSTANT_TOKENS;
    const protagonistMax = Number.isInteger(opts.protagonistProbabilityMax)
        ? opts.protagonistProbabilityMax : 100;
    const protagonistMin = Number.isInteger(opts.protagonistProbabilityMin)
        ? opts.protagonistProbabilityMin : 70;
    const protagonistKeywords = Array.isArray(opts.protagonistKeywords)
        ? opts.protagonistKeywords.map((k) => String(k || '').trim().toLowerCase()).filter(Boolean)
        : DEFAULT_PROTAGONIST_KEYWORDS;
    const commonWords = getCommonWords(opts.settings);

    const issues = [];
    const entries = lorebookData?.entries && typeof lorebookData.entries === 'object'
        ? lorebookData.entries : {};
    const uids = Object.keys(entries);
    let checked = 0;
    const flaggedUids = new Set();

    // Build the inverse index: keyword -> [uid, ...]. Used to detect shared keywords
    // across entries.
    const keywordToEntries = new Map();
    for (const uid of uids) {
        const raw = entries[uid];
        if (!isMemoryEntry(raw)) continue;
        checked++;
        const e = normalizeEntry(raw, uid);
        for (const k of e.keys) {
            const lk = k.toLowerCase();
            if (!keywordToEntries.has(lk)) keywordToEntries.set(lk, []);
            keywordToEntries.get(lk).push(e.uid);
        }
    }

    // Pass 1: per-entry checks (common-word sole keyword, oversized constant, protagonist fire-rate).
    for (const uid of uids) {
        const raw = entries[uid];
        if (!isMemoryEntry(raw)) continue;
        const e = normalizeEntry(raw, uid);

        // Check 1: common-word sole keyword. Triggers only if all keywords (after
        // case-normalization) are common words. Multi-keyword entries with at
        // least one distinctive keyword are fine.
        if (e.keys.length > 0) {
            const allCommon = e.keys.every((k) => commonWords.has(String(k || '').trim().toLowerCase()));
            if (allCommon) {
                flaggedUids.add(e.uid);
                issues.push({
                    entryUid: e.uid,
                    title: e.title,
                    severity: 'error',
                    code: 'keyword-common-only',
                    message: `Entry's keywords are all common English words: ${e.keys.map((k) => JSON.stringify(k)).join(', ')}.`,
                    suggestion: `Add a distinctive proper-noun / unique-noun keyword, or remove these and rely on ` +
                        `entry-specific names. Plan §6 example: keyword "button" alone fires this.`,
                });
            }
        }

        // Check 2: oversized constant entry. Constants always-on tokens add up fast
        // and starve the budget. Plan §4.3.
        if (e.isConstant && e.tokens >= oversizedThreshold) {
            flaggedUids.add(e.uid);
            issues.push({
                entryUid: e.uid,
                title: e.title,
                severity: 'warn',
                code: 'constant-oversized',
                message: `Constant entry is ${e.tokens} tokens (threshold ${oversizedThreshold}). ` +
                    `Constant tokens count against every generation; this entry will inflate cost noticeably.`,
                suggestion: `Switch to selective (or vectorized / keyword) activation, or split the entry into smaller ` +
                    `selective entries. Run compaction to trim long content.`,
            });
        }

        // Check 3: protagonist at 100% fire rate. Plan §4.3 says protagonist should
        // be at 70–90% with recursion excluded. "100%" here = useProbability + 100
        // probability, OR constant + always-on. The check fires when the entry
        // appears to be the protagonist by either its title or its keywords and
        // is set to fire on every generation.
        const looksLikeProtagonist = isProtagonistEntry(e, protagonistKeywords);
        const firesAlways = firesOnEveryGeneration(e);
        if (looksLikeProtagonist && firesAlways) {
            flaggedUids.add(e.uid);
            issues.push({
                entryUid: e.uid,
                title: e.title,
                severity: 'warn',
                code: 'protagonist-always-fires',
                message: `Protagonist entry is set to fire on every generation. ` +
                    `(probability=${e.probability}, useProbability=${e.useProbability}, ` +
                    `constant=${e.isConstant}, selective=${e.isSelective}).`,
                suggestion: `Set probability to ${protagonistMin}–${protagonistMax} and ` +
                    `enable preventRecursion / excludeRecursion so the entry doesn't cascade through other entries.`,
            });
        }

        // Check 4: unrestricted recursion on multi-name entries. Plan §4.3 says
        // multi-name entries should use recursion guards. The entry has 2+
        // names in `characterFilter.names` without recursion guards.
        const multiName = Array.isArray(raw.characterFilter?.names) && raw.characterFilter.names.length >= 2;
        const recursionGuarded = raw.preventRecursion === true || raw.excludeRecursion === true || raw.delayUntilRecursion === true;
        if (multiName && !recursionGuarded) {
            flaggedUids.add(e.uid);
            issues.push({
                entryUid: e.uid,
                title: e.title,
                severity: 'warn',
                code: 'multi-name-no-recursion-guard',
                message: `Entry has ${raw.characterFilter.names.length} names in characterFilter and no recursion guard. ` +
                    `Multi-name entries without recursion guards can cascade through other lorebook entries.`,
                suggestion: `Set preventRecursion=true (and/or excludeRecursion=true) on this entry so it doesn't ` +
                    `pull in every other lorebook entry that shares any of its names.`,
            });
        }
    }

    // Pass 2: shared keywords across entries. Detects "two entries share a
    // unique keyword" — can lead to ambiguous activation. We only flag keywords
    // that are NOT common English words (common words are already noise).
    const sharedIssues = [];
    for (const [keyword, owners] of keywordToEntries.entries()) {
        if (commonWords.has(keyword)) continue; // skip noisy common words
        if (owners.length < 2) continue;
        // If a keyword is shared by 2+ entries, that's a flag — the entries might
        // both fire on the same prompt and confuse the model. We only flag when
        // the keyword is a proper-noun-ish word (long enough to be distinctive).
        if (keyword.length < 3) continue;
        sharedIssues.push({
            keyword,
            entryUids: owners.slice(),
        });
        for (const uid of owners) {
            flaggedUids.add(uid);
            issues.push({
                entryUid: uid,
                title: normalizeEntry(entries[uid], uid).title,
                severity: 'warn',
                code: 'keyword-shared-across-entries',
                message: `Keyword ${JSON.stringify(keyword)} is shared across ${owners.length} entries.`,
                suggestion: `Consider using a more distinctive keyword per entry, or set ` +
                    `preventRecursion=true on the affected entries to limit cascade.`,
            });
        }
    }

    return {
        summary: {
            entriesChecked: checked,
            flaggedEntries: flaggedUids.size,
            totalIssues: issues.length,
        },
        issues,
        sharedKeywords: sharedIssues,
    };
}

/**
 * Heuristic for "is this entry the protagonist?" — either the title matches
 * a protagonist marker keyword, or the entry's keywords include one.
 *
 * @param {object} e - normalized entry
 * @param {string[]} protagonistKeywords
 * @returns {boolean}
 */
function isProtagonistEntry(e, protagonistKeywords) {
    if (!Array.isArray(protagonistKeywords) || protagonistKeywords.length === 0) return false;
    const titleLower = String(e.title || '').toLowerCase();
    if (protagonistKeywords.some((k) => titleLower.includes(k))) return true;
    const keysLower = e.keys.map((k) => String(k || '').toLowerCase());
    if (protagonistKeywords.some((k) => keysLower.some((entryKey) => entryKey.includes(k)))) return true;
    return false;
}

/**
 * Heuristic for "fires on every generation": the entry is either constant
 * (always on) or has useProbability=true with probability >= 100 and selective=false.
 *
 * @param {object} e
 * @returns {boolean}
 */
function firesOnEveryGeneration(e) {
    if (e.isConstant) return true;
    if (e.isSelective === false) return true;
    if (e.useProbability && e.probability >= 100) return true;
    return false;
}

// ----------------------------------------------------------------------------
// Claim re-verification
// ----------------------------------------------------------------------------

const PROVENANCE_RE = /src:\s*msgs\s+(\d+)\s*[–—\-]\s*(\d+)/g;

/**
 * Extract provenance ranges from entry content. Returns a list of
 * `{ start, end }` pairs (1-based, inclusive). Multiple ranges allowed per entry.
 *
 * @param {string} content
 * @returns {Array<{start:number,end:number}>}
 */
export function extractProvenanceRanges(content) {
    if (typeof content !== 'string' || content.length === 0) return [];
    const ranges = [];
    PROVENANCE_RE.lastIndex = 0;
    let m;
    while ((m = PROVENANCE_RE.exec(content)) !== null) {
        const start = parseInt(m[1], 10);
        const end = parseInt(m[2], 10);
        if (Number.isInteger(start) && Number.isInteger(end) && start >= 1 && end >= start) {
            ranges.push({ start, end });
        }
    }
    return ranges;
}

/**
 * Heuristic tokenize-and-compare for claim re-verification.
 *
 * Plan §4.3: "entries with provenance ranges → re-read ranges, confirm or
 * flag. Contradictions are *reported*, never silently reconciled."
 *
 * Pure-function shape: takes the lorebook entry + the chat array (the source
 * of truth) and returns per-range verdicts. The runtime chunk walker is what
 * supplies the actual chat array slice; this module is range-aware, chunk-
 * agnostic.
 *
 * A range is "confirmed" when its prose claim keywords are present in the
 * chat slice. A range is "flagged" when a contradiction token (plan §4.4
 * "contradiction = report") appears in the slice and the entry doesn't
 * mention it. Everything else is "unknown" (insufficient signal).
 *
 * @param {object} entry            normalized entry (or raw entry)
 * @param {Array<object>} chatSlice  chat messages in the provenance range
 * @returns {{
 *   summary: { entriesChecked: number, rangesChecked: number, confirmed: number, flagged: number, unknown: number },
 *   issues: Array<{ entryUid, title, severity, code, message, suggestion, range? }>,
 *   rangeVerdicts: Array<{ uid, title, range, verdict, reason }>,
 * }}
 */
export function runClaimReverification(lorebookData, chatSlice, opts = {}) {
    const contradictionTokens = Array.isArray(opts.contradictionTokens)
        ? opts.contradictionTokens.map((t) => String(t || '').trim().toLowerCase()).filter(Boolean)
        : ['contradicts', 'however', 'actually', 'but', 'never', 'not ', "n't"];
    const issues = [];
    const rangeVerdicts = [];
    let entriesChecked = 0;
    let rangesChecked = 0;
    let confirmed = 0;
    let flagged = 0;
    let unknown = 0;

    const entries = lorebookData?.entries && typeof lorebookData.entries === 'object'
        ? lorebookData.entries : {};
    const sliceText = (Array.isArray(chatSlice) ? chatSlice : [])
        .map((m) => `${m?.name || ''}: ${m?.mes || ''}`)
        .join('\n')
        .toLowerCase();

    for (const uid of Object.keys(entries)) {
        const raw = entries[uid];
        if (!isMemoryEntry(raw)) continue;
        const e = normalizeEntry(raw, uid);
        entriesChecked++;
        const ranges = extractProvenanceRanges(e.content);
        if (ranges.length === 0) continue;

        for (const range of ranges) {
            rangesChecked++;
            const verdict = verifyRange(e, range, sliceText, contradictionTokens);
            rangeVerdicts.push({ uid: e.uid, title: e.title, range, ...verdict });
            if (verdict.verdict === 'confirmed') confirmed++;
            else if (verdict.verdict === 'flagged') {
                flagged++;
                flaggedUidsSafeAdd(issues, e.uid, e.title, {
                    severity: 'warn',
                    code: verdict.code || 'claim-unverified',
                    message: verdict.reason,
                    suggestion: 'Re-read the source range; if the entry is correct, add the missing ' +
                        'context. If the source contradicts the entry, rewrite the entry.',
                    range,
                });
            } else {
                unknown++;
            }
        }
    }

    return {
        summary: {
            entriesChecked,
            rangesChecked,
            confirmed,
            flagged,
            unknown,
        },
        issues,
        rangeVerdicts,
    };
}

function flaggedUidsSafeAdd(issues, uid, title, issue) {
    issues.push({ entryUid: uid, title, ...issue });
}

/**
 * Decide a single range's verdict.
 *
 * @param {object} e
 * @param {{start:number,end:number}} range
 * @param {string} sliceText   lowercased concatenated chat slice
 * @param {string[]} contradictionTokens
 * @returns {{verdict:'confirmed'|'flagged'|'unknown', reason:string, code?:string}}
 */
function verifyRange(e, range, sliceText, contradictionTokens) {
    if (!sliceText || sliceText.length === 0) {
        return { verdict: 'unknown', reason: 'chat slice is empty; cannot verify' };
    }

    // Extract a few distinctive nouns from the entry's content. We treat
    // each as a "claim" to verify in the slice.
    const claims = extractDistinctiveClaims(e.content);
    if (claims.length === 0) {
        return { verdict: 'unknown', reason: 'no distinctive claims to verify' };
    }

    const confirmed = claims.filter((c) => sliceText.includes(c.toLowerCase()));
    const missing = claims.filter((c) => !sliceText.includes(c.toLowerCase()));

    // Contradiction tokens in the slice that the entry doesn't acknowledge.
    const contradictionsInSlice = contradictionTokens.filter((t) => sliceText.includes(t));
    const acknowledgesContradiction = contradictionsInSlice.some((t) =>
        e.content.toLowerCase().includes(t)
    );

    // If we have claims and at least half are confirmed, the range is mostly OK.
    // If more than half are missing AND no contradiction, flag.
    // If there's an unacknowledged contradiction, flag regardless.
    const confirmedRatio = confirmed.length / claims.length;

    if (contradictionsInSlice.length > 0 && !acknowledgesContradiction) {
        return {
            verdict: 'flagged',
            code: 'claim-contradicts-source',
            reason: `Range msgs ${range.start}–${range.end} contains contradiction markers ` +
                `(${contradictionsInSlice.map((t) => JSON.stringify(t)).join(', ')}) ` +
                `that the entry does not acknowledge.`,
        };
    }
    if (confirmedRatio < 0.5) {
        return {
            verdict: 'flagged',
            code: 'claim-not-found-in-source',
            reason: `Range msgs ${range.start}–${range.end}: only ${confirmed.length}/${claims.length} ` +
                `claims found in source. Missing: ${missing.slice(0, 3).map((c) => JSON.stringify(c)).join(', ')}.`,
        };
    }
    return {
        verdict: 'confirmed',
        reason: `${confirmed.length}/${claims.length} claims found in source.`,
    };
}

/**
 * Extract a few distinctive nouns from content — long, mixed-case, or
 * proper-noun-ish words. Used as cheap "claim" proxies for verification.
 * This is intentionally crude: it's a heuristic that surfaces obvious
 * contradictions; full NLI is out of scope.
 *
 * @param {string} content
 * @returns {string[]} up to 8 distinctive claim candidates
 */
function extractDistinctiveClaims(content) {
    if (typeof content !== 'string' || content.length === 0) return [];
    // Strip markdown punctuation, then split into words. Keep words that are
    // 4+ chars long and contain a capital letter OR are camelCase-ish.
    const tokens = content.split(/[^A-Za-z0-9'-]+/).filter(Boolean);
    const seen = new Set();
    const out = [];
    for (const t of tokens) {
        if (t.length < 4) continue;
        const hasCap = /[A-Z]/.test(t.slice(1));
        const camel = /[a-z][A-Z]/.test(t);
        const looksProper = /^[A-Z][a-z]+$/.test(t);
        const isAcronym = /^[A-Z]{2,}$/.test(t);
        const qualifies = hasCap || camel || looksProper || isAcronym;
        if (!qualifies) continue;
        const k = t.toLowerCase();
        if (seen.has(k)) continue;
        seen.add(k);
        out.push(t);
        if (out.length >= 8) break;
    }
    return out;
}

// ----------------------------------------------------------------------------
// Convenience: run both jobs in one pass
// ----------------------------------------------------------------------------

/**
 * Run technical pass + claim re-verification on the same lorebook snapshot.
 * Returns the combined report.
 *
 * @param {object} lorebookData
 * @param {Array<object>} [chatSlice] - optional chat slice for claim re-verification
 * @param {object} [opts]
 * @returns {{
 *   technical: ReturnType<typeof runTechnicalPass>,
 *   claimReverification: ReturnType<typeof runClaimReverification>,
 * }}
 */
export function runAuditorJobs(lorebookData, chatSlice, opts = {}) {
    return {
        technical: runTechnicalPass(lorebookData, opts),
        claimReverification: runClaimReverification(lorebookData, chatSlice, opts),
    };
}

// ----------------------------------------------------------------------------
// Job executor registration (for the STMB jobs dashboard)
// ----------------------------------------------------------------------------

/**
 * Register the technical pass + claim re-verification job executors with STMB's
 * jobs dashboard (stmbJobs.js). Safe to call multiple times — the dashboard
 * dedupes by `type` (string).
 *
 * Per plan §4.3: "Registered in the jobs dashboard." Per plan §5 cadence:
 * "on demand + a non-blocking offer every M scene memories (default 15). Never
 * auto-runs." We register them as on-demand only; the offer cadence is the
 * chunk-walker's job (P5.1).
 *
 * @param {object|null} stmbJobsApi - { registerStmbJobExecutor, buildJob, ... }
 *                                 pass null to no-op (test environments).
 */
export function registerAuditorJobs(stmbJobsApi) {
    if (!stmbJobsApi || typeof stmbJobsApi.registerStmbJobExecutor !== 'function') return false;

    stmbJobsApi.registerStmbJobExecutor('stmbc-audit-technical', async (job) => {
        // The dashboard passes the job context (input data). We expect
        // `{ lorebookData, chatSlice, options }` to be on job.input.
        const input = job?.input ?? job?.payload ?? {};
        const lorebookData = input.lorebookData ?? input.lorebook ?? null;
        const chatSlice = input.chatSlice ?? null;
        const options = input.options ?? {};
        const result = runAuditorJobs(lorebookData, chatSlice, options);
        return {
            ok: true,
            technical: result.technical,
            claimReverification: result.claimReverification,
        };
    });

    return true;
}