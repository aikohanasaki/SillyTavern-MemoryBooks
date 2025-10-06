/**
 * Localization data for Memory Books extension
 * This file contains translation strings for the UI
 *
 * Usage: Import this and call addLocaleData() during extension initialization
 */

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

    // Preferences Section
    'STMemoryBooks_Preferences': 'Preferences:',
    'STMemoryBooks_AlwaysUseDefault': 'Always use default profile (no confirmation prompt)',
    'STMemoryBooks_ShowMemoryPreviews': 'Show memory previews',
    'STMemoryBooks_ShowNotifications': 'Show notifications',

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
    'STMemoryBooks_DefaultInterval': '100',

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
    'STMemoryBooks_Default': '(Default)',
    'STMemoryBooks_ProfileSettings': 'Profile Settings:',
    'STMemoryBooks_Provider': 'Provider',
    'STMemoryBooks_Model': 'Model',
    'STMemoryBooks_Temperature': 'Temperature',
    'STMemoryBooks_ViewPrompt': 'View Prompt',
    'STMemoryBooks_ProfileActions': 'Profile Actions:',
    'STMemoryBooks_ImportExportProfiles': 'Import/Export Profiles:',

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
    'STMemoryBooks_MoveToPresetConfirmDesc': 'Create a preset from this profile\'s custom prompt, set the preset on this profile, and clear the custom prompt?'
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
