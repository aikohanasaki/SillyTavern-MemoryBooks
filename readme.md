Fork banner: this repo is the upstream project; the active development
fork with auto scene detection (Sentinel), paired-clip context (Clipper+),
and a chunked lorebook auditor lives at
https://github.com/phattbeats/SillyTavern-MemoryBooks-Auto.
See README.fork.md for the fork's install + migration guide, or
CHANGELOG.fork.md for fork-specific changes.
-->
<!--
Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only

Fork banner: this repo is the upstream project; the active development
fork with auto scene detection (Sentinel), paired-clip context (Clipper+),
and a chunked lorebook auditor lives at
https://github.com/phattbeats/SillyTavern-MemoryBooks-Auto.
See README.fork.md for the fork's install + migration guide, or
CHANGELOG.fork.md for fork-specific changes.
-->

# 📕 Memory Books (A SillyTavern Extension)

A next-generation SillyTavern extension for automatic, structured, and reliable memory creation. Mark scenes in chat, generate JSON-based summaries with AI, and store them as entries in your lorebooks. Supports group chats, advanced profile management, side prompts/trackers, and multi-tier memory consolidation.

---

# 👋 NEW: Interactive Memory Books Guide
I have loaded all the STMB documentation into Gemini and created an interactive guide! Now you can ask Gemini clear questions and it has STMB documentation to answer your questions properly. [Click here to use the Interactive Memory Books Guide.](https://gemini.google.com/gem/1XRy0GEu_iWmqdjMV1ZpD59rexoFDJo7B?usp=sharing) 

---

### ❓ Vocabulary
- Scene → Memory  
- One saved fact → Clip  
- Ongoing tracker → Side Prompt  
- Many Memories → Summary / Consolidation  
- One long entry → Compaction

### Clips vs Side Prompts

<details>
<summary><strong>Clips vs Side Prompts</strong></summary>

| **Clips** | **Side Prompts** |
|---|---|
| Save selected chat text into a Memory Book entry. | Ask the AI to review chat and update a tracker entry. |
| Best for one clear fact, line, promise, preference, item, or note. | Best for information that changes over time. |
| Think: “pin this note.” | Think: “keep this section updated.” |

</details>

For the longer explanation, see the [User Guide](USER_GUIDE.md#clips-topical-clips-and-side-prompts).

### Compaction vs Consolidation

<details>
<summary><strong>Compaction vs Consolidation</strong></summary>

| **Compaction** | **Consolidation** |
|---|---|
| Shortens one existing STMB-managed entry. | Combines multiple memories or summaries into one higher-level recap. |
| Use when a Clip, Side Prompt, or Memory entry is useful, but getting too long. | Use when several memories are ready to become an Arc, Chapter, Book, or other larger summary. |
| Think: “trim this one entry.” | Think: “roll these memories up into a recap.” |

</details>

For the longer explanation, see the [User Guide](USER_GUIDE.md#-compaction-vs-consolidation).

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

> Note: Supports various languages: see [`/locales`](locales) folder for list. International/localized Readme and User Guides can be found in the [`/userguides`](userguides) folder. 
> Lorebook converter and side prompt template library are in the [`/resources`](resources) folder.

## ✍️ Author Policy (this fork)

**All commits on this fork must be authored as `phattbeats <obiwouldjablowme@protonmail.com>`.** No `Co-Authored-By:` trailer is allowed unless it credits @phattbeats. The same rule is enforced two ways: a local `.githooks/commit-msg` hook (installed by `bun run install-hooks`), and a GitHub Actions job (`.github/workflows/authorship-check.yml`) that runs on every PR to `main`. Branch protection requires that job to pass before merge.

If you're a contributor, see [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/AUTHORSHIP.md](docs/AUTHORSHIP.md) for the full rule, the disallowed trailer list, and how to amend the commit message (`git commit --amend`).

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
- [Lorebook Integration](#-lorebook-integration)
- [Branching Chats](#-branching-chats)
- [Clip to Memory Book](#-clip-to-memory-book)
- [Topical Clip](#-topical-clip)
- [Slash Commands](#-slash-commands)
  - [`/stmb-catchup`](#stmb-catchup)
- [Group Chat Support](#-group-chat-support)
- [Narrator Mode](#-narrator-mode)
- [Modes of Operation](#-modes-of-operation)
- [Trackers & Side Prompts](#-trackers--side-prompts)
- [Compaction](#-compaction)
- [Regenerating Entries](#-regenerating-entries)
- [Regex Integration for Advanced Customization](#-regex-integration-for-advanced-customization)
- [Profile Management](#-profile-management)
- [Settings & Configuration](#-settings--configuration)
- [Title Formatting](#-title-formatting)
- [Context for Generation](#-context-for-generation)
  - [Previous Memories](#previous-memories)
  - [Additional Context and Context Settings](#additional-context-and-context-settings)
  - [Memory Count Macros](#memory-count-macros)
- [Optional Job Queue](#-optional-job-queue-chat-top-bar-required)
- [Visual Feedback & Accessibility](#-visual-feedback--accessibility)
- [FAQ](#faq)
- [Troubleshooting](#troubleshooting)
- [Power Up with Lorebook Ordering (STLO)](#-power-up-with-lorebook-ordering-stlo)
- [Character Policy](#-character-policy-v451)
- [For Developers](#-for-developers)

---

## 📋 Prerequisites

- **SillyTavern:** 1.14.0+ (latest recommended)
- **Optional Job Queue:** STMB works without the job queue. To use queueing, install and enable **Chat Top Bar** / **Chat Top Info Bar**, the official SillyTavern extension that adds a top bar to the chat window. STMB uses that top bar to show the Memory Books Jobs button and queue drawer.
- **Chat Completion Support:** Full support for OpenAI, Claude, Anthropic, OpenRouter, or other chat completion API.
- **Text Completion Support:** Text completion APIs (Kobold, TextGen, etc.) are supported when connected via a Chat Completion (OpenAI-compatible) API endpoint. I recommend setting up a Chat Completion API connection according to the KoboldCpp tips below (change as needed if you are Ollama or other software). After that, set up an STMB profile and use Custom OpenAI-Compatible API. If you have more than one Custom connection, bind the profile to the intended named SillyTavern connection. Use Full Manual Configuration only for an exceptional endpoint that cannot be represented through SillyTavern.
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
Just like Kobold, set the following up as a _Chat Completion API_ in ST (you can change back to Text Completion after you've verified STMB is working):
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

![Clicked start button](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/button-start.png)

![Mid-scene buttons](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/button-middle.png)

![Clicked end button](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/button-end.png)

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

![Consolidate button](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/button-consolidate.png)

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


## 🌿 Branching Chats

By default, **Copy Memory Books when branching** is enabled. When SillyTavern creates a native chat branch, STMB gives the new branch independent copies of the Memory Books it was using at the moment of branching.

- In Automatic Mode, STMB copies and binds the active chat-bound Memory Book.
- In Manual Mode, STMB copies the main manual Memory Book.
- In a Manual Mode group chat, STMB also copies each unique **unlocked** character Memory Book used by the group.
- In Narrator Mode, STMB copies the omniscient Memory Book and every declared cast Memory Book, then rewrites the branch cast assignments to the copies.
- Persistent character Memory Book locks are preserved instead of copied. A locked character continues using the locked book.
- All books copied for the same branch use the same branch number, such as `Investigation Memories Branch 1` and `Alice Memories Branch 1`.
- STMB updates branch-specific chat IDs and links between canonical group entries and character copies inside the new books.

While the copies are being created, do not switch chats. If copying fails, STMB clears the new branch's inherited Memory Book bindings so the branch cannot accidentally write into the originals.

Disable **Copy Memory Books when branching** in **Memory Books → General Settings** when you intentionally want a branch to keep using the inherited books instead of receiving independent copies.

---

## ✂️ Clip to Memory Book

![Clip text](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/clip.png)

Clip to Memory Book is for quick “remember this” notes. Highlight important chat text, click the floating scissors button, and save the selected text as a bullet in your Memory Book without opening the lorebook editor first.

If you want an ongoing tracker that updates over time, use a Side Prompt instead. Short version: **Clip = one saved fact; Side Prompt = ongoing tracker.**

#### How it works
- Highlight the exact text you want to remember.
- Click the floating scissors button. You can turn this button on or off in the Memory Books popup.
- Choose an existing clip entry or create a new one.
- Review the current entry and updated preview before saving.
- Rename the entry/section if needed.

Clip entries are normal lorebook entries marked with `[STMB Clip]` at the end of the entry title. For example:

```txt
Seraphina Healed Me [STMB Clip]
```

The visible section inside the entry uses the title without `[STMB Clip]`:

```md
=== Seraphina Healed Me ===

- Seraphina healed my wounds with magic.
- Seraphina, guardian of this forest

=== END Seraphina Healed Me ===
```

#### Tips
- One clip entry has one section. Use focused titles like `Things {{user}} Likes`, `Pet Names`, or `Food Preferences` so keywords can stay specific.
- New clip entries can be always active or keyword-triggered. Always active is easiest; keywords are better when the entry should only appear sometimes.
- Existing entries can become clip entries by adding `[STMB Clip]` to the end of the title.
- Long clip entries may show a reminder to review or compact them. Compaction can help make clip, side prompt, and STMB memory entries more token-efficient before you replace the original.
- Clip entries do not add source attribution. They save only the text you chose to clip.

## 🔎 Topical Clip

Topical Clip creates or updates a focused Clip-style memory entry about one topic.

Use it when you already have STMB memories saved, but want one clean “about this” entry that gathers related details from those memories. For example:

- `About Seraphina`
- `About {{user}}'s magic`
- `About the Black Harbor investigation`
- `About Alex and Mira's relationship`

Topical Clip is different from normal Clip to Memory Book. A normal Clip saves highlighted chat text directly. Topical Clip reads existing STMB memory entries, asks the AI to extract details about one topic, then gives you an editable draft before saving.

#### How it works

1. Open Memory Books.
2. Click **🔎 Topical Clip**.
3. Choose the **Source Memory Book**.
4. Enter a **Topic**.
5. Enter activation **Keywords**, or leave them empty to use the topic.
6. Choose whether to create a new Topical Clip or update an existing `[STMB Clip]` entry.
7. Choose a **Generation Profile**.
8. Click **Generate Draft**.
9. Review and edit the draft.
10. Click **Save Topical Clip** only when you are happy with it.

Topical Clip saves entries as normal Clip entries marked with `[STMB Clip]`. New entries use a title like:

```txt
About Elliott [STMB Clip]
```

#### Updating existing Topical Clips

When you update an existing Topical Clip, STMB remembers which source memories were used during the last successful run. The next update normally uses only new or changed source memories.

If you want to rebuild the whole entry from all eligible memories, enable **Rebuild from all source memories** before generating the draft.

#### Notes

* Topical Clip only uses confirmed STMB memory entries as source material.
* Clip entries and Side Prompt entries are not used as source memories.
* Update targets are existing `[STMB Clip]` entries.
* The AI draft is always reviewable and editable before saving.
* STMB does not save the generated draft until you click **Save Topical Clip**.
* If the request is large, STMB may show a token warning before running.

## 🆕 Slash Commands

- `/creatememory` - Create memory from marked scene.
- `/scenememory X-Y` - Set scene range and create memory (e.g., `/scenememory 10-15`).
- `/nextmemory` - Create memory from end of last memory to current message.
- `/stmb-catchup interval=x start=y end=y` - Create catch-up memories across an existing long chat by processing the selected message range in interval-sized chunks.
- `/sideprompt "Name" {{macro}}="value" [X-Y]` - Run side prompt (`{{macro}}`s are optional).
- `/sideprompt-set "Set Name" [X-Y]` - Run a saved Side Prompt Set.
- `/sideprompt-macroset "Set Name" {{macro}}="value" [X-Y]` - Run a Side Prompt Set and supply reusable macro values.
- `/sideprompt-on "Name" | all` - Enable a Side Prompt by name or all.
- `/sideprompt-off "Name" | all` - Disable a Side Prompt by name or all.
- `/stmb-highest` - Return the highest message id for processed memories in this chat.
- `/stmb-set-highest <N|none>` - Manually set the highest processed message id for this chat.
- `/stmb-stop` - Stop all in-flight STMB generation everywhere (emergency halt).

### `/stmb-catchup`

Use `/stmb-catchup` when converting an existing long chat into STMB memories.

```txt
/stmb-catchup interval=<chunk size> start=<first message id> end=<last message id>
```

Example:

```txt
/stmb-catchup interval=30 start=0 end=300
```

The start and end IDs are inclusive. STMB processes the range in consecutive chunks of the requested size; the final chunk may be smaller. The example above creates memories for `0-29`, `30-59`, and so on, ending with `300-300`.

Catch-up is deliberately non-interactive. Before running it:

- enable **Always use default profile**;
- disable **Show memory previews**;
- make sure the effective Memory Book already exists, or enable Auto-Create in Automatic Mode;
- make sure every Manual Mode group member has a valid required assignment; and
- use an interval small enough that every chunk stays below the token warning threshold.

STMB preflights every chunk before it starts. It then processes the chunks in order and stops on the first failure or stop request. Memories completed before that point remain saved; run catch-up again only for the unfinished range.

---

## 👥 Group Chat Support

STMB works in group chats with the same manual, automatic, and slash-command memory tools used in one-on-one chats. You do not need to turn on a separate group-chat mode: select the group and use STMB normally.

#### Participant-aware memories

- STMB reads the speaker attached to each group-chat message and keeps character attribution clear in the generated summary.
- When STMB can identify the participating group members, the saved memory receives an inclusive SillyTavern character filter for those members. This keeps a group memory tied to the characters who were actually part of the scene.
- Scene markers, the highest processed message, manual lorebook choices, and other per-chat state are stored with the active group chat. Switching chats does not move those settings to another chat.

#### Automatic and Auto-Create modes: one Memory Book

Automatic Mode uses the lorebook bound to the group chat. Auto-Create Mode can create and bind one if the group does not have a lorebook yet. In either mode, memories are saved to that group Memory Book and participant filters are added automatically when the speakers can be identified.

This is the easiest setup and is enough for most group chats.

#### Manual Mode: group and character Memory Books

Manual Lorebook Mode can maintain a main group Memory Book plus a designated Memory Book for every group member. Individual character-lorebook designation requires [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering) to be installed and enabled.

1. Open a group chat and enable **Manual Lorebook Mode**.
2. Select the main manual lorebook. This becomes the canonical group Memory Book.
3. Under **Group Character Lorebooks**, select a lorebook for every member. You may assign the same character lorebook to more than one character, but the canonical group Memory Book cannot also be a character Memory Book.
4. Create a memory normally.
5. Confirm which characters participated. STMB preselects the members it detected from the messages. Selecting no one applies the memory to every group member.

STMB saves the canonical memory to the group Memory Book and copies it to the selected participants' designated Memory Books. The related entries are linked internally so group and character consolidation can keep their timelines aligned. If any required character lorebook is missing or deleted, STMB stops instead of leaving a partial set of memories.

When this group-and-character Memory Book setup is consolidated, the canonical group Memory Book automatically uses the editable **Group Chat Consolidation Analysis (Automatic)** prompt. It builds an omniscient group chronology while preserving differences between objective events and individual character knowledge. Character Memory Books continue using the consolidation preset selected in the **Consolidate Memories** popup. If several characters share one character Memory Book, the same routing still applies.

Selecting a character Memory Book also updates that lorebook's root-level STLO metadata. STMB adds the character's avatar basename to `stlo.characterOverrides` and enables `stlo.onlyWhenSpeaking`, while preserving existing STLO priorities, budgets, and character overrides. Existing manual assignments are repaired automatically when the Memory Books panel opens or before memory generation.

STLO filters use merge-only behavior: clearing or changing an STMB assignment does not delete the old lorebook's STLO character override. Remove that retained filter in STLO if the lorebook should no longer activate for that character.

The participant confirmation includes **Automatically accept detected participants in future**. Enable it if you trust the message-speaker detection and do not want to approve the list on every memory.

#### Separate group and character prompts (optional)

For different versions of the same memory:

1. Open **Profile Manager** and edit the profile used for memory creation.
2. Enable **Use separate group and character prompts in group chats**.
3. Choose a **Group Summary Prompt** and a **Character Summary Prompt**.

The group prompt writes the shared version for the main group Memory Book. In Manual Mode with STLO, the character prompt can create a character-focused version for an individually assigned character Memory Book. This costs additional generation requests, but it lets the shared memory describe the whole scene while an individual copy concentrates on what mattered to that character. If multiple members share one assigned Memory Book, STMB keeps one shared copy there instead.

> 💡 **Recommended:** Start with one group Memory Book. Add per-character Memory Books only when you need different knowledge, continuity, or context for individual members.

---

## 🎭 Narrator Mode

Narrator Mode is for a normal one-on-one chat where one Narrator character card writes several fictional characters. Unlike native Group Chat Mode, SillyTavern does not identify those fictional characters as separate message authors, so STMB uses an explicit **Active Cast** selection and message metadata instead.

Narrator Mode requires:

- **Manual Lorebook Mode**;
- one omniscient manual Memory Book;
- one unique Memory Book for each declared fictional character; and
- a user-maintained cast configured through **Manage Narrator Cast**.

Before each Narrator generation, select the participating characters in the movable Active Cast drawer. STMB snapshots that selection, makes the selected character Memory Books available to the generation, and stamps the completed message with stable cast-member IDs. Later memory creation uses those IDs to save one canonical entry to the omniscient book and linked copies to the participating character books.

Narrator Mode does not infer characters from names in prose, does not use native character filters, and does not require STLO. The profile option for separate group and character prompts can produce an omniscient version plus character-focused versions.

See the [Narrator Mode Technical Guide](userguides/narrator-mode-en.md) for setup, metadata flow, legacy-message handling, branching, regeneration, consolidation, and troubleshooting.

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

### **Narrator Mode**
- **How it works:** Extends Manual Lorebook Mode for a normal chat whose Narrator card writes multiple fictional characters. Uses one omniscient Memory Book and one unique book per declared cast member.
- **Best for:** Narrator-card roleplay where individual fictional characters need separate continuity.
- **Requires:** Manual Lorebook Mode and a selected omniscient Memory Book.
- **Does not require:** Native group chat cards or STLO.

---

### 🎡 Trackers & Side Prompts

![Where to find Trackers and Side Prompts](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/sp.png)

> 📘 Side Prompts have their own guide: [Side Prompts Guide](userguides/side-prompts-en.md). Use that for sets, macros, examples, and troubleshooting.
> 🎡 Need the click path? See the [Scribe walkthrough for enabling Side Prompts](https://scribehow.com/viewer/How_to_Enable_Side_Prompts_in_Memory_Books__fif494uSSjCmxE2ZCmRGxQ).

Side Prompts are separate STMB prompt runs for maintaining ongoing chat state. Use them for trackers and support notes that should not bloat the normal character reply. If you only want to save one highlighted fact, use Clip to Memory Book instead.

Use Side Prompts for things like:

- 💰 Inventory & Resources ("What items does the user have?")
- ❤️ Relationship Status ("How does X feel about Y?")
- 📊 Character Stats ("Current health, skills, reputation")
- 🎯 Quest Progress ("What goals are active?")
- 🌍 World State ("What's changed in the setting?")

#### **Access:** From the Memory Books settings, click “🎡 Trackers & Side Prompts”.

#### **Features:**
- View, create, duplicate, edit, delete, export, and import Side Prompts.
- Run Side Prompts manually, after memory, or as part of a Side Prompt Set.
- Use standard SillyTavern macros like `{{user}}` and `{{char}}`.
- Use runtime macros like `{{npc name}}` when a prompt needs a value supplied at run time.
- Save Side Prompt output as separate side-prompt entries in your memory lorebook.

#### **Usage Tips:**
- Copy from built-ins when making a new prompt.
- Side Prompts do not have to return JSON. Plain text or Markdown is fine.
- Side Prompts are usually updated/overwritten; memories are saved sequentially.
- Manual syntax is `/sideprompt "Name" {{macro}}="value" [X-Y]`.
- Use Side Prompt Sets when a chat needs an ordered bundle of trackers.
- A selected Side Prompt Set replaces individually-enabled automatic Side Prompts for that chat; rows still run only when their own after-memory or interval trigger is enabled.
- General Settings can define separate default Side Prompt Sets for solo and group chats. Each chat may inherit that default, explicitly use individual prompts, or choose another set.
- Side Prompts can save to the effective Memory Book or to a template-level/per-chat lorebook override.
- Additional Side Prompts Template Library [JSON file](resources/SidePromptTemplateLibrary.json) - just import to use.

--- 

## 🧹 Compaction

![Click here for Compaction Menu](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/compaction.png)

Compaction is a review workflow for making STMB-managed lorebook entries more token-efficient. It asks the AI to rewrite one existing entry, then shows you the original and the compacted draft before anything is replaced.

This is separate from Summary Consolidation: Compaction rewrites one entry; Consolidation combines several memories into a larger recap.

You can open it from the main Memory Books popup with **📝 Compaction**. Long Clip entries may also offer a **Compact Entry** button from the Clip workflow.

#### Eligible entries

Compaction lists eligible entries from the selected Memory Book:

- Clip entries marked with `[STMB Clip]`
- Side Prompt entries
- STMB memory entries flagged by Memory Books

Ordinary lorebook entries that are not managed by STMB are not shown.

#### How it works

1. Open Memory Books and click **📝 Compaction**.
2. Choose a **Memory Book**. If the current chat already has a valid Memory Book, STMB pre-selects it; otherwise, choose one from the searchable dropdown.
3. Choose a **Compaction Profile**. This controls which AI connection/model is used for the compaction request.
4. Optional: click **Edit Compaction Prompt** if you want to change the instructions sent to the AI.
5. Click **Compact Entry** next to the entry you want to rewrite.
6. Compare **Original content** and **Compacted draft**. STMB shows estimated token counts for both.
7. Edit the draft if needed, then choose **Replace with Compacted Version**, **Copy Compacted Draft**, or **Cancel**.

STMB does **not** replace the original automatically. The lorebook entry is only changed if you click **Replace with Compacted Version**.

#### Compaction Prompt

The Compaction Prompt is editable. The default prompt tells the AI to preserve important facts, names, pronouns, macros, wrapper headings, and end markers while removing redundancy and low-value wording.

Supported prompt placeholders:

- `{{ENTRY_CONTENT}}` — the current lorebook entry content. This placeholder is required.
- `{{ENTRY_KIND}}` — the entry type, such as Clip, SidePrompt, or Memory.
- `{{ENTRY_TITLE}}` — the lorebook entry title.

Use **Reset to Default** in the prompt editor if you want to restore the built-in Compaction Prompt.

#### Best used for

- long Clip entries
- Side Prompt tracker entries that have accumulated repeated notes
- STMB memory entries that are useful but wordy
- entries that are always active and starting to waste context

#### Not meant for

- adding new facts
- summarizing raw chat
- creating new memories
- rewriting ordinary lorebook entries that STMB does not manage

---

## ♻️ Regenerating Entries

STMB adds regeneration controls to eligible entries in SillyTavern's lorebook editor.

1. Open the Memory Book in the normal lorebook editor.
2. Find the STMB entry.
3. Click **Regenerate memory** or **Regenerate side prompt**.
4. Review the replacement draft.
5. Approve it only if it is better than the current entry.

Regeneration never overwrites an entry without approval.

### Scene memories

A scene memory is regenerated from its original chat range. Open the source chat first. The regeneration window lets you choose the current profile, prompt, previous-memory context, and Additional Context just like an ordinary memory run.

If every message in the original range is hidden, either reveal the messages manually or enable **Unhide hidden messages for memory generation** before trying again.

### Consolidated summaries

A consolidated Arc, Chapter, Book, Legend, Series, or Epic is regenerated from the exact lower-tier source entries linked to it. STMB uses the dedicated **Regenerate Consolidation** preset, which is reserved for this workflow.

A source entry cannot be regenerated while an active higher-tier consolidation depends on it. Delete the parent consolidation first if you intentionally want to rebuild the lower-tier entry.

### Side Prompts

A Side Prompt entry can be regenerated after it has been run at least once with regeneration support enabled. STMB stores the latest run's source range, prior entry content, template key, and runtime macro values. Regeneration uses that snapshot with the **current** version of the Side Prompt template and its current connection/context settings.

### Safety rules

- If the source chat, target entry, or consolidation sources change while generation is running, STMB refuses to overwrite anything.
- If a Side Prompt template was deleted, its entry cannot be regenerated from the snapshot.
- Linked group and character copies are not live-synchronized. Regenerating one copy does not regenerate the others; STMB warns when linked copies exist.

---

### 🧠 Regex Integration for Advanced Customization

![Configure regex](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/regex.png)

- **Full Control Over Text Processing**: Memory Books now integrates with SillyTavern's **Regex** extension, allowing you to apply powerful text transformations at two key stages:
    1.  **Prompt Generation**: Automatically modify the prompts sent to the AI by creating regex scripts that target the **User Input** placement.
    2.  **Response Parsing**: Clean, reformat, or standardize the AI's raw response before it's saved by targeting the **AI Output** placement.
- **Multi-Select Support**: You can choose multiple scripts for outgoing and incoming processing.
- **How It Works**: Turn on `Use regex (advanced)` in STMB, click `📐 Configure regex…`, and select which scripts STMB should run before sending to AI and before parsing/saving the response.
- **Important**: Regex selection is controlled by STMB. Scripts selected there will run **even if they are currently disabled in the Regex extension itself**.

---

## 👤 Profile Management

![Profile Management](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/profiles.png)

A profile controls the connection and generation behavior used for memories.

- **Current SillyTavern Settings:** Uses the provider, model, temperature, and connection currently active in SillyTavern.
- **Saved STMB profiles:** Can use a different provider, model, temperature, prompt preset, title format, and lorebook-entry settings.
- **Import/Export:** Profiles can be shared or backed up as JSON.
- **Per-run overrides:** The confirmation window can temporarily change the profile, prompt, previous-memory count, and connection behavior for one memory.

### Custom OpenAI-compatible connections

For a profile using **Custom OpenAI-Compatible API**, you can either:

- use the currently active SillyTavern Custom connection; or
- bind the STMB profile to one named Custom connection profile from SillyTavern's Connection Manager.

A named connection supplies its saved URL and secret. The model entered in the STMB profile remains the model override. If the named connection is deleted or stops being a Custom Chat Completion profile, STMB blocks the request and asks you to repair the profile.

### Advanced routing controls

- **Skip structured output and use plain-text completion:** Avoids sending a structured-output schema to providers that reject it. The model must still return the valid JSON required by the selected memory prompt.
- **Use ST's ChatCompletionService:** Routes non-Full-Manual requests through SillyTavern's request helper. You may optionally apply a SillyTavern Chat Completion preset.
- **Use reverse proxy:** Forwards SillyTavern's configured reverse-proxy settings for supported providers.
- **Full Manual Configuration:** Sends directly to a separately entered endpoint and key. This is an exceptional setup; configure and test the connection in SillyTavern first whenever possible.

---

## ⚙️ Settings & Configuration

![Main settings panel 1](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/profile1.png)
![Main settings panel 2](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/profile2.png)
![Main settings panel 3](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/profile3.png)

### **Global Settings**
[Short video overview on Youtube](https://youtu.be/mG2eRH_EhHs)

- **Manual Lorebook Mode:** Enable to select lorebooks per chat.
- **Narrator Mode:** In a normal non-group chat, use one omniscient manual Memory Book plus one unique Memory Book per declared fictional character. Requires Manual Lorebook Mode.
- **Auto-create lorebook if none exists:** ⭐ *New in v4.2.0* - Automatically create and bind lorebooks using your naming template.
- **Lorebook Name Template:** Customize auto-created lorebook names with `{{char}}`, `{{user}}`, and `{{chat}}` placeholders.
- **Copy Memory Books when branching:** Give native chat branches independent copies of active unlocked Memory Books.
- **Allow Scene Overlap:** Permit or prevent overlapping memory ranges.
- **Always Use Default Profile:** Skip confirmation popups.
- **Show memory previews:** Enable preview popup to review and edit memories before adding to lorebook.
- **Show Notifications:** Toggle toast messages.
- **Memory boundary indicator:** Show a processed-boundary divider, a draggable jump button, both, or neither.
- **Refresh Editor:** Auto-refresh lorebook editor after memory creation.
- **Max Response Tokens:** Set the maximum generation length for memory summaries.
- **Token Warning Threshold:** Set warning level for large scenes.
- **Default Previous Memories:** Number of prior memories to include as context (0-7).
- **Auto-create memory summaries:** Enable automatic memory creation at intervals.
- **Auto-Summary Interval:** Number of messages after which to automatically create a memory summary.
- **Auto-Summary Buffer:** Delay auto-summary by a configurable number of messages.
- **Prompt for consolidation when a tier is ready:** Shows a yes/later confirmation when a selected summary tier has enough eligible source entries to consolidate.
- **Auto-Consolidation Tiers:** Choose one or more summary tiers that should trigger the confirmation prompt when ready. Currently supports Arc through Series.
- **Default After-Memory Side Prompt Sets:** Choose separate defaults for solo and group chats. Chats without an explicit override inherit the matching default; an empty default uses individually enabled Side Prompts.
- **Unhide hidden messages before memory generation:** Can run `/unhide X-Y` before creating a memory.
- **Auto-hide messages after adding memory:** Optionally hide all processed messages or just the most recent memory range.
- **Use regex (advanced):** Enables the STMB regex selection popup for outgoing/incoming processing.
- **Memory Title Format:** Choose or customize (see below).

![Profile configuration](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/Profile.png)

### **Profile Fields**
- **Name:** Display name.
- **API/Provider:** `Current SillyTavern Settings`, a supported provider, Custom OpenAI-compatible API, or Full Manual Configuration.
- **Custom Connection Profile:** For Custom API profiles, use the active ST connection or bind a named SillyTavern Custom connection profile.
- **Model:** Model ID. For a named Custom connection, this field remains the model override.
- **Temperature:** 0.0–2.0.
- **Prompt or Preset:** Built-in or custom Summary Prompt Manager preset.
- **Group Prompt Routing:** Optionally use separate group and character prompts in native group chats and Narrator Mode.
- **Structured Output:** Normally enabled; disable schema use only for providers that reject structured-output requests.
- **ChatCompletionService / Preset:** Optional SillyTavern request routing and Chat Completion preset.
- **Reverse Proxy:** Use SillyTavern's configured reverse proxy for supported providers.
- **Title Format:** Per-profile template.
- **Activation Mode:** Vectorized, Constant, Normal.
- **Position:** ↑Char, ↓Char, ↑EM, ↓EM, ↑AN, ↓AN, Outlet (and field name).
- **Order Mode:** Auto/manual.
- **Recursion:** Prevent recursion and delay until recursion.

---


## 🏷️ Title Formatting

![Title format](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/titleformat.png)
![Title formats](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/titleformats.png)

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

## 🧵 Context for Generation

STMB can provide two different forms of reference material when generating a new memory. They are not the same thing.

### Previous Memories

Previous memories are earlier STMB scene memories from the effective Memory Book.

- Include from 0 to 7 previous memories.
- They are labeled as read-only continuity context.
- The prompt explicitly tells the model not to summarize them again.
- The global **Default Previous Memories** setting supplies the normal count, and the memory confirmation window can override it for one run.

### Additional Context and Context Settings

**Additional Context** consists of selected lorebook entries used as reference material. Use it when memory generation needs stable information that may not appear in the current scene, such as character rules, setting facts, campaign constraints, terminology, or a canonical timeline.

Open **Context Settings** from Memory Books to create reusable named collections:

1. Create or edit a Context Setting.
2. Add entries from any available lorebook.
3. Put the entries in the order you want them sent.
4. Select that Context Setting for the current chat, or explicitly select **No Context**.

The selected Context Setting is stored per chat and can be used with **Current SillyTavern Settings** as well as custom profiles. Older profile-based Additional Context is migrated into reusable Context Settings. If a selected lorebook or entry later disappears, STMB warns and continues without that stale reference.

Additional Context appears before previous-memory context and the scene transcript. It is reference material, not another scene to summarize.

Side Prompts can also use Additional Context. Each Side Prompt can either follow the current chat's Context Setting or use one fixed named Context Setting.

### Memory Count Macros

STMB registers standard SillyTavern macros that report counts from the **effective main Memory Book**: the chat-bound book in Automatic Mode or the resolved manual Memory Book in Manual Mode.

| Macro | Count returned |
|---|---|
| `{{memtier0}}` | Scene Memories |
| `{{memtier1}}` | Arcs |
| `{{memtier2}}` | Chapters |
| `{{memtier3}}` | Books |
| `{{memtier4}}` | Legends |
| `{{memtier5}}` | Series |
| `{{memtier6}}` | Epics |
| `{{memclips}}` | Clip entries |
| `{{memside}}` | Side Prompt entries |

These macros return integers and can be used in STMB prompts and fields that expand standard SillyTavern macros. In a multiple-book group setup, they count the effective main group book, not every assigned character book combined.

---

## 🧾 Optional Job Queue (Chat Top Bar required)

![ST Memory Books Job Queue](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/queue.png)

The job queue is optional. You do not need it to use Memory Books.

If you install and enable **Chat Top Bar** / **Chat Top Info Bar**, STMB adds a **Memory Books Jobs** button to the top chat bar. This opens a queue drawer where you can see active, completed, failed, canceled, or review-needed Memory Books jobs.

This is especially useful when you are:

- creating memories from longer scenes
- running consolidation
- running Side Prompts after memory creation
- working in long chats where you want clearer progress and review handling

The queue can show job status, let you cancel active jobs, retry failed jobs, and dismiss completed jobs. If a queued job needs user review, STMB can mark it as **Needs review** instead of silently overwriting something unsafe.

Retry controls depend on the job type:

- **Retry** reruns a failed, blocked, or canceled non-memory job.
- **Retry All** reruns a memory job together with after-memory Side Prompt work that was canceled with it. If the memory itself was already saved, STMB can resume from that saved result instead of creating a duplicate.
- **Retry Memory** reruns or resumes only the memory and skips after-memory Side Prompts.

If Chat Top Bar is not installed or enabled, STMB still works normally. You just will not have the job queue UI.

### Installing Chat Top Bar

![How to install Chat Top Bar](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/install.png)

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
![Enable scene overlap](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/overlap2.png)

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

## Fork

An active fork of this extension lives at [phattbeats/SillyTavern-MemoryBooks-Auto](https://github.com/phattbeats/SillyTavern-MemoryBooks-Auto). It adds:

- Automatic scene-boundary detection (`Sentinel`).
- Paired-clip context entries (`Clipper+`).
- A chunked, resumable lorebook auditor.
- A living-lorebook injection pipeline that rewrites only the delta each turn.
- An "Auto Module" settings panel that bundles the above behind one toggle.

Settings key (`STMemoryBooks`) and lorebook flags (`stmemorybooks`, `[STMB Clip]`) are unchanged from upstream so chat data stays compatible. See [`README.fork.md`](./README.fork.md) for fork install + migration, [`CHANGELOG.fork.md`](./CHANGELOG.fork.md) for fork-specific changes, and [`FORK_NOTES.md`](./FORK_NOTES.md) for the merge map.

## Copyright and license

SillyTavern Memory Books is Copyright © 2024–2026 Aiko Hanasaki.

The original code in this repository is licensed under the GNU Affero
General Public License v3.0. Modified versions must preserve applicable
copyright and license notices, identify their modifications, and comply
with the AGPL's source-availability requirements.

See [LICENSE](./LICENSE).
