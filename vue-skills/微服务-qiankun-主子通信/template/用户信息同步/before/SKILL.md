---
name: template-用户信息同步-before
description: RED 模板：子应用改用户名后主应用 Navbar 不更新。Use when 排查 Storage 写了 Pinia 不变、缺 notify/sideEffect。
---

# RED：用户信息同步 — 改前缺失 notify / sideEffect

## 何时用这份模板

- 子应用 profile 已 `setUserInfo`，但 microfb 壳层 Navbar 仍为旧用户名
- 怀疑「写了 localStorage 主应用就会变」——需证明同 tab 不会触发 Pinia 更新

## 失败信号（必须全部理解）

| 信号 | 含义 |
|---|---|
| 子应用 UI 已显示新用户名 | 子应用 Pinia/Storage 已更新，**不是 API 失败** |
| microfb 右上角仍为旧名 | 主应用 `userStore.userInfo.username` 未 patch |
| DevTools localStorage 子应用 key 已变 | Storage 写入成功，**不能**作为「主应用已同步」证据 |
| 刷新整页后正确 | 说明 props 读 Storage 路径正常，缺**运行时 notify** |

## 子应用（apex_dev profile）— 仅有本地写入

```typescript
// src/views/profile/index.vue — USERNAME 成功分支
await UserGateway.updateProfile({ id: userId, username: trimmedUsername });
useUserStoreHook().setUserInfo({ username: trimmedUsername });
await refreshProfile({ refreshing: false });
// ❌ 无 notifyMainApp
```

## 主应用（microfb actions.ts）— 无对应 handler

```typescript
const globalStateSideEffects = [
  handleStationContextChange,
  handleMenuVisibilityIntentChange,
  handleStationListChangeNotification,
  handleChildAppSwitchStationNotification,
  // ❌ 无 handleProfileUsernameUpdated
];
```

## 根因一句话

Navbar 绑 **主应用 Pinia**，子应用写 **子应用 Storage**；同 tab 无 storage 事件 → 必须子→主 `notifyMainApp`。

## 下一步

读 `../after/SKILL.md` 或 dispatch [[编排-扩展notification]]。
