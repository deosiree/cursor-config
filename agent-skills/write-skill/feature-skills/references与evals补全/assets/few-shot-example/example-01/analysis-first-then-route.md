# analysis-first-then-route

## 用户请求

```text
我还说不清是 locale、模板还是 TS 运行时的问题，但我只想先知道这一步最该进哪个功能 skill。
```

## 预期父 agent 判断

- 当前目标仍是单次功能路由
- 但 gap 不明确，属于 `analysis_required`

## 预期分流路径

1. `分析-i18n链路`
2. `路由-选择功能子skill`

## 关键理由

- 这不是总方案比较
- 也不是“当前已经没有旧 i18n”的新增阶段策略
- 需要先通过分析判断当前 gap 更接近：
  - locale JSON
  - Vue 模板消费
  - TS / script setup 运行时

## 合格输出信号

- 明确说明为什么先分析再单次路由
- 分析完成后给出唯一 `selectedFeatureSkill`
- 说明为什么不是其他候选功能节点
