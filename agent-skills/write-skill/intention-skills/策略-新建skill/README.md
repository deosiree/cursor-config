# 策略-新建skill

## 作用
为从 0 开始的新 skill 先决定结构、模板模型和后续 feature 组合，避免一开始就把正文写死。

## 适用场景
- 没有旧 skill，可直接从空目录开始。
- 需要先判断是否值得一步到位做成 agent 套件。
- 需要把命名、模板和 supporting files 方案一起定下来。

## 与相邻节点边界
- 已有旧 skill：转到 `[[../策略-升级旧skill/SKILL.md]]`
- 主 skill 过重：转到 `[[../迁移-主skill改造为agent/SKILL.md]]`
- 只缺具体 feature：转给 feature 节点

## 资源入口
- 模板：`[[template/README.md]]`
- few-shot：`[[assets/few-shot-example/README.md]]`
- 校验：`[[evals/evals.json]]`

## 使用示例
```text
我要新建一个中文 skill，但还没决定是单 skill 还是直接做成分层套件。
使用 $策略-新建skill 先给我结构决策和后续 feature 组合。
```
