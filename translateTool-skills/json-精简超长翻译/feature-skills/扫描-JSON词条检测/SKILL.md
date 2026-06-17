---
name: 扫描-JSON词条检测
description: Use when 需要扫描 JSON 文件中指定语种字段的 UTF-8 字节长度
version: 1.0.0
tags: [json-精简超长翻译, translateTool-skills]
metadata:
  darwin:
    parent_skill: json-精简超长翻译
---

# 核心任务

运行 `scripts/check-russian.js --mode detect`，递归扫描 JSON 文件，输出检测报告。

## 何时触发

- `confirmedMeta` 已确认，需要检测具体词条长度时

## 输入 / 前置条件

- `confirmedMeta`（含 inputPath、fieldPath、byteLimit）

## 执行方式

```bash
node scripts/check-russian.js \
  --input "<inputPath>" \
  --field-path "<fieldPath>" \
  --byte-limit <byteLimit> \
  --mode detect
```

## 输出

- `detectionReport`（JSON）：
  - `totalFiles`（扫描的文件数）
  - `totalEntries`（总词条数）
  - `overlongCount`（超标词条数）
  - `overlongEntries`（数组，每项含 index、source、bytes、limit、charBudget）

## 下一步路由

- `detectionReport` → `[[../../intention-skills/编排-精简工作流/SKILL.md]]`

## 边界

- 它只负责运行检测脚本和输出报告，不负责判断流程走向。
- 不修改任何输入文件。
