# references与evals补全

## 作用
为已有主流程的 skill 节点补齐 references 与 evals，让 supporting files 不再是结构占位。

## 适用场景
- 节点能被触发，但没有 should-not-trigger 反例。
- 主文档提到“详见 references”，结果 `references/` 还是空的。
- Darwin 或人工 review 时，缺少可以复跑的输入和验收材料。

## 与相邻节点边界
- 它不负责决定模板类型。
- 它不替代主文档里的最小自解释正文。
- 如果 few-shot 来源本身不足，优先进入 `[[../历史版本回填为few-shot/SKILL.md]]`。

## 资源入口
- 模板：`[[template/README.md]]`
- few-shot：`[[assets/few-shot-example/README.md]]`
- 校验：`[[evals/evals.json]]`

## 使用示例
```text
当前 skill 节点已经有主流程，但 references 和 evals 还是结构壳。
使用 $references与evals补全 给出最小要补的 references 主题和 eval 用例。
```
