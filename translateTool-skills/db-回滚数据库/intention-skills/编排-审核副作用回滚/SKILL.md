---
name: 编排-审核副作用回滚
description: 当 rollbackScope 已确认后，编排 inspect → 人工确认 → execute → verify 的术语同意回滚主线时使用。
version: 1.0.0
tags: [db-回滚数据库, translateTool-skills, mysql]
metadata:
  darwin:
    parent_skill: db-回滚数据库
---

# 核心任务

按固定顺序驱动子 skill，确保 **先 inspect、后 execute、再 verify**。

## 何时触发

- `分析-回滚范围确认` 输出 `action=proceed` 后

## 输入 / 前置条件

- `rollbackScope`（来自分析-回滚范围确认）

## 执行顺序

```text
1. 查询-审核副作用     → rollbackPlan（4 类 ID + 摘要表）
2. [人工门禁]          → 用户确认 / 拒绝
3. 执行-软删除与解绑   → 仅 dryRun=false 且用户明确授权
4. 验证-回滚结果       → verificationReport
5. skill-output-checklist 收尾
```

## 人工门禁规则

| 条件 | 动作 |
|------|------|
| `rollbackPlan.auditCount = 0` | 停止，建议扩大 timeWindow 或改 task_name |
| `dryRun = true` | 停在步骤 1，输出 SQL 与预期结果 |
| 用户说「确认执行」「直接在数据库执行」 | `dryRun=false`，进入步骤 3 |
| `dbTarget=remote` 且无备份 | 禁止步骤 3，只输出 SQL 供 DBA |

## 输出

- `orchestrationResult`：
  - `rollbackPlan`
  - `executed`（bool）
  - `verificationReport` | null
  - `humanGateTriggered`（bool）
  - `stopReason` | null

## 下一步路由

- 正常完成 → 对照 `[[../../assets/skill-output-checklist.md]]`
- auto_approved / 手工改译 → `[[../../references/扩展场景-预翻译与工作台.md]]`

## 边界

- 一次编排只处理 **术语 audit approved** 主线；扩展场景不自动混入 execute。
- Single Dispatch：不并行调用多个 feature skill。
