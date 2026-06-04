# 菜单 YAML 字段规范

## Page 节点

| 字段 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `name` | 是 | string | 中文名称 |
| `route_path` | 是 | string | 前端路由路径（如 `/Apex/dashboard`） |
| `is_visible` | 否 | boolean | 默认 `true`；`false` 为 hidden page |
| `id` | **是** | number | page 节点 ID（通过 API 查询/创建获取后回填） |
| `parent_id` | **是** | number | 父节点 ID（顶层 page 的 parent_id 为根节点 ID） |
| `children` | 否 | array | 子节点（page 或 function） |

## Function 节点

| 字段 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `name` | 是 | string | 功能名称（如"查看首页"） |
| `code` | 是 | string | 权限标识（如 `sys:dashboard:view`） |
| `type` | 是 | string | 固定值 `function` |
| `id` | **是** | number | 功能项 ID（必须通过 API 查询/创建获取后回填） |
| `parent_id` | **是** | number | 所属 page 节点的 ID（必须回填） |
| `apis` | 否 | array | 该功能项管控的 API URL 列表 |

## ID 回填规则（强制）

> **这是 `[100000]未知错误` 的根因，严禁跳过。**

1. 生成补丁 YAML 前，每个新增 function 必须获取真实 ID
2. 获取方式：
   - 查询已有 function：通过本地 API 查询是否已存在同 `code` 的 function
   - 创建新 function：若不存在，通过创建 API 新建并获取返回的 ID
3. 将获取到的 ID 回填到补丁 YAML 的 `id` 字段
4. **严禁**提交 `id: 0` 或无 `id` 字段的 function 节点

## 补丁 YAML 结构（增量模式）

```yaml
patch_children_add:
  - name: 状态管理
    route_path: /Apex/_state
    is_visible: false
    id: 10001
    parent_id: 1
    children:
      - name: 登录配置
        code: sys:state:loginSetting
        type: function
        id: 12345
        parent_id: 10001
        apis:
          - /direct/seccenter/v2/auth/loginSetting
  - name: 个人中心
    route_path: /Apex/profile
    is_visible: false
    id: 10002
    parent_id: 1
    children:
      - name: 查看个人中心
        code: sys:profile:view
        type: function
        id: 12346
        parent_id: 10002
        apis:
          - /seccenter/v2/user/detail
          - /seccenter/v2/user/updatePassword
```

## 与已有菜单树合并规则

| 场景 | 处理 |
|------|------|
| 补丁 page 在已有树中不存在 | 追加到对应父节点 |
| 补丁 page 已存在 | 只追加其下新增的 function，不重复创建 page |
| 补丁 function 同 `code` 已存在 | 跳过（不重复创建） |
| 补丁 function 同 `code` 不存在 | 追加到该 page 的 children |

## parent_id 回填规则（强制）

> **这是「导入成功但菜单不显示」的根因，严禁跳过。**

每个节点（page 和 function）必须设置 `parent_id` 为其父节点的真实 `id`：

1. **顶层 page**：`parent_id` 为整个菜单树的根节点 ID
2. **子 page**：`parent_id` 为父 page 的 `id`
3. **function**：`parent_id` 为所属 page 的 `id`

回填步骤：

1. 先获取父节点的真实 `id`（通过 API 查询或从已有菜单树中提取）
2. 将父节点 `id` 写入子节点的 `parent_id` 字段
3. **严禁**提交 `parent_id: null` 或无 `parent_id` 字段的节点

> **与 `id: 0` 的区别**：`id: 0` 会导致后端报错（`[100000]未知错误`），但 `parent_id: null` **不报错**——导入成功，节点写入数据库但失去父子关联，菜单中静默不显示。排查时需检查每个节点的 `parent_id` 是否为有效值。

## API URL 格式

- 使用业务路径（去掉 `direct`/`forward`/`{direct|forward}` 前缀）
- 若有多个 API，全部列出
- 豁免接口（direct/no-auth）可选择性登记
