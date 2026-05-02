# 🎡 Side Prompts

Side Prompts are extra STMB prompt runs for chat maintenance. They can analyze, track, summarize, clean up, or update supporting notes without making the normal character reply do all that work. Use them when a chat needs an ongoing tracker, relationship report, plot list, invention log, NPC status sheet, timeline, or similar support document. The character can keep roleplaying. The Side Prompt handles the paperwork. ❤️

## Table of Contents

- [What Side Prompts Are](#what-side-prompts-are)
- [When to Use Them](#when-to-use-them)
- [Quick Setup Walkthrough](#quick-setup-walkthrough)
- [How Runs Work](#how-runs-work)
- [Manual Runs](#manual-runs)
- [Automatic After-Memory Runs](#automatic-after-memory-runs)
- [Side Prompt Sets](#side-prompt-sets)
- [Macros](#macros)
- [Message Ranges](#message-ranges)
- [Writing Good Side Prompts](#writing-good-side-prompts)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [Takeaways](#takeaways)

---

## What Side Prompts Are

A Side Prompt is a named prompt that runs separately from the normal character reply.

It can produce or update:

- plot trackers
- relationship trackers
- NPC or faction notes
- inventory/resource lists
- timelines
- mystery/clue boards
- invention or project trackers
- continuity reports
- cleanup notes
- lorebook-style support entries

Side Prompts are different from normal memories. Memories usually save scene summaries in sequence. Side Prompts usually maintain an ongoing state document that gets updated or overwritten.

They also do **not** have to return JSON. Plain text and Markdown are fine unless your specific prompt or save target requires something stricter.

---

## When to Use Them

Use Side Prompts for structured support work.

Good uses:

- **Plot points:** active threads, resolved threads, loose ends
- **Relationships:** trust, tension, attraction, boundaries, goals
- **NPCs:** what each NPC knows, wants, did recently, or needs next
- **Timeline:** dates, travel, injuries, deadlines, countdowns
- **World state:** changed locations, objects, factions, resources
- **Mysteries:** clues, suspects, contradictions, unanswered questions
- **Projects:** inventions, research, blockers, scope drift, next steps
- **Continuity:** likely hallucination risks or missing context

Bad uses:

- anything that must appear inside the next character reply
- vague “make the story better” prompts
- giant analysis prompts that produce essays every run
- duplicate memory summaries with no separate job

Side Prompts are not magic. A vague Side Prompt is just organized vagueness.

---

## Quick Setup Walkthrough

Need the click-by-click version? Use the [Scribe walkthrough for enabling Side Prompts](https://scribehow.com/viewer/How_to_Enable_Side_Prompts_in_Memory_Books__fif494uSSjCmxE2ZCmRGxQ).

The short path is: open **Extensions**, open **Memory Books**, click **Side Prompts**, choose the prompt you want, enable it, optionally turn on **Run automatically after memory**, then **Save** and **Close**.

---

## How Runs Work

A normal Side Prompt run follows the same basic path:

1. STMB chooses the messages to review.
2. The Side Prompt is prepared.
3. Any needed macros are filled in.
4. The model generates the Side Prompt output.
5. STMB checks the output.
6. The result is previewed, saved, updated, or skipped according to the Side Prompt settings.

Manual Side Prompts, after-memory Side Prompts, and Side Prompt Set rows should feel like the same system. They share the same general execution behavior for previews, batching, blank-response checks, saves, stop handling, and notifications.

---

## Manual Runs

Use `/sideprompt` to run one Side Prompt manually.

Basic form:

```txt
/sideprompt "Prompt Name"
```

With a message range:

```txt
/sideprompt "Prompt Name" 10-20
```

With a runtime macro:

```txt
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-20
```

Use quotes around prompt names with spaces.

Manual runs are best for one-off checks, targeted updates, and prompts that need custom macro values.

---

## Automatic After-Memory Runs

Some Side Prompts can run automatically after a memory is created.

This is useful when a tracker should stay current as the chat develops. For example, a relationship tracker or plot tracker may update after each memory.

There are two after-memory modes:

- **Use individually-enabled side prompts** — old behavior; any Side Prompt with **Run automatically after memory** enabled can run.
- **Use a named Side Prompt Set** — the selected set runs instead.

A selected Side Prompt Set replaces individually-enabled after-memory Side Prompts. It does **not** add to them. That prevents duplicate runs caused by old checkboxes users forgot about.

---

## Side Prompt Sets

Side Prompt Sets group multiple Side Prompts into one ordered workflow.

A set is an ordered run list, not just a folder. The same Side Prompt can appear more than once with different macro values.

Example set:

1. Relationship Tracker with `{{npc name}} = Alice`
2. Relationship Tracker with `{{npc name}} = Bob`
3. Plot Points Tracker
4. Scene Cleanup Notes

This lets one prompt template maintain separate entries for different NPCs, factions, locations, or projects.

### Managing Sets

Open **🎡 Trackers & Side Prompts** to create, edit, duplicate, delete, or reorder sets.

Each row can include:

- a Side Prompt
- an optional row label
- stored macro values
- duplicate/delete controls
- move up/down controls

Rows run from top to bottom. Put foundational trackers first and cleanup/reporting prompts later.

### Running a Set Manually

Run a set with stored values:

```txt
/sideprompt-set "Set Name"
```

With a range:

```txt
/sideprompt-set "Set Name" 10-20
```

Run a reusable set with macro values:

```txt
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice" {{npc_2}}="Bob" 10-20
```

Use `/sideprompt-macroset` when the set has reusable tokens that still need values.

### Missing Sets or Rows

Side Prompt Sets are strict on purpose:

- If no set is selected, individually-enabled after-memory behavior is used.
- If a set is selected, individually-enabled after-memory prompts are ignored.
- If the selected set was deleted, nothing runs and STMB warns you.
- If a row points to a deleted prompt, that row is skipped and STMB warns you.
- If a row still needs a macro value, that row is skipped and STMB warns you.

Silent fallback would be worse. If a selected workflow broke, you should know.

---

## Macros

Side Prompts can use normal SillyTavern macros such as `{{user}}` and `{{char}}`.

They can also use runtime macros, which are placeholders filled in when the Side Prompt runs.

Example runtime macro:

```txt
{{npc name}}
```

Manual run:

```txt
/sideprompt "Relationship Tracker" {{npc name}}="Alice"
```

Stored set value:

```txt
{{npc name}} = Alice
```

Reusable set-level value:

```txt
{{npc name}} = {{npc_1}}
```

Then run:

```txt
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice"
```

### Macro Tips

Use boring names:

```txt
{{npc name}}
{{npc_1}}
{{faction}}
{{project_name}}
```

Avoid names like:

```txt
{{the guy we mean}}
{{stuff}}
{{important person}}
```

Spaces are readable in the UI. Underscores are usually less annoying in slash commands.

A Side Prompt with custom runtime macros should not be individually automated unless the needed values are stored somewhere, such as inside a Side Prompt Set row. Automatic runs cannot stop and ask you who `{{npc name}}` is supposed to be.

---

## Message Ranges

Side Prompts can run against a specific message range.

```txt
/sideprompt "Plot Points" 50-80
```

If you provide a range, STMB uses that range.

If you do not provide a range, STMB uses the normal since-last Side Prompt behavior with the existing cap/checkpoint logic.

For routine tracking, since-last behavior is easier. For debugging or targeted cleanup, explicit ranges are clearer.

Side Prompt range compiling should follow the same hidden-message preference used by memory, including the global unhide-before-memory setting.

---

## Writing Good Side Prompts

A good Side Prompt has a job. A bad Side Prompt has vibes.

Be clear about:

- what it should review
- what it should update
- what it should ignore
- what format it should output
- how long the output should be
- whether it should replace, revise, or append

### Keep Output Short on Purpose

Trackers bloat unless told not to.

Weak:

```txt
Update the relationship tracker.
```

Better:

```txt
Update the relationship tracker. Preserve useful facts, remove resolved or obsolete details, and keep each entry to 1-3 concise bullets. Output only the updated tracker.
```

Useful guardrails:

```txt
Do not append a new section unless there is genuinely new information. Merge updates into existing entries when possible.
```

```txt
Remove resolved threads. Do not preserve stale speculation just because it appeared in the old tracker.
```

```txt
Output only the updated report. No commentary, no explanation, no preface.
```

### Use Stable Headings

Stable headings make repeated updates cleaner.

Good:

```md
# Relationship Tracker

## Current Status

## Recent Changes

## Open Tensions

## Next Likely Developments
```

Bad:

```md
# Here is my extensive and emotionally intelligent breakdown of everything that might be happening
```

### Do Not Ask for Everything

A Side Prompt that asks for every detail will usually produce every detail.

Choose what matters. A plot tracker usually needs the unresolved hook, what changed, who knows, and what needs follow-up. It does not need every facial expression in the scene.

### Make Macro Use Obvious

Good names:

```txt
Relationship Tracker - {{npc name}}
NPC Status - {{npc name}}
Faction Tracker - {{faction}}
```

Less useful names:

```txt
Tracker 3
Update thing
Misc relationship prompt
```

Users should not need to open the full prompt body to understand why it is asking for a value.

---

## Examples

### Plot Points Tracker

Use this when a chat has several active storylines.

```txt
Update the plot points tracker based on the selected messages. Keep only active or recently resolved threads. Group by storyline. Output only the updated tracker.
```

Suggested shape:

```md
# Plot Points

## Active Threads

1. **Missing artifact** — Current status and latest clue.
2. **Rival faction** — What they want and what changed.

## Recently Resolved

1. **Old misunderstanding** — Resolved when Alice told Bob the truth.

## Needs Follow-Up

1. Who has the key?
2. Why did the guard lie?
```

### Relationship Tracker With Macro

Prompt requires:

```txt
{{npc name}}
```

Manual run:

```txt
/sideprompt "Relationship Tracker" {{npc name}}="Alice" 10-40
```

Set rows:

| Row | Side Prompt | Stored Macro |
|---|---|---|
| 1 | Relationship Tracker | `{{npc name}} = Alice` |
| 2 | Relationship Tracker | `{{npc name}} = Bob` |

This avoids making separate prompt definitions for every NPC.

### Invention or Project Tracker

Use this when a user keeps inventing, researching, building, or changing something over time.

```txt
Update the project tracker. Track only meaningful changes in goal, progress, blockers, scope, dependencies, or story relevance. Keep entries concise and ordered by first introduction.
```

This is usually cleaner than saving ten memory entries that all say the project exists.

### Reusable Cast Pass

Create a set using set-level runtime tokens:

```txt
{{npc_1}}
{{npc_2}}
```

Run it:

```txt
/sideprompt-macroset "Cast Pass" {{npc_1}}="Alice" {{npc_2}}="Bob"
```

Reuse it later:

```txt
/sideprompt-macroset "Cast Pass" {{npc_1}}="Mira" {{npc_2}}="Jonas"
```

Same set. Different cast. 💡

---

## Troubleshooting

### My Side Prompt did not run after memory.

Check:

- Did memory actually run?
- Is the Side Prompt enabled for after-memory runs?
- Is the chat using **Use individually-enabled side prompts**?
- Is the chat using a Side Prompt Set instead?
- Does the prompt need a macro value that was not supplied?
- Was the prompt deleted, renamed, or moved?

If the chat uses a Side Prompt Set, individually-enabled after-memory checkboxes are ignored for that chat.

### My Side Prompt Set did not run.

Check:

- Is the set selected for this chat?
- Does the set still exist?
- Do all rows point to existing Side Prompts?
- Do all required macros have stored or supplied values?

Automatic runs cannot ask for missing values. Store macro values in the set or run it manually with `/sideprompt-macroset`.

### One row was skipped.

Likely causes:

- the referenced Side Prompt was deleted
- the referenced Side Prompt was renamed
- the row has unresolved macros
- the model returned a blank or invalid response

STMB should warn instead of pretending everything worked.

### The output is too long.

Add hard limits:

```txt
Keep the full output under 300 words.
```

```txt
Use no more than 5 active items.
```

```txt
Merge related details. Remove stale, resolved, or redundant details.
```

Models do not naturally know when a tracker has become uselessly large. Tell them.

### It ran twice.

Check for:

- manual run plus automatic run
- duplicate rows inside a set
- repeated copies of the same Side Prompt
- multiple chats or tabs triggering work close together

A selected Side Prompt Set should replace individually-enabled after-memory prompts, which prevents one common duplicate-run problem.

### The wrong messages were analyzed.

Use an explicit range:

```txt
/sideprompt "Plot Points" 50-80
```

Since-last behavior is convenient. Explicit ranges are better for debugging.

### The tracker keeps stale information.

Tell the Side Prompt to remove stale information.

```txt
Update the tracker. Remove obsolete speculation, resolved conflicts, and details contradicted by the selected messages.
```

Trackers do not stay clean by accident.

---

## Takeaways

### For Users

Use Side Prompts when you want structured help maintaining a long chat.

Manual runs are best for one-time analysis. After-memory runs or Side Prompt Sets are best for trackers that should stay current.

### For Botmakers

Build Side Prompts like maintenance tools, not roleplay prose.

Use stable headings, strict output rules, and clear update behavior. Use macros when one prompt should work for several NPCs, factions, locations, or projects.

### For Admins

Side Prompts add more generated work.

That means they should be predictable, inspectable, and boring in the best possible way. Sets help because they make the intended workflow explicit instead of leaving it to checkbox soup.
