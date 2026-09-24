---
name: 编排-创建沙盒
description: 当策略已判定 create，需要按固定顺序串联路径解析、建 worktree、可选恢复 stash、切工作区与验收报告时使用。
---

# 核心任务

按顺序调用功能层，完成沙盒创建；任一步 `blocked` 则停止后续。

## 编排顺序

1. [[../../feature-skills/解析沙盒路径与命名惯例/SKILL.md]]
2. [[../../feature-skills/创建worktree与分支/SKILL.md]]
3. 若 `apply_stash=true`：[[../../feature-skills/恢复stash到沙盒/SKILL.md]]
4. [[../../feature-skills/切换agent工作区/SKILL.md]]
5. [[../../feature-skills/输出验收报告/SKILL.md]]

## 前置

- [[../分析-沙盒现状/SKILL.md]] 显示主仓干净
- `sandbox_branch`、`base_branch`（默认 develop）已解析

## 检查点

### 🔴 CHECKPOINT-创建 · 创建前确认 · 🛑 STOP

在调用 [[../../feature-skills/创建worktree与分支/SKILL.md]] **之前**，必须先输出确认块：

- `repo`、`base_branch`（及 tip SHA，若已读取）
- 将建 `sandbox_path` / `sandbox_branch`
- `apply_stash` / `stash_ref`（或「不恢复 stash」）
- `push=false`（除非用户已授权）

规则：

1. 缺 `repo` 或 `sandbox_branch` → `status=awaiting_confirm`，禁止 `worktree add`。
2. 字段齐全时：同一轮可在确认块后继续执行（用户完整开沙盒指令视为授权）；仍须先写出确认块再执行。
3. 用户只说「开个沙盒」而无分支名 → 追问，禁止猜测分支名。

## 失败短路

| 条件 | 动作 |
| --- | --- |
| 主仓脏 | STOP，不建 worktree |
| 路径或分支已占用 | STOP，报告占用方 |
| stash 冲突 | 保留 stash，跳过 drop，仍可报告沙盒已建 |

## 输出

`orchestration`=`create` | `stepsDone[]` | `status` | `sandboxPath` | `sandboxBranch` | `stashApplied`

## 使用示例

```text
策略已是 create：apex_dev + develop → 分支 devmgr，apply stash@{0}。
使用 $编排-创建沙盒。
```
