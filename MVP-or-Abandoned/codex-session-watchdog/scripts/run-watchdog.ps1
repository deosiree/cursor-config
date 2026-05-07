[CmdletBinding()]
param(
    [string]$HeartbeatFile = "",
    [int]$MaxHeartbeatAgeMinutes = 30,
    [bool]$AutoDiscoverHeartbeat = $true,
    [switch]$AutoStopOnIdleAlert,
    [int]$IdleMinutes = 12,
    [int]$CpuThresholdPercent = 85,
    [int]$ProcessMemoryThresholdMB = 3000,
    [int]$CheckIntervalSeconds = 30,
    [int]$ConsecutiveCpuHits = 3,
    [string]$ProcessPattern = "codex|node|pwsh"
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..\..")).Path
$watchdogPath = Join-Path $PSScriptRoot "watchdog.ps1"
$cursorDir = Join-Path $repoRoot ".cursor"

if (-not $HeartbeatFile) {
    $candidate = Get-ChildItem -Path $cursorDir -Filter "debug-*.log" -File -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1
    if ($candidate) {
        $age = (Get-Date) - $candidate.LastWriteTime
        if ($age.TotalMinutes -le $MaxHeartbeatAgeMinutes) {
            $HeartbeatFile = $candidate.FullName
        }
    }
}

if ($HeartbeatFile) {
    Write-Host "[launcher] heartbeat=$HeartbeatFile"
}
else {
    Write-Host "[launcher] no fresh heartbeat found; resource checks continue, idle check waits for fresh log."
}

if ($HeartbeatFile) {
    if ($AutoStopOnIdleAlert) {
        & $watchdogPath `
            -HeartbeatFile $HeartbeatFile `
            -HeartbeatDirectory $cursorDir `
            -HeartbeatPattern "debug-*.log" `
            -MaxHeartbeatAgeMinutes $MaxHeartbeatAgeMinutes `
            -AutoDiscoverHeartbeat $AutoDiscoverHeartbeat `
            -AutoStopOnIdleAlert `
            -IdleMinutes $IdleMinutes `
            -CpuThresholdPercent $CpuThresholdPercent `
            -ProcessMemoryThresholdMB $ProcessMemoryThresholdMB `
            -CheckIntervalSeconds $CheckIntervalSeconds `
            -ConsecutiveCpuHits $ConsecutiveCpuHits `
            -ProcessPattern $ProcessPattern
    }
    else {
        & $watchdogPath `
            -HeartbeatFile $HeartbeatFile `
            -HeartbeatDirectory $cursorDir `
            -HeartbeatPattern "debug-*.log" `
            -MaxHeartbeatAgeMinutes $MaxHeartbeatAgeMinutes `
            -AutoDiscoverHeartbeat $AutoDiscoverHeartbeat `
            -IdleMinutes $IdleMinutes `
            -CpuThresholdPercent $CpuThresholdPercent `
            -ProcessMemoryThresholdMB $ProcessMemoryThresholdMB `
            -CheckIntervalSeconds $CheckIntervalSeconds `
            -ConsecutiveCpuHits $ConsecutiveCpuHits `
            -ProcessPattern $ProcessPattern
    }
}
else {
    if ($AutoStopOnIdleAlert) {
        & $watchdogPath `
            -HeartbeatDirectory $cursorDir `
            -HeartbeatPattern "debug-*.log" `
            -MaxHeartbeatAgeMinutes $MaxHeartbeatAgeMinutes `
            -AutoDiscoverHeartbeat $AutoDiscoverHeartbeat `
            -AutoStopOnIdleAlert `
            -IdleMinutes $IdleMinutes `
            -CpuThresholdPercent $CpuThresholdPercent `
            -ProcessMemoryThresholdMB $ProcessMemoryThresholdMB `
            -CheckIntervalSeconds $CheckIntervalSeconds `
            -ConsecutiveCpuHits $ConsecutiveCpuHits `
            -ProcessPattern $ProcessPattern
    }
    else {
        & $watchdogPath `
            -HeartbeatDirectory $cursorDir `
            -HeartbeatPattern "debug-*.log" `
            -MaxHeartbeatAgeMinutes $MaxHeartbeatAgeMinutes `
            -AutoDiscoverHeartbeat $AutoDiscoverHeartbeat `
            -IdleMinutes $IdleMinutes `
            -CpuThresholdPercent $CpuThresholdPercent `
            -ProcessMemoryThresholdMB $ProcessMemoryThresholdMB `
            -CheckIntervalSeconds $CheckIntervalSeconds `
            -ConsecutiveCpuHits $ConsecutiveCpuHits `
            -ProcessPattern $ProcessPattern
    }
}
