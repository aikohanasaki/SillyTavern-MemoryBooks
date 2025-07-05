// utils.js - Shared utilities for STMemoryBooks
const MODULE_NAME = 'STMemoryBooks-Utils';
const $ = window.jQuery;

// Centralized DOM selectors
const SELECTORS = {
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

/**
 * Get current API and completion source information
 */
export function getCurrentApiInfo() {
    try {
        let api = 'unknown';
        let model = 'unknown';
        let completionSource = 'unknown';

        if (typeof window.getGeneratingApi === 'function') {
            api = window.getGeneratingApi();
        } else {
            api = $(SELECTORS.mainApi).val() || 'unknown';
        }

        if (typeof window.getGeneratingModel === 'function') {
            model = window.getGeneratingModel();
        }

        completionSource = $(SELECTORS.completionSource).val() || api;

        return { api, model, completionSource };
    } catch (e) {
        console.warn('STMemoryBooks: Error getting API info:', e);
        return {
            api: $(SELECTORS.mainApi).val() || 'unknown',
            model: 'unknown',
            completionSource: $(SELECTORS.completionSource).val() || 'unknown'
        };
    }
}

/**
 * Get the appropriate model and temperature selectors for current completion source
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
 * Get current model and temperature settings
 */
export function getCurrentModelSettings() {
    const apiInfo = getCurrentApiInfo();
    const selectors = getApiSelectors();
    
    let currentModel = '';
    
    if (apiInfo.completionSource === 'custom') {
        currentModel = $(SELECTORS.customModelId).val() || $(SELECTORS.modelCustomSelect).val() || '';
    } else {
        currentModel = $(selectors.model).val() || '';
    }
    
    const currentTemp = parseFloat($(selectors.temp).val() || $(selectors.tempCounter).val() || 0.7);
    
    return {
        model: currentModel,
        temperature: currentTemp,
        completionSource: apiInfo.completionSource
    };
}

/**
 * Preset prompt definitions
 * Single source of truth for all preset prompts
 */
export const PRESET_PROMPTS = {
    'summary': "You are a talented summarist skilled at capturing scenes from stories in a few words. First, estimate where in the story timeline (day X) this scene is based on earlier scene summaries included (if any). Then, create a detailed beat-by-beat summary in narrative prose that captures this scene accurately without losing much information. This summary will go in a vectorized database, so it is important to be token-efficient.\n\n- Give it a title that's 1-3 words long and make a header using this format: # Scene (number) Summary - Day X - Title\n- Make sure to include all important story beats/events that happened, key interaction highlights, notable details, memorable quotes, outcome, and anything else that might be important and relevant to future interactions between {{user}} and {{char}}. Capture as much nuance as you can without repeating this word for word. Make it easy to read and digest both for you and also for human readers.\n- At the end, provide a comma-delimited list of keywords suitable for copy-paste that would help a vectorized database find the summary again if a keyword is mentioned.",
    'summarize': "Write a detailed summary for this roleplay and present it using headers and bullet points. Estimate where in the story timeline (day X) this scene is based on earlier scene summaries included (if any). Give it a title that's 1-3 words long. Capture story beats/events that happened, key interaction highlights, notable details, and outcome. Finally, generate a comma-delimited list of keywords that would help a vectorized database find this conversation again if something is mentioned.\n\nResponse format:\n# Scene Summary - Day X - Title\n## Story Beats\n(story beats in bullet points)\n## Key Interactions\n(key interactions in bullet points)\n## Notable Details\n(notable details in bullet points)\n## Outcome\n(outcome in bullet points)\n\nKeywords: keyword1, keyword2, keyword phrase 3... etc",
    'synopsis': "Estimate where in the story timeline (day X) this scene is based on earlier scene summaries included (if any) and then write a long and detailed beat-by-beat summary that captures the most recent scene accurately without losing much information. This summary will go in a vectorized database, so it is important to be token-efficient (headings and bullet points are ideal). You must include important story beats/events that happened, key interaction highlights, notable details, memorable quotes, outcome, and anything else that might be important and relevant to future interactions between {{user}} and {{char}}. Capture all nuance without regurgitating things verbatim. Make it easy to read and digest both for you and also for human readers. At the end, provide a comma-delimited list of keywords that would help a vectorized database find this conversation again if a keyword is mentioned. Response format:\n\n# Title\n## Story Beats\n(story beats in bullet points)\n## Key Interactions\n(key interactions in bullet points)\n## Notable Details\n(notable details in bullet points)\n## Outcome\n(outcome in bullet points)\n\nKeywords: keyword1, keyword2, keyword phrase 3... etc",
    'sumup': "write a beat summary that captures this scene. Estimate where in the story timeline (day X) this scene is based on earlier scene summaries included (if any). Narrate important story beats/events that happened, key interaction highlights, notable details, memorable quotes, and outcome. At the end, provide a comma-delimited list of keywords that would help a vectorized database find the summary again if a keyword is mentioned. Response format:\n\n# Scene Summary - Day X - Title\n(summary)\nKeywords: keyword1, keyword2, keyword phrase 3... etc",
    'keywords': "Generate a comma-delimited list of keywords that would help a vectorized database find this conversation again if a keyword is mentioned."
};

/**
 * Default fallback prompt
 */
export const DEFAULT_PROMPT = 'Create a concise memory from this chat scene. Focus on key plot points, character development, and important interactions.';

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
        return {};
    }
    
    const cleaned = {};
    
    if (connection.model && typeof connection.model === 'string' && connection.model.trim()) {
        cleaned.model = connection.model.trim();
    }
    
    if (typeof connection.temperature === 'number' && !isNaN(connection.temperature)) {
        // Clamp temperature to reasonable bounds
        cleaned.temperature = Math.max(0, Math.min(2, connection.temperature));
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
        'keywords': 'Keywords - Keywords only'
    };
    
    return displayNames[presetName] || presetName;
}