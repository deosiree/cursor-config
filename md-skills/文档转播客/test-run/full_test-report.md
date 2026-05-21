# full_test 报告 · 文档转播客

**日期**：2026-05-21  
**eval_mode**：`full_test`（主 agent 双轨执行；子 agent 因模型配额不可用）  
**源文**：`test-run/source-useEffect-mini.md`、`test-run/source-方案-10章.md`

## 测试矩阵

| ID | with_skill 产物 | baseline 产物 | validate |
| --- | --- | --- | --- |
| #2 教程 | `with_skill/播客朗读稿-useEffect.md` | `baseline/播客朗读稿-useEffect.md` | skill **通过** / baseline **失败**（5 项） |
| #4 N>7 | `with_skill/检查点A-回复.md`（仅话术） | `baseline/方案-10章-输出.md`（10 章旁白） | skill **未提前写稿** / baseline **静默超长** |

## test#2 对比

| 指标 | with_skill | baseline |
| --- | --- | --- |
| doc_type | `教程`（YAML） | 无 |
| 双人 U 型 | 主播/嘉宾 + 铺垫/追问 + 快问×5 | 单人旁白 |
| 场景钩子 | 学习者卡点（无限刷新） | 无 |
| 面试叙事 | 无 | 无 |
| 禁止四段标签 | 无 `## 定义/问题/解决/价值` | **有** 四段标题 |
| validate | ✅ | ❌ |

**维度 8 打分**：with_skill **9/10**；baseline **4/10**

## test#4 对比

| 指标 | with_skill | baseline |
| --- | --- | --- |
| 检查点 A 先行 | ✅ 合并/拆集二选一 | ❌ 未询问 |
| 确认前写全长稿 | ❌（符合预期） | ✅ 直接 10 章 |
| 可 TTS 双人稿 | 等待用户确认 | 超长单人稿，不可直接进 pipeline |

**维度 8 打分**：with_skill **10/10**；baseline **3/10**

## 综合（维度 8）

| 轨 | 均分 (test#2 + #4) |
| --- | --- |
| with_skill | **9.5** |
| baseline | **3.5** |
| **Δ** | **+6.0** |

skill 相对 baseline **显著优于**无 skill 默认输出，尤其在：禁四段标签、validate 可过、N>7 门禁。

## 总分更新（含 full_test）

| 维度 | r5 dry_run | full_test 后 |
| --- | --- | --- |
| 实测表现 (×25) | 9 | **9.5** |
| **总分** | 91.6 | **92.9** |

## 产物路径

```
test-run/
├── source-useEffect-mini.md
├── source-方案-10章.md
├── with_skill/
│   ├── 播客朗读稿-useEffect.md
│   └── 检查点A-回复.md
├── baseline/
│   ├── 播客朗读稿-useEffect.md
│   └── 方案-10章-输出.md
└── full_test-report.md
```

## 结论

- test#2、#4 的 `expected` **均已满足**（with_skill 轨）。
- 建议冻结 skill；后续可选对 test#1/#3 补跑同法 full_test。
