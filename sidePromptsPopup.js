import { Popup, POPUP_TYPE, POPUP_RESULT } from '../../../popup.js';
import { DOMPurify } from '../../../../lib.js';
import { escapeHtml } from '../../../utils.js';
import { extension_settings } from '../../../extensions.js';
import { saveSettingsDebounced } from '../../../../script.js';
import {
    listTemplates,
    getTemplate,
    upsertTemplate,
    duplicateTemplate,
    removeTemplate,
    exportToJSON as exportSidePromptsJSON,
    importFromJSON as importSidePromptsJSON,
} from './sidePromptsManager.js';
import { sidePromptsTableTemplate } from './templatesSidePrompts.js';

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
 * Render the templates table HTML using Handlebars
 * @param {Array} templates
 * @returns {string}
 */
function renderTemplatesTable(templates) {
    const items = (templates || []).map(t => ({
        key: String(t.key || ''),
        name: String(t.name || ''),
        badges: getTriggersSummary(t),
    }));
    return sidePromptsTableTemplate({ items });
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

    listContainer.innerHTML = DOMPurify.sanitize(renderTemplatesTable(filtered));

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
            : false; // default to false for manual when not specified

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
                <label class="checkbox_label">
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

        // Lorebook entry settings (defaults with safe fallbacks)
        const lb = (s && s.lorebook) || {};
        const lbMode = lb.constVectMode || 'link';
        const lbPosition = Number.isFinite(lb.position) ? Number(lb.position) : 0;
        const lbOrderManual = lb.orderMode === 'manual';
        const lbOrderValue = Number.isFinite(lb.orderValue) ? Number(lb.orderValue) : 100;
        const lbPrevent = lb.preventRecursion !== false;
        const lbDelay = !!lb.delayUntilRecursion;

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
                <label class="checkbox_label">
                    <input type="checkbox" id="stmb-sp-edit-enabled" ${currentEnabled ? 'checked' : ''}>
                    <span>Enabled</span>
                </label>
            </div>
            <div class="world_entry_form_control">
                <h4>Triggers:</h4>
                <label class="checkbox_label">
                    <input type="checkbox" id="stmb-sp-edit-trg-interval" ${intervalEnabled ? 'checked' : ''}>
                    <span>Run on visible message interval</span>
                </label>
                <div id="stmb-sp-edit-interval-container" style="display:${intervalEnabled ? 'block' : 'none'}; margin-left:28px;">
                    <label for="stmb-sp-edit-interval">
                        <h4 style="margin: 0 0 4px 0;">Interval (visible messages):</h4>
                        <input type="number" id="stmb-sp-edit-interval" class="text_pole" min="1" step="1" value="${intervalVal}">
                    </label>
                </div>
                <label class="checkbox_label">
                    <input type="checkbox" id="stmb-sp-edit-trg-aftermem" ${afterEnabled ? 'checked' : ''}>
                    <span>Run automatically after memory</span>
                </label>
                <label class="checkbox_label">
                    <input type="checkbox" id="stmb-sp-edit-trg-manual" ${manualEnabled ? 'checked' : ''}>
                    <span>Allow manual run via /sideprompt</span>
                </label>
            </div>
            <div class="world_entry_form_control">
                <label for="stmb-sp-edit-prompt">
                    <h4>Prompt:</h4>
                    <i class="editor_maximize fa-solid fa-maximize right_menu_button" data-for="stmb-sp-edit-prompt" title="Expand the editor" data-i18n="[title]STMemoryBooks_ExpandEditor"></i>
                    <textarea id="stmb-sp-edit-prompt" class="text_pole textarea_compact" rows="10">${escapeHtml(tpl.prompt || '')}</textarea>
                </label>
            </div>
            <div class="world_entry_form_control">
                <label for="stmb-sp-edit-response-format">
                    <h4>Response Format (optional):</h4>
                    <i class="editor_maximize fa-solid fa-maximize right_menu_button" data-for="stmb-sp-edit-response-format" title="Expand the editor" data-i18n="[title]STMemoryBooks_ExpandEditor"></i>
                    <textarea id="stmb-sp-edit-response-format" class="text_pole textarea_compact" rows="6">${escapeHtml(tpl.responseFormat || '')}</textarea>
                </label>
            </div>
            <div class="world_entry_form_control">
                <h4>Lorebook Entry Settings:</h4>
                <div class="flex-container" style="gap:12px; flex-wrap: wrap;">
                    <label>
                        <h4 style="margin: 0 0 4px 0;">Vectorization Mode:</h4>
                        <select id="stmb-sp-edit-lb-mode" class="text_pole">
                            <option value="link" ${lbMode === 'link' ? 'selected' : ''}>Vectorized (link)</option>
                            <option value="green" ${lbMode === 'green' ? 'selected' : ''}>Normal (green)</option>
                            <option value="blue" ${lbMode === 'blue' ? 'selected' : ''}>Constant (blue)</option>
                        </select>
                    </label>
                    <label>
                        <h4 style="margin: 0 0 4px 0;">Insertion Position:</h4>
                        <select id="stmb-sp-edit-lb-position" class="text_pole">
                            <option value="0" ${lbPosition === 0 ? 'selected' : ''}>↑Char</option>
                            <option value="1" ${lbPosition === 1 ? 'selected' : ''}>↓Char</option>
                            <option value="2" ${lbPosition === 2 ? 'selected' : ''}>↑AN</option>
                            <option value="3" ${lbPosition === 3 ? 'selected' : ''}>↓AN</option>
                            <option value="4" ${lbPosition === 4 ? 'selected' : ''}>↑EM</option>
                            <option value="5" ${lbPosition === 5 ? 'selected' : ''}>↓EM</option>
                        </select>
                    </label>
                </div>
                <div class="world_entry_form_control" style="margin-top: 8px;">
                    <h4>Order:</h4>
                    <label class="radio_label">
                        <input type="radio" name="stmb-sp-edit-lb-order-mode" id="stmb-sp-edit-lb-order-auto" value="auto" ${lbOrderManual ? '' : 'checked'}>
                        <span>Auto</span>
                    </label>
                    <label class="radio_label" style="margin-left: 12px;">
                        <input type="radio" name="stmb-sp-edit-lb-order-mode" id="stmb-sp-edit-lb-order-manual" value="manual" ${lbOrderManual ? 'checked' : ''}>
                        <span>Manual</span>
                    </label>
                    <div id="stmb-sp-edit-lb-order-value-container" style="display:${lbOrderManual ? 'block' : 'none'}; margin-left:28px;">
                        <label>
                            <h4 style="margin: 0 0 4px 0;">Order Value:</h4>
                            <input type="number" id="stmb-sp-edit-lb-order-value" class="text_pole" step="1" value="${lbOrderValue}">
                        </label>
                    </div>
                </div>
                <div class="world_entry_form_control" style="margin-top: 8px;">
                    <label class="checkbox_label">
                        <input type="checkbox" id="stmb-sp-edit-lb-prevent" ${lbPrevent ? 'checked' : ''}>
                        <span>Prevent Recursion</span>
                    </label>
                    <label class="checkbox_label" style="margin-left: 12px;">
                        <input type="checkbox" id="stmb-sp-edit-lb-delay" ${lbDelay ? 'checked' : ''}>
                        <span>Delay Until Recursion</span>
                    </label>
                </div>
            </div>

            <div class="world_entry_form_control">
                <h4>Overrides:</h4>
                ${overrideHtml}
            </div>
        `;

        const editPopup = new Popup(DOMPurify.sanitize(content), POPUP_TYPE.TEXT, '', {
            wide: true,
            large: true,
            allowVerticalScrolling: true,
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

            // Lorebook order mode visibility
            const orderAuto = dlg.querySelector('#stmb-sp-edit-lb-order-auto');
            const orderManual = dlg.querySelector('#stmb-sp-edit-lb-order-manual');
            const orderValCont = dlg.querySelector('#stmb-sp-edit-lb-order-value-container');
            const syncOrderVisibility = () => {
                if (orderValCont) orderValCont.style.display = orderManual?.checked ? 'block' : 'none';
            };
            orderAuto?.addEventListener('change', syncOrderVisibility);
            orderManual?.addEventListener('change', syncOrderVisibility);
        };

        attachHandlers();
        const result = await editPopup.show();
        if (result === POPUP_RESULT.AFFIRMATIVE) {
            const dlg = editPopup.dlg;
            const newName = dlg.querySelector('#stmb-sp-edit-name')?.value.trim() || '';
            const newPrompt = dlg.querySelector('#stmb-sp-edit-prompt')?.value.trim() || '';
            const newResponseFormat = dlg.querySelector('#stmb-sp-edit-response-format')?.value.trim() || '';
            const newEnabled = !!dlg.querySelector('#stmb-sp-edit-enabled')?.checked;

            if (!newPrompt) {
                toastr.error('Prompt cannot be empty', 'STMemoryBooks');
                return;
            }
            if (!newName) {
                toastr.info('Name was empty. Keeping previous name.', 'STMemoryBooks');
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

            // Lorebook settings
            const lbModeSel = dlg.querySelector('#stmb-sp-edit-lb-mode')?.value || 'link';
            const lbPosRaw = parseInt(dlg.querySelector('#stmb-sp-edit-lb-position')?.value ?? '0', 10);
            const lbOrderManual2 = !!dlg.querySelector('#stmb-sp-edit-lb-order-manual')?.checked;
            const lbOrderValRaw = parseInt(dlg.querySelector('#stmb-sp-edit-lb-order-value')?.value ?? '100', 10);
            const lbPrevent2 = !!dlg.querySelector('#stmb-sp-edit-lb-prevent')?.checked;
            const lbDelay2 = !!dlg.querySelector('#stmb-sp-edit-lb-delay')?.checked;

            settings.lorebook = {
                constVectMode: ['link', 'green', 'blue'].includes(lbModeSel) ? lbModeSel : 'link',
                position: Number.isFinite(lbPosRaw) ? lbPosRaw : 0,
                orderMode: lbOrderManual2 ? 'manual' : 'auto',
                orderValue: Number.isFinite(lbOrderValRaw) ? lbOrderValRaw : 100,
                preventRecursion: lbPrevent2,
                delayUntilRecursion: lbDelay2,
            };

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
            window.dispatchEvent(new CustomEvent('stmb-sideprompts-updated'));
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
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-sp-new-enabled">
                <span>Enabled</span>
            </label>
        </div>
        <div class="world_entry_form_control">
            <h4>Triggers:</h4>
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-sp-new-trg-interval">
                <span>Run on visible message interval</span>
            </label>
            <div id="stmb-sp-new-interval-container" class="displayNone" style="margin-left:28px;">
                <label for="stmb-sp-new-interval">
                    <h4 style="margin: 0 0 4px 0;">Interval (visible messages):</h4>
                    <input type="number" id="stmb-sp-new-interval" class="text_pole" min="1" step="1" value="50">
                </label>
            </div>
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-sp-new-trg-aftermem">
                <span>Run automatically after memory</span>
            </label>
            <label class="checkbox_label">
                <input type="checkbox" id="stmb-sp-new-trg-manual" checked>
                <span>Allow manual run via /sideprompt</span>
            </label>
        </div>
        <div class="world_entry_form_control">
            <label for="stmb-sp-new-prompt">
                <h4>Prompt:</h4>
                <i class="editor_maximize fa-solid fa-maximize right_menu_button" data-for="stmb-sp-new-prompt" title="Expand the editor" data-i18n="[title]STMemoryBooks_ExpandEditor"></i>
                <textarea id="stmb-sp-new-prompt" class="text_pole textarea_compact" rows="8" placeholder="Enter your prompt..."></textarea>
            </label>
        </div>
        <div class="world_entry_form_control">
            <label for="stmb-sp-new-response-format">
                <h4>Response Format (optional):</h4>
                <i class="editor_maximize fa-solid fa-maximize right_menu_button" data-for="stmb-sp-new-response-format" title="Expand the editor" data-i18n="[title]STMemoryBooks_ExpandEditor"></i>
                <textarea id="stmb-sp-new-response-format" class="text_pole textarea_compact" rows="6" placeholder="Optional response format"></textarea>
            </label>
        </div>
        <div class="world_entry_form_control">
            <h4>Lorebook Entry Settings:</h4>
            <div class="flex-container" style="gap:12px; flex-wrap: wrap;">
                <label>
                    <h4 style="margin: 0 0 4px 0;">Vectorization Mode:</h4>
                    <select id="stmb-sp-new-lb-mode" class="text_pole">
                        <option value="link" selected>Vectorized (link)</option>
                        <option value="green">Normal (green)</option>
                        <option value="blue">Constant (blue)</option>
                    </select>
                </label>
                <label>
                    <h4 style="margin: 0 0 4px 0;">Insertion Position:</h4>
                    <select id="stmb-sp-new-lb-position" class="text_pole">
                        <option value="0" selected>↑Char</option>
                        <option value="1">↓Char</option>
                        <option value="2">↑AN</option>
                        <option value="3">↓AN</option>
                        <option value="4">↑EM</option>
                        <option value="5">↓EM</option>
                    </select>
                </label>
            </div>
            <div class="world_entry_form_control" style="margin-top: 8px;">
                <h4>Order:</h4>
                <label class="radio_label">
                    <input type="radio" name="stmb-sp-new-lb-order-mode" id="stmb-sp-new-lb-order-auto" value="auto" checked>
                    <span>Auto</span>
                </label>
                <label class="radio_label" style="margin-left: 12px;">
                    <input type="radio" name="stmb-sp-new-lb-order-mode" id="stmb-sp-new-lb-order-manual" value="manual">
                    <span>Manual</span>
                </label>
                <div id="stmb-sp-new-lb-order-value-container" style="display:none; margin-left:28px;">
                    <label>
                        <h4 style="margin: 0 0 4px 0;">Order Value:</h4>
                        <input type="number" id="stmb-sp-new-lb-order-value" class="text_pole" step="1" value="100">
                    </label>
                </div>
            </div>
            <div class="world_entry_form_control" style="margin-top: 8px;">
                <label class="checkbox_label">
                    <input type="checkbox" id="stmb-sp-new-lb-prevent" checked>
                    <span>Prevent Recursion</span>
                </label>
                <label class="checkbox_label" style="margin-left: 12px;">
                    <input type="checkbox" id="stmb-sp-new-lb-delay">
                    <span>Delay Until Recursion</span>
                </label>
            </div>
        </div>

        <div class="world_entry_form_control">
            <h4>Overrides:</h4>
            <div class="world_entry_form_control">
                <label class="checkbox_label">
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
        wide: true,
        large: true,
        allowVerticalScrolling: true,
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

        // Lorebook order mode visibility
        const orderAuto = dlg.querySelector('#stmb-sp-new-lb-order-auto');
        const orderManual = dlg.querySelector('#stmb-sp-new-lb-order-manual');
        const orderValCont = dlg.querySelector('#stmb-sp-new-lb-order-value-container');
        const syncOrderVisibility = () => {
            if (orderValCont) orderValCont.style.display = orderManual?.checked ? 'block' : 'none';
        };
        orderAuto?.addEventListener('change', syncOrderVisibility);
        orderManual?.addEventListener('change', syncOrderVisibility);
    };

    attachHandlers();
    const result = await newPopup.show();
    if (result === POPUP_RESULT.AFFIRMATIVE) {
        const dlg = newPopup.dlg;
        const name = dlg.querySelector('#stmb-sp-new-name')?.value.trim() || '';
        const enabled = !!dlg.querySelector('#stmb-sp-new-enabled')?.checked;
        const prompt = dlg.querySelector('#stmb-sp-new-prompt')?.value.trim() || '';
        const responseFormat = dlg.querySelector('#stmb-sp-new-response-format')?.value.trim() || '';

        if (!prompt) {
            toastr.error('Prompt cannot be empty', 'STMemoryBooks');
            return;
        }
        if (!name) {
            toastr.info('No name provided. Using "Untitled Side Prompt".', 'STMemoryBooks');
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

        // Settings - lorebook
        const lbModeSel = dlg.querySelector('#stmb-sp-new-lb-mode')?.value || 'link';
        const lbPosRaw = parseInt(dlg.querySelector('#stmb-sp-new-lb-position')?.value ?? '0', 10);
        const lbOrderManual2 = !!dlg.querySelector('#stmb-sp-new-lb-order-manual')?.checked;
        const lbOrderValRaw = parseInt(dlg.querySelector('#stmb-sp-new-lb-order-value')?.value ?? '100', 10);
        const lbPrevent2 = !!dlg.querySelector('#stmb-sp-new-lb-prevent')?.checked;
        const lbDelay2 = !!dlg.querySelector('#stmb-sp-new-lb-delay')?.checked;

        settings.lorebook = {
            constVectMode: ['link', 'green', 'blue'].includes(lbModeSel) ? lbModeSel : 'link',
            position: Number.isFinite(lbPosRaw) ? lbPosRaw : 0,
            orderMode: lbOrderManual2 ? 'manual' : 'auto',
            orderValue: Number.isFinite(lbOrderValRaw) ? lbOrderValRaw : 100,
            preventRecursion: lbPrevent2,
            delayUntilRecursion: lbDelay2,
        };

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

        // Global setting: max concurrent side prompts
        content += '<div class="world_entry_form_control">';
        content += '<label for="stmb-sp-max-concurrent"><h4>How many concurrent prompts to run at once</h4></label>';
        content += '<input type="number" id="stmb-sp-max-concurrent" class="text_pole" min="1" max="5" step="1" value="2">';
        content += '<small class="opacity70p">Range 1–5. Defaults to 2.</small>';
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

            // Max concurrent control
            const spMaxInput = dlg.querySelector('#stmb-sp-max-concurrent');
            if (spMaxInput) {
                const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
                const current = clamp(Number(extension_settings?.STMemoryBooks?.moduleSettings?.sidePromptsMaxConcurrent ?? 2), 1, 5);
                spMaxInput.value = String(current);
                const persist = () => {
                    const raw = parseInt(spMaxInput.value, 10);
                    const val = clamp(isNaN(raw) ? 2 : raw, 1, 5);
                    spMaxInput.value = String(val);
                    // Ensure settings objects exist
                    if (!extension_settings.STMemoryBooks) extension_settings.STMemoryBooks = { moduleSettings: {} };
                    if (!extension_settings.STMemoryBooks.moduleSettings) extension_settings.STMemoryBooks.moduleSettings = {};
                    extension_settings.STMemoryBooks.moduleSettings.sidePromptsMaxConcurrent = val;
                    saveSettingsDebounced();
                };
                spMaxInput.addEventListener('change', persist);
            }

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
