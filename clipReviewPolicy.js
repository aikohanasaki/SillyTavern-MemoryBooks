// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

export const CLIP_REVIEW_TEMPLATE_KEY = 'clip-review';
export const CLIP_REVIEW_ENTRY_TITLE = 'Memory Assistance (STMB SidePrompt)';
export const LEGACY_CLIP_REVIEW_ENTRY_TITLE = 'Clip Review (STMB SidePrompt)';
export const CLIP_REVIEW_METADATA_KEY = 'STMB_clipReview';
export const MEMORY_ASSISTANCE_MODE_OFF = 'off';
export const MEMORY_ASSISTANCE_MODE_UPDATE = 'update';
export const MEMORY_ASSISTANCE_MODE_UPDATE_AND_SUGGEST = 'update_and_suggest';
export const MEMORY_ASSISTANCE_MODE_AUTOMATIC = 'automatic';

export function normalizeMemoryAssistanceMode(value, legacyAlwaysRun = false) {
    const normalized = String(value || '').trim().toLowerCase();
    if (normalized === 'suggest') return MEMORY_ASSISTANCE_MODE_UPDATE;
    if (['update and suggest', 'update-and-suggest'].includes(normalized)) return MEMORY_ASSISTANCE_MODE_UPDATE_AND_SUGGEST;
    if ([MEMORY_ASSISTANCE_MODE_OFF, MEMORY_ASSISTANCE_MODE_UPDATE, MEMORY_ASSISTANCE_MODE_UPDATE_AND_SUGGEST, MEMORY_ASSISTANCE_MODE_AUTOMATIC].includes(normalized)) {
        return normalized;
    }
    return legacyAlwaysRun ? MEMORY_ASSISTANCE_MODE_UPDATE : MEMORY_ASSISTANCE_MODE_OFF;
}

export function stableHashString(value) {
    const text = String(value || '');
    let hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
        hash ^= text.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
}

export function isTopicalClipEntry(entry) {
    return !!entry?.data?.extensions?.aikobots?.topical_clip;
}

export function makeClipReviewRecord(entry) {
    return {
        uid: String(entry?.uid ?? entry?.id ?? ''),
        type: isTopicalClipEntry(entry) ? 'topical' : 'ordinary',
        title: String(entry?.comment || ''),
        topic: String(entry?.data?.extensions?.aikobots?.topical_clip?.topic || ''),
        keywords: Array.isArray(entry?.key) ? entry.key.map(String) : [],
        content: String(entry?.content || ''),
        contentHash: stableHashString(entry?.content || ''),
    };
}

export function packClipReviewBatches(records, sceneText, tokenLimit, reserveTokens = 1200) {
    const estimate = value => Math.ceil(String(value || '').length / 4);
    const capacity = Math.max(1, Number(tokenLimit) - reserveTokens - estimate(sceneText));
    const batches = [];
    let current = [];
    let used = 0;
    for (const record of records || []) {
        const cost = estimate(JSON.stringify(record)) + 80;
        if (current.length > 0 && used + cost > capacity) {
            batches.push(current);
            current = [];
            used = 0;
        }
        current.push(record);
        used += cost;
    }
    if (current.length > 0) batches.push(current);
    return batches;
}

export function shouldPreserveClipReviewReport({ batchCount = 0, failedBatchCount = 0, suggestionPassRequested = false, suggestionPassSucceeded = false } = {}) {
    const everyReviewBatchFailed = batchCount > 0 && failedBatchCount === batchCount;
    const noSuggestionResult = !suggestionPassRequested || !suggestionPassSucceeded;
    return everyReviewBatchFailed && noSuggestionResult;
}

export function getMemoryAssistanceFailure(result = {}) {
    const status = String(result?.status || '');
    const failedBatchCount = Number(result?.failedBatchCount || 0);
    const failedCount = Number(result?.failedCount || 0);
    const suggestionPassFailed = result?.suggestionPassFailed === true;
    if (status !== 'failed' && failedBatchCount <= 0 && failedCount <= 0 && !suggestionPassFailed) {
        return null;
    }
    const messages = Array.isArray(result?.errors)
        ? result.errors.map(message => String(message || '').trim()).filter(Boolean)
        : [];
    return {
        message: messages[0] || 'Memory Assistance failed.',
        messages,
        status,
        failedBatchCount,
        failedCount,
        suggestionPassFailed,
    };
}

function stripJsonFence(text) {
    const raw = String(text || '').trim();
    const fenced = raw.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    return fenced ? fenced[1].trim() : raw;
}

function normalizeForMatch(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeForComparison(value) {
    return normalizeForMatch(value).toLocaleLowerCase();
}

export function parseClipSuggestionsResponse(text, existingTopicalRecords = []) {
    const parsed = JSON.parse(stripJsonFence(text));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)
        || Object.keys(parsed).length !== 1 || !Array.isArray(parsed.topics)) {
        throw new Error('Memory Assistance topic suggestions must be one JSON object containing a topics array.');
    }

    const existingTopics = new Set((existingTopicalRecords || [])
        .filter(record => record?.type === 'topical')
        .flatMap(record => [record.topic, record.title])
        .map(normalizeForComparison)
        .filter(Boolean));
    const acceptedTopics = new Set();
    const suggestions = [];

    for (const item of parsed.topics.slice(0, 5)) {
        if (!item || typeof item !== 'object' || Array.isArray(item)) continue;
        const topic = normalizeForMatch(item.topic);
        const comparableTopic = normalizeForComparison(topic);
        if (!topic || existingTopics.has(comparableTopic) || acceptedTopics.has(comparableTopic)) continue;

        const seenKeywords = new Set();
        const keywords = (Array.isArray(item.keywords) ? item.keywords : [])
            .map(normalizeForMatch)
            .filter(keyword => {
                const comparable = normalizeForComparison(keyword);
                if (!comparable || seenKeywords.has(comparable)) return false;
                seenKeywords.add(comparable);
                return true;
            });
        if (keywords.length === 0) keywords.push(topic);

        acceptedTopics.add(comparableTopic);
        suggestions.push({
            id: `topic-${stableHashString(`${comparableTopic}\u0000${keywords.map(normalizeForComparison).join('\u0000')}`)}`,
            topic,
            keywords,
        });
    }
    return suggestions;
}

export function parseClipReviewResponse(text, records, sceneMessages) {
    const parsed = JSON.parse(stripJsonFence(text));
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Memory Assistance response must be one JSON object mapping Clip UIDs to suggestions.');
    }

    const byUid = new Map((records || []).map(record => [String(record.uid), record]));
    const messages = (sceneMessages || []).map(message => ({
        id: Number(message.id),
        text: normalizeForMatch(message.mes),
    }));
    const accepted = [];
    const responseEntries = Object.entries(parsed);

    for (const [rawUid, rawSuggestion] of responseEntries) {
        const uid = String(rawUid);
        const record = byUid.get(uid);
        const suggestion = typeof rawSuggestion === 'string' ? rawSuggestion.trim() : '';
        if (!record || !suggestion) continue;

        if (record.type === 'ordinary') {
            const normalizedSuggestion = normalizeForMatch(suggestion);
            const sourceMessage = normalizedSuggestion
                ? messages.find(message => message.text.includes(normalizedSuggestion))
                : null;
            if (!sourceMessage) continue;
            accepted.push({
                uid,
                type: record.type,
                title: record.title,
                evidenceMessageIds: [sourceMessage.id],
                additions: [{ messageId: sourceMessage.id, text: suggestion }],
                contentHash: record.contentHash,
            });
        } else {
            accepted.push({
                uid,
                type: record.type,
                title: record.title,
                evidenceMessageIds: [],
                proposedContent: suggestion,
                contentHash: record.contentHash,
            });
        }
    }
    if (responseEntries.length > 0 && accepted.length === 0) {
        throw new Error('Memory Assistance returned suggestions, but none matched the requested Clips and response rules.');
    }
    return accepted;
}

export function renderClipReviewReport({ sceneStart, sceneEnd, candidates = [], topicSuggestions = [], status = 'complete', appliedCount = 0, failedCount = 0, reviewCount = 0, failedBatchCount = 0, suggestionPassCompleted = false, suggestionPassFailed = false }) {
    const lines = ['=== Memory Assistance ===', `Scene: messages ${sceneStart}-${sceneEnd}`];
    if (status === 'automatic') {
        lines.push('', `Automatic mode applied ${appliedCount} Clip update${appliedCount === 1 ? '' : 's'}.`);
        if (reviewCount > 0) lines.push(`${reviewCount} Topical Clip update${reviewCount === 1 ? '' : 's'} require${reviewCount === 1 ? 's' : ''} approval and remain below for review.`);
        if (failedCount > 0) lines.push(`${failedCount} suggested update${failedCount === 1 ? '' : 's'} could not be applied and remain below for review.`);
        if (reviewCount === 0 && failedCount === 0) lines.push('There are no suggestions awaiting review.');
        if (failedBatchCount > 0) lines.push(`${failedBatchCount} review batch${failedBatchCount === 1 ? '' : 'es'} failed, so the automatic results may be incomplete.`);
    } else if (status === 'cancelled') lines.push('', 'The latest Memory Assistance run was cancelled. There are no current suggestions.');
    else if (status === 'pending') lines.push('', 'Clip selection is required before this review can run.');
    else if (status === 'partial' && candidates.length === 0 && topicSuggestions.length === 0) lines.push('', 'Memory Assistance was incomplete. No reliable suggestions were saved.');
    else if (candidates.length === 0) lines.push('', 'No Clip updates were suggested for this scene.');
    if (suggestionPassFailed) lines.push('', 'Warning: Topical Clip discovery failed, so new-topic suggestions are unavailable for this scene.');
    if (status !== 'automatic' && failedBatchCount > 0) lines.push('', `${failedBatchCount} review batch${failedBatchCount === 1 ? '' : 'es'} failed, so existing-Clip update suggestions may be incomplete.`);
    if (candidates.length > 0) {
        if (status === 'partial') lines.push('', 'Warning: one or more Memory Assistance batches failed. The suggestions below are incomplete.');
        for (const candidate of candidates) {
            lines.push('', `## ${candidate.title}`, `Type: ${candidate.type === 'topical' ? 'Topical Clip' : 'Clip'}`);
            if (candidate.applyError) lines.push(`Automatic update error: ${candidate.applyError}`);
            if (candidate.reason) lines.push(`Reason: ${candidate.reason}`);
            if (candidate.evidenceMessageIds?.length) lines.push(`Source message: ${candidate.evidenceMessageIds.join(', ')}`);
            if (candidate.type === 'ordinary') {
                lines.push('Suggested additions:', ...candidate.additions.map(item => `- [${item.messageId}] ${item.text}`));
            } else {
                lines.push('Suggested replacement:', candidate.proposedContent);
            }
        }
    }
    if (topicSuggestions.length > 0) {
        lines.push('', '## Suggested New Topical Clips');
        for (const suggestion of topicSuggestions) {
            lines.push(`- ${suggestion.topic}${suggestion.keywords?.length ? ` — Keywords: ${suggestion.keywords.join(', ')}` : ''}`);
        }
    } else if (suggestionPassCompleted) {
        lines.push('', 'No new Topical Clip topics were suggested. Topics can still be added manually from Memory Assistance Suggestions.');
    }
    lines.push('', '=== END Memory Assistance ===');
    return lines.join('\n');
}
