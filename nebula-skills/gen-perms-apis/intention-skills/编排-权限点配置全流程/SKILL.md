---
name: 编排-权限点配置全流程
description: 当需要比较多阶段方案（分析→设计→补丁→改码→验证）、评估改动面与前后链路，并在事实充分后给出推荐路径时使用。
---

# 编排-权限点配置全流程

## RED

- 没有本节点时，agent 容易把"多方案比较"错误压成单条执行路径
- 也容易在链路事实不足时直接推荐某个策略，跳过分析前置
- 常见失败：
  - 只有推荐，没有备选方案
  - 只有功能序列，没有改动面评估
  - 把单次功能路由误写成总编排
  - 漏掉端到端验证阶段

## GREEN

- 本节点负责候选方案矩阵，而不是顶层会话路由
- 在事实不足时，必须先消费 `[[../分析-perms-apis现状]]`
- 输出必须同时约束：
  - `candidatePlans`
  - `recommendedPlan`
  - `analysisBasis`
  - `changeSurfaceDetails`
  - `featureSkillSequence`

## 分析前置

在输出方案矩阵前，必须先判断链路事实是否足够。

输入契约新增：

- `chainAnalysisAvailable`
- `chainAnalysisSource`
- `analysisConfidence`

若事实不足：

1. 先消费 `[[../分析-perms-apis现状]]`
2. 必要时再消费 `[[../策略-设计权限点]]` 确认权限设计
3. 再产出候选方案矩阵

## 输出契约

- `planningGoal`
- `candidatePlans`
- `recommendedPlan`
- `whyRecommended`
- `rejectedPlans`
- `sharedPreconditions`
- `verificationStrategy`
- `stopCondition`

每个 `candidatePlan` 必须至少包含：

- `planId`
- `planSummary`
- `intentionPath`（意图节点序列）
- `featureSkillSequence`（功能节点序列）
- `changeSurfaceSize`（改动面大小：小/中/大）
- `changeSurfaceDetails`
- `beforeChain`（前置链路）
- `afterChain`（后续链路）
- `analysisBasis`
- `verificationPoints`
- `rollbackShape`
- `risks`
- `recommendedFor`
- `notRecommendedFor`

## 默认全流程阶段

编排可覆盖以下 6 个阶段：

| 阶段 | 对应意图/功能 skill | 产物 |
|------|-------------------|------|
| 1. 分析 | `分析-perms-apis现状` → `扫描源码权限点与API` | 盘点文档 |
| 2. 设计 | `策略-设计权限点` → `设计权限点与API映射` | 权限设计方案 |
| 3. 补丁 | → `生成菜单树权限补丁` | 增量 YAML 补丁 |
| 4. 合并 | → `合并权限点到菜单树` | 合并后菜单树 |
| 5. 改码 | `迁移-源码改动落地` → `源码集中式权限改动` | 源码 diff |
| 6. 验证 | → `OpenCLI端到端验证` + `菜单树导入验证` | 验证报告 |

## Guardrails

- 不允许在事实不足时直接产出推荐方案
- 不允许只给一条执行路径，却称之为"多方案比较"
- 不允许方案没有 `analysisBasis`
- 不允许把单次功能路由伪装成总编排
- 方案必须覆盖端到端验证阶段，不能只到改码就结束

## REFACTOR

- 若只输出 1 个方案却称为"多方案比较"，收紧：「至少 2 个候选方案，否则回退到策略节点」
- 若方案缺少 `analysisBasis`，强制执行分析前置
- 若改动面评估只有定性描述无定量数据，补文件数/代码行数等硬指标
- 若编排漏掉了端到端验证阶段，补「验证阶段不可跳过」的强制要求

## 使用示例

```text
给我多个权限配置方案，并比较每种方案的改动面和风险。
```

```text
我需要一份推荐方案，说明为什么不是其他路径。
```

```text
当前链路不明，但我还是要总编排，请先补分析再出方案矩阵。
```
