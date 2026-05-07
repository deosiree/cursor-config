# Mermaid图语法修复

本 skill 采用“本地中文模式” frontmatter，用于图表质检和稳定修复。

本节点按“新增型 skill”维护，真实模板位于 `template/mvp/` 与 `template/snapshot/`，内容直接拆自父级 `template/microfb/` 中的真实图块。

- 上游：图类型判定、文档内容生成
- 下游：README索引维护或最终交付
- 必须回退人工澄清：修复会改变图意时

```text
请只修语法和渲染稳定性，不要把图意改掉。
```
