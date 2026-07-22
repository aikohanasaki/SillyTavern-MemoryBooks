// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// sceneCharacterFilter.js — Phase 4 (P4.2): per-scene character presence filtering.
//
// Plan §4.4: "Character/location entries: side prompts, rewritten in place,
// filtered to characters present in the just-processed scene (check
// stloCharacterFilters.js first; else cheap name-scan). Caps calls and drift."
//
// This module answers two questions:
//   1. Who is present in the just-compiled scene?
//   2. Given a list of resolved side-prompt run items (each optionally
//      carrying a `{{char}}` runtime macro binding when character-scoped),
//      which of them should actually run because their bound character
//      appears in the scene?
//
// "Character-scoped" here means a run item whose runtimeMacros carries a
// `{{char}}` token — i.e. the item was expanded per-group-member (the set
// item mechanism already does this via resolveSetItemsForRun's runtimeMacros
// merge, see sidePromptsManager.js). Items with no `{{char}}` binding (e.g.
// chat-wide side prompts like Plotpoints) are never filtered — presence
// filtering only applies to character-targeted runs. This caps LLM calls
// and prevents drift: a character who wasn't in the scene doesn't get a
// side-prompt rewrite based on nothing.

/**
 * Determine which characters are present in a compiled scene.
 *
 * Preference order (per plan §4.4):
 *   1. `compiledScene.metadata.characterFilterNames` — already computed by
 *      chatcompile.js's group-participant resolver during compileScene()
 *      (avatar-backed, exact; see createGroupParticipantResolver /
 *      resolveGroupParticipantFilterName in utils.js).
 *   2. Cheap name-scan — unique non-user `message.name` values from the
 *      scene's messages. Used when characterFilterNames is absent (solo
 *      chats never populate it; ungrouped or ambiguous-avatar configurations
 *      may not resolve every message to a group member either).
 *
 * @param {object} compiledScene - output of chatcompile.js's compileScene()
 * @returns {string[]} de-duplicated character names present in the scene, in
 *                      first-seen order
 */
export function getPresentCharacterNames(compiledScene) {
    const metaNames = compiledScene?.metadata?.characterFilterNames;
    if (Array.isArray(metaNames) && metaNames.length > 0) {
        return dedupeNames(metaNames);
    }
    return cheapNameScan(compiledScene?.messages);
}

/**
 * Cheap name-scan fallback: unique non-user speaker names from scene messages.
 * @param {object[]} messages
 * @returns {string[]}
 */
function cheapNameScan(messages) {
    if (!Array.isArray(messages)) return [];
    const names = [];
    const seen = new Set();
    for (const m of messages) {
        if (!m || m.is_user) continue;
        const name = String(m.name || '').trim();
        if (!name || seen.has(name)) continue;
        seen.add(name);
        names.push(name);
    }
    return names;
}

function dedupeNames(values) {
    const seen = new Set();
    const out = [];
    for (const v of values) {
        const s = String(v || '').trim();
        if (!s || seen.has(s)) continue;
        seen.add(s);
        out.push(s);
    }
    return out;
}

/**
 * Extract the character name a run item is bound to, if any.
 *
 * Run items produced by resolveSetItemsForRun() (sidePromptsManager.js) carry
 * `runtimeMacros` as a map of `{{token}}` -> value. A character-scoped item
 * binds the `{{char}}` token to a specific character name (set up when a
 * side-prompt set is expanded per-group-member).
 *
 * @param {object} runItem
 * @returns {string|null} bound character name, or null if not character-scoped
 */
export function getBoundCharacterName(runItem) {
    const macros = runItem?.runtimeMacros;
    if (!macros || typeof macros !== 'object') return null;
    const raw = macros['{{char}}'];
    const name = String(raw ?? '').trim();
    return name.length > 0 ? name : null;
}

/**
 * Filter a list of resolved side-prompt run items to those whose bound
 * character (if any) is present in the scene. Items with no character
 * binding always pass through unfiltered — presence filtering is scoped
 * to character-targeted runs only.
 *
 * @param {object[]} runItems - items as produced by resolveSetItemsForRun() or
 *                               the plain listByTrigger() mapping in sidePrompts.js
 * @param {object} compiledScene - the just-processed scene (chatcompile.js output)
 * @returns {{ runnable: object[], skipped: Array<{ runItem: object, characterName: string }> }}
 */
export function filterRunItemsByScenePresence(runItems, compiledScene) {
    const items = Array.isArray(runItems) ? runItems : [];
    const presentNames = getPresentCharacterNames(compiledScene);
    const presentSet = new Set(presentNames.map((n) => n.toLowerCase()));

    const runnable = [];
    const skipped = [];
    for (const runItem of items) {
        const characterName = getBoundCharacterName(runItem);
        if (characterName == null) {
            // Not character-scoped — always runs.
            runnable.push(runItem);
            continue;
        }
        if (presentSet.has(characterName.toLowerCase())) {
            runnable.push(runItem);
        } else {
            skipped.push({ runItem, characterName });
        }
    }
    return { runnable, skipped };
}

/**
 * Format a short, human-readable log line for skipped items (for console.log
 * / toastr consumers that want a one-liner, mirroring the style of
 * logSkippedSetItems in sidePrompts.js).
 *
 * @param {Array<{ runItem: object, characterName: string }>} skipped
 * @returns {string}
 */
export function formatSkippedScenePresenceLog(skipped) {
    if (!Array.isArray(skipped) || skipped.length === 0) return '';
    const names = skipped.map((s) => s.characterName).filter(Boolean);
    return `Skipped ${skipped.length} character-scoped side prompt(s) — not present in scene: ${names.join(', ')}`;
}