# list-backups.ps1
# 列出 db/backups/ 下 .sql 备份（时间、大小），并解析 .latest
param(
    [string]$ProjectRoot = $env:TRANSLATIONTOOL_ROOT
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
    throw "Cannot resolve translationtool ProjectRoot. Set -ProjectRoot or TRANSLATIONTOOL_ROOT"
}

$ProjectRoot = Resolve-ProjectRoot -Root $ProjectRoot
$BackupDir = Join-Path $ProjectRoot "db\backups"
if (-not (Test-Path $BackupDir)) {
    Write-Host "Backup dir not found: $BackupDir"
    @() | ConvertTo-Json
    exit 0
}

$latestPath = $null
$latestFile = Join-Path $BackupDir ".latest"
if (Test-Path $latestFile) {
    $latestPath = (Get-Content $latestFile -Raw).Trim()
}

$files = Get-ChildItem -Path $BackupDir -Filter "*.sql" -File | Sort-Object LastWriteTime -Descending
$list = foreach ($f in $files) {
    [ordered]@{
        fileName   = $f.Name
        fullPath   = $f.FullName
        sizeBytes  = $f.Length
        sizeHuman  = if ($f.Length -ge 1MB) { "{0:N2} MB" -f ($f.Length / 1MB) } else { "{0:N2} KB" -f ($f.Length / 1KB) }
        modifiedAt = $f.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")
        isLatest   = ($latestPath -and ($f.FullName -eq $latestPath))
    }
}

. (Join-Path $PSScriptRoot "lib\Retention-State.ps1")
$retCheck = Test-RetentionDue -BackupDir $BackupDir
$retentionReminder = $null
if ($retCheck.due) {
    $retentionReminder = Show-RetentionReminder -BackupDir $BackupDir
}

$output = [ordered]@{
    backupDir          = $BackupDir
    latestPath         = $latestPath
    count              = $list.Count
    backups            = @($list)
    retentionDue       = [bool]$retCheck.due
    retentionNextDueAt = $retCheck.state.nextDueAt
    retentionReminder  = $retentionReminder
}
$output | ConvertTo-Json -Depth 5 -Compress

Write-Host "Backup count: $($list.Count)"
if ($latestPath) { Write-Host "Latest (.latest): $latestPath" }
if ($retCheck.due) {
    Write-Host "Retention reminder DUE — ask user before prune-backups.ps1 -ConfirmDelete"
}
