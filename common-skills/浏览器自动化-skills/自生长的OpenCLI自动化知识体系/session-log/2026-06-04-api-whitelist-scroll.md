# Session：API 白名单表格滚动 E2E

> 2026-06-04 · 8080 · admin@system.local · session/profile `p2ejw7ww`

## 摘要

- 真实串行插入 50 条 `apiWhitelist/create`（~19s）
- 弹窗 55 行，`max-height: 400` 生效
- 纵向滚动 PASS（`.el-scrollbar__wrap`）
- 横向滚动 N/A（弹窗够宽）

## 沉淀子 skill

`opencli-ux-api-whitelist/`（脚本、template、evals、pitfalls）

## 历史路径（已废弃）

- ~~`apex_dev/scripts/opencli-*`~~
- ~~`apex_dev/.opencli-state-p2ejw7ww.txt`~~
- ~~`opencli-ux-menu/scripts/test-api-whitelist-table-scroll.ps1`（wrapper）~~

以 `opencli-ux-api-whitelist/scripts/` 为准。plan 正文 [`docs/plans/2026-03-09-security-login-policy-design-implementation.md`](../../../docs/plans/2026-03-09-security-login-policy-design-implementation.md) 未改。

## 命令

```powershell
cd opencli-ux-api-whitelist/scripts
.\test-api-whitelist-table-scroll.ps1 -BindOnly -SkipSeed
```
