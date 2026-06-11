---
name: 更新-i18nInput-缓存投影
description: 当已有 I18nInput wire，但切换语言侧栏/面包屑不更新，或读侧 resolve wrapper 过于分散，需在写缓存时投影 menuName 并在 setLang 刷新时使用。触发词：projectMenuTreeForCache、refreshMenuCacheProjection、缓存投影、reloadRoutesFromCache、双字段 name menuName。
---

# 更新-i18nInput-缓存投影

## 前置阅读

- `docs/前端国际化方案说明.md`
- `references/I18nInput-wire字段契约.md`
- `references/缓存双字段投影架构.md`

## TL;DR

`name` 保留 wire → `writeMenuCache` 内 `projectMenuTreeForCache` 写 `menuName` → `setLang` 调 `refreshMenuCacheProjection` → 壳层直读 `menuName`。

## RED

- 确认 wire 与读侧 V1 已存在；表单未接 → `新增-i18nInput-表单字段`
- 对照 `template/before`（分散 resolve）与 `template/after`（投影）
- 投影内聚 **domain repo**（如 `menu-repo.ts`），不新建 `menu-display.map.ts`

## 🔴 CHECKPOINT · 路由门禁

改代码前**必须**确认：

- 问题是「切换语言展示不更新」或「要去掉分散 wrapper」，不是「第一次接 I18nInput」
- 若仅面包屑乱码、尚未做 V1 resolve → 先 `新增-i18nInput-读侧展示`

## GREEN

**功能目标**：缓存双字段 + 语言切换刷新 + 读侧收口。

| 模板 | 说明 |
|------|------|
| before | V1 分散 resolve、直写缓存 |
| after | 投影 + refresh + 直出 menuName |
| few-shot | `基座-菜单缓存投影` |

## 执行清单（按序）

1. **utils**：`resolveI18nTextAtLocale(title, locale)`；`resolveI18nText` 薄封装
2. **投影**：`projectMenuTreeForCache` — `name` 保留 wire，`menuName = resolveI18nTextAtLocale(...)`
3. **写入口**：`writeMenuCache` 写入前调用投影
4. **刷新**：`refreshMenuCacheProjection` = readCache → writeMenuCache → `reloadRoutesFromCache`（若 `routesLoaded`）
5. **语言**：`lang.store.setLang` 末尾 `void refreshMenuCacheProjection()`（**禁止**放 `i18n.ts`）
6. **读侧**：删除 Breadcrumb/MenuItemContent resolve wrapper，直出 `title` / `menuName`
7. **管理页**：`menuPageSource` wire + `displayMenuPageSource` computed；表格/Tab 读 `menuName`；表单仍读 wire
8. **microfb**：`StableMenuNode.name?` + `mapWire2StableMenuNode` 双字段
9. **单测**：wire 保留、menuName 投影、locale 切换

## 失败模式与兜底

| 触发条件 | 一线修复 | 仍失败兜底 |
|----------|----------|------------|
| 切换语言侧栏仍不变 | 检查 `setLang` 是否调 `refreshMenuCacheProjection` | 检查 `routesLoaded` 后是否 `reloadRoutesFromCache` |
| 面包屑变了、侧栏不变 | permission 路由 meta 是否重建 | 对照 after `permission.store.ts` |
| 管理页对了、导航错了 | 导航走缓存；管理页走 computed 投影，勿混用 | 对照 after `menu/index.vue` 分流 |
| 循环依赖报错 | `refreshMenuCacheProjection` 内 **动态 import** permission store | 禁止在 `i18n.ts` 引 menu-repo |
| 缓存里 menuName 仍是 JSON | `writeMenuCache` 是否调用 `projectMenuTreeForCache` | 对照 after `menu-repo.ts` |
| 编辑表单 wire 被破坏 | 停止改表单；校验仍读 `resolveI18nJsonText(item.name)` | 路由表单 skill |

## 不要做什么（黑名单）

- 不要改 FormDialog I18nInput 接线或 submit 形状
- 不要新建 `menu-display.map.ts` / `menu-locale-sync.ts`
- 不要把 `refreshMenuCacheProjection` 挂到 `i18n.ts`
- 不要在管理页用 `watch(locale)` refilter 替代 `displayMenuPageSource` computed
- 不要删掉 wire `name` 字段

## 输出契约

- `projectionWritePoint`（唯一写入口文件名）
- `langSideEffectHook`（lang.store 挂接行）
- `shellWrappersRemoved[]`
- `pageWireDisplaySplit`（管理页 wire/展示是否分流）

## REFACTOR

业务模块直接读缓存 `menuName`；搜索 helper 仍可对 display 树用 `resolveI18nJsonText(item.name, ...)`。

## 使用示例

```text
切换语言后侧栏、面包屑不更新，writeMenuCache 时要投影 menuName。
```

```text
去掉每个壳层组件的 resolveI18nText wrapper，改缓存双字段。
```
