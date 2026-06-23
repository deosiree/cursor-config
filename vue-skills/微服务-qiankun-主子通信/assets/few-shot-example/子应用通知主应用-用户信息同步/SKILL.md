---
name: 子应用通知主应用-用户信息同步
description: few-shot：apex 改用户名后 microfb Navbar 即时同步。Use when profile_username_updated、用户名不同步。
---

# 子应用通知主应用-用户信息同步

## 触发 prompt

```text
子应用在 qiankun 内改完用户信息，主应用 Navbar 不更新。
参考 nebula 实现 profile_username_updated 双端同步。
```

## 改前（RED）

**子应用** — 仅更新本地 store，主应用无感知：

```typescript
// apex_dev/src/views/profile/index.vue — USERNAME 成功分支
await UserGateway.updateProfile({ id: userId, username: trimmedUsername });
useUserStoreHook().setUserInfo({ username: trimmedUsername });
await refreshProfile({ refreshing: false });
// ❌ 无 notifyMainApp
```

**主应用** — 无 `profile_username_updated` handler。

## 改后（GREEN）

**子应用 notify：**

```typescript
// apex_dev/src/views/profile/index.vue
import { isQiankunEnv } from "@/plugins/qiankun/lifecycle";
import { notifyMainApp } from "@/plugins/qiankun/actions";

useUserStoreHook().setUserInfo({ username: trimmedUsername });
if (isQiankunEnv()) {
  notifyMainApp("profile_username_updated", { username: trimmedUsername });
}
```

**主应用 sideEffect：**

```typescript
// microfb/src/plugins/qiankun/actions.ts
function handleProfileUsernameUpdated(state, prev) {
  const next = state.notification;
  if (next?.message !== "profile_username_updated") return;
  if (!hasChangedByTimestamp(next, prev?.notification)) return;
  const username = String(next.data?.username ?? "").trim();
  if (!username) return;
  void import("@/store").then(({ store, useUserStore }) => {
    Object.assign(useUserStore(store).userInfo, { username, displayName: username });
  });
}

globalStateSideEffects.push(handleProfileUsernameUpdated);
```

## 验收步骤

1. microfb 壳内打开 apex 个人中心
2. 修改用户名并提交成功
3. **不刷新页面**，microfb 右上角显示新用户名
4. DevTools → Application → localStorage `userInfo` 含新 `username`/`displayName`

## 源文件 traceability

| 文件 | 角色 |
|---|---|
| `nebula/apex_dev/src/views/profile/index.vue` | 业务触发 notify |
| `nebula/apex_dev/src/plugins/qiankun/actions.ts` | notifyMainApp 封装 |
| `nebula/microfb/src/plugins/qiankun/actions.ts` | sideEffect handler |
| `nebula/microfb/src/store/modules/user/user.store.ts` | deep watch 落盘 |
