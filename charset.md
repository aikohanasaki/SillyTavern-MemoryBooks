[Back to README](readme.md)

## Character Restrictions in Metadata Fields

STMemoryBooks supports **international characters, accents, emoji, and most punctuation** in all metadata fields (character names, user names, extracted titles, etc.). Only genuinely problematic characters are removed to ensure compatibility with SillyTavern's lorebook system.

**Character restrictions apply to:**
- Character names (`{{char}}`)
- User names (`{{user}}`)
- AI-extracted titles (`{{title}}`)
- Any text used in title templates
- Final lorebook entry titles/comments

**NO character restrictions apply to:**
- Memory content (completely freeform)
- AI-generated text (before title extraction)
- Original chat message content

## Blocked Characters

The following characters are automatically removed from titles to prevent system issues:

#### Control Characters
- **Newlines, tabs, and spacing**: `\n` `\r` `\t` and other whitespace control characters
- **Null bytes and control codes**: All characters from `\x00` to `\x1F` (NULL, SOH, STX, etc.)
- **Extended control characters**: `\x7F` to `\x9F` (DEL and C1 control block)

#### File System Unsafe Characters
These characters can cause issues with file systems and JSON storage:
- `/` (forward slash)
- `\` (backslash) 
- `<` (less than)
- `>` (greater than)
- `|` (pipe)
- `"` (double quote)
- `*` (asterisk)
- `?` (question mark)
- `:` (colon)

## ✅ Supported Characters

**All of these work perfectly:**
- **International scripts**: Cyrillic (Сергей), Chinese (先生, 沈星回), Japanese, Arabic (العربية), Hindi (हिंदी), etc.
- **Accented characters**: René, François, Émilie, José, etc.
- **Common punctuation**: `'` `&` `!` `@` `#` `$` `%` `^` `_` `+` `=` `[` `]` `{` `}` `;` `,` `.` `-` `(` `)`
- **All emoji**: 👤🧠🎯🎪🎨 and any standard emoji
- **Brackets and symbols**: `[Redacted]` `Agent R.` `Anon (S)` `O'Malley`

### Examples

**Metadata fields (character restrictions apply):**
| Input | Output | Status |
|-------|--------|---------|
| Character: `Сергей` | `Сергей` | ✅ Unchanged |
| User: `先生` | `先生` | ✅ Unchanged |
| Title: `René's Story` | `René's Story` | ✅ Unchanged |
| Character: `O'Malley` | `O'Malley` | ✅ Unchanged |
| Character: `Agent "R"` | `Agent R` | ⚠️ Quotes removed |
| Title: `Path/Problem` | `PathProblem` | ⚠️ Slashes removed |

**Memory content (NO restrictions):**
```
✅ All of this is preserved exactly as-is in memory content:
- Control characters: "Line 1\nLine 2\tTabbed"
- File paths: "C:\Users\Name\file.txt" 
- Special chars: <test> "quotes" |pipes| *asterisks*
- International: 这是中文 العربية Русский
- Everything: The AI can write anything in the actual memory!
```

## Why These Restrictions?

- **Control characters** can break JSON parsing and lorebook metadata display
- **File system unsafe characters** can cause issues with SillyTavern's storage system
- **Restrictions only apply to metadata fields** - memory content itself is completely unrestricted
- **Everything else is preserved** to support international users and creative character names

### Fallback Behavior

If a title becomes empty after cleaning (e.g., only contained blocked characters), it defaults to `"Auto Memory"` to ensure the lorebook entry is still created successfully.

[Back to README](readme.md)