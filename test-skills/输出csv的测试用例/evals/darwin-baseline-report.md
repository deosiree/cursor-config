# Darwin Baseline 报告：输出csv的测试用例

## Target

- `skill`: 输出csv的测试用例
- `path`: `.cursor/test-skills/输出csv的测试用例/`
- `mode`: `evaluate-only`
- `eval_mode`: `dry_run`

## 总体 8 维评分

| # | 维度 | 分数(0-10) | 观察 |
|---|------|:---:|------|
| 1 | **主入口质量** | 7 | SKILL.md 描述清晰、路由表完整、有使用示例；但 description 可更精炼 |
| 2 | **子 skill 厚度** | **2** | 9 个子 skill 全部只有 SKILL.md，0 个有 README/template/assets/references/evals |
| 3 | **边界条件覆盖** | 5 | 主 SKILL 有输入类型判断和检查点，但子 skill 边界靠少数规则而非系统化检查 |
| 4 | **检查点设计** | 6 | 主 SKILL 有 RED 追问和写入前暂停；子 skill 内部无独立检查点 |
| 5 | **指令具体性** | 7 | SKILL.md 的 GREEN 工作流较具体；新子 skill（UI路径）做到了 task/input/output/boundary/example |
| 6 | **资源整合度** | 5 | references/ 有 7 个文件；scripts/ 有 4 个；但 assets/ 仅 2 个 few-shot，evals/ 仅 4 条 prompts |
| 7 | **整体架构** | 7 | intention/feature 分层合理、路由表完整、3 条路径（API/UI/口述）覆盖完备 |
| 8 | **实测表现** | 4 | 仅 dry_run 推演，未做 full_test；新脚本（append_ui_cases_to_csv.py）和新增子 skill 未验证 |

**总分：43 / 80 → 53.8 / 100**

## 各子 skill 空心化明细

| 子 skill | SKILL.md | README | template | assets | references | evals | 分数 |
|----------|:--------:|:------:|:--------:|:------:|:----------:|:-----:|:----:|
| intention/基于test.ts生成 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | 20% |
| intention/沉淀模块配置 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | 20% |
| intention/边开发边输出UI用例 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | 30%* |
| intention/基于源码+口述生成 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | 30%* |
| feature/api-基于test.ts生成 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | 20% |
| feature/gateway-基于test.ts生成 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | 20% |
| feature/撰写UI交互cases | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | 30%* |
| feature/用例质量自检 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | 30%* |
| feature/darwin拓展发现 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | 20% |

*新节点有 task/input/output/boundary/example，SKILL 厚度更好但缺结构。

## 最弱维度

1. **子 skill 厚度** (2/10) — 全部空心，影响最大
2. **实测表现** (4/10) — 新脚本和新节点未验证
3. **资源整合度** (5/10) — assets/evals 贫瘠

## 建议下一步

- **Round 1 实心化**：补 README + template + evals 到全部 9 个子 skill（最大 ROI）
- 实心化后重评，目标 ≥68 分
- 然后补充测试 evals 验证脚本行为
