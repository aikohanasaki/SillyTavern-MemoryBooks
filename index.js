import {
  eventSource,
  event_types,
  chat,
  chat_metadata,
  saveSettingsDebounced,
  characters,
  this_chid,
  name1,
  name2,
  saveMetadata,
  getCurrentChatId,
  settings as st_settings,
} from "../../../../script.js";
import { Popup, POPUP_TYPE, POPUP_RESULT } from "../../../popup.js";
import {
  extension_settings,
  saveMetadataDebounced,
} from "../../../extensions.js";
import { SlashCommandParser } from "../../../slash-commands/SlashCommandParser.js";
import { SlashCommand } from "../../../slash-commands/SlashCommand.js";
import { SlashCommandEnumValue } from "../../../slash-commands/SlashCommandEnumValue.js";
import {
  ARGUMENT_TYPE,
  SlashCommandArgument,
} from "../../../slash-commands/SlashCommandArgument.js";
import { executeSlashCommands } from "../../../slash-commands.js";
import {
  METADATA_KEY,
  world_names,
  loadWorldInfo,
  createNewWorldInfo,
  saveWorldInfo,
  reloadEditor,
} from "../../../world-info.js";
import { lodash, Handlebars, DOMPurify } from "../../../../lib.js";
import { escapeHtml } from "../../../utils.js";
import {
  compileScene,
  createSceneRequest,
  validateCompiledScene,
  getSceneStats,
} from "./chatcompile.js";
import { createMemory } from "./stmemory.js";
import {
  addMemoryToLorebook,
  getDefaultTitleFormats,
  identifyMemoryEntries,
  getRangeFromMemoryEntry,
} from "./addlore.js";
import { generateLorebookName, autoCreateLorebook } from "./autocreate.js";
import {
  checkAutoSummaryTrigger,
  handleAutoSummaryMessageReceived,
  handleAutoSummaryGroupFinished,
  clearAutoSummaryState,
} from "./autosummary.js";
import {
  editProfile,
  newProfile,
  deleteProfile,
  exportProfiles,
  importProfiles,
  validateAndFixProfiles,
} from "./profileManager.js";
import {
  getSceneMarkers,
  setSceneMarker,
  setSceneRange,
  clearScene,
  updateAllButtonStates,
  updateNewMessageButtonStates,
  validateSceneMarkers,
  handleMessageDeletion,
  createSceneButtons,
  getSceneData,
  updateSceneStateCache,
  getCurrentSceneState,
  saveMetadataForCurrentContext,
} from "./sceneManager.js";
import { settingsTemplate } from "./templates.js";
import {
  showConfirmationPopup,
  fetchPreviousSummaries,
  showMemoryPreviewPopup,
} from "./confirmationPopup.js";
import {
  getEffectivePrompt,
  getDefaultPrompt,
  deepClone,
  getUIModelSettings,
  getCurrentApiInfo,
  SELECTORS,
  getCurrentMemoryBooksContext,
  getEffectiveLorebookName,
  showLorebookSelectionPopup,
} from "./utils.js";
import { editGroup } from "../../../group-chats.js";
import * as SummaryPromptManager from "./summaryPromptManager.js";
import {
  MEMORY_GENERATION,
  SCENE_MANAGEMENT,
  UI_SETTINGS,
} from "./constants.js";
import {
  evaluateTrackers,
  runAfterMemory,
  runSidePrompt,
} from "./sidePrompts.js";
import { showSidePromptsPopup } from "./sidePromptsPopup.js";
import { listTemplates } from "./sidePromptsManager.js";
import { runArcAnalysisSequential, commitArcs } from "./arcanalysis.js";
import * as ArcPrompts from "./arcAnalysisPromptManager.js";
import { summaryPromptsTableTemplate } from "./templatesSummaryPrompts.js";
import {
  t as __st_t_tag,
  translate,
  applyLocale,
  addLocaleData,
  getCurrentLocale,
} from "../../../i18n.js";
import { localeData, loadLocaleJson } from "./locales.js";
import { getRegexScripts } from "../../../extensions/regex/engine.js";
import "../../../../lib/select2.min.js";

/**
 * Async effective prompt that respects Summary Prompt Manager overrides
 */
async function getEffectivePromptAsync(profile) {
  try {
    if (profile?.prompt && String(profile.prompt).trim()) {
      return profile.prompt;
    }
    if (profile?.preset) {
      return await SummaryPromptManager.getPrompt(profile.preset);
    }
  } catch (e) {
    console.warn(
      translate(
        "STMemoryBooks: getEffectivePromptAsync fallback due to error:",
        "index.warn.getEffectivePromptAsync",
      ),
      e,
    );
  }
  return getDefaultPrompt();
}
/**
 * Check if memory is currently being processed
 * @returns {boolean} True if memory creation is in progress
 */
export function isMemoryProcessing() {
  return isProcessingMemory;
}

export { currentProfile };

const MODULE_NAME = "STMemoryBooks";

let hasBeenInitialized = false;

// Supported Chat Completion sources
const SUPPORTED_COMPLETION_SOURCES = [
  "openai",
  "claude",
  "openrouter",
  "ai21",
  "makersuite",
  "vertexai",
  "mistralai",
  "custom",
  "cohere",
  "perplexity",
  "groq",
  "electronhub",
  "nanogpt",
  "deepseek",
  "aimlapi",
  "xai",
  "pollinations",
  "moonshot",
  "fireworks",
  "cometapi",
  "azure_openai",
  "zai",
  "siliconflow",
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
    autoHideMode: "none",
    unhiddenEntriesCount: 0,
    autoSummaryEnabled: false,
    autoSummaryInterval: 100,
    autoSummaryBuffer: 0,
    autoCreateLorebook: false,
    lorebookNameTemplate: "LTM - {{char}} - {{chat}}",
    useRegex: false,
    selectedRegexOutgoing: [],
    selectedRegexIncoming: [],
  },
  titleFormat: "[000] - {{title}}",
  profiles: [], // Will be populated dynamically with current ST settings
  defaultProfile: 0,
  migrationVersion: 4,
};

// Current state variables
let currentPopupInstance = null;
let isProcessingMemory = false;
let currentProfile = null;
let isDryRun = false;
/* Ephemeral failure state for AI errors */
let lastFailedAIError = null;
let lastFailureToast = null;

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
  if (node.matches && node.matches("#chat .mes[mesid]")) {
    if (!node.querySelector(".mes_stmb_start")) {
      createSceneButtons(node);
      processedMessages.push(node);
    }
  }
  // Find any message elements within the added node
  else if (node.querySelectorAll) {
    const newMessages = node.querySelectorAll("#chat .mes[mesid]");
    newMessages.forEach((mes) => {
      if (!mes.querySelector(".mes_stmb_start")) {
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

  const chatContainer = document.getElementById("chat");
  if (!chatContainer) {
    throw new Error(
      translate(
        "STMemoryBooks: Chat container not found. SillyTavern DOM structure may have changed.",
        "index.error.chatContainerNotFound",
      ),
    );
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
            console.error(
              translate(
                "STMemoryBooks: Error processing new chat elements:",
                "index.error.processingChatElements",
              ),
              error,
            );
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
          console.error(
            translate(
              "STMemoryBooks: Error updating button states:",
              "index.error.updatingButtonStates",
            ),
            error,
          );
        }
      }, UI_SETTINGS.CHAT_OBSERVER_DEBOUNCE_MS);
    }
  });

  // Start observing the chat container
  chatObserver.observe(chatContainer, {
    childList: true,
    subtree: true,
  });

  console.log(
    translate(
      "STMemoryBooks: Chat observer initialized",
      "index.log.chatObserverInitialized",
    ),
  );
}

/**
 * Clean up chat observer
 */
function cleanupChatObserver() {
  if (chatObserver) {
    chatObserver.disconnect();
    chatObserver = null;
    console.log(
      translate(
        "STMemoryBooks: Chat observer disconnected",
        "index.log.chatObserverDisconnected",
      ),
    );
  }

  if (updateTimeout) {
    clearTimeout(updateTimeout);
    updateTimeout = null;
  }
}

function handleChatChanged() {
  console.log(
    translate(
      "STMemoryBooks: Chat changed - updating scene state",
      "index.log.chatChanged",
    ),
  );
  updateSceneStateCache();
  validateAndCleanupSceneMarkers();

  setTimeout(() => {
    try {
      // Full update needed for chat changes
      processExistingMessages();
    } catch (error) {
      console.error(
        translate(
          "STMemoryBooks: Error processing messages after chat change:",
          "index.error.processingMessagesAfterChange",
        ),
        error,
      );
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
    console.log(
      __st_t_tag`Found orphaned scene markers: start=${sceneStart}, end=${sceneEnd}`,
    );

    // Check if memory creation is actually in progress
    if (
      !isProcessingMemory &&
      extension_settings[MODULE_NAME].moduleSettings.autoSummaryEnabled
    ) {
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
    console.error(
      translate(
        "STMemoryBooks: Error in handleMessageReceived:",
        "index.error.handleMessageReceived",
      ),
      error,
    );
  }
}

async function handleGroupWrapperFinished() {
  try {
    setTimeout(validateSceneMarkers, SCENE_MANAGEMENT.VALIDATION_DELAY_MS);
    await handleAutoSummaryGroupFinished();
    await evaluateTrackers();
  } catch (error) {
    console.error(
      translate(
        "STMemoryBooks: Error in handleGroupWrapperFinished:",
        "index.error.handleGroupWrapperFinished",
      ),
      error,
    );
  }
}

/**
 * Slash command handlers
 */
async function handleCreateMemoryCommand(namedArgs, unnamedArgs) {
  const sceneData = await getSceneData();
  if (!sceneData) {
    console.error(
      translate(
        "STMemoryBooks: No scene markers set for createMemory command",
        "index.error.noSceneMarkersForCreate",
      ),
    );
    toastr.error(
      translate(
        "No scene markers set. Use chevron buttons to mark start and end points first.",
        "STMemoryBooks_NoSceneMarkersToastr",
      ),
      translate("STMemoryBooks", "index.toast.title"),
    );
    return "";
  }

  initiateMemoryCreation();
  return "";
}

async function handleSceneMemoryCommand(namedArgs, unnamedArgs) {
  const range = String(unnamedArgs || "").trim();

  if (!range) {
    toastr.error(
      translate(
        "Missing range argument. Use: /scenememory X-Y (e.g., /scenememory 10-15)",
        "STMemoryBooks_MissingRangeArgument",
      ),
      translate("STMemoryBooks", "index.toast.title"),
    );
    return "";
  }

  const match = range.match(/^(\d+)\s*[-–—]\s*(\d+)$/);

  if (!match) {
    toastr.error(
      translate(
        "Invalid format. Use: /scenememory X-Y (e.g., /scenememory 10-15)",
        "STMemoryBooks_InvalidFormat",
      ),
      translate("STMemoryBooks", "index.toast.title"),
    );
    return "";
  }

  const startId = Number(match[1]);
  const endId = Number(match[2]);

  if (!Number.isFinite(startId) || !Number.isFinite(endId)) {
    toastr.error(
      translate(
        "Invalid message IDs parsed. Use: /scenememory X-Y (e.g., /scenememory 10-15)",
        "STMemoryBooks_InvalidMessageIDs",
      ),
      translate("STMemoryBooks", "index.toast.title"),
    );
    return "";
  }

  // Validate range logic (start = end is valid for single message)
  if (startId > endId) {
    toastr.error(
      translate(
        "Start message cannot be greater than end message",
        "STMemoryBooks_StartGreaterThanEnd",
      ),
      translate("STMemoryBooks", "index.toast.title"),
    );
    return "";
  }

  // IMPORTANT: Use the global chat array for validation to match compileScene()
  const activeChat = chat;

  // Validate message IDs exist in current chat
  if (startId < 0 || endId >= activeChat.length) {
    toastr.error(
      __st_t_tag`Message IDs out of range. Valid range: 0-${activeChat.length - 1}`,
      translate("STMemoryBooks", "index.toast.title"),
    );
    return "";
  }

  // check if messages actually exist
  if (!activeChat[startId] || !activeChat[endId]) {
    toastr.error(
      translate(
        "One or more specified messages do not exist",
        "STMemoryBooks_MessagesDoNotExist",
      ),
      translate("STMemoryBooks", "index.toast.title"),
    );
    return "";
  }

  // Atomically set both scene markers for /scenememory
  setSceneRange(startId, endId);

  const context = getCurrentMemoryBooksContext();
  const contextMsg = context.isGroupChat
    ? ` in group "${context.groupName}"`
    : "";
  toastr.info(
    __st_t_tag`Scene set: messages ${startId}-${endId}${contextMsg}`,
    translate("STMemoryBooks", "index.toast.title"),
  );

  initiateMemoryCreation();

  return "";
}

async function handleNextMemoryCommand(namedArgs, unnamedArgs) {
  try {
    // Prevent re-entrancy
    if (isProcessingMemory) {
      toastr.info(
        translate(
          "Memory creation is already in progress",
          "STMemoryBooks_MemoryAlreadyInProgress",
        ),
        translate("STMemoryBooks", "index.toast.title"),
      );
      return "";
    }

    // Validate lorebook exists (fast-fail UX);
    // initiateMemoryCreation will validate again before running
    const lorebookValidation = await validateLorebook();
    if (!lorebookValidation.valid) {
      toastr.error(
        translate(
          "No lorebook available: " + lorebookValidation.error,
          "STMemoryBooks_NoLorebookAvailable",
        ),
        translate("STMemoryBooks", "index.toast.title"),
      );
      return "";
    }

    // Compute next range since last memory
    const stmbData = getSceneMarkers() || {};
    const lastIndex = chat.length - 1;

    if (lastIndex < 0) {
      toastr.info(
        translate(
          "There are no messages to summarize yet.",
          "STMemoryBooks_NoMessagesToSummarize",
        ),
        translate("STMemoryBooks", "index.toast.title"),
      );
      return "";
    }

    const highestProcessed =
      typeof stmbData.highestMemoryProcessed === "number"
        ? stmbData.highestMemoryProcessed
        : null;

    const sceneStart = highestProcessed === null ? 0 : highestProcessed + 1;
    const sceneEnd = lastIndex;

    if (sceneStart > sceneEnd) {
      toastr.info(
        translate(
          "No new messages since the last memory.",
          "STMemoryBooks_NoNewMessagesSinceLastMemory",
        ),
        translate("STMemoryBooks", "index.toast.title"),
      );
      return "";
    }

    // Set scene range and run the standard memory pipeline
    setSceneRange(sceneStart, sceneEnd);
    await initiateMemoryCreation();
  } catch (error) {
    console.error(
      translate(
        "STMemoryBooks: /nextmemory failed:",
        "index.error.nextMemoryFailed",
      ),
      error,
    );
    toastr.error(
      translate(
        "Failed to run /nextmemory: " + error.message,
        "STMemoryBooks_NextMemoryFailed",
      ),
      translate("STMemoryBooks", "index.toast.title"),
    );
  }
  return "";
}

/**
 * Slash: /sideprompt (with optional name/range)
 * If no args, open a picker for discoverability.
 */
async function handleSidePromptCommand(namedArgs, unnamedArgs) {
  const raw = String(unnamedArgs || "").trim();
  if (!raw) {
    toastr.info(
      translate(
        'SidePrompt guide: Type a template name after the space to see suggestions. Usage: /sideprompt "Name" [X-Y]. Quote names with spaces.',
        "STMemoryBooks_SidePromptGuide",
      ),
      translate("STMemoryBooks", "index.toast.title"),
    );
    return "";
  }

  // If user typed partial name without range and it doesn't exactly match,
  // try a quick best effort: if multiple results, show picker filtered; else run directly.
  const parts =
    raw.match(/^["']([^"']+)["']\s*(.*)$/) ||
    raw.match(/^(.+?)(\s+\d+\s*[-–—]\s*\d+)?$/);
  const namePart = parts ? (parts[1] || raw).trim() : raw;

  try {
    // Load and filter
    const templates = await listTemplates();
    const candidates = templates.filter((t) =>
      t.name.toLowerCase().includes(namePart.toLowerCase()),
    );
    if (candidates.length > 1) {
      const top = candidates
        .slice(0, 5)
        .map((t) => t.name)
        .join(", ");
      const more =
        candidates.length > 5 ? `, +${candidates.length - 5} more` : "";
      toastr.info(
        __st_t_tag`Multiple matches: ${top}${more}. Refine the name or use quotes. Usage: /sideprompt "Name" [X-Y]`,
        translate("STMemoryBooks", "index.toast.title"),
      );
      return "";
    }
    // Fall back to direct run (runSidePrompt will resolve fuzzy or error toast)
    return runSidePrompt(raw);
  } catch {
    // Fallback to direct run
    return runSidePrompt(raw);
  }
}

/**
 * Slash: /sideprompt-on and /sideprompt-off
 * Toggle the same underlying "enabled" flag as the UI checkbox (stmb-sp-edit-enabled).
 * Uses dynamic import to avoid modifying top-level imports.
 */
async function handleSidePromptToggle(namedArgs, unnamedArgs, enabled) {
  const raw = String(unnamedArgs || "").trim();
  if (!raw) {
    toastr.error(
      translate(
        enabled
          ? 'Missing name. Use: /sideprompt-on "Name" OR /sideprompt-on all'
          : 'Missing name. Use: /sideprompt-off "Name" OR /sideprompt-off all',
        "STMemoryBooks_SidePromptToggle_MissingName",
      ),
      translate("STMemoryBooks", "index.toast.title"),
    );
    return "";
  }

  try {
    const { findTemplateByName, upsertTemplate, listTemplates } =
      await import("./sidePromptsManager.js");

    if (raw.toLowerCase() === "all") {
      const templates = await listTemplates();
      let changed = 0;
      for (const p of templates) {
        if (p.enabled !== enabled) {
          await upsertTemplate({ key: p.key, enabled });
          changed++;
        }
      }
      try {
        window.dispatchEvent(new CustomEvent("stmb-sideprompts-updated"));
      } catch (e) {
        /* noop */
      }
      toastr.success(
        __st_t_tag`${enabled ? "Enabled" : "Disabled"} ${changed} side prompt${changed === 1 ? "" : "s"}`,
        translate("STMemoryBooks", "index.toast.title"),
      );
      return "";
    }

    const tpl = await findTemplateByName(raw);
    if (!tpl) {
      toastr.error(
        __st_t_tag`Side Prompt not found: ${raw}`,
        translate("STMemoryBooks", "index.toast.title"),
      );
      return "";
    }
    if (tpl.enabled === enabled) {
      toastr.info(
        __st_t_tag`"${tpl.name}" is already ${enabled ? "enabled" : "disabled"}`,
        translate("STMemoryBooks", "index.toast.title"),
      );
      return "";
    }
    await upsertTemplate({ key: tpl.key, enabled });
    try {
      window.dispatchEvent(new CustomEvent("stmb-sideprompts-updated"));
    } catch (e) {
      /* noop */
    }
    toastr.success(
      __st_t_tag`${enabled ? "Enabled" : "Disabled"} "${tpl.name}"`,
      translate("STMemoryBooks", "index.toast.title"),
    );
  } catch (e) {
    console.error("STMemoryBooks: sideprompt enable/disable failed:", e);
    toastr.error(
      __st_t_tag`Failed to toggle side prompt: ${e.message}`,
      translate("STMemoryBooks", "index.toast.title"),
    );
  }
  return "";
}

async function handleSidePromptOnCommand(namedArgs, unnamedArgs) {
  return handleSidePromptToggle(namedArgs, unnamedArgs, true);
}

async function handleSidePromptOffCommand(namedArgs, unnamedArgs) {
  return handleSidePromptToggle(namedArgs, unnamedArgs, false);
}

/**
 * Side Prompt names cache for autocomplete
 */
let sidePromptNameCache = [];
async function refreshSidePromptCache() {
  try {
    const tpls = await listTemplates();
    sidePromptNameCache = (tpls || [])
      .filter((t) => {
        const cmds = t?.triggers?.commands;
        // Back-compat: if commands is missing, treat as manual-enabled for suggestions
        if (!("commands" in (t?.triggers || {}))) return true;
        return (
          Array.isArray(cmds) &&
          cmds.some((c) => String(c).toLowerCase() === "sideprompt")
        );
      })
      .map((t) => t.name);
  } catch (e) {
    console.warn(
      translate(
        "STMemoryBooks: side prompt cache refresh failed",
        "index.warn.sidePromptCacheRefreshFailed",
      ),
      e,
    );
  }
}
window.addEventListener("stmb-sideprompts-updated", refreshSidePromptCache);
// Preload cache early so suggestions are available even before init() completes
try {
  refreshSidePromptCache();
} catch (e) {
  /* noop */
}

// Synchronous enum provider for slash command suggestions (mirrors extension-enum pattern)
const sidePromptTemplateEnumProvider = () =>
  sidePromptNameCache.map((n) => new SlashCommandEnumValue(n));

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
    badges.push("AfterMemory");
  }
  if (
    trig.commands &&
    Array.isArray(trig.commands) &&
    trig.commands.some((c) => String(c).toLowerCase() === "sideprompt")
  ) {
    badges.push("Manual");
  }
  return badges;
}

/**
 * Initialize and validate extension settings
 */
function initializeSettings() {
  extension_settings.STMemoryBooks =
    extension_settings.STMemoryBooks || deepClone(defaultSettings);

  // Migration logic for versions 3-4: Add dynamic profile and clean up titleFormat
  const currentVersion = extension_settings.STMemoryBooks.migrationVersion || 1;
  if (currentVersion < 4) {
    // Check if dynamic profile already exists (in case of partial migration)
    const hasDynamicProfile = extension_settings.STMemoryBooks.profiles?.some(
      (p) => p.useDynamicSTSettings || p?.connection?.api === "current_st",
    );

    if (!hasDynamicProfile) {
      // Add dynamic profile for existing installations
      if (!extension_settings.STMemoryBooks.profiles) {
        extension_settings.STMemoryBooks.profiles = [];
      }

      // Insert dynamic profile at the beginning of the array
      const dynamicProfile = {
        name: "Current SillyTavern Settings",
        connection: {
          api: "current_st",
        },
        preset: "summary",
        constVectMode: "link",
        position: 0,
        orderMode: "auto",
        orderValue: 100,
        preventRecursion: false,
        delayUntilRecursion: true,
      };

      extension_settings.STMemoryBooks.profiles.unshift(dynamicProfile);

      // Adjust default profile index since we inserted at the beginning
      if (extension_settings.STMemoryBooks.defaultProfile !== undefined) {
        extension_settings.STMemoryBooks.defaultProfile += 1;
      }

      console.log(
        __st_t_tag`${MODULE_NAME}: Added dynamic profile for existing installation (migration to v3)`,
      );
    }

    // Clean up any existing dynamic profiles that may have titleFormat
    extension_settings.STMemoryBooks.profiles.forEach((profile) => {
      if (profile.useDynamicSTSettings && profile.titleFormat) {
        delete profile.titleFormat;
        console.log(
          __st_t_tag`${MODULE_NAME}: Removed static titleFormat from dynamic profile`,
        );
      }
    });

    // Update migration version
    extension_settings.STMemoryBooks.migrationVersion = 4;
    saveSettingsDebounced();
  }

  // If this is a fresh install (no profiles), create default profile that dynamically uses ST settings
  if (
    !extension_settings.STMemoryBooks.profiles ||
    extension_settings.STMemoryBooks.profiles.length === 0
  ) {
    const dynamicProfile = {
      name: "Current SillyTavern Settings",
      connection: {
        api: "current_st",
      },
      preset: "summary",
      constVectMode: "link",
      position: 0,
      orderMode: "auto",
      orderValue: 100,
      preventRecursion: false,
      delayUntilRecursion: true,
    };

    extension_settings.STMemoryBooks.profiles = [dynamicProfile];
    console.log(
      __st_t_tag`${MODULE_NAME}: Created dynamic profile for fresh installation`,
    );
  }

  const validationResult = validateSettings(extension_settings.STMemoryBooks);

  // Also validate profiles structure
  const profileValidation = validateAndFixProfiles(
    extension_settings.STMemoryBooks,
  );
  if (profileValidation.fixes.length > 0) {
    console.log(
      __st_t_tag`${MODULE_NAME}: Applied profile fixes:`,
      profileValidation.fixes,
    );
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

  if (
    !settings.moduleSettings.tokenWarningThreshold ||
    settings.moduleSettings.tokenWarningThreshold < 1000
  ) {
    settings.moduleSettings.tokenWarningThreshold = 30000;
  }

  if (
    settings.moduleSettings.defaultMemoryCount === undefined ||
    settings.moduleSettings.defaultMemoryCount < 0
  ) {
    settings.moduleSettings.defaultMemoryCount = 0;
  }

  // Validate auto-summary settings
  if (settings.moduleSettings.autoSummaryEnabled === undefined) {
    settings.moduleSettings.autoSummaryEnabled = false;
  }
  if (
    settings.moduleSettings.autoSummaryInterval === undefined ||
    settings.moduleSettings.autoSummaryInterval < 10
  ) {
    settings.moduleSettings.autoSummaryInterval = 100;
  }
  if (
    settings.moduleSettings.autoSummaryBuffer === undefined ||
    settings.moduleSettings.autoSummaryBuffer < 0
  ) {
    settings.moduleSettings.autoSummaryBuffer = 0;
  }
  if (settings.moduleSettings.autoSummaryBuffer > 50) {
    settings.moduleSettings.autoSummaryBuffer = 50;
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
    settings.moduleSettings.lorebookNameTemplate = "LTM - {{char}} - {{chat}}";
  }

  // Ensure mutual exclusion: both cannot be true at the same time
  if (
    settings.moduleSettings.manualModeEnabled &&
    settings.moduleSettings.autoCreateLorebook
  ) {
    // If both are somehow true, prioritize manual mode (since it was added first)
    settings.moduleSettings.autoCreateLorebook = false;
    console.warn(
      translate(
        "STMemoryBooks: Both manualModeEnabled and autoCreateLorebook were true - setting autoCreateLorebook to false",
        "index.warn.mutualExclusion",
      ),
    );
  }

  // Migrate to version 2 if needed (JSON-based architecture)
  if (!settings.migrationVersion || settings.migrationVersion < 2) {
    console.log(
      __st_t_tag`${MODULE_NAME}: Migrating to JSON-based architecture (v2)`,
    );
    settings.migrationVersion = 2;
    // Update any old tool-based prompts to JSON prompts
    settings.profiles.forEach((profile) => {
      if (profile.prompt && profile.prompt.includes("createMemory")) {
        console.log(
          __st_t_tag`${MODULE_NAME}: Updating profile "${profile.name}" to use JSON output`,
        );
        profile.prompt = getDefaultPrompt(); // Reset to new JSON-based default
      }
    });
  }

  return settings;
}

/**
 * Validate lorebook and return status with data
 */
export async function validateLorebook() {
  const settings = extension_settings.STMemoryBooks;
  let lorebookName = await getEffectiveLorebookName();

  // Check if auto-create is enabled and we're not in manual mode
  if (
    !lorebookName &&
    settings?.moduleSettings?.autoCreateLorebook &&
    !settings?.moduleSettings?.manualModeEnabled
  ) {
    // Auto-create lorebook using template
    const template =
      settings.moduleSettings.lorebookNameTemplate ||
      "LTM - {{char}} - {{chat}}";
    const result = await autoCreateLorebook(template, "chat");

    if (result.success) {
      lorebookName = result.name;
    } else {
      return { valid: false, error: result.error };
    }
  }

  if (!lorebookName) {
    return { valid: false, error: "No lorebook available or selected." };
  }

  if (!world_names || !world_names.includes(lorebookName)) {
    return {
      valid: false,
      error: `Selected lorebook "${lorebookName}" not found.`,
    };
  }

  try {
    const lorebookData = await loadWorldInfo(lorebookName);
    return { valid: !!lorebookData, data: lorebookData, name: lorebookName };
  } catch (error) {
    return { valid: false, error: "Failed to load the selected lorebook." };
  }
}

/**
 * Extract and validate settings from confirmation popup or defaults
 */
async function showAndGetMemorySettings(
  sceneData,
  lorebookValidation,
  selectedProfileIndex = null,
) {
  const settings = initializeSettings();
  const tokenThreshold = settings.moduleSettings.tokenWarningThreshold || 30000;
  const shouldShowConfirmation =
    !settings.moduleSettings.alwaysUseDefault ||
    sceneData.estimatedTokens > tokenThreshold;

  let confirmationResult = null;

  if (shouldShowConfirmation) {
    // Use the passed profile index, or fall back to default
    const profileIndex =
      selectedProfileIndex !== null
        ? selectedProfileIndex
        : settings.defaultProfile;

    // Show simplified confirmation popup with selected profile
    confirmationResult = await showConfirmationPopup(
      sceneData,
      settings,
      getUIModelSettings(),
      getCurrentApiInfo(),
      chat_metadata,
      profileIndex,
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
        effectivePrompt: await getEffectivePromptAsync(selectedProfile),
      },
      advancedOptions: {
        memoryCount: settings.moduleSettings.defaultMemoryCount || 0,
        overrideSettings: false,
      },
    };
  }

  // Build effective connection settings
  const { profileSettings, advancedOptions } = confirmationResult;

  // Check if this profile should dynamically use ST settings
  if (
    profileSettings?.connection?.api === "current_st" ||
    advancedOptions.overrideSettings
  ) {
    const currentApiInfo = getCurrentApiInfo();
    const currentSettings = getUIModelSettings();

    profileSettings.effectiveConnection = {
      api: currentApiInfo.completionSource || "openai",
      model: currentSettings.model || "",
      temperature: currentSettings.temperature || 0.7,
    };

    if (profileSettings.useDynamicSTSettings) {
      console.log(
        "STMemoryBooks: Using dynamic ST settings profile - current settings:",
        profileSettings.effectiveConnection,
      );
    } else {
      console.log(
        "STMemoryBooks: Using current SillyTavern settings override for memory creation",
      );
    }
  } else {
    profileSettings.effectiveConnection = { ...profileSettings.connection };
    console.log(
      "STMemoryBooks: Using profile connection settings for memory creation",
    );
  }

  return {
    profileSettings,
    summaryCount: advancedOptions.memoryCount || 0,
    tokenThreshold,
    settings,
  };
}

/**
 * Determine if an error is retryable
 */
function isRetryableError(error) {
  // Respect structured recoverability for AIResponseError
  if (error && error.name === "AIResponseError") {
    if (typeof error.recoverable === "boolean") {
      return error.recoverable;
    }
    // If code hints at truncation, treat as retryable
    if (error.code && String(error.code).toUpperCase().includes("TRUNCATION")) {
      return true;
    }
  }

  // Don't retry these error types
  const nonRetryableErrors = [
    "TokenWarningError", // User needs to select smaller range
    "InvalidProfileError", // Configuration issue
  ];

  if (nonRetryableErrors.includes(error?.name)) {
    return false;
  }

  // Don't retry validation errors
  if (
    error?.message &&
    (error.message.includes("Scene compilation failed") ||
      error.message.includes("Invalid memory result") ||
      error.message.includes("Invalid lorebook"))
  ) {
    return false;
  }

  // Retry AI response errors and network-related issues by default
  return true;
}

/**
 * Execute the core memory generation process - now with retry logic and BULLETPROOF settings restoration
 */
async function executeMemoryGeneration(
  sceneData,
  lorebookValidation,
  effectiveSettings,
  retryCount = 0,
) {
  const { profileSettings, summaryCount, tokenThreshold, settings } =
    effectiveSettings;
  currentProfile = profileSettings;

  // Optional global conversion of recursion flags on existing STMB entries
  try {
    if (
      settings?.moduleSettings?.convertExistingRecursion &&
      lorebookValidation?.valid &&
      lorebookValidation.data?.entries
    ) {
      const entriesList = identifyMemoryEntries(lorebookValidation.data) || [];
      const earliest = entriesList.length > 0 ? entriesList[0].entry : null;

      const targetPrevent = !!profileSettings.preventRecursion;
      const targetDelay = !!profileSettings.delayUntilRecursion;

      let needsConversion = false;
      if (!earliest) {
        // No STMB entries, nothing to do
        needsConversion = false;
      } else {
        const ePrev = !!earliest.preventRecursion;
        const eDelay = !!earliest.delayUntilRecursion;
        needsConversion = ePrev !== targetPrevent || eDelay !== targetDelay;
      }

      if (needsConversion) {
        let examined = 0;
        let updated = 0;
        const allEntries = Object.values(lorebookValidation.data.entries || {});
        for (const entry of allEntries) {
          if (entry && entry.stmemorybooks === true) {
            examined++;
            const prevChanged = entry.preventRecursion !== targetPrevent;
            const delayChanged = entry.delayUntilRecursion !== targetDelay;
            if (prevChanged || delayChanged) {
              entry.preventRecursion = targetPrevent;
              entry.delayUntilRecursion = targetDelay;
              updated++;
            }
          }
        }

        if (updated > 0) {
          try {
            await saveWorldInfo(
              lorebookValidation.name,
              lorebookValidation.data,
              true,
            );
            if (settings.moduleSettings?.refreshEditor) {
              try {
                reloadEditor(lorebookValidation.name);
              } catch (e) {
                /* noop */
              }
            }
          } catch (e) {
            console.warn(
              "STMemoryBooks: Failed to save lorebook during recursion conversion:",
              e,
            );
          }
          try {
            toastr.info(
              __st_t_tag`Updated recursion flags on ${updated} of ${examined} memory entr${updated === 1 ? "y" : "ies"}`,
              "STMemoryBooks",
            );
          } catch (e) {
            /* noop */
          }
        }
      }
    }
  } catch (e) {
    console.warn("STMemoryBooks: convertExistingRecursion check failed:", e);
  }

  const maxRetries = MEMORY_GENERATION.MAX_RETRIES;

  try {
    // Optionally unhide hidden messages before compiling scene
    if (settings?.moduleSettings?.unhideBeforeMemory) {
      try {
        await executeSlashCommands(
          `/unhide ${sceneData.sceneStart}-${sceneData.sceneEnd}`,
        );
      } catch (e) {
        console.warn(
          "STMemoryBooks: /unhide command failed or unavailable:",
          e,
        );
      }
    }
    // Create and compile scene first
    const sceneRequest = createSceneRequest(
      sceneData.sceneStart,
      sceneData.sceneEnd,
    );
    const compiledScene = compileScene(sceneRequest);

    // Validate compiled scene
    const validation = validateCompiledScene(compiledScene);
    if (!validation.valid) {
      throw new Error(
        `Scene compilation failed: ${validation.errors.join(", ")}`,
      );
    }

    // Fetch previous memories if requested
    let previousMemories = [];
    let memoryFetchResult = {
      summaries: [],
      actualCount: 0,
      requestedCount: 0,
    };
    if (summaryCount > 0) {
      // Fetch previous memories silently (no intermediate toast)
      memoryFetchResult = await fetchPreviousSummaries(
        summaryCount,
        settings,
        chat_metadata,
      );
      previousMemories = memoryFetchResult.summaries;

      if (memoryFetchResult.actualCount > 0) {
        if (memoryFetchResult.actualCount < memoryFetchResult.requestedCount) {
          toastr.warning(
            __st_t_tag`Only ${memoryFetchResult.actualCount} of ${memoryFetchResult.requestedCount} requested memories available`,
            "STMemoryBooks",
          );
        }
        console.log(
          `STMemoryBooks: Including ${memoryFetchResult.actualCount} previous memories as context`,
        );
      } else {
        toastr.warning(
          translate(
            "No previous memories found in lorebook",
            "STMemoryBooks_NoPreviousMemoriesFound",
          ),
          "STMemoryBooks",
        );
      }
    }

    // Show working toast with actual memory count after fetching
    let workingToastMessage;
    if (retryCount > 0) {
      workingToastMessage = `Retrying memory creation (attempt ${retryCount + 1}/${maxRetries + 1})...`;
    } else {
      workingToastMessage =
        memoryFetchResult.actualCount > 0
          ? `Creating memory with ${memoryFetchResult.actualCount} context memories...`
          : "Creating memory...";
    }
    toastr.info(
      translate(workingToastMessage, "STMemoryBooks_WorkingToast"),
      "STMemoryBooks",
      { timeOut: 0 },
    );

    // Add context and get stats (no intermediate toast)
    compiledScene.previousSummariesContext = previousMemories;
    const stats = getSceneStats(compiledScene);
    const actualTokens = stats.estimatedTokens;

    // Generate memory silently
    const memoryResult = await createMemory(compiledScene, profileSettings, {
      tokenWarningThreshold: tokenThreshold,
    });

    // Check if memory previews are enabled and handle accordingly
    let finalMemoryResult = memoryResult;

    if (settings.moduleSettings.showMemoryPreviews) {
      // Clear working toast before showing preview popup
      toastr.clear();

      const previewResult = await showMemoryPreviewPopup(
        memoryResult,
        sceneData,
        profileSettings,
      );

      if (previewResult.action === "cancel") {
        // User cancelled, abort the process
        return;
      } else if (previewResult.action === "retry") {
        // User wants to retry - limit user-initiated retries to prevent infinite loops
        const maxUserRetries = 3; // Allow up to 3 user-initiated retries
        const currentUserRetries =
          retryCount >= maxRetries ? retryCount - maxRetries : 0;

        if (currentUserRetries >= maxUserRetries) {
          toastr.warning(
            __st_t_tag`Maximum retry attempts (${maxUserRetries}) reached`,
            "STMemoryBooks",
          );
          return { action: "cancel" };
        }

        toastr.info(
          __st_t_tag`Retrying memory generation (${currentUserRetries + 1}/${maxUserRetries})...`,
          "STMemoryBooks",
        );
        // Keep the retry count properly incremented to track total attempts
        const nextRetryCount = Math.max(
          retryCount + 1,
          maxRetries + currentUserRetries + 1,
        );
        return await executeMemoryGeneration(
          sceneData,
          lorebookValidation,
          effectiveSettings,
          nextRetryCount,
        );
      }

      // Handle preview result based on action
      if (previewResult.action === "accept") {
        // User accepted as-is, use original data
        finalMemoryResult = memoryResult;
      } else if (previewResult.action === "edit") {
        // User edited the data, validate and use edited version
        if (!previewResult.memoryData) {
          console.error("STMemoryBooks: Edit action missing memoryData");
          toastr.error(
            translate(
              "Unable to retrieve edited memory data",
              "STMemoryBooks_UnableToRetrieveEditedMemoryData",
            ),
            "STMemoryBooks",
          );
          return;
        }

        // Validate that edited memory data has required fields
        if (
          !previewResult.memoryData.extractedTitle ||
          !previewResult.memoryData.content
        ) {
          console.error(
            "STMemoryBooks: Edited memory data missing required fields",
          );
          toastr.error(
            translate(
              "Edited memory data is incomplete",
              "STMemoryBooks_EditedMemoryDataIncomplete",
            ),
            "STMemoryBooks",
          );
          return;
        }

        finalMemoryResult = previewResult.memoryData;
      } else {
        // Unexpected action, use original data as fallback
        console.warn(
          `STMemoryBooks: Unexpected preview action: ${previewResult.action}`,
        );
        finalMemoryResult = memoryResult;
      }
    }

    // Add to lorebook silently
    const addResult = await addMemoryToLorebook(
      finalMemoryResult,
      lorebookValidation,
    );

    if (!addResult.success) {
      throw new Error(addResult.error || "Failed to add memory to lorebook");
    }

    // Run side prompts that are enabled to run with memories
    try {
      const connDbg =
        profileSettings?.effectiveConnection ||
        profileSettings?.connection ||
        {};
      console.debug("STMemoryBooks: Passing profile to runAfterMemory", {
        api: connDbg.api,
        model: connDbg.model,
        temperature: connDbg.temperature,
      });
      await runAfterMemory(compiledScene, profileSettings);
    } catch (e) {
      console.warn("STMemoryBooks: runAfterMemory failed:", e);
    }

    // Update auto-summary baseline so the next trigger starts after this scene
    try {
      const stmbData = getSceneMarkers() || {};
      stmbData.highestMemoryProcessed = sceneData.sceneEnd;
      saveMetadataForCurrentContext();
    } catch (e) {
      console.warn(
        "STMemoryBooks: Failed to update highestMemoryProcessed baseline:",
        e,
      );
    }

    // Clear auto-summary state after successful memory creation
    clearAutoSummaryState();

    // Success notification
    const contextMsg =
      memoryFetchResult.actualCount > 0
        ? ` (with ${memoryFetchResult.actualCount} context ${memoryFetchResult.actualCount === 1 ? "memory" : "memories"})`
        : "";

    // Clear working toast and show success
    toastr.clear();
    lastFailureToast = null;
    lastFailedAIError = null;
    const retryMsg =
      retryCount > 0 ? ` (succeeded on attempt ${retryCount + 1})` : "";
    toastr.success(
      __st_t_tag`Memory "${addResult.entryTitle}" created successfully${contextMsg}${retryMsg}!`,
      "STMemoryBooks",
    );
  } catch (error) {
    console.error("STMemoryBooks: Error creating memory:", error);

    // Determine if we should retry
    const shouldRetry = retryCount < maxRetries && isRetryableError(error);

    if (shouldRetry) {
      // Show retry notification and attempt again
      toastr.warning(
        __st_t_tag`Memory creation failed (attempt ${retryCount + 1}). Retrying in ${Math.round(MEMORY_GENERATION.RETRY_DELAY_MS / 1000)} seconds...`,
        "STMemoryBooks",
        {
          timeOut: 3000,
        },
      );

      // Wait before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, MEMORY_GENERATION.RETRY_DELAY_MS),
      );

      // Recursive retry
      return await executeMemoryGeneration(
        sceneData,
        lorebookValidation,
        effectiveSettings,
        retryCount + 1,
      );
    }

    // No more retries or non-retryable error - show final error
    const retryMsg =
      retryCount > 0 ? ` (failed after ${retryCount + 1} attempts)` : "";
    const codeTag = error && error.code ? ` [${error.code}]` : "";

    // Provide specific error messages for different types of failures
    if (error.name === "TokenWarningError") {
      toastr.error(
        __st_t_tag`Scene is too large (${error.tokenCount} tokens). Try selecting a smaller range${retryMsg}.`,
        "STMemoryBooks",
        {
          timeOut: 8000,
        },
      );
    } else if (error.name === "AIResponseError") {
      try {
        toastr.clear(lastFailureToast);
      } catch (e) {}
      lastFailedAIError = error;
      lastFailureToast = toastr.error(
        __st_t_tag`AI failed to generate valid memory${codeTag}: ${error.message}${retryMsg}`,
        "STMemoryBooks",
        {
          timeOut: 0,
          extendedTimeOut: 0,
          closeButton: true,
          tapToDismiss: false,
          onclick: () => {
            try {
              showFailedAIResponsePopup(lastFailedAIError);
            } catch (e) {
              console.error(e);
            }
          },
        },
      );
    } else if (error.name === "InvalidProfileError") {
      toastr.error(
        __st_t_tag`Profile configuration error: ${error.message}${retryMsg}`,
        "STMemoryBooks",
        {
          timeOut: 8000,
        },
      );
    } else {
      toastr.error(
        __st_t_tag`Failed to create memory: ${error.message}${retryMsg}`,
        "STMemoryBooks",
      );
    }
  }
}

async function initiateMemoryCreation(selectedProfileIndex = null) {
  // Early validation checks (no flag set yet) - GROUP CHAT COMPATIBLE
  const context = getCurrentMemoryBooksContext();

  // For single character chats, check character data
  if (!context.isGroupChat) {
    if (!characters || characters.length === 0 || !characters[this_chid]) {
      toastr.error(
        translate(
          "SillyTavern is still loading character data, please wait a few seconds and try again.",
          "STMemoryBooks_LoadingCharacterData",
        ),
        "STMemoryBooks",
      );
      return;
    }
  }
  // For group chats, check that we have group data
  else {
    if (!context.groupId || !context.groupName) {
      toastr.error(
        translate(
          "Group chat data not available, please wait a few seconds and try again.",
          "STMemoryBooks_GroupChatDataUnavailable",
        ),
        "STMemoryBooks",
      );
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
      console.error("STMemoryBooks: No scene selected for memory initiation");
      toastr.error(
        translate("No scene selected", "STMemoryBooks_NoSceneSelected"),
        "STMemoryBooks",
      );
      isProcessingMemory = false;
      return;
    }

    const lorebookValidation = await validateLorebook();
    if (!lorebookValidation.valid) {
      console.error(
        "STMemoryBooks: Lorebook validation failed:",
        lorebookValidation.error,
      );
      toastr.error(
        translate(
          lorebookValidation.error,
          "STMemoryBooks_LorebookValidationError",
        ),
        "STMemoryBooks",
      );
      isProcessingMemory = false;
      return;
    }

    const allMemories = identifyMemoryEntries(lorebookValidation.data);
    const newStart = sceneData.sceneStart;
    const newEnd = sceneData.sceneEnd;

    if (!settings.moduleSettings.allowSceneOverlap) {
      for (const mem of allMemories) {
        const existingRange = getRangeFromMemoryEntry(mem.entry);

        if (
          existingRange &&
          existingRange.start !== null &&
          existingRange.end !== null
        ) {
          const s = Number(existingRange.start);
          const e = Number(existingRange.end);
          const ns = Number(newStart);
          const ne = Number(newEnd);
          // Detailed overlap diagnostics
          console.debug(
            `STMemoryBooks: OverlapCheck new=[${ns}-${ne}] existing="${mem.title}" [${s}-${e}] cond1(ns<=e)=${ns <= e} cond2(ne>=s)=${ne >= s}`,
          );
          if (ns <= e && ne >= s) {
            console.error(
              `STMemoryBooks: Scene overlap detected with memory: ${mem.title} [${s}-${e}] vs new [${ns}-${ne}]`,
            );
            toastr.error(
              __st_t_tag`Scene overlaps with existing memory: "${mem.title}" (messages ${s}-${e})`,
              "STMemoryBooks",
            );
            isProcessingMemory = false;
            return;
          }
        }
      }
    }

    const effectiveSettings = await showAndGetMemorySettings(
      sceneData,
      lorebookValidation,
      selectedProfileIndex,
    );
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
    await executeMemoryGeneration(
      sceneData,
      lorebookValidation,
      effectiveSettings,
    );
  } catch (error) {
    console.error(
      "STMemoryBooks: Critical error during memory initiation:",
      error,
    );
    toastr.error(
      __st_t_tag`An unexpected error occurred: ${error.message}`,
      "STMemoryBooks",
    );
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
    return "all";
  } else if (moduleSettings.autoHideLastMemory) {
    return "last";
  } else {
    return "none";
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
  const modeBadge = document.querySelector("#stmb-mode-badge");
  if (modeBadge) {
    modeBadge.textContent = isManualMode
      ? translate("Manual", "STMemoryBooks_Manual")
      : translate("Automatic (Chat-bound)", "STMemoryBooks_AutomaticChatBound");
  }

  // Update active lorebook display
  const activeLorebookSpan = document.querySelector("#stmb-active-lorebook");
  if (activeLorebookSpan) {
    const currentLorebook = isManualMode
      ? stmbData.manualLorebook
      : chat_metadata?.[METADATA_KEY];

    activeLorebookSpan.textContent =
      currentLorebook ||
      translate("None selected", "STMemoryBooks_NoneSelected");
    activeLorebookSpan.className = currentLorebook ? "" : "opacity50p";
  }

  // Manual lorebook buttons are now handled by populateInlineButtons()

  // Show/hide manual controls and automatic info sections based on mode
  const manualControls = document.querySelector("#stmb-manual-controls");
  if (manualControls) {
    manualControls.style.display = isManualMode ? "block" : "none";
  }

  const automaticInfo = document.querySelector("#stmb-automatic-info");
  if (automaticInfo) {
    automaticInfo.style.display = isManualMode ? "none" : "block";

    // Update automatic mode info text
    const infoText = automaticInfo.querySelector("small");
    if (infoText) {
      const chatBoundLorebook = chat_metadata?.[METADATA_KEY];
      infoText.innerHTML = chatBoundLorebook
        ? __st_t_tag`Using chat-bound lorebook "<strong>${chatBoundLorebook}</strong>"`
        : translate(
            "No chat-bound lorebook. Memories will require lorebook selection.",
            "STMemoryBooks_NoChatBoundLorebook",
          );
    }
  }

  // Mutual exclusion: Enable/disable checkboxes based on each other's state
  const autoCreateCheckbox = document.querySelector(
    "#stmb-auto-create-lorebook",
  );
  const manualModeCheckbox = document.querySelector(
    "#stmb-manual-mode-enabled",
  );
  const nameTemplateInput = document.querySelector(
    "#stmb-lorebook-name-template",
  );

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
  const manualLorebookContainer = currentPopupInstance.content.querySelector(
    "#stmb-manual-lorebook-buttons",
  );
  const profileButtonsContainer = currentPopupInstance.content.querySelector(
    "#stmb-profile-buttons",
  );
  const extraFunctionContainer = currentPopupInstance.content.querySelector(
    "#stmb-extra-function-buttons",
  );

  // Populate manual lorebook buttons if container exists and manual mode is enabled
  if (manualLorebookContainer && settings.moduleSettings.manualModeEnabled) {
    const hasManualLorebook = stmbData.manualLorebook ?? null;

    const manualLorebookButtons = [
      {
        text:
          `📕 ${hasManualLorebook ? translate("Change", "STMemoryBooks_ChangeManualLorebook") : translate("Select", "STMemoryBooks_SelectManualLorebook")} ` +
          translate("Manual Lorebook", "STMemoryBooks_ManualLorebook"),
        id: "stmb-select-manual-lorebook",
        action: async () => {
          try {
            // Use the dedicated selection popup that always shows options
            const selectedLorebook = await showLorebookSelectionPopup(
              hasManualLorebook ? stmbData.manualLorebook : null,
            );
            if (selectedLorebook) {
              // Refresh the popup content to reflect the new selection
              refreshPopupContent();
            }
          } catch (error) {
            console.error(
              "STMemoryBooks: Error selecting manual lorebook:",
              error,
            );
            toastr.error(
              translate(
                "Failed to select manual lorebook",
                "STMemoryBooks_FailedToSelectManualLorebook",
              ),
              "STMemoryBooks",
            );
          }
        },
      },
    ];

    // Add clear button if manual lorebook is set
    if (hasManualLorebook) {
      manualLorebookButtons.push({
        text:
          "❌ " +
          translate(
            "Clear Manual Lorebook",
            "STMemoryBooks_ClearManualLorebook",
          ),
        id: "stmb-clear-manual-lorebook",
        action: () => {
          try {
            const stmbData = getSceneMarkers() || {};
            delete stmbData.manualLorebook;
            saveMetadataForCurrentContext();

            // Refresh the popup content
            refreshPopupContent();
            toastr.success(
              translate(
                "Manual lorebook cleared",
                "STMemoryBooks_ManualLorebookCleared",
              ),
              "STMemoryBooks",
            );
          } catch (error) {
            console.error(
              "STMemoryBooks: Error clearing manual lorebook:",
              error,
            );
            toastr.error(
              translate(
                "Failed to clear manual lorebook",
                "STMemoryBooks_FailedToClearManualLorebook",
              ),
              "STMemoryBooks",
            );
          }
        },
      });
    }

    // Clear container and populate with buttons
    manualLorebookContainer.innerHTML = "";
    manualLorebookButtons.forEach((buttonConfig) => {
      const button = document.createElement("div");
      button.className = "menu_button interactable whitespacenowrap";
      button.id = buttonConfig.id;
      button.textContent = buttonConfig.text;
      button.addEventListener("click", buttonConfig.action);
      manualLorebookContainer.appendChild(button);
    });
  }

  if (!profileButtonsContainer || !extraFunctionContainer) return;

  // Create profile action buttons
  const profileButtons = [
    {
      text: "⭐ " + translate("Set as Default", "STMemoryBooks_SetAsDefault"),
      id: "stmb-set-default-profile",
      action: () => {
        const profileSelect = currentPopupInstance?.dlg?.querySelector(
          "#stmb-profile-select",
        );
        if (!profileSelect) return;

        const selectedIndex = parseInt(profileSelect.value);
        if (selectedIndex === settings.defaultProfile) {
          return;
        }

        settings.defaultProfile = selectedIndex;
        saveSettingsDebounced();
        const displayName =
          settings.profiles[selectedIndex]?.connection?.api === "current_st"
            ? translate(
                "Current SillyTavern Settings",
                "STMemoryBooks_Profile_CurrentST",
              )
            : settings.profiles[selectedIndex].name;
        toastr.success(
          __st_t_tag`"${displayName}" is now the default profile.`,
          "STMemoryBooks",
        );
        refreshPopupContent();
      },
    },
    {
      text: "✏️ " + translate("Edit Profile", "STMemoryBooks_EditProfile"),
      id: "stmb-edit-profile",
      action: async () => {
        try {
          const profileSelect = currentPopupInstance?.dlg?.querySelector(
            "#stmb-profile-select",
          );
          if (!profileSelect) return;

          const selectedIndex = parseInt(profileSelect.value);
          const selectedProfile = settings.profiles[selectedIndex];

          // Migrate legacy dynamic flag to provider-based current_st and allow editing of non-connection fields
          if (selectedProfile.useDynamicSTSettings) {
            selectedProfile.connection = selectedProfile.connection || {};
            selectedProfile.connection.api = "current_st";
            delete selectedProfile.useDynamicSTSettings;
            saveSettingsDebounced();
          }

          await editProfile(settings, selectedIndex, refreshPopupContent);
        } catch (error) {
          console.error(`${MODULE_NAME}: Error in edit profile:`, error);
          toastr.error(
            translate(
              "Failed to edit profile",
              "STMemoryBooks_FailedToEditProfile",
            ),
            "STMemoryBooks",
          );
        }
      },
    },
    {
      text: "➕ " + translate("New Profile", "STMemoryBooks_NewProfile"),
      id: "stmb-new-profile",
      action: async () => {
        try {
          await newProfile(settings, refreshPopupContent);
        } catch (error) {
          console.error(`${MODULE_NAME}: Error in new profile:`, error);
          toastr.error(
            translate(
              "Failed to create profile",
              "STMemoryBooks_FailedToCreateProfile",
            ),
            "STMemoryBooks",
          );
        }
      },
    },
    {
      text: "🗑️ " + translate("Delete Profile", "STMemoryBooks_DeleteProfile"),
      id: "stmb-delete-profile",
      action: async () => {
        try {
          const profileSelect = currentPopupInstance?.dlg?.querySelector(
            "#stmb-profile-select",
          );
          if (!profileSelect) return;

          const selectedIndex = parseInt(profileSelect.value);
          await deleteProfile(settings, selectedIndex, refreshPopupContent);
        } catch (error) {
          console.error(`${MODULE_NAME}: Error in delete profile:`, error);
          toastr.error(
            translate(
              "Failed to delete profile",
              "STMemoryBooks_FailedToDeleteProfile",
            ),
            "STMemoryBooks",
          );
        }
      },
    },
  ];

  // Create additional function buttons
  const extraFunctionButtons = [
    {
      text:
        "📤 " + translate("Export Profiles", "STMemoryBooks_ExportProfiles"),
      id: "stmb-export-profiles",
      action: () => {
        try {
          exportProfiles(settings);
        } catch (error) {
          console.error(`${MODULE_NAME}: Error in export profiles:`, error);
          toastr.error(
            translate(
              "Failed to export profiles",
              "STMemoryBooks_FailedToExportProfiles",
            ),
            "STMemoryBooks",
          );
        }
      },
    },
    {
      text:
        "📥 " + translate("Import Profiles", "STMemoryBooks_ImportProfiles"),
      id: "stmb-import-profiles",
      action: () => {
        const importFile =
          currentPopupInstance?.dlg?.querySelector("#stmb-import-file");
        if (importFile) {
          importFile.click();
        }
      },
    },
    {
      text:
        "🧩 " +
        translate(
          "Summary Prompt Manager",
          "STMemoryBooks_SummaryPromptManager",
        ),
      id: "stmb-prompt-manager",
      action: async () => {
        try {
          await showPromptManagerPopup();
        } catch (error) {
          console.error(`${MODULE_NAME}: Error opening prompt manager:`, error);
          toastr.error(
            translate(
              "Failed to open Summary Prompt Manager",
              "STMemoryBooks_FailedToOpenSummaryPromptManager",
            ),
            "STMemoryBooks",
          );
        }
      },
    },
    {
      text:
        "🧱 " +
        translate("Arc Prompt Manager", "STMemoryBooks_ArcPromptManager"),
      id: "stmb-arc-prompt-manager",
      action: async () => {
        try {
          await showArcPromptManagerPopup();
        } catch (error) {
          console.error(
            `${MODULE_NAME}: Error opening Arc Prompt Manager:`,
            error,
          );
          toastr.error(
            translate(
              "Failed to open Arc Prompt Manager",
              "STMemoryBooks_FailedToOpenArcPromptManager",
            ),
            "STMemoryBooks",
          );
        }
      },
    },
    {
      text: "🎡 " + translate("Side Prompts", "STMemoryBooks_SidePrompts"),
      id: "stmb-side-prompts",
      action: async () => {
        try {
          await showSidePromptsPopup();
        } catch (error) {
          console.error(`${MODULE_NAME}: Error opening Side Prompts:`, error);
          toastr.error(
            translate(
              "Failed to open Side Prompts",
              "STMemoryBooks_FailedToOpenSidePrompts",
            ),
            "STMemoryBooks",
          );
        }
      },
    },
  ];

  // Clear containers and populate with buttons
  profileButtonsContainer.innerHTML = "";
  extraFunctionContainer.innerHTML = "";

  // Add profile action buttons
  profileButtons.forEach((buttonConfig) => {
    const button = document.createElement("div");
    button.className = "menu_button interactable whitespacenowrap";
    button.id = buttonConfig.id;
    button.textContent = buttonConfig.text;
    button.addEventListener("click", buttonConfig.action);
    profileButtonsContainer.appendChild(button);
  });

  // Add Extra Function Buttons buttons
  extraFunctionButtons.forEach((buttonConfig) => {
    const button = document.createElement("div");
    button.className = "menu_button interactable whitespacenowrap";
    button.id = buttonConfig.id;
    button.textContent = buttonConfig.text;
    button.addEventListener("click", buttonConfig.action);
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
    await SummaryPromptManager.firstRunInitIfMissing(settings);

    // Get list of presets
    const presets = await SummaryPromptManager.listPresets();

    // Build the popup content
    let content =
      '<h3 data-i18n="STMemoryBooks_PromptManager_Title">🧩 Summary Prompt Manager</h3>';
    content += '<div class="world_entry_form_control">';
    content +=
      '<p data-i18n="STMemoryBooks_PromptManager_Desc">Manage your summary generation prompts. All presets are editable.</p>';
    content += "</div>";

    // Search/filter box
    content += '<div class="world_entry_form_control">';
    content +=
      '<input type="text" id="stmb-prompt-search" class="text_pole" placeholder="Search presets..." aria-label="Search presets" data-i18n="[placeholder]STMemoryBooks_PromptManager_Search;[aria-label]STMemoryBooks_PromptManager_Search" />';
    content += "</div>";

    // Preset list container (table content rendered via Handlebars after popup creation)
    content +=
      '<div id="stmb-preset-list" class="padding10 marginBot10" style="max-height: 400px; overflow-y: auto;"></div>';

    // Action buttons
    content +=
      '<div class="buttons_block justifyCenter gap10px whitespacenowrap">';
    content +=
      '<button id="stmb-pm-new" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_PromptManager_New">➕ New Preset</button>';
    content +=
      '<button id="stmb-pm-export" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_PromptManager_Export">📤 Export JSON</button>';
    content +=
      '<button id="stmb-pm-import" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_PromptManager_Import">📥 Import JSON</button>';
    content +=
      '<button id="stmb-pm-recreate-builtins" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_PromptManager_RecreateBuiltins">♻️ Recreate Built-in Prompts</button>';
    content +=
      '<button id="stmb-pm-apply" class="menu_button whitespacenowrap" disabled data-i18n="STMemoryBooks_PromptManager_ApplyToProfile">✅ Apply to Selected Profile</button>';
    content += "</div>";

    // Hint re: prompting
    content += `<small>${translate('💡 When creating a new prompt, copy one of the other built-in prompts and then amend it. Don\'t change the "respond with JSON" instructions, 📕Memory Books uses that to process the returned result from the AI.', "STMemoryBooks_PromptManager_Hint")}</small>`;

    // Hidden file input for import
    content +=
      '<input type="file" id="stmb-pm-import-file" accept=".json" style="display: none;" />';

    const popup = new Popup(content, POPUP_TYPE.TEXT, "", {
      wide: true,
      large: true,
      allowVerticalScrolling: true,
      okButton: false,
      cancelButton: translate("Close", "STMemoryBooks_Close"),
    });

    // Attach handlers before showing the popup to ensure interactivity
    setupPromptManagerEventHandlers(popup);

    // Initial render of presets table using Handlebars
    const listEl = popup.dlg?.querySelector("#stmb-preset-list");
    if (listEl) {
      const items = (presets || []).map((p) => ({
        key: String(p.key || ""),
        displayName: String(p.displayName || ""),
      }));
      listEl.innerHTML = DOMPurify.sanitize(
        summaryPromptsTableTemplate({ items }),
      );
    }

    await popup.show();
  } catch (error) {
    console.error("STMemoryBooks: Error showing prompt manager:", error);
    toastr.error(
      translate(
        "Failed to open Summary Prompt Manager",
        "STMemoryBooks_FailedToOpenSummaryPromptManager",
      ),
      "STMemoryBooks",
    );
  }
}

/**
 * Setup event handlers for the prompt manager popup
 */

function setupPromptManagerEventHandlers(popup) {
  const dlg = popup.dlg;
  let selectedPresetKey = null;

  // Row selection and inline actions
  dlg.addEventListener("click", async (e) => {
    // Handle inline action icon buttons first
    const actionBtn = e.target.closest(".stmb-action");
    if (actionBtn) {
      e.preventDefault();
      e.stopPropagation();
      const row = actionBtn.closest("tr[data-preset-key]");
      const key = row?.dataset.presetKey;
      if (!key) return;

      // Keep row visually selected using ST theme colors
      dlg.querySelectorAll("tr[data-preset-key]").forEach((r) => {
        r.classList.remove("ui-state-active");
        r.style.backgroundColor = "";
        r.style.border = "";
      });
      if (row) {
        row.style.backgroundColor = "var(--cobalt30a)";
        row.style.border = "";
        selectedPresetKey = key;
      }
      const applyBtn = dlg.querySelector("#stmb-pm-apply");
      if (applyBtn) applyBtn.disabled = false;

      if (actionBtn.classList.contains("stmb-action-edit")) {
        await editPreset(popup, key);
      } else if (actionBtn.classList.contains("stmb-action-duplicate")) {
        await duplicatePreset(popup, key);
      } else if (actionBtn.classList.contains("stmb-action-delete")) {
        await deletePreset(popup, key);
      }
      return;
    }

    // Handle row selection
    const row = e.target.closest("tr[data-preset-key]");
    if (row) {
      dlg.querySelectorAll("tr[data-preset-key]").forEach((r) => {
        r.classList.remove("ui-state-active");
        r.style.backgroundColor = "";
        r.style.border = "";
      });

      row.style.backgroundColor = "var(--cobalt30a)";
      row.style.border = "";
      selectedPresetKey = row.dataset.presetKey;

      const applyBtn = dlg.querySelector("#stmb-pm-apply");
      if (applyBtn) applyBtn.disabled = false;
    }
  });

  // Search functionality
  const searchInput = dlg.querySelector("#stmb-prompt-search");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      dlg.querySelectorAll("tr[data-preset-key]").forEach((row) => {
        const displayName = row
          .querySelector("td:first-child")
          .textContent.toLowerCase();
        row.style.display = displayName.includes(searchTerm) ? "" : "none";
      });
    });
  }

  // Button handlers
  dlg.querySelector("#stmb-pm-new")?.addEventListener("click", async () => {
    await createNewPreset(popup);
  });

  dlg.querySelector("#stmb-pm-edit")?.addEventListener("click", async () => {
    if (selectedPresetKey) {
      await editPreset(popup, selectedPresetKey);
    }
  });

  dlg
    .querySelector("#stmb-pm-duplicate")
    ?.addEventListener("click", async () => {
      if (selectedPresetKey) {
        await duplicatePreset(popup, selectedPresetKey);
      }
    });

  dlg.querySelector("#stmb-pm-delete")?.addEventListener("click", async () => {
    if (selectedPresetKey) {
      await deletePreset(popup, selectedPresetKey);
    }
  });

  dlg.querySelector("#stmb-pm-export")?.addEventListener("click", async () => {
    await exportPrompts();
  });

  dlg.querySelector("#stmb-pm-import")?.addEventListener("click", () => {
    dlg.querySelector("#stmb-pm-import-file")?.click();
  });

  dlg
    .querySelector("#stmb-pm-import-file")
    ?.addEventListener("change", async (e) => {
      await importPrompts(e, popup);
    });

  // Recreate built-in prompts (destructive; no preservation)
  dlg
    .querySelector("#stmb-pm-recreate-builtins")
    ?.addEventListener("click", async () => {
      try {
        const content = `
                <h3>${escapeHtml(translate("Recreate Built-in Prompts", "STMemoryBooks_RecreateBuiltinsTitle"))}</h3>
                <div class="info-block warning">
                    ${escapeHtml(
                      translate(
                        "This will remove overrides for all built‑in presets (summary, summarize, synopsis, sumup, minimal, northgate, aelemar, comprehensive). Any customizations to these built-ins will be lost. After this, built-ins will follow the current app locale.",
                        "STMemoryBooks_RecreateBuiltinsWarning",
                      ),
                    )}
                </div>
                <p class="opacity70p">${escapeHtml(translate("This does not affect your other custom presets.", "STMemoryBooks_RecreateBuiltinsDoesNotAffectCustom"))}</p>
            `;
        const confirmPopup = new Popup(content, POPUP_TYPE.CONFIRM, "", {
          okButton: translate(
            "Overwrite",
            "STMemoryBooks_RecreateBuiltinsOverwrite",
          ),
          cancelButton: translate("Cancel", "STMemoryBooks_Cancel"),
        });
        const res = await confirmPopup.show();
        if (res === POPUP_RESULT.AFFIRMATIVE) {
          const result =
            await SummaryPromptManager.recreateBuiltInPrompts("overwrite");
          // Notify other UIs about preset changes
          try {
            window.dispatchEvent(new CustomEvent("stmb-presets-updated"));
          } catch (e) {
            /* noop */
          }
          toastr.success(
            __st_t_tag`Removed ${result?.removed || 0} built-in overrides`,
            translate("STMemoryBooks", "index.toast.title"),
          );
          // Refresh the manager popup
          popup.completeAffirmative();
          await showPromptManagerPopup();
        }
      } catch (error) {
        console.error(
          "STMemoryBooks: Error recreating built-in prompts:",
          error,
        );
        toastr.error(
          translate(
            "Failed to recreate built-in prompts",
            "STMemoryBooks_FailedToRecreateBuiltins",
          ),
          translate("STMemoryBooks", "index.toast.title"),
        );
      }
    });

  // Apply selected preset to current profile
  dlg.querySelector("#stmb-pm-apply")?.addEventListener("click", async () => {
    if (!selectedPresetKey) {
      toastr.error(
        translate("Select a preset first", "STMemoryBooks_SelectPresetFirst"),
        "STMemoryBooks",
      );
      return;
    }
    const settings = extension_settings?.STMemoryBooks;
    if (
      !settings ||
      !Array.isArray(settings.profiles) ||
      settings.profiles.length === 0
    ) {
      toastr.error(
        translate("No profiles available", "STMemoryBooks_NoProfilesAvailable"),
        "STMemoryBooks",
      );
      return;
    }

    // Determine selected profile index from the main settings popup if available
    let selectedIndex = settings.defaultProfile || 0;
    if (currentPopupInstance?.dlg) {
      const profileSelect = currentPopupInstance.dlg.querySelector(
        "#stmb-profile-select",
      );
      if (profileSelect) {
        const parsed = parseInt(profileSelect.value);
        if (!isNaN(parsed)) selectedIndex = parsed;
      }
    }

    const prof = settings.profiles[selectedIndex];
    if (!prof) {
      toastr.error(
        translate(
          "Selected profile not found",
          "STMemoryBooks_SelectedProfileNotFound",
        ),
        "STMemoryBooks",
      );
      return;
    }

    // If the profile has a custom prompt, ask to clear it so the preset takes effect
    if (prof.prompt && prof.prompt.trim()) {
      const confirmPopup = new Popup(
        `<h3 data-i18n="STMemoryBooks_ClearCustomPromptTitle">Clear Custom Prompt?</h3><p data-i18n="STMemoryBooks_ClearCustomPromptDesc">This profile has a custom prompt. Clear it so the selected preset is used?</p>`,
        POPUP_TYPE.CONFIRM,
        "",
        {
          okButton: translate("Clear and Apply", "STMemoryBooks_ClearAndApply"),
          cancelButton: translate("Cancel", "STMemoryBooks_Cancel"),
        },
      );
      const res = await confirmPopup.show();
      if (res === POPUP_RESULT.AFFIRMATIVE) {
        prof.prompt = "";
      } else {
        return;
      }
    }

    // Apply preset and save
    prof.preset = selectedPresetKey;
    saveSettingsDebounced();
    toastr.success(
      translate(
        "Preset applied to profile",
        "STMemoryBooks_PresetAppliedToProfile",
      ),
      "STMemoryBooks",
    );

    // Refresh main settings popup if open
    if (currentPopupInstance?.dlg) {
      try {
        refreshPopupContent();
      } catch (e) {
        /* noop */
      }
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

  const editPopup = new Popup(content, POPUP_TYPE.TEXT, "", {
    okButton: translate("Create", "STMemoryBooks_Create"),
    cancelButton: translate("Cancel", "STMemoryBooks_Cancel"),
  });

  const result = await editPopup.show();

  if (result === POPUP_RESULT.AFFIRMATIVE) {
    const displayName = editPopup.dlg
      .querySelector("#stmb-pm-new-display-name")
      .value.trim();
    const prompt = editPopup.dlg
      .querySelector("#stmb-pm-new-prompt")
      .value.trim();

    if (!prompt) {
      toastr.error(
        translate(
          "Prompt cannot be empty",
          "STMemoryBooks_PromptCannotBeEmpty",
        ),
        "STMemoryBooks",
      );
      return;
    }

    try {
      await SummaryPromptManager.upsertPreset(
        null,
        prompt,
        displayName || null,
      );
      toastr.success(
        translate(
          "Preset created successfully",
          "STMemoryBooks_PresetCreatedSuccessfully",
        ),
        "STMemoryBooks",
      );
      // Notify other UIs about preset changes
      window.dispatchEvent(new CustomEvent("stmb-presets-updated"));

      // Refresh the manager popup
      popup.completeAffirmative();
      await showPromptManagerPopup();
    } catch (error) {
      console.error("STMemoryBooks: Error creating preset:", error);
      toastr.error(
        translate(
          "Failed to create preset",
          "STMemoryBooks_FailedToCreatePreset",
        ),
        "STMemoryBooks",
      );
    }
  }
}

/**
 * Edit an existing preset
 */
async function editPreset(popup, presetKey) {
  try {
    const displayName = await SummaryPromptManager.getDisplayName(presetKey);
    const prompt = await SummaryPromptManager.getPrompt(presetKey);

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

    const editPopup = new Popup(content, POPUP_TYPE.TEXT, "", {
      okButton: translate("Save", "STMemoryBooks_Save"),
      cancelButton: translate("Cancel", "STMemoryBooks_Cancel"),
    });

    const result = await editPopup.show();

    if (result === POPUP_RESULT.AFFIRMATIVE) {
      const newDisplayName = editPopup.dlg
        .querySelector("#stmb-pm-edit-display-name")
        .value.trim();
      const newPrompt = editPopup.dlg
        .querySelector("#stmb-pm-edit-prompt")
        .value.trim();

      if (!newPrompt) {
        toastr.error(
          translate(
            "Prompt cannot be empty",
            "STMemoryBooks_PromptCannotBeEmpty",
          ),
          "STMemoryBooks",
        );
        return;
      }

      await SummaryPromptManager.upsertPreset(
        presetKey,
        newPrompt,
        newDisplayName || null,
      );
      toastr.success(
        translate(
          "Preset updated successfully",
          "STMemoryBooks_PresetUpdatedSuccessfully",
        ),
        "STMemoryBooks",
      );
      // Notify other UIs about preset changes
      window.dispatchEvent(new CustomEvent("stmb-presets-updated"));

      // Refresh the manager popup
      popup.completeAffirmative();
      await showPromptManagerPopup();
    }
  } catch (error) {
    console.error("STMemoryBooks: Error editing preset:", error);
    toastr.error(
      translate("Failed to edit preset", "STMemoryBooks_FailedToEditPreset"),
      "STMemoryBooks",
    );
  }
}

/**
 * Duplicate a preset
 */
async function duplicatePreset(popup, presetKey) {
  try {
    const newKey = await SummaryPromptManager.duplicatePreset(presetKey);
    toastr.success(
      translate(
        "Preset duplicated successfully",
        "STMemoryBooks_PresetDuplicatedSuccessfully",
      ),
      "STMemoryBooks",
    );
    // Notify other UIs about preset changes
    window.dispatchEvent(new CustomEvent("stmb-presets-updated"));

    // Refresh the manager popup
    popup.completeAffirmative();
    await showPromptManagerPopup();
  } catch (error) {
    console.error("STMemoryBooks: Error duplicating preset:", error);
    toastr.error(
      translate(
        "Failed to duplicate preset",
        "STMemoryBooks_FailedToDuplicatePreset",
      ),
      "STMemoryBooks",
    );
  }
}

/**
 * Delete a preset
 */
async function deletePreset(popup, presetKey) {
  const displayName = await SummaryPromptManager.getDisplayName(presetKey);

  const confirmPopup = new Popup(
    `<h3 data-i18n="STMemoryBooks_DeletePresetTitle">Delete Preset</h3><p>${escapeHtml(translate('Are you sure you want to delete "{{name}}"?', "STMemoryBooks_DeletePresetConfirm", { name: displayName }))}</p>`,
    POPUP_TYPE.CONFIRM,
    "",
    {
      okButton: translate("Delete", "STMemoryBooks_Delete"),
      cancelButton: translate("Cancel", "STMemoryBooks_Cancel"),
    },
  );
  try {
    applyLocale(confirmPopup.dlg);
  } catch (e) {
    /* no-op */
  }

  const result = await confirmPopup.show();

  if (result === POPUP_RESULT.AFFIRMATIVE) {
    try {
      await SummaryPromptManager.removePreset(presetKey);
      toastr.success(
        translate(
          "Preset deleted successfully",
          "STMemoryBooks_PresetDeletedSuccessfully",
        ),
        "STMemoryBooks",
      );
      // Notify other UIs about preset changes
      window.dispatchEvent(new CustomEvent("stmb-presets-updated"));

      // Refresh the manager popup
      popup.completeAffirmative();
      await showPromptManagerPopup();
    } catch (error) {
      console.error("STMemoryBooks: Error deleting preset:", error);
      toastr.error(
        translate(
          "Failed to delete preset",
          "STMemoryBooks_FailedToDeletePreset",
        ),
        "STMemoryBooks",
      );
    }
  }
}

/**
 * Export prompts to JSON
 */
async function exportPrompts() {
  try {
    const json = await SummaryPromptManager.exportToJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stmb-summary-prompts.json";
    a.click();
    URL.revokeObjectURL(url);
    toastr.success(
      translate(
        "Prompts exported successfully",
        "STMemoryBooks_PromptsExportedSuccessfully",
      ),
      "STMemoryBooks",
    );
  } catch (error) {
    console.error("STMemoryBooks: Error exporting prompts:", error);
    toastr.error(
      translate(
        "Failed to export prompts",
        "STMemoryBooks_FailedToExportPrompts",
      ),
      "STMemoryBooks",
    );
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
    await SummaryPromptManager.importFromJSON(text);
    toastr.success(
      translate(
        "Prompts imported successfully",
        "STMemoryBooks_PromptsImportedSuccessfully",
      ),
      "STMemoryBooks",
    );
    // Notify other UIs about preset changes
    window.dispatchEvent(new CustomEvent("stmb-presets-updated"));

    // Refresh the manager popup
    popup.completeAffirmative();
    await showPromptManagerPopup();
  } catch (error) {
    console.error("STMemoryBooks: Error importing prompts:", error);
    toastr.error(
      __st_t_tag`Failed to import prompts: ${error.message}`,
      "STMemoryBooks",
    );
  }
}

/**
 * Show Arc Prompt Manager popup
 */
async function showArcPromptManagerPopup() {
  try {
    // Initialize arc prompts store
    const settings = extension_settings.STMemoryBooks;
    await ArcPrompts.firstRunInitIfMissing(settings);

    // Get list of arc presets
    const presets = await ArcPrompts.listPresets();

    // Build the popup content
    let content =
      '<h3 data-i18n="STMemoryBooks_ArcPromptManager_Title">🧱 Arc Prompt Manager</h3>';
    content += '<div class="world_entry_form_control">';
    content +=
      '<p data-i18n="STMemoryBooks_ArcPromptManager_Desc">Manage your Arc Analysis prompts. All presets are editable.</p>';
    content += "</div>";

    // Search/filter box
    content += '<div class="world_entry_form_control">';
    content +=
      '<input type="text" id="stmb-apm-search" class="text_pole" placeholder="Search arc presets..." aria-label="Search arc presets" data-i18n="[placeholder]STMemoryBooks_ArcPromptManager_Search;[aria-label]STMemoryBooks_ArcPromptManager_Search" />';
    content += "</div>";

    // Preset list container
    content +=
      '<div id="stmb-apm-list" class="padding10 marginBot10" style="max-height: 400px; overflow-y: auto;"></div>';

    // Action buttons
    content +=
      '<div class="buttons_block justifyCenter gap10px whitespacenowrap">';
    content +=
      '<button id="stmb-apm-new" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_ArcPromptManager_New">➕ New Arc Preset</button>';
    content +=
      '<button id="stmb-apm-export" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_ArcPromptManager_Export">📤 Export JSON</button>';
    content +=
      '<button id="stmb-apm-import" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_ArcPromptManager_Import">📥 Import JSON</button>';
    content +=
      '<button id="stmb-apm-recreate-builtins" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_ArcPromptManager_RecreateBuiltins">♻️ Recreate Built-in Arc Prompts</button>';
    content += "</div>";

    // Hidden file input for import
    content +=
      '<input type="file" id="stmb-apm-import-file" accept=".json" style="display: none;" />';

    const popup = new Popup(content, POPUP_TYPE.TEXT, "", {
      wide: true,
      large: true,
      allowVerticalScrolling: true,
      okButton: false,
      cancelButton: translate("Close", "STMemoryBooks_Close"),
    });

    // Attach handlers before showing the popup
    setupArcPromptManagerEventHandlers(popup);

    // Initial render of presets table using existing template
    const listEl = popup.dlg?.querySelector("#stmb-apm-list");
    if (listEl) {
      const items = (presets || []).map((p) => ({
        key: String(p.key || ""),
        displayName: String(p.displayName || ""),
      }));
      listEl.innerHTML = DOMPurify.sanitize(
        summaryPromptsTableTemplate({ items }),
      );
    }

    await popup.show();
  } catch (error) {
    console.error("STMemoryBooks: Error showing Arc Prompt Manager:", error);
    toastr.error(
      translate(
        "Failed to open Arc Prompt Manager",
        "STMemoryBooks_FailedToOpenArcPromptManager",
      ),
      "STMemoryBooks",
    );
  }
}

/**
 * Setup event handlers for the Arc prompt manager popup
 */
function setupArcPromptManagerEventHandlers(popup) {
  const dlg = popup.dlg;
  let selectedPresetKey = null;

  // Row actions and selection
  dlg.addEventListener("click", async (e) => {
    const actionBtn = e.target.closest(".stmb-action");
    if (actionBtn) {
      e.preventDefault();
      e.stopPropagation();
      const row = actionBtn.closest("tr[data-preset-key]");
      const key = row?.dataset.presetKey;
      if (!key) return;

      dlg.querySelectorAll("tr[data-preset-key]").forEach((r) => {
        r.classList.remove("ui-state-active");
        r.style.backgroundColor = "";
        r.style.border = "";
      });
      if (row) {
        row.style.backgroundColor = "var(--cobalt30a)";
        row.style.border = "";
        selectedPresetKey = key;
      }

      if (actionBtn.classList.contains("stmb-action-edit")) {
        await editArcPreset(popup, key);
      } else if (actionBtn.classList.contains("stmb-action-duplicate")) {
        await duplicateArcPreset(popup, key);
      } else if (actionBtn.classList.contains("stmb-action-delete")) {
        await deleteArcPreset(popup, key);
      }
      return;
    }

    const row = e.target.closest("tr[data-preset-key]");
    if (row) {
      dlg.querySelectorAll("tr[data-preset-key]").forEach((r) => {
        r.classList.remove("ui-state-active");
        r.style.backgroundColor = "";
        r.style.border = "";
      });
      row.style.backgroundColor = "var(--cobalt30a)";
      row.style.border = "";
      selectedPresetKey = row.dataset.presetKey;
    }
  });

  // Search box
  dlg.querySelector("#stmb-apm-search")?.addEventListener("input", (e) => {
    const term = e.target.value.toLowerCase();
    dlg.querySelectorAll("tr[data-preset-key]").forEach((row) => {
      const displayName = row
        .querySelector("td:first-child")
        .textContent.toLowerCase();
      row.style.display = displayName.includes(term) ? "" : "none";
    });
  });

  // Buttons
  dlg.querySelector("#stmb-apm-new")?.addEventListener("click", async () => {
    await createNewArcPreset(popup);
  });
  dlg.querySelector("#stmb-apm-export")?.addEventListener("click", async () => {
    await exportArcPrompts();
  });
  dlg.querySelector("#stmb-apm-import")?.addEventListener("click", () => {
    dlg.querySelector("#stmb-apm-import-file")?.click();
  });
  dlg
    .querySelector("#stmb-apm-import-file")
    ?.addEventListener("change", async (e) => {
      await importArcPrompts(e, popup);
    });

  // Recreate built-ins (remove overrides for built-in keys)
  dlg
    .querySelector("#stmb-apm-recreate-builtins")
    ?.addEventListener("click", async () => {
      try {
        const content = `
                <h3>${escapeHtml(translate("Recreate Built-in Prompts", "STMemoryBooks_RecreateBuiltinsTitle"))}</h3>
                <div class="info-block warning">
                    ${escapeHtml(
                      translate(
                        "This will remove overrides for all built‑in presets (summary, summarize, synopsis, sumup, minimal, northgate, aelemar, comprehensive). Any customizations to these built-ins will be lost. After this, built-ins will follow the current app locale.",
                        "STMemoryBooks_RecreateBuiltinsWarning",
                      ),
                    )}
                </div>
                <p class="opacity70p">${escapeHtml(translate("This does not affect your other custom presets.", "STMemoryBooks_RecreateBuiltinsDoesNotAffectCustom"))}</p>
            `;
        const confirmPopup = new Popup(content, POPUP_TYPE.CONFIRM, "", {
          okButton: translate(
            "Overwrite",
            "STMemoryBooks_RecreateBuiltinsOverwrite",
          ),
          cancelButton: translate("Cancel", "STMemoryBooks_Cancel"),
        });
        const res = await confirmPopup.show();
        if (res === POPUP_RESULT.AFFIRMATIVE) {
          const result = await ArcPrompts.recreateBuiltInPrompts("overwrite");
          try {
            window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated"));
          } catch (e) {
            /* noop */
          }
          toastr.success(
            __st_t_tag`Removed ${result?.removed || 0} built-in overrides`,
            translate("STMemoryBooks", "index.toast.title"),
          );
          // Refresh the manager popup
          popup.completeAffirmative();
          await showArcPromptManagerPopup();
        }
      } catch (error) {
        console.error(
          "STMemoryBooks: Error recreating built-in arc prompts:",
          error,
        );
        toastr.error(
          translate(
            "Failed to recreate built-in prompts",
            "STMemoryBooks_FailedToRecreateBuiltins",
          ),
          translate("STMemoryBooks", "index.toast.title"),
        );
      }
    });
}

/**
 * Arc preset CRUD helpers
 */
async function createNewArcPreset(popup) {
  const content = `
        <h3 data-i18n="STMemoryBooks_CreateNewPresetTitle">Create New Preset</h3>
        <div class="world_entry_form_control">
            <label for="stmb-apm-new-display-name">
                <h4 data-i18n="STMemoryBooks_DisplayNameTitle">Display Name:</h4>
                <input type="text" id="stmb-apm-new-display-name" class="text_pole" data-i18n="[placeholder]STMemoryBooks_MyCustomPreset" placeholder="My Custom Preset" />
            </label>
        </div>
        <div class="world_entry_form_control">
            <label for="stmb-apm-new-prompt">
                <h4 data-i18n="STMemoryBooks_PromptTitle">Prompt:</h4>
                <i class="editor_maximize fa-solid fa-maximize right_menu_button" data-for="stmb-apm-new-prompt" title="Expand the editor" data-i18n="[title]STMemoryBooks_ExpandEditor"></i>
                <textarea id="stmb-apm-new-prompt" class="text_pole textarea_compact" rows="10" data-i18n="[placeholder]STMemoryBooks_EnterPromptPlaceholder" placeholder="Enter your prompt here..."></textarea>
            </label>
        </div>
    `;
  const editPopup = new Popup(content, POPUP_TYPE.TEXT, "", {
    okButton: translate("Create", "STMemoryBooks_Create"),
    cancelButton: translate("Cancel", "STMemoryBooks_Cancel"),
  });
  const result = await editPopup.show();
  if (result === POPUP_RESULT.AFFIRMATIVE) {
    const displayName = editPopup.dlg
      .querySelector("#stmb-apm-new-display-name")
      .value.trim();
    const prompt = editPopup.dlg
      .querySelector("#stmb-apm-new-prompt")
      .value.trim();
    if (!prompt) {
      toastr.error(
        translate(
          "Prompt cannot be empty",
          "STMemoryBooks_PromptCannotBeEmpty",
        ),
        "STMemoryBooks",
      );
      return;
    }
    try {
      await ArcPrompts.upsertPreset(null, prompt, displayName || null);
      toastr.success(
        translate(
          "Preset created successfully",
          "STMemoryBooks_PresetCreatedSuccessfully",
        ),
        "STMemoryBooks",
      );
      window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated"));
      popup.completeAffirmative();
      await showArcPromptManagerPopup();
    } catch (error) {
      console.error("STMemoryBooks: Error creating arc preset:", error);
      toastr.error(
        translate(
          "Failed to create preset",
          "STMemoryBooks_FailedToCreatePreset",
        ),
        "STMemoryBooks",
      );
    }
  }
}

async function editArcPreset(popup, presetKey) {
  try {
    const displayName = await ArcPrompts.getDisplayName(presetKey);
    const prompt = await ArcPrompts.getPrompt(presetKey);
    const content = `
            <h3 data-i18n="STMemoryBooks_EditPresetTitle">Edit Preset</h3>
            <div class="world_entry_form_control">
                <label for="stmb-apm-edit-display-name">
                    <h4 data-i18n="STMemoryBooks_DisplayNameTitle">Display Name:</h4>
                    <input type="text" id="stmb-apm-edit-display-name" class="text_pole" value="${escapeHtml(displayName)}" />
                </label>
            </div>
            <div class="world_entry_form_control">
                <label for="stmb-apm-edit-prompt">
                    <h4 data-i18n="STMemoryBooks_PromptTitle">Prompt:</h4>
                    <i class="editor_maximize fa-solid fa-maximize right_menu_button" data-for="stmb-apm-edit-prompt" title="Expand the editor" data-i18n="[title]STMemoryBooks_ExpandEditor"></i>
                    <textarea id="stmb-apm-edit-prompt" class="text_pole textarea_compact" rows="10">${escapeHtml(prompt)}</textarea>
                </label>
            </div>
        `;
    const editPopup = new Popup(content, POPUP_TYPE.TEXT, "", {
      okButton: translate("Save", "STMemoryBooks_Save"),
      cancelButton: translate("Cancel", "STMemoryBooks_Cancel"),
    });
    const result = await editPopup.show();
    if (result === POPUP_RESULT.AFFIRMATIVE) {
      const newDisplayName = editPopup.dlg
        .querySelector("#stmb-apm-edit-display-name")
        .value.trim();
      const newPrompt = editPopup.dlg
        .querySelector("#stmb-apm-edit-prompt")
        .value.trim();
      if (!newPrompt) {
        toastr.error(
          translate(
            "Prompt cannot be empty",
            "STMemoryBooks_PromptCannotBeEmpty",
          ),
          "STMemoryBooks",
        );
        return;
      }
      await ArcPrompts.upsertPreset(
        presetKey,
        newPrompt,
        newDisplayName || null,
      );
      toastr.success(
        translate(
          "Preset updated successfully",
          "STMemoryBooks_PresetUpdatedSuccessfully",
        ),
        "STMemoryBooks",
      );
      window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated"));
      popup.completeAffirmative();
      await showArcPromptManagerPopup();
    }
  } catch (error) {
    console.error("STMemoryBooks: Error editing arc preset:", error);
    toastr.error(
      translate("Failed to edit preset", "STMemoryBooks_FailedToEditPreset"),
      "STMemoryBooks",
    );
  }
}

async function duplicateArcPreset(popup, presetKey) {
  try {
    const newKey = await ArcPrompts.duplicatePreset(presetKey);
    toastr.success(
      translate(
        "Preset duplicated successfully",
        "STMemoryBooks_PresetDuplicatedSuccessfully",
      ),
      "STMemoryBooks",
    );
    window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated"));
    popup.completeAffirmative();
    await showArcPromptManagerPopup();
  } catch (error) {
    console.error("STMemoryBooks: Error duplicating arc preset:", error);
    toastr.error(
      translate(
        "Failed to duplicate preset",
        "STMemoryBooks_FailedToDuplicatePreset",
      ),
      "STMemoryBooks",
    );
  }
}

async function deleteArcPreset(popup, presetKey) {
  const displayName = await ArcPrompts.getDisplayName(presetKey);
  const confirmPopup = new Popup(
    `<h3 data-i18n="STMemoryBooks_DeletePresetTitle">Delete Preset</h3><p>${escapeHtml(translate('Are you sure you want to delete "{{name}}"?', "STMemoryBooks_DeletePresetConfirm", { name: displayName }))}</p>`,
    POPUP_TYPE.CONFIRM,
    "",
    {
      okButton: translate("Delete", "STMemoryBooks_Delete"),
      cancelButton: translate("Cancel", "STMemoryBooks_Cancel"),
    },
  );
  try {
    applyLocale(confirmPopup.dlg);
  } catch (e) {
    /* no-op */
  }
  const result = await confirmPopup.show();
  if (result === POPUP_RESULT.AFFIRMATIVE) {
    try {
      await ArcPrompts.removePreset(presetKey);
      toastr.success(
        translate(
          "Preset deleted successfully",
          "STMemoryBooks_PresetDeletedSuccessfully",
        ),
        "STMemoryBooks",
      );
      window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated"));
      popup.completeAffirmative();
      await showArcPromptManagerPopup();
    } catch (error) {
      console.error("STMemoryBooks: Error deleting arc preset:", error);
      toastr.error(
        translate(
          "Failed to delete preset",
          "STMemoryBooks_FailedToDeletePreset",
        ),
        "STMemoryBooks",
      );
    }
  }
}

async function exportArcPrompts() {
  try {
    const json = await ArcPrompts.exportToJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stmb-arc-prompts.json";
    a.click();
    URL.revokeObjectURL(url);
    toastr.success(
      translate(
        "Prompts exported successfully",
        "STMemoryBooks_PromptsExportedSuccessfully",
      ),
      "STMemoryBooks",
    );
  } catch (error) {
    console.error("STMemoryBooks: Error exporting arc prompts:", error);
    toastr.error(
      translate(
        "Failed to export prompts",
        "STMemoryBooks_FailedToExportPrompts",
      ),
      "STMemoryBooks",
    );
  }
}

async function importArcPrompts(event, popup) {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    await ArcPrompts.importFromJSON(text);
    toastr.success(
      translate(
        "Prompts imported successfully",
        "STMemoryBooks_PromptsImportedSuccessfully",
      ),
      "STMemoryBooks",
    );
    window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated"));
    popup.completeAffirmative();
    await showArcPromptManagerPopup();
  } catch (error) {
    console.error("STMemoryBooks: Error importing arc prompts:", error);
    toastr.error(
      __st_t_tag`Failed to import prompts: ${error.message}`,
      "STMemoryBooks",
    );
  }
}

/**
 * Show Arc Consolidation popup
 */
async function showArcConsolidationPopup() {
  try {
    const lorebookValidation = await validateLorebook();
    if (!lorebookValidation.valid) {
      toastr.error(
        translate(
          "No lorebook available: " + lorebookValidation.error,
          "STMemoryBooks_NoLorebookAvailable",
        ),
        "STMemoryBooks",
      );
      return;
    }
    const lorebookName = lorebookValidation.name;
    const lorebookData = lorebookValidation.data;

    // Candidate entries: STMB memories that are not arcs and not disabled
    const allEntries = Object.values(lorebookData.entries || {});
    const parseOrder = (t) => {
      if (typeof t !== "string") return 0;
      const m1 = t.match(/\[(\d+)\]/);
      if (m1) return parseInt(m1[1], 10);
      const m2 = t.match(/^(\d+)[\s-]/);
      if (m2) return parseInt(m2[1], 10);
      return 0;
    };
    const candidates = allEntries
      .filter(
        (e) =>
          e && e.stmemorybooks === true && e.stmbArc !== true && !e.disable,
      )
      .sort(
        (a, b) => parseOrder(a.comment || "") - parseOrder(b.comment || ""),
      );

    // Presets for Arc Analysis
    await ArcPrompts.firstRunInitIfMissing(extension_settings?.STMemoryBooks);
    const presets = await ArcPrompts.listPresets();
    const defaultPresetKey = "arc_default";

    // Defaults from settings
    const settings = initializeSettings();
    const tokenThreshold =
      settings.moduleSettings.tokenWarningThreshold || 30000;

    // Build popup content
    let content = "";
    content += `<h3>${escapeHtml(translate("🌈 Consolidate Memories into Arcs", "STMemoryBooks_ConsolidateArcs_Title"))}</h3>`;

    // Preset selector
    content += '<div class="world_entry_form_control">';
    content += `<label><strong>${escapeHtml(translate("Preset", "STMemoryBooks_ConsolidateArcs_Preset"))}:</strong> `;
    content += '<select id="stmb-arc-preset" class="text_pole">';
    for (const p of presets) {
      const key = String(p.key || "");
      const name = String(p.displayName || key);
      const sel = key === defaultPresetKey ? " selected" : "";
      content += `<option value="${escapeHtml(key)}"${sel}>${escapeHtml(name)}</option>`;
    }
    content += `</select></label> <button id="stmb-arc-rebuild-builtins" class="menu_button whitespacenowrap">${escapeHtml(translate("Rebuild from built-ins", "STMemoryBooks_Arc_RebuildBuiltins"))}</button></div>`;

    // Options row
    content += '<div class="flex-container flexGap10">';
    content += `<label>${escapeHtml(translate("Max/Pass", "STMemoryBooks_Arc_MaxPerPass"))} <input id="stmb-arc-maxpass" type="number" min="1" max="50" value="12" class="text_pole" style="width:80px"/></label>`;
    content += `<label>${escapeHtml(translate("Max Passes", "STMemoryBooks_Arc_MaxPasses"))} <input id="stmb-arc-maxpasses" type="number" min="1" max="50" value="10" class="text_pole" style="width:100px"/></label>`;
    content += `<label>${escapeHtml(translate("Min Assigned", "STMemoryBooks_Arc_MinAssigned"))} <input id="stmb-arc-minassigned" type="number" min="1" max="12" value="2" class="text_pole" style="width:110px"/></label>`;
    content += `<label>${escapeHtml(translate("Token Budget", "STMemoryBooks_Arc_TokenBudget"))} <input id="stmb-arc-token" type="number" min="1000" max="100000" value="${tokenThreshold}" class="text_pole" style="width:120px"/></label>`;
    content += "</div>";

    // Disable originals toggle
    content += '<div class="world_entry_form_control">';
    content += `<label><input id="stmb-arc-disable-originals" type="checkbox"/> ${escapeHtml(translate("Disable originals after creating arcs", "STMemoryBooks_ConsolidateArcs_DisableOriginals"))}</label>`;
    content += "</div>";

    // Entries checklist
    content += `<div class="world_entry_form_control"><div class="flex-container flexGap10 marginBot5">`;
    content += `<button id="stmb-arc-select-all" class="menu_button">${escapeHtml(translate("Select All", "STMemoryBooks_SelectAll"))}</button>`;
    content += `<button id="stmb-arc-deselect-all" class="menu_button">${escapeHtml(translate("Deselect All", "STMemoryBooks_DeselectAll"))}</button>`;
    content += `</div>`;
    content += `<div id="stmb-arc-list" style="max-height:300px; overflow-y:auto; border:1px solid var(--SmartHover2); padding:6px">`;
    for (const e of candidates) {
      const title = e.comment || "(untitled)";
      const uid = String(e.uid);
      const ord = parseOrder(title);
      content += `<label class="flex-container flexGap10" style="align-items:center; margin:2px 0;"><input type="checkbox" class="stmb-arc-item" value="${escapeHtml(uid)}" checked /> <span class="opacity70p">[${String(ord).padStart(3, "0")}]</span> <span>${escapeHtml(title)}</span></label>`;
    }
    content += `</div>`;
    content += `<small class="opacity70p">${escapeHtml(translate("Tip: uncheck memories that should not be included.", "STMemoryBooks_ConsolidateArcs_Tip"))}</small>`;
    content += "</div>";

    const popup = new Popup(DOMPurify.sanitize(content), POPUP_TYPE.TEXT, "", {
      wide: true,
      large: true,
      allowVerticalScrolling: true,
      okButton: translate("Run", "STMemoryBooks_Run"),
      cancelButton: translate("Cancel", "STMemoryBooks_Cancel"),
    });

    // Attach handlers before show
    const dlg = popup.dlg;
    try {
      applyLocale(dlg);
    } catch (e) {
      /* noop */
    }
    dlg
      .querySelector("#stmb-arc-select-all")
      ?.addEventListener("click", (e) => {
        e.preventDefault();
        dlg
          .querySelectorAll(".stmb-arc-item")
          .forEach((cb) => (cb.checked = true));
      });
    dlg
      .querySelector("#stmb-arc-deselect-all")
      ?.addEventListener("click", (e) => {
        e.preventDefault();
        dlg
          .querySelectorAll(".stmb-arc-item")
          .forEach((cb) => (cb.checked = false));
      });

    // Rebuild Arc prompts from built-ins with backup and refresh preset list
    dlg
      .querySelector("#stmb-arc-rebuild-builtins")
      ?.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          const confirmContent = `
                    <h3>${escapeHtml(translate("Rebuild Arc Prompts from Built-ins", "STMemoryBooks_Arc_RebuildTitle"))}</h3>
                    <div class="info-block warning">
                        ${escapeHtml(translate("This will overwrite your saved Arc prompt presets with the built-ins. A timestamped backup will be created.", "STMemoryBooks_Arc_RebuildWarning"))}
                    </div>
                    <p class="opacity70p">${escapeHtml(translate("After rebuild, the preset list will refresh automatically.", "STMemoryBooks_Arc_RebuildNote"))}</p>
                `;
          const confirmPopup = new Popup(
            confirmContent,
            POPUP_TYPE.CONFIRM,
            "",
            {
              okButton: translate("Rebuild", "STMemoryBooks_Rebuild"),
              cancelButton: translate("Cancel", "STMemoryBooks_Cancel"),
            },
          );
          const cres = await confirmPopup.show();
          if (cres !== POPUP_RESULT.AFFIRMATIVE) return;

          const result = await ArcPrompts.rebuildFromBuiltIns({ backup: true });

          // Reload presets and repopulate selector
          const newPresets = await ArcPrompts.listPresets();
          const selEl = dlg.querySelector("#stmb-arc-preset");
          if (selEl) {
            const selectedBefore = selEl.value || defaultPresetKey;
            selEl.innerHTML = "";
            for (const p of newPresets) {
              const key = String(p.key || "");
              const name = String(p.displayName || key);
              const opt = document.createElement("option");
              opt.value = key;
              opt.textContent = name;
              selEl.appendChild(opt);
            }
            if (
              Array.from(selEl.options).some((o) => o.value === selectedBefore)
            ) {
              selEl.value = selectedBefore;
            } else {
              selEl.value = defaultPresetKey;
            }
          }

          try {
            window.dispatchEvent(new CustomEvent("stmb-arc-presets-updated"));
          } catch (e2) {
            /* noop */
          }

          const backupMsg = result?.backupName
            ? ` (backup: ${result.backupName}) `
            : "";
          toastr.success(
            __st_t_tag`Rebuilt Arc prompts (${result?.count || 0} presets)${backupMsg}`,
            "STMemoryBooks",
          );
        } catch (err) {
          console.error("STMemoryBooks: Arc prompts rebuild failed:", err);
          toastr.error(
            __st_t_tag`Failed to rebuild Arc prompts: ${err.message}`,
            "STMemoryBooks",
          );
        }
      });

    const res = await popup.show();
    if (res !== POPUP_RESULT.AFFIRMATIVE) return;

    // Gather selections
    const selected = Array.from(dlg.querySelectorAll(".stmb-arc-item"))
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);
    if (selected.length === 0) {
      toastr.error(
        translate(
          "Select at least one memory to consolidate.",
          "STMemoryBooks_SelectAtLeastOne",
        ),
        "STMemoryBooks",
      );
      return;
    }

    const presetKey = String(
      dlg.querySelector("#stmb-arc-preset")?.value || "arc_default",
    );
    const options = {
      presetKey,
      maxItemsPerPass: Math.max(
        1,
        parseInt(dlg.querySelector("#stmb-arc-maxpass")?.value) || 12,
      ),
      maxPasses: Math.max(
        1,
        parseInt(dlg.querySelector("#stmb-arc-maxpasses")?.value) || 10,
      ),
      minAssigned: Math.max(
        1,
        parseInt(dlg.querySelector("#stmb-arc-minassigned")?.value) || 2,
      ),
      tokenTarget: Math.max(
        1000,
        parseInt(dlg.querySelector("#stmb-arc-token")?.value) || tokenThreshold,
      ),
    };
    const disableOriginals = !!dlg.querySelector("#stmb-arc-disable-originals")
      ?.checked;

    const entryMap = new Map(candidates.map((e) => [String(e.uid), e]));
    const selectedEntries = selected
      .map((id) => entryMap.get(String(id)))
      .filter(Boolean);

    toastr.info(
      translate(
        "Consolidating memories into arcs...",
        "STMemoryBooks_ConsolidatingArcs",
      ),
      "STMemoryBooks",
      { timeOut: 0 },
    );

    // Run analysis (uses current UI model if no profile is passed)
    let analysis;
    try {
      analysis = await runArcAnalysisSequential(selectedEntries, options, null);
    } catch (e) {
      toastr.error(
        __st_t_tag`Arc analysis failed: ${e.message}`,
        "STMemoryBooks",
      );
      return;
    }
    const { arcCandidates, leftovers } = analysis || {
      arcCandidates: [],
      leftovers: [],
    };

    if (!arcCandidates || arcCandidates.length === 0) {
      toastr.warning(
        translate(
          "No arcs were produced. Try different settings or selection.",
          "STMemoryBooks_NoArcsProduced",
        ),
        "STMemoryBooks",
      );
      return;
    }

    try {
      const res2 = await commitArcs({
        lorebookName,
        lorebookData,
        arcCandidates,
        disableOriginals,
      });
      const created = Array.isArray(res2?.results)
        ? res2.results.length
        : arcCandidates.length;
      let msg = `Created ${created} arc${created === 1 ? "" : "s"}${leftovers?.length ? `, ${leftovers.length} leftover` : ""}.`;
      if (created === 1 && (!leftovers || leftovers.length === 0)) {
        msg += " (all selected memories were consumed into a single arc)";
      }
      toastr.success(__st_t_tag`${msg}`, "STMemoryBooks");
    } catch (e) {
      toastr.error(
        __st_t_tag`Failed to commit arcs: ${e.message}`,
        "STMemoryBooks",
      );
    }
  } catch (e) {
    console.error("STMemoryBooks: showArcConsolidationPopup failed:", e);
    toastr.error(
      __st_t_tag`Failed to open consolidate popup: ${e.message}`,
      "STMemoryBooks",
    );
  }
}

/**
 * Show main settings popup
 */
async function showSettingsPopup() {
  const settings = initializeSettings();
  await SummaryPromptManager.firstRunInitIfMissing(settings);
  const sceneData = await getSceneData();

  // Build Regex script options (Global, Scoped, Preset), include disabled too
  const selectedRegexOutgoing = Array.isArray(
    settings.moduleSettings.selectedRegexOutgoing,
  )
    ? settings.moduleSettings.selectedRegexOutgoing
    : [];
  const selectedRegexIncoming = Array.isArray(
    settings.moduleSettings.selectedRegexIncoming,
  )
    ? settings.moduleSettings.selectedRegexIncoming
    : [];
  const regexOptions = [];
  try {
    const scripts = getRegexScripts({ allowedOnly: false }) || [];
    scripts.forEach((script, index) => {
      const key = `idx:${index}`;
      const label = `${script?.scriptName || "Untitled"}${script?.disabled ? " (disabled)" : ""}`;
      regexOptions.push({
        key,
        label,
        selectedOutgoing: selectedRegexOutgoing.includes(key),
        selectedIncoming: selectedRegexIncoming.includes(key),
      });
    });
  } catch (e) {
    console.warn("STMemoryBooks: Failed to enumerate Regex scripts for UI", e);
  }
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
    lorebookMode: isManualMode ? "Manual" : "Automatic (Chat-bound)",
    currentLorebookName: isManualMode ? manualLorebook : chatBoundLorebook,
    manualLorebookName: manualLorebook,
    chatBoundLorebookName: chatBoundLorebook,
    availableLorebooks: world_names || [],
    autoHideMode: getAutoHideMode(settings.moduleSettings),
    unhiddenEntriesCount: settings.moduleSettings.unhiddenEntriesCount || 0,
    tokenWarningThreshold:
      settings.moduleSettings.tokenWarningThreshold || 30000,
    defaultMemoryCount: settings.moduleSettings.defaultMemoryCount || 0,
    autoSummaryEnabled: settings.moduleSettings.autoSummaryEnabled || false,
    autoSummaryInterval: settings.moduleSettings.autoSummaryInterval || 50,
    autoSummaryBuffer: settings.moduleSettings.autoSummaryBuffer || 0,
    autoCreateLorebook: settings.moduleSettings.autoCreateLorebook || false,
    lorebookNameTemplate:
      settings.moduleSettings.lorebookNameTemplate ||
      "LTM - {{char}} - {{chat}}",
    profiles: settings.profiles.map((profile, index) => ({
      ...profile,
      name:
        profile?.connection?.api === "current_st"
          ? translate(
              "Current SillyTavern Settings",
              "STMemoryBooks_Profile_CurrentST",
            )
          : profile.name,
      isDefault: index === settings.defaultProfile,
    })),
    titleFormat: settings.titleFormat,
    // Regex selection UI
    useRegex: settings.moduleSettings.useRegex || false,
    regexOptions,
    selectedRegexOutgoing,
    selectedRegexIncoming,
    titleFormats: getDefaultTitleFormats().map((format) => ({
      value: format,
      isSelected: format === settings.titleFormat,
    })),
    showCustomInput: !getDefaultTitleFormats().includes(settings.titleFormat),
    selectedProfile: {
      ...selectedProfile,
      connection:
        selectedProfile.useDynamicSTSettings ||
        selectedProfile?.connection?.api === "current_st"
          ? (() => {
              const currentApiInfo = getCurrentApiInfo();
              const currentSettings = getUIModelSettings();
              return {
                api: currentApiInfo.completionSource || "openai",
                model: currentSettings.model || "Not Set",
                temperature: currentSettings.temperature || 0.7,
              };
            })()
          : {
              api: selectedProfile.connection?.api || "openai",
              model: selectedProfile.connection?.model || "Not Set",
              temperature:
                selectedProfile.connection?.temperature !== undefined
                  ? selectedProfile.connection.temperature
                  : 0.7,
            },
      titleFormat: selectedProfile.titleFormat || settings.titleFormat,
      effectivePrompt:
        selectedProfile.prompt && selectedProfile.prompt.trim()
          ? selectedProfile.prompt
          : selectedProfile.preset
            ? await SummaryPromptManager.getPrompt(selectedProfile.preset)
            : getDefaultPrompt(),
    },
  };

  const content = DOMPurify.sanitize(settingsTemplate(templateData));

  // Build customButtons array dynamically based on current state
  const customButtons = [];

  (customButtons.push({
    text:
      "🧠 " + translate("Create Memory", "STMemoryBooks_CreateMemoryButton"),
    result: null,
    classes: ["menu_button"],
    action: async () => {
      if (!sceneData) {
        toastr.error(
          translate(
            "No scene selected. Make sure both start and end points are set.",
            "STMemoryBooks_NoSceneSelectedMakeSure",
          ),
          "STMemoryBooks",
        );
        return;
      }

      // Capture the currently selected profile before proceeding
      let selectedProfileIndex = settings.defaultProfile;
      if (currentPopupInstance && currentPopupInstance.dlg) {
        const profileSelect = currentPopupInstance.dlg.querySelector(
          "#stmb-profile-select",
        );
        if (profileSelect) {
          selectedProfileIndex =
            parseInt(profileSelect.value) || settings.defaultProfile;
          console.log(
            `STMemoryBooks: Using profile index ${selectedProfileIndex} (${settings.profiles[selectedProfileIndex]?.name}) from main popup selection`,
          );
        }
      }

      await initiateMemoryCreation(selectedProfileIndex);
    },
  }),
    customButtons.push({
      text:
        "🌈 " +
        translate(
          "Consolidate Memories into Arcs",
          "STMemoryBooks_ConsolidateArcsButton",
        ),
      result: null,
      classes: ["menu_button"],
      action: async () => {
        await showArcConsolidationPopup();
      },
    }),
    customButtons.push({
      text: "🗑️ " + translate("Clear Scene", "STMemoryBooks_ClearSceneButton"),
      result: null,
      classes: ["menu_button"],
      action: () => {
        clearScene();
        refreshPopupContent();
      },
    }));

  // Manual lorebook and profile buttons will be populated after popup creation

  const popupOptions = {
    wide: true,
    large: true,
    allowVerticalScrolling: true,
    customButtons: customButtons,
    cancelButton: translate("Close", "STMemoryBooks_Close"),
    okButton: false,
    onClose: handleSettingsPopupClose,
  };

  try {
    currentPopupInstance = new Popup(
      content,
      POPUP_TYPE.TEXT,
      "",
      popupOptions,
    );
    setupSettingsEventListeners();
    populateInlineButtons();
    await currentPopupInstance.show();
  } catch (error) {
    console.error("STMemoryBooks: Error showing settings popup:", error);
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
  popupElement.addEventListener("click", async (e) => {
    const settings = initializeSettings();

    // Regex selection button (visible only when "Use regex" is checked)
    if (e.target && e.target.matches("#stmb-configure-regex")) {
      e.preventDefault();
      try {
        await showRegexSelectionPopup();
      } catch (err) {
        console.warn("STMemoryBooks: showRegexSelectionPopup failed", err);
      }
      return;
    }

    // Note: Manual lorebook and profile management buttons are now handled via customButtons
  });

  // Handle change events using delegation
  popupElement.addEventListener("change", async (e) => {
    const settings = initializeSettings();

    // Use regex gate
    if (e.target.matches("#stmb-use-regex")) {
      settings.moduleSettings.useRegex = e.target.checked;
      saveSettingsDebounced();
      const btn = popupElement.querySelector("#stmb-configure-regex");
      if (btn) btn.style.display = e.target.checked ? "" : "none";
      return;
    }

    // Regex multi-selects
    if (e.target.matches("#stmb-regex-outgoing")) {
      try {
        const values = Array.from(e.target.selectedOptions || []).map(
          (o) => o.value,
        );
        settings.moduleSettings.selectedRegexOutgoing = values;
        saveSettingsDebounced();
      } catch (err) {
        console.warn(
          "STMemoryBooks: failed to save selectedRegexOutgoing",
          err,
        );
      }
      return;
    }
    if (e.target.matches("#stmb-regex-incoming")) {
      try {
        const values = Array.from(e.target.selectedOptions || []).map(
          (o) => o.value,
        );
        settings.moduleSettings.selectedRegexIncoming = values;
        saveSettingsDebounced();
      } catch (err) {
        console.warn(
          "STMemoryBooks: failed to save selectedRegexIncoming",
          err,
        );
      }
      return;
    }

    if (e.target.matches("#stmb-import-file")) {
      try {
        importProfiles(e, settings, refreshPopupContent);
      } catch (error) {
        console.error(`${MODULE_NAME}: Error in import profiles:`, error);
        toastr.error(
          translate(
            "Failed to import profiles",
            "STMemoryBooks_FailedToImportProfiles",
          ),
          "STMemoryBooks",
        );
      }
      return;
    }

    if (e.target.matches("#stmb-allow-scene-overlap")) {
      settings.moduleSettings.allowSceneOverlap = e.target.checked;
      saveSettingsDebounced();
      return;
    }

    if (e.target.matches("#stmb-unhide-before-memory")) {
      settings.moduleSettings.unhideBeforeMemory = e.target.checked;
      saveSettingsDebounced();
      return;
    }

    if (e.target.matches("#stmb-manual-mode-enabled")) {
      const isEnabling = e.target.checked;

      // Mutual exclusion: If enabling manual mode, disable auto-create
      if (isEnabling) {
        settings.moduleSettings.autoCreateLorebook = false;
        const autoCreateCheckbox = document.querySelector(
          "#stmb-auto-create-lorebook",
        );
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

            const popup = new Popup(popupContent, POPUP_TYPE.TEXT, "", {
              okButton: translate(
                "Use Chat-bound",
                "STMemoryBooks_UseChatBound",
              ),
              cancelButton: translate(
                "Select Different",
                "STMemoryBooks_SelectDifferent",
              ),
            });
            const result = await popup.show();

            if (result === POPUP_RESULT.AFFIRMATIVE) {
              // Use the chat-bound lorebook as manual lorebook
              stmbData.manualLorebook = chatBoundLorebook;
              saveMetadataForCurrentContext();
              toastr.success(
                __st_t_tag`Manual lorebook set to "${chatBoundLorebook}"`,
                "STMemoryBooks",
              );
            } else {
              // Let user select a different lorebook
              const selectedLorebook =
                await showLorebookSelectionPopup(chatBoundLorebook);
              if (!selectedLorebook) {
                // User cancelled, revert the checkbox
                e.target.checked = false;
                return;
              }
              // showLorebookSelectionPopup already saved the selection and showed success message
            }
          } else {
            // No chat-bound lorebook, prompt to select one
            toastr.info(
              translate(
                "Please select a lorebook for manual mode",
                "STMemoryBooks_PleaseSelectLorebookForManualMode",
              ),
              "STMemoryBooks",
            );
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

    if (e.target.matches("#stmb-auto-hide-mode")) {
      settings.moduleSettings.autoHideMode = e.target.value;
      delete settings.moduleSettings.autoHideAllMessages;
      delete settings.moduleSettings.autoHideLastMemory;
      saveSettingsDebounced();
      return;
    }

    if (e.target.matches("#stmb-profile-select")) {
      const newIndex = parseInt(e.target.value);
      if (newIndex >= 0 && newIndex < settings.profiles.length) {
        const selectedProfile = settings.profiles[newIndex];
        const summaryApi = popupElement.querySelector("#stmb-summary-api");
        const summaryModel = popupElement.querySelector("#stmb-summary-model");
        const summaryTemp = popupElement.querySelector("#stmb-summary-temp");
        const summaryTitle = popupElement.querySelector("#stmb-summary-title");
        const summaryPrompt = popupElement.querySelector(
          "#stmb-summary-prompt",
        );

        if (
          selectedProfile.useDynamicSTSettings ||
          selectedProfile?.connection?.api === "current_st"
        ) {
          // For dynamic/current_st profiles, show current ST settings
          const currentApiInfo = getCurrentApiInfo();
          const currentSettings = getUIModelSettings();

          if (summaryApi)
            summaryApi.textContent =
              currentApiInfo.completionSource || "openai";
          if (summaryModel)
            summaryModel.textContent =
              currentSettings.model ||
              translate("Not Set", "STMemoryBooks_NotSet");
          if (summaryTemp)
            summaryTemp.textContent = currentSettings.temperature || "0.7";
        } else {
          // For regular profiles, show stored settings
          if (summaryApi)
            summaryApi.textContent =
              selectedProfile.connection?.api || "openai";
          if (summaryModel)
            summaryModel.textContent =
              selectedProfile.connection?.model ||
              translate("Not Set", "STMemoryBooks_NotSet");
          if (summaryTemp)
            summaryTemp.textContent =
              selectedProfile.connection?.temperature !== undefined
                ? selectedProfile.connection.temperature
                : "0.7";
        }
        // Title format is profile-specific
        if (summaryTitle)
          summaryTitle.textContent =
            selectedProfile.titleFormat || settings.titleFormat;
        if (summaryPrompt)
          summaryPrompt.textContent =
            await getEffectivePromptAsync(selectedProfile);
      }
      return;
    }

    if (e.target.matches("#stmb-title-format-select")) {
      const customInput = popupElement.querySelector(
        "#stmb-custom-title-format",
      );
      const summaryTitle = popupElement.querySelector("#stmb-summary-title");

      if (e.target.value === "custom") {
        customInput.classList.remove("displayNone");
        customInput.focus();
      } else {
        customInput.classList.add("displayNone");
        settings.titleFormat = e.target.value;
        saveSettingsDebounced();

        // Update the preview
        if (summaryTitle) {
          summaryTitle.textContent = e.target.value;
        }
      }
      return;
    }

    if (e.target.matches("#stmb-default-memory-count")) {
      const value = parseInt(e.target.value);
      if (!isNaN(value) && value >= 0 && value <= 20) {
        settings.moduleSettings.defaultMemoryCount = value;
        saveSettingsDebounced();
      }
      return;
    }

    if (e.target.matches("#stmb-auto-summary-enabled")) {
      settings.moduleSettings.autoSummaryEnabled = e.target.checked;
      saveSettingsDebounced();
      return;
    }

    if (e.target.matches("#stmb-auto-create-lorebook")) {
      const isEnabling = e.target.checked;

      // Mutual exclusion: If enabling auto-create, disable manual mode
      if (isEnabling) {
        settings.moduleSettings.manualModeEnabled = false;
        const manualModeCheckbox = document.querySelector(
          "#stmb-manual-mode-enabled",
        );
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

    if (e.target.matches("#stmb-auto-summary-interval")) {
      const value = parseInt(e.target.value);
      if (!isNaN(value) && value >= 10 && value <= 200) {
        settings.moduleSettings.autoSummaryInterval = value;
        saveSettingsDebounced();
      }
      return;
    }

    if (e.target.matches("#stmb-auto-summary-buffer")) {
      const value = parseInt(e.target.value);
      const clamped = Math.min(Math.max(isNaN(value) ? 0 : value, 0), 50);
      settings.moduleSettings.autoSummaryBuffer = clamped;
      saveSettingsDebounced();
      return;
    }
  });

  // Handle input events using delegation with debouncing
  popupElement.addEventListener(
    "input",
    lodash.debounce((e) => {
      const settings = initializeSettings();

      if (e.target.matches("#stmb-custom-title-format")) {
        const value = e.target.value.trim();
        if (value && value.includes("000")) {
          settings.titleFormat = value;
          saveSettingsDebounced();

          // Update the preview
          const summaryTitle = popupElement.querySelector(
            "#stmb-summary-title",
          );
          if (summaryTitle) {
            summaryTitle.textContent = value;
          }
        }
        return;
      }

      if (e.target.matches("#stmb-lorebook-name-template")) {
        const value = e.target.value.trim();
        if (value) {
          settings.moduleSettings.lorebookNameTemplate = value;
          saveSettingsDebounced();
        }
        return;
      }

      if (e.target.matches("#stmb-token-warning-threshold")) {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 1000 && value <= 100000) {
          settings.moduleSettings.tokenWarningThreshold = value;
          saveSettingsDebounced();
        }
        return;
      }

      if (e.target.matches("#stmb-unhidden-entries-count")) {
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 0 && value <= 50) {
          settings.moduleSettings.unhiddenEntriesCount = value;
          saveSettingsDebounced();
        }
        return;
      }
    }, 1000),
  );
}

/**
 * Handle settings popup close
 */
function handleSettingsPopupClose(popup) {
  try {
    const popupElement = popup.dlg;
    const settings = initializeSettings();

    // Save checkbox states
    const alwaysUseDefault =
      popupElement.querySelector("#stmb-always-use-default")?.checked ??
      settings.moduleSettings.alwaysUseDefault;
    const showMemoryPreviews =
      popupElement.querySelector("#stmb-show-memory-previews")?.checked ??
      settings.moduleSettings.showMemoryPreviews;
    const showNotifications =
      popupElement.querySelector("#stmb-show-notifications")?.checked ??
      settings.moduleSettings.showNotifications;
    const unhideBeforeMemory =
      popupElement.querySelector("#stmb-unhide-before-memory")?.checked ??
      settings.moduleSettings.unhideBeforeMemory;
    const refreshEditor =
      popupElement.querySelector("#stmb-refresh-editor")?.checked ??
      settings.moduleSettings.refreshEditor;
    const allowSceneOverlap =
      popupElement.querySelector("#stmb-allow-scene-overlap")?.checked ??
      settings.moduleSettings.allowSceneOverlap;
    const autoHideMode =
      popupElement.querySelector("#stmb-auto-hide-mode")?.value ??
      getAutoHideMode(settings.moduleSettings);

    // Save token warning threshold
    const tokenWarningThresholdInput = popupElement.querySelector(
      "#stmb-token-warning-threshold",
    );
    const tokenWarningThreshold = tokenWarningThresholdInput
      ? parseInt(tokenWarningThresholdInput.value) || 30000
      : settings.moduleSettings.tokenWarningThreshold || 30000;

    // Save default memory count
    const defaultMemoryCountInput = popupElement.querySelector(
      "#stmb-default-memory-count",
    );
    const defaultMemoryCount = defaultMemoryCountInput
      ? parseInt(defaultMemoryCountInput.value) || 0
      : settings.moduleSettings.defaultMemoryCount || 0;

    // Save unhidden entries count
    const unhiddenEntriesCountInput = popupElement.querySelector(
      "#stmb-unhidden-entries-count",
    );
    const unhiddenEntriesCount = unhiddenEntriesCountInput
      ? parseInt(unhiddenEntriesCountInput.value) || 0
      : settings.moduleSettings.unhiddenEntriesCount || 0;

    const manualModeEnabled =
      popupElement.querySelector("#stmb-manual-mode-enabled")?.checked ??
      settings.moduleSettings.manualModeEnabled;

    // Save auto-summary settings
    const autoSummaryEnabled =
      popupElement.querySelector("#stmb-auto-summary-enabled")?.checked ??
      settings.moduleSettings.autoSummaryEnabled;
    const autoSummaryIntervalInput = popupElement.querySelector(
      "#stmb-auto-summary-interval",
    );
    const autoSummaryInterval = autoSummaryIntervalInput
      ? parseInt(autoSummaryIntervalInput.value) || 50
      : settings.moduleSettings.autoSummaryInterval || 50;

    const autoSummaryBufferInput = popupElement.querySelector(
      "#stmb-auto-summary-buffer",
    );
    const autoSummaryBuffer = autoSummaryBufferInput
      ? Math.min(Math.max(parseInt(autoSummaryBufferInput.value) || 0, 0), 50)
      : Math.min(
          Math.max(settings.moduleSettings.autoSummaryBuffer || 0, 0),
          50,
        );

    // Save auto-create lorebook setting
    const autoCreateLorebook =
      popupElement.querySelector("#stmb-auto-create-lorebook")?.checked ??
      settings.moduleSettings.autoCreateLorebook;

    const hasChanges =
      alwaysUseDefault !== settings.moduleSettings.alwaysUseDefault ||
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
      autoSummaryBuffer !== settings.moduleSettings.autoSummaryBuffer ||
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
      settings.moduleSettings.autoSummaryBuffer = autoSummaryBuffer;
      settings.moduleSettings.autoCreateLorebook = autoCreateLorebook;
      saveSettingsDebounced();
    }
  } catch (error) {
    console.error("STMemoryBooks: Failed to save settings:", error);
    toastr.warning(
      translate(
        "Failed to save settings. Please try again.",
        "STMemoryBooks_FailedToSaveSettings",
      ),
      "STMemoryBooks",
    );
  }
  currentPopupInstance = null;
}

/**
 * Refresh popup content while preserving popup properties
 */
async function refreshPopupContent() {
  if (!currentPopupInstance || !currentPopupInstance.dlg.hasAttribute("open")) {
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
      lorebookMode: isManualMode ? "Manual" : "Automatic (Chat-bound)",
      currentLorebookName: isManualMode ? manualLorebook : chatBoundLorebook,
      manualLorebookName: manualLorebook,
      chatBoundLorebookName: chatBoundLorebook,
      availableLorebooks: world_names || [],
      autoHideMode: getAutoHideMode(settings.moduleSettings),
      unhiddenEntriesCount: settings.moduleSettings.unhiddenEntriesCount || 0,
      tokenWarningThreshold:
        settings.moduleSettings.tokenWarningThreshold || 30000,
      defaultMemoryCount: settings.moduleSettings.defaultMemoryCount || 0,
      autoSummaryEnabled: settings.moduleSettings.autoSummaryEnabled || false,
      autoSummaryInterval: settings.moduleSettings.autoSummaryInterval || 50,
      autoSummaryBuffer: settings.moduleSettings.autoSummaryBuffer || 0,
      autoCreateLorebook: settings.moduleSettings.autoCreateLorebook || false,
      lorebookNameTemplate:
        settings.moduleSettings.lorebookNameTemplate ||
        "LTM - {{char}} - {{chat}}",
      profiles: settings.profiles.map((profile, index) => ({
        ...profile,
        name:
          profile?.connection?.api === "current_st"
            ? translate(
                "Current SillyTavern Settings",
                "STMemoryBooks_Profile_CurrentST",
              )
            : profile.name,
        isDefault: index === settings.defaultProfile,
      })),
      titleFormat: settings.titleFormat,
      titleFormats: getDefaultTitleFormats().map((format) => ({
        value: format,
        isSelected: format === settings.titleFormat,
      })),
      showCustomInput: !getDefaultTitleFormats().includes(settings.titleFormat),
      selectedProfile: {
        ...selectedProfile,
        connection:
          selectedProfile.useDynamicSTSettings ||
          selectedProfile?.connection?.api === "current_st"
            ? (() => {
                const currentApiInfo = getCurrentApiInfo();
                const currentSettings = getUIModelSettings();
                return {
                  api: currentApiInfo.completionSource || "openai",
                  model: currentSettings.model || "Not Set",
                  temperature: currentSettings.temperature || 0.7,
                };
              })()
            : {
                api: selectedProfile.connection?.api || "openai",
                model: selectedProfile.connection?.model || "gpt-4.1",
                temperature:
                  selectedProfile.connection?.temperature !== undefined
                    ? selectedProfile.connection.temperature
                    : 0.7,
              },
        titleFormat: selectedProfile.titleFormat || settings.titleFormat,
        effectivePrompt:
          selectedProfile.prompt && selectedProfile.prompt.trim()
            ? selectedProfile.prompt
            : selectedProfile.preset
              ? await SummaryPromptManager.getPrompt(selectedProfile.preset)
              : getDefaultPrompt(),
      },
    };

    const newHtml = DOMPurify.sanitize(settingsTemplate(templateData));

    // Update the popup content directly
    currentPopupInstance.content.innerHTML = newHtml;

    // After updating content, refresh the profile dropdown selection
    const profileSelect = currentPopupInstance.content.querySelector(
      "#stmb-profile-select",
    );
    if (profileSelect) {
      profileSelect.value = settings.defaultProfile;
      // Trigger change event to update profile summary
      profileSelect.dispatchEvent(new Event("change"));
    }

    const requiredClasses = [
      "wide_dialogue_popup",
      "large_dialogue_popup",
      "vertical_scrolling_dialogue_popup",
    ];
    currentPopupInstance.dlg.classList.add(...requiredClasses);
    currentPopupInstance.content.style.overflowY = "auto";

    // Repopulate profile buttons after content refresh
    populateInlineButtons();
  } catch (error) {
    console.error("STMemoryBooks: Error refreshing popup content:", error);
  }
}

/**
 * Process existing messages and use full update (for chat loads)
 */
function processExistingMessages() {
  const messageElements = document.querySelectorAll("#chat .mes[mesid]");

  if (messageElements.length > 0) {
    let buttonsAdded = 0;
    messageElements.forEach((messageElement) => {
      // Check if buttons are already there to prevent duplication
      if (!messageElement.querySelector(".mes_stmb_start")) {
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
    name: "creatememory",
    callback: handleCreateMemoryCommand,
    helpString: translate(
      "Create memory from marked scene",
      "STMemoryBooks_Slash_CreateMemory_Help",
    ),
  });

  const sceneMemoryCmd = SlashCommand.fromProps({
    name: "scenememory",
    callback: handleSceneMemoryCommand,
    helpString: translate(
      "Set scene range and create memory (e.g., /scenememory 10-15)",
      "STMemoryBooks_Slash_SceneMemory_Help",
    ),
    unnamedArgumentList: [
      SlashCommandArgument.fromProps({
        description: translate(
          "Message range (X-Y format)",
          "STMemoryBooks_Slash_SceneMemory_ArgRangeDesc",
        ),
        typeList: [ARGUMENT_TYPE.STRING],
        isRequired: true,
      }),
    ],
  });

  const nextMemoryCmd = SlashCommand.fromProps({
    name: "nextmemory",
    callback: handleNextMemoryCommand,
    helpString: translate(
      "Create memory from end of last memory to current message",
      "STMemoryBooks_Slash_NextMemory_Help",
    ),
  });

  const sidePromptCmd = SlashCommand.fromProps({
    name: "sideprompt",
    callback: handleSidePromptCommand,
    helpString: translate(
      'Run side prompt. Usage: /sideprompt "Name" [X-Y]',
      "STMemoryBooks_Slash_SidePrompt_Help",
    ),
    unnamedArgumentList: [
      SlashCommandArgument.fromProps({
        description: translate(
          "Template name (quote if contains spaces), optionally followed by X-Y range",
          "STMemoryBooks_Slash_SidePrompt_ArgDesc",
        ),
        typeList: [ARGUMENT_TYPE.STRING],
        isRequired: true,
        enumProvider: sidePromptTemplateEnumProvider,
      }),
    ],
  });

  // Register enable/disable sideprompt commands
  const sidePromptOnCmd = SlashCommand.fromProps({
    name: "sideprompt-on",
    callback: handleSidePromptOnCommand,
    helpString: translate(
      'Enable a Side Prompt by name or all. Usage: /sideprompt-on "Name" | all',
      "STMemoryBooks_Slash_SidePromptOn_Help",
    ),
    unnamedArgumentList: [
      SlashCommandArgument.fromProps({
        description: translate(
          'Template name (quote if contains spaces) or "all"',
          "STMemoryBooks_Slash_SidePromptOn_ArgDesc",
        ),
        typeList: [ARGUMENT_TYPE.STRING],
        isRequired: true,
        enumProvider: () => [
          new SlashCommandEnumValue("all"),
          ...sidePromptTemplateEnumProvider(),
        ],
      }),
    ],
  });

  const sidePromptOffCmd = SlashCommand.fromProps({
    name: "sideprompt-off",
    callback: handleSidePromptOffCommand,
    helpString: translate(
      'Disable a Side Prompt by name or all. Usage: /sideprompt-off "Name" | all',
      "STMemoryBooks_Slash_SidePromptOff_Help",
    ),
    unnamedArgumentList: [
      SlashCommandArgument.fromProps({
        description: translate(
          'Template name (quote if contains spaces) or "all"',
          "STMemoryBooks_Slash_SidePromptOff_ArgDesc",
        ),
        typeList: [ARGUMENT_TYPE.STRING],
        isRequired: true,
        enumProvider: () => [
          new SlashCommandEnumValue("all"),
          ...sidePromptTemplateEnumProvider(),
        ],
      }),
    ],
  });

  SlashCommandParser.addCommandObject(createMemoryCmd);
  SlashCommandParser.addCommandObject(sceneMemoryCmd);
  SlashCommandParser.addCommandObject(nextMemoryCmd);
  SlashCommandParser.addCommandObject(sidePromptCmd);
  SlashCommandParser.addCommandObject(sidePromptOnCmd);
  SlashCommandParser.addCommandObject(sidePromptOffCmd);
}

/**
 * Create main menu UI
 */
function createUI() {
  const menuItem = $(
    `
        <div id="stmb-menu-item-container" class="extension_container interactable" tabindex="0">
            <div id="stmb-menu-item" class="list-group-item flex-container flexGap5 interactable" tabindex="0">
                <div class="fa-fw fa-solid fa-book extensionsMenuExtensionButton"></div>
                <span data-i18n="STMemoryBooks_MenuItem">Memory Books</span>
            </div>
        </div>
        `,
  );

  const extensionsMenu = $("#extensionsMenu");
  if (extensionsMenu.length > 0) {
    extensionsMenu.append(menuItem);
    applyLocale(menuItem[0]);
  } else {
    console.warn(
      "STMemoryBooks: Extensions menu not found - retrying initialization",
    );
  }
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  $(document).on("click", SELECTORS.menuItem, showSettingsPopup);

  eventSource.on(event_types.CHAT_CHANGED, handleChatChanged);
  eventSource.on(event_types.MESSAGE_DELETED, (deletedId) => {
    const settings = initializeSettings();
    handleMessageDeletion(deletedId, settings);
  });
  eventSource.on(event_types.MESSAGE_RECEIVED, handleMessageReceived);
  eventSource.on(
    event_types.GROUP_WRAPPER_FINISHED,
    handleGroupWrapperFinished,
  );

  // Track dry-run state for generation events
  eventSource.on(event_types.GENERATION_STARTED, (type, options, dryRun) => {
    isDryRun = dryRun || false;
    // Clear any prior persistent failure toast and error when a new generation starts
    try {
      if (lastFailureToast) {
        toastr.clear(lastFailureToast);
      }
    } catch (e) {
      /* noop */
    }
    lastFailureToast = null;
    lastFailedAIError = null;
  });

  // Model settings change handlers
  const modelSelectors = Object.values(SELECTORS)
    .filter(
      (selector) => selector.includes("model_") || selector.includes("temp_"),
    )
    .join(", ");

  eventSource.on(event_types.GENERATE_AFTER_DATA, (generate_data) => {
    if (isDryRun) {
      return; // Skip all processing during dry-run
    }
    if (isProcessingMemory && currentProfile) {
      const conn =
        currentProfile.effectiveConnection || currentProfile.connection || {};
      const apiToSource = {
        openai: "openai",
        claude: "claude",
        openrouter: "openrouter",
        ai21: "ai21",
        makersuite: "makersuite",
        google: "makersuite",
        vertexai: "vertexai",
        mistralai: "mistralai",
        custom: "custom",
        cohere: "cohere",
        perplexity: "perplexity",
        groq: "groq",
        nanogpt: "nanogpt",
        deepseek: "deepseek",
        electronhub: "electronhub",
        aimlapi: "aimlapi",
        xai: "xai",
        pollinations: "pollinations",
        moonshot: "moonshot",
        fireworks: "fireworks",
        cometapi: "cometapi",
        azure_openai: "azure_openai",
        zai: "zai",
        siliconflow: "siliconflow",
      };
      const src = apiToSource[conn.api] || "openai";

      // Force source/model/temp
      generate_data.chat_completion_source = src;

      // Disable thinking mode for memory generation
      generate_data.include_reasoning = false;

      if (conn.model) {
        generate_data.model = conn.model;
      }
      if (typeof conn.temperature === "number") {
        generate_data.temperature = conn.temperature;
      }
    }
  });

  window.addEventListener("beforeunload", cleanupChatObserver);
}

/**
 * Show a popup with details for a failed AI response, including raw response and provider body if available.
 */
function showFailedAIResponsePopup(error) {
  try {
    const esc = (s) => escapeHtml(String(s || ""));
    const code = error?.code ? esc(error.code) : "";
    const message = esc(error?.message || "Unknown error");
    const raw = typeof error?.rawResponse === "string" ? error.rawResponse : "";
    const providerBody =
      typeof error?.providerBody === "string" ? error.providerBody : "";
    const MAX_PREVIEW = 100000;
    const rawPreview =
      raw && raw.length > MAX_PREVIEW
        ? raw.slice(0, MAX_PREVIEW) + "\n…(truncated)…"
        : raw;

    let content = "";
    content += `<h3>${esc(translate("Review Failed AI Response", "STMemoryBooks_ReviewFailedAI_Title"))}</h3>`;
    content += `<div class="world_entry_form_control">`;
    content += `<div><strong>${esc(translate("Error", "STMemoryBooks_ReviewFailedAI_ErrorLabel"))}:</strong> ${message}</div>`;
    if (code)
      content += `<div><strong>${esc(translate("Code", "STMemoryBooks_ReviewFailedAI_CodeLabel"))}:</strong> ${code}</div>`;
    content += `</div>`;

    if (raw) {
      content += `<div class="world_entry_form_control">`;
      content += `<h4>${esc(translate("Raw AI Response", "STMemoryBooks_ReviewFailedAI_RawLabel"))}</h4>`;
      content += `<pre class="text_pole" style="white-space: pre-wrap; max-height: 300px; overflow:auto;"><code>${escapeHtml(rawPreview)}</code></pre>`;
      content += `<div class="buttons_block gap10px"><button id="stmb-copy-raw" class="menu_button">${esc(translate("Copy Raw", "STMemoryBooks_ReviewFailedAI_CopyRaw"))}</button></div>`;
      content += `</div>`;
    } else {
      content += `<div class="world_entry_form_control opacity70p">${esc(translate("No raw response was captured.", "STMemoryBooks_ReviewFailedAI_NoRaw"))}</div>`;
    }

    if (providerBody) {
      content += `<div class="world_entry_form_control">`;
      content += `<h4>${esc(translate("Provider Error Body", "STMemoryBooks_ReviewFailedAI_ProviderBody"))}</h4>`;
      content += `<pre class="text_pole" style="white-space: pre-wrap; max-height: 200px; overflow:auto;"><code>${escapeHtml(providerBody)}</code></pre>`;
      content += `<div class="buttons_block gap10px"><button id="stmb-copy-provider" class="menu_button">${esc(translate("Copy Provider Body", "STMemoryBooks_ReviewFailedAI_CopyProvider"))}</button></div>`;
      content += `</div>`;
    }

    const popup = new Popup(DOMPurify.sanitize(content), POPUP_TYPE.TEXT, "", {
      wide: true,
      large: true,
      allowVerticalScrolling: true,
      okButton: false,
      cancelButton: translate("Close", "STMemoryBooks_Close"),
    });

    // Attach copy handlers before showing the popup so they are active immediately
    const dlg = popup.dlg;
    dlg.querySelector("#stmb-copy-raw")?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(raw);
        toastr.success(
          translate("Copied raw response", "STMemoryBooks_CopiedRaw"),
          "STMemoryBooks",
        );
      } catch {
        toastr.error(
          translate("Copy failed", "STMemoryBooks_CopyFailed"),
          "STMemoryBooks",
        );
      }
    });
    dlg
      .querySelector("#stmb-copy-provider")
      ?.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(providerBody);
          toastr.success(
            translate("Copied provider body", "STMemoryBooks_CopiedProvider"),
            "STMemoryBooks",
          );
        } catch {
          toastr.error(
            translate("Copy failed", "STMemoryBooks_CopyFailed"),
            "STMemoryBooks",
          );
        }
      });

    // Now show the popup
    void popup.show();
  } catch (e) {
    console.error("STMemoryBooks: Failed to show failed AI response popup:", e);
  }
}

/**
 * Initialize the extension with BULLETPROOF settings management
 */
async function init() {
  if (hasBeenInitialized) return;
  hasBeenInitialized = true;
  console.log("STMemoryBooks: Initializing");
  // Merge this extension's locale data into SillyTavern's current locale:
  // - Do not reinitialize ST i18n (host owns init)
  // - Load JSON for current locale if available, then ensure English fallback exists
  try {
    const current = getCurrentLocale?.() || "en";

    // Try to fetch JSON bundle for current locale (works without JSON import assertions)
    try {
      const jsonData = await loadLocaleJson(current);
      if (jsonData) {
        addLocaleData(current, jsonData);
      }
    } catch (e) {
      console.warn("STMemoryBooks: Failed to load JSON locale bundle:", e);
    }

    // Merge statically-bundled locales (English fallback, and any inline bundles)
    if (localeData && typeof localeData === "object") {
      if (localeData[current]) {
        addLocaleData(current, localeData[current]);
      }
      if (current !== "en" && localeData["en"]) {
        addLocaleData(
          current,
          Object.fromEntries(
            Object.entries(localeData["en"]).filter(([k]) => true),
          ),
        );
      }
    }
  } catch (e) {
    console.warn("STMemoryBooks: Failed to merge plugin locales:", e);
  }
  // Wait for SillyTavern to be ready
  let attempts = 0;
  const maxAttempts = 20;

  while (attempts < maxAttempts) {
    if (
      $(SELECTORS.extensionsMenu).length > 0 &&
      eventSource &&
      typeof Popup !== "undefined"
    ) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
    attempts++;
  }

  // Create UI now that extensions menu is available
  createUI();

  // Apply locale to any initial DOM injected by this module
  try {
    applyLocale();
  } catch (e) {
    /* no-op */
  }

  // Initialize settings with validation
  const settings = initializeSettings();
  const profileValidation = validateAndFixProfiles(settings);

  if (!profileValidation.valid) {
    console.warn(
      "STMemoryBooks: Profile validation issues found:",
      profileValidation.issues,
    );
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
    console.error("STMemoryBooks: Failed to initialize chat observer:", error);
    toastr.error(
      translate(
        "STMemoryBooks: Failed to initialize chat monitoring. Please refresh the page.",
        "STMemoryBooks_FailedToInitializeChatMonitoring",
      ),
      "STMemoryBooks",
    );
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
    console.log(
      "STMemoryBooks: Processed existing messages during initialization",
    );
  } catch (error) {
    console.error(
      "STMemoryBooks: Error processing existing messages during init:",
      error,
    );
  }

  // Add CSS classes helper for Handlebars
  Handlebars.registerHelper("eq", function (a, b) {
    return a === b;
  });

  console.log("STMemoryBooks: Extension loaded successfully");
}

/**
 * Regex selection helpers and popup
 */
function buildFlatRegexOptions() {
  const list = [];
  try {
    const scripts = getRegexScripts({ allowedOnly: false }) || [];
    scripts.forEach((script, index) => {
      const key = `idx:${index}`;
      const label = `${script?.scriptName || "Untitled"}${script?.disabled ? " (disabled)" : ""}`;
      list.push({ key, label });
    });
  } catch (e) {
    console.warn("STMemoryBooks: buildFlatRegexOptions failed", e);
  }
  return list;
}

async function showRegexSelectionPopup() {
  const settings = initializeSettings();
  const allOptions = buildFlatRegexOptions();
  const selOut = Array.isArray(settings.moduleSettings.selectedRegexOutgoing)
    ? settings.moduleSettings.selectedRegexOutgoing
    : [];
  const selIn = Array.isArray(settings.moduleSettings.selectedRegexIncoming)
    ? settings.moduleSettings.selectedRegexIncoming
    : [];

  let content = "";
  content +=
    '<h3 data-i18n="STMemoryBooks_RegexSelection_Title">📐 Regex selection</h3>';
  content +=
    '<div class="world_entry_form_control"><small class="opacity70p" data-i18n="STMemoryBooks_RegexSelection_Desc">Selecting a regex here will run it REGARDLESS of whether it is enabled or disabled.</small></div>';

  // Outgoing
  content += '<div class="world_entry_form_control">';
  content +=
    '<h4 data-i18n="STMemoryBooks_RegexSelection_Outgoing">Run regex before sending to AI</h4>';
  content += '<select id="stmb-regex-outgoing" multiple style="width:100%">';
  for (const o of allOptions) {
    const sel = selOut.includes(o.key) ? " selected" : "";
    content += `<option value="${escapeHtml(o.key)}"${sel}>${escapeHtml(o.label)}</option>`;
  }
  content += "</select>";
  content += "</div>";

  // Incoming
  content += '<div class="world_entry_form_control">';
  content +=
    '<h4 data-i18n="STMemoryBooks_RegexSelection_Incoming">Run regex before adding to lorebook (before previews)</h4>';
  content += '<select id="stmb-regex-incoming" multiple style="width:100%">';
  for (const o of allOptions) {
    const sel = selIn.includes(o.key) ? " selected" : "";
    content += `<option value="${escapeHtml(o.key)}"${sel}>${escapeHtml(o.label)}</option>`;
  }
  content += "</select>";
  content += "</div>";

  const popup = new Popup(content, POPUP_TYPE.TEXT, "", {
    wide: true,
    large: true,
    allowVerticalScrolling: true,
    okButton: translate("Save", "STMemoryBooks_Save"),
    cancelButton: translate("Close", "STMemoryBooks_Close"),
  });
  // Apply i18n to the newly created popup content
  try {
    applyLocale(popup.dlg);
  } catch (e) {
    /* noop */
  }

  setTimeout(() => {
    try {
      if (window.jQuery && typeof window.jQuery.fn.select2 === "function") {
        const $parent = window.jQuery(popup.dlg);
        window.jQuery("#stmb-regex-outgoing").select2({
          width: "100%",
          placeholder: translate(
            "Select outgoing regex…",
            "STMemoryBooks_RegexSelect_PlaceholderOutgoing",
          ),
          closeOnSelect: false,
          dropdownParent: $parent,
        });
        window.jQuery("#stmb-regex-incoming").select2({
          width: "100%",
          placeholder: translate(
            "Select incoming regex…",
            "STMemoryBooks_RegexSelect_PlaceholderIncoming",
          ),
          closeOnSelect: false,
          dropdownParent: $parent,
        });
      }
    } catch (e) {
      console.warn(
        "STMemoryBooks: Select2 initialization failed (using native selects)",
        e,
      );
    }
  }, 0);

  const res = await popup.show();

  if (res === POPUP_RESULT.AFFIRMATIVE) {
    try {
      const outVals = Array.from(
        popup.dlg?.querySelector("#stmb-regex-outgoing")?.selectedOptions || [],
      ).map((o) => o.value);
      const inVals = Array.from(
        popup.dlg?.querySelector("#stmb-regex-incoming")?.selectedOptions || [],
      ).map((o) => o.value);
      settings.moduleSettings.selectedRegexOutgoing = outVals;
      settings.moduleSettings.selectedRegexIncoming = inVals;
      saveSettingsDebounced();
      toastr.success(
        translate(
          "Regex selections saved",
          "STMemoryBooks_RegexSelectionsSaved",
        ),
        "STMemoryBooks",
      );
    } catch (e) {
      console.warn("STMemoryBooks: Failed to save regex selections", e);
      toastr.error(
        translate(
          "Failed to save regex selections",
          "STMemoryBooks_FailedToSaveRegexSelections",
        ),
        "STMemoryBooks",
      );
    }
  }
}

// Initialize when ready
$(document).ready(() => {
  if (eventSource && event_types.APP_READY) {
    eventSource.on(event_types.APP_READY, init);
  }
  // Fallback initialization
  setTimeout(init, 2000);
});
