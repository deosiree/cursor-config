# Darwin hill-climbing 记录

**套件**：微服务-qiankun-主子通信  
**模式**：evaluate + hill-climbing（文档 only，不改 nebula 业务代码）  
**停止条件**：总分 ≥85 **或** HL-4（连续 2 轮 Δ < 2）  
**日期**：2026-06-23

---

## Round 0 — Baseline

**总分：82.6**

| # | 维度 | 权重 | 分/10 | 加权 |
|---|---|---|---|---|
| 1 | Frontmatter | 7 | 9 | 6.3 |
| 2 | 工作流 | 12 | 8 | 9.6 |
| 3 | 失败模式 | 12 | 8 | 9.6 |
| 4 | 检查点 | 6 | 6 | 3.6 |
| 5 | 可执行性 | 17 | 9 | 15.3 |
| 6 | 资源整合 | 4 | 9 | 3.6 |
| 7 | 架构 | 12 | 9 | 10.8 |
| 8 | 实测 | 23 | 8 | 18.4 |
| 9 | 反例黑名单 | 6 | 9 | 5.4 |

**短板**：dim4 无显性 CHECKPOINT；template 偏薄；子 skill 缺输入契约/失败分支。

---

## Round 1 — 加厚 P0+P1

**改动摘要**：

- `template/` 重组：`用户信息同步/` + `电站切换/` before|after + README
- 3 intention：何时使用/输入契约/失败分支/CHECKPOINT/rg 命令
- 6 feature：决策树、rg、traceability 自检、选型表
- 主 SKILL：CHECKPOINT、验证要求、负例关键词

**总分：86.2**（Δ +3.6）✅ ≥85

| # | 维度 | 分/10 | 加权 | Δ |
|---|---|---|---|---|
| 1 | Frontmatter | 9 | 6.3 | — |
| 2 | 工作流 | 9 | 10.8 | +1.2 |
| 3 | 失败模式 | 9.5 | 11.4 | +1.8 |
| 4 | 检查点 | 9 | 5.4 | +1.8 |
| 5 | 可执行性 | 9.5 | 16.15 | +0.85 |
| 6 | 资源整合 | 9.5 | 3.8 | +0.2 |
| 7 | 架构 | 9 | 10.8 | — |
| 8 | 实测 | 8.5 | 19.55 | +1.15 |
| 9 | 反例 | 9.5 | 5.7 | +0.3 |

**dim8 试跑（T1–T3）**：仍 PASS；输出现含 CHECKPOINT 与 template 路径。

---

## Round 2 — 边际优化

**改动摘要**：

- `evals/test-prompts.json` 新增
- `evals.json` F1/F2 增加 negativeReason
- `README.md` 同步 template 结构与 CHECKPOINT

**总分：87.1**（Δ +0.9）

| # | 维度 | 变化 |
|---|---|---|
| 6 | 资源整合 | +0.2（test-prompts 补全） |
| 8 | 实测 | +0.35（负例边界更明确） |
| 其余 | — | 无结构性提升空间 |

---

## HL-4 拐点判定

| 轮次 | Δ |
|---|---|
| Round 1 | +3.6 |
| Round 2 | +0.9 |

**Round 2 Δ < 2**；若 Round 3 预期再 < 2 → **触顶，建议收手**。

Round 3 预演（未执行）：再加篇幅只会重复 few-shot/references，预计 Δ < 1。

**结论：在 Round 2 停止 hill-climbing。**

---

## 当前最值得优化的点（若继续）

1. **dim8 真实子 agent 试跑**（非 dry_run）— 需独立 agent 带/不带 skill 对比，当前为结构化推演
2. **主→子 props 独立 few-shot** — 计划标注「第二期」，T5 test-prompt 仅有文字无样本
3. **dim4 再提升** — 可在编排 Step 3/4 各加 🔴 CHECKPOINT（边际低）

## 收手建议

**建议收手。** 理由：

- 已 **87.1 ≥ 85**
- Round 2 边际 **+0.9 < 2**，进入 HL-4 触顶区
- 继续堆文档会 duplicate references/few-shot，违反「主 skill 瘦身」原则
- 下一 ROI 最高的是 **真实项目试跑 dim8**，不是再加 SKILL 段落

---

## Runtime 扫描

**runtime_warn=0**
