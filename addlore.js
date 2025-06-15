/**
 * Creates a regex pattern to match existing memories based on title format
 * @private
 * @param {string} titleFormat - The title format template
 * @returns {RegExp|null} Regex pattern to match existing memories, or null if pattern creation fails
 */
function createMemoryMatchPattern(titleFormat) {
    try {
        let pattern = titleFormat;

        // Define placeholders and their temporary markers and final regex patterns
        const placeholderMap = {
            '{{title}}':    { marker: '__TITLE__',    regex: '[^\\[\\]]+' },
            '{{scene}}':    { marker: '__SCENE__',    regex: 'Scene \\d+-\\d+' },
            '{{char}}':     { marker: '__CHAR__',     regex: '[^\\[\\]]+' },
            '{{user}}':     { marker: '__USER__',     regex: '[^\\[\\]]+' },
            '{{messages}}': { marker: '__MESSAGES__', regex: '\\d+' },
            '{{profile}}':  { marker: '__PROFILE__',  regex: '[^\\[\\]]+' },
            '{{date}}':     { marker: '__DATE__',     regex: '[^\\[\\]]+' },
            '{{time}}':     { marker: '__TIME__',     regex: '[^\\[\\]]+' },
        };

        // Step 1: Replace placeholders with temporary markers
        for (const [placeholder, { marker }] of Object.entries(placeholderMap)) {
            // Escape the placeholder for literal matching
            const escapedPlaceholder = placeholder.replace(/[{}]/g, '\\$&');
            pattern = pattern.replace(new RegExp(escapedPlaceholder, 'g'), marker);
        }

        // Step 2: Escape the entire string (user text + markers)
        pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Step 3: Replace escaped markers with regex patterns
        for (const { marker, regex } of Object.values(placeholderMap)) {
            // The marker is now escaped, so match the escaped version
            const escapedMarker = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            pattern = pattern.replace(new RegExp(escapedMarker, 'g'), regex);
        }

        // Step 4: Handle auto-numbering patterns  
        // After escaping, [000] becomes \\[000\\], so we match and replace that
        pattern = pattern.replace(/\\\\\\\[0+\\\\\\\]/g, '\\\\\\[(\\\\\\d+)\\\\\\]');

        // Create final regex with anchors
        const regex = new RegExp(`^${pattern}$`, 'i');

        console.log(`${MODULE_NAME}: Created memory match pattern: ${regex.source}`);
        return regex;
        
    } catch (error) {
        console.error(`${MODULE_NAME}: Error creating memory match pattern:`, error);
        return null;
    }
}