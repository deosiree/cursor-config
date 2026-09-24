---
name: 编排-推送草稿
description: 当策略判定 phase=push_draft，需要按序确认工作树、提交并推送草稿、记录草稿 SHA 并给出验收报告时使用。
---

# 核心任务

串联功能层，把草稿安全推上共享分支并**强制留下 SHA**。

## 编排顺序

1. [[../../feature-skills/确认共享分支与工作树/SKILL.md]]
2. [[../../feature-skills/提交并推送草稿/SKILL.md]]
3. [[../../feature-skills/记录草稿SHA/SKILL.md]]
4. [[../../feature-skills/输出验收报告/SKILL.md]]

## 前置

- [[../策略-选择阶段/SKILL.md]] 给出 `phase=push_draft`
- `shared_branch` 已解析（默认 `develop`）

## 检查点

### 🔴 CHECKPOINT-DRAFT-PUSH · 🛑 STOP

在真正 `git push` 前输出：

- `repo`、`shared_branch`
- 将提交的变更摘要（`git status` / `git diff --stat`）
- 提交说明草稿
- 确认**不是** force push

缺确认 → `status=awaiting_confirm`，禁止 push。

## 失败短路

| 条件 | 动作 |
| --- | --- |
| 不在共享分支且用户未授权切换 | STOP |
| 用户要求 `--force` | 改 `handoff_force_push`，本编排结束 |
| push 失败 | 报告远端错误，不进入「已记录 SHA」成功态 |

## 输出

`orchestration`=`push_draft` | `stepsDone[]` | `draftSha` | `status`

## 使用示例

```text
phase=push_draft，shared=develop，把当前改动作为草稿推上去。
使用 $编排-推送草稿。
```
