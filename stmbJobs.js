import {
    chat_metadata,
    eventSource,
    event_types,
    getRequestHeaders,
    name2,
    saveSettingsDebounced,
} from '../../../../script.js';
import {
    extension_settings,
    getContext,
    openThirdPartyExtensionMenu,
    saveMetadataDebounced,
} from '../../../extensions.js';
import { loadWorldInfo } from '../../../world-info.js';
import { translate } from '../../../i18n.js';
import { Popup, POPUP_RESULT, POPUP_TYPE } from '../../../popup.js';

const MODULE_NAME = 'STMemoryBooks-Jobs';
const TOP_INFO_BAR_ID = 'extensionTopBar';
const TOP_INFO_BAR_CHAT_NAME_ID = 'extensionTopBarChatName';
const TOP_INFO_BAR_EXTENSION_URL = 'https://github.com/SillyTavern/Extension-TopInfoBar';
const JOB_BUTTON_ROOT_ID = 'stmb-jobs-topbar';
const JOB_DRAWER_ID = 'top_chat_stmb_jobs';
const INSTALL_TOP_INFO_BAR_RESULT = POPUP_RESULT.CUSTOM1;
const ACTIVE_STATES = new Set(['queued', 'running', 'capturing_scene', 'assembling_prompt', 'generating', 'awaiting_approval', 'needs_review', 'saving', 'post_save']);
const TERMINAL_STATES = new Set(['completed', 'failed', 'canceled', 'blocked', 'skipped']);
const RECENT_LIMIT = 25;
const CONCURRENT_JOB_TYPES = new Set(['sidePrompt']);

const jobStores = new Map();
const jobExecutors = new Map();
const writeLanes = new Map();
const pendingApprovals = new Map();
const jobListeners = new Set();

let jobsUiInitialized = false;
let jobsEnabled = false;
let jobsRenderTimer = null;
let topBarButton = null;
let topBarBadge = null;
let jobsPanel = null;
let jobsSummary = null;
let jobsRows = null;
let jobsActions = null;
let missingTopInfoBarNoticeShown = false;

function placeJobsTopBarButton(topBar, wrapper) {
    const chatName = document.getElementById(TOP_INFO_BAR_CHAT_NAME_ID);
    const anchor = chatName?.parentElement === topBar ? chatName : null;
    if (wrapper.parentElement !== topBar || wrapper.nextElementSibling !== anchor) {
        topBar.insertBefore(wrapper, anchor);
    }
}

function tr(key, fallback, params = null) {
    let value = translate(fallback, key);
    if (params) {
        value = value.replace(/{{\s*(\w+)\s*}}/g, (_m, name) => {
            const replacement = params[name];
            return replacement === undefined || replacement === null ? '' : String(replacement);
        });
    }
    return value;
}

function getStmbModuleSettings() {
    if (!extension_settings.STMemoryBooks) {
        extension_settings.STMemoryBooks = {};
    }
    if (!extension_settings.STMemoryBooks.moduleSettings) {
        extension_settings.STMemoryBooks.moduleSettings = {};
    }
    return extension_settings.STMemoryBooks.moduleSettings;
}

function clampInt(value, min, max) {
    const number = Number(value);
    if (!Number.isFinite(number)) return min;
    return Math.max(min, Math.min(max, Math.floor(number)));
}

function getSidePromptJobLimit() {
    const moduleSettings = getStmbModuleSettings();
    return clampInt(moduleSettings.sidePromptsMaxConcurrent ?? 2, 1, 5);
}

function showMissingTopInfoBarNotice() {
    if (missingTopInfoBarNoticeShown) return;
    const moduleSettings = getStmbModuleSettings();
    if (moduleSettings.dismissMissingTopInfoBarJobsNotice === true) return;
    missingTopInfoBarNoticeShown = true;
    const noticeText = tr(
        'STMemoryBooks_Jobs_TopInfoBarMissingNotice',
        'Chat Top Bar is either disabled or not installed.\n\nThe optional Memory Books job queue uses Chat Top Bar to show the Jobs button and queue drawer. Chat Top Bar is an official SillyTavern extension by Cohee1207.\n\nInstall or enable Chat Top Bar to use job queueing. If you do not want to use Chat Top Bar, STMB will still work normally; only the job queue function will be unavailable.\n\nOfficial extension:\nhttps://github.com/SillyTavern/Extension-TopInfoBar',
    );
    const noticeHtml = escapeHtml(noticeText)
        .replace(
            escapeHtml(TOP_INFO_BAR_EXTENSION_URL),
            `<a href="${TOP_INFO_BAR_EXTENSION_URL}" target="_blank" rel="noopener noreferrer">${escapeHtml(TOP_INFO_BAR_EXTENSION_URL)}</a>`,
        )
        .split(/\n{2,}/)
        .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
        .join('');

    const content = `
        <div class="stmb-jobs-topinfobar-notice">
            ${noticeHtml}
            <label class="checkbox_label stmb-jobs-topinfobar-dismiss">
                <input type="checkbox" id="stmb-jobs-dismiss-topinfobar-notice">
                <span>${escapeHtml(tr(
                    'STMemoryBooks_Jobs_TopInfoBarMissingDismiss',
                    'Dismiss and never show this notification again.',
                ))}</span>
            </label>
        </div>`;

    setTimeout(async () => {
        try {
            const popup = new Popup(content, POPUP_TYPE.TEXT, '', {
                okButton: tr('STMemoryBooks_OK', 'OK'),
                cancelButton: false,
                wide: false,
                allowVerticalScrolling: true,
                customButtons: [{
                    text: tr('STMemoryBooks_Jobs_TopInfoBarInstall', 'Install Chat Top Bar'),
                    result: INSTALL_TOP_INFO_BAR_RESULT,
                    classes: ['menu_button', 'whitespacenowrap'],
                }],
            });
            const result = await popup.show();
            if (popup.dlg?.querySelector('#stmb-jobs-dismiss-topinfobar-notice')?.checked) {
                moduleSettings.dismissMissingTopInfoBarJobsNotice = true;
                saveSettingsDebounced();
            }
            if (result === INSTALL_TOP_INFO_BAR_RESULT) {
                await openThirdPartyExtensionMenu(TOP_INFO_BAR_EXTENSION_URL);
            }
        } catch (error) {
            console.warn(`${MODULE_NAME}: missing TopInfoBar notice failed`, error);
        }
    }, 0);
}

function safeClone(value) {
    if (value === undefined) return undefined;
    try {
        return structuredClone(value);
    } catch {
        return JSON.parse(JSON.stringify(value));
    }
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function normalizeLaneIdentity(identity) {
    if (identity && typeof identity === 'object') {
        return Object.entries(identity)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}:${String(value ?? '')}`)
            .join('|');
    }
    return String(identity || '').trim() || '__stmb_default_lane__';
}

export async function withStmbWriteLane(identity, task) {
    const key = normalizeLaneIdentity(identity);
    const previousTail = writeLanes.get(key) || Promise.resolve();
    const runPromise = previousTail.catch(() => {}).then(async () => {
        try {
            return await task();
        } finally {
            // The lane is advanced by storedTail below. This finally is intentionally
            // present so cancellation/throw paths cannot skip release semantics.
        }
    });
    const storedTail = runPromise.catch(() => {}).finally(() => {
        if (writeLanes.get(key) === storedTail) {
            writeLanes.delete(key);
        }
    });
    writeLanes.set(key, storedTail);
    return await runPromise;
}

function makeJobId() {
    return `stmb-job-${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`;
}

export function getCurrentStmbChatRef() {
    const context = getContext();
    if (context?.groupId) {
        const group = Array.isArray(context.groups)
            ? context.groups.find(item => String(item?.id) === String(context.groupId))
            : null;
        const chatId = String(context.chatId || group?.chat_id || '').trim();
        return {
            type: 'group',
            groupId: String(context.groupId),
            chatId,
            fileName: chatId,
            label: chatId || String(context.groupId),
        };
    }

    const character = Array.isArray(context?.characters)
        ? context.characters[context.characterId]
        : null;
    const fileName = String(context?.chatId || character?.chat || '').trim();
    const avatarUrl = String(character?.avatar || '').trim();
    return {
        type: 'character',
        characterId: Number.isFinite(Number(context?.characterId)) ? Number(context.characterId) : null,
        characterName: String(character?.name || name2 || '').trim(),
        avatarUrl,
        fileName,
        label: `${avatarUrl || 'char'}:${fileName || 'chat'}`,
    };
}

export function getStmbChatKey(chatRef = null) {
    const ref = chatRef || getCurrentStmbChatRef();
    if (ref?.type === 'group') {
        const id = String(ref.chatId || ref.fileName || '').trim();
        const groupId = String(ref.groupId || '').trim();
        return `group:${groupId}:${id || '__no_chat__'}`;
    }
    if (ref?.type === 'character') {
        const avatar = String(ref.avatarUrl || ref.characterId || 'char').trim();
        const fileName = String(ref.fileName || '').trim();
        return `character:${avatar}:${fileName || '__no_chat__'}`;
    }
    return `fallback:${String(ref?.label || 'char-chatname').trim()}`;
}

function isSameChatRef(left, right) {
    if (!left || !right || left.type !== right.type) return false;
    if (left.type === 'group') {
        return String(left.groupId || '') === String(right.groupId || '')
            && String(left.chatId || left.fileName || '') === String(right.chatId || right.fileName || '');
    }
    return String(left.avatarUrl || '') === String(right.avatarUrl || '')
        && String(left.fileName || '') === String(right.fileName || '');
}

function ensureStore(chatKey) {
    const key = String(chatKey || '').trim();
    if (!key) {
        throw new Error('STMB job chat key is required.');
    }
    if (!jobStores.has(key)) {
        jobStores.set(key, {
            queue: [],
            runningJobs: [],
            recentHistory: [],
            runnerActive: false,
            lastUpdated: Date.now(),
        });
    }
    return jobStores.get(key);
}

function getRunningJobs(store) {
    if (!store) return [];
    if (Array.isArray(store.runningJobs)) return store.runningJobs;
    store.runningJobs = store.runningJob ? [store.runningJob] : [];
    delete store.runningJob;
    return store.runningJobs;
}

function cloneJobForView(job = {}) {
    return {
        id: String(job.id || ''),
        chatKey: String(job.chatKey || ''),
        type: String(job.type || ''),
        state: String(job.state || 'queued'),
        title: String(job.title || ''),
        detail: String(job.detail || ''),
        error: job.error ? { ...job.error } : null,
        result: job.result ? safeClone(job.result) : null,
        createdAt: Number(job.createdAt || 0),
        startedAt: Number(job.startedAt || 0),
        updatedAt: Number(job.updatedAt || 0),
        finishedAt: Number(job.finishedAt || 0),
        chatTitle: String(job.chatTitle || ''),
        characterName: String(job.characterName || ''),
        lorebookName: String(job.lorebookName || job.payload?.lorebookName || ''),
        range: job.range ? { ...job.range } : null,
        approvalRequest: job.approvalRequest ? safeClone(job.approvalRequest) : null,
    };
}

function touchStore(store) {
    store.lastUpdated = Date.now();
    notifyJobListeners();
}

function notifyJobListeners() {
    for (const listener of jobListeners) {
        try {
            listener();
        } catch (error) {
            console.warn(`${MODULE_NAME}: listener failed`, error);
        }
    }
    renderStmbJobsUi();
}

function finishJob(store, job, state, patch = {}) {
    job.state = state;
    job.finishedAt = Date.now();
    job.updatedAt = job.finishedAt;
    Object.assign(job, patch);
    store.runningJobs = getRunningJobs(store).filter(item => item.id !== job.id);
    store.recentHistory.unshift(job);
    if (store.recentHistory.length > RECENT_LIMIT) {
        store.recentHistory.length = RECENT_LIMIT;
    }
    touchStore(store);
}

function buildContext(store, job) {
    return {
        store,
        job,
        signal: job.abortController.signal,
        isCancelled() {
            return job.abortController.signal.aborted || job.cancelled === true;
        },
        throwIfCancelled() {
            if (this.isCancelled()) {
                const error = new Error('Cancelled');
                error.name = 'AbortError';
                throw error;
            }
        },
        setState(state, options = {}) {
            if (this.isCancelled()) return;
            job.state = String(state || job.state || 'running');
            if (typeof options.detail === 'string') {
                job.detail = options.detail;
            }
            job.updatedAt = Date.now();
            touchStore(store);
        },
        setDetail(detail) {
            if (this.isCancelled()) return;
            job.detail = String(detail || '');
            job.updatedAt = Date.now();
            touchStore(store);
        },
        setResult(result) {
            if (this.isCancelled()) return;
            job.result = safeClone(result);
            job.updatedAt = Date.now();
            touchStore(store);
        },
        patch(patch = {}) {
            if (this.isCancelled()) return;
            Object.assign(job, patch);
            job.updatedAt = Date.now();
            touchStore(store);
        },
        enqueue(input = {}) {
            return enqueueStmbJob({ ...input, chatRef: safeClone(job.chatRef), chatKey: job.chatKey });
        },
    };
}

function canStartQueuedJob(store, job) {
    if (!job) return false;
    const runningJobs = getRunningJobs(store);
    const jobType = String(job.type || '');
    const isConcurrent = CONCURRENT_JOB_TYPES.has(jobType);

    if (!isConcurrent) {
        return runningJobs.length === 0;
    }

    if (runningJobs.some(running => !CONCURRENT_JOB_TYPES.has(String(running.type || '')))) {
        return false;
    }

    const runningSameType = runningJobs.filter(running => String(running.type || '') === jobType).length;
    const limit = jobType === 'sidePrompt' ? getSidePromptJobLimit() : 1;
    return runningSameType < limit;
}

async function executeRunningJob(chatKey, store, job, executor) {
    try {
        const context = buildContext(store, job);
        await executor(job, context);
        if (context.isCancelled()) {
            finishJob(store, job, 'canceled', { detail: job.detail || 'Canceled' });
        } else if (!TERMINAL_STATES.has(job.state)) {
            finishJob(store, job, 'completed');
        } else {
            finishJob(store, job, job.state);
        }
    } catch (error) {
        const isAbort = String(error?.name || '') === 'AbortError' || String(error?.message || '').includes('Cancelled');
        const needsReview = String(error?.name || '') === 'StmbJobNeedsReview';
        finishJob(store, job, isAbort ? 'canceled' : needsReview ? 'blocked' : 'failed', {
            error: isAbort ? null : { message: String(error?.message || error) },
            detail: isAbort ? 'Canceled' : needsReview ? 'Needs review' : job.detail,
        });
    } finally {
        runNextJob(chatKey).catch(error => console.warn(`${MODULE_NAME}: queue runner failed`, error));
    }
}

function startQueuedJob(chatKey, store) {
    const job = store.queue.shift();
    getRunningJobs(store).push(job);
    job.state = 'running';
    job.startedAt = Date.now();
    job.updatedAt = job.startedAt;
    touchStore(store);

    const executor = jobExecutors.get(String(job.type || ''));
    if (!executor) {
        finishJob(store, job, 'failed', { error: { message: `No executor registered for ${job.type}` } });
        return;
    }

    executeRunningJob(chatKey, store, job, executor)
        .catch(error => console.warn(`${MODULE_NAME}: queued job failed outside executor wrapper`, error));
}

async function runNextJob(chatKey) {
    const store = ensureStore(chatKey);
    if (store.runnerActive || store.queue.length === 0) {
        return;
    }
    store.runnerActive = true;
    try {
        while (store.queue.length > 0 && canStartQueuedJob(store, store.queue[0])) {
            startQueuedJob(chatKey, store);
        }
    } finally {
        store.runnerActive = false;
    }
}

function normalizeJobInput(input = {}) {
    const chatRef = safeClone(input.chatRef || getCurrentStmbChatRef());
    const chatKey = String(input.chatKey || getStmbChatKey(chatRef)).trim();
    return {
        id: String(input.id || makeJobId()),
        chatKey,
        chatRef,
        type: String(input.type || 'memory'),
        state: 'queued',
        createdAt: Date.now(),
        startedAt: null,
        finishedAt: null,
        updatedAt: Date.now(),
        title: String(input.title || ''),
        detail: String(input.detail || ''),
        lorebookName: String(input.lorebookName || input.payload?.lorebookName || ''),
        range: input.range ? safeClone(input.range) : null,
        payload: input.payload ? safeClone(input.payload) : {},
        chatTitle: String(input.chatTitle || chatRef?.fileName || chatRef?.chatId || ''),
        characterName: String(input.characterName || input.payload?.characterName || ''),
        error: null,
        result: null,
        approvalRequest: input.approvalRequest ? safeClone(input.approvalRequest) : null,
        abortController: new AbortController(),
        cancelled: false,
    };
}

export function enqueueStmbJob(input = {}) {
    if (!areStmbJobsEnabled()) {
        return null;
    }
    const job = normalizeJobInput(input);
    const store = ensureStore(job.chatKey);
    store.queue.push(job);
    touchStore(store);
    runNextJob(job.chatKey).catch(error => console.warn(`${MODULE_NAME}: queue kickoff failed`, error));
    return cloneJobForView(job);
}

export function registerStmbJobExecutor(type, executor) {
    if (!type || typeof executor !== 'function') return;
    jobExecutors.set(String(type), executor);
}

export function subscribeToStmbJobs(listener) {
    jobListeners.add(listener);
    return () => jobListeners.delete(listener);
}

export function hasActiveStmbJobs(chatKey = null) {
    if (chatKey) {
        const store = jobStores.get(String(chatKey));
        return Boolean(getRunningJobs(store).length || store?.queue?.length);
    }
    for (const store of jobStores.values()) {
        if (getRunningJobs(store).length || store.queue.length > 0) return true;
    }
    return false;
}

export function cancelActiveStmbJob(chatKey = null, jobId = null) {
    const key = String(chatKey || getStmbChatKey()).trim();
    const store = jobStores.get(key);
    const runningJobs = getRunningJobs(store);
    const id = String(jobId || '').trim();
    const job = id ? runningJobs.find(item => item.id === id) : runningJobs[0];
    if (!job) return false;
    job.cancelled = true;
    try {
        job.abortController.abort('stmb-job-cancel');
    } catch {}
    const approval = pendingApprovals.get(job.id);
    if (approval) {
        pendingApprovals.delete(job.id);
        approval.resolve({ decision: 'cancel' });
    }
    touchStore(store);
    return true;
}

export function cancelAllStmbJobs(reason = 'stmb-stop') {
    let count = 0;
    for (const store of jobStores.values()) {
        for (const job of getRunningJobs(store)) {
            count++;
            job.cancelled = true;
            try {
                job.abortController.abort(reason);
            } catch {}
        }
        for (const job of store.queue) {
            count++;
            job.cancelled = true;
            job.state = 'canceled';
            job.finishedAt = Date.now();
            store.recentHistory.unshift(job);
        }
        store.queue = [];
        touchStore(store);
    }
    for (const [jobId, approval] of pendingApprovals.entries()) {
        pendingApprovals.delete(jobId);
        approval.resolve({ decision: 'cancel' });
    }
    return count;
}

function isCurrentJobChat(job) {
    return isSameChatRef(job?.chatRef, getCurrentStmbChatRef());
}

export async function awaitStmbJobApproval(context, approvalRequest = {}, options = {}) {
    const job = context?.job;
    if (!job?.id) {
        throw new Error('STMB job approval requires a live job.');
    }
    if (context.isCancelled?.()) {
        return { decision: 'cancel' };
    }

    return await new Promise(resolve => {
        const openApproval = async ({ force = false } = {}) => {
            if (!force && !isCurrentJobChat(job)) {
                context.patch({
                    state: 'needs_review',
                    detail: options.detail || tr('STMemoryBooks_Jobs_NeedsReview', 'Needs review'),
                    approvalRequest: safeClone({
                        kind: approvalRequest.kind || 'approval',
                        title: approvalRequest.title || job.title,
                        detail: approvalRequest.detail || job.detail,
                    }),
                });
                return false;
            }
            try {
                context.setState('awaiting_approval', { detail: options.detail || job.detail });
                const result = await approvalRequest.open();
                pendingApprovals.delete(job.id);
                resolve(result || { decision: 'cancel' });
                return true;
            } catch (error) {
                pendingApprovals.delete(job.id);
                resolve({ decision: 'error', error });
                return true;
            }
        };

        pendingApprovals.set(job.id, {
            job,
            resolve,
            openApproval,
        });

        openApproval().catch(error => {
            console.warn(`${MODULE_NAME}: approval open failed`, error);
            pendingApprovals.delete(job.id);
            resolve({ decision: 'error', error });
        });
    });
}

function getJobLabel(job = {}) {
    const title = String(job.title || '').trim();
    if (title) return title;
    switch (String(job.type || '')) {
        case 'consolidation': return tr('STMemoryBooks_Jobs_Consolidation', 'Consolidation');
        case 'sidePrompt':
        case 'sidePromptBatch': return tr('STMemoryBooks_Jobs_SidePrompt', 'Side Prompt');
        case 'memory':
        default: return tr('STMemoryBooks_Jobs_Memory', 'Memory');
    }
}

function getJobStateLabel(job = {}) {
    switch (String(job.state || '')) {
        case 'queued': return tr('STMemoryBooks_Jobs_Queued', 'Queued');
        case 'running': return tr('STMemoryBooks_Jobs_Running', 'Running');
        case 'capturing_scene': return tr('STMemoryBooks_Jobs_CapturingScene', 'Capturing scene');
        case 'assembling_prompt': return tr('STMemoryBooks_Jobs_AssemblingPrompt', 'Assembling prompt');
        case 'generating': return tr('STMemoryBooks_Jobs_Generating', 'Generating');
        case 'awaiting_approval': return tr('STMemoryBooks_Jobs_AwaitingApproval', 'Awaiting approval');
        case 'needs_review': return tr('STMemoryBooks_Jobs_NeedsReview', 'Needs review');
        case 'saving': return tr('STMemoryBooks_Jobs_Saving', 'Saving');
        case 'post_save': return tr('STMemoryBooks_Jobs_PostSave', 'Post-save');
        case 'completed': return tr('STMemoryBooks_Jobs_Completed', 'Completed');
        case 'failed': return tr('STMemoryBooks_Jobs_Failed', 'Failed');
        case 'blocked': return tr('STMemoryBooks_Jobs_Blocked', 'Blocked');
        case 'skipped': return tr('STMemoryBooks_Jobs_Skipped', 'Skipped');
        case 'canceled': return tr('STMemoryBooks_Jobs_Canceled', 'Canceled');
        default: return String(job.state || 'Queued');
    }
}

function getStateToneClass(job = {}) {
    const state = String(job.state || '');
    if (state === 'completed') return 'stmb-jobs-tone-completed';
    if (state === 'failed' || state === 'blocked' || state === 'canceled') return 'stmb-jobs-tone-failed';
    if (state === 'awaiting_approval' || state === 'needs_review') return 'stmb-jobs-tone-awaiting';
    if (ACTIVE_STATES.has(state)) return 'stmb-jobs-tone-running';
    return '';
}

function formatElapsed(job = {}) {
    const start = Number(job.startedAt || job.createdAt || 0);
    if (!start) return '';
    const end = TERMINAL_STATES.has(String(job.state || '')) ? Number(job.finishedAt || job.updatedAt || Date.now()) : Date.now();
    const seconds = Math.max(0, Math.round((end - start) / 1000));
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function getCurrentStoreRows() {
    const chatKey = getStmbChatKey();
    const store = jobStores.get(chatKey);
    if (!store) return [];
    return [
        ...getRunningJobs(store),
        ...store.queue,
        ...store.recentHistory,
    ].map(cloneJobForView);
}

function renderStmbJobsUi() {
    if (!jobsUiInitialized || !jobsRows || !jobsSummary || !topBarButton || !topBarBadge || !jobsActions) {
        return;
    }
    const rows = getCurrentStoreRows();
    const activeCount = rows.filter(row => ACTIVE_STATES.has(String(row.state))).length;
    const reviewCount = rows.filter(row => row.state === 'needs_review' || row.state === 'awaiting_approval').length;
    const failureCount = rows.filter(row => ['failed', 'blocked'].includes(String(row.state))).length;
    const totalBadge = activeCount + reviewCount + failureCount;
    const summary = activeCount > 0
        ? tr('STMemoryBooks_Jobs_ActiveSummary', '{{count}} active job(s)', { count: activeCount })
        : reviewCount > 0
            ? tr('STMemoryBooks_Jobs_ReviewSummary', '{{count}} need review', { count: reviewCount })
            : tr('STMemoryBooks_Jobs_NoActive', 'No active jobs');

    jobsSummary.textContent = summary;
    topBarButton.title = summary;
    topBarButton.setAttribute('aria-label', `${tr('STMemoryBooks_Jobs_Title', 'Memory Books Jobs')}. ${summary}`);
    topBarBadge.style.display = totalBadge > 0 ? 'inline-flex' : 'none';
    topBarBadge.textContent = totalBadge > 99 ? '99+' : String(totalBadge);
    topBarBadge.classList.toggle('stmb-jobs-badge-failed', activeCount === 0 && failureCount > 0);

    jobsActions.innerHTML = rows.some(row => TERMINAL_STATES.has(String(row.state)))
        ? `<button type="button" class="menu_button stmb-jobs-action-link" data-action="dismiss-terminal">${escapeHtml(tr('STMemoryBooks_Jobs_DismissCompleted', 'Dismiss completed'))}</button>`
        : '';

    if (rows.length === 0) {
        jobsRows.innerHTML = `<div class="stmb-jobs-empty">${escapeHtml(tr('STMemoryBooks_Jobs_Empty', 'No Memory Books jobs.'))}</div>`;
        return;
    }

    jobsRows.innerHTML = rows.map(job => {
        const canReview = job.state === 'needs_review' || job.state === 'awaiting_approval';
        const canCancel = ACTIVE_STATES.has(String(job.state)) && job.state !== 'needs_review';
        const canRetry = ['failed', 'blocked', 'canceled'].includes(String(job.state));
        const attrs = canReview ? ` data-action="open-approval" data-job-id="${escapeHtml(job.id)}" tabindex="0"` : '';
        const action = canCancel
            ? `<button type="button" class="menu_button stmb-jobs-row-action" data-action="cancel-job" data-job-id="${escapeHtml(job.id)}">${escapeHtml(tr('STMemoryBooks_Jobs_Cancel', 'Cancel'))}</button>`
            : canRetry
                ? `<button type="button" class="menu_button stmb-jobs-row-action" data-action="retry-job" data-job-id="${escapeHtml(job.id)}">${escapeHtml(tr('STMemoryBooks_Jobs_Retry', 'Retry'))}</button>`
                : '';
        return `
            <div class="stmb-jobs-row ${getStateToneClass(job)}"${attrs}>
                <div class="stmb-jobs-row-main">
                    <div class="stmb-jobs-row-header">
                        <span class="stmb-jobs-row-icon"></span>
                        <strong>${escapeHtml(getJobLabel(job))}</strong>
                        <span class="stmb-jobs-row-status">${escapeHtml(getJobStateLabel(job))}</span>
                    </div>
                    ${job.detail ? `<div class="stmb-jobs-row-detail">${escapeHtml(job.detail)}</div>` : ''}
                    ${job.lorebookName ? `<div class="stmb-jobs-row-meta">${escapeHtml(tr('STMemoryBooks_Jobs_Lorebook', 'Lorebook'))}: ${escapeHtml(job.lorebookName)}</div>` : ''}
                    ${formatElapsed(job) ? `<div class="stmb-jobs-row-meta">${escapeHtml(formatElapsed(job))}</div>` : ''}
                    ${job.error?.message ? `<div class="stmb-jobs-row-error">${escapeHtml(job.error.message)}</div>` : ''}
                </div>
                ${action}
            </div>`;
    }).join('');

    const currentStore = jobStores.get(getStmbChatKey());
    const reviewJob = getRunningJobs(currentStore).find(job => job.state === 'needs_review') || null;
    const approval = reviewJob ? pendingApprovals.get(reviewJob.id) : null;
    if (approval && isCurrentJobChat(reviewJob)) {
        setTimeout(() => {
            approval.openApproval().catch(error => console.warn(`${MODULE_NAME}: approval open failed`, error));
        }, 0);
    }
}

function toggleJobsPanel() {
    if (!jobsPanel || !topBarButton) return;
    const nextOpen = !jobsPanel.classList.contains('visible');
    jobsPanel.classList.toggle('visible', nextOpen);
    topBarButton.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
    renderStmbJobsUi();
}

function handleTopBarButtonKeydown(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    toggleJobsPanel();
}

function findMutableJob(jobId) {
    const id = String(jobId || '').trim();
    if (!id) return null;
    for (const [chatKey, store] of jobStores.entries()) {
        const running = getRunningJobs(store).find(job => job.id === id);
        if (running) return { chatKey, store, job: running };
        const queued = store.queue.find(job => job.id === id);
        if (queued) return { chatKey, store, job: queued };
        const recent = store.recentHistory.find(job => job.id === id);
        if (recent) return { chatKey, store, job: recent };
    }
    return null;
}

function handlePanelClick(event) {
    const target = event.target.closest?.('[data-action]');
    if (!target) return;
    const action = target.dataset.action;
    if (action === 'dismiss-terminal') {
        const store = jobStores.get(getStmbChatKey());
        if (store) {
            store.recentHistory = store.recentHistory.filter(job => !TERMINAL_STATES.has(String(job.state || '')));
            touchStore(store);
        }
        return;
    }
    const jobId = target.dataset.jobId || target.closest?.('[data-job-id]')?.dataset?.jobId;
    const record = findMutableJob(jobId);
    if (!record) return;
    if (action === 'cancel-job') {
        if (getRunningJobs(record.store).some(job => job.id === record.job.id)) {
            cancelActiveStmbJob(record.chatKey, record.job.id);
        } else {
            record.store.queue = record.store.queue.filter(job => job.id !== record.job.id);
            record.job.state = 'canceled';
            record.job.finishedAt = Date.now();
            record.store.recentHistory.unshift(record.job);
            touchStore(record.store);
            runNextJob(record.chatKey).catch(error => console.warn(`${MODULE_NAME}: queue runner failed`, error));
        }
        return;
    }
    if (action === 'retry-job') {
        const retryInput = safeClone(record.job);
        delete retryInput.id;
        delete retryInput.abortController;
        delete retryInput.error;
        delete retryInput.result;
        delete retryInput.startedAt;
        delete retryInput.finishedAt;
        record.store.recentHistory = record.store.recentHistory.filter(job => job.id !== record.job.id);
        enqueueStmbJob({
            ...retryInput,
            state: 'queued',
            detail: record.job.detail,
        });
        touchStore(record.store);
        return;
    }
    if (action === 'open-approval') {
        const approval = pendingApprovals.get(record.job.id);
        if (approval) {
            approval.openApproval({ force: true }).catch(error => console.warn(`${MODULE_NAME}: approval open failed`, error));
        }
    }
}

function handlePanelKeydown(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const row = event.target.closest?.('[data-action="open-approval"]');
    if (!row) return;
    event.preventDefault();
    row.click();
}

function ensureJobsUiElements() {
    const topBar = document.getElementById(TOP_INFO_BAR_ID);
    if (!topBar) return false;

    let wrapper = document.getElementById(JOB_BUTTON_ROOT_ID);
    if (wrapper && wrapper.tagName !== 'I') {
        wrapper.remove();
        wrapper = null;
    }
    if (!wrapper) {
        wrapper = document.createElement('i');
        wrapper.id = JOB_BUTTON_ROOT_ID;
        wrapper.className = 'fa-fw fa-solid fa-book right_menu_button stmb-jobs-topbar';
        wrapper.title = tr('STMemoryBooks_Jobs_NoActive', 'No active jobs');
        wrapper.tabIndex = 0;
        wrapper.setAttribute('role', 'button');
        wrapper.setAttribute('aria-expanded', 'false');
        wrapper.innerHTML = '<span id="stmb-jobs-topbar-badge" class="stmb-jobs-badge" style="display:none;"></span>';
    }
    placeJobsTopBarButton(topBar, wrapper);

    let drawer = document.getElementById(JOB_DRAWER_ID);
    if (!drawer) {
        drawer = document.createElement('div');
        drawer.id = JOB_DRAWER_ID;
        drawer.innerHTML = `
            <div class="stmb-jobs-panel-header">
                <div class="stmb-jobs-drawer-title"><strong>${escapeHtml(tr('STMemoryBooks_Jobs_Title', 'Memory Books Jobs'))}</strong></div>
                <div id="stmb-jobs-summary" class="stmb-jobs-summary">${escapeHtml(tr('STMemoryBooks_Jobs_NoActive', 'No active jobs'))}</div>
            </div>
            <div id="stmb-jobs-actions" class="stmb-jobs-actions"></div>
            <div id="stmb-jobs-rows" class="stmb-jobs-rows"></div>`;
        topBar.insertAdjacentElement('afterend', drawer);
    }

    topBarButton = wrapper;
    topBarBadge = wrapper.querySelector('#stmb-jobs-topbar-badge');
    jobsPanel = drawer;
    jobsSummary = drawer.querySelector('#stmb-jobs-summary');
    jobsRows = drawer.querySelector('#stmb-jobs-rows');
    jobsActions = drawer.querySelector('#stmb-jobs-actions');
    return Boolean(topBarButton && topBarBadge && jobsPanel && jobsSummary && jobsRows && jobsActions);
}

export function initStmbJobsIfTopInfoBarEnabled() {
    if (jobsUiInitialized) {
        renderStmbJobsUi();
        return jobsEnabled;
    }
    if (!document.getElementById(TOP_INFO_BAR_ID)) {
        jobsEnabled = false;
        showMissingTopInfoBarNotice();
        return false;
    }
    if (!ensureJobsUiElements()) {
        jobsEnabled = false;
        return false;
    }
    if (!topBarButton.dataset.stmbJobsBound) {
        topBarButton.addEventListener('click', toggleJobsPanel);
        topBarButton.addEventListener('keydown', handleTopBarButtonKeydown);
        topBarButton.dataset.stmbJobsBound = '1';
    }
    if (!jobsPanel.dataset.stmbJobsBound) {
        jobsPanel.addEventListener('click', handlePanelClick);
        jobsPanel.addEventListener('keydown', handlePanelKeydown);
        jobsPanel.dataset.stmbJobsBound = '1';
    }
    eventSource.on(event_types.CHAT_CHANGED, renderStmbJobsUi);
    jobsRenderTimer = jobsRenderTimer || setInterval(renderStmbJobsUi, 1000);
    jobsUiInitialized = true;
    jobsEnabled = true;
    renderStmbJobsUi();
    return true;
}

export function areStmbJobsEnabled() {
    return jobsEnabled && Boolean(document.getElementById(TOP_INFO_BAR_ID));
}

async function fetchCharacterChat(chatRef) {
    const response = await fetch('/api/chats/get', {
        method: 'POST',
        headers: getRequestHeaders(),
        cache: 'no-cache',
        body: JSON.stringify({
            ch_name: chatRef.characterName || '',
            file_name: chatRef.fileName,
            avatar_url: chatRef.avatarUrl,
        }),
    });
    if (!response.ok) {
        throw new Error(`Unable to fetch character chat "${chatRef.fileName}".`);
    }
    const chatData = await response.json();
    if (!Array.isArray(chatData) || chatData.length === 0 || !chatData[0]) {
        throw new Error(`Character chat "${chatRef.fileName}" no longer exists.`);
    }
    return chatData;
}

async function saveCharacterChat(chatRef, chatData) {
    const response = await fetch('/api/chats/save', {
        method: 'POST',
        headers: getRequestHeaders(),
        cache: 'no-cache',
        body: JSON.stringify({
            ch_name: chatRef.characterName || '',
            file_name: chatRef.fileName,
            avatar_url: chatRef.avatarUrl,
            chat: chatData,
        }),
    });
    if (!response.ok) {
        throw new Error(`Unable to save character chat "${chatRef.fileName}".`);
    }
}

async function fetchGroupChat(chatRef) {
    const response = await fetch('/api/chats/group/get', {
        method: 'POST',
        headers: getRequestHeaders(),
        cache: 'no-cache',
        body: JSON.stringify({
            id: chatRef.chatId || chatRef.fileName,
            with_metadata: true,
        }),
    });
    if (!response.ok) {
        throw new Error(`Unable to fetch group chat "${chatRef.chatId || chatRef.fileName}".`);
    }
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0 || !data[0]) {
        throw new Error(`Group chat "${chatRef.chatId || chatRef.fileName}" no longer exists.`);
    }
    return data;
}

async function saveGroupChatRef(chatRef, chatData) {
    const response = await fetch('/api/chats/group/save', {
        method: 'POST',
        headers: getRequestHeaders(),
        cache: 'no-cache',
        body: JSON.stringify({
            id: chatRef.chatId || chatRef.fileName,
            chat: chatData,
        }),
    });
    if (!response.ok) {
        throw new Error(`Unable to save group chat "${chatRef.chatId || chatRef.fileName}".`);
    }
}

export async function patchStmbMetadataForChatRef(chatRef, patcher) {
    if (!chatRef || typeof patcher !== 'function') {
        throw new Error('Invalid STMB metadata patch request.');
    }
    const chatKey = getStmbChatKey(chatRef);
    return await withStmbWriteLane({ type: 'chat-metadata', chatKey }, async () => {
        const currentRef = getCurrentStmbChatRef();
        if (isSameChatRef(chatRef, currentRef)) {
            const context = getContext();
            const metadata = context?.chatMetadata || chat_metadata;
            if (!metadata) {
                throw new Error('Current chat metadata is unavailable.');
            }
            const current = metadata.STMemoryBooks && typeof metadata.STMemoryBooks === 'object'
                ? { ...metadata.STMemoryBooks }
                : {};
            const patched = await patcher(current);
            metadata.STMemoryBooks = patched && typeof patched === 'object' ? patched : current;
            if (typeof context?.saveMetadata === 'function') {
                await context.saveMetadata();
            } else {
                saveMetadataDebounced();
            }
            return metadata.STMemoryBooks;
        }

        if (chatRef.type === 'character') {
            if (!chatRef.avatarUrl || !chatRef.fileName) {
                throw new Error('Character chat reference is incomplete.');
            }
            const chatData = await fetchCharacterChat(chatRef);
            const header = chatData[0];
            const metadata = header.chat_metadata && typeof header.chat_metadata === 'object'
                ? header.chat_metadata
                : {};
            const current = metadata.STMemoryBooks && typeof metadata.STMemoryBooks === 'object'
                ? { ...metadata.STMemoryBooks }
                : {};
            const patched = await patcher(current);
            header.chat_metadata = {
                ...metadata,
                STMemoryBooks: patched && typeof patched === 'object' ? patched : current,
            };
            await saveCharacterChat(chatRef, chatData);
            return header.chat_metadata.STMemoryBooks;
        }

        if (chatRef.type === 'group') {
            if (!chatRef.chatId && !chatRef.fileName) {
                throw new Error('Group chat reference is incomplete.');
            }
            const chatData = await fetchGroupChat(chatRef);
            const header = chatData[0];
            const metadata = header.chat_metadata && typeof header.chat_metadata === 'object'
                ? header.chat_metadata
                : {};
            const current = metadata.STMemoryBooks && typeof metadata.STMemoryBooks === 'object'
                ? { ...metadata.STMemoryBooks }
                : {};
            const patched = await patcher(current);
            header.chat_metadata = {
                ...metadata,
                STMemoryBooks: patched && typeof patched === 'object' ? patched : current,
            };
            await saveGroupChatRef(chatRef, chatData);
            return header.chat_metadata.STMemoryBooks;
        }

        throw new Error('Unsupported chat reference type.');
    });
}

export async function updateHighestMemoryProcessedForChatRef(chatRef, sceneEnd) {
    const completedEnd = Number(sceneEnd);
    if (!Number.isFinite(completedEnd)) {
        return null;
    }
    return await patchStmbMetadataForChatRef(chatRef, (metadata) => {
        const next = { ...(metadata || {}) };
        const existing = Number(next.highestMemoryProcessed);
        next.highestMemoryProcessed = Number.isFinite(existing)
            ? Math.max(existing, completedEnd)
            : completedEnd;
        delete next.highestMemoryProcessedManuallySet;
        return next;
    });
}

export async function loadLatestLorebookForJob(lorebookName) {
    const name = String(lorebookName || '').trim();
    if (!name) {
        throw new Error('Missing lorebook name.');
    }
    return await withStmbWriteLane({ type: 'lorebook', name }, async () => {
        const data = await loadWorldInfo(name);
        if (!data || typeof data !== 'object') {
            throw new Error(`Lorebook "${name}" could not be loaded.`);
        }
        return data;
    });
}
