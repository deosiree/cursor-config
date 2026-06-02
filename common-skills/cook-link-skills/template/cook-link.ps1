# cook-link.ps1 - generic skill hardlink tool
param(
    [string]$SourceDir = '.cursor',
    [Parameter(Mandatory=$true)][string]$TargetDir,
    [string]$Purpose = 'sync skills between directories',
    [string]$SourceFileGlob = 'SKILL.md',
    [string]$LinkType = 'hardlink',
    [string[]]$ExcludeDirs,
    [int]$MaxDepth = 5,
    [switch]$DryRun,
    [switch]$Force
)
$ErrorActionPreference = 'Stop'
if (-not $ExcludeDirs) { $ExcludeDirs = @('.git','.obsidian','.husky','.vscode','node_modules','assets','template','templates','docs','scripts','evals','references','feature-skills','intention-skills','subskills','_shared','plugins','skills') }
Write-Host "=== cook-link-skills: $SourceDir -> $TargetDir ==="
if (-not (Test-Path $SourceDir)) { Write-Host 'ERROR: source not found'; exit 1 }
if (-not (Test-Path $TargetDir)) { New-Item -ItemType Directory -Path $TargetDir -Force | Out-Null }
Write-Host "Scanning for $SourceFileGlob..."
$found = @{}
Get-ChildItem -Path $SourceDir -Recurse -Filter $SourceFileGlob -Depth $MaxDepth -ErrorAction SilentlyContinue | ForEach-Object {
    $full = $_.FullName
    $rel = $full.Substring($PWD.Path.Length + 1)
    $dirParts = [IO.Path]::GetDirectoryName($rel).Split([IO.Path]::DirectorySeparatorChar)
    $skip = $false
    foreach ($p in $dirParts) { if ($ExcludeDirs -contains $p) { $skip = $true; break } }
    if (-not $skip) { $found[$dirParts[-1]] = $rel }
}
Write-Host "Found $($found.Count) skills"
if ($DryRun) {
    foreach ($name in ($found.Keys | Sort-Object)) {
        $dst = Join-Path $TargetDir ($name + [IO.Path]::GetExtension($found[$name]))
        Write-Host "DRYRUN: $dst <- $($found[$name])"
    }
    Write-Host "(DryRun - $($found.Count) files would be linked)"
    exit 0
}
$created = 0; $skipped = 0; $failed = 0
foreach ($name in ($found.Keys | Sort-Object)) {
    $src = $found[$name]
    $dst = Join-Path $TargetDir ($name + [IO.Path]::GetExtension($src))
    if (-not (Test-Path $src)) { $skipped++; continue }
    if (Test-Path $dst) {
        if (-not $Force) { $skipped++; continue }
        Remove-Item $dst -Force
    }
    try {
        $absSrc = Resolve-Path $src
        if ($LinkType -eq 'hardlink') {
            New-Item -ItemType HardLink -Path $dst -Target $absSrc -Force -ErrorAction Stop | Out-Null
        } elseif ($LinkType -eq 'symlink') {
            New-Item -ItemType SymbolicLink -Path $dst -Target $absSrc -Force -ErrorAction Stop | Out-Null
        } else {
            Copy-Item -Path $absSrc -Destination $dst -Force -ErrorAction Stop
        }
        Write-Host "OK: $name$([IO.Path]::GetExtension($src))"
        $created++
    } catch {
        Write-Host "FAIL: $name - $_"
        $failed++
    }
}
Write-Host "done: created=$created skipped=$skipped failed=$failed"
