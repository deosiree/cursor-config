# Source Anchor Template

## Participant Anchors

| 图中变量 | 浏览器/运行时中是什么 | 源码定位 | 关键变量/函数 | 说明 |
| --- | --- | --- | --- | --- |
| `U` | 用户或浏览器动作源 | `path/to/file` | `handleClick()` | 触发入口 |
| `C` | 组件渲染层 | `path/to/component.vue` | `setup()` / template | 直接消费翻译 |
| `S` | 语言状态容器 | `path/to/store.ts` | `setLang()` / `init()` | 持久化与状态恢复 |
| `R` | i18n runtime | `path/to/i18n.ts` | `createI18n()` | 翻译执行入口 |
| `A` | 语言包 | `path/to/locale` | locale object/json | 词条来源 |

## Variable Anchors

| 字段/符号 | 运行时含义 | 源码定位 | 关键变量/函数 |
| --- | --- | --- | --- |
| `locale` | 当前语言值 | `path/to/store.ts` | `language`, `lang`, `locale.value` |
| `messages` | 语言包聚合对象 | `path/to/i18n.ts` | `messages` |
| `t()` | 翻译调用入口 | `path/to/component.vue` | `useI18n()` |
| `i18n.global.t` | 非组件翻译入口 | `path/to/utils.ts` | `translateXxx()` |
