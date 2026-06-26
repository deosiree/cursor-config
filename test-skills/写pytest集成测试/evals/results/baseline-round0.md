# Darwin Baseline — 写pytest集成测试（Round 0）

- **skill**: `test-skills/写pytest集成测试/SKILL.md`
- **mode**: full Darwin optimize loop
- **eval_mode**: dry_run（无 live Gateway 环境，dim8 为 test-prompts 推演）

## 9 维评分（Round 0）

| # | 维度 | 权重 | 分(1-10) | 加权 |
|---|------|-----:|--------:|-----:|
| 1 | Frontmatter | 7 | 8 | 5.6 |
| 2 | 工作流清晰度 | 12 | 7 | 8.4 |
| 3 | 失败模式编码 | 12 | 5 | 6.0 |
| 4 | 检查点设计 | 6 | 4 | 2.4 |
| 5 | 可执行具体性 | 17 | 7 | 11.9 |
| 6 | 资源整合度 | 4 | 8 | 3.2 |
| 7 | 整体架构 | 12 | 8 | 9.6 |
| 8 | 实测表现 | 23 | 6 | 13.8 |
| 9 | 反例黑名单 | 6 | 7 | 4.2 |

**总分：65.1 / 100**

## 最弱维度（优化优先级）

1. **dim4 检查点** — 无 🔴/STOP 显性标记
2. **dim3 失败模式** — 仅有反模式列表，无 if-then 兜底表
3. **dim8 实测** — test-prompts 无 expectedOutput，未 dry_run 推演

## HL 诊断

- **HL-3**：dim2/3/4 为相关簇 → Round 1 同步修 dim3+dim4
- **HL-4**：未触顶（首轮 Δ 大）
