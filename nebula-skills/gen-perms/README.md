# gen-perms

通用权限梳理与补齐文档生成 skill，可用于任意仓库，不依赖 `apex_dev` 固定目录结构。

## 适用场景

- 需要生成“路由-组件-权限点-API”源码梳理文档。
- 需要基于“未命中权限指令的路由/页面”输出权限点补齐设计文档。
- 需要统一权限点命名风格、API 三列表口径与层级键结构。

## 输入参数（建议）

- `projectRoot`: 项目根目录。
- `routeEntryFiles`: 路由入口文件数组（支持多个候选）。
- `viewRoots`: 页面目录数组。
- `permissionDirectiveKeywords`: 权限指令关键字数组（如 `v-hasPerm`、`hasPermission`）。
- `swaggerFiles`: swagger/openapi 文件数组（可空）。
- `outputDocs`:
  - `routePermApiDoc`
  - `unhitRoutePermDesignDoc`
- `scope`: 可选路由/模块范围。

## 输出产物

1. 路由权限 API 梳理文档（按权限点列 API 三列表）。
2. 未命中权限指令路由的权限补齐设计文档（路由-权限点-API 层级）。

## 固定口径

- API 表头固定：`apiMethod | apiUrl | description`。
- `apiUrl` 统一业务路径，不带 `/direct`、`/forward`、`{direct|forward}` 前缀。
- `description` 优先取接口 `description`，缺失回退 `summary`，仍缺失写“swagger 未提供接口描述”。
- 分层结构固定：
  - `## [路由]`
  - `### [权限点]`

## 目录说明

- `SKILL.md`: 主执行规范。
- `docs/`: 规则说明、计划样例与结构化规范（含 `spec.yaml`）。
- `template/`: 文档模板与模板索引（含 `template-index.yaml`）。

## 最小调用示例

```text
使用 gen-perms：
projectRoot=<your-repo>
routeEntryFiles=[...]
viewRoots=[...]
permissionDirectiveKeywords=["v-hasPerm"]
swaggerFiles=[...]
outputDocs={
  routePermApiDoc: ".../docs/route-perm-api.md",
  unhitRoutePermDesignDoc: ".../docs/unhit-route-perm-design.md"
}
```
