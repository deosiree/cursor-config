---
name: 执行-回验写出
description: Use when 硬门禁 + DeepSeek 验证后旁路写出 _已压63
---

# 执行-回验写出

硬门禁（`lib/ruQualityGate.js`）：字节≤limit、无 CJK、无括注/可译英文。

DeepSeek：`prompts/prompt-batch-ru-verify.md`；FAIL → 重投缩短（≤ max-rounds）。

写出：`*_已压63.xlsx/.csv` + `excel-compress-verify.json`。

`recommendDeliver` 仅当硬门禁全绿且已跑 DeepSeek。
