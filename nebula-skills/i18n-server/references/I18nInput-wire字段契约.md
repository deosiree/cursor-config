# I18nInput wire 字段契约

表单字段与读侧展示共用。实施前阅读 `docs/前端国际化方案说明.md`。

## I18nInput vs `$t()`

| 类型 | 存储 | 编辑 | 解析函数 |
|------|------|------|----------|
| 用户可编辑入库字段 | JSON wire 或后端 JSON 对象 | I18nInput 弹窗 | `resolveI18nJsonText` / `resolveI18nTextAtLocale` |
| 静态 UI 词条 | vue-i18n locale JSON | 代码里 `$t()` / `trans()` | `$t()` / `resolveI18nText`（含 key 查找） |

## wire 格式

- **存库/API**：`{"zh-CN":"用户管理","en-US":"User Admin"}`（`zh-CN` 连字符）
- **I18nInput 内存**：`{ zh_CN: "...", en_US: "..." }`（下划线）
- 转换：`toInputLocaleKey` / `toWireLocaleKey`

## 双字段模型（读侧 / 缓存）

| 字段 | 含义 | 写入 | 读取 |
|------|------|------|------|
| `name` | wire 原文 | API、表单提交 | 编辑回填、重名校验 |
| `menuName` | 当前 locale 展示快照 | `writeMenuCache` / `projectMenuTreeForCache` | 侧栏、面包屑、表格 Tab |

## 函数选用

| 场景 | 函数 | 说明 |
|------|------|------|
| 表单校验、读 wire 字段 | `resolveI18nJsonText(value, locale, fallback)` | 不做 vue-i18n key 查找 |
| 壳层 meta.title（可能为 key） | `resolveI18nText(title)` | JSON + key + 原样 |
| 缓存投影、指定 locale | `resolveI18nTextAtLocale(title, locale)` | 投影 menuName 用 |

## skill 路由

1. 表单未接 wire → `新增-i18nInput-表单字段`
2. 读侧乱码、V1 resolve → `新增-i18nInput-读侧展示`
3. 切换语言缓存不更新 → `更新-i18nInput-缓存投影`
