import { saveSettingsDebounced } from '../../../../script.js';
import { Popup, POPUP_TYPE, POPUP_RESULT } from '../../../popup.js';
import { moment, Handlebars, DOMPurify } from '../../../../lib.js';
import { 
    getEffectivePrompt, 
    validateProfile, 
    cleanConnectionSettings,
    generateSafeProfileName,
    parseTemperature,
    formatPresetDisplayName,
    getPresetNames,
    getAvailableModels,
    isCustomModel,
    getCurrentApiInfo  // Fixed: Added missing import
} from './utils.js';

const MODULE_NAME = 'STMemoryBooks-ProfileManager';

/**
 * Profile edit template - Updated to remove engine field and use SillyTavern's built-in classes
 */
const profileEditTemplate = Handlebars.compile(`
<div class="popup-content">
    <div class="world_entry_form_control">
        <label for="stmb-profile-name">
            <h4>Profile Name:</h4>
            <input type="text" id="stmb-profile-name" value="{{name}}" class="text_pole" placeholder="Profile name">
        </label>
    </div>
    
    <div class="world_entry_form_control">
        <h5>Model & Temperature Settings:</h5>
        <div class="info-block hint marginBot10">
            These settings will temporarily override SillyTavern's current model and temperature during memory generation, then restore the original values.
        </div>
        
        <label for="stmb-profile-model">
            <h4>Model:</h4>
            <input type="text" id="stmb-profile-model" value="{{connection.model}}" class="text_pole" placeholder="Leave blank to use current model">
        </label>
        
        <label for="stmb-profile-temperature">
            <h4>Temperature (0.0 - 2.0):</h4>
            <input type="number" id="stmb-profile-temperature" value="{{connection.temperature}}" class="text_pole" min="0" max="2" step="0.1" placeholder="Leave blank to use current temperature">
        </label>
    </div>
    
    <div class="world_entry_form_control">
        <label for="stmb-profile-preset">
            <h4>Memory Creation Method:</h4>
            <select id="stmb-profile-preset" class="text_pole">
                {{#each presetOptions}}
                <option value="{{value}}" {{#if selected}}selected{{/if}}>{{displayName}}</option>
                {{/each}}
                <option value="" {{#unless preset}}selected{{/unless}}>Custom Prompt...</option>
            </select>
            <h5>Choose a built-in preset or create a custom prompt.</h5>
        </label>
        
        <label for="stmb-profile-prompt" id="stmb-custom-prompt-section" class="{{#if preset}}displayNone{{/if}}">
            <h4>Custom Memory Creation Prompt:</h4>
            <textarea id="stmb-profile-prompt" class="text_pole textarea_compact" rows="6" placeholder="Enter your custom prompt for memory creation">{{prompt}}</textarea>
            <h5>This prompt will be used to generate memories from chat scenes.</h5>
        </label>
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
    
    try {
        // Get available models and API info
        const availableModels = getAvailableModels();
        const apiInfo = getCurrentApiInfo();
        const connection = profile.connection || { temperature: 0.7 };
        
        // Determine if current model is custom and prepare values
        const isCustom = connection.model ? isCustomModel(connection.model, availableModels) : false;
        const showCustomInput = isCustom || availableModels.length === 0;
        const customModelValue = isCustom ? connection.model : '';
        
        const templateData = {
            name: profile.name,
            connection: connection,
            prompt: profile.prompt || '',
            preset: profile.preset || '',
            availableModels: availableModels,
            currentApi: apiInfo.api || 'Unknown',
            isCustomModel: isCustom,
            showCustomInput: showCustomInput,
            customModelValue: customModelValue,
            presetOptions: getPresetNames().map(presetName => ({
                value: presetName,
                displayName: formatPresetDisplayName(presetName),
                selected: presetName === profile.preset
            }))
        };
        
        const content = DOMPurify.sanitize(profileEditTemplate(templateData));
        
        const popupInstance = new Popup(`<h3>Edit Profile</h3>${content}`, POPUP_TYPE.TEXT, '', {
            okButton: 'Save',
            cancelButton: 'Cancel',
            wide: true
        });
        
        // Add event handling for the popup
        setupProfileEditEventHandlers(popupInstance);
        
        const result = await popupInstance.show();
        
        if (result === POPUP_RESULT.AFFIRMATIVE) {
            const updatedProfile = buildProfileFromForm(popupInstance.dlg, profile.name);
            
            // Validate the updated profile
            if (!validateProfile(updatedProfile)) {
                toastr.error('Invalid profile data', 'STMemoryBooks');
                return;
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
    try {
        const existingNames = settings.profiles.map(p => p.name);
        const defaultName = generateSafeProfileName('New Profile', existingNames);
        
        // Get available models and API info
        const availableModels = getAvailableModels();
        const apiInfo = getCurrentApiInfo();
        
        const templateData = {
            name: defaultName,
            connection: { temperature: 0.7 },
            prompt: '',
            preset: '',
            availableModels: availableModels,
            currentApi: apiInfo.api || 'Unknown',
            isCustomModel: false,
            showCustomInput: availableModels.length === 0, // Show custom input if no models detected
            customModelValue: '',
            presetOptions: getPresetNames().map(presetName => ({
                value: presetName,
                displayName: formatPresetDisplayName(presetName),
                selected: false
            }))
        };
        
        const content = DOMPurify.sanitize(profileEditTemplate(templateData));
        
        const popupInstance = new Popup(`<h3>New Profile</h3>${content}`, POPUP_TYPE.TEXT, '', {
            okButton: 'Create',
            cancelButton: 'Cancel',
            wide: true
        });
        
        // Add event handling for the popup
        setupProfileEditEventHandlers(popupInstance);
        
        const result = await popupInstance.show();
        
        if (result === POPUP_RESULT.AFFIRMATIVE) {
            const newProfileData = buildProfileFromForm(popupInstance.dlg, defaultName);
            
            // Ensure unique name
            const finalName = generateSafeProfileName(newProfileData.name, existingNames);
            newProfileData.name = finalName;
            
            // Validate the new profile
            if (!validateProfile(newProfileData)) {
                toastr.error('Invalid profile data', 'STMemoryBooks');
                return;
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
            
            // Validate and clean profile structure
            const validProfiles = importData.profiles
                .filter(profile => validateProfile(profile))
                .map(profile => cleanProfile(profile));
            
            if (validProfiles.length === 0) {
                throw new Error('No valid profiles found in import file');
            }
            
            let importedCount = 0;
            let skippedCount = 0;
            const existingNames = settings.profiles.map(p => p.name);
            
            // Merge profiles (avoid duplicates by name)
            validProfiles.forEach(importProfile => {
                const exists = existingNames.includes(importProfile.name);
                if (!exists) {
                    // Ensure unique name and clean structure
                    const finalName = generateSafeProfileName(importProfile.name, existingNames);
                    importProfile.name = finalName;
                    existingNames.push(finalName);
                    
                    settings.profiles.push(importProfile);
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
 * Setup event handlers for profile edit popup
 * Fixed: Implemented the missing function
 * @param {Popup} popupInstance - The popup instance to attach handlers to
 */
function setupProfileEditEventHandlers(popupInstance) {
    const popupElement = popupInstance.dlg;
    
    // Preset selection handler - show/hide custom prompt section
    popupElement.querySelector('#stmb-profile-preset')?.addEventListener('change', (e) => {
        const customPromptSection = popupElement.querySelector('#stmb-custom-prompt-section');
        const promptTextarea = popupElement.querySelector('#stmb-profile-prompt');
        
        if (e.target.value === '') {
            // Show custom prompt section
            customPromptSection.classList.remove('displayNone');
            promptTextarea.focus();
        } else {
            // Hide custom prompt section
            customPromptSection.classList.add('displayNone');
        }
    });
    
    // Temperature input validation
    popupElement.querySelector('#stmb-profile-temperature')?.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) {
            // Clamp temperature to valid range
            if (value < 0) e.target.value = 0;
            if (value > 2) e.target.value = 2;
        }
    });
    
    // Model input validation (basic sanitization)
    popupElement.querySelector('#stmb-profile-model')?.addEventListener('input', (e) => {
        // Remove potentially problematic characters
        e.target.value = e.target.value.replace(/[<>]/g, '');
    });
    
    console.log(`${MODULE_NAME}: Profile edit event handlers attached`);
}

/**
 * Build profile object from form data
 * Fixed: Removed engine handling
 * @param {HTMLElement} popupElement - The popup form element
 * @param {string} fallbackName - Fallback name if form name is empty
 * @returns {Object} Profile object
 */
function buildProfileFromForm(popupElement, fallbackName) {
    const name = popupElement.querySelector('#stmb-profile-name')?.value.trim() || fallbackName;
    const model = popupElement.querySelector('#stmb-profile-model')?.value.trim() || '';
    const temperatureInput = popupElement.querySelector('#stmb-profile-temperature')?.value;
    const temperature = parseTemperature(temperatureInput);
    const prompt = popupElement.querySelector('#stmb-profile-prompt')?.value.trim() || '';
    const preset = popupElement.querySelector('#stmb-profile-preset')?.value || '';
    
    const profile = {
        name: name,
        connection: {},  // Fixed: Removed engine field
        prompt: prompt,
        preset: preset
    };
    
    // Only include non-empty model
    if (model) {
        profile.connection.model = model;
    }
    
    // Only include valid temperature
    if (temperature !== null) {
        profile.connection.temperature = temperature;
    }
    
    return profile;
}

/**
 * Clean and normalize profile structure
 * Fixed: Removed engine handling
 * @param {Object} profile - Profile to clean
 * @returns {Object} Cleaned profile
 */
function cleanProfile(profile) {
    const cleaned = {
        name: profile.name || 'Unnamed Profile',
        connection: cleanConnectionSettings(profile.connection || {}),
        prompt: profile.prompt || '',
        preset: profile.preset || ''
    };
    
    // Ensure we don't have both prompt and preset
    if (cleaned.prompt && cleaned.preset) {
        // Prefer custom prompt over preset
        cleaned.preset = '';
    }
    
    return cleaned;
}

/**
 * Duplicate an existing profile
 * @param {Object} settings - Extension settings
 * @param {number} profileIndex - Index of profile to duplicate
 * @param {Function} refreshCallback - Function to refresh UI after changes
 */
export async function duplicateProfile(settings, profileIndex, refreshCallback) {
    if (profileIndex < 0 || profileIndex >= settings.profiles.length) {
        toastr.error('Invalid profile index', 'STMemoryBooks');
        return;
    }
    
    try {
        const originalProfile = settings.profiles[profileIndex];
        const existingNames = settings.profiles.map(p => p.name);
        const newName = generateSafeProfileName(`${originalProfile.name} - Copy`, existingNames);
        
        const duplicatedProfile = {
            ...originalProfile,
            name: newName
        };
        
        // Deep clone connection settings
        if (originalProfile.connection) {
            duplicatedProfile.connection = { ...originalProfile.connection };
        }
        
        settings.profiles.push(duplicatedProfile);
        saveSettingsDebounced();
        
        if (refreshCallback) refreshCallback();
        
        toastr.success(`Profile "${newName}" created as copy`, 'STMemoryBooks');
        console.log(`${MODULE_NAME}: Duplicated profile "${originalProfile.name}" as "${newName}"`);
    } catch (error) {
        console.error(`${MODULE_NAME}: Error duplicating profile:`, error);
        toastr.error('Failed to duplicate profile', 'STMemoryBooks');
    }
}

/**
 * Get profile summary for display
 * @param {Object} profile - Profile object
 * @returns {Object} Profile summary
 */
export function getProfileSummary(profile) {
    const effectivePrompt = getEffectivePrompt(profile);
    const hasCustomSettings = !!(profile.connection?.model || profile.connection?.temperature !== undefined);
    
    return {
        name: profile.name,
        hasCustomPrompt: !!(profile.prompt && profile.prompt.trim()),
        hasPreset: !!(profile.preset),
        presetName: profile.preset ? formatPresetDisplayName(profile.preset) : null,
        hasCustomSettings: hasCustomSettings,
        model: profile.connection?.model || null,
        temperature: profile.connection?.temperature,
        promptPreview: effectivePrompt.length > 100 ? 
            effectivePrompt.substring(0, 97) + '...' : 
            effectivePrompt
    };
}

/**
 * Validate all profiles in settings and fix issues
 * @param {Object} settings - Extension settings
 * @returns {Object} Validation result with any fixes applied
 */
export function validateAndFixProfiles(settings) {
    const issues = [];
    const fixes = [];
    
    if (!settings.profiles || !Array.isArray(settings.profiles)) {
        settings.profiles = [];
        fixes.push('Created empty profiles array');
    }
    
    if (settings.profiles.length === 0) {
        // Add default profile
        settings.profiles.push({
            name: 'Default',
            connection: {},  // Fixed: Removed engine field
            prompt: '',
            preset: 'summary'
        });
        fixes.push('Added default profile');
    }
    
    // Validate each profile
    settings.profiles.forEach((profile, index) => {
        if (!validateProfile(profile)) {
            issues.push(`Profile ${index} is invalid`);
            // Try to fix common issues
            if (!profile.name) {
                profile.name = `Profile ${index + 1}`;
                fixes.push(`Fixed missing name for profile ${index}`);
            }
            if (!profile.connection) {
                profile.connection = {};
                fixes.push(`Fixed missing connection for profile ${index}`);
            }
        }
    });
    
    // Check default profile index
    if (settings.defaultProfile >= settings.profiles.length) {
        settings.defaultProfile = 0;
        fixes.push('Fixed invalid default profile index');
    }
    
    return {
        valid: issues.length === 0,
        issues: issues,
        fixes: fixes,
        profileCount: settings.profiles.length
    };
}