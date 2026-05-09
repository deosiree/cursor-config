---
name: 迁移i18n-微服务-qiankun
description: 当仓库命中“主子应用语言状态尚未同步，或子应用还缺少 qiankun 侧的新 i18n 接缝。”这一类问题时使用。
---

# 迁移i18n-微服务-qiankun

## 前置阅读

- `docs/前端国际化方案说明.md`

## RED

- 先确认当前问题是否真的属于“迁移i18n-微服务-qiankun”而不是邻近节点
- 先看主模板对应的真实提交，再看 few-shot 变体
- 如果现有仓库状态与来源提交差异很大，优先抽共性能力，不要机械套文件

## GREEN

- 功能目标：把微服务场景下的 qiankun 语言同步桥接到新方案。
- 主模板来源：`apex_dev` `8679ae56fc5490b27a61c7e9760a202f12b4f91b`
- 模板类型：更新型，优先对照 `template/before`，再落 `template/after`。
- few-shot：
- `apex_dev-8679ae5`：仓库 `apex_dev`，提交 `8679ae56fc5490b27a61c7e9760a202f12b4f91b`，侧重点：qiankun 语言桥接

## REFACTOR

- 对照 `assets/few-shot-example/` 比较不同仓库、不同模块里的同类实现
- 提炼共性能力，不把单仓库细节误当成唯一解法
- 若当前仓库只命中本技能的一部分动作，只抽最小必要改动，不顺手跨到下一个节点
