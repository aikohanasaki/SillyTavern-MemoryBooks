import { getContext } from '../../../extensions.js';
import {
    METADATA_KEY,
    loadWorldInfo,
    createWorldInfoEntry,
    saveWorldInfo,
    reloadEditor
} from '../../../world-info.js';
import { extension_settings } from '../../../extensions.js';
import { moment } from '../../../../lib.js';
import { executeSlashCommands } from '../../../slash-commands.js';
import { getSceneMarkers, saveMetadataForCurrentContext } from './sceneManager.js';
import { translate } from '../../../i18n.js';

const MODULE_NAME = 'STMemoryBooks-AddLore';

/**
 * Local i18n wrapper to maintain legacy i18n(key, fallback, params) calls.
 * Uses SillyTavern translate(fallback, key) and simple {{var}} interpolation.
 */
function i18n(key, fallback, params) {
    const localized = translate(fallback, key);
    if (!params) return localized;
    return localized.replace(/{{\s*(\w+)\s*}}/g, (m, p1) => {
        const v = params[p1];
        return v !== undefined && v !== null ? String(v) : '';
    });
}

/**
 * Parse scene range from metadata string format "start-end"
 * @private
 * @param {string} sceneRange - Scene range string like "3-5"
 * @returns {Object|null} - {start, end} or null if invalid
 */
function parseSceneRange(sceneRange) {
    if (!sceneRange) {
        return null;
    }
    const parts = sceneRange.split('-');
    if (parts.length !== 2) {
        return null;
    }
    const start = parseInt(parts[0], 10);
    const end = parseInt(parts[1], 10);
    if (isNaN(start) || isNaN(end) || start < 0 || end < 0) {
        return null;
    }
    return { start, end };
}

/**
 * Execute hide command with consistent logging
 * @private
 * @param {string} hideCommand - Hide command to execute
 * @param {string} context - Optional context description
 */
async function executeHideCommand(hideCommand, context = '') {
    const contextStr = context ? ` (${context})` : '';
    console.log(i18n('addlore.log.executingHideCommand', `${MODULE_NAME}: Executing hide command${contextStr}: {{hideCommand}}`, { hideCommand }));
    await executeSlashCommands(hideCommand);
}

/**
 * Helper function to convert old boolean auto-hide settings to new dropdown format
 */
function getAutoHideMode(moduleSettings = {}) {
    // Handle new format
    if (moduleSettings.autoHideMode) {
        return moduleSettings.autoHideMode;
    }
    
    // Convert from old boolean format for backward compatibility
    if (moduleSettings.autoHideAllMessages) {
        return 'all';
    } else if (moduleSettings.autoHideLastMemory) {
        return 'last';
    } else {
        return 'none';
    }
}

// Default title formats that users can select from
const DEFAULT_TITLE_FORMATS = [
    '[000] - {{title}} ({{profile}})', // i18n('addlore.titleFormats.0', '[000] - {{title}} ({{profile}})')
    '{{date}} [000] 🎬{{title}}, {{messages}} msgs', // i18n('addlore.titleFormats.1', '{{date}} [000] 🎬{{title}}, {{messages}} msgs')
    '[000] {{date}} - {{char}} Memory', // i18n('addlore.titleFormats.2', '[000] {{date}} - {{char}} Memory')
    '[00] - {{user}} & {{char}} {{scene}}', // i18n('addlore.titleFormats.3', '[00] - {{user}} & {{char}} {{scene}}')
    '🧠 [000] ({{messages}} msgs)', // i18n('addlore.titleFormats.4', '🧠 [000] ({{messages}} msgs)')
    '📚 Memory #[000] - {{profile}} {{date}} {{time}}', // i18n('addlore.titleFormats.5', '📚 Memory #[000] - {{profile}} {{date}} {{time}}')
    '[000] - {{scene}}: {{title}}', // i18n('addlore.titleFormats.6', '[000] - {{scene}}: {{title}}')
    '[000] - {{title}} ({{scene}})', // i18n('addlore.titleFormats.7', '[000] - {{title}} ({{scene}})')
    '[000] - {{title}}' // i18n('addlore.titleFormats.8', '[000] - {{title}}')
];

/**
 * Adds a generated memory to the chat's bound lorebook.
 * This is the main entry point called from index.js after memory generation.
 *
 * @param {Object} memoryResult - The result from stmemory.js
 * @param {string} memoryResult.content - The main text of the memory
 * @param {string} memoryResult.extractedTitle - AI-generated title (if any)
 * @param {string[]} memoryResult.suggestedKeys - Array of keywords for the entry
 * @param {Object} memoryResult.metadata - Metadata about the memory creation
 * @param {Object} memoryResult.lorebook - Lorebook-specific configuration
 * @param {Object} lorebookValidation - Validation result from validateLorebook()
 * @param {boolean} lorebookValidation.valid - Whether lorebook is valid
 * @param {Object} lorebookValidation.data - Loaded lorebook data
 * @param {string} lorebookValidation.name - Lorebook name
 * @returns {Promise<Object>} Result object with success status and details
 */
export async function addMemoryToLorebook(memoryResult, lorebookValidation) {

    try {
        if (!memoryResult?.content) {
            throw new Error(i18n('addlore.errors.invalidContent', 'Invalid memory result: missing content'));
        }

        if (!lorebookValidation?.valid || !lorebookValidation.data) {
            throw new Error(i18n('addlore.errors.invalidLorebookValidation', 'Invalid lorebook validation data'));
        }

        const settings = extension_settings.STMemoryBooks || {};
        let titleFormat = memoryResult.titleFormat;
        if (!titleFormat) {
            titleFormat = settings.titleFormat || i18n('addlore.titleFormats.8', '[000] - {{title}}');
        }
        const refreshEditor = settings.moduleSettings?.refreshEditor !== false;

        const lorebookSettings = memoryResult.lorebookSettings || {
            constVectMode: 'link',
            position: 0,
            orderMode: 'auto',
            orderValue: 100,
            preventRecursion: true,
            delayUntilRecursion: false
        };

        const newEntry = createWorldInfoEntry(lorebookValidation.name, lorebookValidation.data);

        if (!newEntry) {
            throw new Error(i18n('addlore.errors.createEntryFailed', 'Failed to create new lorebook entry'));
        }

        const entryTitle = generateEntryTitle(titleFormat, memoryResult, lorebookValidation.data);
        populateLorebookEntry(newEntry, memoryResult, entryTitle, lorebookSettings);
        await saveWorldInfo(lorebookValidation.name, lorebookValidation.data, true);

        if (settings.moduleSettings?.showNotifications !== false) {
            toastr.success(
                i18n('addlore.toast.added', 'Memory "{{entryTitle}}" added to "{{lorebookName}}"', { entryTitle: entryTitle, lorebookName: lorebookValidation.name }),
                i18n('addlore.toast.title', 'STMemoryBooks')
            );
        }
        
        if (refreshEditor) {
            reloadEditor(lorebookValidation.name);
        }
        
        // Execute auto-hide commands if enabled
        const autoHideMode = getAutoHideMode(settings.moduleSettings);

        if (autoHideMode !== 'none') {
            const unhiddenCount = settings.moduleSettings?.unhiddenEntriesCount || 0;

            if (autoHideMode === 'all') {
                const sceneData = parseSceneRange(memoryResult.metadata?.sceneRange);

                if (!sceneData) {
                    console.warn(i18n('addlore.warn.autohideSkippedInvalidRange', `${MODULE_NAME}: Auto-hide skipped - invalid scene range: "{{range}}"`, { range: memoryResult.metadata?.sceneRange }));
                    toastr.warning(
                        i18n('addlore.toast.autohideInvalidRange', 'Auto-hide skipped: invalid scene range metadata'),
                        i18n('addlore.toast.title', 'STMemoryBooks')
                    );
                } else {
                    const { start: sceneStart, end: sceneEnd } = sceneData;

                    if (unhiddenCount === 0) {
                        await executeHideCommand(`/hide 0-${sceneEnd}`, i18n('addlore.hideCommand.allComplete', 'all mode - complete'));
                    } else {
                        const hideEndIndex = sceneEnd - unhiddenCount;
                        if (hideEndIndex >= 0) {
                            await executeHideCommand(`/hide 0-${hideEndIndex}`, i18n('addlore.hideCommand.allPartial', 'all mode - partial'));
                        }
                        // Auto-hide silently skipped if not enough messages
                    }
                }
            } else if (autoHideMode === 'last') {
                const sceneData = parseSceneRange(memoryResult.metadata?.sceneRange);
                if (!sceneData) {
                    console.warn(i18n('addlore.warn.autohideSkippedInvalidRange', `${MODULE_NAME}: Auto-hide skipped - invalid scene range: "{{range}}"`, { range: memoryResult.metadata?.sceneRange }));
                    toastr.warning(
                        i18n('addlore.toast.autohideInvalidRange', 'Auto-hide skipped: invalid scene range metadata'),
                        i18n('addlore.toast.title', 'STMemoryBooks')
                    );
                } else {
                    const { start: sceneStart, end: sceneEnd } = sceneData;
                    const sceneSize = sceneEnd - sceneStart + 1;

                    if (unhiddenCount >= sceneSize) {
                        // No hiding needed - want to keep more messages than scene contains
                    } else if (unhiddenCount === 0) {
                        await executeHideCommand(`/hide ${sceneStart}-${sceneEnd}`, i18n('addlore.hideCommand.lastHideAll', 'last mode - hide all'));
                    } else {
                        const hideEnd = sceneEnd - unhiddenCount;
                        if (hideEnd >= sceneStart) {
                            await executeHideCommand(`/hide ${sceneStart}-${hideEnd}`, i18n('addlore.hideCommand.lastPartial', 'last mode - partial'));
                        }
                        // Auto-hide silently skipped if not enough scene messages
                    }
                }
            }
        }
        // Update highest memory processed tracking
        updateHighestMemoryProcessed(memoryResult);

        return {
            success: true,
            entryId: newEntry.uid,
            entryTitle: entryTitle,
            lorebookName: lorebookValidation.name,
            keywordCount: memoryResult.suggestedKeys?.length || 0,
            message: i18n('addlore.result.added', 'Memory successfully added to "{{lorebookName}}"', { lorebookName: lorebookValidation.name })
        };
        
    } catch (error) {
        console.error(i18n('addlore.log.addFailed', `${MODULE_NAME}: Failed to add memory to lorebook:`), error);
        
        if (extension_settings.STMemoryBooks?.moduleSettings?.showNotifications !== false) {
            toastr.error(
                i18n('addlore.toast.addFailed', 'Failed to add memory: {{message}}', { message: error.message }),
                i18n('addlore.toast.title', 'STMemoryBooks')
            );
        }
        
        return {
            success: false,
            error: error.message,
            message: i18n('addlore.result.addFailed', 'Failed to add memory to lorebook: {{message}}', { message: error.message })
        };
    }
}

/**
 * Populates a lorebook entry with memory data
 * @private
 * @param {Object} entry - The lorebook entry to populate
 * @param {Object} memoryResult - The memory generation result
 * @param {string} entryTitle - The generated title for this entry
 * @param {Object} lorebookSettings - The user-configured lorebook settings
 */
function populateLorebookEntry(entry, memoryResult, entryTitle, lorebookSettings) {
    // Core content and keywords
    entry.content = memoryResult.content;
    entry.key = memoryResult.suggestedKeys || [];
    entry.comment = entryTitle;
    
    // Extract order number from title for auto-numbering
    const orderNumber = extractNumberFromTitle(entryTitle) || 1;
    
    // 1. Constant / Vectorized Mode
    switch (lorebookSettings.constVectMode) {
        case 'blue': // Constant
            entry.constant = true;
            entry.vectorized = false;
            break;
        case 'green': // Normal
            entry.constant = false;
            entry.vectorized = false;
            break;
        case 'link': // Vectorized (Default)
        default:
            entry.constant = false;
            entry.vectorized = true;
            break;
    }
    
    // 2. Insertion Position
    entry.position = lorebookSettings.position;

    // 2a. Outlet Name for Outlet position (7)
    if (Number(lorebookSettings.position) === 7) {
        const outName = String(lorebookSettings.outletName || '').trim();
        if (outName) {
            entry.outletName = outName;
        }
    }

    // 3. Insertion Order
    if (lorebookSettings.orderMode === 'manual') {
        entry.order = lorebookSettings.orderValue;
    } else { // 'auto'
        entry.order = orderNumber;
    }

    // 4. Recursion Settings
    entry.preventRecursion = lorebookSettings.preventRecursion;
    entry.delayUntilRecursion = lorebookSettings.delayUntilRecursion;

    // Set other properties to match the tested lorebook structure
    entry.keysecondary = [];
    entry.selective = true;
    entry.selectiveLogic = 0;
    entry.addMemo = true;
    entry.disable = false;
    entry.excludeRecursion = false;
    entry.probability = 100;
    entry.useProbability = true;
    entry.depth = 4;
    entry.group = "";
    entry.groupOverride = false;
    entry.groupWeight = 100;
    entry.scanDepth = null;
    entry.caseSensitive = null;
    entry.matchWholeWords = null;
    entry.useGroupScoring = null;
    entry.automationId = "";
    entry.role = null;
    entry.sticky = 0;
    entry.cooldown = 0;
    entry.delay = 0;
    entry.displayIndex = orderNumber; // Use order number for display index
    entry.stmemorybooks = true; // Explicitly mark as STMemoryBooks memory entry
    if (memoryResult.metadata?.sceneRange) { // Set metadata for scene range if available
        const rangeParts = memoryResult.metadata.sceneRange.split('-');
        if (rangeParts.length === 2) {
            entry.STMB_start = parseInt(rangeParts[0], 10);
            entry.STMB_end = parseInt(rangeParts[1], 10);
        }
    }
    
}

/**
 * Determines if an entry is a memory entry using the STMemoryBooks flag system.
 * NO FALLBACK - Only entries with the explicit flag are considered memories.
 * This forces users to convert their lorebooks for proper memory detection.
 * 
 * @param {Object} entry - The lorebook entry to check
 * @returns {boolean} Whether this entry is a confirmed STMemoryBooks memory
 */
export function isMemoryEntry(entry) {
    // ONLY check for the explicit STMemoryBooks flag
    // This forces conversion and ensures maximum reliability and performance
    return entry.stmemorybooks === true;
}

/**
 * Generates a title for the lorebook entry using the configured format
 * @private
 * @param {string} titleFormat - The title format template
 * @param {Object} memoryResult - The memory generation result
 * @param {Object} lorebookData - The lorebook data for auto-numbering
 * @returns {string} The generated title
 */
function generateEntryTitle(titleFormat, memoryResult, lorebookData) {
    let title = titleFormat;

    // Auto-numbering: [0], [00], [000], ([0]), ({0}), #[0], etc.
    const allNumberingPatterns = [
        { pattern: /\[\[0+\]\]/g, prefix: '[', suffix: ']' }, // [[000]] -> [001]
        { pattern: /\[0+\]/g, prefix: '', suffix: '' },       // [000] -> just number
        { pattern: /\(\[0+\]\)/g, prefix: '(', suffix: ')' }, // ([000]) -> (001)
        { pattern: /\{\[0+\]\}/g, prefix: '{', suffix: '}' }, // {[000]} -> {001}
        { pattern: /#\[0+\]/g, prefix: '#', suffix: '' }      // #[000] -> #001
    ];

    for (const { pattern, prefix, suffix } of allNumberingPatterns) {
        const matches = title.match(pattern);
        if (matches) {
            const nextNumber = getNextEntryNumber(lorebookData, titleFormat);

            matches.forEach(match => {
                let digits;
                if (pattern.source.includes('\\[\\[')) {
                    digits = match.length - 4; // [[000]] -> remove [[ and ]]
                } else if (pattern.source.includes('\\(\\[') || pattern.source.includes('\\{\\[')) {
                    digits = match.length - 4; // ([000]) or {[000]} -> remove outer delimiters and [ ]
                } else if (pattern.source.includes('#\\[')) {
                    digits = match.length - 3; // #[000] -> remove # and [ ]
                } else if (pattern.source.includes('\\[')) {
                    digits = match.length - 2; // [000] -> remove [ and ]
                } else {
                    digits = match.length - 2; // fallback
                }
                const paddedNumber = nextNumber.toString().padStart(digits, '0');
                const replacement = prefix + paddedNumber + suffix;
                title = title.replace(match, replacement);
            });
            break; // Only process the first pattern type found
        }
    }
    
    // Template substitutions
    const metadata = memoryResult.metadata || {};
    const substitutions = {
        '{{title}}': memoryResult.extractedTitle || i18n('addlore.defaults.title', 'Memory'),
        '{{scene}}': i18n('addlore.defaults.scene', 'Scene {{range}}', { range: metadata.sceneRange || i18n('common.unknown', 'Unknown') }),
        '{{char}}': metadata.characterName || i18n('common.unknown', 'Unknown'),
        '{{user}}': metadata.userName || i18n('addlore.defaults.user', 'User'),
        '{{messages}}': metadata.messageCount || 0,
        '{{profile}}': metadata.profileUsed || i18n('common.unknown', 'Unknown'),
        '{{date}}': moment().format('YYYY-MM-DD'),
        '{{time}}': moment().format('HH:mm:ss')
    };
    
    // Apply substitutions
    Object.entries(substitutions).forEach(([placeholder, value]) => {
        title = title.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    });

    title = sanitizeTitle(title);

    return title;
}

/**
 * Gets the next available entry number for auto-numbering
 * @private
 * @param {Object} lorebookData - The lorebook data
 * @param {string} [titleFormat] - The title format template for format-aware extraction
 * @returns {number} The next available number
 */
function getNextEntryNumber(lorebookData, titleFormat = null) {
    if (!lorebookData.entries) {
        return 1;
    }

    const entries = Object.values(lorebookData.entries);
    const existingNumbers = [];

    entries.forEach(entry => {
        // Only check memory entries for numbering conflicts
        if (isMemoryEntry(entry) && entry.comment) {
            // Use format-aware extraction if available, otherwise fall back to original method
            const number = titleFormat
                ? extractNumberUsingFormat(entry.comment, titleFormat)
                : extractNumberFromTitle(entry.comment);
            if (number !== null) {
                existingNumbers.push(number);
            }
        }
    });

    // If no numbers were found in any existing memories, start at 1.
    if (existingNumbers.length === 0) {
        return 1;
    }

    // find the highest existing number and add 1 to it.
    const maxNumber = Math.max(...existingNumbers);
    return maxNumber + 1;
}

/**
 * Extracts number from title using the title format as a guide.
 * This prevents extracting dates or other numbers that aren't the intended sequence number.
 *
 * @private
 * @param {string} title - The title to extract number from
 * @param {string} titleFormat - The title format template
 * @returns {number|null} The extracted number or null if not found
 */
function extractNumberUsingFormat(title, titleFormat) {
    if (!title || typeof title !== 'string' || !titleFormat || typeof titleFormat !== 'string') {
        return null;
    }

    // Find all numbering patterns in the format
    const allNumberingPatterns = [
        /\[0+\]/g,   // [000]
        /\(0+\)/g,   // (000)
        /\{0+\}/g,   // {000}
        /#0+/g       // #000
    ];

    let formatMatches = [];
    let patternType = null;

    // Find which pattern type is used and where
    for (const pattern of allNumberingPatterns) {
        const matches = [...titleFormat.matchAll(pattern)];
        if (matches.length > 0) {
            formatMatches = matches;
            patternType = pattern;
            break;
        }
    }

    // If no numbering pattern found in format, fall back to original method
    if (formatMatches.length === 0) {
        return extractNumberFromTitle(title);
    }

    // Create a regex from the format that captures the number position
    let regexPattern = escapeRegex(titleFormat);

    // Replace template variables with non-greedy wildcards
    regexPattern = regexPattern.replace(/\\\{\\\{[^}]+\\\}\\\}/g, '.*?');

    // Replace numbering patterns with capture groups
    if (patternType.source.includes('\\[')) {
        regexPattern = regexPattern.replace(/\\\[0+\\\]/g, '(\\d+)');
    } else if (patternType.source.includes('\\(')) {
        regexPattern = regexPattern.replace(/\\\(0+\\\)/g, '(\\d+)');
    } else if (patternType.source.includes('\\{')) {
        regexPattern = regexPattern.replace(/\\\{0+\\\}/g, '(\\d+)');
    } else if (patternType.source.includes('#')) {
        regexPattern = regexPattern.replace(/#0+/g, '(\\d+)');
    }

    try {
        const match = title.match(new RegExp(regexPattern));
        if (match && match[1]) {
            const number = parseInt(match[1], 10);
            return isNaN(number) ? null : number;
        }
    } catch (error) {
    }

    // Fallback to original extraction method
    return extractNumberFromTitle(title);
}

/**
 * Helper function to escape special regex characters
 * @private
 * @param {string} string - String to escape
 * @returns {string} Escaped string
 */
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Safely extracts number from title using comprehensive pattern matching.
 * Supports ALL numbering formats the extension can generate:
 * - [001], [01], [1] (square brackets)
 * - (001), (01), (1) (parentheses) 
 * - {001}, {01}, {1} (curly braces)
 * - #01, #5, #7-8 (hash prefix with ranges)
 * - 001 - Title, 1 - Title (start of string)
 * - Numbers anywhere in title as fallback
 * 
 * @private
 * @param {string} title - The title to extract number from
 * @returns {number|null} The extracted number or null if not found
 */
function extractNumberFromTitle(title) {
    if (!title || typeof title !== 'string') {
        return null;
    }
    
    // Pattern 1: Square brackets [001], [01], [1]
    const bracketMatch = title.match(/\[(\d+)\]/);
    if (bracketMatch) {
        const number = parseInt(bracketMatch[1], 10);
        return isNaN(number) ? null : number;
    }
    
    // Pattern 2: Parentheses (001), (01), (1)
    const parenMatch = title.match(/\((\d+)\)/);
    if (parenMatch) {
        const number = parseInt(parenMatch[1], 10);
        return isNaN(number) ? null : number;
    }
    
    // Pattern 3: Curly braces {001}, {01}, {1}
    const braceMatch = title.match(/\{(\d+)\}/);
    if (braceMatch) {
        const number = parseInt(braceMatch[1], 10);
        return isNaN(number) ? null : number;
    }
    
    // Pattern 4: Hash prefix #01, #5, #7-8 (extract LAST number from ranges for proper sequencing)
    const hashMatch = title.match(/#(\d+)(?:-(\d+))?/);
    if (hashMatch) {
        // If it's a range like #7-8, use the second number (8)
        // If it's single like #5, use the first number (5)
        const firstNumber = parseInt(hashMatch[1], 10);
        const secondNumber = hashMatch[2] ? parseInt(hashMatch[2], 10) : null;
        
        const number = secondNumber !== null ? secondNumber : firstNumber;
        return isNaN(number) ? null : number;
    }
    
    // Pattern 5: Numbers at start of string: "001 - Title", "1 - Title"
    const startMatch = title.match(/^(\d+)(?:\s*[-\s])/);
    if (startMatch) {
        const number = parseInt(startMatch[1], 10);
        return isNaN(number) ? null : number;
    }
    
    // Pattern 6: Fallback - any sequence of digits (prefer earlier occurrence, but skip dates)
    const allNumbers = [...title.matchAll(/(\d+)/g)];
    for (const match of allNumbers) {
        const number = parseInt(match[1], 10);
        if (isNaN(number)) continue;

        // Skip if this number appears to be part of a YYYY-MM-DD date format
        const fullMatch = match[0];
        const index = match.index;
        const before = title.substring(Math.max(0, index - 10), index);
        const after = title.substring(index + fullMatch.length, index + fullMatch.length + 10);

        // Check for YYYY-MM-DD pattern (year, month, or day component)
        const isDateComponent = /\d{4}-\d{2}-\d{2}/.test(before + fullMatch + after) ||
                               /\d{4}-\d{1,2}/.test(before + fullMatch) ||
                               /-\d{1,2}-\d{1,2}/.test(fullMatch + after);

        if (!isDateComponent) {
            return number;
        }
    }
    
    return null;
}

/**
 * Identifies memory entries from lorebook using the flag system
 * @param {Object} lorebookData - The lorebook data
 * @returns {Array} Array of memory entries with extracted metadata
 */
export function identifyMemoryEntries(lorebookData) {
    if (!lorebookData.entries) {
        return [];
    }
    
    const entries = Object.values(lorebookData.entries);
    const memoryEntries = [];
    
    entries.forEach(entry => {
        if (isMemoryEntry(entry)) {
            const number = extractNumberFromTitle(entry.comment) || 0;
            
            memoryEntries.push({
                number: number,
                title: entry.comment,
                content: entry.content,
                keywords: entry.key || [],
                entry: entry
            });
        }
    });
    
    // Sort by number
    memoryEntries.sort((a, b) => a.number - b.number);
    
    return memoryEntries;
}

/**
 * Sanitizes the title to only include allowed characters
 * @private
 * @param {string} title - The title to sanitize
 * @returns {string} The sanitized title
 */
function sanitizeTitle(title) {
    // Follow SillyTavern: allow all printable Unicode; strip control characters only.
    // Control chars include C0/C1 ranges: U+0000–U+001F and U+007F–U+009F
    const cleaned = String(title ?? '').replace(/[\u0000-\u001F\u007F-\u009F]/g, '').trim();
    return cleaned || i18n('addlore.sanitize.fallback', 'Auto Memory');
}

/**
 * Gets available title format options for the settings UI
 * @returns {Array<string>} Array of title format options
 */
export function getDefaultTitleFormats() {
    return DEFAULT_TITLE_FORMATS.map((fmt, idx) => i18n(`addlore.titleFormats.${idx}`, fmt));
}

/**
 * Validates a custom title format
 * @param {string} format - The title format to validate
 * @returns {Object} Validation result
 */
export function validateTitleFormat(format) {
    const errors = [];
    const warnings = [];
    
    if (!format || typeof format !== 'string') {
        errors.push(i18n('addlore.titleFormat.errors.nonEmpty', 'Title format must be a non-empty string'));
        return { valid: false, errors, warnings };
    }
    
    // Check for control characters (excluding template placeholders)
    // We follow SillyTavern: only control characters are removed during sanitization
    const withoutPlaceholders = format.replace(/\{\{[^}]+\}\}/g, '');
    const controlCharsPattern = /[\u0000-\u001F\u007F-\u009F]/g;
    
    if (controlCharsPattern.test(withoutPlaceholders)) {
        warnings.push(i18n('addlore.titleFormat.warnings.sanitization', 'Title contains characters that will be removed during sanitization'));
    }
    
    // Check for valid placeholder syntax
    const invalidPlaceholders = format.match(/\{\{[^}]*\}\}/g)?.filter(placeholder => {
        const validPlaceholders = ['{{title}}', '{{scene}}', '{{char}}', '{{user}}', '{{messages}}', '{{profile}}', '{{date}}', '{{time}}'];
        return !validPlaceholders.includes(placeholder);
    });
    
    if (invalidPlaceholders && invalidPlaceholders.length > 0) {
        warnings.push(i18n('addlore.titleFormat.warnings.unknownPlaceholders', 'Unknown placeholders: {{placeholders}}', { placeholders: invalidPlaceholders.join(', ') }));
    }

    // Check for valid numbering patterns (accept multiple token shapes, including wrapped forms)
    const numberingPatterns = format.match(/[\[\({#][^0\]\)}]*[\]\)}]?/g);
    if (numberingPatterns) {
        const allowed = [
            /^\[0+\]$/,          // [000]
            /^\(0+\)$/,          // (000)
            /^\{0+\}$/,          // {000}
            /^#0+$/,             // #000
            /^#\[0+\]$/,         // #[000]
            /^\(\[0+\]\)$/,      // ([000])
            /^\{\[0+\]\}$/       // {[000]}
        ];
        const invalidNumbering = numberingPatterns.filter(pat => !allowed.some(rx => rx.test(pat)));

        if (invalidNumbering.length > 0) {
            warnings.push(i18n('addlore.titleFormat.warnings.invalidNumbering', 'Invalid numbering patterns: {{patterns}}. Use [0], [00], [000], (0), {0}, #0, #[0], ([0]), {[0]} etc.', { patterns: invalidNumbering.join(', ') }));
        }
    }

    if (format.length > 100) {
        warnings.push(i18n('addlore.titleFormat.warnings.tooLong', 'Title format is very long and may be truncated'));
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
}

/**
 * Preview what a title would look like with sample data
 * @param {string} titleFormat - The title format to preview
 * @param {Object} sampleData - Sample memory metadata for preview
 * @returns {string} Preview of the generated title
 */
export function previewTitle(titleFormat, sampleData = {}) {
    const defaultSampleData = {
        extractedTitle: i18n('addlore.preview.sampleTitle', 'Sample Memory Title'),
        metadata: {
            sceneRange: '15-23',
            characterName: 'Alice',
            userName: 'Bob',
            messageCount: 9,
            profileUsed: i18n('addlore.preview.sampleProfile', 'Summary')
        }
    };
    
    const mockLorebookData = {
        entries: {
            'existing1': { uid: 5, comment: '[001] - Previous Memory', stmemorybooks: true },
            'existing2': { uid: 7, comment: '[002] - Another Memory', stmemorybooks: true }
        }
    };
    
    const mergedData = { ...defaultSampleData, ...sampleData };
    
    try {
        return generateEntryTitle(titleFormat, mergedData, mockLorebookData);
    } catch (error) {
        return i18n('addlore.preview.error', 'Error: {{message}}', { message: error.message });
    }
}

export function getRangeFromMemoryEntry(entry) {
    if (typeof entry.STMB_start === 'number' && typeof entry.STMB_end === 'number') {
        return { start: entry.STMB_start, end: entry.STMB_end };
    }
    return null;
}

/**
 * Get statistics about lorebook entries for the current chat
 * @returns {Promise<Object>} Statistics about lorebook usage
 */
export async function getLorebookStats() {
    try {
        const context = await getContext();
        const lorebookName = context.chatMetadata[METADATA_KEY];
        
        if (!lorebookName) {
            return { valid: false, error: i18n('addlore.stats.errors.noBinding', 'No lorebook bound to chat') };
        }
        
        const lorebookData = await loadWorldInfo(lorebookName);
        if (!lorebookData) {
            return { valid: false, error: i18n('addlore.stats.errors.loadFailed', 'Failed to load lorebook') };
        }
        
        const entries = Object.values(lorebookData.entries || {});
        
        // Use flag-based detection to identify memory entries
        const memoryEntries = identifyMemoryEntries(lorebookData);
        const otherEntries = entries.filter(entry => 
            !memoryEntries.some(memEntry => memEntry.entry === entry)
        );
        
        return {
            valid: true,
            lorebookName,
            totalEntries: entries.length,
            memoryEntries: memoryEntries.length,
            otherEntries: otherEntries.length,
            averageContentLength: entries.length > 0 ? 
                Math.round(entries.reduce((sum, entry) => sum + (entry.content?.length || 0), 0) / entries.length) : 0,
            totalKeywords: entries.reduce((sum, entry) => sum + (entry.key?.length || 0), 0),
            memoryKeywords: memoryEntries.reduce((sum, entry) => sum + (entry.keywords?.length || 0), 0)
        };
        
    } catch (error) {
        console.error(i18n('addlore.log.getStatsError', `${MODULE_NAME}: Error getting lorebook stats:`), error);
        return { valid: false, error: error.message };
    }
}

/**
 * Update the highest memory processed tracking for the current chat
 * @param {Object} memoryResult - The memory result containing metadata
 */
function updateHighestMemoryProcessed(memoryResult) {
    try {
        console.log(i18n('addlore.log.updateHighestCalled', `${MODULE_NAME}: updateHighestMemoryProcessed called with:`), memoryResult);

        // Extract the end message number from the scene range
        const sceneRange = memoryResult.metadata?.sceneRange;
        console.log(i18n('addlore.log.sceneRangeExtracted', `${MODULE_NAME}: sceneRange extracted:`), sceneRange);

        if (!sceneRange) {
            console.warn(i18n('addlore.warn.noSceneRange', `${MODULE_NAME}: No scene range found in memory result, cannot update highest processed`));
            return;
        }

        const rangeParts = sceneRange.split('-');
        if (rangeParts.length !== 2) {
            console.warn(i18n('addlore.warn.invalidSceneRangeFormat', `${MODULE_NAME}: Invalid scene range format: {{range}}`, { range: sceneRange }));
            return;
        }

        const endMessage = parseInt(rangeParts[1], 10);
        if (isNaN(endMessage)) {
            console.warn(i18n('addlore.warn.invalidEndMessage', `${MODULE_NAME}: Invalid end message number: {{end}}`, { end: rangeParts[1] }));
            return;
        }

        // Get current scene markers (which handles both single and group chats)
        const sceneMarkers = getSceneMarkers();
        if (!sceneMarkers) {
            console.warn(i18n('addlore.warn.noSceneMarkers', `${MODULE_NAME}: Could not get scene markers to update highest processed`));
            return;
        }

        // Always update highestMemoryProcessed to the end of the memory we just created
        sceneMarkers.highestMemoryProcessed = endMessage;

        // Save the metadata (works for both group chats and single-character chats)
        saveMetadataForCurrentContext();

        console.log(i18n('addlore.log.setHighest', `${MODULE_NAME}: Set highest memory processed to message {{endMessage}}`, { endMessage }));

    } catch (error) {
        console.error(i18n('addlore.log.updateHighestError', `${MODULE_NAME}: Error updating highest memory processed:`), error);
    }
}

/**
 * Get a lorebook entry by its comment/title (exact match).
 * @param {Object} lorebookData
 * @param {string} title
 * @returns {Object|null}
 */
export function getEntryByTitle(lorebookData, title) {
    if (!lorebookData || !lorebookData.entries || !title) return null;
    const entries = Object.values(lorebookData.entries);
    for (const entry of entries) {
        if ((entry.comment || '') === title) {
            return entry;
        }
    }
    return null;
}

/**
 * Batch upsert lorebook entries with a single save (and optional single reload).
 * Each item is staged into the provided lorebookData in-memory object; then
 * saveWorldInfo is called exactly once for the whole batch.
 *
 * @param {string} lorebookName
 * @param {Object} lorebookData
 * @param {Array<{title: string, content: string, defaults?: Object, metadataUpdates?: Object, entryOverrides?: Object}>} items
 * @param {Object} [options]
 * @param {boolean} [options.refreshEditor=true]
 * @returns {Promise<Array<{title:string, uid:number, created:boolean}>>}
 */
export async function upsertLorebookEntriesBatch(lorebookName, lorebookData, items, options = {}) {
    const {
        refreshEditor = true,
    } = options;

    if (!lorebookName || !lorebookData || !Array.isArray(items)) {
        throw new Error(i18n('addlore.upsert.errors.invalidArgs', 'Invalid arguments to upsertLorebookEntriesBatch'));
    }

    const results = [];

    for (const it of items) {
        if (!it || !it.title) continue;

        const title = String(it.title);
        const content = it.content != null ? String(it.content) : '';
        const defaults = it.defaults || {};
        const metadataUpdates = it.metadataUpdates || {};
        const entryOverrides = it.entryOverrides || {};

        let entry = getEntryByTitle(lorebookData, title);
        let created = false;

        if (!entry) {
            entry = createWorldInfoEntry(lorebookName, lorebookData);
            if (!entry) {
                throw new Error(i18n('addlore.upsert.errors.createFailed', 'Failed to create lorebook entry'));
            }

            // Apply defaults for new entry
            entry.vectorized = !!defaults.vectorized;
            entry.selective = !!defaults.selective;
            if (typeof defaults.order === 'number') entry.order = defaults.order;
            if (typeof defaults.position === 'number') entry.position = defaults.position;

            entry.key = entry.key || [];
            entry.keysecondary = entry.keysecondary || [];
            entry.disable = false;

            created = true;
        }

        // Normalize expected fields for both new and existing entries
        entry.key = Array.isArray(entry.key) ? entry.key : [];
        entry.keysecondary = Array.isArray(entry.keysecondary) ? entry.keysecondary : [];
        if (typeof entry.disable !== 'boolean') entry.disable = false;

        // Update core fields
        entry.comment = title;
        entry.content = content;

        // Apply metadata updates
        for (const [k, v] of Object.entries(metadataUpdates)) {
            entry[k] = v;
        }

        // Apply entry overrides (both on create and update)
        for (const [k, v] of Object.entries(entryOverrides)) {
            entry[k] = v;
        }

        results.push({ title, uid: entry.uid, created });
    }

    // Single save for the whole batch
    await saveWorldInfo(lorebookName, lorebookData, true);

    if (refreshEditor) {
        reloadEditor(lorebookName);
    }

    return results;
}

/**
 * Upsert a lorebook entry by title. If exists, update content and optional metadata;
 * otherwise create a new entry using provided defaults.
 * This does NOT mark entries as STMemoryBooks memories.
 *
 * @param {string} lorebookName
 * @param {Object} lorebookData
 * @param {string} title
 * @param {string} content
 * @param {Object} options
 * @param {Object} [options.defaults]  Defaults for new entries (vectorized, selective, order, position, etc.)
 * @param {Object} [options.metadataUpdates]  Key/value pairs to set on entry (e.g., STMB_tracker_lastMsgId)
 * @param {Object} [options.entryOverrides]  Fields to set/update on the entry for both create and update (e.g., constant, vectorized, preventRecursion, delayUntilRecursion, order)
 * @param {boolean} [options.refreshEditor=true]
 * @returns {Promise<{uid:number, created:boolean}>}
 */
export async function upsertLorebookEntryByTitle(lorebookName, lorebookData, title, content, options = {}) {
    const {
        defaults = {
            vectorized: true,
            selective: true,
            order: 100,
            position: 0,
        },
        metadataUpdates = {},
        refreshEditor = true,
        entryOverrides = {},
    } = options;

    if (!lorebookName || !lorebookData || !title) {
        throw new Error(i18n('addlore.upsert.errors.invalidArgs', 'Invalid arguments to upsertLorebookEntryByTitle'));
    }

    let entry = getEntryByTitle(lorebookData, title);
    let created = false;

    if (!entry) {
        entry = createWorldInfoEntry(lorebookName, lorebookData);
        if (!entry) {
                throw new Error(i18n('addlore.upsert.errors.createFailed', 'Failed to create lorebook entry'));
        }
        // Apply defaults for new entry
        entry.vectorized = !!defaults.vectorized;
        entry.selective = !!defaults.selective;
        if (typeof defaults.order === 'number') entry.order = defaults.order;
        if (typeof defaults.position === 'number') entry.position = defaults.position;

        entry.key = entry.key || [];
        entry.keysecondary = entry.keysecondary || [];
        entry.disable = false;

        created = true;
    }

    // Update core fields
    entry.comment = title;
    entry.content = content != null ? String(content) : '';

    // Apply metadata updates
    for (const [k, v] of Object.entries(metadataUpdates || {})) {
        entry[k] = v;
    }

    // Apply entry overrides (both on create and update)
    for (const [k, v] of Object.entries(entryOverrides || {})) {
        entry[k] = v;
    }

    await saveWorldInfo(lorebookName, lorebookData, true);
    if (refreshEditor) {
        reloadEditor(lorebookName);
    }

    return { uid: entry.uid, created };
}
