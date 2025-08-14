import { getContext } from '../../../extensions.js';
import { getTokenCount } from '../../../tokenizers.js';
import { getEffectivePrompt, getCurrentApiInfo, getCurrentModelSettings, getApiSelectors, getPresetNames, isValidPreset, deepClone } from './utils.js';
import { characters, this_chid, substituteParams, Generate } from '../../../../script.js';
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

function getCurrentCompletionEndpoint(api) {
    if (api === 'custom') {
        // Use SillyTavern's stored custom endpoint
        return window.oai_settings?.custom_url || '/api/openai/v1/chat/completions';
    }
    if (api === 'openai') {
        return '/api/openai/v1/chat/completions';
    }
    if (api === 'claude') {
        return '/api/claude/v1/messages';
    }
    if (api === 'google') {
        return '/api/google/v1/messages';
    }
    return '/api/openai/v1/chat/completions'; // fallback
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
    extra = {},
}) {
    let url = getCurrentCompletionEndpoint(api);

    let body = {};
    if (api === 'openai' || api === 'custom') {
        body = {
            model,
            messages: [
                { role: 'user', content: prompt }
            ],
            temperature,
            ...extra,
        };
    } else if (api === 'claude') {
        body = {
            model,
            messages: [
                { role: 'user', content: prompt }
            ],
            temperature,
            ...extra,
        };
    } else if (api === 'google') {
        body = {
            model,
            contents: [
                { role: 'user', parts: [{ text: prompt }] }
            ],
            temperature,
            ...extra,
        };
    }

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        throw new Error(`LLM request failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    let text = '';
    if (api === 'openai' || api === 'custom') {
        text = data.choices?.[0]?.message?.content ?? '';
    } else if (api === 'claude') {
        text = data.completion ?? data.choices?.[0]?.message?.content ?? '';
    } else if (api === 'google') {
        text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    }

    return { text, full: data };
}

/**
 * GROUP CHAT SUPPORT: Waits for character/group data to be available with retry mechanism
 * @private
 * @param {number} maxWaitMs - Maximum time to wait in milliseconds (default: 5000)
 * @param {number} checkIntervalMs - How often to check in milliseconds (default: 250)
 * @returns {Promise<boolean>} True if character/group data is available, false if timeout
 */
async function waitForCharacterData(maxWaitMs = 5000, checkIntervalMs = 250) {
    const startTime = Date.now();
    
    // Import context detection to check if we're in a group chat
    const { getCurrentMemoryBooksContext } = await import('./utils.js');
    const context = getCurrentMemoryBooksContext();
    
    console.log(`${MODULE_NAME}: waitForCharacterData - context:`, context);
    console.log(`${MODULE_NAME}: waitForCharacterData - isGroupChat:`, context.isGroupChat);
    
    while (Date.now() - startTime < maxWaitMs) {
        if (context.isGroupChat) {
            // Group chat - check if group data is available
            console.log(`${MODULE_NAME}: Checking group data - groups:`, !!groups, 'length:', groups?.length, 'groupId:', context.groupId);
            if (groups && context.groupId) {
                const group = groups.find(g => g.id === context.groupId);
                console.log(`${MODULE_NAME}: Found group:`, !!group);
                if (group) {
                    console.log(`${MODULE_NAME}: Group data became available after ${Date.now() - startTime}ms`);
                    return true;
                }
            }
        } else {
            // Single character chat - use original logic
            console.log(`${MODULE_NAME}: Checking character data - characters:`, !!characters, 'this_chid:', this_chid);
            if (characters && characters.length > this_chid && characters[this_chid]) {
                console.log(`${MODULE_NAME}: Character data became available after ${Date.now() - startTime}ms`);
                return true;
            }
        }
        
        // Wait before checking again
        await new Promise(resolve => setTimeout(resolve, checkIntervalMs));
    }
    
    console.warn(`${MODULE_NAME}: Character/group data did not become available within ${maxWaitMs}ms timeout`);
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
        console.error('STMemoryBooks: Failed to parse AI JSON response:', parseError);
        console.error('Original response:', aiResponse);
        console.error('Cleaned response:', cleanResponse);
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
        });

        const jsonResult = parseAIJsonResponse(aiResponseText);

        return {
            content: jsonResult.content || jsonResult.summary || jsonResult.memory_content || '',
            title: jsonResult.title || 'Memory',
            keywords: jsonResult.keywords || [],
            profile: profile
        };
    } catch (error) {
        console.error(`${MODULE_NAME}: JSON-based memory generation failed:`, error);
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
    console.log(`${MODULE_NAME}: Starting JSON-based memory creation for scene ${compiledScene.metadata.sceneStart}-${compiledScene.metadata.sceneEnd}`);
    
    try {
        validateInputs(compiledScene, profile);
        const promptString = await buildPrompt(compiledScene, profile);
        const tokenEstimate = await estimateTokenUsage(promptString);
        console.log(`${MODULE_NAME}: Estimated token usage: ${tokenEstimate.total}`);
        
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
        
        console.log(`${MODULE_NAME}: JSON-based memory creation completed successfully`);
        return memoryResult;
        
    } catch (error) {
        if (error instanceof TokenWarningError || error instanceof AIResponseError || error instanceof InvalidProfileError) {
            throw error;
        }
        console.error(`${MODULE_NAME}: An unexpected error occurred during memory creation:`, error);
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
        "=== CHAT SCENE TO SUMMARIZE ===",
        `Character: ${metadata.characterName || 'Unknown'}`,
        `User: ${metadata.userName || 'User'}`,
        `Chat ID: ${metadata.chatId || 'Unknown'}`,
        `Messages: ${metadata.sceneStart} to ${metadata.sceneEnd} (${messages.length} total)`,
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
        
        sceneHeader.push("=== END CONTEXT - SUMMARIZE ONLY THE SCENE BELOW ===");
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
        console.warn(`${MODULE_NAME}: Token estimation with tokenizer failed, using fallback character count.`, error);
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
    
    console.log(`${MODULE_NAME}: Processing JSON result - Content: ${cleanContent.length} chars, Keywords: ${cleanKeywords.length}`);
    
    return {
        content: cleanContent,
        extractedTitle: cleanTitle,
        suggestedKeys: cleanKeywords
    };
}