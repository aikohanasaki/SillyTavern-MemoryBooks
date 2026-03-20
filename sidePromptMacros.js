import { substituteParamsExtended } from '../../../../script.js';

const MACRO_TOKEN_REGEX = /{{[^{}]+}}/g;

function uniqueExact(values = []) {
    const seen = new Set();
    const out = [];
    for (const value of values) {
        if (seen.has(value)) continue;
        seen.add(value);
        out.push(value);
    }
    return out;
}

function toRuntimeMacroEnv(runtimeMacros = {}) {
    const env = {};
    for (const [token, value] of Object.entries(runtimeMacros || {})) {
        if (typeof token !== 'string' || !token.startsWith('{{') || !token.endsWith('}}')) continue;
        env[token.slice(2, -2)] = value ?? '';
    }
    return env;
}

function parseQuotedSegment(input, start) {
    const quote = input[start];
    if (quote !== '"' && quote !== '\'') {
        return { error: 'expected_quote', end: start };
    }

    let value = '';
    let i = start + 1;
    while (i < input.length) {
        const ch = input[i];
        if (ch === '\\' && i + 1 < input.length) {
            value += input[i + 1];
            i += 2;
            continue;
        }
        if (ch === quote) {
            return { value, end: i + 1 };
        }
        value += ch;
        i++;
    }

    return { value, end: input.length, incomplete: true };
}

export function extractMacroTokens(text) {
    const content = String(text || '');
    return uniqueExact(content.match(MACRO_TOKEN_REGEX) || []);
}

export function applySidePromptMacros(text, runtimeMacros = {}) {
    return substituteParamsExtended(String(text || ''), toRuntimeMacroEnv(runtimeMacros));
}

export function collectTemplateRuntimeMacros(templateLike, runtimeMacros = {}) {
    const prompt = typeof templateLike === 'string' ? templateLike : String(templateLike?.prompt || '');
    const responseFormat = typeof templateLike === 'string' ? '' : String(templateLike?.responseFormat || '');
    const unresolvedPrompt = extractMacroTokens(applySidePromptMacros(prompt, runtimeMacros));
    const unresolvedFormat = extractMacroTokens(applySidePromptMacros(responseFormat, runtimeMacros));
    return uniqueExact([...unresolvedPrompt, ...unresolvedFormat]);
}

export function hasTemplateRuntimeMacros(templateLike) {
    return collectTemplateRuntimeMacros(templateLike).length > 0;
}

export function formatQuotedSidePromptName(name) {
    return `"${String(name || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

export function parseSidePromptCommandInput(input, options = {}) {
    const allowIncomplete = !!options.allowIncomplete;
    const source = String(input || '');
    const result = {
        source,
        name: '',
        nameClosed: false,
        runtimeMacros: {},
        range: null,
        trailing: '',
        error: null,
        macroToken: null,
    };

    let i = 0;
    while (i < source.length && /\s/.test(source[i])) i++;
    if (i >= source.length) return result;

    if (source[i] !== '"' && source[i] !== '\'') {
        if (allowIncomplete) {
            result.trailing = source.slice(i);
            return result;
        }
        result.error = 'missing_name_quotes';
        return result;
    }

    const nameParsed = parseQuotedSegment(source, i);
    result.name = nameParsed.value || '';
    if (nameParsed.incomplete) {
        if (allowIncomplete) return result;
        result.error = 'unterminated_name';
        return result;
    }

    result.nameClosed = true;
    i = nameParsed.end;

    while (i < source.length) {
        while (i < source.length && /\s/.test(source[i])) i++;
        if (i >= source.length) return result;

        const remaining = source.slice(i);
        const rangeMatch = remaining.match(/^(\d+)\s*[-–—]\s*(\d+)\s*$/);
        if (rangeMatch) {
            result.range = `${rangeMatch[1]}-${rangeMatch[2]}`;
            return result;
        }

        const macroMatch = remaining.match(/^(\{\{[^{}]+\}\})\s*=\s*/);
        if (!macroMatch) {
            if (allowIncomplete) {
                result.trailing = remaining;
                return result;
            }
            result.error = 'invalid_token';
            return result;
        }

        const token = macroMatch[1];
        i += macroMatch[0].length;

        if (i >= source.length || (source[i] !== '"' && source[i] !== '\'')) {
            if (allowIncomplete) {
                result.trailing = remaining;
                return result;
            }
            result.error = 'macro_value_must_be_quoted';
            result.macroToken = token;
            return result;
        }

        const valueParsed = parseQuotedSegment(source, i);
        if (valueParsed.incomplete) {
            if (allowIncomplete) {
                result.trailing = source.slice(i - macroMatch[0].length);
                return result;
            }
            result.error = 'unterminated_macro_value';
            result.macroToken = token;
            return result;
        }

        result.runtimeMacros[token] = valueParsed.value || '';
        i = valueParsed.end;
    }

    return result;
}

export function buildSidePromptMacroSuggestion(rawInput, draft, token) {
    const source = String(rawInput || '');
    const trailing = String(draft?.trailing || '');
    const base = trailing ? source.slice(0, source.length - trailing.length) : source;
    const trimmed = base.replace(/\s+$/, '');
    return `${trimmed}${trimmed ? ' ' : ''}${token}=""`;
}
