import { Handlebars } from '../../../../lib.js';

export const summaryPromptsTableTemplate = Handlebars.compile(`
<table style="width: 100%; border-collapse: collapse;">
  <thead>
    <tr>
      <th data-i18n="STMemoryBooks_PromptManager_DisplayName">Display Name</th>
    </tr>
  </thead>
  <tbody>
    {{#if items}}
      {{#each items}}
        <tr data-preset-key="{{key}}" style="cursor: pointer; border-bottom: 1px solid var(--SmartThemeBorderColor);">
          <td style="padding: 8px;">
            <span class="stmb-preset-name">{{displayName}}</span>
            <span class="stmb-inline-actions" style="float: right; display: inline-flex; gap: 10px;">
              <button class="stmb-action stmb-action-edit" title="Edit" aria-label="Edit" style="background:none;border:none;cursor:pointer;">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button class="stmb-action stmb-action-duplicate" title="Duplicate" aria-label="Duplicate" style="background:none;border:none;cursor:pointer;">
                <i class="fa-solid fa-copy"></i>
              </button>
              <button class="stmb-action stmb-action-delete" title="Delete" aria-label="Delete" style="background:none;border:none;cursor:pointer;">
                <i class="fa-solid fa-trash"></i>
              </button>
            </span>
          </td>
        </tr>
      {{/each}}
    {{else}}
      <tr>
        <td>
          <div class="opacity50p" data-i18n="STMemoryBooks_PromptManager_NoPresets">No presets available</div>
        </td>
      </tr>
    {{/if}}
  </tbody>
</table>
`);
