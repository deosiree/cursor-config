# microfb Migration Plan

## Goal

将 `microfb` 从旧 `src/lang` 方案迁移到统一的新 i18n 结构，并保留对旧词条资产的可追溯消费。

## Migration Order

1. 引入 `src/i18n` 新骨架
2. 建立 `src/stores/lang.ts`
3. 接入 Element Plus locale 映射
4. 将旧词典平铺进 `locales/*.json`
5. 将路由、常量、枚举改为 `trans()`
6. 将组件内文本改为 `t/$t`
7. 接入 `i18n-extract.config.ts`
8. 删除对旧 runtime 的直接注册

## Notes

- 用户输入类文本不走静态词条抽取。
- 旧 `route.xxx` 结构不保留为运行时格式，只作为迁移来源。
- `langSelect.message.success` 这类历史 key 可以先平铺为字符串 key，再逐步归并。
