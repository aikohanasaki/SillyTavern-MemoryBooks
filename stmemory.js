import { getContext } from '../../../extensions.js';
import { getTokenCount } from '../../../tokenizers.js';
import { getEffectivePrompt, getPresetNames, isValidPreset, deepClone } from './utils.js';
import { characters, this_chid, substituteParams, Generate } from '../../../../script.js';

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
 * Waits for character data to be available with retry mechanism
 * @private
 * @param {number} maxWaitMs - Maximum time to wait in milliseconds (default: 5000)
 * @param {number} checkIntervalMs - How often to check in milliseconds (default: 250)
 * @returns {Promise<boolean>} True if character data is available, false if timeout
 */
async function waitForCharacterData(maxWaitMs = 5000, checkIntervalMs = 250) {
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
        
        // 4. Generate memory using SillyTavern's Generate function with JSON output
        const response = await generateMemoryWithAI(promptString, profile);
        
        // 5. Process the structured JSON result 
        const processedMemory = processJsonResult(response, compiledScene);
        
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
                generationMethod: 'json-structured-output',
                version: '2.0'
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
        
        console.log(`${MODULE_NAME}: JSON-based memory creation completed successfully`);
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
 * Generates memory using AI with structured JSON output instead of tool calling.
 * This is much more reliable across different models and APIs.
 * 
 * @private
 * @param {string} promptString - The full prompt for the AI
 * @param {Object} profile - The user-selected profile containing connection settings
 * @returns {Promise<Object>} The structured memory result from JSON parsing
 * @throws {AIResponseError} If the AI generation fails or doesn't return valid JSON
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

    try {
        console.log(`${MODULE_NAME}: Starting JSON-based memory generation...`);

        // Temporarily override connection settings if profile specifies them
        const originalSettings = await applyProfileConnectionSettings(profile);
        
        try {
            // Use SillyTavern's standard Generate function
            const aiResponse = await Generate('quiet', { 
                quiet_prompt: promptString, 
                skipWIAN: true,  // Clean context without World Info, Author's Note, etc.
                stopping_strings: ['\n\n---', '\n\n```', '\n\nHuman:', '\n\nAssistant:'] // Stop at common delimiters
            });

            // Parse the JSON response
            const jsonResult = parseAIJsonResponse(aiResponse);
            
            return {
                content: jsonResult.content || jsonResult.summary || jsonResult.memory_content || '',
                title: jsonResult.title || 'Memory',
                keywords: jsonResult.keywords || [],
                profile: profile
            };

        } finally {
            // Always restore original settings
            await restoreConnectionSettings(originalSettings);
        }

    } catch (error) {
        console.error(`${MODULE_NAME}: JSON-based memory generation failed:`, error);
        
        if (error instanceof AIResponseError) {
            throw error;
        } else {
            throw new AIResponseError(`Memory generation failed: ${error.message || error}`);
        }
    }
}

/**
 * Applies profile connection settings temporarily if they exist
 * @private
 * @param {Object} profile - Profile with connection settings
 * @returns {Promise<Object>} Original settings to restore later
 */
async function applyProfileConnectionSettings(profile) {
    const originalSettings = {};
    
    if (!profile.effectiveConnection) {
        return originalSettings; // No settings to apply
    }
    
    try {
        // Store original values
        if (profile.effectiveConnection.model) {
            // This is a simplified approach - in a real implementation, you'd need to 
            // properly interface with SillyTavern's model selection system
            console.log(`${MODULE_NAME}: Would temporarily switch to model: ${profile.effectiveConnection.model}`);
        }
        
        if (typeof profile.effectiveConnection.temperature === 'number') {
            console.log(`${MODULE_NAME}: Would temporarily switch to temperature: ${profile.effectiveConnection.temperature}`);
        }
        
        // NOTE: Actual model/temperature switching would require deeper integration
        // with SillyTavern's settings system. For now, we log the intent.
        
    } catch (error) {
        console.warn(`${MODULE_NAME}: Failed to apply profile connection settings:`, error);
    }
    
    return originalSettings;
}

/**
 * Restores original connection settings
 * @private
 * @param {Object} originalSettings - Settings to restore
 */
async function restoreConnectionSettings(originalSettings) {
    try {
        // Restore any changed settings
        console.log(`${MODULE_NAME}: Connection settings restored`);
    } catch (error) {
        console.warn(`${MODULE_NAME}: Failed to restore connection settings:`, error);
    }
}

/**
 * Parses AI response as JSON with robust error handling
 * @private
 * @param {string} aiResponse - Raw AI response text
 * @returns {Object} Parsed JSON object
 * @throws {AIResponseError} If JSON parsing fails
 */
function parseAIJsonResponse(aiResponse) {
    if (!aiResponse || typeof aiResponse !== 'string') {
        throw new AIResponseError('AI response is empty or invalid');
    }
    
    // Clean up the response - remove common wrapper text
    let cleanResponse = aiResponse.trim();
    
    // Remove common prefixes that models sometimes add
    const prefixesToRemove = [
        'Here is the JSON response:',
        'Here is the memory:',
        'Here\'s the JSON:',
        'JSON:',
        '```json',
        '```'
    ];
    
    for (const prefix of prefixesToRemove) {
        if (cleanResponse.startsWith(prefix)) {
            cleanResponse = cleanResponse.substring(prefix.length).trim();
        }
    }
    
    // Remove closing code blocks
    if (cleanResponse.endsWith('```')) {
        cleanResponse = cleanResponse.substring(0, cleanResponse.length - 3).trim();
    }
    
    // Try to find JSON within the response if it's wrapped in other text
    const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        cleanResponse = jsonMatch[0];
    }
    
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
        console.error(`${MODULE_NAME}: Failed to parse AI JSON response:`, parseError);
        console.error(`${MODULE_NAME}: Original response:`, aiResponse);
        console.error(`${MODULE_NAME}: Cleaned response:`, cleanResponse);
        
        throw new AIResponseError(
            `AI did not return valid JSON. This may indicate the model doesn't support structured output well. ` +
            `Parse error: ${parseError.message}`
        );
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