# 分析-skill现状

## 作用
判断当前目标是单文件 skill、旧套件、agent 套件，还是已经进入 Darwin 质量迭代阶段。

## 适用场景
- 目标路径有了，但不知道当前处于哪个演化阶段。
- 需要先拆清“结构问题”还是“质量问题”。
- 用户描述模糊，直接路由风险高。

## 与相邻节点边界
- 结构已经明确：直接进入对应策略或迁移节点
- 只缺 feature 组合：进入 `feature-skills/子skill路由决策`
- 不负责实际补文档或执行 Darwin

## 主要产出
- 当前结构判定
- 主要缺口
- 推荐进入的后续 intention 节点

## 资源入口
- 模板：`[[template/README.md]]`
- few-shot：`[[assets/few-shot-example/README.md]]`
- 校验：`[[evals/evals.json]]`

## 使用示例
```text
这个目标 skill 看起来问题很多，但我还没判断它属于哪种现状。
使用 $分析-skill现状 先输出结构判定、主要缺口和建议进入的 intention 节点。
```
