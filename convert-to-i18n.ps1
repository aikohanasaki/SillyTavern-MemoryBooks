# PowerShell script to convert all toastr messages to use i18n t`` template literals
# Run this from the SillyTavern-MemoryBooks directory

$files = @(
    "index.js",
    "confirmationPopup.js",
    "profileManager.js",
    "utils.js",
    "addlore.js",
    "autocreate.js",
    "sceneManager.js"
)

foreach ($file in $files) {
    Write-Host "Processing $file..."

    $content = Get-Content $file -Raw

    # Pattern 1: toastr.xxx('static string', 'STMemoryBooks')
    $content = $content -replace "toastr\.(error|warning|info|success)\('([^']+)',\s*'STMemoryBooks'\)", 'toastr.$1(t`$2`, ''STMemoryBooks'')'

    # Pattern 2: toastr.xxx("static string", 'STMemoryBooks')
    $content = $content -replace 'toastr\.(error|warning|info|success)\("([^"]+)",\s*''STMemoryBooks''\)', 'toastr.$1(t`$2`, ''STMemoryBooks'')'

    # Pattern 3: toastr.xxx(`template ${var} string`, 'STMemoryBooks') - already using template, just add t
    $content = $content -replace 'toastr\.(error|warning|info|success)\(`([^`]+)`,\s*''STMemoryBooks''\)', 'toastr.$1(t`$2`, ''STMemoryBooks'')'

    Set-Content $file $content -NoNewline
    Write-Host "  ✓ Updated $file"
}

Write-Host "`nDone! Now add imports to each file."
