# 权限运行时诊断决策树

> 完整排障规则见父级 `[[../../../references/perm-runtime-debugging.md]]`。

## 按症状路由

```
权限异常
├─ "租户所有者也被拦"
│  → 检查 sessionStorage.userInfo.isOwner
│  → 检查是否半登录态（Cookie 有效但 session 过期）
│  → 检查 loginAfterAuth 是否写入了 isOwner
│
├─ "登录后 Header 不显示 perm 入口，刷新才出现"
│  → 检查 computed 是否只读 sessionStorage
│  → 检查 computed 是否依赖 userInfo ref
│  → 修复：computed 中 void userInfo.value?.isOwner
│
├─ "新 perm 不生效"
│  → 检查菜单补丁是否已正式导入
│  → 检查角色模板是否已勾选新 perm
│  → 检查 permsMap 是否包含新 perm
│  → 检查用户是否重新登录
│
├─ "[100000]未知错误"
│  → 检查菜单补丁 function 是否缺少 id
│  → 检查 function id 是否来自 API（非 0 或猜测值）
│
└─ "基座和子应用权限不一致"
   → 基座 Header 正确但子应用被拦 → 子应用未同步 userInfo
   → 子应用正确但基座 Header 缺失 → 基座 computed 缓存问题
```

## 分层诊断

| 层 | 组件 | 权限判断方式 | 常见问题 |
|----|------|------------|---------|
| microfb 基座 | NavbarActions | `checkHasPerm` 读 sessionStorage | computed 缓存不重算 |
| microfb 基座 | 路由守卫 | `checkHasPerm` 读 sessionStorage | bypass 失效 |
| apex 子应用 | 页面 index.vue | `checkHasPerm` / `v-hasPerm` / `v-if` | userInfo 同步时机 |
| apex 子应用 | 子组件 | props 传入 | props 未传递 |

## 快速诊断命令

```js
// 1. userInfo 完整性
const ui = JSON.parse(sessionStorage.getItem('userInfo'));
console.table({
  isOwner: { value: ui?.isOwner, type: typeof ui?.isOwner },
  hasPermissions: Array.isArray(ui?.permissions),
  permCount: ui?.permissions?.length,
});

// 2. 特定 perm 检查
checkHasPerm('sys:dashboard:view');

// 3. permsMap 检查
const ui = JSON.parse(sessionStorage.getItem('userInfo')||'{}');
const pm = ui.permsMap;
console.log('Contains sys:dashboard:view:', pm ? 'sys:dashboard:view' in pm : 'permsMap not found');
// ❌ 不要查 sessionStorage.getItem('permsMap') — permsMap 在 userInfo 内部
```
