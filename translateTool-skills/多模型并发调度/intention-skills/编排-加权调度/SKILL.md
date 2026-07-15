---
name: 编排-加权调度
description: 当路权分配方案已确定，需要编排 CLI 参数、组装批次、路由到车道限流调度器时使用。
---

# 核心任务

根据路权分配方案，编排 CLI 参数（`--concurrency weighted-lanes` / `--lane-config`），构造批次单元，路由到 `执行-车道限流调度`。

## 何时触发

- `分析-路权判定` 已输出 `laneAllocation` 和 `batchStrategy`

## 输入 / 前置条件

- `laneAllocation`：路权分配表
- `batchStrategy`：批大小策略
- `taskConfig`：任务相关配置（inputPath、outputDir 等，由调用方传入）
- `modelCatalog`：`[[../../../translate/lib/modelCatalog.js]]`

## 编排规则

1. **批大小选择**：使用 `batchStrategy.actualBatchSize`（可能被路权判定缩批）
2. **批次构造**：将条目按 batchSize 切批
3. **CLI 组装**：
   - `--concurrency weighted-lanes`（启用路权模型）
   - `--lane-config <path to models.config.json>`（或 CLI 直接传模型列表）
4. **调度器路由**：调用 `LanePoolDispatcher`

### CLI 映射

| 并发模式 | CLI |
|---------|-----|
| 加权路权（默认） | `--concurrency weighted-lanes` |
| 旧版统一池（legacy） | `--concurrency legacy` |
| 单模型 | 不加并发参数 |

## 输出

- `workflowPlan`：
  - `concurrencyMode`：`weighted-lanes` | `legacy` | `single`
  - `models`：确认的模型 id 列表
  - `laneAllocation`：路权分配表
  - `cliArgs`：完整 CLI 参数
  - `nextFeature`：`执行-车道限流调度`
  - `gate`：是否已过人工确认门禁

## 下一步路由

→ `[[../../feature-skills/执行-车道限流调度/SKILL.md]]`

## 边界

- 编排层不调用 API，实际调度在 `laneDispatcher.js` / `LanePoolDispatcher`。
- 多进程多文件共享池不在本期。
