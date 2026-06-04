# 常见失败与对策

## OpenCLI / 浏览器

| 现象 | 原因 | 对策 |
|------|------|------|
| `eval` 报 CDP disconnected | 脚本内 `location.href` 整页跳转 | 用 `opencli browser open` 导航；eval 内只 `fetch` + DOM |
| 登录填表无效 | Vue 未收到 `input` 事件 | `InputEvent('input')` + `change`，见 UI 脚本 `setInput` |
| 找不到「新增」 | 未 bind 已登录页 / 无 add 权限 | `opencli browser user0601 bind`；查 session `userPerms` |
| UI 脚本找不到按钮 | OpenCLI 会话与人工标签页不一致 | 优先 **API 脚本** `create-seed-users.js` |

## API

| 现象 | 原因 | 对策 |
|------|------|------|
| 404 on `/dev-api/seccenter/v2/...` | 未走网关 forward | 业务：`/dev-api/forward/seccenter/v2` |
| 登录加密失败 | 直连 auth 路径错误 | 认证：`/dev-api/direct/seccenter/v2/auth/loginSetting` |
| `BIZ xxx` | 业务码非 0 | 读 `message`；常见重复用户名/手机号 |
| 列表 total 与 UI 不一致 | 分页未拉全 / 缓存 | `cleanup` 脚本分页 `pageSize=100` 循环 |

## 权限与操作列

| 现象 | 原因 | 对策 |
|------|------|------|
| 只有「编辑」 | 列表仅本人 + `!isCurrentUser` 守卫 | 先创建他人用户；见 `permission-op-column-pitfalls.md` |
| 有 perm 仍不显示 | FUNCTION `isVisible:false` | `checkHasPerm` 显示兜底；owner 跳过 |
| 行内有「更多」但项少 | `inline-visible-count=2` | 正常折叠；展开 more 核对 |
| 重置密码仍显示 | 菜单可见 + 有 perm | 查 YAML `isVisible`；非 perm 绑错 |

## 数据清理

| 现象 | 原因 | 对策 |
|------|------|------|
| 删不干净 | 未分页拉全 | 用 `cleanup-users-to-n.js` |
| 误删 owner | 保留规则未含 `isOwner` | 脚本已强制保留 owner + 当前用户 |
| 重复跑 seed 爆炸 | `runId=Date.now()` 每次新前缀 | 测完跑 cleanup；勿连点 |

## 恢复现场

- `UserTable.vue` 中 `TEMP` 注释的 `!isCurrentUser` **测完应恢复**
- 批量删除前人工确认 `keepCount` 与租户
