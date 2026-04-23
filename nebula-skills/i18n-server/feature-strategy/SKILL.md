---
name: feature-strategy
description: Use when you already know the current i18n chain and the target i18n design, and you need to compare them to decide whether to deprecate first and migrate later or move directly in one step
---

# Feature Strategy

## Overview

这个 skill 用来回答迁移策略问题，而不是实现问题。它必须清楚说明：

1. 当前链路怎么跑。
2. 新链路怎么跑。
3. 两者哪里重叠，哪里冲突。
4. 是拆成两步更稳，还是一步到位更省。

## When to Use

- 已经完成 `feature-analysis`。
- 已经明确 docs 中的新 i18n 方案。
- 你不想默认采用“两步走”或“一步到位”，而是希望根据真实链路做判断。

## Required Outputs

1. 当前链路摘要
2. 新链路摘要
3. 重叠/交叉点矩阵
4. 差异/冲突点矩阵
5. 迁移策略判断
6. 建议执行顺序

## Workflow

1. 读取旧链路分析
   - 直接使用 `feature-analysis` 的时序图和源码落点表。
   - 识别旧链路的核心参与者、双写点、helper、store、runtime。

2. 抽取新链路
   - 从 `docs` 中提炼新方案的运行链路。
   - 至少覆盖：
   - 应用初始化
   - 语言切换
   - 组件取词
   - 非组件标记与最终翻译
   - 语言包组织方式

3. 建立对比视图
   - 当前链路 vs 新链路
   - 参与者是否同构
   - 状态源是否同构
   - 运行时调用方式是否同构
   - 资产格式是否同构

4. 识别重叠与交叉
   - 哪些层可以复用：例如语言切换 store、Element locale 映射、词条资产。
   - 哪些层需要重写：例如 TS 嵌套词典、`i18n.global.t` helper、旧语言码。
   - 哪些层存在中间态价值：例如先脱钩到静态常量是否能降低风险。

5. 做迁移策略判断
   - 如果旧链路和新链路只差少量运行时实现，且消费面比较干净，可以建议一步到位。
   - 如果旧链路存在双写状态、非组件 runtime 强依赖、store 耦合、词条结构差异大，建议先退化再迁移。
   - 判断必须给出依据，不允许只写“建议”。

6. 输出执行建议
   - 两步走时：分析 -> 策略 -> 退化 -> 验证提交 -> 迁移
   - 一步到位时：分析 -> 策略 -> `feature-direct-migration`
   - 必须说明为什么。

## Guardrails

- 不允许跳过旧链路分析直接做策略判断。
- 不允许只按目录结构判断是否一步到位，必须看运行链路和消费面。
- 不允许只给结论，不给重叠点、冲突点、依据。
- 不允许把“开发者主观偏好”写成工程判断。

## Deliverables

- `README.md`
- `SKILL.md`
- 对比模板
- 决策模板
- `microfb` 示例决策文档

## MVP Template

优先阅读：

- `template/chain-comparison-template.md`
- `template/strategy-decision-template.md`
- `template/microfb-strategy.md`
