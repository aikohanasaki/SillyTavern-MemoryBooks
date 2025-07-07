import { eventSource, event_types, chat, chat_metadata, saveSettingsDebounced, characters, this_chid, name1, name2 } from '../../../../script.js';
import { Popup, POPUP_TYPE, POPUP_RESULT } from '../../../popup.js';
import { extension_settings, saveMetadataDebounced, getContext } from '../../../extensions.js';
import { SlashCommandParser } from '../../../slash-commands/SlashCommandParser.js';
import { SlashCommand } from '../../../slash-commands/SlashCommand.js';
import { ARGUMENT_TYPE, SlashCommandArgument } from '../../../slash-commands/SlashCommandArgument.js';
import { METADATA_KEY, world_names, loadWorldInfo } from '../../../world-info.js';
import { lodash, moment, Handlebars, DOMPurify, morphdom } from '../../../../lib.js';
import { compileScene, createSceneRequest, estimateTokenCount, validateCompiledScene, getSceneStats } from './chatcompile.js';
import { createMemory } from './stmemory.js';
import { addMemoryToLorebook, getDefaultTitleFormats } from './addlore.js';
import { editProfile, newProfile, deleteProfile, exportProfiles, importProfiles, validateAndFixProfiles } from './profileManager.js';
import { getSceneMarkers, setSceneMarker, clearScene, updateAllButtonStates, updateNewMessageButtonStates, validateSceneMarkers, handleMessageDeletion, createSceneButtons, getSceneData, updateSceneStateCache, getCurrentSceneState } from './sceneManager.js';
import { settingsTemplate } from './templates.js';
import { showConfirmationPopup, fetchPreviousSummaries, calculateTokensWithContext } from './confirmationPopup.js';
import { getEffectivePrompt, getPresetPrompt, DEFAULT_PROMPT, deepClone, getCurrentModelSettings, getCurrentApiInfo, SELECTORS } from './utils.js';
import { showConverterPopup, shouldSkipConversionPrompt } from './convertmemory.js';

const MODULE_NAME = 'STMemoryBooks';
let hasBeenInitialized = false; 

const defaultSettings = {
    moduleSettings: {
        alwaysUseDefault: true,
        showNotifications: true,
        refreshEditor: true,
        tokenWarningThreshold: 30000,
        defaultMemoryCount: 0,
    },
    titleFormat: '[000] - Auto Memory',
    profiles: [
        {
            name: "Default",
            connection: {},
            prompt: DEFAULT_PROMPT
        }
    ],
    defaultProfile: 0,
    migrationVersion: 2,
    convertDontAskAgain: {} // Track which lorebooks user doesn't want to convert

// Current state variables
let currentPopupInstance = null;
let isProcessingMemory = false;

// MutationObserver for chat message monitoring
let chatObserver = null;
let updateTimeout = null;

/**
 * PERFORMANCE OPTIMIZED: Process messages and return processed elements
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
 * PERFORMANCE OPTIMIZED: Chat observer with partial updates
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
                    // PERFORMANCE: Use partial update for new messages only
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

/**
 * Initialize and validate extension settings
 */
function initializeSettings() {
    extension_settings.STMemoryBooks = extension_settings.STMemoryBooks || deepClone(defaultSettings);
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
 * Check if the current lorebook needs conversion and prompt user if needed
 * This runs automatically when a chat is loaded to help users upgrade their lorebooks
 */
async function checkAndPromptForConversion() {
    const lorebookName = chat_metadata[METADATA_KEY];

    // Exit early if no lorebook is bound
    if (!lorebookName || !world_names || !world_names.includes(lorebookName)) {
        return;
    }

    // Respect user's "don't ask again" preference
    if (shouldSkipConversionPrompt(lorebookName)) {
        console.log(`STMemoryBooks: Skipping conversion prompt for "${lorebookName}" per user preference`);
        return;
    }

    try {
        const lorebookData = await loadWorldInfo(lorebookName);

        // Exit if lorebook can't be loaded or has no entries
        if (!lorebookData || !lorebookData.entries || Object.keys(lorebookData.entries).length === 0) {
            return;
        }

        // Check if any entries already have the STMemoryBooks flag
        const hasStmbEntries = Object.values(lorebookData.entries).some(entry => entry.stmemorybooks === true);

        // If no entries have the flag, this lorebook needs conversion
        if (!hasStmbEntries) {
            console.log(`STMemoryBooks: Detected lorebook "${lorebookName}" without STMemoryBooks flags. Prompting for conversion.`);
            
            const popupContent = `
                <div class="info-block warning marginBot10">
                    <span><strong>Critical:</strong> Without conversion, memory entries will NOT be detected and will stop working entirely.</span>
                </div>
                <p>The attached lorebook <b>"${lorebookName}"</b> appears to contain entries that may be STMemoryBooks memories, but they're using the old detection system.</p>
                <p><strong>Conversion is required</strong> for memory entries to function. The new system uses a reliable flag-based approach instead of fragile title parsing.</p>
                <p><strong>This conversion is mandatory</strong> to ensure all memory features work correctly.</p>
            `;
            
            const result = await new Popup(popupContent, POPUP_TYPE.CONFIRM, '🔧 Mandatory Lorebook Conversion', {
                okButton: 'Convert Now (Required)',
                cancelButton: 'Skip (Memories Will Not Work)'
            }).show();

            if (result === POPUP_RESULT.AFFIRMATIVE) {
                await showConverterPopup(lorebookName);
            }
        } else {
            console.log(`STMemoryBooks: Lorebook "${lorebookName}" already has STMemoryBooks flags, no conversion needed`);
        }
    } catch (error) {
        console.error(`${MODULE_NAME}: Error during conversion check:`, error);
        // Don't show error to user unless it's critical - this is a background check
    }
}

/**
 * Validate lorebook and return status with data
 */
async function validateLorebook() {
    const lorebookName = chat_metadata[METADATA_KEY];
    if (!lorebookName) {
        return { valid: false, error: 'No lorebook bound to this chat' };
    }
    
    if (!world_names || !world_names.includes(lorebookName)) {
        return { valid: false, error: 'Bound lorebook not found' };
    }
    
    try {
        const lorebookData = await loadWorldInfo(lorebookName);
        return { valid: !!lorebookData, data: lorebookData, name: lorebookName };
    } catch (error) {
        return { valid: false, error: 'Failed to load lorebook' };
    }
}

/**
 * Extract and validate settings from confirmation popup or defaults
 */
async function showAndGetMemorySettings(sceneData, lorebookValidation) {
    const settings = initializeSettings();
    const tokenThreshold = settings.moduleSettings.tokenWarningThreshold || 30000;
    const shouldShowConfirmation = !settings.moduleSettings.alwaysUseDefault || 
                                  sceneData.estimatedTokens > tokenThreshold;
    
    let confirmationResult = null;
    
    if (shouldShowConfirmation) {
        // Show simplified confirmation popup
        confirmationResult = await showConfirmationPopup(
            sceneData, 
            settings, 
            getCurrentModelSettings(), 
            getCurrentApiInfo(), 
            chat_metadata
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
    
    if (advancedOptions.overrideSettings) {
        const currentSettings = getCurrentModelSettings();
        profileSettings.effectiveConnection = { ...profileSettings.connection };
        if (currentSettings.model) {
            profileSettings.effectiveConnection.model = currentSettings.model;
        }
        if (typeof currentSettings.temperature === 'number') {
            profileSettings.effectiveConnection.temperature = currentSettings.temperature;
        }
        console.log('STMemoryBooks: Using current SillyTavern settings for memory creation');
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
 * Execute the core memory generation process - now with retry logic
 */
async function executeMemoryGeneration(sceneData, lorebookValidation, effectiveSettings, retryCount = 0) {
    const { profileSettings, summaryCount, tokenThreshold, settings } = effectiveSettings;
    const maxRetries = 2; // Allow up to 2 retries (3 total attempts)
    
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
        const actualTokens = estimateTokenCount(compiledScene);
        const contextInfo = memoryFetchResult.actualCount > 0 ? 
            ` + ${memoryFetchResult.actualCount} context ${memoryFetchResult.actualCount === 1 ? 'memory' : 'memories'}` : '';
        toastr.info(`Compiled ${stats.messageCount} messages (~${actualTokens} tokens)${contextInfo}`, 'STMemoryBooks');
        
        // Generate memory using new JSON-based approach
        toastr.info('Generating memory with AI (JSON structured output)...', 'STMemoryBooks');
        const memoryResult = await createMemory(compiledScene, profileSettings, {
            tokenWarningThreshold: tokenThreshold
        });
        
        // Add to lorebook
        toastr.info('Adding memory to lorebook...', 'STMemoryBooks');
        const addResult = await addMemoryToLorebook(memoryResult, lorebookValidation);
        
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

/**
 * Enhanced memory creation initiation with improved error handling
 */
async function initiateMemoryCreation() {
    // Early validation checks (no flag set yet)
    if (!characters || characters.length === 0 || !characters[this_chid]) {
        toastr.error('SillyTavern is still loading character data, please wait a few seconds and try again.', 'STMemoryBooks');
        return;
    }
    
    if (isProcessingMemory) {
        toastr.warning('Memory creation already in progress', 'STMemoryBooks');
        return;
    }

    // Set processing flag immediately after validation
    isProcessingMemory = true;
    
    try {
        // Validate that toastr is available (defensive programming)
        if (typeof toastr === 'undefined') {
            console.error('STMemoryBooks: toastr is not available');
            throw new Error('Notification system not available');
        }

        // All the validation and processing logic
        const sceneData = getSceneData();
        if (!sceneData) {
            toastr.error('No scene selected', 'STMemoryBooks');
            return; // Will hit finally block
        }
        
        const lorebookValidation = await validateLorebook();
        if (!lorebookValidation.valid) {
            toastr.error(lorebookValidation.error, 'STMemoryBooks');
            return; // Will hit finally block
        }
        
        const effectiveSettings = await showAndGetMemorySettings(sceneData, lorebookValidation);
        if (!effectiveSettings) {
            return; // User cancelled, will hit finally block
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
 * Show main settings popup
 */
async function showSettingsPopup() {
    const settings = initializeSettings();
    const sceneData = getSceneData();
    
    const templateData = {
        hasScene: !!sceneData,
        sceneData: sceneData,
        alwaysUseDefault: settings.moduleSettings.alwaysUseDefault,
        showNotifications: settings.moduleSettings.showNotifications,
        refreshEditor: settings.moduleSettings.refreshEditor,
        tokenWarningThreshold: settings.moduleSettings.tokenWarningThreshold || 30000,
        defaultMemoryCount: settings.moduleSettings.defaultMemoryCount || 0,
        profiles: settings.profiles.map((profile, index) => ({
            ...profile,
            isDefault: index === settings.defaultProfile
        })),
        titleFormat: settings.titleFormat,
        titleFormats: getDefaultTitleFormats().map(format => ({
            value: format,
            isSelected: format === settings.titleFormat
        })),
        showCustomInput: !getDefaultTitleFormats().includes(settings.titleFormat)
    };

    const content = DOMPurify.sanitize(settingsTemplate(templateData));
    
    const customButtons = [
        {
            text: '🧠 Create Memory',
            result: null,
            classes: ['menu_button'],
            action: async () => {
                if (!sceneData) {
                    toastr.error('No scene selected. Mark start and end points first.', 'STMemoryBooks');
                    return;
                }
                await initiateMemoryCreation();
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
 * Setup event listeners for settings popup with profile manager integration
 */
function setupSettingsEventListeners() {
    if (!currentPopupInstance) return;
    
    const popupElement = currentPopupInstance.dlg;
    const settings = initializeSettings();
    
    // Profile management buttons - use imported functions with proper error handling
    popupElement.querySelector('#stmb-edit-profile')?.addEventListener('click', async () => {
        try {
            await editProfile(settings, refreshPopupContent);
        } catch (error) {
            console.error(`${MODULE_NAME}: Error in edit profile:`, error);
            toastr.error('Failed to edit profile', 'STMemoryBooks');
        }
    });
    
    popupElement.querySelector('#stmb-new-profile')?.addEventListener('click', async () => {
        try {
            await newProfile(settings, refreshPopupContent);
        } catch (error) {
            console.error(`${MODULE_NAME}: Error in new profile:`, error);
            toastr.error('Failed to create profile', 'STMemoryBooks');
        }
    });
    
    popupElement.querySelector('#stmb-delete-profile')?.addEventListener('click', async () => {
        try {
            await deleteProfile(settings, refreshPopupContent);
        } catch (error) {
            console.error(`${MODULE_NAME}: Error in delete profile:`, error);
            toastr.error('Failed to delete profile', 'STMemoryBooks');
        }
    });
    
    // Import/Export buttons - use imported functions with better error handling
    popupElement.querySelector('#stmb-export-profiles')?.addEventListener('click', () => {
        try {
            exportProfiles(settings);
        } catch (error) {
            console.error(`${MODULE_NAME}: Error in export profiles:`, error);
            toastr.error('Failed to export profiles', 'STMemoryBooks');
        }
    });
    
    popupElement.querySelector('#stmb-import-profiles')?.addEventListener('click', () => {
        popupElement.querySelector('#stmb-import-file')?.click();
    });
    
    popupElement.querySelector('#stmb-import-file')?.addEventListener('change', (event) => {
        try {
            importProfiles(event, settings, refreshPopupContent);
        } catch (error) {
            console.error(`${MODULE_NAME}: Error in import profiles:`, error);
            toastr.error('Failed to import profiles', 'STMemoryBooks');
        }
    });
    
    // Profile selection change
    popupElement.querySelector('#stmb-profile-select')?.addEventListener('change', (e) => {
        const newIndex = parseInt(e.target.value);
        if (newIndex >= 0 && newIndex < settings.profiles.length) {
            settings.defaultProfile = newIndex;
            saveSettingsDebounced();
        }
    });

    // Title format dropdown
    popupElement.querySelector('#stmb-title-format-select')?.addEventListener('change', (e) => {
        const customInput = popupElement.querySelector('#stmb-custom-title-format');
        if (e.target.value === 'custom') {
            customInput.style.display = 'block';
            customInput.focus();
        } else {
            customInput.style.display = 'none';
            settings.titleFormat = e.target.value;
            saveSettingsDebounced();
        }
    });

    // Custom title format input with validation
    popupElement.querySelector('#stmb-custom-title-format')?.addEventListener('input', lodash.debounce((e) => {
        const value = e.target.value.trim();
        if (value && value.includes('000')) { // Basic validation for numbering placeholder
            settings.titleFormat = value;
            saveSettingsDebounced();
        }
    }, 1000));

    // Token warning threshold input with validation
    popupElement.querySelector('#stmb-token-warning-threshold')?.addEventListener('input', lodash.debounce((e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 1000 && value <= 100000) {
            settings.moduleSettings.tokenWarningThreshold = value;
            saveSettingsDebounced();
        }
    }, 1000));

    // Default memory count dropdown with validation
    popupElement.querySelector('#stmb-default-memory-count')?.addEventListener('change', (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 0 && value <= 20) {
            settings.moduleSettings.defaultMemoryCount = value;
            saveSettingsDebounced();
        }
    });
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
        const showNotifications = popupElement.querySelector('#stmb-show-notifications')?.checked ?? settings.moduleSettings.showNotifications;
        const refreshEditor = popupElement.querySelector('#stmb-refresh-editor')?.checked ?? settings.moduleSettings.refreshEditor;
        
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

        const hasChanges = alwaysUseDefault !== settings.moduleSettings.alwaysUseDefault || 
                          showNotifications !== settings.moduleSettings.showNotifications ||
                          refreshEditor !== settings.moduleSettings.refreshEditor ||
                          tokenWarningThreshold !== settings.moduleSettings.tokenWarningThreshold ||
                          defaultMemoryCount !== settings.moduleSettings.defaultMemoryCount;
        
        if (hasChanges) {
            settings.moduleSettings.alwaysUseDefault = alwaysUseDefault;
            settings.moduleSettings.showNotifications = showNotifications;
            settings.moduleSettings.refreshEditor = refreshEditor;
            settings.moduleSettings.tokenWarningThreshold = tokenWarningThreshold;
            settings.moduleSettings.defaultMemoryCount = defaultMemoryCount;
            saveSettingsDebounced();
            console.log('STMemoryBooks: Settings updated');
        }
    } catch (error) {
        console.error('STMemoryBooks: Error handling settings popup close:', error);
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
        
        const templateData = {
            hasScene: !!sceneData,
            sceneData: sceneData,
            alwaysUseDefault: settings.moduleSettings.alwaysUseDefault,
            showNotifications: settings.moduleSettings.showNotifications,
            refreshEditor: settings.moduleSettings.refreshEditor,
            tokenWarningThreshold: settings.moduleSettings.tokenWarningThreshold || 30000,
            defaultMemoryCount: settings.moduleSettings.defaultMemoryCount || 0,
            profiles: settings.profiles.map((profile, index) => ({
                ...profile,
                isDefault: index === settings.defaultProfile
            })),
            titleFormat: settings.titleFormat,
            titleFormats: getDefaultTitleFormats().map(format => ({
                value: format,
                isSelected: format === settings.titleFormat
            })),
            showCustomInput: !getDefaultTitleFormats().includes(settings.titleFormat)
        };
        
        const content = DOMPurify.sanitize(settingsTemplate(templateData));
        const newContent = content;
        
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = newContent;
        
        morphdom(currentPopupInstance.content, tempContainer, {
            onBeforeElUpdated: function(fromEl, toEl) {
                // Preserve state of form elements that morphdom might reset
                if (fromEl.isEqualNode(toEl)) {
                    return false;
                }
                if (fromEl.type === 'checkbox' || fromEl.type === 'radio') {
                    toEl.checked = fromEl.checked;
                }
                if (fromEl.tagName === 'SELECT' || fromEl.tagName === 'INPUT' || fromEl.tagName === 'TEXTAREA') {
                    toEl.value = fromEl.value;
                }
                return true;
            }
        });

        const requiredClasses = [
            'wide_dialogue_popup',
            'large_dialogue_popup',
            'vertical_scrolling_dialogue_popup'
        ];

        requiredClasses.forEach(className => {
            if (!currentPopupInstance.dlg.classList.contains(className)) {
                currentPopupInstance.dlg.classList.add(className);
            }
        });
        
        setupSettingsEventListeners();
        console.log('STMemoryBooks: Popup content refreshed with preserved properties');
    } catch (error) {
        console.error('STMemoryBooks: Error refreshing popup content:', error);
    }
}

/**
 * PERFORMANCE: Process existing messages and use full update (for chat loads)
 */
function processExistingMessages() {
    console.log('STMemoryBooks: Processing any existing messages on the DOM...');
    const messageElements = document.querySelectorAll('#chat .mes[mesid]');

    if (messageElements.length > 0) {
        let buttonsAdded = 0;
        messageElements.forEach(messageElement => {
            // Check if buttons are already there to prevent duplication
            if (!messageElement.querySelector('.mes_stmb_start')) {
                try {
                    createSceneButtons(messageElement);
                    buttonsAdded++;
                } catch (error) {
                    console.error('STMemoryBooks: Error creating buttons for message:', error);
                    // Continue processing other messages even if one fails
                }
            }
        });

        if (buttonsAdded > 0) {
            console.log(`STMemoryBooks: Added buttons to ${buttonsAdded} existing messages.`);
        }

        // PERFORMANCE: Full update needed for chat loads
        updateAllButtonStates();
    } else {
        console.log('STMemoryBooks: No existing messages found to process.');
    }
}

function handleChatChanged() {
    console.log('STMemoryBooks: Chat changed - updating scene state');
    updateSceneStateCache();
    
    setTimeout(() => {
        try {
            // PERFORMANCE: Full update needed for chat changes
            processExistingMessages();
        } catch (error) {
            console.error('STMemoryBooks: Error processing messages after chat change:', error);
        }
    }, 50);
}

/**
 * Handle chat loaded event - updated to include conversion check
 */
function handleChatLoaded() {
    console.log('STMemoryBooks: Chat loaded event received, processing messages.');
    updateSceneStateCache();
    
    // PERFORMANCE: Full update needed for chat loads
    processExistingMessages();

    // NEW: Check if lorebook needs conversion (with delay to ensure UI is ready)
    setTimeout(checkAndPromptForConversion, 1000);
}

function handleMessageReceived() {
    setTimeout(validateSceneMarkers, 500);
}

/**
 * Slash command handlers - FIXED SIGNATURES
 */
function handleCreateMemoryCommand(namedArgs, unnamedArgs) {
    const sceneData = getSceneData();
    if (!sceneData) {
        toastr.error('No scene markers set. Use chevron buttons to mark start and end points first.', 'STMemoryBooks');
        return;
    }
    
    initiateMemoryCreation();
}

function handleSceneMemoryCommand(namedArgs, unnamedArgs) {
    // Validate that we have an unnamed argument
    if (!unnamedArgs || unnamedArgs.length === 0 || typeof unnamedArgs[0] !== 'string') {
        toastr.error('Missing range argument. Use: /scenememory X-Y (e.g., /scenememory 10-15)', 'STMemoryBooks');
        return;
    }
    
    const range = unnamedArgs[0].trim();
    const match = range.match(/^(\d+)-(\d+)$/);
    
    if (!match) {
        toastr.error('Invalid format. Use: /scenememory X-Y (e.g., /scenememory 10-15)', 'STMemoryBooks');
        return;
    }
    
    const startId = parseInt(match[1]);
    const endId = parseInt(match[2]);
    
    // Validate range logic
    if (startId >= endId) {
        toastr.error('Start message must be less than end message', 'STMemoryBooks');
        return;
    }
    
    // Validate message IDs exist in current chat
    if (startId < 0 || endId >= chat.length) {
        toastr.error(`Message IDs out of range. Valid range: 0-${chat.length - 1}`, 'STMemoryBooks');
        return;
    }
    
    // Additional validation: check if messages actually exist
    if (!chat[startId] || !chat[endId]) {
        toastr.error('One or more specified messages do not exist', 'STMemoryBooks');
        return;
    }
    
    // Set markers using scene manager
    const markers = getSceneMarkers();
    markers.sceneStart = startId;
    markers.sceneEnd = endId;
    
    updateSceneStateCache();
    saveMetadataDebounced();
    
    // This will automatically use the optimized update since we fixed setSceneMarker
    updateAllButtonStates();
    
    toastr.info(`Scene set: messages ${startId}-${endId}`, 'STMemoryBooks');
    
    // Optionally create memory immediately
    setTimeout(() => initiateMemoryCreation(), 500);
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
    
    SlashCommandParser.addCommandObject(createMemoryCmd);
    SlashCommandParser.addCommandObject(sceneMemoryCmd);
}

/**
 * Create main menu UI
 */
function createUI() {
    const menuItem = $(`
        <div id="stmb-menu-item" class="extension_container">
            <i class="fa-solid fa-book"></i>
            <span>Memory Settings</span>
        </div>
    `);
    
    let extensionsList = $(SELECTORS.extensionsMenu);
    if (extensionsList.length === 0) {
        extensionsList = $('<div class="list-group"></div>');
        $('#extensionsMenu').append(extensionsList);
    }
    extensionsList.append(menuItem);
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
    
    window.addEventListener('beforeunload', cleanupChatObserver);
    
    console.log('STMemoryBooks: Event listeners registered');
}

/**
 * Initialize the extension
 */
async function init() {
    if (hasBeenInitialized) return;
    hasBeenInitialized = true;

    console.log('STMemoryBooks: Initializing with JSON-based architecture and performance optimizations');
    
    // Wait for SillyTavern to be ready
    let attempts = 0;
    const maxAttempts = 20;
    
    while (attempts < maxAttempts) {
        if ($(SELECTORS.extensionsMenu).length > 0 && eventSource && typeof Popup !== 'undefined') {
            console.log('STMemoryBooks: SillyTavern UI detected');
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
    }
    
    // Initialize settings with validation
    const settings = initializeSettings();
    const profileValidation = validateAndFixProfiles(settings);
    
    if (!profileValidation.valid) {
        console.warn('STMemoryBooks: Profile validation issues found:', profileValidation.issues);
        if (profileValidation.fixes.length > 0) {
            console.log('STMemoryBooks: Applied automatic fixes:', profileValidation.fixes);
            saveSettingsDebounced();
        }
    }
    
    console.log(`STMemoryBooks: Settings initialized with ${profileValidation.profileCount} profiles`);
    
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

    // CRITICAL: Process any messages that are already on the screen at initialization time
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
    
    console.log('STMemoryBooks: Extension loaded successfully with JSON-based memory generation and performance optimizations');
}

// Initialize when ready
$(document).ready(() => {
    if (eventSource && event_types.APP_READY) {
        eventSource.on(event_types.APP_READY, init);
    }
    
    // Fallback initialization
    setTimeout(init, 2000);
    
    console.log('STMemoryBooks: Ready to initialize with improved architecture');
});