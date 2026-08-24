# Darwin 优化报告 · 套件版（HL-4）

**Skill：** 创建harness工作流（父 agent 套件）  
**日期：** 2026-07-21  
**退出：** 连续 2 轮 Δ &lt; 2（+1.6 / +0.9）

## 分数轨迹

| 轮次 | 分数 | Δ | 主攻 | 状态 |
| --- | --- | --- | --- | --- |
| suite baseline | 88.5 | — | 重构后 | — |
| round1 | 90.1 | **+1.6** | dim3 父路由失败表 | keep · full_test |
| round2 | 91.0 | **+0.9** | dim5/8 同轮 RED→GREEN | keep · **HL-4 break** |

## 主要改动

1. 父 SKILL 增加路由层三段式失败表（路径/mode/Single Dispatch/反拷贝/禁堆父文件）  
2. 明确「同轮衔接」：分析得 mode 后可同回复进创建/升级，最终 route 写编排名  

## 仍最值得优化的点（结构外）

**live 旧升级对照（P0）**：用 test-prompt id:5 / evals T6 在陌生仓实测「HARNESS 420 行 → 解耦 route」——抬 dim8，不是再改父 SKILL。

次优：`编排-同步skill收益` 2 条 live eval（darwin-baseline 2026-07-21 建议）。

## 建议

**收手（对父 SKILL / 子 SKILL 措辞 optimize）。** 2026-08-14 再触 HL-4（+1.2 / +0.6）；详见 [`darwin-optimize-2026-08-14.md`](./darwin-optimize-2026-08-14.md)。有精力做 **live 试跑**，别继续 Darwin 抠主文档。  
