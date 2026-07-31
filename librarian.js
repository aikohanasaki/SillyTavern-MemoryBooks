// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// STMB-Auto fork — Librarian pre-turn retrieval, SillyTavern binding layer
// (Phase 7, task P7.2). Plan: PHA-1633 §Architecture 2 + 4.
//
// Wires the real chat / settings / profile / lorebook / completion functions
// into the pure engine (librarianCore.runLibrarianRetrieval), and applies its
// plan to the narrator's prompt.
//
// ---------------------------------------------------------------------------
// The one path
// ---------------------------------------------------------------------------
//
//   GENERATION_STARTED (awaited by SillyTavern's eventSource)
//     -> handleLibrarianGenerationStarted()      [this file]
//          0. clear last turn's injection FIRST — the stock prompt is the
//             state we fall back to, so it is also the state we start from
//          1. gate: not a dry run? librarian enabled? catalog present?
//          2. ONE call on the detection profile, under a hard timeout
//          3. plan (engine) -> applyPlan()
//     -> WORLDINFO_FORCE_ACTIVATE                [this file, if ST offers it]
//          push the planned entries into ST's own activation array
//     -- or, when that event does not exist --
//     -> setExtensionPrompt(STMBC_LIBRARIAN, content, IN_CHAT, depth)
//
// Everything after step 0 is best-effort. There is exactly one `await` on the
// generation path and it is bounded by `cfg.timeoutMs`; if it times out, throws,
// or returns nothing, the injection stays cleared and the narrator gets the
// byte-identical stock prompt. That is the fail-open guarantee.
//
// ---------------------------------------------------------------------------
// Why two injection mechanisms
// ---------------------------------------------------------------------------
// The epic asks for "the same WI injection mechanism, same positions". When
// SillyTavern exposes `WORLDINFO_FORCE_ACTIVATE` that is literally available:
// the entry goes through ST's own world-info assembly, at the position, depth,
// order and role the entry itself declares, and ST de-duplicates it against a
// keyword hit for free. Older builds have no such event, so the fallback is the
// standard extension-prompt path at the STMB depth — which injects entry
// CONTENT and nothing else (librarianCore.renderInjection), so the narrator
// still cannot distinguish a librarian entry from a keyword-matched one.
//
// Neither path touches ST's activation logic, world-info settings, or the
// narrator's instructions. The librarian can only ADD.

import { eventSource, event_types, chat, chat_metadata, setExtensionPrompt, extension_prompt_types } from '../../../../script.js';
import { extension_settings } from '../../../extensions.js';
import { METADATA_KEY, loadWorldInfo } from '../../../world-info.js';
import { requestCompletion } from './stmemory.js';
import { resolveEffectiveConnectionFromProfile } from './utils.js';
import { getChatCatalog, getChatCatalogLines } from './catalog.js';
import { saveMetadataForCurrentContext } from './sceneManager.js';
import { getAutoSettings } from './autoSettings.js';
import {
    LIBRARIAN_DEFAULTS,
    resolveLibrarianConfig,
    runLibrarianRetrieval,
    renderInjection,
} from './librarianCore.js';

const LOG = 'STMemoryBooks-Librarian';

/** Extension-prompt key. Namespaced so nothing else can collide with it. */
export const LIBRARIAN_PROMPT_KEY = 'STMBC_LIBRARIAN';

/**
 * The entries the last completed retrieval planned, waiting for ST to ask for
 * force-activations. Cleared at the top of every generation, so a stale plan can
 * never ride along on a later turn.
 * @type {Array<object>}
 */
let pendingEntries = [];

/** The last retrieval record, for `/stmbc-librarian` and the debug log. */
let lastRecord = null;

/** Reentrancy guard: GENERATION_STARTED can fire again while a call is in flight. */
let retrievalInFlight = false;

/** The fork's slice of extension_settings. */
function stmbSettings() {
    return extension_settings?.STMemoryBooks || {};
}

/** Resolve the effective librarian config for the chat currently open. */
export function resolveLibrarianConfigForCurrentChat() {
    return resolveLibrarianConfig(stmbSettings().autoModule, chat_metadata?.stmbc);
}

/** The last retrieval record (null before the first run). */
export function getLastLibrarianRecord() {
    return lastRecord;
}

/**
 * Turn the librarian on or off for the chat currently open.
 *
 * Per-chat rather than global on purpose: the phase gate has to be able to run
 * the same chat with and without the librarian, and a per-chat switch makes
 * that a two-command A/B instead of a settings-file edit. Switching OFF also
 * clears any standing injection, so the very next turn is stock.
 *
 * @param {boolean} enabled
 * @returns {boolean} the value now in effect
 */
export function setLibrarianEnabledForCurrentChat(enabled) {
    const on = !!enabled;
    if (typeof chat_metadata === 'object' && chat_metadata) {
        const stmbc = chat_metadata.stmbc || (chat_metadata.stmbc = {});
        stmbc.librarian = { ...(stmbc.librarian || {}), enabled: on };
        saveMetadataForCurrentContext();
    }
    if (!on) clearLibrarianInjection();
    return on;
}

// ---------------------------------------------------------------- injection

/**
 * Does this SillyTavern expose the world-info force-activation event?
 * Read dynamically off `event_types` (never imported by name) so a build
 * without it cannot break this module's import.
 */
function forceActivateEvent() {
    const name = event_types?.WORLDINFO_FORCE_ACTIVATE;
    return typeof name === 'string' && name ? name : null;
}

/**
 * Drop every trace of the librarian from the next prompt. Called at the top of
 * every generation and on every failure path, so "no injection" is the resting
 * state rather than something we have to remember to restore.
 */
export function clearLibrarianInjection() {
    pendingEntries = [];
    try {
        setExtensionPrompt(LIBRARIAN_PROMPT_KEY, '');
    } catch (err) {
        console.warn(`${LOG}: could not clear the extension prompt`, err);
    }
}

/**
 * Apply a retrieval plan to the coming generation.
 *
 * @param {Array<object>} included - librarianCore plan entries
 * @param {object} cfg - resolved librarian config
 * @returns {'worldinfo'|'extension-prompt'|'none'} the mechanism used
 */
export function applyLibrarianPlan(included, cfg = LIBRARIAN_DEFAULTS) {
    const list = Array.isArray(included) ? included : [];
    if (list.length === 0) {
        clearLibrarianInjection();
        return 'none';
    }

    if (forceActivateEvent()) {
        // Hand ST the real entry objects; it injects them exactly as if they had
        // matched a keyword, at their own position/depth/order.
        pendingEntries = list.map(e => e.entry).filter(Boolean);
        return 'worldinfo';
    }

    pendingEntries = [];
    setExtensionPrompt(
        LIBRARIAN_PROMPT_KEY,
        renderInjection(list),
        extension_prompt_types?.IN_CHAT ?? 1,
        cfg.depth ?? LIBRARIAN_DEFAULTS.depth,
        false,                                   // never re-scan: additive only
        cfg.role ?? LIBRARIAN_DEFAULTS.role,
    );
    return 'extension-prompt';
}

/**
 * WORLDINFO_FORCE_ACTIVATE listener: push the planned entries into the array ST
 * hands us. Never throws — a failure here must leave ST's own activation set
 * untouched, which is precisely "stock behaviour".
 */
export function handleWorldInfoForceActivate(entries) {
    try {
        if (!Array.isArray(entries) || pendingEntries.length === 0) return;
        for (const entry of pendingEntries) entries.push(entry);
    } catch (err) {
        console.warn(`${LOG}: force-activate handoff failed; stock activation stands`, err);
    }
}

// ---------------------------------------------------------------- deps

/**
 * Resolve the connection profile the retrieval call runs on: the librarian's
 * own `profileIndex` when set, otherwise the sentinel's detection profile,
 * otherwise the default profile. Retrieval is a cheap classification job — it
 * has no business on the narrator's profile.
 */
function resolveLibrarianConnection(cfg) {
    const settings = stmbSettings();
    const profiles = Array.isArray(settings.profiles) ? settings.profiles : [];
    const auto = getAutoSettings(settings);

    const candidates = [cfg.profileIndex, auto.detectionProfileIndex, settings.defaultProfile, 0];
    let idx = 0;
    for (const c of candidates) {
        const n = Number(c);
        if (Number.isInteger(n) && n >= 0 && n < profiles.length) {
            idx = n;
            break;
        }
    }
    return resolveEffectiveConnectionFromProfile(profiles[idx] || {});
}

/**
 * The single-shot LLM call, bounded by `cfg.timeoutMs`.
 *
 * The timeout is a race rather than only an AbortSignal because the guarantee
 * we need is about OUR wall clock: generation is blocked on this promise, so it
 * has to settle on time whatever the transport does with the signal.
 */
function makeSelect(cfg, conn) {
    return async (prompt) => {
        const controller = new AbortController();
        let timer = null;
        const timeout = new Promise((_, reject) => {
            timer = setTimeout(() => {
                try { controller.abort(); } catch { /* noop */ }
                reject(new Error(`librarian call exceeded ${cfg.timeoutMs}ms`));
            }, cfg.timeoutMs);
        });
        try {
            const { text } = await Promise.race([
                requestCompletion({
                    api: conn.api,
                    model: conn.model,
                    endpoint: conn.endpoint,
                    apiKey: conn.apiKey,
                    reverseProxy: conn.reverseProxy,
                    prompt,
                    temperature: 0,          // deterministic retrieval (matches eval)
                    extra: { max_tokens: 200 },
                    signal: controller.signal,
                }),
                timeout,
            ]);
            return text;
        } finally {
            if (timer) clearTimeout(timer);
        }
    };
}

/**
 * Build the engine's dependency bundle for the chat currently open, or null when
 * the librarian is off / has nothing to work with.
 */
function buildLibrarianDeps(cfg) {
    const conn = resolveLibrarianConnection(cfg);
    const catalog = getChatCatalog();
    const rowsByUid = new Map();
    for (const row of catalog?.rows || []) {
        const uid = Number(row?.uid);
        if (Number.isFinite(uid)) rowsByUid.set(uid, row);
    }

    return {
        config: cfg,
        // `chat` is a live binding from script.js — read fresh each call.
        getChat: () => chat,
        getCatalogLines: () => getChatCatalogLines({ kinds: cfg.kinds }),
        getRow: (uid) => rowsByUid.get(uid) || null,
        getEntries: async () => {
            const lorebookName = String(chat_metadata?.[METADATA_KEY] ?? '');
            if (!lorebookName) return [];
            const data = await loadWorldInfo(lorebookName);
            const entriesObj = data?.entries;
            if (!entriesObj || typeof entriesObj !== 'object') return [];
            // Shallow copies carrying `world`: ST's world-info assembly expects
            // a force-activated entry to know which book it came from, and a copy
            // keeps us from mutating the editor's live objects.
            return Object.values(entriesObj).map(e => ({ ...e, world: lorebookName }));
        },
        select: makeSelect(cfg, conn),
        now: () => Date.now(),
        log: (record) => {
            lastRecord = record;
            if (cfg.debug || getAutoSettings(stmbSettings()).debugLogging) {
                console.debug(`${LOG}: ${record.action}`, record);
            }
        },
    };
}

// ---------------------------------------------------------------- the hook

/**
 * Run one retrieval for the chat currently open and apply it. Exposed for the
 * slash command and for manual verification in the running app; the generation
 * hook below is a thin gate around it.
 *
 * @returns {Promise<object>} the retrieval record (never throws)
 */
export async function runLibrarianForCurrentChat() {
    const cfg = resolveLibrarianConfigForCurrentChat();
    if (!cfg.enabled) {
        clearLibrarianInjection();
        return { action: 'skip:disabled', included: [], dropped: [] };
    }

    const record = await runLibrarianRetrieval(buildLibrarianDeps(cfg));
    record.mechanism = applyLibrarianPlan(record.included, cfg);
    lastRecord = record;
    return record;
}

/**
 * GENERATION_STARTED gate (wired from index.js setupEventListeners).
 *
 * SillyTavern awaits its event listeners, so this is the ONE pre-generation
 * blocking point the epic budgets ~1–2s for. Everything expensive downstream is
 * bounded by `cfg.timeoutMs`; everything else here is a cheap check.
 *
 * @param {string} type - generation type ('normal', 'quiet', 'impersonate', …)
 * @param {object} options
 * @param {boolean} dryRun - ST's token-counting pass
 */
export async function handleLibrarianGenerationStarted(type, options, dryRun) {
    // A dry run is a measurement of the prompt we are about to build, not a
    // turn. Leave state exactly as it is: clearing here would make the dry run
    // measure a prompt the real generation is not going to send.
    if (dryRun) return;

    // Quiet generations are machinery, not turns. The fork's own calls (sentinel
    // detection, memory generation, side prompts) go direct through
    // requestCompletion and never land here, but ST core and other extensions do
    // route theirs through Generate(). Injecting lore into those would change
    // memory-generation prompts — an explicit non-goal of the phase.
    //
    // CLEAR and return, rather than plain return: last turn's plan is still
    // standing in `pendingEntries`, and a quiet generation runs a world-info
    // scan of its own, which emits WORLDINFO_FORCE_ACTIVATE and would hand that
    // stale plan straight into the quiet prompt. A bare return would leave this
    // guard cosmetic — the very leak it exists to stop.
    if (typeof type === 'string' && type === 'quiet') {
        clearLibrarianInjection();
        return;
    }

    // Fail-open starts here: the stock prompt is the resting state.
    clearLibrarianInjection();

    if (retrievalInFlight) return;
    retrievalInFlight = true;
    try {
        await runLibrarianForCurrentChat();
    } catch (err) {
        // runLibrarianForCurrentChat does not throw, but a binding-level fault
        // (a missing ST export in some future build) must not break generation.
        console.warn(`${LOG}: retrieval failed; using the stock prompt`, err);
        clearLibrarianInjection();
    } finally {
        retrievalInFlight = false;
    }
}

/**
 * Install the librarian's two listeners. Called once from index.js's
 * `setupEventListeners`. Idempotent-by-construction: it is only ever called
 * from that one site.
 */
export function registerLibrarianHooks() {
    eventSource.on(event_types.GENERATION_STARTED, handleLibrarianGenerationStarted);
    const forceEvent = forceActivateEvent();
    if (forceEvent) eventSource.on(forceEvent, handleWorldInfoForceActivate);
    // CHAT_CHANGED: a selection made for the previous chat must never survive
    // into the next one.
    eventSource.on(event_types.CHAT_CHANGED, clearLibrarianInjection);
}

/** Test/debug seam: current pending force-activation entries. */
export function getPendingLibrarianEntries() {
    return pendingEntries.slice();
}
