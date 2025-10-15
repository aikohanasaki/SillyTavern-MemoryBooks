import { eventSource, event_types, chat, chat_metadata, saveSettingsDebounced, characters, this_chid, name1, name2, saveMetadata, getCurrentChatId, settings as st_settings } from '../../../../script.js';
import { Popup, POPUP_TYPE, POPUP_RESULT } from '../../../popup.js';
import { extension_settings, saveMetadataDebounced } from '../../../extensions.js';
import { SlashCommandParser } from '../../../slash-commands/SlashCommandParser.js';
import { SlashCommand } from '../../../slash-commands/SlashCommand.js';
import { SlashCommandEnumValue } from '../../../slash-commands/SlashCommandEnumValue.js';
import { ARGUMENT_TYPE, SlashCommandArgument } from '../../../slash-commands/SlashCommandArgument.js';
import { executeSlashCommands } from '../../../slash-commands.js';
import { METADATA_KEY, world_names, loadWorldInfo, createNewWorldInfo } from '../../../world-info.js';
import { lodash, Handlebars, DOMPurify } from '../../../../lib.js';
import { escapeHtml } from '../../../utils.js';
import { compileScene, createSceneRequest, validateCompiledScene, getSceneStats } from './chatcompile.js';
import { createMemory } from './stmemory.js';
import { addMemoryToLorebook, getDefaultTitleFormats, identifyMemoryEntries, getRangeFromMemoryEntry } from './addlore.js';
import { generateLorebookName, autoCreateLorebook } from './autocreate.js';
import { checkAutoSummaryTrigger, handleAutoSummaryMessageReceived, handleAutoSummaryGroupFinished, clearAutoSummaryState } from './autosummary.js';
import { editProfile, newProfile, deleteProfile, exportProfiles, importProfiles, validateAndFixProfiles } from './profileManager.js';
import { getSceneMarkers, setSceneMarker, setSceneRange, clearScene, updateAllButtonStates, updateNewMessageButtonStates, validateSceneMarkers, handleMessageDeletion, createSceneButtons, getSceneData, updateSceneStateCache, getCurrentSceneState, saveMetadataForCurrentContext } from './sceneManager.js';
import { settingsTemplate } from './templates.js';
import { showConfirmationPopup, fetchPreviousSummaries, showMemoryPreviewPopup } from './confirmationPopup.js';
import { getEffectivePrompt, DEFAULT_PROMPT, deepClone, getUIModelSettings, getCurrentApiInfo, SELECTORS, getCurrentMemoryBooksContext, getEffectiveLorebookName, showLorebookSelectionPopup } from './utils.js';
import { editGroup } from '../../../group-chats.js';
import * as PromptManager from './summaryPromptManager.js';
import { MEMORY_GENERATION, SCENE_MANAGEMENT, UI_SETTINGS } from './constants.js';
import { evaluateTrackers, runAfterMemory, runSidePrompt } from './sidePrompts.js';
import { showSidePromptsPopup } from './sidePromptsPopup.js';
import { listTemplates } from './sidePromptsManager.js';
import { summaryPromptsTableTemplate } from './templatesSummaryPrompts.js';
import { addLocaleData, setLocale, t, applyI18n } from './i18n.js';
import { localeData } from './locales.js';
/**
 * Async effective prompt that respects Summary Prompt Manager overrides
 */
async function getEffectivePromptAsync(profile) {
    try {
        if (profile?.prompt && String(profile.prompt).trim()) {
            return profile.prompt;
        }
        if (profile?.preset) {
            return await PromptManager.getPrompt(profile.preset);
        }
    } catch (e) {
        console.warn(t('index.warn.getEffectivePromptAsync', 'STMemoryBooks: getEffectivePromptAsync fallback due to error:'), e);
    }
    return DEFAULT_PROMPT;
}
/**
 * Check if memory is currently being processed
 * @returns {boolean} True if memory creation is in progress
 */
export function isMemoryProcessing() {
    return isProcessingMemory;
}

export { currentProfile, validateLorebook };

const MODULE_NAME = 'STMemoryBooks';
let hasBeenInitialized = false; 

// Supported Chat Completion sources
const SUPPORTED_COMPLETION_SOURCES = [
    'openai', 'claude', 'openrouter', 'ai21', 'makersuite', 'vertexai',
    'mistralai', 'custom', 'cohere', 'perplexity', 'groq', 'nanogpt',
    'deepseek', 'electronhub', 'aimlapi', 'xai', 'pollinations',
    'moonshot', 'fireworks', 'cometapi', 'azure_openai'
];


const defaultSettings = {
    moduleSettings: {
        alwaysUseDefault: true,
        showMemoryPreviews: false,
        showNotifications: true,
        unhideBeforeMemory: false,
        refreshEditor: true,
        tokenWarningThreshold: 30000,
        defaultMemoryCount: 0,
        autoClearSceneAfterMemory: false,
        manualModeEnabled: false,
        allowSceneOverlap: false,
        autoHideMode: 'none',
        unhiddenEntriesCount: 0,
        autoSummaryEnabled: false,
        autoSummaryInterval: 100,
        autoCreateLorebook: false,
        lorebookNameTemplate: 'LTM - {{char}} - {{chat}}',
    },
    titleFormat: '[000] - {{title}}',
    profiles: [], // Will be populated dynamically with current ST settings
    defaultProfile: 0,
    migrationVersion: 4,
}

// Current state variables
let currentPopupInstance = null;
let isProcessingMemory = false;
let currentProfile = null;
let isDryRun = false;

/* Settings cache for restoration */
let cachedSettings = null;


// MutationObserver for chat message monitoring
let chatObserver = null;
let updateTimeout = null;

/**
 * Process messages and return processed elements
 * @param {Node} node The DOM node to process.
 * @returns {Array} Array of message elements that had buttons added
 */
function processNodeForMessages(node) {
    const processedMessages = [];

    // If the node itself is a message element
    if (node.matches && node.matches('#chat .mes[mesid]')) {
        if (!node.querySelector('.mes_stmb_start')) {
            createSceneButtons(node);
            processedMessages.push(node);
        }
    } 
    // Find any message elements within the added node
    else if (node.querySelectorAll) {
        const newMessages = node.querySelectorAll('#chat .mes[mesid]');
        newMessages.forEach(mes => {
            if (!mes.querySelector('.mes_stmb_start')) {
                createSceneButtons(mes);
                processedMessages.push(mes);
            }
        });
    }

    return processedMessages;
}

/**
 * Chat observer with partial updates
 */
function initializeChatObserver() {
    // Clean up existing observer if any
    if (chatObserver) {
        chatObserver.disconnect();
        chatObserver = null;
    }

    const chatContainer = document.getElementById('chat');
    if (!chatContainer) {
        throw new Error(t('index.error.chatContainerNotFound', 'STMemoryBooks: Chat container not found. SillyTavern DOM structure may have changed.'));
    }

    // Ensure scene state is initialized before starting observer
    const sceneState = getCurrentSceneState();
    if (!sceneState || (sceneState.start === null && sceneState.end === null)) {
        updateSceneStateCache();
    }

    chatObserver = new MutationObserver((mutations) => {
        const newlyProcessedMessages = [];
        
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    try {
                        // Collect all newly processed messages
                        const processed = processNodeForMessages(node);
                        newlyProcessedMessages.push(...processed);
                    } catch (error) {
                        console.error(t('index.error.processingChatElements', 'STMemoryBooks: Error processing new chat elements:'), error);
                    }
                }
            }
        }

        if (newlyProcessedMessages.length > 0) {
            // Debounce the state update to prevent excessive calls
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => {
                try {
                    // Use partial update for new messages only
                    updateNewMessageButtonStates(newlyProcessedMessages);
                } catch (error) {
                    console.error(t('index.error.updatingButtonStates', 'STMemoryBooks: Error updating button states:'), error);
                }
            }, UI_SETTINGS.CHAT_OBSERVER_DEBOUNCE_MS);
        }
    });

    // Start observing the chat container
    chatObserver.observe(chatContainer, {
        childList: true,
        subtree: true 
    });

    console.log(t('index.log.chatObserverInitialized', 'STMemoryBooks: Chat observer initialized'));
}

/**
 * Clean up chat observer
 */
function cleanupChatObserver() {
    if (chatObserver) {
        chatObserver.disconnect();
        chatObserver = null;
        console.log(t('index.log.chatObserverDisconnected', 'STMemoryBooks: Chat observer disconnected'));
    }
    
    if (updateTimeout) {
        clearTimeout(updateTimeout);
        updateTimeout = null;
    }
}

function handleChatChanged() {
    console.log(t('index.log.chatChanged', 'STMemoryBooks: Chat changed - updating scene state'));
    updateSceneStateCache();
    validateAndCleanupSceneMarkers();
    
    setTimeout(() => {
        try {
            // Full update needed for chat changes
            processExistingMessages();
        } catch (error) {
            console.error(t('index.error.processingMessagesAfterChange', 'STMemoryBooks: Error processing messages after chat change:'), error);
        }
    }, UI_SETTINGS.CHAT_OBSERVER_DEBOUNCE_MS);
}

/**
 * Validate and clean up orphaned scene markers
 */
function validateAndCleanupSceneMarkers() {
    const stmbData = getSceneMarkers() || {};
    const { sceneStart, sceneEnd } = stmbData;

    // Check if we have orphaned scene markers (scene markers without active memory creation)
    if (sceneStart !== null || sceneEnd !== null) {
        console.log(t('index.log.foundOrphanedMarkers', '', { start: sceneStart, end: sceneEnd }));

        // Check if memory creation is actually in progress
        if (!isProcessingMemory && extension_settings[MODULE_NAME].moduleSettings.autoSummaryEnabled) {
            clearScene();
        }
    }
}


async function handleMessageReceived() {
    try {
        setTimeout(validateSceneMarkers, SCENE_MANAGEMENT.VALIDATION_DELAY_MS);
        await handleAutoSummaryMessageReceived();
        await evaluateTrackers();
    } catch (error) {
        console.error(t('index.error.handleMessageReceived', 'STMemoryBooks: Error in handleMessageReceived:'), error);
    }
}

async function handleGroupWrapperFinished() {
    try {
        setTimeout(validateSceneMarkers, SCENE_MANAGEMENT.VALIDATION_DELAY_MS);
        await handleAutoSummaryGroupFinished();
        await evaluateTrackers();
    } catch (error) {
        console.error(t('index.error.handleGroupWrapperFinished', 'STMemoryBooks: Error in handleGroupWrapperFinished:'), error);
    }
}

/**
 * Slash command handlers
 */
async function handleCreateMemoryCommand(namedArgs, unnamedArgs) {
    const sceneData = await getSceneData();
    if (!sceneData) {
        console.error(t('index.error.noSceneMarkersForCreate', 'STMemoryBooks: No scene markers set for createMemory command'));
        toastr.error(t('STMemoryBooks_NoSceneMarkersToastr', 'No scene markers set. Use chevron buttons to mark start and end points first.'), t('index.toast.title', 'STMemoryBooks'));
        return ''; 
    }
    
    initiateMemoryCreation();
    return ''; 
}


async function handleSceneMemoryCommand(namedArgs, unnamedArgs) {
    const range = String(unnamedArgs || '').trim();
    
    if (!range) {
        toastr.error(t('STMemoryBooks_MissingRangeArgument', 'Missing range argument. Use: /scenememory X-Y (e.g., /scenememory 10-15)'), t('index.toast.title', 'STMemoryBooks'));
        return '';
    }
   
    const match = range.match(/^(\d+)\s*[-–—]\s*(\d+)$/);
    
    if (!match) {
        toastr.error(t('STMemoryBooks_InvalidFormat', 'Invalid format. Use: /scenememory X-Y (e.g., /scenememory 10-15)'), t('index.toast.title', 'STMemoryBooks'));
        return '';
    }
    
    const startId = Number(match[1]);
    const endId = Number(match[2]);

    if (!Number.isFinite(startId) || !Number.isFinite(endId)) {
        toastr.error(t('STMemoryBooks_InvalidMessageIDs', 'Invalid message IDs parsed. Use: /scenememory X-Y (e.g., /scenememory 10-15)'), t('index.toast.title', 'STMemoryBooks'));
        return '';
    }
    
    // Validate range logic (start = end is valid for single message)
    if (startId > endId) {
        toastr.error(t('STMemoryBooks_StartGreaterThanEnd', 'Start message cannot be greater than end message'), t('index.toast.title', 'STMemoryBooks'));
        return '';
    }
    
    // IMPORTANT: Use the global chat array for validation to match compileScene()
    const activeChat = chat;

    // Validate message IDs exist in current chat
    if (startId < 0 || endId >= activeChat.length) {
        toastr.error(t('STMemoryBooks_MessageIDsOutOfRange', `Message IDs out of range. Valid range: 0-${activeChat.length - 1}`), t('index.toast.title', 'STMemoryBooks'));
        return '';
    }
    
    // check if messages actually exist
    if (!activeChat[startId] || !activeChat[endId]) {
        toastr.error(t('STMemoryBooks_MessagesDoNotExist', 'One or more specified messages do not exist'), t('index.toast.title', 'STMemoryBooks'));
        return '';
    }
    
    // Atomically set both scene markers for /scenememory
    setSceneRange(startId, endId);
    
    const context = getCurrentMemoryBooksContext();
    const contextMsg = context.isGroupChat ? ` in group "${context.groupName}"` : '';
    toastr.info(t('STMemoryBooks_SceneSet', `Scene set: messages ${startId}-${endId}${contextMsg}`), t('index.toast.title', 'STMemoryBooks'));
    
    initiateMemoryCreation();

    return '';
}

async function handleNextMemoryCommand(namedArgs, unnamedArgs) {
    try {
        // Prevent re-entrancy
        if (isProcessingMemory) {
            toastr.info(t('STMemoryBooks_MemoryAlreadyInProgress', 'Memory creation is already in progress'), t('index.toast.title', 'STMemoryBooks'));
            return '';
        }

        // Validate lorebook exists (fast-fail UX);
        // initiateMemoryCreation will validate again before running
        const lorebookValidation = await validateLorebook();
        if (!lorebookValidation.valid) {
            toastr.error(t('STMemoryBooks_NoLorebookAvailable', 'No lorebook available: ' + lorebookValidation.error), t('index.toast.title', 'STMemoryBooks'));
            return '';
        }

        // Compute next range since last memory
        const stmbData = getSceneMarkers() || {};
        const lastIndex = chat.length - 1;

        if (lastIndex < 0) {
            toastr.info(t('STMemoryBooks_NoMessagesToSummarize', 'There are no messages to summarize yet.'), t('index.toast.title', 'STMemoryBooks'));
            return '';
        }

        const highestProcessed = (typeof stmbData.highestMemoryProcessed === 'number')
            ? stmbData.highestMemoryProcessed
            : null;

        const sceneStart = (highestProcessed === null) ? 0 : (highestProcessed + 1);
        const sceneEnd = lastIndex;

        if (sceneStart > sceneEnd) {
            toastr.info(t('STMemoryBooks_NoNewMessagesSinceLastMemory', 'No new messages since the last memory.'), t('index.toast.title', 'STMemoryBooks'));
            return '';
        }

        // Set scene range and run the standard memory pipeline
        setSceneRange(sceneStart, sceneEnd);
        await initiateMemoryCreation();

    } catch (error) {
        console.error(t('index.error.nextMemoryFailed', 'STMemoryBooks: /nextmemory failed:'), error);
        toastr.error(t('STMemoryBooks_NextMemoryFailed', 'Failed to run /nextmemory: ' + error.message), t('index.toast.title', 'STMemoryBooks'));
    }
    return '';
}

/**
 * Show a minimal side prompt picker and run the selected one
 */
async function showSidePromptPickerAndRun(initialFilter = '') {
    // Load all templates and prefer those with manual command
    const templates = await listTemplates();
    const all = Array.isArray(templates) ? templates : [];
    const manualFirst = [...all].sort((a, b) => {
        const aManual = (a?.triggers?.commands || []).some(c => String(c).toLowerCase() === 'sideprompt') ? 1 : 0;
        const bManual = (b?.triggers?.commands || []).some(c => String(c).toLowerCase() === 'sideprompt') ? 1 : 0;
        return bManual - aManual;
    });

    // Build popup content
    let content = '<h3 data-i18n="STMemoryBooks_RunSidePrompt">Run Side Prompt</h3>';
    content += '<div class="world_entry_form_control">';
    content += '<input type="text" id="stmb-sp-picker-search" class="text_pole" data-i18n="[placeholder]STMemoryBooks_SearchSidePrompts;[aria-label]STMemoryBooks_SearchSidePrompts" placeholder="Search side prompts..." aria-label="Search side prompts" />';
    content += '</div>';
    content += '<div id="stmb-sp-picker-list" class="padding10" style="max-height: 340px; overflow-y: auto;"></div>';

    const popup = new Popup(DOMPurify.sanitize(content), POPUP_TYPE.TEXT, '', {
        okButton: false,
        cancelButton: t('STMemoryBooks_Close', 'Close'),
        wide: true
    });

    const renderList = (filter) => {
        const q = String(filter || '').toLowerCase();
        const items = manualFirst.filter(t => {
            if (!q) return true;
            const hay = (t.name || '').toLowerCase() + ' ' + getSPTriggersSummary(t).join(' ').toLowerCase();
            return hay.includes(q);
        });

        const container = popup.dlg?.querySelector('#stmb-sp-picker-list');
        if (!container) return;

        if (items.length === 0) {
            container.innerHTML = `<div class="opacity50p">${escapeHtml(t('STMemoryBooks_NoMatches', 'No matches'))}</div>`;
            return;
        }

        const rows = items.map(t => {
            const badges = getSPTriggersSummary(t);
            const badgesHtml = badges.length ? badges.map(b => `<span class="badge" style="margin-right:6px;">${escapeHtml(b)}</span>`).join('') : '';
            return `
                <div class="stmb-sp-picker-row" data-name="${escapeHtml(t.name)}" 
                     style="display:flex;justify-content:space-between;align-items:center;padding:8px;border-bottom:1px solid var(--SmartThemeBorderColor);cursor:pointer;">
                    <div>${escapeHtml(t.name)}</div>
                    <div>${badgesHtml}</div>
                </div>
            `;
        }).join('');

        container.innerHTML = rows;

        // Attach click handlers
        container.querySelectorAll('.stmb-sp-picker-row').forEach(row => {
            row.addEventListener('click', async () => {
                const name = row.getAttribute('data-name') || '';
                // Run unified sideprompt
                try {
                    await runSidePrompt(name);
                } finally {
                    popup.completeCancelled();
                }
            });
        });
    };

    // Attach handlers and show
    await popup.show();
    applyI18n(popup);
    // Pre-fill search
    const search = popup.dlg?.querySelector('#stmb-sp-picker-search');
    if (search) {
        search.value = initialFilter || '';
        search.addEventListener('input', () => renderList(search.value));
    }
    renderList(initialFilter || '');
}

/**
 * Slash: /sideprompt (with optional name/range)
 * If no args, open a picker for discoverability.
 */
async function handleSidePromptCommand(namedArgs, unnamedArgs) {
    const raw = String(unnamedArgs || '').trim();
    if (!raw) {
        toastr.info(t('STMemoryBooks_SidePromptGuide', 'SidePrompt guide: Type a template name after the space to see suggestions. Usage: /sideprompt "Name" [X-Y]. Quote names with spaces.'), t('index.toast.title', 'STMemoryBooks'));
        return '';
    }

    // If user typed partial name without range and it doesn't exactly match,
    // try a quick best effort: if multiple results, show picker filtered; else run directly.
    const parts = raw.match(/^["']([^"']+)["']\s*(.*)$/) || raw.match(/^(.+?)(\s+\d+\s*[-–—]\s*\d+)?$/);
    const namePart = parts ? (parts[1] || raw).trim() : raw;

    try {
        // Load and filter
        const templates = await listTemplates();
        const candidates = templates.filter(t => t.name.toLowerCase().includes(namePart.toLowerCase()));
        if (candidates.length > 1) {
            const top = candidates.slice(0, 5).map(t => t.name).join(', ');
            const more = candidates.length > 5 ? `, +${candidates.length - 5} more` : '';
            toastr.info(t('STMemoryBooks_MultipleMatches', `Multiple matches: ${top}${more}. Refine the name or use quotes. Usage: /sideprompt "Name" [X-Y]`), t('index.toast.title', 'STMemoryBooks'));
            return '';
        }
        // Fall back to direct run (runSidePrompt will resolve fuzzy or error toast)
        return runSidePrompt(raw);
    } catch {
        // Fallback to direct run
        return runSidePrompt(raw);
    }
}

/**
 * Side Prompt names cache for autocomplete
 */
let sidePromptNameCache = [];
async function refreshSidePromptCache() {
    try {
        const tpls = await listTemplates();
        sidePromptNameCache = (tpls || [])
            .filter(t => {
                const cmds = t?.triggers?.commands;
                // Back-compat: if commands is missing, treat as manual-enabled for suggestions
                if (!('commands' in (t?.triggers || {}))) return true;
                return Array.isArray(cmds) && cmds.some(c => String(c).toLowerCase() === 'sideprompt');
            })
            .map(t => t.name);
    } catch (e) {
        console.warn(t('index.warn.sidePromptCacheRefreshFailed', 'STMemoryBooks: side prompt cache refresh failed'), e);
    }
}
window.addEventListener('stmb-sideprompts-updated', refreshSidePromptCache);
// Preload cache early so suggestions are available even before init() completes
try { refreshSidePromptCache(); } catch (e) { /* noop */ }

/**
 * Helper: build triggers badges for prompt picker
 */
function getSPTriggersSummary(tpl) {
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
 * Initialize and validate extension settings
 */
function initializeSettings() {
    extension_settings.STMemoryBooks = extension_settings.STMemoryBooks || deepClone(defaultSettings);

    // Migration logic for versions 3-4: Add dynamic profile and clean up titleFormat
    const currentVersion = extension_settings.STMemoryBooks.migrationVersion || 1;
    if (currentVersion < 4) {
        // Check if dynamic profile already exists (in case of partial migration)
        const hasDynamicProfile = extension_settings.STMemoryBooks.profiles?.some(p => p.useDynamicSTSettings || p?.connection?.api === 'current_st');

        if (!hasDynamicProfile) {
            // Add dynamic profile for existing installations
            if (!extension_settings.STMemoryBooks.profiles) {
                extension_settings.STMemoryBooks.profiles = [];
            }

            // Insert dynamic profile at the beginning of the array
            const dynamicProfile = {
                name: "Current SillyTavern Settings",
                connection: {
                    api: 'current_st'
                },
                preset: 'summary',
                constVectMode: 'link',
                position: 0,
                orderMode: 'auto',
                orderValue: 100,
                preventRecursion: true,
                delayUntilRecursion: false
            };

            extension_settings.STMemoryBooks.profiles.unshift(dynamicProfile);

            // Adjust default profile index since we inserted at the beginning
            if (extension_settings.STMemoryBooks.defaultProfile !== undefined) {
                extension_settings.STMemoryBooks.defaultProfile += 1;
            }

            console.log(t('index.log.addedDynamicProfile', `${MODULE_NAME}: Added dynamic profile for existing installation (migration to v3)`));
        }

        // Clean up any existing dynamic profiles that may have titleFormat
        extension_settings.STMemoryBooks.profiles.forEach(profile => {
            if (profile.useDynamicSTSettings && profile.titleFormat) {
                delete profile.titleFormat;
                console.log(t('index.log.removedStaticTitleFormat', `${MODULE_NAME}: Removed static titleFormat from dynamic profile`));
            }
        });

        // Update migration version
        extension_settings.STMemoryBooks.migrationVersion = 4;
        saveSettingsDebounced();
    }

    // If this is a fresh install (no profiles), create default profile that dynamically uses ST settings
    if (!extension_settings.STMemoryBooks.profiles || extension_settings.STMemoryBooks.profiles.length === 0) {
        const dynamicProfile = {
            name: "Current SillyTavern Settings",
            connection: {
                api: 'current_st'
            },
            preset: 'summary',
            constVectMode: 'link',
            position: 0,
            orderMode: 'auto',
            orderValue: 100,
            preventRecursion: true,
            delayUntilRecursion: false
        };

        extension_settings.STMemoryBooks.profiles = [dynamicProfile];
        console.log(t('index.log.createdDynamicProfile', `${MODULE_NAME}: Created dynamic profile for fresh installation`));
    }

    const validationResult = validateSettings(extension_settings.STMemoryBooks);

    // Also validate profiles structure
    const profileValidation = validateAndFixProfiles(extension_settings.STMemoryBooks);
    if (profileValidation.fixes.length > 0) {
        console.log(t('index.log.appliedProfileFixes', `${MODULE_NAME}: Applied profile fixes:`), profileValidation.fixes);
        saveSettingsDebounced();
    }

    return validationResult;
}

/**
 * Validate settings structure and fix any issues
 */
function validateSettings(settings) {
    if (!settings.profiles || settings.profiles.length === 0) {
        // Avoid creating [undefined]; allow downstream validator to create a proper dynamic profile.
        settings.profiles = [];
        settings.defaultProfile = 0;
    }
    
    if (settings.defaultProfile >= settings.profiles.length) {
        settings.defaultProfile = 0;
    }
    
    if (!settings.moduleSettings) {
        settings.moduleSettings = deepClone(defaultSettings.moduleSettings);
    }
    
    if (!settings.moduleSettings.tokenWarningThreshold || 
        settings.moduleSettings.tokenWarningThreshold < 1000) {
        settings.moduleSettings.tokenWarningThreshold = 30000;
    }
    
    if (settings.moduleSettings.defaultMemoryCount === undefined ||
        settings.moduleSettings.defaultMemoryCount < 0) {
        settings.moduleSettings.defaultMemoryCount = 0;
    }

    // Validate auto-summary settings
    if (settings.moduleSettings.autoSummaryEnabled === undefined) {
        settings.moduleSettings.autoSummaryEnabled = false;
    }
    if (settings.moduleSettings.autoSummaryInterval === undefined ||
        settings.moduleSettings.autoSummaryInterval < 10) {
        settings.moduleSettings.autoSummaryInterval = 100;
    }

    // Validate auto-create lorebook setting - always defaults to false
    if (settings.moduleSettings.autoCreateLorebook === undefined) {
        settings.moduleSettings.autoCreateLorebook = false;
    }

    // Validate unhide-before-memory setting (defaults to false)
    if (settings.moduleSettings.unhideBeforeMemory === undefined) {
        settings.moduleSettings.unhideBeforeMemory = false;
    }

    // Validate lorebook name template
    if (!settings.moduleSettings.lorebookNameTemplate) {
        settings.moduleSettings.lorebookNameTemplate = 'LTM - {{char}} - {{chat}}';
    }

    // Ensure mutual exclusion: both cannot be true at the same time
    if (settings.moduleSettings.manualModeEnabled && settings.moduleSettings.autoCreateLorebook) {
        // If both are somehow true, prioritize manual mode (since it was added first)
        settings.moduleSettings.autoCreateLorebook = false;
        console.warn(t('index.warn.mutualExclusion', 'STMemoryBooks: Both manualModeEnabled and autoCreateLorebook were true - setting autoCreateLorebook to false'));
    }
    
    // Migrate to version 2 if needed (JSON-based architecture)
    if (!settings.migrationVersion || settings.migrationVersion < 2) {
        console.log(t('index.log.migratingV2', `${MODULE_NAME}: Migrating to JSON-based architecture (v2)`));
        settings.migrationVersion = 2;
        // Update any old tool-based prompts to JSON prompts
        settings.profiles.forEach(profile => {
            if (profile.prompt && profile.prompt.includes('createMemory')) {
                console.log(t('index.log.updatingProfileToJSON', `${MODULE_NAME}: Updating profile "${profile.name}" to use JSON output`));
                profile.prompt = DEFAULT_PROMPT; // Reset to new JSON-based default
            }
        });
    }
    
    return settings;
}


/**
 * Validate lorebook and return status with data
 */
async function validateLorebook() {
    const settings = extension_settings.STMemoryBooks;
    let lorebookName = await getEffectiveLorebookName();

    // Check if auto-create is enabled and we're not in manual mode
    if (!lorebookName &&
        settings?.moduleSettings?.autoCreateLorebook &&
        !settings?.moduleSettings?.manualModeEnabled) {

        // Auto-create lorebook using template
        const template = settings.moduleSettings.lorebookNameTemplate || 'LTM - {{char}} - {{chat}}';
        const result = await autoCreateLorebook(template, 'chat');

        if (result.success) {
            lorebookName = result.name;
        } else {
            return { valid: false, error: result.error };
        }
    }

    if (!lorebookName) {
        return { valid: false, error: 'No lorebook available or selected.' };
    }

    if (!world_names || !world_names.includes(lorebookName)) {
        return { valid: false, error: `Selected lorebook "${lorebookName}" not found.` };
    }

    try {
        const lorebookData = await loadWorldInfo(lorebookName);
        return { valid: !!lorebookData, data: lorebookData, name: lorebookName };
    } catch (error) {
        return { valid: false, error: 'Failed to load the selected lorebook.' };
    }
}


/**
 * Extract and validate settings from confirmation popup or defaults
 */
async function showAndGetMemorySettings(sceneData, lorebookValidation, selectedProfileIndex = null) {
    const settings = initializeSettings();
    const tokenThreshold = settings.moduleSettings.tokenWarningThreshold || 30000;
    const shouldShowConfirmation = !settings.moduleSettings.alwaysUseDefault || 
                                  sceneData.estimatedTokens > tokenThreshold;
    
    let confirmationResult = null;
    
    if (shouldShowConfirmation) {
        // Use the passed profile index, or fall back to default
        const profileIndex = selectedProfileIndex !== null ? selectedProfileIndex : settings.defaultProfile;
        
        // Show simplified confirmation popup with selected profile
        confirmationResult = await showConfirmationPopup(
            sceneData, 
            settings, 
            getUIModelSettings(), 
            getCurrentApiInfo(), 
            chat_metadata,
            profileIndex
        );
        
        if (!confirmationResult.confirmed) {
            return null; // User cancelled
        }
    } else {
        // Use default profile without confirmation
        const selectedProfile = settings.profiles[settings.defaultProfile];
        confirmationResult = {
            confirmed: true,
            profileSettings: {
                ...selectedProfile,
                effectivePrompt: await getEffectivePromptAsync(selectedProfile)
            },
            advancedOptions: {
                memoryCount: settings.moduleSettings.defaultMemoryCount || 0,
                overrideSettings: false
            }
        };
    }
    
    // Build effective connection settings
    const { profileSettings, advancedOptions } = confirmationResult;

    // Check if this profile should dynamically use ST settings
    if ((profileSettings?.connection?.api === 'current_st') || advancedOptions.overrideSettings) {
        const currentApiInfo = getCurrentApiInfo();
        const currentSettings = getUIModelSettings();

        profileSettings.effectiveConnection = {
            api: currentApiInfo.completionSource || 'openai',
            model: currentSettings.model || '',
            temperature: currentSettings.temperature || 0.7
        };

        if (profileSettings.useDynamicSTSettings) {
            console.log('STMemoryBooks: Using dynamic ST settings profile - current settings:', profileSettings.effectiveConnection);
        } else {
            console.log('STMemoryBooks: Using current SillyTavern settings override for memory creation');
        }
    } else {
        profileSettings.effectiveConnection = { ...profileSettings.connection };
        console.log('STMemoryBooks: Using profile connection settings for memory creation');
    }
    
    return {
        profileSettings,
        summaryCount: advancedOptions.memoryCount || 0,
        tokenThreshold,
        settings
    };
}

/**
 * Determine if an error is retryable
 */
function isRetryableError(error) {
    // Don't retry these error types
    const nonRetryableErrors = [
        'TokenWarningError',     // User needs to select smaller range
        'InvalidProfileError'    // Configuration issue
    ];
    
    if (nonRetryableErrors.includes(error.name)) {
        return false;
    }
    
    // Don't retry validation errors
    if (error.message.includes('Scene compilation failed') || 
        error.message.includes('Invalid memory result') ||
        error.message.includes('Invalid lorebook')) {
        return false;
    }
    
    // Retry AI response errors and network-related issues
    return true;
}


/**
 * Execute the core memory generation process - now with retry logic and BULLETPROOF settings restoration
 */
async function executeMemoryGeneration(sceneData, lorebookValidation, effectiveSettings, retryCount = 0) {
    const { profileSettings, summaryCount, tokenThreshold, settings } = effectiveSettings;
    currentProfile = profileSettings;
    const maxRetries = MEMORY_GENERATION.MAX_RETRIES;

    try {
        // Optionally unhide hidden messages before compiling scene
        if (settings?.moduleSettings?.unhideBeforeMemory) {
            try {
                await executeSlashCommands(`/unhide ${sceneData.sceneStart}-${sceneData.sceneEnd}`);
            } catch (e) {
                console.warn('STMemoryBooks: /unhide command failed or unavailable:', e);
            }
        }
        // Create and compile scene first
        const sceneRequest = createSceneRequest(sceneData.sceneStart, sceneData.sceneEnd);
        const compiledScene = compileScene(sceneRequest);

        // Validate compiled scene
        const validation = validateCompiledScene(compiledScene);
        if (!validation.valid) {
            throw new Error(`Scene compilation failed: ${validation.errors.join(', ')}`);
        }

        // Fetch previous memories if requested
        let previousMemories = [];
        let memoryFetchResult = { summaries: [], actualCount: 0, requestedCount: 0 };
        if (summaryCount > 0) {
            // Fetch previous memories silently (no intermediate toast)
            memoryFetchResult = await fetchPreviousSummaries(summaryCount, settings, chat_metadata);
            previousMemories = memoryFetchResult.summaries;

            if (memoryFetchResult.actualCount > 0) {
                if (memoryFetchResult.actualCount < memoryFetchResult.requestedCount) {
                    toastr.warning(t('STMemoryBooks_OnlyNOfRequestedMemoriesAvailable', `Only ${memoryFetchResult.actualCount} of ${memoryFetchResult.requestedCount} requested memories available`), 'STMemoryBooks');
                }
                console.log(`STMemoryBooks: Including ${memoryFetchResult.actualCount} previous memories as context`);
            } else {
                toastr.warning(t('STMemoryBooks_NoPreviousMemoriesFound', 'No previous memories found in lorebook'), 'STMemoryBooks');
            }
        }

        // Show working toast with actual memory count after fetching
        let workingToastMessage;
        if (retryCount > 0) {
            workingToastMessage = `Retrying memory creation (attempt ${retryCount + 1}/${maxRetries + 1})...`;
        } else {
            workingToastMessage = memoryFetchResult.actualCount > 0
                ? `Creating memory with ${memoryFetchResult.actualCount} context memories...`
                : 'Creating memory...';
        }
        toastr.info(t('STMemoryBooks_WorkingToast', workingToastMessage), 'STMemoryBooks', { timeOut: 0 });
        
        // Add context and get stats (no intermediate toast)
        compiledScene.previousSummariesContext = previousMemories;
        const stats = getSceneStats(compiledScene);
        const actualTokens = stats.estimatedTokens;

        // Generate memory silently
        const memoryResult = await createMemory(compiledScene, profileSettings, {
            tokenWarningThreshold: tokenThreshold
        });

        // Check if memory previews are enabled and handle accordingly
        let finalMemoryResult = memoryResult;

        if (settings.moduleSettings.showMemoryPreviews) {
            // Clear working toast before showing preview popup
            toastr.clear();

            const previewResult = await showMemoryPreviewPopup(memoryResult, sceneData, profileSettings);

            if (previewResult.action === 'cancel') {
                // User cancelled, abort the process
                return;
            } else if (previewResult.action === 'retry') {
                // User wants to retry - limit user-initiated retries to prevent infinite loops
                const maxUserRetries = 3; // Allow up to 3 user-initiated retries
                const currentUserRetries = retryCount >= maxRetries ? retryCount - maxRetries : 0;

                if (currentUserRetries >= maxUserRetries) {
                    toastr.warning(t('STMemoryBooks_MaximumRetryAttemptsReached', `Maximum retry attempts (${maxUserRetries}) reached`), 'STMemoryBooks');
                    return { action: 'cancel' };
                }

                toastr.info(t('STMemoryBooks_RetryingMemoryGeneration', `Retrying memory generation (${currentUserRetries + 1}/${maxUserRetries})...`), 'STMemoryBooks');
                // Keep the retry count properly incremented to track total attempts
                const nextRetryCount = Math.max(retryCount + 1, maxRetries + currentUserRetries + 1);
                return await executeMemoryGeneration(sceneData, lorebookValidation, effectiveSettings, nextRetryCount);
            }

            // Handle preview result based on action
            if (previewResult.action === 'accept') {
                // User accepted as-is, use original data
                finalMemoryResult = memoryResult;
            } else if (previewResult.action === 'edit') {
                // User edited the data, validate and use edited version
                if (!previewResult.memoryData) {
                    console.error('STMemoryBooks: Edit action missing memoryData');
                    toastr.error(t('STMemoryBooks_UnableToRetrieveEditedMemoryData', 'Unable to retrieve edited memory data'), 'STMemoryBooks');
                    return;
                }

                // Validate that edited memory data has required fields
                if (!previewResult.memoryData.extractedTitle || !previewResult.memoryData.content) {
                    console.error('STMemoryBooks: Edited memory data missing required fields');
                    toastr.error(t('STMemoryBooks_EditedMemoryDataIncomplete', 'Edited memory data is incomplete'), 'STMemoryBooks');
                    return;
                }

                finalMemoryResult = previewResult.memoryData;
            } else {
                // Unexpected action, use original data as fallback
                console.warn(`STMemoryBooks: Unexpected preview action: ${previewResult.action}`);
                finalMemoryResult = memoryResult;
            }
        }

        // Add to lorebook silently
        const addResult = await addMemoryToLorebook(finalMemoryResult, lorebookValidation);

        if (!addResult.success) {
            throw new Error(addResult.error || 'Failed to add memory to lorebook');
        }

        // Run side prompts that are enabled to run with memories
        try {
            const connDbg = (profileSettings?.effectiveConnection || profileSettings?.connection || {});
            console.debug('STMemoryBooks: Passing profile to runAfterMemory', {
                api: connDbg.api,
                model: connDbg.model,
                temperature: connDbg.temperature
            });
            await runAfterMemory(compiledScene, profileSettings);
        } catch (e) {
            console.warn('STMemoryBooks: runAfterMemory failed:', e);
        }
        
        // Update auto-summary baseline so the next trigger starts after this scene
        try {
            const stmbData = getSceneMarkers() || {};
            stmbData.highestMemoryProcessed = sceneData.sceneEnd;
            saveMetadataForCurrentContext();
        } catch (e) {
            console.warn('STMemoryBooks: Failed to update highestMemoryProcessed baseline:', e);
        }
        
        // Clear auto-summary state after successful memory creation
        clearAutoSummaryState();
        
        // Success notification
        const contextMsg = memoryFetchResult.actualCount > 0 ?
            ` (with ${memoryFetchResult.actualCount} context ${memoryFetchResult.actualCount === 1 ? 'memory' : 'memories'})` : '';

        // Clear working toast and show success
        toastr.clear();
        const retryMsg = retryCount > 0 ? ` (succeeded on attempt ${retryCount + 1})` : '';
        toastr.success(t('STMemoryBooks_MemoryCreatedSuccessfully', `Memory "${addResult.entryTitle}" created successfully${contextMsg}${retryMsg}!`), 'STMemoryBooks');
        
    } catch (error) {
        console.error('STMemoryBooks: Error creating memory:', error);
        
        // Determine if we should retry
        const shouldRetry = retryCount < maxRetries && isRetryableError(error);
        
        if (shouldRetry) {
            // Show retry notification and attempt again
            toastr.warning(t('STMemoryBooks_MemoryCreationFailedWillRetry', `Memory creation failed (attempt ${retryCount + 1}). Retrying in ${Math.round(MEMORY_GENERATION.RETRY_DELAY_MS / 1000)} seconds...`), 'STMemoryBooks', {
                timeOut: 3000
            });
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, MEMORY_GENERATION.RETRY_DELAY_MS));
            
            // Recursive retry
            return await executeMemoryGeneration(sceneData, lorebookValidation, effectiveSettings, retryCount + 1);
        }
        
        // No more retries or non-retryable error - show final error
        const retryMsg = retryCount > 0 ? ` (failed after ${retryCount + 1} attempts)` : '';
        
        // Provide specific error messages for different types of failures
        if (error.name === 'TokenWarningError') {
            toastr.error(t('STMemoryBooks_SceneTooLarge', `Scene is too large (${error.tokenCount} tokens). Try selecting a smaller range${retryMsg}.`), 'STMemoryBooks', {
                timeOut: 8000
            });
        } else if (error.name === 'AIResponseError') {
            toastr.error(t('STMemoryBooks_AIFailedToGenerateValidMemory', `AI failed to generate valid memory: ${error.message}${retryMsg}`), 'STMemoryBooks', {
                timeOut: 8000
            });
        } else if (error.name === 'InvalidProfileError') {
            toastr.error(t('STMemoryBooks_ProfileConfigurationError', `Profile configuration error: ${error.message}${retryMsg}`), 'STMemoryBooks', {
                timeOut: 8000
            });
        } else {
            toastr.error(t('STMemoryBooks_FailedToCreateMemory', `Failed to create memory: ${error.message}${retryMsg}`), 'STMemoryBooks');
        }
    }
}

async function initiateMemoryCreation(selectedProfileIndex = null) {
    // Early validation checks (no flag set yet) - GROUP CHAT COMPATIBLE
    const context = getCurrentMemoryBooksContext();
    
    // For single character chats, check character data
    if (!context.isGroupChat) {
        if (!characters || characters.length === 0 || !characters[this_chid]) {
toastr.error(t('STMemoryBooks_LoadingCharacterData', 'SillyTavern is still loading character data, please wait a few seconds and try again.'), 'STMemoryBooks');
            return;
        }
    }
    // For group chats, check that we have group data
    else {
        if (!context.groupId || !context.groupName) {
toastr.error(t('STMemoryBooks_GroupChatDataUnavailable', 'Group chat data not available, please wait a few seconds and try again.'), 'STMemoryBooks');
            return;
        }
    }
    
    // RACE CONDITION FIX: Check and set flag atomically
    if (isProcessingMemory) {
        return;
    }
    
    // Set processing flag IMMEDIATELY after validation to prevent race conditions
    isProcessingMemory = true;
    
    try {
        const settings = initializeSettings();

        // All the validation and processing logic
        const sceneData = await getSceneData();
        if (!sceneData) {
            console.error('STMemoryBooks: No scene selected for memory initiation');
toastr.error(t('STMemoryBooks_NoSceneSelected', 'No scene selected'), 'STMemoryBooks');
            isProcessingMemory = false;
            return;
        }
        
        const lorebookValidation = await validateLorebook();
        if (!lorebookValidation.valid) {
            console.error('STMemoryBooks: Lorebook validation failed:', lorebookValidation.error);
toastr.error(t('STMemoryBooks_LorebookValidationError', lorebookValidation.error), 'STMemoryBooks');
            isProcessingMemory = false;
            return;
        }
        
        const allMemories = identifyMemoryEntries(lorebookValidation.data);
        const newStart = sceneData.sceneStart;
        const newEnd = sceneData.sceneEnd;

        if (!settings.moduleSettings.allowSceneOverlap) {
            for (const mem of allMemories) {
                const existingRange = getRangeFromMemoryEntry(mem.entry); 

                if (existingRange && existingRange.start !== null && existingRange.end !== null) {
                    const s = Number(existingRange.start);
                    const e = Number(existingRange.end);
                    const ns = Number(newStart);
                    const ne = Number(newEnd);
                    // Detailed overlap diagnostics
                    console.debug(`STMemoryBooks: OverlapCheck new=[${ns}-${ne}] existing="${mem.title}" [${s}-${e}] cond1(ns<=e)=${ns <= e} cond2(ne>=s)=${ne >= s}`);
                    if (ns <= e && ne >= s) {
                        console.error(`STMemoryBooks: Scene overlap detected with memory: ${mem.title} [${s}-${e}] vs new [${ns}-${ne}]`);
toastr.error(t('STMemoryBooks_SceneOverlap', `Scene overlaps with existing memory: "${mem.title}" (messages ${s}-${e})`), 'STMemoryBooks');
                        isProcessingMemory = false;
                        return;
                    }
                }
            }
        }
        
        const effectiveSettings = await showAndGetMemorySettings(sceneData, lorebookValidation, selectedProfileIndex);
        if (!effectiveSettings) {
            isProcessingMemory = false;
            return; // User cancelled
        }
        
        // Close settings popup if open
        if (currentPopupInstance) {
            currentPopupInstance.completeCancelled();
            currentPopupInstance = null;
        }
        
        // Execute the main process with retry logic
        await executeMemoryGeneration(sceneData, lorebookValidation, effectiveSettings);
        
    } catch (error) {
        console.error('STMemoryBooks: Critical error during memory initiation:', error);
        toastr.error(t('STMemoryBooks_UnexpectedError', `An unexpected error occurred: ${error.message}`), 'STMemoryBooks');
    } finally {
        // ALWAYS reset the flag, no matter how we exit
        isProcessingMemory = false;
    }
}

/**
 * Helper function to convert old boolean auto-hide settings to new dropdown format
 */
function getAutoHideMode(moduleSettings) {
    // Handle new format
    if (moduleSettings.autoHideMode) {
        return moduleSettings.autoHideMode;
    }
    
    // Convert from old boolean format for backward compatibility
    if (moduleSettings.autoHideAllMessages) {
        return 'all';
    } else if (moduleSettings.autoHideLastMemory) {
        return 'last';
    } else {
        return 'none';
    }
}

/**
 * Update lorebook status display in settings popup
 */
function updateLorebookStatusDisplay() {
    const settings = extension_settings.STMemoryBooks;
    if (!settings) return;

    const stmbData = getSceneMarkers() || {};
    const isManualMode = settings.moduleSettings.manualModeEnabled;

    // Update mode badge
    const modeBadge = document.querySelector('#stmb-mode-badge');
    if (modeBadge) {
        modeBadge.textContent = isManualMode ? t('STMemoryBooks_Manual', 'Manual') : t('STMemoryBooks_AutomaticChatBound', 'Automatic (Chat-bound)');
    }

    // Update active lorebook display
    const activeLorebookSpan = document.querySelector('#stmb-active-lorebook');
    if (activeLorebookSpan) {
        const currentLorebook = isManualMode ?
            stmbData.manualLorebook :
            chat_metadata?.[METADATA_KEY];

        activeLorebookSpan.textContent = currentLorebook || t('STMemoryBooks_NoneSelected', 'None selected');
        activeLorebookSpan.className = currentLorebook ? '' : 'opacity50p';
    }

    // Manual lorebook buttons are now handled by populateInlineButtons()

    // Show/hide manual controls and automatic info sections based on mode
    const manualControls = document.querySelector('#stmb-manual-controls');
    if (manualControls) {
        manualControls.style.display = isManualMode ? 'block' : 'none';
    }

    const automaticInfo = document.querySelector('#stmb-automatic-info');
    if (automaticInfo) {
        automaticInfo.style.display = isManualMode ? 'none' : 'block';

        // Update automatic mode info text
        const infoText = automaticInfo.querySelector('small');
        if (infoText) {
            const chatBoundLorebook = chat_metadata?.[METADATA_KEY];
            infoText.innerHTML = chatBoundLorebook ?
                t('STMemoryBooks_UsingChatBoundLorebook', `Using chat-bound lorebook "<strong>${chatBoundLorebook}</strong>"`, { lorebookName: chatBoundLorebook }) :
                t('STMemoryBooks_NoChatBoundLorebook', 'No chat-bound lorebook. Memories will require lorebook selection.');
        }
    }

    // Mutual exclusion: Enable/disable checkboxes based on each other's state
    const autoCreateCheckbox = document.querySelector('#stmb-auto-create-lorebook');
    const manualModeCheckbox = document.querySelector('#stmb-manual-mode-enabled');
    const nameTemplateInput = document.querySelector('#stmb-lorebook-name-template');

    if (autoCreateCheckbox && manualModeCheckbox) {
        const autoCreateEnabled = settings.moduleSettings.autoCreateLorebook;

        // Manual mode disables auto-create and vice versa
        autoCreateCheckbox.disabled = isManualMode;
        manualModeCheckbox.disabled = autoCreateEnabled;

        // Name template is only enabled when auto-create is enabled
        if (nameTemplateInput) {
            nameTemplateInput.disabled = !autoCreateEnabled;
        }
    }

    // Manual lorebook button visibility is now handled by populateInlineButtons()
}

/**
 * Populate inline button containers with dynamic buttons (profile and manual lorebook buttons)
 */
function populateInlineButtons() {
    if (!currentPopupInstance?.dlg) return;

    const settings = initializeSettings();
    const stmbData = getSceneMarkers() || {};

    // Get all button containers
    const manualLorebookContainer = currentPopupInstance.content.querySelector('#stmb-manual-lorebook-buttons');
    const profileButtonsContainer = currentPopupInstance.content.querySelector('#stmb-profile-buttons');
    const extraFunctionContainer = currentPopupInstance.content.querySelector('#stmb-extra-function-buttons');

    // Populate manual lorebook buttons if container exists and manual mode is enabled
    if (manualLorebookContainer && settings.moduleSettings.manualModeEnabled) {
        const hasManualLorebook = stmbData.manualLorebook ?? null;

const manualLorebookButtons = [
            {
                text: `📕 ${hasManualLorebook ? t('STMemoryBooks_ChangeManualLorebook', 'Change') : t('STMemoryBooks_SelectManualLorebook', 'Select')} ` + t('STMemoryBooks_ManualLorebook', 'Manual Lorebook'),
                id: 'stmb-select-manual-lorebook',
                action: async () => {
                    try {
                        // Use the dedicated selection popup that always shows options
                        const selectedLorebook = await showLorebookSelectionPopup(hasManualLorebook ? stmbData.manualLorebook : null);
                        if (selectedLorebook) {
                            // Refresh the popup content to reflect the new selection
                            refreshPopupContent();
                        }
                    } catch (error) {
                        console.error('STMemoryBooks: Error selecting manual lorebook:', error);
toastr.error(t('STMemoryBooks_FailedToSelectManualLorebook', 'Failed to select manual lorebook'), 'STMemoryBooks');
                    }
                }
            }
        ];

        // Add clear button if manual lorebook is set
        if (hasManualLorebook) {
            manualLorebookButtons.push({
                text: '❌ ' + t('STMemoryBooks_ClearManualLorebook', 'Clear Manual Lorebook'),
                id: 'stmb-clear-manual-lorebook',
                action: () => {
                    try {
                        const stmbData = getSceneMarkers() || {};
                        delete stmbData.manualLorebook;
                        saveMetadataForCurrentContext();

                        // Refresh the popup content
                        refreshPopupContent();
                        toastr.success(t('STMemoryBooks_ManualLorebookCleared', 'Manual lorebook cleared'), 'STMemoryBooks');
                    } catch (error) {
                        console.error('STMemoryBooks: Error clearing manual lorebook:', error);
                        toastr.error(t('STMemoryBooks_FailedToClearManualLorebook', 'Failed to clear manual lorebook'), 'STMemoryBooks');
                    }
                }
            });
        }

        // Clear container and populate with buttons
        manualLorebookContainer.innerHTML = '';
        manualLorebookButtons.forEach(buttonConfig => {
            const button = document.createElement('div');
            button.className = 'menu_button interactable';
            button.id = buttonConfig.id;
            button.textContent = buttonConfig.text;
            button.addEventListener('click', buttonConfig.action);
            manualLorebookContainer.appendChild(button);
        });
    }

    if (!profileButtonsContainer || !extraFunctionContainer) return;

    // Create profile action buttons
    const profileButtons = [
        {
            text: '⭐ ' + t('STMemoryBooks_SetAsDefault', 'Set as Default'),
            id: 'stmb-set-default-profile',
            action: () => {
                const profileSelect = currentPopupInstance?.dlg?.querySelector('#stmb-profile-select');
                if (!profileSelect) return;

                const selectedIndex = parseInt(profileSelect.value);
                if (selectedIndex === settings.defaultProfile) {
                    return;
                }

                settings.defaultProfile = selectedIndex;
                saveSettingsDebounced();
                const displayName = (settings.profiles[selectedIndex]?.connection?.api === 'current_st')
                    ? t('STMemoryBooks_Profile_CurrentST', 'Current SillyTavern Settings')
                    : settings.profiles[selectedIndex].name;
                toastr.success(t('STMemoryBooks_SetAsDefaultProfileSuccess', `"${displayName}" is now the default profile.`), 'STMemoryBooks');
                refreshPopupContent();
            }
        },
        {
            text: '✏️ ' + t('STMemoryBooks_EditProfile', 'Edit Profile'),
            id: 'stmb-edit-profile',
            action: async () => {
                try {
                    const profileSelect = currentPopupInstance?.dlg?.querySelector('#stmb-profile-select');
                    if (!profileSelect) return;

                    const selectedIndex = parseInt(profileSelect.value);
                    const selectedProfile = settings.profiles[selectedIndex];

                    // Migrate legacy dynamic flag to provider-based current_st and allow editing of non-connection fields
                    if (selectedProfile.useDynamicSTSettings) {
                        selectedProfile.connection = selectedProfile.connection || {};
                        selectedProfile.connection.api = 'current_st';
                        delete selectedProfile.useDynamicSTSettings;
                        saveSettingsDebounced();
                    }

                    await editProfile(settings, selectedIndex, refreshPopupContent);
                } catch (error) {
                    console.error(`${MODULE_NAME}: Error in edit profile:`, error);
                    toastr.error(t('STMemoryBooks_FailedToEditProfile', 'Failed to edit profile'), 'STMemoryBooks');
                }
            }
        },
        {
            text: '➕ ' + t('STMemoryBooks_NewProfile', 'New Profile'),
            id: 'stmb-new-profile',
            action: async () => {
                try {
                    await newProfile(settings, refreshPopupContent);
                } catch (error) {
                    console.error(`${MODULE_NAME}: Error in new profile:`, error);
                    toastr.error(t('STMemoryBooks_FailedToCreateProfile', 'Failed to create profile'), 'STMemoryBooks');
                }
            }
        },
        {
            text: '🗑️ ' + t('STMemoryBooks_DeleteProfile', 'Delete Profile'),
            id: 'stmb-delete-profile',
            action: async () => {
                try {
                    const profileSelect = currentPopupInstance?.dlg?.querySelector('#stmb-profile-select');
                    if (!profileSelect) return;

                    const selectedIndex = parseInt(profileSelect.value);
                    await deleteProfile(settings, selectedIndex, refreshPopupContent);
                } catch (error) {
                    console.error(`${MODULE_NAME}: Error in delete profile:`, error);
                    toastr.error(t('STMemoryBooks_FailedToDeleteProfile', 'Failed to delete profile'), 'STMemoryBooks');
                }
            }
        }
    ];

    // Create additional function buttons
    const extraFunctionButtons = [
        {
            text: '📤 ' + t('STMemoryBooks_ExportProfiles', 'Export Profiles'),
            id: 'stmb-export-profiles',
            action: () => {
                try {
                    exportProfiles(settings);
                } catch (error) {
                    console.error(`${MODULE_NAME}: Error in export profiles:`, error);
                    toastr.error(t('STMemoryBooks_FailedToExportProfiles', 'Failed to export profiles'), 'STMemoryBooks');
                }
            }
        },
        {
            text: '📥 ' + t('STMemoryBooks_ImportProfiles', 'Import Profiles'),
            id: 'stmb-import-profiles',
            action: () => {
                const importFile = currentPopupInstance?.dlg?.querySelector('#stmb-import-file');
                if (importFile) {
                    importFile.click();
                }
            }
        },
        {       
            text: '🧩 ' + t('STMemoryBooks_SummaryPromptManager', 'Summary Prompt Manager'),
            id: 'stmb-prompt-manager',
            action: async () => {
                try {
                    await showPromptManagerPopup();
                } catch (error) {
                    console.error(`${MODULE_NAME}: Error opening prompt manager:`, error);
toastr.error(t('STMemoryBooks_FailedToOpenSummaryPromptManager', 'Failed to open Summary Prompt Manager'), 'STMemoryBooks');
                }
            }
        },
        {
            text: '🎡 ' + t('STMemoryBooks_SidePrompts', 'Side Prompts'),
            id: 'stmb-side-prompts',
            action: async () => {
                try {
                    await showSidePromptsPopup();
                } catch (error) {
                    console.error(`${MODULE_NAME}: Error opening Side Prompts:`, error);
toastr.error(t('STMemoryBooks_FailedToOpenSidePrompts', 'Failed to open Side Prompts'), 'STMemoryBooks');
                }
            }
        }
    ];

    // Clear containers and populate with buttons
    profileButtonsContainer.innerHTML = '';
    extraFunctionContainer.innerHTML = '';

    // Add profile action buttons
    profileButtons.forEach(buttonConfig => {
        const button = document.createElement('div');
        button.className = 'menu_button interactable';
        button.id = buttonConfig.id;
        button.textContent = buttonConfig.text;
        button.addEventListener('click', buttonConfig.action);
        profileButtonsContainer.appendChild(button);
    });

    // Add Extra Function Buttons buttons
    extraFunctionButtons.forEach(buttonConfig => {
        const button = document.createElement('div');
        button.className = 'menu_button interactable';
        button.id = buttonConfig.id;
        button.textContent = buttonConfig.text;
        button.addEventListener('click', buttonConfig.action);
        extraFunctionContainer.appendChild(button);
    });
}

/**
 * Show the Summary Prompt Manager popup
 */
async function showPromptManagerPopup() {
    try {
        // Initialize the prompt manager on first use
        const settings = extension_settings.STMemoryBooks;
        await PromptManager.firstRunInitIfMissing(settings);
        
        // Get list of presets
        const presets = await PromptManager.listPresets();
        
        // Build the popup content
        let content = '<h3 data-i18n="STMemoryBooks_PromptManager_Title">🧩 Summary Prompt Manager</h3>';
        content += '<div class="world_entry_form_control">';
        content += '<p data-i18n="STMemoryBooks_PromptManager_Desc">Manage your summary generation prompts. All presets are editable.</p>';
        content += '</div>';
        
        // Search/filter box
        content += '<div class="world_entry_form_control">';
        content += '<input type="text" id="stmb-prompt-search" class="text_pole" placeholder="Search presets..." aria-label="Search presets" data-i18n="[placeholder]STMemoryBooks_PromptManager_Search;[aria-label]STMemoryBooks_PromptManager_Search" />';
        content += '</div>';
        
        // Preset list container (table content rendered via Handlebars after popup creation)
        content += '<div id="stmb-preset-list" class="padding10 marginBot10" style="max-height: 400px; overflow-y: auto;"></div>';
        
        // Action buttons
        content += '<div class="flex-container marginTop10" style="justify-content: center; gap: 10px;">';
        content += '<button id="stmb-pm-new" class="menu_button" data-i18n="STMemoryBooks_PromptManager_New">➕ New Preset</button>';
        content += '<button id="stmb-pm-export" class="menu_button" data-i18n="STMemoryBooks_PromptManager_Export">📤 Export JSON</button>';
        content += '<button id="stmb-pm-import" class="menu_button" data-i18n="STMemoryBooks_PromptManager_Import">📥 Import JSON</button>';
        content += '<button id="stmb-pm-apply" class="menu_button" disabled data-i18n="STMemoryBooks_PromptManager_ApplyToProfile">✅ Apply to Selected Profile</button>';
        content += '</div>';
        
        // Hint re: prompting
        content += `<small>${t('STMemoryBooks_PromptManager_Hint', '💡 When creating a new prompt, copy one of the other built-in prompts and then amend it. Don\'t change the "respond with JSON" instructions, 📕Memory Books uses that to process the returned result from the AI.')}</small>`;

        // Hidden file input for import
        content += '<input type="file" id="stmb-pm-import-file" accept=".json" style="display: none;" />';
        
        const popup = new Popup(content, POPUP_TYPE.TEXT, '', {
            wide: true,
            large: true,
            allowVerticalScrolling: true,
            okButton: false,
            cancelButton: t('STMemoryBooks_Close', 'Close')
        });

        // Attach handlers before showing the popup to ensure interactivity
        setupPromptManagerEventHandlers(popup);

        // Initial render of presets table using Handlebars
        const listEl = popup.dlg?.querySelector('#stmb-preset-list');
        if (listEl) {
            const items = (presets || []).map(p => ({
                key: String(p.key || ''),
                displayName: String(p.displayName || ''),
            }));
            listEl.innerHTML = DOMPurify.sanitize(summaryPromptsTableTemplate({ items }));
        }

        await popup.show();

    } catch (error) {
        console.error('STMemoryBooks: Error showing prompt manager:', error);
        toastr.error(t('STMemoryBooks_FailedToOpenSummaryPromptManager', 'Failed to open Summary Prompt Manager'), 'STMemoryBooks');
    }
}

/**
 * Setup event handlers for the prompt manager popup
 */

function setupPromptManagerEventHandlers(popup) {
    const dlg = popup.dlg;
    let selectedPresetKey = null;
    
    // Row selection and inline actions
    dlg.addEventListener('click', async (e) => {
        // Handle inline action icon buttons first
        const actionBtn = e.target.closest('.stmb-action');
        if (actionBtn) {
            e.preventDefault();
            e.stopPropagation();
            const row = actionBtn.closest('tr[data-preset-key]');
            const key = row?.dataset.presetKey;
            if (!key) return;

            // Keep row visually selected using ST theme colors
            dlg.querySelectorAll('tr[data-preset-key]').forEach(r => {
                r.classList.remove('ui-state-active');
                r.style.backgroundColor = '';
                r.style.border = '';
            });
            if (row) {
                row.style.backgroundColor = 'var(--cobalt30a)';
                row.style.border = '';
                selectedPresetKey = key;
            }
            const applyBtn = dlg.querySelector('#stmb-pm-apply');
            if (applyBtn) applyBtn.disabled = false;

            if (actionBtn.classList.contains('stmb-action-edit')) {
                await editPreset(popup, key);
            } else if (actionBtn.classList.contains('stmb-action-duplicate')) {
                await duplicatePreset(popup, key);
            } else if (actionBtn.classList.contains('stmb-action-delete')) {
                await deletePreset(popup, key);
            }
            return;
        }

        // Handle row selection
        const row = e.target.closest('tr[data-preset-key]');
        if (row) {
            dlg.querySelectorAll('tr[data-preset-key]').forEach(r => {
                r.classList.remove('ui-state-active');
                r.style.backgroundColor = '';
                r.style.border = '';
            });
            
            row.style.backgroundColor = 'var(--cobalt30a)';
            row.style.border = '';
            selectedPresetKey = row.dataset.presetKey;

            const applyBtn = dlg.querySelector('#stmb-pm-apply');
            if (applyBtn) applyBtn.disabled = false;
        }
    });
    
    // Search functionality
    const searchInput = dlg.querySelector('#stmb-prompt-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            dlg.querySelectorAll('tr[data-preset-key]').forEach(row => {
                const displayName = row.querySelector('td:first-child').textContent.toLowerCase();
                row.style.display = displayName.includes(searchTerm) ? '' : 'none';
            });
        });
    }
    
    // Button handlers
    dlg.querySelector('#stmb-pm-new')?.addEventListener('click', async () => {
        await createNewPreset(popup);
    });
    
    dlg.querySelector('#stmb-pm-edit')?.addEventListener('click', async () => {
        if (selectedPresetKey) {
            await editPreset(popup, selectedPresetKey);
        }
    });
    
    dlg.querySelector('#stmb-pm-duplicate')?.addEventListener('click', async () => {
        if (selectedPresetKey) {
            await duplicatePreset(popup, selectedPresetKey);
        }
    });
    
    dlg.querySelector('#stmb-pm-delete')?.addEventListener('click', async () => {
        if (selectedPresetKey) {
            await deletePreset(popup, selectedPresetKey);
        }
    });
    
    dlg.querySelector('#stmb-pm-export')?.addEventListener('click', async () => {
        await exportPrompts();
    });
    
    dlg.querySelector('#stmb-pm-import')?.addEventListener('click', () => {
        dlg.querySelector('#stmb-pm-import-file')?.click();
    });
    
    dlg.querySelector('#stmb-pm-import-file')?.addEventListener('change', async (e) => {
        await importPrompts(e, popup);
    });

    // Apply selected preset to current profile
    dlg.querySelector('#stmb-pm-apply')?.addEventListener('click', async () => {
        if (!selectedPresetKey) {
            toastr.error(t('STMemoryBooks_SelectPresetFirst', 'Select a preset first'), 'STMemoryBooks');
            return;
        }
        const settings = extension_settings?.STMemoryBooks;
        if (!settings || !Array.isArray(settings.profiles) || settings.profiles.length === 0) {
            toastr.error(t('STMemoryBooks_NoProfilesAvailable', 'No profiles available'), 'STMemoryBooks');
            return;
        }

        // Determine selected profile index from the main settings popup if available
        let selectedIndex = settings.defaultProfile || 0;
        if (currentPopupInstance?.dlg) {
            const profileSelect = currentPopupInstance.dlg.querySelector('#stmb-profile-select');
            if (profileSelect) {
                const parsed = parseInt(profileSelect.value);
                if (!isNaN(parsed)) selectedIndex = parsed;
            }
        }

        const prof = settings.profiles[selectedIndex];
        if (!prof) {
            toastr.error(t('STMemoryBooks_SelectedProfileNotFound', 'Selected profile not found'), 'STMemoryBooks');
            return;
        }

        // If the profile has a custom prompt, ask to clear it so the preset takes effect
        if (prof.prompt && prof.prompt.trim()) {
            const confirmPopup = new Popup(
                `<h3 data-i18n="STMemoryBooks_ClearCustomPromptTitle">Clear Custom Prompt?</h3><p data-i18n="STMemoryBooks_ClearCustomPromptDesc">This profile has a custom prompt. Clear it so the selected preset is used?</p>`,
                POPUP_TYPE.CONFIRM,
                '',
                { okButton: t('STMemoryBooks_ClearAndApply', 'Clear and Apply'), cancelButton: t('STMemoryBooks_Cancel', 'Cancel') }
            );
            const res = await confirmPopup.show();
            if (res === POPUP_RESULT.AFFIRMATIVE) {
                prof.prompt = '';
            } else {
                return;
            }
        }

        // Apply preset and save
        prof.preset = selectedPresetKey;
        saveSettingsDebounced();
        toastr.success(t('STMemoryBooks_PresetAppliedToProfile', 'Preset applied to profile'), 'STMemoryBooks');

        // Refresh main settings popup if open
        if (currentPopupInstance?.dlg) {
            try { refreshPopupContent(); } catch (e) { /* noop */ }
        }
    });
}

/**
 * Create a new preset
 */
async function createNewPreset(popup) {
    const content = `
        <h3 data-i18n="STMemoryBooks_CreateNewPresetTitle">Create New Preset</h3>
        <div class="world_entry_form_control">
            <label for="stmb-pm-new-display-name">
                <h4 data-i18n="STMemoryBooks_DisplayNameTitle">Display Name:</h4>
                <input type="text" id="stmb-pm-new-display-name" class="text_pole" data-i18n="[placeholder]STMemoryBooks_MyCustomPreset" placeholder="My Custom Preset" />
            </label>
        </div>
        <div class="world_entry_form_control">
            <label for="stmb-pm-new-prompt">
                <h4 data-i18n="STMemoryBooks_PromptTitle">Prompt:</h4>
                <i class="editor_maximize fa-solid fa-maximize right_menu_button" data-for="stmb-pm-new-prompt" title="Expand the editor" data-i18n="[title]STMemoryBooks_ExpandEditor"></i>
                <textarea id="stmb-pm-new-prompt" class="text_pole textarea_compact" rows="10" data-i18n="[placeholder]STMemoryBooks_EnterPromptPlaceholder" placeholder="Enter your prompt here..."></textarea>
            </label>
        </div>
    `;
    
    const editPopup = new Popup(content, POPUP_TYPE.TEXT, '', {
        okButton: t('STMemoryBooks_Create', 'Create'),
        cancelButton: t('STMemoryBooks_Cancel', 'Cancel')
    });
    
    const result = await editPopup.show();
    
    if (result === POPUP_RESULT.AFFIRMATIVE) {
        const displayName = editPopup.dlg.querySelector('#stmb-pm-new-display-name').value.trim();
        const prompt = editPopup.dlg.querySelector('#stmb-pm-new-prompt').value.trim();
        
        if (!prompt) {
            toastr.error(t('STMemoryBooks_PromptCannotBeEmpty', 'Prompt cannot be empty'), 'STMemoryBooks');
            return;
        }
        
        try {
            await PromptManager.upsertPreset(null, prompt, displayName || null);
            toastr.success(t('STMemoryBooks_PresetCreatedSuccessfully', 'Preset created successfully'), 'STMemoryBooks');
            // Notify other UIs about preset changes
            window.dispatchEvent(new CustomEvent('stmb-presets-updated'));
            
            // Refresh the manager popup
            popup.completeAffirmative();
            await showPromptManagerPopup();
        } catch (error) {
            console.error('STMemoryBooks: Error creating preset:', error);
            toastr.error(t('STMemoryBooks_FailedToCreatePreset', 'Failed to create preset'), 'STMemoryBooks');
        }
    }
}

/**
 * Edit an existing preset
 */
async function editPreset(popup, presetKey) {
    try {
        const displayName = await PromptManager.getDisplayName(presetKey);
        const prompt = await PromptManager.getPrompt(presetKey);
        
        const content = `
            <h3 data-i18n="STMemoryBooks_EditPresetTitle">Edit Preset</h3>
            <div class="world_entry_form_control">
                <label for="stmb-pm-edit-display-name">
                    <h4 data-i18n="STMemoryBooks_DisplayNameTitle">Display Name:</h4>
                    <input type="text" id="stmb-pm-edit-display-name" class="text_pole" value="${escapeHtml(displayName)}" />
                </label>
            </div>
            <div class="world_entry_form_control">
                <label for="stmb-pm-edit-prompt">
                    <h4 data-i18n="STMemoryBooks_PromptTitle">Prompt:</h4>
                    <i class="editor_maximize fa-solid fa-maximize right_menu_button" data-for="stmb-pm-edit-prompt" title="Expand the editor" data-i18n="[title]STMemoryBooks_ExpandEditor"></i>
                    <textarea id="stmb-pm-edit-prompt" class="text_pole textarea_compact" rows="10">${escapeHtml(prompt)}</textarea>
                </label>
            </div>
        `;
        
        const editPopup = new Popup(content, POPUP_TYPE.TEXT, '', {
            okButton: t('STMemoryBooks_Save', 'Save'),
            cancelButton: t('STMemoryBooks_Cancel', 'Cancel')
        });
        
        const result = await editPopup.show();
        
        if (result === POPUP_RESULT.AFFIRMATIVE) {
            const newDisplayName = editPopup.dlg.querySelector('#stmb-pm-edit-display-name').value.trim();
            const newPrompt = editPopup.dlg.querySelector('#stmb-pm-edit-prompt').value.trim();
            
            if (!newPrompt) {
                toastr.error(t('STMemoryBooks_PromptCannotBeEmpty', 'Prompt cannot be empty'), 'STMemoryBooks');
                return;
            }
            
            await PromptManager.upsertPreset(presetKey, newPrompt, newDisplayName || null);
            toastr.success(t('STMemoryBooks_PresetUpdatedSuccessfully', 'Preset updated successfully'), 'STMemoryBooks');
            // Notify other UIs about preset changes
            window.dispatchEvent(new CustomEvent('stmb-presets-updated'));
            
            // Refresh the manager popup
            popup.completeAffirmative();
            await showPromptManagerPopup();
        }
    } catch (error) {
        console.error('STMemoryBooks: Error editing preset:', error);
        toastr.error(t('STMemoryBooks_FailedToEditPreset', 'Failed to edit preset'), 'STMemoryBooks');
    }
}

/**
 * Duplicate a preset
 */
async function duplicatePreset(popup, presetKey) {
    try {
        const newKey = await PromptManager.duplicatePreset(presetKey);
        toastr.success(t('STMemoryBooks_PresetDuplicatedSuccessfully', 'Preset duplicated successfully'), 'STMemoryBooks');
        // Notify other UIs about preset changes
        window.dispatchEvent(new CustomEvent('stmb-presets-updated'));
        
        // Refresh the manager popup
        popup.completeAffirmative();
        await showPromptManagerPopup();
    } catch (error) {
        console.error('STMemoryBooks: Error duplicating preset:', error);
        toastr.error(t('STMemoryBooks_FailedToDuplicatePreset', 'Failed to duplicate preset'), 'STMemoryBooks');
    }
}

/**
 * Delete a preset
 */
async function deletePreset(popup, presetKey) {
    const displayName = await PromptManager.getDisplayName(presetKey);
    
    const confirmPopup = new Popup(
        `<h3 data-i18n="STMemoryBooks_DeletePresetTitle">Delete Preset</h3><p data-i18n="STMemoryBooks_DeletePresetConfirm" data-i18n-params='{"name": "${escapeHtml(displayName)}"}'>Are you sure you want to delete "${escapeHtml(displayName)}"?</p>`,
        POPUP_TYPE.CONFIRM,
        '',
        { okButton: t('STMemoryBooks_Delete', 'Delete'), cancelButton: t('STMemoryBooks_Cancel', 'Cancel') }
    );
    
    const result = await confirmPopup.show();
    
    if (result === POPUP_RESULT.AFFIRMATIVE) {
        try {
            await PromptManager.removePreset(presetKey);
            toastr.success(t('STMemoryBooks_PresetDeletedSuccessfully', 'Preset deleted successfully'), 'STMemoryBooks');
            // Notify other UIs about preset changes
            window.dispatchEvent(new CustomEvent('stmb-presets-updated'));
            
            // Refresh the manager popup
            popup.completeAffirmative();
            await showPromptManagerPopup();
        } catch (error) {
            console.error('STMemoryBooks: Error deleting preset:', error);
            toastr.error(t('STMemoryBooks_FailedToDeletePreset', 'Failed to delete preset'), 'STMemoryBooks');
        }
    }
}

/**
 * Export prompts to JSON
 */
async function exportPrompts() {
    try {
        const json = await PromptManager.exportToJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'stmb-summary-prompts.json';
        a.click();
        URL.revokeObjectURL(url);
        toastr.success(t('STMemoryBooks_PromptsExportedSuccessfully', 'Prompts exported successfully'), 'STMemoryBooks');
    } catch (error) {
        console.error('STMemoryBooks: Error exporting prompts:', error);
        toastr.error(t('STMemoryBooks_FailedToExportPrompts', 'Failed to export prompts'), 'STMemoryBooks');
    }
}

/**
 * Import prompts from JSON
 */
async function importPrompts(event, popup) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        const text = await file.text();
        await PromptManager.importFromJSON(text);
        toastr.success(t('STMemoryBooks_PromptsImportedSuccessfully', 'Prompts imported successfully'), 'STMemoryBooks');
        // Notify other UIs about preset changes
        window.dispatchEvent(new CustomEvent('stmb-presets-updated'));
        
        // Refresh the manager popup
        popup.completeAffirmative();
        await showPromptManagerPopup();
    } catch (error) {
        console.error('STMemoryBooks: Error importing prompts:', error);
        toastr.error(t('STMemoryBooks_FailedToImportPrompts', `Failed to import prompts: ${error.message}`), 'STMemoryBooks');
    }
}

/**
 * Show main settings popup
 */
async function showSettingsPopup() {
    const settings = initializeSettings();
    await PromptManager.firstRunInitIfMissing(settings);
    const sceneData = await getSceneData();
    const selectedProfile = settings.profiles[settings.defaultProfile];
    const sceneMarkers = getSceneMarkers();

    // Get current lorebook information
    const isManualMode = settings.moduleSettings.manualModeEnabled;
    const chatBoundLorebook = chat_metadata?.[METADATA_KEY] || null;
    const manualLorebook = sceneMarkers?.manualLorebook || null;

    const templateData = {
        hasScene: !!sceneData,
        sceneData: sceneData,
        highestMemoryProcessed: sceneMarkers?.highestMemoryProcessed,
        alwaysUseDefault: settings.moduleSettings.alwaysUseDefault,
        showMemoryPreviews: settings.moduleSettings.showMemoryPreviews,
        showNotifications: settings.moduleSettings.showNotifications,
        unhideBeforeMemory: settings.moduleSettings.unhideBeforeMemory || false,
        refreshEditor: settings.moduleSettings.refreshEditor,
        allowSceneOverlap: settings.moduleSettings.allowSceneOverlap,
        manualModeEnabled: settings.moduleSettings.manualModeEnabled,

        // Lorebook status information
        lorebookMode: isManualMode ? 'Manual' : 'Automatic (Chat-bound)',
        currentLorebookName: isManualMode ? manualLorebook : chatBoundLorebook,
        manualLorebookName: manualLorebook,
        chatBoundLorebookName: chatBoundLorebook,
        availableLorebooks: world_names || [],
        autoHideMode: getAutoHideMode(settings.moduleSettings),
        unhiddenEntriesCount: settings.moduleSettings.unhiddenEntriesCount || 0,
        tokenWarningThreshold: settings.moduleSettings.tokenWarningThreshold || 30000,
        defaultMemoryCount: settings.moduleSettings.defaultMemoryCount || 0,
        autoSummaryEnabled: settings.moduleSettings.autoSummaryEnabled || false,
        autoSummaryInterval: settings.moduleSettings.autoSummaryInterval || 50,
        autoCreateLorebook: settings.moduleSettings.autoCreateLorebook || false,
        lorebookNameTemplate: settings.moduleSettings.lorebookNameTemplate || 'LTM - {{char}} - {{chat}}',
        profiles: settings.profiles.map((profile, index) => ({
            ...profile,
            name: (profile?.connection?.api === 'current_st') ? t('STMemoryBooks_Profile_CurrentST', 'Current SillyTavern Settings') : profile.name,
            isDefault: index === settings.defaultProfile
        })),
        titleFormat: settings.titleFormat,
        titleFormats: getDefaultTitleFormats().map(format => ({
            value: format,
            isSelected: format === settings.titleFormat
        })),
        showCustomInput: !getDefaultTitleFormats().includes(settings.titleFormat),
            selectedProfile: {
                ...selectedProfile,
                connection: (selectedProfile.useDynamicSTSettings || (selectedProfile?.connection?.api === 'current_st')) ?
                (() => {
                    const currentApiInfo = getCurrentApiInfo();
                    const currentSettings = getUIModelSettings();
                    return {
                        api: currentApiInfo.completionSource || 'openai',
                        model: currentSettings.model || 'Not Set',
                        temperature: currentSettings.temperature || 0.7
                    };
                })() : {
                    api: selectedProfile.connection?.api || 'openai',
                    model: selectedProfile.connection?.model || 'Not Set',
                    temperature: selectedProfile.connection?.temperature !== undefined ? selectedProfile.connection.temperature : 0.7
                },
            titleFormat: (selectedProfile.titleFormat || settings.titleFormat),
            effectivePrompt: (selectedProfile.prompt && selectedProfile.prompt.trim() ? selectedProfile.prompt : (selectedProfile.preset ? await PromptManager.getPrompt(selectedProfile.preset) : DEFAULT_PROMPT))
        }
    };

    const content = DOMPurify.sanitize(settingsTemplate(templateData));
    
    // Build customButtons array dynamically based on current state
const customButtons = [
        {
            text: '🧠 ' + t('STMemoryBooks_CreateMemoryButton', 'Create Memory'),
            result: null,
            classes: ['menu_button', 'interactable'],
            action: async () => {
                if (!sceneData) {
                    toastr.error(t('STMemoryBooks_NoSceneSelectedMakeSure', 'No scene selected. Make sure both start and end points are set.'), 'STMemoryBooks');
                    return;
                }

                // Capture the currently selected profile before proceeding
                let selectedProfileIndex = settings.defaultProfile;
                if (currentPopupInstance && currentPopupInstance.dlg) {
                    const profileSelect = currentPopupInstance.dlg.querySelector('#stmb-profile-select');
                    if (profileSelect) {
                        selectedProfileIndex = parseInt(profileSelect.value) || settings.defaultProfile;
                        console.log(`STMemoryBooks: Using profile index ${selectedProfileIndex} (${settings.profiles[selectedProfileIndex]?.name}) from main popup selection`);
                    }
                }

                await initiateMemoryCreation(selectedProfileIndex);
            }
        },
{
            text: '🗑️ ' + t('STMemoryBooks_ClearSceneButton', 'Clear Scene'),
            result: null,
            classes: ['menu_button', 'interactable'],
            action: () => {
                clearScene();
                refreshPopupContent();
            }
        }
    ];

    // Manual lorebook and profile buttons will be populated after popup creation
    
    const popupOptions = {
        wide: true,
        large: true,
        allowVerticalScrolling: true,
        customButtons: customButtons,
        cancelButton: t('STMemoryBooks_Close', 'Close'),
        okButton: false,
        onClose: handleSettingsPopupClose
    };
    
    try {
        currentPopupInstance = new Popup(content, POPUP_TYPE.TEXT, '', popupOptions);
        setupSettingsEventListeners();
        populateInlineButtons();
        await currentPopupInstance.show();
    } catch (error) {
        console.error('STMemoryBooks: Error showing settings popup:', error);
        currentPopupInstance = null;
    }
}

/**
 * Setup event listeners for settings popup using full event delegation
 */
function setupSettingsEventListeners() {
    if (!currentPopupInstance) return;
    
    const popupElement = currentPopupInstance.dlg;
    
    // Use full event delegation for all interactions
    popupElement.addEventListener('click', async (e) => {
        const settings = initializeSettings();
        
        // Note: Manual lorebook and profile management buttons are now handled via customButtons
    });
    
    // Handle change events using delegation
    popupElement.addEventListener('change', async (e) => {
        const settings = initializeSettings();
        
        if (e.target.matches('#stmb-import-file')) {
            try {
                importProfiles(e, settings, refreshPopupContent);
            } catch (error) {
                console.error(`${MODULE_NAME}: Error in import profiles:`, error);
toastr.error(t('STMemoryBooks_FailedToImportProfiles', 'Failed to import profiles'), 'STMemoryBooks');
            }
            return;
        }
        
        if (e.target.matches('#stmb-allow-scene-overlap')) {
            settings.moduleSettings.allowSceneOverlap = e.target.checked;
            saveSettingsDebounced();
            return;
        }

        if (e.target.matches('#stmb-unhide-before-memory')) {
            settings.moduleSettings.unhideBeforeMemory = e.target.checked;
            saveSettingsDebounced();
            return;
        }
        
        if (e.target.matches('#stmb-manual-mode-enabled')) {
            const isEnabling = e.target.checked;

            // Mutual exclusion: If enabling manual mode, disable auto-create
            if (isEnabling) {
                settings.moduleSettings.autoCreateLorebook = false;
                const autoCreateCheckbox = document.querySelector('#stmb-auto-create-lorebook');
                if (autoCreateCheckbox) {
                    autoCreateCheckbox.checked = false;
                }
            }

            if (isEnabling) {
                // Check if there's a chat-bound lorebook
                const chatBoundLorebook = chat_metadata?.[METADATA_KEY];
                const stmbData = getSceneMarkers() || {};

                // If switching to manual mode and no manual lorebook is set
                if (!stmbData.manualLorebook) {
                    // If there's a chat-bound lorebook, suggest using it or selecting a different one
                    if (chatBoundLorebook) {
                        const popupContent = `
                            <h4 data-i18n="STMemoryBooks_ManualLorebookSetupTitle">Manual Lorebook Setup</h4>
                            <div class="world_entry_form_control">
                                <p data-i18n="STMemoryBooks_ManualLorebookSetupDesc1" data-i18n-params='{"name": "${chatBoundLorebook}"}'>You have a chat-bound lorebook "<strong>${chatBoundLorebook}</strong>".</p>
                                <p data-i18n="STMemoryBooks_ManualLorebookSetupDesc2">Would you like to use it for manual mode or select a different one?</p>
                            </div>
                        `;

                        const popup = new Popup(popupContent, POPUP_TYPE.TEXT, '', {
                            okButton: t('STMemoryBooks_UseChatBound', 'Use Chat-bound'),
                            cancelButton: t('STMemoryBooks_SelectDifferent', 'Select Different')
                        });
                        const result = await popup.show();

                        if (result === POPUP_RESULT.AFFIRMATIVE) {
                            // Use the chat-bound lorebook as manual lorebook
                            stmbData.manualLorebook = chatBoundLorebook;
                            saveMetadataForCurrentContext();
                            toastr.success(t('STMemoryBooks_ManualLorebookSet', `Manual lorebook set to "${chatBoundLorebook}"`), 'STMemoryBooks');
                        } else {
                            // Let user select a different lorebook
                            const selectedLorebook = await showLorebookSelectionPopup(chatBoundLorebook);
                            if (!selectedLorebook) {
                                // User cancelled, revert the checkbox
                                e.target.checked = false;
                                return;
                            }
                            // showLorebookSelectionPopup already saved the selection and showed success message
                        }
                    } else {
                        // No chat-bound lorebook, prompt to select one
                        toastr.info(t('STMemoryBooks_PleaseSelectLorebookForManualMode', 'Please select a lorebook for manual mode'), 'STMemoryBooks');
                        const selectedLorebook = await showLorebookSelectionPopup();
                        if (!selectedLorebook) {
                            // User cancelled, revert the checkbox
                            e.target.checked = false;
                            return;
                        }
                        // showLorebookSelectionPopup already saved the selection and showed success message
                    }
                }
            }

            settings.moduleSettings.manualModeEnabled = e.target.checked;
            saveSettingsDebounced();
            updateLorebookStatusDisplay();
            populateInlineButtons();
            return;
        }


        if (e.target.matches('#stmb-auto-hide-mode')) {
            settings.moduleSettings.autoHideMode = e.target.value;
            delete settings.moduleSettings.autoHideAllMessages;
            delete settings.moduleSettings.autoHideLastMemory;
            saveSettingsDebounced();
            return;
        }
        
        if (e.target.matches('#stmb-profile-select')) {
            const newIndex = parseInt(e.target.value);
            if (newIndex >= 0 && newIndex < settings.profiles.length) {
                const selectedProfile = settings.profiles[newIndex];
                const summaryApi = popupElement.querySelector('#stmb-summary-api');
                const summaryModel = popupElement.querySelector('#stmb-summary-model');
                const summaryTemp = popupElement.querySelector('#stmb-summary-temp');
                const summaryTitle = popupElement.querySelector('#stmb-summary-title');
                const summaryPrompt = popupElement.querySelector('#stmb-summary-prompt');

                if (selectedProfile.useDynamicSTSettings || (selectedProfile?.connection?.api === 'current_st')) {
                    // For dynamic/current_st profiles, show current ST settings
                    const currentApiInfo = getCurrentApiInfo();
                    const currentSettings = getUIModelSettings();

                    if (summaryApi) summaryApi.textContent = currentApiInfo.completionSource || 'openai';
                    if (summaryModel) summaryModel.textContent = currentSettings.model || t('STMemoryBooks_NotSet', 'Not Set');
                    if (summaryTemp) summaryTemp.textContent = currentSettings.temperature || '0.7';
                } else {
                    // For regular profiles, show stored settings
                    if (summaryApi) summaryApi.textContent = selectedProfile.connection?.api || 'openai';
                    if (summaryModel) summaryModel.textContent = selectedProfile.connection?.model || t('STMemoryBooks_NotSet', 'Not Set');
                    if (summaryTemp) summaryTemp.textContent = selectedProfile.connection?.temperature !== undefined ? selectedProfile.connection.temperature : '0.7';
                }
                // Title format is profile-specific
                if (summaryTitle) summaryTitle.textContent = (selectedProfile.titleFormat || settings.titleFormat);
                if (summaryPrompt) summaryPrompt.textContent = await getEffectivePromptAsync(selectedProfile);
            }
            return;
        }
        
        if (e.target.matches('#stmb-title-format-select')) {
            const customInput = popupElement.querySelector('#stmb-custom-title-format');
            const summaryTitle = popupElement.querySelector('#stmb-summary-title');

            if (e.target.value === 'custom') {
                customInput.classList.remove('displayNone');
                customInput.focus();
            } else {
                customInput.classList.add('displayNone');
                settings.titleFormat = e.target.value;
                saveSettingsDebounced();

                // Update the preview
                if (summaryTitle) {
                    summaryTitle.textContent = e.target.value;
                }
            }
            return;
        }
        
        if (e.target.matches('#stmb-default-memory-count')) {
            const value = parseInt(e.target.value);
            if (!isNaN(value) && value >= 0 && value <= 20) {
                settings.moduleSettings.defaultMemoryCount = value;
                saveSettingsDebounced();
            }
            return;
        }

        if (e.target.matches('#stmb-auto-summary-enabled')) {
            settings.moduleSettings.autoSummaryEnabled = e.target.checked;
            saveSettingsDebounced();
            return;
        }

        if (e.target.matches('#stmb-auto-create-lorebook')) {
            const isEnabling = e.target.checked;

            // Mutual exclusion: If enabling auto-create, disable manual mode
            if (isEnabling) {
                settings.moduleSettings.manualModeEnabled = false;
                const manualModeCheckbox = document.querySelector('#stmb-manual-mode-enabled');
                if (manualModeCheckbox) {
                    manualModeCheckbox.checked = false;
                }
            }

            settings.moduleSettings.autoCreateLorebook = e.target.checked;
            saveSettingsDebounced();
            updateLorebookStatusDisplay();
            populateInlineButtons();
            return;
        }

        if (e.target.matches('#stmb-auto-summary-interval')) {
            const value = parseInt(e.target.value);
            if (!isNaN(value) && value >= 10 && value <= 200) {
                settings.moduleSettings.autoSummaryInterval = value;
                saveSettingsDebounced();
            }
            return;
        }
    });
    
    // Handle input events using delegation with debouncing
    popupElement.addEventListener('input', lodash.debounce((e) => {
        const settings = initializeSettings();
        
        if (e.target.matches('#stmb-custom-title-format')) {
            const value = e.target.value.trim();
            if (value && value.includes('000')) {
                settings.titleFormat = value;
                saveSettingsDebounced();

                // Update the preview
                const summaryTitle = popupElement.querySelector('#stmb-summary-title');
                if (summaryTitle) {
                    summaryTitle.textContent = value;
                }
            }
            return;
        }

        if (e.target.matches('#stmb-lorebook-name-template')) {
            const value = e.target.value.trim();
            if (value) {
                settings.moduleSettings.lorebookNameTemplate = value;
                saveSettingsDebounced();
            }
            return;
        }

        if (e.target.matches('#stmb-token-warning-threshold')) {
            const value = parseInt(e.target.value);
            if (!isNaN(value) && value >= 1000 && value <= 100000) {
                settings.moduleSettings.tokenWarningThreshold = value;
                saveSettingsDebounced();
            }
            return;
        }
        
        if (e.target.matches('#stmb-unhidden-entries-count')) {
            const value = parseInt(e.target.value);
            if (!isNaN(value) && value >= 0 && value <= 50) {
                settings.moduleSettings.unhiddenEntriesCount = value;
                saveSettingsDebounced();
            }
            return;
        }
    }, 1000));
}

/**
 * Handle settings popup close
 */
function handleSettingsPopupClose(popup) {
    try {
        const popupElement = popup.dlg;
        const settings = initializeSettings();
        
        // Save checkbox states
        const alwaysUseDefault = popupElement.querySelector('#stmb-always-use-default')?.checked ?? settings.moduleSettings.alwaysUseDefault;
        const showMemoryPreviews = popupElement.querySelector('#stmb-show-memory-previews')?.checked ?? settings.moduleSettings.showMemoryPreviews;
        const showNotifications = popupElement.querySelector('#stmb-show-notifications')?.checked ?? settings.moduleSettings.showNotifications;
        const unhideBeforeMemory = popupElement.querySelector('#stmb-unhide-before-memory')?.checked ?? settings.moduleSettings.unhideBeforeMemory;
        const refreshEditor = popupElement.querySelector('#stmb-refresh-editor')?.checked ?? settings.moduleSettings.refreshEditor;
        const allowSceneOverlap = popupElement.querySelector('#stmb-allow-scene-overlap')?.checked ?? settings.moduleSettings.allowSceneOverlap;
        const autoHideMode = popupElement.querySelector('#stmb-auto-hide-mode')?.value ?? getAutoHideMode(settings.moduleSettings);
        
        // Save token warning threshold
        const tokenWarningThresholdInput = popupElement.querySelector('#stmb-token-warning-threshold');
        const tokenWarningThreshold = tokenWarningThresholdInput ? 
            parseInt(tokenWarningThresholdInput.value) || 30000 : 
            settings.moduleSettings.tokenWarningThreshold || 30000;

        // Save default memory count
        const defaultMemoryCountInput = popupElement.querySelector('#stmb-default-memory-count');
        const defaultMemoryCount = defaultMemoryCountInput ? 
            parseInt(defaultMemoryCountInput.value) || 0 : 
            settings.moduleSettings.defaultMemoryCount || 0;

        // Save unhidden entries count
        const unhiddenEntriesCountInput = popupElement.querySelector('#stmb-unhidden-entries-count');
        const unhiddenEntriesCount = unhiddenEntriesCountInput ? 
            parseInt(unhiddenEntriesCountInput.value) || 0 : 
            settings.moduleSettings.unhiddenEntriesCount || 0;

        const manualModeEnabled = popupElement.querySelector('#stmb-manual-mode-enabled')?.checked ?? settings.moduleSettings.manualModeEnabled;

        // Save auto-summary settings
        const autoSummaryEnabled = popupElement.querySelector('#stmb-auto-summary-enabled')?.checked ?? settings.moduleSettings.autoSummaryEnabled;
        const autoSummaryIntervalInput = popupElement.querySelector('#stmb-auto-summary-interval');
        const autoSummaryInterval = autoSummaryIntervalInput ?
            parseInt(autoSummaryIntervalInput.value) || 50 :
            settings.moduleSettings.autoSummaryInterval || 50;

        // Save auto-create lorebook setting
        const autoCreateLorebook = popupElement.querySelector('#stmb-auto-create-lorebook')?.checked ?? settings.moduleSettings.autoCreateLorebook;

        const hasChanges = alwaysUseDefault !== settings.moduleSettings.alwaysUseDefault ||
                          showMemoryPreviews !== settings.moduleSettings.showMemoryPreviews ||
                          showNotifications !== settings.moduleSettings.showNotifications ||
                          unhideBeforeMemory !== settings.moduleSettings.unhideBeforeMemory ||
                          refreshEditor !== settings.moduleSettings.refreshEditor ||
                          tokenWarningThreshold !== settings.moduleSettings.tokenWarningThreshold ||
                          defaultMemoryCount !== settings.moduleSettings.defaultMemoryCount ||
                          manualModeEnabled !== settings.moduleSettings.manualModeEnabled ||
                          allowSceneOverlap !== settings.moduleSettings.allowSceneOverlap ||
                          autoHideMode !== getAutoHideMode(settings.moduleSettings) ||
                          unhiddenEntriesCount !== settings.moduleSettings.unhiddenEntriesCount ||
                          autoSummaryEnabled !== settings.moduleSettings.autoSummaryEnabled ||
                          autoSummaryInterval !== settings.moduleSettings.autoSummaryInterval ||
                          autoCreateLorebook !== settings.moduleSettings.autoCreateLorebook;
        
        if (hasChanges) {
            settings.moduleSettings.alwaysUseDefault = alwaysUseDefault;
            settings.moduleSettings.showMemoryPreviews = showMemoryPreviews;
            settings.moduleSettings.showNotifications = showNotifications;
            settings.moduleSettings.unhideBeforeMemory = unhideBeforeMemory;
            settings.moduleSettings.refreshEditor = refreshEditor;
            settings.moduleSettings.tokenWarningThreshold = tokenWarningThreshold;
            settings.moduleSettings.defaultMemoryCount = defaultMemoryCount;
            settings.moduleSettings.manualModeEnabled = manualModeEnabled;
            settings.moduleSettings.allowSceneOverlap = allowSceneOverlap;
            settings.moduleSettings.autoHideMode = autoHideMode;
            // Clear old boolean settings for clean migration
            delete settings.moduleSettings.autoHideAllMessages;
            delete settings.moduleSettings.autoHideLastMemory;
            settings.moduleSettings.unhiddenEntriesCount = unhiddenEntriesCount;
            settings.moduleSettings.autoSummaryEnabled = autoSummaryEnabled;
            settings.moduleSettings.autoSummaryInterval = autoSummaryInterval;
            settings.moduleSettings.autoCreateLorebook = autoCreateLorebook;
            saveSettingsDebounced();
        }
    } catch (error) {
        console.error('STMemoryBooks: Failed to save settings:', error);
        toastr.warning(t('STMemoryBooks_FailedToSaveSettings', 'Failed to save settings. Please try again.'), 'STMemoryBooks');
    }
    currentPopupInstance = null;
}

/**
 * Refresh popup content while preserving popup properties
 */
async function refreshPopupContent() {
    if (!currentPopupInstance || !currentPopupInstance.dlg.hasAttribute('open')) {
        return;
    }
    
    try {
        const settings = initializeSettings();
        const sceneData = await getSceneData();
        const selectedProfile = settings.profiles[settings.defaultProfile];
        const sceneMarkers = getSceneMarkers();

        // Get current lorebook information
        const isManualMode = settings.moduleSettings.manualModeEnabled;
        const chatBoundLorebook = chat_metadata?.[METADATA_KEY] || null;
        const manualLorebook = sceneMarkers?.manualLorebook || null;

        const templateData = {
            hasScene: !!sceneData,
            sceneData: sceneData,
            highestMemoryProcessed: sceneMarkers?.highestMemoryProcessed,
            alwaysUseDefault: settings.moduleSettings.alwaysUseDefault,
            showMemoryPreviews: settings.moduleSettings.showMemoryPreviews,
            showNotifications: settings.moduleSettings.showNotifications,
            unhideBeforeMemory: settings.moduleSettings.unhideBeforeMemory || false,
            refreshEditor: settings.moduleSettings.refreshEditor,
            allowSceneOverlap: settings.moduleSettings.allowSceneOverlap,
            manualModeEnabled: settings.moduleSettings.manualModeEnabled,

            // Lorebook status information
            lorebookMode: isManualMode ? 'Manual' : 'Automatic (Chat-bound)',
            currentLorebookName: isManualMode ? manualLorebook : chatBoundLorebook,
            manualLorebookName: manualLorebook,
            chatBoundLorebookName: chatBoundLorebook,
            availableLorebooks: world_names || [],
            autoHideMode: getAutoHideMode(settings.moduleSettings),
            unhiddenEntriesCount: settings.moduleSettings.unhiddenEntriesCount || 0,
            tokenWarningThreshold: settings.moduleSettings.tokenWarningThreshold || 30000,
            defaultMemoryCount: settings.moduleSettings.defaultMemoryCount || 0,
            autoSummaryEnabled: settings.moduleSettings.autoSummaryEnabled || false,
            autoSummaryInterval: settings.moduleSettings.autoSummaryInterval || 50,
            autoCreateLorebook: settings.moduleSettings.autoCreateLorebook || false,
            lorebookNameTemplate: settings.moduleSettings.lorebookNameTemplate || 'LTM - {{char}} - {{chat}}',
            profiles: settings.profiles.map((profile, index) => ({
                ...profile,
                name: (profile?.connection?.api === 'current_st') ? t('STMemoryBooks_Profile_CurrentST', 'Current SillyTavern Settings') : profile.name,
                isDefault: index === settings.defaultProfile
            })),
            titleFormat: settings.titleFormat,
            titleFormats: getDefaultTitleFormats().map(format => ({
                value: format,
                isSelected: format === settings.titleFormat
            })),
            showCustomInput: !getDefaultTitleFormats().includes(settings.titleFormat),
            selectedProfile: {
                ...selectedProfile,
                connection: (selectedProfile.useDynamicSTSettings || (selectedProfile?.connection?.api === 'current_st')) ?
                    (() => {
                        const currentApiInfo = getCurrentApiInfo();
                        const currentSettings = getUIModelSettings();
                        return {
                            api: currentApiInfo.completionSource || 'openai',
                            model: currentSettings.model || 'Not Set',
                            temperature: currentSettings.temperature || 0.7
                        };
                    })() : {
                        api: selectedProfile.connection?.api || 'openai',
                        model: selectedProfile.connection?.model || 'gpt-4.1',
                        temperature: selectedProfile.connection?.temperature !== undefined ? selectedProfile.connection.temperature : 0.7
                    },
                titleFormat: selectedProfile.titleFormat || settings.titleFormat,
                effectivePrompt: (selectedProfile.prompt && selectedProfile.prompt.trim() ? selectedProfile.prompt : (selectedProfile.preset ? await PromptManager.getPrompt(selectedProfile.preset) : DEFAULT_PROMPT))
            }
        };
        
        const newHtml = DOMPurify.sanitize(settingsTemplate(templateData));

        // Update the popup content directly
        currentPopupInstance.content.innerHTML = newHtml;

        // After updating content, refresh the profile dropdown selection
        const profileSelect = currentPopupInstance.content.querySelector('#stmb-profile-select');
        if (profileSelect) {
            profileSelect.value = settings.defaultProfile;
            // Trigger change event to update profile summary
            profileSelect.dispatchEvent(new Event('change'));
        }

        const requiredClasses = [
            'wide_dialogue_popup',
            'large_dialogue_popup',
            'vertical_scrolling_dialogue_popup'
        ];
        currentPopupInstance.dlg.classList.add(...requiredClasses);
        currentPopupInstance.content.style.overflowY = 'auto';

        // Repopulate profile buttons after content refresh
        populateInlineButtons();

    } catch (error) {
        console.error('STMemoryBooks: Error refreshing popup content:', error);
    }
}

/**
 * Process existing messages and use full update (for chat loads)
 */
function processExistingMessages() {
    const messageElements = document.querySelectorAll('#chat .mes[mesid]');

    if (messageElements.length > 0) {
        let buttonsAdded = 0;
        messageElements.forEach(messageElement => {
            // Check if buttons are already there to prevent duplication
            if (!messageElement.querySelector('.mes_stmb_start')) {
                createSceneButtons(messageElement);
                buttonsAdded++;
            }
        });

        // Full update needed for chat loads
        updateAllButtonStates();
    }
}

/**
 * Register slash commands using proper SlashCommand classes
 */
function registerSlashCommands() {
    const createMemoryCmd = SlashCommand.fromProps({
        name: 'creatememory',
        callback: handleCreateMemoryCommand,
        helpString: t('STMemoryBooks_Slash_CreateMemory_Help', 'Create memory from marked scene')
    });
    
    const sceneMemoryCmd = SlashCommand.fromProps({
        name: 'scenememory', 
        callback: handleSceneMemoryCommand,
        helpString: t('STMemoryBooks_Slash_SceneMemory_Help', 'Set scene range and create memory (e.g., /scenememory 10-15)'),
        unnamedArgumentList: [
            SlashCommandArgument.fromProps({
                description: t('STMemoryBooks_Slash_SceneMemory_ArgRangeDesc', 'Message range (X-Y format)'),
            typeList: [ARGUMENT_TYPE.STRING],
                isRequired: true
            })
        ]
    });
    
    const nextMemoryCmd = SlashCommand.fromProps({
        name: 'nextmemory',
        callback: handleNextMemoryCommand,
        helpString: t('STMemoryBooks_Slash_NextMemory_Help', 'Create memory from end of last memory to current message')
    });

    const sidePromptCmd = SlashCommand.fromProps({
        name: 'sideprompt',
        callback: handleSidePromptCommand,
        helpString: t('STMemoryBooks_Slash_SidePrompt_Help', 'Run side prompt. Usage: /sideprompt "Name" [X-Y]'),
        unnamedArgumentList: [
            SlashCommandArgument.fromProps({
                description: t('STMemoryBooks_Slash_SidePrompt_ArgDesc', 'Template name (quote if contains spaces), optionally followed by X-Y range'),
                typeList: [ARGUMENT_TYPE.ENUM],
                isRequired: false,
                enumProvider: () => sidePromptNameCache.map(n => new SlashCommandEnumValue(n))
            })
        ]
    });



    SlashCommandParser.addCommandObject(createMemoryCmd);
    SlashCommandParser.addCommandObject(sceneMemoryCmd);
    SlashCommandParser.addCommandObject(nextMemoryCmd);
    SlashCommandParser.addCommandObject(sidePromptCmd);
}

/**
 * Create main menu UI
 */
function createUI() {
    const menuItem = $(`
        <div id="stmb-menu-item-container" class="extension_container interactable" tabindex="0">            
            <div id="stmb-menu-item" class="list-group-item flex-container flexGap5 interactable" tabindex="0">
                <div class="fa-fw fa-solid fa-book extensionsMenuExtensionButton"></div>
                <span data-i18n="STMemoryBooks_MenuItem">Memory Books</span>
            </div>
        </div>
    `);
    
    
    const extensionsMenu = $('#extensionsMenu');
    if (extensionsMenu.length > 0) {
        extensionsMenu.append(menuItem);
        applyI18n(menuItem[0]);
    } else {
        console.warn('STMemoryBooks: Extensions menu not found - retrying initialization');
    }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    $(document).on('click', SELECTORS.menuItem, showSettingsPopup);
    
    eventSource.on(event_types.CHAT_CHANGED, handleChatChanged);
    eventSource.on(event_types.MESSAGE_DELETED, (deletedId) => {
        const settings = initializeSettings();
        handleMessageDeletion(deletedId, settings);
    });
    eventSource.on(event_types.MESSAGE_RECEIVED, handleMessageReceived);
    eventSource.on(event_types.GROUP_WRAPPER_FINISHED, handleGroupWrapperFinished);

    // Track dry-run state for generation events
    eventSource.on(event_types.GENERATION_STARTED, (type, options, dryRun) => {
        isDryRun = dryRun || false;
    });


    // Model settings change handlers
    const modelSelectors = Object.values(SELECTORS).filter(selector =>
        selector.includes('model_') || selector.includes('temp_')
    ).join(', ');


    eventSource.on(event_types.GENERATE_AFTER_DATA, (generate_data) => {
        if (isDryRun) {
            return; // Skip all processing during dry-run
        }
        if (isProcessingMemory && currentProfile) {
            const conn = currentProfile.effectiveConnection || currentProfile.connection || {};
            const apiToSource = {
                openai: 'openai',
                claude: 'claude',
                openrouter: 'openrouter',
                ai21: 'ai21',
                makersuite: 'makersuite',
                google: 'makersuite',
                vertexai: 'vertexai',
                mistralai: 'mistralai',
                custom: 'custom',
                cohere: 'cohere',
                perplexity: 'perplexity',
                groq: 'groq',
                nanogpt: 'nanogpt',
                deepseek: 'deepseek',
                electronhub: 'electronhub',
                aimlapi: 'aimlapi',
                xai: 'xai',
                pollinations: 'pollinations',
                moonshot: 'moonshot',
                fireworks: 'fireworks',
                cometapi: 'cometapi',
                azure_openai: 'azure_openai',
            };
            const src = apiToSource[conn.api] || 'openai';

            // Force source/model/temp
            generate_data.chat_completion_source = src;

            // Disable thinking mode for memory generation
            generate_data.include_reasoning = false;

            if (conn.model) {
                generate_data.model = conn.model;
            }
            if (typeof conn.temperature === 'number') {
                generate_data.temperature = conn.temperature;
            }

        }
    });
    
    window.addEventListener('beforeunload', cleanupChatObserver);
}

/**
 * Initialize the extension with BULLETPROOF settings management
 */
async function init() {
    if (hasBeenInitialized) return;
    hasBeenInitialized = true;
    console.log('STMemoryBooks: Initializing');
    // Register all available locales from the registry (en, zh-cn, etc.)
    try {
        Object.entries(localeData).forEach(([tag, data]) => addLocaleData(tag, data));
    } catch (e) {
        // If registry is unavailable for some reason, proceed without crashing
        console.warn('STMemoryBooks: Failed to register locales from registry:', e);
    }
    // Default to English; runtime can call setLocale(...) later if needed
    const stLocale = st_settings.language ?? 'en';
    setLocale(stLocale);
    // Wait for SillyTavern to be ready
    let attempts = 0;
    const maxAttempts = 20;
    
    while (attempts < maxAttempts) {
        if ($(SELECTORS.extensionsMenu).length > 0 && eventSource && typeof Popup !== 'undefined') {
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
    }

    // Create UI now that extensions menu is available
    createUI();

    // Initialize settings with validation
    const settings = initializeSettings();
    const profileValidation = validateAndFixProfiles(settings);
    
    if (!profileValidation.valid) {
        console.warn('STMemoryBooks: Profile validation issues found:', profileValidation.issues);
        if (profileValidation.fixes.length > 0) {
            saveSettingsDebounced();
        }
    }
    
    // Initialize scene state
    updateSceneStateCache();
    validateAndCleanupSceneMarkers();
    
    // Initialize chat observer
    try {
        initializeChatObserver();
    } catch (error) {
        console.error('STMemoryBooks: Failed to initialize chat observer:', error);
        toastr.error(t('STMemoryBooks_FailedToInitializeChatMonitoring', 'STMemoryBooks: Failed to initialize chat monitoring. Please refresh the page.'), 'STMemoryBooks');
        return;
    }
    
    // Setup event listeners
    setupEventListeners();

    // Preload side prompt names cache for autocomplete
    await refreshSidePromptCache();
    
    // Register slash commands
    registerSlashCommands();

    // Process any messages that are already on the screen at initialization time
    // This handles cases where a chat is already loaded when the extension initializes
    try {
        processExistingMessages();
        console.log('STMemoryBooks: Processed existing messages during initialization');
    } catch (error) {
        console.error('STMemoryBooks: Error processing existing messages during init:', error);
    }
    
    // Add CSS classes helper for Handlebars
    Handlebars.registerHelper('eq', function(a, b) {
        return a === b;
    });
    
    console.log('STMemoryBooks: Extension loaded successfully');
}

// Initialize when ready
$(document).ready(() => {
    if (eventSource && event_types.APP_READY) {
        eventSource.on(event_types.APP_READY, init);
    }    
    // Fallback initialization
    setTimeout(init, 2000);    
})
