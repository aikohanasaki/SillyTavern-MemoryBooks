import { Handlebars } from '../../../../lib.js';

/**
 * Main settings template
 */
export const settingsTemplate = Handlebars.compile(`
<div class="stmb-settings-container">
    <div class="completion_prompt_manager_popup_entry">
        {{#if hasScene}}
        <div class="completion_prompt_manager_popup_entry_form_control">
            <h5>Current Scene:</h5>
            <div class="mes_file_container" style="margin-bottom: 10px;">
                <pre style="margin: 0; white-space: pre-line;">Start: Message #{{sceneData.sceneStart}} ({{sceneData.startSpeaker}})
{{sceneData.startExcerpt}}

End: Message #{{sceneData.sceneEnd}} ({{sceneData.endSpeaker}})
{{sceneData.endExcerpt}}

Messages: {{sceneData.messageCount}} | Estimated tokens: {{sceneData.estimatedTokens}}</pre>
            </div>
        </div>
        {{else}}
        <div class="completion_prompt_manager_error caution">
            <span>No scene markers set. Use the chevron buttons in chat messages to mark start (►) and end (◄) points.</span>
        </div>
        {{/if}}
        
        <div class="completion_prompt_manager_popup_entry_form_control">
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-always-use-default" {{#if alwaysUseDefault}}checked{{/if}}>
                <span>Always use default profile (no confirmation prompt)</span>
            </label>
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-show-notifications" {{#if showNotifications}}checked{{/if}}>
                <span>Show notifications</span>
            </label>
        </div>

        <div class="completion_prompt_manager_popup_entry_form_control">
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-refresh-editor" {{#if refreshEditor}}checked{{/if}}>
                <span>Refresh lorebook editor after adding memories</span>
            </label>
        </div>

        <div class="completion_prompt_manager_popup_entry_form_control">
            <label for="stmb-token-warning-threshold">Token Warning Threshold:</label>
            <input type="number" id="stmb-token-warning-threshold" class="text_pole" 
                value="{{tokenWarningThreshold}}" min="1000" max="200000" step="1000"
                placeholder="30000">
            <small style="opacity: 0.7;">Show confirmation dialog when estimated tokens exceed this threshold. Default: 30,000</small>
        </div>

        <div class="completion_prompt_manager_popup_entry_form_control">
            <label for="stmb-default-memory-count">Default Previous Memories Count:</label>
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
            <small style="opacity: 0.7;">Default number of previous memories to include as context when creating new memories.</small>
        </div>

        <div class="completion_prompt_manager_popup_entry_form_control">
            <h5>Memory Title Format:</h5>
            <select id="stmb-title-format-select" class="text_pole">
                {{#each titleFormats}}
                <option value="{{this}}" {{#if isSelected}}selected{{/if}}>{{this}}</option>
                {{/each}}
                <option value="custom">Custom Title Format...</option>
            </select>
            <input type="text" id="stmb-custom-title-format" class="text_pole" 
                style="margin-top: 5px; {{#unless showCustomInput}}display: none;{{/unless}}" 
                placeholder="Enter custom format" value="{{titleFormat}}">
            <small style="opacity: 0.7;">Use [0], [00], [000] for auto-numbering. Available: {{title}}, {{scene}}, {{char}}, {{user}}, {{messages}}, {{profile}}, {{date}}, {{time}}</small>
        </div>
        
        <div class="completion_prompt_manager_popup_entry_form_control">
            <h5>Memory Profiles:</h5>
            <select id="stmb-profile-select" class="text_pole">
                {{#each profiles}}
                <option value="{{@index}}" {{#if isDefault}}selected{{/if}}>{{name}}</option>
                {{/each}}
            </select>
            <div class="menu_button" id="stmb-edit-profile">Edit Profile</div>
            <div class="menu_button" id="stmb-new-profile">New Profile</div>
            <div class="menu_button" id="stmb-delete-profile">Delete Profile</div>
        </div>
        
        <div class="completion_prompt_manager_popup_entry_form_control">
            <h5>Import/Export:</h5>
            <input type="file" id="stmb-import-file" accept=".json" style="display: none;">
            <div class="menu_button" id="stmb-export-profiles">Export Profiles</div>
            <div class="menu_button" id="stmb-import-profiles">Import Profiles</div>
        </div>
    </div>
</div>
`);

/**
 * Simplified confirmation popup template - only shows essential info
 */
export const simpleConfirmationTemplate = Handlebars.compile(`
<div class="completion_prompt_manager_popup_entry">
    <div class="completion_prompt_manager_popup_entry_form_control">
        <h5>Scene Preview:</h5>
        <div class="mes_file_container" style="margin-bottom: 15px;">
            <pre style="margin: 0; white-space: pre-line; font-size: 0.9em;">Start: Message #{{sceneStart}} ({{startSpeaker}})
{{startExcerpt}}

End: Message #{{sceneEnd}} ({{endSpeaker}})
{{endExcerpt}}

Messages: {{messageCount}} | Estimated tokens: {{estimatedTokens}}</pre>
        </div>
    </div>
    
    <div class="completion_prompt_manager_popup_entry_form_control">
        <h5>Using Profile: <span style="color: #4CAF50;">{{profileName}}</span></h5>
        
        <div style="background: #2a2a2a; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
            <div style="font-weight: bold; margin-bottom: 5px;">Profile Settings:</div>
            <div style="font-size: 0.9em;">Model: <span style="color: #4CAF50;">{{profileModel}}</span></div>
            <div style="font-size: 0.9em;">Temperature: <span style="color: #4CAF50;">{{profileTemperature}}</span></div>
        </div>
        
        <details style="margin-top: 10px;">
            <summary style="cursor: pointer; color: #2196F3;">View Prompt</summary>
            <div style="background: #1a1a1a; padding: 10px; border-radius: 5px; margin-top: 5px; max-height: 150px; overflow-y: auto;">
                <pre style="margin: 0; white-space: pre-wrap; font-size: 0.8em;">{{effectivePrompt}}</pre>
            </div>
        </details>
    </div>
    
    {{#if showWarning}}
    <div class="completion_prompt_manager_error caution" style="margin-top: 10px;">
        <span>⚠️ Large scene ({{estimatedTokens}} tokens) may take some time to process.</span>
    </div>
    {{/if}}
    
    <div style="margin-top: 15px; font-size: 0.9em; opacity: 0.7;">
        Click "Advanced Options" to customize prompt, context memories, or API settings.
    </div>
</div>
`);

/**
 * Advanced options popup template
 */
export const advancedOptionsTemplate = Handlebars.compile(`
<div class="completion_prompt_manager_popup_entry">
    <div class="completion_prompt_manager_popup_entry_form_control">
        <h5>Scene Information:</h5>
        <div style="background: #1a1a1a; padding: 10px; border-radius: 5px; margin-bottom: 15px;">
            <div style="font-size: 0.9em;">Messages {{sceneStart}}-{{sceneEnd}} ({{messageCount}} total)</div>
            <div style="font-size: 0.9em;">Base tokens: {{estimatedTokens}}</div>
            <div style="font-size: 0.9em;" id="stmb-total-tokens-display">Total tokens: {{estimatedTokens}}</div>
        </div>
    </div>
    
    <div class="completion_prompt_manager_popup_entry_form_control">
        <label for="stmb-profile-select-advanced">Profile:</label>
        <select id="stmb-profile-select-advanced" class="text_pole">
            {{#each profiles}}
            <option value="{{@index}}" {{#if isDefault}}selected{{/if}}>{{name}}</option>
            {{/each}}
        </select>
        <small style="opacity: 0.7; display: block; margin-top: 5px;">Change the profile to use different base settings.</small>
    </div>
    
    <div class="completion_prompt_manager_popup_entry_form_control">
        <label for="stmb-effective-prompt-advanced">Memory Creation Prompt:</label>
        <textarea id="stmb-effective-prompt-advanced" class="text_pole textarea_compact" rows="6" placeholder="Memory creation prompt">{{effectivePrompt}}</textarea>
        <small style="opacity: 0.7; display: block; margin-top: 5px;">Customize the prompt used to generate this memory.</small>
    </div>
    
    <div class="completion_prompt_manager_popup_entry_form_control">
        <label for="stmb-context-memories-advanced">Include Previous Memories as Context:</label>
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
        <small style="opacity: 0.7; display: block; margin-top: 5px;">
            Previous memories provide context for better continuity.
            {{#if availableMemories}}
            <br>Found {{availableMemories}} existing {{#if (eq availableMemories 1)}}memory{{else}}memories{{/if}} in lorebook.
            {{else}}
            <br>No existing memories found in lorebook.
            {{/if}}
        </small>
    </div>
    
    <div class="completion_prompt_manager_popup_entry_form_control">
        <h5>API Override Settings:</h5>
        
        <div style="background: #2a2a2a; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
            <div style="font-weight: bold; margin-bottom: 5px;">Profile Settings:</div>
            <div style="font-size: 0.9em;">Model: <span style="color: #4CAF50;" id="stmb-profile-model-display">{{profileModel}}</span></div>
            <div style="font-size: 0.9em;">Temperature: <span style="color: #4CAF50;" id="stmb-profile-temp-display">{{profileTemperature}}</span></div>
        </div>
        
        <div style="background: #1a1a1a; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
            <div style="font-weight: bold; margin-bottom: 5px;">Current SillyTavern Settings:</div>
            <div style="font-size: 0.9em;">Model: <span style="color: #2196F3;">{{currentModel}}</span></div>
            <div style="font-size: 0.9em;">Temperature: <span style="color: #2196F3;">{{currentTemperature}}</span></div>
            <div style="font-size: 0.9em;">API: <span style="color: #2196F3;">{{currentApi}}</span></div>
        </div>
        
        <label class="checkbox_label">
            <input type="checkbox" id="stmb-override-settings-advanced">
            <span>Use current SillyTavern settings instead of profile settings</span>
        </label>
        <small style="opacity: 0.7; display: block; margin-top: 5px;">
            Override the profile's model and temperature with your current SillyTavern settings.
        </small>
    </div>
    
    <div class="completion_prompt_manager_popup_entry_form_control" style="display: none;" id="stmb-save-profile-section-advanced">
        <h5>Save as New Profile:</h5>
        <label for="stmb-new-profile-name-advanced">Profile Name:</label>
        <input type="text" id="stmb-new-profile-name-advanced" class="text_pole" placeholder="Enter new profile name" value="{{suggestedProfileName}}">
        <small style="opacity: 0.7; display: block; margin-top: 5px;">
            Your current settings differ from the selected profile. Save them as a new profile.
        </small>
    </div>
    
    {{#if showWarning}}
    <div class="completion_prompt_manager_error caution" style="margin-top: 10px;" id="stmb-token-warning-advanced">
        <span>⚠️ Large scene may take some time to process.</span>
    </div>
    {{/if}}
</div>
`);

/**
 * Keyword selection template
 */
export const keywordSelectionTemplate = Handlebars.compile(`
<div class="stmb-keyword-selection-container">
    <div class="completion_prompt_manager_popup_entry">
        <div class="completion_prompt_manager_popup_entry_form_control">
            <h5>Generated Memory:</h5>
            <div class="stmb-scene-preview">{{formattedContent}}</div>
        </div>
        
        <div class="completion_prompt_manager_popup_entry_form_control">
            <h5>Keywords Not Found in AI Response</h5>
            <p>The AI didn't provide keywords with this memory. Choose how you'd like to generate them:</p>
            
            <div class="menu_button" id="stmb-keyword-st-generate">
                <i class="fa-solid fa-cog"></i> ST Generate
                <small style="display: block; margin-top: 4px; opacity: 0.7;">Use SillyTavern's built-in keyword detection</small>
            </div>
            
            <div class="menu_button" id="stmb-keyword-ai-generate">
                <i class="fa-solid fa-robot"></i> AI Keywords  
                <small style="display: block; margin-top: 4px; opacity: 0.7;">Send separate request to AI for keywords only</small>
            </div>
            
            <div class="menu_button" id="stmb-keyword-user-input">
                <i class="fa-solid fa-keyboard"></i> Manual Entry
                <small style="display: block; margin-top: 4px; opacity: 0.7;">Enter your own keywords</small>
            </div>
        </div>
        
        <div class="completion_prompt_manager_popup_entry_form_control" id="stmb-manual-keywords-section" style="display: none;">
            <label for="stmb-manual-keywords">Enter Keywords (comma-separated):</label>
            <textarea id="stmb-manual-keywords" class="text_pole textarea_compact" rows="3" placeholder="keyword1, keyword2, keyword3, character name, location"></textarea>            
            <small style="opacity: 0.7;">Enter 1-8 keywords separated by commas. Each keyword should be 1-25 characters.</small>
        </div>
        
        <div class="completion_prompt_manager_popup_entry_form_control">
            <div class="stmb-keyword-metadata">
                <small style="opacity: 0.6;">
                    Scene: {{displayMetadata.sceneRange}} | Character: {{displayMetadata.characterName}} | Profile: {{displayMetadata.profileUsed}}
                </small>
            </div>
        </div>
    </div>
</div>
`);