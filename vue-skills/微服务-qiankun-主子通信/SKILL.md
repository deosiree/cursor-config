---
name: 微服务-qiankun-主子通信
description: qiankun 微前端主子应用 globalState 通信：notifyMainApp、globalStateSideEffects、sideEffect、微前端同步、子应用通知主应用。Use when qiankun、主子应用、globalState、notifyMainApp、sideEffect、Navbar 不同步、profile_username_updated。
---

# 微服务-qiankun-主子通信

## 何时使用

- 子应用内用户操作后，主应用壳层（Navbar、tab、列表）需**同页即时**更新
- 新增或排查 `notifyMainApp` / `globalStateSideEffects` 双端协议
- 主应用登录后向子应用下发 `userInfo` / `menuList`（props 路径）

## 何时不要使用

- 纯 CSS / 样式调整（如「改 Navbar 字体颜色」）
- axios 拦截器、token 刷新（如「拦截器加 token」）
- 跨浏览器标签页同步（本协议仅同页；跨 tab 需 BroadcastChannel 等）
- 子应用独立部署调试、不涉及主应用壳层 UI 联动

## Single Dispatch 路由表

| 场景 | dispatch 唯一 intention |
|---|---|
| 不确定项目是否已有实现 | [[路由-主子通信任务]] → [[分析-通信基线]] |
| 明确要加一条子→主 notify | [[路由-主子通信任务]] → [[编排-扩展notification]] |
| Storage 写了主应用 Pinia 不变 | [[路由-主子通信任务]] → [[分析-通信基线]] |

**禁止**主 skill 自动链式 dispatch 多个 intention。

## 输入契约

| 字段 | 说明 |
|---|---|
| `targetRepo` | 主/子应用路径 |
| `communicationDirection` | 子→主 \| 主→子 |
| `messageName` | 如 `profile_username_updated` |
| `syncTarget` | Navbar / tab / 列表 |

## 机制摘要

```
子应用 notifyMainApp(message, data)
  → qiankun setGlobalState({ notification })
  → 主应用 onGlobalStateChange
  → hasChangedByTimestamp 去重
  → globalStateSideEffects handler
  → patch store 或 CustomEvent
```

协议详情：[[references/qiankun-globalState-notification协议]]

## 反模式黑名单

- 只靠 `localStorage.setItem` 期望同页主应用 Pinia 更新
- actions.ts 静态 import user.store 造成循环依赖
- 重复 `resetFields()` 触发 Element Plus 校验报错（与通信无关但常伴 personal center 改动）
- 双端各写一套 notify 封装，message 未注册
- payload 使用废弃键 `userName`（应统一 `username`）

## 失败分支

| 现象 | 原因 | 处理 |
|---|---|---|
| notify 无反应 | `isQiankunEnv()===false` | 独立运行正常；联调需在 microfb 壳内 |
| handler 不执行 | timestamp 未变 | 确保每次 notify 新 `Date.now()` |
| Navbar 仍旧值 | message 未注册或字段名不一致 | 查 sideEffects 数组与 [[映射-跨应用字段对齐]] |
| 循环依赖报错 | 静态 import store | 改 lazy `import("@/store")` |

## 使用示例（nebula 真实路径）

```text
子应用在 qiankun 内改完用户信息，主应用 Navbar 不更新。

使用 $微服务-qiankun-主子通信，参考 nebula：
- 子应用 apex_dev：profile 在 setUserInfo 后
  notifyMainApp("profile_username_updated", { username: trimmedUsername })
  （src/views/profile/index.vue + src/plugins/qiankun/actions.ts）
- 主应用 microfb：handleProfileUsernameUpdated 注册到 globalStateSideEffects，
  lazy import useUserStore 后 patch username/displayName
  （src/plugins/qiankun/actions.ts）
```

## 子 skill 索引

**intention-skills**

- [[路由-主子通信任务]]
- [[分析-通信基线]]
- [[编排-扩展notification]]

**feature-skills**

- [[判定-通信方向与消息类型]]
- [[实现-子应用发通知]]
- [[实现-主应用sideEffect]]
- [[实现-主应用下发子应用]]
- [[映射-跨应用字段对齐]]
- [[沉淀-历史样本为few-shot]]

**few-shot**

- [[assets/few-shot-example/子应用通知主应用-用户信息同步]]
- [[assets/few-shot-example/子应用通知主应用-电站切换]]

## 🔴 CHECKPOINT · 写码前确认

进入 [[编排-扩展notification]] 前，必须输出并获确认（或自洽推断）：

1. `messageName` 不与 `references/qiankun-globalState-notification协议.md` 注册表冲突
2. `consumerPattern`：patchStore | customEvent | propsSync
3. 双端文件路径（子应用 notify 点 + 主应用 actions.ts）

**🛑 STOP**：message 未确认 → 禁止写 handler / notify 调用。

## 验证要求

- 同页 UI 即时更新（不刷新）
- localStorage 与 Pinia 字段一致
- 子应用独立运行不报错（`isQiankunEnv()` 守卫）
- message 已写入 references 注册表

## RED / GREEN / REFACTOR

| 阶段 | 动作 |
|---|---|
| RED | [[分析-通信基线]] 输出 existingMessages 与 gap |
| GREEN | [[编排-扩展notification]] 双端最小改动 |
| REFACTOR | 沉淀 few-shot、更新 references 注册表；人类模板见 `template/` |
