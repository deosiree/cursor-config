---
name: 迁移i18n-微服务-qiankun few-shot 入口
description: 当需要在主模板之外，为 `迁移i18n-微服务-qiankun` 选择更贴近当前仓库形态的 few-shot 时使用。
---

# 迁移i18n-微服务-qiankun few-shot 入口

## 使用方式

- 先看主模板，确认当前问题是否已经足够接近主模板。
- 如果当前仓库结构、文件位置或消费边界明显不同，再进入具体 few-shot 子目录。
- 优先选择同仓库、同模块类型、同消费边界的 few-shot。

## 选择原则

- `microfb-*`：优先用于基座、登录、route title、lang runtime 等场景。
- `apex_dev-*`：优先用于微服务、qiankun 子应用、全局组件、租户页面等场景。
- 如果多个 few-shot 都接近，先选改动范围更小、边界更清晰的那个。
