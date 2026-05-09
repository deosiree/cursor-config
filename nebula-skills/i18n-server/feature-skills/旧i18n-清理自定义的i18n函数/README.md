# 旧i18n-清理自定义的i18n函数

本 skill 采用 `写skill` 要求的本地中文模式。

## 使用前提

- 先阅读 `docs/前端国际化方案说明.md`
- 再根据当前仓库问题判断是否命中本节点

## 功能

清理组件内部自定义 i18n 函数或本地 translations 映射，回到统一 runtime。

## 何时使用

- 组件已经接入新方案，但仍保留自定义 t 包装、本地 translations 或旧 key 组织方式。

## 来源版本

- 主模板来源：`apex_dev` `a9f0eac95e915c63154792af710d144f1aee3d45`，侧重点：Transfer 穿梭框清理自定义 i18n
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
