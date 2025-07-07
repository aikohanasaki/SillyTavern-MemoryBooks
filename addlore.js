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
    
    try {
        const context = getContext();
        
        // Validate inputs
        if (!memoryResult?.content) {
            throw new Error('Invalid memory result: missing content');
        }
        
        if (!lorebookValidation?.valid || !lorebookValidation.data) {
            throw new Error('Invalid lorebook validation data');
        }
        
        // Get extension settings for title formatting and UI refresh
        const settings = extension_settings.STMemoryBooks || {};
        const titleFormat = settings.titleFormat || DEFAULT_TITLE_FORMATS[0];
        const refreshEditor = settings.moduleSettings?.refreshEditor !== false; // Default to true
        
        // Create new lorebook entry
        const newEntry = createWorldInfoEntry(lorebookValidation.name, lorebookValidation.data);
        
        if (!newEntry) {
            throw new Error('Failed to create new lorebook entry');
        }
        
        // Generate title using the configured format
        const entryTitle = generateEntryTitle(titleFormat, memoryResult, lorebookValidation.data);
        
        // Populate the entry with memory data
        populateLorebookEntry(newEntry, memoryResult, entryTitle);
        
        // Save the modified lorebook data back to the server
        await saveWorldInfo(lorebookValidation.name, lorebookValidation.data, true);
        
        console.log(`${MODULE_NAME}: Successfully added memory entry "${entryTitle}" to lorebook`);
        
        // Provide user feedback
        if (settings.moduleSettings?.showNotifications !== false) {
            context.toastr.success(`Memory "${entryTitle}" added to "${lorebookValidation.name}"`, 'STMemoryBooks');
        }
        
        // Refresh the editor if enabled and user is viewing this lorebook
        if (refreshEditor) {
            try {
                reloadEditor(lorebookValidation.name);
                console.log(`${MODULE_NAME}: Refreshed lorebook editor UI`);
            } catch (error) {
                console.warn(`${MODULE_NAME}: Failed to refresh editor UI:`, error);
                // Don't fail the whole operation if UI refresh fails
            }
        }
        
        // Return success result
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
        
        const context = getContext();
        if (extension_settings.STMemoryBooks?.moduleSettings?.showNotifications !== false) {
            context.toastr.error(`Failed to add memory: ${error.message}`, 'STMemoryBooks');
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
    const orderNumber = extractNumberFromTitle(entryTitle) || 100;
    
    // Set all properties to match the tested lorebook structure
    // These values are tested and proven to work well for memory entries
    entry.keysecondary = [];
    entry.constant = false;
    entry.vectorized = true;  // Important: memory entries should be vectorized
    entry.selective = true;
    entry.selectiveLogic = 0;
    entry.addMemo = true;
    entry.order = orderNumber;
    entry.position = 3;  // Position value from testing
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
    entry.scanDepth = 1;
    entry.caseSensitive = null;
    entry.matchWholeWords = null;
    entry.useGroupScoring = null;
    entry.automationId = "";
    entry.role = null;
    entry.sticky = 0;
    entry.cooldown = 0;
    entry.delay = 0;
    entry.displayIndex = orderNumber; // Use order number for display index
    
    console.log(`${MODULE_NAME}: Populated entry with ${entry.key.length} keywords and ${entry.content.length} characters`);
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
    
    // Auto-numbering: [0], [00], [000], etc.
    const numberingPattern = /\[0+\]/g;
    const matches = title.match(numberingPattern);
    
    if (matches) {
        const nextNumber = getNextEntryNumber(lorebookData, titleFormat);
        
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
        '{{date}}': new Date().toLocaleDateString(),
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

/**
 * Gets the next available entry number for auto-numbering based on title format
 * @private
 * @param {Object} lorebookData - The lorebook data
 * @param {string} titleFormat - The title format to match against
 * @returns {number} The next available number
 */
function getNextEntryNumber(lorebookData, titleFormat) {
    if (!lorebookData.entries) {
        return 1;
    }
    
    const entries = Object.values(lorebookData.entries);
    const existingNumbers = [];
    
    // Use safe string parsing instead of regex generation
    entries.forEach(entry => {
        if (entry.comment && isMemoryEntry(entry, titleFormat)) {
            const number = extractNumberFromTitle(entry.comment);
            if (number !== null) {
                existingNumbers.push(number);
            }
        }
    });
    
    // Find the next available number
    if (existingNumbers.length === 0) {
        return 1;
    }
    
    existingNumbers.sort((a, b) => a - b);
    let nextNumber = 1;
    
    for (const num of existingNumbers) {
        if (num === nextNumber) {
            nextNumber++;
        } else if (num > nextNumber) {
            break;
        }
    }
    
    return nextNumber;
}

/**
 * Safely extracts number from title using string parsing instead of regex
 * @private
 * @param {string} title - The title to extract number from
 * @returns {number|null} The extracted number or null if not found
 */
function extractNumberFromTitle(title) {
    if (!title || typeof title !== 'string') {
        return null;
    }
    
    // Find bracketed numbers like [001], [42], etc.
    const bracketMatch = title.match(/\[(\d+)\]/);
    if (bracketMatch) {
        const number = parseInt(bracketMatch[1], 10);
        return isNaN(number) ? null : number;
    }
    
    return null;
}

/**
 * Safely determines if an entry matches the title format pattern (is a memory entry)
 * Uses string parsing instead of dangerous regex generation
 * @private
 * @param {Object} entry - The lorebook entry to check
 * @param {string} titleFormat - The title format to match against
 * @returns {boolean} Whether this entry appears to be a memory entry
 */
function isMemoryEntry(entry, titleFormat) {
    if (!entry.comment || !titleFormat) {
        return false;
    }
    
    // Primary check: Does this entry have the vectorized property? 
    // Memory entries should always be vectorized for database retrieval
    if (entry.vectorized !== true) {
        return false;
    }
    
    // Secondary check: Does the title contain a bracketed number?
    // All memory entries should have auto-numbering
    if (!extractNumberFromTitle(entry.comment)) {
        return false;
    }
    
    // Tertiary check: Basic format structure matching using safe string operations
    return hasFormatStructure(entry.comment, titleFormat);
}

/**
 * Safely checks if a title has the basic structure of the format template
 * Uses string operations instead of regex generation
 * @private
 * @param {string} title - The title to check
 * @param {string} titleFormat - The format template
 * @returns {boolean} Whether the title matches the basic structure
 */
function hasFormatStructure(title, titleFormat) {
    if (!title || !titleFormat) {
        return false;
    }
    
    try {
        // Extract static parts of the format (non-placeholder parts)
        let staticParts = titleFormat;
        
        // Remove common placeholders to find static text
        const placeholders = [
            '{{title}}', '{{scene}}', '{{char}}', '{{user}}', 
            '{{messages}}', '{{profile}}', '{{date}}', '{{time}}'
        ];
        
        placeholders.forEach(placeholder => {
            staticParts = staticParts.replace(placeholder, '');
        });
        
        // Remove numbering placeholders like [000]
        staticParts = staticParts.replace(/\[0+\]/g, '');
        
        // Clean up extra spaces
        staticParts = staticParts.replace(/\s+/g, ' ').trim();
        
        // If there are meaningful static parts (more than just punctuation), check for them
        if (staticParts.length > 2) {
            // Split into words and check if most static words appear in the title
            const staticWords = staticParts.split(/\s+/).filter(word => 
                word.length > 1 && /[a-zA-Z]/.test(word)
            );
            
            if (staticWords.length > 0) {
                const foundWords = staticWords.filter(word => 
                    title.toLowerCase().includes(word.toLowerCase())
                ).length;
                
                // If most static words are found, it likely matches the format
                return foundWords >= Math.ceil(staticWords.length * 0.6);
            }
        }
        
        // If no meaningful static parts, just check that it has brackets (likely memory entry)
        return /\[\d+\]/.test(title);
        
    } catch (error) {
        console.warn(`${MODULE_NAME}: Error in format structure check:`, error);
        // Fallback: just check for bracketed numbers
        return /\[\d+\]/.test(title);
    }
}

/**
 * Identifies memory entries from lorebook using safe string parsing
 * @param {Object} lorebookData - The lorebook data
 * @param {string} titleFormat - The title format to match against
 * @returns {Array} Array of memory entries with extracted metadata
 */
export function identifyMemoryEntries(lorebookData, titleFormat) {
    if (!lorebookData.entries) {
        return [];
    }
    
    const entries = Object.values(lorebookData.entries);
    const memoryEntries = [];
    
    entries.forEach(entry => {
        if (isMemoryEntry(entry, titleFormat)) {
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
    
    console.log(`${MODULE_NAME}: Identified ${memoryEntries.length} memory entries using safe string parsing`);
    return memoryEntries;
}

/**
 * Sanitizes the title to only include allowed characters
 * @private
 * @param {string} title - The title to sanitize
 * @returns {string} The sanitized title
 */
function sanitizeTitle(title) {
    // Allowed characters: `-`, ` `, `.`, `(`, `)`, `#`, `[`, `]`
    // Plus alphanumeric characters and standard emoji
    const allowedCharsPattern = /[^a-zA-Z0-9\-\s\.\(\)#\[\]\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    
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
    const disallowedPattern = /[^a-zA-Z0-9\-\s\.\(\)#\[\]\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
    
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
    
    // Check for valid numbering patterns
    const invalidNumbering = format.match(/\[[^0\]]*\]/g)?.filter(pattern => {
        return !/^\[0+\]$/.test(pattern);
    });
    
    if (invalidNumbering && invalidNumbering.length > 0) {
        warnings.push(`Invalid numbering patterns: ${invalidNumbering.join(', ')}. Use [0], [00], [000] etc.`);
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
            'existing1': { uid: 5, comment: '[001] - Previous Memory', vectorized: true },
            'existing2': { uid: 7, comment: '[002] - Another Memory', vectorized: true }
        }
    };
    
    const mergedData = { ...defaultSampleData, ...sampleData };
    
    try {
        return generateEntryTitle(titleFormat, mergedData, mockLorebookData);
    } catch (error) {
        return `Error: ${error.message}`;
    }
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
        const settings = extension_settings.STMemoryBooks || {};
        const titleFormat = settings.titleFormat || DEFAULT_TITLE_FORMATS[0];
        
        // Use safe string parsing to identify memory entries
        const memoryEntries = identifyMemoryEntries(lorebookData, titleFormat);
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