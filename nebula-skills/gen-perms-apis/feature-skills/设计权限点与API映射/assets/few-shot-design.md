# 设计权限点与API映射 — few-shot 示例

> 来自 2026-06-03 会话：首页 + 租户管理权限设计

## 触发

```text
基于盘点文档 apex_dev-route-component-perm-api.md，
设计首页和租户管理的新权限点。
```

## 盘点事实（输入）

- `/Apex/dashboard`：`loadDashboardData` 调 `POST /seccenter/v2/dashboard/query`，当前无 v-hasPerm
- `/Apex/tenant`：`fetchTenantList` 调 `POST /seccenter/v2/tenant/query`，新增按钮调 `POST /seccenter/v2/tenant/add`
- `/Apex/tenant`：`BindDeviceDialog` 调 `POST /forward/devmgr/device/activate`（跨模块），无 v-hasPerm
- `/Apex/tenant`：`BindResourceDialog` 调 `POST /dbres/resource/bind`（跨模块），无 v-hasPerm

## 设计输出

| 权限标识 | 权限名称 | 粒度 | 管控 API | 决策理由 |
|---------|---------|------|---------|---------|
| sys:dashboard:view | 查看首页 | page | POST /seccenter/v2/dashboard/query | 整页仅一个入口，page 级足够 |
| sys:tenant:query | 查询租户 | operation | POST /seccenter/v2/tenant/query | 查询与增删改独立 |
| sys:tenant:add | 新增租户 | operation | POST /seccenter/v2/tenant/add | 独立操作 |
| sys:tenant:bindDevice | 绑定边端设备 | operation | POST /forward/devmgr/device/activate | 跨模块 API，挂在租户页 |
| sys:tenant:bindResource | 绑定项目资源 | operation | POST /dbres/resource/bind | 跨模块 API，挂在租户页 |

## 豁免清单

| 接口 | 原因 |
|------|------|
| /direct/seccenter/v2/auth/loginSetting | direct + no-auth，不建 perm |
