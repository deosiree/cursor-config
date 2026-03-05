---
name: go-architecture-consensus-review
description: 当审查 Go 后端架构改动是否符合团队技术共识时使用，覆盖 gRPC 客户端复用、语义化任务 ID、链路透传、错误码国际化、分布式协同与拦截器治理。
---

# Go 架构共识审查总入口

## 目标
提供统一入口，把架构审查快速路由到对应专题 skill。

## 路由矩阵
1. gRPC 客户端重复创建或连接复用不当：
 - 使用 `go-grpc-client-lifecycle`。
2. 异步任务幂等/重试去重不清晰：
 - 使用 `go-semantic-task-id`。
3. Trace 断链、context 丢失：
 - 使用 `go-trace-context-propagation`。
4. 错误码多语言映射混乱：
 - 使用 `go-error-i18n-manifest`。
5. 超卖、并发冲突、定时任务重复执行：
 - 使用 `go-distributed-lock-and-cron-singleton`。
6. 审计/鉴权/日志逻辑在 handler 重复散落：
 - 使用 `go-cross-cutting-interceptor`。

## 快速审查清单
- 是否存在每次调用都新建 gRPC client?
- 任务 ID 是否可读、可幂等去重?
- context 是否跨 RPC/MQ/定时任务完整透传?
- 错误码与文案是否解耦并支持多语言回退?
- 多实例共享写操作是否有跨节点并发保护?
- 横切逻辑是否收敛在拦截器/中间件?

## 输出模板
1. Findings:
 - 风险、影响范围、证据路径。
2. Decision:
 - 保持现状 / 重构 / 阻断发布。
3. Action:
 - 负责人、优先级、截止时间。
