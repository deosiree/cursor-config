# 批量清理扩展脚本
# 用途: 根据预定义列表批量删除扩展
# 变量占位符: {TARGET_EXT_DIR}, {EXTENSIONS_TO_DELETE}

param(
    [string]$TargetExtDir = "{TARGET_EXT_DIR}",
    [string[]]$ExtensionsToDelete = @(),
    [switch]$DryRun = $false
)

# 展开环境变量
$TargetExtDir = [Environment]::ExpandEnvironmentVariables($TargetExtDir)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "批量清理工具" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "🔍 预览模式（不会实际删除）`n" -ForegroundColor Yellow
}

# 如果没有提供列表，使用占位符
if ($ExtensionsToDelete.Count -eq 0) {
    $ExtensionsToDelete = @(
        {EXTENSIONS_TO_DELETE}
    )
}

Write-Host "📁 目标目录: $TargetExtDir" -ForegroundColor Green
Write-Host "📦 待删除: $($ExtensionsToDelete.Count) 个扩展`n" -ForegroundColor Green

# Dry Run 预览
if ($DryRun) {
    Write-Host "[DRY RUN] 将删除以下扩展：`n"
    $totalSize = 0
    
    foreach ($ext in $ExtensionsToDelete) {
        $path = Join-Path $TargetExtDir $ext
        if (Test-Path $path) {
            $size = (Get-ChildItem $path -Recurse | Measure-Object -Property Length -Sum).Sum
            $sizeMB = [math]::Round($size / 1MB, 2)
            $totalSize += $size
            
            Write-Host "  - $ext" -ForegroundColor Yellow
            Write-Host "    路径: $path" -ForegroundColor Gray
            Write-Host "    大小: $sizeMB MB" -ForegroundColor Gray
        } else {
            Write-Host "  - $ext (未找到)" -ForegroundColor Gray
        }
    }
    
    $totalMB = [math]::Round($totalSize / 1MB, 2)
    Write-Host "`n总计: $($ExtensionsToDelete.Count) 个扩展, 约 $totalMB MB`n" -ForegroundColor Cyan
    Write-Host "如需执行，请去掉 -DryRun 参数重新运行`n" -ForegroundColor Green
    exit 0
}

# 执行删除
$deleted = 0
$failed = 0
$notFound = 0
$log = @()

$log += "扩展清理日志"
$log += "时间: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$log += "目标目录: $TargetExtDir"
$log += "`n========================================"

Write-Host "🗑️  开始删除...`n"

foreach ($ext in $ExtensionsToDelete) {
    $path = Join-Path $TargetExtDir $ext
    
    if (-not (Test-Path $path)) {
        Write-Host "⚠️  未找到: $ext" -ForegroundColor Yellow
        $log += "未找到: $ext"
        $notFound++
        continue
    }
    
    try {
        Remove-Item -Path $path -Recurse -Force
        Write-Host "✅ 已删除: $ext" -ForegroundColor Green
        $log += "已删除: $ext"
        $deleted++
    } catch {
        Write-Host "❌ 删除失败: $ext - $_" -ForegroundColor Red
        $log += "失败: $ext - $_"
        $failed++
    }
}

# 保存日志
$log += "`n========================================"
$log += "总计: 成功 $deleted, 失败 $failed, 未找到 $notFound"

$logFile = "cleanup-log.txt"
$log | Out-File -FilePath $logFile -Encoding utf8

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "清理完成!" -ForegroundColor Cyan
Write-Host "  成功: $deleted" -ForegroundColor Green
Write-Host "  失败: $failed" -ForegroundColor Red
Write-Host "  未找到: $notFound" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`n📝 日志已保存: $logFile" -ForegroundColor Green
Write-Host "💡 建议重启编辑器以刷新扩展列表`n" -ForegroundColor Yellow
