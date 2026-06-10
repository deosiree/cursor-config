# Few-shot：新增 ColumnFilter 组件（mvp）

## 用户诉求

「新仓库列表要有列设置，能勾选显示哪些列。」

## 前置判定

目标仓库无 `src/components/ColumnFilter/ColumnFilter.vue` → **新增-组件列设置**。

## GREEN 要点

### 1. 复制 mvp

从 [`template/mvp/.../ColumnFilter.vue`](../../template/mvp/src/components/ColumnFilter/ColumnFilter.vue) 到 `src/components/ColumnFilter/`。

### 2. i18n

确认 locale 含 `列设置`、`显示/隐藏列`、`重置`。

### 3. 理解 snapshot

读 [`column-settings-toolbar.fragment.vue`](../../template/snapshot/src/views/deviceManage/device/column-settings-toolbar.fragment.vue) 与 [`column-settings-script.fragment.ts`](../../template/snapshot/src/views/deviceManage/device/column-settings-script.fragment.ts)，不在此步改业务页。

## 验收

- popover 可勾选、重置
- `required` 列 disabled
- 委派 **应用-列设置** 改具体列表页
