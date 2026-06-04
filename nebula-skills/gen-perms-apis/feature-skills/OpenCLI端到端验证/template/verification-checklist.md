# OpenCLI 端到端验证 — 验证清单

## 会话建立

- [ ] SSH 到目标环境
- [ ] 打开浏览器到 targetUrl
- [ ] 清空 sessionStorage（如需负向测试）
- [ ] 确认测试账号凭据

## Bypass 验证

- [ ] 正面：`isOwner=true` 时 `checkHasPerm` 返回 `true`
- [ ] 负面：模拟 `isOwner` 丢失后 `checkHasPerm` 返回 `false`
- [ ] 负面：页面显示拦截提示

## Header 显隐

- [ ] 登录后不刷新，下拉菜单检查「个人中心」
- [ ] 有 `sys:profile:view` 时可见
- [ ] 无 `sys:profile:view` 时不可见
- [ ] 「退出登录」分隔线随「个人中心」显隐

## 页面守卫

- [ ] 首页：无 `sys:dashboard:view` 时被拦截
- [ ] 租户：无 `sys:tenant:query` 时工具栏不显示
- [ ] 安全配置：无对应 perm 时 Tab 不可见
- [ ] 菜单：无对应 perm 时工具栏按钮不显示

## sessionStorage 检查

- [ ] `userInfo.isOwner` 存在且为 boolean
- [ ] `userInfo.permissions` 存在
- [ ] `permsMap` 存在且包含新增 perm

## 回归

- [ ] 非 owner 用户：按角色 perm 正常受限
- [ ] 刷新后权限状态一致
- [ ] 无 `[100000]未知错误` 弹窗
