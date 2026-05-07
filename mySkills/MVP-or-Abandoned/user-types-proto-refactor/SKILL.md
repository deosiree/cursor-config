---
name: user-types-proto-refactor
description: 将 apex_dev 的 src/types/user.d.ts 收敛为稳定“原型链(proto) + 派生(extends/Pick/Omit/Partial)”的类型结构。用于用户提到“类型收敛/原型链/extends/改一个字段全局生效/user.d.ts 统一管理”等场景，或需要减少类型重复、降低 gateway/view/store 对 API 类型耦合时。
---

# User Types Proto Refactor

## 目标与约束

- **目标**：把 `apex_dev/src/types/user.d.ts` 变成“稳定根类型 + proto 原型链 + 派生类型”的结构，字段修改尽量只改 proto 层即可影响所有派生类型。
- **稳定根**：默认以 `UserInfo` 作为业务稳定根类型名（对外类型名尽量不变）。
- **优先策略**：`interface extends` 优先于 `type`；仅在无法表达（复杂联合/映射）时保留 `type`。
- **禁止点**：proto 层只承载字段集合，不引入运行时逻辑，不改变现有字段语义。

## 触发条件（何时使用）

当用户提出以下任一诉求时，使用本技能：

- “`user.d.ts` 收敛所有类型 / 统一管理”
- “稳定类型进行 Pick/Omit/extends”
- “扩展类型用原型链结构（A extends B）”
- “改一个字段能影响全部类型”
- “gateway/view/store 不要直接依赖 API 响应类型”

## 工作流（按顺序执行）

### 1) 先确认稳定根与兼容策略

- **稳定根**：默认 `UserInfo`
- **兼容策略**：
  - 若要求“不破坏导出名”：只新增 proto + 调整内部 extends，不改导出名
  - 若允许同步修改引用：可以重命名/拆分类型，并在 `apex_dev/src/**` 修复引用

### 2) 建立 proto 原型链（最小 4 层）

在 `apex_dev/src/types/user.d.ts` 新增并导出（命名建议固定后缀 `*Proto`）：

- `UserIdentityProto`：`id/tenantId/username`
- `UserProfileProto`：`displayName/email/phone`
- `UserRoleProto`：`roleId/roleName/isOwner`
- `UserSecurityProto`：`status/lockedAt/lockReason/lastLoginAt`

然后将稳定根改为组合：

- `export interface UserInfo extends ...Proto { permissions: string[] }`

### 3) 统一派生类型写法（尽量 interface）

将 `user.d.ts` 内的派生类型按语义分层：

- **API 层（字段可缺省）**：`UserInfoApi`
  - 推荐：`extends Omit<UserInfo, "username" | "permissions">`，并将 `username/permissions` 改为可选
  - 对 `createdAt/updatedAt/description/lastLoginIp` 等 API 扩展字段，集中在 `UserInfoApi` 管理
- **列表行（view 展示）**：`UserListRow`
  - 推荐：`interface extends Pick<UserInfo, ...> { id: string; createdAt?: string; ... }`
- **表单（view 输入）**：`UserForm/UserDialogForm/...`
  - 推荐：仅声明差异字段（必填/额外字段），其余从 `UserInfo` 派生
- **payload（gateway 入参）**：`UserCreatePayload/UserUpdatePayload`
  - 推荐：`extends Pick<UserForm | UserInfo, ...>`，避免重复字段集合

### 4) gateway 输入类型“去 API 耦合”

如果 gateway 有类似 `GetUserResponse["user"] & {...}` 这类临时交叉类型：

- 在 `user.d.ts` 定义 `UserListItemLike`（或 `UserDetailLike`）
- 字段类型优先绑定到稳定类型或 API 类型字段：
  - 例如：`tenantId?: UserInfoApi["tenantId"]`
  - 对历史兼容：`id?: string | number`、`roleId?: string | number`
- gateway 侧入参替换为 `UserListItemLike`，避免直接依赖 API 响应结构

### 5) 验收与回归（证据优先）

最小验收：

- IDE 诊断：`user.d.ts` 及其引用处不新增 TS 报错
- 运行脚本（若存在）：
  - `npm -C apex_dev run type-check`
  - `npm -C apex_dev run lint`（或项目约定脚本）

如果仓库本身已有大量与本次无关的报错：

- 只要求本次修改不引入新的 user 类型相关报错（以报错路径/类型名为证据）

## 常见坑与处理

- **username 必填 vs 可选冲突**：`UserInfo.username` 可保持必填；`UserInfoApi.username` 可选；业务侧若拿 API 数据直接赋值，需要在映射处兜底 `?? ""`。
- **roleId string/number 混用**：稳定模型建议收敛为 `number`；但 payload/gateway 输入可短期兼容 `string | number`，统一在网关层转换。
- **interface 不能表达的场景**：遇到复杂联合/条件类型时，允许保留 `type`，但必须说明原因并尽量把字段集合仍绑定到 proto/`UserInfo`。

## 输出要求（交付时说明改动点）

交付说明包含三段式：

1) **方案**：稳定根是谁、proto 分层、派生策略  
2) **实现**：改动文件与关键类型清单（到类型名级别）  
3) **自检**：TS/ESLint/脚本输出或诊断结果

