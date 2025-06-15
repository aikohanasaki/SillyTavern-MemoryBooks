import { 
    Popup, 
    POPUP_TYPE, 
    POPUP_RESULT
} from '../../../../script.js';
import { DOMPurify } from '../../../../lib.js';
import { simpleConfirmationTemplate, keywordSelectionTemplate } from './templates.js';
import { showAdvancedOptionsPopup } from './profileManager.js';
import { METADATA_KEY, loadWorldInfo } from '../../../world-info.js';
import { identifyMemoryEntries } from './addlore.js';

const MODULE_NAME = 'STMemoryBooks-ConfirmationPopup';

/**
 * Get preset prompt based on preset name
 */
function getPresetPrompt(presetName) {
    const presets = {
        'summary': 'Create a detailed beat-by-beat summary of this chat scene. Include character actions, dialogue highlights, emotional beats, and story progression. Format as a comprehensive narrative summary.',
        'summarize': 'Summarize this chat scene in bullet-point format. Focus on:\n• Key events and actions\n• Important dialogue\n• Character development\n• Plot advancement',
        'synopsis': 'Create a comprehensive synopsis of this chat scene with clear headings:\n\n**Characters Present:** [list]\n**Setting/Location:** [describe]\n**Key Events:** [summarize]\n**Emotional Beats:** [highlight]\n**Story Impact:** [explain]',
        'sumup': 'Sum up this chat scene focusing on the essential story beats. Keep it concise but capture the core narrative progression, character moments, and any important plot developments.',
        'keywords': 'Extract only the most important keywords and phrases from this chat scene. Focus on: character names, locations, objects, actions, emotions, and plot-relevant terms. Return as a simple list.'
    };
    
    return presets[presetName] || 'Create a concise memory from this chat scene. Focus on key plot points, character development, and important interactions.';
}

/**
 * Get effective prompt from profile
 */
function getEffectivePrompt(profile) {
    if (profile.prompt) {
        return profile.prompt;
    } else if (profile.preset) {
        return getPresetPrompt(profile.preset);
    } else {
        return 'Create a concise memory from this chat scene. Focus on key plot points, character development, and important interactions.';
    }
}

/**
 * Show simplified confirmation popup for memory creation
 */
export async function showConfirmationPopup(sceneData, settings, currentModelSettings, currentApiInfo, chat_metadata) {
    const selectedProfile = settings.profiles[settings.defaultProfile];
    const effectivePrompt = getEffectivePrompt(selectedProfile);
    
    const templateData = {
        ...sceneData,
        profileName: selectedProfile.name,
        effectivePrompt: effectivePrompt,
        profileModel: selectedProfile.connection?.model || 'Current SillyTavern model',
        profileTemperature: selectedProfile.connection?.temperature !== undefined ? 
            selectedProfile.connection.temperature : 'Current SillyTavern temperature',
        currentModel: currentModelSettings.model || 'Unknown',
        currentTemperature: currentModelSettings.temperature || 0.7,
        currentApi: currentApiInfo.api || 'Unknown',
        tokenThreshold: settings.moduleSettings.tokenWarningThreshold || 30000,
        showWarning: sceneData.estimatedTokens > (settings.moduleSettings.tokenWarningThreshold || 30000)
    };
    
    const content = DOMPurify.sanitize(simpleConfirmationTemplate(templateData));
    
    try {
        const popup = new Popup(`<h3>Create Memory</h3>${content}`, POPUP_TYPE.TEXT, '', {
            okButton: 'Create Memory',
            cancelButton: 'Cancel',
            wide: false,
            customButtons: [
                {
                    text: 'Advanced Options...',
                    result: 'advanced',
                    classes: ['menu_button'],
                    action: null
                }
            ]
        });
        
        const result = await popup.show();
        
        if (result === POPUP_RESULT.AFFIRMATIVE) {
            return {
                confirmed: true,
                profileSettings: {
                    ...selectedProfile,
                    effectivePrompt: effectivePrompt
                },
                advancedOptions: {
                    memoryCount: settings.moduleSettings.defaultMemoryCount || 0,
                    overrideSettings: false
                }
            };
        } else if (result === 'advanced') {
            // Show advanced options popup
            const advancedResult = await showAdvancedOptionsPopup(
                sceneData, 
                settings, 
                selectedProfile, 
                currentModelSettings, 
                currentApiInfo, 
                chat_metadata
            );
            return advancedResult;
        }
        
        return { confirmed: false };
    } catch (error) {
        console.error(`${MODULE_NAME}: Error showing confirmation popup:`, error);
        return { confirmed: false };
    }
}

/**
 * Fetch previous summaries using the title format matching
 */
export async function fetchPreviousSummaries(count, settings, chat_metadata) {
    if (count <= 0) {
        return { summaries: [], actualCount: 0, requestedCount: 0 };
    }
    
    try {
        const lorebookName = chat_metadata[METADATA_KEY];
        if (!lorebookName) {
            return { summaries: [], actualCount: 0, requestedCount: count };
        }
        
        const lorebookData = await loadWorldInfo(lorebookName);
        if (!lorebookData) {
            return { summaries: [], actualCount: 0, requestedCount: count };
        }
        
        const titleFormat = settings.titleFormat || '[000] - Auto Memory';
        
        // Use the identifyMemoryEntries function from addlore.js
        const memoryEntries = identifyMemoryEntries(lorebookData, titleFormat);
        
        // Return the last N summaries (most recent ones)
        const recentSummaries = memoryEntries.slice(-count);
        const actualCount = recentSummaries.length;
        
        console.log(`${MODULE_NAME}: Requested ${count} summaries, found ${actualCount} available summaries using title format pattern`);
        
        return {
            summaries: recentSummaries.map(entry => ({
                number: entry.number,
                title: entry.title,
                content: entry.content,
                keywords: entry.keywords
            })),
            actualCount: actualCount,
            requestedCount: count
        };
        
    } catch (error) {
        console.error(`${MODULE_NAME}: Error fetching previous summaries:`, error);
        return { summaries: [], actualCount: 0, requestedCount: count };
    }
}

/**
 * Calculate actual token count including real context memories
 */
export async function calculateTokensWithContext(sceneData, memories) {
    let baseTokens = sceneData.estimatedTokens;
    
    if (memories && memories.length > 0) {
        // Calculate actual tokens from memory content
        let contextTokens = 200; // Headers and formatting overhead
        
        for (const memory of memories) {
            const memoryContent = memory.content || '';
            const memoryTokens = Math.ceil(memoryContent.length / 4); // Rough estimation
            contextTokens += memoryTokens;
        }
        
        console.log(`${MODULE_NAME}: Calculated ${contextTokens} actual tokens for ${memories.length} context memories`);
        return baseTokens + contextTokens;
    }
    
    return baseTokens;
}

/**
 * Show keyword selection popup when AI doesn't provide keywords
 */
export async function showKeywordSelectionPopup(preparedResult) {
    const templateData = {
        formattedContent: preparedResult.formattedContent,
        displayMetadata: preparedResult.displayMetadata
    };
    
    const content = DOMPurify.sanitize(keywordSelectionTemplate(templateData));
    
    return new Promise((resolve) => {
        const popup = new Popup(`<h3>🔤 Choose Keyword Generation Method</h3>${content}`, POPUP_TYPE.TEXT, '', {
            okButton: false,
            cancelButton: 'Cancel',
            wide: true,
            onClose: () => resolve(null)
        });
        
        popup.show().then(() => {
            setupKeywordSelectionEventListeners(popup, resolve);
        });
    });
}

/**
 * Setup event listeners for keyword selection popup
 */
function setupKeywordSelectionEventListeners(popup, resolve) {
    const popupElement = popup.dlg;
    
    // ST Generate button
    popupElement.querySelector('#stmb-keyword-st-generate')?.addEventListener('click', () => {
        popup.completeCancelled();
        resolve({ method: 'st-generate', userKeywords: [] });
    });
    
    // AI Keywords button  
    popupElement.querySelector('#stmb-keyword-ai-generate')?.addEventListener('click', () => {
        popup.completeCancelled();
        resolve({ method: 'ai-keywords', userKeywords: [] });
    });
    
    // Manual Entry button
    popupElement.querySelector('#stmb-keyword-user-input')?.addEventListener('click', () => {
        const manualSection = popupElement.querySelector('#stmb-manual-keywords-section');
        const textArea = popupElement.querySelector('#stmb-manual-keywords');
        
        if (manualSection.style.display === 'none') {
            // Show manual input section
            manualSection.style.display = 'block';
            textArea.focus();
            
            // Add confirm button for manual entry
            let confirmBtn = popupElement.querySelector('#stmb-manual-confirm');
            if (!confirmBtn) {
                confirmBtn = document.createElement('div');
                confirmBtn.id = 'stmb-manual-confirm';
                confirmBtn.className = 'menu_button';
                confirmBtn.innerHTML = '<i class="fa-solid fa-check"></i> Use These Keywords';
                confirmBtn.style.marginTop = '10px';
                
                confirmBtn.addEventListener('click', () => {
                    const keywordText = textArea.value.trim();
                    if (!keywordText) {
                        toastr.warning('Please enter at least one keyword', 'STMemoryBooks');
                        return;
                    }
                    
                    // Parse and validate keywords
                    const userKeywords = keywordText
                        .split(',')
                        .map(k => k.trim())
                        .filter(k => k.length > 0 && k.length <= 25)
                        .slice(0, 8);
                    
                    if (userKeywords.length === 0) {
                        toastr.warning('No valid keywords found. Keywords must be 1-25 characters each.', 'STMemoryBooks');
                        return;
                    }
                    
                    popup.completeCancelled();
                    resolve({ method: 'user-input', userKeywords: userKeywords });
                });
                
                manualSection.appendChild(confirmBtn);
            }
        }
    });
}