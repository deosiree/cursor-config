---
name: 权限运行时排障
description: 排查权限运行时异常：isOwner 绕过失效、computed 缓存旧值、登录时序、sessionStorage 缺失、microfb vs apex 生命周期差异等。
---

# 权限运行时排障

## RED

- 没有本 skill 时，权限运行时异常容易被误判为"配置问题"而非代码问题
- 常见误判：
  - 「admin@system.local 为什么也被拦」→ 实际是 `isOwner` 字段未写入
  - 「登录后权限刷新了」→ 实际是整页刷新掩盖了 computed 缓存问题
  - 「个人中心不显示」→ 实际是 Header 组件在登录前就计算了权限

## 输入

- `异常现象描述`：必填
- `复现步骤`：可选
- `环境信息`：必填（microfb / apex_dev / 版本）

## GREEN

### 排障决策树

```
权限异常
├─ isOwner 绕过失效
│  ├─ sessionStorage.userInfo 是否存在？
│  │  ├─ 不存在 → Cookie 有效但 session 丢失（半登录态），需重新登录
│  │  └─ 存在但无 isOwner 字段 → 旧 session 未含新字段，需重新登录
│  └─ isOwner 为 false → 后端返回非 owner，检查账号角色
├─ Header 权限入口不显示
│  ├─ 登录后是否刷新了页面？
│  │  ├─ 刷新后出现 → computed 缓存问题，需修复依赖
│  │  └─ 刷新后仍不出现 → 查 RoutePermDict.getAllowed() 是否含 perm；勿查 permsMap
│  └─ computed 是否依赖 userInfo ref？
│     ├─ 只读 sessionStorage → 登录后不重算，需添加 store ref 依赖
│     └─ 已依赖 store ref → 检查 store 更新时机
├─ 路由/菜单命中失败（先于 perm 检查）
│  ├─ 访问即基座 /404 → microfb 菜单 path / 白名单（个人中心等）
│  ├─ getScope()?.fuzzyRejected === true → directory 命中，改菜单；勿加子应用 /404
│  ├─ matchMode === 'fuzzy' && 按钮正常 → 预期：子路由继承 page 父节点
│  └─ 禁止恢复子应用 fuzzyRejected → next('/404')
├─ allowed 偏大 / sibling 页按钮误显
│  ├─ getScope().routePath 是否为 leaf page（非祖先 path）?
│  ├─ Object.keys(scope.perms).length 是否 > 当前页 function 数?
│  └─ 菜单是否缺独立 page entry → 补 route_path + type=page
├─ 有 role perm 但按钮不显示
│  ├─ getScope() 是否 null 或 ambiguous?
│  ├─ getAllowed() 是否含目标 perm?
│  ├─ function 是否挂在正确 page 子树?
│  └─ is_visible / is_system_only 过滤?
├─ 页面守卫拦截
│  ├─ 是 owner 但仍被拦？
│  │  └─ RoutePermDict.pass 是否读到 isOwner?
│  └─ 非 owner 被拦 → 预期行为，检查 allowed 与角色 perm
├─ 「当前路由不唯一」告警
│  └─ ambiguous → 补 page params 消歧
└─ qiankun 主子应用 perm 不一致
   ├─ 基座 Header 正确但子应用页面被拦 → 子应用未同步 userInfo
   └─ 子应用正确但基座 Header 缺失入口 → 基座 NavbarActions 权限计算问题
```

### 已知坑位

| 坑位 | 根因 | 修复 |
|------|------|------|
| `isOwner` 绕过失效 | `sessionStorage.userInfo.isOwner` 不为 `true` | 重新登录，确保 `loginAfterAuth` 写入了完整 userInfo |
| Header 登录后不显示 perm 入口 | computed 只读 sessionStorage，不依赖 store ref | computed 中 `void userInfo.value?.isOwner` 建立响应式依赖 |
| 半登录态 | Cookie 有效但 sessionStorage 为空或过期 | 检测到已登录但 userInfo 不完整时，调 `user/detail` 补全 |
| 新 perm 不生效 | routeProjectMap 无节点 / function 挂错 page / 未 relogin | 查 getScope/getAllowed；导入后 syncMenuCacheOnly 或 relogin |
| ambiguous 告警 | 同 path 多 page 无 params | 补 page params；见 snapshot-03 |
| fuzzyRejected / 基座 404 | 剥离命中 directory 或无 page 父节点 / 白名单漏配 | 改菜单 type=page；URL 拦截归基座；见 `[[../路由鉴权迭代剥离匹配/SKILL.md]]` |
| allowed 偏大 / sibling 按钮 | scope 命中祖先非 leaf page | 补 leaf page entry；见 `[[../../template/sample-run/snapshot-05-collectPerms作用域决策.md]]` |
| 子应用误加重定向 | 以为路由鉴权要在子应用 beforeEach | **只** `RoutePermDict.load`；`/404` 归 microfb |

### microfb 基座排障要点

- `NavbarActions` 在登录页就已挂载（`v-show` 隐藏），computed 在首屏计算
- `checkHasPerm` 直接读 `sessionStorage`，不读 Pinia store
- `loginAfterAuth` 才写入 `userInfo`，登录前 `isOwner` 为 `undefined`
- 修复：computed 内 `void userInfo.value?.isOwner` 建立响应式依赖

### apex 子应用排障要点

- 子应用在登录后 mount，`syncUserInfoFromHost` 在 render 前执行
- 首屏一般能读到带 `isOwner` 的 userInfo
- 微前端模式下 `QianKunLayout`，不渲染 `BaseLayout`/`NavbarActions`
- Header 显隐由 microfb 基座负责，apex 只负责页面内守卫

## 输出

- `rootCause`：根因分析
- `affectedLayer`：microfb / apex / 两者
- `fixPlan`：修复方案
- `verification`：验证步骤

## REFACTOR

- 若诊断决策树膨胀但未修剪死分支（已修复的坑不再出现），收紧：每个节点必须对应至少一个真实案例
- 若排障被误路由到"配置问题"而实际是代码 bug（computed 缓存），优先检查 `sessionStorage` 读 vs store ref 读
- 若诊断只停在表面症状不追根因（如只说"权限不对"不追 `isOwner`），补决策树深度要求
- 若 microfb vs apex 分层诊断被混淆，补环境标注要求

## 使用示例

```text
租户所有者 admin@system.local 也被权限检查拦截了，用 OpenCLI 排查原因。
```

```text
登录后 Header 中的「个人中心」不显示，刷新后才出现，帮我排查。
```
