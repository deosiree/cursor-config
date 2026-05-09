# 迁移-拆分意图层与功能层

## 作用
把职责混杂的子 skill 重新组织成 intention / feature 两层，让判断路径和执行路径清晰分开。

## 适用场景
- 现有节点平铺，但职责混合。
- 某个节点既判断又执行，长期难维护。
- 父 skill 已经有 agent 倾向，但子层还没完成职责拆分。

## 与相邻节点边界
- 主 skill 过重：`[[../迁移-主skill改造为agent/SKILL.md]]`
- 只是删除无效中间层：`[[../../feature-skills/子skill上提与中间层删除/SKILL.md]]`
- 只缺 feature 组合：`[[../../feature-skills/子skill路由决策/SKILL.md]]`

## 资源入口
- 模板：`[[template/README.md]]`
- few-shot：`[[assets/few-shot-example/README.md]]`
- 校验：`[[evals/evals.json]]`

## 使用示例
```text
我现在已经有多个子skill，但分析和执行职责混在一起。
使用 $迁移-拆分意图层与功能层 给我 intention / feature 的拆分方案。
```
