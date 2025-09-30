# i18n Replacement Guide for Memory Books

This document contains all the toastr message replacements needed for i18n support.

## Pattern

Replace:
```javascript
toastr.error('Message here', 'STMemoryBooks');
```

With one of these patterns:

1. **Simple message** (no variables):
```javascript
toastr.error(translate('Message here', 'STMemoryBooks_KeyName'), 'STMemoryBooks');
```

2. **Message with variables** (template literal):
```javascript
toastr.error(t`Message with ${variable} here`, 'STMemoryBooks');
```

## Required Imports

Add to each file that uses toastr:
```javascript
import { translate, t } from '../../../i18n.js';
```

## File-by-File Replacements

### index.js
Already partially done. Remaining replacements needed - see code comments.

### confirmationPopup.js
```javascript
// Line 185
toastr.success(`Profile "${newProfileName}" saved successfully`, 'STMemoryBooks');
// Replace with:
toastr.success(t`Profile "${newProfileName}" saved successfully`, 'STMemoryBooks');

// Line 188
toastr.error(`Failed to save profile: ${error.message}`, 'STMemoryBooks');
// Replace with:
toastr.error(t`Failed to save profile: ${error.message}`, 'STMemoryBooks');

// Continue for all toastr calls...
```

### profileManager.js
Add import and wrap all toastr messages.

### utils.js
Add import and wrap all toastr messages.

### addlore.js
Add import and wrap all toastr messages.

### autocreate.js
Add import and wrap all toastr messages.

### sceneManager.js
Add import and wrap all toastr messages.

## Translation Keys in locales.js

All messages will automatically use their English text as the translation key when using `t\`...\`` template literals.
For `translate()` calls, the second parameter is the explicit key.
