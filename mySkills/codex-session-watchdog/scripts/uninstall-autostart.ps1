[CmdletBinding()]
param(
    [string]$TaskName = "CodexSessionWatchdog"
)

$ErrorActionPreference = "Stop"

if (Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "[removed] task=$TaskName"
}
else {
    Write-Host "[skip] task not found: $TaskName"
}
