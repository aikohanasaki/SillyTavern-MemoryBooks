import { chat_metadata } from "../../../../script.js";
import { extension_settings } from "../../../extensions.js";
import { Popup, POPUP_TYPE, POPUP_RESULT } from "../../../popup.js";
import {
  METADATA_KEY,
  world_names,
  loadWorldInfo,
  assignLorebookToChat,
} from "../../../world-info.js";
import { DOMPurify } from "../../../../lib.js";
import { translate } from "../../../i18n.js";
import { autoCreateLorebook } from "./autocreate.js";
import { getSceneMarkers } from "./sceneManager.js";
import { showLorebookSelectionPopup } from "./utils.js";
import { escapeHtml } from "../../../utils.js";

function getDefaultRetryText(manualMode) {
  return manualMode
    ? translate(
        "After selecting a lorebook, try again.",
        "STMemoryBooks_RetryAfterManualLorebookSelection",
      )
    : translate(
        "After selecting a lorebook in SillyTavern, try again.",
        "STMemoryBooks_RetryAfterChatLorebookSelection",
      );
}

function getProblemText({ manualMode, lorebookName, reason }) {
  const escapedName = lorebookName ? escapeHtml(lorebookName) : "";

  if (reason === "unassigned") {
    return manualMode
      ? translate(
          "No manual lorebook is currently selected for this chat.",
          "STMemoryBooks_NoManualLorebookSelected",
        )
      : translate(
          "No chat-bound lorebook is currently selected.",
          "STMemoryBooks_NoChatLorebookSelected",
        );
  }

  if (reason === "loadFailed") {
    return manualMode
      ? translate(
          `The configured manual lorebook "${escapedName}" could not be loaded.`,
          "STMemoryBooks_ManualLorebookLoadFailedMessage",
        )
      : translate(
          `The chat-bound lorebook "${escapedName}" could not be loaded.`,
          "STMemoryBooks_ChatLorebookLoadFailedMessage",
        );
  }

  return manualMode
    ? translate(
        `The configured manual lorebook "${escapedName}" was not found.`,
        "STMemoryBooks_ManualLorebookMissingMessage",
      )
    : translate(
        `The chat-bound lorebook "${escapedName}" was not found.`,
        "STMemoryBooks_ChatLorebookMissingMessage",
      );
}

function getActionText({ manualMode, allowCreate, hasExistingLorebooks }) {
  if (allowCreate && hasExistingLorebooks) {
    return translate(
      "Create a replacement lorebook or select an existing one, then try again.",
      "STMemoryBooks_CreateOrSelectChatLorebookThenRetry",
    );
  }

  if (allowCreate) {
    return translate(
      "Create a new lorebook to continue.",
      "STMemoryBooks_CreateLorebookToContinue",
    );
  }

  if (hasExistingLorebooks) {
    return manualMode
      ? translate(
          "Select an existing lorebook for this chat, then try again.",
          "STMemoryBooks_SelectManualLorebookThenRetry",
        )
      : translate(
          "Select an existing lorebook in SillyTavern, then try again.",
          "STMemoryBooks_SelectChatLorebookThenRetry",
        );
  }

  return translate(
    "No existing lorebooks are available to select.",
    "STMemoryBooks_NoExistingLorebooksAvailable",
  );
}

async function showLorebookRecoveryPopup({
  manualMode,
  lorebookName,
  allowCreate,
  createContext,
  retryText,
  reason,
}) {
  const hasExistingLorebooks = Array.isArray(world_names) && world_names.length > 0;
  const title = translate(
    "Memory Lorebook Missing",
    "STMemoryBooks_MemoryLorebookMissingTitle",
  );
  const popupContent = DOMPurify.sanitize(`
    <h4>${title}</h4>
    <div class="world_entry_form_control">
      <p>${getProblemText({ manualMode, lorebookName, reason })}</p>
      <p>${getActionText({ manualMode, allowCreate, hasExistingLorebooks })}</p>
      ${
        hasExistingLorebooks
          ? `<p>${retryText}</p>`
          : ""
      }
    </div>
  `);
  const customButtons = [];

  if (allowCreate) {
    customButtons.push({
      text: translate(
        "Create New Lorebook",
        "STMemoryBooks_CreateNewLorebookButton",
      ),
      result: POPUP_RESULT.CUSTOM1,
      appendAtEnd: true,
    });
  }

  if (hasExistingLorebooks) {
    customButtons.push({
      text: translate(
        "Select Existing Lorebook",
        "STMemoryBooks_SelectExistingLorebookButton",
      ),
      result: POPUP_RESULT.CUSTOM2,
      appendAtEnd: true,
    });
  }

  const recoveryPopup = new Popup(popupContent, POPUP_TYPE.TEXT, "", {
    okButton: false,
    cancelButton: translate("Cancel", "STMemoryBooks_Cancel"),
    customButtons,
    leftAlign: true,
  });
  const recoveryResult = await recoveryPopup.show();

  if (recoveryResult === POPUP_RESULT.CUSTOM1 && allowCreate) {
    const template =
      extension_settings?.STMemoryBooks?.moduleSettings?.lorebookNameTemplate ||
      "LTM - {{char}} - {{chat}}";
    const createResult = await autoCreateLorebook(template, createContext);

    if (createResult.success) {
      return { type: "created", lorebookName: createResult.name };
    }

    return { type: "error", error: createResult.error };
  }

  if (recoveryResult === POPUP_RESULT.CUSTOM2 && hasExistingLorebooks) {
    if (manualMode) {
      void showLorebookSelectionPopup(lorebookName).catch((error) => {
        console.error(
          "STMemoryBooks: Failed to open manual lorebook selection popup:",
          error,
        );
      });
    } else {
      void assignLorebookToChat({ altKey: false }).catch((error) => {
        console.error(
          "STMemoryBooks: Failed to open chat lorebook selection popup:",
          error,
        );
      });
    }

    return { type: "handled", error: retryText };
  }

  return {
    type: "handled",
    error: translate(
      "Lorebook recovery cancelled.",
      "STMemoryBooks_LorebookRecoveryCancelled",
    ),
  };
}

export async function validateLorebookRequirement(options = {}) {
  const {
    skipAutoCreate = false,
    createContext = "chat",
    retryText = null,
    manualMode = undefined,
    lorebookName: lorebookNameOverride = undefined,
  } = options;
  const settings = extension_settings.STMemoryBooks;
  const resolvedManualMode =
    manualMode ?? !!settings?.moduleSettings?.manualModeEnabled;
  const allowCreate =
    !skipAutoCreate &&
    !resolvedManualMode &&
    !!settings?.moduleSettings?.autoCreateLorebook;
  const stmbData = resolvedManualMode ? getSceneMarkers() || {} : null;
  const resolvedRetryText = retryText || getDefaultRetryText(resolvedManualMode);
  let lorebookName =
    lorebookNameOverride !== undefined
      ? lorebookNameOverride
      : resolvedManualMode
        ? stmbData?.manualLorebook ?? null
        : chat_metadata?.[METADATA_KEY] || null;
  let attempts = 0;

  while (attempts < 3) {
    let recoveryReason = null;

    if (!lorebookName) {
      recoveryReason = "unassigned";
    } else if (!world_names || !world_names.includes(lorebookName)) {
      recoveryReason = "missing";
    }

    if (recoveryReason) {
      const recovery = await showLorebookRecoveryPopup({
        manualMode: resolvedManualMode,
        lorebookName,
        allowCreate,
        createContext,
        retryText: resolvedRetryText,
        reason: recoveryReason,
      });

      if (recovery.type === "created") {
        lorebookName = recovery.lorebookName;
        attempts += 1;
        continue;
      }

      if (recovery.type === "error") {
        return { valid: false, error: recovery.error };
      }

      return { valid: false, error: recovery.error, handled: true };
    }

    try {
      const lorebookData = await loadWorldInfo(lorebookName);

      if (!lorebookData) {
        throw new Error("Failed to load the selected lorebook.");
      }

      return { valid: true, data: lorebookData, name: lorebookName };
    } catch (error) {
      const recovery = await showLorebookRecoveryPopup({
        manualMode: resolvedManualMode,
        lorebookName,
        allowCreate,
        createContext,
        retryText: resolvedRetryText,
        reason: "loadFailed",
      });

      if (recovery.type === "created") {
        lorebookName = recovery.lorebookName;
        attempts += 1;
        continue;
      }

      if (recovery.type === "error") {
        return { valid: false, error: recovery.error };
      }

      return { valid: false, error: recovery.error, handled: true };
    }
  }

  return {
    valid: false,
    error: translate(
      "Unable to resolve a valid lorebook.",
      "STMemoryBooks_UnableToResolveValidLorebook",
    ),
  };
}
