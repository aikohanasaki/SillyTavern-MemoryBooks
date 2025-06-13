import { chat, name1, name2 } from '../../../../script.js';
import { getContext } from '../../../extensions.js';

const MODULE_NAME = 'STMemoryBooks-ChatCompile';
const CHARS_PER_TOKEN = 4; // Rough estimation for token counting

/**
 * Compile chat messages between scene markers into structured format
 * @param {Object} sceneRequest - Scene compilation request
 * @param {number} sceneRequest.sceneStart - Start message ID
 * @param {number} sceneRequest.sceneEnd - End message ID  
 * @param {string} sceneRequest.chatId - Current chat ID
 * @param {string} sceneRequest.characterName - Character name
 * @returns {Object} Compiled scene data
 */
export function compileScene(sceneRequest) {
    const { sceneStart, sceneEnd, chatId, characterName } = sceneRequest;
    
    console.log(`${MODULE_NAME}: Starting compilation for scene ${sceneStart}-${sceneEnd}`);
    
    // Validate input parameters
    if (sceneStart == null || sceneEnd == null) {
        throw new Error('Scene markers are required for compilation');
    }
    
    if (sceneStart >= sceneEnd) {
        throw new Error('Start marker must be less than end marker');
    }
    
    if (sceneStart < 0 || sceneEnd >= chat.length) {
        throw new Error(`Scene markers (${sceneStart}-${sceneEnd}) are out of chat bounds (0-${chat.length - 1})`);
    }
    
    // Extract and format messages in range
    const sceneMessages = [];
    let hiddenMessageCount = 0;
    let skippedMessageCount = 0;
    
    for (let i = sceneStart; i <= sceneEnd; i++) {
        const message = chat[i];
        
        // Handle missing messages gracefully
        if (!message) {
            console.warn(`${MODULE_NAME}: Missing message at index ${i}`);
            skippedMessageCount++;
            continue;
        }
        
        // Skip hidden messages - marked with is_system: true
        if (message.is_system) {
            console.log(`${MODULE_NAME}: Skipping hidden message at index ${i}`);
            hiddenMessageCount++;
            continue;
        }
        
        // Create clean message object following JSONL structure
        const compiledMessage = {
            id: i,
            name: cleanSpeakerName(message.name),
            mes: cleanMessageContent(message.mes),
            send_date: message.send_date || new Date().toISOString()
        };
        
        // Add optional user indicator if available
        if (message.is_user !== undefined) {
            compiledMessage.is_user = message.is_user;
        }
        
        sceneMessages.push(compiledMessage);
    }
    
    // Create comprehensive metadata
    const metadata = {
        sceneStart,
        sceneEnd,
        chatId: chatId || 'unknown',
        characterName: characterName || name2 || 'Unknown',
        messageCount: sceneMessages.length,
        totalRequestedRange: sceneEnd - sceneStart + 1,
        hiddenMessagesSkipped: hiddenMessageCount,
        messagesSkipped: skippedMessageCount,
        compiledAt: new Date().toISOString(),
        totalChatLength: chat.length,
        userName: name1 || 'User'
    };
    
    const compiledScene = {
        metadata,
        messages: sceneMessages
    };
    
    console.log(`${MODULE_NAME}: Compiled ${sceneMessages.length} messages (skipped ${hiddenMessageCount} hidden messages, ${skippedMessageCount} missing messages)`);
    
    // Validate that we have at least some visible messages
    if (sceneMessages.length === 0) {
        throw new Error(`No visible messages found in range ${sceneStart}-${sceneEnd}. All messages may be hidden or missing.`);
    }
    
    return compiledScene;
}

/**
 * Create scene request object from current context
 * @param {number} sceneStart - Start message ID
 * @param {number} sceneEnd - End message ID
 * @returns {Object} Scene request object
 */
export function createSceneRequest(sceneStart, sceneEnd) {
    const context = getContext();
    
    const sceneRequest = {
        sceneStart,
        sceneEnd,
        chatId: context.chatId || 'unknown',
        characterName: context.name2 || name2 || 'Unknown'
    };
    
    console.log(`${MODULE_NAME}: Created scene request:`, sceneRequest);
    return sceneRequest;
}

/**
 * Estimate token count for compiled scene
 * @param {Object} compiledScene - Compiled scene data
 * @returns {number} Estimated token count
 */
export function estimateTokenCount(compiledScene) {
    let totalChars = 0;
    
    // Count metadata as JSON string
    totalChars += JSON.stringify(compiledScene.metadata).length;
    
    // Count all message content
    for (const message of compiledScene.messages) {
        totalChars += (message.mes || '').length;
        totalChars += (message.name || '').length;
        // Add overhead for JSON structure
        totalChars += 50; // Approximate overhead per message
    }
    
    const estimatedTokens = Math.ceil(totalChars / CHARS_PER_TOKEN);
    console.log(`${MODULE_NAME}: Estimated ${estimatedTokens} tokens for ${compiledScene.messages.length} messages`);
    
    return estimatedTokens;
}

/**
 * Get scene statistics for display purposes
 * @param {Object} compiledScene - Compiled scene data
 * @returns {Object} Scene statistics
 */
export function getSceneStats(compiledScene) {
    const { metadata, messages } = compiledScene;
    
    // Count speakers
    const speakers = new Set();
    let totalMessageLength = 0;
    let userMessages = 0;
    let characterMessages = 0;
    
    messages.forEach(message => {
        speakers.add(message.name);
        totalMessageLength += (message.mes || '').length;
        
        if (message.is_user) {
            userMessages++;
        } else {
            characterMessages++;
        }
    });
    
    return {
        messageCount: messages.length,
        speakerCount: speakers.size,
        speakers: Array.from(speakers),
        totalCharacters: totalMessageLength,
        estimatedTokens: estimateTokenCount(compiledScene),
        userMessages,
        characterMessages,
        timeSpan: {
            start: messages[0]?.send_date,
            end: messages[messages.length - 1]?.send_date
        }
    };
}

/**
 * Validate compiled scene data
 * @param {Object} compiledScene - Compiled scene data
 * @returns {Object} Validation result
 */
export function validateCompiledScene(compiledScene) {
    const errors = [];
    const warnings = [];
    
    // Check basic structure
    if (!compiledScene.metadata) {
        errors.push('Missing metadata object');
    }
    
    if (!compiledScene.messages || !Array.isArray(compiledScene.messages)) {
        errors.push('Missing or invalid messages array');
    }
    
    if (compiledScene.messages && compiledScene.messages.length === 0) {
        warnings.push('No messages in compiled scene');
    }
    
    // Check message structure
    if (compiledScene.messages) {
        compiledScene.messages.forEach((message, index) => {
            if (!message.id && message.id !== 0) {
                warnings.push(`Message at index ${index} missing ID`);
            }
            
            if (!message.name) {
                warnings.push(`Message at index ${index} missing speaker name`);
            }
            
            if (!message.mes && message.mes !== '') {
                warnings.push(`Message at index ${index} missing content`);
            }
        });
    }
    
    // Check for large scenes
    if (compiledScene.messages && compiledScene.messages.length > 100) {
        warnings.push('Very large scene (>100 messages) - consider breaking into smaller segments');
    }
    
    const isValid = errors.length === 0;
    
    if (!isValid) {
        console.error(`${MODULE_NAME}: Validation failed:`, errors);
    }
    
    if (warnings.length > 0) {
        console.warn(`${MODULE_NAME}: Validation warnings:`, warnings);
    }
    
    return {
        valid: isValid,
        errors,
        warnings
    };
}

/**
 * Convert compiled scene to a readable text format for debugging
 * @param {Object} compiledScene - Compiled scene data
 * @returns {string} Human-readable scene text
 */
export function toReadableText(compiledScene) {
    const { metadata, messages } = compiledScene;
    
    let output = [];
    
    // Add metadata header
    output.push('=== SCENE METADATA ===');
    output.push(`Range: Messages ${metadata.sceneStart}-${metadata.sceneEnd}`);
    output.push(`Chat: ${metadata.chatId}`);
    output.push(`Character: ${metadata.characterName}`);
    output.push(`Compiled: ${metadata.messageCount} messages`);
    output.push(`Compiled at: ${metadata.compiledAt}`);
    output.push('');
    
    // Add messages
    output.push('=== SCENE MESSAGES ===');
    messages.forEach(message => {
        output.push(`[${message.id}] ${message.name}: ${message.mes}`);
    });
    
    return output.join('\n');
}

/**
 * Clean speaker name for consistency
 * @private
 */
function cleanSpeakerName(name) {
    if (!name) return 'Unknown';
    return name.trim() || 'Unknown';
}

/**
 * Clean message content
 * @private
 */
function cleanMessageContent(content) {
    if (!content) return '';
    return content.trim();
}