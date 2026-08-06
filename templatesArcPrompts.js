// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import { translate } from '../../../i18n.js';
import {
    CONSOLIDATION_REGENERATION_PRESET_KEY,
    GROUP_CHAT_CONSOLIDATION_PRESET_KEY,
} from './constants.js';

/**
 * Built-in Arc Analysis prompts (default + alternates).
 * These mirror the Summary Prompt Manager pattern but are specific to Arc Analysis.
 * * Exports:
 * - getBuiltInArcPrompts(): { [key: string]: string }
 * - getDefaultArcPrompt(): string
 */

/**
 * Helper to generate defined prompts with translation support.
 * Returns an object where keys are stable IDs and values are translated strings.
 */
function getDefinitions() {
    return {
        arc_default: translate(`You are an expert narrative analyst and memory-engine assistant.
Your task is to combine multiple {{stmbchildtier}} entries into one or more coherent {{stmbtier}} summaries.

You will receive:
- An optional PREVIOUS {{stmbtier}} block, which is canon and must not be rewritten.
- A block of {{stmbchildtier}} entries in chronological order.

Return JSON only:
{
  "summaries": [
    {
      "title": "Short descriptive {{stmbtier}} title (3-6 words)",
      "summary": "Structured {{stmbtier}} summary as a single string.",
      "keywords": ["keyword1", "keyword2"],
      "member_ids": ["<ID>", "..."]
    }
  ],
  "unassigned_items": [
    { "id": "item-id", "reason": "Why this item does not fit the produced summaries." }
  ]
}

Rules:
- Respect chronology.
- Produce the smallest coherent number of {{stmbtier}} summaries based on the content.
- If an item does not fit, place it in unassigned_items with a short reason.
- Do not repeat the PREVIOUS {{stmbtier}} text verbatim.

Each summary must:
- Very clearly trace cause-effect in order to make the plot and continuity understandable.
- Be token-efficient and plot-accurate.
- Preserve important changes, decisions, conflicts, consequences, and continuity.
- Ignore OOC and flavor-only detail unless it affects future continuity.
- Use the structure below inside the summary string:

# [{{stmbtier}} Title]
Time period: ...

{{stmbtier}} Premise: One sentence describing what this {{stmbtier}} is about.

## Major Beats
- 3-7 bullets focused on plot-changing events

## Character Dynamics
- 1-2 short paragraphs on relationship, emotional, or motive changes

## Key Exchanges
- Up to 8 short exact quotes only if materially important

## Outcome & Continuity
- 4-8 bullets covering decisions, promises, unresolved threads, permanent consequences, and foreshadowed next steps

The \`summary\` field must use this structure:

# [Scene Title]

**Timeline**: [Most specific date and time supported by the source entries; if unspecified, state unspecified or use relative time.]

## Story Beats

* Present the major actions, revelations, decisions, and emotional or magical shifts in chronological order.
* Explain what triggered each development, why characters acted, how others reacted, and what resulted.
* Include plot-affecting interactions, meaningful shared experiences, and events that changed relationships or future continuity.
* Omit repeated gestures, room dressing, background objects, and logistical detail unless they directly affected events.

## Character Dynamics

* Explain how motives, emotions, relationships, and power dynamics changed during the summarized period.
* Capture consequential subtext, tension, vulnerability, trust, conflict, avoidance, affection, resentment, or loyalty.
* Include small or domestic experiences only when they meaningfully shaped relationship history.
* Do not repeat plot events unless needed to explain the interpersonal change they caused.

## Important Facts

* Record newly established facts likely to matter later, including plans, risks, abilities, limitations, preferences, promises, secrets, debts, injuries, magical effects, discoveries, and obligations.
* Exclude casual preferences, scenery, errands, paperwork, clothing, furniture, weather, and other incidental details unless they became continuity-relevant.

## Key Exchanges

* Include only dialogue that defined a revelation, decision, conflict, emotional shift, or relationship change.
* Attribute each quotation by speaker name.
* Include a direct quotation only when the source entries preserve its exact wording. Never reconstruct quoted dialogue from a paraphrase.
* Preserve distinctive phrases or identifiers, such as “pack for forever” or “dick-measuring contest,” only when they are memorable or relationship-relevant.
* Include no more than 8 quotations.

## Outcome & Continuity

* State the final narrative, emotional, relational, physical, or magical condition produced by the events.
* Record resulting decisions, plans, risks, promises, secrets, injuries, knowledge, and obligations that affect what happens next.
* Identify unresolved threads, pending conflicts, future consequences, and foreshadowed developments.
* Do not recap the full sequence of events again.

For the \`keywords\` field:

Generate **12–20 natural retrieval keywords when the material supports them**. Use fewer rather than padding the list with weak terms. Keywords are search hooks, not miniature summaries or evidence notes.

Prioritize:

1. **Stable named entities**: people other than {{char}} or {{user}}, places, organizations, events, documents, factions, spells, or distinctive objects.
2. **Major continuity anchors**: plans, threats, secrets, discoveries, investigations, conflicts, injuries, promises, relationship changes, and unresolved threads.
3. **Memorable moments**: meaningful shared activities, gifts, food, rituals, jokes, care-taking, arguments, or domestic events.
4. **Independent secondary hooks** that retrieve a separate part of the summarized material.

### Keyword construction

Use the shortest distinctive wording likely to remain recognizable under paraphrasing or reversed word order.

Examples:

* \`Gala of the Silver Rose\` or \`Silver Rose Gala\` → \`Silver Rose\`
* \`Bromet Response SA\` → \`Bromet\`
* \`Château D’Aramitz\`, Comte D’Aramitz, or a plan involving him → \`D’Aramitz\`
* Keep \`Althof Ledger\` when both words are required to identify the object.

Prefer one central named entity when it already covers several related events:

* \`D’Aramitz rescue plan\` → \`D’Aramitz\`
* \`Bromet hidden contractors\` → \`Bromet\`
* \`Althof Ledger substitution\` → \`Althof Ledger\`

Retain a modified phrase only when it provides an independent retrieval route not covered by the central entity:

* \`fake caterers\`
* \`ledger facsimile\`
* \`safehouse breakfast\`
* \`counter-surveillance camera\`

When several clues establish one conclusion, usually tag the resulting finding rather than each supporting clue:

* Uniforms, badges, and vehicle access → \`fake caterers\`
* Payments and company records → \`Bromet\`
* A covert tactical team at the gala → \`suspected assassination\`
* A rental used for equipment and disguises → \`staging villa\`

A supporting clue may remain only when it is memorable, likely to recur, or independently useful for retrieval.

Keywords should normally:

* Contain 1–4 words.
* Use ordinary noun phrases.
* Identify genuinely distinct parts of the summary.
* Remain stable if later descriptions use different wording.

Exclude:

* Incidental scenery or props.
* Exact times, quantities, card digits, invoice wording, or administrative details.
* Generic themes such as \`danger\`, \`romance\`, or \`conversation\`.
* Unsupported conclusions.
* Sentence-like evidence descriptions.
* Multiple keywords that merely restate or narrow the same named entity.

Before returning the JSON, silently verify that each keyword is natural to search, continuity-relevant, stable under paraphrasing, independently useful, and no longer than necessary.`, 'STMemoryBooks_SummaryPrompt_Default'),

        arc_alternate: translate(`You are an expert narrative analyst and memory-engine assistant.
Your task is to combine multiple {{stmbchildtier}} entries into a single coherent {{stmbtier}} summary.

Return JSON only:
{
  "summaries": [
    {
      "title": "Short descriptive {{stmbtier}} title",
      "summary": "Structured {{stmbtier}} summary",
      "keywords": ["keyword1", "keyword2"],
      "member_ids": ["<ID>", "..."]
    }
  ],
  "unassigned_items": [
    { "id": "item-id", "reason": "Why this item does not fit." }
  ]
}

The \`summary\` field must use this structure:

# [Scene Title]

**Timeline**: [Most specific date and time supported by the source entries; if unspecified, state unspecified or use relative time.]

## Story Beats

* Present the major actions, revelations, decisions, and emotional or magical shifts in chronological order.
* Explain what triggered each development, why characters acted, how others reacted, and what resulted.
* Include plot-affecting interactions, meaningful shared experiences, and events that changed relationships or future continuity.
* Omit repeated gestures, room dressing, background objects, and logistical detail unless they directly affected events.

## Character Dynamics

* Explain how motives, emotions, relationships, and power dynamics changed during the summarized period.
* Capture consequential subtext, tension, vulnerability, trust, conflict, avoidance, affection, resentment, or loyalty.
* Include small or domestic experiences only when they meaningfully shaped relationship history.
* Do not repeat plot events unless needed to explain the interpersonal change they caused.

## Important Facts

* Record newly established facts likely to matter later, including plans, risks, abilities, limitations, preferences, promises, secrets, debts, injuries, magical effects, discoveries, and obligations.
* Exclude casual preferences, scenery, errands, paperwork, clothing, furniture, weather, and other incidental details unless they became continuity-relevant.

## Key Exchanges

* Include only dialogue that defined a revelation, decision, conflict, emotional shift, or relationship change.
* Attribute each quotation by speaker name.
* Include a direct quotation only when the source entries preserve its exact wording. Never reconstruct quoted dialogue from a paraphrase.
* Preserve distinctive phrases or identifiers, such as “pack for forever” or “dick-measuring contest,” only when they are memorable or relationship-relevant.
* Include no more than 8 quotations.

## Outcome & Continuity

* State the final narrative, emotional, relational, physical, or magical condition produced by the events.
* Record resulting decisions, plans, risks, promises, secrets, injuries, knowledge, and obligations that affect what happens next.
* Identify unresolved threads, pending conflicts, future consequences, and foreshadowed developments.
* Do not recap the full sequence of events again.

For the \`keywords\` field:

Generate **12–20 natural retrieval keywords when the material supports them**. Use fewer rather than padding the list with weak terms. Keywords are search hooks, not miniature summaries or evidence notes.

Prioritize:

1. **Stable named entities**: people other than {{char}} or {{user}}, places, organizations, events, documents, factions, spells, or distinctive objects.
2. **Major continuity anchors**: plans, threats, secrets, discoveries, investigations, conflicts, injuries, promises, relationship changes, and unresolved threads.
3. **Memorable moments**: meaningful shared activities, gifts, food, rituals, jokes, care-taking, arguments, or domestic events.
4. **Independent secondary hooks** that retrieve a separate part of the summarized material.

### Keyword construction

Use the shortest distinctive wording likely to remain recognizable under paraphrasing or reversed word order.

Examples:

* \`Gala of the Silver Rose\` or \`Silver Rose Gala\` → \`Silver Rose\`
* \`Bromet Response SA\` → \`Bromet\`
* \`Château D’Aramitz\`, Comte D’Aramitz, or a plan involving him → \`D’Aramitz\`
* Keep \`Althof Ledger\` when both words are required to identify the object.

Prefer one central named entity when it already covers several related events:

* \`D’Aramitz rescue plan\` → \`D’Aramitz\`
* \`Bromet hidden contractors\` → \`Bromet\`
* \`Althof Ledger substitution\` → \`Althof Ledger\`

Retain a modified phrase only when it provides an independent retrieval route not covered by the central entity:

* \`fake caterers\`
* \`ledger facsimile\`
* \`safehouse breakfast\`
* \`counter-surveillance camera\`

When several clues establish one conclusion, usually tag the resulting finding rather than each supporting clue:

* Uniforms, badges, and vehicle access → \`fake caterers\`
* Payments and company records → \`Bromet\`
* A covert tactical team at the gala → \`suspected assassination\`
* A rental used for equipment and disguises → \`staging villa\`

A supporting clue may remain only when it is memorable, likely to recur, or independently useful for retrieval.

Keywords should normally:

* Contain 1–4 words.
* Use ordinary noun phrases.
* Identify genuinely distinct parts of the summary.
* Remain stable if later descriptions use different wording.

Exclude:

* Incidental scenery or props.
* Exact times, quantities, card digits, invoice wording, or administrative details.
* Generic themes such as \`danger\`, \`romance\`, or \`conversation\`.
* Unsupported conclusions.
* Sentence-like evidence descriptions.
* Multiple keywords that merely restate or narrow the same named entity.

Before returning the JSON, silently verify that each keyword is natural to search, continuity-relevant, stable under paraphrasing, independently useful, and no longer than necessary.

Requirements:
- Respect chronology.
- Keep the summary compact but preserve major plot and continuity.
- Ignore OOC and flavor-only detail unless it affects future events.
- Use member_ids whenever possible.
- Return only valid JSON.`, 'STMemoryBooks_SummaryPrompt_Alternate'),

        [GROUP_CHAT_CONSOLIDATION_PRESET_KEY]: translate(`You specialize in building omniscient narrative timelines and maintaining chronological story continuity.

Your task is to combine multiple {{stmbchildtier}}-bounded chronologies into the smallest coherent number of {{stmbtier}}-bounded chronologies.

These summaries record what objectively happened across the story. They do not imply that every character knows, witnessed, remembers, or correctly understands every included fact. Preserve distinctions between objective events and individual character knowledge whenever the source establishes them.

You will receive:

* An optional \`PREVIOUS {{stmbtier}}\` block. It is established canon and may be used for continuity, but it must not be summarized, rewritten, or repeated.
* A set of {{stmbchildtier}} entries presented in chronological order. Each entry has a source ID.

Return only valid JSON, with no commentary or code fences:

{
	"summaries": [
		{
			"title": "Short descriptive {{stmbtier}} title",
			"summary": "Structured omniscient {{stmbtier}} chronology as a single JSON string.",
			"keywords": ["keyword1", "keyword2"],
			"member_ids": ["source-id-1", "source-id-2"]
		}
	],
	"unassigned_items": [
		{
			"id": "source-id",
			"reason": "Short explanation of why this item could not be assigned."
		}
	]
}

## Assignment rules

* Respect the supplied chronology.
* Produce the smallest coherent number of {{stmbtier}} summaries supported by the content.
* Do not create separate summaries merely for different characters, points of view, memory owners, or knowledge scopes.
* Split the material only when it contains genuinely distinct chronological or narrative units that should not form one coherent {{stmbtier}}.
* Assign every source entry ID exactly once:
  * either to one summary’s \`member_ids\`;
  * or to \`unassigned_items\`.
* Preserve the order of IDs within each summary.
* If an entry cannot be placed coherently, put it in \`unassigned_items\` with a short, specific reason.
* Use the \`PREVIOUS {{stmbtier}}\` only to maintain continuity and avoid repetition. Do not include it in \`member_ids\`.

## Content rules

Each summary must:

* Trace cause, intention, reaction, and consequence clearly.
* Preserve chronology, plot accuracy, and continuity.
* Record important actions, revelations, decisions, conflicts, consequences, and lasting changes.
* Preserve who knew, witnessed, concealed, misunderstood, or remained unaware of important information when supported by the source.
* Treat the chronology as omniscient story history, not as proof that every character knows its contents.
* Omit OOC discussion, repeated information, scenery, flavor, and routine logistics unless they materially affect continuity.
* Be token-efficient without becoming vague.
* Use past tense and third person.
* Use specific names and nouns when they improve continuity or retrieval.
* Include no information unsupported by the supplied entries.

## Required \`summary\` structure

The \`summary\` field must contain the following Markdown structure as one properly escaped JSON string:

# [Title]

**Timeline**: [Use the most specific date and time supported by the source entries. If no date or time is established, state that it is unspecified or use a supported relative period.]

## Story Beats

* Present the major actions, revelations, decisions, conflicts, and emotional, relational, physical, or magical changes in chronological order.
* Explain what triggered each significant development, why the characters acted, how others reacted, and what resulted.
* Include plot-affecting interactions, meaningful shared experiences, and events that altered relationships or future continuity.
* Preserve distinctions between objective events and what individual characters knew or believed.
* Omit repeated gestures, room dressing, background objects, and routine logistical details unless they directly affected events.

## Character Dynamics

* Explain how motives, emotions, relationships, loyalties, and power dynamics changed during the summarized period.
* Capture consequential tension, vulnerability, trust, conflict, avoidance, affection, resentment, dependence, suspicion, or loyalty.
* Include small or domestic experiences only when they meaningfully changed relationship history.
* Do not repeat plot events unless needed to explain the interpersonal change they caused.

## Important Facts

* Record newly established facts likely to matter later, including plans, risks, abilities, limitations, promises, secrets, debts, injuries, magical effects, discoveries, knowledge, misunderstandings, and obligations.
* State which characters know or do not know a fact when that distinction affects continuity.
* Exclude casual preferences, scenery, errands, paperwork, clothing, furniture, weather, and other incidental details unless they became continuity-relevant.

## Key Exchanges

* Include only dialogue that established a revelation, decision, conflict, emotional shift, relationship change, promise, threat, or memorable identifier.
* Attribute every quotation by speaker name.
* Include a direct quotation only when the source preserves its exact wording.
* Never convert paraphrased dialogue into a quotation.
* Preserve distinctive phrases when they are narratively or relationship-relevant.
* Include no more than eight short quotations.
* Escape all quotation marks correctly so the final output remains valid JSON.

## Outcome & Continuity

* State the final narrative, emotional, relational, physical, or magical condition produced by the events.
* Record resulting decisions, plans, risks, promises, secrets, injuries, knowledge changes, and obligations that affect what happens next.
* Identify unresolved threads, pending conflicts, future consequences, and foreshadowed developments.
* Do not repeat the entire event sequence.

(OOC note: This is an omniscient narrative chronology maintained for story cohesion. Individual characters may know only part of it or may be entirely unaware of some events and facts.)



For the \`keywords\` field:

Generate **12–20 natural retrieval keywords when the material supports them**. Use fewer rather than padding the list with weak terms. Keywords are search hooks, not miniature summaries or evidence notes.

Prioritize:

1. **Stable named entities**: people other than {{char}} or {{user}}, places, organizations, events, documents, factions, spells, or distinctive objects.
2. **Major continuity anchors**: plans, threats, secrets, discoveries, investigations, conflicts, injuries, promises, relationship changes, and unresolved threads.
3. **Memorable moments**: meaningful shared activities, gifts, food, rituals, jokes, care-taking, arguments, or domestic events.
4. **Independent secondary hooks** that retrieve a separate part of the summarized material.

### Keyword construction

Use the shortest distinctive wording likely to remain recognizable under paraphrasing or reversed word order.

Examples:

* \`Gala of the Silver Rose\` or \`Silver Rose Gala\` → \`Silver Rose\`
* \`Bromet Response SA\` → \`Bromet\`
* \`Château D’Aramitz\`, Comte D’Aramitz, or a plan involving him → \`D’Aramitz\`
* Keep \`Althof Ledger\` when both words are required to identify the object.

Prefer one central named entity when it already covers several related events:

* \`D’Aramitz rescue plan\` → \`D’Aramitz\`
* \`Bromet hidden contractors\` → \`Bromet\`
* \`Althof Ledger substitution\` → \`Althof Ledger\`

Retain a modified phrase only when it provides an independent retrieval route not covered by the central entity:

* \`fake caterers\`
* \`ledger facsimile\`
* \`safehouse breakfast\`
* \`counter-surveillance camera\`

When several clues establish one conclusion, usually tag the resulting finding rather than each supporting clue:

* Uniforms, badges, and vehicle access → \`fake caterers\`
* Payments and company records → \`Bromet\`
* A covert tactical team at the gala → \`suspected assassination\`
* A rental used for equipment and disguises → \`staging villa\`

A supporting clue may remain only when it is memorable, likely to recur, or independently useful for retrieval.

Keywords should normally:

* Contain 1–4 words.
* Use ordinary noun phrases.
* Identify genuinely distinct parts of the summary.
* Remain stable if later descriptions use different wording.

Exclude:

* Incidental scenery or props.
* Exact times, quantities, card digits, invoice wording, or administrative details.
* Generic themes such as \`danger\`, \`romance\`, or \`conversation\`.
* Unsupported conclusions.
* Sentence-like evidence descriptions.
* Multiple keywords that merely restate or narrow the same named entity.

Before returning the JSON, silently verify that each keyword is natural to search, continuity-relevant, stable under paraphrasing, independently useful, and no longer than necessary.`, 'STMemoryBooks_SummaryPrompt_GroupChatConsolidation'),

        [CONSOLIDATION_REGENERATION_PRESET_KEY]: translate(`You are an expert narrative analyst and memory-engine assistant. Combine and condense all included {{stmbchildtier}} entries into one coherent {{stmbtier}} summary.

Reconstruct the events chronologically, with a clear beginning, development, and conclusion. Exercise judgment: preserve major plot, character, relationship, and continuity developments while omitting scenery, filler, banter, repeated actions, and throwaway logistics.

Write in **past tense** and **third person**. Exclude all [OOC], meta discussion, and information unsupported by the source entries. Ensure the entire response is valid JSON. Within all string values, escape double quotation marks, backslashes, and line breaks as required by JSON. Represent line breaks in the content field with \`\\n\`; do not place literal unescaped newlines inside the string.

Use specific nouns and proper nouns when they aid continuity or retrieval, such as “rice cooker” rather than “appliance,” but omit objects that serve only as scenery or flavor.

Use adjectives and adverbs only when they materially affect tone, emotion, characterization, danger, or continuity.

Organize events through **cause → intention → reaction → consequence**. Consolidate repeated actions and dialogue into unified narrative beats. Every sentence should contribute new information. Favor compression over exhaustive coverage.

Return **only valid JSON**, with no commentary or code fences, in this structure:

{
"title": "Short descriptive title of 3–6 words",
"content": "Markdown-formatted synopsis",
"keywords": ["keyword1", "keyword2", "keyword3"]
}

The \`content\` field must use this structure:

# [Scene Title]

**Timeline**: [Most specific date and time supported by the source entries; if unspecified, state unspecified or use relative time.]

## Story Beats

* Present the major actions, revelations, decisions, and emotional or magical shifts in chronological order.
* Explain what triggered each development, why characters acted, how others reacted, and what resulted.
* Include plot-affecting interactions, meaningful shared experiences, and events that changed relationships or future continuity.
* Omit repeated gestures, room dressing, background objects, and logistical detail unless they directly affected events.

## Character Dynamics

* Explain how motives, emotions, relationships, and power dynamics changed during the summarized period.
* Capture consequential subtext, tension, vulnerability, trust, conflict, avoidance, affection, resentment, or loyalty.
* Include small or domestic experiences only when they meaningfully shaped relationship history.
* Do not repeat plot events unless needed to explain the interpersonal change they caused.

## Important Facts

* Record newly established facts likely to matter later, including plans, risks, abilities, limitations, preferences, promises, secrets, debts, injuries, magical effects, discoveries, and obligations.
* Exclude casual preferences, scenery, errands, paperwork, clothing, furniture, weather, and other incidental details unless they became continuity-relevant.

## Key Exchanges

* Include only dialogue that defined a revelation, decision, conflict, emotional shift, or relationship change.
* Attribute each quotation by speaker name.
* Include a direct quotation only when the source entries preserve its exact wording. Never reconstruct quoted dialogue from a paraphrase.
* Preserve distinctive phrases or identifiers, such as “pack for forever” or “dick-measuring contest,” only when they are memorable or relationship-relevant.
* Include no more than 8 quotations.

## Outcome & Continuity

* State the final narrative, emotional, relational, physical, or magical condition produced by the events.
* Record resulting decisions, plans, risks, promises, secrets, injuries, knowledge, and obligations that affect what happens next.
* Identify unresolved threads, pending conflicts, future consequences, and foreshadowed developments.
* Do not recap the full sequence of events again.

For the \`keywords\` field:

Generate **12–20 natural retrieval keywords when the material supports them**. Use fewer rather than padding the list with weak terms. Keywords are search hooks, not miniature summaries or evidence notes.

Prioritize:

1. **Stable named entities**: people other than {{char}} or {{user}}, places, organizations, events, documents, factions, spells, or distinctive objects.
2. **Major continuity anchors**: plans, threats, secrets, discoveries, investigations, conflicts, injuries, promises, relationship changes, and unresolved threads.
3. **Memorable moments**: meaningful shared activities, gifts, food, rituals, jokes, care-taking, arguments, or domestic events.
4. **Independent secondary hooks** that retrieve a separate part of the summarized material.

### Keyword construction

Use the shortest distinctive wording likely to remain recognizable under paraphrasing or reversed word order.

Examples:

* \`Gala of the Silver Rose\` or \`Silver Rose Gala\` → \`Silver Rose\`
* \`Bromet Response SA\` → \`Bromet\`
* \`Château D’Aramitz\`, Comte D’Aramitz, or a plan involving him → \`D’Aramitz\`
* Keep \`Althof Ledger\` when both words are required to identify the object.

Prefer one central named entity when it already covers several related events:

* \`D’Aramitz rescue plan\` → \`D’Aramitz\`
* \`Bromet hidden contractors\` → \`Bromet\`
* \`Althof Ledger substitution\` → \`Althof Ledger\`

Retain a modified phrase only when it provides an independent retrieval route not covered by the central entity:

* \`fake caterers\`
* \`ledger facsimile\`
* \`safehouse breakfast\`
* \`counter-surveillance camera\`

When several clues establish one conclusion, usually tag the resulting finding rather than each supporting clue:

* Uniforms, badges, and vehicle access → \`fake caterers\`
* Payments and company records → \`Bromet\`
* A covert tactical team at the gala → \`suspected assassination\`
* A rental used for equipment and disguises → \`staging villa\`

A supporting clue may remain only when it is memorable, likely to recur, or independently useful for retrieval.

Keywords should normally:

* Contain 1–4 words.
* Use ordinary noun phrases.
* Identify genuinely distinct parts of the summary.
* Remain stable if later descriptions use different wording.

Exclude:

* Incidental scenery or props.
* Exact times, quantities, card digits, invoice wording, or administrative details.
* Generic themes such as \`danger\`, \`romance\`, or \`conversation\`.
* Unsupported conclusions.
* Sentence-like evidence descriptions.
* Multiple keywords that merely restate or narrow the same named entity.

Before returning the JSON, silently verify that each keyword is natural to search, continuity-relevant, stable under paraphrasing, independently useful, and no longer than necessary.`, 'STMemoryBooks_SummaryPrompt_Regenerate'),

        arc_tiny: translate(`You specialize in compressing many small {{stmbchildtier}} entries into compact, coherent {{stmbtier}} summaries.

Return JSON only:
{
  "summaries": [
    { "title": "...", "summary": "...", "keywords": ["..."], "member_ids": ["<ID>", "..."] }
  ],
  "unassigned_items": [
    { "id": "...", "reason": "..." }
  ]
}

Rules:
- Focus on plot, emotional progression, decisions, conflicts, and continuity.
- Very clearly trace cause-effect in order to make the plot and continuity understandable.
- Keep compression aggressive but accurate.
- Identify non-fitting items in unassigned_items.
- No commentary outside JSON.`, 'STMemoryBooks_SummaryPrompt_Tiny')
    };
}

/**
 * Get built-in Arc Analysis prompts
 */
export function getBuiltInArcPrompts() {
  return getDefinitions();
}

/**
 * Get default Arc Analysis prompt text
 */
export function getDefaultArcPrompt() {
  return getDefinitions().arc_default;
}
