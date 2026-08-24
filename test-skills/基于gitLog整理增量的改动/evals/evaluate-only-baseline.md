# Evaluate-only 基线

模式：**dry_run**（结构审查 + few-shot 对照，不强制实跑 git）

## 维度（12 分制简版）

| # | 维度 | 分 |
| --- | --- | --- |
| 1 | 父 skill 薄路由、Single Dispatch | 2 |
| 2 | intention/feature 子 skill 齐全 | 2 |
| 3 | config 驱动 scripts | 2 |
| 4 | few-shot 内嵌 assets | 2 |
| 5 | 跨项目 CHECKPOINT | 2 |
| 6 | 反例/不要做什么 | 2 |

## 通过线

≥10/12 → 结构合格；实跑 Nebula 106/29/4 为交付门禁。

## test-prompts

见 `evals/test-prompts.json`

## 与 darwin-skill 关系

完整 9 维 rubric 见 darwin-skill；本套件默认 **evaluate-only**，不自动进入优化循环。
