// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

export const COMBINE_CLIPS_INSTRUCTION = `Here are multiple information snippets covering related topics.

Analyze and consolidate them into a single coherent informational entry.

- Preserve all unique, relevant information.
- Remove redundancies and repeated details.
- Rephrase for clarity, accuracy, and consistency.
- Combine overlapping information rather than repeating it.
- If snippets conflict, prefer information explicitly established as a correction or update. Otherwise, preserve the conflicting claims concisely; do not invent a resolution.
- Do not add facts that are not supported by the source snippets.
- Condense wording aggressively for token efficiency while preserving unique facts, qualifications, and meaningful distinctions.`;

export function isTopicalClipForCombination(entry) {
    return typeof entry?.comment === 'string'
        && entry.comment.trimEnd().endsWith('[STMB Clip]')
        && !!entry?.data?.extensions?.aikobots?.topical_clip;
}

export function unionClipKeywords(entries) {
    const seen = new Set();
    const result = [];
    for (const entry of entries) {
        for (const raw of Array.isArray(entry?.key) ? entry.key : []) {
            const keyword = String(raw ?? '').trim();
            if (!keyword || seen.has(keyword)) continue;
            seen.add(keyword);
            result.push(keyword);
        }
    }
    return result;
}

export function snapshotCombineSource(entry) {
    return {
        uid: String(entry?.uid ?? entry?.id ?? ''),
        title: entry?.comment,
        content: entry?.content,
        keywords: Array.isArray(entry?.key) ? [...entry.key] : [],
        topical: isTopicalClipForCombination(entry),
    };
}

export function areCombineSourcesCurrent(snapshots, entries) {
    return snapshots.length >= 2 && snapshots.every(snapshot => {
        const current = entries.find(entry => String(entry?.uid ?? entry?.id ?? '') === snapshot.uid);
        return current && JSON.stringify(snapshotCombineSource(current)) === JSON.stringify(snapshot);
    });
}

export function buildCombineClipsPrompt(entries, title) {
    if (entries.length < 2) throw new Error('Select at least two Topical Clips.');
    return `${COMBINE_CLIPS_INSTRUCTION}\n\nNew entry title: ${title}\n\n${entries.map((entry, index) =>
        `=== SNIPPET ${index + 1}: ${entry.comment} ===\n${entry.content}\n=== END SNIPPET ${index + 1} ===`,
    ).join('\n\n')}\n\nReturn only the consolidated entry body, without a title or wrapper markers.`;
}
