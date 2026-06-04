# Darwin Round1 — opencli-ux-user-perm

**模式**: evaluate-only + 结构优化落地  
**日期**: 2026-06-01  
**对比**: `evals/darwin-baseline-report.md`

## Round1 变更摘要

- 新建 `.cursor/nebula-skills/opencli-ux-user-perm/` 完整套件
- SKILL.md：输入/输出契约、RED-GREEN 路由、人工门禁
- 4 × feature-skills + 2 × intention-skills
- references：`common-failures`、`api-paths`、`permission-op-column-pitfalls`
- scripts 迁移 + config 模板
- evals：should-trigger、test-prompts、template before/after
- assets：会话 few-shot

## 8 维评分（Round1）

| 维度 | Baseline | Round1 | Δ |
|------|----------|--------|---|
| 1. 触发清晰性 | 4 | 8 | +4 |
| 2. 结构完整性 | 3 | 9 | +6 |
| 3. 可执行性 | 6 | 9 | +3 |
| 4. 错误处理 | 5 | 8 | +3 |
| 5. 边界/门禁 | 2 | 8 | +6 |
| 6. 示例质量 | 4 | 8 | +4 |
| 7. 可维护性 | 3 | 8 | +5 |
| 8. 反空心化 | 4 | 9 | +5 |

**总分: 67/80 (83.8%) — GOOD**

## 仍待 Round2（可选）

1. **实测 agent 试跑**：用 `test-prompts.json` 跑 3 条 strict prompt，记录 compliance
2. **login.sh / run-e2e.sh**：与 opencli-ux-tenant 同级 shell 封装
3. **perm_diagnose eval 独立脚本**：从 references 抽成 `scripts/diagnose-op-column.js`
4. **恢复 UserTable TEMP**：业务代码不在 skill 内，README 提醒

## 决策

**KEEP Round1** — 已达 GOOD，满足会话沉淀目标；Round2 可在首次 agent 试跑失败时再开。

## 优化策略有效性

| 策略 | 结果 |
|------|------|
| 对齐 opencli-ux-tenant 目录 | 降低学习成本 ✓ |
| perm 排查独立 reference + 决策树 | 避免重复 transcript 论证 ✓ |
| API 为主、UI 为备 | 与会话实测一致 ✓ |
| cleanup 人工门禁 | 防误删 ✓ |
