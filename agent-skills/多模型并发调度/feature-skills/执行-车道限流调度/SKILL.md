---
name: 执行-车道限流调度
description: 当需要按路权模型执行加权并发调度——每个模型有独立 maxLanes、批次按优先级分配、支持动态入队和路利用率追踪时使用。
---

# 核心任务

运行 `LanePoolDispatcher`：每个 worker 维护独立 lane 池（maxLanes 上限），全局就绪队列 fill-until-full，优先高 priority 模型。

替代旧版 `runDagScheduler`（全局统一池 round-robin）。

## 何时触发

- `编排-加权调度` 输出 `concurrencyMode = weighted-lanes`
- 任何需要异构路权并发的批处理任务

## 输入 / 前置条件

- `workers[]`：从 `models.config.json` 构建的 worker 列表（含 `id`、`maxLanes`、`batchSize`、`priority`、`callBatch`）
- `batches[]`：已切批的翻译/处理单元（含 `items[]`、`prompt`、可选 `preferredWorkerId`）
- `modelCatalog`：`[[../../../translate/lib/modelCatalog.js]]`

## 调度算法

```
for each wave:
  for each worker (按 priority 升序):
    while worker.inflight < worker.maxLanes AND readyQueue 有匹配批:
      pop batch → launch on worker
  wait for any batch to complete
  release lane → re-fill
```

## Worker 构建

从模型列表构建 worker：

| 字段 | 来源 |
|------|------|
| `id` | model.id（如 `xfyun:xophunyuan7bmt`） |
| `maxLanes` | model.lanes |
| `batchSize` | model.batchSize |
| `priority` | model.priority |
| `callBatch` | 对应供应商的 API 批量调用函数 |

构建示例见 `[[../../translate/translateCsv.js]]` 中 `buildTranslateWorkerPool()`。

## 代码引用

调度器实现：`[[../../lib/laneDispatcher.js]]`（`LanePoolDispatcher` 类）

```js
const { LanePoolDispatcher } = require('../../lib/laneDispatcher');

const dispatcher = new LanePoolDispatcher({
  workers: activeWorkers,           // 从 models.config.json free tier 构建
  onWaveDone: async (info) => { /* 写 checkpoint */ },
  onBatchDone: async (info) => { /* 回填翻译结果 */ },
  verbose: true
});

const { stats } = await dispatcher.run(batches);
// stats.totalLanes, stats.completedBatches, stats.elapsedMin, stats.perWorker
```

## 路利用率追踪

每波次输出路利用快照：
```
[Lane 波次 1] 飞行=20 就绪=77 总路数=27 在用=20
  路利用: xophunyuan7bmt=20/20 Qwen3-8B=1/1 Hunyuan-MT-7B=1/1 ...
```
`stats.perWorker[i].completed` 记录每个模型的完成批次数。

## 输出

- 翻译结果回填到条目
- `{stem}_RU机翻.csv/.xlsx`（断点写入）
- `run-stats.json`（含 perWorker 分布、elapsed、吞吐）
- 错误日志 `*_errors.log`

## 下一步

→ 校验层（占位符保护 / 写出，由调用方决定）

## 边界

- 调度器只负责并发控制，不关心业务语义（翻译/审查/测试）。
- 业务语义在 `callBatch` 的 prompt 和结果解析中处理。
- 同一供应商多模型：每个模型是独立 worker，各自有 lane 限制。
