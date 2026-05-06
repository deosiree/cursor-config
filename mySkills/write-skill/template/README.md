# template 目录说明

`template/` 是给人类看的示例层，不是给 agent 的执行素材层。

## 适合放什么
- 新建型 skill 的完整新增示例
- 更新型 skill 的修改前后对照
- `before/after`
- `mvp/snapshot`
- 输入/输出示例
- 迁移清单、编排表、任务模板

## 不适合放什么
- frontmatter 通用占位
- 只给 agent 用的精简提示
- 长篇方法论说明

这些内容分别应放到：
- `[[../assets/frontmatter-template.yaml]]`
- `[[../assets/few-shot-example]]`
- `[[../references/writing-skills-core.md]]`
