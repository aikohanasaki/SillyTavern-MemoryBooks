import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('./stmemory.js', import.meta.url), 'utf8');
const helper = source.slice(source.indexOf('function cloneScriptEnabled('), source.indexOf('// --- Custom Error Types')).replace('export function', 'function');
function fixture(runRegexScript, getRegexScripts = () => [{}, {}]) {
    return vm.runInNewContext(`${helper}; applySelectedRegex`, { runRegexScript, getRegexScripts, console: { warn() {} } });
}
test('strict outgoing mode propagates script and lookup failures; incoming stays best effort', () => {
    const failure = new Error('failed');
    for (const apply of [fixture(() => { throw failure; }), fixture(() => {}, () => { throw failure; })]) {
        assert.throws(() => apply('private', ['idx:0'], { throwOnError: true }), e => e === failure);
        assert.equal(apply('private', ['idx:0']), 'private');
    }
});
test('strict mode rejects missing selections and non-text results', () => {
    const apply = fixture(() => undefined);
    for (const key of ['idx:9', 'idx:-1', 'invalid']) {
        assert.throws(() => apply('private', [key], { throwOnError: true }), /unavailable/);
    }
    assert.throws(() => apply('private', ['idx:0'], { throwOnError: true }), /non-text/);
});
test('strict mode preserves ordered transformations and valid empty output', () => {
    const apply = fixture((script, text) => { assert.equal(script.disabled, false); return text.slice(1); });
    assert.equal(apply('abc', ['idx:1', 'idx:0'], { throwOnError: true }), 'c');
    assert.equal(apply('a', ['idx:0'], { throwOnError: true }), '');
    assert.equal(apply('private', [], { throwOnError: true }), 'private');
});
test('all outgoing call sites opt into strict mode and rethrow before fallback', () => {
    for (const file of ['stmemory.js', 'sidePrompts.js', 'clipReview.js', 'clipManager.js']) {
        const text = readFileSync(new URL(`./${file}`, import.meta.url), 'utf8');
        assert.match(text, /applySelectedRegex\((?:finalPrompt|prompt), selectedKeys, \{ throwOnError: true \}\)/);
        assert.match(text, /console.warn\('STMemoryBooks: [^'\n]*outgoing regex application failed', e\);\s*throw e;/);
    }
});
