# Darwin · 工作台验数播种

日期：2026-07-18  
分支：`auto-optimize/20260718-1237-workbench-seed`  
结论：**HL-4 触顶，Phase 2 停止**。最终分 **85.5**。

## 分数变化

| 阶段 | Score | Δ | 焦点 | eval_mode |
|------|-------|---|------|-----------|
| Baseline | 78.5 | — | MVP dry_run | dry_run |
| Round 1 | 84.6 | **+6.1** | dim8 验收脚本 + full_test | full_test |
| Round 2 | 84.9 | +0.3 | dim4 主门禁 🔴 CHECKPOINT | dry_run |
| Round 3 | 85.5 | +0.6 | dim9 主文反例黑名单 | dry_run |

HL-4：连续两轮 Δ &lt; 2（+0.3、+0.6）→ **break**，不再硬凑 MAX_ROUNDS。

## 最终评分卡（85.5）

| # | 维度 | 权重 | 分 | 加权 |
|---|------|------|-----|------|
| 1 | Frontmatter | 7 | 8.5 | 5.95 |
| 2 | 工作流 | 12 | 9.0 | 10.80 |
| 3 | 失败模式 | 12 | 8.5 | 10.20 |
| 4 | 检查点 | 6 | 8.5 | 5.10 |
| 5 | 可执行性 | 17 | 9.0 | 15.30 |
| 6 | 资源整合 | 4 | 9.0 | 3.60 |
| 7 | 整体架构 | 12 | **8.0** | 9.60 |
| 8 | 实测 | 23 | 8.5 | 19.55 |
| 9 | 反例黑名单 | 6 | 9.0 | 5.40 |

## full_test 证据（Round 1）

- `apply-workbench-verify-seed.ps1` syk_glossary → OK  
- `verify-workbench-translate-ready.ps1` → `verifyPassed=true`  
- 注入 `entry_state=0` → exit 1 + FAIL 行  
- 恢复 state=3 → 再绿  

## 若仍继续：最值得动的点

**Dim7 整体架构（8.0）——`seedProfile=custom` 缺可复用模板**  
目前 custom 只约定「用户自备 SQL/矩阵」，没有 `template/custom-seed.example.sql` 或最小矩阵骨架。再抬分应补模板，而不是再堆主 SKILL 段落（易触 over-engineering）。

次优：用独立子 agent 对 prompt2（只补人员）再跑一条 full_test，抬 dim8 可信度（当前 dim8 证据主要在 prompt1/3）。

## 建议

**收手。** 边际收益已过 HL-4；日常直接用套件即可。除非马上要做「任意产品自定义验数矩阵」，再开一轮只补 custom 模板。
