---
name: 旧i18n-清理自定义的i18n函数
description: 当仓库命中“组件已经接入新方案，但仍保留自定义 t 包装、本地 translations 或旧 key 组织方式。”这一类问题时使用。
---

# 旧i18n-清理自定义的i18n函数

## 前置阅读

- `docs/前端国际化方案说明.md`

## RED

- 先确认当前问题是否真的属于“旧i18n-清理自定义的i18n函数”而不是邻近节点
- 先看主模板对应的真实提交，再看 few-shot 变体
- 如果现有仓库状态与来源提交差异很大，优先抽共性能力，不要机械套文件

## GREEN

- 功能目标：清理组件内部自定义 i18n 函数或本地 translations 映射，回到统一 runtime。
- 主模板来源：`apex_dev` `a9f0eac95e915c63154792af710d144f1aee3d45`
- 模板类型：更新型，优先对照 `template/before`，再落 `template/after`。
- few-shot：
- `apex_dev-a9f0eac`：仓库 `apex_dev`，提交 `a9f0eac95e915c63154792af710d144f1aee3d45`，侧重点：Transfer 穿梭框清理自定义 i18n

## REFACTOR

- 对照 `assets/few-shot-example/` 比较不同仓库、不同模块里的同类实现
- 提炼共性能力，不把单仓库细节误当成唯一解法
- 若当前仓库只命中本技能的一部分动作，只抽最小必要改动，不顺手跨到下一个节点
