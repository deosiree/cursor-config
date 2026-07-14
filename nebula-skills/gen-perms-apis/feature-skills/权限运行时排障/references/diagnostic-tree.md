# 权限运行时诊断决策树

> 完整排障规则见父级 `[[../../../references/perm-runtime-debugging.md]]`。  
> 路由作用域权威参考：`[[../../../references/route-scope-auth-chain.md]]`

## 按症状路由

```
权限异常
├─ "租户所有者也被拦"
│  → 检查 sessionStorage.userInfo.isOwner
│  → 检查是否半登录态（Cookie 有效但 session 过期）
│  → 检查 RoutePermDict.pass 是否先于 has 执行
│
├─ "登录后 Header 不显示 perm 入口，刷新才出现"
│  → 检查 computed 是否只读 sessionStorage
│  → 检查 computed 是否依赖 userInfo ref
│  → 修复：computed 中 void userInfo.value?.isOwner
│
├─ "新 perm 不生效 / 有 perm 但按钮不显示"
│  → 导航到目标路由后检查 RoutePermDict.getScope()
│  → 检查 getAllowed() 是否含目标 perm
│  → 检查 routeProjectMap 是否有当前 path 节点
│  → 检查 function 是否挂在正确 page 子树
│  → 检查菜单补丁是否已正式导入
│  → 检查是否 relogin / syncMenuCacheOnly
│  → 检查角色模板是否已勾选新 perm
│  → 检查 function is_visible / is_system_only
│  → ❌ 不要查 userInfo.permsMap 作为主真相源
│
├─ "当前路由不唯一" 告警
│  → ambiguous=true，检查同 path 多 page 的 params 配置
│  → 见 snapshot-03-路由params消歧
│
├─ "[100000]未知错误"
│  → 检查菜单补丁 function 是否缺少 id
│  → 检查 function id 是否来自 API（非 0 或猜测值）
│
└─ "基座和子应用权限不一致"
   → 基座 Header 正确但子应用被拦 → 子应用未同步 userInfo / 未 load scope
   → 子应用正确但基座 Header 缺失 → 基座 computed 缓存问题
```

## 分层诊断

| 层 | 组件 | 权限判断方式 | 常见问题 |
|----|------|------------|---------|
| microfb 基座 | NavbarActions | `checkHasPerm` / Header 侧 | computed 缓存不重算 |
| microfb 基座 | 路由守卫 | 菜单 routePath + 白名单 → `/404` | 漏白名单（个人中心）；非法 path |
| apex 子应用 | router.beforeEach | **仅** `RoutePermDict.load(to)` | 误加 `fuzzyRejected→/404`；未 load → scope null |
| apex 子应用 | 页面 index.vue | `checkHasPerm` / `v-hasPerm` | function 挂错 page |
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

// 2. 路由作用域（须在目标路由页面）
// import { RoutePermDict } from '@/services/permissions';
const scope = RoutePermDict.getScope();
const allowed = RoutePermDict.getAllowed();
console.log('scope:', scope);
console.log('allowed:', allowed ? [...allowed] : null);
console.log('ambiguous:', scope?.ambiguous);

// 3. 特定 perm
checkHasPerm('sys:dashboard:view');

// 4. 对比 user.permissions 与 allowed
const code = 'sys:dashboard:view';
console.log('in user.permissions:', ui?.permissions?.includes(code));
console.log('in allowed:', allowed?.has(code));
```
