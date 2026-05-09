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

## Markdown 结构说明
模板目录中的示例需要遵守统一的 Markdown 标题策略。

- `README.md`、`SKILL.md`：默认保留单一 H1
- 带 frontmatter 且属性已承载标题的样本、边界文件：默认不写正文总 H1

具体规则见 `[[../references/markdown-format-rules.md]]`，最终收尾按 `[[../assets/skill-output-checklist.md]]` 自检。
