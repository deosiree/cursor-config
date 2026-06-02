---
name: 清理废弃产物
description: 扫描 OpenCLI 子 skill 目录，识别从未成功跑通、超过 30 天未使用、或被新方案替代的脚本/场景，生成候选删除列表，经用户确认后执行清理。
---

# 清理废弃产物

> 被 `hermes-session-harvest` 的 Step 1-3 调用。防止自生长体系变成垃圾站。

## 核心原则

> **"跑不通的脚本不是经验，是债务。"**

## 扫描维度

### 1. 从未成功跑通的脚本

```bash
# 检查 opencli-ux-*/ 下所有脚本的执行记录
# 方法：读取 evals/darwin-baseline-report.md 中的状态
#      如果状态为 "⏸ 骨架" 或 "⏸ 未实跑" → 标记
```

| 检查文件 | 检查项 | 标记条件 |
|---------|--------|---------|
| `opencli-ux-*/run-e2e.sh` | Darwin 报告状态 | "⏸" 开头 + mtime > 30 天 |
| `opencli-ux-*/login.sh` | 是否被 run-e2e.sh source | 孤立脚本（无 caller） |
| `opencli-ux-*/scripts/*.js` | 是否被 run-e2e.sh 引用 | 无引用的独立脚本 |
| `opencli-ux-*/feature-skills/*/SKILL.md` | 内容是否为 TODO/骨架 | "TODO" 占比 > 80% + mtime > 30 天 |

### 2. 过期的 session-log

```text
session-log/ 文件超过 90 天 + 内容仅 1-2 个命令 → 候选归档/删除
```

### 3. 已替代的旧场景

```text
同一场景有新旧两个 references/场景-*.md → 保留新的，旧的可删除
同一功能有 opencli-ux-{old}/ 和 opencli-ux-{new}/ → 检查是否新旧交替
```

## 执行步骤

### Step A — 生成候选列表

```markdown
## 🧹 废弃产物候选列表

| 路径 | 类型 | 废弃原因 | 最后活动 | 建议 |
|------|------|---------|---------|------|
| opencli-ux-foo/run-e2e.sh | 脚本 | 从未实跑（骨架状态 45 天） | 2026-05-01 | 删除 |
| session-log/2026-03-01-old-test.md | 日志 | 仅 2 个命令，已过期 90+ 天 | 2026-03-01 | 归档 |
| references/场景-旧版菜单导入.md | 场景 | 被 场景-菜单导入与SSH联调.md 替代 | 2026-04-15 | 删除 |
```

### Step B — 用户确认

```text
必须向用户展示候选列表，逐项问：
  "上述 X 个废弃产物，是否全部删除？(y/n/逐项确认)"
  
在用户明确回复前，不得执行任何 delete_file。
```

### Step C — 执行清理

确认后执行：

```yaml
# 删除文件
delete_file: path

# 清理路由表引用（如果场景被删除）
edit_file: SKILL.md → 移除对应路由行

# 清理 source-map.md 引用（如果子 skill 被删除）
edit_file: references/source-map.md → 移除对应行
```

### Step D — 记录清理日志

```markdown
## 🧹 清理记录 (2026-06-02)

- 删除 opencli-ux-foo/ (从未实跑，骨架状态 45 天)
- 归档 session-log/2026-03-01-old-test.md (过期 90+ 天)
- 删除 references/场景-旧版菜单导入.md (已被替代)
```

写入 `session-log/cleanup-{date}.md`。

## 安全红线

| 红线 | 说明 |
|------|------|
| **不删引用** | 如果脚本被其他脚本 source/import，不删除 |
| **不删近期** | mtime < 30 天的不标记，即使从未跑通 |
| **不删核心** | `lib/common.sh`、`lib/config.sh` 不标记（基础设施） |
| **必须确认** | 所有删除必须经用户确认，不允许 Agent 自主删除 |

## 输出规范

返回候选删除列表给 `hermes-session-harvest` 主引擎的 Step 2 决策。
