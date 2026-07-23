---
name: 挖掘-跨模块旅程
description: 挖掘跨模块端到端旅程：journeys 正文 + handoffs + journey_id 金标；强调模块切换与交接物；禁把 atoms 当深度主体。
version: 1.0.0
tags: [rag, journeys, handoff, golden-qa]
metadata:
  tier: feature
  parent: 批量设计多元语料
---

# 目标

写出「用户真实跨菜单闭环」：谁在哪一模块做什么、交给下一模块什么数据/状态；并挂上可门禁的旅程矩阵与金标。

## 何时使用

- 编排要求旅程矩阵全绿
- 用户要 Excel 闭环、去重回填、术语学习入术语库等跨模块故事
- 单模块已有但仍 FAIL「journeys」

## 输入

- 候选闭环（业务一句话）
- 涉及模块与视图证据
- `journeys-matrix.yaml` 行结构
- few-shot：[[../../assets/few-shot-example/J-EXCEL-LOOP-excerpt.md]]

## 步骤

1. **定 journey_id**  
   规则：`J-` + 大写短码（动词/对象，`<20` 字符），例：`J-EXCEL-LOOP`、`J-DEDUP-BACKFILL`。  
   同一闭环禁止换 id；写入矩阵 key 与正文 `journey_id:` 行。

2. **写旅程主文档**（`styles/journeys/<名>.md`）  
   必备节：**前置**、**步骤**（逐步标【模块】）、**模块切换**、**失败**、**证据**。  
   每步写清**交接物**（文件 / 任务状态 / 已选词条等）。  
   UI 文案同样源码可证。标题下固定两行：

   ```markdown
   > journey_id: `J-EXCEL-LOOP`
   > modules: workbench → entry → toolbox
   ```

3. **handoffs（可选但推荐）**  
   `journeys/handoffs/` 单跳细文；主旅程链接过去，避免主文件爆炸。

4. **atoms**  
   仅作召回切片时保留短文件；**深度在旅程与 handoff**，禁止只靠 atoms 充篇数。

5. **金标**  
   为该 `journey_id` 写 ≥ 阈值条 Q/A（默认 6）。问法至少覆盖：入口、模块切换点、失败文案、交接物、收尾动作。  
   jsonl 行须含 `"journey_id":"<同一ID>"`、`"tags":["journey",...]`、`"split":"test|runtime"`。

6. **矩阵**  
   `journeys-matrix.yaml` 对应行：`title`/`path`/`modules`/`hops`；脚本可验全绿。

## 输出

- 旅程 md + 可选 handoffs
- 矩阵行绿
- 该 journey 的金标行

## 失败分支

| 情况 | 动作 |
|------|------|
| 闭环依赖未实现功能 | 标「产品未提供」；矩阵可记 blocked，不假绿 |
| 步骤跨仓（外部系统） | 写清边界；失败节写「仓外不可证」 |
| 与模块 SOP 冲突 | 以源码为准修订；旅程胜于过时 SOP |

## 反例

- 旅程只有步骤列表、无「模块切换」与交接物
- 把单模块 SOP 改个标题当旅程
- 矩阵标绿但缺失败/证据节

## 验收

- 正文含五类关键节（与门禁脚本 `JOURNEY_SECTION_KEYS` 对齐）
- 至少一次真实模块切换描述
- 金标带同一 `journey_id`
