import { saveSettingsDebounced } from '../../../../script.js';
import { Popup, POPUP_TYPE, POPUP_RESULT } from '../../../popup.js';
import { moment, Handlebars, DOMPurify } from '../../../../lib.js';
import {
    validateProfile,
    generateSafeProfileName,
    getCurrentApiInfo,
    createProfileObject
} from './utils.js';
import { getDefaultTitleFormats } from './addlore.js';
import * as SummaryPromptManager from './summaryPromptManager.js';
import { t as __st_t_tag, translate } from '../../../i18n.js';

const MODULE_NAME = 'STMemoryBooks-ProfileManager';

/**
 * Profile edit template
 */
const profileEditTemplate = Handlebars.compile(`
<div class="popup-content">
    <div class="world_entry_form_control marginTop5">
        <label for="stmb-profile-name">
            <h4 data-i18n="STMemoryBooks_ProfileName">Profile Name:</h4>
            <input type="text" id="stmb-profile-name" value="{{name}}" class="text_pole" data-i18n="[placeholder]STMemoryBooks_ProfileNamePlaceholder" placeholder="Profile name">
        </label>
    </div>


    <div class="world_entry_form_control marginTop5">
        <h4 data-i18n="STMemoryBooks_ModelAndTempSettings">Model & Temperature Settings:</h4>
        <div class="info-block hint marginBot10" data-i18n="STMemoryBooks_ModelHint">
            For model, copy-paste the exact model ID, eg. <code>gemini-2.5-pro</code>, <code>deepseek/deepseek-r1-0528:free</code>, <code>gpt-4o-mini-2024-07-18</code>, etc.
        </div>

        <label for="stmb-profile-api">
            <h4 data-i18n="STMemoryBooks_APIProvider">API/Provider:</h4>
            <select id="stmb-profile-api" class="text_pole" {{#if isProviderLocked}}disabled title="Provider locked for this profile"{{/if}}>
                <option value="current_st" {{#if (eq connection.api "current_st")}}selected{{/if}} data-i18n="STMemoryBooks_CurrentSTSettings">Current SillyTavern Settings</option>
                <option value="custom" {{#if (eq connection.api "custom")}}selected{{/if}} data-i18n="STMemoryBooks_CustomAPI">Custom API</option>
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
                <option value="full-manual" {{#if (eq connection.api "full-manual")}}selected{{/if}} title="⚠️ EXCEPTIONAL setup - This should ONLY be used when you need a separate API connection to a different endpoint. Most users should NOT need this option." data-i18n="STMemoryBooks_FullManualConfig">Full Manual Configuration</option>
            </select>
        </label>

        <label for="stmb-profile-model">
            <h4 data-i18n="STMemoryBooks_Model">Model:</h4>
            <input type="text" id="stmb-profile-model" value="{{connection.model}}" class="text_pole" data-i18n="[placeholder]STMemoryBooks_ModelPlaceholder" placeholder="Paste model ID here" {{#if (eq connection.api "current_st")}}disabled title="Managed by SillyTavern UI"{{/if}}>
        </label>

        <label for="stmb-profile-temperature">
            <h4 data-i18n="STMemoryBooks_TemperatureRange">Temperature (0.0 - 2.0):</h4>
            <input type="number" id="stmb-profile-temperature" value="{{connection.temperature}}" class="text_pole" min="0" max="2" step="0.1" data-i18n="[placeholder]STMemoryBooks_TemperaturePlaceholder" placeholder="DO NOT LEAVE BLANK! If unsure put 0.8." {{#if (eq connection.api "current_st")}}disabled title="Managed by SillyTavern UI"{{/if}}>
        </label>

        <div id="stmb-full-manual-section" class="{{#unless (eq connection.api 'full-manual')}}displayNone{{/unless}}">
            <label for="stmb-profile-endpoint">
                <h4 data-i18n="STMemoryBooks_APIEndpointURL">API Endpoint URL:</h4>
                <input type="text" id="stmb-profile-endpoint" value="{{connection.endpoint}}" class="text_pole" data-i18n="[placeholder]STMemoryBooks_APIEndpointPlaceholder" placeholder="https://api.example.com/v1/chat/completions">
            </label>

            <label for="stmb-profile-apikey">
                <h4 data-i18n="STMemoryBooks_APIKey">API Key:</h4>
                <input type="password" id="stmb-profile-apikey" value="{{connection.apiKey}}" class="text_pole" data-i18n="[placeholder]STMemoryBooks_APIKeyPlaceholder" placeholder="Enter your API key">
            </label>
        </div>
    </div>

    <div class="world_entry_form_control marginTop5">
        <label for="stmb-profile-preset">
            <h4 data-i18n="STMemoryBooks_Profile_MemoryMethod">Memory Creation Method:</h4>
            <small data-i18n="STMemoryBooks_Profile_PresetSelectDesc">Choose a summary prompt. Edit or create custom prompts in the Summary Prompt Manager to see them in this list.</small>
            <select id="stmb-profile-preset" class="text_pole">
                {{#each presetOptions}}
                <option value="{{value}}" {{#if selected}}selected{{/if}}>{{displayName}}</option>
                {{/each}}
            </select>
        </label>
        {{#if hasLegacyCustomPrompt}}
        <div id="stmb-legacy-custom-prompt" class="displayNone">{{prompt}}</div>
        {{/if}}
    </div>

    <div class="world_entry_form_control marginTop5">
        <div class="buttons_block justifyCenter gap10px whitespacenowrap">
            <div id="stmb-open-prompt-manager" class="menu_button interactable" data-i18n="STMemoryBooks_OpenPromptManager">🧩 Open Summary Prompt Manager</div>
            <div id="stmb-refresh-presets" class="menu_button interactable" data-i18n="STMemoryBooks_RefreshPresets">🔄 Refresh Presets</div>
            {{#if hasLegacyCustomPrompt}}
            <div id="stmb-move-to-preset" class="menu_button interactable" data-i18n="STMemoryBooks_MoveToPreset">📌 Move Current Custom Prompt to Preset</div>
            {{/if}}
        </div>
    </div>

    <div class="world_entry_form_control marginTop5">
        <h4 data-i18n="STMemoryBooks_TitleFormat">Memory Title Format:</h4>
        <small class="opacity50p" data-i18n="STMemoryBooks_TitleFormatDesc">Use [0], [00], etc. for numbering. Available tags: \{{title}}, \{{scene}}, \{{char}}, \{{user}}, \{{messages}}, \{{profile}}, \{{date}}, \{{time}}</small>
        <select id="stmb-profile-title-format-select" class="text_pole">
            {{#each titleFormats}}
            <option value="{{value}}" {{#if isSelected}}selected{{/if}}>{{value}}</option>
            {{/each}}
            <option value="custom" data-i18n="STMemoryBooks_CustomTitleFormat">Custom Title Format...</option>
        </select>
        <input type="text" id="stmb-profile-custom-title-format" class="text_pole marginTop5 {{#unless showCustomTitleInput}}displayNone{{/unless}}"
            data-i18n="[placeholder]STMemoryBooks_EnterCustomFormat" placeholder="Enter custom format" value="{{titleFormat}}">
    </div>
    <hr>
    <h4 data-i18n="STMemoryBooks_LorebookEntrySettings">Lorebook Entry Settings</h4>
    <div class="info-block hint marginBot10" data-i18n="STMemoryBooks_LorebookEntrySettingsDesc">
        These settings control how the generated memory is saved into the lorebook.
    </div>

    <div class="world_entry_form_control marginTop5">
        <label for="stmb-profile-const-vect">
            <h4 data-i18n="STMemoryBooks_ActivationMode">Activation Mode:</h4>
            <small data-i18n="STMemoryBooks_ActivationModeDesc">🔗 Vectorized is recommended for memories.</small>
            <select id="stmb-profile-const-vect" class="text_pole">
                <option value="link" {{#if (eq constVectMode "link")}}selected{{/if}} data-i18n="STMemoryBooks_Vectorized">🔗 Vectorized (Default)</option>
                <option value="blue" {{#if (eq constVectMode "blue")}}selected{{/if}} data-i18n="STMemoryBooks_Constant">🔵 Constant</option>
                <option value="green" {{#if (eq constVectMode "green")}}selected{{/if}} data-i18n="STMemoryBooks_Normal">🟢 Normal</option>
            </select>
        </label>
    </div>

    <div class="world_entry_form_control marginTop5">
        <label for="stmb-profile-position">
            <h4 data-i18n="STMemoryBooks_InsertionPosition">Insertion Position:</h4>
            <small data-i18n="STMemoryBooks_InsertionPositionDesc">↑Char is recommended. Aiko recommends memories never go lower than ↑AN.</small>
            <select id="stmb-profile-position" class="text_pole">
                <option value="0" {{#if (eq position 0)}}selected{{/if}} data-i18n="STMemoryBooks_CharUp">↑Char</option>
                <option value="1" {{#if (eq position 1)}}selected{{/if}} data-i18n="STMemoryBooks_CharDown">↓Char</option>
                <option value="2" {{#if (eq position 2)}}selected{{/if}} data-i18n="STMemoryBooks_EMUp">↑EM</option>
                <option value="3" {{#if (eq position 3)}}selected{{/if}} data-i18n="STMemoryBooks_EMDown">↓EM</option>
                <option value="4" {{#if (eq position 4)}}selected{{/if}} data-i18n="STMemoryBooks_ANUp">↑AN</option>
                <option value="5" {{#if (eq position 5)}}selected{{/if}} data-i18n="STMemoryBooks_ANDown">↓AN</option>
                <option value="7" {{#if (eq position 7)}}selected{{/if}} data-i18n="STMemoryBooks_Outlet">Outlet</option>
            </select>
        </label>
    </div>

    <div id="stmb-profile-outlet-name-container" class="world_entry_form_control marginTop5 {{#unless (eq position 7)}}displayNone{{/unless}}">
        <label for="stmb-profile-outlet-name">
            <h4 data-i18n="STMemoryBooks_OutletName">Outlet Name:</h4>
            <input type="text" id="stmb-profile-outlet-name" class="text_pole" data-i18n="[placeholder]STMemoryBooks_OutletNamePlaceholder" placeholder="Outlet name" value="{{outletName}}">
        </label>
    </div>

    <div class="world_entry_form_control marginTop5">
        <h4 data-i18n="STMemoryBooks_InsertionOrder">Insertion Order:</h4>
        <div class="buttons_block justifyCenter gap10px">
            <label class="checkbox_label"><input type="radio" name="order-mode" value="auto" {{#if (eq orderMode 'auto')}}checked{{/if}}> <span data-i18n="STMemoryBooks_AutoOrder">Auto (uses memory #)</span></label>
            <label class="checkbox_label"><input type="radio" name="order-mode" value="manual" {{#if (eq orderMode 'manual')}}checked{{/if}}> <span data-i18n="STMemoryBooks_ManualOrder">Manual</span> <input type="number" id="stmb-profile-order-value" value="{{orderValue}}" class="text_pole {{#if (eq orderMode 'auto')}}displayNone{{/if}} width100px" min="1" max="9999" step="1" style="margin-left: auto;"></label>
        </div>
    </div>

    <div class="world_entry_form_control marginTop5">
        <h4 data-i18n="STMemoryBooks_RecursionSettings">Recursion Settings:</h4>
        <div class="buttons_block justifyCenter">
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-profile-prevent-recursion" {{#if preventRecursion}}checked{{/if}}>
                <span data-i18n="STMemoryBooks_PreventRecursion">Prevent Recursion</span>
            </label>
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-profile-delay-recursion" {{#if delayUntilRecursion}}checked{{/if}}>
                <span data-i18n="STMemoryBooks_DelayUntilRecursion">Delay Until Recursion</span>
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
        await SummaryPromptManager.firstRunInitIfMissing(settings);
        const presetList = await SummaryPromptManager.listPresets();
        const presetOptions = presetList.map(p => ({
            value: p.key,
            displayName: p.displayName,
            selected: p.key === (profile.preset || '')
        }));
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
            presetOptions: presetOptions,
            isProviderLocked: profile.name === 'Current SillyTavern Settings',
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
            delayUntilRecursion: profile.delayUntilRecursion,
            outletName: profile.outletName || '',
            hasLegacyCustomPrompt: (profile.prompt && profile.prompt.trim()) ? true : false
        };

        const content = DOMPurify.sanitize(profileEditTemplate(templateData));

        const popupInstance = new Popup(`<h3>${translate('Edit Profile', 'STMemoryBooks_ProfileEditTitle')}</h3>${content}`, POPUP_TYPE.TEXT, '', {
            okButton: translate('Save', 'STMemoryBooks_Save'),
            cancelButton: translate('Cancel/Close', 'STMemoryBooks_CancelClose'),
            wide: true,
            large: true,
            allowVerticalScrolling: true,
        });

        setupProfileEditEventHandlers(popupInstance);

        const result = await popupInstance.show();

        if (result === POPUP_RESULT.AFFIRMATIVE) {
            const updatedProfile = buildProfileFromForm(popupInstance.dlg, profile.name);

            if (!validateProfile(updatedProfile)) {
                toastr.error(translate('Invalid profile data', 'STMemoryBooks_InvalidProfileData'), 'STMemoryBooks');
                return;
            }

            settings.profiles[profileIndex] = updatedProfile;
            saveSettingsDebounced();

            if (refreshCallback) refreshCallback();

            toastr.success(translate('Profile updated successfully', 'STMemoryBooks_ProfileUpdatedSuccess'), 'STMemoryBooks');
        }
    } catch (error) {
        console.error(`${MODULE_NAME}: Error editing profile:`, error);
        toastr.error(translate('Failed to edit profile', 'STMemoryBooks_FailedToEditProfile'), 'STMemoryBooks');
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
        await SummaryPromptManager.firstRunInitIfMissing(settings);
        const presetList = await SummaryPromptManager.listPresets();
        const presetOptions = presetList.map(p => ({
            value: p.key,
            displayName: p.displayName,
            selected: false
        }));

        const templateData = {
            name: defaultName,
            connection: { temperature: 0.7 },
            api: '',
            prompt: '',
            preset: '',
            currentApi: apiInfo.api || 'Unknown',
            presetOptions: presetOptions,
            isProviderLocked: defaultName === 'Current SillyTavern Settings',
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
            delayUntilRecursion: false,
            outletName: ''
        };

        const content = DOMPurify.sanitize(profileEditTemplate(templateData));

        const popupInstance = new Popup(`<h3>${translate('New Profile', 'STMemoryBooks_NewProfileTitle')}</h3>${content}`, POPUP_TYPE.TEXT, '', {
            okButton: translate('Create', 'STMemoryBooks_Create'),
            cancelButton: translate('Cancel/Close', 'STMemoryBooks_CancelClose'),
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
                toastr.error(translate('Invalid profile data', 'STMemoryBooks_InvalidProfileData'), 'STMemoryBooks');
                return;
            }

            settings.profiles.push(newProfileData);
            saveSettingsDebounced();

            if (refreshCallback) refreshCallback();

            toastr.success(translate('Profile created successfully', 'STMemoryBooks_ProfileCreatedSuccess'), 'STMemoryBooks');
        }
    } catch (error) {
        console.error(`${MODULE_NAME}: Error creating profile:`, error);
        toastr.error(translate('Failed to create profile', 'STMemoryBooks_FailedToCreateProfile'), 'STMemoryBooks');
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
        toastr.error(translate('Cannot delete the last profile', 'STMemoryBooks_CannotDeleteLastProfile'), 'STMemoryBooks');
        return;
    }

    const profile = settings.profiles[profileIndex];

    // Prevent deletion of the required default profile
    if (profile?.name === 'Current SillyTavern Settings') {
        toastr.error(translate('Cannot delete the "Current SillyTavern Settings" profile - it is required for the extension to work', 'STMemoryBooks_CannotDeleteDefaultProfile'), 'STMemoryBooks');
        return;
    }

    try {
        const confirmText = translate('Delete profile "{{name}}"?', 'STMemoryBooks_DeleteProfileConfirm').replace('{{name}}', profile.name);
        const result = await new Popup(confirmText, POPUP_TYPE.CONFIRM, '').show();

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

            toastr.success(translate('Profile deleted successfully', 'STMemoryBooks_ProfileDeletedSuccess'), 'STMemoryBooks');
        }
    } catch (error) {
        console.error(`${MODULE_NAME}: Error deleting profile:`, error);
        toastr.error(translate('Failed to delete profile', 'STMemoryBooks_FailedToDeleteProfile'), 'STMemoryBooks');
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

        toastr.success(translate('Profiles exported successfully', 'STMemoryBooks_ProfilesExportedSuccess'), 'STMemoryBooks');
    } catch (error) {
        console.error(`${MODULE_NAME}: Error exporting profiles:`, error);
        toastr.error(translate('Failed to export profiles', 'STMemoryBooks_FailedToExportProfiles'), 'STMemoryBooks');
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
                throw new Error(translate('Invalid profile data format - missing profiles array', 'STMemoryBooks_ImportErrorInvalidFormat'));
            }

            // Validate and clean profile structure
            const validProfiles = importData.profiles
                .filter(profile => validateProfile(profile))
                .map(profile => cleanProfile(profile));

            if (validProfiles.length === 0) {
                throw new Error(translate('No valid profiles found in import file', 'STMemoryBooks_ImportErrorNoValidProfiles'));
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

                let message = __st_t_tag`Imported ${importedCount} profile${importedCount === 1 ? '' : 's'}`;
                if (skippedCount > 0) {
                    message += __st_t_tag` (${skippedCount} duplicate${skippedCount === 1 ? '' : 's'} skipped)`;
                }

                toastr.success(message, translate('STMemoryBooks profile import completed', 'STMemoryBooks_ImportComplete'));
            } else {
                toastr.warning(translate('No new profiles imported - all profiles already exist', 'STMemoryBooks_ImportNoNewProfiles'), 'STMemoryBooks');
            }

        } catch (error) {
            console.error(`${MODULE_NAME}: Error importing profiles:`, error);
            toastr.error(__st_t_tag`Failed to import profiles: ${error.message}`, 'STMemoryBooks');
        }
    };

    reader.onerror = function() {
        console.error(`${MODULE_NAME}: Error reading import file`);
        toastr.error(translate('Failed to read import file', 'STMemoryBooks_ImportReadError'), 'STMemoryBooks');
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

    // Open Summary Prompt Manager from profile editor
    popupElement.querySelector('#stmb-open-prompt-manager')?.addEventListener('click', () => {
        try {
            const btn = document.querySelector('#stmb-prompt-manager');
            if (btn) {
                btn.click();
            } else {
                toastr.error(translate('Prompt Manager button not found. Open main settings and try again.', 'STMemoryBooks_PromptManagerNotFound'), 'STMemoryBooks');
            }
        } catch (err) {
            console.error(`${MODULE_NAME}: Error opening prompt manager from profile editor:`, err);
            toastr.error(translate('Failed to open Summary Prompt Manager', 'STMemoryBooks_FailedToOpenSummaryPromptManager'), 'STMemoryBooks');
        }
    });

    // Refresh presets list in the dropdown (useful after creating a new preset)
    popupElement.querySelector('#stmb-refresh-presets')?.addEventListener('click', async () => {
        try {
            const selectEl = popupElement.querySelector('#stmb-profile-preset');
            if (!selectEl) return;
            const prev = selectEl.value;

            const presetList = await SummaryPromptManager.listPresets();
            // Rebuild options
            selectEl.innerHTML = '';
            presetList.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.key;
                opt.textContent = p.displayName;
                if (p.key === prev) opt.selected = true;
                selectEl.appendChild(opt);
            });

            // If previous value no longer exists, default to first option
            if (![...selectEl.options].some(o => o.value === prev) && selectEl.options.length > 0) {
                selectEl.selectedIndex = 0;
            }

            toastr.success(translate('Preset list refreshed', 'STMemoryBooks_PresetListRefreshed'), 'STMemoryBooks');
        } catch (err) {
            console.error(`${MODULE_NAME}: Error refreshing presets:`, err);
            toastr.error(translate('Failed to refresh presets', 'STMemoryBooks_FailedToRefreshPresets'), 'STMemoryBooks');
        }
    });

    // Auto-refresh presets when Prompt Manager updates presets
    const stmbOnPresetsUpdated = async () => {
        try {
            const selectEl2 = popupElement.querySelector('#stmb-profile-preset');
            if (!selectEl2) return;
            const prev2 = selectEl2.value;

            const presetList2 = await SummaryPromptManager.listPresets();
            selectEl2.innerHTML = '';
            presetList2.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.key;
                opt.textContent = p.displayName;
                if (p.key === prev2) opt.selected = true;
                selectEl2.appendChild(opt);
            });

            if (![...selectEl2.options].some(o => o.value === prev2) && selectEl2.options.length > 0) {
                selectEl2.selectedIndex = 0;
            }
        } catch (e) {
            console.error(`${MODULE_NAME}: Error auto-refreshing presets on update:`, e);
        }
    };
    window.addEventListener('stmb-presets-updated', stmbOnPresetsUpdated);
    popupInstance?.dlg?.addEventListener('close', () => {
        window.removeEventListener('stmb-presets-updated', stmbOnPresetsUpdated);
    });

    // Move legacy custom prompt to a new preset and select it
    popupElement.querySelector('#stmb-move-to-preset')?.addEventListener('click', async () => {
        try {
            const legacyPromptEl = popupElement.querySelector('#stmb-legacy-custom-prompt');
            const legacyPrompt = legacyPromptEl ? legacyPromptEl.textContent : '';
            if (!legacyPrompt || !legacyPrompt.trim()) {
                toastr.error(t('STMemoryBooks_NoCustomPromptToMigrate', 'No custom prompt to migrate'), 'STMemoryBooks');
                return;
            }
            const profileNameInput = popupElement.querySelector('#stmb-profile-name');
            const profileName = profileNameInput?.value?.trim() || 'Profile';
            const displayName = `Custom: ${profileName}`;

            const newKey = await SummaryPromptManager.upsertPreset(null, legacyPrompt, displayName);

            const confirmPopup = new Popup(
                '<h3 data-i18n="STMemoryBooks_MoveToPresetConfirmTitle">Move to Preset</h3><p data-i18n="STMemoryBooks_MoveToPresetConfirmDesc">Create a preset from this profile\'s custom prompt, set the preset on this profile, and clear the custom prompt?</p>',
                POPUP_TYPE.CONFIRM,
                '',
                { okButton: translate('Apply', 'STMemoryBooks_Apply'), cancelButton: translate('Cancel', 'STMemoryBooks_Cancel') }
            );
            const res = await confirmPopup.show();
            if (res === POPUP_RESULT.AFFIRMATIVE) {
                const presetSelect = popupElement.querySelector('#stmb-profile-preset');
                if (presetSelect) {
                    if (![...presetSelect.options].some(o => o.value === newKey)) {
                        const opt = document.createElement('option');
                        opt.value = newKey;
                        opt.textContent = displayName;
                        presetSelect.appendChild(opt);
                    }
                    presetSelect.value = newKey;
                }
                legacyPromptEl?.remove();
                popupElement.querySelector('#stmb-move-to-preset')?.remove();
                toastr.success(translate('Preset created and selected. Remember to Save.', 'STMemoryBooks_CustomPromptMigrated'), 'STMemoryBooks');
            }
        } catch (error) {
            console.error(`${MODULE_NAME}: Error moving custom prompt to preset:`, error);
            toastr.error(translate('Failed to move custom prompt to preset', 'STMemoryBooks_FailedToMigrateCustomPrompt'), 'STMemoryBooks');
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
        const modelInput = popupElement.querySelector('#stmb-profile-model');
        const tempInput = popupElement.querySelector('#stmb-profile-temperature');
        if (e.target.value === 'full-manual') {
            fullManualSection.classList.remove('displayNone');
        } else {
            fullManualSection.classList.add('displayNone');
        }
        // Disable model/temp when using Current SillyTavern Settings provider
        const isCurrentST = e.target.value === 'current_st';
        if (modelInput) {
            modelInput.disabled = isCurrentST;
            modelInput.title = isCurrentST ? 'Managed by SillyTavern UI' : '';
        }
        if (tempInput) {
            tempInput.disabled = isCurrentST;
            tempInput.title = isCurrentST ? 'Managed by SillyTavern UI' : '';
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

    // Toggle outlet name visibility based on position
    const positionSelect = popupElement.querySelector('#stmb-profile-position');
    positionSelect?.addEventListener('change', () => {
        const cont = popupElement.querySelector('#stmb-profile-outlet-name-container');
        if (cont) cont.classList.toggle('displayNone', positionSelect.value !== '7');
    });

    // Initial sync for outlet name visibility on open
    (function() {
        const cont = popupElement.querySelector('#stmb-profile-outlet-name-container');
        if (positionSelect && cont) {
            cont.classList.toggle('displayNone', positionSelect.value !== '7');
        }
    })();
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
    data.prompt = '';
    data.preset = presetSelect?.value || '';

    // Handle the title format dropdown logic
    const titleFormatSelect = popupElement.querySelector('#stmb-profile-title-format-select');
    if (titleFormatSelect?.value === 'custom') {
        data.titleFormat = popupElement.querySelector('#stmb-profile-custom-title-format')?.value;
    } else if (titleFormatSelect) {
        data.titleFormat = titleFormatSelect.value;
    }

    // Step 3: Call the centralized creator function with the gathered and cleaned data.
    if (data.position === '7' || data.position === 7) {
        data.outletName = popupElement.querySelector('#stmb-profile-outlet-name')?.value?.trim() || '';
    }
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
        // Create default profile using provider-based "Current SillyTavern Settings"
        const dynamicProfile = createProfileObject({
            name: 'Current SillyTavern Settings',
            api: 'current_st',
            preset: 'summary'
        });

        settings.profiles.push(dynamicProfile);
        fixes.push('Added default profile using provider "Current SillyTavern Settings".');
    }

    // Migrate legacy dynamic profiles to provider-based current_st
    settings.profiles = settings.profiles.map(p => {
        if (p && p.useDynamicSTSettings) {
            p.connection = p.connection || {};
            p.connection.api = 'current_st';
            delete p.useDynamicSTSettings;
            fixes.push(`Migrated legacy dynamic profile "${p.name}" to provider-based current_st`);
        }
        return p;
    });

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
