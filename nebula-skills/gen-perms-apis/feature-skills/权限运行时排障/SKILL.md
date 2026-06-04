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
│  │  └─ 刷新后仍不出现 → perm 未配置或 permsMap 未包含
│  └─ computed 是否依赖 userInfo ref？
│     ├─ 只读 sessionStorage → 登录后不重算，需添加 store ref 依赖
│     └─ 已依赖 store ref → 检查 store 更新时机
├─ 页面守卫拦截
│  ├─ 是 owner 但仍被拦？
│  │  └─ checkHasPerm 中的 hasPermissionBypass 是否读到 isOwner？
│  └─ 非 owner 被拦 → 预期行为，检查角色 perm 是否已导入
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
| 新 perm 不生效 | permsMap 未包含新 perm | 导入菜单补丁后重新登录或刷新权限 |
| microfb vs apex 双重守卫 | 基座和子应用各自判断权限，生命周期不同 | 基座负责 UI 显隐，子应用负责页面守卫；不要双重实现 |

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
