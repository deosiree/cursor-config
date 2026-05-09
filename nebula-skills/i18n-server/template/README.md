# 顶层模板

这里放顶层父 skill 的路由与编排模板，而不是具体仓库源码。

## 包含内容

1. `root-single-iteration-template.md`
   用于输出父 agent 单轮观察、判断、路由、提问与下一步动作
2. `orchestration-template.md`
   用于输出“先分析，再比较方案，再进入功能序列”的总迁移路径
3. `migration-routing-template.md`
   用于按症状选择正确意图 skill

## 使用原则

- 需要稳定输出 `currentUnderstanding`、`chainConfidence`、`missingFacts`、`nextIterationAction` 时，优先复用 `root-single-iteration-template.md`
- 需要真实源码时，优先转到 `intention-skills/` 或 `feature-skills/` 对应节点的 `template/`
- 需要说明“为什么这样路由”，优先复用这里的模板
