---
name: microfb-doc-structure-planner
description: 按“主题 x 模块”规划多文件文档结构并定义最小产物矩阵。Use when 文档体系较大，需要拆分为可维护、可索引的多文件结构。
---

# microfb-doc-structure-planner

## When to Use

- 用户要求按模块拆文档而非单文件汇总。
- 需要确保每个模块文档集合完整。

## Template Anchors（相对引用）

执行前必须先读取以下相对路径：

- `../../template/microfb/README.md`
- `../../template/microfb/状态链路/`
- `../../template/microfb/说明文档/`

约束：

- 文件矩阵命名需与模板风格一致，禁止临时创造未约定目录层级。

## Instructions

1. 规划维度固定为：
   - 主题：架构拓扑 / 状态链路 / 说明文档 / 使用手册
   - 模块：认证、菜单、路由、子应用、会话、配置（可扩展）
2. 对每个模块输出最小集合：
   - 架构拓扑
   - 运行时拓扑
   - 状态驱动说明
   - 单一状态链路
   - 说明文档
   - 使用手册
3. 若模块缺素材，标记为“待补证据”，禁止静默跳过。
4. 产出目录清单与文件命名规范，交给写作子 skill 消费。

## Output Contract

- 输出 `docPlan`：
  - `topics[]`
  - `modules[]`
  - `fileMatrix[]`
  - `missingEvidence[]`

