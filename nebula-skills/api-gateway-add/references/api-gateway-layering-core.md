# API 分层接入规范

新增 swagger 接口前，先走 `[[contract-read-checklist.md]]`。

## 分层职责
- `src/api/**`
  - 只放原始接口与原始类型
  - 名称与契约定义保持一致
- `src/types/**`
  - 只放稳定类型
- `src/gateway/**`
  - 负责映射、聚合、编排、校验
- 业务层
  - 只消费稳定类型与 gateway 方法

## gateway 方法链路
标准链路：

`stableReq -> wireReq -> api -> wireRes -> stableRes`

## gateway 允许做什么
- 按业务语义包装同一个 API 的多个入口
- 串行调用多个 API
- 并行查询多个 API
- 对参数和返回做归一化

编排类需求（多 API 组合、删除前解绑等）的细则见 `[[gateway-orchestration.md]]` 与 `[[../feature-skills]]`。

## 常量放置规则
- 跨 gateway/业务层复用：放 `src/enums/**`
- 单页面内部使用：留在业务层本地
