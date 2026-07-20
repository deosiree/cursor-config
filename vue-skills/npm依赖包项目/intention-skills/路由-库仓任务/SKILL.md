---
name: 路由-库仓任务
description: npm依赖包项目任务路由器，Single Dispatch 到分析基线或编排落地。Use when nebula-ui 任务分流、组件库不确定先读还是先改。
---

# 路由-库仓任务

## 何时使用

- 用户提 nebula-ui / `@nebula/ui` 工程类需求，未指定入口
- 需要在 intention 中选 **唯一** 一个

## 何时不要使用

- 跨仓抽取编排 → 转 `封装npm依赖包` 的 [[路由-封装任务]]
- 已在分析或编排执行中 → 勿重复路由

## Single Dispatch

| 用户意图 | dispatch |
|---|---|
| 还不了解库结构 / 导出 | [[分析-库结构基线]] |
| 新组件落地或改 examples/build/接入/发布 | [[编排-新组件落地]] |
| 「从 apex 抽组件到库」 | STOP：改走 `封装npm依赖包` |

## 输入

| 字段 | 说明 |
|---|---|
| `libRepo` | 库路径 |
| `taskKind` | newComponent / buildPeer / examples / consume / publish |

## 决策树

```
提及业务仓抽取/替换本地组件？
  ├─ 是 → Human Loop：转封装npm依赖包
  └─ 否 → 已知 exports 与目录？
        ├─ 否 → 分析-库结构基线
        └─ 是 → 编排-新组件落地
```

## 输出

- `dispatchedIntention`
- `routingReason`
- `missingFacts[]`

## 失败即 Human Loop

| 条件 | 动作 |
|---|---|
| 缺 libRepo 且工作区无 nebula-ui | 询问路径 |
| taskKind 与「抽取」混谈 | 拆成两个请求，分 skill |

## 使用示例

```text
nebula-ui 里加一个新输入组件，还不太熟目录。使用 $路由-库仓任务。
```
