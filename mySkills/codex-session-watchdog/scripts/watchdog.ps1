[CmdletBinding()]
param(
    [string]$HeartbeatFile = "",
    [string]$HeartbeatDirectory = "",
    [string]$HeartbeatPattern = "debug-*.log",
    [int]$MaxHeartbeatAgeMinutes = 30,
    [bool]$AutoDiscoverHeartbeat = $true,
    [switch]$AutoStopOnIdleAlert,

    [int]$IdleMinutes = 12,
    [int]$CpuThresholdPercent = 85,
    [int]$ProcessMemoryThresholdMB = 3000,
    [int]$CheckIntervalSeconds = 30,
    [int]$ConsecutiveCpuHits = 3,
    [string]$ProcessPattern = 'codex|node|pwsh'
)

$ErrorActionPreference = 'Stop'

function Show-Toast {
    param(
        [string]$Title,
        [string]$Message
    )

    try {
        if (Get-Module -ListAvailable -Name BurntToast) {
            Import-Module BurntToast -ErrorAction Stop | Out-Null
            New-BurntToastNotification -Text $Title, $Message | Out-Null
            return
        }

        [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
        [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null

        $xml = @"
<toast>
  <visual>
    <binding template="ToastGeneric">
      <text>$Title</text>
      <text>$Message</text>
    </binding>
  </visual>
</toast>
"@

        $doc = New-Object Windows.Data.Xml.Dom.XmlDocument
        $doc.LoadXml($xml)
        $toast = [Windows.UI.Notifications.ToastNotification]::new($doc)
        $notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('PowerShell')
        $notifier.Show($toast)
    }
    catch {
        Write-Warning "Toast failed: $($_.Exception.Message)"
        try {
            $plain = "$Title`n$Message"
            msg.exe $env:USERNAME $plain | Out-Null
        }
        catch {
            # Best-effort fallback when desktop notification APIs are unavailable.
        }
        Write-Host "[NOTIFY] $Title - $Message"
    }
}

function Resolve-Heartbeat {
    param(
        [datetime]$Now
    )

    if ($HeartbeatFile -and (Test-Path -LiteralPath $HeartbeatFile)) {
        return Get-Item -LiteralPath $HeartbeatFile
    }

    if (-not $AutoDiscoverHeartbeat) {
        return $null
    }

    $searchDir = $HeartbeatDirectory
    if (-not $searchDir) {
        $repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..\..")).Path
        $searchDir = Join-Path $repoRoot ".cursor"
    }

    $candidate = Get-ChildItem -Path $searchDir -Filter $HeartbeatPattern -File -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1

    if (-not $candidate) {
        return $null
    }

    $age = $Now - $candidate.LastWriteTime
    if ($age.TotalMinutes -gt $MaxHeartbeatAgeMinutes) {
        return $null
    }

    return $candidate
}

Write-Host "[watchdog] started. press Ctrl+C to stop."
Write-Host "[watchdog] idle=${IdleMinutes}m cpu>${CpuThresholdPercent}% mem>${ProcessMemoryThresholdMB}MB autoDiscover=$AutoDiscoverHeartbeat maxHeartbeatAge=${MaxHeartbeatAgeMinutes}m"

$cpuHitCount = 0
$lastIdleAlertAt = $null
$lastCpuAlertAt = $null
$lastMemAlertAt = $null
$lastHeartbeatStatusAt = $null
$currentHeartbeat = $null

while ($true) {
    $now = Get-Date
    $resolvedHeartbeat = Resolve-Heartbeat -Now $now
    if ($resolvedHeartbeat -and (-not $currentHeartbeat -or $currentHeartbeat.FullName -ne $resolvedHeartbeat.FullName)) {
        $currentHeartbeat = $resolvedHeartbeat
        Write-Host "[watchdog] heartbeat switched to $($currentHeartbeat.FullName)"
    }

    if ($currentHeartbeat -and (Test-Path -LiteralPath $currentHeartbeat.FullName)) {
        $heartbeat = Get-Item -LiteralPath $currentHeartbeat.FullName
        $idle = $now - $heartbeat.LastWriteTime
        if ($idle.TotalMinutes -ge $IdleMinutes) {
            if (-not $lastIdleAlertAt -or ($now - $lastIdleAlertAt).TotalMinutes -ge 10) {
                $msg = "会话文件 $([IO.Path]::GetFileName($heartbeat.FullName)) 已 $([math]::Round($idle.TotalMinutes,1)) 分钟无更新。建议中断当前对话并重试。"
                Show-Toast -Title 'Codex Watchdog: 长时间无响应' -Message $msg
                Write-Host "[idle-timeout] $msg"
                $lastIdleAlertAt = $now
                if ($AutoStopOnIdleAlert) {
                    Write-Host "[watchdog] auto-stop on idle alert."
                    break
                }
            }
        }
    }
    else {
        if (-not $lastHeartbeatStatusAt -or ($now - $lastHeartbeatStatusAt).TotalMinutes -ge 5) {
            Write-Host "[watchdog] no fresh heartbeat found. idle check skipped."
            $lastHeartbeatStatusAt = $now
        }
    }

    $cpu = [math]::Round((Get-Counter '\Processor(_Total)\% Processor Time').CounterSamples[0].CookedValue, 1)
    if ($cpu -ge $CpuThresholdPercent) {
        $cpuHitCount++
    }
    else {
        $cpuHitCount = 0
    }

    if ($cpuHitCount -ge $ConsecutiveCpuHits) {
        if (-not $lastCpuAlertAt -or ($now - $lastCpuAlertAt).TotalMinutes -ge 5) {
            $msg = "系统 CPU 持续高负载（当前 ${cpu}%）。建议暂停等待并中断当前会话。"
            Show-Toast -Title 'Codex Watchdog: CPU 异常' -Message $msg
            Write-Host "[high-cpu] $msg"
            $lastCpuAlertAt = $now
        }
    }

    $targetProcs = Get-Process | Where-Object { $_.ProcessName -match $ProcessPattern }
    $memoryMB = 0
    if ($targetProcs) {
        $memoryBytes = ($targetProcs | Measure-Object -Property WorkingSet64 -Sum).Sum
        $memoryMB = [math]::Round($memoryBytes / 1MB, 1)
    }

    if ($memoryMB -ge $ProcessMemoryThresholdMB) {
        if (-not $lastMemAlertAt -or ($now - $lastMemAlertAt).TotalMinutes -ge 5) {
            $msg = "目标进程总内存 ${memoryMB}MB 超过阈值 ${ProcessMemoryThresholdMB}MB。建议中断并降载后重试。"
            Show-Toast -Title 'Codex Watchdog: 内存异常' -Message $msg
            Write-Host "[high-memory] $msg"
            $lastMemAlertAt = $now
        }
    }

    Start-Sleep -Seconds $CheckIntervalSeconds
}
