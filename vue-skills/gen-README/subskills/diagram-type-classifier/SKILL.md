---
name: diagram-type-classifier
description: 对每个文档场景判定应使用 flowchart TD 还是 sequenceDiagram。Use when 文档需要出图且存在“结构图/时序图”选择分歧。
---

# diagram-type-classifier

## When to Use

- 文档需要插入工程图，但尚未确定图类型。
- 同一主题下既有结构关系也有交互时序。

## Template Anchors（相对引用）

执行前必须先读取以下相对路径：

- `../../docs/Mermaid.md`
- `../../docs/sequenceDiagram.md`
- `../../template/microfb/状态链路/`

约束：

- 未加载锚点规范前，禁止输出图类型决策。

## Decision Rules

1. 选择 `flowchart TD` 的场景：
   - 简单结构关系
   - 单一链路
   - 分支较少且不强调参与者交互顺序
2. 选择 `sequenceDiagram` 的场景：
   - 并行或互斥分支较多
   - 需要明确参与者之间消息方向与时序
   - 评审重点是“谁先调用谁、返回在哪一步”

## Instructions

1. 先读取：
   - `docs/Mermaid.md`
   - `docs/sequenceDiagram.md`
2. 对每个图需求输出：
   - `recommendedType`
   - `reason`
   - `fallbackType`
   - `lintChecklistSource`
3. 禁止在未判定时直接生成图。

## Output Contract

- 输出 `diagramDecisions[]`，每项结构：
  - `docFile`
  - `diagramPurpose`
  - `recommendedType` (`flowchart TD` | `sequenceDiagram`)
  - `reason`
  - `fallbackType`

