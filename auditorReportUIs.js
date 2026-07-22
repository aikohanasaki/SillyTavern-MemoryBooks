// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// auditorReportUIs.js — Report UIs for the four STMB auditor jobs (Phase 5 P5.4).
//
// Plan §4.3 defines four jobs that share the chunk walker:
//   1. Coverage audit   — running notes vs existing entries → report of missing/thin
//   2. Entry regeneration — diff view of source-derived vs current content
//   3. Technical pass    — keyword/recursion/probability findings + suggested fixes
//   4. Claim re-verification — provenance-based contradictions, never auto-reconcile
//
// This module exposes the report-rendering + popup surface for each of the four
// jobs. The job executors (in auditorTechnicalPass.js → registerAuditorJobs)
// wrap these and route through `awaitStmbJobApproval` so they integrate with the
// existing STMB jobs dashboard, cadence offer, and approval flow.
//
// Renderers are pure (HTML string in, sanitized HTML string out). Popup functions
// accept an optional { STMB Popup DOMPurify } shape; in test/Node environments
// they fall back to a minimal stub so the report-rendering decisions can still
// be exercised without a DOM.

/**
 * @typedef {Object} CoverageItem
 * @property {string} key        Normalized character / location / event name
 * @property {string} kind       'character' | 'location' | 'event' | 'other'
 * @property {string} severity   'missing' | 'thin' | 'stale'
 * @property {number} [sightings] Number of mentions in the source material
 * @property {string} [note]     Free-form note from the running notes
 *
 * @typedef {Object} CoverageReport
 * @property {CoverageItem[]} items
 * @property {{total: number, flagged: number}} summary
 *
 * @typedef {Object} RegenerationCandidate
 * @property {number} entryUid
 * @property {string} title
 * @property {string} currentContent
 * @property {string} derivedContent
 * @property {string[]} sourceRanges
 * @property {number} similarity      0..1
 *
 * @typedef {Object} RegenerationReport
 * @property {RegenerationCandidate[]} candidates
 * @property {{total: number, changed: number}} summary
 */

// ----------------------------------------------------------------------------
// HTML escape + sanitize (the STMB Popup helper is injected; the escape helper
// here lets us keep the renderers testable without a DOM)
// ----------------------------------------------------------------------------

export function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function severityBadgeClass(severity) {
    const s = String(severity || '').toLowerCase();
    if (s === 'missing' || s === 'error') return 'stmb-audit-severity-error';
    if (s === 'thin' || s === 'warn') return 'stmb-audit-severity-warn';
    if (s === 'stale' || s === 'info') return 'stmb-audit-severity-info';
    return 'stmb-audit-severity-info';
}

// ----------------------------------------------------------------------------
// Coverage audit renderer
// ----------------------------------------------------------------------------

/**
 * Render the coverage audit report as sanitized HTML.
 *
 * Layout: per-item card with name, kind, severity badge, sighting count, and
 * a one-click "Generate" button (`data-action="generate"` + `data-key`). The
 * caller decides what "Generate" actually triggers (typically a memory job
 * keyed to the named character / location / event).
 *
 * @param {CoverageReport} report
 * @returns {string} sanitized HTML
 */
export function renderCoverageReportHTML(report) {
    const items = Array.isArray(report?.items) ? report.items : [];
    const summary = report?.summary ?? { total: items.length, flagged: items.length };

    const cards = items.map((item, index) => {
        const key = String(item?.key ?? '').trim();
        const kind = String(item?.kind ?? 'other').toLowerCase();
        const severity = String(item?.severity ?? 'missing').toLowerCase();
        const sightings = Number.isFinite(Number(item?.sightings)) ? Number(item.sightings) : 0;
        const note = String(item?.note ?? '').trim();

        return `
        <div class="world_entry_form_control stmb-audit-card" data-key="${escapeHtml(key)}" data-kind="${escapeHtml(kind)}">
            <div class="stmb-audit-card-header">
                <strong>${escapeHtml(key || `Item ${index + 1}`)}</strong>
                <span class="stmb-audit-kind-badge">${escapeHtml(kind)}</span>
                <span class="stmb-audit-severity-badge ${severityBadgeClass(severity)}">${escapeHtml(severity)}</span>
            </div>
            <div class="opacity70p fontsize90p">${escapeHtml(`${sightings} mention${sightings === 1 ? '' : 's'}`)}</div>
            ${note ? `<div class="stmb-audit-card-note">${escapeHtml(note)}</div>` : ''}
            <div class="stmb-audit-card-actions">
                <button type="button" class="menu_button stmb-audit-action" data-action="generate" data-key="${escapeHtml(key)}" data-kind="${escapeHtml(kind)}">Generate</button>
                <button type="button" class="menu_button stmb-audit-action" data-action="dismiss" data-key="${escapeHtml(key)}">Dismiss</button>
            </div>
        </div>`;
    }).join('');

    return `
        <h3>Coverage Audit</h3>
        <div class="opacity70p marginBot10">
            ${escapeHtml(`${summary.flagged} of ${summary.total} character / location / event note${summary.total === 1 ? '' : 's'} need attention.`)}
        </div>
        ${items.length === 0
            ? `<div class="opacity70p"><em>No missing or thin entries detected.</em></div>`
            : `<div class="stmb-audit-card-list">${cards}</div>`}
    `;
}

// ----------------------------------------------------------------------------
// Entry regeneration renderer (diff view)
// ----------------------------------------------------------------------------

/**
 * Render the entry regeneration report as sanitized HTML.
 *
 * Layout: per-candidate card with title + side-by-side old vs new content and
 * Accept / Reject buttons. Similarity is shown as a numeric 0..1 indicator.
 *
 * @param {RegenerationReport} report
 * @returns {string} sanitized HTML
 */
export function renderRegenerationDiffHTML(report) {
    const candidates = Array.isArray(report?.candidates) ? report.candidates : [];
    const summary = report?.summary ?? { total: candidates.length, changed: candidates.length };

    const cards = candidates.map((c, index) => {
        const title = String(c?.title ?? `Entry ${c?.entryUid ?? index}`);
        const current = String(c?.currentContent ?? '');
        const derived = String(c?.derivedContent ?? '');
        const similarity = Number.isFinite(Number(c?.similarity)) ? Number(c.similarity) : 0;
        const ranges = Array.isArray(c?.sourceRanges) ? c.sourceRanges : [];

        return `
        <div class="world_entry_form_control stmb-audit-card" data-uid="${escapeHtml(c?.entryUid ?? '')}">
            <div class="stmb-audit-card-header">
                <strong>${escapeHtml(title)}</strong>
                <span class="opacity70p fontsize90p">${escapeHtml(`similarity ${(similarity * 100).toFixed(1)}%`)}</span>
            </div>
            ${ranges.length > 0 ? `<div class="opacity70p fontsize90p">source: ${escapeHtml(ranges.join(', '))}</div>` : ''}
            <div class="stmb-audit-diff">
                <div class="stmb-audit-diff-pane">
                    <h4>Current</h4>
                    <pre class="stmb-audit-diff-current">${escapeHtml(current)}</pre>
                </div>
                <div class="stmb-audit-diff-pane">
                    <h4>Derived from source</h4>
                    <pre class="stmb-audit-diff-derived">${escapeHtml(derived)}</pre>
                </div>
            </div>
            <div class="stmb-audit-card-actions">
                <button type="button" class="menu_button stmb-audit-action" data-action="accept" data-uid="${escapeHtml(c?.entryUid ?? '')}">Accept derived</button>
                <button type="button" class="menu_button stmb-audit-action" data-action="reject" data-uid="${escapeHtml(c?.entryUid ?? '')}">Keep current</button>
            </div>
        </div>`;
    }).join('');

    return `
        <h3>Entry Regeneration</h3>
        <div class="opacity70p marginBot10">
            ${escapeHtml(`${summary.changed} of ${summary.total} entr${summary.total === 1 ? 'y' : 'ies'} drifted from source.`)}
        </div>
        ${candidates.length === 0
            ? `<div class="opacity70p"><em>No drifted entries detected.</em></div>`
            : `<div class="stmb-audit-card-list">${cards}</div>`}
    `;
}

// ----------------------------------------------------------------------------
// Technical pass renderer
// ----------------------------------------------------------------------------

/**
 * Render the technical pass report as sanitized HTML.
 *
 * Layout: per-issue card with entry title, severity badge, code, message,
 * suggested fix, and Fix / Dismiss buttons. Issues are grouped by entry uid.
 *
 * @param {{ summary: object, issues: Array<{entryUid:number,title:string,severity:string,code:string,message:string,suggestion:string}> }} report
 * @returns {string} sanitized HTML
 */
export function renderTechnicalPassHTML(report) {
    const issues = Array.isArray(report?.issues) ? report.issues : [];
    const summary = report?.summary ?? { entriesChecked: 0, flaggedEntries: 0, totalIssues: issues.length };

    const cards = issues.map((issue, index) => {
        const title = String(issue?.title ?? `Entry ${issue?.entryUid ?? index}`);
        const code = String(issue?.code ?? '');
        const message = String(issue?.message ?? '');
        const suggestion = String(issue?.suggestion ?? '');
        const severity = String(issue?.severity ?? 'info').toLowerCase();

        return `
        <div class="world_entry_form_control stmb-audit-card" data-uid="${escapeHtml(issue?.entryUid ?? '')}" data-code="${escapeHtml(code)}">
            <div class="stmb-audit-card-header">
                <strong>${escapeHtml(title)}</strong>
                <span class="stmb-audit-severity-badge ${severityBadgeClass(severity)}">${escapeHtml(severity)}</span>
                <span class="opacity70p fontsize90p"><code>${escapeHtml(code)}</code></span>
            </div>
            <div class="stmb-audit-card-message">${escapeHtml(message)}</div>
            ${suggestion ? `<div class="stmb-audit-card-suggestion"><em>Suggested fix:</em> ${escapeHtml(suggestion)}</div>` : ''}
            <div class="stmb-audit-card-actions">
                <button type="button" class="menu_button stmb-audit-action" data-action="fix" data-uid="${escapeHtml(issue?.entryUid ?? '')}" data-code="${escapeHtml(code)}">Fix</button>
                <button type="button" class="menu_button stmb-audit-action" data-action="dismiss" data-uid="${escapeHtml(issue?.entryUid ?? '')}" data-code="${escapeHtml(code)}">Dismiss</button>
            </div>
        </div>`;
    }).join('');

    return `
        <h3>Technical Pass</h3>
        <div class="opacity70p marginBot10">
            ${escapeHtml(`${summary.flaggedEntries} of ${summary.entriesChecked} entr${summary.entriesChecked === 1 ? 'y' : 'ies'} flagged (${summary.totalIssues} issue${summary.totalIssues === 1 ? '' : 's'}).`)}
        </div>
        ${issues.length === 0
            ? `<div class="opacity70p"><em>No technical issues detected.</em></div>`
            : `<div class="stmb-audit-card-list">${cards}</div>`}
    `;
}

// ----------------------------------------------------------------------------
// Claim re-verification renderer
// ----------------------------------------------------------------------------

/**
 * Render the claim re-verification report as sanitized HTML.
 *
 * Layout: per-verdict card with entry title, range, verdict (confirmed/flagged/
 * unknown), reason, and Flag / Dismiss buttons.
 *
 * @param {{ summary: object, rangeVerdicts: Array<{uid:number,title:string,range:string,verdict:string,reason:string}>, issues: Array }} report
 * @returns {string} sanitized HTML
 */
export function renderClaimReverificationHTML(report) {
    const verdicts = Array.isArray(report?.rangeVerdicts) ? report.rangeVerdicts : [];
    const summary = report?.summary ?? {};
    const confirmed = Number.isFinite(Number(summary.confirmed)) ? Number(summary.confirmed) : 0;
    const flagged = Number.isFinite(Number(summary.flagged)) ? Number(summary.flagged) : 0;
    const unknown = Number.isFinite(Number(summary.unknown)) ? Number(summary.unknown) : 0;

    const cards = verdicts.filter((v) => v?.verdict !== 'confirmed').map((v) => {
        const title = String(v?.title ?? `Entry ${v?.uid ?? ''}`);
        const range = String(v?.range ?? '');
        const verdict = String(v?.verdict ?? 'unknown');
        const reason = String(v?.reason ?? '');
        return `
        <div class="world_entry_form_control stmb-audit-card" data-uid="${escapeHtml(v?.uid ?? '')}" data-range="${escapeHtml(range)}">
            <div class="stmb-audit-card-header">
                <strong>${escapeHtml(title)}</strong>
                <span class="stmb-audit-severity-badge ${severityBadgeClass(verdict)}">${escapeHtml(verdict)}</span>
                <span class="opacity70p fontsize90p">${escapeHtml(range)}</span>
            </div>
            <div class="stmb-audit-card-message">${escapeHtml(reason)}</div>
            <div class="stmb-audit-card-actions">
                <button type="button" class="menu_button stmb-audit-action" data-action="flag" data-uid="${escapeHtml(v?.uid ?? '')}" data-range="${escapeHtml(range)}">Keep flag</button>
                <button type="button" class="menu_button stmb-audit-action" data-action="dismiss" data-uid="${escapeHtml(v?.uid ?? '')}" data-range="${escapeHtml(range)}">Dismiss flag</button>
            </div>
        </div>`;
    }).join('');

    return `
        <h3>Claim Re-verification</h3>
        <div class="opacity70p marginBot10">
            ${escapeHtml(`${confirmed} confirmed, ${flagged} flagged, ${unknown} unknown across ${verdicts.length} range${verdicts.length === 1 ? '' : 's'}.`)}
        </div>
        ${cards.length === 0
            ? `<div class="opacity70p"><em>No claims flagged. All re-verified ranges confirmed.</em></div>`
            : `<div class="stmb-audit-card-list">${cards}</div>`}
    `;
}

// ----------------------------------------------------------------------------
// Popup adapters — wrap each renderer into a function compatible with the
// `approvalRequest.open` contract (returns a Promise resolving to a decision
// object the executor can act on).
// ----------------------------------------------------------------------------

/**
 * Build a popup wrapper that resolves to the user's per-action decisions.
 * `popupShim` is an optional `{ Popup, POPUP_TYPE, DOMPurify }` triple. When
 * absent, the wrapper returns a structured stub so the renderer can be tested
 * in Node without a DOM.
 */
function makePopupWrapper({ render, popupShim, okLabel, cancelLabel, collectDecisions }) {
    if (!popupShim || typeof popupShim.Popup !== 'function') {
        // Node/test path — return a synthetic decision based on the report.
        return async () => {
            const report = arguments[0];
            return collectDecisions(report, { synthetic: true });
        };
    }

    const { Popup, POPUP_TYPE, DOMPurify } = popupShim;
    const safeSanitize = (typeof DOMPurify?.sanitize === 'function')
        ? (html) => DOMPurify.sanitize(html)
        : (html) => html;

    return async (report) => {
        const content = safeSanitize(render(report));
        const popup = new Popup(content, POPUP_TYPE.TEXT, '', {
            okButton: okLabel,
            cancelButton: cancelLabel,
            allowVerticalScrolling: true,
            wide: true,
            large: true,
        });
        const result = await popup.show();
        if (!popup.dlg) {
            return { decision: 'cancel' };
        }
        if (result !== 1 /* POPUP_RESULT.AFFIRMATIVE */) {
            return { decision: 'cancel' };
        }
        return collectDecisions(report, { dlg: popup.dlg });
    };
}

/**
 * Show the coverage audit report popup.
 *
 * @param {CoverageReport} report
 * @param {{popupShim?: object}} [opts]
 * @returns {Promise<{decision: string, generateKeys?: string[], dismissKeys?: string[]}>}
 */
export function showCoverageReportPopup(report, opts = {}) {
    const popupShim = opts.popupShim ?? null;
    const open = makePopupWrapper({
        render: renderCoverageReportHTML,
        popupShim,
        okLabel: 'Apply selected',
        cancelLabel: 'Cancel',
        collectDecisions: (r, ctx) => {
            if (ctx.synthetic) {
                return { decision: 'accept', generateKeys: [], dismissKeys: [], synthetic: true };
            }
            const generateKeys = [];
            const dismissKeys = [];
            const dlg = ctx.dlg;
            if (!dlg) return { decision: 'cancel' };
            for (const card of Array.from(dlg.querySelectorAll('.stmb-audit-card'))) {
                const key = String(card?.dataset?.key ?? '').trim();
                if (!key) continue;
                // Buttons may be inside the card; if the user didn't click per-item,
                // we fall back to "apply Generate" as the bulk action: any card with
                // no explicit dismiss button click gets generated.
                const dismissed = card.querySelector('.stmb-audit-action[data-action="dismiss"]:focus')
                    || card.dataset.dismissed === 'true';
                if (dismissed) {
                    dismissKeys.push(key);
                } else {
                    generateKeys.push(key);
                }
            }
            return { decision: 'accept', generateKeys, dismissKeys };
        },
    });
    return open(report);
}

/**
 * Show the entry regeneration report popup (diff view).
 *
 * @param {RegenerationReport} report
 * @param {{popupShim?: object}} [opts]
 * @returns {Promise<{decision: string, accepted?: number[], rejected?: number[]}>}
 */
export function showRegenerationDiffPopup(report, opts = {}) {
    const popupShim = opts.popupShim ?? null;
    const open = makePopupWrapper({
        render: renderRegenerationDiffHTML,
        popupShim,
        okLabel: 'Apply selected',
        cancelLabel: 'Cancel',
        collectDecisions: (r, ctx) => {
            if (ctx.synthetic) {
                return { decision: 'accept', accepted: [], rejected: [], synthetic: true };
            }
            const accepted = [];
            const rejected = [];
            const dlg = ctx.dlg;
            if (!dlg) return { decision: 'cancel' };
            for (const card of Array.from(dlg.querySelectorAll('.stmb-audit-card'))) {
                const uid = Number(card?.dataset?.uid);
                if (!Number.isFinite(uid)) continue;
                const rejectedBtn = card.querySelector('.stmb-audit-action[data-action="reject"]:focus');
                if (rejectedBtn) {
                    rejected.push(uid);
                } else {
                    accepted.push(uid);
                }
            }
            return { decision: 'accept', accepted, rejected };
        },
    });
    return open(report);
}

/**
 * Show the technical pass report popup.
 *
 * @param {{ summary: object, issues: Array }} report
 * @param {{popupShim?: object}} [opts]
 * @returns {Promise<{decision: string, fixes?: Array<{uid, code}>, dismissed?: Array<{uid, code}>}>}
 */
export function showTechnicalPassPopup(report, opts = {}) {
    const popupShim = opts.popupShim ?? null;
    const open = makePopupWrapper({
        render: renderTechnicalPassHTML,
        popupShim,
        okLabel: 'Apply selected',
        cancelLabel: 'Cancel',
        collectDecisions: (r, ctx) => {
            if (ctx.synthetic) {
                return { decision: 'accept', fixes: [], dismissed: [], synthetic: true };
            }
            const fixes = [];
            const dismissed = [];
            const dlg = ctx.dlg;
            if (!dlg) return { decision: 'cancel' };
            for (const card of Array.from(dlg.querySelectorAll('.stmb-audit-card'))) {
                const uid = Number(card?.dataset?.uid);
                const code = String(card?.dataset?.code ?? '');
                if (!Number.isFinite(uid) || !code) continue;
                const dismissBtn = card.querySelector('.stmb-audit-action[data-action="dismiss"]:focus');
                if (dismissBtn) {
                    dismissed.push({ uid, code });
                } else {
                    fixes.push({ uid, code });
                }
            }
            return { decision: 'accept', fixes, dismissed };
        },
    });
    return open(report);
}

/**
 * Show the claim re-verification report popup.
 *
 * @param {{ summary: object, rangeVerdicts: Array }} report
 * @param {{popupShim?: object}} [opts]
 * @returns {Promise<{decision: string, flagged?: Array<{uid, range}>, dismissed?: Array<{uid, range}>}>}
 */
export function showClaimReverificationPopup(report, opts = {}) {
    const popupShim = opts.popupShim ?? null;
    const open = makePopupWrapper({
        render: renderClaimReverificationHTML,
        popupShim,
        okLabel: 'Apply selected',
        cancelLabel: 'Cancel',
        collectDecisions: (r, ctx) => {
            if (ctx.synthetic) {
                return { decision: 'accept', flagged: [], dismissed: [], synthetic: true };
            }
            const flagged = [];
            const dismissed = [];
            const dlg = ctx.dlg;
            if (!dlg) return { decision: 'cancel' };
            for (const card of Array.from(dlg.querySelectorAll('.stmb-audit-card'))) {
                const uid = Number(card?.dataset?.uid);
                const range = String(card?.dataset?.range ?? '');
                if (!Number.isFinite(uid)) continue;
                const dismissBtn = card.querySelector('.stmb-audit-action[data-action="dismiss"]:focus');
                if (dismissBtn) {
                    dismissed.push({ uid, range });
                } else {
                    flagged.push({ uid, range });
                }
            }
            return { decision: 'accept', flagged, dismissed };
        },
    });
    return open(report);
}
