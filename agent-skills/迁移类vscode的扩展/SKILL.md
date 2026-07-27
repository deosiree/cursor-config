---
name: 迁移类vscode的扩展
description: 在 VSCode、Cursor、Kiro 等类 VSCode 编辑器之间迁移扩展。支持一次性迁移、持续同步、批量部署等场景。
version: 1.0.0
tags: [迁移, vscode, cursor, kiro, 扩展, extensions]
metadata:
  category: development
  related_skills: [write-skill, darwin-skill]
---

# 目标
提供类 VSCode 编辑器（VSCode、Cursor、Kiro）之间扩展迁移的完整解决方案，涵盖一次性迁移、持续同步、批量部署等场景。

## 何时使用
- 需要将扩展从一个类 VSCode 编辑器迁移到另一个
- 需要在多个编辑器之间保持扩展同步
- 需要批量为团队部署统一的扩展环境
- 需要检测和清理失效或冗余的扩展

## 何时不要使用
- 只是安装单个扩展（直接用编辑器的扩展市场）
- 迁移其他类型的配置（如设置、快捷键等，需要其他 skill）
- 迁移到非 VSCode 系编辑器（如 JetBrains、Vim 等）

## 输入契约
必需参数：
- `migrationMode`: 迁移模式
  - `one-time`: 一次性迁移（本次场景）
  - `continuous`: 持续同步
  - `batch`: 批量部署
- `sourceEditor`: 源编辑器 (`vscode` | `cursor` | `kiro` | `other`)
- `targetEditor`: 目标编辑器 (`vscode` | `cursor` | `kiro` | `other`)

可选参数：
- `validationLevel`: 验证级别
  - `manual`: 人工检查扩展视图（默认）
  - `auto`: 自动化测试
  - `none`: 跳过验证
- `cleanupStrategy`: 清理策略
  - `interactive`: 交互式选择（默认）
  - `auto`: 自动清理重复扩展
  - `skip`: 不清理
- `sourceDir`: 自定义源扩展目录（可选）
- `targetDir`: 自定义目标扩展目录（可选）

关键事实缺失时先停下来：
- 缺 `migrationMode` 且无法从用户描述推断
- 缺 `sourceEditor` 或 `targetEditor` 且无法从路径推断
- `sourceDir` 或 `targetDir` 不存在或无法访问

## 智能推断规则

### 编辑器自动检测
当用户未明确指定 `sourceEditor` 或 `targetEditor` 时，按以下优先级检测：

**Windows 检测顺序：**
```
1. 检查 %USERPROFILE%\.vscode\extensions → VSCode
2. 检查 %USERPROFILE%\.kiro\extensions → Kiro
3. 检查 %USERPROFILE%\.cursor\extensions → Cursor
```

**macOS/Linux 检测顺序：**
```
1. 检查 ~/.vscode/extensions → VSCode
2. 检查 ~/.kiro/extensions → Kiro
3. 检查 ~/.cursor/extensions → Cursor
```

### 场景推断
根据用户描述关键词自动推断 `migrationMode`：
- 包含"复制"、"迁移"、"一次性" → `one-time`
- 包含"同步"、"保持一致"、"双向" → `continuous`
- 包含"团队"、"批量"、"多台" → `batch`

## RED（失败基线）
### 常见失败模式

| 触发条件 | 典型表现 | 原因 |
|---------|---------|------|
| 路径不存在 | 脚本报错找不到目录 | 用户输入错误路径或编辑器未安装 |
| 权限不足 | 无法复制或删除文件 | 需要管理员权限 |
| 编辑器版本不兼容 | 扩展显示警告/错误 | API 版本差异 |
| 扩展签名失效 | 扩展无法加载 | 直接复制破坏了签名 |
| 同时运行冲突 | 文件锁定或损坏 | 两个编辑器同时写入扩展目录 |

### 🛟 Fallback 树（增强版）

| 触发条件 | 一线修复 | 仍失败兜底 | 自动化工具 |
|---------|---------|-----------|-----------|
| 路径无法定位 | 使用标准路径猜测 | 要求用户提供绝对路径 | `pre-check.ps1` 自动检测 |
| 权限不足 | 提示用户以管理员身份运行 | 提供手动复制指南 | `pre-check.ps1 -FixIssues` |
| 编辑器正在运行 | 提示关闭编辑器 | 使用 robocopy /B 绕过锁定 | `pre-check.ps1` 警告 |
| 扩展兼容性问题 | 生成失效扩展列表供重装 | 回滚到备份 | `rollback.ps1` |
| 脚本执行策略限制 | Set-ExecutionPolicy -Scope Process | 提供 .bat 版本 | 脚本内自动处理 |
| 复制中途失败 | 删除部分目录重试 | 回滚到备份 | `rollback.ps1` |
| 磁盘空间不足 | 清理临时文件 | 要求用户释放空间 | `pre-check.ps1` 预防 |

## GREEN（解决方案）
### 任务分类与路由

**路由规则：**
```
IF migrationMode == "one-time" THEN
  → [[intention-skills/一次性迁移/SKILL.md]]
  
ELSE IF migrationMode == "continuous" THEN
  → [[intention-skills/持续同步/SKILL.md]]
  
ELSE IF migrationMode == "batch" THEN
  → [[intention-skills/批量部署/SKILL.md]]
  
ELSE
  → 询问用户明确场景
```

### 意图层 Skills

- `[[intention-skills/一次性迁移/SKILL.md]]` - 单次完整迁移（有备份、有验证、有清理）
- `[[intention-skills/持续同步/SKILL.md]]` - 定期或触发式同步扩展列表
- `[[intention-skills/批量部署/SKILL.md]]` - 团队环境统一部署

### 功能层 Skills

- `[[feature-skills/扩展目录复制/SKILL.md]]` - 生成跨平台复制脚本
- `[[feature-skills/兼容性检测/SKILL.md]]` - 检测扩展兼容性问题
- `[[feature-skills/失效扩展分析/SKILL.md]]` - 分析失效扩展并生成重装清单
- `[[feature-skills/冗余扩展识别/SKILL.md]]` - 交互式识别和删除冗余扩展
- `[[feature-skills/清理脚本生成/SKILL.md]]` - 生成批量清理脚本

### 标准输出
- 扩展迁移脚本（PowerShell/Bash）
- 扩展清单文件（.txt）
- 失效扩展报告（.txt）
- 冗余扩展列表（交互式或自动）
- 清理脚本（可选）

## REFACTOR（优化方向）
### 已知限制
1. **仅支持 Windows PowerShell**：macOS/Linux Bash 脚本待实现（影响 ~20% 用户）
2. **人工验证依赖**：兼容性检测需要人工观察扩展视图（可接受的权衡）
3. **无云同步**：不处理扩展设置的云同步（属于其他 skill 范畴）
4. **单向迁移**：当前版本focus 一次性迁移，持续同步和批量部署待完善

### 未来优化（按优先级）

#### P0（缺失核心功能）
- **无**（当前版本已覆盖核心场景）

#### P1（重要但可暂缓）
1. **Bash 脚本实现**（+跨平台支持）
   - 成本：高（2-3小时）
   - 收益：+2-3分，覆盖 macOS/Linux 用户
   - 建议：按需实现（有 Linux 用户需求时再做）

2. **持续同步机制**（+新场景）
   - 成本：中（1-2小时）
   - 收益：解锁新用户群
   - 建议：v2.0 规划

#### P2（锦上添花）
1. 扩展市场 API 集成（自动查询兼容版本）
2. 自动化兼容性测试（尝试激活扩展）
3. Web UI 管理界面

## 使用示例

### 示例 1：VSCode → Kiro 一次性迁移（本次场景）
```text
我想把 VSCode 的扩展迁移到 Kiro，一次性的，
迁移后检查一遍看哪些失效，失效的我手动重装，
最后删掉不需要的冗余扩展。

使用 $迁移类vscode的扩展
- migrationMode: one-time
- sourceEditor: vscode
- targetEditor: kiro
- validationLevel: manual
- cleanupStrategy: interactive
```

### 示例 2：Cursor ↔ VSCode 双向同步
```text
我在 Cursor 和 VSCode 之间频繁切换，
希望两边的扩展保持一致。

使用 $迁移类vscode的扩展
- migrationMode: continuous
- sourceEditor: cursor
- targetEditor: vscode
```

### 示例 3：团队批量部署标准扩展集
```text
团队有 10 台开发机，需要统一安装相同的扩展。

使用 $迁移类vscode的扩展
- migrationMode: batch
- sourceEditor: vscode
- targetEditor: vscode
```

## 依赖与环境
- **操作系统**：Windows（PowerShell 5.1+）、macOS/Linux（Bash，待完善）
- **权限**：管理员权限（可选，用于处理锁定文件）
- **前置条件**：
  - 源编辑器已安装扩展
  - 目标编辑器已安装（但可以没有扩展）
  - 足够的磁盘空间（通常 < 5GB）

## 质量保证
- **测试用例**：`[[evals/test-cases.md]]`
- **Darwin 基线**：`[[darwin-baseline.md]]`
- **参考文档**：`[[references/]]`

## 维护者注意
- 新增编辑器支持：更新路径映射表（references/editor-paths.md）
- 新增失败模式：更新 RED 部分 + fallback 树
- 脚本模板更新：同步更新 template/ 下对应文件
