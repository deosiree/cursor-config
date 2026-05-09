# Nebula 当前权限注册中心与前后端生效链路汇总

本文基于当前仓库代码整理 `apex_dev` 的权限声明、注册中心、菜单功能项绑定、运行时显隐与后端生效关系，目标是为后续方案演进提供一份“现状地图”，并明确哪些链路仍在使用，哪些已经处于弃用状态。

## 1. 当前主链路概览

当前真正成型的链路可以拆成 5 层：

1. 前端声明层：`permission-meta`
2. 注册中心层：`registry source`
3. 动作解析层：`page-action-registry`
4. 菜单绑定层：`binding-registry-snapshot` + 菜单管理绑定面板
5. 运行时消费层：`v-hasPerm` / `PermTabs` / `PermTabPane`

其中：

- `permission-meta` 负责声明“这个权限点是什么、属于哪个页面、对应哪些 API / gateway action / 按钮 / tab / pageAction”
- `registry source` 负责把页面、动作、网关动作、API 元数据、权限元数据接成同一个 source
- `page-action-registry` 负责把 `perm -> gatewayAction -> apis -> page route` 解析成页面可消费的动作行
- `binding-registry-snapshot` 负责把子应用前端声明上报给主应用
- 菜单管理负责把“前端声明”和“后端菜单功能节点”对齐，让菜单配置真正决定用户拥有哪些功能
- 页面组件最终只消费 `v-hasPerm` 或 `PermTabPane`

## 2. 前端声明层：permission-meta 是当前新方案的起点

### 2.1 角色模块是最完整的样板

角色模块把权限常量和元数据集中在 [role.permission-meta.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/permissions/permission-meta/role.permission-meta.ts)。

这里不仅定义了 `ROLE_PERMS.ADD / EDIT / DELETE / TAB_MENU` 等权限码，还定义了 `rolePermissionMetaMap`，每个权限点会补齐：

- `perm`
- `label`
- `route`
- `component`
- `apis`
- `gatewayActions`
- `buttons`
- `pageActions`
- `tabClicks`
- `aliases`

这意味着角色模块里的权限点不再只是一个裸字符串，而是被提升成一份可复用的前端语义元数据。

### 2.2 用户模块已经部分接入 permission-meta

用户模块也有 [user.permission-meta.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/permissions/permission-meta/user.permission-meta.ts)，但当前只覆盖：

- `sys:user:list`
- `sys:alarm:list`
- `sys:user:reset`

对应页面 [index.vue](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/user/index.vue) 里仍有大量按钮直接写原始字符串，例如：

- `sys:user:add`
- `sys:user:delete`
- `sys:user:lock`
- `sys:user:unlock`
- `sys:user:edit`

所以用户模块目前处于“视图层仍以旧写法为主，permission-meta 只覆盖部分能力”的混合态。

### 2.3 租户模块仍主要停留在旧动作声明模式

租户模块有 [tenant.actions.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/registry/sources/tenant/tenant.actions.ts)，但在 [tenant/index.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/registry/sources/tenant/index.ts) 中并没有挂入 `permissionMetaMap`。

这说明租户模块当前具备：

- 页面动作定义
- gateway action 绑定
- API 元数据

但还没有完成“permission-meta 化”。它仍然偏旧式，只能依赖动作注册和运行时菜单绑定，缺少统一前端声明层。

## 3. 注册中心层：RegistrySource 把声明接入统一链路

[registry.types.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/registry/contracts/registry.types.ts) 定义了当前注册中心的统一结构：

- `pages`
- `actions`
- `gatewayActionBindings`
- `apiMeta`
- `permissionMetaMap`

这意味着一个模块是否完整接入新链路，关键不在于有没有 `v-hasPerm`，而在于它的 `RegistrySource` 有没有把 `permissionMetaMap` 一起挂进去。

当前可以分成三类：

### 3.1 完整接入

- 角色：[role/index.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/registry/sources/role/index.ts)

角色模块同时提供：

- `pages`
- `actions`
- `gatewayActionBindings`
- `apiMeta`
- `permissionMetaMap`

这是当前最完整的新方案模块。

### 3.2 半接入

- 用户：[system/user/index.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/registry/sources/system/user/index.ts)

用户模块挂入了 `permissionMetaMap`，但 `actions / gatewayActionBindings / apiMeta` 仍为空，因此它更像“前端元数据已接入，但动作注册还不完整”。

### 3.3 旧链路延续

- 租户：[tenant/index.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/registry/sources/tenant/index.ts)

租户模块有 `actions / gatewayActionBindings / apiMeta`，但没有 `permissionMetaMap`，说明它主要沿用旧的“动作注册驱动”方式。

## 4. 动作解析层：page-action-registry 负责把前端声明翻译成可绑定动作

[page-action-registry.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/permissions/registry-route-action/page-action-registry.ts) 是前端“功能项动作真相源”的核心。

它会把每个 source 的：

- `actions`
- `gatewayActionBindings`
- `apiMeta`
- `permissionMetaMap`

整合成页面动作行。

关键行为有三点：

1. `perm` 在同一页面内必须唯一映射到同一个 `gatewayAction`
2. 若 `permissionMeta.apis` 已存在，则优先使用 `permission-meta` 里的 API，而不是只从 `gatewayActionBindings` 反推
3. 返回结果里会带上 `permissionMeta` 本体，供后续菜单绑定和快照上报继续复用

这一步的意义是：

- 把前端“按钮/页签语义”统一映射为“页面功能项”
- 把 `perm` 和实际 gateway 行为关联起来
- 为菜单管理生成候选功能项

## 5. 菜单管理如何赋予用户控制权限的能力

### 5.1 前端先声明“页面有哪些可绑定功能项”

这一层的来源有两种：

- 本地注册中心：`page-action-registry`
- 主应用已聚合快照：`binding-registry-snapshot`

其中 [binding-registry-snapshot.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/permissions/registry-route-action/binding-registry-snapshot.ts) 会把当前子应用的：

- `routes`
- `functions`
- `permissionMeta`

整体上报给主应用。

在 qiankun 生命周期里，[lifecycle.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/plugins/qiankun/lifecycle.ts) 会执行：

1. 从主应用同步 `userInfo`
2. 从主应用同步菜单缓存
3. 上报当前应用 `binding registry snapshot`
4. 回填主应用聚合后的 registry 状态

所以菜单管理页面看到的不是静态手写配置，而是“子应用前端主动上报的页面/功能声明”。

### 5.2 菜单管理再把前端功能项与后端菜单树功能节点对齐

[menu-type-binding.registry.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/menu/model/binding/menu-type-binding.registry.ts) 是菜单管理绑定面板的核心。

当菜单类型为 `FUNCTION` 时，它会：

1. 取到当前页面路由对应的前端功能项候选
2. 在当前页面节点下查找后端菜单树中的 FUNCTION 子节点
3. 按 `perm` 把前端功能项与后端 FUNCTION 节点做 JOIN
4. 输出三种状态：
   - `linked`
   - `frontend_only`
   - `backend_only`

这一步非常关键，因为它把“前端声明”与“后端菜单配置”接到了同一个视图里。

### 5.3 用户最终拥有权限，依赖的是后端返回的菜单树与 permissions

菜单管理完成配置后，后端给用户下发两类关键数据：

1. `userInfo.permissions`
2. 菜单树 `menuList`

其中：

- `v-hasPerm` 主要读取 `userInfo.permissions`
- `runtime-permission-resolver` 主要读取本地菜单缓存里的菜单树

也就是说，“菜单管理赋予用户控制权限的能力”本质上分成两部分：

1. 后端把页面/功能节点及其 `perm` 绑定好，进入用户菜单树
2. 后端把该用户持有的权限码下发到 `userInfo.permissions`

前者保证“这个功能在菜单树里存在且挂到了正确页面下”，后者保证“页面组件显隐时能快速命中权限码”。

## 6. 前端组件如何绑定到用户能用的功能

### 6.1 按钮/操作入口：`v-hasPerm`

[directive/permission/index.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/directive/permission/index.ts) 中的 `v-hasPerm` 是当前所有业务页面最常用的消费方式。

它的判定逻辑由 [permission-guard.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/utils/permission-guard.ts) 统一实现，规则是：

- owner/bypass 用户直接放行
- `userInfo.permissions` 为空时先放行，避免首屏未同步完成时误拦截
- 字符串权限：`includes`
- 数组权限：OR 逻辑，任一命中即可

当前典型使用：

- 角色页 [RoleListTable.vue](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/role/components/role/RoleListTable.vue)
- 用户页 [index.vue](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/user/index.vue)
- 租户页 [index.vue](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/tenant/index.vue)

### 6.2 页签权限：`PermTabs` + `PermTabPane`

角色编辑弹窗和角色组编辑弹窗已经升级为页签级权限控制：

- [RoleEditDialog.vue](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/role/components/role/RoleEditDialog.vue)
- [RoleGroupEditDialog.vue](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/role/components/roleGroup/RoleGroupEditDialog.vue)

`PermTabs` 会读取每个 `PermTabPane` 的 `perms`，并复用 `isPermsAllowed` 做过滤。除了显隐之外，它还处理：

- 激活页签失效时自动切到第一个可见 tab
- 全部不可见时显示统一空态

这条链路说明，角色模块已经从“单纯按钮显隐”发展到了“结构化 UI 权限控制”。

## 7. 后端生效链路：哪些信息真正影响最终结果

从当前实现看，后端真正影响前端权限生效的入口主要有三类：

### 7.1 `userInfo.permissions`

由主应用通过 qiankun props 注入后，在 [lifecycle.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/plugins/qiankun/lifecycle.ts) 中同步到本地 `Storage.userInfo`。

运行时：

- `v-hasPerm`
- `hasAuth`
- `PermTabs`

都会直接或间接依赖这份权限列表。

### 7.2 菜单树 `menuList`

qiankun 生命周期也会同步主应用下发的菜单缓存，随后 [runtime-permission-resolver.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/permissions/registry-route-action/runtime-permission-resolver.ts) 会用它来检查：

1. 页面是否已注册
2. 页面是否存在于菜单树
3. 指定 `perm` 是否存在于该页面的 FUNCTION 子节点
4. 该 FUNCTION 子节点是否带了 API

这条链路强调的是“菜单功能绑定是否真的落进后端菜单树”。

### 7.3 后端 FUNCTION 节点上的 API 列表

菜单绑定面板在构建功能项树时，会把前端声明的 API 和后端 FUNCTION 节点上的 API 再做一次比对，输出：

- 已绑定 API
- 仅前端声明的 API
- 仅后端存在的 API

这解释了为什么当前方案不只是“按钮有没有权限”，而是已经演进为“功能点及其 API 绑定是否完整对齐”的治理链路。

## 8. 当前仍在使用的链路

截至当前代码，仍在使用并应视为主路径的有：

### 8.1 `v-hasPerm`

这是当前最广泛使用的运行时权限显隐手段，仍然是主力方案。

### 8.2 `permission-meta + registry source + page-action-registry`

角色模块已完整使用，用户模块已部分使用，这条链路是当前“新方案”的主干。

### 8.3 `PermTabs / PermTabPane`

角色编辑相关场景已使用，属于页面结构级权限控制的当前推荐方式。

### 8.4 `binding-registry-snapshot + 菜单绑定面板`

这是菜单管理“看见前端功能项并进行绑定”的唯一成型方案，仍然在使用。

## 9. 已弃用或正在退出的链路

### 9.1 直接在视图里散写原始权限字符串

这条链路还大量存在，但从设计方向上已经不是推荐方案。

表现为：

- 用户页、租户页仍有很多 `v-hasPerm="'sys:xxx:yyy'"`
- 这些权限点没有统一 `permission-meta`
- 也没有完整进入 `registry source -> snapshot -> 菜单绑定` 的新链路

因此它更像“存量兼容写法”，不是后续新增能力应继续复制的方案。

### 9.2 仅靠 `actions + gatewayActionBindings + apiMeta`、不提供 `permissionMetaMap`

租户模块就是典型例子。

这条链路还能工作，但它缺少：

- `label / aliases / buttons / tabClicks` 等前端语义附件
- 基于 `permission-meta` 的统一索引能力
- 与页面组件声明的一致性收敛

所以它不是彻底失效，而是属于“老链路可运行，但应该逐步向 `permission-meta` 收口”的状态。

### 9.3 `confirmPerm` 指令

这是当前最明确可以标记为弃用的链路。

证据如下：

1. 指令实现仍在：[confirmPerm/index.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/directive/confirmPerm/index.ts)
2. 有单测：[confirmPerm.test.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/tenant/__tests__/confirmPerm.test.ts)
3. 但在业务代码中没有任何实际使用点
4. 在全局指令注册处 [directive/index.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/directive/index.ts) 也没有注册它

这说明 `confirmPerm` 当前状态是：

- 曾经为“基于 routePath + perm + 菜单树做运行时功能项校验”准备过
- 但没有进入现网业务主路径
- 现在已被 `v-hasPerm`、菜单绑定面板和 runtime resolver 的其它消费方式替代

### 9.4 `confirmPerm` 为什么被放弃

从实现方式看，`confirmPerm` 的问题在于：

- 它要求模板显式传 `{ routePath, perm }`
- 只在 `mounted` 时通过 DOM 删除元素
- 不参与统一的全局注册与常规组件消费心智
- 与 `v-hasPerm` 功能重叠，但接入成本更高
- 更依赖注册中心和菜单树完整性，适合工具链验证，不适合广泛铺在页面模板里

所以它更像一个过渡性实验方案，而不是最终稳定 API。

## 10. 建议如何理解“逐步退化”

如果后续方案需要“逐步退化”现有实现，建议按下面的层次理解：

### 10.1 可保留的稳定层

- `v-hasPerm`
- `permission-guard`
- `PermTabs / PermTabPane`

这些直接服务页面显隐，稳定且已被业务验证。

### 10.2 应继续收敛的中间层

- `permission-meta`
- `registry source.permissionMetaMap`
- `page-action-registry`
- `binding-registry-snapshot`

这部分是菜单绑定、前端声明标准化、跨应用上报的关键，应继续统一，不宜再新增平行方案。

### 10.3 可优先退出的旧链路

- 视图层散写原始 `perm` 字符串
- 只有 `tenant.actions` 这类动作定义、但没有 `permission-meta` 的半旧方案
- `confirmPerm`

其中 `confirmPerm` 可以视为已经退场，只需在文档和后续改造中明确“不再新增使用”。

## 11. 一句话结论

当前 `apex_dev` 的权限体系已经形成“`permission-meta/registry` 负责前端声明，菜单管理负责把声明绑定进后端菜单功能树，`v-hasPerm` / `PermTabs` 负责最终页面消费”的主链路；其中角色模块最完整，用户模块半迁移，租户模块偏旧链路，而 `confirmPerm` 已可以明确认定为弃用指令。
