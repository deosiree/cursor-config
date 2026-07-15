---
name: 探测-模型可用性
description: 当需要验证 models.config.json 中登记的全部模型是否可达、检查定价是否过期、输出路权状态报告时使用；不执行实际任务。
---

# 核心任务

遍历 `models.config.json` 全部模型条目，做极短 `chat/completions` ping，输出可用性 + 定价过期 + 路权状态报告。

## 何时触发

- 「测一下模型」「哪些模型可用」「probe models」「API 探测」
- 翻译/批处理之前的预备步骤
- `定价过期检查` — 付费模型超过 30 天未确认定价时提醒

## 命令

```bash
cd agent-skills/多模型并发调度
# 遍历 models.config.json 全量模型
node scripts/probe-models.js

# 指定报告目录
node scripts/probe-models.js "evals"

# 检查定价过期
node scripts/probe-models.js --check-pricing
```

## 输入 / 前置条件

- `models.config.json`：`[[../../lib/models.config.json]]`
- 仓库根目录 `.env`（各供应商 Key，可只填部分）
- `modelCatalog.js`：`[[../../../translate/lib/modelCatalog.js]]`

## 行为要点

1. **遍历全量模型**：`listAllModels()` → 每个做文本 ping
2. **按 provider 分组**：未配 Key → `skipped_no_key`
3. **视觉/OCR**：若拒绝文本 ping → `unsupported_for_text_ping`（不等于不可用）
4. **定价检查**：`listStalePricingModels()` → 标记 `pricing_stale`
5. **路权状态**：输出每个模型的 `lanes` 字段

## 输出

报告包含：

- **汇总**：`usable_text` / `usable_mt` / `failed` / `skipped_no_key` / `pricing_stale`
- **明细表**：
  | provider | modelId | lanes | capability | ok | latency_ms | status | pricing_stale | error |

```
## 路权总览
- 免费池总路数：27（讯飞 20 + 硅基 6 + 智谱 1）
- 主力池总路数：3000（deepseek-v4-pro 500 + v4-flash 2500）
- 可用路数（有 Key 且 ok）：待探测确认
```

## 边界

- 不执行翻译/审查/任何实际任务，只做 ping。
- 不修改 `.env` 或 `models.config.json`。
- 不把 Key 写入报告（仅 mask）。
