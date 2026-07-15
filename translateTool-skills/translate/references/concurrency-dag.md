# 并发与流水线（DAG）+ 路权模型

## 目标

同一 `translateCsv.js` 进程内：

1. **无依赖并行**：多批 `zh2en_batch`、已有英文的 `en2ru_batch` 可同时入池
2. **有依赖流水线**：zh2en 某批成功后，立刻投递对应 `en2ru_batch`
3. **路权并发调度**（v3.0）：每个模型有独立 `maxLanes`，优先填满高 priority 模型的 lane；调度器为 `LanePoolDispatcher`

## 路权模型（v3.0 新增）

> 完整说明见 `[[../../多模型并发调度/references/lane-model.md]]`

| 模型 | 供应商 | lanes | batchSize | priority |
|------|--------|-------|-----------|----------|
| Hy-MT2-7B | 讯飞星辰 | **20** | 100 | 1 |
| Hunyuan-MT-7B | 硅基流动 | 1 | 40 | 2 |
| DeepSeek-R1-0528-Qwen3-8B | 硅基流动 | 1 | 40 | 3 |
| Qwen3-8B | 硅基流动 | 1 | 40 | 4 |
| GLM-Z1-9B-0414 | 硅基流动 | 1 | 40 | 5 |
| GLM-4-9B-0414 | 硅基流动 | 1 | 40 | 6 |
| Qwen2.5-7B-Instruct | 硅基流动 | 1 | 40 | 7 |
| glm-4-flash | 智谱AI | 1 | 40 | 8 |
| **合计** | | **27** | | |

模型配置声明式定义在 `[[../../多模型并发调度/lib/models.config.json]]`，换模型/调路数只需编辑该文件。

### 调度算法（LanePoolDispatcher）

```
for each wave:
  for each worker (按 priority 升序):
    while worker.inflight < worker.maxLanes AND readyQueue 有匹配批:
      pop batch → launch on worker
  wait for any batch to complete
  release lane → re-fill
```

替代旧版 `runDagScheduler`（全局统一池 round-robin）。

## CLI mode（翻译方向）

| mode | 初始就绪 | 动态入队 |
|------|----------|----------|
| `zh2en` | 仅 zh2en 批 | 无 |
| `en2ru` | 仅 en2ru 批 | 无 |
| `pipeline` | zh2en 批 + 已有英文的 en2ru 批 | zh2en 成功 → en2ru |

```bash
# 全模型路权并发（推荐）
node translateCsv.js <input> <out> --mode en2ru --multi-model --models all

# Pipeline（中→英→俄流水线）
node translateCsv.js <input> <out> --mode pipeline --limit 20
```

## 断点

- 含俄文阶段：每波次写 `{stem}_RU机翻.csv`
- 续跑：同文件 + skipIfFilled

## 与旧版对比

| 维度 | 旧版（runDagScheduler） | 新版（LanePoolDispatcher） |
|------|------------------------|---------------------------|
| 并发模型 | 全局统一池 maxConcurrency=20 | 每 worker 独立 maxLanes |
| batch 分配 | round-robin 轮询 | priority + lane fill |
| 路数 | 硬编码（xfyun=20, sf=8） | 声明式 models.config.json |
| 免费/主力分离 | 否 | 是（tier: free/primary） |
| 定价感知 | 无 | pricing + pricing_last_checked |

## 不在范围

- 多 CLI 进程共享内存池
- 同一批对多模型 racing 取最快
- OCR 扫图翻译（模型仅入库 + 探测）
