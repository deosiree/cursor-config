---
name: 编排-精简工作流
description: Use when 需要根据检测报告决定是走缩短流程还是直接跳过
version: 1.0.0
tags: [json-精简超长翻译, translateTool-skills]
metadata:
  darwin:
    parent_skill: json-精简超长翻译
---

# 核心任务

读取检测报告，判断是否有超标词条，决定下一步路由。

## 何时触发

- `分析-输入确认` 输出 `action = proceed` 后

## 输入 / 前置条件

- `confirmedMeta` — 输入确认阶段的输出
- `detectionReport` — `扫描-JSON词条检测` 的输出（JSON 格式）

## 输出

- `workflowPlan`：
  - `hasOverlong`（boolean）
  - `overlongEntries`（超标词条列表，含每条字符预算）
  - `nextAction`（`shorten` | `copy_only`）
  - `nextRoute`（要路由到的 feature 节点）

## 下一步路由

- `nextAction = shorten` → `[[../../feature-skills/执行-俄语LLM缩短/SKILL.md]]`
- `nextAction = copy_only` → `[[../../feature-skills/执行-回验输出/SKILL.md]]`（仅复制不缩短）

## 边界

- 它只负责根据检测报告做流程决策，不执行缩短也不执行回验。
