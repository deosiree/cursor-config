# 页面空态 — Darwin 优化报告（evaluate + 2 轮迭代）

> 方法：Darwin Skill 2.0 rubric（9 维 / 100 分）  
> 模式：结构评分 + test-prompts dry_run（dim8）  
> 停止条件：核心 skill ≥85 **或** HL-4 连续 2 轮 Δ&lt;2  
> 日志：`darwin-page-empty-state-results.tsv`

## 分数变化

| Skill | Before | After R1 | After R2 | Δ 合计 | 状态 |
|-------|--------|----------|----------|--------|------|
| 接入-PageNoPermission空态 | 72.0 | **86.5** | — | +14.5 | **达标 ≥85** |
| 策略-页面权限空态 | 73.0 | **85.0** | — | +12.0 | **达标 ≥85** |
| 编排-页面无权限空态落地 | 70.0 | 84.0 | **85.0** | +15.0 | **达标 ≥85** |
| 判定-页面门控权限点 | 69.0 | — | **82.0** | +13.0 | R2 优化 |
| 盘点-页面权限空态反模式 | 68.0 | — | **81.5** | +13.5 | R2 优化 |
| **加权平均（5 skill）** | **70.4** | — | — | **+13.0** | **84.2** |

## 轮次与 HL-4 判定

| 轮次 | 改动 | 平均 Δ | HL-4 |
|------|------|--------|------|
| R1 | 接入 / 编排 / 策略：Step 工作流、if-then 兜底表、🔴 CHECKPOINT、反例黑名单、test-prompts.json | +13.5 | — |
| R3 micro | 编排：dim8 验收清单 + test-prompts 自检 | +1.0 | **触发 HL-4 信号**（Δ&lt;2） |

**R4 未执行**：R3 边际 +1.0，继续优化盘点/判定（81~82）需扩写 3+ 分，收益低于成本。

→ **在 R3 后收手**（核心 3 skill 均已 ≥85）。

## R1 主要改动（高杠杆）

| HL | 应用 |
|----|------|
| HL-1 | `🔴 CHECKPOINT` 写入接入 / 编排 / 策略 |
| HL-2 | if-then 三段式兜底表（触发 / 一线 / 兜底） |
| HL-3 | dim2+3+4 成簇补强（步骤 + 失败分支 + 检查点同轮） |
| — | `test-prompts.json` 接入 feature + 编排 intention |

## 基线短板（优化前）

| 维度 | 问题 |
|------|------|
| dim2 | 无编号 Step，只有 GREEN 段落 |
| dim3 | 仅 RED 列表，无 if-then 兜底 |
| dim4 | 无显性 CHECKPOINT |
| dim8 | 无 test-prompts.json |
| dim9 | 禁止项分散，无独立黑名单表 |

## dim8 说明

本轮 dim8 均为 **dry_run**（对照 test-prompts 推演输出是否符合 expected）。未 spawn 独立子 agent 实测。若需 production 级 dim8 置信，建议对「接入」skill 补 1 次 full_test。

## keep / revert

- **keep**：R1+R2 全部改动（results.tsv 无 revert 行）
- **revert 条件已过期**：无分数下降记录

## 与 evaluate-only 基线关系

- 路由 4/4 PASS 保持不变
- 结构质量从 ~70 提升到核心链 **85+**
