import { Popup, POPUP_TYPE, POPUP_RESULT } from '../../../popup.js';
import { DOMPurify } from '../../../../lib.js';
import { escapeHtml } from '../../../utils.js';
import { extension_settings } from '../../../extensions.js';
import {
    listTemplates,
    getTemplate,
    upsertTemplate,
    duplicateTemplate,
    removeTemplate,
    exportToJSON as exportSidePromptsJSON,
    importFromJSON as importSidePromptsJSON,
} from './sidePromptsManager.js';

/**
 * Build a human-readable triggers summary array for display/search
 * @param {any} tpl
 * @returns {string[]}
 */
function getTriggersSummary(tpl) {
    const badges = [];
    const trig = tpl?.triggers || {};
    if (trig.onInterval && Number(trig.onInterval.visibleMessages) >= 1) {
        badges.push(`Interval:${Number(trig.onInterval.visibleMessages)}`);
    }
    if (trig.onAfterMemory && !!trig.onAfterMemory.enabled) {
        badges.push('AfterMemory');
    }
    if (Array.isArray(trig.commands) && trig.commands.some(c => String(c).toLowerCase() === 'sideprompt')) {
        badges.push('Manual');
    }
    return badges;
}

/**
 * Render the templates table HTML
 * @param {Array} templates
 * @returns {string}
 */
function renderTemplatesTable(templates) {
    let html = '';
    html += '<table style="width: 100%; border-collapse: collapse;">';
    html += '<thead><tr>';
    html += '<th style="text-align:left;">Name</th>';
    html += '<th style="width: 240px; text-align:left;">Triggers</th>';
    html += '<th style="width: 120px; text-align:right;">Actions</th>';
    html += '</tr></thead>';
    html += '<tbody>';

    if (!templates || templates.length === 0) {
        html += '<tr><td colspan="3"><div class="opacity50p">No side prompts available</div></td></tr>';
    } else {
        for (const tpl of templates) {
            const badges = getTriggersSummary(tpl);
            const badgesHtml = badges.length > 0
                ? badges.map(b => `<span class="badge" style="margin-right:6px;">${escapeHtml(b)}</span>`).join('')
                : '<span class="opacity50p">None</span>';

            html += `<tr data-tpl-key="${escapeHtml(tpl.key)}" style="cursor: pointer; border-bottom: 1px solid var(--SmartThemeBorderColor);">`;
            html += `<td style="padding: 8px;">${escapeHtml(tpl.name)}</td>`;
            html += `<td style="padding: 8px;">${badgesHtml}</td>`;
            html += '<td style="padding: 8px; text-align:right;">' +
                '<span class="stmb-sp-inline-actions" style="display: inline-flex; gap: 10px;">' +
                '<button class="stmb-sp-action stmb-sp-action-edit" title="Edit" aria-label="Edit" style="background:none;border:none;cursor:pointer;">' +
                '<i class="fa-solid fa-pen"></i>' +
                '</button>' +
                '<button class="stmb-sp-action stmb-sp-action-duplicate" title="Duplicate" aria-label="Duplicate" style="background:none;border:none;cursor:pointer;">' +
                '<i class="fa-solid fa-copy"></i>' +
                '</button>' +
                '<button class="stmb-sp-action stmb-sp-action-delete" title="Delete" aria-label="Delete" style="background:none;border:none;cursor:pointer;color:var(--redColor);">' +
                '<i class="fa-solid fa-trash"></i>' +
                '</button>' +
                '</span>' +
                '</td>';
            html += '</tr>';
        }
    }

    html += '</tbody></table>';
    return html;
}

/**
 * Refresh the list in the open popup
 * @param {Popup} popup
 * @param {string|null} preserveKey
 */
async function refreshList(popup, preserveKey = null) {
    const listContainer = popup?.dlg?.querySelector('#stmb-sp-list');
    if (!listContainer) return;

    const searchTerm = (popup?.dlg?.querySelector('#stmb-sp-search')?.value || '').toLowerCase();

    const templates = await listTemplates();
    const filtered = searchTerm
        ? templates.filter(t => {
            const nameMatch = t.name.toLowerCase().includes(searchTerm);
            const trigStr = getTriggersSummary(t).join(' ').toLowerCase();
            return nameMatch || trigStr.includes(searchTerm);
        })
        : templates;

    listContainer.innerHTML = renderTemplatesTable(filtered);

    // Restore selection
    if (preserveKey) {
        const row = listContainer.querySelector(`tr[data-tpl-key="${CSS.escape(preserveKey)}"]`);
        if (row) {
            row.style.backgroundColor = 'var(--cobalt30a)';
            row.style.border = '';
        }
    }
}

/**
 * Open editor for an existing template (triggers-based)
 * @param {Popup} parentPopup
 * @param {string} key
 */
async function openEditTemplate(parentPopup, key) {
    try {
        const tpl = await getTemplate(key);
        if (!tpl) {
            toastr.error('Template not found', 'STMemoryBooks');
            return;
        }

        const currentEnabled = !!tpl.enabled;
        const s = tpl.settings || {};
        const trig = tpl.triggers || {};

        const intervalEnabled = !!(trig.onInterval && Number(trig.onInterval.visibleMessages) >= 1);
        const intervalVal = intervalEnabled ? Math.max(1, Number(trig.onInterval.visibleMessages)) : 50;
        const afterEnabled = !!(trig.onAfterMemory && trig.onAfterMemory.enabled);
        const manualEnabled = Array.isArray(trig.commands)
            ? trig.commands.some(c => String(c).toLowerCase() === 'sideprompt')
            : true; // default to true for manual

        // Per-template override controls
        const profiles = extension_settings?.STMemoryBooks?.profiles || [];
        let idx = Number.isFinite(s.overrideProfileIndex) ? Number(s.overrideProfileIndex) : (extension_settings?.STMemoryBooks?.defaultProfile ?? 0);
        if (!(idx >= 0 && idx < profiles.length)) idx = 0;
        const overrideEnabled = !!s.overrideProfileEnabled;
        const options = profiles.map((p, i) =>
            `<option value="${i}" ${i === idx ? 'selected' : ''}>${escapeHtml(p?.name || ('Profile ' + (i + 1)))}</option>`
        ).join('');

        const overrideHtml = `
            <div class="world_entry_form_control">
                <label>
                    <input type="checkbox" id="stmb-sp-edit-override-enabled" ${overrideEnabled ? 'checked' : ''}>
                    <span>Override default memory profile</span>
                </label>
            </div>
            <div class="world_entry_form_control" id="stmb-sp-edit-override-container" style="display: ${overrideEnabled ? 'block' : 'none'};">
                <label for="stmb-sp-edit-override-index">
                    <h4>Connection Profile:</h4>
                    <select id="stmb-sp-edit-override-index" class="text_pole">
                        ${options}
                    </select>
                </label>
            </div>
        `;

        const content = `
            <h3>Edit Side Prompt</h3>
            <div class="world_entry_form_control">
                <small>Key: <code>${escapeHtml(tpl.key)}</code></small>
            </div>
            <div class="world_entry_form_control">
                <label for="stmb-sp-edit-name">
                    <h4>Name:</h4>
                    <input type="text" id="stmb-sp-edit-name" class="text_pole" value="${escapeHtml(tpl.name)}" />
                </label>
            </div>
            <div class="world_entry_form_control">
                <label>
                    <input type="checkbox" id="stmb-sp-edit-enabled" ${currentEnabled ? 'checked' : ''}>
                    <span>Enabled</span>
                </label>
            </div>
            <div class="world_entry_form_control">
                <h4>Triggers:</h4>
                <label class="checkbox_label" style="display:block;margin-bottom:6px;">
                    <input type="checkbox" id="stmb-sp-edit-trg-interval" ${intervalEnabled ? 'checked' : ''}>
                    <span>Run on visible message interval</span>
                </label>
                <div class="world_entry_form_control" id="stmb-sp-edit-interval-container" style="display:${intervalEnabled ? 'block' : 'none'};margin-left:20px;">
                    <label for="stmb-sp-edit-interval">
                        <h4>Interval (visible messages):</h4>
                        <input type="number" id="stmb-sp-edit-interval" class="text_pole" min="1" step="1" value="${intervalVal}">
                    </label>
                </div>
                <label class="checkbox_label" style="display:block;margin-bottom:6px;">
                    <input type="checkbox" id="stmb-sp-edit-trg-aftermem" ${afterEnabled ? 'checked' : ''}>
                    <span>Run automatically after memory</span>
                </label>
                <label class="checkbox_label" style="display:block;margin-bottom:6px;">
                    <input type="checkbox" id="stmb-sp-edit-trg-manual" ${manualEnabled ? 'checked' : ''}>
                    <span>Allow manual run via /sideprompt</span>
                </label>
            </div>
            <div class="world_entry_form_control">
                <label for="stmb-sp-edit-prompt">
                    <h4>Prompt:</h4>
                    <textarea id="stmb-sp-edit-prompt" class="text_pole textarea_compact" rows="10">${escapeHtml(tpl.prompt || '')}</textarea>
                </label>
            </div>
            <div class="world_entry_form_control">
                <label for="stmb-sp-edit-response-format">
                    <h4>Response Format (optional):</h4>
                    <textarea id="stmb-sp-edit-response-format" class="text_pole textarea_compact" rows="6">${escapeHtml(tpl.responseFormat || '')}</textarea>
                </label>
            </div>
            <div class="world_entry_form_control">
                <h4>Overrides:</h4>
                ${overrideHtml}
            </div>
        `;

        const editPopup = new Popup(DOMPurify.sanitize(content), POPUP_TYPE.TEXT, '', {
            okButton: 'Save',
            cancelButton: 'Cancel'
        });

        // Attach dynamic handlers before show
        const attachHandlers = () => {
            const dlg = editPopup.dlg;
            if (!dlg) return;

            const cbInterval = dlg.querySelector('#stmb-sp-edit-trg-interval');
            const intervalCont = dlg.querySelector('#stmb-sp-edit-interval-container');
            cbInterval?.addEventListener('change', () => {
                if (intervalCont) intervalCont.style.display = cbInterval.checked ? 'block' : 'none';
            });

            const cbOverride = dlg.querySelector('#stmb-sp-edit-override-enabled');
            const overrideCont = dlg.querySelector('#stmb-sp-edit-override-container');
            cbOverride?.addEventListener('change', () => {
                if (overrideCont) overrideCont.style.display = cbOverride.checked ? 'block' : 'none';
            });
        };

        attachHandlers();
        const result = await editPopup.show();
        if (result === POPUP_RESULT.AFFIRMATIVE) {
            const dlg = editPopup.dlg;
            const newName = dlg.querySelector('#stmb-sp-edit-name')?.value.trim() || '';
            const newPrompt = dlg.querySelector('#stmb-sp-edit-prompt')?.value.trim() || '';
            const newResponseFormat = dlg.querySelector('#stmb-sp-edit-response-format')?.value.trim() || '';
            const newEnabled = !!dlg.querySelector('#stmb-sp-edit-enabled')?.checked;

            if (!newName) {
                toastr.error('Name cannot be empty', 'STMemoryBooks');
                return;
            }
            if (!newPrompt) {
                toastr.error('Prompt cannot be empty', 'STMemoryBooks');
                return;
            }

            // Triggers
            const triggers = {};
            const intervalOn = !!dlg.querySelector('#stmb-sp-edit-trg-interval')?.checked;
            const afterOn = !!dlg.querySelector('#stmb-sp-edit-trg-aftermem')?.checked;
            const manualOn = !!dlg.querySelector('#stmb-sp-edit-trg-manual')?.checked;

            if (intervalOn) {
                const intervalRaw = parseInt(dlg.querySelector('#stmb-sp-edit-interval')?.value ?? '50', 10);
                const vis = Math.max(1, isNaN(intervalRaw) ? 50 : intervalRaw);
                triggers.onInterval = { visibleMessages: vis };
            }
            if (afterOn) {
                triggers.onAfterMemory = { enabled: true };
            }
            if (manualOn) {
                triggers.commands = ['sideprompt'];
            }

            // Overrides in settings
            const settings = { ...(tpl.settings || {}) };
            const overrideEnabled2 = !!dlg.querySelector('#stmb-sp-edit-override-enabled')?.checked;
            settings.overrideProfileEnabled = overrideEnabled2;
            if (overrideEnabled2) {
                const oidx = parseInt(dlg.querySelector('#stmb-sp-edit-override-index')?.value ?? '', 10);
                if (!isNaN(oidx)) settings.overrideProfileIndex = oidx;
            } else {
                delete settings.overrideProfileIndex;
            }

            await upsertTemplate({
                key: tpl.key,
                name: newName,
                enabled: newEnabled,
                prompt: newPrompt,
                responseFormat: newResponseFormat,
                settings,
                triggers,
            });
            toastr.success('Template updated', 'STMemoryBooks');
            await refreshList(parentPopup, tpl.key);
        }
    } catch (err) {
        console.error('STMemoryBooks: Error editing side prompt:', err);
        toastr.error('Failed to edit template', 'STMemoryBooks');
    }
}

/**
 * Open create-new template dialog (triggers-based)
 * @param {Popup} parentPopup
 */
async function openNewTemplate(parentPopup) {
    // Default triggers: manual enabled; others off
    const profiles = extension_settings?.STMemoryBooks?.profiles || [];
    let idx = Number(extension_settings?.STMemoryBooks?.defaultProfile ?? 0);
    if (!(idx >= 0 && idx < profiles.length)) idx = 0;

    const options = profiles.map((p, i) =>
        `<option value="${i}" ${i === idx ? 'selected' : ''}>${escapeHtml(p?.name || ('Profile ' + (i + 1)))}</option>`
    ).join('');

    const content = `
        <h3>New Side Prompt</h3>
        <div class="world_entry_form_control">
            <label for="stmb-sp-new-name">
                <h4>Name:</h4>
                <input type="text" id="stmb-sp-new-name" class="text_pole" placeholder="My Side Prompt" />
            </label>
        </div>
        <div class="world_entry_form_control">
            <label>
                <input type="checkbox" id="stmb-sp-new-enabled">
                <span>Enabled</span>
            </label>
        </div>
        <div class="world_entry_form_control">
            <h4>Triggers:</h4>
            <label class="checkbox_label" style="display:block;margin-bottom:6px;">
                <input type="checkbox" id="stmb-sp-new-trg-interval">
                <span>Run on visible message interval</span>
            </label>
            <div class="world_entry_form_control displayNone" id="stmb-sp-new-interval-container" style="margin-left:20px;">
                <label for="stmb-sp-new-interval">
                    <h4>Interval (visible messages):</h4>
                    <input type="number" id="stmb-sp-new-interval" class="text_pole" min="1" step="1" value="50">
                </label>
            </div>
            <label class="checkbox_label" style="display:block;margin-bottom:6px;">
                <input type="checkbox" id="stmb-sp-new-trg-aftermem">
                <span>Run automatically after memory</span>
            </label>
            <label class="checkbox_label" style="display:block;margin-bottom:6px;">
                <input type="checkbox" id="stmb-sp-new-trg-manual" checked>
                <span>Allow manual run via /sideprompt</span>
            </label>
        </div>
        <div class="world_entry_form_control">
            <label for="stmb-sp-new-prompt">
                <h4>Prompt:</h4>
                <textarea id="stmb-sp-new-prompt" class="text_pole textarea_compact" rows="8" placeholder="Enter your prompt..."></textarea>
            </label>
        </div>
        <div class="world_entry_form_control">
            <label for="stmb-sp-new-response-format">
                <h4>Response Format (optional):</h4>
                <textarea id="stmb-sp-new-response-format" class="text_pole textarea_compact" rows="6" placeholder="Optional response format"></textarea>
            </label>
        </div>
        <div class="world_entry_form_control">
            <h4>Overrides:</h4>
            <div class="world_entry_form_control">
                <label>
                    <input type="checkbox" id="stmb-sp-new-override-enabled">
                    <span>Override default memory profile</span>
                </label>
            </div>
            <div class="world_entry_form_control" id="stmb-sp-new-override-container" style="display: none;">
                <label for="stmb-sp-new-override-index">
                    <h4>Connection Profile:</h4>
                    <select id="stmb-sp-new-override-index" class="text_pole">
                        ${options}
                    </select>
                </label>
            </div>
        </div>
    `;

    const newPopup = new Popup(DOMPurify.sanitize(content), POPUP_TYPE.TEXT, '', {
        okButton: 'Create',
        cancelButton: 'Cancel'
    });

    const attachHandlers = () => {
        const dlg = newPopup.dlg;

        const cbInterval = dlg.querySelector('#stmb-sp-new-trg-interval');
        const intervalCont = dlg.querySelector('#stmb-sp-new-interval-container');
        cbInterval?.addEventListener('change', () => {
            if (intervalCont) intervalCont.style.display = cbInterval.checked ? 'block' : 'none';
        });

        const cbOverride = dlg.querySelector('#stmb-sp-new-override-enabled');
        const overrideCont = dlg.querySelector('#stmb-sp-new-override-container');
        cbOverride?.addEventListener('change', () => {
            if (overrideCont) overrideCont.style.display = cbOverride.checked ? 'block' : 'none';
        });
    };

    attachHandlers();
    const result = await newPopup.show();
    if (result === POPUP_RESULT.AFFIRMATIVE) {
        const dlg = newPopup.dlg;
        const name = dlg.querySelector('#stmb-sp-new-name')?.value.trim() || '';
        const enabled = !!dlg.querySelector('#stmb-sp-new-enabled')?.checked;
        const prompt = dlg.querySelector('#stmb-sp-new-prompt')?.value.trim() || '';
        const responseFormat = dlg.querySelector('#stmb-sp-new-response-format')?.value.trim() || '';

        if (!name) {
            toastr.error('Name cannot be empty', 'STMemoryBooks');
            return;
        }
        if (!prompt) {
            toastr.error('Prompt cannot be empty', 'STMemoryBooks');
            return;
        }

        // Build triggers
        const triggers = {};
        const intervalOn = !!dlg.querySelector('#stmb-sp-new-trg-interval')?.checked;
        const afterOn = !!dlg.querySelector('#stmb-sp-new-trg-aftermem')?.checked;
        const manualOn = !!dlg.querySelector('#stmb-sp-new-trg-manual')?.checked;

        if (intervalOn) {
            const intervalRaw = parseInt(dlg.querySelector('#stmb-sp-new-interval')?.value ?? '50', 10);
            const vis = Math.max(1, isNaN(intervalRaw) ? 50 : intervalRaw);
            triggers.onInterval = { visibleMessages: vis };
        }
        if (afterOn) {
            triggers.onAfterMemory = { enabled: true };
        }
        if (manualOn) {
            triggers.commands = ['sideprompt'];
        }

        // Settings - overrides
        const settings = {};
        const overrideEnabled = !!dlg.querySelector('#stmb-sp-new-override-enabled')?.checked;
        settings.overrideProfileEnabled = overrideEnabled;
        if (overrideEnabled) {
            const oidx = parseInt(dlg.querySelector('#stmb-sp-new-override-index')?.value ?? '', 10);
            if (!isNaN(oidx)) settings.overrideProfileIndex = oidx;
        }

        try {
            await upsertTemplate({ name, enabled, prompt, responseFormat, settings, triggers });
            toastr.success('Template created', 'STMemoryBooks');
            await refreshList(parentPopup);
        } catch (err) {
            console.error('STMemoryBooks: Error creating side prompt:', err);
            toastr.error('Failed to create template', 'STMemoryBooks');
        }
    }
}

/**
 * Export templates to JSON and download
 */
async function exportTemplates() {
    try {
        const json = await exportSidePromptsJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'stmb-side-prompts.json';
        a.click();
        URL.revokeObjectURL(url);
        toastr.success('Exported side prompts', 'STMemoryBooks');
    } catch (err) {
        console.error('STMemoryBooks: Error exporting side prompts:', err);
        toastr.error('Failed to export', 'STMemoryBooks');
    }
}

/**
 * Import templates from JSON text
 * @param {Event} event
 * @param {Popup} parentPopup
 */
async function importTemplates(event, parentPopup) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
        const text = await file.text();
        await importSidePromptsJSON(text);
        toastr.success('Imported side prompts', 'STMemoryBooks');
        await refreshList(parentPopup);
    } catch (err) {
        console.error('STMemoryBooks: Error importing side prompts:', err);
        toastr.error('Failed to import: ' + (err?.message || 'Unknown error'), 'STMemoryBooks');
    }
}

/**
 * Show the Side Prompts popup (list view with Edit/Copy/Trash and New/Export/Import)
 */
export async function showSidePromptsPopup() {
    try {
        let content = '<h3 data-i18n="STMemoryBooks_SidePrompts_Title">🧩 Side Prompts</h3>';
        content += '<div class="world_entry_form_control">';
        content += '<p class="opacity70p" data-i18n="STMemoryBooks_SidePrompts_Desc">Create and manage side prompts for trackers and other behind-the-scenes functions.</p>';
        content += '</div>';

        // Search/filter box
        content += '<div class="world_entry_form_control">';
        content += '<input type="text" id="stmb-sp-search" class="text_pole" placeholder="Search by name or trigger..." aria-label="Search side prompts" />';
        content += '</div>';

        // List container
        content += '<div id="stmb-sp-list" class="padding10 marginBot10" style="max-height: 400px; overflow-y: auto;"></div>';

        // Action buttons
        content += '<div class="flex-container marginTop10" style="justify-content: center; gap: 10px;">';
        content += '<button id="stmb-sp-new" class="menu_button">➕ New</button>';
        content += '<button id="stmb-sp-export" class="menu_button">📤 Export JSON</button>';
        content += '<button id="stmb-sp-import" class="menu_button">📥 Import JSON</button>';
        content += '</div>';

        // Hidden file input for import
        content += '<input type="file" id="stmb-sp-import-file" accept=".json" style="display: none;" />';

        const popup = new Popup(DOMPurify.sanitize(content), POPUP_TYPE.TEXT, '', {
            wide: true,
            large: true,
            allowVerticalScrolling: true,
            okButton: false,
            cancelButton: 'Close'
        });

        // Attach handlers before show
        const attachHandlers = () => {
            const dlg = popup.dlg;
            if (!dlg) return;

            // Search
            dlg.querySelector('#stmb-sp-search')?.addEventListener('input', () => refreshList(popup));

            // Buttons
            dlg.querySelector('#stmb-sp-new')?.addEventListener('click', async () => {
                await openNewTemplate(popup);
            });
            dlg.querySelector('#stmb-sp-export')?.addEventListener('click', async () => {
                await exportTemplates();
            });
            dlg.querySelector('#stmb-sp-import')?.addEventListener('click', () => {
                dlg.querySelector('#stmb-sp-import-file')?.click();
            });
            dlg.querySelector('#stmb-sp-import-file')?.addEventListener('change', async (e) => {
                await importTemplates(e, popup);
            });

            // Row selection and inline actions
            dlg.addEventListener('click', async (e) => {
                const actionBtn = e.target.closest('.stmb-sp-action');
                const row = e.target.closest('tr[data-tpl-key]');
                if (!row) return;
                const tplKey = row.dataset.tplKey;

                // Highlight selected row
                dlg.querySelectorAll('tr[data-tpl-key]').forEach(r => {
                    r.classList.remove('ui-state-active');
                    r.style.backgroundColor = '';
                    r.style.border = '';
                });
                row.style.backgroundColor = 'var(--cobalt30a)';
                row.style.border = '';

                if (actionBtn) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (actionBtn.classList.contains('stmb-sp-action-edit')) {
                        await openEditTemplate(popup, tplKey);
                    } else if (actionBtn.classList.contains('stmb-sp-action-duplicate')) {
                        try {
                            const newKey = await duplicateTemplate(tplKey);
                            toastr.success('Template duplicated', 'STMemoryBooks');
                            await refreshList(popup, newKey);
                        } catch (err) {
                            console.error('STMemoryBooks: Error duplicating side prompt:', err);
                            toastr.error('Failed to duplicate', 'STMemoryBooks');
                        }
                    } else if (actionBtn.classList.contains('stmb-sp-action-delete')) {
                        const confirmPopup = new Popup(
                            `<h3>Delete Side Prompt</h3><p>Are you sure you want to delete this template?</p>`,
                            POPUP_TYPE.CONFIRM,
                            '',
                            { okButton: 'Delete', cancelButton: 'Cancel' }
                        );
                        const res = await confirmPopup.show();
                        if (res === POPUP_RESULT.AFFIRMATIVE) {
                            try {
                                await removeTemplate(tplKey);
                                toastr.success('Template deleted', 'STMemoryBooks');
                                await refreshList(popup);
                            } catch (err) {
                                console.error('STMemoryBooks: Error deleting side prompt:', err);
                                toastr.error('Failed to delete', 'STMemoryBooks');
                            }
                        }
                    }
                    return;
                }
            });
        };

        // Prepare and show popup
        attachHandlers();
        // Initial render BEFORE show so the table appears immediately
        await refreshList(popup);
        await popup.show();
    } catch (error) {
        console.error('STMemoryBooks: Error showing Side Prompts:', error);
        toastr.error('Failed to open Side Prompts', 'STMemoryBooks');
    }
}
