# 扩展目录复制脚本
# 用途: 从源编辑器复制扩展到目标编辑器
# 变量占位符: {SOURCE_DIR}, {TARGET_DIR}

param(
    [string]$SourceDir = "{SOURCE_DIR}",
    [string]$TargetDir = "{TARGET_DIR}",
    [switch]$SkipBackup = $false
)

# 展开环境变量
$SourceDir = [Environment]::ExpandEnvironmentVariables($SourceDir)
$TargetDir = [Environment]::ExpandEnvironmentVariables($TargetDir)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "扩展目录复制工具" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 验证源目录
if (-not (Test-Path $SourceDir)) {
    Write-Host "❌ 错误: 源目录不存在" -ForegroundColor Red
    Write-Host "   路径: $SourceDir" -ForegroundColor Red
    exit 1
}

# 统计源扩展数量
$sourceExtensions = Get-ChildItem -Path $SourceDir -Directory | 
    Where-Object { $_.Name -match '^[\w-]+\.[\w-]+-\d+\.\d+\.\d+' }
$count = $sourceExtensions.Count

Write-Host "📁 源目录: $SourceDir" -ForegroundColor Green
Write-Host "📁 目标目录: $TargetDir" -ForegroundColor Green
Write-Host "📦 发现 $count 个扩展`n" -ForegroundColor Green

# 检查目标目录
if (Test-Path $TargetDir) {
    if (-not $SkipBackup) {
        Write-Host "⚠️  目标目录已存在，即将删除" -ForegroundColor Yellow
        $confirm = Read-Host "确认删除并继续？(y/n)"
        if ($confirm -ne 'y') {
            Write-Host "操作已取消" -ForegroundColor Yellow
            exit 0
        }
    }
    
    Write-Host "🗑️  删除旧目录: $TargetDir"
    Remove-Item -Path $TargetDir -Recurse -Force -ErrorAction SilentlyContinue
}

# 执行复制（带进度）
Write-Host "`n🔄 开始复制..."
$startTime = Get-Date

try {
    # 使用 robocopy 获得更好的进度和性能
    $robocopyArgs = @(
        $SourceDir,
        $TargetDir,
        "/E",           # 复制子目录（包括空目录）
        "/NDL",         # 不显示目录列表
        "/NJH",         # 不显示作业标题
        "/NJS",         # 不显示作业摘要
        "/NP",          # 不显示百分比
        "/NS",          # 不显示文件大小
        "/NC",          # 不显示文件类别
        "/BYTES",       # 以字节显示大小
        "/MT:8"         # 多线程（8线程）
    )
    
    Write-Host "  使用 robocopy 复制（8线程）..." -ForegroundColor Cyan
    $result = robocopy @robocopyArgs
    
    # robocopy 退出码: 0-7 为成功，8+ 为失败
    if ($LASTEXITCODE -lt 8) {
        $elapsed = (Get-Date) - $startTime
        Write-Host "✅ 复制完成! (耗时 $($elapsed.TotalSeconds.ToString('0.0')) 秒)" -ForegroundColor Green
    } else {
        throw "Robocopy 失败，退出码: $LASTEXITCODE"
    }
} catch {
    Write-Host "⚠️  Robocopy 不可用，使用标准复制..." -ForegroundColor Yellow
    Copy-Item -Path $SourceDir -Destination $TargetDir -Recurse -Force
    $elapsed = (Get-Date) - $startTime
    Write-Host "✅ 复制完成! (耗时 $($elapsed.TotalSeconds.ToString('0.0')) 秒)" -ForegroundColor Green
}

# 生成扩展清单
Write-Host "`n📝 生成扩展清单..."
$listFile = "extensions-list.txt"
$extensions = Get-ChildItem -Path $TargetDir -Directory | 
    Where-Object { $_.Name -match '^[\w-]+\.[\w-]+-\d+\.\d+\.\d+' } |
    Select-Object -ExpandProperty Name | 
    Sort-Object

$extensions | Out-File -FilePath $listFile -Encoding utf8

Write-Host "✅ 清单已保存: $listFile" -ForegroundColor Green
Write-Host "   共 $($extensions.Count) 个扩展`n" -ForegroundColor Green

# 生成执行摘要
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "📊 迁移摘要" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "源目录: $SourceDir" -ForegroundColor Gray
Write-Host "目标目录: $TargetDir" -ForegroundColor Gray
Write-Host "已迁移扩展: $($extensions.Count) 个" -ForegroundColor Gray
Write-Host "清单文件: $listFile" -ForegroundColor Gray
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "✅ 迁移完成！`n" -ForegroundColor Green
Write-Host "📌 下一步操作:" -ForegroundColor Yellow
Write-Host "  1. 启动目标编辑器（等待 10-15 秒加载扩展）" -ForegroundColor White
Write-Host "  2. 按 Ctrl+Shift+X 打开扩展视图" -ForegroundColor White
Write-Host "  3. 检查是否有警告或错误图标" -ForegroundColor White
Write-Host "  4. 将失效扩展记录到 failed-extensions.txt`n" -ForegroundColor White
