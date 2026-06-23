---
name: 路由-主子通信任务
description: qiankun 主子通信任务路由器，Single Dispatch 到唯一 intention。Use when 主子应用同步、globalState 不更新、notifyMainApp 排查、Navbar 不同步。
---

# 路由-主子通信任务

## 何时使用

- 用户描述主子应用 UI 不同步，但未明确该分析还是直接改
- 需要从多个 intention 中选 **唯一** 一个入口

## 何时不要使用

- 已在 [[编排-扩展notification]] 或 [[分析-通信基线]] 执行中 → 不要重复路由
- 请求与 qiankun/globalState 无关（CSS、axios）

## Single Dispatch 规则

**一次只 dispatch 一个 intention，禁止自动链式多 dispatch。**

| 用户意图 | dispatch | 输出 |
|---|---|---|
| 先看项目有没有前人实现 | [[分析-通信基线]] | existingMessages + gap |
| 加一条新的子→主同步 | [[编排-扩展notification]] | 5 步 GREEN |
| 排查「改了 Storage 主应用不更新」 | [[分析-通信基线]] | fieldMappingGap |
| 主应用登录后子应用拿不到 userInfo | [[分析-通信基线]] | 主→子 props 路径 |
| message 名已给且要照 nebula 实现 | [[编排-扩展notification]] | 跳过冗余分析 |

## 输入契约

| 字段 | 说明 |
|---|---|
| `targetRepo` | 主/子应用仓库路径 |
| `communicationDirection` | 子→主 \| 主→子（可选） |
| `messageName` | 已知时可填，如 `profile_username_updated` |
| `syncTarget` | Navbar / tab / 列表 |

## 路由决策树

```
symptom 含 Navbar/用户名/个人中心？
  ├─ 是 → 倾向 子→主 + patchStore → 分析 或 编排
  └─ 否 → symptom 含 tab/电站/切换？
        ├─ 是 → 倾向 customEvent → 分析 或 编排
        └─ 否 → symptom 仅 mount/登录后不对？
              ├─ 是 → 分析（主→子 props）
              └─ 否 → 分析-通信基线（默认）
```

## 输出

- `dispatchedIntention`：唯一 intention 名
- `routingReason`：一句话理由
- `missingFacts[]`：若缺 targetRepo 则 Human Loop

## 失败即 Human Loop

| 条件 | 动作 |
|---|---|
| 无法定位协议 | 问：主/子应用 repo 路径？ |
| message 冲突 | 问：复用已有 handler 还是新 message？ |
| 子→主 vs 主→子 不明 | 问：是运行时操作还是仅 mount 时不对？ |

## 使用示例

```text
microfb 壳内 apex 个人中心改了用户名，右上角还是旧名。
$路由-主子通信任务
→ routingReason: 子→主 + Storage 不足以同页联动
→ dispatchedIntention: 编排-扩展notification
（若不确定是否已有 handler，先 dispatch 分析-通信基线）
```
