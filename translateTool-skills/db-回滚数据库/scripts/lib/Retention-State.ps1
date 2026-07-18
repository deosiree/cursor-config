# Retention state for monthly human-reviewed backup cleanup (never silent delete).

function Get-RetentionStatePath {
    param([string]$BackupDir)
    return (Join-Path $BackupDir ".retention-state.json")
}

function Get-RetentionState {
    param([string]$BackupDir)
    $path = Get-RetentionStatePath -BackupDir $BackupDir
    $now = Get-Date
    if (-not (Test-Path $path)) {
        return [ordered]@{
            lastRemindedAt = $null
            nextDueAt      = $now.AddDays(30).ToString("o")
            createdAt      = $now.ToString("o")
        }
    }
    $raw = Get-Content $path -Raw -Encoding utf8 | ConvertFrom-Json
    return [ordered]@{
        lastRemindedAt = $raw.lastRemindedAt
        nextDueAt      = $raw.nextDueAt
        createdAt      = $raw.createdAt
    }
}

function Save-RetentionState {
    param(
        [string]$BackupDir,
        [hashtable]$State
    )
    $path = Get-RetentionStatePath -BackupDir $BackupDir
    ($State | ConvertTo-Json -Compress) | Set-Content -Path $path -Encoding utf8 -NoNewline
}

function Test-RetentionDue {
    param([string]$BackupDir)
    $state = Get-RetentionState -BackupDir $BackupDir
    $due = [datetime]::Parse($state.nextDueAt, $null, [System.Globalization.DateTimeStyles]::RoundtripKind)
    return @{
        due   = ((Get-Date) -ge $due)
        state = $state
    }
}

function Show-RetentionReminder {
    param(
        [string]$BackupDir,
        [int]$OlderThanDays = 30
    )
    $files = @(Get-ChildItem -Path $BackupDir -Filter "*.sql" -File -ErrorAction SilentlyContinue)
    $cutoff = (Get-Date).AddDays(-$OlderThanDays)
    $old = @($files | Where-Object { $_.LastWriteTime -lt $cutoff })
    Write-Host ""
    Write-Host "========== 备份保留提醒（每月一次，禁止静默删除）=========="
    Write-Host "目录: $BackupDir"
    Write-Host "当前 .sql 数量: $($files.Count)"
    Write-Host "早于 ${OlderThanDays} 天: $($old.Count)"
    if ($old.Count -gt 0) {
        $old | Select-Object -First 10 | ForEach-Object {
            Write-Host ("  - {0}  ({1:N2} MB, {2})" -f $_.Name, ($_.Length / 1MB), $_.LastWriteTime.ToString("yyyy-MM-dd"))
        }
        if ($old.Count -gt 10) { Write-Host "  ... 另有 $($old.Count - 10) 个" }
    }
    Write-Host "请人工确认是否删除。Agent 须询问用户后才可执行 prune-backups.ps1 -ConfirmDelete。"
    Write-Host "拒绝清理时运行: remind-backup-retention.ps1 -SnoozeDays 30"
    Write-Host "=========================================================="
    Write-Host ""
    return @{
        totalCount = $files.Count
        oldCount   = $old.Count
        oldFiles   = @($old | ForEach-Object { $_.FullName })
    }
}
