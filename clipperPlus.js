// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// STMB-Auto fork — Clipper+ SillyTavern binding layer (Phase 3, task P3.1).
// Plan: eval/materials/stmb-auto/stmb-auto-plan.md §4.2.
//
// Wires real SillyTavern chat/settings/profile/LLM/world-info functions into the
// pure core (clipperPlusCore.js). Invoked by exactly ONE `STMBC-HOOK(clipper)`
// line in clipManager.js `saveNewClip()`, AFTER the upstream `[STMB Clip]` entry
// has been written. The upstream clip entry is never touched.
//
// maybeGeneratePairedContextEntry() is self-contained: it self-gates on the
// `autoModule.clipper.enabled` setting and swallows every error, so it can never
// break — or even delay-with-a-throw — the clip save. When Clipper+ is disabled
// the whole thing is a single early-return, keeping stock clip behavior
// byte-identical (Phase 3 acceptance).

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

/**
 * Resolve the generation connection from the configured Clipper+ profile, or the
 * STMB default profile. Unlike the sentinel (a cheap detection profile), blurb
 * writing is generative, so the default is the user's main STMB profile.
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

/**
 * Clip-save hook entry point (called from clipManager.js `saveNewClip`). Given
 * the just-saved quote's identifiers, generate and write the paired context
 * entry. Self-gating and error-swallowing: any skip/failure returns quietly and
 * never affects the clip that was already saved.
 *
 * @param {{lorebookName:string, lorebookData:object, quote:string, headline:string, quoteTitle:string}} p
 */
export async function maybeGeneratePairedContextEntry({ lorebookName, lorebookData, quote, headline, quoteTitle }) {
    try {
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
            toastr.success('Paired context entry added.', 'STMemoryBooks');
        } catch { /* toastr may be absent in some contexts */ }
        console.debug(`${LOG}: wrote paired context entry "${built.title}" (keys: ${built.keywords.join(', ')})`);
    } catch (err) {
        // Never break the clip save — the quote is already persisted.
        console.error(`${LOG}: paired context entry failed`, err);
    }
}
