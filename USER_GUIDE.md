<!--
Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only
-->

# 📕 ST Memory Books - Your AI Chat Memory Assistant

**Turn your endless chat conversations into organized, searchable memories!** 

Need the bot to remember things, but the chat is too long for context? Want to automatically track important plot points without manually taking notes? ST Memory Books does exactly that - it watches your chats and creates smart summaries so you never lose track of your story again.

(Looking for some behind-the-scenes technical detail? Maybe you want [How STMB Works](userguides/howSTMBworks-en.md) instead.)

## 📑 Table of Contents

- [Quick Start](#-quick-start-5-minutes-to-your-first-memory)
- [What ST Memory Books Actually Does](#-what-st-memory-books-actually-does)
- [Choose Your Style](#-choose-your-style)
- [Group Chats](#-group-chats)
- [Clip to Memory Book](#%EF%B8%8F-clip-to-memory-book)
- [Topical Clip](#-topical-clip)
- [Clips, Topical Clips, and Side Prompts](#clips-topical-clips-and-side-prompts)
- [Token Saving: Hide/Unhide Messages](#-token-saving-hide--unhide-messages)
- [Compaction vs Consolidation](#-compaction-vs-consolidation)
- [Summary Consolidation](#-summary-consolidation)
- [Trackers, Side Prompts, & Templates](#-trackers-side-prompts--templates-advanced-feature)
- [Compaction](#-compaction)
- [Settings That Matter First](#️-settings-that-matter-first)
- [Troubleshooting](#-troubleshooting-when-things-dont-work)
- [What ST Memory Books Doesn't Do](#-what-st-memory-books-doesnt-do)
- [Getting Help & More Info](#-getting-help--more-info)
- [Power Up with Lorebook Ordering (STLO)](#-power-up-with-lorebook-ordering-stlo)

---

## 🚀 Quick Start (5 Minutes to Your First Memory!)

**New to ST Memory Books?** Let's get you set up with your first automatic memory in just a few clicks:

### Step 1: Find the Extension
- Look for the magic wand icon (🪄) next to your chat input box
- Click it, then click **"Memory Books"**
- You'll see the ST Memory Books control panel

### Step 2: Turn On Auto-Magic
- In the control panel, find **"Auto-create memory summaries"**
- Turn it ON
- Set **Auto-Summary Interval** to **20-30 messages** (good starting point).
- Leave **Auto-Summary Buffer** low at first (`0-2` is a good beginner range)
- Create one manual memory first so the chat is primed
- That's it! 🎉

### Step 3: Chat Normally
- Keep chatting as usual
- After 20-30 new messages, ST Memory Books will automatically:
  - Use the new messages since the last processed checkpoint
  - Ask your AI to write a summary
  - Save it to your memory collection
  - Show you a notification when done

**Congratulations!** You now have automated memory management. No more forgetting what happened chapters ago!

---

## 💡 What ST Memory Books Actually Does

Think of ST Memory Books as your **personal AI librarian** for chat conversations:

### 🤖 **Automatic Summaries** 
*"I don't want to think about it, just make it work"*
- Watches your chat in the background
- Automatically creates memories every X messages
- Perfect for long roleplays, creative writing, or ongoing stories

### ✋ **Manual Memory Creation**
*"I want control over what gets saved"*
- Mark important scenes with simple arrow buttons (► ◄)
- Create memories on-demand for special moments
- Great for capturing key plot points or character developments

### 📊 **Side Prompts & Smart Trackers** 
*"I want to track relationships, plot threads, or stats"*
- Reusable prompt snippets that enhance memory generation
- Template library with ready-to-use trackers
- Custom AI prompts that track anything you want
- Automatically update scoreboards, relationship status, plot summaries
- Examples: "Who likes who?", "Current quest status", "Character mood tracker"

### 📚 **Memory Collections**
*Where all your memories live*
- Automatically organized and searchable
- Works with SillyTavern's built-in lorebook system
- Your AI can reference past memories in new conversations

---

## 🎯 Choose Your Style

<details>
<summary><strong>🔄 "Set and Forget" (Recommended for Beginners)</strong></summary>

**Perfect if you want:** Hands-off automation that just works

**How it works:**
1. Turn on `Auto-create memory summaries`
2. Set `Auto-Summary Interval` to a range that fits your chat speed
3. Optionally set a small `Auto-Summary Buffer` if you want belated generation
4. Keep chatting normally after priming the chat with one manual memory

**What you get:** 
- No manual work required
- Consistent memory creation
- Never miss important story beats
- Works in both single and group chats

**Pro tip:** Start with 30 messages, then adjust based on your chat style. Fast chats might want 50+, slower detailed chats might prefer 20.

</details>

<details>
<summary><strong>✋ "Manual Control" (For Selective Memory Making)</strong></summary>

**Perfect if you want:** To decide exactly what becomes a memory

**How it works:**
1. Look for small arrow buttons (► ◄) on your chat messages
2. Click ► on the first message of an important scene
3. Click ◄ on the last message of that scene  
4. Open Memory Books (🪄) and click "Create Memory"

**What you get:**
- Complete control over memory content
- Perfect for capturing specific moments
- Great for complex scenes that need careful boundaries

**Pro tip:** The arrow buttons appear within a few seconds after loading a chat. If you don't see them, wait a moment or refresh the page.

</details>

<details>
<summary><strong>⚡ "Power User" (Slash Commands)</strong></summary>

**Perfect if you want:** Keyboard shortcuts and advanced features

**Essential commands:**
- `/scenememory 10-25` - Create memory from messages 10 to 25
- `/creatememory` - Make memory from currently marked scene
- `/nextmemory` - Summarize everything since the last memory
- `/sideprompt "Relationship Tracker" {{macro}}="value" [X-Y]` - Run a side prompt, optionally supplying required runtime macros and an optional message range
- `/sideprompt-on "Name"` or `/sideprompt-off "Name"` - Toggle a side prompt manually
- `/stmb-set-highest <N|none>` - Adjust the auto-summary baseline for the current chat

**What you get:**
- Lightning-fast memory creation
- Batch operations
- Integration with custom workflows

</details>

---

## 👥 Group Chats

Yes, ST Memory Books works with group chats! You can mark scenes, make memories manually, use automatic summaries, and run slash commands just like you would in a one-on-one chat.

You do **not** need to find a hidden “group mode” switch. Open your group chat and use STMB normally.

### What happens to a group memory?

STMB pays attention to who spoke during the scene. When it can identify the participants, it adds those characters to the memory's character filter. In plain English: the memory stays connected to the people who were actually there instead of treating the whole group like one giant character.

The summary prompt is also written to keep names and knowledge separate. If Alice made a promise and Bob learned a secret, the memory should say exactly that—not blur everything into “they knew and felt the same things.”

### The easy setup: one Memory Book for the group

This is the setup I recommend starting with.

1. Bind a lorebook to the group chat.
2. Create memories normally.
3. That's it! STMB saves the memories to the group Memory Book and adds participant filters when it can identify the speakers.

If **Auto-create lorebook if none exists** is enabled, STMB can make and bind the group Memory Book for you.

This setup is best when everyone shares the same general story history and you do not need to maintain separate versions of each memory.

### The advanced setup: separate character Memory Books

Want the group to have one shared history while each character also keeps their own relevant memories? You can do that with **Manual Lorebook Mode** and [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering).

1. Install and enable STLO.
2. Open the group chat.
3. Turn on **Manual Lorebook Mode** in Memory Books.
4. Select the main group Memory Book.
5. Under **Group Character Lorebooks**, choose a Memory Book for every group member. The main group Memory Book cannot also be selected as a character Memory Book.
6. Create your memory.
7. Check the participant list before generation. STMB will preselect the characters it found in the scene.

The main version goes into the group Memory Book. Copies go only to the selected participants' assigned Memory Books. If you leave every participant unchecked, STMB treats the memory as applying to the whole group.

During Summary Consolidation, this advanced setup automatically uses **Group Chat Consolidation Analysis (Automatic)** for the main group Memory Book. That prompt maintains an omniscient group timeline without treating every fact as shared character knowledge. Each character Memory Book still uses the consolidation preset you selected in the consolidation popup. This remains true when several characters share one assigned character Memory Book.

When you assign a character Memory Book, STMB also adds that character to the lorebook's STLO `characterOverrides` metadata and enables **Only activate for specific characters**. Existing STLO priority, budget, order, and character settings are preserved. Older assignments are updated automatically when you open Memory Books or create a memory.

Clearing or changing the assignment does not remove the old STLO character filter. If that lorebook should no longer activate for the character, open STLO and remove the retained override there.

If you are happy with STMB's participant detection, check **Automatically accept detected participants in future** so you do not have to confirm the list every time.

### Optional: write a shared version and a character-focused version

Open **Profile Manager**, edit your memory profile, and enable **Use separate group and character prompts in group chats**.

- **Group Summary Prompt** writes the shared group memory.
- **Character Summary Prompt** writes a character-focused version for an individually assigned character Memory Book when using the advanced Manual Mode + STLO setup. If several members share one assigned Memory Book, STMB keeps one shared copy there instead.

This can be wonderful when characters know different things, care about different parts of the scene, or need their own emotional continuity. It also makes extra AI requests, so I would leave it off unless you actually want those separate versions.

### A few things to remember

- Group-chat settings and progress belong to the current chat. Switching to another group or chat does not carry the scene markers or processed-message baseline with you.
- In Manual Mode, every group member needs a valid assigned lorebook before STMB can save the distributed memory.
- You can assign the same character Memory Book to more than one group member.
- If speaker names are unusual or duplicated, review the participant list instead of automatically accepting it.

**My recommendation:** begin with one group Memory Book. Move to separate character Memory Books only when your story genuinely needs private knowledge or individual continuity. Simple is good until it stops being enough.

---

## ✂️ Clip to Memory Book

Use **Clip to Memory Book** when you want to save one important line or fact without creating a full scene memory. Highlight text in chat, click the floating scissors button, then choose an existing clip entry or create a new one.

Not sure whether to use a Clip, Topical Clip, or Side Prompt? See [Clips, Topical Clips, and Side Prompts](#clips-topical-clips-and-side-prompts).

### When should I use clips?

Clips are best for small facts you want the AI to remember, such as:

- a character preference
- a promise or secret
- a relationship detail
- a pet, place, item, or recurring detail
- a quick “note to self” that does not need a full memory summary

For larger scenes, use normal Memory creation instead.

### How clipping works

1. Highlight the sentence or phrase you want to save.
2. Click the floating scissors button.
3. Choose an existing clip entry, or create a new one.
4. Review the entry preview.
5. Save the clip.

Clip entries are normal lorebook entries marked with `[STMB Clip]`. For example:

```txt
Seraphina Healed Me [STMB Clip]
```

Inside the entry, STMB keeps the content in a clean section format:

```md
=== Seraphina Healed Me ===

- Seraphina healed my wounds with magic.

=== END Seraphina Healed Me ===
```

### Creating or renaming clip entries

When you create a new clip entry, the entry title also becomes the section heading. You can rename the entry while clipping, and STMB will update the section heading to match.

New clip entries can be:

- **always active**, for facts that should always be available
- **keyword-triggered**, for facts that should only appear when matching words come up

Use keywords when the clip is only relevant to a specific topic, character, place, pet, item, or relationship.

### Floating scissors button

The floating scissors button only appears after you highlight text inside the chat. You can turn this button on or off in the main Memory Books popup.

### Reviewing long clip entries

If a clip entry gets long, STMB may remind you to review it. You can edit it yourself, or use **Compaction** to ask the AI to make a clip, side prompt, or STMB memory entry more token-efficient before you choose whether to replace the original.

---

## 🔎 Topical Clip

Topical Clip creates a focused Memory Book entry about one subject by gathering relevant information from memories you have already saved.

Think of it as asking STMB:

> “Read my existing memories and collect everything useful about this person, relationship, place, object, mystery, or plot thread.”

For example, your Memory Book may contain separate scene memories in which:

* Seraphina first demonstrated healing magic
* Seraphina explained where she learned it
* Seraphina healed `{{user}}`
* someone later revealed that her magic has a hidden cost

Those facts are scattered across several chronological memories. Topical Clip can gather them into one focused entry such as:

```txt
About Seraphina's Healing Magic [STMB Clip]
```

The resulting entry is organized around the topic rather than around the order in which events happened.

### Clip vs. Topical Clip

The simplest distinction is:

> **A Clip saves text from the chat. A Topical Clip gathers information from saved memories.**

| **Clip to Memory Book**                                      | **Topical Clip**                                                           |
| ------------------------------------------------------------ | -------------------------------------------------------------------------- |
| Starts with text you highlight in the current chat.          | Starts with STMB memory entries already saved in a Memory Book.            |
| Saves the wording you selected.                              | Uses an AI to find, combine, and reorganize relevant details.              |
| Best for one clear fact, line, promise, preference, or note. | Best when information about one subject is spread across several memories. |
| Does not need the AI to interpret the information.           | Uses the selected Generation Profile because the AI writes the draft.             |
| Think: “Save this.”                                          | Think: “Gather everything about this.”                                     |

Both are saved as normal lorebook entries marked with `[STMB Clip]`, but they are created in different ways.

### When to use Topical Clip

Use Topical Clip when you want one easily retrieved entry about:

* a recurring character or NPC
* a relationship between characters
* a location or faction
* a mystery or investigation
* a character’s powers, injuries, preferences, promises, or secrets
* an important object
* an unresolved plot thread
* any subject that appears across multiple scenes

Example topics include:

```txt
Seraphina
Seraphina's healing magic
Alex and Mira's relationship
The Black Harbor investigation
The silver key
What Elliott knows about the conspiracy
```

Choose a reasonably specific topic. `Seraphina` may produce a broad character reference, while `Seraphina's healing magic` will produce a much narrower entry.

### When not to use Topical Clip

Use another feature when:

* **You are looking directly at the fact you want to save:** use **Clip to Memory Book**.
* **You want to summarize one scene:** create a normal **Memory**.
* **You want an entry to be maintained as the story continues:** use a **Side Prompt**.
* **You want to shorten one long entry:** use **Compaction**.
* **You want to combine several memories into a chronological higher-level recap:** use **Summary Consolidation**.

Topical Clip is not another form of consolidation. Consolidation summarizes a sequence of memories into a larger narrative recap. Topical Clip searches across memories for information about one subject and reorganizes it into an “about this” reference entry.

### How to create a Topical Clip

1. Open the **Memory Books** popup.
2. Click **🔎 Topical Clip**.
3. Choose the **Source Memory Book**.
4. Enter the **Topic** you want the entry to cover.
5. Enter the lorebook activation **Keywords**.

   * If you leave this field empty, STMB uses the topic as the keyword.
6. Choose **Create new Topical Clip**.
7. Optional: enable **Use only selected memories** if you do not want the AI to read every eligible memory in the book.
8. Choose a **Generation Profile**.
9. Click **Generate Draft**.
10. Review and edit the generated draft.
11. Click **Save Topical Clip** when the entry contains what you want.

STMB does not save the AI response automatically. You can edit the draft before anything is written to the Memory Book.

A new entry is normally given a title such as:

```txt
About Seraphina [STMB Clip]
```

It is saved as a keyword-triggered Clip-style entry using the keywords you supplied.

### Updating an existing Topical Clip

You can update an existing Topical Clip after new memories are created.

1. Open **Topical Clip**.
2. Choose **Update existing entry**.
3. Select the `[STMB Clip]` entry you want to update.
4. Confirm the topic and activation keywords.
5. Generate and review the new draft.
6. Save it only after checking the result.

After a successful Topical Clip run, STMB records which source memories were used. During the next update, it normally sends only source memories that are new or have changed.

This allows the AI to merge new information into the existing entry without rereading the entire Memory Book every time.

Enable **Rebuild from all source memories** when:

* the existing entry is incomplete
* you changed the Topical Clip prompt
* earlier memories were substantially edited
* the entry has become disorganized
* you want the AI to reconsider the entire topic from scratch

A rebuild includes all eligible source memories instead of only new or changed ones.

### Choosing source memories manually

Enable **Use only selected memories** when the Memory Book is large or when you already know which memories contain the relevant material.

This can help when:

* the topic appears only during one part of the story
* unrelated memories would make the request unnecessarily large
* two people or places have similar names
* you want to build an entry from a carefully controlled set of sources

Without this option, STMB automatically uses all eligible source memories—or only new and changed memories when updating an existing Topical Clip.

### Large requests and token warnings

Topical Clip estimates the size of the request before generation. The popup shows how many memories are eligible, how many will be used, and the configured token warning threshold.

If the request exceeds that threshold, STMB warns you before sending it. You can:

- select fewer source memories
- raise the token warning threshold in settings
- choose **Run Once Anyway** for that request

### What Topical Clip uses as source material

Topical Clip reads confirmed STMB memory entries from the selected Memory Book.

It does not use:

* raw chat messages
* ordinary Clip entries
* Side Prompt entries
* unrelated ordinary lorebook entries

This prevents existing notes and trackers from being mistaken for original memory evidence.

### Review the draft

Topical Clip uses an AI to select and reorganize information. Always review the generated draft before saving it.

Check that it:

* stayed focused on the requested topic
* preserved names and important facts correctly
* did not omit a major detail
* did not include unrelated events
* clearly notes contradictions instead of silently choosing one version
* did not invent explanations unsupported by the source memories

You may freely edit the draft before saving.

### Prompt editing

The Topical Clip prompt is editable.

The default prompt tells the AI to:

* extract only information related to the topic
* avoid unrelated events
* preserve names, relationships, preferences, promises, secrets, constraints, and unresolved issues
* mention conflicts instead of silently choosing one version
* update existing Clip content without duplicating it
* avoid inventing missing details

The prompt must include:

```txt
{{SOURCE_MEMORIES}}
```

Without that placeholder, STMB will not know where to put the source memories.

Other supported placeholders include:

```txt
{{MODE}}
{{TOPIC}}
{{KEYWORDS}}
{{EXISTING_CLIP}}
{{EXISTING_ENTRY_CONTENT}}
{{SOURCE_MEMORIES}}
```

Use **Reset to Default** if your custom prompt stops working well.


## Clips, Topical Clips, and Side Prompts

| **Clip**                                | **Topical Clip**                                  | **Side Prompt**                                                        |
| --------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------- |
| Saves selected chat text.               | Extracts one topic from saved memories.           | Maintains a specialized tracker.                                       |
| Usually captures one fact or quotation. | Combines related facts from multiple memories.    | Reviews new story material and updates changing information.           |
| You decide exactly what text is added.  | The AI prepares a focused draft for your review.  | The AI follows tracker instructions and rewrites or updates the entry. |
| Updated manually by clipping more text. | Updated manually when you run Topical Clip again. | Can run repeatedly as part of your memory workflow.                    |
| Think: “Save this note.”                | Think: “Gather everything about this.”            | Think: “Keep track of this.”                                           |

A practical rule:

* Use **Clip** when the information is already in front of you.
* Use **Topical Clip** when the information is scattered across saved memories.
* Use **Side Prompt** when the information needs to be actively maintained as the story changes.


---

## 🙈 Token Saving: Hide / Unhide Messages

One of the easiest ways to reduce clutter and save tokens in long chats is to hide messages after you have already turned them into memories.

### What does “hide” mean?

Hiding messages does **not** delete them. It only hides them from the AI. Your chat messages are still there, and your memories still remain in the lorebook, so the important information is not lost; it's just not sent directly to the AI.

### Why would I use this?

Hide/unhide is helpful when:
- your chat has become very long
- you already made memories for those messages

### Auto-hide after memory creation

STMB can automatically hide messages after a memory is created. You can choose:

- **Do not auto-hide**: leaves everything visible (you can hide messages manually with `/hide x-y`)
- **Auto-hide all messages up to the last memory**: hides everything already covered by memory creation
- **Auto-hide only messages in the last memory**: hides just the most recent processed range

You can also choose how many recent messages stay visible with **Messages to leave unhidden**.

### Unhide before memory generation

The setting **Unhide hidden messages for memory generation** tells STMB to temporarily run `/unhide X-Y` for the selected range before generating the memory. Use this if you tend to re-do memories. 

### Good beginner setup

Aiko's settings:
- use **Auto-hide messages up to the last memory**
- leave **2 messages unhidden**
- turn on **Unhide hidden messages for memory generation**

---

## 🧭 Compaction vs Consolidation

The names are similar, but they do different jobs.

Plain rule: **Compaction cleans up one entry. Consolidation combines several memories into a higher-level recap.**

| **Compaction** | **Consolidation** |
|---|---|
| Makes one existing STMB-managed entry smaller. | Combines multiple memories or summaries into one higher-level recap. |
| Works on one Clip, Side Prompt entry, or STMB memory entry at a time. | Works from several selected memory/summary entries. |
| Best when an entry is useful, but too long, repetitive, or expensive to keep in context. | Best when older scene memories are piling up and should become an Arc, Chapter, Book, Legend, Series, or Epic summary. |
| Rewrites the selected entry in a more token-efficient form. | Creates a new summary entry from the selected source entries. |
| Should preserve existing facts and remove bloat. | Should preserve the larger continuity arc and reduce scene-by-scene detail. |
| Does not create a new memory from raw chat. | Does not compact one bloated entry by itself. |
| Think: “trim this one entry.” | Think: “roll these memories up into a recap.” |

Both tools are review-first. STMB shows you what the AI wrote before anything is saved or replaced.

---

## 🌈 Summary Consolidation

Summary Consolidation helps keep long stories manageable by compressing older STMB memories into higher-level recap entries.

### Q: What is Summary Consolidation?

**A:** Instead of only creating scene-level memories forever, STMB can combine existing memories or summaries into a more compact recap. The first tier is **Arc**, and higher recap tiers are also available for longer stories:

- Arc
- Chapter
- Book
- Legend
- Series
- Epic

### Q: Why use it?

**A:** Consolidation is useful when:

- Your memory list is getting long
- Older entries no longer need full scene-by-scene detail
- You want to reduce token usage without losing continuity
- You want cleaner, higher-level narrative recaps

### Q: Does it run automatically?

**A:** No. Consolidation still requires confirmation.

- You can always open **Consolidate Memories** manually from the main popup
- You can also enable **Prompt for consolidation when a tier is ready**
- When a selected target tier reaches its saved minimum eligible count, STMB shows a **yes/later** confirmation
- Choosing **Yes** opens the consolidation popup with that tier selected; it does not silently run by itself

### Q: How do I use it?

**A:** To create a consolidated summary:

1. Click **Consolidate Memories** in the main STMB popup
2. Choose the target summary tier
3. Pick the source entries you want included
4. Optionally disable the source entries after the new summary is created
5. Click **Run**

For previews of these entries, enable "show previews" in your preferences.

---

## 🎨 Trackers, Side Prompts, & Templates (Advanced Feature)

**Side Prompts** are background trackers that help maintain ongoing story information. They run alongside memory creation and update separate side-prompt lorebook entries over time. Think of them as **helpers that watch your story and keep certain details up to date**.

If you only want to save one highlighted fact, use [Clip to Memory Book](#%EF%B8%8F-clip-to-memory-book) instead. Side Prompts are for repeated or ongoing tracking.

### 🚀 **Quick Start with Templates**

1. Open Memory Books settings
2. Click **Side Prompts**
3. Browse the **template library** and choose what fits your story:

   * **Character Development Tracker** – Tracks personality changes and growth
   * **Relationship Dynamics** – Tracks relationships between characters
   * **Plot Thread Tracker** – Tracks ongoing storylines
   * **Mood & Atmosphere** – Tracks emotional tone
   * **World Building Notes** – Tracks setting details and lore
4. Enable the templates you want (you can customize them later)
5. If the template uses automatic triggers, STMB will keep that side-prompt entry updated alongside memory creation

[Scribe showing step by step process to enable automatic side prompts](https://scribehow.com/viewer/How_to_Enable_Side_Prompts_in_Memory_Books__fif494uSSjCmxE2ZCmRGxQ)

### ⚙️ **How Side Prompts Work**

* **Background Trackers**: They run quietly and update information over time
* **Non-Intrusive**: They do not change your main AI settings or character prompts
* **Per-Chat Control**: Different chats can use different trackers
* **Template-Based**: Use built-in templates or create your own
* **Automatic or Manual**: Standard templates can run automatically; templates with custom runtime macros are manual-only
* **Macro Support**: `Prompt`, `Response Format`, `Title`, and keyword fields can expand standard ST macros like `{{user}}` and `{{char}}`
* **Runtime Macros**: Non-standard `{{...}}` tokens become required command inputs such as `{{npc name}}="Jane Doe"`
* **Plain Text Allowed**: Side prompts do not have to return JSON
* **Overwrite Behavior**: Side prompts update their own tracked entry over time instead of creating a new sequential memory every run

### 🛠️ **Managing Side Prompts**

* **Side Prompts Manager**: Create, edit, duplicate, and organize trackers
* **Enable / Disable**: Turn trackers on or off at any time
* **Import / Export**: Share templates or back them up
* **Status View**: See which trackers are active in the current chat and when they run
* **Safety Checks**: If a template contains custom runtime macros, STMB strips automatic triggers on save/import and shows a warning toast

### 💡 **Template Examples**

* Side Prompt Template Library (import this JSON):
  [SidePromptTemplateLibrary.json](/resources/SidePromptTemplateLibrary.json)

Example prompt ideas:

* “Track important dialogue and character interactions”
* “Keep the current quest status up to date”
* “Note new world-building details when they appear”
* “Track the relationship between Character A and Character B”

### 🔧 **Creating Custom Side Prompts**

1. Open Side Prompts Manager
2. Click **Create New**
3. Write a short, clear instruction
   *(example: “Always note what the weather is like in each scene”)*
4. Optionally add standard ST macros like `{{user}}` or `{{char}}`
5. If you add custom runtime macros like `{{location name}}`, run it manually with `/sideprompt "Name" {{location name}}="value"`
6. Save and enable it
7. The tracker will now update this information over time if it uses automatic triggers; otherwise run it manually when needed

### 💬 **Pro Tip**

Side Prompts work best when they are **small and focused**.
Instead of “track everything,” try “track romantic tension between the main characters.”

### ⌨️ **Manual /sideprompt Syntax**

Use:
`/sideprompt "Name" {{macro}}="value" [X-Y]`

Examples:
- `/sideprompt "Status" 10-20`
- `/sideprompt "NPC Directory" {{npc name}}="Jane Doe" 40-50`
- `/sideprompt "Location Notes" {{place name}}="Black Harbor" 100-120`

Notes:

- The side prompt name must be quoted.
- Runtime macro values must be quoted.
- Slash-command autocomplete will suggest required runtime macros after you choose the side prompt.
- If a template contains custom runtime macros, STMB keeps it manual-only and strips automatic triggers.
- `X-Y` is optional. If you omit it, STMB uses messages since the last time that side prompt was updated.
- If you run side prompts manually and separately, remember to turn on `unhide before generation`!

---

### 🧠 Advanced Text Control with the Regex Extension

**Want ultimate control over the text STMB sends to and receives from the AI?** STMB can run selected Regex scripts before generation and before saving.

This is useful when you want to:
- Clean repetitive junk out of AI responses
- Normalize names or terminology before generation
- Reformat text before STMB parses or previews it

#### **How It Works Now**

1. Create any scripts you want in SillyTavern's **Regex** extension
2. In STMB, turn on **Use regex (advanced)**
3. Click **📐 Configure regex…**
4. Choose which scripts STMB should run:
   - before sending text to the AI
   - before adding the response to the lorebook

#### **Important Behavior**

- Regex selection for STMB is controlled inside **STMB**, not by the script's enabled/disabled state in the Regex extension
- A script selected in STMB can still run even if it is disabled in the Regex extension itself
- STMB supports multi-select for both outgoing and incoming processing

#### **Quick Example**

If your model keeps adding `(OOC: I hope this summary is helpful!)`, you can:

1. Create a Regex script that removes that text
2. Turn on **Use regex (advanced)** in STMB
3. Open **📐 Configure regex…**
4. Add that script to the **incoming** selection

Now STMB will clean the response before previewing or saving it.

---

## 🧹 Compaction

Compaction helps when an STMB-managed lorebook entry is still useful, but has become too long or repetitive. Instead of manually trimming it, you can ask the AI to rewrite the entry in a more token-efficient form.

Not sure whether you want this or Summary Consolidation? Use the short version above: **Compaction cleans up one entry. Consolidation combines several memories into a higher-level recap.**

This is a **review first** tool. STMB shows you the original and the compacted draft before replacing anything.

### What can be compacted?

Compaction can list these entries from a selected Memory Book:

- Clip entries
- Side Prompt tracker entries
- STMB memory entries

It does not show ordinary lorebook entries that STMB does not manage.

### How to use Compaction

1. Open the Memory Books popup.
2. Click **📝 Compaction**.
3. Select the **Memory Book** you want to review. If your current chat already has a Memory Book, it may be selected automatically.
4. Select a **Compaction Profile**. This chooses which AI connection/model will rewrite the entry.
5. Optional: click **Edit Compaction Prompt** if you want to change the rewrite instructions.
6. Find the entry in the table and click **Compact Entry**.
7. Review the result:
   - **Original content** shows what is currently saved.
   - **Compacted draft** shows the AI rewrite.
   - Both show estimated token counts.
8. Edit the compacted draft if needed.
9. Choose one:
   - **Replace with Compacted Version** to save the draft over the original entry.
   - **Copy Compacted Draft** to copy it without saving.
   - **Cancel** to leave the entry unchanged.

STMB should never silently replace the original. If you do not click **Replace with Compacted Version**, the lorebook entry stays as it was.

### Editing the Compaction Prompt

The Compaction Prompt controls how the AI rewrites entries. The built-in prompt is intentionally conservative: preserve important facts, names, pronouns, macros, wrapper headings, and end markers; remove repetition and low-value wording; do not invent anything.

The prompt supports these placeholders:

- `{{ENTRY_CONTENT}}` — the current entry content. This is required.
- `{{ENTRY_KIND}}` — the entry type, such as Clip, SidePrompt, or Memory.
- `{{ENTRY_TITLE}}` — the entry title.

Use **Reset to Default** if your custom prompt stops behaving well.

### Good uses

Use Compaction for:

- long Clip entries
- Side Prompt trackers that repeat themselves over time
- memory entries that are correct but bloated
- always-active entries that are costing too many tokens

Do not use it for:

- creating a new memory from chat
- adding new facts
- fixing missing continuity that was never in the entry
- editing normal lorebook entries outside STMB

Compaction is a cleanup tool, not a memory-generation tool.

---

## ⚙️ Settings That Matter First

This guide is not the full settings reference. For the complete setting-by-setting list, use [readme.md](readme.md).

The controls most users should learn first are:
- **Current SillyTavern Settings**: uses your active ST connection directly without creating a custom provider profile
- **Create your own STMB Profile**: lets you customize STMB eg. use a different/cheaper model for memories vs roleplay
- **Auto-hide/unhide memories**: the token savings that you make memories for!
- **Manual Lorebook Mode** and **Auto-create lorebook if none exists**: control where memories are stored
- **Show memory previews**: lets you review or edit AI output before saving
- **Auto-create memory summaries**: turns automatic memory generation on
- **Auto-Summary Interval** and **Auto-Summary Buffer**: control when automatic memory generation runs
- **Side Prompts**: enables trackers

---

## 🔧 Troubleshooting (When Things Don't Work)

This guide is not the full troubleshooting matrix. For the detailed list, use [readme.md](readme.md).

The fastest first checks are:

- Make sure STMB is enabled and the **Memory Books** menu item appears under the extensions wand
- If auto-summary is not firing, verify that you created one manual memory first and that your interval/buffer settings are reasonable
- If memories cannot be saved, make sure a lorebook is bound to the chat or that **Auto-create lorebook if none exists** is enabled
- If memories aren't triggering, make sure "delay until recursion" is disabled.
- If regex behavior seems wrong, check the selections inside **📐 Configure regex…** rather than only checking the Regex extension
- If consolidation is not prompting, confirm that **Prompt for consolidation when a tier is ready** is enabled and that the target tier is included in **Auto-Consolidation Tiers**

---

## 🚫 What ST Memory Books Doesn't Do

- **Not a general lorebook editor:** This guide focuses on entries created by STMB. For general lorebook editing, use SillyTavern\'s built-in lorebook editor.

---

## 💡 Getting Help & More Info

- **More detailed info:** [readme.md](readme.md)
- **Latest updates:** [changelog.md](changelog.md)
- **Community support:** Join the SillyTavern community on Discord! (Look for the 📕ST Memory Books thread or DM @tokyoapple for direct help.)
- **Bugs/features:** Found a bug or have a great idea? Open a GitHub issue in this repository.

---

### 📚 Power Up with Lorebook Ordering (STLO)

For advanced memory organization and deeper story integration, use STMB together with [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md). See the guide for best practices, setup instructions, and tips!
