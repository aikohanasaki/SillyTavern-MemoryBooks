# 📕 Memory Books - Version History

**← [Back to README](readme.md)**

## v4.16.1 (January 11, 2026)
- Fix warning message for arc built in recreation
- Fix template name recreation
- Force raw response viewer after arc analysis failures

## v4.16.0 (January 10, 2026)
- **Enhancements**: 
  - Add raw JSON response viewer so bad JSON can be corrected manually.
- **Contributor PRs**:
  - bundle with BUN, add dirtyJSON parser
  - German/French localization tweaks
  - fix custom arc prompt recognition
  - JSON response control char strip
  - edit popup buttons

## v4.15.0 (January 9, 2026)
- Add `/stmb-highest` to output highest memory processed.

## v4.14.4 (January 6, 2026)
- Add missing translations for arcs

## v4.14.3 (January 4, 2026)
- **Bugfix:** Replace || with ?? where necessary
- **Tweak:** Remove unused imports

## v4.14.2 (January 4, 2026)
- **Bugfix:** Fix popup buttons not wrapping.
- **Tweaks:**
  - Prompt Manager buttons broken out into their own section.
  - Renamed "Side Prompts" to "Trackers & Side Prompts"

## v4.14.1 (January 3, 2026)
- **Bugfix:** Fix not passing max_tokens for arc requests.

## v4.14.0 (January 2, 2026)
- **Enhancement:** Arcs now in international beta (localized into all STMB languages).

## v4.13.7 (December 21, 2025)
- Fix "no new arcs" error

## v4.13.6 (December 19, 2025)
- Readme, user guide, howSTMBworks documents all translated to French and German.

## v4.13.5 (December 17, 2025)
- Readme translations updated
- GPT-5 models now use `max_completion_tokens`
- German and French translations added (I'm sorry it took so long)

## v4.13.4 (December 15, 2025)
- **Tweaks:** 
  - Readme changes for FAQ
  - Made various default settings changes (no effect on existing users, should affect new installs only)

## v4.13.3 (December 4, 2025)
- **Tweak:** Popup buttom resize

## v4.13.2 (December 3, 2025)
- **Bugfix:** Write exception for Deepseek connection URL.

## v4.13.1 (November 29, 2025)
- **Bugfix:** Change WI positions based on new position numbers in ST v1.14.0.

## v4.13.0 (November 22, 2025)
- **Enhancement:** Add new "comprehensive" summary preset.

## v4.12.2 (November 10, 2025)
- **Bugfix:** Fix copy raw button on "Review Failed AI Response Popup".

## v4.12.1 (November 8, 2025)
- **Tweak:** 
  - Switched default for "preventRecursion" to `false`
  - Switched default for "delayuntilRecursion" to `true`
- **Enhancements:** 
  - added stmb-toggle.html to resources for manually converting lorebooks to follow these defaults
  - added conversion checkbox to profiles

## v4.12.0 (October 31, 2025)
- **Enhancements:** 
  - Add `/sideprompt-on` and `/sideprompt-off` for side prompts
  - Add outlet position to lorebook entry settings.

## v4.11.0 (October 29, 2025)
- **Enhancement:** Add generation delay for auto-summaries.

## v4.10.0 (October 21, 2025)
- **Enhancement:** Error raw code popup window allows clearer insight on AI memory failure.

## v4.9.0 (October 21, 2025)
- **Enhancement:** Aggressive JSON parse recovery 
  - clearer errors (recoverable vs unrecoverable)
  - mitigate and build in better attempts to internally fix trivial formatting errors eg fences, comments, trailing commas
  - identify refusals and cut-off/incomplete responses clearly
  - add Google AI Studio envelope unwrapper
- **Tweak:** Rewrote message deletion handling.

## v4.8.2 (October 20, 2025)
- **Tweak:** Remove minimum token requirement completely. The attempt at resolving cut-off responses has completely backfired... :P Oops.

## v4.8.1 (October 20, 2025)
- **Bugfix:** Regex disables with checkbox now.

## v4.8.0 (October 20, 2025)
- **Enhancement/rewrite ⚠️*BREAKING CHANGE*:** Regex rework (multi-select).

## v4.7.1 (October 19, 2025)
- **Bugfix:** Remove math calculating context to take away "available context is zero" problems. Too many APIs, too many ways to declare max tokens.

## v4.7.0 (October 19, 2025)
- **Regex:** Added regex functions (uses existing regex extension)

## v4.6.12 (October 19, 2025)
- **Internationalization:** Finished translating remaining UI text

## v4.6.11 (October 19, 2025)
- **Bugfix:** oai_settings.max_tokens reads better

## v4.6.10 (October 19, 2025)
- **Localized Prompts:** 
  - The English prompts have been localized to return memories in YOUR language.
  - Language locale is determined via your ST general language settings.
  - **New users:** No action required, STMB detects your language and does it automatically.
  - **Existing users:** to switch to localized built-in prompts, delete `SillyTavern/data/(yourusername)/user/files/stmb-summary-prompts.json` and then reopen the Summary Prompt Manager. It will re-create with localized built-in prompts. **Note:** Save a backup first if you made any changes!

## v4.6.9 (October 16, 2025)
- **Tweak:** change PromptManager to SummaryPromptManager to avoid confusion w ST base prompt manager

## v4.6.8 (October 16, 2025)
- **Enhancement:** Add previews to side prompts
- **Bugfix:** Interval checkbox fixed

## v4.6.7 (October 16, 2025)
- **Housekeeping:** Doc rewrite, reorganizing files
  - reorganized resources into a `/resources` folder
  - rewrote documentation for clarity
  - reran translations
- **Internationalization:** Added Korean, Malay, Indonesian
- **Bugfix:** Localisation broke auto-create (SORRY)--fixed

## v4.6.6 (October 15, 2025)
- **Internationalization:** Added Japanese, Russian, Spanish
- **Bugfix:** Fix bad-end on "finish-reason: stop"

## v4.6.5 (October 15, 2025)
- **Internationalization:** Added simplified/traditional Chinese

## v4.6.4 (October 14, 2025)
- **Bugfix:** Chevron broke, fixed

## v4.6.3 (October 14, 2025)
- **Side Prompts Import is Now Additive:** Importing merges side prompts into your current set instead of replacing them. Existing prompts are preserved and only new prompts are added. If an imported prompt’s key conflicts with an existing one, the imported prompt is renamed using its display name (with a numeric suffix if needed).
- **Import UI Feedback Improved:** The import dialog now displays how many prompts were added and how many were renamed due to key conflicts.
- **Manual /sideprompt Name Lookup Greatly Improved:** The `/sideprompt` command now matches side prompts by key, display name, or slug (hyphen/underscore/space-insensitive, case-insensitive). For example, `/sideprompt cast-of-characters`, `/sideprompt cast`, and `/sideprompt "Cast of Characters"` will all run the same prompt if it exists.
- **Bugfix:** Resolves issues where built-in prompts could not be run by slug or key, or where imports previously overwrote existing side prompts.
- **Feature:** Side Prompts now support including previous memories for context (up to 7, matching main memory popup).
  - Added per-template "Previous memories for context" option to Side Prompt editor and new prompt dialog.
  - When set, up to 7 previous memories are fetched from the active lorebook and included in the side prompt input (in the same block format as main memory context).
  - Cap enforced in both UI and runtime.
  - Fully backward compatible; existing prompts default to 0.

## v4.6.2 (October 14, 2025)
- **Side Prompts Bugfix:** Swapped EM/AN

## v4.6.1 (October 13, 2025)
- **Better Errors:** Added "increase max tokens" hints for truncated JSON.

## v4.6.0 (October 13, 2025)
- **Side Prompts Enhancements:** Major improvements to the Side Prompts system
  - **Template System:** Added comprehensive template library for side prompts with pre-built, reusable prompt snippets
  - **Template Management:** Enhanced side prompts manager with improved template handling and organization
  - **Bug Fixes:** Fixed issue with dropping prompts that lack names, improving reliability of prompt management
  - **Stabilization Work:** Multiple rounds of stabilization improvements to the Side Prompts feature
  - **User Experience:** Improved template selection and management workflow for better usability
- **Code Quality:** Enhanced error handling and validation in side prompts functionality
- **Feature Maturation:** Side Prompts feature moved from alpha status toward production readiness

## v4.5.1 (October 12, 2025)
- **Unicode & Title Handling Overhaul:**
  - Title and entry sanitization now matches SillyTavern’s behavior. Only Unicode control characters are stripped; all printable Unicode (including emoji, CJK, etc.) is allowed.
  - **Consistent Template Substitution:** Title generation and preview support all common numbering tokens, with template logic and extraction fully aligned.
- **Documentation & Policy Alignment:**
  - **charset.md:** Updated documentation to reflect the new permissive sanitization policy, with examples and migration notes. Fixed malformed emoji headings.
- **Code Quality & Review:**
  - Reviewed and cleaned up all uncommitted changes.
  - Removed an outdated “invalid characters” comment in addlore.js.
  - Confirmed no runtime TODOs remain (only in .git sample hook).
- **Side Prompt & Lorebook Stability:**
  - Side prompt UI and connection logic reviewed for parameter handling, concurrency limits, and error reporting.
- **Readiness:** All changes vetted and ready for release.

## v4.5.0 (October 11, 2025)
- **Internationalization Work:** i18n tagging proceeding.
- **Cleanup:** Removed unused functions.

## v4.4.2 (October 11, 2025)
- **Add maximize buttons:** added to prompt editors.

## v4.4.1 (October 11, 2025)
- **Summarize Prompt Fix:** fixed prompt missing bullet-point instructions.

## v4.4.0 (October 2025)
- **New Feature: Side Prompts (ALPHA, UNDER DEVELOPMENT)**
  - Define reusable, supplemental prompt snippets that augment memory/summary generation without modifying global presets
  - Per‑context overrides: enable/disable and customize prompts for the current chat/context while keeping global defaults intact
  - New Side Prompts popup with quick toggles, inline editing, and clear visibility of active prompts
  - Side Prompts Manager for organizing prompts (create, duplicate, rename, delete, import/export)
  - Fully integrated into the generation pipeline; behavior remains unchanged unless Side Prompts are explicitly enabled

- **Enhancements / Refactors:**
  - Consolidated LLM generation code paths for maintainability and reduced duplication (utils.js, stmemory.js)
  - Dynamic Profile handling refactor (profile lookup/location and related flows)
  - Functional enhancement: Auto‑unhide during scene compilation — when creating a scene, the extension issues “/unhide x‑y” so previously hidden messages are included and can be recompiled

- **Bug Fixes:** 
  - Fixed `current_st` locking issue in profile management
  - Re‑implemented `/scenememory` handling to restore expected range‑based memory creation

## v4.3.2 (October 2025)
- **Bug Fixes:** 
  - introduced new bug to /scenememory that I had to fix

## v4.3.1 (October 2025)
- **Bug Fixes:** 
  - fix custom prompt manager not reading from stmb-summary-prompts.json
  - trying to fix scene memory AGAIN.

## v4.3.0 (October 2025)
- **Feature:** Added "Summary Prompt Manager" — a UI and backend system to create, edit, duplicate, delete, import, and export summary prompt presets. Presets control summary generation and can be assigned per profile.
    - Access via settings (“🧩 Summary Prompt Manager” button).
    - Presets are editable, exportable/importable as JSON, and can be applied to profiles.
- **Enhancement:** Improved “Dynamic Profile” and migration logic for backward compatibility.
- **Fix:** Resolved race condition in scene memory creation.
- **Other:** Minor logic tweaks and UI polish.

## v4.2.5 (October 2025)
- Fix: Eliminated “EventEmitter: Cannot listen to undefined event” by removing the nonexistent `CHAT_LOADED` subscription and consolidating initialization into `CHAT_CHANGED` and `init()`.
- Cleanup: Removed legacy API compatibility gating (`checkApiCompatibility`, `isExtensionEnabled`, and API change listener). The extension is now always active and profile-driven.
- Cleanup: Removed dead code (`handleChatLoaded`) and related wiring.

## v4.2.4 (September 2025)
- **Tweak:** Add back isMemoryProcessing flag to prevent double-memory in auto-create situations.
- **Tweaked prompts:** Slightly tweaked included prompts for better summaries.

## v4.2.3 (September 2025)
- **Bug Fixes:**
  - Fixed profile edit dialog not displaying the correct API/Provider selection
  - Google AI Studio (makersuite) now correctly shows as selected when editing saved profiles

## v4.2.2 (September 2025)
- **Bug Fixes:**
  - Fixed critical auto-hide bug where memories wouldn't save if scene range metadata was invalid
  - Fixed manual lorebook mode not showing selection popup when enabled
- **Code Quality Improvements:**
  - Removed excessive DEBUG logging (~35 console.log statements per memory creation)
  - Simplified null checking patterns for better readability
  - Added warning when token estimation falls back to simple char/4 calculation
  - Removed unused variables and dead code

## v4.2.1 (September 2025)
- **Skip Dry Run:** Skips lorebook checking on dry run (loading chat for token counting).

## v4.2.0 (September 2025)
- **Auto-Create Lorebook Feature:** Intelligent automatic lorebook creation and binding when none exists
  - New checkbox in settings: "Auto-create lorebook if none exists"
  - Bidirectional mutual exclusion with manual lorebook mode (only one can be active)
  - Seamless integration with existing chat binding and auto-summary workflows
  - Works in both automatic and manual mode configurations
- **Customizable Lorebook Naming:** Flexible template system for auto-created lorebook names
  - User-configurable naming template with default: "LTM - {{char}} - {{chat}}"
  - Support for dynamic placeholders: {{char}}, {{user}}, {{chat}}
  - Intelligent auto-numbering for duplicate names (2, 3, 4... up to 999, then timestamp fallback)
  - Template input automatically disabled when auto-create is unchecked
- **Unicode-Friendly Filesystem Support:** Enhanced international character support
  - Improved sanitization allowing Chinese, Japanese, Cyrillic, emoji, and all Unicode characters
  - Only blocks filesystem-reserved characters: `\/\\:*?"<>|`
  - Proper length limits (60 chars) with space reservation for auto-numbering suffixes
  - Fallback to default template if user clears the naming template completely
- **Code Modularization:** Significant architectural improvements for maintainability
  - **autocreate.js** (66 lines): Isolated auto-creation logic with `generateLorebookName()` and `autoCreateLorebook()`
  - **autosummary.js** (256 lines): Complete auto-summary system extracted from main module
  - Reduced index.js complexity by ~300 lines while maintaining full functionality
  - Clean ES6 module pattern with proper import/export dependencies
  - Dynamic imports used strategically to avoid circular dependencies
- **Enhanced Auto-Summary Integration:** Seamless auto-create integration with auto-summary workflow
  - Auto-summary now automatically creates lorebooks when needed using the naming template
  - Improved lorebook validation with user-friendly popup prompts
  - Postpone functionality enhanced with auto-create awareness
  - Better error handling and fallback mechanisms throughout the process
- **Robust Error Handling:** Comprehensive edge case management and validation
  - Null safety checks for world_names array and undefined states
  - Graceful handling of empty templates with fallback to defaults
  - Enhanced collision detection algorithm with proper bounds checking
  - Improved async/await chain consistency across all new modules
- **Developer Experience:** Better debugging and maintenance capabilities
  - Modular architecture enables easier testing and feature development
  - Clear separation of concerns between auto-creation and auto-summary
  - Comprehensive logging throughout auto-creation and naming processes
  - Clean removal of duplicate code and legacy validation functions

## v4.1.0 (September 2025)
- **Enhanced AI Compatibility:** Added support for Claude's new structured response format
  - Memory generation now handles both legacy text responses and modern structured content arrays
  - Backward compatible with all existing AI providers and response formats

## v4.0.3 (September 2025)
- **Critical Bug Fix:** Resolved auto-summary failure in group chats
  - Fixed early return in auto-hide validation that prevented `updateHighestMemoryProcessed()` from being called
  - Auto-summary now properly tracks processed messages in group chats and triggers correctly
  - Memory status display now updates correctly after memory creation in group chats
- **Auto-Hide Logic Improvements:** Enhanced mathematical correctness and edge case handling
  - Fixed 'last' mode formula to properly hide from scene start while preserving last X messages
  - Fixed 'all' mode logic to correctly handle post-memory message calculations
  - Added comprehensive bounds checking to prevent invalid hide commands referencing non-existent messages
  - Enhanced validation for scene ranges with negative indices and malformed data
- **Code Quality Enhancements:** Major refactoring for maintainability and reliability
  - Extracted `parseSceneRange()` and `executeHideCommand()` helper functions to eliminate code duplication
  - Reduced auto-hide logic from 120+ lines to ~50 lines while maintaining full functionality
  - Consolidated debug logging from 25+ statements to strategic essential logs
  - Improved error handling and edge case management throughout auto-hide system
- **GROUP_WRAPPER_FINISHED Integration:** Enhanced group chat auto-summary timing
  - Auto-summary now correctly waits for all group members to finish speaking before triggering
  - Prevents premature auto-summary execution during ongoing group conversations

## v4.0.2 (September 2025)
- **Claude API Compatibility Fix:** Added proper `max_tokens` parameter support for Claude connections
  - Memory generation requests now include `max_tokens` from SillyTavern's OpenAI settings
  - Fallback to no `max_tokens` parameter when not configured for backward compatibility
  - Resolves Claude API errors requiring the `max_tokens` parameter for completion requests

## v4.0.1 (September 2025)
- **Critical Bug Fix:** Resolved zombie scene markers issue in auto-summary functionality
  - Fixed destructive initialization that overwrote `highestMemoryProcessed` values
  - Auto-summary now correctly recognizes previously created memories and doesn't reset to beginning
  - Prevents scene markers from reappearing after being cleared
- **Range Validation Logic Fixes:** Corrected off-by-one errors in memory range validation
  - Fixed `>=` vs `>` comparisons to properly allow single-message memories (start = end is valid)
- **Metadata Persistence Improvements:** Enhanced data integrity across all operations
  - Eliminated all destructive object initialization patterns
- **Code Quality:** Comprehensive defensive programming implementation
  - Replaced destructive `{sceneStart: null, sceneEnd: null, ...}` patterns with safe `{}` initialization

## v4.0.0 (September 2025)
- **BREAKING CHANGE:** Complete removal of bookmark functionality
  - Deleted `bookmarkManager.js` module (793 lines) containing all bookmark-related features
  - Removed bookmark UI components, navigation, and storage systems
  - Eliminated bookmark templates and associated CSS styling (1,069 total lines removed)
  - **Migration Note**: Users relying on bookmark features should backup their data before upgrading
  - **Rationale**: Bookmark functionality has been split into a separate extension for better modularity
- **Codebase Simplification:** Significant reduction in complexity and maintenance overhead
  - Streamlined core functionality to focus on memory book creation and management
  - Reduced bundle size and improved loading performance
  - Cleaner separation of concerns between memory management and navigation features

## v3.7.3 (September 2025)
- **UI Standardization:** Major CSS consolidation for better SillyTavern integration
  - Replaced custom `.stmb-menu-button` classes with standard SillyTavern `.menu_button` classes
  - Updated all button styling to use native SillyTavern design system
  - Improved bookmark button visual consistency and positioning across all UI components
  - Standardized flex container layouts using SillyTavern's `.flex-container` and `.marginTop5` classes
- **Template Enhancement:** Added user-contributed preset templates
  - **Northgate Template**: Literary-style summaries with narrative prose for creative writing
  - **Aelemar Template**: Focuses on plot points and character memories with comprehensive 300+ word summaries
  - Improved template descriptions and display names for better user understanding
  - Updated existing template prompts for better timeline handling and content structure
- **Code Quality:** Enhanced template rendering and CSS maintainability
  - Removed redundant CSS rules in favor of SillyTavern's built-in styling
  - Better separation between custom styling and framework integration
  - Improved button accessibility and interaction consistency

## v3.7.2 (September 2025)
- **Enhancement:** Improved AI response parsing with think tag removal
  - AI responses containing `<think>` tags are now automatically cleaned during JSON parsing
  - Removes `<think>...</think>` blocks and their content from memory generation responses
  - Ensures cleaner, more focused memory entries without AI reasoning artifacts
  - Implementation in `parseAIJsonResponse()` function in stmemory.js:240

## v3.7.1 (September 2025)
- **Bug Fix:** Fixed manual lorebook display issue where Mode and Active Lorebook would not display correctly after changing manual lorebook selection
  - Resolved template data synchronization issue in `refreshPopupContent()` function
  - Mode and Active Lorebook information now properly updates after manual lorebook selection
  - Ensures consistent UI display when switching between different manual lorebooks

## v3.7.0 (September 2025)
- **Enhanced Manual/Chat Lorebook Controls:** Complete UI overhaul for lorebook management
  - New lorebook status display with mode badges and active lorebook information
  - Improved manual mode setup flow with automatic lorebook selection prompts
  - Visual indicators for chat-bound vs manual lorebook configurations
  - One-click lorebook selection and clearing for manual mode
  - Contextual help text and status messages throughout the interface
  - Automatic UI refresh after lorebook selection or mode changes
  - Better visual feedback for manual vs automatic mode operation

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
