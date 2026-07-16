---
name: 执行-俄语LLM缩短
description: Use when 需要将超长的俄语翻译词条缩短到指定 UTF-8 字节限制内。必须先跑规则层 T0，仅仍超长条目才调 LLM。
version: 2.1.0
tags: [json-精简超长翻译, translateTool-skills]
metadata:
  darwin:
    parent_skill: json-精简超长翻译
---

# 核心任务

按检测报告提供的超标词条和字节上限缩短俄语翻译。**禁止跳过规则层直接 LLM。**

## 何时触发

- `workflowPlan.nextAction = shorten`
- v2 CLI `shorten-from-report-dir.js` 的 T1 阶段（`pending.length > 0`）

## 输入 / 前置条件

- `workflowPlan.overlongEntries`（去重后，含 `actualMax`、`overBy`、`charBudget`）
- **必须先执行** `lib/ruleShorten.js` → 仅 `pending` 进入本步骤

## 三阶段流水线

| 阶段 | 负责 | 默认参数 |
|------|------|---------|
| T0 规则 | `ruleShortenToLimit` | 零 API |
| **T1 LLM（本 skill）** | `shorten-from-report-dir.js` | DeepSeek batch≤12 parallel=3 |
| T2 截断 | `truncateUtf8Boundary` | 仅 T1 仍超长 |

## 缩短规则（写入 prompt + T0 共用）

1. **先缩写长词**：`дискретизации`→`дискр.`，`максимальное`→`макс.`，`автоматическая`→`авто`
2. **删冗余修饰**：`временной`→`врем.` 或删除
3. **换短近义词**：`назначенного`→`задан.`
4. **保留下划线** `_`（复合字段名）
5. **Инф. 后保留介词**：`Инф. о файле` ✓，`Инф. файле` ✗

## Worker 选择（实跑硬约束）

| Worker | batch 上限 | 说明 |
|--------|-----------|------|
| DeepSeek（默认） | 12~15 | v2 小目录推荐 |
| 讯飞 xfyun | **3** | ≥10 条常 180s 超时 |

```bash
# 默认
node scripts/shorten-from-report-dir.js <dbDir>
# 讯飞
node scripts/shorten-from-report-dir.js <dbDir> --models xfyun:xophunyuan7bmt --batch-size 3
```

## 输出

- `shortenMap`（source → 缩短后俄文）
- `shorteningLog`（ruleOk / llmOk / truncated 计数）

## 下一步路由

- `shortenMap` → `[[../执行-回验输出/SKILL.md]]` 或 CLI 内 `verifyDicAgainstReport`

## 边界

- 不负责回验；缩短后必须 verify。
- **禁止**每轮重跑已全部 OK 的条目。
- max-rounds 默认 **2**（非 3）；第 3 轮截断质量差，改由 T2 兜底。

## 🚫 反模式

| 反模式 | 正确做法 |
|--------|---------|
| 17 条全送 LLM | 先 T0，通常可消掉 50%+ |
| 讯飞 batch=15 | batch≤3 |
| 3 轮全量重跑 | 只重试 `still` 列表 |
