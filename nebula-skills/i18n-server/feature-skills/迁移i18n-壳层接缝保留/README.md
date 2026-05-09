# 迁移i18n-壳层接缝保留

本 skill 采用 `写skill` 要求的本地中文模式。

## 使用前提

- 先阅读 `docs/前端国际化方案说明.md`
- 再根据当前仓库问题判断是否命中本节点

## 功能

在结构树开始迁向新 i18n 位置但样板尚未替换完成时，保留迁移期壳层接缝。

## 何时使用

- 目录和入口已开始切到新树，但内部仍暂放旧方案，需要一个可继续推进的迁移中间态。

## 来源版本

- 主模板来源：`apex_dev` `a612cb04d2d1a3273eb454601d51a7e7b6107968`，侧重点：结构树迁移，壳层接缝保留
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
