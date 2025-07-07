import { chat, chat_metadata } from '../../../../script.js';
import { saveMetadataDebounced } from '../../../extensions.js';
import { createSceneRequest, estimateTokenCount, compileScene } from './chatcompile.js';

const MODULE_NAME = 'STMemoryBooks-SceneManager';

// Cache for current scene state
let currentSceneState = {
    start: null,
    end: null
};

/**
 * Get current scene markers from chat metadata
 */
export function getSceneMarkers() {
    if (!chat_metadata.STMemoryBooks) {
        chat_metadata.STMemoryBooks = {
            sceneStart: null,
            sceneEnd: null
        };
    }
    return chat_metadata.STMemoryBooks;
}

/**
 * Set scene marker with validation
 */
export function setSceneMarker(messageId, type) {
    const markers = getSceneMarkers();
    const numericId = parseInt(messageId);
    
    console.log(`${MODULE_NAME}: Setting ${type} marker to message ${numericId}`);
    
    if (type === 'start') {
        // If setting start, clear end if it would be invalid
        if (markers.sceneEnd !== null && markers.sceneEnd <= numericId) {
            markers.sceneEnd = null;
            console.log(`${MODULE_NAME}: Cleared end marker (would be invalid)`);
        }
        
        // Toggle start marker
        markers.sceneStart = markers.sceneStart === numericId ? null : numericId;
    } else if (type === 'end') {
        // If setting end, clear start if it would be invalid  
        if (markers.sceneStart !== null && markers.sceneStart >= numericId) {
            markers.sceneStart = null;
            console.log(`${MODULE_NAME}: Cleared start marker (would be invalid)`);
        }
        
        // Toggle end marker
        markers.sceneEnd = markers.sceneEnd === numericId ? null : numericId;
    }
    
    // Update cache
    currentSceneState.start = markers.sceneStart;
    currentSceneState.end = markers.sceneEnd;
    
    // Save to metadata
    saveMetadataDebounced();
    
    // PERFORMANCE: Full update needed when markers change
    updateAllButtonStates();
    
    console.log(`${MODULE_NAME}: Scene markers updated:`, markers);
}

/**
 * Clear scene markers
 */
export function clearScene() {
    const markers = getSceneMarkers();
    markers.sceneStart = null;
    markers.sceneEnd = null;
    
    currentSceneState.start = null;
    currentSceneState.end = null;
    
    saveMetadataDebounced();
    
    // PERFORMANCE: Full update needed when markers are cleared
    updateAllButtonStates();
    
    console.log(`${MODULE_NAME}: Scene cleared`);
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
    
    console.log(`${MODULE_NAME}: Updated button states for ${messageElements.length} messages (FULL UPDATE)`);
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
    
    console.log(`${MODULE_NAME}: Updated button states for ${messageElements.length} messages (PARTIAL UPDATE)`);
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
        if (sceneStart !== null && sceneEnd !== null) {
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

        } else if (sceneStart !== null) {
            // Start set, show valid end points
            if (messageId === sceneStart) {
                startBtn.classList.add('on');
            } else if (messageId > sceneStart) {
                endBtn.classList.add('valid-end-point');
            }
            
        } else if (sceneEnd !== null) {
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
    let hasChanges = false;
    
    // Check if markers are within chat bounds
    const chatLength = chat.length;
    
    if (markers.sceneStart !== null && markers.sceneStart >= chatLength) {
        markers.sceneStart = null;
        hasChanges = true;
        console.log(`${MODULE_NAME}: Cleared invalid start marker`);
    }
    
    if (markers.sceneEnd !== null && markers.sceneEnd >= chatLength) {
        // For end marker, try to fall back to last message
        markers.sceneEnd = chatLength - 1;
        hasChanges = true;
        console.log(`${MODULE_NAME}: Adjusted end marker to last message`);
    }
    
    // Ensure start < end
    if (markers.sceneStart !== null && markers.sceneEnd !== null && markers.sceneStart >= markers.sceneEnd) {
        markers.sceneStart = null;
        markers.sceneEnd = null;
        hasChanges = true;
        console.log(`${MODULE_NAME}: Cleared invalid scene range`);
    }
    
    if (hasChanges) {
        currentSceneState.start = markers.sceneStart;
        currentSceneState.end = markers.sceneEnd;
        saveMetadataDebounced();
        // PERFORMANCE: Full update needed when markers are validated/changed
        updateAllButtonStates();
    }
}

/**
 * Handle message deletion events
 */
export function handleMessageDeletion(deletedId, settings) {
    const markers = getSceneMarkers();
    let shouldClear = false;
    
    // If start marker was deleted, clear entire scene
    if (markers.sceneStart === deletedId) {
        shouldClear = true;
        console.log(`${MODULE_NAME}: Start marker deleted, clearing scene`);
    }
    
    // If end marker was deleted
    if (markers.sceneEnd === deletedId) {
        const chatLength = chat.length;
        
        if (deletedId === chatLength) {
            // Was the last message, fall back to new last message
            markers.sceneEnd = chatLength - 1;
            console.log(`${MODULE_NAME}: End marker was last message, falling back`);
        } else {
            // Was not the last message, clear scene
            shouldClear = true;
            console.log(`${MODULE_NAME}: End marker deleted (not last message), clearing scene`);
        }
    }
    
    if (shouldClear) {
        clearScene();
        
        if (settings?.moduleSettings?.showNotifications) {
            toastr.warning('Scene markers cleared due to message deletion', 'STMemoryBooks');
        }
    } else {
        // Validate remaining markers
        validateSceneMarkers();
    }
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
        console.error(`${MODULE_NAME}: Error estimating tokens:`, error);
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