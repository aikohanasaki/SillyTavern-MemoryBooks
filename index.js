import { 
    eventSource, 
    event_types, 
    chat, 
    chat_metadata, 
    saveSettingsDebounced,
    name1, 
    name2 
} from '../../../../script.js';
import { Popup, POPUP_TYPE, POPUP_RESULT } from '../../../popup.js';
import { extension_settings, saveMetadataDebounced, getContext } from '../../../extensions.js';
import { SlashCommandParser } from '../../../slash-commands/SlashCommandParser.js';
import { SlashCommand } from '../../../slash-commands/SlashCommand.js';
import { ARGUMENT_TYPE, SlashCommandArgument } from '../../../slash-commands/SlashCommandArgument.js';
import { METADATA_KEY, world_names, loadWorldInfo } from '../../../world-info.js';
import { lodash, moment, Handlebars, DOMPurify, morphdom } from '../../../../lib.js';
import { compileScene, createSceneRequest, estimateTokenCount, validateCompiledScene, getSceneStats } from './chatcompile.js';
import { createMemory, completeMemoryWithKeywords } from './stmemory.js';
import { addMemoryToLorebook, getDefaultTitleFormats } from './addlore.js';
import { 
    editProfile, 
    newProfile, 
    deleteProfile, 
    exportProfiles, 
    importProfiles,
    validateAndFixProfiles
} from './profileManager.js';
import {
    getSceneMarkers,
    setSceneMarker,
    clearScene,
    updateAllButtonStates,
    validateSceneMarkers,
    handleMessageDeletion,
    createSceneButtons,
    getSceneData,
    updateSceneStateCache,
    getCurrentSceneState
} from './sceneManager.js';
import { settingsTemplate } from './templates.js';
import { 
    showConfirmationPopup, 
    showKeywordSelectionPopup,
    fetchPreviousSummaries,
    calculateTokensWithContext
} from './confirmationPopup.js';
import { 
    getEffectivePrompt, 
    getPresetPrompt,
    DEFAULT_PROMPT,
    deepClone,
    getCurrentModelSettings,
    getCurrentApiInfo,
    SELECTORS
} from './utils.js';
import { ToolManager } from '../../../tool-calling.js';

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
    migrationVersion: 1
};

// Current state variables
let currentPopupInstance = null;
let isProcessingMemory = false;

// MutationObserver for chat message monitoring
let chatObserver = null;
let updateTimeout = null;

/**
 * Initialize chat observer to watch for new messages
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
        let needsButtonStateUpdate = false;
        
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                // Only process element nodes
                if (node.nodeType === Node.ELEMENT_NODE) {
                    try {
                        // Check if the added node is a message itself
                        if (node.matches('#chat .mes[mesid]')) {
                            createSceneButtons(node);
                            needsButtonStateUpdate = true;
                        }
                        // Check if the added node contains messages (for batch loads)
                        else {
                            const messageElements = node.querySelectorAll('#chat .mes[mesid]');
                            if (messageElements.length > 0) {
                                messageElements.forEach(messageElement => {
                                    createSceneButtons(messageElement);
                                });
                                needsButtonStateUpdate = true;
                            }
                        }
                    } catch (error) {
                        console.error('STMemoryBooks: Error processing new chat elements:', error);
                        // Continue processing other nodes rather than failing completely
                    }
                }
            });
        });

        if (needsButtonStateUpdate) {
            // Debounce the state update to prevent excessive calls
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => {
                try {
                    updateAllButtonStates();
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

    console.log('STMemoryBooks: Chat observer initialized and monitoring for new messages');
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
 * Prepare memory result for keyword selection dialog
 */
function prepareForKeywordDialog(memoryResult) {
    return {
        formattedContent: memoryResult.content,
        displayMetadata: {
            sceneRange: memoryResult.metadata?.sceneRange || 'Unknown',
            characterName: memoryResult.metadata?.characterName || 'Unknown',
            profileUsed: memoryResult.metadata?.profileUsed || 'Unknown'
        }
    };
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
 * Execute the core memory generation process
 */
async function executeMemoryGeneration(sceneData, lorebookValidation, effectiveSettings) {
    const { profileSettings, summaryCount, tokenThreshold, settings } = effectiveSettings;
    
    try {
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
        
        // Generate memory (profileSettings now contains all necessary connection info)
        toastr.info('Generating memory with AI...', 'STMemoryBooks');
        const memoryResult = await createMemory(compiledScene, profileSettings, {
            tokenWarningThreshold: tokenThreshold
        });
        
        // Handle keyword selection and finalization
        const finalResult = await handleMemoryCompletion(memoryResult, memoryFetchResult, stats);
        
        // Add to lorebook
        toastr.info('Adding memory to lorebook...', 'STMemoryBooks');
        const addResult = await addMemoryToLorebook(finalResult, lorebookValidation);
        
        if (!addResult.success) {
            throw new Error(addResult.error || 'Failed to add memory to lorebook');
        }
        
        // Success notification
        const contextMsg = memoryFetchResult.actualCount > 0 ? 
            ` (with ${memoryFetchResult.actualCount} context ${memoryFetchResult.actualCount === 1 ? 'memory' : 'memories'})` : '';
        setTimeout(() => {
            toastr.success(`Memory "${addResult.entryTitle}" created from ${stats.messageCount} messages${contextMsg}!`, 'STMemoryBooks');
        }, 1000);
        
} catch (error) {
        console.error('STMemoryBooks: Error creating memory:', error);
        
        // Provide specific error messages for tool calling issues
        if (error.message.includes('Tool calling is not supported')) {
            toastr.error('Function calling must be enabled in OpenAI settings for memory creation to work.', 'STMemoryBooks', {
                timeOut: 10000,
                onclick: () => {
                    // Could potentially open settings or provide more guidance
                    toastr.info('Go to OpenAI Settings → Advanced → Enable Function Calling', 'STMemoryBooks', { timeOut: 15000 });
                }
            });
        } else if (error.message.includes('AI did not call the createMemory tool')) {
            toastr.error('AI model did not use the memory creation tool. This may indicate your model does not support function calling properly.', 'STMemoryBooks', {
                timeOut: 8000
            });
        } else {
            toastr.error(`Failed to create memory: ${error.message}`, 'STMemoryBooks');
        }
    } finally {
        isProcessingMemory = false;
    }
}

/**
 * Handle memory completion including keyword selection if needed
 */
async function handleMemoryCompletion(memoryResult, memoryFetchResult, stats) {
    if (memoryResult.needsKeywordGeneration) {
        console.log('STMemoryBooks: Keywords need user selection, showing keyword dialog');
        
        const preparedResult = prepareForKeywordDialog(memoryResult);
        const keywordChoice = await showKeywordSelectionPopup(preparedResult);
        
        if (!keywordChoice) {
            throw new Error('User cancelled keyword selection');
        }
        
        toastr.info('Completing memory with selected keyword method...', 'STMemoryBooks');
        return await completeMemoryWithKeywords(
            memoryResult, 
            keywordChoice.method, 
            keywordChoice.userKeywords
        );
    }
    
    return memoryResult;
}

/**
 * Refactored main orchestrator function
 */
async function initiateMemoryCreation() {
    if (isProcessingMemory) {
        toastr.warning('Memory creation already in progress', 'STMemoryBooks');
        return;
    }
    
    // Step 1: Validate prerequisites
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
    
    // Step 2: Get user confirmation and effective settings
    const effectiveSettings = await showAndGetMemorySettings(sceneData, lorebookValidation);
    if (!effectiveSettings) {
        return; // User cancelled
    }
    
    // Close settings popup if open
    if (currentPopupInstance) {
        currentPopupInstance.completeCancelled();
        currentPopupInstance = null;
    }
    
    // Step 3: Execute the memory generation process
    isProcessingMemory = true;
    try {
        await executeMemoryGeneration(sceneData, lorebookValidation, effectiveSettings);
    } catch (error) {
        console.error('STMemoryBooks: Error creating memory:', error);
        toastr.error(`Failed to create memory: ${error.message}`, 'STMemoryBooks');
    } finally {
        isProcessingMemory = false;
    }
}

/**
 * Show main settings popup
 */
// In showSettingsPopup function, around line 654
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
 * Refresh popup content
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
                if (fromEl.type === 'checkbox') {
                    toEl.checked = fromEl.checked;
                }
                if (fromEl.tagName === 'SELECT') {
                    toEl.value = fromEl.value;
                }
                return true;
            }
        });
        
        setupSettingsEventListeners();
        console.log('STMemoryBooks: Popup content refreshed');
    } catch (error) {
        console.error('STMemoryBooks: Error refreshing popup content:', error);
    }
}

/**
 * Processes any messages that already exist in the DOM, adding scene buttons if they are missing.
 * This is used for the initial load and for chat changes to catch any messages the observer might miss.
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
            processExistingMessages();
        } catch (error) {
            console.error('STMemoryBooks: Error processing messages after chat change:', error);
        }
    }, 50);
}

function handleChatLoaded() {
    console.log('STMemoryBooks: Chat loaded event received, processing messages.');
    updateSceneStateCache();
    processExistingMessages();
}

function handleMessageReceived() {
    setTimeout(validateSceneMarkers, 500);
}

/**
 * Slash command handlers
 */
function handleCreateMemoryCommand() {
    const sceneData = getSceneData();
    if (!sceneData) {
        toastr.error('No scene markers set. Use chevron buttons to mark start and end points first.', 'STMemoryBooks');
        return;
    }
    
    initiateMemoryCreation();
}


function handleSceneMemoryCommand(args) {
    const range = args[0].trim();
    const match = range.match(/^(\d+)-(\d+)$/);
    
    if (!match) {
        toastr.error('Invalid format. Use: /scenememory X-Y (e.g., /scenememory 10-15)', 'STMemoryBooks');
        return;
    }
    
    const startId = parseInt(match[1]);
    const endId = parseInt(match[2]);
    
    if (startId >= endId) {
        toastr.error('Start message must be less than end message', 'STMemoryBooks');
        return;
    }
    
    if (startId < 0 || endId >= chat.length) {
        toastr.error('Message IDs out of range', 'STMemoryBooks');
        return;
    }
    
    // Set markers using scene manager
    const markers = getSceneMarkers();
    markers.sceneStart = startId;
    markers.sceneEnd = endId;
    
    updateSceneStateCache();
    saveMetadataDebounced();
    updateAllButtonStates();
    
    toastr.info(`Scene set: messages ${startId}-${endId}`, 'STMemoryBooks');
    
    // Optionally create memory immediately
    setTimeout(() => initiateMemoryCreation(), 500);
}

/**
 * Register the createMemory tool with enhanced description for natural usage
 */
function registerMemoryTool() {
    console.log('STMemoryBooks: Registering createMemory tool with enhanced description');
    
    ToolManager.registerFunctionTool({
        name: 'createMemory',
        displayName: 'Create Memory',
        description: 'Create a structured memory summary when analyzing conversation scenes. This tool extracts key plot points, character development, important interactions, and story details for future reference. Use when asked to summarize, analyze, or create memories from chat conversations.',
        parameters: {
            type: 'object',
            properties: {
                memory_content: {
                    type: 'string',
                    description: 'A comprehensive summary of the conversation scene including key events, character interactions, plot developments, and important details. Should be detailed enough to serve as a memory for future reference.'
                },
                title: {
                    type: 'string',
                    description: 'A concise, descriptive title for this memory (1-4 words that capture the essence of the scene)'
                },
                keywords: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'An array of 3-8 relevant keywords or phrases that would help retrieve this memory later when similar topics are mentioned',
                    minItems: 3,
                    maxItems: 8
                }
            },
            required: ['memory_content', 'title', 'keywords']
        },
        action: (params) => {
            // Store the tool result for pickup by the memory creation process
            window.STMemoryBooks_toolResult = params;
            return JSON.stringify({ 
                success: true, 
                received: true,
                summary: `Created memory: "${params.title}" with ${params.keywords?.length || 0} keywords`
            });
        },
        stealth: true  // Prevents chat output and follow-up generation
    });
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

    console.log('STMemoryBooks: Initializing');
    
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

    // Check if tool calling is supported
    if (!ToolManager.isToolCallingSupported()) {
        console.error('STMemoryBooks: Tool calling is not supported with current settings');
        throw new Error('STMemoryBooks requires function calling to be enabled. Please enable function calling in your OpenAI settings.');
    }

    // Register our stealth tool
    registerMemoryTool();
    
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
    
    console.log('STMemoryBooks: Extension loaded successfully');
}


// Initialize when ready
$(document).ready(() => {
    if (eventSource && event_types.APP_READY) {
        eventSource.on(event_types.APP_READY, init);
    }
    
    // Fallback initialization
    setTimeout(init, 2000);
    
    console.log('STMemoryBooks: Ready to initialize');
});