# term-day-cleanup.ps1
# Mode: term_day_cleanup — time-window cleanup of term-learning artifacts.
# Default scope A: term_agent_audit in window; approved rows also soft-delete
#   related t_translate / clear entry_info trans_id (same as audit_rollback).
# Explicitly NOT scope B: "all INSERTs today on all tables" (unsafe without op log).
#
# Flow: dry-run inspect → human ConfirmApply → apply.
param(
    [string]$ProjectRoot = $env:TRANSLATIONTOOL_ROOT,
    [string]$ContainerName = "translation-mysql",
    [string]$DbUser = "root",
    [string]$DbPassword = "123456",
    [string]$Database = "translationtool",
    [int]$Hours = 24,
    [string]$Since = "",          # optional absolute: '2026-07-16 00:00:00'
    [string]$Until = "",          # optional absolute
    [string]$TargetLang = "",     # empty = all langs
    [string]$TaskName = "",
    [string]$Department = "",
    [ValidateSet("all", "pending", "approved", "rejected", "needs_human", "auto_approved")]
    [string]$ReviewStatus = "all",
    [switch]$IncludeApprovedSideEffects,
    [switch]$ConfirmApply,
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

function Invoke-Mysql {
    param([string]$Sql, [switch]$Raw)
    $tmpHost = Join-Path $env:TEMP ("term_cleanup_" + [guid]::NewGuid().ToString("N") + ".sql")
    # Write UTF-8 no BOM for mysql client
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($tmpHost, $Sql, $utf8NoBom)
    $remote = "/tmp/term_cleanup_cmd.sql"
    & docker cp $tmpHost "${ContainerName}:${remote}" | Out-Null
    $out = & docker exec $ContainerName sh -c "mysql -u$DbUser -p$DbPassword --default-character-set=utf8mb4 -N -B $Database < $remote 2>&1"
    $code = $LASTEXITCODE
    & docker exec $ContainerName rm -f $remote | Out-Null
    Remove-Item -Force $tmpHost -ErrorAction SilentlyContinue
    if ($code -ne 0) {
        throw "mysql failed: $out"
    }
    return $out
}

$ProjectRoot = Resolve-ProjectRoot -Root $ProjectRoot

# Ensure tables exist
$tableCheck = & docker exec $ContainerName mysql "-u$DbUser" "-p$DbPassword" -N -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$Database' AND table_name='term_agent_audit';"
$tableCheck = ($tableCheck | Out-String).Trim()
if ($tableCheck -eq "0") {
    throw "Database '$Database' has no term_agent_audit (empty/unrestored DB). Restore a good dump first; term_day_cleanup is meaningless on empty schema."
}

# Bare column for single-table queries; $timePredA for joins on alias a
if ($Since) {
    $untilBare = if ($Until) { "AND updated_at <= '$Until'" } else { "" }
    $untilA = if ($Until) { "AND a.updated_at <= '$Until'" } else { "" }
    $timePred = "updated_at >= '$Since' $untilBare"
    $timePredA = "a.updated_at >= '$Since' $untilA"
} else {
    $timePred = "updated_at >= NOW() - INTERVAL $Hours HOUR"
    $timePredA = "a.updated_at >= NOW() - INTERVAL $Hours HOUR"
}

$statusPred = if ($ReviewStatus -eq "all") { "1=1" } else { "review_status = '$ReviewStatus'" }
$langPred = if ($TargetLang) { "AND target_lang = '$TargetLang'" } else { "" }
$langPredA = if ($TargetLang) { "AND a.target_lang = '$TargetLang'" } else { "" }
$taskPred = if ($TaskName) { "AND task_name = '$TaskName'" } else { "" }
$taskPredA = if ($TaskName) { "AND a.task_name = '$TaskName'" } else { "" }
$deptPred = if ($Department) { "AND department = '$Department'" } else { "" }
$deptPredA = if ($Department) { "AND a.department = '$Department'" } else { "" }

$where = @"
WHERE $statusPred
  AND $timePred
  $langPred
  $taskPred
  $deptPred
"@

Write-Host "=== term_day_cleanup INSPECT (scope A: term_agent_audit window) ==="
Write-Host "Filter: $where"
Write-Host "NOT doing: all-table INSERT cleanup (scope B forbidden)"

$summarySql = @"
SET NAMES utf8mb4;
SELECT review_status, COUNT(*) AS cnt
FROM term_agent_audit
$where
GROUP BY review_status
ORDER BY review_status;
"@
$summary = Invoke-Mysql -Sql $summarySql
Write-Host "By review_status:"
Write-Host ($summary | Out-String)

$listSql = @"
SET NAMES utf8mb4;
SELECT id, review_status, target_lang, LEFT(IFNULL(source_text,''), 40), task_name, updated_at
FROM term_agent_audit
$where
ORDER BY updated_at DESC
LIMIT 50;
"@
$list = Invoke-Mysql -Sql $listSql
Write-Host "Sample (max 50):"
Write-Host ($list | Out-String)

$countSql = "SET NAMES utf8mb4; SELECT COUNT(*) FROM term_agent_audit $where;"
$total = ((Invoke-Mysql -Sql $countSql) | Out-String).Trim()

$approvedSideCount = 0
if ($IncludeApprovedSideEffects) {
    $sideSql = @"
SET NAMES utf8mb4;
SELECT COUNT(DISTINCT t.id)
FROM term_agent_audit a
JOIN t_translate t
  ON t.entry = a.source_text
 AND t.translate = a.suggested_translation
 AND t.type = a.target_lang
 AND t.delete_state = 0
 AND t.translate_state = '3'
WHERE a.review_status = 'approved'
  AND $timePredA
  $langPredA
  $taskPredA
  $deptPredA;
"@
    $approvedSideCount = [int](((Invoke-Mysql -Sql $sideSql) | Out-String).Trim())
    Write-Host "Approved glossary side-effect rows (state=3): $approvedSideCount"
}

$result = [ordered]@{
    mode                      = "term_day_cleanup"
    dryRun                    = [bool]($DryRun -or -not $ConfirmApply)
    auditCount                = [int]$total
    approvedGlossaryHits      = $approvedSideCount
    includeApprovedSideEffects = [bool]$IncludeApprovedSideEffects
    hours                     = $Hours
    since                     = $Since
    until                     = $Until
    note                      = "Scope A only. Confirm with -ConfirmApply to soft-delete/reset."
}

if ($DryRun -or -not $ConfirmApply) {
    Write-Host "Dry-run only. Re-run with -ConfirmApply after human approval to apply."
    $result | ConvertTo-Json -Compress
    exit 0
}

if ([int]$total -eq 0) {
    Write-Host "Nothing to clean."
    $result.applied = $false
    $result | ConvertTo-Json -Compress
    exit 0
}

Write-Host "APPLYING term_day_cleanup..."

# Soft-delete approved glossary terms if requested
if ($IncludeApprovedSideEffects) {
    $applyGlossary = @"
SET NAMES utf8mb4;
UPDATE t_translate t
JOIN term_agent_audit a
  ON t.entry = a.source_text
 AND t.translate = a.suggested_translation
 AND t.type = a.target_lang
 AND t.delete_state = 0
 AND t.translate_state = '3'
SET t.delete_state = 1
WHERE a.review_status = 'approved'
  AND $timePredA
  $langPredA
  $taskPredA
  $deptPredA;
"@
    Invoke-Mysql -Sql $applyGlossary | Out-Null
}

# Soft approach for audit rows: mark rejected with cleanup comment (keeps history)
# For approved: also null workbench links when entry_info_id set
$applyAudit = @"
SET NAMES utf8mb4;
UPDATE term_agent_audit
SET review_status = 'rejected',
    review_comment = CONCAT(IFNULL(review_comment,''), ' [term_day_cleanup]')
$where;
"@
Invoke-Mysql -Sql $applyAudit | Out-Null

if ($IncludeApprovedSideEffects) {
    foreach ($pair in @(
        @{ lang = '英文'; col = 'en_trans_id' },
        @{ lang = '俄文'; col = 'ru_trans_id' },
        @{ lang = '法文'; col = 'fra_trans_id' },
        @{ lang = '西文'; col = 'spa_trans_id' },
        @{ lang = '中文'; col = 'zh_trans_id' }
    )) {
        $clearSql = @"
SET NAMES utf8mb4;
UPDATE t_entry_info ei
JOIN term_agent_audit a ON a.entry_info_id = ei.id
SET ei.$($pair.col) = NULL
WHERE a.review_comment LIKE '%[term_day_cleanup]%'
  AND a.target_lang = '$($pair.lang)'
  AND $timePredA
  $langPredA
  $taskPredA
  $deptPredA;
"@
        Invoke-Mysql -Sql $clearSql | Out-Null
    }
}

$after = ((Invoke-Mysql -Sql "SET NAMES utf8mb4; SELECT COUNT(*) FROM term_agent_audit WHERE review_comment LIKE '%[term_day_cleanup]%' AND $timePred;") | Out-String).Trim()
$result.applied = $true
$result.markedRejected = [int]$after
$result.dryRun = $false
$result | ConvertTo-Json -Compress
Write-Host "term_day_cleanup applied. Marked rows (comment tag): $after"
