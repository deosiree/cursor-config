---
name: 编排-安全删除沙盒
description: 当策略已判定 delete，需要在风险检查通过并获确认后，按「先移除 worktree、再删本地分支」安全拆除沙盒时使用。
---

# 核心任务

串联删除链路；**默认不做 merge**；未过检查点禁止 remove/branch -d/-D。

## 编排顺序

1. [[../../feature-skills/解析沙盒路径与命名惯例/SKILL.md]]
2. [[../../feature-skills/检查沙盒脏树与合并状态/SKILL.md]]
3. 🔴 CHECKPOINT-删除风险（见下）通过后：
4. [[../../feature-skills/移除worktree/SKILL.md]]
5. [[../../feature-skills/删除本地沙盒分支/SKILL.md]]
6. [[../../feature-skills/输出验收报告/SKILL.md]]

## 🔴 CHECKPOINT-删除风险 · 🛑 STOP

必须展示并获确认（详见 [[../../references/安全删除检查点.md]]）：

- `sandbox_path` / `sandbox_branch`
- 是否脏树；是否已合入 `base_branch`
- 是否有远端跟踪；`force_remove_worktree` / `allow_delete_unmerged` / `delete_remote` 取值

| 风险 | 未授权时 | 授权字段 |
| --- | --- | --- |
| 脏树 | STOP | `allow_discard_dirty` 或用户要求先 stash 再删 |
| 未合入基线 | STOP 或 handoff merge | `allow_delete_unmerged=true`（放弃） |
| worktree 占用/残留 | STOP | `force_remove_worktree=true`（二次确认） |
| 删远端 | 跳过 | `delete_remote=true` |

受保护分支名命中 → 立即 `blocked`，永不删除。

## 输出

`orchestration`=`delete` | `riskFlags[]` | `confirmed` | `stepsDone[]` | `status`

## 边界

- 不调用 merge/cherry-pick。
- 用户说「合进去再删」→ 回 [[../策略-创建或删除/SKILL.md]] 改 `handoff_merge`。

## 使用示例

```text
策略已是 delete：路径 apex_devmgr，分支 devmgr，未合入，用户确认放弃。
使用 $编排-安全删除沙盒。
```
