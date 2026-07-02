# restore-database.ps1
# Restore translationtool from mysqldump (DROP + CREATE + import)
param(
    [Parameter(Mandatory = $false)]
    [string]$BackupPath,
    [switch]$UseLatest,
    [string]$ProjectRoot = $env:TRANSLATIONTOOL_ROOT,
    [string]$ContainerName = "translation-mysql",
    [string]$DbUser = "root",
    [string]$DbPassword = "123456",
    [string]$Database = "translationtool",
    [switch]$SkipPreRestoreBackup,
    [switch]$Force
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
    throw "Cannot resolve translationtool ProjectRoot. Set -ProjectRoot"
}

$ProjectRoot = Resolve-ProjectRoot -Root $ProjectRoot
$BackupDir = Join-Path $ProjectRoot "db\backups"

if ($UseLatest -or -not $BackupPath) {
    $latestFile = Join-Path $BackupDir ".latest"
    if (-not (Test-Path $latestFile)) {
        throw "BackupPath not set and .latest missing. Run backup first or use -BackupPath"
    }
    $BackupPath = (Get-Content $latestFile -Raw).Trim()
}

if (-not (Test-Path $BackupPath)) {
    throw "Backup file not found: $BackupPath"
}

$size = (Get-Item $BackupPath).Length
if ($size -lt 1024) {
    throw "Backup file too small ($size bytes): $BackupPath"
}

Write-Host "Restore from: $BackupPath ($([math]::Round($size/1MB, 2)) MB)"
Write-Host "Target: $ContainerName / $Database"
Write-Host "WARNING: DROP and recreate entire database"

if (-not $Force) {
    throw "Missing -Force. Destructive restore requires user confirmation via -Force"
}

$preRestorePath = $null
if (-not $SkipPreRestoreBackup) {
    Write-Host "Pre-restore backup (pre_restore)..."
    $backupScript = Join-Path $PSScriptRoot "backup-database.ps1"
    $preJson = & $backupScript -ProjectRoot $ProjectRoot -ContainerName $ContainerName `
        -DbUser $DbUser -DbPassword $DbPassword -Database $Database -Label "pre_restore"
    $preObj = $preJson | ConvertFrom-Json
    $preRestorePath = $preObj.backupPath
    Write-Host "pre_restore: $preRestorePath"
}

Write-Host "DROP + CREATE DATABASE..."
$recreateSql = @"
DROP DATABASE IF EXISTS ``$Database``;
CREATE DATABASE ``$Database`` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
"@
& docker exec $ContainerName mysql -u$DbUser "-p$DbPassword" -e $recreateSql
if ($LASTEXITCODE -ne 0) { throw "DROP/CREATE DATABASE failed" }

Write-Host "Importing backup..."
Get-Content -Path $BackupPath -Raw -Encoding UTF8 | docker exec -i $ContainerName mysql -u$DbUser "-p$DbPassword" --default-character-set=utf8mb4 $Database
if ($LASTEXITCODE -ne 0) { throw "Import backup failed" }

Write-Host "Verifying table count..."
$tableCount = & docker exec $ContainerName mysql -u$DbUser "-p$DbPassword" -N -e `
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$Database';"
$tableCount = ($tableCount | Out-String).Trim()

$result = [ordered]@{
    restoredFrom     = $BackupPath
    preRestoreBackup = $preRestorePath
    tableCount       = [int]$tableCount
    container        = $ContainerName
    database         = $Database
    restoredAt       = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
}
$result | ConvertTo-Json -Compress
Write-Host "Restore done. Table count: $tableCount"
Write-Host "Tip: restart translationtoolservice / terminology-agent if apps show stale data"
