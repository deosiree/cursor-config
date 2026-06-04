# API 白名单表格 E2E 踩坑

> 来源：2026-03~06 菜单白名单 OpenCLI 会话（plan 对话沉淀，路径已迁至本子 skill）。

## 环境与账号

| 项 | 正确 | 错误 |
|----|------|------|
| 登录 URL | `http://localhost:8080/cloud/login` | `8081` 子应用直连（除非明确例外） |
| 账号 | `admin@system.local` | huiyan 等 |
| OpenCLI | `opencli --profile p2ejw7ww browser p2ejw7ww …`（v1.7+ 形态：`browser <session> <cmd>`） | 默认 `q5prwymq` 未连接 |

## 卡死与超时

1. **图形验证码**：自动 `eval` 登录后仍停在 `/login` → 用 `-BindOnly` 手动登录后再跑。
2. **50 条并发**：禁止 `Promise.all(50)`；使用 `opencli-whitelist-seed-50-oneline.js` 串行 `fetch`。
3. **PowerShell Stop**：opencli 的 `Update available` 走 stderr → `$ErrorActionPreference = "Continue"`。

## 滚动断言

- Element Plus 纵向滚动在 **`.el-scrollbar__wrap`**，不是 `.el-table__body-wrapper`（后者 `scrollHeight === clientHeight` 会误判）。
- 弹窗够宽时 **无横向滚动** 属预期（`scrollWidth === clientWidth`）；要测横滚需收窄窗口或加列 `min-width`。

## 权限与定位

- 按钮：`data-testid="sys-menu-whitelist-btn"`，需 `sys:menu:whitelist`。
- 弹窗：`aria-label` 含「编辑白名单」。
- 表格容器：`data-testid="api-whitelist-table-wrap"` / `api-whitelist-table`。

## 数据

- 测试数据用真实 `POST /dev-api/direct/seccenter/v2/apiWhitelist/create`，不用 mock 冒充 50 条。

## opencli v1.7+ CLI

- 形态：`opencli --profile <profile> browser <session> <cmd> …`（如 `bind`、`click --testid`、`eval`）
- **无** `click --css`；CSS 点击用 `eval` 兜底（见 `test-api-whitelist-table-scroll.ps1`）

## PowerShell

- **禁止**在 `run-e2e.ps1` 用 `$args` 组装开关 → 改用 `@mainSwitches` 哈希表
- `Invoke-Oc` 参数勿命名 `$Args`

## 推荐命令

```powershell
cd opencli-ux-api-whitelist
.\run-e2e.ps1 -Check
.\run-e2e.ps1              # BindOnly + SkipSeed
```

详见 [`references/README-e2e.md`](README-e2e.md)。
