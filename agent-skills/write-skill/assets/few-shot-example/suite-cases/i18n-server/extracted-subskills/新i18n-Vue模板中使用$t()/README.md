# 新i18n-Vue模板中使用$t()

本 skill 采用 `写skill` 要求的本地中文模式。

## 使用前提

- 先阅读 `docs/前端国际化方案说明.md`
- 再根据当前仓库问题判断是否命中本节点

## 功能

把 Vue 模板层的静态文案和旧消费方式收口到 $t()。

## 何时使用

- 模板层仍存在硬编码中文、本地 translations 或旧消费样板。

## 来源版本

- 主模板来源：`microfb` `1763c88e24581ea46c71d9119f114299cd376fb7`，侧重点：Vue 模板中使用 $t()
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

## 使用示例

```text
模板层还有硬编码中文和本地 translations，当前这一步先进入“新i18n-Vue模板中使用$t()”。
```

```text
我只想收口 Vue 模板层，不处理 TS 运行时和动态规则函数。
```
