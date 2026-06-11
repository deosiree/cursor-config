# 模板说明

## 结构

- `template/before`：读侧 V1（分散 resolve、writeMenuCache 直写、watch locale refilter）
- `template/after`：缓存双字段投影（projectMenuTreeForCache、refreshMenuCacheProjection、读侧直出 menuName）

## 对比文件清单

| 路径 | before 特征 | after 特征 |
|------|-------------|------------|
| `src/services/menu/menu-repo.ts` | 直写缓存 | `projectMenuTreeForCache` + `refreshMenuCacheProjection` |
| `src/store/modules/lang.store.ts` | setLang 无菜单副作用 | `refreshMenuCacheProjection` |
| `src/store/modules/permission.store.ts` | 无 reloadRoutesFromCache | 补齐 reloadRoutesFromCache |
| `src/utils/i18n.ts` | resolveI18nText 单体 | `resolveI18nTextAtLocale` + 薄封装 |
| `src/views/system/menu/index.vue` | watch locale refilter | displayMenuPageSource computed |
| `src/components/Breadcrumb/index.vue` | resolve wrapper | 直接 `meta.title` |
| `src/layouts/.../MenuItemContent.vue` | displayTitle computed resolve | 直接 `title` |

目录内均为源码文件，不含 patch。
