import { getTokenCount } from '../../../tokenizers.js';
import { getEffectivePrompt, getCurrentApiInfo, isValidPreset } from './utils.js';
import { characters, this_chid, substituteParams, getRequestHeaders } from '../../../../script.js';
import { oai_settings } from '../../../openai.js';
import { groups } from '../../../group-chats.js';
const $ = window.jQuery;

const MODULE_NAME = 'STMemoryBooks-Memory';

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
*@param {string} [opts.api] - 'openai', 'claude', 'google', 'custom', etc.*
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

    let text = data.choices?.[0]?.message?.content ?? data.completion ?? data.choices?.[0]?.text ?? '';

    return { text, full: data };
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
 * Parses AI response as JSON with robust error handling
 * @private
 * @param {string} aiResponse - Raw AI response text
 * @returns {Object} Parsed JSON object
 * @throws {AIResponseError} If JSON parsing fails
 */
function parseAIJsonResponse(aiResponse) {
    let cleanResponse = aiResponse;

    // If the response is an object with a .content property, use that.
    if (typeof cleanResponse === 'object' && cleanResponse !== null && cleanResponse.content) {
        cleanResponse = cleanResponse.content;
    }

    if (!cleanResponse || typeof cleanResponse !== 'string') {
        throw new AIResponseError('AI response is empty or invalid');
    }

    cleanResponse = cleanResponse.trim();

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
            throw new AIResponseError('AI response missing or invalid keywords array');
        }
        return parsed;
    } catch (parseError) {
        throw new AIResponseError(
            `AI did not return valid JSON. This may indicate the model doesn't support structured output well. ` +
            `Parse error: ${parseError.message}`
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

    const apiToSource = {
        openai: 'openai',
        claude: 'claude',
        openrouter: 'openrouter',
        ai21: 'ai21',
        makersuite: 'makersuite',
        google: 'makersuite',
        vertexai: 'vertexai',
        mistralai: 'mistralai',
        custom: 'custom',
        cohere: 'cohere',
        perplexity: 'perplexity',
        groq: 'groq',
        '01ai': '01ai',
        nanogpt: 'nanogpt',
        deepseek: 'deepseek',
        aimlapi: 'aimlapi',
        xai: 'xai',
        pollinations: 'pollinations',
        windowai: 'windowai',
        scale: 'scale',
        blockentropy: 'blockentropy',
        'full-manual': 'custom',
    };
    const chatCompletionSource = apiToSource[conn.api] || 'openai';

    const genOptions = {
        // Pass both to satisfy different ST versions
        prompt: promptString,
        quiet_prompt: promptString,

        skipWIAN: true,
        stopping_strings: ['\n\n---', '\n\n```', '\n\nHuman:', '\n\nAssistant:'],

        // Force provider/engine
        chat_completion_source: chatCompletionSource,
        model: conn.model || undefined,
        custom_model_id: chatCompletionSource === 'custom' ? (conn.model || undefined) : undefined,
        temperature: (typeof conn.temperature === 'number') ? Math.max(0, Math.min(2, conn.temperature)) : undefined,

        // Defeat model/temp locks in many setups
        bypass_mtlock: true,
        force_model: true,
    };

    try {
        // Prepare connection info
        const apiType = conn.api || getCurrentApiInfo().api;
        const { text: aiResponseText } = await sendRawCompletionRequest({
            model: conn.model,
            prompt: promptString,
            temperature: conn.temperature,
            api: apiType,
            endpoint: conn.endpoint,
            apiKey: conn.apiKey,
        });

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
            titleFormat: profile.titleFormat || '[000] - {{title}}',
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

    // profile must have a non-empty prompt OR a valid preset
    const hasPrompt = typeof profile?.prompt === 'string' && profile.prompt.trim().length > 0;
    const hasValidPreset = typeof profile?.preset === 'string' && isValidPreset(profile.preset);

    if (!hasPrompt && !hasValidPreset) {
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
    try {
        const inputTokens = await getTokenCount(promptString);
        // A reasonable estimate for a memory summary output
        const estimatedOutputTokens = 300; // Slightly higher for JSON structure
        
        return {
            input: inputTokens,
            output: estimatedOutputTokens,
            total: inputTokens + estimatedOutputTokens
        };
    } catch (error) {
        const charCount = promptString.length;
        const inputTokens = Math.ceil(charCount / 4); // A common approximation
        return {
            input: inputTokens,
            output: 300,
            total: inputTokens + 300
        };
    }
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
    const systemPrompt = getEffectivePrompt(profile);
    
    // Use substituteParams to allow for standard macros like {{char}} and {{user}}
    const processedSystemPrompt = substituteParams(systemPrompt, metadata.userName, metadata.characterName);
    
    // Build scene text for user prompt
    const sceneText = formatSceneForAI(messages, metadata, previousSummariesContext);
    
    // Combine system prompt and scene
    return `${processedSystemPrompt}\n\n${sceneText}`;
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