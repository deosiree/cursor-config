---
name: function-api-contract-chain
description: Use when documenting or implementing nebula's function-level permission bindings from src/registry/sources/* through @/registry to runtime APIs, and you need a precise source-of-truth chain.
---

# function-api-contract-chain

## 目标
沉淀“功能项 -> registry source -> `@/registry` -> 运行时 API”链路，确保每个映射节点只有一个真相源。

## 必查节点
1. 页面动作：`src/registry/sources/*/*.actions.ts`
2. 网关动作绑定：`src/registry/sources/*/*.gateway-bindings.ts`
3. API 元数据：`src/registry/sources/*/*.api-meta.ts`
4. 模块聚合：`src/registry/sources/*/index.ts`
5. 统一入口：`src/registry/index.ts`
6. 注册中心拼装：`page-action-registry.ts`
7. 运行时解析：`runtime-permission-resolver.ts`

## 强制输出
1. 真相源表（文件+变量+属性）
2. 单写点与禁止第二写点
3. `@/registry` 统一消费说明
4. 新增模块改动清单
