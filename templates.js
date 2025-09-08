import { Handlebars } from '../../../../lib.js';

/**
 * Main settings template - Updated to use SillyTavern's built-in classes
 */
export const settingsTemplate = Handlebars.compile(`
    <h3>📕 Memory Book Settings</h3>
        {{#if hasScene}}
        <div id="stmb-scene" class="padding10 marginBot10">
            <div class="marginBot5" style="font-weight: bold;">Current Scene:</div>
            <div class="padding10 marginTop5 stmb-box">
                <pre><code id="stmb-scene-block">Start: Message #{{sceneData.sceneStart}} ({{sceneData.startSpeaker}})
{{sceneData.startExcerpt}}

End: Message #{{sceneData.sceneEnd}} ({{sceneData.endSpeaker}})
{{sceneData.endExcerpt}}

Messages: {{sceneData.messageCount}} | Estimated tokens: {{sceneData.estimatedTokens}}</code></pre>
            </div>
        </div>
        {{else}}
        <div class="info-block warning">
            <span>No scene markers set. Use the chevron buttons in chat messages to mark start (►) and end (◄) points.</span>
        </div>
        {{/if}}
        
        <h4>Preferences:</h4>

        <div class="world_entry_form_control">
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-always-use-default" {{#if alwaysUseDefault}}checked{{/if}}>
                <span>Always use default profile (no confirmation prompt)</span>
            </label>
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-show-notifications" {{#if showNotifications}}checked{{/if}}>
                <span>Show notifications</span>
            </label>
        </div>

        <div class="world_entry_form_control">
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-manual-mode-enabled" {{#if manualModeEnabled}}checked{{/if}}>
                <span>Enable Manual Lorebook Mode</span>
            </label>
            <small class="opacity50p">When enabled, you must specify a lorebook for memories instead of using the one bound to the chat.</small>
        </div>

        <div class="world_entry_form_control">
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-allow-scene-overlap" {{#if allowSceneOverlap}}checked{{/if}}>
                <span>Allow scene overlap</span>
            </label>
            <small class="opacity50p">Check this box to skip checking for overlapping memories/scenes.</small>
        </div>

        <div class="world_entry_form_control">
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-refresh-editor" {{#if refreshEditor}}checked{{/if}}>
                <span>Refresh lorebook editor after adding memories</span>
            </label>
        </div>

        <div class="world_entry_form_control">
            <label for="stmb-default-memory-count">
                <h4>Default Previous Memories Count:</h4>
                <small class="opacity50p">Default number of previous memories to include as context when creating new memories.</small>
                <select id="stmb-default-memory-count" class="text_pole">
                    <option value="0" {{#if (eq defaultMemoryCount 0)}}selected{{/if}}>None (0 memories)</option>
                    <option value="1" {{#if (eq defaultMemoryCount 1)}}selected{{/if}}>Last 1 memory</option>
                    <option value="2" {{#if (eq defaultMemoryCount 2)}}selected{{/if}}>Last 2 memories</option>
                    <option value="3" {{#if (eq defaultMemoryCount 3)}}selected{{/if}}>Last 3 memories</option>
                    <option value="4" {{#if (eq defaultMemoryCount 4)}}selected{{/if}}>Last 4 memories</option>
                    <option value="5" {{#if (eq defaultMemoryCount 5)}}selected{{/if}}>Last 5 memories</option>
                    <option value="6" {{#if (eq defaultMemoryCount 6)}}selected{{/if}}>Last 6 memories</option>
                    <option value="7" {{#if (eq defaultMemoryCount 7)}}selected{{/if}}>Last 7 memories</option>
                </select>
            </label>
        </div>

        <div class="world_entry_form_control">
            <label for="stmb-auto-hide-mode">
                <h4>Auto-hide messages after adding memory:</h4>
                <small class="opacity50p">Choose what messages to automatically hide after creating a memory.</small>
                <select id="stmb-auto-hide-mode" class="text_pole">
                    <option value="none" {{#if (eq autoHideMode "none")}}selected{{/if}}>Do not auto-hide</option>
                    <option value="all" {{#if (eq autoHideMode "all")}}selected{{/if}}>Auto-hide all messages up to the last memory</option>
                    <option value="last" {{#if (eq autoHideMode "last")}}selected{{/if}}>Auto-hide only messages in the last memory</option>
                </select>
            </label>
        </div>

        <div class="world_entry_form_control">
            <label for="stmb-unhidden-entries-count">
                <h4>Messages to leave unhidden:</h4>
                <small class="opacity50p">Number of recent messages to leave visible when auto-hiding (0 = hide all up to scene end)</small>
                <input type="number" id="stmb-unhidden-entries-count" class="text_pole" 
                    value="{{unhiddenEntriesCount}}" min="0" max="50" step="1"
                    placeholder="0">
            </label>
        </div>
        
        <div class="world_entry_form_control">
            <label for="stmb-token-warning-threshold">
                <h4>Token Warning Threshold:</h4>
                <small class="opacity50p">Show confirmation dialog when estimated tokens exceed this threshold. Default: 30,000</small>
                <input type="number" id="stmb-token-warning-threshold" class="text_pole" 
                    value="{{tokenWarningThreshold}}" min="1000" max="200000" step="1000"
                    placeholder="30000">
            </label>
        </div>

        <div class="world_entry_form_control">
            <h4>Memory Title Format:</h4>
            <select id="stmb-title-format-select" class="text_pole">
                {{#each titleFormats}}
                <option value="{{value}}" {{#if isSelected}}selected{{/if}}>{{value}}</option>
                {{/each}}
                <option value="custom">Custom Title Format...</option>
            </select>
            <input type="text" id="stmb-custom-title-format" class="text_pole marginTop5 {{#unless showCustomInput}}displayNone{{/unless}}" 
                placeholder="Enter custom format" value="{{titleFormat}}">
            <small class="opacity50p">Use [0], [00], [000] for auto-numbering. Available: \{{title}}, \{{scene}}, &#123;&#123;char}}, &#123;&#123;user}}, \{{messages}}, \{{profile}}, &#123;&#123;date}}, &#123;&#123;time}}</small>
        </div>
        
        <div class="world_entry_form_control">
            <h4>Memory Profiles:</h4>
            <select id="stmb-profile-select" class="text_pole">
                {{#each profiles}}
                <option value="{{@index}}" {{#if isDefault}}selected{{/if}}>{{name}}{{#if isDefault}} (Default){{/if}}</option>
                {{/each}}
            </select>
        </div>

        <div id="stmb-profile-summary" class="padding10 marginBot10">
            <div class="marginBot5" style="font-weight: bold;">Profile Settings:</div>
            <div>Provider: <span id="stmb-summary-api">{{selectedProfile.connection.api}}</span></div>
            <div>Model: <span id="stmb-summary-model">{{selectedProfile.connection.model}}</span></div>
            <div>Temperature: <span id="stmb-summary-temp">{{selectedProfile.connection.temperature}}</span></div>
            <div>Title Format: <span id="stmb-summary-title">{{selectedProfile.titleFormat}}</span></div>
            <details class="marginTop10">
                <summary>View Prompt</summary>
                <div class="padding10 marginTop5 stmb-box">
                    <pre><code id="stmb-summary-prompt">{{selectedProfile.effectivePrompt}}</code></pre>
                </div>
            </details>
        </div>

        <h4>Profile Actions:</h4>
        <div class="buttons_block marginTop5" style="justify-content: center;">
            <div class="menu_button" id="stmb-set-default-profile">Set as Default</div>
            <div class="menu_button" id="stmb-edit-profile">Edit Profile</div>
            <div class="menu_button" id="stmb-new-profile">New Profile</div>
            <div class="menu_button" id="stmb-delete-profile">Delete Profile</div>
        </div>

        <h4>Import/Export Profiles:</h4>
        <input type="file" id="stmb-import-file" accept=".json" class="displayNone">
        <div class="buttons_block marginTop5" style="justify-content: center;">
            <div class="menu_button" id="stmb-export-profiles">Export Profiles</div>
            <div class="menu_button" id="stmb-import-profiles">Import Profiles</div>
        </div>
`);

/**
 * Simplified confirmation popup template - Updated to use ST's built-in classes
 */
export const simpleConfirmationTemplate = Handlebars.compile(`
    <h3>Create Memory</h3>
    <div id="stmb-scene" class="padding10 marginBot10">
        <div class="marginBot5" style="font-weight: bold;">Scene Preview:</div>
            <div class="padding10 marginTop5 stmb-box">
            <pre><code id="stmb-scene-block">Start: Message #{{sceneStart}} ({{startSpeaker}})
{{startExcerpt}}

End: Message #{{sceneEnd}} ({{endSpeaker}})
{{endExcerpt}}

Messages: {{messageCount}} | Estimated tokens: {{estimatedTokens}}</code></pre>
            </div>
        </div>
    </div>

    <div class="world_entry_form_control">
        <h5>Using Profile: <span style="color: #4CAF50;">{{profileName}}</span></h5>
        
        <div id="stmb-profile-summary" class="padding10 marginBot10">
            <div class="marginBot5" style="font-weight: bold;">Profile Settings:</div>
            <div>Model: <span id="stmb-summary-model">{{profileModel}}</span></div>
            <div>Temperature: <span id="stmb-summary-temp">{{profileTemperature}}</span></div>
            <details class="marginTop10">
                <summary>View Prompt</summary>
                <div class="padding10 marginTop5 stmb-box">
                    <pre><code id="stmb-summary-prompt">{{effectivePrompt}}</code></pre>
                </div>
            </details>
        </div>
    </div>

    {{#if showWarning}}
    <div class="info-block warning marginTop10">
        <span>⚠️ Large scene ({{estimatedTokens}} tokens) may take some time to process.</span>
    </div>
    {{/if}}

    <div class="marginTop10 opacity50p" style="font-size: 0.9em;">
        Click "Advanced Options" to customize prompt, context memories, or API settings.
    </div>
`);

/**
 * Advanced options popup template - Updated to use ST's built-in classes
 */
export const advancedOptionsTemplate = Handlebars.compile(`
    <h3>Advanced Memory Options</h3>
    <div class="world_entry_form_control">
        <h4>Scene Information:</h4>
        <div class="padding10" style="background: #1a1a1a; border-radius: 5px; margin-bottom: 15px;">
            <div style="font-size: 0.9em;">Messages {{sceneStart}}-{{sceneEnd}} ({{messageCount}} total)</div>
            <div style="font-size: 0.9em;">Base tokens: {{estimatedTokens}}</div>
            <div style="font-size: 0.9em;" id="stmb-total-tokens-display">Total tokens: {{estimatedTokens}}</div>
        </div>
    </div>

    <div class="world_entry_form_control">
        <label for="stmb-profile-select-advanced">
            <h4>Profile:</h4>
            <h5>Change the profile to use different base settings.</h5>
            <select id="stmb-profile-select-advanced" class="text_pole">
                {{#each profiles}}
                <option value="{{@index}}" {{#if isDefault}}selected{{/if}}>{{name}}{{#if isDefault}} (Default){{/if}}</option>
                {{/each}}
            </select>
        </label>
    </div>

    <div class="world_entry_form_control">
        <label for="stmb-effective-prompt-advanced">
            <h4>Memory Creation Prompt:</h4>
            <h5>Customize the prompt used to generate this memory.</h5>
            <textarea id="stmb-effective-prompt-advanced" class="text_pole textarea_compact" rows="6" placeholder="Memory creation prompt">{{effectivePrompt}}</textarea>
        </label>
    </div>

    <div class="world_entry_form_control">
        <label for="stmb-context-memories-advanced">
            <h4>Include Previous Memories as Context:</h4>
            <h5>
                Previous memories provide context for better continuity.
                {{#if availableMemories}}
                <br>Found {{availableMemories}} existing {{#if (eq availableMemories 1)}}memory{{else}}memories{{/if}} in lorebook.
                {{else}}
                <br>No existing memories found in lorebook.
                {{/if}}
            </h5>
            <select id="stmb-context-memories-advanced" class="text_pole">
                <option value="0" {{#if (eq defaultMemoryCount 0)}}selected{{/if}}>None (0 memories)</option>
                <option value="1" {{#if (eq defaultMemoryCount 1)}}selected{{/if}}>Last 1 memory</option>
                <option value="2" {{#if (eq defaultMemoryCount 2)}}selected{{/if}}>Last 2 memories</option>
                <option value="3" {{#if (eq defaultMemoryCount 3)}}selected{{/if}}>Last 3 memories</option>
                <option value="4" {{#if (eq defaultMemoryCount 4)}}selected{{/if}}>Last 4 memories</option>
                <option value="5" {{#if (eq defaultMemoryCount 5)}}selected{{/if}}>Last 5 memories</option>
                <option value="6" {{#if (eq defaultMemoryCount 6)}}selected{{/if}}>Last 6 memories</option>
                <option value="7" {{#if (eq defaultMemoryCount 7)}}selected{{/if}}>Last 7 memories</option>
            </select>
        </label>
    </div>

    <div class="world_entry_form_control">
        <h4>API Override Settings:</h4>
        
        <div class="padding10 marginBot10" style="background: #2a2a2a; border-radius: 5px;">
            <div class="marginBot5" style="font-weight: bold;">Profile Settings:</div>
            <div style="font-size: 0.9em;">Model: <span style="color: #4CAF50;" id="stmb-profile-model-display">{{profileModel}}</span></div>
            <div style="font-size: 0.9em;">Temperature: <span style="color: #4CAF50;" id="stmb-profile-temp-display">{{profileTemperature}}</span></div>
        </div>
        
        <div class="padding10 marginBot10" style="background: #1a1a1a; border-radius: 5px;">
            <div class="marginBot5" style="font-weight: bold;">Current SillyTavern Settings:</div>
            <div style="font-size: 0.9em;">Model: <span style="color: #2196F3;">{{currentModel}}</span></div>
            <div style="font-size: 0.9em;">Temperature: <span style="color: #2196F3;">{{currentTemperature}}</span></div>
            <div style="font-size: 0.9em;">API: <span style="color: #2196F3;">{{currentApi}}</span></div>
        </div>
        
        <label class="checkbox_label">
            <input type="checkbox" id="stmb-override-settings-advanced">
            <span>Use current SillyTavern settings instead of profile settings</span>
        </label>
        <small class="opacity50p marginTop5">
            Override the profile's model and temperature with your current SillyTavern settings.
        </small>
    </div>

    <div class="world_entry_form_control displayNone" id="stmb-save-profile-section-advanced">
        <h4>Save as New Profile:</h4>
        <label for="stmb-new-profile-name-advanced">
            <h4>Profile Name:</h4>
            <h5>Your current settings differ from the selected profile. Save them as a new profile.</h5>
            <input type="text" id="stmb-new-profile-name-advanced" class="text_pole" placeholder="Enter new profile name" value="{{suggestedProfileName}}">
        </label>
    </div>

    {{#if showWarning}}
    <div class="info-block warning marginTop10" id="stmb-token-warning-advanced">
        <span>⚠️ Large scene may take some time to process.</span>
    </div>
    {{/if}}
`);
