// Copyright (C) 2024–2026 Aiko Hanasaki
// SPDX-License-Identifier: AGPL-3.0-only
//
// eval/parser.js — SillyTavern JSONL parser for STMB-Auto Phase 0.
//
// Reads a SillyTavern JSONL chat export and returns an array of messages
// with 1-based message indices. The first line of a JSONL export is the
// chat_metadata header and is NOT counted; the first real message is index 1.
//
// Each emitted message has:
//   { index, speaker, isUser, isSystem, text, sendDate, headers }
//
//   - index: 1-based message index (skips the metadata header line).
//   - speaker: the `name` field from the source line.
//   - isUser: the `is_user` flag.
//   - isSystem: true if `is_system` is true OR the speaker is "unused"/empty
//               and there is no `mes` (some exports inject empty system
//               shells that carry no content).
//   - text: the raw `mes` string. Header line, internal-thought blocks, and
//           other markup are preserved verbatim at this stage — stripping
//           is the renderer's job.
//   - sendDate: parsed ISO date from `send_date` (or null if absent).
//   - headers: parsed header fields if the `mes` begins with a `[ 🕰️ ... ]`
//              block. { time: "11:47 PM", date: "Moonsday, Emberfall 13, ...",
//              location: "Abandoned Dungeon - Ritual Chamber", weather: ... }
//
// Lines that are not valid JSON, or that don't carry a `name`, are skipped
// silently and a warning is emitted on stderr.

import { readFile } from 'node:fs/promises';

const HEADER_RE = /^\[\s*(.+?)\s*\]\s*/s;
// Header fields are pipe-separated. Splitting by '|' is more reliable than
// chasing emoji-specific lookbehinds because new weather/stamp emojis may
// appear over time.
const TIME_RE = /🕰️\s*Time\s+(\d{1,2}):(\d{2})\s*(AM|PM)?/i;
const DATE_RE = /🗓️\s*(.+)/;
const LOCATION_RE = /📍\s*(.+)/;
const WEATHER_EMOJI_RE = /^(🌫|🌤|☀|🌧|🌦|⛅|🌇|🍂|☁|🌨|⛈|🌩|❄)/;

/**
 * Parse a single line of SillyTavern JSONL.
 *
 * @param {string} line
 * @param {number} lineIndex0  - 0-based line index in the source file (for error reporting).
 * @returns {{ kind: 'metadata' } | { kind: 'message', message: object } | { kind: 'skipped', reason: string }}
 */
export function parseJsonlLine(line, lineIndex0) {
    let obj;
    try {
        obj = JSON.parse(line);
    } catch (err) {
        return { kind: 'skipped', reason: `line ${lineIndex0}: invalid JSON: ${err.message}` };
    }
    if (obj && typeof obj === 'object' && obj.chat_metadata && !('mes' in obj)) {
        return { kind: 'metadata' };
    }
    if (!obj || typeof obj !== 'object' || !('name' in obj) || !('mes' in obj)) {
        return { kind: 'skipped', reason: `line ${lineIndex0}: not a message` };
    }
    return { kind: 'message', message: obj };
}

/**
 * Parse the header block at the start of a narrator `mes` string.
 *
 * @param {string} mes
 * @returns {null | { time: string|null, date: string|null, location: string|null, weather: string|null, raw: string }}
 */
export function parseHeader(mes) {
    const m = mes.match(HEADER_RE);
    if (!m) return null;
    const inside = m[1];
    const out = { time: null, date: null, location: null, weather: null, raw: inside };
    // Split by '|' and inspect each segment for its emoji prefix.
    const parts = inside.split('|').map((p) => p.trim());
    for (const part of parts) {
        const t = part.match(TIME_RE);
        if (t) {
            out.time = `${t[1]}:${t[2]}${t[3] ? ' ' + t[3].toUpperCase() : ''}`;
            continue;
        }
        const d = part.match(DATE_RE);
        if (d) {
            out.date = d[1].trim();
            continue;
        }
        const l = part.match(LOCATION_RE);
        if (l) {
            out.location = l[1].trim();
            continue;
        }
        if (WEATHER_EMOJI_RE.test(part)) {
            // Strip leading emoji and any trailing pipe residue.
            out.weather = part.replace(WEATHER_EMOJI_RE, '').trim();
            continue;
        }
    }
    return out;
}

/**
 * Strip narrator headers and `<details>` internal-thought blocks from a message
 * text. This is what the detection prompt sees; the headers are the ground
 * truth source, not detection input.
 *
 * @param {string} mes
 * @returns {string}
 */
export function stripForDetection(mes) {
    let s = mes.replace(HEADER_RE, '');
    // Remove <details>...</details> blocks (internal thoughts)
    s = s.replace(/<details[\s\S]*?<\/details>/gi, '');
    // Normalize line endings, trim, and collapse runs of blank lines that
    // appeared where header / details blocks used to be.
    s = s.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
    return s;
}

/**
 * Parse a SillyTavern JSONL file into structured messages.
 *
 * @param {string} filePath
 * @returns {Promise<{ messages: object[], warnings: string[] }>}
 */
export async function parseJsonlFile(filePath) {
    const text = await readFile(filePath, 'utf8');
    return parseJsonlText(text);
}

/**
 * Parse a SillyTavern JSONL string into structured messages.
 *
 * @param {string} text
 * @returns {{ messages: object[], warnings: string[] }}
 */
export function parseJsonlText(text) {
    const lines = text.split(/\r?\n/);
    const messages = [];
    const warnings = [];
    let messageIndex = 0;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim() === '') continue;
        const parsed = parseJsonlLine(line, i);
        if (parsed.kind === 'metadata') continue;
        if (parsed.kind === 'skipped') {
            warnings.push(parsed.reason);
            continue;
        }
        messageIndex++;
        const m = parsed.message;
        const headers = parseHeader(m.mes ?? '');
        messages.push({
            index: messageIndex,
            speaker: m.name ?? null,
            isUser: !!m.is_user,
            isSystem: !!m.is_system,
            text: m.mes ?? '',
            sendDate: m.send_date ?? null,
            headers,
        });
    }
    return { messages, warnings };
}

/**
 * Format a message for the detection prompt: `[id] SpeakerName: text...`
 * Truncated to `maxChars` (default 500 — matches plan §3.3 production default).
 *
 * @param {object} message
 * @param {number} [maxChars=500]
 * @returns {string}
 */
export function formatForPrompt(message, maxChars = 500) {
    const speaker = message.speaker ?? (message.isSystem ? 'system' : 'unknown');
    const text = stripForDetection(message.text);
    const truncated = text.length > maxChars ? text.slice(0, maxChars) + '…' : text;
    return `[${message.index}] ${speaker}: ${truncated}`;
}