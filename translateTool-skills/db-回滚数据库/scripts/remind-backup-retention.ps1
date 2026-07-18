# remind-backup-retention.ps1
# Monthly human reminder ONLY — never deletes backups.
# Use: Agent runs on backup/list when due; or Windows Task Scheduler (toast/notepad).
param(
    [string]$ProjectRoot = $env:TRANSLATIONTOOL_ROOT,
    [int]$OlderThanDays = 30,
    [int]$SnoozeDays = 0,
    [switch]$ForceShow,
    [switch]$RegisterTaskHint
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

. (Join-Path $PSScriptRoot "lib\Retention-State.ps1")

$ProjectRoot = Resolve-ProjectRoot -Root $ProjectRoot
$BackupDir = Join-Path $ProjectRoot "db\backups"
if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

if ($RegisterTaskHint) {
    $scriptPath = (Resolve-Path $PSCommandPath).Path
    Write-Host @"
# Optional: register a monthly REMINDER (does not delete files).
# Run once in elevated PowerShell if desired:

`$action = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument '-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`" -ForceShow'
`$trigger = New-ScheduledTaskTrigger -Weekly -WeeksInterval 4 -DaysOfWeek Monday -At 10am
Register-ScheduledTask -TaskName 'TranslationtoolBackupRetentionRemind' -Action `$action -Trigger `$trigger -Description 'Remind to review db/backups (no auto-delete)'

"@
    exit 0
}

if ($SnoozeDays -gt 0) {
    $state = Get-RetentionState -BackupDir $BackupDir
    $state.nextDueAt = (Get-Date).AddDays($SnoozeDays).ToString("o")
    $state.lastRemindedAt = (Get-Date).ToString("o")
    Save-RetentionState -BackupDir $BackupDir -State $state
    Write-Host "Snoozed retention reminder by $SnoozeDays days. nextDueAt=$($state.nextDueAt)"
    @{ action = "snooze"; snoozeDays = $SnoozeDays; nextDueAt = $state.nextDueAt } | ConvertTo-Json -Compress
    exit 0
}

$check = Test-RetentionDue -BackupDir $BackupDir
if (-not $ForceShow -and -not $check.due) {
    Write-Host "Retention reminder not due. nextDueAt=$($check.state.nextDueAt)"
    @{ due = $false; nextDueAt = $check.state.nextDueAt; reminded = $false } | ConvertTo-Json -Compress
    exit 0
}

$info = Show-RetentionReminder -BackupDir $BackupDir -OlderThanDays $OlderThanDays
$state = Get-RetentionState -BackupDir $BackupDir
$state.lastRemindedAt = (Get-Date).ToString("o")
# Keep nextDueAt until user snoozes or prune confirms — so Agent keeps asking until answered
Save-RetentionState -BackupDir $BackupDir -State $state

$result = [ordered]@{
    due          = $true
    reminded     = $true
    totalCount   = $info.totalCount
    oldCount     = $info.oldCount
    oldFiles     = $info.oldFiles
    nextDueAt    = $state.nextDueAt
    instruction  = "Ask user: delete old backups / all / snooze 30d? Never silent delete."
}
$result | ConvertTo-Json -Depth 4 -Compress
