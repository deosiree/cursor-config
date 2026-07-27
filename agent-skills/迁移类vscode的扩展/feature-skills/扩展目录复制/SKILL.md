---
name: 扩展目录复制
description: 生成跨平台的扩展目录复制脚本，支持完整复制、增量复制、备份等功能。
---

# 功能
根据源/目标编辑器和用户需求，生成并执行扩展目录复制脚本（PowerShell 或 Bash）。

## 输入参数
- `sourceEditor`: 源编辑器类型（vscode | cursor | kiro | other）
- `targetEditor`: 目标编辑器类型（vscode | cursor | kiro | other）
- `sourceDir`: 源扩展目录路径（可选，默认推断）
- `targetDir`: 目标扩展目录路径（可选，默认推断）
- `backupMode`: 是否删除旧目标目录（boolean，默认 true）
- `generateListOnly`: 仅生成清单不复制（boolean，默认 false）

## 默认路径映射

### Windows
- VSCode: `%USERPROFILE%\.vscode\extensions`
- Cursor: `%USERPROFILE%\.cursor\extensions`（待验证）
- Kiro: `%USERPROFILE%\.kiro\extensions`

### macOS/Linux
- VSCode: `~/.vscode/extensions`
- Cursor: `~/.cursor/extensions`（待验证）
- Kiro: `~/.kiro/extensions`

## 处理流程
1. **路径推断**
   - 如果提供了自定义路径，验证路径存在性
   - 否则，根据编辑器类型使用默认路径
   - 如果路径不存在，报错并要求用户提供

2. **生成脚本**
   - Windows: 使用 `[[../../template/copy-extensions.ps1]]`
   - macOS/Linux: 使用 `[[../../template/copy-extensions.sh]]`（待实现）
   - 替换脚本中的变量占位符

3. **执行复制**
   - 如果 `backupMode=true`，先删除目标目录
   - 执行复制命令
   - 生成扩展清单文件

4. **输出清单**
   - 格式：每行一个扩展文件夹名
   - 按字母顺序排序
   - 保存为 `extensions-list.txt`

## 输出
- 生成的脚本文件（如 `copy-extensions-generated.ps1`）
- 扩展清单文件 `extensions-list.txt`
- 复制后的目标扩展目录

## 错误处理
| 错误 | 处理方式 |
|-----|---------|
| 源目录不存在 | 要求用户提供正确路径或检查编辑器是否安装 |
| 目标目录无权限 | 提示以管理员身份运行 |
| 磁盘空间不足 | 报错并显示所需空间 |
| 编辑器正在运行 | 警告可能导致锁定，建议关闭编辑器 |

## 使用示例
```text
输入：
- sourceEditor: vscode
- targetEditor: kiro
- backupMode: true

输出：
1. 删除旧的 C:\Users\Administrator\.kiro\extensions
2. 复制 %USERPROFILE%\.vscode\extensions 到 C:\Users\Administrator\.kiro\extensions
3. 生成 extensions-list.txt（假设有 50 个扩展）
```

## 关联模板
- `[[../../template/copy-extensions.ps1]]` - PowerShell 版本
- `[[../../template/copy-extensions.sh]]` - Bash 版本（待实现）
