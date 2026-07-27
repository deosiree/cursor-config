# 迁移前环境预检查脚本
# 用途: 在执行迁移前验证环境，避免中途失败

param(
    [string]$SourceDir = "{SOURCE_DIR}",
    [string]$TargetDir = "{TARGET_DIR}",
    [switch]$FixIssues = $false
)

$SourceDir = [Environment]::ExpandEnvironmentVariables($SourceDir)
$TargetDir = [Environment]::ExpandEnvironmentVariables($TargetDir)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "环境预检查" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$issues = @()
$warnings = @()
$passed = 0

# 检查 1: 源目录存在性
Write-Host "[1/7] 检查源目录..." -NoNewline
if (Test-Path $SourceDir) {
    Write-Host " ✅ 通过" -ForegroundColor Green
    $passed++
} else {
    Write-Host " ❌ 失败" -ForegroundColor Red
    $issues += "源目录不存在: $SourceDir"
}

# 检查 2: 源目录包含扩展
Write-Host "[2/7] 检查源扩展数量..." -NoNewline
if (Test-Path $SourceDir) {
    $sourceExts = Get-ChildItem -Path $SourceDir -Directory | 
        Where-Object { $_.Name -match '^[\w-]+\.[\w-]+-\d+\.\d+\.\d+' }
    $count = $sourceExts.Count
    
    if ($count -gt 0) {
        Write-Host " ✅ 通过 ($count 个扩展)" -ForegroundColor Green
        $passed++
    } else {
        Write-Host " ⚠️  警告 (0 个扩展)" -ForegroundColor Yellow
        $warnings += "源目录没有扩展，迁移将为空"
    }
}

# 检查 3: 磁盘空间
Write-Host "[3/7] 检查磁盘空间..." -NoNewline
if (Test-Path $SourceDir) {
    $sourceSize = (Get-ChildItem $SourceDir -Recurse | Measure-Object -Property Length -Sum).Sum
    $targetDrive = Split-Path -Qualifier $TargetDir
    $freeSpace = (Get-PSDrive ($targetDrive -replace ':', '')).Free
    
    if ($freeSpace -gt ($sourceSize * 1.5)) {
        $sizeMB = [math]::Round($sourceSize / 1MB, 2)
        $freeMB = [math]::Round($freeSpace / 1MB, 2)
        Write-Host " ✅ 通过 (需要 $sizeMB MB, 可用 $freeMB MB)" -ForegroundColor Green
        $passed++
    } else {
        Write-Host " ❌ 失败" -ForegroundColor Red
        $issues += "磁盘空间不足"
    }
}

# 检查 4: 目标目录父目录存在
Write-Host "[4/7] 检查目标父目录..." -NoNewline
$targetParent = Split-Path -Parent $TargetDir
if (Test-Path $targetParent) {
    Write-Host " ✅ 通过" -ForegroundColor Green
    $passed++
} else {
    Write-Host " ❌ 失败" -ForegroundColor Red
    $issues += "目标父目录不存在: $targetParent"
}

# 检查 5: 写权限
Write-Host "[5/7] 检查写权限..." -NoNewline
try {
    $testFile = Join-Path $targetParent ".write-test-$(Get-Random)"
    New-Item -ItemType File -Path $testFile -Force | Out-Null
    Remove-Item $testFile -Force
    Write-Host " ✅ 通过" -ForegroundColor Green
    $passed++
} catch {
    Write-Host " ❌ 失败" -ForegroundColor Red
    $issues += "没有写权限，需要管理员身份运行"
}

# 检查 6: 编辑器进程检测
Write-Host "[6/7] 检查编辑器进程..." -NoNewline
$processes = @('code', 'cursor', 'kiro')
$runningEditors = Get-Process | Where-Object { $processes -contains $_.Name } | Select-Object -ExpandProperty Name -Unique

if ($runningEditors.Count -eq 0) {
    Write-Host " ✅ 通过 (无运行中的编辑器)" -ForegroundColor Green
    $passed++
} else {
    Write-Host " ⚠️  警告" -ForegroundColor Yellow
    $warnings += "检测到运行中的编辑器: $($runningEditors -join ', ')"
}

# 检查 7: PowerShell 版本
Write-Host "[7/7] 检查 PowerShell 版本..." -NoNewline
$psVersion = $PSVersionTable.PSVersion.Major
if ($psVersion -ge 5) {
    Write-Host " ✅ 通过 (v$psVersion)" -ForegroundColor Green
    $passed++
} else {
    Write-Host " ❌ 失败" -ForegroundColor Red
    $issues += "PowerShell 版本过低 (需要 5.1+, 当前 $psVersion)"
}

# 总结
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "检查完成: $passed/7 通过" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

if ($warnings.Count -gt 0) {
    Write-Host "⚠️  警告 ($($warnings.Count) 个):" -ForegroundColor Yellow
    foreach ($warning in $warnings) {
        Write-Host "  - $warning" -ForegroundColor Yellow
    }
    Write-Host ""
}

if ($issues.Count -gt 0) {
    Write-Host "❌ 问题 ($($issues.Count) 个):" -ForegroundColor Red
    foreach ($issue in $issues) {
        Write-Host "  - $issue" -ForegroundColor Red
    }
    Write-Host ""
    
    if ($FixIssues) {
        Write-Host "🔧 尝试自动修复...`n" -ForegroundColor Cyan
        
        # 自动修复：创建目标父目录
        if ($issues -match "目标父目录不存在") {
            try {
                New-Item -ItemType Directory -Path $targetParent -Force | Out-Null
                Write-Host "✅ 已创建目标父目录" -ForegroundColor Green
            } catch {
                Write-Host "❌ 无法创建目标父目录" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "💡 提示: 使用 -FixIssues 参数尝试自动修复部分问题`n" -ForegroundColor Yellow
    }
    
    exit 1
} else {
    Write-Host "✅ 所有检查通过，可以开始迁移！`n" -ForegroundColor Green
    exit 0
}
