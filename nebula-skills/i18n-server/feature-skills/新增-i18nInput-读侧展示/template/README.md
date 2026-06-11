# 模板说明

## 结构

- `template/mvp`：resolve 工具 + gateway 映射
- `template/snapshot`：壳层 wrapper + 菜单管理页读侧

## 文件清单

### mvp

| 路径 | 说明 |
|------|------|
| `src/utils/i18n.ts` | `resolveI18nJsonText`、`resolveI18nText` |
| `src/gateway/system/menu/menu.gateway.ts` | `name` / `menuName` 双字段 |

### snapshot

| 路径 | 说明 |
|------|------|
| `src/components/Breadcrumb/index.vue` | 面包屑 resolve + locale 依赖 |
| `src/layouts/components/Menu/components/MenuItemContent.vue` | 侧栏标题 resolve |
| `src/views/system/menu/index.vue` | Tab/表格读侧 |
| `src/views/system/menu/composables/menu-page-tree-helpers.ts` | 搜索读 wire |
