---
name: gen-perms
description: Use when needing repository-agnostic permission mapping docs from routes, components, permission directives, and API evidence, including gap-design docs for routes not covered by permission directives.
---

# gen-perms

## Overview

在任意仓库中生成两类权限文档：

1. 路由-组件-权限点-API 源码梳理文档。
2. 未命中权限指令路由的权限点补齐设计文档。

本 skill 仅约束方法与输出结构，不绑定具体仓库路径。

## Required Inputs

- `projectRoot`
- `routeEntryFiles`
- `viewRoots`
- `permissionDirectiveKeywords`
- `swaggerFiles`（可空）
- `outputDocs.routePermApiDoc`
- `outputDocs.unhitRoutePermDesignDoc`

若输入不完整，先向用户补充最少参数再执行。

## Workflow

### Phase A: 生成“路由-组件-权限点-API”梳理文档

1. 解析路由入口，建立路由到页面组件映射。
2. 扫描 `permissionDirectiveKeywords` 命中位置，提取权限点。
3. 回溯页面真实 API 调用链（组件 -> gateway/api -> url/method）。
4. 生成权限点下 API 三列表。

### Phase B: 生成“未命中权限指令路由补齐设计”文档

1. 识别未命中权限指令的路由。
2. 为每条路由提取可控操作点（按钮/行操作/提交动作）。
3. 设计权限点命名（遵循仓库现有风格）。
4. 按“路由 -> 权限点 -> API”分层输出三张关联表。

## Output Contract

### Doc A（梳理文档）约束

- 权限点下必须有 API 表：`| apiMethod | apiUrl | description |`
- 保留“非权限控制但真实调用 API”的补充区。

### Doc B（补齐设计文档）约束

- 每条路由使用 `## [路由]`。
- 路由节内至少包含：
  - 表1 `| 路由 | 对应组件 | 组件路径 |`
  - 表2 `| 权限点(按现有风格设计) | 对应哪一行(源码行号+业务行) | 对应什么代码中 |`
- 每个权限点使用 `### [权限点]`，并有表3：
  - `| apiMethod | apiUrl | description |`

## Normalization Rules

- `apiUrl`：去掉 `/direct`、`/forward`、`{direct|forward}` 前缀，落业务路径。
- `description`：`description` > `summary` > `swagger 未提供接口描述`。
- swagger 缺失时：允许回退源码注释/函数语义，并显式标注“待补充”。

## Compatibility Strategy

- 若无 `v-hasPerm`，使用 `permissionDirectiveKeywords` 指定的关键字。
- 若无集中式路由入口，按 `routeEntryFiles` 候选集扫描。
- 若无 swagger，仍输出结构化表格，不中断文档生成。

## Execution Checklist

- 执行前：
  - 输入参数齐全且可解析。
  - 输出目标路径可写。
- 执行中：
  - 路由、权限点、API 三层关系可追溯。
  - 行号与业务行说明齐全。
- 交付前：
  - Markdown 结构完整、标题层级稳定。
  - 无重复权限点标题冲突（同一路由内唯一）。

## References

- `docs/spec.yaml`
- `docs/README.md`
- `template/template-index.yaml`
- `template/README.md`
