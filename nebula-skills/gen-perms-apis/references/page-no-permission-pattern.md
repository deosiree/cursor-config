# 页面无权限空态 — 架构与放置决策

## 三类「无权限」UI 对比

| 类型 | 层级 | 典型位置 | 触发条件 | 子应用能否 import |
|------|------|----------|----------|-------------------|
| microfb 404/403 | 主应用路由级全页 | `microfb/src/views/error/404.vue` | 路由未匹配 / 主应用级拒绝 | 不涉及 |
| 子应用业务页空态 | 子应用视图内 | `apex_dev/.../index.vue` | 有菜单/路由，缺 `view`/`query` 等业务 perm | 子应用自用 |
| 设备数据 inline | 子应用视图内（参考） | `deviceData/index.vue` | `pageAllowed === false` | 参考 UI，本批可不改动 |

## 为何 PageNoPermission 放在 apex_dev 而非 microfb

- qiankun 架构：microfb 与 apex_dev 独立 Vite 工程、独立打包，子应用**不能**直接 `import` microfb 的 `.vue`
- 404 是主应用 router `lazy load`，不是给子应用复用的组件
- 若多子应用（opsdeck 等）都要用，未来抽 `nebula-shared-ui` 共享包，而非塞进 microfb 再通过 alias 硬引用

## pageGate 与 operation perm 分工

| 层级 | perm 类型 | UI 行为 |
|------|-----------|---------|
| 页面门控 | `*:view`（看板）或 `*:query`（列表） | 无 perm → **整页** `PageNoPermission` |
| 操作级 | `*:add` / `*:edit` / `*:delete` 等 | 有门控 perm 时，缺操作 perm → **仅藏按钮**（`v-hasPerm`） |

## 模板结构（强制）

列表页：

```vue
<el-card v-if="canQuery">...</el-card>
<PageNoPermission v-else />
```

看板页：

```vue
<template v-if="canViewDashboard">...</template>
<PageNoPermission v-else />
```

**禁止**：空态嵌在列表同一 `el-card` 内；仅用 `fetchData` 清空数据让表格显示「暂无数据」。

## API 守卫（双保险）

UI 分支与数据加载入口均需守卫：

- `fetchData` / `loadDashboardData` / `onMounted`：`if (!canGate) return`
- 禁止删除已有守卫，仅替换 UI

## i18n

- 统一键：`暂无页面访问权限`
- 组件内显式 `import { useI18n } from 'vue-i18n'`（避免 TS 找不到 `useI18n`）

## 源码快照

- before：`[[../template/sample-run/before-02-页面空态/]]`
- after：`[[../template/sample-run/after-02-页面空态/]]`
- UI 参考：`[[../template/sample-run/reference-02-设备数据UI参考/]]`
