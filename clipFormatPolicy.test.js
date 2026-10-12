// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_CLIP_FORMAT, getClipFormatKind, readFormattedClip, renderClipFormat, setClipFormat, validateClipFormat } from './clipFormatPolicy.js';

function entry(template, title, body) {
    const value = { content: renderClipFormat(template, title, body), data: {} };
    setClipFormat(value, template, title);
    return value;
}

test('default, Markdown and body-only formats round trip without losing literal macros', () => {
    assert.equal(renderClipFormat(DEFAULT_CLIP_FORMAT, 'Alice', 'Fact.'), '=== Alice ===\n\nFact.\n\n=== END Alice ===');
    for (const template of [DEFAULT_CLIP_FORMAT, '## {{TITLE}}\n\n{{CONTENT}}', '{{CONTENT}}']) {
        const value = entry(template, 'Alice', 'Fact {{char}}.\n\nAnother fact.');
        const parsed = readFormattedClip(value);
        assert.equal(parsed.body, 'Fact {{char}}.\n\nAnother fact.');
        assert.equal(renderClipFormat(parsed.template, 'Renamed', `${parsed.body}\n\nNew fact.`),
            renderClipFormat(template, 'Renamed', 'Fact {{char}}.\n\nAnother fact.\n\nNew fact.'));
    }
});

test('format validation rejects missing or repeated content and ignores stale metadata', () => {
    assert.throws(() => validateClipFormat('## {{TITLE}}'));
    assert.throws(() => validateClipFormat('{{CONTENT}}\n{{CONTENT}}'));
    const value = entry('## {{TITLE}}\n{{CONTENT}}', 'Alice', 'Fact.');
    value.content = 'Manual edit without the saved format';
    assert.equal(readFormattedClip(value), null);
});

test('combined clips retain their independent format category', () => {
    const value = entry(DEFAULT_CLIP_FORMAT, 'Friends', 'Fact.');
    assert.equal(getClipFormatKind(value), 'topical');
    value.data.extensions.aikobots.combined_clips = { source_uids: ['1', '2'] };
    assert.equal(getClipFormatKind(value), 'combined');
});
