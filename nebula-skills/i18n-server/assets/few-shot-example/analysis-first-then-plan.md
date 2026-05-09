# analysis-first-then-plan

## 用户请求

```text
当前链路我也说不清，但我还是需要一个总方案，帮我比较先退化再新增和带中间态收敛。
```

## 预期父 agent 判断

- 当前属于 `analysis_required`
- 不能直接进入 `编排-i18n迁移`
- 先消费 `分析-i18n链路`

## 预期分流路径

1. `分析-i18n链路`
2. `编排-i18n迁移`

## 关键理由

- 用户目标是总方案比较，不是单次功能路由
- 但当前事实不足，不能跳过链路分析
- 分析结果至少要补：
  - `chainConfidence`
  - `legacyPresenceAssessment`
  - `candidateNextIntentions`
  - `analysisBlockingUnknowns`

## 合格输出信号

- 明确先分析、再编排
- 不直接给单一推荐路径
- 最终方案矩阵中包含 `analysisBasis`
