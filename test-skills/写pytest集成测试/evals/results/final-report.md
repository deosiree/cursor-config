# Darwin 优化终局报告 — 写pytest集成测试

**日期**：2026-06-26  
**停止原因**：✅ 总分 **86.9 ≥ 85** 且 **HL-4 触顶**（Round 5 Δ=+0.7，Round 6 Δ=+0.6，连续两轮 < 2）

## 分数轨迹

| Round | 总分 | Δ | 主要改动 |
|------:|-----:|--:|----------|
| 0 | 65.1 | — | 初评 |
| 1 | 72.3 | +7.2 | HL-2 失败兜底表 + HL-1 🔴 CHECKPOINT |
| 2 | 76.8 | +4.5 | 工作流步骤表 + pytestOutputPlan 模板 |
| 3 | 81.2 | +4.4 | test-prompts expectedOutput + dry_run 推演 |
| 4 | 85.6 | +4.4 | frontmatter 收紧 + Agent 红灯动作表 |
| 5 | 86.3 | +0.7 | 资源速查表 |
| 6 | 86.9 | +0.6 | 工作流序号化 → **HL-4 break** |

## Round 6 九维明细

| # | 维度 | 分(1-10) | 加权 |
|---|------|--------:|-----:|
| 1 | Frontmatter | 9 | 6.3 |
| 2 | 工作流清晰度 | 8 | 9.6 |
| 3 | 失败模式编码 | 8 | 9.6 |
| 4 | 检查点设计 | 8 | 4.8 |
| 5 | 可执行具体性 | 8 | 13.6 |
| 6 | 资源整合度 | 9 | 3.6 |
| 7 | 整体架构 | 8 | 9.6 |
| 8 | 实测表现 | 8 | 18.4 |
| 9 | 反例黑名单 | 9 | 5.4 |

**总分：86.9 / 100**

## 现在最值得优化的点（若继续）

按 **投入产出比** 排序：

| 优先级 | 点 | 预期 Δ | 说明 |
|--------|-----|--------|------|
| P0 | **dim8 full_test** | +2~4 | 在 Gateway+DB 环境对 `crud-new-tenant-test` 实跑；当前 100% dry_run，dim8 可信度上限 |
| P1 | **子 skill 同步 CHECKPOINT** | +0.5~1 | intention/feature 6 个文件补 1 行 STOP 规则（父 skill 已覆盖 80%） |
| P2 | **template after 可拷贝代码块** | +0.5~1 | `新模块骨架/after` 从说明升级为完整最小 utils/conftest 片段 |
| P3 | **第二后端 few-shot** | +0~1 | terminology-agent 未来 HTTP 层样本；当前范围外 |

**不建议继续 hill-climbing 父 SKILL.md**：Round 5–6 已进入 HL-4 边际递减区，再改易凑字数（Darwin 反模式 #3）。

## 建议：收手还是继续？

### 建议 **收手**（针对父 SKILL Darwin 循环）

- 已达 **86.9 > 85** 目标线
- **HL-4 已触发**，继续微调父文档边际收益 < 2 分/轮
- 结构、检查点、失败兜底、反模式、输出模板均已就位

### 若继续，只做 **一件事**（非 hill-climbing）

在 seccenter 环境跑 **1 次 full_test**（`crud-new-tenant-test`），把结果写入 `evals/results/`，dim8 才有实证支撑——这比再改 SKILL 正文更值得。

## 日志

详见 [[darwin-results.tsv]]、[[baseline-round0.md]]、[[dry-run-evaluation.md]]。
