# Changelog

## v0.1.0 - 2025-10-06



### Other Changes
- tweaks
- summary prompt manager add
- summary prompt manager add
- scenememory race fix
- add prompt manager
- bugfix stability
- added info to readme about vectoring
- added info to readme about vectoring
- added info to readme about vectoring
- remove debounce on metadata save for scene setting for memory
- improve summary prompts
- add back procsesing flag
- move i18n to branch
- readme add screenshot
- adding i18n
- fix google/makersuite completionsource mixup
- doc update
- bugfixes
- fix manual bug
- dry run removal
- fix /NaN bug again
- added auto-create books
- /hide NaN fix
- add claude new structured array response
- add claude new structured array response
- missing brace
- fixed auto-hide issues
- fixed auto-hide issues
- rework autosummary workflow
- fixing memry context in group chats
- turn off talky debug
- fixing chevrons
- fixing chevrons
- include_reasining set to false
- fix highest memory
- claude max_tokens fix
- fix highest memory tracking bug
- fix highest memory tracking bug
- version update
- cleanup
- Merge branch 'main' of https://github.com/aikohanasaki/SillyTavern-MemoryBooks
- css cleanup
- Create LICENSE
- add think removal
- add think removal
- fix bookmark button CSS
- CSS fix
- add text desc
- manual lorebook selection toggle and designation
- manual/chat lorebook controls
- fix missing lorebook no prompt
- add maximize button for editors
- add maximize button for editors
- streamlining
- streamlining
- added preview feature
- add preview
- highest memory fix
- highest memory fix
- highest memory fix
- auto-summary should turn on for first memory
- streamline and CSS standardize
- added dynamic profile (uses current ST settings)
- added dynamic profile (uses current ST settings)
- added dynamic profile (uses current ST settings)
- added dynamic profile (uses current ST settings)
- update completion sources
- add postpone auto-summary
- add changelog to readme
- added auto-summary
- cleanup
- formatting fix
- tweak
- draft full manual direct API calling
- re-push date/title tweak fix
- UI tweaks
- UI tweaks
- UI tweaks
- tweaks
- add indicators
- tweaking more
- tweaks
- added bookmarks
- default custom prompt text
- auto-hide function added
- added /nextmemory command
- standardize checkbox handling
- manual lorebook fix
- group chat fix
- fix group chat
- fix group chat
- Debug: Add logging to scene markers for group chat troubleshooting
- readme update with recommended settings
- readme update
- better char data polling
- group chat DOM fixes
- rollback raw review debug
- fix overlap persistence
- fix dropdown selection
- add raw return examination
- bugfix
- major refactor
- properly uncheck delay recursion by default
- switch google/makersuite
- change UI labelling
- google sb makersuite
- bugfix
- cleanup
- update readme
- marker persistence at reload
- fix raw generate
- fix raw generate
- readme and version
- raw generate request
- fix parser
- fix scene overlap save
- bugfix
- fix token count
- validation fix
- bugfix
- remove circular import
- metadata key
- compiled scenes
- regex fix
- fix group /scenememory
- fix temperature setting
- uncheck delayuntilrecursion default
- specify no user/char names in keywords
- update readme
- bugfix
- bugfix
- bugfix
- bugfix
- bugfix
- bugfix
- bugfix
- add override for overlap check
- add manual mode for lorebooks
- fix scenememory for group chats
- Update readme.md
- group chat supported
- working group chat, cleanup
- bank working memory in group chats
- halfway commit
- better API handling
- better API handling
- restore main API fix for stability
- restore main API fix for stability
- missed import
- missed import
- fix typo in overlap warning
- scrolling
- scrolling
- remove 'summary' from prompt saved
- fix prompt selection logic
- force version increment
- fix specific display bug
- changed default to custom
- relabel buttons
- force version increment
- fix state leak
- rewrite restore logic
- update readme
- update readme
- update readme
- update readme
- profile bugfix
- layout tweaks
- minor layout tweaks
- customizable memory settings
- change default handling
- chained bug catch fix
- oops
- QOL improvements
- fix freeze on delete
- fix profile bugs
- fix title format not respected
- fix disappearing custom title format
- fix missing import
- fix date numbering
- increment to force update
- fix restore settings
- update readme
- add toggle to converter
- remove bug note
- fix connection profile bug
- bug note
- change placeholder text
- name and version change
- fix string vs array arg
- fix menu item
- fix
- fix
- title format
- curly braces!
- fix custom format
- change number of keywords
- update readme
- converter
- add converter
- cleanup
- remove converter
- nothing
- readme
- readme
- readme
- readme
- move images to outside repo
- screenshot fixes
- fix minimal description
- fix scan depth
- fix bad import
- fix bugs
- add overlap checking
- fix races
- major cleanup
- force lorebook conversion
- fix refreshpopup
- fix slash commands
- fix slash commands
- fix refreshpopup
- fix duplicate declare
- performance fix
- refactor connection profiles
- lore detection
- position fix
- fresh
- refactor for structured output
- remove race
- forgot import
- monkey patch tool
- fix promise
- switch to promise again
- intervene in tool call
- refactor with generate
- revert to skipWIAN only
- change approach to blank directly
- fix crashes
- typo
- typo
- forgot import
- another refactor
- debug
- rework with getContext
- fix tool race condition
- somewhat major refactor (keywords)
- fix race conditions
- fix manipulation crash
- more fixes
- fix scroll
- fix scroll
- fixes
- fixes
- fix import location
- refactor tool prompt
- finally fixed scrolling
- clean tool calling
- fix tool function
- fix profile popup
- some cleanup
- fix race condition
- refactor tools
- bug fixes
- fixes
- fixes
- switch to tool
- scene marker fixes
- spacing fix
- spacing fix
- forgot exports
- forgot exports
- style refactor
- refactor to call API directly
- rollback wrappers again
- fix popups
- remove popup wrapper
- rewrite profile edit
- lots of usability fixes
- more fixes
- button fixes
- slash parse error
- chevrons and user chats
- added guard init
- fix slash command register
- fix import
- fix import
- fix location
- fix imports
- major refactoring
- CSS refactor
- more refactoring
- refactoring code
- charset coding fix
- update for testing
- update for testing
- ready for testing
- context awareness
- testing commit
- first finish draft

# ðŸ“• Memory Books - Version History

**â† [Back to README](readme.md)**

## v4.2.5 (October 2025)
- Fix: Eliminated â€œEventEmitter: Cannot listen to undefined eventâ€ by removing the nonexistent `CHAT_LOADED` subscription and consolidating initialization into `CHAT_CHANGED` and `init()`.
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
- **Session Management & Cleanup:** Robust handling of orphaned scene markers
  - Automatic detection and cleanup of stale scene markers from previous sessions
  - Prevents interference with auto-summary and memory creation processes
  - Clear logging and user notifications when cleanup occurs
  - Scene marker validation on chat load to ensure clean state
- **Auto-Summary System Improvements:** Enhanced reliability and debugging capabilities
  - Improved trigger logic that works correctly regardless of message count parity
  - Enhanced logging throughout the auto-summary process for better troubleshooting
  - Added `window.STMemoryBooks_debugAutoSummary()` developer function for manual debugging
  - Better handling of postponed auto-summary states and cleanup
  - Improved lorebook validation with user-friendly selection popups when lorebooks are missing
- **UI/UX Enhancements:** Streamlined lorebook management experience
  - Real-time status updates in settings popup
  - Contextual button text (Select vs Change) based on current state
  - Automatic UI refresh after lorebook selection or mode changes
  - Better visual feedback for manual vs automatic mode operation
- **Code Quality & Reliability:** Enhanced error handling and state management
  - Improved scene marker cleanup after successful memory creation
  - Better null-safe operations throughout lorebook handling
  - Enhanced debugging output for troubleshooting auto-summary issues
  - More robust handling of edge cases in lorebook selection and validation

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

**â† [Back to README](readme.md)**

---

*This version history is maintained alongside the main development. For the most up-to-date features, see the main [README](readme.md).*

