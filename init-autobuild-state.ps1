param(
    [Parameter(Mandatory = $false)]
    [string]$ProjectPath = (Get-Location).Path,

    [Parameter(Mandatory = $false)]
    [switch]$Force
)

$ErrorActionPreference = "Stop"

try {
    $resolvedProjectPaths = @(Resolve-Path -LiteralPath $ProjectPath -ErrorAction Stop)
}
catch {
    throw "ProjectPath must identify one existing directory: $ProjectPath"
}

if ($resolvedProjectPaths.Count -ne 1 -or -not (Test-Path -LiteralPath $resolvedProjectPaths[0].Path -PathType Container)) {
    throw "ProjectPath must identify one existing directory: $ProjectPath"
}

$ProjectPath = $resolvedProjectPaths[0].Path
$DocsPath = Join-Path $ProjectPath "docs"
$StateDir = Join-Path $ProjectPath ".codex-loop"
$StatePath = Join-Path $StateDir "state.json"
$GitignorePath = Join-Path $ProjectPath ".gitignore"
$InputsPath = Join-Path $DocsPath "inputs"

New-Item -ItemType Directory -Path $DocsPath -Force | Out-Null
New-Item -ItemType Directory -Path $StateDir -Force | Out-Null

$inputFiles = @()
if (Test-Path -LiteralPath $InputsPath -PathType Container) {
    $inputRoot = Get-Item -LiteralPath $InputsPath -Force
    if (-not ($inputRoot.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
        $directoriesToScan = New-Object 'System.Collections.Generic.Stack[System.IO.DirectoryInfo]'
        $directoriesToScan.Push([IO.DirectoryInfo]$inputRoot)

        while ($directoriesToScan.Count -gt 0) {
            $currentDirectory = $directoriesToScan.Pop()
            foreach ($entry in @(Get-ChildItem -LiteralPath $currentDirectory.FullName -Force -ErrorAction Stop)) {
                if ($entry.Attributes -band [IO.FileAttributes]::ReparsePoint) {
                    continue
                }

                if ($entry.PSIsContainer) {
                    $directoriesToScan.Push([IO.DirectoryInfo]$entry)
                    continue
                }

                if (($entry -is [IO.FileInfo]) -and
                    ($entry.Extension -ieq ".md" -or $entry.Extension -ieq ".txt") -and
                    $entry.Name -ine "README.md") {
                    $inputFiles += $entry
                }
            }
        }
    }
}

$validInputFiles = @()
$utf8Encoding = New-Object System.Text.UTF8Encoding($false, $true)
foreach ($inputFile in $inputFiles) {
    try {
        $inputBytes = [IO.File]::ReadAllBytes($inputFile.FullName)
        if ([Array]::IndexOf($inputBytes, [byte]0) -ge 0) {
            Write-Warning "Unable to read input material; excluding from guidance: $($inputFile.FullName)"
            continue
        }

        $content = $utf8Encoding.GetString($inputBytes)
        if ($content.Length -gt 0 -and [int][char]$content[0] -eq 0xFEFF) {
            $content = $content.Substring(1)
        }
    }
    catch {
        Write-Warning "Unable to read input material; excluding from guidance: $($inputFile.FullName)"
        continue
    }

    if ($null -eq $content) {
        $content = ""
    }

    if ($content -cmatch '<!--\s*CODEX_GUIDANCE_ONLY\s*-->') {
        continue
    }

    $contentWithoutComments = [regex]::Replace($content, '(?s)<!--.*?-->', '')
    $hasMeaningfulInput = $false
    foreach ($line in ($contentWithoutComments -split "`r?`n")) {
        $trimmedLine = $line.Trim()

        if ([string]::IsNullOrWhiteSpace($trimmedLine) -or
            $trimmedLine -match '^#{1,6}(?:\s|$)' -or
            $trimmedLine -match '^>') {
            continue
        }

        $lineWithoutListMarker = $trimmedLine -replace '^(?:[-*+]\s+|\d+[.)]\s+)', ''
        if ($lineWithoutListMarker -match '^\[[^\]\r\n]+\]$' -or
            $lineWithoutListMarker -match '^`[^`\r\n]+`$' -or
            $lineWithoutListMarker -match '^.+\s+(?:\[[^\]\r\n]+\]|`[^`\r\n]+`)$') {
            continue
        }

        $hasMeaningfulInput = $true
        break
    }

    if ($hasMeaningfulInput) {
        $validInputFiles += $inputFile
    }
}

if ($validInputFiles.Count -eq 0) {
    Write-Host "No input materials found."
}
else {
    Write-Host "Input materials detected ($($validInputFiles.Count)):"
    foreach ($inputFile in $validInputFiles) {
        Write-Host "  $($inputFile.FullName)"
    }
}

if ((Test-Path -LiteralPath $StatePath) -and -not $Force) {
    Write-Error "Existing state.json was preserved; specify -Force to reinitialize it: $StatePath"
}

if (-not (Test-Path -LiteralPath $GitignorePath)) {
    New-Item -ItemType File -Path $GitignorePath | Out-Null
}

$gitignore = Get-Content -LiteralPath $GitignorePath -Raw -ErrorAction SilentlyContinue
if ($gitignore -notmatch '(?m)^\.codex-loop/$') {
    Add-Content -LiteralPath $GitignorePath "`r`n# Codex Autobuild runtime state`r`n.codex-loop/"
}

$state = [ordered]@{
    version = 3
    active = $true
    task = "<short task description>"
    phase = "DESIGN"

    required_spec_auditors = 2
    spec_auditors_started = 0
    spec_auditors_completed = 0
    spec_auditors_clear_reports = 0
    spec_clear = $false

    implementers_started = 0
    implementers_completed = 0
    implementation_complete = $false

    validation_passed = $false

    consultations = 0
    max_consultations = 6

    reviewers_started = 0
    reviewers_completed = 0
    review_passed = $false
    last_review_result = $null

    revision_cycles = 0
    max_revision_cycles = 3

    continuations = 0
    max_continuations = 8

    last_blocker = $null
    completed_at = $null
    updated_at = [DateTime]::UtcNow.ToString("o")
}

$state |
    ConvertTo-Json -Depth 10 |
    Set-Content -LiteralPath $StatePath -Encoding UTF8

Write-Host "Autobuild runtime state initialized:"
Write-Host "  $StatePath"
Write-Host ""
Write-Host "Note: leave .codex-loop/ untracked."
