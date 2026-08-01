# 📕 Installing and Getting Started with Memory Books

Memory Books turns parts of your SillyTavern chat into organized memory entries that can be recalled later.

The basic process is:

1. Select part of the chat.
2. Ask Memory Books to summarize it.
3. Save the summary in a lorebook.
4. Hide older chat messages to save context.
5. Let the saved memories supply important information when it becomes relevant again.

This guide walks you through installation, your first memory, automatic memory creation, and the major features you may want afterward.

---

## What You Will Learn

By the end of this guide, you should know how to:

* Install or locate Memory Books
* Open the Memory Books settings
* Choose where memories will be stored
* Choose which AI connection creates memories
* Mark a scene in the chat
* Create and verify your first memory
* Understand why chat messages may become hidden
* Enable automatic memory creation
* Choose between Memories, Clips, Topical Clips, Side Prompts, Consolidation, and Compaction
* Identify the first things to check when something does not work

---

# Part 1: Before You Install

## Requirements

Memory Books requires:

* SillyTavern 1.14.0 or later
* A working AI connection
* A model capable of following instructions and returning valid JSON
* Permission to install third-party SillyTavern extensions

The latest compatible SillyTavern version is recommended.

### Most API Users

If you use OpenAI, Anthropic, Claude, OpenRouter, Gemini, or another Chat Completion connection, you can normally use your existing SillyTavern connection.

Memory Books includes a built-in profile called **Current SillyTavern Settings**. This tells Memory Books to use the connection and model currently selected in SillyTavern.

### Local and Text Completion Users

KoboldCpp, llama.cpp, TextGen, Ollama, and similar local backends may require additional setup.

Memory Books sends structured generation requests and expects valid JSON. Local backends generally work most reliably when exposed through an OpenAI-compatible Chat Completion endpoint.

You must also have a Chat Completion preset available in SillyTavern, even if you normally roleplay through Text Completion.

If you are not sure whether this applies to you, try the normal setup first. Investigate the local-model instructions only if memory generation fails.

### Optional: Chat Top Bar

Memory Books can use SillyTavern’s **Chat Top Bar** or **Chat Top Info Bar** extension to show a job queue.

The queue is useful for:

* Watching memory-generation progress
* Seeing failed jobs
* Retrying failed jobs
* Canceling active jobs
* Reviewing jobs that need attention

The Chat Top Bar is optional. Memory Books works without it.

---

# Part 2: Install Memory Books

## If Memory Books Is Already Installed

Open a character chat or group chat.

Then look beside the chat input box for the **magic-wand icon**. This opens the SillyTavern Extensions menu.

Click the magic wand and look for **Memory Books**.

If **Memory Books** appears there, it is already installed. Continue to [Part 3: Open Memory Books](#part-3-open-memory-books).

## Install It in SillyTavern

1. Open SillyTavern.
2. Open the **Extensions** panel.
3. Select **Install Extension**.
4. Paste the official Memory Books repository address.
5. Install the extension.
6. Reload SillyTavern if prompted.
7. Open a character chat or group chat.

After the chat loads, Memory Books adds scene-selection controls to the messages. This may take several seconds.

> **You do not need SillyTavern Extras.** Memory Books is a SillyTavern extension, not an Extras module.

## Confirm That It Loaded

Look for either of these signs:

* **Memory Books** appears in the magic-wand Extensions menu.
* Chat messages contain the scene buttons **►** and **◄** when their message actions are expanded.

If neither appears:

1. Wait up to ten seconds.
2. Refresh the page.
3. Return to the Extensions panel.
4. Confirm that Memory Books is installed and enabled.
5. Reopen the chat.

---

# Part 3: Open Memory Books

The Memory Books settings are inside the **Extensions menu**.

1. Find the magic-wand icon near the chat input box.
2. Click the magic wand.
3. Click **Memory Books**.

This opens the main Memory Books panel.

The panel contains several sections, including:

* **Current Scene**
* **Memory Status**
* **Current Lorebook Configuration**
* **Memory Profiles**
* **Profile Actions**
* **Extra Function Buttons**
* **Settings**

You do not need to understand all of these yet.

For your first memory, you only need to establish:

1. Where the memory will be stored
2. Which AI connection will create it
3. Which chat messages belong to the scene

---

# Part 4: Choose Where Memories Will Be Stored

Memory Books stores memories as entries in a SillyTavern lorebook.

A lorebook used for this purpose is called a **Memory Book**.

You have three storage options.

## Recommended for Beginners: Auto-Create a Memory Book

In the main Memory Books panel:

1. Find **Auto-create lorebook if none exists**.
2. Enable it.
3. Leave the default **Lorebook Name Template** unless you have a reason to change it.

When you create your first memory, Memory Books will create a lorebook and bind it to the current chat if the chat does not already have one.

This removes the need to create and bind a lorebook manually.

## Automatic Mode: Use the Chat-Bound Lorebook

This is the normal default mode.

Memory Books uses the lorebook already bound to the current character or group chat.

Under **Current Lorebook Configuration**, check **Active Lorebook**.

If a lorebook name appears, Memory Books can store memories there.

If it says **None selected**, either:

* Bind a lorebook to the chat through SillyTavern
* Enable **Auto-create lorebook if none exists**
* Use Manual Lorebook Mode

## Manual Lorebook Mode

**Enable Manual Lorebook Mode** lets you choose a specific Memory Book for the current chat instead of using the normal chat-bound lorebook.

Use this when:

* You maintain a separate lorebook only for memories
* You want several chats to use a specific Memory Book
* You are configuring separate Memory Books for group-chat characters
* You understand how your lorebooks are organized

Most new users do not need Manual Lorebook Mode.

> **Manual Lorebook Mode and Auto-create lorebook cannot be enabled together.**

## Should the Memory Book Be Separate?

A separate Memory Book is generally easier to manage.

It lets you:

* Keep memories separate from character definitions and world information
* Give memories their own context budget
* Reuse the Memory Book in another chat
* Manage activation through Lorebook Ordering
* Review or export memories without unrelated lorebook entries mixed in

For the easiest initial setup, enable **Auto-create lorebook if none exists** and let Memory Books make the separate book for you.

---

# Part 5: Choose the AI Connection

Scroll to **Memory Profiles**.

A Memory Profile tells Memory Books:

* Which API or provider to use
* Which model to use
* Which temperature to use
* Which memory prompt to send
* How memory titles should be formatted
* How the resulting lorebook entry should behave

## Recommended First Profile

Select:

**Current SillyTavern Settings**

This uses your active SillyTavern connection.

If your current model can respond normally in the chat, it is the simplest place to begin.

Do not create a custom profile until you have successfully created one memory.

## When to Create a Separate Profile

Create a custom Memory Books profile later when you want to:

* Use a cheaper model for memories
* Use a more reliable model for structured JSON
* Give memory generation a different temperature
* Use a custom summary prompt
* Change memory activation behavior
* Use a different provider from the one used for roleplay

## Check the Selected Profile

The **Profile Settings** box shows the selected profile’s:

* Provider
* Model
* Temperature
* Title format

If the provider or model says **Not Set**, fix your SillyTavern connection before continuing.

## Do Not Edit the Prompt Yet

Memory Books includes working built-in prompts.

Custom prompts must preserve the required JSON response structure. Removing the JSON instructions can prevent Memory Books from reading the result.

Create a successful memory with the built-in prompt before changing it.

---

# Part 6: Understand Scenes

A **scene** is the range of chat messages that Memory Books will read for one memory.

For example:

* The characters arrive at a hotel.
* They question the desk clerk.
* They discover which room the suspect used.
* They decide to search the parking garage.

Those messages might form one scene and therefore one memory.

The next scene might begin when they reach the garage.

## Choosing Good Scene Boundaries

A useful scene usually contains:

* One event
* One conversation
* One investigation step
* One emotional development
* One change in location or goal
* One connected sequence of actions

Do not worry about finding the perfect literary boundary. The scene only needs to be coherent enough for the AI to summarize.

### Scenes That Are Too Small

A scene containing only one or two trivial messages may not provide enough useful information.

### Scenes That Are Too Large

A very large scene may:

* Cost more to process
* Take longer
* Exceed the model’s context limit
* Produce a less focused memory
* Increase the chance of invalid or cut-off JSON

For a first test, select a short but complete conversation or event.

---

# Part 7: Mark Your First Scene

Each chat message has message-action controls.

Depending on your SillyTavern layout, those controls may be collapsed.

## Reveal the Scene Buttons

1. Move your pointer over a chat message.
2. Find the message-actions button, usually shown as three dots or a small expandable control.
3. Click it to expand the message actions.
4. Look for the **►** and **◄** buttons.

The buttons mean:

* **► Mark Scene Start**
* **◄ Mark Scene End**

## Select the Scene

1. Find the first message that should be included.
2. Click **►** on that message.
3. Find the last message that should be included.
4. Click **◄** on that message.

Messages inside the selected range may receive a visual highlight. Exact colors depend on your SillyTavern theme.

## Confirm the Selection

Open the magic-wand menu and click **Memory Books**.

At the top of the panel, **Current Scene** should show:

* Start message
* End message
* Starting speaker
* Ending speaker
* Number of selected messages
* Estimated tokens

If the panel says **No scene markers set**, both scene boundaries have not been selected.

## Clear or Change the Scene

To start over:

1. Open Memory Books.
2. Click **Clear Scene**.
3. Select a new start and end.

You can also click a different **►** or **◄** button to change the appropriate boundary.

---

# Part 8: Create Your First Memory

Once the scene and Memory Book are ready:

1. Open the magic-wand Extensions menu.
2. Click **Memory Books**.
3. Confirm that **Current Scene** shows the intended range.
4. Confirm that **Active Lorebook** shows a Memory Book, or that auto-creation is enabled.
5. Confirm that the intended Memory Profile is selected.
6. Click **Create Memory**.

Memory Books will compile the scene and send it to the selected model.

## What May Happen Next

Depending on your settings, you may see:

* A confirmation window
* Advanced memory options
* A memory preview
* A group participant confirmation
* A token warning
* A generation-in-progress notification
* A completed job in the Chat Top Bar queue

These are not errors.

## Confirmation or Advanced Options

The confirmation window may let you review:

* The selected profile
* The effective memory prompt
* Previous memories included as context
* The current API and model
* Estimated token usage

For your first memory, keep the default options and continue.

## Memory Preview

If **Show memory previews** is enabled, Memory Books displays the generated:

* Memory title
* Memory content
* Keywords

You can edit these before saving.

Check that:

* The title is not blank
* The summary describes the selected scene
* Important names are correct
* The keywords are relevant
* The AI did not include unrelated commentary

Then approve the preview.

## If No Preview Appears

Memory previews are optional and disabled by default.

Without a preview, Memory Books saves a valid result automatically and shows a completion notification.

---

# Part 9: Verify That It Worked

Do not assume the memory worked merely because the AI request finished. Check the result.

## Check Memory Status

Open Memory Books.

The **Memory Status** section should now say that the chat has been processed up to a particular message.

The processed message should correspond to the end of the scene you selected.

## Check the Memory Book

Open the relevant lorebook in SillyTavern.

You should see a new entry containing:

* A numbered or formatted title
* The scene summary
* Activation keywords
* Memory Books metadata

The exact title depends on the selected title format.

## Check for a Success Notification

If **Show notifications** is enabled, Memory Books should report that the memory was created.

## Understand Hidden Messages

After creating a memory, some older chat messages may become hidden.

They were not deleted.

Memory Books can hide processed chat messages so they stop consuming the active chat-history budget. The saved memory then carries forward the important information.

Open:

**Memory Books → General Settings → Token Saving (Hide/Unhide Messages)**

The **Auto-hide messages after adding memory** setting has three choices:

* **Do not auto-hide**
* **Auto-hide all messages up to the last memory**
* **Auto-hide only messages in the last memory**

If disappearing messages would alarm you during the first test, choose **Do not auto-hide**. After verifying that memory creation works, switch to **Auto-hide all messages up to the last memory** to receive the main context-saving benefit.

The setting **Messages to leave unhidden** keeps a small number of recent messages visible around the boundary.

---

# Part 10: Create the First Memory Before Enabling Automation

Automatic Memories need a starting checkpoint.

Create at least one manual memory in each chat before relying on automatic memory creation.

This tells Memory Books:

> Everything through this message has already been processed.

Without that checkpoint, Memory Books does not know where automatic summarization should begin.

## New or Short Chat

You can select the whole meaningful conversation for the first memory.

## Existing Long Chat

Do not automatically put the entire chat into one enormous scene.

Instead:

1. Select a reasonable recent scene.
2. Create one manual memory.
3. Treat its ending message as the automatic-memory starting point.

If you later want to convert the older chat history, use the advanced catch-up workflow rather than trying to summarize thousands of messages at once.

---

# Part 11: Enable Automatic Memories

After the first manual memory succeeds:

1. Open Memory Books.
2. Under **Settings**, click **Automatic Memories**.
3. Enable **Auto-create memory summaries**.
4. Set the **Auto-Summary Interval**.
5. Set the **Auto-Summary Buffer**.
6. Close or save the settings.

## Recommended Starting Values

Try:

* **Auto-Summary Interval:** 30 messages
* **Auto-Summary Buffer:** 2 messages

Adjust these later based on your writing style.

## What the Interval Means

The interval is the number of new messages Memory Books should collect for the next automatic memory.

A lower interval creates:

* More frequent memories
* Smaller and more focused summaries
* More AI requests
* More lorebook entries

A higher interval creates:

* Fewer AI requests
* Larger summaries
* Fewer lorebook entries
* A greater chance that unrelated events will be combined

For detailed roleplay, approximately 20–40 messages is a reasonable starting range.

For shorter or faster exchanges, you may prefer 40–60 messages.

## What the Buffer Means

The buffer leaves the newest messages out of the current automatic memory.

For example:

* Interval: 30
* Buffer: 2

Memory Books waits until enough messages are available, summarizes the earlier 30, and leaves the newest 2 messages for the next run.

This helps avoid summarizing a scene while it is still unfolding.

## Test the Automatic Workflow

After enabling it:

1. Continue chatting normally.
2. Watch the **Memory Status** boundary.
3. Wait until the interval and buffer requirements are met.
4. Confirm that Memory Books creates the next memory.
5. Open the Memory Book and inspect the new entry.

Do not assume automation is working until you have seen one automatic memory complete.

---

# Part 12: Beginner Settings

## Enable or Keep Enabled

### Auto-create lorebook if none exists

Recommended when you do not want to manage Memory Books manually.

### Show notifications

Helps confirm whether an operation started, completed, or failed.

### Show memory previews

Recommended for your first several memories.

Previews let you catch:

* Incorrect names
* Missing events
* Invalid summaries
* Poor keywords
* Model misunderstandings

Once you trust the model and profile, you can disable previews for a more automatic workflow.

### Memory boundary indicator

The divider or jump button shows how much of the chat Memory Books has processed.

This makes it easier to see where remembered history ends and unsummarized chat begins.

### Auto-create memory summaries

Enable this only after making the first manual memory in the chat.

### Auto-hide messages

Enable this after you understand that hidden messages are not deleted.

## Leave Alone at First

New users can generally ignore:

* Manual Lorebook Mode
* Custom Memory Profiles
* Custom memory prompts
* Summary Prompt Manager
* Consolidation Prompt Manager
* Context Settings
* Trackers and Side Prompt Sets
* Regex integration
* Separate group-character Memory Books
* Lorebook Ordering integration
* Compaction
* Consolidation
* Custom title formats
* Slash commands

These are useful features, but none is required to create and use ordinary memories.

---

# Part 13: What Each Major Feature Does

Use this section when you know what information you want to preserve but do not know which tool to choose.

## Memory

A Memory summarizes one selected scene.

Use it for:

* Events
* Conversations
* Decisions
* Emotional developments
* Discoveries
* Conflict and resolution
* Changes in plans or relationships

Think:

> “Remember what happened in this scene.”

## Automatic Memory

An Automatic Memory performs the normal memory process after enough new messages accumulate.

Use it when:

* You want regular scene memories
* You do not want to mark every scene manually
* Your chats are long and ongoing

Think:

> “Keep summarizing the new chat as I go.”

## Clip

A Clip saves one specific piece of selected chat text.

Use it for:

* A preference
* A promise
* A secret
* A name
* An item
* A pet
* A short relationship fact
* A line that should be preserved exactly or nearly exactly

To create one:

1. Highlight text inside a chat message.
2. Click the floating Clip button.
3. Choose an existing Clip entry or create a new one.
4. Choose whether it should always activate or activate through keywords.
5. Review the result.
6. Save it.

Think:

> “Pin this fact.”

## Topical Clip

A Topical Clip gathers information about one subject from memories that already exist.

Use it when information about the same subject is spread across several scene memories.

Examples:

* Everything known about an NPC
* The history of a relationship
* A recurring location
* An investigation
* A character’s injuries
* A faction
* A mystery
* An important item

To create one:

1. Open Memory Books.
2. Click **Topical Clip**.
3. Choose the source Memory Book.
4. Enter the topic.
5. Enter activation keywords, or let the topic supply them.
6. Choose whether to create a new entry or update an existing Clip entry.
7. Choose the generation profile.
8. Generate the draft.
9. Review it.
10. Save it.

Think:

> “Collect everything my memories say about this subject.”

## Side Prompt

A Side Prompt asks the AI to maintain an ongoing tracker.

Use it for information that changes repeatedly, such as:

* Relationship status
* Current mission
* Inventory
* Injuries
* Character statistics
* Unresolved plot threads
* NPC lists
* World state

Think:

> “Keep this tracker updated.”

## Consolidation

Consolidation combines several memories into a higher-level recap.

For example:

* Several scene memories become an Arc
* Several Arcs become a Chapter
* Several Chapters become a Book

Use it when many separate memories describe one larger period or development.

Think:

> “Roll these memories up into a larger recap.”

## Compaction

Compaction shortens one existing Memory Books entry while preserving its important information.

Use it when:

* A Clip entry has become too long
* A Side Prompt tracker contains repetition
* A memory is useful but wordy
* An always-active entry is consuming too much context

Think:

> “Trim this entry without losing its facts.”

## The Simple Decision Rule

* **What happened in these messages?** Use a Memory.
* **Save this exact fact.** Use a Clip.
* **Collect saved information about this topic.** Use Topical Clip.
* **Keep this changing information updated.** Use a Side Prompt.
* **Combine several memories into a larger recap.** Use Consolidation.
* **Shorten one long entry.** Use Compaction.

---

# Part 14: Group Chats

Memory Books works in group chats without a special group-mode switch.

## Recommended Group Setup

Start with one Memory Book bound to the group chat.

1. Open the group chat.
2. Enable **Auto-create lorebook if none exists**, or bind a lorebook manually.
3. Mark and create memories normally.
4. Review detected participants when prompted.

Memory Books can identify which characters participated in the selected scene and attach character filters to the memory.

This helps distinguish:

* Who performed an action
* Who witnessed an event
* Who learned a secret
* Who felt or believed something

## Separate Character Memory Books

Separate group and character Memory Books are an advanced setup.

Use them only when you need:

* Private character knowledge
* Individual emotional continuity
* Different memories for different participants
* A shared omniscient group history plus personal histories

This setup generally involves:

* Manual Lorebook Mode
* One main group Memory Book
* Character-specific Memory Book assignments
* Lorebook Ordering
* Participant review
* Optional character-focused memory prompts

Begin with one group Memory Book. Add separate books only when the story requires them.

---

# Part 15: Common First-Run Problems

## Memory Books Is Missing from the Extensions Menu

Check:

1. Did the extension finish installing?
2. Is it enabled in the Extensions panel?
3. Did you reload SillyTavern?
4. Did you open a character or group chat?
5. Did you wait several seconds after the chat loaded?

## The Scene Buttons Are Missing

1. Hover over a chat message.
2. Expand its message actions using the three-dot or message-actions control.
3. Look for **►** and **◄**.
4. Wait up to ten seconds after loading the chat.
5. Refresh the page if they still do not appear.

## Memory Books Says No Scene Is Selected

Both boundaries are required.

* Click **►** on the first message.
* Click **◄** on the last message.

Then reopen Memory Books and confirm that **Current Scene** shows both values.

## No Memory Book Is Selected

Use one of these solutions:

* Enable **Auto-create lorebook if none exists**
* Bind a lorebook to the chat
* Enable Manual Lorebook Mode and select a lorebook

## The Model Failed to Return a Valid Memory

Check:

* The selected model can follow JSON instructions
* The response was not cut off
* The maximum response length is large enough
* The built-in prompt has not been damaged
* The API and model shown in the selected profile are correct
* The provider is reachable
* A local backend is exposed through a compatible endpoint

Try a more instruction-following model before rewriting the prompt.

## The Memory Was Created but Chat Messages Disappeared

They were probably hidden by the token-saving settings.

Open:

**Memory Books → General Settings → Token Saving (Hide/Unhide Messages)**

Change **Auto-hide messages after adding memory** to **Do not auto-hide** if you want the processed messages to remain visible.

Hidden messages are not deleted.

## Automatic Memories Are Not Running

Check:

1. Did you create one manual memory in this chat first?
2. Is **Auto-create memory summaries** enabled?
3. Have enough new messages accumulated?
4. Does the interval account for individual messages from both the user and AI?
5. Is a buffer delaying the run?
6. Is a valid Memory Book assigned?
7. Is another Memory Books job still running?
8. Did the automatic run get postponed or require review?

## The AI Does Not Seem to Remember the Saved Entry

Creating a lorebook entry and sending that entry to the model are separate stages.

Check:

1. Does the entry exist in the Memory Book?
2. Is the Memory Book active for this chat?
3. Are its activation keywords relevant?
4. Is the entry constant or keyword-triggered?
5. Is the lorebook context budget large enough?
6. Is **Delay until recursion** preventing activation?
7. Does a World Info inspection tool show that the entry was sent?

If the entry was sent but the model ignored it, the remaining problem is model behavior rather than memory storage.

---

# Frequently Asked Questions

## I installed Memory Books. What do I do first?

1. Open a character chat or group chat.
2. Click the magic-wand Extensions menu.
3. Open **Memory Books**.
4. Enable **Auto-create lorebook if none exists**.
5. Select **Current SillyTavern Settings** as the Memory Profile.
6. Mark a short scene with **►** and **◄**.
7. Open Memory Books again.
8. Click **Create Memory**.
9. Confirm that a new entry appears in the Memory Book.
10. After that succeeds, enable **Automatic Memories**.

Do not begin by changing prompts, creating custom profiles, configuring Side Prompts, or setting up Consolidation.

---

## I can’t find the Memory Books settings.

The settings are inside SillyTavern’s Extensions menu.

Look beside the chat input box for the **magic-wand icon**.

1. Click the magic wand.
2. Look for **Memory Books**.
3. Click it.

If it is not listed:

1. Open the main Extensions panel.
2. Confirm that Memory Books is installed.
3. Confirm that it is enabled.
4. Reload SillyTavern.
5. Open a character or group chat.
6. Check the magic-wand menu again.

---

## How do I set the current scene?

1. Find the first message you want included.
2. Expand that message’s actions if necessary.
3. Click **► Mark Scene Start**.
4. Find the last message you want included.
5. Click **◄ Mark Scene End**.
6. Open Memory Books.
7. Check the **Current Scene** section.

The selected scene includes both boundary messages and everything between them.

---

## Why wasn’t a memory created?

Check these in order:

1. **Scene:** Are both the start and end markers set?
2. **Storage:** Is an Active Lorebook shown, or is auto-creation enabled?
3. **Profile:** Does the selected profile show a valid provider and model?
4. **Connection:** Can the selected AI connection generate a normal response?
5. **Output:** Did the model return valid, complete JSON?
6. **Length:** Was the response cut off by a small maximum-output setting?
7. **Preview:** Is the memory waiting for approval in a preview window?
8. **Queue:** Does the Chat Top Bar show a failed or review-needed job?
9. **Notifications:** Did Memory Books display a specific error?

The most common first-run problems are a missing scene boundary, no selected lorebook, or a model that did not return valid JSON.

---

## Which features should a beginner enable?

Recommended:

* **Auto-create lorebook if none exists**
* **Show notifications**
* **Show memory previews**, at least during setup
* **Memory boundary indicator**
* **Auto-create memory summaries**, after the first manual memory
* **Auto-hide messages**, after you understand what hiding does

Leave advanced features alone until normal memory creation works:

* Manual Lorebook Mode
* Custom prompts
* Custom profiles
* Side Prompts
* Consolidation
* Compaction
* Regex
* Separate group-character Memory Books
* Lorebook Ordering
* Custom context settings

---

## Help me choose between Clips and Topical Clip.

Use a **Clip** when the fact is visible in the current chat and you can highlight it.

Example:

> “Mara is allergic to lavender.”

Highlight that sentence and save it as a Clip.

Use **Topical Clip** when the information is spread across memories that already exist.

Example:

> Several memories mention Mara’s allergies, prior reactions, medication, and which flowers she avoids.

Use Topical Clip to create one focused entry about **Mara’s allergies**.

The rule is:

* **Clip:** Save this selected fact.
* **Topical Clip:** Gather saved facts about this topic.

Neither is an ongoing tracker. Use a Side Prompt when the information should be repeatedly updated.

---

## I’ll upload a screenshot. Tell me what to click.

Upload a screenshot that includes as much of the relevant SillyTavern window as possible.

Include:

* The chat input area
* The magic-wand icon or Extensions menu
* The visible Memory Books panel
* Any error message
* The message whose action buttons you are trying to use

Redact:

* API keys
* Account details
* Private chat content you do not want shared
* Private server addresses
* Personal information

Along with the screenshot, say what you were trying to accomplish.

For example:

> “I am trying to mark the beginning of a scene, but I cannot find the button.”

The help assistant should then:

1. Identify the visible screen.
2. Explain what is currently open.
3. Name the next control using its visible label.
4. Give one immediate action.
5. Avoid assuming that an off-screen control is present.

---

## Do I need vectors?

No.

Memory Books can use lorebook activation keywords without the Vectors extension. Memory generation includes automated keyword creation, so you do not have to manually invent keywords for every memory.

Vectors are an optional alternative or supplement, not an installation requirement.

---

## Should I use Delay until recursion?

If the Memory Book is your only active lorebook or World Info source, leave **Delay until recursion** disabled.

When no other entry starts the first recursion cycle, delaying the Memory Book until recursion may prevent it from activating at all.

Use delayed recursion only when you understand your lorebook activation chain and have another source capable of beginning recursion.

---

## Should I use one Memory Book or several?

Start with one Memory Book for each continuing chat or story.

Use several only when you need:

* Separate private character knowledge
* Different Memory Books for different group members
* Reusable memories shared across chats
* Independent budgets or activation rules
* A deliberate Lorebook Ordering setup

One working Memory Book is better than a complicated configuration you cannot diagnose.

---

## Can I use Memory Books manually without Automatic Memories?

Yes.

Mark a scene and click **Create Memory** whenever you decide something should be saved.

Automatic Memories are optional. Manual creation gives you direct control over scene boundaries and timing.

---

## Does Memory Books delete my chat messages?

No.

Memory Books may hide processed messages to reduce active context use. Hidden messages remain part of the chat and can be revealed again.

Check the token-saving settings if you do not want automatic hiding.

---

## What should I do after my first successful memory?

1. Enable Automatic Memories.
2. Choose a reasonable interval and buffer.
3. Create several memories during normal use.
4. Confirm that they activate correctly.
5. Try Clips for individual facts.
6. Add a Side Prompt only if you need a changing tracker.
7. Use Topical Clip after enough memories contain information worth gathering.
8. Consider Consolidation only after several related memories exist.
9. Use Compaction only when an entry becomes too long.

Build the workflow one layer at a time.
