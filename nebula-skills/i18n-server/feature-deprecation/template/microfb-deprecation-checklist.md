# microfb Deprecation Checklist

## Legacy Entry Inventory

- `src/lang/index.ts`
- `src/lang/package/zh-cn.ts`
- `src/lang/package/en.ts`
- `src/utils/i18n.ts`
- `src/store/modules/app.store.ts`
- `src/components/LangSelect/index.vue`

## Detach Consumers First

- replace non-component `i18n.global.t` dependency with direct strings or static constants
- remove route title translation helper from active runtime path
- remove store-side translated text caching or `useI18n` dependency
- allow component text to fall back to direct display strings during the deprecation phase

## Deprecation Actions

| Asset | Action | Target |
| --- | --- | --- |
| non-component stable texts | detach from old runtime first | hardcoded strings or static constants |
| store translation dependency | remove first | language state only |
| `src/lang` | rename for backup | `src/lang-legacy` |
| `src/utils/i18n.ts` | rename for backup | `src/utils/i18n-legacy.ts` |
| old locale keys like `route.dashboard` | flatten and migrate later | `src/i18n/locales/*.json` |
| language store binding | keep behavior, replace implementation later | `src/stores/lang.ts` |

## Reusable Assets

- route titles
- login texts
- navbar texts
- size and lang switch messages

## Handoff Contract

- current branch must run without old runtime-backed translation lookups in active business logic
- `feature-migration` consumes `src/lang-legacy/package/*`.
- old nested TS dictionaries are flattened into locale JSON.
- old `translateRouteTitle` behavior becomes optional `translateLegacyRouteTitle` compatibility helper only for audit or temporary mapping.
