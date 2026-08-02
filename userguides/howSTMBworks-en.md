<!--
Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only
-->

# How SillyTavern Memory Books (STMB) Works

This is a high-level explanation of how STMB works. It is not meant to explain the code! Instead, this document explains what information STMB assembles, what order it is sent in, and what the model is expected to return.

Use this document to help you write or edit prompts for STMB.

## Lorebooks and Memory Books

To understand how STMB works, it helps to first understand the role of lorebooks.

A **lorebook** is a collection of entries that SillyTavern can add to the model’s context during chat generation. Lorebooks are also called **World Info** in parts of SillyTavern.

A lorebook entry normally contains:

* A title or comment used to identify the entry
* The actual text that may be sent to the model
* Keywords or other activation rules
* Settings that control when and how the entry is inserted

Lorebooks are often used for character information, locations, setting details, rules, and other facts that should become available when relevant.

STMB uses the same system to store information derived from the chat.

### What Is a Memory Book?

A **Memory Book** is a SillyTavern lorebook being used by STMB to store memories and related entries.

It is not a separate file format or a different kind of database. It is an ordinary lorebook whose entries are created and managed through STMB workflows.

Depending on the features you use, a Memory Book may contain:

* Scene memories
* Consolidated Arc, Chapter, or Book summaries
* Side Prompt trackers
* Clips
* Topical Clips
* Other STMB-managed entries

This means STMB does not create a separate hidden memory system outside SillyTavern. It produces lorebook entries that can be inspected, edited, activated, reordered, exported, or deleted through the normal SillyTavern lorebook tools.

### Branching and Memory Book Independence

When **Copy Memory Books when branching** is enabled, a newly created native SillyTavern branch receives copies of its active unlocked Memory Books.

This matters because a branch is usually a new continuity. If both chats continued writing into the same book, later memories from the parent and branch could contradict each other inside one timeline.

STMB copies the chat-bound or main manual book and, for a Manual Mode group, each unique unlocked character book. In Narrator Mode it copies the omniscient book and every declared cast book, then rewrites the branch cast assignments to the copies. Persistent character locks are preserved instead of copied because a lock explicitly means that the character should keep using one continuing book.

Branch copying changes storage and internal links. It does not regenerate the contents. Existing entries are cloned, branch-specific chat IDs are rewritten, and canonical group/character lorebook links are redirected when both books were copied.

## Native Group Chats and Narrator Chats

STMB supports two different multi-character architectures.

### Native Group Chat Mode

A native SillyTavern group contains separate character cards. Each assistant message identifies the character card that authored it. STMB can use those message authors as participant identities and can write native character filters.

### Narrator Mode

Narrator Mode is for a normal one-on-one chat where one Narrator card writes several fictional characters inside its prose. SillyTavern identifies only the Narrator card, so STMB cannot derive the fictional cast from message authors.

Narrator Mode therefore uses explicit metadata:

1. The user declares fictional cast members and assigns one unique Memory Book to each.
2. The user selects the Active Cast before generation.
3. STMB snapshots that selection at generation start.
4. The selected character Memory Books join the generation's character-lore candidate collection.
5. STMB stamps the completed Narrator message with stable cast-member IDs.
6. Memory creation reads those IDs to determine which character books receive linked copies.

Narrator Mode requires Manual Lorebook Mode and one omniscient Memory Book. It does not use native character filters and does not require STLO.

### Narrator message metadata

The logical message metadata is:

```json
{
  "extra": {
    "STMemoryBooks": {
      "narratorCast": {
        "version": 1,
        "memberIds": ["stable-member-id"]
      }
    }
  }
}
```

The IDs refer to the current chat's declared Narrator cast. They are not character names parsed from text.

If every Narrator response in a scene has this metadata, the Narrator responses are authoritative and their member IDs are unioned into the scene participant list. If any Narrator response is untagged, STMB treats the range as legacy data, uses available message snapshots as hints, and requires a participant confirmation.

The canonical entry receives `STMB_narratorParticipantIds`. Individual copies receive `STMB_narratorOwnerIds`. These fields replace native character filters for Narrator routing and allow regeneration and consolidation to preserve the target type.

For the complete behavior, see [Narrator Mode: Technical Guide](narrator-mode-en.md).

### Generation and Retrieval Are Separate Steps

There are two distinct parts to the memory process:

1. **STMB generates and saves an entry.**
2. **SillyTavern decides whether that entry should be added to a later chat request.**

During memory generation, STMB sends the selected scene and instructions to a model. The model returns a title, memory text, and keywords. STMB then saves that result as a lorebook entry.

Later, when SillyTavern prepares a normal chat-generation request, the lorebook system evaluates the saved entry. If its activation conditions are met, SillyTavern inserts the entry into the model’s context.

Very roughly:

```text
Chat scene
    ↓
STMB memory-generation prompt
    ↓
Model returns memory JSON
    ↓
STMB saves a lorebook entry
    ↓
A later chat mentions a matching subject
    ↓
SillyTavern activates the entry
    ↓
The saved memory is sent to the chat model
```

This distinction is important when troubleshooting.

If an entry does not exist in the Memory Book, the problem occurred during generation or saving.

If the entry exists but is not being sent during chat generation, the problem is more likely related to lorebook activation, keywords, entry settings, context budget, recursion, or lorebook assignment.

If the entry is being sent but the model does not use it correctly, the issue is model behavior rather than memory creation or retrieval.

### Memory Entries Are Compressed Context

A Memory Book entry is not the original chat transcript. It is a compressed representation of information from that transcript.

For a scene memory, the model is normally asked to preserve information such as:

* What happened
* Who was involved
* What decisions were made
* What changed
* What was discovered
* What consequences followed
* Which details may matter later

The generated memory allows important information to remain available without requiring the entire original scene to stay inside every future chat request.

STMB can optionally hide chat messages that have already been processed into memories. Hiding does not delete those messages. It prevents them from continuing to consume the active chat-history context while the Memory Book carries forward the information that should remain relevant.

### Keywords Control Retrieval

Scene memories normally include activation keywords.

These keywords help SillyTavern recognize when the memory may be relevant to the current conversation.

Useful keywords are generally concrete and distinctive:

* Character names
* Location names
* Organizations
* Important objects
* Event names
* Aliases
* Specific actions or discoveries

For example, a memory about Alice finding a coded letter in the Silver Rose Hotel might use keywords such as:

```json
[
  "Alice",
  "Silver Rose Hotel",
  "coded letter",
  "room 417"
]
```

Keywords such as `important event`, `conversation`, or `secret` are usually less useful because they are too broad and may activate in unrelated situations.

The summary text determines what the model learns when the entry activates. The keywords help determine when SillyTavern should retrieve it.

### Different STMB Entries Serve Different Purposes

Not every entry in a Memory Book is a scene memory.

A scene memory records what happened during one selected range of messages.

A Side Prompt usually maintains a changing reference entry, such as a cast list, relationship tracker, inventory, or unresolved plot-thread report.

A Consolidation entry combines several lower-level memories into a larger chronological summary.

A Clip preserves a specific fact or selected piece of chat information.

A Topical Clip gathers information about one subject from existing memories.

All of these features ultimately produce lorebook entries, but they differ in:

* What source material they process
* What instructions are sent to the model
* What response format STMB expects
* Whether the entry is created once or repeatedly updated
* How the resulting entry is expected to activate

### The Important Mental Model

Do not think of STMB as giving the model a permanent internal memory.

Think of it as maintaining an external reference system:

```text
Chat history
    ↓
STMB extracts and organizes important information
    ↓
The information is stored in lorebook entries
    ↓
SillyTavern retrieves relevant entries
    ↓
The model receives those entries as context
```

The model does not remember the information between requests on its own. It knows the information again when SillyTavern includes the appropriate Memory Book entries in the current request.

The quality of the final result therefore depends on three separate things:

1. **Generation quality**
   Did the STMB prompt produce an accurate and useful entry?

2. **Storage and configuration**
   Was the entry saved in the correct Memory Book with appropriate settings?

3. **Retrieval and model use**
   Did SillyTavern activate the entry, and did the chat model use the supplied information correctly?

The prompt flows described below mainly concern the first step: what STMB sends to the model when creating or updating those lorebook entries.


## Context Sources Are Not Interchangeable

Several kinds of text may appear in an STMB request. They have different jobs:

- **Current scene:** the messages being processed now.
- **Previous memories:** earlier STMB memories supplied only for continuity.
- **Additional Context:** selected lorebook reference entries from a reusable Context Setting.
- **Prior Side Prompt entry:** the current tracker text that should be revised.
- **Consolidation sources:** lower-tier memories or summaries that are the actual material being grouped and compressed.
- **Previous higher-tier summary:** canon carried forward during consolidation, not a source to rewrite.

A prompt should identify which material is the target and which material is reference-only. Many bad outputs come from treating previous memories or Additional Context as if they were part of the current scene.

## The 3 Main STMB Prompt Flows

STMB has three main structured generation workflows:

1. Memory generation
2. Side prompts
3. Consolidation

They are related, but they do not expect the same kind of output.

- Memory generation expects strict JSON.
- Side prompts usually expect clean plain text or Markdown. Do not use JSON unless your own tracker format deliberately needs JSON text.
- Consolidation expects strict JSON but in a different schema from memories.

## I. Memory Generation

When you create a memory, STMB sends one assembled prompt that usually contains these parts in this order:

1. The selected memory prompt or preset text
   - This is the instruction block from the Summary Prompt Manager.
   - It tells the model what kind of summary to write and what JSON shape to return.
   - Macros such as `{{user}}`, `{{char}}`, and the STMB count macros are resolved before send.

2. Optional Additional Context
   - The current chat may select a reusable Context Setting containing ordered lorebook entries.
   - These entries are clearly labeled as reference material.
   - They may provide rules, canon, terminology, or stable facts that are not present in the scene.

3. Optional previous-memory context
   - If the run was configured to include previous memories, they are inserted as read-only continuity context.
   - They are clearly marked as context and not the thing to summarize again.

4. The current scene transcript
   - The selected chat range is formatted line by line as `Speaker: message`.
   - This is the actual scene the model is supposed to turn into a memory.

Very rough shape:

```text
[memory prompt / preset instructions]

=== ADDITIONAL CONTEXT FOR REFERENCE ===
[zero or more ordered lorebook entries]
=== END ADDITIONAL CONTEXT FOR REFERENCE ===

=== PREVIOUS SCENE CONTEXT (DO NOT PROCESS) ===
[zero or more earlier memories]
=== END PREVIOUS SCENE CONTEXT - PROCESS ONLY THE SCENE BELOW ===

=== SCENE TRANSCRIPT ===
Alice: ...
Bob: ...
=== END SCENE ===
```

### What the model should return

We expect one JSON object:

```json
{
  "title": "Short scene title",
  "content": "The actual memory text",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}
```

Best practice:

- Return only the JSON object.
- Use the exact keys `title`, `content`, and `keywords`.
- Make `keywords` a real JSON array of strings.
- Keep the title short and readable.
- Make keywords concrete and retrieval-friendly: places, objects, proper nouns, distinctive actions, identifiers.

STMB can sometimes rescue slightly messy output, but prompts should not rely on that.

### What makes a good memory prompt

Good memory prompts do four things clearly:

1. Tell the model what kind of memory to write
   - Detailed scene log
   - Compact synopsis
   - Minimal recap
   - Literary narrative memory

2. Tell the model what matters
   - story beats
   - decisions
   - character changes
   - reveals
   - outcomes
   - continuity-relevant details

3. Tell the model what to ignore
   - usually OOC
   - filler
   - flavor-only chatter, if you want a tighter memory

4. Tell the model exactly what JSON to return

### What makes a weak memory prompt

Weak prompts usually fail in one of these ways:

- They describe the writing style, but not the JSON shape.
- They ask for "helpful analysis" or "thoughts" instead of a final memory object.
- They encourage abstract keywords instead of concrete retrieval terms.
- They do not distinguish between prior context and the current scene.
- They ask for too many output formats at once.

### Practical prompt-writing advice for memories

- Be explicit about whether the summary should be exhaustive or token-efficient.
- If you want markdown inside `content`, say so plainly.
- If you want short memories, constrain the body, not the JSON schema.
- If you want strong retrieval, spend prompt space on keyword quality, not just summary style.
- Treat previous memories as continuity context, not source material to rewrite.
- Treat Additional Context as authoritative reference only to the extent your selected entries are authoritative; do not ask the model to summarize the reference block.

## II. Side Prompts

Side prompts are NOT memories. They are tracker/update prompts that usually write or overwrite a separate lorebook entry. This is a very different concept from a memory and is extremely important to keep in mind. 

When a Side Prompt runs, STMB usually assembles these parts in this order:

1. The Side Prompt's main instruction text
   - This is the actual task prompt for that tracker.
   - Standard macros such as `{{user}}`, `{{char}}`, and STMB count macros are resolved.
   - Custom runtime macros can be supplied by a manual command or stored in a Side Prompt Set row.

2. Optional prior entry
   - If that Side Prompt already has saved content, STMB includes the current version.
   - This lets the model update an existing tracker instead of writing from scratch every time.

3. Optional previous-memory context
   - If the template asks for previous memories, STMB inserts up to seven as read-only continuity context.

4. Optional Additional Context
   - The Side Prompt can follow the chat's Context Setting or select a fixed Context Setting.
   - The entries are supplied as ordered reference material.

5. The compiled scene text
   - This is the current scene material the tracker should react to.

6. Optional Response Format guidance
   - This is not enforced as a parser schema.
   - It is additional instruction about the final text layout.

Very rough shape:

```text
[side prompt instructions]

=== PRIOR ENTRY ===
[existing tracker text, if any]

=== PREVIOUS SCENE CONTEXT (DO NOT PROCESS) ===
[optional previous memories]
=== END PREVIOUS SCENE CONTEXT ===

=== ADDITIONAL CONTEXT FOR REFERENCE ===
[optional ordered lorebook entries]
=== END ADDITIONAL CONTEXT FOR REFERENCE ===

=== SCENE TEXT ===
[compiled scene text]

=== RESPONSE FORMAT ===
[optional format guidance]
```

### What the model should return

STMB expects plain text that is ready to save.

This is the key difference from memories:

- Side prompts do not want JSON.
- STMB normally saves the returned text as-is.
- If you ask for JSON in a side prompt, that JSON is just text unless your own workflow depends on it.

That means side prompt prompts should aim for usable final output, not parser-friendly memory JSON.

### What makes a good side prompt

Good side prompts are narrow, stable, and update-friendly.

Examples:

- Keep a cast list in importance order.
- Track current relationship state.
- Track unresolved plot threads.
- Track what `{{char}}` currently believes about `{{user}}`.

The best side prompt wording usually does this:

1. Defines the job clearly
   - "Maintain a cast tracker"
   - "Update the current relationship sheet"
   - "Keep an unresolved threads report"

2. Says whether to update, replace, or append
   - This matters because prior entry text may be included.

3. Defines the output layout
   - headings
   - bullet structure
   - sections
   - ordering rules

4. Says what not to include
   - speculation
   - duplicate items
   - stale information
   - narration about the task itself

### What makes a weak side prompt

- It is too broad: "track everything."
- It never says whether the old entry should be revised or rewritten.
- It asks for chain-of-thought or explanations instead of final tracker text.
- It leaves formatting vague, so the tracker drifts over time.

### Practical prompt-writing advice for side prompts

- Write side prompts like maintenance instructions, not summary prompts.
- Assume the model may see the current tracker first, then the new scene.
- Keep each tracker focused on one job.
- Use the Response Format field to control layout, section names, and ordering.
- Decide whether the Side Prompt should use the current Memory Book, a template-level target, or a per-chat target override. Storage destination affects later retrieval but does not change the prompt text itself.
- Automatic set selection and generation triggers are separate: a selected set chooses candidate rows, then STMB filters those rows for after-memory or interval eligibility.

## III. Consolidation

Consolidation combines lower-level entries into higher-level summaries.

Examples:

- memories into Arc summaries
- Arc summaries into Chapter summaries
- Chapter summaries into Book summaries

When consolidation runs, STMB usually assembles these parts in this order:

1. The selected consolidation prompt or preset text
   - This explains how the model should compress the source entries.
   - It also defines the JSON schema the model should return.

2. Optional previous higher-tier summary
   - If a previous summary in that tier is being carried forward, it is included first as canon context.
   - The prompt tells the model not to rewrite it.

3. The selected lower-tier entries in chronological order
   - Each source item is included with an identifier, title, and contents.
   - This is the material the model is supposed to group, compress, and turn into higher-tier summaries.

Very rough shape:

```text
[consolidation prompt / preset instructions]

=== PREVIOUS ARC/CHAPTER/BOOK (CANON - DO NOT REWRITE) ===
[optional previous higher-tier summary]
=== END PREVIOUS ... ===

=== MEMORIES / ARCS / CHAPTERS ===
=== memory 001 ===
Title: ...
Contents: ...
=== end memory 001 ===

=== memory 002 ===
Title: ...
Contents: ...
=== end memory 002 ===
...
=== END ... ===
```

### What the model should return

STMB expects a JSON object shaped like this:

```json
{
  "summaries": [
    {
      "title": "Short higher-tier title",
      "summary": "The consolidated recap text",
      "keywords": ["keyword1", "keyword2"],
      "member_ids": ["001", "002"]
    }
  ],
  "unassigned_items": [
    {
      "id": "003",
      "reason": "Why this item was left out"
    }
  ]
}
```

Important idea:

- Consolidation may return one summary or several.
- `member_ids` tells STMB which source entries belong to which returned summary.
- `unassigned_items` is how the model says "this entry does not fit the summary I just made."

### What makes a good consolidation prompt

Good consolidation prompts do three things well:

1. They define the compression target
   - one arc
   - one or more arcs
   - compact but complete recap
   - aggressively compressed recap

2. They define the selection logic
   - preserve chronology
   - keep continuity
   - merge related items
   - leave unrelated items unassigned

3. They define the JSON structure very clearly

The best consolidation prompts also tell the model what to preserve:

- major beats
- turning points
- promises
- consequences
- unresolved threads
- relationship changes
- continuity-critical quotes or identifiers

### What makes a weak consolidation prompt

- It asks for a recap, but never explains how to group source entries.
- It does not tell the model what to do with outliers.
- It does not require `member_ids`.
- It asks for freeform prose instead of the consolidation JSON object.
- It over-focuses on style and under-specifies selection and grouping.

### Group-chat and Narrator consolidation routing

In a Manual Mode multi-book group, the canonical group book uses **Group Chat Consolidation Analysis (Automatic)**. Its goal is an omniscient group chronology that distinguishes objective events from individual knowledge. Narrator Mode uses the same canonical-versus-character topology: the omniscient book is the canonical chronology, while declared character books contain only their owned copies.

Character books use the consolidation preset selected in the consolidation popup. A character book may have fewer source entries than the canonical book; missing entries are chronology gaps, not proof that the character was absent or ignorant. Narrator ownership and participant metadata are collected from the selected source entries and carried into the new summary.

### Practical prompt-writing advice for consolidation

- Tell the model whether you want one coherent recap or the smallest coherent number of recaps.
- Require chronology.
- Require explicit handling of leftovers.
- Keep keywords concrete here too; higher-tier summaries still need retrieval value.

## Other STMB Generation Flows

The three workflows above are the main prompt-authoring systems, but several other features also send focused requests.

### Clip

A normal Clip does not call the model. It saves the text selected in chat into a `[STMB Clip]` entry.

### Topical Clip

Topical Clip reads confirmed STMB memory entries from one selected Memory Book and asks the model to gather information about one topic.

It does not use raw chat, ordinary Clip entries, Side Prompt entries, or unrelated lorebook entries as evidence. When updating an existing Topical Clip, it can provide the existing Clip text and only new or changed source memories, or rebuild from all eligible memories.

The result is a reviewable draft. STMB saves nothing until the user approves it.

### Compaction

Compaction sends one selected STMB-managed entry to the model with its kind and title. The editable prompt receives:

- `{{ENTRY_CONTENT}}`
- `{{ENTRY_KIND}}`
- `{{ENTRY_TITLE}}`

The model should shorten and clean the existing entry without adding unsupported facts. The original remains unchanged until the user approves replacement.

## Regeneration Flows

Regeneration rebuilds an existing entry instead of creating another entry.

### Scene-memory regeneration

STMB reopens the original source chat range and runs the current memory-generation workflow. The user can choose the current profile, prompt, previous-memory count, and Additional Context. The original sequence number is retained when the title is reformatted.

### Consolidation regeneration

STMB reloads the exact linked lower-tier source entries and uses the dedicated **Regenerate Consolidation** preset. This preset expects one replacement summary, not the ordinary multi-summary consolidation schema.

### Side Prompt regeneration

Each compatible Side Prompt save records a compact snapshot containing the template key, prior entry content, source chat/range, and runtime macro values. Regeneration combines that snapshot with the current Side Prompt template and current settings.

### Regeneration safety

Before saving, STMB verifies that:

- the target entry is unchanged;
- the source chat range is unchanged;
- every consolidation source is unchanged; and
- the entry is still eligible.

If any check fails, nothing is overwritten. Review is always required.

## Memory Count Macros

STMB registers these standard SillyTavern macros:

```text
{{memtier0}}  scene Memory count
{{memtier1}}  Arc count
{{memtier2}}  Chapter count
{{memtier3}}  Book count
{{memtier4}}  Legend count
{{memtier5}}  Series count
{{memtier6}}  Epic count
{{memclips}}  Clip count
{{memside}}   Side Prompt entry count
```

They read the effective main Memory Book: chat-bound in Automatic Mode or the resolved manual Memory Book in Manual Mode. They are cached and return integer text.

These macros can help prompts adapt to the current state, but do not make prompts over-engineer their own workflow. A count tells the model how many entries exist; it does not provide those entries' contents.

## The Real Prompt-Writing Rule

When writing for STMB, do not just think, "What do I want the AI to say?"

Think:

1. What context will STMB place before the scene?
2. What is the actual unit of material being analyzed?
3. Is this path expecting strict JSON or final plain text?
4. What information should survive into retrieval later?
5. What should the model ignore, compress, preserve, or carry forward?

If your prompt answers those five questions clearly, it will usually work well with STMB.

## FAQ-Style Notes

- "Can I see what was actually sent to the AI?"
  Yes. Check the terminal/log output for the assembled request. Remember that provider routing through ChatCompletionService or a proxy may change which network layer is visible.

- "Does STMB force good output if my prompt is weak?"
  Not really. STMB can sometimes rescue malformed JSON, but it cannot fix a vague prompt that asked for the wrong thing.

- "What should I optimize first when rewriting prompts?"
  First optimize the return format. Then optimize what details to preserve. Style comes after that.
