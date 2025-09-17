# 📕 Memory Books - Version History

**← [Back to README](readme.md)**

## v3.6.3 (September 2025)
- **Memory Preview Feature:** Added comprehensive memory preview system allowing users to review and edit memories before adding to lorebook
  - Preview popup shows generated memory with editable title, content, and keywords
  - "Edit & Save", "Accept & Add", "Retry Generation", and "Cancel" options
  - Preserves all original memory metadata while allowing user modifications
  - Includes scene information display for context
- **Robust Error Handling:** Complete overhaul of error handling throughout the extension
  - Added comprehensive input validation for all popup functions
  - Null-safe DOM element access with proper cleanup
  - Improved array handling for keywords with type checking
  - Retry logic with infinite loop prevention (max 3 user retries)
  - Consistent error logging with console.error() for debugging
- **UI/UX Improvements:** Major notification system consolidation
  - Reduced ~7 intermediate toast notifications down to 2 (start + success)
  - Single working toast with context-aware messaging
  - Removed notification spam during memory generation
  - Cleaner, less intrusive user experience
- **Template Safety:** Enhanced template rendering with defensive programming
  - Handlebars templates now use null-safe conditionals
  - Default fallback values for all template variables
  - Proper HTML escaping and sanitization
- **Code Quality:** Extensive code review and cleanup
  - Fixed potential race conditions in popup handling
  - Improved data validation and type checking
  - Better separation of concerns in error handling
  - Enhanced debugging capabilities with detailed logging

## v3.6.2 (September 2025)
- **Memory Processing Tracking:** Added "highest memory processed" field to track progress per chat
  - Each chat now displays "Memory Status: Processed up to message #X" in settings
  - Shows "No memories processed yet" for new chats
  - Enables better management of aggregate lorebooks across multiple chats
  - Backwards compatible - existing chats automatically get the new field
- **Bug Fixes:** Fixed highest memory processing logic for better reliability
- **Auto-Summary Improvements:** Auto-summary now properly activates for first memory in chat

## v3.6.1 (September 2025)
- **Bug Fixes:** Various stability improvements and fixes
- **Code Refinements:** Minor code improvements and optimizations

## v3.6.0 (September 2025)
- **Dynamic Profile System:** Added dynamic profile functionality that uses current SillyTavern settings
- **Completion Sources:** Updated completion source handling and configuration
- **Auto-Summary Enhancements:** Added postpone functionality for auto-summary feature
- **Documentation:** Updated changelog and README with latest changes

## v3.5.3 (September 2025)
- **Auto-Summary Feature:** Automatically create memory summaries at specified intervals
  - Set a message interval (10-200 messages) to trigger automatic `/nextmemory` execution
  - Configurable in settings with enable/disable toggle
  - Helps maintain continuous memory creation without manual intervention
  - Default interval: 100 messages after the last memory
  - Postpone auto-summary functionality
- **UI Improvements:** Changed extension menu text from "Create Memory" to "Memory Books"
- **Code Cleanup:** Various formatting fixes and optimizations

## v3.5.2 (September 2025)
- **Manual Direct API Calling:** Draft implementation for enhanced API handling
- **Stability Improvements:** Various tweaks and cleanup

## v3.5.x Series (August-September 2025)
- **Chat Bookmarks:** Set up to 75 bookmarks per chat
  - The memory lorebook is also used to save the bookmarks
  - "STMB Bookmarks" entry is invisible and is NOT sent to the LLM
  - If "STMB Bookmarks" is deleted all bookmarks for that chat will disappear
  - Implemented background loading of large chats (more than 1000 messages)
- **Auto-Hide Function:** Added functionality to automatically hide memory entries
- **UI Enhancements:** Multiple rounds of UI tweaks and improvements
- **Popup Refresh Issues:** Fixed bugs related to popup refreshing

## v3.4.x Series (2025)
- **`/nextmemory` Command:** Added slash command to create memories with all messages since the last memory
- **Manual Lorebook Mode:** Enable to select lorebooks per chat, ignoring main chat-bound lorebook
- **Scene Overlap Prevention:** Added option to permit or prevent overlapping memory ranges
- **Custom Prompt Improvements:** Better handling of custom prompt text
- **Group Chat Enhancements:** Various fixes and improvements for group chat functionality

## v3.3.x Series (2025)
- **Profile Management System:** Advanced profile creation and management
  - Import/Export profiles as JSON
  - Per-profile API, model, temperature, prompt/preset settings
  - Profile-specific title formats and lorebook settings
- **Enhanced DOM Handling:** Fixed various DOM-related issues for group chats
- **Metadata Improvements:** Better handling of chat and group metadata

## v3.2.x Series (2025)
- **Title Formatting System:** Comprehensive title customization
  - Placeholders for title, scene, character, user, messages, profile, date, time
  - Auto-numbering with multiple formats: `[0]`, `(0)`, `{0}`, `#0`
  - Custom format validation and character filtering
- **Recursion Control:** Added delay recursion options for better memory management
- **API Stability:** Major improvements to API handling and error recovery

## v3.1.x Series (2025)
- **Group Chat Support:** Full implementation of group chat functionality
  - Scene markers, memory creation, and lorebook integration for groups
  - Group metadata storage and management
  - Specialized group chat DOM handling
- **Scene Memory Command:** Added `/scenememory x-y` command for creating memories from specific message ranges
- **Token Estimation:** Enhanced token counting for better memory size management

## v3.0.x Series (2025)
- **JSON-Based Architecture:** Complete rewrite to JSON-based memory system
- **Lorebook Integration:** Flag-based detection using `stmemorybooks` flag
- **Sequential Numbering:** Auto-numbering system with zero-padding
- **Context Memories:** Include up to 7 previous memories as context
- **Visual Feedback System:** Complete button state system (inactive, active, valid selection, in-scene, processing)
- **Accessibility Features:** Keyboard navigation, focus indicators, ARIA attributes, reduced motion support

## v2.x Series (Early 2025)
- **Migration System:** Automated migration from v1.x to v2.x architecture
- **Profile System Foundation:** Initial implementation of profile management
- **Settings Validation:** Comprehensive settings validation and default handling
- **Error Recovery:** Enhanced error handling and recovery mechanisms

## v1.x Series (2024)
- **Initial Release:** Basic memory creation functionality
- **Scene Selection:** Start and end message marker system
- **Basic Lorebook Integration:** Simple lorebook entry creation
- **SillyTavern Integration:** Core extension framework implementation

---

## Development Notes

### Key Architectural Changes
- **v3.0+:** Complete JSON-based rewrite for reliability and structure
- **v2.0+:** Introduction of profile system and advanced configuration
- **v1.0:** Initial proof-of-concept and basic functionality

### Compatibility Notes
- **SillyTavern 1.13.1+** required for all v3.x versions
- **API Support:** OpenAI, Claude, Anthropic, OpenRouter, and other chat completion APIs
- **Not Supported:** Text generation APIs (Kobold, TextGen, etc.)

### Migration Tools
- [Lorebook Converter](lorebookconverter.html) available for upgrading from older versions
- Automatic settings migration between major versions

---

**← [Back to README](readme.md)**

---

*This version history is maintained alongside the main development. For the most up-to-date features, see the main [README](readme.md).*