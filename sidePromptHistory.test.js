import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSidePromptHistoryRequest, formatSidePromptVersionTitle, getSidePromptHistoryStreamKey, resolveSidePromptHistory } from './sidePromptHistory.js';

const template = { key: 'assess', name: 'Assess State', settings: { saveAllVersions: true } };
const sceneContext = { chatId: 'chat-1', chatRef: { type: 'character', avatarUrl: 'ava', fileName: 'chat-1' } };

test('sideprompt history enables append only when both gates are enabled', () => {
    const history = buildSidePromptHistoryRequest(template, { moduleSettings: { sidePromptVersioningEnabled: true } }, sceneContext, 'Assess State', ['Assess State (STMB SidePrompt)']);
    assert.equal(history.append, true);
    assert.equal(history.group, 'AssessState-chat-1');
    assert.equal(formatSidePromptVersionTitle('Assess State', 1000), 'Assess State-1000 (STMB SidePrompt)');
});

test('sideprompt history rejects duplicate stream sequences and ambiguous legacy titles', () => {
    const history = buildSidePromptHistoryRequest(template, { moduleSettings: { sidePromptVersioningEnabled: true } }, sceneContext, 'Assess State', ['Assess State (STMB SidePrompt)']);
    const metadata = { version: 1, templateKey: 'assess', chatKey: history.chatKey, chatId: 'chat-1', titleBase: 'Assess State', titleSource: 'name', sequence: 1 };
    assert.throws(() => resolveSidePromptHistory({ entries: { 1: { STMB_sidePromptHistory: metadata }, 2: { STMB_sidePromptHistory: metadata } } }, history));
    assert.throws(() => resolveSidePromptHistory({ entries: { 1: { comment: history.legacyTitles[0] }, 2: { comment: history.legacyTitles[0] } } }, history));
});

test('sideprompt history adopts the first matching legacy title by priority', () => {
    const history = buildSidePromptHistoryRequest(template, {}, sceneContext, 'Assess State', [
        'Assess State (STMB SidePrompt)', 'Assess State (STMB Scoreboard)',
    ]);
    const preferred = { comment: history.legacyTitles[0] };
    const fallback = { comment: history.legacyTitles[1] };
    const book = { entries: { 1: fallback, 2: preferred } };
    assert.equal(resolveSidePromptHistory(book, history).legacy, preferred);
    assert.equal(resolveSidePromptHistory({ entries: { 1: fallback } }, history).legacy, fallback);
    assert.throws(() => resolveSidePromptHistory({ entries: { ...book.entries, 3: { ...preferred } } }, history));
});

test('renames keep name-based history while explicit resolved titles stay separate', () => {
    const original = buildSidePromptHistoryRequest(template, { moduleSettings: { sidePromptVersioningEnabled: true } }, sceneContext, 'Assess State', ['Assess State (STMB SidePrompt)']);
    const renamed = buildSidePromptHistoryRequest({ ...template, name: 'Renamed' }, {}, sceneContext, 'Renamed', ['Renamed (STMB SidePrompt)']);
    const book = { entries: { 1: { comment: 'Assess State (STMB SidePrompt)', STMB_sidePromptHistory: { ...original, version: 1, sequence: 1 } } } };
    assert.equal(resolveSidePromptHistory(book, renamed).latest, book.entries[1]);

    const override = { ...template, settings: { saveAllVersions: true, lorebook: { entryTitleOverride: '{{person}}' } } };
    const alice = buildSidePromptHistoryRequest(override, {}, sceneContext, 'Alice', []);
    const bob = buildSidePromptHistoryRequest(override, {}, sceneContext, 'Bob', []);
    assert.notEqual(getSidePromptHistoryStreamKey({ ...alice, version: 1 }), getSidePromptHistoryStreamKey({ ...bob, version: 1 }));
});

test('legacy output is adopted once and latest history can be updated without appending', () => {
    const initial = buildSidePromptHistoryRequest(template, { moduleSettings: { sidePromptVersioningEnabled: true } }, sceneContext, 'Assess State', ['Assess State (STMB SidePrompt)']);
    const legacy = { comment: initial.legacyTitles[0], content: 'Previous output' };
    assert.equal(resolveSidePromptHistory({ entries: { 1: legacy } }, initial).legacy, legacy);
    const request = { ...initial, append: false };
    const latest = { ...legacy, STMB_sidePromptHistory: { ...request, version: 1, sequence: 2 } };
    assert.equal(resolveSidePromptHistory({ entries: { 1: latest } }, request).latest, latest);
    assert.equal(request.append, false);
});
