import { extension_settings } from "../../../extensions.js";
import {
  chat,
  chat_metadata,
  saveMetadata,
  getCurrentChatId,
  name1,
  name2,
} from "../../../../script.js";
import { METADATA_KEY, world_names } from "../../../world-info.js";
import {
  getSceneMarkers,
  saveMetadataForCurrentContext,
  clearScene,
} from "./sceneManager.js";
import {
  getCurrentMemoryBooksContext,
  showLorebookSelectionPopup,
  getEffectiveLorebookName,
} from "./utils.js";
import { autoCreateLorebook } from "./autocreate.js";
import { Popup, POPUP_TYPE, POPUP_RESULT } from "../../../popup.js";
import { isMemoryProcessing } from "./index.js";
import { translate } from "../../../i18n.js";

const MODULE_NAME = "STMemoryBooks-AutoSummary";

/**
 * i18n helper: translate with Mustache-style {{var}} interpolation
 * Use like i18n('KEY', 'Fallback {{var}}', { var: 'value' })
 * Internally calls SillyTavern's translate(fallback, key).
 */
function i18n(key, fallback, params) {
  const localized = translate(fallback, key);
  if (!params) return localized;
  return localized.replace(/{{\s*(\w+)\s*}}/g, (m, p1) => {
    const v = params[p1];
    return v !== undefined && v !== null ? String(v) : "";
  });
}

/**
 * Validates lorebook for auto-summary with user-friendly prompts
 */
async function validateLorebookForAutoSummary() {
  // First, try to get a lorebook without showing popups
  const settings = extension_settings.STMemoryBooks;
  let lorebookName;

  if (!settings.moduleSettings.manualModeEnabled) {
    // Automatic mode - use chat-bound lorebook
    lorebookName = chat_metadata?.[METADATA_KEY] || null;

    // Check if auto-create is enabled and no lorebook exists
    if (!lorebookName && settings?.moduleSettings?.autoCreateLorebook) {
      // Auto-create lorebook using template
      const template =
        settings.moduleSettings.lorebookNameTemplate ||
        i18n(
          "STMemoryBooks_LorebookNameTemplatePlaceholder",
          "LTM - {{char}} - {{chat}}",
        );
      const result = await autoCreateLorebook(template, "auto-summary");

      if (result.success) {
        lorebookName = result.name;
      } else {
        return { valid: false, error: result.error };
      }
    }
  } else {
    // Manual mode - check if a lorebook is already selected
    const stmbData = getSceneMarkers() || {};
    lorebookName = stmbData.manualLorebook ?? null;

    // If no lorebook is selected, ask user what to do
    if (!lorebookName) {
      const popupContent = `
                <h4 data-i18n="STMemoryBooks_AutoSummaryReadyTitle">Auto-Summary Ready</h4>
                <div class="world_entry_form_control">
                    <p data-i18n="STMemoryBooks_AutoSummaryNoAssignedLorebook">Auto-summary is enabled but there is no assigned lorebook for this chat.</p>
                    <p data-i18n="STMemoryBooks_AutoSummarySelectOrPostponeQuestion">Would you like to select a lorebook for memory storage, or postpone this auto-summary?</p>
                    <label for="stmb-postpone-messages" data-i18n="STMemoryBooks_PostponeLabel">Postpone for how many messages?</label>
                    <select id="stmb-postpone-messages" class="text_pole">
                        <option value="10" data-i18n="STMemoryBooks_Postpone10">10 messages</option>
                        <option value="20" data-i18n="STMemoryBooks_Postpone20">20 messages</option>
                        <option value="30" data-i18n="STMemoryBooks_Postpone30">30 messages</option>
                        <option value="40" data-i18n="STMemoryBooks_Postpone40">40 messages</option>
                        <option value="50" data-i18n="STMemoryBooks_Postpone50">50 messages</option>
                    </select>
                </div>
            `;

      const popup = new Popup(popupContent, POPUP_TYPE.TEXT, "", {
        okButton: i18n(
          "STMemoryBooks_Button_SelectLorebook",
          "Select Lorebook",
        ),
        cancelButton: i18n("STMemoryBooks_Button_Postpone", "Postpone"),
      });
      const result = await popup.show();

      if (result === POPUP_RESULT.AFFIRMATIVE) {
        // User wants to select a lorebook
        const selectedLorebook = await showLorebookSelectionPopup();
        if (selectedLorebook) {
          stmbData.manualLorebook = selectedLorebook;
          saveMetadataForCurrentContext();
          lorebookName = selectedLorebook;
        } else {
          return {
            valid: false,
            error: i18n(
              "STMemoryBooks_Error_NoLorebookSelectedForAutoSummary",
              "No lorebook selected for auto-summary.",
            ),
          };
        }
      } else {
        // User wants to postpone
        const postponeSelect = popup.dlg.querySelector(
          "#stmb-postpone-messages",
        );
        const postponeMessages = parseInt(postponeSelect.value) || 20;
        const currentMessageCount = chat.length;

        // Set postpone flag
        stmbData.autoSummaryNextPromptAt =
          currentMessageCount + postponeMessages;
        saveMetadataForCurrentContext();

        console.log(
          i18n(
            "autosummary.log.postponed",
            "STMemoryBooks: Auto-summary postponed for {{count}} messages (until message {{until}})",
            {
              count: postponeMessages,
              until: stmbData.autoSummaryNextPromptAt,
            },
          ),
        );
        return {
          valid: false,
          error: i18n(
            "STMemoryBooks_Info_AutoSummaryPostponed",
            "Auto-summary postponed for {{count}} messages.",
            { count: postponeMessages },
          ),
        };
      }
    }
  }

  // At this point we should have a lorebook name - validate it
  if (!lorebookName) {
    return {
      valid: false,
      error: i18n(
        "STMemoryBooks_Error_NoLorebookForAutoSummary",
        "No lorebook available for auto-summary.",
      ),
    };
  }

  if (!world_names || !world_names.includes(lorebookName)) {
    return {
      valid: false,
      error: i18n(
        "STMemoryBooks_Error_SelectedLorebookNotFound",
        'Selected lorebook "{{name}}" not found.',
        { name: lorebookName },
      ),
    };
  }

  try {
    const { loadWorldInfo } = await import("../../../world-info.js");
    const lorebookData = await loadWorldInfo(lorebookName);
    return { valid: !!lorebookData, data: lorebookData, name: lorebookName };
  } catch (error) {
    return {
      valid: false,
      error: i18n(
        "STMemoryBooks_Error_FailedToLoadSelectedLorebook",
        "Failed to load the selected lorebook.",
      ),
    };
  }
}

/**
 * Check if auto-summary should trigger based on current message count and settings
 * @returns {Promise<void>}
 */
export async function checkAutoSummaryTrigger() {
  try {
    const settings = extension_settings.STMemoryBooks;
    if (!settings?.moduleSettings?.autoSummaryEnabled) {
      return;
    }

    const stmbData = getSceneMarkers() || {};
    const currentMessageCount = chat.length;
    const currentLastMessage = currentMessageCount - 1;
    const requiredInterval = settings.moduleSettings.autoSummaryInterval;
    const rawBuf = settings?.moduleSettings?.autoSummaryBuffer;
    const buffer = Math.min(Math.max(parseInt(rawBuf) || 0, 0), 50);
    const requiredTotal = requiredInterval + buffer;
    const highestProcessed = stmbData.highestMemoryProcessed ?? null;

    // Check if memory creation is in progress
    if (isMemoryProcessing()) {
      console.log(
        i18n(
          "autosummary.log.skippedInProgress",
          "STMemoryBooks: Auto-summary skipped - memory creation in progress",
        ),
      );
      return;
    }

    // Calculate messages since last memory
    let messagesSinceLastMemory;
    if (highestProcessed === null) {
      // No previous memories processed - count from beginning
      messagesSinceLastMemory = currentMessageCount;
      console.log(
        i18n(
          "autosummary.log.noPrevious",
          "STMemoryBooks: No previous memories found - counting from start",
        ),
      );
    } else {
      // Count messages since the last processed memory
      messagesSinceLastMemory = currentLastMessage - highestProcessed;
      console.log(
        i18n(
          "autosummary.log.sinceLast",
          "STMemoryBooks: Messages since last memory ({{highestProcessed}}): {{count}}",
          { highestProcessed, count: messagesSinceLastMemory },
        ),
      );
    }

    console.log(
      i18n(
        "autosummary.log.triggerCheck",
        "STMemoryBooks: Auto-summary trigger check: {{count}} >= {{required}}?",
        { count: messagesSinceLastMemory, required: requiredTotal },
      ),
    );

    if (messagesSinceLastMemory < requiredTotal) {
      console.log(
        i18n(
          "autosummary.log.notTriggered",
          "STMemoryBooks: Auto-summary not triggered - need {{needed}} more messages",
          { needed: requiredTotal - messagesSinceLastMemory },
        ),
      );
      return;
    }

    // Check if user has postponed auto-summary
    if (
      stmbData.autoSummaryNextPromptAt &&
      currentMessageCount < stmbData.autoSummaryNextPromptAt
    ) {
      console.log(
        i18n(
          "autosummary.log.postponedUntil",
          "STMemoryBooks: Auto-summary postponed until message {{until}}",
          { until: stmbData.autoSummaryNextPromptAt },
        ),
      );
      return; // Still in postpone period
    }

    // Auto-summary will set new scene markers - no need to clear existing ones
    const lorebookValidation = await validateLorebookForAutoSummary();
    if (!lorebookValidation.valid) {
      console.log(
        i18n(
          "autosummary.log.blocked",
          "STMemoryBooks: Auto-summary blocked - lorebook validation failed: {{error}}",
          { error: lorebookValidation.error },
        ),
      );
      return; // No lorebook available or user cancelled
    }

    // Clear any postpone flag since we're proceeding with auto-summary
    if (stmbData.autoSummaryNextPromptAt) {
      delete stmbData.autoSummaryNextPromptAt;
      saveMetadataForCurrentContext();
      console.log(
        i18n(
          "autosummary.log.clearedPostpone",
          "STMemoryBooks: Cleared auto-summary postpone flag",
        ),
      );
    }

    // Calculate the scene range for auto-summary (apply buffer to end)
    let sceneStart, sceneEnd;
    const sceneEndCandidate = currentLastMessage - buffer;
    const safeEnd = Math.max(0, sceneEndCandidate);
    if (highestProcessed === null) {
      // First memory - include everything from start
      sceneStart = 0;
      sceneEnd = safeEnd;
    } else {
      // Start from the message after the last processed memory
      sceneStart = highestProcessed + 1;
      sceneEnd = safeEnd;
    }
    // Defensive: ensure valid range
    if (sceneStart > sceneEnd) {
      return;
    }

    console.log(
      i18n(
        "autosummary.log.triggered",
        "STMemoryBooks: Auto-summary triggered - creating memory for range {{start}}-{{end}}",
        { start: sceneStart, end: sceneEnd },
      ),
    );

    // Set scene markers for the range we want to process
    stmbData.sceneStart = sceneStart;
    stmbData.sceneEnd = sceneEnd;
    saveMetadataForCurrentContext();

    // Use the existing memory creation system via slash command
    const { executeSlashCommands } = await import("../../../slash-commands.js");
    await executeSlashCommands("/creatememory");
  } catch (error) {
    console.error(
      i18n(
        "autosummary.log.triggerError",
        "STMemoryBooks: Error in auto-summary trigger check:",
      ),
      error,
    );
  }
}

/**
 * Handle auto-summary for single character chats on message received
 * @returns {Promise<void>}
 */
export async function handleAutoSummaryMessageReceived() {
  try {
    const context = getCurrentMemoryBooksContext();

    // Only check auto-summary for single character chats on MESSAGE_RECEIVED
    // Group chats will be handled by GROUP_WRAPPER_FINISHED event
    if (
      !context.isGroupChat &&
      extension_settings.STMemoryBooks.moduleSettings.autoSummaryEnabled
    ) {
      const currentMessageCount = chat.length;
      console.log(
        i18n(
          "autosummary.log.messageReceivedSingle",
          "STMemoryBooks: Message received (single chat) - auto-summary enabled, current count: {{count}}",
          { count: currentMessageCount },
        ),
      );

      await checkAutoSummaryTrigger();
    } else if (context.isGroupChat) {
      console.log(
        i18n(
          "autosummary.log.messageReceivedGroup",
          "STMemoryBooks: Message received in group chat - deferring to GROUP_WRAPPER_FINISHED",
        ),
      );
    }
  } catch (error) {
    console.error(
      i18n(
        "autosummary.log.messageHandlerError",
        "STMemoryBooks: Error in auto-summary message received handler:",
      ),
      error,
    );
  }
}

/**
 * Handle auto-summary for group chats when all members have finished speaking
 * @returns {Promise<void>}
 */
export async function handleAutoSummaryGroupFinished() {
  try {
    if (extension_settings.STMemoryBooks.moduleSettings.autoSummaryEnabled) {
      const currentMessageCount = chat.length;
      console.log(
        i18n(
          "autosummary.log.groupFinished",
          "STMemoryBooks: Group conversation finished - auto-summary enabled, current count: {{count}}",
          { count: currentMessageCount },
        ),
      );

      // Check auto-summary trigger after all group members have finished speaking
      await checkAutoSummaryTrigger();
    }
  } catch (error) {
    console.error(
      i18n(
        "autosummary.log.groupHandlerError",
        "STMemoryBooks: Error in auto-summary group finished handler:",
      ),
      error,
    );
  }
}

/**
 * Clear auto-summary state after successful memory creation
 * @returns {void}
 */
export function clearAutoSummaryState() {
  if (extension_settings.STMemoryBooks?.moduleSettings?.autoSummaryEnabled) {
    // Clear scene markers; baseline is updated upon successful memory creation
    clearScene();
  }
}
