---
name: darwin质量评估与迭代
description: evaluate-only 默认；试跑 test-prompts；桥接 darwin-skill。
---

# Feature：Darwin 质量评估与迭代

## 模式

- **evaluate-only**（默认）：评 skill 文档 + few-shot + 脚本验收
- **evaluate-after-delivery**：流水线跑通后可选

## 流程

1. 读 `evals/test-prompts.json`
2. RED → intention → feature；交付后跑 `scripts/verify_output.py`
3. 对照 `evals/evaluate-only-baseline.md` 与 `evals/results/darwin-iteration.md`
4. 写入 `evals/results/{id}-{date}.md`

## full_test（抬 dim8）

Nebula 实仓三步（关占用 xlsx 或改 `xlsxName`）：

```bash
python scripts/extract_commits.py --config configs/nebula-huiyan-0707-0807.config.json
python scripts/build_excel.py --config configs/nebula-huiyan-0707-0807.config.json
python scripts/verify_output.py --config configs/nebula-huiyan-0707-0807.config.json
```

`expectMismatch` 仅 rawCount 漂移、结构指标仍 OK → 见 `质量-输出验收` expect 漂移 CHECKPOINT。

## HL-4

连续 2 轮 Δ < 2 分 → 停止文档堆叠；见 `evals/results/darwin-iteration.md`。

## 本 skill 额外维度

| 维度 | 检查 |
| --- | --- |
| 主题粒度 | 无域名级问题根 |
| 提交完整 | raw = Excel 提交数 |
| few-shot | 仅用 `assets/` 内路径 |
| 跨项目 | 必须先 CHECKPOINT |
| 误路由 | 不改业务源码 |

## keepOrRevertRule

evaluate-only：≥85 keep 文档；<85 记录改进项，不自动改 Nebula 业务仓。

## 桥接

完整 rubric：`darwin-skill`

## 使用示例

```text
对 evals/test-prompts.json 中 nebula-default-replay 跑 evaluate-only。
```
