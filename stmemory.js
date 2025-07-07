import { getContext } from '../../../extensions.js';
import { getTokenCount } from '../../../tokenizers.js';
import { getEffectivePrompt, getPresetNames, isValidPreset, deepClone } from './utils.js';
import { characters, this_chid, substituteParams, Generate } from '../../../../script.js';
import { ToolManager } from '../../../tool-calling.js';

const MODULE_NAME = 'STMemoryBooks-Memory';

// --- Promise resolver for tool calling ---
let memoryToolResolver = null;

/**
 * Sets the Promise resolver for the createMemory tool.
 * This is called from the tool registration in index.js.
 * @param {Function} resolver - The Promise resolver function.
 */
export function setMemoryToolResolver(resolver) {
    memoryToolResolver = resolver;
}

/**
 * Helper function to call the memory tool resolver with data.
 * @param {Object} data - The data to pass to the resolver
 */
export function callMemoryToolResolver(data) {
    if (memoryToolResolver && typeof memoryToolResolver === 'function') {
        memoryToolResolver(data);
        memoryToolResolver = null; // Clean up after calling
    } else {
        console.error(`${MODULE_NAME}: No memory tool resolver available or resolver is not a function`);
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

/**
 * Waits for character data to be available with retry mechanism
 * @private
 * @param {number} maxWaitMs - Maximum time to wait in milliseconds (default: 10000)
 * @param {number} checkIntervalMs - How often to check in milliseconds (default: 250)
 * @returns {Promise<boolean>} True if character data is available, false if timeout
 */
async function waitForCharacterData(maxWaitMs = 10000, checkIntervalMs = 250) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitMs) {
        if (characters && characters.length > this_chid && characters[this_chid]) {
            console.log(`${MODULE_NAME}: Character data became available after ${Date.now() - startTime}ms`);
            return true;
        }
        
        // Wait before checking again
        await new Promise(resolve => setTimeout(resolve, checkIntervalMs));
    }
    
    console.warn(`${MODULE_NAME}: Character data did not become available within ${maxWaitMs}ms timeout`);
    return false;
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
    console.log(`${MODULE_NAME}: Starting Promise-based memory creation for scene ${compiledScene.metadata.sceneStart}-${compiledScene.metadata.sceneEnd}`);
    
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
        
        // 4. Generate memory using SillyTavern's main Generate function with Promise-based tool calling
        const response = await generateMemoryWithAI(promptString, profile);
        
        // 5. Process the structured tool result 
        const processedMemory = processToolResult(response, compiledScene);
        
        // 6. Create the final memory object
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
                generationMethod: 'promise-based-tool-calling',
                version: '1.2'
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
        
        console.log(`${MODULE_NAME}: Promise-based memory creation completed successfully`);
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
 * Creates a Promise that resolves when the AI calls the createMemory tool.
 * Includes a fix for the nested tool_calls array bug.
 * 
 * @private
 * @param {string} promptString - The full prompt for the AI
 * @param {Object} profile - The user-selected profile containing connection settings
 * @returns {Promise<Object>} The structured memory result from the tool call
 * @throws {AIResponseError} If the AI generation fails or doesn't call our tool
 */
async function generateMemoryWithAI(promptString, profile) {
    // Wait for character data to be available before proceeding
    const characterDataReady = await waitForCharacterData();
    if (!characterDataReady) {
        throw new AIResponseError(
            'Character data is not available. This may indicate that SillyTavern is still loading. ' +
            'Please wait a moment and try again.'
        );
    }

    // Save the original ToolManager function
    const originalInvokeFunctionTools = ToolManager.invokeFunctionTools;
    let timeoutId; // Declare timeout ID in outer scope for cleanup
    
    try {
        console.log(`${MODULE_NAME}: Starting Promise-based memory generation with tool_calls fix...`);

        // Apply the monkey patch to fix nested tool_calls arrays
        ToolManager.invokeFunctionTools = async function(data) {
            // Fix the nested array bug: [[{...}]] → [{...}]
            if (data && data.choices) {
                for (const choice of data.choices) {
                    const toolCalls = choice.message?.tool_calls;
                    if (Array.isArray(toolCalls) && toolCalls.length === 1 && Array.isArray(toolCalls[0])) {
                        console.log(`${MODULE_NAME}: Fixed nested tool_calls array structure`);
                        choice.message.tool_calls = toolCalls[0];
                    }
                }
            }
            
            // Call the original function with the fixed data
            // Use .apply to maintain correct 'this' context
            return originalInvokeFunctionTools.apply(this, arguments);
        };

        // Create Promise that will resolve when tool is called
        const memoryToolPromise = new Promise((resolve, reject) => {
            // Set the resolver so the tool can call it
            memoryToolResolver = (toolData) => {
                console.log(`${MODULE_NAME}: Tool called with data:`, {
                    hasContent: !!toolData.content,
                    contentLength: toolData.content?.length || 0,
                    hasTitle: !!toolData.title,
                    keywordCount: toolData.keywords?.length || 0
                });
                // Clear timeout since tool was called successfully
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                }
                resolve(toolData);
            };
            
            // Add timeout to prevent hanging
            timeoutId = setTimeout(() => {
                memoryToolResolver = null;
                reject(new AIResponseError(
                    'Tool call timeout - AI did not call createMemory within 60 seconds. ' +
                    'This may indicate the model does not support function calling or the prompt was insufficient.'
                ));
            }, 60000); // 60 second timeout
        });

        // Run Generate() and let it complete its internal process (including tool calls)
        await Generate('quiet', { 
            quiet_prompt: promptString, 
            skipWIAN: true  // Clean context without World Info, Author's Note, etc.
        });

        // Now await the tool result. If the tool was called during Generate(), 
        // this will resolve immediately. If not, the timeout will trigger.
        const toolResult = await memoryToolPromise;

        // Clean up timeout if still active
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        // Validate the tool result structure
        if (!toolResult.content || typeof toolResult.content !== 'string' || !toolResult.content.trim()) {
            throw new AIResponseError('Tool result is missing or has empty content.');
        }

        if (!toolResult.title || typeof toolResult.title !== 'string' || !toolResult.title.trim()) {
            throw new AIResponseError('Tool result is missing or has empty title.');
        }

        if (!Array.isArray(toolResult.keywords) || toolResult.keywords.length === 0) {
            throw new AIResponseError('Tool result is missing or has empty keywords array.');
        }

        // Return the validated, cleaned result
        return {
            content: toolResult.content.trim(),
            title: toolResult.title.trim(),
            keywords: toolResult.keywords.filter(k => k && typeof k === 'string' && k.trim() !== '').map(k => k.trim()),
            profile: profile
        };

    } catch (error) {
        console.error(`${MODULE_NAME}: Promise-based memory generation failed:`, error);
        
        // Clean up resolver
        memoryToolResolver = null;
        
        if (error instanceof AIResponseError) {
            throw error;
        } else {
            throw new AIResponseError(`Unexpected error during memory generation: ${error.message || error}`);
        }
    } finally {
        // CRITICAL: Always restore the original function, no matter what happens
        ToolManager.invokeFunctionTools = originalInvokeFunctionTools;
        console.log(`${MODULE_NAME}: Restored original ToolManager.invokeFunctionTools`);
        
        // Always clean up resolver and timeout
        memoryToolResolver = null;
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
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
 * Build the complete prompt string
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
    
    // Combine system prompt and scene
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
    
    console.log(`${MODULE_NAME}: Processing Promise-based tool result - Content: ${content.length} chars, Keywords: ${keywords.length}`);
    
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