# Side Prompts

Side Prompts are extra prompt runs used to analyze, track, summarize, clean up, or maintain information about a chat without making the normal character reply do all of that work.

That is the plain-English version.

Instead of asking the active character to both roleplay and maintain a relationship tracker, plot tracker, invention tracker, timeline, loose-end list, or NPC status sheet inside the same reply, a Side Prompt can run separately and produce a focused result.

Side Prompts are useful because long roleplay chats accumulate too much information for one normal generation to handle cleanly. They give STMB a controlled way to run supporting analysis around the chat.

## Table of Contents

1. [What Side Prompts Are](#what-side-prompts-are)
2. [Why They Exist](#why-they-exist)
3. [Common Uses](#common-uses)
4. [How Side Prompt Runs Work](#how-side-prompt-runs-work)
5. [Manual Side Prompt Runs](#manual-side-prompt-runs)
6. [After-Memory Side Prompts](#after-memory-side-prompts)
7. [Side Prompt Sets](#side-prompt-sets)
8. [Macros](#macros)
9. [Ranges](#ranges)
10. [Previews, Batching, Saves, and Stops](#previews-batching-saves-and-stops)
11. [Writing Good Side Prompts](#writing-good-side-prompts)
12. [Examples](#examples)
13. [Troubleshooting](#troubleshooting)
14. [What Side Prompts Do Not Mean](#what-side-prompts-do-not-mean)
15. [Takeaways](#takeaways)

## What Side Prompts Are

A Side Prompt is a named prompt that can be run against part of a chat.

It can be used to produce things like:

- an updated tracker
- a relationship analysis
- a plot summary
- a list of unresolved threads
- a cleanup pass
- a consistency report
- a memory support note
- a lorebook-style entry

The important part is that it is separate from the normal character reply.

The character does not need to stop roleplaying to maintain a spreadsheet of every unresolved subplot. That job can go to a Side Prompt instead.

## Why They Exist

Without Side Prompts, users and botmakers tend to cram too much into the normal generation prompt.

That causes predictable problems:

- the bot starts narrating tracker logic instead of roleplaying
- the normal reply gets bloated
- memory updates become inconsistent
- long chats accumulate loose ends that nobody is actually tracking
- users end up manually asking for summaries every few scenes
- botmakers duplicate the same analysis prompt in several places

Side Prompts are the boring answer to that problem. They give the supporting work somewhere to live.

## Common Uses

Side Prompts are best for structured support work.

Good candidates:

- **Plot points:** active storylines, unresolved hooks, recent developments, resolved threads
- **Relationship tracking:** current relationship state, trust, conflict, attraction, boundaries, goals
- **NPC tracking:** what each NPC knows, wants, did recently, or needs next
- **Timeline tracking:** dates, events, travel, injuries, pregnancies, deadlines, countdowns
- **Location tracking:** where characters are, what changed, what objects are present
- **Mystery tracking:** clues, suspects, contradictions, unanswered questions
- **Invention or project tracking:** progress, blockers, scope drift, next steps
- **Scene cleanup:** what needs follow-up, what should be remembered, what can be discarded
- **Continuity review:** inconsistencies, missing context, likely hallucination risks

Bad candidates:

- anything that must happen inside the next character reply
- vague “make the story better” prompts with no concrete output
- huge open-ended analysis prompts that produce essays every time
- prompts that duplicate normal memory behavior without a clear reason

Side Prompts are not magic. A vague Side Prompt is just organized vagueness.

## How Side Prompt Runs Work

A typical Side Prompt run looks like this:

1. STMB chooses the messages to analyze.
2. The selected Side Prompt is prepared.
3. Runtime macros are resolved, if the prompt needs them.
4. The relevant chat range is compiled.
5. The model generates the Side Prompt output.
6. STMB checks the output.
7. The result is saved, shown, or applied according to the Side Prompt setup.

The details can vary depending on the Side Prompt, but the general idea is stable: Side Prompts run a separate supporting pass over chat content.

They reuse the normal Side Prompt execution pipeline. That matters because previews, batching, lorebook overrides, blank-response checks, saves, stop handling, and notifications should all behave consistently instead of every command inventing its own special path.

## Manual Side Prompt Runs

Use `/sideprompt` when you want to run one Side Prompt manually.

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

Use quotes around names with spaces.

Manual Side Prompt runs are useful when you want a one-off update or when you want to target a specific range of messages.

## After-Memory Side Prompts

Some Side Prompts can be set to run automatically after memory.

This is useful for trackers that should stay current as the chat develops. For example, a plot tracker or relationship tracker may be useful after each memory update.

The old behavior is simple:

- If a Side Prompt has **Run automatically after memory** enabled, it can run after memory.
- If it is not enabled, it does not run automatically.

This works well when you only have one or two automatic Side Prompts.

It gets clumsy when every chat needs a different bundle of trackers. That is where Side Prompt Sets matter.

## Side Prompt Sets

Side Prompt Sets let you group multiple Side Prompts together and run them as one ordered workflow.

A Side Prompt Set is not just a folder. It is an ordered run list.

That distinction matters because the same Side Prompt can appear more than once in the same set.

For example, one set could run:

1. Relationship tracker for `{{npc name}} = Alice`
2. Relationship tracker for `{{npc name}} = Bob`
3. Plot points tracker
4. Scene cleanup notes

That lets one prompt template maintain separate tracker entries for different people, factions, locations, or projects without needing duplicate prompt definitions.

### After-Memory Side Prompt Mode

Each chat can choose its after-memory Side Prompt mode.

The options are:

- **Use individually-enabled side prompts**
- a named Side Prompt Set

If a chat uses **Use individually-enabled side prompts**, it keeps the old behavior. Side Prompts with **Run automatically after memory** enabled can run after memory.

If a chat uses a named Side Prompt Set, that set runs after memory instead.

A selected set replaces individually-enabled after-memory Side Prompts. It does not add to them.

That part matters. Additive behavior sounds flexible until nobody can tell why something ran twice.

### Managing Side Prompt Sets

Side Prompt Sets are managed in the **Trackers & Side Prompts** popup.

A set can be created, edited, duplicated, or deleted.

Each set contains ordered rows. Each row can have:

- a Side Prompt selector
- an optional row label
- macro values for that selected prompt
- duplicate-row controls
- delete-row controls
- move up/down controls

Rows run from top to bottom.

If order matters, put foundational trackers first and cleanup/reporting prompts later.

### Missing Sets and Missing Rows

Side Prompt Sets are deliberately strict.

- If no set is selected, the old individually-enabled after-memory behavior is used.
- If a set is selected, individually-enabled after-memory Side Prompts are ignored for that chat.
- If the selected set is missing or deleted, nothing runs and STMB warns you.
- If one prompt inside the set is missing or deleted, that row is skipped and STMB warns you.
- If an automatic after-memory run needs a macro value that cannot be resolved, that item is skipped and STMB warns you.

Silent fallback would be worse. If the selected set disappeared, quietly running some other after-memory behavior would make debugging miserable.

### Running a Set Manually

Use `/sideprompt-set` to run a named set manually using its stored macro values.

```txt
/sideprompt-set "Set Name"
```

With a range:

```txt
/sideprompt-set "Set Name" 10-20
```

If the set still needs macro values that are not stored, STMB should show an error telling you to use `/sideprompt-macroset`.

### Running a Set With Macros

Use `/sideprompt-macroset` when the set has unresolved set-level runtime tokens.

```txt
/sideprompt-macroset "Set Name" {{macro}}="value"
```

Example:

```txt
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice" {{npc_2}}="Bob" 10-20
```

One supplied macro value can feed multiple rows in the set.

That is the point of set-level runtime tokens: define the cast once and let several Side Prompts use those values.

## Macros

Side Prompts can use normal SillyTavern-style macros, but runtime macros are the special part to understand here.

A runtime macro is a placeholder that must be filled in before the Side Prompt can run.

Example:

```txt
{{npc name}}
```

A relationship tracker might use that macro so the same prompt can track different NPCs.

Manual run:

```txt
/sideprompt "Relationship Tracker" {{npc name}}="Alice"
```

Set item value:

```txt
{{npc name}} = Alice
```

Reusable set-level token:

```txt
{{npc name}} = {{npc_1}}
```

Then the set can be run with:

```txt
/sideprompt-macroset "Relationship Pass" {{npc_1}}="Alice"
```

### Literal Macro Values

Literal values are best when the set is meant for a specific chat.

Example:

```txt
{{npc name}} = Alice
```

Use this when Alice is always Alice in that set.

### Set-Level Runtime Tokens

Set-level runtime tokens are best when the set should be reusable.

Example:

```txt
{{npc name}} = {{npc_1}}
```

That lets the same set run for Alice today and Mira tomorrow.

### Macro Naming

Use boring macro names.

Good:

```txt
{{npc name}}
{{npc_1}}
{{faction}}
{{project_name}}
```

Less good:

```txt
{{the guy we mean}}
{{stuff}}
{{important person}}
```

Spaces can be readable in the UI, but underscores are usually less annoying in slash commands.

## Ranges

Side Prompts can run against a message range.

Example:

```txt
/sideprompt "Plot Points" 10-20
```

If you provide a range, that range is used.

If you do not provide a range, Side Prompt behavior mirrors the existing `/sideprompt` behavior: it uses the normal since-last range logic with the existing cap/checkpoint behavior.

For long chats, explicit ranges are useful when you know exactly what part of the chat needs analysis.

For routine tracking, since-last behavior is usually less work.

### Hidden Messages and Range Compiling

Side Prompt range compiling should follow the same hidden-message preference used by memory.

That means manual set runs such as:

```txt
/sideprompt-set "Name" 10-20
```

should respect the global unhide-before-memory preference instead of quietly using a different message-collection path.

This is one of those details users do not want to think about. Which is exactly why it should be consistent.

## Previews, Batching, Saves, and Stops

Side Prompt runs should share the same execution behavior wherever possible.

That includes:

- previews
- batching
- lorebook overrides
- blank-response checks
- saves
- stop handling
- notifications

The practical user-facing point is simple: manual Side Prompts, after-memory Side Prompts, and Side Prompt Set rows should feel like the same system.

If one path previews correctly and another path silently does something else, that is not flexibility. That is a bug farm.

## Writing Good Side Prompts

A good Side Prompt has a job.

A bad Side Prompt has vibes.

Be specific about:

- what it should review
- what it should update
- what it should ignore
- what format it should output
- how long the output should be
- whether it should replace, revise, or append

### Keep Output Short on Purpose

Side Prompts are prone to bloat.

Do not merely say:

```txt
Update the relationship tracker.
```

Better:

```txt
Update the relationship tracker. Preserve existing useful facts, remove resolved or obsolete details, and keep each entry to 1-3 concise bullets. Output only the updated tracker.
```

If the prompt is for a long-running tracker, explicitly tell it not to grow forever.

Useful wording:

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

Stable headings make repeated updates easier.

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

A model can update a stable document more cleanly than a rambling one.

### Avoid Asking for Everything

A Side Prompt that asks for every possible detail will usually produce every possible detail.

That is not a success state.

Choose the level of detail you actually want to keep.

For example, a plot tracker probably does not need every facial expression from the scene. It needs the unresolved hook, what changed, who knows, and what probably needs follow-up.

### Make Macro Use Obvious

If a Side Prompt requires a macro, make the macro obvious in the prompt name or description.

Good names:

```txt
Relationship Tracker - {{npc name}}
NPC Status - {{npc name}}
Faction Tracker - {{faction}}
```

Less good:

```txt
Tracker 3
Update thing
Misc relationship prompt
```

Users should not need to open the prompt body to understand why it is asking for a value.

## Examples

### Plot Points Tracker

Use this when a chat has multiple active storylines and unresolved hooks.

Example goal:

```txt
Update the plot points tracker based on the selected messages. Keep only active or recently resolved threads. Group by storyline. Output only the updated tracker.
```

Good output shape:

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

Use this when the same tracker prompt should work for multiple NPCs.

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

This avoids making separate prompt definitions for Alice, Bob, Carlos, and every other person in the cast.

### Invention or Project Tracker

Use this when a user keeps inventing, researching, building, or changing something over time.

Example instruction:

```txt
Update the project tracker. Track only meaningful changes in goal, progress, blockers, scope, dependencies, or story relevance. Keep entries concise and ordered by first introduction.
```

This is better than saving ten separate memories that all say the project exists.

### Reusable Cast Pass

Create a set using set-level runtime tokens:

```txt
{{npc_1}}
{{npc_2}}
```

Then run:

```txt
/sideprompt-macroset "Cast Pass" {{npc_1}}="Alice" {{npc_2}}="Bob"
```

Later, reuse it:

```txt
/sideprompt-macroset "Cast Pass" {{npc_1}}="Mira" {{npc_2}}="Jonas"
```

Same set, different cast.

## Troubleshooting

### My Side Prompt did not run after memory.

Check:

- Is the Side Prompt enabled for automatic after-memory runs?
- Is the chat using **Use individually-enabled side prompts**?
- Is the chat using a Side Prompt Set instead?
- Does the Side Prompt require a macro that was not supplied?
- Did memory actually run?
- Was the Side Prompt missing, deleted, or renamed?

If the chat is using a Side Prompt Set, individually-enabled after-memory checkboxes are ignored for that chat.

That is intentional.

### My Side Prompt Set did not run.

Check:

- Is the set selected for this chat?
- Does the set still exist?
- Do all rows point to existing Side Prompts?
- Do the rows have required macro values?
- Are you expecting automatic after-memory to ask you for missing macros? It cannot.

Automatic runs cannot stop and ask for values. Use stored macro values or run the set manually with `/sideprompt-macroset`.

### One row in my set was skipped.

The likely causes are:

- the referenced Side Prompt was deleted
- the referenced Side Prompt was renamed or no longer matches
- the row has unresolved required macros
- the output failed validation or came back blank

The set should warn rather than silently pretending everything worked.

### The output is too long.

The Side Prompt is probably too permissive.

Add hard instructions:

```txt
Keep the full output under 300 words.
```

```txt
Use no more than 5 active items.
```

```txt
Merge related details. Do not preserve every minor event.
```

```txt
Remove stale, resolved, or redundant details.
```

Models do not naturally know when a tracker is becoming uselessly large. Tell them.

### It ran twice.

Check whether you ran it manually and also have it set to run automatically.

With Side Prompt Sets, a selected after-memory set replaces individually-enabled after-memory Side Prompts for that chat. That should prevent one common duplicate-run problem.

If something still ran twice, look for:

- duplicate rows inside a set
- repeated copies of the same Side Prompt
- manual run plus automatic run
- multiple chats or tabs triggering work close together

### The wrong messages were analyzed.

Use an explicit range.

```txt
/sideprompt "Plot Points" 50-80
```

For routine use, since-last behavior is convenient. For debugging, explicit ranges are clearer.

### The tracker keeps stale information.

Tell the Side Prompt to remove stale information.

Bad:

```txt
Update the tracker.
```

Better:

```txt
Update the tracker. Remove obsolete speculation, resolved conflicts, and details contradicted by the selected messages.
```

Trackers do not stay clean by accident.

## What Side Prompts Do Not Mean

### They do not replace memory.

Side Prompts are support runs. Memory is still the system that stores and recalls long-term continuity.

A Side Prompt can help produce memory-friendly information, but it is not the same thing as memory itself.

### They do not automatically make bad prompts good.

A vague Side Prompt will produce vague output.

A bloated Side Prompt will produce bloat.

A contradictory Side Prompt will produce contradiction with more confidence than it deserves.

Garbage in, very organized garbage out.

### They do not mean every chat needs automation.

Some chats only need manual runs.

Automatic after-memory Side Prompts are useful when the output should stay current. They are annoying when they run constantly for information nobody needs.

### Side Prompt Sets are not additive after-memory bundles.

If a chat has a Side Prompt Set selected, the set replaces individually-enabled after-memory Side Prompts for that chat.

This is deliberate.

The selected workflow should be the selected workflow, not the selected workflow plus whatever checkboxes someone forgot about three weeks ago.

### They do not make provider failures impossible.

Side Prompts still rely on model calls.

If the upstream provider fails, times out, returns junk, or gives a blank response, the Side Prompt can still fail. The point is controlled behavior, not miracles.

## Takeaways

### For Users

Use Side Prompts when you want structured help maintaining a long chat.

If you only need a one-time analysis, run a Side Prompt manually.

If you want a tracker to stay current, use after-memory Side Prompts or a Side Prompt Set.

### For Botmakers

Build Side Prompts like maintenance tools, not like roleplay prose.

Give them stable headings, clear output rules, and strict update behavior. Use macros when one prompt should work for several NPCs, factions, locations, or projects.

### For Admins

Side Prompts make STMB behavior easier to structure, but they also add more generated work.

That means they should be predictable, inspectable, and boring in the best possible way. Sets help because they make the intended after-memory workflow explicit instead of leaving it to checkbox soup.
