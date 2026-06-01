# Darwin 接入模板

> 给刚写完或重构完毕的 skill 套件接入 Darwin 质量闭环。

## 前置检查

- [ ] 结构已补齐（README + SKILL + template + assets + references + evals）
- [ ] 内容已补齐（template 有真实样本，evals 有测试用例）
- [ ] Markdown 收尾已完成
- [ ] `write-skill-single-guardrails.md` 空心化验收通过

## 桥接期（推荐）

```text
1. 检查 ./<workspace>/.cursor/darwin-skill 是否存在
2. 若存在 → 路由到外部 Darwin 套件
   - baseline → trial → optimize → keep/revert
3. 若不存在 → 请求人工提供或退化到内部闭环
```

## 内部降级闭环

当外部 Darwin skill 不可用时，在 `feature-skills/darwin质量评估与迭代/` 内执行简化版：

```text
1. Baseline: 统计节点数 / 完整度 / 空心比例 / evals 覆盖率
2. Trial: 设计 2-3 条测试提示词，对比 baseline 行为
3. Optimize: 按边际收益从高到低修复
4. Keep/Revert: 
   - 改进 > 20% → keep + 进入下一轮
   - 改进 < 5% → 停止，标记为 HL-4 拐点
```

## keep / revert 参考规则

| 本轮改进 | 决策 |
| --- | --- |
| >20% | 继续下一轮优化 |
| 5-20% | 评估本轮投入产出比，人工决定 |
| <5% | 停止 — 已达 HL-4 拐点 |

## 内嵌期
稳定后可将 Darwin 套件整体并入当前 skill 的 feature 节点。
