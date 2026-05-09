# 迁移i18n-变量改写为中文再包t

本 skill 采用 `写skill` 要求的本地中文模式。

## 使用前提

- 先阅读 `docs/前端国际化方案说明.md`
- 再根据当前仓库问题判断是否命中本节点

## 功能

把旧变量包 key 的写法改成中文包 t，消除旧 key 组织方式对消费点的污染。

## 何时使用

- 组件已经在用 t()，但传入值仍是旧变量包或旧 key，需要改写为中文再包 t()。

## 来源版本

- 主模板来源：`apex_dev` `45e68079b569e9c8e43437dddbd8d78c2a1a4b5c`，侧重点：Transfer 变量改写为中文再包 t
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
