[CmdletBinding()]
param(
    [string]$TaskName = "CodexSessionWatchdog",
    [int]$MaxHeartbeatAgeMinutes = 30,
    [switch]$AutoStopOnIdleAlert,
    [int]$IdleMinutes = 12,
    [int]$CpuThresholdPercent = 85,
    [int]$ProcessMemoryThresholdMB = 3000,
    [int]$CheckIntervalSeconds = 30,
    [int]$ConsecutiveCpuHits = 3,
    [string]$ProcessPattern = "codex|node|pwsh"
)

$ErrorActionPreference = "Stop"

$launcherPath = (Resolve-Path (Join-Path $PSScriptRoot "run-watchdog.ps1")).Path
$pwsh = (Get-Command pwsh).Source

$arguments = @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-WindowStyle", "Hidden",
    "-File", "`"$launcherPath`"",
    "-MaxHeartbeatAgeMinutes", $MaxHeartbeatAgeMinutes,
    "-IdleMinutes", $IdleMinutes,
    "-CpuThresholdPercent", $CpuThresholdPercent,
    "-ProcessMemoryThresholdMB", $ProcessMemoryThresholdMB,
    "-CheckIntervalSeconds", $CheckIntervalSeconds,
    "-ConsecutiveCpuHits", $ConsecutiveCpuHits,
    "-ProcessPattern", "`"$ProcessPattern`""
) -join " "

if ($AutoStopOnIdleAlert) {
    $arguments += " -AutoStopOnIdleAlert"
}

$action = New-ScheduledTaskAction -Execute $pwsh -Argument $arguments
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -StartWhenAvailable

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger $trigger `
    -Principal $principal `
    -Settings $settings `
    -Force | Out-Null

Write-Host "[installed] task=$TaskName"
Write-Host "[run] schtasks /run /tn $TaskName"
