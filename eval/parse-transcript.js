#!/usr/bin/env node
/**
 * STMB-Auto Phase 0 — P0.1: Transcript parser + ground-truth derivation.
 *
 * Parses the eval fixture (SillyTavern .jsonl chat export, or the markdown
 * transcript), derives scene-boundary ground truth from narrator
 * [ 🕰️ | 🗓️ | 📍 ] header stamps, strips headers + internal-thought blocks,
 * and emits a normalized message array plus the ground-truth boundary list
 * as JSON (see stmb-auto-plan.md §3.1 / Phase 0).
 *
 * Boundary rule: a header narrator message starts a new scene when its
 * 📍 location differs from the previous header, or its timestamp jumps by
 * more than --time-jump minutes (default 90). Scenes shorter than
 * --min-scene messages (default 6) are merged into the previous scene.
 *
 * Usage:
 *   node eval/parse-transcript.js \
 *     --input "eval/materials/stmb-auto/Satire Fantasy Isekai - ….jsonl" \
 *     --out eval/out/fixture.json \
 *     [--user-tag Brandon] [--char-tag "Satire Fantasy Isekai"] \
 *     [--time-jump 90] [--min-scene 6]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);

// ---------------------------------------------------------------- CLI

function parseArgs(argv) {
    const opts = {
        input: null,
        out: null,
        userTag: 'Brandon',
        charTag: 'Satire Fantasy Isekai',
        timeJump: 90,
        minScene: 6,
    };
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        const next = () => argv[++i];
        switch (a) {
            case '--input': opts.input = next(); break;
            case '--out': opts.out = next(); break;
            case '--user-tag': opts.userTag = next(); break;
            case '--char-tag': opts.charTag = next(); break;
            case '--time-jump': opts.timeJump = Number(next()); break;
            case '--min-scene': opts.minScene = Number(next()); break;
            case '--help':
                console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0]);
                process.exit(0);
            default:
                throw new Error(`Unknown argument: ${a}`);
        }
    }
    if (!opts.input) throw new Error('--input is required');
    return opts;
}

// ---------------------------------------------------------------- header parsing

// [ 🕰️ Time 11:47 PM | 🗓️ Moonsday, Emberfall 13, Year 1247 … | 📍 Location | weather ]
const HEADER_RE = /\[\s*🕰️[^\]]*?\]/u;

function parseHeader(text) {
    const m = HEADER_RE.exec(text);
    if (!m) return null;
    const inner = m[0].slice(1, -1);
    const parts = inner.split('|').map(s => s.trim());
    const header = { raw: m[0], time: null, date: null, location: null };
    for (const p of parts) {
        if (p.startsWith('🕰️')) header.time = p.replace(/^🕰️\s*(Time\s*)?/u, '').trim();
        else if (p.startsWith('🗓️')) header.date = p.replace(/^🗓️\s*/u, '').trim();
        else if (p.startsWith('📍')) header.location = p.replace(/^📍\s*/u, '').trim();
    }
    return header;
}

// Fantasy calendar: "Moonsday, Emberfall 13, Year 1247 of the Aether Era".
// We only need ordering/deltas, so day-of-month + a month index + year suffice.
// Months observed in the fixture are handled; unknown months fall back to
// "date string changed => treat as > timeJump".
const MONTHS = ['Emberfall']; // extend as fixtures grow

function parseTimestamp(header) {
    if (!header.time || !header.date) return null;
    const t = /(\d{1,2}):(\d{2})\s*(AM|PM)?/i.exec(header.time);
    if (!t) return null; // e.g. "??:??"
    let hh = Number(t[1]) % 12;
    if (/pm/i.test(t[3] || '')) hh += 12;
    const minutes = hh * 60 + Number(t[2]);
    const d = /([A-Za-z]+)\s+(\d{1,2}),\s*Year\s*(\d+)/.exec(header.date);
    if (!d) return null;
    const monthIdx = MONTHS.indexOf(d[1]);
    if (monthIdx < 0) return null;
    const day = Number(d[2]);
    const year = Number(d[3]);
    // 30-day months assumed; only deltas matter and same-month deltas are exact.
    return (((year * 12 + monthIdx) * 30 + day) * 24 * 60) + minutes;
}

// ---------------------------------------------------------------- text cleaning

const THOUGHTS_RE = /<details[^>]*>[\s\S]*?<\/details>\s*/gi;
// Tagless variant: a "🧠 INTERNAL THOUGHTS" block always ends the message
// (a list of "- Name | Thoughts: …" items; verified across the fixture).
const THOUGHTS_TAIL_RE = /🧠\s*INTERNAL THOUGHTS[\s\S]*$/u;

function stripStructure(text) {
    return text
        .replace(new RegExp(HEADER_RE.source, 'gu'), '')
        .replace(THOUGHTS_RE, '')
        .replace(THOUGHTS_TAIL_RE, '')
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

// ---------------------------------------------------------------- input loaders

function loadJsonl(file) {
    const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean);
    const out = [];
    for (const line of lines) {
        const obj = JSON.parse(line);
        if (obj.chat_metadata !== undefined) continue; // header record
        out.push({ speaker: obj.name, isUser: !!obj.is_user, text: obj.mes });
    }
    return out;
}

// Markdown transcript: paragraphs prefixed "# ", messages start with
// "# <SpeakerTag>: " and run until the next speaker line.
function loadMarkdown(file, tags) {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    const tagRe = new RegExp(
        `^#\\s*(${tags.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')}):\\s*`,
    );
    const out = [];
    let cur = null;
    for (const line of lines) {
        const m = tagRe.exec(line);
        if (m) {
            if (cur) out.push(cur);
            cur = { speaker: m[1], text: line.slice(m[0].length) };
        } else if (cur) {
            cur.text += '\n' + line.replace(/^#\s?/, '');
        }
    }
    if (cur) out.push(cur);
    return out.map(m => ({
        speaker: m.speaker,
        isUser: null, // resolved against tags by the caller
        text: m.text.replace(/\\([*_`~[\]#.!()])/g, '$1').trim(),
    }));
}

// ---------------------------------------------------------------- ground truth

// Canonicalize a 📍 value so cosmetic restatements of the same place don't
// count as scene changes: "Courtyard, Statue Pedestal" ≡ "Courtyard",
// "Formerly The Heart" ≡ "The Heart", "The Dreadhold" ≡ "Dreadhold".
function canonLocation(loc) {
    if (!loc) return '';
    return loc
        .split(' - ')
        .map(part => part
            .toLowerCase()
            .replace(/,.*$/, '')
            .replace(/\bthe\s+/g, '')
            .replace(/\bformerly\s+/g, '')
            .trim())
        .join(' - ');
}

function deriveGroundTruth(messages, { timeJump, minScene }) {
    // 1. Raw boundaries from header stamps.
    let prev = null; // { location, ts, dateStr }
    const raw = [];
    for (const msg of messages) {
        const h = msg.header;
        if (!h) continue;
        const ts = parseTimestamp(h);
        if (prev) {
            const locChanged = canonLocation(h.location) !== canonLocation(prev.location);
            let jump = false;
            if (ts !== null && prev.ts !== null) {
                jump = Math.abs(ts - prev.ts) > timeJump;
            } else {
                // Unparseable timestamp (e.g. "??:??"): fall back to date-string change.
                jump = (h.date || '') !== (prev.dateStr || '');
            }
            if (locChanged || jump) {
                raw.push({
                    id: msg.id,
                    reason: locChanged && jump ? 'location+time' : locChanged ? 'location' : 'time',
                    location: h.location,
                    time: h.time,
                    date: h.date,
                    prevLocation: prev.location,
                    minutesJumped: ts !== null && prev.ts !== null ? ts - prev.ts : null,
                });
            }
        }
        prev = { location: h.location, ts, dateStr: h.date };
    }

    // 2. Merge scenes shorter than minScene messages into the previous scene.
    // Scene k spans [boundary_k, boundary_{k+1} - 1]; scene 0 starts at message 0.
    const merged = [];
    let sceneStart = 0;
    for (const b of raw) {
        if (b.id - sceneStart < minScene) {
            // Previous scene too short: drop this boundary's predecessor by
            // replacing the last merged boundary (extends the earlier scene).
            // Keep the *new* boundary only if the scene it would close out,
            // after merging, is still the active one.
            if (merged.length && b.id - merged[merged.length - 1].id < minScene) {
                continue; // absorbing into previous scene entirely
            }
        }
        merged.push(b);
        sceneStart = b.id;
    }

    return { raw, merged };
}

// ---------------------------------------------------------------- main

function main() {
    const opts = parseArgs(process.argv);
    const ext = path.extname(opts.input).toLowerCase();
    let msgs;
    if (ext === '.jsonl') {
        msgs = loadJsonl(opts.input);
    } else {
        msgs = loadMarkdown(opts.input, [opts.userTag, opts.charTag]);
        for (const m of msgs) m.isUser = m.speaker === opts.userTag;
    }

    const messages = msgs.map((m, i) => {
        const header = m.isUser ? null : parseHeader(m.text);
        return {
            id: i,
            speaker: m.speaker,
            isUser: m.isUser,
            header,
            text: stripStructure(m.text),
        };
    });

    const { raw, merged } = deriveGroundTruth(messages, opts);

    const result = {
        source: path.basename(opts.input),
        config: {
            userTag: opts.userTag,
            charTag: opts.charTag,
            timeJumpMinutes: opts.timeJump,
            minSceneMessages: opts.minScene,
        },
        stats: {
            messages: messages.length,
            headers: messages.filter(m => m.header).length,
            rawBoundaries: raw.length,
            mergedBoundaries: merged.length,
        },
        // Downstream detection must see plain prose only: header/thought
        // stripped text, no header metadata.
        messages: messages.map(m => ({
            id: m.id,
            speaker: m.speaker,
            isUser: m.isUser,
            text: m.text,
        })),
        groundTruth: {
            raw,
            merged: merged.map(b => b.id),
            mergedDetail: merged,
        },
    };

    const json = JSON.stringify(result, null, 2);
    if (opts.out) {
        fs.mkdirSync(path.dirname(opts.out), { recursive: true });
        fs.writeFileSync(opts.out, json);
        console.log(`Wrote ${opts.out}`);
    } else {
        console.log(json);
    }
    console.error(
        `messages=${result.stats.messages} headers=${result.stats.headers} ` +
        `raw=${result.stats.rawBoundaries} merged=${result.stats.mergedBoundaries}`,
    );
}

if (process.argv[1] === __filename) main();

export { parseHeader, parseTimestamp, stripStructure, deriveGroundTruth, loadJsonl, loadMarkdown };
