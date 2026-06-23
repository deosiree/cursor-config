# 权限设计规则

## 适用场景

当已有盘点文档，需要为未命中 `v-hasPerm` 但真实调用 API 的操作设计权限点时使用。

## 决策框架

### 1. 权限粒度

| 场景 | 推荐粒度 | 示例 |
|------|---------|------|
| 整页只需一个入口守卫 | 1 个 page 级 perm | `sys:dashboard:view` |
| 页面内有多个独立操作（增删改查） | 按操作拆分 perm | `sys:tenant:add` / `sys:tenant:edit` / `sys:tenant:delete` |
| 个人信息页 | 1 个 page 级 perm 或不建 perm | `sys:profile:view` |
| 安全配置（Tab 切换的独立功能块） | 按 Tab 拆分 perm | `sys:securityConfig:edit` / `sys:sessionConfig:edit` |

**决策门禁**：权限粒度涉及产品判断，不允许 agent 自行裁量。必须在以下节点提问：
- 页面级 vs 操作级的选择
- 跨模块 API 的归属

### 2. 豁免规则

以下接口**不建功能项 perm**：

| 条件 | 示例 |
|------|------|
| 走 `direct` 前缀且为 `no-auth` | `loginSetting` |
| 仅路由跳转，纯前端 | 菜单展开/折叠 |
| 前端状态恢复 | `sessionStorage` 恢复 |

### 3. Hidden Page 收敛

| 类型 | page name | route_path | 子 function 示例 |
|------|-----------|------------|-----------------|
| 全局状态 | 状态管理 | `/Apex/_state` | `sys:state:loginSetting` |
| 非导航页 | 个人中心 | `/Apex/profile` | `sys:profile:view` |

`is_visible: false`，不在菜单中显示，仅用于登记 perm 与 API。

### 4. 跨模块 API 归属

> 原则：perm 挂在**触发交互的页面**所在模块，不挂在 API 所属模块。

| 交互页面 | 跨模块 API | 应建 perm |
|---------|-----------|-----------|
| 租户管理 | `devmgr/device/activate` | `sys:tenant:bindDevice` |
| 租户管理 | `dbres/resource/bind` | `sys:tenant:bindResource` |

### 5. 命名约定

格式：`<模块缩写>:<资源>:<操作>`

| 操作 | 缩写 |
|------|------|
| 查看/查询 | `query` |
| 新增 | `add` |
| 编辑 | `edit` |
| 删除 | `delete` |
| 导入 | `import` |
| 导出 | `export` |
| 查看（页面入口） | `view` |

### 6. 页面门控与空态 UX

设计 page 级 perm 时，在方案中注明是否作为 **pageGate**：

| pageGate perm | 无 perm 时 UI | 有 perm 无操作 perm 时 |
|---------------|--------------|------------------------|
| `sys:dashboard:view` | 整页 `PageNoPermission` | 仅藏无权限的操作按钮 |
| `sys:tenant:query` | 整页 `PageNoPermission` | 仅藏无权限的操作按钮 |

**禁止**：仅用 `fetchData` 清空列表让表格显示「暂无数据」。详见 `[[page-no-permission-pattern.md]]`。

## 输出格式

```markdown
## 权限设计方案

### 模块：<模块名>

| 权限标识 | 权限名称 | 粒度 | 管控 API | 契约来源 |
|---------|---------|------|---------|---------|
| sys:dashboard:view | 查看首页 | page | POST /seccenter/v2/dashboard/query | seccenter.swagger.json |

### 豁免清单

| 接口 | 豁免原因 |
|------|---------|
| /direct/seccenter/v2/auth/loginSetting | direct + no-auth |

### Hidden Page

| page | route_path | 子 function |
|------|------------|------------|
| 状态管理 | /Apex/_state | sys:state:loginSetting |
```
