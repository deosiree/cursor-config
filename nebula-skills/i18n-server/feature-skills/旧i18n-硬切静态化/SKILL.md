---
name: 旧i18n-硬切静态化
description: 当仓库命中“仍依赖旧 src/lang runtime、语言切换入口或 route title 翻译，并且必须先获得可运行的静态中文中间态。”这一类问题时使用。
---

# 旧i18n-硬切静态化

## 前置阅读

- `docs/前端国际化方案说明.md`

## RED

- 先确认当前问题是否真的属于“旧i18n-硬切静态化”而不是邻近节点
- 先看主模板对应的真实提交，再看 few-shot 变体
- 如果现有仓库状态与来源提交差异很大，优先抽共性能力，不要机械套文件

## GREEN

- 功能目标：将旧 i18n 运行时硬切到静态中文中间态，为后续新方案接入清场。
- 主模板来源：`microfb` `ac05eebfbe5f2d35125cec76ba84a545d35d1067`
- 模板类型：更新型，优先对照 `template/before`，再落 `template/after`。
- few-shot：
- `microfb-ac05eeb`：仓库 `microfb`，提交 `ac05eebfbe5f2d35125cec76ba84a545d35d1067`，侧重点：旧方案全部硬切静态化

## REFACTOR

- 对照 `assets/few-shot-example/` 比较不同仓库、不同模块里的同类实现
- 提炼共性能力，不把单仓库细节误当成唯一解法
- 若当前仓库只命中本技能的一部分动作，只抽最小必要改动，不顺手跨到下一个节点
