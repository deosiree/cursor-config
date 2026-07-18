# verify-dump-encoding.ps1
# Fail closed if dump looks corrupted by PowerShell pipe/OEM encoding.
# Checks: UTF-16 BOM, replacement chars, broken COMMENT quotes, optional smoke import.
# Ref: MySQL --result-file; never PowerShell > / Set-Content on mysqldump stdout.
param(
    [Parameter(Mandatory = $true)]
    [string]$BackupPath,
    [switch]$SmokeImport,
    [string]$ContainerName = "translation-mysql",
    [string]$DbUser = "root",
    [string]$DbPassword = "123456",
    [string]$SmokeDatabase = "translationtool_restore_smoke"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupPath)) {
    throw "Backup file not found: $BackupPath"
}

$size = (Get-Item $BackupPath).Length
$errors = New-Object System.Collections.Generic.List[string]

if ($size -lt 200) {
    $errors.Add("file too small ($size bytes)")
}

# Binary BOM / UTF-16 LE signature (FF FE)
$fs = [System.IO.File]::OpenRead($BackupPath)
try {
    $bom = New-Object byte[] 4
    $read = $fs.Read($bom, 0, 4)
    if ($read -ge 2 -and $bom[0] -eq 0xFF -and $bom[1] -eq 0xFE) {
        $errors.Add("UTF-16 LE BOM detected (PowerShell Out-File/redirect corruption)")
    }
    if ($read -ge 3 -and $bom[0] -eq 0xEF -and $bom[1] -eq 0xBB -and $bom[2] -eq 0xBF) {
        # UTF-8 BOM is unusual for mysqldump but not fatal; note only
    }
}
finally {
    $fs.Close()
}

# Sample head as UTF-8 (no throw on invalid — detect replacement / odd patterns)
$sampleBytes = 512KB
if ($size -lt $sampleBytes) { $sampleBytes = [int]$size }
$bytes = New-Object byte[] $sampleBytes
$fs2 = [System.IO.File]::OpenRead($BackupPath)
try {
    [void]$fs2.Read($bytes, 0, $sampleBytes)
}
finally {
    $fs2.Close()
}
$utf8 = [System.Text.Encoding]::UTF8
$sample = $utf8.GetString($bytes)

if ($sample -match [char]0xFFFD) {
    $errors.Add("U+FFFD replacement character in sample (truncated multibyte / bad decode)")
}
# Classic PowerShell corruption: COMMENT ends mid-Chinese with ?
if ($sample -match "COMMENT=['`"][^'`"]*[?]") {
    # Many legitimate English comments end with ? — tighten: Chinese context + ?
    if ($sample -match "COMMENT=['`"][^'`"]*[\u4e00-\u9fff][^'`"]*\?") {
        $errors.Add("COMMENT line looks truncated (CJK + '?') — typical PS pipe damage")
    }
}
# Unbalanced COMMENT quote heuristic on CREATE TABLE snippets
$commentMatches = [regex]::Matches($sample, "COMMENT=('([^']*)'|`"([^`"]*)`")")
foreach ($m in $commentMatches) {
    $inner = if ($m.Groups[2].Success) { $m.Groups[2].Value } else { $m.Groups[3].Value }
    if ($inner -match "[?]$" -and $inner -match "[\u4e00-\u9fff]") {
        $errors.Add("Suspicious COMMENT value ending with '?': $($inner.Substring(0, [Math]::Min(40, $inner.Length)))...")
        break
    }
}

if ($sample -notmatch "mysqldump|CREATE TABLE|Dump completed|-- MySQL") {
    $errors.Add("sample does not look like a mysqldump SQL file")
}

$smokeOk = $null
if ($SmokeImport -and $errors.Count -eq 0) {
    Write-Host "Smoke import into $SmokeDatabase ..."
    $recreate = "DROP DATABASE IF EXISTS ``$SmokeDatabase``; CREATE DATABASE ``$SmokeDatabase`` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    & docker exec $ContainerName mysql "-u$DbUser" "-p$DbPassword" -e $recreate
    if ($LASTEXITCODE -ne 0) {
        $errors.Add("smoke: DROP/CREATE $SmokeDatabase failed")
    }
    else {
        $remote = "/tmp/verify_smoke_import.sql"
        & docker cp $BackupPath "${ContainerName}:${remote}"
        if ($LASTEXITCODE -ne 0) {
            $errors.Add("smoke: docker cp failed")
        }
        else {
            & docker exec $ContainerName sh -c "mysql -u$DbUser -p$DbPassword --default-character-set=utf8mb4 $SmokeDatabase < $remote"
            $imp = $LASTEXITCODE
            & docker exec $ContainerName rm -f $remote | Out-Null
            if ($imp -ne 0) {
                $errors.Add("smoke: mysql import failed (exit $imp) — dump likely corrupt")
                $smokeOk = $false
            }
            else {
                $cnt = & docker exec $ContainerName mysql "-u$DbUser" "-p$DbPassword" -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$SmokeDatabase';"
                $cnt = ($cnt | Out-String).Trim()
                Write-Host "Smoke tables: $cnt"
                $smokeOk = $true
            }
        }
        & docker exec $ContainerName mysql "-u$DbUser" "-p$DbPassword" -e "DROP DATABASE IF EXISTS ``$SmokeDatabase``;" | Out-Null
    }
}

$ok = ($errors.Count -eq 0)
$result = [ordered]@{
    ok          = $ok
    backupPath  = $BackupPath
    sizeBytes   = $size
    smokeImport = [bool]$SmokeImport
    smokeOk     = $smokeOk
    errors      = @($errors)
}
$result | ConvertTo-Json -Compress -Depth 3

if (-not $ok) {
    Write-Host "VERIFY FAIL: $($errors -join '; ')"
    exit 1
}
Write-Host "VERIFY OK: $BackupPath"
exit 0
