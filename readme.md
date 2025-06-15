# 📕 STMemoryBooks Extension

A SillyTavern extension that allows you to automatically create memories from chat excerpts and send them to your designated lorebook. Mark scene start/end points in chat, extract messages between those points, and use AI to generate memories that are automatically added to your chat's bound lorebook.

## Features

- **Scene Marking System**: Mark start (►) and end (◄) points in your chat messages with visual feedback
- **Previous Scene Context**: Include 0-7 previous summaries as context to help AI understand ongoing storylines
- **Multiple Usage Methods**: Use slash commands or visual markers to define scenes
- **5 Built-in Presets**: Production-quality prompts optimized for vectorized databases
- **Automatic Keyword Extraction**: AI-generated keywords parsed from responses with fallback generation
- **Token Warning System**: Alerts for large scenes (>30k tokens) before processing
- **Profile Management**: Create, edit, and manage multiple memory generation profiles
- **Import/Export**: Backup and share your profiles as JSON files
- **Visual Feedback**: Clear indicators showing selected scenes and valid marker positions

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
4. **Choose Options**: Select your preferred preset and choose 0-7 previous summaries to include as context (helps AI understand ongoing storylines)
5. **Confirm**: The pop-up will confirm which messages and context summaries to use, click OK to confirm
6. **Wait**: The AI will respond and a message will appear confirming that the memory has been created and saved

### Method Two: Slash Commands

1. Type `/scenememory 10-12` to make a memory based on messages 10 through 12 (replace the numbers as needed!)
2. The pop-up will confirm which messages you want as the start and end of your scene, click OK to confirm  
3. Wait for the AI to respond! Once finished, a message will appear confirming that the memory has been created and saved

### Available Slash Commands

- `/creatememory` - Create memory from currently marked scene
- `/scenememory 10-15` - Mark messages 10-15 as scene and create memory

## Previous Scene Context

When creating memories, you can include 0-7 previous summaries as context to help the AI understand ongoing storylines, character development, and plot continuity. The extension automatically:

- **Finds existing summaries** in your lorebook (numbered entries like [001], [002], etc.)
- **Orders them chronologically** based on their sequential numbers 
- **Includes them as context** marked clearly as "DO NOT SUMMARIZE" so the AI uses them for understanding but doesn't include them in the new summary
- **Handles missing summaries gracefully** - if you request 5 but only 2 exist, it uses all available with a warning

This feature is especially useful for long-running chats where character relationships and story elements evolve over time.

## Allows Mixed Lorebooks 

STMemoryBooks will use your configured memory title format to locate previous memories and also to filter out anything that is not a memory (but is in the same lorebook as the memories).

## Customizable Details

### Using the Defaults?
- **Preferred memory title format**: Use `[000]-[00] - [Title]` or whatever else strikes your fancy
- **Preferred engine model and temperature**: There are some pre-populated choices but you can override/delete/choose your own
- **Preferred prompt**: Choose from the [built-in presets](https://www.aikobots.com/cmd-memory.html), or make your own!

### Title Formatting
- **Allowed characters**: `-`, ` `, `.`, `(`, `)`, `#`, `[`, `]`
- **Allowed emoji**: Standard emoji only. If it's not in the default emoji of your operating system, it should not be used
- **Auto-Numbering**: Use placeholders `[0]`, `[00]`, `[000]` to auto-number with self-incrementing digits (if you hit the 4 digit range may I suggest starting another lorebook? 📚)
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

### Profile Settings
- **Name**: Display name for the profile
- **Engine**: AI engine (currently uses global SillyTavern settings)
- **Model**: AI model (currently uses global SillyTavern settings)  
- **Temperature**: Response randomness (currently uses global SillyTavern settings)
- **Preset**: Select from built-in presets or use custom prompt

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
2. **Context Retrieval**: Fetch requested previous summaries in chronological order (if any) using title format pattern matching
3. **Token Estimation**: Calculate approximate token usage with warnings (including context)
4. **AI Generation**: Use SillyTavern's `generateQuietPrompt` with preset/custom prompts and context
5. **Response Processing**: Parse content, extract title and keywords from AI response
6. **Lorebook Integration**: Format using configured title template and add to bound lorebook

### Title Format Pattern Matching

The extension converts your configured title format into a regex pattern to identify existing memories:

- **Auto-numbering patterns** `[000]` become capture groups `\[(\d+)\]`
- **Template placeholders** like `{{char}}` become flexible patterns `[^\\[\\]]+`
- **Literal text** is escaped to match exactly
- **Primary filtering** uses this pattern to distinguish memories from other lorebook entries
- **Fallback detection** uses secondary criteria for borderline cases

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