# Few-shot：role/create 漏配同类问题

## 背景

普通租户管理员配置了 `sys:role:add`，新增角色仍 403。

## 根因

菜单树只挂了 `/seccenter/v2/role/create`，但提交链路还调用：

- `/seccenter/v2/role/assignMenuPermissions`
- `/seccenter/v2/role/assignDevices`
- `/seccenter/v2/menu/tree`（打开弹窗加载权限树）

## 检查命令

```bash
node scripts/check-menu-api-gap.node.js \
  --repo F:/Documents/Repertory/Sieyuan/nebula/apex_dev \
  --menu F:/Documents/Repertory/Sieyuan/nebula/docs/menu/菜单树_0623_platform.yaml \
  --scope 角色管理
```

## 修复前预期

- P0：`assignMenuPermissions`、`assignDevices`、`menu/tree`（若仅 create 在菜单中）

## 修复后

- P0 = 0
- 可能仍有 P1：`/api/v2/roles` stale 项待删
