# 子skill上提与中间层删除

## 作用
减少没有独立职责的层级，让 skill 套件结构更扁平、更可读，也让路由更清晰。

## 适用场景
- 目录层级很多，但中间层没有判断职责。
- 实际使用时总是直接跳过某层看更深的子 skill。
- 结构已经妨碍命名、路由和文档维护。

## 与相邻节点边界
- 命名问题：`[[../中文技能命名收敛/SKILL.md]]`
- 主 skill 过重：`[[../主SKILL瘦身与下沉/SKILL.md]]`
- 是否要拆 intention / feature：由 intention 节点判断

## 资源入口
- 模板：`[[template/README.md]]`
- few-shot：`[[assets/few-shot-example/README.md]]`
- 校验：`[[evals/evals.json]]`

## 使用示例
```text
当前 skill 套件的中间层目录没有独立职责，只是多包了一层。
使用 $子skill上提与中间层删除 给出需要删除的中间层和上提后的结构建议。
```
