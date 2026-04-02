---
name: registry-reporting-flow
description: Use when documenting or implementing binding-registry snapshot reporting from subapps to host and host-to-subapp state distribution in nebula qiankun architecture.
---

# registry-reporting-flow

## 目标
沉淀“子应用上送 -> 基座聚合 -> 子应用回填”的注册中心链路，并明确前后端持久化边界。

## 必查节点
1. 子应用 snapshot 构建
2. 子应用上送/拉取 qiankun props
3. 基座 store 聚合与 public state
4. 回退兼容（functions/actions）

## 强制输出
1. 上送字段表（routes/actions/functions）
2. 下发字段表（apps[].snapshot）
3. 前端缓存与后端持久化边界说明
