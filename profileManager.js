import { saveSettingsDebounced } from '../../../../script.js';
import { Popup, POPUP_TYPE, POPUP_RESULT } from '../../../scripts/popup.js';
import { moment, Handlebars, DOMPurify } from '../../../../lib.js';
import { getCurrentModelSettings } from './index.js';
import { 
    getEffectivePrompt, 
    validateProfile, 
    cleanConnectionSettings,
    generateSafeProfileName,
    parseTemperature,
    formatPresetDisplayName,
    getPresetNames
} from './utils.js';

const MODULE_NAME = 'STMemoryBooks-ProfileManager';

/**
 * Profile edit template - Updated to use SillyTavern's built-in classes
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
        
        <small class="opacity50p">Engine setting is for future use - currently uses SillyTavern's active API.</small>
        <label for="stmb-profile-engine">
            <h4>Engine (Future Use):</h4>
            <select id="stmb-profile-engine" class="text_pole" disabled>
                <option value="openai" {{#if (eq connection.engine 'openai')}}selected{{/if}}>OpenAI</option>
                <option value="claude" {{#if (eq connection.engine 'claude')}}selected{{/if}}>Claude</option>
                <option value="custom" {{#if (eq connection.engine 'custom')}}selected{{/if}}>Custom</option>
            </select>
        </label>
    </div>
    
    <div class="world_entry_form_control">
        <label for="stmb-profile-prompt">
            <h4>Memory Creation Prompt:</h4>
            <textarea id="stmb-profile-prompt" class="text_pole textarea_compact" rows="6" placeholder="Enter the prompt for memory creation">{{prompt}}</textarea>
            <h5>Or leave blank to use a built-in preset selected below.</h5>
        </label>
        
        <label for="stmb-profile-preset">
            <h4>Built-in Preset:</h4>
            <select id="stmb-profile-preset" class="text_pole">
                <option value="">Custom Prompt (use text above)</option>
                {{#each presetOptions}}
                <option value="{{value}}" {{#if selected}}selected{{/if}}>{{displayName}}</option>
                {{/each}}
            </select>
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
    
    const templateData = {
        name: profile.name,
        connection: profile.connection || { engine: 'openai', model: '', temperature: 0.7 },
        prompt: profile.prompt || '',
        preset: profile.preset || '',
        presetOptions: getPresetNames().map(presetName => ({
            value: presetName,
            displayName: formatPresetDisplayName(presetName),
            selected: presetName === profile.preset
        }))
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
            const updatedProfile = buildProfileFromForm(popupElement, profile.name);
            
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
    const existingNames = settings.profiles.map(p => p.name);
    const defaultName = generateSafeProfileName('New Profile', existingNames);
    
    const templateData = {
        name: defaultName,
        connection: {
            engine: 'openai',
            model: '',
            temperature: 0.7
        },
        prompt: '',
        preset: '',
        presetOptions: getPresetNames().map(presetName => ({
            value: presetName,
            displayName: formatPresetDisplayName(presetName),
            selected: false
        }))
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
            const newProfileData = buildProfileFromForm(popupElement, defaultName);
            
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
 * Build profile object from form data
 * @param {HTMLElement} popupElement - The popup form element
 * @param {string} fallbackName - Fallback name if form name is empty
 * @returns {Object} Profile object
 */
function buildProfileFromForm(popupElement, fallbackName) {
    const name = popupElement.querySelector('#stmb-profile-name')?.value.trim() || fallbackName;
    const model = popupElement.querySelector('#stmb-profile-model')?.value.trim() || '';
    const temperatureInput = popupElement.querySelector('#stmb-profile-temperature')?.value;
    const temperature = parseTemperature(temperatureInput);
    const engine = popupElement.querySelector('#stmb-profile-engine')?.value || 'openai';
    const prompt = popupElement.querySelector('#stmb-profile-prompt')?.value.trim() || '';
    const preset = popupElement.querySelector('#stmb-profile-preset')?.value || '';
    
    const profile = {
        name: name,
        connection: {
            engine: engine
        },
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
            connection: { engine: 'openai' },
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