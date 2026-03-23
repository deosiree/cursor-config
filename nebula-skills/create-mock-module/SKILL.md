---
name: create-mock-module
description: Use when adding or toggling vite-plugin-mock-dev-server routes per module in nebula (microfb host :8080 vs apex_dev subapp :8081), avoiding global mock hijacking real Swagger APIs.
---

# 目标

在 `nebula` 仓库内为「未入 Swagger / 仅本地开发需要」的接口提供 **按模块开关的 Mock**，并保证：

1. **宿主（`microfb`，常见 `:8080`）与子应用（`apex_dev`，常见 `:8081`）各自独立加载 mock**，改一侧 env 不会自动修复另一侧。
2. **全局 mock 关闭时**，仍可通过 `VITE_MOCK_<模块>` 只加载指定 `mock/*.mock.ts`，避免 `menu` 等有真实后端的接口被 `mock/**/*.mock.ts` 误拦截。
3. Mock 路由 URL 在文件里写 **不含** `/dev-api` 前缀的 path 段；由各包 `mock/base.ts` 的 `defineMock` 自动拼接 `VITE_APP_BASE_API`（与现有工程一致）。

## 适用信号

1. Network 里请求落在 `localhost:8081` 却期望走 mock（实际 mock 只配在 `8080` 的 Vite 上）。
2. 开启 `VITE_MOCK_DEV_SERVER=true` 后，`menu/tree` 等已对接真实网关的接口仍出现 `[vite:mock]` 日志。
3. 关闭全局 mock 后，`project/list` 等仍 404，需要单独 mock 却无 include 条目。
4. 修改 `.env.development` 后 mock 行为不变（**未重启对应端口的 dev server**）。

## 环境变量约定（项目级）

| 变量 | 含义 |
|------|------|
| `VITE_MOCK_DEV_SERVER` | `true` 时加载 `mock/**/*.mock.ts`（全量 mock，慎用）。 |
| `VITE_MOCK_MENU` | 仅菜单相关 mock（`microfb`: `mock/seccenter.menu.v2.mock.ts`；`apex_dev`: `mock/menu.mock.ts`）。 |
| `VITE_MOCK_PROJECT` | 仅项目/dbres 相关 mock（`microfb`: `mock/seccenter.project.v2.mock.ts`；`apex_dev`: `mock/project.mock.ts`）。 |

**推荐组合（菜单走真实、项目走 mock）**：

```env
VITE_MOCK_DEV_SERVER=false
VITE_MOCK_MENU=false
VITE_MOCK_PROJECT=true
```

## Vite 配置要点（两处都要对齐）

### microfb（`microfb/vite.config.ts`）

- `mockGlobalEnabled === true` → `include: ["mock/**/*.mock.ts"]`。
- 否则 → `include` 仅包含各 `VITE_MOCK_*` 为 true 时对应的单文件（例如 `seccenter.project.v2.mock.ts`）。

### apex_dev（`apex_dev/vite.config.ts`）

- 逻辑与上相同；**模块文件名与 microfb 可不同**（例如 `mock/project.mock.ts`），但 **必须在 `enabledMockIncludes` 里显式列出**。

## 新增一个「模块 mock」的检查清单

1. **定端口**：该页面请求从哪个 origin 发出（8080 还是 8081）？在对应包的 `mock/` 下新增或扩展 `*.mock.ts`。
2. **定路径**：与源码里 `request` 的 URL 一致（常见 `seccenter/v2/...`，**不要**写 `gtw/*`）。
3. **定响应壳**：与 `src/utils/request.ts` 拦截器一致（成功时常为 `code: 0` + `result`）。
4. **注册开关**：在对应 `vite.config.ts` 增加 `toBool(env.VITE_MOCK_XXX)` 与 `include` 条目。
5. **类型**：在对应包 `src/types/env.d.ts`（或 `vite-env.d.ts`）声明 `VITE_MOCK_XXX`。
6. **重启**：只改 env / vite 配置必须 **重启该包 dev server** 才生效。
7. **验证**：浏览器 Network 看请求端口与 `[vite:mock]` 日志是否来自同一 Vite 进程。

## 输出模板（排障）

1. **请求实际落在哪个端口**：`<8080|8081|其他>`
2. **该端口对应包**：`microfb` / `apex_dev`
3. **当前 mock include**：`<glob 列表>`
4. **根因**：`<env 未加载 / 未重启 / include 未含该文件 / URL 与 mock 不一致>`
5. **修复**：`<具体文件与配置变更>`

## 相关常量（代码侧索引）

- 子应用与路由根：`microfb/src/constants/route-paths.ts` 内 `NEBULA_SKILL_DOC_CREATE_MOCK_MODULE`（指向本 skill 的仓库相对路径，便于搜索与文档链）。
