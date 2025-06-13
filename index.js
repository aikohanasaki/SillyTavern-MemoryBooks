import { 
    eventSource, 
    event_types, 
    chat, 
    chat_metadata, 
    saveMetadataDebounced,
    saveSettingsDebounced,
    Popup, 
    POPUP_TYPE, 
    POPUP_RESULT,
    name1, 
    name2 
} from '../../../../script.js';
import { extension_settings, getContext } from '../../../extensions.js';
import { SlashCommandParser } from '../../../slash-commands/SlashCommandParser.js';
import { SlashCommand } from '../../../slash-commands/SlashCommand.js';
import { SlashCommandArgument } from '../../../slash-commands/SlashCommandArgument.js';
import { METADATA_KEY, world_names, loadWorldInfo, createWorldInfoEntry, saveWorldInfo } from '../../../world-info.js';
import { PromptManager, Prompt } from '../../../PromptManager.js';
import { stringToRange } from '../../../utils.js';
import { lodash, moment, Handlebars, DOMPurify, morphdom } from '../../../../lib.js';
import { compileScene, createSceneRequest, estimateTokenCount, validateCompiledScene, getSceneStats } from './chatcompile.js';
import { compileScene, createSceneRequest, estimateTokenCount, validateCompiledScene, getSceneStats } from './chatcompile.js';
import { createMemory, prepareForKeywordDialog, completeMemoryWithKeywords } from './stmemory.js'; // ADD THIS LINE
import { getDefaultTitleFormats, validateTitleFormat, previewTitle } from './addlore.js';

const MODULE_NAME = 'STMemoryBooks';
const SAVE_DEBOUNCE_TIME = 1000;
const TOKEN_WARNING_THRESHOLD = 30000;
const CHARS_PER_TOKEN = 4; // Rough estimation

// Centralized DOM selectors
const SELECTORS = {
    extensionsMenu: '#extensionsMenu .list-group',
    menuItem: '#stmb-menu-item',
    chatContainer: '#chat'
};

// Default settings structure
const defaultSettings = {
    moduleSettings: {
        alwaysUseDefault: true,
        showNotifications: true,
        refreshEditor: true,
    },
    titleFormat: '[000] - Auto Memory',
    profiles: [
        {
            name: "Default",
            connection: {
                engine: "openai", 
                model: "gpt-4",
                temperature: 0.7
            },
            prompt: "Create a concise memory from this chat scene. Focus on key plot points, character development, and important interactions. Format as a brief summary suitable for a character's memory book."
        }
    ],
    defaultProfile: 0,
    migrationVersion: 1
};

// Current state variables
let currentPopupInstance = null;
let isProcessingMemory = false;

// Cache for current scene state
let currentSceneState = {
    start: null,
    end: null
};

/**
 * Initialize and validate extension settings
 */
function initializeSettings() {
    extension_settings.STMemoryBooks = extension_settings.STMemoryBooks || lodash.cloneDeep(defaultSettings);
    return validateSettings(extension_settings.STMemoryBooks);
}

/**
 * Validate settings structure and fix any issues
 */
function validateSettings(settings) {
    // Ensure profiles array exists and has at least one profile
    if (!settings.profiles || settings.profiles.length === 0) {
        settings.profiles = [lodash.cloneDeep(defaultSettings.profiles[0])];
        settings.defaultProfile = 0;
    }
    
    // Ensure defaultProfile is valid
    if (settings.defaultProfile >= settings.profiles.length) {
        settings.defaultProfile = 0;
    }
    
    // Ensure module settings exist
    if (!settings.moduleSettings) {
        settings.moduleSettings = lodash.cloneDeep(defaultSettings.moduleSettings);
    }
    
    return settings;
}

/**
 * Get current scene markers from chat metadata
 */
function getSceneMarkers() {
    if (!chat_metadata.STMemoryBooks) {
        chat_metadata.STMemoryBooks = {
            sceneStart: null,
            sceneEnd: null
        };
    }
    return chat_metadata.STMemoryBooks;
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
 * Set scene marker with validation
 */
function setSceneMarker(messageId, type) {
    const markers = getSceneMarkers();
    const numericId = parseInt(messageId);
    
    console.log(`STMemoryBooks: Setting ${type} marker to message ${numericId}`);
    
    if (type === 'start') {
        // If setting start, clear end if it would be invalid
        if (markers.sceneEnd !== null && markers.sceneEnd <= numericId) {
            markers.sceneEnd = null;
            console.log('STMemoryBooks: Cleared end marker (would be invalid)');
        }
        
        // Toggle start marker
        markers.sceneStart = markers.sceneStart === numericId ? null : numericId;
    } else if (type === 'end') {
        // If setting end, clear start if it would be invalid  
        if (markers.sceneStart !== null && markers.sceneStart >= numericId) {
            markers.sceneStart = null;
            console.log('STMemoryBooks: Cleared start marker (would be invalid)');
        }
        
        // Toggle end marker
        markers.sceneEnd = markers.sceneEnd === numericId ? null : numericId;
    }
    
    // Update cache
    currentSceneState.start = markers.sceneStart;
    currentSceneState.end = markers.sceneEnd;
    
    // Save to metadata
    saveMetadataDebounced();
    
    // Update all button states
    updateAllButtonStates();
    
    console.log('STMemoryBooks: Scene markers updated:', markers);
}

/**
 * Update visual states of all currently rendered message buttons
 */
function updateAllButtonStates() {
    const markers = getSceneMarkers();
    const { sceneStart, sceneEnd } = markers;
    
    // Find all rendered message elements
    const messageElements = document.querySelectorAll('#chat .mes[mesid]');
    
    messageElements.forEach(messageElement => {
        const messageId = parseInt(messageElement.getAttribute('mesid'));
        const startBtn = messageElement.querySelector('.stmb-start-btn');
        const endBtn = messageElement.querySelector('.stmb-end-btn');
        
        if (!startBtn || !endBtn) return;
        
        // Clear all special classes
        startBtn.classList.remove('on', 'valid-start-point', 'in-scene');
        endBtn.classList.remove('on', 'valid-end-point', 'in-scene');
        
        // Apply appropriate classes based on current state
        if (sceneStart !== null && sceneEnd !== null) {
            // Complete scene - highlight range
            if (messageId >= sceneStart && messageId <= sceneEnd) {
                startBtn.classList.add('in-scene');
                endBtn.classList.add('in-scene');
            }
            // Mark active markers
            if (messageId === sceneStart) startBtn.classList.add('on');
            if (messageId === sceneEnd) endBtn.classList.add('on');
            
        } else if (sceneStart !== null) {
            // Start set, show valid end points
            if (messageId === sceneStart) {
                startBtn.classList.add('on');
            } else if (messageId > sceneStart) {
                endBtn.classList.add('valid-end-point');
            }
            
        } else if (sceneEnd !== null) {
            // End set, show valid start points
            if (messageId === sceneEnd) {
                endBtn.classList.add('on');
            } else if (messageId < sceneEnd) {
                startBtn.classList.add('valid-start-point');
            }
        }
    });
    
    console.log(`STMemoryBooks: Updated button states for ${messageElements.length} messages`);
}

/**
 * Validate scene markers after message changes
 */
function validateSceneMarkers() {
    const markers = getSceneMarkers();
    let hasChanges = false;
    
    // Check if markers are within chat bounds
    const chatLength = chat.length;
    
    if (markers.sceneStart !== null && markers.sceneStart >= chatLength) {
        markers.sceneStart = null;
        hasChanges = true;
        console.log('STMemoryBooks: Cleared invalid start marker');
    }
    
    if (markers.sceneEnd !== null && markers.sceneEnd >= chatLength) {
        // For end marker, try to fall back to last message
        markers.sceneEnd = chatLength - 1;
        hasChanges = true;
        console.log('STMemoryBooks: Adjusted end marker to last message');
    }
    
    // Ensure start < end
    if (markers.sceneStart !== null && markers.sceneEnd !== null && markers.sceneStart >= markers.sceneEnd) {
        markers.sceneStart = null;
        markers.sceneEnd = null;
        hasChanges = true;
        console.log('STMemoryBooks: Cleared invalid scene range');
    }
    
    if (hasChanges) {
        currentSceneState.start = markers.sceneStart;
        currentSceneState.end = markers.sceneEnd;
        saveMetadataDebounced();
        updateAllButtonStates();
    }
}

/**
 * Handle message deletion events
 */
function handleMessageDeletion(deletedId) {
    const markers = getSceneMarkers();
    let shouldClear = false;
    
    // If start marker was deleted, clear entire scene
    if (markers.sceneStart === deletedId) {
        shouldClear = true;
        console.log('STMemoryBooks: Start marker deleted, clearing scene');
    }
    
    // If end marker was deleted
    if (markers.sceneEnd === deletedId) {
        const chatLength = chat.length;
        
        if (deletedId === chatLength) {
            // Was the last message, fall back to new last message
            markers.sceneEnd = chatLength - 1;
            console.log('STMemoryBooks: End marker was last message, falling back');
        } else {
            // Was not the last message, clear scene
            shouldClear = true;
            console.log('STMemoryBooks: End marker deleted (not last message), clearing scene');
        }
    }
    
    if (shouldClear) {
        clearScene();
        
        const settings = initializeSettings();
        if (settings.moduleSettings.showNotifications) {
            toastr.warning('Scene markers cleared due to message deletion', 'STMemoryBooks');
        }
    } else {
        // Validate remaining markers
        validateSceneMarkers();
    }
}

/**
 * Clear scene markers
 */
function clearScene() {
    const markers = getSceneMarkers();
    markers.sceneStart = null;
    markers.sceneEnd = null;
    
    currentSceneState.start = null;
    currentSceneState.end = null;
    
    saveMetadataDebounced();
    updateAllButtonStates();
    
    console.log('STMemoryBooks: Scene cleared');
}

/**
 * Estimate token count for scene
 */
function estimateSceneTokensEnhanced(startId, endId) {
    try {
        // Create a temporary scene request for estimation
        const tempRequest = createSceneRequest(startId, endId);
        const tempCompiled = compileScene(tempRequest);
        return estimateTokenCount(tempCompiled);
    } catch (error) {
        console.error('STMemoryBooks: Error estimating tokens:', error);
        // Fallback to simple estimation
        return estimateSceneTokens(startId, endId);
    }
}

/**
 * Get scene data with message excerpts
 */
function getSceneData() {
    const markers = getSceneMarkers();
    
    if (markers.sceneStart === null || markers.sceneEnd === null) {
        return null;
    }
    
    const startMessage = chat[markers.sceneStart];
    const endMessage = chat[markers.sceneEnd];
    
    if (!startMessage || !endMessage) {
        return null;
    }
    
    const getExcerpt = (message) => {
        const content = message.mes || '';
        return content.length > 100 ? content.substring(0, 100) + '...' : content;
    };
    
    return {
        sceneStart: markers.sceneStart,
        sceneEnd: markers.sceneEnd,
        startExcerpt: getExcerpt(startMessage),
        endExcerpt: getExcerpt(endMessage),
        startSpeaker: startMessage.name || 'Unknown',
        endSpeaker: endMessage.name || 'Unknown',
        messageCount: markers.sceneEnd - markers.sceneStart + 1,
        estimatedTokens: estimateSceneTokensEnhanced(markers.sceneStart, markers.sceneEnd) // Use enhanced estimation
    };
}

/**
 * Create message action buttons
 */
function createSceneButtons(messageElement) {
    const messageId = parseInt(messageElement.getAttribute('mesid'));
    const extraButtonsContainer = messageElement.querySelector('.extraMesButtons');
    
    if (!extraButtonsContainer) return;
    
    // Check if buttons already exist
    if (messageElement.querySelector('.stmb-start-btn')) return;
    
    // Create start button
    const startButton = document.createElement('div');
    startButton.title = 'Mark Scene Start';
    startButton.classList.add('stmb-start-btn', 'mes_button');
    startButton.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    
    // Create end button  
    const endButton = document.createElement('div');
    endButton.title = 'Mark Scene End';
    endButton.classList.add('stmb-end-btn', 'mes_button');
    endButton.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    
    // Add event listeners
    startButton.addEventListener('click', (e) => {
        e.stopPropagation();
        setSceneMarker(messageId, 'start');
    });
    
    endButton.addEventListener('click', (e) => {
        e.stopPropagation();
        setSceneMarker(messageId, 'end');
    });
    
    // Append buttons
    extraButtonsContainer.appendChild(startButton);
    extraButtonsContainer.appendChild(endButton);
}

/**
 * Event handlers - separated for clarity
 */
function handleMessageRendered(messageId) {
    const messageElement = document.querySelector(`#chat .mes[mesid="${messageId}"]`);
    if (messageElement) {
        createSceneButtons(messageElement);
        setTimeout(updateAllButtonStates, 100);
    }
}

function handleChatChanged() {
    console.log('STMemoryBooks: Chat changed');
    // Update cached state
    const markers = getSceneMarkers();
    currentSceneState.start = markers.sceneStart;
    currentSceneState.end = markers.sceneEnd;
    
    // Update button states after a delay to allow DOM to update
    setTimeout(updateAllButtonStates, 500);
}

function handleChatLoaded() {
    console.log('STMemoryBooks: Chat loaded');
    setTimeout(() => {
        const markers = getSceneMarkers();
        currentSceneState.start = markers.sceneStart;
        currentSceneState.end = markers.sceneEnd;
        updateAllButtonStates();
    }, 1000);
}

function handleMessageReceived() {
    setTimeout(validateSceneMarkers, 500);
}

/**
 * Handlebars templates
 */
const settingsTemplate = Handlebars.compile(`
<div class="stmb-settings-container">
    <div class="completion_prompt_manager_popup_entry">
        {{#if hasScene}}
        <div class="completion_prompt_manager_popup_entry_form_control">
            <h5>Current Scene:</h5>
            <div class="mes_file_container" style="margin-bottom: 10px;">
                <pre style="margin: 0; white-space: pre-line;">Start: Message #{{sceneData.sceneStart}} ({{sceneData.startSpeaker}})
{{sceneData.startExcerpt}}

End: Message #{{sceneData.sceneEnd}} ({{sceneData.endSpeaker}})
{{sceneData.endExcerpt}}

Messages: {{sceneData.messageCount}} | Estimated tokens: {{sceneData.estimatedTokens}}</pre>
            </div>
        </div>
        {{else}}
        <div class="completion_prompt_manager_error caution">
            <span>No scene markers set. Use the chevron buttons in chat messages to mark start (►) and end (◄) points.</span>
        </div>
        {{/if}}
        
        <div class="completion_prompt_manager_popup_entry_form_control">
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-always-use-default" {{#if alwaysUseDefault}}checked{{/if}}>
                <span>Always use default profile (no confirmation prompt)</span>
            </label>
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-show-notifications" {{#if showNotifications}}checked{{/if}}>
                <span>Show notifications</span>
            </label>
        </div>

        <div class="completion_prompt_manager_popup_entry_form_control">
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-refresh-editor" {{#if refreshEditor}}checked{{/if}}>
                <span>Refresh lorebook editor after adding memories</span>
            </label>
        </div>

        <div class="completion_prompt_manager_popup_entry_form_control">
            <h5>Memory Title Format:</h5>
            <select id="stmb-title-format-select" class="text_pole">
                {{#each titleFormats}}
                <option value="{{this}}" {{#if isSelected}}selected{{/if}}>{{this}}</option>
                {{/each}}
                <option value="custom">Custom Title Format...</option>
            </select>
            <input type="text" id="stmb-custom-title-format" class="text_pole" 
                style="margin-top: 5px; {{#unless showCustomInput}}display: none;{{/unless}}" 
                placeholder="Enter custom format" value="{{titleFormat}}">
            <small style="opacity: 0.7;">Use [0], [00], [000] for auto-numbering. Available: {{character}}, {{scene}}, {{messages}}, {{profile}}, {{date}}, {{time}}</small>
        </div>
        
        <div class="completion_prompt_manager_popup_entry_form_control">
            <h5>Memory Profiles:</h5>
            <select id="stmb-profile-select" class="text_pole">
                {{#each profiles}}
                <option value="{{@index}}" {{#if isDefault}}selected{{/if}}>{{name}}</option>
                {{/each}}
            </select>
            <div class="menu_button" id="stmb-edit-profile">Edit Profile</div>
            <div class="menu_button" id="stmb-new-profile">New Profile</div>
            <div class="menu_button" id="stmb-delete-profile">Delete Profile</div>
        </div>
        
        <div class="completion_prompt_manager_popup_entry_form_control">
            <h5>Import/Export:</h5>
            <input type="file" id="stmb-import-file" accept=".json" style="display: none;">
            <div class="menu_button" id="stmb-export-profiles">Export Profiles</div>
            <div class="menu_button" id="stmb-import-profiles">Import Profiles</div>
        </div>
    </div>
</div>
`);

const profileEditTemplate = Handlebars.compile(`
<div class="completion_prompt_manager_popup_entry">
    <div class="completion_prompt_manager_popup_entry_form_control">
        <label for="stmb-profile-name">Profile Name:</label>
        <input type="text" id="stmb-profile-name" value="{{name}}" class="text_pole" placeholder="Profile name">
    </div>
    
    <div class="completion_prompt_manager_popup_entry_form_control">
        <h5>Connection Settings:</h5>
        <label for="stmb-profile-engine">Engine:</label>
        <select id="stmb-profile-engine" class="text_pole">
            <option value="openai" {{#if (eq connection.engine 'openai')}}selected{{/if}}>OpenAI</option>
            <option value="claude" {{#if (eq connection.engine 'claude')}}selected{{/if}}>Claude</option>
            <option value="custom" {{#if (eq connection.engine 'custom')}}selected{{/if}}>Custom</option>
        </select>
        
        <label for="stmb-profile-model">Model:</label>
        <input type="text" id="stmb-profile-model" value="{{connection.model}}" class="text_pole" placeholder="Model name">
        
        <label for="stmb-profile-temperature">Temperature:</label>
        <input type="number" id="stmb-profile-temperature" value="{{connection.temperature}}" class="text_pole" min="0" max="2" step="0.1">
    </div>
    
    <div class="completion_prompt_manager_popup_entry_form_control">
        <label for="stmb-profile-prompt">Memory Creation Prompt:</label>
        <textarea id="stmb-profile-prompt" class="text_pole textarea_compact" rows="6" placeholder="Enter the prompt for memory creation">{{prompt}}</textarea>
    </div>
</div>
`);

const confirmationTemplate = Handlebars.compile(`
<div class="completion_prompt_manager_popup_entry">
    <div class="completion_prompt_manager_popup_entry_form_control">
        <h5>Scene Preview:</h5>
        <div class="mes_file_container" style="margin-bottom: 15px;">
            <pre style="margin: 0; white-space: pre-line;">Start: Message #{{sceneStart}} ({{startSpeaker}})
{{startExcerpt}}

End: Message #{{sceneEnd}} ({{endSpeaker}})
{{endExcerpt}}

Messages: {{messageCount}} | Estimated tokens: {{estimatedTokens}}</pre>
        </div>
        
        {{#if showProfileSelect}}
        <label for="stmb-selected-profile">Select Profile:</label>
        <select id="stmb-selected-profile" class="text_pole">
            {{#each profiles}}
            <option value="{{@index}}" {{#if isDefault}}selected{{/if}}>{{name}}</option>
            {{/each}}
        </select>
        {{/if}}
        
        {{#if showWarning}}
        <div class="completion_prompt_manager_error caution" style="margin-top: 10px;">
            <span>⚠️ This is a very large scene and may take some time to process.</span>
        </div>
        {{/if}}
    </div>
</div>
`);

const keywordSelectionTemplate = Handlebars.compile(`
<div class="stmb-keyword-selection-container">
    <div class="completion_prompt_manager_popup_entry">
        <div class="completion_prompt_manager_popup_entry_form_control">
            <h5>Generated Memory:</h5>
            <div class="stmb-scene-preview">{{formattedContent}}</div>
        </div>
        
        <div class="completion_prompt_manager_popup_entry_form_control">
            <h5>Keywords Not Found in AI Response</h5>
            <p>The AI didn't provide keywords with this memory. Choose how you'd like to generate them:</p>
            
            <div class="menu_button" id="stmb-keyword-st-generate">
                <i class="fa-solid fa-cog"></i> ST Generate
                <small style="display: block; margin-top: 4px; opacity: 0.7;">Use SillyTavern's built-in keyword detection</small>
            </div>
            
            <div class="menu_button" id="stmb-keyword-ai-generate">
                <i class="fa-solid fa-robot"></i> AI Keywords  
                <small style="display: block; margin-top: 4px; opacity: 0.7;">Send separate request to AI for keywords only</small>
            </div>
            
            <div class="menu_button" id="stmb-keyword-user-input">
                <i class="fa-solid fa-keyboard"></i> Manual Entry
                <small style="display: block; margin-top: 4px; opacity: 0.7;">Enter your own keywords</small>
            </div>
        </div>
        
        <div class="completion_prompt_manager_popup_entry_form_control" id="stmb-manual-keywords-section" style="display: none;">
            <label for="stmb-manual-keywords">Enter Keywords (comma-separated):</label>
            <textarea id="stmb-manual-keywords" class="text_pole textarea_compact" rows="3" placeholder="keyword1, keyword2, keyword3, character name, location"></textarea>            
            <small style="opacity: 0.7;">Enter 1-8 keywords separated by commas. Each keyword should be 1-25 characters.</small>
        </div>
        
        <div class="completion_prompt_manager_popup_entry_form_control">
            <div class="stmb-keyword-metadata">
                <small style="opacity: 0.6;">
                    Scene: {{displayMetadata.sceneRange}} | Character: {{displayMetadata.characterName}} | Profile: {{displayMetadata.profileUsed}}
                </small>
            </div>
        </div>
    </div>
</div>
`);

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
        profiles: settings.profiles.map((profile, index) => ({
            ...profile,
            isDefault: index === settings.defaultProfile
        })),
        refreshEditor: settings.moduleSettings.refreshEditor,
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
        currentPopupInstance = new Popup(`<h3>📕 Memory Book Settings</h3>${content}`, POPUP_TYPE.TEXT, '', popupOptions);
        await currentPopupInstance.show();
        setupSettingsEventListeners();
    } catch (error) {
        console.error('STMemoryBooks: Error showing settings popup:', error);
        currentPopupInstance = null;
    }
}

/**
 * Setup event listeners for settings popup
 */
function setupSettingsEventListeners() {
    if (!currentPopupInstance) return;
    
    const popupElement = currentPopupInstance.dlg;
    
    // Profile management buttons
    popupElement.querySelector('#stmb-edit-profile')?.addEventListener('click', editProfile);
    popupElement.querySelector('#stmb-new-profile')?.addEventListener('click', newProfile);
    popupElement.querySelector('#stmb-delete-profile')?.addEventListener('click', deleteProfile);
    
    // Import/Export buttons
    popupElement.querySelector('#stmb-export-profiles')?.addEventListener('click', exportProfiles);
    popupElement.querySelector('#stmb-import-profiles')?.addEventListener('click', () => {
        popupElement.querySelector('#stmb-import-file')?.click();
    });
    popupElement.querySelector('#stmb-import-file')?.addEventListener('change', importProfiles);
    
    // Profile selection change
    popupElement.querySelector('#stmb-profile-select')?.addEventListener('change', (e) => {
        const settings = initializeSettings();
        settings.defaultProfile = parseInt(e.target.value);
        saveSettingsDebounced();
    });

    // Title format dropdown
    popupElement.querySelector('#stmb-title-format-select')?.addEventListener('change', (e) => {
        const customInput = popupElement.querySelector('#stmb-custom-title-format');
        if (e.target.value === 'custom') {
            customInput.style.display = 'block';
            customInput.focus();
        } else {
            customInput.style.display = 'none';
            const settings = initializeSettings();
            settings.titleFormat = e.target.value;
            saveSettingsDebounced();
        }
    });

    // Custom title format input
    popupElement.querySelector('#stmb-custom-title-format')?.addEventListener('input', lodash.debounce((e) => {
        const settings = initializeSettings();
        settings.titleFormat = e.target.value;
        saveSettingsDebounced();
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
        const showNotifications = popupElement.querySelector('#stmb-show-notifications')?.checked ?? settings.moduleSettings.showNotifications;
        
        const hasChanges = alwaysUseDefault !== settings.moduleSettings.alwaysUseDefault || 
                          showNotifications !== settings.moduleSettings.showNotifications;
        
        if (hasChanges) {
            settings.moduleSettings.alwaysUseDefault = alwaysUseDefault;
            settings.moduleSettings.showNotifications = showNotifications;
            saveSettingsDebounced();
            console.log('STMemoryBooks: Settings updated');
        }
    } catch (error) {
        console.error('STMemoryBooks: Error handling settings popup close:', error);
    }
    
    currentPopupInstance = null;

    const refreshEditor = popupElement.querySelector('#stmb-refresh-editor')?.checked ?? settings.moduleSettings.refreshEditor;

    const hasChanges = alwaysUseDefault !== settings.moduleSettings.alwaysUseDefault || 
                    showNotifications !== settings.moduleSettings.showNotifications ||
                    refreshEditor !== settings.moduleSettings.refreshEditor;  // ADD THIS

    if (hasChanges) {
        settings.moduleSettings.alwaysUseDefault = alwaysUseDefault;
        settings.moduleSettings.showNotifications = showNotifications;
        settings.moduleSettings.refreshEditor = refreshEditor;  // ADD THIS
        saveSettingsDebounced();
    }
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
            profiles: settings.profiles.map((profile, index) => ({
                ...profile,
                isDefault: index === settings.defaultProfile
            }))
        };
        
        const content = DOMPurify.sanitize(settingsTemplate(templateData));
        const newContent = `<h3>📕 Memory Book Settings</h3>${content}`;
        
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
 * Profile management functions
 */
async function editProfile() {
    const settings = initializeSettings();
    const profileIndex = settings.defaultProfile;
    const profile = settings.profiles[profileIndex];
    
    if (!profile) return;
    
    const templateData = {
        name: profile.name,
        connection: profile.connection,
        prompt: profile.prompt
    };
    
    const content = DOMPurify.sanitize(profileEditTemplate(templateData));
    
    try {
        const result = await new Popup(`<h3>Edit Profile</h3>${content}`, POPUP_TYPE.TEXT, '', {
            okButton: 'Save',
            cancelButton: 'Cancel',
            wide: true
        }).show();
        
        if (result === POPUP_RESULT.AFFIRMATIVE) {
            const popupElement = document.querySelector('.popup');
            const updatedProfile = {
                name: popupElement.querySelector('#stmb-profile-name')?.value || profile.name,
                connection: {
                    engine: popupElement.querySelector('#stmb-profile-engine')?.value || profile.connection.engine,
                    model: popupElement.querySelector('#stmb-profile-model')?.value || profile.connection.model,
                    temperature: parseFloat(popupElement.querySelector('#stmb-profile-temperature')?.value) || profile.connection.temperature
                },
                prompt: popupElement.querySelector('#stmb-profile-prompt')?.value || profile.prompt
            };
            
            settings.profiles[profileIndex] = updatedProfile;
            saveSettingsDebounced();
            refreshPopupContent();
            
            toastr.success('Profile updated successfully', 'STMemoryBooks');
        }
    } catch (error) {
        console.error('STMemoryBooks: Error editing profile:', error);
    }
}

async function newProfile() {
    const templateData = {
        name: 'New Profile',
        connection: {
            engine: 'openai',
            model: 'gpt-4',
            temperature: 0.7
        },
        prompt: 'Create a concise memory from this chat scene. Focus on key plot points, character development, and important interactions.'
    };
    
    const content = DOMPurify.sanitize(profileEditTemplate(templateData));
    
    try {
        const result = await new Popup(`<h3>New Profile</h3>${content}`, POPUP_TYPE.TEXT, '', {
            okButton: 'Create',
            cancelButton: 'Cancel',
            wide: true
        }).show();
        
        if (result === POPUP_RESULT.AFFIRMATIVE) {
            const popupElement = document.querySelector('.popup');
            const newProfile = {
                name: popupElement.querySelector('#stmb-profile-name')?.value || 'New Profile',
                connection: {
                    engine: popupElement.querySelector('#stmb-profile-engine')?.value || 'openai',
                    model: popupElement.querySelector('#stmb-profile-model')?.value || 'gpt-4',
                    temperature: parseFloat(popupElement.querySelector('#stmb-profile-temperature')?.value) || 0.7
                },
                prompt: popupElement.querySelector('#stmb-profile-prompt')?.value || templateData.prompt
            };
            
            const settings = initializeSettings();
            settings.profiles.push(newProfile);
            saveSettingsDebounced();
            refreshPopupContent();
            
            toastr.success('Profile created successfully', 'STMemoryBooks');
        }
    } catch (error) {
        console.error('STMemoryBooks: Error creating profile:', error);
    }
}

async function deleteProfile() {
    const settings = initializeSettings();
    
    if (settings.profiles.length <= 1) {
        toastr.error('Cannot delete the last profile', 'STMemoryBooks');
        return;
    }
    
    const profileIndex = settings.defaultProfile;
    const profile = settings.profiles[profileIndex];
    
    try {
        const result = await new Popup(`Delete profile "${profile.name}"?`, POPUP_TYPE.CONFIRM, '').show();
        
        if (result === POPUP_RESULT.AFFIRMATIVE) {
            settings.profiles.splice(profileIndex, 1);
            
            // Adjust default profile index
            if (settings.defaultProfile >= settings.profiles.length) {
                settings.defaultProfile = settings.profiles.length - 1;
            }
            
            saveSettingsDebounced();
            refreshPopupContent();
            
            toastr.success('Profile deleted successfully', 'STMemoryBooks');
        }
    } catch (error) {
        console.error('STMemoryBooks: Error deleting profile:', error);
    }
}

/**
 * Export profiles to JSON file
 */
function exportProfiles() {
    try {
        const settings = initializeSettings();
        const exportData = {
            profiles: settings.profiles,
            exportDate: moment().toISOString(),
            version: 1
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `stmemorybooks-profiles-${moment().format('YYYY-MM-DD')}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toastr.success('Profiles exported successfully', 'STMemoryBooks');
    } catch (error) {
        console.error('STMemoryBooks: Error exporting profiles:', error);
        toastr.error('Failed to export profiles', 'STMemoryBooks');
    }
}

/**
 * Import profiles from JSON file
 */
function importProfiles(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            
            if (!importData.profiles || !Array.isArray(importData.profiles)) {
                throw new Error('Invalid profile data format');
            }
            
            const settings = initializeSettings();
            
            // Merge profiles (avoid duplicates by name)
            importData.profiles.forEach(importProfile => {
                const exists = settings.profiles.some(p => p.name === importProfile.name);
                if (!exists) {
                    settings.profiles.push(importProfile);
                }
            });
            
            saveSettingsDebounced();
            refreshPopupContent();
            
            toastr.success(`Imported ${importData.profiles.length} profiles`, 'STMemoryBooks');
        } catch (error) {
            console.error('STMemoryBooks: Error importing profiles:', error);
            toastr.error('Failed to import profiles: Invalid file format', 'STMemoryBooks');
        }
    };
    
    reader.readAsText(file);
    
    // Clear the file input
    event.target.value = '';
}

/**
 * Show keyword selection popup when AI doesn't provide keywords
 */
async function showKeywordSelectionPopup(preparedResult) {
    const templateData = {
        formattedContent: preparedResult.formattedContent,
        displayMetadata: preparedResult.displayMetadata
    };
    
    const content = DOMPurify.sanitize(keywordSelectionTemplate(templateData));
    
    return new Promise((resolve) => {
        const popup = new Popup(`<h3>🔤 Choose Keyword Generation Method</h3>${content}`, POPUP_TYPE.TEXT, '', {
            okButton: false,
            cancelButton: 'Cancel',
            wide: true,
            onClose: () => resolve(null)
        });
        
        popup.show().then(() => {
            setupKeywordSelectionEventListeners(popup, resolve);
        });
    });
}

/**
 * Setup event listeners for keyword selection popup
 */
function setupKeywordSelectionEventListeners(popup, resolve) {
    const popupElement = popup.dlg;
    
    // ST Generate button
    popupElement.querySelector('#stmb-keyword-st-generate')?.addEventListener('click', () => {
        popup.completeCancelled();
        resolve({ method: 'st-generate', userKeywords: [] });
    });
    
    // AI Keywords button  
    popupElement.querySelector('#stmb-keyword-ai-generate')?.addEventListener('click', () => {
        popup.completeCancelled();
        resolve({ method: 'ai-keywords', userKeywords: [] });
    });
    
    // Manual Entry button
    popupElement.querySelector('#stmb-keyword-user-input')?.addEventListener('click', () => {
        const manualSection = popupElement.querySelector('#stmb-manual-keywords-section');
        const textArea = popupElement.querySelector('#stmb-manual-keywords');
        
        if (manualSection.style.display === 'none') {
            // Show manual input section
            manualSection.style.display = 'block';
            textArea.focus();
            
            // Add confirm button for manual entry
            let confirmBtn = popupElement.querySelector('#stmb-manual-confirm');
            if (!confirmBtn) {
                confirmBtn = document.createElement('div');
                confirmBtn.id = 'stmb-manual-confirm';
                confirmBtn.className = 'menu_button';
                confirmBtn.innerHTML = '<i class="fa-solid fa-check"></i> Use These Keywords';
                confirmBtn.style.marginTop = '10px';
                
                confirmBtn.addEventListener('click', () => {
                    const keywordText = textArea.value.trim();
                    if (!keywordText) {
                        toastr.warning('Please enter at least one keyword', 'STMemoryBooks');
                        return;
                    }
                    
                    // Parse and validate keywords
                    const userKeywords = keywordText
                        .split(',')
                        .map(k => k.trim())
                        .filter(k => k.length > 0 && k.length <= 25)
                        .slice(0, 8);
                    
                    if (userKeywords.length === 0) {
                        toastr.warning('No valid keywords found. Keywords must be 1-25 characters each.', 'STMemoryBooks');
                        return;
                    }
                    
                    popup.completeCancelled();
                    resolve({ method: 'user-input', userKeywords: userKeywords });
                });
                
                manualSection.appendChild(confirmBtn);
            }
        }
    });
}

/**
 * Initiate memory creation process
 */
async function initiateMemoryCreation() {
    if (isProcessingMemory) {
        toastr.warning('Memory creation already in progress', 'STMemoryBooks');
        return;
    }
    
    const sceneData = getSceneData();
    if (!sceneData) {
        toastr.error('No scene selected', 'STMemoryBooks');
        return;
    }
    
    // Validate lorebook
    const lorebookValidation = await validateLorebook();
    if (!lorebookValidation.valid) {
        toastr.error(lorebookValidation.error, 'STMemoryBooks');
        return;
    }
    
    const settings = initializeSettings();
    
    // Show confirmation if not using default or if large scene
    const shouldShowConfirmation = !settings.moduleSettings.alwaysUseDefault || 
                                  sceneData.estimatedTokens > TOKEN_WARNING_THRESHOLD;
    
    if (shouldShowConfirmation) {
        const confirmed = await showConfirmationPopup(sceneData);
        if (!confirmed) return;
    }
    
    // Close settings popup
    if (currentPopupInstance) {
        currentPopupInstance.completeCancelled();
        currentPopupInstance = null;
    }
    
    // Start processing
    isProcessingMemory = true;
    
    try {
        toastr.info('Compiling scene messages...', 'STMemoryBooks');
        
        // Create scene request
        const sceneRequest = createSceneRequest(sceneData.sceneStart, sceneData.sceneEnd);
        
        // Compile scene using chatcompile.js
        const compiledScene = compileScene(sceneRequest);
        
        // Validate compiled scene
        const validation = validateCompiledScene(compiledScene);
        if (!validation.valid) {
            throw new Error(`Scene compilation failed: ${validation.errors.join(', ')}`);
        }
        
        // Log compilation stats
        const stats = getSceneStats(compiledScene);
        console.log('STMemoryBooks: Scene compilation stats:', stats);
        
        // Show detailed progress
        const actualTokens = estimateTokenCount(compiledScene);
        toastr.info(`Compiled ${stats.messageCount} messages (~${actualTokens} tokens)`, 'STMemoryBooks');
        
        // Call stmemory.js with compiledScene
        const memoryResult = await createMemory(compiledScene, settings.profiles[settings.defaultProfile]);
        
        // Check if keywords need user selection
        if (memoryResult.needsKeywordGeneration) {
            console.log('STMemoryBooks: Keywords need user selection, showing keyword dialog');
            
            // Prepare formatted content for display
            const preparedResult = prepareForKeywordDialog(memoryResult);
            
            // Show keyword selection dialog
            const keywordChoice = await showKeywordSelectionPopup(preparedResult);
            if (!keywordChoice) {
                // User cancelled
                isProcessingMemory = false;
                return;
            }
            
            // Complete memory creation with user's keyword choice
            toastr.info('Completing memory with selected keyword method...', 'STMemoryBooks');
            const finalMemoryResult = await completeMemoryWithKeywords(
                memoryResult, 
                keywordChoice.method, 
                keywordChoice.userKeywords
            );
            
            // TODO: Call addlore.js to add the memory to lorebook
            // await addMemoryToLorebook(finalMemoryResult, lorebookValidation.data);
            
            // Success
            setTimeout(() => {
                toastr.success(`Memory created with ${keywordChoice.method} keywords!`, 'STMemoryBooks');
                isProcessingMemory = false;
            }, 1000);
            
        } else {
            // Normal flow - keywords were found in AI response
            // TODO: Call addlore.js to add the memory to lorebook  
            // await addMemoryToLorebook(memoryResult, lorebookValidation.data);
            
            // Placeholder success message
            setTimeout(() => {
                toastr.success(`Memory created from ${stats.messageCount} messages!`, 'STMemoryBooks');
                isProcessingMemory = false;
            }, 2000);
        }
        
    } catch (error) {
        console.error('STMemoryBooks: Error creating memory:', error);
        toastr.error(`Failed to create memory: ${error.message}`, 'STMemoryBooks');
        isProcessingMemory = false;
    }
}

/**
 * Show confirmation popup for memory creation
 */
async function showConfirmationPopup(sceneData) {
    const settings = initializeSettings();
    
    const templateData = {
        ...sceneData,
        showProfileSelect: !settings.moduleSettings.alwaysUseDefault,
        showWarning: sceneData.estimatedTokens > TOKEN_WARNING_THRESHOLD,
        profiles: settings.profiles.map((profile, index) => ({
            ...profile,
            isDefault: index === settings.defaultProfile
        }))
    };
    
    const content = DOMPurify.sanitize(confirmationTemplate(templateData));
    
    try {
        const result = await new Popup(`<h3>Create Memory</h3>${content}`, POPUP_TYPE.TEXT, '', {
            okButton: 'Create Memory',
            cancelButton: 'Cancel',
            wide: true
        }).show();
        
        return result === POPUP_RESULT.AFFIRMATIVE;
    } catch (error) {
        console.error('STMemoryBooks: Error showing confirmation popup:', error);
        return false;
    }
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
    const range = args.trim();
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
    
    // Set markers and update UI
    const markers = getSceneMarkers();
    markers.sceneStart = startId;
    markers.sceneEnd = endId;
    
    currentSceneState.start = startId;
    currentSceneState.end = endId;
    
    saveMetadataDebounced();
    updateAllButtonStates();
    
    toastr.info(`Scene set: messages ${startId}-${endId}`, 'STMemoryBooks');
    
    // Optionally create memory immediately
    setTimeout(() => initiateMemoryCreation(), 500);
}

/**
 * Register slash commands using proper SlashCommand classes
 */
function registerSlashCommands() {
    const createMemoryCmd = new SlashCommand({
        name: 'creatememory',
        callback: handleCreateMemoryCommand,
        helpString: 'Create memory from marked scene'
    });
    
    const sceneMemoryCmd = new SlashCommand({
        name: 'scenememory', 
        callback: handleSceneMemoryCommand,
        helpString: 'Set scene range and create memory (e.g., /scenememory 10-15)',
        arguments: [
            new SlashCommandArgument('range', 'Message range (X-Y format)')
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
 * Setup event listeners - simplified with separated handlers
 */
function setupEventListeners() {
    // UI events
    $(document).on('click', SELECTORS.menuItem, showSettingsPopup);
    
    // SillyTavern events - cleaner with proper imports
    eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, handleMessageRendered);
    eventSource.on(event_types.CHAT_CHANGED, handleChatChanged);
    eventSource.on(event_types.CHAT_LOADED, handleChatLoaded);
    eventSource.on(event_types.MESSAGE_DELETED, handleMessageDeletion);
    eventSource.on(event_types.MESSAGE_RECEIVED, handleMessageReceived);
    
    console.log('STMemoryBooks: Event listeners registered');
}

/**
 * Initialize the extension
 */
async function init() {
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
    
    // Initialize settings
    const settings = initializeSettings();
    console.log('STMemoryBooks: Settings initialized');
    
    // Initialize scene state
    const markers = getSceneMarkers();
    currentSceneState.start = markers.sceneStart;
    currentSceneState.end = markers.sceneEnd;
    
    // Create UI
    createUI();
    
    // Setup event listeners
    setupEventListeners();
    
    // Register slash commands
    registerSlashCommands();
    
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