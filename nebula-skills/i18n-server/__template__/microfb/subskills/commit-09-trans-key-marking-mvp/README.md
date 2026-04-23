# commit-09-trans-key-marking-mvp

## 来源提交

- 提交哈希：`c05f40d07ec4f4092305df331bc94277ef2272da`
- 短哈希：`c05f40d`
- 主题：MVP：trans 让抽取脚本识别这是一条国际化 key，不翻译；引用处再调用 t()

## 背景

建立 `trans()` 只负责标记 key、消费点再 `t()` 的 MVP 约束。

## 触发条件

- 项目已引入 `vue-i18n-kit-sy/runtime`
- 某些默认值需要被抽词工具识别
- 调用点仍能再套一层 `t()` 或 `$t()`

## 改动范围

- 默认 props 或配置项使用 `trans()` 标记 key
- 组件渲染时改为 `$t(buttonText)` 这类二次消费
- 明确 `trans()` 不等于最终展示翻译

## 核心文件

- `src/components/auth/field/CodeField.vue`

## 完成后的中间态

提取器可以识别默认值里的国际化 key，但真实展示仍由调用点负责。

## 推荐迁移步骤

1. 先确认当前仓库是否满足本提交的输入前置。
2. 参考 `template/mvp/` 只落本提交的最小必要改动。
3. 如需对照阶段完成态，再看 `template/snapshot/`。
4. 完成本提交后，进入 `commit-10-dynamic-function-text-callback`。

## 常见误用

- 把本提交和下一提交的职责混在同一轮里一起改。
- 只看模板快照，不理解为什么要建立这个中间态。
- 忽略本提交中的边界约束，导致后续步骤继续返工。
