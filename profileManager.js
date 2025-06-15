import { 
    saveSettingsDebounced,
    Popup, 
    POPUP_TYPE, 
    POPUP_RESULT
} from '../../../../script.js';
import { lodash, moment, Handlebars, DOMPurify } from '../../../../lib.js';
import { getCurrentModelSettings } from './index.js';
import { advancedOptionsTemplate } from './templates.js';
import { fetchPreviousSummaries, calculateTokensWithContext } from './confirmationPopup.js';
import { METADATA_KEY, loadWorldInfo } from '../../../world-info.js';
import { identifyMemoryEntries } from './addlore.js';

const MODULE_NAME = 'STMemoryBooks-ProfileManager';

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
 * Show advanced options popup for memory creation
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
        
        const result = await popup.show();
        
        // Set up event listeners after popup is shown
        setupAdvancedOptionsListeners(popup, sceneData, settings, selectedProfile, chat_metadata);
        
        // Handle different results
        if (result === POPUP_RESULT.AFFIRMATIVE) {
            // Extract settings from popup
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
                if (currentModelSettings.model) {
                    profileSettings.effectiveConnection.model = currentModelSettings.model;
                }
                if (typeof currentModelSettings.temperature === 'number') {
                    profileSettings.effectiveConnection.temperature = currentModelSettings.temperature;
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
        } else if (result === 'save_profile') {
            // Handle save profile button
            const newProfileName = popup.dlg.querySelector('#stmb-new-profile-name-advanced').value.trim();
            if (!newProfileName) {
                toastr.error('Please enter a profile name', 'STMemoryBooks');
                return { confirmed: false };
            }
            
            await saveNewProfileFromAdvancedSettings(popup.dlg, settings, newProfileName);
            toastr.success(`Profile "${newProfileName}" saved successfully`, 'STMemoryBooks');
            return { confirmed: false }; // Don't create memory, just save profile
        }
        
        return { confirmed: false };
    } catch (error) {
        console.error(`${MODULE_NAME}: Error showing advanced options popup:`, error);
        return { confirmed: false };
    }
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
        
        // Build new profile
        const newProfile = {
            name: profileName,
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
        
        console.log(`${MODULE_NAME}: Saved new profile "${profileName}" from advanced options`);
    } catch (error) {
        console.error(`${MODULE_NAME}: Error saving new profile from advanced settings:`, error);
        throw error;
    }
}

/**
 * Profile edit template
 */
const profileEditTemplate = Handlebars.compile(`
<div class="completion_prompt_manager_popup_entry">
    <div class="completion_prompt_manager_popup_entry_form_control">
        <label for="stmb-profile-name">Profile Name:</label>
        <input type="text" id="stmb-profile-name" value="{{name}}" class="text_pole" placeholder="Profile name">
    </div>
    
    <div class="completion_prompt_manager_popup_entry_form_control">
        <h5>Model & Temperature Settings:</h5>
        <small style="opacity: 0.7; margin-bottom: 10px; display: block;">These settings will temporarily override SillyTavern's current model and temperature during memory generation, then restore the original values.</small>
        
        <label for="stmb-profile-model">Model:</label>
        <input type="text" id="stmb-profile-model" value="{{connection.model}}" class="text_pole" placeholder="Leave blank to use current model">
        
        <label for="stmb-profile-temperature">Temperature (0.0 - 2.0):</label>
        <input type="number" id="stmb-profile-temperature" value="{{connection.temperature}}" class="text_pole" min="0" max="2" step="0.1" placeholder="Leave blank to use current temperature">
        
        <small style="opacity: 0.7;">Engine setting is for future use - currently uses SillyTavern's active API.</small>
        <label for="stmb-profile-engine">Engine (Future Use):</label>
        <select id="stmb-profile-engine" class="text_pole" disabled>
            <option value="openai" {{#if (eq connection.engine 'openai')}}selected{{/if}}>OpenAI</option>
            <option value="claude" {{#if (eq connection.engine 'claude')}}selected{{/if}}>Claude</option>
            <option value="custom" {{#if (eq connection.engine 'custom')}}selected{{/if}}>Custom</option>
        </select>
    </div>
    
    <div class="completion_prompt_manager_popup_entry_form_control">
        <label for="stmb-profile-prompt">Memory Creation Prompt:</label>
        <textarea id="stmb-profile-prompt" class="text_pole textarea_compact" rows="6" placeholder="Enter the prompt for memory creation">{{prompt}}</textarea>
        <small style="opacity: 0.7;">Or leave blank to use a built-in preset selected below.</small>
        
        <label for="stmb-profile-preset">Built-in Preset:</label>
        <select id="stmb-profile-preset" class="text_pole">
            <option value="">Custom Prompt (use text above)</option>
            <option value="summary" {{#if (eq preset 'summary')}}selected{{/if}}>Summary - Detailed beat-by-beat summaries</option>
            <option value="summarize" {{#if (eq preset 'summarize')}}selected{{/if}}>Summarize - Bullet-point format</option>
            <option value="synopsis" {{#if (eq preset 'synopsis')}}selected{{/if}}>Synopsis - Comprehensive with headings</option>
            <option value="sumup" {{#if (eq preset 'sumup')}}selected{{/if}}>Sum Up - Concise story beats</option>
            <option value="keywords" {{#if (eq preset 'keywords')}}selected{{/if}}>Keywords - Keywords only</option>
        </select>
    </div>
</div>
`);

/**
 * Edit an existing profile
 * @param {Object} settings - Extension settings
 * @param {Function} refreshCallback - Function to refresh UI after changes
 */
export async function editProfile(settings, refreshCallback) {
    const profileIndex = settings.defaultProfile;
    const profile = settings.profiles[profileIndex];
    
    if (!profile) {
        console.error(`${MODULE_NAME}: No profile found at index ${profileIndex}`);
        return;
    }
    
    const templateData = {
        name: profile.name,
        connection: profile.connection || { engine: 'openai', model: '', temperature: 0.7 },
        prompt: profile.prompt || '',
        preset: profile.preset || ''
    };
    
    const content = DOMPurify.sanitize(profileEditTemplate(templateData));
    
    try {
        const result = await new Popup(`<h3>Edit Profile</h3>${content}`, POPUP_TYPE.TEXT, '', {
            okButton: 'Save',
            cancelButton: 'Cancel',
            wide: true
        }).show();
        
        if (result === POPUP_RESULT.AFFIRMATIVE) {
            const popupElement = document.querySelector('.popup');
            const updatedProfile = {
                name: popupElement.querySelector('#stmb-profile-name')?.value || profile.name,
                connection: {
                    engine: popupElement.querySelector('#stmb-profile-engine')?.value || 'openai',
                    model: popupElement.querySelector('#stmb-profile-model')?.value || '',
                    temperature: parseFloat(popupElement.querySelector('#stmb-profile-temperature')?.value) || null
                },
                prompt: popupElement.querySelector('#stmb-profile-prompt')?.value || '',
                preset: popupElement.querySelector('#stmb-profile-preset')?.value || ''
            };
            
            // Clean up connection values - remove empty strings and null values
            if (!updatedProfile.connection.model) {
                delete updatedProfile.connection.model;
            }
            if (updatedProfile.connection.temperature === null || isNaN(updatedProfile.connection.temperature)) {
                delete updatedProfile.connection.temperature;
            }
            
            settings.profiles[profileIndex] = updatedProfile;
            saveSettingsDebounced();
            
            if (refreshCallback) refreshCallback();
            
            toastr.success('Profile updated successfully', 'STMemoryBooks');
            console.log(`${MODULE_NAME}: Updated profile "${updatedProfile.name}"`);
        }
    } catch (error) {
        console.error(`${MODULE_NAME}: Error editing profile:`, error);
        toastr.error('Failed to edit profile', 'STMemoryBooks');
    }
}

/**
 * Create a new profile
 * @param {Object} settings - Extension settings
 * @param {Function} refreshCallback - Function to refresh UI after changes
 */
export async function newProfile(settings, refreshCallback) {
    const templateData = {
        name: 'New Profile',
        connection: {
            engine: 'openai',
            model: '',
            temperature: 0.7
        },
        prompt: 'Create a concise memory from this chat scene. Focus on key plot points, character development, and important interactions.',
        preset: ''
    };
    
    const content = DOMPurify.sanitize(profileEditTemplate(templateData));
    
    try {
        const result = await new Popup(`<h3>New Profile</h3>${content}`, POPUP_TYPE.TEXT, '', {
            okButton: 'Create',
            cancelButton: 'Cancel',
            wide: true
        }).show();
        
        if (result === POPUP_RESULT.AFFIRMATIVE) {
            const popupElement = document.querySelector('.popup');
            const newProfileData = {
                name: popupElement.querySelector('#stmb-profile-name')?.value || 'New Profile',
                connection: {
                    engine: popupElement.querySelector('#stmb-profile-engine')?.value || 'openai',
                    model: popupElement.querySelector('#stmb-profile-model')?.value || '',
                    temperature: parseFloat(popupElement.querySelector('#stmb-profile-temperature')?.value) || null
                },
                prompt: popupElement.querySelector('#stmb-profile-prompt')?.value || templateData.prompt,
                preset: popupElement.querySelector('#stmb-profile-preset')?.value || ''
            };
            
            // Clean up connection values - remove empty strings and null values
            if (!newProfileData.connection.model) {
                delete newProfileData.connection.model;
            }
            if (newProfileData.connection.temperature === null || isNaN(newProfileData.connection.temperature)) {
                delete newProfileData.connection.temperature;
            }
            
            settings.profiles.push(newProfileData);
            saveSettingsDebounced();
            
            if (refreshCallback) refreshCallback();
            
            toastr.success('Profile created successfully', 'STMemoryBooks');
            console.log(`${MODULE_NAME}: Created new profile "${newProfileData.name}"`);
        }
    } catch (error) {
        console.error(`${MODULE_NAME}: Error creating profile:`, error);
        toastr.error('Failed to create profile', 'STMemoryBooks');
    }
}

/**
 * Delete an existing profile
 * @param {Object} settings - Extension settings
 * @param {Function} refreshCallback - Function to refresh UI after changes
 */
export async function deleteProfile(settings, refreshCallback) {
    if (settings.profiles.length <= 1) {
        toastr.error('Cannot delete the last profile', 'STMemoryBooks');
        return;
    }
    
    const profileIndex = settings.defaultProfile;
    const profile = settings.profiles[profileIndex];
    
    try {
        const result = await new Popup(`Delete profile "${profile.name}"?`, POPUP_TYPE.CONFIRM, '').show();
        
        if (result === POPUP_RESULT.AFFIRMATIVE) {
            const deletedName = profile.name;
            settings.profiles.splice(profileIndex, 1);
            
            // Adjust default profile index
            if (settings.defaultProfile >= settings.profiles.length) {
                settings.defaultProfile = settings.profiles.length - 1;
            }
            
            saveSettingsDebounced();
            
            if (refreshCallback) refreshCallback();
            
            toastr.success('Profile deleted successfully', 'STMemoryBooks');
            console.log(`${MODULE_NAME}: Deleted profile "${deletedName}"`);
        }
    } catch (error) {
        console.error(`${MODULE_NAME}: Error deleting profile:`, error);
        toastr.error('Failed to delete profile', 'STMemoryBooks');
    }
}

/**
 * Export profiles to JSON file
 * @param {Object} settings - Extension settings
 */
export function exportProfiles(settings) {
    try {
        const exportData = {
            profiles: settings.profiles,
            exportDate: moment().toISOString(),
            version: 1,
            moduleVersion: settings.migrationVersion || 1
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `stmemorybooks-profiles-${moment().format('YYYY-MM-DD')}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the object URL
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        
        toastr.success('Profiles exported successfully', 'STMemoryBooks');
        console.log(`${MODULE_NAME}: Exported ${settings.profiles.length} profiles`);
    } catch (error) {
        console.error(`${MODULE_NAME}: Error exporting profiles:`, error);
        toastr.error('Failed to export profiles', 'STMemoryBooks');
    }
}

/**
 * Import profiles from JSON file
 * @param {Event} event - File input change event
 * @param {Object} settings - Extension settings
 * @param {Function} refreshCallback - Function to refresh UI after changes
 */
export function importProfiles(event, settings, refreshCallback) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importData = JSON.parse(e.target.result);
            
            if (!importData.profiles || !Array.isArray(importData.profiles)) {
                throw new Error('Invalid profile data format - missing profiles array');
            }
            
            // Validate profile structure
            const validProfiles = importData.profiles.filter(profile => {
                return profile.name && typeof profile.name === 'string';
            });
            
            if (validProfiles.length === 0) {
                throw new Error('No valid profiles found in import file');
            }
            
            let importedCount = 0;
            let skippedCount = 0;
            
            // Merge profiles (avoid duplicates by name)
            validProfiles.forEach(importProfile => {
                const exists = settings.profiles.some(p => p.name === importProfile.name);
                if (!exists) {
                    // Ensure proper structure
                    const cleanProfile = {
                        name: importProfile.name,
                        connection: importProfile.connection || {},
                        prompt: importProfile.prompt || '',
                        preset: importProfile.preset || ''
                    };
                    
                    settings.profiles.push(cleanProfile);
                    importedCount++;
                } else {
                    skippedCount++;
                }
            });
            
            if (importedCount > 0) {
                saveSettingsDebounced();
                if (refreshCallback) refreshCallback();
                
                let message = `Imported ${importedCount} profile${importedCount === 1 ? '' : 's'}`;
                if (skippedCount > 0) {
                    message += ` (${skippedCount} duplicate${skippedCount === 1 ? '' : 's'} skipped)`;
                }
                
                toastr.success(message, 'STMemoryBooks');
                console.log(`${MODULE_NAME}: ${message}`);
            } else {
                toastr.warning('No new profiles imported - all profiles already exist', 'STMemoryBooks');
            }
            
        } catch (error) {
            console.error(`${MODULE_NAME}: Error importing profiles:`, error);
            toastr.error(`Failed to import profiles: ${error.message}`, 'STMemoryBooks');
        }
    };
    
    reader.onerror = function() {
        console.error(`${MODULE_NAME}: Error reading import file`);
        toastr.error('Failed to read import file', 'STMemoryBooks');
    };
    
    reader.readAsText(file);
    
    // Clear the file input
    event.target.value = '';
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

/**
 * Save new profile from current popup settings (legacy compatibility)
 * @param {Object} popup - The popup dialog element
 * @param {Object} settings - Extension settings
 * @param {string} profileName - Name for the new profile
 */
export async function saveNewProfileFromSettings(popup, settings, profileName) {
    try {
        const popupElement = popup.dlg;
        
        // Get current settings from popup
        const effectivePrompt = popupElement.querySelector('#stmb-effective-prompt')?.value || '';
        const overrideSettings = popupElement.querySelector('#stmb-override-settings')?.checked || false;
        
        // Build new profile
        const newProfile = {
            name: profileName,
            prompt: effectivePrompt,
            connection: {}
        };
        
        // If not overriding, use current profile's connection settings
        if (!overrideSettings) {
            const currentProfile = settings.profiles[settings.defaultProfile];
            if (currentProfile.connection) {
                newProfile.connection = { ...currentProfile.connection };
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
        
        console.log(`${MODULE_NAME}: Saved new profile "${profileName}"`);
        toastr.info(`Profile "${profileName}" saved successfully`, 'STMemoryBooks');
    } catch (error) {
        console.error(`${MODULE_NAME}: Error saving new profile:`, error);
        throw error;
    }
}

/**
 * Validate profile structure
 * @param {Object} profile - Profile to validate
 * @returns {boolean} Whether the profile is valid
 */
export function validateProfile(profile) {
    if (!profile || typeof profile !== 'object') {
        return false;
    }
    
    if (!profile.name || typeof profile.name !== 'string') {
        return false;
    }
    
    // Connection is optional but if present should be an object
    if (profile.connection && typeof profile.connection !== 'object') {
        return false;
    }
    
    return true;
}

/**
 * Clean up profile connection settings
 * @param {Object} connection - Connection settings to clean
 * @returns {Object} Cleaned connection settings
 */
export function cleanConnectionSettings(connection) {
    if (!connection || typeof connection !== 'object') {
        return {};
    }
    
    const cleaned = {};
    
    if (connection.engine && typeof connection.engine === 'string') {
        cleaned.engine = connection.engine;
    }
    
    if (connection.model && typeof connection.model === 'string' && connection.model.trim()) {
        cleaned.model = connection.model.trim();
    }
    
    if (typeof connection.temperature === 'number' && !isNaN(connection.temperature)) {
        cleaned.temperature = connection.temperature;
    }
    
    return cleaned;
}