# 新i18n-纯ts中用i18n.global.t

本 skill 采用 `写skill` 要求的本地中文模式。

## 使用前提

- 先阅读 `docs/前端国际化方案说明.md`
- 再根据当前仓库问题判断是否命中本节点

## 功能

把纯 TS / util / request / helper 等非组件逻辑文件中的文案消费统一收口到 `i18n.global.t(...)`，必要时在文件内建立局部 `t` 包装函数。

## 何时使用

- 纯 TS 文件、`request.ts`、`util.ts`、`helper.ts` 等无 `setup()` 上下文的地方，需要直接 `import i18n` 并消费翻译文案。

## 边界

- 命中本节点：
  - 纯 TS 文件
  - 无 `setup()` 上下文
  - 直接依赖全局 i18n 实例
- 不命中本节点：
  - Vue 模板 `$t()`
  - 组件内 `useI18n().t`
  - `trans()` 定义点
  - 动态拼接函数通过业务层回调 `t`

## 来源版本

- 主模板来源：`opsdeck` `453b4aa790aef84c915ae2b5ec4535b4f842254f`，侧重点：`request.ts` 等纯 TS 文件中的全局 i18n 消费
- Few-shot 来源与主模板一致。

## 模板与 few-shot

- 更新型 skill，主模板使用 `template/before` 与 `template/after`。
- `template/before/`：来自主来源提交的 `commit^` 旧状态。
- `template/after/`：来自主来源提交的 `commit` 新状态。
- `assets/few-shot-example/`：保存每个成功历史版本的独立 few-shot，供人类和 agent 举一反三。

## 完成态

- 能按真实历史版本还原“纯 TS 中直接使用全局 i18n 实例”的成功实现
- 能区分本节点与组件侧 `t()` 消费节点
- 不再依赖伪造的 before/after 内容

## 使用示例

```text
当前要改 request.ts 和 util.ts 里的错误提示，它们没有 setup 上下文，所以要直接 import i18n 并走 i18n.global.t。
```

```text
这一步只处理纯 TS 文件的全局 i18n 消费，不处理 Vue 模板、script setup、trans 或动态拼接。
```
