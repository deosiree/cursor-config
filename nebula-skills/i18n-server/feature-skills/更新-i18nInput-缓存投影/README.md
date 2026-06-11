# 更新-i18nInput-缓存投影

本 skill 采用 update-skill 模型：`template/before` + `template/after`。

## 功能

全局菜单（或同类树）缓存写入时投影展示字段；语言切换重投影并刷新动态路由 meta；读侧直接消费 `menuName`。

## 何时使用

- V1 分散 resolve 导致切换语言不更新或维护成本高
- 需要 `name` wire + `menuName` 展示双字段
- 导航缓存、侧栏、面包屑、角色菜单树等共享读展示字段

## 场景与文件清单

| 场景 | 层 | 关键文件 |
|------|-----|----------|
| 微服务菜单缓存投影 | before/after | `menu-repo.ts`、`lang.store.ts`、`permission.store.ts`、`i18n.ts`、`menu/index.vue`、壳层组件 |
| 基座菜单缓存投影 | few-shot before/after | `menu-repo.ts`、`lang.ts`、`permission.store.ts` |

## 完成态

- 写缓存带投影；setLang 刷新；壳层无 wrapper
- 表单 wire 未改动
- 管理页 wire/展示分流清晰
