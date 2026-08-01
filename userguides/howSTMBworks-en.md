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
* Side prompt trackers
* Clips
* Topical Clips
* Other STMB-managed entries

This means STMB does not create a separate hidden memory system outside SillyTavern. It produces lorebook entries that can be inspected, edited, activated, reordered, exported, or deleted through the normal SillyTavern lorebook tools.

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


## The 3 Main STMB Prompt Flows

STMB has three main workflows:

1. Memory generation
2. Side prompts
3. Consolidation

They are related, but they do not expect the same kind of output.

- Memory generation expects strict JSON.
- Side prompts usually expect clean plain text (can use Markdown or other lorebook entry formats, DO NOT USE JSON in side prompts).
- Consolidation expects strict JSON but in a different schema than memories.

## I. Memory Generation

When you create a memory, STMB sends one assembled prompt that usually contains these parts in this order:

1. The selected memory prompt or preset text
   - This is the instruction block from the Summary Prompt Manager.
   - It tells the model what kind of summary to write and what JSON shape to return.
   - Macros like `{{user}}` and `{{char}}` are resolved before send.

2. Optional previous-memory context
   - If the run was configured to include previous memories, they are inserted as read-only context.
   - They are clearly marked as context and not the thing to summarize again.

3. The current scene transcript
   - The selected chat range is formatted line by line as `Speaker: message`.
   - This is the actual scene the model is supposed to turn into a memory.

Very rough shape:

```text
[memory prompt / preset instructions]

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

## II. Side Prompts

Side prompts are NOT memories. They are tracker/update prompts that usually write or overwrite a separate lorebook entry. This is a very different concept from a memory and is extremely important to keep in mind. 

When a side prompt runs, STMB usually assembles these parts in this order:

1. The side prompt's main instruction text
   - This is the actual task prompt for that tracker.
   - ST standard macros like `{{user}}` and `{{char}}` are resolved.
   - Custom runtime macros can also be inserted for manual runs.

2. Optional prior entry
   - If that side prompt already has saved content, STMB can include the current version first.
   - This lets the model update an existing tracker instead of writing from scratch every time.

3. Optional previous-memory context
   - If the template asks for previous memories, STMB inserts them as read-only context.

4. The compiled scene text
   - This is the current scene material the tracker should react to.

5. Optional response-format guidance
   - This is not enforced as a parser schema.
   - It is just additional instruction about the output format you want.

Very rough shape:

```text
[side prompt instructions]

=== PRIOR ENTRY ===
[existing tracker text, if any]

=== PREVIOUS SCENE CONTEXT (DO NOT PROCESS) ===
[optional previous memories]
=== END PREVIOUS SCENE CONTEXT ===

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

### Practical prompt-writing advice for consolidation

- Tell the model whether you want one coherent recap or the smallest coherent number of recaps.
- Require chronology.
- Require explicit handling of leftovers.
- Keep keywords concrete here too; higher-tier summaries still need retrieval value.

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
  Yes. Check your terminal/log output if you want to inspect the assembled prompt.

- "Does STMB force good output if my prompt is weak?"
  Not really. STMB can sometimes rescue malformed JSON, but it cannot fix a vague prompt that asked for the wrong thing.

- "What should I optimize first when rewriting prompts?"
  First optimize the return format. Then optimize what details to preserve. Style comes after that.
