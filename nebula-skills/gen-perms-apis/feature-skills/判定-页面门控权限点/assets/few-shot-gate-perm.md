# 门控 perm 判定 — few-shot

## 首页 `/Apex/dashboard`

| 字段 | 值 |
|------|-----|
| `pageGatePerm` | `sys:dashboard:view` |
| `canGateComputed` | `canViewDashboard` |
| `dataLoadGuardPoints` | `loadDashboardData`、`handleDeviceFilterChange` |

## 租户 `/Apex/tenant`

| 字段 | 值 |
|------|-----|
| `pageGatePerm` | `sys:tenant:query` |
| `canGateComputed` | `canQuery` |
| `dataLoadGuardPoints` | `fetchData`、`onMounted` → `handleQuery` |

## 操作级（非门控）

| perm | 无 perm 时 |
|------|------------|
| `sys:tenant:add` | `v-hasPerm` 藏新增按钮 |
| `sys:tenant:delete` | `v-hasPerm` 藏删除按钮 |

有 `query` 无 `add` 时：**不**触发整页 `PageNoPermission`。
