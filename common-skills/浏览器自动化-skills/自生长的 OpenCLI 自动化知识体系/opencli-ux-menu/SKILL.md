---
name: opencli-ux-menu
description: OpenCLI 菜单管理 UX 自动化 — 路由路径按项目判重、项目切换、Element Plus 弹窗表单填写与断言。当需要验证菜单管理页、MenuFormDialog、routePath 唯一性、test0415/test0601 等项目维度判重时使用。
tags:
  - 浏览器自动化
  - OpenCLI
  - 菜单管理
  - routePath
  - 表单校验
should-trigger:
  - prompt 含 OpenCLI + 菜单管理 / 路由路径 / MenuFormDialog
  - prompt 含 菜单 + 判重 / 按项目 / test0415 / test0601
  - prompt 含 opencli-ux-menu 或菜单路由路径自动化测试
should-not-trigger:
  - 仅改 MenuFormDialog 源码、不需要浏览器验证
  - 租户/用户/角色 Tab 场景（分别走 opencli-ux-tenant / user-perm / role-tab-validation）
---

# OpenCLI 菜单管理 UX 自动化

> 验证菜单表单「路由路径」在**当前项目内**唯一；跨项目允许相同路径。

## 快速路由

| 意图 | 动作 |
|------|------|
| 跑全流程 E2E | `bash run-e2e.sh` 或 `.\run-e2e.ps1` |
| 8080 bind 后跑 | `bash bind-and-run.sh` 或 `.\bind-and-run.ps1` |
| 只跑判重用例 | `bash menu-route-dup-check.sh` |
| 诊断弹窗/页面 | `bash diagnose-menu-page.sh` 或 `.\scripts\diagnose-menu-page.ps1` |
| 列出 routePath | `.\scripts\extract-route-paths.ps1 -Project test0415` |
| 语法 vs 判重 | `bash menu-syntax-before-dup-demo.sh` |
| 踩坑 | [`references/menu-route-dup-pitfalls.md`](references/menu-route-dup-pitfalls.md) |
| 弹窗模式 | [`references/element-plus-overlay-pattern.md`](references/element-plus-overlay-pattern.md) |
| 登录 | [`feature-skills/登录与预检/SKILL.md`](feature-skills/登录与预检/SKILL.md) |
| 排障 | [`feature-skills/诊断菜单弹窗/SKILL.md`](feature-skills/诊断菜单弹窗/SKILL.md) |

## 核心能力（lib/common.sh）

| 函数 | 用途 |
|------|------|
| `select_menu_project` | 项目下拉切换（combobox → option） |
| `open_menu_create_dialog` | eval 点击「新增」+ wait「路由路径」 |
| `fill_menu_route_path` / `blur_menu_route_path` | fill + blur 触发异步判重 |
| `get_menu_form_state` | 读可见 `.el-overlay` 内表单错误 |
| `assert_menu_route_error_contains` | TC1：同项目重复 |
| `assert_menu_route_no_duplicate_error` | TC2：跨项目允许 |
| `open_menu_edit_dialog_by_route_path` | TC3：按 path 打开编辑 |
| `get_table_route_paths` / `dump_menu_page_diagnostic` | 诊断 |
| `click_login_submit` | 登录按钮优先 `.login-submit-btn` |

## 与源码落点

- 判重逻辑：[`MenuFormDialog.vue`](../../../apex_dev/src/views/system/menu/components/MenuFormDialog.vue) — `getAllRoutePathItems(projectId)`、`ensureRoutePathUnique`
- 页面入口：[`menu/index.vue`](../../../apex_dev/src/views/system/menu/index.vue) — 项目选择器、`selectedProjectId`

## 前置检查

```bash
opencli doctor
# local-subapp：8081 可达
# local：8080 + 8081 可达，且 admin@system.local 可登录
```

## 配置要点

- `menuData.duplicateRoutePath`：必须在 `projectDuplicateIn` 项目中已存在，且能通过 `createRoutePathRules` 语法校验（推荐 `/opencli/xxx` 格式）
- `menuData.duplicateErrorText`：与前端硬编码一致——「当前项目下的路由路径已存在」
