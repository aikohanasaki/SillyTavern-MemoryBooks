import { extension_settings } from '../../../extensions.js';
import { chat, chat_metadata, saveMetadata, getCurrentChatId, name1, name2 } from '../../../../script.js';
import { METADATA_KEY, world_names } from '../../../world-info.js';
import { getSceneMarkers, saveMetadataForCurrentContext, clearScene } from './sceneManager.js';
import { getCurrentMemoryBooksContext, showLorebookSelectionPopup, getEffectiveLorebookName } from './utils.js';
import { autoCreateLorebook } from './autocreate.js';
import { Popup, POPUP_TYPE, POPUP_RESULT } from '../../../popup.js';

const MODULE_NAME = 'STMemoryBooks-AutoSummary';

/**
 * Validates lorebook for auto-summary with user-friendly prompts
 */
async function validateLorebookForAutoSummary() {
    // First, try to get a lorebook without showing popups
    const settings = extension_settings.STMemoryBooks;
    let lorebookName;

    if (!settings.moduleSettings.manualModeEnabled) {
        // Automatic mode - use chat-bound lorebook
        lorebookName = chat_metadata?.[METADATA_KEY] || null;

        // Check if auto-create is enabled and no lorebook exists
        if (!lorebookName && settings?.moduleSettings?.autoCreateLorebook) {
            // Auto-create lorebook using template
            const template = settings.moduleSettings.lorebookNameTemplate || 'LTM - {{char}} - {{chat}}';
            const result = await autoCreateLorebook(template, 'auto-summary');

            if (result.success) {
                lorebookName = result.name;
            } else {
                return { valid: false, error: result.error };
            }
        }
    } else {
        // Manual mode - check if a lorebook is already selected
        const stmbData = getSceneMarkers() || {};
        lorebookName = stmbData.manualLorebook ?? null;

        // If no lorebook is selected, ask user what to do
        if (!lorebookName) {
            const popupContent = `
                <h4>Auto-Summary Ready</h4>
                <div class="world_entry_form_control">
                    <p>Auto-summary is enabled but there is no assigned lorebook for this chat.</p>
                    <p>Would you like to select a lorebook for memory storage, or postpone this auto-summary?</p>
                    <label for="stmb-postpone-messages">Postpone for how many messages?</label>
                    <select id="stmb-postpone-messages" class="text_pole">
                        <option value="10">10 messages</option>
                        <option value="20">20 messages</option>
                        <option value="30">30 messages</option>
                        <option value="40">40 messages</option>
                        <option value="50">50 messages</option>
                    </select>
                </div>
            `;

            const popup = new Popup(popupContent, POPUP_TYPE.TEXT, '', {
                okButton: 'Select Lorebook',
                cancelButton: 'Postpone'
            });
            const result = await popup.show();

            if (result === POPUP_RESULT.AFFIRMATIVE) {
                // User wants to select a lorebook
                const selectedLorebook = await showLorebookSelectionPopup();
                if (selectedLorebook) {
                    stmbData.manualLorebook = selectedLorebook;
                    saveMetadataForCurrentContext();
                    lorebookName = selectedLorebook;
                } else {
                    return { valid: false, error: 'No lorebook selected for auto-summary.' };
                }
            } else {
                // User wants to postpone
                const postponeSelect = popup.dlg.querySelector('#stmb-postpone-messages');
                const postponeMessages = parseInt(postponeSelect.value) || 20;
                const currentMessageCount = chat.length;

                // Set postpone flag
                stmbData.autoSummaryNextPromptAt = currentMessageCount + postponeMessages;
                saveMetadataForCurrentContext();

                console.log(`STMemoryBooks: Auto-summary postponed for ${postponeMessages} messages (until message ${stmbData.autoSummaryNextPromptAt})`);
                return { valid: false, error: `Auto-summary postponed for ${postponeMessages} messages.` };
            }
        }
    }

    // At this point we should have a lorebook name - validate it
    if (!lorebookName) {
        return { valid: false, error: 'No lorebook available for auto-summary.' };
    }

    if (!world_names || !world_names.includes(lorebookName)) {
        return { valid: false, error: `Selected lorebook "${lorebookName}" not found.` };
    }

    try {
        const { loadWorldInfo } = await import('../../../world-info.js');
        const lorebookData = await loadWorldInfo(lorebookName);
        return { valid: !!lorebookData, data: lorebookData, name: lorebookName };
    } catch (error) {
        return { valid: false, error: 'Failed to load the selected lorebook.' };
    }
}

/**
 * Check if auto-summary should trigger based on current message count and settings
 * @returns {Promise<void>}
 */
export async function checkAutoSummaryTrigger() {
    try {
        const settings = extension_settings.STMemoryBooks;
        if (!settings?.moduleSettings?.autoSummaryEnabled) {
            return;
        }

        const stmbData = getSceneMarkers() || {};
        const currentMessageCount = chat.length;
        const currentLastMessage = currentMessageCount - 1;
        const requiredInterval = settings.moduleSettings.autoSummaryInterval;
        const highestProcessed = stmbData.highestMemoryProcessed ?? null;

        console.log('=== STMemoryBooks Auto-Summary Debug ===');
        console.log('Auto-summary enabled:', settings.moduleSettings.autoSummaryEnabled);
        console.log('Current message count:', currentMessageCount);
        console.log('Current last message index:', currentLastMessage);
        console.log('Required interval:', requiredInterval);
        console.log('Highest processed:', highestProcessed);
        console.log('Scene markers:', { start: stmbData.sceneStart, end: stmbData.sceneEnd });

        // Check if we have existing scene markers (memory creation in progress)
        if (stmbData.sceneStart !== null || stmbData.sceneEnd !== null) {
            console.log('STMemoryBooks: Auto-summary skipped - scene markers already exist (memory creation in progress)');
            return;
        }

        // Calculate messages since last memory
        let messagesSinceLastMemory;
        if (highestProcessed === null) {
            // No previous memories processed - count from beginning
            messagesSinceLastMemory = currentMessageCount;
            console.log('STMemoryBooks: No previous memories found - counting from start');
        } else {
            // Count messages since the last processed memory
            messagesSinceLastMemory = currentLastMessage - highestProcessed;
            console.log(`STMemoryBooks: Messages since last memory (${highestProcessed}): ${messagesSinceLastMemory}`);
        }

        console.log(`STMemoryBooks: Auto-summary trigger check: ${messagesSinceLastMemory} >= ${requiredInterval}?`);

        if (messagesSinceLastMemory < requiredInterval) {
            console.log(`STMemoryBooks: Auto-summary not triggered - need ${requiredInterval - messagesSinceLastMemory} more messages`);
            return;
        }

        // Check if user has postponed auto-summary
        if (stmbData.autoSummaryNextPromptAt && currentMessageCount < stmbData.autoSummaryNextPromptAt) {
            console.log(`STMemoryBooks: Auto-summary postponed until message ${stmbData.autoSummaryNextPromptAt}`);
            return; // Still in postpone period
        }

        // Auto-summary will set new scene markers - no need to clear existing ones
        const lorebookValidation = await validateLorebookForAutoSummary();
        if (!lorebookValidation.valid) {
            console.log(`STMemoryBooks: Auto-summary blocked - lorebook validation failed: ${lorebookValidation.error}`);
            return; // No lorebook available or user cancelled
        }

        // Clear any postpone flag since we're proceeding with auto-summary
        if (stmbData.autoSummaryNextPromptAt) {
            delete stmbData.autoSummaryNextPromptAt;
            saveMetadataForCurrentContext();
            console.log('STMemoryBooks: Cleared auto-summary postpone flag');
        }

        // Calculate the scene range for auto-summary
        let sceneStart, sceneEnd;
        if (highestProcessed === null) {
            // First memory - include everything from start
            sceneStart = 0;
            sceneEnd = currentLastMessage;
        } else {
            // Start from the message after the last processed memory
            sceneStart = highestProcessed + 1;
            sceneEnd = currentLastMessage;
        }

        console.log(`STMemoryBooks: Auto-summary triggered - creating memory for range ${sceneStart}-${sceneEnd}`);

        // Set scene markers for the range we want to process
        stmbData.sceneStart = sceneStart;
        stmbData.sceneEnd = sceneEnd;
        saveMetadataForCurrentContext();

        // Use the existing memory creation system via slash command
        const { executeSlashCommands } = await import('../../../slash-commands.js');
        await executeSlashCommands('/creatememory');
    } catch (error) {
        console.error('STMemoryBooks: Error in auto-summary trigger check:', error);
    }
}

/**
 * Handle auto-summary for single character chats on message received
 * @returns {Promise<void>}
 */
export async function handleAutoSummaryMessageReceived() {
    try {
        const context = getCurrentMemoryBooksContext();

        // Only check auto-summary for single character chats on MESSAGE_RECEIVED
        // Group chats will be handled by GROUP_WRAPPER_FINISHED event
        if (!context.isGroupChat && extension_settings.STMemoryBooks.moduleSettings.autoSummaryEnabled) {
            const currentMessageCount = chat.length;
            console.log(`STMemoryBooks: Message received (single chat) - auto-summary enabled, current count: ${currentMessageCount}`);

            await checkAutoSummaryTrigger();
        } else if (context.isGroupChat) {
            console.log('STMemoryBooks: Message received in group chat - deferring to GROUP_WRAPPER_FINISHED');
        }
    } catch (error) {
        console.error('STMemoryBooks: Error in auto-summary message received handler:', error);
    }
}

/**
 * Handle auto-summary for group chats when all members have finished speaking
 * @returns {Promise<void>}
 */
export async function handleAutoSummaryGroupFinished() {
    try {
        if (extension_settings.STMemoryBooks.moduleSettings.autoSummaryEnabled) {
            const currentMessageCount = chat.length;
            console.log(`STMemoryBooks: Group conversation finished - auto-summary enabled, current count: ${currentMessageCount}`);

            // Check auto-summary trigger after all group members have finished speaking
            await checkAutoSummaryTrigger();
        }
    } catch (error) {
        console.error('STMemoryBooks: Error in auto-summary group finished handler:', error);
    }
}

/**
 * Clear auto-summary state after successful memory creation
 * @returns {void}
 */
export function clearAutoSummaryState() {
    if (extension_settings.STMemoryBooks?.moduleSettings?.autoSummaryEnabled) {
        clearScene();
        // RESET auto-summary count so it starts fresh from this point
        saveMetadataForCurrentContext('autoSummaryLastMessageCount', chat.length);
    }
}