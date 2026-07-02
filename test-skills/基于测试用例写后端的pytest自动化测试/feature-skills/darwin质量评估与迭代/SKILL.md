---
name: darwin质量评估与迭代
description: 完整 Darwin：试跑 test-prompts、14 分制评分、keep/revert 规则。
---

# Feature：Darwin 质量评估与迭代

## 模式

**full** — 试跑 + 评分 + keep/revert（非 evaluate-only）

## 何时触发

- REFACTOR 阶段，`质量-覆盖率自检` 通过后
- 新 few-shot / 子 skill 落地后回归
- 用户授权完整 Darwin

## 流程

1. 从 [[../../evals/test-prompts.json]] 取 prompt
2. 按 [[../../SKILL.md]] RED → intention → feature 执行
3. 跑 [[质量-覆盖率自检/SKILL.md]]
4. 按 [[../../evals/evaluate-only-baseline.md]] 评分
5. 写入 `evals/results/{id}-{date}.md`
6. keep/revert 决策

## keepOrRevertRule

| 总分（100 分制） | 决策 |
|------------------|------|
| ≥85 且 HL-4 未触顶 | **keep**，可继续 hill-climbing |
| ≥85 且连续 2 轮 Δ<2 | **keep**，**停止**优化（HL-4） |
| 10–11（14 分制产物） | 补 violations 重评 |
| <10（14 分制） | **revert** → few-shot AFTER |

100 分制 rubric 与轮次日志：[[../../evals/evaluate-only-baseline.md]]、[[../../evals/results/darwin-results.tsv]]、[[../../evals/results/final-report.md]]

## 输出

```text
darwinTrialReport:
  promptId: mvp-menu-export
  score: 13
  keep: yes
  violations: []
  resultPath: evals/results/mvp-menu-export-20260702.md
nextIterationAction: ...
```

## 与写pytest集成测试 Darwin 的区别

本 skill 额外维度：CSV 映射、README Obsidian 格式、实现位置行号（见 baseline 文档）。

## 使用示例

```text
对 test-prompts 中 readme-only-fix 跑 Darwin 全量评分并落盘 results。
```
