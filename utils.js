import { chat_metadata, characters, name2, this_chid } from '../../../../script.js';
import { getContext, extension_settings } from '../../../extensions.js';
import { selected_group, groups } from '../../../group-chats.js';
import { METADATA_KEY, world_names } from '../../../world-info.js';
import { Popup, POPUP_TYPE, POPUP_RESULT } from '../../../popup.js';
import { getSceneMarkers, saveMetadataForCurrentContext } from './sceneManager.js';


const MODULE_NAME = 'STMemoryBooks-Utils';
const $ = window.jQuery;

// Prefer the first selector that exists in the DOM
function pick$(...selectors) {
    for (const s of selectors) {
        const $el = $(s);
        if ($el.length) return $el;
    }
    return $(); // empty jQuery
}

// Returns '#group_' if group UI controls are present, otherwise '#'
function groupPrefix() {
    return document.querySelector('#group_chat_completion_source') ? '#group_' : '#';
}

// Centralized DOM selectors - single source of truth
export const SELECTORS = {
    extensionsMenu: '#extensionsMenu .list-group',
    menuItem: '#stmb-menu-item',
    bookmarksMenuItem: '#stmb-bookmarks-menu-item',
    chatContainer: '#chat',
    // Bookmark UI selectors
    sortToggle: '#stmb-sort-toggle',
    createBookmark: '#stmb-create-bookmark',
    editBookmark: '.edit-bookmark',
    deleteBookmark: '.delete-bookmark',
    bookmarkContent: '.bookmark-content',
    // API and model selectors for profile settings
    mainApi: '#main_api',
    completionSource: '#chat_completion_source',
    modelOpenai: '#model_openai_select',
    modelClaude: '#model_claude_select',
    modelOpenrouter: '#model_openrouter_select',
    modelAi21: '#model_ai21_select',
    modelGoogle: '#model_google_select',
    modelMistralai: '#model_mistralai_select',
    modelCohere: '#model_cohere_select',
    modelPerplexity: '#model_perplexity_select',
    modelGroq: '#model_groq_select',
    modelNanogpt: '#model_nanogpt_select',
    modelDeepseek: '#model_deepseek_select',
    modelElectronhub: '#model_electronhub_select',
    modelVertexai: '#model_vertexai_select',
    modelAimlapi: '#model_aimlapi_select',
    modelXai: '#model_xai_select',
    modelPollinations: '#model_pollinations_select',
    modelMoonshot: '#model_moonshot_select',
    modelFireworks: '#model_fireworks_select',
    modelCometapi: '#model_cometapi_select',
    modelAzureOpenai: '#model_azure_openai_select',
    tempOpenai: '#temp_openai',
    tempCounterOpenai: '#temp_counter_openai'
};

// Supported Chat Completion sources - BULLETPROOF
const SUPPORTED_COMPLETION_SOURCES = [
    'openai', 'claude', 'openrouter', 'ai21', 'makersuite', 'vertexai',
    'mistralai', 'custom', 'cohere', 'perplexity', 'groq', 'nanogpt',
    'deepseek', 'electronhub', 'aimlapi', 'xai', 'pollinations',
    'moonshot', 'fireworks', 'cometapi', 'azure_openai'
];

/**
 * BULLETPROOF: Get current API and completion source information with comprehensive error handling
 */
export function getCurrentApiInfo() {
    try {
        let api = 'unknown';
        let model = 'unknown';
        let completionSource = 'unknown';

        // Try SillyTavern's built-in functions first
        if (typeof window.getGeneratingApi === 'function') {
            api = window.getGeneratingApi();
        } else {
            api = $(SELECTORS.mainApi).val() || 'unknown';
        }

        if (typeof window.getGeneratingModel === 'function') {
            model = window.getGeneratingModel();
        }

        completionSource = $(SELECTORS.completionSource).val() || api;

        // Validate completion source
        if (!SUPPORTED_COMPLETION_SOURCES.includes(completionSource)) {
            console.warn(`${MODULE_NAME}: Unsupported completion source: ${completionSource}, falling back to openai`);
            completionSource = 'openai';
        }

        return { api, model, completionSource };
    } catch (e) {
        console.warn(`${MODULE_NAME}: Error getting API info:`, e);
        return {
            api: $(SELECTORS.mainApi).val() || 'unknown',
            model: 'unknown',
            completionSource: $(SELECTORS.completionSource).val() || 'openai'
        };
    }
}

/**
 * BULLETPROOF: Get the appropriate model and temperature selectors for current completion source
 */
export function getApiSelectors() {
    const prefix = groupPrefix();

    // current completion source from active UI (group or normal)
    const $source = pick$(`${prefix}chat_completion_source`, '#chat_completion_source');
    const completionSource = ($source.val?.() || 'openai');

    // Model selectors per provider/source (group-aware via prefix)
    const modelSelectorMap = {
        openai:        `${prefix}model_openai_select`,
        claude:        `${prefix}model_claude_select`,
        openrouter:    `${prefix}model_openrouter_select`,
        ai21:          `${prefix}model_ai21_select`,
        makersuite:    `${prefix}model_google_select`,
        mistralai:     `${prefix}model_mistralai_select`,
        custom:        `${prefix}model_custom_select`,
        cohere:        `${prefix}model_cohere_select`,
        perplexity:    `${prefix}model_perplexity_select`,
        groq:          `${prefix}model_groq_select`,
        nanogpt:       `${prefix}model_nanogpt_select`,
        deepseek:      `${prefix}model_deepseek_select`,
        electronhub:   `${prefix}model_electronhub_select`,
        vertexai:      `${prefix}model_vertexai_select`,
        aimlapi:       `${prefix}model_aimlapi_select`,
        xai:           `${prefix}model_xai_select`,
        pollinations:  `${prefix}model_pollinations_select`,
        moonshot:      `${prefix}model_moonshot_select`,
        fireworks:     `${prefix}model_fireworks_select`,
        cometapi:      `${prefix}model_cometapi_select`,
        azure_openai:  `${prefix}model_azure_openai_select`,
    };

    const model = modelSelectorMap[completionSource] || modelSelectorMap.openai;

    // Temps share same ids per UI set
    const temp = `${prefix}temp_openai`.replace('##', '#');
    const tempCounter = `${prefix}temp_counter_openai`.replace('##', '#');

    return { model, temp, tempCounter };
}

/**
 * GROUP CHAT SUPPORT: Get current context - detects group vs single character chats
 * @returns {Object} Context information including group/character detection
 */
export function getCurrentMemoryBooksContext() {
    try {
        let characterName = null;
        let chatId = null;
        let chatName = null;

        // Check if we're in a group chat (following group-chats.js pattern)
        const isGroupChat = !!selected_group;
        const groupId = selected_group || null;
        let groupName = null;

        if (isGroupChat) {
            // Group chat context (following group-chats.js pattern)
            const group = groups?.find(x => x.id === groupId);
            if (group) {
                groupName = group.name;
                chatId = group.chat_id;
                chatName = chatId;
                // For group chats, use the group name as the "character" identifier for compatibility
                characterName = groupName;
            }
        } else {
            // Single character chat context (following group-chats.js and script.js patterns)
            
            // Method 1: Use name2 variable (primary character name from script.js)
            if (name2 && name2.trim()) {
                characterName = String(name2).trim();
            }
            // Method 2: Try to get current character from characters array and this_chid
            else if (this_chid !== undefined && characters && characters[this_chid]) {
                characterName = characters[this_chid].name;
            }
            // Method 3: Try chat_metadata.character_name as fallback
            else if (chat_metadata?.character_name) {
                characterName = String(chat_metadata.character_name).trim();
            }
            
            // Normalize unicode characters for consistency
            if (characterName && characterName.normalize) {
                characterName = characterName.normalize('NFC');
            }

            // Get chat information using SillyTavern's context system
            try {
                const context = getContext();
                if (context?.chatId) {
                    chatId = context.chatId;
                    chatName = chatId;
                } else if (typeof window.getCurrentChatId === 'function') {
                    chatId = window.getCurrentChatId();
                    chatName = chatId;
                }
            } catch (error) {
                console.warn(`${MODULE_NAME}: Could not get context, trying fallback methods`);
                if (typeof window.getCurrentChatId === 'function') {
                    chatId = window.getCurrentChatId();
                    chatName = chatId;
                }
            }
        }

        // Get bound lorebook information
        let lorebookName = null;
        if (chat_metadata && METADATA_KEY in chat_metadata) {
            lorebookName = chat_metadata[METADATA_KEY];
        }

        // Get current model/temperature settings (following ModelTempLocks approach)
        let modelSettings = null;
        
        try {
            // Get API info using the same method as ModelTempLocks
            const currentApiInfo = getCurrentApiInfo();
            
            // Get temperature using the same method as ModelTempLocks
            const apiSelectors = getApiSelectors();
            const currentTemp = parseFloat($(apiSelectors.temp).val() || $(apiSelectors.tempCounter).val() || 0.7);
            
            // Get model using the same method as ModelTempLocks
            let currentModel = '';
            if (currentApiInfo.completionSource === 'custom') {
                currentModel = $(SELECTORS.customModelId).val() || $(SELECTORS.modelCustomSelect).val() || '';
            } else {
                currentModel = $(apiSelectors.model).val() || '';
            }
            
            modelSettings = {
                api: currentApiInfo.api,
                model: currentModel,
                temperature: currentTemp,
                completionSource: currentApiInfo.completionSource,
                source: 'current_ui'
            };
            
        } catch (error) {
            console.warn(`${MODULE_NAME}: Could not get current model/temperature settings:`, error);
            modelSettings = null;
        }

        const result = {
            characterName,
            chatId,
            chatName,
            groupId,
            isGroupChat,
            lorebookName,
            modelSettings
        };

        // Add group-specific properties when in group chat
        if (isGroupChat) {
            result.groupName = groupName;
        }
        return result;

    } catch (error) {
        console.warn(`${MODULE_NAME}: Error getting context:`, error);
        return {
            characterName: null,
            chatId: null,
            chatName: null,
            groupId: null,
            groupName: null,
            isGroupChat: false
        };
    }
}

/**
 * Determines which lorebook to use based on settings and chat metadata.
 * If in manual mode and no lorebook is set, it will trigger a selection popup.
 * @returns {Promise<string|null>} The name of the effective lorebook, or null if none is available/selected.
 */
export async function getEffectiveLorebookName() {
    const settings = extension_settings.STMemoryBooks;
    
    // If manual mode is OFF, use the default chat-bound lorebook
    if (!settings.moduleSettings.manualModeEnabled) {
        return chat_metadata?.[METADATA_KEY] || null;
    }

    // Manual mode is ON. Check if a manual lorebook has already been designated for this chat.
    const stmbData = getSceneMarkers(); // This function already gets the right metadata object
    if (stmbData.manualLorebook) {
        // Ensure the designated lorebook still exists
        if (world_names.includes(stmbData.manualLorebook)) {
            return stmbData.manualLorebook;
        } else {
            toastr.error(`The designated manual lorebook "${stmbData.manualLorebook}" no longer exists. Please select a new one.`);
            delete stmbData.manualLorebook; // Clear the invalid entry
        }
    }

    // No manual lorebook is set. We need to ask the user.
    const lorebookOptions = world_names.map(name => `<option value="${name}">${name}</option>`).join('');
    
    if (lorebookOptions.length === 0) {
        toastr.error('No lorebooks found to select from.', 'STMemoryBooks');
        return null;
    }

    const popupContent = `
        <h4>Select a Memory Book</h4>
        <div class="world_entry_form_control">
            <p>Manual mode is enabled, but no lorebook has been designated for this chat's memories. Please select one.</p>
            <select id="stmb-manual-lorebook-select" class="text_pole">
                ${lorebookOptions}
            </select>
        </div>
    `;

    const popup = new Popup(popupContent, POPUP_TYPE.TEXT, '', { okButton: 'Select', cancelButton: 'Cancel' });
    const result = await popup.show();

    if (result === POPUP_RESULT.AFFIRMATIVE) {
        const selectedLorebook = popup.dlg.querySelector('#stmb-manual-lorebook-select').value;
        
        // Save the selection to the chat's metadata
        stmbData.manualLorebook = selectedLorebook;
        saveMetadataForCurrentContext(); // Use the existing function from sceneManager to save correctly for groups/single chats
        
        toastr.success(`"${selectedLorebook}" is now the Memory Book for this chat.`, 'STMemoryBooks');
        return selectedLorebook;
    }

    // User cancelled the selection
    toastr.warning('Memory creation cancelled. No lorebook was selected.', 'STMemoryBooks');
    return null;
}

/**
 * Get current model and temperature settings with comprehensive validation
 */
export function getCurrentModelSettings() {
    try {
        const selectors = getApiSelectors();
        const currentModel = $(selectors.model).val() || '';
        let currentTemp = 0.7;
        const tempValue = $(selectors.temp).val() || $(selectors.tempCounter).val();
        if (tempValue !== null && tempValue !== undefined && tempValue !== '') {
            const parsedTemp = parseFloat(tempValue);
            if (!isNaN(parsedTemp) && parsedTemp >= 0 && parsedTemp <= 2) {
                currentTemp = parsedTemp;
            }
        }
        return {
            model: currentModel,
            temperature: currentTemp,
        };
    } catch (error) {
        console.warn(`${MODULE_NAME}: Error getting current model settings:`, error);
        return {
            model: '',
            temperature: 0.7
        };
    }
}


/**
 * Preset prompt definitions - Updated for JSON structured output
 * All prompts now explicitly instruct the AI to return valid JSON with specific schema
 */
export const PRESET_PROMPTS = {
    'summary': "You are a talented summarist skilled at capturing scenes from stories comprehensively. Analyze the following roleplay scene and return a detailed memory as JSON.\n\n" +
               "You must respond with ONLY valid JSON in this exact format:\n" +
               "{\n" +
               '  "title": "Short scene title (1-3 words)",\n' +
               '  "content": "Detailed beat-by-beat summary in narrative prose...",\n' +
               '  "keywords": ["keyword1", "keyword2", "keyword3"]\n' +
               "}\n\n" +
               "For the content field, create a detailed beat-by-beat summary in narrative prose. First, estimate where in the story timeline (day X) this scene is based on earlier scene summaries included (if any). Then capture this scene accurately without losing ANY important information. This summary will go in a vectorized database, so include:\n" +
               "- All important story beats/events that happened\n" +
               "- Key interaction highlights and character developments\n" +
               "- Notable details, memorable quotes, and revelations\n" +
               "- Outcome and anything else important for future interactions between {{user}} and {{char}}\n" +
               "Capture ALL nuance without repeating verbatim. Make it comprehensive yet digestible.\n\n" +
               "For the keywords field, provide 5-20 relevant keywords for vectorized database retrieval. Do not use `{{char}}` or `{{user}}` as keywords.\n\n" +
               "Return ONLY the JSON, no other text.",

    'summarize': "Analyze the following roleplay scene and return a structured summary as JSON.\n\n" +
                 "You must respond with ONLY valid JSON in this exact format:\n" +
                 "{\n" +
                 '  "title": "Short scene title (1-3 words)",\n' +
                 '  "content": "Detailed summary with markdown headers...",\n' +
                 '  "keywords": ["keyword1", "keyword2", "keyword3"]\n' +
                 "}\n\n" +
                 "For the content field, create a detailed summary using markdown with these headers:\n" +
                 "- **Timeline**: Start with an estimation of the story timeline (e.g., Day 1, Day 2) based on earlier scene summaries included (if any).\n" +
                 "- **Story Beats**: List all important plot events and story developments that occurred.\n" +
                 "- **Key Interactions**: Describe the important character interactions, dialogue highlights, and relationship developments.\n" +
                 "- **Notable Details**: Mention any important objects, settings, revelations, or details that might be relevant for future interactions.\n" +
                 "- **Outcome**: Summarize the result, resolution, or state of affairs at the end of the scene.\n\n" +
                 "For the keywords field, provide 5-20 relevant keywords that would help a vectorized database find this conversation again if something is mentioned. Do not use `{{char}}` or `{{user}}` as keywords.\n\n" +
                 "Ensure you capture ALL important information - comprehensive detail is more important than brevity.\n\n" +
                 "Return ONLY the JSON, no other text.",

    'synopsis': "Analyze the following roleplay scene and return a comprehensive synopsis as JSON.\n\n" +
                "You must respond with ONLY valid JSON in this exact format:\n" +
                "{\n" +
                '  "title": "Short scene title (1-3 words)",\n' +
                '  "content": "Long detailed synopsis with markdown structure...",\n' +
                '  "keywords": ["keyword1", "keyword2", "keyword3"]\n' +
                "}\n\n" +
                "For the content field, create a long and detailed beat-by-beat summary using markdown structure. Start by estimating where in the story timeline (day X) this scene falls based on earlier scene summaries included (if any). Then write a thorough summary that captures the most recent scene accurately without losing ANY information. Use this structure:\n" +
                "# [Scene Title]\n" +
                "**Timeline**: Day X estimation\n" +
                "## Story Beats\n" +
                "- (List all important plot events and developments)\n" +
                "## Key Interactions\n" +
                "- (Detail all significant character interactions and dialogue)\n" +
                "## Notable Details\n" +
                "- (Include memorable quotes, revelations, objects, settings)\n" +
                "## Outcome\n" +
                "- (Describe results, resolutions, and final state)\n\n" +
                "Include EVERYTHING important for future interactions between {{user}} and {{char}}. Capture all nuance without regurgitating verbatim.\n\n" +
                "For the keywords field, provide 5-20 relevant keywords for vectorized database retrieval. Do not use `{{char}}` or `{{user}}` as keywords.\n\n" +
                "Return ONLY the JSON, no other text.",

    'sumup': "Analyze the following roleplay scene and return a beat summary as JSON.\n\n" +
             "You must respond with ONLY valid JSON in this exact format:\n" +
             "{\n" +
             '  "title": "Short scene title (1-3 words)",\n' +
             '  "content": "Comprehensive beat summary...",\n' +
             '  "keywords": ["keyword1", "keyword2", "keyword3"]\n' +
             "}\n\n" +
             "For the content field, write a comprehensive beat summary that captures this scene completely. Format it as:\n" +
             "# Scene Summary - Day X - [Title]\n" +
             "First estimate where in the story timeline (day X) this scene falls based on earlier scene summaries included (if any). Then narrate ALL important story beats/events that happened, key interaction highlights, notable details, memorable quotes, character developments, and outcome. Ensure no important information is lost.\n\n" +
             "For the keywords field, provide 5-20 relevant keywords that would help a vectorized database find this summary again if mentioned. Do not use `{{char}}` or `{{user}}` as keywords.\n\n" +
             "Return ONLY the JSON, no other text.",

    'minimal': "Analyze the following roleplay scene and return a minimal memory entry as JSON.\n\n" +
                "You must respond with ONLY valid JSON in this exact format:\n" +
                "{\n" +
                '  "title": "Short scene title (1-3 words)",\n' +
                '  "content": "Brief 1-2 sentence summary...",\n' +
                '  "keywords": ["keyword1", "keyword2", "keyword3"]\n' +
                "}\n\n" +
                "For the content field, provide a very brief 1-2 sentence summary of what happened in this scene.\n\n" +
                "For the keywords field, generate 5-20 highly relevant keywords for database retrieval - focus on the most important terms that would help find this scene later. Do not use `{{char}}` or `{{user}}` as keywords.\n\n" +
                "Return ONLY the JSON, no other text."
};

/**
 * Default fallback prompt for JSON output
 */
export const DEFAULT_PROMPT = 'Analyze the following chat scene and return a memory as JSON.\n\n' +
                              'You must respond with ONLY valid JSON in this exact format:\n' +
                              '{\n' +
                              '  "title": "Short scene title (1-3 words)",\n' +
                              '  "content": "Concise memory focusing on key plot points, character development, and important interactions",\n' +
                              '  "keywords": ["keyword1", "keyword2", "keyword3"]\n' +
                              '}\n\n' +
                              'Return ONLY the JSON, no other text.';

/**
 * Get preset prompt based on preset name
 * @param {string} presetName - Name of the preset
 * @returns {string} The prompt text
 */
export function getPresetPrompt(presetName) {
    return PRESET_PROMPTS[presetName] || DEFAULT_PROMPT;
}

/**
 * Get effective prompt from profile
 * Determines whether to use custom prompt, preset, or default
 * @param {Object} profile - Profile object
 * @returns {string} The effective prompt to use
 */
export function getEffectivePrompt(profile) {
    if (!profile) {
        return DEFAULT_PROMPT;
    }
    
    if (profile.prompt && profile.prompt.trim()) {
        return profile.prompt;
    } else if (profile.preset) {
        return getPresetPrompt(profile.preset);
    } else {
        return DEFAULT_PROMPT;
    }
}

/**
 * Validate profile structure
 * @param {Object} profile - Profile to validate
 * @returns {boolean} Whether the profile is valid
 */
export function validateProfile(profile) {
    if (!profile || typeof profile !== 'object') {
        console.warn(`${MODULE_NAME}: Profile validation failed - not an object`);
        return false;
    }
    
    if (!profile.name || typeof profile.name !== 'string') {
        console.warn(`${MODULE_NAME}: Profile validation failed - invalid name`);
        return false;
    }
    
    // Connection is optional but if present should be an object
    if (profile.connection && typeof profile.connection !== 'object') {
        console.warn(`${MODULE_NAME}: Profile validation failed - invalid connection`);
        return false;
    }
    
    return true;
}

/**
 * Deep clone an object (simplified lodash.cloneDeep alternative)
 * @param {any} obj - Object to clone
 * @returns {any} Deep cloned object
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => deepClone(item));
    }
    
    const cloned = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    
    return cloned;
}

/**
 * Get all available preset names
 * @returns {string[]} Array of preset names
 */
export function getPresetNames() {
    return Object.keys(PRESET_PROMPTS);
}

/**
 * Check if a preset name is valid
 * @param {string} presetName - Preset name to check
 * @returns {boolean} Whether the preset exists
 */
export function isValidPreset(presetName) {
    return PRESET_PROMPTS.hasOwnProperty(presetName);
}

/**
 * Generate a safe profile name from user input
 * @param {string} input - User input
 * @param {string[]} existingNames - Array of existing profile names
 * @returns {string} Safe, unique profile name
 */
export function generateSafeProfileName(input, existingNames = []) {
    if (!input || typeof input !== 'string') {
        input = 'New Profile';
    }
    
    // Clean the input
    let safeName = input.trim().replace(/[<>:"/\\|?*]/g, '');
    if (!safeName) {
        safeName = 'New Profile';
    }
    
    // Ensure uniqueness
    let finalName = safeName;
    let counter = 1;
    
    while (existingNames.includes(finalName)) {
        finalName = `${safeName} (${counter})`;
        counter++;
    }
    
    return finalName;
}

/**
 * Parse temperature value from string input
 * @param {string|number} input - Temperature input
 * @returns {number|null} Parsed temperature or null if invalid
 */
export function parseTemperature(input) {
    if (typeof input === 'number') {
        return isNaN(input) ? null : Math.max(0, Math.min(2, input));
    }
    
    if (typeof input === 'string') {
        const parsed = parseFloat(input);
        return isNaN(parsed) ? null : Math.max(0, Math.min(2, parsed));
    }
    
    return null;
}

/**
 * Format preset name for display
 * @param {string} presetName - Internal preset name
 * @returns {string} Display-friendly name
 */
export function formatPresetDisplayName(presetName) {
    const displayNames = {
        'summary': 'Summary - Detailed beat-by-beat summaries',
        'summarize': 'Summarize - Bullet-point format',
        'synopsis': 'Synopsis - Comprehensive with headings',
        'sumup': 'Sum Up - Concise story beats',
        'minimal': 'Minimal - Brief 1-2 sentence summary'
    };
    
    return displayNames[presetName] || presetName;
}

/**
 * Creates a clean, validated profile object from raw data.
 * This centralizes profile creation logic from all parts of the extension.
 * @param {Object} data - Raw data for the profile.
 * @param {string} data.name - The desired profile name.
 * @param {string} [data.api='openai'] - The API provider.
 * @param {string} [data.model=''] - The model identifier.
 * @param {number|string} [data.temperature=0.7] - The temperature setting.
 * @param {string} [data.prompt=''] - The custom prompt.
 * @param {string} [data.preset=''] - The selected preset.
 * @param {string} [data.titleFormat=''] - The title format for lorebook entries.
 * @param {string} [data.constVectMode='link'] - The constant/vectorized mode.
 * @param {number} [data.position=0] - The lorebook entry position.
 * @param {string} [data.orderMode='auto'] - The ordering mode.
 * @param {number} [data.orderValue=100] - The manual order value.
 * @param {boolean} [data.preventRecursion=true] - The prevent recursion flag.
 * @param {boolean} [data.delayUntilRecursion=true] - The delay until recursion flag.
 * @returns {Object} A structured and validated profile object.
 */
export function createProfileObject(data = {}) {
    let temperature = parseTemperature(data.temperature);
    if (temperature === null) {
        temperature = 0.7;
    }

    const profile = {
        name: (data.name || 'New Profile').trim(),
        connection: {
            api: data.api || 'openai',
            temperature: temperature,
        },
        prompt: (data.prompt || '').trim(),
        preset: data.preset || '',
        constVectMode: data.constVectMode || 'link',
        position: data.position !== undefined ? Number(data.position) : 0,
        orderMode: data.orderMode || 'auto',
        orderValue: data.orderValue !== undefined ? Number(data.orderValue) : 100,
        preventRecursion: data.preventRecursion !== undefined ? data.preventRecursion : true,
        delayUntilRecursion: data.delayUntilRecursion !== undefined ? data.delayUntilRecursion : true,
    };

    // Set titleFormat if explicitly provided, or if it's not a dynamic profile
    if (data.titleFormat || !data.isDynamicProfile) {
        profile.titleFormat = data.titleFormat || '[000] - {{title}}';
    }

    const model = (data.model || '').trim();
    if (model) {
        profile.connection.model = model;
    }

    // Add endpoint and apiKey for full-manual configuration
    const endpoint = (data.endpoint || '').trim();
    if (endpoint) {
        profile.connection.endpoint = endpoint;
    }

    const apiKey = (data.apiKey || '').trim();
    if (apiKey) {
        profile.connection.apiKey = apiKey;
    }

    // A profile should have a preset OR a custom prompt. The custom prompt takes precedence.
    if (profile.prompt && profile.preset) {
        profile.preset = '';
    }
    
    // If there's no custom prompt and no preset specified, default to the 'summary' preset.
    if (!profile.prompt && !profile.preset) {
        profile.preset = 'summary'; 
    }

    return profile;
}