import { chat, chat_metadata } from '../../../../script.js';
import { extension_settings } from '../../../extensions.js';
import { getRegexedString, regex_placement } from '../../../extensions/regex/engine.js';
import { METADATA_KEY, world_names, loadWorldInfo } from '../../../world-info.js';
import { getSceneMarkers } from './sceneManager.js';
import { createSceneRequest, compileScene, toReadableText } from './chatcompile.js';
import { getCurrentApiInfo, getUIModelSettings, normalizeCompletionSource, resolveEffectiveConnectionFromProfile, clampInt, createStmbInFlightTask, isStmbStopError, getStmbStopEpoch, throwIfStmbStopped } from './utils.js';
import { requestCompletion } from './stmemory.js';
import { listByTrigger, findTemplateByName } from './sidePromptsManager.js';
import { upsertLorebookEntryByTitle, upsertLorebookEntriesBatch, getEntryByTitle } from './addlore.js';
import { fetchPreviousSummaries, showMemoryPreviewPopup } from './confirmationPopup.js';
import { t as __st_t_tag, translate } from '../../../i18n.js';
import { oai_settings } from '../../../openai.js';
import { applySidePromptMacros, collectTemplateRuntimeMacros, extractMacroTokens, parseSidePromptCommandInput } from './sidePromptMacros.js';
import { tr } from './i18nHelpers.js';


const MODULE_NAME = 'STMemoryBooks-SidePrompts';
let hasShownSidePromptRangeTip = false;

// Serialize preview popups to avoid overlap; enqueue in order of receipt
let previewQueue = Promise.resolve();
function enqueuePreview(task) {
    previewQueue = previewQueue.then(task).catch(err => {
        console.warn(`${MODULE_NAME}: preview task failed`, err);
    });
    return previewQueue;
}

/**
 * Strict lorebook requirement: no auto-create, no selection popup.
 * Throws with a user-facing toast if unavailable.
 * @returns {Promise<{ name: string, data: any }>}
 */
async function requireLorebookStrict() {
    const settings = extension_settings.STMemoryBooks;
    let lorebookName = null;

    // Manual mode uses per-chat manual selection in scene markers
    if (settings?.moduleSettings?.manualModeEnabled) {
        const stmbData = getSceneMarkers() || {};
        lorebookName = stmbData.manualLorebook ?? null;
    } else {
        // Chat-bound lorebook
        lorebookName = chat_metadata?.[METADATA_KEY] || null;
    }

    if (!lorebookName || !world_names || !world_names.includes(lorebookName)) {
        toastr.error(translate('No memory lorebook is assigned. Open Memory Books settings and select or bind a lorebook.', 'STMemoryBooks_Toast_NoMemoryLorebookAssigned'), 'STMemoryBooks');
        throw new Error(translate('No memory lorebook assigned', 'STMemoryBooks_Error_NoMemoryLorebookAssigned'));
    }

    try {
        const lorebookData = await loadWorldInfo(lorebookName);
        if (!lorebookData) throw new Error(translate('Failed to load lorebook', 'STMemoryBooks_Error_FailedToLoadLorebook'));
        return { name: lorebookName, data: lorebookData };
    } catch (err) {
        toastr.error(translate('Failed to load the selected lorebook.', 'STMemoryBooks_Toast_FailedToLoadLorebook'), 'STMemoryBooks');
        throw err;
    }
}

/**
 * Count non-system (visible) messages between exclusiveStart and inclusiveEnd indices
 */
function countVisibleMessagesSince(exclusiveStart, inclusiveEnd) {
    let count = 0;
    const start = Math.max(-1, Number.isFinite(exclusiveStart) ? exclusiveStart : -1);
    const end = Math.max(-1, inclusiveEnd);
    for (let i = start + 1; i <= end && i < chat.length; i++) {
        const m = chat[i];
        if (m && !m.is_system) count++;
    }
    return count;
}

/**
 * Compile a scene safely for [start, end], skipping system messages (handled by compileScene)
 */
function compileRange(start, end) {
    const req = createSceneRequest(start, end);
    return compileScene(req);
}

/**
 * Build a plain prompt by combining template prompt + prior content + compiled scene text
 */
function buildPrompt(templatePrompt, priorContent, compiledScene, responseFormat, previousSummaries = [], runtimeMacros = {}) {
    const parts = [];
    parts.push(applySidePromptMacros(templatePrompt, runtimeMacros));
    if (priorContent && String(priorContent).trim()) {
        parts.push('\n=== PRIOR ENTRY ===\n');
        parts.push(String(priorContent));
    }
    if (Array.isArray(previousSummaries) && previousSummaries.length > 0) {
        parts.push('\n=== PREVIOUS SCENE CONTEXT (DO NOT SUMMARIZE) ===\n');
        parts.push('These are previous memories for context only. Do NOT include them in your new output.\n\n');
        previousSummaries.forEach((m, i) => {
            parts.push(`Context ${i + 1} - ${m.title || 'Memory'}:\n`);
            parts.push(`${m.content || ''}\n`);
            if (Array.isArray(m.keywords) && m.keywords.length) {
                parts.push(`Keywords: ${m.keywords.join(', ')}\n`);
            }
            parts.push('\n');
        });
        parts.push('=== END PREVIOUS SCENE CONTEXT ===\n');
    }
    // Derive scene text from the compiled scene here to keep a single source of truth
    const sceneText = compiledScene ? toReadableText(compiledScene) : '';
    parts.push('\n=== SCENE TEXT ===\n');
    parts.push(sceneText);
    if (responseFormat && String(responseFormat).trim()) {
        parts.push('\n=== RESPONSE FORMAT ===\n');
        parts.push(applySidePromptMacros(responseFormat, runtimeMacros).trim());
    }
    const finalPrompt = parts.join('');

    // Apply regex transformations (honor global Use Regex toggle)
    const useRegex = !!(extension_settings?.STMemoryBooks?.moduleSettings?.useRegex);
    return useRegex ? getRegexedString(finalPrompt, regex_placement.USER_INPUT, { isPrompt: true }) : finalPrompt;
}

/**
 * Perform LLM call
 * - By default uses current ST UI settings
 * - If overrides are provided, uses the given api/model/temperature
 */
async function runLLM(prompt, overrides = null, options = {}) {
    // Determine connection
    let api, model, temperature, endpoint, apiKey;

    if (overrides && (overrides.api || overrides.model)) {
        api = normalizeCompletionSource(overrides.api || 'openai');
        model = overrides.model || '';
        temperature = typeof overrides.temperature === 'number' ? overrides.temperature : 0.7;
        endpoint = overrides.endpoint || null;
        apiKey = overrides.apiKey || null;
        console.debug(`${MODULE_NAME}: runLLM using overrides api=${api} model=${model} temp=${temperature}`);
    } else {
        const apiInfo = getCurrentApiInfo();
        const modelInfo = getUIModelSettings();
        api = normalizeCompletionSource(apiInfo.completionSource || apiInfo.api || 'openai');
        model = modelInfo.model || '';
        temperature = modelInfo.temperature ?? 0.7;
        console.debug(`${MODULE_NAME}: runLLM using UI settings api=${api} model=${model} temp=${temperature}`);
    }

    const extra = (overrides && typeof overrides.extra === 'object' && overrides.extra)
        ? { ...overrides.extra }
        : {};
    const stmbMaxTokensRaw = extension_settings?.STMemoryBooks?.moduleSettings?.maxTokens;
    const stmbMaxTokens = Number.parseInt(stmbMaxTokensRaw, 10);
    if (extra.max_tokens == null && extra.max_completion_tokens == null) {
        if (Number.isFinite(stmbMaxTokens) && stmbMaxTokens > 0) {
            extra.max_tokens = stmbMaxTokens;
        } else if (oai_settings?.openai_max_tokens) {
            extra.max_tokens = oai_settings.openai_max_tokens;
        }
    }

    const { text } = await requestCompletion({
        api,
        model,
        prompt,
        temperature,
        endpoint,
        apiKey,
        extra,
        signal: options?.signal || null,
    });
    
    // Apply regex transformations to the raw response (honor global Use Regex toggle)
    const useRegex = !!(extension_settings?.STMemoryBooks?.moduleSettings?.useRegex);
    return useRegex ? getRegexedString(text || '', regex_placement.AI_OUTPUT) : (text || '');
}

/**
 * Resolve which connection to use for side prompts, honoring user defaults.
 * - If a profile is provided with effectiveConnection/connection, use it.
 * - Otherwise, use the default memory profile from settings:
 *   - If default is dynamic "Current SillyTavern Settings", mirror current UI settings.
 *   - Else use the stored connection of that profile.
 * Fallback to UI settings only if settings are missing/invalid.
 * @returns {{api: string, model: string, temperature: number, endpoint?: string|null, apiKey?: string|null, extra?: Record<string,any>|undefined}} The resolved connection object.
 */
function resolveSidePromptConnection(profile = null, options = {}) {
    try {
        // Highest priority: explicit profile object (e.g., memory generation profile)
        if (profile && (profile.effectiveConnection || profile.connection)) {
            const rawConn = profile.effectiveConnection || profile.connection || {};
            const conn = resolveEffectiveConnectionFromProfile(profile);
            const { api, model, temperature, endpoint, apiKey } = conn;
            const extra = rawConn && typeof rawConn.extra === 'object' && rawConn.extra ? rawConn.extra : undefined;
            console.debug(`${MODULE_NAME}: resolveSidePromptConnection using provided profile api=${api} model=${model} temp=${temperature}`);
            return { api, model, temperature, endpoint, apiKey, extra };
        }

        const settings = extension_settings?.STMemoryBooks;
        const profiles = settings?.profiles || [];
        let idxOverride = options && Number.isFinite(options.overrideProfileIndex) ? Number(options.overrideProfileIndex) : null;

        // If a template-specified override index is provided, use it
        if (idxOverride !== null && profiles.length > 0) {
            if (idxOverride < 0 || idxOverride >= profiles.length) idxOverride = 0;
            const over = profiles[idxOverride];
            if (over?.useDynamicSTSettings || (over?.connection?.api === 'current_st')) {
                // Dynamic profile: mirror current UI
                const apiInfo = getCurrentApiInfo();
                const modelInfo = getUIModelSettings();
                const api = normalizeCompletionSource(apiInfo.completionSource || apiInfo.api || 'openai');
                const model = modelInfo.model || '';
                const temperature = modelInfo.temperature ?? 0.7;
                console.debug(`${MODULE_NAME}: resolveSidePromptConnection using UI via template override profile index=${idxOverride} api=${api} model=${model} temp=${temperature}`);
                return { api, model, temperature };
            } else {
                const conn = over?.connection || {};
                const api = normalizeCompletionSource(conn.api || 'openai');
                const model = conn.model || '';
                const temperature = typeof conn.temperature === 'number' ? conn.temperature : 0.7;
                const endpoint = conn.endpoint || null;
                const apiKey = conn.apiKey || null;
                const extra = conn && typeof conn.extra === 'object' && conn.extra ? conn.extra : undefined;
                console.debug(`${MODULE_NAME}: resolveSidePromptConnection using template override profile index=${idxOverride} api=${api} model=${model} temp=${temperature}`);
                return { api, model, temperature, endpoint, apiKey, extra };
            }
        }

        // Otherwise: use STMB default profile (may be dynamic)
        let idx = Number(settings?.defaultProfile ?? 0);
        if (!Array.isArray(profiles) || profiles.length === 0) {
            // No profiles available: mirror UI
            const apiInfo = getCurrentApiInfo();
            const modelInfo = getUIModelSettings();
            const api = normalizeCompletionSource(apiInfo.completionSource || apiInfo.api || 'openai');
            const model = modelInfo.model || '';
            const temperature = modelInfo.temperature ?? 0.7;
            console.debug(`${MODULE_NAME}: resolveSidePromptConnection fallback to UI (no profiles) api=${api} model=${model} temp=${temperature}`);
            return { api, model, temperature };
        }
        if (!Number.isFinite(idx) || idx < 0 || idx >= profiles.length) idx = 0;

        const def = profiles[idx];
        if (def?.useDynamicSTSettings || (def?.connection?.api === 'current_st')) {
            // Default memory profile is "Current SillyTavern Settings" => use UI
            const apiInfo = getCurrentApiInfo();
            const modelInfo = getUIModelSettings();
            const api = normalizeCompletionSource(apiInfo.completionSource || apiInfo.api || 'openai');
            const model = modelInfo.model || '';
            const temperature = modelInfo.temperature ?? 0.7;
            console.debug(`${MODULE_NAME}: resolveSidePromptConnection using UI via dynamic default profile api=${api} model=${model} temp=${temperature}`);
            return { api, model, temperature };
        } else {
            const conn = def?.connection || {};
            const api = normalizeCompletionSource(conn.api || 'openai');
            const model = conn.model || '';
            const temperature = typeof conn.temperature === 'number' ? conn.temperature : 0.7;
            const endpoint = conn.endpoint || null;
            const apiKey = conn.apiKey || null;
            const extra = conn && typeof conn.extra === 'object' && conn.extra ? conn.extra : undefined;
            console.debug(`${MODULE_NAME}: resolveSidePromptConnection using default profile api=${api} model=${model} temp=${temperature}`);
            return { api, model, temperature, endpoint, apiKey, extra };
        }
    } catch (err) {
        // Ultimate fallback: UI
        const apiInfo = getCurrentApiInfo();
        const modelInfo = getUIModelSettings();
        const api = normalizeCompletionSource(apiInfo.completionSource || apiInfo.api || 'openai');
        const model = modelInfo.model || '';
        const temperature = modelInfo.temperature ?? 0.7;
        console.warn(`${MODULE_NAME}: resolveSidePromptConnection error; falling back to UI`, err);
        return { api, model, temperature };
    }
}

/**
 * Lorebook settings helpers for side prompts
 */
function toNumberOr(value, fallback) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

/**
 * Read effective lorebook settings from a template, with safe defaults.
 * constVectMode: 'link' (vectorized, default) | 'green' (normal) | 'blue' (constant)
 * orderMode: 'auto' | 'manual' (if manual, orderValue is used)
 */
function getEffectiveLorebookSettingsForTemplate(tpl) {
    const lb = (tpl && tpl.settings && tpl.settings.lorebook) || {};
    return {
        constVectMode: lb.constVectMode || 'link',
        position: toNumberOr(lb.position, 0),
        orderMode: lb.orderMode === 'manual' ? 'manual' : 'auto',
        orderValue: toNumberOr(lb.orderValue, 100),
        preventRecursion: lb.preventRecursion !== false,
        delayUntilRecursion: !!lb.delayUntilRecursion,
        ignoreBudget: !!lb.ignoreBudget,
        outletName: String(lb.outletName || ''),
    };
}

/**
 * Build defaults (for create-time) and entryOverrides (for create+update) for upsert calls
 */
function resolveLorebookEntryKeywords(lbs, runtimeMacros = {}) {
    const rawTemplate = String(lbs?.entryKeywords || '').trim();
    if (!rawTemplate) {
        return [];
    }

    const resolved = applySidePromptMacros(rawTemplate, runtimeMacros);
    const keywords = [];
    const seen = new Set();

    for (const part of resolved.split(/[\n,]+/)) {
        const token = String(part || '').trim();
        if (!token) continue;
        if (extractMacroTokens(token).length > 0) continue;
        const normalized = token.toLowerCase();
        if (seen.has(normalized)) continue;
        seen.add(normalized);
        keywords.push(token);
    }

    return keywords;
}

function makeUpsertParamsFromLorebook(lbs, runtimeMacros = {}) {
    const defaults = {
        vectorized: lbs.constVectMode === 'link',
        selective: true,
        order: lbs.orderMode === 'manual' ? toNumberOr(lbs.orderValue, 100) : 100,
        position: toNumberOr(lbs.position, 0),
    };
    const entryOverrides = {
        constant: lbs.constVectMode === 'blue',
        vectorized: lbs.constVectMode === 'link',
        preventRecursion: !!lbs.preventRecursion,
        delayUntilRecursion: !!lbs.delayUntilRecursion,
        ignoreBudget: !!lbs.ignoreBudget,
    };
    if (lbs.orderMode === 'manual') {
        entryOverrides.order = toNumberOr(lbs.orderValue, 100);
    }
    if (Number(lbs.position) === 7 && lbs.outletName) {
        entryOverrides.outletName = String(lbs.outletName);
    }
    const keywords = resolveLorebookEntryKeywords(lbs, runtimeMacros);
    if (keywords.length > 0) {
        entryOverrides.key = keywords;
    }
    return { defaults, entryOverrides };
}

function getSidePromptTitleSuffix() {
    return ' (STMB SidePrompt)';
}

function getResolvedSidePromptTitleBase(tpl, runtimeMacros = {}) {
    const overrideRaw = String(tpl?.settings?.lorebook?.entryTitleOverride || '').trim();
    const fallbackBase = String(tpl?.name || '').trim() || 'Side Prompt';
    if (!overrideRaw) {
        return fallbackBase;
    }

    const resolved = applySidePromptMacros(overrideRaw, runtimeMacros).trim();
    return resolved || fallbackBase;
}

function getUnifiedSidePromptTitle(tpl, runtimeMacros = {}) {
    const baseTitle = getResolvedSidePromptTitleBase(tpl, runtimeMacros);
    const suffix = getSidePromptTitleSuffix();
    return baseTitle.endsWith(suffix) ? baseTitle : `${baseTitle}${suffix}`;
}

function getSidePromptLookupTitles(tpl, runtimeMacros = {}, fallbackKinds = []) {
    const titles = [getUnifiedSidePromptTitle(tpl, runtimeMacros)];
    const hasTitleOverride = !!String(tpl?.settings?.lorebook?.entryTitleOverride || '').trim();
    if (!hasTitleOverride) {
        for (const kind of fallbackKinds) {
            if (kind === 'plotpoints') {
                titles.push(`${tpl.name} (STMB Plotpoints)`);
            } else if (kind === 'scoreboard') {
                titles.push(`${tpl.name} (STMB Scoreboard)`);
            } else if (kind === 'tracker') {
                titles.push(`${tpl.name} (STMB Tracker)`);
            }
        }
    }
    return titles;
}

function findFirstLoreEntryByTitle(loreData, titles = []) {
    for (const title of titles) {
        const entry = getEntryByTitle(loreData, title);
        if (entry) return entry;
    }
    return null;
}

async function prepareSidePromptRun({ tpl, loreData, compiledScene, defaultOverrides = null, fallbackKinds = [], runtimeMacros = {} }) {
    const unifiedTitle = getUnifiedSidePromptTitle(tpl, runtimeMacros);
    const existing = findFirstLoreEntryByTitle(loreData, getSidePromptLookupTitles(tpl, runtimeMacros, fallbackKinds));
    const prior = existing?.content || '';

    let prevSummaries = [];
    const pmCountRaw = Number(tpl?.settings?.previousMemoriesCount ?? 0);
    const pmCount = Math.max(0, Math.min(7, pmCountRaw));
    if (pmCount > 0) {
        try {
            const res = await fetchPreviousSummaries(pmCount, extension_settings, chat_metadata);
            prevSummaries = res?.summaries || [];
        } catch {}
    }

    const finalPrompt = buildPrompt(tpl.prompt, prior, compiledScene, tpl.responseFormat, prevSummaries, runtimeMacros);
    const idx = Number(tpl?.settings?.overrideProfileIndex);
    const useOverride = !!tpl?.settings?.overrideProfileEnabled && Number.isFinite(idx);
    const conn = useOverride
        ? resolveSidePromptConnection(null, { overrideProfileIndex: idx })
        : (defaultOverrides || resolveSidePromptConnection(null));

    return { unifiedTitle, existing, prior, finalPrompt, conn };
}

async function runSidePromptAttempt({ taskLabel, finalPrompt, conn, runEpoch }) {
    throwIfStmbStopped(runEpoch);
    const task = createStmbInFlightTask(taskLabel);
    try {
        const text = await runLLM(finalPrompt, conn, { signal: task.signal });
        task.throwIfStopped();
        return text;
    } finally {
        task.finish();
    }
}

function ensureSidePromptTextNotBlank(text, tpl, trigger) {
    if (String(text ?? '').trim()) return true;

    const name = String(tpl?.name || 'Unknown');
    console.error(`${MODULE_NAME}: SidePrompt returned blank content; skipping save`, {
        trigger,
        name,
        key: tpl?.key || null,
    });
    toastr.error(
        tr(
            'STMemoryBooks_Toast_SidePromptBlankNotSaved',
            'SidePrompt "{{name}}" returned blank content. No changes were saved.',
            { name },
        ),
        'STMemoryBooks',
    );
    return false;
}

function buildSidePromptPreviewSceneData(compiledScene) {
    return {
        sceneStart: compiledScene?.metadata?.sceneStart ?? 0,
        sceneEnd: compiledScene?.metadata?.sceneEnd ?? 0,
        messageCount: compiledScene?.metadata?.messageCount ?? (compiledScene?.messages?.length ?? 0),
    };
}

async function resolveSidePromptPreview({
    tpl,
    initialText,
    finalPrompt,
    conn,
    compiledScene,
    runEpoch,
    queuePreview = false,
    retryTaskLabel,
}) {
    let textToSave = initialText;
    const settings = extension_settings?.STMemoryBooks;
    if (!settings?.moduleSettings?.showMemoryPreviews) {
        return { approved: true, text: textToSave };
    }

    const sceneDataForPreview = buildSidePromptPreviewSceneData(compiledScene);
    const profileSettingsForPreview = { name: 'SidePrompt' };

    while (true) {
        let previewResult;
        const memoryResult = {
            extractedTitle: getUnifiedSidePromptTitle(tpl),
            content: textToSave,
            suggestedKeys: [],
        };

        if (queuePreview) {
            await enqueuePreview(async () => {
                previewResult = await showMemoryPreviewPopup(memoryResult, sceneDataForPreview, profileSettingsForPreview, { lockTitle: true });
            });
        } else {
            previewResult = await showMemoryPreviewPopup(memoryResult, sceneDataForPreview, profileSettingsForPreview, { lockTitle: true });
        }

        if (previewResult?.action === 'cancel') {
            return { approved: false, text: textToSave };
        }

        if (previewResult?.action === 'retry') {
            textToSave = await runSidePromptAttempt({
                taskLabel: retryTaskLabel,
                finalPrompt,
                conn,
                runEpoch,
            });
            continue;
        }

        if (previewResult?.action === 'edit' && previewResult.memoryData) {
            textToSave = previewResult.memoryData.content ?? textToSave;
        }

        return { approved: true, text: textToSave };
    }
}

/**
 * Evaluate tracker prompts and fire if thresholds are met
 */
export async function evaluateTrackers() {
    const parentTask = createStmbInFlightTask('SidePrompts:onInterval');
    const evalEpoch = parentTask.epoch;
    try {
        throwIfStmbStopped(evalEpoch);
        const enabledInterval = await listByTrigger('onInterval');
        if (!enabledInterval || enabledInterval.length === 0) return;

        // Ensure lorebook exists up-front
        const lore = await requireLorebookStrict();

        const currentLast = chat.length - 1;
        if (currentLast < 0) return;

        for (const tpl of enabledInterval) {
            const unifiedTitle = `${tpl.name} (STMB SidePrompt)`;
            const legacyTitle = `${tpl.name} (STMB Tracker)`;

            // Read existing entry to get last checkpoint (generic first, then legacy)
            const existing = getEntryByTitle(lore.data, unifiedTitle) || getEntryByTitle(lore.data, legacyTitle);
            const lastMsgId = Number(
                (existing && existing[`STMB_sp_${tpl.key}_lastMsgId`]) ??
                (existing && existing.STMB_tracker_lastMsgId) ??
                -1
            );
            const lastRunAt = existing?.[`STMB_sp_${tpl.key}_lastRunAt`]
                ? Date.parse(existing[`STMB_sp_${tpl.key}_lastRunAt`])
                : (existing?.STMB_tracker_lastRunAt ? Date.parse(existing.STMB_tracker_lastRunAt) : null);
            const now = Date.now();

            // Internal debounce to prevent disk thrash (not user-configurable)
            const debounceMs = 10_000; // 10 seconds
            if (lastRunAt && now - lastRunAt < debounceMs) {
                continue;
            }

            // Count visible messages since last checkpoint
            const visibleSince = countVisibleMessagesSince(lastMsgId, currentLast);
            const threshold = Math.max(1, Number(tpl?.triggers?.onInterval?.visibleMessages ?? 50));
            if (visibleSince < threshold) {
                continue;
            }

            // Build compiled scene for (lastMsgId+1 .. currentLast) with cap
            const start = Math.max(0, lastMsgId + 1);
            const cap = 200;
            const boundedStart = Math.max(start, currentLast - cap + 1);

            let compiled = null;
            try {
                compiled = compileRange(boundedStart, currentLast);
            } catch (err) {
                console.warn(`${MODULE_NAME}: Interval compile failed:`, err);
                continue;
            }

            // Build prompt with prior content and optional previous memories
            const prior = existing?.content || '';
            let prevSummaries = [];
            const pmCountRaw = Number(tpl?.settings?.previousMemoriesCount ?? 0);
            const pmCount = Math.max(0, Math.min(7, pmCountRaw));
            if (pmCount > 0) {
                try {
                    const res = await fetchPreviousSummaries(pmCount, extension_settings, chat_metadata);
                    prevSummaries = res?.summaries || [];
                } catch {}
            }
            const finalPrompt = buildPrompt(tpl.prompt, prior, compiled, tpl.responseFormat, prevSummaries);

            // Call LLM
            let resultText = '';
            const runEpoch = getStmbStopEpoch();
            try {
            const idx = Number(tpl?.settings?.overrideProfileIndex);
            const useOverride = !!tpl?.settings?.overrideProfileEnabled && Number.isFinite(idx);
            const overrides = useOverride ? resolveSidePromptConnection(null, { overrideProfileIndex: idx }) : resolveSidePromptConnection(null);
            console.log(`${MODULE_NAME}: SidePrompt attempt`, {
                trigger: 'onInterval',
                name: tpl.name,
                key: tpl.key,
                range: `${boundedStart}-${currentLast}`,
                visibleSince,
                threshold,
                api: overrides.api,
                model: overrides.model,
            });
            const task = createStmbInFlightTask(`SidePrompt:onInterval:${tpl?.key || tpl?.name || 'unknown'}`);
            try {
                resultText = await runLLM(finalPrompt, overrides, { signal: task.signal });
                task.throwIfStopped();
            } finally {
                task.finish();
            }
            } catch (err) {
                if (isStmbStopError(err)) return;
                console.error(`${MODULE_NAME}: Interval sideprompt LLM failed:`, err);
                toastr.error(__st_t_tag`SidePrompt "${tpl.name}" failed: ${err.message}`, 'STMemoryBooks');
                continue;
            }

            throwIfStmbStopped(runEpoch);
            if (!ensureSidePromptTextNotBlank(resultText, tpl, 'onInterval')) continue;

            // Preview gating if enabled
            try {
                const settings = extension_settings?.STMemoryBooks;
                if (settings?.moduleSettings?.showMemoryPreviews) {
                    const memoryResult = {
                        extractedTitle: unifiedTitle,
                        content: resultText,
                        suggestedKeys: [],
                    };
                    const sceneDataForPreview = {
                        sceneStart: compiled?.metadata?.sceneStart ?? boundedStart,
                        sceneEnd: compiled?.metadata?.sceneEnd ?? currentLast,
                        messageCount: compiled?.metadata?.messageCount ?? (compiled?.messages?.length ?? 0),
                    };
                    const profileSettingsForPreview = { name: 'SidePrompt' };
                    let previewResult;
                    await enqueuePreview(async () => {
                        previewResult = await showMemoryPreviewPopup(memoryResult, sceneDataForPreview, profileSettingsForPreview, { lockTitle: true });
                    });
                    if (previewResult?.action === 'cancel' || previewResult?.action === 'retry') {
                        console.log(`${MODULE_NAME}: SidePrompt "${tpl.name}" canceled or retry requested in preview; skipping save`);
                        continue;
                    } else if (previewResult?.action === 'edit' && previewResult.memoryData) {
                        resultText = previewResult.memoryData.content ?? resultText;
                    }
                }
            } catch (previewErr) {
                console.warn(`${MODULE_NAME}: Preview step failed; proceeding without preview`, previewErr);
            }

            if (!ensureSidePromptTextNotBlank(resultText, tpl, 'onInterval')) continue;

            // Upsert entry and update metadata checkpoint (generic + legacy for one-way compat)
            try {
                throwIfStmbStopped(runEpoch);
                const lbs = getEffectiveLorebookSettingsForTemplate(tpl);
            const { defaults, entryOverrides } = makeUpsertParamsFromLorebook(lbs, runtimeMacros);
            const endId = compiled?.metadata?.sceneEnd ?? currentLast;
            await upsertLorebookEntryByTitle(lore.name, lore.data, unifiedTitle, resultText, {
                    defaults,
                    entryOverrides,
                    metadataUpdates: {
                        [`STMB_sp_${tpl.key}_lastMsgId`]: currentLast,
                        [`STMB_sp_${tpl.key}_lastRunAt`]: new Date().toISOString(),
                        STMB_tracker_lastMsgId: currentLast,
                        STMB_tracker_lastRunAt: new Date().toISOString(),
                    },
                    refreshEditor: extension_settings?.STMemoryBooks?.moduleSettings?.refreshEditor !== false,
                });
                console.log(`${MODULE_NAME}: SidePrompt success`, {
                    trigger: 'onInterval',
                    name: tpl.name,
                    key: tpl.key,
                    saved: true,
                    contentChars: resultText.length,
                });
            } catch (err) {
                console.error(`${MODULE_NAME}: Interval sideprompt upsert failed:`, err);
                toastr.error(__st_t_tag`Failed to update sideprompt entry "${tpl.name}"`, 'STMemoryBooks');
                continue;
            }
        }
    } catch (outer) {
        if (isStmbStopError(outer)) return;
        // No lorebook or other fatal issues
    } finally {
        parentTask.finish();
    }
}

/**
 * Run plotpoints and auto scoreboards after a memory run using the same compiled scene
 * @param {Object} compiledScene
 */
export async function runAfterMemory(compiledScene, profile = null) {
    const parentTask = createStmbInFlightTask('SidePrompts:onAfterMemory');
    const runEpoch = parentTask.epoch;
    try {
        const lore = await requireLorebookStrict();
        const enabledAfter = await listByTrigger('onAfterMemory');

        if (!enabledAfter || enabledAfter.length === 0) return;


        // Determine default connection to use for side prompts
        const defaultOverrides = resolveSidePromptConnection(profile);
        console.debug(`${MODULE_NAME}: runAfterMemory default overrides api=${defaultOverrides.api} model=${defaultOverrides.model} temp=${defaultOverrides.temperature}`);
        const settings = extension_settings?.STMemoryBooks;
        const refreshEditor = settings?.moduleSettings?.refreshEditor !== false;
        const showNotifications = settings?.moduleSettings?.showNotifications !== false;
        const results = [];

        const maxConcurrent = clampInt(Number(settings?.moduleSettings?.sidePromptsMaxConcurrent ?? 2),1,5);

        // Partition into waves of size maxConcurrent
        const waves = [];
        for (let i = 0; i < enabledAfter.length; i += maxConcurrent) {
            waves.push(enabledAfter.slice(i, i + maxConcurrent));
        }

        for (const wave of waves) {
            throwIfStmbStopped(runEpoch);
            // Run LLMs concurrently for this wave (scene-only prompts)
            const llmPromises = wave.map(async (tpl) => {
                try {
                    const prepared = await prepareSidePromptRun({
                        tpl,
                        loreData: lore.data,
                        compiledScene,
                        defaultOverrides,
                        fallbackKinds: ['plotpoints', 'scoreboard'],
                    });
                    console.log(`${MODULE_NAME}: SidePrompt attempt`, {
                        trigger: 'onAfterMemory',
                        name: tpl.name,
                        key: tpl.key,
                        api: prepared.conn.api,
                        model: prepared.conn.model,
                    });
                    const text = await runSidePromptAttempt({
                        taskLabel: `SidePrompt:onAfterMemory:${tpl?.key || tpl?.name || 'unknown'}`,
                        finalPrompt: prepared.finalPrompt,
                        conn: prepared.conn,
                        runEpoch,
                    });
                    return { ok: true, tpl, text, unifiedTitle: prepared.unifiedTitle, finalPrompt: prepared.finalPrompt, conn: prepared.conn };
                } catch (e) {
                    if (!isStmbStopError(e)) {
                        console.error(`${MODULE_NAME}: Wave LLM failed for "${tpl.name}":`, e);
                    }
                    return { ok: false, tpl, error: e, cancelled: isStmbStopError(e) };
                }
            });

            const llmResults = await Promise.all(llmPromises.map(p => p.then(r => ({ ...r, _completedAt: performance.now() }))));
            throwIfStmbStopped(runEpoch);

            // Present previews in order of receipt
            llmResults.sort((a, b) => a._completedAt - b._completedAt);

            // Build batch items from successes (preview-gated, receipt order)
            const items = [];
            const succeededNames = [];
            for (const r of llmResults) {
                if (!r.ok) {
                    if (r.cancelled) continue;
                    results.push({ name: r.tpl?.name || 'unknown', ok: false, error: r.error });
                    continue;
                }

                let textToSave = r.text;
                let approved = true;

                if (!ensureSidePromptTextNotBlank(textToSave, r.tpl, 'onAfterMemory')) {
                    results.push({ name: r.tpl.name, ok: false, error: new Error('Blank side prompt response') });
                    continue;
                }

                try {
                    throwIfStmbStopped(runEpoch);
                    const previewResult = await resolveSidePromptPreview({
                        tpl: r.tpl,
                        initialText: textToSave,
                        finalPrompt: r.finalPrompt,
                        conn: r.conn,
                        compiledScene,
                        runEpoch,
                        queuePreview: true,
                        retryTaskLabel: `SidePrompt:onAfterMemory:retry:${r.tpl?.key || r.tpl?.name || 'unknown'}`,
                    });
                    approved = previewResult.approved;
                    textToSave = previewResult.text;
                } catch (previewErr) {
                    if (isStmbStopError(previewErr)) return;
                    console.warn(`${MODULE_NAME}: Preview step failed; proceeding without preview`, previewErr);
                }

                if (approved) {
                    if (!ensureSidePromptTextNotBlank(textToSave, r.tpl, 'onAfterMemory')) {
                        results.push({ name: r.tpl.name, ok: false, error: new Error('Blank side prompt response') });
                        continue;
                    }
                    throwIfStmbStopped(runEpoch);
                    const tpl = r.tpl;
                    const lbs = getEffectiveLorebookSettingsForTemplate(tpl);
                    const { defaults, entryOverrides } = makeUpsertParamsFromLorebook(lbs);
                    items.push({
                        title: r.unifiedTitle,
                        content: textToSave,
                        defaults,
                        entryOverrides,
                        metadataUpdates: {
                            [`STMB_sp_${tpl.key}_lastRunAt`]: new Date().toISOString(),
                        },
                    });
                    succeededNames.push(tpl.name);
                } else {
                    results.push({ name: r.tpl.name, ok: false, error: new Error('User canceled or retry in preview') });
                }
            }

            if (items.length > 0) {
                try {
                    throwIfStmbStopped(runEpoch);
                    // Re-load latest lore to include any user edits during LLM phase
                    const fresh = await loadWorldInfo(lore.name);
                    // Batch save this wave; refresh editor per directive if enabled globally
                    await upsertLorebookEntriesBatch(lore.name, fresh, items, { refreshEditor });
                    // Update reference for subsequent lookups
                    lore.data = fresh;

                    // Only now count successes and toast per-template successes
                    for (const name of succeededNames) {
                        results.push({ name, ok: true });
                        if (showNotifications) {
                            toastr.success(__st_t_tag`SidePrompt "${name}" updated.`, 'STMemoryBooks');
                        }
                        console.log(`${MODULE_NAME}: SidePrompt success`, {
                            trigger: 'onAfterMemory',
                            name,
                            saved: true,
                        });
                    }
                } catch (saveErr) {
                    if (isStmbStopError(saveErr)) return;
                    console.error(`${MODULE_NAME}: Wave save failed:`, saveErr);
                    toastr.error(translate('Failed to save SidePrompt updates for this wave', 'STMemoryBooks_Toast_FailedToSaveWave'), 'STMemoryBooks');
                    // Mark these as failed since they were not persisted
                    for (const name of succeededNames) {
                        results.push({ name, ok: false, error: saveErr });
                    }
                }
            }
        }
        // Aggregated notifications for AfterMemory side prompts
        if (showNotifications && results.length > 0) {
            const succeeded = results.filter(r => r.ok).map(r => r.name);
            const failed = results.filter(r => !r.ok).map(r => r.name);
            const okCount = succeeded.length;
            const failCount = failed.length;
            const summarize = (arr) => {
                const maxNames = 5;
                if (arr.length === 0) return '';
                const names = arr.slice(0, maxNames).join(', ');
                const more = arr.length > maxNames ? `, +${arr.length - maxNames} more` : '';
                return `${names}${more}`;
            };
            if (failCount === 0) {
                toastr.info(__st_t_tag`Side Prompts after memory: ${okCount} succeeded. ${summarize(succeeded)}`, 'STMemoryBooks');
            } else {
                toastr.warning(__st_t_tag`Side Prompts after memory: ${okCount} succeeded, ${failCount} failed. ${failCount ? 'Failed: ' + summarize(failed) : ''}`, 'STMemoryBooks');
            }
        }
    } catch (outer) {
        if (isStmbStopError(outer)) return;
        // No lorebook => do nothing
    } finally {
        parentTask.finish();
    }
}



/**
 * Unified manual side prompt runner
 * Usage: /sideprompt "Name" {{macro}}="value" [X-Y]
 */
export async function runSidePrompt(args) {
    const parentTask = createStmbInFlightTask('SidePrompts:manual');
    const runEpoch = parentTask.epoch;
    try {
        const lore = await requireLorebookStrict();

        const parsed = parseSidePromptCommandInput(args);
        if (parsed.error || !parsed.name) {
            toastr.error(translate('SidePrompt name not provided. Usage: /sideprompt "Name" {{macro}}="value" [X-Y]', 'STMemoryBooks_Toast_SidePromptNameNotProvided'), 'STMemoryBooks');
            return '';
        }
        const { name, range, runtimeMacros } = parsed;

        const tpl = await findTemplateByName(name);
        if (!tpl) {
            toastr.error(translate('SidePrompt template not found. Check name.', 'STMemoryBooks_Toast_SidePromptNotFound'), 'STMemoryBooks');
            return '';
        }
        // Enforce manual gating: only allow /sideprompt if template has the sideprompt command enabled
        const manualEnabled = Array.isArray(tpl?.triggers?.commands) && tpl.triggers.commands.some(c => String(c).toLowerCase() === 'sideprompt');
        if (!manualEnabled) {
            toastr.error(translate('Manual run is disabled for this template. Enable "Allow manual run via /sideprompt" in the template settings.', 'STMemoryBooks_Toast_ManualRunDisabled'), 'STMemoryBooks');
            return '';
        }

        const requiredRuntimeMacros = collectTemplateRuntimeMacros(tpl);
        const missingRuntimeMacros = requiredRuntimeMacros.filter(token => !Object.hasOwn(runtimeMacros, token));
        if (missingRuntimeMacros.length > 0) {
            const usageMacros = requiredRuntimeMacros.map(token => `${token}="value"`).join(' ');
            toastr.error(
                __st_t_tag`SidePrompt "${tpl.name}" requires: ${missingRuntimeMacros.join(', ')}. Usage: /sideprompt "${tpl.name}" ${usageMacros} [X-Y]`,
                'STMemoryBooks',
            );
            return '';
        }

        const currentLast = chat.length - 1;
        if (currentLast < 0) {
            toastr.error(translate('No messages available.', 'STMemoryBooks_Toast_NoMessagesAvailable'), 'STMemoryBooks');
            return '';
        }

        // Compile window
        let compiled = null;
        if (range) {
            const m = String(range).trim().match(/^(\d+)\s*[-–—]\s*(\d+)$/);
            if (!m) {
                toastr.error(translate('Invalid range format. Use X-Y', 'STMemoryBooks_Toast_InvalidRangeFormat'), 'STMemoryBooks');
                return '';
            }
            const start = parseInt(m[1], 10);
            const end = parseInt(m[2], 10);
            if (!(start >= 0 && end >= start && end < chat.length)) {
                toastr.error(translate('Invalid message range for /sideprompt', 'STMemoryBooks_Toast_InvalidMessageRange'), 'STMemoryBooks');
                return '';
            }
            try {
                compiled = compileRange(start, end);
            } catch (err) {
                toastr.error(translate('Failed to compile the specified range', 'STMemoryBooks_Toast_FailedToCompileRange'), 'STMemoryBooks');
                return '';
            }
        } else {
            // Since-last behavior with cap
            if (!hasShownSidePromptRangeTip) {
                toastr.info(translate('Tip: You can run a specific range with /sideprompt "Name" {{macro}}="value" X-Y (e.g., /sideprompt "Scoreboard" 100-120). Running without a range uses messages since the last checkpoint.', 'STMemoryBooks_Toast_SidePromptRangeTip'), 'STMemoryBooks');
                hasShownSidePromptRangeTip = true;
            }
            const existingForLast = findFirstLoreEntryByTitle(lore.data, getSidePromptLookupTitles(tpl, ['scoreboard', 'plotpoints', 'tracker']));
            const lastMsgId = Number(
                (existingForLast && existingForLast[`STMB_sp_${tpl.key}_lastMsgId`]) ??
                (existingForLast && existingForLast.STMB_score_lastMsgId) ??
                (existingForLast && existingForLast.STMB_tracker_lastMsgId) ??
                -1
            );

            const start = Math.max(0, lastMsgId + 1);
            const cap = 200;
            const boundedStart = Math.max(start, currentLast - cap + 1);

            try {
                compiled = compileRange(boundedStart, currentLast);
            } catch (err) {
                toastr.error(translate('Failed to compile messages for /sideprompt', 'STMemoryBooks_Toast_FailedToCompileMessages'), 'STMemoryBooks');
                return '';
            }
        }
        const defaultOverrides = resolveSidePromptConnection(null);
        const prepared = await prepareSidePromptRun({
            tpl,
            loreData: lore.data,
            compiledScene: compiled,
            defaultOverrides,
            fallbackKinds: ['scoreboard', 'plotpoints', 'tracker'],
            runtimeMacros,
        });

        // Call LLM
        let resultText = '';
        try {
            console.log(`${MODULE_NAME}: SidePrompt attempt`, {
                trigger: 'manual',
                name: tpl.name,
                key: tpl.key,
                rangeProvided: !!range,
                api: prepared.conn.api,
                model: prepared.conn.model,
            });
            resultText = await runSidePromptAttempt({
                taskLabel: `SidePrompt:manual:${tpl?.key || tpl?.name || 'unknown'}`,
                finalPrompt: prepared.finalPrompt,
                conn: prepared.conn,
                runEpoch,
            });
            throwIfStmbStopped(runEpoch);
            if (!ensureSidePromptTextNotBlank(resultText, tpl, 'manual')) return '';

            // Preview gating if enabled
            try {
                throwIfStmbStopped(runEpoch);
                const previewResult = await resolveSidePromptPreview({
                    tpl,
                    initialText: resultText,
                    finalPrompt: prepared.finalPrompt,
                    conn: prepared.conn,
                    compiledScene: compiled,
                    runEpoch,
                    retryTaskLabel: `SidePrompt:manual:retry:${tpl?.key || tpl?.name || 'unknown'}`,
                });
                if (!previewResult.approved) {
                    toastr.info(__st_t_tag`SidePrompt "${tpl.name}" canceled.`, 'STMemoryBooks');
                    return '';
                }
                resultText = previewResult.text;
            } catch (previewErr) {
                console.warn(`${MODULE_NAME}: Preview step failed; proceeding without preview`, previewErr);
            }
            throwIfStmbStopped(runEpoch);
            if (!ensureSidePromptTextNotBlank(resultText, tpl, 'manual')) return '';
            const lbs = getEffectiveLorebookSettingsForTemplate(tpl);
            const { defaults, entryOverrides } = makeUpsertParamsFromLorebook(lbs);
            const endId = compiled?.metadata?.sceneEnd ?? currentLast;
            await upsertLorebookEntryByTitle(lore.name, lore.data, prepared.unifiedTitle, resultText, {
                defaults,
                entryOverrides,
                metadataUpdates: {
                    [`STMB_sp_${tpl.key}_lastMsgId`]: endId,
                    [`STMB_sp_${tpl.key}_lastRunAt`]: new Date().toISOString(),
                    STMB_tracker_lastMsgId: endId,
                    STMB_tracker_lastRunAt: new Date().toISOString(),
                },
                refreshEditor: extension_settings?.STMemoryBooks?.moduleSettings?.refreshEditor !== false,
            });
            console.log(`${MODULE_NAME}: SidePrompt success`, {
                trigger: 'manual',
                name: tpl.name,
                key: tpl.key,
                saved: true,
                contentChars: resultText.length,
            });
            } catch (err) {
                if (isStmbStopError(err)) return '';
                console.error(`${MODULE_NAME}: /sideprompt failed:`, err);
                toastr.error(__st_t_tag`SidePrompt "${tpl.name}" failed: ${err.message}`, 'STMemoryBooks');
                return '';
            }

        toastr.success(__st_t_tag`SidePrompt "${tpl.name}" updated.`, 'STMemoryBooks');
        return '';
    } catch (outer) {
        if (isStmbStopError(outer)) return '';
        return '';
    } finally {
        parentTask.finish();
    }
}
