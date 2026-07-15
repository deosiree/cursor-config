---
name: 探测-模型可用性
description: 当需要验证讯飞/硅基流动/智谱目录内模型是否可用（测模型、probe models、API 探测）时使用；不执行词条翻译。
---

# 核心任务

对 translate 套件登记的全部模型做极短 `chat/completions` ping，输出可用性报告。

## 何时触发

- 「测一下模型」「哪些模型可用」「probe models」「硅基流动哪些可用」「API 探测」
- 主 skill 任务类 `probe_models`（不进 zh2en/en2ru/pipeline）

## 命令

> ⚠️ 本 feature-skill 已迁移至 `[[../../../多模型并发调度/feature-skills/探测-模型可用性/SKILL.md]]`。
> 探测脚本新位置：

```bash
cd agent-skills/多模型并发调度
node scripts/probe-models.js
# 指定报告目录:
node scripts/probe-models.js "evals"
# 检查定价过期:
node scripts/probe-models.js --check-pricing
```

默认报告：`evals/last-probe-models.md`

## 输入 / 前置条件

- 仓库根目录 `.env`（`XFYUN_API_KEY` / `SILICONFLOW_API_KEY` / `ZHIPU_API_KEY`，可只填部分）
- 模型目录：`[[../../lib/modelCatalog.js]]`、`[[../../references/providers-siliconflow.md]]`

## 行为要点

1. 遍历：讯飞当前模型、硅基 `SILICONFLOW_MODELS` 全量、智谱当前模型
2. 纯文本 `ping`；视觉/OCR 若拒绝文本则标记 `unsupported_for_text_ping`（不等于 Key 无效）
3. Key 为空 → `skipped_no_key`，进程不失败
4. 汇总：`usable_text` / `usable_mt` / `failed` / `skipped_no_key`

## 输出

- Markdown 报告表：`provider | modelId | capability | ok | latency_ms | status | error`
- 控制台逐模型一行状态

## 边界

- 不翻译词条文件；不修改 `.env`。
- 不把 Key 写入报告（仅 mask）。
