
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
    getCurrentApiInfo
} from './utils.js';
// ADDED: Import to get default title formats for the UI
import { getDefaultTitleFormats } from './addlore.js'; 

const MODULE_NAME = 'STMemoryBooks-ProfileManager';

/**
 * MODIFIED: Profile edit template updated to include title format controls
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

    <div class="world_entry_form_control">
        <h5>Memory Title Format:</h5>
        <select id="stmb-profile-title-format-select" class="text_pole">
            {{#each titleFormats}}
            <option value="{{value}}" {{#if isSelected}}selected{{/if}}>{{value}}</option>
            {{/each}}
            <option value="custom">Custom Title Format...</option>
        </select>
        <input type="text" id="stmb-profile-custom-title-format" class="text_pole marginTop5 {{#unless showCustomTitleInput}}displayNone{{/unless}}" 
            placeholder="Enter custom format" value="{{titleFormat}}">
        <small class="opacity50p">Use [0], [00], etc. for numbering. Available: \\{{title}}, \\{{scene}}, \\{{char}}, \\{{user}}, \\{{messages}}, \\{{profile}}, \\{{date}}, \\{{time}}</small>
    </div>
</div>
`);

/**
 * MODIFIED: Edit an existing profile
 */
export async function editProfile(settings, refreshCallback) {
    const profileIndex = settings.defaultProfile;
    const profile = settings.profiles[profileIndex];
    
    if (!profile) {
        console.error(`${MODULE_NAME}: No profile found at index ${profileIndex}`);
        return;
    }
    
    try {
        const availableModels = getAvailableModels();
        const apiInfo = getCurrentApiInfo();
        const connection = profile.connection || { temperature: 0.7 };
        
        const isCustom = connection.model ? isCustomModel(connection.model, availableModels) : false;
        const showCustomInput = isCustom || availableModels.length === 0;
        const customModelValue = isCustom ? connection.model : '';
        
        // ADDED: Logic to handle title format for the template
        const profileTitleFormat = profile.titleFormat || settings.titleFormat || '[000] - {{title}}';
        const allTitleFormats = getDefaultTitleFormats();

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
            })),
            // ADDED: Pass title format data to the template
            titleFormat: profileTitleFormat,
            titleFormats: allTitleFormats.map(format => ({
                value: format,
                isSelected: format === profileTitleFormat
            })),
            showCustomTitleInput: !allTitleFormats.includes(profileTitleFormat)
        };
        
        const content = DOMPurify.sanitize(profileEditTemplate(templateData));
        
        const popupInstance = new Popup(`<h3>Edit Profile</h3>${content}`, POPUP_TYPE.TEXT, '', {
            okButton: 'Save',
            cancelButton: 'Cancel',
            wide: true,
            large: true,
            allowVerticalScrolling: true,
        });
        
        setupProfileEditEventHandlers(popupInstance);
        
        const result = await popupInstance.show();
        
        if (result === POPUP_RESULT.AFFIRMATIVE) {
            const updatedProfile = buildProfileFromForm(popupInstance.dlg, profile.name);
            
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
 * MODIFIED: Create a new profile
 */
export async function newProfile(settings, refreshCallback) {
    try {
        const existingNames = settings.profiles.map(p => p.name);
        const defaultName = generateSafeProfileName('New Profile', existingNames);
        
        const availableModels = getAvailableModels();
        const apiInfo = getCurrentApiInfo();

        // ADDED: Logic to handle title format for the template
        const currentTitleFormat = settings.titleFormat || '[000] - {{title}}';
        const allTitleFormats = getDefaultTitleFormats();

        const templateData = {
            name: defaultName,
            connection: { temperature: 0.7 },
            prompt: '',
            preset: '',
            availableModels: availableModels,
            currentApi: apiInfo.api || 'Unknown',
            isCustomModel: false,
            showCustomInput: availableModels.length === 0,
            customModelValue: '',
            presetOptions: getPresetNames().map(presetName => ({
                value: presetName,
                displayName: formatPresetDisplayName(presetName),
                selected: false
            })),
            // ADDED: Pass title format data to the template
            titleFormat: currentTitleFormat,
            titleFormats: allTitleFormats.map(format => ({
                value: format,
                isSelected: format === currentTitleFormat
            })),
            showCustomTitleInput: !allTitleFormats.includes(currentTitleFormat)
        };
        
        const content = DOMPurify.sanitize(profileEditTemplate(templateData));
        
        const popupInstance = new Popup(`<h3>New Profile</h3>${content}`, POPUP_TYPE.TEXT, '', {
            okButton: 'Create',
            cancelButton: 'Cancel',
            wide: true,
            large: true,
            allowVerticalScrolling: true,
        });
        
        setupProfileEditEventHandlers(popupInstance);
        
        const result = await popupInstance.show();
        
        if (result === POPUP_RESULT.AFFIRMATIVE) {
            const newProfileData = buildProfileFromForm(popupInstance.dlg, defaultName);
            
            const finalName = generateSafeProfileName(newProfileData.name, existingNames);
            newProfileData.name = finalName;
            
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
 * MODIFIED: Setup event handlers for profile edit popup
 */
function setupProfileEditEventHandlers(popupInstance) {
    const popupElement = popupInstance.dlg;
    
    popupElement.querySelector('#stmb-profile-preset')?.addEventListener('change', (e) => {
        const customPromptSection = popupElement.querySelector('#stmb-custom-prompt-section');
        if (e.target.value === '') {
            customPromptSection.classList.remove('displayNone');
        } else {
            customPromptSection.classList.add('displayNone');
        }
    });
    
    // ADDED: Handler for the new title format dropdown
    popupElement.querySelector('#stmb-profile-title-format-select')?.addEventListener('change', (e) => {
        const customInput = popupElement.querySelector('#stmb-profile-custom-title-format');
        if (e.target.value === 'custom') {
            customInput.classList.remove('displayNone');
            customInput.focus();
        } else {
            customInput.classList.add('displayNone');
            customInput.value = e.target.value;
        }
    });

    popupElement.querySelector('#stmb-profile-temperature')?.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value)) {
            if (value < 0) e.target.value = 0;
            if (value > 2) e.target.value = 2;
        }
    });
    
    popupElement.querySelector('#stmb-profile-model')?.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[<>]/g, '');
    });
    
    console.log(`${MODULE_NAME}: Profile edit event handlers attached`);
}

/**
 * MODIFIED: Build profile object from form data
 */
function buildProfileFromForm(popupElement, fallbackName) {
    const name = popupElement.querySelector('#stmb-profile-name')?.value.trim() || fallbackName;
    const model = popupElement.querySelector('#stmb-profile-model')?.value.trim() || '';
    const temperatureInput = popupElement.querySelector('#stmb-profile-temperature')?.value;
    const temperature = parseTemperature(temperatureInput);
    const prompt = popupElement.querySelector('#stmb-profile-prompt')?.value.trim() || '';
    const preset = popupElement.querySelector('#stmb-profile-preset')?.value || '';
    
    // ADDED: Logic to get title format from the new UI elements
    const titleFormatSelect = popupElement.querySelector('#stmb-profile-title-format-select');
    let titleFormat = titleFormatSelect ? titleFormatSelect.value : '[000] - {{title}}';
    if (titleFormat === 'custom') {
        const customTitleInput = popupElement.querySelector('#stmb-profile-custom-title-format');
        titleFormat = customTitleInput ? customTitleInput.value.trim() : '[000] - {{title}}';
    }

    const profile = {
        name: name,
        connection: {},
        prompt: prompt,
        preset: preset,
        titleFormat: titleFormat 
    };
    
    if (model) {
        profile.connection.model = model;
    }
    
    if (temperature !== null) {
        profile.connection.temperature = temperature;
    }
    
    return profile;
}

/**
 * MODIFIED: Clean and normalize profile structure
 */
function cleanProfile(profile) {
    const cleaned = {
        name: profile.name || 'Unnamed Profile',
        connection: cleanConnectionSettings(profile.connection || {}),
        prompt: profile.prompt || '',
        preset: profile.preset || '',
        titleFormat: profile.titleFormat || '[000] - {{title}}'
    };
    
    if (cleaned.prompt && cleaned.preset) {
        cleaned.preset = '';
    }
    
    return cleaned;
}

/**
 * MODIFIED: Validate all profiles in settings and fix issues
 */
export function validateAndFixProfiles(settings) {
    const issues = [];
    const fixes = [];
    
    if (!settings.profiles || !Array.isArray(settings.profiles)) {
        settings.profiles = [];
        fixes.push('Created empty profiles array');
    }
    
    if (settings.profiles.length === 0) {
        settings.profiles.push({
            name: 'Default',
            connection: {},
            prompt: '',
            preset: 'summary',
            titleFormat: settings.titleFormat || '[000] - {{title}}'
        });
        fixes.push('Added default profile');
    }
    
    settings.profiles.forEach((profile, index) => {
        if (!validateProfile(profile)) {
            issues.push(`Profile ${index} is invalid`);
            if (!profile.name) {
                profile.name = `Profile ${index + 1}`;
                fixes.push(`Fixed missing name for profile ${index}`);
            }
            if (!profile.connection) {
                profile.connection = {};
                fixes.push(`Fixed missing connection for profile ${index}`);
            }
        }
        // ADDED: Ensure all existing profiles have a title format
        if (!profile.titleFormat) {
            profile.titleFormat = settings.titleFormat || '[000] - {{title}}';
            fixes.push(`Added missing title format to profile "${profile.name}"`);
        }
    });
    
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