# 路由路径：语法校验 vs 项目内唯一性

菜单表单 blur 时会**串行**触发两层校验（见 `MenuFormDialog.vue` + `createRoutePathRules`）：

```
blur routePath
  → createRoutePathRules（同步语法）
  → ensureRoutePathUnique(projectId)（异步 API）
```

## 分层

| 层级 | 触发 | 典型文案 | 测判重时 |
|------|------|----------|----------|
| 语法 | `createRoutePathRules` | 「段首不要为数字」「路径不可为空」 | 会**挡住**唯一性校验 |
| 项目内唯一 | `ensureRoutePathUnique` | 「当前项目下的路由路径已存在」 | 目标断言 |

## 表格里已有的路径为何不能拿来测判重

test0415 中大量历史路径如 `/0522`、`/1234` 在 blur 时会先报语法错误，**到不了** `ensureRoutePathUnique`。

## 推荐测试路径格式

- 合法且可读：`/opencli/dup0415`、`/opencli/crossproj`
- 在 `config.menuData.duplicateRoutePath` 配置，并确保该路径在 `projectDuplicateIn` 项目中**已存在**

## 演示脚本

```bash
bash menu-syntax-before-dup-demo.sh --profile local-subapp
# 期望：/0522 → 语法错误，不出现「当前项目下的路由路径已存在」
```

## 源码

- 语法：[`formRules.ts`](../../../../apex_dev/src/utils/formRules.ts) — `createRoutePathRules`
- 判重：[`MenuFormDialog.vue`](../../../../apex_dev/src/views/system/menu/components/MenuFormDialog.vue)
