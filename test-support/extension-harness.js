// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
import { readFileSync } from 'node:fs';
import { SourceTextModule, SyntheticModule, createContext } from 'node:vm';
import sha256 from 'js-sha256';

// Evaluate the real browser modules with explicit SillyTavern/service boundaries.
// No browser, network, filesystem writes, or provider credentials are used here.
export async function loadExtensionModule(entry, { values = {}, globals = {}, expose = [] } = {}) {
    const real = new Set([
        entry, 'relationshipPromptDefaults.js', 'relationshipPromptMigration.js',
        'relationshipPromptLegacy.js', 'sidePromptMacros.js',
    ]);
    const context = createContext({
        crypto, TextEncoder, structuredClone, URL, Date, setTimeout, clearTimeout,
        btoa, atob, console: { log() {}, debug() {}, warn() {}, error() {} },
        ...globals,
    });
    const cache = new Map();
    const imports = new Map();
    function moduleFor(file) {
        if (cache.has(file)) return cache.get(file);
        let source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
        for (const match of source.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g)) {
            const names = match[1].split(',').map(part => part.trim().split(/\s+as\s+/)[0]).filter(Boolean);
            imports.set(`${file}:${match[2]}`, names);
        }
        if (file === entry && expose.length) source += `\nexport { ${expose.join(', ')} };`;
        const mod = new SourceTextModule(source, { context, identifier: file });
        cache.set(file, mod);
        return mod;
    }
    const main = moduleFor(entry);
    await main.link((specifier, parent) => {
        if (specifier === 'js-sha256') {
            return new SyntheticModule(['default'], function () { this.setExport('default', sha256); }, { context });
        }
        const file = specifier.replace(/^\.\//, '');
        if (real.has(file)) return moduleFor(file);
        const names = imports.get(`${parent.identifier}:${specifier}`);
        return new SyntheticModule(names, function () {
            for (const name of names) this.setExport(name, Object.hasOwn(values, name) ? values[name] : (() => {
                throw new Error(`Unexpected unstubbed boundary: ${name}`);
            }));
        }, { context });
    });
    await main.evaluate();
    return main.namespace;
}

export const identityTranslate = text => text;
export const substituteTestMacros = (text, env = {}) => text.replace(/\{\{([^{}]+)\}\}/g,
    (token, name) => name === 'user' ? 'Morgan' : name === 'char' ? 'Alex' : (env[name] ?? token));
