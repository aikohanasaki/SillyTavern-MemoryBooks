// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

import { chat } from '../../../../script.js';
import { extension_settings } from '../../../extensions.js';
import { executeSlashCommands } from '../../../slash-commands.js';
import { createSceneRequest, compileScene } from './chatcompile.js';

const MODULE_NAME = 'STMemoryBooks-MessageRange';

export function collectHiddenRanges(messages, start, end) {
    const ranges = [];
    let rangeStart = null;
    for (let i = start; i <= end && i < messages.length; i++) {
        if (messages[i]?.is_system) {
            if (rangeStart === null) rangeStart = i;
        } else if (rangeStart !== null) {
            ranges.push({ start: rangeStart, end: i - 1 });
            rangeStart = null;
        }
    }
    if (rangeStart !== null) ranges.push({ start: rangeStart, end });
    return ranges;
}

export async function compileMessageRange(start, end, options = {}) {
    const shouldUnhide = options.unhideBeforeMemory ??
        !!extension_settings?.STMemoryBooks?.moduleSettings?.unhideBeforeMemory;
    const hiddenRanges = shouldUnhide ? collectHiddenRanges(chat, start, end) : [];

    if (hiddenRanges.length > 0) {
        try {
            await executeSlashCommands(`/unhide ${start}-${end}`);
        } catch (error) {
            console.warn(`${MODULE_NAME}: /unhide failed for ${start}-${end}:`, error);
        }
    }

    try {
        return compileScene(createSceneRequest(start, end));
    } finally {
        for (const range of hiddenRanges) {
            try {
                await executeSlashCommands(`/hide ${range.start}-${range.end}`);
            } catch (error) {
                console.warn(`${MODULE_NAME}: /hide failed while restoring ${range.start}-${range.end}:`, error);
            }
        }
    }
}
