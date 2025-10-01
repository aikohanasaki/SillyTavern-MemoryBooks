# Remaining Toastr Message Conversions

## Status Summary

✅ **Completed:**
- index.js: 20 messages converted to `t` template literals
- confirmationPopup.js: 9 messages converted to `t` template literals
- Both files have `import { t } from '../../../i18n.js';` added

✅ **Import Added (ready for conversion):**
- profileManager.js: Import added, needs 16 message conversions

⏳ **Needs Import + Conversion:**
- addlore.js: 4 messages
- utils.js: 5 messages
- autocreate.js: 1 message
- sceneManager.js: 1 message

**Total Remaining: 27 toastr messages across 5 files**

---

## Files Needing Completion

### 1. profileManager.js (16 messages)
**Import:** ✅ Already added

**Lines to convert:**
```javascript
// Line 245
toastr.error('Invalid profile data', 'STMemoryBooks');
→ toastr.error(t`Invalid profile data`, 'STMemoryBooks');

// Line 254
toastr.success('Profile updated successfully', 'STMemoryBooks');
→ toastr.success(t`Profile updated successfully`, 'STMemoryBooks');

// Line 258
toastr.error('Failed to edit profile', 'STMemoryBooks');
→ toastr.error(t`Failed to edit profile`, 'STMemoryBooks');

// Line 324
toastr.error('Invalid profile data', 'STMemoryBooks');
→ toastr.error(t`Invalid profile data`, 'STMemoryBooks');

// Line 333
toastr.success('Profile created successfully', 'STMemoryBooks');
→ toastr.success(t`Profile created successfully`, 'STMemoryBooks');

// Line 337
toastr.error('Failed to create profile', 'STMemoryBooks');
→ toastr.error(t`Failed to create profile`, 'STMemoryBooks');

// Line 349
toastr.error('Cannot delete the last profile', 'STMemoryBooks');
→ toastr.error(t`Cannot delete the last profile`, 'STMemoryBooks');

// Line 357
toastr.error('Cannot delete the "Current SillyTavern Settings" profile - it is required for the extension to work', 'STMemoryBooks');
→ toastr.error(t`Cannot delete the "Current SillyTavern Settings" profile - it is required for the extension to work`, 'STMemoryBooks');

// Line 381
toastr.success('Profile deleted successfully', 'STMemoryBooks');
→ toastr.success(t`Profile deleted successfully`, 'STMemoryBooks');

// Line 385
toastr.error('Failed to delete profile', 'STMemoryBooks');
→ toastr.error(t`Failed to delete profile`, 'STMemoryBooks');

// Line 415
toastr.success('Profiles exported successfully', 'STMemoryBooks');
→ toastr.success(t`Profiles exported successfully`, 'STMemoryBooks');

// Line 418
toastr.error('Failed to export profiles', 'STMemoryBooks');
→ toastr.error(t`Failed to export profiles`, 'STMemoryBooks');

// Line 483
toastr.success(message, 'STMemoryBooks profile import completed');
→ toastr.success(t`${message}`, 'STMemoryBooks profile import completed');

// Line 485
toastr.warning('No new profiles imported - all profiles already exist', 'STMemoryBooks');
→ toastr.warning(t`No new profiles imported - all profiles already exist`, 'STMemoryBooks');

// Line 490
toastr.error(`Failed to import profiles: ${error.message}`, 'STMemoryBooks');
→ toastr.error(t`Failed to import profiles: ${error.message}`, 'STMemoryBooks');

// Line 496
toastr.error('Failed to read import file', 'STMemoryBooks');
→ toastr.error(t`Failed to read import file`, 'STMemoryBooks');
```

### 2. addlore.js (4 messages)
**Import needed:** Add `import { t } from '../../../i18n.js';` after line 1

**Lines to convert:**
```javascript
// Line 138
toastr.success(`Memory "${entryTitle}" added to "${lorebookValidation.name}"`, 'STMemoryBooks');
→ toastr.success(t`Memory "${entryTitle}" added to "${lorebookValidation.name}"`, 'STMemoryBooks');

// Line 156
toastr.warning('Auto-hide skipped: invalid scene range metadata', 'STMemoryBooks');
→ toastr.warning(t`Auto-hide skipped: invalid scene range metadata`, 'STMemoryBooks');

// Line 174
toastr.warning('Auto-hide skipped: invalid scene range metadata', 'STMemoryBooks');
→ toastr.warning(t`Auto-hide skipped: invalid scene range metadata`, 'STMemoryBooks');

// Line 209
toastr.error(`Failed to add memory: ${error.message}`, 'STMemoryBooks');
→ toastr.error(t`Failed to add memory: ${error.message}`, 'STMemoryBooks');
```

### 3. utils.js (5 messages)
**Import needed:** Add `import { t } from '../../../i18n.js';` after line 1

**Lines to convert:**
```javascript
// Line 307
toastr.error(`The designated manual lorebook "${stmbData.manualLorebook}" no longer exists. Please select a new one.`);
→ toastr.error(t`The designated manual lorebook "${stmbData.manualLorebook}" no longer exists. Please select a new one.`);

// Line 316
toastr.error('No lorebooks found to select from.', 'STMemoryBooks');
→ toastr.error(t`No lorebooks found to select from.`, 'STMemoryBooks');

// Line 340
toastr.success(`"${selectedLorebook}" is now the Memory Book for this chat.`, 'STMemoryBooks');
→ toastr.success(t`"${selectedLorebook}" is now the Memory Book for this chat.`, 'STMemoryBooks');

// Line 358
toastr.error('No lorebooks found to select from.', 'STMemoryBooks');
→ toastr.error(t`No lorebooks found to select from.`, 'STMemoryBooks');

// Line 390
toastr.success(`Manual lorebook changed to: ${selectedLorebook}`, 'STMemoryBooks');
→ toastr.success(t`Manual lorebook changed to: ${selectedLorebook}`, 'STMemoryBooks');
```

### 4. autocreate.js (1 message)
**Import needed:** Add `import { t } from '../../../i18n.js';` after line 1

**Lines to convert:**
```javascript
// Line 62
toastr.success(`Created and bound lorebook "${newLorebookName}"`, 'STMemoryBooks');
→ toastr.success(t`Created and bound lorebook "${newLorebookName}"`, 'STMemoryBooks');
```

### 5. sceneManager.js (1 message)
**Import needed:** Add `import { t } from '../../../i18n.js';` after line 1

**Lines to convert:**
```javascript
// Line 401
toastr.warning(toastrMessage, 'STMemoryBooks');
→ toastr.warning(t`${toastrMessage}`, 'STMemoryBooks');
```

---

## After Conversion Complete

### Add Locale Registration to index.js

Add after the imports (around line 20), add:
```javascript
import { addLocaleData } from '../../../i18n.js';
import { localeData } from './locales.js';
```

Then in the `init()` function (around line 2073), add:
```javascript
// Register locale data for i18n support
const currentLocale = localStorage.getItem('language') || 'en';
if (localeData[currentLocale]) {
    addLocaleData(currentLocale, localeData[currentLocale]);
} else if (localeData['en']) {
    addLocaleData(currentLocale, localeData['en']);
}
```

### Add All Toastr Strings to locales.js

All the toastr message strings need to be added to `locales.js`. The key format should be:
- Remove "STMemoryBooks" prefix if present
- Convert to sentence case
- Variables should use `${0}`, `${1}` notation in locale keys

**Note:** Since the `t` template literal automatically generates keys from the English text, you only need to ensure these strings exist in `locales.js` if you want to customize them or prepare for other languages.

---

## Quick Completion Script

If you want to complete all conversions quickly, here's a Node.js script:

```javascript
const fs = require('fs');

const files = [
    {path: 'profileManager.js', hasImport: true},
    {path: 'addlore.js', hasImport: false},
    {path: 'utils.js', hasImport: false},
    {path: 'autocreate.js', hasImport: false},
    {path: 'sceneManager.js', hasImport: false}
];

files.forEach(({path, hasImport}) => {
    let content = fs.readFileSync(path, 'utf8');

    // Add import if needed
    if (!hasImport) {
        content = content.replace(
            /(import.*from.*;\n)/,
            `$1import { t } from '../../../i18n.js';\n`
        );
    }

    // Convert toastr messages with single quotes
    content = content.replace(/toastr\.(error|warning|success|info)\('([^']+)'/g, "toastr.$1(t`$2`");

    // Convert toastr messages with template literals (with variables)
    content = content.replace(/toastr\.(error|warning|success|info)\(`([^`]+)`/g, "toastr.$1(t`$2`");

    fs.writeFileSync(path, content, 'utf8');
    console.log(`✓ Processed ${path}`);
});

console.log('\\nAll files processed!');
```

Save as `convert_toastr.js` and run with `node convert_toastr.js` from the extension directory.
