# 新i18n-基座-语言选择器

本 skill 采用 `写skill` 要求的本地中文模式。

## 使用前提

- 先阅读 `docs/前端国际化方案说明.md`
- 再根据当前仓库问题判断是否命中本节点

## 功能

把基座语言选择器切到新方案的语言状态与常量组织方式。

## 何时使用

- 基座的语言入口还停留在旧实现，或新方案的语言常量和入口交互尚未接通。

## 来源版本

- 主模板来源：`microfb` `06624c8d0c22a0b3094b94ad861b188eb307ac80`，侧重点：基座语言选择器
- Few-shot 来源与主模板一致。

## 模板与 few-shot

- 更新型 skill，主模板使用 `template/before` 与 `template/after`。
- `template/before/`：来自主来源提交的 `commit^` 旧状态。
- `template/after/`：来自主来源提交的 `commit` 新状态。
- `assets/few-shot-example/`：保存每个成功历史版本的独立 few-shot，供人类和 agent 举一反三。

## 完成态

- 能按真实历史版本还原本功能的成功实现
- 能区分主模板与其他 few-shot 变体
- 不再依赖伪造的 before/after 内容
