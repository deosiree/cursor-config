# Darwin baseline（evaluate-only）

- **target**: `推送草稿+revert草稿，待审核结束再推送最终版本`
- **date**: 2026-09-22
- **mode**: `evaluate-only`（不进入 optimize 循环）
- **darwinIntegrationMode**: 桥接 `huiyanSkills/darwin-skill`；本轮仅落盘基线材料

## 失败基线（落盘前）

| 项 | 基线 |
| --- | --- |
| 典型提法 | 「先推草稿给后端，再本地改，最后 revert 再推最终」 |
| 空目录风险 | 无 SKILL → agent 会 improvise force-push |
| 长名字风险 | 日后想不起职责 → README 必须一句话置顶 |
| 误触发 | 与 merge / cherry-pick / 沙盒 / 私有分支强推混淆 |

## 结构门禁

| 检查 | 结果 |
| --- | --- |
| 父级 README + SKILL | 有 |
| intention 5 节点均有任务/输入/输出/边界/示例 | 有 |
| feature 9 节点同上 | 有 |
| template / assets / references / evals | 有 |
| README 一句话 + 口令 + 远端历史 | 有 |
| 禁止 force / hard reset 写进父级硬约束 | 有 |

## 维度速评（1–5，dry_run 文档审阅）

| 维度 | 分 | 备注 |
| --- | --- | --- |
| 触发清晰 | 4 | description 含正/负触发 |
| 流程可执行 | 4 | 三编排 + feature 命令齐 |
| 安全约束 | 5 | 禁强推、禁 hard、revert 要 SHA |
| 边界与邻近 | 4 | 有边界文；已计划同步沙盒边界 |
| 可检索性 | 5 | README 一句话解决长名 |
| 子节点非空心 | 4 | 均含示例；未再拆 README |
| 实测表现 | n/a | 本轮不实跑 git；标 dry_run |
| evals 覆盖 | 4 | 正/误/多 commit |

**综合（不含实测）**: ~4.3 / 5

## 最弱维度

- 子节点无独立 README（与沙盒部分 feature 一致，可接受）
- 未做真实仓库 controlled-trial

## trialPlan

使用 [[test-prompts.json]]：P1–P4 做路由 dry-run；不修改用户业务仓。

## keepOrRevertRule

- 本轮为**新建落盘**，无旧版可 revert。
- 后续若 optimize：单轮只改一个最低维；总分不升则 `git revert` 该文档提交；**禁止** `reset --hard`。
- 用户未要求 optimize → **收手**，保持 evaluate-only。

## suiteCompletionStage

`structure_complete + baseline_recorded`；建议下一阶段仅在用户要求时做 controlled-trial。
