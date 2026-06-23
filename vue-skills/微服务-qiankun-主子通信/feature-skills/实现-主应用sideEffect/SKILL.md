---
name: 实现-主应用sideEffect
description: 在主应用 qiankun actions 中注册 globalState sideEffect 消费子应用 notification。Use when sideEffect、globalStateSideEffects、handleProfileUsernameUpdated。
---

# 实现-主应用sideEffect

## 何时使用

- 子应用已 notify 或即将 notify，主应用需消费 notification
- 新增 handler 并注册到 `globalStateSideEffects`

## 何时不要使用

- 主→子 仅 props → [[实现-主应用下发子应用]]
- consumerPattern=customEvent 但误用 patchStore → 先 [[判定-通信方向与消息类型]]

## 输入契约

| 字段 | 说明 |
|---|---|
| `messageName` | 与子应用 notify 完全一致 |
| `consumerPattern` | patchStore \| customEvent |
| `hostActionsFile` | 通常 `plugins/qiankun/actions.ts` |

## 核心任务

新增 handler + 注册到 `globalStateSideEffects` 数组。

## handler 模板（patchStore 型）

```typescript
function handleProfileUsernameUpdated(state: GlobalState, prev: GlobalState) {
  const nextNotification = state.notification;
  const prevNotification = prev?.notification;
  if (nextNotification?.message !== "profile_username_updated") return;
  if (!hasChangedByTimestamp(nextNotification, prevNotification)) return;

  const username = String(nextNotification.data?.username ?? "").trim();
  if (!username) return;

  void import("@/store").then(({ store, useUserStore }) => {
    const userStore = useUserStore(store);
    Object.assign(userStore.userInfo, { username, displayName: username });
  });
}
```

## handler 模板（CustomEvent 型，电站切换）

```typescript
function handleChildAppSwitchStationNotification(state: GlobalState, prev: GlobalState) {
  const nextNotification = state.notification;
  const prevNotification = prev?.notification;
  if (nextNotification?.message !== "station_change_fromChild") return;
  if (!hasChangedByTimestamp(nextNotification, prevNotification)) return;

  const stationData = nextNotification.data;
  if (!stationData?.stationId) return;

  window.dispatchEvent(
    new CustomEvent("qiankun-child-switch-station", {
      detail: {
        stationId: stationData.stationId,
        stationName: stationData.stationName,
        stationType: stationData.stationType,
        currentRoute: stationData.currentRoute,
      },
    })
  );
}
```

## 注册

```typescript
const globalStateSideEffects = [
  // ...existing
  handleProfileUsernameUpdated,
];
```

## 检查清单

- [ ] message 字符串与子应用 notify 一致
- [ ] `hasChangedByTimestamp` 去重
- [ ] store patch 用 lazy import
- [ ] JSDoc 说明触发来源与 patch 字段

## 失败分支

| 现象 | 处理 |
|---|---|
| notify 发出无反应 | 查 handler 是否 push 到 globalStateSideEffects |
| handler 执行但 UI 不变 | patchStore 查字段；customEvent 查监听方 |
| 循环依赖 | 改 lazy import，禁止静态 import user.store |

## 反模式

- 静态 import user.store 导致循环依赖
- 未注册到数组 → notify 发出但主应用无反应

## 使用示例

```text
microfb 收到 profile_username_updated 后 patch userStore.username。
参考：nebula/microfb/src/plugins/qiankun/actions.ts handleProfileUsernameUpdated。
```
