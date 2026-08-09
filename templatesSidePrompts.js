// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import { Handlebars } from '../../../../lib.js';

export const sidePromptsTableTemplate = Handlebars.compile(`
<table style="width: 100%; border-collapse: collapse;">
  <thead>
    <tr>
      <th style="text-align:left;" data-i18n="STMemoryBooks_Name">Name</th>
      <th style="width: 240px; text-align:left;" data-i18n="STMemoryBooks_Triggers">Triggers</th>
      <th style="width: 190px; text-align:right;" data-i18n="STMemoryBooks_Actions">Actions</th>
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
              {{#if special}}
                <select class="text_pole stmb-sp-special-mode" aria-label="Memory Assistance mode" title="Memory Assistance mode" data-i18n="[title]STMemoryBooks_ClipReview_ModeLabel;[aria-label]STMemoryBooks_ClipReview_ModeLabel" style="width:auto;min-width:105px">
                  <option value="off" {{#if modeOff}}selected{{/if}} data-i18n="STMemoryBooks_ClipReview_ModeOff">Off</option>
                  <option value="update" {{#if modeUpdate}}selected{{/if}} data-i18n="STMemoryBooks_ClipReview_ModeUpdate">Update</option>
                  <option value="update_and_suggest" {{#if modeUpdateAndSuggest}}selected{{/if}} data-i18n="STMemoryBooks_ClipReview_ModeUpdateAndSuggest">Update and Suggest</option>
                  <option value="automatic" {{#if modeAutomatic}}selected{{/if}} data-i18n="STMemoryBooks_ClipReview_ModeAutomatic">Automatic</option>
                </select>
              {{else}}
                <button class="stmb-sp-action stmb-sp-action-toggle{{#unless enabled}} opacity50p{{/unless}}" title="{{#if enabled}}Disable side prompt{{else}}Enable side prompt{{/if}}" aria-label="{{#if enabled}}Disable side prompt{{else}}Enable side prompt{{/if}}" aria-pressed="{{#if enabled}}true{{else}}false{{/if}}" data-i18n="[title]{{#if enabled}}STMemoryBooks_DisableSidePrompt{{else}}STMemoryBooks_EnableSidePrompt{{/if}};[aria-label]{{#if enabled}}STMemoryBooks_DisableSidePrompt{{else}}STMemoryBooks_EnableSidePrompt{{/if}}" style="background:none;border:none;cursor:pointer;{{#if enabled}}color:var(--active);{{/if}}">
                  <i class="fa-solid fa-power-off"></i>
                </button>
              {{/if}}
              <button class="stmb-sp-action stmb-sp-action-edit" title="Edit" aria-label="Edit" data-i18n="[title]STMemoryBooks_Edit;[aria-label]STMemoryBooks_Edit" style="background:none;border:none;cursor:pointer;">
                <i class="fa-solid fa-pen"></i>
              </button>
              {{#if special}}
                <button class="stmb-sp-action stmb-sp-action-reset" title="Reset Prompt" aria-label="Reset Prompt" data-i18n="[title]STMemoryBooks_ClipReview_ResetPrompt;[aria-label]STMemoryBooks_ClipReview_ResetPrompt" style="background:none;border:none;cursor:pointer;">
                  <i class="fa-solid fa-rotate-left"></i>
                </button>
              {{/if}}
              {{#unless special}}
                <button class="stmb-sp-action stmb-sp-action-duplicate" title="Duplicate" aria-label="Duplicate" data-i18n="[title]STMemoryBooks_Duplicate;[aria-label]STMemoryBooks_Duplicate" style="background:none;border:none;cursor:pointer;">
                  <i class="fa-solid fa-copy"></i>
                </button>
                <button class="stmb-sp-action stmb-sp-action-delete" title="Delete" aria-label="Delete" data-i18n="[title]STMemoryBooks_Delete;[aria-label]STMemoryBooks_Delete" style="background:none;border:none;cursor:pointer;color:var(--redColor);">
                  <i class="fa-solid fa-trash"></i>
                </button>
              {{/unless}}
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
