---
name: 会话示例：microfb 迁移总编排
description: 当需要参考一个真实仓库，学习如何先分析事实、再比较多个 i18n 迁移方案并给出推荐路径时使用。
---

# 会话示例：microfb 迁移总编排

## 背景

这个示例来自 `microfb` 的 i18n 迁移规划，不直接讨论单个功能节点，而是比较不同方案的整体走法。

## 重点

- 先确认链路事实是否足够
- 若事实不足，先回到 `分析-i18n链路`
- 至少列出 2 条候选方案
- 每条方案都包含：
  - `changeSurfaceSize`
  - `beforeChain`
  - `afterChain`
  - `featureSkillSequence`
  - `analysisBasis`

## 最小成功信号

- 能说明为什么当前问题属于“总方案比较”
- 能给出推荐方案与排除理由
- 不会把单次功能路由误写成总编排
