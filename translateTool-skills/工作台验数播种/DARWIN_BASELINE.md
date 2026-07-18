# Darwin · 工作台验数播种

日期：2026-07-18  
分支：`auto-optimize/20260718-1237-workbench-seed`  
结论：HL-4 后用户点名继续 Dim7 → Round4 **keep**。当前最终分 **88.1**。

## 分数变化

| 阶段 | Score | Δ | 焦点 | eval_mode |
|------|-------|---|------|-----------|
| Baseline | 78.5 | — | MVP dry_run | dry_run |
| Round 1 | 84.6 | **+6.1** | dim8 验收脚本 + full_test | full_test |
| Round 2 | 84.9 | +0.3 | dim4 主门禁 🔴 CHECKPOINT | dry_run |
| Round 3 | 85.5 | +0.6 | dim9 主文反例黑名单 | dry_run |
| Round 4 | **88.1** | **+2.6** | dim7 custom 模板闭环（dim6/8 跟涨） | full_test |

Round2–3 曾触 HL-4；Round4 为用户授权的 Dim7 专项，非硬凑轮次。

## 最终评分卡（88.1）

| # | 维度 | 权重 | 分 | 加权 |
|---|------|------|-----|------|
| 1 | Frontmatter | 7 | 8.5 | 5.95 |
| 2 | 工作流 | 12 | 9.0 | 10.80 |
| 3 | 失败模式 | 12 | 8.5 | 10.20 |
| 4 | 检查点 | 6 | 8.5 | 5.10 |
| 5 | 可执行性 | 17 | 9.0 | 15.30 |
| 6 | 资源整合 | 4 | 9.5 | 3.80 |
| 7 | 整体架构 | 12 | **9.0** | 10.80 |
| 8 | 实测 | 23 | 9.0 | 20.70 |
| 9 | 反例黑名单 | 6 | 9.0 | 5.40 |

## full_test 证据

**Round 1（syk）：** apply + verify 绿；`entry_state=0` → exit 1；恢复再绿。  
**Round 4（custom）：** `new-custom-seed.ps1 -Slug dim7` → apply → verify `ExpectedEntryCount=3` → `verifyPassed=true`。

## 若仍继续

各维已 ≥8.5；再抬分空间小。可选：prompt2 人员补齐的独立 full_test；或把矩阵行从「手改 INSERT」升级为 CSV→SQL 生成器（容易 over-engineering）。

## 建议

**可以收手。** Dim7 custom 缺口已闭合；日常用 syk/adm/custom 三档案即可。
