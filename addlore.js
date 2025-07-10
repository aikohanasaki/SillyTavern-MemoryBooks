import { getContext } from '../../../extensions.js';
import { 
    METADATA_KEY, 
    loadWorldInfo, 
    createWorldInfoEntry, 
    saveWorldInfo, 
    reloadEditor 
} from '../../../world-info.js';
import { extension_settings } from '../../../extensions.js';

const MODULE_NAME = 'STMemoryBooks-AddLore';

// Default title formats that users can select from
const DEFAULT_TITLE_FORMATS = [
    '[000] - {{title}} ({{profile}})',
    '{{date}} [000] 🎬{{title}}, {{messages}} msgs',
    '[000] {{date}} - {{char}} Memory',
    '[00] - {{user}} & {{char}} {{scene}}',
    '🧠 [000] ({{messages}} msgs)',
    '📚 Memory [000] - {{profile}} {{date}} {{time}}',
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
    console.log(`${MODULE_NAME}: Adding memory to lorebook "${lorebookValidation.name}"`);
    
    const context = getContext();
    
    try {
        if (!memoryResult?.content) {
            throw new Error('Invalid memory result: missing content');
        }
        
        if (!lorebookValidation?.valid || !lorebookValidation.data) {
            throw new Error('Invalid lorebook validation data');
        }
        
        const settings = extension_settings.STMemoryBooks || {};
        const titleFormat = memoryResult.titleFormat || settings.titleFormat || DEFAULT_TITLE_FORMATS[0];
        const refreshEditor = settings.moduleSettings?.refreshEditor !== false;
        
        const newEntry = createWorldInfoEntry(lorebookValidation.name, lorebookValidation.data);
        
        if (!newEntry) {
            throw new Error('Failed to create new lorebook entry');
        }
        
        const entryTitle = generateEntryTitle(titleFormat, memoryResult, lorebookValidation.data);
        
        populateLorebookEntry(newEntry, memoryResult, entryTitle);
        
        await saveWorldInfo(lorebookValidation.name, lorebookValidation.data, true);
        
        console.log(`${MODULE_NAME}: Successfully added memory entry "${entryTitle}" to lorebook`);
        
        if (settings.moduleSettings?.showNotifications !== false) {
            toastr.success(`Memory "${entryTitle}" added to "${lorebookValidation.name}"`, 'STMemoryBooks');
        }
        
        if (refreshEditor) {
            try {
                reloadEditor(lorebookValidation.name);
                console.log(`${MODULE_NAME}: Refreshed lorebook editor UI`);
            } catch (error) {
                console.warn(`${MODULE_NAME}: Failed to refresh editor UI:`, error);
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
 */
function populateLorebookEntry(entry, memoryResult, entryTitle) {
    // Core content and keywords
    entry.content = memoryResult.content;
    entry.key = memoryResult.suggestedKeys || [];
    entry.comment = entryTitle;
    
    // Extract order number from title for proper sorting
    const orderNumber = extractNumberFromTitle(entryTitle) || 1;
    
    // Set all properties to match the tested lorebook structure
    // These values are tested and proven to work well for memory entries
    entry.keysecondary = [];
    entry.constant = false;
    entry.vectorized = true;  // Important: memory entries should be vectorized
    entry.selective = true;
    entry.selectiveLogic = 0;
    entry.addMemo = true;
    entry.order = orderNumber;
    entry.position = 0;
    entry.disable = false;
    entry.excludeRecursion = false;
    entry.preventRecursion = true;
    entry.delayUntilRecursion = true;
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
    
    console.log(`${MODULE_NAME}: Populated entry with ${entry.key.length} keywords and ${entry.content.length} characters`);
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

// In addlore.js

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
    
    // Auto-numbering: [0], [00], [000], etc.
    const numberingPattern = /\[0+\]/g;
    const matches = title.match(numberingPattern);
    
    if (matches) {
        // This logic is now fixed from our previous discussion.
        const nextNumber = getNextEntryNumber(lorebookData);
        
        matches.forEach(match => {
            const digits = match.length - 2; // Remove [ and ]
            const paddedNumber = nextNumber.toString().padStart(digits, '0');
            title = title.replace(match, paddedNumber);
        });
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
        // --- CHANGE HERE ---
        // Use moment.js to format the date as YYYY-MM-DD.
        '{{date}}': moment().format('YYYY-MM-DD'),
        '{{time}}': new Date().toLocaleTimeString()
    };
    
    // Apply substitutions
    Object.entries(substitutions).forEach(([placeholder, value]) => {
        title = title.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
    });
    
    // Clean up the title (remove invalid characters not in allowed list)
    title = sanitizeTitle(title);
    
    console.log(`${MODULE_NAME}: Generated entry title: "${title}"`);
    return title;
}

// In addlore.js

/**
 * Gets the next available entry number for auto-numbering
 * @private
 * @param {Object} lorebookData - The lorebook data
 * @returns {number} The next available number
 */
function getNextEntryNumber(lorebookData) {
    if (!lorebookData.entries) {
        return 1;
    }
    
    const entries = Object.values(lorebookData.entries);
    const existingNumbers = [];
    
    entries.forEach(entry => {
        // Only check memory entries for numbering conflicts
        if (isMemoryEntry(entry) && entry.comment) {
            const number = extractNumberFromTitle(entry.comment);
            if (number !== null) {
                existingNumbers.push(number);
            }
        }
    });
    
    // If no numbers were found in any existing memories, start at 1.
    if (existingNumbers.length === 0) {
        return 1;
    }
    
    // --- BUG FIX ---
    // The old logic used a fragile loop that would break incorrectly.
    // The new logic is simpler and more robust: find the highest existing
    // number and add 1 to it. This guarantees sequential numbering.
    const maxNumber = Math.max(...existingNumbers);
    return maxNumber + 1;
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
    
    // Pattern 6: Fallback - any sequence of digits (prefer earlier occurrence)
    const anyNumberMatch = title.match(/(\d+)/);
    if (anyNumberMatch) {
        const number = parseInt(anyNumberMatch[1], 10);
        return isNaN(number) ? null : number;
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
    
    console.log(`${MODULE_NAME}: Identified ${memoryEntries.length} memory entries using flag-based detection`);
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
    const allowedCharsPattern = /[^a-zA-Z0-9\-\s\.\(\)#\[\]\{\}:;,\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    
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