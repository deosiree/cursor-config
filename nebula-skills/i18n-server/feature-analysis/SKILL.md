---
name: feature-analysis
description: Use when a repository already has an i18n implementation and you must reconstruct its actual runtime chain with sequence diagrams and source-code anchors before deprecating or migrating it
---

# Feature Analysis

## Overview

这个 skill 用来先理解旧 i18n 链路，再允许退化或迁移。输出必须能回答三个问题：

1. 当前语言值从哪里来。
2. 当前翻译运行时如何被消费。
3. 哪些变量、函数、文件在这条链路里承担关键角色。

## When to Use

- 仓库已有 i18n，但没有成文链路说明。
- 你打算退化旧方案或迁移到新方案。
- 你需要先确认 store、runtime、组件、路由 helper 之间的真实依赖关系。

## Required Outputs

1. 入口清单
2. 核心场景划分
3. `sequenceDiagram`
4. 参与者定义表
5. 变量/函数/文件落点表
6. 风险与前置约束

## Workflow

1. 盘点入口
   - 查找 `createI18n`、`setupI18n`、`useI18n`、`i18n.global.t`、语言切换 store、语言包目录。
   - 查找路由标题 helper、通知 helper、常量/枚举中的翻译入口。

2. 划分场景
   - 至少识别以下场景：
   - 应用初始化
   - 语言切换
   - 组件渲染取词
   - 非组件 helper 取词
   - store 与 runtime 的耦合

3. 画时序图
   - 使用 `sequenceDiagram`，不是 `flowchart`。
   - 开启 `autonumber`。
   - 至少保留一条主成功路径和必要互斥分支。
   - 用 `Note` 说明条件，不额外膨胀链路。

4. 标注源码落点
   - 为图中每个参与者标明：
   - 浏览器语义
   - 文件路径
   - 变量/函数名
   - 关键输入输出

5. 输出结论
   - 哪些地方是退化的切入口。
   - 哪些地方必须先脱钩。
   - 哪些旧资产值得保留。
   - 哪些行为是迁移时必须保持不变的。

## Guardrails

- 不允许在未画出时序图前直接定义退化方案。
- 不允许只写“目录结构”，不写运行链路。
- 不允许只有文件列表，没有变量/函数落点。
- 图中参与者命名必须稳定，图例与文档口径一致。

## Deliverables

- `README.md`
- `SKILL.md`
- 通用模板
- `microfb` 示例分析文档

## MVP Template

优先阅读：

- `template/sequence-diagram-template.md`
- `template/source-anchor-template.md`
- `template/microfb-i18n-chain.md`
