// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// Offline unit tests for the review-queue + nudges core (P4.3). Exercises the
// pure, SillyTavern-free logic — config merge, JSON-retry primitives, self-flag
// detection, review-queue entry helpers, and nudge decisions — without
// SillyTavern. Run: `node review.test.js`.

import assert from 'node:assert/strict';
import test from 'node:test';
import {
    REVIEW_DEFAULTS,
    resolveReviewConfig,
    countTokensDefault,
    JSON_RETRY_REPRIMAND,
    isRecoverableJsonError,
    buildJsonRetryPrompt,
    SELF_FLAG_PATTERNS,
    detectSelfFlags,
    makeReviewEntry,
    buildReviewReasons,
    pushReviewEntry,
    dismissReviewEntry,
    shouldOfferConsolidationNudge,
    shouldOfferCompactionNudge,
} from './reviewCore.js';

// ---------------------------------------------------------------- config

test('resolveReviewConfig: defaults when nothing set; enabled by default', () => {
    const cfg = resolveReviewConfig({}, {});
    assert.equal(cfg.enabled, true);
    assert.equal(cfg.consolidationThreshold, REVIEW_DEFAULTS.consolidationThreshold);
    assert.equal(cfg.compactionTokenThreshold, REVIEW_DEFAULTS.compactionTokenThreshold);
});

test('resolveReviewConfig: global values apply; per-chat wins over global', () => {
    const cfg = resolveReviewConfig(
        { review: { consolidationThreshold: 30, compactionTokenThreshold: 800, enabled: false } },
        { review: { consolidationThreshold: 5 } },
    );
    assert.equal(cfg.consolidationThreshold, 5);
    assert.equal(cfg.compactionTokenThreshold, 800);
    assert.equal(cfg.enabled, false);
});

test('resolveReviewConfig: per-chat enabled overrides global enabled', () => {
    const cfg = resolveReviewConfig({ review: { enabled: false } }, { review: { enabled: true } });
    assert.equal(cfg.enabled, true);
});

test('resolveReviewConfig: ignores non-finite overrides', () => {
    const cfg = resolveReviewConfig({ review: { consolidationThreshold: 'nope' } }, {});
    assert.equal(cfg.consolidationThreshold, REVIEW_DEFAULTS.consolidationThreshold);
});

// ---------------------------------------------------------------- token counting

test('countTokensDefault: chars/4 ceiling, matches injectionCore heuristic', () => {
    assert.equal(countTokensDefault(''), 0);
    assert.equal(countTokensDefault('abcd'), 1);
    assert.equal(countTokensDefault('abcde'), 2);
    assert.equal(countTokensDefault(null), 0);
});

// ---------------------------------------------------------------- JSON retry

test('isRecoverableJsonError: only recoverable === true counts', () => {
    assert.equal(isRecoverableJsonError({ recoverable: true }), true);
    assert.equal(isRecoverableJsonError({ recoverable: false }), false);
    assert.equal(isRecoverableJsonError({}), false);
    assert.equal(isRecoverableJsonError(null), false);
});

test('buildJsonRetryPrompt: appends reprimand after the original prompt', () => {
    const built = buildJsonRetryPrompt('ORIGINAL', 'REPRIMAND');
    assert.ok(built.startsWith('ORIGINAL'));
    assert.ok(built.endsWith('REPRIMAND'));
    assert.ok(built.includes('\n\n'));
});

test('buildJsonRetryPrompt: defaults to JSON_RETRY_REPRIMAND', () => {
    const built = buildJsonRetryPrompt('P');
    assert.ok(built.includes(JSON_RETRY_REPRIMAND));
});

// ---------------------------------------------------------------- self-flag detection

test('detectSelfFlags: empty/no-match content yields no flags', () => {
    assert.deepEqual(detectSelfFlags(''), []);
    assert.deepEqual(detectSelfFlags(null), []);
    assert.deepEqual(detectSelfFlags('The scene was calm and nothing eventful happened.'), []);
});

test('detectSelfFlags: matches "unspecified" and returns an excerpt', () => {
    const flags = detectSelfFlags('Her hair color is unspecified in the scene.');
    assert.equal(flags.length, 1);
    assert.equal(flags[0].reason, 'unspecified');
    assert.ok(flags[0].excerpt.includes('unspecified'));
});

test('detectSelfFlags: matches ambiguity/ambiguous variants', () => {
    assert.equal(detectSelfFlags('There is some ambiguity about the timeline.')[0].reason, 'ambiguity');
    assert.equal(detectSelfFlags('The dialogue is ambiguous here.')[0].reason, 'ambiguity');
});

test('detectSelfFlags: matches contradiction variants', () => {
    assert.equal(detectSelfFlags('This contradicts the established fact.')[0].reason, 'contradiction');
    assert.equal(detectSelfFlags('A contradiction was found in the text.')[0].reason, 'contradiction');
});

test('detectSelfFlags: multiple distinct patterns all reported, one match each', () => {
    const flags = detectSelfFlags('Unspecified detail, plus an ambiguous line, plus a contradiction.');
    assert.equal(flags.length, 3);
    const reasons = flags.map(f => f.reason).sort();
    assert.deepEqual(reasons, ['ambiguity', 'contradiction', 'unspecified']);
});

test('detectSelfFlags: excerpt is trimmed and bounded, not the whole content', () => {
    const long = `${'x '.repeat(200)}unspecified${' y'.repeat(200)}`;
    const flags = detectSelfFlags(long);
    assert.equal(flags.length, 1);
    assert.ok(flags[0].excerpt.length < long.length);
});

test('SELF_FLAG_PATTERNS is frozen and has exactly the three documented reasons', () => {
    assert.ok(Object.isFrozen(SELF_FLAG_PATTERNS));
    assert.deepEqual(SELF_FLAG_PATTERNS.map(p => p.reason), ['unspecified', 'ambiguity', 'contradiction']);
});

// ---------------------------------------------------------------- review-queue entries

test('makeReviewEntry: normalizes shape and defaults', () => {
    const entry = makeReviewEntry({
        jobId: 'job-1', chatKey: 'char:x', lorebookName: 'Book', entryTitle: 'Memory 1',
        range: { start: 10, end: 20 }, reasons: [{ type: 'json_retry', detail: 'd' }], createdAt: 123,
    });
    assert.equal(entry.id, 'job-1');
    assert.equal(entry.jobId, 'job-1');
    assert.equal(entry.lorebookName, 'Book');
    assert.deepEqual(entry.range, { start: 10, end: 20 });
    assert.equal(entry.reasons.length, 1);
    assert.equal(entry.dismissed, false);
    assert.equal(entry.createdAt, 123);
});

test('makeReviewEntry: missing/invalid range becomes null, missing reasons becomes []', () => {
    const entry = makeReviewEntry({ jobId: 'j', range: { start: 'x' }, reasons: null });
    assert.equal(entry.range, null);
    assert.deepEqual(entry.reasons, []);
});

test('buildReviewReasons: empty when nothing flagged', () => {
    assert.deepEqual(buildReviewReasons({ jsonRetried: false, selfFlags: [] }), []);
    assert.deepEqual(buildReviewReasons({}), []);
});

test('buildReviewReasons: json_retry reason present when flagged', () => {
    const reasons = buildReviewReasons({ jsonRetried: true, selfFlags: [] });
    assert.equal(reasons.length, 1);
    assert.equal(reasons[0].type, 'json_retry');
});

test('buildReviewReasons: one self_flag reason per detected flag, combines with json_retry', () => {
    const reasons = buildReviewReasons({
        jsonRetried: true,
        selfFlags: [{ reason: 'unspecified', excerpt: 'e1' }, { reason: 'contradiction', excerpt: 'e2' }],
    });
    assert.equal(reasons.length, 3);
    assert.equal(reasons.filter(r => r.type === 'self_flag').length, 2);
});

test('pushReviewEntry: prepends, dedups by jobId, caps to limit', () => {
    let queue = [];
    for (let i = 0; i < 5; i++) {
        queue = pushReviewEntry(queue, makeReviewEntry({ jobId: `j${i}`, createdAt: i }), 3);
    }
    assert.equal(queue.length, 3);
    assert.deepEqual(queue.map(e => e.jobId), ['j4', 'j3', 'j2']);
});

test('pushReviewEntry: re-adding the same jobId replaces (not duplicates) and moves to front', () => {
    let queue = [makeReviewEntry({ jobId: 'a', createdAt: 1 }), makeReviewEntry({ jobId: 'b', createdAt: 2 })];
    queue = pushReviewEntry(queue, makeReviewEntry({ jobId: 'a', createdAt: 99 }));
    assert.equal(queue.length, 2);
    assert.equal(queue[0].jobId, 'a');
    assert.equal(queue[0].createdAt, 99);
});

test('dismissReviewEntry: removes only the matching jobId', () => {
    const queue = [makeReviewEntry({ jobId: 'a' }), makeReviewEntry({ jobId: 'b' })];
    const next = dismissReviewEntry(queue, 'a');
    assert.equal(next.length, 1);
    assert.equal(next[0].jobId, 'b');
});

test('dismissReviewEntry: tolerates a non-array queue', () => {
    assert.deepEqual(dismissReviewEntry(null, 'a'), []);
});

// ---------------------------------------------------------------- nudge decisions

test('shouldOfferConsolidationNudge: fires at/above threshold, not below', () => {
    assert.equal(shouldOfferConsolidationNudge({ scenesSinceNudge: 19, threshold: 20 }), false);
    assert.equal(shouldOfferConsolidationNudge({ scenesSinceNudge: 20, threshold: 20 }), true);
    assert.equal(shouldOfferConsolidationNudge({ scenesSinceNudge: 21, threshold: 20 }), true);
});

test('shouldOfferConsolidationNudge: falls back to default threshold when invalid', () => {
    assert.equal(shouldOfferConsolidationNudge({ scenesSinceNudge: 20, threshold: 0 }), true);
    assert.equal(shouldOfferConsolidationNudge({ scenesSinceNudge: 19, threshold: NaN }), false);
});

test('shouldOfferConsolidationNudge: a negative threshold clamps to 1, not the default', () => {
    assert.equal(shouldOfferConsolidationNudge({ scenesSinceNudge: 1, threshold: -5 }), true);
});

test('shouldOfferCompactionNudge: fires strictly above threshold', () => {
    assert.equal(shouldOfferCompactionNudge({ tokenCount: 500, threshold: 500 }), false);
    assert.equal(shouldOfferCompactionNudge({ tokenCount: 501, threshold: 500 }), true);
});

test('shouldOfferCompactionNudge: falls back to default threshold when invalid', () => {
    assert.equal(shouldOfferCompactionNudge({ tokenCount: 501, threshold: NaN }), true);
    assert.equal(shouldOfferCompactionNudge({ tokenCount: 400, threshold: NaN }), false);
});
