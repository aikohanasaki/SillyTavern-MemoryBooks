import { getContext } from '../../../extensions.js';
import { getTokenCount } from '../../../tokenizers.js';
import { getEffectivePrompt, getPresetNames, isValidPreset, getPresetPrompt, getCurrentModelSettings } from './utils.js';
import { characters, this_chid, substituteParams, generateQuietPrompt } from '../../../../script.js';
import { promptManager } from '../../../openai.js';

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

/**
 * Creates a memory from a compiled scene using an AI model with tool calling.
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
    console.log(`${MODULE_NAME}: Starting tool-based memory creation for scene ${compiledScene.metadata.sceneStart}-${compiledScene.metadata.sceneEnd}`);
    
    try {
        // 1. Validate inputs
        validateInputs(compiledScene, profile);
        
        // 2. Build the complete prompt for the AI
        const promptString = await buildPrompt(compiledScene, profile);
        
        // 3. Token estimation and warning flow
        const tokenEstimate = await estimateTokenUsage(promptString);
        console.log(`${MODULE_NAME}: Estimated token usage: ${tokenEstimate.total}`);
        
        const tokenWarningThreshold = options.tokenWarningThreshold || 30000;
        if (tokenEstimate.total > tokenWarningThreshold) {
            throw new TokenWarningError(
                'Token warning threshold exceeded.',
                tokenEstimate.total
            );
        }
        
        // 4. Generate memory using tool calling with TOTAL context override
        const toolResult = await generateMemoryWithAI(promptString, profile);
        
        // 5. Process the structured tool result (simplified - no keyword checking)
        const processedMemory = processToolResult(toolResult, compiledScene);
        
        // 6. Create the final memory object (tool calling guarantees complete result)
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
                generationMethod: 'tool-calling',
                version: '1.0'
            },
            suggestedKeys: processedMemory.suggestedKeys,
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
        
        console.log(`${MODULE_NAME}: Tool-based memory creation completed successfully`);
        return memoryResult;
        
    } catch (error) {
        // Re-throw specific errors to be handled by the UI layer
        if (error instanceof TokenWarningError || error instanceof AIResponseError || error instanceof InvalidProfileError) {
            throw error;
        }
        // Wrap generic errors
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
    if (!compiledScene?.messages?.length > 0) {
        throw new Error('Invalid or empty compiled scene data provided.');
    }
    if (!profile?.prompt && !profile?.preset && !profile?.name) {
        throw new InvalidProfileError('Invalid profile configuration. A prompt or preset name is required.');
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
        const estimatedOutputTokens = 200;
        
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
            output: 200,
            total: inputTokens + 200
        };
    }
}

/**
 * Generates memory using AI with TOTAL CONTEXT OVERRIDE to ensure completely clean tool calling.
 * This function implements a two-layer approach:
 * 1. Character field blanking
 * 2. PromptManager source blanking 
 * 3. World Info disabling via generateQuietPrompt's skipWIAN flag
 * 
 * @private
 * @param {string} promptString - The full prompt for the AI
 * @param {Object} profile - The user-selected profile containing connection settings
 * @returns {Promise<Object>} The structured memory result from the tool call
 * @throws {AIResponseError} If the AI generation fails or doesn't call our tool
 */
async function generateMemoryWithAI(promptString, profile) {
    // Get the current application context - this is the correct way to access ST's state
    const context = getContext();

    //temporary debug logging
    console.log(`[MEMORY-DEBUG] Preparing to clone character data. State at this moment:`);
    console.log(`[MEMORY-DEBUG] > this_chid:`, this_chid);
    console.log(`[MEMORY-DEBUG] > Is characters array available?`, Array.isArray(characters));
    if (Array.isArray(characters)) {
        console.log(`[MEMORY-DEBUG] > characters.length:`, characters.length);
        console.log(`[MEMORY-DEBUG] > Value of characters[this_chid]:`, characters[this_chid]);
    }

    // Store all original context data for restoration using deep cloning
    // This prevents mutation issues and makes backup/restore more robust
    const originalCharacterData = JSON.parse(JSON.stringify(characters[this_chid]));
    const originalWorldInfoSettings = JSON.parse(JSON.stringify(context.world_info_settings));
    const originalWorldInfoData = JSON.parse(JSON.stringify(context.world_info_data || {}));
    const originalChatMetadata = JSON.parse(JSON.stringify(context.chat_metadata || {}));
    const originalMainApi = context.main_api;

    try {
        // --- STEP 1: Complete context blanking for clean generation ---
        console.log(`${MODULE_NAME}: Creating completely clean context for AI generation...`);
        
        // Blank out ALL character fields that could influence the AI
        characters[this_chid].name = '';
        characters[this_chid].description = '';
        characters[this_chid].personality = '';
        characters[this_chid].scenario = '';
        characters[this_chid].first_mes = '';
        characters[this_chid].mes_example = '';
        characters[this_chid].creator_notes = '';
        characters[this_chid].system_prompt = '';
        characters[this_chid].post_history_instructions = '';
        characters[this_chid].creator = '';
        characters[this_chid].character_version = '';
        characters[this_chid].extensions = {};

        // Disable world info completely by modifying the context object
        context.world_info_settings.world_info = false;
        context.world_info_data = {};
        context.chat_metadata = {};

        // Force prompt manager refresh
        if (typeof promptManager !== 'undefined' && promptManager.activeCharacter) {
            promptManager.activeCharacter = null;
        }

        // --- STEP 2: Create Promise-based tool result handler ---
        const toolPromise = new Promise((resolve, reject) => {
            // Set a generous timeout for the AI response
            const timeout = setTimeout(() => {
                delete window.STMemoryBooks_resolveToolResult; // Clean up resolver
                reject(new AIResponseError(
                    'The AI model did not produce a valid tool call for `createMemory`. This could be due to:\n' +
                    '• The model ignoring the instruction to use the tool.\n' +
                    '• A delayed API response or processing issue.\n\n' +
                    'Please verify your model supports function calling and try again.'
                ));
            }, 20000); // Wait for 20 seconds, much safer for slow APIs

            // Expose the resolver function globally for the tool action to find
            window.STMemoryBooks_resolveToolResult = (result) => {
                clearTimeout(timeout); // Cancel the timeout
                delete window.STMemoryBooks_resolveToolResult; // Clean up resolver
                resolve(result);
            };
        });

        // --- STEP 3: Send the AI request ---
        console.log(`${MODULE_NAME}: Sending clean prompt for tool-based generation`);
        await generateQuietPrompt(promptString, false, true);

        // --- STEP 4: Wait for our promise to be resolved by the tool's action ---
        console.log(`${MODULE_NAME}: Waiting for tool result via promise...`);
        const toolResult = await toolPromise;

        console.log(`${MODULE_NAME}: Successfully received structured memory via total context override:`, {
            hasContent: !!toolResult.memory_content,
            contentLength: toolResult.memory_content?.length || 0,
            hasTitle: !!toolResult.title,
            keywordCount: toolResult.keywords?.length || 0
        });

        // --- STEP 5: Validate the tool result structure ---
        if (!toolResult || typeof toolResult !== 'object') {
            throw new AIResponseError('Tool result is missing or invalid. The AI may not have used the createMemory function correctly.');
        }

        if (!toolResult.memory_content || typeof toolResult.memory_content !== 'string' || toolResult.memory_content.trim() === '') {
            throw new AIResponseError('Tool result is missing required memory_content field or it is empty.');
        }

        if (!toolResult.title || typeof toolResult.title !== 'string' || toolResult.title.trim() === '') {
            throw new AIResponseError('Tool result is missing required title field or it is empty.');
        }

        if (!Array.isArray(toolResult.keywords) || toolResult.keywords.length === 0) {
            throw new AIResponseError('Tool result is missing required keywords array or it is empty.');
        }

        // --- STEP 6: Return the validated result ---
        return {
            content: toolResult.memory_content.trim(),
            title: toolResult.title.trim(),
            keywords: toolResult.keywords.filter(k => k && typeof k === 'string' && k.trim() !== '').map(k => k.trim()),
            profile: profile
        };

    } catch (error) {
        console.error(`${MODULE_NAME}: Tool-based memory generation failed:`, error);
        
        if (error instanceof AIResponseError) {
            throw error;
        } else {
            throw new AIResponseError(`Unexpected error during memory generation: ${error.message || error}`);
        }
    } finally {
        // --- ALWAYS restore ALL original data ---
        console.log(`${MODULE_NAME}: Restoring original character fields and prompt content...`);
        
        // Cleanup the resolver in case of an early error
        if (window.STMemoryBooks_resolveToolResult) {
            delete window.STMemoryBooks_resolveToolResult;
        }

        // Restore character data from our deep clone
        Object.assign(characters[this_chid], originalCharacterData);

        // Restore settings on the context object from our deep clones
        context.main_api = originalMainApi;
        context.world_info_settings = originalWorldInfoSettings;
        context.world_info_data = originalWorldInfoData;
        context.chat_metadata = originalChatMetadata;

        // Force prompt manager refresh with restored data
        if (typeof promptManager !== 'undefined') {
            promptManager.activeCharacter = characters[this_chid];
        }

        console.log(`${MODULE_NAME}: Context restoration complete - all original data restored`);
    }
}

/**
 * Build the complete prompt string using proven system prompts
 * The original prompts are technically precise and optimized for vectorized databases
 * @private
 * @param {Object} compiledScene - The compiled scene data.
 * @param {Object} profile - The user-selected profile.
 * @returns {Promise<string>} The fully formatted prompt string.
 */
async function buildPrompt(compiledScene, profile) {
    const { metadata, messages, previousSummariesContext } = compiledScene;
    
    // Use utils.js to get the effective prompt (proven prompts with precise formatting requirements)
    const systemPrompt = getEffectivePrompt(profile);
    
    // Use substituteParams to allow for standard macros like {{char}} and {{user}}
    const processedSystemPrompt = substituteParams(systemPrompt, metadata.userName, metadata.characterName);
    
    // Build scene text for user prompt
    const sceneText = formatSceneForAI(messages, metadata, previousSummariesContext);
    
    // Combine system prompt and scene - trust the enhanced tool description and proven prompts
    // to naturally guide the model to use the createMemory tool without explicit forcing
    return `${processedSystemPrompt}\n\n${sceneText}`;
}

/**
 * Process the structured result from the createMemory tool
 * @private
 * @param {Object} toolResult - The structured result from createMemory tool
 * @param {Object} compiledScene - The original compiled scene for context
 * @returns {Object} Processed memory data
 */
function processToolResult(toolResult, compiledScene) {
    const { content, title, keywords } = toolResult;
    
    console.log(`${MODULE_NAME}: Processing structured tool result - Content: ${content.length} chars, Keywords: ${keywords.length}`);
    
    return {
        content: content,
        extractedTitle: title || 'Memory',
        suggestedKeys: keywords
    };
}

/**
 * Get available built-in presets using utils.js
 * @returns {Object} Available presets with basic info
 */
export function getAvailablePresets() {
    return getPresetNames().reduce((acc, presetName) => {
        acc[presetName] = {
            name: presetName.charAt(0).toUpperCase() + presetName.slice(1),
            description: `${presetName} preset`
        };
        return acc;
    }, {});
}

/**
 * Validate preset configuration using utils.js
 * @param {string} presetKey - Preset key to validate
 * @returns {boolean} Whether preset is valid and available
 */
export function validatePreset(presetKey) {
    return isValidPreset(presetKey);
}

/**
 * Get memory creation statistics
 * @param {Object} compiledScene - The compiled scene data
 * @returns {Object} Statistics about the memory creation process
 */
export function getMemoryStats(compiledScene) {
    const stats = {
        messageCount: compiledScene.messages.length,
        characterCount: compiledScene.messages.reduce((total, msg) => total + (msg.mes || '').length, 0),
        speakers: [...new Set(compiledScene.messages.map(msg => msg.name))],
        timeSpan: {
            start: compiledScene.messages[0]?.send_date,
            end: compiledScene.messages[compiledScene.messages.length - 1]?.send_date
        },
        sceneRange: `${compiledScene.metadata.sceneStart}-${compiledScene.metadata.sceneEnd}`
    };
    
    return stats;
}

/**
 * Validate memory result before passing to addlore.js
 * @param {Object} memoryResult - Generated memory result
 * @returns {Object} Validation result
 */
export function validateMemoryResult(memoryResult) {
    const errors = [];
    const warnings = [];
    
    if (!memoryResult.content || typeof memoryResult.content !== 'string') {
        errors.push('Missing or invalid memory content');
    } else if (memoryResult.content.length < 10) {
        warnings.push('Memory content is very short');
    } else if (memoryResult.content.length > 2000) {
        warnings.push('Memory content is very long');
    }
    
    if (!memoryResult.metadata) {
        errors.push('Missing memory metadata');
    }
    
    if (!memoryResult.lorebook) {
        errors.push('Missing lorebook configuration');
    }
    
    const isValid = errors.length === 0;
    
    if (!isValid) {
        console.error(`${MODULE_NAME}: Memory validation failed:`, errors);
    }
    
    if (warnings.length > 0) {
        console.warn(`${MODULE_NAME}: Memory validation warnings:`, warnings);
    }
    
    return {
        valid: isValid,
        errors,
        warnings
    };
}