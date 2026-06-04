# 操作列权限诊断

## 先读

`references/permission-op-column-pitfalls.md`

## 步骤

### 1. 单元测试（无浏览器）

```powershell
cd apex_dev
npm test -- src/directive/__tests__/hasPerm.test.ts
npm test -- src/directive/__tests__/userTableOpPermDiagnostic.test.ts
```

### 2. 浏览器快照

在用户列表页 eval（见 references 内片段），收集：

- `userPerms`（`sys:user:*`）
- 每行 `ops` / `hasMore`

### 3. 对照菜单 YAML

`docs/menu/0601菜单树_20260601084145.yaml` 中 FUNCTION 节点的 `isVisible`、`perm`。

### 4. 分层结论

| 层级 | 检查点 |
|------|--------|
| 角色 | session 是否含对应 `sys:user:*` |
| 显示兜底 | FUNCTION `isVisible` / 缓存 |
| 行级 | `isCurrentUser` 是否隐藏 OpItem |
| UI 折叠 | `inline-visible-count=2` |

## 常见误判

- **perm 绑错**：本会话已核对 UserTable，与 YAML 一致
- **只有编辑**：多为仅本人一行 + 行级守卫，非 perm 写错
- **resetPassword 仍显示**：查菜单 `isVisible`；owner 不受显示兜底约束

## TEMP 注释

`UserTable.vue` 中注释 `!isCurrentUser` 仅用于验证；**诊断完成后恢复**。
