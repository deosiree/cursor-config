---
name: 实现-子应用发通知
description: 在 qiankun 子应用中通过 notifyMainApp/setGlobalState 向主应用发送 notification。Use when 子应用发通知、notifyMainApp、setGlobalState。
---

# 实现-子应用发通知

## 何时使用

- consumerPattern 已定为子→主，需在业务成功点发 notify
- 子应用已有 `notifyMainApp` 封装，只缺 callSite

## 何时不要使用

- 主→子 props 下发 → [[实现-主应用下发子应用]]
- 主应用消费 handler 尚未存在 → 先协调 [[实现-主应用sideEffect]]

## 输入契约

| 字段 | 说明 |
|---|---|
| `messageName` | 已确认的全局常量 |
| `callSiteFile` | 业务成功回调所在文件 |
| `payloadFields[]` | 来自 [[映射-跨应用字段对齐]] |

## 核心任务

在业务成功回调中调用 `notifyMainApp(message, data)`，且仅 qiankun 环境发送。

## 前置：notifyMainApp 封装（nebula apex_dev）

```typescript
// src/plugins/qiankun/actions.ts
export function notifyMainApp(message: string, data?: any) {
  setGlobalState({
    notification: {
      from: APP_NAME,
      message,
      data,
      timestamp: Date.now(),
    },
  });
}

export function setGlobalState(state: Partial<GlobalState>) {
  if (qiankunWindow.__POWERED_BY_QIANKUN__ && qiankunProps?.setGlobalState) {
    qiankunProps.setGlobalState(state);
  }
}
```

## 业务调用模板

```typescript
import { isQiankunEnv } from "@/plugins/qiankun/lifecycle";
import { notifyMainApp } from "@/plugins/qiankun/actions";

// 先写子应用本地 store/Storage
useUserStoreHook().setUserInfo({ username: trimmedUsername });

if (isQiankunEnv()) {
  notifyMainApp("profile_username_updated", { username: trimmedUsername });
}
```

## 检查清单

- [ ] `timestamp: Date.now()` 由 notify 封装统一生成
- [ ] `isQiankunEnv()` 守卫，独立运行不报错
- [ ] payload 含主应用消费字段（见 `映射-跨应用字段对齐`）
- [ ] 仅在 API 成功 + 本地 state 已更新后 notify

## 失败分支

- 不在 qiankun 内 → 跳过 notify，仅更新子应用本地 state
- notify 失败 → 不阻断子应用 UI；主应用可能不同步，需排查主应用 sideEffect

## 使用示例

```text
apex_dev profile 改用户名成功后，在 setUserInfo 后加 notifyMainApp("profile_username_updated", { username })。
参考：nebula/apex_dev/src/views/profile/index.vue DialogType.USERNAME 分支。
```
