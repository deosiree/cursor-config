---
name: 子应用通知主应用-电站切换
description: few-shot：子应用切换电站后主应用高亮 tab。Use when station_change_fromChild、qiankun-child-switch-station。
---

# 子应用通知主应用-电站切换

## 触发 prompt

```text
子应用切换电站后要通知主应用高亮 tab，不刷新整页。
参考 nebula station_change_fromChild 模式。
```

## 改前（RED）

子应用切换电站仅更新本地路由/state，主应用 tab 栏无高亮反馈。

**主应用** — `globalStateSideEffects` 无 `station_change_fromChild` handler。

## 改后（GREEN）

**子应用 notify（示意）：**

```typescript
notifyMainApp("station_change_fromChild", {
  stationId: station.stationId,
  stationName: station.stationName,
  stationType: station.stationType,
  currentRoute: router.currentRoute.value.path,
});
```

**主应用 sideEffect（nebula microfb）：**

```typescript
// microfb/src/plugins/qiankun/actions.ts L136-166
function handleChildAppSwitchStationNotification(state, prev) {
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

注册：`globalStateSideEffects.push(handleChildAppSwitchStationNotification)`。

## 验收步骤

1. 子应用内切换电站
2. 主应用 tab 栏对应项高亮，**无整页刷新**
3. Console 可见 `[主应用] 收到子应用切换站点通知` 日志（若保留）

## 源文件 traceability

| 文件 | 角色 |
|---|---|
| `nebula/microfb/src/plugins/qiankun/actions.ts` | handler + CustomEvent |
| 监听 `qiankun-child-switch-station` 的壳层组件 | tab 高亮 UI |

## 与 patchStore 模式对比

| | 用户信息 | 电站切换 |
|---|---|---|
| consumerPattern | patchStore | customEvent |
| 原因 | Navbar 绑 Pinia | tab 模块解耦 |
