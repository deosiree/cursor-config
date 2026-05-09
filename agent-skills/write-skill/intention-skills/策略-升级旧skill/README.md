# 策略-升级旧skill

## 作用
为已有旧 skill 设计升级路径，让旧规则保留、结构补齐和 supporting files 建设能够分步完成。

## 适用场景
- 旧 skill 只有 `SKILL.md`。
- 套件存在，但缺 `template/`、`assets/`、`references/` 或 `evals/`。
- 需要在升级时判断哪些旧规则继续保留，哪些要拆出去。

## 与相邻节点边界
- 从 0 新建：`[[../策略-新建skill/SKILL.md]]`
- 主 skill agent 化：`[[../迁移-主skill改造为agent/SKILL.md]]`
- 只缺单点 feature：交给 feature 节点

## 资源入口
- 模板：`[[template/README.md]]`
- few-shot：`[[assets/few-shot-example/README.md]]`
- 校验：`[[evals/evals.json]]`

## 使用示例
```text
这个旧 skill 现在结构很薄，但里面还有一些有效规则不能丢。
使用 $策略-升级旧skill 给出升级顺序、保留规则和需要补的 supporting files。
```
