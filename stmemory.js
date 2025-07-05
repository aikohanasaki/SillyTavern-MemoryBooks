import { getContext } from '../../../extensions.js';
import { substituteParams } from '../../../../script.js';
import { generateQuietPrompt } from '../../../../script.js';
import { getTokenCount } from '../../../tokenizers.js';
import { getEffectivePrompt, getPresetNames, isValidPreset, getPresetPrompt, getCurrentModelSettings } from './utils.js';

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
        
        // 4. Generate memory using tool calling
        const toolResult = await generateMemoryWithAI(promptString, profile);
        
        // 5. Process the structured tool result
        const processedMemory = processToolResult(toolResult, compiledScene);
        
        // Check if keywords need user intervention
        if (processedMemory.needsKeywordGeneration) {
            console.log(`${MODULE_NAME}: Keywords need user intervention`);
            
            return {
                content: processedMemory.content,
                extractedTitle: processedMemory.extractedTitle,
                compiledScene: compiledScene,
                profile: profile,
                needsKeywordGeneration: true,
                tokenUsage: tokenEstimate
            };
        }
        
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
 * Builds the complete prompt string to be sent to the AI.
 * @private
 * @param {Object} compiledScene - The compiled scene data.
 * @param {Object} profile - The user-selected profile.
 * @returns {Promise<string>} The fully formatted prompt string.
 */
async function buildPrompt(compiledScene, profile) {
    const { metadata, messages, previousSummariesContext } = compiledScene;
    
    // Use utils.js to get the effective prompt (handles presets, custom prompts, and fallbacks)
    const systemPrompt = getEffectivePrompt(profile);
    
    // Use substituteParams to allow for standard macros like {{char}} and {{user}}
    const processedSystemPrompt = substituteParams(systemPrompt, metadata.userName, metadata.characterName);
    
    // Build scene text for user prompt
    const sceneText = formatSceneForAI(messages, metadata, previousSummariesContext);
    
    // Combine system prompt and scene text into a single prompt
    return `${processedSystemPrompt}\n\n${sceneText}`;
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
 * Generates the memory by calling the AI with tool calling.
 * The AI will use the createMemory tool instead of generating free-form text.
 *
 * @private
 * @param {string} promptString - The full prompt for the AI.
 * @param {Object} profile - The user-selected profile containing connection settings.
 * @returns {Promise<Object>} The structured memory result from the tool call.
 * @throws {AIResponseError} If the AI generation fails or doesn't call our tool.
 */
async function generateMemoryWithAI(promptString, profile) {
    console.log(`${MODULE_NAME}: Generating memory using createMemory tool`);

    // Clear any previous tool results
    delete window.STMemoryBooks_toolResult;

    // Import ToolManager to check support
    const { ToolManager } = await import('../../../tool-calling.js');
    
    // Verify tool calling is supported
    if (!ToolManager.isToolCallingSupported()) {
        throw new AIResponseError('Tool calling is not supported with current settings. Please enable function calling in your OpenAI settings.');
    }

    // Create a prompt that instructs the AI to use the createMemory tool
    const toolPrompt = `${promptString}

IMPORTANT: You must use the createMemory tool to provide your response. Do not write a text response. Call the createMemory function with:
- memory_content: Your detailed summary of the scene
- title: A short title (1-3 words) 
- keywords: 3-8 relevant keywords for finding this memory later

Use the createMemory tool now.`;

    try {
        // Use SillyTavern's standard generation (tools will be automatically included)
        console.log(`${MODULE_NAME}: Making tool-enabled generation request`);
        const response = await generateQuietPrompt(toolPrompt, false, true);
        
        // Wait briefly for tool execution to complete
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if our tool was called
        if (!window.STMemoryBooks_toolResult) {
            throw new AIResponseError('AI did not call the createMemory tool. Please try again or check your model supports function calling.');
        }

        const toolResult = window.STMemoryBooks_toolResult;
        delete window.STMemoryBooks_toolResult; // Clean up

        console.log(`${MODULE_NAME}: Received structured memory from createMemory tool:`, toolResult);

        // Validate the tool result
        if (!toolResult.memory_content || typeof toolResult.memory_content !== 'string') {
            throw new AIResponseError('Invalid tool result: missing or invalid memory_content');
        }

        if (toolResult.memory_content.trim().length < 10) {
            throw new AIResponseError('Generated memory content is too short');
        }

        // Return structured result
        return {
            content: toolResult.memory_content.trim(),
            title: toolResult.title || 'Memory',
            keywords: Array.isArray(toolResult.keywords) ? toolResult.keywords : []
        };

    } catch (error) {
        console.error(`${MODULE_NAME}: Tool-based memory generation failed:`, error);
        
        if (error instanceof AIResponseError) {
            throw error;
        }
        
        throw new AIResponseError(`Memory generation failed: ${error.message}`);
    }
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
        suggestedKeys: keywords && keywords.length > 0 ? keywords : null,
        needsKeywordGeneration: !keywords || keywords.length === 0
    };
}

/**
 * Generates fallback keywords from the memory content for lorebook keys.
 * @private
 * @param {string} content - The generated memory content.
 * @param {string} characterName - The name of the main character.
 * @returns {Array<string>} An array of suggested keywords.
 */
function generateFallbackKeys(content, characterName) {
    const keys = new Set();
    
    // Always add the character's name as a primary key
    if (characterName) {
        keys.add(characterName);
    }
    
    // A simple regex to find capitalized words (potential proper nouns)
    const properNouns = content.match(/\b[A-Z][a-z]{2,}\b/g) || [];
    properNouns.forEach(noun => {
        // Exclude common words that might start a sentence
        if (!['The', 'A', 'An', 'He', 'She', 'It', 'They', 'User'].includes(noun) && noun !== characterName) {
            keys.add(noun);
        }
    });
    
    // Limit to a reasonable number of keys to avoid clutter
    const keyArray = Array.from(keys).slice(0, 8);
    console.log(`${MODULE_NAME}: Generated ${keyArray.length} fallback keywords:`, keyArray);
    
    return keyArray;
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
 * Complete memory creation with user-chosen keyword generation method
 * @param {Object} keywordPromptResult - Result from createMemory() when keywords needed
 * @param {string} method - 'st-generate', 'ai-keywords', or 'user-input'
 * @param {Array<string>} userKeywords - Keywords provided by user (for 'user-input' method)
 * @returns {Promise<Object>} Complete memory result
 */
export async function completeMemoryWithKeywords(keywordPromptResult, method, userKeywords = []) {
    console.log(`${MODULE_NAME}: Completing memory with keyword method: ${method}`);
    
    const { content, extractedTitle, compiledScene, profile, tokenUsage } = keywordPromptResult;
    let finalKeywords = [];
    
    try {
        switch (method) {
            case 'st-generate':
                // Use SillyTavern's built-in keyword generation
                finalKeywords = generateFallbackKeys(content, compiledScene.metadata.characterName);
                break;
                
            case 'ai-keywords':
                // Send keywords-only request to AI using keywords preset
                finalKeywords = await generateKeywordsWithAI(compiledScene, profile);
                break;
                
            case 'user-input':
                // Use user-provided keywords
                finalKeywords = Array.isArray(userKeywords) ? userKeywords : [];
                break;
                
            default:
                throw new Error(`Unknown keyword generation method: ${method}`);
        }
        
        console.log(`${MODULE_NAME}: Generated ${finalKeywords.length} keywords using ${method} method`);
        
        // Create final memory object
        const memoryResult = {
            content: content,
            extractedTitle: extractedTitle,
            metadata: {
                sceneRange: `${compiledScene.metadata.sceneStart}-${compiledScene.metadata.sceneEnd}`,
                messageCount: compiledScene.metadata.messageCount,
                characterName: compiledScene.metadata.characterName,
                userName: compiledScene.metadata.userName,
                chatId: compiledScene.metadata.chatId,
                createdAt: new Date().toISOString(),
                profileUsed: profile.name,
                presetUsed: profile.preset || 'custom',
                keywordMethod: method,
                tokenUsage: tokenUsage,
                version: '1.0'
            },
            suggestedKeys: finalKeywords,
            lorebook: {
                content: content,
                comment: `Auto-generated memory from messages ${compiledScene.metadata.sceneStart}-${compiledScene.metadata.sceneEnd}. Profile: ${profile.name}. Keywords: ${method}.`,
                key: finalKeywords || [],
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
        
        console.log(`${MODULE_NAME}: Memory creation completed successfully with ${method} keywords`);
        return memoryResult;
        
    } catch (error) {
        console.error(`${MODULE_NAME}: Error completing memory with keywords:`, error);
        throw new AIResponseError(`Keyword generation failed: ${error.message}`);
    }
}

/**
 * Generate keywords using AI with the keywords preset from utils.js
 * @private
 */
async function generateKeywordsWithAI(compiledScene, profile) {
    console.log(`${MODULE_NAME}: Generating keywords using createMemory tool with keywords-only prompt`);
    
    try {
        // Create a keywords-focused prompt
        const keywordsPrompt = `Based on this scene, generate only keywords for a vectorized database.
        
${formatSceneForAI(compiledScene.messages, compiledScene.metadata)}

Generate 3-8 keywords that would help find this scene later. Use the createMemory tool with only the keywords field filled - leave memory_content as "keywords only".`;

        // Clear any previous results
        delete window.STMemoryBooks_toolResult;
        
        // Make the tool call
        await generateQuietPrompt(keywordsPrompt, false, true);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!window.STMemoryBooks_toolResult) {
            throw new Error('AI did not call createMemory tool for keywords');
        }
        
        const result = window.STMemoryBooks_toolResult;
        delete window.STMemoryBooks_toolResult;
        
        const keywords = Array.isArray(result.keywords) ? result.keywords : [];
        
        if (keywords.length === 0) {
            throw new Error('AI generated no keywords');
        }
        
        console.log(`${MODULE_NAME}: AI generated ${keywords.length} keywords:`, keywords);
        return keywords;
        
    } catch (error) {
        console.error(`${MODULE_NAME}: AI keyword generation failed:`, error);
        // Fallback to ST generation if AI fails
        return generateFallbackKeys(
            compiledScene.messages.map(m => m.mes).join(' '), 
            compiledScene.metadata.characterName
        );
    }
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