// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// STMB-Auto fork — Phase 3 (Clipper+) offline acceptance harness.
// Plan: eval/materials/stmb-auto/stmb-auto-plan.md §4.2, Phase 3 acceptance.
//
// The Phase 3 acceptance criterion is:
//
//   "a highlighted quote yields the unchanged upstream clip entry *plus* the
//    paired context entry; context entry fires only on its keywords and cascades
//    nothing (verify with ST world-info debug); compaction still lists the quote
//    entry; upstream clip behavior with the feature toggled off is byte-identical."
//
// "verify with ST world-info debug" means a live SillyTavern. What is actually
// being verified there, though, is a *pure* property of the entry's world-info
// fields under ST's activation algorithm — so it can be verified offline against
// a faithful model of that algorithm, deterministically, in CI, instead of once
// by hand.
//
// This module provides:
//   - activateWorldInfo(): a small model of ST's world-info scan (constant
//     entries, keyword matching, `selective` + `keysecondary`, and the recursion
//     loop with `preventRecursion` / `excludeRecursion`).
//   - runPhase3Acceptance(): drives the REAL Clipper+ core end-to-end over a
//     stub LLM reply — locate source message, build the window, parse the reply,
//     shape the paired entry, apply buildEntryOverrides — writes both entries
//     into a fake lorebook, and then asserts the acceptance properties against
//     the activation model.
//
// The model is deliberately a model. Its value is that the harness includes a
// CONTROL entry — identical to the paired entry but without the recursion flags —
// which must cascade. If the model were too weak to show a cascade at all, the
// control fails and the harness reports itself untrustworthy rather than
// reporting a false pass.

import {
    resolveClipperConfig,
    findSourceMessageIndex,
    buildContextWindow,
    formatContextWindow,
    buildBlurbPrompt,
    parseBlurbResponse,
    buildPairedEntry,
    buildEntryOverrides,
} from '../clipperPlusCore.js';

// ---------------------------------------------------------------- WI activation model

/**
 * Does `entry` match anywhere in `text`?
 *
 * Mirrors ST's default: case-insensitive substring match on any primary key,
 * and — when `selective` is set AND `keysecondary` is non-empty — an additional
 * match on any secondary key. An empty `keysecondary` imposes no extra
 * requirement, which is why buildEntryOverrides leaves it empty.
 */
function entryMatches(entry, text) {
    const hay = String(text || '').toLowerCase();
    const keys = Array.isArray(entry.key) ? entry.key : [];
    if (keys.length === 0) return false;
    const primary = keys.some(k => k && hay.includes(String(k).toLowerCase()));
    if (!primary) return false;

    const secondary = Array.isArray(entry.keysecondary) ? entry.keysecondary : [];
    if (entry.selective && secondary.length > 0) {
        return secondary.some(k => k && hay.includes(String(k).toLowerCase()));
    }
    return true;
}

/**
 * Model ST's world-info activation over `entries` for a given chat `scanText`.
 *
 * Pass 0 scans the chat text. Each subsequent pass scans the content of entries
 * activated in the previous pass (this is "recursion"), subject to:
 *   - an entry with `preventRecursion` does not contribute its content to the
 *     next pass — it cannot cause other entries to fire;
 *   - an entry with `excludeRecursion` can only be activated from pass 0 — it
 *     cannot be pulled in by another entry's content;
 *   - `disable` entries never activate;
 *   - `constant` entries always activate on pass 0 regardless of keys.
 *
 * @returns {{activated: string[], byPass: string[][], passes: number}}
 *   entry comments (titles), in activation order, plus which pass each fired on.
 */
export function activateWorldInfo(entries, scanText, { maxPasses = 5 } = {}) {
    const pool = (Array.isArray(entries) ? entries : []).filter(e => e && !e.disable);
    const activated = new Set();
    const byPass = [];

    let scan = String(scanText || '');
    let pass = 0;

    while (pass < maxPasses) {
        const firedThisPass = [];
        for (const entry of pool) {
            if (activated.has(entry.comment)) continue;
            // excludeRecursion: only reachable from the initial chat scan.
            if (pass > 0 && entry.excludeRecursion) continue;
            const fires = (pass === 0 && entry.constant) || entryMatches(entry, scan);
            if (fires) {
                activated.add(entry.comment);
                firedThisPass.push(entry);
            }
        }
        byPass.push(firedThisPass.map(e => e.comment));
        if (firedThisPass.length === 0) break;

        // Next pass scans the content of what just fired — minus anything that
        // declares preventRecursion.
        scan = firedThisPass
            .filter(e => !e.preventRecursion)
            .map(e => String(e.content || ''))
            .join('\n');
        if (!scan.trim()) break;
        pass++;
    }

    return { activated: [...activated], byPass, passes: byPass.length };
}

// ---------------------------------------------------------------- fixture

/** A short chat whose message 3 contains the quote the user highlights. */
export function buildFixtureChat() {
    return [
        { name: 'Narrator', mes: 'The caravan reached Aldermoor at dusk, banners limp in the still air.' },
        { name: 'Brandon', mes: 'I want to see the archivist before the gates close.' },
        { name: 'Narrator', mes: 'Sera met them at the step, ink still wet on her fingers.' },
        { name: 'Sera', mes: 'The marble courtyard remembers every oath sworn on it, and the silver bell has not rung in nine years.' },
        { name: 'Brandon', mes: 'Then we ring it tonight.' },
        { name: 'Narrator', mes: 'Kestrel watched from the colonnade, saying nothing at all.' },
        { name: 'Sera', mes: 'You do not understand what that would wake.' },
    ];
}

/** The stub LLM reply — what the generation step would return for that quote. */
export const STUB_REPLY = JSON.stringify({
    blurb: 'At dusk in Aldermoor, Sera warns Brandon that the marble courtyard binds every oath sworn on it, and that the silver bell has stayed silent nine years. Kestrel watches from the colonnade without speaking.',
    keywords: ['marble courtyard', 'silver bell', 'Aldermoor'],
    headline: 'The bell that has not rung',
});

/**
 * Other entries already living in the lorebook. Their keywords appear inside the
 * generated blurb — this is precisely the plan §4.2 cascade scenario ("blurbs
 * name multiple characters; without this one clip cascades half the cast").
 */
export function buildExistingEntries() {
    return [
        { comment: 'Sera', key: ['Sera'], keysecondary: [], content: 'The archivist of Aldermoor.', constant: false, selective: true },
        { comment: 'Brandon', key: ['Brandon'], keysecondary: [], content: 'The caravan master.', constant: false, selective: true },
        { comment: 'Kestrel', key: ['Kestrel'], keysecondary: [], content: 'A watcher who says nothing.', constant: false, selective: true },
        { comment: 'Aldermoor', key: ['Aldermoor'], keysecondary: [], content: 'A walled town of oaths.', constant: false, selective: true },
    ];
}

// ---------------------------------------------------------------- the run

/**
 * Drive the real Clipper+ core over the fixture and return everything needed to
 * assert the Phase 3 acceptance properties.
 *
 * @param {{enabled?: boolean, autoAccept?: boolean, surroundingK?: number}} clipperSettings
 *   Written as the global `autoModule.clipper` object, exactly as the settings UI
 *   would write it.
 */
export function runPhase3Acceptance(clipperSettings = { enabled: true, autoAccept: true }) {
    const chat = buildFixtureChat();
    const quote = 'The marble courtyard remembers every oath sworn on it, and the silver bell has not rung in nine years.';
    const headline = 'The bell that has not rung';
    const quoteTitle = `${headline} [STMB Clip]`;

    const cfg = resolveClipperConfig({ clipper: clipperSettings }, {});

    // The upstream clip entry, shaped exactly as clipManager.saveNewClip shapes a
    // default (constant) clip. Clipper+ must never touch this.
    const clipEntry = {
        comment: quoteTitle,
        content: `=== ${headline} ===\n\n- ${quote}\n\n=== END ${headline} ===`,
        key: [],
        keysecondary: [],
        constant: true,
        vectorized: false,
        selective: false,
        disable: false,
        position: 0,
        order: 100,
    };
    const clipEntryBefore = JSON.stringify(clipEntry);

    const lorebook = [...buildExistingEntries(), clipEntry];

    // --- the gate. Off => nothing else happens at all. -----------------------
    if (!cfg.enabled) {
        return {
            enabled: false,
            lorebook,
            clipEntry,
            clipEntryUnchanged: JSON.stringify(clipEntry) === clipEntryBefore,
            pairedEntry: null,
            sourceIndex: null,
        };
    }

    // --- the real core path -------------------------------------------------
    const sourceIdx = findSourceMessageIndex(chat, quote);
    const win = buildContextWindow(chat, sourceIdx, cfg.surroundingK);
    const windowText = formatContextWindow(win.messages, cfg.truncate);
    const prompt = buildBlurbPrompt({ systemPrompt: cfg.prompt, quote, windowText });

    const parsed = parseBlurbResponse(STUB_REPLY);
    const built = buildPairedEntry({
        parsed, cfg, quoteHeadline: headline, quoteTitle,
        srcStart: win.start, srcEnd: win.end,
    });

    // Materialize the paired entry the way addlore.upsertLorebookEntryByTitle
    // would: create-defaults, then buildEntryOverrides applied last.
    const pairedEntry = {
        comment: built.title,
        content: built.content,
        key: [],
        keysecondary: [],
        disable: false,
        vectorized: true,
        selective: true,
        order: 100,
        position: 0,
        ...buildEntryOverrides(built.keywords),
    };
    lorebook.push(pairedEntry);

    // A CONTROL entry: same content and keywords, but without the recursion
    // flags. If this does not cascade, the activation model is too weak to prove
    // anything and the harness must fail loudly rather than pass silently.
    const controlEntry = {
        comment: 'CONTROL (no recursion flags)',
        content: built.content,
        key: built.keywords.slice(),
        keysecondary: [],
        constant: false,
        selective: true,
        vectorized: true,
        disable: false,
        preventRecursion: false,
        excludeRecursion: false,
    };

    return {
        enabled: true,
        prompt,
        windowText,
        sourceIndex: sourceIdx,
        window: win,
        parsed,
        built,
        lorebook,
        clipEntry,
        clipEntryUnchanged: JSON.stringify(clipEntry) === clipEntryBefore,
        pairedEntry,
        controlEntry,
        quote,
        quoteTitle,
    };
}
