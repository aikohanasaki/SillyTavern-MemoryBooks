/**
 * Localization data for Memory Books extension
 * This file contains translation strings for the UI
 *
 * Usage: Import this and call addLocaleData() during extension initialization
 */

/**
 * Runtime JSON loader for locales that don't support JSON import assertions
 */
export async function loadLocaleJson(lang) {
    const alias = {
        // Chinese (both already match ST base)
        'zh': 'zh-cn',
        'zh_cn': 'zh-cn',
        'zh_tw': 'zh-tw',
        'zh.tw': 'zh-tw',
        'zh-cn': 'zh-cn',
        'zh-tw': 'zh-tw',
        'zh-CN': 'zh-cn',
        'zh-TW': 'zh-tw',

        // Japanese -> ja-jp
        'ja': 'ja-jp',
        'ja_jp': 'ja-jp',
        'ja-JP': 'ja-jp',
        'ja-jp': 'ja-jp',

        // Russian -> ru-ru
        'ru': 'ru-ru',
        'ru_ru': 'ru-ru',
        'ru-RU': 'ru-ru',
        'ru-ru': 'ru-ru',

        // Spanish -> es-es
        'es': 'es-es',
        'es-es': 'es-es',

        // Korean -> ko-kr
        'ko': 'ko-kr',
        'ko_kr': 'ko-kr',
        'ko-KR': 'ko-kr',
        'ko-kr': 'ko-kr',

        // Malay -> ms-my
        'ms': 'ms-my',
        'ms_my': 'ms-my',
        'ms-MY': 'ms-my',
        'ms-my': 'ms-my',

        // Indonesian -> id-id
        'id': 'id-id',
        'id_id': 'id-id',
        'id-ID': 'id-id',
        'id-id': 'id-id',

        // English -> en (use built-in locales.js, no JSON file)
        'en': 'en',
        'en_us': 'en',
        'en-US': 'en',
        'en-us': 'en',
        'en_gb': 'en',
        'en-GB': 'en',
        'en-gb': 'en',
    };
    const normalized = alias[lang] || lang;

    const paths = {
        'zh-cn': './locales/zh-cn.json',
        'zh-tw': './locales/zh-tw.json',
        'ja-jp': './locales/ja-jp.json',
        'ru-ru': './locales/ru-ru.json',
        'es-es': './locales/es-es.json',
        'ko-kr': './locales/ko-kr.json',
        'ms-my': './locales/ms-my.json',
        'id-id': './locales/id-id.json',
    };

    const rel = paths[normalized];
    if (!rel) return null;

    try {
        const res = await fetch(new URL(rel, import.meta.url));
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.warn('STMemoryBooks: Failed to load locale JSON for', normalized, e);
        return null;
    }
}
// import { localeData_fr } from './locales/fr-fr.js';
// import { localeData_es } from './locales/es-es.js';

/**
 * English (default) locale data
 */
export const localeData_en = {
    // Main Settings Header
    'STMemoryBooks_Settings': '📕 Memory Books Settings',

    // Scene Display
    'STMemoryBooks_CurrentScene': 'Current Scene:',
    'STMemoryBooks_Start': 'Start',
    'STMemoryBooks_End': 'End',
    'STMemoryBooks_Message': 'Message',
    'STMemoryBooks_Messages': 'Messages',
    'STMemoryBooks_EstimatedTokens': 'Estimated tokens',
    'STMemoryBooks_NoSceneMarkers': 'No scene markers set. Use the chevron buttons in chat messages to mark start (►) and end (◄) points.',

    // Memory Status
    'STMemoryBooks_MemoryStatus': 'Memory Status',
    'STMemoryBooks_ProcessedUpTo': 'Processed up to message',
    'STMemoryBooks_NoMemoriesProcessed': 'No memories have been processed for this chat yet',
    'STMemoryBooks_SinceVersion': '(since updating to version 3.6.2 or higher.)',
    'STMemoryBooks_AutoSummaryNote': 'Please note that Auto-Summary requires you to "prime" every chat with at least one manual memory. After that, summaries will be made automatically.',

    // Preferences Section
    'STMemoryBooks_Preferences': 'Preferences:',
    'STMemoryBooks_AlwaysUseDefault': 'Always use default profile (no confirmation prompt)',
    'STMemoryBooks_ShowMemoryPreviews': 'Show memory previews',
    'STMemoryBooks_ShowNotifications': 'Show notifications',
    'STMemoryBooks_UnhideBeforeMemory': 'Unhide hidden messages for memory generation (runs /unhide X-Y)',

    // Manual Mode
    'STMemoryBooks_EnableManualMode': 'Enable Manual Lorebook Mode',
    'STMemoryBooks_ManualModeDesc': 'When enabled, you must specify a lorebook for memories instead of using the one bound to the chat.',

    // Auto-Create Lorebook
    'STMemoryBooks_AutoCreateLorebook': 'Auto-create lorebook if none exists',
    'STMemoryBooks_AutoCreateLorebookDesc': 'When enabled, automatically creates and binds a lorebook to the chat if none exists.',
    'STMemoryBooks_LorebookNameTemplate': 'Lorebook Name Template:',
    'STMemoryBooks_LorebookNameTemplateDesc': 'Template for auto-created lorebook names. Supports {{char}}, {{user}}, {{chat}} placeholders.',
    'STMemoryBooks_LorebookNameTemplatePlaceholder': 'LTM - {{char}} - {{chat}}',

    // Lorebook Configuration
    'STMemoryBooks_CurrentLorebookConfig': 'Current Lorebook Configuration',
    'STMemoryBooks_Mode': 'Mode:',
    'STMemoryBooks_ActiveLorebook': 'Active Lorebook:',
    'STMemoryBooks_NoneSelected': 'None selected',
    'STMemoryBooks_UsingChatBound': 'Using chat-bound lorebook',
    'STMemoryBooks_NoChatBound': 'No chat-bound lorebook. Memories will require lorebook selection.',

    // Scene Options
    'STMemoryBooks_AllowSceneOverlap': 'Allow scene overlap',
    'STMemoryBooks_AllowSceneOverlapDesc': 'Check this box to skip checking for overlapping memories/scenes.',
    'STMemoryBooks_RefreshEditor': 'Refresh lorebook editor after adding memories',

    // Auto-Summary
    'STMemoryBooks_AutoSummaryEnabled': 'Auto-create memory summaries',
    'STMemoryBooks_AutoSummaryDesc': 'Automatically run /nextmemory after a specified number of messages.',
    'STMemoryBooks_AutoSummaryInterval': 'Auto-Summary Interval:',
    'STMemoryBooks_AutoSummaryIntervalDesc': 'Number of messages after which to automatically create a memory summary.',
    'STMemoryBooks_AutoSummaryBuffer': 'Auto-Summary Buffer:',
    'STMemoryBooks_AutoSummaryBufferDesc': 'Delay auto-summary by X messages (belated generation). Default 0, max 50.',
    'STMemoryBooks_DefaultInterval': '100',

    // Auto-Summary Popup and Messages
    'STMemoryBooks_AutoSummaryReadyTitle': 'Auto-Summary Ready',
    'STMemoryBooks_AutoSummaryNoAssignedLorebook': 'Auto-summary is enabled but there is no assigned lorebook for this chat.',
    'STMemoryBooks_AutoSummarySelectOrPostponeQuestion': 'Would you like to select a lorebook for memory storage, or postpone this auto-summary?',
    'STMemoryBooks_PostponeLabel': 'Postpone for how many messages?',
    'STMemoryBooks_Postpone10': '10 messages',
    'STMemoryBooks_Postpone20': '20 messages',
    'STMemoryBooks_Postpone30': '30 messages',
    'STMemoryBooks_Postpone40': '40 messages',
    'STMemoryBooks_Postpone50': '50 messages',
    'STMemoryBooks_Button_SelectLorebook': 'Select Lorebook',
    'STMemoryBooks_Button_Postpone': 'Postpone',
    'STMemoryBooks_Error_NoLorebookSelectedForAutoSummary': 'No lorebook selected for auto-summary.',
    'STMemoryBooks_Info_AutoSummaryPostponed': 'Auto-summary postponed for {{count}} messages.',
    'STMemoryBooks_Error_NoLorebookForAutoSummary': 'No lorebook available for auto-summary.',
    'STMemoryBooks_Error_SelectedLorebookNotFound': 'Selected lorebook "{{name}}" not found.',
    'STMemoryBooks_Error_FailedToLoadSelectedLorebook': 'Failed to load the selected lorebook.',

    // Memory Count Options
    'STMemoryBooks_DefaultMemoryCount': 'Default Previous Memories Count:',
    'STMemoryBooks_DefaultMemoryCountDesc': 'Default number of previous memories to include as context when creating new memories.',
    'STMemoryBooks_MemoryCount0': 'None (0 memories)',
    'STMemoryBooks_MemoryCount1': 'Last 1 memory',
    'STMemoryBooks_MemoryCount2': 'Last 2 memories',
    'STMemoryBooks_MemoryCount3': 'Last 3 memories',
    'STMemoryBooks_MemoryCount4': 'Last 4 memories',
    'STMemoryBooks_MemoryCount5': 'Last 5 memories',
    'STMemoryBooks_MemoryCount6': 'Last 6 memories',
    'STMemoryBooks_MemoryCount7': 'Last 7 memories',

    // Auto-Hide Options
    'STMemoryBooks_AutoHideMode': 'Auto-hide messages after adding memory:',
    'STMemoryBooks_AutoHideModeDesc': 'Choose what messages to automatically hide after creating a memory.',
    'STMemoryBooks_AutoHideNone': 'Do not auto-hide',
    'STMemoryBooks_AutoHideAll': 'Auto-hide all messages up to the last memory',
    'STMemoryBooks_AutoHideLast': 'Auto-hide only messages in the last memory',

    // Unhidden Count
    'STMemoryBooks_UnhiddenCount': 'Messages to leave unhidden:',
    'STMemoryBooks_UnhiddenCountDesc': 'Number of recent messages to leave visible when auto-hiding (0 = hide all up to scene end)',
    'STMemoryBooks_DefaultUnhidden': '0',

    // Token Warning
    'STMemoryBooks_TokenWarning': 'Token Warning Threshold:',
    'STMemoryBooks_TokenWarningDesc': 'Show confirmation dialog when estimated tokens exceed this threshold. Default: 30,000',
    'STMemoryBooks_DefaultTokenWarning': '30000',

    // Title Format
    'STMemoryBooks_TitleFormat': 'Memory Title Format:',
    'STMemoryBooks_CustomTitleFormat': 'Custom Title Format...',
    'STMemoryBooks_EnterCustomFormat': 'Enter custom format',
    'STMemoryBooks_TitleFormatDesc': 'Use [0], [00], [000] for auto-numbering. Available: {{title}}, {{scene}}, {{char}}, {{user}}, {{messages}}, {{profile}}, {{date}}, {{time}}',

    // Profiles
    'STMemoryBooks_Profiles': 'Memory Profiles:',
    'STMemoryBooks_Profile_CurrentST': 'Current SillyTavern Settings',
    'STMemoryBooks_Default': '(Default)',
    'STMemoryBooks_ProfileSettings': 'Profile Settings:',
    'STMemoryBooks_Provider': 'Provider',
    'STMemoryBooks_Model': 'Model',
    'STMemoryBooks_Temperature': 'Temperature',
    'STMemoryBooks_ViewPrompt': 'View Prompt',
    'STMemoryBooks_ProfileActions': 'Profile Actions:',
    'STMemoryBooks_extraFunctionButtons': 'Import/Export Profiles:',

    // Confirmation Popup
    'STMemoryBooks_CreateMemory': 'Create Memory',
    'STMemoryBooks_ScenePreview': 'Scene Preview:',
    'STMemoryBooks_UsingProfile': 'Using Profile',
    'STMemoryBooks_LargeSceneWarning': 'Large scene',
    'STMemoryBooks_MayTakeTime': 'may take some time to process.',
    'STMemoryBooks_AdvancedOptionsHint': 'Click "Advanced Options" to customize prompt, context memories, or API settings.',

    // Advanced Options Popup
    'STMemoryBooks_AdvancedOptions': 'Advanced Memory Options',
    'STMemoryBooks_SceneInformation': 'Scene Information:',
    'STMemoryBooks_Total': 'total',
    'STMemoryBooks_BaseTokens': 'Base tokens',
    'STMemoryBooks_TotalTokens': 'Total tokens',
    'STMemoryBooks_Profile': 'Profile',
    'STMemoryBooks_ChangeProfileDesc': 'Change the profile to use different base settings.',
    'STMemoryBooks_MemoryCreationPrompt': 'Memory Creation Prompt:',
    'STMemoryBooks_CustomizePromptDesc': 'Customize the prompt used to generate this memory.',
    'STMemoryBooks_MemoryPromptPlaceholder': 'Memory creation prompt',
    'STMemoryBooks_IncludePreviousMemories': 'Include Previous Memories as Context:',
    'STMemoryBooks_PreviousMemoriesDesc': 'Previous memories provide context for better continuity.',
    'STMemoryBooks_Found': 'Found',
    'STMemoryBooks_ExistingMemorySingular': 'existing memory in lorebook.',
    'STMemoryBooks_ExistingMemoriesPlural': 'existing memories in lorebook.',
    'STMemoryBooks_NoMemoriesFound': 'No existing memories found in lorebook.',

    // API Override
    'STMemoryBooks_APIOverride': 'API Override Settings:',
    'STMemoryBooks_CurrentSTSettings': 'Current SillyTavern Settings:',
    'STMemoryBooks_API': 'API',
    'STMemoryBooks_UseCurrentSettings': 'Use current SillyTavern settings instead of profile settings',
    'STMemoryBooks_OverrideDesc': 'Override the profile\'s model and temperature with your current SillyTavern settings.',
    'STMemoryBooks_SaveAsNewProfile': 'Save as New Profile:',
    'STMemoryBooks_ProfileName': 'Profile Name:',
    'STMemoryBooks_SaveProfileDesc': 'Your current settings differ from the selected profile. Save them as a new profile.',
    'STMemoryBooks_EnterProfileName': 'Enter new profile name',
    'STMemoryBooks_LargeSceneWarningShort': '⚠️ Large scene may take some time to process.',

    // Memory Preview
    'STMemoryBooks_MemoryPreview': '📖 Memory Preview',
    'STMemoryBooks_MemoryPreviewDesc': 'Review the generated memory below. You can edit the content while preserving the structure.',
    'STMemoryBooks_MemoryTitle': 'Memory Title:',
    'STMemoryBooks_MemoryTitlePlaceholder': 'Memory title',
    'STMemoryBooks_MemoryContent': 'Memory Content:',
    'STMemoryBooks_MemoryContentPlaceholder': 'Memory content',
    'STMemoryBooks_Keywords': 'Keywords:',
    'STMemoryBooks_KeywordsDesc': 'Separate keywords with commas',
    'STMemoryBooks_KeywordsPlaceholder': 'keyword1, keyword2, keyword3',
    'STMemoryBooks_UnknownProfile': 'Unknown Profile',

    // Prompt Manager
    'STMemoryBooks_PromptManager_Title': '🧩 Summary Prompt Manager',
    'STMemoryBooks_PromptManager_Desc': 'Manage your summary generation prompts. All presets are editable.',
    'STMemoryBooks_PromptManager_Search': 'Search presets...',
    'STMemoryBooks_PromptManager_DisplayName': 'Display Name',
    'STMemoryBooks_PromptManager_DateCreated': 'Date Created',
    'STMemoryBooks_PromptManager_New': '➕ New Preset',
    'STMemoryBooks_PromptManager_Edit': '✏️ Edit',
    'STMemoryBooks_PromptManager_Duplicate': '📋 Duplicate',
    'STMemoryBooks_PromptManager_Delete': '🗑️ Delete',
    'STMemoryBooks_PromptManager_Export': '📤 Export JSON',
    'STMemoryBooks_PromptManager_Import': '📥 Import JSON',
    'STMemoryBooks_PromptManager_ApplyToProfile': '✅ Apply to Selected Profile',
    'STMemoryBooks_PromptManager_NoPresets': 'No presets available',

    // Profile Editor - Preset management
    'STMemoryBooks_Profile_MemoryMethod': 'Memory Creation Method:',
    'STMemoryBooks_Profile_PresetSelectDesc': 'Choose a preset. Create and edit presets in the Summary Prompt Manager.',
    'STMemoryBooks_CustomPromptManaged': 'Custom prompts are now controlled by the Summary Prompt Manager.',
    'STMemoryBooks_OpenPromptManager': '🧩 Open Summary Prompt Manager',
    'STMemoryBooks_MoveToPreset': '📌 Move Current Custom Prompt to Preset',
    'STMemoryBooks_MoveToPresetConfirmTitle': 'Move to Preset',
    'STMemoryBooks_MoveToPresetConfirmDesc': 'Create a preset from this profile\'s custom prompt, set the preset on this profile, and clear the custom prompt?',

    // Side Prompts
    'STMemoryBooks_SidePrompts_Title': '🧩 Side Prompts',
    'STMemoryBooks_SidePrompts_Desc': 'Create and manage side prompts for trackers and other behind-the-scenes functions.',
    'STMemoryBooks_EditSidePrompt': 'Edit Side Prompt',
    'STMemoryBooks_ResponseFormatPlaceholder': 'Optional response format',
    'STMemoryBooks_PreviousMemoriesHelp': 'Number of previous memory entries to include before scene text (0 = none).',
    'STMemoryBooks_Name': 'Name',
    'STMemoryBooks_Key': 'Key',
    'STMemoryBooks_Enabled': 'Enabled',
    'STMemoryBooks_RunOnVisibleMessageInterval': 'Run on visible message interval',
    'STMemoryBooks_IntervalVisibleMessages': 'Interval (visible messages):',
    'STMemoryBooks_RunAutomaticallyAfterMemory': 'Run automatically after memory',
    'STMemoryBooks_AllowManualRunViaSideprompt': 'Allow manual run via /sideprompt',
    'STMemoryBooks_Triggers': 'Triggers',
    'STMemoryBooks_ResponseFormatOptional': 'Response Format (optional)',
    'STMemoryBooks_OrderValue': 'Order Value',
    'STMemoryBooks_PreviousMemoriesForContext': 'Previous memories for context',
    'STMemoryBooks_Overrides': 'Overrides',
    'STMemoryBooks_OverrideDefaultMemoryProfile': 'Override default memory profile',
    'STMemoryBooks_ConnectionProfile': 'Connection Profile',
    'STMemoryBooks_NewSidePrompt': 'New Side Prompt',
    'STMemoryBooks_MySidePromptPlaceholder': 'My Side Prompt',
    'STMemoryBooks_Actions': 'Actions',
    'STMemoryBooks_None': 'None',
    'STMemoryBooks_Edit': 'Edit',
    'STMemoryBooks_Duplicate': 'Duplicate',
    'STMemoryBooks_NoSidePromptsAvailable': 'No side prompts available.',
    'STMemoryBooks_SidePrompts_New': '➕ New',
    'STMemoryBooks_SidePrompts_ExportJSON': '📤 Export JSON',
    'STMemoryBooks_SidePrompts_ImportJSON': '📥 Import JSON',
    'STMemoryBooks_SidePrompts_RecreateBuiltIns': '♻️ Recreate Built-in Side Prompts',
    'STMemoryBooks_SidePrompts_RecreateTitle': 'Recreate Built-in Side Prompts',
    'STMemoryBooks_SidePrompts_RecreateWarning': 'This will overwrite the built-in Side Prompts (Plotpoints, Status, Cast of Characters, Assess) with the current locale versions. Custom/user-created prompts are not touched. This action cannot be undone.',
    'STMemoryBooks_SidePrompts_RecreateOk': 'Recreate',
    'STMemoryBooks_SidePrompts_RecreateSuccess': 'Recreated {{count}} built-in side prompts from current locale',
    'STMemoryBooks_SidePrompts_RecreateFailed': 'Failed to recreate built-in side prompts',
    'STMemoryBooks_SidePrompts_MaxConcurrentLabel': 'Max concurrent side prompts',
    'STMemoryBooks_SidePrompts_MaxConcurrentHelp': 'This controls how many side prompts can be running at one time. Lower this value if you have a slow connection or are running into rate limits. Default: 3',
    'STMemoryBooks_SidePromptCreated': 'SidePrompt "{{name}}" created.',
    'STMemoryBooks_FailedToCreateSidePrompt': 'Failed to create SidePrompt.',
    'STMemoryBooks_SidePromptDuplicated': 'SidePrompt "{{name}}" duplicated.',
    'STMemoryBooks_FailedToDuplicateSidePrompt': 'Failed to duplicate SidePrompt.',
    'STMemoryBooks_SidePromptDeleted': 'SidePrompt "{{name}}" deleted.',
    'STMemoryBooks_FailedToDeleteSidePrompt': 'Failed to delete SidePrompt.',
    'STMemoryBooks_SidePromptsExported': 'Side prompts exported.',
    'STMemoryBooks_FailedToExportSidePrompts': 'Failed to export side prompts.',
    'STMemoryBooks_ImportedSidePrompts': 'Imported {{count}} side prompts.',
    'STMemoryBooks_ImportedSidePromptsDetail': 'Imported side prompts: {{added}} added{{detail}}',
    'STMemoryBooks_ImportedSidePromptsRenamedDetail': ' ({{count}} renamed due to key conflicts)',
    'STMemoryBooks_FailedToImportSidePrompts': 'Failed to import side prompts.',
    'STMemoryBooks_DeleteSidePromptTitle': 'Delete Side Prompt',
    'STMemoryBooks_DeleteSidePromptConfirm': 'Are you sure you want to delete "{{name}}"?',
    'STMemoryBooks_NameEmptyKeepPrevious': 'Name was empty. Keeping previous name.',
    'STMemoryBooks_SidePrompts_NoNameProvidedUsingUntitled': 'No name provided. Using "Untitled Side Prompt".',

    // General / Menu
    'STMemoryBooks_MenuItem': 'Memory Books',
    'STMemoryBooks_Close': 'Close',
    'STMemoryBooks_NoMatches': 'No matches',

    // Side Prompt Picker
    'STMemoryBooks_RunSidePrompt': 'Run Side Prompt',
    'STMemoryBooks_SearchSidePrompts': 'Search side prompts...',

    // Badges
    'STMemoryBooks_Interval': 'Interval',
    'STMemoryBooks_AfterMemory': 'AfterMemory',
    'STMemoryBooks_Manual': 'Manual',
    'STMemoryBooks_AutomaticChatBound': 'Automatic (Chat-bound)',

    // Lorebook
    'STMemoryBooks_UsingChatBoundLorebook': 'Using chat-bound lorebook "<strong>{{lorebookName}}</strong>"',
    'STMemoryBooks_NoChatBoundLorebook': 'No chat-bound lorebook. Memories will require lorebook selection.',
    'STMemoryBooks_ManualLorebookSetupTitle': 'Manual Lorebook Setup',
    'STMemoryBooks_ManualLorebookSetupDesc1': 'You have a chat-bound lorebook "<strong>{{name}}</strong>".',
    'STMemoryBooks_ManualLorebookSetupDesc2': 'Would you like to use it for manual mode or select a different one?',
    'STMemoryBooks_UseChatBound': 'Use Chat-bound',
    'STMemoryBooks_SelectDifferent': 'Select Different',

    // Slash Commands
    'STMemoryBooks_SidePromptGuide': 'SidePrompt guide: Type a template name after the space to see suggestions. Usage: /sideprompt "Name" [X-Y]. Quote names with spaces.',
    'STMemoryBooks_MultipleMatches': 'Multiple matches: {{top}}{{more}}. Refine the name or use quotes. Usage: /sideprompt "Name" [X-Y]',

    // Prompt Manager
    'STMemoryBooks_ClearCustomPromptTitle': 'Clear Custom Prompt?',
    'STMemoryBooks_ClearCustomPromptDesc': 'This profile has a custom prompt. Clear it so the selected preset is used?',
    'STMemoryBooks_CreateNewPresetTitle': 'Create New Preset',
    'STMemoryBooks_DisplayNameTitle': 'Display Name:',
    'STMemoryBooks_MyCustomPreset': 'My Custom Preset',
    'STMemoryBooks_PromptTitle': 'Prompt:',
    'STMemoryBooks_EnterPromptPlaceholder': 'Enter your prompt here...',
    'STMemoryBooks_EditPresetTitle': 'Edit Preset',
    'STMemoryBooks_DeletePresetTitle': 'Delete Preset',
    'STMemoryBooks_DeletePresetConfirm': 'Are you sure you want to delete "{{name}}"?',
    'STMemoryBooks_NotSet': 'Not Set',
    'STMemoryBooks_ProfileNamePlaceholder': 'Profile name',
    'STMemoryBooks_ModelAndTempSettings': 'Model & Temperature Settings:',
    'STMemoryBooks_ModelHint': 'For model, copy-paste the exact model ID, eg. `gemini-2.5-pro`, `deepseek/deepseek-r1-0528:free`, `gpt-4o-mini-2024-07-18`, etc.',
    'STMemoryBooks_ModelPlaceholder': 'Paste model ID here',
    'STMemoryBooks_APIProvider': 'API/Provider:',
    'STMemoryBooks_CustomAPI': 'Custom API',
    'STMemoryBooks_FullManualConfig': 'Full Manual Configuration',
    'STMemoryBooks_TemperatureRange': 'Temperature (0.0 - 2.0):',
    'STMemoryBooks_TemperaturePlaceholder': 'DO NOT LEAVE BLANK! If unsure put 0.8.',
    'STMemoryBooks_APIEndpointURL': 'API Endpoint URL:',
    'STMemoryBooks_APIEndpointPlaceholder': 'https://api.example.com/v1/chat/completions',
    'STMemoryBooks_APIKey': 'API Key:',
    'STMemoryBooks_APIKeyPlaceholder': 'Enter your API key',
    'STMemoryBooks_LorebookEntrySettings': 'Lorebook Entry Settings',
    'STMemoryBooks_LorebookEntrySettingsDesc': 'These settings control how the generated memory is saved into the lorebook.',
    'STMemoryBooks_ActivationMode': 'Activation Mode:',
    'STMemoryBooks_ActivationModeDesc': '🔗 Vectorized is recommended for memories.',
    'STMemoryBooks_Vectorized': '🔗 Vectorized (Default)',
    'STMemoryBooks_Constant': '🔵 Constant',
    'STMemoryBooks_Normal': '🟢 Normal',
    'STMemoryBooks_InsertionPosition': 'Insertion Position:',
    'STMemoryBooks_InsertionPositionDesc': '↑Char is recommended. Aiko recommends memories never go lower than ↑AN.',
    'STMemoryBooks_CharUp': '↑Char',
    'STMemoryBooks_CharDown': '↓Char',
    'STMemoryBooks_ANUp': '↑AN',
    'STMemoryBooks_ANDown': '↓AN',
    'STMemoryBooks_EMUp': '↑EM',
    'STMemoryBooks_EMDown': '↓EM',
    'STMemoryBooks_InsertionOrder': 'Insertion Order:',
    'STMemoryBooks_AutoOrder': 'Auto (uses memory #)',
    'STMemoryBooks_ManualOrder': 'Manual',
    'STMemoryBooks_RecursionSettings': 'Recursion Settings:',
    'STMemoryBooks_PreventRecursion': 'Prevent Recursion',
    'STMemoryBooks_DelayUntilRecursion': 'Delay Until Recursion',
    'STMemoryBooks_RefreshPresets': '🔄 Refresh Presets',
	'STMemoryBooks_Button_CreateMemory': 'Create Memory',
	'STMemoryBooks_Button_AdvancedOptions': 'Advanced Options...',
	'STMemoryBooks_Button_SaveAsNewProfile': 'Save as New Profile',
	'STMemoryBooks_SaveProfileAndCreateMemory': 'Save Profile & Create Memory',
	'STMemoryBooks_Tooltip_SaveProfileAndCreateMemory': 'Save the modified settings as a new profile and create the memory',
	'STMemoryBooks_Tooltip_CreateMemory': 'Create memory using the selected profile settings',
	'STMemoryBooks_AcceptAndAddToLorebook': 'Accept & Add to Lorebook',
	'STMemoryBooks_EditAndSave': 'Edit & Save',
	'STMemoryBooks_RetryGeneration': 'Retry Generation',
    'STMemoryBooks_PromptManager_Hint': '💡 When creating a new prompt, copy one of the other built-in prompts and then amend it. Don\'t change the "respond with JSON" instructions, 📕Memory Books uses that to process the returned result from the AI.',
    'STMemoryBooks_ExpandEditor': 'Expand the editor',
    'STMemoryBooks_ClearAndApply': 'Clear and Apply',
    'STMemoryBooks_Cancel': 'Cancel',
    'STMemoryBooks_Create': 'Create',
    'STMemoryBooks_Save': 'Save',
    'STMemoryBooks_Delete': 'Delete',

    // Toasts
    'STMemoryBooks_Toast_ProfileSaved': 'Profile "{{name}}" saved successfully',
    'STMemoryBooks_Toast_ProfileSaveFailed': 'Failed to save profile: {{message}}',
    'STMemoryBooks_Toast_ProfileNameOrProceed': 'Please enter a profile name or use "Create Memory" to proceed without saving',
    'STMemoryBooks_Toast_ProfileNameRequired': 'Please enter a profile name',
    'STMemoryBooks_Toast_UnableToReadEditedValues': 'Unable to read edited values',
    'STMemoryBooks_Toast_UnableToFindInputFields': 'Unable to find input fields',
    'STMemoryBooks_Toast_TitleCannotBeEmpty': 'Memory title cannot be empty',
    'STMemoryBooks_Toast_ContentCannotBeEmpty': 'Memory content cannot be empty',

    // Side Prompts
    'STMemoryBooks_Toast_NoMemoryLorebookAssigned': 'No memory lorebook is assigned. Open Memory Books settings and select or bind a lorebook.',
    'STMemoryBooks_Error_NoMemoryLorebookAssigned': 'No memory lorebook assigned',
    'STMemoryBooks_Error_FailedToLoadLorebook': 'Failed to load lorebook',
    'STMemoryBooks_Toast_FailedToLoadLorebook': 'Failed to load the selected lorebook.',
    'STMemoryBooks_Toast_SidePromptFailed': 'SidePrompt "{{name}}" failed: {{message}}',
    'STMemoryBooks_Toast_FailedToUpdateSidePrompt': 'Failed to update sideprompt entry "{{name}}"',
    'STMemoryBooks_Toast_FailedToSaveWave': 'Failed to save SidePrompt updates for this wave',
    'STMemoryBooks_Toast_SidePromptsSucceeded': 'Side Prompts after memory: {{okCount}} succeeded. {{succeeded}}',
    'STMemoryBooks_Toast_SidePromptsPartiallyFailed': 'Side Prompts after memory: {{okCount}} succeeded, {{failCount}} failed. {{failed}}',
    'STMemoryBooks_Toast_SidePromptNameNotProvided': 'SidePrompt name not provided. Usage: /sideprompt "Name" [X-Y]',

    // Scene Manager
    'STMemoryBooks_Toast_SceneClearedStart': 'Scene cleared due to start marker deletion',
    'STMemoryBooks_Toast_SceneEndPointCleared': 'Scene end point cleared due to message deletion',
    'STMemoryBooks_Toast_SceneMarkersAdjusted': 'Scene markers adjusted due to message deletion.',
    'STMemoryBooks_MarkSceneStart': 'Mark Scene Start',
    'STMemoryBooks_MarkSceneEnd': 'Mark Scene End',

    // Settings Popup Buttons / Toasts
    'STMemoryBooks_CreateMemoryBtn': 'Create Memory',
    'STMemoryBooks_ClearSceneBtn': 'Clear Scene',
    'STMemoryBooks_NoSceneSelected': 'No scene selected. Make sure both start and end points are set.',

    // Runtime and Toasts (added)
    'STMemoryBooks_NoSceneMarkersToastr': 'No scene markers set. Use chevron buttons to mark start and end points first.',
    'STMemoryBooks_MissingRangeArgument': 'Missing range argument. Use: /scenememory X-Y (e.g., /scenememory 10-15)',
    'STMemoryBooks_InvalidFormat': 'Invalid format. Use: /scenememory X-Y (e.g., /scenememory 10-15)',
    'STMemoryBooks_InvalidMessageIDs': 'Invalid message IDs parsed. Use: /scenememory X-Y (e.g., /scenememory 10-15)',
    'STMemoryBooks_StartGreaterThanEnd': 'Start message cannot be greater than end message',
    'STMemoryBooks_MessageIDsOutOfRange': 'Message IDs out of range.',
    'STMemoryBooks_MessagesDoNotExist': 'One or more specified messages do not exist',
    'STMemoryBooks_SceneSet': 'Scene set.',
    'STMemoryBooks_MemoryAlreadyInProgress': 'Memory creation is already in progress',
    'STMemoryBooks_NoLorebookAvailable': 'No lorebook available.',
    'STMemoryBooks_NoMessagesToSummarize': 'There are no messages to summarize yet.',
    'STMemoryBooks_NoNewMessagesSinceLastMemory': 'No new messages since the last memory.',
    'STMemoryBooks_NextMemoryFailed': 'Failed to run /nextmemory.',
    'STMemoryBooks_OnlyNOfRequestedMemoriesAvailable': 'Only some of the requested memories are available',
    'STMemoryBooks_NoPreviousMemoriesFound': 'No previous memories found in lorebook',
    'STMemoryBooks_WorkingToast': 'Creating memory...',
    'STMemoryBooks_MaximumRetryAttemptsReached': 'Maximum retry attempts reached',
    'STMemoryBooks_RetryingMemoryGeneration': 'Retrying memory generation...',
    'STMemoryBooks_UnableToRetrieveEditedMemoryData': 'Unable to retrieve edited memory data',
    'STMemoryBooks_EditedMemoryDataIncomplete': 'Edited memory data is incomplete',
    'STMemoryBooks_MemoryCreatedSuccessfully': 'Memory created successfully!',
    'STMemoryBooks_MemoryCreationFailedWillRetry': 'Memory creation failed. Retrying...',
    'STMemoryBooks_SceneTooLarge': 'Scene is too large. Try selecting a smaller range.',
    'STMemoryBooks_AIFailedToGenerateValidMemory': 'AI failed to generate valid memory.',
    'STMemoryBooks_ProfileConfigurationError': 'Profile configuration error.',
    'STMemoryBooks_FailedToCreateMemory': 'Failed to create memory.',
    'STMemoryBooks_LoadingCharacterData': 'SillyTavern is still loading character data, please wait a few seconds and try again.',
    'STMemoryBooks_GroupChatDataUnavailable': 'Group chat data not available, please wait a few seconds and try again.',
    'STMemoryBooks_LorebookValidationError': 'Lorebook validation error',
    'STMemoryBooks_SceneOverlap': 'Scene overlaps with existing memory.',
    'STMemoryBooks_UnexpectedError': 'An unexpected error occurred.',

    // Manual lorebook and Profiles UI (added)
    'STMemoryBooks_ChangeManualLorebook': 'Change',
    'STMemoryBooks_SelectManualLorebook': 'Select',
    'STMemoryBooks_ManualLorebook': 'Manual Lorebook',
    'STMemoryBooks_FailedToSelectManualLorebook': 'Failed to select manual lorebook',
    'STMemoryBooks_ClearManualLorebook': 'Clear Manual Lorebook',
    'STMemoryBooks_ManualLorebookCleared': 'Manual lorebook cleared',
    'STMemoryBooks_FailedToClearManualLorebook': 'Failed to clear manual lorebook',
    'STMemoryBooks_SetAsDefault': 'Set as Default',
    'STMemoryBooks_SetAsDefaultProfileSuccess': '"{{name}}" is now the default profile.',
    'STMemoryBooks_EditProfile': 'Edit Profile',
    'STMemoryBooks_FailedToEditProfile': 'Failed to edit profile',
    'STMemoryBooks_NewProfile': 'New Profile',
    'STMemoryBooks_FailedToCreateProfile': 'Failed to create profile',
    'STMemoryBooks_DeleteProfile': 'Delete Profile',
    'STMemoryBooks_FailedToDeleteProfile': 'Failed to delete profile',
    'STMemoryBooks_ExportProfiles': 'Export Profiles',
    'STMemoryBooks_FailedToExportProfiles': 'Failed to export profiles',
    'STMemoryBooks_ImportProfiles': 'Import Profiles',
    'STMemoryBooks_SummaryPromptManager': 'Summary Prompt Manager',
    'STMemoryBooks_FailedToOpenSummaryPromptManager': 'Failed to open Summary Prompt Manager',
    'STMemoryBooks_SidePrompts': 'Side Prompts',
    'STMemoryBooks_FailedToOpenSidePrompts': 'Failed to open Side Prompts',
    'STMemoryBooks_SelectPresetFirst': 'Select a preset first',
    'STMemoryBooks_NoProfilesAvailable': 'No profiles available',
    'STMemoryBooks_SelectedProfileNotFound': 'Selected profile not found',
    'STMemoryBooks_PresetAppliedToProfile': 'Preset applied to profile',
    'STMemoryBooks_PromptCannotBeEmpty': 'Prompt cannot be empty',
    'STMemoryBooks_PresetCreatedSuccessfully': 'Preset created successfully',
    'STMemoryBooks_FailedToCreatePreset': 'Failed to create preset',
    'STMemoryBooks_PresetUpdatedSuccessfully': 'Preset updated successfully',
    'STMemoryBooks_FailedToEditPreset': 'Failed to edit preset',
    'STMemoryBooks_PresetDuplicatedSuccessfully': 'Preset duplicated successfully',
    'STMemoryBooks_FailedToDuplicatePreset': 'Failed to duplicate preset',
    'STMemoryBooks_PresetDeletedSuccessfully': 'Preset deleted successfully',
    'STMemoryBooks_PromptsExportedSuccessfully': 'Prompts exported successfully',
    'STMemoryBooks_PromptsImportedSuccessfully': 'Prompts imported successfully',
    'STMemoryBooks_FailedToImportPrompts': 'Failed to import prompts.',
    'STMemoryBooks_CreateMemoryButton': 'Create Memory',
    'STMemoryBooks_NoSceneSelectedMakeSure': 'No scene selected. Make sure both start and end points are set.',
    'STMemoryBooks_ClearSceneButton': 'Clear Scene',
    'STMemoryBooks_FailedToImportProfiles': 'Failed to import profiles',
    'STMemoryBooks_ManualLorebookSet': 'Manual lorebook set to "{{name}}"',
    'STMemoryBooks_PleaseSelectLorebookForManualMode': 'Please select a lorebook for manual mode',
    'STMemoryBooks_FailedToSaveSettings': 'Failed to save settings. Please try again.',
    'STMemoryBooks_FailedToInitializeChatMonitoring': 'STMemoryBooks: Failed to initialize chat monitoring. Please refresh the page.',
    'STMemoryBooks_Label_CurrentSTModel': 'Current SillyTavern model',
    'STMemoryBooks_Label_CurrentSTTemperature': 'Current SillyTavern temperature',
    'STMemoryBooks_Label_TotalTokens': 'Total tokens: {{count}}',
    'STMemoryBooks_Label_TotalTokensCalculating': 'Total tokens: Calculating...',
    'STMemoryBooks_Warn_LargeSceneTokens': '⚠️ Large scene ({{tokens}} tokens) may take some time to process.',
    'STMemoryBooks_ModifiedProfileName': '{{name}} - Modified',
	'STMemoryBooks_ProfileEditTitle': 'Edit Profile',
    'STMemoryBooks_CancelClose': 'Cancel/Close',
    'STMemoryBooks_InvalidProfileData': 'Invalid profile data',
    'STMemoryBooks_ProfileUpdatedSuccess': 'Profile updated successfully',
    'STMemoryBooks_NewProfileTitle': 'New Profile',
    'STMemoryBooks_ProfileCreatedSuccess': 'Profile created successfully',
    'STMemoryBooks_DeleteProfileConfirm': 'Delete profile "{{name}}"?',
    'STMemoryBooks_CannotDeleteLastProfile': 'Cannot delete the last profile',
    'STMemoryBooks_CannotDeleteDefaultProfile': 'Cannot delete the "Current SillyTavern Settings" profile - it is required for the extension to work',
    'STMemoryBooks_ProfileDeletedSuccess': 'Profile deleted successfully',
    'STMemoryBooks_ProfilesExportedSuccess': 'Profiles exported successfully',
    'STMemoryBooks_ImportErrorInvalidFormat': 'Invalid profile data format - missing profiles array',
    'STMemoryBooks_ImportErrorNoValidProfiles': 'No valid profiles found in import file',
    'STMemoryBooks_ImportSuccess': 'Imported {{importedCount}} profile{{plural}}',
    'STMemoryBooks_ImportSkipped': ' ({{skippedCount}} duplicate{{plural}} skipped)',
    'STMemoryBooks_ImportComplete': 'STMemoryBooks profile import completed',
    'STMemoryBooks_ImportNoNewProfiles': 'No new profiles imported - all profiles already exist',
    'STMemoryBooks_ImportFailed': 'Failed to import profiles: {{message}}',
    'STMemoryBooks_ImportReadError': 'Failed to read import file',
    'STMemoryBooks_PromptManagerNotFound': 'Prompt Manager button not found. Open main settings and try again.',
    'STMemoryBooks_PresetListRefreshed': 'Preset list refreshed',
    'STMemoryBooks_FailedToRefreshPresets': 'Failed to refresh presets',
    'STMemoryBooks_NoCustomPromptToMigrate': 'No custom prompt to migrate',
    'STMemoryBooks_CustomPromptMigrated': 'Preset created and selected. Remember to Save.',
    'STMemoryBooks_FailedToMigrateCustomPrompt': 'Failed to move custom prompt to preset',
	'STMemoryBooks_Toast_SidePromptUpdated': 'SidePrompt "{{name}}" updated.',
    'STMemoryBooks_Toast_SidePromptNotFound': 'SidePrompt template not found. Check name.',
    'STMemoryBooks_Toast_ManualRunDisabled': 'Manual run is disabled for this template. Enable "Allow manual run via /sideprompt" in the template settings.',
    'STMemoryBooks_Toast_NoMessagesAvailable': 'No messages available.',
    'STMemoryBooks_Toast_InvalidRangeFormat': 'Invalid range format. Use X-Y',
    'STMemoryBooks_Toast_InvalidMessageRange': 'Invalid message range for /sideprompt',
    'STMemoryBooks_Toast_FailedToCompileRange': 'Failed to compile the specified range',
    'STMemoryBooks_Toast_SidePromptRangeTip': 'Tip: You can run a specific range with /sideprompt "Name" X-Y (e.g., /sideprompt "Scoreboard" 100-120). Running without a range uses messages since the last checkpoint.',
    'STMemoryBooks_Toast_FailedToCompileMessages': 'Failed to compile messages for /sideprompt',
	'STMemoryBooks_Plotpoints': 'Plotpoints',
    'STMemoryBooks_PlotpointsPrompt': "Analyze the accompanying scene for plot threads, story arcs, and other narrative movements. The previous scenes are there to provide context. Generate a story thread report. If a report already exists in context, update it instead of recreating.",
    'STMemoryBooks_Status': 'Status',
    'STMemoryBooks_StatusPrompt': "Analyze all context (previous scenes, memories, lore, history, interactions) to generate a detailed analysis of {{user}} and {{char}} (including abbreviated !lovefactor and !lustfactor commands). Note: If there is a pre-existing !status report, update it, do not regurgitate it.",
    'STMemoryBooks_CastOfCharacters': 'Cast of Characters',
    'STMemoryBooks_CastOfCharactersPrompt': "You are a skilled reporter with a clear eye for judging the importance of NPCs to the plot. \nStep 1: Review the scene and either add or update plot-related NPCs to the NPC WHO'S WHO report. Please note that {{char}} and {{user}} are major characters and do NOT need to be included in this report.\nStep 2: This list should be kept in order of importance to the plot, so it may need to be reordered.\nStep 3: If your response would be more than 2000 tokens long, remove NPCs with the least impact to the plot.",
    'STMemoryBooks_Assess': 'Assess',
    'STMemoryBooks_AssessPrompt': "Assess the interaction between {{char}} and {{user}} to date. List all the information {{char}} has learned about {{user}} in a code block through observation, questioning, or drawing conclusions from interaction (similar to a mental \"note to self\"). If there is already a list, update it. Try to keep it token-efficient and compact, focused on the important things.",
    'STMemoryBooks_PlotpointsResponseFormat': "=== Plot Points ===\n(as of [point in the story when this analysis was done])\n\n[Overarching Plot Arc]\n(2-3 sentence summary of the superobjective or major plot)\n\n[Thread #1 Title]\n- Summary: (1 sentence)\n- Status: (active / on hold)\n- At Stake: (how resolution will affect the ongoing story)\n- Last Known: (location or time)\n- Key Characters: ...\n\n\n[Thread #2 Title]\n- Summary: (1 sentence)\n- Status: (active / on hold)\n- At Stake: (how resolution will affect the ongoing story)\n- Last Known: (location or time)\n- Key Characters: ...\n\n...\n\n-- Plot Hooks --\n- (new or potential plot hooks)\n\n-- Character Dynamics --\n- current status of {{user}}'s/{{char}}'s relationships with NPCs\n\n===End Plot Points===\n",
    'STMemoryBooks_StatusResponseFormat': "Follow this general format:\n\n## Witty Headline or Summary\n\n### AFFINITY (0-100, have some relationship with !lovefactor and !lustfactor)\n- Score with evidence\n- Recent changes \n- Supporting quotes\n- Anything else that might be illustrative of the current affinity\n\n### LOVEFACTOR and LUSTFACTOR\n(!lovefactor and !lustfactor reports go here)\n\n### RELATIONSHIP STATUS (negative = enemies, 0 = strangers, 100 = life partners)\n- Trust/boundaries/communication\n- Key events\n- Issues\n- Any other pertinent points\n\n### GOALS\n- Short/long-term objectives\n- Progress/obstacles\n- Growth areas\n- Any other pertinent points\n\n### ANALYSIS\n- Psychology/POV\n- Development/triggers\n- Story suggestions\n- Any other pertinent points\n\n### WRAP-UP\n- OOC Summary (1 paragraph)",
    'STMemoryBooks_CastOfCharactersResponseFormat': "===NPC WHO'S WHO===\n(In order of importance to the plot)\n\nPerson 1: 1-2 sentence desription\nPerson 2: 1-2 sentence desription\n===END NPC WHO'S WHO===",
    'STMemoryBooks_AssessResponseFormat': "Use this format: \n=== Things {{char}} has learned about {{user}} ===\n(detailed list, in {{char}}'s POV/tone of voice)\n===",
    'STMemoryBooks_FailedToSaveSidePrompts': 'Failed to save side prompts: {{status}} {{statusText}}',
    'STMemoryBooks_SidePromptsSaved': 'Side prompts saved successfully',
    'STMemoryBooks_MigratingSidePrompts': 'Migrating side prompts file from V1(type) to V2(triggers)',
    'STMemoryBooks_InvalidSidePromptsFile': 'Invalid side prompts file structure; recreating with built-ins',
    'STMemoryBooks_ErrorLoadingSidePrompts': 'Error loading side prompts; creating base doc',
    'STMemoryBooks_UntitledSidePrompt': 'Untitled Side Prompt',
    'STMemoryBooks_TemplateNotFound': 'Template "{{key}}" not found',
    'STMemoryBooks_CopyOfTemplate': '{{name}} (Copy)',
    'STMemoryBooks_InvalidSidePromptsJSON': 'Invalid side prompts file structure',
	'STMemoryBooks_ConverterTitle': 'STMemoryBooks Lorebook Converter (v3)',
    'STMemoryBooks_ConverterHeader': 'Lorebook Converter',
    'STMemoryBooks_ConverterDescription': 'This tool flags entries by adding `stmemorybooks: true`. An entry is converted only if it matches the title format, is <strong>not</strong> set to `"vectorized": false`, and has its `"position"` set to `0`.',
    'STMemoryBooks_ConverterSampleTitleLabel': 'Sample Title Format (Optional)',
    'STMemoryBooks_ConverterSampleTitlePlaceholder': 'e.g., 01 - My First Memory',
    'STMemoryBooks_ConverterSampleTitleDescription': 'The tool will find the first number and use it to create a pattern. If blank, it defaults to matching titles like "01 - title".',
    'STMemoryBooks_ConverterFileUploadLabel': 'Click or Drag to Upload Lorebook File',
    'STMemoryBooks_ConverterIncludeVectorizedLabel': 'Include 🔵 entries',
    'STMemoryBooks_ConverterIncludeVectorizedDescription': 'If enabled, entries with `vectorized: false` will also be included as memories.',
    'STMemoryBooks_ConverterConvertButton': 'Convert File',
    'STMemoryBooks_ConverterConversionComplete': 'Conversion complete!',
    'STMemoryBooks_ConverterDownloadLink': 'Download {{filename}}',
    'STMemoryBooks_ConverterErrorProcessingFile': 'Error processing file. Please ensure it is a valid JSON lorebook. Error: {{message}}',
    'STMemoryBooks_ConverterInvalidLorebookStructure': "Invalid lorebook structure: 'entries' object not found.",
    'STMemoryBooks_ConverterUsingDefaultRegex': 'Using default: {{regex}}',
    'STMemoryBooks_ConverterConversionStats': 'Conversion complete. Checked {{totalEntries}} entries and flagged {{memoriesConverted}} as memories.',

    // AddLore (addlore.js)
    'addlore.errors.invalidContent': 'Invalid memory result: missing content',
    'addlore.errors.invalidLorebookValidation': 'Invalid lorebook validation data',
    'addlore.errors.createEntryFailed': 'Failed to create new lorebook entry',
    'addlore.toast.added': 'Memory "{{entryTitle}}" added to "{{lorebookName}}"',
    'addlore.toast.addFailed': 'Failed to add memory: {{message}}',
    'addlore.toast.autohideInvalidRange': 'Auto-hide skipped: invalid scene range metadata',
    'addlore.toast.title': 'STMemoryBooks',
    'addlore.result.added': 'Memory successfully added to "{{lorebookName}}"',
    'addlore.result.addFailed': 'Failed to add memory to lorebook: {{message}}',
    'addlore.defaults.title': 'Memory',
    'addlore.defaults.scene': 'Scene {{range}}',
    'addlore.defaults.user': 'User',
    'addlore.sanitize.fallback': 'Auto Memory',
    'addlore.preview.error': 'Error: {{message}}',
    'addlore.preview.sampleTitle': 'Sample Memory Title',
    'addlore.preview.sampleProfile': 'Summary',
    'addlore.stats.errors.noBinding': 'No lorebook bound to chat',
    'addlore.stats.errors.loadFailed': 'Failed to load lorebook',
    'addlore.titleFormat.errors.nonEmpty': 'Title format must be a non-empty string',
    'addlore.titleFormat.warnings.sanitization': 'Title contains characters that will be removed during sanitization',
    'addlore.titleFormat.warnings.unknownPlaceholders': 'Unknown placeholders: {{placeholders}}',
    'addlore.titleFormat.warnings.invalidNumbering': 'Invalid numbering patterns: {{patterns}}. Use [0], [00], [000], (0), {0}, #0 etc.',
    'addlore.titleFormat.warnings.tooLong': 'Title format is very long and may be truncated',
    'addlore.upsert.errors.invalidArgs': 'Invalid arguments to upsertLorebookEntryByTitle',
    'addlore.upsert.errors.createFailed': 'Failed to create lorebook entry',
    'addlore.titleFormats.0': '[000] - {{title}} ({{profile}})',
    'addlore.titleFormats.1': '{{date}} [000] 🎬{{title}}, {{messages}} msgs',
    'addlore.titleFormats.2': '[000] {{date}} - {{char}} Memory',
    'addlore.titleFormats.3': '[00] - {{user}} & {{char}} {{scene}}',
    'addlore.titleFormats.4': '🧠 [000] ({{messages}} msgs)',
    'addlore.titleFormats.5': '📚 Memory #[000] - {{profile}} {{date}} {{time}}',
    'addlore.titleFormats.6': '[000] - {{scene}}: {{title}}',
    'addlore.titleFormats.7': '[000] - {{title}} ({{scene}})',
    'addlore.titleFormats.8': '[000] - {{title}}',

    'addlore.log.executingHideCommand': 'STMemoryBooks-AddLore: Executing hide command{{context}}: {{hideCommand}}',
    'addlore.warn.autohideSkippedInvalidRange': 'STMemoryBooks-AddLore: Auto-hide skipped - invalid scene range: "{{range}}"',
    'addlore.hideCommand.allComplete': 'all mode - complete',
    'addlore.hideCommand.allPartial': 'all mode - partial',
    'addlore.hideCommand.lastHideAll': 'last mode - hide all',
    'addlore.hideCommand.lastPartial': 'last mode - partial',
    'addlore.log.addFailed': 'STMemoryBooks-AddLore: Failed to add memory to lorebook:',
    'addlore.log.getStatsError': 'STMemoryBooks-AddLore: Error getting lorebook stats:',
    'addlore.log.updateHighestCalled': 'STMemoryBooks-AddLore: updateHighestMemoryProcessed called with:',
    'addlore.log.sceneRangeExtracted': 'STMemoryBooks-AddLore: sceneRange extracted:',
    'addlore.warn.noSceneRange': 'STMemoryBooks-AddLore: No scene range found in memory result, cannot update highest processed',
    'addlore.warn.invalidSceneRangeFormat': 'STMemoryBooks-AddLore: Invalid scene range format: {{range}}',
    'addlore.warn.invalidEndMessage': 'STMemoryBooks-AddLore: Invalid end message number: {{end}}',
    'addlore.warn.noSceneMarkers': 'STMemoryBooks-AddLore: Could not get scene markers to update highest processed',
    'addlore.log.setHighest': 'STMemoryBooks-AddLore: Set highest memory processed to message {{endMessage}}',
    'addlore.log.updateHighestError': 'STMemoryBooks-AddLore: Error updating highest memory processed:',
    'autocreate.log.creating': 'STMemoryBooks-AutoCreate: Auto-creating lorebook "{{name}}" for {{context}}',
    'autocreate.log.created': 'STMemoryBooks-AutoCreate: Successfully created and bound lorebook "{{name}}"',
    'autocreate.log.createFailed': 'STMemoryBooks-AutoCreate: Failed to create lorebook',
    'autocreate.log.createError': 'STMemoryBooks-AutoCreate: Error creating lorebook:',
    'autosummary.log.postponed': 'STMemoryBooks: Auto-summary postponed for {{count}} messages (until message {{until}})',
    'autosummary.log.skippedInProgress': 'STMemoryBooks: Auto-summary skipped - memory creation in progress',
    'autosummary.log.noPrevious': 'STMemoryBooks: No previous memories found - counting from start',
    'autosummary.log.sinceLast': 'STMemoryBooks: Messages since last memory ({{highestProcessed}}): {{count}}',
    'autosummary.log.triggerCheck': 'STMemoryBooks: Auto-summary trigger check: {{count}} >= {{required}}?',
    'autosummary.log.notTriggered': 'STMemoryBooks: Auto-summary not triggered - need {{needed}} more messages',
    'autosummary.log.postponedUntil': 'STMemoryBooks: Auto-summary postponed until message {{until}}',
    'autosummary.log.blocked': 'STMemoryBooks: Auto-summary blocked - lorebook validation failed: {{error}}',
    'autosummary.log.clearedPostpone': 'STMemoryBooks: Cleared auto-summary postpone flag',
    'autosummary.log.triggered': 'STMemoryBooks: Auto-summary triggered - creating memory for range {{start}}-{{end}}',
    'autosummary.log.triggerError': 'STMemoryBooks: Error in auto-summary trigger check:',
    'autosummary.log.messageReceivedSingle': 'STMemoryBooks: Message received (single chat) - auto-summary enabled, current count: {{count}}',
    'autosummary.log.messageReceivedGroup': 'STMemoryBooks: Message received in group chat - deferring to GROUP_WRAPPER_FINISHED',
    'autosummary.log.messageHandlerError': 'STMemoryBooks: Error in auto-summary message received handler:',
    'autosummary.log.groupFinished': 'STMemoryBooks: Group conversation finished - auto-summary enabled, current count: {{count}}',
    'autosummary.log.groupHandlerError': 'STMemoryBooks: Error in auto-summary group finished handler:',
    'autocreate.toast.title': 'STMemoryBooks',
    'autocreate.toast.createdBound': 'Created and bound lorebook "{{name}}"',
    'autocreate.errors.failedAutoCreate': 'Failed to auto-create lorebook.',
    'autocreate.errors.failedAutoCreateWithMessage': 'Failed to auto-create lorebook: {{message}}',
    'common.unknown': 'Unknown',

    // Chat Compile
    'chatcompile.errors.sceneMarkersRequired': 'Scene markers are required for compilation',
    'chatcompile.errors.startGreaterThanEnd': 'Start marker cannot be greater than end marker',
    'chatcompile.errors.outOfBounds': 'Scene markers ({{start}}-{{end}}) are out of chat bounds (0-{{max}})',
    'chatcompile.errors.noVisibleInRange': 'No visible messages found in range {{start}}-{{end}}. All messages may be hidden or missing.',

    'chatcompile.validation.errors.missingMetadata': 'Missing metadata object',
    'chatcompile.validation.errors.invalidMessagesArray': 'Missing or invalid messages array',
    'chatcompile.validation.warnings.noMessages': 'No messages in compiled scene',
    'chatcompile.validation.warnings.messageMissingId': 'Message at index {{index}} missing ID',
    'chatcompile.validation.warnings.messageMissingName': 'Message at index {{index}} missing speaker name',
    'chatcompile.validation.warnings.messageMissingContent': 'Message at index {{index}} missing content',
    'chatcompile.validation.warnings.veryLargeScene': 'Very large scene (>100 messages) - consider breaking into smaller segments',

    'chatcompile.readable.headerMetadata': '=== SCENE METADATA ===',
    'chatcompile.readable.range': 'Range: Messages {{start}}-{{end}}',
    'chatcompile.readable.chat': 'Chat: {{chatId}}',
    'chatcompile.readable.character': 'Character: {{name}}',
    'chatcompile.readable.compiled': 'Compiled: {{count}} messages',
    'chatcompile.readable.compiledAt': 'Compiled at: {{date}}',
    'chatcompile.readable.headerMessages': '=== SCENE MESSAGES ===',
    'chatcompile.readable.line': '[{{id}}] {{name}}: {{text}}',

    'chatcompile.defaults.user': 'User',

    'confirmationPopup.toast.title': 'STMemoryBooks',
    'confirmationPopup.log.saveFailed': 'STMemoryBooks-ConfirmationPopup: Failed to save profile:',
    'confirmationPopup.log.saveCancelledNoName': 'STMemoryBooks-ConfirmationPopup: Profile creation cancelled - no name provided',
    'confirmationPopup.log.validationFailedEmptyName': 'STMemoryBooks-ConfirmationPopup: Profile name validation failed - empty name',
    'confirmationPopup.log.invalidMemoryResult': 'STMemoryBooks-ConfirmationPopup: Invalid memoryResult passed to showMemoryPreviewPopup',
    'confirmationPopup.log.invalidSceneData': 'STMemoryBooks-ConfirmationPopup: Invalid sceneData passed to showMemoryPreviewPopup',
    'confirmationPopup.log.invalidProfileSettings': 'STMemoryBooks-ConfirmationPopup: Invalid profileSettings passed to showMemoryPreviewPopup',
    'confirmationPopup.log.sceneDataMissingProps': 'STMemoryBooks-ConfirmationPopup: sceneData missing required numeric properties',
    'confirmationPopup.log.popupNotAvailable': 'STMemoryBooks-ConfirmationPopup: Popup element not available for reading edited values',
    'confirmationPopup.log.inputsNotFound': 'STMemoryBooks-ConfirmationPopup: Required input elements not found in popup',
    'confirmationPopup.log.titleValidationFailed': 'STMemoryBooks-ConfirmationPopup: Memory title validation failed - empty title',
    'confirmationPopup.log.contentValidationFailed': 'STMemoryBooks-ConfirmationPopup: Memory content validation failed - empty content',
    'confirmationPopup.log.previewError': 'STMemoryBooks-ConfirmationPopup: Error showing memory preview popup:',

    'index.warn.getEffectivePromptAsync': 'STMemoryBooks: getEffectivePromptAsync fallback due to error:',
    'index.error.chatContainerNotFound': 'STMemoryBooks: Chat container not found. SillyTavern DOM structure may have changed.',
    'index.error.processingChatElements': 'STMemoryBooks: Error processing new chat elements:',
    'index.error.updatingButtonStates': 'STMemoryBooks: Error updating button states:',
    'index.log.chatObserverInitialized': 'STMemoryBooks: Chat observer initialized',
    'index.log.chatObserverDisconnected': 'STMemoryBooks: Chat observer disconnected',
    'index.log.chatChanged': 'STMemoryBooks: Chat changed - updating scene state',
    'index.error.processingMessagesAfterChange': 'STMemoryBooks: Error processing messages after chat change:',
    'index.log.foundOrphanedMarkers': 'STMemoryBooks: Found orphaned scene markers on chat load (start: {{start}}, end: {{end}})',
    'index.error.handleMessageReceived': 'STMemoryBooks: Error in handleMessageReceived:',
    'index.error.handleGroupWrapperFinished': 'STMemoryBooks: Error in handleGroupWrapperFinished:',
    'index.error.noSceneMarkersForCreate': 'STMemoryBooks: No scene markers set for createMemory command',
    'index.toast.title': 'STMemoryBooks',
    'index.error.nextMemoryFailed': 'STMemoryBooks: /nextmemory failed:',
    'index.warn.sidePromptCacheRefreshFailed': 'STMemoryBooks: side prompt cache refresh failed',
    'index.log.addedDynamicProfile': 'STMemoryBooks: Added dynamic profile for existing installation (migration to v3)',
    'index.log.removedStaticTitleFormat': 'STMemoryBooks: Removed static titleFormat from dynamic profile',
    'index.log.createdDynamicProfile': 'STMemoryBooks: Created dynamic profile for fresh installation',
    'index.log.appliedProfileFixes': 'STMemoryBooks: Applied profile fixes:',
    'index.warn.mutualExclusion': 'STMemoryBooks: Both manualModeEnabled and autoCreateLorebook were true - setting autoCreateLorebook to false',
    'index.log.migratingV2': 'STMemoryBooks: Migrating to JSON-based architecture (v2)',
    'index.log.updatingProfileToJSON': 'STMemoryBooks: Updating profile "{{name}}" to use JSON output',

    // Slash Commands
    'STMemoryBooks_Slash_CreateMemory_Help': 'Create memory from marked scene',
    'STMemoryBooks_Slash_SceneMemory_Help': 'Set scene range and create memory (e.g., /scenememory 10-15)',
    'STMemoryBooks_Slash_SceneMemory_ArgRangeDesc': 'Message range (X-Y format)',
    'STMemoryBooks_Slash_NextMemory_Help': 'Create memory from end of last memory to current message',
    'STMemoryBooks_Slash_SidePrompt_Help': 'Run side prompt (no args opens picker). Usage: /sideprompt "Name" [X-Y]',
    'STMemoryBooks_Slash_SidePrompt_ArgDesc': 'Template name (quote if contains spaces), optionally followed by X-Y range',

    // Built-in prompt templates (English fallback; localize in locales/*.json)
    'STMemoryBooks_Prompt_summary': `You are a talented summarist skilled at capturing scenes from stories comprehensively. Analyze the following roleplay scene and return a detailed memory as JSON.

You must respond with ONLY valid JSON in this exact format:
{
  "title": "Short scene title (1-3 words)",
  "content": "Detailed beat-by-beat summary in narrative prose...",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

For the content field, create a detailed beat-by-beat summary in narrative prose. First, note the dates/time. Then capture this scene accurately without losing ANY important information EXCEPT FOR [OOC] conversation/interaction. All [OOC] conversation/interaction is not useful for summaries.
This summary will go in a vectorized database, so include:
- All important story beats/events that happened
- Key interaction highlights and character developments
- Notable details, memorable quotes, and revelations
- Outcome and anything else important for future interactions between {{user}} and {{char}}
Capture ALL nuance without repeating verbatim. Make it comprehensive yet digestible.

For the keywords field, provide 10-30 specific, descriptive, relevant keywords for vectorized database retrieval. Do not use \`{{char}}\` or \`{{user}}\` as keywords.

Return ONLY the JSON, no other text.`,

    'STMemoryBooks_Prompt_summarize': `Analyze the following roleplay scene and return a structured summary as JSON.

You must respond with ONLY valid JSON in this exact format:
{
  "title": "Short scene title (1-3 words)",
  "content": "Detailed summary with markdown headers...",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

For the content field, create a detailed bullet-point summary using markdown with these headers (but skip and ignore all OOC conversation/interaction):
- **Timeline**: Day/time this scene covers.
- **Story Beats**: List all important plot events and story developments that occurred.
- **Key Interactions**: Describe the important character interactions, dialogue highlights, and relationship developments.
- **Notable Details**: Mention any important objects, settings, revelations, or details that might be relevant for future interactions.
- **Outcome**: Summarize the result, resolution, or state of affairs at the end of the scene.

For the keywords field, provide 10-30 specific, descriptive, relevant keywords that would help a vectorized database find this conversation again if something is mentioned. Do not use \`{{char}}\` or \`{{user}}\` as keywords.

Ensure you capture ALL important information - comprehensive detail is more important than brevity.

Return ONLY the JSON, no other text.`,

    'STMemoryBooks_Prompt_synopsis': `Analyze the following roleplay scene and return a comprehensive synopsis as JSON.

You must respond with ONLY valid JSON in this exact format:
{
  "title": "Short scene title (1-3 words)",
  "content": "Long detailed synopsis with markdown structure...",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

For the content field, create a long and detailed beat-by-beat summary using markdown structure. Capture the most recent scene accurately without losing ANY information. [OOC] conversation/interaction is not useful for summaries and should be ignored and excluded. Use this structure:
# [Scene Title]
**Timeline**: (day/time)
## Story Beats
- (List all important plot events and developments)
## Key Interactions
- (Detail all significant character interactions and dialogue)
## Notable Details
- (Include memorable quotes, revelations, objects, settings)
## Outcome
- (Describe results, resolutions, and final state)

Include EVERYTHING important for future interactions between {{user}} and {{char}}. Capture all nuance without regurgitating verbatim.

For the keywords field, provide 10-30 specific, descriptive, relevant keywords for vectorized database retrieval. Do not use \`{{char}}\` or \`{{user}}\` as keywords.

Return ONLY the JSON, no other text.`,

    'STMemoryBooks_Prompt_sumup': `Analyze the following roleplay scene and return a beat summary as JSON.

You must respond with ONLY valid JSON in this exact format:
{
  "title": "Short scene title (1-3 words)",
  "content": "Comprehensive beat summary...",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

For the content field, write a comprehensive beat summary that captures this scene completely. Format it as:
# Scene Summary - Day X - [Title]
First note the dates/time covered by the scene. Then narrate ALL important story beats/events that happened, key interaction highlights, notable details, memorable quotes, character developments, and outcome. Ensure no important information is lost. [OOC] conversation/interaction is not useful for summaries and should be ignored and excluded. 

For the keywords field, provide 10-30 specific, descriptive, relevant keywords that would help a vectorized database find this summary again if mentioned. Do not use \`{{char}}\` or \`{{user}}\` as keywords.

Return ONLY the JSON, no other text.`,

    'STMemoryBooks_Prompt_minimal': `Analyze the following roleplay scene and return a minimal memory entry as JSON.

You must respond with ONLY valid JSON in this exact format:
{
  "title": "Short scene title (1-3 words)",
  "content": "Brief 2-5 sentence summary...",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

For the content field, provide a very brief 2-5 sentence summary of what happened in this scene. [OOC] conversation/interaction is not useful for summaries and should be ignored and excluded.

For the keywords field, generate 10-30 specific, descriptive, highly relevant keywords for database retrieval - focus on the most important terms that would help find this scene later. Do not use \`{{char}}\` or \`{{user}}\` as keywords.

Return ONLY the JSON, no other text.`,

    'STMemoryBooks_Prompt_northgate': `You are a memory archivist for a long-form narrative. Your function is to analyze the provided scene and extract all pertinent information into a structured JSON object.

You must respond with ONLY valid JSON in this exact format:
{
"title": "Concise Scene Title (3-5 words)",
"content": "A detailed, literary summary of the scene written in a third-person, past-tense narrative style. Capture all key actions, emotional shifts, character development, and significant dialogue. Focus on "showing" what happened through concrete details. Ensure the summary is comprehensive enough to serve as a standalone record of the scene's events and their impact on the characters.",
"keywords": ["keyword1", "keyword2", "keyword3"]
}

For the "content" field, write with literary quality. Do not simply list events; synthesize them into a coherent narrative block.

For the "keywords" field, provide 10-15 specific and descriptive keywords that capture the scene's core elements. Include character names, locations, key objects, actions taken, and the emotional tone (e.g., "Tense Standoff," "Vulnerable Confession," "Strategic Planning," "Unexpected Alliance").

Return ONLY the JSON object, with no additional text or explanations.`,

    'STMemoryBooks_Prompt_aelemar': `You are a meticulous archivist, skilled at accurately capturing all key plot points and memories from a story. Analyze the following story scene and extract a detailed summary as JSON.

You must respond with ONLY valid JSON in this exact format:
{
  "title": "Concise scene title (3-5 words)",
  "content": "Detailed summary of key plot points and character memories, beat-by-beat in narrative prose...",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

For the content field, create a beat-by-beat summary in narrative prose. Capture all key plot points that advance the story and character memories that leave a lasting impression, ensuring nothing essential is omitted. This summary will go in a vectorized database, so include: 

- Story beats, events, actions and consequences, turning points, and outcomes
- Key character interactions, character developments, significant dialogue, revelations, emotional impact, and relationships
- Outcomes and anything else important for future interactions between the user and the world
Capture ALL nuance without repeating verbatim. Do not simply list events; synthesize them into a coherent narrative block. This summary must be comprehensive enough to serve as a standalone record of the story so far, even if the original text is lost. Use at least 300 words. Avoid redundancy.

For the keywords field, provide 10-20 specific and descriptive keywords that capture the scene's core elements. Include character names, identities, locations, key objects, actions taken, and the emotional tone (e.g., "Tense Standoff," "Vulnerable Confession," "Strategic Planning," "Unexpected Alliance"). Do not use \`{{char}}\` or \`{{user}}\` as keywords.

Return ONLY the JSON, no other text.`,

    'STMemoryBooks_Prompt_default': `Analyze the following chat scene and return a memory as JSON.

You must respond with ONLY valid JSON in this exact format:
{
  "title": "Short scene title (1-3 words)",
  "content": "Concise memory focusing on key plot points, character development, and important interactions",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}

Return ONLY the JSON, no other text.`,
    
    // Built-in preset display names (English defaults; can be localized in locales/*.json)
    'STMemoryBooks_DisplayName_summary': 'Summary - Detailed beat-by-beat summaries in narrative prose',
    'STMemoryBooks_DisplayName_summarize': 'Summarize - Bullet-point format',
    'STMemoryBooks_DisplayName_synopsis': 'Synopsis - Long and comprehensive (beats, interactions, details) with headings',
    'STMemoryBooks_DisplayName_sumup': 'Sum Up - Concise story beats in narrative prose',
    'STMemoryBooks_DisplayName_minimal': 'Minimal - Brief 1-2 sentence summary',
    'STMemoryBooks_DisplayName_northgate': 'Northgate - Intended for creative writing. By Northgate on ST Discord',
    'STMemoryBooks_DisplayName_aelemar': 'Aelemar - Focuses on plot points and character memories. By Aelemar on ST Discord',
    // Summary Prompt Manager - Recreate Built-ins
    'STMemoryBooks_PromptManager_RecreateBuiltins': '♻️ Recreate Built-in Prompts',
    'STMemoryBooks_RecreateBuiltinsTitle': 'Recreate Built-in Prompts',
    'STMemoryBooks_RecreateBuiltinsWarning': 'This will remove overrides for all built‑in presets (summary, summarize, synopsis, sumup, minimal, northgate, aelemar). Any customizations to these built-ins will be lost. After this, built-ins will follow the current app locale.',
    'STMemoryBooks_RecreateBuiltinsDoesNotAffectCustom': 'This does not affect your other custom presets.',
    'STMemoryBooks_RecreateBuiltinsOverwrite': 'Overwrite',
    'STMemoryBooks_RegexSelection_Title': '📐 Regex selection',
    'STMemoryBooks_RegexSelection_Desc': 'Selecting a regex here will run it REGARDLESS of whether it is enabled or disabled.',
    'STMemoryBooks_RegexSelection_Outgoing': 'Run regex before sending to AI',
    'STMemoryBooks_RegexSelection_Incoming': 'Run regex before adding to lorebook (before previews)',
    'STMemoryBooks_RegexSelect_PlaceholderOutgoing': 'Select outgoing regex…',
    'STMemoryBooks_RegexSelect_PlaceholderIncoming': 'Select incoming regex…',
    'STMemoryBooks_RegexSelectionsSaved': 'Regex selections saved',
    'STMemoryBooks_FailedToSaveRegexSelections': 'Failed to save regex selections',
    'STMemoryBooks_UseRegexAdvanced': 'Use regex (advanced)',
    'STMemoryBooks_ConfigureRegex': '📐 Configure regex…'
};
 
/**
 * All available locale data
 * Add more languages here as they become available
 */
export const localeData = {
    'en': localeData_en,
    // Add more locales here:
    // 'fr-fr': localeData_fr,
    // 'es-es': localeData_es,
    // etc.
};
