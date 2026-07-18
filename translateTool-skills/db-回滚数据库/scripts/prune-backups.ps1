# prune-backups.ps1
# Delete selected backup .sql files ONLY with -ConfirmDelete after human approval.
# Never run automatically. Preserves .gitkeep / README / state files.
param(
    [string]$ProjectRoot = $env:TRANSLATIONTOOL_ROOT,
    [int]$OlderThanDays = 0,
    [switch]$AllSql,
    [string[]]$Paths = @(),
    [switch]$ConfirmDelete,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Resolve-ProjectRoot {
    param([string]$Root)
    if ($Root -and (Test-Path $Root)) { return (Resolve-Path $Root).Path }
    $candidates = @(
        "F:\Documents\Repertory\Sieyuan\translationtool",
        (Join-Path $PSScriptRoot "..\..\..\..\..\Repertory\Sieyuan\translationtool"),
        (Get-Location).Path
    )
    foreach ($c in $candidates) {
        if ($c -and (Test-Path (Join-Path $c "docker-compose.yml"))) {
            return (Resolve-Path $c).Path
        }
    }
    throw "Cannot resolve translationtool ProjectRoot"
}

. (Join-Path $PSScriptRoot "lib\Retention-State.ps1")

$ProjectRoot = Resolve-ProjectRoot -Root $ProjectRoot
$BackupDir = Join-Path $ProjectRoot "db\backups"

$candidates = New-Object System.Collections.Generic.List[string]
if ($Paths -and $Paths.Count -gt 0) {
    foreach ($p in $Paths) {
        if (Test-Path $p) { $candidates.Add((Resolve-Path $p).Path) }
    }
}
elseif ($AllSql) {
    Get-ChildItem -Path $BackupDir -Filter "*.sql" -File | ForEach-Object { $candidates.Add($_.FullName) }
}
elseif ($OlderThanDays -gt 0) {
    $cutoff = (Get-Date).AddDays(-$OlderThanDays)
    Get-ChildItem -Path $BackupDir -Filter "*.sql" -File |
        Where-Object { $_.LastWriteTime -lt $cutoff } |
        ForEach-Object { $candidates.Add($_.FullName) }
}
else {
    throw "Specify -OlderThanDays N, -AllSql, or -Paths. Refusing to guess."
}

Write-Host "Prune candidates ($($candidates.Count)):"
$candidates | ForEach-Object { Write-Host "  $_" }

if ($DryRun -or -not $ConfirmDelete) {
    Write-Host "Dry-run / no -ConfirmDelete — nothing deleted."
    @{
        dryRun    = $true
        deleted   = @()
        candidates = @($candidates)
    } | ConvertTo-Json -Compress -Depth 3
    exit 0
}

$deleted = New-Object System.Collections.Generic.List[string]
foreach ($p in $candidates) {
    if ((Split-Path $p -Parent) -ne $BackupDir -and -not $p.StartsWith($BackupDir)) {
        Write-Host "SKIP (outside backup dir): $p"
        continue
    }
    Remove-Item -Force $p
    $deleted.Add($p)
    Write-Host "Deleted: $p"
}

# Clear .latest if it pointed at a deleted file
$latestFile = Join-Path $BackupDir ".latest"
if (Test-Path $latestFile) {
    $latest = (Get-Content $latestFile -Raw).Trim()
    if ($deleted -contains $latest) {
        Remove-Item -Force $latestFile
        Write-Host "Cleared .latest (pointed at deleted file)"
    }
}

$state = Get-RetentionState -BackupDir $BackupDir
$state.lastRemindedAt = (Get-Date).ToString("o")
$state.nextDueAt = (Get-Date).AddDays(30).ToString("o")
Save-RetentionState -BackupDir $BackupDir -State $state

@{
    dryRun   = $false
    deleted  = @($deleted)
    nextDueAt = $state.nextDueAt
} | ConvertTo-Json -Compress -Depth 3
Write-Host "Prune done. nextDueAt=$($state.nextDueAt)"
