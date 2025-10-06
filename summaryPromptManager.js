import { getRequestHeaders } from '../../../../script.js';
import { PRESET_PROMPTS, DEFAULT_PROMPT } from './utils.js';
import { FILE_NAMES, SCHEMA } from './constants.js';

const MODULE_NAME = 'STMemoryBooks-SummaryPromptManager';
const PROMPTS_FILE = FILE_NAMES.PROMPTS_FILE;

/**
 * In-memory cache of loaded overrides
 * @type {Object|null}
 */
let cachedOverrides = null;

/**
 * Flag to track if first-run initialization has been attempted
 * @type {boolean}
 */
let hasInitialized = false;

/**
 * Promise to track ongoing initialization
 * @type {Promise|null}
 */
let initializationPromise = null;

/**
 * Default display names for built-in presets
 */
const DEFAULT_DISPLAY_NAMES = {
    'summary': 'Summary - Detailed beat-by-beat summaries in narrative prose',
    'summarize': 'Summarize - Bullet-point format',
    'synopsis': 'Synopsis - Long and comprehensive (beats, interactions, details) with headings',
    'sumup': 'Sum Up - Concise story beats in narrative prose',
    'minimal': 'Minimal - Brief 1-2 sentence summary',
    'northgate': 'Northgate - Intended for creative writing. By Northgate on ST Discord',
    'aelemar': 'Aelemar - Focuses on plot points and character memories. By Aelemar on ST Discord',
};

/**
 * Converts a string to title case
 * @param {string} str - String to convert
 * @returns {string} Title-cased string
 */
function toTitleCase(str) {
    return str.replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
    });
}

/**
 * Generates a safe slug from a string
 * @param {string} str - String to slugify
 * @returns {string} Safe slug
 */
function safeSlug(str) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50);
}

/**
 * Generates a display name from prompt content
 * @param {string} prompt - Prompt text
 * @returns {string} Generated display name
 */
function generateDisplayNameFromContent(prompt) {
    // Try to extract first line or sentence
    const lines = prompt.split('\n').filter(l => l.trim());
    if (lines.length > 0) {
        const firstLine = lines[0].trim();
        // Remove common prefixes
        const cleaned = firstLine
            .replace(/^(You are|Analyze|Create|Generate|Write)\s+/i, '')
            .replace(/[:.]/g, '')
            .trim();
        return toTitleCase(cleaned.substring(0, 50));
    }
    return 'Custom Prompt';
}

/**
 * Generates a unique key for a preset
 * @param {string} baseName - Base name for the key
 * @param {Object} existingOverrides - Existing overrides to check against
 * @returns {string} Unique key
 */
function generateUniqueKey(baseName, existingOverrides) {
    const baseSlug = safeSlug(baseName);
    let key = baseSlug;
    let counter = 2;
    
    while (key in existingOverrides || key in PRESET_PROMPTS) {
        key = `${baseSlug}-${counter}`;
        counter++;
    }
    
    return key;
}

/**
 * Loads overrides from the server
 * @returns {Promise<Object>} Overrides document
 */
async function loadOverrides() {
    if (cachedOverrides) {
        return cachedOverrides;
    }
    
    try {
        const response = await fetch(`/user/files/${PROMPTS_FILE}`, {
            method: 'GET',
            credentials: 'include',
            headers: getRequestHeaders(),
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                console.log(`${MODULE_NAME}: Prompts file not found, using built-ins only`);
                cachedOverrides = { version: SCHEMA.CURRENT_VERSION, overrides: {} };
                return cachedOverrides;
            }
            throw new Error(`Failed to load prompts: ${response.statusText}`);
        }
        
        const text = await response.text();
        const data = JSON.parse(text);
        
        // Validate structure
        if (!validatePromptsFile(data)) {
            console.warn(`${MODULE_NAME}: Invalid prompts file structure, using built-ins only`);
            cachedOverrides = { version: SCHEMA.CURRENT_VERSION, overrides: {} };
            return cachedOverrides;
        }
        
        cachedOverrides = data;
        return cachedOverrides;
    } catch (error) {
        console.error(`${MODULE_NAME}: Error loading overrides:`, error);
        cachedOverrides = { version: SCHEMA.CURRENT_VERSION, overrides: {} };
        return cachedOverrides;
    }
}

/**
 * Saves overrides to the server
 * @param {Object} doc - Document to save
 * @returns {Promise<void>}
 */
async function saveOverrides(doc) {
    try {
        const json = JSON.stringify(doc, null, 2);
        const base64 = btoa(unescape(encodeURIComponent(json)));
        
        const response = await fetch('/api/files/upload', {
            method: 'POST',
            credentials: 'include',
            headers: getRequestHeaders(),
            body: JSON.stringify({
                name: PROMPTS_FILE,
                data: base64,
            }),
        });
        
        if (!response.ok) {
            throw new Error(`Failed to save prompts: ${response.statusText}`);
        }
        
        cachedOverrides = doc;
        console.log(`${MODULE_NAME}: Prompts saved successfully`);
    } catch (error) {
        console.error(`${MODULE_NAME}: Error saving overrides:`, error);
        throw error;
    }
}

/**
 * Validates the structure of a prompts file
 * @param {Object} data - Data to validate
 * @returns {boolean} True if valid
 */
function validatePromptsFile(data) {
    if (!data || typeof data !== 'object') {
        console.error(`${MODULE_NAME}: Invalid data type`);
        return false;
    }
    
    if (typeof data.version !== 'number') {
        console.error(`${MODULE_NAME}: Invalid schema version type: ${data.version}`);
        return false;
    }
    
    if (data.version !== SCHEMA.CURRENT_VERSION) {
        console.warn(`${MODULE_NAME}: Unexpected schema version: ${data.version} (expected ${SCHEMA.CURRENT_VERSION})`);
    }
    
    if (!data.overrides || typeof data.overrides !== 'object') {
        console.error(`${MODULE_NAME}: Missing or invalid overrides object`);
        return false;
    }
    
    // Validate each override entry
    for (const [key, override] of Object.entries(data.overrides)) {
        if (!override || typeof override !== 'object') {
            console.error(`${MODULE_NAME}: Invalid override entry for key: ${key}`);
            return false;
        }
        
        if (typeof override.prompt !== 'string' || !override.prompt.trim()) {
            console.error(`${MODULE_NAME}: Invalid or empty prompt for key: ${key}`);
            return false;
        }
        
        if (override.displayName !== undefined && typeof override.displayName !== 'string') {
            console.error(`${MODULE_NAME}: Invalid displayName for key: ${key}`);
            return false;
        }
    }
    
    return true;
}

/**
 * Performs first-run initialization if needed
 * Uses promise-based locking to prevent race conditions
 * @param {Object} settings - Extension settings
 * @returns {Promise<boolean>} True if initialization was performed
 */
export async function firstRunInitIfMissing(settings) {
    // If already initialized, return immediately
    if (hasInitialized) {
        return false;
    }
    
    // If initialization is in progress, wait for it
    if (initializationPromise) {
        await initializationPromise;
        return false;
    }
    
    // Start initialization and store the promise
    initializationPromise = (async () => {
        try {
            // Check if file exists
            const response = await fetch(`/user/files/${PROMPTS_FILE}`, {
                method: 'GET',
                credentials: 'include',
                headers: getRequestHeaders(),
            });
            
            if (response.ok) {
                // File already exists
                return false;
            }
            
            console.log(`${MODULE_NAME}: Performing first-run initialization`);
            
            // Build initial document with all built-ins
            const overrides = {};
            const now = new Date().toISOString();
            
            // Add all built-in presets
            for (const [key, prompt] of Object.entries(PRESET_PROMPTS)) {
                overrides[key] = {
                    displayName: DEFAULT_DISPLAY_NAMES[key] || toTitleCase(key),
                    prompt: prompt,
                    createdAt: now,
                };
            }
            
            // Scan profiles for custom prompts
            if (settings && settings.profiles && Array.isArray(settings.profiles)) {
                for (const profile of settings.profiles) {
                    if (profile.prompt && profile.prompt.trim()) {
                        const displayName = `Custom: ${profile.name || 'Unnamed Profile'}`;
                        const key = generateUniqueKey(displayName, overrides);
                        
                        overrides[key] = {
                            displayName: displayName,
                            prompt: profile.prompt,
                            createdAt: now,
                        };
                        
                        console.log(`${MODULE_NAME}: Migrated custom prompt from profile "${profile.name}" as "${key}"`);
                    }
                }
            }
            
            const doc = {
                version: SCHEMA.CURRENT_VERSION,
                overrides: overrides,
            };
            
            await saveOverrides(doc);
            toastr.success('Summary prompts initialized. You can now manage them via the Summary Prompt Manager.', 'STMemoryBooks');
            return true;
        } catch (error) {
            console.error(`${MODULE_NAME}: Error during first-run initialization:`, error);
            return false;
        } finally {
            hasInitialized = true;
            initializationPromise = null;
        }
    })();
    
    return await initializationPromise;
}

/**
 * Lists all available presets
 * @returns {Promise<Array>} Array of preset objects with key, displayName, createdAt
 */
export async function listPresets() {
    const data = await loadOverrides();
    const presets = [];
    
    for (const [key, preset] of Object.entries(data.overrides)) {
        presets.push({
            key: key,
            displayName: preset.displayName || toTitleCase(key),
            createdAt: preset.createdAt || null,
        });
    }
    
    // Sort by creation date (newest first)
    presets.sort((a, b) => {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    return presets;
}

/**
 * Gets the prompt text for a preset
 * @param {string} key - Preset key
 * @returns {Promise<string>} Prompt text
 */
export async function getPrompt(key) {
    const data = await loadOverrides();

    if (data.overrides[key]) {
        const p = data.overrides[key].prompt;
        if (typeof p === 'string' && p.trim()) {
            return p;
        }
    }

    // Fallback to built-in
    return PRESET_PROMPTS[key] || DEFAULT_PROMPT;
}

/**
 * Gets the display name for a preset
 * @param {string} key - Preset key
 * @returns {Promise<string>} Display name
 */
export async function getDisplayName(key) {
    const data = await loadOverrides();
    
    if (data.overrides[key] && data.overrides[key].displayName) {
        return data.overrides[key].displayName;
    }
    
    // Fallback to default display names or title-cased key
    return DEFAULT_DISPLAY_NAMES[key] || toTitleCase(key);
}

/**
 * Checks if a preset exists
 * @param {string} key - Preset key
 * @returns {Promise<boolean>} True if preset exists
 */
export async function isValid(key) {
    const data = await loadOverrides();
    return !!(data.overrides[key] || PRESET_PROMPTS[key]);
}

/**
 * Creates or updates a preset
 * @param {string} key - Preset key (if null, generates a new one)
 * @param {string} prompt - Prompt text
 * @param {string} displayName - Display name
 * @returns {Promise<string>} The key of the created/updated preset
 */
export async function upsertPreset(key, prompt, displayName) {
    const data = await loadOverrides();
    const now = new Date().toISOString();
    
    // Generate key if not provided
    if (!key) {
        key = generateUniqueKey(displayName || generateDisplayNameFromContent(prompt), data.overrides);
    }
    
    // Update or create
    if (data.overrides[key]) {
        data.overrides[key].prompt = prompt;
        data.overrides[key].displayName = displayName || data.overrides[key].displayName;
        data.overrides[key].updatedAt = now;
    } else {
        data.overrides[key] = {
            displayName: displayName || generateDisplayNameFromContent(prompt),
            prompt: prompt,
            createdAt: now,
        };
    }
    
    await saveOverrides(data);
    return key;
}

/**
 * Duplicates a preset
 * @param {string} sourceKey - Key of preset to duplicate
 * @returns {Promise<string>} Key of the new preset
 */
export async function duplicatePreset(sourceKey) {
    const data = await loadOverrides();
    
    const source = data.overrides[sourceKey];
    if (!source) {
        throw new Error(`Preset "${sourceKey}" not found`);
    }
    
    const newDisplayName = `${source.displayName} (Copy)`;
    const newKey = generateUniqueKey(newDisplayName, data.overrides);
    const now = new Date().toISOString();
    
    data.overrides[newKey] = {
        displayName: newDisplayName,
        prompt: source.prompt,
        createdAt: now,
    };
    
    await saveOverrides(data);
    return newKey;
}

/**
 * Removes a preset
 * @param {string} key - Preset key to remove
 * @returns {Promise<void>}
 */
export async function removePreset(key) {
    const data = await loadOverrides();
    
    if (!data.overrides[key]) {
        throw new Error(`Preset "${key}" not found`);
    }
    
    delete data.overrides[key];
    await saveOverrides(data);
}

/**
 * Exports the current prompts document
 * @returns {Promise<string>} JSON string of the document
 */
export async function exportToJSON() {
    const data = await loadOverrides();
    return JSON.stringify(data, null, 2);
}

/**
 * Imports a prompts document
 * @param {string} jsonString - JSON string to import
 * @returns {Promise<void>}
 */
export async function importFromJSON(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        
        // Validate structure using the validation function
        if (!validatePromptsFile(data)) {
            throw new Error('Invalid prompts file structure - see console for details');
        }
        
        await saveOverrides(data);
    } catch (error) {
        console.error(`${MODULE_NAME}: Error importing prompts:`, error);
        throw error;
    }
}

/**
 * Clears the cache (useful for testing or forcing a reload)
 */
export function clearCache() {
    cachedOverrides = null;
    hasInitialized = false;
}
