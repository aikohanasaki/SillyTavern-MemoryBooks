<!--
Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only
-->

# Narrator Mode: Technical Guide

Narrator Mode is for a **normal one-on-one SillyTavern chat in which one Narrator character card writes several fictional characters**.

Example:

```text
Normal SillyTavern chat
└── Narrator character card
    ├── writes Alice
    ├── writes Bob
    └── writes Clara
```

SillyTavern records every assistant response in this chat as coming from the Narrator card. It does not expose Alice, Bob, and Clara as separate message authors. Narrator Mode supplies the missing routing layer by letting the user declare the fictional cast, select who is active before each generation, and assign a separate Memory Book to each declared character.

Narrator Mode does **not** automatically discover characters by reading names in prose. Cast membership is explicit user-maintained state.

## Core Model

Narrator Mode uses:

1. one **omniscient Memory Book** for the canonical account of the full story; and
2. one unique **character Memory Book** for every declared fictional character.

```text
Omniscient Memory Book
├── canonical Memory 001
├── canonical Memory 002
└── canonical Memory 003

Alice Memory Book
├── Alice copy of Memory 001
└── Alice copy of Memory 003

Bob Memory Book
└── Bob copy of Memory 002
```

The omniscient Memory Book is the effective manual Memory Book for the chat. Character Memory Books are selected in **Manage Narrator Cast**.

## Requirements and Constraints

Narrator Mode is active only when all of the following are true:

* the current chat is **not** a native SillyTavern group chat;
* **Manual Lorebook Mode** is enabled;
* Narrator Mode is enabled for the current chat; and
* an omniscient manual Memory Book is selected.

Additional rules:

* Auto-Create and Automatic chat-bound lorebook routing are not supported while Narrator Mode is active.
* Each declared character must use a different Memory Book.
* A character Memory Book cannot also be the omniscient Memory Book.
* Every assigned Memory Book must still exist when a memory is created.
* Character names must be unique within the Narrator cast, using case-insensitive comparison.
* Declared cast members do not need SillyTavern character cards or avatars. Write-in fictional characters are supported.
* Narrator Mode does not require SillyTavern-LorebookOrdering (STLO).
* Character Memory Book locks are a character-card feature and do not apply to write-in Narrator cast members.

Unlike Manual Mode group chats, Narrator Mode does not permit two declared characters to share one character Memory Book. The one-character-per-book rule preserves unambiguous ownership metadata and prompt routing.

## Setup

1. Open the normal chat that uses the Narrator character card.
2. Create or choose one lorebook for the omniscient history.
3. Create or choose one separate lorebook for each fictional character who needs individual continuity.
4. Open **Memory Books**.
5. Enable **Manual Lorebook Mode**.
6. Select the omniscient Memory Book as the manual Memory Book.
7. Enable **Narrator Mode**.
8. Click **Manage Narrator Cast**.
9. Enter a fictional character name, select that character's Memory Book, and click **Add**.
10. Repeat for the rest of the cast.

The cast configuration is stored in the current chat's `STMemoryBooks` metadata. It does not become a global roster shared by unrelated chats.

## Declaring, Removing, and Restoring Cast Members

Each declared member has a stable internal ID, a display name, a Memory Book assignment, and a retired state.

The **Remove** action retires the member rather than deleting the identity. A retired member:

* is removed from the active-cast selector;
* cannot be selected for new generations;
* is excluded from the legacy-scene participant confirmation;
* retains the same internal ID and Memory Book assignment; and
* can be restored later.

Retirement deliberately does not release the member's name or Memory Book for reuse. Existing memories may still contain that member's ownership metadata. The assigned Memory Book must therefore remain valid even while the member is retired.

## Active Cast Drawer

When Narrator Mode is active, STMB shows a movable **Active Cast** drawer.

The drawer controls which declared characters are participating in the next Narrator generation. It may be collapsed to a small button that displays the number of selected cast members.

The active-cast selection is chat state. The drawer's screen position and collapsed state are interface settings.

An empty active cast is valid. It means the next generation has no individually selected fictional cast members. The omniscient Memory Book can still be used, but no character Memory Book is associated with that generation.

## Generation Snapshot

STMB takes a snapshot of the active cast when SillyTavern begins a generation.

That snapshot, rather than the live checkbox state later in the request, controls the response. Changing the drawer while a generation is already running does not retroactively change that generation's cast.

This prevents a slow request from being mislabeled if the user changes the active cast before the response finishes.

## Loading Character Memories for a Narrator Reply

During a normal Narrator generation, STMB loads the Memory Books assigned to the cast members in the generation snapshot and merges their entries into SillyTavern's character-lore candidate collection for that request.

Entries are deduplicated by lorebook name and entry UID. STMB clones the prompt-local entries rather than modifying the source lorebooks.

Conceptually:

```text
Active Cast: Alice + Clara
        ↓
Alice Memory Book added to the generation's character-lore candidates
        +
Clara Memory Book added to the generation's character-lore candidates
        ↓
SillyTavern completes World Info processing
        ↓
Narrator model receives the resulting activated context
```

This is why Narrator Mode does not need STLO's `onlyWhenSpeaking` routing for the individual cast books. The active-cast snapshot determines which character Memory Books participate in the current Narrator request.

The omniscient manual Memory Book is the canonical **STMB storage and memory-generation source**. Selecting it in Manual Lorebook Mode does not, by itself, bind it to ordinary SillyTavern chat generation. If the Narrator model should also receive omniscient entries during roleplay, activate that lorebook through the normal SillyTavern lorebook mechanisms, such as a chat binding or an intentional STLO configuration.

Narrator Mode still uses ordinary lorebook entries. Entry settings, activation behavior, recursion, budgets, and later SillyTavern World Info processing remain relevant.

## Message-Level Cast Metadata

STMB stores cast information on chat messages under the message's `extra.STMemoryBooks` metadata.

The logical shape is:

```json
{
  "narratorCast": {
    "version": 1,
    "memberIds": ["stable-member-id-1", "stable-member-id-2"]
  }
}
```

The stored values are stable member IDs, not character names. Renaming text in prose therefore does not change historical ownership.

STMB stamps metadata in two places:

* the user's outgoing message receives the currently selected active cast; and
* the Narrator response receives the generation-start snapshot.

The response metadata is the authoritative source when all Narrator responses in a scene have valid cast metadata. The user-message copy provides continuity and a fallback for older or incomplete data.

### Continue generations

When a response is continued, STMB merges the continuation's cast snapshot with the cast already recorded on that message. It does not discard the cast associated with the earlier part of the response.

### Swipes

Cast metadata is stored on the active swipe. Different swipes can therefore preserve different cast snapshots. When the user changes swipes, STMB restores the Active Cast drawer from the selected swipe's metadata.

### Message deletion

When messages are removed from the end of the chat, STMB restores the drawer from the most recent remaining Narrator message that has cast metadata. Deleting an older message instead causes the drawer to refresh without rewriting later metadata.

## How Scene Participants Are Determined

When STMB compiles a Narrator scene, it reads the message-level cast metadata for the selected range.

### Fully tagged scene

If every Narrator response in the range has Narrator cast metadata:

* Narrator responses are authoritative;
* user-message snapshots are not used to add extra participants; and
* the scene participant list is the union of the member IDs stamped on the Narrator responses.

This avoids treating a character selected before a generation as a participant when the final saved Narrator response used a different cast snapshot.

### Legacy or partially tagged scene

If any Narrator response in the range lacks cast metadata, STMB marks the scene as containing legacy/untagged messages. It then uses all available message snapshots in the range as continuity hints and opens **Confirm Narrator scene cast** before saving the memory.

The confirmation begins with:

* member IDs recovered from tagged messages in the range; plus
* the currently active cast.

The user may correct the selection. In this confirmation, an empty selection means **no individual cast members were present**. It does not mean all members.

This differs from the participant confirmation used by Manual Mode native group chats, where selecting nobody means the memory applies to every group member.

## Memory Creation and Distribution

Narrator Mode treats every scene memory as a multi-book transaction.

1. STMB generates the canonical, group-targeted memory.
2. STMB saves that entry to the omniscient Memory Book.
3. STMB creates linked copies only in the Memory Books owned by the scene's selected participants.
4. If any required write fails, STMB attempts to roll back the linked writes rather than knowingly leaving a partial set.

Example:

```text
Scene participants: Alice + Clara

Omniscient Memory Book: canonical entry saved
Alice Memory Book: linked copy saved
Bob Memory Book: no copy
Clara Memory Book: linked copy saved
```

An empty participant list creates only the omniscient entry.

### Native character filters are not used

Narrator cast members are not SillyTavern character cards, so Narrator Mode does not write native SillyTavern character filters for them.

Instead, STMB stores Narrator-specific metadata:

* `STMB_narratorParticipantIds` on the canonical omniscient entry; and
* `STMB_narratorOwnerIds` on an individual character copy.

Linked entries also retain the normal canonical-copy metadata used by multi-book memory workflows, including the inclusion group and canonical lorebook/entry references.

## Group and Character Prompt Routing

The profile option **Use separate group and character prompts in group chats** also applies to Narrator Mode.

When it is disabled:

* STMB generates one group-oriented memory; and
* participant books receive linked copies of that same memory text.

When it is enabled:

* the **Group Summary Prompt** creates the canonical omniscient version; and
* the **Character Summary Prompt** runs once for each participating character book.

The character run receives the character's display name and is marked as a character-targeted generation. This allows the output to focus on that character's knowledge, beliefs, reactions, goals, and continuity.

Separate prompts cost one additional generation request per participating character.

## Regeneration

Regeneration acts on one lorebook entry at a time.

STMB uses Narrator ownership metadata to decide prompt routing:

* an individual entry with one `STMB_narratorOwnerIds` value is regenerated with the character prompt path; and
* a canonical entry with participant metadata uses the group prompt path.

Regenerating one linked entry does not regenerate the other linked copies. STMB warns that linked copies exist, but the user must regenerate each version deliberately.

## Consolidation

Narrator Mode uses the same linked multi-book chronology model as group-and-character Memory Books.

The omniscient book supplies the canonical chronology. Each character book contains only the linked entries written for that character, so it may contain chronological gaps.

Consolidated entries preserve Narrator ownership and participant metadata collected from their source entries:

* owner IDs are carried forward when character-owned sources are consolidated; and
* participant IDs are carried forward from canonical sources.

A missing source in a character book is a gap in the supplied chronology. It must not be treated as proof that the character was absent, unconscious, or ignorant unless the source text says so.

## Catch-Up

`/stmb-catchup` can process Narrator Mode messages that already contain complete cast metadata.

It cannot run non-interactively across legacy Narrator messages whose cast was never stamped. Those ranges require manual scene processing and participant confirmation. After the legacy ranges are handled manually, catch-up can be used for later fully tagged ranges.

## Branching

When **Copy Memory Books when branching** is enabled, a Narrator Mode branch receives independent copies of:

* the omniscient Memory Book; and
* every declared cast Memory Book, including books belonging to retired members.

All copies use one shared branch number. The new branch's Narrator cast configuration is rewritten to point to the copied character books, and canonical links inside copied entries are rewritten when both linked books were copied.

If branch copying fails, STMB clears the inherited Narrator bindings and disables Narrator Mode in the child branch so it cannot accidentally write into the parent's books.

## Operations That Do Not Automatically Distribute

Narrator Mode's automatic distribution applies to normal scene-memory creation, automatic memories, and compatible catch-up memories.

The following operations still affect only the selected target entry or Memory Book:

| Operation | Narrator Mode behavior |
|---|---|
| Clip | Saves to the selected/effective Memory Book only |
| Topical Clip | Reads and writes the selected Memory Book only |
| Side Prompt | Saves to its resolved Memory Book target only |
| Compaction | Replaces only the selected entry |
| Regeneration | Replaces only the entry being regenerated |
| Manual lorebook edit | Changes only that entry |
| Manual deletion | Deletes only that entry |

Linked copies are not live-synchronized.

## Group Chat Mode vs. Narrator Mode

| Behavior | Native Group Chat Mode | Narrator Mode |
|---|---|---|
| SillyTavern chat type | Group chat | Normal one-on-one chat |
| Character identity source | Message-author character card | User-declared cast member ID |
| Participant source | Character cards that authored messages | Cast snapshots stamped on Narrator messages |
| Automatic one-book setup | Supported | Not supported |
| Manual mode required | Only for multiple books | Always |
| Omniscient/canonical book | Optional advanced layout | Required |
| Individual books | Assigned to group character cards | Assigned to declared fictional characters |
| Shared individual book | Allowed | Not allowed |
| STLO required for individual routing | Yes | No |
| Native character filters | Used | Not used |
| Active character control | SillyTavern speaker | Active Cast drawer |
| Character-card locks | Supported | Not applicable |

## Troubleshooting

### Narrator Mode cannot be enabled

Check that:

1. the current chat is not a SillyTavern group chat;
2. Manual Lorebook Mode is enabled; and
3. an omniscient manual Memory Book is selected.

### A memory refuses to run because the cast configuration is invalid

Check every declared member, including retired members:

* the assigned Memory Book still exists;
* no two members use the same Memory Book; and
* no member uses the omniscient Memory Book.

### A character did not receive a memory copy

Check:

* whether the character was selected in the Active Cast drawer before generation;
* whether the final Narrator response contains that cast snapshot;
* whether the scene included a legacy-message confirmation and the character was selected there; and
* whether the character's Memory Book assignment is valid.

The presence of a name in prose is not enough by itself.

### The wrong character memories appeared in a Narrator reply

Check the Active Cast drawer and the selected swipe. The drawer is restored from the current timeline/swipe metadata. Also verify that the generation was not started before the drawer was changed.

### Catch-up refuses a legacy range

Process the untagged range manually so its participants can be reviewed, then resume catch-up at the first later range whose messages have complete Narrator cast metadata.

## Compact Mental Model

```text
User selects Active Cast
        ↓
STMB snapshots cast at generation start
        ↓
Selected character Memory Books join the Narrator request
        ↓
Response is stamped with stable cast member IDs
        ↓
Scene memory reads those IDs as participants
        ↓
Canonical memory goes to omniscient book
        ↓
Participant copies go to their individual books
```

Narrator Mode is therefore an explicit metadata-and-routing system. It does not parse prose to guess who exists, who was present, or who should own a memory.
