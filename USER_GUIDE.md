# 📕 ST Memory Books - Your AI Chat Memory Assistant

**Turn your endless chat conversations into organized, searchable memories!**

Need bot to remember things, but the chat is too long for context? Want to automatically track important plot points without manually taking notes? ST Memory Books does exactly that - it watches your chats and creates smart summaries so you never lose track of your story again.

(Looking for some behind-the-scenes technical detail? Maybe you want [How STMB Works](userguides\howSTMBworks-en.md) instead.)

---

## 🚀 Quick Start (5 Minutes to Your First Memory!)

**New to ST Memory Books?** Let's get you set up with your first automatic memory in just a few clicks:

### Step 1: Find the Extension

- Look for the magic wand icon (�) next to your chat input box
- Click it, then click **"Memory Books"**
- You'll see the ST Memory Books control panel

### Step 2: Turn On Auto-Magic

- In the control panel, find **"Auto-Summary"**
- Turn it ON
- Set it to create memories every **20-30 messages** (good starting point)
- That's it! 🎉

### Step 3: Chat Normally

- Keep chatting as usual
- After 20-30 new messages, ST Memory Books will automatically:
  - Pick the best scene boundaries
  - Ask your AI to write a summary
  - Save it to your memory collection
  - Show you a notification when done

**Congratulations!** You now have automated memory management. No more forgetting what happened chapters ago!

---

## 💡 What ST Memory Books Actually Does

Think of ST Memory Books as your **personal AI librarian** for chat conversations:

### 🤖 **Automatic Summaries**

_"I don't want to think about it, just make it work"_

- Watches your chat in the background
- Automatically creates memories every X messages
- Perfect for long roleplays, creative writing, or ongoing stories

### ✋ **Manual Memory Creation**

_"I want control over what gets saved"_

- Mark important scenes with simple arrow buttons (► ◄)
- Create memories on-demand for special moments
- Great for capturing key plot points or character developments

### 📊 **Side Prompts & Smart Trackers**

_"I want to track relationships, plot threads, or stats"_

- Reusable prompt snippets that enhance memory generation
- Template library with ready-to-use trackers
- Custom AI prompts that track anything you want
- Automatically update scoreboards, relationship status, plot summaries
- Examples: "Who likes who?", "Current quest status", "Character mood tracker"

### 📚 **Memory Collections**

_Where all your memories live_

- Automatically organized and searchable
- Works with SillyTavern's built-in lorebook system
- Your AI can reference past memories in new conversations

---

## 🎯 Choose Your Style

<details>
<summary><strong>🔄 "Set and Forget" (Recommended for Beginners)</strong></summary>

**Perfect if you want:** Hands-off automation that just works

**How it works:**

1. Turn on "Auto-Summary" in settings
2. Choose how often to create memories (every 20-50 messages works well)
3. Keep chatting normally - memories happen automatically!

**What you get:**

- No manual work required
- Consistent memory creation
- Never miss important story beats
- Works in both single and group chats

**Pro tip:** Start with 30 messages, then adjust based on your chat style. Fast chats might want 50+, slower detailed chats might prefer 20.

</details>

<details>
<summary><strong>✋ "Manual Control" (For Selective Memory Making)</strong></summary>

**Perfect if you want:** To decide exactly what becomes a memory

**How it works:**

1. Look for small arrow buttons (► ◄) on your chat messages
2. Click ► on the first message of an important scene
3. Click ◄ on the last message of that scene
4. Open Memory Books (🪄) and click "Create Memory"

**What you get:**

- Complete control over memory content
- Perfect for capturing specific moments
- Great for complex scenes that need careful boundaries

**Pro tip:** The arrow buttons appear a few seconds after loading a chat. If you don't see them, wait a moment or refresh the page.

</details>

<details>
<summary><strong>⚡ "Power User" (Slash Commands)</strong></summary>

**Perfect if you want:** Keyboard shortcuts and advanced features

**Essential commands:**

- `/scenememory 10-25` - Create memory from messages 10 to 25
- `/creatememory` - Make memory from currently marked scene
- `/nextmemory` - Summarize everything since the last memory
- `/sideprompt "Relationship Tracker"` - Run custom tracker

**What you get:**

- Lightning-fast memory creation
- Batch operations
- Integration with custom workflows

</details>

---

## 🎨 Side Prompts & Templates (Advanced Feature)

**Side Prompts** are reusable prompt snippets that enhance your memory generation without changing your main AI settings. Think of them as "add-ons" that give your memories extra focus or tracking capabilities.

### 🚀 **Quick Start with Templates**

1. Open Memory Books settings
2. Click **"Side Prompts"** button
3. Browse the **template library** - pick something that fits your story:
   - **Character Development Tracker** - Tracks personality changes and growth
   - **Relationship Dynamics** - Monitors relationships between characters
   - **Plot Thread Tracker** - Keeps tabs on ongoing storylines
   - **Mood & Atmosphere** - Captures the emotional tone of scenes
   - **World Building Notes** - Records setting details and lore
4. Enable the templates you want, customize if needed
5. Your memories will now include this extra tracking automatically!

### ⚙️ **How Side Prompts Work**

- **Non-Intrusive**: They don't change your main AI settings or character prompts
- **Per-Chat Control**: Enable different prompts for different chats
- **Template-Based**: Use pre-built templates or create custom ones
- **Automatic Integration**: Once enabled, they enhance every memory created

### 🛠️ **Managing Side Prompts**

- **Side Prompts Manager**: Create, edit, duplicate, and organize your prompts
- **Import/Export**: Share prompt templates with others or backup your collection
- **Quick Toggle**: Enable/disable prompts instantly in the Side Prompts popup
- **Live Preview**: See which prompts are active for the current chat

### 💡 **Template Examples**

- Side Prompt Template Library (import this JSON): [SidePromptTemplateLibrary.json](/resources/SidePromptTemplateLibrary.json)
- **"Focus on dialogue and character interactions"**
- **"Track the current quest status and objectives"**
- **"Note any world-building details mentioned"**
- **"Monitor the relationship between [Character A] and [Character B]"**

### 🔧 **Creating Custom Side Prompts**

1. Open Side Prompts Manager
2. Click "Create New"
3. Write your prompt (example: "Always note what the weather is like in each scene")
4. Save and enable it
5. Now all your memories will include weather tracking!

**Pro Tip**: Side Prompts work best when they're specific and focused. Instead of "track everything," try "track romantic tension between main characters."

---

### 🧠 Advanced Text Control with the Regex Extension

**Want ultimate control over the text that gets sent to and received from the AI?** ST Memory Books now seamlessly integrates with the official **Regex** extension, allowing you to automatically transform text using custom rules.

**Multi-Select Support:** You can now multi-select regex scripts in the Regex extension. All enabled scripts will be applied in order at each stage (Prompt and Response), allowing for powerful and flexible transformations.

This is an advanced feature perfect for users who want to:

- Automatically clean up repetitive phrases or artifacts from an AI's response.
- Reformat parts of the chat transcript before the AI sees it.
- Standardize terminology or character mannerisms on the fly.

#### **How It Works: Two Simple Hooks**

The integration works by applying your enabled regex scripts at two critical points. You control which scripts run by setting their **Placement** in the Regex extension's editor:

1.  **Modifying the Prompt (Outgoing Text)**
    - **Placement to use**: `User Input`
    - **What it does**: Intercepts the fully assembled prompt (including chat history, system instructions, etc.) right before it's sent to the AI for memory or side prompt generation.
    - **Example Use Case**: You could create a script to automatically replace all instances of a character's nickname with their full name, ensuring the AI has the proper context.

2.  **Modifying the Response (Incoming Text)**
    - **Placement to use**: `AI Output`
    - **What it does**: Intercepts the raw text response from the AI _before_ it gets parsed or saved as a memory.
    - **Example Use Case**: If your AI model often includes repetitive phrases like _"As a large language model..."_ in its summaries, you can create a regex script to automatically remove this phrase from every memory it generates.

#### **Quick Start Example: Cleaning AI Responses**

Let's say your AI model consistently adds `(OOC: I hope this summary is helpful!)` to its memory generations. Here’s how to automatically remove it:

1.  **Go to the Regex Extension**: Open the main SillyTavern extensions menu and go to **Regex**.
2.  **Create a New Script**: Click "Open Regex Editor" to create a new regex script.
3.  **Configure the Script**:
    - **Script Name**: `Clean OOC Notes`
    - **Find Regex**: `/\\(OOC:.*?\\)/g` (This finds the text "(OOC: ...)" and everything inside it).
    - **Replace String**: Leave this blank to delete the matched text.
    - **Affects (Placement)**: Uncheck all boxes except for **AI Output**. This is the most important step!
    - **Enable the Script**: Make sure the script is not disabled.
4.  **Save and You're Done!**

Now, every time ST Memory Books gets a response from the AI, this script will run automatically, cleaning the unwanted text before the memory is saved to your lorebook.

---

## ⚙️ Settings That Actually Matter

Don't worry - you don't need to configure everything! Here are the settings that make the biggest difference:

### 🎛️ **Auto-Summary Frequency**

- **20-30 messages**: Great for detailed, slower chats
- **40-60 messages**: Perfect for faster, action-packed conversations
- **80+ messages**: For very fast group chats or casual conversations

### 📝 **Memory Previews**

- Turn this ON to review memories before they're saved
- You can edit, approve, or regenerate if the AI missed something important
- Recommended for important storylines

### 🏷️ **Memory Titles**

- Customize how your memories are named
- Use `{{title}}` for AI-generated titles, `{{scene}}` for message numbers
- Example: `"Chapter {{title}} ({{scene}})"` becomes `"Chapter The Great Escape (Scene 45-67)"`

### 📚 **Memory Collections** (Lorebooks)

- **Auto mode**: Uses your chat's default memory collection (easiest)
- **Manual mode**: Pick a specific collection for each chat (for organization)
- **Auto-create**: Makes new collections automatically (good for new characters)

---

## 🔧 Troubleshooting (When Things Don't Work)

### "I don't see the Memory Books option!"

- Check that the extension is installed and enabled
- Look for the magic wand (�) icon next to your chat input
- Try refreshing the page

### "The arrow buttons (► ◄) aren't showing up!"

- Wait 3-5 seconds after loading a chat - they need time to appear
- If still missing, refresh the page
- Make sure ST Memory Books is enabled in extensions

### "Auto Summary isn't working!"

- Double-check that "Auto-Summary" is enabled in Memory Books settings
- Has the message interval been reached? Auto-summary waits for enough new messages
- If you postponed auto-summary, it might be waiting until a certain message count
- Auto-summary only processes new messages since the _last_ memory. If you deleted old memories, it doesn't go back.

### "I get errors about missing lorebooks!"

- Go to Memory Books settings
- Either bind a lorebook to your chat (Automatic Mode) or enable "Auto-create lorebook if none exists"

### "Sometimes it fails for no reason!"

- Make sure that your Max Response Length (in SillyTavern presets) are set at a large enough number. Aiko recommends at least 2000 tokens (Aiko runs 4000.)
- The error messages are more detailed now, but if you are still having problems please contact Aiko on Github or Discord.

### "My custom prompts aren't working right!"

- Check the "Summary Prompt Manager" in Memory Books settings
- Ensure your prompt instructs the AI to respond in **JSON format** (e.g., `{ "title": "...", "content": "..." }`)

---

## 🚫 What ST Memory Books Doesn't Do

- **Not a general lorebook editor:** This guide focuses on entries created by STMB. For general lorebook editing, use SillyTavern\'s built-in lorebook editor.

---

## 💡 Getting Help & More Info

- **More detailed info:** [readme.md](readme.md)
- **Latest updates:** [changelog.md](changelog.md)
- **Convert old lorebooks:** [lorebookconverter.html](lorebookconverter.html)
- **Community support:** Join the SillyTavern community on Discord! (Look for the 📕ST Memory Books thread or DM @tokyoapple for direct help.)
- **Bugs/features:** Found a bug or have a great idea? Open a GitHub issue in this repository.

---

### 📚 Power Up with Lorebook Ordering (STLO)

For advanced memory organization and deeper story integration, we highly recommend using STMB together with [SillyTavern-LorebookOrdering (STLO)](https://github.com/aikohanasaki/SillyTavern-LorebookOrdering/blob/main/guides/STMB%20and%20STLO%20-%20English.md). See the guide for best practices, setup instructions, and tips!
