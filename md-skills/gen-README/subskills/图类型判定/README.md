# 图类型判定

本 skill 采用“本地中文模式” frontmatter，用于在出图前先稳定判定图类型。

本节点按“新增型 skill”维护，真实模板位于 `template/mvp/` 与 `template/snapshot/`，内容直接拆自父级 `template/microfb/`。

- 上游：源码证据抽取、架构拓扑映射、文档草稿
- 下游：文档内容生成、Mermaid图语法修复
- 必须回退人工澄清：结构图与时序图都合理且无法裁决时

```text
请先判定图类型，再决定后续图表写法。
```
