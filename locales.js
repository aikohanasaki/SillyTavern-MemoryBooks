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

    // Prompt Manager
    'STMemoryBooks_PromptManager_Hint': '💡 When creating a new prompt, copy one of the other built-in prompts and then amend it. Don\'t change the "respond with JSON" instructions, 📕Memory Books uses that to process the returned result from the AI.',
    'STMemoryBooks_ExpandEditor': 'Expand the editor',
    'STMemoryBooks_ClearAndApply': 'Clear and Apply',
    'STMemoryBooks_Cancel': 'Cancel',
    'STMemoryBooks_Create': 'Create',
    'STMemoryBooks_Save': 'Save',
    'STMemoryBooks_Delete': 'Delete',

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

    // Slash Commands
    'STMemoryBooks_Slash_CreateMemory_Help': 'Create memory from marked scene',
    'STMemoryBooks_Slash_SceneMemory_Help': 'Set scene range and create memory (e.g., /scenememory 10-15)',
    'STMemoryBooks_Slash_SceneMemory_ArgRangeDesc': 'Message range (X-Y format)',
    'STMemoryBooks_Slash_NextMemory_Help': 'Create memory from end of last memory to current message',
    'STMemoryBooks_Slash_SidePrompt_Help': 'Run side prompt (no args opens picker). Usage: /sideprompt "Name" [X-Y]',
    'STMemoryBooks_Slash_SidePrompt_ArgDesc': 'Template name (quote if contains spaces), optionally followed by X-Y range'
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
