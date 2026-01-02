import { Handlebars } from "../../../../lib.js";

export const sidePromptsTableTemplate = Handlebars.compile(`
<table style="width: 100%; border-collapse: collapse;">
  <thead>
    <tr>
      <th style="text-align:left;" data-i18n="STMemoryBooks_Name">Name</th>
      <th style="width: 240px; text-align:left;" data-i18n="STMemoryBooks_Triggers">Triggers</th>
      <th style="width: 120px; text-align:right;" data-i18n="STMemoryBooks_Actions">Actions</th>
    </tr>
  </thead>
  <tbody>
    {{#if items}}
      {{#each items}}
        <tr data-tpl-key="{{key}}" style="cursor: pointer; border-bottom: 1px solid var(--SmartThemeBorderColor);">
          <td style="padding: 8px;">{{name}}</td>
          <td style="padding: 8px;">
              {{#if badges}}
                {{#each badges}}
                  <span class="badge" style="margin-right:6px;">{{this}}</span>
                {{/each}}
              {{else}}
                <span class="opacity50p" data-i18n="STMemoryBooks_None">None</span>
              {{/if}}
          </td>
          <td style="padding: 8px; text-align:right;">
            <span class="stmb-sp-inline-actions" style="display: inline-flex; gap: 10px;">
              <button class="stmb-sp-action stmb-sp-action-edit" title="Edit" aria-label="Edit" data-i18n="[title]STMemoryBooks_Edit;[aria-label]STMemoryBooks_Edit" style="background:none;border:none;cursor:pointer;">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button class="stmb-sp-action stmb-sp-action-duplicate" title="Duplicate" aria-label="Duplicate" data-i18n="[title]STMemoryBooks_Duplicate;[aria-label]STMemoryBooks_Duplicate" style="background:none;border:none;cursor:pointer;">
                <i class="fa-solid fa-copy"></i>
              </button>
              <button class="stmb-sp-action stmb-sp-action-delete" title="Delete" aria-label="Delete" data-i18n="[title]STMemoryBooks_Delete;[aria-label]STMemoryBooks_Delete" style="background:none;border:none;cursor:pointer;color:var(--redColor);">
                <i class="fa-solid fa-trash"></i>
              </button>
            </span>
          </td>
        </tr>
      {{/each}}
    {{else}}
      <tr>
        <td colspan="3">
          <div class="opacity50p" data-i18n="STMemoryBooks_NoSidePromptsAvailable">No side prompts available</div>
        </td>
      </tr>
    {{/if}}
  </tbody>
</table>
`);
