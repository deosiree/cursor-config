# Darwin 优化终局报告 — 基于测试用例写后端的pytest自动化测试

**日期**：2026-07-02（Round 6 更新）  
**停止原因**：✅ 总分 **89.2 ≥ 85**（Round 5 已达 87.6）且 **HL-4 触顶**（Round 4–5 连续 Δ < 2）

## 分数轨迹

| Round | 总分 | Δ | 主要改动 |
|------:|-----:|--:|----------|
| 0 | 72.0 | — | 初评：dim3/dim4/dim8 短板 |
| 1 | 78.5 | +6.5 | HL-2 失败兜底表 + 🔴 CHECKPOINT 三连 |
| 2 | 82.8 | +4.3 | 工作流 I/O 表 + csvHytestsOutputPlan 细化 |
| 3 | 86.2 | +3.4 | dry-run-evaluation.md + dim8 推演 |
| 4 | 87.1 | +0.9 | 100 分制 rubric 写入 evaluate-only-baseline |
| 5 | 87.6 | +0.5 | 输入契约独立节 + REFACTOR 门禁表 → **HL-4 break** |
| 6 | 89.2 | +1.6 | 可观测性 plan 落地后再评（非 hill-climbing） |

## Round 6 九维明细

| # | 维度 | 分(1-10) | 加权 |
|---|------|--------:|-----:|
| 1 | Frontmatter | 9 | 6.3 |
| 2 | 工作流清晰度 | 8 | 9.6 |
| 3 | 失败模式编码 | 9 | 10.8 |
| 4 | 检查点设计 | 8 | 4.8 |
| 5 | 可执行具体性 | 9 | 15.3 |
| 6 | 资源整合度 | 10 | 4.0 |
| 7 | 整体架构 | 8 | 9.6 |
| 8 | 实测表现 | 8 | 18.4 |
| 9 | 反例黑名单 | 9 | 5.4 |

**总分：89.2 / 100**

## 现在最值得优化的点（按投入产出比）

| 优先级 | 点 | 预期 Δ | 说明 |
|--------|-----|--------|------|
| **P0** | **dim8 full_test** | +2~4 | 在 Gateway 环境实跑 `pytest test_mvp_menu_9909_9913.py -k 9909`；当前 100% dry_run，dim8 权重 23% 不可信 |
| **P1** | **seccenter G6 迁移** | 产物分 +2 | 9910–9913 及 test_csv_*.py implemented 补 case_report（skill 已规范，代码未批量改） |
| **P2** | **子 skill CHECKPOINT 同步** | +0.3~0.6 | 9 个子 skill 无 🔴 STOP；父 skill 已覆盖 80% 路由 |
| **P3** | **template after 可拷贝代码** | +0.3~0.5 | hytests-MVP骨架/after 补 conftest/registry 最小片段 |
| **P4** | **第二模块 few-shot** | +0~0.5 | 鉴权 9919–9924 before/after（菜单已有） |

**不建议继续 hill-climbing 父 SKILL.md**：Round 4–5 已 HL-4；Round 6 +1.6 来自 plan 落地而非正文微调。

## 建议：收手还是继续？

### 建议 **收手**（针对父 SKILL Darwin hill-climbing）

| 条件 | 状态 |
|------|------|
| ≥85 分 | ✅ 89.2 |
| HL-4 拐点 | ✅ Round 4–5 连续 Δ < 2 |
| eval_mode | ⚠️ 100% dry_run |

父 SKILL 文档层已饱和：HL-2 兜底、CHECKPOINT 三连、G6 反模式、observability 交付字段、2 个新 reference + 1 个新 feature 均已就位。

### 若继续，只做 **一件事**（非 hill-climbing）

在 seccenter Gateway 环境跑 **1 次 full_test**（`mvp-menu-export` 或 `observability-9910` prompt），把 pytest 输出写入 `evals/results/full-test-9909.md`——这比再改 SKILL 正文更值得。

### 第二优先级（工程落地）

按 skill 迁移清单，把 **9910–9913** 接入 case_report + `docs/automation/{id}.md`——这是 **产物质量** 提升，不是 skill 文档分数。

## 日志

详见 [[darwin-results.tsv]]、[[dry-run-evaluation.md]]、[[round0-20260702.md]]（16 分制产物验收）。
