import { chat, chat_metadata } from '../../../../script.js';
import { extension_settings } from '../../../extensions.js';
import { Popup, POPUP_TYPE } from '../../../popup.js';
import { METADATA_KEY, loadWorldInfo, saveWorldInfo, createWorldInfoEntry } from '../../../world-info.js';
import { DOMPurify } from '../../../../lib.js';
import { getEffectiveLorebookName } from './utils.js';
import { validateLorebook } from './index.js';
import { executeSlashCommands } from '../../../slash-commands.js';
import { bookmarksTemplate } from './templates.js';
import { morphdom } from '../../../../lib.js';

const MODULE_NAME = 'STMemoryBooks-BookmarkManager';
const BOOKMARK_ENTRY_NAME = 'STMB Bookmarks';
const MAX_BOOKMARKS = 75;

/**
 * Load bookmarks from the special lorebook entry
 */
export async function loadBookmarks() {
    try {
        // Use existing validateLorebook pattern from index.js
        const lorebookValidation = await validateLorebook();
        if (!lorebookValidation.valid) {
            return { success: false, error: lorebookValidation.error, bookmarks: [] };
        }

        // Find the bookmark entry - using the same pattern as STMB memory identification
        const entries = Object.values(lorebookValidation.data.entries || {});
        const bookmarkEntry = entries.find(entry => 
            entry?.comment === BOOKMARK_ENTRY_NAME
        );

        if (!bookmarkEntry) {
            return { success: true, bookmarks: [] };
        }

        // Parse bookmarks from entry content
        try {
            const bookmarks = JSON.parse(bookmarkEntry.content || '[]');
            return { success: true, bookmarks: Array.isArray(bookmarks) ? bookmarks : [] };
        } catch (parseError) {
            console.error(`${MODULE_NAME}: Invalid bookmark JSON:`, parseError);
            return { success: false, error: 'Bookmark data is corrupted (invalid JSON)', bookmarks: [] };
        }

    } catch (error) {
        console.error(`${MODULE_NAME}: Error loading bookmarks:`, error);
        return { success: false, error: error.message, bookmarks: [] };
    }
}

/**
 * Save bookmarks to the special lorebook entry
 */
export async function saveBookmarks(bookmarks) {
    try {
        // Use existing validateLorebook pattern
        const lorebookValidation = await validateLorebook();
        if (!lorebookValidation.valid) {
            throw new Error(lorebookValidation.error);
        }

        // Find existing bookmark entry - using the same pattern as STMB
        const entries = Object.values(lorebookValidation.data.entries || {});
        let bookmarkEntry = entries.find(entry => 
            entry?.comment === BOOKMARK_ENTRY_NAME
        );

        const bookmarkData = JSON.stringify(bookmarks);

        if (bookmarkEntry) {
            // Update existing entry
            bookmarkEntry.content = bookmarkData;
        } else {
            // Create new entry using STMB's proven method
            const newEntry = createWorldInfoEntry(lorebookValidation.name, lorebookValidation.data);
            if (!newEntry) {
                throw new Error('Failed to create new bookmark entry');
            }
            
            // Configure the entry for bookmarks
            newEntry.comment = BOOKMARK_ENTRY_NAME;
            newEntry.content = bookmarkData;
            newEntry.key = [];
            newEntry.keysecondary = [];
            newEntry.constant = false;
            newEntry.selective = false;
            newEntry.insertionOrder = 100;
            newEntry.enabled = false;
            newEntry.position = 0;
            newEntry.disable = true; // Disabled so it's not sent to AI
            newEntry.addMemo = false;
            newEntry.excludeRecursion = false;
            newEntry.delayUntilRecursion = false;
            newEntry.probability = 100;
            newEntry.useProbability = false;
        }

        await saveWorldInfo(lorebookValidation.name, lorebookValidation.data);
        return { success: true };

    } catch (error) {
        console.error(`${MODULE_NAME}: Error saving bookmarks:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Validate bookmark data structure
 */
export function validateBookmarks(bookmarks) {
    if (!Array.isArray(bookmarks)) {
        return { valid: false, error: 'Bookmarks must be an array' };
    }

    for (let i = 0; i < bookmarks.length; i++) {
        const bookmark = bookmarks[i];
        if (!bookmark || typeof bookmark !== 'object') {
            return { valid: false, error: `Bookmark at index ${i} is invalid` };
        }
        if (typeof bookmark.messageNum !== 'number' || bookmark.messageNum < 0) {
            return { valid: false, error: `Bookmark at index ${i} has invalid message number` };
        }
        if (typeof bookmark.title !== 'string' || !bookmark.title.trim()) {
            return { valid: false, error: `Bookmark at index ${i} has invalid title` };
        }
    }

    return { valid: true };
}

/**
 * Create a new bookmark
 */
export async function createBookmark(messageNum, title) {
    try {
        // Validate inputs
        if (typeof messageNum !== 'number' || messageNum < 0) {
            return { success: false, error: 'Invalid message number' };
        }
        
        if (!title || typeof title !== 'string' || !title.trim()) {
            return { success: false, error: 'Title is required' };
        }

        // Check if message exists
        if (messageNum >= chat.length) {
            return { success: false, error: 'Message number does not exist' };
        }

        if (chat.length === 0) {
            return { success: false, error: 'No messages available to bookmark' };
        }

        // Load existing bookmarks
        const loadResult = await loadBookmarks();
        if (!loadResult.success) {
            return { success: false, error: loadResult.error };
        }

        const bookmarks = loadResult.bookmarks;

        // Check bookmark limit
        if (bookmarks.length >= MAX_BOOKMARKS) {
            return { success: false, error: `Maximum ${MAX_BOOKMARKS} bookmarks reached. Please delete some bookmarks first.` };
        }

        // Create new bookmark
        const newBookmark = {
            messageNum: messageNum,
            title: title.trim()
        };

        bookmarks.push(newBookmark);
        
        // Sort by message number
        bookmarks.sort((a, b) => a.messageNum - b.messageNum);

        // Save bookmarks
        const saveResult = await saveBookmarks(bookmarks);
        if (!saveResult.success) {
            return { success: false, error: saveResult.error };
        }

        return { success: true, bookmark: newBookmark };

    } catch (error) {
        console.error(`${MODULE_NAME}: Error creating bookmark:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Update an existing bookmark
 */
export async function updateBookmark(originalMessageNum, originalTitle, newMessageNum, newTitle) {
    try {
        // Load existing bookmarks
        const loadResult = await loadBookmarks();
        if (!loadResult.success) {
            return { success: false, error: loadResult.error };
        }

        const bookmarks = loadResult.bookmarks;

        // Find the bookmark to update
        const bookmarkIndex = bookmarks.findIndex(b => 
            b.messageNum === originalMessageNum && b.title === originalTitle
        );

        if (bookmarkIndex === -1) {
            return { success: false, error: 'Bookmark not found' };
        }

        // Validate new values
        if (typeof newMessageNum !== 'number' || newMessageNum < 0) {
            return { success: false, error: 'Invalid message number' };
        }
        
        if (!newTitle || typeof newTitle !== 'string' || !newTitle.trim()) {
            return { success: false, error: 'Title is required' };
        }

        // Check if message exists
        if (newMessageNum >= chat.length) {
            return { success: false, error: 'Message number does not exist' };
        }

        // Update bookmark
        bookmarks[bookmarkIndex] = {
            messageNum: newMessageNum,
            title: newTitle.trim()
        };

        // Sort by message number
        bookmarks.sort((a, b) => a.messageNum - b.messageNum);

        // Save bookmarks
        const saveResult = await saveBookmarks(bookmarks);
        if (!saveResult.success) {
            return { success: false, error: saveResult.error };
        }

        return { success: true };

    } catch (error) {
        console.error(`${MODULE_NAME}: Error updating bookmark:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Delete a bookmark
 */
export async function deleteBookmark(messageNum, title) {
    try {
        // Load existing bookmarks
        const loadResult = await loadBookmarks();
        if (!loadResult.success) {
            return { success: false, error: loadResult.error };
        }

        const bookmarks = loadResult.bookmarks;

        // Find and remove the bookmark
        const bookmarkIndex = bookmarks.findIndex(b => 
            b.messageNum === messageNum && b.title === title
        );

        if (bookmarkIndex === -1) {
            return { success: false, error: 'Bookmark not found' };
        }

        bookmarks.splice(bookmarkIndex, 1);

        // Save bookmarks
        const saveResult = await saveBookmarks(bookmarks);
        if (!saveResult.success) {
            return { success: false, error: saveResult.error };
        }

        return { success: true };

    } catch (error) {
        console.error(`${MODULE_NAME}: Error deleting bookmark:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Shift bookmarks after a message is deleted
 */
export async function shiftBookmarksAfterDeletion(deletedMessageNum) {
    try {
        // Load existing bookmarks
        const loadResult = await loadBookmarks();
        if (!loadResult.success) {
            return { success: false, error: loadResult.error };
        }

        const bookmarks = loadResult.bookmarks;
        let shifted = false;

        // Shift bookmarks that point to deleted message or higher
        for (const bookmark of bookmarks) {
            if (bookmark.messageNum === deletedMessageNum) {
                // Move bookmark to previous message if possible
                if (bookmark.messageNum > 0) {
                    bookmark.messageNum--;
                    shifted = true;
                    toastr.warning(`Bookmark "${bookmark.messageNum + 1} - ${bookmark.title}" moved to message ${bookmark.messageNum} (deleted message)`, 'STMemoryBooks');
                } else {
                    // Can't move to negative, will need to be handled separately
                    toastr.warning(`Bookmark "${bookmark.title}" points to deleted message 0`, 'STMemoryBooks');
                }
            } else if (bookmark.messageNum > deletedMessageNum) {
                // Shift down by 1
                bookmark.messageNum--;
                shifted = true;
            }
        }

        if (shifted) {
            // Save updated bookmarks
            const saveResult = await saveBookmarks(bookmarks);
            if (!saveResult.success) {
                return { success: false, error: saveResult.error };
            }
        }

        return { success: true, shifted };

    } catch (error) {
        console.error(`${MODULE_NAME}: Error shifting bookmarks:`, error);
        return { success: false, error: error.message };
    }
}

// Current popup instance for bookmark management  
let currentBookmarkPopup = null;
let sortAscending = true;

/**
 * Show bookmarks management popup following showSettingsPopup pattern
 */
export async function showBookmarksPopup() {
    try {
        // Load bookmarks
        const loadResult = await loadBookmarks();
        if (!loadResult.success) {
            if (loadResult.error.includes('STMB Bookmarks')) {
                toastr.error('No bookmarks were found. Is there an entry titled "STMB Bookmarks" in the lorebook?', 'STMemoryBooks');
            } else {
                toastr.error(loadResult.error, 'STMemoryBooks');
            }
            return;
        }

        const bookmarks = loadResult.bookmarks;
        sortBookmarks(bookmarks, sortAscending);

        const templateData = {
            bookmarks: bookmarks,
            maxBookmarks: MAX_BOOKMARKS,
            sortAscending: sortAscending
        };

        const content = DOMPurify.sanitize(bookmarksTemplate(templateData));
        
        const customButtons = [
            {
                text: '🔄 Refresh',
                result: null,
                classes: ['menu_button'],
                action: () => {
                    refreshBookmarkPopup();
                }
            }
        ];
        
        const popupOptions = {
            wide: true,
            large: true,
            allowVerticalScrolling: true,
            customButtons: customButtons,
            cancelButton: 'Close',
            okButton: false,
            onClose: handleBookmarkPopupClose
        };
        
        currentBookmarkPopup = new Popup(content, POPUP_TYPE.TEXT, '📖 Bookmarks', popupOptions);
        setupBookmarkEventListeners();
        await currentBookmarkPopup.show();

    } catch (error) {
        console.error(`${MODULE_NAME}: Error showing bookmarks popup:`, error);
        toastr.error(`Failed to show bookmarks: ${error.message}`, 'STMemoryBooks');
    }
}

/**
 * Sort bookmarks by message number
 */
function sortBookmarks(bookmarks, ascending = true) {
    bookmarks.sort((a, b) => {
        return ascending ? a.messageNum - b.messageNum : b.messageNum - a.messageNum;
    });
}

/**
 * Setup event listeners for bookmark popup using full event delegation
 */
function setupBookmarkEventListeners() {
    if (!currentBookmarkPopup) return;
    
    const popupElement = currentBookmarkPopup.dlg;
    
    // Use full event delegation - handles all clicks on popup
    popupElement.addEventListener('click', (e) => {
        // Sort toggle
        if (e.target.matches('#stmb-sort-toggle')) {
            e.preventDefault();
            sortAscending = !sortAscending;
            refreshBookmarkPopup();
            return;
        }
        
        // Create bookmark
        if (e.target.matches('#stmb-create-bookmark') || e.target.closest('#stmb-create-bookmark')) {
            e.preventDefault();
            handleCreateBookmark();
            return;
        }
        
        // Edit bookmark
        if (e.target.classList.contains('edit-bookmark')) {
            e.stopPropagation();
            const index = parseInt(e.target.dataset.index);
            handleEditBookmark(index);
            return;
        }
        
        // Delete bookmark
        if (e.target.classList.contains('delete-bookmark')) {
            e.stopPropagation();
            const index = parseInt(e.target.dataset.index);
            handleDeleteBookmark(index);
            return;
        }
        
        // Handle bookmark content clicks (including child elements)
        const bookmarkContent = e.target.closest('.bookmark-content');
        if (bookmarkContent) {
            const messageNum = parseInt(bookmarkContent.dataset.message);
            handleGoToBookmark(messageNum);
        }
    });
}

/**
 * Refresh popup content while preserving popup properties - following refreshPopupContent pattern
 */
async function refreshBookmarkPopup() {
    if (!currentBookmarkPopup || !currentBookmarkPopup.dlg.hasAttribute('open')) {
        return;
    }
    
    try {
        const loadResult = await loadBookmarks();
        if (!loadResult.success) {
            toastr.error(loadResult.error, 'STMemoryBooks');
            return;
        }

        const bookmarks = loadResult.bookmarks;
        sortBookmarks(bookmarks, sortAscending);

        const templateData = {
            bookmarks: bookmarks,
            maxBookmarks: MAX_BOOKMARKS,
            sortAscending: sortAscending
        };
        
        const newHtml = DOMPurify.sanitize(bookmarksTemplate(templateData));

        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = newHtml;
        
        // Morph the existing popup content with the new content
        morphdom(currentBookmarkPopup.content, tempContainer, {
            onBeforeElUpdated: function(fromEl, toEl) {
                if (fromEl.isEqualNode(toEl)) {
                    return false;
                }
                return true;
            }
        });

        const requiredClasses = [
            'wide_dialogue_popup',
            'large_dialogue_popup',
            'vertical_scrolling_dialogue_popup'
        ];
        currentBookmarkPopup.dlg.classList.add(...requiredClasses);
        currentBookmarkPopup.content.style.overflowY = 'auto';
        
        console.log(`${MODULE_NAME}: Bookmark popup content refreshed`);
    } catch (error) {
        console.error(`${MODULE_NAME}: Error refreshing bookmark popup content:`, error);
    }
}

/**
 * Handle popup close - following handleSettingsPopupClose pattern
 */
function handleBookmarkPopupClose(popup) {
    currentBookmarkPopup = null;
    console.log(`${MODULE_NAME}: Bookmark popup closed`);
}

/**
 * Bookmark action handlers following STMB patterns
 */
async function handleCreateBookmark() {
    const loadResult = await loadBookmarks();
    if (!loadResult.success) {
        toastr.error(loadResult.error, 'STMemoryBooks');
        return;
    }

    if (loadResult.bookmarks.length >= MAX_BOOKMARKS) {
        toastr.error(`Maximum ${MAX_BOOKMARKS} bookmarks reached`, 'STMemoryBooks');
        return;
    }

    const messageNumStr = prompt('Enter message number:');
    if (!messageNumStr) return;

    const messageNum = parseInt(messageNumStr);
    if (isNaN(messageNum) || messageNum < 0) {
        toastr.error('Invalid message number', 'STMemoryBooks');
        return;
    }

    if (messageNum >= chat.length) {
        toastr.error('Message number does not exist', 'STMemoryBooks');
        return;
    }

    const title = prompt('Enter bookmark title:');
    if (!title || !title.trim()) {
        toastr.error('Title is required', 'STMemoryBooks');
        return;
    }

    const result = await createBookmark(messageNum, title.trim());
    if (result.success) {
        refreshBookmarkPopup();
        toastr.success('Bookmark created', 'STMemoryBooks');
    } else {
        toastr.error(result.error, 'STMemoryBooks');
    }
}

async function handleEditBookmark(index) {
    const loadResult = await loadBookmarks();
    if (!loadResult.success || !loadResult.bookmarks[index]) {
        toastr.error('Bookmark not found', 'STMemoryBooks');
        return;
    }

    const bookmark = loadResult.bookmarks[index];
    const newTitle = prompt('Enter new title:', bookmark.title);
    if (!newTitle || !newTitle.trim()) return;

    const newMessageNumStr = prompt('Enter new message number:', bookmark.messageNum.toString());
    const newMessageNum = parseInt(newMessageNumStr);
    
    if (isNaN(newMessageNum) || newMessageNum < 0) {
        toastr.error('Invalid message number', 'STMemoryBooks');
        return;
    }

    if (newMessageNum >= chat.length) {
        toastr.error('Message number does not exist', 'STMemoryBooks');
        return;
    }

    const result = await updateBookmark(bookmark.messageNum, bookmark.title, newMessageNum, newTitle.trim());
    if (result.success) {
        refreshBookmarkPopup();
        toastr.success('Bookmark updated', 'STMemoryBooks');
    } else {
        toastr.error(result.error, 'STMemoryBooks');
    }
}

async function handleDeleteBookmark(index) {
    const loadResult = await loadBookmarks();
    if (!loadResult.success || !loadResult.bookmarks[index]) {
        toastr.error('Bookmark not found', 'STMemoryBooks');
        return;
    }

    const bookmark = loadResult.bookmarks[index];
    if (confirm(`Delete bookmark "${bookmark.messageNum} - ${bookmark.title}"?`)) {
        const result = await deleteBookmark(bookmark.messageNum, bookmark.title);
        if (result.success) {
            refreshBookmarkPopup();
            toastr.success('Bookmark deleted', 'STMemoryBooks');
        } else {
            toastr.error(result.error, 'STMemoryBooks');
        }
    }
}

function handleGoToBookmark(messageNum) {
    if (messageNum >= chat.length) {
        toastr.error(`Bookmark points to deleted message ${messageNum}`, 'STMemoryBooks');
    } else {
        // Close the popup first
        if (currentBookmarkPopup) {
            currentBookmarkPopup.completeCancelled();
        }
        
        executeSlashCommands(`/chat-jump ${messageNum}`);
        toastr.info(`Jumped to message ${messageNum}`, 'STMemoryBooks');
    }
}