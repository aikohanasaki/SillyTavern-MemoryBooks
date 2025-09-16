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

const MODULE_NAME = 'STMemoryBooks-AddLore';

/**
 * Helper function to convert old boolean auto-hide settings to new dropdown format
 */
function getAutoHideMode(moduleSettings) {
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
    '[000] - {{title}} ({{profile}})',
    '{{date}} [000] 🎬{{title}}, {{messages}} msgs',
    '[000] {{date}} - {{char}} Memory',
    '[00] - {{user}} & {{char}} {{scene}}',
    '🧠 [000] ({{messages}} msgs)',
    '📚 Memory #[000] - {{profile}} {{date}} {{time}}',
    '[000] - {{scene}}: {{title}}',
    '[000] - {{title}} ({{scene}})',
    '[000] - {{title}}'
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
    
    const context = getContext();
    
    try {
        if (!memoryResult?.content) {
            throw new Error('Invalid memory result: missing content');
        }
        
        if (!lorebookValidation?.valid || !lorebookValidation.data) {
            throw new Error('Invalid lorebook validation data');
        }
        
        const settings = extension_settings.STMemoryBooks || {};
        let titleFormat = memoryResult.titleFormat;
        if (!titleFormat) {
            titleFormat = settings.titleFormat || '[000] - {{title}}';
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
            throw new Error('Failed to create new lorebook entry');
        }
        
        const entryTitle = generateEntryTitle(titleFormat, memoryResult, lorebookValidation.data);
        populateLorebookEntry(newEntry, memoryResult, entryTitle, lorebookSettings);
        await saveWorldInfo(lorebookValidation.name, lorebookValidation.data, true);
        if (settings.moduleSettings?.showNotifications !== false) {
            toastr.success(`Memory "${entryTitle}" added to "${lorebookValidation.name}"`, 'STMemoryBooks');
        }
        
        if (refreshEditor) {
            try {
                reloadEditor(lorebookValidation.name);
            } catch (error) {
                console.warn(`${MODULE_NAME}: Failed to refresh editor UI:`, error);
            }
        }
        
        // Execute auto-hide commands if enabled
        const autoHideMode = getAutoHideMode(settings.moduleSettings);
        if (autoHideMode !== 'none') {
            const unhiddenCount = settings.moduleSettings?.unhiddenEntriesCount || 0;
            const messageCount = memoryResult.metadata?.messageCount || 0;
            
            // Validate that unhidden count is less than message count (only for 'last' mode)
            if (autoHideMode === 'last' && unhiddenCount >= messageCount && unhiddenCount > 0) {
                const message = unhiddenCount > messageCount 
                    ? `Cannot leave ${unhiddenCount} messages unhidden - memory only contains ${messageCount} messages. Auto-hide skipped.`
                    : `Cannot leave ${unhiddenCount} messages unhidden - memory only contains ${messageCount} messages. Auto-hide skipped.`;
                if (settings.moduleSettings?.showNotifications !== false) {
                    toastr.warning(message, 'STMemoryBooks');
                }
                return {
                    success: true,
                    entryId: newEntry.uid,
                    entryTitle: entryTitle,
                    lorebookName: lorebookValidation.name,
                    keywordCount: memoryResult.suggestedKeys?.length || 0,
                    message: `Memory successfully added to "${lorebookValidation.name}" (auto-hide skipped)`,
                    warning: message
                };
            }
            
            if (autoHideMode === 'all') {
                // Additional check for 'all' mode: only hide if scene end > unhidden count
                const sceneRange = memoryResult.metadata?.sceneRange;
                let sceneEnd = null;
                if (sceneRange) {
                    const rangeParts = sceneRange.split('-');
                    if (rangeParts.length === 2) {
                        sceneEnd = parseInt(rangeParts[1], 10);
                    }
                }
                
                // Only proceed if we have scene end data and it's greater than unhidden count
                if (sceneEnd !== null && sceneEnd > unhiddenCount) {
                    const hideCommand = unhiddenCount > 0 
                        ? `/hide 0-${sceneEnd - unhiddenCount}` 
                        : `/hide 0-${sceneEnd}`;
                    await executeSlashCommands(hideCommand);
                } else {
                    const reason = sceneEnd === null 
                        ? 'no scene end data available' 
                        : `scene end ${sceneEnd} <= unhidden count ${unhiddenCount}`;
                }
            } else if (autoHideMode === 'last') {
                // Get scene start and end for 'last' mode
                const sceneRange = memoryResult.metadata?.sceneRange;
                let sceneStart = null;
                let sceneEnd = null;
                if (sceneRange) {
                    const rangeParts = sceneRange.split('-');
                    if (rangeParts.length === 2) {
                        sceneStart = parseInt(rangeParts[0], 10);
                        sceneEnd = parseInt(rangeParts[1], 10);
                    }
                }
                
                if (sceneStart !== null && sceneEnd !== null) {
                    const hideCommand = unhiddenCount > 0 
                        ? `/hide ${sceneStart}-${sceneEnd - unhiddenCount}` 
                        : `/hide ${sceneStart}-${sceneEnd}`;
                    await executeSlashCommands(hideCommand);
                }
            }
        }
        return {
            success: true,
            entryId: newEntry.uid,
            entryTitle: entryTitle,
            lorebookName: lorebookValidation.name,
            keywordCount: memoryResult.suggestedKeys?.length || 0,
            message: `Memory successfully added to "${lorebookValidation.name}"`
        };
        
    } catch (error) {
        console.error(`${MODULE_NAME}: Failed to add memory to lorebook:`, error);
        
        if (extension_settings.STMemoryBooks?.moduleSettings?.showNotifications !== false) {
            toastr.error(`Failed to add memory: ${error.message}`, 'STMemoryBooks');
        }
        
        return {
            success: false,
            error: error.message,
            message: `Failed to add memory to lorebook: ${error.message}`
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
        '{{title}}': memoryResult.extractedTitle || 'Memory',
        '{{scene}}': `Scene ${metadata.sceneRange || 'Unknown'}`,
        '{{char}}': metadata.characterName || 'Unknown',
        '{{user}}': metadata.userName || 'User',
        '{{messages}}': metadata.messageCount || 0,
        '{{profile}}': metadata.profileUsed || 'Unknown',
        '{{date}}': moment().format('YYYY-MM-DD'),
        '{{time}}': moment().format('HH:mm:ss')
    };
    
    // Apply substitutions
    Object.entries(substitutions).forEach(([placeholder, value]) => {
        title = title.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    });

    // Clean up the title (remove invalid characters not in allowed list)
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
    // Allowed characters: `-`, ` `, `.`, `(`, `)`, `#`, `[`, `]`, `{`, `}`, `:`, `;`, `,`
    // Plus alphanumeric characters and standard emoji
    const allowedCharsPattern = /[^a-zA-Z0-9\-\s\.\(\)#\[\]\{\}:;,&+!\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    
    return title.replace(allowedCharsPattern, '').trim() || 'Auto Memory';
}

/**
 * Gets available title format options for the settings UI
 * @returns {Array<string>} Array of title format options
 */
export function getDefaultTitleFormats() {
    return [...DEFAULT_TITLE_FORMATS];
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
        errors.push('Title format must be a non-empty string');
        return { valid: false, errors, warnings };
    }
    
    // Check for disallowed characters (excluding template placeholders)
    const withoutPlaceholders = format.replace(/\{\{[^}]+\}\}/g, '').replace(/\[0+\]/g, '');
    const disallowedPattern = /[^a-zA-Z0-9\-\s\.\(\)#\[\]\{\}:;,\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    
    if (disallowedPattern.test(withoutPlaceholders)) {
        warnings.push('Title contains characters that will be removed during sanitization');
    }
    
    // Check for valid placeholder syntax
    const invalidPlaceholders = format.match(/\{\{[^}]*\}\}/g)?.filter(placeholder => {
        const validPlaceholders = ['{{title}}', '{{scene}}', '{{char}}', '{{user}}', '{{messages}}', '{{profile}}', '{{date}}', '{{time}}'];
        return !validPlaceholders.includes(placeholder);
    });
    
    if (invalidPlaceholders && invalidPlaceholders.length > 0) {
        warnings.push(`Unknown placeholders: ${invalidPlaceholders.join(', ')}`);
    }
    
    // Check for valid numbering patterns (now supports multiple formats)
    const numberingPatterns = format.match(/[\[\({#][^0\]\)}]*[\]\)}]?/g);
    if (numberingPatterns) {
        const invalidNumbering = numberingPatterns.filter(pattern => {
            return !/^[\[\({#]0+[\]\)}]?$/.test(pattern);
        });
        
        if (invalidNumbering.length > 0) {
            warnings.push(`Invalid numbering patterns: ${invalidNumbering.join(', ')}. Use [0], [00], [000], (0), {0}, #0 etc.`);
        }
    }
    
    if (format.length > 100) {
        warnings.push('Title format is very long and may be truncated');
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
        extractedTitle: 'Sample Memory Title',
        metadata: {
            sceneRange: '15-23',
            characterName: 'Alice',
            userName: 'Bob',
            messageCount: 9,
            profileUsed: 'Summary'
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
        return `Error: ${error.message}`;
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
        const context = getContext();
        const lorebookName = context.chatMetadata[METADATA_KEY];
        
        if (!lorebookName) {
            return { valid: false, error: 'No lorebook bound to chat' };
        }
        
        const lorebookData = await loadWorldInfo(lorebookName);
        if (!lorebookData) {
            return { valid: false, error: 'Failed to load lorebook' };
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
        console.error(`${MODULE_NAME}: Error getting lorebook stats:`, error);
        return { valid: false, error: error.message };
    }
}