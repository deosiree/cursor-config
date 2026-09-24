---
name: 输出验收报告
description: 当任一编排阶段结束（成功、blocked 或 conflict）时，需要输出统一验收字段与下一步建议时使用。
---

# 核心任务

汇总本阶段结果，给出可粘贴的验收块；不执行新的破坏性 git 操作。

## 输入

上一编排的 `orchestration`、`status`、关键 SHA、风险标志。

## 报告模板

```text
phase: <push_draft|local_review|publish_final|…>
status: <done|blocked|conflict|awaiting_confirm>
shared_branch: <name>
draftSha: <or n/a>
tempBranch: <or n/a>
finalSha: <or n/a>
revertSha: <or n/a>
pushed: <true|false>
tempDeleted: <true|false|n/a>
riskFlags: <list>
nextAction: <一句话>
远端预期历史: 草稿 →（同事）→ revert → 最终版
```

## 规则

1. `push_draft` 成功但未展示 `draftSha` → 验收失败，必须补 [[../记录草稿SHA/SKILL.md]]。
2. `publish_final` 成功应能说明：未使用 force；临时分支已删或明确保留原因。
3. `conflict` 时列出冲突文件与用户可选 continue/abort。

## 输出

与父级输出契约对齐的完整字段集。

## 使用示例

```text
编排-推送草稿刚结束，出验收报告。使用 $输出验收报告。
```
