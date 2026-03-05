---
name: go-trace-context-propagation
description: 当实现或审查 Go 服务调用、MQ 链路与定时任务追踪时使用，重点解决 context 误重建、trace ID 丢失、跨进程元数据未透传等问题。
---

# Go 链路追踪与 Context 透传

## 目标
保证 trace 在同步与异步边界都连续完整。

## 硬性规则
1. 所有服务边界必须传递 `context.Context`。
2. 业务流程中禁止把上游 context 替换为 `context.Background()`。
3. 需要重建 context（超时/取消）时必须复制 trace 元数据。
4. 定时任务每次执行都要创建新的 root trace。

## 实现模式
1. 统一 gRPC、MQ、HTTP 等通道的 trace 注入/提取 helper。
2. 对 Redis/Kafka/三方组件做 wrapper，补齐 trace 透传。
3. 在定时任务入口主动生成 trace ID 与 root span。
4. 在 span 中附加关键业务标签便于定位。

## 审查清单
- 下游调用是否始终使用父级 context？
- 超时处理后 trace 元数据是否仍被保留？
- MQ 生产端和消费端是否都完成 inject/extract？
- 每次定时任务是否有独立 root trace？
- 三方客户端封装是否具备 trace 感知能力？

## 反模式
- 下游调用新建空 context 导致链路断裂。
- 只打印 trace ID，不写入传输头。
- 所有定时任务复用同一个固定 trace ID。
