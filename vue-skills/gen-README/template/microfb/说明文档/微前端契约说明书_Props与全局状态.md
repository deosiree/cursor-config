# 说明文档：微前端契约说明书（Props / GlobalState / 路由基准）

本文档目标：固化 `microfb`（qiankun 主应用）与子应用之间的 **数据契约与行为约束**，避免“子应用各自实现一套”的漂移。

## 1. 契约范围（MVP）

- **主应用提供的 props（挂载时/每次取值时）**
  - `routerBase`：子应用路由根前缀（等于该子应用 `activeRule`）
  - `menuList`：当前菜单树（来自 `menu-repo` 缓存）
  - `menuVersion`：菜单版本号（变更信号）
  - `userInfo`：当前登录用户信息（来自 Storage）
  - `actions` / `setGlobalState` / `onGlobalStateChange` / `offGlobalStateChange`：全局状态通道（经过主应用转发，避免覆盖唯一监听）

## 2. 数据来源与更新语义

### 2.1 读取侧（子应用挂载时拿到什么）

在 `microfb` 中，子应用配置的 `props` 是一个函数：

- 每次 qiankun 挂载子应用时，都会执行 `props(): () => ({ ...getAppProps(...) })`
- `getAppProps()` 会动态读取：
  - `readMenuCache().menus`
  - `getMenuVersion()`
  - `Storage.get('userInfo')`

**源码证据**

- `src/plugins/qiankun/apps.ts`
  - `getAppProps(appName, routerBase)`
  - `buildApps()`：`props: () => ({ ...getAppProps(item.name, item.activeRule), ...(item.props||{}) })`

### 2.2 写入侧（主应用如何“推送”变化）

主应用对 props 的“推送”不是直接调用子应用方法，而是通过 `setMicroAppProps(appName, partialProps)` **写入缓存来源**：

- `partialProps.menuList` → `writeMenuCache(...)`
- `partialProps.userInfo` → `Storage.set('userInfo', ...)`

**源码证据**

- `src/plugins/qiankun/apps.ts`
  - `export const setMicroAppProps(appName, partialProps)`
  - 说明：由于 props 是函数形式，写入缓存后，子应用在“下次挂载/下次读取 props”时自然获得最新值

## 3. 子应用侧必须遵守的约束（MVP）

- **必须把 `routerBase` 作为子应用 router 的 base/prefix**：否则会出现刷新 404 或与主应用激活规则不一致。
- **必须用 `menuVersion` 作为菜单变更信号**：当 `menuVersion` 变化时，应触发子应用内部“菜单/权限/路由”重新计算（具体策略由子应用实现，但信号必须统一）。
- **不得覆盖主应用唯一的 globalState 监听**
  - 主应用通过 `registerSubAppGlobalListener(appName, cb)` 登记监听，并由主应用转发
  - 子应用侧应使用传入的 `onGlobalStateChange/offGlobalStateChange`，不要直接持有 `actions.onGlobalStateChange`

## 4. 典型场景（主应用触发点）

- **登录成功（v2）**：`UserStore.finalizeV2Login()` 会对所有 enabled 子应用调用 `setMicroAppProps` 同步 `menuList/menuVersion/userInfo`
- **刷新菜单**：`UserStore.refreshCurrentUserMenus()` 可选同步子应用 `menuList/menuVersion`
- **登出**：`UserStore.logout()` 会清空子应用 props（含 `forceReloadToken`）避免切换账号串权

## 5. 验收点（契约视角）

- **切换账号不串权**：登出后子应用不应使用旧 `menuList/userInfo`
- **菜单更新可感知**：主应用菜单变更后，子应用能通过 `menuVersion` 触发自刷新
- **路由基准一致**：访问子应用路由时，`routerBase` 与 `activeRule` 一致且可刷新



