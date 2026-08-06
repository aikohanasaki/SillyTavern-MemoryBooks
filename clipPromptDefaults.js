// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

export const DEFAULT_COMPACTION_PROMPT_TEMPLATE = `Please aggressively make this lorebook entry more token-efficient while retaining as much useful information as possible.

Rules:
- Preserve all important facts, preferences, relationships, names, unresolved plot points, promises, secrets, constraints, and character-specific details.
- Remove redundancy, filler, repeated phrasing, and low-value wording.
- Merge overlapping bullets where possible.
- Keep the entry readable as a lorebook entry.
- Do not add new facts.
- Do not invent explanations.
- Do not change names, pronouns, macros, or proper nouns.
- Preserve wrapper headings and end markers exactly if present.
- Return only the revised entry content.

Entry type:
{{ENTRY_KIND}}

Entry title:
{{ENTRY_TITLE}}

Entry content:
{{ENTRY_CONTENT}}`;

export const DEFAULT_TOPICAL_CLIP_PROMPT_TEMPLATE = `SYSTEM: You are a memory compiler. You do not converse. You do not ask questions.
You do not offer options. You execute the task below and return only the output. You are writing a focused memory entry (lorebook/Clip) about a SINGLE topic.

Mode: {{MODE}}
Topic: {{TOPIC}}
Keywords: {{KEYWORDS}}

Existing Clip content (if updating):
{{EXISTING_CLIP}}

Source memories:
{{SOURCE_MEMORIES}}

---

TASK:
Produce a finished memory entry containing ONLY information directly relevant to {{TOPIC}}.
Organize the output by sub-topic or attribute — NOT by chronology or narrative order.
Each piece of information should stand on its own as a discrete, retrievable fact.

OUTPUT FORMAT:
Write in tight, factual prose, bullet points, or labeled attribute blocks (your choice, whichever is denser).

CONTENT RULES:
- Include: concrete facts, names, relationships, preferences, places, constraints, promises, secrets, unresolved issues, and meaningful changes over time.
- Exclude: events, context, or details unrelated to {{TOPIC}} even if they appear in the source memories.
- Conflicts: if source memories contradict each other, note the conflict explicitly (e.g. "Claimed X in one account, Y in another") rather than silently picking one.
- No invention: do not infer or fill gaps with plausible-sounding details.

IF UPDATING AN EXISTING CLIP:
- Preserve useful existing content unless source memories clearly correct or supersede it.
- Merge in new relevant details; remove redundancy.
- Do not regress — the result should be strictly more useful than the existing Clip.

Return only the finished entry content. No JSON, no title field, no keyword field, no wrapper markers.

CRITICAL:
- Do not greet the user.
- Do not ask clarifying questions.
- Do not offer alternative directions or options.
- Do not explain what you are about to do.
- Begin your response with the first word of the memory entry itself.
- If the source memories contain insufficient information to write an entry, return only: [INSUFFICIENT DATA: <one sentence reason>]
- Any response that is not the finished entry or the insufficient-data marker is a failure.`;
