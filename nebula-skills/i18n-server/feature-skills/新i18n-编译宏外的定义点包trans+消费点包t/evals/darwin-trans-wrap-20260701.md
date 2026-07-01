# Darwin 评估报告：新i18n-编译宏外的定义点包trans+消费点包t

**日期**：2026-07-01  
**评估对象**：`新i18n-编译宏外的定义点包trans+消费点包t`（含 apex_dev-menu-row-actions 沉淀）  
**评估模式**：`dry_run`（9 维结构评分 + 5 条 test-prompt 干跑）  
**runtime 扫描**：`runtime_warn=0`

## Hill-climbing 记录

| 轮次 | 改动摘要 | 总分 | Δ | 判定 |
|------|----------|------|---|------|
| R0 baseline | 原 microfb 主模板 + 3 test-prompt | 83.0 | — | baseline |
| R1 | errors 文档 + apex_dev few-shot + menu snapshot 修正 + evals 扩 2 条 | 85.0 | +2.0 | ≥85 门槛 |
| R2 | 🔴 CHECKPOINT + 失败兜底表 + 不要做什么 | 86.5 | +1.5 | 边际递减 |

**HL-4 判定**：R2 Δ=+1.5 < 2，但 R1 Δ=+2.0 ≥ 2 → **仅 1 轮触顶信号，未达连续 2 轮 Δ<2**。  
**停止条件**：R1 已 ≥85 → **建议收手**。

## 总分（R2 终局）

| 指标 | 值 |
|------|-----|
| **总分** | **86.5 / 100** |
| 对比 sibling | 新增-i18nInput-表单字段 90、更新-i18nInput-缓存投影 91 |
| 结论 | **keep** — 达可用门槛；继续堆 SKILL 边际收益低 |

## 9 维评分明细（R2）

| # | 维度 | 权重 | 得分 | 加权 | R1→R2 |
|---|------|------|------|------|-------|
| 1 | Frontmatter 质量 | 7 | 8 | 5.6 | — |
| 2 | 工作流清晰度 | 12 | 9 | 10.8 | — |
| 3 | 失败模式编码 | 12 | 9.5 | 11.4 | +0.6 |
| 4 | 检查点设计 | 6 | 9 | 5.4 | +1.8 |
| 5 | 可执行具体性 | 17 | 9 | 15.3 | — |
| 6 | 资源整合度 | 4 | 9 | 3.6 | — |
| 7 | 整体架构 | 12 | 8.5 | 10.2 | — |
| 8 | 实测表现 | 23 | 8.5 | 19.55 | — |
| 9 | 反例与黑名单 | 6 | 9.5 | 5.7 | +0.3 |

## test-prompt 干跑（dim8，5/5 PASS）

| id | 预期 | 结果 |
|----|------|------|
| trans-wrap-01 | 本 skill | PASS |
| trans-wrap-02 | 本 skill，不误进 ts/动态拼接 | PASS |
| trans-wrap-03 | 上游路由命中 | PASS |
| trans-wrap-04 | 菜单 extract 零新增 | PASS |
| trans-wrap-05 | 定义点 trans，非仅补 JSON | PASS |

竞争 prompt（不应仅补 JSON）：`extract 抽不到 key，直接手填 en_US.json` → 正确排除。

## 当前最值得优化的点（若继续）

1. **dim8 full_test**（ROI 最高）— 真实 agent 带 skill 改 menu-row-actions diff，非 dry_run 推演
2. **form-validation MSG → trans 新 few-shot** — 历史 legacy 仅文档说明，无 after 样本（改动面大，易破坏历史快照）
3. **父级 i18n-server/SKILL.md** — 补一句「extract 零新增」症状路由（套件级，非本节点）

## 收手建议

**建议收手。** 理由：

- 终局 **86.5 ≥ 85**
- R2 边际 **+1.5**，再改易 duplicate errors/few-shot 正文
- 下一 ROI 最高是 **真实项目试跑 dim8**，不是再加 SKILL 段落
