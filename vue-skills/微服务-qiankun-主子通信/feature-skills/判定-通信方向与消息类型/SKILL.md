---
name: 判定-通信方向与消息类型
description: 在扩展 qiankun 主子通信前，判定通信方向（子→主/主→子）并命名 message 常量。Use when 定 message、子应用通知主应用、主应用下发子应用、patchStore 还是 CustomEvent。
---

# 判定-通信方向与消息类型

## 何时使用

- 新增 notification 前，先定方向、message 名、消费模式
- 在 patchStore 与 customEvent 之间选型

## 何时不要使用

- message 与模式已在 references 注册表且场景完全匹配 → 直接 [[编排-扩展notification]]
- 纯 props 下发（登录/mount）→ [[实现-主应用下发子应用]]

## 输入契约

| 字段 | 说明 |
|---|---|
| `symptom` | 用户可见问题描述 |
| `syncTarget` | Navbar / tab / 列表 / 子应用 mount 数据 |
| `existingMessages[]` | 来自 [[分析-通信基线]]，可选 |

## 方向判定

| 方向 | 典型场景 | 实现模式 |
|---|---|---|
| 子→主 | 子应用改数据，主应用 Navbar/壳层要更新 | `notifyMainApp` + 主应用 sideEffect |
| 主→子 | 登录后下发 userInfo/menu；主应用切换上下文 | `getAppProps` / `setMicroAppProps` |
| 双向 | 少见；优先拆成两条单向 message | — |

## consumerPattern 决策树

```
syncTarget 绑主应用 Pinia 且字段明确？
  ├─ 是 → patchStore（例：Navbar username）
  └─ 否 → 需通知壳层某模块但不想 import store？
        ├─ 是 → customEvent（例：tab 高亮）
        └─ 否 → 子应用 mount 时读 props？
              └─ 是 → propsSync
```

## message 命名规范

- 格式：`{domain}_{action}` 或 `{domain}_{action}_fromChild`
- 全局唯一；写入 `references/qiankun-globalState-notification协议.md`
- nebula 样本：

| message | consumerPattern |
|---|---|
| `profile_username_updated` | patchStore |
| `station_change_fromChild` | customEvent |
| `microgrid_station_change` | customEvent |
| `stationContext` | propsSync |

## message 冲突处理

| 情况 | 动作 |
|---|---|
| 注册表已有同名 message | 复用 handler，只补 callSite |
| 语义相近但 payload 不同 | **新 message 名**，勿改旧 handler 语义 |
| 与已有 message 重复职责 | Human Loop 确认合并 |

## 输出（必须完整）

```text
communicationDirection: 子→主
messageName: profile_username_updated
consumerPattern: patchStore
payloadFields: [username]
hostPatchFields: [username, displayName]
```

## 边界

- 只判定，不写代码；实现交给 [[编排-扩展notification]] 后续 feature。

## 使用示例

```text
个人中心改用户名后 microfb 右上角不更新。
判定：子→主；message=profile_username_updated；consumerPattern=patchStore；
payload：username（stable 层统一字段）。
```
