# extract-shell

本 skill 用于指导在 Vue 项目中将“页面内联编排结构”抽离成可复用壳组件，降低重复实现与样式漂移风险。

## 目录结构

- `SKILL.md`：主说明（触发条件、步骤、约束、验收）。
- `template/implementation-checklist.md`：抽壳执行清单模板。

## 快速使用

1. 先确认页面是否存在重复壳层：工具栏、Tab、内容滚动、高度测算。
2. 按 `SKILL.md` 的 MVP 步骤抽离 `PageTabShell`。
3. 使用模板清单核对：功能回归、滚动边界、按钮可达性、linter。

## 适配说明

- 面向 `Vue3 + Element Plus` 场景。
- 强调“壳层能力下沉、业务逻辑上浮”的边界设计。
