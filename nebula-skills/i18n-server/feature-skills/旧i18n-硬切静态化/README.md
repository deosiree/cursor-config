# 旧i18n-硬切静态化

本 skill 采用 `写skill` 要求的本地中文模式。

## 使用前提

- 先阅读 `docs/前端国际化方案说明.md`
- 再根据当前仓库问题判断是否命中本节点

## 功能

将旧 i18n 运行时硬切到静态中文中间态，为后续新方案接入清场。

## 何时使用

- 仍依赖旧 src/lang runtime、语言切换入口或 route title 翻译，并且必须先获得可运行的静态中文中间态。

## 来源版本

- 主模板来源：`microfb` `ac05eebfbe5f2d35125cec76ba84a545d35d1067`，侧重点：旧方案全部硬切静态化
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
