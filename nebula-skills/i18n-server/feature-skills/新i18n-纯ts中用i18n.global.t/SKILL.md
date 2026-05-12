---
name: 新i18n-纯ts中用i18n.global.t
description: 当仓库命中“纯 TS / util / request / helper 等非组件逻辑文件中，需要直接 import i18n 并通过 i18n.global.t(...) 消费文案。”这一类问题时使用。
---

# 新i18n-纯ts中用i18n.global.t

## 前置阅读

- `docs/前端国际化方案说明.md`

## RED

- 先确认当前问题是否真的属于“纯 TS 文件直接依赖全局 i18n 实例”，而不是组件内 `useI18n().t` 或模板 `$t()`
- 先确认组件侧是否只是普通运行时文案；只有当组件 `computed` 依赖纯 TS i18n 工厂产物时，才命中本节点的联动变体
- 先看主模板对应的真实提交，再看 few-shot 变体
- 如果当前仓库只有少量组件内运行时文案，不要误进本节点

## GREEN

- 功能目标：在纯 TS / util / request / helper / formRules 等非组件文件中，显式 `import i18n`，并通过 `i18n.global.t(...)` 或局部 `t` 包装消费翻译文案；若组件侧消费的是这类工厂提前求值后的结果，则在 `computed` 中显式订阅 `i18n.global.locale.value`，让语言切换时重新生成产物。
- 主模板来源：`opsdeck` `453b4aa790aef84c915ae2b5ec4535b4f842254f`
- 模板类型：更新型，优先对照 `template/before`，再落 `template/after`。
- few-shot：
- `opsdeck-453b4aa`：仓库 `opsdeck`，提交 `453b4aa790aef84c915ae2b5ec4535b4f842254f`，侧重点：`request.ts` 等纯 TS 文件直接使用 `i18n.global.t`
- `microfb-8890d7c`：仓库 `microfb`，提交 `8890d7c5f551004a05801ce4f628480ee4b2635a`，侧重点：`formRules.ts` 先通过 `i18n.global.t` 生成校验文案，组件侧 `computed rules` 再显式订阅 `locale`

## 边界

- 命中本节点：
  - 纯 TS 文件、无 `setup()` 上下文、直接依赖全局 i18n 实例
  - `formRules` / `helper` / `util` 等纯 TS 工厂里先把 message 翻译成字符串
  - 组件 `computed` 明确依赖这类纯 TS 工厂产物，并需要通过读取 `i18n.global.locale.value` 在切语言后重建结果
- 不命中本节点：
  - Vue 模板 `$t()`
  - 组件内 `useI18n().t` 的普通静态文案或通知文案
  - `trans()` 定义点
  - 需要业务层回调 `t` 的动态拼接
- 若旧 helper 只承载旧 i18n 入口且已经失去迁移价值，可以在本节点内删除该 helper。

## 共性动作

- 新增 `import i18n from "@/i18n"`
- 在文件内建立局部 `const t = (key: string) => i18n.global.t(key)`
- 将原硬编码文案改为 `t("中文原文")`
- 若纯 TS 工厂已经提前把文案翻译为字符串，组件侧 `computed` 需要显式读取 `i18n.global.locale.value`
- 仅为建立依赖但不消费值时，优先使用 `void i18n.global.locale.value`，表达“读取依赖但丢弃结果”
- 同步补齐 `zh_CN.json` 与 `en_US.json`

## REFACTOR

- 对照 `assets/few-shot-example/` 比较不同仓库、不同模块里的同类实现
- 提炼“纯 TS 全局实例消费 + 组件侧 locale 订阅重建”的共性，不把某个仓库的路径布局误当成唯一解
- 若当前仓库实际发生在组件上下文，应回退到 `新i18n-ts或script setup中使用t(),可以包变量`

## 使用示例

```text
request.ts、util.ts、helper.ts 里需要直接 import i18n，再用 i18n.global.t 处理错误提示和通知文案。
```

```text
这次不是 Vue 模板和 script setup，而是纯 TS 文件要显式接入全局 i18n 实例。
```

```text
formRules.ts 里已经用 i18n.global.t 把校验 message 提前算成字符串了，所以组件的 computed rules 里要显式读取 void i18n.global.locale.value，确保切语言后规则文案会重建。
```
