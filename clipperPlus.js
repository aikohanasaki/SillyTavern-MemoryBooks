// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// STMB-Auto fork — Clipper+ SillyTavern binding layer (Phase 3, task P3.2).
// Plan: eval/materials/stmb-auto/stmb-auto-plan.md §4.2 (Clipper+).
//
// Wires real SillyTavern chat/settings/profile/LLM/world-info functions into the
// pure core (clipperPlusCore.js). Registers itself as the
// `globalThis.STMBC.onClipSave` callback that the upstream clipManager.js hook
// (placed in Phase 1 at `clipManager.js:saveNewClip`) awaits. No upstream file
// is modified — the hook is a no-op until this module registers, so a fork
// build without clipperPlus.js behaves byte-identically to upstream.
//
// `maybeGeneratePairedContextEntry` is self-contained: it self-gates on the
// `autoModule.clipper.enabled` setting and swallows every error, so it can
// never break — or even delay-with-a-throw — the clip save. When Clipper+ is
// disabled the whole thing is a single early-return, keeping stock clip
// behaviour byte-identical (Phase 3 acceptance: "feature toggled off =
// byte-identical upstream behaviour").
//
// ---------------------------------------------------------------------------
// Phase 3 acceptance mapping (plan §4.2 + Appendix B)
// ---------------------------------------------------------------------------
//
//   "Paired context entry"             → `buildPairedEntry` builds an entry
//                                        with `key=[built.keywords]`,
//                                        `preventRecursion:true`,
//                                        `excludeRecursion:true`,
//                                        `constant:false`. (see upsert call)
//
//   "Keyword-activated"                → `entry.key = built.keywords`.
//   "preventRecursion + excludeRecursion"
//                                      → set on the entry overrides (recursion
//                                        must be off because the blurb names
//                                        multiple characters; without this one
//                                        clip cascades half the cast).
//
//   "Content = blurb + provenance `src: msgs X–Y`"
//                                      → `buildContextEntryContent` writes the
//                                        blurb, then `Context for clip: <title>`,
//                                        then `src: msgs X–Y`.
//
//   "Title cross-references the quote entry, never constant"
//                                      → `buildContextEntryTitle` returns
//                                        `<headline> [STMB Clip Context]`;
//                                        shares the quote headline (cross-ref)
//                                        and uses a DISTINCT suffix so it is
//                                        never mistaken for a clip entry by
//                                        `isClipEntryTitle` / compaction /
//                                        clip lists; the quote entry stays
//                                        the compaction target.
//
//   "Fires only on its keywords"       → keyword-activated + constant:false.
//   "Cascades nothing"                 → preventRecursion + excludeRecursion.
//   "Compaction still lists the quote entry"
//                                      → distinct title suffix keeps the
//                                        context entry out of compaction /
//                                        clip lists (which match `[STMB Clip]`,
//                                        not `[STMB Clip Context]`).
// ---------------------------------------------------------------------------

import { extension_settings } from '../../../extensions.js';
import { chat, chat_metadata } from '../../../../script.js';
import { Popup, POPUP_RESULT, POPUP_TYPE } from '../../../popup.js';
import { DOMPurify } from '../../../../lib.js';
import { escapeHtml } from '../../../utils.js';
import { requestCompletion } from './stmemory.js';
import { resolveEffectiveConnectionFromProfile, markStmbPopup } from './utils.js';
import { upsertLorebookEntryByTitle } from './addlore.js';
import {
    resolveClipperConfig,
    findSourceMessageIndex,
    buildContextWindow,
    formatContextWindow,
    buildBlurbPrompt,
    parseBlurbResponse,
    buildPairedEntry,
    sanitizeKeywords,
    JSON_ONLY_REPRIMAND,
} from './clipperPlusCore.js';

const LOG = 'STMemoryBooks: Clipper+';

// ---------------------------------------------------------------- registration

/**
 * Register the Clipper+ binding layer on `globalThis.STMBC`. The Phase 1
 * upstream hook in `clipManager.js:saveNewClip` already awaits
 * `globalThis.STMBC?.onClipSave?.({ lorebookName, lorebookData, dlg, headline,
 * title })` — this module fills that slot.
 *
 * Idempotent: re-registration overwrites (so live-reload during development
 * behaves correctly). Safe in the no-op fork case (the hook tolerates a
 * missing `STMBC.onClipSave`).
 */
function registerClipperPlusHook() {
    if (typeof globalThis === 'undefined') return;
    globalThis.STMBC = globalThis.STMBC || {};
    globalThis.STMBC.onClipSave = onClipSave;
    // Also expose onExtensionInit for future init-time work (e.g. settings
    // UI for the clipper namespace) — currently a no-op.
    if (typeof globalThis.STMBC.onExtensionInit !== 'function') {
        globalThis.STMBC.onExtensionInit = () => {};
    }
}
registerClipperPlusHook();

// ---------------------------------------------------------------- generation

/**
 * Resolve the generation connection from the configured Clipper+ profile, or
 * the STMB default profile. Unlike the sentinel (a cheap detection profile),
 * blurb writing is generative, so the default is the user's main STMB profile.
 */
function resolveGenerationConnection(cfg) {
    const settings = extension_settings.STMemoryBooks || {};
    const profiles = Array.isArray(settings.profiles) ? settings.profiles : [];
    let idx = Number(cfg.profile);
    if (!Number.isInteger(idx) || idx < 0 || idx >= profiles.length) {
        idx = Number(settings.defaultProfile ?? 0);
    }
    const profile = profiles[idx] || {};
    return resolveEffectiveConnectionFromProfile(profile);
}

/** Single-shot generation call bound to the resolved connection. */
async function generate(conn, prompt) {
    const { text } = await requestCompletion({
        api: conn.api,
        model: conn.model,
        endpoint: conn.endpoint,
        apiKey: conn.apiKey,
        reverseProxy: conn.reverseProxy,
        prompt,
        temperature: 0.4,           // light creativity for prose; still grounded
        extra: { max_tokens: 400 },
    });
    return text;
}

/**
 * One generation round: a single call, then one "JSON only" retry on parse
 * failure. Returns the parsed { blurb, headline, keywords } or null (skip —
 * never guess, plan §5.2). API errors propagate to the caller's try/catch.
 */
async function generatePaired(conn, basePrompt) {
    let reply = await generate(conn, basePrompt);
    let parsed = parseBlurbResponse(reply);
    if (parsed === null) {
        reply = await generate(conn, `${basePrompt}\n\n${JSON_ONLY_REPRIMAND}`);
        parsed = parseBlurbResponse(reply);
    }
    return parsed;
}

// ---------------------------------------------------------------- confirm dialog

/**
 * Small editable confirm dialog for the generated context entry. Returns the
 * (possibly edited) { blurb, keywords, headline } on accept, or null on skip.
 */
async function showConfirmDialog({ blurb, keywords, headline, quoteTitle }) {
    const html = DOMPurify.sanitize(`
        <h3>${escapeHtml('Clipper+ · paired context entry')}</h3>
        <div class="stmb-clip-modal">
            <div class="info_block">${escapeHtml('Reviewed context is saved as a keyword-activated entry paired with your clip. Edit or Skip.')}</div>
            <label class="world_entry_form_control">
                <h4>${escapeHtml('Headline')}</h4>
                <input id="stmbc-cp-headline" class="text_pole" type="text" value="${escapeHtml(headline)}" />
            </label>
            <label class="world_entry_form_control">
                <h4>${escapeHtml('Context blurb (≤50 words)')}</h4>
                <textarea id="stmbc-cp-blurb" class="text_pole stmb-clip-textarea">${escapeHtml(blurb)}</textarea>
            </label>
            <label class="world_entry_form_control">
                <h4>${escapeHtml('Keywords (comma-separated)')}</h4>
                <input id="stmbc-cp-keywords" class="text_pole" type="text" value="${escapeHtml(keywords.join(', '))}" />
            </label>
            <div class="info_block">${escapeHtml(`Paired with clip: ${quoteTitle}`)}</div>
        </div>
    `);

    const popup = new Popup(html, POPUP_TYPE.TEXT, '', {
        wide: true,
        allowVerticalScrolling: true,
        okButton: 'Save context',
        cancelButton: 'Skip',
    });
    markStmbPopup(popup);

    const result = await popup.show();
    if (result !== POPUP_RESULT.AFFIRMATIVE) return null;

    const dlg = popup.dlg;
    const editedHeadline = dlg?.querySelector('#stmbc-cp-headline')?.value?.trim() || headline;
    const editedBlurb = dlg?.querySelector('#stmbc-cp-blurb')?.value?.trim() || blurb;
    const editedKeywords = sanitizeKeywords(
        String(dlg?.querySelector('#stmbc-cp-keywords')?.value || '').split(','),
    );
    return {
        headline: editedHeadline,
        blurb: editedBlurb,
        keywords: editedKeywords.length ? editedKeywords : keywords,
    };
}

// ---------------------------------------------------------------- clip-save entry

/**
 * Phase 3 (P3.2) hook entry point. Wired into the upstream clipManager.js
 * `saveNewClip` via the `globalThis.STMBC.onClipSave` callback placed in
 * Phase 1 — there is no upstream file modification in this fork.
 *
 * The Phase 1 hook already passed `{ lorebookName, lorebookData, dlg, headline,
 * title }`; `dlg` carries the quote text in `#stmb-clip-text`, and `title` is
 * the upstream `[STMB Clip]`-suffixed title the clip entry will use. We derive
 * the parameters for `maybeGeneratePairedContextEntry` here and re-use the
 * same pure-logic builder + LLM + dialog flow as the original P3.1 binding.
 *
 * Self-gating and error-swallowing: any skip/failure returns quietly and
 * never affects the clip that is about to be saved.
 *
 * @param {{lorebookName:string, lorebookData:object, dlg:any, headline:string, title:string}} p
 */
export async function onClipSave({ lorebookName, lorebookData, dlg, headline, title: quoteTitle }) {
    try {
        const quote = (dlg && typeof dlg.querySelector === 'function')
            ? (dlg.querySelector('#stmb-clip-text')?.value || '')
            : '';

        const cfg = resolveClipperConfig(
            extension_settings?.STMemoryBooks?.autoModule,
            chat_metadata?.stmbc,
        );
        if (!cfg.enabled) return;
        if (!lorebookName || !lorebookData || !quote) return;

        // Locate the source message (unique normalized match, else skip — §5.2).
        const sourceIdx = findSourceMessageIndex(chat, quote);
        if (sourceIdx < 0) {
            console.debug(`${LOG}: source message not uniquely located; skipping paired entry`);
            return;
        }

        const win = buildContextWindow(chat, sourceIdx, cfg.surroundingK);
        if (win.messages.length === 0) return;
        const windowText = formatContextWindow(win.messages, cfg.truncate);
        const basePrompt = buildBlurbPrompt({ systemPrompt: cfg.prompt, quote, windowText });

        const parsed = await generatePaired(resolveGenerationConnection(cfg), basePrompt);
        if (parsed === null) {
            console.debug(`${LOG}: generation unparseable after retry; skipping paired entry`);
            return;
        }

        let built = buildPairedEntry({
            parsed,
            cfg,
            quoteHeadline: headline,
            quoteTitle,
            srcStart: win.start,
            srcEnd: win.end,
        });
        if (!built) {
            console.debug(`${LOG}: no usable blurb/keywords; skipping paired entry`);
            return;
        }

        // Editable confirm unless auto-accept. Re-fold user edits through the
        // same builder so the title/content/keyword rules stay consistent.
        if (!cfg.autoAccept) {
            const edited = await showConfirmDialog({
                blurb: built.blurb,
                keywords: built.keywords,
                headline: built.headline,
                quoteTitle,
            });
            if (!edited) {
                console.debug(`${LOG}: user skipped the paired context entry`);
                return;
            }
            built = buildPairedEntry({
                parsed: { blurb: edited.blurb, headline: edited.headline, keywords: edited.keywords },
                cfg,
                quoteHeadline: headline,
                quoteTitle,
                srcStart: win.start,
                srcEnd: win.end,
            });
            if (!built) {
                console.debug(`${LOG}: edited entry has no keywords; skipping`);
                return;
            }
        }

        // Write the paired context entry: keyword-activated, non-constant,
        // recursion-proof (a blurb naming several characters must not cascade
        // half the cast — plan §4.2, Appendix B).
        await upsertLorebookEntryByTitle(lorebookName, lorebookData, built.title, built.content, {
            defaults: { vectorized: true, selective: true, order: 100, position: 0 },
            entryOverrides: {
                constant: false,
                selective: true,
                vectorized: true,
                key: built.keywords,
                keysecondary: [],
                preventRecursion: true,
                excludeRecursion: true,
                disable: false,
            },
        });

        try {
            const toastr = globalThis.toastr;
            if (toastr?.success) toastr.success('Paired context entry added.', 'STMemoryBooks');
        } catch { /* toastr may be absent in some contexts */ }
        console.debug(`${LOG}: wrote paired context entry "${built.title}" (keys: ${built.keywords.join(', ')})`);
    } catch (err) {
        // Never break the clip save — the quote is about to be persisted.
        // Every "never guess" skip path above already `return`s before this
        // catch, so reaching here always means a genuine mid-job failure
        // (API call, lorebook write, …) — surface it (plan §6 P6.1: no
        // silent poisoning).
        console.error(`${LOG}: paired context entry failed`, err);
        try {
            const toastr = globalThis.toastr;
            if (toastr?.warning) {
                toastr.warning(
                    `Clipper+: paired context entry failed (${err?.message || err}). The clip itself was still saved.`,
                    'STMemoryBooks',
                );
            }
        } catch { /* toastr may be absent in some contexts */ }
    }
}

// Backwards-compatible export: the original P3.1 binding called this
// `maybeGeneratePairedContextEntry`. The Phase 3 hook now flows through
// `onClipSave` (the callback), but the helper is still exported for any
// caller that wants to drive it directly (e.g. tests, future `/stmbc-clip`
// slash command).
export async function maybeGeneratePairedContextEntry({ lorebookName, lorebookData, quote, headline, quoteTitle }) {
    return onClipSave({
        lorebookName,
        lorebookData,
        // Synthesize a minimal dlg so the quote is reachable via querySelector
        // (matches the upstream `dlg.querySelector('#stmb-clip-text')` shape).
        dlg: { querySelector: () => ({ value: quote || '' }) },
        headline,
        title: quoteTitle,
    });
}