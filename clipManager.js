import { Popup, POPUP_RESULT, POPUP_TYPE } from '../../../popup.js';
import { chat_metadata, saveSettingsDebounced } from '../../../../script.js';
import { extension_settings } from '../../../extensions.js';
import {
    createWorldInfoEntry,
    loadWorldInfo,
    METADATA_KEY,
    reloadEditor,
    saveWorldInfo,
    world_names,
} from '../../../world-info.js';
import { DOMPurify } from '../../../../lib.js';
import { oai_settings } from '../../../openai.js';
import { translate } from '../../../i18n.js';
import { escapeHtml } from '../../../utils.js';
import { getEntryByTitle, isMemoryEntry } from './addlore.js';
import { validateLorebookRequirement } from './lorebookValidation.js';
import { getSceneMarkers } from './sceneManager.js';
import { isSidePromptEntryTitle } from './sidePrompts.js';
import { requestCompletion } from './stmemory.js';
import {
    getCurrentApiInfo,
    getUIModelSettings,
    normalizeCompletionSource,
    readIntInput,
    resolveEffectiveConnectionFromProfile,
} from './utils.js';

const MODULE_NAME = 'STMemoryBooks-ClipManager';
const CREATE_NEW_VALUE = '__stmb_create_new_clip_entry__';
const TOKEN_WARNING_THRESHOLD = 500;
const FLOATING_CLIP_X_OFFSET = 6;
const FLOATING_CLIP_Y_OFFSET = -4;
const FLOATING_CLIP_VIEWPORT_PADDING = 8;

export const DEFAULT_COMPACTION_PROMPT_TEMPLATE = `Please aggressively make this lorebook entry more token-efficient while retaining as much useful information as possible.

Rules:
- Preserve all important facts, preferences, relationships, names, unresolved plot points, promises, secrets, constraints, and character-specific details.
- Remove redundancy, filler, repeated phrasing, and low-value wording.
- Merge overlapping bullets where possible.
- Keep the entry readable as a lorebook entry.
- Do not add new facts.
- Do not invent explanations.
- Do not change names, pronouns, macros, or proper nouns.
- Preserve wrapper headings and end markers exactly if present.
- Return only the revised entry content.

Entry type:
{{ENTRY_KIND}}

Entry title:
{{ENTRY_TITLE}}

Entry content:
{{ENTRY_CONTENT}}`;

export const STMB_CLIP_TITLE_SUFFIX = ' [STMB Clip]';

let floatingClipButton = null;
let floatingClipListenersBound = false;
let floatingClipUpdateTimer = null;

function tr(key, fallback) {
    return translate(fallback, key);
}

function estimateTokens(content) {
    return Math.ceil(String(content || '').length / 4);
}

export function isClipEntryTitle(title) {
    return typeof title === 'string' && title.trimEnd().endsWith('[STMB Clip]');
}

export function getClipHeadlineFromTitle(title) {
    const raw = String(title || '').trimEnd();
    if (!isClipEntryTitle(raw)) return raw.trim();
    return raw.slice(0, raw.length - '[STMB Clip]'.length).trim();
}

function validateClipHeadline(headline) {
    const raw = String(headline || '').trim();
    const clean = isClipEntryTitle(raw) ? getClipHeadlineFromTitle(raw) : raw;
    if (!clean) {
        throw new Error(tr('STMemoryBooks_Clip_ErrorEmptyHeadline', 'Entry title / section headline cannot be empty.'));
    }
    if (/[\r\n]/.test(clean) || /[\u0000-\u001F\u007F]/.test(clean)) {
        throw new Error(tr('STMemoryBooks_Clip_ErrorInvalidHeadlineControl', 'Entry title / section headline cannot contain newlines or control characters.'));
    }
    if (clean.includes('[STMB Clip]')) {
        throw new Error(tr('STMemoryBooks_Clip_ErrorInvalidHeadlineSuffix', 'Entry title / section headline cannot contain [STMB Clip].'));
    }
    if (clean.includes('===')) {
        throw new Error(tr('STMemoryBooks_Clip_ErrorInvalidHeadlineMarker', 'Entry title / section headline cannot contain ===.'));
    }
    return clean;
}

export function makeClipEntryTitle(headline) {
    const clean = validateClipHeadline(headline);
    return `${clean}${STMB_CLIP_TITLE_SUFFIX}`;
}

export function makeClipStartMarker(headline) {
    return `=== ${headline} ===`;
}

export function makeClipEndMarker(headline) {
    return `=== END ${headline} ===`;
}

function stripLeadingBulletMarker(line) {
    return String(line || '').replace(/^\s*(?:[-*•]\s+|\d+[.)]\s+)/, '');
}

function formatClipBullet(text) {
    const lines = String(text || '')
        .replace(/\r\n?/g, '\n')
        .split('\n')
        .map(line => stripLeadingBulletMarker(line).trim())
        .filter(Boolean);

    if (lines.length === 0) {
        throw new Error(tr('STMemoryBooks_Clip_ErrorEmptySelectedText', 'Selected text cannot be empty.'));
    }

    const [first, ...rest] = lines;
    return [`- ${first}`, ...rest.map(line => `  ${line}`)].join('\n');
}

export function createClipEntryContent(headline, bulletText) {
    const startMarker = makeClipStartMarker(headline);
    const endMarker = makeClipEndMarker(headline);
    return `${startMarker}\n\n${formatClipBullet(bulletText)}\n\n${endMarker}`;
}

function normalizeBulletForDuplicate(text) {
    return stripLeadingBulletMarker(String(text || ''))
        .trim()
        .replace(/\s+/g, ' ');
}

function collectBulletBlocks(content) {
    const blocks = [];
    let current = null;
    const lines = String(content || '').replace(/\r\n?/g, '\n').split('\n');

    for (const line of lines) {
        if (/^\s*-\s+/.test(line)) {
            if (current) blocks.push(current.join('\n'));
            current = [line];
        } else if (current && /^\s{2,}\S/.test(line)) {
            current.push(line);
        } else if (current) {
            blocks.push(current.join('\n'));
            current = null;
        }
    }

    if (current) blocks.push(current.join('\n'));
    return blocks;
}

function hasDuplicateBullet(content, bulletText) {
    const target = normalizeBulletForDuplicate(bulletText);
    return collectBulletBlocks(content).some(block => normalizeBulletForDuplicate(block) === target);
}

function appendBulletBeforeEndMarker(content, headline, bulletText) {
    const endMarker = makeClipEndMarker(headline);
    const endIndex = String(content || '').indexOf(endMarker);
    if (endIndex < 0) {
        throw new Error(tr('STMemoryBooks_Clip_ErrorMissingEndMarker', 'Expected clip end marker was not found.'));
    }

    const before = String(content || '').slice(0, endIndex).replace(/[ \t]*$/g, '');
    const after = String(content || '').slice(endIndex);
    const separator = before.endsWith('\n\n') ? '' : before.endsWith('\n') ? '\n' : '\n\n';
    return `${before}${separator}${formatClipBullet(bulletText)}\n\n${after}`;
}

function getWrapperMarkerHeadlines(content, kind) {
    const pattern = kind === 'end'
        ? /^=== END (.+) ===$/gm
        : /^=== (?!END )(.+) ===$/gm;
    return Array.from(String(content || '').matchAll(pattern), match => match[1]);
}

function analyzeClipWrapper(content, headline) {
    const text = String(content || '');
    const startMarker = makeClipStartMarker(headline);
    const endMarker = makeClipEndMarker(headline);
    const startIndex = text.indexOf(startMarker);
    const endIndex = text.indexOf(endMarker);
    const startHeadlines = getWrapperMarkerHeadlines(text, 'start');
    const endHeadlines = getWrapperMarkerHeadlines(text, 'end');

    if (startIndex >= 0 && endIndex > startIndex) {
        return { type: 'valid' };
    }

    if (startHeadlines.length > 1 || endHeadlines.length > 1) {
        return { type: 'multiple' };
    }

    if (startHeadlines.length === 1 && endHeadlines.length === 1) {
        return { type: 'mismatch', wrapperHeadline: startHeadlines[0], wrapperEndHeadline: endHeadlines[0] };
    }

    return { type: 'none' };
}

function replaceSingleWrapperHeadline(content, fromHeadline, toHeadline, fromEndHeadline = fromHeadline) {
    return String(content || '')
        .replace(makeClipStartMarker(fromHeadline), makeClipStartMarker(toHeadline))
        .replace(makeClipEndMarker(fromEndHeadline), makeClipEndMarker(toHeadline));
}

function stripWrapperMarkerLines(content) {
    return String(content || '')
        .replace(/^=== (?!END ).+ ===\s*$/gm, '')
        .replace(/^=== END .+ ===\s*$/gm, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function convertExistingContentToWrappedContent(content, headline, bulletText) {
    const existing = String(content || '').trim();
    if (!existing) return createClipEntryContent(headline, bulletText);
    return `${makeClipStartMarker(headline)}\n\n${existing}\n\n${formatClipBullet(bulletText)}\n\n${makeClipEndMarker(headline)}`;
}

function normalizeSelectedText(text) {
    return String(text || '')
        .replace(/\r\n?/g, '\n')
        .replace(/[ \t\f\v]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function nodeIsInside(node, container) {
    if (!node || !container) return false;
    const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
    return !!element && container.contains(element);
}

function getElementForNode(node) {
    if (!node) return null;
    return node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
}

function getSelectionChatMessage(selection) {
    const anchorMessage = getElementForNode(selection?.anchorNode)?.closest?.('#chat .mes[mesid]');
    const focusMessage = getElementForNode(selection?.focusNode)?.closest?.('#chat .mes[mesid]');
    return anchorMessage && anchorMessage === focusMessage ? anchorMessage : anchorMessage || focusMessage || null;
}

function getSelectionDirection(selection) {
    const messageElement = getSelectionChatMessage(selection);
    const element = getElementForNode(selection?.focusNode) || messageElement;
    const direction = element ? getComputedStyle(element).direction : 'ltr';
    return direction === 'rtl' ? 'rtl' : 'ltr';
}

function getSelectionAttachRect(range, direction = 'ltr') {
    const rects = Array.from(range.getClientRects())
        .filter(rect => rect.width > 0 && rect.height > 0);

    if (rects.length > 0) {
        return direction === 'rtl' ? rects[0] : rects[rects.length - 1];
    }

    return range.getBoundingClientRect();
}

function isFloatingClipEnabled() {
    return extension_settings?.STMemoryBooks?.moduleSettings?.showFloatingClipButton !== false;
}

function getSelectedChatText(messageElement = null, options = {}) {
    if (options.requireFloatingEnabled && !isFloatingClipEnabled()) {
        throw new Error(tr('STMemoryBooks_Clip_FloatingDisabled', 'Floating Clip button is disabled.'));
    }

    const selection = window.getSelection?.();
    if (!selection || selection.rangeCount === 0) {
        throw new Error(tr('STMemoryBooks_Clip_NoHighlightedText', 'Highlight text in the chat first, then click Clip.'));
    }

    const rawText = selection?.toString?.() || '';
    const selectedText = normalizeSelectedText(rawText);

    if (!selectedText) {
        throw new Error(tr('STMemoryBooks_Clip_NoHighlightedText', 'Highlight text in the chat first, then click Clip.'));
    }

    const chatElement = document.querySelector('#chat');
    if (!chatElement || !nodeIsInside(selection.anchorNode, chatElement) || !nodeIsInside(selection.focusNode, chatElement)) {
        throw new Error(tr('STMemoryBooks_Clip_SelectionOutsideChat', 'Selected text must be inside the chat.'));
    }

    if (messageElement && (!nodeIsInside(selection.anchorNode, messageElement) || !nodeIsInside(selection.focusNode, messageElement))) {
        throw new Error(tr('STMemoryBooks_Clip_SelectionOutsideMessage', 'Select text inside the message you are clipping.'));
    }

    return selectedText;
}

function getFloatingSelectionState() {
    if (!isFloatingClipEnabled()) return null;

    const selection = document.getSelection?.();
    if (!selection || selection.rangeCount === 0) return null;

    const selectedText = normalizeSelectedText(selection.toString?.() || '');
    if (!selectedText) return null;

    const chatElement = document.querySelector('#chat');
    if (!chatElement || !nodeIsInside(selection.anchorNode, chatElement) || !nodeIsInside(selection.focusNode, chatElement)) {
        return null;
    }

    const messageElement = getSelectionChatMessage(selection);
    if (!messageElement) return null;

    const range = selection.getRangeAt(0);
    const direction = getSelectionDirection(selection);
    const rect = getSelectionAttachRect(range, direction);
    if (!rect || (rect.width === 0 && rect.height === 0)) return null;

    return { selectedText, rect, direction, messageElement };
}

function getClipEntries(lorebookData) {
    return Object.values(lorebookData?.entries || {})
        .filter(entry => isClipEntryTitle(entry?.comment || ''))
        .sort((a, b) => String(a.comment || '').localeCompare(String(b.comment || '')));
}

function getClipEntryByFinalTitle(lorebookData, title) {
    const exact = getEntryByTitle(lorebookData, title);
    if (exact) return exact;

    const normalizedTitle = String(title || '').trimEnd();
    return Object.values(lorebookData?.entries || {})
        .find(entry => isClipEntryTitle(entry?.comment || '') && String(entry.comment || '').trimEnd() === normalizedTitle) || null;
}

function parseKeywords(text) {
    return String(text || '')
        .split(',')
        .map(keyword => keyword.trim())
        .filter(Boolean);
}

function shouldRefreshEditor() {
    return extension_settings?.STMemoryBooks?.moduleSettings?.refreshEditor !== false;
}

async function saveLorebook(lorebookName, lorebookData) {
    await saveWorldInfo(lorebookName, lorebookData, true);
    if (shouldRefreshEditor()) {
        await Promise.resolve(reloadEditor(lorebookName));
    }
}

async function confirmDuplicateBullet() {
    const popup = new Popup(
        DOMPurify.sanitize(`<h3>${escapeHtml(tr('STMemoryBooks_Clip_DuplicateTitle', 'Duplicate Clip'))}</h3><p>${escapeHtml(tr('STMemoryBooks_Clip_DuplicateMessage', 'This exact clip already exists in the selected entry.'))}</p>`),
        POPUP_TYPE.CONFIRM,
        '',
        {
            okButton: tr('STMemoryBooks_Clip_AddAnyway', 'Add Anyway'),
            cancelButton: tr('STMemoryBooks_Cancel', 'Cancel'),
        },
    );
    return await popup.show() === POPUP_RESULT.AFFIRMATIVE;
}

async function confirmConvertExistingContent() {
    const popup = new Popup(
        DOMPurify.sanitize(`<h3>${escapeHtml(tr('STMemoryBooks_Clip_ConvertTitle', 'Convert Clip Entry'))}</h3><p>${escapeHtml(tr('STMemoryBooks_Clip_ConvertMessage', 'This entry is marked as an STMB Clip entry but does not have the expected wrapper. Convert it to one wrapped section and preserve its current content?'))}</p>`),
        POPUP_TYPE.CONFIRM,
        '',
        {
            okButton: tr('STMemoryBooks_Clip_ConvertButton', 'Convert'),
            cancelButton: tr('STMemoryBooks_Cancel', 'Cancel'),
        },
    );
    return await popup.show() === POPUP_RESULT.AFFIRMATIVE;
}

async function confirmMultipleWrapperConversion() {
    const popup = new Popup(
        DOMPurify.sanitize(`<h3>${escapeHtml(tr('STMemoryBooks_Clip_MultipleWrappersTitle', 'Multiple Clip Sections'))}</h3><p>${escapeHtml(tr('STMemoryBooks_Clip_MultipleWrappersMessage', 'STMB Clip entries support one section per entry. Convert this entry to one section using the title-derived headline?'))}</p>`),
        POPUP_TYPE.CONFIRM,
        '',
        {
            okButton: tr('STMemoryBooks_Clip_ConvertOneSection', 'Convert to One Section'),
            cancelButton: tr('STMemoryBooks_Cancel', 'Cancel'),
        },
    );
    return await popup.show() === POPUP_RESULT.AFFIRMATIVE;
}

function buildUpdatedExistingContent(entry, bulletText, editedHeadline) {
    const headline = validateClipHeadline(editedHeadline ?? getClipHeadlineFromTitle(entry.comment || ''));
    const analysis = analyzeClipWrapper(entry.content || '', headline);
    if (analysis.type === 'valid') return appendBulletBeforeEndMarker(entry.content || '', headline, bulletText);
    if (analysis.type === 'multiple') return convertExistingContentToWrappedContent(stripWrapperMarkerLines(entry.content || ''), headline, bulletText);
    if (analysis.type === 'mismatch') {
        const repairedContent = replaceSingleWrapperHeadline(entry.content || '', analysis.wrapperHeadline, headline, analysis.wrapperEndHeadline);
        return appendBulletBeforeEndMarker(repairedContent, headline, bulletText);
    }
    return convertExistingContentToWrappedContent(entry.content || '', headline, bulletText);
}

async function buildExistingContentForSave(entry, bulletText, headline) {
    const analysis = analyzeClipWrapper(entry.content || '', headline);

    if (analysis.type === 'valid') {
        return appendBulletBeforeEndMarker(entry.content || '', headline, bulletText);
    }

    if (analysis.type === 'none') {
        const hasExisting = !!String(entry.content || '').trim();
        if (hasExisting && !await confirmConvertExistingContent()) return null;
        return convertExistingContentToWrappedContent(entry.content || '', headline, bulletText);
    }

    if (analysis.type === 'multiple') {
        if (!await confirmMultipleWrapperConversion()) return null;
        return convertExistingContentToWrappedContent(stripWrapperMarkerLines(entry.content || ''), headline, bulletText);
    }

    const repairedContent = replaceSingleWrapperHeadline(entry.content || '', analysis.wrapperHeadline, headline, analysis.wrapperEndHeadline);
    return appendBulletBeforeEndMarker(repairedContent, headline, bulletText);
}

function buildClipModalHtml(selectedText, clipEntries) {
    const entryOptions = clipEntries.map((entry) => {
        const title = String(entry.comment || '');
        return `<option value="${escapeHtml(title)}">${escapeHtml(getClipHeadlineFromTitle(title))}</option>`;
    }).join('');

    return DOMPurify.sanitize(`
        <h3>${escapeHtml(tr('STMemoryBooks_Clip_ModalTitle', 'Clip to Memory Book'))}</h3>
        <div class="stmb-clip-modal">
            <label class="world_entry_form_control">
                <h4>${escapeHtml(tr('STMemoryBooks_Clip_SelectedText', 'Selected text'))}</h4>
                <textarea id="stmb-clip-text" class="text_pole stmb-clip-textarea">${escapeHtml(selectedText)}</textarea>
            </label>
            <label class="world_entry_form_control">
                <h4>${escapeHtml(tr('STMemoryBooks_Clip_ExistingEntry', 'Existing clip entry'))}</h4>
                <select id="stmb-clip-entry-select" class="text_pole">
                    ${entryOptions}
                    <option value="${CREATE_NEW_VALUE}" ${clipEntries.length ? '' : 'selected'}>${escapeHtml(tr('STMemoryBooks_Clip_CreateNewEntry', 'Create new clip entry'))}</option>
                </select>
            </label>
            <label class="world_entry_form_control">
                <h4>${escapeHtml(tr('STMemoryBooks_Clip_Headline', 'Entry title / section headline'))}</h4>
                <input id="stmb-clip-headline" class="text_pole" type="text" />
            </label>
            <div id="stmb-clip-new-entry-fields" class="world_entry_form_control">
                <div class="stmb-clip-activation">
                    <label><input type="radio" name="stmb-clip-activation" value="constant" checked /> ${escapeHtml(tr('STMemoryBooks_Clip_AlwaysInclude', 'Always include this entry'))}</label>
                    <label><input type="radio" name="stmb-clip-activation" value="keyword" /> ${escapeHtml(tr('STMemoryBooks_Clip_ActivateByKeywords', 'Activate by keywords'))}</label>
                </div>
                <label id="stmb-clip-keywords-row">
                    <h4>${escapeHtml(tr('STMemoryBooks_Clip_Keywords', 'Keywords'))}</h4>
                    <input id="stmb-clip-keywords" class="text_pole" type="text" />
                </label>
            </div>
            <div class="world_entry_form_control">
                <div class="stmb-clip-label-row">
                    <h4>${escapeHtml(tr('STMemoryBooks_Clip_CurrentContent', 'Current entry content'))}</h4>
                    <button id="stmb-clip-compact" type="button" class="menu_button stmb-clip-compact-btn">${escapeHtml(tr('STMemoryBooks_Compaction_Title', 'Compaction'))}</button>
                </div>
                <textarea id="stmb-clip-current-content" class="text_pole stmb-clip-preview" readonly></textarea>
            </div>
            <label class="world_entry_form_control">
                <h4>${escapeHtml(tr('STMemoryBooks_Clip_UpdatedPreview', 'Updated entry preview'))}</h4>
                <textarea id="stmb-clip-updated-preview" class="text_pole stmb-clip-preview" readonly></textarea>
            </label>
            <div id="stmb-clip-token-warning" class="info_block stmb-clip-warning" hidden>${escapeHtml(tr('STMemoryBooks_Clip_LongWarning', 'This clip entry is getting long. Long constant entries can waste context or crowd out more relevant memory. Review, edit, or compact it.'))}</div>
        </div>
    `);
}

function attachClipModalHandlers(popup, lorebookName, lorebookData, clipEntries) {
    const dlg = popup.dlg;
    if (!dlg) return;

    const entrySelect = dlg.querySelector('#stmb-clip-entry-select');
    const clipText = dlg.querySelector('#stmb-clip-text');
    const headlineInput = dlg.querySelector('#stmb-clip-headline');
    const keywordsRow = dlg.querySelector('#stmb-clip-keywords-row');
    const currentContent = dlg.querySelector('#stmb-clip-current-content');
    const updatedPreview = dlg.querySelector('#stmb-clip-updated-preview');
    const tokenWarning = dlg.querySelector('#stmb-clip-token-warning');
    const compactButton = dlg.querySelector('#stmb-clip-compact');
    const newEntryFields = dlg.querySelector('#stmb-clip-new-entry-fields');

    const getMode = () => entrySelect?.value === CREATE_NEW_VALUE ? 'new' : 'existing';
    const getSelectedEntry = () => getEntryByTitle(lorebookData, entrySelect?.value || '');
    const getBulletText = () => clipText?.value || '';

    const syncHeadlineFromSelection = () => {
        if (!headlineInput) return;
        const entry = getSelectedEntry();
        headlineInput.value = entry ? getClipHeadlineFromTitle(entry.comment || '') : '';
    };

    const syncActivation = () => {
        const activation = dlg.querySelector('input[name="stmb-clip-activation"]:checked')?.value || 'constant';
        if (keywordsRow) keywordsRow.style.display = activation === 'keyword' ? 'block' : 'none';
    };

    const refreshPreview = () => {
        const mode = getMode();
        if (newEntryFields) newEntryFields.style.display = mode === 'new' ? 'block' : 'none';
        if (compactButton) compactButton.disabled = mode !== 'existing';

        let preview = '';
        let current = '';
        try {
            if (mode === 'existing') {
                const entry = getSelectedEntry();
                current = entry?.content || '';
                preview = entry ? buildUpdatedExistingContent(entry, getBulletText(), headlineInput?.value || '') : '';
            } else {
                const headline = validateClipHeadline(headlineInput?.value || '');
                preview = createClipEntryContent(headline, getBulletText());
            }
        } catch (error) {
            preview = error.message || '';
        }

        if (currentContent) currentContent.value = current;
        if (updatedPreview) updatedPreview.value = preview;
        if (tokenWarning) tokenWarning.hidden = estimateTokens(preview) <= TOKEN_WARNING_THRESHOLD;
    };

    entrySelect?.addEventListener('change', () => {
        syncHeadlineFromSelection();
        refreshPreview();
    });
    clipText?.addEventListener('input', refreshPreview);
    headlineInput?.addEventListener('input', refreshPreview);
    dlg.querySelectorAll('input[name="stmb-clip-activation"]').forEach(input => {
        input.addEventListener('change', () => {
            syncActivation();
            refreshPreview();
        });
    });
    compactButton?.addEventListener('click', async () => {
        const entry = getSelectedEntry();
        if (!entry) return;
        const replaced = await showCompactReviewPopup(lorebookName, lorebookData, entry);
        if (replaced) refreshPreview();
    });

    syncActivation();
    syncHeadlineFromSelection();
    refreshPreview();
}

async function showLongEntryWarning(lorebookName, lorebookData, entry, content) {
    if (estimateTokens(content) <= TOKEN_WARNING_THRESHOLD) return true;

    const popup = new Popup(
        DOMPurify.sanitize(`<h3>${escapeHtml(tr('STMemoryBooks_Clip_LongEntryTitle', 'Long Clip Entry'))}</h3><p>${escapeHtml(tr('STMemoryBooks_Clip_LongWarning', 'This clip entry is getting long. Long constant entries can waste context or crowd out more relevant memory. Review, edit, or compact it.'))}</p>`),
        POPUP_TYPE.TEXT,
        '',
        {
            okButton: false,
            cancelButton: tr('STMemoryBooks_Cancel', 'Cancel'),
            customButtons: [
                { text: tr('STMemoryBooks_Clip_ReviewEntry', 'Review Entry'), result: POPUP_RESULT.CUSTOM1, appendAtEnd: true },
                { text: tr('STMemoryBooks_Compaction_Button', 'Compact Entry'), result: POPUP_RESULT.CUSTOM2, appendAtEnd: true },
                { text: tr('STMemoryBooks_Clip_SaveAnyway', 'Save Anyway'), result: POPUP_RESULT.CUSTOM3, appendAtEnd: true },
            ],
        },
    );

    const result = await popup.show();
    if (result === POPUP_RESULT.CUSTOM3) return true;
    if (result === POPUP_RESULT.CUSTOM2 && entry) {
        await showCompactReviewPopup(lorebookName, lorebookData, entry, { pendingContent: content });
    } else if (result === POPUP_RESULT.CUSTOM1) {
        await new Popup(
            DOMPurify.sanitize(`<h3>${escapeHtml(tr('STMemoryBooks_Clip_ReviewEntry', 'Review Entry'))}</h3><textarea class="text_pole stmb-clip-preview" readonly>${escapeHtml(content)}</textarea>`),
            POPUP_TYPE.TEXT,
            '',
            { wide: true, large: true, allowVerticalScrolling: true, okButton: tr('STMemoryBooks_Close', 'Close'), cancelButton: false },
        ).show();
    }
    return false;
}

async function saveExistingClip(lorebookName, lorebookData, title, bulletText, editedHeadline) {
    const entry = getEntryByTitle(lorebookData, title);
    if (!entry) throw new Error(tr('STMemoryBooks_Clip_ErrorEntryNotFound', 'Selected clip entry was not found.'));

    const headline = validateClipHeadline(editedHeadline);
    const newTitle = makeClipEntryTitle(headline);
    const duplicate = getClipEntryByFinalTitle(lorebookData, newTitle);
    if (duplicate && duplicate !== entry) {
        throw new Error(tr('STMemoryBooks_Clip_ErrorDuplicateTitle', 'A clip entry with this title already exists.'));
    }

    const updatedContent = await buildExistingContentForSave(entry, bulletText, headline);
    if (updatedContent == null) return false;

    if (hasDuplicateBullet(entry.content || '', formatClipBullet(bulletText)) && !await confirmDuplicateBullet()) {
        return false;
    }

    if (!await showLongEntryWarning(lorebookName, lorebookData, entry, updatedContent)) {
        return false;
    }

    entry.comment = newTitle;
    entry.content = updatedContent;
    await saveLorebook(lorebookName, lorebookData);
    return true;
}

async function saveNewClip(lorebookName, lorebookData, dlg) {
    const headline = validateClipHeadline(dlg.querySelector('#stmb-clip-headline')?.value || '');
    const title = makeClipEntryTitle(headline);
    if (getClipEntryByFinalTitle(lorebookData, title)) {
        throw new Error(tr('STMemoryBooks_Clip_ErrorDuplicateTitle', 'A clip entry with this title already exists.'));
    }

    const bulletText = dlg.querySelector('#stmb-clip-text')?.value || '';
    const content = createClipEntryContent(headline, bulletText);
    const activation = dlg.querySelector('input[name="stmb-clip-activation"]:checked')?.value || 'constant';
    const keywords = parseKeywords(dlg.querySelector('#stmb-clip-keywords')?.value || '');
    if (activation === 'keyword' && keywords.length === 0) {
        throw new Error(tr('STMemoryBooks_Clip_ErrorKeywordsRequired', 'Keyword-activated clip entries require at least one keyword.'));
    }

    if (!await showLongEntryWarning(lorebookName, lorebookData, null, content)) {
        return false;
    }

    const newEntry = createWorldInfoEntry(lorebookName, lorebookData);
    if (!newEntry) {
        throw new Error(tr('STMemoryBooks_Clip_ErrorCreateEntryFailed', 'Failed to create clip entry.'));
    }

    newEntry.comment = title;
    newEntry.content = content;
    newEntry.key = activation === 'keyword' ? keywords : [];
    newEntry.keysecondary = Array.isArray(newEntry.keysecondary) ? newEntry.keysecondary : [];
    newEntry.constant = activation === 'constant';
    newEntry.vectorized = activation === 'keyword';
    newEntry.selective = activation === 'keyword';
    newEntry.disable = false;
    newEntry.position = typeof newEntry.position === 'number' ? newEntry.position : 0;
    newEntry.order = typeof newEntry.order === 'number' ? newEntry.order : 100;

    await saveLorebook(lorebookName, lorebookData);
    return true;
}

export async function openClipModalFromSelection({ selectedText, source = 'message' } = {}) {
    if (source === 'floating') {
        try {
            getSelectedChatText(null, { requireFloatingEnabled: true });
        } catch (error) {
            hideFloatingClipButton();
            if (error?.message !== tr('STMemoryBooks_Clip_FloatingDisabled', 'Floating Clip button is disabled.')) {
                toastr.warning(error.message, 'STMemoryBooks');
            }
            return;
        }
    }

    const normalizedSelectedText = normalizeSelectedText(selectedText || '');
    if (!normalizedSelectedText) {
        toastr.warning(tr('STMemoryBooks_Clip_NoHighlightedText', 'Highlight text in the chat first, then click Clip.'), 'STMemoryBooks');
        return;
    }

    hideFloatingClipButton();
    const validation = await validateLorebookRequirement({ createContext: 'clip' });
    if (!validation?.valid || !validation?.data || !validation?.name) {
        if (!validation?.handled) {
            toastr.error(validation?.error || tr('STMemoryBooks_Error_NoValidLorebookAvailable', 'No valid lorebook available.'), 'STMemoryBooks');
        }
        return;
    }

    const { name: lorebookName, data: lorebookData } = validation;
    const clipEntries = getClipEntries(lorebookData);
    const popup = new Popup(buildClipModalHtml(normalizedSelectedText, clipEntries), POPUP_TYPE.TEXT, '', {
        wide: true,
        large: true,
        allowVerticalScrolling: true,
        okButton: tr('STMemoryBooks_Clip_SaveClip', 'Save Clip'),
        cancelButton: tr('STMemoryBooks_Cancel', 'Cancel'),
    });

    const showPromise = popup.show();
    attachClipModalHandlers(popup, lorebookName, lorebookData, clipEntries);
    const result = await showPromise;
    if (result !== POPUP_RESULT.AFFIRMATIVE) return;

    try {
        const dlg = popup.dlg;
        const bulletText = dlg.querySelector('#stmb-clip-text')?.value || '';
        formatClipBullet(bulletText); // Validates non-empty text, throws if invalid
        const selectedTitle = dlg.querySelector('#stmb-clip-entry-select')?.value || CREATE_NEW_VALUE;
        const editedHeadline = dlg.querySelector('#stmb-clip-headline')?.value || '';
        const saved = selectedTitle === CREATE_NEW_VALUE
            ? await saveNewClip(lorebookName, lorebookData, dlg)
            : await saveExistingClip(lorebookName, lorebookData, selectedTitle, bulletText, editedHeadline);

        if (saved) {
            toastr.success(tr('STMemoryBooks_Clip_SaveSuccess', 'Clip saved to Memory Book.'), 'STMemoryBooks');
        }
    } catch (error) {
        console.error(`${MODULE_NAME}: Failed to save clip:`, error);
        toastr.error(error?.message || tr('STMemoryBooks_Clip_SaveFailed', 'Failed to save clip.'), 'STMemoryBooks');
    }
}

export async function handleClipButtonClick(messageElement) {
    try {
        const selectedText = getSelectedChatText(messageElement);
        await openClipModalFromSelection({ selectedText, source: 'message' });
    } catch (error) {
        toastr.warning(error.message, 'STMemoryBooks');
    }
}

export function hideFloatingClipButton() {
    if (floatingClipUpdateTimer) {
        clearTimeout(floatingClipUpdateTimer);
        floatingClipUpdateTimer = null;
    }
    floatingClipButton?.remove();
    floatingClipButton = null;
}

function scheduleFloatingClipUpdate() {
    if (!isFloatingClipEnabled()) {
        hideFloatingClipButton();
        return;
    }

    if (floatingClipUpdateTimer) clearTimeout(floatingClipUpdateTimer);
    floatingClipUpdateTimer = setTimeout(updateFloatingClipButton, 60);
}

function createFloatingClipButton() {
    const button = document.createElement('div');
    button.classList.add('stmb_floating_clip_button', 'mes_stmb_clip', 'mes_button', 'fa-solid', 'fa-scissors', 'interactable');
    button.title = tr('STMemoryBooks_Clip_ButtonTitle', 'Clip highlighted text to Memory Book');
    button.setAttribute('tabindex', '0');
    button.setAttribute('data-i18n', '[title]STMemoryBooks_Clip_ButtonTitle');
    button.addEventListener('mousedown', (event) => {
        event.preventDefault();
        event.stopPropagation();
    });
    button.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const state = getFloatingSelectionState();
        if (!state) {
            hideFloatingClipButton();
            return;
        }
        await openClipModalFromSelection({ selectedText: state.selectedText, source: 'floating' });
    });
    document.body.appendChild(button);
    return button;
}

function updateFloatingClipButton() {
    floatingClipUpdateTimer = null;
    const state = getFloatingSelectionState();
    if (!state) {
        hideFloatingClipButton();
        return;
    }

    if (!floatingClipButton) {
        floatingClipButton = createFloatingClipButton();
    }

    const buttonWidth = floatingClipButton.offsetWidth || 32;
    const buttonHeight = floatingClipButton.offsetHeight || 32;
    const edgeLeft = state.direction === 'rtl'
        ? state.rect.left - buttonWidth - FLOATING_CLIP_X_OFFSET
        : state.rect.right + FLOATING_CLIP_X_OFFSET;
    const edgeTop = state.rect.top + (state.rect.height / 2) - (buttonHeight / 2) + FLOATING_CLIP_Y_OFFSET;
    const left = Math.min(
        window.innerWidth - buttonWidth - FLOATING_CLIP_VIEWPORT_PADDING,
        Math.max(FLOATING_CLIP_VIEWPORT_PADDING, edgeLeft),
    );
    const top = Math.min(
        window.innerHeight - buttonHeight - FLOATING_CLIP_VIEWPORT_PADDING,
        Math.max(FLOATING_CLIP_VIEWPORT_PADDING, edgeTop),
    );

    floatingClipButton.style.top = `${Math.round(top)}px`;
    floatingClipButton.style.left = `${Math.round(left)}px`;
    floatingClipButton.style.display = 'flex';
}

function handleFloatingClipDocumentMouseDown(event) {
    if (floatingClipButton?.contains(event.target)) return;
    hideFloatingClipButton();
}

function bindFloatingClipListeners() {
    if (floatingClipListenersBound) return;
    document.addEventListener('selectionchange', scheduleFloatingClipUpdate);
    document.addEventListener('mouseup', scheduleFloatingClipUpdate);
    document.addEventListener('keyup', scheduleFloatingClipUpdate);
    document.addEventListener('mousedown', handleFloatingClipDocumentMouseDown, true);
    window.addEventListener('scroll', hideFloatingClipButton, true);
    floatingClipListenersBound = true;
}

function unbindFloatingClipListeners() {
    if (!floatingClipListenersBound) return;
    document.removeEventListener('selectionchange', scheduleFloatingClipUpdate);
    document.removeEventListener('mouseup', scheduleFloatingClipUpdate);
    document.removeEventListener('keyup', scheduleFloatingClipUpdate);
    document.removeEventListener('mousedown', handleFloatingClipDocumentMouseDown, true);
    window.removeEventListener('scroll', hideFloatingClipButton, true);
    floatingClipListenersBound = false;
}

export function refreshFloatingClipButtonSetting() {
    if (isFloatingClipEnabled()) {
        bindFloatingClipListeners();
        scheduleFloatingClipUpdate();
    } else {
        unbindFloatingClipListeners();
        hideFloatingClipButton();
    }
}

export function initializeFloatingClipButton() {
    refreshFloatingClipButtonSetting();
}

function getModuleSettings() {
    extension_settings.STMemoryBooks = extension_settings.STMemoryBooks || {};
    extension_settings.STMemoryBooks.moduleSettings = extension_settings.STMemoryBooks.moduleSettings || {};
    return extension_settings.STMemoryBooks.moduleSettings;
}

function getCompactionPromptTemplate() {
    const saved = getModuleSettings().compactionPromptTemplate;
    return typeof saved === 'string' && saved.trim()
        ? saved
        : DEFAULT_COMPACTION_PROMPT_TEMPLATE;
}

function setCompactionPromptTemplate(template) {
    getModuleSettings().compactionPromptTemplate = String(template || '');
    saveSettingsDebounced();
}

function getCompactionProfileIndex() {
    const settings = extension_settings?.STMemoryBooks || {};
    const profiles = Array.isArray(settings.profiles) ? settings.profiles : [];
    if (profiles.length === 0) return 0;

    const rawIndex = Number.parseInt(settings.moduleSettings?.compactionProfileIndex, 10);
    if (Number.isFinite(rawIndex) && rawIndex >= 0 && rawIndex < profiles.length) {
        return rawIndex;
    }

    const defaultIndex = Number.parseInt(settings.defaultProfile, 10);
    return Number.isFinite(defaultIndex) && defaultIndex >= 0 && defaultIndex < profiles.length
        ? defaultIndex
        : 0;
}

function setCompactionProfileIndex(profileIndex) {
    const settings = extension_settings?.STMemoryBooks || {};
    const profiles = Array.isArray(settings.profiles) ? settings.profiles : [];
    const parsed = Number.parseInt(profileIndex, 10);
    const fallback = getCompactionProfileIndex();
    getModuleSettings().compactionProfileIndex = Number.isFinite(parsed) && parsed >= 0 && parsed < profiles.length
        ? parsed
        : fallback;
    saveSettingsDebounced();
}

function buildCompactionProfileOptions(selectedIndex = getCompactionProfileIndex()) {
    const settings = extension_settings?.STMemoryBooks || {};
    const profiles = Array.isArray(settings.profiles) ? settings.profiles : [];
    return profiles.map((profile, index) => {
        const displayName = profile?.isBuiltinCurrentST
            ? tr('STMemoryBooks_Profile_CurrentST', 'Current SillyTavern Settings')
            : profile?.name || tr('STMemoryBooks_Profile', 'Profile');
        return `<option value="${escapeHtml(String(index))}"${index === selectedIndex ? ' selected' : ''}>${escapeHtml(displayName)}</option>`;
    }).join('');
}

function buildCompactionProfileControl(selectId) {
    return `
        <div class="world_entry_form_control">
            <h4>${escapeHtml(tr('STMemoryBooks_Compaction_Profile', 'Compaction Profile'))}</h4>
            <select id="${escapeHtml(selectId)}" class="text_pole stmb-compaction-profile-select">
                ${buildCompactionProfileOptions()}
            </select>
        </div>
    `;
}

function initializeCompactionProfileSelect(popup, selectId) {
    const select = popup.dlg?.querySelector(`#${selectId}`);
    if (!select || !window.jQuery || typeof window.jQuery.fn.select2 !== 'function') return;

    const $select = window.jQuery(select);
    if ($select.hasClass('select2-hidden-accessible')) {
        $select.select2('destroy');
    }

    $select.select2({
        width: '100%',
        placeholder: tr('STMemoryBooks_Compaction_SelectProfile', 'Select a Compaction profile...'),
        allowClear: false,
        dropdownParent: window.jQuery(popup.dlg),
    });
}

function getCompactionProfileIndexFromSelect(popup, selectId) {
    return readIntInput(
        popup.dlg?.querySelector(`#${selectId}`),
        getCompactionProfileIndex(),
    );
}

function resolveCompactionProfileConnection(profileIndex = getCompactionProfileIndex()) {
    const settings = extension_settings?.STMemoryBooks || {};
    const profiles = Array.isArray(settings.profiles) ? settings.profiles : [];
    const profile = profiles[profileIndex] || profiles[getCompactionProfileIndex()] || null;

    if (!profile || profile?.connection?.api === 'current_st' || profile?.useDynamicSTSettings) {
        const apiInfo = getCurrentApiInfo();
        const modelInfo = getUIModelSettings();
        return {
            api: normalizeCompletionSource(apiInfo.completionSource || apiInfo.api || 'openai'),
            model: modelInfo.model || '',
            temperature: modelInfo.temperature ?? 0.3,
        };
    }

    const conn = resolveEffectiveConnectionFromProfile(profile);
    return {
        ...conn,
        temperature: conn.temperature ?? 0.3,
    };
}

function validateCompactionPromptTemplate(template) {
    const value = String(template || '');
    if (!value.trim()) {
        return tr('STMemoryBooks_PromptCannotBeEmpty', 'Prompt cannot be empty');
    }
    if (!value.includes('{{ENTRY_CONTENT}}')) {
        return tr('STMemoryBooks_Compaction_PromptMissingEntryContent', 'The Compaction prompt must include {{ENTRY_CONTENT}}.');
    }
    return null;
}

function buildCompactionPrompt(entry, entryKind, template = getCompactionPromptTemplate()) {
    const replacements = {
        ENTRY_CONTENT: String(entry?.content || ''),
        ENTRY_KIND: String(entryKind || ''),
        ENTRY_TITLE: String(entry?.comment || ''),
    };

    return String(template || DEFAULT_COMPACTION_PROMPT_TEMPLATE).replace(
        /\{\{(ENTRY_CONTENT|ENTRY_KIND|ENTRY_TITLE)\}\}/g,
        (_match, token) => replacements[token] ?? '',
    );
}

function getCompactionEntryKind(entry) {
    const title = entry?.comment || '';

    if (isClipEntryTitle(title)) return 'clip';
    if (isSidePromptEntryTitle(title)) return 'sideprompt';
    if (isMemoryEntry(entry)) return 'memory';

    return null;
}

function getCompactionEntryKindLabel(entryKind) {
    if (entryKind === 'clip') return tr('STMemoryBooks_Compaction_TypeClip', 'Clip');
    if (entryKind === 'sideprompt') return tr('STMemoryBooks_Compaction_TypeSidePrompt', 'SidePrompt');
    if (entryKind === 'memory') return tr('STMemoryBooks_Compaction_TypeMemory', 'Memory');
    return '';
}

async function requestCompaction(entry, entryKind, template = getCompactionPromptTemplate(), profileIndex = getCompactionProfileIndex()) {
    const promptTemplateError = validateCompactionPromptTemplate(template);
    if (promptTemplateError) {
        throw new Error(promptTemplateError);
    }

    const connection = resolveCompactionProfileConnection(profileIndex);
    const extra = {};
    const stmbMaxTokens = Number.parseInt(extension_settings?.STMemoryBooks?.moduleSettings?.maxTokens, 10);
    if (Number.isFinite(stmbMaxTokens) && stmbMaxTokens > 0) {
        extra.max_tokens = stmbMaxTokens;
    } else if (oai_settings?.openai_max_tokens) {
        extra.max_tokens = oai_settings.openai_max_tokens;
    }

    const { text } = await requestCompletion({
        api: connection.api,
        model: connection.model || '',
        temperature: connection.temperature ?? 0.3,
        prompt: buildCompactionPrompt(entry, entryKind, template),
        endpoint: connection.endpoint,
        apiKey: connection.apiKey,
        extra,
    });
    const compacted = String(text || '').trim();
    if (!compacted) {
        throw new Error(tr('STMemoryBooks_Compaction_Empty', 'Compaction returned empty content.'));
    }
    return compacted;
}

async function showCompactionPromptEditorPopup() {
    const content = DOMPurify.sanitize(`
        <h3>${escapeHtml(tr('STMemoryBooks_Compaction_PromptTitle', 'Compaction Prompt'))}</h3>
        <div class="world_entry_form_control">
            <textarea id="stmb-compaction-prompt-template" class="text_pole textarea_compact" rows="18">${escapeHtml(getCompactionPromptTemplate())}</textarea>
        </div>
        <div class="buttons_block gap10px">
            <button id="stmb-compaction-save-prompt" type="button" class="menu_button">${escapeHtml(tr('STMemoryBooks_Compaction_SavePrompt', 'Save Prompt'))}</button>
            <button id="stmb-compaction-reset-prompt" type="button" class="menu_button">${escapeHtml(tr('STMemoryBooks_Compaction_ResetPrompt', 'Reset to Default'))}</button>
            <button id="stmb-compaction-cancel-prompt" type="button" class="menu_button">${escapeHtml(tr('STMemoryBooks_Cancel', 'Cancel'))}</button>
        </div>
    `);
    const popup = new Popup(content, POPUP_TYPE.TEXT, '', {
        wide: true,
        large: true,
        allowVerticalScrolling: true,
        okButton: false,
        cancelButton: false,
    });
    const showPromise = popup.show();
    const textarea = popup.dlg?.querySelector('#stmb-compaction-prompt-template');

    popup.dlg?.querySelector('#stmb-compaction-save-prompt')?.addEventListener('click', () => {
        const nextTemplate = textarea?.value || '';
        const error = validateCompactionPromptTemplate(nextTemplate);
        if (error) {
            toastr.error(error, 'STMemoryBooks');
            return;
        }
        setCompactionPromptTemplate(nextTemplate);
        popup.completeAffirmative();
    });
    popup.dlg?.querySelector('#stmb-compaction-reset-prompt')?.addEventListener('click', () => {
        if (textarea) {
            textarea.value = DEFAULT_COMPACTION_PROMPT_TEMPLATE;
            textarea.focus();
        }
    });
    popup.dlg?.querySelector('#stmb-compaction-cancel-prompt')?.addEventListener('click', () => {
        popup.completeCancelled();
    });

    return await showPromise === POPUP_RESULT.AFFIRMATIVE;
}

async function showCompactionRequestPopup(entry, originalContent, entryKind) {
    const content = DOMPurify.sanitize(`
        <h3>${escapeHtml(tr('STMemoryBooks_Compaction_Title', 'Compaction'))}</h3>
        <div class="stmb-compact-review">
            ${buildCompactionProfileControl('stmb-compaction-request-profile-select')}
            <div class="buttons_block gap10px">
                <button id="stmb-edit-compaction-prompt" type="button" class="menu_button">${escapeHtml(tr('STMemoryBooks_Compaction_EditPrompt', 'Edit Compaction Prompt'))}</button>
            </div>
            <div class="world_entry_form_control">
                <h4>${escapeHtml(tr('STMemoryBooks_Compaction_OriginalContent', 'Original content'))} (${estimateTokens(originalContent)} ${escapeHtml(tr('STMemoryBooks_EstimatedTokens', 'Estimated tokens'))})</h4>
                <textarea class="text_pole stmb-clip-preview" readonly>${escapeHtml(originalContent)}</textarea>
            </div>
        </div>
    `);
    const popup = new Popup(content, POPUP_TYPE.TEXT, '', {
        wide: true,
        large: true,
        allowVerticalScrolling: true,
        okButton: tr('STMemoryBooks_Compaction_Button', 'Compact Entry'),
        cancelButton: tr('STMemoryBooks_Cancel', 'Cancel'),
    });
    const showPromise = popup.show();
    initializeCompactionProfileSelect(popup, 'stmb-compaction-request-profile-select');
    popup.dlg?.querySelector('#stmb-compaction-request-profile-select')?.addEventListener('change', (event) => {
        setCompactionProfileIndex(readIntInput(event.target, getCompactionProfileIndex()));
    });
    popup.dlg?.querySelector('#stmb-edit-compaction-prompt')?.addEventListener('click', () => {
        void showCompactionPromptEditorPopup();
    });
    const result = await showPromise;
    if (result !== POPUP_RESULT.AFFIRMATIVE || !entry || !entryKind) {
        return { confirmed: false, profileIndex: getCompactionProfileIndex() };
    }

    const profileIndex = getCompactionProfileIndexFromSelect(popup, 'stmb-compaction-request-profile-select');
    setCompactionProfileIndex(profileIndex);
    return { confirmed: true, profileIndex };
}

export async function showCompactReviewPopup(lorebookName, lorebookData, entry, options = {}) {
    if (!entry || !lorebookName || !lorebookData) return false;
    const originalContent = options.pendingContent != null ? String(options.pendingContent) : String(entry.content || '');
    const entryKind = getCompactionEntryKind(entry);
    if (!entryKind) return false;
    let profileIndex = options.profileIndex ?? getCompactionProfileIndex();

    if (!options.skipPromptStep) {
        const requestResult = await showCompactionRequestPopup(entry, originalContent, entryKind);
        if (!requestResult.confirmed) return false;
        profileIndex = requestResult.profileIndex;
    }

    let compacted = '';
    try {
        compacted = await requestCompaction({ ...entry, content: originalContent }, entryKind, getCompactionPromptTemplate(), profileIndex);
    } catch (error) {
        notifyCompactionRequestSettled(options);
        console.error(`${MODULE_NAME}: Compaction failed:`, error);
        toastr.error(error?.message || tr('STMemoryBooks_Compaction_Failed', 'Compaction failed.'), 'STMemoryBooks');
        return false;
    }
    notifyCompactionRequestSettled(options);

    const content = DOMPurify.sanitize(`
        <h3>${escapeHtml(tr('STMemoryBooks_Compaction_Title', 'Compaction'))}</h3>
        <div class="stmb-compact-review">
            <div class="world_entry_form_control">
                <h4>${escapeHtml(tr('STMemoryBooks_Compaction_OriginalContent', 'Original content'))} (${estimateTokens(originalContent)} ${escapeHtml(tr('STMemoryBooks_EstimatedTokens', 'Estimated tokens'))})</h4>
                <textarea class="text_pole stmb-clip-preview" readonly>${escapeHtml(originalContent)}</textarea>
            </div>
            <div class="world_entry_form_control">
                <h4>${escapeHtml(tr('STMemoryBooks_Compaction_CompactedDraft', 'Compacted draft'))} (${estimateTokens(compacted)} ${escapeHtml(tr('STMemoryBooks_EstimatedTokens', 'Estimated tokens'))})</h4>
                <textarea id="stmb-compact-content" class="text_pole stmb-clip-preview">${escapeHtml(compacted)}</textarea>
            </div>
            <div class="buttons_block gap10px">
                <button id="stmb-copy-compacted" type="button" class="menu_button">${escapeHtml(tr('STMemoryBooks_Compaction_CopyDraft', 'Copy Compacted Draft'))}</button>
            </div>
        </div>
    `);

    const popup = new Popup(content, POPUP_TYPE.TEXT, '', {
        wide: true,
        large: true,
        allowVerticalScrolling: true,
        okButton: tr('STMemoryBooks_Compaction_Replace', 'Replace with Compacted Version'),
        cancelButton: tr('STMemoryBooks_Cancel', 'Cancel'),
    });
    const showPromise = popup.show();
    popup.dlg?.querySelector('#stmb-copy-compacted')?.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(popup.dlg?.querySelector('#stmb-compact-content')?.value || compacted);
            toastr.success(tr('STMemoryBooks_Clip_CopiedCompacted', 'Copied compacted text.'), 'STMemoryBooks');
        } catch {
            toastr.error(tr('STMemoryBooks_CopyFailed', 'Copy failed'), 'STMemoryBooks');
        }
    });
    const result = await showPromise;
    if (result !== POPUP_RESULT.AFFIRMATIVE) return false;

    const replacement = popup.dlg?.querySelector('#stmb-compact-content')?.value?.trim() || '';
    if (!replacement) {
        toastr.error(tr('STMemoryBooks_Compaction_Empty', 'Compaction returned empty content.'), 'STMemoryBooks');
        return false;
    }

    entry.content = replacement;
    await saveLorebook(lorebookName, lorebookData);
    toastr.success(tr('STMemoryBooks_Clip_ReplaceSuccess', 'Entry content replaced.'), 'STMemoryBooks');
    return true;
}

async function getDefaultCompactionLorebookName() {
    const settings = extension_settings?.STMemoryBooks;
    const manualMode = !!settings?.moduleSettings?.manualModeEnabled;
    const lorebookName = manualMode
        ? getSceneMarkers()?.manualLorebook
        : chat_metadata?.[METADATA_KEY];

    return lorebookName && Array.isArray(world_names) && world_names.includes(lorebookName)
        ? lorebookName
        : '';
}

async function loadCompactionEntriesForLorebook(lorebookName) {
    if (!lorebookName) return { lorebookName: '', lorebookData: null, entries: [] };

    const lorebookData = await loadWorldInfo(lorebookName);
    const entries = Object.values(lorebookData?.entries || {})
        .filter(entry => getCompactionEntryKind(entry) !== null)
        .sort((a, b) => String(a.comment || '').localeCompare(String(b.comment || '')));

    return { lorebookName, lorebookData, entries };
}

function initializeCompactionLorebookSelect(popup) {
    if (!window.jQuery || typeof window.jQuery.fn.select2 !== 'function') return;

    const $select = window.jQuery('#stmb-compaction-lorebook-select');
    if (!$select.length) return;

    if ($select.hasClass('select2-hidden-accessible')) {
        $select.select2('destroy');
    }

    $select.select2({
        width: '100%',
        placeholder: tr('STMemoryBooks_Compaction_SelectMemoryBook', 'Select a Memory Book...'),
        allowClear: false,
        dropdownParent: window.jQuery(popup.dlg),
    });
}

function buildCompactionEntryRows(entries) {
    return entries.map(entry => {
        const entryKind = getCompactionEntryKind(entry);
        return `
        <tr data-entry-uid="${escapeHtml(String(entry.uid))}">
            <td>${escapeHtml(entry.comment || '')}</td>
            <td>${escapeHtml(getCompactionEntryKindLabel(entryKind))}</td>
            <td>${estimateTokens(entry.content || '')}</td>
            <td><button type="button" class="menu_button stmb-review-entry-action"><i class="fa-solid fa-compress-alt stmb-review-entry-action-icon" aria-hidden="true"></i><span class="stmb-review-entry-action-label">${escapeHtml(tr('STMemoryBooks_Compaction_Button', 'Compact Entry'))}</span></button></td>
        </tr>
        `;
    }).join('');
}

function setCompactionEntryActionLoading(button, isLoading) {
    if (!button) return;
    const icon = button.querySelector('.stmb-review-entry-action-icon');
    const label = button.querySelector('.stmb-review-entry-action-label');
    button.disabled = isLoading;
    button.toggleAttribute('aria-busy', isLoading);
    if (icon) {
        icon.className = isLoading
            ? 'fa-solid fa-spinner fa-spin stmb-review-entry-action-icon'
            : 'fa-solid fa-compress-alt stmb-review-entry-action-icon';
    }
    if (label) {
        label.textContent = isLoading
            ? tr('STMemoryBooks_Compaction_Compacting', 'Compacting…')
            : tr('STMemoryBooks_Compaction_Button', 'Compact Entry');
    }
}

function notifyCompactionRequestSettled(options) {
    if (typeof options?.onCompactionRequestSettled !== 'function') return;
    try {
        options.onCompactionRequestSettled();
    } catch (error) {
        console.warn(`${MODULE_NAME}: Failed to clear Compaction loading state:`, error);
    }
}

export async function showStmbEntryReviewPopup() {
    if (!Array.isArray(world_names) || world_names.length === 0) {
        toastr.error(tr('STMemoryBooks_Compaction_NoLorebooks', 'No Memory Books were found.'), 'STMemoryBooks');
        return;
    }

    const defaultLorebookName = await getDefaultCompactionLorebookName();
    const lorebookOptions = [
        '<option></option>',
        ...world_names.map(name => `<option value="${escapeHtml(name)}"${name === defaultLorebookName ? ' selected' : ''}>${escapeHtml(name)}</option>`),
    ].join('');

    const popup = new Popup(DOMPurify.sanitize(`
        <h3>${escapeHtml(tr('STMemoryBooks_Compaction_Title', 'Compaction'))}</h3>
        <div class="world_entry_form_control">
            <h4>${escapeHtml(tr('STMemoryBooks_Compaction_MemoryBook', 'Memory Book'))}</h4>
            <select id="stmb-compaction-lorebook-select" class="text_pole">
                ${lorebookOptions}
            </select>
        </div>
        ${buildCompactionProfileControl('stmb-compaction-profile-select')}
        <div class="buttons_block gap10px">
            <button id="stmb-edit-compaction-prompt" type="button" class="menu_button">${escapeHtml(tr('STMemoryBooks_Compaction_EditPrompt', 'Edit Compaction Prompt'))}</button>
        </div>
        <div class="world_entry_form_control">
            <table class="stmb-review-entries">
                <thead>
                    <tr>
                        <th>${escapeHtml(tr('STMemoryBooks_Entry', 'Entry'))}</th>
                        <th>${escapeHtml(tr('STMemoryBooks_Type', 'Type'))}</th>
                        <th>${escapeHtml(tr('STMemoryBooks_Tokens', 'Tokens'))}</th>
                        <th>${escapeHtml(tr('STMemoryBooks_Action', 'Action'))}</th>
                    </tr>
                </thead>
                <tbody id="stmb-compaction-entry-body">
                    <tr><td colspan="4" class="opacity70p">${escapeHtml(defaultLorebookName ? '' : tr('STMemoryBooks_Compaction_NoSelectedLorebook', 'Select a Memory Book to see eligible entries.'))}</td></tr>
                </tbody>
            </table>
        </div>
    `), POPUP_TYPE.TEXT, '', {
        wide: true,
        large: true,
        allowVerticalScrolling: true,
        okButton: false,
        cancelButton: tr('STMemoryBooks_Close', 'Close'),
    });

    let currentLorebookName = '';
    let currentLorebookData = null;
    let currentEntries = [];

    const renderEntries = (message = '') => {
        const tbody = popup.dlg?.querySelector('#stmb-compaction-entry-body');
        if (!tbody) return;
        if (message) {
            tbody.innerHTML = `<tr><td colspan="4" class="opacity70p">${escapeHtml(message)}</td></tr>`;
            return;
        }
        tbody.innerHTML = buildCompactionEntryRows(currentEntries)
            || `<tr><td colspan="4" class="opacity70p">${escapeHtml(tr('STMemoryBooks_Compaction_NoEligibleEntries', 'No entries eligible for Compaction were found in this Memory Book.'))}</td></tr>`;
    };

    const loadSelectedLorebook = async (lorebookName) => {
        currentLorebookName = lorebookName || '';
        currentLorebookData = null;
        currentEntries = [];
        if (!currentLorebookName) {
            renderEntries(tr('STMemoryBooks_Compaction_NoSelectedLorebook', 'Select a Memory Book to see eligible entries.'));
            return;
        }

        try {
            const loaded = await loadCompactionEntriesForLorebook(currentLorebookName);
            currentLorebookData = loaded.lorebookData;
            currentEntries = loaded.entries;
            renderEntries();
        } catch (error) {
            console.error(`${MODULE_NAME}: Failed to load compaction lorebook:`, error);
            currentLorebookData = null;
            currentEntries = [];
            renderEntries(tr('STMemoryBooks_Compaction_Failed', 'Compaction failed.'));
        }
    };

    const showPromise = popup.show();
    initializeCompactionLorebookSelect(popup);
    initializeCompactionProfileSelect(popup, 'stmb-compaction-profile-select');
    popup.dlg?.querySelector('#stmb-compaction-profile-select')?.addEventListener('change', (event) => {
        setCompactionProfileIndex(readIntInput(event.target, getCompactionProfileIndex()));
    });
    popup.dlg?.querySelector('#stmb-edit-compaction-prompt')?.addEventListener('click', () => {
        void showCompactionPromptEditorPopup();
    });
    popup.dlg?.querySelector('#stmb-compaction-lorebook-select')?.addEventListener('change', (event) => {
        void loadSelectedLorebook(event.target.value || '');
    });
    popup.dlg?.addEventListener('click', async (event) => {
        const button = event.target.closest('.stmb-review-entry-action');
        if (!button || button.disabled) return;
        const row = button.closest('tr[data-entry-uid]');
        const uid = row?.dataset?.entryUid;
        const entry = Object.values(currentLorebookData?.entries || {}).find(item => String(item.uid) === uid);
        if (entry) {
            setCompactionEntryActionLoading(button, true);
            let loadingCleared = false;
            const clearLoadingState = () => {
                if (loadingCleared) return;
                loadingCleared = true;
                setCompactionEntryActionLoading(button, false);
            };
            let replaced = false;
            try {
                const profileIndex = getCompactionProfileIndexFromSelect(popup, 'stmb-compaction-profile-select');
                setCompactionProfileIndex(profileIndex);
                replaced = await showCompactReviewPopup(currentLorebookName, currentLorebookData, entry, {
                    skipPromptStep: true,
                    profileIndex,
                    onCompactionRequestSettled: clearLoadingState,
                });
            } finally {
                clearLoadingState();
            }
            if (replaced) {
                currentEntries = Object.values(currentLorebookData?.entries || {})
                    .filter(item => getCompactionEntryKind(item) !== null)
                    .sort((a, b) => String(a.comment || '').localeCompare(String(b.comment || '')));
                renderEntries();
            }
        }
    });
    await loadSelectedLorebook(defaultLorebookName);
    await showPromise;
}
