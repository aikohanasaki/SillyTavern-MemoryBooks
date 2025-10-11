# 📕 ST Memory Books User Guide

Welcome to ST Memory Books! This guide explains how to use 📕 ST Memory Books for organizing, summarizing, and automating your chat lore and memories in SillyTavern.

Quick links:
- 📄 Changelog: [changelog.md](changelog.md)
- 🔧 Lorebook Converter: [lorebookconverter.html](lorebookconverter.html)
- 📘 README: [readme.md](readme.md)

Works in all (single-character/group) chats.

---

## 1. What is ST Memory Books?

STMB is a SillyTavern extension that lets you:
- Mark scenes in chat and generate AI-powered memory summaries.
- Automatically store memories with rich metadata in lorebooks.
- Automate summarization, analytics, and advanced workflows via side prompts and auto-summary.
- Manage lorebooks, profiles, and prompts with flexible settings.

---

## 2. Installation & Access

1. Requirements:
   - SillyTavern (latest recommended)
   - This extension (ST Memory Books)

2. Install:
   - Place the extension in the SillyTavern plugins/extensions folder.
   - Enable it in SillyTavern’s Extensions menu.

3. Access:
   - Open the Extensions menu (magic wand 🪄 to the left of the input box).
   - Click “Memory Books” for settings, creation, prompts, and tools.

---

## 3. Core User Workflows

### A. Automatic Summaries (“Set and Forget”)

<details>
<summary><strong>Set-and-Forget Workflow (Auto-Summary)</strong></summary>

- Enable “Auto-Summary” in Memory Books settings.
- STMB tracks new chat messages and, after a configurable interval, it will:
  - Mark the appropriate scene boundaries for you,
  - Generate a memory using AI,
  - Store it in your lorebook, and
  - (Optionally) run side prompts or other automation.
- If no lorebook is present, you’ll be prompted to select/create one or postpone auto-summary for X messages.
- Runs in single and group chats (group chats trigger after group turn completion).
- No manual interaction is needed after initial setup.

</details>

### B. Marking a Scene & Creating a Memory

<details>
<summary><strong>UI Workflow</strong></summary>

1. Mark Scene Start/End:
   - After loading a chat, wait a few seconds for chevron buttons to appear on each message (► ◄).
   - Click the right-facing chevron (►) to set the start.
   - Click the left-facing chevron (◄) to set the end.
   - Click again to unset/reset markers.

2. Create Memory:
   - Open the Extensions menu (🪄) → “Memory Books”.
   - Click “Create Memory”.
   - Confirm settings if prompted (profile, model, options).
   - A memory is generated and added to the bound lorebook.
   - A notification confirms success or explains issues.

</details>

<details>
<summary><strong>Slash Command Workflow</strong></summary>

- Mark a range and create:  
  `/scenememory X-Y` (e.g., `/scenememory 10-15`)
- Create from current marked selection:  
  `/creatememory`
- Create from all new messages since the last memory:  
  `/nextmemory`
- Manual side prompt execution:  
  `/sideprompt "Template Name" [X-Y]`  
  - If no args provided, a picker opens so you can select a side prompt.
- Deprecated (still supported, prefer /sideprompt):
  - `/plotupdate X-Y` (use `/sideprompt "Plot Points Extractor" X-Y`)
  - `/score Name` (use `/sideprompt "Factions"`)

> Tip: Type `/help` in SillyTavern for command discovery.

</details>

### C. Lorebook Management

- Automatic (Chat-Bound) Mode:
  - Uses the lorebook bound to your current chat.
  - Recommended for simplicity and speed.

- Manual Mode:
  - Select a specific lorebook per chat from the Memory Books UI.
  - Good for advanced users directing memories to specialized lorebooks.

- Auto-Create:
  - If enabled, creates and binds a lorebook automatically when none exists.
  - Uses your custom name template (e.g., “LTM - {{char}} - {{chat}}”).

- Mutual Exclusion:
  - Manual Mode and Auto-Create cannot be active at the same time.
  - Enabling one disables the other.

- Group Chat Support:
  - Scene, memory, and lorebook bindings work in group chats just like single chats.

### D. Advanced: Side Prompts

- What are Side Prompts?
  - Custom LLM-backed templates to generate analytics, plot points, dashboards, or any structured/long-form content you want saved to the lorebook.
  - Generally used for trackers, scoreboards, etc.
  - Results are saved (and overwritten) in a single lorebook entry in the same lorebook as memories.

- How to Run:
  - UI: In Memory Books, click “🎡 Side Prompts” to manage and run prompts.

- Triggers:
  - On Interval: Run automatically after X visible messages.
  - After Memory: Run automatically right after a memory is created.
  - Manual: `/sideprompt "Name" [X-Y]` (no args opens a picker).

---

## 4. Settings & Customization

- Profiles
  - Create, edit, import, export, and delete profiles.
  - “Current SillyTavern Settings” (dynamic default) mirrors your ST UI’s API/model/temperature at runtime.
  - Other profiles store fixed API/model/temperature settings.
  - Each profile can set insertion mode, order, vectorization, recursion flags, etc.

- Memory Previews
  - Enable “Show Memory Previews” to review/edit the AI output before saving to the lorebook.
  - Accept, edit, retry (limited), or cancel before it’s stored.

- Title Formatting
  - Use placeholders and numbering patterns for automatic titles.
  - Placeholders:
    - `{{title}}`, `{{scene}}`, `{{char}}`, `{{user}}`, `{{messages}}`, `{{profile}}`, `{{date}}`, `{{time}}`
  - Numbering patterns:
    - `[000]`, `(000)`, `{000}`, `#[000]` (padding inferred from zeros)
  - Example: `[000] - {{title}} ({{scene}})` → `[023] - Ambush (Scene 100-112)`

- Auto-Hide
  - Modes: none, all, last
    - none: don’t hide anything
    - all: hide all previous messages (optionally keep the last N unhidden)
    - last: hide just the scene’s messages (optionally keep the last N unhidden)
  - “Unhidden entries count” keeps N latest messages visible in either mode.

- Token Warning Threshold & Context
  - Token warning threshold stops generation if the estimated tokens exceed your limit.
  - “Default previous memories” includes N prior memories as context for better continuity.

- Lorebook Name Template
  - Template used by Auto-Create (e.g., `LTM - {{char}} - {{chat}}`).
  - Smart numbering adds `2`, `3`, `4`… to avoid collisions.

- Notifications
  - Toggle success/error toasts and general UI feedback.

- Mutual Exclusion (reminder)
  - Enabling Manual Mode disables Auto-Create and vice versa.

---

## 5. Troubleshooting & FAQ

- The extension isn’t visible:
  - Ensure it’s installed in the correct folder and enabled in Manage Extensions.
  - Make sure you're checking the right place. 📕ST Memory Books is found in the magic wand (🪄) in the input box.

- Chevrons (► ◄) aren’t visible:
  - Wait a few seconds after SillyTavern starts. If still not visible, refresh the page.

- No memory generated when clicking Create Memory:
  - Ensure both scene start and end are set.
  - Verify a lorebook is bound or that Auto-Create is enabled.
  - Check token threshold and reduce the scene size if needed.

- Auto-Summary didn’t run:
  - Confirm Auto-Summary is enabled and the message interval has been reached.
  - If prompted earlier, auto-summary may be postponed until message N.
  - if prior memories were deleted, auto-summary does not go back to review, and only processes based on "last message processed". 

- Group chat support:
  - Auto-summary triggers at the end of group turns; memories and prompts work the same as single chats.

---

## 6. Getting Help

- Read more: [readme.md](readme.md)
- Changelog: [changelog.md](changelog.md)
- Converter: [lorebookconverter.html](lorebookconverter.html)
- Discord: [📕ST Memory Books thread](https://discord.com/channels/1100685673633153084/1389013888045027339) on ST Discord or @tokyoapple in DM
- Issues/feature requests: Open a GitHub issue in this repository
