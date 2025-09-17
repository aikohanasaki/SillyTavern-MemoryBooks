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
import { loadBookmarks, saveBookmarks, createBookmark, updateBookmark, deleteBookmark, validateBookmarks, shiftBookmarksAfterDeletion, showBookmarksPopup } from './bookmarkManager.js';
import { settingsTemplate } from './templates.js';
import { showConfirmationPopup, fetchPreviousSummaries, showMemoryPreviewPopup } from './confirmationPopup.js';
import { getEffectivePrompt, DEFAULT_PROMPT, deepClone, getCurrentModelSettings, getCurrentApiInfo, SELECTORS, getCurrentMemoryBooksContext, getEffectiveLorebookName } from './utils.js';
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
 * Chat loaded handler with conversion logging
 */
function handleChatLoaded() {
    console.log(`${MODULE_NAME}: === CHAT LOADED EVENT ===`);
    console.log(`${MODULE_NAME}: Chat loaded event received, processing messages.`);
    console.log(`${MODULE_NAME}: Current chat metadata:`, chat_metadata);
    console.log(`${MODULE_NAME}: METADATA_KEY value:`, METADATA_KEY);
    console.log(`${MODULE_NAME}: Lorebook from metadata:`, chat_metadata[METADATA_KEY]);
    
    updateSceneStateCache();
    processExistingMessages();
}

async function handleMessageReceived() {
    setTimeout(validateSceneMarkers, 500);
    if (extension_settings.STMemoryBooks.moduleSettings.autoSummaryEnabled) {
        const currentMessageCount = chat.length;
        const checkInterval = 2; // Check every 2 messages
        if (currentMessageCount % checkInterval === 0) {
            await checkAutoSummaryTrigger();
        }
    }
}

/**
 * Check if auto-summary should be triggered based on message difference
 */
async function checkAutoSummaryTrigger() {
    // Check if user has postponed auto-summary
    const stmbData = getSceneMarkers() || {};
    if (stmbData.autoSummaryNextPromptAt && chat.length < stmbData.autoSummaryNextPromptAt) {
        return; // Still in postpone period
    }

    const lorebookValidation = await validateLorebookForAutoSummary();
    if (!lorebookValidation.valid) {
        return; // No lorebook available or user cancelled
    }

    // Clear any postpone flag since we're proceeding with auto-summary
    if (stmbData.autoSummaryNextPromptAt) {
        delete stmbData.autoSummaryNextPromptAt;
        saveMetadataForCurrentContext();
    }

    // Use the highestMemoryProcessed field for more efficient tracking
    const currentLastMessage = chat.length - 1;
    const requiredInterval = extension_settings.STMemoryBooks.moduleSettings.autoSummaryInterval;
    const highestProcessed = stmbData.highestMemoryProcessed;

    let messagesSinceLastMemory;

    if (highestProcessed === null) {
        // No memories processed yet - check if we have enough messages for the first memory
        messagesSinceLastMemory = currentLastMessage + 1; // +1 because message indices are 0-based
    } else {
        // Calculate messages since the highest processed message
        messagesSinceLastMemory = currentLastMessage - highestProcessed;
    }

    if (messagesSinceLastMemory >= requiredInterval) {
        // Check if memory creation is already in progress
        if (isProcessingMemory) {
            return;
        }

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
                    await handleNextMemoryCommand({}, '');
                }
            } catch (error) {
                toastr.warning(`Auto-summary failed: ${error.message}`, 'STMemoryBooks');
            }
        }, 1000);
    }
}

/**
 * Slash command handlers
 */
function handleCreateMemoryCommand(namedArgs, unnamedArgs) {
    const sceneData = getSceneData();
    if (!sceneData) {
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
    
    // Validate range logic
    if (startId >= endId) {
        toastr.error('Start message must be less than end message', 'STMemoryBooks');
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
    
    // Clear existing scene first to reset state
    clearScene();
    
    // Set new scene markers
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
        
        if (nextStart >= nextEnd) {
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
 * Bookmark slash command handlers
 */
function handleBookmarkSetCommand(namedArgs, unnamedArgs) {
    const args = String(unnamedArgs || '').trim().split(/\s+/);
    
    if (args.length < 2) {
        toastr.error('Usage: /bookmarkset <message_number> <title>', 'STMemoryBooks');
        return '';
    }
    
    const messageNum = parseInt(args[0]);
    if (isNaN(messageNum) || messageNum < 0) {
        toastr.error('Invalid message number', 'STMemoryBooks');
        return '';
    }
    
    if (messageNum >= chat.length) {
        toastr.error('Message number does not exist', 'STMemoryBooks');
        return '';
    }
    
    if (chat.length === 0) {
        toastr.error('No messages available to bookmark', 'STMemoryBooks');
        return '';
    }
    
    const title = args.slice(1).join(' ');
    if (!title) {
        toastr.error('Title is required', 'STMemoryBooks');
        return '';
    }
    
    // Create bookmark asynchronously
    createBookmark(messageNum, title).then(result => {
        if (result.success) {
            toastr.success(`Bookmark "${messageNum} - ${title}" created`, 'STMemoryBooks');
        } else {
            toastr.error(result.error, 'STMemoryBooks');
        }
    }).catch(error => {
        toastr.error(`Failed to create bookmark: ${error.message}`, 'STMemoryBooks');
    });
    
    return '';
}

function handleBookmarkListCommand(namedArgs, unnamedArgs) {
    showBookmarksPopup();
    return '';
}

async function handleBookmarkGoCommand(namedArgs, unnamedArgs) {
    const arg = String(unnamedArgs || '').trim();
    
    if (!arg) {
        toastr.error('Usage: /bookmarkgo <title_or_message_number>', 'STMemoryBooks');
        return '';
    }
    
    try {
        // Load bookmarks
        const loadResult = await loadBookmarks();
        if (!loadResult.success) {
            toastr.error(loadResult.error, 'STMemoryBooks');
            return '';
        }
        
        const bookmarks = loadResult.bookmarks;
        if (bookmarks.length === 0) {
            toastr.error('No bookmarks found', 'STMemoryBooks');
            return '';
        }
        
        let targetBookmark = null;
        
        // Try to find by message number first
        const messageNum = parseInt(arg);
        if (!isNaN(messageNum)) {
            targetBookmark = bookmarks.find(b => b.messageNum === messageNum);
        }
        
        // If not found by message number, try by title
        if (!targetBookmark) {
            targetBookmark = bookmarks.find(b => b.title.toLowerCase().includes(arg.toLowerCase()));
        }
        
        if (!targetBookmark) {
            toastr.error(`Bookmark not found: ${arg}`, 'STMemoryBooks');
            return '';
        }
        
        // Jump to the bookmark using async navigation
        if (targetBookmark.messageNum >= chat.length) {
            toastr.error(`Bookmark points to deleted message ${targetBookmark.messageNum}`, 'STMemoryBooks');
        } else {
            // Import and use the async navigation function from bookmarkManager
            try {
                const { navigateToBookmarkAsync } = await import('./bookmarkManager.js');
                await navigateToBookmarkAsync(targetBookmark.messageNum);
                toastr.success(`Jumped to bookmark: ${targetBookmark.messageNum} - ${targetBookmark.title}`, 'STMemoryBooks');
            } catch (error) {
                console.error('STMemoryBooks: Error with async navigation, falling back to regular navigation:', error);
                // Fallback to regular navigation
                executeSlashCommands(`/chat-jump ${targetBookmark.messageNum}`);
                toastr.info(`Jumped to bookmark: ${targetBookmark.messageNum} - ${targetBookmark.title}`, 'STMemoryBooks');
            }
        }
        
    } catch (error) {
        console.error('STMemoryBooks: Error in /bookmarkgo command:', error);
        toastr.error(`Failed to go to bookmark: ${error.message}`, 'STMemoryBooks');
    }
    
    return '';
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
        lorebookName = stmbData.manualLorebook;

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
        return { valid: false, error: 'No lorebook available' };
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
        if (retryCount > 0) {
            toastr.info(`Retrying memory creation (attempt ${retryCount + 1}/${maxRetries + 1})...`, 'STMemoryBooks');
        }
        
        toastr.info('Compiling scene messages...', 'STMemoryBooks');
        
        // Create and compile scene
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
            toastr.info(`Fetching ${summaryCount} previous memories for context...`, 'STMemoryBooks');
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
        
        // Add context and show progress
        compiledScene.previousSummariesContext = previousMemories;
        const stats = getSceneStats(compiledScene);
        const actualTokens = stats.estimatedTokens;
        const contextInfo = memoryFetchResult.actualCount > 0 ? 
            ` + ${memoryFetchResult.actualCount} context ${memoryFetchResult.actualCount === 1 ? 'memory' : 'memories'}` : '';
        toastr.info(`Compiled ${stats.messageCount} messages (~${actualTokens} tokens)${contextInfo}`, 'STMemoryBooks');
        
        // Generate memory using new JSON-based approach
        toastr.info('Generating memory with AI (JSON structured output)...', 'STMemoryBooks');
        const memoryResult = await createMemory(compiledScene, profileSettings, {
            tokenWarningThreshold: tokenThreshold
        });

        // Check if memory previews are enabled and handle accordingly
        let finalMemoryResult = memoryResult;

        if (settings.moduleSettings.showMemoryPreviews) {
            toastr.clear(); // Clear any previous notifications before showing preview
            toastr.info('Memory generated! Showing preview...', 'STMemoryBooks');

            const previewResult = await showMemoryPreviewPopup(memoryResult, sceneData, profileSettings);

            if (previewResult.action === 'cancel') {
                // User cancelled, abort the process
                toastr.info('Memory creation cancelled by user', 'STMemoryBooks');
                return;
            } else if (previewResult.action === 'retry') {
                // User wants to retry - reset retry count since this is a manual user action, not an error
                toastr.info('Retrying memory generation...', 'STMemoryBooks');
                return await executeMemoryGeneration(sceneData, lorebookValidation, effectiveSettings, 0);
            }

            // For 'accept' or 'edit' actions, use the potentially modified memory data
            finalMemoryResult = previewResult.memoryData || memoryResult;
        }

        // Add to lorebook
        toastr.info('Adding memory to lorebook...', 'STMemoryBooks');
        const addResult = await addMemoryToLorebook(finalMemoryResult, lorebookValidation);
        
        if (!addResult.success) {
            throw new Error(addResult.error || 'Failed to add memory to lorebook');
        }
        
        // Success notification
        const contextMsg = memoryFetchResult.actualCount > 0 ? 
            ` (with ${memoryFetchResult.actualCount} context ${memoryFetchResult.actualCount === 1 ? 'memory' : 'memories'})` : '';
        
        // Show success message immediately if this was a retry, otherwise delay slightly
        const successDelay = retryCount > 0 ? 0 : 1000;
        setTimeout(() => {
            const retryMsg = retryCount > 0 ? ` (succeeded on attempt ${retryCount + 1})` : '';
            toastr.success(`Memory "${addResult.entryTitle}" created from ${stats.messageCount} messages${contextMsg}${retryMsg}!`, 'STMemoryBooks');
        }, successDelay);
        
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
            toastr.error('No scene selected', 'STMemoryBooks');
            return;
        }
        
        const lorebookValidation = await validateLorebook();
        if (!lorebookValidation.valid) {
            toastr.error(lorebookValidation.error, 'STMemoryBooks');
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
                        toastr.error(`Scene overlaps with existing memory: "${mem.title}" (messages ${existingRange.start}-${existingRange.end})`, 'STMemoryBooks');
                        isProcessingMemory = false;
                        return;
                    }
                }
            }
        }
        
        const effectiveSettings = await showAndGetMemorySettings(sceneData, lorebookValidation, selectedProfileIndex);
        if (!effectiveSettings) {
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
 * Show main settings popup
 */
async function showSettingsPopup() {
    const settings = initializeSettings();
    const sceneData = getSceneData();
    const selectedProfile = settings.profiles[settings.defaultProfile];
    const sceneMarkers = getSceneMarkers();
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
    
    const customButtons = [
        {
            text: '🧠 Create Memory',
            result: null,
            classes: ['menu_button'],
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
            classes: ['menu_button'],
            action: () => {
                clearScene();
                refreshPopupContent();
            }
        }
    ];
    
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
        
        // Profile management buttons
        if (e.target.matches('#stmb-set-default-profile')) {
            e.preventDefault();
            const profileSelect = popupElement.querySelector('#stmb-profile-select');
            const selectedIndex = parseInt(profileSelect.value);

            if (selectedIndex === settings.defaultProfile) {
                return;
            }

            settings.defaultProfile = selectedIndex;
            saveSettingsDebounced();
            toastr.success(`"${settings.profiles[selectedIndex].name}" is now the default profile.`, 'STMemoryBooks');
            refreshPopupContent();
            return;
        }
        
        if (e.target.matches('#stmb-edit-profile')) {
            e.preventDefault();
            try {
                const profileSelect = popupElement.querySelector('#stmb-profile-select');
                const selectedIndex = parseInt(profileSelect.value);
                const selectedProfile = settings.profiles[selectedIndex];

                // Prevent editing of dynamic ST settings profile
                if (selectedProfile.useDynamicSTSettings) {
                    toastr.error('Cannot edit the "Current SillyTavern Settings" profile - it automatically uses your current ST configuration', 'STMemoryBooks');
                    return;
                }

                await editProfile(settings, selectedIndex, refreshPopupContent);
            } catch (error) {
                console.error(`${MODULE_NAME}: Error in edit profile:`, error);
                toastr.error('Failed to edit profile', 'STMemoryBooks');
            }
            return;
        }
        
        if (e.target.matches('#stmb-new-profile')) {
            e.preventDefault();
            try {
                await newProfile(settings, refreshPopupContent);
            } catch (error) {
                console.error(`${MODULE_NAME}: Error in new profile:`, error);
                toastr.error('Failed to create profile', 'STMemoryBooks');
            }
            return;
        }
        
        if (e.target.matches('#stmb-delete-profile')) {
            e.preventDefault();
            try {
                const profileSelect = popupElement.querySelector('#stmb-profile-select');
                const selectedIndex = parseInt(profileSelect.value);
                await deleteProfile(settings, selectedIndex, refreshPopupContent);
            } catch (error) {
                console.error(`${MODULE_NAME}: Error in delete profile:`, error);
                toastr.error('Failed to delete profile', 'STMemoryBooks');
            }
            return;
        }
        
        if (e.target.matches('#stmb-export-profiles')) {
            e.preventDefault();
            try {
                exportProfiles(settings);
            } catch (error) {
                console.error(`${MODULE_NAME}: Error in export profiles:`, error);
                toastr.error('Failed to export profiles', 'STMemoryBooks');
            }
            return;
        }
        
        if (e.target.matches('#stmb-import-profiles')) {
            e.preventDefault();
            popupElement.querySelector('#stmb-import-file')?.click();
            return;
        }
    });
    
    // Handle change events using delegation
    popupElement.addEventListener('change', (e) => {
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
            settings.moduleSettings.manualModeEnabled = e.target.checked;
            saveSettingsDebounced();
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

    const bookmarkSetCmd = SlashCommand.fromProps({
        name: 'bookmarkset',
        callback: handleBookmarkSetCommand,
        helpString: 'Create a bookmark (e.g., /bookmarkset 10 Epic Battle)',
        unnamedArgumentList: [
            SlashCommandArgument.fromProps({
                description: 'Message number and title',
                typeList: [ARGUMENT_TYPE.STRING],
                isRequired: true
            })
        ]
    });

    const bookmarkListCmd = SlashCommand.fromProps({
        name: 'bookmarklist',
        callback: handleBookmarkListCommand,
        helpString: 'Show bookmarks list'
    });

    const bookmarkGoCmd = SlashCommand.fromProps({
        name: 'bookmarkgo',
        callback: handleBookmarkGoCommand,
        helpString: 'Jump to a bookmark by title or message number',
        unnamedArgumentList: [
            SlashCommandArgument.fromProps({
                description: 'Bookmark title or message number',
                typeList: [ARGUMENT_TYPE.STRING],
                isRequired: true
            })
        ]
    });
    
    SlashCommandParser.addCommandObject(createMemoryCmd);
    SlashCommandParser.addCommandObject(sceneMemoryCmd);
    SlashCommandParser.addCommandObject(nextMemoryCmd);
    SlashCommandParser.addCommandObject(bookmarkSetCmd);
    SlashCommandParser.addCommandObject(bookmarkListCmd);
    SlashCommandParser.addCommandObject(bookmarkGoCmd);
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
    
    const bookmarksMenuItem = $(`
        <div id="stmb-bookmarks-menu-item-container" class="extension_container interactable" tabindex="0">            
            <div id="stmb-bookmarks-menu-item" class="list-group-item flex-container flexGap5 interactable" tabindex="0">
                <div class="fa-fw fa-solid fa-bookmark extensionsMenuExtensionButton"></div>
                <span>Bookmarks</span>
            </div>
        </div>
    `);
    
    $('#extensionsMenu').append(menuItem);
    $('#extensionsMenu').append(bookmarksMenuItem);
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    $(document).on('click', SELECTORS.menuItem, showSettingsPopup);
    $(document).on('click', SELECTORS.bookmarksMenuItem, showBookmarksPopup);
    
    eventSource.on(event_types.CHAT_CHANGED, handleChatChanged);
    eventSource.on(event_types.CHAT_LOADED, handleChatLoaded);
    eventSource.on(event_types.MESSAGE_DELETED, (deletedId) => {
        const settings = initializeSettings();
        handleMessageDeletion(deletedId, settings);
        // Handle bookmark shifting for deleted messages
        shiftBookmarksAfterDeletion(deletedId).catch(error => {
            console.error('STMemoryBooks: Error shifting bookmarks after deletion:', error);
        });
    });
    eventSource.on(event_types.MESSAGE_RECEIVED, handleMessageReceived);
    
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
    
    // Create UI
    createUI();
    
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