// utils.js - Shared utilities for STMemoryBooks
import { chat_metadata, characters, name2, this_chid } from '../../../../script.js';
import { getContext, extension_settings, saveMetadataDebounced } from '../../../extensions.js';
import { selected_group, groups } from '../../../group-chats.js';
import { world_names } from '../../../../world-info.js';
import { Popup, POPUP_TYPE, POPUP_RESULT } from '../../../popup.js';
import { getSceneMarkers, saveMetadataForCurrentContext } from './sceneManager.js';


const MODULE_NAME = 'STMemoryBooks-Utils';
const $ = window.jQuery;

// Centralized DOM selectors - single source of truth
export const SELECTORS = {
    extensionsMenu: '#extensionsMenu .list-group',
    menuItem: '#stmb-menu-item',
    chatContainer: '#chat',
    // API and model selectors for profile settings
    mainApi: '#main_api',
    completionSource: '#chat_completion_source',
    modelOpenai: '#model_openai_select',
    modelClaude: '#model_claude_select',
    modelWindowai: '#model_windowai_select',
    modelOpenrouter: '#model_openrouter_select',
    modelAi21: '#model_ai21_select',
    modelScale: '#model_scale_select',
    modelGoogle: '#model_google_select',
    modelMistralai: '#model_mistralai_select',
    customModelId: '#custom_model_id',
    modelCustomSelect: '#model_custom_select',
    modelCohere: '#model_cohere_select',
    modelPerplexity: '#model_perplexity_select',
    modelGroq: '#model_groq_select',
    model01ai: '#model_01ai_select',
    modelNanogpt: '#model_nanogpt_select',
    modelDeepseek: '#model_deepseek_select',
    modelBlockentropy: '#model_blockentropy_select',
    tempOpenai: '#temp_openai',
    tempCounterOpenai: '#temp_counter_openai'
};

// Supported Chat Completion sources - BULLETPROOF
const SUPPORTED_COMPLETION_SOURCES = [
    'openai', 'claude', 'windowai', 'openrouter', 'ai21', 'scale', 'makersuite',
    'mistralai', 'custom', 'cohere', 'perplexity', 'groq', '01ai', 'nanogpt',
    'deepseek', 'blockentropy'
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
    const completionSource = $(SELECTORS.completionSource).val();
    
    const modelSelectorMap = {
        'openai': SELECTORS.modelOpenai,
        'claude': SELECTORS.modelClaude,
        'windowai': SELECTORS.modelWindowai,
        'openrouter': SELECTORS.modelOpenrouter,
        'ai21': SELECTORS.modelAi21,
        'scale': SELECTORS.modelScale,
        'makersuite': SELECTORS.modelGoogle,
        'mistralai': SELECTORS.modelMistralai,
        'custom': SELECTORS.customModelId,
        'cohere': SELECTORS.modelCohere,
        'perplexity': SELECTORS.modelPerplexity,
        'groq': SELECTORS.modelGroq,
        '01ai': SELECTORS.model01ai,
        'nanogpt': SELECTORS.modelNanogpt,
        'deepseek': SELECTORS.modelDeepseek,
        'blockentropy': SELECTORS.modelBlockentropy
    };
    
    return {
        model: modelSelectorMap[completionSource] || SELECTORS.modelOpenai,
        temp: SELECTORS.tempOpenai,
        tempCounter: SELECTORS.tempCounterOpenai
    };
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

        // Debug: Check what's available for context detection
        console.log(`${MODULE_NAME}: Debug - selected_group:`, selected_group);
        console.log(`${MODULE_NAME}: Debug - groups length:`, groups?.length || 'undefined');
        console.log(`${MODULE_NAME}: Debug - name2:`, name2);
        console.log(`${MODULE_NAME}: Debug - this_chid:`, this_chid);
        console.log(`${MODULE_NAME}: Debug - chat_metadata:`, chat_metadata);
        console.log(`${MODULE_NAME}: Debug - chat_metadata keys:`, Object.keys(chat_metadata || {}));

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
                console.log(`${MODULE_NAME}: Debug - Group chat detected: ${groupName}`);
            }
        } else {
            // Single character chat context (following group-chats.js and script.js patterns)
            
            // Method 1: Use name2 variable (primary character name from script.js)
            if (name2 && name2.trim()) {
                characterName = String(name2).trim();
                console.log(`${MODULE_NAME}: Debug - Using name2:`, characterName);
            }
            // Method 2: Try to get current character from characters array and this_chid
            else if (this_chid !== undefined && characters && characters[this_chid]) {
                characterName = characters[this_chid].name;
                console.log(`${MODULE_NAME}: Debug - Using characters[this_chid].name:`, characterName);
            }
            // Method 3: Try chat_metadata.character_name as fallback
            else if (chat_metadata?.character_name) {
                characterName = String(chat_metadata.character_name).trim();
                console.log(`${MODULE_NAME}: Debug - Using chat_metadata.character_name:`, characterName);
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
        if (chat_metadata?.world_info) {
            lorebookName = chat_metadata.world_info;
            console.log(`${MODULE_NAME}: Debug - Bound lorebook:`, lorebookName);
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
            
            console.log(`${MODULE_NAME}: Debug - Current model/temp settings:`, modelSettings);
        } catch (error) {
            console.warn(`${MODULE_NAME}: Could not get current model/temperature settings:`, error);
            modelSettings = {
                api: 'unknown',
                model: 'unknown',
                temperature: 0.7,
                completionSource: 'unknown',
                source: 'fallback'
            };
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

        console.log(`${MODULE_NAME}: Context resolved:`, result);
        console.log(`${MODULE_NAME}: - isGroupChat: ${result.isGroupChat}`);
        console.log(`${MODULE_NAME}: - groupId: ${result.groupId}`);
        console.log(`${MODULE_NAME}: - groupName: ${result.groupName}`);
        console.log(`${MODULE_NAME}: - characterName: ${result.characterName}`);
        console.log(`${MODULE_NAME}: - chatId: ${result.chatId}`);
        console.log(`${MODULE_NAME}: - lorebookName: ${result.lorebookName}`);
        console.log(`${MODULE_NAME}: - modelSettings:`, result.modelSettings);
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
    const context = getCurrentMemoryBooksContext();
    const chatMetadata = context.chatMetadata; // Assumes getCurrentMemoryBooksContext provides this

    // If manual mode is OFF, use the default chat-bound lorebook
    if (!settings.moduleSettings.manualModeEnabled) {
        return chatMetadata?.[METADATA_KEY] || null;
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
 * BULLETPROOF: Gets the list of available models from the current API's select dropdown in the UI.
 * @returns {Array<{value: string, text: string}>} An array of model objects.
 */
export function getAvailableModels() {
    try {
        const selectors = getApiSelectors();
        const modelSelectElement = $(selectors.model);

        if (modelSelectElement && modelSelectElement.length > 0 && modelSelectElement[0] && modelSelectElement[0].options) {
            const models = Array.from(modelSelectElement[0].options)
                .filter(option => option.value) 
                .map(option => ({
                    value: option.value,
                    text: option.text || option.value,
                }));
                
            console.log(`${MODULE_NAME}: Found ${models.length} available models for current API`);
            return models;
        }

    } catch (error) {
        console.warn(`${MODULE_NAME}: Could not get available models from UI:`, error);
    }

    // If the check fails or an error occurs, always return an empty array.
    console.warn(`${MODULE_NAME}: Could not find model select element in UI, returning empty list.`);
    return [];
}

/**
 * BULLETPROOF: Check if a model value represents a custom model entry
 * @param {string} modelValue - The model value to check
 * @param {Array} availableModels - Array of available models from getAvailableModels()
 * @returns {boolean} Whether this is a custom model
 */
export function isCustomModel(modelValue, availableModels) {
    if (!modelValue) return false;
    
    // Check if the model value exists in the available models list
    return !availableModels.some(model => model.value === modelValue);
}

/**
 * BULLETPROOF: Get current model and temperature settings with comprehensive validation
 */
export function getCurrentModelSettings() {
    try {
        const apiInfo = getCurrentApiInfo();
        const selectors = getApiSelectors();
        
        let currentModel = '';
        
        if (apiInfo.completionSource === 'custom') {
            currentModel = $(SELECTORS.customModelId).val() || $(SELECTORS.modelCustomSelect).val() || '';
        } else {
            currentModel = $(selectors.model).val() || '';
        }
        
        // BULLETPROOF: Default to 0.7 if no temperature is set, with proper validation
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
            completionSource: apiInfo.completionSource
        };
    } catch (error) {
        console.warn(`${MODULE_NAME}: Error getting current model settings:`, error);
        return {
            model: '',
            temperature: 0.7,
            completionSource: 'openai'
        };
    }
}

/**
 * BULLETPROOF: Switch provider and model with comprehensive error handling and validation
 * @param {Object} profile - expects .connection.api/.connection.model
 */
export async function switchProviderAndModel(profile) {
    const conn = profile.effectiveConnection || profile.connection;
    if (!profile || !conn || !conn.model) {
        console.warn(`${MODULE_NAME}: Cannot switch provider - invalid profile or connection`);
        return false;
    }
    
    try {
        console.log(`${MODULE_NAME}: Switching to provider: ${conn.api}, model: ${conn.model}`);
        
        // 1. Always force main_api to 'openai' for chat completions
        if ($(SELECTORS.mainApi).val() !== 'openai') {
            $(SELECTORS.mainApi).val('openai').trigger('change');
            window.main_api = 'openai';
            await new Promise(r => setTimeout(r, 300));
        }

        // 2. Determine the chat completion source with validation
        const apiToSource = {
            openai: 'openai',
            claude: 'claude',
            google: 'makersuite',
            makersuite: 'makersuite',
            vertexai: 'vertexai',
            openrouter: 'openrouter',
            cohere: 'cohere',
            perplexity: 'perplexity',
            groq: 'groq',
            "01ai": '01ai',
            deepseek: 'deepseek',
            mistralai: 'mistralai',
            custom: 'custom',
            aimlapi: 'aimlapi',
            xai: 'xai',
            pollinations: 'pollinations'
        };
        const completionSource = apiToSource[conn.api] || 'openai'; 

        if ($(SELECTORS.completionSource).val() !== completionSource) {
            $(SELECTORS.completionSource).val(completionSource).trigger('change');
            await new Promise(r => setTimeout(r, 300));
        }

        const model = conn.model;

        // 3. Set the model value in the appropriate selector with retry logic
        const PROVIDER_TO_MODEL_SELECTOR = {
            openai: "#model_openai_select",
            claude: "#model_claude_select", 
            google: "#model_google_select",
            makersuite: "#model_google_select",
            vertexai: "#model_vertexai_select",
            openrouter: "#model_openrouter_select",
            cohere: "#model_cohere_select",
            perplexity: "#model_perplexity_select",
            groq: "#model_groq_select",
            "01ai": "#model_01ai_select",
            deepseek: "#model_deepseek_select",
            mistralai: "#model_mistralai_select",
            custom: "#model_custom_select",
            aimlapi: "#model_aimlapi_select",
            xai: "#model_xai_select",
            pollinations: "#model_pollinations_select"
        };
        const selector = PROVIDER_TO_MODEL_SELECTOR[conn.api] || '#model_openai_select';

        // BULLETPROOF: Wait for the select to exist and options to load with retry logic
        let modelSet = false;
        for (let tries = 0; tries < 15; tries++) {
            const $select = $(selector);
            if ($select.length && $select.find(`option[value='${model}']`).length) {
                $select.val(model).trigger('change');
                modelSet = true;
                console.log(`${MODULE_NAME}: Model set to ${model} on attempt ${tries + 1}`);
                break;
            }
            await new Promise(r => setTimeout(r, 200));
        }

        if (!modelSet) {
            console.warn(`${MODULE_NAME}: Could not set model ${model} after 15 attempts`);
            return false;
        }

        // Also, for custom: update custom_model_id
        if (completionSource === 'custom') {
            $(SELECTORS.customModelId).val(model).trigger('input');
        }

        await new Promise(r => setTimeout(r, 150)); // brief pause for SillyTavern state update
        
        console.log(`${MODULE_NAME}: Successfully switched to ${conn.api}/${model}`);
        return true;
        
    } catch (error) {
        console.error(`${MODULE_NAME}: Error switching provider and model:`, error);
        return false;
    }
}

/**
 * BULLETPROOF: Restore model and temperature settings with comprehensive validation
 * @param {Object} settings - Settings object with model and temperature
 * @returns {boolean} Whether restoration was successful
 */
export async function restoreModelSettings(settings) {
    if (!settings || !settings.model) {
        console.warn(`${MODULE_NAME}: Cannot restore settings - invalid settings object`);
        return false;
    }

    try {
        console.log(`${MODULE_NAME}: Restoring model settings:`, settings);
        
        const selectors = getApiSelectors();
        const apiInfo = getCurrentApiInfo();
        let restored = false;

        // Check if the saved settings match the current completion source
        if (settings.completionSource && settings.completionSource !== apiInfo.completionSource) {
            console.warn(`${MODULE_NAME}: Completion source mismatch (saved: ${settings.completionSource}, current: ${apiInfo.completionSource})`);
            return false;
        }

        // Apply model setting - handle both custom fields for custom completion source
        if (settings.model) {
            if (apiInfo.completionSource === 'custom') {
                if ($(SELECTORS.customModelId).length) {
                    const currentCustomId = $(SELECTORS.customModelId).val();
                    if (currentCustomId !== settings.model) {
                        $(SELECTORS.customModelId).val(settings.model).trigger('change');
                        console.log(`${MODULE_NAME}: Custom model ID changed from ${currentCustomId} to ${settings.model}`);
                        restored = true;
                    }
                }

                if ($(SELECTORS.modelCustomSelect).length) {
                    const currentCustomSelect = $(SELECTORS.modelCustomSelect).val();
                    if (currentCustomSelect !== settings.model) {
                        $(SELECTORS.modelCustomSelect).val(settings.model).trigger('change');
                        console.log(`${MODULE_NAME}: Custom model select changed from ${currentCustomSelect} to ${settings.model}`);
                        restored = true;
                    }
                }
            } else {
                if ($(selectors.model).length) {
                    const currentModel = $(selectors.model).val();
                    if (currentModel !== settings.model) {
                        $(selectors.model).val(settings.model).trigger('change');
                        console.log(`${MODULE_NAME}: Model changed from ${currentModel} to ${settings.model}`);
                        restored = true;
                    }
                }
            }
        }

        // Apply temperature setting with validation
        if (typeof settings.temperature === 'number' && !isNaN(settings.temperature)) {
            const currentTemp = parseFloat($(selectors.temp).val() || $(selectors.tempCounter).val() || 0);
            if (Math.abs(currentTemp - settings.temperature) > 0.001) {
                if ($(selectors.temp).length) {
                    $(selectors.temp).val(settings.temperature);
                }
                if ($(selectors.tempCounter).length) {
                    $(selectors.tempCounter).val(settings.temperature);
                }
                console.log(`${MODULE_NAME}: Temperature changed from ${currentTemp} to ${settings.temperature}`);
                restored = true;
            }
        }

        if (restored) {
            console.log(`${MODULE_NAME}: Successfully restored model settings`);
        } else {
            console.log(`${MODULE_NAME}: No settings needed to be restored`);
        }

        return true;
        
    } catch (error) {
        console.error(`${MODULE_NAME}: Error restoring model settings:`, error);
        return false;
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
               "For the keywords field, provide 5-20 relevant keywords for vectorized database retrieval.\n\n" +
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
                 "For the keywords field, provide 5-20 relevant keywords that would help a vectorized database find this conversation again if something is mentioned.\n\n" +
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
                "For the keywords field, provide 5-20 relevant keywords for vectorized database retrieval.\n\n" +
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
             "For the keywords field, provide 5-20 relevant keywords that would help a vectorized database find this summary again if mentioned.\n\n" +
             "Return ONLY the JSON, no other text.",

    'minimal': "Analyze the following roleplay scene and return a minimal memory entry as JSON.\n\n" +
                "You must respond with ONLY valid JSON in this exact format:\n" +
                "{\n" +
                '  "title": "Short scene title (1-3 words)",\n' +
                '  "content": "Brief 1-2 sentence summary...",\n' +
                '  "keywords": ["keyword1", "keyword2", "keyword3"]\n' +
                "}\n\n" +
                "For the content field, provide a very brief 1-2 sentence summary of what happened in this scene.\n\n" +
                "For the keywords field, generate 5-20 highly relevant keywords for database retrieval - focus on the most important terms that would help find this scene later.\n\n" +
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
 * Clean up profile connection settings
 * Removes empty/invalid values and normalizes structure
 * @param {Object} connection - Connection settings to clean
 * @returns {Object} Cleaned connection settings
 */
export function cleanConnectionSettings(connection) {
    if (!connection || typeof connection !== 'object') {
        return { temperature: 0.7 };
    }
    
    const cleaned = {};
    
    if (connection.model && typeof connection.model === 'string' && connection.model.trim()) {
        cleaned.model = connection.model.trim();
    }
    
    if (typeof connection.temperature === 'number' && !isNaN(connection.temperature)) {
        // Clamp temperature to reasonable bounds
        cleaned.temperature = Math.max(0, Math.min(2, connection.temperature));
    } else {
        // Default to 0.7 if no valid temperature provided
        cleaned.temperature = 0.7;
    }
    
    return cleaned;
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
 * @param {string} [data.titleFormat='[000] - {{title}}'] - The title format for lorebook entries.
 * @param {string} [data.constVectMode='link'] - The constant/vectorized mode.
 * @param {number} [data.position=0] - The lorebook entry position.
 * @param {string} [data.orderMode='auto'] - The ordering mode.
 * @param {number} [data.orderValue=100] - The manual order value.
 * @param {boolean} [data.preventRecursion=true] - The prevent recursion flag.
 * @param {boolean} [data.delayUntilRecursion=true] - The delay until recursion flag.
 * @returns {Object} A structured and validated profile object.
 */
export function createProfileObject(data = {}) {
    // Use parseTemperature for robust handling, with a clear fallback to 0.7
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
        titleFormat: data.titleFormat,
        constVectMode: data.constVectMode || 'link',
        position: data.position !== undefined ? Number(data.position) : 0,
        orderMode: data.orderMode || 'auto',
        orderValue: data.orderValue !== undefined ? Number(data.orderValue) : 100,
        preventRecursion: data.preventRecursion !== undefined ? data.preventRecursion : true,
        delayUntilRecursion: data.delayUntilRecursion !== undefined ? data.delayUntilRecursion : true,
    };

    const model = (data.model || '').trim();
    if (model) {
        profile.connection.model = model;
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