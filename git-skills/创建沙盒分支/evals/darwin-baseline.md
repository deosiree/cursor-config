# Darwin baseline · 创建沙盒分支

> 完整拐点报告见 [[darwin-hl4-final.md]]；轨迹见 [[results.tsv]]。

## 摘要

| 阶段 | 总分 | 说明 |
| --- | ---: | --- |
| R0 baseline | 84.9 | 检查点偏软 |
| R1 keep | 88.6 | 检查点 + 失败模式 |
| R2 keep | 90.4 | 指令具体性（示例 I/O） |
| R3 keep | 91.0~91.6 | 实测 dry_run 覆盖扩展 |
| **HL-4** | ✅ | 建议收手 |

`weakestRemaining`: full_test 环境（非文案增量）
