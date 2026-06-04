# Darwin Round 1 — opencli-ux-api-whitelist

**日期**: 2026-06-04  
**状态**: keep（总分严格高于 baseline）  
**eval_mode**: dry_run（结构重评 + test-prompts 推演；维度 8 仍建议本地 full_test）

## 改动摘要

| 文件 | 改动 |
|------|------|
| `SKILL.md` | Phase 0→4 主线；🔴 人工门禁表；if-then fallback 表 |
| `references/api-whitelist-table-e2e-pitfalls.md` | 修复 README-e2e 断链 |
| `feature-skills/真实数据种子插入/SKILL.md` | 插种前 🔴 CHECKPOINT |
| `evals/test-prompts.json` | 新增 `whitelist-btn-perm-missing` |
| `evals/should-trigger.md` | 补充权限/not_found 触发词 |

## 分数变化

| # | 维度 | Before | After | Δ |
|---|------|--------|-------|---|
| 2 | 工作流清晰度 | 7 | 8 | +1 |
| 3 | 失败模式编码 | 9 | 9 | 0 |
| 4 | 检查点设计 | 5 | 8 | +3 |
| 6 | 资源整合度 | 6 | 9 | +3 |
| 8 | 实测表现 | 7.5 | 8 | +0.5 |
| 其他 | 1/5/7/9 | — | — | 持平 |

| 总分 | Before | After | Δ |
|------|--------|-------|---|
| **加权** | **76.5** | **82.4** | **+5.9** |

## test-prompts Round1

| id | 推演 |
|----|------|
| whitelist-scroll-full | ✅ |
| whitelist-scroll-skip-seed | ✅ |
| whitelist-btn-perm-missing | ✅ 命中 fallback 表 + 权限补丁路径 |

## 触顶判断

单轮 Δ=+5.9 > 2，未触顶；若 Round2 边际 <2 可停止。

## 下一步（可选 Round2）

- 主 SKILL 增加 `run-e2e.ps1` 薄封装（对齐 user-perm）
- 本地 full_test 更新 dim8 为实测分
