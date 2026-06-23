# 接入 PageNoPermission — few-shot（薄索引）

## 触发

```text
帮首页和租户管理接入 PageNoPermission，UI 参照设备数据。
```

## 源码快照入口

| 阶段 | 目录 |
|------|------|
| before（RED） | `[[../../template/sample-run/before-02-页面空态/]]` |
| after（GREEN） | `[[../../template/sample-run/after-02-页面空态/]]` |
| UI 参考 | `[[../../template/sample-run/reference-02-设备数据UI参考/]]` |

## 关键 diff 点

| 文件 | before → after |
|------|----------------|
| 组件 | 无 → `PageNoPermission.vue` |
| tenant | 嵌套 `el-empty` → `el-card v-if` + `PageNoPermission v-else` |
| dashboard | 裸 `el-empty` → `PageNoPermission v-else` |
| 样式 | `.tenant-no-perm` → 删除（内聚组件） |

## 保留项

- `fetchData` / `loadDashboardData` 内 `if (!canGate) return`
- `SinglePaneDialog` 在租户页 `v-if` 分支**外**

## TS 注意

`PageNoPermission` 须显式：

```ts
import { computed } from "vue";
import { useI18n } from "vue-i18n";
```
