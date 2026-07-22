// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// STMB-Auto fork — living-lorebook context injection, SillyTavern binding (P4.1).
// Plan: eval/materials/stmb-auto/stmb-auto-plan.md §4.4, §5.
//
// Wires the real bound lorebook / world-info / settings into the pure core
// (injectionCore.js). Invoked by exactly ONE `STMBC-HOOK(injection)` line in
// stmemory.js `buildPrompt()`, between the system prompt and the scene text.
//
// buildLivingContextPreamble() is self-contained: it self-gates on the
// `autoModule.injection.enabled` setting (default OFF) and swallows every error,
// returning '' so the caller falls back to the byte-identical upstream prompt.
// When injection is disabled — or on any failure — memory generation is
// unaffected (plan §1.2, §5.5 merge discipline; §5.2 never-poison).

import { extension_settings } from '../../../extensions.js';
import { chat_metadata } from '../../../../script.js';
import { METADATA_KEY, loadWorldInfo } from '../../../world-info.js';
import { isMemoryEntry } from './addlore.js';
import {
    resolveInjectionConfig,
    assembleLivingContext,
    countTokensDefault,
} from './injectionCore.js';

const LOG = 'STMemoryBooks: Injection';

/**
 * Gather the token-capped living entries the bound lorebook already knows
 * (constant + keyword-matched vs. the scene) and build the delta-not-rehash
 * preamble plus the error-control rules that ride on every generation prompt.
 *
 * @param {{compiledScene:object, profile:object, sceneText:string, systemPrompt:string}} p
 * @returns {Promise<string>} the preamble to prepend, or '' when disabled / nothing to add / on error
 */
export async function buildLivingContextPreamble({ compiledScene, sceneText, systemPrompt } = {}) {
    try {
        const global = extension_settings?.STMemoryBooks?.autoModule || {};
        const perChat = (typeof chat_metadata === 'object' && chat_metadata?.stmbc) || {};
        const cfg = resolveInjectionConfig(global, perChat);
        if (!cfg.enabled) return '';

        // Resolve the bound lorebook (same source of truth as the memory save path).
        const lorebookName = (typeof chat_metadata === 'object' && chat_metadata)
            ? chat_metadata[METADATA_KEY]
            : null;
        if (!lorebookName) return '';

        let lorebookData;
        try {
            lorebookData = await loadWorldInfo(lorebookName);
        } catch (e) {
            console.warn(`${LOG}: could not load bound lorebook "${lorebookName}"`, e);
            lorebookData = null;
        }
        const entriesObj = lorebookData?.entries;
        if (!entriesObj || typeof entriesObj !== 'object') {
            // No lorebook yet: still surface the error-control rules if enabled.
            return assembleLivingContext({ rawEntries: [], sceneText, baseTokens: 0, cfg }).preamble;
        }

        // Living candidates: enabled entries, excluding memory entries by default
        // (recent memories are already injected by upstream previousSummariesContext).
        const rawEntries = [];
        for (const entry of Object.values(entriesObj)) {
            if (!entry || entry.disable === true) continue;
            if (!cfg.includeMemoryEntries && isMemoryEntry(entry)) continue;
            rawEntries.push({
                title: entry.comment || '',
                content: entry.content || '',
                keys: Array.isArray(entry.key) ? entry.key : [],
                constant: !!entry.constant,
            });
        }

        // Match keywords against the actual scene transcript only (not the assembled
        // sceneText, which may carry additional-context headers), and budget against
        // the full base prompt the preamble sits between (plan §5.1 hard ~50K cap).
        const sceneMatchText = Array.isArray(compiledScene?.messages)
            ? compiledScene.messages.map(m => String(m?.mes ?? '')).join('\n')
            : String(sceneText ?? '');
        const baseTokens = countTokensDefault(`${systemPrompt ?? ''}\n\n${sceneText ?? ''}`);

        const { preamble, report } = assembleLivingContext({
            rawEntries,
            sceneText: sceneMatchText,
            baseTokens,
            cfg,
        });

        if (report.dropped.length > 0) {
            console.warn(`${LOG}: budget-dropped ${report.dropped.length} eligible entr${report.dropped.length === 1 ? 'y' : 'ies'} (used ${report.usedTokens}/${report.available} tokens)`, report.dropped.map(e => e.title));
        }
        if (report.included.length > 0 || cfg.errorControl) {
            console.debug(`${LOG}: injected ${report.included.length}/${report.eligible} living entr${report.eligible === 1 ? 'y' : 'ies'} (${report.usedTokens} tokens, base ${baseTokens})`);
        }
        return preamble;
    } catch (e) {
        console.warn(`${LOG}: preamble build failed; using base prompt`, e);
        return '';
    }
}
