# after-02：页面权限空态落地（GREEN）

> 沉淀自 2026-06 会话。对应 write-skill「真实历史样本型模板 — 基于 GREEN 写 after」。

## 执行链路

```
用户诉求（暂无数据 vs 无权限）
  → 策略：整页门控 perm + PageNoPermission 兄弟分支
  → 新建 PageNoPermission 组件（UI 参照设备数据，组件放 apex_dev）
  → 租户：el-card v-if="canQuery" / PageNoPermission v-else
  → 首页：<PageNoPermission v-else />
  → 保留 fetchData / loadDashboardData 入口守卫
```

## 与 before 差异摘要

| 项 | before | after |
|----|--------|-------|
| 公共组件 | 无 | `PageNoPermission.vue` |
| 租户模板 | 空态嵌在 `el-card` 内 | `el-card` 与 `PageNoPermission` 兄弟分支 |
| 首页模板 | 裸 `el-empty` | `<PageNoPermission v-else />` |
| 页面样式 | `.tenant-no-perm` | 删除，样式内聚组件 |
| i18n | 首页「暂无权限查看首页」 | 统一「暂无页面访问权限」 |

## 源码快照索引

| 文件 | 对应 apex_dev 路径 |
|------|-------------------|
| `PageNoPermission.vue` | `src/components/PageNoPermission/index.vue` |
| `tenant-index.template.vue` | `src/views/tenant/index.vue`（模板片段） |
| `dashboard-index.template.vue` | `src/views/dashboard/index.vue`（模板片段） |

## 未改动范围

- 设备数据模块（仅 UI 参考，见 `reference-02-设备数据UI参考/`）
- microfb / 报表页
