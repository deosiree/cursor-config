# 子skill路由决策

## 作用
在任务类型已经确定的前提下，为当前 skill 改造选择最少必要的 feature 组合与顺序。

## 适用场景
- 目标 skill 的主要缺口已经看出来了，但不确定先补命名、模板、few-shot 还是 evals。
- 用户只要求单点补强，不希望重复展开整套总流程。
- 需要显式说明哪些 feature 暂时不做，避免范围失控。

## 与相邻节点边界
- 现状不明：回到 `[[../../intention-skills/分析-skill现状/SKILL.md]]`
- 需要判断是新建还是升级：交给 intention 节点
- 已经知道具体缺哪个 feature：直接进入对应 feature 节点

## 主要产出
- 当前缺口摘要
- 推荐 feature 组合
- 推荐执行顺序
- 暂不处理的 feature 与原因

## 资源入口
- 模板：`[[template/README.md]]`
- few-shot：`[[assets/few-shot-example/README.md]]`
- 校验：`[[evals/evals.json]]`

## 使用示例
```text
这个 skill 套件主要缺 few-shot、evals 和 Markdown 收尾。
使用 $子skill路由决策 只选最少必要的 feature 节点，并按顺序输出。
```
