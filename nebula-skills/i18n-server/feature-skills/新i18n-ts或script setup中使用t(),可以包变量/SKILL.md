---
name: 新i18n-ts或script setup中使用t(),可以包变量
description: 当仓库命中“组件内 script setup、computed、notification 等运行时逻辑仍有硬编码中文，或虽然接入了 i18n 但没有把变量包进 t()。”这一类问题时使用。
---

# 新i18n-ts或script setup中使用t(),可以包变量

## 前置阅读

- `docs/前端国际化方案说明.md`

## RED

- 先确认当前问题是否真的属于“新i18n-ts或script setup中使用t(),可以包变量”而不是邻近节点
- 先看主模板对应的真实提交，再看 few-shot 变体
- 如果现有仓库状态与来源提交差异很大，优先抽共性能力，不要机械套文件

## GREEN

- 功能目标：把组件内 script setup、局部 TS 运行时逻辑、computed、通知等文案统一收口到 `t()`，并允许包变量。
- 主模板来源：`microfb` `e87b6d1202c782a53dce05799af22d1760bf7b13`
- 模板类型：更新型，优先对照 `template/before`，再落 `template/after`。
- few-shot：
- `microfb-e87b6d1`：仓库 `microfb`，提交 `e87b6d1202c782a53dce05799af22d1760bf7b13`，侧重点：script setup 与 TS 运行时文案

## 边界

- 命中本节点：组件内 `useI18n().t`、script setup、computed、notification、局部 TS 运行时文本、变量插值。
- 不命中本节点：纯 TS / util / request / helper 中直接 `import i18n` 后使用 `i18n.global.t(...)`。
- 不命中本节点：Vue 模板 `$t()`、`trans()` 定义点、需要业务层回调 `t` 的动态拼接。

## REFACTOR

- 对照 `assets/few-shot-example/` 比较不同仓库、不同模块里的同类实现
- 提炼共性能力，不把单仓库细节误当成唯一解法
- 若当前仓库只命中本技能的一部分动作，只抽最小必要改动，不顺手跨到下一个节点

## 使用示例

```text
组件内 script setup、computed 或 notification 里仍有硬编码中文，或虽然接入了 i18n 但没有把变量包进 t()。
```
