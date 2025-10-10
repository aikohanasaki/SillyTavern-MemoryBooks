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
 * Validate V2 document structure (triggers-based)
 */
function validateSidePromptsFileV2(data) {
    if (!data || typeof data !== 'object') return false;
    if (typeof data.version !== 'number') return false;
    if (!data.prompts || typeof data.prompts !== 'object') return false;

    for (const [key, p] of Object.entries(data.prompts)) {
        if (!p || typeof p !== 'object') return false;
        if (p.key !== key) return false;
        if (typeof p.name !== 'string' || !p.name.trim()) return false;
        if (typeof p.enabled !== 'boolean') return false;
        if (typeof p.prompt !== 'string') return false;
        if (!p.settings || typeof p.settings !== 'object') return false;

        // triggers must exist in v2
        if (!p.triggers || typeof p.triggers !== 'object') return false;

        // onInterval validation (optional)
        if (p.triggers.onInterval != null) {
            const oi = p.triggers.onInterval;
            if (typeof oi !== 'object') return false;
            const vis = Number(oi.visibleMessages);
            if (!Number.isFinite(vis) || vis < 1) return false;
        }

        // onAfterMemory validation (optional)
        if (p.triggers.onAfterMemory != null) {
            const oam = p.triggers.onAfterMemory;
            if (typeof oam !== 'object') return false;
            if (typeof oam.enabled !== 'boolean') return false;
        }

        // commands validation (optional)
        if (p.triggers.commands != null) {
            if (!Array.isArray(p.triggers.commands)) return false;
            for (const c of p.triggers.commands) {
                if (typeof c !== 'string' || !c.trim()) return false;
            }
        }
    }

    return true;
}

/**
 * Quick check if data looks like V1 (type-based) structure
 */
function looksLikeV1(data) {
    if (!data || typeof data !== 'object') return false;
    if (!data.prompts || typeof data.prompts !== 'object') return false;

    // If any prompt has "type" and no "triggers", treat as V1
    return Object.values(data.prompts).some((p) => p && typeof p === 'object' && 'type' in p && !('triggers' in p));
}

/**
 * Migrate V1 (type-based) document to V2 (triggers-based)
 */
function migrateV1toV2(v1) {
    const createdAt = nowIso();
    const v2 = {
        version: Math.max(2, Number(v1.version || 1) + 1),
        prompts: {},
    };

    for (const [key, p] of Object.entries(v1.prompts || {})) {
        const next = {
            key,
            name: String(p.name || 'Side Prompt'),
            enabled: !!p.enabled,
            prompt: String(p.prompt != null ? p.prompt : 'this is a placeholder prompt'),
            responseFormat: String(p.responseFormat || ''),
            settings: { ...(p.settings || {}) },
            createdAt: p.createdAt || createdAt,
            updatedAt: createdAt,
            triggers: {
                onInterval: undefined,
                onAfterMemory: undefined,
                commands: ['sideprompt'],
            },
        };

        // Map types to triggers
        const type = String(p.type || '').toLowerCase();
        if (type === 'tracker') {
            const intervalVisibleMessages = Math.max(1, Number(p.settings?.intervalVisibleMessages || 50));
            next.triggers.onInterval = { visibleMessages: intervalVisibleMessages };
            // trackers don't need after-memory by default
        } else if (type === 'plotpoints') {
            const withMemories = !!(p.settings?.withMemories ?? true);
            next.triggers.onAfterMemory = { enabled: !!withMemories };
        } else if (type === 'scoreboard') {
            const withMemories = !!(p.settings?.withMemories ?? false);
            if (withMemories) {
                next.triggers.onAfterMemory = { enabled: true };
            }
            // scoreboard is primarily manual; commands already filled
        } else {
            // Unknown type: leave only manual command trigger
        }

        v2.prompts[key] = next;
    }

    return v2;
}

/**
 * Default built-in templates (V2 triggers-based, seeded with placeholder prompt)
 */
function getBuiltinTemplates() {
    const placeholder = 'this is a placeholder prompt';
    const createdAt = nowIso();

    const prompts = {};

    // Continuity Tracker (disabled by default) -> interval trigger only
    {
        const key = safeSlug('Continuity Tracker');
        prompts[key] = {
            key,
            name: 'Continuity Tracker',
            enabled: false,
            prompt: placeholder,
            responseFormat: '',
            triggers: {
                onInterval: { visibleMessages: 50 },
                // no onAfterMemory by default
                // no commands by default (can still be run via /sideprompt, but keep minimal)
                commands: ['sideprompt'],
            },
            settings: {},
            createdAt,
            updatedAt: createdAt,
        };
    }

    // Plot Points Extractor (disabled by default) -> after-memory + manual
    {
        const key = safeSlug('Plot Points Extractor');
        prompts[key] = {
            key,
            name: 'Plot Points Extractor',
            enabled: false,
            prompt: placeholder,
            responseFormat: '',
            triggers: {
                onAfterMemory: { enabled: true },
                commands: ['sideprompt'],
            },
            settings: {},
            createdAt,
            updatedAt: createdAt,
        };
    }

    // Scoreboard - Manual -> manual only
    {
        const key = safeSlug('Scoreboard - Manual');
        prompts[key] = {
            key,
            name: 'Scoreboard - Manual',
            enabled: false,
            prompt: placeholder,
            responseFormat: '',
            triggers: {
                commands: ['sideprompt'],
            },
            settings: {},
            createdAt,
            updatedAt: createdAt,
        };
    }

    // Scoreboard - With Memories (auto) -> after-memory + manual
    {
        const key = safeSlug('Scoreboard - With Memories');
        prompts[key] = {
            key,
            name: 'Scoreboard - With Memories',
            enabled: false,
            prompt: placeholder,
            responseFormat: '',
            triggers: {
                onAfterMemory: { enabled: true },
                commands: ['sideprompt'],
            },
            settings: {},
            createdAt,
            updatedAt: createdAt,
        };
    }

    return prompts;
}

/**
 * Create a new base document (V2)
 */
function createBaseDoc() {
    return {
        version: Math.max(2, SCHEMA.CURRENT_VERSION || 2),
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
 * Load document from server, creating or migrating it if missing/invalid
 */
export async function loadSidePrompts() {
    if (cachedDoc) return cachedDoc;

    let data = null;

    try {
        const res = await fetch(`/user/files/${SIDE_PROMPTS_FILE}`, {
            method: 'GET',
            credentials: 'include',
            headers: getRequestHeaders(),
        });

        if (!res.ok) {
            // Missing -> create base
            data = createBaseDoc();
            await saveDoc(data);
        } else {
            const text = await res.text();
            const parsed = JSON.parse(text);

            // If looks like old V1 -> migrate to V2
            if (looksLikeV1(parsed)) {
                console.log(`${MODULE_NAME}: Migrating side prompts file from V1(type) to V2(triggers)`);
                data = migrateV1toV2(parsed);
                await saveDoc(data);
            } else {
                // Validate as V2; if invalid generate base
                if (!validateSidePromptsFileV2(parsed)) {
                    console.warn(`${MODULE_NAME}: Invalid side prompts file structure; recreating with built-ins`);
                    data = createBaseDoc();
                    await saveDoc(data);
                } else {
                    data = parsed;
                    // If version < 2 but passes V2 validation, bump version
                    if (Number(data.version || 1) < 2) {
                        data.version = 2;
                        await saveDoc(data);
                    }
                }
            }
        }
    } catch (e) {
        console.warn(`${MODULE_NAME}: Error loading side prompts; creating base doc`, e);
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
 * Create or update a template (v2)
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
        enabled: typeof input.enabled === 'boolean' ? input.enabled : (cur?.enabled ?? false),
        prompt: String(input.prompt != null ? input.prompt : (cur?.prompt || 'this is a placeholder prompt')),
        responseFormat: String(input.responseFormat != null ? input.responseFormat : (cur?.responseFormat || '')),
        settings: { ...(cur?.settings || {}), ...(input.settings || {}) },
        triggers: input.triggers ? input.triggers : (cur?.triggers || { commands: ['sideprompt'] }),
        createdAt: cur?.createdAt || ts,
        updatedAt: ts,
    };

    // Normalize triggers for safety
    if (next.triggers.onInterval) {
        const vis = Math.max(1, Number(next.triggers.onInterval.visibleMessages || 50));
        next.triggers.onInterval = { visibleMessages: vis };
    }
    if (next.triggers.onAfterMemory) {
        next.triggers.onAfterMemory = { enabled: !!next.triggers.onAfterMemory.enabled };
    }
    if (Array.isArray(next.triggers.commands)) {
        next.triggers.commands = next.triggers.commands.filter(x => typeof x === 'string' && x.trim());
        if (next.triggers.commands.length === 0) {
            next.triggers.commands = ['sideprompt'];
        }
    } else {
        next.triggers.commands = ['sideprompt'];
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

    // Accept either strict V2 or migrate V1 on import
    let dataToSave = null;
    if (validateSidePromptsFileV2(parsed)) {
        dataToSave = parsed;
    } else if (looksLikeV1(parsed)) {
        dataToSave = migrateV1toV2(parsed);
    } else {
        throw new Error('Invalid side prompts file structure');
    }

    await saveDoc(dataToSave);
}

/**
 * Back-compat: List enabled templates by legacy type
 * - tracker => has onInterval trigger
 * - plotpoints => has onAfterMemory enabled
 * - scoreboard => has commands (manual), also onAfterMemory if originally withMemories
 */
export async function listEnabledByType(type) {
    const t = String(type || '').toLowerCase();
    const all = await listTemplates();

    if (t === 'tracker') {
        return all.filter(p => p.enabled && p.triggers?.onInterval && Number(p.triggers.onInterval.visibleMessages) >= 1);
    }
    if (t === 'plotpoints') {
        return all.filter(p => p.enabled && p.triggers?.onAfterMemory?.enabled);
    }
    if (t === 'scoreboard') {
        // enabled scoreboard historically was either manual or auto-with-memories
        return all.filter(p => p.enabled && (Array.isArray(p.triggers?.commands) || p.triggers?.onAfterMemory?.enabled));
    }
    return [];
}

/**
 * New: List templates by trigger kind
 * - 'onInterval' => interval-enabled and template.enabled === true
 * - 'onAfterMemory' => after-memory enabled and template.enabled === true
 * - 'command:<name>' => has commands including <name> (enabled flag not required for manual run)
 */
export async function listByTrigger(kind) {
    const all = await listTemplates();

    if (kind === 'onInterval') {
        return all.filter(p => p.enabled && p.triggers?.onInterval && Number(p.triggers.onInterval.visibleMessages) >= 1);
    }
    if (kind === 'onAfterMemory') {
        return all.filter(p => p.enabled && p.triggers?.onAfterMemory?.enabled);
    }
    if (kind && kind.startsWith('command:')) {
        const cmd = kind.slice('command:'.length).trim();
        return all.filter(p => Array.isArray(p.triggers?.commands) && p.triggers.commands.some(c => c.toLowerCase() === cmd.toLowerCase()));
    }
    return [];
}

/**
 * Clear cache
 */
export function clearCache() {
    cachedDoc = null;
}
