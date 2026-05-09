---
name: 会话示例：microfb i18n 链路分析
description: 当需要参考一个真实仓库，学习如何先做 i18n 链路分析、再为后续策略或功能路由提供事实基础时使用。
---

# 会话示例：microfb i18n 链路分析

## 背景

这个示例来自 `microfb` 旧 i18n 方案的链路还原过程。

## 重点

- 先确认应用初始化、语言切换、非组件 helper 三条核心链路
- 先画 `sequenceDiagram`，再补源码落点
- 不直接进入退化、编排或功能节点
- 最终产出：
  - `chainConfidence`
  - `legacyPresenceAssessment`
  - `newI18nReadinessAssessment`
  - `candidateNextIntentions`

## 最小成功信号

- 能解释当前 i18n 是如何工作的
- 能判断旧 runtime 是否仍存在
- 能告诉后续更适合进入哪个意图节点
