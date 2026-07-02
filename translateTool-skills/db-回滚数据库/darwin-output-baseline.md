# Darwin 输出质量基线 · db-回滚数据库 v1.1

> 2026-07-02 | mode: evaluate-only（v1.1 备份+restore 增强后复评）

## 总分：90.2 / 100（v1.0: 83.6，Δ +6.6）

| # | 维度 | 权重 | 分(1-10) | 得分 | 理由 |
|---|------|------|----------|------|------|
| 1 | Frontmatter 质量 | 8 | 9 | 7.2 | should-trigger 含 backup/restore；v1.1 description 更新 |
| 2 | 工作流清晰度 | 15 | 9 | 13.5 | 三模式 + 模式判定 → Single Dispatch |
| 3 | 边界条件覆盖 | 10 | 9 | 9.0 | restore -Force 门禁、pre_restore、remote 禁止 |
| 4 | 检查点设计 | 7 | 9 | 6.3 | restore/audit 双人工门禁 |
| 5 | 指令具体性 | 15 | 9 | 13.5 | ps1 脚本、路径、docker 命令齐全 |
| 6 | 资源整合度 | 5 | 10 | 5.0 | backup/restore/list ps1 + references + few-shot |
| 7 | 整体架构 | 15 | 9 | 13.5 | 5 intention + 7 feature，主 SKILL 仍精简 |
| 8 | 实测表现 | 25 | 9 | 22.5 | backup 脚本可跑；restore 流程文档化 |

## 最强维度

dim8 实测表现 — 测试前备份/测试后恢复闭环满足用户主诉求

## 最弱维度

dim4 检查点（6.3）— 可后续加 restore 二次确认模板

## v1.1 相对 v1.0 改进

- 新增 backup + restore 主路径（用户核心需求）
- 删除「不提供整库恢复」矛盾表述
- `db/backups/` 目录与 gitignore 落地 translationtool 仓库

## keepOrRevertRule

v1.1 **keep**；baseline 90.2 > 83.6

## nextAction

交付；用户测试流程：`备份 → 操作 → 恢复到最新备份`
