# 迁移i18n-微服务-qiankun

本 skill 采用 `写skill` 要求的本地中文模式。

## 使用前提

- 先阅读 `docs/前端国际化方案说明.md`
- 再根据当前仓库问题判断是否命中本节点

## 功能

把微服务场景下的 qiankun 语言同步桥接到新方案。

## 何时使用

- 主子应用语言状态尚未同步，或子应用还缺少 qiankun 侧的新 i18n 接缝。

## 来源版本

- 主模板来源：`apex_dev` `8679ae56fc5490b27a61c7e9760a202f12b4f91b`，侧重点：qiankun 语言桥接
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
