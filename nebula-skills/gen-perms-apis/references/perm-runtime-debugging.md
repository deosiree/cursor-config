# 权限运行时排障规则

## 核心链路（RoutePermDict 时代）

```
[基座] beforeEach → 菜单/白名单 → 非法 /404

[子应用] beforeEach
    → RoutePermDict.load(route)   // 仅 load，不做 fuzzyRejected→/404
    → resolveScope(routePath + params 漏斗)
    → collectPerms(命中节点, perms)  // 就地写入，仅直接 function 子节点
    → allowed = visiblePermSet ∩ user.permissions
    → checkHasPerm(perm) / v-hasPerm
```

> 权威参考：`[[route-scope-auth-chain.md]]`  
> 历史对比（permsMap 时代）：`[[../template/sample-run/before-03-旧鉴权链路-permsMap.md]]`

`checkHasPerm` 判定顺序：

1. 未传 perm → 通过
2. `RoutePermDict.pass(userInfo)` → `isOwner` 通过
3. `RoutePermDict.has(requiredPerms)` → 当前路由 scope 的 `allowed` 集合

## 已知坑位

### 1. isOwner 绕过失效

**现象**：租户所有者（admin@system.local）也被权限检查拦截。

**根因**：`sessionStorage.userInfo.isOwner !== true`。

**排查**：
```js
JSON.parse(sessionStorage.getItem('userInfo'))
// 应有 isOwner: true（boolean）
```

**触发条件**：
- 旧 tab / 旧 sessionStorage 未重新登录
- Cookie 仍有效但 userInfo 未刷新（半登录态）
- 登录 API 返回了 `isOwner` 但未写入 sessionStorage

**修复**：完全退出重新登录，不要只刷新页面。

### 2. Header 登录后不显示 perm 入口

**现象**：登录后 Header 下拉中无「个人中心」，刷新后出现。

**根因**：computed 只读 `sessionStorage`，不依赖 Pinia store ref。登录前已计算为 `false`，登录后 `loginAfterAuth` 写入 userInfo 但 computed 不重算。

**排查**：
```js
// NavbarActions 中
const canViewProfile = computed(() => {
  // 只读 sessionStorage → 不会重算
  return checkHasPerm("sys:profile:view");
});
```

**修复**：computed 中添加响应式依赖：
```js
const canViewProfile = computed(() => {
  const info = userInfo.value;
  if (info?.id || info?.username) {
    void info.isOwner;
    void info.permissions;
  }
  return checkHasPerm("sys:profile:view");
});
```

### 3. 半登录态

**现象**：页面同时显示菜单壳层和登录表单。

**根因**：Cookie 仍有效（后端 session 未过期），但 `sessionStorage.userInfo` 不完整/过期。

**修复**：
- 短期：检测到已登录但 userInfo 不完整时，调 `user/detail` 补全
- 长期：应用启动时自动补全关键字段（`isOwner`、`permissions`）

### 4. 新 perm 不生效

**现象**：菜单补丁已导入，但用户仍无权限或按钮不显示。

**根因**（按优先级）：

0. `fuzzyRejected === true` → 未命中合法 page（directory 等），与 role perm 无关；**勿**建议子应用加 `/404` 守卫
1. `routeProjectMap` 无当前 path 的 route 节点 → scope 为空
2. function 挂在错误 page 子树下 → `getAllowed()` 不含目标 perm
3. 菜单导入后未 relogin / 未 `syncMenuCacheOnly` → 旧 routeProjectMap
4. 角色模板未勾选新 perm → `user.permissions` 不含 code
5. function `is_visible: false` 或 `is_system_only` 且非平台租户

**排查**（导航到目标路由后）：
```js
// 需在目标页面执行
import { RoutePermDict } from '@/services/permissions';

const scope = RoutePermDict.getScope();
const allowed = RoutePermDict.getAllowed();
console.log({ scope, allowed: allowed ? [...allowed] : null });
console.log('fuzzyRejected:', scope?.fuzzyRejected);
console.log('matchedNodeType:', scope?.matchedNodeType);

const ui = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
console.log('user.permissions contains:', ui.permissions?.includes('sys:foo:view'));
```

**不要**以 `userInfo.permsMap` 作为主真相源（已废弃，见 before-03）。

### 5. ambiguous 路由告警

**现象**：通知「当前路由不唯一，鉴权可能不准确…」

**根因**：多个 page 共享 `route_path` 且 params 无法唯一消歧。

**修复**：为每个冲突 page 补 distinct `params`，确保 URL query/params 可唯一命中。见 `[[../template/sample-run/snapshot-03-路由params消歧.md]]`。

### 6. microfb vs apex 生命周期差异

| 组件 | 挂载时机 | 权限计算时机 |
|------|---------|------------|
| microfb `NavbarActions` | App 启动即挂载（`v-show` 隐藏） | 首屏计算一次，登录后可能不重算 |
| apex 子应用 | 登录后 mount | `syncUserInfoFromHost` 在 render 前执行；`beforeEach` 调 `RoutePermDict.load` |

## 排障决策树

```
权限异常
├─ 路由/菜单命中失败（先于 perm）
│  ├─ 访问即基座 /404 → microfb 菜单 path / 白名单
│  ├─ fuzzyRejected === true → directory 命中，改菜单 type/结构（子应用不跳转）
│  ├─ matchMode === 'fuzzy' 且按钮正常 → 子路由继承 page 父节点（预期）
│  └─ 禁止恢复子应用 fuzzyRejected → next('/404')
├─ allowed 偏大 / sibling 页按钮误显
│  ├─ scope.routePath 是否为 leaf page?
│  ├─ scope.perms 键数是否 > 当前页 function 数?
│  └─ 补独立 page entry → route_path + type=page
├─ isOwner 绕过失效 → 检查 sessionStorage.userInfo.isOwner
├─ Header 入口不显示 → 检查 computed 响应式依赖
├─ 有 role perm 但按钮不显示
│  ├─ RoutePermDict.getScope() 是否 null / ambiguous?
│  ├─ getAllowed() 是否含目标 perm?
│  ├─ function 是否挂在正确 page 子树?
│  └─ is_visible / is_system_only 过滤?
├─ 页面被拦 → perm 是否已导入 + 角色已分配 + routeProjectMap 已更新
└─ qiankun 主子不一致 → 检查 userInfo 同步时机 + load 是否执行
```

## OpenCLI 快速排障命令

```js
// 1. 检查 userInfo
JSON.parse(sessionStorage.getItem('userInfo'))

// 2. 检查 bypass
const ui = JSON.parse(sessionStorage.getItem('userInfo'));
console.log('isOwner:', ui?.isOwner, typeof ui?.isOwner);

// 3. 检查路由作用域（须在目标路由页面）
// RoutePermDict.getScope() / getAllowed()

// 4. 检查特定 perm
checkHasPerm('sys:dashboard:view')

// 5. 模拟 bypass 失效（负向测试）
const ui = JSON.parse(sessionStorage.getItem('userInfo'));
delete ui.isOwner;
sessionStorage.setItem('userInfo', JSON.stringify(ui));
// 刷新页面观察行为
```
