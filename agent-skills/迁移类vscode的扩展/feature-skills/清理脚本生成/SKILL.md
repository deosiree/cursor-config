---
name: 清理脚本生成
description: 根据用户选择的扩展列表，生成批量删除脚本。
---

# 功能
将用户标记的冗余扩展转换为批量删除脚本（PowerShell 或 Bash）。

## 使用场景
1. **交互式识别后批量删除**：配合 `[[冗余扩展识别/SKILL.md]]` 使用
2. **预定义清理列表**：用户提供要删除的扩展 ID 列表
3. **定期清理**：生成可复用的清理脚本

## 输入
- `extensionsToDelete`: 要删除的扩展列表（数组或文件路径）
- `targetExtDir`: 目标扩展目录路径
- `dryRun`: 是否仅预览不实际删除（boolean，默认 false）
- `logFile`: 删除日志文件路径（可选）

## 处理流程

### 1. 验证输入
- 检查扩展列表格式（支持 ID 或完整文件夹名）
- 验证目标目录存在
- 检查每个扩展文件夹是否存在

### 2. 生成脚本
根据平台生成对应脚本：

**PowerShell 版本**（Windows）：
```powershell
# cleanup-extensions.ps1
$extensionsDir = "{targetExtDir}"
$toDelete = @(
    "publisher1.extension1-1.0.0",
    "publisher2.extension2-2.0.0"
)

$deleted = 0
$failed = 0

foreach ($ext in $toDelete) {
    $path = Join-Path $extensionsDir $ext
    if (Test-Path $path) {
        try {
            Remove-Item -Path $path -Recurse -Force
            Write-Host "已删除: $ext" -ForegroundColor Green
            $deleted++
        } catch {
            Write-Host "删除失败: $ext - $_" -ForegroundColor Red
            $failed++
        }
    } else {
        Write-Host "未找到: $ext" -ForegroundColor Yellow
    }
}

Write-Host "`n清理完成: 成功 $deleted 个, 失败 $failed 个"
```

**Bash 版本**（macOS/Linux）：
```bash
#!/bin/bash
EXTENSIONS_DIR="{targetExtDir}"
TO_DELETE=(
    "publisher1.extension1-1.0.0"
    "publisher2.extension2-2.0.0"
)

deleted=0
failed=0

for ext in "${TO_DELETE[@]}"; do
    path="$EXTENSIONS_DIR/$ext"
    if [ -d "$path" ]; then
        if rm -rf "$path"; then
            echo "已删除: $ext"
            ((deleted++))
        else
            echo "删除失败: $ext"
            ((failed++))
        fi
    else
        echo "未找到: $ext"
    fi
done

echo "清理完成: 成功 $deleted 个, 失败 $failed 个"
```

### 3. Dry Run（预览模式）
如果 `dryRun=true`，生成预览报告：
```
[DRY RUN] 将删除以下扩展：

1. Dracula Official
   路径: C:\Users\Admin\.kiro\extensions\dracula-theme.theme-dracula-2.24.2
   大小: 1.2 MB

2. One Dark Pro
   路径: C:\Users\Admin\.kiro\extensions\zhuangtongfa.material-theme-3.16.0
   大小: 0.8 MB

总计: 2 个扩展, 约 2.0 MB

如需执行，请运行生成的脚本: cleanup-extensions.ps1
```

### 4. 执行清理
- 如果 `dryRun=false`，直接执行删除
- 记录每个操作的结果（成功/失败/未找到）
- 输出统计信息

### 5. 生成日志
保存删除日志（如果指定了 `logFile`）：
```
扩展清理日志
时间: 2024-01-15 10:30:00
目标目录: C:\Users\Admin\.kiro\extensions

已删除:
  - dracula-theme.theme-dracula-2.24.2
  - zhuangtongfa.material-theme-3.16.0

失败:
  （无）

未找到:
  （无）

总计: 成功 2, 失败 0, 未找到 0
```

## 输出
- 生成的清理脚本：`cleanup-extensions.ps1` 或 `cleanup-extensions.sh`
- 删除日志：`cleanup-log.txt`（可选）
- 控制台输出：删除统计信息

## 安全保护
- **白名单保护**：不允许删除核心系统扩展（内置扩展、语言支持等）
- **二次确认**：非 dry run 模式下，执行前要求确认
- **错误处理**：单个扩展删除失败不影响其他扩展
- **日志记录**：记录所有操作以便回溯

## 错误处理
| 错误情况 | 处理方式 |
|---------|---------|
| 权限不足 | 提示以管理员身份运行脚本 |
| 文件被锁定 | 记录失败，提示关闭编辑器后重试 |
| 扩展不存在 | 记录为"未找到"，继续处理其他扩展 |
| 目录损坏 | 尝试强制删除，失败则记录 |

## 关联模板
- `[[../../template/cleanup.ps1]]` - PowerShell 清理脚本模板
- `[[../../template/cleanup.sh]]` - Bash 清理脚本模板

## 使用示例

### 示例 1：交互式选择后批量删除
```text
用户在 "冗余扩展识别" 中选择了 [1,5,8]

Agent 执行：
1. 提取选中扩展的完整路径
2. 生成 cleanup-extensions.ps1
3. 预览删除列表（dry run）
4. 用户确认
5. 执行删除
```

### 示例 2：预定义清理列表
```text
用户说：删除这几个扩展（提供 ID 列表）

Agent 执行：
1. 解析 ID 列表
2. 生成脚本
3. 询问是否预览或直接执行
4. 执行删除
```

### 示例 3：生成可复用脚本（不执行）
```text
用户说：生成脚本但先不运行

Agent 执行：
1. 生成 cleanup-extensions.ps1
2. 输出脚本路径
3. 不执行删除
```

## 未来优化
- 支持正则表达式匹配扩展名（如删除所有主题）
- 支持按发布者批量删除
- 提供回滚功能（从备份或日志恢复）
- 集成到 CI/CD 流程（团队统一清理策略）
