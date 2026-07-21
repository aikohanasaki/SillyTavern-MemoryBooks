# Building a Comprehensive SillyTavern Lorebook: Method and Case Study

This document does two things at once. First, it explains how to build a SillyTavern lorebook (World Info file) from a long story, from zero background, so someone who has never done this could follow it. Second, it tells the actual story of how this specific method got built: the false starts, the wrong turns, and the one outright mistake that mattered most. The method exists in its current form *because* of that history, not despite it, so the two halves belong in one document.

---

## Part 1: Background, for someone starting from zero

**SillyTavern** is a front-end for chatting with AI characters, popular for long-running roleplay and interactive fiction. A **World Info file**, usually called a **lorebook**, is a database of facts that gets fed to the AI automatically, but only the relevant slices of it, not the whole thing at once.

Here's the mechanism: a lorebook is a list of **entries**. Each entry has a list of **keywords** and a block of **content**. Every time a new message is about to be sent to the AI, SillyTavern scans the recent chat for any of those keywords. If a keyword matches, that entry's content gets quietly inserted into the AI's context for that reply, then dropped again once it's no longer relevant. So if an entry's keyword is "Grondulf" and someone mentions Grondulf, the AI suddenly "remembers" everything in that entry, his appearance, his history, how he talks, without the person having to re-explain him every time and without permanently bloating every single message with information that usually isn't needed.

This is what makes long fiction workable with an AI that only sees a limited window of recent conversation: the lorebook is the story's memory, and the keyword system is how the right memories get pulled up at the right moment instead of all of them, all the time.

The job this document describes is: given a long story (in our case, an ongoing satirical fantasy isekai, meaning "a story about someone pulled from the real world into a fantasy one"), read it and produce a full set of these entries, one per character, plus entries for major events and locations, formatted so they can be dropped straight into SillyTavern.

---

## Part 2: The method

### 2.1 The one principle everything else depends on

**Read the whole source directly. Do not rely on search to find everything.**

If the story exists as a file you can open and read start to finish, that is always the right way to catalog it. Read it in sequential chunks, front to back, keeping a running list of every name and event as you go. This is the only approach that can honestly claim completeness, because you've actually seen every line.

The alternative, searching a document by asking it questions and reading back whatever comes closest to matching, is a fundamentally different and weaker tool. It's designed to answer "what does this document say about X," not "what is every X-like thing in this document." Ask it about characters and it will show you characters that resemble your query. It will not tell you about the character you didn't think to ask about. It gives no signal about what it's leaving out, which means a search-based pass can look thorough and still have holes, and the person doing it has no way to tell the difference from the inside.

This distinction is the single biggest lesson of the whole project (see Part 4), and it's worth internalizing before touching the rest of the method, because every other safeguard here exists to compensate for the cases where full reading isn't available.

### 2.2 The entry template

Consistency matters more than any individual field choice. Use the same shape for every entry of a given type across the whole book:

**Characters:**
```
Name:
Age:
Race:
Home Location:
Status:
Personality:
Physical Description:
Actions in Story:
Relationships:
Key Abilities/Ranks:
Key Quotes:
```

**Events** (origin scenes, battles, negotiations, major reveals, anything pivotal enough that it shouldn't just be a sentence buried inside someone's character bio):
```
Name:
Summary:
Key Events:
Significance:
Key Quotes:
```

**Locations:**
```
Name:
Summary:
Features:
Status:
Key Quotes: (optional)
```

Two disciplines matter here. First, write to the actual length a character or event deserves. A one-scene walk-on character needs three sentences; padding them out to match a main character's entry length wastes space and dilutes what's actually distinctive about them. Second, when a fact genuinely isn't stated anywhere in the source (a character's exact age, where they're originally from), write "unspecified," don't invent something plausible. An invented detail has a way of quietly becoming treated as fact later, and there's no way for anyone to tell it apart from a real one just by reading the entry.

### 2.3 The six-pass workflow

**Pass 0, scope and format.** If there's an existing lorebook already, that's the base: edit it in place, and only touch fields there's an actual reason to change (don't casually rewrite something that was already correct just because you're in the file for another reason). Decide up front whether the output should be real importable SillyTavern JSON or plain text blocks meant for manually pasting into the interface; this changes what comes later.

**Pass 1, full discovery.** Before writing a single entry, build a complete list: every named character however minor, every named place, every large event, every open plot thread. If reading the raw file directly, this means literally reading start to finish. If search is the only option, this means budgeting far more search calls than feels necessary and searching in layers, not just by the names already known: chronological markers to make sure early, middle, and late material all got covered, category sweeps (village names, faction names, anything a phrase like "eleven villages" implies you're still missing), and a dedicated check at the end for language that would only exist if the story kept going past the last thing found.

**Pass 2, draft entries.** Write the actual entries using the templates above.

**Pass 3, quote diversity.** For each character with enough material, pick two or three quotes spread across early, middle, and late in the story, not three quotes from the one scene that happened to come up in search first. If a character's actual page-time really is confined to one scene, say so honestly in the entry and pick three different beats within that scene instead of faking a spread that isn't there.

**Pass 4, coverage audit.** This is a mandatory second look, not an optional polish step. Go back through the draft specifically hunting for what it's missing: names that showed up in someone else's "Relationships" field but never got their own entry, two different characters who might share a name or nickname, any claim in an entry that's more dramatic than the source actually supports (worth explicitly re-checking rather than assuming a first impression was right). If this is an update to an already-existing lorebook, resist only searching for what's new since last time; do a full pass across the whole story periodically, because gaps from earlier rounds compound otherwise.

**Pass 5, the technical pass** (JSON output only, but worth understanding even for plain-text output since the same problems can bite later if someone converts it). Covered in full in section 2.4 below. This is the pass most likely to get skipped because the writing already "feels done," and it's the single highest-value pass in the whole workflow for anyone actually running the resulting file.

**Pass 6, deliver.** Match the existing filename exactly if replacing an existing file. If the delivery platform alters how the filename displays, say so explicitly rather than letting someone download something that looks different from what they expected.

### 2.4 The technical pass, explained plainly

Three mechanisms matter here, and all three came from real problems found in this project, not abstract theorizing.

**Keyword collisions.** A keyword needs to be specific enough that it only fires when actually relevant. Watch for: a character name that's also an ordinary word (a character named Button will collide with every mention of an actual button on a coat), two different entries that both want to claim the same word, and any keyword so broad it fires on nearly every single message, which defeats the entire purpose of a keyword system.

**Recursion.** After the initial scan of the actual chat text, SillyTavern can optionally do a second pass: scanning the content of whatever just got triggered, for further keyword matches. This means if Character A's entry mentions Character B by name, B's entry can fire even though nobody typed B's name, purely because A's entry did. In a story with an ensemble cast, where most character entries naturally mention several other characters, leaving this unrestricted means one keyword match can cascade into a dozen entries firing together on a single turn. The fix is to make most entries "recursion-proof" by default (their content is a dead end, it won't trigger anything further), and deliberately allow cascading only for a small, chosen cluster of entries that are genuinely meant to surface together, like several strands of one interconnected mystery.

**Probability.** Some entries are close to guaranteed to match on literally every message, most obviously the protagonist, whose name is usually the speaker tag on every single turn. Reinjecting that entry's full content every single time regardless of whether anything about it is actually relevant to that turn is wasteful. Setting that entry's probability to something like 70-90% means it usually still fires, but not on every single turn come what may, freeing up a little room. This only works cleanly if paired with a setting that stops the entry from being triggered a second way, through recursion, since otherwise a failed roll can be quietly overridden by a different path to the same entry.

---

## Part 3: The case study, how this project actually got here

This is the honest chronological account, including the parts that didn't go well.

**Phase one: direct reading, while it lasted.** The very first request was to read the whole story and produce lorebook entries for every important character. At this point, the raw story file was directly accessible on disk, so it was read start to finish in sequential chunks, tracking line ranges covered. This produced a first version with roughly two dozen characters, output as full SillyTavern-format JSON.

**Phase two: format iteration.** The next several requests were about presentation, not content: switch to plain copy-pasteable keyword-and-content blocks instead of JSON, add representative quotes for each character's voice, then a pass specifically to tighten the prose and inject more humor into the writing itself rather than relying only on the quotes to carry personality. None of this touched the underlying discovery problem yet, because the story hadn't changed and there was nothing new to find.

**Phase three: the story updates, and the tooling changes underneath.** At this point the underlying story had been updated with new chapters, and the request was to read the new material and produce a fully updated lorebook. This is where the direct file access that phase one depended on was no longer available; the same file path that had worked before now came back empty. The only remaining tool was a semantic search over the project's stored knowledge, a tool built to answer specific questions well, not to guarantee full coverage of a document.

This shift happened quietly, without enough acknowledgment at the time that it represented a real drop in reliability, not just a different way of doing the same thing. A large batch of genuinely new content did get found this way (a major antagonist's origin, a new region of the story, several new supporting characters), and the resulting lorebook update looked complete. It wasn't, but there was no way to tell that from the output alone.

**Phase four: the user catches gaps, twice.** Later requests explicitly said "you missed some stuff, do another pass," more than once. Each time, more searching turned up real, substantial material that a search-based first pass had missed entirely: an entire county-wide event involving eleven villages that had somehow never surfaced in earlier searches, additional depth on an antagonist whose full nature and motives had only been partially captured the first time around, several smaller fraud subplots, and a genuine naming collision between two unrelated characters who happened to share a nickname.

**Phase five: the one real mistake.** During one of these "catch up" passes, something more serious than a gap turned up: an earlier version of the lorebook had stated, as settled fact, that two specific characters had a quietly developing romantic tension. Re-reading the material more carefully revealed this was wrong. The actual scene in the story was between one of those characters and an entirely different figure (a goddess, not the character originally named). The mistake happened because there was enough partial evidence lying around, a cover story, a suspicious reaction from a bystander, to support a plausible-sounding conclusion, without the search process ever actually surfacing the one scene that explained what was really going on. This is worth separating clearly from the "missed content" gaps above: a gap is an honest incompleteness, and gets fixed by looking again. Confidently stating something false is a different category of failure, because it actively misleads rather than merely under-delivering, and it's harder to catch precisely because it doesn't look like a gap from the outside.

**Phase six: the technical pass, and finding out how much had been left unmanaged.** Once the content itself was in reasonably good shape, a request specifically to review keywords, "recursion," and firing probability turned up a cluster of real structural problems that had been present since the very first version and never examined: one word serving as the trigger for three separate unrelated entries at once, a character's title becoming ambiguous once the protagonist independently acquired the same title later in the story, a character name colliding with an ordinary object mentioned constantly elsewhere in the text, and no thought at all having been given to whether the protagonist's own entry, which matches on essentially every single message by design, should really be reinserted in full every single time regardless of relevance.

**Phase seven: naming the pattern.** A direct request for an honest retrospective is what connected all of the above into one diagnosis rather than a list of unrelated incidents. Every gap in phase four, and the actual mistake in phase five, traced back to the same root cause: relying on search as the primary way of finding things, once direct file reading stopped being available, without treating that as a meaningfully weaker method that needed extra safeguards built around it. The technical problems in phase six were a separate but related failure: treating the "get the content right" work as the whole job, when a lorebook's actual behavior depends just as much on the keyword and recursion configuration underneath the content, and that layer had never been deliberately reviewed at all until asked for directly.

**Phase eight: turning the diagnosis into a repeatable method.** The response to that diagnosis was to write the workflow down as a formal, reusable skill, specifically structured so that the failure modes above can't quietly repeat themselves: a stated principle that search is a fallback, not a default; a mandatory coverage-audit pass that exists specifically to catch the kind of gap phase four kept finding; an explicit instruction to double-check dramatic or surprising claims against the source before stating them as fact, directly because of what happened in phase five; and a technical pass that is mandatory rather than optional, directly because of what phase six turned up sitting unexamined since the beginning.

---

## Part 4: Why the method looks the way it does

Each element of the method in Part 2 maps directly back to something that went wrong in Part 3. Laid out side by side:

| What happened | What the method now does about it |
|---|---|
| Direct file access disappeared partway through, and the switch to search-only wasn't treated as a real downgrade | The method states plainly that search is a degraded fallback, and requires saying so out loud when it happens, rather than silently proceeding as if nothing changed |
| Search-based passes repeatedly missed real content (a whole county-wide event, an antagonist's full backstory, several subplots) | Discovery is required to happen in layers (chronological, categorical, and a final "is there more" check), with an explicit minimum number of search calls, rather than stopping once results stop looking new |
| Two unrelated characters shared a nickname, causing an actual keyword collision later | The coverage audit pass explicitly calls out checking for name collisions before they become a technical problem |
| A romantic subplot was misattributed to the wrong pair of characters and stated as fact | The method requires re-verifying any dramatic or surprising claim against the source before writing it down as settled, and requires flagging ambiguity instead of picking the more interesting reading |
| A major antagonist's full nature was only partially captured on the first attempt | The coverage-audit pass requires actively re-checking entries that seem complete, not just adding entries for things that were fully missed |
| One keyword fired on three unrelated entries at once; a title collided with the protagonist's own new title; a character name collided with an ordinary word; nobody had reviewed the protagonist's own firing rate at all | The technical pass is a mandatory, separate stage with its own checklist (collisions, recursion scope, probability), not an optional add-on that only happens if someone thinks to ask |
| Updates to the story only prompted searching for "what's new," letting earlier gaps sit uncaught indefinitely | The method explicitly recommends a full re-sweep of the whole story periodically, not just the newest material, when catching a lorebook up |

---

## Part 5: What currently exists

Two concrete deliverables came out of this project:

1. **The lorebook itself**, a SillyTavern-format JSON World Info file covering every character, major event, and location found across the full story to date, including the technical keyword/recursion/probability configuration described above.
2. **A packaged, reusable skill** encoding the method in Part 2 and the lessons in Part 4, so the same workflow, including the mandatory coverage audit and technical pass, gets applied automatically to future stories or future updates to this one, rather than needing to be rediscovered the hard way each time.
