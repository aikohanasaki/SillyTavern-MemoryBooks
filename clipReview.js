// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import { Popup, POPUP_RESULT, POPUP_TYPE } from '../../../popup.js';
import { DOMPurify } from '../../../../lib.js';
import { extension_settings } from '../../../extensions.js';
import { chat_metadata } from '../../../../script.js';
import { loadWorldInfo, METADATA_KEY, world_names } from '../../../world-info.js';
import { translate } from '../../../i18n.js';
import { escapeHtml } from '../../../utils.js';
import { oai_settings } from '../../../openai.js';
import { requestCompletion } from './stmemory.js';
import { toReadableText } from './chatcompile.js';
import { getTemplate } from './sidePromptsManager.js';
import { resolveSidePromptConnection } from './sidePrompts.js';
import { getEntryByTitle, upsertLorebookEntryByTitle } from './addlore.js';
import { applyClipReviewSuggestion, isClipEntryTitle, showTopicalClipPopup } from './clipManager.js';
import { getCurrentManualLorebookResolution, markStmbPopup, withGoBackButton } from './utils.js';
import { withStmbWriteLane } from './stmbJobs.js';
import {
    CLIP_REVIEW_ENTRY_TITLE,
    CLIP_REVIEW_METADATA_KEY,
    CLIP_REVIEW_TEMPLATE_KEY,
    LEGACY_CLIP_REVIEW_ENTRY_TITLE,
    MEMORY_ASSISTANCE_MODE_AUTOMATIC,
    MEMORY_ASSISTANCE_MODE_OFF,
    MEMORY_ASSISTANCE_MODE_UPDATE_AND_SUGGEST,
    getMemoryAssistanceFailure,
    makeClipReviewRecord,
    normalizeMemoryAssistanceMode,
    packClipReviewBatches,
    parseClipReviewResponse,
    parseClipSuggestionsResponse,
    renderClipReviewReport,
    shouldPreserveClipReviewReport,
    stableHashString,
} from './clipReviewPolicy.js';

const MODULE_NAME = 'STMemoryBooks-ClipReview';

function tr(key, fallback, params = null) {
    let value = translate(fallback, key);
    if (params) {
        value = value.replace(/\{\{\s*(\w+)\s*\}\}/g, (_match, name) => {
            const replacement = params[name];
            return replacement === undefined || replacement === null ? '' : String(replacement);
        });
    }
    return value;
}

function getClipEntries(lorebookData) {
    return Object.values(lorebookData?.entries || {})
        .filter(entry => isClipEntryTitle(entry?.comment || ''))
        .sort((a, b) => String(a.comment || '').localeCompare(String(b.comment || '')));
}

function getMemoryAssistanceReportEntry(lorebookData) {
    return getEntryByTitle(lorebookData, CLIP_REVIEW_ENTRY_TITLE)
        || getEntryByTitle(lorebookData, LEGACY_CLIP_REVIEW_ENTRY_TITLE);
}

async function chooseClipRecords(records, lorebookName) {
    if (records.length <= 5) return { status: 'selected', records };
    const rows = records.map(record => `
        <label class="flex-container gap10px" style="align-items:flex-start;margin:5px 0">
            <input class="stmb-clip-review-choice" type="checkbox" value="${escapeHtml(record.uid)}">
            <span><strong>${escapeHtml(record.title)}</strong><br><small>${escapeHtml(record.type === 'topical' ? tr('STMemoryBooks_TopicalClip_Title', 'Topical Clip') : tr('STMemoryBooks_Compaction_TypeClip', 'Clip'))} · ${escapeHtml(record.type === 'topical' ? record.topic || record.keywords.join(', ') : record.keywords.join(', '))} · ${Math.ceil(record.content.length / 4)} ${escapeHtml(tr('STMemoryBooks_EstimatedTokens', 'estimated tokens'))}</small></span>
        </label>`).join('');
    const popup = new Popup(DOMPurify.sanitize(`
        <h3>${escapeHtml(tr('STMemoryBooks_ClipReview_SelectTitle', 'Choose Clips to review'))}</h3>
        <p>${escapeHtml(tr('STMemoryBooks_ClipReview_SelectDescription', '“{{lorebookName}}” contains more than five Clips. Select specific entries or query all of them.', { lorebookName }))}</p>
        <div style="max-height:420px;overflow-y:auto">${rows}</div>
    `), POPUP_TYPE.TEXT, '', {
        okButton: false,
        cancelButton: tr('STMemoryBooks_Cancel', 'Cancel'),
        customButtons: [
            { text: tr('STMemoryBooks_ClipReview_QuerySelected', 'Query Selected'), result: POPUP_RESULT.CUSTOM1, appendAtEnd: true },
            { text: tr('STMemoryBooks_ClipReview_QueryAll', 'Query All'), result: POPUP_RESULT.CUSTOM2, appendAtEnd: true },
        ],
    });
    markStmbPopup(popup);
    const result = await popup.show();
    if (result === POPUP_RESULT.CUSTOM2) return { status: 'selected', records };
    if (result !== POPUP_RESULT.CUSTOM1) return { status: 'cancelled', records: [] };
    const selected = new Set(Array.from(popup.dlg?.querySelectorAll('.stmb-clip-review-choice:checked') || []).map(input => String(input.value)));
    return { status: selected.size > 0 ? 'selected' : 'cancelled', records: records.filter(record => selected.has(record.uid)) };
}

function buildClipReviewPrompt(instructions, compiledScene, records) {
    const promptRecords = records.map(({ uid, type, title, topic, keywords, content }) => ({
        uid,
        type,
        title,
        topic,
        keywords,
        content,
    }));
    return `${instructions}

=== NEW SCENE ===
${toReadableText(compiledScene)}

=== EXISTING CLIPS ===
${JSON.stringify(promptRecords, null, 2)}

=== REQUIRED JSON RESPONSE ===
${tr('STMemoryBooks_ClipReview_ResponseContract', `Return one JSON object that maps each Clip UID needing an update to one suggestion string.
For an ordinary Clip, the string must be one exact excerpt copied from a single message in NEW SCENE.
For a Topical Clip, the string must be the complete revised Clip body.
Omit Clips that do not need an update. If no Clips need an update, return {}.
Return only JSON. Do not return an array, Markdown fence, reason, message ID, or explanation.`)}`;
}

function buildClipSuggestionsPrompt(instructions, compiledScene, records) {
    const existingTopicalClips = records
        .filter(record => record.type === 'topical')
        .map(({ title, topic, keywords }) => ({ title, topic, keywords }));
    return `${instructions}

=== NEW SCENE ===
${toReadableText(compiledScene)}

=== EXISTING TOPICAL CLIPS ===
${JSON.stringify(existingTopicalClips, null, 2)}

=== REQUIRED JSON RESPONSE ===
Return one JSON object with a "topics" array containing zero to five new Topical Clip suggestions.
Each item must contain "topic" as a non-empty string and "keywords" as an array of activation-keyword strings.
If no new topics are needed, return {"topics":[]}.
Return only JSON. Do not return Markdown fences, reasons, message IDs, or explanations.`;
}

async function requestMemoryAssistanceCompletion(template, profile, prompt, temperature = 0.2, signal = null) {
    const overrideIndex = template?.settings?.overrideProfileEnabled
        ? Number(template.settings.overrideProfileIndex)
        : null;
    const conn = Number.isFinite(overrideIndex)
        ? resolveSidePromptConnection(null, { overrideProfileIndex: overrideIndex })
        : resolveSidePromptConnection(profile);
    const extra = { ...(conn.extra || {}) };
    const maxTokens = Number(extension_settings?.STMemoryBooks?.moduleSettings?.maxTokens);
    if (Number.isFinite(maxTokens) && maxTokens > 0) extra.max_tokens = maxTokens;
    else if (oai_settings?.openai_max_tokens) extra.max_tokens = oai_settings.openai_max_tokens;
    const { text } = await requestCompletion({
        api: conn.api,
        model: conn.model || '',
        temperature: conn.temperature ?? temperature,
        prompt,
        endpoint: conn.endpoint,
        apiKey: conn.apiKey,
        connectionProfileId: conn.connectionProfileId,
        reverseProxy: !!conn.reverseProxy,
        extra,
        useChatCompletionService: !!conn.useChatCompletionService,
        chatCompletionPreset: conn.chatCompletionPreset || '',
        signal,
    });
    return text;
}

async function requestClipReviewBatch(template, compiledScene, records, profile, finalPrompt = '', signal = null) {
    const text = await requestMemoryAssistanceCompletion(
        template,
        profile,
        finalPrompt || buildClipReviewPrompt(template.prompt, compiledScene, records),
        0.2,
        signal,
    );
    return parseClipReviewResponse(text, records, compiledScene.messages);
}

async function requestClipSuggestions(template, compiledScene, records, profile, finalPrompt = '', signal = null) {
    const suggestionsPrompt = String(template?.settings?.suggestionsPrompt || '').trim();
    if (!suggestionsPrompt) throw new Error('The Memory Assistance topic suggestions prompt is missing.');
    const text = await requestMemoryAssistanceCompletion(
        template,
        profile,
        finalPrompt || buildClipSuggestionsPrompt(suggestionsPrompt, compiledScene, records),
        0.2,
        signal,
    );
    return parseClipSuggestionsResponse(text, records);
}

async function confirmOversizedBatch(estimatedTokens, threshold) {
    const popup = new Popup(DOMPurify.sanitize(`
        <h3>${escapeHtml(tr('STMemoryBooks_ClipReview_TokenWarningTitle', 'Memory Assistance token warning'))}</h3>
        <p>${escapeHtml(tr('STMemoryBooks_ClipReview_TokenWarningMessage', 'This Memory Assistance batch is estimated at {{estimatedTokens}} tokens, above the warning threshold of {{threshold}}.', { estimatedTokens, threshold }))}</p>
    `), POPUP_TYPE.CONFIRM, '', { okButton: tr('STMemoryBooks_TopicalClip_RunOnceAnyway', 'Run Once Anyway'), cancelButton: tr('STMemoryBooks_Cancel', 'Cancel') });
    markStmbPopup(popup);
    return await popup.show() === POPUP_RESULT.AFFIRMATIVE;
}

async function saveClipReviewReport(lorebookName, compiledScene, candidates, status, details = {}) {
    const sceneStart = compiledScene?.metadata?.sceneStart ?? 0;
    const sceneEnd = compiledScene?.metadata?.sceneEnd ?? 0;
    const metadata = {
        version: 2,
        status,
        generatedAt: new Date().toISOString(),
        chatId: compiledScene?.metadata?.chatId || '',
        sceneStart,
        sceneEnd,
        candidates,
        ...details,
    };
    await withStmbWriteLane({ type: 'lorebook', name: lorebookName }, async () => {
        const freshLorebook = await loadWorldInfo(lorebookName);
        if (!freshLorebook?.entries) throw new Error(`Lorebook "${lorebookName}" could not be loaded.`);
        const legacyEntry = getEntryByTitle(freshLorebook, LEGACY_CLIP_REVIEW_ENTRY_TITLE);
        if (legacyEntry && !getEntryByTitle(freshLorebook, CLIP_REVIEW_ENTRY_TITLE)) {
            legacyEntry.comment = CLIP_REVIEW_ENTRY_TITLE;
        }
        await upsertLorebookEntryByTitle(
            lorebookName,
            freshLorebook,
            CLIP_REVIEW_ENTRY_TITLE,
            renderClipReviewReport({ sceneStart, sceneEnd, candidates, status, ...details }),
            {
                defaults: { vectorized: false, selective: true, order: 20, position: 0 },
                metadataUpdates: { [CLIP_REVIEW_METADATA_KEY]: metadata },
                entryOverrides: { disable: true, constant: false, vectorized: false, preventRecursion: true, delayUntilRecursion: false },
            },
        );
    });
}

export async function runClipReviewAfterMemory(compiledScene, profile = null, options = {}) {
    const moduleSettings = extension_settings?.STMemoryBooks?.moduleSettings || {};
    const mode = normalizeMemoryAssistanceMode(
        options.mode ?? moduleSettings.memoryAssistanceMode,
        moduleSettings.clipReviewAlwaysAfterMemory === true,
    );
    if (mode === MEMORY_ASSISTANCE_MODE_OFF) return [];
    const names = Array.from(new Set([
        ...(Array.isArray(options.lorebookNames) ? options.lorebookNames : []),
        options.lorebookName,
    ].map(name => String(name || '').trim()).filter(Boolean)));
    if (names.length === 0) return [];
    const template = await getTemplate(CLIP_REVIEW_TEMPLATE_KEY);
    if (!template?.prompt?.trim()) throw new Error('The Memory Assistance prompt is missing.');
    const results = [];

    for (const lorebookName of names) {
        if (options.signal?.aborted) {
            const error = new Error('Cancelled');
            error.name = 'AbortError';
            throw error;
        }
        const lorebookData = await loadWorldInfo(lorebookName);
        if (!lorebookData?.entries) {
            if (options.requireLorebook) throw new Error(`Lorebook "${lorebookName}" could not be loaded.`);
            continue;
        }
        const records = getClipEntries(lorebookData).map(makeClipReviewRecord);
        const shouldSuggestTopics = mode === MEMORY_ASSISTANCE_MODE_UPDATE_AND_SUGGEST;
        if (records.length === 0 && !shouldSuggestTopics) {
            if (getMemoryAssistanceReportEntry(lorebookData)) {
                await saveClipReviewReport(lorebookName, compiledScene, [], 'complete');
            }
            results.push({ lorebookName, status: 'complete', candidates: [] });
            continue;
        }
        const selection = mode === MEMORY_ASSISTANCE_MODE_AUTOMATIC
            ? { status: 'selected', records }
            : records.length > 0
                ? await chooseClipRecords(records, lorebookName)
                : { status: 'selected', records: [] };
        if (selection.status === 'cancelled') {
            await saveClipReviewReport(lorebookName, compiledScene, [], 'cancelled');
            results.push({ lorebookName, status: 'cancelled', candidates: [] });
            continue;
        }
        const sceneText = toReadableText(compiledScene);
        const tokenLimit = Number(extension_settings?.STMemoryBooks?.moduleSettings?.tokenWarningThreshold) || 50000;
        let topicSuggestions = [];
        let suggestionPassFailed = false;
        let suggestionPassSucceeded = !shouldSuggestTopics;
        let suggestionPassCompleted = false;
        const errors = [];
        if (shouldSuggestTopics) {
            try {
                const finalPrompt = buildClipSuggestionsPrompt(template.settings?.suggestionsPrompt, compiledScene, records);
                const estimatedTokens = Math.ceil(finalPrompt.length / 4) + 400;
                if (estimatedTokens > tokenLimit && !await confirmOversizedBatch(estimatedTokens, tokenLimit)) {
                    suggestionPassFailed = true;
                } else {
                    topicSuggestions = await requestClipSuggestions(template, compiledScene, records, profile, finalPrompt, options.signal);
                    suggestionPassSucceeded = true;
                    suggestionPassCompleted = true;
                }
            } catch (error) {
                if (options.signal?.aborted || error?.name === 'AbortError') throw error;
                suggestionPassFailed = true;
                errors.push(String(error?.message || error));
                console.error(`${MODULE_NAME}: topic suggestion pass failed for "${lorebookName}":`, error);
                toastr.error(error?.message || tr('STMemoryBooks_ClipSuggestions_Failed', 'Memory Assistance topic discovery failed.'), 'STMemoryBooks');
            }
        }
        const batches = packClipReviewBatches(selection.records, sceneText, tokenLimit);
        const candidates = [];
        let failedBatches = 0;
        for (const batch of batches) {
            try {
                if (options.signal?.aborted) {
                    const error = new Error('Cancelled');
                    error.name = 'AbortError';
                    throw error;
                }
                const finalPrompt = buildClipReviewPrompt(template.prompt, compiledScene, batch);
                const estimatedTokens = Math.ceil(finalPrompt.length / 4) + 800;
                if (mode !== MEMORY_ASSISTANCE_MODE_AUTOMATIC
                    && estimatedTokens > tokenLimit
                    && !await confirmOversizedBatch(estimatedTokens, tokenLimit)) {
                    failedBatches++;
                    continue;
                }
                candidates.push(...await requestClipReviewBatch(template, compiledScene, batch, profile, finalPrompt, options.signal));
            } catch (error) {
                if (options.signal?.aborted || error?.name === 'AbortError') throw error;
                failedBatches++;
                errors.push(String(error?.message || error));
                console.error(`${MODULE_NAME}: batch failed for "${lorebookName}":`, error);
                toastr.error(error?.message || tr('STMemoryBooks_ClipReview_BatchFailed', 'A Memory Assistance batch failed.'), 'STMemoryBooks');
            }
        }
        const messageSource = {
            chat_id: compiledScene?.metadata?.chatId || '',
            start: compiledScene?.metadata?.sceneStart ?? null,
            end: compiledScene?.metadata?.sceneEnd ?? null,
        };
        candidates.forEach(candidate => { candidate.messageSource = messageSource; });
        if (shouldPreserveClipReviewReport({
            batchCount: batches.length,
            failedBatchCount: failedBatches,
            suggestionPassRequested: shouldSuggestTopics,
            suggestionPassSucceeded,
        })) {
            console.error(`${MODULE_NAME}: every batch failed for "${lorebookName}"; preserving the previous report.`);
            results.push({
                lorebookName,
                status: 'failed',
                candidates: [],
                failedBatchCount: failedBatches,
                suggestionPassFailed,
                errors,
            });
            continue;
        }
        if (mode === MEMORY_ASSISTANCE_MODE_AUTOMATIC) {
            let appliedCount = 0;
            const pendingCandidates = [];
            let failedCount = 0;
            let reviewCount = 0;
            for (const candidate of candidates) {
                if (candidate.type === 'topical') {
                    pendingCandidates.push(candidate);
                    reviewCount++;
                    continue;
                }
                try {
                    if (await applyClipReviewSuggestion(lorebookName, candidate, { skipLongEntryWarning: true })) appliedCount++;
                } catch (error) {
                    if (options.signal?.aborted || error?.name === 'AbortError') throw error;
                    console.error(`${MODULE_NAME}: automatic update failed for "${candidate.title}" in "${lorebookName}":`, error);
                    failedCount++;
                    errors.push(String(error?.message || error));
                    pendingCandidates.push({ ...candidate, applyError: error?.message || 'Automatic update failed.' });
                }
            }
            const details = {
                appliedCount,
                failedCount,
                reviewCount,
                failedBatchCount: failedBatches,
                topicSuggestions: [],
                suggestionPassCompleted: false,
                suggestionPassFailed: false,
                errors,
            };
            await saveClipReviewReport(lorebookName, compiledScene, pendingCandidates, 'automatic', details);
            results.push({ lorebookName, status: 'automatic', candidates: pendingCandidates, ...details });
            if (moduleSettings.showNotifications !== false) {
                const appliedMessage = appliedCount === 1
                    ? tr('STMemoryBooks_ClipReview_AutomaticAppliedOne', 'Memory Assistance automatically applied 1 Clip update.')
                    : tr('STMemoryBooks_ClipReview_AutomaticAppliedMany', 'Memory Assistance automatically applied {{count}} Clip updates.', { count: appliedCount });
                const reviewMessage = reviewCount === 1
                    ? tr('STMemoryBooks_ClipReview_TopicalAwaitingReviewOne', '1 Topical Clip update awaits approval.')
                    : reviewCount > 1
                        ? tr('STMemoryBooks_ClipReview_TopicalAwaitingReviewMany', '{{count}} Topical Clip updates await approval.', { count: reviewCount })
                        : '';
                toastr.info([appliedMessage, reviewMessage].filter(Boolean).join(' '), 'STMemoryBooks');
            }
            continue;
        }
        const status = failedBatches > 0 || suggestionPassFailed ? 'partial' : 'complete';
        const details = { failedBatchCount: failedBatches, topicSuggestions, suggestionPassCompleted, suggestionPassFailed, errors };
        await saveClipReviewReport(lorebookName, compiledScene, candidates, status, details);
        results.push({ lorebookName, status, candidates, ...details });
        if (status === 'complete' && extension_settings?.STMemoryBooks?.moduleSettings?.showNotifications !== false) {
            const updateMessage = candidates.length === 1
                ? tr('STMemoryBooks_ClipReview_SuggestedUpdateOne', '1 suggested update')
                : tr('STMemoryBooks_ClipReview_SuggestedUpdateMany', '{{count}} suggested updates', { count: candidates.length });
            const topicMessage = topicSuggestions.length === 1
                ? tr('STMemoryBooks_ClipReview_NewTopicOne', '1 new topic')
                : tr('STMemoryBooks_ClipReview_NewTopicMany', '{{count}} new topics', { count: topicSuggestions.length });
            toastr.info(shouldSuggestTopics
                ? tr('STMemoryBooks_ClipReview_FoundUpdatesAndTopics', 'Memory Assistance found {{updateMessage}} and {{topicMessage}}.', { updateMessage, topicMessage })
                : tr('STMemoryBooks_ClipReview_FoundUpdates', 'Memory Assistance found {{updateMessage}}.', { updateMessage }), 'STMemoryBooks');
        }
        if (suggestionPassCompleted) {
            await showClipTopicSuggestionsPopup(lorebookName, { allowEmpty: true });
        }
    }
    return results;
}

export function buildQueuedMemoryAssistanceJobs({ lorebookNames = [], compiledScene, profile = null, settings = null } = {}) {
    const moduleSettings = settings?.moduleSettings
        || extension_settings?.STMemoryBooks?.moduleSettings
        || {};
    const mode = normalizeMemoryAssistanceMode(
        moduleSettings.memoryAssistanceMode,
        moduleSettings.clipReviewAlwaysAfterMemory === true,
    );
    if (mode === MEMORY_ASSISTANCE_MODE_OFF) return [];
    const names = Array.from(new Set((lorebookNames || [])
        .map(name => String(name || '').trim())
        .filter(Boolean)));
    return names.map((lorebookName, index) => ({
        type: 'memoryAssistance',
        title: tr('STMemoryBooks_ClipReview_Name', 'Memory Assistance'),
        detail: compiledScene?.metadata
            ? `Messages ${compiledScene.metadata.sceneStart}-${compiledScene.metadata.sceneEnd}`
            : '',
        lorebookName,
        range: compiledScene?.metadata ? {
            sceneStart: compiledScene.metadata.sceneStart,
            sceneEnd: compiledScene.metadata.sceneEnd,
        } : null,
        payload: {
            trigger: 'onAfterMemory',
            lorebookName,
            compiledScene,
            profile,
            mode,
            targetOrder: index,
        },
    }));
}

export async function executeQueuedMemoryAssistanceJob(job, context) {
    const payload = job?.payload || {};
    const lorebookName = String(payload.lorebookName || job?.lorebookName || '').trim();
    if (!payload.compiledScene || !lorebookName) {
        throw new Error('Memory Assistance job snapshot is incomplete.');
    }
    context.setState('assembling_prompt', { detail: tr('STMemoryBooks_ClipReview_Name', 'Memory Assistance') });
    const results = await runClipReviewAfterMemory(payload.compiledScene, payload.profile || null, {
        lorebookName,
        mode: payload.mode,
        signal: context.signal,
        requireLorebook: true,
    });
    context.throwIfCancelled();
    const result = results.find(item => item.lorebookName === lorebookName)
        || { lorebookName, status: 'complete', candidates: [] };
    context.setResult(result);
    if (result.status === 'cancelled') {
        context.patch({ state: 'canceled', detail: tr('STMemoryBooks_Cancel', 'Cancel') });
        return;
    }
    const failure = getMemoryAssistanceFailure(result);
    if (failure) {
        throw new Error(failure.message);
    }
}

function getDefaultReviewLorebookName() {
    const resolution = getCurrentManualLorebookResolution();
    return resolution?.lorebookName || String(chat_metadata?.[METADATA_KEY] || '');
}

function getClipReviewReportDetails(metadata) {
    return {
        appliedCount: Number(metadata?.appliedCount || 0),
        failedCount: Number(metadata?.failedCount || 0),
        reviewCount: Number(metadata?.reviewCount || 0),
        failedBatchCount: Number(metadata?.failedBatchCount || 0),
        topicSuggestions: Array.isArray(metadata?.topicSuggestions) ? metadata.topicSuggestions : [],
        suggestionPassCompleted: metadata?.suggestionPassCompleted === true,
        suggestionPassFailed: metadata?.suggestionPassFailed === true,
    };
}

async function persistClipReviewMetadata(lorebookName, metadata) {
    await saveClipReviewReport(
        lorebookName,
        { metadata: { sceneStart: metadata.sceneStart, sceneEnd: metadata.sceneEnd, chatId: metadata.chatId } },
        Array.isArray(metadata.candidates) ? metadata.candidates : [],
        metadata.status || 'complete',
        getClipReviewReportDetails(metadata),
    );
}

function parseTopicKeywords(value, fallbackTopic = '') {
    const seen = new Set();
    const keywords = String(value || '')
        .split(/[\n,]+/)
        .map(keyword => keyword.replace(/\s+/g, ' ').trim())
        .filter(keyword => {
            const normalized = keyword.toLocaleLowerCase();
            if (!normalized || seen.has(normalized)) return false;
            seen.add(normalized);
            return true;
        });
    return keywords.length > 0 ? keywords : [fallbackTopic].filter(Boolean);
}

function renderTopicSuggestionRows(topicSuggestions) {
    return (topicSuggestions || []).map(suggestion => `
        <div class="info_block marginTop5 stmb-clip-topic-row" data-topic-id="${escapeHtml(suggestion.id)}">
            <label class="checkbox_label"><input class="stmb-clip-topic-selected" type="checkbox" checked><span>${escapeHtml(tr('STMemoryBooks_ClipSuggestions_Include', 'Create this Topical Clip'))}</span></label>
            <label class="world_entry_form_control"><span>${escapeHtml(tr('STMemoryBooks_TopicalClip_Topic', 'Topic'))}</span><input class="text_pole stmb-clip-topic-name" type="text" value="${escapeHtml(suggestion.topic)}"></label>
            <label class="world_entry_form_control"><span>${escapeHtml(tr('STMemoryBooks_TopicalClip_Keywords', 'Keywords'))}</span><input class="text_pole stmb-clip-topic-keywords" type="text" value="${escapeHtml((suggestion.keywords || []).join(', '))}"></label>
        </div>`).join('');
}

function collectTopicSuggestionRows(container, existingRecords) {
    const existingTopics = new Set((existingRecords || [])
        .filter(record => record.type === 'topical')
        .flatMap(record => [record.topic, record.title])
        .map(value => String(value || '').replace(/\s+/g, ' ').trim().toLocaleLowerCase())
        .filter(Boolean));
    const accepted = new Set();
    const selected = [];
    for (const [index, row] of Array.from(container?.querySelectorAll('.stmb-clip-topic-row') || []).entries()) {
        if (!row.querySelector('.stmb-clip-topic-selected')?.checked) continue;
        const topic = String(row.querySelector('.stmb-clip-topic-name')?.value || '').replace(/\s+/g, ' ').trim();
        const normalizedTopic = topic.toLocaleLowerCase();
        if (!topic || existingTopics.has(normalizedTopic) || accepted.has(normalizedTopic)) continue;
        accepted.add(normalizedTopic);
        const keywords = parseTopicKeywords(row.querySelector('.stmb-clip-topic-keywords')?.value, topic);
        selected.push({
            id: String(row.dataset.topicId || '').trim() || `topic-${stableHashString(`${normalizedTopic}\u0000${keywords.join('\u0000')}\u0000${index}`)}`,
            topic,
            keywords,
        });
    }
    return selected;
}

async function showClipTopicSuggestionsPopup(lorebookName, options = {}) {
    const lorebookData = await loadWorldInfo(lorebookName);
    const metadata = getMemoryAssistanceReportEntry(lorebookData)?.[CLIP_REVIEW_METADATA_KEY] || null;
    if (!metadata || !Array.isArray(metadata.topicSuggestions)) return;
    if (metadata.topicSuggestions.length === 0 && !options.allowEmpty) return;

    const popup = new Popup(DOMPurify.sanitize(`
        <h3>${escapeHtml(tr('STMemoryBooks_ClipSuggestions_Title', 'Suggested New Topical Clips'))}</h3>
        <p>${escapeHtml(tr('STMemoryBooks_ClipSuggestions_Description', 'Choose the topics to turn into Topical Clip drafts. You can edit suggestions or add your own topics.'))}</p>
        <div id="stmb-clip-topic-rows">${renderTopicSuggestionRows(metadata.topicSuggestions)}</div>
        <div class="buttons_block gap10px"><button id="stmb-clip-topic-add" type="button" class="menu_button">${escapeHtml(tr('STMemoryBooks_ClipSuggestions_Add', 'Add Topic'))}</button></div>
    `), POPUP_TYPE.TEXT, '', {
        wide: true,
        large: true,
        allowVerticalScrolling: true,
        okButton: tr('STMemoryBooks_ClipSuggestions_CreateSelected', 'Create Selected Drafts'),
        cancelButton: tr('STMemoryBooks_ClipSuggestions_KeepForLater', 'Keep for Later'),
    });
    markStmbPopup(popup);
    const showPromise = popup.show();
    const rows = popup.dlg?.querySelector('#stmb-clip-topic-rows');
    let addedRowCount = 0;
    popup.dlg?.querySelector('#stmb-clip-topic-add')?.addEventListener('click', () => {
        addedRowCount++;
        rows?.insertAdjacentHTML('beforeend', DOMPurify.sanitize(renderTopicSuggestionRows([{
            id: `topic-manual-${Date.now().toString(36)}-${addedRowCount}`,
            topic: '',
            keywords: [],
        }])));
        rows?.querySelector('.stmb-clip-topic-row:last-child .stmb-clip-topic-name')?.focus();
    });
    if (await showPromise !== POPUP_RESULT.AFFIRMATIVE) return;

    const currentLorebook = await loadWorldInfo(lorebookName);
    const existingRecords = getClipEntries(currentLorebook).map(makeClipReviewRecord);
    const selected = collectTopicSuggestionRows(rows, existingRecords);
    metadata.topicSuggestions = selected;
    await persistClipReviewMetadata(lorebookName, metadata);

    for (const suggestion of selected) {
        const saved = await showTopicalClipPopup({
            lorebookName,
            mode: 'create',
            topic: suggestion.topic,
            keywords: suggestion.keywords,
        });
        if (!saved) continue;
        metadata.topicSuggestions = metadata.topicSuggestions.filter(item => item.id !== suggestion.id);
        await persistClipReviewMetadata(lorebookName, metadata);
    }
}

export async function showClipReviewSuggestionsPopup(options = {}) {
    if (!Array.isArray(world_names) || world_names.length === 0) {
        toastr.error(tr('STMemoryBooks_Compaction_NoLorebooks', 'No Memory Books were found.'), 'STMemoryBooks');
        return;
    }
    const defaultName = getDefaultReviewLorebookName();
    const lorebookOptions = ['<option></option>', ...world_names.map(name => `<option value="${escapeHtml(name)}" ${name === defaultName ? 'selected' : ''}>${escapeHtml(name)}</option>`)].join('');
    const popup = new Popup(DOMPurify.sanitize(`
        <h3>${escapeHtml(tr('STMemoryBooks_ClipReview_SuggestionsTitle', 'Memory Assistance Suggestions'))}</h3>
        <select id="stmb-clip-review-book" class="text_pole">${lorebookOptions}</select>
        <div id="stmb-clip-review-suggestions" class="world_entry_form_control"></div>
    `), POPUP_TYPE.TEXT, '', options.showGoBack ? withGoBackButton({ wide: true, large: true, allowVerticalScrolling: true, okButton: false, cancelButton: tr('STMemoryBooks_Close', 'Close') }) : { wide: true, large: true, allowVerticalScrolling: true, okButton: false, cancelButton: tr('STMemoryBooks_Close', 'Close') });
    markStmbPopup(popup);
    let lorebookName = '';
    let lorebookData = null;
    let metadata = null;
    const render = () => {
        const container = popup.dlg?.querySelector('#stmb-clip-review-suggestions');
        if (!container) return;
        const candidates = metadata?.candidates || [];
        const candidateHtml = candidates.length ? candidates.map(candidate => {
            const currentEntry = Object.values(lorebookData?.entries || {}).find(entry => String(entry?.uid ?? entry?.id ?? '') === String(candidate.uid));
            return `
            <section data-clip-review-uid="${escapeHtml(candidate.uid)}" class="info_block marginTop10">
                <h4>${escapeHtml(candidate.title)}</h4>
                ${candidate.applyError ? `<p class="redWarning">${escapeHtml(candidate.applyError)}</p>` : ''}
                ${candidate.reason ? `<p>${escapeHtml(candidate.reason)}</p>` : ''}
                ${candidate.evidenceMessageIds?.length ? `<small>Source message: ${escapeHtml(candidate.evidenceMessageIds.join(', '))}</small>` : ''}
                <h5>${escapeHtml(tr('STMemoryBooks_Clip_CurrentContent', 'Current entry content'))}</h5>
                <textarea class="text_pole" rows="6" readonly>${escapeHtml(currentEntry?.content || '')}</textarea>
                <h5>${escapeHtml(tr('STMemoryBooks_ClipReview_SuggestedEdit', 'Suggested edit'))}</h5>
                <textarea class="text_pole stmb-clip-review-draft" rows="8">${escapeHtml(candidate.type === 'ordinary' ? candidate.additions.map(item => item.text).join('\n') : candidate.proposedContent)}</textarea>
                <div class="buttons_block gap10px"><button class="menu_button stmb-clip-review-apply">${escapeHtml(tr('STMemoryBooks_ClipReview_Apply', 'Apply'))}</button><button class="menu_button stmb-clip-review-dismiss">${escapeHtml(tr('STMemoryBooks_ClipReview_Dismiss', 'Dismiss'))}</button></div>
            </section>`;
        }).join('') : '';
        const topicSuggestions = metadata?.topicSuggestions || [];
        const canReviewTopics = metadata?.suggestionPassCompleted === true || topicSuggestions.length > 0;
        const topicHtml = canReviewTopics ? `
            <section class="info_block marginTop10">
                <h4>${escapeHtml(tr('STMemoryBooks_ClipSuggestions_Title', 'Suggested New Topical Clips'))}</h4>
                ${topicSuggestions.length ? `<ul>${topicSuggestions.map(item => `<li>${escapeHtml(item.topic)} — ${escapeHtml((item.keywords || []).join(', '))}</li>`).join('')}</ul>` : `<p>${escapeHtml(tr('STMemoryBooks_ClipSuggestions_None', 'No new topics were suggested. You can add one manually.'))}</p>`}
                <button type="button" class="menu_button stmb-clip-topics-review">${escapeHtml(tr('STMemoryBooks_ClipSuggestions_Review', 'Review Topics'))}</button>
            </section>` : '';
        container.innerHTML = (candidateHtml || topicHtml)
            ? `${topicHtml}${candidateHtml}`
            : `<div class="opacity70p">${escapeHtml(tr('STMemoryBooks_ClipReview_NoSuggestions', 'There are no current Memory Assistance suggestions.'))}</div>`;
    };
    const saveRemaining = async () => {
        await persistClipReviewMetadata(lorebookName, metadata);
    };
    const load = async name => {
        lorebookName = String(name || '');
        lorebookData = lorebookName ? await loadWorldInfo(lorebookName) : null;
        metadata = getMemoryAssistanceReportEntry(lorebookData)?.[CLIP_REVIEW_METADATA_KEY] || null;
        render();
    };
    const showPromise = popup.show();
    popup.dlg?.querySelector('#stmb-clip-review-book')?.addEventListener('change', event => { void load(event.target.value); });
    popup.dlg?.querySelector('#stmb-clip-review-suggestions')?.addEventListener('click', async event => {
        if (event.target.closest('.stmb-clip-topics-review')) {
            await showClipTopicSuggestionsPopup(lorebookName, { allowEmpty: true });
            await load(lorebookName);
            return;
        }
        const section = event.target.closest('[data-clip-review-uid]');
        if (!section || (!event.target.closest('.stmb-clip-review-apply') && !event.target.closest('.stmb-clip-review-dismiss'))) return;
        const uid = String(section.dataset.clipReviewUid || '');
        const candidate = metadata?.candidates?.find(item => String(item.uid) === uid);
        if (!candidate) return;
        if (event.target.closest('.stmb-clip-review-apply')) {
            const edited = String(section.querySelector('.stmb-clip-review-draft')?.value || '').trim();
            if (candidate.type === 'ordinary') {
                const lines = edited.split(/\r?\n/).map(text => text.trim()).filter(Boolean);
                candidate.additions = lines.map((text, index) => ({ ...(candidate.additions[index] || candidate.additions[0]), text }));
            } else candidate.proposedContent = edited;
            try {
                if (!await applyClipReviewSuggestion(lorebookName, candidate)) return;
            } catch (error) {
                toastr.error(error?.message || tr('STMemoryBooks_ClipReview_ApplyFailed', 'Failed to apply the Clip suggestion.'), 'STMemoryBooks');
                return;
            }
        }
        metadata.candidates = metadata.candidates.filter(item => String(item.uid) !== uid);
        if (metadata.status === 'automatic') {
            metadata.failedCount = metadata.candidates.filter(item => !!item.applyError).length;
            metadata.reviewCount = metadata.candidates.filter(item => item.type === 'topical' && !item.applyError).length;
        }
        await saveRemaining();
        render();
    });
    await load(defaultName);
    await showPromise;
}
