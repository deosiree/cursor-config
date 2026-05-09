# 新i18n-补充翻译json

本 skill 采用 `写skill` 要求的本地中文模式。

## 使用前提

- 先阅读 `docs/前端国际化方案说明.md`
- 再根据当前仓库问题判断是否命中本节点

## 功能

补齐或修正 locale JSON，使统一 runtime 有正确的词条来源。

## 何时使用

- locale JSON 缺 key、value 错误或组织粒度不适合统一消费。

## 来源版本

- 主模板来源：`microfb` `198a60a2215c68d0aafef7bb0110d01b497cf803`，侧重点：补充翻译 json
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
