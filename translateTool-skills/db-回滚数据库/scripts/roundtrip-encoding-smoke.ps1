# roundtrip-encoding-smoke.ps1
# Acceptance: good path backup→verify→restore keeps Chinese; bad PS-pipe sample must FAIL verify.
param(
    [string]$ProjectRoot = $env:TRANSLATIONTOOL_ROOT,
    [string]$ContainerName = "translation-mysql",
    [string]$DbUser = "root",
    [string]$DbPassword = "123456",
    [string]$SmokeDb = "translationtool_enc_smoke"
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

$ProjectRoot = Resolve-ProjectRoot -Root $ProjectRoot
$BackupDir = Join-Path $ProjectRoot "db\backups"
if (-not (Test-Path $BackupDir)) { New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null }

$verify = Join-Path $PSScriptRoot "verify-dump-encoding.ps1"
$backup = Join-Path $PSScriptRoot "backup-database.ps1"
$restore = Join-Path $PSScriptRoot "restore-database.ps1"

Write-Host "=== 1. Seed smoke DB with Chinese COMMENT ==="
# Build seed as UTF-8 bytes (avoid .ps1 source encoding pitfalls on Windows)
$seed = @"
DROP DATABASE IF EXISTS ``$SmokeDb``;
CREATE DATABASE ``$SmokeDb`` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ``$SmokeDb``;
CREATE TABLE t_authority (
  id INT PRIMARY KEY,
  name VARCHAR(64) NOT NULL COMMENT 'COL_COMMENT_PLACEHOLDER'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='TBL_COMMENT_PLACEHOLDER';
INSERT INTO t_authority (id, name) VALUES (1, 'ROW_VALUE_PLACEHOLDER');
"@
$colComment = [System.Text.Encoding]::UTF8.GetString([byte[]](0xE6,0x9D,0x83,0xE9,0x99,0x90,0xE5,0x90,0x8D,0xE7,0xA7,0xB0)) # 权限名称
$tblComment = [System.Text.Encoding]::UTF8.GetString([byte[]](0xE6,0x9D,0x83,0xE9,0x99,0x90,0xE8,0xA1,0xA8)) # 权限表
$rowValue = [System.Text.Encoding]::UTF8.GetString([byte[]](0xE7,0xB3,0xBB,0xE7,0xBB,0x9F,0xE7,0xAE,0xA1,0xE7,0x90,0x86)) # 系统管理
$seed = $seed.Replace("COL_COMMENT_PLACEHOLDER", $colComment).Replace("TBL_COMMENT_PLACEHOLDER", $tblComment).Replace("ROW_VALUE_PLACEHOLDER", $rowValue)
$seedHost = Join-Path $env:TEMP "enc_smoke_seed.sql"
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($seedHost, $seed, $utf8NoBom)
& docker cp $seedHost "${ContainerName}:/tmp/enc_smoke_seed.sql"
& docker exec $ContainerName sh -c "mysql -u$DbUser -p$DbPassword --default-character-set=utf8mb4 < /tmp/enc_smoke_seed.sql"
if ($LASTEXITCODE -ne 0) { throw "seed failed" }

Write-Host "=== 2. Good backup (result-file + docker cp) ==="
$bakJson = & $backup -ProjectRoot $ProjectRoot -ContainerName $ContainerName `
    -DbUser $DbUser -DbPassword $DbPassword -Database $SmokeDb -Label "enc_roundtrip"
$bakObj = $bakJson | ConvertFrom-Json
$goodPath = $bakObj.backupPath
Write-Host "Good dump: $goodPath"

Write-Host "=== 3. Verify good dump (with smoke import) ==="
& $verify -BackupPath $goodPath -SmokeImport -ContainerName $ContainerName -DbUser $DbUser -DbPassword $DbPassword
if ($LASTEXITCODE -ne 0) { throw "good dump verify failed" }

Write-Host "=== 4. Restore roundtrip into smoke DB ==="
& $restore -ProjectRoot $ProjectRoot -BackupPath $goodPath -ContainerName $ContainerName `
    -DbUser $DbUser -DbPassword $DbPassword -Database $SmokeDb -Force -SkipPreRestoreBackup
if ($LASTEXITCODE -ne 0) { throw "restore failed" }

# HEX checks avoid PowerShell console / .ps1 literal encoding issues
$nameHex = (& docker exec $ContainerName mysql "-u$DbUser" "-p$DbPassword" -N --default-character-set=utf8mb4 `
    -e "SELECT HEX(name) FROM ``$SmokeDb``.t_authority WHERE id=1;").ToString().Trim()
$tblHex = (& docker exec $ContainerName mysql "-u$DbUser" "-p$DbPassword" -N --default-character-set=utf8mb4 `
    -e "SELECT HEX(TABLE_COMMENT) FROM information_schema.TABLES WHERE TABLE_SCHEMA='$SmokeDb' AND TABLE_NAME='t_authority';").ToString().Trim()
Write-Host "HEX name=$nameHex TABLE_COMMENT=$tblHex"
if ($nameHex -ne "E7B3BBE7BB9FE7AEA1E79086") { throw "Chinese data lost after roundtrip (name HEX=$nameHex)" }
if ($tblHex -ne "E69D83E99990E8A1A8") { throw "Chinese TABLE_COMMENT lost after roundtrip (HEX=$tblHex)" }
# Dump file must contain UTF-8 sequences (not console-decoded)
$dumpBytes = [System.IO.File]::ReadAllBytes($goodPath)
$nameBytes = [byte[]](0xE7,0xB3,0xBB,0xE7,0xBB,0x9F,0xE7,0xAE,0xA1,0xE7,0x90,0x86)
$permBytes = [byte[]](0xE6,0x9D,0x83,0xE9,0x99,0x90)
function IndexOfBytes([byte[]]$hay, [byte[]]$needle) {
    for ($i = 0; $i -le $hay.Length - $needle.Length; $i++) {
        $ok = $true
        for ($j = 0; $j -lt $needle.Length; $j++) { if ($hay[$i + $j] -ne $needle[$j]) { $ok = $false; break } }
        if ($ok) { return $i }
    }
    return -1
}
if ((IndexOfBytes $dumpBytes $nameBytes) -lt 0) { throw "dump file missing UTF-8 name bytes" }
if ((IndexOfBytes $dumpBytes $permBytes) -lt 0) { throw "dump file missing UTF-8 权限 bytes" }

Write-Host "=== 5. Craft bad PS-pipe sample (must FAIL verify) ==="
$badPath = Join-Path $BackupDir "BAD_pipe_encoding_sample.sql"
# UTF-16 LE with BOM (classic Out-File damage) + truncated CJK COMMENT pattern in UTF-8 body would also fail;
# BOM alone is enough for verify to reject.
$badUtf8 = "-- MySQL dump simulated bad PowerShell pipe`nCREATE TABLE t_bad (id int COMMENT='X');`n"
[System.IO.File]::WriteAllText($badPath, $badUtf8, [System.Text.Encoding]::Unicode)

& $verify -BackupPath $badPath
$badExit = $LASTEXITCODE
if ($badExit -eq 0) {
    Remove-Item -Force $badPath -ErrorAction SilentlyContinue
    throw "BAD sample unexpectedly PASSED verify"
}
Write-Host "Bad sample correctly FAILED verify (exit $badExit)"
Remove-Item -Force $badPath -ErrorAction SilentlyContinue

Write-Host "=== 6. Cleanup smoke DB ==="
& docker exec $ContainerName mysql "-u$DbUser" "-p$DbPassword" -e "DROP DATABASE IF EXISTS ``$SmokeDb``;" | Out-Null
# Remove smoke backup file to avoid clutter (optional keep for debug — delete)
if (Test-Path $goodPath) {
    Remove-Item -Force $goodPath
    Write-Host "Removed smoke backup: $goodPath"
}

@{
    ok              = $true
    chineseRoundtrip = $true
    badSampleFailed  = $true
} | ConvertTo-Json -Compress
Write-Host "ROUNDTRIP SMOKE PASSED"
