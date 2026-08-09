<!--
Copyright (C) 2024–2026 Aiko Hanasaki
SPDX-License-Identifier: AGPL-3.0-only
-->

# 🎡 Side Prompts

Side Prompts are extra STMB prompt runs for chat maintenance. They can analyze, track, summarize, clean up, or update supporting notes without making the normal character reply do all that work. Use them when a chat needs an ongoing tracker, relationship report, plot list, invention log, NPC status sheet, timeline, or similar support document. The character can keep roleplaying. The Side Prompt handles the paperwork. ❤️

## Table of Contents

- [What Side Prompts Are](#what-side-prompts-are)
- [When to Use Them](#when-to-use-them)
- [Quick Setup Walkthrough](#quick-setup-walkthrough)
- [How Runs Work](#how-runs-work)
- [Manual Runs](#manual-runs)
- [Automatic After-Memory Runs](#automatic-after-memory-runs)
- [Automatic Interval Runs](#automatic-interval-runs)
- [Side Prompt Sets](#side-prompt-sets)
- [Defaults and Per-Chat Selection](#defaults-and-per-chat-selection)
- [What Goes Into a Side Prompt Run](#what-goes-into-a-side-prompt-run)
- [Macros](#macros)
- [Message Ranges](#message-ranges)
- [Lorebook Targets and Entry Settings](#lorebook-targets-and-entry-settings)
- [Connection Profile Overrides](#connection-profile-overrides)
- [Regenerating a Side Prompt Entry](#regenerating-a-side-prompt-entry)
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

## Automatic Interval Runs

A Side Prompt can run after a configured number of **visible** messages have accumulated since its last checkpoint.

Use interval runs when a tracker should update regularly even if no memory has just been created. For example, a lightweight combat-status tracker might update every 20 visible messages while normal memories are created every 40.

In the Side Prompt editor:

1. Enable **Run on visible message interval**.
2. Enter the number of visible messages required.
3. Enable the Side Prompt itself.

Hidden/system messages do not count toward the visible-message interval.

If the chat uses a Side Prompt Set, interval runs use that selected set instead of scanning every individually enabled prompt. Only rows whose referenced Side Prompt has an interval trigger are included. The same selected set can therefore contain some rows for after-memory runs, some for interval runs, and some for both.

A Side Prompt containing unresolved custom runtime macros cannot run automatically. Store the needed values in a set row or run it manually.

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

Open **🎡 Trackers & Side Prompts** to create, edit, duplicate, delete, import, export, or reorder prompts and sets. Side Prompt import is additive: existing prompts remain, while imported key conflicts are renamed instead of overwriting the originals.

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

- If the chat explicitly uses individual mode, individually enabled automatic prompts are used.
- If the chat inherits an empty default, individually enabled automatic prompts are used.
- If a set is selected or inherited, individually enabled prompts outside that set are ignored for both after-memory and interval runs.
- If the selected set was deleted, nothing runs and STMB warns you.
- If a row points to a deleted prompt, that row is skipped and STMB warns you.
- If a row still needs a macro value, that row is skipped and STMB warns you.

Silent fallback would be worse. If a selected workflow broke, you should know.

---

## Defaults and Per-Chat Selection

Memory Books General Settings can define:

- a **Default for solo chats**; and
- a **Default for group chats**.

Each chat then has three choices in the Side Prompts panel:

1. **Inherit solo/group default**
2. **Use individually-enabled side prompts**
3. A specific named Side Prompt Set

An empty global default means individual mode.

The per-chat choice is an override. Changing the global default affects chats that still inherit it, but not chats that explicitly selected individual mode or a particular set.

If a set is deleted, matching global defaults are cleared. The current chat resets if it was explicitly using that set. Other chats that explicitly referenced it may show a missing selection until you choose a new mode; STMB warns instead of silently substituting a different workflow.

Remember that the set only chooses the candidate rows. Each referenced Side Prompt still needs the appropriate automatic trigger for the current run:

- **Run automatically after memory** for after-memory work
- **Run on visible message interval** for interval work

Manual `/sideprompt-set` and `/sideprompt-macroset` runs do not require those automatic trigger checkboxes.

---

## What Goes Into a Side Prompt Run

STMB assembles a Side Prompt from several distinct sources. A typical order is:

1. The Side Prompt's instruction text
2. The prior saved entry, if one exists
3. Optional previous memories
4. Optional Additional Context
5. The selected or since-last scene text
6. Optional Response Format instructions

These sources serve different purposes.

### Prior entry

The prior entry is the current version of the tracker. Use it when the model should revise or replace existing state instead of starting over.

Tell the prompt what to do with stale information. Merely showing the old tracker does not make the model clean it up.

### Previous memories

A Side Prompt can include up to seven earlier scene memories from the effective Memory Book. They are labeled as context only and should not be copied into the tracker unless relevant to its specific job.

### Additional Context

Enable **Additional Context Source** when the Side Prompt needs stable lorebook reference entries.

- **Follow chat** uses the Context Setting selected for the current chat.
- A named fixed Context Setting always uses that collection for this Side Prompt.

If the selected setting or one of its source entries is missing, STMB warns, skips the missing reference, and continues.

### Scene text

An explicit command range uses exactly that inclusive range. Without one, STMB uses its since-last checkpoint/cap behavior for the Side Prompt.

### Response Format

Response Format is appended as instruction text. STMB does not enforce it as a JSON schema. Ask for the final plain text or Markdown that should be saved.

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

### Memory Book count macros

STMB also registers count macros for the effective main Memory Book:

| Macro | Count |
|---|---|
| `{{memtier0}}` | Memories |
| `{{memtier1}}` | Arcs |
| `{{memtier2}}` | Chapters |
| `{{memtier3}}` | Books |
| `{{memtier4}}` | Legends |
| `{{memtier5}}` | Series |
| `{{memtier6}}` | Epics |
| `{{memclips}}` | Clips |
| `{{memside}}` | Side Prompt entries |

These are standard macros, not runtime values supplied on the slash command. In Manual Mode they count the resolved manual Memory Book; in Automatic Mode they count the chat-bound Memory Book.

Example:

```txt
There are currently {{memtier0}} scene memories and {{memtier1}} arcs. If the scene-memory count is high, recommend whether consolidation would be useful.
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

## Lorebook Targets and Entry Settings

A Side Prompt normally saves to the effective Memory Book. You can redirect it to another lorebook through **Lorebook Target**.

When changing the target, STMB asks whether the selection should apply:

- **for this chat** — creates a per-chat override for that Side Prompt; or
- **to the Side Prompt template** — becomes its default target across chats.

Resolution order is:

1. valid per-chat override;
2. valid template-level target;
3. effective Memory Book.

A per-chat override may also explicitly select the Memory Book default.

Use a target override for trackers that belong in a shared campaign book, a dedicated status book, or another deliberately separate location. Do not scatter trackers across books without a retrieval plan.

### Lorebook entry controls

Each Side Prompt can set:

- **Entry title override** — supports normal and runtime macros;
- **Entry keywords** — comma-separated and macro-aware;
- **Activation mode** — Normal, Constant, or Vectorized;
- **Position** — character, example messages, author's note, or Outlet positions;
- **Outlet name** when Outlet is selected;
- **Order mode and value**;
- **Prevent recursion**;
- **Delay until recursion**; and
- **Ignore Budget**.

**Ignore Budget** asks SillyTavern to include the entry even when normal World Info budget calculations would otherwise exclude it. Use it sparingly; many always-included trackers can consume context quickly.

The title override helps one template maintain distinct entries when runtime macros are used. For example:

```txt
Relationship - {{npc name}}
```

The keyword field can use macros that are also present in the prompt or Response Format. STMB validates custom macro use so an automatic run cannot create an unresolved title or keyword.

---

## Connection Profile Overrides

By default, an automatic after-memory Side Prompt can inherit the memory run's connection settings, while standalone runs use the normal Memory Books profile resolution.

Enable **Override default memory profile** to bind a Side Prompt to a particular Memory Books profile. This lets a tracker use:

- a cheaper model;
- a model better at lists or structured maintenance;
- a different Custom connection profile; or
- different temperature/routing settings.

The selected Memory Books profile may itself use a named SillyTavern Custom connection, ChatCompletionService, a Chat Completion preset, reverse proxying, or other profile controls.

Keep the override disabled unless the Side Prompt genuinely needs different generation behavior. More profile combinations make troubleshooting harder.

---

## Regenerating a Side Prompt Entry

Current Side Prompt runs save a compact regeneration snapshot in the resulting lorebook entry. The snapshot records:

- which Side Prompt template ran;
- the prior entry content supplied to that run;
- the source chat and inclusive message range; and
- the runtime macro values.

To regenerate:

1. Open the target lorebook in SillyTavern's normal lorebook editor.
2. Find the Side Prompt entry.
3. Click **Regenerate side prompt**.
4. Review the replacement content.
5. Approve it only if it is correct.

Regeneration uses the saved snapshot with the **current** template and current settings. This means prompt improvements, profile changes, previous-memory settings, or Context Setting changes can affect the replacement.

The button is disabled when the entry has no valid regeneration snapshot, usually because it predates snapshot support or the saved metadata is invalid.

Even when the button is available, regeneration cannot complete if the Side Prompt template was deleted, the source chat is not open, or the original message range is unavailable.

If the original messages are all hidden, enable **Unhide hidden messages for memory generation** or reveal the range manually. STMB does not overwrite the target if the source messages or entry change while regeneration is running.

Only the Side Prompt content is replaced. Its existing title, keywords, and lorebook-entry settings stay in place.

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

### My inherited Side Prompt workflow is not the one I expected.

Check the selector at the top of **Trackers & Side Prompts**.

- **Inherit** follows the solo/group default from General Settings.
- **Use individually-enabled side prompts** ignores every set.
- A named set ignores automatic prompts outside that set.

Then check whether the referenced rows have the correct after-memory or interval trigger enabled.

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

### My Side Prompt saved to the wrong lorebook.

Check both scopes:

1. the per-chat Lorebook Target override; and
2. the template-level Lorebook Target.

A valid per-chat override wins. Clear it or explicitly choose the Memory Book default when the chat should stop using the alternate book.

### Regenerate side prompt is disabled.

Hover the button for the exact reason. The entry may lack a valid snapshot. If the button is available but the run fails, its template may be missing, the source chat may not be open, or the original range may be invalid. Run the Side Prompt again normally to create a fresh snapshot when possible.

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
