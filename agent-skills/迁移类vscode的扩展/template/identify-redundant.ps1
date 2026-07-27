# 冗余扩展识别脚本（交互式）
# 用途: 列出扩展清单，引导用户选择要删除的冗余扩展
# 变量占位符: {TARGET_EXT_DIR}

param(
    [string]$TargetExtDir = "{TARGET_EXT_DIR}",
    [string]$FilterMode = "all"  # all | themes | formatters | linters
)

# 展开环境变量
$TargetExtDir = [Environment]::ExpandEnvironmentVariables($TargetExtDir)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "冗余扩展识别工具" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 扫描扩展目录
if (-not (Test-Path $TargetExtDir)) {
    Write-Host "❌ 错误: 目标目录不存在" -ForegroundColor Red
    Write-Host "   路径: $TargetExtDir" -ForegroundColor Red
    exit 1
}

$extensions = Get-ChildItem -Path $TargetExtDir -Directory | 
    Where-Object { $_.Name -match '^([\w-]+)\.([\w-]+)-' }

if ($extensions.Count -eq 0) {
    Write-Host "✅ 未发现扩展" -ForegroundColor Green
    exit 0
}

Write-Host "📦 发现 $($extensions.Count) 个扩展" -ForegroundColor Green
Write-Host "🔍 筛选模式: $FilterMode`n" -ForegroundColor Green

# 解析扩展信息
$extInfo = @{}
$index = 1

foreach ($ext in $extensions) {
    $pkgPath = Join-Path $ext.FullName "package.json"
    
    $info = @{
        FolderName = $ext.Name
        FullPath = $ext.FullName
        Index = $index
    }
    
    if (Test-Path $pkgPath) {
        try {
            $pkg = Get-Content $pkgPath -Raw | ConvertFrom-Json
            $info.DisplayName = $pkg.displayName
            $info.Description = $pkg.description
            $info.Categories = $pkg.categories -join ', '
            $info.Publisher = $pkg.publisher
            $info.Name = $pkg.name
        } catch {
            $info.DisplayName = $ext.Name
            $info.Description = "（无法读取元数据）"
        }
    } else {
        $info.DisplayName = $ext.Name
        $info.Description = "（缺少 package.json）"
    }
    
    $extInfo[$index] = $info
    $index++
}

# 应用筛选
$filtered = $extInfo.GetEnumerator() | Where-Object {
    $info = $_.Value
    switch ($FilterMode) {
        "themes" { $info.Categories -match 'theme' }
        "formatters" { $info.Categories -match 'formatter' }
        "linters" { $info.Categories -match 'linter' }
        default { $true }
    }
}

# 显示列表
Write-Host "扩展清单（按编号）:" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan

foreach ($item in $filtered | Sort-Object { $_.Value.Index }) {
    $info = $item.Value
    Write-Host "`n[$($info.Index)] $($info.DisplayName)" -ForegroundColor Yellow
    Write-Host "    ID: $($info.Publisher).$($info.Name)" -ForegroundColor Gray
    Write-Host "    $($info.Description)" -ForegroundColor Gray
    if ($info.Categories) {
        Write-Host "    分类: $($info.Categories)" -ForegroundColor Gray
    }
}

Write-Host "`n============================" -ForegroundColor Cyan
Write-Host "总计: $($filtered.Count) 个扩展`n" -ForegroundColor Cyan

# 交互式选择
Write-Host "请输入要删除的扩展编号（逗号分隔，如 1,5,8）：" -ForegroundColor Green
Write-Host "或输入 'done' 跳过清理" -ForegroundColor Green
Write-Host "或输入 'filter <类型>' 切换筛选（如 'filter themes'）`n" -ForegroundColor Green

$input = Read-Host "你的选择"

if ($input -eq 'done' -or $input -eq '') {
    Write-Host "`n✅ 跳过清理" -ForegroundColor Yellow
    
    # 保存当前扩展清单
    $listFile = "extensions-remaining.txt"
    $extInfo.Values | ForEach-Object { $_.FolderName } | 
        Sort-Object | 
        Out-File -FilePath $listFile -Encoding utf8
    
    Write-Host "📝 当前扩展清单已保存: $listFile" -ForegroundColor Green
    exit 0
}

if ($input -match '^filter\s+(\w+)$') {
    $newFilter = $Matches[1]
    Write-Host "`n🔄 切换筛选模式: $newFilter" -ForegroundColor Cyan
    Write-Host "请重新运行脚本，使用 -FilterMode $newFilter`n" -ForegroundColor Cyan
    exit 0
}

# 解析选择的编号
$toDelete = $input -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ -match '^\d+$' }

if ($toDelete.Count -eq 0) {
    Write-Host "`n⚠️  无效输入" -ForegroundColor Yellow
    exit 0
}

# 显示删除预览
Write-Host "`n将删除以下扩展：" -ForegroundColor Yellow
foreach ($num in $toDelete) {
    $info = $extInfo[[int]$num]
    if ($info) {
        Write-Host "  - $($info.DisplayName) ($($info.FolderName))" -ForegroundColor Red
    }
}

$confirm = Read-Host "`n确认删除？(y/n)"
if ($confirm -ne 'y') {
    Write-Host "操作已取消" -ForegroundColor Yellow
    exit 0
}

# 执行删除
Write-Host "`n🗑️  开始删除...`n"
$deleted = 0
$failed = 0

foreach ($num in $toDelete) {
    $info = $extInfo[[int]$num]
    if ($info) {
        try {
            Remove-Item -Path $info.FullPath -Recurse -Force
            Write-Host "✅ 已删除: $($info.DisplayName)" -ForegroundColor Green
            $deleted++
        } catch {
            Write-Host "❌ 删除失败: $($info.DisplayName) - $_" -ForegroundColor Red
            $failed++
        }
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "清理完成: 成功 $deleted 个, 失败 $failed 个" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`n💡 建议重启编辑器以刷新扩展列表" -ForegroundColor Yellow
