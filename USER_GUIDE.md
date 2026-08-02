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
- [Catch-Up for Existing Chats](#-catch-up-for-existing-chats)
- [Group Chat Mode](#-group-chat-mode)
- [Narrator Mode](#-narrator-mode)
- [Branching Chats](#-branching-chats)
- [Clip to Memory Book](#%EF%B8%8F-clip-to-memory-book)
- [Topical Clip](#-topical-clip)
- [Clips, Topical Clips, and Side Prompts](#clips-topical-clips-and-side-prompts)
- [Token Saving and the Memory Boundary](#-token-saving-and-the-memory-boundary)
- [Previous Memories and Additional Context](#-previous-memories-and-additional-context)
- [Memory Count Macros](#-memory-count-macros)
- [Compaction vs Consolidation](#-compaction-vs-consolidation)
- [Summary Consolidation](#-summary-consolidation)
- [Trackers, Side Prompts, & Templates](#-trackers-side-prompts--templates-advanced-feature)
- [Compaction](#-compaction)
- [Regenerating Entries](#-regenerating-entries)
- [Advanced Memory Profiles](#-advanced-memory-profiles)
- [Prompt Managers and Previews](#-prompt-managers-and-previews)
- [Job Queue and Retry Controls](#-job-queue-and-retry-controls)
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
- Separate prompt runs that maintain support entries without changing the normal character reply
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

## 🧳 Catch-Up for Existing Chats

`/stmb-catchup` converts a long existing chat into a series of normal scene memories without requiring you to mark and approve every range manually.

```txt
/stmb-catchup interval=<chunk size> start=<first message id> end=<last message id>
```

Example:

```txt
/stmb-catchup interval=40 start=0 end=245
```

The range is inclusive. This example processes `0-39`, `40-79`, and so on; the final chunk ends at `245` even if it contains fewer than 40 messages.

### Prepare catch-up first

Catch-up is non-interactive, so STMB refuses to start if a chunk would need a confirmation window.

Before running it:

1. Select and test the profile you want to use.
2. Enable **Always use default profile**.
3. Disable **Show memory previews**.
4. Bind or select a valid Memory Book. Automatic Mode may use Auto-Create if no book exists yet.
5. In a Manual Mode group, repair every required character Memory Book assignment.
6. Choose an interval that keeps every chunk under the token warning threshold.

STMB checks all chunks before beginning. It then processes them in order. If a chunk fails or you use `/stmb-stop`, catch-up stops there. Earlier completed memories remain saved, so restart with the first unfinished message rather than repeating the entire range.

Use catch-up for broad conversion. For carefully chosen literary scene boundaries, manual scene marking is still better.

---

## 👥 Group Chat Mode

Group Chat Mode supports **real SillyTavern group chats containing two or more separate character cards**.

For example:

```text
SillyTavern Group
├── Alice character card
├── Bob character card
└── Clara character card
```

Because Alice, Bob, and Clara are separate cards, SillyTavern records which character produced each message. Memory Books can use that information when creating, storing, and activating memories.

You do not need to enable a separate Group Chat Mode switch. Open a SillyTavern group chat and use Memory Books normally.

> **Group Chat Mode is not Narrator Mode.**
>
> Group Chat Mode reads real SillyTavern character-card authors. Narrator Mode is a separate advanced workflow for a normal chat where one Narrator card writes several fictional characters. Narrator Mode uses a manually declared cast and an Active Cast selector; it does not discover characters by reading prose.

For the full Narrator workflow, see [Narrator Mode](#-narrator-mode) and the [Narrator Mode Technical Guide](userguides/narrator-mode-en.md).

---

## What Memory Books Does Differently in a Group Chat

When Memory Books reads a group scene, it keeps track of which character card authored each message.

The generated memory should clearly preserve:

* who performed each important action;
* who said something;
* who learned or revealed information;
* who made a decision;
* who reacted emotionally;
* who believed, suspected, or misunderstood something.

Memory Books also identifies the character cards that participated in the selected scene.

How that participant information is used depends on whether you use:

1. **one Memory Book for the entire group**, or
2. **one group Memory Book plus separate character Memory Books**.

---

## What Counts as a Participant?

A participant is normally a **character card that authored at least one message inside the selected scene**.

Memory Books detects participants from the actual SillyTavern message authors. It does not attempt to determine everyone who was physically present by interpreting the prose.

For example:

```text
Alice speaks.
Bob answers.
Clara silently watches from the doorway.
```

Memory Books will normally detect Alice and Bob because their character cards produced messages.

Clara may not be detected because Clara did not produce a message, even though the story says she was present. In the multiple-Memory-Book setup, you can manually select Clara if the memory should also be associated with her.

Similarly:

* A character who is only mentioned is not automatically a participant.
* A silent observer may not be detected.
* An absent character discussed by the group is not automatically selected.
* The user is not treated as a group character with a separate character Memory Book.
* Unusual or duplicate speaker names may require manual correction.

The participant list therefore means:

> **Which group characters should this memory be associated with?**

It does not necessarily mean:

* everyone physically present;
* everyone mentioned;
* everyone who knows every fact;
* everyone who should receive identical knowledge.

---

# Option 1: One Memory Book for the Entire Group

This is the simplest setup and the recommended starting point for most users.

All group memories are stored in one lorebook used as the group’s Memory Book.

```text
Group Memory Book
├── Memory 001: Alice Meets Bob
├── Memory 002: The Warehouse Fight
├── Memory 003: Clara Reveals the Truth
└── Memory 004: The Group Leaves Town
```

## How to Set It Up

Use either:

* **Automatic Mode**, with a lorebook bound to the group chat; or
* **Auto-create lorebook if none exists**, which allows Memory Books to create and bind one.

You can then create memories manually, automatically, or through slash commands in the same way you would in a one-on-one chat.

## What Happens When a Memory Is Saved

Memory Books creates one memory entry in the group Memory Book.

When it can identify the speakers, the entry may also receive an inclusive character filter containing the participating character cards.

For example, if Alice and Bob spoke during the selected scene, but Clara did not, the entry may be filtered for Alice and Bob.

This does not create separate copies for Alice and Bob.

It remains one entry:

```text
Memory: The Warehouse Fight
Character filter:
- Alice
- Bob
```

The filter is **inclusive**. It means the entry may activate when Alice **or** Bob is the currently active character.

It does not mean:

* Alice and Bob must both be active;
* the entry belongs to a synthetic “Alice and Bob” character;
* a separate Alice-and-Bob subset has been created;
* Alice and Bob necessarily know exactly the same information.

## What One Group Memory Book Is Good At

Use one group Memory Book when:

* the characters mostly share one continuing story;
* you want the easiest setup;
* one group-oriented summary is sufficient;
* you do not need independent character histories;
* you want to avoid duplicate entries;
* you do not want to install or configure STLO.

The memory text can still preserve differences between the characters.

For example:

> Alice discovered the hidden transmitter, but concealed it from Bob. Bob incorrectly believed that the room had been empty.

Both facts can exist in one group memory without pretending that Bob knew what Alice knew.

## Do I Need STLO?

No.

A single group Memory Book works without SillyTavern-LorebookOrdering.

You may still use **SillyTavern-LorebookOrdering (STLO)** to control the group Memory Book’s priority, position, token budget, or other activation behavior, but it is optional for this layout.

---

# Option 2: One Group Memory Book Plus Character Memory Books

The advanced layout uses:

* one main **group Memory Book**; and
* a designated **character Memory Book** for each group member.

```text
Group Memory Book
├── Canonical Memory 001
├── Canonical Memory 002
└── Canonical Memory 003

Alice Memory Book
├── Alice copy of Memory 001
└── Alice copy of Memory 003

Bob Memory Book
├── Bob copy of Memory 001
└── Bob copy of Memory 002

Clara Memory Book
└── Clara copy of Memory 003
```

This layout requires:

* **Manual Lorebook Mode**; and
* **SillyTavern-LorebookOrdering (STLO)** installed and enabled.

## How to Set It Up

1. Install and enable STLO.
2. Open the SillyTavern group chat.
3. Open Memory Books.
4. Enable **Manual Lorebook Mode**.
5. Select the main manual lorebook. This becomes the canonical group Memory Book.
6. Under **Group Character Lorebooks**, select a Memory Book for each group member.
7. Create memories normally.

Every group member must have a valid character Memory Book assignment before Memory Books can save a distributed group memory.

The main group Memory Book cannot also be assigned as one of the character Memory Books.

## Sharing One Character Memory Book

More than one character may be assigned to the same character Memory Book.

For example:

```text
Alice → Shared Investigation Memory Book
Bob   → Shared Investigation Memory Book
Clara → Clara Memory Book
```

If Alice and Bob both participate, Memory Books creates one copy in the shared book. It does not create two duplicate copies in the same lorebook.

This may be useful when two character cards are intended to share one continuing perspective or history.

---

## Confirming Participants

Before saving a distributed memory, Memory Books shows the detected group participants.

You can correct the selection before continuing.

For example:

```text
Detected participants:
☑ Alice
☐ Bob
☑ Clara
```

The result would be:

```text
Group Memory Book:
✓ Receives the canonical memory

Alice Memory Book:
✓ Receives a copy

Bob Memory Book:
✗ Receives nothing

Clara Memory Book:
✓ Receives a copy
```

Use this confirmation screen to correct cases such as:

* a character who remained silent but should receive the memory;
* a detected speaker whose book should not receive the memory;
* a character who witnessed only part of the scene;
* an event that should be treated as relevant to the entire group.

If no individual participant is selected, Memory Books treats the memory as applying to all current group members.

When participant detection is consistently correct for your chats, you can enable:

**Automatically accept detected participants in future**

Be aware that this is broader behavior, not merely a setting for one specific memory.

---

## Group Summaries and Character-Focused Summaries

By default, Memory Books generates one group-oriented memory.

That memory becomes the canonical entry in the group Memory Book, and copies of the same summary are placed in the selected character Memory Books.

This is efficient and keeps the versions consistent.

However, the copied text remains a group-oriented summary.

For more individualized memories, open the Profile Manager and enable:

**Use separate group and character prompts in group chats**

With this option enabled:

* the **Group Summary Prompt** creates the canonical group version;
* the **Character Summary Prompt** creates a character-focused version for each individually assigned character Memory Book.

For example:

### Group version

> Alice discovered the transmitter and concealed it from Bob. Clara noticed Alice’s hesitation but did not confront her. Bob remained unaware of the discovery.

### Alice version

> Alice discovered the hidden transmitter and deliberately concealed it from Bob. She noticed Clara watching her and suspected that Clara understood what she had done.

### Bob version

> Bob searched the room but found nothing suspicious. He accepted Alice’s claim that the room was empty and remained unaware of the hidden transmitter.

### Clara version

> Clara saw Alice discover and conceal the transmitter. She recognized that Bob had been deceived but chose not to intervene.

Character-focused generation can better preserve:

* individual knowledge;
* mistaken beliefs;
* private emotional reactions;
* personal priorities;
* relationship-specific continuity.

It also requires additional AI requests.

Leave it disabled unless the individualized versions provide a meaningful benefit to your story.

---

# What STLO Does

Memory Books and STLO have different responsibilities.

## Memory Books

Memory Books decides:

* which messages belong to the scene;
* which character cards participated;
* what the summary says;
* which Memory Books receive copies;
* whether group and character summaries are generated separately.

## STLO

STLO controls:

* when a lorebook is active;
* which character can activate it;
* where it is inserted;
* its priority;
* its token budget;
* its ordering relative to other lorebooks.

STLO does not decide who participated in the scene or what a character knows.

## Character Memory Book Activation

When you assign a character Memory Book, Memory Books adds the appropriate character override in STLO and enables activation based on the character who is currently speaking.

For example:

```text
Alice is speaking:
- Group Memory Book may activate
- Alice Memory Book may activate
- Bob Memory Book does not activate

Bob is speaking:
- Group Memory Book may activate
- Bob Memory Book may activate
- Alice Memory Book does not activate
```

This prevents every character Memory Book from loading whenever any group member speaks.

Memory Books preserves existing STLO settings such as:

* priority;
* order adjustment;
* token budget;
* existing character overrides.

You can therefore use STLO to place character memories at a different priority or prompt position from the group’s canonical history.

---

# Character Filters Are Not Private Knowledge

Character filters and separate Memory Books improve **relevance and routing**.

They should not be treated as a strict privacy or access-control system.

The multiple-book setup does not guarantee that:

* one character can never receive information associated with another;
* the roleplay model will never see the canonical group version;
* previous-memory context contains only facts owned by one participant;
* a character Memory Book perfectly represents what that character consciously knows.

The canonical group Memory Book still contains the group version of the event.

For example, a character-focused copy might correctly say that Bob did not know about the transmitter, while the canonical group summary still records the full event.

Use separate character Memory Books when you want:

* more relevant context;
* individualized continuity;
* character-focused summaries;
* less unrelated history activated for each speaker.

Do not use them as a security boundary.

---

# What Gets Copied Across Memory Books?

Not every Memory Books feature automatically distributes its result across the group and character Memory Books.

| Operation               | Multiple-Memory-Book behavior                                        |
| ----------------------- | -------------------------------------------------------------------- |
| Normal scene memory     | Creates a canonical group entry and copies for selected participants |
| Automatic memory        | Uses the same group-memory distribution behavior                     |
| Catch-up memory         | Uses normal memory-creation routing                                  |
| Consolidation           | Can coordinate the group book and assigned character books           |
| Clip                    | Saves to the selected or effective Memory Book only                  |
| Topical Clip            | Operates on the selected Memory Book only                            |
| Side Prompt             | Saves to its configured Memory Book or override only                 |
| Compaction              | Replaces only the selected entry                                     |
| Regeneration            | Replaces only the entry being regenerated                            |
| Manual lorebook editing | Changes only that specific entry                                     |
| Manual deletion         | Deletes only the selected entry                                      |

## Linked Copies Are Not Live-Synchronized

Entries created from the same group memory may be linked internally so Memory Books can recognize that they belong to the same original event.

However, linked does not mean continuously synchronized.

Editing, deleting, compacting, or regenerating one entry does not automatically apply the same change to every linked copy.

For example:

```text
Group Memory Book:
Memory 014 — regenerated

Alice Memory Book:
Memory 014 — unchanged

Bob Memory Book:
Memory 014 — unchanged
```

Regenerate or edit each version separately when all copies need to change.

---

# Character Memory Book Assignments and Locks

An unlocked character Memory Book assignment normally belongs to the current group chat.

This allows the same character card to use different Memory Books in different stories.

For example:

```text
Fantasy Group:
Alice → Alice Fantasy Memory Book

Modern Group:
Alice → Alice Modern Memory Book
```

## Locking an Assignment

A locked assignment tells Memory Books to keep using the selected Memory Book for that character card across compatible Manual Mode chats.

Use a lock when the character should maintain one continuing Memory Book across several groups or chats.

For example:

```text
Alice character card
└── Locked to Alice Canonical Memory Book
```

Once locked:

* the assignment follows the character card;
* other compatible group chats can reuse it;
* the assignment must be unlocked before selecting a different Memory Book.

If the locked lorebook is deleted or becomes unavailable, the assignment must be unlocked or repaired before it can be used again.

Use locks carefully when the same character card appears in unrelated universes or alternate timelines.

---

# Which Settings Apply Where?

Not every Group Chat setting has the same scope.

| Setting or data                                 | Scope                             |
| ----------------------------------------------- | --------------------------------- |
| Manual Lorebook Mode                            | Extension-wide setting            |
| Main group Memory Book selection                | Current chat                      |
| Unlocked character Memory Book assignments      | Current group chat                |
| Locked character Memory Book assignment         | Character card                    |
| Scene boundaries and processed-message progress | Current chat                      |
| Automatically accept detected participants      | General Group Chat behavior       |
| Separate group and character prompts            | Current Memory Books profile      |
| STLO priority, position, and token settings     | Individual lorebook configuration |

This matters when switching between groups, profiles, or character cards.

For example, changing the active Memory Books profile may also change whether separate character-focused prompts are used.

---

# Adding or Removing Group Members

SillyTavern groups may change over time.

## Adding a Character

When a new character is added to a group:

* assign that character a valid character Memory Book before creating another distributed memory;
* existing memories are not automatically copied into the new character’s book;
* old participant filters are not automatically rewritten;
* the new character does not retroactively become a participant in previous scenes.

Create or copy any historical context manually if the new character should begin with older knowledge.

## Removing a Character

When a character is removed from a group:

* existing entries in their character Memory Book remain;
* old character filters remain on existing group entries;
* existing STLO character overrides may remain;
* linked copies are not automatically deleted.

This preserves history and avoids destructive cleanup when a character is only temporarily removed.

If the character should no longer activate an old Memory Book, remove the retained override through STLO.

## Changing a Character’s Assigned Memory Book

Changing or clearing an assignment in Memory Books does not necessarily remove the character from the old lorebook’s STLO overrides.

This is deliberate. The old lorebook may still be used with that character elsewhere.

After changing an assignment, review the old lorebook in STLO and remove the character override manually when it is no longer needed.

---

# Consolidation in Group Chats

Consolidation can coordinate the canonical group Memory Book and the assigned character Memory Books.

The group book is consolidated using the group memories. Character books are consolidated from the related entries available in each assigned book.

## Different Books May Have Different Amounts of Material

A character Memory Book may contain fewer eligible memories than the group Memory Book.

For example:

```text
Group Memory Book:
12 eligible scene memories

Alice Memory Book:
10 eligible scene memories

Bob Memory Book:
3 eligible scene memories
```

If a character book does not contain enough eligible entries for the requested consolidation tier, Memory Books may skip that book and warn you before proceeding.

The group and ready character books can still continue without the skipped book.

## Missing Scenes Are Chronology Gaps

A character’s Memory Book may not contain every group event.

A missing scene means only that the scene was not included in that character book. It does not automatically prove that the character was absent, unconscious, or ignorant.

Character-focused consolidation should treat missing material as a gap in the supplied chronology rather than inventing a reason for its absence.

## Shared Character Books

When several characters share one character Memory Book, Memory Books produces one consolidation for that shared book.

It does not create duplicate consolidated entries for every assigned character.

---

# Which Layout Should I Choose?

## Use One Group Memory Book When:

* you are configuring Group Chat support for the first time;
* the characters mostly follow one shared story;
* separate character histories are unnecessary;
* you want the least configuration;
* you want fewer duplicate entries;
* you do not want to use STLO;
* group-oriented summaries are sufficient.

## Use Multiple Memory Books When:

* characters frequently have different experiences;
* individual continuity matters;
* different speakers should activate different context;
* you want character-focused summaries;
* unrelated group history should not load for every character;
* you already understand STLO’s activation controls;
* the extra setup and AI requests are worthwhile.

> **Recommended starting point:** Use one group Memory Book.
>
> Move to separate character Memory Books only when one shared history no longer provides enough precision for the story.


---

## 🎭 Narrator Mode

Narrator Mode supports a **normal one-on-one SillyTavern chat where one Narrator character card writes several fictional characters**.

```text
Normal SillyTavern chat
└── Narrator card
    ├── writes Alice
    ├── writes Bob
    └── writes Clara
```

SillyTavern records all three fictional characters as part of the Narrator card's response. STMB therefore cannot use message-author character cards as it does in Group Chat Mode. Narrator Mode solves this with a user-declared cast and per-message cast metadata.

### Required layout

Narrator Mode always uses:

* one **omniscient Memory Book** for the complete canonical history; and
* one unique **character Memory Book** for every declared fictional character.

It requires Manual Lorebook Mode. Automatic chat-bound and Auto-Create routing are not supported while Narrator Mode is active.

Unlike the advanced native-group layout, Narrator Mode does not require STLO. It also does not allow two declared characters to share the same character Memory Book.

### Setup

1. Open the normal chat using the Narrator card.
2. Create or choose the omniscient Memory Book and one separate book per fictional character.
3. Open Memory Books and enable **Manual Lorebook Mode**.
4. Select the omniscient book as the manual Memory Book.
5. Enable **Narrator Mode**.
6. Open **Manage Narrator Cast**.
7. Add each fictional character by name and assign that character's unique Memory Book.
8. Use the movable **Active Cast** drawer to select who participates before each Narrator generation.

Characters are write-in cast members. They do not need SillyTavern character cards.

### Active Cast behavior

STMB snapshots the Active Cast when generation begins. The completed Narrator response is stamped with those cast-member IDs. A continuation merges its cast into the existing response metadata. Swipes retain their own cast metadata, and selecting a swipe restores the drawer to that swipe's cast.

Narrator Mode does not search the prose for names and decide who participated. The explicit Active Cast selection is the source of truth.

### Creating memories

When a Narrator scene becomes a memory:

1. the canonical version is saved to the omniscient Memory Book;
2. linked copies are saved only to the Memory Books owned by the scene participants; and
3. no individual copy is created for an unselected cast member.

If the participant list is empty, STMB saves only the omniscient entry.

For fully tagged messages, STMB derives participants from the Narrator responses in the scene. If a scene contains older untagged Narrator messages, STMB opens **Confirm Narrator scene cast**. In that popup, selecting nobody means no individual cast member was present; it does not mean everyone.

### Character-focused memories

The profile option **Use separate group and character prompts in group chats** also applies to Narrator Mode.

When enabled:

* the Group Summary Prompt creates the omniscient version; and
* the Character Summary Prompt runs separately for each participating character book.

This supports individual knowledge, mistaken beliefs, private reactions, and character-specific continuity. It also adds one generation request per participating character.

### Loading character memories during roleplay

Before a Narrator reply, STMB adds the selected active characters' Memory Books to the generation's character-lore processing. Alice's and Clara's books can therefore participate when Alice and Clara are active without adding Bob's book.

The omniscient manual Memory Book is the canonical STMB storage target. Manual selection alone does not bind it to ordinary chat generation. Bind or activate the omniscient lorebook through normal SillyTavern lorebook controls if the Narrator should receive it during roleplay.

### Removing cast members

**Remove** retires a cast member rather than deleting their identity. Retired members disappear from the Active Cast drawer but retain their internal ID and Memory Book assignment so old linked memories remain interpretable. The name and book remain reserved and the member can be restored.

### Catch-up, branching, and linked edits

* `/stmb-catchup` works only for Narrator ranges that already have complete cast metadata. Legacy untagged ranges must be processed manually.
* Branching copies the omniscient book and every declared cast book, then rewrites the branch's cast bindings to the copies.
* Regeneration, Compaction, manual edits, and deletion affect only the selected entry. Linked copies are not live-synchronized.

See the [Narrator Mode Technical Guide](userguides/narrator-mode-en.md) for the exact metadata model, participant-resolution rules, prompt routing, consolidation behavior, and troubleshooting.

---

## 🌿 Branching Chats

SillyTavern can create a new branch from an earlier point in a chat. A branch may develop into a different continuity, so sharing the same writable Memory Book with its parent can mix two timelines.

Memory Books therefore enables **Copy Memory Books when branching** by default.

### What is copied

When STMB detects a newly created native branch:

- Automatic Mode copies the active chat-bound Memory Book.
- Manual Mode copies the main manual Memory Book.
- A Manual Mode group also copies every unique **unlocked** character Memory Book currently assigned.
- Narrator Mode copies the omniscient Memory Book and every declared cast Memory Book.
- Locked character Memory Books are not copied. Their persistent assignment remains in place.

Every book copied for one branch receives the same available branch number:

```text
Group Memories Branch 1
Alice Memories Branch 1
Bob Memories Branch 1
```

If you branch again from one of those branches, STMB keeps the original lineage name and chooses the next available branch number instead of producing names such as `Branch 1 Branch 1`.

### What changes inside the copies

STMB updates entries that belong to the parent chat so they refer to the new branch chat. It also rewrites internal canonical-lorebook links when both linked books were copied. This keeps group and character consolidation relationships inside the branch rather than pointing back to the parent books.

### Locked books

A lock means “this character always uses this Memory Book.” Copying that book for one branch would defeat the purpose of the lock.

- In a solo chat using a persistent character lock, STMB leaves the locked book alone and does not create a branch copy for it.
- In a Manual Mode group, unlocked books are copied while locked character assignments continue pointing to their locked books.

Use locks only when sharing that continuing history across branches is intentional.

### Disabling branch copies

Disable **Copy Memory Books when branching** in **Memory Books → General Settings** when you deliberately want the branch to keep the inherited bindings and write to the same books as its parent.

When copying is enabled, do not switch chats while STMB is creating the books. If copying fails, STMB clears the new branch's inherited bindings to protect the originals from accidental writes.

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

## 🙈 Token Saving and the Memory Boundary

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

### Memory boundary indicator

The **Memory boundary indicator** uses the chat's highest processed message to show where remembered history ends and unprocessed chat begins.

The available modes are:

- **Off**
- **Memory boundary** — inserts a divider in the chat
- **Jump button** — shows a draggable button that scrolls to the boundary
- **Memory boundary + jump button**

If no memory has been processed yet, there is no boundary to jump to. The button position is saved after you drag it.

### Good beginner setup

Aiko's settings:
- use **Auto-hide messages up to the last memory**
- leave **2 messages unhidden**
- turn on **Unhide hidden messages for memory generation**
- show **Memory boundary + jump button** while learning the workflow

---

## 🧵 Previous Memories and Additional Context

Memory generation can include two different kinds of reference material before the current scene.

### Previous memories

Previous memories are earlier STMB scene memories from the effective Memory Book.

They help the model maintain continuity across adjacent scenes. STMB labels them as context only and tells the model not to rewrite them into the new memory.

You can include up to seven. Set the normal amount through **Default Previous Memories**, then override it for one run in the memory confirmation window.

### Additional Context

Additional Context consists of selected lorebook entries that STMB supplies as reference material.

Use it for stable information such as:

- character or setting rules;
- canonical names and terminology;
- campaign constraints;
- location references;
- an authoritative timeline;
- facts that the selected scene assumes but does not repeat.

Additional Context is not treated as another scene. It appears in a clearly labeled reference block before previous memories and the scene transcript.

### Context Settings

Context Settings are reusable ordered collections of Additional Context entries.

1. Open **Memory Books → Context Settings**.
2. Create a named Context Setting.
3. Choose a lorebook and entry, then add it.
4. Add any other entries needed.
5. Reorder them into the sequence you want the model to see.
6. Select that Context Setting under **Additional Context for this chat**.

The chat selector supports:

- **Unset - prompt when needed** — primarily useful during migration from older profile-based context;
- **No Context** — explicitly use no Additional Context in this chat; or
- a named Context Setting.

The selection is stored per chat. This means the same memory profile can use different reference collections in different stories. It also means **Current SillyTavern Settings** can use Additional Context even though the old profile-level implementation could not.

If a referenced lorebook or entry is deleted, STMB warns, skips that stale reference, and continues. Deleting an entire Context Setting causes chats that reference it to continue without Additional Context until you choose another one.

Context Settings can be duplicated, imported, and exported as `stmb-context-settings.json`.

### Side Prompts and Additional Context

Each Side Prompt may:

- use no Additional Context;
- **Follow chat**, using the current chat's selected Context Setting; or
- use one **fixed** Context Setting regardless of the chat selection.

This is separate from the Side Prompt's optional previous-memory count and existing prior tracker entry.

---

## 🔢 Memory Count Macros

STMB registers count macros for the effective main Memory Book.

| Macro | Returns |
|---|---|
| `{{memtier0}}` | Number of scene Memories |
| `{{memtier1}}` | Number of Arcs |
| `{{memtier2}}` | Number of Chapters |
| `{{memtier3}}` | Number of Books |
| `{{memtier4}}` | Number of Legends |
| `{{memtier5}}` | Number of Series |
| `{{memtier6}}` | Number of Epics |
| `{{memclips}}` | Number of Clips |
| `{{memside}}` | Number of Side Prompt entries |

The effective book is the chat-bound Memory Book in Automatic Mode or the resolved manual Memory Book in Manual Mode. In a group with character books, these macros count the main group Memory Book and do not add every character book together.

They return integers and can be used wherever the relevant STMB field expands normal SillyTavern macros. For example, a Side Prompt can use them to decide whether a tracker should recommend consolidation or compaction.

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
* **Import / Export**: Share templates or back them up. Import is additive: existing prompts stay in place and conflicting imported keys are renamed.
* **Status View**: See which trackers are active in the current chat and when they run
* **Safety Checks**: If a template contains custom runtime macros, STMB strips automatic triggers on save/import and shows a warning toast

### Automatic Side Prompt selection

General Settings can define one default Side Prompt Set for solo chats and another for group chats. Each chat can then choose:

* **Inherit solo/group default**
* **Use individually-enabled side prompts**
* a specific named Side Prompt Set

A selected set replaces individual automatic selection. The set is still filtered by trigger: an after-memory run uses rows whose Side Prompts have **Run automatically after memory** enabled, while an interval run uses rows whose Side Prompts have a visible-message interval.

### Advanced Side Prompt inputs and destinations

A Side Prompt can also configure:

* up to seven previous memories for continuity;
* Additional Context that follows the chat or uses a fixed Context Setting;
* a different Memory Books profile/connection;
* a template-level or per-chat target lorebook;
* title and keyword templates;
* activation mode, insertion position, order, recursion, Outlet name, and **Ignore Budget**.

Use a lorebook override when the tracker belongs somewhere other than the current Memory Book. A per-chat override wins over the template-level destination; if neither is valid, STMB uses the effective Memory Book.

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

## ♻️ Regenerating Entries

Regeneration creates a replacement draft for an existing STMB entry. It does not make a second numbered entry and it never overwrites the original without approval.

Open the Memory Book in SillyTavern's lorebook editor. Eligible entries receive **Regenerate memory** or **Regenerate side prompt** beside their UID.

### Regenerating a scene memory

A normal memory uses its saved scene range.

- Open the chat that originally created it.
- Make sure that Memory Book is active for the chat.
- Click **Regenerate memory**.
- Choose the current profile, prompt, previous-memory count, and Additional Context.
- Review the title, content, and keywords before replacing the entry.

If the entire original range is hidden, reveal it manually or enable **Unhide hidden messages for memory generation**.

### Regenerating a consolidation

A higher-tier summary uses the exact linked lower-tier source entries and the dedicated **Regenerate Consolidation** prompt. The complete source set must still exist at the correct tier.

A source entry cannot be regenerated while an active parent consolidation depends on it. Delete the parent consolidation first if rebuilding the lower entry is intentional.

### Regenerating a Side Prompt

Side Prompt regeneration is available only after a compatible run has saved a snapshot. The snapshot records:

- the Side Prompt template key;
- the prior tracker content used for that run;
- the source chat and message range; and
- runtime macro values.

The new generation uses those saved inputs with the **current** Side Prompt template, profile override, previous-memory setting, and Additional Context setting. If the template no longer exists, regeneration cannot proceed.

### Replacement safety

STMB compares the source and target again immediately before saving. If the chat range, target entry, or consolidation source entries changed while generation was running, nothing is overwritten.

Linked group/character copies are independent after creation. Regenerating one does not update the other copies.

---

## 🔌 Advanced Memory Profiles

Most users should begin with **Current SillyTavern Settings**. Create a separate profile only when memory generation needs different connection or entry behavior.

### Named Custom connection profiles

When **API/Provider** is **Custom OpenAI-Compatible API**, choose either:

- **Use active SillyTavern Custom connection**; or
- one named Custom connection profile from SillyTavern's Connection Manager.

The named connection supplies its URL and saved secret. The model entered in the STMB profile remains the model override. If that SillyTavern connection is deleted or changed to a non-Custom provider, STMB blocks the request rather than silently using another endpoint.

This is useful when you have several OpenAI-compatible services configured and do not want STMB to depend on whichever one is currently active.

### Structured output fallback

**Skip structured output and use plain-text completion** prevents STMB from sending a JSON schema. Use it only when a provider rejects structured-output requests.

The selected memory prompt must still tell the model to return valid JSON. This setting changes how the request is sent, not what STMB must parse.

### SillyTavern ChatCompletionService

Enable **Use ST's ChatCompletionService** to send the profile through SillyTavern's built-in request helper. You may optionally select a SillyTavern Chat Completion preset for that request.

If ChatCompletionService is unavailable or fails, STMB can fall back to its normal request path. Full Manual profiles do not use ChatCompletionService.

### Reverse proxy and Full Manual Configuration

**Use reverse proxy** forwards SillyTavern's configured reverse-proxy details for supported providers.

**Full Manual Configuration** accepts a direct endpoint and key inside the STMB profile. It is intended for exceptional cases where the connection cannot be represented and tested in SillyTavern. Prefer a normal provider or named Custom connection whenever possible.

---

## 🧩 Prompt Managers and Previews

### Summary Prompt Manager

The Summary Prompt Manager controls the presets used for ordinary scene-memory generation.

You can create, edit, duplicate, delete, import, and export presets. After saving one, assign it through a Memory Books profile. Built-in presets can be recreated from the current app locale; recreating them removes local edits to those built-ins but does not delete unrelated custom presets.

Every memory preset must produce the required `title`, `content`, and `keywords` JSON object.

### Consolidation Prompt Manager

The Consolidation Prompt Manager controls how lower-tier entries are grouped and compressed into higher-tier summaries. It also lets you choose the normal default consolidation prompt.

The built-in **Regenerate Consolidation** preset is regeneration-only. It cannot be selected for ordinary consolidation or made the default.

### Preview settings

- **Show memory previews** controls review windows for memories and Side Prompts.
- **Show consolidation previews** controls the consolidation review workflow.

In a consolidation preview you can edit a candidate, accept it, regenerate that candidate from the same assigned sources, or regenerate the pending batch. Review is especially useful when the model assigns a source to the wrong summary or leaves an item unassigned.

---

## 🧾 Job Queue and Retry Controls

The optional Job Queue requires **Chat Top Bar / Chat Top Info Bar**. When installed, the **Memory Books Jobs** drawer shows queued, active, completed, failed, canceled, blocked, and review-needed work.

Use it to:

- cancel active work;
- reopen approval-required jobs;
- inspect failure details;
- retry work; and
- dismiss terminal history rows.

Retry buttons have different scopes:

- **Retry** — reruns one non-memory job, such as a Side Prompt or consolidation job.
- **Retry All** — reruns a memory and any after-memory Side Prompt jobs that were canceled with it. If the memory had already been saved, STMB can resume from that result instead of saving a duplicate memory.
- **Retry Memory** — reruns or resumes the memory only and deliberately skips after-memory Side Prompts.

Use **Retry Memory** when the memory itself needs another attempt but the attached tracker workflow should not run. Use **Retry All** when the intended combined memory-plus-trackers workflow should be restored.

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
- **Copy Memory Books when branching**: keeps branched timelines from writing to the same unlocked books
- **Context Settings**: supplies reusable ordered lorebook references during generation
- **Memory boundary indicator**: shows or jumps to the processed boundary

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
- If regeneration is disabled, hover the button: the original range, source entries, Side Prompt snapshot, or parent-consolidation relationship may be unavailable
- If Additional Context is missing, check the chat's Context Setting and look for deleted lorebooks or entries
- If a branch did not receive copies, verify **Copy Memory Books when branching** was enabled before creating the native branch and that the source books could be loaded

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
