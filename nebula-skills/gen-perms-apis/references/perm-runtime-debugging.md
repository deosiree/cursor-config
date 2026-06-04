# 权限运行时排障规则

## 核心链路

```
sessionStorage.userInfo.isOwner
    → hasPermissionBypass(userInfo)
    → checkHasPerm(perm)
    → v-hasPerm / v-if / computed
```

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

**现象**：菜单补丁已导入，但用户仍无权限。

**根因**：权限在 `permsMap` 中不存在。

**排查**：
- 菜单补丁是否已正式导入（非仅 dry_run）？
- 角色模板是否已勾选新 perm？
- 用户是否重新登录或刷新了权限？

### 5. microfb vs apex 生命周期差异

| 组件 | 挂载时机 | 权限计算时机 |
|------|---------|------------|
| microfb `NavbarActions` | App 启动即挂载（`v-show` 隐藏） | 首屏计算一次，登录后可能不重算 |
| apex 子应用 | 登录后 mount | `syncUserInfoFromHost` 在 render 前执行 |

## 排障决策树

```
权限异常
├─ isOwner 绕过失效 → 检查 sessionStorage.userInfo.isOwner
├─ Header 入口不显示 → 检查 computed 响应式依赖
├─ 页面被拦 → 检查 perm 是否已导入 + 角色是否已分配
└─ qiankun 主子不一致 → 检查 userInfo 同步时机
```

## OpenCLI 快速排障命令

```js
// 1. 检查 userInfo
JSON.parse(sessionStorage.getItem('userInfo'))

// 2. 检查 bypass
// 在控制台执行
const ui = JSON.parse(sessionStorage.getItem('userInfo'));
console.log('isOwner:', ui?.isOwner, typeof ui?.isOwner);

// 3. 检查特定 perm
// import { checkHasPerm } from '...'
checkHasPerm('sys:dashboard:view')

// 4. 模拟 bypass 失效（负向测试）
const ui = JSON.parse(sessionStorage.getItem('userInfo'));
delete ui.isOwner;
sessionStorage.setItem('userInfo', JSON.stringify(ui));
// 刷新页面观察行为
```
