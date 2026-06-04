---
name: API白名单表格OpenCLI自动化
description: 菜单管理「API 白名单」弹窗表格 OpenCLI E2E — 真实 API 串行种子、Element Plus 滚动断言、8080/admin/p2ejw7ww。触发词：白名单、API whitelist、表格滚动、50条、opencli-ux-api-whitelist、sys-menu-whitelist-btn。
tags:
  - 浏览器自动化
  - OpenCLI
  - API白名单
  - 菜单管理
  - Element Plus
should-trigger:
  - prompt 含 OpenCLI + 白名单 / API whitelist
  - prompt 含 白名单表格 + 滚动条 / 50条 / max-height
  - prompt 含 sys-menu-whitelist-btn / 编辑白名单弹窗
  - prompt 含 opencli-ux-api-whitelist
should-not-trigger:
  - 仅改 ApiWhitelistDialog.vue 源码、不需要浏览器验证
  - 仅用 mock 50 条测滚动、不要求真实 apiWhitelist/create
  - 菜单路由判重（走 opencli-ux-menu）
  - 菜单 YAML 导入（走 opencli-ux-menu-import）
---

# API 白名单表格 OpenCLI 自动化

> 在 microfb 基座 8080 上，对菜单管理页「白名单」弹窗做 E2E：**登录/bind →（可选）真实插入 50 条 → 打开弹窗 → 断言纵向/横向滚动**。

## 何时使用

- 验证 `ApiWhitelistDialog` 表格 `max-height` 与 `el-scrollbar__wrap` 滚动
- 需要真实 `apiWhitelist/create` 种子数据（非 mock 50 条）
- 排查白名单按钮不出现、滚动误判、OpenCLI 卡登录

## 何时不要使用

- 纯改白名单 CRUD 四层代码（走 api-gateway-add，不必 OpenCLI）
- 无 Chrome / `opencli doctor` 未通过
- 双会话权限 E2E（走父级 `references/场景-双会话权限E2E.md`）

## 输入契约

| 字段 | 说明 |
|------|------|
| `bindOnly` | 已在 p2ejw7ww Chrome 手动登录 8080 时用 `-BindOnly` |
| `skipSeed` | 已插过 50 条时用 `-SkipSeed` 只测滚动 |
| `session` | 默认 `p2ejw7ww`（`OPENCLI_BROWSER_SESSION` 可覆盖） |
| `profile` | 默认 `p2ejw7ww`（`opencli --profile`） |

默认会话与账号见父级 `references/opencli-默认会话与登录约定.md`（知识体系根目录 `references/opencli-默认会话与登录约定.md`）。

## 执行主线（Phase 0→4）

| Phase | 动作 | 输出 |
|:-----:|------|------|
| 0 | `opencli doctor` + 确认 profile `p2ejw7ww` | 桥接 OK |
| 1 | 登录 8080 或 `-BindOnly` bind 已登录标签 | URL 非 `/login` |
| 2 | 打开 `/cloud/Apex/system/menu` | 菜单管理页 |
| 3 | （可选）串行 `apiWhitelist/create` ×50 | `inserted: 50` |
| 4 | 点「白名单」→ `scroll-eval-oneline` eval | `hasVerticalScroll` 等 JSON |

脚本入口：`scripts/test-api-whitelist-table-scroll.ps1`（参数见 `intention-skills/判断执行模式/SKILL.md`）。

## 🔴 人工门禁（必须停顿）

| 时机 | 向用户确认 |
|------|------------|
| **插种 50 条前** | 「将在当前环境真实插入 50 条 API 白名单（非 mock），目标为 **本地 8080**，是否继续？(y/n)」 |
| **全自动登录前** | 「未使用 -BindOnly，可能卡在图形验证码，是否改用手动登录后 BindOnly？(y/n)」 |
| **bind 后 URL 非 8080** | 「当前 bind 不是 localhost:8080，请先打开菜单页或登录页再 bind，确认后继续？(y/n)」 |

未确认则 **STOP**，不执行 seed eval。

## 🔴 执行后检查点（E2E PASS 后必须停顿）

| 时机 | 向用户确认 |
|:----|:-----------|
| **E2E PASS 后** | 「E2E 通过。是否将本次执行的命令序列 + 踩坑 commit 到知识体系？（y/n）」 |
| **插种后（-Full）** | 「已插入 50 条真实白名单。是否在断言 PASS 后清理这些种子数据？（y/n）」 |
| **清理确认** | 「将删除本次插入的 50 条白名单（通过 `apiWhitelist/delete`），确认？(y/n)」 |

用户拒绝 commit 时，仍应在 `session-log/` 记录本次执行摘要（日期/命令/结果/踩坑），确保知识不会散落在对话中。

## 失败 fallback（if-then）

| 如果 | 则 |
|------|-----|
| 仍在 `/login` 且出现验证码 | 改 `-BindOnly`，用户手动登录后重跑 |
| `opencli` 报 profile 未连接 | 命令前加 `opencli --profile p2ejw7ww` |
| 点击白名单 `not_found` / `semantic_not_found` | 检查 `sys:menu:whitelist`；合并 `docs/menu/0604_菜单白名单权限补丁.yaml` |
| seed 长时间无响应 | 禁止改并发；确认串行 oneline；检查后端 `t-cloud` |
| `hasVerticalScroll: false` 且行数 ≥50 | 改用 `opencli-whitelist-scroll-eval-oneline.js`（`.el-scrollbar__wrap`） |
| `hasHorizontalScroll: false` 且弹窗很宽 | 属预期；收窄窗口后再测 |

详表：`references/common-failures.md`、`references/api-whitelist-table-e2e-pitfalls.md`。

## RED — 失败基线

1. 用 8081 或 huiyan 账号、`q5prwymq` profile → bind 失败或权限不对
2. `Promise.all(50)` 插种 → 挂死/限流
3. 只测 `.el-table__body-wrapper` → 误判无纵向滚动
4. 无 `sys:menu:whitelist` → 按钮 `semantic_not_found`
5. 自动登录遇图形验证码 → 脚本长时间 Sleep

详见 `references/common-failures.md`、`template/before/常见失败.md`。

## GREEN — 任务路由

| 意图 | 路由 |
|------|------|
| **一键 E2E（推荐）** | 根目录 `.\run-e2e.ps1`（默认 BindOnly+SkipSeed）或 `.\run-e2e.ps1 -Full` |
| 仅自检 | `.\run-e2e.ps1 -Check` |
| 选执行模式 | `intention-skills/判断执行模式/SKILL.md` |
| 登录/bind | `feature-skills/登录与预检/SKILL.md` |
| 真实插 50 条 | `feature-skills/真实数据种子插入/SKILL.md` |
| 滚动断言 | `feature-skills/表格滚动断言/SKILL.md` |

## 执行前自检（Phase 0）

- [ ] `opencli doctor` 通过
- [ ] `opencli --profile p2ejw7ww` 与 Chrome 配置 `huiyan19990112@gmail.com` 一致
- [ ] 角色已分配 `sys:menu:whitelist`（或 mock `*:*:*`）

## 输出契约

- `inserted` / `rowCount` / `hasVerticalScroll` / `hasHorizontalScroll`（eval JSON）
- `PASS` / `WARN` 行（PowerShell 脚本 stdout）
- 失败时链到 `references/api-whitelist-table-e2e-pitfalls.md`

## 使用示例

### 推荐：Shell 封装（Round2）

```powershell
cd "…/opencli-ux-api-whitelist"
.\run-e2e.ps1              # 已登录：只测滚动（-BindOnly -SkipSeed）
.\run-e2e.ps1 -Full        # 已登录：插种 50 条 + 滚动（先过 🔴 门禁）
.\run-e2e.ps1 -Check       # 仅 doctor
```

### 底层脚本（同目录 scripts/）

```powershell
cd scripts
.\test-api-whitelist-table-scroll.ps1 -BindOnly -SkipSeed
.\test-api-whitelist-table-scroll.ps1 -BindOnly          # 含插种
.\test-api-whitelist-table-scroll.ps1                  # 全自动（易卡验证码）
```

## 源码落点

- 弹窗：[`apex_dev/src/views/system/menu/components/ApiWhitelistDialog.vue`](../../../../apex_dev/src/views/system/menu/components/ApiWhitelistDialog.vue)
- 入口：[`apex_dev/src/views/system/menu/index.vue`](../../../../apex_dev/src/views/system/menu/index.vue) — `data-testid="sys-menu-whitelist-btn"`

## 越用越灵

新弹窗表格 E2E：复制 `scripts/test-api-whitelist-table-scroll.ps1` → 改 testid 与 eval → 父级自生长或 `harvest/scaffold-skill.sh`。共性模式上浮父级 `references/公共模式与反模式.md`（P-ElementPlus-ScrollbarWrap）。
