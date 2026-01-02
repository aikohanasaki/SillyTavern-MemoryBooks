import { getRequestHeaders } from '../../../../script.js';
import { FILE_NAMES, SCHEMA } from './constants.js';
import { translate } from '../../../i18n.js';
import { getBuiltInArcPrompts, getDefaultArcPrompt } from './templatesArcPrompts.js';

const MODULE_NAME = 'STMemoryBooks-ArcAnalysisPromptManager';
const PROMPTS_FILE = FILE_NAMES.ARC_PROMPTS_FILE;

 // Preferred translation keys for built-in arc presets
 const BUILTIN_DISPLAY_NAMES = {
   arc_default: 'STMemoryBooks_ArcDefaultDisplayName',
   arc_alternate: 'STMemoryBooks_ArcAlternateDisplayName',
 };

/**
 * In-memory cache of loaded overrides
 * @type {Object|null}
 */
let cachedOverrides = null;

/**
 * Generates a safe slug from a string
 * @param {string} str
 * @returns {string}
 */
function safeSlug(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50);
}

/**
 * Title-case helper
 * @param {string} str
 * @returns {string}
 */
function toTitleCase(str) {
  return String(str || '').replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
  });
}

/**
 * Generates a display name from prompt content (fallback)
 * @param {string} prompt
 * @returns {string}
 */
function generateDisplayNameFromContent(prompt) {
  const lines = String(prompt || '').split('\n').filter((l) => l.trim());
  if (lines.length > 0) {
    const first = lines[0].trim();
    const cleaned = first
      .replace(/^(You are|Analyze|Create|Generate|Write)\s+/i, '')
      .replace(/[:.]/g, '')
      .trim();
    return toTitleCase(cleaned.substring(0, 50));
  }
  return 'Arc Prompt';
}

/**
 * Generates a unique key for a preset
 * @param {string} baseName
 * @param {Object} existingOverrides
 * @returns {string}
 */
function generateUniqueKey(baseName, existingOverrides) {
  const builtIns = getBuiltInArcPrompts() || {};
  const existing = existingOverrides || {};
  const baseSlug = safeSlug(baseName || 'arc-prompt');
  let key = baseSlug;
  let counter = 2;
  while (key in existing || key in builtIns) {
    key = `${baseSlug}-${counter++}`;
  }
  return key;
}

/**
 * Validate prompts file structure (lightweight)
 * @param {Object} data
 * @returns {boolean}
 */
function validatePromptsFile(data) {
  if (!data || typeof data !== 'object') return false;
  if (typeof data.version !== 'number') return false;
  if (!data.overrides || typeof data.overrides !== 'object') return false;
  for (const [key, ov] of Object.entries(data.overrides)) {
    if (!ov || typeof ov !== 'object') return false;
    if (typeof ov.prompt !== 'string' || !ov.prompt.trim()) return false;
    if (ov.displayName !== undefined && typeof ov.displayName !== 'string') return false;
  }
  return true;
}

/**
 * Loads overrides from server or creates defaults with built-ins
 * @param {Object|null} settings
 * @returns {Promise<Object>}
 */
async function loadOverrides(settings = null) {
  if (cachedOverrides) return cachedOverrides;

  let mustWrite = false;
  let data = null;

  try {
    const response = await fetch(`/user/files/${PROMPTS_FILE}`, {
      method: 'GET',
      credentials: 'include',
      headers: getRequestHeaders(),
    });
    if (!response.ok) {
      mustWrite = true;
    } else {
      const text = await response.text();
      data = JSON.parse(text);
      if (!validatePromptsFile(data)) {
        mustWrite = true;
      }
    }
  } catch {
    mustWrite = true;
  }

  if (mustWrite) {
    const overrides = {};
    const now = new Date().toISOString();
    const builtIns = getBuiltInArcPrompts() || {};
    // Seed all built-ins as overridable entries for consistent UX
    for (const [key, prompt] of Object.entries(builtIns)) {
      let displayName;
      if (BUILTIN_DISPLAY_NAMES[key]) {
        const translated = translate(BUILTIN_DISPLAY_NAMES[key]);
        displayName = translated || toTitleCase(key.replace(/^arc[_-]?/, '').replace(/[_-]/g, ' ')) || generateDisplayNameFromContent(prompt);
      } else {
        displayName = toTitleCase(key.replace(/^arc[_-]?/, '').replace(/[_-]/g, ' ')) || generateDisplayNameFromContent(prompt);
      }
      overrides[key] = {
        displayName,
        prompt,
        createdAt: now,
      };
    }

    data = {
      version: SCHEMA.CURRENT_VERSION,
      overrides,
    };
    await saveOverrides(data);
  }

  cachedOverrides = data;
  return cachedOverrides;
}

/**
 * Saves overrides
 * @param {Object} doc
 * @returns {Promise<void>}
 */
async function saveOverrides(doc) {
  const json = JSON.stringify(doc, null, 2);
  const base64 = btoa(unescape(encodeURIComponent(json)));
  const response = await fetch('/api/files/upload', {
    method: 'POST',
    credentials: 'include',
    headers: getRequestHeaders(),
    body: JSON.stringify({
      name: PROMPTS_FILE,
      data: base64,
    }),
  });
  if (!response.ok) {
    const msg = translate("Failed to save arc prompts", "STMemoryBooks_ArcPromptManager_SaveFailed");
    throw new Error(`${msg}: ${response.statusText}`);
  }
  cachedOverrides = doc;
  console.log(`${MODULE_NAME}: Arc prompts saved`);
}

/**
 * Public API
 */

/**
 * First-run init to ensure file exists with built-ins
 * @param {Object} settings
 * @returns {Promise<boolean>}
 */
export async function firstRunInitIfMissing(settings) {
  await loadOverrides(settings);
  return true;
}

/**
 * List presets
 * @returns {Promise<Array<{key:string, displayName:string, createdAt:string|null}>>}
 */
export async function listPresets(settings = null) {
  const data = await loadOverrides(settings);
  const presets = [];

  // Overrides
  for (const [key, preset] of Object.entries(data.overrides)) {
    presets.push({
      key,
      displayName: preset.displayName || toTitleCase(key),
      createdAt: preset.createdAt || null,
    });
  }

  // Include any built-ins not overridden
  const builtIns = getBuiltInArcPrompts() || {};
  for (const key of Object.keys(builtIns)) {
    if (!(key in data.overrides)) {
      presets.push({
        key,
        displayName: (BUILTIN_DISPLAY_NAMES[key] || toTitleCase(key.replace(/^arc[_-]?/, '').replace(/[_-]/g, ' '))),
        createdAt: null,
      });
    }
  }

  // Newest first
  presets.sort((a, b) => {
    if (!a.createdAt) return 1;
    if (!b.createdAt) return -1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return presets;
}

/**
 * Get prompt text for a preset key
 * @param {string} key
 * @returns {Promise<string>}
 */
export async function getPrompt(key, settings = null) {
  const data = await loadOverrides(settings);
  if (data.overrides[key] && typeof data.overrides[key].prompt === 'string' && data.overrides[key].prompt.trim()) {
    return data.overrides[key].prompt;
  }
  const builtIns = getBuiltInArcPrompts();
  return builtIns[key] || getDefaultArcPrompt();
}

/**
 * Get display name for a preset key
 * @param {string} key
 * @returns {Promise<string>}
 */
export async function getDisplayName(key, settings = null) {
  const data = await loadOverrides(settings);
  if (data.overrides[key] && data.overrides[key].displayName) {
    return data.overrides[key].displayName;
  }
  return BUILTIN_DISPLAY_NAMES[key] || toTitleCase(String(key || '').replace(/^arc[_-]?/, '').replace(/[_-]/g, ' ')) || 'Arc Prompt';
}

/**
 * Check if preset exists
 * @param {string} key
 * @returns {Promise<boolean>}
 */
export async function isValid(key, settings = null) {
  const data = await loadOverrides(settings);
  const builtIns = getBuiltInArcPrompts() || {};
  return !!(data.overrides[key] || builtIns[key]);
}

/**
 * Create or update a preset
 * @param {string|null} key
 * @param {string} prompt
 * @param {string} displayName
 * @returns {Promise<string>} key used
 */
export async function upsertPreset(key, prompt, displayName) {
  const data = await loadOverrides();
  const now = new Date().toISOString();

  let actualKey = key;
  if (!actualKey) {
    actualKey = generateUniqueKey(displayName || generateDisplayNameFromContent(prompt), data.overrides);
  }

  if (data.overrides[actualKey]) {
    data.overrides[actualKey].prompt = prompt;
    data.overrides[actualKey].displayName = displayName || data.overrides[actualKey].displayName;
    data.overrides[actualKey].updatedAt = now;
  } else {
    data.overrides[actualKey] = {
      displayName: displayName || generateDisplayNameFromContent(prompt),
      prompt,
      createdAt: now,
    };
  }

  await saveOverrides(data);
  return actualKey;
}

/**
 * Duplicate a preset
 * @param {string} sourceKey
 * @returns {Promise<string>}
 */
export async function duplicatePreset(sourceKey) {
  const data = await loadOverrides();
  const src = data.overrides[sourceKey];
  if (!src) throw new Error(`Arc preset "${sourceKey}" not found`);
  const newDisplayName = `${src.displayName || toTitleCase(sourceKey)} (Copy)`;
  const newKey = generateUniqueKey(newDisplayName, data.overrides);
  const now = new Date().toISOString();
  data.overrides[newKey] = {
    displayName: newDisplayName,
    prompt: src.prompt,
    createdAt: now,
  };
  await saveOverrides(data);
  return newKey;
}

/**
 * Remove a preset
 * @param {string} key
 * @returns {Promise<void>}
 */
export async function removePreset(key) {
  const data = await loadOverrides();
  if (!data.overrides[key]) throw new Error(`Arc preset "${key}" not found`);
  delete data.overrides[key];
  await saveOverrides(data);
}

/**
 * Export prompts JSON
 * @returns {Promise<string>}
 */
export async function exportToJSON() {
  const data = await loadOverrides();
  return JSON.stringify(data, null, 2);
}

/**
 * Import prompts JSON
 * @param {string} jsonString
 * @returns {Promise<void>}
 */
export async function importFromJSON(jsonString) {
  const obj = JSON.parse(jsonString);
  if (!validatePromptsFile(obj)) {
    throw new Error('Invalid arc prompts file structure.');
  }
  await saveOverrides(obj);
}

/**
 * Clear in-memory cache (for testing)
 */
export function clearCache() {
  cachedOverrides = null;
}

/**
 * Recreate built-in prompts by removing overrides with the same keys
 * @param {'overwrite'} mode
 * @returns {Promise<{ removed: number }>}
 */
export async function recreateBuiltInPrompts(mode = 'overwrite') {
  if (mode !== 'overwrite') {
    console.warn(`${MODULE_NAME}: Unsupported mode "${mode}", defaulting to overwrite`);
  }
  const data = await loadOverrides();
  const builtIns = getBuiltInArcPrompts() || {};
  const keys = Object.keys(builtIns);
  let removed = 0;
  if (data && data.overrides && typeof data.overrides === 'object') {
    for (const k of keys) {
      if (k in data.overrides) {
        delete data.overrides[k];
        removed++;
      }
    }
  }
  await saveOverrides(data);
  cachedOverrides = data;
  console.log(`${MODULE_NAME}: Recreated arc built-ins (removed ${removed} overrides)`);
  return { removed };
}

/**
 * Rebuild prompts file to exactly match current built-ins.
 * Creates optional timestamped backup of existing overrides file.
 * @param {{backup?: boolean}} options
 * @returns {Promise<{count:number, backupName?:string}>}
 */
export async function rebuildFromBuiltIns(options = {}) {
  const backup = options.backup !== false;
  const builtIns = getBuiltInArcPrompts() || {};
  const now = new Date().toISOString();
  const overrides = {};
  for (const [key, prompt] of Object.entries(builtIns)) {
    overrides[key] = {
      displayName:
        (BUILTIN_DISPLAY_NAMES[key] || toTitleCase(key.replace(/^arc[_-]?/, '').replace(/[_-]/g, ' ')) || generateDisplayNameFromContent(prompt)),
      prompt,
      createdAt: now,
    };
  }

  // Optional backup of existing file (using current persisted doc)
  let backupName;
  try {
    const existing = await loadOverrides();
    if (backup && existing) {
      const base = String(PROMPTS_FILE || 'stmb-arc-prompts.json').replace(/\.json$/i, '');
      const ts = now.replace(/[:.]/g, '-');
      backupName = `${base}.backup-${ts}.json`;

      const backupJson = JSON.stringify(existing, null, 2);
      const backupB64 = btoa(unescape(encodeURIComponent(backupJson)));
      const resp = await fetch('/api/files/upload', {
        method: 'POST',
        credentials: 'include',
        headers: getRequestHeaders(),
        body: JSON.stringify({ name: backupName, data: backupB64 }),
      });
      if (!resp.ok) {
        console.warn(`${MODULE_NAME}: Failed to write backup "${backupName}": ${resp.statusText}`);
      }
    }
  } catch (e) {
    console.warn(`${MODULE_NAME}: Backup step failed:`, e);
  }

  const doc = { version: SCHEMA.CURRENT_VERSION, overrides };
  await saveOverrides(doc);
  cachedOverrides = doc;

  // Notify listeners that arc presets changed
  try {
    window.dispatchEvent(new CustomEvent('stmb-arc-presets-updated'));
  } catch {
    /* noop */
  }

  return { count: Object.keys(overrides).length, backupName };
}
