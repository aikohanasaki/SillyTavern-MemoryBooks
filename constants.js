// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

/**
 * Constants for STMemoryBooks extension
 */

// Memory generation settings
export const MEMORY_GENERATION = {
    MAX_RETRIES: 2,
    RETRY_DELAY_MS: 2000,
    TOKEN_WARNING_THRESHOLD_DEFAULT: 50000,
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
    DEFAULT_INTERVAL: 50,
    MAX_INTERVAL: 250,
};

// Settings debounce
export const UI_SETTINGS = {
    INPUT_DEBOUNCE_MS: 1000,
    CHAT_OBSERVER_DEBOUNCE_MS: 50,
};

export const MEMORY_TIER_CACHE_REFRESH_EVENT = 'stmb_memory_tier_cache_refresh';

// File names
export const FILE_NAMES = {
    PROMPTS_FILE: 'stmb-summary-prompts.json',
    SIDE_PROMPTS_FILE: 'stmb-side-prompts.json',
    ARC_PROMPTS_FILE: 'stmb-arc-prompts.json',
    CONTEXT_SETTINGS_FILE: 'stmb-context-settings.json',
};

// Schema version
export const SCHEMA = {
    CURRENT_VERSION: 1,
};

// Display name localization defaults and i18n keys for built-in presets
export const DISPLAY_NAME_DEFAULTS = {
    summary: 'Summary - Detailed beat-by-beat summaries in narrative prose',
    group: 'Group - Shared group memory with clear attribution',
    char: 'Character - Targeted character memory',
    summarize: 'Summarize - Bullet-point format',
    synopsis: 'Synopsis - Long and comprehensive (beats, interactions, details) with headings',
    sumup: 'Sum Up - Concise story beats in narrative prose',
    minimal: 'Minimal - Brief 1-2 sentence summary',
    northgate: 'Northgate - Intended for creative writing. By Northgate on ST Discord',
    aelemar: 'Aelemar - Focuses on plot points and character memories. By Aelemar on ST Discord',
    comprehensive: 'Comprehensive - Synopsis plus improved keywords extraction',
    event: 'Event - Structured event memory (name / summary / key events / significance / key quotes). Per plan Appendix B.',
};

export const DISPLAY_NAME_I18N_KEYS = {
    summary: 'STMemoryBooks_DisplayName_summary',
    group: 'STMemoryBooks_DisplayName_group',
    char: 'STMemoryBooks_DisplayName_char',
    summarize: 'STMemoryBooks_DisplayName_summarize',
    synopsis: 'STMemoryBooks_DisplayName_synopsis',
    sumup: 'STMemoryBooks_DisplayName_sumup',
    minimal: 'STMemoryBooks_DisplayName_minimal',
    northgate: 'STMemoryBooks_DisplayName_northgate',
    aelemar: 'STMemoryBooks_DisplayName_aelemar',
    comprehensive: 'STMemoryBooks_DisplayName_comprehensive',
    event: 'STMemoryBooks_DisplayName_event',
};

// First-pass additional constants for common defaults and thresholds
export const CHARS_PER_TOKEN = 4;
export const MAX_PREVIEW_CHARS = 100000;
export const MAX_SCAN_RANGE = SCENE_MANAGEMENT.MAX_SCAN_RANGE;
export const MAX_AFFECTED_MESSAGES = SCENE_MANAGEMENT.MAX_AFFECTED_MESSAGES;

// First-pass boolean and string defaults to be targeted for consolidation
export const BOOLEAN_DEFAULTS = {
    DEFAULT_USE_PROBABILITY: true,
};

export const STRING_DEFAULTS = {
    DEFAULT_OUTLET_NAME: '',
};
