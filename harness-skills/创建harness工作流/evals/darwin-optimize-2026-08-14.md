# Darwin 优化报告 · 套件版（HL-4 再触顶）

**Skill：** 创建harness工作流（父 agent 套件）  
**日期：** 2026-08-14  
**模式：** optimize（2 轮子 skill，父 SKILL 不动）  
**退出：** 连续 2 轮 Δ &lt; 2（+1.2 / +0.6）→ **HL-4 break**

## 分数轨迹

| 轮次 | 分数 | Δ | 主攻 | 改动的 SKILL | 状态 |
| --- | --- | --- | --- | --- | --- |
| sync-ssot 后基线 | 93.0 | — | 能力表 + 新 feature | — | evaluate-only |
| opt-r1 | 94.2 | **+1.2** | dim3 旧升级路由解耦 | `编排-旧harness升级` | keep · dry_run |
| opt-r2 | 94.8 | **+0.6** | dim4 CHECKPOINT | `Harness解耦与反漂移` | keep · **HL-4 break** |

## 本轮改动

1. **编排-旧harness升级**：步骤 3 SSOT 漂移分流 → `Harness解耦与反漂移`；失败分支 HARNESS&gt;320  
2. **Harness解耦与反漂移**：步骤 8 🔴 CHECKPOINT 后再 Darwin；失败分支「未 CHECKPOINT 即 keep」  
3. **test-prompts** id:5、**evals.json** T6 — 旧升级 HARNESS 膨胀场景

## 未改（刻意）

- 父 `SKILL.md` 措辞（153 行，HL-4 禁止 hill-climb）
- `编排-同步skill收益` 正文
- Nebula 源仓

## 仍最值得优化的点（结构外 · dim8 live）

| 优先级 | 点 | 为什么 | 预期 Δ |
| --- | --- | --- | --- |
| **P0** | **live 旧升级对照** | test-prompt id:5 仅 dry_run；陌生仓跑「HARNESS 420 行升级」实测 route 是否命中解耦 | +2~4（dim8） |
| P1 | `编排-同步skill收益` 2 条 live eval | darwin-baseline 2026-07-21 已指出；抬同步闭环置信度 | +1~2 |
| P2 | `落地最小文件集` 补 WRITE_RULES 为可选 P1 | 从 0 建时少一轮旧升级返工 | +0.5~1 |

## 建议

**收手（对 SKILL 文档 optimize）。** 连续两轮 Δ 已 &lt;2（+1.2、+0.6），再改措辞预期 Δ≪1，易触 darwin 反模式 #3（为凑分增冗余）。

**若还有精力：** 做一次 **live 试跑**（test-prompt id:5 或 T6），把 `eval_mode` 从 dry_run 升到 `live_partial`——这比再改任何 SKILL.md 更值得。

## dry_run 占比警告

本轮 2 轮 optimize 均为 dry_run；套件累计 dry 比例仍偏高。**不可**仅凭结构分声称「已优于 live 基线」。
