// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// auditorCadence.test.js — P5.5 unit tests for the cadence caller.
//
// Covers: incrementSceneMemoryCount, resolveAuditorCadence, setLastOfferAtCount,
// initializeAuditorCadenceState, maybeEnqueueAuditorOnOffer (gate + persist),
// enqueueAuditorJobByType (on-demand surface).

import test from 'node:test';
import assert from 'node:assert/strict';
import {
    resolveAuditorCadence,
    incrementSceneMemoryCount,
    setLastOfferAtCount,
    initializeAuditorCadenceState,
    maybeEnqueueAuditorOnOffer,
    enqueueAuditorJobByType,
    AUDIT_JOB_TYPES,
    CHAT_AUDITOR_DEFAULTS,
} from './auditorCadence.js';

// ----------------------------------------------------------------------------
// resolveAuditorCadence
// ----------------------------------------------------------------------------

test('resolveAuditorCadence: returns zeros for empty chat metadata', () => {
    const c = resolveAuditorCadence({});
    assert.equal(c.sceneMemoryCount, 0);
    assert.equal(c.lastOfferAtCount, 0);
});

test('resolveAuditorCadence: returns zeros for null', () => {
    const c = resolveAuditorCadence(null);
    assert.equal(c.sceneMemoryCount, 0);
    assert.equal(c.lastOfferAtCount, 0);
});

test('resolveAuditorCadence: returns stored values when present', () => {
    const meta = { stmbc: { auditor: { sceneMemoryCount: 17, lastOfferAtCount: 15 } } };
    const c = resolveAuditorCadence(meta);
    assert.equal(c.sceneMemoryCount, 17);
    assert.equal(c.lastOfferAtCount, 15);
});

test('resolveAuditorCadence: clamps negative values to zero', () => {
    const meta = { stmbc: { auditor: { sceneMemoryCount: -5, lastOfferAtCount: -10 } } };
    const c = resolveAuditorCadence(meta);
    assert.equal(c.sceneMemoryCount, 0);
    assert.equal(c.lastOfferAtCount, 0);
});

// ----------------------------------------------------------------------------
// initializeAuditorCadenceState
// ----------------------------------------------------------------------------

test('initializeAuditorCadenceState: backfills the auditor container', () => {
    const meta = {};
    initializeAuditorCadenceState(meta);
    assert.deepEqual(meta.stmbc.auditor, { ...CHAT_AUDITOR_DEFAULTS });
});

test('initializeAuditorCadenceState: is idempotent', () => {
    const meta = {};
    initializeAuditorCadenceState(meta);
    meta.stmbc.auditor.sceneMemoryCount = 42;
    initializeAuditorCadenceState(meta);
    assert.equal(meta.stmbc.auditor.sceneMemoryCount, 42);
});

test('initializeAuditorCadenceState: backfills missing fields only', () => {
    const meta = { stmbc: { auditor: { sceneMemoryCount: 7 } } };
    initializeAuditorCadenceState(meta);
    assert.equal(meta.stmbc.auditor.sceneMemoryCount, 7);
    assert.equal(meta.stmbc.auditor.lastOfferAtCount, 0);
});

// ----------------------------------------------------------------------------
// incrementSceneMemoryCount
// ----------------------------------------------------------------------------

test('incrementSceneMemoryCount: creates the container and counts to 1', () => {
    const meta = {};
    const next = incrementSceneMemoryCount(meta, 1);
    assert.equal(next, 1);
    assert.equal(meta.stmbc.auditor.sceneMemoryCount, 1);
});

test('incrementSceneMemoryCount: accumulates', () => {
    const meta = {};
    incrementSceneMemoryCount(meta, 1);
    incrementSceneMemoryCount(meta, 1);
    incrementSceneMemoryCount(meta, 1);
    assert.equal(meta.stmbc.auditor.sceneMemoryCount, 3);
});

test('incrementSceneMemoryCount: supports bulk increments', () => {
    const meta = {};
    const next = incrementSceneMemoryCount(meta, 5);
    assert.equal(next, 5);
});

test('incrementSceneMemoryCount: clamps non-positive delta to zero', () => {
    const meta = { stmbc: { auditor: { sceneMemoryCount: 4 } } };
    const next = incrementSceneMemoryCount(meta, -3);
    assert.equal(next, 4);
});

test('incrementSceneMemoryCount: returns 0 for null metadata', () => {
    const next = incrementSceneMemoryCount(null, 1);
    assert.equal(next, 0);
});

// ----------------------------------------------------------------------------
// setLastOfferAtCount
// ----------------------------------------------------------------------------

test('setLastOfferAtCount: persists and clamps to non-negative integer', () => {
    const meta = {};
    setLastOfferAtCount(meta, 15);
    assert.equal(meta.stmbc.auditor.lastOfferAtCount, 15);
    setLastOfferAtCount(meta, -3);
    assert.equal(meta.stmbc.auditor.lastOfferAtCount, 0);
});

// ----------------------------------------------------------------------------
// maybeEnqueueAuditorOnOffer — gate + persist
// ----------------------------------------------------------------------------

test('maybeEnqueueAuditorOnOffer: no-op when gate says no', () => {
    const meta = { stmbc: { auditor: { sceneMemoryCount: 5, lastOfferAtCount: 0 } } };
    const settings = { moduleSettings: { autoModule: { auditorEveryNScenes: 15, auditorOfferEnabled: true } } };
    const gate = (_s, _c, _l) => ({ shouldOffer: false, reason: 'below-threshold', suggestedJobType: 'stmbc-audit-coverage' });
    const enqueue = () => { throw new Error('enqueue should not be called'); };
    const result = maybeEnqueueAuditorOnOffer({
        settings,
        chatMeta: meta,
        maybeOfferAuditorJob: gate,
        enqueueStmbJob: enqueue,
    });
    assert.equal(result.shouldOffer, false);
    assert.equal(result.reason, 'below-threshold');
    assert.equal(result.enqueued, null);
    // lastOfferAtCount should NOT be advanced on a no-op
    assert.equal(meta.stmbc.auditor.lastOfferAtCount, 0);
});

test('maybeEnqueueAuditorOnOffer: enqueues when gate says yes, persists lastOfferAtCount', () => {
    const meta = { stmbc: { auditor: { sceneMemoryCount: 15, lastOfferAtCount: 0 } } };
    const settings = { moduleSettings: { autoModule: { auditorEveryNScenes: 15, auditorOfferEnabled: true } } };
    const gate = (_s, _c, _l) => ({ shouldOffer: true, reason: 'every-N-scene-memories', suggestedJobType: 'stmbc-audit-coverage' });
    const enqueued = { id: 'job-1', type: 'stmbc-audit-coverage' };
    const enqueue = (job) => enqueued;
    const result = maybeEnqueueAuditorOnOffer({
        settings,
        chatMeta: meta,
        maybeOfferAuditorJob: gate,
        enqueueStmbJob: enqueue,
    });
    assert.equal(result.shouldOffer, true);
    assert.equal(result.suggestedJobType, 'stmbc-audit-coverage');
    assert.equal(result.enqueued, enqueued);
    // lastOfferAtCount should advance to the current sceneMemoryCount
    assert.equal(meta.stmbc.auditor.lastOfferAtCount, 15);
});

test('maybeEnqueueAuditorOnOffer: handles gate throwing — graceful no-op', () => {
    const meta = { stmbc: { auditor: { sceneMemoryCount: 15, lastOfferAtCount: 0 } } };
    const settings = { moduleSettings: { autoModule: { auditorEveryNScenes: 15, auditorOfferEnabled: true } } };
    const gate = () => { throw new Error('gate blew up'); };
    const enqueue = () => { throw new Error('enqueue should not be called'); };
    const result = maybeEnqueueAuditorOnOffer({
        settings,
        chatMeta: meta,
        maybeOfferAuditorJob: gate,
        enqueueStmbJob: enqueue,
    });
    assert.equal(result.shouldOffer, false);
    assert.equal(result.reason, 'gate-error');
    assert.equal(meta.stmbc.auditor.lastOfferAtCount, 0);
});

test('maybeEnqueueAuditorOnOffer: handles missing gate function', () => {
    const meta = { stmbc: { auditor: { sceneMemoryCount: 15, lastOfferAtCount: 0 } } };
    const settings = { moduleSettings: { autoModule: {} } };
    const result = maybeEnqueueAuditorOnOffer({
        settings,
        chatMeta: meta,
        maybeOfferAuditorJob: null,
        enqueueStmbJob: () => ({ id: 'x' }),
    });
    assert.equal(result.shouldOffer, false);
});

test('maybeEnqueueAuditorOnOffer: handles enqueue throwing — still persists lastOfferAtCount', () => {
    const meta = { stmbc: { auditor: { sceneMemoryCount: 15, lastOfferAtCount: 0 } } };
    const settings = { moduleSettings: { autoModule: { auditorEveryNScenes: 15, auditorOfferEnabled: true } } };
    const gate = () => ({ shouldOffer: true, reason: 'every-N-scene-memories', suggestedJobType: 'stmbc-audit-coverage' });
    const enqueue = () => { throw new Error('enqueue blew up'); };
    const result = maybeEnqueueAuditorOnOffer({
        settings,
        chatMeta: meta,
        maybeOfferAuditorJob: gate,
        enqueueStmbJob: enqueue,
    });
    assert.equal(result.shouldOffer, true);
    assert.equal(result.enqueued, null);
    // The caller may still want to record a "we tried" so the next cadence waits
    assert.equal(meta.stmbc.auditor.lastOfferAtCount, 15);
});

// ----------------------------------------------------------------------------
// enqueueAuditorJobByType — on-demand surface
// ----------------------------------------------------------------------------

test('enqueueAuditorJobByType: enqueues coverage by default', () => {
    const enqueue = (job) => ({ ...job, id: 'j1' });
    const result = enqueueAuditorJobByType({ enqueueStmbJob: enqueue });
    assert.equal(result.ok, true);
    assert.equal(result.jobType, 'stmbc-audit-coverage');
    assert.equal(result.enqueued.type, 'stmbc-audit-coverage');
    assert.equal(result.enqueued.trigger, 'on-demand');
});

test('enqueueAuditorJobByType: accepts canonical type', () => {
    const enqueue = (job) => ({ ...job, id: 'j1' });
    const result = enqueueAuditorJobByType({ jobType: 'stmbc-audit-claims', enqueueStmbJob: enqueue });
    assert.equal(result.ok, true);
    assert.equal(result.jobType, 'stmbc-audit-claims');
});

test('enqueueAuditorJobByType: rejects unknown job types', () => {
    const enqueue = () => { throw new Error('should not be called'); };
    const result = enqueueAuditorJobByType({ jobType: 'stmbc-audit-nope', enqueueStmbJob: enqueue });
    assert.equal(result.ok, false);
    assert.equal(result.reason, 'unknown-job-type');
});

test('enqueueAuditorJobByType: rejects when no enqueue function', () => {
    const result = enqueueAuditorJobByType({ jobType: 'stmbc-audit-coverage', enqueueStmbJob: null });
    assert.equal(result.ok, false);
    assert.equal(result.reason, 'no-enqueue');
});

test('enqueueAuditorJobByType: handles enqueue throwing', () => {
    const enqueue = () => { throw new Error('boom'); };
    const result = enqueueAuditorJobByType({ jobType: 'stmbc-audit-coverage', enqueueStmbJob: enqueue });
    assert.equal(result.ok, false);
    assert.equal(result.reason, 'enqueue-failed');
});

test('AUDIT_JOB_TYPES: lists all four jobs', () => {
    assert.equal(AUDIT_JOB_TYPES.length, 4);
    assert.ok(AUDIT_JOB_TYPES.includes('stmbc-audit-coverage'));
    assert.ok(AUDIT_JOB_TYPES.includes('stmbc-audit-regenerate'));
    assert.ok(AUDIT_JOB_TYPES.includes('stmbc-audit-technical'));
    assert.ok(AUDIT_JOB_TYPES.includes('stmbc-audit-claims'));
});
