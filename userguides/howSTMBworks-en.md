# How SillyTavern Memory Books (STMB) Work — Programmer‑Lite Guide

This guide explains how STMB works in clear, programmer‑lite terms for users who don’t write SillyTavern code but want to understand how prompts are built.

## What STMB Sends to the AI (Memory Generation)

When you run “Generate Memory,” STMB sends a two‑part prompt:

A) System Instructions (from a preset like “summary,” “synopsis,” etc.)
- A short instruction block that:
  - Tells the model to analyze the scene
  - Instructs it to return ONLY JSON
  - Defines the required JSON fields
- Macros like {{user}} and {{char}} are substituted with your chat’s names.
- This is NOT your preset! These prompts are standalone and can be managed from the 🧩Summary Prompt Manager. 

B) The Scene, formatted for analysis
- STMB formats your recent messages like a script:
  - Optional context block of previous memories (clearly marked DO NOT SUMMARIZE).
  - The current scene transcript, one line per message:
    Alice: …
    Bob: …

Skeleton of the prompt shape
```
— System Instructions (from your selected preset) —
Analyze the following chat scene and return a memory as JSON.

You must respond with ONLY valid JSON in this exact format:
{
  "title": "Short scene title (1-3 words)",
  "content": "…",
  "keywords": ["…","…"]
}

…(preset guidance continues; macros like {{user}} and {{char}} already substituted)…

— Scene Data —
=== PREVIOUS SCENE CONTEXT (DO NOT SUMMARIZE) ===
Context 1 - [Title]:
[Previous memory text]
Keywords: alpha, beta, …
…(zero or more previous memories)…
=== END PREVIOUS SCENE CONTEXT - SUMMARIZE ONLY THE SCENE BELOW ===

=== SCENE TRANSCRIPT ===
{{user}}: …
{{char}}: …
… (each message on its own line)
=== END SCENE ===
```

Notes
- Token safety: STMB estimates token usage and warns if you exceed a threshold.
- If you enabled outgoing regex in Settings, STMB applies your selected regex scripts to the prompt text right before sending.

## What the AI Must Return (JSON Contract)

The AI must return a single JSON object with these fields:
- title: string (short)
- content: string (the summary/memory text)
- keywords: array of strings (10–30 specific terms recommended by presets)

Strictness and compatibility
- Return ONLY the JSON object — no prose, no explanations.
- Keys should be exactly: "title", "content", "keywords".
  - STMB tolerates "summary" or "memory_content" for content, but "content" is best practice.
- keywords must be an array of strings (not a comma‑separated string).

Minimal example (valid)
```json
{
  "title": "Quiet Confession",
  "content": "Late evening, Alice admits the hack was personal. Bob challenges the ethics; they agree on boundaries and plan a careful next step.",
  "keywords": ["Alice", "Bob", "confession", "boundaries", "hack", "ethics", "evening", "next steps"]
}
```

Longer example (valid)
```json
{
  "title": "Rooftop Truce",
  "content": "Timeline: Night after the market incident. Story Beats: Alice reveals she planted the tracer. Bob is frustrated but listens; they replay the lead and identify the warehouse. Key Interactions: Alice apologizes without excuses; Bob sets conditions for continuing. Notable Details: Broken radio, warehouse label \"K‑17\", distant sirens. Outcome: They form a provisional truce and agree to scout K‑17 at dawn.",
  "keywords": ["Alice", "Bob", "truce", "warehouse K-17", "apology", "conditions", "sirens", "scouting plan", "night", "market incident"]
}
```

### If the Model Misbehaves

STMB tries to rescue slightly malformed outputs:
- Accepts JSON inside code fences and extracts the block.
- Removes comments and trailing commas before parsing.
- Detects truncated/unbalanced JSON and raises clear errors, e.g.:
  - NO_JSON_BLOCK — model responded with prose instead of JSON
  - UNBALANCED / INCOMPLETE_SENTENCE — likely truncated
  - MISSING_FIELDS_TITLE / MISSING_FIELDS_CONTENT / INVALID_KEYWORDS — schema issues

Best model behavior
- Emit a single JSON object with the required fields.
- Do not add surrounding text or Markdown fences.
- Keep “title” short; make “keywords” specific and retrieval‑friendly.
- Obey the preset (e.g., ignore [OOC] content).

### Advanced: Execution Path (Optional)

- Prompt assembly: buildPrompt(profile, scene) combines the selected preset’s instruction text with the scene transcript and optional previous‑memories block.
- Send: sendRawCompletionRequest() submits the text to your selected provider/model.
- Parse: parseAIJsonResponse() extracts and validates title/content/keywords, with light repair if needed.
- Result: STMB stores the structured memory, applies your title format, and prepares suggested lorebook keys.

## Side Prompts (How‑To)

Side Prompts are auxiliary, template‑driven generators that write structured notes back into your lorebook (e.g., trackers, reports, cast lists). They are separate from the “memory generation” path and can run automatically or on demand.

What they’re good for
- Plot/state trackers (e.g., “Plotpoints”)
- Status/relationship dashboards (e.g., “Status”)
- Cast lists / NPC who’s who (e.g., “Cast of Characters”)
- POV notes or assessments (e.g., “Assess”)

Built‑in templates (shipped by STMB)
- Plotpoints — tracks story threads and hooks
- Status — summarizes relationship/affinity information
- Cast of Characters — keeps an NPC list in order of plot importance
- Assess — notes what {{char}} has learned about {{user}}

Where to manage
- Open the Side Prompts Manager (within STMB) to view, create, import/export, enable, or configure templates.

Create or enable a Side Prompt
1) Open Side Prompts Manager.
2) Create a new template or enable a built‑in.
3) Configure:
   - Name: Display title (the saved lorebook entry will be titled “Name (STMB SidePrompt)”).
   - Prompt: Instruction text the model will follow.
   - Response Format: Optional guidance block appended to the prompt (not a schema, just directions).
   - Triggers:
     • On After Memory — run after each successful memory generation for the current scene.  
     • On Interval — run when a threshold of visible user/assistant messages since last run is met (visibleMessages).  
     • Manual command — allow running with /sideprompt.
   - Optional context: previousMemoriesCount (0–7) to include recent memories as read‑only context.
   - Model/profile: optionally override the model/profile (overrideProfileEnabled + overrideProfileIndex). Otherwise it uses the STMB default profile (which can mirror current ST UI settings if configured).
   - Lorebook injection settings:
     • constVectMode: link (vectorized, default), green (normal), blue (constant)  
     • position: insertion strategy
     • orderMode/orderValue: manual ordering when needed  
     • preventRecursion/delayUntilRecursion: boolean flags

Manual run with /sideprompt
- Syntax: /sideprompt "Name" [X‑Y]
  - Examples:
    • /sideprompt "Status"  
    • /sideprompt Cast 100‑120
- If you omit a range, STMB compiles messages since the last checkpoint (capped to a recent window).
- Manual run requires the template to allow the sideprompt command (enable “Allow manual run via /sideprompt” in the template settings). If disabled, the command will be rejected.

Automatic runs
- After Memory: All enabled templates with the onAfterMemory trigger run using the already‑compiled scene. STMB batches runs with a small concurrency limit and can show per‑template success/failure toasts.
- Interval trackers: Enabled templates with onInterval run once the number of visible (non‑system) messages since the last run meets visibleMessages. STMB stores checkpoints per template (e.g., STMB_sp_<key>_lastMsgId) and debounces runs (~10s). Scene compilation is capped to a recent window for safety.

Previews and saving
- If “show memory previews” is enabled in STMB settings, a preview popup appears. You can accept, edit, retry, or cancel. Accepted content is written to your bound lorebook under “Name (STMB SidePrompt)”.
- Side Prompts require a memory lorebook to be bound to the chat (or selected in Manual Mode). If none is bound, STMB will show a notification and skip the run.

Import/export and built‑in reset
- Export: Save your Side Prompts document as JSON.
- Import: Additively merges entries; duplicates are safely renamed (no overwrites).
- Recreate Built‑ins: Reset the built‑in templates to the current‑locale defaults (user‑created templates are untouched).

## Side Prompts vs Memory Path: Key Differences

- Purpose
  - Memory Path: Produces canonical scene memories as strict JSON (title, content, keywords) for retrieval.  
  - Side Prompts: Produces auxiliary reports/trackers as free‑form text saved into your lorebook.

- When they run
  - Memory Path: Runs only when you press Generate Memory (or via its workflow).  
  - Side Prompts: Can run After Memory, on Interval thresholds, or manually with /sideprompt.

- Prompt shape
  - Memory Path: Uses a dedicated “Summary Prompt Manager” preset with a strict JSON contract; STMB validates/repairs JSON.  
  - Side Prompts: Uses the template’s instruction text + optional prior entry + optional previous memories + compiled scene text; no JSON schema required (optional Response Format is guidance only).

- Output and storage
  - Memory Path: One JSON object: { title, content, keywords } → stored as a memory entry used for retrieval.  
  - Side Prompts: Plain text content → stored as a lorebook entry titled “Name (STMB SidePrompt)” (legacy names are recognized for updates). Keywords are not required.

- Inclusion into the chat prompt
  - Memory Path: Entries are selected via tags/keywords, priorities, scopes, and token budgets.  
  - Side Prompts: Inclusion is governed by each template’s lorebook injection settings (constant vs vectorized, position, order).

- Model/profile selection
  - Memory Path: Uses memory profiles defined in STMB’s Summary Prompt Manager.  
  - Side Prompts: Uses the STMB default profile (which may mirror current ST UI) unless a template‑level override is enabled.

- Concurrency and batching
  - Memory Path: Single run per generation.  
  - Side Prompts: After‑Memory runs are batched with limited concurrency; results can be previewed and saved in waves.

- Token/size controls
  - Memory Path: STMB estimates token usage and enforces a JSON contract.  
  - Side Prompts: Compiles a bounded scene window and optionally adds a few recent memories; no strict JSON enforcement.

## FAQ‑Style Notes

- “Will this change how I write messages?”  
  Not much. You mainly curate entries and let STMB auto‑include the right ones.

- “Can I see what was actually sent to the AI?”  
  Yes—check your Terminal to inspect what was injected.
