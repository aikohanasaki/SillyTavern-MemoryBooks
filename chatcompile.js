import { chat, name1, name2 } from '../../../../script.js';
import { getContext } from '../../../extensions.js';
import { estimateTokens } from './utils.js';
import { t as __st_t_tag, translate } from '../../../i18n.js';

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
    
    // Validate input parameters
    if (sceneStart == null || sceneEnd == null) {
        throw new Error(translate('Scene markers are required', 'chatcompile.errors.sceneMarkersRequired'));
    }

    if (sceneStart > sceneEnd) {
        throw new Error(translate('Start message cannot be greater than end message', 'chatcompile.errors.startGreaterThanEnd'));
    }

    if (sceneStart < 0 || sceneEnd >= chat.length) {
        throw new Error(__st_t_tag`Message IDs out of bounds: ${sceneStart}-${sceneEnd} (0-${chat.length - 1})`);
    }
    
    // Extract and format messages in range
    const sceneMessages = [];
    let hiddenMessageCount = 0;
    let skippedMessageCount = 0;
    
    for (let i = sceneStart; i <= sceneEnd; i++) {
        const message = chat[i];
        
        // Handle missing messages gracefully
        if (!message) {
            skippedMessageCount++;
            continue;
        }
        
        // Skip hidden messages - marked with is_system: true
        if (message.is_system) {
            hiddenMessageCount++;
            continue;
        }
        
        // Create clean message object following JSONL structure
        const compiledMessage = {
            id: i,
            name: cleanSpeakerName(message.name),
            mes: cleanMessageContent(message.mes, message.is_user),
            send_date: message.send_date || new Date().toISOString()
        };
        
        // Add optional user indicator if available
        if (message.is_user !== undefined) {
            compiledMessage.is_user = message.is_user;
        }
        
        sceneMessages.push(compiledMessage);
    }
    
    // Create metadata
    const metadata = {
        sceneStart,
        sceneEnd,
        chatId: chatId || 'unknown',
        characterName: characterName || name2 || translate('Unknown', 'common.unknown'),
        messageCount: sceneMessages.length,
        totalRequestedRange: sceneEnd - sceneStart + 1,
        hiddenMessagesSkipped: hiddenMessageCount,
        messagesSkipped: skippedMessageCount,
        compiledAt: new Date().toISOString(),
        totalChatLength: chat.length,
        userName: name1 || translate('User', 'chatcompile.defaults.user')
    };
    
    const compiledScene = {
        metadata,
        messages: sceneMessages
    };
    
    // Validate that we have at least some visible messages
    if (sceneMessages.length === 0) {
        throw new Error(__st_t_tag`No visible messages in range ${sceneStart}-${sceneEnd}`);
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
        characterName: context.name2 || name2 || translate('Unknown', 'common.unknown')
    };
    
    return sceneRequest;
}

/**
 * Estimate token count for compiled scene
 * @param {Object} compiledScene - Compiled scene data
 * @returns {number} Estimated token count
 */
export async function estimateTokenCount(compiledScene) {
    // Use the same canonical estimator (char/4) over the readable scene text
    // and do not include output tokens for UI stats.
    const text = toReadableText(compiledScene);
    const { input } = await estimateTokens(text, { estimatedOutput: 0 });
    return input;
}

/**
 * Get scene statistics for display purposes
 * @param {Object} compiledScene - Compiled scene data
 * @returns {Object} Scene statistics
 */
export async function getSceneStats(compiledScene) {
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
        estimatedTokens: await estimateTokenCount(compiledScene),
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
        errors.push(translate('Missing metadata', 'chatcompile.validation.errors.missingMetadata'));
    }
    
    if (!compiledScene.messages || !Array.isArray(compiledScene.messages)) {
        errors.push(translate('Invalid messages array', 'chatcompile.validation.errors.invalidMessagesArray'));
    }
    
    if (compiledScene.messages && compiledScene.messages.length === 0) {
        warnings.push(translate('No messages', 'chatcompile.validation.warnings.noMessages'));
    }
    
    // Check message structure
    if (compiledScene.messages) {
        compiledScene.messages.forEach((message, index) => {
            if (!message.id && message.id !== 0) {
                warnings.push(__st_t_tag`Message at index ${index} missing id`);
            }
            
            if (!message.name) {
                warnings.push(__st_t_tag`Message at index ${index} missing name`);
            }
            
            if (!message.mes && message.mes !== '') {
                warnings.push(__st_t_tag`Message at index ${index} missing content`);
            }
        });
    }
    
    // Check for large scenes
    if (compiledScene.messages && compiledScene.messages.length > 100) {
        warnings.push(translate('Very large scene', 'chatcompile.validation.warnings.veryLargeScene'));
    }
    
    const isValid = errors.length === 0;
    
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
    output.push(translate('=== SCENE METADATA ===', 'chatcompile.readable.headerMetadata'));
    output.push(__st_t_tag`Range: ${metadata.sceneStart}-${metadata.sceneEnd}`);
    output.push(__st_t_tag`Chat: ${metadata.chatId}`);
    output.push(__st_t_tag`Character: ${metadata.characterName}`);
    output.push(__st_t_tag`Compiled: ${metadata.messageCount}`);
    output.push(__st_t_tag`Compiled at: ${metadata.compiledAt}`);
    output.push('');
    output.push(translate('=== SCENE MESSAGES ===', 'chatcompile.readable.headerMessages'));
    messages.forEach(message => {
        output.push(__st_t_tag`[${message.id}] ${message.name}: ${message.mes}`);
    });
    
    return output.join('\n');
}

/**
 * Clean speaker name for consistency
 * @private
 */
function cleanSpeakerName(name) {
    if (!name) return translate('Unknown', 'common.unknown');
    return name.trim() || translate('Unknown', 'common.unknown');
}

/**
 * Clean message content
 * @private
 */
function cleanMessageContent(content, isUser = false) {
    if (!content) return '';
    try {
        // Normalize line endings for consistent behavior; do not run Regex engine here.
        const normalized = String(content).replace(/\r\n/g, '\n');
        return normalized.trim();
    } catch (e) {
        return String(content).trim();
    }
}
