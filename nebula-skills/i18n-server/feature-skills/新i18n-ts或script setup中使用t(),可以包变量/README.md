# 新i18n-ts或script setup中使用t(),可以包变量

本 skill 采用 `写skill` 要求的本地中文模式。

## 使用前提

- 先阅读 `docs/前端国际化方案说明.md`
- 再根据当前仓库问题判断是否命中本节点

## 功能

把组件内 script setup、局部 TS 逻辑、computed、通知等运行时文案统一收口到 `t()`，并允许包变量。

## 何时使用

- 组件内运行时逻辑层仍有硬编码中文，或虽然接入了 i18n 但没有把变量包进 `t()`。

## 边界

- 命中本节点：
  - `script setup` 中 `const { t } = useI18n()`
  - 组件内 `computed`、`notification`、局部 TS 运行时文本
  - 变量插值或参数包裹到 `t()`
- 不命中本节点：
  - 纯 TS 文件、`util.ts`、`request.ts`、`helper.ts` 中直接 `import i18n` 并使用 `i18n.global.t(...)`
  - Vue 模板 `$t()`
  - `trans()` 定义点
  - 动态拼接函数通过业务层回调 `t`

## 来源版本

- 主模板来源：`microfb` `e87b6d1202c782a53dce05799af22d1760bf7b13`，侧重点：script setup 与 TS 运行时文案
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
模板层已经差不多了，但组件里的 script setup、computed 和通知里还有硬编码中文，先进入“新i18n-ts或script setup中使用t(),可以包变量”。
```

```text
当前只想处理组件侧 TS / script setup 运行时文案，不动模板层、locale JSON，也不处理 util/request 里的全局 i18n 消费。
```
