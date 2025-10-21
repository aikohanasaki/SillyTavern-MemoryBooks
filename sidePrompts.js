import { chat, chat_metadata } from '../../../../script.js';
import { extension_settings } from '../../../extensions.js';
import { getRegexedString, regex_placement } from '../../../extensions/regex/engine.js';
import { METADATA_KEY, world_names, loadWorldInfo } from '../../../world-info.js';
import { getSceneMarkers } from './sceneManager.js';
import { createSceneRequest, compileScene, toReadableText } from './chatcompile.js';
import { getCurrentApiInfo, getUIModelSettings, normalizeCompletionSource, resolveEffectiveConnectionFromProfile } from './utils.js';
import { requestCompletion } from './stmemory.js';
import { listByTrigger, findTemplateByName } from './sidePromptsManager.js';
import { upsertLorebookEntryByTitle, upsertLorebookEntriesBatch, getEntryByTitle } from './addlore.js';
import { fetchPreviousSummaries, showMemoryPreviewPopup } from './confirmationPopup.js';
import { t as __st_t_tag, translate } from '../../../i18n.js';


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
function buildPrompt(templatePrompt, priorContent, compiledScene, responseFormat, previousSummaries = []) {
    const parts = [];
    parts.push(String(templatePrompt || ''));
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
        parts.push(String(responseFormat).trim());
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
async function runLLM(prompt, overrides = null) {
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

    const { text } = await requestCompletion({
        api,
        model,
        prompt,
        temperature,
        endpoint,
        apiKey,
        extra: {},
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
 */
function resolveSidePromptConnection(profile = null, options = {}) {
    try {
        // Highest priority: explicit profile object (e.g., memory generation profile)
        if (profile && (profile.effectiveConnection || profile.connection)) {
            const conn = resolveEffectiveConnectionFromProfile(profile);
            const { api, model, temperature, endpoint, apiKey } = conn;
            console.debug(`${MODULE_NAME}: resolveSidePromptConnection using provided profile api=${api} model=${model} temp=${temperature}`);
            return { api, model, temperature, endpoint, apiKey };
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
                console.debug(`${MODULE_NAME}: resolveSidePromptConnection using template override profile index=${idxOverride} api=${api} model=${model} temp=${temperature}`);
                return { api, model, temperature, endpoint, apiKey };
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
            console.debug(`${MODULE_NAME}: resolveSidePromptConnection using default profile api=${api} model=${model} temp=${temperature}`);
            return { api, model, temperature, endpoint, apiKey };
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
    };
}

/**
 * Build defaults (for create-time) and entryOverrides (for create+update) for upsert calls
 */
function makeUpsertParamsFromLorebook(lbs) {
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
    };
    if (lbs.orderMode === 'manual') {
        entryOverrides.order = toNumberOr(lbs.orderValue, 100);
    }
    return { defaults, entryOverrides };
}

/**
 * Evaluate tracker prompts and fire if thresholds are met
 */
export async function evaluateTrackers() {
    try {
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
            const threshold = Math.max(1, Number(tpl?.triggers?.onInterval?.visibleMessages || 50));
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
            const pmCountRaw = Number(tpl?.settings?.previousMemoriesCount || 0);
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
            resultText = await runLLM(finalPrompt, overrides);
            } catch (err) {
                console.error(`${MODULE_NAME}: Interval sideprompt LLM failed:`, err);
                toastr.error(__st_t_tag`SidePrompt "${tpl.name}" failed: ${err.message}`, 'STMemoryBooks');
                continue;
            }

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

            // Upsert entry and update metadata checkpoint (generic + legacy for one-way compat)
            try {
                const lbs = getEffectiveLorebookSettingsForTemplate(tpl);
            const { defaults, entryOverrides } = makeUpsertParamsFromLorebook(lbs);
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
        // No lorebook or other fatal issues
    }
}

/**
 * Run plotpoints and auto scoreboards after a memory run using the same compiled scene
 * @param {Object} compiledScene
 */
export async function runAfterMemory(compiledScene, profile = null) {
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

        const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
        const maxConcurrent = clamp(Number(settings?.moduleSettings?.sidePromptsMaxConcurrent ?? 2), 1, 5);

        // Partition into waves of size maxConcurrent
        const waves = [];
        for (let i = 0; i < enabledAfter.length; i += maxConcurrent) {
            waves.push(enabledAfter.slice(i, i + maxConcurrent));
        }

        for (const wave of waves) {
            // Run LLMs concurrently for this wave (scene-only prompts)
            const llmPromises = wave.map(async (tpl) => {
                try {
                    const unifiedTitle = `${tpl.name} (STMB SidePrompt)`;
                    const existing = getEntryByTitle(lore.data, unifiedTitle)
                        || getEntryByTitle(lore.data, `${tpl.name} (STMB Plotpoints)`)
                        || getEntryByTitle(lore.data, `${tpl.name} (STMB Scoreboard)`);
                    const prior = existing?.content || '';

                    let prevSummaries = [];
                    const pmCountRaw = Number(tpl?.settings?.previousMemoriesCount || 0);
                    const pmCount = Math.max(0, Math.min(7, pmCountRaw));
                    if (pmCount > 0) {
                        try {
                            const res = await fetchPreviousSummaries(pmCount, extension_settings, chat_metadata);
                            prevSummaries = res?.summaries || [];
                        } catch {}
                    }
                    const finalPrompt = buildPrompt(tpl.prompt, prior, compiledScene, tpl.responseFormat, prevSummaries);
                    const idx = Number(tpl?.settings?.overrideProfileIndex);
                    const useOverride = !!tpl?.settings?.overrideProfileEnabled && Number.isFinite(idx);
                    const conn = useOverride ? resolveSidePromptConnection(null, { overrideProfileIndex: idx }) : defaultOverrides;
                    console.log(`${MODULE_NAME}: SidePrompt attempt`, {
                        trigger: 'onAfterMemory',
                        name: tpl.name,
                        key: tpl.key,
                        api: conn.api,
                        model: conn.model,
                    });
                    const text = await runLLM(finalPrompt, conn);
                    return { ok: true, tpl, text };
                } catch (e) {
                    console.error(`${MODULE_NAME}: Wave LLM failed for "${tpl.name}":`, e);
                    return { ok: false, tpl, error: e };
                }
            });

            const llmResults = await Promise.all(llmPromises.map(p => p.then(r => ({ ...r, _completedAt: performance.now() }))));

            // Present previews in order of receipt
            llmResults.sort((a, b) => a._completedAt - b._completedAt);

            // Build batch items from successes (preview-gated, receipt order)
            const items = [];
            const succeededNames = [];
            for (const r of llmResults) {
                if (!r.ok) {
                    results.push({ name: r.tpl?.name || 'unknown', ok: false, error: r.error });
                    continue;
                }

                let textToSave = r.text;
                let approved = true;

                try {
                    const settings = extension_settings?.STMemoryBooks;
                    if (settings?.moduleSettings?.showMemoryPreviews) {
                        const memoryResult = {
                            extractedTitle: `${r.tpl.name} (STMB SidePrompt)`,
                            content: textToSave,
                            suggestedKeys: [],
                        };
                        const sceneDataForPreview = {
                            sceneStart: compiledScene?.metadata?.sceneStart ?? 0,
                            sceneEnd: compiledScene?.metadata?.sceneEnd ?? 0,
                            messageCount: compiledScene?.metadata?.messageCount ?? (compiledScene?.messages?.length ?? 0),
                        };
                        const profileSettingsForPreview = { name: 'SidePrompt' };
                        let previewResult;
                        await enqueuePreview(async () => {
                            previewResult = await showMemoryPreviewPopup(memoryResult, sceneDataForPreview, profileSettingsForPreview, { lockTitle: true });
                        });
                        if (previewResult?.action === 'cancel' || previewResult?.action === 'retry') {
                            approved = false;
                        } else if (previewResult?.action === 'edit' && previewResult.memoryData) {
                            textToSave = previewResult.memoryData.content ?? textToSave;
                        }
                    }
                } catch (previewErr) {
                    console.warn(`${MODULE_NAME}: Preview step failed; proceeding without preview`, previewErr);
                }

                if (approved) {
                    const tpl = r.tpl;
                    const unifiedTitle = `${tpl.name} (STMB SidePrompt)`;
                    const lbs = getEffectiveLorebookSettingsForTemplate(tpl);
                    const { defaults, entryOverrides } = makeUpsertParamsFromLorebook(lbs);
                    items.push({
                        title: unifiedTitle,
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
        // No lorebook => do nothing
    }
}



/**
 * Unified manual side prompt runner
 * Usage: /sideprompt "Name" [X-Y]
 */
export async function runSidePrompt(args) {
    try {
        const lore = await requireLorebookStrict();

        const { name, range } = parseNameAndRange(args);
        if (!name) {
            toastr.error(translate('SidePrompt name not provided. Usage: /sideprompt "Name" [X-Y]', 'STMemoryBooks_Toast_SidePromptNameNotProvided'), 'STMemoryBooks');
            return '';
        }

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
                toastr.info(translate('Tip: You can run a specific range with /sideprompt "Name" X-Y (e.g., /sideprompt "Scoreboard" 100-120). Running without a range uses messages since the last checkpoint.', 'STMemoryBooks_Toast_SidePromptRangeTip'), 'STMemoryBooks');
                hasShownSidePromptRangeTip = true;
            }
            const unifiedTitle = `${tpl.name} (STMB SidePrompt)`;
            const existingForLast = getEntryByTitle(lore.data, unifiedTitle)
                || getEntryByTitle(lore.data, `${tpl.name} (STMB Scoreboard)`)
                || getEntryByTitle(lore.data, `${tpl.name} (STMB Plotpoints)`)
                || getEntryByTitle(lore.data, `${tpl.name} (STMB Tracker)`);
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
        const unifiedTitle = `${tpl.name} (STMB SidePrompt)`;
        const existing = getEntryByTitle(lore.data, unifiedTitle)
            || getEntryByTitle(lore.data, `${tpl.name} (STMB Scoreboard)`)
            || getEntryByTitle(lore.data, `${tpl.name} (STMB Plotpoints)`)
            || getEntryByTitle(lore.data, `${tpl.name} (STMB Tracker)`);
        const prior = existing?.content || '';
        let prevSummaries = [];
const pmCountRaw = Number(tpl?.settings?.previousMemoriesCount || 0);
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
        try {
            const idx = Number(tpl?.settings?.overrideProfileIndex);
            const useOverride = !!tpl?.settings?.overrideProfileEnabled && Number.isFinite(idx);
            const overrides = useOverride ? resolveSidePromptConnection(null, { overrideProfileIndex: idx }) : resolveSidePromptConnection(null);
            console.log(`${MODULE_NAME}: SidePrompt attempt`, {
                trigger: 'manual',
                name: tpl.name,
                key: tpl.key,
                rangeProvided: !!range,
                api: overrides.api,
                model: overrides.model,
            });
            resultText = await runLLM(finalPrompt, overrides);

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
                        sceneStart: compiled?.metadata?.sceneStart ?? 0,
                        sceneEnd: compiled?.metadata?.sceneEnd ?? 0,
                        messageCount: compiled?.metadata?.messageCount ?? (compiled?.messages?.length ?? 0),
                    };
                    const profileSettingsForPreview = { name: 'SidePrompt' };
                    const previewResult = await showMemoryPreviewPopup(
                        memoryResult,
                        sceneDataForPreview,
                        profileSettingsForPreview,
                        { lockTitle: true }
                    );

                    if (previewResult?.action === 'cancel' || previewResult?.action === 'retry') {
                        toastr.info(__st_t_tag`SidePrompt "${tpl.name}" canceled.`, 'STMemoryBooks');
                        return '';
                    } else if (previewResult?.action === 'edit' && previewResult.memoryData) {
                        resultText = previewResult.memoryData.content ?? resultText;
                    }
                }
            } catch (previewErr) {
                console.warn(`${MODULE_NAME}: Preview step failed; proceeding without preview`, previewErr);
            }
            const lbs = getEffectiveLorebookSettingsForTemplate(tpl);
            const { defaults, entryOverrides } = makeUpsertParamsFromLorebook(lbs);
            const endId = compiled?.metadata?.sceneEnd ?? currentLast;
            await upsertLorebookEntryByTitle(lore.name, lore.data, unifiedTitle, resultText, {
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
                console.error(`${MODULE_NAME}: /sideprompt failed:`, err);
                toastr.error(__st_t_tag`SidePrompt "${tpl.name}" failed: ${err.message}`, 'STMemoryBooks');
                return '';
            }

        toastr.success(__st_t_tag`SidePrompt "${tpl.name}" updated.`, 'STMemoryBooks');
        return '';
    } catch (outer) {
        return '';
    }
}

/**
 * Parse sideprompt args: "Name" [X-Y] or Name [X-Y]
 */
function parseNameAndRange(input) {
    const s = String(input || '').trim();
    if (!s) return { name: '', range: null };

    let name = '';
    let rest = '';

    const mQuoteD = s.match(/^"([^"]+)"\s*(.*)$/);
    const mQuoteS = !mQuoteD && s.match(/^'([^']+)'\s*(.*)$/);
    if (mQuoteD) {
        name = mQuoteD[1];
        rest = mQuoteD[2] || '';
    } else if (mQuoteS) {
        name = mQuoteS[1];
        rest = mQuoteS[2] || '';
    } else {
        // If a range appears at the end, strip it from name
        const mRange = s.match(/(\d+)\s*[-–—]\s*(\d+)\s*$/);
        if (mRange) {
            name = s.slice(0, mRange.index).trim();
            rest = s.slice(mRange.index);
        } else {
            name = s;
            rest = '';
        }
    }

    let range = null;
    if (rest) {
        const r = rest.match(/(\d+)\s*[-–—]\s*(\d+)/);
        if (r) range = `${r[1]}-${r[2]}`;
    }

    return { name, range };
}
