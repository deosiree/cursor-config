# 模板说明

本目录样本用于**印证**主 skill 两条 gateway 通则，不是「租户专用 skill」。

| 通则 | 说明 |
|------|------|
| 通则一 | 仅原子 gateway 使用 `handleGatewayError` |
| 通则二 | gateway 互引用方法内 `await import()` |

阅读前：`[[../SKILL.md]]` 需求类型 A/B/C 表。

## 案例 A：纯新增接口（结构示意）

`[[menu-function-api-add/before]]` → `[[menu-function-api-add/after]]`

- 印证**类型 A**：四层目标形态
- 非 git 真实源码

## 案例 B：通则一 + 通则二（真实源码）

`[[tenant-delete-orchestration/before]]` → `[[tenant-delete-orchestration/after]]`

- 基线：`apex_dev` `f734a7b^`；成品：`f734a7b`
- 文件：`device.gateway.ts`、`tenant.gateway.ts`、`tenant/index.vue`
- **业务域是租户**，规则适用于菜单导出、多 API 编排等任意模块

对照要点：

- 原子 `getBind` / `deviceActivate` vs 集成 `unbindAllByTenantId` / `deleteV2`
- `deleteV2` 仅对 `TenantAPI.deleteV2` 包 `handleGatewayError`
- 跨 gateway 动态 import
