---
name: 确认共享分支与工作树
description: 当任一编排开始前，需要确认当前/目标共享分支、工作树是否允许继续、以及草稿 SHA 是否齐备时使用。
---

# 核心任务

做阶段门禁检查：分支、干净度、关键 SHA；不修改历史。

## 输入

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `repo` | 是 | — |
| `shared_branch` | 否 | 默认 `develop` |
| `expected_phase` | 是 | `push_draft` / `local_review` / `publish_final` |
| `draft_commit` | `local_review`/`publish_final` | — |
| `require_clean` | 否 | 默认：push_draft 与 publish_final 开始前为 true；local_review 在 reset 前视情况 |

## 检查

```bash
git -C "<repo>" branch --show-current
git -C "<repo>" status --short
git -C "<repo>" show -s --oneline <draft_commit>   # 若需要
```

## 规则

1. `push_draft`：应能切换到或已在 `shared_branch`；未提交改动应纳入即将提交的草稿，否则列路径 STOP。
2. `local_review`：必须有 `draft_commit`；警告「勿在共享分支上裸 reset 后长期开发」。
3. `publish_final`：工作树宜干净；`draft_commit` 与 `final_commit`（或 temp tip）必须可解析。

## 输出

`sharedBranch` | `currentBranch` | `worktreeClean` | `draftShaOk` | `gate`∈{`pass`,`blocked`} | `blockReason`

## 边界

- 不 push / reset / revert
- 不擅自 `checkout` 除非编排已授权且用户要求

## 使用示例

```text
expected_phase=publish_final，draft=abc1234，检查 develop 是否可 revert。
使用 $确认共享分支与工作树。
```
