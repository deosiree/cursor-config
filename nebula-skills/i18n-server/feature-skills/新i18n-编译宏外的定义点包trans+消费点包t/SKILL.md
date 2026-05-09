---
name: 新i18n-编译宏外的定义点包trans+消费点包t
description: 当仓库命中“定义点不是模板内联文本，而是字段配置、规则中心等编译宏外结构，需要抽取脚本识别 key。”这一类问题时使用。
---

# 新i18n-编译宏外的定义点包trans+消费点包t

## 前置阅读

- `docs/前端国际化方案说明.md`

## RED

- 先确认当前问题是否真的属于“新i18n-编译宏外的定义点包trans+消费点包t”而不是邻近节点
- 先看主模板对应的真实提交，再看 few-shot 变体
- 如果现有仓库状态与来源提交差异很大，优先抽共性能力，不要机械套文件

## GREEN

- 功能目标：在编译宏外把定义点改成 trans 标记，再让消费点继续包 t。
- 主模板来源：`microfb` `462a31dbe13af101443bac1869b021803af6e945`
- 模板类型：更新型，优先对照 `template/before`，再落 `template/after`。
- few-shot：
- `microfb-462a31d`：仓库 `microfb`，提交 `462a31dbe13af101443bac1869b021803af6e945`，侧重点：formRules 与校验器消费点

- `microfb-c05f40d`：仓库 `microfb`，提交 `c05f40d07ec4f4092305df331bc94277ef2272da`，侧重点：组件字段定义点使用 trans

## REFACTOR

- 对照 `assets/few-shot-example/` 比较不同仓库、不同模块里的同类实现
- 提炼共性能力，不把单仓库细节误当成唯一解法
- 若当前仓库只命中本技能的一部分动作，只抽最小必要改动，不顺手跨到下一个节点
