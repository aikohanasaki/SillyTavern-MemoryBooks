import { chat, name1, name2 } from '../../../../script.js';
import { getContext } from '../../../extensions.js';
import { estimateTokens } from './utils.js';
import { t } from './i18n.js';

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
    
    // Validate input parameters
    if (sceneStart == null || sceneEnd == null) {
        throw new Error(t('chatcompile.errors.sceneMarkersRequired'));
    }

    if (sceneStart > sceneEnd) {
        throw new Error(t('chatcompile.errors.startGreaterThanEnd'));
    }

    if (sceneStart < 0 || sceneEnd >= chat.length) {
        throw new Error(t('chatcompile.errors.outOfBounds', '', { start: sceneStart, end: sceneEnd, max: chat.length - 1 }));
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
            mes: cleanMessageContent(message.mes),
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
        characterName: characterName || name2 || t('common.unknown', 'Unknown'),
        messageCount: sceneMessages.length,
        totalRequestedRange: sceneEnd - sceneStart + 1,
        hiddenMessagesSkipped: hiddenMessageCount,
        messagesSkipped: skippedMessageCount,
        compiledAt: new Date().toISOString(),
        totalChatLength: chat.length,
        userName: name1 || t('chatcompile.defaults.user', 'User')
    };
    
    const compiledScene = {
        metadata,
        messages: sceneMessages
    };
    
    // Validate that we have at least some visible messages
    if (sceneMessages.length === 0) {
        throw new Error(t('chatcompile.errors.noVisibleInRange', '', { start: sceneStart, end: sceneEnd }));
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
        characterName: context.name2 || name2 || t('common.unknown', 'Unknown')
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
        errors.push(t('chatcompile.validation.errors.missingMetadata'));
    }
    
    if (!compiledScene.messages || !Array.isArray(compiledScene.messages)) {
        errors.push(t('chatcompile.validation.errors.invalidMessagesArray'));
    }
    
    if (compiledScene.messages && compiledScene.messages.length === 0) {
        warnings.push(t('chatcompile.validation.warnings.noMessages'));
    }
    
    // Check message structure
    if (compiledScene.messages) {
        compiledScene.messages.forEach((message, index) => {
            if (!message.id && message.id !== 0) {
                warnings.push(t('chatcompile.validation.warnings.messageMissingId', '', { index }));
            }
            
            if (!message.name) {
                warnings.push(t('chatcompile.validation.warnings.messageMissingName', '', { index }));
            }
            
            if (!message.mes && message.mes !== '') {
                warnings.push(t('chatcompile.validation.warnings.messageMissingContent', '', { index }));
            }
        });
    }
    
    // Check for large scenes
    if (compiledScene.messages && compiledScene.messages.length > 100) {
        warnings.push(t('chatcompile.validation.warnings.veryLargeScene'));
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
    output.push(t('chatcompile.readable.headerMetadata', '=== SCENE METADATA ==='));
    output.push(t('chatcompile.readable.range', '', { start: metadata.sceneStart, end: metadata.sceneEnd }));
    output.push(t('chatcompile.readable.chat', '', { chatId: metadata.chatId }));
    output.push(t('chatcompile.readable.character', '', { name: metadata.characterName }));
    output.push(t('chatcompile.readable.compiled', '', { count: metadata.messageCount }));
    output.push(t('chatcompile.readable.compiledAt', '', { date: metadata.compiledAt }));
    output.push('');
    output.push(t('chatcompile.readable.headerMessages', '=== SCENE MESSAGES ==='));
    messages.forEach(message => {
        output.push(t('chatcompile.readable.line', `[${message.id}] ${message.name}: ${message.mes}`, { id: message.id, name: message.name, text: message.mes }));
    });
    
    return output.join('\n');
}

/**
 * Clean speaker name for consistency
 * @private
 */
function cleanSpeakerName(name) {
    if (!name) return t('common.unknown', 'Unknown');
    return name.trim() || t('common.unknown', 'Unknown');
}

/**
 * Clean message content
 * @private
 */
function cleanMessageContent(content) {
    if (!content) return '';
    return content.trim();
}
