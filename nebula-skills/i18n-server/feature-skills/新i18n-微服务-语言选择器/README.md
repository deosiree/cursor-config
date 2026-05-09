# 新i18n-微服务-语言选择器

本 skill 采用 `写skill` 要求的本地中文模式。

## 使用前提

- 先阅读 `docs/前端国际化方案说明.md`
- 再根据当前仓库问题判断是否命中本节点

## 功能

把微服务全局组件中的语言选择、布局大小、主题切换等入口切到新方案消费边界。

## 何时使用

- 微服务侧语言选择器与相关全局入口已接新 runtime，但仍需统一到新消费方式。

## 来源版本

- 主模板来源：`apex_dev` `7eaed495706a459042b7c075636d81e185fbb60a`，侧重点：Apex 全局入口组件迁移
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
