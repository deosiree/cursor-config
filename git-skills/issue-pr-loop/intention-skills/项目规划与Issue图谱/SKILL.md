---
name: 项目规划与Issue图谱
description: 当一个项目目标需要在当前会话澄清、调研、冻结为 goal.md，并拆成有验收标准、依赖关系和文件边界的 GitHub Issue 时使用。
---

# 项目规划与 Issue 图谱

## 核心任务

在开始实现前，把用户意图收敛为一个 Goal、一个 Issue DAG 和一组本地 Issue 计划。先让人确认范围和可观测验收，再进行 GitHub 写入。

## 何时使用

- 用户给出跨模块或多阶段项目需求，尚无可直接执行的 Issue 序列。
- 需要从现有 Issue、产品需求或代码库基线重新建立项目依赖图。
- 需要给已确认的项目补 Goal ID、验收追踪或文件所有权。

## 输入 / 前置条件

- 当前会话中的需求、示例、限制和已有决策。
- 仓库路径、现有文档惯例、目标 GitHub 仓库；缺失时先查可确认的本地上下文。
- 用户需要的输出位置；未指定时使用仓库已存在的设计文档目录，不存在则建议 `docs/development/<project>/`。
- GitHub Issue 的创建/更新授权。没有明确授权时只生成本地草稿。

影响用户行为、数据、安全、预算或最终验收的歧义必须提问。其它实现选择先查看源码和仓库规范；没有证据时标为待确认或假设，不写成事实。

## 流程

1. **建立现状**：检查仓库规则、现有需求文档、代码入口、Issue/PR 状态、验证命令和工作树改动。需求讨论和调研在当前会话进行；只有需要核实外部事实时才搜索资料。
2. **写 Goal 草稿**：按 [[../../template/mvp/goal.md]] 记录项目目标、用户场景、非目标、约束、风险、假设、待澄清项、全局验收条件和退出条件。用 `G-01` 等稳定 ID 标识验收条件。
3. **澄清并冻结**：对影响范围和验收的 `NEEDS CLARIFICATION` 提问。Goal 确认后记 `baselineVersion`、确认时间和决策者；后续任何改动都走明确的变更记录。
4. **垂直拆分 Issue**：每个 Issue 只交付一个可验证职责；写清标题、背景、范围、非目标、输入、输出、环境/前置条件、依赖、步骤、测试用例、验收条件和交付物。验收条件使用可观察结果，引用 Goal ID。
5. **建立依赖图**：按 [[../../template/mvp/issue-graph.md]] 填依赖表和 Mermaid 图。表格是事实源，图由表格生成。为每个节点给稳定本地 ID、Goal ID、`blocked_by`、建议波次、并行组、文件所有权和验证入口。
6. **检查图与并行条件**：确认节点 ID 唯一、边指向存在节点、无环、无遗漏 Goal；无依赖只代表“可评估并行”，不代表自动并行。并行还要求文件路径互斥、共享 API/数据模型已冻结、测试数据隔离；否则串行。
7. **写本地交付材料**：每个节点生成一个 `issues/<issue-id>/develop.md`，从 [[../../template/mvp/issues/issue-id/develop.md]] 复制。不要把完整实现步骤塞进 GitHub Issue；Issue 描述保持可审阅，详细计划留在本地。
8. **发布并同步**：仅在本次授权覆盖 GitHub 写入时创建/更新 Issue。保留稳定本地 ID 与 GitHub `#number` 的映射；将 `blocked_by` 写进 Issue，并在权限和运行时支持时同步 GitHub 原生依赖关系。发布后读回核对正文、链接和依赖，更新本地图谱。

## 图谱校验规则

- 每个 Issue 至少映射一个 Goal ID；每个 Goal 验收条件至少映射一个 Issue 或明确标为项目级终验。
- `blocked_by` 表示前置任务未完成时禁止开始实现；不以“相关”替代阻塞关系。
- Mermaid 图只呈现依赖表中的边。若二者不一致，依赖表优先，修复图后再交付。
- 路径冲突、共享接口未定、测试数据竞争都取消并行资格，即使图上没有依赖边。
- 本地草稿节点使用 `I-01` 等稳定 ID；发布后同时记录 GitHub issue URL 和 `#number`，不得通过标题匹配猜编号。

## 输出

- `goal.md`：已确认的目标锚点或含阻塞项的草稿。
- `issue-graph.md`：依赖事实表、Mermaid 展示、路径边界、波次和 Issue 映射。
- `issues/<issue-id>/develop.md`：逐 Issue 计划。
- 授权范围内发布时，报告实际创建/更新的 Issue URL 和依赖读回结果。
- `status`：`draft`、`awaiting_clarification`、`ready_for_issue_creation`、`ready_for_development` 或 `blocked`。

## 边界

- 不替用户决定影响需求范围、产品指标、安全范围或预算的歧义。
- 不创建 GitHub Issue，除非请求明确要求创建或更新。
- 不把 Spec Kit 的完整 `.specify` 结构作为前置条件；仅复用需求澄清、Plan、Analyze 的必要部分。
- 不将所有实现细节提前写成大计划；只为 Issue 图中可执行节点准备 `develop.md`。

## 使用示例

```text
把这个多模块需求整理成 goal.md 和 GitHub Issue 依赖图。Issue 草稿先落在本地，先检查每个 Goal ID 是否都有 Issue 和验收证据，再等我确认后发布。
```
