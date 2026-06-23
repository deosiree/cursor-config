---
name: template-电站切换-before
description: RED 模板：子应用切换电站后主应用 tab 无高亮。Use when 缺 station_change_fromChild sideEffect。
---

# RED：电站切换 — 改前无 sideEffect

## 何时用这份模板

- 子应用内切换电站后，主应用 tab 栏无高亮、无联动
- 误用 patchStore 改 userStore（电站场景应走 CustomEvent）

## 失败信号

| 信号 | 含义 |
|---|---|
| 子应用路由/列表已切换 | 子应用本地 state 正常 |
| 主应用 tab 未高亮 | 壳层 UI 未收到事件 |
| 刷新后 tab 可能对 | mount 时 props/route 同步正常，缺**运行时 notify** |
| 已有 `microgrid_station_change` | 列表刷新与 tab 高亮是**不同 message**，勿混用 |

## 子应用 — 仅有本地切换，无 notify

```typescript
// 示意：子应用切换电站成功分支
await switchStation(station);
router.push({ path: stationRoute });
// ❌ 无 notifyMainApp("station_change_fromChild", ...)
```

## 主应用 — globalStateSideEffects 无 handler

```typescript
const globalStateSideEffects = [
  handleStationContextChange,
  // ❌ 无 handleChildAppSwitchStationNotification
];
```

## 根因一句话

tab 高亮模块与 qiankun actions 解耦 → 应用 **CustomEvent** 桥接，不是 patch userStore。

## 下一步

读 `../after/SKILL.md`；message 用 `station_change_fromChild`（勿自造命名）。
