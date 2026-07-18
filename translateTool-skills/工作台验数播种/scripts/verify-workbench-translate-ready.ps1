# verify-workbench-translate-ready.ps1
# Exit 0 = all checks pass; Exit 1 = FAIL (prints FAIL lines).
param(
    [string]$ProjectRoot = $env:TRANSLATIONTOOL_ROOT,
    [string]$TaskId = "verify-syk-admin-task",
    [string]$ProductId = "a2128cfc-14f2-46ab-930e-76350aaf0255",
    [int]$ExpectedEntryCount = 4,
    [string]$TransIdColumn = "en_trans_id",
    [string]$ContainerName = "translation-mysql",
    [string]$DbUser = "root",
    [string]$DbPassword = "123456",
    [string]$Database = "translationtool"
)

$ErrorActionPreference = "Stop"
$fails = New-Object System.Collections.Generic.List[string]

function Invoke-MysqlScalar {
    param([string]$Sql)
    # mysql prints password warning on stderr; ignore stderr for exit-code noise
    $raw = & docker exec $ContainerName mysql `
        "-u$DbUser" "-p$DbPassword" -N -B `
        --default-character-set=utf8mb4 $Database -e $Sql 2>$null
    $code = $LASTEXITCODE
    if ($code -ne 0) {
        throw "mysql exit=$code sql=$Sql"
    }
    if ($null -eq $raw) { return "" }
    if ($raw -is [array]) { return ($raw -join "`n").Trim() }
    return ([string]$raw).Trim()
}

Write-Host "TaskId=$TaskId ProductId=$ProductId ExpectedEntryCount=$ExpectedEntryCount Col=$TransIdColumn"

$row = Invoke-MysqlScalar "SELECT CONCAT_WS('|', IFNULL(creator,''), IFNULL(developer,''), IFNULL(entry_auditor,''), IFNULL(translator,''), IFNULL(translation_auditor,''), IFNULL(product_id,'')) FROM t_task_info WHERE id='$TaskId';"
if (-not $row) {
    $fails.Add("FAIL personnel: task not found: $TaskId")
} else {
    $parts = $row -split '\|'
    $names = @('creator','developer','entry_auditor','translator','translation_auditor')
    for ($i = 0; $i -lt 5; $i++) {
        if ([string]::IsNullOrWhiteSpace($parts[$i])) { $fails.Add("FAIL personnel: $($names[$i]) empty") }
    }
    if ($ProductId -and $parts.Count -ge 6 -and $parts[5] -ne $ProductId) {
        $fails.Add("FAIL personnel: product_id='$($parts[5])' != '$ProductId'")
    }
    Write-Host "OK personnel: $row"
}

$rel = Invoke-MysqlScalar "SELECT COUNT(*) FROM t_product_relation WHERE task_id='$TaskId' AND product_id='$ProductId';"
Write-Host "relation count=$rel"
if ([int]$rel -ne $ExpectedEntryCount) {
    $fails.Add("FAIL relation: count=$rel expected=$ExpectedEntryCount")
}

$badNew = Invoke-MysqlScalar "SELECT COUNT(*) FROM t_entry_info e JOIN t_product_relation r ON r.entry_id=e.id WHERE r.task_id='$TaskId' AND e.entry_state=0"
Write-Host "bad_new=$badNew"
if ([int]$badNew -ne 0) { $fails.Add("FAIL entry_state: bad_new=$badNew (entry_state=0 forbidden)") }

$notReady = Invoke-MysqlScalar "SELECT COUNT(*) FROM t_entry_info e JOIN t_product_relation r ON r.entry_id=e.id WHERE r.task_id='$TaskId' AND (e.entry_state<>3 OR e.$TransIdColumn IS NOT NULL OR IFNULL(e.task_id,'')<>'$TaskId')"
Write-Host "notReady=$notReady"
if ([int]$notReady -ne 0) {
    $fails.Add("FAIL translate-ready: notReady=$notReady (need entry_state=3, $TransIdColumn NULL, task_id backfilled)")
}

if ($fails.Count -gt 0) {
    Write-Host "verifyPassed=false"
    foreach ($f in $fails) { Write-Host $f }
    exit 1
}

Write-Host "verifyPassed=true"
Write-Host "uiPath: product=$ProductId -> task=$TaskId -> translate stage"
exit 0
