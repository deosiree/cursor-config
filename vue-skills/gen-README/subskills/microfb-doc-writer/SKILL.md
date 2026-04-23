---
name: microfb-doc-writer
description: 根据规划结果批量生成中文文档，并插入符号定位与图决策结果。Use when 已完成拓扑、定位、结构规划，需要落地实际文档文件。
---

# microfb-doc-writer

## When to Use

- 结构规划与证据抽取已完成。
- 需要批量生成“主题 x 模块”的文档文件。

## Template Anchors（相对引用）

执行前必须先读取以下相对路径：

- `../../template/microfb/README.md`
- `../../template/microfb/状态链路/`
- `../../template/microfb/说明文档/`

约束：

- 文档体例、章节顺序、命名风格优先继承锚点模板；禁止自由改体例。

## Instructions

1. 严格消费上游输入：
   - `docPlan`
   - `evidenceBundle`
   - `symbolMapping`
   - `diagramDecisions`
2. 每个文件都必须包含：
   - 本模块目标
   - 图（由 `diagramDecisions` 指定类型）
   - 符号定位小节
   - 验收要点
3. 写作语言要求：
   - 全中文，术语可英文
   - 说明书体例（步骤化、可执行）
4. 禁止行为：
   - 跳过“符号定位”
   - 未判图类型直接出图
   - 写入无证据的功能承诺

## Output Contract

- 输出 `writtenFiles[]`：
  - `path`
  - `topic`
  - `module`
  - `diagramType`
  - `symbolSectionIncluded` (true/false)

