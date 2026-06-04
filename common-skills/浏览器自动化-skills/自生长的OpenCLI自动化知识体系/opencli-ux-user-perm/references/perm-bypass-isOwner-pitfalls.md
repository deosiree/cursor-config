# 权限后门 isOwner 与 Header 踩坑

> 来源：2026-06-02 OpenCLI 会话（admin@system.local · localhost:8080）

## 核心事实

1. **bypass 只看 `isOwner`**：`hasPermissionBypass` 为 `user?.isOwner === true`，与 `admin@system.local` 邮箱无关。
2. **`checkHasPerm` 读 sessionStorage**，不读 Pinia；与 `useUserStore().userInfo` 可能不同步（watch 会写 session，但 computed 不一定重算）。
3. **`isOwner` 只在登录落地时写入**：`loginAfterAuth` → `UserGateway.resolveLoginContext` → `mapWire2StableUserInfoFromLogin`。
4. **登录页 Header 仍挂载**：`shouldHideLayout` 仅 `v-show` 隐藏，`NavbarActions` 首屏就算权限。

## 常见现象 → 原因 → OpenCLI 验证

| 现象 | 最可能原因 | 验证命令 |
|------|-----------|----------|
| 租户所有者仍被拦首页 | session 无 `isOwner` 或 `!== true` | § session 诊断 eval |
| 登录 API 有 isOwner，UI 仍无「个人中心」 | computed 未订阅 userInfo（缓存 false） | 登录后**不 reload** 测下拉 § |
| 有菜单 + 登录表单同时出现 | 半登录：Cookie/壳层在，userInfo 不完整 | 清空 session 重登 |
| owner 缺新 perm 被拦 | bypass 失效 + 角色未导入 YAML 补丁 | 看 `tests.sys:dashboard:view` |
| 刷新后恢复 | 首屏重算 computed / session 从登录重写 | 对比 reload 前后 session |

## session 诊断 eval（复制即用）

```javascript
(function(){
  const u=JSON.parse(sessionStorage.getItem('userInfo')||'{}');
  return JSON.stringify({
    isOwner: u.isOwner,
    isOwnerStrict: u.isOwner === true,
    hasIsOwnerKey: Object.prototype.hasOwnProperty.call(u, 'isOwner'),
    username: u.username || u.userName,
    email: u.email,
    permsLen: (u.permissions || u.perms || []).length
  });
})()
```

## 负向：isOwner 丢失后首页

```javascript
// 1. 篡改
(function(){
  const u=JSON.parse(sessionStorage.getItem('userInfo'));
  delete u.isOwner; // 或 u.isOwner=false
  sessionStorage.setItem('userInfo', JSON.stringify(u));
  return 'tampered';
})()
// 2. location.reload()
// 3. #microfb-mount-area 文本应含「暂无权限查看首页」
```

## 前端 fix（microfb NavbarActions）

`checkHasPerm` 不触发 Vue 依赖收集时，登录态下显式订阅：

```ts
const canViewProfile = computed(() => {
  const info = userInfo.value;
  if (info?.id || info?.username) {
    void info.isOwner;
    void info.permissions;
  }
  return checkHasPerm("sys:profile:view");
});
```

## 与操作列诊断的分工

| 主题 | 文档 |
|------|------|
| `isOwner` bypass / Header / 首页守卫 | 本文 |
| 用户表 OpItem / isCurrentUser / isVisible | `permission-op-column-pitfalls.md` |
| 单元测试 hasPerm | `apex_dev/src/directive/__tests__/hasPerm.test.ts` |

## API 路径

浏览器内 fetch 须带 vite 前缀：

- ✅ `/dev-api/direct/seccenter/v2/user/detail`
- ❌ `/seccenter/v2/user/detail`（易返回 HTML 错误页）
