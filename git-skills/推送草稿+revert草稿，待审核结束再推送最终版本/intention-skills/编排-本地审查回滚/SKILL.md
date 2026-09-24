---
name: 编排-本地审查回滚
description: 当策略判定 phase=local_review，需要从当前 tip 拉出临时分支、reset 收回草稿改动供审查，并可在改完后提交最终审查版时使用。
---

# 核心任务

在**临时分支**上取消草稿提交但保留工作区改动，供用户审查重构；可选提交最终版。

## 编排顺序

1. [[../../feature-skills/确认共享分支与工作树/SKILL.md]]（确认草稿 SHA 已知；勿在共享分支上裸 reset 后长期开发）
2. [[../../feature-skills/创建临时分支并reset/SKILL.md]]
3. （用户审查/改代码——人工或后续对话）
4. 若用户声明审查完成：[[../../feature-skills/提交最终审查版/SKILL.md]]
5. [[../../feature-skills/输出验收报告/SKILL.md]]

## 前置

- `draft_commit` 已记录（否则 STOP 追问）
- 策略 `phase=local_review`

## 检查点

### 🔴 CHECKPOINT-TEMP-RESET · 🛑 STOP

执行 reset 前确认：

- 将创建的 `temp_branch` 名
- reset 模式：默认 mixed（`git reset HEAD~1`）；`--soft` 仅用户明确要求
- **不会** `reset --hard`
- 本地将相对远端落后（预期），改动回到工作区

## 失败短路

| 条件 | 动作 |
| --- | --- |
| 缺草稿 SHA | STOP |
| 用户要 hard reset | 拒绝 |
| 临时分支名已占用且含无关提交 | STOP，换名或请用户处理 |

## 输出

`orchestration`=`local_review` | `tempBranch` | `resetMode` | `finalSha`（若已提交）| `status`

## 使用示例

```text
草稿 SHA=abc1234，建 temp/review-after-draft 并 mixed reset，方便我改命名。
使用 $编排-本地审查回滚。
```
