/**
 * Constants for STMemoryBooks extension
 */

// Memory generation settings
export const MEMORY_GENERATION = {
    MAX_RETRIES: 2,
    RETRY_DELAY_MS: 2000,
    TOKEN_WARNING_THRESHOLD_DEFAULT: 30000,
    DEFAULT_MEMORY_COUNT: 0,
};

// Scene management settings
export const SCENE_MANAGEMENT = {
    MAX_SCAN_RANGE: 100,
    MAX_AFFECTED_MESSAGES: 200,
    BUTTON_UPDATE_DEBOUNCE_MS: 50,
    VALIDATION_DELAY_MS: 500,
};

// Auto-summary settings
export const AUTO_SUMMARY = {
    MIN_INTERVAL: 10,
    DEFAULT_INTERVAL: 100,
    MAX_INTERVAL: 200,
};

// Settings debounce
export const UI_SETTINGS = {
    INPUT_DEBOUNCE_MS: 1000,
    CHAT_OBSERVER_DEBOUNCE_MS: 50,
};

// File names
export const FILE_NAMES = {
    PROMPTS_FILE: 'stmb-summary-prompts.json',
};

// Schema version
export const SCHEMA = {
    CURRENT_VERSION: 1,
};
