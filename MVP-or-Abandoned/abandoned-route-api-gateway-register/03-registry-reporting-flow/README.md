# 03-registry-reporting-flow

## 真相源与来源映射
| 节点 | 来源文件 | 来源变量/函数 | 关键属性 | 下游 |
|---|---|---|---|---|
| 子应用快照构建 | `apex_dev/src/permissions/registry-route-action/binding-registry-snapshot.ts` | `buildBindingRegistrySnapshot` | `appName,appScope,routeRoot,routes,actions,functions` | `registerBindingRegistry` |
| 子应用上送 | `apex_dev/src/plugins/qiankun/lifecycle.ts` | `reportBindingRegistryToHost` | `registerBindingRegistry(snapshot)` | 基座 store |
| 子应用拉取聚合态 | 同上 | `syncBindingRegistryFromHost` | `getBindingRegistryState()` | 本地 binding store |
| 基座聚合写入 | `microfb/src/store/modules/micro-app-binding-registry.store.ts` | `upsertSnapshot` | `apps[appName].snapshot,status` | 基座菜单绑定 |
| 基座对外透传 | 同上 | `getPublicState` | `apps[]` | qiankun props |
| 基座 props 注入 | `microfb/src/plugins/qiankun/apps.ts` | `registerBindingRegistry/getBindingRegistryState` | snapshot public state | 子应用 |

## 单写点
1. 子应用 snapshot 结构定义：`binding-registry-snapshot.ts`
2. 基座 snapshot 聚合策略：`micro-app-binding-registry.store.ts`

禁止：
- 在多个文件散落定义 snapshot 字段语义
- 在业务组件直接改写 host registry 结构

## 前端/后端持久化边界
1. 前端：
   - snapshot 与 host registry 是前端运行时聚合态
   - 菜单缓存 `menu-repo` 是前端持久化缓存
2. 后端：
   - 菜单树 `perm/apis` 与功能绑定以后端持久化为准
   - 前端 snapshot 不替代后端事实

## 兼容策略（当前）
1. 基座优先消费 `functions[].apis[]`
2. 若无 `functions`，回退使用 `actions`
