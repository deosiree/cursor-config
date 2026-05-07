---
name: readme-index-maintainer
description: 维护文档目录索引与主题导航，保证多文件产物可发现、可追踪。Use when 批量生成文档后需要自动更新 README 与主题索引。
---

# readme-index-maintainer

## When to Use

- 新增或重构了多个文档文件。
- 需要确保“主题 x 模块”产物可从 README 快速找到。

## Template Anchors（相对引用）

执行前必须先读取以下相对路径：

- `../../README.md`
- `../../template/microfb/README.md`

约束：

- 索引分组与命名需参考锚点样式，禁止重排为非模板风格结构。

## Instructions

1. 读取并更新顶层索引（本目录 `README.md`）。
2. 若按主题拆目录，补充主题级索引段落：
   - 主题名
   - 模块列表
   - 文件路径列表
3. 索引更新规则：
   - 不删除已有有效条目
   - 新条目按主题分组
   - 路径使用相对路径，命名与实际文件一致
4. 记录“新增/变更/失效”条目清单。

## Output Contract

- 输出 `indexUpdateReport`：
  - `updatedReadmes[]`
  - `addedEntries[]`
  - `removedEntries[]`
  - `warnings[]`

