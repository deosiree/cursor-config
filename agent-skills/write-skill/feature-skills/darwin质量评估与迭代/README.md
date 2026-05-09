# darwin质量评估与迭代

## 作用
负责实际执行 Darwin 式质量评估、受控试跑和优化迭代。

## 桥接优先
优先检查当前工作区：
- `./.cursor/darwin-skill`

如果存在：
- 直接桥接该套件的规则、模板与评估材料。

如果不存在：
1. 请求人类提供 Darwin skill
2. 若仍拿不到，使用当前节点内置的最小降级闭环

## 后续演进
当桥接模式稳定后，可把当前外部 Darwin 套件整体并入本节点。

## 边界
- 它不负责替代主套件的结构修复。
- 它不要求每次都进入 optimize。
- 没有外部 Darwin 时，允许内部最小降级，但要显式标注。

## 资源入口
- 模板：`[[template/README.md]]`
- few-shot：`[[assets/few-shot-example/README.md]]`
- 校验：`[[evals/evals.json]]`

## 使用示例
```text
当前工作区已经有 darwin-skill，我想对这个节点做一次受控试跑。
使用 $darwin质量评估与迭代 说明桥接方式、baseline 计划和是否建议进入 optimize。
```
