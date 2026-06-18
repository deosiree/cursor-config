---
name: 分析-识别数据类型
description: Use when 需要确认输入是元数据(v1)还是对象数据(v2)
version: 2.0.0
tags: [json-精简超长翻译, v2, report]
metadata:
  darwin:
    parent_skill: json-精简超长翻译
---

# 核心任务

根据用户说的是"元数据"还是"对象数据"，输出数据类型标记。

## 何时触发

- 套件入口第一步

## 输入 / 前置条件

- `dataType` — `meta`(元数据) / `object`(对象数据)（由用户表述）
- `inputPath` — 文件或目录路径

## 判断规则

| 用户表述 | 输出 dataType | 默认限制 |
|---------|--------------|---------|
| "元数据" / "这是元数据" / "meta" | `meta` | `defaultMaxLen: 63` |
| "对象数据" / "这是对象数据" / "object" | `object` | 由 interpretation 决定 |
| 未明确表述 | 检查目录中文件 → 有 `.report` 则 object，否则 meta | 自动推断 |

## 输出

- `dataType`（`meta` | `object`）
- `defaultMaxLen`（仅 v1 有，默认 63）
- `routeTarget`（下个节点路径）

## 下一步路由

- `dataType = meta` → `[[../分析-输入确认/SKILL.md]]`
- `dataType = object` → `[[../../feature-skills/解析-Report文件/SKILL.md]]`

## 边界

- 它只负责判断数据类型，不负责校验 inputPath。
- 自动推断仅在目录中文件类型明确时触发，否则要求用户确认。
