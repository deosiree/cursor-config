# qiankun globalState notification 协议

## 机制

- 传输层：qiankun `initGlobalState` + `setGlobalState`
- 项目协议：`notification: { from, message, data, timestamp }`
- 主应用消费：`onGlobalStateChange` → `globalStateSideEffects[]`

## notification 载荷

```typescript
{
  notification: {
    from: string;      // 子应用名，如 APP_NAME
    message: string;   // 业务消息常量，全局唯一
    data?: Record<string, unknown>;
    timestamp: number; // Date.now()，用于去重
  }
}
```

## message 注册表（nebula 样本）

| message | 方向 | 消费方式 | 源文件 |
|---|---|---|---|
| `profile_username_updated` | 子→主 | patch userStore.username/displayName | microfb `plugins/qiankun/actions.ts` |
| `station_change_fromChild` | 子→主 | CustomEvent `qiankun-child-switch-station` | microfb `plugins/qiankun/actions.ts` |
| `microgrid_station_change` | 子→主 | CustomEvent 刷新电站列表 | microfb `plugins/qiankun/actions.ts` |
| `stationContext` | 主→子 | props + CustomEvent | microfb `plugins/qiankun/actions.ts` |

## timestamp 去重

```typescript
function hasChangedByTimestamp(next, prev) {
  return Boolean(next?.timestamp && next.timestamp !== prev?.timestamp);
}
```

同一 message 重复 setGlobalState 但 timestamp 未变 → sideEffect 不执行。

## lazy import 规则

主应用 sideEffect 若需 `useUserStore`，**必须**动态 import：

```typescript
void import("@/store").then(({ store, useUserStore }) => { /* patch */ });
```

禁止 actions.ts 静态 import user.store → apps.ts → actions 循环依赖。

## 字段约定（nebula，已统一 username）

| 层 | 字段 | 说明 |
|---|---|---|
| apex / microfb stable | `username` | store、Navbar、notify payload 均用此字段 |
| microfb sideEffect patch | `username`, `displayName` | handler 写入；Navbar 读 `username` |
| props 下发 | 直接 spread `userInfo` | 不再 synthetic `userName` 别名 |

持久化：microfb `watch(userInfo, { deep: true })` → `Auth.setUserInfo`。

## 反模式

- 只靠 `localStorage.setItem` 期望同页主应用 Pinia 更新（同 tab 不触发 storage 事件）
- 静态 import 造成 actions ↔ store 循环依赖
- 新增 message 但未注册到 `globalStateSideEffects`
- 子应用未 `isQiankunEnv()` 守卫就 notify（独立运行无意义）
- notify payload 使用已废弃的 `userName` 键（应统一 `username`）
