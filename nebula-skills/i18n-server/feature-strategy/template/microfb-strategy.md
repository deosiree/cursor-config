# microfb Strategy

## Current Chain Summary

- runtime 入口在 `microfb/src/lang/index.ts`，通过 `createI18n` 聚合 `zh-cn.ts` 和 `en.ts`
- 语言状态存于 `microfb/src/store/modules/app.store.ts` 的 `language`
- 组件层通过 `useI18n()` 直接消费
- 非组件层通过 `microfb/src/utils/i18n.ts` 里的 `i18n.global.t` / `i18n.global.te` 直接消费
- 语言切换组件 `microfb/src/components/LangSelect/index.vue` 同时写 runtime 和 store，属于双写链路

## Target Chain Summary

- runtime 入口迁移到 `src/i18n/index.ts`
- 语言包迁移到 `src/i18n/locales/*.json`
- 语言状态由独立 `src/stores/lang.ts` 管理
- 组件层继续使用 `t/$t`
- 非组件层不再直接翻译，而是使用 `trans()` 标记，最终在组件渲染时翻译
- 词条抽取通过 `i18n-extract.config.ts` 驱动

## Overlap Matrix

| 维度 | 当前链路 | 新链路 | 是否重叠 | 说明 |
| --- | --- | --- | --- | --- |
| 应用初始化 | 有 i18n runtime 注册 | 有 i18n runtime 注册 | 是 | 入口职责类似，但实现不同 |
| 语言状态持久化 | `app.store.ts` + localStorage | `stores/lang.ts` + localStorage | 是 | 状态职责可复用思路，但实现要重写 |
| 组件层消费 | `useI18n()` | `t/$t` | 是 | 组件使用习惯接近 |
| 非组件层消费 | `i18n.global.t` | `trans()` | 否 | 当前是直接翻译，新方案是先标记后翻译 |
| 语言包资产 | TS 嵌套对象 | JSON 词条表 | 部分 | 资产可迁移，格式不可直接复用 |
| 语言码 | `zh-cn` / `en` | `zh-CN` / `en-US` | 否 | 运行时编码不兼容 |

## Conflict Matrix

| 维度 | 当前链路问题 | 新链路要求 | 冲突级别 | 迁移影响 |
| --- | --- | --- | --- | --- |
| runtime | 旧 `src/lang/index.ts` 直接工作中 | 需要 `src/i18n/index.ts` | 高 | 不能长期并存 |
| store | `appStore.language` 与 runtime 双写 | 独立 lang store，职责单一 | 高 | 需要去耦 |
| helper | `utils/i18n.ts` 直接 `i18n.global.t` | 非组件层使用 `trans()` | 高 | 需要先脱钩或一次性重写 |
| locale assets | TS 嵌套词典 | JSON 可抽取词条 | 中 | 需要格式转换 |
| 组件层 | 直接 `useI18n()` | 仍可 `t/$t` | 低 | 消费方式相近 |

## Recommendation

- Recommendation: `deprecate-then-migrate`
- Mode: `deprecate-then-migrate`

## Why

1. `microfb` 的非组件层直接依赖旧 runtime，尤其是 `utils/i18n.ts`，这不是只换目录能解决的问题。
2. 语言状态存在双写链路：`useI18n().locale.value` 和 `appStore.language` 同时更新，先退化可以把状态职责收拢。
3. 语言包虽然可复用，但格式和语言码都不兼容，新旧 runtime 直接叠加会让中间态更脆。
4. 组件层消费方式虽然相近，但 helper、store、语言包格式这三块冲突都偏高，所以一步到位并不便宜。

## Suggested Execution Order

1. `feature-analysis`
2. `feature-strategy`
3. `feature-deprecation`
4. 验证当前分支在“无旧 runtime 依赖”的中间态可正常运行
5. 提交一次代码
6. `feature-migration`

## When Direct Migration Could Be Better

如果某个前端仓库满足以下条件，可以考虑一步到位：

- 非组件层几乎没有 `i18n.global.t` 或全局 helper 依赖
- store 不持有翻译结果，也没有 runtime 双写
- 语言包已经接近 JSON 词条表结构
- 语言码与新方案几乎一致
- 组件层是主要改造面，helper 和 runtime 改动很轻

`microfb` 当前不满足这些条件，所以不建议一步到位。
