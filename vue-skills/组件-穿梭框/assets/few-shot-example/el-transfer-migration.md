# el-transfer → customTransfer（历史扩展）

> **非主 template/before**。主 before 样本为 `cdb58504^` BindDeviceDialog（已用 customTransfer）与 `e0a93b0` DeviceTab（el-table）。

## 场景

极早期页面仍用 Element Plus 原生 `<el-transfer>`，需换项目内 `customTransfer` + virtual-scroll。

## 真相源

- before：`456e761^` — `BindDeviceDialog.vue` 含 `<el-transfer>`
- after：`456e761` — 引入 `src/components/transfer/` 并改 Dialog

## 与当前 skill 关系

- **新增套件**：仍走 `template/mvp`
- **页面迁移**：优先对照 **BindDeviceDialog after（HEAD）** 与 **DeviceTab after**，而非本片段

## 关键步骤（摘要）

1. 落地 `template/mvp` 组件
2. `el-transfer` → `customTransfer`，补 `#default` / footer 表头
3. 大数据开 `:virtual-scroll="true"`

如需完整 diff，在 apex_dev 执行：

```bash
git show 456e761^:src/views/tenant/components/BindDeviceDialog.vue
git show 456e761:src/views/tenant/components/BindDeviceDialog.vue
```
