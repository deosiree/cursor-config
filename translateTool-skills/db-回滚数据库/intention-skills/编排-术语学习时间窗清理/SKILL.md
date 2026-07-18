---
name: 编排-术语学习时间窗清理
description: 当用户要按时间窗清理术语学习（audit）相关数据时，编排 dry-run inspect → 人类确认 → apply。
version: 1.0.0
tags: [db-回滚数据库, translateTool-skills, mysql, term_day_cleanup]
metadata:
  darwin:
    parent_skill: db-回滚数据库
---

# 核心任务

驱动 `term_day_cleanup`：只清术语学习相关时间窗数据，不是全库本日 INSERT。

## 何时触发

- 模式判定为 `term_day_cleanup`
- 用户说「清今天术语学习 / 按日清理 audit / 删术语学习时间窗」

## 流程

1. 确认库非空（有 `term_agent_audit`）；否则先 restore 完好 dump
2. 跑 `scripts/term-day-cleanup.ps1`（默认 dry-run）
3. 展示 audit 计数与样本 → **人类确认**
4. 再跑 `-ConfirmApply`（可选 `-IncludeApprovedSideEffects`）
5. 汇报 markedRejected / 副作用条数

## 边界

- 禁止静默 `-ConfirmApply`
- 禁止扩展为「删本日所有表新增」
