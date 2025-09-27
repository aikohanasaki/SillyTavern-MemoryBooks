import { getCurrentChatId, name1, name2, chat_metadata, saveMetadata } from '../../../../script.js';
import { createNewWorldInfo, METADATA_KEY, world_names } from '../../../world-info.js';

const MODULE_NAME = 'STMemoryBooks-AutoCreate';

/**
 * Generate lorebook name from template with auto-numbering
 * @param {string} template - Template string with {{chat}}, {{char}}, {{user}} placeholders
 * @returns {string} Generated lorebook name with auto-numbering if needed
 */
export function generateLorebookName(template) {
    // Validate template - fallback to default if empty
    if (!template || template.trim() === '') {
        template = 'LTM - {{char}} - {{chat}}';
    }

    // Template substitutions
    const chatId = getCurrentChatId() || 'Unknown';
    const charName = name2 || 'Unknown';
    const userName = name1 || 'User';

    let name = template
        .replace(/\{\{chat\}\}/g, chatId)
        .replace(/\{\{char\}\}/g, charName)
        .replace(/\{\{user\}\}/g, userName);

    // Sanitize for filesystem - only block reserved characters, allow Unicode
    // Reserve 4 chars for potential " 999" suffix
    name = name.replace(/[\/\\:*?"<>|]/g, '_').replace(/_{2,}/g, '_').substring(0, 60);

    // Auto-numbering if name exists (with null safety)
    if (!world_names || !world_names.includes(name)) return name;

    for (let i = 2; i <= 999; i++) {
        const numberedName = `${name} ${i}`;
        if (!world_names.includes(numberedName)) return numberedName;
    }

    return `${name} ${Date.now()}`; // Fallback with timestamp
}

/**
 * Auto-create and bind a lorebook using the configured template
 * @param {string} template - Name template to use
 * @param {string} context - Context description for logging (e.g., 'chat', 'auto-summary')
 * @returns {Promise<{success: boolean, name?: string, error?: string}>}
 */
export async function autoCreateLorebook(template, context = 'chat') {
    try {
        const newLorebookName = generateLorebookName(template);

        console.log(`${MODULE_NAME}: Auto-creating lorebook "${newLorebookName}" for ${context}`);
        const created = await createNewWorldInfo(newLorebookName);

        if (created) {
            // Bind the new lorebook to the chat
            chat_metadata[METADATA_KEY] = newLorebookName;
            await saveMetadata();

            console.log(`${MODULE_NAME}: Successfully created and bound lorebook "${newLorebookName}"`);
            toastr.success(`Created and bound lorebook "${newLorebookName}"`, 'STMemoryBooks');

            return { success: true, name: newLorebookName };
        } else {
            console.error(`${MODULE_NAME}: Failed to create lorebook`);
            return { success: false, error: 'Failed to auto-create lorebook.' };
        }
    } catch (error) {
        console.error(`${MODULE_NAME}: Error creating lorebook:`, error);
        return { success: false, error: `Failed to auto-create lorebook: ${error.message}` };
    }
}