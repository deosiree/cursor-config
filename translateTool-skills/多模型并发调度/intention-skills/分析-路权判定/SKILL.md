---
name: 分析-路权判定
description: 当模型列表已确认，需要根据各模型的 lanes 和 batchSize 计算总路数、路权分配方案，并生成批次分配计划时使用。
---

# 核心任务

根据已确认的模型列表，计算 `totalLanes = Σ lanes`，生成路权分配表，并根据总条目数决定批次大小策略（满批 vs 平分缩批）。

## 何时触发

- `分析-任务分类与模型提案` 输出已确认的模型列表（needConfirm=false）
- 用户已明确指定模型列表（`--models list`）

## 输入 / 前置条件

- `confirmedModels`：`Array<modelConfig>`（每个含 `id`、`lanes`、`batchSize`、`priority`）
- `totalEntries`：待处理条目总数
- `minBatchSize`：最小批大小（默认 10，避免 API 调用碎片化）
- `modelCatalog`：`[[../../../translate/lib/modelCatalog.js]]`

## 路权计算

```
totalLanes  = Σ(model.lanes)
laneShare   = model.lanes / totalLanes   // 该模型占总路数的比例
batchCount  ≈ totalEntries / batchSize   // 总批次数
```

### 两大场景

**场景 A：大规模满路（totalEntries ≥ totalLanes × batchSize）**
- 每个模型按 `batchSize` 切批
- 调度器让 lane 多的模型同时 in-flight 更多批
- 理论 in-flight 条目数 = Σ(lanes × batchSize)

**场景 B：小规模平分缩批（totalEntries < totalLanes × batchSize）**
- 每条路分配 ≈ totalEntries / totalLanes 条
- 缩小 batchSize 至 `max(minBatchSize, ceil(totalEntries / totalLanes))`
- 避免"路比条目多"的碎片化

## 计算示例

**例 1：2700 条词条 / 27 路（大规模满路）**

| 模型 | lanes | batchSize | 每波次条目 | 批次/模型·波 |
|------|-------|-----------|-----------|-------------|
| 讯飞 Hy-MT2-7B | 20 | 100 | 2000 | 20 批 |
| 硅基 6 模型 | 1×6 | 40 | 240 | 6 批 |
| 智谱 | 1 | 40 | 40 | 1 批 |
| **合计** | **27** | — | **2280 条/波** | **27 批/波** |

→ 2700 条 ≈ 2 波次完成（第一波 2280，第二波 420）

**例 2：270 条词条 / 27 路（小规模平分缩批）**

- 270 / 27 = 10 条/路
- batchSize 降至 10（minBatchSize）
- 每路 1 批 × 10 条 = 270 条一批次完成

## 输出

- `totalLanes`：总路数
- `laneAllocation`：`[{ modelId, lanes, batchSize, batchesPerWave, entriesPerWave }]`
- `scenario`：`full_batch` | `shrink_batch`
- `estimatedWaves`：预估波次数
- `batchStrategy`：`{ actualBatchSize, batchesTotal }`

## 下一步

→ `[[../编排-加权调度/SKILL.md]]`

## 边界

- 只做路权计算和批次大小决策，不执行调度。
- 视觉/OCR 模型不应出现在输入列表中（由上游过滤）。
- batchSize 下限 minBatchSize=10，防止 API 调用过于碎片化。
