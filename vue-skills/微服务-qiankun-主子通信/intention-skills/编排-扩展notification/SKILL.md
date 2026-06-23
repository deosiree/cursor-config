---
name: 编排-扩展notification
description: GREEN 主编排：新增 qiankun notification 双端实现的标准 5 步。Use when 加 notify、扩展 globalState、profile_username_updated、station_change_fromChild。
---

# 编排-扩展notification

## 何时使用

- 已确认需要新增一条子→主（或扩展已有）notification
- RED 阶段 [[分析-通信基线]] 已输出 gap，或用户明确 message 名
- 参考 nebula 复刻 `profile_username_updated` / `station_change_fromChild`

## 何时不要使用

- 尚未确认通信方向 → 先 [[判定-通信方向与消息类型]] 或 [[分析-通信基线]]
- 纯主→子 props 下发（登录/mount）→ [[实现-主应用下发子应用]]
- 仅排查 CSS、axios、与 globalState 无关的问题

## 输入契约

| 字段 | 必填 | 说明 |
|---|---|---|
| `targetRepo` | 是 | 主/子应用仓库根路径 |
| `messageName` | 第 1 步产出 | 全局唯一常量 |
| `communicationDirection` | 第 1 步产出 | 通常子→主 |
| `syncTarget` | 是 | Navbar / tab / 列表 |
| `consumerPattern` | 第 1 步产出 | patchStore \| customEvent |

## 标准 5 步

每步 **wiki-link 到 feature**，按序执行：

1. [[判定-通信方向与消息类型]] → 定 `message` 与 `consumerPattern`
2. [[实现-子应用发通知]] → `isQiankunEnv()` + `notifyMainApp`
3. [[实现-主应用sideEffect]] → handler + 注册 `globalStateSideEffects`
4. [[映射-跨应用字段对齐]] → payload 双写字段 + patch 清单
5. **验收**（见下方可执行步骤）

## 🔴 CHECKPOINT · Step 1 完成后 STOP

输出以下字段，**确认后再进入 Step 2 写码**：

```text
messageName: profile_username_updated
consumerPattern: patchStore
payloadFields: [username]
hostPatchFields: [username, displayName]
```

若 message 已在注册表且 handler 已存在 → **🛑 STOP**，Human Loop：复用还是扩展 payload？

## 分步验收（Step 5 可执行）

1. microfb（或主应用）壳内加载子应用，**勿**独立打开子应用 URL
2. 触发业务操作（改用户名 / 切换电站）
3. **不刷新页面**，观察 `syncTarget` UI 是否即时更新
4. DevTools → Application → localStorage → 核对主应用 userInfo 字段
5. 独立运行子应用同一操作 → 无报错、无多余 notify 副作用

## 验收清单

- [ ] 子应用独立运行不报错（isQiankunEnv 守卫）
- [ ] 主应用 Navbar/目标 UI 不刷新即更新
- [ ] localStorage userInfo 与 Pinia 一致
- [ ] message 已写入 references 注册表
- [ ] handler 有 JSDoc

## 失败分支

| 现象 | 处理 |
|---|---|
| message 与已有 handler 冲突 | Human Loop：复用 handler 或换新 message 名 |
| patchStore 但 Navbar 仍不变 | dispatch [[映射-跨应用字段对齐]]，查 payload 是否为 `{ username }` |
| tab 高亮无效 | 确认 consumerPattern=customEvent，查事件名 `qiankun-child-switch-station` |
| 循环依赖 | sideEffect 改 lazy `import("@/store")` |
| timestamp 重复不触发 | 确保 notify 封装每次 `Date.now()` |

## 样本索引

| 场景 | few-shot | 人类模板 |
|---|---|---|
| 用户信息 | `assets/few-shot-example/子应用通知主应用-用户信息同步` | `template/用户信息同步/` |
| 电站切换 | `assets/few-shot-example/子应用通知主应用-电站切换` | `template/电站切换/` |

## 使用示例

```text
参考 nebula 加 profile_username_updated：
CHECKPOINT → 子→主 / patchStore / payload { username }
→ apex profile notifyMainApp
→ microfb handleProfileUsernameUpdated + push sideEffects
→ 改用户名后右上角即时更新，localStorage 一致
```

## 边界

- 不修改 getUserInfo 语义、不依赖跨 tab Storage 事件
- 一次编排只新增 **一条** message；多条需多轮编排
