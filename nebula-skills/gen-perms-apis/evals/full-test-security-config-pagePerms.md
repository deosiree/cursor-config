# full_test：安全配置 pagePerms 改码（2026-07-04）

> Darwin dim8 实测。Prompt：「继续实跑，改造角色管理、安全配置」

## 改前（RED）

| 问题 | 证据 |
|------|------|
| 3 个独立 computed 各调 checkHasPerm | `useSecurityConfigPage` canEditLoginPolicy/Password/Session |
| 无 models 集中类型 | 分散在 composable |

## 改后（GREEN）

| 文件 | 改动 |
|------|------|
| `security-config.models.ts` | `SecurityConfigPagePerms` 3 字段 |
| `useSecurityConfigPage.ts` | 单一 `securityPagePerms` computed；派生 canEdit* / canSave |

## 说明

安全配置为 Tab 表单页（非列表+OpItem），子 Card 无独立 perm 控件；Tab 可见性已由 `canEditLoginPolicy` 等派生字段控制，**无模态框断链**。

## 验证

| 项 | 结果 |
|----|------|
| checkHasPerm 仅 securityPagePerms 内 3 次 | ✅ |
| Linter | ✅ 无报错 |

## dim8 估分

9/10 — 已是 boolean 架构，本次为单 budget 收敛

## 结论

full_test **PASS**
