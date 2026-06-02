---
name: hermes-session-harvest
description: 会话结束时自动扫描本次会话产生的有价值内容（命令序列/场景/踩坑），分类后沉淀到对应知识体系或清理废弃产物。借鉴 continuous-learning-v2 的 atomic instinct + 置信度评分模式，适配 OpenCLI 自生长 harvest pipeline。当用户说"沉淀/自生长/harvest/保存经验/收尾"时主动触发。
tags:
  - 知识沉淀
  - 自生长
  - 会话收尾
  - 垃圾清理
should-trigger:
  - prompt 含 沉淀 / 自生长 / harvest / 保存经验 / 收尾 / 归档
  - 本次会话使用了 OpenCLI / 浏览器自动化
  - 本次会话产生了新的命令序列或修复方案
should-not-trigger:
  - 纯问答/阅读，未产生任何可复用产出
  - 单次查询即可解决的简单问题
  - 本次会话所有操作均已被已有 skill 覆盖
---

# Hermes Session Harvest — 会话沉淀引擎

> **定位**：通用 session-end audit 引擎。在每次有价值的会话结束时，主动扫描、分类、沉淀或清理。
> **灵感来源**：`continuous-learning-v2.1` 的 atomic instinct + 置信度评分 + 防垃圾体系；`conversation-summary` 的对话沉淀模式。
> **核心原则**：有价值的留下，废弃的删除，重复的不建——不做垃圾站。

## 脚本落盘规则（强制）

> ⚠️ **执行修复流程时，所有产出必须直接落盘到对应 skill 目录中，不允许散落在沙盒、文档同级或其他位置。**

### 落盘映射表

| 产出类型 | 落盘路径 | 示例 |
|---------|---------|------|
| OpenCLI E2E 测试脚本 | `opencli-ux-{场景}/` | `opencli-ux-user-perm/run-e2e.sh` |
| OpenCLI 辅助脚本 (.js/.py) | `opencli-ux-{场景}/scripts/` | `opencli-ux-menu-import/scripts/` |
| SSH 排查脚本 | `ssh-skills/feature-skills/ssh-k8s-{功能}/` | `ssh-skills/feature-skills/ssh-k8s-浏览后端日志/` |
| 通用工具函数 | 对应 skill 的 `lib/` | `opencli-ux-{场景}/lib/common.sh` |
| 踩坑记录 | 对应 skill 的 `references/` | `opencli-ux-menu/references/menu-route-dup-pitfalls.md` |
| 会话记录 | `session-log/` | `session-log/2026-06-02-menu-import-ssh.md` |
| Few-shot 示例 | 对应 skill 的 `assets/few-shot-example/` | `opencli-ux-menu-import/assets/few-shot-example/session-*.md` |
| 截图 | 对应 skill 的 `screenshots/` | `opencli-ux-tenant/screenshots/fail-tenant-table.png` |

### 禁止落盘位置

| 位置 | 原因 |
|------|------|
| 项目根目录 | 散落无序，无法追溯 |
| `docs/` 同级 | 与业务文档混杂 |
| 沙盒临时目录 | 会话结束即丢失 |
| 桌面 / Downloads | 非版本控制 |

### Auditor 检测

若 SCAN 阶段发现脚本位于禁止位置 → 标记为 `misplaced`，询问用户迁移或删除。

## 四步 Audit 流程

```
┌────────────┐    ┌──────────┐    ┌────────────────┐    ┌──────────┐
│ 1. SCAN    │ → │2. CLASSIFY│ → │3. HARVEST/DEL  │ → │4. REPORT │
│ 扫描本次   │    │ 分类      │    │ 沉淀或清理     │    │ 输出摘要 │
│ 会话产出   │    │ 价值/废弃 │    │ 执行 + 提交    │    │          │
└────────────┘    └──────────┘    └────────────────┘    └──────────┘
```

### Step 1 — SCAN（扫描本次会话产出）

Agent 自动检查以下所有维度，不依赖用户提示：

| 维度 | 检查内容 | 方法 |
|------|---------|------|
| **新命令序列** | 本次会话是否执行了新的 OpenCLI / shell / HTTP 命令组合？ | 对比 `session-log/` 目录已有记录 |
| **新场景** | 是否存在自生长路由表未覆盖的操作场景？ | 对比 `SKILL.md` 路由规则表 |
| **新踩坑** | 是否有新的失败模式（如特定错误码、库版本冲突）？ | 回顾本次会话中的错误与修复 |
| **新脚本** | 是否在 `opencli-ux-*/` 等 skill 目录下创建了脚本？落盘位置是否符合映射表？ | 检查 git status --porcelain + 对比落盘映射表 |
| **脚本错放** | 是否有脚本散落在项目根目录、`docs/` 同级、沙盒临时目录等禁止位置？ | 扫描本次会话的 `write_file` 目标路径 |
| **废弃产物** | 是否有脚本从未成功跑通、超过 30 天未使用？ | 检查 run-e2e.sh 的执行记录 + 修改时间 |
| **未提交变更** | 是否有 `write_file` 创建但未 `git add` 的文件？ | `git status --porcelain` |

#### ⏸️ Checkpoint 1 — SCAN 结果预览

SCAN 完成后，向用户展示发现摘要，确认后继续：

```markdown
## SCAN 结果

| 发现 | 数量 | 详情 |
|------|:--:|------|
| 新命令序列 | N | {简要描述} |
| 新场景候选 | N | {场景名} |
| 新脚本 | N | {路径} |
| 脚本错放 | N | {当前位置 → 应落盘位置} |
| 废弃候选 | N | {路径} |
| 未提交变更 | N | {文件列表} |

继续执行 CLASSIFY？(y/n)
```

### Step 2 — CLASSIFY（分类：沉淀 vs 删除 vs 跳过）

```
                    本次会话产出
                         │
           ┌─────────────┼─────────────┐
           ▼              ▼              ▼
       命令序列        场景/踩坑       脚本文件
           │              │              │
    ┌──────┴──────┐  ┌───┴───┐    ┌────┴────┐
    ▼             ▼  ▼       ▼    ▼         ▼
 ≥3次复用    <3次 路由表  已有 从未成功  能跑通  错放位置
    │         │   未覆盖  覆盖 跑通+超期  +活跃  (禁止位)
    ▼         ▼    │       │    │         │       │
 沉淀为    仅记录   ▼       ▼    ▼         ▼       ▼
 场景      到log  新增    更新  候选删除  保留  迁移到
                  场景    references          正确位置
```

#### 分类规则

| 产出类型 | 条件 | 动作 | 置信度门槛 |
|---------|------|------|:---:|
| 命令序列 | 本次会话出现 ≥3 次相同模式 | → 沉淀为新场景 | high |
| 命令序列 | 本次会话出现 1-2 次 | → 仅写入 `session-log/` | low |
| 操作场景 | 路由表无匹配（<80% 重合） | → 调用 `harvest/add-scene.sh` | high |
| 操作场景 | 路由表有 ≥80% 重合 | → 更新已有 `references/场景-*.md` | — |
| 脚本文件 | 从未成功跑通 + mtime > 30 天 | → 候选删除（需用户确认） | — |
| 脚本文件 | 能跑通且近期使用 | → 保留，不操作 | — |
| 脚本错放 | 位于禁止位置（根目录/`docs/`同级/沙盒临时目录） | → **迁移**到落盘映射表对应位置 → 删除原文件 | — |
| 踩坑记录 | 新错误码/新失败模式 | → 追加到对应 `references/` 或 `session-log/` | — |

#### ⏸️ Checkpoint 2 — 执行计划确认

CLASSIFY 完成后，展示执行计划，待用户确认后再执行：

```markdown
## 执行计划

| 动作 | 目标 | 操作 |
|------|------|------|
| 🏗️ 新增场景 | {场景名} | write_file references/... + 更新路由表 |
| 📝 会话日志 | {文件名} | write_file session-log/... |
| 🧹 迁移错放 | {当前→目标} | move_file + delete_file |
| 🧹 候选删除 | {路径} | ⚠️ 需逐项确认 |
| ⏭️ 跳过 | N 项 | {原因} |

确认执行？(y/n/逐项确认)
```

### Step 3 — HARVEST or DELETE（执行沉淀或清理）

#### 3a. 沉淀路径（对接 OpenCLI harvest pipeline）

```bash
# 新增场景
bash harvest/add-scene.sh \
  -n "<场景名>" \
  -s <session> \
  -p <profile> \
  -P "<用户原始请求>" \
  -c "<核心命令序列>" \
  -C "<触发条件>"

# 新增子 skill（≥3 可复用脚本时）
bash harvest/scaffold-skill.sh \
  -n "<场景名>" \
  -s <session> \
  -p <profile> \
  -P "<用户原始请求>"

# 仅记录日志
write_file: session-log/{date}-{session}-{scene}.md
```

> 详细对接规范见 `references/harvest-pipeline.md`。

#### 3b. 清理路径

```yaml
# 删除废弃脚本/场景前必须：
# 1. 向用户展示候选列表
# 2. 说明废弃原因（从未成功 / 30天未用 / 被新方案替代）
# 3. 等待用户确认后再执行 delete_file
# 4. 清理路由表中的引用
```

#### 3c. Auto-commit

所有沉淀/清理操作完成后，按 harvest 约定自动提交：

| 类型 | 表情 | 格式 |
|------|:----:|------|
| 新增场景 | 🏗️ | `🏗️ OpenCLI自生长: 新增场景「{name}」({date})` |
| 新增子 skill | 🌱 | `🌱 OpenCLI自生长: 新增子 skill「{name}」({count} 文件) ({date})` |
| 会话日志 | 📝 | `📝 OpenCLI自生长: 新增会话日志「{name}」({date})` |
| 清理废弃 | 🧹 | `🧹 OpenCLI自生长: 清理废弃产物 — {描述} ({date})` |

#### ⏸️ Checkpoint 3 — Pre-commit 确认

所有文件写入完成后，展示待提交变更，确认后提交：

```markdown
## 待提交

```bash
git add {文件1} {文件2} ...
git commit -m "{commit message}"
```

| 文件 | 状态 | 内容 |
|------|:--:|------|
| {路径} | new | {变更描述} |
| {路径} | modified | {变更描述} |

确认提交？(y/n/跳过提交只保存文件)
```

### Step 4 — REPORT（输出摘要）

每次 audit 结束后输出结构化报告：

```markdown
## Hermes Session Harvest 报告 ({date})

| 动作 | 数量 | 详情 |
|------|:--:|------|
| 🏗️ 新增场景 | N | {场景名} |
| 🌱 新增子 skill | N | {skill 名} |
| 📝 新增会话日志 | N | {文件名} |
| 📝 更新已有场景 | N | {场景名} |
| 🧹 清理废弃 | N | {文件名} |
| ⏭️ 跳过 | N | {原因} |

**未提交变更**: 无 / {列表}
**下次建议**: {如"opencli-ux-xxx 的 run-e2e.sh 骨架待补充"}
```

## 触发机制

### 显式触发

用户说以下任意关键词即可触发：
- "沉淀" / "自生长" / "harvest" / "保存经验" / "收尾" / "归档"

### 隐式触发（强制）

当本 skill 被 OpenCLI 自生长系统的 SKILL.md 引用时，Agent 在**每次 OpenCLI 交互结束后**必须执行本 audit——这是写入 OpenCLI SKILL.md 的强制指令，不依赖用户提示。

## 防垃圾机制

| 机制 | 阈值 | 说明 |
|------|:---:|------|
| **最少复用次数** | ≥3 次 | 命令序列必须出现 3+ 次才能沉淀为场景 |
| **重合度判定** | ≥80% | 新场景与已有场景重合度超过 80% → 更新而非新建 |
| **废弃超期** | 30 天 | 从未成功跑通的脚本超过 30 天 → 候选删除 |
| **用户确认关** | — | 所有删除操作必须先向用户展示候选列表并确认 |
| **去重检查** | — | 沉淀前检查 session-log/ 是否已有相同记录 |

## 约束

- 不修改被引用的已有 skill 文件（除非明确是更新 references）
- 不拷贝被引用 skill 的脚本/config
- 删除操作必须展示候选列表 + 等待用户确认
- 沉淀操作必须在 git commit 前完成所有文件写入

## 边界条件与异常处理

### 1. Harvest 脚本不可用

若 `harvest/add-scene.sh` 或 `harvest/scaffold-skill.sh` 不存在或不可执行：

```yaml
fallback 链路:
  1. 用 Agent 路径代替: write_file 创建 references/ + edit_file 更新路由表
  2. 如果 Agent 路径也无法执行 (read-only mode) → 记录待办列表到 session-log
  3. 输出提示: "harvest 脚本不可用，已走 Agent 路径落盘，需手动 git commit"
```

### 2. Git commit 失败

若 `git commit` 失败（无 git、无权限、无暂存区）：

```yaml
fallback 链路:
  1. git 不可用 → 跳过 commit，提示用户手动提交: cd .cursor && git add ... && git commit
  2. 无变更 → 静默跳过（正常情况，非错误）
  3. 权限拒绝 → 记录错误，不阻塞 audit 流程
  4. 始终输出: "需手动 git commit: {变更清单}"
```

### 3. 并发会话冲突

若两个 Agent 同时操作同一个 session-log 或 `references/` 文件：

```yaml
预防:
  - session-log 文件名包含时间戳到秒级 → 天然去重 (session-log/{date}-{HHmmss}-{scene}.md)
  - references/ 场景文件创建前检查 exists → 已存在则追加而非覆盖
  - 路由表更新前 re-read → 避免基于过期缓存编辑
```

### 4. 路径解析失败

若 OpenCLI 自生长系统根目录无法定位：

```yaml
查找顺序:
  1. 从当前工作目录向上查找 "自生长的 OpenCLI 自动化知识体系/SKILL.md"
  2. 从 .cursor/common-skills/ 查找
  3. 未找到 → 降级为"纯报告模式"：只输出 audit 摘要，不执行任何文件沉淀
```

### 5. 部分成功回滚

若沉淀流程中断（写入了 references 但未更新路由表）：

```yaml
回滚策略:
  - references/ 新文件已创建但路由表未更新 → 不删除（可手动补路由），标记为 ⚠️
  - 路由表已更新但 test-prompts.json 未更新 → 回滚路由表那行 → 重试
  - git commit 前所有文件写入都是可逆的（手动 delete_file + git checkout）
```

## 与 OpenCLI 自生长系统的关系

```
hermes-session-harvest (本 skill)    自生长的 OpenCLI 自动化知识体系
┌──────────────────────────┐        ┌──────────────────────────────┐
│ 通用 session-end audit   │  引用  │ OpenCLI 领域知识 + 路由表    │
│ SCAN → CLASSIFY → HARVEST│ ◄──── │ harvest/add-scene.sh         │
│ ↑ 本 skill 管流程        │        │ harvest/scaffold-skill.sh     │
│                          │  调用  │ harvest/git-commit.sh         │
│ 下沉到具体 harvest 脚本 ──┼──────►│ session-log/ references/      │
└──────────────────────────┘        └──────────────────────────────┘
```

本 skill 是**流程引擎**（管"什么时候沉淀、沉淀什么、删什么"），OpenCLI 自生长系统是**知识仓库**（管"沉淀到哪里、路由如何更新"）。
