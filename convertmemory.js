// extensions/STMemoryBooks/js/convertmemory.js

import { Popup, POPUP_TYPE, POPUP_RESULT } from '../../../popup.js';
import { Handlebars, DOMPurify } from '../../../../lib.js';
import { loadWorldInfo, saveWorldInfo } from '../../../world-info.js';
import { extension_settings, saveSettingsDebounced } from '../../../extensions.js';
import { isMemoryEntry } from './addlore.js';

const MODULE_NAME = 'STMemoryBooks-Converter';

const converterTemplate = Handlebars.compile(`
    <div class="stmb-converter-popup">
        <div class="info-block warning marginBot10">
            <span><strong>Important:</strong> If you skip this conversion, older memory entries may not be detected properly by STMemoryBooks features.</span>
        </div>
        
        <p>Review the entries in your lorebook <b>"{{lorebookName}}"</b>. The system has pre-selected entries it detects as memories based on their title and format.</p>
        <p>Please correct any errors. Check the box for any entry that <strong>IS</strong> a memory, and uncheck it if it is <strong>NOT</strong>.</p>
        
        <div class="marginBot10">
            <div class="menu_button" id="stmb-select-all-detected">Select All Detected</div>
            <div class="menu_button" id="stmb-deselect-all">Deselect All</div>
            <span class="marginLeft10">{{detectedCount}} entries detected as memories</span>
        </div>
        
        <div class="stmb-entry-list" style="max-height: 400px; overflow-y: auto; border: 1px solid #444; padding: 10px; border-radius: 5px;">
            {{#each entries}}
                <div class="stmb-entry-row marginBot10" style="border-bottom: 1px solid #333; padding-bottom: 10px;">
                    <div class="flex alignItemsCenter marginBot5">
                        <label class="checkbox_label" style="margin-right: 10px;">
                            <input type="checkbox" class="stmb-convert-toggle" data-uid="{{uid}}" {{#if isMemory}}checked{{/if}}>
                            <span><strong>{{title}}</strong></span>
                        </label>
                        <span class="stmb-detected-badge {{#if wasDetected}}detected{{else}}not-detected{{/if}}" 
                              style="padding: 2px 6px; border-radius: 3px; font-size: 0.8em; {{#if wasDetected}}background: #4CAF50; color: white;{{else}}background: #666; color: #ccc;{{/if}}">
                            {{#if wasDetected}}Detected{{else}}Not Detected{{/if}}
                        </span>
                    </div>
                    <div class="stmb-entry-preview" style="font-size: 0.9em; color: #aaa; padding-left: 20px; max-height: 60px; overflow: hidden;">
                        {{preview}}
                    </div>
                </div>
            {{/each}}
        </div>
        
        <div class="marginTop10">
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-dont-ask-again">
                <span>Don't ask again for this lorebook</span>
            </label>
        </div>
    </div>
`);

/**
 * Show the memory conversion utility popup
 * @param {string} lorebookName - Name of the lorebook to convert
 * @returns {Promise<boolean>} Whether conversion was completed
 */
export async function showConverterPopup(lorebookName) {
    console.log(`${MODULE_NAME}: Starting conversion process for "${lorebookName}"`);
    
    try {
        const lorebookData = await loadWorldInfo(lorebookName);

        if (!lorebookData || !lorebookData.entries) {
            toastr.error(`Could not load lorebook: ${lorebookName}`, 'STMemoryBooks');
            return false;
        }

        const settings = extension_settings.STMemoryBooks || {};
        const titleFormat = settings.titleFormat || '[000] - Auto Memory';

        // Prepare entry view models with detection and preview
        const entryViewModels = Object.values(lorebookData.entries).map(entry => {
            const detected = isMemoryEntry(entry);
            const preview = getEntryPreview(entry);
            
            return {
                uid: entry.uid,
                title: entry.comment || `Entry #${entry.uid}`,
                preview: preview,
                isMemory: detected,
                wasDetected: detected,
            };
        }).sort((a, b) => a.title.localeCompare(b.title));

        const detectedCount = entryViewModels.filter(e => e.wasDetected).length;

        // Track final states
        const finalStates = new Map(entryViewModels.map(e => [e.uid, e.isMemory]));

        const popupContent = DOMPurify.sanitize(converterTemplate({
            lorebookName: lorebookName,
            entries: entryViewModels,
            detectedCount: detectedCount
        }));

        const popup = new Popup(`🔧 Convert Lorebook: ${lorebookName}`, POPUP_TYPE.TEXT, popupContent, {
            okButton: 'Save & Convert',
            cancelButton: 'Skip Conversion',
            wide: true,
            large: true,
            allowVerticalScrolling: true,
        });

        // Set up event listeners for the popup
        setupConverterEventListeners(popup, finalStates, entryViewModels);

        const result = await popup.show();

        // Handle "don't ask again" setting
        const dontAskAgain = popup.dlg.querySelector('#stmb-dont-ask-again')?.checked || false;
        if (dontAskAgain) {
            await saveDontAskAgainSetting(lorebookName);
        }

        if (result === POPUP_RESULT.AFFIRMATIVE) {
            return await performConversion(lorebookName, lorebookData, finalStates);
        }

        console.log(`${MODULE_NAME}: User skipped conversion for "${lorebookName}"`);
        return false;

    } catch (error) {
        console.error(`${MODULE_NAME}: Error in conversion process:`, error);
        toastr.error(`Conversion failed: ${error.message}`, 'STMemoryBooks');
        return false;
    }
}

/**
 * Set up event listeners for the converter popup
 * @private
 */
function setupConverterEventListeners(popup, finalStates, entryViewModels) {
    const popupElement = popup.dlg;

    // Individual checkbox changes
    $(popupElement).on('change', 'input.stmb-convert-toggle', function() {
        const uid = parseInt($(this).data('uid'));
        const isChecked = $(this).is(':checked');
        finalStates.set(uid, isChecked);
    });

    // Select all detected button
    $(popupElement).on('click', '#stmb-select-all-detected', function() {
        entryViewModels.forEach(entry => {
            if (entry.wasDetected) {
                const checkbox = popupElement.querySelector(`input[data-uid="${entry.uid}"]`);
                if (checkbox) {
                    checkbox.checked = true;
                    finalStates.set(entry.uid, true);
                }
            }
        });
    });

    // Deselect all button
    $(popupElement).on('click', '#stmb-deselect-all', function() {
        entryViewModels.forEach(entry => {
            const checkbox = popupElement.querySelector(`input[data-uid="${entry.uid}"]`);
            if (checkbox) {
                checkbox.checked = false;
                finalStates.set(entry.uid, false);
            }
        });
    });
}

/**
 * Perform the actual conversion with backup and error handling
 * @private
 */
async function performConversion(lorebookName, lorebookData, finalStates) {
    toastr.info('Creating backup and converting entries...', 'STMemoryBooks');
    
    try {
        // Create backup
        const backup = JSON.parse(JSON.stringify(lorebookData));
        console.log(`${MODULE_NAME}: Created backup for "${lorebookName}"`);

        let changes = 0;
        let errors = [];

        // Apply changes
        for (const [uid, isMemory] of finalStates) {
            try {
                if (lorebookData.entries[uid]) {
                    const hadFlag = lorebookData.entries[uid].stmemorybooks === true;
                    
                    if (isMemory && !hadFlag) {
                        lorebookData.entries[uid].stmemorybooks = true;
                        changes++;
                    } else if (!isMemory && hadFlag) {
                        delete lorebookData.entries[uid].stmemorybooks;
                        changes++;
                    }
                }
            } catch (error) {
                errors.push(`Entry ${uid}: ${error.message}`);
            }
        }

        // Save the modified lorebook
        await saveWorldInfo(lorebookName, lorebookData, true);
        
        // If we got here, save was successful - no need to keep backup
        console.log(`${MODULE_NAME}: Conversion completed successfully, backup can be discarded`);

        // Report results
        if (errors.length > 0) {
            console.warn(`${MODULE_NAME}: Some entries had errors during conversion:`, errors);
            toastr.warning(`Conversion completed with ${errors.length} errors. Check console for details.`, 'STMemoryBooks');
        }

        toastr.success(`Conversion complete! ${changes} entries updated in "${lorebookName}".`, 'STMemoryBooks');
        return true;

    } catch (error) {
        console.error(`${MODULE_NAME}: Error during conversion, attempting to restore backup:`, error);
        
        // Try to restore backup
        try {
            await saveWorldInfo(lorebookName, backup, true);
            toastr.error(`Conversion failed, backup restored: ${error.message}`, 'STMemoryBooks');
        } catch (restoreError) {
            console.error(`${MODULE_NAME}: Failed to restore backup:`, restoreError);
            toastr.error(`Conversion failed AND backup restore failed! Check your lorebook manually.`, 'STMemoryBooks');
        }
        
        return false;
    }
}

/**
 * Get a preview of entry content
 * @private
 */
function getEntryPreview(entry) {
    const content = entry.content || '';
    if (content.length === 0) {
        return '(No content)';
    }
    
    // Clean content for preview
    const cleaned = content.replace(/\s+/g, ' ').trim();
    const maxLength = 100;
    
    if (cleaned.length <= maxLength) {
        return cleaned;
    }
    
    return cleaned.substring(0, maxLength - 3) + '...';
}

/**
 * Save "don't ask again" setting for a specific lorebook
 * @private
 */
async function saveDontAskAgainSetting(lorebookName) {
    try {
        const settings = extension_settings.STMemoryBooks || {};
        
        if (!settings.convertDontAskAgain) {
            settings.convertDontAskAgain = {};
        }
        
        settings.convertDontAskAgain[lorebookName] = true;
        saveSettingsDebounced();
        
        console.log(`${MODULE_NAME}: Saved "don't ask again" setting for "${lorebookName}"`);
    } catch (error) {
        console.error(`${MODULE_NAME}: Error saving don't ask again setting:`, error);
    }
}

/**
 * Check if user has disabled conversion prompts for a specific lorebook
 * @param {string} lorebookName - Name of the lorebook to check
 * @returns {boolean} Whether to skip prompting for this lorebook
 */
export function shouldSkipConversionPrompt(lorebookName) {
    const settings = extension_settings.STMemoryBooks || {};
    return settings.convertDontAskAgain?.[lorebookName] === true;
}