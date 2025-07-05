// confirmationPopup.js - Consolidated popup management for memory creation flow
import { saveSettingsDebounced } from '../../../../script.js';
import { Popup, POPUP_TYPE, POPUP_RESULT } from '../../../popup.js';
import { DOMPurify, lodash } from '../../../../lib.js';
import { simpleConfirmationTemplate, keywordSelectionTemplate, advancedOptionsTemplate } from './templates.js';
import { METADATA_KEY, loadWorldInfo } from '../../../world-info.js';
import { identifyMemoryEntries } from './addlore.js';
import { getCurrentModelSettings, getEffectivePrompt, getPresetPrompt, generateSafeProfileName } from './utils.js';

const MODULE_NAME = 'STMemoryBooks-ConfirmationPopup';

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
            // Show advanced options popup (now handled in this module)
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
 * Show advanced options popup for memory creation
 * MOVED FROM profileManager.js to consolidate popup logic
 */
export async function showAdvancedOptionsPopup(sceneData, settings, selectedProfile, currentModelSettings, currentApiInfo, chat_metadata) {
    // Get available memories count
    const availableMemories = await getAvailableMemoriesCount(settings, chat_metadata);
    
    const effectivePrompt = getEffectivePrompt(selectedProfile);
    const profileModel = selectedProfile.connection?.model || 'Current SillyTavern model';
    const profileTemperature = selectedProfile.connection?.temperature !== undefined ? 
        selectedProfile.connection.temperature : 'Current SillyTavern temperature';
    
    const templateData = {
        ...sceneData,
        availableMemories: availableMemories,
        profiles: settings.profiles.map((profile, index) => ({
            ...profile,
            isDefault: index === settings.defaultProfile
        })),
        effectivePrompt: effectivePrompt,
        defaultMemoryCount: settings.moduleSettings.defaultMemoryCount || 0,
        profileModel: profileModel,
        profileTemperature: profileTemperature,
        currentModel: currentModelSettings.model || 'Unknown',
        currentTemperature: currentModelSettings.temperature || 0.7,
        currentApi: currentApiInfo.api || 'Unknown',
        suggestedProfileName: `${selectedProfile.name} - Modified`,
        tokenThreshold: settings.moduleSettings.tokenWarningThreshold || 30000,
        showWarning: sceneData.estimatedTokens > (settings.moduleSettings.tokenWarningThreshold || 30000)
    };
    
    const content = DOMPurify.sanitize(advancedOptionsTemplate(templateData));
    
    try {
        const popup = new Popup(`<h3>Advanced Memory Options</h3>${content}`, POPUP_TYPE.TEXT, '', {
            okButton: 'Create Memory',
            cancelButton: 'Cancel',
            wide: true,
            customButtons: [
                {
                    text: 'Save as New Profile',
                    result: 'save_profile',
                    classes: ['menu_button'],
                    action: null
                }
            ]
        });
        
        // Set up event listeners BEFORE popup is shown
        setupAdvancedOptionsListeners(popup, sceneData, settings, selectedProfile, chat_metadata);
        
        const result = await popup.show();
        
        // Handle different results
        if (result === POPUP_RESULT.AFFIRMATIVE) {
            return await handleAdvancedConfirmation(popup, settings);
        } else if (result === 'save_profile') {
            return await handleSaveNewProfile(popup, settings);
        }
        
        return { confirmed: false };
    } catch (error) {
        console.error(`${MODULE_NAME}: Error showing advanced options popup:`, error);
        return { confirmed: false };
    }
}

/**
 * Handle advanced options confirmation
 */
async function handleAdvancedConfirmation(popup, settings) {
    const popupElement = popup.dlg;
    const selectedProfileIndex = parseInt(popupElement.querySelector('#stmb-profile-select-advanced')?.value || settings.defaultProfile);
    const customPrompt = popupElement.querySelector('#stmb-effective-prompt-advanced')?.value;
    const memoryCount = parseInt(popupElement.querySelector('#stmb-context-memories-advanced')?.value || 0);
    const overrideSettings = popupElement.querySelector('#stmb-override-settings-advanced')?.checked || false;
    
    // Check if settings should be saved as new profile
    const shouldSaveProfile = popupElement.querySelector('#stmb-save-profile-section-advanced').style.display !== 'none';
    if (shouldSaveProfile) {
        const newProfileName = popupElement.querySelector('#stmb-new-profile-name-advanced').value.trim();
        if (newProfileName && await confirmSaveNewProfile(newProfileName)) {
            await saveNewProfileFromAdvancedSettings(popupElement, settings, newProfileName);
        }
    }
    
    // Build effective profile settings
    const baseProfile = settings.profiles[selectedProfileIndex];
    const profileSettings = {
        ...baseProfile,
        prompt: customPrompt || baseProfile.prompt,
        effectiveConnection: {}
    };
    
    // Determine effective connection settings
    if (overrideSettings) {
        const currentSettings = getCurrentModelSettings();
        if (currentSettings.model) {
            profileSettings.effectiveConnection.model = currentSettings.model;
        }
        if (typeof currentSettings.temperature === 'number') {
            profileSettings.effectiveConnection.temperature = currentSettings.temperature;
        }
    } else {
        profileSettings.effectiveConnection = { ...baseProfile.connection };
    }
    
    return {
        confirmed: true,
        profileSettings: profileSettings,
        advancedOptions: {
            memoryCount: memoryCount,
            overrideSettings: overrideSettings
        }
    };
}

/**
 * Handle saving new profile from advanced options
 */
async function handleSaveNewProfile(popup, settings) {
    const newProfileName = popup.dlg.querySelector('#stmb-new-profile-name-advanced').value.trim();
    if (!newProfileName) {
        toastr.error('Please enter a profile name', 'STMemoryBooks');
        return { confirmed: false };
    }
    
    await saveNewProfileFromAdvancedSettings(popup.dlg, settings, newProfileName);
    toastr.success(`Profile "${newProfileName}" saved successfully`, 'STMemoryBooks');
    return { confirmed: false }; // Don't create memory, just save profile
}

/**
 * Setup event listeners for advanced options popup
 */
function setupAdvancedOptionsListeners(popup, sceneData, settings, selectedProfile, chat_metadata) {
    const popupElement = popup.dlg;
    
    // Track original settings for comparison
    const originalSettings = {
        prompt: popupElement.querySelector('#stmb-effective-prompt-advanced').value,
        memoryCount: parseInt(popupElement.querySelector('#stmb-context-memories-advanced').value),
        overrideSettings: popupElement.querySelector('#stmb-override-settings-advanced').checked,
        profileIndex: parseInt(popupElement.querySelector('#stmb-profile-select-advanced').value)
    };
    
    // Function to check if settings have changed and show/hide save profile section
    const checkForChanges = () => {
        const currentPrompt = popupElement.querySelector('#stmb-effective-prompt-advanced').value;
        const currentMemoryCount = parseInt(popupElement.querySelector('#stmb-context-memories-advanced').value);
        const currentOverride = popupElement.querySelector('#stmb-override-settings-advanced').checked;
        const currentProfileIndex = parseInt(popupElement.querySelector('#stmb-profile-select-advanced').value);
        
        const hasChanges = currentPrompt !== originalSettings.prompt ||
                          currentMemoryCount !== originalSettings.memoryCount ||
                          currentOverride !== originalSettings.overrideSettings ||
                          currentProfileIndex !== originalSettings.profileIndex;
        
        const saveSection = popupElement.querySelector('#stmb-save-profile-section-advanced');
        if (hasChanges) {
            saveSection.style.display = 'block';
        } else {
            saveSection.style.display = 'none';
        }
    };
    
    // Add change listeners
    popupElement.querySelector('#stmb-effective-prompt-advanced')?.addEventListener('input', checkForChanges);
    popupElement.querySelector('#stmb-context-memories-advanced')?.addEventListener('change', checkForChanges);
    popupElement.querySelector('#stmb-override-settings-advanced')?.addEventListener('change', checkForChanges);
    popupElement.querySelector('#stmb-profile-select-advanced')?.addEventListener('change', (e) => {
        const newProfileIndex = parseInt(e.target.value);
        const newProfile = settings.profiles[newProfileIndex];
        
        // Update effective prompt
        const newEffectivePrompt = getEffectivePrompt(newProfile);
        popupElement.querySelector('#stmb-effective-prompt-advanced').value = newEffectivePrompt;
        
        // Update profile settings display
        const profileModelDisplay = popupElement.querySelector('#stmb-profile-model-display');
        const profileTempDisplay = popupElement.querySelector('#stmb-profile-temp-display');
        
        if (profileModelDisplay) {
            profileModelDisplay.textContent = newProfile.connection?.model || 'Current SillyTavern model';
        }
        if (profileTempDisplay) {
            profileTempDisplay.textContent = newProfile.connection?.temperature !== undefined ? 
                newProfile.connection.temperature : 'Current SillyTavern temperature';
        }
        
        // Update original settings for comparison
        originalSettings.prompt = newEffectivePrompt;
        originalSettings.profileIndex = newProfileIndex;
        checkForChanges();
    });
    
    // Enhanced token estimation with context memories
    setupTokenEstimation(popupElement, sceneData, settings, chat_metadata, checkForChanges);
}

/**
 * Setup token estimation functionality
 */
function setupTokenEstimation(popupElement, sceneData, settings, chat_metadata, checkForChanges) {
    const summaryCountSelect = popupElement.querySelector('#stmb-context-memories-advanced');
    const totalTokensDisplay = popupElement.querySelector('#stmb-total-tokens-display');
    const tokenWarning = popupElement.querySelector('#stmb-token-warning-advanced');
    const tokenThreshold = settings.moduleSettings.tokenWarningThreshold || 30000;
    
    if (summaryCountSelect && totalTokensDisplay) {
        let cachedMemories = {}; // Cache fetched memories
        
        const updateTokenEstimate = async () => {
            const memoryCount = parseInt(summaryCountSelect.value) || 0;
            
            if (memoryCount === 0) {
                totalTokensDisplay.textContent = `Total tokens: ${sceneData.estimatedTokens}`;
                if (tokenWarning) {
                    tokenWarning.style.display = sceneData.estimatedTokens > tokenThreshold ? 'block' : 'none';
                }
                return;
            }
            
            // Fetch actual memories for accurate token calculation
            if (!cachedMemories[memoryCount]) {
                totalTokensDisplay.textContent = `Total tokens: Calculating...`;
                
                const memoryFetchResult = await fetchPreviousSummaries(memoryCount, settings, chat_metadata);
                cachedMemories[memoryCount] = memoryFetchResult.summaries;
            }
            
            const memories = cachedMemories[memoryCount];
            const totalTokens = await calculateTokensWithContext(sceneData, memories);
            totalTokensDisplay.textContent = `Total tokens: ${totalTokens}`;
            
            // Update warning visibility
            if (tokenWarning) {
                if (totalTokens > tokenThreshold) {
                    tokenWarning.style.display = 'block';
                    tokenWarning.querySelector('span').textContent = 
                        `⚠️ Large scene (${totalTokens} tokens) may take some time to process.`;
                } else {
                    tokenWarning.style.display = 'none';
                }
            }
        };
        
        // Update on change
        summaryCountSelect.addEventListener('change', () => {
            updateTokenEstimate();
            checkForChanges();
        });
        
        // Initial update
        updateTokenEstimate();
    }
}

/**
 * Save new profile from advanced settings popup
 */
async function saveNewProfileFromAdvancedSettings(popupElement, settings, profileName) {
    try {
        // Get current settings from popup
        const effectivePrompt = popupElement.querySelector('#stmb-effective-prompt-advanced')?.value || '';
        const overrideSettings = popupElement.querySelector('#stmb-override-settings-advanced')?.checked || false;
        const selectedProfileIndex = parseInt(popupElement.querySelector('#stmb-profile-select-advanced')?.value || settings.defaultProfile);
        
        // Generate safe profile name
        const existingNames = settings.profiles.map(p => p.name);
        const safeName = generateSafeProfileName(profileName, existingNames);
        
        // Build new profile
        const newProfile = {
            name: safeName,
            prompt: effectivePrompt,
            connection: {}
        };        
        
        // If not overriding, use selected profile's connection settings
        if (!overrideSettings) {
            const baseProfile = settings.profiles[selectedProfileIndex];
            if (baseProfile.connection) {
                newProfile.connection = { ...baseProfile.connection };
            }
        } else {
            // Use current SillyTavern settings
            const currentSettings = getCurrentModelSettings();
            if (currentSettings.model) {
                newProfile.connection.model = currentSettings.model;
            }
            if (typeof currentSettings.temperature === 'number') {
                newProfile.connection.temperature = currentSettings.temperature;
            }
        }
        
        // Add to settings
        settings.profiles.push(newProfile);
        saveSettingsDebounced();
        
        console.log(`${MODULE_NAME}: Saved new profile "${safeName}" from advanced options`);
    } catch (error) {
        console.error(`${MODULE_NAME}: Error saving new profile from advanced settings:`, error);
        throw error;
    }
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
        
        // Attach event listeners synchronously before showing the popup
        setupKeywordSelectionEventListeners(popup, resolve);
        popup.show();
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
 * Get available memories count from lorebook
 */
async function getAvailableMemoriesCount(settings, chat_metadata) {
    try {
        const lorebookName = chat_metadata[METADATA_KEY];
        if (!lorebookName) {
            return 0;
        }
        
        const lorebookData = await loadWorldInfo(lorebookName);
        if (!lorebookData) {
            return 0;
        }
        
        const titleFormat = settings.titleFormat || '[000] - Auto Memory';
        
        // Use the identifyMemoryEntries function from addlore.js
        const memoryEntries = identifyMemoryEntries(lorebookData, titleFormat);
        
        return memoryEntries.length;
    } catch (error) {
        console.warn(`${MODULE_NAME}: Error getting available memories count:`, error);
        return 0;
    }
}

/**
 * Confirm saving new profile
 * @param {string} profileName - Name of the profile to save
 * @returns {Promise<boolean>} Whether the user confirmed
 */
export async function confirmSaveNewProfile(profileName) {
    try {
        const result = await new Popup(
            `Save current settings as new profile "${profileName}"?`,
            POPUP_TYPE.CONFIRM,
            ''
        ).show();
        return result === POPUP_RESULT.AFFIRMATIVE;
    } catch (error) {
        console.error(`${MODULE_NAME}: Error confirming save new profile:`, error);
        return false;
    }
}