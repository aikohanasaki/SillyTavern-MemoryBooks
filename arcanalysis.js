import { estimateTokens, getCurrentApiInfo, getUIModelSettings, normalizeCompletionSource } from './utils.js';
import { sendRawCompletionRequest } from './stmemory.js';
import { getDefaultArcPrompt } from './templatesArcPrompts.js';
import * as ArcPrompts from './arcAnalysisPromptManager.js';
import { upsertLorebookEntriesBatch } from './addlore.js';
import { extension_settings } from '../../../extensions.js';

/**
 * Arc Analysis pipeline (stateless wrt model; stateful in controller).
 * Exports:
 *  - buildBriefsFromEntries(entries)
 *  - buildArcAnalysisPrompt({ briefs, previousArcSummary, promptText })
 *  - parseArcJsonResponse(text)
 *  - runArcAnalysisSequential(selectedEntries, options, profileOrConnection)
 *  - commitArcs({ lorebookName, lorebookData, arcCandidates, disableOriginals })
 */

const MODULE_NAME = 'STMemoryBooks-ArcAnalysis';

const KEYWORD_PROMPT = `Based on this narrative arc summary, generate 15–30 standalone topical keywords that function as retrieval tags, not micro-summaries. 
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
  return String(s || '')
    .replace(/\r\n/g, '\n')
    .replace(/^\uFEFF/, '')
    .replace(/[\u200B-\u200D\u2060]/g, '');
}

function extractFencedBlocks(s) {
  const re = /```([\w+-]*)\s*([\s\S]*?)```/g;
  const out = [];
  let m;
  while ((m = re.exec(s)) !== null) {
    out.push((m[2] || '').trim());
  }
  return out;
}

function extractBalancedJson(s) {
  const start = s.search(/[\{\[]/);
  if (start === -1) return null;
  const open = s[start];
  const close = open === '{' ? '}' : ']';
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (esc) { esc = false; }
      else if (ch === '\\') { esc = true; }
      else if (ch === '"') { inStr = false; }
      continue;
    }
    if (ch === '"') { inStr = true; continue; }
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return s.slice(start, i + 1).trim();
    }
  }
  return null;
}

function stripJsonComments(s) {
  let out = '';
  let inStr = false, esc = false, inLine = false, inBlock = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i], next = s[i + 1];
    if (inStr) {
      out += ch;
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (inLine) {
      if (ch === '\n') { inLine = false; out += ch; }
      continue;
    }
    if (inBlock) {
      if (ch === '*' && next === '/') { inBlock = false; i++; }
      continue;
    }
    if (ch === '"') { inStr = true; out += ch; continue; }
    if (ch === '/' && next === '/') { inLine = true; i++; continue; }
    if (ch === '/' && next === '*') { inBlock = true; i++; continue; }
    out += ch;
  }
  return out;
}

function stripTrailingCommas(s) {
  let out = '';
  let inStr = false, esc = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      out += ch;
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') { inStr = true; out += ch; continue; }
    if (ch === ',') {
      let j = i + 1;
      while (j < s.length && /\s/.test(s[j])) j++;
      if (s[j] === '}' || s[j] === ']') {
        // skip trailing comma
        continue;
      }
    }
    out += ch;
  }
  return out;
}

/**
 * Keyword generation helpers
 */
function sanitizeKeywordArray(items) {
  const out = [];
  const seen = new Set();
  for (const it of items || []) {
    let k = String(it || '').trim();
    k = k.replace(/^["']|["']$/g, '');
    k = k.replace(/^\d+\.\s*/, '');
    k = k.replace(/^[\-\*\u2022]\s*/, '');
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
  const normalized = normalizeText(String(text || '').trim());
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
        : (parsed && Array.isArray(parsed.keywords) ? parsed.keywords : null);
      if (arr) return sanitizeKeywordArray(arr);
    } catch {
      // try next candidate
    }
  }

  // Fallback parsing: bullets or comma-separated
  const lines = normalized.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  let items = [];
  if (lines.length > 1) {
    items = lines.map(x => x.replace(/^[\-\*\u2022]?\s*\d*\.?\s*/, '').trim());
  } else {
    items = normalized.split(/[,;]+/).map(x => x.trim());
  }
  return sanitizeKeywordArray(items);
}

async function generateKeywordsForArc(summary, conn) {
  const base = String(summary || '').trim();
  const prompt = `${KEYWORD_PROMPT}\n\n=== ARC SUMMARY ===\n${base}\n=== END SUMMARY ===`;
  const { text } = await sendRawCompletionRequest({
    model: conn.model,
    prompt,
    temperature: typeof conn.temperature === 'number' ? conn.temperature : 0.2,
    api: conn.api,
    endpoint: conn.endpoint,
    apiKey: conn.apiKey,
    extra: {}
  });
  try { console.debug('STMB ArcAnalysis: keyword gen response length=%d', (text || '').length); } catch {}

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
      temperature: typeof conn.temperature === 'number' ? conn.temperature : 0.2,
      api: conn.api,
      endpoint: conn.endpoint,
      apiKey: conn.apiKey,
      extra: {}
    });
    kw = parseKeywordsResponse(retry.text);
  }
  if (kw.length > 30) kw = kw.slice(0, 30);
  return kw;
}

/**
 * Build briefs from lorebook memory entries (or pre-filtered selection).
 * Entry is expected to be a lorebook entry object with fields:
 * - uid, content, key (keywords), comment (title), STMB_start/STMB_end optional
 */
export function buildBriefsFromEntries(entries) {
  const briefs = [];
  for (const e of entries) {
    if (!e || typeof e !== 'object') continue;
    const id = String(e.uid ?? '');
    const order = extractNumberFromTitle(e.comment || '') ?? 0;
    const content = String(e.content || '').trim();
    briefs.push({
      id,
      order,
      content
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
export function buildArcAnalysisPrompt({ briefs, previousArcSummary = null, promptText = null }) {
  const header = promptText || getDefaultArcPrompt();
  const lines = [];
  if (previousArcSummary) {
    lines.push('=== PREVIOUS ARC (CANON — DO NOT REWRITE) ===');
    lines.push(previousArcSummary.trim());
    lines.push('=== END PREVIOUS ARC ===');
    lines.push('');
  }
  lines.push('=== MEMORIES (ID | ORDER | FULL TEXT) ===');
  for (const b of briefs) {
    lines.push(`[${b.id}] | ${b.order}`);
    lines.push(b.content);
    lines.push('');
  }
  lines.push('=== END MEMORIES ===');
  lines.push('');
  // The header already states JSON-only requirements and schema.
  return `${header}\n\n${lines.join('\n')}`;
}

/**
 * Parse arc JSON response with repair attempts.
 * Expected shape:
 * {
 *   "arcs": [ { "title": string, "summary": string, "keywords": string[] } ],
 *   "unassigned_memories": [ { "id": string, "reason": string } ]
 * }
 */
export function parseArcJsonResponse(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Empty AI response');
  }
  const normalized = normalizeText(text.trim().replace(/<think>[\s\S]*?<\/think>/gi, ''));
  const candidates = [];
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
      // Validate shape
      if (!obj || typeof obj !== 'object') continue;
      if (!('arcs' in obj) || !('unassigned_memories' in obj)) continue;

      const arcs = Array.isArray(obj.arcs) ? obj.arcs : [];
      const unassigned = Array.isArray(obj.unassigned_memories) ? obj.unassigned_memories : [];

      // Relaxed: accept arcs with missing/non-array keywords. We only require title + summary here.
      const validArcs = arcs.filter(a =>
        a && typeof a.title === 'string' && a.title.trim() &&
        typeof a.summary === 'string' && a.summary.trim()
      );

      const validUnassigned = unassigned.filter(u =>
        u && typeof u.id === 'string' && u.id.trim() && typeof u.reason === 'string'
      );

      return {
        arcs: validArcs,
        unassigned_memories: validUnassigned
      };
    } catch {
      // try next candidate
    }
  }
  throw new Error('Model did not return valid arc JSON');
}

/**
 * Run sequential arc analysis passes.
 * selectedEntries: array of lorebook entries (objects) or objects { entry }
 * options: {
 *   presetKey?: string,
 *   maxItemsPerPass?: number (default 12),
 *   carryOver?: number (default 2),
 *   maxPasses?: number (default 10),
 *   minAssigned?: number (default 2),
 *   tokenTarget?: number (estimated input tokens; default ~2000)
 * }
 * profileOrConnection: profile object with effectiveConnection, or a direct connection object { api, model, temperature, endpoint?, apiKey? }
 */
export async function runArcAnalysisSequential(selectedEntries, options = {}, profileOrConnection = null) {
  const {
    presetKey = 'arc_default',
    maxItemsPerPass = 12,
    carryOver = 2,
    maxPasses = 10,
    minAssigned = 2,
    tokenTarget
  } = options;

  // Determine local max passes (single-arc preset defaults to one pass unless explicitly overridden)
  const singleArcPreset = (presetKey === 'arc_alternate');
  const maxPassesLocal = (Object.prototype.hasOwnProperty.call(options, 'maxPasses')) ? maxPasses : (singleArcPreset ? 1 : maxPasses);

  // Resolve base token budget from shared settings (tokenWarningThreshold), with optional override
  const sharedThreshold = extension_settings?.STMemoryBooks?.moduleSettings?.tokenWarningThreshold;
  const baseTokenTarget = typeof tokenTarget === 'number' ? tokenTarget : (typeof sharedThreshold === 'number' ? sharedThreshold : 30000);
  // Dynamic token budget that can be raised to accommodate single large items
  let effectiveTokenTarget = baseTokenTarget;

  // Normalize entries to raw entry objects
  const rawEntries = selectedEntries.map(x => (x && x.entry) ? x.entry : x).filter(Boolean);
  const allBriefs = buildBriefsFromEntries(rawEntries);
  const remainingMap = new Map(allBriefs.map(b => [b.id, b]));
  const acceptedArcs = [];

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

  let previousArcSummary = null;
  let pass = 0;
  let carryBriefs = [];

  while (remainingMap.size > 0 && pass < maxPassesLocal) {
    pass++;
    // Reset the effective budget each pass; we'll only raise it for a single-item batch in this pass if needed
    effectiveTokenTarget = baseTokenTarget;

    // Build batch: carry-over a few, then take up to maxItemsPerPass chronologically
    const remainingBriefs = Array.from(remainingMap.values()).sort((a, b) => a.order - b.order);
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
      if (!batch.find(x => x.id === rb.id)) {
        batch.push(rb);
      }
    }

    if (batch.length === 0) break;

    // Pass/batch debug
    try { console.debug('STMB ArcAnalysis: pass %d batch=%o', pass, batch.map(b => b.id)); } catch {}

    // Token budgeting (simple heuristic): shrink batch if needed; raise budget for single large items
    let prompt = buildArcAnalysisPrompt({ briefs: batch, previousArcSummary, promptText });
    let tokenEst = await estimateTokens(prompt, { estimatedOutput: 500 });
    const origLen = batch.length;
    let trimmed = false;
    while (tokenEst.total > effectiveTokenTarget && batch.length > 1) {
      batch.pop();
      trimmed = true;
      prompt = buildArcAnalysisPrompt({ briefs: batch, previousArcSummary, promptText });
      tokenEst = await estimateTokens(prompt, { estimatedOutput: 500 });
    }
    if (trimmed) {
      try { console.debug('STMB ArcAnalysis: trimmed batch from %d to %d (est=%d, budget=%d)', origLen, batch.length, tokenEst.total, effectiveTokenTarget); } catch {}
    }
    if (tokenEst.total > effectiveTokenTarget && batch.length === 1) {
      // Dynamically raise the budget to fit this single large memory
      const prevBudget = effectiveTokenTarget;
      effectiveTokenTarget = tokenEst.total;
      try { console.debug('STMB ArcAnalysis: raised budget for single item from %d to %d (est=%d)', prevBudget, effectiveTokenTarget, tokenEst.total); } catch {}
    }

    // Send request
    const { text } = await sendRawCompletionRequest({
      model: conn.model,
      prompt,
      temperature: conn.temperature ?? 0.2,
      api: conn.api,
      endpoint: conn.endpoint,
      apiKey: conn.apiKey,
      extra: {}
    });

    // Parse response
    let parsed;
    try {
      parsed = parseArcJsonResponse(text);
    } catch (e) {
      // Single retry with a minimal "return JSON only" reminder
      const repairPrompt = `${prompt}\n\nReturn ONLY the JSON object, nothing else. Ensure arrays and commas are valid.`;
      const retry = await sendRawCompletionRequest({
        model: conn.model,
        prompt: repairPrompt,
        temperature: conn.temperature ?? 0.2,
        api: conn.api,
        endpoint: conn.endpoint,
        apiKey: conn.apiKey,
        extra: {}
      });
      parsed = parseArcJsonResponse(retry.text);
    }

    // Compute assigned set = batch - unassigned ids
    const unassignedIds = new Set((parsed.unassigned_memories || []).map(x => x.id));
    const assigned = batch.filter(b => !unassignedIds.has(b.id));

    // Parse/assignment debug
    try { console.debug('STMB ArcAnalysis: pass %d arcs=%d unassigned=%d assigned=%d', pass, Array.isArray(parsed.arcs) ? parsed.arcs.length : 0, unassignedIds.size, assigned.length); } catch {}

    if (assigned.length < minAssigned && pass > 1) {
      // low-progress stop to prevent grind
      break;
    }

    // Accept multiple arcs per pass (if model returns more than one).
    // If arcs[].member_ids is present, use it to map memories to arcs.
    // Otherwise, fall back to assigning the whole 'assigned' set to each arc.
    const arcs = Array.isArray(parsed.arcs) ? parsed.arcs : [];
    const consumedIdSet = new Set();
    let acceptedInPass = 0;
    for (let i = 0; i < arcs.length; i++) {
      const aobj = arcs[i];
      if (!aobj || typeof aobj.title !== 'string' || typeof aobj.summary !== 'string') continue;

      // Optional per-arc membership: member_ids
      let memberIds = Array.isArray(aobj.member_ids) ? aobj.member_ids.map(String) : null;
      if (memberIds) {
        // Keep only IDs from this batch
        const batchIds = new Set(batch.map(b => String(b.id)));
        memberIds = memberIds.filter(id => batchIds.has(String(id)));
      } else {
        // Fallback: all assigned items in this pass
        memberIds = assigned.map(x => x.id);
      }
      if (memberIds.length === 0) continue;

      acceptedArcs.push({
        order: (pass * 10) + i, // stable ordering when multiple arcs in a pass
        title: aobj.title,
        summary: aobj.summary,
        keywords: Array.isArray(aobj.keywords) ? aobj.keywords : [],
        memberIds
      });

      memberIds.forEach(id => consumedIdSet.add(String(id)));
      acceptedInPass++;
      // Carry forward the last accepted summary as the "previous arc" canon
      previousArcSummary = aobj.summary;
    }

    // Remove consumed from remaining
    if (consumedIdSet.size > 0) {
      for (const id of consumedIdSet) remainingMap.delete(String(id));
      // If everything is consumed into a single arc, note and stop naturally
      if (remainingMap.size === 0 && acceptedArcs.length === 1) {
        try { console.info('STMB ArcAnalysis: all memories were consumed into a single arc.'); } catch {}
      }
    } else {
      // No progress this pass — stop to prevent repeated sends
      try { console.debug('STMB ArcAnalysis: no new IDs consumed on pass %d; stopping.', pass); } catch {}
      break;
    }

    // Prepare carry-over for next pass (subset of unassigned to help stitching)
    const batchUnassigned = batch.filter(b => unassignedIds.has(b.id)).slice(0, Math.max(0, carryOver));
    carryBriefs = batchUnassigned;

    // End-of-pass debug
    try { console.debug('STMB ArcAnalysis: pass %d consumed=%d remaining=%d', pass, consumedIdSet.size, remainingMap.size); } catch {}
  }

  const leftovers = Array.from(remainingMap.values()).map(b => b.id);
  return { arcCandidates: acceptedArcs, leftovers };
}

function resolveConnection(profileOrConnection) {
  // If a direct connection-like object provided
  if (profileOrConnection && profileOrConnection.api && profileOrConnection.model) {
    return profileOrConnection;
  }
  // If a profile with effectiveConnection or connection
  if (profileOrConnection && (profileOrConnection.effectiveConnection || profileOrConnection.connection)) {
    const c = profileOrConnection.effectiveConnection || profileOrConnection.connection;
    return {
      api: normalizeCompletionSource(c.api || getCurrentApiInfo().completionSource || 'openai'),
      model: c.model || (getUIModelSettings().model || ''),
      temperature: typeof c.temperature === 'number' ? c.temperature : (getUIModelSettings().temperature || 0.2),
      endpoint: c.endpoint,
      apiKey: c.apiKey
    };
  }
  // Fallback: current UI
  const apiInfo = getCurrentApiInfo();
  const ui = getUIModelSettings();
  return {
    api: normalizeCompletionSource(apiInfo.completionSource || 'openai'),
    model: ui.model || '',
    temperature: ui.temperature || 0.2
  };
}

/**
 * Extract ARC sequence number from an ARC entry title.
 * Supports "[ARC 001] ..." and "[ARC [001]] ..." formats.
 */
function extractArcSequenceFromTitle(title) {
  if (!title || typeof title !== 'string') return null;
  // Match [ARC 001] (single bracket)
  let m = title.match(/\[ARC\s+(\d+)\]/i);
  if (m) return parseInt(m[1], 10);
  // Match [ARC [001]] (nested bracket)
  m = title.match(/\[ARC\s+\[(\d+)\]\]/i);
  if (m) return parseInt(m[1], 10);
  return null;
}

/**
 * Compute next ARC number by scanning existing ARC entries (stmbArc === true)
 */
function getNextArcNumber(lorebookData) {
  const entries = Object.values(lorebookData?.entries || {});
  let maxNum = 0;
  for (const e of entries) {
    if (e && e.stmbArc === true && typeof e.comment === 'string') {
      const n = extractArcSequenceFromTitle(e.comment);
      if (typeof n === 'number' && n > maxNum) maxNum = n;
    }
  }
  return maxNum + 1;
}

/**
 * Format ARC title using a customizable format.
 * - Replaces the first bracketed zero-run like "[ARC 000]" by padding the sequence number to the same digit length.
 * - Replaces "{{title}}" with the base title.
 * Fallback: "[ARC XXX] Base Title" with 3 digits if no zero-run bracket found.
 */
function formatArcTitle(format, baseTitle, seq) {
  const safeTitle = String(baseTitle || '').trim();
  let t = String(format || '').trim() || '[ARC 000] - {{title}}';

  // Replace title placeholder
  t = t.replace(/\{\{\s*title\s*\}\}/g, safeTitle);

  // Replace first bracket with zero-run inside, preserving any surrounding text within the bracket
  const m = t.match(/\[([^\]]*?)(0{2,})([^\]]*?)\]/);
  if (m) {
    const digits = m[2].length;
    const padded = String(seq).padStart(digits, '0');
    const replaced = `[${m[1]}${padded}${m[3]}]`;
    return t.replace(m[0], replaced);
  }

  // Fallback to classic "[ARC 001] Title"
  const fallback = `[ARC ${String(seq).padStart(3, '0')}] ${safeTitle}`;
  return fallback;
}

/**
 * Commit accepted arcs into the lorebook.
 * arcCandidates: array of { title, summary, keywords, memberIds }
 * If disableOriginals=true, mark original entries disable=true and set disabledByArcId.
 */
export async function commitArcs({ lorebookName, lorebookData, arcCandidates, disableOriginals = false }) {
  if (!lorebookName || !lorebookData) {
    throw new Error('Missing lorebookName or lorebookData');
  }
  const results = [];

  // Arc title format: allow user customization similar to memory titles, minimal wiring.
  // Users can set extension_settings.STMemoryBooks.arcTitleFormat (e.g., "[ARC 000] - {{title}}").
  const arcTitleFormat = extension_settings?.STMemoryBooks?.arcTitleFormat || '[ARC 000] - {{title}}';
  let nextArcNumber = getNextArcNumber(lorebookData);

  try { console.info('STMB ArcAnalysis: committing %d arc(s): %o', arcCandidates.length, arcCandidates.map(a => a.title)); } catch {}
  for (const arc of arcCandidates) {
    const title = formatArcTitle(arcTitleFormat, arc.title, nextArcNumber++);
    const content = arc.summary;

    // Auto-generate keywords if missing using the arc summary
    let keywords = Array.isArray(arc.keywords) ? arc.keywords : [];
    if (keywords.length === 0) {
      try {
        const conn = resolveConnection(null);
        keywords = await generateKeywordsForArc(content, conn);
      } catch (e) {
        try { console.warn('STMB ArcAnalysis: keyword generation failed for "%s": %s', title, String(e?.message || e)); } catch {}
      }
    }

    const defaults = { vectorized: true, selective: true, order: 100, position: 0 };
    const entryOverrides = {
      stmemorybooks: true,
      stmbArc: true,
      type: 'arc',
      key: Array.isArray(keywords) ? keywords : [],
      // Keep consistent fields present in lorebook entries:
      disable: false
    };
    const res = await upsertLorebookEntriesBatch(
      lorebookName,
      lorebookData,
      [{
        title,
        content,
        defaults,
        entryOverrides
      }],
      { refreshEditor: false }
    );
    const created = res && res[0];
    const arcEntryId = created ? created.uid : null;
    if (!arcEntryId) {
      throw new Error('Arc upsert returned no entry (commitArcs failed)');
    }

    // If requested, disable originals by ID match (memberIds refer to entry.uid string)
    if (disableOriginals && arcEntryId) {
      const idSet = new Set(arc.memberIds.map(String));
      const entries = Object.values(lorebookData.entries || {});
      for (const e of entries) {
        if (idSet.has(String(e.uid))) {
          e.disable = true;
          e.disabledByArcId = arcEntryId;
        }
      }
    }
    results.push({ arcEntryId, title });
  }

  // Single save + refresh
  await upsertLorebookEntriesBatch(lorebookName, lorebookData, [], { refreshEditor: true });
  try { console.info('STMB ArcAnalysis: committed arc IDs: %o', results.map(r => r.arcEntryId)); } catch {}
  return { results };
}
