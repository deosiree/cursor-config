---
name: template-电站切换-after
description: GREEN 模板：station_change_fromChild + CustomEvent 高亮 tab。Use when 子应用切换电站通知主应用。
---

# GREEN：电站切换 — CustomEvent 双端片段

## 何时用这份模板

- message = `station_change_fromChild`
- consumerPattern = **customEvent**（非 patchStore）

## 子应用 notify

```typescript
import { isQiankunEnv } from "@/plugins/qiankun/lifecycle";
import { notifyMainApp } from "@/plugins/qiankun/actions";

if (isQiankunEnv()) {
  notifyMainApp("station_change_fromChild", {
    stationId: station.stationId,
    stationName: station.stationName,
    stationType: station.stationType,
    currentRoute: router.currentRoute.value.path,
  });
}
```

## 主应用 sideEffect（nebula microfb L136-166）

```typescript
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

globalStateSideEffects.push(handleChildAppSwitchStationNotification);
```

## patchStore vs CustomEvent 选型

| 目标 UI | 模式 | message 样本 |
|---|---|---|
| Navbar 用户名 | patchStore | `profile_username_updated` |
| tab 高亮 | customEvent | `station_change_fromChild` |
| 列表刷新 | customEvent | `microgrid_station_change` |

## 分步验收

1. microfb 壳内，子应用切换电站
2. **不刷新页面**：主应用 tab 栏对应项高亮
3. Console 无 `循环依赖` / `Cannot read property of undefined`
4. payload 必含 `stationId`，否则 handler 早退

## agent 执行

完整 traceability 见 `assets/few-shot-example/子应用通知主应用-电站切换/`。
