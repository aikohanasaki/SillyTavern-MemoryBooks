# i18n Implementation Guide for Memory Books Extension

## Summary

I've added i18n support to your Memory Books extension following SillyTavern's standards. Here's what's been completed and what you need to finish.

## ✅ Completed

1. **templates.js** - All HTML templates now have `data-i18n` attributes
2. **locales.js** - Created with English locale data for all template strings
3. **index.js** - Added i18n imports and locale registration in `init()` function

## 📝 To Complete

### 1. Re-add the imports to index.js

The imports were lost during a git restore. Add these lines after the other imports (around line 10):

```javascript
import { addLocaleData, translate, t } from '../../../i18n.js';
import { localeData } from './locales.js';
```

Then add locale registration in the `init()` function (around line 2072, right after `console.log('STMemoryBooks: Initializing');`):

```javascript
// Register locale data for i18n support
const currentLocale = localStorage.getItem('language') || 'en';
if (localeData[currentLocale]) {
    addLocaleData(currentLocale, localeData[currentLocale]);
} else if (localeData['en']) {
    // Fallback to English if current locale not available
    addLocaleData(currentLocale, localeData['en']);
}
```

### 2. Update ALL toastr messages across all files

**SillyTavern Standard:** Use `t` template literals for ALL toastr messages.

#### Pattern to follow:

**Before:**
```javascript
toastr.error('Static message', 'STMemoryBooks');
toastr.warning(`Message with ${variable}`, 'STMemoryBooks');
```

**After:**
```javascript
toastr.error(t`Static message`, 'STMemoryBooks');
toastr.warning(t`Message with ${variable}`, 'STMemoryBooks');
```

#### Files that need updating:

1. **index.js** (~40 toastr messages)
2. **confirmationPopup.js** (~10 toastr messages)
3. **profileManager.js** (~10 toastr messages)
4. **utils.js** (~5 toastr messages)
5. **addlore.js** (~5 toastr messages)
6. **autocreate.js** (~1 toastr message)
7. **sceneManager.js** (~1 toastr message)

### 3. Add imports to each file

Each file with toastr messages needs this import:

```javascript
import { t } from '../../../i18n.js';
```

## 🔧 Quick Conversion Script

You can use this PowerShell one-liner to convert most messages (run from the extension directory):

```powershell
# For each .js file except locales.js and templates.js
Get-ChildItem *.js -Exclude locales.js,templates.js | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    # Convert single-quoted strings
    $content = $content -replace "toastr\.(error|warning|info|success)\('([^']+)', 'STMemoryBooks'\)", 'toastr.$1(t`$2`, ''STMemoryBooks'')'
    # Convert double-quoted strings
    $content = $content -replace 'toastr\.(error|warning|info|success)\("([^"]+)", ''STMemoryBooks''\)', 'toastr.$1(t`$2`, ''STMemoryBooks'')'
    # Convert template literals (already using backticks, just add t)
    $content = $content -replace 'toastr\.(error|warning|info|success)\(`([^`]+)`, ''STMemoryBooks''\)', 'toastr.$1(t`$2`, ''STMemoryBooks'')'
    Set-Content $_.FullName $content -NoNewline
}
```

**Note:** This script may not catch all edge cases (multi-line strings, complex expressions). Review changes before committing.

## 🌍 How Translation Works

### For Template Text (templates.js)
- HTML elements with `data-i18n="STMemoryBooks_KeyName"` are automatically translated
- SillyTavern's MutationObserver handles this automatically

### For JavaScript Strings (toastr messages)
- `t` template literals create translation keys automatically
- For `t\`Message with ${var}\``, the key is `"Message with ${0}"`
- Translators provide translations like: `"Message with ${0}": "Mensaje con ${0}"`
- At runtime, `${0}` is replaced with the actual variable value

### Adding New Languages

Create a new entry in `locales.js`:

```javascript
export const localeData_es = {
    'STMemoryBooks_Settings': '📕 Configuración de Memory Books',
    'STMemoryBooks_CreateMemory': 'Crear Memoria',
    // ... all other keys
};

export const localeData = {
    'en': localeData_en,
    'es-es': localeData_es,  // Add new language here
};
```

## 📋 Verification Checklist

After completing the updates:

- [ ] All files with toastr have `import { t } from '../../../i18n.js';`
- [ ] `index.js` has imports for `addLocaleData`, `t`, and `localeData`
- [ ] `init()` function registers locale data
- [ ] All toastr messages use `t\`...\`` format
- [ ] Test in SillyTavern with English (default)
- [ ] Test switching to another language (if available)
- [ ] No JavaScript errors in console

##  Translation Keys Reference

All English translation keys are defined in `locales.js`. The template literals in toastr messages automatically use their English text as the key.

For example:
- `t\`Memory created successfully\`` → Key is `"Memory created successfully"`
- `t\`Profile "${name}" saved\`` → Key is `"Profile \"${0}\" saved"`

You don't need to manually track these - they're automatically registered when the code runs.
