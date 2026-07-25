// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// auditorReportUIs.test.js — Unit tests for the P5.4 report UI renderers.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
    escapeHtml,
    renderCoverageReportHTML,
    renderRegenerationDiffHTML,
    renderTechnicalPassHTML,
    renderClaimReverificationHTML,
    showCoverageReportPopup,
    showRegenerationDiffPopup,
    showTechnicalPassPopup,
    showClaimReverificationPopup,
} from './auditorReportUIs.js';

// ----------------------------------------------------------------------------
// escapeHtml
// ----------------------------------------------------------------------------

test('escapeHtml escapes the five XML-sensitive characters', () => {
    const out = escapeHtml(`<script>alert("x & 'y'")</script>`);
    assert.ok(!out.includes('<script>'));
    assert.ok(out.includes('&lt;script&gt;'));
    assert.ok(out.includes('&amp;'));
    assert.ok(out.includes('&quot;'));
    assert.ok(out.includes('&#39;'));
});

test('escapeHtml handles null/undefined gracefully', () => {
    assert.equal(escapeHtml(null), '');
    assert.equal(escapeHtml(undefined), '');
});

// ----------------------------------------------------------------------------
// renderCoverageReportHTML
// ----------------------------------------------------------------------------

test('renderCoverageReportHTML: renders a card per item with severity badge', () => {
    const report = {
        items: [
            { key: 'Bob', kind: 'character', severity: 'missing', sightings: 5, note: 'appears often' },
        ],
        summary: { total: 1, flagged: 1 },
    };
    const html = renderCoverageReportHTML(report);
    assert.ok(html.includes('Bob'));
    assert.ok(html.includes('stmb-audit-severity-error')); // 'missing' maps to error
    assert.ok(html.includes('5 mentions'));
    assert.ok(html.includes('data-action="generate"'));
});

test('renderCoverageReportHTML: escapes malicious keys', () => {
    const report = { items: [{ key: '<img onerror=alert(1)>', severity: 'missing', sightings: 1 }], summary: { total: 1, flagged: 1 } };
    const html = renderCoverageReportHTML(report);
    assert.ok(!html.includes('<img onerror'));
});

test('renderCoverageReportHTML: shows empty-state message when no items', () => {
    const html = renderCoverageReportHTML({ items: [], summary: { total: 0, flagged: 0 } });
    assert.ok(html.includes('No missing or thin entries'));
});

test('renderCoverageReportHTML: handles null/undefined report', () => {
    const html = renderCoverageReportHTML(null);
    assert.ok(html.includes('Coverage Audit'));
    assert.ok(!html.includes('undefined'));
});

test('renderCoverageReportHTML: singular mention count grammar', () => {
    const report = { items: [{ key: 'Bob', severity: 'thin', sightings: 1 }], summary: { total: 1, flagged: 1 } };
    const html = renderCoverageReportHTML(report);
    assert.ok(html.includes('1 mention'));
    assert.ok(!html.includes('1 mentions'));
});

// ----------------------------------------------------------------------------
// renderRegenerationDiffHTML
// ----------------------------------------------------------------------------

test('renderRegenerationDiffHTML: renders current vs derived panes', () => {
    const report = {
        candidates: [{
            entryUid: 1,
            title: 'Vault',
            currentContent: 'old text',
            derivedContent: 'new text from source',
            sourceRanges: ['msgs 1-3'],
            similarity: 0.42,
        }],
        summary: { total: 1, changed: 1 },
    };
    const html = renderRegenerationDiffHTML(report);
    assert.ok(html.includes('old text'));
    assert.ok(html.includes('new text from source'));
    assert.ok(html.includes('42.0%'));
    assert.ok(html.includes('msgs 1-3'));
    assert.ok(html.includes('data-action="accept"'));
    assert.ok(html.includes('data-action="reject"'));
});

test('renderRegenerationDiffHTML: escapes content in diff panes', () => {
    const report = {
        candidates: [{ entryUid: 1, title: 'X', currentContent: '<b>bold</b>', derivedContent: '<i>italic</i>', sourceRanges: [], similarity: 0 }],
        summary: { total: 1, changed: 1 },
    };
    const html = renderRegenerationDiffHTML(report);
    assert.ok(!html.includes('<b>bold</b>'));
    assert.ok(html.includes('&lt;b&gt;bold&lt;/b&gt;'));
});

test('renderRegenerationDiffHTML: shows empty-state message when no candidates', () => {
    const html = renderRegenerationDiffHTML({ candidates: [], summary: { total: 0, changed: 0 } });
    assert.ok(html.includes('No drifted entries'));
});

// ----------------------------------------------------------------------------
// renderTechnicalPassHTML
// ----------------------------------------------------------------------------

test('renderTechnicalPassHTML: renders issue cards with code + suggestion', () => {
    const report = {
        summary: { entriesChecked: 3, flaggedEntries: 1, totalIssues: 1 },
        issues: [{
            entryUid: 1,
            title: 'Test',
            severity: 'error',
            code: 'keyword-common-only',
            message: 'all keywords are common words',
            suggestion: 'add a proper noun keyword',
        }],
    };
    const html = renderTechnicalPassHTML(report);
    assert.ok(html.includes('keyword-common-only'));
    assert.ok(html.includes('all keywords are common words'));
    assert.ok(html.includes('add a proper noun keyword'));
    assert.ok(html.includes('data-action="fix"'));
});

test('renderTechnicalPassHTML: shows empty-state message when no issues', () => {
    const html = renderTechnicalPassHTML({ summary: { entriesChecked: 5, flaggedEntries: 0, totalIssues: 0 }, issues: [] });
    assert.ok(html.includes('No technical issues detected'));
});

// ----------------------------------------------------------------------------
// renderClaimReverificationHTML
// ----------------------------------------------------------------------------

test('renderClaimReverificationHTML: only renders non-confirmed verdicts', () => {
    const report = {
        summary: { confirmed: 1, flagged: 1, unknown: 0 },
        rangeVerdicts: [
            { uid: 1, title: 'A', range: 'msgs 1-2', verdict: 'confirmed', reason: 'ok' },
            { uid: 2, title: 'B', range: 'msgs 3-4', verdict: 'flagged', reason: 'contradiction' },
        ],
    };
    const html = renderClaimReverificationHTML(report);
    assert.ok(!html.includes('data-uid="1"'));
    assert.ok(html.includes('data-uid="2"'));
    assert.ok(html.includes('contradiction'));
});

test('renderClaimReverificationHTML: shows empty-state message when all confirmed', () => {
    const report = { summary: { confirmed: 2, flagged: 0, unknown: 0 }, rangeVerdicts: [
        { uid: 1, title: 'A', range: 'msgs 1-2', verdict: 'confirmed', reason: 'ok' },
    ]};
    const html = renderClaimReverificationHTML(report);
    assert.ok(html.includes('No claims flagged'));
});

// ----------------------------------------------------------------------------
// Popup adapters — synthetic (Node/test) path
// ----------------------------------------------------------------------------

test('showCoverageReportPopup: resolves synthetically without a popupShim', async () => {
    const report = { items: [{ key: 'Bob', severity: 'missing', sightings: 5 }], summary: { total: 1, flagged: 1 } };
    const result = await showCoverageReportPopup(report);
    assert.equal(result.decision, 'accept');
    assert.ok(result.synthetic);
});

test('showRegenerationDiffPopup: resolves synthetically without a popupShim', async () => {
    const report = { candidates: [], summary: { total: 0, changed: 0 } };
    const result = await showRegenerationDiffPopup(report);
    assert.equal(result.decision, 'accept');
    assert.ok(result.synthetic);
});

test('showTechnicalPassPopup: resolves synthetically without a popupShim', async () => {
    const report = { summary: { entriesChecked: 0, flaggedEntries: 0, totalIssues: 0 }, issues: [] };
    const result = await showTechnicalPassPopup(report);
    assert.equal(result.decision, 'accept');
    assert.ok(result.synthetic);
});

test('showClaimReverificationPopup: resolves synthetically without a popupShim', async () => {
    const report = { summary: { confirmed: 0, flagged: 0, unknown: 0 }, rangeVerdicts: [] };
    const result = await showClaimReverificationPopup(report);
    assert.equal(result.decision, 'accept');
    assert.ok(result.synthetic);
});

// ----------------------------------------------------------------------------
// Popup adapters — DOM shim path (minimal fake Popup)
// ----------------------------------------------------------------------------

function makeFakePopupShim({ affirmative = true } = {}) {
    // Minimal fake `Popup` class + `POPUP_TYPE` + `DOMPurify` that satisfies
    // the makePopupWrapper contract without a real DOM.
    class FakeDlg {
        constructor() { this._cards = []; }
        querySelectorAll(selector) {
            if (selector === '.stmb-audit-card') return this._cards;
            return [];
        }
    }
    class FakePopup {
        constructor(content) { this.content = content; this.dlg = new FakeDlg(); }
        async show() { return affirmative ? 1 : 0; } // 1 = POPUP_RESULT.AFFIRMATIVE
    }
    return {
        Popup: FakePopup,
        POPUP_TYPE: { TEXT: 'text' },
        DOMPurify: { sanitize: (html) => html },
    };
}

test('showCoverageReportPopup: with popupShim, cancel result on non-affirmative', async () => {
    const popupShim = makeFakePopupShim({ affirmative: false });
    const report = { items: [{ key: 'Bob', severity: 'missing', sightings: 1 }], summary: { total: 1, flagged: 1 } };
    const result = await showCoverageReportPopup(report, { popupShim });
    assert.equal(result.decision, 'cancel');
});

test('showCoverageReportPopup: with popupShim, affirmative resolves to accept with empty selections (no DOM focus)', async () => {
    const popupShim = makeFakePopupShim({ affirmative: true });
    const report = { items: [{ key: 'Bob', severity: 'missing', sightings: 1 }], summary: { total: 1, flagged: 1 } };
    const result = await showCoverageReportPopup(report, { popupShim });
    assert.equal(result.decision, 'accept');
    assert.ok(Array.isArray(result.generateKeys));
    assert.ok(Array.isArray(result.dismissKeys));
});

// ----------------------------------------------------------------------------
// P5.5 — decision capture click handler
// ----------------------------------------------------------------------------

// Build a richer fake Popup that holds a real DOM-ish card list. The handler
// is installed on the popup's dlg, so we dispatch click events on the
// buttons and the dataset flag is observed by collectDecisions.
function makeInteractivePopupShim({ affirmative = true, buttons = [] } = {}) {
    // buttons: [{cardKey, action, datasetInit}]
    const cards = buttons.map((b, i) => {
        const card = {
            dataset: { ...(b.datasetInit || {}) },
            _listeners: {},
            _buttons: [],
        };
        card.closest = (sel) => {
            if (sel === '.stmb-audit-action') {
                // Used by the click handler to find the button. We return the
                // first button matching the action so the dataset flag is set.
                return card._buttons[0] || null;
            }
            if (sel === '.stmb-audit-card') return card;
            return null;
        };
        card.querySelector = (sel) => {
            // For collectDecisions's :focus fallback — return null by default
            // (test verifies dataset flags win, so we intentionally don't
            // simulate :focus here).
            return null;
        };
        card.addEventListener = (event, fn) => {
            card._listeners[event] = fn;
        };
        // Build the buttons that the click handler will see.
        for (const btn of b.buttons || []) {
            const button = {
                dataset: { action: btn.action, key: btn.key, uid: btn.uid, code: btn.code, range: btn.range },
                closest: (sel) => {
                    if (sel === '.stmb-audit-action') return button;
                    if (sel === '.stmb-audit-card') return card;
                    return null;
                },
            };
            card._buttons.push(button);
        }
        card.dataset.key = b.cardKey || b.cardUid || String(i);
        if (b.cardUid != null) card.dataset.uid = String(b.cardUid);
        if (b.cardCode) card.dataset.code = b.cardCode;
        if (b.cardRange) card.dataset.range = b.cardRange;
        return card;
    });

    class FakeDlg {
        constructor() { this._cards = cards; this._listeners = {}; }
        querySelectorAll(selector) {
            if (selector === '.stmb-audit-card') return this._cards;
            return [];
        }
        addEventListener(event, fn) {
            this._listeners[event] = fn;
        }
        // Simulate a click on a button — the wrapper's click handler
        // walks up to the card and stamps the dataset.
        clickButton(cardIndex, buttonIndex) {
            const card = this._cards[cardIndex];
            if (!card) return;
            const btn = card._buttons[buttonIndex];
            if (!btn) return;
            const handler = this._listeners['click'];
            if (handler) handler({ target: btn });
        }
    }
    class FakePopup {
        constructor(content) { this.content = content; this.dlg = new FakeDlg(); }
        async show() { return affirmative ? 1 : 0; }
    }
    return {
        Popup: FakePopup,
        POPUP_TYPE: { TEXT: 'text' },
        DOMPurify: { sanitize: (html) => html },
        _dlg: FakeDlg, // for tests
    };
}

test('P5.5: coverage — clicking dismiss button sets dataset.dismissed, decision captured', async () => {
    const popupShim = makeInteractivePopupShim({
        affirmative: true,
        buttons: [
            {
                cardKey: 'Bob',
                buttons: [{ action: 'dismiss', key: 'Bob' }],
            },
            {
                cardKey: 'Alice',
                buttons: [{ action: 'generate', key: 'Alice' }],
            },
        ],
    });
    // Wrap so we can access the popup's dlg after open.
    let capturedDlg = null;
    const originalPopup = popupShim.Popup;
    popupShim.Popup = class extends originalPopup {
        constructor(content) {
            super(content);
            capturedDlg = this.dlg;
        }
    };
    const report = {
        items: [
            { key: 'Bob', severity: 'missing', sightings: 5 },
            { key: 'Alice', severity: 'missing', sightings: 3 },
        ],
        summary: { total: 2, flagged: 2 },
    };
    const resultPromise = showCoverageReportPopup(report, { popupShim });
    // The wrapper installs the click listener synchronously, so we can
    // dispatch events before awaiting the result.
    if (capturedDlg) {
        capturedDlg.clickButton(0, 0); // dismiss Bob
    }
    const result = await resultPromise;
    assert.equal(result.decision, 'accept');
    assert.deepEqual(result.dismissKeys, ['Bob']);
    assert.deepEqual(result.generateKeys, ['Alice']);
});

test('P5.5: regeneration — clicking reject button sets dataset.rejected, decision captured', async () => {
    const popupShim = makeInteractivePopupShim({
        affirmative: true,
        buttons: [
            {
                cardUid: 42,
                buttons: [{ action: 'reject', uid: 42 }],
            },
            {
                cardUid: 7,
                buttons: [{ action: 'accept', uid: 7 }],
            },
        ],
    });
    let capturedDlg = null;
    const originalPopup = popupShim.Popup;
    popupShim.Popup = class extends originalPopup {
        constructor(content) {
            super(content);
            capturedDlg = this.dlg;
        }
    };
    const report = {
        candidates: [
            { entryUid: 42, title: 'A', currentContent: 'x', derivedContent: 'y', sourceRanges: [], similarity: 0.5 },
            { entryUid: 7, title: 'B', currentContent: 'x', derivedContent: 'y', sourceRanges: [], similarity: 0.5 },
        ],
        summary: { total: 2, changed: 2 },
    };
    const resultPromise = showRegenerationDiffPopup(report, { popupShim });
    if (capturedDlg) {
        capturedDlg.clickButton(0, 0); // reject 42
    }
    const result = await resultPromise;
    assert.equal(result.decision, 'accept');
    assert.deepEqual(result.rejected, [42]);
    assert.deepEqual(result.accepted, [7]);
});

test('P5.5: technical — clicking dismiss button sets dataset.dismissed, decision captured', async () => {
    const popupShim = makeInteractivePopupShim({
        affirmative: true,
        buttons: [
            {
                cardUid: 11,
                cardCode: 'keyword-collision',
                buttons: [{ action: 'dismiss', uid: 11, code: 'keyword-collision' }],
            },
            {
                cardUid: 12,
                cardCode: 'constant-size',
                buttons: [{ action: 'fix', uid: 12, code: 'constant-size' }],
            },
        ],
    });
    let capturedDlg = null;
    const originalPopup = popupShim.Popup;
    popupShim.Popup = class extends originalPopup {
        constructor(content) {
            super(content);
            capturedDlg = this.dlg;
        }
    };
    const report = {
        summary: { entriesChecked: 2, flaggedEntries: 2, totalIssues: 2 },
        issues: [
            { entryUid: 11, title: 'A', severity: 'warn', code: 'keyword-collision', message: 'm', suggestion: '' },
            { entryUid: 12, title: 'B', severity: 'error', code: 'constant-size', message: 'm', suggestion: '' },
        ],
    };
    const resultPromise = showTechnicalPassPopup(report, { popupShim });
    if (capturedDlg) {
        capturedDlg.clickButton(0, 0); // dismiss 11
    }
    const result = await resultPromise;
    assert.equal(result.decision, 'accept');
    assert.deepEqual(result.dismissed, [{ uid: 11, code: 'keyword-collision' }]);
    assert.deepEqual(result.fixes, [{ uid: 12, code: 'constant-size' }]);
});

test('P5.5: claims — clicking dismiss button sets dataset.dismissed, decision captured', async () => {
    const popupShim = makeInteractivePopupShim({
        affirmative: true,
        buttons: [
            {
                cardUid: 21,
                cardRange: 'msgs 1-2',
                buttons: [{ action: 'dismiss', uid: 21, range: 'msgs 1-2' }],
            },
            {
                cardUid: 22,
                cardRange: 'msgs 3-4',
                buttons: [{ action: 'flag', uid: 22, range: 'msgs 3-4' }],
            },
        ],
    });
    let capturedDlg = null;
    const originalPopup = popupShim.Popup;
    popupShim.Popup = class extends originalPopup {
        constructor(content) {
            super(content);
            capturedDlg = this.dlg;
        }
    };
    const report = {
        summary: { confirmed: 0, flagged: 2, unknown: 0 },
        rangeVerdicts: [
            { uid: 21, title: 'A', range: 'msgs 1-2', verdict: 'flagged', reason: 'r' },
            { uid: 22, title: 'B', range: 'msgs 3-4', verdict: 'flagged', reason: 'r' },
        ],
    };
    const resultPromise = showClaimReverificationPopup(report, { popupShim });
    if (capturedDlg) {
        capturedDlg.clickButton(0, 0); // dismiss 21
    }
    const result = await resultPromise;
    assert.equal(result.decision, 'accept');
    assert.deepEqual(result.dismissed, [{ uid: 21, range: 'msgs 1-2' }]);
    assert.deepEqual(result.flagged, [{ uid: 22, range: 'msgs 3-4' }]);
});

test('P5.5: no click — falls back to default (all accepted / no dismiss)', async () => {
    const popupShim = makeInteractivePopupShim({
        affirmative: true,
        buttons: [
            { cardKey: 'Bob', buttons: [{ action: 'dismiss', key: 'Bob' }] },
        ],
    });
    const report = { items: [{ key: 'Bob', severity: 'missing', sightings: 1 }], summary: { total: 1, flagged: 1 } };
    const result = await showCoverageReportPopup(report, { popupShim });
    assert.equal(result.decision, 'accept');
    // No clicks fired → nothing dismissed, everything in generateKeys.
    assert.deepEqual(result.dismissKeys, []);
    assert.deepEqual(result.generateKeys, ['Bob']);
});
