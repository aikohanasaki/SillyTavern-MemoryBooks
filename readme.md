# 📕 Memory Books (A SillyTavern Extension)

A comprehensive SillyTavern extension that automatically creates memories from chat excerpts and saves them to lorebooks. Mark scene start/end points in chat, extract messages between those points, and use AI to generate structured memories with automatic lorebook integration.

> ## 🏆 Project Status
> This extension is now considered **major-feature-complete**. All planned core functionality has been implemented and tested. Bug reports and minor feature requests are still welcome via GitHub issues.

## 📋 Prerequisites

- **SillyTavern**: Compatible with release 1.13.1+ 
- **API Access**: Chat completion API (OpenAI, Claude, Anthropic, OpenRouter, etc.)
- **Scene Selection**: Start and end markers must be set with valid range (start < end)

> ## ⚠️ Important Notes
> - **Chat Completion APIs Only**: This extension supports OpenAI-compatible chat completion APIs (OpenAI, Claude, Anthropic, OpenRouter, Custom, etc.). Text generation APIs (Kobold, TextGen, etc.) are not supported.
> - **JSON Architecture**: Uses modern JSON structured output for reliable memory generation
> - **Group Chat Compatible**: Works with both single character and group chats
> - **Flexible Lorebook Options**: Can use chat-bound lorebooks or manual lorebook selection

## ✨ Features

### 🎯 Core Functionality
- **Scene Marking System**: Visual start (►) and end (◄) markers with real-time feedback
- **Dual Operation Modes**: 
  - **Automatic Mode**: Uses chat-bound lorebook (traditional behavior)
  - **Manual Mode**: Select any available lorebook for memories
- **Group Chat Support**: Full compatibility with SillyTavern group chats
- **Previous Memory Context**: Include 0-7 previous memories as context for better continuity
- **Scene Overlap Detection**: Configurable overlap checking with clear warnings

### 🧠 Memory Generation
- **5 Built-in Presets**: Production-quality prompts optimized for vectorized databases
- **JSON Structured Output**: Reliable AI response parsing with comprehensive error handling
- **Automatic Retry Logic**: Smart retry system for failed generations
- **Token Management**: Configurable token warning thresholds with accurate estimation
- **Title & Keyword Extraction**: AI-generated titles and keywords for database optimization

### 📚 Lorebook Integration
- **Automatic Entry Creation**: Seamlessly adds memories with proper metadata
- **Configurable Settings**: Full control over entry position, order, recursion, and activation mode
- **Flag-based Detection**: Reliable memory identification system
- **Auto-numbering**: Smart sequential numbering that avoids conflicts
- **Editor Refresh**: Optional automatic lorebook editor updates

### 👤 Profile Management
- **Multiple Profiles**: Create unlimited memory generation profiles
- **API Override**: Temporarily switch models/temperature for specific memories
- **Import/Export**: Share profiles between installations
- **Advanced Settings**: Per-profile lorebook entry configuration
- **Bulletproof Settings**: Automatic settings backup and restoration

## 🚀 Getting Started

### ⏳ Installation & Loading
After selecting a character or group chat, the extension may take up to 10 seconds to fully load. Look for the chevron buttons (► ◄) to appear on chat messages.

![Wait for these buttons](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/startup.png)

### 🔧 Initial Setup

1. **Configure Operation Mode**:
   - **Automatic Mode** (Default): Requires a lorebook bound to your chat
   - **Manual Mode**: Allows selection of any available lorebook

2. **Check Lorebook Requirements**:
   - For automatic mode: Ensure your chat has a lorebook bound
   - For manual mode: Have at least one lorebook created in SillyTavern

![Chat lorebook binding example](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/chatlorebook.png)

### 🔄 Lorebook Conversion
⚠️ **Important**: STMemoryBooks uses a flag-based system to identify memories. Existing lorebooks need conversion to be recognized.

Use the [Lorebook Converter](https://www.aikobots.com/lorebookconverter.html) to add the required `stmemorybooks`, `STMB_start`, and `STMB_end` fields to existing memories.

## 📝 Usage Methods

### 🎯 Method 1: Visual Scene Markers

1. **Mark Scene Boundaries**: 
   - Click the ► button on your scene's first message
   - Click the ◄ button on your scene's last message

![Visual feedback showing scene selection](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/button-start.png)

2. **Access Memory Creation**:
   - Click "Create Memory" in the Extensions menu, or
   - Use the `/creatememory` slash command

3. **Configure Options** (if not using "Always Use Default"):
   - Select memory generation profile
   - Choose number of previous memories for context (0-7)
   - Adjust API settings if needed

4. **Confirm and Generate**:
   - Review the scene preview and token estimate
   - Click "Create Memory" to generate
   - Wait for AI processing and automatic lorebook integration

### 💬 Method 2: Slash Commands

```
/scenememory 10-15
```
Directly mark messages 10-15 as a scene and immediately start memory creation.

```
/creatememory
```
Create memory from currently marked scene boundaries.

## 👁️ Visual Feedback System

### 🎨 Button States
- **Inactive**: Default gray chevron buttons
- **Active Marker**: Glowing effect with theme accent color
- **Valid Selection Points**: Animated pulse to guide next selection
- **In-Scene Range**: Subtle highlighting for included messages
- **Processing**: Diagonal stripe animation during generation

![Complete scene selection showing all visual states](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/example.png)

### ♿ Accessibility Features
- High contrast support for visibility
- Keyboard navigation with focus indicators
- Screen reader ARIA attributes
- Reduced motion respect
- Mobile-friendly responsive design

## ⚙️ Configuration

### 🌐 Global Settings

![Main settings panel](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/Main.png)

#### 🔄 Operation Mode
- **Manual Lorebook Mode**: Enable to select lorebooks manually instead of using chat-bound lorebooks
- **Allow Scene Overlap**: Permit memories with overlapping message ranges
- **Always Use Default Profile**: Skip confirmation dialogs and use default settings
- **Show Notifications**: Display success/error toast messages
- **Refresh Editor**: Automatically refresh lorebook editor after adding memories

#### 📝 Memory Defaults
- **Token Warning Threshold**: Show confirmation when scenes exceed this token count (default: 30,000)
- **Default Previous Memories Count**: Number of previous memories to include as context (0-7)
- **Memory Title Format**: Choose from presets or create custom format

### 👤 Profile Management

![Profile configuration](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/Profile.png)

#### ⚙️ Profile Settings
- **Name**: Display name for the profile
- **API/Provider**: Select API provider (OpenAI, Claude, Custom, etc.)
- **Model**: Specific model identifier
- **Temperature**: Response randomness (0.0-2.0)
- **Memory Creation Method**: Choose preset or custom prompt
- **Title Format**: Per-profile title formatting

#### 📚 Lorebook Entry Settings
- **Activation Mode**: 
  - 🔗 Vectorized (Recommended): Uses similarity search
  - 🔵 Constant: Always active
  - 🟢 Normal: Keyword-based activation
- **Insertion Position**: ↑Char (recommended) or other positions
- **Insertion Order**: Auto-numbering or manual values
- **Recursion Settings**: Prevent/delay recursion options

### 🏷️ Title Formatting

Create dynamic titles using these placeholders:
- `{{title}}`: AI-generated scene title
- `{{scene}}`: Message range (e.g., "Scene 15-23")
- `{{char}}`: Character name
- `{{user}}`: User name
- `{{messages}}`: Total messages in scene
- `{{profile}}`: Profile name used
- `{{date}}`: Current date (YYYY-MM-DD)
- `{{time}}`: Current time (HH:mm:ss)

Auto-numbering patterns:
- `[0]`, `[00]`, `[000]`: Sequential numbering with zero-padding
- `(0)`, `{0}`, `#0`: Alternative numbering formats

Example formats:
```
[000] - {{title}} ({{profile}})
{{date}} [000] 🎬{{title}}, {{messages}} msgs
[000] {{date}} - {{char}} Memory
🧠 [000] ({{messages}} msgs)
```

## 🎯 Memory Generation Presets

### 📋 Built-in Presets
1. **Summary**: Detailed beat-by-beat summaries in narrative prose
2. **Summarize**: Structured summaries with markdown headers
3. **Synopsis**: Comprehensive summaries with full markdown structure
4. **Sum Up**: Beat summaries with timeline estimation
5. **Minimal**: Brief 1-2 sentence summaries

### ✍️ Custom Prompts
Create custom prompts that must return valid JSON:
```json
{
  "title": "Scene title",
  "content": "Memory content",
  "keywords": ["keyword1", "keyword2"]
}
```

## 🔧 Advanced Features

### 🧵 Context Memory System
Include previous memories as context to help AI understand ongoing storylines:

![Memory generation with context](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/context.png)

- **Automatic Detection**: Finds existing memories using flag-based system
- **Smart Selection**: Includes most recent memories for continuity
- **Token Calculation**: Accurate token estimation including context
- **Conflict Avoidance**: Prevents duplicate content generation

### 🔍 Scene Overlap Detection
Configurable system to detect and prevent overlapping memory ranges:

![Scene overlap warning](https://github.com/aikohanasaki/imagehost/blob/main/STMemoryBooks/overlap.png)

- **Automatic Detection**: Checks existing memory ranges
- **User Choice**: Allow or prevent overlaps via settings
- **Clear Warnings**: Visual feedback for conflict resolution

### 🔌 API Management
- **Bulletproof Settings**: Automatic backup and restoration of API settings
- **Profile Override**: Temporarily switch models for specific memories
- **Error Recovery**: Smart retry logic with different failure handling
- **Compatibility Check**: Automatic validation of API compatibility

### 👥 Group Chat Support
Full compatibility with SillyTavern group chats:
- **Metadata Handling**: Proper storage in group metadata
- **Context Detection**: Automatic group vs single character detection
- **Lorebook Access**: Works with group-bound or manually selected lorebooks

## 🛠️ Troubleshooting

### ❗ Common Issues

**"No lorebook available or selected"**
- **Automatic Mode**: Bind a lorebook to your chat
- **Manual Mode**: Create a lorebook or select one when prompted

**"No scene selected"**
- Mark both start (►) and end (◄) points before creating memories
- Ensure start message number is less than end message number

**"Scene overlaps with existing memory"**
- Choose different message range, or
- Enable "Allow scene overlap" in settings

**"AI failed to generate valid memory"**
- Check API configuration and model availability
- Verify the model supports JSON structured output
- Try a different profile or model

**"Token warning threshold exceeded"**
- Select a smaller message range, or
- Increase token threshold in settings, or
- Continue anyway (may take longer to process)

**Missing chevron buttons**
- Wait up to 10 seconds for extension to load
- Refresh the page if buttons don't appear
- Check that extension is enabled in Extensions menu

**"Character data not available"**
- Ensure character/group is fully loaded
- Wait a few seconds and try again
- Refresh if problem persists

### ⚡ Performance Tips

- **Large Scenes**: Break very long conversations into smaller scenes
- **Context Usage**: Use 2-3 previous memories for optimal balance
- **Profile Switching**: Let the extension handle API switching automatically
- **Token Management**: Monitor token usage for cost-effective generation

### Data Safety

- **Automatic Backups**: Settings are automatically backed up before API switches
- **Export Profiles**: Regular profile exports recommended
- **Metadata Integrity**: Extension handles group and single chat metadata properly
- **Error Recovery**: Robust error handling prevents data loss

## 📝 Character Restrictions

Memory titles support:
- **Alphanumeric**: All letters and numbers
- **Basic Punctuation**: `-`, ` `, `.`, `(`, `)`, `#`, `[`, `]`, `{`, `}`, `:`, `;`, `,`
- **Standard Emoji**: Unicode emoji blocks (😀-🫿, 🌀-🟿, etc.)
- **Automatic Cleanup**: Invalid characters are removed during processing

For detailed character restrictions, see [Character Restrictions in Titles](charset.md).

## 📈 Changelog Highlights

### 🆕 Version 2.0+ Features
- **JSON Architecture**: Moved from tool-based to JSON structured output
- **Group Chat Support**: Full compatibility with group conversations
- **Manual Lorebook Mode**: Freedom to choose any lorebook
- **Enhanced Profiles**: Comprehensive profile system with lorebook settings
- **Bulletproof API Management**: Reliable settings backup and restoration
- **Advanced Error Handling**: Smart retry logic and better error messages
- **Flag-based Memory Detection**: Reliable memory identification system
- **Scene Overlap Detection**: Configurable overlap checking
- **Enhanced Visual Feedback**: Improved button states and accessibility

---

*Developed with love using Claude Sonnet 4, extensive testing, and community feedback* 🤖💕