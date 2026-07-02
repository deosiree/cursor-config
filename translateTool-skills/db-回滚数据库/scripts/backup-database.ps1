# backup-database.ps1
# mysqldump translationtool → db/backups/translationtool_YYYYMMDD_HHmmss[_label].sql
param(
    [string]$ProjectRoot = $env:TRANSLATIONTOOL_ROOT,
    [string]$ContainerName = "translation-mysql",
    [string]$DbUser = "root",
    [string]$DbPassword = "123456",
    [string]$Database = "translationtool",
    [string]$Label = ""
)

$ErrorActionPreference = "Stop"

function Resolve-ProjectRoot {
    param([string]$Root)
    if ($Root -and (Test-Path $Root)) { return (Resolve-Path $Root).Path }
    $candidates = @(
        "F:\Documents\Repertory\Sieyuan\translationtool",
        (Join-Path $PSScriptRoot "..\..\..\..\..\Repertory\Sieyuan\translationtool"),
        (Join-Path (Get-Location) "translationtool"),
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
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$suffix = if ($Label) { "_$($Label -replace '[^\w\-]', '_')" } else { "" }
$fileName = "${Database}_${timestamp}${suffix}.sql"
$backupPath = Join-Path $BackupDir $fileName

Write-Host "Backup target: $backupPath"
Write-Host "Container: $ContainerName / DB: $Database"

$dumpArgs = @(
    "exec", $ContainerName,
    "mysqldump",
    "-u$DbUser", "-p$DbPassword",
    "--default-character-set=utf8mb4",
    "--single-transaction",
    "--routines",
    "--triggers",
    $Database
)

& docker @dumpArgs | Set-Content -Path $backupPath -Encoding UTF8

if (-not (Test-Path $backupPath)) {
    throw "Backup file not created: $backupPath"
}
$size = (Get-Item $backupPath).Length
if ($size -lt 1024) {
    throw "Backup file too small ($size bytes), dump may have failed"
}

$latestPointer = Join-Path $BackupDir ".latest"
Set-Content -Path $latestPointer -Value $backupPath -Encoding UTF8 -NoNewline

$result = [ordered]@{
    backupPath  = $backupPath
    fileName    = $fileName
    sizeBytes   = $size
    sizeHuman   = if ($size -ge 1MB) { "{0:N2} MB" -f ($size / 1MB) } else { "{0:N2} KB" -f ($size / 1KB) }
    createdAt   = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    container   = $ContainerName
    database    = $Database
}
$result | ConvertTo-Json -Compress
Write-Host "Backup done: $backupPath ($($result.sizeHuman))"
