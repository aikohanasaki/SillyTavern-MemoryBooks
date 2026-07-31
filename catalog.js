// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// STMB-Auto fork — Entry catalog / retrieval index, SillyTavern binding layer
// (Phase 7, task P7.1). Plan: PHA-1633 §Architecture 1.
//
// Wires chat_metadata + loadWorldInfo into the pure, dependency-injected core
// (catalogCore.js). Follows the same "direct chat_metadata +
// saveMetadataForCurrentContext()" convention review.js and sentinel.js use
// for per-chat state: a refresh only lands when the lorebook it describes is
// the one bound to the chat currently open, so a late write can never stamp
// one chat's catalog into another chat's metadata.
//
// Two refresh triggers, both non-blocking and both fail-open:
//   * on entry write   — `STMBC-HOOK(catalog)` at the three saveWorldInfo
//                        sites in addlore.js (memory add, single upsert,
//                        batch upsert). Those three cover every write the
//                        pipeline makes: memories, side prompts, clip context
//                        entries, consolidations.
//   * on coverage run  — injected as `onCatalogRefresh` into the
//                        `stmbc-audit-coverage` executor from index.js.
//
// NOTHING here throws into a caller. The catalog is an accelerator for
// librarian retrieval (P7.2); its absence or staleness degrades retrieval
// quality and must never break a lorebook write or an audit job.

import { chat_metadata } from '../../../../script.js';
import { extension_settings } from '../../../extensions.js';
import { METADATA_KEY, loadWorldInfo } from '../../../world-info.js';
import { saveMetadataForCurrentContext } from './sceneManager.js';
import {
    resolveCatalogConfig,
    buildCatalog,
    diffCatalog,
    refreshCatalog,
    formatCatalogLines,
    catalogByteLength,
} from './catalogCore.js';

const LOG = 'STMemoryBooks-Catalog';

/** Resolve the catalog config for the currently active chat (global + per-chat override). */
export function resolveCatalogConfigForCurrentChat() {
    return resolveCatalogConfig(extension_settings?.STMemoryBooks?.autoModule, chat_metadata?.stmbc);
}

/** The lorebook name bound to the chat currently open, or '' when none is bound. */
export function getBoundLorebookName() {
    return String(chat_metadata?.[METADATA_KEY] ?? '');
}

function getOrCreateStmbc() {
    return chat_metadata.stmbc || (chat_metadata.stmbc = {});
}

/** The stored catalog for the current chat, or null when none has been built. */
export function getChatCatalog() {
    const stored = chat_metadata?.stmbc?.catalog;
    return (stored && Array.isArray(stored.rows)) ? stored : null;
}

/** Drop the stored catalog (chat unbound from its lorebook, or a manual reset). */
export function clearChatCatalog() {
    const stmbc = chat_metadata?.stmbc;
    if (!stmbc || !stmbc.catalog) return false;
    delete stmbc.catalog;
    saveMetadataForCurrentContext();
    return true;
}

/**
 * Is the stored catalog behind the given lorebook data? Pure read — no write,
 * no save. Callers that only want to know (a status line, a test) use this;
 * `refreshChatCatalog` does its own diff.
 *
 * @param {object} lorebookData
 * @returns {object} the `diffCatalog` result
 */
export function getChatCatalogStaleness(lorebookData) {
    return diffCatalog(getChatCatalog(), lorebookData);
}

/**
 * Build and store the catalog for the current chat, unconditionally.
 *
 * @param {object} opts
 * @param {string} [opts.lorebookName] - defaults to the chat's bound lorebook
 * @param {object} [opts.lorebookData] - loaded if omitted
 * @param {string} [opts.reason]
 * @returns {Promise<object|null>} the stored catalog, or null when nothing was built
 */
export async function rebuildChatCatalog({ lorebookName, lorebookData, reason = 'manual' } = {}) {
    const name = String(lorebookName || getBoundLorebookName());
    if (!name) return null;

    const data = lorebookData || await loadWorldInfo(name);
    if (!data?.entries) return null;

    const cfg = resolveCatalogConfigForCurrentChat();
    if (!cfg.enabled) return null;

    const catalog = buildCatalog(data, { ...cfg, lorebookName: name, reason });
    const stmbc = getOrCreateStmbc();
    stmbc.catalog = catalog;
    saveMetadataForCurrentContext();

    if (catalog.truncated) {
        // Never a silent cap (plan §4.3): a truncated catalog means the
        // librarian cannot see part of the lorebook, and that is a fact the
        // user is entitled to.
        console.warn(
            `${LOG}: catalog for "${name}" exceeded its ${cfg.maxSerializedBytes}-byte budget; ` +
            `${catalog.dropped.length} entr${catalog.dropped.length === 1 ? 'y' : 'ies'} dropped ` +
            `(uids: ${catalog.dropped.join(', ')}). Those entries still fire on keywords — ` +
            'only librarian retrieval is affected. Raise autoModule.catalog.maxSerializedBytes to index them.',
        );
    }
    return catalog;
}

/**
 * Refresh the stored catalog only if the lorebook actually moved.
 *
 * The staleness check is the whole point of the two triggers being cheap: a
 * write that changed one entry rebuilds; a coverage run over an untouched
 * lorebook writes nothing and does not dirty chat_metadata.
 *
 * @param {object} opts - same as rebuildChatCatalog, plus `force`
 * @returns {Promise<{catalog:object|null, diff:object|null, rebuilt:boolean}>}
 */
export async function refreshChatCatalog({ lorebookName, lorebookData, reason = 'refresh', force = false } = {}) {
    const name = String(lorebookName || getBoundLorebookName());
    if (!name) return { catalog: null, diff: null, rebuilt: false };

    const cfg = resolveCatalogConfigForCurrentChat();
    if (!cfg.enabled) return { catalog: null, diff: null, rebuilt: false };

    // Only ever describe the lorebook bound to the chat whose metadata we are
    // about to write. A background job for a different lorebook is skipped
    // rather than allowed to overwrite this chat's index.
    if (name !== getBoundLorebookName()) {
        return { catalog: getChatCatalog(), diff: null, rebuilt: false };
    }

    const data = lorebookData || await loadWorldInfo(name);
    if (!data?.entries) return { catalog: getChatCatalog(), diff: null, rebuilt: false };

    const stored = getChatCatalog();
    // A catalog built for a different lorebook is not stale — it is wrong.
    const wrongBook = stored && stored.lorebook && stored.lorebook !== name;
    const result = refreshCatalog(wrongBook ? null : stored, data, {
        ...cfg,
        lorebookName: name,
        reason,
        force,
    });
    if (!result.rebuilt) return result;

    const stmbc = getOrCreateStmbc();
    stmbc.catalog = result.catalog;
    saveMetadataForCurrentContext();

    if (result.catalog.truncated) {
        console.warn(
            `${LOG}: catalog for "${name}" exceeded its ${cfg.maxSerializedBytes}-byte budget; ` +
            `${result.catalog.dropped.length} entr${result.catalog.dropped.length === 1 ? 'y' : 'ies'} dropped ` +
            `(uids: ${result.catalog.dropped.join(', ')}).`,
        );
    }
    return result;
}

/**
 * `STMBC-HOOK(catalog)` entry point for the lorebook write sites in addlore.js.
 *
 * Fire-and-forget and total: it swallows every failure, because the write that
 * called it has already succeeded and must not be reported as failed just
 * because the retrieval index could not be updated. Callers use
 * `void noteCatalogEntryWrite(...)` — no await, no rejection to handle.
 *
 * @param {string} lorebookName
 * @param {object} [lorebookData] - the in-memory data just saved, when available
 * @returns {Promise<void>}
 */
export async function noteCatalogEntryWrite(lorebookName, lorebookData) {
    try {
        await refreshChatCatalog({ lorebookName, lorebookData, reason: 'entry-write' });
    } catch (err) {
        console.warn(`${LOG}: catalog refresh after entry write failed:`, err);
    }
}

/**
 * `STMBC-HOOK(catalog)` entry point for `handleCoverageCommand` in
 * auditorJobs.js, so the Auditor's coverage run doubles as the catalog's
 * scheduled rebuild. The coverage command has already loaded the bound
 * lorebook by the time it calls this, so it hands the data over rather than
 * making this re-read it.
 *
 * Total, like the entry-write hook: it swallows every failure, because a
 * coverage report must not fail on account of the retrieval index.
 *
 * @param {{lorebookName?: string, lorebookData?: object, reason?: string}} ctx
 * @returns {Promise<void>}
 */
export async function refreshCatalogForCoverageRun({ lorebookName, lorebookData, reason = 'coverage' } = {}) {
    try {
        await refreshChatCatalog({ lorebookName, lorebookData, reason });
    } catch (err) {
        console.warn(`${LOG}: catalog refresh during coverage run failed:`, err);
    }
}

/**
 * The catalog rendered as the compact line list the librarian call (P7.2) will
 * put in its prompt, plus its measured size. Re-exported through the binding
 * so consumers get the stored catalog without reaching into chat_metadata.
 *
 * @param {object} [opts] - forwarded to `formatCatalogLines`
 * @returns {{lines: string[], bytes: number, rows: number, truncated: boolean}}
 */
export function getChatCatalogLines(opts = {}) {
    const catalog = getChatCatalog();
    const lines = formatCatalogLines(catalog, opts);
    return {
        lines,
        bytes: catalog ? catalogByteLength(catalog) : 0,
        rows: catalog ? catalog.rows.length : 0,
        truncated: catalog ? catalog.truncated === true : false,
    };
}
