# before-02：页面权限空态失败态（RED）

> 沉淀自 2026-06 会话。对应 write-skill「真实历史样本型模板 — 基于 RED 写 before」。

## 用户原始诉求

```text
当租户管理没有查询权限时，应该显示「暂无页面访问权限」，而不是放到表格中阻断然后显示「暂无数据」。
参考首页无权限空态；首页文案统一为「暂无页面访问权限」。
```

## 失败信号

| 路由 | 反模式 | 用户感知 |
|------|--------|----------|
| `/Apex/tenant` | `fetchData` 清空 `pageData` + 空 `el-table` | 显示 Element Plus 默认「暂无数据」，无法区分无权限 |
| `/Apex/tenant`（中间态） | `el-empty` 嵌在列表同一 `el-card` 内 | 与设备数据参考页视觉不一致 |
| `/Apex/dashboard` | 裸 `el-empty`，无 `el-card` 居中布局 | 与列表类页面空态不一致 |

## 源码快照索引

| 文件 | 对应 apex_dev 路径 | 说明 |
|------|-------------------|------|
| `tenant-index.template.vue` | `src/views/tenant/index.vue` | RED：空态嵌在 `el-card` 内 |
| `dashboard-index.template.vue` | `src/views/dashboard/index.vue` | RED：裸 `el-empty` |
| `tenant-no-perm.style.scss` | `tenant/index.vue` scoped style | 页面级重复样式，应下沉到公共组件 |

## 对 skill 设计的启示

- 缺 `pageGatePerm` 时必须整页 `PageNoPermission`，禁止用表格「暂无数据」代替
- 列表页空态与内容区应为**兄弟分支**，不嵌套在同一 `el-card`
- UI 以设备数据模块为参考（见 `reference-02-设备数据UI参考/`），但该模块不在本批改动范围
