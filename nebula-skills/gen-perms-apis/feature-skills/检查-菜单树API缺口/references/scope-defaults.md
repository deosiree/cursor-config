# 默认检查范围

## 默认 6 模块

| 模块 | route_path | views 根 | 说明 |
|------|------------|----------|------|
| 首页 | `/Apex/dashboard` | `src/views/dashboard` | KPI、设备概览 |
| 租户管理 | `/Apex/tenant` | `src/views/tenant` | 平台租户 CRUD |
| 用户管理 | `/Apex/system/user` | `src/views/system/user` | 租户内用户 |
| 角色管理 | `/Apex/system/role` | `src/views/system/role` | 角色与权限 |
| 安全配置 | `/Apex/system/securityConfig` | `src/views/system/securityConfig` | 安全/会话策略 |
| 菜单管理 | `/Apex/system/menu` | `src/views/system/menu` | 平台菜单树 |

## 默认排除

| route_path | 原因 |
|------------|------|
| `/Apex/profile` | 全局访问，API 已在后端白名单，不配置菜单 perm |

用户可通过 `excludeRoutes` 追加排除项。

## CLI scope 别名

- `default`：上表 6 模块
- 逗号分隔模块名：如 `角色管理,用户管理`
- 逗号分隔 route_path：如 `/Apex/system/role,/Apex/system/user`
