/* Simple i18n utility for Memory Books
 * - addLocaleData(locale, data)
 * - setLocale(locale)
 * - t(key, fallback?, params?)
 * - applyI18n(rootElement)
 *
 * Conventions supported:
 * 1) data-i18n="KEY"                -> sets textContent from KEY
 * 2) data-i18n="[attr]KEY"          -> sets attribute (e.g. [title], [placeholder], [aria-label]) from KEY
 * 3) data-i18n="[attr]KEY;KEY2"     -> multiple directives separated by ';'
 * Fallback: if KEY not found, uses current text/attribute value or provided fallback.
 */

const registry = {};
let currentLocale = 'en';

export function addLocaleData(locale, data) {
    if (!locale || typeof data !== 'object' || !data) return;
    registry[locale] = Object.assign(registry[locale] || {}, data);
}

export function setLocale(locale) {
    if (registry[locale]) {
        currentLocale = locale;
    } else {
        // keep 'en' if unknown locale; do not throw
        currentLocale = 'en';
    }
}

function interpolate(str, params) {
    if (!params || typeof params !== 'object') return str;
    return String(str).replace(/\{\{(\s*[^}]+\s*)\}\}/g, (_, p1) => {
        const key = String(p1).trim();
        return Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : `{{${key}}}`;
    });
}

export function t(key, fallback = '', params) {
    // Lookup order:
    // 1) current locale
    // 2) English ('en') base locale
    // 3) provided fallback or the key itself
    let val;
    if (registry[currentLocale] && Object.prototype.hasOwnProperty.call(registry[currentLocale], key)) {
        val = registry[currentLocale][key];
    } else if (currentLocale !== 'en' && registry['en'] && Object.prototype.hasOwnProperty.call(registry['en'], key)) {
        val = registry['en'][key];
    } else {
        val = fallback || key;
    }
    return interpolate(val, params);
}

function applyDirective(el, directive) {
    const trimmed = directive.trim();
    if (!trimmed) return;

    const attrMatch = trimmed.match(/^\[([^\]]+)]\s*(.+)$/);
    if (attrMatch) {
        const attr = attrMatch[1];
        const key = attrMatch[2].trim();
        const current = el.getAttribute(attr) || '';
        el.setAttribute(attr, t(key, current));
        return;
    }

    // No attribute -> textContent
    const key = trimmed;
    const currentText = el.textContent || '';
    el.textContent = t(key, currentText);
}

export function applyI18n(root) {
    const rootEl = root instanceof Element ? root : (root && root.dlg) ? root.dlg : document;
    const nodes = rootEl.querySelectorAll ? rootEl.querySelectorAll('[data-i18n]') : [];

    nodes.forEach((el) => {
        const value = el.getAttribute('data-i18n') || '';
        // multiple directives separated by ';'
        value.split(';').forEach(part => applyDirective(el, part));
    });
}

// For convenience in code: alias t as default-like function name
export { t as i18n };
