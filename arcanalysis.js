import {
  estimateTokens,
  getCurrentApiInfo,
  getUIModelSettings,
  normalizeCompletionSource,
  createStmbInFlightTask,
  isStmbStopError,
  getStmbStopEpoch,
  throwIfStmbStopped,
} from "./utils.js";
import { sendRawCompletionRequest } from "./stmemory.js";
import { getDefaultArcPrompt } from "./templatesArcPrompts.js";
import * as ArcPrompts from "./arcAnalysisPromptManager.js";
import { upsertLorebookEntriesBatch } from "./addlore.js";
import { extension_settings } from "../../../extensions.js";
import { translate } from '../../../i18n.js';
import {
  getDefaultSummaryTitleFormat,
  getSourceTierForTarget,
  getSummaryTierLabel,
  getSummaryTypeKey,
  isSummaryEntry,
} from "./summaryTiers.js";

/**
 * Arc Analysis pipeline (stateless wrt model; stateful in controller).
 * Exports:
 *  - buildBriefsFromEntries(entries)
 *  - buildArcAnalysisPrompt({ briefs, previousArcSummary, promptText })
 *  - parseArcJsonResponse(text)
 *  - runArcAnalysisSequential(selectedEntries, options, profileOrConnection)
 *  - commitArcs({ lorebookName, lorebookData, arcCandidates, disableOriginals })
 */

const MODULE_NAME = "STMemoryBooks-ArcAnalysis";

const KEYWORD_PROMPT = `Based on this {{stmbtier}} summary, generate 15–30 standalone topical keywords that function as retrieval tags, not micro-summaries.
Keywords must be:
- Concrete and scene-specific (locations, objects, proper nouns, unique actions, repeated motifs).
- One concept per keyword — do NOT combine multiple ideas into one keyword.
- Useful for retrieval if the user later mentions that noun or action alone, not only in a specific context.
- Not {{char}}'s or {{user}}'s names.
- Not thematic, emotional, or abstract. Stop-list: intimacy, vulnerability, trust, dominance, submission, power dynamics, boundaries, jealousy, aftercare, longing, consent, emotional connection.

Avoid:
- Overly specific compound keywords (“David Tokyo marriage”).
- Narrative or plot-summary style keywords (“art dealer date fail”).
- Keywords that contain multiple facts or descriptors.
- Keywords that only make sense when the whole scene is remembered.

Prefer:
- Proper nouns (e.g., "Chinatown", "Ritz-Carlton bar").
- Specific physical objects ("CPAP machine", "chocolate chip cookies").
- Distinctive actions ("cookie baking", "piano apology").
- Unique phrases or identifiers from the scene used by characters ("pack for forever", "dick-measuring contest").

Your goal: keywords should fire when the noun/action is mentioned alone, not only when paired with a specific person or backstory.

Return ONLY a JSON array of 15-30 strings. No commentary, no explanations.`;

// Utility: normalize text
function normalizeText(s) {
  return String(s || "")
    .replace(/\r\n/g, "\n")
    .replace(/^\uFEFF/, "")
    .replace(/[\u200B-\u200D\u2060]/g, "");
}

function extractFencedBlocks(s) {
  const re = /```([\w+-]*)\s*([\s\S]*?)```/g;
  const out = [];
  let m;
  while ((m = re.exec(s)) !== null) {
    out.push((m[2] || "").trim());
  }
  return out;
}

function unwrapJsConcatenatedStringDump(raw) {
  let s = String(raw || "").trim();

  // Quick detection: looks like "'...\n' +\n '...'"
  if (!/'\s*\+\s*'/.test(s) && !/\\n'\s*\+/.test(s)) return null;

  // Drop "content:" prefix if present
  s = s.replace(/^\s*content\s*:\s*/, "");

  // Collect all single-quoted chunks: '...'
  const re = /'((?:\\.|[^'\\])*)'/g;
  const chunks = [];
  let m;
  while ((m = re.exec(s)) !== null) chunks.push(m[1]);

  if (!chunks.length) return null;

  // Re-join and unescape common sequences
  let joined = chunks.join("");
  joined = joined
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, "\\");

  return joined.trim() || null;
}

function extractBalancedJson(s) {
  const start = s.search(/[\{\[]/);
  if (start === -1) return null;
  const open = s[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0,
    inStr = false,
    esc = false;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (esc) {
        esc = false;
      } else if (ch === "\\") {
        esc = true;
      } else if (ch === '"') {
        inStr = false;
      }
      continue;
    }
    if (ch === '"') {
      inStr = true;
      continue;
    }
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return s.slice(start, i + 1).trim();
    }
  }
  return null;
}

function stripJsonComments(s) {
  let out = "";
  let inStr = false,
    esc = false,
    inLine = false,
    inBlock = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i],
      next = s[i + 1];
    if (inStr) {
      out += ch;
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (inLine) {
      if (ch === "\n") {
        inLine = false;
        out += ch;
      }
      continue;
    }
    if (inBlock) {
      if (ch === "*" && next === "/") {
        inBlock = false;
        i++;
      }
      continue;
    }
    if (ch === '"') {
      inStr = true;
      out += ch;
      continue;
    }
    if (ch === "/" && next === "/") {
      inLine = true;
      i++;
      continue;
    }
    if (ch === "/" && next === "*") {
      inBlock = true;
      i++;
      continue;
    }
    out += ch;
  }
  return out;
}

function stripTrailingCommas(s) {
  let out = "";
  let inStr = false,
    esc = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      out += ch;
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') {
      inStr = true;
      out += ch;
      continue;
    }
    if (ch === ",") {
      let j = i + 1;
      while (j < s.length && /\s/.test(s[j])) j++;
      if (s[j] === "}" || s[j] === "]") {
        // skip trailing comma
        continue;
      }
    }
    out += ch;
  }
  return out;
}

export function resolveSummaryPromptPlaceholders(
  promptText,
  { targetTier = 1, childTier = null, parentTier = null } = {},
) {
  const resolvedChildTier =
    childTier === null || childTier === undefined
      ? getSourceTierForTarget(targetTier)
      : childTier;
  const resolvedParentTier =
    parentTier === null || parentTier === undefined ? targetTier + 1 : parentTier;
  return String(promptText || "")
    .replace(/\{\{\s*stmbtier\s*\}\}/gi, getSummaryTierLabel(targetTier))
    .replace(
      /\{\{\s*stmbchildtier\s*\}\}/gi,
      getSummaryTierLabel(resolvedChildTier),
    )
    .replace(
      /\{\{\s*stmbparenttier\s*\}\}/gi,
      getSummaryTierLabel(resolvedParentTier),
    );
}

/**
 * Keyword generation helpers
 */
function sanitizeKeywordArray(items) {
  const out = [];
  const seen = new Set();
  for (const it of items || []) {
    let k = String(it || "").trim();
    k = k.replace(/^["']|["']$/g, "");
    k = k.replace(/^\d+\.\s*/, "");
    k = k.replace(/^[\-\*\u2022]\s*/, "");
    k = k.trim();
    if (!k) continue;
    const key = k.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(k);
    if (out.length >= 30) break;
  }
  return out;
}

function parseKeywordsResponse(text) {
  const normalized = normalizeText(String(text || "").trim());
  const candidates = [];
  const fenced = extractFencedBlocks(normalized);
  if (fenced.length) candidates.push(...fenced);
  const balanced = extractBalancedJson(normalized);
  if (balanced) candidates.push(balanced);
  candidates.push(normalized);

  const uniq = Array.from(new Set(candidates));
  for (const cand of uniq) {
    try {
      const s = stripTrailingCommas(stripJsonComments(cand));
      const parsed = JSON.parse(s);
      const arr = Array.isArray(parsed)
        ? parsed
        : parsed && Array.isArray(parsed.keywords)
          ? parsed.keywords
          : null;
      if (arr) return sanitizeKeywordArray(arr);
    } catch {
      // try next candidate
    }
  }

  // Fallback parsing: bullets or comma-separated
  const lines = normalized
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);
  let items = [];
  if (lines.length > 1) {
    items = lines.map((x) =>
      x.replace(/^[\-\*\u2022]?\s*\d*\.?\s*/, "").trim(),
    );
  } else {
    items = normalized.split(/[,;]+/).map((x) => x.trim());
  }
  return sanitizeKeywordArray(items);
}

export async function generateKeywordsForSummary(summary, conn, options = {}) {
  const runEpoch = options?.runEpoch ?? null;
  const signal = options?.signal ?? null;
  const extra = options?.extra ?? {};
  const targetTier = Number.isFinite(Number(options?.targetTier))
    ? Math.trunc(Number(options.targetTier))
    : 1;
  const base = String(summary || "").trim();
  const keywordPrompt = resolveSummaryPromptPlaceholders(KEYWORD_PROMPT, {
    targetTier,
  });
  const prompt = `${keywordPrompt}\n\n=== ${getSummaryTierLabel(targetTier).toUpperCase()} SUMMARY ===\n${base}\n=== END SUMMARY ===`;
  const { text } = await sendRawCompletionRequest({
    model: conn.model,
    prompt,
    temperature: typeof conn.temperature === "number" ? conn.temperature : 0.2,
    api: conn.api,
    endpoint: conn.endpoint,
    apiKey: conn.apiKey,
    extra,
    signal,
  });
  if (runEpoch !== null) throwIfStmbStopped(runEpoch);
  try {
    console.debug(
      "STMB ArcAnalysis: keyword gen response length=%d",
      (text || "").length,
    );
  } catch {}

  let kw = [];
  try {
    kw = parseKeywordsResponse(text);
  } catch {}
  if (!Array.isArray(kw) || kw.length === 0) {
    // Retry with explicit JSON-only constraint
    const repairPrompt = `${prompt}\n\nReturn ONLY a JSON array of 15-30 strings.`;
    const retry = await sendRawCompletionRequest({
      model: conn.model,
      prompt: repairPrompt,
      temperature:
        typeof conn.temperature === "number" ? conn.temperature : 0.2,
      api: conn.api,
      endpoint: conn.endpoint,
      apiKey: conn.apiKey,
      extra,
      signal,
    });
    if (runEpoch !== null) throwIfStmbStopped(runEpoch);
    kw = parseKeywordsResponse(retry.text);
  }
  if (kw.length > 30) kw = kw.slice(0, 30);
  return kw;
}

async function generateKeywordsForArc(summary, conn, options = {}) {
  return generateKeywordsForSummary(summary, conn, { ...options, targetTier: 1 });
}

/**
 * Build briefs from lorebook memory entries (or pre-filtered selection).
 * Entry is expected to be a lorebook entry object with fields:
 * - uid, content, key (keywords), comment (title), STMB_start/STMB_end optional
 */
export function buildBriefsFromEntries(entries) {
  const briefs = [];
  for (const e of entries) {
    if (!e || typeof e !== "object") continue;
    const id = String(e.uid ?? "");
    const order = extractNumberFromTitle(e.comment ?? "") ?? 0;
    const content = String(e.content ?? "").trim();
    const title = (e.comment || "Untitled").toString().trim(); // preserve the memory title
    briefs.push({
      id,
      order,
      content,
      title,
    });
  }
  briefs.sort((a, b) => a.order - b.order);
  return briefs;
}

// Extract numeric order from typical "[000] ..." titles
function extractNumberFromTitle(title) {
  if (!title) return null;
  const m1 = title.match(/\[(\d+)\]/);
  if (m1) return parseInt(m1[1], 10);
  const m2 = title.match(/^(\d+)[\s-]/);
  if (m2) return parseInt(m2[1], 10);
  return null;
}

/**
 * Build a single-string prompt for the model.
 * Includes previous arc summary if provided, then lists briefs.
 */
export function buildSummaryAnalysisPrompt({
  briefs,
  previousSummary = null,
  previousOrder = null,
  promptText = null,
  targetTier = 1,
}) {
  const header = resolveSummaryPromptPlaceholders(
    promptText || getDefaultArcPrompt(),
    { targetTier },
  );
  const targetLabel = getSummaryTierLabel(targetTier).toUpperCase();
  const childTierLabel = getSummaryTierLabel(getSourceTierForTarget(targetTier));
  const childLabel = childTierLabel.toUpperCase();
  const childPlural =
    /y$/i.test(childTierLabel) ? `${childTierLabel.slice(0, -1)}ies` : `${childTierLabel}s`;
  const childPluralLabel = childPlural.toUpperCase();
  const lines = [];
  if (previousSummary) {
    lines.push(
      `=== PREVIOUS ${targetLabel} (CANON — DO NOT REWRITE, DO NOT INCLUDE IN YOUR NEW SUMMARY) ===`,
    );
    if (typeof previousOrder !== "undefined" && previousOrder !== null) {
      lines.push(`${getSummaryTierLabel(targetTier)} ${previousOrder}`);
    }
    lines.push(previousSummary.trim());
    lines.push(`=== END PREVIOUS ${targetLabel} ===`);
    lines.push("");
  }

  lines.push(`=== ${childPluralLabel} ===`);
  briefs.forEach((b, idx) => {
    const memNo = String(idx + 1).padStart(3, "0"); // 001, 002, ...
    const title = (b.title || "").toString().trim();
    const content = (b.content || "").toString().trim();

    lines.push(`=== ${childTierLabel} ${memNo} ===`);
    lines.push(`Title: ${title}`);
    lines.push(`Contents: ${content}`);
    lines.push(`=== end ${childTierLabel} ${memNo} ===`);
    lines.push("");
  });
  lines.push(`=== END ${childPluralLabel} ===`);
  lines.push("");

  return `${header}\n\n${lines.join("\n")}`;
}

export function buildArcAnalysisPrompt({
  briefs,
  previousArcSummary = null,
  previousArcOrder = null,
  promptText = null,
}) {
  return buildSummaryAnalysisPrompt({
    briefs,
    previousSummary: previousArcSummary,
    previousOrder: previousArcOrder,
    promptText,
    targetTier: 1,
  });
}

/**
 * Parse arc JSON response with repair attempts.
 * Expected shape:
 * {
 *   "arcs": [ { "title": string, "summary": string, "keywords": string[] } ],
 *   "unassigned_memories": [ { "id": string, "reason": string } ]
 * }
 */
export function parseSummaryJsonResponse(text) {
  if (!text || typeof text !== "string") {
    throw new Error(translate("Empty AI response", "STMemoryBooks_ArcAnalysis_EmptyResponse"));
  }
  const normalized = normalizeText(
    text.trim().replace(/<think>[\s\S]*?<\/think>/gi, ""),
  );
  const candidates = [];
  const unwrapped = unwrapJsConcatenatedStringDump(normalized);
  if (unwrapped) candidates.push(unwrapped);
  const fenced = extractFencedBlocks(normalized);
  if (fenced.length) candidates.push(...fenced);
  candidates.push(normalized);
  const balanced = extractBalancedJson(normalized);
  if (balanced) candidates.push(balanced);

  const uniq = Array.from(new Set(candidates));
  for (const cand of uniq) {
    try {
      let s = cand;
      s = stripJsonComments(s);
      s = stripTrailingCommas(s);
      const obj = JSON.parse(s);
      if (!obj || typeof obj !== "object") continue;
      const hasSummaries = "summaries" in obj || "arcs" in obj;
      const hasUnassigned =
        "unassigned_items" in obj || "unassigned_memories" in obj;
      if (!hasSummaries || !hasUnassigned) continue;
      const summaries = Array.isArray(obj.summaries)
        ? obj.summaries
        : Array.isArray(obj.arcs)
          ? obj.arcs
          : [];
      const unassigned = Array.isArray(obj.unassigned_items)
        ? obj.unassigned_items
        : Array.isArray(obj.unassigned_memories)
          ? obj.unassigned_memories
          : [];

      const validSummaries = summaries.filter(
        (a) =>
          a &&
          typeof a.title === "string" &&
          a.title.trim() &&
          typeof a.summary === "string" &&
          a.summary.trim(),
      );

      const validUnassigned = unassigned.filter(
        (u) =>
          u &&
          typeof u.id === "string" &&
          u.id.trim() &&
          typeof u.reason === "string",
      );

      return {
        summaries: validSummaries,
        unassigned_items: validUnassigned,
      };
    } catch {
      // try next candidate
    }
  }
  throw new Error(translate("Model did not return valid arc JSON", "STMemoryBooks_ArcAnalysis_InvalidJSON"));
}

export function parseArcJsonResponse(text) {
  const parsed = parseSummaryJsonResponse(text);
  return {
    arcs: parsed.summaries,
    unassigned_memories: parsed.unassigned_items,
  };
}

/**
 * Run sequential arc analysis passes.
 * selectedEntries: array of lorebook entries (objects) or objects { entry }
 * options: {
 *   presetKey?: string,
 *   maxItemsPerPass?: number (default 12),
 *   maxPasses?: number (default 10),
 *   minAssigned?: number (default 2),
 *   tokenTarget?: number (estimated input tokens; default ~2000)
 * }
 * profileOrConnection: profile object with effectiveConnection, or a direct connection object { api, model, temperature, endpoint?, apiKey? }
 */
export async function runSummaryAnalysisSequential(
  selectedEntries,
  options = {},
  profileOrConnection = null,
) {
  const parentTask = createStmbInFlightTask("ArcAnalysis:sequential");
  const runEpoch = parentTask.epoch;
  try {
  const {
    presetKey = "arc_default",
    maxItemsPerPass = 12,
    maxPasses = 10,
    minAssigned = 2,
    tokenTarget,
    targetTier = 1,
  } = options;
  const extra = options?.extra ?? {};

  // Determine local max passes (single-arc preset defaults to one pass unless explicitly overridden)
  const singleArcPreset = presetKey === "arc_alternate";
  const maxPassesLocal = Object.prototype.hasOwnProperty.call(
    options,
    "maxPasses",
  )
    ? maxPasses
    : singleArcPreset
      ? 1
      : maxPasses;

  // Resolve base token budget from shared settings (tokenWarningThreshold), with optional override
  const sharedThreshold =
    extension_settings?.STMemoryBooks?.moduleSettings?.tokenWarningThreshold;
  const baseTokenTarget =
    typeof tokenTarget === "number"
      ? tokenTarget
      : typeof sharedThreshold === "number"
        ? sharedThreshold
        : 30000;
  // Dynamic token budget that can be raised to accommodate single large items
  let effectiveTokenTarget = baseTokenTarget;

  // Normalize entries to raw entry objects
  const rawEntries = selectedEntries
    .map((x) => (x && x.entry ? x.entry : x))
    .filter(Boolean);
  const allBriefs = buildBriefsFromEntries(rawEntries);
  const remainingMap = new Map(allBriefs.map((b) => [b.id, b]));
  const acceptedSummaries = [];
  // Keep the latest raw model output for UX/debug (used when no usable arcs are produced).
  let lastRawText = "";
  let lastRetryRawText = "";

  // Resolve prompt text
  let promptText = null;
  try {
    if (presetKey && (await ArcPrompts.isValid(presetKey))) {
      promptText = await ArcPrompts.getPrompt(presetKey);
    }
  } catch {}
  if (!promptText) promptText = getDefaultArcPrompt();

  // Resolve connection
  const conn = resolveConnection(profileOrConnection);

  let previousSummary = null;
  let previousOrderValue = null;
  let pass = 0;
  let carryBriefs = [];

  while (remainingMap.size > 0 && pass < maxPassesLocal) {
    throwIfStmbStopped(runEpoch);
    pass++;
    // Reset the effective budget each pass; we'll only raise it for a single-item batch in this pass if needed
    effectiveTokenTarget = baseTokenTarget;

    // Build batch: carry-over a few, then take up to maxItemsPerPass chronologically
    const remainingBriefs = Array.from(remainingMap.values()).sort(
      (a, b) => a.order - b.order,
    );
    const batch = [];
    // include carry-over first
    for (const cb of carryBriefs) {
      if (remainingMap.has(cb.id) && batch.length < maxItemsPerPass) {
        batch.push(cb);
      }
    }
    // fill with fresh items
    for (const rb of remainingBriefs) {
      if (batch.length >= maxItemsPerPass) break;
      if (!batch.find((x) => x.id === rb.id)) {
        batch.push(rb);
      }
    }

    if (batch.length === 0) break;

    // Pass/batch debug
    try {
      console.debug(
        "STMB ArcAnalysis: pass %d batch=%o",
        pass,
        batch.map((b) => b.id),
      );
    } catch {}

    // Token budgeting (simple heuristic): shrink batch if needed; raise budget for single large items
    let prompt = buildSummaryAnalysisPrompt({
      briefs: batch, // use the current batch
      previousSummary,
      previousOrder: previousOrderValue,
      promptText: promptText,
      targetTier,
    });
    let tokenEst = await estimateTokens(prompt, { estimatedOutput: 500 });
    const origLen = batch.length;
    let trimmed = false;
    while (tokenEst.total > effectiveTokenTarget && batch.length > 1) {
      batch.pop();
      trimmed = true;
      prompt = buildSummaryAnalysisPrompt({
        briefs: batch,
        previousSummary,
        previousOrder: previousOrderValue,
        promptText: promptText,
        targetTier,
      });      
    tokenEst = await estimateTokens(prompt, { estimatedOutput: 500 });
    }
    if (trimmed) {
      try {
        console.debug(
          "STMB ArcAnalysis: trimmed batch from %d to %d (est=%d, budget=%d)",
          origLen,
          batch.length,
          tokenEst.total,
          effectiveTokenTarget,
        );
      } catch {}
    }
    if (tokenEst.total > effectiveTokenTarget && batch.length === 1) {
      // Dynamically raise the budget to fit this single large memory
      const prevBudget = effectiveTokenTarget;
      effectiveTokenTarget = tokenEst.total;
      try {
        console.debug(
          "STMB ArcAnalysis: raised budget for single item from %d to %d (est=%d)",
          prevBudget,
          effectiveTokenTarget,
          tokenEst.total,
        );
      } catch {}
    }

    // Send request
    let text;
    {
      const task = createStmbInFlightTask(`ArcAnalysis:pass:${pass}`);
      try {
        const res = await sendRawCompletionRequest({
          model: conn.model,
          prompt,
          temperature: conn.temperature ?? 0.2,
          api: conn.api,
          endpoint: conn.endpoint,
          apiKey: conn.apiKey,
          extra,
          signal: task.signal,
        });
        task.throwIfStopped();
        text = res.text;
      } finally {
        task.finish();
      }
    }
    lastRawText = String(text ?? "");
    lastRetryRawText = "";

    // Parse response
    let parsed;
    try {
      parsed = parseSummaryJsonResponse(text);
    } catch (e) {
      // Single retry with a minimal "return JSON only" reminder
      const repairPrompt = `${prompt}\n\nReturn ONLY the JSON object, nothing else. Ensure arrays and commas are valid.`;
      const retry = await (async () => {
        const task = createStmbInFlightTask(`ArcAnalysis:pass:${pass}:retry`);
        try {
          const res = await sendRawCompletionRequest({
            model: conn.model,
            prompt: repairPrompt,
            temperature: conn.temperature ?? 0.2,
            api: conn.api,
            endpoint: conn.endpoint,
            apiKey: conn.apiKey,
            extra,
            signal: task.signal,
          });
          task.throwIfStopped();
          return res;
        } finally {
          task.finish();
        }
      })();
      lastRetryRawText = String(retry?.text ?? "");
      try {
        parsed = parseSummaryJsonResponse(retry.text);
      } catch (e2) {
        const err = new Error(
          String(e2?.message || e?.message || "Model did not return valid arc JSON"),
        );
        err.name = "ArcAIResponseError";
        err.code = "ARC_INVALID_JSON";
        err.rawText = String(text ?? "");
        err.retryRawText = String(retry?.text ?? "");
        err.prompt = prompt;
        err.repairPrompt = repairPrompt;
        throw err;
      }
    }

    // Build ID resolver to handle both UIDs and sequential indices (e.g. "001", "1")
    const idResolver = new Map();
    batch.forEach((b, idx) => {
      const uid = String(b.id);
      idResolver.set(uid, uid);
      const seq = String(idx + 1).padStart(3, "0");
      idResolver.set(seq, uid);
      idResolver.set(String(idx + 1), uid);
    });

    const resolveId = (raw) => idResolver.get(String(raw).trim());

    // Compute assigned set = batch - unassigned ids
    const unassignedIds = new Set();
    if (Array.isArray(parsed.unassigned_items)) {
      parsed.unassigned_items.forEach((u) => {
        const rid = resolveId(u.id);
        if (rid) unassignedIds.add(rid);
      });
    }

    const assigned = batch.filter((b) => !unassignedIds.has(b.id));

    // Parse/assignment debug
    try {
      console.debug(
        "STMB ArcAnalysis: pass %d summaries=%d unassigned=%d assigned=%d",
        pass,
        Array.isArray(parsed.summaries) ? parsed.summaries.length : 0,
        unassignedIds.size,
        assigned.length,
      );
    } catch {}

    if (assigned.length < minAssigned && pass > 1) {
      // low-progress stop to prevent grind
      break;
    }

    // Accept multiple arcs per pass (if model returns more than one).
    // If arcs[].member_ids is present, use it to map memories to arcs.
    // Otherwise, fall back to assigning the whole 'assigned' set to each arc.
    const summaries = Array.isArray(parsed.summaries) ? parsed.summaries : [];
    const consumedIdSet = new Set();
    for (let i = 0; i < summaries.length; i++) {
      const aobj = summaries[i];
      if (
        !aobj ||
        typeof aobj.title !== "string" ||
        typeof aobj.summary !== "string"
      )
        continue;

      // Optional per-arc membership: member_ids
      let memberIds = null;
      if (Array.isArray(aobj.member_ids)) {
        memberIds = aobj.member_ids
          .map(resolveId)
          .filter((id) => id !== undefined);
      }
      
      if (memberIds && memberIds.length > 0) {
        // IDs were resolved successfully
      } else {
        // Fallback: all assigned items in this pass
        memberIds = assigned.map((x) => x.id);
      }
      if (memberIds.length === 0) continue;

      acceptedSummaries.push({
        order: pass * 10 + i, // stable ordering when multiple arcs in a pass
        title: aobj.title,
        summary: aobj.summary,
        keywords: Array.isArray(aobj.keywords) ? aobj.keywords : [],
        memberIds,
      });

      memberIds.forEach((id) => consumedIdSet.add(String(id)));
      previousSummary = aobj.summary;
    }

    if (acceptedSummaries.length > 0) {
      previousOrderValue = acceptedSummaries[acceptedSummaries.length - 1].order;
    } else {
      previousOrderValue = null;
    }

    // Remove consumed from remaining
    if (consumedIdSet.size > 0) {
      for (const id of consumedIdSet) remainingMap.delete(String(id));
      // If everything is consumed into a single arc, note and stop naturally
      if (remainingMap.size === 0 && acceptedSummaries.length === 1) {
        try {
          console.info("STMB ArcAnalysis: all items were consumed into a single summary.");
        } catch {}
      }
    } else {
      // No progress this pass — stop to prevent repeated sends
      try {
        console.debug(
          "STMB ArcAnalysis: no new IDs consumed on pass %d; stopping.",
          pass,
        );
      } catch {}
      break;
    }

    // Prepare carry-over for next pass (carry all unassigned memories)
    const batchUnassigned = batch.filter((b) => unassignedIds.has(b.id));
    carryBriefs = batchUnassigned;

    // End-of-pass debug
    try {
      console.debug(
        "STMB ArcAnalysis: pass %d consumed=%d remaining=%d",
        pass,
        consumedIdSet.size,
        remainingMap.size,
      );
    } catch {}
  }

  const leftovers = Array.from(remainingMap.values()).map((b) => b.id);
  return {
    summaryCandidates: acceptedSummaries,
    leftovers,
    rawText: String(lastRawText ?? ""),
    retryRawText: String(lastRetryRawText ?? ""),
  };
  } finally {
    parentTask.finish();
  }
}

export async function runArcAnalysisSequential(
  selectedEntries,
  options = {},
  profileOrConnection = null,
) {
  const result = await runSummaryAnalysisSequential(
    selectedEntries,
    { ...options, targetTier: 1 },
    profileOrConnection,
  );
  return {
    ...result,
    arcCandidates: result.summaryCandidates,
  };
}

function resolveConnection(profileOrConnection) {
  // If no profile/connection provided, fall back to extension settings default profile.
  // (Arc analysis is typically invoked without an explicit profile from the UI flow.)
  if (!profileOrConnection) {
    try {
      const settings = extension_settings?.STMemoryBooks;
      const profiles = settings?.profiles;
      if (Array.isArray(profiles) && profiles.length > 0) {
        const rawIndex = settings?.defaultProfile;
        const idx =
          Number.isInteger(rawIndex) && rawIndex >= 0 && rawIndex < profiles.length
            ? rawIndex
            : 0;
        profileOrConnection = profiles[idx] || null;
      }
    } catch {}
  }

  // If a direct connection-like object provided
  if (
    profileOrConnection &&
    profileOrConnection.api &&
    profileOrConnection.model
  ) {
    return profileOrConnection;
  }
  // If a profile with effectiveConnection or connection
  if (
    profileOrConnection &&
    (profileOrConnection.effectiveConnection || profileOrConnection.connection)
  ) {
    const c =
      profileOrConnection.effectiveConnection || profileOrConnection.connection;
    const apiIsCurrentST = String(c?.api || "").toLowerCase() === "current_st";
    const apiInfo = apiIsCurrentST ? getCurrentApiInfo() : null;
    const ui = apiIsCurrentST ? getUIModelSettings() : null;
    return {
      api: normalizeCompletionSource(
        apiIsCurrentST
          ? apiInfo?.completionSource || "openai"
          : c.api || getCurrentApiInfo().completionSource || "openai",
      ),
      model: apiIsCurrentST ? ui?.model || "" : c.model || getUIModelSettings().model || "",
      temperature:
        apiIsCurrentST
          ? (ui?.temperature ?? 0.2)
          : typeof c.temperature === "number"
            ? c.temperature
            : getUIModelSettings().temperature ?? 0.2,
      endpoint: c.endpoint,
      apiKey: c.apiKey,
    };
  }
  // Fallback: current UI
  const apiInfo = getCurrentApiInfo();
  const ui = getUIModelSettings();
  return {
    api: normalizeCompletionSource(apiInfo.completionSource || "openai"),
    model: ui.model || "",
    temperature: ui.temperature ?? 0.2,
  };
}

function extractSummarySequenceFromTitle(title) {
  if (!title || typeof title !== "string") return null;
  const nested = title.match(/\[[^\]]*?\[(\d+)\][^\]]*?\]/);
  if (nested) return parseInt(nested[1], 10);
  const direct = title.match(/\[[^\]]*?(\d+)[^\]]*?\]/);
  if (direct) return parseInt(direct[1], 10);
  const leading = title.match(/^(\d+)[\s-]/);
  if (leading) return parseInt(leading[1], 10);
  return null;
}

export function getNextSummaryNumber(lorebookData, targetTier = 1) {
  const entries = Object.values(lorebookData?.entries || {});
  let maxNum = 0;
  for (const e of entries) {
    if (!e || typeof e.comment !== "string") continue;
    if (!isSummaryEntry(e)) continue;
    if (Number(e.stmbSummaryTier) !== Number(targetTier)) continue;
    const n = extractSummarySequenceFromTitle(e.comment);
    if (typeof n === "number" && n > maxNum) maxNum = n;
  }
  return maxNum + 1;
}

export function formatSummaryTitle(targetTier, format, baseTitle, seq) {
  const safeTitle = String(baseTitle || "").trim();
  let t =
    String(format || "").trim() ||
    getDefaultSummaryTitleFormat(targetTier) ||
    "[ARC 000] - {{title}}";

  t = t.replace(/\{\{\s*title\s*\}\}/g, safeTitle);

  const m = t.match(/\[([^\]]*?)(0{2,})([^\]]*?)\]/);
  if (m) {
    const digits = m[2].length;
    const padded = String(seq).padStart(digits, "0");
    const replaced = `[${m[1]}${padded}${m[3]}]`;
    return t.replace(m[0], replaced);
  }

  const typeKey = String(getSummaryTypeKey(targetTier) || "tier").toUpperCase();
  const fallback = `[${typeKey} ${String(seq).padStart(3, "0")}] ${safeTitle}`;
  return fallback;
}

function computeArcEntryOrder({
  orderMode,
  orderValue,
  reverseStart,
  orderNumber,
}) {
  const ORDER_MIN = 0;
  const ORDER_MAX = 9999;

  const modeRaw = String(orderMode || "auto").toLowerCase();
  const mode = modeRaw === "manual" || modeRaw === "reverse" ? modeRaw : "auto";

  const orderNumberNum = Number(orderNumber);
  const safeOrderNumber = Number.isFinite(orderNumberNum)
    ? Math.trunc(orderNumberNum)
    : 1;

  const reverseStartNum = Number(reverseStart);
  const reverseStartClamped = Number.isFinite(reverseStartNum)
    ? Math.min(9999, Math.max(100, Math.trunc(reverseStartNum)))
    : 9999;

  const rawOrder =
    mode === "manual"
      ? orderValue
      : mode === "reverse"
        ? reverseStartClamped - (safeOrderNumber - 1)
        : safeOrderNumber;

  const rawOrderNum = Number(rawOrder);
  if (!Number.isFinite(rawOrderNum)) {
    return mode === "manual" ? 100 : safeOrderNumber;
  }

  return Math.min(ORDER_MAX, Math.max(ORDER_MIN, Math.trunc(rawOrderNum)));
}

export async function commitSummaryEntries({
  lorebookName,
  lorebookData,
  summaryCandidates,
  targetTier = 1,
  disableOriginals = false,
  orderMode = "auto",
  orderValue = 100,
  reverseStart = 9999,
}) {
  const parentTask = createStmbInFlightTask("ArcAnalysis:commit");
  const runEpoch = parentTask.epoch;
  try {
    if (!lorebookName || !lorebookData) {
      throw new Error(translate("Missing lorebookName or lorebookData", "STMemoryBooks_ArcAnalysis_MissingLorebookData"));
    }
    const results = [];

    const titleFormat =
      Number(targetTier) === 1
        ? extension_settings?.STMemoryBooks?.arcTitleFormat ||
          getDefaultSummaryTitleFormat(targetTier)
        : getDefaultSummaryTitleFormat(targetTier);
    let nextSummaryNumber = getNextSummaryNumber(lorebookData, targetTier);
    const tierLabel = getSummaryTierLabel(targetTier).toLowerCase();

    try {
      console.info(
        "STMB ArcAnalysis: committing %d %s summary(ies): %o",
        summaryCandidates.length,
        tierLabel,
        summaryCandidates.map((a) => a.title),
      );
    } catch {}
    for (const summary of summaryCandidates) {
      throwIfStmbStopped(runEpoch);
      const summaryNumber = nextSummaryNumber++;
      const title = formatSummaryTitle(
        targetTier,
        titleFormat,
        summary.title,
        summaryNumber,
      );
      const content = summary.summary;

      let keywords = Array.isArray(summary.keywords) ? summary.keywords : [];
      if (keywords.length === 0) {
        try {
          const conn = resolveConnection(null);
          const task = createStmbInFlightTask(`ArcAnalysis:keywords:${summaryNumber}`);
          try {
            keywords = await generateKeywordsForSummary(content, conn, {
              runEpoch,
              signal: task.signal,
              targetTier,
            });
            task.throwIfStopped();
          } finally {
            task.finish();
          }
        } catch (e) {
          if (isStmbStopError(e)) throw e;
          try {
            console.warn(
              'STMB ArcAnalysis: keyword generation failed for "%s": %s',
              title,
              String(e?.message || e),
            );
          } catch {}
        }
      }

      const order = computeArcEntryOrder({
        orderMode,
        orderValue,
        reverseStart,
        orderNumber: summaryNumber,
      });
      const defaults = {
        vectorized: true,
        selective: true,
        order,
        position: 0,
      };
      const entryOverrides = {
        stmemorybooks: true,
        stmbSummary: true,
        stmbSummaryTier: Number(targetTier),
        type: getSummaryTypeKey(targetTier),
        key: Array.isArray(keywords) ? keywords : [],
        disable: false,
      };
      throwIfStmbStopped(runEpoch);
      const res = await upsertLorebookEntriesBatch(
        lorebookName,
        lorebookData,
        [
          {
            title,
            content,
            defaults,
            entryOverrides,
          },
        ],
        { refreshEditor: false },
      );
      const created = res && res[0];
      const summaryEntryId = created ? created.uid : null;
      if (!summaryEntryId) {
        throw new Error(translate("Arc upsert returned no entry (commitArcs failed)", "STMemoryBooks_ArcAnalysis_UpsertFailed"));
      }

      if (disableOriginals && summaryEntryId) {
        throwIfStmbStopped(runEpoch);
        const idSet = new Set((summary.memberIds || []).map(String));
        const entries = Object.values(lorebookData.entries || {});
        for (const e of entries) {
          if (idSet.has(String(e.uid))) {
            e.disable = true;
            e.disabledBySummaryId = summaryEntryId;
          }
        }
      }
      results.push({ summaryEntryId, title, targetTier: Number(targetTier) });
    }

    throwIfStmbStopped(runEpoch);
    await upsertLorebookEntriesBatch(lorebookName, lorebookData, [], {
      refreshEditor: true,
    });
    try {
      console.info(
        "STMB ArcAnalysis: committed summary IDs: %o",
        results.map((r) => r.summaryEntryId),
      );
    } catch {}
    return { results };
  } finally {
    parentTask.finish();
  }
}

export async function commitArcs({
  lorebookName,
  lorebookData,
  arcCandidates,
  disableOriginals = false,
  orderMode = "auto",
  orderValue = 100,
  reverseStart = 9999,
}) {
  const result = await commitSummaryEntries({
    lorebookName,
    lorebookData,
    summaryCandidates: arcCandidates,
    targetTier: 1,
    disableOriginals,
    orderMode,
    orderValue,
    reverseStart,
  });
  return {
    ...result,
    results: Array.isArray(result?.results)
      ? result.results.map((item) => ({
          arcEntryId: item.summaryEntryId,
          title: item.title,
        }))
      : [],
  };
}
