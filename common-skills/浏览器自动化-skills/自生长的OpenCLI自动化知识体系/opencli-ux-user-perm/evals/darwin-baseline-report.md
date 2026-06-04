# Darwin Baseline — opencli-ux-user-perm

**模式**: evaluate-only（基于会话产物反推 MVP 草稿，未跑独立 agent 试跑）  
**日期**: 2026-06-01  
**Skill 路径**: 自生长的OpenCLI自动化知识体系/opencli-ux-user-perm（原 .cursor/nebula-skills/ → 合并后迁移）

## 评估对象

会话结束前仅有散落脚本：

- `scripts/create-seed-users.js`（原 .cursor/test-skills → 移入 user-perm 子 skill）
- `scripts/create-users-via-ui.js`（同上）
- `scripts/cleanup-users-to-n.js`（同上）

无 SKILL.md、无 references、无 evals、无 intention/feature 分层。

## 8 维评分（baseline MVP ≈ 单文件注释 + 3 脚本）

| 维度 | 分 | 说明 |
|------|-----|------|
| 1. 触发清晰性 | 4/10 | 无 frontmatter description，agent 不会自动选用 |
| 2. 结构完整性 | 3/10 | 仅 .js，无 README/references/evals |
| 3. 可执行性 | 6/10 | 脚本在本会话已跑通，但路径/API 经验在对话里 |
| 4. 错误处理 | 5/10 | 脚本有 try/catch，无统一 failures 索引 |
| 5. 边界/门禁 | 2/10 | 无批量删除确认、无 CHANGE_ME 拦截 |
| 6. 示例质量 | 4/10 | 文件头一行用法，无 PowerShell/bind 说明 |
| 7. 可维护性 | 3/10 | 与 tenant skill 未对齐，重复踩坑 |
| 8. 反空心化 | 4/10 | 权限排查知识未沉淀，仍依赖 transcript |

**总分: 31/80 (38.8%) — POOR**

## 主要缺陷

1. 无 nebula 项目级 skill 入口（违反 AGENTS 项目 skill 放 nebula-skills）
2. API forward/direct 路径、Vue InputEvent 未结构化
3. 「只有编辑」易与 perm 绑错混淆，缺排查决策树
4. UI 脚本与 API 脚本主路径未声明
5. 无 Darwin should-trigger / test-prompts

## 优化策略（Round1）

| 优先级 | 动作 | 预期增益 |
|--------|------|----------|
| P0 | 完整 SKILL.md + intention/feature 路由 | +触发、+结构 |
| P0 | references 三件套（failures/api/perm） | +可执行、+反空心 |
| P1 | 迁移 scripts + config 模板 | +可维护 |
| P1 | evals + template before/after | +边界、+示例 |
| P2 | assets 会话 few-shot | +示例质量 |

## Baseline 结论

**不 keep 散落脚本形态**；进入 write-skill 完整套件 + Round1 优化。
