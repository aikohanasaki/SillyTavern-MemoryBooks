// utils.js - Shared utilities for STMemoryBooks
const MODULE_NAME = 'STMemoryBooks-Utils';

/**
 * Preset prompt definitions
 * Single source of truth for all preset prompts
 */
export const PRESET_PROMPTS = {
    'summary': 'Create a detailed beat-by-beat summary of this chat scene. Include character actions, dialogue highlights, emotional beats, and story progression. Format as a comprehensive narrative summary.',
    'summarize': 'Summarize this chat scene in bullet-point format. Focus on:\n• Key events and actions\n• Important dialogue\n• Character development\n• Plot advancement',
    'synopsis': 'Create a comprehensive synopsis of this chat scene with clear headings:\n\n**Characters Present:** [list]\n**Setting/Location:** [describe]\n**Key Events:** [summarize]\n**Emotional Beats:** [highlight]\n**Story Impact:** [explain]',
    'sumup': 'Sum up this chat scene focusing on the essential story beats. Keep it concise but capture the core narrative progression, character moments, and any important plot developments.',
    'keywords': 'Extract only the most important keywords and phrases from this chat scene. Focus on: character names, locations, objects, actions, emotions, and plot-relevant terms. Return as a simple list.'
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
    
    if (connection.engine && typeof connection.engine === 'string') {
        cleaned.engine = connection.engine;
    }
    
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