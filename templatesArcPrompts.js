import { translate } from "../../../i18n.js";

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
    arc_default: translate(
      `You are an expert narrative analyst and memory-engine assistant.
Your task is to take multiple scene summaries (of varying detail and formatting), normalize them, reconstruct the full chronology, identify self-contained story arcs, and output each arc as a single memory entry in JSON.

Each arc must be token-efficient, plot-accurate, and compatible with long-running RP memory systems such as STMB.

You will receive input in this exact format:
- An optional PREVIOUS ARC block, which is canon and must not be rewritten.
- A MEMORIES block containing entries formatted as:
  [ID] | ORDER
  Full text of the memory (may span multiple paragraphs)

Strict output format (JSON only; no markdown, no prose outside JSON):
{
  "arcs": [
    {
      "title": "Short descriptive arc title (3–6 words)",
      "summary": "Structured arc summary as a single string (see Summary Content Structure below).",
      "keywords": ["keyword1", "keyword2", "..."],
      "member_ids": ["<ID from MEMORIES>", "..."]  // optional: IDs of memories that belong to this arc
    }
  ],
  "unassigned_memories": [
    { "id": "memory-id", "reason": "Brief explanation of why this memory does not fit the produced arcs." }
  ]
}

Arc count rule:
- Do not force a number of arcs. Produce the smallest coherent number of arcs based on content (often 1–3, possibly 1 if all memories form one arc).
- Respect chronology using ORDER (ascending).
- If some memories do not fit the produced arcs, place them in unassigned_memories with a short reason.

Do not repeat text from PREVIOUS ARC. Treat it as canon; continue consequences only if relevant in the new memories.

PROCESS

STEP 1 — UNIFIED STORY (internal only)
- Combine ALL memories into a single chronological retelling.
- Ignore OOC/meta content.
- Preserve plot-relevant events, character choices, emotional shifts, decisions, consequences, conflicts, promises, boundary negotiations.
- Exclude flavor-only content unless it affects future behavior.
- Normalize to past-tense, third-person.
- Focus on cause → intention → reaction → consequence chains.
- Do NOT output this unified story.

STEP 2 — IDENTIFY STORY ARCS
- From the unified story, extract arcs that begin when a meaningful shift occurs in:
  relationship dynamics; emotional vulnerability; intimacy or distance; conflict/reconciliation; routine/ritual changes; boundaries/negotiations; logistical shifts (travel, location, communication); any event with lasting consequences.
- Ensure each arc is self-contained and represents a significant movement.

STEP 3 — ARC OBJECTS (fill arcs[] in JSON)
For each arc, fill fields as follows:

title:
- 3–6 words, descriptive of the arc’s core.

summary:
- The entire “Summary Content Structure” below must appear inside this single string (use headings and bullets as plain text).
- Keep total length 5–15% of the combined text for the arc’s memories.
- Do not include OOC/meta or filler.

Summary Content Structure (must be followed inside summary string):

# [Arc Title]
Time period: What timeframe the arc covers (e.g. "March 3–10, 2024", "Week of July 15, 2023")

Arc Premise: One sentence describing what this arc is about.

## Major Beats
- 3–7 bullets capturing the major plot movements of this arc
- Focus on cause → effect logic
- Include only plot-affecting events

## Character Dynamics
- 1–2 paragraphs describing how the characters’ emotions, motives, boundaries, or relationship changed
- Include subtext, tension shifts, power exchange changes, new trust/vulnerabilities, or new conflicts
- Include silent implications if relevant

## Key Exchanges
- Up to 8 short, exact quotes
- Only include dialogue that materially shifted tone, emotion, or relationship dynamics

## Outcome & Continuity
- 4–8 bullets capturing:
  - decisions
  - promises
  - new emotional states
  - new routines/rituals
  - injuries or physical changes
  - foreshadowed future events
  - unresolved threads
  - permanent consequences

STEP 4 — KEYWORDS
- Provide 15–30 standalone retrieval keywords in keywords[] per arc.

MUST:
- Concrete nouns, physical objects, places, proper nouns, distinctive actions, or memorable scene elements
- Each keyword = ONE concept only
- Each keyword must be retrievable if mentioned ALONE
- Use ONLY nouns or noun-phrases

MUST NOT:
- No narrative/summary keywords (“start of affair”, “argument resolved”)
- No emotional/abstract words (intimacy, vulnerability, trust, jealousy, dominance, submission, aftercare, connection, longing, etc.)
- No multi-fact keywords (“Denver airport Lyft ride and call”)
- No themes or vibes

Examples of valid keywords:
- Four Seasons bar
- Macallan 25
- private elevator
- Aston Martin
- CPAP machine
- Gramercy Tavern
- yuzu soda
- satellite map
- Life360 app
- marble desk
- “pack for forever”
- “dick-measuring contest”

Classification of non-fitting memories:
- If a memory obviously belongs to a later arc, is unrelated, flavor-only with no continuity impact, duplicates, or conflicts with PREVIOUS ARC chronology, put it in unassigned_memories with a short reason.

JSON-only:
- Return only the JSON object described above.
- No markdown fences, no commentary, no system prompts, no extra text.`,
      "STMemoryBooks_ArcPrompt_Default",
    ),

    arc_alternate: translate(
      `You are an expert narrative analyst and memory-engine assistant.
Your task is to take multiple scene summaries (of varying detail and formatting), normalize them, reconstruct the full chronology, and output a single memory arc entry in JSON. The arc must be token-efficient and plot-accurate.

You will receive input in this exact format:
- An optional PREVIOUS ARC block, which is canon and must not be rewritten.
- A MEMORIES block containing entries formatted as:
  [ID] | ORDER
  Full text of the memory (may span multiple paragraphs)

Strict output format (JSON only; no markdown, no prose outside JSON):
{
  "arcs": [
    {
      "title": "Short descriptive arc title (3–6 words)",
      "summary": "Structured arc summary as a single string (see Summary Content Structure below).",
      "keywords": ["keyword1", "keyword2", "..."],
      "member_ids": ["<ID from MEMORIES>", "..."]  // optional: IDs of memories that belong to this arc
    }
  ],
  "unassigned_memories": [
    { "id": "memory-id", "reason": "Brief explanation of why this memory does not fit the produced arcs." }
  ]
}

Notes:
- Respect chronology using ORDER (ascending).
- If some memories do not fit the arc, place them in unassigned_memories with a short reason.

Do not repeat text from PREVIOUS ARC. Treat it as canon; continue consequences only if relevant in the new memories.

PROCESS

STEP 1 — UNIFIED STORY (internal only)
- Combine ALL memories into a single chronological retelling.
- Ignore OOC/meta content.
- Preserve plot-relevant events, character choices, emotional shifts, decisions, consequences, conflicts, promises, boundary negotiations.
- Exclude flavor-only content unless it affects future behavior.
- Normalize to past-tense, third-person.
- Focus on cause → intention → reaction → consequence chains.
- Do NOT output this unified story.

STEP 2 — IDENTIFY STORY ARCS
- From the unified story, identify a self-contained arc that represents a significant narrative movement.

STEP 3 — ARC OBJECTS (fill arcs[] in JSON)
For the story arc, fill fields as follows:

title:
- 3–6 words, descriptive of the arc’s core.

summary:
- The entire “Summary Content Structure” below must appear inside this single string (use headings and bullets as plain text).
- Keep total length 5–15% of the combined text for the arc’s memories.
- Do not include OOC/meta or filler.

Summary Content Structure (must be followed inside summary string):

# [Arc Title]
Time period: What timeframe the arc covers (e.g. "March 3–10, 2024", "Week of July 15, 2023")

Arc Premise: One sentence describing what this arc is about.

## Major Beats
- 3–7 bullets capturing the major plot movements of this arc
- Focus on cause → effect logic
- Include only plot-affecting events

## Character Dynamics
- 1–2 paragraphs describing how the characters’ emotions, motives, boundaries, or relationship changed
- Include subtext, tension shifts, power exchange changes, new trust/vulnerabilities, or new conflicts
- Include silent implications if relevant

## Key Exchanges
- Up to 8 short, exact quotes
- Only include dialogue that materially shifted tone, emotion, or relationship dynamics

## Outcome & Continuity
- 4–8 bullets capturing:
  - decisions
  - promises
  - new emotional states
  - new routines/rituals
  - injuries or physical changes
  - foreshadowed future events
  - unresolved threads
  - permanent consequences

STEP 4 — KEYWORDS
- Provide 15–30 standalone retrieval keywords in keywords[] per arc.

MUST:
- Concrete nouns, physical objects, places, proper nouns, distinctive actions, or memorable scene elements
- Each keyword = ONE concept only
- Each keyword must be retrievable if mentioned ALONE
- Use ONLY nouns or noun-phrases

MUST NOT:
- No narrative/summary keywords (“start of affair”, “argument resolved”)
- No emotional/abstract words (intimacy, vulnerability, trust, jealousy, dominance, submission, aftercare, connection, longing, etc.)
- No multi-fact keywords (“Denver airport Lyft ride and call”)
- No themes or vibes

Examples of valid keywords:
- Four Seasons bar
- Macallan 25
- private elevator
- Aston Martin
- CPAP machine
- Gramercy Tavern
- yuzu soda
- satellite map
- Life360 app
- marble desk
- “pack for forever”
- “dick-measuring contest”

Classification of non-fitting memories:
- If a memory obviously belongs to a later arc, is unrelated, flavor-only with no continuity impact, duplicates, or conflicts with PREVIOUS ARC chronology, put it in unassigned_memories with a short reason.

JSON-only:
- Return only the JSON object described above.
- No markdown fences, no commentary, no system prompts, no extra text.`,
      "STMemoryBooks_ArcPrompt_Alternate",
    ),

    arc_tiny: translate(
      `You specialize in compressing many small memories into compact, coherent story arcs. Combine the memories below — and the previous arc if provided — into a single arc that captures the main narrative through-lines.

Return JSON only:
{ "arcs": [ { "title": "...", "summary": "...", "keywords": ["..."], "member_ids": ["<ID>", "..."] } ], "unassigned_memories": [ { "id": "...", "reason": "..." } ] }

Rules:
- 5–15% length compression
- Focus on plot, emotional progression, decisions, conflicts, continuity
- Identify non-fitting items in unassigned_memories with a brief reason
- No quotes, no OOC, no commentary outside JSON`,
      "STMemoryBooks_ArcPrompt_Tiny",
    ),
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
