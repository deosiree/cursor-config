# 扫描源码权限点与API — few-shot 示例

> 来自 gen-perms-apis 样本试跑 `template/sample-run/apex_dev-route-component-perm-api.md`

## 触发

```text
使用 $扫描源码权限点与API 扫描 apex_dev，
api契约为 seccenter.swagger.json，输出到 docs/plans/
```

## 预期执行序列

1. 读取 `src/router/index.ts` → 建立静态路由表
2. 对每个路由页面，递归扫描 `src/views/` 下的业务子孙组件
3. 扫描所有 `v-hasPerm` 指令，过滤注释命中
4. 对每个已命中 perm，沿三类链路反查 API：
   - `业务层 → gateway → api → 契约`
   - `业务层 → api → 契约`
   - `子组件 emit → 父 → gateway/api → 契约`
5. 对未挂 `v-hasPerm` 但真实调用 API 的操作，归入"未命中权限控制的组件/权限点"
6. 对契约未命中的接口，标记"待人工确认"

## 输出结构（片段）

```markdown
# /Apex/dashboard

## 组件

| 路由 | 对应组件路径 |
| --- | --- |
| /Apex/dashboard | src/views/dashboard/index.vue |

### src/views/dashboard/index.vue

- `v-hasPerm="'sys:dashboard:view'"`：页面入口守卫

## 权限点

| 权限名称 | 权限标识 |
| --- | --- |
| 查看首页 | sys:dashboard:view |

### sys:dashboard:view

| apiMethod | apiUrl | description |
| --- | --- | --- |
| POST | /seccenter/v2/dashboard/query | 查询首页数据 |
```
