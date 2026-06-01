# Darwin Round 1 报告：输出csv的测试用例

## 本轮变更

| 改动 | 数量 |
|------|:----:|
| 新增 README.md | 9 个子 skill |
| 新增 template/README.md | 9 个子 skill |
| 新增 evals/test-prompts.json | 9 个子 skill |
| 合计新增文件 | 27 个 |

## 8 维评分（Round 1 vs Baseline）

| # | 维度 | Baseline | R1 | Δ | 依据 |
|---|------|:--------:|:--:|:-:|------|
| 1 | **主入口质量** | 7 | 7 | 0 | 未修改 SKILL.md |
| 2 | **子 skill 厚度** | **2** | **6** | +4 | 9 子 skill 均有了 README+template+evals；但 template 仅为说明壳，缺真实样本文件 |
| 3 | **边界条件覆盖** | 5 | 6 | +1 | evals 新增了边界 prompt（无 domain、路径不匹配）；仍缺更多失败场景覆盖 |
| 4 | **检查点设计** | 6 | 6 | 0 | 2 个 intention 已有质量自检步骤，其余未变 |
| 5 | **指令具体性** | 7 | 7 | 0 | SKILL.md 工作流未变 |
| 6 | **资源整合度** | 5 | 7 | +2 | evals 从 4 条→22 条（9 个子 skill × 2-3 条）；assets/ 仍只有 2 个 few-shot |
| 7 | **整体架构** | 7 | 7 | 0 | 架构未变 |
| 8 | **实测表现** | 4 | 4 | 0 | 仍为 dry_run，未 full_test |

**总分：50 / 80 → 62.5 / 100**（Baseline 53.8，+8.7）

## 各子 skill 厚度明细（Round 1）

| 子 skill | SKILL | README | template | assets | refs | evals | 厚度率 |
|----------|:-----:|:------:|:--------:|:------:|:----:|:-----:|:------:|
| intention/基于test.ts生成 | ✅ | ✅ | ⚠️壳 | ❌ | ❌ | ✅ | 50% |
| intention/沉淀模块配置 | ✅ | ✅ | ⚠️壳 | ❌ | ❌ | ✅ | 50% |
| intention/边开发边输出UI用例 | ✅ | ✅ | ⚠️壳 | ❌ | ❌ | ✅ | 50% |
| intention/基于源码+口述生成 | ✅ | ✅ | ⚠️壳 | ❌ | ❌ | ✅ | 50% |
| feature/api-基于test.ts生成 | ✅ | ✅ | ⚠️壳 | ❌ | ❌ | ✅ | 50% |
| feature/gateway-基于test.ts生成 | ✅ | ✅ | ⚠️壳 | ❌ | ❌ | ✅ | 50% |
| feature/撰写UI交互cases | ✅ | ✅ | ⚠️壳 | ❌ | ❌ | ✅ | 50% |
| feature/用例质量自检 | ✅ | ✅ | ⚠️壳 | ❌ | ❌ | ✅ | 50% |
| feature/darwin拓展发现 | ✅ | ✅ | ⚠️壳 | ❌ | ❌ | ✅ | 50% |

⚠️壳 = template/ 仅有 README.md 说明，无真实样本文件

## HL（边际收益）分析

| 层次 | 当前收益 | 继续投入 | 预期提升 |
|------|---------|---------|---------|
| **HL-1** 结构存在性 | ✅ 完成 | — | — |
| **HL-2** 内容充实度 | ⏳ template 仅说明壳 | 补 9 个子 skill 的真实模板文件 | +6~8 分 |
| **HL-3** 跨节点一致性 | ❌ 未检查 | 验证所有 [[链接]] 可解析 | +3~5 分 |
| **HL-4** 执行验证 | ❌ 未做 | full_test 试跑 2-3 条路径 | +5~8 分 |

**当前 HL 层级：HL-2（内容充实度）**

## 最弱维度（继续优化方向）

1. **template 说明壳→真实样本**（HL-2，ROI 中）
2. **实测表现：dry_run→full_test**（HL-4，ROI 高但成本高）
3. **子 skill 缺 assets/references**（HL-2，ROI 中低）
