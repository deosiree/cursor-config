# 自动回滚脚本
# 用途: 迁移失败后快速恢复到备份状态

param(
    [string]$BackupDir = "{BACKUP_DIR}",
    [string]$TargetDir = "{TARGET_DIR}"
)

$BackupDir = [Environment]::ExpandEnvironmentVariables($BackupDir)
$TargetDir = [Environment]::ExpandEnvironmentVariables($TargetDir)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "自动回滚工具" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 验证备份存在
if (-not (Test-Path $BackupDir)) {
    Write-Host "❌ 备份目录不存在: $BackupDir" -ForegroundColor Red
    Write-Host "无法回滚，请手动恢复`n" -ForegroundColor Red
    exit 1
}

Write-Host "📦 备份目录: $BackupDir" -ForegroundColor Green
Write-Host "📁 目标目录: $TargetDir`n" -ForegroundColor Green

# 确认回滚
$confirm = Read-Host "确认回滚到备份状态？这将删除当前目标目录。(y/n)"
if ($confirm -ne 'y') {
    Write-Host "操作已取消" -ForegroundColor Yellow
    exit 0
}

Write-Host "`n🔄 开始回滚...`n"

# 删除当前目标目录
if (Test-Path $TargetDir) {
    try {
        Write-Host "  1. 删除当前目录..." -NoNewline
        Remove-Item -Path $TargetDir -Recurse -Force
        Write-Host " ✅" -ForegroundColor Green
    } catch {
        Write-Host " ❌" -ForegroundColor Red
        Write-Host "删除失败: $_" -ForegroundColor Red
        exit 1
    }
}

# 恢复备份
try {
    Write-Host "  2. 恢复备份..." -NoNewline
    Copy-Item -Path $BackupDir -Destination $TargetDir -Recurse -Force
    Write-Host " ✅" -ForegroundColor Green
} catch {
    Write-Host " ❌" -ForegroundColor Red
    Write-Host "恢复失败: $_" -ForegroundColor Red
    exit 1
}

# 验证恢复
$restoredExts = Get-ChildItem -Path $TargetDir -Directory | 
    Where-Object { $_.Name -match '^[\w-]+\.[\w-]+-\d+\.\d+\.\d+' }

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ 回滚完成！" -ForegroundColor Green
Write-Host "已恢复 $($restoredExts.Count) 个扩展" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "💡 建议: 重启编辑器以刷新扩展列表`n" -ForegroundColor Yellow
