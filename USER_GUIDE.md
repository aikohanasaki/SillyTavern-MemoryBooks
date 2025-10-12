# 📕 ST Memory Books - Your AI Chat Memory Assistant

**Turn your endless chat conversations into organized, searchable memories!** 

Need bot to remember things, but the chat is too long for context? Want to automatically track important plot points without manually taking notes? ST Memory Books does exactly that - it watches your chats and creates smart summaries so you never lose track of your story again.

---

## 🚀 Quick Start (5 Minutes to Your First Memory!)

**New to ST Memory Books?** Let's get you set up with your first automatic memory in just a few clicks:

### Step 1: Find the Extension
- Look for the magic wand icon (🪄) next to your chat input box
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
*"I don't want to think about it, just make it work"*
- Watches your chat in the background
- Automatically creates memories every X messages
- Perfect for long roleplays, creative writing, or ongoing stories

### ✋ **Manual Memory Creation**
*"I want control over what gets saved"*
- Mark important scenes with simple arrow buttons (► ◄)
- Create memories on-demand for special moments
- Great for capturing key plot points or character developments

### 📊 **Smart Trackers** 
*"I want to track relationships, plot threads, or stats"*
- Custom AI prompts that track anything you want
- Automatically update scoreboards, relationship status, plot summaries
- Examples: "Who likes who?", "Current quest status", "Character mood tracker"

### 📚 **Memory Collections**
*Where all your memories live*
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
- Look for the magic wand (🪄) icon next to your chat input
- Try refreshing the page

### "The arrow buttons (► ◄) aren't showing up!"
- Wait 3-5 seconds after loading a chat - they need time to appear
- If still missing, refresh the page
- Make sure ST Memory Books is enabled in extensions

### "Auto Summary isn't working!"
- Double-check that "Auto-Summary" is enabled in Memory Books settings
- Has the message interval been reached? Auto-summary waits for enough new messages
- If you postponed auto-summary, it might be waiting until a certain message count
- Auto-summary only processes new messages since the *last* memory. If you deleted old memories, it doesn't go back.

### "I get errors about missing lorebooks!"
- Go to Memory Books settings
- Either bind a lorebook to your chat (Automatic Mode) or enable "Auto-create lorebook if none exists"

### "My custom prompts aren't working right!"
- Check the "Summary Prompt Manager" in Memory Books settings
- Ensure your prompt instructs the AI to respond in **JSON format** (e.g., `{ "title": "...", "content": "..." }`)

---

## 🚫 What ST Memory Books Doesn't Do

- **No `/addlore` command:** You can't manually add arbitrary lorebook entries with a slash command. All memory/lore addition is done via the scene marking, memory generation, or side prompt workflows.
- **Not a general lorebook editor:** This guide focuses on entries created by STMB. For general lorebook editing, use SillyTavern\'s built-in lorebook editor.

---

## 7. Getting Help & More Info

- **More detailed info:** [readme.md](readme.md)
- **Latest updates:** [changelog.md](changelog.md)
- **Convert old lorebooks:** [lorebookconverter.html](lorebookconverter.html)
- **Community support:** Join the SillyTavern community on Discord! (Look for the 📕ST Memory Books thread or DM @tokyoapple for direct help.)
- **Bugs/features:** Found a bug or have a great idea? Open a GitHub issue in this repository.
