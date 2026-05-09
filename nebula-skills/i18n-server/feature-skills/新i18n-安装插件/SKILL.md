---
name: 新i18n-安装插件
description: 当仓库命中“仓库尚未具备新 i18n 插件和依赖，或依赖版本需要向统一方案对齐。”这一类问题时使用。
---

# 新i18n-安装插件

## 前置阅读

- `docs/前端国际化方案说明.md`

## RED

- 先确认当前问题是否真的属于“新i18n-安装插件”而不是邻近节点
- 先看主模板对应的真实提交，再看 few-shot 变体
- 如果现有仓库状态与来源提交差异很大，优先抽共性能力，不要机械套文件

## GREEN

- 功能目标：安装并对齐 vue-i18n、抽词等依赖，为新方案 runtime 和抽取链路打基础。
- 主模板来源：`microfb` `aca321dcfbd75c0368481c4dbd4a46d88ddbf07b`
- 模板类型：更新型，优先对照 `template/before`，再落 `template/after`。
- few-shot：
- `microfb-aca321d`：仓库 `microfb`，提交 `aca321dcfbd75c0368481c4dbd4a46d88ddbf07b`，侧重点：microfb 安装插件

- `apex_dev-ec8710f`：仓库 `apex_dev`，提交 `ec8710f166b3ebf08bf14e93181266c9edbee27a`，侧重点：Apex 安装插件

## REFACTOR

- 对照 `assets/few-shot-example/` 比较不同仓库、不同模块里的同类实现
- 提炼共性能力，不把单仓库细节误当成唯一解法
- 若当前仓库只命中本技能的一部分动作，只抽最小必要改动，不顺手跨到下一个节点

## 使用示例

```text
仓库还没具备 vue-i18n 和抽词依赖，直接进入“新i18n-安装插件”。
```
