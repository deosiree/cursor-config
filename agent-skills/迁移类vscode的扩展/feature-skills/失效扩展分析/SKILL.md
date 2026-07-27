---
name: 失效扩展分析
description: 解析失效扩展的 package.json，生成详细报告，并提供重装建议。
---

# 功能
读取用户记录的失效扩展列表，解析每个扩展的元数据，生成结构化报告。

## 输入
- `failedListPath`: 失效扩展列表文件路径
- `targetExtDir`: 目标扩展目录路径
- `targetEditor`: 目标编辑器名称（用于生成重装指引）

## 处理流程

### 1. 读取失效清单
从 `failedListPath` 读取扩展列表，支持格式：
- 完整文件夹名：`publisher.name-1.0.0`
- 仅 ID：`publisher.name`（尝试匹配版本）
- 忽略空行和注释行（以 # 开头）

### 2. 解析扩展元数据
对每个失效扩展：
1. 定位扩展目录：`{targetExtDir}/{扩展文件夹名}/`
2. 读取 `package.json`
3. 提取关键字段：
   - `displayName`: 显示名称
   - `publisher`: 发布者
   - `name`: 扩展 ID
   - `version`: 版本号
   - `description`: 说明
   - `engines.vscode`: 要求的最低编辑器版本
   - `repository`: 仓库地址（可选）

### 3. 生成分析报告
输出格式：
```
失效扩展分析报告
生成时间: {timestamp}
目标编辑器: {targetEditor}
失效扩展数: {count}

========================================

扩展 1:
  显示名称: Prettier - Code formatter
  ID: esbenp.prettier-vscode
  版本: 10.1.0
  说明: Code formatter using prettier
  最低编辑器版本: ^1.85.0
  仓库: https://github.com/prettier/prettier-vscode
  
  建议操作:
  1. 在 {targetEditor} 扩展市场搜索 "esbenp.prettier-vscode"
  2. 安装最新版本
  3. 如果市场找不到，访问仓库检查兼容性
  
  可能原因:
  - 编辑器版本过低（需要 1.85.0+）
  - 扩展签名在复制过程中损坏
  - 扩展依赖其他组件或扩展

========================================

扩展 2:
  ...

========================================

总结:
- 共 {count} 个扩展需要处理
- 建议优先重装：{criticalCount} 个核心扩展
- 可选重装：{optionalCount} 个非关键扩展
- 无法获取元数据：{unknownCount} 个（可能已损坏）
```

### 4. 输出报告
- 控制台输出完整报告
- 可选保存为 `failed-extensions-report.txt`
- 提取扩展 ID 列表供后续操作使用

## 错误处理
| 错误情况 | 处理方式 |
|---------|---------|
| 失效清单文件不存在 | 提示用户提供正确路径或直接粘贴内容 |
| 扩展目录不存在 | 记录为"无法定位"，建议用户提供 ID 手动搜索 |
| package.json 缺失或损坏 | 记录为"元数据不可用"，仅显示文件夹名 |
| package.json 格式错误 | 尝试容错解析，提取可用字段 |

## 输出
- `failed-extensions-report.txt`: 详细分析报告
- `failed-extension-ids.txt`: 扩展 ID 列表（每行一个，格式 `publisher.name`）
- 控制台输出：格式化的报告内容

## 关联模板
- `[[../../template/analyze-failed.ps1]]` - PowerShell 实现

## 使用示例
```text
输入：
- failedListPath: "D:\failed-extensions.txt"
- targetExtDir: "C:\Users\Admin\.kiro\extensions"
- targetEditor: "Kiro"

输出：
生成详细报告，列出 3 个失效扩展的完整信息和重装建议。
```

## 未来优化
- 自动查询扩展市场 API 检查可用版本
- 自动下载兼容版本的 .vsix 文件
- 提供一键重装脚本（调用 CLI 批量安装）
