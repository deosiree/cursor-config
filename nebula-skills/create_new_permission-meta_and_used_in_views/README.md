# create_new_permission-meta_and_used_in_views

这份说明是给人看的参考文档。它总结了当前 `apex_dev` 里“角色管理”已经落地的权限声明与消费方式，方便后续把同样模式复制到 `tenant / user / roleGroup` 等模块。

## 这套实现的核心分层

当前仓库里，前端权限不是只靠 `v-hasPerm` 一个指令散落使用，而是分成两层：

1. 声明层：`permission-meta`
   - 典型文件：[role.permission-meta.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/permissions/permission-meta/role.permission-meta.ts)
   - 负责统一声明：
     - 权限码常量
     - 权限文案 `label`
     - 关联页面 `route/component`
     - 关联接口 `apis`
     - 附加消费信息 `buttons/pageActions/tabClicks/gatewayActions/aliases`
2. 消费层：业务视图 / registry / snapshot
   - 视图层直接消费 `ROLE_PERMS`
   - registry 会从 `permissionMetaMap` 里拿到更丰富的前端元数据
   - host/菜单绑定面板也会继续消费这些元数据

换句话说：

- `v-hasPerm` / `PermTabPane` 负责“页面上显不显示”
- `permission-meta` 负责“这个权限点在前端叫什么、属于哪个页面、打到哪些 API、还能被哪些链路复用”

## 角色管理当前是怎么做的

### 1. 权限常量和元数据定义

角色模块把权限码和元数据集中在：

- [role.permission-meta.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/permissions/permission-meta/role.permission-meta.ts)

这里定义了：

- `ROLE_PERMS.ADD`
- `ROLE_PERMS.EDIT`
- `ROLE_PERMS.SUBSCRIBE`
- `ROLE_PERMS.DELETE`
- `ROLE_PERMS.TAB_BASIC`
- `ROLE_PERMS.TAB_MENU`
- `ROLE_PERMS.TAB_DEVICE`

以及 `rolePermissionMetaMap`，例如：

- `新增角色`
  - `perm = sys:role:add`
  - `label = 新增角色`
  - `route = /system/role`
  - `component = system/role/index`
  - `apis = /seccenter/v2/role/create`
  - `gatewayActions = RoleGateway.create`
  - `buttons/pageActions = role.add`
- `菜单权限` Tab
  - `perm = sys:role:tab:menu`
  - `label = 点击菜单权限`
  - `tabClicks = role.edit.menu`

可以看到，按钮和 Tab 都先被声明成同一套 `PermissionMeta`，只是附件字段不同。

### 2. 按钮怎么消费：用 `v-hasPerm`

按钮、链接、行操作、工具栏入口统一使用：

- [RoleListTable.vue](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/role/components/role/RoleListTable.vue)
- [permission/index.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/directive/permission/index.ts)
- [permission-guard.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/utils/permission-guard.ts)

典型写法：

```vue
<el-button v-hasPerm="ROLE_PERMS.ADD">新增角色</el-button>
<el-button v-hasPerm="[ROLE_PERMS.EDIT, ROLE_PERMS.EDIT_BUTTON]">编辑</el-button>
```

适用场景：

- 单个按钮
- 表格行操作
- 工具栏入口
- 一小块“有没有权限就显示/隐藏”的控件

当前行为细节：

- 支持字符串或字符串数组
- 数组是 OR 逻辑，命中一个就通过
- 如果开启 permission bypass，直接放行
- 在 `apex_dev` 里，`permissions` 还没加载出来时不会拦截

所以它更适合“控件级”权限判断。

## 什么时候用 `PermTabPane`

整页签权限使用：

- [PermTabPane.vue](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/components/PermTabs/PermTabPane.vue)
- [PermTabs.vue](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/components/PermTabs/PermTabs.vue)
- [RoleEditDialog.vue](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/role/components/role/RoleEditDialog.vue)
- [RoleGroupEditDialog.vue](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/role/components/roleGroup/RoleGroupEditDialog.vue)

典型写法：

```vue
<PermTabs v-model="activeTab">
  <PermTabPane
    name="permission"
    label="菜单权限"
    :perms="[ROLE_PERMS.EDIT, ROLE_PERMS.TAB_MENU]"
  >
    <PermissionTab />
  </PermTabPane>
</PermTabs>
```

适用场景：

- 弹窗内的多个页签
- 整个 Tab 页内容都应被权限控制
- 需要“自动切到第一个有权限的 Tab”
- 需要“全部没权限时显示统一空态”

不要用在：

- 单个按钮
- 只是页签标题上有个小按钮要控制
- 不在 `PermTabs` 容器内的普通内容块

原因是 `PermTabs` 不只是隐藏 Tab，它还做了两件事：

1. 自动过滤不可见页签
2. 当前激活页签没有权限时，自动切换到第一个可见页签

这在测试里有明确覆盖：

- [RoleEditDialog.test.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/role/__tests__/RoleEditDialog.test.ts)

## 权限元数据在业务层之外还会被谁消费

### 1. `page-action-registry`

- [page-action-registry.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/permissions/registry-route-action/page-action-registry.ts)

这里会把 registry source 里的：

- `actions`
- `gatewayActionBindings`
- `apiMeta`
- `permissionMetaMap`

合并成“页面动作绑定行”。

关键点：

- 如果 `permissionMeta.apis` 已声明，优先用它作为前端展示与绑定来源
- `permissionMeta.label` 会覆盖动作名称
- `permissionMeta` 本身会继续挂在绑定结果上

也就是说，前端声明过的权限元数据不仅服务显隐，还会进入“功能项绑定”和“注册中心快照”。

### 2. `binding-registry-snapshot`

- [binding-registry-snapshot.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/permissions/registry-route-action/binding-registry-snapshot.ts)

这里会把每个 source 的 `permissionMetaMap` 汇总进快照里的 `permissionMeta` 字段，供：

- 主应用聚合
- 菜单绑定面板
- 跨应用展示

### 3. 菜单管理的功能项绑定

- [menu-type-binding.registry.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/menu/model/binding/menu-type-binding.registry.ts)

这里会优先消费快照里的 `permissionMeta`，把：

- `perm`
- `label`
- `route`
- `component`
- `apis`
- `gatewayActions`

转换为功能项候选行和 API 子行。

所以如果某个模块已经在 registry 链路里，补 `permissionMetaMap` 往往不只是“可读性更好”，而是直接影响菜单管理里能不能正确展示和对齐前端功能项。

## 新增权限点时的推荐实现顺序

以“我想在 `apex_dev` 的 `tenant` 模块里新增 `新增租户` 按钮权限、`角色分组` Tab 权限”为例，建议按这个顺序做：

1. 找到模块的权限常量文件；如果没有，再判断是否需要新增 `src/permissions/permission-meta/<module>.permission-meta.ts`
2. 先定义权限码常量
3. 再定义 `PermissionMeta`：
   - `perm`
   - `label`
   - `route/component`
   - `apis`
   - 必要的 `buttons/pageActions/tabClicks/gatewayActions`
4. 业务视图改成只消费常量，不直接散写 `"sys:xxx:yyy"`
5. 如果该模块接入 registry source，把 `permissionMetaMap` 接到 `src/registry/sources/<module>/index.ts`
6. 如果该权限属于功能项绑定的一部分，再检查 `<module>.actions.ts` / `<module>.gateway-bindings.ts` / `<module>.api-meta.ts`
7. 跑最接近的测试

## 一个很实用的选择准则

新增权限点时，可以先问自己一句：

“我是在控制一个控件，还是在控制一个页签容器单元？”

如果答案是：

- “一个控件”
  - 用 `v-hasPerm`
- “一个页签单元，且需要自动切页签/空态兜底”
  - 用 `PermTabPane`

## `microfb` 怎么看

目前 `microfb` 仓库里我确认到的是：

- 有 `v-hasPerm` 指令
  - [microfb permission directive](/f:/Documents/Repertory/Sieyuan/nebula/microfb/src/directives/permission/index.ts)
- 但没有看到与 `apex_dev` 同级的 `permission-meta` / `PermTabs` / registry source 体系

所以如果你以后让 skill 处理 `microfb`：

- 可以先复用现有 `v-hasPerm`
- 但不能默认假设它已经具备 `apex_dev` 的整套权限元数据基础设施
- 若需求明确要求“也要接入权限元数据声明”，就需要先补基础设施，不能只照抄角色管理的文件路径

## 对应的关键参考文件

- [role.permission-meta.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/permissions/permission-meta/role.permission-meta.ts)
- [RoleListTable.vue](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/role/components/role/RoleListTable.vue)
- [RoleEditDialog.vue](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/role/components/role/RoleEditDialog.vue)
- [RoleGroupEditDialog.vue](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/role/components/roleGroup/RoleGroupEditDialog.vue)
- [PermTabs.vue](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/components/PermTabs/PermTabs.vue)
- [PermTabPane.vue](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/components/PermTabs/PermTabPane.vue)
- [permission/index.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/directive/permission/index.ts)
- [permission-guard.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/utils/permission-guard.ts)
- [page-action-registry.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/permissions/registry-route-action/page-action-registry.ts)
- [binding-registry-snapshot.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/permissions/registry-route-action/binding-registry-snapshot.ts)
- [menu-type-binding.registry.ts](/f:/Documents/Repertory/Sieyuan/nebula/apex_dev/src/views/system/menu/model/binding/menu-type-binding.registry.ts)

## 使用示例

```prompt
@.cursor/nebula-skills/create_new_permission-meta_and_used_in_views/SKILL.md  
root: apex_dev
module: user
权限点：按钮：“搜索”、“新增”、“删除”、“停用用户”和“启用用户”、“编辑”、“告警订阅”、“重置密码”、“删除”；网关方法：“显示用户列表”、“查询角色列表”
```

```prompt
@.cursor/nebula-skills/create_new_permission-meta_and_used_in_views/SKILL.md  
root: apex_dev
module: 除了user和role的其他模块，有使用了has-perm的其他地方
权限点：参考has-perm是怎么设置的，自行模拟
```

```prompt
@.cursor/nebula-skills/create_new_permission-meta_and_used_in_views/SKILL.md  
root: apex_dev
module: 首页、设备管理、审计日志、安全配置、告警配置
权限点：考虑把所有的按钮、el-card用权限指令包起来，不用一次到位的全部设计完，每个模块设计两三个即可
```
