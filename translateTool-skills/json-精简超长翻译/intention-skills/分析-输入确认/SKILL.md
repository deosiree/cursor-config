---
name: 分析-输入确认
description: Use when 需要校验用户输入的 inputPath、fieldPath、byteLimit 参数是否有效
version: 1.0.0
tags: [json-精简超长翻译, translateTool-skills]
metadata:
  darwin:
    parent_skill: json-精简超长翻译
---

# 核心任务

确认用户提供的输入参数是否完整、路径是否可达、字段路径在 JSON 中是否有效。

## 何时触发

- 套件被调用时的第一步，无论任务类型

## 输入 / 前置条件

- `inputPath` — 文件或目录路径（必填）
- `fieldPath` — JSON 字段点号路径（可选，默认 `translation.ru_RU`）
- `byteLimit` — UTF-8 字节上限（可选，默认 63）

## 输出

- `confirmedMeta` 对象：
  - `inputPath`（规范化为绝对路径）
  - `isDirectory`（是否为目录）
  - `fieldPath`（确认后的字段路径）
  - `byteLimit`（确认后的字节限制）
  - `outputSuffix`（输出后缀，默认 `_new`）
  - `action`（`proceed` | `abort`）
  - `missingFacts`（缺失信息的列表）

## 下一步路由

- `action = proceed` → `[[../编排-精简工作流/SKILL.md]]`
- `action = abort` → 向用户反馈 `missingFacts`，等待补充

## 边界

- 它只负责校验参数的有效性，不负责判断流程应该缩短还是跳过。
- 如果 `inputPath` 是目录，触发递归扫描标记但不实际执行扫描。
