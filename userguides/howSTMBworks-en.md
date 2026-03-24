# How SillyTavern Memory Books (STMB) Works

This is a high-level explanation of how STMB works. It is not meant to explain the code! Instead, this document explains what information STMB assembles, what order it is sent in, and what the model is expected to return.

Use this document to help you write or edit prompts for STMB.

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

=== PREVIOUS SCENE CONTEXT (DO NOT SUMMARIZE) ===
[zero or more earlier memories]
=== END PREVIOUS SCENE CONTEXT - SUMMARIZE ONLY THE SCENE BELOW ===

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

=== PREVIOUS SCENE CONTEXT (DO NOT SUMMARIZE) ===
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

