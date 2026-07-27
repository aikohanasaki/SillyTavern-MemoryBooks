// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// STMB-Auto fork — Auditor jobs SillyTavern binding (Phase 5, task P5.2).
// Plan: eval/materials/stmb-auto/stmb-auto-plan.md §4.3 (Auditor jobs 1–2).
//
// Wires the real SillyTavern chat / bound-lorebook / profile / LLM functions into
// the pure, dependency-injected core (auditorJobsCore.js). Two on-demand slash
// commands sit on top of the P5.1 walker's running-notes ground truth (getAuditNotes):
//
//   /stmbc-coverage      — coverage audit: notes vs. the bound lorebook → a missing/thin
//                          report popup with one-click generate (plan §4.3 job 1).
//   /stmbc-regen <name>  — re-derive one living entry FROM the source chunks where its
//                          name appears, diff old vs. new, approve (or auto-approve).
//                          Anti-drift: never rewords the stale entry (plan §4.3 job 2).
//
// Wiring lives in index.js at ONE `STMBC-HOOK(auditor-jobs)` block: import +
// two slash commands (beside the P5.1 /stmbc-audit hook). These jobs read the same
// checkpoint the walker wrote and write through STMB's own upsert helper, so they
// never touch the merge-sensitive memory-creation path (plan §5.5 merge discipline).

import { extension_settings } from '../../../extensions.js';
import { chat, chat_metadata } from '../../../../script.js';
import { METADATA_KEY, loadWorldInfo } from '../../../world-info.js';
import { Popup, POPUP_TYPE, POPUP_RESULT } from '../../../popup.js';
import { DOMPurify } from '../../../../lib.js';
import { escapeHtml } from '../../../utils.js';
import { resolveEffectiveConnectionFromProfile } from './utils.js';
import {
    isMemoryEntry,
    getEntryByTitle,
    upsertLorebookEntryByTitle,
} from './addlore.js';
import { requestCompletion } from './stmemory.js';
import {
    extractAuditMessages,
    planChunks,
    estimateTokensChars,
} from './auditorCore.js';
import { getAuditNotes, resolveAuditConfig } from './auditor.js';
import {
    COVERAGE_DEFAULTS,
    REGEN_DEFAULTS,
    REGEN_PROMPT,
    auditCoverage,
    buildCoverageIndex,
    findCoveringEntry,
    findNameChunks,
    selectRegenSource,
    buildRegenPrompt,
    regenerateOnce,
    diffLines,
} from './auditorJobsCore.js';

const LOG = 'STMemoryBooks: AuditorJobs';

/** Guard rail on a one-click "generate all" so a huge report cannot fire hundreds of calls silently. */
const BULK_GENERATE_CAP = 25;

// ---------------------------------------------------------------- config

/** Merge coverage config: defaults <- global (autoModule.coverage) <- per-chat (stmbc.coverage). */
export function resolveCoverageConfig(autoModule, chatMetadata) {
    const global = autoModule?.coverage || {};
    const perChat = chatMetadata?.stmbc?.coverage || {};
    const cfg = { ...COVERAGE_DEFAULTS };
    for (const key of ['thinContentChars', 'minChunks', 'includeLocations']) {
        if (global[key] != null) cfg[key] = global[key];
        if (perChat[key] != null) cfg[key] = perChat[key];
    }
    return cfg;
}

/** Merge regeneration config: defaults <- global (autoModule.regen) <- per-chat (stmbc.regen). */
export function resolveRegenConfig(autoModule, chatMetadata) {
    const global = autoModule?.regen || {};
    const perChat = chatMetadata?.stmbc?.regen || {};
    const cfg = { ...REGEN_DEFAULTS };
    for (const key of ['tokenBudget', 'truncate', 'prioritizeNameMatches', 'autoApprove', 'profile']) {
        if (global[key] != null) cfg[key] = global[key];
        if (perChat[key] != null) cfg[key] = perChat[key];
    }
    if (typeof global.regenPrompt === 'string' && global.regenPrompt.trim()) cfg.regenPrompt = global.regenPrompt;
    if (typeof perChat.regenPrompt === 'string' && perChat.regenPrompt.trim()) cfg.regenPrompt = perChat.regenPrompt;
    return cfg;
}

/**
 * Resolve the extraction/derivation connection from a configured profile index, or the
 * STMB default profile. Same cheap-model rationale as the auditor walker.
 */
function resolveJobsConnection(profileIdx) {
    const settings = extension_settings.STMemoryBooks || {};
    const profiles = Array.isArray(settings.profiles) ? settings.profiles : [];
    let idx = Number(profileIdx);
    if (!Number.isInteger(idx) || idx < 0 || idx >= profiles.length) {
        idx = Number(settings.defaultProfile ?? 0);
    }
    return resolveEffectiveConnectionFromProfile(profiles[idx] || {});
}

/** Single-shot re-derivation call bound to a connection (a bit more room than the map call). */
function makeDerive(conn) {
    return async (prompt) => {
        const { text } = await requestCompletion({
            api: conn.api,
            model: conn.model,
            endpoint: conn.endpoint,
            apiKey: conn.apiKey,
            reverseProxy: conn.reverseProxy,
            prompt,
            temperature: 0,
            extra: { max_tokens: 1200 },
        });
        return text;
    };
}

// ---------------------------------------------------------------- bound lorebook

/** Resolve the bound lorebook (name + loaded data), or null — same source of truth as injection/save. */
async function loadBoundLorebook() {
    const name = (typeof chat_metadata === 'object' && chat_metadata) ? chat_metadata[METADATA_KEY] : null;
    if (!name) return null;
    try {
        const data = await loadWorldInfo(name);
        if (!data || typeof data.entries !== 'object') return null;
        return { name, data };
    } catch (e) {
        console.warn(`${LOG}: could not load bound lorebook "${name}"`, e);
        return null;
    }
}

/** Map the bound lorebook's entries into the shape auditCoverage / buildCoverageIndex expect. */
function entriesForCoverage(lorebookData) {
    const out = [];
    for (const entry of Object.values(lorebookData?.entries || {})) {
        if (!entry) continue;
        out.push({
            uid: entry.uid,
            title: entry.comment || '',
            content: entry.content || '',
            keys: Array.isArray(entry.key) ? entry.key : [],
            constant: !!entry.constant,
            disable: entry.disable === true,
            isMemory: isMemoryEntry(entry),
        });
    }
    return out;
}

// ---------------------------------------------------------------- regeneration (shared)

/**
 * Re-derive one entry's content from the source chunks its name appears in. Returns
 * `{ parsed, source, oldContent }`, or a `{ error }` describing why it could not be done.
 * Pure-of-UI: both /stmbc-regen and the one-click coverage generate call this.
 */
async function deriveEntryFromSource({ name, notes, lorebook, coverageIndex, regenCfg, auditCfg, conn }) {
    const hit = findNameChunks(notes, name);
    if (!hit) return { error: `"${name}" is not in the audit notes. Run /stmbc-audit first, or check the spelling.` };

    const messages = extractAuditMessages(chat);
    // Reproduce the SAME chunk plan the walk used, so the notes' chunk indices line up.
    const plan = planChunks(messages, {
        chunkSize: auditCfg.chunkSize,
        tokenCap: auditCfg.tokenCap,
        truncate: auditCfg.truncate,
        estimateTokens: estimateTokensChars,
    });
    const source = selectRegenSource(messages, plan, hit.chunks, hit.name, {
        tokenBudget: regenCfg.tokenBudget,
        truncate: regenCfg.truncate,
        prioritizeNameMatches: regenCfg.prioritizeNameMatches,
        estimateTokens: estimateTokensChars,
    });
    if (!source.text.trim()) return { error: `No source text found for "${name}" (its chunks may be out of range).` };

    const existingEntry = findCoveringEntry(coverageIndex, hit.name);
    const oldContent = existingEntry ? existingEntry.content : '';
    const targetTitle = existingEntry ? existingEntry.title : hit.name;
    const isNew = !existingEntry;

    const derive = makeDerive(conn);
    const prompt = buildRegenPrompt(hit.name, hit.kind, source.text, oldContent, regenCfg.regenPrompt || REGEN_PROMPT);
    const parsed = await regenerateOnce({ derive, prompt, fallbackName: hit.name });
    if (!parsed) return { error: `Could not regenerate "${name}" (the model returned no usable entry).` };

    return { parsed, source, oldContent, targetTitle, isNew, kind: hit.kind, name: hit.name };
}

/** Write a (re-)derived entry through STMB's own upsert. New entries get keys; existing keep theirs. */
async function writeEntry(lorebook, { targetTitle, isNew, parsed, name }) {
    const title = isNew ? (parsed.title || name) : targetTitle;
    const entryOverrides = isNew
        ? { key: (parsed.keywords && parsed.keywords.length) ? parsed.keywords : [name] }
        : {};
    const res = await upsertLorebookEntryByTitle(lorebook.name, lorebook.data, title, parsed.content, { entryOverrides });
    return { title, uid: res.uid, created: res.created };
}

// ---------------------------------------------------------------- coverage report UI

function renderCoverageReport(report, lorebookName) {
    const item = (m) => {
        const src = m.entryTitle ? ` · entry “${escapeHtml(m.entryTitle)}” (${m.contentLen} chars)` : '';
        return `<li><b>${escapeHtml(m.name)}</b> <small>(${escapeHtml(m.kind)}, ${m.mentions} mentions across ${m.chunkCount} chunks${src})</small></li>`;
    };
    const list = (arr, empty) => arr.length
        ? `<ul style="margin:4px 0 10px 18px;">${arr.map(item).join('')}</ul>`
        : `<p><i>${empty}</i></p>`;

    return `
        <h3>Coverage audit</h3>
        <p><small>Lorebook: <code>${escapeHtml(lorebookName)}</code> · ${report.covered} covered · ${report.total} salient names (seen in ≥ ${report.config.minChunks} chunks)</small></p>
        <h4>Missing (${report.missing.length})</h4>
        ${list(report.missing, 'No missing entries — every salient name has coverage.')}
        <h4>Thin (${report.thin.length})</h4>
        ${list(report.thin, 'No thin entries.')}
        <p><small>“Generate” re-derives each entry from the source chunks where its name appears — not from summaries.</small></p>
    `;
}

/**
 * Run a bulk one-click generate over report items (missing → create, thin → refresh). Sequential,
 * auto-approved (no per-item diff — use /stmbc-regen for a single reviewed regeneration). Capped.
 */
async function bulkGenerate(items, { notes, lorebook, coverageIndex, regenCfg, auditCfg, conn }) {
    const slice = items.slice(0, BULK_GENERATE_CAP);
    const dropped = items.length - slice.length;
    let ok = 0;
    const failures = [];
    for (const it of slice) {
        try {
            const d = await deriveEntryFromSource({ name: it.name, notes, lorebook, coverageIndex, regenCfg, auditCfg, conn });
            if (d.error) { failures.push(`${it.name}: ${d.error}`); continue; }
            await writeEntry(lorebook, d);
            ok++;
            try { toastr.info(`Generated “${it.name}” (${ok}/${slice.length})`, 'STMemoryBooks'); } catch { /* optional */ }
        } catch (e) {
            failures.push(`${it.name}: ${e?.message || e}`);
        }
    }
    let msg = `Generated ${ok}/${slice.length} entr${slice.length === 1 ? 'y' : 'ies'} into "${lorebook.name}".`;
    if (dropped > 0) msg += ` ${dropped} more not processed (cap ${BULK_GENERATE_CAP}); re-run to continue.`;
    if (failures.length) { msg += ` ${failures.length} failed.`; console.warn(`${LOG}: bulk generate failures`, failures); }
    return msg;
}

/**
 * Slash: /stmbc-coverage
 * Compare the audit notes against the bound lorebook and show a missing/thin report with a
 * one-click generate. Requires a prior /stmbc-audit (the running notes) and a bound lorebook.
 */
export async function handleCoverageCommand() {
    try {
        const notes = getAuditNotes();
        if (!notes) return 'No audit notes yet. Run /stmbc-audit first to build the running notes.';

        const lorebook = await loadBoundLorebook();
        if (!lorebook) return 'No lorebook is bound to this chat. Bind one, then re-run /stmbc-coverage.';

        const autoModule = extension_settings?.STMemoryBooks?.autoModule;
        const coverageCfg = resolveCoverageConfig(autoModule, chat_metadata);
        const regenCfg = resolveRegenConfig(autoModule, chat_metadata);
        const auditCfg = resolveAuditConfig(autoModule, chat_metadata);

        const entries = entriesForCoverage(lorebook.data);
        const report = auditCoverage(notes, entries, coverageCfg);
        const coverageIndex = buildCoverageIndex(entries);
        const conn = resolveJobsConnection(regenCfg.profile);

        const summary = `Coverage: ${report.missing.length} missing, ${report.thin.length} thin, ${report.covered} covered (of ${report.total} salient names).`;

        const customButtons = [];
        if (report.thin.length) {
            customButtons.push({ text: `Regenerate ${report.thin.length} thin`, result: POPUP_RESULT.CUSTOM1 });
        }
        const popup = new Popup(
            DOMPurify.sanitize(renderCoverageReport(report, lorebook.name)),
            POPUP_TYPE.TEXT,
            '',
            {
                okButton: report.missing.length ? `Generate ${report.missing.length} missing` : 'Close',
                cancelButton: 'Close',
                wide: true,
                allowVerticalScrolling: true,
                customButtons,
            },
        );
        const result = await popup.show();

        const ctx = { notes, lorebook, coverageIndex, regenCfg, auditCfg, conn };
        if (result === POPUP_RESULT.AFFIRMATIVE && report.missing.length) {
            const msg = await bulkGenerate(report.missing, ctx);
            try { toastr.success(msg, 'STMemoryBooks'); } catch { /* optional */ }
            return msg;
        }
        if (result === POPUP_RESULT.CUSTOM1 && report.thin.length) {
            const msg = await bulkGenerate(report.thin, ctx);
            try { toastr.success(msg, 'STMemoryBooks'); } catch { /* optional */ }
            return msg;
        }
        return summary;
    } catch (err) {
        console.error(`${LOG}: /stmbc-coverage failed`, err);
        try { toastr.error(`Coverage audit failed: ${err?.message || err}`, 'STMemoryBooks'); } catch { /* optional */ }
        return `Coverage audit failed: ${err?.message || err}`;
    }
}

// ---------------------------------------------------------------- regeneration UI

function renderDiff(name, oldContent, newContent, source) {
    const d = diffLines(oldContent, newContent);
    const rowHtml = d.rows.map(r => {
        const bg = r.type === 'add' ? 'rgba(60,180,90,0.18)' : r.type === 'del' ? 'rgba(200,70,70,0.18)' : 'transparent';
        const sign = r.type === 'add' ? '+ ' : r.type === 'del' ? '- ' : '  ';
        return `<div style="white-space:pre-wrap;background:${bg};padding:0 4px;">${escapeHtml(sign + r.text)}</div>`;
    }).join('');
    const provenance = source?.idRanges?.length
        ? source.idRanges.map(([s, e]) => (s === e ? `#${s}` : `#${s}–${e}`)).join(', ')
        : '—';
    return `
        <h3>Regenerate “${escapeHtml(name)}”</h3>
        <p><small>Re-derived from source messages ${escapeHtml(provenance)} (${source?.includedIds?.length || 0} messages, ${source?.tokens || 0} tokens). ${d.added} added / ${d.removed} removed lines.</small></p>
        <div style="font-family:var(--monoFontFamily,monospace);font-size:0.85em;border:1px solid var(--SmartThemeBorderColor,#444);border-radius:4px;max-height:50vh;overflow:auto;">${rowHtml}</div>
        <p><small>Approve to write the new content (anti-drift: derived from source, not the old entry).</small></p>
    `;
}

/**
 * Slash: /stmbc-regen <name>
 * Re-derive a single living entry from the source chunks where its name appears, show a diff of
 * old vs. new, and write it on approval — or write directly when the auto-approve setting is on.
 */
export async function handleRegenCommand(namedArgs, unnamedArgs) {
    try {
        const name = String(unnamedArgs ?? '').trim();
        if (!name) return 'Usage: /stmbc-regen <entry name> — re-derive a living entry from its source chunks.';

        const notes = getAuditNotes();
        if (!notes) return 'No audit notes yet. Run /stmbc-audit first to build the running notes.';

        const lorebook = await loadBoundLorebook();
        if (!lorebook) return 'No lorebook is bound to this chat. Bind one, then re-run /stmbc-regen.';

        const autoModule = extension_settings?.STMemoryBooks?.autoModule;
        const regenCfg = resolveRegenConfig(autoModule, chat_metadata);
        const auditCfg = resolveAuditConfig(autoModule, chat_metadata);
        const coverageIndex = buildCoverageIndex(entriesForCoverage(lorebook.data));
        const conn = resolveJobsConnection(regenCfg.profile);

        try { toastr.info(`Regenerating “${name}”…`, 'STMemoryBooks'); } catch { /* optional */ }
        const d = await deriveEntryFromSource({ name, notes, lorebook, coverageIndex, regenCfg, auditCfg, conn });
        if (d.error) {
            try { toastr.warning(d.error, 'STMemoryBooks'); } catch { /* optional */ }
            return d.error;
        }

        // Auto-approve setting: skip the diff popup and write directly.
        if (regenCfg.autoApprove) {
            const w = await writeEntry(lorebook, d);
            const msg = `${w.created ? 'Created' : 'Regenerated'} “${w.title}” from source (auto-approved).`;
            try { toastr.success(msg, 'STMemoryBooks'); } catch { /* optional */ }
            return msg;
        }

        const popup = new Popup(
            DOMPurify.sanitize(renderDiff(d.name, d.oldContent, d.parsed.content, d.source)),
            POPUP_TYPE.TEXT,
            '',
            {
                okButton: d.isNew ? 'Create entry' : 'Approve & save',
                cancelButton: 'Cancel',
                wide: true,
                allowVerticalScrolling: true,
            },
        );
        const result = await popup.show();
        if (result !== POPUP_RESULT.AFFIRMATIVE) {
            return `Regeneration of “${d.name}” cancelled (no changes written).`;
        }

        const w = await writeEntry(lorebook, d);
        const msg = `${w.created ? 'Created' : 'Regenerated'} “${w.title}” from source.`;
        try { toastr.success(msg, 'STMemoryBooks'); } catch { /* optional */ }
        return msg;
    } catch (err) {
        console.error(`${LOG}: /stmbc-regen failed`, err);
        try { toastr.error(`Regeneration failed: ${err?.message || err}`, 'STMemoryBooks'); } catch { /* optional */ }
        return `Regeneration failed: ${err?.message || err}`;
    }
}
