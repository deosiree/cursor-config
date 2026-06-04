# 创建种子用户

## 推荐路径：API（同会话 cookie）

主脚本：`scripts/create-seed-users.js`

```powershell
$js = Get-Content -Raw '.cursor/nebula-skills/opencli-ux-user-perm/scripts/create-seed-users.js'
opencli browser user0601 eval $js
```

## 行为

- 3 × 邮箱激活（`activationMethod: 2`），前缀 `u0601_mail_{runId}_`
- 3 × 密码直设（`activationMethod: 1`），前缀 `u0601_pwd_{runId}_`，明文 `Test@123456`（传输加密见 `references/api-paths.md`）
- 自动选含「管理员」的角色，否则第一个角色
- 返回 `created[]` + 当前表格 `rows`（操作列快照）

## 备选：UI 新增

`scripts/create-users-via-ui.js` — 依赖「新增」按钮与弹窗 DOM。

**本会话结论**：OpenCLI 会话常找不到「新增」，**不作为主路径**。

## 失败对照

| 错误 | 见 |
|------|-----|
| BIZ / HTTP | `references/common-failures.md` |
| 403 / 无 create | 角色缺 perm 或租户策略 |
| 表格 ops 仍只有编辑 | 先刷新列表；他人行才有多操作 |

## 测后

- 对比本人行 vs `u0601_*` 行的 `ops` / `hasMore`
- 用户过多时走 `feature-skills/批量清理用户`
