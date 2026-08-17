<!--
Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only
-->

# Memory Books: Complete AI Reference Manual

**Product:** SillyTavern Memory Books (STMB)  
**Reference version:** v8.5.0, August 1, 2026  
**Purpose:** A single, dense source of truth for an AI assistant that teaches, explains, and troubleshoots Memory Books.

---

## Table of Contents

- [1. How an AI Assistant Should Use This Manual](#1-how-an-ai-assistant-should-use-this-manual)
- [2. Product Definition and Mental Model](#2-product-definition-and-mental-model)
- [3. Core Vocabulary and Feature Selection](#3-core-vocabulary-and-feature-selection)
- [4. Requirements, Installation, and Initial Verification](#4-requirements-installation-and-initial-verification)
- [5. Opening Memory Books and Understanding the Main Panel](#5-opening-memory-books-and-understanding-the-main-panel)
- [6. Memory Book Storage Modes](#6-memory-book-storage-modes)
- [7. Profiles, Connections, and Generation Routing](#7-profiles-connections-and-generation-routing)
- [8. Scenes, Manual Memories, Automatic Memories, and Catch-Up](#8-scenes-manual-memories-automatic-memories-and-catch-up)
- [9. Token Saving, Hidden Messages, and the Memory Boundary](#9-token-saving-hidden-messages-and-the-memory-boundary)
- [10. Lorebook Activation and Retrieval](#10-lorebook-activation-and-retrieval)
- [11. Real Group Chat Mode](#11-real-group-chat-mode)
- [12. Narrator Mode](#12-narrator-mode)
- [13. Branching Chats](#13-branching-chats)
- [14. Clips](#14-clips)
- [15. Topical Clips](#15-topical-clips)
- [16. Side Prompts](#16-side-prompts)
- [17. Consolidation](#17-consolidation)
- [18. Compaction](#18-compaction)
- [19. Regeneration](#19-regeneration)
- [20. Context for Generation](#20-context-for-generation)
- [21. Prompt Architecture, Built-in Summary Prompts, and Authoring Rules](#21-prompt-architecture-built-in-summary-prompts-and-authoring-rules)
- [22. Summary Prompt Manager and Consolidation Prompt Manager](#22-summary-prompt-manager-and-consolidation-prompt-manager)
- [23. Regex Integration](#23-regex-integration)
- [24. Lorebook Entry Titles and Character Policy](#24-lorebook-entry-titles-and-character-policy)
- [25. Job Queue and Retry Controls](#25-job-queue-and-retry-controls)
- [26. Visual Feedback and Accessibility](#26-visual-feedback-and-accessibility)
- [27. Settings Map and Current Settings Reference](#27-settings-map-and-current-settings-reference)
- [28. Slash Command Reference](#28-slash-command-reference)
- [29. Troubleshooting by Stage](#29-troubleshooting-by-stage)
- [30. FAQ](#30-faq)
- [31. Compatibility, Migration, and Current Historical Notes](#31-compatibility-migration-and-current-historical-notes)
- [32. Developer and License Notes](#32-developer-and-license-notes)
- [33. Compact Diagnostic Decision Tree](#33-compact-diagnostic-decision-tree)
- [34. Minimum Recommended Teaching Sequence](#34-minimum-recommended-teaching-sequence)
- [35. Final Concept Summary](#35-final-concept-summary)

---

## 1. How an AI Assistant Should Use This Manual

Treat this document as the current operational reference for Memory Books. It replaces the need to load the separate Start Here guide, README, User Guide, Side Prompts guide, How STMB Works guide, and historical changelog as independent knowledge files.

Terms: 

- STMB = SillyTavern=MemoryBooks (this extension)
- ST = SillyTavern (base code that STMB extends)

When answering users:

1. Preserve Memory Books terminology exactly. A **Memory Book** is a SillyTavern lorebook used by STMB; it is not a separate database format.
2. Distinguish current behavior from historical behavior. Do not teach a removed or superseded workflow merely because it appeared in an old changelog.
3. Distinguish **Group Chat Mode** from **Narrator Mode**. They solve different problems.
4. Distinguish memory **generation**, lorebook **storage/configuration**, and later **retrieval by SillyTavern**. Activation/retrieval is part of base ST code. 
5. Do not invent controls, menu labels, provider behavior, or settings not described here.
6. When a screenshot is supplied, identify only visible controls. Give the next immediate action rather than assuming an off-screen control exists.
7. When troubleshooting, identify the first failed stage and test it before recommending prompt rewrites.
8. Prefer a simple working configuration before advanced routing, multiple books, custom prompts, Regex, or Side Prompt automation.
9. Explain that character filters and separate Memory Books improve routing and relevance; they are not a security boundary.
10. State uncertainty when the user’s installed version, SillyTavern version, provider, or custom prompt may differ.

### Current-document notes

Narrator Mode is implemented in v8.5.0.

Several beginner documents said a manual memory was technically required before automatic memories could begin. Current STMB can create the first automatic memory from message 0 when no processed-message baseline exists. A first manual memory is still recommended because it verifies the connection, Memory Book, output format, and desired starting boundary before automation is trusted.

---

## 2. Product Definition and Mental Model

Memory Books is a SillyTavern extension that converts selected or automatically chosen chat ranges into structured memory entries stored in SillyTavern lorebooks.

The basic process is:

```text
Chat messages
    ↓
STMB selects or receives a message range
    ↓
STMB assembles an AI request
    ↓
The model returns a structured memory
    ↓
STMB saves a lorebook entry
    ↓
Old processed chat messages may be hidden from active context
    ↓
SillyTavern later activates relevant lorebook entries
    ↓
The chat model receives those entries as context
```

STMB does not give a model permanent internal memory. It maintains an external reference system (lorebook entries). The chat model “remembers” when SillyTavern includes the relevant lorebook entries in the prompt to the AI.

### The three separate stages

1. **Generation quality** — Did the memory-generation model produce an accurate, useful result?
2. **Storage and configuration** — Was the result saved to the intended Memory Book with appropriate activation settings?
3. **Retrieval and model use** — Did SillyTavern activate and send the entry, and did the chat model use it correctly?

Troubleshoot these stages separately.

### Lorebooks and Memory Books

A **lorebook**, also called **World Info** in parts of SillyTavern, is a collection of entries that SillyTavern can conditionally add to a model request. A lorebook entry normally has:

- a title/comment;
- content;
- activation keywords or another activation mode;
- insertion position and order;
- recursion and budget controls;
- optional character filters and other metadata.

A **Memory Book** is an ordinary SillyTavern lorebook used by STMB. It can be opened, edited, reordered, exported, imported, or deleted with normal lorebook tools. Depending on the features used, it may contain:

- scene Memories;
- Arc, Chapter, Book, Legend, Series, or Epic summaries;
- Clip and Topical Clip entries;
- Side Prompt tracker entries;
- other STMB-managed entries.

### Memory entries are compressed context

A scene Memory is not the original transcript. It is a compressed representation intended to preserve continuity-relevant information such as:

- events and consequences;
- decisions and plans;
- discoveries and reveals;
- relationship or emotional changes;
- individual knowledge, beliefs, or misunderstandings;
- important objects, locations, identities, promises, and constraints.

Hiding processed messages does not delete them. It prevents those messages from being sent to the AI and therefore continuing to consume active chat-history context. 

---

## 3. Core Vocabulary and Feature Selection

| Need | Feature | Meaning |
|---|---|---|
| Summarize one selected or automatic chat range | **Memory** | “Remember what happened in this scene.” |
| Save selected chat wording or one fact | **Clip** | “Save this note.” |
| Gather facts about one subject from saved Memories | **Topical Clip** | “Gather everything my Memories say about this.” |
| Maintain changing information over repeated runs | **Side Prompt** | “Keep this tracker updated.” |
| Combine several lower-tier Memories or summaries | **Consolidation** | “Roll these entries into a higher-level recap.” |
| Shorten one existing STMB-managed entry | **Compaction** | “Trim this entry without losing its facts.” |
| Replace an existing entry using its original sources | **Regeneration** | “Rebuild this entry and review a replacement.” |

### Feature distinctions that users commonly confuse

- **Clip vs Topical Clip:** A Clip starts with text highlighted in the current chat. A Topical Clip starts with existing confirmed STMB Memories.
- **Topical Clip vs Side Prompt:** A Topical Clip is run manually to gather a topic. A Side Prompt can repeatedly maintain a changing tracker.
- **Compaction vs Consolidation:** Compaction rewrites one entry. Consolidation creates a new higher-tier summary from several entries.
- **Memory vs Side Prompt:** Memories are normally sequential scene records. Side Prompts usually update or overwrite one continuing support document.
- **Generation vs retrieval:** Creating an entry does not guarantee that SillyTavern later activates it.

---

## 4. Requirements, Installation, and Initial Verification

### Requirements

- SillyTavern 1.18.0 or later; the latest compatible release is recommended.
- A working AI connection.
- A model capable of following instructions and, for Memory and Consolidation workflows, returning valid JSON.
- Permission to install third-party SillyTavern extensions.
- A Chat Completion preset available in SillyTavern when using a local or Text Completion backend through an OpenAI-compatible Chat Completion endpoint.

### Normal Chat Completion users

OpenAI, Anthropic/Claude, OpenRouter, Gemini/Google, and other Chat Completion connections can normally use the built-in **Current SillyTavern Settings** profile.

### Local and Text Completion users

KoboldCpp, llama.cpp, TextGen, Ollama, and similar backends generally work most reliably when exposed through an OpenAI-compatible Chat Completion endpoint. Even when normal roleplay uses Text Completion, SillyTavern must have a Chat Completion preset available for STMB.

Typical KoboldCpp setup:

- API type: Chat Completion;
- source: Custom OpenAI-compatible;
- endpoint such as `http://localhost:5001/v1` or `http://127.0.0.1:5000/v1`;
- any nonblank custom API key if SillyTavern requires one;
- model ID in the endpoint’s expected format, commonly `koboldcpp/modelname`, without an unnecessary `.gguf` suffix;
- Chat Completion preset imported;
- response length at least 2048 tokens, with 4096 often safer.

Typical llama.cpp setup:

- API type: Chat Completion;
- source: Custom OpenAI-compatible;
- endpoint `http://localhost:8080/v1`, or `http://host.docker.internal:8080/v1` when SillyTavern runs in Docker;
- any nonblank API key if required by SillyTavern;
- the served model ID;
- no prompt post-processing unless the endpoint requires it.

Example server command:

```sh
llama-server -m <model-path> -c <context-size> --port 8080
```

### Optional Chat Top Bar

STMB works without Chat Top Bar / Chat Top Info Bar. Installing it adds the **Memory Books Jobs** queue interface for active, completed, failed, canceled, blocked, and review-needed work.

### Installation

1. Open SillyTavern.
2. Open the main **Extensions** panel.
3. Choose **Install Extension**.
4. Install the official Memory Books repository.
5. Reload SillyTavern if prompted.
6. Open a character chat or group chat.
7. Wait several seconds for STMB controls to initialize.

SillyTavern Extras is not required.

### Confirm that STMB loaded

At least one of these should appear:

- **Memory Books** in the magic-wand Extensions menu beside the chat input;
- scene chevrons **►** and **◄** in expanded message actions.

If neither appears:

1. wait up to ten seconds;
2. refresh the page;
3. verify that the extension is installed and enabled;
4. reopen a character or group chat;
5. inspect the browser console only after the basic checks fail.

---

## 5. Opening Memory Books and Understanding the Main Panel

Open the magic-wand Extensions menu near the chat input, then choose **Memory Books**.

The panel can include:

- Current Scene;
- Memory Status / highest processed message;
- Current Lorebook Configuration;
- Memory Profiles;
- Profile Actions;
- Extra Function Buttons;
- Prompt Managers;
- General Settings;
- Automatic Memories;
- Token Saving;
- Group-character or Narrator controls when relevant.

For a first Memory, only three decisions are required:

1. Which Memory Book will receive the entry?
2. Which profile/connection will generate it?
3. Which chat messages are the scene?

---

## 6. Memory Book Storage Modes

### 6.1 Automatic Mode: chat-bound Memory Book

Automatic Mode is the normal default. STMB uses the lorebook bound to the current chat through SillyTavern.

Use it when:

- one chat has one primary Memory Book;
- minimal configuration is preferred;
- group characters do not need separate Memory Books.

If no lorebook is bound, bind one in SillyTavern or use Auto-Create.

### 6.2 Auto-Create Lorebook Mode

Enable **Auto-create lorebook if none exists** to let STMB create and bind a lorebook when a Memory is first saved.

The default naming template can use:

- `{{char}}` — character or group name;
- `{{user}}` — user name;
- `{{chat}}` — chat ID/name.

STMB adds numeric suffixes when necessary to avoid duplicate names.

Auto-Create and Manual Lorebook Mode are mutually exclusive.

### 6.3 Manual Lorebook Mode

Enable **Manual Lorebook Mode** to choose a Memory Book independently of the lorebook bound to the chat.

Use it when:

- memories must live in a dedicated lorebook;
- multiple chats intentionally share one Memory Book;
- group members need separate books;
- Narrator Mode is used;
- the user understands the resulting activation plan.

The main manual Memory Book selection is stored for the current chat unless a persistent character lock overrides it in a compatible solo chat.

### 6.4 Separate Memory Books are usually clearer

A dedicated Memory Book makes it easier to:

- separate memories from character definitions and setting lore;
- set an independent lorebook budget and order;
- reuse or export memory history;
- inspect STMB-managed entries without unrelated lore;
- diagnose activation.

It is a recommendation, not a requirement.

### 6.5 Character Memory Book locks

A character Memory Book lock is a persistent Manual Mode assignment attached to a character card.

In a solo chat:

- an unlocked manual book belongs to the current chat;
- a locked book follows the character card across compatible Manual Mode chats;
- the manual book cannot be changed until the lock is removed.

In a real group chat:

- an unlocked per-character assignment belongs to the current group chat;
- a locked per-character assignment follows that character card into compatible Manual Mode groups;
- a missing locked book produces a broken-lock state that must be unlocked or repaired.

Use locks only when the same character should intentionally share one continuing Memory Book across stories. They are dangerous for alternate universes or unrelated timelines.

### 6.6 Recommended starting layout

- Solo chat: one chat-bound or auto-created Memory Book.
- Real group chat: one group Memory Book.
- Narrator chat: one omniscient Memory Book plus one unique book per declared character, as required by Narrator Mode.

---

## 7. Profiles, Connections, and Generation Routing

A Memory Books profile controls both generation and the resulting lorebook-entry settings.

### 7.1 Recommended first profile

Use **Current SillyTavern Settings** first. It uses the provider, model, and temperature currently active in SillyTavern.

Do not begin by rewriting prompts or configuring a Full Manual endpoint. First prove that one Memory can be generated and saved.

### 7.2 Why create a saved STMB profile

Create a separate profile when the user needs to:

- use a cheaper or more reliable model for memories;
- use a different provider from roleplay;
- bind a named Custom connection;
- choose a custom summary prompt;
- use different temperature or maximum output behavior;
- change title formatting;
- change activation, insertion, order, or recursion settings;
- use separate group/omniscient and character-focused prompts.

### 7.3 Profile fields

A profile may include:

- display name;
- API/provider;
- model ID;
- temperature;
- Summary Prompt preset;
- optional separate multi-character prompts;
- structured-output behavior;
- optional SillyTavern ChatCompletionService routing;
- optional Chat Completion preset;
- reverse-proxy behavior;
- title format;
- activation mode: Normal, Constant, or Vectorized;
- insertion position, including character, example-message, author’s-note, and Outlet positions;
- Outlet name when applicable;
- automatic or manual order value;
- Prevent Recursion;
- Delay Until Recursion.

### 7.4 Named Custom OpenAI-compatible connections

A Custom OpenAI-compatible profile can:

- use the currently active SillyTavern Custom connection; or
- bind one named Custom connection from SillyTavern’s Connection Manager.

The named connection supplies its saved URL and secret. The model field in the STMB profile remains the model override. If the named connection is deleted or ceases to be a Custom Chat Completion connection, STMB blocks the request rather than silently routing elsewhere.

### 7.5 Structured-output fallback

**Skip structured output and use plain-text completion** prevents STMB from sending a structured-output schema to providers that reject it. The model must still return the valid JSON demanded by the selected Memory or Consolidation prompt.

### 7.6 ChatCompletionService

**Use ST’s ChatCompletionService** routes supported profile requests through SillyTavern’s request helper and can apply a selected SillyTavern Chat Completion preset. OpenRouter requests also inherit SillyTavern’s provider order, quantization filters, fallback controls, and middle-out routing setting. These OpenRouter controls remain in force if ChatCompletionService fails and STMB retries through its fallback request path. If that retry also fails, STMB retains and reports both the initial ChatCompletionService error and the fallback provider response. Full Manual profiles do not use this route.

### 7.7 Reverse proxy and Full Manual Configuration

**Use reverse proxy** forwards SillyTavern’s configured reverse-proxy details for supported providers.

**Full Manual Configuration** stores a separate endpoint and key inside the STMB profile. It is an exceptional path. Prefer a provider or Custom connection configured and tested in SillyTavern whenever possible.

### 7.8 Output length

The global STMB maximum response-token setting can override normal Chat Completion output length for Memory Books work. Cut-off JSON is a common reason for failed generation. Increase output length before weakening the schema or prompt.

---

## 8. Scenes, Manual Memories, Automatic Memories, and Catch-Up

### 8.1 What a scene is

A **scene** is the inclusive chat-message range STMB processes into one Memory.

Useful boundaries normally contain one coherent unit:

- an event;
- a conversation;
- an investigation step;
- an emotional or relationship development;
- a location or goal change;
- a connected action sequence.

Very small trivial ranges may produce little value. Very large ranges cost more, are harder to summarize, may exceed context, and often combine unrelated events.

### 8.2 Mark a scene manually

1. Expand the message actions, usually through a three-dot or similar control.
2. Click **►** on the first included message.
3. Click **◄** on the last included message.
4. Open Memory Books and verify the displayed start, end, speakers, message count, and token estimate.

Both boundary messages are included.

Use **Clear Scene** to remove the selection, or choose another start/end marker to replace one boundary.

### 8.3 Create a manual Memory

1. Verify the scene.
2. Verify the effective Memory Book.
3. Verify the selected profile.
4. Click **Create Memory**, or use `/creatememory`.
5. Review confirmation, token warning, participant confirmation, or preview windows when shown.
6. Approve the result.
7. Confirm that a new lorebook entry exists and that Memory Status advanced to the end of the scene.

A valid Memory result normally contains:

- a title;
- content;
- keywords;
- STMB metadata, including source range and chat identity.

### 8.4 Memory previews

When **Show memory previews** is enabled, review and optionally edit:

- title;
- memory content;
- keywords.

Check names, attribution, facts, omitted consequences, and unrelated commentary. Without previews, a valid result is saved automatically.

### 8.5 Automatic Memories

Enable **Auto-create memory summaries** and configure:

- **Auto-Summary Interval** — number of new messages processed per automatic Memory;
- **Auto-Summary Buffer** — newest messages left out so an unfolding scene is not summarized too early.

Example:

```text
Interval: 30
Buffer: 2
```

STMB waits until at least 32 messages exist beyond the processed boundary, then creates a Memory ending two messages before the newest message.

If no processed baseline exists, current STMB treats the baseline as `-1` and can begin at message 0. A manual first Memory remains recommended for setup validation and for choosing a deliberate starting point.

Lower intervals create more focused Memories and more requests. Higher intervals create fewer, larger Memories with a greater risk of combining unrelated material. A practical starting range is approximately 20–40 messages for detailed roleplay and 40–60 for shorter, faster exchanges.

Automatic generation can be postponed when a required Memory Book is not yet assigned.

### 8.6 Processed-message baseline

STMB stores the highest processed message for each chat. It determines:

- where `/nextmemory` starts;
- where automatic Memories start;
- the memory-boundary indicator;
- which messages count as already processed.

Use:

- `/stmb-highest` to display it;
- `/stmb-set-highest <N>` to set it manually;
- `/stmb-set-highest none` to clear it.

Manual changes should be deliberate because they can cause skipped or repeated ranges.

### 8.7 Catch-up for an existing long chat

Use:

```text
/stmb-catchup interval=<chunk size> start=<first message id> end=<last message id>
```

Example:

```text
/stmb-catchup interval=40 start=0 end=245
```

The range is inclusive. Chunks are processed consecutively; the final chunk may be smaller.

Catch-up is intentionally non-interactive. Before running it:

- select and test the intended profile;
- enable **Always use default profile**;
- disable **Show memory previews**;
- ensure the effective Memory Book exists, or permit Auto-Create in Automatic Mode;
- repair all required multi-character book assignments;
- choose a chunk size below the token-warning threshold.

STMB preflights every chunk, processes in order, and stops on the first failure or `/stmb-stop`. Completed earlier chunks remain saved. Resume from the first unfinished message rather than repeating the whole range.

Use catch-up for broad conversion. Manual scene boundaries remain better when literary or event boundaries matter.

---

## 9. Token Saving, Hidden Messages, and the Memory Boundary

### 9.1 Hiding is not deleting

Hidden messages remain in the chat file. They are omitted from active chat context until revealed again.

### 9.2 Auto-hide modes

**Auto-hide messages after adding memory** can be:

- Do not auto-hide;
- Auto-hide all messages up to the last Memory;
- Auto-hide only messages in the last Memory.

**Messages to leave unhidden** preserves a small recent overlap near the boundary.

### 9.3 Unhide before generation

**Unhide hidden messages for memory generation** reveals a selected range before STMB compiles it. Use this when regenerating or reprocessing ranges that were previously hidden. The selected auto-hide mode determines what is hidden again after a successful save.

### 9.4 Memory-boundary indicator

The indicator uses the highest processed message to show where processed history ends and unprocessed chat begins.

Modes:

- Off;
- Memory boundary divider;
- draggable jump button;
- divider plus jump button.

The jump button scrolls toward the first unprocessed message and remembers its dragged position.

### 9.5 Good learning configuration

A practical initial setup is:

- show the boundary divider and jump button;
- leave two messages unhidden;
- enable temporary unhide for generation;
- use no auto-hide until the user has confirmed that a Memory was saved correctly;
- then switch to hiding all processed messages for the main token-saving benefit.

---

## 10. Lorebook Activation and Retrieval

### 10.1 Keywords

Normal Memories are commonly keyword-triggered. Good keywords are concrete and distinctive:

- character names and aliases;
- named locations or organizations;
- important objects;
- event names;
- identifiers;
- specific discoveries or actions.

Weak keywords such as `important event`, `conversation`, or `secret` are too broad.

The memory content determines what the model learns. Keywords help determine when SillyTavern retrieves it.

### 10.2 Activation modes

- **Normal:** keyword/rule-driven activation.
- **Constant:** always active, subject to applicable budget and entry controls.
- **Vectorized:** uses vector-related retrieval when the user’s setup supports it.

Vectors are optional. STMB works through keywords without the Vectors extension.

### 10.3 Recommended global World Info settings

Common starting recommendations:

- Match Whole Words: off;
- Scan Depth: relatively high, such as 8;
- Max Recursion Steps: approximately 2;
- Context percentage: sized to the user’s total context and competing prompt material.

These are recommendations, not hard requirements.

### 10.4 Delay Until Recursion

If the Memory Book is the only active lorebook/World Info source, leave **Delay Until Recursion** disabled. Otherwise no entry may start the first recursion cycle and the Memory may never activate.

### 10.5 Diagnosing retrieval

When an AI “does not remember”:

1. Verify that the entry exists.
2. Verify that the correct Memory Book is active for the chat.
3. Verify that the entry is enabled.
4. Verify that keywords or activation mode match the current conversation.
5. Verify that the lorebook budget is sufficient.
6. Verify recursion settings.
7. Use a World Info inspection tool or request log to confirm whether the entry was actually sent.
8. If it was sent but ignored, the remaining problem is model behavior or competing context, not STMB storage.

---

## 11. Real Group Chat Mode

### 11.1 Definition

Group Chat Mode applies to a real SillyTavern group containing two or more separate character cards.

```text
SillyTavern Group
├── Alice character card
├── Bob character card
└── Clara character card
```

SillyTavern records which card authored each message, so STMB can preserve speaker attribution and detect participating group members.

No separate Group Chat Mode switch is required. Open a group chat and use STMB normally.

### 11.2 Participant detection

A detected participant is normally a character card that authored at least one message inside the selected scene.

STMB does not infer every person physically present from prose. Therefore:

- a silent observer may not be detected;
- a merely mentioned character is not a participant;
- an absent character discussed by the group is not selected;
- the user is not treated as a separate group-character Memory Book target;
- duplicate or unusual speaker identities may need correction.

If automatic participant detection finds no group characters, STMB opens the participant confirmation even when automatic acceptance is enabled. The warning explains that detection failed and requires the user to review which group characters were present before proceeding.

The participant prompt means: **Which group characters should this Memory be associated with?** It does not prove who knew every fact or who was physically present.

### 11.3 One group Memory Book

This is the recommended starting layout.

Use Automatic Mode, Auto-Create, or a main Manual Mode book. Each scene produces one canonical entry in the group Memory Book. When participant names are available, the entry can receive an inclusive SillyTavern character filter.

An inclusive filter for Alice and Bob means the entry can activate when Alice **or** Bob is active. It does not create a synthetic “Alice and Bob” character or a separate subset book.

One group book is best when:

- the cast mostly shares one story;
- one omniscient/group-oriented summary is sufficient;
- minimal setup and fewer duplicate entries are preferred;
- STLO is not needed.

A single group Memory can still preserve asymmetric knowledge:

> Alice found the transmitter and hid it. Bob believed the room was empty.

### 11.4 One group book plus per-character books

The advanced real-group layout uses:

- one canonical group Memory Book;
- one assigned character Memory Book for each group member.

Requirements:

- Manual Lorebook Mode;
- SillyTavern-LorebookOrdering (STLO) installed and enabled;
- a valid assignment for every required group member.

The canonical group book cannot also be a character book. More than one character may share the same character book; STMB writes one copy to that shared book rather than duplicates.

When a Memory is saved:

1. the canonical version is written to the group book;
2. participant selection is confirmed unless automatic acceptance is enabled;
3. linked copies are written to selected participant books;
4. STMB rolls back partial writes when possible if one required save fails.

Selecting no participants in the real-group participant confirmation applies the Memory to every current group member.

### 11.5 Separate group and character prompts

By default, the same group-oriented Memory is copied to participant books.

A profile can enable **Use separate group and character prompts in group chats**. Then:

- the Group Summary Prompt writes the canonical group version;
- the Character Summary Prompt writes an individualized version for each single-character target book.

Character-focused versions can preserve:

- private knowledge;
- mistaken beliefs;
- personal emotional reactions;
- relationship-specific priorities;
- what mattered to one participant.

This requires additional AI requests. A shared character book receives one shared copy rather than one duplicate per assigned character.

### 11.6 STLO responsibilities

Memory Books decides:

- scene range;
- participants;
- summary content;
- which books receive copies;
- whether individualized prompts are used.

STLO decides:

- when a lorebook is active;
- which character can activate it;
- priority, position, budget, and ordering.

When STMB assigns a character book, it adds the character’s avatar basename to `stlo.characterOverrides` and enables `stlo.onlyWhenSpeaking`, while preserving existing STLO priorities, budgets, and overrides.

STMB uses merge-only behavior. Clearing or changing an assignment does not automatically remove the old STLO character override. Remove obsolete overrides in STLO manually.

### 11.7 Filters and books are not privacy controls

Separate books and filters improve relevance. They do not guarantee that:

- one character can never receive another character’s information;
- the model never sees the canonical group version;
- previous-memory context is perfectly knowledge-partitioned;
- a character book represents only conscious knowledge.

Use them as context-routing tools, not as security boundaries.

### 11.8 Linked copies are not live-synchronized

Linked entries share metadata that lets STMB recognize the same original event, but later edits are independent.

Editing, deleting, or compacting one copy does not automatically change the others. Regenerating a character copy also changes only that copy. When regenerating the canonical group entry, however, STMB asks whether to regenerate only that entry or regenerate it together with all linked character entries. Each selected entry receives its own generation and approval review, so character-focused prompts remain character-focused.

### 11.9 Adding, removing, or reassigning group members

Adding a character:

- assign a valid book before the next distributed Memory;
- old Memories are not copied retroactively;
- old filters are not rewritten;
- manually provide historical context if needed.

Removing a character:

- existing entries remain;
- old filters and STLO overrides remain;
- linked copies are not deleted automatically.

Changing a character’s book:

- changes future routing;
- does not necessarily remove that character from the old book’s STLO overrides.

### 11.10 Group consolidation

The canonical group book uses the automatic group-chat consolidation analysis prompt, which aims for an omniscient chronology while distinguishing objective events from individual knowledge.

Character books use the consolidation preset selected in the popup. Books may have different numbers of eligible sources. A book without enough material can be skipped with a warning while ready books continue.

A missing scene in a character book is a chronology gap. It does not prove absence, ignorance, or unconsciousness. A shared character book receives one consolidated entry.

---

## 12. Narrator Mode

### 12.1 Definition

Narrator Mode is for a normal one-on-one SillyTavern chat where one Narrator character card writes multiple fictional characters.

```text
Normal SillyTavern Chat
└── Narrator card
    ├── writes Alice
    ├── writes Bob
    └── writes Clara
```

Without Narrator Mode, SillyTavern sees all AI responses as authored by the Narrator card. Narrator Mode supplies a manual cast model so STMB can associate scenes and Memory Books with fictional characters inside the Narrator’s prose.

Narrator Mode is not available inside a real SillyTavern group chat.

### 12.2 Required storage layout

Narrator Mode requires:

- Manual Lorebook Mode;
- one selected **omniscient/canonical Memory Book**;
- one unique Memory Book for every declared cast member.

Rules:

- a cast member cannot use the omniscient book;
- two cast members cannot share the same book;
- every declared member must have an available book;
- retired members retain their identity and reserved book assignment until restored or otherwise removed by the implementation;
- Auto-Create is incompatible because Narrator Mode depends on Manual Lorebook Mode.

Unlike the advanced real-group layout, Narrator Mode does not require STLO for active-character retrieval. STMB injects the selected cast members’ books into the active lorebook context during generation.

### 12.3 Setup

1. Open the Narrator card’s normal chat.
2. Enable Manual Lorebook Mode.
3. select the main manual book; this is the omniscient Memory Book.
4. Enable **Narrator Mode**.
5. Open **Manage Narrator Cast**.
6. Add each fictional character by name and assign a unique Memory Book.
7. Use the floating **Active Cast** drawer to select characters present in the next exchange.

Narrator Mode must be disabled before Manual Lorebook Mode can be disabled.

### 12.4 Active Cast drawer and timeline metadata

The floating Active Cast drawer can be expanded, collapsed, moved, and used to select current cast members.

At generation time, STMB snapshots the active cast and stores it in message metadata:

- the user message receives the active-cast snapshot;
- the Narrator response receives the generation snapshot;
- a continuation merges its cast with existing cast metadata;
- swipe metadata is stored separately for each swipe;
- selecting a swipe can restore the active cast from that timeline point;
- deleting recent messages can restore cast state from the latest remaining tagged Narrator message.

The cast marker records association, not a semantic analysis of prose.

### 12.5 Retrieval during normal Narrator generation

When a Narrator generation starts, STMB loads the Memory Books of the active cast and merges their entries into the character-lore collection used for that request, avoiding duplicate world/UID pairs.

Consequences:

- only active-cast books are added by this Narrator workflow;
- the omniscient book still follows its normal Manual Mode activation/configuration;
- per-character STLO filters are not required for Narrator Mode;
- cast selection must be correct before generation if the correct character books are expected in context.

### 12.6 Scene participant detection

For a selected scene, tagged Narrator responses are authoritative. STMB combines the cast IDs stamped on Narrator-authored messages.

If the scene contains untagged legacy Narrator messages, STMB falls back to continuity information from all messages and asks the user to confirm the scene cast. Current active cast members are preselected. An empty selection means no individual cast members were present.

This confirmation is specifically for legacy or incomplete cast metadata; fully tagged scenes do not need it.

### 12.7 Memory distribution

A Narrator scene Memory is written as:

- one canonical omniscient entry in the main Memory Book;
- one linked copy in each selected participant’s unique Memory Book.

Narrator copies do not use native SillyTavern character filters. Instead, STMB stores Narrator participant and owner IDs in entry metadata.

If separate multi-character prompts are disabled, participant books receive copies of the omniscient summary. If enabled, each single-character book can receive a character-focused generation.

### 12.8 Narrator consolidation and regeneration

Narrator ownership and participant metadata are carried through consolidation sources. This lets higher-tier entries retain which character book owns a copy and which cast members participated in the underlying material.

Regeneration uses this metadata to determine whether the replacement prompt target is omniscient/group-oriented or character-focused.

As with real-group copies, linked Narrator entries are not live-synchronized after creation.

### 12.9 Retiring cast members

The cast manager can mark a member retired and later restore them. Retired members:

- are removed from active-cast choices;
- are removed from the active-cast ID set;
- keep stable identity/history metadata;
- retain their book reservation, preventing accidental reuse that would merge identities.

Use retirement for a character who leaves the active cast but whose historical Memory identity must remain intact.

---

## 13. Branching Chats

SillyTavern native branches can become different continuities. If a branch and its parent write into the same unlocked Memory Books, contradictory timelines can mix.

**Copy Memory Books when branching** is enabled by default.

### 13.1 What is copied

When STMB recognizes a newly created native branch:

- Automatic Mode copies the active chat-bound Memory Book;
- Manual Mode copies the main manual Memory Book;
- a Manual Mode real group copies each unique unlocked character Memory Book;
- Narrator Mode copies the omniscient book and each declared character book;
- persistent real-character locks are preserved instead of copied because a lock means “continue using this same book.”

All books copied in one branch operation use the same available lineage number:

```text
Group Memories Branch 1
Alice Memories Branch 1
Bob Memories Branch 1
```

Branching from an existing branch retains the original lineage root rather than producing names like `Branch 1 Branch 1`.

### 13.2 Rewritten metadata

Inside the copies, STMB:

- rewrites matching parent chat IDs to the new branch chat ID;
- redirects canonical group/character links when both linked books were copied;
- updates the new branch’s bindings to point to the copies.

It clones existing contents; it does not regenerate Memories.

### 13.3 Failure safety

Do not switch chats while branch copying is in progress.

If copying fails, STMB clears the new branch’s inherited writable bindings and records the failure so the branch cannot silently write into the parent’s originals.

### 13.4 Disabling branch copies

Disable the setting only when the branch is intentionally meant to share the same Memory Books and continuing history as the parent.

---

## 14. Clips

A Clip saves selected chat text directly into a `[STMB Clip]` lorebook entry. It does not call an AI model.

### 14.1 Use Clips for

- a preference;
- a promise or secret;
- a name or alias;
- an item or pet;
- a short relationship fact;
- a line that should be preserved exactly or nearly exactly;
- a quick “note to self” that does not justify a scene Memory.

### 14.2 Workflow

1. Highlight text inside a chat message.
2. Click the floating scissors button.
3. Choose an existing Clip entry or create a new one.
4. Choose always-active or keyword-triggered behavior for a new entry.
5. Review the current entry and updated preview.
6. Rename if needed.
7. Save.

The floating scissors button appears only after chat text is selected and can be disabled in the main panel.

### 14.3 Entry format

Title:

```text
Seraphina Healed Me [STMB Clip]
```

Content:

```markdown
=== Seraphina Healed Me ===

- Seraphina healed the user’s wounds with magic.

=== END Seraphina Healed Me ===
```

One Clip entry has one section. Focused titles support focused activation keywords.

### 14.4 Existing entries

An existing entry can be treated as a Clip entry by adding `[STMB Clip]` to the end of its title. Long Clip entries can be edited manually or compacted.

Clips save only the chosen text. They do not add source attribution automatically.

---

## 15. Topical Clips

A Topical Clip reads confirmed STMB Memory entries, an explicit range of messages from the current chat, or both, and asks an AI to produce a focused “about this topic” entry. Eligible Memory sources can include scene Memories and consolidated summaries; Clip and Side Prompt entries are excluded as sources.

### 15.1 Use Topical Clip when

Information about one subject is spread across several Memories, for example:

- a recurring NPC;
- a relationship history;
- a location or faction;
- an investigation or mystery;
- powers, injuries, promises, preferences, or secrets;
- an important object;
- an unresolved plot thread.

Topical Clip is organized by subject, not by the chronology of every source Memory.

### 15.2 Source restrictions

Topical Clip uses:

- confirmed STMB Memory entries from the selected source book, including eligible consolidated summaries.
- visible messages from an explicitly selected inclusive `X-Y` range in the current chat.

The **Include saved Memories** and **Include chat messages** controls can be used separately or together. Message ranges follow the global unhide-before-memory setting and restore previously hidden messages after compilation.

It does not use:

- chat messages outside the selected range;
- ordinary Clip entries;
- Side Prompt entries;
- unrelated ordinary lorebook entries.

### 15.3 Create a Topical Clip

1. Open Memory Books.
2. Click **Topical Clip**.
3. Choose the source Memory Book.
4. Enter the topic.
5. Enter activation keywords, or leave them blank to use the topic.
6. Choose a new entry or an existing `[STMB Clip]` update target.
7. Choose saved Memories, chat messages, or both as sources.
8. Optionally select only specific source Memories and/or enter an exact message range.
9. Choose the generation profile.
10. Generate the draft.
11. Review and edit it.
12. Save only when correct.

The generated draft is never saved automatically.

### 15.4 Updating an existing Topical Clip

After a successful run, STMB records which source Memories were used and, when applicable, the source chat, message range, message IDs, and hashes. A later Memory-based update normally sends only new or changed source Memories together with the existing Clip content. Message ranges are always chosen explicitly.

Use **Rebuild from all source memories** when:

- the current entry is incomplete or disorganized;
- the prompt changed;
- older Memories were substantially edited;
- the whole topic should be reconsidered.

### 15.5 Manual source selection and token warnings

Use **Use only selected memories** when the book is large, the topic is limited to one story period, names overlap, or strict evidence control is needed.

STMB estimates request size and warns when the configured token threshold is exceeded. Reduce sources, raise the threshold deliberately, or run once anyway.

### 15.6 Review standard

Check that the draft:

- stays on topic;
- preserves names and relationships;
- includes major relevant facts;
- identifies contradictions rather than silently choosing one version;
- does not invent explanations unsupported by source Memories;
- merges updates without unnecessary duplication.

### 15.7 Prompt placeholders

A custom Topical Clip prompt must include `{{SOURCE_MEMORIES}}` when saved Memories are selected and `{{SOURCE_MESSAGES}}` when chat messages are selected.

Source placeholders:

```text
{{SOURCE_MEMORIES}}
{{SOURCE_MESSAGES}}
```

Supported placeholders include:

```text
{{MODE}}
{{TOPIC}}
{{KEYWORDS}}
{{EXISTING_CLIP}}
{{EXISTING_ENTRY_CONTENT}}
{{SOURCE_MEMORIES}}
{{SOURCE_MESSAGES}}
```

Reset to Default if a custom prompt stops producing useful output.

---

## 16. Side Prompts

A Side Prompt is a named STMB prompt that runs separately from the normal character reply. It usually creates or updates one continuing support entry rather than another sequential scene Memory.

In the **Trackers & Side Prompts** list, the power icon immediately changes the prompt-wide **Enabled** flag: green means enabled and dim means disabled. This control does not add, remove, or otherwise change the prompt's configured triggers.

### 16.1 Appropriate uses

- plot and unresolved-thread trackers;
- relationship state;
- NPC or faction status;
- inventory and resources;
- injuries, statistics, or reputation;
- timelines, dates, deadlines, and travel;
- mystery clues, suspects, and contradictions;
- inventions, research, and projects;
- continuity-risk reports;
- world-state summaries.

Avoid vague “track everything” prompts, duplicate scene summaries, or tasks that must appear inside the next roleplay response.

### 16.2 Output format

Side Prompts normally expect final plain text or Markdown ready to save. They do not require Memory JSON. JSON is allowed only when the user intentionally wants JSON stored as tracker text.

### 16.3 Run sequence

A typical run assembles:

1. Side Prompt instructions;
2. prior saved tracker entry, if any;
3. optional previous Memories;
4. optional Additional Context;
5. selected or since-last scene text;
6. optional Response Format instructions.

The prior entry is existing state to revise, not proof that every old statement should remain. Prompts should explicitly remove stale, resolved, contradicted, or duplicate information.

### 16.4 Manual runs

```text
/sideprompt "Prompt Name"
/sideprompt "Prompt Name" 10-20
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-20
```

Names with spaces should be quoted. A supplied range is inclusive.

Manual runs are best for targeted analysis and prompts requiring runtime macro values.

### 16.5 Automatic after-Memory runs

A Side Prompt can enable **Run automatically after memory**.

The chat then uses one of two automatic selection modes:

- individually enabled Side Prompts; or
- one selected Side Prompt Set.

A selected set replaces individually enabled automatic prompts for that chat. It does not add to them.

#### Memory Assistance Side Prompt

**Memory Assistance** is a reserved Side Prompt with four independent modes. It runs after successfully saved Memories regardless of ordinary Side Prompt enablement or the selected Side Prompt Set. It does not run during Memory regeneration.

Memory Assistance compares the raw processed scene with ordinary and Topical Clips in each Memory Book that received the Memory. It sends each reviewed Clip's title/topic, keywords, current content, stable ID, and type to the AI.

When the job queue is available, each target Memory Book receives a separate **Memory Assistance** job after the Memory is saved. A request, response-validation, report-save, or automatic-application error marks that job **Failed** and exposes the error in the queue. The saved Memory remains **Completed**, and retrying Memory Assistance does not regenerate the Memory.

- **Off** disables Memory Assistance.
- **Update** reviews five or fewer Clips directly; more than five Clips open a selection list. Proposed changes wait for manual approval.
- **Update and Suggest** first performs one topic-discovery request, then runs the same existing-Clip review workflow as Update.
- **Automatic** reviews every Clip in token-based batches without asking which Clips to review. It directly applies valid ordinary Clip additions, while Topical Clip replacements remain pending for approval in **Memory Assistance Suggestions**.

- In Update and Update and Suggest modes, the larger selection list provides **Query Selected** and **Query All**.
- Query All and Automatic mode use token-based batches rather than forcing every Clip into one oversized request.
- Each ordinary Clip receives at most one exact message excerpt proposed as an addition.
- Topical Clips receive complete replacement drafts.
- The AI response is a simple JSON object mapping each affected Clip UID directly to its suggested excerpt or replacement. An empty object means that no Clips need updating.
- Update results are written to `Memory Assistance (STMB SidePrompt)` and remain unapplied until approved through **Memory Assistance Suggestions**.
- Automatic-mode results record how many ordinary Clip additions were applied and retain Topical Clip replacements and any application failures for manual review.
- Canceling the selection clears older suggestions so they cannot be mistaken for results from the latest scene.

Update and Suggest uses a separate suggestion-only prompt before the existing-Clip review batches. The request contains the processed scene and a lightweight list of existing Topical Clip titles, topics, and keywords. It does not send ordinary Clips or existing Clip bodies during discovery. The AI returns zero to five new topics as JSON objects containing a topic and activation keywords; `{"topics":[]}` is a valid result.

Suggested topics are saved in the Memory Assistance report. In **Memory Assistance Suggestions**, choose **Review Topics** to see them as checked, editable rows. You can uncheck unwanted topics, edit topic names or keywords, or add additional topics. Confirmed topics open the standard Topical Clip draft workflow one at a time. A pending topic is removed only after its Topical Clip is saved; closing the draft leaves it available through **Memory Assistance Suggestions**.

When reviewable suggestions are ready, STMB opens a completion popup for the updated Memory Book. **Dismiss** closes the notice, while **Go to Suggestions** opens **Memory Assistance Suggestions** with that Memory Book already selected. Opening **Memory Assistance Suggestions** from the extension menu selects the current chat's effective Memory Book first (the chat-bound book in Automatic Mode or the resolved manual book in Manual Mode).

The Update and Topic Suggestions prompts and connection-profile override are independently editable, but both structured response contracts are fixed. Memory Assistance cannot be deleted, duplicated, placed in a Side Prompt Set, or run manually.

### 16.6 Automatic visible-message intervals

A Side Prompt can enable **Run on visible message interval** and specify a number of visible messages since its checkpoint.

Hidden and system messages do not count.

When a set is active, only rows in that set whose referenced prompt has the appropriate interval trigger are candidates.

### 16.7 Side Prompt Sets

A Side Prompt Set is an ordered run list, not merely a folder. The same template may appear more than once with different macro values.

Example:

1. Relationship Tracker — Alice
2. Relationship Tracker — Bob
3. Plot Tracker
4. Cleanup Report

Rows can store:

- a prompt reference;
- an optional label;
- runtime macro values;
- order;
- duplicate or delete actions.

Rows run top to bottom.

Manual set commands:

```text
/sideprompt-set "Set Name"
/sideprompt-set "Set Name" 10-20
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice" {{npc_2}}="Bob" 10-20
```

### 16.8 Default sets and per-chat selection

General Settings can define:

- a default set for solo chats;
- a default set for group chats.

Each chat may:

1. inherit the applicable default;
2. explicitly use individually enabled prompts;
3. choose a named set.

An empty global default means individual mode.

If a selected set is deleted, STMB warns rather than silently substituting another workflow. A missing row prompt or unresolved macro causes that row to be skipped with a warning.

The set selects candidate rows. Each referenced Side Prompt still needs the relevant automatic trigger for after-Memory or interval execution. Manual set commands do not require those trigger checkboxes.

### 16.9 Macros

Side Prompts can use normal SillyTavern macros such as:

```text
{{user}}
{{char}}
```

Non-standard `{{...}}` placeholders are runtime macros. They must be supplied manually or stored in a set row.

Examples:

```text
{{npc name}}
{{faction}}
{{project_name}}
```

A prompt with unresolved runtime macros cannot run automatically. Automatic runs cannot pause to ask for values.

### 16.10 Memory-count macros

STMB registers integer macros for the effective main Memory Book:

| Macro | Count |
|---|---|
| `{{memtier0}}` | scene Memories |
| `{{memtier1}}` | Arcs |
| `{{memtier2}}` | Chapters |
| `{{memtier3}}` | Books |
| `{{memtier4}}` | Legends |
| `{{memtier5}}` | Series |
| `{{memtier6}}` | Epics |
| `{{memclips}}` | Clip entries |
| `{{memside}}` | Side Prompt entries |

The effective main book is the chat-bound book in Automatic Mode or the resolved main manual book in Manual Mode. In a multi-book group or Narrator setup, the counts do not add all character books together.

A count macro provides only a number, not the contents of those entries.

### 16.11 Message ranges

An explicit range uses exactly that inclusive range. Without a range, STMB uses the Side Prompt’s since-last checkpoint/cap behavior.

Use explicit ranges for debugging, targeted cleanup, or rerunning a known section.

### 16.12 Additional Context and previous Memories

A Side Prompt may include up to seven previous scene Memories.

Its Additional Context source can be:

- none;
- **Follow chat**, using the chat’s selected Context Setting;
- one fixed named Context Setting.

These are reference materials. The prompt should not blindly copy them into the tracker.

### 16.13 Lorebook targets

A Side Prompt normally saves to the effective Memory Book. It can instead use:

1. a per-chat target override;
2. a template-level target;
3. the effective Memory Book as fallback.

A valid per-chat override wins.

Use alternate targets for a deliberate shared campaign book or dedicated tracker book. Do not scatter trackers without a retrieval plan.

### 16.14 Side Prompt entry controls

A template can configure:

- title override;
- keywords;
- Normal, Constant, or Vectorized activation;
- insertion position and Outlet name;
- order mode/value;
- Prevent Recursion;
- Delay Until Recursion;
- Ignore Budget.

Title and keyword fields can expand applicable macros. **Ignore Budget** should be used sparingly because multiple always-included trackers can consume large amounts of context.

### 16.15 Connection profile override

A Side Prompt can inherit normal Memory Books connection resolution or bind a specific STMB profile. An override is useful for a cheaper model or one better at structured maintenance. Excessive profile combinations make troubleshooting harder.

### 16.16 Side Prompt regeneration

Compatible saves store a compact snapshot containing:

- Side Prompt template key;
- prior entry content;
- source chat and inclusive range;
- runtime macro values.

To regenerate, open the lorebook editor and click **Regenerate side prompt**. The replacement uses the saved snapshot with the current template and current profile/context settings.

Regeneration cannot complete when the template was deleted, the source chat/range is unavailable, or the target/source changed during generation. Only the content is replaced; existing title, keywords, and entry settings remain.

### 16.17 Writing good Side Prompts

A good Side Prompt defines:

- the exact maintenance job;
- what source material to review;
- whether to revise, replace, merge, or append;
- stale information to remove;
- stable output headings and ordering;
- a strict length limit;
- final-output-only behavior.

Example:

```text
Update the relationship tracker from the supplied scene. Preserve current facts, merge new developments into the existing sections, and remove resolved, contradicted, stale, or duplicate details. Keep each relationship to 1–3 concise bullets. Output only the updated tracker.
```

Useful guards:

```text
Do not append a new section unless there is genuinely new information.
Remove resolved threads and obsolete speculation.
Output only the updated report; no preface or explanation.
Keep the entire output under 300 words.
```

Stable headings reduce drift across repeated updates.

### 16.18 Side Prompt troubleshooting

If a prompt did not run:

- confirm the Memory or interval event actually occurred;
- inspect the chat’s individual/set selection;
- verify the referenced prompt still exists;
- verify the relevant automatic trigger is enabled;
- verify all runtime macros have values;
- check whether `/stmb-stop` or a failed job canceled it.

If it ran twice:

- check manual plus automatic invocation;
- duplicate set rows;
- duplicate prompt copies;
- multiple tabs or chats triggering work.

If the wrong book received it, inspect both per-chat and template-level target scopes.

If output grows indefinitely, add explicit replacement, pruning, item-count, and word-count rules.

---

## 17. Consolidation

Consolidation combines lower-tier STMB Memories or summaries into higher-tier chronological recaps.

### 17.1 Tiers

```text
Scene Memory → Arc → Chapter → Book → Legend → Series → Epic
```

Consolidation works from existing STMB entries, not directly from raw chat.

### 17.2 Purpose

Use it when:

- scene Memories are accumulating;
- older material no longer needs full scene detail;
- a major relationship, plot, or campaign phase has completed;
- token use should be reduced while preserving continuity;
- a cleaner higher-level chronology is needed.

Consolidated entries should emphasize lasting changes, turning points, goals, consequences, relationship shifts, unresolved threads, and stable state.

### 17.3 Manual workflow

1. Open **Consolidate Memories**.
2. Choose the target tier.
3. Select eligible source entries.
4. Choose the consolidation prompt/profile settings.
5. Decide whether source entries should be disabled after successful consolidation.
6. Run and review the candidates.
7. Approve the desired summaries.

### 17.4 Readiness prompts are not automatic consolidation

**Prompt for consolidation when a tier is ready** watches selected target tiers. When the saved minimum eligible count is reached, STMB presents a yes/later prompt. Choosing Yes opens the consolidation interface. It does not silently consolidate.

### 17.5 Consolidation output schema

Ordinary consolidation expects strict JSON:

```json
{
  "summaries": [
    {
      "title": "Short higher-tier title",
      "summary": "Consolidated chronological recap",
      "keywords": ["keyword1", "keyword2"],
      "member_ids": ["001", "002"]
    }
  ],
  "unassigned_items": [
    {
      "id": "003",
      "reason": "Why this source did not fit"
    }
  ]
}
```

The model may return one or several summaries. `member_ids` assigns each source to a returned summary. Outliers belong in `unassigned_items` rather than being forced into an unrelated recap.

### 17.6 Previous higher-tier summary

A previous summary in the target tier can be supplied as canon context. It is not source material to rewrite. Consolidation prompts must distinguish it from the lower-tier entries being processed.

### 17.7 Previews and failed responses

Consolidation previews can allow editing, accepting, regenerating one candidate from the same sources, or regenerating a pending batch.

Malformed or failed AI responses can be inspected and, where supported, corrected manually before commit.

### 17.8 Source disabling

When enabled, STMB disables source entries after successful consolidation so the higher-tier summary can take over retrieval. This is reversible through lorebook editing.

### 17.9 Good consolidation prompts

They should define:

- the compression target;
- whether to create one recap or the smallest coherent number;
- chronology and grouping logic;
- details that must survive;
- explicit handling of outliers;
- exact JSON structure.

They should preserve major beats, consequences, promises, relationship changes, identifiers, unresolved threads, and retrieval-friendly keywords while removing repeated scene-level detail.

---

## 18. Compaction

Compaction asks an AI to shorten one existing STMB-managed entry and presents the original and draft before replacement.

### 18.1 Eligible entries

- `[STMB Clip]` entries;
- Side Prompt entries;
- STMB Memory entries.

Ordinary non-STMB lorebook entries are not listed.

### 18.2 Workflow

1. Open **Compaction**.
2. Choose a Memory Book.
3. Choose a Compaction Profile.
4. Optionally edit the Compaction Prompt.
5. choose one entry.
6. Compare original and compacted token estimates/content.
7. Edit the draft if needed.
8. Replace, copy the draft, or cancel.

The original is not changed until **Replace with Compacted Version** is selected.

### 18.3 Good uses

- long Clip collections;
- repeated or stale tracker content;
- wordy scene Memories;
- always-active entries consuming too much context.

Compaction is not for adding facts, summarizing raw chat, creating a new Memory, or processing ordinary lorebook entries.

### 18.4 Prompt placeholders

```text
{{ENTRY_CONTENT}}  required current content
{{ENTRY_KIND}}     Clip, SidePrompt, or Memory
{{ENTRY_TITLE}}    entry title
```

The prompt should preserve facts, names, pronouns, macros, wrapper headings, and end markers while removing redundancy and low-value wording.

---

## 19. Regeneration

Regeneration creates a reviewable replacement for an existing entry. It does not create a second numbered entry and never overwrites without approval.

### 19.1 Scene Memory regeneration

- open the source chat;
- open the Memory Book in the lorebook editor;
- click **Regenerate memory**;
- for a canonical group entry with linked character entries, choose whether to regenerate only the clicked entry or all linked entries;
- choose the current profile, prompt, previous-memory count, and Additional Context;
- review title, content, and keywords for every selected entry.

The original scene range and sequence number are retained. Linked entries reuse the same selected regeneration settings but are generated against their own Memory Book context and group/character prompt target. STMB collects all approvals before it starts saving direct regenerations. If all source messages are hidden, reveal them or enable unhide-before-generation.

### 19.2 Consolidation regeneration

A higher-tier summary is regenerated from its exact linked lower-tier sources using the dedicated **Regenerate Consolidation** preset.

The full source set must still exist at the correct tier. A lower-tier source cannot be regenerated while an active parent summary depends on it; delete the parent first when intentionally rebuilding the lower tier.

### 19.3 Side Prompt regeneration

See the Side Prompt snapshot rules in Section 16.16.

### 19.4 Safety checks

Immediately before replacement, STMB verifies that:

- the target entry is unchanged;
- the source chat range is unchanged;
- required consolidation sources are unchanged and available;
- the entry remains eligible.

If any check fails, nothing is overwritten.

Linked group, character, and Narrator copies remain independent.

---

## 20. Context for Generation

Several context sources can appear in an STMB request. They are not interchangeable.

### 20.1 Current scene

The message range being processed now. It is the target material for an ordinary scene Memory.

### 20.2 Previous Memories

Earlier scene Memories from the effective Memory Book, included as read-only continuity context. The user can normally include 0–7.

They should not be summarized again merely because they appear before the current scene.

### 20.3 Additional Context

Selected lorebook entries supplied as stable reference material, such as:

- character or setting rules;
- canonical names and terminology;
- campaign constraints;
- an authoritative timeline;
- location references;
- facts assumed but not repeated in the scene.

Additional Context appears before previous Memories and the scene transcript. It is reference material, not another scene.

### 20.4 Context Settings

A Context Setting is a reusable ordered collection of Additional Context entries.

Workflow:

1. open **Context Settings**;
2. create a named setting;
3. select lorebook entries;
4. order them;
5. choose the setting for the current chat or explicitly choose No Context.

The selection is stored per chat and works with Current SillyTavern Settings as well as saved profiles.

If a referenced book or entry disappears, STMB warns, skips the stale reference, and continues. If the entire Context Setting is deleted, chats referring to it continue without Additional Context until another selection is made.

Context Settings can be duplicated, imported, and exported as `stmb-context-settings.json`.

### 20.5 Prior Side Prompt entry

The current tracker text to revise. It is state, not evidence that all old statements remain valid.

### 20.6 Consolidation sources

Lower-tier entries that are the actual material being grouped and compressed.

### 20.7 Previous higher-tier summary

Canon carried forward during consolidation. It is not a source to rewrite.

### 20.8 Correct ordering by workflow

Ordinary Memory:

```text
Memory prompt
Additional Context
Previous Memories
Current scene transcript
```

Side Prompt:

```text
Side Prompt instructions
Prior entry
Previous Memories
Additional Context
Scene text
Response Format
```

Consolidation:

```text
Consolidation prompt
Previous higher-tier summary
Selected lower-tier source entries
```

Prompts should label target material and reference-only material clearly.

---

## 21. Prompt Architecture, Built-in Summary Prompts, and Authoring Rules

STMB has three main structured generation systems plus several focused auxiliary workflows.

### 21.1 Ordinary Memory generation

STMB expects one JSON object:

```json
{
  "title": "Short scene title",
  "content": "The memory text",
  "keywords": ["keyword1", "keyword2"]
}
```

Rules:

- return only the JSON object;
- use the exact keys `title`, `content`, and `keywords`;
- `keywords` must be a JSON array of strings;
- keep the title short and readable;
- use concrete retrieval terms;
- place any desired Markdown inside the `content` string;
- escape quotation marks correctly.

STMB can repair some fences, trailing commas, think tags, wrappers, or minor malformed output, but prompts should never depend on recovery.

A strong Memory prompt states:

1. the desired memory style and level of compression;
2. continuity-relevant information to preserve;
3. filler, OOC, or unsupported material to omit;
4. the exact JSON schema.

Weak prompts specify style but not structure, ask for analysis instead of a final object, blur previous context with the current scene, or use abstract keywords.

### 21.2 Built-in Summary Prompts and choosing one

These presets are for ordinary Memory generation only. They do not control Consolidation, Side Prompts, Topical Clips, or Compaction. A profile selects one under **Memory Creation Method**. **Summary** is the ordinary fallback/default when a profile does not specify another preset. Built-in means supplied by STMB; it does not mean every preset runs or that all of them are equally suitable for one chat.

There is no universal best prompt, because detail, readability, retrieval quality, and token cost pull in different directions. The practical short answer is:

- **Best starting default for most users: Summary.** It is balanced, general-purpose, and a good first test with a new model.
- **Best for continuity-heavy long-running roleplay: Comprehensive.** It applies the strongest filtering, causality, continuity, and keyword guidance, but asks more of the model and can produce a larger structured Memory.
- **Best when saving context tokens matters most: Minimal.** It is intentionally brief and will lose nuance.
- **Best for separate real-group or Narrator character books: Group and Character.** Use them together through the profile's separate group/character prompt setting; they are targeting prompts, not competing general-purpose styles.

| Built-in prompt | Best used for | Main trade-off |
|---|---|---|
| **Summary** | Most solo chats and first-time setup. Produces detailed chronological narrative prose with important events, interactions, developments, revelations, outcomes, and concrete retrieval keywords. | Preserves more detail than a token-minimal user may need, but is simpler and less demanding than the most structured presets. |
| **Comprehensive** | Long-running, continuity-sensitive stories where causal chains, character dynamics, established facts, key exchanges, unresolved threads, and disciplined keywords all matter. It explicitly filters incidental detail and improves keyword construction. | Has the longest and most demanding instructions. Use a capable instruction-following model and allow enough response tokens. |
| **Summarize** | Users who prefer a highly scannable Markdown record divided into Timeline, Story Beats, Key Interactions, Notable Details, and Outcome. | Bullet-heavy output can read more like reference notes than a natural memory and may repeat facts across headings. |
| **Synopsis** | Scenes where preserving nearly every significant beat, interaction, detail, and outcome matters more than compactness. | Intentionally long and comprehensive; it is one of the least suitable choices when lorebook or context budget is tight. |
| **Sum Up** | A chronological narrative beat record with a visible scene heading and timeline, but less sectional overhead than Summarize or Synopsis. | Provides less explicit separation between events, character dynamics, facts, and continuity state. |
| **Minimal** | High-volume chats, inexpensive archival coverage, or setups where Memories must consume very little context. Produces a brief two-to-five-sentence Memory. | Important motives, emotional shifts, causality, and minor continuity details can be lost. |
| **Northgate** | Creative-writing users who want a coherent third-person, past-tense literary record emphasizing actions, emotional shifts, development, and significant dialogue. This community style is credited to Northgate on the SillyTavern Discord. | Optimizes for readable narrative rather than maximum compression or clearly separated reference categories. Unlike most general presets, its built-in text does not explicitly exclude OOC material, so review it when OOC is common. |
| **Aelemar** | Major plot scenes and emotionally consequential character moments that should remain understandable as a standalone record even if the source scene is unavailable. This community style is credited to Aelemar on the SillyTavern Discord. | Requires at least 300 words and is deliberately detailed, so it is unsuitable for aggressive token saving. Its built-in text also does not explicitly exclude OOC material. |
| **Group** | The shared or omniscient Memory Book in a real group, or the omniscient target in a multi-book workflow. It preserves group decisions and state while keeping actions, emotions, and knowledge attributed to the correct member. | Do not use it as an individual character's Memory; it intentionally focuses on shared group continuity. |
| **Character** | One character-focused Memory Book in a real-group or multi-character workflow. It records what that character did, knew, felt, learned, concealed, misunderstood, or was affected by. | It intentionally omits scene material that is irrelevant to the target character and restricts unsupported private knowledge. |

For a new installation, use **Summary** until generation and retrieval are working reliably. Then change only the prompt and compare several Memories from similar scenes. Prefer **Comprehensive** when omitted causality, continuity state, or weak keywords are the problem; prefer **Minimal** when Memory size is the problem. Changing prompts cannot compensate for a weak model, truncated output, poor scene boundaries, or incorrect retrieval settings.

The exact built-in text may be recreated for the current SillyTavern locale. Recreating built-ins removes local edits to those built-ins but should not delete unrelated custom presets. Duplicate or export a modified built-in before recreating it.

### 21.3 Multi-character prompt targeting

When separate group/character prompts are enabled, STMB marks the request target as:

- `group` for a canonical real-group or omniscient Narrator Memory;
- `character` for one individual character-book version.

The prompt should explicitly use the target perspective without inventing knowledge not supported by the scene and supplied context.

### 21.4 Side Prompt authoring

Side Prompts normally return plain text or Markdown. Write them like maintenance instructions, not Memory prompts.

A strong Side Prompt:

- defines one narrow job;
- explains how to use the previous tracker;
- removes stale state;
- imposes stable headings and length limits;
- returns only the final tracker.

### 21.5 Consolidation authoring

Ordinary consolidation requires the schema in Section 17.5. A strong prompt:

- preserves chronology;
- creates the smallest coherent number of summaries;
- assigns every used source through `member_ids`;
- identifies leftovers through `unassigned_items`;
- preserves major changes and unresolved continuity;
- uses concrete keywords.

The dedicated **Regenerate Consolidation** preset is for one replacement summary and is not selectable as the normal consolidation default.

### 21.6 Topical Clip authoring

The prompt must include `{{SOURCE_MEMORIES}}`, remain focused on the requested topic, distinguish source evidence from inference, merge new material into existing Clip content, and surface contradictions.

### 21.7 Compaction authoring

The prompt must include `{{ENTRY_CONTENT}}` and should shorten without adding unsupported facts. It should preserve structural wrappers and macros needed by the entry.

### 21.8 Prompt-writing checklist

Before finalizing any STMB prompt, answer:

1. What material is the actual analysis target?
2. What material is reference-only?
3. Does this path expect strict JSON or final plain text?
4. What information must survive for later retrieval?
5. What should be omitted, merged, carried forward, or left unassigned?

Return-format correctness comes before style.

---

## 22. Summary Prompt Manager and Consolidation Prompt Manager

### Summary Prompt Manager

Can create, edit, duplicate, delete, import, and export ordinary Memory prompt presets. Assign a preset through a Memory Books profile.

All ordinary Memory presets must preserve the required Memory JSON schema.

See Section 21.2 for the built-in Summary Prompt selection guide and best-use cases.

### Consolidation Prompt Manager

Controls prompts used to group lower-tier entries into higher-tier summaries and selects the normal default consolidation prompt.

The regeneration-only consolidation preset cannot be used for ordinary consolidation.

### Import and localization behavior

Built-in prompts can be recreated in the current app locale. Back up locally modified built-ins before recreating them.

---

## 23. Regex Integration

STMB integrates with SillyTavern’s Regex extension at two stages:

1. **Outgoing/User Input:** transform the assembled prompt before it is sent.
2. **Incoming/AI Output:** clean or standardize the raw response before parsing/saving.

Enable **Use regex (advanced)**, then open **Configure regex** and select one or more scripts for each direction.

Important: STMB’s own selection controls execution. A script selected by STMB can run even when that script is disabled in the Regex extension’s normal interface.

Use Regex only when the transformation is understood. A bad outgoing rule can corrupt required schema instructions; a bad incoming rule can corrupt otherwise valid JSON.

---

## 24. Lorebook Entry Titles and Character Policy

### 24.1 Title placeholders

Profile title formats can use:

- `{{title}}` — AI-generated title;
- `{{scene}}` — source range;
- `{{char}}` — character/group name;
- `{{user}}` — user name;
- `{{messages}}` — scene message count;
- `{{profile}}` — profile name;
- supported date and time placeholders.

### 24.2 Auto-numbering

Supported numbering tokens include forms such as:

```text
[0] [00] (0) {0} #0
#[000] ([000]) {[000]}
```

STMB assigns sequential, zero-padded numbers according to the chosen format.

### 24.3 Printable Unicode

All printable Unicode characters are allowed in titles, including emoji, accented text, CJK, and symbols. Unicode control characters in U+0000–U+001F and U+007F–U+009F are removed.

Lorebook filenames used by Auto-Create are separately sanitized for filesystem-reserved characters and length.

---

## 25. Job Queue and Retry Controls

The optional queue requires Chat Top Bar / Chat Top Info Bar. When the queue is available, regenerating a Memory, consolidation, or Side Prompt creates a regeneration job; the replacement remains in review until you approve it.

The **Memory Books Jobs** drawer can show:

- queued;
- active;
- completed;
- failed;
- canceled;
- blocked;
- Needs Review.

It can cancel active work, reopen review jobs, inspect failures, retry work, and dismiss terminal history rows.

Retry scopes:

- **Retry:** rerun one non-Memory job, such as a Side Prompt or consolidation job.
- **Retry All:** rerun/resume the Memory and associated after-Memory Side Prompt work. If the Memory was already saved, STMB can resume from that result rather than duplicate it.
- **Retry Memory:** rerun/resume only the Memory and intentionally skip after-Memory Side Prompts.

Use Retry All to restore the combined workflow; use Retry Memory when tracker work should not run.

Without Chat Top Bar, STMB still performs its normal workflows but lacks the queue UI.

---

## 26. Visual Feedback and Accessibility

STMB provides visual states for scene controls, including inactive, selected, valid range, in-scene, and processing states. Exact colors depend on the SillyTavern theme.

Accessibility support includes:

- keyboard navigation;
- focus indicators;
- ARIA attributes;
- reduced-motion behavior;
- mobile-friendly controls.

When teaching from a screenshot, describe the visible icon and label rather than relying on a specific color.

---

## 27. Settings Map and Current Settings Reference

This section is the settings map. It identifies where each user-facing STMB configuration control is located and what it controls. It also lists the important saved and one-run controls in specialized interfaces. One-time content fields used only to create a particular Clip, Topical Clip, Compaction, or preview are documented in their workflow sections rather than repeated here.

The common starting path is:

**magic-wand Extensions menu beside the chat input → Memory Books**

All paths below begin in the **Memory Books** main panel unless they explicitly say **SillyTavern**. A control may be hidden or disabled when it does not apply to the current chat, provider, profile, or storage mode.

Scopes used below:

- **Global:** applies throughout STMB unless a narrower setting overrides it.
- **Per chat:** stored for the current chat or group.
- **Per character:** follows the character card across compatible chats.
- **Per profile/template/setting:** stored in that reusable object.
- **Per run:** affects only the operation currently being prepared.

### 27.1 Main panel: storage, chat mode, and active profile

| Setting | Location | Scope | What it does |
|---|---|---|---|
| **Enable Manual Lorebook Mode** | **Current Lorebook Configuration** | Global mode; book choice is per chat | Stops using the normal chat-bound lorebook as STMB's automatic target and requires a Memory Book to be selected for the current chat. It cannot be enabled with Auto-Create Lorebook Mode. |
| **Selected manual Memory Book** | **Current Lorebook Configuration → manual lorebook controls**; visible in Manual Mode | Per chat | Chooses the main Memory Book that receives Memories for this chat. In Narrator Mode this is the omniscient book. |
| **Group-character Memory Book assignments** | **Current Lorebook Configuration → group-character rows**; visible in a real group using Manual Mode | Per chat | Assigns a separate Memory Book to each real-group member. STLO is required to configure these assignments and provide the corresponding character-filtered retrieval behavior. |
| **Character Memory Book lock** | Lock icon beside a character's Memory Book assignment | Per character | Keeps that character card assigned to the same Memory Book across compatible Manual Mode chats. Unlock before changing the assignment. |
| **Narrator Mode** | **Current Lorebook Configuration**; normal non-group chats only | Per chat | Uses the selected manual book as an omniscient Memory Book and enables declared fictional cast members with their own unique books. Manual Mode and an omniscient book are required. |
| **Manage Narrator Cast** | Under **Narrator Mode**; also available from the Active Cast drawer | Per chat | Adds, retires, restores, and assigns unique Memory Books to declared Narrator characters. |
| **Auto-create lorebook if none exists** | **Current Lorebook Configuration** | Global | In Automatic Mode, creates and binds a lorebook when the chat has none. It cannot be enabled with Manual Mode. |
| **Lorebook Name Template** | Directly below **Auto-create lorebook if none exists** | Global | Names auto-created books. Supports `{{char}}`, `{{user}}`, and `{{chat}}`. It is used only while Auto-Create Lorebook Mode is enabled. |
| **Memory profile selection** | **Memory Profiles** selector | Per run | Chooses the profile for the next Memory and for the adjacent profile actions. This selection alone does not change the saved default. |
| **Set as Default** | **Memory Profiles → Profile Actions** | Global default | Makes the selected profile the default used by automatic Memories and other workflows unless a confirmation, Side Prompt override, or workflow-specific choice selects another profile. |
| **Memory Title Format** | **Memory Profiles → Memory Title Format**, or **Profile Actions → Edit Profile** | Per profile | Formats new Memory entry titles and optional numbering with the listed title macros. The main-panel control edits the default profile's format; **Edit Profile** changes the selected profile directly. |

### 27.2 General Settings

Open **Settings → General Settings** in the main panel.

| Setting | Scope | What it does |
|---|---|---|
| **Always use default profile (no confirmation prompt)** | Global | Skips the normal pre-generation confirmation window. Required for non-interactive catch-up; independent warnings and enabled previews can still appear. |
| **Automatically accept detected participants in future** | Global | Stops asking for real-group participant confirmation and accepts STMB's detected participant set for later Memories. |
| **Show memory previews** | Global | Opens an editable review before saving generated Memories and applicable Side Prompt output. |
| **Show consolidation previews** | Global | Opens review controls for generated consolidation candidates before they are committed. |
| **Show notifications** | Global | Enables STMB toast notifications. |
| **Show floating Clip button when text is highlighted** | Global | Shows the floating scissors control after selecting chat text. |
| **Memory boundary indicator** | Global | Shows neither control, the processed-boundary divider, the draggable jump button, or both. |
| **Allow scene overlap** | Global | Permits a selected scene range to overlap message IDs already represented by an existing Memory. |
| **Refresh lorebook editor after adding memories** | Global | Refreshes an open lorebook editor after STMB writes entries so the new content appears immediately. |
| **Copy Memory Books when branching** | Global | Gives a native chat branch independent copies of its active unlocked chat-bound or manual Memory Books. Character-locked books remain shared by design. |
| **Default for solo chats** | Global | Selects the Side Prompt Set inherited by solo chats after a Memory. An empty selection uses individually enabled after-Memory Side Prompts. |
| **Default for group chats** | Global | Selects the Side Prompt Set inherited by real group chats after a Memory. An empty selection uses individually enabled after-Memory Side Prompts. |
| **Max Response Tokens** | Global | Overrides the maximum output length for STMB generation. Increase it when otherwise valid JSON is cut off; `0` leaves the normal provider/SillyTavern behavior available as the fallback. |
| **Token Warning Threshold** | Global | Shows a confirmation warning when the estimated input request exceeds the threshold. It does not change the model's context limit. |
| **Default Previous Memories Count** | Global | Sets the normal default of 0–7 prior Memories supplied as continuity context for a new Memory. A run can override it in **Advanced Memory Options**. |
| **Use regex (advanced)** | Global | Enables STMB's own regex-processing selection. These selections are separate from whether the underlying SillyTavern regex script is generally enabled. |
| **Configure regex… → Outgoing scripts** | Global | Selects scripts STMB runs on material before sending it to the generation provider. |
| **Configure regex… → Incoming scripts** | Global | Selects scripts STMB runs on returned material before parsing and saving it. |

#### Token Saving inside General Settings

These controls are lower in the same **General Settings** popup under **Token Saving (Hide/Unhide Messages)**.

| Setting | Scope | What it does |
|---|---|---|
| **Auto-hide messages after adding memory** | Global | Chooses no automatic hiding, all processed messages through the latest Memory, or only the range used by the latest Memory. Hiding is reversible and does not delete messages. |
| **Messages to leave unhidden** | Global | Keeps this many recent messages visible when auto-hiding, preserving overlap near the Memory boundary. `0` hides through the applicable scene end. |
| **Unhide hidden messages for memory generation** | Global | Runs the equivalent of `/unhide X-Y` for the source range before STMB compiles it. The selected auto-hide mode determines what is hidden again after a successful save. |

### 27.3 Automatic Memories and consolidation reminders

Open **Settings → Automatic Memories** in the main panel.

| Setting | Scope | What it does |
|---|---|---|
| **Auto-create memory summaries** | Global | Enables automatic `/nextmemory`-style Memory creation. With no processed baseline, current STMB can begin at message 0; a first manual Memory remains recommended for setup validation and a deliberate starting boundary. |
| **Auto-Summary Interval** | Global | Sets how many messages make up the normal automatic cadence. |
| **Auto-Summary Buffer** | Global | Excludes this many newest messages from an otherwise ready automatic range so generation happens slightly behind the live conversation. |
| **Prompt for consolidation when a tier is ready** | Global | Shows a yes/later prompt when a monitored tier reaches its saved eligible-source minimum. It never silently performs consolidation. |
| **Auto-Consolidation Tiers** | Global | Chooses which target tiers are monitored for readiness prompts. The minimum for each tier is saved in **Consolidate Memories**. |

### 27.4 Profile editor

Choose a profile under **Memory Profiles**, then open **Profile Actions → Edit Profile**. These settings are **per profile** unless noted otherwise. The built-in **Current SillyTavern Settings** profile intentionally locks fields that SillyTavern controls.

| Setting | What it does |
|---|---|
| **Profile Name** | Names the reusable STMB profile. The built-in profile name is locked. |
| **API/Provider** | Chooses current SillyTavern routing, a supported provider, a Custom OpenAI-compatible connection, or Full Manual Configuration. |
| **Use this connection profile** | For **Custom OpenAI-Compatible API**, uses either the active SillyTavern Custom connection or one named Custom connection. Its saved URL and secret are used while the STMB **Model** remains the model override. |
| **Skip structured output and use plain-text completion** | Stops sending a structured-output schema when a provider rejects it. The selected prompt must still make the model return STMB's required valid JSON. |
| **Use ST's ChatCompletionService** | Routes supported requests through SillyTavern's built-in Chat Completion request helper. It is unavailable to Full Manual profiles. |
| **Chat Completion Preset** | Optionally applies a SillyTavern Chat Completion preset through ChatCompletionService. |
| **Model** | Supplies the exact model ID for this profile. **Current SillyTavern Settings** instead reads the model active in SillyTavern. |
| **Temperature** | Sets generation randomness for this profile. **Current SillyTavern Settings** instead reads SillyTavern's active temperature. |
| **Use reverse proxy** | Passes SillyTavern's configured reverse-proxy details for supported providers; in Full Manual Configuration the secret field is labeled as a proxy password. |
| **API Endpoint URL / API Key** | Supplies a separate direct endpoint and credential only for **Full Manual Configuration**. Prefer a connection configured and tested in SillyTavern for normal use. |
| **Memory Creation Method** | Selects the Summary Prompt preset used for ordinary Memory generation. Prompt content is managed in **Settings → Summary Prompt Manager**. |
| **Use separate group and character prompts in group chats** | Uses distinct prompt presets for the group Memory Book and character-focused Memory Books. |
| **Group Summary Prompt / Character Summary Prompt** | Selects the two presets used when separate group/character prompting is enabled. |
| **Memory Title Format** | Controls title text, macros, and automatic numbering for Memories produced by this profile. |
| **Activation Mode** | Saves new entries as **Normal** keyword activation, **Constant**, or **Vectorized**. |
| **Insertion Position** | Chooses where a generated entry is inserted relative to Character, Example Messages, Author's Note, or a named Outlet. |
| **Outlet Name** | Names the target Outlet and appears only when **Insertion Position** is **Outlet**. |
| **Insertion Order** | **Auto** derives order from the Memory number; **Manual** uses a fixed value; **Reverse** counts down from a starting value and is intended only for Outlets. |
| **Prevent Recursion** | Prevents the generated entry's content from triggering other lorebook entries during recursive scanning. |
| **Delay Until Recursion** | Prevents the generated entry from activating in the first scan pass. Leave it off when nothing else can begin recursion. |
| **Also include** | Legacy-profile compatibility only. Older profiles may show ordered lorebook references here; current configuration uses per-chat **Context Settings** instead. |

The active SillyTavern provider, model, temperature, connection preset, and reverse proxy are configured in SillyTavern's own connection controls, not in STMB. The **Current SillyTavern Settings** profile reads those live values.

### 27.5 Context Settings

Open **Settings → Context Settings** in the main panel.

| Setting | Scope | What it does |
|---|---|---|
| **Additional Context for this chat** | Per chat | Selects one named Context Setting, explicitly saves **No Context**, or leaves the choice unset so STMB can prompt when migrated context requires a decision. |
| **Context Setting Name** | Per Context Setting | Names a reusable Additional Context collection. |
| **Additional Context entries and order** | Per Context Setting | Selects lorebook entries to send as stable reference material and determines their order. Missing entries are warned about and skipped. |

**New**, **Duplicate**, **Delete**, **Import JSON**, and **Export JSON** manage Context Settings; they do not change generation behavior until a setting is selected by a chat or Side Prompt.

### 27.6 Trackers & Side Prompts

Open **Settings → Trackers & Side Prompts** in the main panel.

| Setting | Location and scope | What it does |
|---|---|---|
| **After-memory side prompt mode for this chat** | Manager main screen; per chat | Uses the matching solo/group default, explicitly uses individually enabled after-Memory prompts, or selects one named Side Prompt Set for this chat. |
| **How many concurrent prompts to run at once** | Manager main screen; global | Limits simultaneous Side Prompt jobs to 1–10. |
| **Side Prompt Set Name** | **New Set** or edit a set; per set | Names a reusable ordered group of Side Prompt runs. |
| **Side Prompt / Row Label / Macro Values** | Side Prompt Set row; per set | Chooses the template for a row, gives the row an optional display/title label, supplies literal or set-level runtime macro values, and uses row order as execution order. |
| **Enabled** | **New** or edit an ordinary Side Prompt; per template | Makes the template eligible when the chat uses individually enabled after-Memory prompts. Trigger settings still determine when it runs. |
| **Run on visible message interval / Interval** | Side Prompt editor; per template | Runs after the configured number of visible messages. Automatic triggers are unavailable when the template requires unresolved runtime macros. |
| **Run automatically after memory** | Side Prompt editor; per template | Runs the template after a successful Memory, subject to the chat's Side Prompt mode or selected set. |
| **Allow manual run via `/sideprompt`** | Side Prompt editor; per template | Allows explicit manual execution. |
| **Prompt / Response Format** | Side Prompt editor; per template | Defines the instruction and optional output structure. Both fields may use supported Side Prompt macros. |
| **Previous memories for context** | Side Prompt editor; per template | Includes 0–7 previous Memory entries before the selected source messages. |
| **Use additional context / Additional Context Source** | Side Prompt editor; per template | Includes Additional Context and either follows the current chat's Context Setting or always uses one fixed named setting. |
| **Lorebook Target** | Side Prompt editor; per template or per chat | Saves output to the normal Memory Book or another chosen lorebook. When changed, STMB asks whether the choice applies only to this chat or to the template going forward. |
| **Lorebook Entry Title Override / Keywords** | Side Prompt editor; per template | Optionally controls the upserted entry title template and comma-separated activation keywords. |
| **Activation Mode / Insertion Position / Outlet Name** | Side Prompt editor; per template | Controls activation and placement for the Side Prompt's lorebook entry. |
| **Insertion Order / Order Value** | Side Prompt editor; per template | Uses automatic Memory-number ordering or a fixed manual order value. |
| **Prevent Recursion / Delay Until Recursion / Ignore Budget** | Side Prompt editor; per template | Applies the corresponding SillyTavern lorebook-entry recursion and budget flags. |
| **Override default memory profile / Connection Profile** | Side Prompt editor; per template | Routes this Side Prompt through a selected STMB profile instead of the current default profile. |
| **Memory Assistance Mode** | Edit **Memory Assistance**; global | **Off** disables it; **Update** proposes changes to existing Clips; **Update and Suggest** also discovers Topical Clip topics; **Automatic** directly applies ordinary Clip additions while leaving Topical Clip replacements for approval. |
| **Update Prompt / Topic Suggestions Prompt** | Edit **Memory Assistance**; per built-in template | Controls its two AI tasks. Their response contracts remain fixed. |
| **Use a connection profile override** | Edit **Memory Assistance**; per built-in template | Uses the selected STMB profile for Memory Assistance instead of the default. |

### 27.7 Prompt managers

| Setting | Location | Scope | What it does |
|---|---|---|---|
| **Summary Prompt name and prompt text** | **Settings → Summary Prompt Manager → New Preset** or edit | Per preset | Defines a reusable ordinary-Memory prompt. A profile uses it only after its **Memory Creation Method** or group/character prompt selection points to that preset. |
| **Default consolidation prompt** | **Settings → Consolidation Prompt Manager → Set Default** | Global | Selects the normal prompt preselected by **Consolidate Memories**. Regeneration-only and group-only presets cannot be selected. |
| **Consolidation Prompt name and prompt text** | **Settings → Consolidation Prompt Manager → New Consolidation Preset** or edit | Per preset | Defines reusable consolidation instructions. The dedicated regeneration and group presets are restricted to those workflows. |

### 27.8 Topical Clip and Compaction defaults

Open **Settings → Topical Clip** or **Settings → Compaction** in the main panel.

| Setting | Location | Scope | What it does |
|---|---|---|---|
| **Generation Profile / Compaction Profile** | **Topical Clip → Generation Profile**, or **Compaction → Compaction Profile** | Global shared default | Selects the STMB profile used for Topical Clip generation and Compaction. Changing it in either interface changes the shared selection used by both workflows. |
| **Topical Clip Prompt** | **Topical Clip → Edit Topical Clip Prompt** | Global | Saves a custom prompt template for Topical Clip generation. **Reset to Default** returns to the current built-in prompt. Required source macros are validated before save or generation. |
| **Compaction Prompt** | **Compaction → Edit Compaction Prompt** | Global | Saves a custom prompt template for shortening existing Memory, Clip, and Side Prompt entries. **Reset to Default** returns to the current built-in prompt. `{{ENTRY_CONTENT}}` is required. |

The Memory Book, topic, keywords, source inclusion, source selection, message range, draft, and entry selected for Compaction are per-run workflow choices, not persistent settings.

### 27.9 Consolidate Memories controls

Open **Consolidate Memories** from the buttons at the bottom of the main panel. This interface mixes saved defaults with one-run choices.

| Setting | Scope | What it does |
|---|---|---|
| **Target tier** | Per run | Chooses the higher tier to create and therefore the immediately lower eligible source tier. |
| **Consolidation Prompt** | Per run | Selects the prompt for this consolidation; it initially uses the default from the Consolidation Prompt Manager. |
| **Maximum entries per pass** | Per run | Limits how many lower-tier entries are sent in one analysis pass. |
| **Token Budget** | Per run | Sets the approximate input budget used to batch this consolidation. |
| **Number of automatic summary attempts** | Per run | Limits repeated analysis passes used to obtain usable assignments and summaries. |
| **Saved minimum eligible entries** | Global, saved separately for each target tier | Sets when the chosen tier is considered ready. It also controls that tier's automatic readiness prompt. |
| **Activation Mode / Insertion Position / Outlet / Insertion Order / Recursion Settings** | Global consolidation-entry defaults | Controls how newly consolidated entries are saved. These are separate from ordinary Memory profile entry settings. |
| **Disable selected source entries after creating summaries** | Per run | Disables successfully consolidated sources after commit so higher-tier summaries can replace them in retrieval. It does not delete them. |
| **Selected source entries** | Per run | Chooses which eligible lower-tier entries are processed. Unchecked entries are left untouched. |

### 27.10 Related SillyTavern World Info settings

These controls are outside STMB, in SillyTavern's World Info/lorebook settings, but they affect whether saved Memories are retrieved during ordinary chat generation.

| Setting | What it does |
|---|---|
| **Match Whole Words** | Controls keyword boundary matching. Off is a common starting point for flexible Memory keywords. |
| **Scan Depth** | Controls how much recent text is scanned for lorebook activation. A relatively high value such as 8 is a common starting point. |
| **Max Recursion Steps** | Limits recursive World Info activation. Approximately 2 is a common starting point. |
| **Context percentage / lorebook budget** | Limits how much context lorebook entries may occupy. Increase it only in balance with the model's total context and other prompt material. |

These are recommendations, not hard requirements; see Section 10 for retrieval diagnosis.

---

## 28. Slash Command Reference

### Memory commands

```text
/creatememory
```

Create a Memory from the currently marked scene.

```text
/scenememory X-Y
```

Set the inclusive range and create a Memory, for example `/scenememory 10-15`.

```text
/nextmemory
```

Create a Memory from the message after the highest processed boundary through the current eligible end.

```text
/stmb-catchup interval=x start=y end=z
```

Process an existing long chat in consecutive chunks.

### Side Prompt commands

```text
/sideprompt "Name" {{macro}}="value" [X-Y]
/sideprompt-set "Set Name" [X-Y]
/sideprompt-macroset "Set Name" {{macro}}="value" [X-Y]
/sideprompt-on "Name" | all
/sideprompt-off "Name" | all
```

### Processed-boundary commands

```text
/stmb-highest
/stmb-set-highest <N|none>
```

### Emergency stop

```text
/stmb-stop
```

Stops all in-flight STMB generation everywhere, including Side Prompts. Work already committed remains saved.

---

## 29. Troubleshooting by Stage

### 29.1 Extension/UI did not load

Symptoms:

- Memory Books missing from the magic-wand menu;
- chevrons missing;
- no floating Clip button after selection.

Checks:

1. extension installed and enabled;
2. page reloaded;
3. character/group chat open;
4. wait up to ten seconds;
5. expand message actions;
6. inspect console only after those checks.

### 29.2 No scene selected

Both **►** and **◄** are required for a marked scene. Verify Current Scene in the panel.

If the range overlaps an existing Memory, choose another range or enable Allow Scene Overlap.

### 29.3 No valid Memory Book

Automatic Mode:

- bind a lorebook to the chat; or
- enable Auto-Create.

Manual Mode:

- select a main manual book;
- repair a deleted selection;
- unlock a broken character lock before changing it.

Real multi-book group:

- STLO must be available;
- every required member needs a valid assignment;
- the group book cannot be reused as a character book.

Narrator Mode:

- Manual Mode must be enabled;
- an omniscient book must be selected;
- every declared member needs a unique non-omniscient book.

### 29.4 AI failed to produce a valid Memory

Check in this order:

1. provider/model/profile are valid;
2. response was not truncated;
3. maximum response tokens are sufficient;
4. selected prompt still requires exact JSON;
5. schema was not corrupted by Regex;
6. provider supports the selected structured-output mode;
7. try Skip Structured Output only if the provider rejects schemas;
8. try a more instruction-following model before rewriting the prompt;
9. use the raw response/manual JSON correction interface when available.

Common causes include code fences, commentary, a missing key, keywords not being an array, refusal text, or cut-off output.

### 29.5 Memory saved but messages disappeared

They were probably auto-hidden. Change Token Saving settings. Hidden messages are not deleted.

### 29.6 Automatic Memories did not run

Check:

- Auto-create memory summaries enabled;
- enough messages beyond the highest processed boundary;
- interval plus buffer requirement met;
- no postpone checkpoint still active;
- valid Memory Book available;
- no other Memory job currently blocking the trigger;
- current chat not switched during work;
- group generation finished before the trigger is expected.

A first manual Memory is recommended but not technically required in the current version.

### 29.7 Memory exists but does not activate

Check:

- correct book active;
- entry enabled;
- relevant keywords;
- activation mode;
- budget;
- recursion and Delay Until Recursion;
- STLO routing if used;
- World Info inspection/logs.

Do not regenerate the Memory until retrieval has been tested.

### 29.8 Entry was sent but ignored

This is model-use behavior. Possible responses:

- make the Memory shorter and more explicit;
- improve insertion position/priority;
- reduce competing context;
- use an OOC reminder;
- choose a model that follows supplied context more reliably.

### 29.9 Side Prompt did not run

See Section 16.18. In particular, a selected set suppresses individually enabled prompts outside that set.

### 29.10 Consolidation did not prompt

Verify:

- readiness prompt enabled;
- target tier selected for monitoring;
- enough eligible source entries exist;
- sources are not already disabled/ineligible;
- the saved minimum count for that tier is met.

### 29.11 Regeneration button disabled

Hover or inspect the stated reason. Common causes:

- entry predates required snapshot metadata;
- source chat/range unavailable;
- source entries missing or wrong tier;
- active parent consolidation blocks a lower source;
- original sequence number cannot be determined;
- Side Prompt template deleted.

### 29.12 Branch did not copy books

Check:

- Copy Memory Books when branching was enabled before branch creation;
- it was a native SillyTavern branch;
- source books existed and could be loaded;
- chat was not switched during copying;
- the branch was not previously marked completed/failed;
- locked books were intentionally preserved rather than copied.

### 29.13 Narrator Mode cast is wrong

Check:

- Active Cast selection before generation;
- whether the message was a continuation that merged cast metadata;
- whether a swipe restored older cast state;
- whether the scene contains legacy untagged messages requiring confirmation;
- whether the declared character was retired;
- whether each character book still exists.

---

## 30. FAQ

### Do I need vectors?

No. Keyword activation is sufficient and is generated automatically. Vectors are optional.

### Should Memories use a separate lorebook?

Usually yes for organization, budgeting, reuse, and diagnosis, but it is not mandatory.

### Does STMB delete messages?

No. It can hide processed messages from active context.

### Can I use STMB entirely manually?

Yes. Mark scenes and create Memories only when desired.

### Can automatic Memories create the first Memory?

Yes in current STMB. With no processed baseline, it begins at message 0 once the interval plus buffer is met. A manual first run is still recommended to verify setup and choose the desired starting boundary.

### Does consolidation run automatically?

No. STMB can prompt when a tier is ready, but the user confirms and reviews the operation.

### Can one real group use one Memory Book?

Yes. It is the recommended starting setup and does not require STLO.

### When are separate real-group character books useful?

When individual continuity, knowledge, speaker-specific retrieval, or character-focused summaries justify the extra setup and AI requests.

### Is Narrator Mode the same as Group Chat Mode?

No. Group Chat Mode reads separate SillyTavern character-card authors. Narrator Mode manually declares fictional characters written by one Narrator card.

### Does Narrator Mode require STLO?

No for its active-cast retrieval path. It does require Manual Lorebook Mode, one omniscient book, and unique per-character books.

### Are linked copies synchronized?

No. They are linked for origin/consolidation metadata, not continuous mirroring.

### Why should Delay Until Recursion usually be off?

If no other lorebook entry starts recursion, a delayed Memory entry may never activate.

### What should a user do after the first successful Memory?

Verify entry retrieval, then enable automatic Memories, choose interval/buffer, enable token hiding, and add Clips or a narrowly defined Side Prompt only when needed. Use Topical Clip and Consolidation after enough Memories exist.

---

## 31. Compatibility, Migration, and Current Historical Notes

This section preserves only history that affects current use.

### Current baseline

- Current documented release: v8.5.0, August 1, 2026.
- SillyTavern requirement: 1.14.0 or later.
- Narrator Mode was added in v8.5.0.
- Branch book copying, Side Prompt regeneration, and character Memory Book locks were added in v8.4.0.
- Multi-character real-group Memory distribution arrived in v8.0.0.
- Additional Context moved from profiles to reusable per-chat Context Settings in v7.0.0; older profile context is migrated.
- Topical Clip was added in v6.10.0.
- Compaction and Clips were added in v6.6.0.
- Side Prompt Sets and per-prompt targets were added in the v6.4–v6.5 period.
- Consolidation became a multi-tier Arc-through-Epic system in v6.0.0; older Arc metadata is migrated.
- Job Queue integration was added in v6.8.0 and remains optional.
- Current profile defaults use Delay Until Recursion disabled unless a user/profile explicitly changes it.

### Existing Memories from older versions

Only entries with the `stmemorybooks` flag and required metadata are recognized as STMB Memories. Use the supplied lorebook converter for older entries that predate current metadata.

### Removed functionality

The old bookmark feature was removed from Memory Books in v4.0.0 and split away from the core extension. Do not teach Memory Books bookmark controls as current behavior.

### Localized built-ins

Built-in prompts can be regenerated according to the active SillyTavern language. Back up customized built-ins before recreation.

### Import behavior

Side Prompt import is additive. Existing prompts are preserved; imported key conflicts are renamed rather than overwriting the existing prompt.

---

## 32. Developer and License Notes

Memory Books uses Bun for bundling/minification.

```sh
bun run build
```

Install the repository’s pre-commit build hook with:

```sh
bun run install-hooks
```

The hook builds before commit, stages build artifacts, and aborts if the build fails.

Memory Books is Copyright © 2024–2026 Aiko Hanasaki and licensed under the GNU Affero General Public License v3.0. Modified versions must preserve applicable notices, identify modifications, and comply with AGPL source-availability requirements.

---

## 33. Compact Diagnostic Decision Tree

```text
User says “Memory Books is not working.”
│
├─ Is the menu/control visible?
│  ├─ No → installation/loading/UI checks.
│  └─ Yes
│
├─ Can a scene be selected?
│  ├─ No → expand message actions; set both chevrons; inspect overlap.
│  └─ Yes
│
├─ Is there a valid effective Memory Book?
│  ├─ No → bind, auto-create, select manual, or repair multi-book bindings.
│  └─ Yes
│
├─ Does generation return valid complete output?
│  ├─ No → profile, provider, output tokens, JSON schema, Regex, model.
│  └─ Yes
│
├─ Does the entry exist in the intended book?
│  ├─ No → save/rollback/permission/job failure.
│  └─ Yes
│
├─ Does SillyTavern activate and send it later?
│  ├─ No → keywords, activation mode, book binding, budget, recursion, STLO.
│  └─ Yes
│
└─ Does the model use the supplied entry?
   ├─ No → model compliance, placement, competing context, entry clarity.
   └─ Yes → workflow is functioning.
```

---

## 34. Minimum Recommended Teaching Sequence

For a new user, teach only this sequence first:

1. Open the magic-wand menu and find Memory Books.
2. Use Automatic Mode with a bound book or enable Auto-Create.
3. Select Current SillyTavern Settings.
4. Expand message actions and mark a short complete scene with **►** and **◄**.
5. Create and preview one Memory.
6. Open the Memory Book and verify the saved entry.
7. Verify that the entry can activate later.
8. Enable automatic Memories and choose interval/buffer.
9. Enable auto-hide only after explaining that hidden messages are not deleted.
10. Introduce Clips, then Side Prompts, then Topical Clip/Consolidation only when the user has a concrete need.

Do not begin with custom prompts, Full Manual endpoints, multiple character books, Regex, or consolidation unless the user’s actual problem requires them.

---

## 35. Final Concept Summary

Memory Books is an external continuity pipeline built on SillyTavern lorebooks:

```text
Select or schedule chat material
→ generate a structured representation
→ save it with retrieval metadata
→ optionally hide processed transcript
→ let SillyTavern retrieve relevant entries later
```

The system works best when:

- scenes are coherent;
- prompts clearly distinguish target from reference context;
- JSON workflows return exact schemas;
- keywords are concrete;
- Memory Books are deliberately assigned and activated;
- long-running trackers prune stale state;
- consolidation reduces old detail without erasing continuity;
- users verify retrieval rather than assuming saved means sent;
- advanced multi-book routing is used only when its precision is worth the complexity.
