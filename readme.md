# 📕 STMemoryBooks Extension

A SillyTavern extension that allows you to automatically create memories from chat excerpts and send them to your designated lorebook. Mark scene start/end points in chat, extract messages between those points, and use AI to generate memories that are automatically added to your chat's bound lorebook.

## Prerequisites

- **Bound Lorebook**: Your chat must have exactly one lorebook bound to it
- **API Access**: Compatible AI engine (OpenAI, Claude, etc.) configured in SillyTavern
- **Scene Selection**: Start and end markers must be set with valid range (start < end)

> ## Notes
> - This extension ONLY SUPPORTS chat completion APIs (oai_settings). 
> - Chat messages are NOT hidden after memory creation. You must still use /hide after memories are created. This was an intentional decision to leave some chat history for generation overlap.

## Features

- **Scene Marking System**: Mark start (►) and end (◄) points in your chat messages with visual feedback
- **Visual Feedback**: Clear indicators showing selected scenes and valid marker positions
- **Multiple Usage Methods**: Use slash commands or visual markers to define scenes
- **Previous Scene Context**: Include 0-7 previous summaries as context to help AI understand ongoing storylines
![Memory generation with context](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/context.png)
- **5 Built-in Presets**: Production-quality prompts optimized for vectorized databases
- **Title and Keyword Generation**: Automatically extracts titles and keywords from AI responses
- **Automatic Lorebook Updates**: Automatically updates memory lorebook with newest entry
![Automatic lorebook update](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/lorebookadd.png)
- **Token Warning System**: Alerts for large scenes (configurable token threshold) before processing
- **Profile Management**: Create, edit, backup, and manage multiple memory generation profiles

## LOADING NOTE ⏳

After selecting a character and chat, there may be a slight delay before the extension fully loads and the memory buttons appear. This is normal - the extension will be ready within 10 seconds. If buttons don't appear after this time, try refreshing the page.

![Wait for these buttons](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/startup.png)

## How It Works

**Before you start**: The chat MUST have a lorebook bound to it. Check the character card--if there is no chat lorebook, you need to make one and bind the lorebook to the chat.

![Chat lorebook is a prerequisite](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/chatlorebook.png)

**Lorebook Conversion**: The [standalone HTML Lorebook Converter](lorebookconverter.html) will convert older non STMB lorebooks to add the stmemorybooks, stmb_start, and stmb_end JSON fields. 

⚠️ STMemoryBooks __**WILL NOT READ**__ older memories from non-converted lorebooks. 

### Method One: Visual Markers

1. **Mark Your Scene**: Click the chevron-right (►) button on the first message of your scene, then click the chevron-left (◄) button on the last message of the scene.
2. **Open Settings**: Click "Memory Settings" in the Extensions menu  
3. **Create Memory**: Click the "🧠 Create Memory" button or use `/creatememory`
4. **Choose Options**: Select your preferred preset and choose 0-7 previous memories to include as context (helps AI understand ongoing storylines)
5. **Confirm**: The pop-up will confirm which messages and context memories to use, click OK to confirm
6. **Wait**: The AI will respond and a message will appear confirming that the memory has been created and saved

### Method Two: Slash Commands

1. Type `/scenememory 10-12` to make a memory based on messages 10 through 12 (replace the numbers as needed!)
2. The pop-up will confirm which messages you want as the start and end of your scene, click OK to confirm  
3. Wait for the AI to respond! Once finished, a message will appear confirming that the memory has been created and saved

### Available Slash Commands

- `/creatememory` - Create memory from currently marked scene
- `/scenememory 10-15` - Mark messages 10-15 as scene and create memory

## Customizable Details

### Using the Defaults?
- **Preferred memory title format**: Use `[000]-[00] - [Title]` or whatever else strikes your fancy

![Preset title formats plus custom available](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/titleformats.png)

- **Preferred engine model and temperature**: Choose your favorite engine/temperature (must be on same API endpoint)
- **Preferred prompt**: Choose from the built-in memory presets, or make your own!

### Title Formatting

- **Allowed characters**: Some punctuation is problematic. [Read the Character Restrictions in Titles document](charset.md)
- **Allowed emoji**: Standard emoji only. [Read the Character Restrictions in Titles document](charset.md)
- **Auto-Numbering**: Use placeholders `[0]`, `[00]`, `[000]` to auto-number with self-incrementing digits (if you hit the 4 digit range may I suggest starting another lorebook?)
- **Template Placeholders**: 
  - **{{title}}**: AI-generated title (extracted from AI response headings, markdown, or first line)
  - **{{scene}}**: The message range of the scene (e.g., "Scene 15-23")
  - **{{char}}**: The name of the character
  - **{{user}}**: The name of the user
  - **{{messages}}**: The total number of messages in the scene
  - **{{profile}}**: The name of the memory generation profile used
  - **{{date}}**: The current date
  - **{{time}}**: The current time

## Visual Feedback

- **Active markers (.on)**: Glowing effect with theme quote color and subtle shadow
- **Valid selection points**: Emphasis color with animated pulse effect to guide selection
- **In-scene range**: Subtle highlighting for all messages within selected scene
- **Hover effects**: Scale transforms and color transitions for better interactivity
- **Processing state**: Diagonal stripe animation when creating memories
- **Status indicators**: Color-coded success/warning/error states

### Accessibility Features

- **Focus indicators**: Clear outline for keyboard navigation
- **High contrast support**: Enhanced borders and colors for visibility
- **Reduced motion**: Respects user's motion preferences
- **Screen reader support**: ARIA attributes for button states
- **Responsive design**: Mobile-friendly button sizing and layout

### Theme Integration

The extension uses SillyTavern's CSS variables for seamless theme integration:
- `--SmartThemeQuoteColor` for active states
- `--SmartThemeEmphasisColor` for valid selection points  
- `--SmartThemeBodyColor` for text and borders
- Automatic dark theme adjustments

## Settings

### Module Settings
- **Always Use Default**: Skip confirmation dialog and use default profile
- **Show Notifications**: Display success/error notifications
- **Refresh Editor**: Refresh lorebook editor after adding memories
- **Token Warning Threshold**: Show confirmation dialog when estimated tokens exceed this value (default: 30,000)

### Memory Generation Profile Settings

![Memory Generation Profile Setup](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/customengine.png)

- **Name**: Display name for the profile
- **Model**: AI model
- **Temperature**: Response randomness 
- **Preset**: Select from built-in presets or use custom prompt

## Advanced Features

- **Profile Management**: Create custom profiles with specific models and temperature settings
- **Token Warnings**: Automatic alerts for large scenes that may take time to process  
- **Auto-Keywords**: AI extracts keywords from responses, with fallback generation
- **Import/Export**: Share profiles between installations
- **Scene Validation**: Automatic cleanup of invalid marker ranges
- **Scene Overlap Detection**: Detects if there is scene overlap (chat messages in more than one memory)

![Scene overlap detection](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/overlap.png)

## Troubleshooting

### Common Issues

**"No lorebook bound"**: Ensure your chat has exactly one lorebook selected in the world info panel.

**"No scene selected"**: Mark both start (►) and end (◄) points before creating memories.

**"Token warning"**: Large scenes may take time to process. You can continue, select a smaller range, or adjust the token warning threshold in Memory Settings if you frequently work with large scenes.

**"AI generation failed"**: Check your SillyTavern API configuration and ensure your selected model is available.

**Missing buttons**: The extension may take up to 10 seconds to load after selecting a character and chat. If buttons don't appear after this time, refresh the page or check that the extension loaded properly in the Extensions menu.

## Image Gallery

![STMemoryBooks in use](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/example.png)

![Default lorebook entry settings](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/default.png)

![Main program window (no scene selected)](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/mainwindow.png)

![Main program window (scene selected)](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/Mainwindowwithscene.png)

---

*Made with love, Claude Sonnet 4, and Gemini 2.5 Pro* 🤖