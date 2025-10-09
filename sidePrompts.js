import { chat, chat_metadata } from '../../../../script.js';
import { extension_settings } from '../../../extensions.js';
import { METADATA_KEY, world_names, loadWorldInfo } from '../../../world-info.js';
import { getSceneMarkers } from './sceneManager.js';
import { createSceneRequest, compileScene, toReadableText } from './chatcompile.js';
import { getCurrentApiInfo, getUIModelSettings, getCurrentMemoryBooksContext, normalizeCompletionSource } from './utils.js';
import { listEnabledByType, findTemplateByName } from './sidePromptsManager.js';
import { upsertLorebookEntryByTitle, getEntryByTitle } from './addlore.js';
import { sendRawCompletionRequest } from './stmemory.js';

const MODULE_NAME = 'STMemoryBooks-SidePrompts';

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
        toastr.error('No memory lorebook is assigned. Open Memory Books settings and select or bind a lorebook.', 'STMemoryBooks');
        throw new Error('No memory lorebook assigned');
    }

    try {
        const lorebookData = await loadWorldInfo(lorebookName);
        if (!lorebookData) throw new Error('Failed to load lorebook');
        return { name: lorebookName, data: lorebookData };
    } catch (err) {
        toastr.error('Failed to load the selected lorebook.', 'STMemoryBooks');
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
function buildPrompt(templatePrompt, priorContent, compiledScene, responseFormat) {
    const sceneText = toReadableText(compiledScene);
    const parts = [];
    parts.push(String(templatePrompt || ''));
    if (priorContent && String(priorContent).trim()) {
        parts.push('\n=== PRIOR ENTRY ===\n');
        parts.push(String(priorContent));
    }
    parts.push('\n=== SCENE TEXT ===\n');
    parts.push(sceneText);
    if (responseFormat && String(responseFormat).trim()) {
        parts.push('\n=== RESPONSE FORMAT ===\n');
        parts.push(String(responseFormat).trim());
    }
    return parts.join('');
}

/**
 * Perform LLM call
 * - By default uses current ST UI settings
 * - If overrides are provided, uses the given api/model/temperature
 */
async function runLLM(prompt, overrides = null) {
    let api;
    let model;
    let temperature;

    if (overrides && (overrides.api || overrides.model)) {
        api = normalizeCompletionSource(overrides.api || 'openai');
        model = overrides.model || '';
        temperature = typeof overrides.temperature === 'number' ? overrides.temperature : 0.7;
        console.debug(`${MODULE_NAME}: runLLM using overrides api=${api} model=${model} temp=${temperature}`);
    } else {
        const apiInfo = getCurrentApiInfo();
        const modelInfo = getUIModelSettings();
        api = normalizeCompletionSource(apiInfo.completionSource || apiInfo.api || 'openai');
        model = modelInfo.model || '';
        temperature = modelInfo.temperature ?? 0.7;
        console.debug(`${MODULE_NAME}: runLLM using UI settings api=${api} model=${model} temp=${temperature}`);
    }

    const { text } = await sendRawCompletionRequest({
        model,
        prompt,
        temperature,
        api,
        extra: {},
    });
    return text || '';
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
            const conn = profile.effectiveConnection || profile.connection;
            const api = normalizeCompletionSource(conn.api || 'openai');
            const model = conn.model || '';
            const temperature = typeof conn.temperature === 'number' ? conn.temperature : 0.7;
            console.debug(`${MODULE_NAME}: resolveSidePromptConnection using provided profile api=${api} model=${model} temp=${temperature}`);
            return { api, model, temperature };
        }

        const settings = extension_settings?.STMemoryBooks;
        const profiles = settings?.profiles || [];
        let idxOverride = options && Number.isFinite(options.overrideProfileIndex) ? Number(options.overrideProfileIndex) : null;

        // If a template-specified override index is provided, use it
        if (idxOverride !== null && profiles.length > 0) {
            if (idxOverride < 0 || idxOverride >= profiles.length) idxOverride = 0;
            const over = profiles[idxOverride];
            if (over?.useDynamicSTSettings) {
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
                console.debug(`${MODULE_NAME}: resolveSidePromptConnection using template override profile index=${idxOverride} api=${api} model=${model} temp=${temperature}`);
                return { api, model, temperature };
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
        if (def?.useDynamicSTSettings) {
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
            console.debug(`${MODULE_NAME}: resolveSidePromptConnection using default profile api=${api} model=${model} temp=${temperature}`);
            return { api, model, temperature };
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
 * Evaluate tracker prompts and fire if thresholds are met
 */
export async function evaluateTrackers() {
    try {
        const enabledTrackers = await listEnabledByType('tracker');
        if (!enabledTrackers || enabledTrackers.length === 0) return;

        // Ensure lorebook exists up-front
        const lore = await requireLorebookStrict();

        const currentLast = chat.length - 1;
        if (currentLast < 0) return;

        for (const tpl of enabledTrackers) {
            const title = `${tpl.name} (STMB Tracker)`;

            // Read existing entry to get last checkpoint
            const existing = getEntryByTitle(lore.data, title);
            const lastMsgId = Number(existing?.STMB_tracker_lastMsgId ?? -1);
            const lastRunAt = existing?.STMB_tracker_lastRunAt ? Date.parse(existing.STMB_tracker_lastRunAt) : null;
            const now = Date.now();

            // Internal debounce to prevent disk thrash (not user-configurable)
            const debounceMs = 10_000; // 10 seconds
            if (lastRunAt && now - lastRunAt < debounceMs) {
                continue;
            }

            // Count visible messages since last checkpoint
            const visibleSince = countVisibleMessagesSince(lastMsgId, currentLast);
            const threshold = Math.max(1, Number(tpl.settings?.intervalVisibleMessages || 50));
            if (visibleSince < threshold) {
                continue;
            }

            // Build compiled scene for (lastMsgId+1 .. currentLast)
            const start = Math.max(0, lastMsgId + 1);
            // Safety: cap extremely large windows (e.g., last 200 messages)
            const cap = 200;
            const boundedStart = Math.max(start, currentLast - cap + 1);

            let compiled = null;
            try {
                compiled = compileRange(boundedStart, currentLast);
            } catch (err) {
                console.warn(`${MODULE_NAME}: Tracker compile failed:`, err);
                continue;
            }

            // Build prompt with prior content
            const prior = existing?.content || '';
            const finalPrompt = buildPrompt(tpl.prompt, prior, compiled, tpl.responseFormat);

            // Call LLM
            let resultText = '';
            try {
                const idx = Number(tpl?.settings?.overrideProfileIndex);
                const useOverride = !!tpl?.settings?.overrideProfileEnabled && Number.isFinite(idx);
                const overrides = useOverride ? resolveSidePromptConnection(null, { overrideProfileIndex: idx }) : resolveSidePromptConnection(null);
                resultText = await runLLM(finalPrompt, overrides);
            } catch (err) {
                console.error(`${MODULE_NAME}: Tracker LLM failed:`, err);
                toastr.error(`Tracker "${tpl.name}" failed: ${err.message}`, 'STMemoryBooks');
                continue;
            }

            // Upsert entry and update metadata checkpoint
            try {
                await upsertLorebookEntryByTitle(lore.name, lore.data, title, resultText, {
                    // Use defaults similar to memories
                    defaults: {
                        vectorized: true,
                        selective: true,
                        order: 100,
                        position: 0,
                    },
                    metadataUpdates: {
                        STMB_tracker_lastMsgId: currentLast,
                        STMB_tracker_lastRunAt: new Date().toISOString(),
                    },
                    refreshEditor: false,
                });
            } catch (err) {
                console.error(`${MODULE_NAME}: Tracker upsert failed:`, err);
                toastr.error(`Failed to update tracker entry "${tpl.name}"`, 'STMemoryBooks');
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
        const enabledPlot = await listEnabledByType('plotpoints');
        const enabledScore = await listEnabledByType('scoreboard');

        const plotWithMem = (enabledPlot || []).filter(x => x.settings?.withMemories);
        const scoreWithMem = (enabledScore || []).filter(x => x.settings?.withMemories);

        if (plotWithMem.length === 0 && scoreWithMem.length === 0) return;

        const sceneText = toReadableText(compiledScene);

        // Determine connection to use for side prompts
        const overrides = resolveSidePromptConnection(profile);
        console.debug(`${MODULE_NAME}: runAfterMemory overrides api=${overrides.api} model=${overrides.model} temp=${overrides.temperature}`);

        // Plotpoints
        for (const tpl of plotWithMem) {
            const title = `${tpl.name} (STMB Plotpoints)`;
            const existing = getEntryByTitle(lore.data, title);
            const prior = existing?.content || '';
            let promptParts = [tpl.prompt || ''];
            if (prior && String(prior).trim()) {
                promptParts.push('\n' + String(prior).trim());
            }
            promptParts.push('\n=== SCENE TEXT ===\n');
            promptParts.push(sceneText);
            let prompt = promptParts.join('');
            if (tpl.responseFormat && String(tpl.responseFormat).trim()) {
                prompt += '\n=== RESPONSE FORMAT ===\n' + String(tpl.responseFormat).trim();
            }

            let resultText = '';
            try {
                resultText = await runLLM(prompt, overrides);
                await upsertLorebookEntryByTitle(lore.name, lore.data, title, resultText, {
                    defaults: {
                        vectorized: true,
                        selective: true,
                        order: 100,
                        position: 0,
                    },
                    refreshEditor: false,
                });
            } catch (err) {
                console.error(`${MODULE_NAME}: Plotpoints failed:`, err);
                toastr.error(`Plotpoints "${tpl.name}" failed`, 'STMemoryBooks');
            }
        }

        // Auto scoreboards (do not adjust STMB_score_lastMsgId on auto runs)
        for (const tpl of scoreWithMem) {
            const title = `${tpl.name} (STMB Scoreboard)`;
            const existing = getEntryByTitle(lore.data, title);
            const prior = existing?.content || '';
            let prompt = [tpl.prompt || '', '\n=== SCENE TEXT ===\n', sceneText].join('');
            if (tpl.responseFormat && String(tpl.responseFormat).trim()) {
                prompt += '\n=== RESPONSE FORMAT ===\n' + String(tpl.responseFormat).trim();
            }

            let resultText = '';
            try {
                resultText = await runLLM(prompt, overrides);
                await upsertLorebookEntryByTitle(lore.name, lore.data, title, resultText, {
                    defaults: {
                        vectorized: true,
                        selective: true,
                        order: 100,
                        position: 0,
                    },
                    refreshEditor: false,
                });
            } catch (err) {
                console.error(`${MODULE_NAME}: Auto Scoreboard failed:`, err);
                toastr.error(`Scoreboard "${tpl.name}" failed`, 'STMemoryBooks');
            }
        }
    } catch (outer) {
        // No lorebook => do nothing
    }
}

/**
 * /plotupdate X-Y -> run all enabled plotpoints (ignores withMemories setting)
 */
export async function runPlotUpdate(rangeString) {
    try {
        const lore = await requireLorebookStrict();

        const match = String(rangeString || '').trim().match(/^(\d+)\s*[-–—]\s*(\d+)$/);
        if (!match) {
            toastr.error('Invalid format. Use: /plotupdate X-Y', 'STMemoryBooks');
            return '';
        }
        const start = parseInt(match[1], 10);
        const end = parseInt(match[2], 10);
        if (!(start >= 0 && end >= start && end < chat.length)) {
            toastr.error('Invalid message range for /plotupdate', 'STMemoryBooks');
            return '';
        }

        let compiled = null;
        try {
            compiled = compileRange(start, end);
        } catch (err) {
            toastr.error('Failed to compile the specified range', 'STMemoryBooks');
            return '';
        }

        const sceneText = toReadableText(compiled);
        const enabledPlot = await listEnabledByType('plotpoints');

        if (!enabledPlot || enabledPlot.length === 0) {
            toastr.info('No plotpoints templates are enabled.', 'STMemoryBooks');
            return '';
        }

        for (const tpl of enabledPlot) {
            const idx = Number(tpl?.settings?.overrideProfileIndex);
            const useOverride = !!tpl?.settings?.overrideProfileEnabled && Number.isFinite(idx);
            const overrides = useOverride ? resolveSidePromptConnection(null, { overrideProfileIndex: idx }) : resolveSidePromptConnection(null);
            const title = `${tpl.name} (STMB Plotpoints)`;
            const existing = getEntryByTitle(lore.data, title);
            const prior = existing?.content || '';
            let promptParts = [tpl.prompt || ''];
            if (prior && String(prior).trim()) {
                promptParts.push('\n' + String(prior).trim());
            }
            promptParts.push('\n=== SCENE TEXT ===\n');
            promptParts.push(sceneText);
            let prompt = promptParts.join('');
            if (tpl.responseFormat && String(tpl.responseFormat).trim()) {
                prompt += '\n=== RESPONSE FORMAT ===\n' + String(tpl.responseFormat).trim();
            }

            try {
                const text = await runLLM(prompt, overrides);
                await upsertLorebookEntryByTitle(lore.name, lore.data, title, text, {
                    defaults: {
                        vectorized: true,
                        selective: true,
                        order: 100,
                        position: 0,
                    },
                    refreshEditor: false,
                });
            } catch (err) {
                console.error(`${MODULE_NAME}: /plotupdate failed for "${tpl.name}":`, err);
                toastr.error(`Plotpoints "${tpl.name}" failed`, 'STMemoryBooks');
            }
        }

        toastr.success('Plotpoints updated for the specified range.', 'STMemoryBooks');
        return '';
    } catch (outer) {
        return '';
    }
}

/**
 * /score name-of-prompt -> manual scoreboard since last score
 */
export async function runScore(nameArg) {
    try {
        const lore = await requireLorebookStrict();

        const tpl = await findTemplateByName(nameArg);
        if (!tpl || tpl.type !== 'scoreboard') {
            toastr.error('Scoreboard template not found. Check name.', 'STMemoryBooks');
            return '';
        }

        const title = `${tpl.name} (STMB Scoreboard)`;
        const existing = getEntryByTitle(lore.data, title);
        const lastMsgId = Number(existing?.STMB_score_lastMsgId ?? -1);

        const currentLast = chat.length - 1;
        if (currentLast < 0) {
            toastr.error('No messages available for scoring.', 'STMemoryBooks');
            return '';
        }

        const start = Math.max(0, lastMsgId + 1);
        const cap = 200;
        const boundedStart = Math.max(start, currentLast - cap + 1);

        let compiled = null;
        try {
            compiled = compileRange(boundedStart, currentLast);
        } catch (err) {
            toastr.error('Failed to compile messages for /score', 'STMemoryBooks');
            return '';
        }

        const prior = existing?.content || '';
        const prompt = buildPrompt(tpl.prompt, prior, compiled, tpl.responseFormat);

        let resultText = '';
        try {
            const idx = Number(tpl?.settings?.overrideProfileIndex);
            const useOverride = !!tpl?.settings?.overrideProfileEnabled && Number.isFinite(idx);
            const overrides = useOverride ? resolveSidePromptConnection(null, { overrideProfileIndex: idx }) : resolveSidePromptConnection(null);
            resultText = await runLLM(prompt, overrides);
            await upsertLorebookEntryByTitle(lore.name, lore.data, title, resultText, {
                defaults: {
                    vectorized: true,
                    selective: true,
                    order: 100,
                    position: 0,
                },
                metadataUpdates: {
                    STMB_score_lastMsgId: currentLast,
                    STMB_score_lastRunAt: new Date().toISOString(),
                },
                refreshEditor: false,
            });
        } catch (err) {
            console.error(`${MODULE_NAME}: /score failed:`, err);
            toastr.error(`Scoreboard "${tpl.name}" failed`, 'STMemoryBooks');
            return '';
        }

        toastr.success(`Scoreboard "${tpl.name}" updated.`, 'STMemoryBooks');
        return '';
    } catch (outer) {
        return '';
    }
}
