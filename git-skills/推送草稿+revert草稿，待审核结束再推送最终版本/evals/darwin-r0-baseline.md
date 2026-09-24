# Darwin R0 Baseline · 推送草稿+revert…

> `mode`: evaluate-only → 即将进入 optimize  
> `evalMode`: `dry_run`  
> `target`: `git-skills/推送草稿+revert草稿，待审核结束再推送最终版本`  
> `date`: 2026-09-22

## 失败基线

| 项 | 内容 |
| --- | --- |
| 典型提法 | 先推 develop 草稿 → 本地 reset 审查 → revert → 最终版 |
| 易跳过 | 漏记 `draftSha`；在 develop 上裸 reset；push 前无确认块 |
| 误触发 | force-with-lease 特性分支；merge 整支；开沙盒 |
| 输出不稳 | 缺统一验收字段时 phase/SHA 丢失 |

## 测试提示词

见 [[test-prompts.json]]（P1–P4；优化轮次将扩展）。

## 8 维评分（0–10）

总分 = Σ(维度分 × 权重) / 10。

| 维度 | 权重 | 分 | 加权 | 依据 |
| --- | ---: | ---: | ---: | --- |
| Frontmatter 质量 | 8 | 8.5 | 6.8 | 中文 name/description，正负触发齐全 |
| 工作流清晰度 | 15 | 8.5 | 12.8 | 三 phase 路由清晰 |
| 边界条件覆盖 | 10 | 8.5 | 8.5 | 失败表 + 何时不用 |
| 检查点设计 | 7 | 7.0 | 4.9 | 检查点散落在编排，父级无总目录 |
| 指令具体性 | 15 | 8.0 | 12.0 | feature 有命令；父级确认块格式弱 |
| 资源整合度 | 5 | 9.0 | 4.5 | template/assets/references/evals 齐 |
| 整体架构 | 15 | 9.0 | 13.5 | intention/feature 分层正确 |
| 实测表现 | 25 | 7.0 | 17.5 | 仅 4 条薄 dry_run，无路由推演表 |
| **总分** | | | **80.5** | |

## 最弱维度（优化顺序）

1. **检查点设计 (7.0)** — 优先  
2. **实测表现 (7.0)** — 高权重次优先  
3. **指令具体性 (8.0)**

## nextAction

R1：只改「检查点设计」——在父级 `SKILL.md` 增加检查点总目录与确认块必填字段。
