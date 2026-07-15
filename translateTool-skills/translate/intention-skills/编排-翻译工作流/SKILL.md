---
name: 编排-翻译工作流
description: 当翻译模式与 modelPolicy 已判定，需要编排试跑/全量、模型 CLI、输出路径与下游 feature 路由时使用。
---

# 核心任务

根据 `mode` + `modelPolicy` 编排：试跑门禁 → DAG 并发执行 → 校验写出。

## 何时触发

- `分析-模式判定` 输出翻译任务且 `needConfirm=false`（或用户已确认）
- 不含 `probe_models`（探测走独立子 skill）

## 输入 / 前置条件

- `mode`：`zh2en` | `en2ru` | `pipeline`
- `modelPolicy`：`single` | `all` | `list`（缺省 `single`）
- `models`：`string[]`（`list` 时必填）
- `inputPath`、`outputDir`
- 可选：`limit`、`force`、`debugPrompt`

## 编排规则

1. **全量门禁**：`en2ru` / `pipeline` 若未试跑且条数 > 50 → 🔴 CHECKPOINT，建议先 `--limit 20`
2. **zh2en**：默认可直接跑；含术语库路径则传入 glossary
3. **DAG 并发**：无依赖批并行；zh2en 成功立刻投递 en2ru；详见 `[[../../references/concurrency-dag.md]]`
4. **模型策略 → CLI**：

| modelPolicy | CLI |
|-------------|-----|
| `single` | 不加 `--multi-model`（只用优先级最高一个） |
| `all` | `--multi-model --models all` |
| `list` | `--multi-model --models <id1,id2,...>` |

5. 组装完整 CLI，路由执行节点

## 输出

- `workflowPlan`：
  - `cliArgs`
  - `modelPolicy` / `models`
  - `nextFeature`：`执行-中译英` | `执行-英译俄` | 两者（pipeline）
  - `then`：`校验-占位符与写出` → `验证-译后防错位`
  - `gate`：是否等待人审

## 下一步路由

- zh2en → `[[../../feature-skills/执行-中译英/SKILL.md]]`
- en2ru → `[[../../feature-skills/执行-英译俄/SKILL.md]]`
- pipeline → 同 CLI DAG → `[[../../feature-skills/校验-占位符与写出/SKILL.md]]` → `[[../../feature-skills/验证-译后防错位/SKILL.md]]`

## 边界

- 编排层不调用 API；实际调度在 `translateCsv.js`。
- 多进程多文件共享池不在本期。
