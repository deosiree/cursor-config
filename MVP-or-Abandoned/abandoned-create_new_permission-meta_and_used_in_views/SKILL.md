---
name: create-new-permission-meta-and-used-in-views
description: Use when需要在 nebula 的 apex_dev 或 microfb 中新增前端权限点声明，并把权限元数据接入按钮、Tab 页、registry source、page actions 或菜单绑定链路；尤其适用于用户会提供根目录、模块名，以及“新增租户按钮”“角色分组 Tab 页”这类具体权限落点的场景。
---

# Overview

根据用户给出的 `root/module/permission points`，直接在仓库里补齐前端权限声明，并把视图层消费方式接上现有实现。优先复用 `apex_dev` 里角色管理已经跑通的模式，不要重新发明权限模型。

# Inputs

要求用户至少提供：

1. `root`
   例：`apex_dev`、`apex`、`microfb`
2. `module`
   例：`role`、`tenant`、`user`
3. `permission points`
   例：
   - `新增租户` 按钮
   - `角色分组` Tab 页
   - `删除用户` 行操作

若用户只写 `apex`，默认解析为仓库根下的 `apex_dev`。若用户写 `microfb`，先检查该模块是否已有与 `permission-meta`、registry、`PermTabs` 等价的基础设施；没有就只接现有能力，不擅自把 `apex_dev` 的整套实现硬搬过去。

# Working Rules

## 1. 先识别这是“按钮权限”还是“Tab 权限”

使用下面的判断：

- `v-hasPerm`
  - 用在按钮、链接、行操作、工具栏入口、单个操作控件
  - 目标是“无权限就不显示这个节点”
  - 例：`新增角色`、`编辑`、`删除`、`告警订阅`
- `PermTabPane`
  - 用在 `PermTabs` 里的整页签内容
  - 目标是“无权限时整个 Tab 不可见，并自动切换到第一个可见 Tab；如果全部不可见则显示空态占位”
  - 例：`基础信息`、`菜单权限`、`关联设备`

不要把单个按钮包进 `PermTabPane`。也不要在 `PermTabs` 场景里继续直接写普通 `ElTabPane` 再套 `v-hasPerm`，否则会破坏当前“自动切换活动页签”的行为。

## 2. 优先复用角色管理现状

先读这些文件，确认当前模块是否应沿用角色管理模式：

- `apex_dev/src/permissions/permission-meta/role.permission-meta.ts`
- `apex_dev/src/views/system/role/components/role/RoleListTable.vue`
- `apex_dev/src/views/system/role/components/role/RoleEditDialog.vue`
- `apex_dev/src/views/system/role/components/roleGroup/RoleGroupEditDialog.vue`
- `apex_dev/src/components/PermTabs/PermTabs.vue`
- `apex_dev/src/components/PermTabs/PermTabPane.vue`
- `apex_dev/src/utils/permission-guard.ts`
- `apex_dev/src/permissions/registry-route-action/page-action-registry.ts`
- `apex_dev/src/permissions/registry-route-action/binding-registry-snapshot.ts`

如果当前模块已经有自己的 permission 常量文件、registry source、actions、gateway bindings，沿用同目录风格补齐；不要把角色模块命名硬抄到别的模块。

## 3. 新增权限元数据时的最小实现面

若目标在 `apex_dev` 且模块有 registry source，通常至少需要检查这几层：

1. 权限常量与元数据
   - 目标文件通常是 `src/permissions/permission-meta/<module>.permission-meta.ts`
   - 补：
     - `XXX_PERMS`
     - 可选 OR 兼容数组
     - `<module>PermissionMetaMap`
     - `get<Module>PermissionMeta`
2. 视图层消费
   - 按钮/操作入口改成 `v-hasPerm="XXX_PERMS.XXX"`
   - Tab 改成 `PermTabPane` + `:perms="[...]"`
3. registry source
   - 目标文件通常是 `src/registry/sources/<module>/index.ts`
   - 确认 `permissionMetaMap` 已挂到 source
4. page actions / gateway action 绑定
   - 若该权限对应功能项绑定、菜单配置、快照上报或 runtime resolver，需要检查：
     - `src/registry/sources/<module>/<module>.actions.ts`
     - `src/registry/sources/<module>/<module>.gateway-bindings.ts`
     - `src/registry/sources/<module>/<module>.api-meta.ts`

如果只是单纯按钮显隐，而该模块没有 registry source，不要为了“对齐角色管理”强行补一整套注册中心。

## 3.5 后端未落库权限码的前端模拟（Human 介入确认闸门）

当后端尚未存储/下发权限码时，允许前端先“模拟创建”权限码（perm），但必须严格走以下流程：先模拟并输出候选，再让人类确认 perm 与 UI 落点/API 对应关系，确认后才能进入 permission-meta/视图接入与 registry 链路落地。

### 目标

- 生成可读、可追溯的 perm 候选，避免把“看起来像”的字符串直接写进元数据/按钮权限。
- 让“perm <-> API <-> UI 落点”关系在进入实现前就被人工校准。

### 模拟步骤

1. 识别当前 `permission point` 属于哪个 UI 落点：
   - 按钮/操作控件：对应 `v-hasPerm`
   - Tab 页：对应 `PermTabPane`
2. 从该落点出发，定位实际会触发的 API 调用（优先找网关/请求入口函数与其请求 URL / method）：
   - 例如用户列表：`UserGateway.getPage` -> `UserApi.list` -> `/seccenter/v2/user/list (post)`
   - 告警订阅：告警订阅弹窗初始化会先拉告警树：`AlarmAPI.list` -> （system-alarm gateway 的 list 接口）
   - 重置密码：`UserGateway.resetPassword` -> `UserApi.resetPassword` -> `/seccenter/v2/user/resetPassword (post)`
3. 参考“相关 API 名称”生成 perm 候选，统一使用前缀与结构：
   - 格式建议：`sys:${resource}:${action}`
   - resource：通常来自 API 域名（如 `user` / `alarm`）
   - action：通常来自 API 动作语义（如 `list` / `reset`）
4. 输出候选 perm 清单给人类确认，并等待明确答复后再继续后续步骤（permission-meta/视图接入/registry）：
   - 必须包含：`perm候选` + `UI落点` + `命中的API（函数名/URL+method）`

### 本次示例（供参考，不等同于强制映射）

- `sys:user:list`：对应用户管理页的“搜索/查询/列表刷新”落点；命中 `UserApi.list`
- `sys:alarm:list`：对应“告警订阅”落点；命中 `AlarmAPI.list`（告警项树初始化所需接口）
- `sys:user:reset`：对应用户列表行的“重置密码”落点；命中 `UserApi.resetPassword`

### 禁区

- 未完成“Human 介入确认”前，不要把模拟 perm 直接写入 permission 常量、`PermissionMeta`、或 `v-hasPerm`。
- 不要用“猜测的资源/动作”替代 API 追溯；必须能追到对应的 API 名称或 URL。

## 4. 元数据字段怎么填

在 `PermissionMeta` 中优先补这些稳定字段：

- `perm`
- `label`
- `route`
- `component`
- `apis`

按需补这些附件字段：

- `gatewayActions`
- `buttons`
- `pageActions`
- `tabClicks`
- `aliases`

字段含义遵循现有实现：

- `route/component/apis`：提供给 registry snapshot、绑定面板、跨应用上报使用
- `buttons/pageActions/tabClicks`：作为前端附着信息，被 `permission-meta-index` 的 `byAttachment` 收录
- `gatewayActions`：帮助 page-action-registry 和绑定面板推导功能项绑定

不要发明新的附件字段，除非现有字段确实无法表达，并且调用链里会真实消费这个字段。

## 5. 视图层怎么消费

### 按钮或操作入口

统一消费 permission 常量，不直接在业务代码里散写原始字符串。

示例：

```vue
<el-button
  v-hasPerm="ROLE_PERMS.ADD"
  type="primary"
  @click="emit('add')"
>
  新增角色
</el-button>
```

### OR 兼容权限

当后端历史权限码存在别名或新旧并存时，使用数组交给 `v-hasPerm`，当前实现是“命中任一即放行”。

```vue
<el-button v-hasPerm="[ROLE_PERMS.EDIT, ROLE_PERMS.EDIT_BUTTON]">
  编辑
</el-button>
```

### Tab 页权限

在 `PermTabs` 内声明 `PermTabPane`，让 `PermTabs` 根据 `permission-guard` 自动筛可见页签。

```vue
<PermTabPane
  name="permission"
  label="菜单权限"
  :perms="[ROLE_PERMS.EDIT, ROLE_PERMS.TAB_MENU]"
>
  <PermissionTab />
</PermTabPane>
```

## 6. 自动实现时的操作顺序

1. 根据 `root/module` 找到该模块现有目录和命名风格
2. 找该模块是否已有：
   - permission meta 文件
   - registry source
   - page actions
   - gateway bindings
3. 为每个 `permission point` 先决定类型：
   - `button`
   - `row-action`
   - `tab`
4. 先补常量与元数据，再接视图层
5. 如果该模块接入了 registry 链路，再补 source/actions/bindings
6. 最后补最接近当前行为的测试

## 7. 测试优先检查

优先补或运行这些类型的测试：

- 指令/守卫测试
  - `src/directive/__tests__/hasPerm.test.ts`
- Tab 权限测试
  - 参考 `src/views/system/role/__tests__/RoleEditDialog.test.ts`
- permission meta 索引测试
  - `src/permissions/permission-meta/__tests__/permission-meta-index.test.ts`
- 绑定注册中心测试
  - `src/views/system/menu/__tests__/menu-type-binding.registry.test.ts`

若仓库里暂无对应测试位点，至少验证：

1. 无权限时按钮会消失
2. Tab 只显示允许访问的页签
3. 若接了 registry，新增 perm 能出现在快照或绑定候选里

# Output

完成后应明确给出：

1. 改了哪些代码
2. 每个权限点使用的是 `v-hasPerm` 还是 `PermTabPane`
3. 是否同步接入了 `permissionMetaMap` / registry / actions / bindings
4. 跑了哪些验证，哪些没跑

# Boundaries

- 以当前仓库实现为准，不用抽象成通用前端权限框架
- 优先保持 `apex_dev` 角色管理风格一致
- 对 `microfb` 只在已有能力上增量实现；若缺少 `PermTabs` / permission-meta 体系，要先说明缺口再决定是否扩展
