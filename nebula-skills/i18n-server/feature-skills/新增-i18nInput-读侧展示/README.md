# 新增-i18nInput-读侧展示

本 skill 采用 add-skill 模型：`template/mvp` + `template/snapshot`。

## 功能

wire 字段在读侧（列表、树、侧栏、面包屑）按 locale 解析展示；V1 在消费点 resolve + locale 依赖。

## 何时使用

- API 已返回 JSON wire，UI 显示原文或乱码
- 需要在 gateway/壳层/列表补 resolve
- 尚未做 menu-repo 缓存投影

## 场景与文件清单

| 场景 | 模板层 | 关键文件 |
|------|--------|----------|
| utils + gateway | mvp | `src/utils/i18n.ts`、`src/gateway/system/menu/menu.gateway.ts` |
| 微服务壳层+列表 | snapshot | `Breadcrumb`、`MenuItemContent`、`menu/index.vue`、`menu-page-tree-helpers.ts` |
| 基座壳层 | few-shot | `Breadcrumb`、`MenuItemContent`、`utils/i18n.ts`（microfb 路径） |

## 完成态

- 读侧展示当前语言文案
- 表单 wire 接入不在本 skill 范围
- 未做缓存双字段投影（属下一 skill）
