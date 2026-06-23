---
name: 映射-跨应用字段对齐
description: 对齐主子应用 userInfo 的 username 字段与持久化链路。Use when 字段不一致、Navbar 不更新、Storage 写了 Pinia 没变。
---

# 映射-跨应用字段对齐

## 何时使用

- notify 已发出、handler 已执行，但 Navbar 仍显示旧值
- 排查「Storage 写了主应用不变」

## 何时不要使用

- handler 未注册或 message 不匹配 → 先 [[实现-主应用sideEffect]]
- 电站/tab 场景无 userInfo 字段 → 本 skill 不适用

## 输入契约

| 字段 | 说明 |
|---|---|
| `childStoreShape` | 子应用 userInfo 字段 |
| `hostStoreShape` | 主应用 userInfo 字段 |
| `hostUiBinding` | Navbar 模板绑定的字段路径 |

## 核心任务

确认 apex / microfb stable 层均使用 **`username`**，notify payload 与 sideEffect patch 一致。

## nebula 用户名字段（已统一）

| 层 | 字段 | 说明 |
|---|---|---|
| apex stable | `username` | store / profile / Navbar |
| microfb Navbar | `username` | `userInfo?.username` |
| notify payload | `username` | 单字段，无 `userName` |
| sideEffect patch | `username`, `displayName` | 触发 deep watch 落盘 |

## 排查命令

```bash
rg "userInfo\??\.username" --glob "**/Navbar*"
rg "setUserInfo|userInfo\.value" --glob "**/user*.ts"
rg "getAppProps" --glob "**/qiankun/**"
```

## 排查「Storage 写了 Navbar 不变」

1. 同 tab localStorage **不会**触发主应用 Pinia 更新
2. 主应用 Navbar 绑 Pinia，不是 Storage
3. 解决：子→主 `notifyMainApp` + sideEffect patch store

## 输出

```text
stableField: username
notifyPayload: { username }
patchFields: [username, displayName]
persistenceChain: watch(userInfo) → Auth.setUserInfo
```

## 失败分支

| 现象 | 原因 | 修复 |
|---|---|---|
| localStorage 有值 Navbar 旧 | 未 patch Pinia | 补 sideEffect |
| 刷新后正确、同页不对 | 缺运行时 notify | 补 notifyMainApp |
| payload 用了 userName | 废弃键 | 改 username |

## 使用示例

```text
apex setUserInfo 后 microfb Navbar 不更新。
确认 notify payload 为 { username }；sideEffect patch username 与 displayName。
```
