import { saveSettingsDebounced } from '../../../../script.js';
import { t } from '../../../i18n.js';
import { Popup, POPUP_TYPE, POPUP_RESULT } from '../../../popup.js';
import { moment, Handlebars, DOMPurify } from '../../../../lib.js';
import {
    validateProfile,
    generateSafeProfileName,
    formatPresetDisplayName,
    getPresetNames,
    getCurrentApiInfo,
    createProfileObject
} from './utils.js';
import { getDefaultTitleFormats } from './addlore.js';

const MODULE_NAME = 'STMemoryBooks-ProfileManager';

/**
 * Profile edit template
 */
const profileEditTemplate = Handlebars.compile(`
<div class="popup-content">
    <div class="world_entry_form_control marginTop5">
        <label for="stmb-profile-name">
            <h4>Profile Name:</h4>
            <input type="text" id="stmb-profile-name" value="{{name}}" class="text_pole" placeholder="Profile name">
        </label>
    </div>

    <div class="world_entry_form_control marginTop5">
        <h4>Model & Temperature Settings:</h4>
        <div class="info-block hint marginBot10">
            For model, copy-paste the exact model ID, eg. <code>gemini-2.5-pro</code>, <code>deepseek/deepseek-r1-0528:free</code>, <code>gpt-4o-mini-2024-07-18</code>, etc.
        </div>

        <label for="stmb-profile-api">
            <h4>API/Provider:</h4>
            <select id="stmb-profile-api" class="text_pole">
                <option value="custom" {{#if (eq connection.api "custom")}}selected{{/if}}>Custom API</option>
                <option value="openai" {{#if (eq connection.api "openai")}}selected{{/if}}>OpenAI</option>
                <option value="claude" {{#if (eq connection.api "claude")}}selected{{/if}}>Claude</option>
                <option value="makersuite" {{#if (eq connection.api "makersuite")}}selected{{/if}}>Google AI Studio</option>
                <option value="openrouter" {{#if (eq connection.api "openrouter")}}selected{{/if}}>OpenRouter</option>
                <option value="mistralai" {{#if (eq connection.api "mistralai")}}selected{{/if}}>MistralAI</option>
                <option value="cohere" {{#if (eq connection.api "cohere")}}selected{{/if}}>Cohere</option>
                <option value="perplexity" {{#if (eq connection.api "perplexity")}}selected{{/if}}>Perplexity</option>
                <option value="groq" {{#if (eq connection.api "groq")}}selected{{/if}}>Groq</option>
                <option value="deepseek" {{#if (eq connection.api "deepseek")}}selected{{/if}}>DeepSeek</option>
                <option value="electronhub" {{#if (eq connection.api "electronhub")}}selected{{/if}}>Electron Hub</option>
                <option value="aimlapi" {{#if (eq connection.api "aimlapi")}}selected{{/if}}>AI/ML API</option>
                <option value="xai" {{#if (eq connection.api "xai")}}selected{{/if}}>xAI</option>
                <option value="pollinations" {{#if (eq connection.api "pollinations")}}selected{{/if}}>Pollinations</option>
                <option value="vertexai" {{#if (eq connection.api "vertexai")}}selected{{/if}}>Vertex AI</option>
                <option value="moonshot" {{#if (eq connection.api "moonshot")}}selected{{/if}}>Moonshot</option>
                <option value="fireworks" {{#if (eq connection.api "fireworks")}}selected{{/if}}>Fireworks</option>
                <option value="cometapi" {{#if (eq connection.api "cometapi")}}selected{{/if}}>Comet API</option>
                <option value="azure_openai" {{#if (eq connection.api "azure_openai")}}selected{{/if}}>Azure OpenAI</option>
                <option value="full-manual" {{#if (eq connection.api "full-manual")}}selected{{/if}} title="⚠️ EXCEPTIONAL setup - This should ONLY be used when you need a separate API connection to a different endpoint. Most users should NOT need this option.">Full Manual Configuration</option>
            </select>
        </label>

        <label for="stmb-profile-model">
            <h4>Model:</h4>
            <input type="text" id="stmb-profile-model" value="{{connection.model}}" class="text_pole" placeholder="Paste model ID here">
        </label>

        <label for="stmb-profile-temperature">
            <h4>Temperature (0.0 - 2.0):</h4>
            <input type="number" id="stmb-profile-temperature" value="{{connection.temperature}}" class="text_pole" min="0" max="2" step="0.1" placeholder="DO NOT LEAVE BLANK! If unsure put 0.8.">
        </label>

        <div id="stmb-full-manual-section" class="{{#unless (eq connection.api 'full-manual')}}displayNone{{/unless}}">
            <label for="stmb-profile-endpoint">
                <h4>API Endpoint URL:</h4>
                <input type="text" id="stmb-profile-endpoint" value="{{connection.endpoint}}" class="text_pole" placeholder="https://api.example.com/v1/chat/completions">
            </label>

            <label for="stmb-profile-apikey">
                <h4>API Key:</h4>
                <input type="password" id="stmb-profile-apikey" value="{{connection.apiKey}}" class="text_pole" placeholder="Enter your API key">
            </label>
        </div>
    </div>

    <div class="world_entry_form_control marginTop5">
        <label for="stmb-profile-preset">
            <h4>Memory Creation Method:</h4>
            <small>Choose a built-in preset or create a custom prompt.</small>
            <select id="stmb-profile-preset" class="text_pole">
                {{#each presetOptions}}
                <option value="{{value}}" {{#if selected}}selected{{/if}}>{{displayName}}</option>
                {{/each}}
                <option value="" {{#unless preset}}selected{{/unless}}>Custom Prompt...</option>
            </select>
        </label>

        <label for="stmb-profile-prompt" id="stmb-custom-prompt-section" class="{{#if preset}}displayNone{{/if}}">
            <h4>Custom Memory Creation Prompt:</h4>
            <small>This prompt will be used to generate memories from chat scenes. Don't change the "respond with JSON" instructions, 📕Memory Books uses that to process the returned result from the AI.</small>
            <textarea id="stmb-profile-prompt" class="text_pole textarea_compact" rows="10" placeholder="Enter your custom memory creation prompt here...">{{#if prompt}}{{prompt}}{{else}}Analyze the following roleplay scene and return a minimal memory entry as JSON.

You must respond with ONLY valid JSON in this exact format:
{
  "title": "Short scene title (1-3 words)",
  "content": "Brief 1-2 sentence summary...",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

For the content field, provide a very brief 1-2 sentence summary of what happened in this scene.

For the keywords field, generate 5-20 highly relevant keywords for database retrieval - focus on the most important terms that would help find this scene later. Do not use \{{char}} or \{{user}} as keywords.

Return ONLY the JSON, no other text.{{/if}}</textarea>
        </label>
    </div>

    <div class="world_entry_form_control marginTop5">
        <h4>Memory Title Format:</h4>
        <small class="opacity50p">Use [0], [00], etc. for numbering. Available tags: \\{{title}}, \\{{scene}}, \\{{char}}, \\{{user}}, \\{{messages}}, \\{{profile}}, \\{{date}}, \\{{time}}</small>
        <select id="stmb-profile-title-format-select" class="text_pole">
            {{#each titleFormats}}
            <option value="{{value}}" {{#if isSelected}}selected{{/if}}>{{value}}</option>
            {{/each}}
            <option value="custom">Custom Title Format...</option>
        </select>
        <input type="text" id="stmb-profile-custom-title-format" class="text_pole marginTop5 {{#unless showCustomTitleInput}}displayNone{{/unless}}"
            placeholder="Enter custom format" value="{{titleFormat}}">
    </div>
    <hr>
    <h4>Lorebook Entry Settings</h4>
    <div class="info-block hint marginBot10">
        These settings control how the generated memory is saved into the lorebook.
    </div>

    <div class="world_entry_form_control marginTop5">
        <label for="stmb-profile-const-vect">
            <h4>Activation Mode:</h4>
            <small>🔗 Vectorized is recommended for memories.</small>
            <select id="stmb-profile-const-vect" class="text_pole">
                <option value="link" {{#if (eq constVectMode "link")}}selected{{/if}}>🔗 Vectorized (Default)</option>
                <option value="blue" {{#if (eq constVectMode "blue")}}selected{{/if}}>🔵 Constant</option>
                <option value="green" {{#if (eq constVectMode "green")}}selected{{/if}}>🟢 Normal</option>
            </select>
        </label>
    </div>

    <div class="world_entry_form_control marginTop5">
        <label for="stmb-profile-position">
            <h4>Insertion Position:</h4>
            <small>↑Char is recommended. Aiko recommends memories never go lower than ↑AN.</small>
            <select id="stmb-profile-position" class="text_pole">
                <option value="0" {{#if (eq position 0)}}selected{{/if}}>↑Char</option>
                <option value="1" {{#if (eq position 1)}}selected{{/if}}>↓Cha</option>
                <option value="2" {{#if (eq position 2)}}selected{{/if}}>↑EM</option>
                <option value="3" {{#if (eq position 3)}}selected{{/if}}>↓EM</option>
                <option value="4" {{#if (eq position 4)}}selected{{/if}}>↑AN</option>
            </select>
        </label>
    </div>

    <div class="world_entry_form_control marginTop5">
        <h4>Insertion Order:</h4>
        <div class="buttons_block justifyCenter gap10px">
            <label class="checkbox_label"><input type="radio" name="order-mode" value="auto" {{#if (eq orderMode 'auto')}}checked{{/if}}> Auto (uses memory #)</label>
            <label class="checkbox_label"><input type="radio" name="order-mode" value="manual" {{#if (eq orderMode 'manual')}}checked{{/if}}> Manual <input type="number" id="stmb-profile-order-value" value="{{orderValue}}" class="text_pole {{#if (eq orderMode 'auto')}}displayNone{{/if}} width100px" min="1" max="9999" step="1" style="margin-left: auto;"></label>
        </div>
    </div>

    <div class="world_entry_form_control marginTop5">
        <h4>Recursion Settings:</h4>
        <div class="buttons_block justifyCenter">
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-profile-prevent-recursion" {{#if preventRecursion}}checked{{/if}}>
                <span>Prevent Recursion</span>
            </label>
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-profile-delay-recursion" {{#if delayUntilRecursion}}checked{{/if}}>
                <span>Delay Until Recursion</span>
            </label>
        </div>
    </div>
</div>
`);

/**
 * Edit an existing profile
 */
export async function editProfile(settings, profileIndex, refreshCallback) {
    const profile = settings.profiles[profileIndex];

    if (!profile) {
        console.error(`${MODULE_NAME}: No profile found at index ${profileIndex}`);
        return;
    }

    try {
        const apiInfo = getCurrentApiInfo();
        const connection = profile.connection || { temperature: 0.7 };
        const profileTitleFormat = profile.titleFormat || settings.titleFormat || '[000] - {{title}}';
        const allTitleFormats = getDefaultTitleFormats();
        const templateData = {
            name: profile.name,
            connection: connection,
            api: 'openai',
            prompt: profile.prompt || '',
            preset: profile.preset || '',
            currentApi: apiInfo.api || 'Unknown',
            presetOptions: getPresetNames().map(presetName => ({
                value: presetName,
                displayName: formatPresetDisplayName(presetName),
                selected: presetName === profile.preset
            })),
            // Pass title format data to the template
            titleFormat: profileTitleFormat,
            titleFormats: allTitleFormats.map(format => ({
                value: format,
                isSelected: format === profileTitleFormat
            })),
            showCustomTitleInput: !allTitleFormats.includes(profileTitleFormat),
            constVectMode: profile.constVectMode,
            position: profile.position,
            orderMode: profile.orderMode,
            orderValue: profile.orderValue,
            preventRecursion: profile.preventRecursion,
            delayUntilRecursion: profile.delayUntilRecursion
        };

        const content = DOMPurify.sanitize(profileEditTemplate(templateData));

        const popupInstance = new Popup(`<h3>Edit Profile</h3>${content}`, POPUP_TYPE.TEXT, '', {
            okButton: 'Save',
            cancelButton: 'Cancel/Close',
            wide: true,
            large: true,
            allowVerticalScrolling: true,
        });

        setupProfileEditEventHandlers(popupInstance);

        const result = await popupInstance.show();

        if (result === POPUP_RESULT.AFFIRMATIVE) {
            const updatedProfile = buildProfileFromForm(popupInstance.dlg, profile.name);

            if (!validateProfile(updatedProfile)) {
                toastr.error(t`Invalid profile data`, 'STMemoryBooks');
                return;
            }

            settings.profiles[profileIndex] = updatedProfile;
            saveSettingsDebounced();

            if (refreshCallback) refreshCallback();

            toastr.success(t`Profile updated successfully`, 'STMemoryBooks');
        }
    } catch (error) {
        console.error(`${MODULE_NAME}: Error editing profile:`, error);
        toastr.error(t`Failed to edit profile`, 'STMemoryBooks');
    }
}

/**
 * Create a new profile
 */
export async function newProfile(settings, refreshCallback) {
    try {
        const existingNames = settings.profiles.map(p => p.name);
        const defaultName = generateSafeProfileName('New Profile', existingNames);

        const apiInfo = getCurrentApiInfo();

        // Logic to handle title format for the template
        const currentTitleFormat = settings.titleFormat || '[000] - {{title}}';
        const allTitleFormats = getDefaultTitleFormats();

        const templateData = {
            name: defaultName,
            connection: { temperature: 0.7 },
            api: '',
            prompt: '',
            preset: '',
            currentApi: apiInfo.api || 'Unknown',
            presetOptions: getPresetNames().map(presetName => ({
                value: presetName,
                displayName: formatPresetDisplayName(presetName),
                selected: false
            })),
            // Pass title format data to the template
            titleFormat: currentTitleFormat,
            titleFormats: allTitleFormats.map(format => ({
                value: format,
                isSelected: format === currentTitleFormat
            })),
            showCustomTitleInput: !allTitleFormats.includes(currentTitleFormat),
            constVectMode: 'link',
            position: 0,
            orderMode: 'auto',
            orderValue: 100,
            preventRecursion: true,
            delayUntilRecursion: false
        };

        const content = DOMPurify.sanitize(profileEditTemplate(templateData));

        const popupInstance = new Popup(`<h3>New Profile</h3>${content}`, POPUP_TYPE.TEXT, '', {
            okButton: 'Create',
            cancelButton: 'Cancel/Close',
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
                toastr.error(t`Invalid profile data`, 'STMemoryBooks');
                return;
            }

            settings.profiles.push(newProfileData);
            saveSettingsDebounced();

            if (refreshCallback) refreshCallback();

            toastr.success(t`Profile created successfully`, 'STMemoryBooks');
        }
    } catch (error) {
        console.error(`${MODULE_NAME}: Error creating profile:`, error);
        toastr.error(t`Failed to create profile`, 'STMemoryBooks');
    }
}

/**
 * Delete an existing profile
 * @param {Object} settings - Extension settings
 * @param {number} profileIndex - The index of the profile to delete
 * @param {Function} refreshCallback - Function to refresh UI after changes
 */
export async function deleteProfile(settings, profileIndex, refreshCallback) {
    if (settings.profiles.length <= 1) {
        toastr.error(t`Cannot delete the last profile`, 'STMemoryBooks');
        return;
    }

    const profile = settings.profiles[profileIndex];

    // Prevent deletion of dynamic ST settings profile
    if (profile.useDynamicSTSettings) {
        toastr.error(t`Cannot delete the "Current SillyTavern Settings" profile - it is required for the extension to work`, 'STMemoryBooks');
        return;
    }

    try {
        const result = await new Popup(`Delete profile "${profile.name}"?`, POPUP_TYPE.CONFIRM, '').show();

        if (result === POPUP_RESULT.AFFIRMATIVE) {
            const deletedName = profile.name;
            settings.profiles.splice(profileIndex, 1);

            // If we deleted the profile that was the default, reset default to the first profile.
            if (settings.defaultProfile === profileIndex) {
                settings.defaultProfile = 0;
            }
            // If we deleted a profile that came *before* the default one, its index has shifted.
            else if (settings.defaultProfile > profileIndex) {
                settings.defaultProfile--;
            }

            saveSettingsDebounced();

            if (refreshCallback) refreshCallback();

            toastr.success(t`Profile deleted successfully`, 'STMemoryBooks');
        }
    } catch (error) {
        console.error(`${MODULE_NAME}: Error deleting profile:`, error);
        toastr.error(t`Failed to delete profile`, 'STMemoryBooks');
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

        toastr.success(t`Profiles exported successfully`, 'STMemoryBooks');
    } catch (error) {
        console.error(`${MODULE_NAME}: Error exporting profiles:`, error);
        toastr.error(t`Failed to export profiles`, 'STMemoryBooks');
    }
}

function cleanProfile(profile) {
    return createProfileObject(profile);
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

                toastr.success(message, 'STMemoryBooks profile import completed');
            } else {
                toastr.warning(t`No new profiles imported - all profiles already exist`, 'STMemoryBooks');
            }

        } catch (error) {
            console.error(`${MODULE_NAME}: Error importing profiles:`, error);
            toastr.error(t`Failed to import profiles: ${error.message}`, 'STMemoryBooks');
        }
    };

    reader.onerror = function() {
        console.error(`${MODULE_NAME}: Error reading import file`);
        toastr.error(t`Failed to read import file`, 'STMemoryBooks');
    };

    reader.readAsText(file);

    // Clear the file input
    event.target.value = '';
}

/**
 * Setup event handlers for profile edit popup
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

    // Handler for the new title format dropdown
    popupElement.querySelector('#stmb-profile-title-format-select')?.addEventListener('change', (e) => {
        const customInput = popupElement.querySelector('#stmb-profile-custom-title-format');
        if (e.target.value === 'custom') {
            customInput.classList.remove('displayNone');
            customInput.focus();
        } else {
            customInput.classList.add('displayNone');
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

    popupElement.querySelector('#stmb-profile-api')?.addEventListener('change', (e) => {
        const fullManualSection = popupElement.querySelector('#stmb-full-manual-section');
        if (e.target.value === 'full-manual') {
            fullManualSection.classList.remove('displayNone');
        } else {
            fullManualSection.classList.add('displayNone');
        }
    });

    popupElement.querySelectorAll('input[name="order-mode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const orderValueInput = popupElement.querySelector('#stmb-profile-order-value');
            if (e.target.value === 'manual') {
                orderValueInput.classList.remove('displayNone');
            } else {
                orderValueInput.classList.add('displayNone');
            }
        });
    });
}

/**
 * Build profile object from form data
 */
function buildProfileFromForm(popupElement, fallbackName) {
    // Step 1: Gather all the raw data from the form into a single object.
    const data = {
        name: popupElement.querySelector('#stmb-profile-name')?.value.trim() || fallbackName,
        api: popupElement.querySelector('#stmb-profile-api')?.value,
        model: popupElement.querySelector('#stmb-profile-model')?.value,
        temperature: popupElement.querySelector('#stmb-profile-temperature')?.value,
        endpoint: popupElement.querySelector('#stmb-profile-endpoint')?.value,
        apiKey: popupElement.querySelector('#stmb-profile-apikey')?.value,
        constVectMode: popupElement.querySelector('#stmb-profile-const-vect')?.value,
        position: popupElement.querySelector('#stmb-profile-position')?.value,
        orderMode: popupElement.querySelector('input[name="order-mode"]:checked')?.value,
        orderValue: popupElement.querySelector('#stmb-profile-order-value')?.value,
        preventRecursion: popupElement.querySelector('#stmb-profile-prevent-recursion')?.checked,
        delayUntilRecursion: popupElement.querySelector('#stmb-profile-delay-recursion')?.checked,
    };

    // Step 2: Intelligently determine whether to use the selected preset or the custom prompt.
    const presetSelect = popupElement.querySelector('#stmb-profile-preset');
    if (presetSelect && presetSelect.value === '') { // An empty value means "Custom Prompt..." was selected.
        data.prompt = popupElement.querySelector('#stmb-profile-prompt')?.value;
        data.preset = ''; // Ensure preset is cleared when using a custom prompt.
    } else if (presetSelect) { // A preset was selected.
        data.prompt = ''; // Ensure custom prompt is cleared when using a preset.
        data.preset = presetSelect.value;
    }

    // Handle the title format dropdown logic
    const titleFormatSelect = popupElement.querySelector('#stmb-profile-title-format-select');
    if (titleFormatSelect?.value === 'custom') {
        data.titleFormat = popupElement.querySelector('#stmb-profile-custom-title-format')?.value;
    } else if (titleFormatSelect) {
        data.titleFormat = titleFormatSelect.value;
    }

    // Step 3: Call the centralized creator function with the gathered and cleaned data.
    return createProfileObject(data);
}

/**
 * Validate all profiles in settings and fix issues
 */
export function validateAndFixProfiles(settings) {
    const issues = [];
    const fixes = [];

    if (!settings.profiles || !Array.isArray(settings.profiles)) {
        settings.profiles = [];
        fixes.push('Created empty profiles array');
    }

    if (settings.profiles.length === 0) {
        // Create dynamic profile that uses live ST settings
        const dynamicProfile = createProfileObject({
            name: 'Current SillyTavern Settings',
            preset: 'summary',
            isDynamicProfile: true  // Flag to prevent titleFormat creation
        });

        // Add flag to indicate this profile uses dynamic ST settings
        dynamicProfile.useDynamicSTSettings = true;
        // Clear connection since it will be populated dynamically
        dynamicProfile.connection = {};

        settings.profiles.push(dynamicProfile);
        fixes.push('Added dynamic profile that uses current SillyTavern settings.');
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

        // For each profile, we check if the new settings exist. If not, we add the defaults.
        if (profile.constVectMode === undefined) {
            profile.constVectMode = 'link';
            fixes.push(`Added default 'constVectMode' to profile "${profile.name}"`);
        }
        if (profile.position === undefined) {
            profile.position = 0;
            fixes.push(`Added default 'position' to profile "${profile.name}"`);
        }
        if (profile.orderMode === undefined) {
            profile.orderMode = 'auto';
            profile.orderValue = 100;
            fixes.push(`Added default 'order' settings to profile "${profile.name}"`);
        }
        if (profile.preventRecursion === undefined) {
            profile.preventRecursion = true;
            fixes.push(`Added default 'preventRecursion' to profile "${profile.name}"`);
        }
        if (profile.delayUntilRecursion === undefined) {
            profile.delayUntilRecursion = true;
            fixes.push(`Added default 'delayUntilRecursion' to profile "${profile.name}"`);
        }
        // Ensure all existing profiles have a title format
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