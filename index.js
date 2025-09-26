import { eventSource, event_types, chat, chat_metadata, saveSettingsDebounced, characters, this_chid, name1, name2 } from '../../../../script.js';
import { Popup, POPUP_TYPE, POPUP_RESULT } from '../../../popup.js';
import { extension_settings, saveMetadataDebounced } from '../../../extensions.js';
import { SlashCommandParser } from '../../../slash-commands/SlashCommandParser.js';
import { SlashCommand } from '../../../slash-commands/SlashCommand.js';
import { ARGUMENT_TYPE, SlashCommandArgument } from '../../../slash-commands/SlashCommandArgument.js';
import { executeSlashCommands } from '../../../slash-commands.js';
import { METADATA_KEY, world_names, loadWorldInfo } from '../../../world-info.js';
import { lodash, Handlebars, DOMPurify } from '../../../../lib.js';
import { compileScene, createSceneRequest, validateCompiledScene, getSceneStats } from './chatcompile.js';
import { createMemory } from './stmemory.js';
import { addMemoryToLorebook, getDefaultTitleFormats, identifyMemoryEntries, getRangeFromMemoryEntry } from './addlore.js';
import { editProfile, newProfile, deleteProfile, exportProfiles, importProfiles, validateAndFixProfiles } from './profileManager.js';
import { getSceneMarkers, setSceneMarker, clearScene, updateAllButtonStates, updateNewMessageButtonStates, validateSceneMarkers, handleMessageDeletion, createSceneButtons, getSceneData, updateSceneStateCache, getCurrentSceneState, saveMetadataForCurrentContext } from './sceneManager.js';
import { settingsTemplate } from './templates.js';
import { showConfirmationPopup, fetchPreviousSummaries, showMemoryPreviewPopup } from './confirmationPopup.js';
import { getEffectivePrompt, DEFAULT_PROMPT, deepClone, getCurrentModelSettings, getCurrentApiInfo, SELECTORS, getCurrentMemoryBooksContext, getEffectiveLorebookName, showLorebookSelectionPopup } from './utils.js';
import { editGroup } from '../../../group-chats.js';
export { currentProfile, validateLorebook };

const MODULE_NAME = 'STMemoryBooks';
let hasBeenInitialized = false; 

// Supported Chat Completion sources
const SUPPORTED_COMPLETION_SOURCES = [
    'openai', 'claude', 'openrouter', 'ai21', 'makersuite', 'vertexai',
    'mistralai', 'custom', 'cohere', 'perplexity', 'groq', 'nanogpt',
    'deepseek', 'electronhub', 'aimlapi', 'xai', 'pollinations',
    'moonshot', 'fireworks', 'cometapi', 'azure_openai'
];


const defaultSettings = {
    moduleSettings: {
        alwaysUseDefault: true,
        showMemoryPreviews: false,
        showNotifications: true,
        refreshEditor: true,
        tokenWarningThreshold: 30000,
        defaultMemoryCount: 0,
        autoClearSceneAfterMemory: false,
        manualModeEnabled: false,
        allowSceneOverlap: false,
        autoHideMode: 'none',
        unhiddenEntriesCount: 0,
        autoSummaryEnabled: false,
        autoSummaryInterval: 100,
    },
    titleFormat: '[000] - {{title}}',
    profiles: [], // Will be populated dynamically with current ST settings
    defaultProfile: 0,
    migrationVersion: 4,
}

// Current state variables
let currentPopupInstance = null;
let isProcessingMemory = false;
let currentProfile = null;

// Settings cache for restoration
let cachedSettings = null;
let isExtensionEnabled = false;


// MutationObserver for chat message monitoring
let chatObserver = null;
let updateTimeout = null;

/**
 * Process messages and return processed elements
 * @param {Node} node The DOM node to process.
 * @returns {Array} Array of message elements that had buttons added
 */
function processNodeForMessages(node) {
    const processedMessages = [];

    // If the node itself is a message element
    if (node.matches && node.matches('#chat .mes[mesid]')) {
        if (!node.querySelector('.mes_stmb_start')) {
            createSceneButtons(node);
            processedMessages.push(node);
        }
    } 
    // Find any message elements within the added node
    else if (node.querySelectorAll) {
        const newMessages = node.querySelectorAll('#chat .mes[mesid]');
        newMessages.forEach(mes => {
            if (!mes.querySelector('.mes_stmb_start')) {
                createSceneButtons(mes);
                processedMessages.push(mes);
            }
        });
    }

    return processedMessages;
}

/**
 * Chat observer with partial updates
 */
function initializeChatObserver() {
    // Clean up existing observer if any
    if (chatObserver) {
        chatObserver.disconnect();
        chatObserver = null;
    }

    const chatContainer = document.getElementById('chat');
    if (!chatContainer) {
        throw new Error('STMemoryBooks: Chat container not found. SillyTavern DOM structure may have changed.');
    }

    // Ensure scene state is initialized before starting observer
    const sceneState = getCurrentSceneState();
    if (!sceneState || (sceneState.start === null && sceneState.end === null)) {
        updateSceneStateCache();
    }

    chatObserver = new MutationObserver((mutations) => {
        const newlyProcessedMessages = [];
        
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    try {
                        // Collect all newly processed messages
                        const processed = processNodeForMessages(node);
                        newlyProcessedMessages.push(...processed);
                    } catch (error) {
                        console.error('STMemoryBooks: Error processing new chat elements:', error);
                    }
                }
            }
        }

        if (newlyProcessedMessages.length > 0) {
            // Debounce the state update to prevent excessive calls
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => {
                try {
                    // Use partial update for new messages only
                    updateNewMessageButtonStates(newlyProcessedMessages);
                } catch (error) {
                    console.error('STMemoryBooks: Error updating button states:', error);
                }
            }, 50);
        }
    });

    // Start observing the chat container
    chatObserver.observe(chatContainer, {
        childList: true,
        subtree: true 
    });

    console.log('STMemoryBooks: Performance-optimized chat observer initialized');
}

/**
 * Clean up chat observer
 */
function cleanupChatObserver() {
    if (chatObserver) {
        chatObserver.disconnect();
        chatObserver = null;
        console.log('STMemoryBooks: Chat observer disconnected');
    }
    
    if (updateTimeout) {
        clearTimeout(updateTimeout);
        updateTimeout = null;
    }
}

function handleChatChanged() {
    console.log('STMemoryBooks: Chat changed - updating scene state');
    updateSceneStateCache();
    
    setTimeout(() => {
        try {
            // Full update needed for chat changes
            processExistingMessages();
        } catch (error) {
            console.error('STMemoryBooks: Error processing messages after chat change:', error);
        }
    }, 50);
}

/**
 * Validate and clean up orphaned scene markers
 */
function validateAndCleanupSceneMarkers() {
    const stmbData = getSceneMarkers() || {};
    const { sceneStart, sceneEnd } = stmbData;

    // Check if we have orphaned scene markers (scene markers without active memory creation)
    if (sceneStart !== null || sceneEnd !== null) {
        console.log(`STMemoryBooks: Found orphaned scene markers on chat load (start: ${sceneStart}, end: ${sceneEnd})`);

        // Check if memory creation is actually in progress
        if (!isProcessingMemory && extension_settings[MODULE_NAME].moduleSettings.autoSummaryEnabled) {
            clearScene();
        }
    }
}

/**
 * Chat loaded handler with conversion logging
 */
function handleChatLoaded() {
    console.log(`${MODULE_NAME}: === CHAT LOADED EVENT ===`);
    console.log(`${MODULE_NAME}: Chat loaded event received, processing messages.`);
    console.log(`${MODULE_NAME}: Current chat metadata:`, chat_metadata);
    console.log(`${MODULE_NAME}: METADATA_KEY value:`, METADATA_KEY);
    console.log(`${MODULE_NAME}: Lorebook from metadata:`, chat_metadata[METADATA_KEY]);

    updateSceneStateCache();
    validateAndCleanupSceneMarkers();
    processExistingMessages();
}

async function handleMessageReceived() {
    try {
        setTimeout(validateSceneMarkers, 500);

        const context = getCurrentMemoryBooksContext();

        // Only check auto-summary for single character chats on MESSAGE_RECEIVED
        // Group chats will be handled by GROUP_WRAPPER_FINISHED event
        if (!context.isGroupChat && extension_settings.STMemoryBooks.moduleSettings.autoSummaryEnabled) {
            const currentMessageCount = chat.length;
            console.log(`STMemoryBooks: Message received (single chat) - auto-summary enabled, current count: ${currentMessageCount}`);

            await checkAutoSummaryTrigger();
        } else if (context.isGroupChat) {
            console.log('STMemoryBooks: Message received in group chat - waiting for GROUP_WRAPPER_FINISHED');
        } else {
            console.log('STMemoryBooks: Message received but auto-summary is disabled');
        }
    } catch (error) {
        console.error('STMemoryBooks: Error in handleMessageReceived:', error);
    }
}

async function handleGroupWrapperFinished() {
    try {
        setTimeout(validateSceneMarkers, 500);

        if (extension_settings.STMemoryBooks.moduleSettings.autoSummaryEnabled) {
            const currentMessageCount = chat.length;
            console.log(`STMemoryBooks: Group conversation finished - auto-summary enabled, current count: ${currentMessageCount}`);

            // Check auto-summary trigger after all group members have finished speaking
            await checkAutoSummaryTrigger();
        } else {
            console.log('STMemoryBooks: Group conversation finished but auto-summary is disabled');
        }
    } catch (error) {
        console.error('STMemoryBooks: Error in handleGroupWrapperFinished:', error);
    }
}

/**
 * Debug function to manually check auto-summary status
 * Call this from browser console: window.STMemoryBooks_debugAutoSummary()
 */
window.STMemoryBooks_debugAutoSummary = function() {
    const settings = extension_settings.STMemoryBooks;
    const stmbData = getSceneMarkers() || {};
    const currentMessageCount = chat.length;
    const currentLastMessage = currentMessageCount - 1;
    const requiredInterval = settings.moduleSettings.autoSummaryInterval;
    const highestProcessed = stmbData.highestMemoryProcessed ?? null;

    console.log('=== STMemoryBooks Auto-Summary Debug ===');
    console.log('Auto-summary enabled:', settings.moduleSettings.autoSummaryEnabled);
    console.log('Current message count:', currentMessageCount);
    console.log('Current last message index:', currentLastMessage);
    console.log('Required interval:', requiredInterval);
    console.log('Highest processed:', highestProcessed);
    console.log('Scene markers:', { start: stmbData.sceneStart, end: stmbData.sceneEnd });
    console.log('Processing memory flag:', isProcessingMemory);

    if (highestProcessed !== null) {
        const messagesSince = currentLastMessage - highestProcessed;
        console.log('Messages since last memory:', messagesSince);
        console.log('Should trigger:', messagesSince >= requiredInterval);
    } else {
        console.log('No previous memories - total messages:', currentMessageCount);
        console.log('Should trigger:', currentMessageCount >= requiredInterval);
    }

    console.log('Chat metadata STMemoryBooks:', chat_metadata?.STMemoryBooks);
    console.log('Chat bound lorebook:', chat_metadata?.[METADATA_KEY]);
    console.log('Available world_names:', world_names);
    console.log('Manual mode enabled:', settings.moduleSettings.manualModeEnabled);
    console.log('=========================================');

    // Manually trigger check
    console.log('Manually triggering auto-summary check...');
    checkAutoSummaryTrigger();
};

/**
 * Check if auto-summary should be triggered based on message difference
 */
async function checkAutoSummaryTrigger() {
    const currentMessageCount = chat.length;
    const currentLastMessage = currentMessageCount - 1;
    const requiredInterval = extension_settings.STMemoryBooks.moduleSettings.autoSummaryInterval;

    console.log(`STMemoryBooks: Auto-summary check - current message count: ${currentMessageCount}, interval: ${requiredInterval}`);

    // Check if user has postponed auto-summary
    const stmbData = getSceneMarkers() || {};
    if (stmbData.autoSummaryNextPromptAt && currentMessageCount < stmbData.autoSummaryNextPromptAt) {
        console.log(`STMemoryBooks: Auto-summary postponed until message ${stmbData.autoSummaryNextPromptAt}`);
        return; // Still in postpone period
    }

    // Auto-summary will set new scene markers - no need to clear existing ones

    const lorebookValidation = await validateLorebookForAutoSummary();
    if (!lorebookValidation.valid) {
        console.log(`STMemoryBooks: Auto-summary blocked - lorebook validation failed: ${lorebookValidation.error}`);
        return; // No lorebook available or user cancelled
    }

    // Clear any postpone flag since we're proceeding with auto-summary
    if (stmbData.autoSummaryNextPromptAt) {
        delete stmbData.autoSummaryNextPromptAt;
        saveMetadataForCurrentContext();
        console.log('STMemoryBooks: Cleared auto-summary postpone flag');
    }

    // Use the highestMemoryProcessed field for more efficient tracking
    const highestProcessed = stmbData.highestMemoryProcessed ?? null;
    console.log(`STMemoryBooks: Highest memory processed: ${highestProcessed}, current last message: ${currentLastMessage}`);

    let messagesSinceLastMemory;

    if (highestProcessed === null) {
        // No memories processed yet - check if we have enough messages for the first memory
        messagesSinceLastMemory = currentLastMessage + 1; // +1 because message indices are 0-based
        console.log(`STMemoryBooks: No previous memories found, total messages available: ${messagesSinceLastMemory}`);
    } else {
        // Calculate messages since the highest processed message
        messagesSinceLastMemory = currentLastMessage - highestProcessed;
        console.log(`STMemoryBooks: Messages since last memory: ${messagesSinceLastMemory} (${currentLastMessage} - ${highestProcessed})`);
    }

    console.log(`STMemoryBooks: Auto-summary decision - need ${requiredInterval} messages, have ${messagesSinceLastMemory}`);

    if (messagesSinceLastMemory >= requiredInterval) {
        // Check if memory creation is already in progress
        if (isProcessingMemory) {
            console.log('STMemoryBooks: Auto-summary blocked - memory creation already in progress');
            return;
        }

        console.log(`STMemoryBooks: Auto-summary triggered! (${messagesSinceLastMemory} >= ${requiredInterval})`);

        // Set processing flag to prevent concurrent execution
        isProcessingMemory = true;

        // Wait a moment for any ongoing message processing to complete
        setTimeout(async () => {
            try {
                if (highestProcessed === null) {
                    // First memory - create from beginning of chat to current message
                    const startMessage = 0;
                    const endMessage = currentLastMessage;
                    const rangeString = `${startMessage}-${endMessage}`;

                    console.log(`STMemoryBooks: Auto-creating first memory for range: ${rangeString}`);
                    await handleSceneMemoryCommand({}, rangeString);
                } else {
                    // Subsequent memories - use existing nextmemory logic
                    console.log(`STMemoryBooks: Auto-creating next memory from message ${highestProcessed + 1}`);
                    await handleNextMemoryCommand({}, '');
                }
            } catch (error) {
                console.error('STMemoryBooks: Auto-summary execution failed:', error);
                toastr.warning(`Auto-summary failed: ${error.message}`, 'STMemoryBooks');
            } finally {
                // Always clear the processing flag
                isProcessingMemory = false;
            }
        }, 1000);
    } else {
        console.log(`STMemoryBooks: Auto-summary not triggered - need ${requiredInterval - messagesSinceLastMemory} more messages`);
    }
}

/**
 * Slash command handlers
 */
function handleCreateMemoryCommand(namedArgs, unnamedArgs) {
    const sceneData = getSceneData();
    if (!sceneData) {
        console.error('STMemoryBooks: No scene markers set for createMemory command');
        toastr.error('No scene markers set. Use chevron buttons to mark start and end points first.', 'STMemoryBooks');
        return ''; 
    }
    
    initiateMemoryCreation();
    return ''; 
}


function handleSceneMemoryCommand(namedArgs, unnamedArgs) {
    const range = String(unnamedArgs || '').trim();
    
    if (!range) {
        toastr.error('Missing range argument. Use: /scenememory X-Y (e.g., /scenememory 10-15)', 'STMemoryBooks');
        return '';
    }
   
    const match = range.match(/^(\d+)\s*[-–—]\s*(\d+)$/);
    
    if (!match) {
        toastr.error('Invalid format. Use: /scenememory X-Y (e.g., /scenememory 10-15)', 'STMemoryBooks');
        return '';
    }
    
    const startId = parseInt(match[1]);
    const endId = parseInt(match[2]);
    
    // Validate range logic (start = end is valid for single message)
    if (startId > endId) {
        toastr.error('Start message cannot be greater than end message', 'STMemoryBooks');
        return '';
    }
    
    // IMPORTANT: Use the global chat array for validation to match compileScene()
    const activeChat = chat;

    // Validate message IDs exist in current chat
    if (startId < 0 || endId >= activeChat.length) {
        toastr.error(`Message IDs out of range. Valid range: 0-${activeChat.length - 1}`, 'STMemoryBooks');
        return '';
    }
    
    // check if messages actually exist
    if (!activeChat[startId] || !activeChat[endId]) {
        toastr.error('One or more specified messages do not exist', 'STMemoryBooks');
        return '';
    }
    
    // Set new scene markers (automatically overrides any existing markers)
    setSceneMarker(startId, 'start');
    setSceneMarker(endId, 'end');
    
    const context = getCurrentMemoryBooksContext();
    const contextMsg = context.isGroupChat ? ` in group "${context.groupName}"` : '';
    toastr.info(`Scene set: messages ${startId}-${endId}${contextMsg}`, 'STMemoryBooks');
    
    setTimeout(() => initiateMemoryCreation(), 500);

    return '';
}

async function handleNextMemoryCommand(namedArgs, unnamedArgs) {
    try {
        // Validate lorebook exists
        const lorebookValidation = await validateLorebook();
        if (!lorebookValidation.valid) {
            toastr.error('No lorebook available: ' + lorebookValidation.error, 'STMemoryBooks');
            return '';
        }
        
        // Get all memory entries
        const allMemories = identifyMemoryEntries(lorebookValidation.data);
        
        if (allMemories.length === 0) {
            toastr.error('No memory entries found in lorebook', 'STMemoryBooks');
            return '';
        }
        
        // Find the most recent memory (highest end message number)
        let mostRecentMemory = null;
        let highestEndMessage = -1;
        
        for (const memory of allMemories) {
            const range = getRangeFromMemoryEntry(memory.entry);
            if (range && range.end !== null && range.end > highestEndMessage) {
                highestEndMessage = range.end;
                mostRecentMemory = memory;
            }
        }
        
        if (!mostRecentMemory) {
            toastr.error('No memory entries with valid message ranges found', 'STMemoryBooks');
            return '';
        }
        
        // Calculate next memory start (last memory end + 1)
        const nextStart = highestEndMessage + 1;
        
        // Use current last message as end
        const activeChat = chat;
        const nextEnd = activeChat.length - 1;
        
        // Validate the range
        if (nextStart >= activeChat.length) {
            toastr.error('No new messages since last memory', 'STMemoryBooks');
            return '';
        }
        
        if (nextStart > nextEnd) {
            toastr.error('Not enough messages for a new memory', 'STMemoryBooks');
            return '';
        }
        
        // Execute scenememory with the calculated range
        const rangeString = `${nextStart}-${nextEnd}`;
        toastr.info(`Auto-detected next memory range: ${rangeString}`, 'STMemoryBooks');
        
        // Use the scenememory handler directly
        return handleSceneMemoryCommand({}, rangeString);
        
    } catch (error) {
        console.error('STMemoryBooks: Error in /nextmemory command:', error);
        toastr.error(`Failed to determine next memory range: ${error.message}`, 'STMemoryBooks');
        return '';
    }
}

/**
 * Check API compatibility using SillyTavern's built-in functions
 */
function checkApiCompatibility() {
    let isCompatible = false;

    try {
        if (typeof window.getGeneratingApi === 'function') {
            const currentApi = window.getGeneratingApi();
            isCompatible = window.main_api === 'openai' && SUPPORTED_COMPLETION_SOURCES.includes(currentApi);
        } else {
            const mainApi = $(SELECTORS.mainApi).val();
            const completionSource = $(SELECTORS.completionSource).val();
            isCompatible = mainApi === 'openai' && SUPPORTED_COMPLETION_SOURCES.includes(completionSource);
        }
    } catch (e) {
        console.warn(`${MODULE_NAME}: Error checking API compatibility:`, e);
        const mainApi = $(SELECTORS.mainApi).val();
        const completionSource = $(SELECTORS.completionSource).val();
        isCompatible = mainApi === 'openai' && SUPPORTED_COMPLETION_SOURCES.includes(completionSource);
    }

    if (isCompatible !== isExtensionEnabled) {
        isExtensionEnabled = isCompatible;
        console.log(`${MODULE_NAME}: Extension ${isCompatible ? 'enabled' : 'disabled'} for current API`);
    }

    return isCompatible;
}

/**
 * Initialize and validate extension settings
 */
function initializeSettings() {
    extension_settings.STMemoryBooks = extension_settings.STMemoryBooks || deepClone(defaultSettings);

    // Migration logic for versions 3-4: Add dynamic profile and clean up titleFormat
    const currentVersion = extension_settings.STMemoryBooks.migrationVersion || 1;
    if (currentVersion < 4) {
        // Check if dynamic profile already exists (in case of partial migration)
        const hasDynamicProfile = extension_settings.STMemoryBooks.profiles?.some(p => p.useDynamicSTSettings);

        if (!hasDynamicProfile) {
            // Add dynamic profile for existing installations
            if (!extension_settings.STMemoryBooks.profiles) {
                extension_settings.STMemoryBooks.profiles = [];
            }

            // Insert dynamic profile at the beginning of the array
            const dynamicProfile = {
                name: "Current SillyTavern Settings",
                connection: {
                    // Empty connection object - will be populated dynamically from ST
                },
                useDynamicSTSettings: true, // Flag to indicate this profile uses live ST settings
                preset: 'summary',
                // No titleFormat - will use current settings titleFormat dynamically
                constVectMode: 'link',
                position: 0,
                orderMode: 'auto',
                orderValue: 100,
                preventRecursion: true,
                delayUntilRecursion: false
            };

            extension_settings.STMemoryBooks.profiles.unshift(dynamicProfile);

            // Adjust default profile index since we inserted at the beginning
            if (extension_settings.STMemoryBooks.defaultProfile !== undefined) {
                extension_settings.STMemoryBooks.defaultProfile += 1;
            }

            console.log(`${MODULE_NAME}: Added dynamic profile for existing installation (migration to v3)`);
        }

        // Clean up any existing dynamic profiles that may have titleFormat
        extension_settings.STMemoryBooks.profiles.forEach(profile => {
            if (profile.useDynamicSTSettings && profile.titleFormat) {
                delete profile.titleFormat;
                console.log(`${MODULE_NAME}: Removed static titleFormat from dynamic profile`);
            }
        });

        // Update migration version
        extension_settings.STMemoryBooks.migrationVersion = 4;
        saveSettingsDebounced();
    }

    // If this is a fresh install (no profiles), create default profile that dynamically uses ST settings
    if (!extension_settings.STMemoryBooks.profiles || extension_settings.STMemoryBooks.profiles.length === 0) {
        const dynamicProfile = {
            name: "Current SillyTavern Settings",
            connection: {
                // Empty connection object - will be populated dynamically from ST
            },
            useDynamicSTSettings: true, // Flag to indicate this profile uses live ST settings
            preset: 'summary',
            // No titleFormat - will use current settings titleFormat dynamically
            constVectMode: 'link',
            position: 0,
            orderMode: 'auto',
            orderValue: 100,
            preventRecursion: true,
            delayUntilRecursion: false
        };

        extension_settings.STMemoryBooks.profiles = [dynamicProfile];
        console.log(`${MODULE_NAME}: Created dynamic profile for fresh installation`);
    }

    const validationResult = validateSettings(extension_settings.STMemoryBooks);

    // Also validate profiles structure
    const profileValidation = validateAndFixProfiles(extension_settings.STMemoryBooks);
    if (profileValidation.fixes.length > 0) {
        console.log(`${MODULE_NAME}: Applied profile fixes:`, profileValidation.fixes);
        saveSettingsDebounced();
    }

    return validationResult;
}

/**
 * Validate settings structure and fix any issues
 */
function validateSettings(settings) {
    if (!settings.profiles || settings.profiles.length === 0) {
        settings.profiles = [deepClone(defaultSettings.profiles[0])];
        settings.defaultProfile = 0;
    }
    
    if (settings.defaultProfile >= settings.profiles.length) {
        settings.defaultProfile = 0;
    }
    
    if (!settings.moduleSettings) {
        settings.moduleSettings = deepClone(defaultSettings.moduleSettings);
    }
    
    if (!settings.moduleSettings.tokenWarningThreshold || 
        settings.moduleSettings.tokenWarningThreshold < 1000) {
        settings.moduleSettings.tokenWarningThreshold = 30000;
    }
    
    if (settings.moduleSettings.defaultMemoryCount === undefined ||
        settings.moduleSettings.defaultMemoryCount < 0) {
        settings.moduleSettings.defaultMemoryCount = 0;
    }

    // Validate auto-summary settings
    if (settings.moduleSettings.autoSummaryEnabled === undefined) {
        settings.moduleSettings.autoSummaryEnabled = false;
    }
    if (settings.moduleSettings.autoSummaryInterval === undefined ||
        settings.moduleSettings.autoSummaryInterval < 10) {
        settings.moduleSettings.autoSummaryInterval = 100;
    }
    
    // Migrate to version 2 if needed (JSON-based architecture)
    if (!settings.migrationVersion || settings.migrationVersion < 2) {
        console.log(`${MODULE_NAME}: Migrating to JSON-based architecture (v2)`);
        settings.migrationVersion = 2;
        // Update any old tool-based prompts to JSON prompts
        settings.profiles.forEach(profile => {
            if (profile.prompt && profile.prompt.includes('createMemory')) {
                console.log(`${MODULE_NAME}: Updating profile "${profile.name}" to use JSON output`);
                profile.prompt = DEFAULT_PROMPT; // Reset to new JSON-based default
            }
        });
    }
    
    return settings;
}

/**
 * Check if chat has a valid bound lorebook
 */
function hasLorebook() {
    const lorebookName = chat_metadata[METADATA_KEY];
    return lorebookName && world_names && world_names.includes(lorebookName);
}

/**
 * Validate lorebook and return status with data
 */
async function validateLorebook() {
    const lorebookName = await getEffectiveLorebookName();

    if (!lorebookName) {
        return { valid: false, error: 'No lorebook available or selected.' };
    }

    if (!world_names || !world_names.includes(lorebookName)) {
        return { valid: false, error: `Selected lorebook "${lorebookName}" not found.` };
    }

    try {
        const lorebookData = await loadWorldInfo(lorebookName);
        return { valid: !!lorebookData, data: lorebookData, name: lorebookName };
    } catch (error) {
        return { valid: false, error: 'Failed to load the selected lorebook.' };
    }
}

/**
 * Validates lorebook for auto-summary with user-friendly prompts
 */
async function validateLorebookForAutoSummary() {
    // First, try to get a lorebook without showing popups
    const settings = extension_settings.STMemoryBooks;
    let lorebookName;

    if (!settings.moduleSettings.manualModeEnabled) {
        // Automatic mode - use chat-bound lorebook
        lorebookName = chat_metadata?.[METADATA_KEY] || null;
    } else {
        // Manual mode - check if a lorebook is already selected
        const stmbData = getSceneMarkers() || {};
        lorebookName = stmbData.manualLorebook ?? null;

        // If no lorebook is selected, ask user what to do
        if (!lorebookName) {
            const popupContent = `
                <h4>Auto-Summary Ready</h4>
                <div class="world_entry_form_control">
                    <p>Auto-summary is enabled but there is no assigned lorebook for this chat.</p>
                    <p>Would you like to select a lorebook for memory storage, or postpone this auto-summary?</p>
                    <label for="stmb-postpone-messages">Postpone for how many messages?</label>
                    <select id="stmb-postpone-messages" class="text_pole">
                        <option value="10">10 messages</option>
                        <option value="20">20 messages</option>
                        <option value="30">30 messages</option>
                        <option value="40">40 messages</option>
                        <option value="50">50 messages</option>
                    </select>
                </div>
            `;

            const popup = new Popup(popupContent, POPUP_TYPE.TEXT, '', {
                okButton: 'Select Lorebook',
                cancelButton: 'Postpone'
            });
            const result = await popup.show();

            if (result !== POPUP_RESULT.AFFIRMATIVE) {
                // User chose to postpone - get the number of messages to skip
                const postponeMessages = parseInt(popup.dlg.querySelector('#stmb-postpone-messages').value) || 10;

                // Store when to next prompt (current message count + postpone amount)
                const nextPromptAt = chat.length + postponeMessages;
                const stmbData = getSceneMarkers() || {};
                stmbData.autoSummaryNextPromptAt = nextPromptAt;

                // Save the postpone decision
                saveMetadataForCurrentContext();

                return { valid: false, error: `Auto-summary postponed for ${postponeMessages} messages` };
            }

            // User wants to select a lorebook - use the existing selection logic
            lorebookName = await getEffectiveLorebookName();
            if (!lorebookName) {
                return { valid: false, error: 'No lorebook selected' };
            }
        }
    }

    if (!lorebookName) {
        console.log('STMemoryBooks: No lorebook name found in metadata');
        return { valid: false, error: 'No lorebook available' };
    }

    console.log(`STMemoryBooks: Looking for lorebook: "${lorebookName}"`);
    console.log('STMemoryBooks: Available world_names:', world_names);

    if (!world_names || !world_names.includes(lorebookName)) {
        // Try to find a close match (case-insensitive, trimmed)
        let foundMatch = null;
        if (world_names) {
            foundMatch = world_names.find(name =>
                name.toLowerCase().trim() === lorebookName.toLowerCase().trim()
            );
        }

        if (foundMatch) {
            console.log(`STMemoryBooks: Found close match: "${foundMatch}" for "${lorebookName}"`);
            lorebookName = foundMatch;
        } else {
            console.log(`STMemoryBooks: Lorebook "${lorebookName}" not found in available lorebooks:`, world_names);

            // Show user-friendly lorebook selection popup
            if (world_names && world_names.length > 0) {
                const lorebookOptions = world_names.map(name =>
                    `<option value="${name}">${name}</option>`
                ).join('');

                const popupContent = `
                    <h4>Lorebook Not Found</h4>
                    <div class="world_entry_form_control">
                        <p>The assigned lorebook "<strong>${lorebookName}</strong>" was not found.</p>
                        <p>Please select an available lorebook for auto-summary:</p>
                        <label for="stmb-select-lorebook">Choose Lorebook:</label>
                        <select id="stmb-select-lorebook" class="text_pole">
                            ${lorebookOptions}
                        </select>
                        <br><br>
                        <label for="stmb-postpone-messages">Or postpone for how many messages?</label>
                        <select id="stmb-postpone-messages" class="text_pole">
                            <option value="10">10 messages</option>
                            <option value="20">20 messages</option>
                            <option value="30">30 messages</option>
                            <option value="50">50 messages</option>
                        </select>
                    </div>
                `;

                const popup = new Popup(popupContent, POPUP_TYPE.TEXT, '', {
                    okButton: 'Use Selected Lorebook',
                    cancelButton: 'Postpone'
                });
                const result = await popup.show();

                if (result === POPUP_RESULT.AFFIRMATIVE) {
                    // User selected a lorebook
                    const selectedLorebook = popup.dlg.querySelector('#stmb-select-lorebook').value;
                    console.log(`STMemoryBooks: User selected lorebook: "${selectedLorebook}"`);

                    // Update the chat metadata to use the selected lorebook
                    chat_metadata[METADATA_KEY] = selectedLorebook;
                    saveMetadataDebounced();

                    lorebookName = selectedLorebook;
                    toastr.success(`Auto-summary will now use "${selectedLorebook}"`, 'STMemoryBooks');
                } else {
                    // User chose to postpone
                    const postponeMessages = parseInt(popup.dlg.querySelector('#stmb-postpone-messages').value) || 10;
                    const nextPromptAt = chat.length + postponeMessages;
                    const stmbData = getSceneMarkers() || {};
                    stmbData.autoSummaryNextPromptAt = nextPromptAt;
                    saveMetadataForCurrentContext();

                    return { valid: false, error: `Auto-summary postponed for ${postponeMessages} messages` };
                }
            } else {
                return { valid: false, error: 'No lorebooks available for auto-summary' };
            }
        }
    }

    try {
        const lorebookData = await loadWorldInfo(lorebookName);
        return { valid: !!lorebookData, data: lorebookData, name: lorebookName };
    } catch (error) {
        return { valid: false, error: 'Failed to load the selected lorebook.' };
    }
}

/**
 * Extract and validate settings from confirmation popup or defaults
 */
async function showAndGetMemorySettings(sceneData, lorebookValidation, selectedProfileIndex = null) {
    const settings = initializeSettings();
    const tokenThreshold = settings.moduleSettings.tokenWarningThreshold || 30000;
    const shouldShowConfirmation = !settings.moduleSettings.alwaysUseDefault || 
                                  sceneData.estimatedTokens > tokenThreshold;
    
    let confirmationResult = null;
    
    if (shouldShowConfirmation) {
        // Use the passed profile index, or fall back to default
        const profileIndex = selectedProfileIndex !== null ? selectedProfileIndex : settings.defaultProfile;
        
        // Show simplified confirmation popup with selected profile
        confirmationResult = await showConfirmationPopup(
            sceneData, 
            settings, 
            getCurrentModelSettings(), 
            getCurrentApiInfo(), 
            chat_metadata,
            profileIndex
        );
        
        if (!confirmationResult.confirmed) {
            return null; // User cancelled
        }
    } else {
        // Use default profile without confirmation
        const selectedProfile = settings.profiles[settings.defaultProfile];
        confirmationResult = {
            confirmed: true,
            profileSettings: {
                ...selectedProfile,
                effectivePrompt: getEffectivePrompt(selectedProfile) // Use shared function
            },
            advancedOptions: {
                memoryCount: settings.moduleSettings.defaultMemoryCount || 0,
                overrideSettings: false
            }
        };
    }
    
    // Build effective connection settings
    const { profileSettings, advancedOptions } = confirmationResult;

    // Check if this profile should dynamically use ST settings
    if (profileSettings.useDynamicSTSettings || advancedOptions.overrideSettings) {
        const currentApiInfo = getCurrentApiInfo();
        const currentSettings = getCurrentModelSettings();

        profileSettings.effectiveConnection = {
            api: currentApiInfo.completionSource || 'openai',
            model: currentSettings.model || '',
            temperature: currentSettings.temperature || 0.7
        };

        if (profileSettings.useDynamicSTSettings) {
            console.log('STMemoryBooks: Using dynamic ST settings profile - current settings:', profileSettings.effectiveConnection);
        } else {
            console.log('STMemoryBooks: Using current SillyTavern settings override for memory creation');
        }
    } else {
        profileSettings.effectiveConnection = { ...profileSettings.connection };
        console.log('STMemoryBooks: Using profile connection settings for memory creation');
    }
    
    return {
        profileSettings,
        summaryCount: advancedOptions.memoryCount || 0,
        tokenThreshold,
        settings
    };
}

/**
 * Determine if an error is retryable
 */
function isRetryableError(error) {
    // Don't retry these error types
    const nonRetryableErrors = [
        'TokenWarningError',     // User needs to select smaller range
        'InvalidProfileError'    // Configuration issue
    ];
    
    if (nonRetryableErrors.includes(error.name)) {
        return false;
    }
    
    // Don't retry validation errors
    if (error.message.includes('Scene compilation failed') || 
        error.message.includes('Invalid memory result') ||
        error.message.includes('Invalid lorebook')) {
        return false;
    }
    
    // Retry AI response errors and network-related issues
    return true;
}


/**
 * Execute the core memory generation process - now with retry logic and BULLETPROOF settings restoration
 */
async function executeMemoryGeneration(sceneData, lorebookValidation, effectiveSettings, retryCount = 0) {
    const { profileSettings, summaryCount, tokenThreshold, settings } = effectiveSettings;
    currentProfile = profileSettings;
    const maxRetries = 2; // Allow up to 2 retries (3 total attempts)
    
    // Store current settings for restoration
    const originalSettings = getCurrentModelSettings();
    let settingsRestored = false;
    
    try {
        // Create and compile scene first
        const sceneRequest = createSceneRequest(sceneData.sceneStart, sceneData.sceneEnd);
        const compiledScene = compileScene(sceneRequest);

        // Validate compiled scene
        const validation = validateCompiledScene(compiledScene);
        if (!validation.valid) {
            throw new Error(`Scene compilation failed: ${validation.errors.join(', ')}`);
        }

        // Fetch previous memories if requested
        let previousMemories = [];
        let memoryFetchResult = { summaries: [], actualCount: 0, requestedCount: 0 };
        if (summaryCount > 0) {
            // Fetch previous memories silently (no intermediate toast)
            memoryFetchResult = await fetchPreviousSummaries(summaryCount, settings, chat_metadata);
            previousMemories = memoryFetchResult.summaries;

            if (memoryFetchResult.actualCount > 0) {
                if (memoryFetchResult.actualCount < memoryFetchResult.requestedCount) {
                    toastr.warning(`Only ${memoryFetchResult.actualCount} of ${memoryFetchResult.requestedCount} requested memories available`, 'STMemoryBooks');
                }
                console.log(`STMemoryBooks: Including ${memoryFetchResult.actualCount} previous memories as context`);
            } else {
                toastr.warning('No previous memories found in lorebook', 'STMemoryBooks');
            }
        }

        // Show working toast with actual memory count after fetching
        let workingToastMessage;
        if (retryCount > 0) {
            workingToastMessage = `Retrying memory creation (attempt ${retryCount + 1}/${maxRetries + 1})...`;
        } else {
            workingToastMessage = memoryFetchResult.actualCount > 0
                ? `Creating memory with ${memoryFetchResult.actualCount} context memories...`
                : 'Creating memory...';
        }
        toastr.info(workingToastMessage, 'STMemoryBooks', { timeOut: 0 });
        
        // Add context and get stats (no intermediate toast)
        compiledScene.previousSummariesContext = previousMemories;
        const stats = getSceneStats(compiledScene);
        const actualTokens = stats.estimatedTokens;

        // Generate memory silently
        const memoryResult = await createMemory(compiledScene, profileSettings, {
            tokenWarningThreshold: tokenThreshold
        });

        // Check if memory previews are enabled and handle accordingly
        let finalMemoryResult = memoryResult;

        if (settings.moduleSettings.showMemoryPreviews) {
            // Clear working toast before showing preview popup
            toastr.clear();

            const previewResult = await showMemoryPreviewPopup(memoryResult, sceneData, profileSettings);

            if (previewResult.action === 'cancel') {
                // User cancelled, abort the process
                toastr.info('Memory creation cancelled by user', 'STMemoryBooks');
                return;
            } else if (previewResult.action === 'retry') {
                // User wants to retry - limit user-initiated retries to prevent infinite loops
                const maxUserRetries = 3; // Allow up to 3 user-initiated retries
                const currentUserRetries = retryCount >= maxRetries ? retryCount - maxRetries : 0;

                if (currentUserRetries >= maxUserRetries) {
                    toastr.warning(`Maximum retry attempts (${maxUserRetries}) reached`, 'STMemoryBooks');
                    return { action: 'cancel' };
                }

                toastr.info(`Retrying memory generation (${currentUserRetries + 1}/${maxUserRetries})...`, 'STMemoryBooks');
                // Keep the retry count properly incremented to track total attempts
                const nextRetryCount = Math.max(retryCount + 1, maxRetries + currentUserRetries + 1);
                return await executeMemoryGeneration(sceneData, lorebookValidation, effectiveSettings, nextRetryCount);
            }

            // Handle preview result based on action
            if (previewResult.action === 'accept') {
                // User accepted as-is, use original data
                finalMemoryResult = memoryResult;
            } else if (previewResult.action === 'edit') {
                // User edited the data, validate and use edited version
                if (!previewResult.memoryData) {
                    console.error('STMemoryBooks: Edit action missing memoryData');
                    toastr.error('Unable to retrieve edited memory data', 'STMemoryBooks');
                    return;
                }

                // Validate that edited memory data has required fields
                if (!previewResult.memoryData.extractedTitle || !previewResult.memoryData.content) {
                    console.error('STMemoryBooks: Edited memory data missing required fields');
                    toastr.error('Edited memory data is incomplete', 'STMemoryBooks');
                    return;
                }

                finalMemoryResult = previewResult.memoryData;
            } else {
                // Unexpected action, use original data as fallback
                console.warn(`STMemoryBooks: Unexpected preview action: ${previewResult.action}`);
                finalMemoryResult = memoryResult;
            }
        }

        // Add to lorebook silently
        const addResult = await addMemoryToLorebook(finalMemoryResult, lorebookValidation);

        if (!addResult.success) {
            throw new Error(addResult.error || 'Failed to add memory to lorebook');
        }

        // Clear scene markers after successful memory creation if auto-summary is enabled
        if (extension_settings[MODULE_NAME].moduleSettings.autoSummaryEnabled) {
            clearScene();
            // RESET auto-summary count so it starts fresh from this point
            saveMetadataForCurrentContext('autoSummaryLastMessageCount', chat.length);
        }

        // Success notification
        const contextMsg = memoryFetchResult.actualCount > 0 ?
            ` (with ${memoryFetchResult.actualCount} context ${memoryFetchResult.actualCount === 1 ? 'memory' : 'memories'})` : '';

        // Clear working toast and show success
        toastr.clear();
        const retryMsg = retryCount > 0 ? ` (succeeded on attempt ${retryCount + 1})` : '';
        toastr.success(`Memory "${addResult.entryTitle}" created successfully${contextMsg}${retryMsg}!`, 'STMemoryBooks');
        
    } catch (error) {
        console.error('STMemoryBooks: Error creating memory:', error);
        
        // Determine if we should retry
        const shouldRetry = retryCount < maxRetries && isRetryableError(error);
        
        if (shouldRetry) {
            // Show retry notification and attempt again
            toastr.warning(`Memory creation failed (attempt ${retryCount + 1}). Retrying in 2 seconds...`, 'STMemoryBooks', {
                timeOut: 3000
            });
            
            // Wait 2 seconds before retrying
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Recursive retry
            return await executeMemoryGeneration(sceneData, lorebookValidation, effectiveSettings, retryCount + 1);
        }
        
        // No more retries or non-retryable error - show final error
        const retryMsg = retryCount > 0 ? ` (failed after ${retryCount + 1} attempts)` : '';
        
        // Provide specific error messages for different types of failures
        if (error.name === 'TokenWarningError') {
            toastr.error(`Scene is too large (${error.tokenCount} tokens). Try selecting a smaller range${retryMsg}.`, 'STMemoryBooks', {
                timeOut: 8000
            });
        } else if (error.name === 'AIResponseError') {
            toastr.error(`AI failed to generate valid memory: ${error.message}${retryMsg}`, 'STMemoryBooks', {
                timeOut: 8000
            });
        } else if (error.name === 'InvalidProfileError') {
            toastr.error(`Profile configuration error: ${error.message}${retryMsg}`, 'STMemoryBooks', {
                timeOut: 8000
            });
        } else {
            toastr.error(`Failed to create memory: ${error.message}${retryMsg}`, 'STMemoryBooks');
        }
    } finally {        
        isProcessingMemory = false;
    }
}

async function initiateMemoryCreation(selectedProfileIndex = null) {
    // Early validation checks (no flag set yet) - GROUP CHAT COMPATIBLE
    const context = getCurrentMemoryBooksContext();
    
    // For single character chats, check character data
    if (!context.isGroupChat) {
        if (!characters || characters.length === 0 || !characters[this_chid]) {
            toastr.error('SillyTavern is still loading character data, please wait a few seconds and try again.', 'STMemoryBooks');
            return;
        }
    }
    // For group chats, check that we have group data
    else {
        if (!context.groupId || !context.groupName) {
            toastr.error('Group chat data not available, please wait a few seconds and try again.', 'STMemoryBooks');
            return;
        }
    }
    
    // RACE CONDITION FIX: Check and set flag atomically
    if (isProcessingMemory) {
        toastr.warning('Memory creation already in progress', 'STMemoryBooks');
        return;
    }
    
    // Set processing flag IMMEDIATELY after validation to prevent race conditions
    isProcessingMemory = true;
    
    try {
        const settings = initializeSettings();

        // All the validation and processing logic
        const sceneData = getSceneData();
        if (!sceneData) {
            console.error('STMemoryBooks: No scene selected for memory initiation');
            toastr.error('No scene selected', 'STMemoryBooks');
            isProcessingMemory = false;
            return;
        }
        
        const lorebookValidation = await validateLorebook();
        if (!lorebookValidation.valid) {
            console.error('STMemoryBooks: Lorebook validation failed:', lorebookValidation.error);
            toastr.error(lorebookValidation.error, 'STMemoryBooks');
            isProcessingMemory = false;
            return;
        }
        
        const allMemories = identifyMemoryEntries(lorebookValidation.data);
        const newStart = sceneData.sceneStart;
        const newEnd = sceneData.sceneEnd;

        if (!settings.moduleSettings.allowSceneOverlap) {
            for (const mem of allMemories) {
                const existingRange = getRangeFromMemoryEntry(mem.entry); 

                if (existingRange && existingRange.start !== null && existingRange.end !== null) {
                    if (newStart <= existingRange.end && newEnd >= existingRange.start) {
                        console.error(`STMemoryBooks: Scene overlap detected with memory: ${mem.title}`);
                        toastr.error(`Scene overlaps with existing memory: "${mem.title}" (messages ${existingRange.start}-${existingRange.end})`, 'STMemoryBooks');
                        isProcessingMemory = false;
                        return;
                    }
                }
            }
        }
        
        const effectiveSettings = await showAndGetMemorySettings(sceneData, lorebookValidation, selectedProfileIndex);
        if (!effectiveSettings) {
            isProcessingMemory = false;
            return; // User cancelled
        }
        
        // Close settings popup if open
        if (currentPopupInstance) {
            currentPopupInstance.completeCancelled();
            currentPopupInstance = null;
        }
        
        // Execute the main process with retry logic
        await executeMemoryGeneration(sceneData, lorebookValidation, effectiveSettings);
        
    } catch (error) {
        console.error('STMemoryBooks: Critical error during memory initiation:', error);
        toastr.error(`An unexpected error occurred: ${error.message}`, 'STMemoryBooks');
    } finally {
        // ALWAYS reset the flag, no matter how we exit
        isProcessingMemory = false;
    }
}

/**
 * Helper function to convert old boolean auto-hide settings to new dropdown format
 */
function getAutoHideMode(moduleSettings) {
    // Handle new format
    if (moduleSettings.autoHideMode) {
        return moduleSettings.autoHideMode;
    }
    
    // Convert from old boolean format for backward compatibility
    if (moduleSettings.autoHideAllMessages) {
        return 'all';
    } else if (moduleSettings.autoHideLastMemory) {
        return 'last';
    } else {
        return 'none';
    }
}

/**
 * Update lorebook status display in settings popup
 */
function updateLorebookStatusDisplay() {
    const settings = extension_settings.STMemoryBooks;
    if (!settings) return;

    const stmbData = getSceneMarkers() || {};
    const isManualMode = settings.moduleSettings.manualModeEnabled;

    // Update mode badge
    const modeBadge = document.querySelector('#stmb-mode-badge');
    if (modeBadge) {
        modeBadge.textContent = isManualMode ? 'Manual' : 'Automatic (Chat-bound)';
    }

    // Update active lorebook display
    const activeLorebookSpan = document.querySelector('#stmb-active-lorebook');
    if (activeLorebookSpan) {
        const currentLorebook = isManualMode ?
            stmbData.manualLorebook :
            chat_metadata?.[METADATA_KEY];

        activeLorebookSpan.textContent = currentLorebook || 'None selected';
        activeLorebookSpan.className = currentLorebook ? '' : 'opacity50p';
    }

    // Manual lorebook buttons are now handled by populateInlineButtons()

    // Show/hide manual controls and automatic info sections based on mode
    const manualControls = document.querySelector('#stmb-manual-controls');
    if (manualControls) {
        manualControls.style.display = isManualMode ? 'block' : 'none';
    }

    const automaticInfo = document.querySelector('#stmb-automatic-info');
    if (automaticInfo) {
        automaticInfo.style.display = isManualMode ? 'none' : 'block';

        // Update automatic mode info text
        const infoText = automaticInfo.querySelector('small');
        if (infoText) {
            const chatBoundLorebook = chat_metadata?.[METADATA_KEY];
            infoText.innerHTML = chatBoundLorebook ?
                `Using chat-bound lorebook "<strong>${chatBoundLorebook}</strong>"` :
                'No chat-bound lorebook. Memories will require lorebook selection.';
        }
    }

    // Manual lorebook button visibility is now handled by populateInlineButtons()
}

/**
 * Populate inline button containers with dynamic buttons (profile and manual lorebook buttons)
 */
function populateInlineButtons() {
    if (!currentPopupInstance?.dlg) return;

    const settings = initializeSettings();
    const stmbData = getSceneMarkers() || {};

    // Get all button containers
    const manualLorebookContainer = currentPopupInstance.content.querySelector('#stmb-manual-lorebook-buttons');
    const profileButtonsContainer = currentPopupInstance.content.querySelector('#stmb-profile-buttons');
    const importExportContainer = currentPopupInstance.content.querySelector('#stmb-import-export-buttons');

    // Populate manual lorebook buttons if container exists and manual mode is enabled
    if (manualLorebookContainer && settings.moduleSettings.manualModeEnabled) {
        const hasManualLorebook = stmbData.manualLorebook ?? null;

        const manualLorebookButtons = [
            {
                text: `📕 ${hasManualLorebook ? 'Change' : 'Select'} Manual Lorebook`,
                id: 'stmb-select-manual-lorebook',
                action: async () => {
                    try {
                        // Use the dedicated selection popup that always shows options
                        const selectedLorebook = await showLorebookSelectionPopup(hasManualLorebook ? stmbData.manualLorebook : null);
                        if (selectedLorebook) {
                            // Refresh the popup content to reflect the new selection
                            refreshPopupContent();
                        }
                    } catch (error) {
                        console.error('STMemoryBooks: Error selecting manual lorebook:', error);
                        toastr.error('Failed to select manual lorebook', 'STMemoryBooks');
                    }
                }
            }
        ];

        // Add clear button if manual lorebook is set
        if (hasManualLorebook) {
            manualLorebookButtons.push({
                text: '❌ Clear Manual Lorebook',
                id: 'stmb-clear-manual-lorebook',
                action: () => {
                    try {
                        const stmbData = getSceneMarkers() || {};
                        delete stmbData.manualLorebook;
                        saveMetadataForCurrentContext();

                        // Refresh the popup content
                        refreshPopupContent();
                        toastr.success('Manual lorebook cleared', 'STMemoryBooks');
                    } catch (error) {
                        console.error('STMemoryBooks: Error clearing manual lorebook:', error);
                        toastr.error('Failed to clear manual lorebook', 'STMemoryBooks');
                    }
                }
            });
        }

        // Clear container and populate with buttons
        manualLorebookContainer.innerHTML = '';
        manualLorebookButtons.forEach(buttonConfig => {
            const button = document.createElement('div');
            button.className = 'menu_button interactable';
            button.id = buttonConfig.id;
            button.textContent = buttonConfig.text;
            button.addEventListener('click', buttonConfig.action);
            manualLorebookContainer.appendChild(button);
        });
    }

    if (!profileButtonsContainer || !importExportContainer) return;

    // Create profile action buttons
    const profileButtons = [
        {
            text: '⭐ Set as Default',
            id: 'stmb-set-default-profile',
            action: () => {
                const profileSelect = currentPopupInstance?.dlg?.querySelector('#stmb-profile-select');
                if (!profileSelect) return;

                const selectedIndex = parseInt(profileSelect.value);
                if (selectedIndex === settings.defaultProfile) {
                    toastr.info('This profile is already the default', 'STMemoryBooks');
                    return;
                }

                settings.defaultProfile = selectedIndex;
                saveSettingsDebounced();
                toastr.success(`"${settings.profiles[selectedIndex].name}" is now the default profile.`, 'STMemoryBooks');
                refreshPopupContent();
            }
        },
        {
            text: '✏️ Edit Profile',
            id: 'stmb-edit-profile',
            action: async () => {
                try {
                    const profileSelect = currentPopupInstance?.dlg?.querySelector('#stmb-profile-select');
                    if (!profileSelect) return;

                    const selectedIndex = parseInt(profileSelect.value);
                    const selectedProfile = settings.profiles[selectedIndex];

                    // Prevent editing of dynamic ST settings profile
                    if (selectedProfile.useDynamicSTSettings) {
                        toastr.error('Cannot edit the Dynamic ST Settings profile. Create a new profile instead.', 'STMemoryBooks');
                        return;
                    }

                    await editProfile(settings, selectedIndex, refreshPopupContent);
                } catch (error) {
                    console.error(`${MODULE_NAME}: Error in edit profile:`, error);
                    toastr.error('Failed to edit profile', 'STMemoryBooks');
                }
            }
        },
        {
            text: '➕ New Profile',
            id: 'stmb-new-profile',
            action: async () => {
                try {
                    await newProfile(settings, refreshPopupContent);
                } catch (error) {
                    console.error(`${MODULE_NAME}: Error in new profile:`, error);
                    toastr.error('Failed to create profile', 'STMemoryBooks');
                }
            }
        },
        {
            text: '🗑️ Delete Profile',
            id: 'stmb-delete-profile',
            action: async () => {
                try {
                    const profileSelect = currentPopupInstance?.dlg?.querySelector('#stmb-profile-select');
                    if (!profileSelect) return;

                    const selectedIndex = parseInt(profileSelect.value);
                    await deleteProfile(settings, selectedIndex, refreshPopupContent);
                } catch (error) {
                    console.error(`${MODULE_NAME}: Error in delete profile:`, error);
                    toastr.error('Failed to delete profile', 'STMemoryBooks');
                }
            }
        }
    ];

    // Create import/export buttons
    const importExportButtons = [
        {
            text: '📤 Export Profiles',
            id: 'stmb-export-profiles',
            action: () => {
                try {
                    exportProfiles(settings);
                } catch (error) {
                    console.error(`${MODULE_NAME}: Error in export profiles:`, error);
                    toastr.error('Failed to export profiles', 'STMemoryBooks');
                }
            }
        },
        {
            text: '📥 Import Profiles',
            id: 'stmb-import-profiles',
            action: () => {
                const importFile = currentPopupInstance?.dlg?.querySelector('#stmb-import-file');
                if (importFile) {
                    importFile.click();
                }
            }
        }
    ];

    // Clear containers and populate with buttons
    profileButtonsContainer.innerHTML = '';
    importExportContainer.innerHTML = '';

    // Add profile action buttons
    profileButtons.forEach(buttonConfig => {
        const button = document.createElement('div');
        button.className = 'menu_button interactable';
        button.id = buttonConfig.id;
        button.textContent = buttonConfig.text;
        button.addEventListener('click', buttonConfig.action);
        profileButtonsContainer.appendChild(button);
    });

    // Add import/export buttons
    importExportButtons.forEach(buttonConfig => {
        const button = document.createElement('div');
        button.className = 'menu_button interactable';
        button.id = buttonConfig.id;
        button.textContent = buttonConfig.text;
        button.addEventListener('click', buttonConfig.action);
        importExportContainer.appendChild(button);
    });
}

/**
 * Show main settings popup
 */
async function showSettingsPopup() {
    const settings = initializeSettings();
    const sceneData = getSceneData();
    const selectedProfile = settings.profiles[settings.defaultProfile];
    const sceneMarkers = getSceneMarkers();

    // Get current lorebook information
    const isManualMode = settings.moduleSettings.manualModeEnabled;
    const chatBoundLorebook = chat_metadata?.[METADATA_KEY] || null;
    const manualLorebook = sceneMarkers?.manualLorebook || null;

    const templateData = {
        hasScene: !!sceneData,
        sceneData: sceneData,
        highestMemoryProcessed: sceneMarkers?.highestMemoryProcessed,
        alwaysUseDefault: settings.moduleSettings.alwaysUseDefault,
        showMemoryPreviews: settings.moduleSettings.showMemoryPreviews,
        showNotifications: settings.moduleSettings.showNotifications,
        refreshEditor: settings.moduleSettings.refreshEditor,
        allowSceneOverlap: settings.moduleSettings.allowSceneOverlap,
        manualModeEnabled: settings.moduleSettings.manualModeEnabled,

        // Lorebook status information
        lorebookMode: isManualMode ? 'Manual' : 'Automatic (Chat-bound)',
        currentLorebookName: isManualMode ? manualLorebook : chatBoundLorebook,
        manualLorebookName: manualLorebook,
        chatBoundLorebookName: chatBoundLorebook,
        availableLorebooks: world_names || [],
        autoHideMode: getAutoHideMode(settings.moduleSettings),
        unhiddenEntriesCount: settings.moduleSettings.unhiddenEntriesCount || 0,
        tokenWarningThreshold: settings.moduleSettings.tokenWarningThreshold || 30000,
        defaultMemoryCount: settings.moduleSettings.defaultMemoryCount || 0,
        autoSummaryEnabled: settings.moduleSettings.autoSummaryEnabled || false,
        autoSummaryInterval: settings.moduleSettings.autoSummaryInterval || 50,
        profiles: settings.profiles.map((profile, index) => ({
            ...profile,
            isDefault: index === settings.defaultProfile
        })),
        titleFormat: settings.titleFormat,
        titleFormats: getDefaultTitleFormats().map(format => ({
            value: format,
            isSelected: format === settings.titleFormat
        })),
        showCustomInput: !getDefaultTitleFormats().includes(settings.titleFormat),
        selectedProfile: {
            ...selectedProfile,
            connection: selectedProfile.useDynamicSTSettings ?
                (() => {
                    const currentApiInfo = getCurrentApiInfo();
                    const currentSettings = getCurrentModelSettings();
                    return {
                        api: currentApiInfo.completionSource || 'openai',
                        model: currentSettings.model || 'Not Set',
                        temperature: currentSettings.temperature || 0.7
                    };
                })() : {
                    api: selectedProfile.connection?.api || 'openai',
                    model: selectedProfile.connection?.model || 'Not Set',
                    temperature: selectedProfile.connection?.temperature !== undefined ? selectedProfile.connection.temperature : 0.7
                },
            titleFormat: selectedProfile.useDynamicSTSettings ? settings.titleFormat : (selectedProfile.titleFormat || settings.titleFormat),
            effectivePrompt: getEffectivePrompt(selectedProfile)
        }
    };

    const content = DOMPurify.sanitize(settingsTemplate(templateData));
    
    // Build customButtons array dynamically based on current state
    const customButtons = [
        {
            text: '🧠 Create Memory',
            result: null,
            classes: ['menu_button', 'interactable'],
            action: async () => {
                if (!sceneData) {
                    toastr.error('No scene selected. Make sure both start and end points are set.', 'STMemoryBooks');
                    return;
                }

                // Capture the currently selected profile before proceeding
                let selectedProfileIndex = settings.defaultProfile;
                if (currentPopupInstance && currentPopupInstance.dlg) {
                    const profileSelect = currentPopupInstance.dlg.querySelector('#stmb-profile-select');
                    if (profileSelect) {
                        selectedProfileIndex = parseInt(profileSelect.value) || settings.defaultProfile;
                        console.log(`STMemoryBooks: Using profile index ${selectedProfileIndex} (${settings.profiles[selectedProfileIndex]?.name}) from main popup selection`);
                    }
                }

                await initiateMemoryCreation(selectedProfileIndex);
            }
        },
        {
            text: '🗑️ Clear Scene',
            result: null,
            classes: ['menu_button', 'interactable'],
            action: () => {
                clearScene();
                refreshPopupContent();
            }
        }
    ];

    // Manual lorebook and profile buttons will be populated after popup creation
    
    const popupOptions = {
        wide: true,
        large: true,
        allowVerticalScrolling: true,
        customButtons: customButtons,
        cancelButton: 'Close',
        okButton: false,
        onClose: handleSettingsPopupClose
    };
    
    try {
        currentPopupInstance = new Popup(content, POPUP_TYPE.TEXT, '', popupOptions);
        setupSettingsEventListeners();
        populateInlineButtons();
        await currentPopupInstance.show();
    } catch (error) {
        console.error('STMemoryBooks: Error showing settings popup:', error);
        currentPopupInstance = null;
    }
}

/**
 * Setup event listeners for settings popup using full event delegation
 */
function setupSettingsEventListeners() {
    if (!currentPopupInstance) return;
    
    const popupElement = currentPopupInstance.dlg;
    
    // Use full event delegation for all interactions
    popupElement.addEventListener('click', async (e) => {
        const settings = initializeSettings();
        
        // Note: Manual lorebook and profile management buttons are now handled via customButtons
    });
    
    // Handle change events using delegation
    popupElement.addEventListener('change', async (e) => {
        const settings = initializeSettings();
        
        if (e.target.matches('#stmb-import-file')) {
            try {
                importProfiles(e, settings, refreshPopupContent);
            } catch (error) {
                console.error(`${MODULE_NAME}: Error in import profiles:`, error);
                toastr.error('Failed to import profiles', 'STMemoryBooks');
            }
            return;
        }
        
        if (e.target.matches('#stmb-allow-scene-overlap')) {
            settings.moduleSettings.allowSceneOverlap = e.target.checked;
            saveSettingsDebounced();
            return;
        }
        
        if (e.target.matches('#stmb-manual-mode-enabled')) {
            const isEnabling = e.target.checked;

            if (isEnabling) {
                // Check if there's a chat-bound lorebook
                const chatBoundLorebook = chat_metadata?.[METADATA_KEY];
                const stmbData = getSceneMarkers() || {};

                // If switching to manual mode and no manual lorebook is set
                if (!stmbData.manualLorebook) {
                    // If there's a chat-bound lorebook, suggest using it or selecting a different one
                    if (chatBoundLorebook) {
                        const popupContent = `
                            <h4>Manual Lorebook Setup</h4>
                            <div class="world_entry_form_control">
                                <p>You have a chat-bound lorebook "<strong>${chatBoundLorebook}</strong>".</p>
                                <p>Would you like to use it for manual mode or select a different one?</p>
                            </div>
                        `;

                        const popup = new Popup(popupContent, POPUP_TYPE.TEXT, '', {
                            okButton: 'Use Chat-bound',
                            cancelButton: 'Select Different'
                        });
                        const result = await popup.show();

                        if (result === POPUP_RESULT.AFFIRMATIVE) {
                            // Use the chat-bound lorebook as manual lorebook
                            stmbData.manualLorebook = chatBoundLorebook;
                            saveMetadataForCurrentContext();
                            toastr.success(`Manual lorebook set to "${chatBoundLorebook}"`, 'STMemoryBooks');
                        } else {
                            // Let user select a different lorebook
                            const selectedLorebook = await getEffectiveLorebookName();
                            if (selectedLorebook) {
                                stmbData.manualLorebook = selectedLorebook;
                                saveMetadataForCurrentContext();
                                toastr.success(`Manual lorebook set to "${selectedLorebook}"`, 'STMemoryBooks');
                            } else {
                                // User cancelled, revert the checkbox
                                e.target.checked = false;
                                toastr.info('Manual mode cancelled - no lorebook selected', 'STMemoryBooks');
                                return;
                            }
                        }
                    } else {
                        // No chat-bound lorebook, prompt to select one
                        toastr.info('Please select a lorebook for manual mode', 'STMemoryBooks');
                        const selectedLorebook = await getEffectiveLorebookName();
                        if (selectedLorebook) {
                            stmbData.manualLorebook = selectedLorebook;
                            saveMetadataForCurrentContext();
                            toastr.success(`Manual lorebook set to "${selectedLorebook}"`, 'STMemoryBooks');
                        } else {
                            // User cancelled, revert the checkbox
                            e.target.checked = false;
                            toastr.info('Manual mode cancelled - no lorebook selected', 'STMemoryBooks');
                            return;
                        }
                    }
                }
            }

            settings.moduleSettings.manualModeEnabled = e.target.checked;
            saveSettingsDebounced();
            updateLorebookStatusDisplay();
            populateInlineButtons();
            return;
        }


        if (e.target.matches('#stmb-auto-hide-mode')) {
            settings.moduleSettings.autoHideMode = e.target.value;
            delete settings.moduleSettings.autoHideAllMessages;
            delete settings.moduleSettings.autoHideLastMemory;
            saveSettingsDebounced();
            return;
        }
        
        if (e.target.matches('#stmb-profile-select')) {
            const newIndex = parseInt(e.target.value);
            if (newIndex >= 0 && newIndex < settings.profiles.length) {
                const selectedProfile = settings.profiles[newIndex];
                const summaryApi = popupElement.querySelector('#stmb-summary-api');
                const summaryModel = popupElement.querySelector('#stmb-summary-model');
                const summaryTemp = popupElement.querySelector('#stmb-summary-temp');
                const summaryTitle = popupElement.querySelector('#stmb-summary-title');
                const summaryPrompt = popupElement.querySelector('#stmb-summary-prompt');

                if (selectedProfile.useDynamicSTSettings) {
                    // For dynamic profiles, show current ST settings
                    const currentApiInfo = getCurrentApiInfo();
                    const currentSettings = getCurrentModelSettings();

                    if (summaryApi) summaryApi.textContent = currentApiInfo.completionSource || 'openai';
                    if (summaryModel) summaryModel.textContent = currentSettings.model || 'Not Set';
                    if (summaryTemp) summaryTemp.textContent = currentSettings.temperature || '0.7';
                } else {
                    // For regular profiles, show stored settings
                    if (summaryApi) summaryApi.textContent = selectedProfile.connection?.api || 'openai';
                    if (summaryModel) summaryModel.textContent = selectedProfile.connection?.model || 'Not Set';
                    if (summaryTemp) summaryTemp.textContent = selectedProfile.connection?.temperature !== undefined ? selectedProfile.connection.temperature : '0.7';
                }
                // For title format, dynamic profiles use current settings, regular profiles use their own
                if (summaryTitle) summaryTitle.textContent = selectedProfile.useDynamicSTSettings ? settings.titleFormat : (selectedProfile.titleFormat || settings.titleFormat);
                if (summaryPrompt) summaryPrompt.textContent = getEffectivePrompt(selectedProfile);
            }
            return;
        }
        
        if (e.target.matches('#stmb-title-format-select')) {
            const customInput = popupElement.querySelector('#stmb-custom-title-format');
            const summaryTitle = popupElement.querySelector('#stmb-summary-title');

            if (e.target.value === 'custom') {
                customInput.classList.remove('displayNone');
                customInput.focus();
            } else {
                customInput.classList.add('displayNone');
                settings.titleFormat = e.target.value;
                saveSettingsDebounced();

                // Update the preview
                if (summaryTitle) {
                    summaryTitle.textContent = e.target.value;
                }
            }
            return;
        }
        
        if (e.target.matches('#stmb-default-memory-count')) {
            const value = parseInt(e.target.value);
            if (!isNaN(value) && value >= 0 && value <= 20) {
                settings.moduleSettings.defaultMemoryCount = value;
                saveSettingsDebounced();
            }
            return;
        }

        if (e.target.matches('#stmb-auto-summary-enabled')) {
            settings.moduleSettings.autoSummaryEnabled = e.target.checked;
            saveSettingsDebounced();
            return;
        }

        if (e.target.matches('#stmb-auto-summary-interval')) {
            const value = parseInt(e.target.value);
            if (!isNaN(value) && value >= 10 && value <= 200) {
                settings.moduleSettings.autoSummaryInterval = value;
                saveSettingsDebounced();
            }
            return;
        }
    });
    
    // Handle input events using delegation with debouncing
    popupElement.addEventListener('input', lodash.debounce((e) => {
        const settings = initializeSettings();
        
        if (e.target.matches('#stmb-custom-title-format')) {
            const value = e.target.value.trim();
            if (value && value.includes('000')) {
                settings.titleFormat = value;
                saveSettingsDebounced();

                // Update the preview
                const summaryTitle = popupElement.querySelector('#stmb-summary-title');
                if (summaryTitle) {
                    summaryTitle.textContent = value;
                }
            }
            return;
        }
        
        if (e.target.matches('#stmb-token-warning-threshold')) {
            const value = parseInt(e.target.value);
            if (!isNaN(value) && value >= 1000 && value <= 100000) {
                settings.moduleSettings.tokenWarningThreshold = value;
                saveSettingsDebounced();
            }
            return;
        }
        
        if (e.target.matches('#stmb-unhidden-entries-count')) {
            const value = parseInt(e.target.value);
            if (!isNaN(value) && value >= 0 && value <= 50) {
                settings.moduleSettings.unhiddenEntriesCount = value;
                saveSettingsDebounced();
            }
            return;
        }
    }, 1000));
}

/**
 * Handle settings popup close
 */
function handleSettingsPopupClose(popup) {
    try {
        const popupElement = popup.dlg;
        const settings = initializeSettings();
        
        // Save checkbox states
        const alwaysUseDefault = popupElement.querySelector('#stmb-always-use-default')?.checked ?? settings.moduleSettings.alwaysUseDefault;
        const showMemoryPreviews = popupElement.querySelector('#stmb-show-memory-previews')?.checked ?? settings.moduleSettings.showMemoryPreviews;
        const showNotifications = popupElement.querySelector('#stmb-show-notifications')?.checked ?? settings.moduleSettings.showNotifications;
        const refreshEditor = popupElement.querySelector('#stmb-refresh-editor')?.checked ?? settings.moduleSettings.refreshEditor;
        const allowSceneOverlap = popupElement.querySelector('#stmb-allow-scene-overlap')?.checked ?? settings.moduleSettings.allowSceneOverlap;
        const autoHideMode = popupElement.querySelector('#stmb-auto-hide-mode')?.value ?? getAutoHideMode(settings.moduleSettings);
        
        // Save token warning threshold
        const tokenWarningThresholdInput = popupElement.querySelector('#stmb-token-warning-threshold');
        const tokenWarningThreshold = tokenWarningThresholdInput ? 
            parseInt(tokenWarningThresholdInput.value) || 30000 : 
            settings.moduleSettings.tokenWarningThreshold || 30000;

        // Save default memory count
        const defaultMemoryCountInput = popupElement.querySelector('#stmb-default-memory-count');
        const defaultMemoryCount = defaultMemoryCountInput ? 
            parseInt(defaultMemoryCountInput.value) || 0 : 
            settings.moduleSettings.defaultMemoryCount || 0;

        // Save unhidden entries count
        const unhiddenEntriesCountInput = popupElement.querySelector('#stmb-unhidden-entries-count');
        const unhiddenEntriesCount = unhiddenEntriesCountInput ? 
            parseInt(unhiddenEntriesCountInput.value) || 0 : 
            settings.moduleSettings.unhiddenEntriesCount || 0;

        const manualModeEnabled = popupElement.querySelector('#stmb-manual-mode-enabled')?.checked ?? settings.moduleSettings.manualModeEnabled;

        // Save auto-summary settings
        const autoSummaryEnabled = popupElement.querySelector('#stmb-auto-summary-enabled')?.checked ?? settings.moduleSettings.autoSummaryEnabled;
        const autoSummaryIntervalInput = popupElement.querySelector('#stmb-auto-summary-interval');
        const autoSummaryInterval = autoSummaryIntervalInput ?
            parseInt(autoSummaryIntervalInput.value) || 50 :
            settings.moduleSettings.autoSummaryInterval || 50;

        const hasChanges = alwaysUseDefault !== settings.moduleSettings.alwaysUseDefault ||
                          showMemoryPreviews !== settings.moduleSettings.showMemoryPreviews ||
                          showNotifications !== settings.moduleSettings.showNotifications ||
                          refreshEditor !== settings.moduleSettings.refreshEditor ||
                          tokenWarningThreshold !== settings.moduleSettings.tokenWarningThreshold ||
                          defaultMemoryCount !== settings.moduleSettings.defaultMemoryCount ||
                          manualModeEnabled !== settings.moduleSettings.manualModeEnabled ||
                          allowSceneOverlap !== settings.moduleSettings.allowSceneOverlap ||
                          autoHideMode !== getAutoHideMode(settings.moduleSettings) ||
                          unhiddenEntriesCount !== settings.moduleSettings.unhiddenEntriesCount ||
                          autoSummaryEnabled !== settings.moduleSettings.autoSummaryEnabled ||
                          autoSummaryInterval !== settings.moduleSettings.autoSummaryInterval;
        
        if (hasChanges) {
            settings.moduleSettings.alwaysUseDefault = alwaysUseDefault;
            settings.moduleSettings.showMemoryPreviews = showMemoryPreviews;
            settings.moduleSettings.showNotifications = showNotifications;
            settings.moduleSettings.refreshEditor = refreshEditor;
            settings.moduleSettings.tokenWarningThreshold = tokenWarningThreshold;
            settings.moduleSettings.defaultMemoryCount = defaultMemoryCount;
            settings.moduleSettings.manualModeEnabled = manualModeEnabled;
            settings.moduleSettings.allowSceneOverlap = allowSceneOverlap;
            settings.moduleSettings.autoHideMode = autoHideMode;
            // Clear old boolean settings for clean migration
            delete settings.moduleSettings.autoHideAllMessages;
            delete settings.moduleSettings.autoHideLastMemory;
            settings.moduleSettings.unhiddenEntriesCount = unhiddenEntriesCount;
            settings.moduleSettings.autoSummaryEnabled = autoSummaryEnabled;
            settings.moduleSettings.autoSummaryInterval = autoSummaryInterval;
            saveSettingsDebounced();
        }
    } catch (error) {
        console.error('STMemoryBooks: Failed to save settings:', error);
        toastr.warning('Failed to save settings. Please try again.', 'STMemoryBooks');
    }
    currentPopupInstance = null;
}

/**
 * Refresh popup content while preserving popup properties
 */
function refreshPopupContent() {
    if (!currentPopupInstance || !currentPopupInstance.dlg.hasAttribute('open')) {
        return;
    }
    
    try {
        const settings = initializeSettings();
        const sceneData = getSceneData();
        const selectedProfile = settings.profiles[settings.defaultProfile];
        const sceneMarkers = getSceneMarkers();

        // Get current lorebook information
        const isManualMode = settings.moduleSettings.manualModeEnabled;
        const chatBoundLorebook = chat_metadata?.[METADATA_KEY] || null;
        const manualLorebook = sceneMarkers?.manualLorebook || null;

        const templateData = {
            hasScene: !!sceneData,
            sceneData: sceneData,
            highestMemoryProcessed: sceneMarkers?.highestMemoryProcessed,
            alwaysUseDefault: settings.moduleSettings.alwaysUseDefault,
            showMemoryPreviews: settings.moduleSettings.showMemoryPreviews,
            showNotifications: settings.moduleSettings.showNotifications,
            refreshEditor: settings.moduleSettings.refreshEditor,
            allowSceneOverlap: settings.moduleSettings.allowSceneOverlap,
            manualModeEnabled: settings.moduleSettings.manualModeEnabled,

            // Lorebook status information
            lorebookMode: isManualMode ? 'Manual' : 'Automatic (Chat-bound)',
            currentLorebookName: isManualMode ? manualLorebook : chatBoundLorebook,
            manualLorebookName: manualLorebook,
            chatBoundLorebookName: chatBoundLorebook,
            availableLorebooks: world_names || [],
            autoHideMode: getAutoHideMode(settings.moduleSettings),
            unhiddenEntriesCount: settings.moduleSettings.unhiddenEntriesCount || 0,
            tokenWarningThreshold: settings.moduleSettings.tokenWarningThreshold || 30000,
            defaultMemoryCount: settings.moduleSettings.defaultMemoryCount || 0,
            autoSummaryEnabled: settings.moduleSettings.autoSummaryEnabled || false,
            autoSummaryInterval: settings.moduleSettings.autoSummaryInterval || 50,
            profiles: settings.profiles.map((profile, index) => ({
                ...profile,
                isDefault: index === settings.defaultProfile
            })),
            titleFormat: settings.titleFormat,
            titleFormats: getDefaultTitleFormats().map(format => ({
                value: format,
                isSelected: format === settings.titleFormat
            })),
            showCustomInput: !getDefaultTitleFormats().includes(settings.titleFormat),
            selectedProfile: {
                ...selectedProfile,
                connection: selectedProfile.useDynamicSTSettings ?
                    (() => {
                        const currentApiInfo = getCurrentApiInfo();
                        const currentSettings = getCurrentModelSettings();
                        return {
                            api: currentApiInfo.completionSource || 'openai',
                            model: currentSettings.model || 'Not Set',
                            temperature: currentSettings.temperature || 0.7
                        };
                    })() : {
                        api: selectedProfile.connection?.api || 'openai',
                        model: selectedProfile.connection?.model || 'gpt-4.1',
                        temperature: selectedProfile.connection?.temperature !== undefined ? selectedProfile.connection.temperature : 0.7
                    },
                titleFormat: selectedProfile.titleFormat || settings.titleFormat,
                effectivePrompt: getEffectivePrompt(selectedProfile)
            }
        };
        
        const newHtml = DOMPurify.sanitize(settingsTemplate(templateData));

        // Update the popup content directly
        currentPopupInstance.content.innerHTML = newHtml;

        // After updating content, refresh the profile dropdown selection
        const profileSelect = currentPopupInstance.content.querySelector('#stmb-profile-select');
        if (profileSelect) {
            profileSelect.value = settings.defaultProfile;
            // Trigger change event to update profile summary
            profileSelect.dispatchEvent(new Event('change'));
        }

        const requiredClasses = [
            'wide_dialogue_popup',
            'large_dialogue_popup',
            'vertical_scrolling_dialogue_popup'
        ];
        currentPopupInstance.dlg.classList.add(...requiredClasses);
        currentPopupInstance.content.style.overflowY = 'auto';

        // Repopulate profile buttons after content refresh
        populateInlineButtons();

    } catch (error) {
        console.error('STMemoryBooks: Error refreshing popup content:', error);
    }
}

/**
 * Process existing messages and use full update (for chat loads)
 */
function processExistingMessages() {
    const messageElements = document.querySelectorAll('#chat .mes[mesid]');

    if (messageElements.length > 0) {
        let buttonsAdded = 0;
        messageElements.forEach(messageElement => {
            // Check if buttons are already there to prevent duplication
            if (!messageElement.querySelector('.mes_stmb_start')) {
                createSceneButtons(messageElement);
                buttonsAdded++;
            }
        });

        // Full update needed for chat loads
        updateAllButtonStates();
    }
}

/**
 * Register slash commands using proper SlashCommand classes
 */
function registerSlashCommands() {
    const createMemoryCmd = SlashCommand.fromProps({
        name: 'creatememory',
        callback: handleCreateMemoryCommand,
        helpString: 'Create memory from marked scene'
    });
    
    const sceneMemoryCmd = SlashCommand.fromProps({
        name: 'scenememory', 
        callback: handleSceneMemoryCommand,
        helpString: 'Set scene range and create memory (e.g., /scenememory 10-15)',
        unnamedArgumentList: [
            SlashCommandArgument.fromProps({
                description: 'Message range (X-Y format)',
                typeList: [ARGUMENT_TYPE.STRING],
                isRequired: true
            })
        ]
    });
    
    const nextMemoryCmd = SlashCommand.fromProps({
        name: 'nextmemory',
        callback: handleNextMemoryCommand,
        helpString: 'Create memory from end of last memory to current message'
    });

    SlashCommandParser.addCommandObject(createMemoryCmd);
    SlashCommandParser.addCommandObject(sceneMemoryCmd);
    SlashCommandParser.addCommandObject(nextMemoryCmd);
}

/**
 * Create main menu UI
 */
function createUI() {
    const menuItem = $(`
        <div id="stmb-menu-item-container" class="extension_container interactable" tabindex="0">            
            <div id="stmb-menu-item" class="list-group-item flex-container flexGap5 interactable" tabindex="0">
                <div class="fa-fw fa-solid fa-book extensionsMenuExtensionButton"></div>
                <span>Memory Books</span>
            </div>
        </div>
    `);
    
    
    const extensionsMenu = $('#extensionsMenu');
    if (extensionsMenu.length > 0) {
        extensionsMenu.append(menuItem);
    } else {
        console.warn('STMemoryBooks: Extensions menu not found - retrying initialization');
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    $(document).on('click', SELECTORS.menuItem, showSettingsPopup);
    
    eventSource.on(event_types.CHAT_CHANGED, handleChatChanged);
    eventSource.on(event_types.CHAT_LOADED, handleChatLoaded);
    eventSource.on(event_types.MESSAGE_DELETED, (deletedId) => {
        const settings = initializeSettings();
        handleMessageDeletion(deletedId, settings);
    });
    eventSource.on(event_types.MESSAGE_RECEIVED, handleMessageReceived);
    eventSource.on(event_types.GROUP_WRAPPER_FINISHED, handleGroupWrapperFinished);
    
    // API change handlers for settings management
    $(document).on('change', `${SELECTORS.mainApi}, ${SELECTORS.completionSource}`, function() {
        console.log(`${MODULE_NAME}: API change detected`);
        handleExtensionStateChange();
    });

    // Model settings change handlers
    const modelSelectors = Object.values(SELECTORS).filter(selector =>
        selector.includes('model_') || selector.includes('temp_')
    ).join(', ');


    eventSource.on(event_types.GENERATE_AFTER_DATA, (generate_data) => {
        if (isProcessingMemory && currentProfile) {
            const conn = currentProfile.effectiveConnection || currentProfile.connection || {};
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
                nanogpt: 'nanogpt',
                deepseek: 'deepseek',
                electronhub: 'electronhub',
                aimlapi: 'aimlapi',
                xai: 'xai',
                pollinations: 'pollinations',
                moonshot: 'moonshot',
                fireworks: 'fireworks',
                cometapi: 'cometapi',
                azure_openai: 'azure_openai',
            };
            const src = apiToSource[conn.api] || 'openai';

            // Force source/model/temp
            generate_data.chat_completion_source = src;

            // Disable thinking mode for memory generation
            generate_data.include_reasoning = false;

            if (conn.model) {
                generate_data.model = conn.model;
            }
            if (typeof conn.temperature === 'number') {
                generate_data.temperature = conn.temperature;
            }

            // Defeat model/temp locks
            generate_data.bypass_mtlock = true;
            generate_data.force_model = true;
        }
    });
    
    window.addEventListener('beforeunload', cleanupChatObserver);
}

/**
 * Initialize the extension with BULLETPROOF settings management
 */
async function init() {
    if (hasBeenInitialized) return;
    hasBeenInitialized = true;
    console.log('STMemoryBooks: Initializing');
    // Wait for SillyTavern to be ready
    let attempts = 0;
    const maxAttempts = 20;
    
    while (attempts < maxAttempts) {
        if ($(SELECTORS.extensionsMenu).length > 0 && eventSource && typeof Popup !== 'undefined') {
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
    }

    // Create UI now that extensions menu is available
    createUI();

    // Check initial API compatibility
    checkApiCompatibility();
    
    // Initialize settings with validation
    const settings = initializeSettings();
    const profileValidation = validateAndFixProfiles(settings);
    
    if (!profileValidation.valid) {
        console.warn('STMemoryBooks: Profile validation issues found:', profileValidation.issues);
        if (profileValidation.fixes.length > 0) {
            saveSettingsDebounced();
        }
    }
    
    // Initialize scene state
    updateSceneStateCache();
    
    // Initialize chat observer
    try {
        initializeChatObserver();
    } catch (error) {
        console.error('STMemoryBooks: Failed to initialize chat observer:', error);
        toastr.error('STMemoryBooks: Failed to initialize chat monitoring. Please refresh the page.', 'STMemoryBooks');
        return;
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Register slash commands
    registerSlashCommands();

    // Process any messages that are already on the screen at initialization time
    // This handles cases where a chat is already loaded when the extension initializes
    try {
        processExistingMessages();
        console.log('STMemoryBooks: Processed existing messages during initialization');
    } catch (error) {
        console.error('STMemoryBooks: Error processing existing messages during init:', error);
    }
    
    // Add CSS classes helper for Handlebars
    Handlebars.registerHelper('eq', function(a, b) {
        return a === b;
    });
    
    console.log('STMemoryBooks: Extension loaded successfully');
}

// Initialize when ready
$(document).ready(() => {
    if (eventSource && event_types.APP_READY) {
        eventSource.on(event_types.APP_READY, init);
    }    
    // Fallback initialization
    setTimeout(init, 2000);    
});