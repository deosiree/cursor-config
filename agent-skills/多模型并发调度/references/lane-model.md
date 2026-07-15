# 路权并发模型（Lane-Weighted Concurrency）

## 概念

传统多模型并发用全局统一池（所有模型共享一个 `maxConcurrency`），批次 round-robin 分发。问题：
- 讯飞 20 路和硅基小模型 1 路同等对待 → 小模型拥塞、大模型空转
- 路数硬编码在代码中，换模型要改代码

**路权模型**：每个模型有独立的 `maxLanes`（路数上限）。调度器为每个模型维护独立的 sub-pool，最多同时 in-flight `maxLanes` 个批次。总路数 = Σ(maxLanes)。

## 路权表（当前配置 → `models.config.json`）

### 免费/限免池（翻译等批处理默认使用）

| # | 模型 ID | 供应商 | lanes | batchSize | priority |
|---|---------|--------|-------|-----------|----------|
| 1 | `xfyun:xophunyuan7bmt` | 讯飞星辰 | **20** | 100 | 1 |
| 2 | `siliconflow:tencent/Hunyuan-MT-7B` | 硅基流动 | 1 | 40 | 2 |
| 3 | `siliconflow:deepseek-ai/DeepSeek-R1-0528-Qwen3-8B` | 硅基流动 | 1 | 40 | 3 |
| 4 | `siliconflow:Qwen/Qwen3-8B` | 硅基流动 | 1 | 40 | 4 |
| 5 | `siliconflow:THUDM/GLM-Z1-9B-0414` | 硅基流动 | 1 | 40 | 5 |
| 6 | `siliconflow:THUDM/GLM-4-9B-0414` | 硅基流动 | 1 | 40 | 6 |
| 7 | `siliconflow:Qwen/Qwen2.5-7B-Instruct` | 硅基流动 | 1 | 40 | 7 |
| 8 | `zhipu:glm-4-flash` | 智谱AI | 1 | 40 | 8 |
| | **合计** | | **27** | | |

### 主力付费池（编码/推理等复杂任务使用）

| # | 模型 ID | 供应商 | lanes | batchSize | 价格 (input/output $/1M) |
|---|---------|--------|-------|-----------|--------------------------|
| 1 | `deepseek:deepseek-v4-pro` | DeepSeek | 500 | 40 | $0.435 / $0.87 |
| 2 | `deepseek:deepseek-v4-flash` | DeepSeek | 2500 | 40 | $0.14 / $0.28 |
| | **合计** | | **3000** | | |

## 调度时序

```
┌─────────────────────────────────────────────────┐
│              Global Ready Queue                  │
│  [batch-1] [batch-2] ... [batch-N]              │
└──────────────────────┬──────────────────────────┘
                       │ dispatch (priority order)
         ┌─────────────┼─────────────┬─────────────┐
         ▼             ▼             ▼             ▼
   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
   │ Worker A │ │ Worker B │ │ Worker C │ │ Worker Z │
   │ 20 lanes │ │ 1 lane   │ │ 1 lane   │ │ 1 lane   │
   │ 批次1-20 │ │ 批次21   │ │ 批次22   │ │ 批次27   │
   └──────────┘ └──────────┘ └──────────┘ └──────────┘
        │            │            │            │
        └────────────┴────────────┴────────────┘
                       │
                  onBatchDone → 回填结果 / 写 checkpoint
                  enqueue    → 动态投递下一阶段（pipeline）
```

## 两种规模场景

### 场景 A：大规模满路（totalEntries ≥ totalLanes × batchSize）

例如 2700 条词条、27 路免费池：

| 模型 | lanes | batchSize | 单波 in-flight 条目 |
|------|-------|-----------|-------------------|
| 讯飞 Hy-MT2-7B | 20 | 100 | 2000 |
| 硅基 6 模型 × 1 lane | 6 | 40 | 240 |
| 智谱 | 1 | 40 | 40 |
| **合计** | **27** | | **2280 条/波** |

→ 2700 ÷ 2280 ≈ **1.2 波**，预计 6~9 分钟完成（取决于最慢模型）

### 场景 B：小规模平分缩批（totalEntries < totalLanes × batchSize）

例如 270 条词条、27 路：

- 270 / 27 = 10 条/路
- batchSize 降至 `max(minBatchSize=10, ceil(270/27)) = 10`
- 每路 1 批 × 10 条 = 270 条，**1 波次完成**
- 预计 1~2 分钟（所有模型同时跑 10 条）

## 与旧版对比

| 维度 | 旧版（runDagScheduler） | 新版（LanePoolDispatcher） |
|------|------------------------|---------------------------|
| 并发模型 | 全局统一池 maxConcurrency=20 | 每 worker 独立 maxLanes |
| batch 分配 | round-robin 轮询 | priority + preferred 匹配 |
| 批大小 | 固定（zh2en=100, en2ru=40） | 从 models.config.json 读取，可缩批 |
| 路数可配 | 硬编码在 translateCsv.js | 声明式在 models.config.json |
| 免费/主力分离 | 否（所有模型混用） | 是（tier: free/primary） |
| 定价感知 | 无 | pricing + pricing_last_checked |
| 路利用率追踪 | 无 | perWorker stats |

## 配置迁移

从旧 `.env` 模型配置迁移到 `models.config.json`：

| 旧 `.env` 字段 | 新位置 |
|---------------|--------|
| `XFYUN_MODEL=xophunyuan7bmt` | `models[].id = "xfyun:xophunyuan7bmt"` |
| `SILICONFLOW_MODEL=tencent/Hunyuan-MT-7B` | `models[].id = "siliconflow:tencent/Hunyuan-MT-7B"` |
| `XFYUN_CONCURRENCY=20` | `models[].lanes = 20` |
| `SILICONFLOW_CONCURRENCY=8` | 每个硅基模型 `lanes = 1` |
| `TRANSLATE_MULTI_MODEL=on` | 任务分类自动判定 `batch → all free tier` |
| 无定价字段 | `models[].pricing + pricing_last_checked` |
