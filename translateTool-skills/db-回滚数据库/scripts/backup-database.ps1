# backup-database.ps1
# mysqldump translationtool → db/backups/translationtool_YYYYMMDD_HHmmss[_label].sql
#
# LOCKED PATH (MySQL official + Docker Windows):
#   docker exec … mysqldump … --result-file=/tmp/….sql  →  docker cp
# NEVER: PowerShell > / Out-File / Set-Content / Get-Content pipe on dump bytes.
# Ref: https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html (--result-file)
param(
    [string]$ProjectRoot = $env:TRANSLATIONTOOL_ROOT,
    [string]$ContainerName = "translation-mysql",
    [string]$DbUser = "root",
    [string]$DbPassword = "123456",
    [string]$Database = "translationtool",
    [string]$Label = "",
    [switch]$SkipVerify,
    [switch]$SmokeImport
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

# Monthly retention reminder (never deletes)
. (Join-Path $PSScriptRoot "lib\Retention-State.ps1")
$retCheck = Test-RetentionDue -BackupDir $BackupDir
if ($retCheck.due) {
    $null = Show-RetentionReminder -BackupDir $BackupDir
    # Do not advance nextDueAt here — user/prune/snooze scripts do that after human answer
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$suffix = if ($Label) { "_$($Label -replace '[^\w\-]', '_')" } else { "" }
$fileName = "${Database}_${timestamp}${suffix}.sql"
$backupPath = Join-Path $BackupDir $fileName
$remotePath = "/tmp/$fileName"

Write-Host "Backup target: $backupPath"
Write-Host "Container: $ContainerName / DB: $Database"
Write-Host "Method: mysqldump --result-file + docker cp (no PowerShell text pipe)"

# Container writes file; docker cp to host — avoids Windows PowerShell OEM/UTF-16 damage
$dumpCmd = "mysqldump -u$DbUser -p$DbPassword --default-character-set=utf8mb4 --single-transaction --routines --triggers --result-file=$remotePath $Database"
& docker exec $ContainerName sh -c $dumpCmd
if ($LASTEXITCODE -ne 0) {
    throw "mysqldump inside container failed (exit $LASTEXITCODE)"
}

& docker cp "${ContainerName}:${remotePath}" $backupPath
if ($LASTEXITCODE -ne 0 -or -not (Test-Path $backupPath)) {
    throw "docker cp backup failed: $backupPath"
}

& docker exec $ContainerName rm -f $remotePath | Out-Null

$size = (Get-Item $backupPath).Length
if ($size -lt 200) {
    Remove-Item -Force $backupPath -ErrorAction SilentlyContinue
    throw "Backup file too small ($size bytes), dump may have failed; file removed"
}

$verifyOk = $true
$verifyErrors = @()
if (-not $SkipVerify) {
    $verifyScript = Join-Path $PSScriptRoot "verify-dump-encoding.ps1"
    $verifyArgs = @{
        BackupPath    = $backupPath
        ContainerName = $ContainerName
        DbUser        = $DbUser
        DbPassword    = $DbPassword
    }
    if ($SmokeImport) { $verifyArgs.SmokeImport = $true }
    $verifyJson = & $verifyScript @verifyArgs
    $verifyExit = $LASTEXITCODE
    $verifyObj = $null
    try { $verifyObj = $verifyJson | ConvertFrom-Json } catch { }
    if ($verifyExit -ne 0 -or -not $verifyObj -or -not $verifyObj.ok) {
        $verifyOk = $false
        if ($verifyObj -and $verifyObj.errors) { $verifyErrors = @($verifyObj.errors) }
        Remove-Item -Force $backupPath -ErrorAction SilentlyContinue
        throw "Encoding verify FAILED; bad dump removed and .latest NOT updated. Errors: $($verifyErrors -join '; ')"
    }
}

$latestPointer = Join-Path $BackupDir ".latest"
Set-Content -Path $latestPointer -Value $backupPath -Encoding ascii -NoNewline

$result = [ordered]@{
    backupPath     = $backupPath
    fileName       = $fileName
    sizeBytes      = $size
    sizeHuman      = if ($size -ge 1MB) { "{0:N2} MB" -f ($size / 1MB) } else { "{0:N2} KB" -f ($size / 1KB) }
    createdAt      = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    container      = $ContainerName
    database       = $Database
    encodingVerify = $verifyOk
    method         = "result-file+docker-cp"
    retentionDue   = [bool]$retCheck.due
}
$result | ConvertTo-Json -Compress
Write-Host "Backup done: $backupPath ($($result.sizeHuman))"
