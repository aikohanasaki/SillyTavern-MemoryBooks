import { extension_settings } from '../../../extensions.js';
import { chat, name1, name2, saveMetadata } from '../../../../script.js';
import { getContext } from '../../../extensions.js';
import { getSceneMarkers, saveMetadataForCurrentContext } from './sceneManager.js';
import { createSceneRequest, compileScene } from './chatcompile.js';
import { sendRawCompletionRequest } from './stmemory.js';
import { executeSlashCommands } from '../../../slash-commands.js';
import { getCurrentApiInfo, getCurrentModelSettings } from './utils.js';

const ARC_ANALYZER_PROMPT = `You are Arc Analyzer. Segment a chat transcript into realistic, self-contained narrative arcs suitable to become chapters.

Input format: The chat history is provided as a JSON array of messages. Each item has:
- id: the 0-based message index in the chat log
- name: speaker name
- is_user: boolean indicating if the user is the speaker
- mes: message content

Output format (strict): return ONLY a JSON array of objects (no prose, no code fences). Each object has:
- title: short, concrete title (<= 8 words)
- summary: 2–4 sentences summarizing the arc’s main beats
- chapterEnd: 0-based integer index of the final message in this arc (use the id field from the input)
- justification: 1–2 sentences explaining why this endpoint is a coherent boundary

Rules:
- Produce 3–7 arcs when possible; fewer is OK if the chat is short.
- Arcs must be contiguous, non-overlapping, and strictly increasing by chapterEnd.
- The end of the chapter should be the end of the day
- Choose chapterEnd at natural beats: resolution/decision, reveal, scene change, escalation, or clear pause/transition.
- Prefer the latest message that still completes the arc (avoid cutting off mid-beat).
- Never invent details; base everything only on the provided transcript.
- Only use IDs that appear in the transcript (hidden messages are omitted).
- Use only indices that exist (0..N-1) and keep JSON valid.`;

const ARC_ANALYZER_TEMPLATE = `Chat History (JSON array):
{{chatHistory}}

Analyze the chat and propose arcs according to the rules. Use the id field from the JSON items to select chapterEnd. Return only the JSON array of {title, summary, chapterEnd, justification}.`;

const MAX_MESSAGES_FOR_ANALYSIS = 300;

/**
 * Robustly parses a JSON array from a string, cleaning up common AI response artifacts.
 * @param {string} text - The text containing the JSON array.
 * @returns {Array} The parsed array.
 * @throws {Error} If parsing fails.
 */
function parseJsonArray(text) {
    if (!text || typeof text !== 'string') {
        throw new Error('AI response is empty or invalid.');
    }

    let cleanText = text.trim();

    // Remove markdown code fences
    cleanText = cleanText.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');

    // Find the start and end of the array
    const start = cleanText.indexOf('[');
    const end = cleanText.lastIndexOf(']');

    if (start === -1 || end === -1 || end < start) {
        throw new Error('Could not find a valid JSON array in the AI response.');
    }

    cleanText = cleanText.substring(start, end + 1);

    try {
        return JSON.parse(cleanText);
    } catch (error) {
        console.error('Failed to parse JSON array:', error);
        console.error('Cleaned text was:', cleanText);
        throw new Error(`AI did not return a valid JSON array: ${error.message}`);
    }
}


async function showArcPopup(arcs, sceneStart) {
    const { Popup } = getContext();
    if (!Array.isArray(arcs) || arcs.length === 0) {
        await Popup.show.text('Arc Analyzer', 'No valid arcs found.');
        return;
    }

    const listHtml = arcs
        .map(a => `<div class="arc-item"><b>${a.title}</b> <small>(end @ ${a.chapterEnd})</small><br>${a.summary}<br><i>${a.justification || ''}</i></div>`)
        .join('<hr class="sysHR">');

    const customButtons = [];
    let summarizerProfileName = '';
    try {
        const profiles = extension_settings.STMemoryBooks?.connectionManager?.profiles || [];
        const prof = profiles.find(p => p.id === extension_settings.STMemoryBooks.profile);
        summarizerProfileName = prof?.name || '';
    } catch (_) { /* ignore */ }

    const quoteArg = (s) => String(s).replace(/"/g, '\\"');
    for (const a of arcs) {
        customButtons.push({
            text: `End @ ${a.chapterEnd}: ${a.title}`,
            classes: ['menu_button'],
            result: 1,
            action: async () => {
                try {
                    const mesId = Number(a.chapterEnd);
                    const mesEl = document.querySelector(`.mes[mesid="${mesId}"]`);
                    if (!mesEl) {
                        console.error(`Arc Analyzer: Message ${mesId} not found. The chat may have changed.`);
                        return;
                    }

                    // Use the existing /scenememory command
                    const command = `/scenememory ${sceneStart}-${mesId}`;
                    await executeSlashCommands(command);
                    console.log(`Arc Analyzer: Executed command: ${command}`);
                } catch (err) {
                    console.error('Arc apply error:', err);
                }
            },
        });
    }
    customButtons.push({ text: 'Close', result: 1, classes: ['menu_button', 'menu_button_secondary'], appendAtEnd: true });

    const safeHtml = `<div class="arc-list">${listHtml}</div>`;
    await Popup.show.text('Arc Analyzer', safeHtml, { leftAlign: true, wide: true, allowVerticalScrolling: true, customButtons });
}

export async function analyzeArcs() {
    try {
        console.log('Arc Analyzer: Analyzing chat for narrative arcs...');

        const stmbData = getSceneMarkers() || {};
        const highestProcessed = stmbData.highestMemoryProcessed ?? null;
        let sceneStart;

        if (highestProcessed === null) {
            sceneStart = 0;
        } else {
            sceneStart = highestProcessed + 1;
        }

        // Limit the number of messages sent for analysis to avoid huge API calls
        const potentialEnd = chat.length - 1;
        const sceneEnd = Math.min(potentialEnd, sceneStart + MAX_MESSAGES_FOR_ANALYSIS - 1);

        if (sceneEnd <= sceneStart) {
            console.warn('Arc Analyzer: Not enough new messages to analyze.');
            return;
        }

        console.log(`Arc Analyzer: Analyzing messages from ${sceneStart} to ${sceneEnd} for narrative arcs...`);

        const sceneRequest = createSceneRequest(sceneStart, sceneEnd);
        const compiledScene = compileScene(sceneRequest);

        const chatHistory = JSON.stringify(compiledScene.messages, null, 2);
        const prompt = ARC_ANALYZER_TEMPLATE.replace('{{chatHistory}}', chatHistory);

        const combinedPrompt = `${ARC_ANALYZER_PROMPT}\n\n${prompt}`;

        // We need a profile to call the AI. We'll find the default one.
        const settings = extension_settings.STMemoryBooks;
        const profile = settings.profiles[settings.defaultProfile];

        if (!profile) {
            console.error('Arc Analyzer: No default memory profile found.');
            return;
        }
        
        // Get connection settings from profile or fallback to current ST settings
        const conn = profile.useDynamicSTSettings
            ? {
                api: getCurrentApiInfo().completionSource,
                model: getCurrentModelSettings().model,
                temperature: getCurrentModelSettings().temperature,
              }
            : profile.connection;

        if (!conn || !conn.model) {
            console.error('Arc Analyzer: No valid model configured in the selected profile or ST settings.');
            return;
        }

        const { text: aiResponse } = await sendRawCompletionRequest({
            prompt: combinedPrompt,
            model: conn.model,
            temperature: conn.temperature,
            api: conn.api,
        });

        const arcs = parseJsonArray(aiResponse);
        await showArcPopup(arcs, sceneStart);

    } catch (error) {
        console.error('Arc Analyzer error:', error);
    }
}
