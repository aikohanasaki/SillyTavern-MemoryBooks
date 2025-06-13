# 📕 STMemoryBooks Extension

A SillyTavern extension that allows you to automatically create memories from chat excerpts and send them to your designated lorebook. Mark scene start/end points in chat, extract messages between those points, and use AI to generate memories that are automatically added to your chat's bound lorebook.

## Features

- **Scene Marking System**: Mark start (►) and end (◄) points in your chat messages with visual feedback
- **Multiple Usage Methods**: Use slash commands or visual markers to define scenes
- **5 Built-in Presets**: Production-quality prompts optimized for vectorized databases
- **Automatic Keyword Extraction**: AI-generated keywords parsed from responses with fallback generation
- **Token Warning System**: Alerts for large scenes (>30k tokens) before processing
- **Profile Management**: Create, edit, and manage multiple memory generation profiles
- **Import/Export**: Backup and share your profiles as JSON files
- **Visual Feedback**: Clear indicators showing selected scenes and valid marker positions

## Installation

1. Download the extension files
2. Place the `STMemorybooks` folder in your SillyTavern `extensions` directory
3. Restart SillyTavern
4. The extension will appear in your Extensions menu

## File Structure

```
extensions/STMemorybooks/
├── index.js              # Main extension file (UI and event handling)
├── chatcompile.js        # Scene compilation and validation
├── stmemory.js          # AI memory generation with preset system
├── addlore.js           # Lorebook integration
├── style.css            # Extension styling and visual feedback
├── summary.json         # "Talented Summarist" preset
├── summarize.json       # Bullet-point format preset
├── synopsis.json        # Long detailed preset
├── sumup.json          # Concise beat summary preset
└── keywords.json       # Keywords-only generation preset
```

## Initial Setup 🛠️

First you must set up the extension! On first run, it will ask you to select your preferred settings. If you don't do this, it will not do anything 🤣 You can change them in the future by going to the wand menu and clicking on Memory Settings.

The first set of settings you create will become your default, but you can always choose a different default later. You can set more than one type, but you must have at least one.

## Built-in Presets

### Summary
**"Talented Summarist"** - Detailed beat-by-beat summaries with timeline estimation and vectorized database optimization. Token-efficient with nuance capture.

### Summarize  
**Bullet Points** - Structured summaries in bullet-point format with OOC framing and timeline context. Ideal for quick scanning.

### Synopsis
**Long Detailed** - Comprehensive beat-by-beat coverage with headings and bullet points. Maximum information preservation with database efficiency.

### Sum Up
**Beat Summary** - Concise story beats with timeline estimation, memorable quotes, and key interaction highlights.

### Keywords
**Keywords Only** - Generates comma-delimited keywords optimized for vectorized database retrieval without summary content.

## How to Use

**Before you start**: The chat MUST have a lorebook bound to it. Check the character card--if there is no chat lorebook, you need to make one and bind the lorebook to the chat.

### Method One: Visual Markers

1. **Mark Your Scene**: Click the chevron-right (►) button on the first message of your scene, then click the chevron-left (◄) button on the last message
2. **Open Settings**: Click "Memory Settings" in the Extensions menu  
3. **Create Memory**: Click the "🧠 Create Memory" button or use `/creatememory`
4. **Choose Profile**: Select your preferred preset (if not using default)
5. **Confirm**: The pop-up will confirm which messages you want as the start and end of your scene, click OK to confirm
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
- **Preferred engine model and temperature**: There are some pre-populated choices but you can override/delete/choose your own
- **Preferred prompt**: Choose from the [built-in presets](https://www.aikobots.com/cmd-memory.html), or make your own!

### Title Formatting
- **Allowed characters**: `-`, ` `, `.`, `(`, `)`, `#`, `[`, `]`
- **Allowed emoji**: Standard emoji only. If it's not in the default emoji of your operating system, it should not be used
- **Auto-Numbering**: Use placeholders `[0]`, `[00]`, `[000]` to auto-number with self-incrementing digits (if you hit the 4 digit range may I suggest starting another lorebook?)

## Keyword System

The extension automatically parses AI responses to extract keywords using multiple patterns:

- `Keywords: keyword1, keyword2, keyword3`
- `Key topics: topic1, topic2, topic3`
- `Important keywords: word1, word2, word3`
- `Tags: tag1, tag2, tag3`
- End-of-response comma-separated lists

### When Keywords Aren't Found

If the AI doesn't provide keywords, you'll see the generated memory content and be prompted to choose:

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

### Profile Settings
- **Name**: Display name for the profile
- **Engine**: AI engine (currently uses global SillyTavern settings)
- **Model**: AI model (currently uses global SillyTavern settings)  
- **Temperature**: Response randomness (currently uses global SillyTavern settings)
- **Preset**: Select from built-in presets or use custom prompt

> **Note**: Connection settings are stored for future use but currently SillyTavern's global API settings are used for all requests.

## Advanced Features

- **Profile Management**: Create custom profiles with specific models and temperature settings
- **Token Warnings**: Automatic alerts for large scenes that may take time to process  
- **Auto-Keywords**: AI extracts keywords from responses, with fallback generation
- **Import/Export**: Share profiles between installations
- **Scene Validation**: Automatic cleanup of invalid marker ranges

## Prerequisites

- **Bound Lorebook**: Your chat must have exactly one lorebook bound to it
- **API Access**: Compatible AI engine (OpenAI, Claude, etc.) configured in SillyTavern
- **Scene Selection**: Start and end markers must be set with valid range (start < end)

## Technical Details

### How It Works

STMemoryBooks will collect the chat history from the beginning of the scene to the end of the scene, and then it will prompt your AI engine of choice to create a memory based on that. The extension ignores hidden messages (is_system=true).

### Memory Generation Process

1. **Scene Compilation**: Extract and validate messages in marked range
2. **Token Estimation**: Calculate approximate token usage with warnings
3. **AI Generation**: Use SillyTavern's `generateQuietPrompt` with preset/custom prompts
4. **Response Processing**: Parse content and extract keywords
5. **Lorebook Integration**: Format and add to bound lorebook

### Preset System

- **Dynamic Loading**: Presets loaded on-demand from JSON files
- **Caching**: Loaded presets cached for performance
- **Fallback**: Failed preset loading falls back to custom prompts
- **Validation**: Ensures preset files have required structure

## Error Handling

- **Token Warnings**: Scenes >30k tokens show confirmation dialog
- **Invalid Scenes**: Automatic cleanup of invalid marker ranges
- **Missing Lorebook**: Clear error messages with guidance
- **API Failures**: Standard SillyTavern error handling
- **Profile Validation**: Ensures complete profile configuration

## Troubleshooting

### Common Issues

**"No lorebook bound"**: Ensure your chat has exactly one lorebook selected in the world info panel.

**"No scene selected"**: Mark both start (►) and end (◄) points before creating memories.

**"Token warning"**: Large scenes may take time to process. You can continue or select a smaller range.

**"AI generation failed"**: Check your SillyTavern API configuration and ensure your selected model is available.

**Missing buttons**: Refresh the page or check that the extension loaded properly in the Extensions menu.

---

*Made with love (and Claude Sonnet 4)* 🤖