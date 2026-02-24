<#
PowerShell helper to move frontend files into client/ using git mv.

Run this from the repository root in a Git-enabled environment:

    powershell -ExecutionPolicy Bypass -File .\scripts\move-frontend.ps1

The script attempts to move common frontend files/folders into client/.
#>

$items = @(
    'package.json',
    'index.html',
    'public',
    'src',
    'postcss.config.js',
    'tailwind.config.ts',
    'tsconfig.json',
    'tsconfig.app.json',
    'tsconfig.node.json',
    'vite.config.ts',
    'vitest.config.ts',
    'eslint.config.js',
    'bun.lockb',
    'components.json'
)

if (-not (Test-Path client)) { New-Item -ItemType Directory -Path client | Out-Null }

foreach ($i in $items) {
    if (Test-Path $i) {
        Write-Host "Moving $i -> client/"
        git mv --force $i client/ 2>$null
        if ($LASTEXITCODE -ne 0) { Write-Host "git mv failed for $i - try running the script inside a Git repo or move manually." }
    } else {
        Write-Host "Skipping $i (not found)"
    }
}

Write-Host 'Done. Review git status and commit the moved files when ready.'
