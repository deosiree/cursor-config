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

**真实「编排-同步skill收益」写盘闭环**：把 Nebula 已有质量 Loop 等范式，经 CHECKPOINT 真正写入 `可迁移能力.md`，再让陌生仓跑一次「旧升级」对照。这抬的是产品收益与 dim8 置信度，不是再改父 SKILL 措辞。

次优：给 `编排-同步skill收益` 单独加 2 条 live eval，而不是继续 hill-climb 父文件。

## 建议

**收手（对父 SKILL / 套件结构优化）。** 再改正文预期 Δ≪2。有精力做一次 **live 同步收益**，别继续 Darwin 抠主文档。  
