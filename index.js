import {
  eventSource,
  event_types,
  chat,
  chat_metadata,
  saveSettingsDebounced,
  characters,
  this_chid,
  settings as st_settings,
} from "../../../../script.js";
import { Popup, POPUP_TYPE, POPUP_RESULT } from "../../../popup.js";
import {
  extension_settings,
} from "../../../extensions.js";
import { SlashCommandParser } from "../../../slash-commands/SlashCommandParser.js";
import { SlashCommand } from "../../../slash-commands/SlashCommand.js";
import { SlashCommandEnumValue } from "../../../slash-commands/SlashCommandEnumValue.js";
import {
  ARGUMENT_TYPE,
  SlashCommandArgument,
  SlashCommandNamedArgument,
} from "../../../slash-commands/SlashCommandArgument.js";
import { executeSlashCommands } from "../../../slash-commands.js";
import {
  METADATA_KEY,
  world_names,
  loadWorldInfo,
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
import { createMemory, parseAIJsonResponse } from "./stmemory.js";
import {
  addMemoryToLorebook,
  DEFAULT_LOREBOOK_ENTRY_SETTINGS,
  getDefaultTitleFormats,
  identifyMemoryEntries,
  getRangeFromMemoryEntry,
  normalizeLorebookEntrySettings,
} from "./addlore.js";
import { autoCreateLorebook } from "./autocreate.js";
import {
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
  getHighestMemoryProcessed
} from "./sceneManager.js";
import { settingsTemplate } from "./templates.js";
import {
  showConfirmationPopup,
  fetchPreviousSummaries,
  showMemoryPreviewPopup,
  closeActiveMemoryPreviewPopups,
} from "./confirmationPopup.js";
import {
  getDefaultPrompt,
  deepClone,
  getUIModelSettings,
  getCurrentApiInfo,
  SELECTORS,
  getCurrentMemoryBooksContext,
  getEffectiveLorebookName,
  showLorebookSelectionPopup,
  readIntInput,
  clampInt,
  createStmbInFlightTask,
  stmbStopAllInFlight,
  getStmbInFlightCount,
  isStmbStopError,
  throwIfStmbStopped,
} from "./utils.js";
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
import {
  runSummaryAnalysisSequential,
  commitSummaryEntries,
  parseSummaryJsonResponse,
} from "./arcanalysis.js";
import * as ArcPrompts from "./arcAnalysisPromptManager.js";
import {
  MIN_SUMMARY_CHILDREN,
  STMB_SUMMARY_TIERS,
  getDefaultSummaryMinChildren,
  getEntrySummaryTier,
  getSourceTierForTarget,
  getSummaryTierLabel,
  isEligibleSummarySourceEntry,
  migrateLorebookSummarySchema,
  normalizeSummaryMinChildren,
} from "./summaryTiers.js";
import { summaryPromptsTableTemplate } from "./templatesSummaryPrompts.js";
import {
  t as __st_t_tag,
  translate,
  applyLocale,
  addLocaleData,
  getCurrentLocale,
} from "../../../i18n.js";
import { localeData, loadLocaleJson } from "./locales.js";
import { tr } from "./i18nHelpers.js";
import { validateLorebookRequirement } from "./lorebookValidation.js";
import { getRegexScripts } from "../../../extensions/regex/engine.js";
import {
  buildSidePromptMacroSuggestion,
  collectTemplateRuntimeMacros,
  formatQuotedSidePromptName,
  parseSidePromptCommandInput,
} from "./sidePromptMacros.js";
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

async function handleHighestMemoryProcessedCommand() {
  // Return string so it works well as a value in STscript/closures
  return String(getHighestMemoryProcessed());
}

async function handleSetHighestMemoryProcessedCommand(namedArgs, unnamedArgs) {
  const raw = String(unnamedArgs || "").trim();

  if (!raw) {
    toastr.error(
      translate(
        "Missing argument. Use: /stmb-set-highest <N|none>",
        "STMemoryBooks_SetHighest_MissingArg",
      ),
      translate("STMemoryBooks", "index.toast.title"),
    );
    return "";
  }

  const stmbData = getSceneMarkers() || {};
  const lastIndex = chat.length - 1;

  if (raw.toLowerCase() === "none") {
    delete stmbData.highestMemoryProcessed;
    delete stmbData.highestMemoryProcessedManuallySet;
    saveMetadataForCurrentContext();
    await refreshPopupContent();
    toastr.success(
      translate(
        "Last processed message cleared (no memories processed).",
        "STMemoryBooks_SetHighest_Cleared",
      ),
      translate("STMemoryBooks", "index.toast.title"),
    );
    return "";
  }

  const parsed = parseInt(raw, 10);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
    toastr.error(
      translate(
        "Invalid argument. Use: /stmb-set-highest <N|none>",
        "STMemoryBooks_SetHighest_InvalidArg",
      ),
      translate("STMemoryBooks", "index.toast.title"),
    );
    return "";
  }

  if (lastIndex < 0) {
    toastr.error(
      translate(
        "There are no messages in this chat yet.",
        "STMemoryBooks_SetHighest_NoMessages",
      ),
      translate("STMemoryBooks", "index.toast.title"),
    );
    return "";
  }

  if (parsed < 0) {
    toastr.error(
      tr(
        "STMemoryBooks_SetHighest_OutOfRange",
        "Message IDs out of range. Valid range: 0-{{max}}",
        { max: lastIndex },
      ),
      translate("STMemoryBooks", "index.toast.title"),
    );
    return "";
  }

  const clamped = clampInt(parsed, 0, lastIndex);
  if (clamped !== parsed) {
    toastr.info(
      tr(
        "STMemoryBooks_SetHighest_Clamped",
        "Highest message is {{max}}, so last message processed has been set to {{max}}.",
        { max: lastIndex },
      ),
      translate("STMemoryBooks", "index.toast.title"),
    );
  }

  stmbData.highestMemoryProcessed = clamped;
  stmbData.highestMemoryProcessedManuallySet = true;
  saveMetadataForCurrentContext();
  await refreshPopupContent();

  toastr.success(
    tr(
      "STMemoryBooks_SetHighest_SetTo",
      "Last processed message manually set to #{{value}}.",
      { value: clamped },
    ),
    translate("STMemoryBooks", "index.toast.title"),
  );

  return "";
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

const DEFAULT_MAX_TOKENS = 4000;

const defaultSettings = {
  moduleSettings: {
    alwaysUseDefault: true,
    showMemoryPreviews: false,
    showNotifications: true,
    unhideBeforeMemory: false,
    refreshEditor: true,
    maxTokens: DEFAULT_MAX_TOKENS,
    tokenWarningThreshold: 50000,
    defaultMemoryCount: 0,
    autoClearSceneAfterMemory: false,
    manualModeEnabled: false,
    allowSceneOverlap: false,
    autoHideMode: "all",
    unhiddenEntriesCount: 2,
    autoSummaryEnabled: false,
    autoSummaryInterval: 50,
    autoSummaryBuffer: 2,
    autoConsolidationPromptEnabled: false,
    autoConsolidationTargetTiers: [1],
    autoCreateLorebook: false,
    lorebookNameTemplate: "LTM - {{char}} - {{chat}}",
    useRegex: false,
    selectedRegexOutgoing: [],
    selectedRegexIncoming: [],
    // Arc creation ordering (applies to newly created arcs)
    arcOrderMode: "auto",
    arcOrderValue: 100,
    arcReverseStart: 9999,
    summaryOrderMode: "auto",
    summaryOrderValue: 100,
    summaryReverseStart: 9999,
    summaryEntrySettings: {
      ...DEFAULT_LOREBOOK_ENTRY_SETTINGS,
    },
    summaryTierMinimums: {
      1: 5,
      2: 5,
      3: 5,
      4: 5,
      5: 5,
      6: 5,
    },
  },
  titleFormat: "[000] - {{title}}",
  profiles: [], // Will be populated dynamically with current ST settings
  defaultProfile: 0,
  migrationVersion: 4,
};

// Current state variables
let currentPopupInstance = null;
let isProcessingMemory = false;
let isProcessingArc = false;
let currentProfile = null;
let isDryRun = false;
/* Ephemeral failure state for AI errors */
let lastFailedAIError = null;
let lastFailureToast = null;
let lastFailedAIContext = null;
let lastFailedArcError = null;
let lastArcFailureToast = null;
let lastFailedArcContext = null;

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
  // Don't call getSceneData() here because it compiles the scene and will
  // return null for fully-hidden selections (which prevents /unhideBeforeMemory
  // from running inside initiateMemoryCreation).
  const markers = getSceneMarkers() || {};
  if (markers.sceneStart == null || markers.sceneEnd == null) {
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

function parseRequiredIntegerArg(namedArgs, name) {
  const value = namedArgs?.[name];
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && Number.isInteger(parsed) ? parsed : null;
}

function validateSceneMemoryRange(startId, endId) {
  // Validate range logic (start = end is valid for single message)
  if (startId > endId) {
    toastr.error(
      translate(
        "Start message cannot be greater than end message",
        "STMemoryBooks_StartGreaterThanEnd",
      ),
      translate("STMemoryBooks", "index.toast.title"),
    );
    return false;
  }

  // IMPORTANT: Use the global chat array for validation to match compileScene()
  const activeChat = chat;

  // Validate message IDs exist in current chat
  if (startId < 0 || endId >= activeChat.length) {
    toastr.error(
      __st_t_tag`Message IDs out of range. Valid range: 0-${activeChat.length - 1}`,
      translate("STMemoryBooks", "index.toast.title"),
    );
    return false;
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
    return false;
  }

  return true;
}

async function runSceneMemoryRange(startId, endId, options = {}) {
  const { showSceneToast = true } = options;

  if (!validateSceneMemoryRange(startId, endId)) {
    return false;
  }

  // Atomically set both scene markers for /scenememory
  setSceneRange(startId, endId);

  if (showSceneToast) {
    const context = getCurrentMemoryBooksContext();
    const contextMsg = context.isGroupChat
      ? ` in group "${context.groupName}"`
      : "";
    toastr.info(
      __st_t_tag`Scene set: messages ${startId}-${endId}${contextMsg}`,
      translate("STMemoryBooks", "index.toast.title"),
    );
  }

  return (await initiateMemoryCreation()) === true;
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

  await runSceneMemoryRange(startId, endId);

  return "";
}

async function handleStmbCatchupCommand(namedArgs) {
  try {
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

    const interval = parseRequiredIntegerArg(namedArgs, "interval");
    const startId = parseRequiredIntegerArg(namedArgs, "start");
    const endId = parseRequiredIntegerArg(namedArgs, "end");

    if (interval === null || startId === null || endId === null) {
      toastr.error(
        translate(
          "Missing or invalid arguments. Use: /stmb-catchup interval:<chunk size> start:<message id> end:<message id>",
          "STMemoryBooks_CatchupUsage",
        ),
        translate("STMemoryBooks", "index.toast.title"),
      );
      return "";
    }

    const context = getCurrentMemoryBooksContext();
    if (context.isGroupChat) {
      if (!context.groupId || !context.groupName) {
        toastr.error(
          translate(
            "Group chat data not available, please wait a few seconds and try again.",
            "STMemoryBooks_GroupChatDataUnavailable",
          ),
          translate("STMemoryBooks", "index.toast.title"),
        );
        return "";
      }
    } else if (!characters || characters.length === 0 || !characters[this_chid]) {
      toastr.error(
        translate(
          "This command can only be run in an active chat.",
          "STMemoryBooks_CatchupRequiresChat",
        ),
        translate("STMemoryBooks", "index.toast.title"),
      );
      return "";
    }

    const lastIndex = chat.length - 1;
    if (lastIndex < 0) {
      toastr.error(
        translate(
          "There are no messages in this chat yet.",
          "STMemoryBooks_SetHighest_NoMessages",
        ),
        translate("STMemoryBooks", "index.toast.title"),
      );
      return "";
    }

    if (interval <= 0) {
      toastr.error(
        translate(
          "Interval must be a positive whole number.",
          "STMemoryBooks_CatchupInvalidInterval",
        ),
        translate("STMemoryBooks", "index.toast.title"),
      );
      return "";
    }

    if (startId < 0 || endId < 0) {
      toastr.error(
        __st_t_tag`Message IDs out of range. Valid range: 0-${lastIndex}`,
        translate("STMemoryBooks", "index.toast.title"),
      );
      return "";
    }

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

    if (endId > lastIndex) {
      toastr.error(
        __st_t_tag`Message IDs out of range. Valid range: 0-${lastIndex}`,
        translate("STMemoryBooks", "index.toast.title"),
      );
      return "";
    }

    const chunks = [];
    for (let chunkStart = startId; chunkStart <= endId; chunkStart += interval) {
      const chunkEnd = Math.min(chunkStart + interval - 1, endId);
      if (!chat[chunkStart] || !chat[chunkEnd]) {
        toastr.error(
          __st_t_tag`Cannot run catch-up chunk ${chunkStart}-${chunkEnd}: one or more boundary messages do not exist.`,
          translate("STMemoryBooks", "index.toast.title"),
        );
        return "";
      }
      chunks.push({ start: chunkStart, end: chunkEnd });
    }

    toastr.info(
      __st_t_tag`STMB catch-up started: ${chunks.length} chunk${chunks.length === 1 ? "" : "s"}.`,
      translate("STMemoryBooks", "index.toast.title"),
    );

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      toastr.info(
        __st_t_tag`Creating catch-up memory ${i + 1}/${chunks.length}: messages ${chunk.start}-${chunk.end}`,
        translate("STMemoryBooks", "index.toast.title"),
      );

      const success = await runSceneMemoryRange(chunk.start, chunk.end, {
        showSceneToast: false,
      });

      if (!success) {
        toastr.error(
          __st_t_tag`STMB catch-up stopped at messages ${chunk.start}-${chunk.end}.`,
          translate("STMemoryBooks", "index.toast.title"),
        );
        return "";
      }
    }

    toastr.success(
      __st_t_tag`STMB catch-up complete: ${chunks.length} chunk${chunks.length === 1 ? "" : "s"} processed.`,
      translate("STMemoryBooks", "index.toast.title"),
    );
  } catch (error) {
    console.error("STMemoryBooks: /stmb-catchup failed:", error);
    toastr.error(
      __st_t_tag`Failed to run /stmb-catchup: ${error.message}`,
      translate("STMemoryBooks", "index.toast.title"),
    );
  }

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
      if (!lorebookValidation.handled) {
        toastr.error(
          translate(
            "No lorebook available: " + lorebookValidation.error,
            "STMemoryBooks_NoLorebookAvailable",
          ),
          translate("STMemoryBooks", "index.toast.title"),
        );
      }
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
 * Slash: /stmb-stop
 * Panic button: stop all in-flight STMB generation everywhere.
 */
async function handleStmbStopCommand(namedArgs, unnamedArgs) {
  const before = getStmbInFlightCount();
  const { stoppedCount } = stmbStopAllInFlight();

  // Force-reset local "busy" flags so STMB returns to idle immediately.
  isProcessingMemory = false;
  isProcessingArc = false;

  const msg =
    stoppedCount > 0 || before > 0
      ? translate(
          "STMB generation manually stopped by user.",
          "STMemoryBooks_Stop_Stopped",
        )
      : translate(
          "STMB stop issued, but no generation is in progress.",
          "STMemoryBooks_Stop_None",
        );

  if (stoppedCount > 0 || before > 0) {
    try {
      toastr.clear();
    } catch (e) {
      /* noop */
    }
    try {
      closeActiveMemoryPreviewPopups();
    } catch (e) {
      /* noop */
    }
  }
  toastr.info(msg, "STMemoryBooks");
  console.log(`STMemoryBooks: ${msg}`);
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
        'SidePrompt guide: Choose a quoted template name, then fill any prompted macros. Usage: /sideprompt "Name" {{macro}}="value" [X-Y].',
        "STMemoryBooks_SidePromptGuide",
      ),
      translate("STMemoryBooks", "index.toast.title"),
    );
    return "";
  }
  return runSidePrompt(raw);
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
 * Side Prompt cache for autocomplete
 */
let sidePromptNameCache = [];

function isManualSidePromptEnabled(template) {
  const cmds = template?.triggers?.commands;
  return (
    Array.isArray(cmds) &&
    cmds.some((c) => String(c).toLowerCase() === "sideprompt")
  );
}

async function refreshSidePromptCache() {
  try {
    const tpls = await listTemplates();
    sidePromptNameCache = (tpls || [])
      .map((t) => ({
        name: t.name,
        runtimeMacros: collectTemplateRuntimeMacros(t),
        manualEnabled: isManualSidePromptEnabled(t),
      }));
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

function findCachedSidePromptByName(name, entries = sidePromptNameCache) {
  const target = String(name || "").toLowerCase();
  return entries.find((entry) => entry.name.toLowerCase() === target) || null;
}

function buildSidePromptNameSuggestions(rawInput, options = {}) {
  const { manualOnly = false } = options;
  const input = String(rawInput || "").trimStart();
  const filter = input.startsWith('"') || input.startsWith("'")
    ? input.slice(1).toLowerCase()
    : input.toLowerCase();
  const entries = manualOnly
    ? sidePromptNameCache.filter((entry) => entry.manualEnabled)
    : sidePromptNameCache;
  return entries.map((entry) =>
    new SlashCommandEnumValue(
      formatQuotedSidePromptName(entry.name),
      entry.runtimeMacros.length
        ? `Required macros: ${entry.runtimeMacros.join(", ")}`
        : "No required runtime macros",
      "name",
      "📝",
      () => !filter || entry.name.toLowerCase().includes(filter),
    ),
  );
}

function buildSidePromptMacroSuggestions(rawInput, draft, entry) {
  const provided = new Set(Object.keys(draft.runtimeMacros || {}));
  const remaining = (entry?.runtimeMacros || []).filter((token) => !provided.has(token));
  return remaining.map((token) =>
    new SlashCommandEnumValue(
      `${token}=""`,
      `Required macro for "${entry.name}"`,
      "macro",
      "{}",
      () => true,
      () => buildSidePromptMacroSuggestion(rawInput, draft, token),
      true,
    ),
  );
}

// Synchronous enum provider for slash command suggestions
const sidePromptTemplateEnumProvider = (executor, options = {}) => {
  const { manualOnly = false } = options;
  const rawInput = String(executor?.unnamedArgumentList?.[0]?.value || "");
  const draft = parseSidePromptCommandInput(rawInput, { allowIncomplete: true });
  const entries = manualOnly
    ? sidePromptNameCache.filter((entry) => entry.manualEnabled)
    : sidePromptNameCache;
  if (draft.nameClosed) {
    const entry = findCachedSidePromptByName(draft.name, entries);
    if (entry) {
      const macroSuggestions = buildSidePromptMacroSuggestions(rawInput, draft, entry);
      return macroSuggestions;
    }
  }
  return buildSidePromptNameSuggestions(rawInput, { manualOnly });
};

const manualSidePromptTemplateEnumProvider = (executor) =>
  sidePromptTemplateEnumProvider(executor, { manualOnly: true });

const allSidePromptTemplateEnumProvider = (executor) =>
  sidePromptTemplateEnumProvider(executor, { manualOnly: false });

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
  const currentVersion = extension_settings.STMemoryBooks.migrationVersion ?? 1;
  if (currentVersion < 4) {
    // Check if dynamic profile already exists (in case of partial migration)
    const hasBuiltinCurrentSTProfile =
      extension_settings.STMemoryBooks.profiles?.some(
        (p) =>
          p?.isBuiltinCurrentST ||
          p?.useDynamicSTSettings ||
          (p?.connection?.api === "current_st" &&
            p?.name === "Current SillyTavern Settings"),
      );

    if (!hasBuiltinCurrentSTProfile) {
      // Add dynamic profile for existing installations
      if (!extension_settings.STMemoryBooks.profiles) {
        extension_settings.STMemoryBooks.profiles = [];
      }

      // Insert dynamic profile at the beginning of the array
      const dynamicProfile = {
        name: "Current SillyTavern Settings",
        isBuiltinCurrentST: true,
        connection: {
          api: "current_st",
        },
        preset: "summary",
        constVectMode: "link",
        position: 0,
        orderMode: "auto",
        orderValue: 100,
        preventRecursion: false,
        delayUntilRecursion: false,
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
      isBuiltinCurrentST: true,
      connection: {
        api: "current_st",
      },
      preset: "summary",
      constVectMode: "link",
      position: 0,
      orderMode: "auto",
      orderValue: 100,
      preventRecursion: false,
      delayUntilRecursion: false,
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

  // Validate maxTokens and fall back to the app default when unset or invalid.
  // A value of 0 is intentional: it means "inherit SillyTavern's Chat Completion setting".
  if (settings.moduleSettings.maxTokens === undefined || settings.moduleSettings.maxTokens === null) {
    settings.moduleSettings.maxTokens = DEFAULT_MAX_TOKENS;
  } else {
    const mt = Number.parseInt(settings.moduleSettings.maxTokens, 10);
    settings.moduleSettings.maxTokens =
      Number.isFinite(mt) && mt >= 0 ? mt : DEFAULT_MAX_TOKENS;
  }

  if (
    !settings.moduleSettings.tokenWarningThreshold ||
    settings.moduleSettings.tokenWarningThreshold < 1000
  ) {
    settings.moduleSettings.tokenWarningThreshold = 50000;
  }

  settings.moduleSettings.defaultMemoryCount = clampInt(settings.moduleSettings.defaultMemoryCount ?? 0, 0, 7);
  if (
    settings.moduleSettings.unhiddenEntriesCount === undefined ||
    settings.moduleSettings.unhiddenEntriesCount === null
  ) {
    settings.moduleSettings.unhiddenEntriesCount = 2;
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

  settings.moduleSettings.autoSummaryBuffer = clampInt(settings.moduleSettings.autoSummaryBuffer ?? 0, 0, 50);
  if (settings.moduleSettings.autoConsolidationPromptEnabled === undefined) {
    settings.moduleSettings.autoConsolidationPromptEnabled = false;
  }
  settings.moduleSettings.autoConsolidationTargetTiers =
    normalizeAutoConsolidationTargetTiers(
      settings.moduleSettings.autoConsolidationTargetTiers ??
        settings.moduleSettings.autoConsolidationTargetTier,
      { fallback: [1] },
    );

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

  const legacyOrderMode =
    settings.moduleSettings.summaryOrderMode ??
    settings.moduleSettings.arcOrderMode ??
    "auto";
  const legacyOrderValue =
    settings.moduleSettings.summaryOrderValue ??
    settings.moduleSettings.arcOrderValue ??
    100;
  const legacyReverseStart =
    settings.moduleSettings.summaryReverseStart ??
    settings.moduleSettings.arcReverseStart ??
    9999;

  const som = String(legacyOrderMode || "").toLowerCase();
  settings.moduleSettings.summaryOrderMode =
    som === "manual" || som === "reverse" ? som : "auto";
  settings.moduleSettings.summaryOrderValue = clampInt(
    Number.isFinite(Number(legacyOrderValue))
      ? Math.trunc(Number(legacyOrderValue))
      : 100,
    0,
    9999,
  );
  settings.moduleSettings.summaryReverseStart = clampInt(
    Number.isFinite(Number(legacyReverseStart))
      ? Math.trunc(Number(legacyReverseStart))
      : 9999,
    100,
    9999,
  );

  settings.moduleSettings.summaryEntrySettings = normalizeLorebookEntrySettings(
    {
      ...(settings.moduleSettings.summaryEntrySettings || {}),
      orderMode:
        settings.moduleSettings.summaryEntrySettings?.orderMode ??
        settings.moduleSettings.summaryOrderMode,
      orderValue:
        settings.moduleSettings.summaryEntrySettings?.orderValue ??
        settings.moduleSettings.summaryOrderValue,
      reverseStart:
        settings.moduleSettings.summaryEntrySettings?.reverseStart ??
        settings.moduleSettings.summaryReverseStart,
    },
    defaultSettings.moduleSettings.summaryEntrySettings,
  );
  settings.moduleSettings.summaryOrderMode =
    settings.moduleSettings.summaryEntrySettings.orderMode;
  settings.moduleSettings.summaryOrderValue =
    settings.moduleSettings.summaryEntrySettings.orderValue;
  settings.moduleSettings.summaryReverseStart =
    settings.moduleSettings.summaryEntrySettings.reverseStart;

  settings.moduleSettings.arcOrderMode = settings.moduleSettings.summaryOrderMode;
  settings.moduleSettings.arcOrderValue = settings.moduleSettings.summaryOrderValue;
  settings.moduleSettings.arcReverseStart =
    settings.moduleSettings.summaryReverseStart;

  const defaultsByTier =
    deepClone(defaultSettings.moduleSettings.summaryTierMinimums) || {};
  const existingMinimums =
    settings.moduleSettings.summaryTierMinimums &&
    typeof settings.moduleSettings.summaryTierMinimums === "object"
      ? settings.moduleSettings.summaryTierMinimums
      : {};
  const normalizedMinimums = {};
  for (const cfg of STMB_SUMMARY_TIERS) {
    if (cfg.tier <= 0 || cfg.tier > 6) continue;
    const fallback = defaultsByTier[cfg.tier] ?? getDefaultSummaryMinChildren(cfg.tier);
    normalizedMinimums[cfg.tier] = normalizeSummaryMinChildren(
      existingMinimums[cfg.tier],
      fallback,
    );
  }
  settings.moduleSettings.summaryTierMinimums = normalizedMinimums;

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
export async function validateLorebook(skipAutoCreate = false) {
  return validateLorebookRequirement({
    skipAutoCreate,
    createContext: "chat",
  });
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
  const tokenThreshold = settings.moduleSettings.tokenWarningThreshold ?? 30000;
  const shouldShowConfirmation = !settings.moduleSettings.alwaysUseDefault || sceneData.estimatedTokens > tokenThreshold;

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
        memoryCount: clampInt(settings.moduleSettings.defaultMemoryCount ?? 0, 0, 7),
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
      temperature: currentSettings.temperature ?? 0.7,
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
    summaryCount: advancedOptions.memoryCount ?? 0,
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
function sleepWithAbort(ms, signal) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(resolve, ms);

    if (!signal) return;
    if (signal.aborted) {
      clearTimeout(timeoutId);
      const err = new Error("Cancelled");
      err.name = "AbortError";
      reject(err);
      return;
    }

    const onAbort = () => {
      clearTimeout(timeoutId);
      const err = new Error("Cancelled");
      err.name = "AbortError";
      reject(err);
    };
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

async function executeMemoryGeneration(
  sceneData,
  lorebookValidation,
  effectiveSettings,
  retryCount = 0,
  stmbTask = null,
) {
  const ownsTask = !stmbTask;
  if (!stmbTask) stmbTask = createStmbInFlightTask("MemoryGeneration");
  const runEpoch = stmbTask.epoch;
  const { profileSettings, summaryCount, tokenThreshold, settings } =
    effectiveSettings;
  currentProfile = profileSettings;
  let compiledScene = null;
  let memoryFetchResult = null;
  let sceneStats = null;

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
    throwIfStmbStopped(runEpoch);
    // Create and compile scene first
    const sceneRequest = createSceneRequest(
      sceneData.sceneStart,
      sceneData.sceneEnd,
    );
    compiledScene = compileScene(sceneRequest);

    // Validate compiled scene
    const validation = validateCompiledScene(compiledScene);
    if (!validation.valid) {
      throw new Error(
        `Scene compilation failed: ${validation.errors.join(", ")}`,
      );
    }

    // Fetch previous memories if requested
    let previousMemories = [];
    memoryFetchResult = {
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
    toastr.info(__st_t_tag`${workingToastMessage}`, "STMemoryBooks", {
      timeOut: 0,
    });

    // Add context and get stats (no intermediate toast)
    compiledScene.previousSummariesContext = previousMemories;
    sceneStats = await getSceneStats(compiledScene);
    const actualTokens = sceneStats?.estimatedTokens;

    // Generate memory silently
    const memoryResult = await createMemory(compiledScene, profileSettings, {
      tokenWarningThreshold: tokenThreshold,
      signal: stmbTask.signal,
    });
    stmbTask.throwIfStopped();
    throwIfStmbStopped(runEpoch);

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
      throwIfStmbStopped(runEpoch);

      if (previewResult.action === "cancel") {
        // User cancelled, abort the process
        return false;
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
          return false;
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
          return false;
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
          return false;
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

    throwIfStmbStopped(runEpoch);

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
    throwIfStmbStopped(runEpoch);

    // Update auto-summary baseline so the next trigger starts after this scene
    try {
      const stmbData = getSceneMarkers() || {};
      stmbData.highestMemoryProcessed = sceneData.sceneEnd;
      delete stmbData.highestMemoryProcessedManuallySet;
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
    lastFailedAIContext = null;
    const retryMsg =
      retryCount > 0 ? ` (succeeded on attempt ${retryCount + 1})` : "";
    toastr.success(
      __st_t_tag`Memory "${addResult.entryTitle}" created successfully${contextMsg}${retryMsg}!`,
      "STMemoryBooks",
    );
    await maybePromptAutoConsolidation(1, lorebookValidation);
    return true;
  } catch (error) {
    if (isStmbStopError(error)) {
      return false;
    }
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
      try {
        await sleepWithAbort(MEMORY_GENERATION.RETRY_DELAY_MS, stmbTask.signal);
      } catch (e) {
        if (isStmbStopError(e)) return false;
        throw e;
      }

      // Recursive retry
      return await executeMemoryGeneration(
        sceneData,
        lorebookValidation,
        effectiveSettings,
        retryCount + 1,
        stmbTask,
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
      lastFailedAIContext = {
        sceneData,
        compiledScene,
        profileSettings,
        lorebookValidation,
        memoryFetchResult,
        sceneStats,
        settings,
        summaryCount,
        tokenThreshold,
        sceneRange:
          compiledScene?.metadata?.sceneStart !== undefined
            ? `${compiledScene.metadata.sceneStart}-${compiledScene.metadata.sceneEnd}`
            : `${sceneData.sceneStart}-${sceneData.sceneEnd}`,
      };
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
    return false;
  } finally {
    if (ownsTask) {
      stmbTask.finish();
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
      return false;
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
      return false;
    }
  }

  // RACE CONDITION FIX: Check and set flag atomically
  if (isProcessingMemory) {
    return false;
  }

  // Set processing flag IMMEDIATELY after validation to prevent race conditions
  isProcessingMemory = true;

  try {
    const settings = initializeSettings();

    // Optionally unhide hidden messages before any scene compilation/token estimation.
    // getSceneData() compiles a scene for token estimation and can fail with "No visible messages"
    // when the selected range is hidden.
    if (settings?.moduleSettings?.unhideBeforeMemory) {
      const markers = getSceneMarkers() || {};
      if (markers.sceneStart !== null && markers.sceneEnd !== null) {
        try {
          await executeSlashCommands(`/unhide ${markers.sceneStart}-${markers.sceneEnd}`);
        } catch (e) {
          console.warn("STMemoryBooks: /unhide command failed or unavailable:", e);
        }
      }
    }

    // All the validation and processing logic
    const sceneData = await getSceneData();
    if (!sceneData) {
      console.error("STMemoryBooks: No scene selected for memory initiation");
      toastr.error(
        translate("No scene selected", "STMemoryBooks_NoSceneSelected"),
        "STMemoryBooks",
      );
      isProcessingMemory = false;
      return false;
    }

    const lorebookValidation = await validateLorebook();
    if (!lorebookValidation.valid) {
      if (!lorebookValidation.handled) {
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
      }
      isProcessingMemory = false;
      return false;
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
            return false;
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
      return false; // User cancelled
    }

    // Close settings popup if open
    if (currentPopupInstance) {
      currentPopupInstance.completeCancelled();
      currentPopupInstance = null;
    }

    // Execute the main process with retry logic
    return await executeMemoryGeneration(
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
    return false;
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
      const chatBoundLorebook = chat_metadata?.[METADATA_KEY] ?? null;
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
  const promptButtonsContainer = currentPopupInstance.content.querySelector(
    "#stmb-prompt-manager-buttons",
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

        const selectedIndex = clampInt(readIntInput(profileSelect, settings.defaultProfile ?? 0), 0, settings.profiles.length - 1);
        if (selectedIndex === settings.defaultProfile) {
          return;
        }

        settings.defaultProfile = selectedIndex;
        saveSettingsDebounced();
        const displayName = settings.profiles[selectedIndex]?.isBuiltinCurrentST
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

          const selectedIndex = clampInt(readIntInput(profileSelect, settings.defaultProfile ?? 0), 0, settings.profiles.length - 1);
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

          const selectedIndex = readIntInput(profileSelect, settings.defaultProfile ?? 0);
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
  ];

  // Create additional function buttons
  const promptManagerButtons = [
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
        translate(
          "Consolidation Prompt Manager",
          "STMemoryBooks_ArcPromptManager",
        ),
      id: "stmb-arc-prompt-manager",
      action: async () => {
        try {
          await showArcPromptManagerPopup();
        } catch (error) {
          console.error(
            `${MODULE_NAME}: Error opening Consolidation Prompt Manager:`,
            error,
          );
          toastr.error(
            translate(
              "Failed to open Consolidation Prompt Manager",
              "STMemoryBooks_FailedToOpenArcPromptManager",
            ),
            "STMemoryBooks",
          );
        }
      },
    },
    {
      text: "🎡 " + translate("Trackers & Side Prompts", "STMemoryBooks_SidePrompts"),
      id: "stmb-side-prompts",
      action: async () => {
        try {
          await showSidePromptsPopup();
        } catch (error) {
          console.error(`${MODULE_NAME}: Error opening Trackers & Side Prompts Manager:`, error);
          toastr.error(
            translate(
              "Failed to open Trackers & Side Prompts Manager",
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
  promptButtonsContainer.innerHTML = "";

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

  // break out prompt manager buttons
  promptManagerButtons.forEach((buttonConfig) => {
    const button = document.createElement("div");
    button.className = "menu_button interactable whitespacenowrap";
    button.id = buttonConfig.id;
    button.textContent = buttonConfig.text;
    button.addEventListener("click", buttonConfig.action);
    promptButtonsContainer.appendChild(button);
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
    let selectedIndex = settings.defaultProfile ?? 0;
    if (currentPopupInstance?.dlg) {
      const profileSelect = currentPopupInstance.dlg.querySelector(
        "#stmb-profile-select",
      );
      if (profileSelect) {
        selectedIndex = readIntInput(profileSelect, settings.defaultProfile ?? 0);
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
    `<h3 data-i18n="STMemoryBooks_DeletePresetTitle">Delete Preset</h3><p>${escapeHtml(tr("STMemoryBooks_DeletePresetConfirm", 'Are you sure you want to delete "{{name}}"?', { name: displayName }))}</p>`,
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
      '<h3 data-i18n="STMemoryBooks_ArcPromptManager_Title">🧱 Consolidation Prompt Manager</h3>';
    content += '<div class="world_entry_form_control">';
    content +=
      '<p data-i18n="STMemoryBooks_ArcPromptManager_Desc">Manage your Consolidation Analysis prompts. All presets are editable.</p>';
    content += "</div>";

    // Search/filter box
    content += '<div class="world_entry_form_control">';
    content +=
      '<input type="text" id="stmb-apm-search" class="text_pole" placeholder="Search consolidation presets..." aria-label="Search consolidation presets" data-i18n="[placeholder]STMemoryBooks_ArcPromptManager_Search;[aria-label]STMemoryBooks_ArcPromptManager_Search" />';
    content += "</div>";

    // Preset list container
    content +=
      '<div id="stmb-apm-list" class="padding10 marginBot10" style="max-height: 400px; overflow-y: auto;"></div>';

    // Action buttons
    content +=
      '<div class="buttons_block justifyCenter gap10px whitespacenowrap">';
    content +=
      '<button id="stmb-apm-new" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_ArcPromptManager_New">➕ New Consolidation Preset</button>';
    content +=
      '<button id="stmb-apm-export" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_ArcPromptManager_Export">📤 Export JSON</button>';
    content +=
      '<button id="stmb-apm-import" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_ArcPromptManager_Import">📥 Import JSON</button>';
    content +=
      '<button id="stmb-apm-recreate-builtins" class="menu_button whitespacenowrap" data-i18n="STMemoryBooks_ArcPromptManager_RecreateBuiltins">♻️ Recreate Built-in Consolidation Prompts</button>';
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
    console.error(
      "STMemoryBooks: Error showing Consolidation Prompt Manager:",
      error,
    );
    toastr.error(
      translate(
        "Failed to open Consolidation Prompt Manager",
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
                        "This will remove overrides for all built‑in presets (multi-arc, single, tiny). Any customizations to these built-ins will be lost. After this, built-ins will follow the current app locale.",
                        "STMemoryBooks_RecreateArcBuiltinsWarning",
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
    `<h3 data-i18n="STMemoryBooks_DeletePresetTitle">Delete Preset</h3><p>${escapeHtml(tr("STMemoryBooks_DeletePresetConfirm", 'Are you sure you want to delete "{{name}}"?', { name: displayName }))}</p>`,
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

function pluralizeSummaryLabel(label) {
  const raw = String(label || "").trim();
  if (!raw) return "Entries";
  if (/series$/i.test(raw)) return raw;
  if (/memory$/i.test(raw)) return `${raw.slice(0, -1)}ies`;
  if (/y$/i.test(raw)) return `${raw.slice(0, -1)}ies`;
  return `${raw}s`;
}

function normalizeAutoConsolidationTargetTiers(value, options = {}) {
  const fallback = Array.isArray(options?.fallback)
    ? options.fallback
    : [1];

  if (value === undefined || value === null) {
    return [...fallback];
  }

  const isExplicitCollection =
    Array.isArray(value) || typeof value === "string";
  const rawValues = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[,\s]+/g)
      : [value];
  const normalized = Array.from(
    new Set(
      rawValues
        .map((item) => Number(item))
        .filter((item) => Number.isFinite(item))
        .map((item) => clampInt(Math.trunc(item), 1, 5))
        .filter((item) => item >= 1 && item <= 5),
    ),
  ).sort((a, b) => a - b);
  if (normalized.length) {
    return normalized;
  }
  return isExplicitCollection ? [] : [...fallback];
}

function getSummaryTierOptions() {
  return STMB_SUMMARY_TIERS.filter((cfg) => cfg.tier >= 1 && cfg.tier <= 6).map(
    (cfg) => ({
      value: cfg.tier,
      label: `${cfg.tier} - ${cfg.label}`,
    }),
  );
}

function getAutoConsolidationTierOptions() {
  return getSummaryTierOptions().filter((option) => Number(option.value) <= 5);
}

async function maybePromptAutoConsolidation(targetTier, lorebookValidation = null) {
  try {
    const settings = initializeSettings();
    if (!settings?.moduleSettings?.autoConsolidationPromptEnabled) {
      return;
    }

    const normalizedTargetTier = clampInt(Number(targetTier), 1, 6);
    const configuredTargetTiers = normalizeAutoConsolidationTargetTiers(
      settings.moduleSettings.autoConsolidationTargetTiers ??
        settings.moduleSettings.autoConsolidationTargetTier,
    );
    if (!configuredTargetTiers.includes(normalizedTargetTier)) {
      return;
    }

    const sourceTier = getSourceTierForTarget(normalizedTargetTier);
    const lorebookState =
      lorebookValidation && lorebookValidation.valid
        ? lorebookValidation
        : await validateLorebook(true);
    if (!lorebookState?.valid || !lorebookState?.data) {
      return;
    }

    const lorebookData = lorebookState.data;
    if (migrateLorebookSummarySchema(lorebookData)) {
      await saveWorldInfo(lorebookState.name, lorebookData, true);
    }

    const requiredMin = normalizeSummaryMinChildren(
      settings.moduleSettings.summaryTierMinimums?.[normalizedTargetTier],
      getDefaultSummaryMinChildren(normalizedTargetTier),
    );
    const eligibleCount = Object.values(lorebookData.entries || {}).filter((entry) =>
      isEligibleSummarySourceEntry(entry, sourceTier),
    ).length;
    if (eligibleCount < requiredMin) {
      return;
    }

    const stmbData = getSceneMarkers() || {};
    const promptKey = `${normalizedTargetTier}:${eligibleCount}`;
    if (stmbData.autoConsolidationLastPromptKey === promptKey) {
      return;
    }
    stmbData.autoConsolidationLastPromptKey = promptKey;
    saveMetadataForCurrentContext();

    const sourceLabel = getSummaryTierLabel(sourceTier).toLowerCase();
    const sourcePlural = pluralizeSummaryLabel(sourceLabel).toLowerCase();
    const targetLabel = getSummaryTierLabel(normalizedTargetTier).toLowerCase();
    const content = `
      <h3>${escapeHtml(translate("Consolidation Available", "STMemoryBooks_AutoConsolidationPrompt_Title"))}</h3>
      <p>${escapeHtml(
        tr(
          "STMemoryBooks_AutoConsolidationPrompt_Body",
          "You now have {{count}} eligible {{sourcePlural}}. That meets the minimum of {{min}} needed to create a {{targetLabel}}.",
          {
            count: eligibleCount,
            sourcePlural,
            min: requiredMin,
            targetLabel,
          },
        ),
      )}</p>
      <p class="opacity70p">${escapeHtml(
        translate(
          "Open Consolidate Memories now?",
          "STMemoryBooks_AutoConsolidationPrompt_Question",
        ),
      )}</p>
    `;

    const popup = new Popup(content, POPUP_TYPE.CONFIRM, "", {
      okButton: translate(
        "Open Consolidation",
        "STMemoryBooks_OpenConsolidation",
      ),
      cancelButton: translate("Later", "STMemoryBooks_Later"),
    });
    const result = await popup.show();
    if (result === POPUP_RESULT.AFFIRMATIVE) {
      await showSummaryConsolidationPopup({
        initialTargetTier: normalizedTargetTier,
      });
    }
  } catch (error) {
    console.error("STMemoryBooks: Auto-consolidation prompt check failed:", error);
  }
}

function clearAutoConsolidationPromptState(targetTier) {
  const stmbData = getSceneMarkers() || {};
  const prefix = `${clampInt(Number(targetTier), 1, 6)}:`;
  if (
    typeof stmbData.autoConsolidationLastPromptKey === "string" &&
    stmbData.autoConsolidationLastPromptKey.startsWith(prefix)
  ) {
    delete stmbData.autoConsolidationLastPromptKey;
    saveMetadataForCurrentContext();
  }
}

/**
 * Show summary consolidation popup
 */
async function showSummaryConsolidationPopup(popupOptions = {}) {
  try {
    // Do not auto-create a lorebook for this path; allow UI to render
    const lorebookValidation = await validateLorebook(true);

    if (lorebookValidation?.handled) {
      return;
    }

    // If no lorebook is assigned, show a toast but still render the popup
    let lorebookName = lorebookValidation?.name || null;
    let lorebookData = lorebookValidation?.data || { entries: {} };

    if (!lorebookValidation?.valid || !lorebookName) {
      toastr.info(
        "No memory lorebook currently assigned, no memories found.",
        "SillyTavern Memory Books",
      );
      // Keep rendering the popup with empty data so the UI can render
      lorebookName = null;
      lorebookData = { entries: {} };
    }

    if (lorebookName && migrateLorebookSummarySchema(lorebookData)) {
      await saveWorldInfo(lorebookName, lorebookData, true);
    }

    const allEntries = Object.values(lorebookData.entries || {});
    const parseOrder = (t) => {
      if (typeof t !== "string") return 0;
      const m1 = t.match(/\[(\d+)\]/);
      if (m1) return parseInt(m1[1], 10);
      const m2 = t.match(/^(\d+)[\s-]/);
      if (m2) return parseInt(m2[1], 10);
      return 0;
    };
    const sortEntries = (entries) =>
      [...entries].sort(
        (a, b) => parseOrder(a.comment || "") - parseOrder(b.comment || ""),
      );

    // Presets for Arc Analysis
    await ArcPrompts.firstRunInitIfMissing(extension_settings?.STMemoryBooks);
    const presets = await ArcPrompts.listPresets();
    const defaultPresetKey = "arc_default";

    // Defaults from settings
    const settings = initializeSettings();
    const tokenThreshold = settings?.moduleSettings?.tokenWarningThreshold ?? 30000;
    const arcOrderMode = String(settings?.moduleSettings?.summaryOrderMode || "auto");
    const arcOrderValue = Number.isFinite(Number(settings?.moduleSettings?.summaryOrderValue))
      ? Math.trunc(Number(settings.moduleSettings.summaryOrderValue))
      : 100;
    const arcReverseStart = Number.isFinite(Number(settings?.moduleSettings?.summaryReverseStart))
      ? Math.trunc(Number(settings.moduleSettings.summaryReverseStart))
      : 9999;
    const summaryEntrySettings = normalizeLorebookEntrySettings(
      settings?.moduleSettings?.summaryEntrySettings,
      {
        ...DEFAULT_LOREBOOK_ENTRY_SETTINGS,
        orderMode: arcOrderMode,
        orderValue: arcOrderValue,
        reverseStart: arcReverseStart,
      },
    );
    const tierOptions = getSummaryTierOptions();
    const initialTargetTier = clampInt(
      Number(popupOptions?.initialTargetTier ?? 1),
      1,
      6,
    );

    let content = "";
    content += `<h3>${escapeHtml(translate("Consolidate Memories", "STMemoryBooks_ConsolidateArcs_Title"))}</h3>`;

    content += '<div class="world_entry_form_control">';
    content += `<label><strong>${escapeHtml(translate("Summary Tier", "STMemoryBooks_SummaryTier_Label"))}:</strong> `;
    content += '<select id="stmb-summary-tier" class="text_pole">';
    for (const cfg of tierOptions) {
      const selected = Number(cfg.value) === initialTargetTier ? " selected" : "";
      content += `<option value="${cfg.value}"${selected}>${escapeHtml(cfg.label)}</option>`;
    }
    content += "</select></label></div>";

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
    content += '<div class="flex-container">';
    content += `<label><span id="stmb-summary-maxpass-label">${escapeHtml(tr("STMemoryBooks_Arc_MaxPerPass", "Maximum number of {{stmbchildtier}} entries to process in each pass", { stmbchildtier: "memory" }))}</span> <input id="stmb-arc-maxpass" type="number" min="1" max="100" value="15" class="text_pole" style="width:80px"/></label>`;
    content += `<label>${escapeHtml(translate("Token Budget", "STMemoryBooks_Arc_TokenBudget"))} <input id="stmb-arc-token" type="number" min="1000" max="150000" value="${tokenThreshold}" class="text_pole" style="width:120px"/></label>`;
    content += `<label>${escapeHtml(translate("Number of automatic summary attempts", "STMemoryBooks_Arc_MaxPasses"))} <input id="stmb-arc-maxpasses" type="number" min="1" max="50" value="10" class="text_pole" style="width:100px"/></label>`;
    content += `<label><span id="stmb-summary-minassigned-label">${escapeHtml(tr("STMemoryBooks_Arc_MinAssigned", "Saved minimum eligible {{stmbchildtier}} needed before {{stmbtier}} is ready", { stmbchildtier: "memories", stmbtier: "arc" }))}</span> <input id="stmb-arc-minassigned" type="number" min="${MIN_SUMMARY_CHILDREN}" step="1" value="${getDefaultSummaryMinChildren(initialTargetTier)}" class="text_pole" style="width:110px"/></label>`;
    content += `<small id="stmb-summary-minassigned-note" class="opacity70p">${escapeHtml(translate("Also used for auto-consolidation readiness for this tier.", "STMemoryBooks_Arc_MinAssignedNote"))}</small>`;
    content += "</div>";

    // Saved lorebook entry settings for summaries
    content += '<div class="world_entry_form_control">';
    content += `<div><h4 class="stmb-section-title">${escapeHtml(translate("Lorebook Entry Settings", "STMemoryBooks_LorebookEntrySettings"))}</h4></div>`;
    content += `<small class="opacity70p">${escapeHtml(translate("These settings control how the generated summary is saved into the lorebook.", "STMemoryBooks_ConsolidateArcs_LorebookEntrySettingsDesc"))}</small>`;
    content += '</div>';

    content += '<div class="world_entry_form_control">';
    content += `<label for="stmb-summary-entry-const-vect"><strong>${escapeHtml(translate("Activation Mode", "STMemoryBooks_ActivationMode"))}:</strong></label>`;
    content += `<small class="opacity70p">${escapeHtml(translate("Vectorized is recommended for summaries.", "STMemoryBooks_ConsolidateArcs_ActivationModeDesc"))}</small>`;
    content += '<select id="stmb-summary-entry-const-vect" class="text_pole">';
    content += `<option value="link"${summaryEntrySettings.constVectMode === "link" ? " selected" : ""}>${escapeHtml(translate("Vectorized (Default)", "STMemoryBooks_Vectorized"))}</option>`;
    content += `<option value="blue"${summaryEntrySettings.constVectMode === "blue" ? " selected" : ""}>${escapeHtml(translate("Constant", "STMemoryBooks_Constant"))}</option>`;
    content += `<option value="green"${summaryEntrySettings.constVectMode === "green" ? " selected" : ""}>${escapeHtml(translate("Normal", "STMemoryBooks_Normal"))}</option>`;
    content += "</select>";
    content += "</div>";

    content += '<div class="world_entry_form_control">';
    content += `<label for="stmb-summary-entry-position"><strong>${escapeHtml(translate("Insertion Position", "STMemoryBooks_InsertionPosition"))}:</strong></label>`;
    content += `<small class="opacity70p">${escapeHtml(translate("Choose where consolidated summaries should be inserted in the lorebook.", "STMemoryBooks_ConsolidateArcs_InsertionPositionDesc"))}</small>`;
    content += '<select id="stmb-summary-entry-position" class="text_pole">';
    content += `<option value="0"${summaryEntrySettings.position === 0 ? " selected" : ""}>${escapeHtml(translate("↑Char", "STMemoryBooks_CharUp"))}</option>`;
    content += `<option value="1"${summaryEntrySettings.position === 1 ? " selected" : ""}>${escapeHtml(translate("↓Char", "STMemoryBooks_CharDown"))}</option>`;
    content += `<option value="5"${summaryEntrySettings.position === 5 ? " selected" : ""}>${escapeHtml(translate("↑EM", "STMemoryBooks_EMUp"))}</option>`;
    content += `<option value="6"${summaryEntrySettings.position === 6 ? " selected" : ""}>${escapeHtml(translate("↓EM", "STMemoryBooks_EMDown"))}</option>`;
    content += `<option value="2"${summaryEntrySettings.position === 2 ? " selected" : ""}>${escapeHtml(translate("↑AN", "STMemoryBooks_ANUp"))}</option>`;
    content += `<option value="3"${summaryEntrySettings.position === 3 ? " selected" : ""}>${escapeHtml(translate("↓AN", "STMemoryBooks_ANDown"))}</option>`;
    content += `<option value="7"${summaryEntrySettings.position === 7 ? " selected" : ""}>${escapeHtml(translate("Outlet", "STMemoryBooks_Outlet"))}</option>`;
    content += "</select>";
    content += "</div>";

    content += `<div id="stmb-summary-entry-outlet-name-container" class="world_entry_form_control${summaryEntrySettings.position === 7 ? "" : " displayNone"}">`;
    content += `<label for="stmb-summary-entry-outlet-name"><strong>${escapeHtml(translate("Outlet Name", "STMemoryBooks_OutletName"))}:</strong></label>`;
    content += `<input type="text" id="stmb-summary-entry-outlet-name" class="text_pole" placeholder="${escapeHtml(translate("Outlet name", "STMemoryBooks_OutletNamePlaceholder"))}" value="${escapeHtml(summaryEntrySettings.outletName || "")}">`;
    content += "</div>";

    content += '<div class="world_entry_form_control">';
    content += `<div><h4 class="stmb-section-title">${escapeHtml(translate("Insertion Order", "STMemoryBooks_InsertionOrder"))}</h4></div>`;
    content += `<small class="opacity70p">${escapeHtml(translate("Controls the lorebook 'order' for newly created summaries only.", "STMemoryBooks_Arc_Order_Help"))}</small>`;
    content += '<div style="display:flex; flex-direction:column; gap:6px; margin-top:6px">';
    content += `<label class="checkbox_label"><input type="radio" name="stmb-arc-order-mode" value="auto"${
      summaryEntrySettings.orderMode === "auto" ? " checked" : ""
    }> <span>${escapeHtml(translate("Auto (uses summary #)", "STMemoryBooks_Arc_AutoOrder"))}</span></label>`;
    content += `<label class="checkbox_label"><input type="radio" name="stmb-arc-order-mode" value="reverse"${
      summaryEntrySettings.orderMode === "reverse" ? " checked" : ""
    }> <span>${escapeHtml(translate("Reverse (only use with Outlets)", "STMemoryBooks_ReverseOrder"))}</span> <input type="number" id="stmb-arc-reverse-start" value="${escapeHtml(String(summaryEntrySettings.reverseStart))}" class="text_pole ${
      summaryEntrySettings.orderMode === "reverse" ? "" : "displayNone"
    } width100px" min="100" max="9999" step="1" style="margin-left: auto;"></label>`;
    content += `<label class="checkbox_label"><input type="radio" name="stmb-arc-order-mode" value="manual"${
      summaryEntrySettings.orderMode === "manual" ? " checked" : ""
    }> <span>${escapeHtml(translate("Manual", "STMemoryBooks_ManualOrder"))}</span> <input type="number" id="stmb-arc-order-value" value="${escapeHtml(String(summaryEntrySettings.orderValue))}" class="text_pole ${
      summaryEntrySettings.orderMode === "manual" ? "" : "displayNone"
    } width100px" min="0" max="9999" step="1" style="margin-left: auto;"></label>`;
    content += "</div>";
    content += "</div>";

    content += '<div class="world_entry_form_control">';
    content += `<div><h4 class="stmb-section-title">${escapeHtml(translate("Recursion Settings", "STMemoryBooks_RecursionSettings"))}</h4></div>`;
    content += '<div class="buttons_block justifyCenter">';
    content += `<label class="checkbox_label"><input type="checkbox" id="stmb-summary-entry-prevent-recursion"${
      summaryEntrySettings.preventRecursion ? " checked" : ""
    }> <span>${escapeHtml(translate("Prevent Recursion", "STMemoryBooks_PreventRecursion"))}</span></label>`;
    content += `<label class="checkbox_label"><input type="checkbox" id="stmb-summary-entry-delay-recursion"${
      summaryEntrySettings.delayUntilRecursion ? " checked" : ""
    }> <span>${escapeHtml(translate("Delay Until Recursion", "STMemoryBooks_DelayUntilRecursion"))}</span></label>`;
    content += '</div>';
    content += '</div>';

    // Disable originals toggle
    content += '<div class="world_entry_form_control" class="flex-container"><div class="flex flexFlowRow alignItemsBaseline">';
    content += `<label class="checkbox_label"><input id="stmb-arc-disable-originals" type="checkbox" checked /> ${escapeHtml(translate("Disable selected source entries after creating summaries", "STMemoryBooks_ConsolidateArcs_DisableOriginals"))}</label>`;
    content += "</div></div>";

    // Entries checklist
    content += `<div class="world_entry_form_control"><div id="stmb-summary-lock-status" class="opacity70p marginBot5"></div><div class="flex-container flexGap10 marginBot5">`;
    content += `<button id="stmb-arc-select-all" class="menu_button">${escapeHtml(translate("Select All", "STMemoryBooks_SelectAll"))}</button>`;
    content += `<button id="stmb-arc-deselect-all" class="menu_button">${escapeHtml(translate("Deselect All", "STMemoryBooks_DeselectAll"))}</button>`;
    content += `</div>`;
    content += `<div id="stmb-arc-list" style="max-height:300px; overflow-y:auto; border:1px solid var(--SmartHover2); padding:6px"></div>`;
    content += `<small id="stmb-summary-tip" class="opacity70p">${escapeHtml(translate("Tip: uncheck entries that should not be included.", "STMemoryBooks_ConsolidateArcs_Tip"))}</small>`;
    content += "</div>";

    let popup;
    const persistSummaryConsolidationPopupSettings = (popupElement) => {
      if (!popupElement) {
        return false;
      }

      const liveSettings = initializeSettings();
      const nextSummaryEntrySettings = readSummaryEntrySettings();
      let hasChanges = false;

      if (
        JSON.stringify(nextSummaryEntrySettings) !==
        JSON.stringify(liveSettings.moduleSettings.summaryEntrySettings || {})
      ) {
        liveSettings.moduleSettings.summaryEntrySettings = {
          ...nextSummaryEntrySettings,
        };
        liveSettings.moduleSettings.summaryOrderMode =
          nextSummaryEntrySettings.orderMode;
        liveSettings.moduleSettings.summaryOrderValue =
          nextSummaryEntrySettings.orderValue;
        liveSettings.moduleSettings.summaryReverseStart =
          nextSummaryEntrySettings.reverseStart;
        liveSettings.moduleSettings.arcOrderMode = nextSummaryEntrySettings.orderMode;
        liveSettings.moduleSettings.arcOrderValue =
          nextSummaryEntrySettings.orderValue;
        liveSettings.moduleSettings.arcReverseStart =
          nextSummaryEntrySettings.reverseStart;
        hasChanges = true;
      }

      if (hasChanges) {
        saveSettingsDebounced();
      }

      return hasChanges;
    };

    popup = new Popup(DOMPurify.sanitize(content), POPUP_TYPE.TEXT, "", {
      wide: true,
      large: true,
      allowVerticalScrolling: true,
      okButton: translate("Run", "STMemoryBooks_Run"),
      cancelButton: translate("Cancel", "STMemoryBooks_Cancel"),
      onClose: () => {
        try {
          persistSummaryConsolidationPopupSettings(popup?.dlg);
        } catch (error) {
          console.error(
            "STMemoryBooks: Failed to save consolidation popup settings:",
            error,
          );
        }
      },
    });

    // Attach handlers before show
    const dlg = popup.dlg;
    try {
      applyLocale(dlg);
    } catch (e) {
      /* noop */
    }
    const getCurrentTargetTier = () =>
      clampInt(readIntInput(dlg.querySelector("#stmb-summary-tier"), 1), 1, 6);
    const getCandidatesForTier = (targetTier) =>
      sortEntries(
        allEntries.filter((entry) =>
          isEligibleSummarySourceEntry(entry, getSourceTierForTarget(targetTier)),
        ),
      );
    const getSavedSummaryTierMinimum = (targetTier) =>
      settings.moduleSettings.summaryTierMinimums?.[targetTier] ??
      getDefaultSummaryMinChildren(targetTier);
    const readSummaryEntrySettings = () =>
      normalizeLorebookEntrySettings(
        {
          constVectMode:
            dlg.querySelector("#stmb-summary-entry-const-vect")?.value ||
            summaryEntrySettings.constVectMode,
          position: readIntInput(
            dlg.querySelector("#stmb-summary-entry-position"),
            summaryEntrySettings.position,
          ),
          outletName:
            dlg.querySelector("#stmb-summary-entry-outlet-name")?.value || "",
          orderMode:
            dlg.querySelector('input[name="stmb-arc-order-mode"]:checked')?.value ||
            summaryEntrySettings.orderMode,
          orderValue: readIntInput(
            dlg.querySelector("#stmb-arc-order-value"),
            summaryEntrySettings.orderValue,
          ),
          reverseStart: readIntInput(
            dlg.querySelector("#stmb-arc-reverse-start"),
            summaryEntrySettings.reverseStart,
          ),
          preventRecursion:
            !!dlg.querySelector("#stmb-summary-entry-prevent-recursion")?.checked,
          delayUntilRecursion:
            !!dlg.querySelector("#stmb-summary-entry-delay-recursion")?.checked,
        },
        summaryEntrySettings,
      );
    const persistCurrentTierMinimum = () => {
      const targetTier = getCurrentTargetTier();
      const minInput = dlg.querySelector("#stmb-arc-minassigned");
      const requiredMin = normalizeSummaryMinChildren(
        readIntInput(minInput, getSavedSummaryTierMinimum(targetTier)),
        getSavedSummaryTierMinimum(targetTier),
      );
      if (minInput) {
        minInput.value = String(requiredMin);
      }
      settings.moduleSettings.summaryTierMinimums[targetTier] = requiredMin;
      extension_settings.STMemoryBooks.moduleSettings.summaryTierMinimums[
        targetTier
      ] = requiredMin;
      saveSettingsDebounced();
      return requiredMin;
    };
    const renderTierState = () => {
      const targetTier = getCurrentTargetTier();
      const sourceTier = getSourceTierForTarget(targetTier);
      const sourceLabel = getSummaryTierLabel(sourceTier);
      const sourcePlural = pluralizeSummaryLabel(sourceLabel);
      const targetLabel = getSummaryTierLabel(targetTier);
      const candidates = getCandidatesForTier(targetTier);
      const requiredMin = normalizeSummaryMinChildren(
        getSavedSummaryTierMinimum(targetTier),
        getDefaultSummaryMinChildren(targetTier),
      );

      const minLabel = dlg.querySelector("#stmb-summary-minassigned-label");
      const maxPassLabel = dlg.querySelector("#stmb-summary-maxpass-label");
      if (maxPassLabel) {
        maxPassLabel.textContent = tr(
          "STMemoryBooks_Arc_MaxPerPass",
          "Maximum number of {{stmbchildtier}} entries to process in each pass",
          { stmbchildtier: sourceLabel.toLowerCase() },
        );
      }
      if (minLabel) {
        minLabel.textContent = tr(
          "STMemoryBooks_Arc_MinAssigned",
          "Saved minimum eligible {{stmbchildtier}} needed before {{stmbtier}} is ready",
          {
            stmbchildtier: sourcePlural.toLowerCase(),
            stmbtier: targetLabel.toLowerCase(),
          },
        );
      }
      const minInput = dlg.querySelector("#stmb-arc-minassigned");
      if (minInput) {
        minInput.value = String(requiredMin);
        minInput.min = String(MIN_SUMMARY_CHILDREN);
      }
      const locked = candidates.length < requiredMin;
      const statusEl = dlg.querySelector("#stmb-summary-lock-status");
      if (statusEl) {
        statusEl.textContent = `Need ${requiredMin} eligible ${sourcePlural}, have ${candidates.length}.`;
        statusEl.className = locked
          ? "info-block warning marginBot5"
          : "info-block marginBot5";
      }
      const tipEl = dlg.querySelector("#stmb-summary-tip");
      if (tipEl) {
        tipEl.textContent = `Tip: uncheck ${sourcePlural.toLowerCase()} that should not be included.`;
      }

      const listEl = dlg.querySelector("#stmb-arc-list");
      if (listEl) {
        listEl.innerHTML = "";
        for (const e of candidates) {
          const title = e.comment || "(untitled)";
          const uid = String(e.uid);
          const row = document.createElement("label");
          row.className = "flex-container flexGap10";
          row.style.alignItems = "center";
          row.style.margin = "2px 0";
          row.innerHTML = `<input type="checkbox" class="stmb-arc-item" value="${escapeHtml(uid)}" checked /> <span>${escapeHtml(title)}</span>`;
          listEl.appendChild(row);
        }
      }

      if (popup.okButton) {
        popup.okButton.style.pointerEvents = locked ? "none" : "";
        popup.okButton.style.opacity = locked ? "0.5" : "";
        popup.okButton.title = locked
          ? `Need at least ${requiredMin} eligible ${sourcePlural.toLowerCase()}`
          : "";
      }
    };
    dlg
      .querySelector("#stmb-summary-tier")
      ?.addEventListener("change", renderTierState);
    dlg
      .querySelector("#stmb-arc-minassigned")
      ?.addEventListener("input", () => {
        persistCurrentTierMinimum();
        const listEl = dlg.querySelector("#stmb-arc-list");
        const selectedById = new Set(
          Array.from(dlg.querySelectorAll(".stmb-arc-item"))
            .filter((cb) => cb.checked)
            .map((cb) => String(cb.value)),
        );
        renderTierState();
        if (listEl) {
          dlg.querySelectorAll(".stmb-arc-item").forEach((cb) => {
            cb.checked = selectedById.has(String(cb.value));
          });
        }
      });
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

    // Arc order mode visibility
    const syncSummaryEntrySettingsVisibility = () => {
      const mode =
        dlg.querySelector('input[name="stmb-arc-order-mode"]:checked')?.value ||
        "auto";
      const position = readIntInput(
        dlg.querySelector("#stmb-summary-entry-position"),
        summaryEntrySettings.position,
      );
      dlg
        .querySelector("#stmb-summary-entry-outlet-name-container")
        ?.classList.toggle("displayNone", position !== 7);
      dlg
        .querySelector("#stmb-arc-reverse-start")
        ?.classList.toggle("displayNone", mode !== "reverse");
      dlg
        .querySelector("#stmb-arc-order-value")
        ?.classList.toggle("displayNone", mode !== "manual");
    };
    dlg
      .querySelector("#stmb-summary-entry-position")
      ?.addEventListener("change", syncSummaryEntrySettingsVisibility);
    dlg
      .querySelectorAll('input[name="stmb-arc-order-mode"]')
      .forEach((el) => el.addEventListener("change", syncSummaryEntrySettingsVisibility));
    dlg
      .querySelectorAll(
        [
          "#stmb-summary-entry-const-vect",
          "#stmb-summary-entry-position",
          "#stmb-summary-entry-outlet-name",
          "#stmb-arc-reverse-start",
          "#stmb-arc-order-value",
          "#stmb-summary-entry-prevent-recursion",
          "#stmb-summary-entry-delay-recursion",
          'input[name="stmb-arc-order-mode"]',
        ].join(", "),
      )
      .forEach((el) =>
        el.addEventListener("change", () => {
          persistSummaryConsolidationPopupSettings(dlg);
        }),
      );
    syncSummaryEntrySettingsVisibility();
    renderTierState();

    // Rebuild Arc prompts from built-ins with backup and refresh preset list
    dlg
      .querySelector("#stmb-arc-rebuild-builtins")
      ?.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          const confirmContent = `
                    <h3>${escapeHtml(translate("Rebuild Consolidation Prompts from Built-ins", "STMemoryBooks_Arc_RebuildTitle"))}</h3>
                    <div class="info-block warning">
                        ${escapeHtml(translate("This will overwrite your saved Consolidation prompt presets with the built-ins. A timestamped backup will be created.", "STMemoryBooks_Arc_RebuildWarning"))}
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
            __st_t_tag`Rebuilt consolidation prompts (${result?.count || 0} presets)${backupMsg}`,
            "STMemoryBooks",
          );
        } catch (err) {
          console.error("STMemoryBooks: Arc prompts rebuild failed:", err);
          toastr.error(
            __st_t_tag`Failed to rebuild consolidation prompts: ${err.message}`,
            "STMemoryBooks",
          );
        }
      });

    const res = await popup.show();
    if (res !== POPUP_RESULT.AFFIRMATIVE) return;

    const targetTier = clampInt(
      readIntInput(dlg.querySelector("#stmb-summary-tier"), 1),
      1,
      6,
    );
    const sourceTier = getSourceTierForTarget(targetTier);
    const sourceLabel = getSummaryTierLabel(sourceTier);
    const targetLabel = getSummaryTierLabel(targetTier);
    const sourcePlural = pluralizeSummaryLabel(sourceLabel);
    const candidates = getCandidatesForTier(targetTier);
    const requiredMin = normalizeSummaryMinChildren(
      readIntInput(
        dlg.querySelector("#stmb-arc-minassigned"),
        settings.moduleSettings.summaryTierMinimums?.[targetTier] ??
          getDefaultSummaryMinChildren(targetTier),
      ),
      settings.moduleSettings.summaryTierMinimums?.[targetTier] ??
        getDefaultSummaryMinChildren(targetTier),
    );

    if (candidates.length < requiredMin) {
      toastr.error(
        `Need at least ${requiredMin} eligible ${sourcePlural.toLowerCase()} to create a ${targetLabel.toLowerCase()}.`,
        "STMemoryBooks",
      );
      return;
    }

    const selected = Array.from(dlg.querySelectorAll(".stmb-arc-item"))
      .filter((cb) => cb.checked)
      .map((cb) => cb.value);
    if (selected.length === 0) {
      toastr.error(
        `Select at least one ${sourceLabel.toLowerCase()} to consolidate.`,
        "STMemoryBooks",
      );
      return;
    }

    if (!lorebookName) {
      toastr.info(
        "Summary consolidation requires a memory lorebook. No lorebook assigned.",
        "STMemoryBooks",
      );
      return;
    }

    const presetKey = String(
      dlg.querySelector("#stmb-arc-preset")?.value || "arc_default",
    );
    const options = {
      presetKey,
      targetTier,
      maxItemsPerPass: Math.max(
        1,
        readIntInput(dlg.querySelector("#stmb-arc-maxpass"), 12),
      ),
      maxPasses: Math.max(
        1,
        readIntInput(dlg.querySelector("#stmb-arc-maxpasses"), 10),
      ),
      minAssigned: requiredMin,
      tokenTarget: Math.max(
        1000,
        readIntInput(dlg.querySelector("#stmb-arc-token"), tokenThreshold),
      ),
    };
    const disableOriginals = !!dlg.querySelector("#stmb-arc-disable-originals")
      ?.checked;

    const chosenSummaryEntrySettings = readSummaryEntrySettings();
    const normalizedArcOrderMode = chosenSummaryEntrySettings.orderMode;
    const chosenArcOrderValue = chosenSummaryEntrySettings.orderValue;
    const chosenArcReverseStart = chosenSummaryEntrySettings.reverseStart;
    extension_settings.STMemoryBooks.moduleSettings.summaryOrderMode =
      normalizedArcOrderMode;
    extension_settings.STMemoryBooks.moduleSettings.summaryOrderValue =
      chosenArcOrderValue;
    extension_settings.STMemoryBooks.moduleSettings.summaryReverseStart =
      chosenArcReverseStart;
    settings.moduleSettings.summaryOrderMode = normalizedArcOrderMode;
    settings.moduleSettings.summaryOrderValue = chosenArcOrderValue;
    settings.moduleSettings.summaryReverseStart = chosenArcReverseStart;
    extension_settings.STMemoryBooks.moduleSettings.summaryEntrySettings = {
      ...chosenSummaryEntrySettings,
    };
    settings.moduleSettings.summaryEntrySettings = {
      ...chosenSummaryEntrySettings,
    };
    extension_settings.STMemoryBooks.moduleSettings.summaryTierMinimums[
      targetTier
    ] = requiredMin;
    extension_settings.STMemoryBooks.moduleSettings.arcOrderMode =
      normalizedArcOrderMode;
    extension_settings.STMemoryBooks.moduleSettings.arcOrderValue =
      chosenArcOrderValue;
    extension_settings.STMemoryBooks.moduleSettings.arcReverseStart =
      chosenArcReverseStart;
    settings.moduleSettings.arcOrderMode = normalizedArcOrderMode;
    settings.moduleSettings.arcOrderValue = chosenArcOrderValue;
    settings.moduleSettings.arcReverseStart = chosenArcReverseStart;
    saveSettingsDebounced();

    const entryMap = new Map(candidates.map((e) => [String(e.uid), e]));
    const selectedEntries = selected
      .map((id) => entryMap.get(String(id)))
      .filter(Boolean);

    toastr.info(
      `Consolidating ${sourcePlural.toLowerCase()} into ${pluralizeSummaryLabel(
        targetLabel,
      ).toLowerCase()}...`,
      "STMemoryBooks",
      { timeOut: 0 },
    );

    let analysis;
    try {
      analysis = await runSummaryAnalysisSequential(selectedEntries, options, null);
    } catch (e) {
      if (isStmbStopError(e)) {
        return;
      }
      try {
        toastr.clear(lastArcFailureToast);
      } catch (e2) {}
      lastFailedArcError = e;
      lastFailedArcContext = {
        lorebookName,
        lorebookData,
        selectedEntries,
        options,
        disableOriginals,
        targetTier,
        summaryEntrySettings: chosenSummaryEntrySettings,
        summaryOrderMode: normalizedArcOrderMode,
        summaryOrderValue: chosenArcOrderValue,
        summaryReverseStart: chosenArcReverseStart,
      };

      if (e?.name === "ArcAIResponseError") {
        lastArcFailureToast = toastr.error(
          __st_t_tag`Summary analysis failed (invalid JSON): ${e.message}`,
          "STMemoryBooks",
          {
            timeOut: 0,
            extendedTimeOut: 0,
            closeButton: true,
            tapToDismiss: false,
            onclick: () => {
              try {
                showFailedSummaryResponsePopup(lastFailedArcError);
              } catch (e3) {
                console.error(e3);
              }
            },
          },
        );
      } else {
        toastr.error(
          __st_t_tag`Summary analysis failed: ${e.message}`,
          "STMemoryBooks",
        );
      }
      return;
    }
    const { summaryCandidates, leftovers } = analysis || {
      summaryCandidates: [],
      leftovers: [],
    };

    if (!summaryCandidates || summaryCandidates.length === 0) {
      const syntheticError = {
        name: "ArcAIResponseError",
        code: "SUMMARY_NO_USABLE_SUMMARIES",
        message: translate(
          "No usable summaries were produced from the model response.",
          "STMemoryBooks_ArcAnalysis_NoUsableArcs",
        ),
        rawText: analysis?.rawText || "",
        retryRawText: analysis?.retryRawText || "",
      };
      lastFailedArcError = syntheticError;
      lastFailedArcContext = {
        lorebookName,
        lorebookData,
        selectedEntries,
        options,
        disableOriginals,
        targetTier,
        summaryEntrySettings: chosenSummaryEntrySettings,
        summaryOrderMode: normalizedArcOrderMode,
        summaryOrderValue: chosenArcOrderValue,
        summaryReverseStart: chosenArcReverseStart,
      };
      try {
        toastr.clear(lastArcFailureToast);
      } catch (e2) {}
      lastArcFailureToast = toastr.warning(
        __st_t_tag`Summary analysis produced no usable summaries. Review the raw response to fix/extract a summary.`,
        "STMemoryBooks",
        {
          timeOut: 0,
          extendedTimeOut: 0,
          closeButton: true,
          tapToDismiss: false,
          onclick: () => {
            try {
              showFailedSummaryResponsePopup(lastFailedArcError);
            } catch (e3) {
              console.error(e3);
            }
          },
        },
      );
      try {
        showFailedSummaryResponsePopup(lastFailedArcError);
      } catch (e2) {
        console.error(e2);
      }
      return;
    }

    try {
      const res2 = await commitSummaryEntries({
         lorebookName,
         lorebookData,
         summaryCandidates,
         targetTier,
         disableOriginals,
         summaryEntrySettings: chosenSummaryEntrySettings,
         orderMode: normalizedArcOrderMode,
         orderValue: chosenArcOrderValue,
         reverseStart: chosenArcReverseStart,
      });
      const created = Array.isArray(res2?.results)
        ? res2.results.length
        : summaryCandidates.length;
      const createdLabel =
        created === 1
          ? targetLabel.toLowerCase()
          : pluralizeSummaryLabel(targetLabel).toLowerCase();
      let msg = `Created ${created} ${createdLabel}${leftovers?.length ? `, ${leftovers.length} leftover` : ""}.`;
      if (created === 1 && (!leftovers || leftovers.length === 0)) {
        msg += ` (all selected ${sourcePlural.toLowerCase()} were consumed into a single ${targetLabel.toLowerCase()})`;
      }
      toastr.success(__st_t_tag`${msg}`, "STMemoryBooks");
      lastFailedArcError = null;
      lastFailedArcContext = null;
      try {
        toastr.clear(lastArcFailureToast);
      } catch (e) {}
      lastArcFailureToast = null;
      clearAutoConsolidationPromptState(targetTier);
      if (targetTier < 6) {
        await maybePromptAutoConsolidation(targetTier + 1, {
          valid: true,
          name: lorebookName,
          data: lorebookData,
        });
      }
    } catch (e) {
      if (isStmbStopError(e)) {
        return;
      }
      toastr.error(
        __st_t_tag`Failed to commit summaries: ${e.message}`,
        "STMemoryBooks",
      );
    }
  } catch (error) {
    console.error("STMemoryBooks: showSummaryConsolidationPopup failed:", error);
    toastr.error(
      __st_t_tag`Failed to open consolidate popup: ${error.message}`,
      "STMemoryBooks",
    );
  }
}

async function showArcConsolidationPopup() {
  return showSummaryConsolidationPopup();
}

function initializeSettingsPopupSelect2() {
  if (!currentPopupInstance?.dlg) return;

  setTimeout(() => {
    try {
      if (!window.jQuery || typeof window.jQuery.fn.select2 !== "function") {
        return;
      }

      const $select = window.jQuery("#stmb-auto-consolidation-target-tier");
      if (!$select.length) return;

      if ($select.hasClass("select2-hidden-accessible")) {
        $select.select2("destroy");
      }

      $select.select2({
        width: "100%",
        placeholder: translate(
          "Select tiers…",
          "STMemoryBooks_AutoConsolidationTierPlaceholder",
        ),
        closeOnSelect: false,
        allowClear: true,
        dropdownParent: window.jQuery(currentPopupInstance.dlg),
      });
    } catch (error) {
      console.warn(
        "STMemoryBooks: Settings Select2 initialization failed (using native select)",
        error,
      );
    }
  }, 0);
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
  const chatBoundLorebook = chat_metadata?.[METADATA_KEY] ?? null;
  const manualLorebook = sceneMarkers?.manualLorebook ?? null;

  const templateData = {
    hasScene: !!sceneData,
    sceneData: sceneData,
    highestMemoryProcessed: sceneMarkers?.highestMemoryProcessed,
    hasHighestMemoryProcessed: Number.isFinite(sceneMarkers?.highestMemoryProcessed),
    highestMemoryProcessedManuallySet:
      !!sceneMarkers?.highestMemoryProcessedManuallySet,
    alwaysUseDefault: settings.moduleSettings.alwaysUseDefault,
    showMemoryPreviews: settings.moduleSettings.showMemoryPreviews,
    showNotifications: settings.moduleSettings.showNotifications,
    unhideBeforeMemory: settings.moduleSettings.unhideBeforeMemory || false,
    refreshEditor: settings.moduleSettings.refreshEditor,
    allowSceneOverlap: settings.moduleSettings.allowSceneOverlap,
    manualModeEnabled: settings.moduleSettings.manualModeEnabled,
    maxTokens:
      settings.moduleSettings.maxTokens ?? DEFAULT_MAX_TOKENS,

    // Lorebook status information
    lorebookMode: isManualMode ? "Manual" : "Automatic (Chat-bound)",
    currentLorebookName: isManualMode ? manualLorebook : chatBoundLorebook,
    manualLorebookName: manualLorebook,
    chatBoundLorebookName: chatBoundLorebook,
    availableLorebooks: world_names ?? [],
    autoHideMode: getAutoHideMode(settings.moduleSettings),
    unhiddenEntriesCount: settings.moduleSettings.unhiddenEntriesCount ?? 2,
    tokenWarningThreshold:
      settings.moduleSettings.tokenWarningThreshold ?? 50000,
    defaultMemoryCount: settings.moduleSettings.defaultMemoryCount ?? 0,
    autoSummaryEnabled: settings.moduleSettings.autoSummaryEnabled ?? false,
    autoSummaryInterval: settings.moduleSettings.autoSummaryInterval ?? 50,
    autoSummaryBuffer: settings.moduleSettings.autoSummaryBuffer ?? 2,
    autoConsolidationPromptEnabled:
      settings.moduleSettings.autoConsolidationPromptEnabled ?? false,
    autoConsolidationTargetTiers: normalizeAutoConsolidationTargetTiers(
      settings.moduleSettings.autoConsolidationTargetTiers ??
        settings.moduleSettings.autoConsolidationTargetTier,
    ),
    autoCreateLorebook: settings.moduleSettings.autoCreateLorebook ?? false,
    lorebookNameTemplate:
      settings.moduleSettings.lorebookNameTemplate ||
      "LTM - {{char}} - {{chat}}",
    autoConsolidationTierOptions: getAutoConsolidationTierOptions().map((option) => ({
      ...option,
      isSelected:
        normalizeAutoConsolidationTargetTiers(
          settings.moduleSettings.autoConsolidationTargetTiers ??
            settings.moduleSettings.autoConsolidationTargetTier,
        ).includes(Number(option.value)),
    })),
    profiles: settings.profiles.map((profile, index) => ({
      ...profile,
      name:
        profile?.isBuiltinCurrentST
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
                temperature: currentSettings.temperature ?? 0.7,
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
      // Don't gate on `sceneData` captured when the popup opened:
      // if the selected range is fully hidden, getSceneData() returns null and
      // we'd block the click before initiateMemoryCreation() can run /unhide.
      const markers = getSceneMarkers() || {};
      if (markers.sceneStart == null || markers.sceneEnd == null) {
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
          "Consolidate Memories",
          "STMemoryBooks_ConsolidateArcsButton",
        ),
      result: null,
      classes: ["menu_button"],
      action: async () => {
        await showSummaryConsolidationPopup();
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
    initializeSettingsPopupSelect2();
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

    if (e.target.matches("#stmb-always-use-default")) {
      settings.moduleSettings.alwaysUseDefault = e.target.checked;
      saveSettingsDebounced();
      return;
    }

    if (e.target.matches("#stmb-show-memory-previews")) {
      settings.moduleSettings.showMemoryPreviews = e.target.checked;
      saveSettingsDebounced();
      return;
    }

    if (e.target.matches("#stmb-show-notifications")) {
      settings.moduleSettings.showNotifications = e.target.checked;
      saveSettingsDebounced();
      return;
    }

    if (e.target.matches("#stmb-refresh-editor")) {
      settings.moduleSettings.refreshEditor = e.target.checked;
      saveSettingsDebounced();
      return;
    }

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
      const newIndex = clampInt(readIntInput(e.target), 0, profiles.length - 1);
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
            summaryTemp.textContent = Number(currentSettings.temperature ?? 0.7);
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
      const value = clampInt(readIntInput(e.target, settings.moduleSettings.defaultMemoryCount ?? 0), 0, 7);
      settings.moduleSettings.defaultMemoryCount = value;
      saveSettingsDebounced();
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
      const value = readIntInput(e.target);
      settings.moduleSettings.autoSummaryBuffer = clampInt(value ?? 0, 0, 50);
      saveSettingsDebounced();
      return;
    }

    if (e.target.matches("#stmb-auto-consolidation-prompt-enabled")) {
      settings.moduleSettings.autoConsolidationPromptEnabled = e.target.checked;
      saveSettingsDebounced();
      return;
    }

    if (e.target.matches("#stmb-auto-consolidation-target-tier")) {
      const value = normalizeAutoConsolidationTargetTiers(
        Array.from(e.target.selectedOptions || []).map((option) => option.value),
        { fallback: [] },
      );
      settings.moduleSettings.autoConsolidationTargetTiers = value;
      saveSettingsDebounced();
      return;
    }

    if (e.target.matches("#stmb-max-tokens")) {
      const value = readIntInput(e.target, DEFAULT_MAX_TOKENS);
      settings.moduleSettings.maxTokens =
        Number.isFinite(value) && value >= 0 ? value : DEFAULT_MAX_TOKENS;
      saveSettingsDebounced();
      return;
    }

    if (e.target.matches("#stmb-lorebook-name-template")) {
      settings.moduleSettings.lorebookNameTemplate = e.target.value.trim();
      saveSettingsDebounced();
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

    if (e.target.matches("#stmb-custom-title-format")) {
      const value = e.target.value.trim();
      if (value && value.includes("000")) {
        settings.titleFormat = value;
        saveSettingsDebounced();

        const summaryTitle = popupElement.querySelector("#stmb-summary-title");
        if (summaryTitle) {
          summaryTitle.textContent = value;
        }
      }
    }
  });

  popupElement.addEventListener("input", (e) => {
    if (!e.target.matches("#stmb-custom-title-format")) {
      return;
    }

    const value = e.target.value.trim();
    if (!value || !value.includes("000")) {
      return;
    }

    const summaryTitle = popupElement.querySelector("#stmb-summary-title");
    if (summaryTitle) {
      summaryTitle.textContent = value;
    }
  });
}

/**
 * Persist all main popup settings currently present in the DOM.
 */
function persistMainPopupSettings(popupElement) {
  if (!popupElement) {
    return false;
  }

  const settings = initializeSettings();
  let hasChanges = false;

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
  const manualModeEnabled =
    popupElement.querySelector("#stmb-manual-mode-enabled")?.checked ??
    settings.moduleSettings.manualModeEnabled;
  const autoSummaryEnabled =
    popupElement.querySelector("#stmb-auto-summary-enabled")?.checked ??
    settings.moduleSettings.autoSummaryEnabled;
  const autoCreateLorebook =
    popupElement.querySelector("#stmb-auto-create-lorebook")?.checked ??
    settings.moduleSettings.autoCreateLorebook;
  const autoHideMode =
    popupElement.querySelector("#stmb-auto-hide-mode")?.value ??
    getAutoHideMode(settings.moduleSettings);
  const lorebookNameTemplate =
    popupElement.querySelector("#stmb-lorebook-name-template")?.value?.trim() ??
    (settings.moduleSettings.lorebookNameTemplate || "");
  const tokenWarningThreshold = readIntInput(
    popupElement.querySelector("#stmb-token-warning-threshold"),
    settings.moduleSettings.tokenWarningThreshold ?? 50000,
  );
  const defaultMemoryCount = clampInt(
    readIntInput(
      popupElement.querySelector("#stmb-default-memory-count"),
      settings.moduleSettings.defaultMemoryCount ?? 0,
    ),
    0,
    7,
  );
  const unhiddenEntriesCount = readIntInput(
    popupElement.querySelector("#stmb-unhidden-entries-count"),
    settings.moduleSettings.unhiddenEntriesCount ?? 0,
  );
  const autoSummaryInterval = readIntInput(
    popupElement.querySelector("#stmb-auto-summary-interval"),
    settings.moduleSettings.autoSummaryInterval ?? 50,
  );
  const autoSummaryBuffer = clampInt(
    readIntInput(
      popupElement.querySelector("#stmb-auto-summary-buffer"),
      settings.moduleSettings.autoSummaryBuffer ?? 0,
    ),
    0,
    50,
  );
  const autoConsolidationPromptEnabled =
    popupElement.querySelector("#stmb-auto-consolidation-prompt-enabled")
      ?.checked ?? settings.moduleSettings.autoConsolidationPromptEnabled;
  const autoConsolidationTargetTiers = normalizeAutoConsolidationTargetTiers(
    Array.from(
      popupElement.querySelector("#stmb-auto-consolidation-target-tier")
        ?.selectedOptions ?? [],
    ).map((option) => option.value),
    { fallback: [] },
  );
  const maxTokens = readIntInput(
    popupElement.querySelector("#stmb-max-tokens"),
    DEFAULT_MAX_TOKENS,
  );
  const maxTokensNormalized =
    Number.isFinite(maxTokens) && maxTokens >= 0 ? maxTokens : DEFAULT_MAX_TOKENS;

  if (alwaysUseDefault !== settings.moduleSettings.alwaysUseDefault) {
    settings.moduleSettings.alwaysUseDefault = alwaysUseDefault;
    hasChanges = true;
  }

  if (showMemoryPreviews !== settings.moduleSettings.showMemoryPreviews) {
    settings.moduleSettings.showMemoryPreviews = showMemoryPreviews;
    hasChanges = true;
  }

  if (showNotifications !== settings.moduleSettings.showNotifications) {
    settings.moduleSettings.showNotifications = showNotifications;
    hasChanges = true;
  }

  if (unhideBeforeMemory !== settings.moduleSettings.unhideBeforeMemory) {
    settings.moduleSettings.unhideBeforeMemory = unhideBeforeMemory;
    hasChanges = true;
  }

  if (refreshEditor !== settings.moduleSettings.refreshEditor) {
    settings.moduleSettings.refreshEditor = refreshEditor;
    hasChanges = true;
  }

  if (allowSceneOverlap !== settings.moduleSettings.allowSceneOverlap) {
    settings.moduleSettings.allowSceneOverlap = allowSceneOverlap;
    hasChanges = true;
  }

  if (manualModeEnabled !== settings.moduleSettings.manualModeEnabled) {
    settings.moduleSettings.manualModeEnabled = manualModeEnabled;
    hasChanges = true;
  }

  if (autoSummaryEnabled !== settings.moduleSettings.autoSummaryEnabled) {
    settings.moduleSettings.autoSummaryEnabled = autoSummaryEnabled;
    hasChanges = true;
  }

  if (autoCreateLorebook !== settings.moduleSettings.autoCreateLorebook) {
    settings.moduleSettings.autoCreateLorebook = autoCreateLorebook;
    hasChanges = true;
  }

  if (
    autoHideMode !== getAutoHideMode(settings.moduleSettings) ||
    "autoHideAllMessages" in settings.moduleSettings ||
    "autoHideLastMemory" in settings.moduleSettings
  ) {
    settings.moduleSettings.autoHideMode = autoHideMode;
    delete settings.moduleSettings.autoHideAllMessages;
    delete settings.moduleSettings.autoHideLastMemory;
    hasChanges = true;
  }

  if (
    lorebookNameTemplate !== (settings.moduleSettings.lorebookNameTemplate || "")
  ) {
    settings.moduleSettings.lorebookNameTemplate = lorebookNameTemplate;
    hasChanges = true;
  }

  if (tokenWarningThreshold !== settings.moduleSettings.tokenWarningThreshold) {
    settings.moduleSettings.tokenWarningThreshold = tokenWarningThreshold;
    hasChanges = true;
  }

  if (defaultMemoryCount !== settings.moduleSettings.defaultMemoryCount) {
    settings.moduleSettings.defaultMemoryCount = defaultMemoryCount;
    hasChanges = true;
  }

  if (unhiddenEntriesCount !== settings.moduleSettings.unhiddenEntriesCount) {
    settings.moduleSettings.unhiddenEntriesCount = unhiddenEntriesCount;
    hasChanges = true;
  }

  if (autoSummaryInterval !== settings.moduleSettings.autoSummaryInterval) {
    settings.moduleSettings.autoSummaryInterval = autoSummaryInterval;
    hasChanges = true;
  }

  if (autoSummaryBuffer !== settings.moduleSettings.autoSummaryBuffer) {
    settings.moduleSettings.autoSummaryBuffer = autoSummaryBuffer;
    hasChanges = true;
  }

  if (
    autoConsolidationPromptEnabled !==
    settings.moduleSettings.autoConsolidationPromptEnabled
  ) {
    settings.moduleSettings.autoConsolidationPromptEnabled =
      autoConsolidationPromptEnabled;
    hasChanges = true;
  }

  if (
    JSON.stringify(autoConsolidationTargetTiers) !==
    JSON.stringify(
      normalizeAutoConsolidationTargetTiers(
        settings.moduleSettings.autoConsolidationTargetTiers ??
          settings.moduleSettings.autoConsolidationTargetTier,
      ),
    )
  ) {
    settings.moduleSettings.autoConsolidationTargetTiers =
      autoConsolidationTargetTiers;
    hasChanges = true;
  }

  if (
    maxTokensNormalized !==
    (settings.moduleSettings.maxTokens ?? DEFAULT_MAX_TOKENS)
  ) {
    settings.moduleSettings.maxTokens = maxTokensNormalized;
    hasChanges = true;
  }

  const titleFormatSelect = popupElement.querySelector("#stmb-title-format-select");
  const customTitleFormat = popupElement
    .querySelector("#stmb-custom-title-format")
    ?.value?.trim();
  let nextTitleFormat = settings.titleFormat;
  if (titleFormatSelect?.value === "custom") {
    if (customTitleFormat && customTitleFormat.includes("000")) {
      nextTitleFormat = customTitleFormat;
    }
  } else if (titleFormatSelect?.value) {
    nextTitleFormat = titleFormatSelect.value;
  }

  if (nextTitleFormat !== settings.titleFormat) {
    settings.titleFormat = nextTitleFormat;
    hasChanges = true;
  }

  if (hasChanges) {
    saveSettingsDebounced();
  }

  return hasChanges;
}

/**
 * Handle settings popup close
 */
function handleSettingsPopupClose(popup) {
  try {
    persistMainPopupSettings(popup.dlg);
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
    persistMainPopupSettings(currentPopupInstance.dlg);
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
      hasHighestMemoryProcessed: Number.isFinite(
        sceneMarkers?.highestMemoryProcessed,
      ),
      highestMemoryProcessedManuallySet:
        !!sceneMarkers?.highestMemoryProcessedManuallySet,
      alwaysUseDefault: settings.moduleSettings.alwaysUseDefault,
      showMemoryPreviews: settings.moduleSettings.showMemoryPreviews,
      showNotifications: settings.moduleSettings.showNotifications,
      unhideBeforeMemory: settings.moduleSettings.unhideBeforeMemory || false,
      refreshEditor: settings.moduleSettings.refreshEditor,
      allowSceneOverlap: settings.moduleSettings.allowSceneOverlap,
      manualModeEnabled: settings.moduleSettings.manualModeEnabled,
      maxTokens:
        settings.moduleSettings.maxTokens ?? DEFAULT_MAX_TOKENS,

      // Lorebook status information
      lorebookMode: isManualMode ? "Manual" : "Automatic (Chat-bound)",
      currentLorebookName: isManualMode ? manualLorebook : chatBoundLorebook,
      manualLorebookName: manualLorebook,
      chatBoundLorebookName: chatBoundLorebook,
      availableLorebooks: world_names ?? [],
      autoHideMode: getAutoHideMode(settings.moduleSettings),
      unhiddenEntriesCount: settings.moduleSettings.unhiddenEntriesCount ?? 0,
      tokenWarningThreshold:
        settings.moduleSettings.tokenWarningThreshold ?? 50000,
      defaultMemoryCount: settings.moduleSettings.defaultMemoryCount ?? 0,
      autoSummaryEnabled: settings.moduleSettings.autoSummaryEnabled ?? false,
      autoSummaryInterval: settings.moduleSettings.autoSummaryInterval ?? 50,
      autoSummaryBuffer: settings.moduleSettings.autoSummaryBuffer ?? 0,
      autoConsolidationPromptEnabled:
        settings.moduleSettings.autoConsolidationPromptEnabled ?? false,
      autoConsolidationTargetTiers: normalizeAutoConsolidationTargetTiers(
        settings.moduleSettings.autoConsolidationTargetTiers ??
          settings.moduleSettings.autoConsolidationTargetTier,
      ),
      autoCreateLorebook: settings.moduleSettings.autoCreateLorebook ?? false,
      lorebookNameTemplate:
        settings.moduleSettings.lorebookNameTemplate ||
        "LTM - {{char}} - {{chat}}",
      autoConsolidationTierOptions: getAutoConsolidationTierOptions().map((option) => ({
        ...option,
        isSelected:
          normalizeAutoConsolidationTargetTiers(
            settings.moduleSettings.autoConsolidationTargetTiers ??
              settings.moduleSettings.autoConsolidationTargetTier,
          ).includes(Number(option.value)),
      })),
      profiles: settings.profiles.map((profile, index) => ({
        ...profile,
        name:
          profile?.isBuiltinCurrentST
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
                  temperature: currentSettings.temperature ?? 0.7,
                };
              })()
            : {
                api: selectedProfile.connection?.api || "openai",
                model: selectedProfile.connection?.model || "gpt-4.1",
                temperature: selectedProfile.connection?.temperature ?? 0.7,
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
    initializeSettingsPopupSelect2();
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

  const stmbCatchupCmd = SlashCommand.fromProps({
    name: "stmb-catchup",
    callback: handleStmbCatchupCommand,
    helpString: translate(
      "Create scene memories over a message range in chunks. Usage: /stmb-catchup interval:50 start:0 end:600",
      "STMemoryBooks_Slash_Catchup_Help",
    ),
    namedArgumentList: [
      SlashCommandNamedArgument.fromProps({
        name: "interval",
        description: translate(
          "How many memories per chunk?",
          "STMemoryBooks_Slash_Catchup_ArgIntervalDesc",
        ),
        typeList: [ARGUMENT_TYPE.NUMBER],
        isRequired: true,
      }),
      SlashCommandNamedArgument.fromProps({
        name: "start",
        description: translate(
          "start from which message id?",
          "STMemoryBooks_Slash_Catchup_ArgStartDesc",
        ),
        typeList: [ARGUMENT_TYPE.NUMBER],
        isRequired: true,
      }),
      SlashCommandNamedArgument.fromProps({
        name: "end",
        description: translate(
          "End at which message id?",
          "STMemoryBooks_Slash_Catchup_ArgEndDesc",
        ),
        typeList: [ARGUMENT_TYPE.NUMBER],
        isRequired: true,
      }),
    ],
  });

  const sidePromptCmd = SlashCommand.fromProps({
    name: "sideprompt",
    callback: handleSidePromptCommand,
    rawQuotes: true,
    helpString: translate(
      'Run side prompt. Usage: /sideprompt "Name" {{macro}}="value" [X-Y]',
      "STMemoryBooks_Slash_SidePrompt_Help",
    ),
    unnamedArgumentList: [
      SlashCommandArgument.fromProps({
        description: translate(
          'Quoted template name, then any required {{macro}}="value" assignments, optionally followed by X-Y range',
          "STMemoryBooks_Slash_SidePrompt_ArgDesc",
        ),
        typeList: [ARGUMENT_TYPE.STRING],
        isRequired: true,
        enumProvider: manualSidePromptTemplateEnumProvider,
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
          ...allSidePromptTemplateEnumProvider(),
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
          ...allSidePromptTemplateEnumProvider(),
        ],
      }),
    ],
  });

  const highestMemCmd = SlashCommand.fromProps({
    name: "stmb-highest",
    callback: handleHighestMemoryProcessedCommand,
    helpString: translate(
      "Return the highest message index for processed memories in this chat. Usage: /stmb-highest",
      "STMemoryBooks_Slash_Highest_Help",
    ),
    returns: "Highest memory processed message index as a string.",
  });

  const setHighestMemCmd = SlashCommand.fromProps({
    name: "stmb-set-highest",
    callback: handleSetHighestMemoryProcessedCommand,
    helpString: translate(
      "Manually set the highest processed message index for this chat. Usage: /stmb-set-highest <N|none>",
      "STMemoryBooks_Slash_SetHighest_Help",
    ),
    unnamedArgumentList: [
      SlashCommandArgument.fromProps({
        description: translate(
          'Message index (0-based) or "none" to reset',
          "STMemoryBooks_Slash_SetHighest_ArgDesc",
        ),
        typeList: [ARGUMENT_TYPE.STRING],
        isRequired: true,
      }),
    ],
  });

  const stmbStopCmd = SlashCommand.fromProps({
    name: "stmb-stop",
    callback: handleStmbStopCommand,
    helpString: translate(
      "Stop all in-flight STMB generation everywhere. Usage: /stmb-stop",
      "STMemoryBooks_Slash_Stop_Help",
    ),
  });

  SlashCommandParser.addCommandObject(createMemoryCmd);
  SlashCommandParser.addCommandObject(sceneMemoryCmd);
  SlashCommandParser.addCommandObject(nextMemoryCmd);
  SlashCommandParser.addCommandObject(stmbCatchupCmd);
  SlashCommandParser.addCommandObject(sidePromptCmd);
  SlashCommandParser.addCommandObject(sidePromptOnCmd);
  SlashCommandParser.addCommandObject(sidePromptOffCmd);
  SlashCommandParser.addCommandObject(highestMemCmd);
  SlashCommandParser.addCommandObject(setHighestMemCmd);
  SlashCommandParser.addCommandObject(stmbStopCmd);
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
    lastFailedAIContext = null;
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
async function applyManualFixedJson(correctedRaw) {
  if (isProcessingMemory) {
    toastr.warning(
      translate(
        "Memory generation is already in progress.",
        "STMemoryBooks_ManualFix_InProgress",
      ),
      "STMemoryBooks",
    );
    return;
  }

  const stmbTask = createStmbInFlightTask("MemoryManualRepair");
  const runEpoch = stmbTask.epoch;
  try {
    // Set processing flag IMMEDIATELY after validation to prevent race conditions.
    // NOTE: placing the assignment *inside* the try ensures the matching `finally` clears the flag
    // even if an error/exception occurs before the try body completes. The trade-off is a very
    // small window between the initial guard and this assignment where a race could occur.
    isProcessingMemory = true;
    const context = lastFailedAIContext; 
    if (
      !context?.compiledScene ||
      !context?.profileSettings ||
      !context?.lorebookValidation?.valid
    ) {
      toastr.error(
        translate(
          "Missing failure context; cannot apply corrected JSON.",
          "STMemoryBooks_ManualFix_NoContext",
        ),
        "STMemoryBooks",
      );
      return;
    }
    throwIfStmbStopped(runEpoch);
    if (
      !context?.sceneData ||
      context.sceneData.sceneEnd === undefined ||
      context.sceneData.sceneStart === undefined
    ) {
      toastr.error(
        translate(
          "Missing scene range; cannot apply corrected JSON.",
          "STMemoryBooks_ManualFix_NoSceneRange",
        ),
        "STMemoryBooks",
      );
      return;
    }

    const trimmedRaw = String(correctedRaw || "").trim();
    if (!trimmedRaw) {
      toastr.error(
        translate(
          "Corrected JSON is empty.",
          "STMemoryBooks_ManualFix_EmptyJson",
        ),
        "STMemoryBooks",
      );
      return;
    }

    let jsonResult;
    try {
      jsonResult = parseAIJsonResponse(trimmedRaw);
    } catch (error) {
      const msg = error?.message || "Failed to parse corrected JSON.";
      const code = error?.code ? ` [${error.code}]` : "";
      toastr.error(
        __st_t_tag`Corrected JSON is still invalid${code}: ${msg}`,
        "STMemoryBooks",
      );
      return;
    }

    if (!jsonResult.content && !jsonResult.summary && !jsonResult.memory_content) {
      toastr.error(
        translate(
          "Corrected JSON is missing content.",
          "STMemoryBooks_ManualFix_MissingContent",
        ),
        "STMemoryBooks",
      );
      return;
    }
    if (!jsonResult.title) {
      toastr.error(
        translate(
          "Corrected JSON is missing title.",
          "STMemoryBooks_ManualFix_MissingTitle",
        ),
        "STMemoryBooks",
      );
      return;
    }
    if (!Array.isArray(jsonResult.keywords)) {
      toastr.error(
        translate(
          "Corrected JSON is missing keywords array.",
          "STMemoryBooks_ManualFix_MissingKeywords",
        ),
        "STMemoryBooks",
      );
      return;
    }

    const compiledScene = context.compiledScene;
    const profile = context.profileSettings;
    const cleanContent = (
      jsonResult.content ||
      jsonResult.summary ||
      jsonResult.memory_content ||
      ""
    ).trim();
    const cleanTitle = (jsonResult.title || "Memory").trim();
    const cleanKeywords = Array.isArray(jsonResult.keywords)
      ? jsonResult.keywords.filter((k) => k && typeof k === "string" && k.trim() !== "")
      : [];
    const resolvedSceneStats = context.sceneStats || null;
    const sceneRange =
      context.sceneRange ||
      `${compiledScene.metadata.sceneStart}-${compiledScene.metadata.sceneEnd}`;
    const memoryResult = {
      content: cleanContent,
      extractedTitle: cleanTitle,
      metadata: {
        sceneRange,
        messageCount: compiledScene.metadata?.messageCount,
        characterName: compiledScene.metadata?.characterName,
        userName: compiledScene.metadata?.userName,
        chatId: compiledScene.metadata?.chatId,
        createdAt: new Date().toISOString(),
        profileUsed: profile.name,
        presetUsed: profile.preset || "custom",
        tokenUsage: resolvedSceneStats
          ? { estimatedTokens: resolvedSceneStats.estimatedTokens }
          : undefined,
        generationMethod: "manual-json-repair",
        version: "2.0",
      },
      suggestedKeys: cleanKeywords,
      titleFormat:
        profile.useDynamicSTSettings || profile?.connection?.api === "current_st"
          ? extension_settings.STMemoryBooks?.titleFormat || "[000] - {{title}}"
          : profile.titleFormat || "[000] - {{title}}",
      lorebookSettings: {
        constVectMode: profile.constVectMode,
        position: profile.position,
        orderMode: profile.orderMode,
        orderValue: profile.orderValue,
        preventRecursion: profile.preventRecursion,
        delayUntilRecursion: profile.delayUntilRecursion,
        outletName:
          Number(profile.position) === 7 ? profile.outletName || "" : undefined,
      },
      lorebook: {
        content: cleanContent,
        comment: `Auto-generated memory from messages ${sceneRange}. Profile: ${profile.name}.`,
        key: cleanKeywords || [],
        keysecondary: [],
        selective: true,
        constant: false,
        order: 100,
        position: "before_char",
        disable: false,
        addMemo: true,
        excludeRecursion: false,
        delayUntilRecursion: true,
        probability: 100,
        useProbability: false,
      },
    };

    throwIfStmbStopped(runEpoch);
    const addResult = await addMemoryToLorebook(
      memoryResult,
      context.lorebookValidation,
    );
    throwIfStmbStopped(runEpoch);

    if (!addResult.success) {
      throw new Error(addResult.error || "Failed to add memory to lorebook");
    }

    try {
      const connDbg = profile.effectiveConnection || profile.connection || {};
      console.debug("STMemoryBooks: Passing profile to runAfterMemory", {
        api: connDbg.api,
        model: connDbg.model,
        temperature: connDbg.temperature,
      });
      await runAfterMemory(compiledScene, profile);
    } catch (e) {
      console.warn("STMemoryBooks: runAfterMemory failed:", e);
    }
    throwIfStmbStopped(runEpoch);

    try {
      const stmbData = getSceneMarkers() || {};
      stmbData.highestMemoryProcessed = context.sceneData.sceneEnd;
      delete stmbData.highestMemoryProcessedManuallySet;
      saveMetadataForCurrentContext();
    } catch (e) {
      console.warn(
        "STMemoryBooks: Failed to update highestMemoryProcessed baseline:",
        e,
      );
    }

    clearAutoSummaryState();

    const contextMsg =
      context.memoryFetchResult?.actualCount > 0
        ? ` (with ${context.memoryFetchResult.actualCount} context ${context.memoryFetchResult.actualCount === 1 ? "memory" : "memories"})`
        : "";

    toastr.clear();
    lastFailureToast = null;
    lastFailedAIError = null;
    lastFailedAIContext = null;
    toastr.success(
      __st_t_tag`Memory "${addResult.entryTitle}" created successfully${contextMsg}!`,
      "STMemoryBooks",
    );
  
  } catch (error) {
    if (isStmbStopError(error)) {
      return;
    }
    console.error("STMemoryBooks: Manual JSON repair failed:", error);
    toastr.error(
      __st_t_tag`Failed to create memory from corrected JSON: ${error.message}`,
      "STMemoryBooks",
    );
  } finally {
    stmbTask.finish();
    // ALWAYS reset the flag, no matter how we exit.
    // This clears the `isProcessingMemory` flag set inside the try block above.
    isProcessingMemory = false;
  }
}

async function applyManualFixedSummaryJson(correctedRaw) {
  if (isProcessingArc) {
    toastr.warning(
      translate(
        "Summary consolidation is already in progress.",
        "STMemoryBooks_ArcManualFix_InProgress",
      ),
      "STMemoryBooks",
    );
    return;
  }

  try {
    isProcessingArc = true;
    const context = lastFailedArcContext;
    if (
      !context?.lorebookName ||
      !context?.lorebookData ||
      !Array.isArray(context?.selectedEntries) ||
      !context?.options
    ) {
      toastr.error(
        translate(
          "Missing failure context; cannot apply corrected summary JSON.",
          "STMemoryBooks_ArcManualFix_NoContext",
        ),
        "STMemoryBooks",
      );
      return;
    }

    const trimmedRaw = String(correctedRaw || "").trim();
    if (!trimmedRaw) {
      toastr.error(
        translate(
          "Corrected JSON is empty.",
          "STMemoryBooks_ArcManualFix_EmptyJson",
        ),
        "STMemoryBooks",
      );
      return;
    }

    let parsed;
    try {
      parsed = parseSummaryJsonResponse(trimmedRaw);
    } catch (error) {
      const msg = error?.message || "Failed to parse corrected summary JSON.";
      const code = error?.code ? ` [${error.code}]` : "";
      toastr.error(
        __st_t_tag`Corrected summary JSON is still invalid${code}: ${msg}`,
        "STMemoryBooks",
      );
      return;
    }

    const summaries = Array.isArray(parsed?.summaries) ? parsed.summaries : [];
    if (summaries.length === 0) {
      toastr.error(
        translate(
          "Corrected JSON is missing summaries.",
          "STMemoryBooks_ArcManualFix_MissingArcs",
        ),
        "STMemoryBooks",
      );
      return;
    }

    const hasAnyMemberIds = summaries.some(
      (a) => Array.isArray(a?.member_ids) && a.member_ids.length > 0,
    );
    if (summaries.length > 1 && !hasAnyMemberIds) {
      toastr.error(
        translate(
          "Multiple summaries require member_ids to avoid ambiguous assignment. Add member_ids or reduce to one summary.",
          "STMemoryBooks_ArcManualFix_MultiArcNeedsMemberIds",
        ),
        "STMemoryBooks",
      );
      return;
    }

    const selectedEntries = context.selectedEntries;
    const selectedUids = selectedEntries
      .map((e) => String(e?.uid))
      .filter(Boolean);

    const idResolver = new Map();
    selectedUids.forEach((uid, idx) => {
      idResolver.set(uid, uid);
      const seq = String(idx + 1).padStart(3, "0");
      idResolver.set(seq, uid);
      idResolver.set(String(idx + 1), uid);
    });
    const resolveId = (raw) => idResolver.get(String(raw).trim());

    const unassignedIds = new Set();
    const unassigned = Array.isArray(parsed?.unassigned_items)
      ? parsed.unassigned_items
      : [];
    unassigned.forEach((u) => {
      const rid = resolveId(u?.id);
      if (rid) unassignedIds.add(rid);
    });
    const assignedIds = selectedUids.filter((id) => !unassignedIds.has(id));

    const summaryCandidates = summaries.map((a) => {
      const title = String(a?.title || "").trim();
      const summary = String(a?.summary || "").trim();
      let keywords = Array.isArray(a?.keywords) ? a.keywords : [];
      keywords = keywords
        .filter((k) => typeof k === "string" && k.trim())
        .map((k) => k.trim());

      let memberIds = null;
      if (Array.isArray(a?.member_ids)) {
        memberIds = a.member_ids
          .map(resolveId)
          .filter((id) => id !== undefined);
      }
      if (!memberIds || memberIds.length === 0) {
        memberIds = assignedIds;
      }
      memberIds = Array.from(new Set(memberIds)).filter(Boolean);

      return { title, summary, keywords, memberIds };
    });

    const arcOrderFallback = initializeSettings();
    const fallbackMode = String(
      arcOrderFallback?.moduleSettings?.summaryOrderMode || "auto",
    ).toLowerCase();
    const fallbackOrderMode =
      fallbackMode === "manual" || fallbackMode === "reverse"
        ? fallbackMode
        : "auto";
    const fallbackOrderValue = clampInt(
      Number.isFinite(Number(arcOrderFallback?.moduleSettings?.summaryOrderValue))
        ? Math.trunc(Number(arcOrderFallback.moduleSettings.summaryOrderValue))
        : 100,
      0,
      9999,
    );
    const fallbackReverseStart = clampInt(
      Number.isFinite(Number(arcOrderFallback?.moduleSettings?.summaryReverseStart))
        ? Math.trunc(Number(arcOrderFallback.moduleSettings.summaryReverseStart))
        : 9999,
      100,
      9999,
    );
    const fallbackSummaryEntrySettings = normalizeLorebookEntrySettings(
      context?.summaryEntrySettings ||
        arcOrderFallback?.moduleSettings?.summaryEntrySettings ||
        {
          orderMode: fallbackOrderMode,
          orderValue: fallbackOrderValue,
          reverseStart: fallbackReverseStart,
        },
      {
        ...DEFAULT_LOREBOOK_ENTRY_SETTINGS,
        orderMode: fallbackOrderMode,
        orderValue: fallbackOrderValue,
        reverseStart: fallbackReverseStart,
      },
    );

    const targetTier = clampInt(Number(context?.targetTier ?? 1), 1, 6);
    const targetLabel = getSummaryTierLabel(targetTier);
    const res = await commitSummaryEntries({
      lorebookName: context.lorebookName,
      lorebookData: context.lorebookData,
      summaryCandidates,
      targetTier,
      disableOriginals: !!context.disableOriginals,
      summaryEntrySettings: fallbackSummaryEntrySettings,
      orderMode: context.summaryOrderMode || fallbackOrderMode,
      orderValue:
        context.summaryOrderValue !== undefined && context.summaryOrderValue !== null
          ? clampInt(Number(context.summaryOrderValue), 0, 9999)
          : fallbackOrderValue,
      reverseStart:
        context.summaryReverseStart !== undefined && context.summaryReverseStart !== null
          ? clampInt(Number(context.summaryReverseStart), 100, 9999)
          : fallbackReverseStart,
    });

    const created = Array.isArray(res?.results)
      ? res.results.length
      : summaryCandidates.length;
    const createdLabel =
      created === 1
        ? targetLabel.toLowerCase()
        : pluralizeSummaryLabel(targetLabel).toLowerCase();
    toastr.success(
      __st_t_tag`Created ${created} ${createdLabel} from corrected JSON.`,
      "STMemoryBooks",
    );

    lastFailedArcError = null;
    lastFailedArcContext = null;
    try {
      toastr.clear(lastArcFailureToast);
    } catch (e) {}
    lastArcFailureToast = null;
    clearAutoConsolidationPromptState(targetTier);
    if (targetTier < 6) {
      await maybePromptAutoConsolidation(targetTier + 1, {
        valid: true,
        name: context.lorebookName,
        data: context.lorebookData,
      });
    }
  } catch (e) {
    if (isStmbStopError(e)) {
      return;
    }
    console.error("STMemoryBooks: applyManualFixedSummaryJson failed:", e);
    toastr.error(
      __st_t_tag`Failed to apply corrected summary JSON: ${e.message}`,
      "STMemoryBooks",
    );
  } finally {
    isProcessingArc = false;
  }
}

function showFailedSummaryResponsePopup(error) {
  try {
    const esc = (s) => escapeHtml(String(s ?? ""));
    const message = esc(
      error?.message ||
        translate("Unknown error", "STMemoryBooks_UnknownError"),
    );
    const code = esc(error?.code || "");
    const rawPrimary = String(error?.retryRawText || error?.rawText || "").trim();
    const rawOriginal = String(error?.rawText || "").trim();
    const canManualFix =
      !!lastFailedArcContext?.lorebookName && !!lastFailedArcContext?.lorebookData;

    const splitKeywords = (s) =>
      String(s || "")
        .split(/[\n,]+/g)
        .map((x) => String(x || "").trim())
        .map((x) => x.replace(/^["']|["']$/g, ""))
        .map((x) => x.replace(/^\d+\.\s*/, ""))
        .map((x) => x.replace(/^[\-\*\u2022]\s*/, ""))
        .map((x) => x.trim())
        .filter(Boolean)
        .slice(0, 30);

      const extractArcFieldsFromText = (raw) => {
      const text = String(raw || "");

      try {
        const parsed = parseSummaryJsonResponse(text);
        const a0 = Array.isArray(parsed?.summaries) ? parsed.summaries[0] : null;
        if (a0) {
          return {
            title: String(a0.title || "").trim(),
            summary: String(a0.summary || "").trim(),
            keywords: Array.isArray(a0.keywords) ? a0.keywords : [],
          };
        }
      } catch {}

      // Heuristics for messy responses
      let title = "";
      let summary = "";
      let keywords = [];

      const titleLine =
        text.match(/(?:^|\n)\s*(?:title|arc\s*title)\s*[:\-]\s*(.+)\s*$/im) ||
        text.match(/(?:^|\n)\s*#{1,6}\s*(.+)\s*$/m);
      if (titleLine) {
        title = String(titleLine[1] || "")
          .trim()
          .replace(/^["']|["']$/g, "");
      }

      const summaryMatch = text.match(
        /(?:^|\n)\s*(?:summary|arc\s*summary|content)\s*[:\-]\s*([\s\S]*?)(?=\n\s*(?:keywords?|tags?)\s*[:\-]|\n\s*$)/im,
      );
      if (summaryMatch) {
        summary = String(summaryMatch[1] || "").trim();
      } else if (title) {
        // Fallback: first non-empty paragraph after the title line
        const afterTitle = text.split(title).slice(1).join(title);
        const paras = afterTitle
          .split(/\n\s*\n/g)
          .map((p) => p.trim())
          .filter(Boolean);
        if (paras.length) summary = paras[0];
      }

      const keywordSection = text.match(
        /(?:^|\n)\s*(?:keywords?|tags?)\s*[:\-]\s*([\s\S]*)$/im,
      );
      if (keywordSection) {
        keywords = splitKeywords(keywordSection[1]);
      } else {
        // Fallback: collect bullet-ish lines if any
        const bulletish = text
          .split(/\r?\n/)
          .filter((l) => /^\s*(?:[\-\*\u2022]|\d+\.)\s+/.test(l))
          .slice(0, 60)
          .join("\n");
        if (bulletish) keywords = splitKeywords(bulletish);
      }

      return { title, summary, keywords };
    };

    const prefill = rawPrimary ? extractArcFieldsFromText(rawPrimary) : null;

    let content = "";
    content += `<h3>${esc(translate("Review Failed Summary Response", "STMemoryBooks_ReviewFailedArc_Title"))}</h3>`;
    content += `<div><strong>${esc(translate("Error", "STMemoryBooks_ReviewFailedArc_ErrorLabel"))}:</strong> ${message}</div>`;
    if (code) {
      content += `<div><strong>${esc(translate("Code", "STMemoryBooks_ReviewFailedArc_CodeLabel"))}:</strong> ${code}</div>`;
    }

    if (rawPrimary) {
      content += `<div class="world_entry_form_control">`;
      content += `<h4>${esc(translate("Raw AI Response", "STMemoryBooks_ReviewFailedArc_RawLabel"))}</h4>`;
      content += `<textarea id="stmb-arc-corrected-raw" class="text_pole" style="width: 100%; min-height: 220px; max-height: 360px; white-space: pre; overflow:auto;">${escapeHtml(rawPrimary)}</textarea>`;
      content += `<div class="buttons_block gap10px">`;
      content += `<button id="stmb-arc-copy-raw" class="menu_button">${esc(translate("Copy Raw", "STMemoryBooks_ReviewFailedArc_CopyRaw"))}</button>`;
      content += `<button id="stmb-arc-extract-fields" class="menu_button">${esc(translate("Extract Title/Summary/Keywords", "STMemoryBooks_ReviewFailedArc_ExtractFields"))}</button>`;
      content += `<button id="stmb-arc-fill-json" class="menu_button">${esc(translate("Fill JSON from fields", "STMemoryBooks_ReviewFailedArc_FillJson"))}</button>`;
      content += `<button id="stmb-arc-apply-corrected-raw" class="menu_button" ${canManualFix ? "" : "disabled"}>${esc(translate("Create summaries from corrected JSON", "STMemoryBooks_ReviewFailedArc_CreateArcs"))}</button>`;
      content += `</div>`;

      content += `<div class="world_entry_form_control">`;
      content += `<h4>${esc(translate("Extractable Fields", "STMemoryBooks_ReviewFailedArc_FieldsTitle"))}</h4>`;
      content += `<div class="opacity70p">${esc(translate("Use Extract to populate fields from the raw response, then Fill JSON to generate valid summary JSON.", "STMemoryBooks_ReviewFailedArc_FieldsDesc"))}</div>`;
      content += `<div class="world_entry_form_control"><label>${esc(translate("Title", "STMemoryBooks_Title"))}</label><input id="stmb-arc-field-title" class="text_pole" style="width:100%" value="${escapeHtml(String(prefill?.title || ""))}"></div>`;
      content += `<div class="world_entry_form_control"><label>${esc(translate("Summary", "STMemoryBooks_Summary"))}</label><textarea id="stmb-arc-field-summary" class="text_pole" style="width:100%; min-height: 110px; white-space: pre-wrap;">${escapeHtml(String(prefill?.summary || ""))}</textarea></div>`;
      content += `<div class="world_entry_form_control"><label>${esc(translate("Keywords (one per line or comma-separated)", "STMemoryBooks_Keywords"))}</label><textarea id="stmb-arc-field-keywords" class="text_pole" style="width:100%; min-height: 90px; white-space: pre-wrap;">${escapeHtml(Array.isArray(prefill?.keywords) ? prefill.keywords.join("\n") : "")}</textarea></div>`;
      content += `</div>`;

      if (!canManualFix) {
        content += `<div class="opacity70p">${esc(translate("Unable to apply corrected JSON because the original consolidation context is missing.", "STMemoryBooks_ReviewFailedArc_NoContext"))}</div>`;
      }
      if (rawOriginal && rawOriginal !== rawPrimary) {
        content += `<details class="world_entry_form_control"><summary class="opacity70p">${esc(translate("Show original (pre-retry) response", "STMemoryBooks_ReviewFailedArc_ShowOriginal"))}</summary>`;
        content += `<textarea class="text_pole" style="width: 100%; min-height: 160px; max-height: 260px; white-space: pre; overflow:auto;">${escapeHtml(rawOriginal)}</textarea>`;
        content += `</details>`;
      }
      content += `</div>`;
    } else {
      content += `<div class="world_entry_form_control opacity70p">${esc(translate("No raw response was captured.", "STMemoryBooks_ReviewFailedArc_NoRaw"))}</div>`;
    }

    const popup = new Popup(DOMPurify.sanitize(content), POPUP_TYPE.TEXT, "", {
      wide: true,
      large: true,
      allowVerticalScrolling: true,
      okButton: false,
      cancelButton: translate("Close", "STMemoryBooks_Close"),
    });

    const dlg = popup.dlg;
    dlg
      .querySelector("#stmb-arc-copy-raw")
      ?.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(rawPrimary || rawOriginal);
          toastr.success(
            translate("Copied raw response", "STMemoryBooks_CopiedRaw"),
            "STMemoryBooks",
          );
        } catch (e) {
          toastr.error(
            translate("Copy failed", "STMemoryBooks_CopyFailed"),
            "STMemoryBooks",
          );
        }
      });
    dlg
      .querySelector("#stmb-arc-extract-fields")
      ?.addEventListener("click", async () => {
        try {
          const rawNow =
            dlg.querySelector("#stmb-arc-corrected-raw")?.value ??
            rawPrimary ??
            rawOriginal;
          const extracted = extractArcFieldsFromText(rawNow);
          const titleEl = dlg.querySelector("#stmb-arc-field-title");
          const summaryEl = dlg.querySelector("#stmb-arc-field-summary");
          const kwEl = dlg.querySelector("#stmb-arc-field-keywords");
          if (titleEl) titleEl.value = extracted?.title || "";
          if (summaryEl) summaryEl.value = extracted?.summary || "";
          if (kwEl)
            kwEl.value = Array.isArray(extracted?.keywords)
              ? extracted.keywords.join("\n")
              : "";
          toastr.success(
            translate(
              "Extracted fields from response",
              "STMemoryBooks_ReviewFailedArc_ExtractedFieldsToast",
            ),
            "STMemoryBooks",
          );
        } catch (e) {
          toastr.error(
            translate(
              "Failed to extract fields",
              "STMemoryBooks_ReviewFailedArc_ExtractFieldsFailed",
            ),
            "STMemoryBooks",
          );
        }
      });
    dlg
      .querySelector("#stmb-arc-fill-json")
      ?.addEventListener("click", async () => {
        try {
          const title = String(
            dlg.querySelector("#stmb-arc-field-title")?.value || "",
          ).trim();
          const summary = String(
            dlg.querySelector("#stmb-arc-field-summary")?.value || "",
          ).trim();
          const kwRaw = dlg.querySelector("#stmb-arc-field-keywords")?.value || "";
          const keywords = splitKeywords(kwRaw);

          if (!title || !summary) {
            toastr.warning(
              translate(
                "Title and Summary are required to build a summary.",
                "STMemoryBooks_ReviewFailedArc_TitleSummaryRequired",
              ),
              "STMemoryBooks",
            );
            return;
          }

          const obj = {
            summaries: [{ title, summary, keywords }],
            unassigned_items: [],
          };
          const json = JSON.stringify(obj, null, 2);
          const rawEl = dlg.querySelector("#stmb-arc-corrected-raw");
          if (rawEl) rawEl.value = json;
          toastr.success(
            translate(
              "Filled JSON from fields",
              "STMemoryBooks_ReviewFailedArc_FilledJsonToast",
            ),
            "STMemoryBooks",
          );
        } catch (e) {
          toastr.error(
            translate(
              "Failed to build JSON",
              "STMemoryBooks_ReviewFailedArc_FillJsonFailed",
            ),
            "STMemoryBooks",
          );
        }
      });
    dlg
      .querySelector("#stmb-arc-apply-corrected-raw")
      ?.addEventListener("click", async () => {
        const corrected =
          dlg.querySelector("#stmb-arc-corrected-raw")?.value ??
          rawPrimary ??
          rawOriginal;
        void applyManualFixedSummaryJson(corrected);
      });

    void popup.show();
  } catch (e) {
    console.error("STMemoryBooks: Failed to show failed summary response popup:", e);
  }
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
    const canManualFix =
      !!raw &&
      !!lastFailedAIContext?.compiledScene &&
      !!lastFailedAIContext?.lorebookValidation?.valid;
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
      content += `<textarea id="stmb-corrected-raw" class="text_pole" style="width: 100%; min-height: 220px; max-height: 360px; white-space: pre; overflow:auto;">${escapeHtml(raw)}</textarea>`;
      content += `<div class="buttons_block gap10px">`;
      content += `<button id="stmb-copy-raw" class="menu_button">${esc(translate("Copy Raw", "STMemoryBooks_ReviewFailedAI_CopyRaw"))}</button>`;
      content += `<button id="stmb-apply-corrected-raw" class="menu_button" ${canManualFix ? "" : "disabled"}>${esc(translate("Create Memory from corrected JSON", "STMemoryBooks_ReviewFailedAI_CreateMemory"))}</button>`;
      content += `</div>`;
      if (!canManualFix) {
        content += `<div class="opacity70p">${esc(translate("Unable to apply corrected JSON because the original generation context is missing.", "STMemoryBooks_ReviewFailedAI_NoContext"))}</div>`;
      }
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

    // Attach handlers before showing the popup so they are active immediately
    const dlg = popup.dlg;
    dlg.querySelector("#stmb-copy-raw")?.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(raw);
        toastr.success(
          translate("Copied raw response", "STMemoryBooks_CopiedRaw"),
          "STMemoryBooks",
        );
      } catch (e) {
        toastr.error(
          translate("Copy failed", "STMemoryBooks_CopyFailed"),
          "STMemoryBooks",
        );
      }
    });
    dlg
      .querySelector("#stmb-apply-corrected-raw")
      ?.addEventListener("click", async () => {
        const correctedRaw =
          dlg.querySelector("#stmb-corrected-raw")?.value ?? raw;
        void applyManualFixedJson(correctedRaw);
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
        } catch (e) {
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
 * Initialize the extension
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
