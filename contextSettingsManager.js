import { getRequestHeaders } from '../../../../script.js';
import { translate } from '../../../i18n.js';
import { loadWorldInfo, world_names } from '../../../world-info.js';
import { FILE_NAMES } from './constants.js';
import {
    normalizeAdditionalContextEntries,
    getLorebookEntryDisplayName,
    getLorebookEntryByUid,
} from './utils.js';

const MODULE_NAME = 'STMemoryBooks-ContextSettingsManager';
const CONTEXT_SETTINGS_FILE = FILE_NAMES.CONTEXT_SETTINGS_FILE;

export const CONTEXT_NONE_KEY = '__none__';

let cachedDoc = null;

function nowIso() {
    return new Date().toISOString();
}

function safeSlug(str, fallback = 'context-setting') {
    return String(str || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50) || fallback;
}

function makeContextSettingKey(baseName = 'context-setting', existing = {}) {
    const base = safeSlug(baseName, 'context-setting');
    let candidate = `${base}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    while (candidate === CONTEXT_NONE_KEY || existing[candidate]) {
        candidate = `${base}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    }
    return candidate;
}

function createBaseDoc() {
    return {
        version: 1,
        settings: {},
        migration: {
            additionalContextByProfileKey: {},
        },
    };
}

function normalizeSetting(raw, key, ts = nowIso()) {
    const finalKey = String(raw?.key || key || '').trim();
    if (!finalKey || finalKey === CONTEXT_NONE_KEY) return null;
    return {
        key: finalKey,
        name: String(raw?.name || '').trim() || translate('Untitled Context Setting', 'STMemoryBooks_ContextSettings_Untitled'),
        entries: normalizeAdditionalContextEntries(raw?.entries),
        createdAt: raw?.createdAt || ts,
        updatedAt: raw?.updatedAt || ts,
    };
}

function normalizeDoc(raw) {
    const data = raw && typeof raw === 'object' ? raw : createBaseDoc();
    data.version = Number.isFinite(Number(data.version)) ? Number(data.version) : 1;
    if (!data.settings || typeof data.settings !== 'object' || Array.isArray(data.settings)) {
        data.settings = {};
    }
    if (!data.migration || typeof data.migration !== 'object' || Array.isArray(data.migration)) {
        data.migration = {};
    }
    if (!data.migration.additionalContextByProfileKey || typeof data.migration.additionalContextByProfileKey !== 'object' || Array.isArray(data.migration.additionalContextByProfileKey)) {
        data.migration.additionalContextByProfileKey = {};
    }

    const normalizedSettings = {};
    for (const [key, setting] of Object.entries(data.settings)) {
        const normalized = normalizeSetting(setting, key, setting?.updatedAt || nowIso());
        if (normalized) normalizedSettings[normalized.key] = normalized;
    }
    data.settings = normalizedSettings;

    const normalizedMigration = {};
    for (const [profileKey, record] of Object.entries(data.migration.additionalContextByProfileKey)) {
        const normalizedProfileKey = String(profileKey || '').trim();
        const contextSettingKey = String(record?.contextSettingKey || '').trim();
        if (!normalizedProfileKey || !contextSettingKey || contextSettingKey === CONTEXT_NONE_KEY) continue;
        normalizedMigration[normalizedProfileKey] = {
            contextSettingKey,
            originalProfileName: String(record?.originalProfileName || '').trim(),
            migratedAt: record?.migratedAt || nowIso(),
        };
    }
    data.migration.additionalContextByProfileKey = normalizedMigration;
    return data;
}

function validateDoc(data) {
    if (!data || typeof data !== 'object') return false;
    if (!data.settings || typeof data.settings !== 'object' || Array.isArray(data.settings)) return false;
    if (!data.migration || typeof data.migration !== 'object' || Array.isArray(data.migration)) return false;
    if (!data.migration.additionalContextByProfileKey || typeof data.migration.additionalContextByProfileKey !== 'object' || Array.isArray(data.migration.additionalContextByProfileKey)) return false;

    for (const [key, setting] of Object.entries(data.settings)) {
        if (!setting || typeof setting !== 'object') return false;
        if (setting.key !== key || key === CONTEXT_NONE_KEY) return false;
        if (typeof setting.name !== 'string' || !setting.name.trim()) return false;
        if (!Array.isArray(setting.entries)) return false;
        const normalized = normalizeAdditionalContextEntries(setting.entries);
        if (JSON.stringify(setting.entries) !== JSON.stringify(normalized)) return false;
    }

    for (const [profileKey, record] of Object.entries(data.migration.additionalContextByProfileKey)) {
        if (!String(profileKey || '').trim()) return false;
        if (!record || typeof record !== 'object') return false;
        const contextSettingKey = String(record.contextSettingKey || '').trim();
        if (!contextSettingKey || contextSettingKey === CONTEXT_NONE_KEY) return false;
    }
    return true;
}

async function saveDoc(doc) {
    const normalized = normalizeDoc(doc);
    const json = JSON.stringify(normalized, null, 2);
    const base64 = btoa(unescape(encodeURIComponent(json)));
    const res = await fetch('/api/files/upload', {
        method: 'POST',
        credentials: 'include',
        headers: getRequestHeaders(),
        body: JSON.stringify({
            name: CONTEXT_SETTINGS_FILE,
            data: base64,
        }),
    });

    if (!res.ok) {
        throw new Error(`Failed to save context settings: ${res.status} ${res.statusText}`);
    }

    cachedDoc = normalized;
    return normalized;
}

export async function loadContextSettings(options = {}) {
    if (cachedDoc && !options.forceReload) return cachedDoc;

    let data = null;
    try {
        const res = await fetch(`/user/files/${CONTEXT_SETTINGS_FILE}`, {
            method: 'GET',
            credentials: 'include',
            headers: getRequestHeaders(),
        });
        if (!res.ok) {
            if (options.readOnly) {
                throw new Error(`Context settings file could not be loaded: ${res.status} ${res.statusText}`);
            }
            data = createBaseDoc();
            await saveDoc(data);
        } else {
            const text = await res.text();
            const parsed = normalizeDoc(JSON.parse(text));
            if (!validateDoc(parsed)) {
                if (options.readOnly) {
                    throw new Error('Context settings file failed validation.');
                }
                console.warn(`${MODULE_NAME}: Invalid context settings file; using a clean document.`);
                data = createBaseDoc();
                await saveDoc(data);
            } else {
                data = parsed;
            }
        }
    } catch (error) {
        if (options.readOnly) {
            throw error;
        }
        console.warn(`${MODULE_NAME}: Error loading context settings; using a clean document.`, error);
        data = createBaseDoc();
        await saveDoc(data);
    }

    cachedDoc = data;
    return cachedDoc;
}

export async function listContextSettings() {
    const data = await loadContextSettings();
    const list = Object.values(data.settings || {});
    list.sort((a, b) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || '')));
    return list;
}

export async function getContextSetting(key) {
    const normalizedKey = String(key || '').trim();
    if (!normalizedKey || normalizedKey === CONTEXT_NONE_KEY) return null;
    const data = await loadContextSettings();
    return data.settings?.[normalizedKey] || null;
}

export async function upsertContextSetting(input = {}) {
    const data = await loadContextSettings();
    const ts = nowIso();
    const isNew = !String(input.key || '').trim();
    const key = isNew
        ? makeContextSettingKey(input.name || 'context-setting', data.settings)
        : String(input.key || '').trim();
    if (!key || key === CONTEXT_NONE_KEY) {
        throw new Error('Invalid context setting key.');
    }

    const prev = data.settings[key];
    const next = normalizeSetting({
        key,
        name: String(input.name ?? prev?.name ?? '').trim() || translate('Untitled Context Setting', 'STMemoryBooks_ContextSettings_Untitled'),
        entries: Array.isArray(input.entries) ? input.entries : (prev?.entries || []),
        createdAt: prev?.createdAt || ts,
        updatedAt: ts,
    }, key, ts);

    data.settings[key] = next;
    await saveDoc(data);
    return key;
}

export async function duplicateContextSetting(sourceKey) {
    const data = await loadContextSettings();
    const src = data.settings?.[sourceKey];
    if (!src) throw new Error(`Context setting "${sourceKey}" not found`);
    const ts = nowIso();
    const name = `${src.name} (Copy)`;
    const key = makeContextSettingKey(name, data.settings);
    data.settings[key] = normalizeSetting({
        key,
        name,
        entries: src.entries || [],
        createdAt: ts,
        updatedAt: ts,
    }, key, ts);
    await saveDoc(data);
    return key;
}

export async function removeContextSetting(key) {
    const data = await loadContextSettings();
    const normalizedKey = String(key || '').trim();
    if (!data.settings?.[normalizedKey]) throw new Error(`Context setting "${normalizedKey}" not found`);
    delete data.settings[normalizedKey];
    await saveDoc(data);
}

export async function exportContextSettingsJSON() {
    const data = await loadContextSettings();
    return JSON.stringify(data, null, 2);
}

export async function importContextSettingsJSON(json) {
    const incoming = normalizeDoc(JSON.parse(json));
    if (!validateDoc(incoming)) {
        throw new Error('Invalid context settings file structure.');
    }
    const existing = await loadContextSettings();
    const merged = normalizeDoc(existing);

    for (const setting of Object.values(incoming.settings || {})) {
        let key = setting.key;
        if (!key || key === CONTEXT_NONE_KEY || merged.settings[key]) {
            key = makeContextSettingKey(setting.name, merged.settings);
        }
        merged.settings[key] = normalizeSetting({ ...setting, key }, key, setting.updatedAt || nowIso());
    }

    await saveDoc(merged);
}

export async function getMigratedContextSettingKeyForProfile(profile) {
    const profileKey = String(profile?.profileKey || '').trim();
    if (!profileKey) return '';
    const data = await loadContextSettings();
    return String(data.migration?.additionalContextByProfileKey?.[profileKey]?.contextSettingKey || '').trim();
}

export async function resolveContextEntryRows(refs) {
    const normalized = normalizeAdditionalContextEntries(refs);
    const cache = new Map();
    const rows = [];

    for (const ref of normalized) {
        let staleReason = '';
        let title = '';
        try {
            if (!Array.isArray(world_names) || !world_names.includes(ref.lorebookName)) {
                staleReason = translate('Missing lorebook', 'STMemoryBooks_Profile_AlsoIncludeMissingLorebook');
            } else {
                if (!cache.has(ref.lorebookName)) {
                    cache.set(ref.lorebookName, await loadWorldInfo(ref.lorebookName));
                }
                const entry = getLorebookEntryByUid(cache.get(ref.lorebookName), ref.uid);
                if (entry) {
                    title = getLorebookEntryDisplayName(entry, ref.uid);
                } else {
                    staleReason = translate('Missing entry', 'STMemoryBooks_Profile_AlsoIncludeMissingEntry');
                }
            }
        } catch (error) {
            console.warn(`${MODULE_NAME}: Failed to resolve context setting entry`, ref, error);
            staleReason = translate('Load failed', 'STMemoryBooks_Profile_AlsoIncludeLoadFailedShort');
        }
        rows.push({
            ...ref,
            title: title || String(ref.uid),
            staleReason,
        });
    }
    return rows;
}

export async function resolveContextSettingEntriesFromRefs(refs) {
    const normalized = normalizeAdditionalContextEntries(refs);
    if (normalized.length === 0) return { entries: [], skipped: [] };

    const cache = new Map();
    const entries = [];
    const skipped = [];
    for (const ref of normalized) {
        try {
            if (!Array.isArray(world_names) || !world_names.includes(ref.lorebookName)) {
                skipped.push({ ...ref, reason: 'missing-lorebook' });
                continue;
            }
            if (!cache.has(ref.lorebookName)) {
                cache.set(ref.lorebookName, await loadWorldInfo(ref.lorebookName));
            }
            const entry = getLorebookEntryByUid(cache.get(ref.lorebookName), ref.uid);
            if (!entry) {
                skipped.push({ ...ref, reason: 'missing-entry' });
                continue;
            }
            entries.push({
                lorebookName: ref.lorebookName,
                uid: ref.uid,
                title: getLorebookEntryDisplayName(entry, ref.uid),
                content: String(entry.content || '').trim(),
            });
        } catch (error) {
            console.warn(`${MODULE_NAME}: Failed to resolve context setting entry`, ref, error);
            skipped.push({ ...ref, reason: 'load-failed' });
        }
    }
    return { entries, skipped };
}

export async function resolveContextSettingEntries(settingOrKey) {
    const setting = typeof settingOrKey === 'string'
        ? await getContextSetting(settingOrKey)
        : settingOrKey;
    if (!setting) return { entries: [], skipped: [], missing: true };
    const resolved = await resolveContextSettingEntriesFromRefs(setting.entries);
    return { ...resolved, missing: false, setting };
}

function verifyMigration(originalKeys, profiles, doc) {
    if (!validateDoc(doc)) return false;
    for (const key of originalKeys) {
        if (!doc.settings[key]) return false;
    }
    for (const profile of profiles) {
        const refs = normalizeAdditionalContextEntries(profile?.additionalContextEntries);
        if (refs.length === 0) continue;
        const profileKey = String(profile?.profileKey || '').trim();
        const record = doc.migration.additionalContextByProfileKey[profileKey];
        if (!record?.contextSettingKey || !doc.settings[record.contextSettingKey]) return false;
        const setting = doc.settings[record.contextSettingKey];
        if (JSON.stringify(setting.entries) !== JSON.stringify(normalizeAdditionalContextEntries(setting.entries))) return false;
    }
    return true;
}

export async function migrateProfileAdditionalContext(settings) {
    const profiles = Array.isArray(settings?.profiles) ? settings.profiles : [];
    if (profiles.length === 0) return { migrated: 0, removedLegacy: 0, verified: true };

    const doc = await loadContextSettings();
    const originalKeys = new Set(Object.keys(doc.settings || {}));
    let changed = false;
    let migrated = 0;

    for (const profile of profiles) {
        const entries = normalizeAdditionalContextEntries(profile?.additionalContextEntries);
        if (entries.length === 0) continue;
        const profileKey = String(profile?.profileKey || '').trim();
        if (!profileKey) {
            console.warn(`${MODULE_NAME}: Cannot migrate Additional Context for profile without profileKey:`, profile?.name);
            continue;
        }

        const existingRecord = doc.migration.additionalContextByProfileKey[profileKey];
        if (existingRecord?.contextSettingKey && doc.settings?.[existingRecord.contextSettingKey]) {
            continue;
        }

        const settingName = `${String(profile?.name || translate('Profile', 'STMemoryBooks_Profile')).trim()} - ${translate('Additional Context', 'STMemoryBooks_ContextSettings_AdditionalContext')}`;
        const key = makeContextSettingKey(settingName, doc.settings);
        const ts = nowIso();
        doc.settings[key] = normalizeSetting({
            key,
            name: settingName,
            entries,
            createdAt: ts,
            updatedAt: ts,
        }, key, ts);
        doc.migration.additionalContextByProfileKey[profileKey] = {
            contextSettingKey: key,
            originalProfileName: String(profile?.name || '').trim(),
            migratedAt: ts,
        };
        changed = true;
        migrated++;
    }

    if (!changed) {
        const verifiedExisting = verifyMigration(originalKeys, profiles, doc);
        if (!verifiedExisting) {
            return { migrated: 0, removedLegacy: 0, verified: false };
        }
        let removedExistingLegacy = 0;
        for (const profile of profiles) {
            const entries = normalizeAdditionalContextEntries(profile?.additionalContextEntries);
            if (entries.length === 0) continue;
            const profileKey = String(profile?.profileKey || '').trim();
            const record = doc.migration.additionalContextByProfileKey[profileKey];
            if (record?.contextSettingKey && doc.settings?.[record.contextSettingKey]) {
                delete profile.additionalContextEntries;
                removedExistingLegacy++;
            }
        }
        return { migrated: 0, removedLegacy: removedExistingLegacy, verified: true };
    }

    await saveDoc(doc);
    let reloaded;
    try {
        reloaded = await loadContextSettings({ forceReload: true, readOnly: true });
    } catch (error) {
        console.warn(`${MODULE_NAME}: Context settings reload verification failed; leaving legacy profile Additional Context intact.`, error);
        return { migrated, removedLegacy: 0, verified: false };
    }
    const verified = verifyMigration(originalKeys, profiles, reloaded);
    if (!verified) {
        console.warn(`${MODULE_NAME}: Context setting migration verification failed; leaving legacy profile Additional Context intact.`);
        return { migrated, removedLegacy: 0, verified: false };
    }

    let removedLegacy = 0;
    for (const profile of profiles) {
        const entries = normalizeAdditionalContextEntries(profile?.additionalContextEntries);
        if (entries.length === 0) continue;
        const profileKey = String(profile?.profileKey || '').trim();
        const record = reloaded.migration.additionalContextByProfileKey[profileKey];
        if (record?.contextSettingKey && reloaded.settings?.[record.contextSettingKey]) {
            delete profile.additionalContextEntries;
            removedLegacy++;
        }
    }

    return { migrated, removedLegacy, verified: true };
}
