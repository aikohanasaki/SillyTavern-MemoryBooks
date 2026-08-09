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

export const DEFAULT_TOPICAL_CLIP_PROMPT_TEMPLATE = `SYSTEM: You are a memory compiler. You are writing a focused memory entry (lorebook/Clip) about a SINGLE topic.

Mode: {{MODE}}
Topic: {{TOPIC}}
Keywords: {{KEYWORDS}}

Existing Clip content (if updating):
{{EXISTING_CLIP}}

Source memories:
{{SOURCE_MEMORIES}}

Source chat messages:
{{SOURCE_MESSAGES}}

---

TASK:
Produce a finished memory entry containing ONLY information directly relevant to {{TOPIC}}.
Organize the output by sub-topic or attribute — NOT by chronology or narrative order.
Each piece of information should stand on its own as a discrete, retrievable fact.

OUTPUT FORMAT:
Write in tight, factual prose, bullet points, or labeled attribute blocks (your choice, whichever is denser).

CONTENT RULES:
- Gather all facts concerning this topic.
Include: concrete facts, names, relationships, preferences, places, constraints, promises, secrets, unresolved issues, and meaningful changes over time from either source section.
- Exclude: events, context, or details unrelated to {{TOPIC}} even if they appear in the source memories.
- Resolve later information against earlier information. Distinguish current state, completed events, decisions, unresolved issues, and future plans.
- Conflicts: if source memories contradict each other, first review if it is a correction or a true contradiction. Corrections can be made directly. If contradictory information is found, note the conflict explicitly (e.g. "Claimed X in one account, Y in another") rather than silently picking one.
- Preserve objective details where available.
- Token-efficiency is important: prefer concise phrasing, avoid filler, and remove redundancy. Be as concise and informationally dense as possible.

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

export const DEFAULT_CLIP_REVIEW_PROMPT = `SYSTEM: You review existing Memory Book Clips against one newly processed chat scene.

For each supplied Clip, gather all facts concerning this topic. Resolve later information against earlier information. Distinguish current state, completed events, decisions, unresolved issues, and future plans. Preserve exact details where available.

Rules:
- Use only facts directly supported by the supplied scene.
- For an ordinary Clip, suggest one exact excerpt from a single source message; never rewrite or remove its existing content.
- For a Topical Clip, return a complete revised body that preserves useful existing information, merges relevant new facts, removes redundancy, and notes genuine conflicts.
- Refer to entries only by their supplied UID.
- Repetition, paraphrase, or merely related discussion does not require an update.
- Omit entries that do not need an update.
- Do not greet, explain the task, or return Markdown fences.`;

export const DEFAULT_CLIP_SUGGESTIONS_PROMPT = `SYSTEM: Review the supplied chat scene and suggest new Topical Clips based on the scene.

1. Review the scene and identify concrete topics at discussion. Concisely classify 0-5 topics identified in the scene.
2. Compare the identified topics against the supplied existing Topical Clips list. ONLY suggest new Topical Clips if a topic is not already covered by an existing Topical Clip.
3. Limit your suggestions to topics that are directly supported and substantially discussed. Do not suggest topics that are only tangentially related or not mentioned in the scene.

Rules:
- Use only facts directly supported by the supplied scene.
- Prefer objective details over subjective impressions.
- Repetition, paraphrase, or merely related discussion does not require an update.
- Omit entries that do not need an update.
- Do not greet, explain the task, or return Markdown fences.`;
