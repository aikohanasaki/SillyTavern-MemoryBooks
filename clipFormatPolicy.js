// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

export const DEFAULT_CLIP_FORMAT = '=== {{TITLE}} ===\n\n{{CONTENT}}\n\n=== END {{TITLE}} ===';

export function getClipFormatKind(entry) {
    return entry?.data?.extensions?.aikobots?.combined_clips ? 'combined' : 'topical';
}

export function validateClipFormat(template) {
    const value = String(template ?? '');
    if ((value.match(/{{CONTENT}}/g) || []).length !== 1) throw new Error('The format must contain {{CONTENT}} exactly once.');
    return value;
}

export function renderClipFormat(template, title, content) {
    return validateClipFormat(template).replace(/{{(TITLE|CONTENT)}}/g, (_, key) => key === 'TITLE' ? String(title) : String(content));
}

export function readFormattedClip(entry) {
    const content = String(entry?.content || '');
    const format = entry?.data?.extensions?.aikobots?.clip_format;
    if (!format || typeof format.template !== 'string' || typeof format.title !== 'string') return null;
    try {
        const token = '{{CONTENT}}';
        const [before, after] = validateClipFormat(format.template).split(token);
        const prefix = before.replace(/{{TITLE}}/g, format.title);
        const suffix = after.replace(/{{TITLE}}/g, format.title);
        if (!content.startsWith(prefix) || !content.endsWith(suffix) || content.length < prefix.length + suffix.length) return null;
        return { template: format.template, title: format.title, body: content.slice(prefix.length, content.length - suffix.length) };
    } catch { return null; }
}

export function setClipFormat(entry, template, title) {
    entry.data = entry.data && typeof entry.data === 'object' ? entry.data : {};
    entry.data.extensions = entry.data.extensions && typeof entry.data.extensions === 'object' ? entry.data.extensions : {};
    entry.data.extensions.aikobots = entry.data.extensions.aikobots && typeof entry.data.extensions.aikobots === 'object'
        ? entry.data.extensions.aikobots : {};
    entry.data.extensions.aikobots.clip_format = { template, title };
}
