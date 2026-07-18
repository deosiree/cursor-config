# restore-database.ps1
# Restore translationtool from mysqldump (DROP + CREATE + import)
#
# LOCKED PATH: docker cp into container → mysql --default-character-set=utf8mb4 < file
# NEVER: Get-Content | docker exec mysql  (re-decodes and corrupts UTF-8)
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
    [switch]$SkipVerify,
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
if ($size -lt 200) {
    throw "Backup file too small ($size bytes): $BackupPath"
}

# Refuse --all-databases dumps (would overwrite mysql system schemas locally)
$fsProbe = [System.IO.File]::OpenRead($BackupPath)
try {
    $buf = New-Object byte[] 65536
    $n = $fsProbe.Read($buf, 0, $buf.Length)
    $head = [System.Text.Encoding]::UTF8.GetString($buf, 0, $n)
} finally {
    $fsProbe.Close()
}
if ($head -match "-- Current Database: ``mysql``" -or $head -match "USE ``mysql``;") {
    throw "Refusing restore: dump looks like mysqldump --all-databases. Extract single DB first via extract-database-from-all-dump.ps1 / restore-keep-classifies.ps1."
}

if (-not $SkipVerify) {
    Write-Host "Pre-restore encoding verify..."
    $verifyScript = Join-Path $PSScriptRoot "verify-dump-encoding.ps1"
    & $verifyScript -BackupPath $BackupPath -ContainerName $ContainerName -DbUser $DbUser -DbPassword $DbPassword
    if ($LASTEXITCODE -ne 0) {
        throw "Encoding verify FAILED — refuse restore. Dump is corrupt (do not claim rollback success)."
    }
}

Write-Host "Restore from: $BackupPath ($([math]::Round($size/1MB, 2)) MB)"
Write-Host "Target: $ContainerName / $Database"
Write-Host "WARNING: DROP and recreate entire database"
Write-Host "Method: docker cp + mysql < file (no PowerShell text pipe)"

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
$recreateSql = "DROP DATABASE IF EXISTS ``$Database``; CREATE DATABASE ``$Database`` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
& docker exec $ContainerName mysql "-u$DbUser" "-p$DbPassword" -e $recreateSql
if ($LASTEXITCODE -ne 0) { throw "DROP/CREATE DATABASE failed" }

Write-Host "Importing backup (docker cp + mysql < file)..."
$remoteSql = "/tmp/restore_import.sql"
& docker cp $BackupPath "${ContainerName}:${remoteSql}"
if ($LASTEXITCODE -ne 0) { throw "docker cp import file failed" }
& docker exec $ContainerName sh -c "mysql -u$DbUser -p$DbPassword --default-character-set=utf8mb4 $Database < $remoteSql"
$importExit = $LASTEXITCODE
& docker exec $ContainerName rm -f $remoteSql | Out-Null
if ($importExit -ne 0) { throw "Import backup failed (exit $importExit)" }

Write-Host "Verifying table count..."
$tableCount = & docker exec $ContainerName mysql "-u$DbUser" "-p$DbPassword" -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$Database';"
$tableCount = ($tableCount | Out-String).Trim()

$result = [ordered]@{
    restoredFrom     = $BackupPath
    preRestoreBackup = $preRestorePath
    tableCount       = [int]$tableCount
    container        = $ContainerName
    database         = $Database
    restoredAt       = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    method           = "docker-cp+mysql-file"
}
$result | ConvertTo-Json -Compress
Write-Host "Restore done. Table count: $tableCount"
Write-Host "Tip: restart translationtoolservice / terminology-agent if apps show stale data"
