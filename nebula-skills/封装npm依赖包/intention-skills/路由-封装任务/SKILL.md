---
name: 路由-封装任务
description: 封装npm依赖包任务路由器，Single Dispatch 到分析边界或编排入库发版。Use when 抽组件、入库 @nebula/ui、不确定先分析还是直接改。
---

# 路由-封装任务

## 何时使用

- 用户要封装/抽取共享组件，但未明确「先分析」还是「直接入库」
- 需要从 intention 中选 **唯一** 一个入口

## 何时不要使用

- 已在 [[分析-可抽离边界]] 或 [[编排-组件入库发版]] 执行中 → 不要重复路由
- 请求只改库仓工程、无业务源组件 → 转 `vue-skills/npm依赖包项目`

## Single Dispatch 规则

**一次只 dispatch 一个 intention，禁止自动链式多 dispatch。**

| 用户意图 | dispatch | 输出 |
|---|---|---|
| 不确定是否可抽 / 有无业务壳 | [[分析-可抽离边界]] | extractDecision |
| 边界已确认，要落地到发版 | [[编排-组件入库发版]] | 端到端清单 |
| 库内已有组件，只替换消费者 | [[编排-组件入库发版]] | 从发版/替换步骤起 |
| 「帮我看看 nebula-ui 怎么接」无抽取 | STOP：提示改用 `npm依赖包项目` | — |

## 输入契约

| 字段 | 说明 |
|---|---|
| `sourceRepo` | 业务源仓 |
| `sourceComponentPath` | 待抽路径 |
| `componentName` | 目标 Ne* 名 |
| `publishMode` | link \| artifactory（可选） |

## 路由决策树

```
有明确 sourceComponentPath？
  ├─ 否 → Human Loop 补齐
  └─ 是 → 用户已确认「可抽」或给了 API 清单？
        ├─ 否 → 分析-可抽离边界
        └─ 是 → 编排-组件入库发版
```

## 输出

- `dispatchedIntention`：唯一 intention 名
- `routingReason`：一句话
- `missingFacts[]`：缺字段则 Human Loop

## 失败即 Human Loop

| 条件 | 动作 |
|---|---|
| 缺 sourceRepo 或 sourceComponentPath | 询问，禁止猜路径写码 |
| 同时要求抽组件 + 大改登录会话模型 | STOP：会话变更需单独 ADR，不进本路由 |
| 目标组件名无 Ne 前缀且用户坚持 | 询问是否违反库约定，确认后再 dispatch |

## 使用示例

```text
使用 $路由-封装任务：要把 GuardedSecretInput 抽进 nebula-ui，
还不确定 PwdField 算不算业务壳。
```
