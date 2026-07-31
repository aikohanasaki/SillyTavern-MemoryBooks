// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

export const BRANCH_LOREBOOK_METADATA_KEY = 'branchLorebookCopies';
export const BRANCH_LOREBOOK_METADATA_VERSION = 1;

const NATIVE_BRANCH_NAME_PATTERN = / - Branch #\d+$/;

function cloneValue(value) {
    if (typeof structuredClone === 'function') {
        return structuredClone(value);
    }
    return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function normalizeName(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase();
}

function formatText(template, params = {}) {
    return String(template || '').replace(/{{\s*(\w+)\s*}}/g, (_, key) =>
        params[key] === undefined || params[key] === null ? '' : String(params[key]));
}

function getStmbMetadata(chatMetadata, { create = false } = {}) {
    if (!chatMetadata || typeof chatMetadata !== 'object') return null;
    if (
        !chatMetadata.STMemoryBooks ||
        typeof chatMetadata.STMemoryBooks !== 'object' ||
        Array.isArray(chatMetadata.STMemoryBooks)
    ) {
        if (!create) return null;
        chatMetadata.STMemoryBooks = {};
    }
    return chatMetadata.STMemoryBooks;
}

export function isNativeBranchChatName(name) {
    return NATIVE_BRANCH_NAME_PATTERN.test(String(name || ''));
}

export function collectKnownBranchNames(messages) {
    const names = new Set();
    for (const message of Array.isArray(messages) ? messages : []) {
        for (const name of Array.isArray(message?.extra?.branches) ? message.extra.branches : []) {
            const normalized = String(name || '').trim();
            if (normalized) names.add(normalized);
        }
    }
    return names;
}

export function isBranchCopyProcessed(marker, chatId) {
    return !!(
        marker &&
        marker.version === BRANCH_LOREBOOK_METADATA_VERSION &&
        String(marker.branchChatId || '') === String(chatId || '') &&
        ['completed', 'failed'].includes(marker.status)
    );
}

export function shouldCopyForChatChange(previous, current) {
    if (!previous || !current || current.copyEnabled === false) return false;
    if (!previous.chatId || !current.chatId || previous.chatId === current.chatId) return false;
    if (String(current.mainChat || '') !== String(previous.chatId)) return false;
    if (!isNativeBranchChatName(current.chatId)) return false;
    if (previous.knownBranchNames?.has(current.chatId)) return false;
    if (isBranchCopyProcessed(current.branchMarker, current.chatId)) return false;
    return true;
}

export function resolveActiveLorebookBindings(snapshot, resolvedPrimary = undefined) {
    if (!snapshot) return null;
    if (!snapshot.manualModeEnabled) {
        const primaryValue = resolvedPrimary === undefined ? snapshot.chatBoundLorebook : resolvedPrimary;
        const primary = String(primaryValue || '').trim();
        return primary
            ? { mode: 'chat-bound', primary, characterBindings: {}, sourceNames: [primary] }
            : null;
    }

    const primaryValue = resolvedPrimary === undefined ? snapshot.manualLorebook : resolvedPrimary;
    const primary = String(primaryValue || '').trim();
    if (!primary) return null;

    const characterBindings = snapshot.isGroupChat && snapshot.manualCharacterLorebooks
        && typeof snapshot.manualCharacterLorebooks === 'object'
        && !Array.isArray(snapshot.manualCharacterLorebooks)
        ? cloneValue(snapshot.manualCharacterLorebooks)
        : {};
    const sourceNames = [primary];
    for (const value of Object.values(characterBindings)) {
        const name = String(value || '').trim();
        if (name && !sourceNames.includes(name)) sourceNames.push(name);
    }
    return { mode: 'manual', primary, characterBindings, sourceNames };
}

function getLineageRoot(sourceName, marker) {
    const mappings = Array.isArray(marker?.mappings) ? marker.mappings : [];
    const match = mappings.find(item => normalizeName(item?.copyName) === normalizeName(sourceName));
    return String(match?.rootName || sourceName).trim();
}

export function planBranchLorebookCopies(sourceNames, marker, existingNames) {
    const sources = Array.from(new Set((sourceNames || []).map(name => String(name || '').trim()).filter(Boolean)));
    if (sources.length === 0) return { branchNumber: null, mappings: [] };

    const roots = sources.map(sourceName => ({ sourceName, rootName: getLineageRoot(sourceName, marker) }));
    if (new Set(roots.map(item => normalizeName(item.rootName))).size !== roots.length) {
        throw new Error('Multiple active Memory Books resolve to the same branch lineage root.');
    }

    const occupied = new Set((existingNames || []).map(normalizeName));
    for (let branchNumber = 1; branchNumber <= 999999; branchNumber++) {
        const mappings = roots.map(({ sourceName, rootName }) => ({
            sourceName,
            rootName,
            copyName: `${rootName} Branch ${branchNumber}`,
        }));
        const candidates = mappings.map(item => normalizeName(item.copyName));
        if (new Set(candidates).size !== candidates.length) continue;
        if (candidates.every(candidate => !occupied.has(candidate))) {
            return { branchNumber, mappings };
        }
    }
    throw new Error('Could not find an available Branch number for the Memory Book copies.');
}

export function cloneLorebookForBranch(data, { parentChatId, branchChatId, copyNameBySource }) {
    const copy = cloneValue(data);
    for (const entry of Object.values(copy?.entries || {})) {
        if (
            entry?.STMB_chatId !== undefined &&
            entry?.STMB_chatId !== null &&
            String(entry.STMB_chatId) === String(parentChatId)
        ) {
            entry.STMB_chatId = String(branchChatId);
        }
        const canonicalName = String(entry?.STMB_canonicalLorebook || '').trim();
        if (canonicalName && copyNameBySource.has(canonicalName)) {
            entry.STMB_canonicalLorebook = copyNameBySource.get(canonicalName);
        }
    }
    return copy;
}

export function applyBranchLorebookBindings(chatMetadata, bindings, copyNameBySource) {
    if (bindings.mode === 'chat-bound') {
        chatMetadata.world_info = copyNameBySource.get(bindings.primary);
        return;
    }

    const stmbData = getStmbMetadata(chatMetadata, { create: true });
    stmbData.manualLorebook = copyNameBySource.get(bindings.primary);
    if (Object.keys(bindings.characterBindings || {}).length > 0) {
        stmbData.manualCharacterLorebooks = Object.fromEntries(
            Object.entries(bindings.characterBindings).map(([key, sourceName]) => [
                key,
                copyNameBySource.get(String(sourceName || '').trim()) || sourceName,
            ]),
        );
    } else if (stmbData.manualCharacterLorebooks) {
        stmbData.manualCharacterLorebooks = {};
    }
}

export function clearActiveBranchLorebookBindings(chatMetadata, bindings) {
    if (!chatMetadata || !bindings) return;
    if (bindings.mode === 'chat-bound') {
        delete chatMetadata.world_info;
        return;
    }

    const stmbData = getStmbMetadata(chatMetadata, { create: true });
    delete stmbData.manualLorebook;
    if (Object.keys(bindings.characterBindings || {}).length > 0) {
        stmbData.manualCharacterLorebooks = {};
    }
}

export function createBranchLorebookController(dependencies) {
    const deps = dependencies || {};
    let previousSnapshot = null;

    function translate(fallback, key) {
        return typeof deps.translate === 'function' ? deps.translate(fallback, key) : fallback;
    }

    function notify(level, message, options = undefined) {
        return deps.notify?.(level, message, options);
    }

    function clearNotification(notification) {
        if (notification) deps.clearNotification?.(notification);
    }

    function isActiveChat(current) {
        const activeChatId = String(deps.getCurrentChatId?.() || '').trim();
        return !activeChatId || activeChatId === String(current?.chatId || '').trim();
    }

    function createActiveChatChangedError() {
        const error = new Error(translate(
            'Branch Memory Book copying stopped because the active chat changed.',
            'STMemoryBooks_BranchCopyChatChanged',
        ));
        error.code = 'STMB_BRANCH_CHAT_CHANGED';
        return error;
    }

    function assertActiveChat(current) {
        if (!isActiveChat(current)) throw createActiveChatChangedError();
    }

    function capture(chatIdOverride = null) {
        const chatMetadata = deps.getChatMetadata?.() || {};
        const settings = deps.getSettings?.() || {};
        const moduleSettings = settings.moduleSettings || {};
        const stmbData = getStmbMetadata(chatMetadata) || {};
        const chatId = String(chatIdOverride || deps.getCurrentChatId?.() || '').trim();
        return {
            chatId,
            mainChat: String(chatMetadata.main_chat || '').trim(),
            knownBranchNames: collectKnownBranchNames(deps.getChatMessages?.()),
            copyEnabled: moduleSettings.copyMemoryBooksOnBranch !== false,
            manualModeEnabled: !!moduleSettings.manualModeEnabled,
            isGroupChat: !!deps.isGroupChat?.(),
            chatBoundLorebook: String(chatMetadata.world_info || '').trim(),
            manualLorebook: String(stmbData.manualLorebook || '').trim(),
            manualCharacterLorebooks: cloneValue(stmbData.manualCharacterLorebooks || {}),
            branchMarker: cloneValue(stmbData[BRANCH_LOREBOOK_METADATA_KEY] || null),
        };
    }

    function setMarker(chatMetadata, marker) {
        const stmbData = getStmbMetadata(chatMetadata, { create: true });
        stmbData[BRANCH_LOREBOOK_METADATA_KEY] = {
            version: BRANCH_LOREBOOK_METADATA_VERSION,
            ...marker,
        };
    }

    async function saveFailureState(previous, current, bindings, error, partialMappings) {
        if (!isActiveChat(current)) return false;
        const chatMetadata = deps.getChatMetadata?.() || {};
        clearActiveBranchLorebookBindings(chatMetadata, bindings);
        setMarker(chatMetadata, {
            status: 'failed',
            parentChatId: previous?.chatId || '',
            branchChatId: current.chatId,
            failedAt: new Date().toISOString(),
            mappings: partialMappings || [],
        });
        try {
            await deps.saveMetadata?.();
        } catch (saveError) {
            deps.logger?.error?.('STMemoryBooks: Failed to persist cleared branch bindings:', saveError);
        }
        const message = formatText(
            translate(
                'Could not copy Memory Books for the new branch. Its Memory Book bindings were cleared to protect the originals: {{message}}',
                'STMemoryBooks_BranchCopyFailed',
            ),
            { message: error?.message || String(error) },
        );
        notify('error', message);
        return true;
    }

    async function processBranch(previous, current) {
        const progressNotification = notify(
            'info',
            translate(
                'Copying branch Memory Books. Please do not switch chats until this finishes.',
                'STMemoryBooks_BranchCopyWorking',
            ),
            { timeOut: 0, extendedTimeOut: 0 },
        );
        try {
            // Resolve the primary book through STMB's established manual/chat-bound
            // selection path. Recapture afterward because manual selection may update
            // the child chat's metadata before returning.
            const resolvedPrimary = typeof deps.getEffectiveLorebookName === 'function'
                ? await deps.getEffectiveLorebookName()
                : undefined;
            assertActiveChat(current);
            const bindingSnapshot = capture(current.chatId);
            const bindings = resolveActiveLorebookBindings(bindingSnapshot, resolvedPrimary);
            if (!bindings) {
                notify(
                    'warning',
                    translate(
                        'Branch created, but no active Memory Book was bound, so nothing was copied.',
                        'STMemoryBooks_BranchCopyNoBinding',
                    ),
                );
                return;
            }

            let mappings = [];
            try {
                const sourceDataByName = new Map();
                for (const sourceName of bindings.sourceNames) {
                    const data = await deps.loadWorldInfo?.(sourceName);
                    if (!data) {
                        throw new Error(formatText(
                            translate('Memory Book "{{name}}" could not be loaded.', 'STMemoryBooks_BranchCopyLoadFailed'),
                            { name: sourceName },
                        ));
                    }
                    sourceDataByName.set(sourceName, data);
                }

                const plan = planBranchLorebookCopies(
                    bindings.sourceNames,
                    current.branchMarker,
                    deps.getWorldNames?.() || [],
                );
                mappings = plan.mappings;
                const copyNameBySource = new Map(mappings.map(item => [item.sourceName, item.copyName]));

                for (const mapping of mappings) {
                    const copy = cloneLorebookForBranch(sourceDataByName.get(mapping.sourceName), {
                        parentChatId: previous.chatId,
                        branchChatId: current.chatId,
                        copyNameBySource,
                    });
                    await deps.saveWorldInfo?.(mapping.copyName, copy, true);
                }

                await deps.updateWorldInfoList?.();
                const refreshedNames = deps.getWorldNames?.() || [];
                const refreshedSet = new Set(refreshedNames.map(normalizeName));
                const missingCopies = mappings.filter(item => !refreshedSet.has(normalizeName(item.copyName)));
                if (missingCopies.length > 0) {
                    throw new Error(formatText(
                        translate('Memory Book copy "{{name}}" was not created.', 'STMemoryBooks_BranchCopyCreateFailed'),
                        { name: missingCopies[0].copyName },
                    ));
                }

                assertActiveChat(current);
                const chatMetadata = deps.getChatMetadata?.() || {};
                applyBranchLorebookBindings(chatMetadata, bindings, copyNameBySource);
                setMarker(chatMetadata, {
                    status: 'completed',
                    parentChatId: previous.chatId,
                    branchChatId: current.chatId,
                    branchNumber: plan.branchNumber,
                    completedAt: new Date().toISOString(),
                    mappings: cloneValue(mappings),
                });
                await deps.saveMetadata?.();
                await deps.afterSuccess?.();

                if (mappings.length === 1) {
                    notify('success', formatText(
                        translate(
                            'Created and bound branch Memory Book "{{name}}".',
                            'STMemoryBooks_BranchCopySuccess',
                        ),
                        { name: mappings[0].copyName },
                    ));
                } else {
                    notify('success', formatText(
                        translate(
                            'Created and bound {{count}} branch Memory Books for "{{chat}}".',
                            'STMemoryBooks_BranchCopySuccessMultiple',
                        ),
                        { count: mappings.length, chat: current.chatId },
                    ));
                }
                deps.logger?.info?.('STMemoryBooks: Branch Memory Books copied and rebound:', mappings);
            } catch (error) {
                if (error?.code === 'STMB_BRANCH_CHAT_CHANGED') {
                    notify('warning', error.message);
                    return;
                }
                deps.logger?.error?.('STMemoryBooks: Failed to copy branch Memory Books:', error);
                const failureSaved = await saveFailureState(previous, current, bindings, error, mappings);
                if (!failureSaved) notify('warning', createActiveChatChangedError().message);
            }
        } catch (error) {
            if (error?.code === 'STMB_BRANCH_CHAT_CHANGED') {
                notify('warning', error.message);
                return;
            }
            throw error;
        } finally {
            clearNotification(progressNotification);
        }
    }

    return {
        initialize() {
            previousSnapshot = capture();
        },
        getPreviousSnapshot() {
            return previousSnapshot;
        },
        async handleChatChanged(chatId = null) {
            const current = capture(chatId);
            const previous = previousSnapshot;
            previousSnapshot = current;
            if (!shouldCopyForChatChange(previous, current)) return false;
            await processBranch(previous, current);
            previousSnapshot = capture();
            return true;
        },
    };
}
