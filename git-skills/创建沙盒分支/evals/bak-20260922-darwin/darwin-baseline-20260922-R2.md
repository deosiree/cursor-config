# Darwin baseline · 创建沙盒分支

- `targetSkills`: 父级 `创建沙盒分支/SKILL.md`（套件）
- `mode`: evaluate-only → controlled-trial（dry_run）→ 单轮 optimize（检查点）
- `evalMode`: `dry_run`
- `darwinIntegrationMode`: 外部 `huiyanSkills/darwin-skill`

## testPrompts

见 [[test-prompts.json]]。

## dry_run 推演

| id | 带 skill 预期路径 | 结论 |
| --- | --- | --- |
| create-stash-happy | 分析→create→确认块→worktree→apply/drop→切仓/手开→验收 | pass |
| delete-unmerged-stop | delete→风险检查→STOP/CHECKPOINT，不擅自 remove | pass |
| misroute-merge | handoff_merge | pass |
| protect-develop | blocked | pass |

## baselineScorecard（优化前）

维度分 0–10；总分 = Σ(维度分 × 权重) / 10。

| 维度 | 权重 | 分 | 加权 |
| --- | ---: | ---: | ---: |
| Frontmatter 质量 | 8 | 9.0 | 7.2 |
| 工作流清晰度 | 15 | 9.0 | 13.5 |
| 边界条件覆盖 | 10 | 8.0 | 8.0 |
| 检查点设计 | 7 | 7.0 | 4.9 |
| 指令具体性 | 15 | 8.5 | 12.8 |
| 资源整合度 | 5 | 10.0 | 5.0 |
| 整体架构 | 15 | 9.0 | 13.5 |
| 实测表现 | 25 | 8.0 | 20.0 |
| **总分** | | | **84.9** |

`weakestDimensions`: 检查点设计（创建侧确认偏软）

## 单轮优化

- 改动：硬化 [[../intention-skills/编排-创建沙盒/SKILL.md]] CHECKPOINT-创建；父级补「失败模式」表
- `keepOrRevert`: keep（检查点与边界提升）

## scorecard（优化后）

| 维度 | 权重 | 分 | 加权 |
| --- | ---: | ---: | ---: |
| Frontmatter 质量 | 8 | 9.0 | 7.2 |
| 工作流清晰度 | 15 | 9.0 | 13.5 |
| 边界条件覆盖 | 10 | 9.0 | 9.0 |
| 检查点设计 | 7 | 9.0 | 6.3 |
| 指令具体性 | 15 | 8.5 | 12.8 |
| 资源整合度 | 5 | 10.0 | 5.0 |
| 整体架构 | 15 | 9.0 | 13.5 |
| 实测表现 | 25 | 8.5 | 21.3 |
| **总分** | | | **88.6** |

`new_score (88.6) > old_score (84.9)` → **keep**

## nextAction

套件可启用；若后续误触发增多，再收紧 frontmatter 触发词（下一轮只改 Frontmatter）。
