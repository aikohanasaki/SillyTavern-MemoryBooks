# 📕 ST Memory Books - Your AI Chat Memory Assistant

**Turn your endless chat conversations into organized, searchable memories!** 

Need the bot to remember things, but the chat is too long for context? Want to automatically track important plot points without manually taking notes? ST Memory Books does exactly that - it watches your chats and creates smart summaries so you never lose track of your story again.

(Looking for some behind-the-scenes technical detail? Maybe you want [How STMB Works](userguides/howSTMBworks-en.md) instead.)

## 📑 Table of Contents

- [Quick Start](#-quick-start-5-minutes-to-your-first-memory)
- [What ST Memory Books Actually Does](#-what-st-memory-books-actually-does)
- [Choose Your Style](#-choose-your-style)
- [Clip to Memory Book](#%EF%B8%8F-clip-to-memory-book)
- [Clips vs Side Prompts](#️-clips-vs-side-prompts)
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

## ✂️ Clip to Memory Book

Use **Clip to Memory Book** when you want to save one important line or fact without creating a full scene memory. Highlight text in chat, click the floating scissors button, then choose an existing clip entry or create a new one.

Not sure whether this should be a clip or a side prompt? See [Clips vs Side Prompts](#-clips-vs-side-prompts).

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

## ✂️ Clips vs Side Prompts

Clips and Side Prompts both save information into your Memory Book, but they are not for the same job.

Plain rule: **Clips save a specific fact. Side Prompts maintain a living tracker.**

| **Clips** | **Side Prompts** |
|---|---|
| Save selected chat text into a Memory Book entry. | Ask the AI to review chat and update a tracker entry. |
| Best for one clear fact, line, promise, preference, item, or note. | Best for information that changes over time, like relationship status, quest progress, inventory, or unresolved plot threads. |
| You choose the exact text. STMB saves what you selected. | The AI interprets the chat and writes or updates the tracker. |
| Use when the fact is already obvious and does not need analysis. | Use when the AI needs to compare, summarize, or update state from multiple messages. |
| Usually grows only when you manually add another clip. | Can update repeatedly as the story changes. |
| Think: “pin this note.” | Think: “keep this section updated.” |

Examples of good Clips:

- `Aiko likes honey tea.`
- `Andalino promised not to lie to her again.`
- `Colt calls her Boss.`

Examples of good Side Prompts:

- relationship status
- current quest progress
- inventory and resources
- NPC directory
- unresolved plot threads

If you only need one remembered detail, use a Clip. If you need an ongoing tracker, use a Side Prompt.

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
