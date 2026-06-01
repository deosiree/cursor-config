# 批量清理用户

## 脚本

`scripts/cleanup-users-to-n.js`（默认 `KEEP_COUNT = 10`，可按需改常量）

```powershell
$js = Get-Content -Raw '.cursor/nebula-skills/opencli-ux-user-perm/scripts/cleanup-users-to-n.js'
opencli browser user0601 eval $js
```

## 保留规则

1. **当前登录用户**（`sessionStorage.userInfo.id`）
2. **`isOwner === true`**
3. 其余按 **createdAt 降序** 填满至 `KEEP_COUNT`

## 输出字段

- `beforeCount` / `afterCount`
- `deletedCount` / `failedCount`
- `keptUsers[]`
- `failedSample`（最多 5 条）

## 人工门禁

- 执行前确认租户与 `KEEP_COUNT`
- 本会话曾从 73 人删至 10 人；勿对生产租户误跑

## 分页

`pageSize=100` 循环直至拉全；`page > 50` 安全上限。

## 节流

每删 20 条 `sleep 200ms`，减轻后端压力。
