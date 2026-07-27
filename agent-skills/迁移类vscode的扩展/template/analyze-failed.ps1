# 失效扩展分析脚本
# 用途: 解析失效扩展的 package.json 并生成详细报告
# 变量占位符: {FAILED_LIST_PATH}, {TARGET_EXT_DIR}, {TARGET_EDITOR}

param(
    [string]$FailedListPath = "{FAILED_LIST_PATH}",
    [string]$TargetExtDir = "{TARGET_EXT_DIR}",
    [string]$TargetEditor = "{TARGET_EDITOR}"
)

# 展开环境变量
$TargetExtDir = [Environment]::ExpandEnvironmentVariables($TargetExtDir)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "失效扩展分析工具" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 读取失效清单
if (-not (Test-Path $FailedListPath)) {
    Write-Host "❌ 错误: 失效清单文件不存在" -ForegroundColor Red
    Write-Host "   路径: $FailedListPath" -ForegroundColor Red
    Write-Host "`n💡 请创建该文件，每行一个扩展文件夹名" -ForegroundColor Yellow
    exit 1
}

$failedList = Get-Content $FailedListPath | 
    Where-Object { $_ -and $_ -notmatch '^\s*#' } | 
    ForEach-Object { $_.Trim() }

if ($failedList.Count -eq 0) {
    Write-Host "✅ 没有失效扩展需要分析" -ForegroundColor Green
    exit 0
}

Write-Host "📋 发现 $($failedList.Count) 个失效扩展`n" -ForegroundColor Yellow

# 准备报告
$report = @()
$report += "失效扩展分析报告"
$report += "生成时间: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$report += "目标编辑器: $TargetEditor"
$report += "失效扩展数: $($failedList.Count)"
$report += "`n========================================"

$idList = @()
$criticalCount = 0
$optionalCount = 0
$unknownCount = 0

foreach ($extName in $failedList) {
    $extPath = Join-Path $TargetExtDir $extName
    $report += "`n扩展: $extName"
    
    if (-not (Test-Path $extPath)) {
        $report += "  ⚠️  状态: 目录不存在"
        $report += "  建议: 请提供扩展 ID 手动在市场搜索"
        $unknownCount++
        continue
    }
    
    $pkgPath = Join-Path $extPath "package.json"
    if (-not (Test-Path $pkgPath)) {
        $report += "  ⚠️  状态: 元数据缺失"
        $report += "  建议: 扩展可能已损坏，请重新安装"
        $unknownCount++
        continue
    }
    
    try {
        $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
        
        $report += "  显示名称: $($pkg.displayName)"
        $report += "  ID: $($pkg.publisher).$($pkg.name)"
        $report += "  版本: $($pkg.version)"
        $report += "  说明: $($pkg.description)"
        
        if ($pkg.engines.vscode) {
            $report += "  最低编辑器版本: $($pkg.engines.vscode)"
        }
        
        if ($pkg.repository -and $pkg.repository.url) {
            $report += "  仓库: $($pkg.repository.url)"
        }
        
        $extId = "$($pkg.publisher).$($pkg.name)"
        $idList += $extId
        
        $report += "`n  📝 建议操作:"
        $report += "    1. 在 $TargetEditor 扩展市场搜索 `"$extId`""
        $report += "    2. 安装最新兼容版本"
        if ($pkg.repository) {
            $report += "    3. 如果市场找不到，访问仓库检查兼容性"
        }
        
        $report += "`n  🔍 可能原因:"
        if ($pkg.engines.vscode) {
            $report += "    - 编辑器版本过低（需要 $($pkg.engines.vscode)）"
        }
        $report += "    - 扩展签名在复制过程中损坏"
        $report += "    - 扩展依赖其他组件或扩展"
        
        # 判断优先级（简单启发式）
        $keywords = $pkg.keywords -join ' '
        if ($keywords -match 'language|debugger|intellisense' -or 
            $pkg.categories -contains 'Programming Languages') {
            $criticalCount++
        } else {
            $optionalCount++
        }
        
    } catch {
        $report += "  ⚠️  状态: 无法解析元数据"
        $report += "  错误: $_"
        $unknownCount++
    }
    
    $report += "`n========================================"
}

# 总结
$report += "`n📊 总结:"
$report += "  - 共 $($failedList.Count) 个扩展需要处理"
$report += "  - 建议优先重装: $criticalCount 个核心扩展"
$report += "  - 可选重装: $optionalCount 个非关键扩展"
$report += "  - 无法获取元数据: $unknownCount 个（可能已损坏）"

# 输出报告
$reportFile = "failed-extensions-report.txt"
$report | Out-File -FilePath $reportFile -Encoding utf8
Write-Host ($report -join "`n")

# 保存 ID 列表
if ($idList.Count -gt 0) {
    $idFile = "failed-extension-ids.txt"
    $idList | Out-File -FilePath $idFile -Encoding utf8
    Write-Host "`n✅ 扩展 ID 列表已保存: $idFile" -ForegroundColor Green
}

Write-Host "`n✅ 完整报告已保存: $reportFile" -ForegroundColor Green
