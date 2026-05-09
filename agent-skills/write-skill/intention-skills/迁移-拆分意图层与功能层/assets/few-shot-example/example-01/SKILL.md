---
name: 分析-i18n链路
description: 当仓库已经存在国际化实现，且需要在退化、编排、功能路由或新增策略前先还原真实运行链路与源码落点时使用。
---

# 分析-i18n链路

## RED

- 没有本节点时，agent 容易在链路事实不足时直接给迁移策略、总方案或功能节点
- 常见失败是：
  - 只列文件清单，不解释运行链路
  - 不判断旧 runtime 是否还存在
  - 不输出后续应进入哪个意图节点

## GREEN

- 本节点既是独立分析 skill，也是其他意图节点的公共事实层
- 在事实不足时，优先产出：
  - 链路时序
  - 源码落点
  - `chainConfidence`
  - `legacyPresenceAssessment`
  - `newI18nReadinessAssessment`
  - `candidateNextIntentions`

## REFACTOR

- 若输出只有分析文档、不能支撑后续路由，优先补 `candidateNextIntentions` 与 `analysisBlockingUnknowns`
- 若误触发到“明确只差一个功能点”的场景，收紧 should-not-trigger
- 若模板层或功能层问题已明确，不要继续堆分析正文，应交还给对应意图节点

## Overview

这个 skill 不只是独立的分析节点，还是其他意图 skill 的公共前置能力。

它必须回答两类问题：

1. 当前 i18n 链路怎么跑。
2. 后续策略、编排或功能路由能否基于这些事实继续推进。

## 消费模式

### `direct-analysis-mode`

- 用户明确要求先分析链路
- 当前目标是沉淀时序图、参与者和源码落点

### `supporting-analysis-mode`

- `编排-i18n迁移` 需要方案矩阵的事实基础
- `路由-选择功能子skill` 需要先判断功能缺口
- 迁移类策略节点需要先判断 legacy 复杂度、中间态风险或 readiness

## Required Outputs

1. `entryInventory`
2. `scenarioBreakdown`
3. `sequenceDiagram`
4. `sourceAnchors`
5. `riskAndConstraints`
6. `chainConfidence`
7. `legacyPresenceAssessment`
8. `newI18nReadinessAssessment`
9. `candidateNextIntentions`
10. `candidateFeatureRisks`
11. `analysisBlockingUnknowns`

## Workflow

1. 盘点入口
   - 查找 `createI18n`、`setupI18n`、`useI18n`、`i18n.global.t`、语言切换 store、语言包目录
   - 查找路由标题 helper、通知 helper、常量/枚举中的翻译入口

2. 划分场景
   - 应用初始化
   - 语言切换
   - 组件渲染取词
   - 非组件 helper 取词
   - store 与 runtime 的耦合

3. 画时序图
   - 使用 `sequenceDiagram`
   - 开启 `autonumber`
   - 至少保留一条主成功路径和必要互斥分支

4. 标注源码落点
   - 为图中每个参与者标明浏览器语义、文件路径、变量/函数名、关键输入输出

5. 产出面向后续节点的判断
   - 评估是否仍存在旧 i18n runtime
   - 评估是否已处于中间态
   - 评估新增新 i18n 的 readiness
   - 给出后续更适合进入哪些意图 skill

## Guardrails

- 不允许在未画出时序图前直接定义退化或迁移方案
- 不允许只写目录结构，不写运行链路
- 不允许只有文件列表，没有变量/函数落点
- 不允许忽略 `chainConfidence` 与 `analysisBlockingUnknowns`

## Deliverables

- `README.md`
- `SKILL.md`
- 通用模板
- 示例分析文档
- 可供后续意图节点消费的结构化分析结论

## 使用示例

```text
先不要动代码，帮我还原这个仓库当前 i18n 是如何工作的。
```

```text
我现在要做总编排，但链路不清楚，先补分析结论。
```

```text
我只想知道下一步该选哪个技能，但 gap 还不明确，先做一轮链路推理。
```

```text
我想比较迁移方案，但目前还不能确认旧 runtime 是否存在，先补链路事实。
```
