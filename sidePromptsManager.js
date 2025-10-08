import { getRequestHeaders } from '../../../../script.js';
import { FILE_NAMES, SCHEMA } from './constants.js';

const MODULE_NAME = 'STMemoryBooks-SidePromptsManager';
const SIDE_PROMPTS_FILE = FILE_NAMES.SIDE_PROMPTS_FILE;

/**
 * In-memory cache of loaded side prompts
 * @type {Object|null}
 */
let cachedDoc = null;

/**
 * Generate ISO timestamp
 */
function nowIso() {
    return new Date().toISOString();
}

/**
 * Safe slug from name
 */
function safeSlug(str) {
    return String(str || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50) || 'sideprompt';
}

/**
 * Validate document structure
 */
function validateSidePromptsFile(data) {
    if (!data || typeof data !== 'object') return false;
    if (typeof data.version !== 'number') return false;
    if (!data.prompts || typeof data.prompts !== 'object') return false;

    for (const [key, p] of Object.entries(data.prompts)) {
        if (!p || typeof p !== 'object') return false;
        if (p.key !== key) return false;
        if (typeof p.name !== 'string' || !p.name.trim()) return false;
        if (!['tracker', 'plotpoints', 'scoreboard'].includes(p.type)) return false;
        if (typeof p.enabled !== 'boolean') return false;
        if (typeof p.prompt !== 'string') return false;
        if (!p.settings || typeof p.settings !== 'object') return false;
    }
    return true;
}

/**
 * Default built-in templates (seeded with placeholder prompt)
 */
function getBuiltinTemplates() {
    const placeholder = 'this is a placeholder prompt';
    const createdAt = nowIso();

    const prompts = {};

    // Tracker (disabled by default)
    {
        const key = safeSlug('Continuity Tracker');
        prompts[key] = {
            key,
            name: 'Continuity Tracker',
            type: 'tracker',
            enabled: false,
            prompt: placeholder,
            responseFormat: '',
            settings: {
                intervalVisibleMessages: 50,
            },
            createdAt,
            updatedAt: createdAt,
        };
    }

    // Plot Points Extractor (enabled with memories by default)
    {
        const key = safeSlug('Plot Points Extractor');
        prompts[key] = {
            key,
            name: 'Plot Points Extractor',
            type: 'plotpoints',
            enabled: false,
            prompt: placeholder,
            responseFormat: '',
            settings: {
                withMemories: true,
            },
            createdAt,
            updatedAt: createdAt,
        };
    }

    // Scoreboard - Manual
    {
        const key = safeSlug('Scoreboard - Manual');
        prompts[key] = {
            key,
            name: 'Scoreboard - Manual',
            type: 'scoreboard',
            enabled: false,
            prompt: placeholder,
            responseFormat: '',
            settings: {
                withMemories: false, // manual only
            },
            createdAt,
            updatedAt: createdAt,
        };
    }

    // Scoreboard - With Memories (auto)
    {
        const key = safeSlug('Scoreboard - With Memories');
        prompts[key] = {
            key,
            name: 'Scoreboard - With Memories',
            type: 'scoreboard',
            enabled: false,
            prompt: placeholder,
            responseFormat: '',
            settings: {
                withMemories: true, // run alongside memory
            },
            createdAt,
            updatedAt: createdAt,
        };
    }

    return prompts;
}

/**
 * Create a new base document
 */
function createBaseDoc() {
    return {
        version: SCHEMA.CURRENT_VERSION,
        prompts: getBuiltinTemplates(),
    };
}

/**
 * Save document to server
 */
async function saveDoc(doc) {
    const json = JSON.stringify(doc, null, 2);
    const base64 = btoa(unescape(encodeURIComponent(json)));

    const res = await fetch('/api/files/upload', {
        method: 'POST',
        credentials: 'include',
        headers: getRequestHeaders(),
        body: JSON.stringify({
            name: SIDE_PROMPTS_FILE,
            data: base64,
        }),
    });

    if (!res.ok) {
        throw new Error(`Failed to save side prompts: ${res.status} ${res.statusText}`);
    }

    cachedDoc = doc;
    console.log(`${MODULE_NAME}: Side prompts saved successfully`);
}

/**
 * Load document from server, creating it with built-ins if missing/invalid
 */
export async function loadSidePrompts() {
    if (cachedDoc) return cachedDoc;

    let mustWrite = false;
    let data = null;

    try {
        const res = await fetch(`/user/files/${SIDE_PROMPTS_FILE}`, {
            method: 'GET',
            credentials: 'include',
            headers: getRequestHeaders(),
        });

        if (!res.ok) {
            mustWrite = true;
        } else {
            const text = await res.text();
            data = JSON.parse(text);
            if (!validateSidePromptsFile(data)) {
                mustWrite = true;
            }
        }
    } catch (e) {
        mustWrite = true;
    }

    if (mustWrite) {
        data = createBaseDoc();
        await saveDoc(data);
    }

    cachedDoc = data;
    return cachedDoc;
}

/**
 * First-run init to ensure file exists
 */
export async function firstRunInitIfMissing() {
    await loadSidePrompts();
    return true;
}

/**
 * List all templates (sorted by updatedAt desc)
 */
export async function listTemplates() {
    const data = await loadSidePrompts();
    const list = Object.values(data.prompts);
    list.sort((a, b) => {
        const at = a.updatedAt || a.createdAt || '';
        const bt = b.updatedAt || b.createdAt || '';
        return bt.localeCompare(at);
    });
    return list;
}

/**
 * Get template by key
 */
export async function getTemplate(key) {
    const data = await loadSidePrompts();
    return data.prompts[key] || null;
}

/**
 * Find template by display name (case-insensitive), preferring exact match
 */
export async function findTemplateByName(name) {
    const data = await loadSidePrompts();
    const target = String(name || '').trim().toLowerCase();
    if (!target) return null;

    // exact match
    for (const p of Object.values(data.prompts)) {
        if (p.name.toLowerCase() === target) return p;
    }
    // starts with
    for (const p of Object.values(data.prompts)) {
        if (p.name.toLowerCase().startsWith(target)) return p;
    }
    // contains
    for (const p of Object.values(data.prompts)) {
        if (p.name.toLowerCase().includes(target)) return p;
    }
    return null;
}

/**
 * Create or update a template
 */
export async function upsertTemplate(input) {
    const data = await loadSidePrompts();
    const isNew = !input.key;
    const key = input.key || safeSlug(input.name || 'Side Prompt');
    const ts = nowIso();

    const cur = data.prompts[key];
    const next = {
        key,
        name: String(input.name || (cur?.name || 'Side Prompt')),
        type: input.type || cur?.type || 'tracker',
        enabled: typeof input.enabled === 'boolean' ? input.enabled : (cur?.enabled ?? false),
        prompt: String(input.prompt != null ? input.prompt : (cur?.prompt || 'this is a placeholder prompt')),
        responseFormat: String(input.responseFormat != null ? input.responseFormat : (cur?.responseFormat || '')),
        settings: { ...(cur?.settings || {}), ...(input.settings || {}) },
        createdAt: cur?.createdAt || ts,
        updatedAt: ts,
    };

    // Validate type-specific defaults
    if (next.type === 'tracker') {
        next.settings.intervalVisibleMessages = Math.max(1, Number(next.settings.intervalVisibleMessages || 50));
    } else if (next.type === 'plotpoints') {
        next.settings.withMemories = !!(next.settings.withMemories ?? true);
    } else if (next.type === 'scoreboard') {
        next.settings.withMemories = !!(next.settings.withMemories ?? false);
    }

    data.prompts[key] = next;
    await saveDoc(data);
    return key;
}

/**
 * Duplicate a template
 */
export async function duplicateTemplate(sourceKey) {
    const data = await loadSidePrompts();
    const src = data.prompts[sourceKey];
    if (!src) throw new Error(`Template "${sourceKey}" not found`);

    let base = `${src.name} (Copy)`;
    let key = safeSlug(base);
    let suffix = 2;
    while (data.prompts[key]) {
        key = safeSlug(`${base} ${suffix}`);
        suffix++;
    }

    const ts = nowIso();
    data.prompts[key] = {
        ...src,
        key,
        name: base,
        createdAt: ts,
        updatedAt: ts,
    };
    await saveDoc(data);
    return key;
}

/**
 * Remove a template
 */
export async function removeTemplate(key) {
    const data = await loadSidePrompts();
    if (!data.prompts[key]) throw new Error(`Template "${key}" not found`);
    delete data.prompts[key];
    await saveDoc(data);
}

/**
 * Export current doc JSON
 */
export async function exportToJSON() {
    const data = await loadSidePrompts();
    return JSON.stringify(data, null, 2);
}

/**
 * Import JSON (overwrites file after validation)
 */
export async function importFromJSON(jsonString) {
    const parsed = JSON.parse(jsonString);
    if (!validateSidePromptsFile(parsed)) {
        throw new Error('Invalid side prompts file structure');
    }
    await saveDoc(parsed);
}

/**
 * List enabled templates by type
 */
export async function listEnabledByType(type) {
    const list = await listTemplates();
    return list.filter(p => p.type === type && p.enabled);
}

/**
 * Clear cache
 */
export function clearCache() {
    cachedDoc = null;
}
