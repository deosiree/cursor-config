# microfb-8890d7c

## 来源

- 标识：`microfb-8890d7c`
- 仓库：`microfb`
- 提交：`8890d7c5f551004a05801ce4f628480ee4b2635a`
- 适用变体：`新i18n-纯ts中用i18n.global.t` 在登录表单规则场景中的联动变体。

## 模板类型

- `before/after`

## 与主模板的关系

- 主模板覆盖的是 `request.ts` 一类纯 TS 文件直接消费 `i18n.global.t(...)`。
- 当前 few-shot 补的是另一种常见边界：`formRules.ts` 这类纯 TS 工厂已经把 message 提前翻译成字符串，组件 `computed` 还需要显式订阅 `i18n.global.locale.value`，才能在切语言后重建 rules。
- 如果未来改造成“业务层回调 `t` 到规则工厂”或“消费时才翻译”，则不能机械复用本 few-shot 的 `locale` 依赖写法，必须重新判断翻译时机。
