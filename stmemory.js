import { getTokenCount } from '../../../tokenizers.js';
import { getEffectivePrompt, getCurrentApiInfo, normalizeCompletionSource, estimateTokens } from './utils.js';
import { characters, this_chid, substituteParams, getRequestHeaders } from '../../../../script.js';
import { oai_settings } from '../../../openai.js';
import { runRegexScript, getRegexScripts } from '../../../extensions/regex/engine.js';
import { groups } from '../../../group-chats.js';
import { extension_settings } from '../../../extensions.js';
const $ = window.jQuery;

const MODULE_NAME = 'STMemoryBooks-Memory';

// --- ST Regex selection-based execution (bypass engine gating) ---

/**
 * Clone a script and force disabled=false so explicitly selected scripts always run.
 */
function cloneScriptEnabled(script) {
    try {
        const clone = { ...script };
        clone.disabled = false;
        return clone;
    } catch {
        return script;
    }
}

/**
 * Apply selected regex scripts (by flat index keys, e.g., "idx:0") in order.
 * Uses getRegexScripts({ allowedOnly: false }) as the single source of truth.
 * Bypasses engine gating; relies on explicit user selection.
 */
function applySelectedRegex(inputText, selectedKeys) {
    if (typeof inputText !== 'string') return '';
    if (!Array.isArray(selectedKeys) || selectedKeys.length === 0) return inputText;

    try {
        const all = getRegexScripts({ allowedOnly: false }) || [];
        const order = selectedKeys
            .map(k => Number(String(k).replace(/^idx:/, '')))
            .filter(i => Number.isInteger(i) && i >= 0 && i < all.length);

        let out = inputText;
        for (const i of order) {
            const script = cloneScriptEnabled(all[i]);
            try {
                out = runRegexScript(script, out);
            } catch (e) {
                console.warn('applySelectedRegex: script failed', i, e);
            }
        }
        return out;
    } catch (e) {
        console.warn('applySelectedRegex failed', e);
        return inputText;
    }
}


// --- Custom Error Types for Better UI Handling ---
class TokenWarningError extends Error {
    constructor(message, tokenCount) {
        super(message);
        this.name = 'TokenWarningError';
        this.tokenCount = tokenCount;
    }
}

class AIResponseError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AIResponseError';
    }
}

class InvalidProfileError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidProfileError';
    }
}

function getCurrentCompletionEndpoint() {
    return '/api/backends/chat-completions/generate';
}


/**
*Send a raw completion request to the backend, bypassing SillyTavern's chat context stack.*
*Supports OpenAI, Claude, Gemini, and custom OpenAI-compatible endpoints.*
**
*@param {Object} opts*
*@param {string} opts.model*
*@param {string} opts.prompt*
*@param {number} [opts.temperature]*
*@param {string} [opts.api] - 'openai', 'claude', 'makersuite', 'custom', etc. (Note: ST uses 'makersuite' as the canonical provider key; avoid other aliases).*
*@param {string} [opts.endpoint] - Custom endpoint URL for custom APIs*
*@param {Object} [opts.extra] - Any extra params (max_tokens, etc)*
*@returns {Promise<{text: string, full: object}>}*
*/
export async function sendRawCompletionRequest({
    model,
    prompt,
    temperature = 0.7,
    api = 'openai',
    endpoint = null,
    apiKey = null,
    extra = {},
}) {
    let url = getCurrentCompletionEndpoint();
    let headers = getRequestHeaders();

    // Compute desired max tokens from explicit sources only (no minimum enforced)
    const desiredFromSources = Math.max(
        Number(extra.max_tokens) || 0,
        Number(oai_settings.max_response) || 0
    );
    const desiredInt = Math.floor(desiredFromSources) || 0;

    // Set max_tokens based on explicit inputs only; no automatic minimums
    if (Number.isFinite(desiredInt) && desiredInt > 0) {
        extra.max_tokens = desiredInt;
    }

    // Optional: mirror to providers that use a different field if present
    if (extra.max_output_tokens != null) {
        const mo = Math.floor(extra.max_output_tokens) || 0;
        if (Number.isFinite(extra.max_tokens) && extra.max_tokens > 0) {
            extra.max_output_tokens = Math.min(mo, extra.max_tokens);
        } else {
            extra.max_output_tokens = mo;
        }
    }

    let body = {
        messages: [
            { role: 'user', content: prompt }
        ],
        model,
        temperature,
        chat_completion_source: api,
        ...extra,
    };

    // Handle full-manual configuration with direct endpoint calls
    if (api === 'full-manual' && endpoint && apiKey) {
        url = endpoint;
        headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        };
        // For direct endpoint calls, use standard OpenAI-compatible format
        body = {
            model,
            messages: [
                { role: 'user', content: prompt }
            ],
            temperature,
            ...extra,
        };
    } else if (api === 'custom' && model) {
        body.custom_model_id = model;
        body.custom_url = oai_settings.custom_url || '';
    }

    const res = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        throw new Error(`LLM request failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    let text = '';

    // Handle different response formats
    if (data.choices?.[0]?.message?.content) {
        text = data.choices[0].message.content;
    } else if (data.completion) {
        text = data.completion;
    } else if (data.choices?.[0]?.text) {
        text = data.choices[0].text;
    } else if (data.content && Array.isArray(data.content)) {
        // Handle Claude's new structured format directly in raw response
        const textBlock = data.content.find(block =>
            block && typeof block === 'object' && block.type === 'text' && block.text
        );
        text = textBlock?.text || '';
    } else if (typeof data.content === 'string') {
        text = data.content;
    }

    return { text, full: data };
}

/**
 * Unified request wrapper for side prompts and memory generation.
 * Accepts normalized connection fields and forwards to sendRawCompletionRequest.
 * @param {{ api: string, model: string, prompt: string, temperature?: number, endpoint?: string, apiKey?: string, extra?: object }} opts
 * @returns {Promise<{ text: string, full: object }>}
 */
export async function requestCompletion({
    api,
    model,
    prompt,
    temperature = 0.7,
    endpoint = null,
    apiKey = null,
    extra = {},
}) {
    // Delegate all provider-specific shaping to sendRawCompletionRequest which already
    // handles: full-manual, custom (custom_model_id + oai_settings.custom_url), and normal providers.
    return await sendRawCompletionRequest({
        model,
        prompt,
        temperature,
        api,
        endpoint,
        apiKey,
        extra,
    });
}

/**
 * Polling configuration for waitForCharacterData
 * @typedef {Object} PollingConfig
 * @property {number} maxWaitMs - Maximum time to wait in milliseconds (default: 5000)
 * @property {number} initialIntervalMs - Initial check interval in milliseconds (default: 100)
 * @property {number} maxIntervalMs - Maximum check interval in milliseconds (default: 1000)
 * @property {number} backoffMultiplier - Multiplier for exponential backoff (default: 1.5)
 * @property {boolean} useExponentialBackoff - Whether to use exponential backoff (default: true)
 * @property {AbortSignal} signal - Optional AbortSignal for cancellation
 */

/**
 * GROUP CHAT SUPPORT: Waits for character/group data to be available with enhanced polling
 * Features exponential backoff, cancellation support, and better error handling
 * @private
 * @param {PollingConfig|number} config - Polling configuration or legacy maxWaitMs parameter
 * @param {number} legacyCheckIntervalMs - Legacy parameter for backward compatibility
 * @returns {Promise<boolean>} True if character/group data is available, false if timeout/cancelled
 */
async function waitForCharacterData(config = {}, legacyCheckIntervalMs = null) {
    // Handle legacy parameter format for backward compatibility
    let pollingConfig;
    if (typeof config === 'number') {
        pollingConfig = {
            maxWaitMs: config,
            initialIntervalMs: legacyCheckIntervalMs || 250,
            maxIntervalMs: 1000,
            backoffMultiplier: 1.2,
            useExponentialBackoff: false // Keep legacy behavior
        };
    } else {
        pollingConfig = {
            maxWaitMs: 5000,
            initialIntervalMs: 100,
            maxIntervalMs: 1000,
            backoffMultiplier: 1.5,
            useExponentialBackoff: true,
            ...config
        };
    }

    const { 
        maxWaitMs, 
        initialIntervalMs, 
        maxIntervalMs, 
        backoffMultiplier, 
        useExponentialBackoff,
        signal 
    } = pollingConfig;

    const startTime = Date.now();
    let currentInterval = initialIntervalMs;
    let attemptCount = 0;
    
    // Import context detection to check if we're in a group chat
    const { getCurrentMemoryBooksContext } = await import('./utils.js');
    const context = getCurrentMemoryBooksContext();
        
    while (Date.now() - startTime < maxWaitMs) {
        // Check for cancellation
        if (signal?.aborted) {
            return false;
        }

        attemptCount++;
        
        if (context.isGroupChat) {
            // Group chat - check if group data is available
            if (groups && context.groupId) {
                const group = groups.find(g => g.id === context.groupId);
                if (group) {
                    return true;
                }
            }
        } else {
            // Single character chat - use original logic
            if (characters && characters.length > this_chid && characters[this_chid]) {
                return true;
            }
        }
        
        // Wait before checking again with potential backoff
        await new Promise((resolve, reject) => {
            const timeoutId = setTimeout(resolve, currentInterval);
            
            // Handle cancellation during sleep
            if (signal) {
                const onAbort = () => {
                    clearTimeout(timeoutId);
                    reject(new Error('Cancelled'));
                };
                signal.addEventListener('abort', onAbort, { once: true });
            }
        }).catch(() => {
            // Cancellation during sleep
            return false;
        });

        // Apply exponential backoff if enabled
        if (useExponentialBackoff && currentInterval < maxIntervalMs) {
            currentInterval = Math.min(currentInterval * backoffMultiplier, maxIntervalMs);
        }
    }
    
    return false;
}

/**
 * Extracts JSON text from Claude's new structured response format
 * @private
 * @param {Object} aiResponse - Raw AI response that might be structured format
 * @returns {string|null} Extracted text content or null if not structured format
 */
function extractFromClaudeStructuredFormat(aiResponse) {
    try {
        // Check if response has the new Claude structured format
        if (typeof aiResponse === 'object' && aiResponse !== null && Array.isArray(aiResponse.content)) {
            // Look for text type block in content array
            const textBlock = aiResponse.content.find(block =>
                block && typeof block === 'object' && block.type === 'text' && block.text
            );

            if (textBlock && typeof textBlock.text === 'string') {
                return textBlock.text;
            }
        }

        return null;
    } catch (error) {
        return null;
    }
}

function likelyUnbalanced(raw) {
    try {
        let braces = 0, brackets = 0, inString = false, escape = false;
        for (let i = 0; i < raw.length; i++) {
            const ch = raw[i];
            if (inString) {
                if (escape) {
                    escape = false;
                } else if (ch === '\\') {
                    escape = true;
                } else if (ch === '"') {
                    inString = false;
                }
            } else {
                if (ch === '"') { inString = true; }
                else if (ch === '{') braces++;
                else if (ch === '}') braces--;
                else if (ch === '[') brackets++;
                else if (ch === ']') brackets--;
            }
            if (braces < 0 || brackets < 0) return true;
        }
        return inString || braces !== 0 || brackets !== 0;
    } catch {
        return false;
    }
}

function endsNicely(text) {
    const t = (text || '').trim();
    if (!t) return true;
    if (/[.!?]["'’\)\]]?$/.test(t)) return true;
    if (t.length >= 80 && !/[.!?]$/.test(t)) return false;
    return true;
}

/**
 * Parses AI response as JSON with robust error handling
 * @private
 * @param {string} aiResponse - Raw AI response text
 * @returns {Object} Parsed JSON object
 * @throws {AIResponseError} If JSON parsing fails
 */
function parseAIJsonResponse(aiResponse) {
    let cleanResponse = aiResponse;

    // Apply user-selected incoming regex scripts (bypass engine gating)
    try {
        const useRegex = !!(extension_settings?.STMemoryBooks?.moduleSettings?.useRegex);
        const selectedKeys = extension_settings?.STMemoryBooks?.moduleSettings?.selectedRegexIncoming;
        if (useRegex && typeof cleanResponse === 'string' && Array.isArray(selectedKeys) && selectedKeys.length > 0) {
            cleanResponse = applySelectedRegex(cleanResponse, selectedKeys);
        }
    } catch (e) {
        console.warn('STMemoryBooks: incoming regex application failed', e);
    }

    // Check for new Claude structured format first
    if (typeof cleanResponse === 'object' && cleanResponse !== null && Array.isArray(cleanResponse.content)) {
        const extractedText = extractFromClaudeStructuredFormat(cleanResponse);
        if (extractedText) {
            cleanResponse = extractedText;
        } else {
            throw new AIResponseError('AI response is empty or invalid');
        }
    }
    // If the response is an object with a .content property (but not array), use that.
    else if (typeof cleanResponse === 'object' && cleanResponse !== null && cleanResponse.content) {
        cleanResponse = cleanResponse.content;
    }

    if (!cleanResponse || typeof cleanResponse !== 'string') {
        throw new AIResponseError('AI response is empty or invalid');
    }

    cleanResponse = cleanResponse.trim();

    // Remove <think> tags and their content
    cleanResponse = cleanResponse.replace(/<think>[\s\S]*?<\/think>/gi, '');

    // Remove code block fences (```json ... ```)
    cleanResponse = cleanResponse.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();

    // Remove any leading explanatory text (before first '{')
    const jsonStart = cleanResponse.indexOf('{');
    if (jsonStart > 0) {
        cleanResponse = cleanResponse.slice(jsonStart);
    }

    // Remove any trailing text after the last '}'
    const jsonEnd = cleanResponse.lastIndexOf('}');
    if (jsonEnd !== -1 && jsonEnd < cleanResponse.length - 1) {
        cleanResponse = cleanResponse.slice(0, jsonEnd + 1);
    }

    // Pre-parse structural sanity
    if (likelyUnbalanced(cleanResponse)) {
        throw new AIResponseError('AI response appears truncated or invalid JSON (unbalanced structures). Try increasing Max Response Length.');
    }

    // Now try to parse
    try {
        const parsed = JSON.parse(cleanResponse);

        // Validate required fields
        if (!parsed.content && !parsed.summary && !parsed.memory_content) {
            throw new AIResponseError('AI response missing content field');
        }
        if (!parsed.title) {
            throw new AIResponseError('AI response missing title field');
        }
        if (!Array.isArray(parsed.keywords)) {
            throw new AIResponseError('AI response missing or invalid keywords array. Try increasing Max Response Length.');
        }

        

        return parsed;

    } catch (parseError) {
        if (parseError instanceof AIResponseError) {
            throw parseError;
        }
        // On pure parse failure, optionally detect mid-sentence cutoff in raw text
        try {
            const textCandidate = (typeof cleanResponse === 'string' ? cleanResponse.trim() : '');
            if (textCandidate && textCandidate.length >= 80 && !endsNicely(textCandidate)) {
                throw new AIResponseError('AI response JSON appears incomplete (text ends mid-sentence). Try increasing Max Response Length.');
            }
        } catch (e) {
            if (e instanceof AIResponseError) throw e;
        }
        throw new AIResponseError(
            `AI did not return valid JSON. This may indicate the model doesn't support structured output well. Try increasing Max Response Length. Parse error: ${parseError.message}`
        );
    }
}




/**
 * Generates memory using AI with structured JSON output instead of tool calling.
 * @private
 * @param {string} promptString - The full prompt for the AI
 * @param {Object} profile - The user-selected profile containing connection settings
 * @returns {Promise<Object>} The structured memory result from JSON parsing
 * @throws {AIResponseError} If the AI generation fails or doesn't return valid JSON
 */
async function generateMemoryWithAI(promptString, profile) {
    const characterDataReady = await waitForCharacterData();
    if (!characterDataReady) {
        throw new AIResponseError(
            'Character data is not available. This may indicate that SillyTavern is still loading. ' +
            'Please wait a moment and try again.'
        );
    }

    const conn = profile?.effectiveConnection || profile?.connection || {};


    try {
        // Prepare connection info
        // Note: ST base uses 'makersuite' as the canonical provider key for this source.
        const apiType = normalizeCompletionSource(conn.api || getCurrentApiInfo().api);
        const extra = {};
        if (oai_settings.openai_max_tokens) {
            extra.max_tokens = oai_settings.openai_max_tokens;
        }

        const { text: aiResponseText, full: aiFull } = await sendRawCompletionRequest({
            model: conn.model,
            prompt: promptString,
            temperature: conn.temperature,
            api: apiType,
            endpoint: conn.endpoint,
            apiKey: conn.apiKey,
            extra: extra
        });

        // Detect provider-reported truncation before attempting to parse
        const finishReason = aiFull?.choices?.[0]?.finish_reason || aiFull?.finish_reason || aiFull?.stop_reason;
        const fr = typeof finishReason === 'string' ? finishReason.toLowerCase() : '';
        if (fr.includes('length') || fr.includes('max')) {
            throw new AIResponseError('Model response appears truncated (provider finish_reason). Please increase Max Response Length.');
        }
        if (aiFull?.truncated === true) {
            throw new AIResponseError('Model response appears truncated (provider flag). Please increase Max Response Length.');
        }

        const jsonResult = parseAIJsonResponse(aiResponseText);

        return {
            content: jsonResult.content || jsonResult.summary || jsonResult.memory_content || '',
            title: jsonResult.title || 'Memory',
            keywords: jsonResult.keywords || [],
            profile: profile
        };
    } catch (error) {
        if (error instanceof AIResponseError) throw error;
        throw new AIResponseError(`Memory generation failed: ${error.message || error}`);
    }
}

/**
 * Creates a memory from a compiled scene using AI with structured JSON output.
 * This is the main entry point for this module.
 *
 * @param {Object} compiledScene - Scene data from chatcompile.js
 * @param {Object} profile - The user-selected memory generation profile from settings
 * @param {Object} options - Additional generation options
 * @param {number} options.tokenWarningThreshold - Token threshold for warnings (default: 30000)
 * @returns {Promise<Object>} The generated memory result, ready for lorebook insertion
 * @throws {TokenWarningError} If the estimated token count exceeds the warning threshold
 * @throws {InvalidProfileError} If the provided profile is incomplete
 * @throws {AIResponseError} If the AI fails to generate a valid response
 * @throws {Error} For other general failures
 */
export async function createMemory(compiledScene, profile, options = {}) {
    
    try {
        validateInputs(compiledScene, profile);
        const promptString = await buildPrompt(compiledScene, profile);
        const tokenEstimate = await estimateTokenUsage(promptString);        
        const tokenWarningThreshold = options.tokenWarningThreshold || 30000;
        if (tokenEstimate.total > tokenWarningThreshold) {
            throw new TokenWarningError(
                'Token warning threshold exceeded.',
                tokenEstimate.total
            );
        }
        
        const response = await generateMemoryWithAI(promptString, profile);
        const processedMemory = processJsonResult(response, compiledScene);

        const memoryResult = {
            content: processedMemory.content,
            extractedTitle: processedMemory.extractedTitle,
            metadata: {
                sceneRange: `${compiledScene.metadata.sceneStart}-${compiledScene.metadata.sceneEnd}`,
                messageCount: compiledScene.metadata.messageCount,
                characterName: compiledScene.metadata.characterName,
                userName: compiledScene.metadata.userName,
                chatId: compiledScene.metadata.chatId,
                createdAt: new Date().toISOString(),
                profileUsed: profile.name,
                presetUsed: profile.preset || 'custom',
                tokenUsage: tokenEstimate,
                generationMethod: 'json-structured-output',
                version: '2.0'
            },
            suggestedKeys: processedMemory.suggestedKeys,
            titleFormat: (profile.useDynamicSTSettings || (profile?.connection?.api === 'current_st')) ?
                (extension_settings.STMemoryBooks?.titleFormat || '[000] - {{title}}') :
                (profile.titleFormat || '[000] - {{title}}'),
            lorebookSettings: {
                constVectMode: profile.constVectMode,
                position: profile.position,
                orderMode: profile.orderMode,
                orderValue: profile.orderValue,
                preventRecursion: profile.preventRecursion,
                delayUntilRecursion: profile.delayUntilRecursion,
            },
            lorebook: {
                content: processedMemory.content,
                comment: `Auto-generated memory from messages ${compiledScene.metadata.sceneStart}-${compiledScene.metadata.sceneEnd}. Profile: ${profile.name}.`,
                key: processedMemory.suggestedKeys || [],
                keysecondary: [],
                selective: true,
                constant: false,
                order: 100,
                position: 'before_char',
                disable: false,
                addMemo: true,
                excludeRecursion: false,
                delayUntilRecursion: false,
                probability: 100,
                useProbability: false
            }
        };
        
        return memoryResult;
        
    } catch (error) {
        if (error instanceof TokenWarningError || error instanceof AIResponseError || error instanceof InvalidProfileError) {
            throw error;
        }
        throw new Error(`Memory creation failed: ${error.message}`);
    }
}

/**
 * Validates the essential inputs for the memory creation process.
 * @private
 * @param {Object} compiledScene - The compiled scene data.
 * @param {Object} profile - The user-selected profile.
 * @throws {Error} If the scene is invalid.
 * @throws {InvalidProfileError} If the profile is invalid.
 */
function validateInputs(compiledScene, profile) {
    // Clear and readable check for empty scene
    if (!compiledScene || !Array.isArray(compiledScene.messages) || compiledScene.messages.length === 0) {
        throw new Error('Invalid or empty compiled scene data provided.');
    }

    // profile must have a non-empty prompt OR a preset key
    const hasPrompt = typeof profile?.prompt === 'string' && profile.prompt.trim().length > 0;
    const hasPreset = typeof profile?.preset === 'string' && profile.preset.trim().length > 0;

    if (!hasPrompt && !hasPreset) {
        throw new InvalidProfileError('Invalid profile configuration. You must set either a custom prompt or a valid preset.');
    }
}

/**
 * Formats the array of scene messages into a single text block for the AI.
 * @private
 * @param {Array<Object>} messages - The messages from the compiled scene.
 * @param {Object} metadata - The metadata from the compiled scene.
 * @param {Array<Object>} previousSummariesContext - Previous summaries for context (optional).
 * @returns {string} A formatted string representing the chat scene.
 */
function formatSceneForAI(messages, metadata, previousSummariesContext = []) {
    const messageLines = messages.map(message => {
        const speaker = message.name || 'Unknown';
        const content = (message.mes || '').trim();
        return content ? `${speaker}: ${content}` : null;
    }).filter(Boolean); // Filter out any empty/null messages
        
    const sceneHeader = [
        ""
    ];
    
    // Add previous memories context if available
    if (previousSummariesContext && previousSummariesContext.length > 0) {
        sceneHeader.push("=== PREVIOUS SCENE CONTEXT (DO NOT SUMMARIZE) ===");
        sceneHeader.push("These are previous memories for context only. Do NOT include them in your new memory:");
        sceneHeader.push("");
        
        previousSummariesContext.forEach((memory, index) => {
            sceneHeader.push(`Context ${index + 1} - ${memory.title}:`);
            sceneHeader.push(memory.content);
            if (memory.keywords && memory.keywords.length > 0) {
                sceneHeader.push(`Keywords: ${memory.keywords.join(', ')}`);
            }
            sceneHeader.push("");
        });
        
        sceneHeader.push("=== END PREVIOUS SCENE CONTEXT - SUMMARIZE ONLY THE SCENE BELOW ===");
        sceneHeader.push("");
    }
    
    sceneHeader.push("=== SCENE TRANSCRIPT ===");
    sceneHeader.push(...messageLines);
    sceneHeader.push("");
    sceneHeader.push("=== END SCENE ===");
    
    return sceneHeader.join('\n');
}

/**
 * Estimates the token usage for the given prompt string.
 * @private
 * @param {string} promptString - The complete prompt to be sent to the AI.
 * @returns {Promise<{input: number, output: number, total: number}>} An object with token counts.
 */
async function estimateTokenUsage(promptString) {
    return await estimateTokens(promptString, { estimatedOutput: 300 });
}

/**
 * Build the complete prompt string for JSON output
 * @private
 * @param {Object} compiledScene - The compiled scene data.
 * @param {Object} profile - The user-selected profile.
 * @returns {Promise<string>} The fully formatted prompt string.
 */
async function buildPrompt(compiledScene, profile) {
    const { metadata, messages, previousSummariesContext } = compiledScene;
    
    // Use utils.js to get the effective prompt (now designed for JSON output)
    const systemPrompt = await getEffectivePrompt(profile);
    
    // Use substituteParams to allow for standard macros like {{char}} and {{user}}
    const processedSystemPrompt = substituteParams(systemPrompt, metadata.userName, metadata.characterName);
    
    // Build scene text for user prompt
    const sceneText = formatSceneForAI(messages, metadata, previousSummariesContext);
    
    // Combine system prompt and scene
    const finalPrompt = `${processedSystemPrompt}\n\n${sceneText}`;

    // Apply user-selected outgoing regex scripts (bypass engine gating)
    try {
        const useRegex = !!(extension_settings?.STMemoryBooks?.moduleSettings?.useRegex);
        const selectedKeys = extension_settings?.STMemoryBooks?.moduleSettings?.selectedRegexOutgoing;
        if (useRegex && Array.isArray(selectedKeys) && selectedKeys.length > 0) {
            return applySelectedRegex(finalPrompt, selectedKeys);
        }
    } catch (e) {
        console.warn('STMemoryBooks: outgoing regex application failed', e);
    }
    return finalPrompt;
}

/**
 * Process the structured result from JSON parsing
 * @private
 * @param {Object} jsonResult - The structured result from JSON parsing
 * @param {Object} compiledScene - The original compiled scene for context
 * @returns {Object} Processed memory data
 */
function processJsonResult(jsonResult, compiledScene) {
    const { content, title, keywords } = jsonResult;
    
    // Clean and validate content
    const cleanContent = (content || jsonResult.summary || jsonResult.memory_content || '').trim();
    const cleanTitle = (title || 'Memory').trim();
    const cleanKeywords = Array.isArray(keywords) ? 
        keywords.filter(k => k && typeof k === 'string' && k.trim() !== '').map(k => k.trim()) : [];
    
    return {
        content: cleanContent,
        extractedTitle: cleanTitle,
        suggestedKeys: cleanKeywords
    };
}
