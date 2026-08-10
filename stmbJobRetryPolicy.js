// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

const AFTER_MEMORY_JOB_TYPES = new Set(['sidePrompt', 'sidePromptBatch', 'memoryAssistance']);

function cloneValue(value) {
    if (value === undefined) return undefined;
    try {
        return structuredClone(value);
    } catch {
        return JSON.parse(JSON.stringify(value));
    }
}

export function buildRetryJobInput(job = {}) {
    const retryInput = cloneValue(job) || {};
    delete retryInput.id;
    delete retryInput.abortController;
    delete retryInput.error;
    delete retryInput.result;
    delete retryInput.startedAt;
    delete retryInput.finishedAt;
    delete retryInput.updatedAt;
    delete retryInput.approvalRequest;
    retryInput.state = 'queued';
    retryInput.cancelled = false;
    return retryInput;
}

export function collectCanceledAfterMemoryJobs(memoryJob, recentHistory = []) {
    const parentJobId = String(memoryJob?.id || '').trim();
    if (String(memoryJob?.type || '') !== 'memory' || !parentJobId) {
        return [];
    }

    return (Array.isArray(recentHistory) ? recentHistory : [])
        .filter(job => (
            String(job?.parentJobId || '') === parentJobId
            && String(job?.state || '') === 'canceled'
            && AFTER_MEMORY_JOB_TYPES.has(String(job?.type || ''))
            && String(job?.payload?.trigger || '') === 'onAfterMemory'
        ))
        .sort((left, right) => {
            const orderDelta = Number(left?.parentJobOrder ?? Number.MAX_SAFE_INTEGER)
                - Number(right?.parentJobOrder ?? Number.MAX_SAFE_INTEGER);
            if (orderDelta !== 0) return orderDelta;
            const createdDelta = Number(left?.createdAt || 0) - Number(right?.createdAt || 0);
            if (createdDelta !== 0) return createdDelta;
            return String(left?.id || '').localeCompare(String(right?.id || ''));
        });
}

export function buildJobRetryPlan(job, recentHistory = []) {
    const canceledAfterMemoryJobs = collectCanceledAfterMemoryJobs(job, recentHistory);
    const retryInput = buildRetryJobInput(job);
    const carriedAfterMemoryJobs = Array.isArray(retryInput.payload?.retryAfterMemoryJobs)
        ? retryInput.payload.retryAfterMemoryJobs
        : [];

    if (canceledAfterMemoryJobs.length > 0 && carriedAfterMemoryJobs.length === 0) {
        retryInput.payload = {
            ...(retryInput.payload || {}),
            retryAfterMemoryJobs: canceledAfterMemoryJobs.map(buildRetryJobInput),
        };
    }
    if (String(job?.type || '') === 'memory'
        && String(job?.state || '') === 'canceled'
        && job?.result) {
        retryInput.payload = {
            ...(retryInput.payload || {}),
            resumeSavedMemory: true,
            retryMemoryResult: cloneValue(job.result),
        };
    }

    return {
        retryInput,
        consumedJobIds: [
            String(job?.id || ''),
            ...canceledAfterMemoryJobs.map(child => String(child?.id || '')),
        ].filter(Boolean),
    };
}

export function buildMemoryOnlyRetryPlan(job) {
    const retryInput = buildRetryJobInput(job);
    const resumeSavedMemory = String(job?.state || '') === 'canceled' && !!job?.result;
    retryInput.payload = {
        ...(retryInput.payload || {}),
        skipAfterMemoryJobs: true,
    };
    delete retryInput.payload.retryAfterMemoryJobs;
    if (resumeSavedMemory) {
        retryInput.payload.resumeSavedMemory = true;
        retryInput.payload.retryMemoryResult = cloneValue(job.result);
    } else {
        delete retryInput.payload.resumeSavedMemory;
        delete retryInput.payload.retryMemoryResult;
    }

    return {
        retryInput,
        consumedJobIds: [String(job?.id || '')].filter(Boolean),
    };
}
