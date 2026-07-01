---
name: 新i18n-补充翻译json
description: 当仓库命中“locale JSON 缺 key、value 错误或组织粒度不适合统一消费。”这一类问题时使用。
---

# 新i18n-补充翻译json

## 前置阅读

- `docs/前端国际化方案说明.md`

## RED

- 先确认当前问题是否真的属于“新i18n-补充翻译json”而不是邻近节点
- 若 `extract:i18n` 新增 0 但 UI 仍缺翻译，**先**检查是否应回退到 `新i18n-编译宏外的定义点包trans+消费点包t`（定义点未包 trans 字面量），而非强行手填 JSON。见 `errors/side-effect-t-scan-伪extract.md`
- 先看主模板对应的真实提交，再看 few-shot 变体
- 如果现有仓库状态与来源提交差异很大，优先抽共性能力，不要机械套文件

## GREEN

- 功能目标：补齐或修正 locale JSON，使统一 runtime 有正确的词条来源。
- 主模板来源：`microfb` `198a60a2215c68d0aafef7bb0110d01b497cf803`
- 模板类型：更新型，优先对照 `template/before`，再落 `template/after`。
- few-shot：
- `microfb-198a60a`：仓库 `microfb`，提交 `198a60a2215c68d0aafef7bb0110d01b497cf803`，侧重点：补充翻译 json

## REFACTOR

- 对照 `assets/few-shot-example/` 比较不同仓库、不同模块里的同类实现
- 提炼共性能力，不把单仓库细节误当成唯一解法
- 若当前仓库只命中本技能的一部分动作，只抽最小必要改动，不顺手跨到下一个节点
