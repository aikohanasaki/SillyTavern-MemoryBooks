// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// provenanceFallback.test.js — Structural + functional tests verifying the
// fork's provenance-line fallback path. After PHA-1533, the canonical
// implementation lives in nudgeHelpers.js (export `safeAppendProvenanceLine`
// and `appendProvenanceLine`); addlore.js carries only a single-line call
// site per plan §1.2.1. These tests pin that invariant.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
    appendProvenanceLine,
    safeAppendProvenanceLine,
    parseSceneRange,
} from './nudgeHelpers.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const addloreSrc = readFileSync(resolve(__dirname, 'addlore.js'), 'utf8');
const nudgeHelpersSrc = readFileSync(resolve(__dirname, 'nudgeHelpers.js'), 'utf8');

// ----------------------------------------------------------------------------
// Plan §1.2.1 invariants — upstream files only carry a single-line call site.
// ----------------------------------------------------------------------------

test('addlore.js does NOT inline the appendProvenanceLine helper (plan §1.2.1)', () => {
    // The legacy 30-line inline helper must be gone. The only implementation
    // now lives in nudgeHelpers.js.
    assert.doesNotMatch(
        addloreSrc,
        /function\s+appendProvenanceLineInline\s*\(/,
        'addlore.js still carries the inline appendProvenanceLineInline helper — should be moved to nudgeHelpers.js',
    );
    assert.doesNotMatch(
        addloreSrc,
        /appendProvenanceLineInline\s*\(/,
        'addlore.js still references appendProvenanceLineInline — call site should use safeAppendProvenanceLine',
    );
});

test('addlore.js calls safeAppendProvenanceLine via single-line call site', () => {
    // The hook block must reference the canonical wrapper from nudgeHelpers.
    assert.match(
        addloreSrc,
        /safeAppendProvenanceLine/,
        'addlore.js should call safeAppendProvenanceLine from nudgeHelpers.js',
    );
    // Sanity: the hook block is bounded (≤8 lines of code per the issue's
    // acceptance criterion, excluding comment lines and the surrounding
    // skipProvenance guard).
    const hookMatch = addloreSrc.match(
        /\/\/ STMBC-HOOK-PHASE4[\s\S]*?\n\s*\}\n/
    );
    assert.ok(hookMatch, 'expected to find the STMBC-HOOK-PHASE4 block');
    const block = hookMatch[0];
    const codeLines = block
        .split('\n')
        .filter((line) => line.trim().length > 0 && !line.trim().startsWith('//'));
    assert.ok(
        codeLines.length <= 8,
        `STMBC-HOOK-PHASE4 code block should be ≤8 lines, got ${codeLines.length}:\n${codeLines.join('\n')}`,
    );
});

test('nudgeHelpers.js exports the canonical wrapper', () => {
    assert.match(
        nudgeHelpersSrc,
        /export\s+function\s+safeAppendProvenanceLine\s*\(/,
        'nudgeHelpers.js should export safeAppendProvenanceLine',
    );
    assert.match(
        nudgeHelpersSrc,
        /export\s+function\s+appendProvenanceLine\s*\(/,
        'nudgeHelpers.js should still export appendProvenanceLine',
    );
    assert.match(
        nudgeHelpersSrc,
        /globalThis\.STMBC\?\.provenanceHelpers/,
        'safeAppendProvenanceLine should honour the globalThis.STMBC?.provenanceHelpers override',
    );
});

// ----------------------------------------------------------------------------
// Functional parity: safeAppendProvenanceLine matches appendProvenanceLine
// when no globalThis override is registered (the common case).
// ----------------------------------------------------------------------------

test('safeAppendProvenanceLine matches appendProvenanceLine with no globalThis override', () => {
    const cases = [
        ['', '3-5'],
        ['Some memory content.', '3-5'],
        ['Some memory content.\nsrc: msgs 3–5', '3-5'], // already present (idempotent)
        ['Memory A.', '7-9'],
        [null, '3-5'],
        ['Content.', null],
        ['Content.', ''],
        ['Content.', 'bad'],
        ['Content.', '5-3'], // end < start
        ['Content.', { start: 12, end: 34 }],
        ['Content.', { start: 'x', end: 5 }],
        ['Content.', { start: 0, end: 5 }],
    ];
    for (const [content, range] of cases) {
        assert.equal(
            safeAppendProvenanceLine(content, range),
            appendProvenanceLine(content, range),
            `mismatch for content=${JSON.stringify(content)}, range=${JSON.stringify(range)}`,
        );
    }
});

test('safeAppendProvenanceLine honours globalThis.STMBC.provenanceHelpers override', () => {
    const previous = globalThis.STMBC;
    try {
        let captured = null;
        globalThis.STMBC = {
            provenanceHelpers: {
                appendProvenanceLine: (content, sceneRange) => {
                    captured = { content, sceneRange };
                    return `${String(content ?? '')} [OVERRIDE:${sceneRange}]`;
                },
            },
        };
        const out = safeAppendProvenanceLine('hello', '9-12');
        assert.equal(out, 'hello [OVERRIDE:9-12]');
        assert.deepEqual(captured, { content: 'hello', sceneRange: '9-12' });
    } finally {
        if (previous === undefined) {
            delete globalThis.STMBC;
        } else {
            globalThis.STMBC = previous;
        }
    }
});

test('safeAppendProvenanceLine tolerates a malformed globalThis override (falls back)', () => {
    const previous = globalThis.STMBC;
    try {
        // Override missing the function — should fall back without throwing.
        globalThis.STMBC = { provenanceHelpers: { /* no appendProvenanceLine */ } };
        const out = safeAppendProvenanceLine('x', '3-5');
        assert.equal(out, 'x\nsrc: msgs 3–5\n');
    } finally {
        if (previous === undefined) {
            delete globalThis.STMBC;
        } else {
            globalThis.STMBC = previous;
        }
    }
});

// ----------------------------------------------------------------------------
// Real fixture: appendProvenanceLine on a typical memory generation output
// ----------------------------------------------------------------------------

test('real fixture: appendProvenanceLine on a Satire Fantasy Isekai scene summary', () => {
    const summary = [
        '# The Devil\'s Bargain',
        '**Timeline**: Moonsday, Emberfall 13, Year 1247 of the Aether Era',
        '',
        '## Summary',
        'Brother Gruk revealed the Archlector\'s betrayal; the cult dissolved.',
    ].join('\n');
    const out = appendProvenanceLine(summary, '3-7');
    assert.match(out, /cult dissolved\./);
    assert.match(out, /src: msgs 3\u20137/);
});

// ----------------------------------------------------------------------------
// parseSceneRange still exported (consumers downstream of nudgeHelpers rely
// on it; surfaced here so a future refactor doesn't drop it silently).
// ----------------------------------------------------------------------------

test('parseSceneRange is still exported and parses "3-5"', () => {
    assert.deepEqual(parseSceneRange('3-5'), { start: 3, end: 5 });
});