[Back to README](readme.md)

# 📝 Character Restrictions in Memory Titles

STMemoryBooks applies **strict character filtering** to memory titles and metadata fields to ensure compatibility with SillyTavern's lorebook system. This affects title templates and AI-extracted titles, but **memory content itself has no restrictions**.

## 🎯 What Gets Restricted

**Character restrictions apply to:**
- 🏷️ AI-extracted titles (`{{title}}`)
- 👤 Character names in templates (`{{char}}`)
- 🧑‍💻 User names in templates (`{{user}}`)
- 📋 Final lorebook entry titles/comments
- 🎨 Any text used in title format templates

**🆓 NO character restrictions apply to:**
- 📝 Memory content (completely unrestricted)
- 💬 Original chat message content
- 🤖 AI-generated memory text (before title extraction)

## ✅ Allowed Characters

The title sanitization system **only allows**:

### 📝 Basic Text
- **ASCII Letters**: `A-Z`, `a-z`
- **Numbers**: `0-9`
- **Spaces**: ` ` (regular spaces)

### 🔤 Allowed Punctuation
- **Hyphen**: `-`
- **Period**: `.`
- **Parentheses**: `(` `)`
- **Hash/Number sign**: `#`
- **Square brackets**: `[` `]`
- **Curly braces**: `{` `}`
- **Colon**: `:`
- **Semicolon**: `;`
- **Comma**: `,`

### 😀 Limited Emoji Support
- **Emoticons**: 😀-🙿 (main emoticon block)
- **Symbols**: 🌀-🗿 (misc symbols and pictographs)
- **Transport**: 🚀-🛿 (transport and map symbols)
- **Flags**: 🇠-🇿 (regional indicator symbols)
- **Misc Symbols**: ☀-⛿ (miscellaneous symbols)
- **Dingbats**: ✀-➿ (dingbats block)

## ❌ Blocked Characters

**All other characters are automatically removed**, including:

### 🌍 International Characters
- **Accented**: `é`, `ñ`, `ü`, `ø`, etc.
- **Cyrillic**: `Сергей`, `Анна`, etc.
- **Chinese/Japanese**: `先生`, `田中`, etc.
- **Arabic**: `العربية`, etc.
- **All other non-ASCII scripts**

### 💬 Quotes and Apostrophes
- **Single quotes**: `'` `'` `'`
- **Double quotes**: `"` `"` `"`
- **Apostrophes**: `'` (O'Malley → OMalley)

### 🚫 Special Characters
- **File separators**: `/` `\`
- **Comparison**: `<` `>`
- **Logic**: `|` `&`
- **Math**: `*` `+` `=` `%` `^`
- **Symbols**: `@` `$` `!` `?` `~` `` ` ``
- **Underscores**: `_`

## 📊 Examples

| Input | Output | Status |
|-------|--------|---------|
| `Test Memory` | `Test Memory` | ✅ Perfect |
| `[001] - Scene` | `[001] - Scene` | ✅ Perfect |
| `René's Story` | `Rens Story` | ⚠️ Accents & apostrophe removed |
| `Сергей` | `Auto Memory` | ❌ All characters removed |
| `先生の話` | `Auto Memory` | ❌ All characters removed |
| `Test/Problem` | `TestProblem` | ⚠️ Slash removed |
| `"Chapter 1"` | `Chapter 1` | ⚠️ Quotes removed |
| `O'Malley & Co.` | `OMalley  Co.` | ⚠️ Apostrophe & ampersand removed |
| `Test_Name` | `TestName` | ⚠️ Underscore removed |
| `😀🎯🧠` | `😀🎯` | ⚠️ Some emoji removed |

## 🛡️ Why These Restrictions?

1. **📁 File System Safety**: Prevents issues with SillyTavern's storage system
2. **💾 JSON Compatibility**: Ensures lorebook metadata parses correctly
3. **🔍 Search Reliability**: Maintains consistent indexing and retrieval
4. **⚡ Performance**: Reduces complexity in database operations

## 🔧 Workarounds

### ✍️ For International Names
Instead of using restricted characters in titles, include the full names in the memory content:

```
Title: "Scene with Sergey"
Content: "In this scene, Сергей (Sergey) discusses..."
```

### 🎨 For Special Characters
Use allowed punctuation as alternatives:

| Instead of | Use |
|------------|-----|
| `René` | `Rene` |
| `O'Malley` | `O-Malley` or `OMalley` |
| `Test/Debug` | `Test-Debug` |
| `"Chapter 1"` | `[Chapter 1]` |

### 🚨 Fallback Behavior
If a title becomes completely empty after cleaning (all characters were blocked), it automatically defaults to `"Auto Memory"` to ensure the lorebook entry is still created.

## 💡 Pro Tips

1. **🎯 Keep titles simple**: Use basic ASCII characters for maximum compatibility
2. **📝 Put details in content**: Memory content has no restrictions - include full international names there
3. **🔤 Use allowed punctuation**: Brackets `[]`, parentheses `()`, and hyphens `-` work great for formatting
4. **📋 Test your templates**: Preview titles before creating memories to see how they'll be cleaned

[Back to README](readme.md)