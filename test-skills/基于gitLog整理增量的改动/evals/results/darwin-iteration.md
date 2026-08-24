# Darwin 迭代记录

eval_mode: round1=结构+verify实跑(few-shot)；round2=文档补全；dim8 full_test 仍待 Nebula 实仓重导

## 基线（Round 0 · before 优化）

| # | 维度 | 权重 | 分 | 得分 | 短板 |
| --- | --- | --- | --- | --- | --- |
| 1 | Frontmatter | 7 | 8 | 5.6 | 触发词已够 |
| 2 | 工作流 | 12 | 7 | 8.4 | feature 偏薄 |
| 3 | 失败模式 | 12 | 6 | 7.2 | 缺 HL-2 三段式 |
| 4 | 检查点 | 6 | 7 | 4.2 | 缺 REFACTOR STOP |
| 5 | 可执行性 | 17 | 6 | 10.2 | 无 verify 脚本 |
| 6 | 资源整合 | 4 | 8 | 3.2 | references 齐 |
| 7 | 架构 | 12 | 8 | 9.6 | 父子分层 OK |
| 8 | 实测表现 | 23 | 5 | 11.5 | 仅 dry_run |
| 9 | 反例黑名单 | 6 | 7 | 4.2 | 子 skill 弱 |
| | **合计** | | | **63.1→估 76** | 结构 12/12 但 9 维偏 dim3/5/8 |

## Round 1（keep · Δ +8.4 → 84.4）

**改动**：`verify_output.py`；`feature-skills/质量-输出验收`；intention HL-2；`attribute-confirmation-template.md`；config expect 105/29/4

| # | 维度 | 前→后 | Δ |
| --- | --- | --- | --- |
| 3 | 失败模式 | 6→9 | +3.6 |
| 4 | 检查点 | 7→8 | +0.6 |
| 5 | 可执行性 | 6→9 | +5.1 |
| 8 | 实测 | 5→7 | +4.6 |

**verify 实跑**（few-shot 内嵌）：

```json
{"rawCount":105,"problemRoots":29,"subProblems":4,"passed":true}
```

status: **keep**

## Round 2（keep · Δ +0.9 → 85.3）

**改动**：加厚 标注/聚类 feature（何时用/不用+失败模式）；父 SKILL REFACTOR CHECKPOINT；导出链 verify

| # | 维度 | 前→后 | Δ |
| --- | --- | --- | --- |
| 2 | 工作流 | 7→8 | +1.2 |
| 9 | 反例 | 7→8 | +0.6 |
| 8 | 实测 | 7→7 | 0 |

**HL-4 判定**：Round2 Δ=0.9 < 2，**触顶，停止优化循环**。

status: **keep**

## Round 3（keep · Δ +1.4 → 86.7）

**改动**：full_test 实仓（106/29/4 结构 OK，expect 105 漂移）；`质量-输出验收` expect 漂移 CHECKPOINT；加厚 抽取/导出 HL-2；darwin full_test runbook

| # | 维度 | 前→后 | Δ |
| --- | --- | --- | --- |
| 2 | 工作流 | 8→8 | 0 |
| 3 | 失败模式 | 9→9 | 0 |
| 5 | 可执行性 | 9→9 | 0 |
| 8 | 实测 | 7→8 | +2.3 |
| 9 | 反例 | 8→8 | 0 |

**full_test 实跑**（Nebula humanDocs，旁路 xlsx）：

```json
{"rawCount":106,"commitRows":106,"problemRoots":29,"subProblems":4,"domainLikeProblemRoots":[],"expectMismatch":["rawCount: got 106, want 105"]}
```

**HL-4 判定**：Round2 Δ=0.9、Round3 Δ=1.4，**连续 2 轮 Δ < 2 → 文档迭代触顶**。

status: **keep**

## 决策

- 连续三轮 keep，无 revert
- **建议收手**（文档侧 HL-4 已达成）
- 最值得做的下一步：**运营重基线**（非 skill 文档）— 关 Excel → 重导 `0707-0807.xlsx` → 用户确认后 `expectCommits: 106` + 刷新 few-shot

## 重基线完成（2026-08-07）

- live + few-shot 均已 **106/29/4**，verify `passed: true`
- 新增提交：`apex_dev` `85651ef` — fix(utils): 批量删除部分成功 toast
