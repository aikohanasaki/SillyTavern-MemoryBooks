import { Popup, POPUP_TYPE, POPUP_RESULT } from '../../../popup.js';
import { DOMPurify } from '../../../../lib.js';
import { escapeHtml, getSortableDelay } from '../../../utils.js';
import { world_names, loadWorldInfo } from '../../../world-info.js';
import { translate, applyLocale } from '../../../i18n.js';
import { getSceneMarkers, saveMetadataForCurrentContext } from './sceneManager.js';
import {
    CONTEXT_NONE_KEY,
    duplicateContextSetting,
    exportContextSettingsJSON,
    getContextSetting,
    getMigratedContextSettingKeyForProfile,
    importContextSettingsJSON,
    listContextSettings,
    removeContextSetting,
    resolveContextEntryRows,
    upsertContextSetting,
} from './contextSettingsManager.js';
import {
    getLorebookEntryDisplayName,
    markStmbPopup,
    normalizeAdditionalContextEntries,
    withGoBackButton,
} from './utils.js';
import { tr } from './i18nHelpers.js';

function hasChatContextSelection(markers = getSceneMarkers() || {}) {
    return Object.hasOwn(markers, 'contextSettingKey');
}

export function getChatContextSettingKey() {
    const markers = getSceneMarkers() || {};
    return hasChatContextSelection(markers) ? String(markers.contextSettingKey || '') : '';
}

export async function hasValidChatContextSettingSelection() {
    const key = getChatContextSettingKey();
    if (!key) return false;
    if (key === CONTEXT_NONE_KEY) return true;
    return !!await getContextSetting(key);
}

function setChatContextSettingKey(key) {
    const markers = getSceneMarkers() || {};
    const normalized = String(key || '').trim();
    if (normalized) {
        markers.contextSettingKey = normalized;
    } else {
        delete markers.contextSettingKey;
    }
    saveMetadataForCurrentContext();
}

export function clearChatContextSettingKey(key) {
    const markers = getSceneMarkers() || {};
    const normalized = String(key || '').trim();
    if (!hasChatContextSelection(markers)) return false;
    if (normalized && String(markers.contextSettingKey || '') !== normalized) return false;
    delete markers.contextSettingKey;
    saveMetadataForCurrentContext();
    return true;
}

async function getLorebookEntriesForPicker(lorebookName) {
    const data = await loadWorldInfo(lorebookName);
    return Object.entries(data?.entries || {})
        .map(([key, entry]) => ({
            uid: String(entry?.uid ?? key),
            title: getLorebookEntryDisplayName(entry, key),
        }))
        .sort((a, b) => a.title.localeCompare(b.title));
}

function readEntriesFromList(list) {
    if (!list) return [];
    return normalizeAdditionalContextEntries(Array.from(list.querySelectorAll('[data-lorebook-name][data-entry-uid]')).map(row => ({
        lorebookName: row.dataset.lorebookName,
        uid: row.dataset.entryUid,
    })));
}

function setupSortableList(list) {
    if (!list || typeof window.jQuery !== 'function') return;
    try {
        const $list = window.jQuery(list);
        if ($list.data('ui-sortable')) $list.sortable('destroy');
        $list.sortable({
            delay: getSortableDelay(),
            handle: '.stmb-context-setting-drag',
        });
    } catch (error) {
        console.warn('STMemoryBooks: Failed to initialize context setting sorting', error);
    }
}

async function renderEntryRows(list, refs) {
    if (!list) return;
    const normalized = normalizeAdditionalContextEntries(refs);
    if (normalized.length === 0) {
        list.innerHTML = `<div class="opacity70p">${escapeHtml(translate('No additional context entries selected.', 'STMemoryBooks_Profile_AlsoIncludeEmpty'))}</div>`;
        return;
    }

    const renderToken = `${Date.now()}:${Math.random()}`;
    list.dataset.renderToken = renderToken;
    const rows = await resolveContextEntryRows(normalized);
    if (list.dataset.renderToken !== renderToken) return;

    list.innerHTML = rows.map(row => {
        const label = `${row.lorebookName} - ${row.title}`;
        const stale = row.staleReason
            ? `<span class="textWarn">${escapeHtml(translate('Stale', 'STMemoryBooks_Profile_AlsoIncludeStale'))}: ${escapeHtml(row.staleReason)}</span>`
            : '';
        return `
            <div class="stmb-context-setting-entry-row flex-container alignitemscenter gap10px marginTop5" data-lorebook-name="${escapeHtml(row.lorebookName)}" data-entry-uid="${escapeHtml(row.uid)}">
                <span class="fa-solid fa-grip-lines stmb-context-setting-drag drag-handle" title="${escapeHtml(translate('Drag to reorder', 'STMemoryBooks_Profile_AlsoIncludeDrag'))}"></span>
                <span class="flex1">${escapeHtml(label)}</span>
                ${stale}
                <button type="button" class="menu_button stmb-context-setting-remove whitespacenowrap">${escapeHtml(translate('Remove', 'STMemoryBooks_Profile_AlsoIncludeRemove'))}</button>
            </div>
        `;
    }).join('');

    list.querySelectorAll('.stmb-context-setting-remove').forEach(button => {
        button.addEventListener('click', () => {
            button.closest('[data-lorebook-name][data-entry-uid]')?.remove();
            if (!list.querySelector('[data-lorebook-name][data-entry-uid]')) {
                void renderEntryRows(list, []);
            }
        });
    });
    setupSortableList(list);
}

function populateLorebookSelect(select) {
    if (!select) return;
    const names = Array.isArray(world_names) ? world_names.filter(Boolean) : [];
    if (names.length === 0) {
        select.innerHTML = `<option value="">${escapeHtml(translate('No lorebooks found', 'STMemoryBooks_Profile_AlsoIncludeNoLorebooks'))}</option>`;
        select.disabled = true;
        return;
    }
    select.disabled = false;
    select.innerHTML = [
        `<option value="">${escapeHtml(translate('Select a lorebook...', 'STMemoryBooks_Profile_AlsoIncludeSelectLorebook'))}</option>`,
        ...names.map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`),
    ].join('');
}

async function populateEntrySelect(select, lorebookName) {
    if (!select) return;
    select.disabled = true;
    if (!lorebookName) {
        select.innerHTML = `<option value="">${escapeHtml(translate('Select an entry...', 'STMemoryBooks_Profile_AlsoIncludeSelectEntry'))}</option>`;
        return;
    }
    select.innerHTML = `<option value="">${escapeHtml(translate('Loading entries...', 'STMemoryBooks_Profile_AlsoIncludeLoadingEntries'))}</option>`;
    try {
        const entries = await getLorebookEntriesForPicker(lorebookName);
        if (entries.length === 0) {
            select.innerHTML = `<option value="">${escapeHtml(translate('No entries found', 'STMemoryBooks_Profile_AlsoIncludeNoEntries'))}</option>`;
            return;
        }
        select.innerHTML = [
            `<option value="">${escapeHtml(translate('Select an entry...', 'STMemoryBooks_Profile_AlsoIncludeSelectEntry'))}</option>`,
            ...entries.map(entry => `<option value="${escapeHtml(entry.uid)}">${escapeHtml(entry.title)}</option>`),
        ].join('');
        select.disabled = false;
    } catch (error) {
        console.warn('STMemoryBooks: Failed to load entries for context setting picker', error);
        select.innerHTML = `<option value="">${escapeHtml(translate('Failed to load entries', 'STMemoryBooks_Profile_AlsoIncludeLoadFailed'))}</option>`;
    }
}

async function openEditContextSetting(parentPopup, key = null) {
    const setting = key ? await getContextSetting(key) : null;
    const title = key
        ? translate('Edit Context Setting', 'STMemoryBooks_ContextSettings_EditTitle')
        : translate('New Context Setting', 'STMemoryBooks_ContextSettings_NewTitle');
    const content = DOMPurify.sanitize(`
        <h3>${escapeHtml(title)}</h3>
        <div class="world_entry_form_control">
            <label for="stmb-context-setting-name">
                <h4>${escapeHtml(translate('Name', 'STMemoryBooks_Name'))}</h4>
                <input id="stmb-context-setting-name" class="text_pole" value="${escapeHtml(setting?.name || '')}" placeholder="${escapeHtml(translate('Context setting name', 'STMemoryBooks_ContextSettings_NamePlaceholder'))}">
            </label>
        </div>
        <div class="world_entry_form_control">
            <h4>${escapeHtml(translate('Additional Context', 'STMemoryBooks_ContextSettings_AdditionalContext'))}</h4>
            <small class="opacity70p">${escapeHtml(translate('Include selected lorebook entries as additional reference context. Entries run in the order below.', 'STMemoryBooks_ContextSettings_EntriesDesc'))}</small>
            <div class="buttons_block gap10px marginTop5">
                <label for="stmb-context-setting-lorebook" class="flex1">
                    <span>${escapeHtml(translate('Lorebook', 'STMemoryBooks_Profile_AlsoIncludeLorebook'))}</span>
                    <select id="stmb-context-setting-lorebook" class="text_pole"></select>
                </label>
                <label for="stmb-context-setting-entry" class="flex1">
                    <span>${escapeHtml(translate('Entry', 'STMemoryBooks_Profile_AlsoIncludeEntry'))}</span>
                    <select id="stmb-context-setting-entry" class="text_pole"></select>
                </label>
                <button id="stmb-context-setting-add-entry" type="button" class="menu_button whitespacenowrap">${escapeHtml(translate('Add', 'STMemoryBooks_Profile_AlsoIncludeAdd'))}</button>
            </div>
            <div id="stmb-context-setting-entry-list" class="marginTop5"></div>
        </div>
    `);

    const popup = new Popup(content, POPUP_TYPE.TEXT, '', {
        wide: true,
        large: true,
        allowVerticalScrolling: true,
        okButton: translate('Save', 'STMemoryBooks_Save'),
        cancelButton: translate('Cancel/Close', 'STMemoryBooks_CancelClose'),
    });
    markStmbPopup(popup);

    const lorebookSelect = popup.dlg.querySelector('#stmb-context-setting-lorebook');
    const entrySelect = popup.dlg.querySelector('#stmb-context-setting-entry');
    const entryList = popup.dlg.querySelector('#stmb-context-setting-entry-list');
    populateLorebookSelect(lorebookSelect);
    await populateEntrySelect(entrySelect, lorebookSelect?.value || '');
    await renderEntryRows(entryList, setting?.entries || []);

    lorebookSelect?.addEventListener('change', () => {
        void populateEntrySelect(entrySelect, lorebookSelect.value);
    });
    popup.dlg.querySelector('#stmb-context-setting-add-entry')?.addEventListener('click', async () => {
        const lorebookName = String(lorebookSelect?.value || '').trim();
        const uid = String(entrySelect?.value || '').trim();
        if (!lorebookName || !uid) {
            toastr.warning(translate('Choose a lorebook and entry first.', 'STMemoryBooks_Profile_AlsoIncludeMissingSelection'), 'STMemoryBooks');
            return;
        }
        const current = readEntriesFromList(entryList);
        if (current.some(ref => ref.lorebookName === lorebookName && ref.uid === uid)) {
            toastr.warning(translate('That entry is already included in this profile.', 'STMemoryBooks_Profile_AlsoIncludeDuplicate'), 'STMemoryBooks');
            return;
        }
        await renderEntryRows(entryList, [...current, { lorebookName, uid }]);
    });

    const result = await popup.show();
    if (result !== POPUP_RESULT.AFFIRMATIVE) return;

    const name = String(popup.dlg.querySelector('#stmb-context-setting-name')?.value || '').trim()
        || translate('Untitled Context Setting', 'STMemoryBooks_ContextSettings_Untitled');
    await upsertContextSetting({
        key: setting?.key || '',
        name,
        entries: readEntriesFromList(entryList),
    });
    toastr.success(translate('Context setting saved.', 'STMemoryBooks_ContextSettings_Saved'), 'STMemoryBooks');
    await refreshContextSettingsPopup(parentPopup);
}

function renderCurrentChatSelector(settings) {
    const selectedKey = getChatContextSettingKey();
    const hasSelected = selectedKey && selectedKey !== CONTEXT_NONE_KEY && (settings || []).some(setting => setting.key === selectedKey);
    const options = [
        `<option value="" ${!selectedKey ? 'selected' : ''}>${escapeHtml(translate('Unset - prompt when needed', 'STMemoryBooks_ContextSettings_Unset'))}</option>`,
        `<option value="${CONTEXT_NONE_KEY}" ${selectedKey === CONTEXT_NONE_KEY ? 'selected' : ''}>${escapeHtml(translate('No Context', 'STMemoryBooks_ContextSettings_NoContext'))}</option>`,
        ...(hasSelected || !selectedKey || selectedKey === CONTEXT_NONE_KEY ? [] : [`<option value="${escapeHtml(selectedKey)}" selected>${escapeHtml(tr('STMemoryBooks_ContextSettings_MissingOption', 'Missing setting: {{key}}', { key: selectedKey }))}</option>`]),
        ...(settings || []).map(setting => `<option value="${escapeHtml(setting.key)}" ${selectedKey === setting.key ? 'selected' : ''}>${escapeHtml(setting.name)}</option>`),
    ].join('');
    return `
        <div class="world_entry_form_control">
            <label for="stmb-context-current-chat-select">
                <h4>${escapeHtml(translate('Additional Context for this chat', 'STMemoryBooks_ContextSettings_CurrentChat'))}</h4>
                <select id="stmb-context-current-chat-select" class="text_pole">${options}</select>
            </label>
            <small class="opacity70p">${escapeHtml(translate('Choose a context setting, leave unset to be prompted when a migrated profile needs one, or save No Context for this chat.', 'STMemoryBooks_ContextSettings_CurrentChatHelp'))}</small>
        </div>
    `;
}

function renderSettingsList(settings) {
    const rows = (settings || []).map(setting => `
        <tr data-context-setting-key="${escapeHtml(setting.key)}" style="border-bottom: 1px solid var(--SmartThemeBorderColor);">
            <td style="padding: 8px;">${escapeHtml(setting.name)}</td>
            <td style="padding: 8px;">${Number(setting.entries?.length || 0)}</td>
            <td style="padding: 8px; text-align:right;">
                <span class="stmb-context-inline-actions" style="display: inline-flex; gap: 10px;">
                    <button class="stmb-context-action stmb-context-action-edit" title="${escapeHtml(translate('Edit', 'STMemoryBooks_Edit'))}" aria-label="${escapeHtml(translate('Edit', 'STMemoryBooks_Edit'))}" style="background:none;border:none;cursor:pointer;"><i class="fa-solid fa-pen"></i></button>
                    <button class="stmb-context-action stmb-context-action-duplicate" title="${escapeHtml(translate('Duplicate', 'STMemoryBooks_Duplicate'))}" aria-label="${escapeHtml(translate('Duplicate', 'STMemoryBooks_Duplicate'))}" style="background:none;border:none;cursor:pointer;"><i class="fa-solid fa-copy"></i></button>
                    <button class="stmb-context-action stmb-context-action-delete" title="${escapeHtml(translate('Delete', 'STMemoryBooks_Delete'))}" aria-label="${escapeHtml(translate('Delete', 'STMemoryBooks_Delete'))}" style="background:none;border:none;cursor:pointer;color:var(--redColor);"><i class="fa-solid fa-trash"></i></button>
                </span>
            </td>
        </tr>
    `).join('');

    return `
        <div class="world_entry_form_control">
            <h4>${escapeHtml(translate('Context Settings', 'STMemoryBooks_ContextSettings_Title'))}</h4>
            <small class="opacity70p">${escapeHtml(translate('Context settings define ordered lorebook entries to include as Additional Context for memory creation.', 'STMemoryBooks_ContextSettings_Desc'))}</small>
            <div style="max-height: 260px; overflow-y: auto; margin-top: 8px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th style="text-align:left;">${escapeHtml(translate('Name', 'STMemoryBooks_Name'))}</th>
                            <th style="width: 80px; text-align:left;">${escapeHtml(translate('Entries', 'STMemoryBooks_ContextSettings_Entries'))}</th>
                            <th style="width: 120px; text-align:right;">${escapeHtml(translate('Actions', 'STMemoryBooks_Actions'))}</th>
                        </tr>
                    </thead>
                    <tbody>${rows || `<tr><td colspan="3"><div class="opacity50p">${escapeHtml(translate('No context settings available', 'STMemoryBooks_ContextSettings_NoneAvailable'))}</div></td></tr>`}</tbody>
                </table>
            </div>
        </div>
    `;
}

async function refreshContextSettingsPopup(popup) {
    const container = popup?.dlg?.querySelector('#stmb-context-settings-content');
    if (!container) return;
    const settings = await listContextSettings();
    container.innerHTML = DOMPurify.sanitize(renderCurrentChatSelector(settings) + renderSettingsList(settings));
    try { applyLocale(container); } catch {}
    container.querySelector('#stmb-context-current-chat-select')?.addEventListener('change', event => {
        setChatContextSettingKey(event.target.value || '');
        toastr.success(translate('Context setting saved for this chat.', 'STMemoryBooks_ContextSettings_ChatSaved'), 'STMemoryBooks');
    });
}

export async function showContextSettingsPopup() {
    const content = DOMPurify.sanitize(`
        <h3>${escapeHtml(translate('Context Settings', 'STMemoryBooks_ContextSettings_Title'))}</h3>
        <div id="stmb-context-settings-content"></div>
        <div class="buttons_block justifyCenter gap10px whitespacenowrap">
            <button id="stmb-context-new" class="menu_button whitespacenowrap">${escapeHtml(translate('New', 'STMemoryBooks_SidePrompts_New'))}</button>
            <button id="stmb-context-export" class="menu_button whitespacenowrap">${escapeHtml(translate('Export JSON', 'STMemoryBooks_SidePrompts_ExportJSON'))}</button>
            <button id="stmb-context-import" class="menu_button whitespacenowrap">${escapeHtml(translate('Import JSON', 'STMemoryBooks_SidePrompts_ImportJSON'))}</button>
        </div>
        <input type="file" id="stmb-context-import-file" accept=".json" style="display:none;">
    `);
    const popup = new Popup(content, POPUP_TYPE.TEXT, '', withGoBackButton({
        wide: true,
        large: true,
        allowVerticalScrolling: true,
        okButton: false,
        cancelButton: translate('Close', 'STMemoryBooks_Close'),
    }));
    markStmbPopup(popup);

    popup.dlg.querySelector('#stmb-context-new')?.addEventListener('click', async () => {
        await openEditContextSetting(popup, null);
    });
    popup.dlg.querySelector('#stmb-context-export')?.addEventListener('click', async () => {
        const json = await exportContextSettingsJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'stmb-context-settings.json';
        a.click();
        URL.revokeObjectURL(url);
    });
    popup.dlg.querySelector('#stmb-context-import')?.addEventListener('click', () => {
        popup.dlg.querySelector('#stmb-context-import-file')?.click();
    });
    popup.dlg.querySelector('#stmb-context-import-file')?.addEventListener('change', async event => {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            await importContextSettingsJSON(await file.text());
            toastr.success(translate('Context settings imported.', 'STMemoryBooks_ContextSettings_Imported'), 'STMemoryBooks');
            await refreshContextSettingsPopup(popup);
        } catch (error) {
            console.error('STMemoryBooks: Context settings import failed:', error);
            toastr.error(tr('STMemoryBooks_ContextSettings_ImportFailed', 'Failed to import context settings: {{message}}', { message: error?.message || 'Unknown error' }), 'STMemoryBooks');
        } finally {
            event.target.value = '';
        }
    });
    popup.dlg.addEventListener('click', async event => {
        const action = event.target.closest('.stmb-context-action');
        const row = event.target.closest('tr[data-context-setting-key]');
        if (!action || !row) return;
        event.preventDefault();
        const key = row.dataset.contextSettingKey;
        if (action.classList.contains('stmb-context-action-edit')) {
            await openEditContextSetting(popup, key);
        } else if (action.classList.contains('stmb-context-action-duplicate')) {
            await duplicateContextSetting(key);
            toastr.success(translate('Context setting duplicated.', 'STMemoryBooks_ContextSettings_Duplicated'), 'STMemoryBooks');
            await refreshContextSettingsPopup(popup);
        } else if (action.classList.contains('stmb-context-action-delete')) {
            const setting = await getContextSetting(key);
            const confirmPopup = new Popup(
                `<h3>${escapeHtml(translate('Delete Context Setting', 'STMemoryBooks_ContextSettings_DeleteTitle'))}</h3><p>${escapeHtml(tr('STMemoryBooks_ContextSettings_DeleteConfirm', 'Delete "{{name}}"? Chats referencing this setting will warn and continue without Additional Context.', { name: setting?.name || key }))}</p>`,
                POPUP_TYPE.CONFIRM,
                '',
                { okButton: translate('Delete', 'STMemoryBooks_Delete'), cancelButton: translate('Cancel', 'STMemoryBooks_Cancel') },
            );
            if (await confirmPopup.show() === POPUP_RESULT.AFFIRMATIVE) {
                await removeContextSetting(key);
                toastr.success(translate('Context setting deleted.', 'STMemoryBooks_ContextSettings_Deleted'), 'STMemoryBooks');
                await refreshContextSettingsPopup(popup);
            }
        }
    });

    await refreshContextSettingsPopup(popup);
    await popup.show();
}

async function showContextSelectionPrompt({ profile, blocking = false } = {}) {
    const settings = await listContextSettings();
    const migratedKey = await getMigratedContextSettingKeyForProfile(profile);
    const hasMigratedKey = !!migratedKey;
    const selectedDefault = hasMigratedKey ? migratedKey : settings[0]?.key || '';
    const options = settings.map(setting => `<option value="${escapeHtml(setting.key)}" ${selectedDefault === setting.key ? 'selected' : ''}>${escapeHtml(setting.name)}</option>`).join('');
    const profileName = profile?.name || translate('Profile', 'STMemoryBooks_Profile');
    const content = DOMPurify.sanitize(`
        <h3>${escapeHtml(translate('Additional Context Available', 'STMemoryBooks_ContextSettings_RecoveryTitle'))}</h3>
        <div class="world_entry_form_control">
            <p>${escapeHtml(tr('STMemoryBooks_ContextSettings_RecoveryBody', 'The selected profile "{{profile}}" has migrated Additional Context. Choose a context setting for this chat, or save No Context.', { profile: profileName }))}</p>
            <label for="stmb-context-recovery-select">
                <h4>${escapeHtml(translate('Context Setting', 'STMemoryBooks_ContextSettings_Singular'))}</h4>
                <select id="stmb-context-recovery-select" class="text_pole">
                    ${options || `<option value="">${escapeHtml(translate('No context settings available', 'STMemoryBooks_ContextSettings_NoneAvailable'))}</option>`}
                </select>
            </label>
        </div>
    `);
    const popup = new Popup(content, POPUP_TYPE.TEXT, '', {
        wide: true,
        okButton: false,
        cancelButton: blocking ? translate('Cancel', 'STMemoryBooks_Cancel') : translate('Later', 'STMemoryBooks_Later'),
        customButtons: [
            {
                text: translate('Save selected setting', 'STMemoryBooks_ContextSettings_SaveSelected'),
                result: POPUP_RESULT.CUSTOM1,
                appendAtEnd: true,
            },
            {
                text: translate('Save No Context', 'STMemoryBooks_ContextSettings_SaveNoContext'),
                result: POPUP_RESULT.CUSTOM2,
                appendAtEnd: true,
            },
        ],
    });
    markStmbPopup(popup);
    const result = await popup.show();
    if (result === POPUP_RESULT.CUSTOM1) {
        const key = String(popup.dlg.querySelector('#stmb-context-recovery-select')?.value || '').trim();
        if (!key) {
            if (blocking) return { proceed: false, action: 'cancel' };
            return { proceed: true, action: 'later' };
        }
        setChatContextSettingKey(key);
        toastr.success(translate('Context setting saved for this chat.', 'STMemoryBooks_ContextSettings_ChatSaved'), 'STMemoryBooks');
        return { proceed: true, action: 'selected', key };
    }
    if (result === POPUP_RESULT.CUSTOM2) {
        setChatContextSettingKey(CONTEXT_NONE_KEY);
        toastr.success(translate('No Context saved for this chat.', 'STMemoryBooks_ContextSettings_NoContextSaved'), 'STMemoryBooks');
        return { proceed: true, action: 'none', key: CONTEXT_NONE_KEY };
    }
    return { proceed: !blocking, action: blocking ? 'cancel' : 'later' };
}

export async function maybePromptForMigratedContextSetting(profile, options = {}) {
    const markers = getSceneMarkers() || {};
    if (hasChatContextSelection(markers)) {
        if (!await hasValidChatContextSettingSelection()) {
            clearChatContextSettingKey();
        } else {
            return { proceed: true, action: 'already-set', key: String(markers.contextSettingKey || '') };
        }
    }

    const migratedKey = await getMigratedContextSettingKeyForProfile(profile);
    if (!migratedKey) {
        return { proceed: true, action: 'not-needed' };
    }

    return await showContextSelectionPrompt({ profile, blocking: !!options.blocking });
}
