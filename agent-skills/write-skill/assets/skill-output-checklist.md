# skill 输出检查清单

## 基础结构

- [ ] 存在 `README.md`
- [ ] 存在 `SKILL.md`
- [ ] 存在 `template/`
- [ ] 存在 `assets/`
- [ ] 存在 `references/`
- [ ] 存在 `evals/`

## 资源分层

- [ ] `template/` 只放给人类评审和仿写的示例
- [ ] `assets/` 只放给 agent 按需读取的素材
- [ ] `references/` 只放长说明与背景解释
- [ ] 主 `SKILL.md` 没有堆放大段示例正文

## 任务类型匹配

- [ ] 新建型任务提供了完整新增示例
- [ ] 更新型任务提供了 `before/after` 或 `mvp/snapshot`

## frontmatter 模式

- [ ] 已声明本次采用“本地中文模式”或“对外兼容模式”
- [ ] 若是本地中文模式，`name` 与 `description` 为中文
- [ ] 若是对外兼容模式，`name` 为英文 slug，`description` 符合规范兼容口径

## 引用与可读性

- [ ] 对内部支持文件的引用优先使用双链
- [ ] few-shot、模板说明、验收项中都能看到双链示例
- [ ] 没有把 `assets/` 误写成官方唯一强制目录

## Markdown 结构自检

- [ ] 标题上下有空行
- [ ] frontmatter 结束后，正文首个标题前有空行
- [ ] 每个 Markdown 文件只有单一 H1 或无 H1
- [ ] 带 frontmatter 且属性已承载标题的文档，不再重复写正文总 H1
- [ ] `README.md` 与 `SKILL.md` 的标题层级一致，模板与样本遵守同一标题策略
- [ ] 代码块、表格、列表与相邻标题之间有空行

详细规则见 `[[../references/markdown-format-rules.md]]`。
