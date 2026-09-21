// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
// Local modification: migrate only recognized legacy Status instructions.
import { RELATIONSHIP_DEFAULTS } from './relationshipPromptDefaults.js';
import { LEGACY_STATUS_SIGNATURES } from './relationshipPromptLegacy.js';
import sha256 from 'js-sha256';

function normalize(text) {
    return text.replace(/\r\n?/g, '\n').split('\n').map(line => line.trim()).join('\n').trim();
}

async function fingerprint(text) {
    // LAN HTTP sessions on phones do not expose crypto.subtle. Keep migration
    // available there as well as on secure localhost/HTTPS connections.
    return sha256(normalize(text));
}

async function migrateField(text, field) {
    if (typeof text !== 'string' || !text.trim()) return text;
    const locale = LEGACY_STATUS_SIGNATURES[field][await fingerprint(text)];
    if (locale) return RELATIONSHIP_DEFAULTS[locale][field];

    // Preserve custom text and whitespace outside exact known lines/sections.
    const blocks = field === 'prompt' ? text.split(/(?<=\n)/) : text.split(/(?=^###)/m);
    let changed = false;
    for (let i = 0; i < blocks.length; i++) {
        const digest = await fingerprint(blocks[i]);
        if (field === 'prompt') {
            const lineLocale = LEGACY_STATUS_SIGNATURES.prompt[digest];
            if (!lineLocale) continue;
            blocks[i] = RELATIONSHIP_DEFAULTS[lineLocale].prompt + (blocks[i].endsWith('\n') ? '\n' : '');
        } else {
            const replacement = LEGACY_STATUS_SIGNATURES.sections[digest];
            if (!replacement) continue;
            blocks[i] = replacement.section < 0 ? '' : RELATIONSHIP_DEFAULTS[replacement.locale].sections[replacement.section] + '\n\n';
        }
        changed = true;
    }
    return changed ? blocks.join('') : text;
}

// Recognition only, never generation instructions or a filter on chat content.
const RETIRED_FACTORS = /\b(?:love|lust)[\s_-]*factor\b/i;
const RETIRED_ENDPOINT = /100\s*[=＝]\s*(?:life partners|compañeros de vida|pasangan hidup|pasangan seumur hidup|спутники жизни|生涯のパートナー|평생 파트너|生活伴[侣侶]|parceiros de vida)/i;
const STORY_SUGGESTIONS = /(?:^|\n)\s*-?\s*(?:story suggestions|sugerencias para la historia|saran cerita|cadangan cerita|предложения по сюжету|物語の提案|이야기 제안|故事建议|故事建議)\s*(?:\n|$)/i;

export function needsRelationshipPromptReview(template) {
    const text = `${template?.prompt || ''}\n${template?.responseFormat || ''}`;
    return RETIRED_FACTORS.test(text) || RETIRED_ENDPOINT.test(text)
        || ((template?.key === 'status' || template?.relationshipPromptVersion === 1) && STORY_SUGGESTIONS.test(text));
}

/** Pure migration: leave the source untouched until its backup and save succeed. */
export async function migrateRelationshipPrompts(doc) {
    const prompts = { ...doc.prompts };
    const changedKeys = [];
    for (const [key, template] of Object.entries(doc.prompts || {})) {
        const prompt = await migrateField(template.prompt, 'prompt');
        const responseFormat = await migrateField(template.responseFormat, 'responseFormat');
        if (prompt === template.prompt && responseFormat === template.responseFormat) continue;
        prompts[key] = { ...template, prompt, responseFormat, relationshipPromptVersion: 1 };
        changedKeys.push(key);
    }
    return { doc: changedKeys.length ? { ...doc, prompts } : doc, changedKeys };
}

/** Write the recovery copy first; failures must never fall back to defaults. */
export async function saveRelationshipDocument(doc, {
    writeDocument,
    filename,
    backupSource = doc,
    onlyIfMigrated = false,
}) {
    const result = await migrateRelationshipPrompts(doc);
    if (onlyIfMigrated && !result.changedKeys.length) return result;
    if (result.changedKeys.length) {
        const id = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
        const backupName = `stmb-side-prompts-before-neutral-status-${Date.now()}-${id}.json`;
        await writeDocument(backupName, backupSource);
        result.doc = {
            ...result.doc,
            relationshipPromptBackups: [...(Array.isArray(doc.relationshipPromptBackups) ? doc.relationshipPromptBackups : []), backupName],
        };
    }
    await writeDocument(filename, result.doc);
    return result;
}
