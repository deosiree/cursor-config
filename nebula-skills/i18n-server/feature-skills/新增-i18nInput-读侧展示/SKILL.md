---
name: 新增-i18nInput-读侧展示
description: 当 wire 字段已入库，但列表/树/侧栏/面包屑显示 JSON 乱码或需在消费点 resolveI18nJsonText/resolveI18nText 展示（V1）时使用。触发词：resolveI18nJsonText、侧栏乱码、面包屑 JSON、读侧展示、void locale。
---

# 新增-i18nInput-读侧展示

## 前置阅读

- `docs/前端国际化方案说明.md`
- `references/I18nInput-wire字段契约.md`

## TL;DR

wire 已在 API/表单 → 在读侧用 `resolveI18nJsonText`（表格/wire）或 `resolveI18nText`（壳层 meta）+ `void locale.value` 触发重算。

## RED

- 确认 wire 已存在；表单未接 → 先 `新增-i18nInput-表单字段`
- 若要消除 wrapper、做缓存投影 → `更新-i18nInput-缓存投影`
- 先看 `template/mvp`（utils + gateway），再看 `template/snapshot`（壳层 + 列表）
- **table 列头 / 行操作静态词条 i18n 不在本 skill 范围**；正例见 `新i18n-编译宏外的定义点包trans+消费点包t` 的 `apex_dev-menu-row-actions` few-shot

## 🔴 CHECKPOINT · 路由门禁

改代码前**必须**确认：

- 用户问题是「展示乱码/读侧 resolve」，不是「首次接 I18nInput 表单」
- 若 prompt 含「切换语言后导航仍不更新」「writeMenuCache 投影」→ **停止**，路由缓存投影 skill

## GREEN

**功能目标**：读侧按当前 locale 展示人类可读文案（V1 中间态）。

| 模板层 | 内容 |
|--------|------|
| mvp | `utils/i18n.ts`、`menu.gateway.ts` |
| snapshot | Breadcrumb、MenuItemContent、`menu/index.vue`、搜索 helper |
| few-shot | `菜单树-读侧V1`、`基座-菜单壳层V1` |

## 执行清单（按序）

1. **utils**：`resolveI18nJsonText(value, locale, fallback)` — 仅 wire，不查 vue-i18n key
2. **utils**：`resolveI18nText(title)` — JSON + key + 原样（壳层 meta.title）
3. **gateway**：稳定模型 `name`（wire）+ `menuName`（展示初值）
4. **壳层 V1**：`void locale.value` + `resolveI18nText(title)` 包一层 computed
5. **列表/Tab**：`resolveI18nJsonText(row.name, locale, row.menuName)`
6. **搜索**：`resolveI18nJsonText(item.name, locale, item.menuName).toLowerCase()`

## 失败模式与兜底

| 触发条件 | 一线修复 | 仍失败兜底 |
|----------|----------|------------|
| 仍显示原始 JSON 字符串 | 确认消费点调用了 resolve，非直接 `{{ row.name }}` | 对照 snapshot 壳层/表格列 |
| 切换语言不刷新 | V1 必须有 `void locale.value` 依赖 | 若导航缓存仍 stale → 升级 `更新-i18nInput-缓存投影` |
| 表格对了、侧栏不对 | 分别检查 MenuItemContent 与 Breadcrumb | 基座路径用 `基座-菜单壳层V1` few-shot |
| gateway 只有 menuName 无 name | 补 `name` wire 字段保留 | 对照 mvp `menu.gateway.ts` |
| 误用 `resolveI18nText` 读表单 wire 校验 | 表单校验改 `resolveI18nJsonText` | 路由表单 skill |

## 不要做什么（黑名单）

- 不要接 I18nInput 表单或改 submit payload（属表单 skill）
- 不要改 `writeMenuCache` / `projectMenuTreeForCache`（属缓存 skill）
- 不要在 V1 阶段声称「已彻底解决切换语言」——导航缓存需 V2
- 不要对静态 `$t()` 文案套 resolveI18nJsonText

## 边界路由

| 症状 | 路由 |
|------|------|
| 表单未接 wire | `新增-i18nInput-表单字段` |
| 切换语言导航缓存不更新 | `更新-i18nInput-缓存投影` |

## 输出契约

- `resolveSites[]`（改了哪些读侧：壳层/表格/搜索）
- `v1WrappersAdded`（是否保留 void locale wrapper）
- `upgradeToCacheProjection`（yes/no + 理由）

## REFACTOR

V1 wrapper 是可接受中间态；收口交给缓存投影 skill，不在此 skill 删 wrapper 又写 menu-repo。

## 使用示例

```text
侧栏、面包屑显示 {"zh-CN":"用户管理"} 乱码，要在读侧 resolve。
```

```text
菜单管理表格和 Tab 要按当前语言显示 menuName。
```
