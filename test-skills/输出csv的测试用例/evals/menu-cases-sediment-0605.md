# 0605 菜单测试用例沉淀记录

**日期**：2026-06-05  
**原则**：已有 cases/config 的模块**不重复落盘**到新日期目录。

## 本次新增落盘

| 文件 | 来源 | 条数 |
|------|------|------|
| `docs/问题单/0605/menu-index-ui.csv` | `configs/menu-index-ui.*` | 8 |

## 未重复落盘（已存在）

| moduleId | 说明 |
|----------|------|
| `menu-perm-e2e` | cases 已在 `configs/menu-perm-e2e.cases.json`，原输出 `docs/问题单/0604/menu-perm-e2e.csv`；已删除误生成的 `0605/menu-perm-e2e.csv` |
| `menu-unit-gateway` | 见 `docs/问题单/0529/menu-unit-gateway.csv` |
| `menu-api-whitelist` | cases 已存在；若需 CSV 按原 config 路径生成，勿复制到新批次 |

## 新增 skill 资产

- `configs/menu-index-ui.config.json` + `configs/menu-index-ui.cases.json`
- `configs/menu-api-whitelist.config.json`（补 config，非新 cases）
- `scripts/run-menu-index-smoke.node.js`

## 自动化配套

| 类型 | 路径 | 状态 |
|------|------|------|
| Vitest | `apex_dev/.../menu-page-tree-helpers.test.ts` | 9/9 PASS |
| OpenCLI 冒烟 | `scripts/run-menu-index-smoke.node.js --bind-only` | 待 bind 8080 菜单页 |
