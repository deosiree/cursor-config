# Darwin R0 Baseline · 推送草稿+revert…（hotfix 整包收回后）

> `mode`: evaluate-only → optimize  
> `evalMode`: `dry_run`  
> `date`: 2026-09-23  
> `note`: 相对旧 HL-4（88.7）套件已增 `hotfix_during_review` + 整包收回语义，**重新开基线**

## 失败基线

| 项 | 内容 |
| --- | --- |
| 典型提法 | 推草稿；审查；CI 挂了先修再整包收回；revert 系列上最终版 |
| 易跳过 | 热修后误 `stash pop`；publish 只 revert B 漏 H；series_tip 夹他人提交未确认 |
| 误触发 | force-with-lease；脏树裸 checkout develop |
| 资产缺口 | `darwin-dry-run.md` 仍停在 6 条旧 prompt，未覆盖 P7/P8 整包收回 |

## 8 维（0–10）

总分 = Σ(维度分 × 权重) / 10。

| 维度 | 权重 | 分 | 加权 | 依据 |
| --- | ---: | ---: | ---: | --- |
| Frontmatter 质量 | 8 | 8.8 | 7.0 | 含热修/整包触发与反触发 |
| 工作流清晰度 | 15 | 8.0 | 12.0 | 四阶段+收回易与「pop 旧 WIP」混淆 |
| 边界条件覆盖 | 10 | 8.5 | 8.5 | 有系列/他人提交门；仍可更显式 |
| 检查点设计 | 7 | 9.0 | 6.3 | 含 RECLAIM-SERIES |
| 指令具体性 | 15 | 8.2 | 12.3 | feature 有命令；父级收回样例偏短 |
| 资源整合度 | 5 | 9.0 | 4.5 | 节点/template/refs 齐 |
| 整体架构 | 15 | 8.8 | 13.2 | intention/feature；父级略厚 |
| 实测表现 | 25 | 7.5 | 18.8 | prompts 有 P7/P8，dry_run 矩阵未更新 |
| **总分** | | | **82.6** | |

## 最弱维度（优化顺序）

1. **实测表现 (7.5)**  
2. **工作流清晰度 (8.0)**  
3. **指令具体性 (8.2)**  

## nextAction

R1：只改实测 — 更新 dry_run 矩阵覆盖 P7/P8 整包收回。
