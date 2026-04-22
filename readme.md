# 📕 Memory Books (A SillyTavern Extension)

A next-generation SillyTavern extension for automatic, structured, and reliable memory creation. Mark scenes in chat, generate JSON-based summaries with AI, and store them as entries in your lorebooks. Supports group chats, advanced profile management, side prompts/trackers, and multi-tier memory consolidation.

### ❓ Vocabulary
- Scene → Memory  
- Many Memories → Summary / Consolidation  
- Always-On → Side Prompt (Tracker)

## ❗ Read Me First!

Start here: 
* ⚠️‼️Please read [prerequisites](#-prerequisites) for installation notes (especially if you run Text Completion API)
* 📽️ [Quickstart Video](https://youtu.be/mG2eRH_EhHs) - English only (sorry, that's the language I am most fluent in)
* ❓ [Frequently Asked Questions](#FAQ)
* 🛠️ [Troubleshooting](#Troubleshooting)

Other links: 
* 📘 [User Guide (EN)](USER_GUIDE.md)
* 📋 [Version History & Changelog](changelog.md)
* 💡 [Using 📕 Memory Books with 📚 Lorebook Ordering](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md)

> Note: Supports various languages: see [`/locales`](locales) folder for list. Internaional/localized Readme and User Guides can be found in the [`/userguides`](userguides) folder. 
> Lorebook converter and side prompt template library are in the [`/resources`](resources) folder.

## 📑 Table of Contents

- [Prerequisites](#-prerequisites)
  - [KoboldCpp Tips to using 📕 ST Memory Books](#koboldcpp-tips-to-using--st-memory-books)
  - [Llama.cpp Tips to using 📕 ST Memory Books](#llamacpp-tips-to-using--st-memory-books)
- [Recommended Global World Info/Lorebook Activation Settings](#-recommended-global-world-infolorebook-activation-settings)
- [Getting Started](#-getting-started)
  - [1. Install & Load](#1-install--load)
  - [2. Mark a Scene](#2-mark-a-scene)
  - [3. Create a Memory](#3-create-a-memory)
- [Memory Types: Scenes vs Summaries](#-memory-types-scenes-vs-summaries)
  - [Scene Memories (Default)](#-scene-memories-default)
  - [Summary Consolidation](#-summary-consolidation)
- [Memory Generation](#-memory-generation)
  - [JSON-Only Output](#json-only-output)
  - [Built-in Presets](#built-in-presets)
  - [Custom Prompts](#custom-prompts)
- [Lorebook Integration](#-lorebook-integration)
- [Slash Commands](#-slash-commands)
- [Group Chat Support](#-group-chat-support)
- [Modes of Operation](#-modes-of-operation)
  - [Automatic Mode (Default)](#automatic-mode-default)
  - [Auto-Create Lorebook Mode](#auto-create-lorebook-mode)
  - [Manual Lorebook Mode](#manual-lorebook-mode)
- [Trackers & Side Prompts](#-trackers--side-prompts)
- [Regex Integration for Advanced Customization](#-regex-integration-for-advanced-customization)
- [Profile Management](#-profile-management)
- [Settings & Configuration](#-settings--configuration)
  - [Global Settings](#global-settings)
  - [Profile Fields](#profile-fields)
- [Title Formatting](#-title-formatting)
- [Context Memories](#-context-memories)
- [Visual Feedback & Accessibility](#-visual-feedback--accessibility)
- [FAQ](#faq)
  - [Should I make a separate lorebook for memories, or can I use the same lorebook I'm already using for other things?](#should-i-make-a-separate-lorebook-for-memories-or-can-i-use-the-same-lorebook-im-already-using-for-other-things)
  - [Do I need to run vectors?](#do-i-need-to-run-vectors)
  - [Should I use 'Delay until recursion' if Memory Books is the only lorebook?](#should-i-use-delay-until-recursion-if-memory-books-is-the-only-lorebook)
- [Troubleshooting](#troubleshooting)
- [Power Up with Lorebook Ordering (STLO)](#-power-up-with-lorebook-ordering-stlo)
- [Character Policy](#-character-policy-v451)
- [For Developers](#-for-developers)
  - [Building the Extension](#building-the-extension)
  - [Git Hooks](#git-hooks)

---

## 📋 Prerequisites

- **SillyTavern:** 1.14.0+ (latest recommended)
- **Scene Selection:** Start and end markers (start < end) must be set.
- **Chat Completion Support:** Full support for OpenAI, Claude, Anthropic, OpenRouter, or other chat completion API.
- **Text Completion Support:** Text completion APIs (Kobold, TextGen, etc.) are supported when connected via a Chat Completion (OpenAI-compatible) API endpoint. I recommend setting up a Chat Completion API connection according to the KoboldCpp tips below (change as needed if you are Ollama or other software). After that, set up an STMB profile and use Custom (recommended) or full manual configuration (only if Custom fails or you have more than one custom connection).
**NOTE**: Please note that if you use Text Completion, you must have a chat completion preset!

### KoboldCpp Tips to using 📕 ST Memory Books
Set this up in ST (you can change back to Text Completion AFTER you get STMB working)
- Chat Completion API
- Custom chat completion source
- `http://localhost:5001/v1` endpoint (you can also use `127.0.0.1:5000/v1`)
- enter anything in "custom API key" (doesn't matter, but ST requires one)
- model ID must be `koboldcpp/modelname` (don't put .gguf in the model name!)
- download a chat completion preset and import it (any one will do) just so you HAVE a chat completion preset. It avoids errors from "not supported"
- change the max response length on the chat completion preset so that it is at least 2048; 4096 is recommended. (Smaller means you run the risk of getting cut off.)

### Llama.cpp Tips to using 📕 ST Memory Books
Just like Kobold, set the following up as a _Chat Completion API_ in ST (you can change back to Chat Completion after you've verified STMB is working):
- Create a new connection profile for a Chat Completion API
- Completion Source: `Custom (Open-AI Compatible)`
- Endpoint URL: `http://host.docker.internal:8080/v1` if running ST in docker, else `http://localhost:8080/v1`
- Custom API key: enter anything (ST requires one)
- Model ID: `llama2-7b-chat.gguf` (or your model, doesn't matter if you're not running more than one in llama.cpp)
- Prompt post-processing: none

For starting Llama.cpp, I recommend placing something similar to the following in a shell script or bat file, so startup is easier:
```sh
llama-server -m <model-path> -c <context-size> --port 8080
```

## 💡 Recommended Global World Info/Lorebook Activation Settings

- **Match Whole Words:** leave unchecked (false)
- **Scan Depth:** higher is better (mine is set to 8)
- **Max Recursion Steps:** 2 (general recommendation, not required)
- **Context %:** 80% (based on a context window of 100,000 tokens) - assumes you don't have super-heavy chat history or bots.
- Additional note: If the memory lorebook is your only lorebook, ensure 'Delay until recursion' is disabled in the STMB profile or the memories will not trigger!

---

## 🚀 Getting Started

### 1. **Install & Load**
- Load SillyTavern and select a character or group chat.
- Wait for the chevron buttons (► ◄) to appear on chat messages (may take up to 10 seconds).

![Wait for these buttons](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/startup.png)

### 2. **Mark a Scene**
- Click ► on the first message of your scene.
- Click ◄ on the last message.

Below are some examples of what the chevron buttons look like when clicked. Your colors may vary depending on your CSS theme!
![Visual feedback showing scene selection](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/button-start.png)

### 3. **Create a Memory**
- Open the Extensions menu (the magic wand 🪄) and click "Memory Books", or use `/creatememory` slash command.
- Confirm settings (profile, context, API/model) if prompted.
- Wait for AI generation and automatic lorebook entry.

---

## 🧩 Memory Types: Scenes vs Summaries

📕 Memory Books supports **scene memories** plus **multi-tier summary consolidation**, each designed for different kinds of continuity.

### 🎬 Scene Memories (Default)
Scene memories capture **what happened** in a specific range of messages.

- Based on explicit scene selection (► ◄)
- Ideal for moment-to-moment recall
- Preserves dialogue, actions, and immediate outcomes
- Best used frequently

This is the standard and most commonly used memory type.

---

### 🌈 Summary Consolidation
Summary consolidation captures **what changed over time** across multiple memories or summaries.

Instead of summarizing one scene, consolidated summaries focus on:
- Character development and relationship shifts
- Long-term goals, tensions, and resolutions
- Emotional trajectory and narrative direction
- Persistent state changes that should remain stable

The first consolidation tier is **Arc**, built from scene memories. Higher tiers are also supported for longer-running stories:
- Arc
- Chapter
- Book
- Legend
- Series
- Epic

> 💡 Think of these as *recaps*, not scene logs.

#### When to use Consolidated Summaries
- After a major relationship shift
- At the end of a story chapter or arc
- When motivations, trust, or power dynamics change
- Before starting a new phase of the story

#### How it works
- Consolidated summaries are generated from existing STMB memories/summaries, not directly from raw chat
- The **Consolidate Memories** tool lets you choose a target summary tier and select source entries
- STMB can optionally watch selected summary tiers and show a yes/later confirmation when a tier reaches its saved minimum eligible count
- STMB can disable source entries after consolidation if you want the higher-level summary to take over
- Failed AI summary responses can be reviewed and corrected from the UI before retrying commit

This gives you:
- lower token usage
- better narrative continuity across long chats

---

## 📝 Memory Generation

### **JSON-Only Output**
All prompts and presets **must** instruct the AI to return only valid JSON, e.g.:

```json
{
  "title": "Short scene title",
  "content": "Detailed summary of the scene...",
  "keywords": ["keyword1", "keyword2"]
}
```
**No other text is allowed in the response.**

### **Built-in Presets**
1. **Summary:** Detailed beat-by-beat summaries.
2. **Summarize:** Markdown headers for timeline, beats, interactions, outcome.
3. **Synopsis:** Comprehensive, structured markdown.
4. **Sum Up:** Concise beat summary with timeline.
5. **Minimal:** 1-2 sentence summary.
6. **Northgate:** Literary summary style intended for creative writing.
7. **Aelemar:** Focuses on plot points and character memories.
8. **Comprehensive:** Synopsis-style summary with improved keyword extraction.

### **Custom Prompts**
- Create your own, but **must** return valid JSON as above.

---

## 📚 Lorebook Integration

- **Automatic Entry Creation:** New memories are stored as entries with all metadata.
- **Flag-Based Detection:** Only entries with the `stmemorybooks` flag are recognized as memories.
- **Auto-Numbering:** Sequential, zero-padded numbering with multiple supported formats (`[000]`, `(000)`, `{000}`, `#000`).
- **Manual/Automatic Order:** Per-profile insertion order settings.
- **Editor Refresh:** Optionally auto-refreshes the lorebook editor after adding a memory.

> **Existing memories must be converted!**
> Use the [Lorebook Converter](/resources/lorebookconverter.html) to add the `stmemorybooks` flag and required fields.

---

## 🆕 Slash Commands

- `/creatememory` - Create memory from marked scene.
- `/scenememory X-Y` - Set scene range and create memory (e.g., `/scenememory 10-15`).
- `/nextmemory` - Create memory from end of last memory to current message.
- `/sideprompt "Name" {{macro}}="value" [X-Y]` - Run side prompt (`{{macro}}`s are optional).
- `/sideprompt-on "Name" | all` - Enable a Side Prompt by name or all.
- `/sideprompt-off "Name" | all` - Disable a Side Prompt by name or all.
- `/stmb-highest` - Return the highest message id for processed memories in this chat.
- `/stmb-set-highest <N|none>` - Manually set the highest processed message id for this chat.
- `/stmb-stop` - Stop all in-flight STMB generation everywhere (emergency halt).

## 👥 Group Chat Support

- All features work with group chats.
- Scene markers, memory creation, and lorebook integration are stored in the active chat metadata.
- No special setup required—just select a group chat and use as normal.

---

## 🧭 Modes of Operation

### **Automatic Mode (Default)**
- **How it works:** Automatically uses the lorebook that is bound to your current chat.
- **Best for:** Simplicity and speed. Most users should start here.
- **To use:** Ensure a lorebook is selected in the "Chat Lorebooks" dropdown for your character or group chat.

![Chat lorebook binding example](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/chatlorebook.png)

### **Auto-Create Lorebook Mode**
- **How it works:** Automatically creates and binds a new lorebook when none exists, using your custom naming template.
- **Best for:** New users and quick setup. Perfect for one-click lorebook creation.
- **To use:**
  1. Enable "Auto-create lorebook if none exists" in the extension's settings.
  2. Configure your naming template (default: "LTM - {{char}} - {{chat}}").
  3. When you create a memory without a bound lorebook, one is automatically created and bound.
- **Template placeholders:** {{char}} (character name), {{user}} (your name), {{chat}} (chat ID)
- **Smart numbering:** Automatically adds numbers (2, 3, 4...) if duplicate names exist.
- **Note:** Cannot be used simultaneously with Manual Lorebook Mode.

### **Manual Lorebook Mode**
- **How it works:** Allows you to select a different lorebook for memories on a per-chat basis, ignoring the main chat-bound lorebook.
- **Best for:** Advanced users who want to direct memories to a specific, separate lorebook.
- **To use:**
  1. Enable "Enable Manual Lorebook Mode" in the extension's settings.
  2. The first time you create a memory in a chat, you will be prompted to choose a lorebook.
  3. This choice is saved for that specific chat until you clear it or switch back to Automatic Mode.
- **Note:** Cannot be used simultaneously with Auto-Create Lorebook Mode.

---

### 🎡 Trackers & Side Prompts

Side Prompts can be used like trackers and create separate side-prompt entries in your memory lorebook. Side Prompts allow you to track **ongoing state**, not just past events. For example:
- 💰 Inventory & Resources ("What items does the user have?")
- ❤️ Relationship Status ("How does X feel about Y?")
- 📊 Character Stats ("Current health, skills, reputation")
- 🎯 Quest Progress ("What goals are active?")
- 🌍 World State ("What's changed in the setting?")

#### **Access:** From the Memory Books settings, click “🎡 Trackers & Side Prompts”.
#### **Features:**
- View all side prompts.
- Create new or duplicate prompts to experiment with different prompt styles.
- Edit or delete any preset (including built-ins).
- Export and import presets as JSON files for backup or sharing.
- Run them manually or automatically, depending on the template.
- Use standard SillyTavern macros/placeholders like `{{user}}` and `{{char}}` in side prompt `Prompt`, `Response Format`, `Title`, and `{{keyword}}` fields.
- Use custom macros/placeholders like `{{npc name}}` (you must supply them when you run `/sideprompt`).
#### **Usage Tips:**
- When creating a new prompt, you can copy from built-ins for best compatibility.
- Side prompts do not have to return JSON! They can return plain text.
- Side prompts are updated/overwritten. This differentiates them from memories, which are saved sequentially. 
- Manual syntax is `/sideprompt "Name" {{macro}}="value" [X-Y]`.
- Once you choose a side prompt in slash-command autocomplete, STMB will suggest any required runtime macros for that template.
- Side prompts with custom runtime macros (not ST default) are manual-only. STMB disables `On Interval` and `On After Memory` from those templates on save/import and warns you when that happens.
- Additional Side Prompts Template Library [JSON file](resources/SidePromptTemplateLibrary.json) - just import to use.

---

### 🧠 Regex Integration for Advanced Customization
- **Full Control Over Text Processing**: Memory Books now integrates with SillyTavern's **Regex** extension, allowing you to apply powerful text transformations at two key stages:
    1.  **Prompt Generation**: Automatically modify the prompts sent to the AI by creating regex scripts that target the **User Input** placement.
    2.  **Response Parsing**: Clean, reformat, or standardize the AI's raw response before it's saved by targeting the **AI Output** placement.
- **Multi-Select Support**: You can choose multiple scripts for outgoing and incoming processing.
- **How It Works**: Turn on `Use regex (advanced)` in STMB, click `📐 Configure regex…`, and select which scripts STMB should run before sending to AI and before parsing/saving the response.
- **Important**: Regex selection is controlled by STMB. Scripts selected there will run **even if they are currently disabled in the Regex extension itself**.

---

## 👤 Profile Management

- **Profiles:** Each profile includes API, model, temperature, prompt/preset, title format, and lorebook settings.
- **Import/Export:** Share profiles as JSON.
- **Profile Creation:** Use the advanced options popup to save new profiles.
- **Per-Profile Overrides:** Temporarily switch API/model/temp for memory creation, then restore your original settings.
- **Built-in Provider/Profile:** STMB includes a required `Current SillyTavern Settings` option that uses your active SillyTavern connection/settings directly.

---

## ⚙️ Settings & Configuration

![Main settings panel](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/Main.png)

### **Global Settings**
[Short video overview on Youtube](https://youtu.be/mG2eRH_EhHs)

- **Manual Lorebook Mode:** Enable to select lorebooks per chat.
- **Auto-create lorebook if none exists:** ⭐ *New in v4.2.0* - Automatically create and bind lorebooks using your naming template.
- **Lorebook Name Template:** ⭐ *New in v4.2.0* - Customize auto-created lorebook names with {{char}}, {{user}}, {{chat}} placeholders.
- **Allow Scene Overlap:** Permit or prevent overlapping memory ranges.
- **Always Use Default Profile:** Skip confirmation popups.
- **Show memory previews:** Enable preview popup to review and edit memories before adding to lorebook.
- **Show Notifications:** Toggle toast messages.
- **Refresh Editor:** Auto-refresh lorebook editor after memory creation.
- **Max Response Tokens:** Set the maximum generation length for memory summaries.
- **Token Warning Threshold:** Set warning level for large scenes.
- **Default Previous Memories:** Number of prior memories to include as context (0-7).
- **Auto-create memory summaries:** Enable automatic memory creation at intervals.
- **Auto-Summary Interval:** Number of messages after which to automatically create a memory summary.
- **Auto-Summary Buffer:** Delay auto-summary by a configurable number of messages.
- **Prompt for consolidation when a tier is ready:** Shows a yes/later confirmation when a selected summary tier has enough eligible source entries to consolidate.
- **Auto-Consolidation Tiers:** Choose one or more summary tiers that should trigger the confirmation prompt when ready. Currently supports Arc through Series.
- **Unhide hidden messages before memory generation:** Can run `/unhide X-Y` before creating a memory.
- **Auto-hide messages after adding memory:** Optionally hide all processed messages or just the most recent memory range.
- **Use regex (advanced):** Enables the STMB regex selection popup for outgoing/incoming processing.
- **Memory Title Format:** Choose or customize (see below).

![Profile configuration](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/Profile.png)

### **Profile Fields**
- **Name:** Display name.
- **API/Provider:** `Current SillyTavern Settings`, openai, claude, custom, full manual, and other supported providers.
- **Model:** Model name (e.g., gpt-4, claude-3-opus).
- **Temperature:** 0.0–2.0.
- **Prompt or Preset:** Custom or built-in.
- **Title Format:** Per-profile template.
- **Activation Mode:** Vectorized, Constant, Normal.
- **Position:** ↑Char, ↓Char, ↑EM, ↓EM, ↑AN, ↓AN, Outlet (and field name).
- **Order Mode:** Auto/manual.
- **Recursion:** Prevent/delay until recursion.

---

## 🏷️ Title Formatting

Customize the titles of your lorebook entries using a powerful template system.

- **Placeholders:**
  - `{{title}}` - The title generated by the AI (e.g., "A Fateful Encounter").
  - `{{scene}}` - The message range (e.g., "Scene 15-23").
  - `{{char}}` - The character's name.
  - `{{user}}` - Your user name.
  - `{{messages}}` - The number of messages in the scene.
  - `{{profile}}` - The name of the profile used for generation.
  - Current date/time placeholders in various formats (e.g., `August 13, 2025` for date, `11:08 PM` for time).
- **Auto-numbering:** Use `[0]`, `[00]`, `(0)`, `{0}`, `#0`, and now also the wrapped forms like `#[000]`, `([000])`, `{[000]}` for sequential, zero-padded numbering.
- **Custom Formats:** You can create your own formats. As of v4.5.1, all printable Unicode characters (including emoji, CJK, accented, symbols, etc.) are allowed in titles; only Unicode control characters are blocked.

---

## 🧵 Context Memories

- **Include up to 7 previous memories** as context for better continuity.
- **Token estimation** includes context memories for accuracy.
- **Advanced options** let you temporarily override prompt/profile behavior for a single memory run.

![Memory generation with context](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/context.png)

---

## 🎨 Visual Feedback & Accessibility

- **Button States:**
  - Inactive, active, valid selection, in-scene, processing.

![Complete scene selection showing all visual states](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/example.png)


- **Accessibility:**
  - Keyboard navigation, focus indicators, ARIA attributes, reduced motion, mobile-friendly.

---

# FAQ

### Should I make a separate lorebook for memories, or can I use the same lorebook I'm already using for other things?

I recommend that your memory lorebook be a separate book. This makes it easier to organize memories (vs other entries). For example, adding it to a group chat, using it in another chat, or setting an individual lorebook budget (using STLO).

### Do I need to run vectors?

You can, but it's not required. If you don't use the vectors extension (I don't), it works via keywords. This is all automated so that you don't have to think about what keywords to use.

### Should I use 'Delay until recursion' if Memory Books is the only lorebook?

No. If there are no other world info or lorebooks, selecting 'Delay until recursion' may prevent the first loop from triggering, causing nothing to activate. If Memory Books is the sole lorebook, either disable 'Delay until recursion' or ensure at least one additional world info/lorebook is configured.

### Why isn't the AI seeing my entries?

First of all you must check that the entries are being sent. I like to use [WorldInfo-Info](https://github.com/aikohanasaki/SillyTavern-WorldInfoInfo) for that. 

If the entries are being triggered and are being sent to the AI, you should probably yell at the AI in OOC. Something like: `[OOC: WHY are you not using the information you were given? Specifically: (whatever it was)]` 😁

---

# Troubleshooting

- **I can't find Memory Books in the Extensions menu!**
Settings are located in the Extensions menu (the magic wand 🪄 to the left of your input box). Look for "Memory Books".
![Location of STMB settings](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/menu.png)

- **No lorebook available or selected:**
  - In Manual Mode, select a lorebook when prompted.
  - In Automatic Mode, bind a lorebook to your chat.
  - Or enable "Auto-create lorebook if none exists" for automatic creation.

- **Lorebook Validation Error:**
  - You probably deleted the previously-bound lorebook. Just bind a new lorebook (can be blank).

- **No scene selected:**
  - Mark both start (►) and end (◄) points.

- **Scene overlaps with existing memory:**
  - Choose a different range, or enable "Allow scene overlap" in settings.

![Scene overlap warning](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/overlap.png)

- **AI failed to generate valid memory:**
  - Use a model that supports JSON output.
  - Check your prompt and model settings.

- **Token warning threshold exceeded:**
  - Use a smaller scene, or increase the threshold.

- **Missing chevron buttons:**
  - Wait for extension to load, or refresh.

- **Character data not available:**
  - Wait for chat/group to fully load.

---

## 📚 Power Up with Lorebook Ordering (STLO)

For advanced memory organization and deeper story integration, use STMB together with [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md). See the guide for best practices, setup instructions, and tips!

---

## 📝 Character Policy (v4.5.1+)

- **Allowed in titles:** All printable Unicode characters are allowed, including accented letters, emoji, CJK, and symbols.
- **Blocked:** Only Unicode control characters (U+0000–U+001F, U+007F–U+009F) are blocked; these are removed automatically.

See [Character Policy Details](charset.md) for examples and migration notes.

---

## 👨‍💻 For Developers

### Building the Extension

This extension uses Bun for building. The build process minifies and bundles the source files.

```sh
# Build the extension
bun run build
```

### Git Hooks

The project includes a pre-commit hook that automatically builds the extension and includes the build artifacts in your commits. This ensures the built files are always in sync with the source code.

**To install the git hook:**

```sh
bun run install-hooks
```

The hook will:
- Run `bun run build` before each commit
- Add build artifacts to the commit
- Abort the commit if the build fails

---

*Developed with love using VS Code/Cline, extensive testing, and community feedback.* 🤖💕
