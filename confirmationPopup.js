import { saveSettingsDebounced } from '../../../../script.js';
import { Popup, POPUP_TYPE, POPUP_RESULT } from '../../../popup.js';
import { DOMPurify } from '../../../../lib.js';
import { simpleConfirmationTemplate, advancedOptionsTemplate, memoryPreviewTemplate } from './templates.js';
import { translate } from '../../../i18n.js';
import { loadWorldInfo } from '../../../world-info.js';
import { identifyMemoryEntries } from './addlore.js';
import { createProfileObject, getUIModelSettings, getCurrentApiInfo, getEffectivePrompt, generateSafeProfileName, getEffectiveLorebookName } from './utils.js';
import { playMessageSound } from '../../../power-user.js';

const MODULE_NAME = 'STMemoryBooks-ConfirmationPopup';

// Helper: keyed translation with Mustache-style interpolation using ST translate()
function tr(key, fallback, params) {
  const localized = translate(fallback, key);
  if (!params) return localized;
  return localized.replace(/{{\s*(\w+)\s*}}/g, (m, p1) => {
    const v = params[p1];
    return v !== undefined && v !== null ? String(v) : '';
  });
}

// Define semantic mappings for custom popup results using SillyTavern's provided constants
const STMB_POPUP_RESULTS = {
  ADVANCED: POPUP_RESULT.CUSTOM1,
  SAVE_PROFILE: POPUP_RESULT.CUSTOM2,
  EDIT: POPUP_RESULT.CUSTOM3,
  RETRY: POPUP_RESULT.CUSTOM4
};

/**
 * Plays the messagePopupSound in a safe manner, not blocking anything else if the playback fails
 */
function safePlayMessageSound() {
  try {
    // Play notification sound when popup appears
    playMessageSound();
  } catch (error) {
    console.error("playMessageSound failed", error);
  }
}

/**
 * Show simplified confirmation popup for memory creation
 */
export async function showConfirmationPopup(sceneData, settings, currentModelSettings, currentApiInfo, chat_metadata, selectedProfileIndex = null) {
  const profileIndex = selectedProfileIndex !== null ? selectedProfileIndex : settings.defaultProfile;
  const selectedProfile = settings.profiles[profileIndex];
  const effectivePrompt = await getEffectivePrompt(selectedProfile);
  const templateData = {
    ...sceneData,
    profileName: (selectedProfile?.isBuiltinCurrentST) ? translate('Current SillyTavern Settings', 'STMemoryBooks_Profile_CurrentST') : selectedProfile.name,
    effectivePrompt: effectivePrompt,
    profileModel: (selectedProfile.useDynamicSTSettings || (selectedProfile?.connection?.api === 'current_st')) ?
      translate('Current SillyTavern model', 'STMemoryBooks_Label_CurrentSTModel') : (selectedProfile.connection?.model || translate('Current SillyTavern model', 'STMemoryBooks_Label_CurrentSTModel')),
    profileTemperature: (selectedProfile.useDynamicSTSettings || (selectedProfile?.connection?.api === 'current_st')) ?
      translate('Current SillyTavern temperature', 'STMemoryBooks_Label_CurrentSTTemperature') : (selectedProfile.connection?.temperature !== undefined ?
        selectedProfile.connection.temperature : translate('Current SillyTavern temperature', 'STMemoryBooks_Label_CurrentSTTemperature')),
    currentModel: currentModelSettings?.model || translate('Unknown', 'common.unknown'),
    currentTemperature: currentModelSettings?.temperature ?? 0.7,
    currentApi: currentApiInfo?.api || translate('Unknown', 'common.unknown'),
    tokenThreshold: settings.moduleSettings.tokenWarningThreshold ?? 30000,
    showWarning: sceneData.estimatedTokens > (settings.moduleSettings.tokenWarningThreshold ?? 30000),
    profiles: settings.profiles.map((profile, index) => ({
      ...profile,
      name: (profile?.isBuiltinCurrentST) ? translate('Current SillyTavern Settings', 'STMemoryBooks_Profile_CurrentST') : profile.name,
      isDefault: index === settings.defaultProfile,
      isSelected: index === profileIndex
    }))
  };

  const content = DOMPurify.sanitize(simpleConfirmationTemplate(templateData));

  safePlayMessageSound();

  try {
    const popup = new Popup(content, POPUP_TYPE.TEXT, '', {
      okButton: translate('Create Memory', 'STMemoryBooks_CreateMemory'),
      cancelButton: translate('Cancel', 'STMemoryBooks_Cancel'),
      allowVerticalScrolling: true,
      wide: false,
      customButtons: [
        {
          text: translate('Advanced Options...', 'STMemoryBooks_Button_AdvancedOptions'),
          result: STMB_POPUP_RESULTS.ADVANCED,
          classes: ['menu_button', 'whitespacenowrap'],
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
          memoryCount: settings.moduleSettings.defaultMemoryCount ?? 0,
          overrideSettings: false
        }
      };
    } else if (result === STMB_POPUP_RESULTS.ADVANCED) {
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
    return { confirmed: false };
  }
}


/**
 * Show advanced options popup for memory creation
 */
export async function showAdvancedOptionsPopup(sceneData, settings, selectedProfile, currentModelSettings, currentApiInfo, chat_metadata) {
  // Get available memories count
  const availableMemories = await getAvailableMemoriesCount(settings, chat_metadata);

  const effectivePrompt = await getEffectivePrompt(selectedProfile);
  const profileModel = selectedProfile.connection?.model || translate('Current SillyTavern model', 'STMemoryBooks_Label_CurrentSTModel');
  const profileTemperature = selectedProfile.connection?.temperature !== undefined ?
    selectedProfile.connection.temperature : translate('Current SillyTavern temperature', 'STMemoryBooks_Label_CurrentSTTemperature');

  const templateData = {
    ...sceneData,
    availableMemories: availableMemories,
    profiles: settings.profiles.map((profile, index) => ({
      ...profile,
      name: (profile?.isBuiltinCurrentST) ? translate('Current SillyTavern Settings', 'STMemoryBooks_Profile_CurrentST') : profile.name,
      isDefault: index === settings.defaultProfile
    })),
    effectivePrompt: effectivePrompt,
    defaultMemoryCount: settings.moduleSettings.defaultMemoryCount ?? 0,
    profileModel: profileModel,
    profileTemperature: profileTemperature,
    currentModel: currentModelSettings?.model || translate('Unknown', 'common.unknown'),
    currentTemperature: currentModelSettings?.temperature ?? 0.7,
    currentApi: currentApiInfo?.api || translate('Unknown', 'common.unknown'),
    suggestedProfileName: tr('STMemoryBooks_ModifiedProfileName', '{{name}} - Modified', { name: selectedProfile.name }),
    tokenThreshold: settings.moduleSettings.tokenWarningThreshold ?? 30000,
    showWarning: sceneData.estimatedTokens > (settings.moduleSettings.tokenWarningThreshold ?? 30000)
  };

  const content = DOMPurify.sanitize(advancedOptionsTemplate(templateData));

  // Play notification sound when popup appears
  safePlayMessageSound();

  try {
    const popup = new Popup(content, POPUP_TYPE.TEXT, '', {
      okButton: translate('Create Memory', 'STMemoryBooks_Button_CreateMemory'),
      cancelButton: translate('Cancel', 'STMemoryBooks_Cancel'),
      wide: true,
      large: true,
      allowVerticalScrolling: true,
      customButtons: [
        {
          text: translate('Save as New Profile', 'STMemoryBooks_Button_SaveAsNewProfile'),
          result: STMB_POPUP_RESULTS.SAVE_PROFILE,
          classes: ['menu_button', 'whitespacenowrap'],
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
    } else if (result === STMB_POPUP_RESULTS.SAVE_PROFILE) {
      return await handleSaveNewProfile(popup, settings);
    }

    return { confirmed: false };
  } catch (error) {
    return { confirmed: false };
  }
}

/**
 * Handle advanced options confirmation - Enhanced to handle dynamic button behavior
 */
async function handleAdvancedConfirmation(popup, settings) {
  const popupElement = popup.dlg;
  const selectedProfileIndex = Number(popupElement.querySelector('#stmb-profile-select-advanced').value);
  const customPrompt = popupElement.querySelector('#stmb-effective-prompt-advanced')?.value;
  const memoryCount = Number(popupElement.querySelector('#stmb-context-memories-advanced').value);
  const overrideSettings = popupElement.querySelector('#stmb-override-settings-advanced')?.checked || false;

  // Check if settings should be saved as new profile (when button text indicates it)
  const createButton = popup.dlg.querySelector('.popup_button_ok');
  const shouldSaveProfile = createButton?.dataset.shouldSave === 'true';

  if (shouldSaveProfile) {
    const newProfileName = popupElement.querySelector('#stmb-new-profile-name-advanced').value.trim();
    if (newProfileName) {
      try {
        await saveNewProfileFromAdvancedSettings(popupElement, settings, newProfileName);
        toastr.success(tr('STMemoryBooks_Toast_ProfileSaved', 'Profile "{{name}}" saved successfully', { name: newProfileName }), translate('STMemoryBooks', 'confirmationPopup.toast.title'));
      } catch (error) {
        console.error(translate(`${MODULE_NAME}: Failed to save profile:`, 'confirmationPopup.log.saveFailed'), error);
        toastr.error(tr('STMemoryBooks_Toast_ProfileSaveFailed', 'Failed to save profile: {{message}}', { message: error.message }), translate('STMemoryBooks', 'confirmationPopup.toast.title'));
        // Continues with memory creation even if profile save fails
      }
    } else {
      // No profile name provided, show error and don't proceed
      console.error(translate(`${MODULE_NAME}: Profile creation cancelled - no name provided`, 'confirmationPopup.log.saveCancelledNoName'));
      toastr.error(translate('Please enter a profile name or use "Create Memory" to proceed without saving', 'STMemoryBooks_Toast_ProfileNameOrProceed'), translate('STMemoryBooks', 'confirmationPopup.toast.title'));
      return { confirmed: false };
    }
  }

  // Build effective profile settings
  const baseProfile = settings.profiles[selectedProfileIndex];
  const profileSettings = {
    ...baseProfile,
    prompt: customPrompt || baseProfile.prompt,
    effectiveConnection: { ...baseProfile.connection } // Start with a copy of base connection
  };

  // Determine effective connection settings
  if (overrideSettings) {
    const currentSettings = getUIModelSettings();
    const currentApiInfo = getCurrentApiInfo();

    if (currentApiInfo.api) {
      profileSettings.effectiveConnection.api = currentApiInfo.api; // Override API
    }
    if (currentSettings.model) {
      profileSettings.effectiveConnection.model = currentSettings.model; // Override Model
    }
    if (typeof currentSettings.temperature === 'number') {
      profileSettings.effectiveConnection.temperature = currentSettings.temperature; // Override Temp
    }
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
    console.error(translate(`${MODULE_NAME}: Profile name validation failed - empty name`, 'confirmationPopup.log.validationFailedEmptyName'));
    toastr.error(translate('Please enter a profile name', 'STMemoryBooks_Toast_ProfileNameRequired'), translate('STMemoryBooks', 'confirmationPopup.toast.title'));
    return { confirmed: false };
  }

  await saveNewProfileFromAdvancedSettings(popup.dlg, settings, newProfileName);
  toastr.success(tr('STMemoryBooks_Toast_ProfileSaved', 'Profile "{{name}}" saved successfully', { name: newProfileName }), translate('STMemoryBooks', 'confirmationPopup.toast.title'));
  return { confirmed: false }; // Don't create memory, just save profile
}

/**
 * Setup event listeners for advanced options popup - Enhanced with dynamic button text
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

  // Function to check if settings have changed and update button text
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

    // Update button text based on whether settings have changed
    const createButton = popup.dlg.querySelector('.popup_button_ok');
    if (createButton) {
      if (hasChanges) {
        createButton.textContent = translate('Save Profile & Create Memory', 'STMemoryBooks_SaveProfileAndCreateMemory');
        createButton.title = translate('Save the modified settings as a new profile and create the memory', 'STMemoryBooks_Tooltip_SaveProfileAndCreateMemory');
        createButton.dataset.shouldSave = 'true';
      } else {
        createButton.textContent = translate('Create Memory', 'STMemoryBooks_CreateMemory');
        createButton.title = translate('Create memory using the selected profile settings', 'STMemoryBooks_Tooltip_CreateMemory');
        createButton.dataset.shouldSave = 'false';
      }
    }

    if (hasChanges) {
      saveSection.style.display = 'block';
    } else {
      saveSection.style.display = 'none';
    }
  };

  // Add change listeners with immediate button text update
  popupElement.querySelector('#stmb-effective-prompt-advanced')?.addEventListener('input', checkForChanges);
  popupElement.querySelector('#stmb-context-memories-advanced')?.addEventListener('change', checkForChanges);
  popupElement.querySelector('#stmb-override-settings-advanced')?.addEventListener('change', checkForChanges);
  popupElement.querySelector('#stmb-profile-select-advanced')?.addEventListener('change', async (e) => {
    const newProfileIndex = parseInt(e.target.value);
    const newProfile = settings.profiles[newProfileIndex];

    // Update effective prompt
    const newEffectivePrompt = await getEffectivePrompt(newProfile);
    popupElement.querySelector('#stmb-effective-prompt-advanced').value = newEffectivePrompt;

    // Update profile settings display
    const profileModelDisplay = popupElement.querySelector('#stmb-profile-model-display');
    const profileTempDisplay = popupElement.querySelector('#stmb-profile-temp-display');

    if (profileModelDisplay) {
      profileModelDisplay.textContent = newProfile.connection?.model || translate('Current SillyTavern model', 'STMemoryBooks_Label_CurrentSTModel');
    }
    if (profileTempDisplay) {
      profileTempDisplay.textContent = newProfile.connection?.temperature !== undefined ?
        newProfile.connection.temperature : translate('Current SillyTavern temperature', 'STMemoryBooks_Label_CurrentSTTemperature');
    }

    // Update original settings for comparison
    originalSettings.prompt = newEffectivePrompt;
    originalSettings.profileIndex = newProfileIndex;
    checkForChanges();
  });

  // Enhanced token estimation with context memories
  setupTokenEstimation(popupElement, sceneData, settings, chat_metadata, checkForChanges);

  // Initial button text check
  checkForChanges();
}

/**
 * Setup token estimation functionality
 */
function setupTokenEstimation(popupElement, sceneData, settings, chat_metadata, checkForChanges) {
  const summaryCountSelect = popupElement.querySelector('#stmb-context-memories-advanced');
  const totalTokensDisplay = popupElement.querySelector('#stmb-total-tokens-display');
  const tokenWarning = popupElement.querySelector('#stmb-token-warning-advanced');
  const tokenThreshold = settings.moduleSettings.tokenWarningThreshold ?? 50000;

  if (summaryCountSelect && totalTokensDisplay) {
    let cachedMemories = {}; // Cache fetched memories

    const updateTokenEstimate = async () => {
      const memoryCount = Number(summaryCountSelect.value);

      if (memoryCount === 0) {
        totalTokensDisplay.textContent = tr('STMemoryBooks_Label_TotalTokens', 'Total tokens: {{count}}', { count: sceneData.estimatedTokens });
        if (tokenWarning) {
          tokenWarning.style.display = sceneData.estimatedTokens > tokenThreshold ? 'block' : 'none';
        }
        return;
      }

      // Fetch actual memories for accurate token calculation
      if (!cachedMemories[memoryCount]) {
        totalTokensDisplay.textContent = translate('Total tokens: Calculating...', 'STMemoryBooks_Label_TotalTokensCalculating');

        const memoryFetchResult = await fetchPreviousSummaries(memoryCount, settings, chat_metadata);
        cachedMemories[memoryCount] = memoryFetchResult.summaries;
      }

      const memories = cachedMemories[memoryCount];
      const totalTokens = await calculateTokensWithContext(sceneData, memories);
      totalTokensDisplay.textContent = tr('STMemoryBooks_Label_TotalTokens', 'Total tokens: {{count}}', { count: totalTokens });

      // Update warning visibility
      if (tokenWarning) {
        if (totalTokens > tokenThreshold) {
          tokenWarning.style.display = 'block';
          tokenWarning.querySelector('span').textContent =
            tr('STMemoryBooks_Warn_LargeSceneTokens', '⚠️ Large scene ({{tokens}} tokens) may take some time to process.', { tokens: totalTokens });
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
  const selectedProfileIndex = parseInt(popupElement.querySelector('#stmb-profile-select-advanced')?.value || settings.defaultProfile);
  const baseProfile = settings.profiles[selectedProfileIndex];

  // Step 1: Gather base data from the form and the selected profile.
  const data = {
    name: profileName,
    prompt: popupElement.querySelector('#stmb-effective-prompt-advanced')?.value,
    api: baseProfile.connection?.api,
    model: baseProfile.connection?.model,
    temperature: baseProfile.connection?.temperature,
    preset: baseProfile.preset,
    titleFormat: baseProfile.titleFormat || settings.titleFormat,
  };

  // Step 2: If overriding, update the data with current SillyTavern settings.
  const overrideSettings = popupElement.querySelector('#stmb-override-settings-advanced')?.checked || false;
  if (overrideSettings) {
    const currentSettings = getUIModelSettings();
    const currentApiInfo = getCurrentApiInfo();

    data.api = currentApiInfo.api;
    data.model = currentSettings.model;
    data.temperature = currentSettings.temperature;
  }

  // Step 3: Call the centralized function to create the final profile object.
  const newProfile = createProfileObject(data);

  // Ensure the final profile name is unique before saving.
  const existingNames = settings.profiles.map(p => p.name);
  newProfile.name = generateSafeProfileName(newProfile.name, existingNames);

  settings.profiles.push(newProfile);
  saveSettingsDebounced();
}

/**
 * Fetch previous summaries using the flag-based identification
 * @param {number} count - Number of summaries to fetch
 * @param {Object} settings - Extension settings (titleFormat no longer needed)
 * @param {Object} chat_metadata - Chat metadata for lorebook access
 * @returns {Promise<Object>} Summaries result
 */
export async function fetchPreviousSummaries(count, settings, chat_metadata) {
  if (count <= 0) {
    return { summaries: [], actualCount: 0, requestedCount: 0 };
  }

  try {
    const lorebookName = await getEffectiveLorebookName();
    if (!lorebookName) {
      return { summaries: [], actualCount: 0, requestedCount: count };
    }

    const lorebookData = await loadWorldInfo(lorebookName);
    if (!lorebookData) {
      return { summaries: [], actualCount: 0, requestedCount: count };
    }

    // Use flag-based identification - no titleFormat needed
    const memoryEntries = identifyMemoryEntries(lorebookData);

    // Return the last N summaries (most recent ones)
    const recentSummaries = memoryEntries.slice(-count);
    const actualCount = recentSummaries.length;

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

    return baseTokens + contextTokens;
  }

  return baseTokens;
}

/**
 * Get available memories count from lorebook using flag-based identification
 * @param {Object} settings - Extension settings (titleFormat no longer needed)
 * @param {Object} chat_metadata - Chat metadata for lorebook access
 * @returns {Promise<number>} Number of available memories
 */
async function getAvailableMemoriesCount(settings, chat_metadata) {
  try {
    const lorebookName = await getEffectiveLorebookName();
    if (!lorebookName) {
      return 0;
    }

    const lorebookData = await loadWorldInfo(lorebookName);
    if (!lorebookData) {
      return 0;
    }

    // Use flag-based identification - no titleFormat needed
    const memoryEntries = identifyMemoryEntries(lorebookData);

    return memoryEntries.length;
  } catch (error) {
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
      tr('STMemoryBooks_Prompt_SaveAsNewProfileConfirm', 'Save current settings as new profile "{{name}}"?', { name: profileName }),
      POPUP_TYPE.CONFIRM,
      ''
    ).show();
    return result === POPUP_RESULT.AFFIRMATIVE;
  } catch (error) {
    return false;
  }
}

/**
 * Show memory preview popup that allows user to review and edit memory before saving
 * @param {Object} memoryResult - The generated memory result containing content, title, and keywords
 * @param {Object} sceneData - Scene information for context
 * @param {Object} profileSettings - Profile settings used for generation
 * @returns {Promise<Object>} Result object with action and optional edited memory data
 */
export async function showMemoryPreviewPopup(memoryResult, sceneData, profileSettings, options = {}) {
  try {
    // Input validation
    if (!memoryResult || typeof memoryResult !== 'object') {
      console.error(translate(`${MODULE_NAME}: Invalid memoryResult passed to showMemoryPreviewPopup`, 'confirmationPopup.log.invalidMemoryResult'));
      return { action: 'cancel' };
    }

    if (!sceneData || typeof sceneData !== 'object') {
      console.error(translate(`${MODULE_NAME}: Invalid sceneData passed to showMemoryPreviewPopup`, 'confirmationPopup.log.invalidSceneData'));
      return { action: 'cancel' };
    }

    if (!profileSettings || typeof profileSettings !== 'object') {
      console.error(translate(`${MODULE_NAME}: Invalid profileSettings passed to showMemoryPreviewPopup`, 'confirmationPopup.log.invalidProfileSettings'));
      return { action: 'cancel' };
    }

    // Validate required sceneData properties
    if (typeof sceneData.sceneStart !== 'number' ||
      typeof sceneData.sceneEnd !== 'number' ||
      typeof sceneData.messageCount !== 'number') {
      console.error(translate(`${MODULE_NAME}: sceneData missing required numeric properties`, 'confirmationPopup.log.sceneDataMissingProps'));
      return { action: 'cancel' };
    }

    // Helper function to safely convert keywords to string
    const keywordsToString = (keywords) => {
      if (Array.isArray(keywords)) {
        return keywords.filter(k => k && typeof k === 'string').join(', ');
      } else if (typeof keywords === 'string') {
        return keywords.trim();
      } else {
        return '';
      }
    };

    // Prepare template data
    const templateData = {
      title: memoryResult.extractedTitle || translate('Memory', 'addlore.defaults.title'),
      content: memoryResult.content || '',
      keywordsText: keywordsToString(memoryResult.suggestedKeys),
      sceneStart: sceneData.sceneStart,
      sceneEnd: sceneData.sceneEnd,
      messageCount: sceneData.messageCount,
      titleReadonly: !!options.lockTitle,
      profileName: (profileSettings?.isBuiltinCurrentST)
        ? translate('Current SillyTavern Settings', 'STMemoryBooks_Profile_CurrentST')
        : (profileSettings.name || translate('Unknown Profile', 'STMemoryBooks_UnknownProfile'))
    };

    const content = DOMPurify.sanitize(memoryPreviewTemplate(templateData));

    // Play notification sound when popup appears
    safePlayMessageSound();

    const popup = new Popup(content, POPUP_TYPE.TEXT, '', {
      okButton: translate('Edit & Save', 'STMemoryBooks_EditAndSave'),
      cancelButton: translate('Cancel', 'STMemoryBooks_Cancel'),
      allowVerticalScrolling: true,
      wide: true,
      customButtons: [
        {
          text: translate('Retry Generation', 'STMemoryBooks_RetryGeneration'),
          result: STMB_POPUP_RESULTS.RETRY,
          classes: ['menu_button', 'whitespacenowrap'],
          action: null
        }
      ]
    });

    const result = await popup.show();

    switch (result) {
      case POPUP_RESULT.AFFIRMATIVE:
      case STMB_POPUP_RESULTS.EDIT:
        // User wants to edit and save
        const popupElement = popup.dlg;

        // Check if popup element is still available
        if (!popupElement) {
          console.error(translate(`${MODULE_NAME}: Popup element not available for reading edited values`, 'confirmationPopup.log.popupNotAvailable'));
          toastr.error(translate('Unable to read edited values', 'STMemoryBooks_Toast_UnableToReadEditedValues'), translate('STMemoryBooks', 'confirmationPopup.toast.title'));
          return { action: 'cancel' };
        }

        // Safely extract values with null checks
        const titleElement = popupElement.querySelector('#stmb-preview-title');
        const contentElement = popupElement.querySelector('#stmb-preview-content');
        const keywordsElement = popupElement.querySelector('#stmb-preview-keywords');

        if (!titleElement || !contentElement || !keywordsElement) {
          console.error(translate(`${MODULE_NAME}: Required input elements not found in popup`, 'confirmationPopup.log.inputsNotFound'));
          toastr.error(translate('Unable to find input fields', 'STMemoryBooks_Toast_UnableToFindInputFields'), translate('STMemoryBooks', 'confirmationPopup.toast.title'));
          return { action: 'cancel' };
        }

        let editedTitle = titleElement.value?.trim() || '';
        const editedContent = contentElement.value?.trim() || '';
        const editedKeywordsText = keywordsElement.value?.trim() || '';

        // If title is locked for side prompts, ignore any user edits and keep the original
        if (options?.lockTitle) {
          editedTitle = memoryResult.extractedTitle || editedTitle;
        }

        // Validate required fields
        if (!editedTitle || editedTitle.length === 0) {
          console.error(translate(`${MODULE_NAME}: Memory title validation failed - empty title`, 'confirmationPopup.log.titleValidationFailed'));
          toastr.error(translate('Memory title cannot be empty', 'STMemoryBooks_Toast_TitleCannotBeEmpty'), translate('STMemoryBooks', 'confirmationPopup.toast.title'));
          return { action: 'cancel' };
        }

        if (!editedContent || editedContent.length === 0) {
          console.error(translate(`${MODULE_NAME}: Memory content validation failed - empty content`, 'confirmationPopup.log.contentValidationFailed'));
          toastr.error(translate('Memory content cannot be empty', 'STMemoryBooks_Toast_ContentCannotBeEmpty'), translate('STMemoryBooks', 'confirmationPopup.toast.title'));
          return { action: 'cancel' };
        }

        // Parse keywords back to array with robust handling
        const parseKeywordsToArray = (keywordText) => {
          if (!keywordText || typeof keywordText !== 'string') {
            return [];
          }
          return keywordText
            .split(',')
            .map(k => k.trim())
            .filter(k => k.length > 0 && typeof k === 'string');
        };

        const editedKeywords = parseKeywordsToArray(editedKeywordsText);

        // Preserve all original memoryResult fields and only override the user-edited ones
        const editedMemoryResult = {
          ...memoryResult,  // This preserves metadata, titleFormat, lorebookSettings, etc.
          extractedTitle: editedTitle,
          content: editedContent,
          suggestedKeys: editedKeywords
        };

        return {
          action: 'edit',
          memoryData: editedMemoryResult
        };
      case STMB_POPUP_RESULTS.RETRY:
        return {
          action: 'retry'
        };
      default:
        return {
          action: 'cancel'
        };
    }

  } catch (error) {
    console.error(translate(`${MODULE_NAME}: Error showing memory preview popup:`, 'confirmationPopup.log.previewError'), error);
    return {
      action: 'cancel'
    };
  }
}
