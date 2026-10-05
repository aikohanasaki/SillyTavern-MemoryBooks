# Project Directives

- Prioritize correctness and data fidelity. 
- Bugfix code edits should try to be as surgical as possible with the least effect on adjacent code or non-pipeline imports/exports.
- If a better solution exists but requires more code change, you should propose it. Always present the pros and cons of your proposals. 
- After code edits, do a line-by-line code walk through affected/touched functions as well as imports/exports to ensure no unintended semantic regressions.
- Always ignore all en*.json files.
- ignore edits to changelog.md and manifest.json unless you are specifically requested to review them.
- Before finishing, add any new localization keys to locales/*.json (except ignored files) and ensure translation is done.

# Style Guide

- Strongly prefer reusing existing functions and CSS styles (including from ST base) whenever possible.
- Translations must use consistent translated vocabulary for key phrases such as "Memory Books", "lorebook", "side prompt", etc. Always review and locate the important phrases as translated elsewhere in the locales/*.json file in order to identify translation for the key phrases. 

# Documentation

- Documentation has been consolidated into `userguides\'1 Memory_Books_AI_Reference_Manual.md'` and this is the sole technical manual to be updated going forward. 

# READ-ONLY References

- SillyTavern base/upstream: "D:\ST\SillyTavern"
- Aikobots v2: "C:\Users\alcho\Aikobots Code\Aikobots"
- SillyTavern-LorebookOrdering (STLO): "C:\Users\alcho\Aikobots Code\SillyTavern-LorebookOrdering"