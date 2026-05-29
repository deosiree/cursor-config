# 不应触发本 skill 的用例

1. 「操作列按钮太多折叠到更多」→ `组件-操作列折叠`
2. 「表格高度自适应、分页被挡住」→ `layout-fixedHeadTail-adaptiveMiddle`
3. 「批量把中文改成 $t()」→ `i18n-server`
4. 「gateway handleGatewayError 重复弹窗」→ `shownotification`（若无穿梭框 UI）
5. 「新增设备 API 字段对齐 Swagger」→ `seccenter-api-contract` / `api-gateway-add`
6. 「仅改 BindDeviceDialog 提交按钮文案」→ 不触发
7. 「el-table 普通列表无左右选型」→ 不触发（除非明确改 Transfer）

## 易混淆边界

- **DeviceTab 改 Transfer**：应触发 **本 skill**（更新子 skill + role-device-tab few-shot）
- **getBind 分页**：若同时涉及穿梭框 UI，触发本 skill；若纯 gateway 重构且无 UI，可仅 `api-gateway-add`
