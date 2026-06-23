---
name: template-用户信息同步-after
description: GREEN 模板：profile_username_updated 双端完整片段。Use when 实现子应用 notify + 主应用 sideEffect patchStore。
---

# GREEN：用户信息同步 — 完整双端片段

## 何时用这份模板

- message 已定为 `profile_username_updated`
- consumerPattern = **patchStore**（Navbar 读 `userInfo.username`）
- stable 层统一字段 **`username`**（apex / microfb 同名字段）

## 子应用：封装 + 业务调用

```typescript
// apex_dev/src/plugins/qiankun/actions.ts
export function notifyMainApp(message: string, data?: any) {
  setGlobalState({
    notification: { from: APP_NAME, message, data, timestamp: Date.now() },
  });
}

// apex_dev/src/views/profile/index.vue — API 成功 + setUserInfo 之后
import { isQiankunEnv } from "@/plugins/qiankun/lifecycle";
import { notifyMainApp } from "@/plugins/qiankun/actions";

useUserStoreHook().setUserInfo({ username: trimmedUsername });
if (isQiankunEnv()) {
  notifyMainApp("profile_username_updated", { username: trimmedUsername });
}
```

## 主应用：timestamp 去重 + lazy import patch

```typescript
// microfb/src/plugins/qiankun/actions.ts
function hasChangedByTimestamp(next, prev) {
  return Boolean(next?.timestamp && next.timestamp !== prev?.timestamp);
}

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

const globalStateSideEffects = [
  // ...existing handlers
  handleProfileUsernameUpdated,
];
```

## 分步验收

1. microfb 壳内打开 apex 个人中心（**不要**独立打开 apex）
2. 修改用户名 → 提交 → 等待 API 成功
3. **不刷新页面**：microfb 右上角立即显示新用户名
4. DevTools → Application → localStorage → 主应用 `userInfo` 含新 `username` 与 `displayName`
5. 独立运行 apex（非 qiankun）改用户名 → 不报错、不 notify（isQiankunEnv 守卫）

## 注册表

完成后更新 `references/qiankun-globalState-notification协议.md` message 表。

## agent 执行

完整 traceability 见 `assets/few-shot-example/子应用通知主应用-用户信息同步/`。
