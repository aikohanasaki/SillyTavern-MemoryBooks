// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only

/** Sort a displayed collection without changing its source order. */
export function createViewSort() {
    let field = null;
    let direction = 0;
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
    return {
        get field() { return field; },
        get direction() { return direction; },
        reset() { field = null; direction = 0; },
        cycle(next) {
            direction = field === next ? (direction === 1 ? -1 : direction === -1 ? 0 : 1) : 1;
            field = direction ? next : null;
        },
        order(items, fields) {
            const original = Array.from(items || []);
            if (!field || !fields[field]) return original;
            const get = fields[field];
            return original.map((item, index) => ({ item, index })).sort((a, b) => {
                const left = get(a.item);
                const right = get(b.item);
                const comparison = typeof left === 'number' && typeof right === 'number'
                    ? left - right : collator.compare(String(left ?? ''), String(right ?? ''));
                return direction * comparison || a.index - b.index;
            }).map(entry => entry.item);
        },
    };
}
