import { Handlebars } from '../../../../lib.js';

/**
 * Main settings template
 */
export const settingsTemplate = Handlebars.compile(`
    <h3 data-i18n="STMemoryBooks_Settings">📕 Memory Books Settings</h3>
        {{#if hasScene}}
        <div id="stmb-scene" class="padding10 marginBot10">
            <div class="marginBot5" data-i18n="STMemoryBooks_CurrentScene">Current Scene:</div>
            <div class="padding10 marginTop5 stmb-box">
                <pre><code id="stmb-scene-block"><span data-i18n="STMemoryBooks_Start">Start</span>: <span data-i18n="STMemoryBooks_Message">Message</span> #{{sceneData.sceneStart}} ({{sceneData.startSpeaker}})
{{sceneData.startExcerpt}}

<span data-i18n="STMemoryBooks_End">End</span>: <span data-i18n="STMemoryBooks_Message">Message</span> #{{sceneData.sceneEnd}} ({{sceneData.endSpeaker}})
{{sceneData.endExcerpt}}

<span data-i18n="STMemoryBooks_Messages">Messages</span>: {{sceneData.messageCount}} | <span data-i18n="STMemoryBooks_EstimatedTokens">Estimated tokens</span>: {{sceneData.estimatedTokens}}</code></pre>
            </div>
        </div>
        {{else}}
        <div class="info-block warning">
            <span data-i18n="STMemoryBooks_NoSceneMarkers">No scene markers set. Use the chevron buttons in chat messages to mark start (►) and end (◄) points.</span>
        </div>
        {{/if}}

        {{#if highestMemoryProcessed}}
        <div id="stmb-memory-status" class="info-block">
            <span>📊 <span data-i18n="STMemoryBooks_MemoryStatus">Memory Status</span>: <span data-i18n="STMemoryBooks_ProcessedUpTo">Processed up to message</span> #{{highestMemoryProcessed}}</span>
        </div>
        {{else}}
        <div id="stmb-memory-status" class="info-block">
            <span>📊 <span data-i18n="STMemoryBooks_MemoryStatus">Memory Status</span>: <span data-i18n="STMemoryBooks_NoMemoriesProcessed">No memories have been processed for this chat yet</span> <small data-i18n="STMemoryBooks_SinceVersion">(since updating to version 3.6.2 or higher.)</small></span>
            <br />
            <small data-i18n="STMemoryBooks_AutoSummaryNote">Please note that Auto-Summary requires you to "prime" every chat with at least one manual memory. After that, summaries will be made automatically.</small>
        </div>
        {{/if}}

        <h4 data-i18n="STMemoryBooks_Preferences">Preferences:</h4>

        <div class="world_entry_form_control">
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-always-use-default" {{#if alwaysUseDefault}}checked{{/if}}>
                <span data-i18n="STMemoryBooks_AlwaysUseDefault">Always use default profile (no confirmation prompt)</span>
            </label>
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-show-memory-previews" {{#if showMemoryPreviews}}checked{{/if}}>
                <span data-i18n="STMemoryBooks_ShowMemoryPreviews">Show memory previews</span>
            </label>
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-show-notifications" {{#if showNotifications}}checked{{/if}}>
                <span data-i18n="STMemoryBooks_ShowNotifications">Show notifications</span>
            </label>
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-unhide-before-memory" {{#if unhideBeforeMemory}}checked{{/if}}>
                <span data-i18n="STMemoryBooks_UnhideBeforeMemory">Unhide hidden messages for memory generation (runs /unhide X-Y)</span>
            </label>
        </div>

        <div class="world_entry_form_control">
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-manual-mode-enabled" {{#if manualModeEnabled}}checked{{/if}} {{#if autoCreateLorebook}}disabled{{/if}}>
                <span data-i18n="STMemoryBooks_EnableManualMode">Enable Manual Lorebook Mode</span>
            </label>
            <small class="opacity50p" data-i18n="STMemoryBooks_ManualModeDesc">When enabled, you must specify a lorebook for memories instead of using the one bound to the chat.</small>
        </div>

        <div class="world_entry_form_control">
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-auto-create-lorebook" {{#if autoCreateLorebook}}checked{{/if}} {{#if manualModeEnabled}}disabled{{/if}}>
                <span data-i18n="STMemoryBooks_AutoCreateLorebook">Auto-create lorebook if none exists</span>
            </label>
            <small class="opacity50p" data-i18n="STMemoryBooks_AutoCreateLorebookDesc">When enabled, automatically creates and binds a lorebook to the chat if none exists.</small>
        </div>

        <div class="world_entry_form_control">
            <label for="stmb-lorebook-name-template">
                <h4 data-i18n="STMemoryBooks_LorebookNameTemplate">Lorebook Name Template:</h4>
                <small class="opacity50p" data-i18n="STMemoryBooks_LorebookNameTemplateDesc">Template for auto-created lorebook names. Supports {{char}}, {{user}}, {{chat}} placeholders.</small>
                <input type="text" id="stmb-lorebook-name-template" class="text_pole"
                    value="{{lorebookNameTemplate}}" data-i18n="[placeholder]STMemoryBooks_LorebookNameTemplatePlaceholder"
                    placeholder="LTM - {{char}} - {{chat}}"
                    {{#unless autoCreateLorebook}}disabled{{/unless}}>
            </label>
        </div>

        <h4 data-i18n="STMemoryBooks_CurrentLorebookConfig">Current Lorebook Configuration</h4>

        <div class="info-block">
            <small class="opacity50p" data-i18n="STMemoryBooks_Mode">Mode:</small>
            <h5 id="stmb-mode-badge">{{lorebookMode}}</h5>

            <small class="opacity50p" data-i18n="STMemoryBooks_ActiveLorebook">Active Lorebook:</small>
            <h5 id="stmb-active-lorebook" class="{{#unless currentLorebookName}}opacity50p{{/unless}}">
                {{#if currentLorebookName}}
                    {{currentLorebookName}}
                {{else}}
                    <span data-i18n="STMemoryBooks_NoneSelected">None selected</span>
                {{/if}}
            </h5>

            <div id="stmb-manual-controls" style="display: {{#if manualModeEnabled}}block{{else}}none{{/if}};">
                <div class="buttons_block marginTop5 justifyCenter gap10px whitespacenowrap" id="stmb-manual-lorebook-buttons">
                    <!-- Manual lorebook buttons will be dynamically inserted here -->
                </div>
            </div>

            <div id="stmb-automatic-info" class="marginTop5" style="display: {{#if manualModeEnabled}}none{{else}}block{{/if}};">
                <small class="opacity50p">
                    {{#if chatBoundLorebookName}}
                        <span data-i18n="STMemoryBooks_UsingChatBound">Using chat-bound lorebook</span> "{{chatBoundLorebookName}}"
                    {{else}}
                        <span data-i18n="STMemoryBooks_NoChatBound">No chat-bound lorebook. Memories will require lorebook selection.</span>
                    {{/if}}
                </small>
            </div>
        </div>

        <hr class="marginTop10 marginBot10">

        <div class="world_entry_form_control">
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-allow-scene-overlap" {{#if allowSceneOverlap}}checked{{/if}}>
                <span data-i18n="STMemoryBooks_AllowSceneOverlap">Allow scene overlap</span>
            </label>
            <small class="opacity50p" data-i18n="STMemoryBooks_AllowSceneOverlapDesc">Check this box to skip checking for overlapping memories/scenes.</small>
        </div>

        <div class="world_entry_form_control">
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-refresh-editor" {{#if refreshEditor}}checked{{/if}}>
                <span data-i18n="STMemoryBooks_RefreshEditor">Refresh lorebook editor after adding memories</span>
            </label>
        </div>

        <div class="world_entry_form_control">
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-auto-summary-enabled" {{#if autoSummaryEnabled}}checked{{/if}}>
                <span data-i18n="STMemoryBooks_AutoSummaryEnabled">Auto-create memory summaries</span>
            </label>
            <small class="opacity50p" data-i18n="STMemoryBooks_AutoSummaryDesc">Automatically run /nextmemory after a specified number of messages.</small>            
        </div>

        <div class="world_entry_form_control">
            <label for="stmb-auto-summary-interval">
                <h4 data-i18n="STMemoryBooks_AutoSummaryInterval">Auto-Summary Interval:</h4>
                <small class="opacity50p" data-i18n="STMemoryBooks_AutoSummaryIntervalDesc">Number of messages after which to automatically create a memory summary.</small>
                <input type="number" id="stmb-auto-summary-interval" class="text_pole"
                    value="{{autoSummaryInterval}}" min="10" max="200" step="1"
                    data-i18n="[placeholder]STMemoryBooks_DefaultInterval" placeholder="100">
            </label>
        </div>

        <div class="world_entry_form_control">
            <label for="stmb-default-memory-count">
                <h4 data-i18n="STMemoryBooks_DefaultMemoryCount">Default Previous Memories Count:</h4>
                <small class="opacity50p" data-i18n="STMemoryBooks_DefaultMemoryCountDesc">Default number of previous memories to include as context when creating new memories.</small>
                <select id="stmb-default-memory-count" class="text_pole">
                    <option value="0" {{#if (eq defaultMemoryCount 0)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount0">None (0 memories)</option>
                    <option value="1" {{#if (eq defaultMemoryCount 1)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount1">Last 1 memory</option>
                    <option value="2" {{#if (eq defaultMemoryCount 2)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount2">Last 2 memories</option>
                    <option value="3" {{#if (eq defaultMemoryCount 3)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount3">Last 3 memories</option>
                    <option value="4" {{#if (eq defaultMemoryCount 4)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount4">Last 4 memories</option>
                    <option value="5" {{#if (eq defaultMemoryCount 5)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount5">Last 5 memories</option>
                    <option value="6" {{#if (eq defaultMemoryCount 6)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount6">Last 6 memories</option>
                    <option value="7" {{#if (eq defaultMemoryCount 7)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount7">Last 7 memories</option>
                </select>
            </label>
        </div>

        <div class="world_entry_form_control">
            <label for="stmb-auto-hide-mode">
                <h4 data-i18n="STMemoryBooks_AutoHideMode">Auto-hide messages after adding memory:</h4>
                <small class="opacity50p" data-i18n="STMemoryBooks_AutoHideModeDesc">Choose what messages to automatically hide after creating a memory.</small>
                <select id="stmb-auto-hide-mode" class="text_pole">
                    <option value="none" {{#if (eq autoHideMode "none")}}selected{{/if}} data-i18n="STMemoryBooks_AutoHideNone">Do not auto-hide</option>
                    <option value="all" {{#if (eq autoHideMode "all")}}selected{{/if}} data-i18n="STMemoryBooks_AutoHideAll">Auto-hide all messages up to the last memory</option>
                    <option value="last" {{#if (eq autoHideMode "last")}}selected{{/if}} data-i18n="STMemoryBooks_AutoHideLast">Auto-hide only messages in the last memory</option>
                </select>
            </label>
        </div>

        <div class="world_entry_form_control">
            <label for="stmb-unhidden-entries-count">
                <h4 data-i18n="STMemoryBooks_UnhiddenCount">Messages to leave unhidden:</h4>
                <small class="opacity50p" data-i18n="STMemoryBooks_UnhiddenCountDesc">Number of recent messages to leave visible when auto-hiding (0 = hide all up to scene end)</small>
                <input type="number" id="stmb-unhidden-entries-count" class="text_pole"
                    value="{{unhiddenEntriesCount}}" min="0" max="50" step="1"
                    data-i18n="[placeholder]STMemoryBooks_DefaultUnhidden" placeholder="0">
            </label>
        </div>
        
        <div class="world_entry_form_control">
            <label for="stmb-token-warning-threshold">
                <h4 data-i18n="STMemoryBooks_TokenWarning">Token Warning Threshold:</h4>
                <small class="opacity50p" data-i18n="STMemoryBooks_TokenWarningDesc">Show confirmation dialog when estimated tokens exceed this threshold. Default: 30,000</small>
                <input type="number" id="stmb-token-warning-threshold" class="text_pole"
                    value="{{tokenWarningThreshold}}" min="1000" max="200000" step="1000"
                    data-i18n="[placeholder]STMemoryBooks_DefaultTokenWarning" placeholder="30000">
            </label>
        </div>

        <div class="world_entry_form_control">
            <h4 data-i18n="STMemoryBooks_TitleFormat">Memory Title Format:</h4>
            <select id="stmb-title-format-select" class="text_pole">
                {{#each titleFormats}}
                <option value="{{value}}" {{#if isSelected}}selected{{/if}}>{{value}}</option>
                {{/each}}
                <option value="custom" data-i18n="STMemoryBooks_CustomTitleFormat">Custom Title Format...</option>
            </select>
            <input type="text" id="stmb-custom-title-format" class="text_pole marginTop5 {{#unless showCustomInput}}displayNone{{/unless}}"
                data-i18n="[placeholder]STMemoryBooks_EnterCustomFormat" placeholder="Enter custom format" value="{{titleFormat}}">
            <small class="opacity50p" data-i18n="STMemoryBooks_TitleFormatDesc">Use [0], [00], [000] for auto-numbering. Available: \{{title}}, \{{scene}}, &#123;&#123;char}}, &#123;&#123;user}}, \{{messages}}, \{{profile}}, &#123;&#123;date}}, &#123;&#123;time}}</small>
        </div>

        <div class="world_entry_form_control" class="flex-container">
            <div class="flex flexFlowRow alignItemsBaseline">
                <label class="checkbox_label">
                    <input type="checkbox" id="stmb-use-regex" {{#if useRegex}}checked{{/if}}>
                    <span data-i18n="STMemoryBooks_UseRegexAdvanced">Use regex (advanced)</span>
                </label>
            </div>
            <div class="flex flexFlowRow buttons_block marginTop5 justifyCenter gap10px whitespacenowrap">
                <button id="stmb-configure-regex" class="menu_button whitespacenowrap" style="{{#unless useRegex}}display:none;{{/unless}}" data-i18n="STMemoryBooks_ConfigureRegex">
                    📐 Configure regex…
                </button>
            </div>
            <small class="opacity70p" data-i18n="STMemoryBooks_RegexSelection_Desc">Selecting a regex here will run it REGARDLESS of whether it is enabled or disabled.</small>
        </div>

        <div class="world_entry_form_control">
            <h4 data-i18n="STMemoryBooks_Profiles">Memory Profiles:</h4>
            <select id="stmb-profile-select" class="text_pole">
                {{#each profiles}}
                <option value="{{@index}}" {{#if isDefault}}selected{{/if}}>{{name}}{{#if isDefault}} (Default){{/if}}</option>
                {{/each}}
            </select>
        </div>

        <div id="stmb-profile-summary" class="padding10 marginBot10">
            <div class="marginBot5" data-i18n="STMemoryBooks_ProfileSettings">Profile Settings:</div>
            <div><span data-i18n="STMemoryBooks_Provider">Provider</span>: <span id="stmb-summary-api">{{selectedProfile.connection.api}}</span></div>
            <div><span data-i18n="STMemoryBooks_Model">Model</span>: <span id="stmb-summary-model">{{selectedProfile.connection.model}}</span></div>
            <div><span data-i18n="STMemoryBooks_Temperature">Temperature</span>: <span id="stmb-summary-temp">{{selectedProfile.connection.temperature}}</span></div>
            <div><span data-i18n="STMemoryBooks_TitleFormat">Title Format</span>: <span id="stmb-summary-title">{{selectedProfile.titleFormat}}</span></div>
            <details class="marginTop10">
                <summary data-i18n="STMemoryBooks_ViewPrompt">View Prompt</summary>
                <div class="padding10 marginTop5 stmb-box">
                    <pre><code id="stmb-summary-prompt">{{selectedProfile.effectivePrompt}}</code></pre>
                </div>
            </details>
        </div>

        <h4 data-i18n="STMemoryBooks_ProfileActions">Profile Actions:</h4>
        <div class="buttons_block marginTop5 justifyCenter gap10px whitespacenowrap" id="stmb-profile-buttons">
            <!-- Profile buttons will be dynamically inserted here -->
        </div>

        <h4 data-i18n="STMemoryBooks_extraFunctionButtons">Extra Function Buttons:</h4>
        <input type="file" id="stmb-import-file" accept=".json" class="displayNone">
        <div class="buttons_block marginTop5 justifyCenter gap10px whitespacenowrap" id="stmb-extra-function-buttons">
            <!-- extra function buttons will be dynamically inserted here -->
        </div>
`);

/**
 * Simplified confirmation popup template
 */
export const simpleConfirmationTemplate = Handlebars.compile(`
    <h3 data-i18n="STMemoryBooks_CreateMemory">Create Memory</h3>
    <div id="stmb-scene" class="padding10 marginBot10">
        <div class="marginBot5" data-i18n="STMemoryBooks_ScenePreview">Scene Preview:</div>
        <div class="padding10 marginTop5 stmb-box">
            <pre><code id="stmb-scene-block"><span data-i18n="STMemoryBooks_Start">Start</span>: <span data-i18n="STMemoryBooks_Message">Message</span> #{{sceneStart}} ({{startSpeaker}})
{{startExcerpt}}

<span data-i18n="STMemoryBooks_End">End</span>: <span data-i18n="STMemoryBooks_Message">Message</span> #{{sceneEnd}} ({{endSpeaker}})
{{endExcerpt}}

<span data-i18n="STMemoryBooks_Messages">Messages</span>: {{messageCount}} | <span data-i18n="STMemoryBooks_EstimatedTokens">Estimated tokens</span>: {{estimatedTokens}}</code></pre>
        </div>
    </div>

    <div class="world_entry_form_control">
        <h5><span data-i18n="STMemoryBooks_UsingProfile">Using Profile</span>: <span class="success">{{profileName}}</span></h5>

        <div id="stmb-profile-summary" class="padding10 marginBot10">
            <div class="marginBot5" data-i18n="STMemoryBooks_ProfileSettings">Profile Settings:</div>
            <div><span data-i18n="STMemoryBooks_Model">Model</span>: <span id="stmb-summary-model">{{profileModel}}</span></div>
            <div><span data-i18n="STMemoryBooks_Temperature">Temperature</span>: <span id="stmb-summary-temp">{{profileTemperature}}</span></div>
            <details class="marginTop10">
                <summary data-i18n="STMemoryBooks_ViewPrompt">View Prompt</summary>
                <div class="padding10 marginTop5 stmb-box">
                    <pre><code id="stmb-summary-prompt">{{effectivePrompt}}</code></pre>
                </div>
            </details>
        </div>
    </div>

    {{#if showWarning}}
    <div class="info-block warning marginTop10">
        ⚠️ <span data-i18n="STMemoryBooks_LargeSceneWarning">Large scene</span> ({{estimatedTokens}} tokens) <span data-i18n="STMemoryBooks_MayTakeTime">may take some time to process.</span>
    </div>
    {{/if}}

    <div class="marginTop10 opacity50p fontsize90p" data-i18n="STMemoryBooks_AdvancedOptionsHint">
        Click "Advanced Options" to customize prompt, context memories, or API settings.
    </div>
`);

/**
 * Advanced options popup template
 */
export const advancedOptionsTemplate = Handlebars.compile(`
    <h3 data-i18n="STMemoryBooks_AdvancedOptions">Advanced Memory Options</h3>
    <div class="world_entry_form_control">
        <h4 data-i18n="STMemoryBooks_SceneInformation">Scene Information:</h4>
        <div class="padding10 marginBot15" style="background-color: var(--SmartThemeBlurTintColor); border-radius: 5px;">
            <div class="fontsize90p"><span data-i18n="STMemoryBooks_Messages">Messages</span> {{sceneStart}}-{{sceneEnd}} ({{messageCount}} <span data-i18n="STMemoryBooks_Total">total</span>)</div>
            <div class="fontsize90p"><span data-i18n="STMemoryBooks_BaseTokens">Base tokens</span>: {{estimatedTokens}}</div>
            <div class="fontsize90p" id="stmb-total-tokens-display"><span data-i18n="STMemoryBooks_TotalTokens">Total tokens</span>: {{estimatedTokens}}</div>
        </div>
    </div>

    <div class="world_entry_form_control">
        <label for="stmb-profile-select-advanced">
            <h4 data-i18n="STMemoryBooks_Profile">Profile:</h4>
            <small data-i18n="STMemoryBooks_ChangeProfileDesc">Change the profile to use different base settings.</small>
            <select id="stmb-profile-select-advanced" class="text_pole">
                {{#each profiles}}
                <option value="{{@index}}" {{#if isDefault}}selected{{/if}}>{{name}}{{#if isDefault}} (Default){{/if}}</option>
                {{/each}}
            </select>
        </label>
    </div>

    <div class="world_entry_form_control">
        <label for="stmb-effective-prompt-advanced">
            <h4 data-i18n="STMemoryBooks_MemoryCreationPrompt">Memory Creation Prompt:</h4>
            <small data-i18n="STMemoryBooks_CustomizePromptDesc">Customize the prompt used to generate this memory.</small>
            <i class="editor_maximize fa-solid fa-maximize right_menu_button" data-for="stmb-effective-prompt-advanced" title="Expand the editor" data-i18n="[title]STMemoryBooks_ExpandEditor"></i>
            <textarea id="stmb-effective-prompt-advanced" class="text_pole textarea_compact" rows="6" data-i18n="[placeholder]STMemoryBooks_MemoryPromptPlaceholder" placeholder="Memory creation prompt">{{effectivePrompt}}</textarea>
        </label>
    </div>

    <div class="world_entry_form_control">
        <label for="stmb-context-memories-advanced">
            <h4 data-i18n="STMemoryBooks_IncludePreviousMemories">Include Previous Memories as Context:</h4>
            <small>
                <span data-i18n="STMemoryBooks_PreviousMemoriesDesc">Previous memories provide context for better continuity.</span>
                {{#if availableMemories}}
                <br><span data-i18n="STMemoryBooks_Found">Found</span> {{availableMemories}} {{#if (eq availableMemories 1)}}<span data-i18n="STMemoryBooks_ExistingMemorySingular">existing memory in lorebook.</span>{{else}}<span data-i18n="STMemoryBooks_ExistingMemoriesPlural">existing memories in lorebook.</span>{{/if}}
                {{else}}
                <br><span data-i18n="STMemoryBooks_NoMemoriesFound">No existing memories found in lorebook.</span>
                {{/if}}
            </small>
            <select id="stmb-context-memories-advanced" class="text_pole">
                <option value="0" {{#if (eq defaultMemoryCount 0)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount0">None (0 memories)</option>
                <option value="1" {{#if (eq defaultMemoryCount 1)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount1">Last 1 memory</option>
                <option value="2" {{#if (eq defaultMemoryCount 2)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount2">Last 2 memories</option>
                <option value="3" {{#if (eq defaultMemoryCount 3)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount3">Last 3 memories</option>
                <option value="4" {{#if (eq defaultMemoryCount 4)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount4">Last 4 memories</option>
                <option value="5" {{#if (eq defaultMemoryCount 5)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount5">Last 5 memories</option>
                <option value="6" {{#if (eq defaultMemoryCount 6)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount6">Last 6 memories</option>
                <option value="7" {{#if (eq defaultMemoryCount 7)}}selected{{/if}} data-i18n="STMemoryBooks_MemoryCount7">Last 7 memories</option>
            </select>
        </label>
    </div>

    <div class="world_entry_form_control">
        <h4 data-i18n="STMemoryBooks_APIOverride">API Override Settings:</h4>

        <div class="padding10 marginBot10" style="background-color: var(--SmartThemeBlurTintColor); border-radius: 5px; filter: brightness(1.2);">
            <div class="marginBot5" data-i18n="STMemoryBooks_ProfileSettings">Profile Settings:</div>
            <div class="fontsize90p"><span data-i18n="STMemoryBooks_Model">Model</span>: <span class="success" id="stmb-profile-model-display">{{profileModel}}</span></div>
            <div class="fontsize90p"><span data-i18n="STMemoryBooks_Temperature">Temperature</span>: <span class="success" id="stmb-profile-temp-display">{{profileTemperature}}</span></div>
        </div>

        <div class="padding10 marginBot10" style="background-color: var(--SmartThemeBlurTintColor); border-radius: 5px;">
            <div class="marginBot5" data-i18n="STMemoryBooks_CurrentSTSettings">Current SillyTavern Settings:</div>
            <div class="fontsize90p"><span data-i18n="STMemoryBooks_Model">Model</span>: <span style="color: var(--SmartThemeQuoteColor);">{{currentModel}}</span></div>
            <div class="fontsize90p"><span data-i18n="STMemoryBooks_Temperature">Temperature</span>: <span style="color: var(--SmartThemeQuoteColor);">{{currentTemperature}}</span></div>
            <div class="fontsize90p"><span data-i18n="STMemoryBooks_API">API</span>: <span style="color: var(--SmartThemeQuoteColor);">{{currentApi}}</span></div>
        </div>

        <label class="checkbox_label">
            <input type="checkbox" id="stmb-override-settings-advanced">
            <span data-i18n="STMemoryBooks_UseCurrentSettings">Use current SillyTavern settings instead of profile settings</span>
        </label>
        <small class="opacity50p marginTop5" data-i18n="STMemoryBooks_OverrideDesc">
            Override the profile's model and temperature with your current SillyTavern settings.
        </small>
    </div>

    <div class="world_entry_form_control displayNone" id="stmb-save-profile-section-advanced">
        <h4 data-i18n="STMemoryBooks_SaveAsNewProfile">Save as New Profile:</h4>
        <label for="stmb-new-profile-name-advanced">
            <h4 data-i18n="STMemoryBooks_ProfileName">Profile Name:</h4>
            <small data-i18n="STMemoryBooks_SaveProfileDesc">Your current settings differ from the selected profile. Save them as a new profile.</small>
            <input type="text" id="stmb-new-profile-name-advanced" class="text_pole" data-i18n="[placeholder]STMemoryBooks_EnterProfileName" placeholder="Enter new profile name" value="{{suggestedProfileName}}">
        </label>
    </div>

    {{#if showWarning}}
    <div class="info-block warning marginTop10" id="stmb-token-warning-advanced">
        <span data-i18n="STMemoryBooks_LargeSceneWarningShort">⚠️ Large scene may take some time to process.</span>
    </div>
    {{/if}}
`);

/**
 * Memory preview dialog template
 */
export const memoryPreviewTemplate = Handlebars.compile(`
    <h3 data-i18n="STMemoryBooks_MemoryPreview">📖 Memory Preview</h3>
    <div class="world_entry_form_control">
        <small class="marginBot10" data-i18n="STMemoryBooks_MemoryPreviewDesc">Review the generated memory below. You can edit the content while preserving the structure.</small>
    </div>

    <div class="world_entry_form_control">
        <label for="stmb-preview-title">
            <h4 data-i18n="STMemoryBooks_MemoryTitle">Memory Title:</h4>
            <input type="text" id="stmb-preview-title" class="text_pole" value="{{#if title}}{{title}}{{else}}Memory{{/if}}" data-i18n="[placeholder]STMemoryBooks_MemoryTitlePlaceholder" placeholder="Memory title" {{#if titleReadonly}}readonly disabled{{/if}}>
        </label>
    </div>

    <div class="world_entry_form_control">
        <label for="stmb-preview-content">
            <h4 data-i18n="STMemoryBooks_MemoryContent">Memory Content:</h4>
            <i class="editor_maximize fa-solid fa-maximize right_menu_button" data-for="stmb-preview-content" title="Expand the editor" data-i18n="[title]STMemoryBooks_ExpandEditor"></i>
            <textarea id="stmb-preview-content" class="text_pole textarea_compact" rows="8" data-i18n="[placeholder]STMemoryBooks_MemoryContentPlaceholder" placeholder="Memory content">{{#if content}}{{content}}{{else}}{{/if}}</textarea>
        </label>
    </div>

    <div class="world_entry_form_control">
        <label for="stmb-preview-keywords">
            <h4 data-i18n="STMemoryBooks_Keywords">Keywords:</h4>
            <small class="opacity50p" data-i18n="STMemoryBooks_KeywordsDesc">Separate keywords with commas</small>
            <input type="text" id="stmb-preview-keywords" class="text_pole" value="{{#if keywordsText}}{{keywordsText}}{{else}}{{/if}}" data-i18n="[placeholder]STMemoryBooks_KeywordsPlaceholder" placeholder="keyword1, keyword2, keyword3">
        </label>
    </div>

    <div class="world_entry_form_control">
        <h4 data-i18n="STMemoryBooks_SceneInformation">Scene Information:</h4>
        <div class="padding10 marginBot10 stmb-box">
            <div class="fontsize90p"><span data-i18n="STMemoryBooks_Messages">Messages</span>: {{#if sceneStart}}{{sceneStart}}{{else}}?{{/if}}-{{#if sceneEnd}}{{sceneEnd}}{{else}}?{{/if}} ({{#if messageCount}}{{messageCount}}{{else}}?{{/if}} <span data-i18n="STMemoryBooks_Total">total</span>)</div>
            <div class="fontsize90p"><span data-i18n="STMemoryBooks_Profile">Profile</span>: {{#if profileName}}{{profileName}}{{else}}<span data-i18n="STMemoryBooks_UnknownProfile">Unknown Profile</span>{{/if}}</div>
        </div>
    </div>
`);
