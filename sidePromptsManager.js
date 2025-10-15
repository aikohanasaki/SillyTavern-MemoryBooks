import { getRequestHeaders } from '../../../../script.js';
import { FILE_NAMES, SCHEMA } from './constants.js';
import { t } from './i18n.js';

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
 * Default built-in templates
 */
function getBuiltinTemplates() {
    const createdAt = nowIso();
    const prompts = {};
    {
        const key = safeSlug('Plotpoints');
        prompts[key] = {
            key,
            name: t('STMemoryBooks_Plotpoints', 'Plotpoints'),
            enabled: false,
            prompt: t('STMemoryBooks_PlotpointsPrompt', "Analyze the accompanying scene for plot threads, story arcs, and other narrative movements. The previous scenes are there to provide context. Generate a story thread report. If a report already exists in context, update it instead of recreating."),
            responseFormat: "=== Plot Points ===\n(as of [point in the story when this analysis was done])\n\n[Overarching Plot Arc]\n(2-3 sentence summary of the superobjective or major plot)\n\n[Thread #1 Title]\n- Summary: (1 sentence)\n- Status: (active / on hold)\n- At Stake: (how resolution will affect the ongoing story)\n- Last Known: (location or time)\n- Key Characters: ...\n\n\n[Thread #2 Title]\n- Summary: (1 sentence)\n- Status: (active / on hold)\n- At Stake: (how resolution will affect the ongoing story)\n- Last Known: (location or time)\n- Key Characters: ...\n\n...\n\n-- Plot Hooks --\n- (new or potential plot hooks)\n\n-- Character Dynamics --\n- current status of {{user}}'s/{{char}}'s relationships with NPCs\n\n===End Plot Points===\n",
            settings: {
                overrideProfileEnabled: false,
                lorebook: {
                constVectMode: "blue",
                position: 5,
                orderMode: "manual",
                orderValue: 25,
                preventRecursion: true,
                delayUntilRecursion: false
                }
            },
            triggers: {
                onAfterMemory: {
                enabled: true
                },
                commands: [
                "sideprompt"
                ]
            },
            createdAt,
            updatedAt: createdAt,
        };
    };    
    {
        const key = safeSlug('Status');
        prompts[key] = {
            key,
            name: t('STMemoryBooks_Status', 'Status'),
            enabled: false,
            prompt: t('STMemoryBooks_StatusPrompt', "Analyze all context (previous scenes, memories, lore, history, interactions) to generate a detailed analysis of {{user}} and {{char}} (including abbreviated !lovefactor and !lustfactor commands). Note: If there is a pre-existing !status report, update it, do not regurgitate it."),
            responseFormat: "Follow this general format:\n\n## Witty Headline or Summary\n\n### AFFINITY (0-100, have some relationship with !lovefactor and !lustfactor)\n- Score with evidence\n- Recent changes \n- Supporting quotes\n- Anything else that might be illustrative of the current affinity\n\n### LOVEFACTOR and LUSTFACTOR\n(!lovefactor and !lustfactor reports go here)\n\n### RELATIONSHIP STATUS (negative = enemies, 0 = strangers, 100 = life partners)\n- Trust/boundaries/communication\n- Key events\n- Issues\n- Any other pertinent points\n\n### GOALS\n- Short/long-term objectives\n- Progress/obstacles\n- Growth areas\n- Any other pertinent points\n\n### ANALYSIS\n- Psychology/POV\n- Development/triggers\n- Story suggestions\n- Any other pertinent points\n\n### WRAP-UP\n- OOC Summary (1 paragraph)",
            settings: {
                overrideProfileEnabled: false,
                lorebook: {
                constVectMode: "link",
                position: 5,
                orderMode: "manual",
                orderValue: 25,
                preventRecursion: true,
                delayUntilRecursion: false
                }
            },
            triggers: {
                onAfterMemory: {
                enabled: true
                },
                commands: [
                "sideprompt"
                ]
            },
            createdAt,
            updatedAt: createdAt,
        };
    };    
    {
        const key = safeSlug('Cast');
        prompts[key] = {
            key,
            name: t('STMemoryBooks_CastOfCharacters', 'Cast of Characters'),
            enabled: false,
            prompt: t('STMemoryBooks_CastOfCharactersPrompt', "You are a skilled reporter with a clear eye for judging the importance of NPCs to the plot. \nStep 1: Review the scene and either add or update plot-related NPCs to the NPC WHO'S WHO report. Please note that {{char}} and {{user}} are major characters and do NOT need to be included in this report.\nStep 2: This list should be kept in order of importance to the plot, so it may need to be reordered.\nStep 3: If your response would be more than 2000 tokens long, remove NPCs with the least impact to the plot."),
            responseFormat: "===NPC WHO'S WHO===\n(In order of importance to the plot)\n\nPerson 1: 1-2 sentence desription\nPerson 2: 1-2 sentence desription\n===END NPC WHO'S WHO===",
            settings: {
                overrideProfileEnabled: false,
                lorebook: {
                constVectMode: "blue",
                position: 5,
                orderMode: "manual",
                orderValue: 15,
                preventRecursion: true,
                delayUntilRecursion: false
                }
            },
            triggers: {
                onAfterMemory: {
                enabled: true
                },
                commands: [
                "sideprompt"
                ]
            },
            createdAt,
            updatedAt: createdAt,
        };
    };    
    {
        const key = safeSlug('Assess');
        prompts[key] = {
            key,
            name: t('STMemoryBooks_Assess', 'Assess'),
            enabled: false,
            prompt: t('STMemoryBooks_AssessPrompt', "Assess the interaction between {{char}} and {{user}} to date. List all the information {{char}} has learned about {{user}} through observation, questioning, or drawing conclusions from interaction (similar to a mental \"note to self\"). If there is already a list, update it. Try to keep it token-efficient and compact, focused on the important things."),
            responseFormat: "Use this format: \n=== Things {{char}} has learned about {{user}} ===\n(detailed list, in {{char}}'s POV/tone of voice)\n===",
            settings: {
                overrideProfileEnabled: false,
                lorebook: {
                constVectMode: "blue",
                position: 5,
                orderMode: "manual",
                orderValue: 30,
                preventRecursion: true,
                delayUntilRecursion: false
                }
            },
            triggers: {
                onAfterMemory: {
                enabled: true
                },
                commands: [
                "sideprompt"
                ]
            },
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
        throw new Error(t('STMemoryBooks_FailedToSaveSidePrompts', 'Failed to save side prompts: {{status}} {{statusText}}', { status: res.status, statusText: res.statusText }));
    }

    cachedDoc = doc;
    console.log(`${MODULE_NAME}: ${t('STMemoryBooks_SidePromptsSaved', 'Side prompts saved successfully')}`);
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
                console.log(`${MODULE_NAME}: ${t('STMemoryBooks_MigratingSidePrompts', 'Migrating side prompts file from V1(type) to V2(triggers)')}`);
                data = migrateV1toV2(parsed);
                await saveDoc(data);
            } else {
                // Validate as V2; if invalid generate base
                if (!validateSidePromptsFileV2(parsed)) {
                    console.warn(`${MODULE_NAME}: ${t('STMemoryBooks_InvalidSidePromptsFile', 'Invalid side prompts file structure; recreating with built-ins')}`);
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
        console.warn(`${MODULE_NAME}: ${t('STMemoryBooks_ErrorLoadingSidePrompts', 'Error loading side prompts; creating base doc')}`, e);
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
    const raw = String(name || '').trim();
    if (!raw) return null;

    const targetLower = raw.toLowerCase();
    const targetSlug = safeSlug(raw);
    const targetNorm = targetLower.replace(/[^a-z0-9]+/g, ' ').trim();

    const templates = Object.values(data.prompts);

    // 1) Exact matches: name, key, or slug
    for (const p of templates) {
        const nameLower = String(p.name || '').toLowerCase();
        const keyLower = String(p.key || '').toLowerCase();
        const nameSlug = safeSlug(p.name || '');
        if (nameLower === targetLower || keyLower === targetLower || nameSlug === targetSlug) {
            return p;
        }
    }

    // 2) Starts-with matches: name, slug, or key
    for (const p of templates) {
        const nameLower = String(p.name || '').toLowerCase();
        const keyLower = String(p.key || '').toLowerCase();
        const nameSlug = safeSlug(p.name || '');
        if (nameLower.startsWith(targetLower) || nameSlug.startsWith(targetSlug) || keyLower.startsWith(targetLower)) {
            return p;
        }
    }

    // 3) Contains matches with normalization tolerance
    for (const p of templates) {
        const nameLower = String(p.name || '').toLowerCase();
        const nameSlug = safeSlug(p.name || '');
        const nameNorm = nameLower.replace(/[^a-z0-9]+/g, ' ').trim();
        if (
            nameLower.includes(targetLower) ||
            nameSlug.includes(targetSlug) ||
            (targetNorm && nameNorm.includes(targetNorm))
        ) {
            return p;
        }
    }

    return null;
}

/**
 * Create or update a template (v2)
 */
export async function upsertTemplate(input) {
    const data = await loadSidePrompts();
    const isNew = !input.key;
    const ts = nowIso();

    // Determine final display name with safe default
    const requestedName = String(input.name ?? '').trim();
    const cur = isNew ? null : data.prompts[input.key];
    const finalName = requestedName || (isNew ? t('STMemoryBooks_UntitledSidePrompt', 'Untitled Side Prompt') : (cur?.name || t('STMemoryBooks_UntitledSidePrompt', 'Untitled Side Prompt')));

    // Determine key (preserve existing on edit; generate unique on create)
    let key;
    if (input.key) {
        key = input.key;
    } else {
        const base = safeSlug(finalName || t('STMemoryBooks_UntitledSidePrompt', 'Untitled Side Prompt'));
        let candidate = base;
        let suffix = 2;
        while (data.prompts[candidate]) {
            candidate = safeSlug(`${finalName} ${suffix}`);
            suffix++;
        }
        key = candidate;
    }

    const prev = data.prompts[key];
    const next = {
        key,
        name: finalName,
        enabled: typeof input.enabled === 'boolean' ? input.enabled : (prev?.enabled ?? false),
        prompt: String(input.prompt != null ? input.prompt : (prev?.prompt || 'this is a placeholder prompt')),
        responseFormat: String(input.responseFormat != null ? input.responseFormat : (prev?.responseFormat || '')),
        settings: { ...(prev?.settings || {}), ...(input.settings || {}) },
        triggers: input.triggers ? input.triggers : (prev?.triggers || { commands: ['sideprompt'] }),
        createdAt: prev?.createdAt || ts,
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
    if ('commands' in next.triggers) {
        if (Array.isArray(next.triggers.commands)) {
            next.triggers.commands = next.triggers.commands.filter(x => typeof x === 'string' && x.trim());
            // If the user cleared it intentionally, keep it empty to mean “no manual command”
        } else {
            // Explicitly provided but not an array => treat as disabled
            next.triggers.commands = [];
        }
    } else {
        // commands not provided at all (legacy/programmatic): default to manual for back-compat
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
    if (!src) throw new Error(t('STMemoryBooks_TemplateNotFound', 'Template "{{key}}" not found', { key: sourceKey }));

    let base = t('STMemoryBooks_CopyOfTemplate', '{{name}} (Copy)', { name: src.name });
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
    if (!data.prompts[key]) throw new Error(t('STMemoryBooks_TemplateNotFound', 'Template "{{key}}" not found', { key }));
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
 * Import JSON (additively merges into existing prompts; does not overwrite)
 */
export async function importFromJSON(jsonString) {
    const parsed = JSON.parse(jsonString);

    // Accept either strict V2 or migrate V1 on import
    let incoming = null;
    if (validateSidePromptsFileV2(parsed)) {
        incoming = parsed;
    } else if (looksLikeV1(parsed)) {
        incoming = migrateV1toV2(parsed);
    } else {
        throw new Error(t('STMemoryBooks_InvalidSidePromptsJSON', 'Invalid side prompts file structure'));
    }

    // Load existing and merge additively
    const existing = await loadSidePrompts();
    const merged = {
        version: Math.max(2, Number(existing.version || 2), Number(incoming.version || 2)),
        prompts: { ...existing.prompts },
    };

    // Utility to ensure a unique key in merged.prompts without overwriting existing entries
    const ensureUniqueKey = (desiredKey, name) => {
        const baseName = String(name || '').trim() || desiredKey || 'sideprompt';
        const base = safeSlug(baseName);
        let candidate = desiredKey && !merged.prompts[desiredKey] ? desiredKey : base;
        if (!candidate) candidate = 'sideprompt';
        let suffix = 2;
        while (merged.prompts[candidate]) {
            candidate = safeSlug(`${baseName} ${suffix}`);
            suffix++;
        }
        return candidate;
    };

    let added = 0;
    let renamed = 0;

    for (const [key, p] of Object.entries(incoming.prompts || {})) {
        // If an entry with the same key already exists, do not overwrite; add with a new unique key
        const finalKey = merged.prompts[key] ? ensureUniqueKey(null, p?.name || key) : key;
        if (finalKey !== key) {
            renamed++;
        }

        const ts = nowIso();
        const next = {
            key: finalKey,
            name: String(p.name || 'Side Prompt'),
            enabled: !!p.enabled,
            prompt: String(p.prompt != null ? p.prompt : 'this is a placeholder prompt'),
            responseFormat: String(p.responseFormat || ''),
            settings: { ...(p.settings || {}) },
            triggers: p.triggers ? { ...p.triggers } : { commands: ['sideprompt'] },
            createdAt: p.createdAt || ts,
            updatedAt: ts,
        };

        // Normalize triggers similar to upsert safety
        if (next.triggers.onInterval) {
            const vis = Math.max(1, Number(next.triggers.onInterval.visibleMessages || 50));
            next.triggers.onInterval = { visibleMessages: vis };
        }
        if (next.triggers.onAfterMemory) {
            next.triggers.onAfterMemory = { enabled: !!next.triggers.onAfterMemory.enabled };
        }
        if ('commands' in next.triggers) {
            if (Array.isArray(next.triggers.commands)) {
                next.triggers.commands = next.triggers.commands.filter(x => typeof x === 'string' && x.trim());
            } else {
                next.triggers.commands = [];
            }
        } else {
            next.triggers.commands = ['sideprompt'];
        }

        merged.prompts[finalKey] = next;
        added++;
    }

    await saveDoc(merged);
    return { added, renamed };
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
