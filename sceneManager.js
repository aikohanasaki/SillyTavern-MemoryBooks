import { chat, chat_metadata } from '../../../../script.js';
import { saveMetadataDebounced } from '../../../extensions.js';
import { createSceneRequest, estimateTokenCount, compileScene } from './chatcompile.js';
import { getCurrentMemoryBooksContext } from './utils.js';
import { groups, editGroup } from '../../../group-chats.js';

const MODULE_NAME = 'STMemoryBooks-SceneManager';

// Cache for current scene state
let currentSceneState = {
    start: null,
    end: null
};

/**
 * GROUP CHAT SUPPORT: Get current scene markers from appropriate metadata location
 * Handles both group chats (group.chat_metadata) and single character chats (chat_metadata)
 */
export function getSceneMarkers() {
    const context = getCurrentMemoryBooksContext();
        
    if (context.isGroupChat) {
        // Group chat - store in group metadata
        const group = groups?.find(x => x.id === context.groupId);
        
        if (group) {
            if (!group.chat_metadata) {
                group.chat_metadata = {};
            }
            if (!group.chat_metadata.STMemoryBooks) {
                group.chat_metadata.STMemoryBooks = {};
            }


            // Sync from currentSceneState to prevent stale metadata from being returned after scene changes
            if (currentSceneState.start !== null || currentSceneState.end !== null) {
                group.chat_metadata.STMemoryBooks.sceneStart = currentSceneState.start;
                group.chat_metadata.STMemoryBooks.sceneEnd = currentSceneState.end;
            }
            
            return group.chat_metadata.STMemoryBooks;
        }
    } else {
        // Single character chat - chat_metadata
        if (!chat_metadata) {
            return {};
        }
        if (!chat_metadata.STMemoryBooks) {
            chat_metadata.STMemoryBooks = {};
        }


        // sync from currentSceneState for consistency
        if (currentSceneState.start !== null || currentSceneState.end !== null) {
            chat_metadata.STMemoryBooks.sceneStart = currentSceneState.start;
            chat_metadata.STMemoryBooks.sceneEnd = currentSceneState.end;
        }
        
        return chat_metadata.STMemoryBooks;
    }
    
    // Fallback for edge cases
    return {};
}

/**
 * GROUP CHAT SUPPORT: Save metadata for current context (group or single character)
 * Handles both group metadata saving and regular chat metadata saving
 */
export function saveMetadataForCurrentContext() {
    const context = getCurrentMemoryBooksContext();
    
    if (context.isGroupChat) {
        // Group chat - SYNCHRONOUS save with verification
        const group = groups?.find(x => x.id === context.groupId);
        if (!group) {
            return;
        }
        
        // Ensure group metadata structure exists
        if (!group.chat_metadata) {
            group.chat_metadata = {};
        }
        if (!group.chat_metadata.STMemoryBooks) {
            group.chat_metadata.STMemoryBooks = {};
        }
        
        // SYNCHRONOUS: Preserve all existing metadata, then update scene state
        const existing = getSceneMarkers();
        Object.assign(group.chat_metadata.STMemoryBooks, existing);
        group.chat_metadata.STMemoryBooks.sceneStart = currentSceneState.start;
        group.chat_metadata.STMemoryBooks.sceneEnd = currentSceneState.end;
        
        // Force immediate persistence through SillyTavern's group save mechanism
        if (typeof editGroup === 'function') {
            editGroup(context.groupId, false, false);
        } else {
            // Try fallback editGroup functions
            const editGroupFunc = window.editGroup || globalThis.editGroup;
            if (typeof editGroupFunc === 'function') {
                editGroupFunc(context.groupId, false, false);
            }
        }
        
    } else {
        // Single character chat - use existing debounced save
        saveMetadataDebounced();
    }
}

/**
 * Update button states only for affected messages (instead of all messages)
 * @param {number|null} oldStart - Previous start marker
 * @param {number|null} oldEnd - Previous end marker  
 * @param {number|null} newStart - New start marker
 * @param {number|null} newEnd - New end marker
 */
function updateAffectedButtonStates(oldStart, oldEnd, newStart, newEnd) {
    // Calculate the range of messages that could be affected
    const affectedRange = calculateAffectedRange(oldStart, oldEnd, newStart, newEnd);
    
    if (affectedRange.needsFullUpdate) {
        // Fall back to full update for complex changes
        updateAllButtonStates();
        return;
    }
    
    if (affectedRange.min === null || affectedRange.max === null) {
        // No messages affected
        return;
    }
    
    // Only query and update the affected message range
    const selector = `#chat .mes[mesid]`;
    const allMessages = document.querySelectorAll(selector);
    const affectedMessages = Array.from(allMessages).filter(messageElement => {
        const messageId = parseInt(messageElement.getAttribute('mesid'));
        return messageId >= affectedRange.min && messageId <= affectedRange.max;
    });
    
    if (affectedMessages.length > 0) {
        const markers = getSceneMarkers();
        updateButtonStatesForElements(affectedMessages, markers);
    }
}

/**
 * Calculate which message range is affected by scene marker changes
 * @param {number|null} oldStart - Previous start marker
 * @param {number|null} oldEnd - Previous end marker
 * @param {number|null} newStart - New start marker  
 * @param {number|null} newEnd - New end marker
 * @returns {Object} Range info with min, max, and needsFullUpdate flag
 */
function calculateAffectedRange(oldStart, oldEnd, newStart, newEnd) {
    const affectedIds = new Set();
    
    // Add old scene range
    if (oldStart !== null && oldEnd !== null) {
        for (let i = oldStart; i <= oldEnd; i++) {
            affectedIds.add(i);
        }
    }
    
    // Add old markers
    if (oldStart !== null) affectedIds.add(oldStart);
    if (oldEnd !== null) affectedIds.add(oldEnd);
    
    // Add new scene range
    if (newStart !== null && newEnd !== null) {
        for (let i = newStart; i <= newEnd; i++) {
            affectedIds.add(i);
        }
    }
    
    // Add new markers
    if (newStart !== null) affectedIds.add(newStart);
    if (newEnd !== null) affectedIds.add(newEnd);
    
    // Add messages that might need "valid-start-point" or "valid-end-point" classes
    if (newStart !== null && newEnd === null) {
        // Start set, no end - all messages after start could be valid end points
        // Limit the range to avoid scanning thousands of messages
        const maxScan = Math.min(newStart + 100, chat.length - 1);
        for (let i = newStart + 1; i <= maxScan; i++) {
            affectedIds.add(i);
        }
    }
    
    if (newEnd !== null && newStart === null) {
        // End set, no start - all messages before end could be valid start points
        // Limit the range to avoid scanning thousands of messages  
        const minScan = Math.max(newEnd - 100, 0);
        for (let i = minScan; i < newEnd; i++) {
            affectedIds.add(i);
        }
    }
    
    // Add messages that had valid-point classes in the old state but won't in the new state
    if (oldStart !== null && oldEnd === null && newStart !== null && newEnd !== null) {
        // Transitioning from "start only" to "complete scene" - need to clear valid-end-point from messages after newEnd
        const maxScan = Math.min(oldStart + 100, chat.length - 1);
        for (let i = newEnd + 1; i <= maxScan; i++) {
            affectedIds.add(i);
        }
    }
    
    if (oldEnd !== null && oldStart === null && newStart !== null && newEnd !== null) {
        // Transitioning from "end only" to "complete scene" - need to clear valid-start-point from messages before newStart
        const minScan = Math.max(oldEnd - 100, 0);
        for (let i = minScan; i < newStart; i++) {
            affectedIds.add(i);
        }
    }
    
    if (affectedIds.size === 0) {
        return { min: null, max: null, needsFullUpdate: false };
    }
    
    // If we're affecting more than 200 messages, fall back to full update
    if (affectedIds.size > 200) {
        return { needsFullUpdate: true };
    }
    
    const sortedIds = Array.from(affectedIds).sort((a, b) => a - b);
    return {
        min: sortedIds[0],
        max: sortedIds[sortedIds.length - 1],
        needsFullUpdate: false
    };
}

/**
 * Set scene marker with validation
 */
export function setSceneMarker(messageId, type) {
    const markers = getSceneMarkers();

    // Store previous state for optimization
    const oldStart = markers.sceneStart ?? null;
    const oldEnd = markers.sceneEnd ?? null;

    // Calculate new state atomically
    const newState = calculateNewSceneState(markers, messageId, type);

    // Update both metadata and cache simultaneously
    markers.sceneStart = newState.start;
    markers.sceneEnd = newState.end;
    currentSceneState.start = newState.start;
    currentSceneState.end = newState.end;

    // Persist to metadata and update DOM to match committed state
    saveMetadataForCurrentContext();
    updateAffectedButtonStates(oldStart, oldEnd, newState.start, newState.end);
}

/**
 * Clear scene markers
 */
export function clearScene() {

    const markers = getSceneMarkers();

    // Store previous state for optimization
    const oldStart = markers.sceneStart ?? null;
    const oldEnd = markers.sceneEnd ?? null;
    
    // Clear both metadata and cache simultaneously
    markers.sceneStart = null;
    markers.sceneEnd = null;
    currentSceneState.start = null;
    currentSceneState.end = null;
    
    // Persist and update DOM
    saveMetadataForCurrentContext();
    updateAllButtonStates();    
}

/**
 * Update visual states of all currently rendered message buttons (FULL UPDATE)
 * Use this for: chat loads, scene marker changes, initialization
 */
export function updateAllButtonStates() {
    const markers = getSceneMarkers();
    
    // Find all rendered message elements
    const messageElements = document.querySelectorAll('#chat .mes[mesid]');
    
    // Apply button states to all messages
    updateButtonStatesForElements(messageElements, markers);    
}

/**
 * Update visual states of specific message buttons only (PARTIAL UPDATE)
 * Use this for: new messages added to current chat
 * @param {NodeList|Array} messageElements - Specific message elements to update
 */
export function updateNewMessageButtonStates(messageElements) {
    if (!messageElements || messageElements.length === 0) return;
    
    const markers = getSceneMarkers();
    
    // Apply button states to only the specified messages
    updateButtonStatesForElements(messageElements, markers);
    
}

/**
 * Core logic for updating button states on a set of message elements
 * @private
 * @param {NodeList|Array} messageElements - Message elements to update
 * @param {Object} markers - Current scene markers
 */
function updateButtonStatesForElements(messageElements, markers) {
    const { sceneStart, sceneEnd } = markers;
        
    messageElements.forEach(messageElement => {
        const messageId = parseInt(messageElement.getAttribute('mesid'));
        const startBtn = messageElement.querySelector('.mes_stmb_start');
        const endBtn = messageElement.querySelector('.mes_stmb_end');
        
        if (!startBtn || !endBtn) return;
        
        // Clear all special classes
        startBtn.classList.remove('on', 'valid-start-point', 'in-scene');
        endBtn.classList.remove('on', 'valid-end-point', 'in-scene');
        
        // Apply appropriate classes based on current state
        if ((sceneStart ?? null) !== null && (sceneEnd ?? null) !== null) {
            // Complete scene - highlight range and markers distinctly
            if (messageId === sceneStart) {
                // This is the start marker
                startBtn.classList.add('on');
            } else if (messageId === sceneEnd) {
                // This is the end marker
                endBtn.classList.add('on');
            } else if (messageId > sceneStart && messageId < sceneEnd) {
                // This is a message between start and end
                startBtn.classList.add('in-scene');
                endBtn.classList.add('in-scene');
            }
            // Messages outside the scene range (before start or after end) should have no special styling
            // The classes were already cleared above, so no additional action needed

        } else if ((sceneStart ?? null) !== null) {
            // Start set, show valid end points
            if (messageId === sceneStart) {
                startBtn.classList.add('on');
            } else if (messageId > sceneStart) {
                endBtn.classList.add('valid-end-point');
            }

        } else if ((sceneEnd ?? null) !== null) {
            // End set, show valid start points
            if (messageId === sceneEnd) {
                endBtn.classList.add('on');
            } else if (messageId < sceneEnd) {
                startBtn.classList.add('valid-start-point');
            }
        }
    });
}

/**
 * Validate scene markers after message changes
 */
export function validateSceneMarkers() {
    const markers = getSceneMarkers();

    // Store previous state for optimization
    const oldStart = markers.sceneStart ?? null;
    const oldEnd = markers.sceneEnd ?? null;
    
    let hasChanges = false;
    
    // Check if markers are within chat bounds
    const chatLength = chat.length;
    
    if (markers.sceneStart !== null && markers.sceneStart >= chatLength) {
        markers.sceneStart = null;
        hasChanges = true;
    }
    
    if (markers.sceneEnd !== null && markers.sceneEnd >= chatLength) {
        // For end marker, try to fall back to last message
        markers.sceneEnd = chatLength - 1;
        hasChanges = true;
    }
    
    // Ensure start <= end (start = end is valid for single message)
    if (markers.sceneStart !== null && markers.sceneEnd !== null && markers.sceneStart > markers.sceneEnd) {
        markers.sceneStart = null;
        markers.sceneEnd = null;
        hasChanges = true;
    }
    
    if (hasChanges) {
        currentSceneState.start = markers.sceneStart;
        currentSceneState.end = markers.sceneEnd;
        saveMetadataForCurrentContext();
        
        // Use selective update instead of full update
        updateAffectedButtonStates(oldStart, oldEnd, markers.sceneStart, markers.sceneEnd);
    }
}

/**
 * Handle message deletion events
 */
export function handleMessageDeletion(deletedId, settings) {
    const markers = getSceneMarkers();
    const oldStart = markers.sceneStart ?? null;
    const oldEnd = markers.sceneEnd ?? null;
    let hasChanges = false;
    let toastrMessage = '';

    // If start marker was deleted, clear entire scene
    if (markers.sceneStart === deletedId) {
        markers.sceneStart = null;
        markers.sceneEnd = null; // Also clear the end marker
        hasChanges = true;
        toastrMessage = 'Scene cleared due to start marker deletion';

    // If end marker was deleted, just clear the end marker
    } else if (markers.sceneEnd === deletedId) {
        markers.sceneEnd = null;
        hasChanges = true;
        toastrMessage = 'Scene end point cleared due to message deletion';

    } else {
        let startChanged = false;
        let endChanged = false;

        // If a message *before* the start marker is deleted, shift the start marker down.
        if (markers.sceneStart !== null && markers.sceneStart > deletedId) {
            markers.sceneStart--;
            startChanged = true;
        }
        // If a message *before* the end marker is deleted, shift the end marker down.
        if (markers.sceneEnd !== null && markers.sceneEnd > deletedId) {
            markers.sceneEnd--;
            endChanged = true;
        }

        if (startChanged || endChanged) {
            hasChanges = true;
            toastrMessage = 'Scene markers adjusted due to message deletion.';
        }
    }

    if (hasChanges) {
        currentSceneState.start = markers.sceneStart;
        currentSceneState.end = markers.sceneEnd;
        saveMetadataForCurrentContext();
        updateAffectedButtonStates(oldStart, oldEnd, markers.sceneStart, markers.sceneEnd);

        if (settings?.moduleSettings?.showNotifications) {
            toastr.warning(toastrMessage, 'STMemoryBooks');
        }
    }

    // Always validate the markers after any deletion
    validateSceneMarkers();
}

/**
 * Create message action buttons with consistent styling
 */
export function createSceneButtons(messageElement) {
    const messageId = parseInt(messageElement.getAttribute('mesid'));
    let extraButtonsContainer = messageElement.querySelector('.extraMesButtons');

    // If the button container doesn't exist (e.g., on user messages), create and append it.
    if (!extraButtonsContainer) {
        extraButtonsContainer = document.createElement('div');
        extraButtonsContainer.classList.add('extraMesButtons');
        
        // SillyTavern messages have a 'mes_block' that contains the text and buttons.
        // Appending our container here ensures consistent placement.
        const messageBlock = messageElement.querySelector('.mes_block');
        if (messageBlock) {
            messageBlock.appendChild(extraButtonsContainer);
        } else {
            // As a fallback, append to the main message element.
            // The .extraMesButtons CSS should still position it reasonably well.
            messageElement.appendChild(extraButtonsContainer);
        }
    }
    
    // Check if buttons already exist to prevent duplication
    if (messageElement.querySelector('.mes_stmb_start')) return;
    
    // Create start button
    const startButton = document.createElement('div');
    startButton.title = 'Mark Scene Start';
    startButton.classList.add('mes_stmb_start', 'mes_button', 'fa-solid', 'fa-caret-right', 'interactable');
    startButton.setAttribute('tabindex', '0');
    startButton.setAttribute('data-i18n', '[title]Mark Scene Start');
    
    // Create end button
    const endButton = document.createElement('div');
    endButton.title = 'Mark Scene End';
    endButton.classList.add('mes_stmb_end', 'mes_button', 'fa-solid', 'fa-caret-left', 'interactable');
    endButton.setAttribute('tabindex', '0');
    endButton.setAttribute('data-i18n', '[title]Mark Scene End');
    
    // Add event listeners
    startButton.addEventListener('click', (e) => {
        e.stopPropagation();
        setSceneMarker(messageId, 'start');
    });
    
    endButton.addEventListener('click', (e) => {
        e.stopPropagation();
        setSceneMarker(messageId, 'end');
    });
    
    // Append buttons
    extraButtonsContainer.appendChild(startButton);
    extraButtonsContainer.appendChild(endButton);
}

/**
 * Estimate token count for scene (fallback implementation)
 */
function estimateSceneTokens(startId, endId) {
    let totalChars = 0;
    
    for (let i = startId; i <= endId; i++) {
        const message = chat[i];
        if (message && !message.is_system) {
            totalChars += (message.mes || '').length;
            totalChars += (message.name || '').length;
        }
    }
    
    // Rough estimation: 4 characters per token
    return Math.ceil(totalChars / 4);
}

/**
 * Estimate token count for scene using enhanced method
 */
function estimateSceneTokensEnhanced(startId, endId) {
    try {
        // Create a temporary scene request for estimation
        const tempRequest = createSceneRequest(startId, endId);
        const tempCompiled = compileScene(tempRequest);
        return estimateTokenCount(tempCompiled);
    } catch (error) {
        // Fallback to simple estimation
        return estimateSceneTokens(startId, endId);
    }
}

/**
 * Get scene data with message excerpts
 */
export function getSceneData() {
    const markers = getSceneMarkers();
    
    if (markers.sceneStart === null || markers.sceneEnd === null) {
        return null;
    }
    
    const startMessage = chat[markers.sceneStart];
    const endMessage = chat[markers.sceneEnd];
    
    if (!startMessage || !endMessage) {
        return null;
    }
    
    const getExcerpt = (message) => {
        const content = message.mes || '';
        return content.length > 100 ? content.substring(0, 100) + '...' : content;
    };
    
    return {
        sceneStart: markers.sceneStart,
        sceneEnd: markers.sceneEnd,
        startExcerpt: getExcerpt(startMessage),
        endExcerpt: getExcerpt(endMessage),
        startSpeaker: startMessage.name || 'Unknown',
        endSpeaker: endMessage.name || 'Unknown',
        messageCount: markers.sceneEnd - markers.sceneStart + 1,
        estimatedTokens: estimateSceneTokensEnhanced(markers.sceneStart, markers.sceneEnd)
    };
}

/**
 * Calculate new scene state based on marker type and message ID
 * @private
 */
function calculateNewSceneState(markers, messageId, type) {
    const numericId = parseInt(messageId);
    let newStart = markers.sceneStart;
    let newEnd = markers.sceneEnd;
    
    if (type === 'start') {
        // If setting start, clear end if it would be invalid (start = end is valid)
        if (markers.sceneEnd !== null && markers.sceneEnd < numericId) {
            newEnd = null;
        }

        // Toggle start marker
        newStart = markers.sceneStart === numericId ? null : numericId;
    } else if (type === 'end') {
        // If setting end, clear start if it would be invalid (start = end is valid)
        if (markers.sceneStart !== null && markers.sceneStart > numericId) {
            newStart = null;
        }
        
        // Toggle end marker
        newEnd = markers.sceneEnd === numericId ? null : numericId;
    }
    
    return { start: newStart, end: newEnd };
}

/**
 * Update scene state cache
 */
export function updateSceneStateCache() {
    const markers = getSceneMarkers();
    currentSceneState.start = markers.sceneStart;
    currentSceneState.end = markers.sceneEnd;
}

/**
 * Get current scene state from cache
 */
export function getCurrentSceneState() {
    return { ...currentSceneState };
}

