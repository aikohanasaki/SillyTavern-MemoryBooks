# 📕 STMemoryBooks Extension

A SillyTavern extension that allows you to automatically create memories from chat excerpts and send them to your designated lorebook. Mark scene start/end points in chat, extract messages between those points, and use AI to generate memories that are automatically added to your chat's bound lorebook.

## Notes
- This extension ONLY SUPPORTS chat completion APIs (oai_settings). 
- Chat messages are NOT hidden. You must still use /hide after memories are created.

## Features

- **Scene Marking System**: Mark start (►) and end (◄) points in your chat messages with visual feedback
- **Visual Feedback**: Clear indicators showing selected scenes and valid marker positions
- **Multiple Usage Methods**: Use slash commands or visual markers to define scenes
- **Previous Scene Context**: Include 0-7 previous summaries as context to help AI understand ongoing storylines
- **5 Built-in Presets**: Production-quality prompts optimized for vectorized databases
- **Title and Keyword Generation**: Automatically extracts titles and keywords from AI responses
- **Automatic Lorebook Updates**: Automatically updates memory lorebook with newest entry
- **Token Warning System**: Alerts for large scenes (configurable token threshold) before processing
- **Profile Management**: Create, edit, backup, and manage multiple memory generation profiles

# LOADING NOTE ⏳

After selecting a character and chat, there may be a slight delay before the extension fully loads and the memory buttons appear. This is normal - the extension will be ready within 10 seconds. If buttons don't appear after this time, try refreshing the page.

## How It Works

**Before you start**: The chat MUST have a lorebook bound to it. Check the character card--if there is no chat lorebook, you need to make one and bind the lorebook to the chat.

**Lorebook Conversion**: The lorebook conversion process tries to auto-identify memories in your memory lorebook and will add a flag that STMemoryBooks will read to speed up memory identification. 
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

## Memory Detection System

The extension uses your configured **Memory Title Format** as the primary method to identify existing memories in your lorebook. This smart detection system:

- **Converts your title format into a regex pattern** to match existing memories precisely
- **Filters out non-memory entries** that don't match your format (like manual lorebook entries, character descriptions, etc.)
- **Provides accurate numbering** by only counting entries that match your memory format
- **Falls back to secondary detection** for borderline cases when pattern matching fails

This ensures that only actual auto-generated memories are counted when determining the next memory number and when fetching previous summaries for context.

## Customizable Details

### Using the Defaults?
- **Preferred memory title format**: Use `[000]-[00] - [Title]` or whatever else strikes your fancy
- **Preferred engine model and temperature**: There are some pre-populated choices but you can override/delete/choose your own
- **Preferred prompt**: Choose from the [built-in presets](https://www.aikobots.com/cmd-memory.html), or make your own!

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

### AI Title Extraction

The extension automatically extracts titles from AI responses using multiple detection methods:

- **Explicit title patterns**: "Title: Something", "# Heading", "**Bold Title**"
- **Underlined titles**: "Title\n---" or "Title\n==="
- **Numbered items**: "1. Title" (first numbered item)
- **Standalone colons**: "Title:" (line ending with colon)
- **Smart first-line detection**: Short lines without sentence punctuation
- **Fallback generation**: Creates descriptive titles from content analysis

The extracted title is then available as `{{title}}` in your title format templates.

## Keyword System

The extension automatically parses AI responses for prompted keywords. If the AI doesn't provide keywords, you'll see the generated memory content and be prompted to choose:

1. **ST Generate**: Use SillyTavern's built-in keyword generation (proper noun detection + character names)
2. **AI Keywords**: Send a separate request to AI using the keywords-only preset  
3. **User Input**: Manually enter your own keywords based on the displayed content

The formatted memory content is displayed so you can make an informed choice about which keyword generation method would work best for that specific memory.

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

### Profile Settings
- **Name**: Display name for the profile
- **Engine**: AI engine (currently uses global SillyTavern settings)
- **Model**: AI model (currently uses global SillyTavern settings)  
- **Temperature**: Response randomness (currently uses global SillyTavern settings)
- **Preset**: Select from built-in presets or use custom prompt

> **Note**: Connection settings are stored for future use but currently SillyTavern's global API settings.

## Advanced Features

- **Profile Management**: Create custom profiles with specific models and temperature settings
- **Token Warnings**: Automatic alerts for large scenes that may take time to process  
- **Auto-Keywords**: AI extracts keywords from responses, with fallback generation
- **Import/Export**: Share profiles between installations
- **Scene Validation**: Automatic cleanup of invalid marker ranges
- **Smart Memory Detection**: Uses title format patterns to accurately identify memories vs. other lorebook entries

## Prerequisites

- **Bound Lorebook**: Your chat must have exactly one lorebook bound to it
- **API Access**: Compatible AI engine (OpenAI, Claude, etc.) configured in SillyTavern
- **Scene Selection**: Start and end markers must be set with valid range (start < end)

## Troubleshooting

### Common Issues

**"No lorebook bound"**: Ensure your chat has exactly one lorebook selected in the world info panel.

**"No scene selected"**: Mark both start (►) and end (◄) points before creating memories.

**"Token warning"**: Large scenes may take time to process. You can continue, select a smaller range, or adjust the token warning threshold in Memory Settings if you frequently work with large scenes.

**"AI generation failed"**: Check your SillyTavern API configuration and ensure your selected model is available.

**Missing buttons**: The extension may take up to 10 seconds to load after selecting a character and chat. If buttons don't appear after this time, refresh the page or check that the extension loaded properly in the Extensions menu.

---

*Made with love, Claude Sonnet 4, and Gemini 2.5 Pro* 🤖