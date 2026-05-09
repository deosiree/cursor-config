---
name: 新i18n-样板代码
description: 当仓库命中“仓库已经准备迁入新方案，但还没有统一的 i18n 样板代码和接入骨架。”这一类问题时使用。
---

# 新i18n-样板代码

## 前置阅读

- `docs/前端国际化方案说明.md`

## RED

- 先确认当前问题是否真的属于“新i18n-样板代码”而不是邻近节点
- 先看主模板对应的真实提交，再看 few-shot 变体
- 如果现有仓库状态与来源提交差异很大，优先抽共性能力，不要机械套文件

## GREEN

- 功能目标：建立新 i18n 样板代码和最小接入骨架，让仓库拥有统一的 runtime 入口与基础目录结构。
- 主模板来源：`microfb` `4d51b5b1f7bcfdda603fe2d9870425a418a3e0f8`
- 模板类型：新增型，优先看 `template/mvp`，再看 `template/snapshot`。
- few-shot：
- `microfb-4d51b5b`：仓库 `microfb`，提交 `4d51b5b1f7bcfdda603fe2d9870425a418a3e0f8`，侧重点：microfb 新样板代码

- `apex_dev-390662a`：仓库 `apex_dev`，提交 `390662ac443ca838b519eca3adb0d40f2da2478a`，侧重点：Apex 样板代码与 opsdeck 对齐

## REFACTOR

- 对照 `assets/few-shot-example/` 比较不同仓库、不同模块里的同类实现
- 提炼共性能力，不把单仓库细节误当成唯一解法
- 若当前仓库只命中本技能的一部分动作，只抽最小必要改动，不顺手跨到下一个节点

## 使用示例

```text
仓库已经准备迁入新方案，但还没有统一的 i18n 样板代码和接入骨架。
```
