# restore-keep-classifies.ps1
# From server/all-DB or single-DB dump: import to temp → keep named classify subtrees + closure → replace local DB.
#
# LOCKED:
#   - Never import --all-databases whole file into local MySQL (extract first)
#   - Never PowerShell pipe mysqldump / mysql bytes
#   - Classify name miss → abort (no half restore)
param(
    [Parameter(Mandatory = $true)][string]$DumpPath,
    [string]$ProjectRoot = $env:TRANSLATIONTOOL_ROOT,
    [string]$ContainerName = "translation-mysql",
    [string]$DbUser = "root",
    [string]$DbPassword = "123456",
    [string]$TargetDatabase = "translationtool",
    [string]$TempDatabase = "translationtool_import_full",
    [string]$Department = "通用平台部",
    [string[]]$ClassifyNames = @("mon-cn-1.9.0", "develop"),
    [switch]$SkipPreBackup,
    [switch]$SkipVerify,
    [switch]$SkipExtract,
    [switch]$SkipImport,
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
    throw "Cannot resolve ProjectRoot"
}

function Test-AllDatabasesDump {
    param([string]$Path)
    # Read first 64KB as bytes; look for mysql system DB marker
    $fs = [System.IO.File]::OpenRead($Path)
    try {
        $buf = New-Object byte[] 65536
        $n = $fs.Read($buf, 0, $buf.Length)
        $text = [System.Text.Encoding]::UTF8.GetString($buf, 0, $n)
    } finally {
        $fs.Close()
    }
    if ($text -match "-- Current Database: ``mysql``" -or $text -match "USE ``mysql``;") {
        return $true
    }
    # multiple Current Database markers in head strongly suggests all-databases
    $matches = [regex]::Matches($text, "-- Current Database: ``")
    return ($matches.Count -ge 2)
}

if (-not (Test-Path $DumpPath)) { throw "Dump not found: $DumpPath" }
if (-not $Force) {
    throw "Missing -Force. Destructive keep-classify restore requires confirmation."
}

$ProjectRoot = Resolve-ProjectRoot -Root $ProjectRoot
$DumpPath = (Resolve-Path $DumpPath).Path
$namesJoined = ($ClassifyNames -join ",")
$workDump = $DumpPath

Write-Host "=== restore-keep-classifies ==="
Write-Host "Dump: $DumpPath"
Write-Host "Department: $Department"
Write-Host "ClassifyNames: $namesJoined"
Write-Host "TempDB: $TempDatabase → Target: $TargetDatabase"

if (-not $SkipVerify) {
    Write-Host "Encoding verify..."
    & (Join-Path $PSScriptRoot "verify-dump-encoding.ps1") -BackupPath $DumpPath `
        -ContainerName $ContainerName -DbUser $DbUser -DbPassword $DbPassword
    if ($LASTEXITCODE -ne 0) {
        throw "Encoding verify FAILED — refuse keep-classify restore"
    }
}

$isAllDb = Test-AllDatabasesDump -Path $DumpPath
if ($isAllDb) {
    if ($SkipExtract) {
        throw "Dump looks like --all-databases; refuse direct import. Remove -SkipExtract or pass extracted single-DB sql."
    }
    Write-Host "Detected --all-databases dump; extracting $TargetDatabase section..."
    $extractOut = Join-Path $ProjectRoot ("db\backups\extracted_{0}_{1}.sql" -f $TargetDatabase, (Get-Date -Format "yyyyMMdd_HHmmss"))
    & (Join-Path $PSScriptRoot "extract-database-from-all-dump.ps1") `
        -DumpPath $DumpPath -Database $TargetDatabase -OutPath $extractOut -ProjectRoot $ProjectRoot
    if ($LASTEXITCODE -ne 0) { throw "extract failed" }
    $workDump = $extractOut
    Write-Host "Using extracted: $workDump"
} elseif (-not $SkipExtract) {
    Write-Host "Dump appears single-database; using as-is."
}

$preBackupPath = $null
if (-not $SkipPreBackup) {
    Write-Host "Pre-keep backup of local $TargetDatabase..."
    $preJson = & (Join-Path $PSScriptRoot "backup-database.ps1") -ProjectRoot $ProjectRoot `
        -ContainerName $ContainerName -DbUser $DbUser -DbPassword $DbPassword `
        -Database $TargetDatabase -Label "pre_keep_classify"
    $preObj = $preJson | ConvertFrom-Json
    $preBackupPath = $preObj.backupPath
    Write-Host "pre_keep_classify: $preBackupPath"
}

if (-not $SkipImport) {
    Write-Host "Rewrite dump DB markers $TargetDatabase → $TempDatabase (avoid USE overwriting local target)..."
    $importDump = Join-Path $ProjectRoot ("db\backups\import_{0}_{1}.sql" -f $TempDatabase, (Get-Date -Format "yyyyMMdd_HHmmss"))
    $rewritePy = Join-Path $PSScriptRoot "lib\rewrite_dump_database.py"
    $rewriteJson = python $rewritePy $workDump $importDump $TargetDatabase $TempDatabase
    if ($LASTEXITCODE -ne 0) { throw "rewrite dump database name failed" }
    Write-Host $rewriteJson

    Write-Host "DROP/CREATE temp database $TempDatabase ..."
    $recreate = "DROP DATABASE IF EXISTS ``$TempDatabase``; CREATE DATABASE ``$TempDatabase`` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    & docker exec $ContainerName mysql "-u$DbUser" "-p$DbPassword" -e $recreate
    if ($LASTEXITCODE -ne 0) { throw "temp DROP/CREATE failed" }

    Write-Host "Import into temp (docker cp + mysql < file) — this may take several minutes..."
    $remoteSql = "/tmp/keep_classify_import.sql"
    & docker cp $importDump "${ContainerName}:${remoteSql}"
    if ($LASTEXITCODE -ne 0) { throw "docker cp failed" }
    & docker exec $ContainerName sh -c "mysql -u$DbUser -p$DbPassword --default-character-set=utf8mb4 $TempDatabase < $remoteSql"
    $importExit = $LASTEXITCODE
    & docker exec $ContainerName rm -f $remoteSql | Out-Null
    if ($importExit -ne 0) { throw "Temp import failed (exit $importExit)" }
} else {
    Write-Host "SkipImport: reusing existing temp database $TempDatabase"
    $exists = & docker exec $ContainerName mysql "-u$DbUser" "-p$DbPassword" -N -e "SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name='$TempDatabase';"
    if (($exists | Out-String).Trim() -ne "1") {
        throw "SkipImport requested but temp DB missing: $TempDatabase"
    }
}

# Department may be corrupted by console code page; pass "-" to use UTF-8 default in Python.
$deptArg = if ([string]::IsNullOrWhiteSpace($Department)) { "-" } else { $Department }
$py = Join-Path $PSScriptRoot "lib\keep_classify_ops.py"

Write-Host "Inspect before keep..."
$beforeJson = python $py inspect $ContainerName $DbUser $DbPassword $TempDatabase $deptArg $namesJoined
if ($LASTEXITCODE -ne 0) { throw "inspect-before failed (classify names missing?)" }
Write-Host $beforeJson

Write-Host "Apply keep-classify prune on temp..."
$applyJson = python $py apply $ContainerName $DbUser $DbPassword $TempDatabase $deptArg $namesJoined
if ($LASTEXITCODE -ne 0) { throw "apply keep failed" }
Write-Host $applyJson
$applyObj = $applyJson | ConvertFrom-Json
if ($applyObj.orphanEntriesMissingClassify -gt 0) {
    Write-Warning "Orphan entries (missing classify): $($applyObj.orphanEntriesMissingClassify)"
}

Write-Host "Dump pruned temp DB..."
$ts = Get-Date -Format "yyyyMMdd_HHmmss"
$prunedName = "translationtool_${ts}_pruned_keep_classify.sql"
$prunedRemote = "/tmp/$prunedName"
$prunedHost = Join-Path $ProjectRoot "db\backups\$prunedName"
$dumpCmd = "mysqldump -u$DbUser -p$DbPassword --default-character-set=utf8mb4 --single-transaction --routines --triggers --result-file=$prunedRemote $TempDatabase"
& docker exec $ContainerName sh -c $dumpCmd
if ($LASTEXITCODE -ne 0) { throw "mysqldump pruned temp failed" }
& docker cp "${ContainerName}:${prunedRemote}" $prunedHost
& docker exec $ContainerName rm -f $prunedRemote | Out-Null
if (-not (Test-Path $prunedHost)) { throw "pruned dump missing on host" }

Write-Host "Replace local $TargetDatabase from pruned dump..."
& (Join-Path $PSScriptRoot "restore-database.ps1") -ProjectRoot $ProjectRoot `
    -BackupPath $prunedHost -ContainerName $ContainerName -DbUser $DbUser -DbPassword $DbPassword `
    -Database $TargetDatabase -SkipPreRestoreBackup -Force
if ($LASTEXITCODE -ne 0) { throw "restore pruned → target failed" }

Write-Host "DROP temp database $TempDatabase ..."
& docker exec $ContainerName mysql "-u$DbUser" "-p$DbPassword" -e "DROP DATABASE IF EXISTS ``$TempDatabase``;"

Write-Host "Inspect after on target..."
$afterJson = python $py inspect $ContainerName $DbUser $DbPassword $TargetDatabase $deptArg $namesJoined
if ($LASTEXITCODE -ne 0) { throw "inspect-after failed" }
Write-Host $afterJson

Write-Host "Post backup after_keep_mon_cn_develop..."
$postJson = & (Join-Path $PSScriptRoot "backup-database.ps1") -ProjectRoot $ProjectRoot `
    -ContainerName $ContainerName -DbUser $DbUser -DbPassword $DbPassword `
    -Database $TargetDatabase -Label "after_keep_mon_cn_develop"
$postObj = $postJson | ConvertFrom-Json

$result = [ordered]@{
    ok                = $true
    mode              = "keep_classify_restore"
    sourceDump        = $DumpPath
    workDump          = $workDump
    prunedDump        = $prunedHost
    preKeepBackup     = $preBackupPath
    afterKeepBackup   = $postObj.backupPath
    department        = $Department
    classifyNames     = $ClassifyNames
    apply             = $applyObj
    afterInspect      = ($afterJson | ConvertFrom-Json)
}
$result | ConvertTo-Json -Depth 8 -Compress
Write-Host "=== keep_classify_restore done ==="
